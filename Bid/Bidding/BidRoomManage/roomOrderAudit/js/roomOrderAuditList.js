/**
*  Xiangxiaoxia 
*  2019-2-21
*  开标室的预约审核 分页列表页面
*  方法列表及功能描述
*   1、initDataTab()   表格初始化
* 	2、getDetail()  查询详情
*/

var listUrl = config.tenderHost + '/BiddingRoomAppointmentController/pageCheckerList.do';  //查看全部的审核预约申请列表

var pageEdit = "Bidding/BidRoomManage/roomOrderAudit/roomCheckEdit.html";  //查看详情的审核预约页面
var pageView = "Bidding/BidRoomManage/roomOrderAudit/roomCheckView.html";  //查看详情的查看页面
var id = "";

$(function() {
	//表格初始化
	initDataTab();

	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
	}

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	$("#btnSearch").click(function(){
		$("#roomAuditList").bootstrapTable('destroy');
		initDataTab();
	});
	// 类型查询
	$("#appointmentState").change(function(){
		$("#roomAuditList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$("#roomAuditList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView($index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#roomAuditList').bootstrapTable('getData');//bootstrap获取当前页的数据
	var url; var titile;
	if(rowData[$index].appointmentState >= 2){
		url = pageView,
		title = "查看审核详情";
	}else{
		url = pageEdit,
		title = "预约场地审核";
	}
	layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url + "?id=" + rowData[$index].id,
		success:function(layero, index){
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//iframeWin.getMsg(rowData[$index].id);
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var Data = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		appointmentTitle: $("#appointmentTitle").val(), // 标题
		appointmentState: $("#appointmentState").val(), // 状态	
		userName: $("#employeeId").val() // 提交人	
	};
	return Data;
};
//表格初始化
function initDataTab(){
	$("#roomAuditList").bootstrapTable({
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function (value, row, index) {
		                var pageSize = $('#roomAuditList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#roomAuditList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'appointmentTitle',
					title: '标题',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: 'editStartDate',
					title: '开始时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'editEndDate',
					title: '结束时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'appointmentState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {//0为临时保存，1为提交审核，2为审核通过，3为审核未通过
						if(value == 0 ){
							return '<span>已保存</span>';
						}else if(value == 1){
							return '<span>待审核</span>';
						}else if(value == 2){
							return '<span>审核通过</span>';
						}else if(value == 3){
							return '<span>审核未通过</span>';
						}
					}
				},
				{
					field: 'userName',
					title: '提交人',
					align: 'center',
					cellStyle:{
						css:widthCode
					},
				},
				{
					field: 'linkTel',
					title: '联系电话',
					align: 'center',
					cellStyle:{
						css:widthCode
					},
				},
				{
					field: 'subDate',
					title: '提交时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '120px',
					formatter: function (value, row, index) {
						if(row.appointmentState == 1){
							var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>审核</button>';
						}else if((row.appointmentState > 1)){
							var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>详情</button>';
						}
						
						return strSee ;

					}
				}
			]
		]
	});
};

