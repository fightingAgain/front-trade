 /**
*  Xiangxiaoxia 
*  2019-2-21
*  评标室的系管理查询
*  方法列表及功能描述
*   1、initDataTab()   查询详情，评标室的分页列表
*/

var listUrl = config.tenderHost + '/BiddingRoomManagementController/findBiddingRoomPageList.do'; //查询评标室列表接口
var delUrl = config.tenderHost + '/BiddingRoomManagementController/saveOrUpdateBiddingRoom.do'; //删除接口

var pageEdit = "Bidding/BidRoomManage/roomManage/roomEdit.html"; //编辑页面
var pageView = "Bidding/BidRoomManage/roomManage/roomView.html"; //查看详情页面

$(function() {
	//加载列表
	initDataTab();

	//查询
	$("#btnSearch").click(function() {
		$("#roomManageList").bootstrapTable('destroy');
		initDataTab();
	});
	// 类型查询
	$("#biddingRoomType").change(function() {
		$("#roomManageList").bootstrapTable('destroy');
		initDataTab();
	});

	//添加
	$("#btnAdd").click(function() {
		openEdit("");
	});
	//编辑
	$("#roomManageList").on("click", ".btnEdit", function() {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看详情
	$("#roomManageList").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openView(index);
	});
	//删除
	$("#roomManageList").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#roomManageList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除评标室?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: delUrl,
				type: "post",
				data: {
					id: rowData.id,
					isDel:1,
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert("删除成功");
					$("#roomManageList").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	})
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index) {
	var width = top.$(window).width() * 0.7;
	var height = top.$(window).height() * 0.6;
	var rowData = "",
		url = pageEdit,
		title = "新增评标室";
	if(index != "" && index != undefined) {
		rowData = $('#roomManageList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		url += "?id=" + rowData.id;
		title = "编辑评标室";
	}

	layer.open({
		type: 2,
		title: title,
		area: ['1000px', '650px'],
		resize: false,
		content: url,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	var width = top.$(window).width() * 0.6;
	var height = top.$(window).height() * 0.6;
	var rowData = $('#roomManageList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看评标室",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?id=" + rowData[index].id,
		success: function(layero, index) {

		}
	});
}

// 查询参数
function getQueryParams(params) {
	var Data = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		biddingRoomName: $("#biddingRoomName").val(), // 评标室名称
		biddingRoomType: $("#biddingRoomType").val(), // 类型	 0为自有场地，1为外部场地
		isDel:0  //删除标识  0为正常，1为删除
	};
	return Data;
};
//表格初始化
function initDataTab() {
	$("#roomManageList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		height:tableHeight,
		onCheck: function(row) {
			id = row.id;
		},
		columns: [
			[{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function(value, row, index) {
					var pageSize = $('#roomManageList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#roomManageList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'biddingRoomName',
				title: '评标室名称',
				align: 'left',
				cellStyle:{
					css:widthName
				}
			}, {
				field: 'biddingRoomType',
				title: '类型',
				align: 'center',
				cellStyle:{
					css:widthState
				},
				formatter: function(value, row, index) { //0为自有场地，1为外部场地
					if(value == 0) {
						return '<span>自有场地</span>'
					} else if(value == 1) {
						return '<span>外部场地</span>'
					}
				}
			}, {
				field: 'chargePerson',
				title: '负责人',
				align: 'center',
				cellStyle:{
					css:widthName
				}
			}, {
				field: 'chargeTel',
				title: '负责人联系电话',
				align: 'center',
				cellStyle:{
					css:widthCode
				}
			}, {
				field: 'isOpen',
				title: '是否开放',
				align: 'center',
				cellStyle:{
					css:widthState
				},
				formatter: function(value, row, index) {
					if(value == 0) {
						return '<span>否</span>'
					} else if(value == 1) {
						return '<span>是</span>'
					}
				}
			}, {
				field: 'status',
				title: '操作',
				align: 'left',
				width: '230px',
				formatter: function(value, row, index) {
					var str = "";
					var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
					var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					str += strSee + strEdit + strDel;

					return str;

				}
			}]
		]
	});
};