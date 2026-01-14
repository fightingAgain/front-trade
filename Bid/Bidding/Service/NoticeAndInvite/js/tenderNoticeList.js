/**
*  zhouyan 
*  2019-2-25
*  公告列表
*  方法列表及功能描述
*/

var viewUrl = "Bidding/BidNotice/Notice/model/tenderNoticeView.html"; // 查看
var preViewUrl = "Bidding/Pretrial/Notice/model/noticeView.html"; // 预审查看

var pageUrl = config.tenderHost  + "/BiddingNoticeController/findNoticePageList.do"; 	//分页
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	
	//查看
	$("#tenderNoticeList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});

	/*查询*/
	$('#btnSearch').click(function(){
		$("#tenderNoticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	// 状态查询
	$("#noticeState").change(function(){
		$("#tenderNoticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*公告性质查询*/
	$('[name=noticeNature]').change(function(){
		$("#tenderNoticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*公告类型查询*/
	$('[name=bulletinType]').change(function(){
		$("#tenderNoticeList").bootstrapTable('destroy');
		initJudgeTable();
	})
});
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	
	var rowData=$('#tenderNoticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var jumpHtml = '';
	if(rowData[index].examType == 2){
		jumpHtml = viewUrl;
	}else if(rowData[index].examType == 1){
		jumpHtml = preViewUrl;
	}
	
	layer.open({
		type: 2,
		title: "查看公告",
		area: ['100%', '100%'],
		content: jumpHtml + "?id=" + rowData[index].bidSectionId+"&noticeId=" + rowData[index].noticeId,
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
		'noticeState':$('#noticeState').val(),
		'examType':'2',//后审
	};
	return projectData;
};
//表格初始化
function initJudgeTable() {
	$("#tenderNoticeList").bootstrapTable({
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
		                var pageSize = $('#tenderNoticeList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tenderNoticeList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
						if (row.tenderMode == '1') {
							return "公开招标";
						} else if (row.tenderMode == '2') {
							return "邀请招标";
						}
					}
				},
				{
					field: 'examType',
					title: '资格审查方式',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
						if (value == '1') {
							return "预审";
						} else if (value == '2') {
							return "后审";
						}
					}
				},
				{
					field: 'noticeNature',
					title: '公告性质',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
						if (value == '1') {
							return "正常公告";
						}else if (value == '2') {
							return "更正公告";
						}else if (value == '3') {
							return "重发公告";
						}else if (value == '9') {
							return "其它";
						}
					}
				},
				/*{
					field: 'changeCount',
					title: '公告次数',
					align: 'center',
					width: '100',
					formatter: function (value, row, index) {
						var str;
						if(row.changeCount != undefined){
							str = value+1;
						}else{
							
							str = 0;
						}
						return str
					}
				},*/
				{
					field: 'subDate',
					title: '提交时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					}
					
				},
				{
					field: 'noticeState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {
						if (value == '-1') {
							return "未编辑";
						} else if (value == '0') {
							return "<span style='color:red;'>未提交</span>";
						} else if (value == '1') {
							return "提交审核";
						}else if (value == '2') {
							return "<span style='color:green;'>审核通过</span>";
						} else if (value == '3'){
							return "<span style='color:red;'>审核未通过</span>";
						} else if (value == '4'){
							return "<span style='color:blue;'>已撤回</span>";
						}else if (value == '5'){
							return "<span style='color:orange;'>变更中</span>";
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '120px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strSee
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
