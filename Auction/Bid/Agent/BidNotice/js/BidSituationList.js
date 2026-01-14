var urlBidSituationList = top.config.bidhost + "/ProjectViewsController/findPagePurCase.do";
var tenderTypeCode;
var examTypeCode;
var shopType;
//查询按钮
$(function() {
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

//var urlBidSituationList = top.config.bidhost + "/OfferController/findPackagePageList.do"; 
window.operateEvents = {
	
	"click #checkDetail": function(e, value, row, index) {
		if(tenderTypeCode==0){
			if(examTypeCode==0){
				var title="资格预审文件递交情况"
			}else{
				var title="询比采购报价文件递交情况"
			}
		}else{
			var title="单一来源采购报价文件递交情况"
		}
		//保存对象目标文件对象		
		top.layer.open({
			type: 2,
			title: title,
			area: ['70%','70%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			closeBtn: 1,
			content: 'Auction/common/Agent/BidNotice/modal/BidSituationInfo.html?examType='+examTypeCode+'&tenderType='+tenderTypeCode+'&projectId='+row.projectId+'&id='+row.packageId,
			success:function(layero,index){    
	        	var iframeWind=layero.find('iframe')[0].contentWindow;
	        	//iframeWind.du(row);	        	
        	}
		});
	}
}



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
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
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

