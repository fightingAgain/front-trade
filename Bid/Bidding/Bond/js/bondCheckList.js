/**
*  zhouyan 
*  2019-5-28
*  提交保证金凭证列表
*  方法列表及功能描述
*/

var pageUrl = config.tenderHost + '/DepositController/findAccountPageList.do';  //列表接口
var exportUrl = config.tenderHost + '/DepositController/exportAccountPageByExcel.do';//导出

var viewHtml = 'Bidding/Bond/model/bondCheckDetail.html';//查看
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*状态查询*/
	$('[name=noticeState]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	$('#btnExport').click(function(){
		 //导出模版
		var obj = {};
		obj.bidSectionName = $("#bidSectionName").val();
		obj.interiorBidSectionCode = $("#interiorBidSectionCode").val();
		var loadUrl = $.parserUrlForToken(exportUrl);
		$.each(obj, function(key,value) {
			loadUrl += '&' + key + '=' + value
		});
		window.location.href = loadUrl;
	})
	
});

function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看保证金凭证',
		area: ['80%', '80%'],
		content: viewHtml+'?bidId='+rowData.bidSectionId+ '&timeState=' + rowData.timeState,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passToChild(rowData); //调用子页面方法并传参
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
		height: top.tableHeight,
		toolbar:"#toolbarTop",
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
				{
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},{
					field: 'userName',
					title: '项目经理',
					align: 'left',
					cellStyle:{
						css:{"width":"150px", "white-space":"nowrap"}
					}
				},{
					field: 'bidOpenTime',
					title: '开标时间',
					align: 'center',
					cellStyle:{
						css:{"width":"150px", "white-space":"nowrap"}
					}
				},{
					field: 'bidderNum',
					title: '已购标（家）',
					align: 'center',
					cellStyle:{
						css:{"width":"100px", "white-space":"nowrap"}
					}
				},{
					field: 'auditedNum',
					title: '已确认（家）',
					align: 'center',
					cellStyle:{
						css:{"width":"100px", "white-space":"nowrap"}
					}
				},{
					field: 'notAuditedNum',
					title: '待确认（家）',
					align: 'center',
					cellStyle:{
						css:{"width":"100px", "white-space":"nowrap"}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '100px',
					formatter: function (value, row, index) {
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strView;
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
