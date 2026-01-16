/**

*  委托合同
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/BiddingProjectController/findContractPageList.do';  //列表接口
var viewHtml = "Bidding/Contract/EntrustContract/model/entrustContractView.html";//查看页面


$(function(){
	//加载列表
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
});
/*
 * 打开查看窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#tableList').bootstrapTable('getData')[index];
	var url = viewHtml + "?contractId=" + rowData.id;
	layer.open({
		type: 2,
		title: '查看委托合同',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url ,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		contractName: $("#contractName").val(), // 委托合同名称
		tendererEnterprisName: $("#tendererEnterprisName").val(), // 招标人名称	
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
					field: 'contractName',
					title: '委托合同名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'tendererEnterprisName',
					title: '招标人名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'contractState',
					title: '合同状态',
					cellStyle:{
						css: widthState
					},
					align: 'center',
					formatter: function (value, row, index) {
						if(value == 0){
							return '未提交'
						}else if(value == 1){
							return '<span style="color:green;">已提交</span>'
						}
					}
				},
				{
					field: 'createTime',
					title: '创建时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					},
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
						var strView =	'<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>查看</button>';
						return strView ;
						

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
	$("#tableList").bootstrapTable("refresh");
}
