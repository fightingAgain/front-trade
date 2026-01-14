var checkboxed = "";
var projectend = "";
var tenderTypeCode;
var examTypeCode;
var saveProjectPackage = config.bidhost + '/PurchaseController/updateProjectPackage.do'; //添加包件的接口
//初始化
$(function () {
	if (PAGEURL.split("?")[1] != undefined) {
		if (PAGEURL.split("?")[1].split("=")[0] == "examType") {
			tenderTypeCode = 0; //0是询比采购  6是单一来源采购	
			examTypeCode = PAGEURL.split("?")[1].split("=")[1];
		} else {
			tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];
			examTypeCode = 1
		}

	} else {
		tenderTypeCode = 0;
		examTypeCode = 0;
	}

	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function () {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();
	});
});

/// 表格初始化
var deletProjectUrl = config.bidhost + '/PurchaseController/deleteProject.do' //删除项目接口
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人的信息

var updateChenkUrl = config.bidhost + '/PackageCheckListController/update.do' //评审项修改
function initTable() {
	var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.bidhost + '/ProjectPackageController/findNotEndProjectPackage.do', // 请求url		
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
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		height: top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function (row) {
			checkboxed = row.id;
			projectend = row.project.projectState;

		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function (value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180',
		}, {
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			width: '250',
			formatter: function (value, row, index) {
				if (row.projectSource == 1) {
					var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span></div>';
				} else {
					var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '</div>';
				}
				return projectName;
			}
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180',
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			width: '250',
			formatter: function (value, row, index) {
				if (row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				if (value == 0) {
					return '资格预审';
				} else {
					return '资格后审';
				}

			}
		}, {
			field: 'checkPlan',
			title: '评审类型',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				if (examTypeCode == 0) {
					if (row.examCheckPlan == 0) return '合格制';
					if (row.examCheckPlan == 1) return '有限数量制';

				} else {
					if (value == 0) return '综合评分法';
					if (value == 1) return '最低评标价法';
					if (value == 2) return '经评审的最低价法(价格评分)';
					if (value == 3) return '最低投标价法';
					if (value == 5) return '经评审的最低投标价法';
				}
			}
		}, {
			field: 'historyCheckState',
			title: '审核状态',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				if (value == 0) {
					return '-';
				} else if (value == 1) {
					return '审核中';
				} else if (value == 2) {
					return '审核通过';
				} else if (value == 3) {
					return '审核不通过';
				}
			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function (value, row, index) {

				var State = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=edit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑' +
					'</button>'
				var audit = '<button  id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=audit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看' +
					'</button>'
				var view = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=view_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看' +
					'</button>'
				var update = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=update_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>变更' +
					'</button>'
				if (row.createType != undefined && row.createType == 1) {
					return '<div class="btn-group-xs">' + audit + '</div>';
				} else {
					if (row.examType == 1) {
						if (row.checkEndDate < nowSysDate) {
							if (row.checkResult == 1) {
								return '<div class="btn-group-xs">' + audit + '</div>';
							}
							if (row.changeType == 1) {
								if (row.historyCheckState == 1) {
									return '<div class="btn-group-xs">' + view + '</div>';
								} else if (row.historyCheckState == 3) {
									return '<div class="btn-group-xs">' + view + '</div><div class="btn-group-xs">' + update + '</div>';
								}
								return '<div class="btn-group-xs">' + audit + '</div><div class="btn-group-xs">' + update + '</div>';
							}
						} else {
							return '<div class="btn-group-xs">' + State + '</div>';
						}
					}
					if (row.isOperate == 0) {
						if (examTypeCode == 0 && row.isSubmitTimeOut == 1) { //预审  超过文件递交截止时间
							return '<div class="btn-group-xs">' + audit + '</div>';
						}
						return '<div class="btn-group-xs">' + State + '</div>';
					} else {
						return '<div class="btn-group-xs">' + audit + '</div>';
					}
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
		//'isEdit':1,	
		'tenderType': 0,
		'examType': examTypeCode,
		'enterpriseType': '04',
		//'packageState':2,
		'packageName': $('#search_2').val(), // 包件名称查询
		'projectName': $('#search_3').val(), // 项目名称查询
	};
};

function audit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var dataRow = rowData[$index]
	sessionStorage.setItem('packageInfo', JSON.stringify(dataRow)); //获取当前选择行的数据，并缓存	
	parent.layer.open({
		type: 2,
		title: '查看评审项',
		area: ['1100px', '650px'],
		maxmin: true //开启最大化最小化按钮
		,
		content: 'Auction/common/Purchase/packageCheck/model/packageCheckLookPSView.html?examType=' + examTypeCode + "&projectId=" + rowData[$index].projectId + '&packageId=' + rowData[$index].id + '&historyId=' + rowData[$index].historyId,
		success: function (layero, index) {
			var iframeWindl = layero.find('iframe')[0].contentWindow;

		}
		//确定按钮
		,
	});
}
//审核中查看
function view_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var dataRow = rowData[$index]
	sessionStorage.setItem('packageInfo', JSON.stringify(dataRow)); //获取当前选择行的数据，并缓存	
	parent.layer.open({
		type: 2,
		title: '查看评审项',
		area: ['1100px', '650px'],
		maxmin: true, //开启最大化最小化按钮
		content: 'Auction/common/Purchase/packageCheck/model/packageCheckPSView.html?examType=' + examTypeCode + "&projectId=" + rowData[$index].projectId + '&packageId=' + rowData[$index].id + '&bidHistoryCheckId=' + rowData[$index].historyId,
		success: function (layero, index) {
			var iframeWindl = layero.find('iframe')[0].contentWindow;

		}
		//确定按钮
		,
	});
}
function edit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var dataRow = rowData[$index]
	sessionStorage.setItem('packageInfo', JSON.stringify(dataRow)); //获取当前选择行的数据，并缓存	
	if (dataRow.encipherStatus == 1 && dataRow.sysFileState == 1) {
		if (dataRow.isOfferTimeOut == 0) {
			openCheckConfirmPop(function(changeKeys) {
				changeKeys = changeKeys.join(',');
				openPackageEditPop(changeKeys);
			});
		} else {
			// 已过报价截止时间，只允许变更评审项（画面已控制），也不用弹出该确认框。
			openPackageEditPop('ReviewItemChange');
		}
		function openPackageEditPop(changeKeys) {
			parent.layer.open({
				type: 2,
				title: '编辑评审项',
				area: ['1100px', '650px'],
				maxmin: true //开启最大化最小化按钮
				,
				id: 'packageclass',
				content: 'Auction/common/Purchase/packageCheck/model/packageCheckEdit.html?examType=' + examTypeCode + "&projectId=" + rowData[$index].projectId + '&packageId=' + rowData[$index].id + '&changeKeys=' + changeKeys,
				success: function (layero, index) {
					var iframeWindsl = layero.find('iframe')[0].contentWindow;
				},
			});
		}
	} else {
		parent.layer.open({
			type: 2,
			title: '编辑评审项',
			area: ['1100px', '650px'],
			maxmin: true //开启最大化最小化按钮
			,
			id: 'packageclass',
			content: 'Auction/common/Purchase/packageCheck/model/packageCheckEdit.html?examType=' + examTypeCode + "&projectId=" + rowData[$index].projectId + '&packageId=' + rowData[$index].id,
			success: function (layero, index) {
				var iframeWindsl = layero.find('iframe')[0].contentWindow;
			}
			//确定按钮
			,
	
		});
	}
}

