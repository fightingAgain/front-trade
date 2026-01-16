/**

*  公告列表
*  方法列表及功能描述
*/
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面

var pageUrl = config.tenderHost  + "/BiddingProjectController/findReTenderPageList.do"; 	//分页

var bidUrl = config.tenderHost + "/NoticeController/findAllById.do";		//标段详情地址
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
		initJudgeTable();
	});
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "标段信息",
		area: [width+'px', height+'px'],
		content: bidDetailHtml + "?id=" + rowData[index].id + "&examType=" + rowData[index].examType + "&classCode=" + rowData[index].tenderProjectType.substring(0,1) + "&isPublicProject=" + rowData[index].isPublicProject,
		resize: false,
		success: function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData[0]);  //调用子窗口方法，传参
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
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'center',
					cellStyle:{
						css: widthCode
					}
				},{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'center',
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
				},{
					field: 'states',
					title: '状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) { 

						if(value == 0){
							return "未提交";
						} else if(value == 1){
							return "生效";
						} else if(value == 2){
							return "撤回";
						} else if(value == 3){
							return "招标完成";
						} else if(value == 4){
							return "招标失败";
						} else if(value == 5){
							return "重新招标";
						} else if(value == 6){
							return "终止";
						}
					}
				},
				{
					field: 'states',
					title: '操作',
					align: 'center',
					width: '120px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						
						return strSee;
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
