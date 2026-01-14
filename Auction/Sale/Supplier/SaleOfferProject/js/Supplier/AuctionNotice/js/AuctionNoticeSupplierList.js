var urlBidNoticeList = top.config.AuctionHost + "/BidNoticeController/pageBidNotice.do"; //询价采购结果通知 供应商

function checkDetail(packageId, type) {
	var row = $("#AuctionNoticeSupplierList").bootstrapTable('getRowByUniqueId', packageId);
	sessionStorage.setItem("AuctionNotice", JSON.stringify(row));
	top.layer.open({
		type: 2,
		title: "查看竞价采购结果公示",
		area: ['60%', '80%'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Supplier/AuctionNotice/modal/AuctionNoticeInfo.html?type=view'+"&tType=" + "supplier",
	});
}

//查询按钮
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#AuctionNoticeSupplierList').bootstrapTable('refresh');
	});
});

//设置查询条件
function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号	
		packageName: $("#packageName").val(),
		enterpriseType: '06', //0为采购人，1为供应商
		tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖

	};
	return QueryParams;
}

$("#AuctionNoticeSupplierList").bootstrapTable({
	url: urlBidNoticeList,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 10, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	clickToSelect: true, //是否启用点击选中行
	pageList: [10, 15,20,25],
	clickToSelect: true, //是否启用点击选中行
	sidePagination: 'server', // 服务端分页
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	classes: 'table table-bordered', // Class样式
	striped: true,
	uniqueId: "packageId",
	columns: [
		[{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#AuctionNoticeSupplierList').bootstrapTable('getOptions').pageSize; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#AuctionNoticeSupplierList').bootstrapTable('getOptions').pageNumber; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectCode',
				title: '采购项目编号',
				align: 'left',
				width: '180'
			},
			{
				field: 'projectName',
				title: '采购项目名称',
				align: 'left',
				formatter:function(value, row, index){
				    if(row.isPublic>1){
				    	if(row.projectSource==1){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞卖)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}else if(row.projectSource==0){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}
				    }else{
				    	if(row.projectSource==1){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞卖)</span>'
				    	}else if(row.projectSource==0){
				    		return row.projectName
				    	}			    	
				    }
				}
			},
			{
				field: 'packageName',
				title: '包件名称',
				align: 'left'
			},
			{
				field: 'openStartDate',
				title: '公示开始时间',
				align: 'center',
				width: '160'
			},
			{
				field: 'opetEndDate',
				title: '公示截止时间',
				align: 'center',
				width: '160'
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
				},
			},

		]
	]
});