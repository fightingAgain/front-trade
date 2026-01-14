var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
var checkPackageItem=config.bidhost +'/CheckController/checkPackageListItem.do' //评审项查询
//初始化
$(function() {
	initTable();
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();
	});
});
var findPackagePageList = config.bidhost + '/OfferController/findSignPageList.do';
var viewUrl = 'Auction/common/Supplier/signUp/model/signInfo.html?type=view';
var addUrl = 'Auction/common/Supplier/signUp/model/signInfo.html?type=add';
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
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '200',
		},{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',			
		},{
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
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '200',
		}, {
			field: '',
			title: '递交状态',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
				if(row.checkCount > 0 && row.subCount > 0){
					if(row.checkCount == row.subCount){
						return '<span class="text-success">已递交</span>';
					}
					if(row.checkCount > row.subCount){
						return '<span class="text-success">已保存</span>';
					}
					
				}
				if((row.checkCount > 0 && row.subCount == 0) || (row.subCount >= 0 && row.checkCount == 0)){
					return '<span style="color:red">未递交</span>';
				}
			}
		}, {
			field: 'submitExamFileEndDate',
			title: '预审文件递交截止时间',
			align: 'center',
			width: '180'
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {				
				if(row.submitTimeout == 0) {
					if(row.checkCount > 0 && row.subCount > 0){
						if(row.checkCount == row.subCount){
							var view = '<button type="button" class="btn-xs btn btn-primary" onclick=view(' + index + ','+0+')><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
						}
						if(row.checkCount > row.subCount){
							var view = '<button type="button" class="btn-xs btn btn-primary" onclick=view(' + index + ','+1+')><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>';
						}
						
					}
					if((row.checkCount > 0 && row.subCount == 0) || (row.subCount >= 0 && row.checkCount == 0)){
						var view = '<button type="button" class="btn-xs btn btn-primary" onclick=view(' + index + ','+1+')><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>';
					}
						return view;
				}else{
					var view = '<button type="button" class="btn-xs btn btn-primary" onclick=view(' + index + ','+0+')><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
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
		'enterpriseType': '06',
		'isOffer': 1,
		'examType': 0,
		'projectName': $('#projectName').val(), // 请求时向服务端传递的参数
		'projectCode': $('#projectCode').val(),
		'packageName': $('#packageName').val(),
		'packageNum': $('#packageNum').val()
	};
};
function selectChange() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
	initTable();
}

var msg;
var submitTimeout;
var checkTimeout;
var projectId; //项目Id
var packageId; //包件ID
function view($index,flag) {	
	var rowData = $('#table').bootstrapTable('getData');
	projectId = rowData[$index].projectId; //项目Id
	packageId = rowData[$index].id; //包件ID
	submitTimeout=rowData[$index].submitTimeout;
	checkTimeout=rowData[$index].checkTimeout
	if(flag==1){
		newValidate(flag,projectId,packageId,rowData[$index].examType,2);	
	}else{
		parent.layer.open({
			type: 2 ,//此处以iframe举例,
			title:'递交资格预审申请文件',
			area: ['1100px', '650px'],
			resize:false,
			content: viewUrl+'&submitTimeout='+submitTimeout+'&projectId='+projectId+'&packageId='+packageId+'&checkTimeout='+checkTimeout,
		});
	}
		
}
function openOrder(flag,packageId,projectId,examTypes){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/OrderController/isPayOrderInfo.do",
		data: {
			projectId: projectId,
			packId: packageId,
			prefixOrder:orderSoruc.sys,
			moneyType:'资格预审文件费',
		},
		async: false,
		success: function(data) {
			if(!data.success) {					
				top.layer.confirm("温馨提示:感谢参与该项目的采购，您需要先支付资格预审文件费。请确认支付并下载文件", function(index) {
					payMoney(packageId,data.message,'table',callbackPaytt);
					parent.layer.close(index)
				});
				
			}else{
				parent.layer.open({
					type: 2 ,//此处以iframe举例,
					title:'递交资格预审申请文件',
					area: ['1100px', '650px'],
					resize:false,
					content: addUrl+'&submitTimeout='+submitTimeout+'&projectId='+projectId+'&packageId='+packageId+'&checkTimeout='+checkTimeout,
				});
			}
		}
	})
}
function callbackPaytt(status,orderId){
	if(status==3){		
		parent.layer.open({
			type: 2 ,//此处以iframe举例,
			title:'递交资格预审申请文件',
			area: ['1100px', '650px'],
			resize:false,
			content: addUrl+'&submitTimeout='+submitTimeout+'&projectId='+projectId+'&packageId='+packageId+'&checkTimeout='+checkTimeout,
		});
	}	
}
