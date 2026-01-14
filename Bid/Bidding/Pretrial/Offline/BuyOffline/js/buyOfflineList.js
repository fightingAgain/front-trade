/**
*  2019-5-23 by hwf 
*  购标情况列表
*  方法列表及功能描述
*/

var pageUrl = config.tenderHost + '/SupplierSignController/findPretrialPageList.do';  //列表接口


var viewHtml = 'Bidding/Pretrial/Offline/BuyOffline/model/buyView.html';//查看
var pageEdit = 'Bidding/Pretrial/Offline/BuyOffline/model/buyEdit.html';  //编辑
var bidSectionPage = 'Bidding/Pretrial/Offline/BuyOffline/model/bidSectionList.html';  //标段列表
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
//		openView(index);
		openEdit(index);
	});
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	
	//添加
	$("#btnAdd").click(function(){
		openEdit();
	});
	
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = "",
		url = pageEdit,
		title = "";
	if(index != "" && index != undefined){
		rowData = $('#tableList').bootstrapTable('getData')[index];
		url = pageEdit;
		title = "购标人信息";
	} else {
		url = bidSectionPage;
		title = "选择标段"
	}
	top.layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	top.layer.open({
		type: 2,
		title: '查看购标情况',
		area: ['1000px', '600px'],
		content: viewHtml+'?id='+rowData.bidSectionId,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var interiorBidSectionCode = parent.layer.getChildFrame('#interiorBidSectionCode', index);
			var bidSectionName = parent.layer.getChildFrame('#bidSectionName', index);
			interiorBidSectionCode.val(rowData.interiorBidSectionCode);
			bidSectionName.val(rowData.bidSectionName);
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.passMessage(rowData); 
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode':$('#interiorBidSectionCode').val(),
		'bidSectionName':$('#bidSectionName').val(),
	};
	return projectData;
};
//表格初始化
function initJudgeTable() {
	$("#tableList").bootstrapTable({
		url: pageUrl,
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
		height: top.tableHeight,
		toolbar:"#toolbarTop",
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					width: '50',
					align: 'center',
					formatter: function (value, row, index) {
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '150px',
					formatter: function (value, row, index) {
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						return strView
					}
				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
//	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}
