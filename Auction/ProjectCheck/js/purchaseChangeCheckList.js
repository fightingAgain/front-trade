var urlProjectCheckList = top.config.AuctionHost + '/ProjectViewsController/findProjectCheckList.do'; //补遗审核分页地址

$(function() {
	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});

	//两个下拉框事件
	$("#checkState,#tenderType").change(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});

});

window.supplementAudit = {
	"click .detailed": function(e, value, row, index) {
		if(row.tenderType == 1){
			var contentUrl='bidPrice/ProjectCheck/modal/jjChangeCheck.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
		}else if(row.tenderType == 2){
			var contentUrl='bidPrice/ProjectCheck/modal/jmChangeCheck.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
		}else if(row.noticeType==0){//公告变更
			if(row.tenderType==12 || row.tenderType==13){
				var contentUrl='bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&pulice='+row.isPublic
				+'&tenderType='+row.tenderType;
			}else{
				var contentUrl='bidPrice/ProjectCheck/modal/purchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
			}
		}else{//邀请函变更
			if(row.tenderType==12|| row.tenderType==13){
				var contentUrl='bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+
				'&pulice='+row.isPublic+'&tenderType='+row.tenderType;
			}else{
				var contentUrl='bidPrice/ProjectCheck/modal/examPurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
			}
		}
		top.layer.open({
			type: 2,
			area: ["1100px", "600px"],
			maxmin: false,
			resize: false,
			title: "查看",
			content: contentUrl
		});
	},
	"click .audit": function(e, value, row, index) {
		if(row.tenderType == 1){
			var contentUrl='bidPrice/ProjectCheck/modal/jjChangeCheck.html?id=' + row.id + '&edittype=detailed&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&tenderType='+row.tenderType;
		}else if(row.tenderType == 2){
			var contentUrl='bidPrice/ProjectCheck/modal/jmChangeCheck.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&tenderType='+row.tenderType;
		}if(row.supplementType == 3){
			if(row.tenderType==1){
				var contentUrl='bidPrice/ProjectCheck/modal/jjChangeCheck.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&tenderType='+row.tenderType;
			}else if(row.tenderType==2){
				var contentUrl='bidPrice/ProjectCheck/modal/jmChangeCheck.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&tenderType='+2;
			}
		}else if(row.noticeType==0){
			if(row.tenderType==12|| row.tenderType==13){
				var contentUrl='bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&pulice='+row.isPublic+'&tenderType='+row.tenderType;
			}else{
				var contentUrl='bidPrice/ProjectCheck/modal/purchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
			}
		}else{
			if(row.tenderType==12|| row.tenderType==13){
				var contentUrl='bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId+'&pulice='+row.isPublic+
				'&tenderType='+row.tenderType;
			}else{
				var contentUrl='bidPrice/ProjectCheck/modal/examPurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut='+ row.isTimeOut+'&packageId='+row.packageId+'&projectId='+row.projectId;
			}
		}
		top.layer.open({
			type: 2,
			area: ["1100px", "600px"],
			maxmin: false,
			resize: false,
			title: "审核",
			content: contentUrl
		});
	}
}

//设置查询参数
function queryParams(params) {
		
	if($("#tenderType").val()==12 ||$("#tenderType").val()==13){
		var workflowType="jztp_xmby";
	}else{
		var workflowType="xmby";
	}
	var para = {
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		workflowType: workflowType,
		projectState: $("#checkState").val(),
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val(),
		tenderType:$("#tenderType").val(),
	};
	if($("#tenderType").val()==1 || $("#tenderType").val()==2){
		para.supplementType = 3
	}
	//项目类型不为空
	return para;
}

//表初始化
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
	pageList: [10,15,20,25],
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
			formatter:function(value, row, index){
				if(row.projectSource==1){
					var count = row.projectSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
					}else{
						return value+' <span class="text-danger">(重新采购)</span>';
					}
				}else{
					return value;
				}
				
			}
			// formatter: function(value, row, index) {
			// 	if(row.projectSource == 1) {
			// 		var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span>'
			// 	} else {
			// 		var projectName = row.projectName;
			// 	}
			// 	return projectName;
			// }
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left'
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left'
		},
		{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(row.packageSource==1){
					var count = row.packageSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
					}else{
						return value+' <span class="text-danger">(重新采购)</span>';
					}
				}else{
					return value;
				}
				
			}
			// formatter:function(value, row, index){
			// 	if(row.packageSource==1){
			// 		return value+'<div class="text-danger">(重新采购)</div>';
			// 	}else{
			// 		return value;
			// 	}
				
			// }
		},
		{
			field: 'title',
			title: '变更标题',
			align: 'left'
		},
		{
			field: 'tenderTypeName',
			title: '项目类型',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
				if(row.tenderTypeName=="竞价采购"){
					return "竞价采购"
				}else if(row.tenderTypeName=="竞卖采购"){
					return "竞卖"
				}else if(row.tenderTypeName=="竞争性谈判采购"){
					if(row.isPublic>1){
						return "竞争性谈判采购邀请函"
					}else{
						return "竞争性谈判采购公告"
					}
					
				}else if(row.tenderTypeName=="竞争性磋商采购"){
					if(row.isPublic>1){
						return "竞争性磋商采购邀请函"
					}else{
						return "竞争性磋商采购公告"
					}
					
				}
				
				else{
					if(row.noticeType==1){
						if(row.examType==1){
							return '后审邀请函'
						}else{
							return '预审邀请函'
						}
					}else{
						if(row.examType==1){
							return '后审公告'
						}else{
							return '预审公告'
						}
					}
					
				}
			}
		},
		{
			field: 'subDate',
			title: '提交日期',
			align: 'center',
			width: '180'
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
			events: supplementAudit,
			formatter: function(value, row, index) {
				if(row.checkState == "2" || row.checkState == "3") {
					return "<button type='button' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				} else {
					return "<button type='button' class='btn btn-xs btn-primary audit'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>审核</button>";
				}
			}
		}
	]
});