/**
*  zhouyan 
*  2019-4-19
*  结果公示审核列表
*  方法列表及功能描述
*/
var auditHtml = "Bidding/BidJudge/Auditor/model/resultAudit.html"; // 审核

var pageUrl = config.tenderHost  + "/BidWinNoticeController/pageCheckList.do"; 	//分页
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openAudit(index,0);
	});
	//审核
	$("#tableList").on("click", ".btnAudit", function(){
		var index = $(this).attr("data-index");
		openAudit(index,1);
	});
	/*查询*/
	$('#btnSearch').click(function(){
		$('#tableList').bootstrapTable(('refresh')); 	
	});
	/*状态查询*/
	$('[name=noticeState]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
});
/*
 * 打开窗口
 * index是当前所要查看的索引值，
 * source :0 查看 1 审核
 */
function openAudit(index,source){
	var titles = '';
	if(source == 0){
		titles = "查看中标结果公示审核";
	}else if(source == 1){
		titles = "中标结果公示审核";
	};
	var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: titles,
		area: ['80%', '80%'],
		content: auditHtml + "?id=" + rowData[index].businessId+'&source='+source,
		resize: false,
		success: function(layero, index){
			
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode':$('#interiorBidSectionCode').val(),
		'bidSectionName':$('#bidSectionName').val(),
		'publicityState':$('#publicityState').val(),
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
				/*{
					field: 'userName',
					title: '提交人',
					align: 'center',
					width: '100',
				},
				{
					field: 'tel',
					title: '联系电话',
					align: 'center',
					width: '100',
				},*/
				{
					field: 'workflowStartDate',
					title: '提交时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'noticeState',
					title: '审核状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {
						if (row.noticeState == '1') {
							return "未审核";
						}else if (row.noticeState == '2') {
							return "<span style='color:green'>审核通过</span>";
						} else if (row.noticeState == '3'){
							return "<span style='color:red'>审核未通过</span>";
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '100px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strAudit =	'<button  type="button" class="btn btn-primary btn-sm btnAudit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>审核</button>';
					 	if(row.noticeState==1){
							return  strAudit;
						}
						else if(row.noticeState==2){
							return  strSee;
						}
						else if(row.noticeState==3){
							return  strSee;
						}
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
