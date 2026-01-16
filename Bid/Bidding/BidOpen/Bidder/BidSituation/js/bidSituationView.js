/**

*  开标情况查看（投标人）
*  方法列表及功能描述
*/
var pageUrl = config.tenderHost  + "/NoticeController/pageReleaseList.do"; 	//分页

$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	initJudgeTable()
})
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
		/*onCheck: function (row) {
            checkboxed = row
        },*/
		columns: [
			/*{
				checkbox:true,
			},*/
			{
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
				field: '',
				title: '组织机构代码',
				align: 'center',
				width: '200',
			},{
				field: '',
				title: '投标单位',
				align: 'left',
				width: '150',
			},
			{
				field: '',
				title: '投标文件',
				align: 'center',
				width: '150',
			},
			{
				field: '',
				title: '是否解密成功',
				align: 'center',
				width: '100',
			},
			{
				field: '',
				title: '投标文件解密时间',
				align: 'center',
				width: '100',
			},
			{
				field: '',
				title: '是否确认报价',
				align: 'center',
				width: '100',
			},
			{
				field: '',
				title: '确认报价时间',
				align: 'center',
				width: '100',
			},
			{
				field: '',
				title: '报价确认签名码',
				align: 'center',
				width: '100',
			},
			{
				field: '',
				title: '是否确认开标一览表',
				align: 'center',
				width: '150',
			},
			{
				field: '',
				title: '开标一览表确认时间',
				align: 'center',
				width: '150',
			},
		]
	});
};