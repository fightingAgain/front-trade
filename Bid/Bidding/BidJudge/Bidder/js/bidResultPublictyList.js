/**

*  供应商查看结果通知
*  方法列表及功能描述
*/

var listUrl = config.tenderHost +'/BidWinNoticeController/findGYSPageList.do';  //列表接口

var viewHtml ='Bidding/BidJudge/Bidder/model/publicityView.html';//查看

$(function(){
	initDataTab();
//	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
});

function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看中标结果公告',
		area: ['100%', '100%'],
		content: viewHtml+'?id='+rowData.bidSectionId + '&examType=' + rowData.examType,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData); 
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
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
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value){
							return getTenderType(value);
						}
					}
				},
				{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					cellStyle:{
						css:widthState
					},//1为公开招标，2为邀请招标
					formatter: function(value, row, index){
						if(value == 1){
							return "公开招标";
						}else if(value == 2){
							return "邀请招标";
						}
					}
				},
				{
					field: 'noticeStartTime',
					title: '发布时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				/*{
					field: 'noticeState',
					title: '状态',
					align: 'center',
					width: '180',
					formatter: function(value, row, index){
						if(row.noticeState == 0){
							return  '<span>未提交</span>'
						}else if(row.noticeState == 1){
							return  '<span>待审核</span>'
						}else if(row.noticeState == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(row.noticeState == 3){
							return  '<span style="color:red">审核未通过</span>'
						}
					}
				},*/
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '150px',
					formatter: function(value, row, index){
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
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
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}