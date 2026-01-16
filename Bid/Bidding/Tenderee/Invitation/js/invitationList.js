/**

*  公告列表
*  方法列表及功能描述
*/
var viewUrl = "Bidding/Tenderee/Invitation/model/invitationView.html"; // 查看

var pageUrl = config.tenderHost  + "/BidInviteController/findTendererPageList.do"; 	//分页

var bidUrl = config.tenderHost + "/NoticeController/findAllById.do";		//标段详情地址
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index,true);
	});
	//回复
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable()
	});
});
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index,state){
	var rowData=$('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	var jumpUrl = '';
	if(state){
		jumpUrl = viewUrl + "?id=" + rowData.bidSectionId+"&bidInviteId=" + rowData.bidInviteId +'&replyState=' + rowData.replyState + '&timeState='+rowData.timeState+ "&getFileType="+rowData.getFileType+'&special=VIEW';
	}else{
		jumpUrl = viewUrl + "?id=" + rowData.bidSectionId;
	}
	layer.open({
		type: 2,
		title: "邀请函",
		area: ['100%', '100%'],
		content: jumpUrl,
		resize: false,
		success: function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData,refreshFather); 
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
					field: 'bidInviteTitle',
					title: '邀请函标题',
					align: 'left',
					cellStyle:{
						css: widthName
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
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						return getTenderType(value);
					}
				},
				{
					field: 'bidInviteIssueNature',
					title: '邀请函性质',
					align: 'center',
					width: '100',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var str;
						//1为正常邀请，2为更正邀请，3为重发邀请，9为其它
						if(value == 1){
							str = '正常邀请';
						}else if(value == 2){
							str = '更正邀请';
						}else if(value == 3){
							str = '重发邀请';
						}else if(value == 9){
							str = '其它';
						}
						return str
					}
				},
				{
					field: 'states', //招标文件主表的创建时间
					title: '标段状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter:function(value, row, index){
						if(value == 1){
							return "生效";
						} else {
							return "<span style='color:red;'>招标异常</span>";
						}
					}
				},
				{
					field: 'inviteAnswersEndDate',
					title: '回复截止时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'replyState',
					title: '回复状态',
					align: 'center',
					width: '100',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var str;
						if(value == 0){
							str = '未回复';
						}else if(value == 1){
							str = '<span style="color:red">放弃投标</span>';
						}else if(value == 2){
							str = '<span style="color:green">同意投标</span>';
						}
						return str
					}
					
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '150px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>回复</button>';
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						if(row.replyState == 0){
							return strEdit+strSee
						}else if(row.replyState == 1){
							return strSee
						}else if(row.replyState == 2){
							return strSee
						}
					}
				}
			]
		]
	});
};
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather(){
	$('#tableList').bootstrapTable('refresh');
}
