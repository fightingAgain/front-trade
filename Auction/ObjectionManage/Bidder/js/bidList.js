/**
*  zhouyan 
*  2019-6-2
*  选择包件
*  方法列表及功能描述
*/

var listUrl = config.AuctionHost + '/ObjectionAnswersController/findPageBidSectionList.do';  //列表接口
var pageUrlParams = getUrlParamObject();
$(function () {
	//加载列表

	//查询
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
});
function getBid(type, callback) {
	$('#objectionType').val(type);
	initDataTab();
	//确定
	$("#btnSure").click(function () {
		var row = getChild();
		if (row) {
			callback(row[0]);
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
		}
	});
	/*关闭*/
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
}
function getChild() {
	var row = $("#tableList").bootstrapTable("getSelections");
	if (row.length > 0) {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
		return row
	} else {
		if (isProjectMode(pageUrlParams.tenderType)) {
			parent.layer.alert("请选择项目！", { icon: 7 })
		} else {
			parent.layer.alert("请选择包件！", { icon: 7 })
		}
		
	}
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		packageNum: $("#packageNum").val(), // 包件编号
		packageName: $("#packageName").val(), // 包件名称	
		objectionType: $("#objectionType").val(), // 异议阶段	
	};
	return Object.assign(projectData, pageUrlParams);
};
//表格初始化
function initDataTab() {
	$("#tableList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		height: 500,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
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
		onLoadError: function () {
			parent.layer.closeAll("loading");
			parent.layer.alert("请求失败");
		},
		responseHandler: function(res) {
			return res.data;
		},
		onLoadSuccess: function (data) {
			parent.layer.closeAll("loading");
			if (!data.success) {
				parent.layer.alert(data.message);
			}
			$("#tableList").bootstrapTable('resetView');
		},
		onCheck: function (row) {
			checkboxed = row
		},
		columns: [
			{
				radio: true,
			},
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
					var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'packageNum',
				title: isProjectMode(pageUrlParams.tenderType) ? '项目编号' : '包件编号',
				align: 'left',
			},
			{
				field: 'packageName',
				title: isProjectMode(pageUrlParams.tenderType) ? '项目名称' : '包件名称',
				align: 'left',
			}
		]
	});
	doPackageView(pageUrlParams.tenderType);
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}
