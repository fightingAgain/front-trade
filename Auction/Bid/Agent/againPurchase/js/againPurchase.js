var urlPurchaseList = config.bidhost + '/ProjectPackageController/findProjectPackageNoticePageList.do';
var saveProjectPackage = config.bidhost + '/PurchaseController/startWorkflowAccep.do'; //添加包件的接口
var deletPackageUrl = config.bidhost + '/PurchaseController/deletePackage.do' //删除包件接口
var recallUrl = config.bidhost + '/WorkflowController/updateWorkflowCheckeState.do' //撤回

var addpackage = 'Auction/common/Agent/againPurchase/model/noticeInfo.html'; //后审的编辑页面
var viewpackage = 'Auction/common/Agent/Purchase/model/noticeView.html';
var iframeWinAdd = "";
var tenderTypeCode, isAgentCode, enterpriseType;
var examType;
var WORKFLOWTYPE = "xmgg";
//表格初始化
$(function() {
	initTable();

});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'packageName': $("#packageName").val(),
		'packageNum': $("#packageNum").val(),
		'packageState': $("#packageState").val(),
		'enterpriseType': '02',
		'tenderType': 0,
		'packageSource': 1
	}
};
// 搜索按钮触发事件
$("#btnSearch").click(function() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
	initTable()				
});
$("#packageState").change(function() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
	initTable()			
});

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlPurchaseList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'projectCode',
				title: '项目编号',
				align: 'left',
				width: '180'
			}, {
				field: 'projectName',
				title: '项目名称',
				align: 'left',
				width: '250'
			}, {
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '180'
			}, {
				field: 'packageName',
				title: '包件名称',
				width: '250'

			}, {
				field: 'examType',
				title: '资格审查方式',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					if(value == 0) {
						return '资格预审';
					} else {
						return '资格后审';
					}

				}
			}, {
				field: 'packageState',
				title: '审核状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(value == 0) {
						return '未审核';
					} else if(value == 1) {
						return '审核中';
					} else if(value == 2) {
						return '审核通过';
					} else if(value == 3) {
						return '审核未通过';
					} else if(value == 5) {
						return '待提交';
					}

				}
			}, {
				field: 'noticeState',
				title: '发布状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(row.packageState == 2) {
						if(value == 0) {
							return '<div class="text-danger">未发布</div>';
						} else if(value == 1) {
							return '<div class="text-success">已发布</div>';
						}
					} else {
						return '<div class="text-danger">未发布</div>';
					}
				}
			},
			{
				field: '',
				title: '操作',
				align: 'center',
				width: '180',
				formatter: function(value, row, index) {
					var Tdr = "";
					if(row.createType != undefined &&row.createType==1 ) {
						Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
					} else {

						if(row.packageState == 2) { //公告审核通过					
							Tdr += '<button class="btn-xs btn btn-primary"  onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>'
							if(row.noticeState == 0) { //公告未发布

								Tdr += '<button class="btn-xs btn btn-warning" onclick=recall(\"' +index + '\")><span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回</button>'
							}
						} else if(row.packageState == 1) { //审核中


							Tdr += '<button class="btn-xs btn btn-primary" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
							Tdr += '<button class="btn-xs btn btn-warning" onclick=recall(\"' + index + '\")><span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回</button>'
						} else if(row.packageState == 5 || row.packageState == 3) { //临时保存和审核不通过


							Tdr += '<button class="btn-xs btn btn-primary" onclick=edit_bao(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>'
							Tdr += '<button class="btn-xs btn btn-danger" onclick=deletPackage(\"' + index + '\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>'
						}
					}

					return Tdr
				}
			}
		],
	})
};
//查看包件
function viewbao($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看公告',
		area: ['1100px', '600px']
			//,btn: ['关闭']
			,
		maxmin: true //开启最大化最小化按钮
			,
		content: viewpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType='+rowData[$index].examType,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;			
		}
	});
};
//删除包件

function deletPackage($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('温馨提示：删除公告的同时，系统会删除其对应的采购文件、评审项。您确定要删除该公告？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		if(top.sysEnterpriseId){
			var arrlist = sysEnterpriseId.split(',');
			if(arrlist.indexOf(top.enterpriseId)!=-1){
				reDeposit(rowData)
			}
		}
		$.ajax({
			url: deletPackageUrl, //修改包件的接口
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {

				'id': rowData.id,
			},
			success: function(data) {
				if(data.success == true) {
					parent.layer.alert("删除成功");
					$('#table').bootstrapTable(('refresh'));
					
				} else {
					parent.layer.alert(data.message)
				}
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

}
//撤回

function recall($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('确定要撤回该公告', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {

				"businessId": rowData.id,
				'tenderType': 0,
				'checkType': 1,
				'projectPackage': 0

			},
			success: function(data) {
				if(data.success) {

					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
								
				} else {
					parent.layer.alert(data.message)
				}

			},
			error: function(data) {
				parent.layer.alert("撤回失败")
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

}
//添加
function add_bao() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择重新采购',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: 'Auction/common/Agent/againPurchase/model/add_project.html?tenderType=0&examType=0',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		}
	});
};
//编辑包件
function edit_bao($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据		
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '编辑公告',
		area: ['1200px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: addpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType='+rowData[$index].examType,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		}

	});
}

function reDeposit(rowData){
	$.ajax({
		url: config.bidhost+'/DepositDivertController/proPurchaseAgainRecall.do',
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": rowData.projectId,
			"packageId":rowData.id,
			'projectForm': 0,			
		},
		success: function(data) {
			
		},
	});
}