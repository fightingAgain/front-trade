var urlProjectCheckList = top.config.AuctionHost + '/ProjectViewsController/findProjectCheckList.do'; //结果公式分页地址

$(function() {
	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});
	//两个下拉框事件
	$("#itemState,#tenderType").change(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});
});

window.bidNoticeAudit = {
	"click .detailed": function(e, value, row, index) { //查看
		sessionStorage.setItem("BidNotice", JSON.stringify(row)); //保存选中行数据
		var content = "";
		switch(row.tenderType) {
			case 0:
				content = 'bidPrice/ProjectCheck/modal/BidResultCheckInfo.html?key=' + row.id + '&edittype=detailed'+ '&purExamType='+row.purExamType+'&tenderTypeCode='+row.tenderType;
				break;
			case 6: //单一来源采购
				content = 'bidPrice/ProjectCheck/modal/BidResultCheckInfo.html?key=' + row.id + '&edittype=detailed'+ '&purExamType='+row.purExamType+'&tenderTypeCode='+row.tenderType;
				break;
			case 1:
				content = 'bidPrice/ProjectCheck/modal/AuctionResultCheckInfo.html?key=' + row.id + '&edittype=detailed';
				break;
			case 2:
				content = 'bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=detailed';
				break;
			case 12: //竞争性谈判采购
				content = 'bidPrice/ProjectCheck/modal/JtBidResultCheckInfo.html?key=' + row.id + '&edittype=detailed'+ '&purExamType='+row.purExamType+'&tenderTypeCode=12';
				break;
			case 13: //竞争性谈判采购
				content = 'bidPrice/ProjectCheck/modal/JcBidResultCheckInfo.html?key=' + row.id + '&edittype=detailed'+ '&purExamType='+row.purExamType+'&tenderTypeCode=13';
				break;	
		}

		top.layer.open({
			type: 2,
			area: ["1000px", "600px"],
			maxmin: false,
			resize: false,
			title: "查看",
			content: content
		});
	},
	"click .audit": function(e, value, row, index) {
		sessionStorage.setItem("BidNotice", JSON.stringify(row)); //保存选中行数据
		var content = '';
		switch(row.tenderType) {
			case 0:
			case 6: //单一来源采购
				content = 'bidPrice/ProjectCheck/modal/BidResultCheckInfo.html?key=' + row.id + '&edittype=audit'+ '&purExamType='+row.purExamType;
				break;
			case 1:
				content = 'bidPrice/ProjectCheck/modal/AuctionResultCheckInfo.html?key=' + row.id + '&edittype=audit';
				break;
			case 2:
				content = 'bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=audit';
				break;
			case 12: //竞争性谈判采购
				content = 'bidPrice/ProjectCheck/modal/JtBidResultCheckInfo.html?key=' + row.id + '&edittype=audit'+ '&purExamType='+row.purExamType+'&tenderTypeCode=12';
				break;
			case 13: //竞争性谈判采购
				content = 'bidPrice/ProjectCheck/modal/JcBidResultCheckInfo.html?key=' + row.id + '&edittype=audit'+ '&purExamType='+row.purExamType+'&tenderTypeCode=13';
				break;	
		}
		top.layer.open({
			type: 2,
			area: ["1000px", "600px"],
			maxmin: false,
			resize: false,
			title: "审核",
			content: content,
		});
	}
}

//设置查询参数
function queryParams(params) {
	var para = {
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		workflowType: "jgtzs",
		projectState: $("#itemState").val(),
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val()
	};
	//项目类型不为空
	if($("#tenderType").val() != "")
		para.tenderType = $("#tenderType").val();
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
			field: 'tenderTypeName',
			title: '项目类型',
			align: 'left',
			formatter:function(value, row, index){
				if(row.tenderTypeName=="竞卖采购"){
					return "竞卖"
				}else{
					return row.tenderTypeName
				}
			}
			
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
			field: 'subDate',
			title: '提交日期',
			align: 'center',
			width: '180'
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '140',
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
			title: '操作',
			align: 'center',
			width: '120',
			events: bidNoticeAudit,
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