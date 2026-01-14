/**
*  zhouyan 
*  2019-2-25
*  公告列表
*  方法列表及功能描述
*/
var viewUrl = "Bidding/Invitation/model/invitationView.html"; // 查看

var pageUrl = config.tenderHost  + "/BiddingInviteController/findInvitePageList.do"; 	//分页


//入口函数 
$(function(){
	
	//加载列表
	initJudgeTable();
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable()
	});
	/*公告性质查询*/
	$('[name=bidInviteState]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable()
	});
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	
	var rowData=$('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	
	layer.open({
		type: 2,
		title: "查看邀请函",
		area: ['100%', '100%'],
		content: viewUrl + '?bidSectionId='+rowData.id + "&bidInviteId=" + rowData.bidInviteId + "&bidInviteHistoryId=" + rowData.bidInviteHistoryId,
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
		'bidInviteState':$('#bidInviteState').val(),
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
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
				/*{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					width: '100',
					formatter: function (value, row, index) {
						if (row.tenderMode == '1') {
							return "公开招标";
						} else if (row.tenderMode == '2') {
							return "邀请招标";
						}
					}
				},*/
				/*{
					field: 'changeCount',
					title: '邀请函次数',
					align: 'center',
					width: '150',
					formatter: function (value, row, index) {
						var str;
						if(row.changeCount != undefined){
							str = Number(value)+1;
						}else{
							
							str = 0;
						}
						return str
					}
				},*/
				{
					field: 'bidInviteIssueNature',
					title: '邀请函性质',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {//投标邀请性质   1为正常邀请，2为更正邀请，3为重发邀请，9为其它
						if (value == '1') {
							return "正常邀请";
						} else if (value == '2') {
							return "<span style='color:red;'>变更邀请</span>";
						}
					}
					
				},
				{
					field: 'subDate',
					title: '提交时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					},
					
				},
				{
					field: 'bidInviteState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
						if (value == '0') {
							return "<span style='color:red;'>未提交</span>";
						} else if (value == '1') {
							return "提交审核";
						}else if (value == '2') {
							return "<span style='color:green'>审核通过</span>";
						} else if (value == '3'){
							return "<span style='color:green'>审核未通过</span>";
						} else if (value == '4'){
							return "<span style='color:blue;'>已撤回</span>";
						} else if (value == '5'){
							return "<span style='color:orange'>变更中</span>";
						}
					}
				},{
					field: 'publishState',
					title: '发送状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) {
						if (value == '0') {
							return "<span style='color:red'>未发布</span>";
						} else if (value == '1') {
							return "<span style='color:green'>已发布</span>";
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
						return  strSee
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
