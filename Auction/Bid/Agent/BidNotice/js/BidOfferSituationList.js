var urlBidSituationList = top.config.bidhost + "/ProjectViewsController/findPagePurCase.do";
var examTypeCode;
if(PAGEURL.split("?")[1]!=undefined){	
	if(PAGEURL.split("?")[1].split("=")[0]=="examType"){
		examTypeCode= PAGEURL.split("?")[1].split("=")[1];
	}else{
		examTypeCode=1
	}
}else{
		examTypeCode=0;
	
}


window.operateEvents = {	
	"click #checkDetail": function(e, value, row, index) {
		//保存对象目标文件对象		
		top.layer.open({
			type: 2,
			title: '报价情况',
			area: ['1100px','600px'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			closeBtn: 1,
			content: 'Auction/common/Agent/BidNotice/modal/BidOfferSituationInfo.html?examType='+examTypeCode+'&projectId='+row.projectId+'&id='+row.packageId,
			success:function(layero,index){    
	        	var iframeWind=layero.find('iframe')[0].contentWindow;
	        	//iframeWind.du(row);	        	
        	}
		});
	}
}

//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#BidSituationList').bootstrapTable('destroy');
		initTable()
	});
    $("#examType").change(function() {
		$('#BidSituationList').bootstrapTable('destroy');
		initTable()
	})
});

//设置查询条件
function getQueryParams(params) {
	var AuctionFile = {
		'pageSize': params.limit, //每页显示的数据条数
		'pageNumber': (params.offset / params.limit) + 1, //页码
		'tenderType':'0',
		'projectName': $("#projectName").val(), //项目名称
		'projectCode': $("#projectCode").val(), //项目编号
		'packageName': $("#packageName").val(),
		'packageNum': $("#packageNum").val(),
		'enterpriseType':'02',
		'examType':examTypeCode
	};
	return AuctionFile;
}
function initTable(){
	$("#BidSituationList").bootstrapTable({
		url: urlBidSituationList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: getQueryParams, //查询条件参数
		striped: true,
		uniqueId: "projectId",
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#BidSituationList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#BidSituationList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
				formatter: function(value, row, index) {
					if(row.projectSource == 1) {
						var projectName = row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span>'
					} else {
						var projectName = row.projectName
					}
					return projectName
				}
			},
			{
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '200'
				
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
				field: 'checkEndDate',
				title: '评审开始时间',
				align: 'center',
				width: '150'
			},
			{
				field: 'offerState',
				title: '报价状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(value == "0") {
						return '<div>未开始</div>';
					} else if(value == "1") {
						return '<div class="text-success" >报价中</div>';
					}else if(value == "2") {
						return '<div class="text-danger">已结束</div>';
					}else if(value == "4") {
						return '<div class="text-danger">项目失败-已报价</div>';
					}else if(value == "5") {
						return '<div class="text-danger">项目失败-未报价</div>';
					}
				}
			},		
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '120',
				events: operateEvents,
				formatter: function(value, row, index) {
					return "<button id='checkDetail' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'></span>查看详情</button>"
				}
			}
		]
	});
	
}
