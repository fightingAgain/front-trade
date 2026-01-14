 var urlPurchaseList = config.bidhost + '/ProjectSupplementController/findSupplyPageList.do';
var delUrl = config.bidhost + '/ProjectSupplementController/deleteSupplySupplement.do'; //删除补充通知接口
var iframeWinAdd = "";
var tenderTypeCode;
var examTypeCode;
var changeCode;
//表格初始化
$(function() {
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {
		if(PAGEURL.split("?")[1].split("&")[0].split("$")[0].split("=")[0] == "tenderType") {
			tenderTypeCode = PAGEURL.split("?")[1].split("&")[0].split("=")[1];; //0是询比采购  6是单一来源采购	

		} else {
			tenderTypeCode = 0
		}
	} else {

		tenderTypeCode = 0;
	}
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
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
		'tenderType': 0,
		'enterpriseType': '02',
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
					return value + '<div class="text-danger">(重新采购)</div>';
				} else {
					return value;
				}

			}
		}, {
			field: 'title',
			title: '补充通知标题',
			align: 'left',
			width: '180'
		}, {
			field: 'purchaseExamType',
			title: '资格审查方式',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == 1) {
					return '资格后审';
				} else {
					return '资格预审';
				}

			}
		}, {
			field: 'noticeType',
			title: '项目类别',
			align: 'center',
			width: '80',
			formatter: function(value, row, index) {
				if(value == 1) {
					return '邀请函';
				} else {
					return '采购公告';
				}

			}
		}, {
			field: '',
			title: '操作',
			align: 'center',
			width: '140',
			formatter: function(value, row, index) {
				if(row.createType != undefined && row.createType == 1) {
					var Tdr = '<button class="btn-xs btn btn-primary" onclick=fileView(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
				} else {

					if(row.supplementState == 1) {
						var Tdr = '<button class="btn-xs btn btn-primary" onclick=fileView(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
					} else {
						var Tdr = '<button class="btn-xs btn btn-primary" onclick=editFile(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>';
							Tdr += '<button class="btn-xs btn btn-danger" onclick=delFile(\"' + index + '\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>';
					}
				}

				return Tdr;
			}
		}],
	})
};

function add_bao() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '补充通知',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: 'Auction/common/Agent/supplementNotice/model/supplementaryNoticeInfo.html',
		success: function(layero, index) {
			iframeWinAdd = layero.find('iframe')[0].contentWindow;

		}
	});
};
//查看文件
function fileView($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看补充通知',
		area: ['1000px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: 'Auction/common/Agent/supplementNotice/model/viewSupplementaryNotice.html?projectId='+rowData[$index].projectId+'&packageId='+rowData[$index].packageId+'&examType='+rowData[$index].examType+'&keyId='+rowData[$index].id,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			
		}
	});
};

//编辑文件
function editFile($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	if(rowData[$index].isStopCheck != undefined && rowData[$index].isStopCheck == 1) {
		top.layer.alert("温馨提示：该包件已项目失败！");
		return;
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '编辑补充通知',
		area: ['1000px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: 'Auction/common/Agent/supplementNotice/model/editSupplementaryNoticeInfo.html?projectId='+rowData[$index].projectId+'&packageId='+rowData[$index].packageId+'&examType='+rowData[$index].examType+'&keyId='+rowData[$index].id,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;			
		}
	});
};


/**
 * 删除补充通知  
 * by H 2020-10-15
 * @param {Object} $index  当前行索引值
 */
function delFile($index){
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.confirm("温馨提示：确定删除该条数据吗？", function() {
		$.ajax({
			url: delUrl, //查看 详细信息
			dataType: 'json',
			data:{
				id:rowData[$index].id						
			},
			success: function(data) {
			 	if(data.success){
			 		parent.layer.alert("温馨提示：删除成功");
			 	}else{
			 		parent.layer.alert("温馨提示："+data.message);
			 	}
			 	$('#table').bootstrapTable(('refresh'));
			},
			error:function(){
				top.layer.alert("温馨提示：请求失败")
			}
		});
	});
}