//变更
function update_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var dataRow = rowData[$index]
	sessionStorage.setItem('packageInfo', JSON.stringify(dataRow)); //获取当前选择行的数据，并缓存	
	parent.layer.open({
		type: 2,
		title: '变更评审项',
		area: ['1100px', '650px'],
		maxmin: true //开启最大化最小化按钮
		,
		id: 'packageclass',
		content: 'Auction/common/Purchase/packageCheck/model/packageCheckUpdate.html?examType=' + examTypeCode + "&projectId=" + rowData[$index].projectId + '&packageId=' + rowData[$index].id + '&flagType=' + rowData[$index].historyFlagType + '&historyCheckState=' + rowData[$index].historyCheckState,
		success: function (layero, index) {
			var iframeWindsl = layero.find('iframe')[0].contentWindow;
		}
		//确定按钮
		,

	});
}

function openCheckConfirmPop(callback) {
	var checkList = [
		{
			label: '评审项变更',
			key: 'ReviewItemChange'
		}, {
			label: '清标项变更',
			key: 'ClearItemChange'
		}, {
			label: '报价文件目录变更',
			key: 'QuotationDirectoryChange'
		}
	]
	var ops = '';
	for (var i = 0; i < checkList.length; i++) {
		var checkItem = checkList[i];
		ops += '<div style="display: inline-block;margin-right: 12px;line-height:1;">'
		ops +=  '<input style="margin:0 2px 0 0;height: 14px;width: 14px;vertical-align: bottom;" type="checkbox" data-key="'+ checkItem.key +'" data-label="'+ checkItem.label +'" id="check_' + checkItem.key + '" value="' + checkItem.key + '" >'
		ops +=  '<label style="margin:0;" for="check_' + checkItem.key + '">' + checkItem.label + '</label>'
		ops += '</div>';
	}
	var style = 'width: 100%; text-align: center; display: inline-block; vertical-align: middle; padding: 32px 16px 0; overflow: hidden;'
	var content = '<div style="' + style + '">' + ops + '</div>';
	parent.layer.open({
		type: 1,
		title: '请选择变更内容',
		id: 'check-confirm-pop',
		area: ['420px', '180px'],
		content: content,
		btn: ['确定', '取消'],
		btn1: function(index, layero) {
			// 确定
			var checkedKeys = $(layero).find("input[type='checkbox']:checked").map(function() {
				return this.value;
			});
			if (checkedKeys.length == 0) {
				parent.layer.alert('请选择变更内容', {icon: 0});
				return;
			}
			parent.layer.close(index);
			if (callback) {
				callback(checkedKeys.toArray());
			}
		},
		btn2: function(index, layero) {
			parent.layer.close(index);
		}
	})
}