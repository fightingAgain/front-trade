/**

*  开标情况列表（项目经理）
*  方法列表及功能描述
*/

var pageUrl = config.tenderHost  + "/BidOpeningSignInController/pageBidOpeningSignInList.do"; 	//签到列表
var packageId = "";   //标段id

$(function(){
	if($.getUrlParam("packageid") && $.getUrlParam("packageid") != "undefined"){
		packageId = $.getUrlParam("packageid");
		initTable();
	}
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		bidSectionId: packageId
	};
	return projectData;
};



//表格初始化
function initTable(){
	$("#tableList").bootstrapTable({
		dataType: 'json',
		url: pageUrl,
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
		onLoadSuccess:function(){
			parent.layer.closeAll("loading")
		},
		columns: [
			{
				field: 'employeeName',
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
				field: 'employeeName',
				title: '投标人'
			},{
				field: 'employeeName',
				title: '签到情况',
				align: 'center',
				width: '150',
				formatter: function(value, row, index){
					if(row.signDate){
						return "已签到";
					} else {
						return "未签到";
					}
				}
			}
		]
	});
};


