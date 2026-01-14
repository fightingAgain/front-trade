var listUrl = config.tenderHost + '/ProjectController/pageCheckerList.do';  //列表接口
var delUrl = config.tenderHost + '/ProjectController/delete.do';  //列表接口

var pageEdit = "Bidding/Project/model/projectEdit.html";  //编辑页面
var pageView = "Bidding/Project/model/projectView.html";  //查看页面
var pageReview = "Bidding/Model/review.html"; //审核页面

$(function(){
	//加载列表
	initData();
	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});

	//查看
	$("#projectList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index, 0);
	});
	
	//审核
	$("#projectList").on("click", ".btnApproval", function(){
		var width = top.$(window).width() * 0.7;
		var height = top.$(window).height() * 0.7;
		var index = $(this).attr("data-index");
		openView(index, 1);
//		var rowData= $('#projectList').bootstrapTable('getData')[index];
//		top.layer.open({
//			type: 2,
//			title: "项目审核",
//			area: [width + 'px', height + 'px'],
//			content: pageReview + "?id=" + rowData.id + "&workflowtype=xmsh",
//			success:function(layero, index){
//			}
//		});
	});
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 * source是连接来源 0是查看， 1是审核
 */
function openView(index, source){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#projectList').bootstrapTable('getData'); //bootstrap获取当前页的数据
//	console.log("^^^^"+JSON.stringify(rowData));
	layer.open({
		type: 2,
		title: "查看项目信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?id=" + rowData[index].id + "&source=" + source,
		success:function(layero, index){
			
		}
	});
}
//数据初始化
function initData() {
	var html = "";
 	var projState = parent.Enums.projState;
 	for(var key in projState){
 		html += '<option value="'+key+'">'+projState[key]+'</option>';
 	}
 	$(html).appendTo("#projectState");
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorProjectCode: $("#interiorProjectCode").val(), // 项目编号
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#projectList").bootstrapTable({
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
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorProjectCode',
					title: '项目编号',
					align: 'center',
					width: '200',
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
				},
				{
					field: 'tendererName',
					title: '招标人名称',
					align: 'left'
				},
				{
					field: 'userName',
					title: '项目经理',
					align: 'center',
					width: '120'
				},
				{
					field: 'checkState',
					title: '状态',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){
						if(value == 0){
							return "待审核";
						} else {
							return "已审核";
						}
					}
				},
				{
					field: 'checkState',
					title: '操作',
					align: 'left',
					width: '160px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						if(value == 0){
							str += strApproval;
						} else{
							str += strSee;	
						}
						
						return str ;

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
	$("#projectList").bootstrapTable("refresh");
}
