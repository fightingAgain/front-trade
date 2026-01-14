/*
 * 页面加载，绑定Table数据源
 * */
var urlProjectCheckList = top.config.AuctionHost + '/BusinessStatisticsController/findAuidePageList.do'; //项目审核分页地址
var urlCheck = "bidPrice/ReportStatisticsApproval/model/reportReview.html"
$(function() {
	initTable();
	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('destroy');
		initTable()
	});
	//两个下拉框事件
	$("#packageState,#tenderType,#workflowType").change(function() {
		$('#ProjectAuditTable').bootstrapTable('destroy');
		initTable();
	});

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
		let tenderType = row.tenderType;
		let url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html";
// 		switch(tenderType) {
// 			case 0:
// //				url = "bidPrice/ReportStatisticsApproval/model/xbReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"

// 				break;
// 			case 1:
// //				url = "bidPrice/ReportStatisticsApproval/model/jjReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			case 2:
// //				url = "bidPrice/ReportStatisticsApproval/model/jmReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			case 4:
// //			url = "bidPrice/ReportStatisticsApproval/model/dbReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			default:
// 				return false;
// 				break;
// 		}

		top.layer.open({
			type: 2,
			area: ["100%", "100%"],
			maxmin: true,
			resize: false,
			title: "查看",
			content: url + "?projectId=" + row.id + "&accepType=" + row.accepType + "&tenderType=" + row.tenderType + '&edittype=detailed',
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	},
	"click .audit": function(e, value, row, index) {
		let tenderType = row.tenderType;
		let url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html";
// 		switch(tenderType) {
// 			case 0:
// //				url = "bidPrice/ReportStatisticsApproval/model/xbReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			case 1:
// //				url = "bidPrice/ReportStatisticsApproval/model/jjReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			case 2:
// //				url = "bidPrice/ReportStatisticsApproval/model/jmReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 			case 4:
// //			    url = "bidPrice/ReportStatisticsApproval/model/dbReportReview.html"
//                 url = "bidPrice/ReportStatisticsApproval/model/newReportReview.html"
// 				break;
// 		}
		top.layer.open({
			type: 2,
			area: ["100%", "100%"],
			maxmin: true,
			resize: false,
			title: "审核",
			content: url + "?projectId=" + row.id + "&accepType=" + row.accepType + "&tenderType=" + row.tenderType + '&edittype=audit',
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	}
}
//设置查询条件
function queryParams(params) {
	var para = {
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'workflowType': $("#workflowType").val(),
		'projectState': $("#packageState").val(),
		'tenderProjectName': $("#projectName").val(),
		'tenderProjectCode': $("#projectCode").val(),
		'tenderType': $("#tenderType").val()
	};
	return para;
}

function initTable(){
var type = $('#tenderType').val();

	//查询列表
$("#ProjectAuditTable").bootstrapTable({
	url: urlProjectCheckList,
	dataType: 'json',
	method: 'get',
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	clickToSelect: true, //是否启用点击选中行
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: queryParams, //查询条件参数
	striped: true,
	columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: "50px",
			formatter: function(value, row, index) {
				var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'tenderProjectName',
			title: '项目名称',
			align: 'left',

		},
		{
			field: 'tenderProjectCode',
			title: '项目编号',
			align: 'left',
			width: '200'
		}, {
			visible: type != '2',
			field: 'bidSectionName',
			title: type == '4'?'标段名称':'包件名称',
			align: 'left',
			formatter:function(value, row, index){				
				if(row.packageSource==1){
					return value+'<span class="text-danger">(重新'+(row.tenderType==1?'竞价':'竞卖')+')</span>';					
				}else{
					return value;				
				}
				
			}
		},

		{
			field: 'tenderAgencyLinkmen',
			title: '项目经理',
			align: 'left',
			width: '100',
		},
		{
			field: 'tenderType',
			title: '审核类型',
			align: 'center',
			width: '180',
			formatter: function(value, row, index) {
				srt = "";
				switch(value) {
					case 0:
						srt = "询比采购"
						break;
					case 1:
						srt = "竞价采购"
						break;
					case 2:
						srt = "竞卖"
						break;
						//					case 3:
						//					srt = "询比采购"
						//						break;
					case 4:
						srt = "招标采购"
						break;
					case 6:
						srt = "单一来源采购"
						break;	
					default:
						return false;;
						break;
				}
				return srt;
			}
		},
		{
			field: 'auditorTime',
			title: '提交日期',
			align: 'left',
			width: '180',
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == "0") {
					return "<div class='text-info'>未审核</div>"
				} else if(value == "1") {
					return "<div class='text-warning'>待审核</div>"
				} else if(value == "2") {
					return "<div class='text-success'>审核通过</div>"
				} else if(value == "3") {
					return "<div class='text-danger'>审核未通过</div>"
				}
			}
		},
		{
			field: '#',
			title: '操作',
			align: 'center',
			width: '80',
			events: openAudit,
			formatter: function(value, row, index) {
				if(row.checkState == "2" || row.checkState == "3") {
					return "<button type='button'  class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				} else {
					return "<button type='button'  class='btn btn-xs btn-primary audit'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>审核</button>";
				}

			}
		}
	]
});
}
