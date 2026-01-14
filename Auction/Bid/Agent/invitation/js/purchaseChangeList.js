var urlPurchaseList = config.bidhost + '/ProjectSupplementController/findProjectSupplementPageList.do';

var addpackage = 'Auction/common/Agent/invitation/model/purchaseChangeInfo.html';
var editpackage = 'Auction/common/Agent/invitation/model/purchaseChangeEdit.html';
var viewpackage = 'Auction/common/Agent/invitation/model/noticeChangeView.html';
var iframeWinAdd = "";
var examTypeCode = 1;
var WORKFLOWTYPE = "xmgg";
//表格初始化
$(function() {
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {
		if(PAGEURL.split("?")[1].split("=")[0] == "tenderType") { //单一
			examTypeCode = 1;
			tenderTypeCode = 6;
		}
	} else {
		examTypeCode = 1;
		tenderTypeCode = 0;
	}
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
	$("#packageState").change(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
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
		'checkState': $("#packageState").val(),
		'projectSupplementType': 1,
		'enterpriseType': '02',
		'tenderType': 0,
	}
};


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
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
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
			}, {
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '180'
			}, {
				field: 'packageName',
				title: '包件名称',
				formatter: function(value, row, index) {
					if(row.packageSource == 1) {
						return value + '<span class="text-danger">(重新采购)</span>';
					} else {
						return value;
					}

				}
			}, {
				field: 'title',
				title: '变更次数',
				align: 'left',
			}, {
				field: 'purchaseExamType',
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
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(value == 0) {
						return '未审核';
					} else if(value == 1) {
						return '审核中';
					} else if(value == 2) {
						return '<div class="text-success" style="font-weight: bold;">审核通过</div>';
					} else if(value == 3) {
						return '<div class="text-danger" style="font-weight: bold;">审核未通过</div>';
					}
				}
			},
			{
				field: '',
				title: '操作',
				align: 'center',
				width: '90',
				formatter: function(value, row, index) {
					var Tdr = "";
					if(row.createType != undefined && row.createType == 1) {
						Tdr = '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>'
					} else {
						if(row.checkState == 1 || row.checkState == 2) {
							Tdr = '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=viewbao(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>'
						} else {
							Tdr = '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=eidtbao(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</a>'
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
		title: '查看邀请函变更',
		area: ['1100px', '600px'],
		// btn: ['关闭'],
		maxmin: true //开启最大化最小化按钮
			,
		resize: false,
		content: viewpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].packageId+'&examType='+rowData[$index].examType+'&keyId='+rowData[$index].id+'&purchaseExamType='+rowData[$index].purchaseExamType,
		success: function(layero, index) {
			iframeWinAdd = layero.find('iframe')[0].contentWindow;
			

		},
		yes: function(index, layero) {
			parent.layer.close(index);
		}

	});
};

function eidtbao($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	if(rowData[$index].isStopCheck != undefined && rowData[$index].isStopCheck == 1) {
		top.layer.alert("温馨提示：该包件已项目失败！");
		return;
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '编辑邀请函变更',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		resize: false,
		content: editpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].packageId+'&examType='+rowData[$index].examType+'&keyId='+rowData[$index].id,
		success: function(layero, index) {
			iframeWinAdd = layero.find('iframe')[0].contentWindow;
			
		},
	});
};
//编辑包件
//添加
function add_bao() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '邀请函变更',
		area: ['1100px', '600px'],
		content: addpackage + '?tenderTypeCodes=0'
			//确定按钮
			,
		success: function(layero, index) {
			iframeWinAdd = layero.find('iframe')[0].contentWindow;
		}
	});
};