var checkPackageItem=config.bidhost +'/CheckController/checkPackageListItem.do' //评审项查询
var findPackagePageList = config.bidhost + '/OfferController/findOfferList.do';
// var viewsUrl ='Auction/common/Supplier/Offer/model/viewOffer.html';
var viewUrl = 'Auction/common/Supplier/Offer/model/purchaseOffer.html';
var caViewUrl = 'Auction/common/Supplier/Offer/model/purchaseCaOffer.html';
//初始化
$(function() {
	initTable();
	$("#eventquery").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();
	});
});
function selectChange() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
	initTable();
}
/// 表格初始化
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: findPackagePageList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		pageNumber: 1, // table初始化时显示的页数
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		height:top.tableHeight,
		toolbar:'#toolbar',
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize||15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber||1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width:'180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			width:'250'
			
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width:'180'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			width:'250',
			formatter: function(value, row, index) {
				if(row.isPublic > 1) {
					if(row.packageSource == 1) {
						return row.packageName + '<span class="text-danger" style="font-weight: bold;">(重新采购)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
					} else if(row.projectSource == 0) {
						return row.packageName + '<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
					}

				} else {
					if(row.packageSource == 1) {
						return row.packageName + '<span class="text-danger" style="font-weight: bold;">(重新采购)</span>'
					} else if(row.packageSource == 0) {
						return row.packageName
					}
				}
			}
		}, 
		// {
		// 	field: 'enterpriseName',
		// 	title: '采购人',
		// 	align: 'left'
		// }, 
		{
			field: 'offerEndDate',
			title: '报价截止时间',
			align: 'center',
			width: '180'
		}, {
			field: 'isOffer',
			title: '报价状态',
			align: 'center',
			width: '150',
			formatter:function(value, row, index){
				if(value=='未报价'){
					if(row.auditTimeout==1){
						return '<span style="color:red">已过期-未报价</span>';
					}else{
						return '<span style="color:red">未报价</span>';
					}
				}else if(value=='已报价'){
					return '<span class="text-success">已报价</span>';
				}else{
					return '<span style="color:red">'+value+'</span>';
				}
			}
		}, {
			field: 'isAccept',
			title: '邀请状态',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
					if(row.isAccept == 0) {
						return '<div class="text-success" style="font-weight: bold;">接受</div>'
					} else if(row.isAccept == 1) {
						return '<div class="text-success" style="font-weight: bold;">拒绝</div>'
					} else {
						if(row.isPublic > 1){ 
						return '<div>未确认</div>'
						}else{
						return '<div></div>'	
						}
					}

			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '140',
			formatter: function(value, row, index) {
				if(row.isOffer == "未报价") {
					if(row.auditTimeout==1){
						var views = '<button class="btn-xs btn btn-primary" onclick=view(\"' + row.projectId + '\",\"' + row.packageId + '\",2,'+row.isAgent+','+ index + ')><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
					    
					    return views
						
					}else{
						var review = '<button class="btn-xs btn btn-primary" onclick=paydds(' + index + ')><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>报价</button>';
						
						return review;
					}
				} else {
					if(row.isOffer.indexOf('项目失败')){
						var view = '<button class="btn-xs btn btn-primary" onclick=view(\"' + row.projectId + '\",\"' + row.packageId + '\",2,'+row.isAgent+','+ index + ')><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
					}else{
						var view = '<button class="btn-xs btn btn-primary" onclick=view(\"' + row.projectId + '\",\"' + row.packageId + '\",1,'+row.isAgent+','+ index + ')><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
					}
					
					return view
				}
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'enterpriseType': '06',
		'isOffer': $('#search_1').val(),
		'projectName': $('#search_3').val(), // 请求时向服务端传递的参数
		'packageName': $('#packageName').val(), // 请求时向服务端传递的参数
	};
};



function view(uid, packageId, $Type, $isAgent, index) {
	var tableData = $('#table').bootstrapTable('getData');
	currentRow = tableData[index];
	isAgent = $isAgent; //是否代理
	var iframeUrl = viewUrl;
	if (currentRow && currentRow.encipherStatus == 1) {
		iframeUrl = caViewUrl;
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title:'查看询比采购',
		area: ['100%','100%'],
		content: iframeUrl + '?key=' + uid + '&kid=' + packageId+'&type=' + $Type + '&isAgent='+isAgent
	});
}
var examTypes;
var purProjectId;
var purPackageId;
var isAgent;
var currentRow = null;
function paydds($index) {
	var rowData = $('#table').bootstrapTable('getData'); //
	var noticeFresh = rowData[$index].noticeFresh; //判断公告是否开始
	currentRow = rowData[$index];
	purProjectId = rowData[$index].projectId; //项目Id
	purPackageId = rowData[$index].packageId; //包件ID	
	isAgent = rowData[$index].isAgent; //是否代理	
	examTypes=rowData[$index].examType 
	if(noticeFresh == 0) {
		parent.layer.alert("公告未开始，无法报价");
		return
	};
    newValidate(null,purProjectId,purPackageId,rowData[$index].examType,3);	
};
function openOrder(flag,packageId,uid){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/OrderController/isPayOrderInfo.do",
		data: {
			projectId: uid,
			packId: packageId,
			prefixOrder:orderSoruc.sys,
			moneyType:'采购文件费',
		},
		async: false,
		success: function(data) {
			if(!data.success) {					
				top.layer.confirm("温馨提示:感谢参与该项目的采购，您需要先支付采购文件费费用。请确认支付并下载文件", function(index) {
					//pay(data.message,'Ordertable',callbackPayfd);
					payMoney(packageId,data.message,'table',callbackPayfd);
					parent.layer.close(index)
				});
				
			}else{
				var iframeUrl = viewUrl;
				if (currentRow && currentRow.encipherStatus == 1) {
					iframeUrl = caViewUrl;
				}
				parent.layer.open({
					type: 2 //此处以iframe举例
						,
					title: '询比采购报价',
					area: ['100%', '100%'],
					content: iframeUrl + '?key=' + purProjectId + '&kid=' + purPackageId+'&type=' + 0 + '&isAgent='+isAgent,
				});
			}
		}
	})
}
function callbackPayfd(status,orderId){
	var iframeUrl = viewUrl;
	if (currentRow && currentRow.encipherStatus == 1) {
		iframeUrl = caViewUrl;
	}
	if(status==3){		
		parent.layer.open({
			type: 2 //此处以iframe举例
				,
			title: '询比采购报价',
			area: ['100%', '100%'],
			content: iframeUrl + '?key=' + purProjectId + '&kid=' + purPackageId+'&type=' + 0 + '&isAgent='+isAgent,
		});
	}	
}