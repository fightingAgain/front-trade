/**
 *  Xiangxiaoxia 
 *  2019-2-25
 *  代理机构--招标文件列表页面
 *  方法列表及功能描述
 *   1、initTable()   分页查询
 */

var urlBidFileList = config.tenderHost + '/DocClarifyServerController/findBidServiceDocClarifyPageList.do'; //招标文件--标段查询分页接口

var pageView = 'Bidding/BidFile/BidFileManage/model/BidFileView.html';
var pageRemarkView ='Bidding/BidFile/BidFileManage/model/BidRemarkView.html';

//表格初始化
$(function() {
	initTable();

	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();	
	});
	
	//查看
	$("#table").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openView(index);
	});
	
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val()
	}
};

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看招标文件",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?source=2" + "&id=" + rowData.id, //标段主键id
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}

/*
 * 打开查看补充说明窗口
 * index是当前所要查看的索引值，
 */
function openRemark(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看补充说明",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageRemarkView + "?id=" + rowData.bidSectionId + "&bidFileId=" + rowData.id + "&interiorBidSectionCode=" + rowData.interiorBidSectionCode+ "&bidSectionName=" + rowData.bidSectionName+ "&docName=" + rowData.docName,
		success: function(layero, index) {}
	});
}


function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlBidFileList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
			cellStyle:{
				css: widthCode
			}
		}, {
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
			cellStyle:{
				css: widthName
			}
		},{
			field: 'tenderProjectType',
			title: '项目类型',
			align: 'center',
			width: '120',
			cellStyle:{
				css:{'white-space':'nowrap'}
			},
			formatter: function(value, row, index) {
				return getTenderType(value);
			}
		},
		{
			field: 'createTime', //招标文件主表的创建时间
			title: '创建时间',
			align: 'center',
			cellStyle:{
				css:widthDate
			}
		}, {
			field: 'bidDocClarifyState',
			title: '审核状态',
			align: 'center',
			cellStyle:{
				css: widthState
			},
			formatter: function(value, row, index) {
				//0为未审核，1为审核中，2为审核通过，3为审核不通过
				if(value == 0) {
					return "<span style='color:red;'>未提交</span>";
				} else if(value == 1) {
					return "<span style='color:red;'>审核中</span>";
				} else if(value == 2) {
					return "<span style='color:green;'>审核通过</span>";
				} else if(value == 3) {
					return "<span style='color:red;'>审核不通过</span>";
				} else if(value == 4){
					return "<span style='color:red;'>已撤回</span>";
				}
			}
		},{
			field: '',
			title: '操作',
			align: 'center',
			width: '120px',
			cellStyle:{
				css:{'white-space':'nowrap'}
			},
			formatter: function(value, row, index) {
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				return strSee;
			}
		}],
	})
}


