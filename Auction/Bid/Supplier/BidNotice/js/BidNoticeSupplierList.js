var urlBidNoticeList = top.config.bidhost + "/BidNoticeController/pageBidNotice.do"; //询比采购结果通知 供应商
var tenderTypeCode;
var examTypeCode
if(PAGEURL.split("?")[1]!=undefined){	
	if(PAGEURL.split("?")[1].split("=")[0]=="examType"){
		tenderTypeCode =0; //0是询比采购  6是单一来源采购	
		examTypeCode= PAGEURL.split("?")[1].split("=")[1];
	}else{
		tenderTypeCode=PAGEURL.split("?")[1].split("=")[1];
		examTypeCode=1
	}

}else{
		tenderTypeCode=0;
		examTypeCode=0;
}
sessionStorage.setItem('tenderTypeCode', tenderTypeCode);//0是询比采购  6是单一来源采购，并缓存
sessionStorage.setItem('examType', examTypeCode);//0是询比采购  6是单一来源采购，并缓存	
function checkDetail(packageId,examType, type) {
	var row = $("#BidNoticeSupplierList").bootstrapTable('getRowByUniqueId', packageId);
	sessionStorage.setItem("BidNotice", JSON.stringify(row));
	top.layer.open({
		type: 2,
		title: "查看询比采购结果公示",
		area: ['900px', '620px'],
		// maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/common/Supplier/BidNotice/modal/BidNoticeView.html?type=view'+'&examType='+examType+'&enterpriseType=06',
	});
}

//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#BidNoticeSupplierList').bootstrapTable('destroy');
		initTable()
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
		tenderType: tenderTypeCode, //0为询比采购，1为竞价采购，2为竞卖
		examType:examTypeCode

	};
	return QueryParams;
}
function initTable(){
	$("#BidNoticeSupplierList").bootstrapTable({
		url: urlBidNoticeList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		clickToSelect: true, //是否启用点击选中行
		sidePagination: 'server', // 服务端分页
		silent: true, // 必须设置刷新事件
		queryParams: getQueryParams, //查询条件参数
		classes: 'table table-bordered', // Class样式
		striped: true,
		uniqueId: "packageId",
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#BidNoticeSupplierList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#BidNoticeSupplierList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
				align: 'left'
			},
			{
				field: 'packageName',
				title: '包件名称',
				align: 'left',
				formatter:function(value, row, index){
					if(row.packageSource==1){
						return value+'<span class="text-danger">(重新采购)</span>';
					}else{
						return value;
					}
					
				}
			},
			{
				field: 'openStartDate',
				title: '公示开始时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'opetEndDate',
				title: '公示截止时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'examType',
				title: '公示类型',
				align: 'center',
				width: '180',
				formatter: function(value, row, index) {
					if(row.examType == 0){
						return "预审公示";
					}else{
						return "评审公示";
					}
				}
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '140',
				formatter: function(value, row, index) {
					return "<button onclick='checkDetail(\"" + row.packageId + "\",\"" + row.examType + "\",\"view\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
				}
			}
		]
	});
}
