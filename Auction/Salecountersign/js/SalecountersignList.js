var urlProjectCheckList = top.config.AuctionHost + '/WorkflowController/findWorkflowListPage.do'; //项目审核分页地址

//var contentUrl = "Auction/commondingApproval/model/checkBiddingApproval.html";

var lookContentUrl = "Auction/Salecountersign/model/lookBiddingApproval.html";
var urlcheckJJCGAccepEndDate = top.config.AuctionHost +'/WorkflowController/checkWasteAccepEndDate.do'
$(function() {

	//查询按钮
	$("#btnQuery").click(function() {
		$('#Salecountersign').bootstrapTable('refresh');
	});
	//两个下拉框事件
	$("#packageState,#tenderType,#workflowType").change(function() {

		$('#Salecountersign').bootstrapTable('refresh');
	});

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
		var lookContentUrl = "Auction/Salecountersign/model/JMlookBidStateApproval.html";

		top.layer.open({
			type: 2,
			area: ["1100px", "650px"],
			maxmin: true,
			resize: false,
			title: "查看",
		content: lookContentUrl + "?id=" + row.businessId+'&enterpriseId='+row.enterpriseId+'&projectId='+row.projectId+"&flag=true",
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
			}
		});
	},
	"click .audit": function(e, value, row, index) {
		 if(row.accepType=='fjwz_zzwj'){
			var contentUrl = "Auction/Salecountersign/model/JMcheckBidStateApproval.html";
		 }else{
			var contentUrl = "Auction/Salecountersign/model/JMcheckFileApproval.html";	 
		 }
		  
		$.ajax({
			type: "get",
			url: urlcheckJJCGAccepEndDate,
			async: false,
			data: {
				'businessId': row.businessId,
				'accepType':row.accepType
			},
			success: function(res) {
				if(res.success) {
					top.layer.open({
						type: 2,
						area: ["1100px", "650px"],
						maxmin: true,
						resize: false,
						title: "审核",
						content: contentUrl + "?id=" + row.businessId+'&enterpriseId='+row.enterpriseId+'&projectId='+row.projectId+"&accepType="+row.accepType,
						success: function(layero, index) {
							var iframeWind = layero.find('iframe')[0].contentWindow;
						}
					});
				}else{
						$('#Salecountersign').bootstrapTable('refresh');
						parent.layer.alert(res.message)
					//parent.layer.msg();
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
		'checkState': $("#packageState").val(),
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'tenderType': 2,
		'accepType':$("#workflowType").val(),
	};
	return para;
}
//查询列表
$("#Salecountersign").bootstrapTable({
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
				var pageSize = $('#Salecountersign').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#Salecountersign').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					if(row.tenderType == 1) {
						var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span></div>';
					} else if(row.tenderType == 2) {
						var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新竞卖)</span></div>';
					}
				} else {
					var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '</div>';
				}
				return projectName;
			}
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',

		}, {
			field: 'supplierName',
			title: '供应商名称',
			align: 'left',
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == "0") {
					return "<div class='text-info'>审核中</div>"
				} else if(value == "1") {
					return "<div class='text-warning'>已审核</div>"
				} else if(value == "2") {
					return "<div class='text-warning'>已撤销</div>"
				}
			}
		},
		{
			field: 'accepType',
			title: '审核类型',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				return "文件审核"
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