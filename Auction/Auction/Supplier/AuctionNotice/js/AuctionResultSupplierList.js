var urlBidResultList = top.config.AuctionHost + "/ProjectBidResultController/findProjectBidResult.do"; //竞卖结果通知

window.operateEvents = { //添加一个按钮对应的事件
	
	"click #btnShow": function(e, value, row, index) {	
		if(row.pdfUrl){
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['100%', '100%'],
				// maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'bidPrice/Public/model/BidResultView.html',
				success: function(layero, index) {
					var body = parent.layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.passMessage(row);
				}
			});
			// previewPdf(row.pdfUrl);
		}else{
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				// maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'Auction/Auction/Supplier/AuctionNotice/modal/newViewResult.html',
				success: function(layero, index) {
					var body = parent.layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(row,"views");
				}
			});
		}	
		
	},	
}

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	
	return [
		'<button type="button" id="btnShow" class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查 看</button>',
	].join("")
	

}


//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#BidResultList').bootstrapTable('destroy');
		initTable()
	});

	$("select").change(function() {
		$('#BidResultList').bootstrapTable('destroy');
		initTable()
	})

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
		//resultType: $("#resultType").val(), //通知类型
		isBid:$("#resultType").val(),
		enterpriseType: '06', //0为采购人，1为供应商
		tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖
	};
	return QueryParams;
}
function initTable(){
	$("#BidResultList").bootstrapTable({
		url: urlBidResultList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		clickToSelect: true, //是否启用点击选中行
		pageList: [10, 15,20,25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
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
						var pageSize = $('#BidResultList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#BidResultList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
						}else if(row.projectSource==0){
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
						}
						
					}else{
						if(row.projectSource==1){
							return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span>'
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
					field: 'isBid',
					title: '通知类型',
					align: 'center',
					width: '120',
					formatter: function(value, row, index) {
						switch(value) {
							case 0:
								return "<span style='color: green;'>中选通知</span>";
								break;
							case 1:
								return "<span style='color: red;'>未中选通知</span>";
								break;
						}
					}
				},
				{
					field: 'action',
					title: '操作',
					align: 'center',
					width: '140',
					formatter: AddFunction, //表格中添加按钮
					events: operateEvents, //给按钮注册事件
				},
	
			]
		]
	});
}
