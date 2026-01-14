var checkboxed = "";
var codes = "";
var names = "";
var endtimes = "";
var tenderTypeCode;
var examTypeCode;
var inviteStateCode;
$(function() {
	if(PAGEURL.split("?")[1] != undefined){
		if(PAGEURL.split("?")[1].split("=")[0] == "tenderType"){ //项目类型切换 
			tenderTypeCode =  PAGEURL.split("?")[1].split("=")[1];
			examTypeCode = 1;
		}
		
		if(PAGEURL.split("?")[1].split("=")[0] == "examType"){ //预审后审状态判断
			examTypeCode = PAGEURL.split("?")[1].split("=")[1];
			tenderTypeCode = 0;
			inviteStateCode = 0;
		}
		
		/*if(PAGEURL.split("?")[1].split("=")[0] == "inviteState"){ //预审下，是否是邀请函状态
			inviteStateCode = PAGEURL.split("?")[1].split("=")[1];
			tenderTypeCode = 0;
			examTypeCode = 0;
			
		}*/
	}else{//评审
		
		tenderTypeCode = 0;
		examTypeCode = 1;
		inviteStateCode = 0;
	}
	initTable();
});
/// 表格初始化
var urlProjectSupplementList = config.bidhost + '/ProjectSupplementController/findPageList.do';
var view = '0502/Bid/Supplement/model/view_model.html'

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlProjectSupplementList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function(row) {
			checkboxed = row.projectId;
			codes = row.project.projectCode;
			names = row.project.projectName;
			sessionStorage.setItem('supplementData', JSON.stringify(row));
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',			
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					var projectName = row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span>'
				} else {
					var projectName = row.projectName
				}
				return projectName
			}
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left'
		},{
			field: 'noticeEndDate',
			title: '补遗截止时间',
			align: 'center',
			width: '180',

		}, {
			title: '补遗数量',
			field: 'subCount',
			align: 'center',
			width: '100'
		}, {
			title: '未通过数',
			field: 'checkCount',
			align: 'center',
			width: '100'

		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				var State = '<div class="btn-group" style="padding-left: 10px;">' +
					'<a class="btn-sm btn-primary" href="#" style="text-decoration:none" onclick=showProjectSupplementInfo(\"' + row.packageId + '\",'+ index +',\"'+(row.enterpriseId || "")+'\",\"'+(row.pEnterpriseId||"")+'\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看' +
					'</a>' +
					'</div>'
				return State
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		pageNumber: params.offset / params.limit + 1, //当前页数
		pageSize: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量	
		tenderType: tenderTypeCode,
		examType:examTypeCode,
		//inviteState:inviteStateCode,
		enterpriseType: "0",
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val(),
		projectCode: $("#packageNum").val(),
		projectName: $("#packageName").val(),
	}
};
// 搜索按钮触发事件
$("#btnSearch").click(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

function showProjectSupplementInfo(packageId,$index,enterpriseId,pEnterpriseId) {
	var packageIds = "";
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('oldNoticeStartDate',JSON.stringify(rowData[$index].oldNoticeStartDate));//获取当前选择行的数据，并缓存	
	sessionStorage.setItem('examTypeData', JSON.stringify(rowData[$index].examType));
	sessionStorage.setItem('inviteStateData', JSON.stringify(rowData[$index].inviteState));
	sessionStorage.setItem('isPublicData', JSON.stringify(rowData[$index].isPublic));
	sessionStorage.setItem('projectIdData', JSON.stringify(rowData[$index].id));
	sessionStorage.setItem('isSignData', JSON.stringify(rowData[$index].isSign));
	var title;
	if(tenderTypeCode == 0 ){
		if(examTypeCode == 0){
			if(inviteStateCode == 1){
				title = '邀请函变更';
			}else{
				title = '资格预审补遗';
			}
		}else if(examTypeCode == 0){
			title = '询价采购补遗';
		}
	}else if(tenderTypeCode == 6 ){
		title = '单一来源采购补遗';
	}
	
	layer.open({
		type: 2,
		//title:tenderTypeCode==0?'询价采购补遗':'单一来源采购补遗',
		title:title,
		area: ['80%', '80%'],
		maxmin: false,
		resize: false,
		content: view + "?packageIds=" + packageId +"&tenderType="+tenderTypeCode+"&enterpriseType=0",
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(enterpriseId,pEnterpriseId);
		}
	});
}