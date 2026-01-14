/**
*  zhouyan 
*  2019-7-8
*  踏勘纪要
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/ReconnaissanceSiteController/findTenderSummaryPageList.do';  //列表接口

var viewHtml = 'Bidding/Tenderee/scoutingNotice/model/summaryView.html';//查看

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前数据
		openView(rowData)
	});
	
});

//查看
function openView(data){
	layer.open({
		type: 2,
		title: '查看踏勘纪要',
		area: ['80%', '90%'],
		content: viewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data); 
		}
	});
}


// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
		tenderProjectName: $("#tenderProjectName").val(), // 招标项目名称
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
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
		toolbar:"#toolbar",
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
	                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
			},{
				field: 'interiorBidSectionCode',
				title: '标段编号',
				align: 'left',
				cellStyle:{
					css: widthCode
				}
			},
			{
				field: 'bidSectionName',
				title: '标段名称',
				align: 'left',
				cellStyle:{
					css: widthName
				}
			},
			{
				field: 'tenderProjectName',
				title: '招标项目名称',
				align: 'left',
				cellStyle:{
					css: widthName
				}
			},
			{
				field: 'tenderProjectType',
				title: '项目类型',
				align: 'center',
				width: '200',
				cellStyle:{
					css:{'white-space':'nowrap'}
				},
				formatter: function(value, row, index){
					return getTenderType(value);
				}
			},
			{
				field: 'status',
				title: '操作',
				align: 'center',
				cellStyle:{
					css:{'white-space':'nowrap'}
				},
				formatter: function (value, row, index) {
					var str = "";
					var strSee ='<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					return strSee
				}
			}
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
