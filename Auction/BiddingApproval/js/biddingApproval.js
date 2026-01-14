var urlProjectCheckList = top.config.AuctionHost + '/WorkflowController/queryWorkflowAccepList.do'; //项目审核分页地址

var contentUrl = "Auction/commondingApproval/model/checkBiddingApproval.html";

var lookContentUrl = "Auction/commondingApproval/model/lookBiddingApproval.html";
var urlcheckJJCGAccepEndDate = top.config.AuctionHost + "/WorkflowController/checkJJCGAccepEndDate"
 
$(function() {

	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});
	//两个下拉框事件
//	$("#packageState,#tenderType,#workflowType").change(function() {
//
//		$('#ProjectAuditTable').bootstrapTable('refresh');
//	});

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
		if(row.groupCode!=""&&row.groupCode=='00270012'){
			if(row.accepType=='jjqk'){
				var lookContentUrl = "Auction/commondingApproval/model/JMlookBiddingApproval.html";
				var area = ['100%','100%'];
			}
	    }else{
	    	if(row.auctionType==6){
	    		var lookContentUrl = "Auction/commondingApproval/model/checkBiddingApproval.html";
	    	} else {
		   		var lookContentUrl = "Auction/commondingApproval/model/lookBiddingApproval.html";
		   }
	    }
		top.layer.open({
			type: 2,
			area: area || ["1200px", "650px"],
			maxmin: true,
			resize: false,
			title: "查看",
			content: lookContentUrl + "?projectId=" + row.projectId + "&id=" + row.packageId + "&flag=true",
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	},
	"click .audit": function(e, value, row, index) {
     if(row.groupCode!=""&&row.groupCode=='00270012'){
		 if(row.accepType=='jjqk'){
			 var contentUrl = "Auction/commondingApproval/model/JMcheckBiddingApproval.html";
			 var area = ['100%','100%'];
		 }
		   urlcheckJJCGAccepEndDate = top.config.AuctionHost +'/WorkflowController/checkWasteAccepEndDate.do'
	    }else{
		   var contentUrl = "Auction/commondingApproval/model/checkBiddingApproval.html";
		   urlcheckJJCGAccepEndDate = top.config.AuctionHost + "/WorkflowController/checkJJCGAccepEndDate"
	    }
		$.ajax({
			type: "get",
			url: urlcheckJJCGAccepEndDate,
			async: false,
			data: { 'businessId': row.packageId,'accepType':row.accepType },
			success: function(res) {
				if(res.success) {
					top.layer.open({
						type: 2,
						area: area || ["1200px", "650px"],
						maxmin: true,
						resize: false,
						title: "审核",
						content: contentUrl + "?projectId=" + row.projectId + "&id=" + row.packageId,
						success: function(layero, index) {
							var iframeWind = layero.find('iframe')[0].contentWindow;
							if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
								iframeWind.du(row)
							}

						}
					});
				}else{
						$('#ProjectAuditTable').bootstrapTable('refresh');
						parent.layer.alert(res.message)
					//parent.layer.msg();
				}
			}
		});

	}
}
//设置查询条件
function queryParams(params) {
	if("jjqk"==$("#workflowType").val()){
		var tenderType = 1
	}
	
	
	var para = {
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'accepType': 'jjqk',
		'checkState': $("#packageState").val(),
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'tenderType': tenderType
	};
	return para;
}
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
			title: '序号',
			align: 'center',
			width: "50px",
			formatter: function(value, row, index) {
				var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					if(row.tenderType == 1) {
						var projectName = '<div style="text-overflow: ellipsis; overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span></div>';
					} else if(row.tenderType == 2) {
						var projectName = '<div style="text-overflow: ellipsis; overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新竞卖)</span></div>';
					}
				} else {
					var projectName = '<div style="text-overflow: ellipsis; overflow:hidden;">' + row.projectName + '</div>';
				}
				return projectName;
			}
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',

		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',

		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',

		},
		{
			field: 'accepType',
			title: '审核类型',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(value == "jjqk") {
					return "竞价结果"
				} 
			}
		},
		{
			field: '#',
			title: '操作',
			align: 'center',
			width: '120',
			events: openAudit,
			formatter: function(value, row, index) {
				if(row.checkState == "0") {
					return "<button type='button'  class='btn btn-xs btn-primary audit'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>审核</button>";

				} else {
					return "<button type='button'  class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				}

			}
		}
	]
});