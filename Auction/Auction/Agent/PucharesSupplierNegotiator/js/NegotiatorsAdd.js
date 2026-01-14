//var searchUrl = parent.config.Syshost + "/EmployeeController/pageView.do"; //成员查询接口
var searchUrl = parent.config.AuctionHost + "/NegotiationController/pagePurNegotiation.do"; //成员查询接口
var saveUrl = parent.config.AuctionHost + "/NegotiationController/saveAllNegotiationEmployee.do";//保存接口
var sUrl = parent.config.AuctionHost + "/NegotiationController/findPageList.do";//谈判员查询接口
var projectId = getUrlParam('projectId');
var negotiationId; //谈判记录主表id
var html = '';
var item = [];
//页面加载后显示
$(function () {
	//查询按钮
	$("#btnSearch").on('click', function () {
		$('#NegotiatorsAddList').bootstrapTable('refresh', {
			url: searchUrl
		});
	});

});

var negotiationLists = [];
function getNegotiators(negotiatiors, negotiationList) {

	negotiationId = "&negotiationId=" + negotiatiors.id;

	negotiationLists = negotiationList;
}

//设置查询条件
function queryParams(params) {
	return {
		'userName': $("#userName").val(),
		'logCode': $("#logCode").val(),
		'tenderType': 1,
		'projectId': projectId,
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		offset: params.offset
	}
}

//表格初始化
$("#NegotiatorsAddList").bootstrapTable({
	method: 'GET', // 向服务器请求方式
	contentType: "application/x-www-form-urlencoded", // 如果是post必须定义	
	url: searchUrl,
	dataType: 'json',
	//locale: "zh-CN",
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	striped: true, // 隔行变色
	dataType: "json", // 数据类型
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 10, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	clickToSelect: true, //是否启用点击选中行
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: queryParams, //查询条件参数
	queryParamsType: "limit",
	columns: [
		[{
			field: 'Id',
			checkbox: true,
			formatter: function (value, row, index) {
				//再次点击进来的时候把之前选中行 默认选中
				if (negotiationLists && negotiationLists.length > 0) {
					for (var i = 0; i < negotiationLists.length; i++) {
						if (negotiationLists[i].id == row.id) {
							return {
								checked: true
							};
						}
					}
				}
			}
		},
		{
			field: 'userName',
			title: '姓名'
		},
		{
			field: 'logCode',
			title: '登录名'
		},
		{
			field: 'tel',
			title: '手机号'
		},
		{
			field: 'email',
			title: '邮箱'
		},
		{
			field: 'subDate',
			title: '修改时间',
		}
		]
	]
});

$("#btnAdd").on('click', function () {
	var NegotiatorsData = $('#NegotiatorsAddList').bootstrapTable('getSelections');
	if (NegotiatorsData.length == 0) {
		parent.layer.alert('请选择要添加的数据!');
		return;
	}



	//获取父页面的元素
	var thisFrame = parent.window.document.getElementById("negotiators").getElementsByTagName("iframe")[0].id;
	var dcmt = parent.$('#' + thisFrame)[0].contentWindow;

	dcmt.negotiatiators(NegotiatorsData); //刷新父窗口谈判人员table

	parent.layer.close(parent.layer.getFrameIndex(window.name));
	parent.layer.alert("添加谈判组成员成功!");

});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}