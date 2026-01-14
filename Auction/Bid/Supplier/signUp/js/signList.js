var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
//初始化
$(function() {
	initTable();
	$.ajax({
		url: findEnterpriseInfo,
		type: 'get',
		dataType: 'json',
		async: false,
		success: function(data) {
			sessionStorage.setItem('userName', data.data.enterpriseName); //邀请供应商的数据缓存  	   		
		}
	});
});
var findPackagePageList = config.bidhost + '/OfferController/findSignList.do';
var viewUrl = '0502/Supplier/signUp/model/signInfo.html';
var payUrl = '0502/Supplier/signUp/model/signInfo.html';

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
		pageNumber: 1, // table初始化时显示的页数
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
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
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					return row.projectName + '<span class="text-danger" style="font-weight: bold;">(重新采购)</span>'
				} else if(row.projectSource == 0) {
					return row.projectName
				}
			}
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left'
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '200',
		},{
			field: 'status',
			title: '报名状态',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
				if(value==3){
					return '<span class="text-success">已报名</span>';
					
				}else{
					if(row.auditTimeout==1){
						return '<span style="color:red">已过期-未报名</span>';
					}else{
						return '<span style="color:red">未报名</span>';
					}
				}
			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '140',
			formatter: function(value, row, index) {
				if(row.status!= 3) {
					if(row.auditTimeout==1){
						var s = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=view(\"' + row.projectId + '\",\"' + row.id+ '\",' + index + ')>查看</a>';
					    
					    return s;
						
					}else{
						var review = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=sign(' + index + ')>报名</a>';
						
						return review;
					}
										
				} else {
					var view = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=view(\"' + row.projectId + '\",\"' + row.id+ '\",' + index + ')>查看</a>';
					return view;
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
		'enterpriseType': 1,
		'tenderType': 0,
		'isOffer': $('#search_1').val(),
		'projectName': $('#search_3').val(), // 请求时向服务端传递的参数
	};
};
// 搜索按钮触发事件
$(function() {
	$("#eventquery").click(function() {
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！

	});
});

function selectChange() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
}

function view(uid, packageId,$index) {	
	var rowData = $('#table').bootstrapTable('getData'); //
	sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index])); //获取当前选择行的数据，并缓存	
	sessionStorage.setItem('purchaseaDataId', JSON.stringify(rowData[$index].projectId)); //获取当前选择行的数据，并缓存	
	parent.layer.open({
		type: 2 ,//此处以iframe举例,
		title:'查看',
		area: ['80%', '80%'],
		content: viewUrl + '?key=' + uid + '&kid=' + packageId,
		btn: [ '确定'],//确定按钮												
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			if(rowData[$index].auditTimeout==0){
				iframeWin.fileDataF()
			}			
			parent.layer.close(index);
		}
	});
}

function sign($index) {
	var rowData = $('#table').bootstrapTable('getData'); //
	sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index])); //获取当前选择行的数据，并缓存	
	sessionStorage.setItem('purchaseaDataId', JSON.stringify(rowData[$index].projectId)); //获取当前选择行的数据，并缓存	
	var auditTimeout = rowData[$index].auditTimeout; //判断是否报价截止
	var noticeFresh = rowData[$index].noticeFresh; //判断公告是否开始
	var uid = rowData[$index].projectId; //项目Id
	var packageId = rowData[$index].id; //包件ID	
	var subDate = rowData[$index].requestDate; //创建时间
	sessionStorage.setItem('subDate', subDate); 
	if(auditTimeout == 1) {
		parent.layer.alert("已过报名截止时间，无法报名");
		return
	};
	if(noticeFresh == 0) {
		parent.layer.alert("公告未开始，无法报名");
		return
	};
	//报价前，生成订单，提示支付
	$.ajax({
		type: "post",
		url: config.bidhost + "/OrderController/isNotPayOrder.do",
		data: {
			projectId: uid,
			packId: packageId,
			prefixOrder:orderSoruc.sys,
		},
		async: true,
		success: function(data) {
			if(data.success) {				
				parent.layer.open({
					type: 2, //此处以iframe举例						
					title:'报名',
					area: ['80%', '80%'],
					content: payUrl + '?key=' + uid + '&kid=' + packageId,
					btn: ['确定', '关闭'],//确定按钮												
					yes: function(index, layero) {
						var iframeWin = layero.find('iframe')[0].contentWindow;												
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						parent.layer.close(index);
					},
					btn2: function(index, layero) {
						var iframeWins = layero.find('iframe')[0].contentWindow;						
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					}
				});
			} else {
				//top.layer.alert("本包件有其他费用，请前往我的订单完成付费后，再进行报价！");
				/*if(data.message == '有未支付的订单') {
					top.layer.confirm("您有未支付的订单,确定前往支付？", function() {
						$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
							$('#tenderType').val('0');
							$('#status').val('0');
						});
						top.layer.closeAll();
					});
				}*/
				
				if(data.message != "系统异常"){
					top.layer.confirm("温馨提示：感谢参与该项目的采购，您需要先支付"+data.message+"费用，是否现在支付？", function() {
						$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
							$('#tenderType').val('0');
							$('#status').val('0');
						});
						top.layer.closeAll();
					});
				}else{
					top.layer.alert(data.message);
				}
			}
		}
	});
};