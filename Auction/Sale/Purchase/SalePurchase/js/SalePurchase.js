var checkboxed = "";
var projectend = "";
var iframeWind = "";
//初始化
$(function () {
	sessionStorage.setItem('tenderTypeCode', 2); //0是询价采购  6是单一来源采购，并缓存	
	if (top.enterpriseNotice.isSale == 1) {
		$("#btn_add").show()
	} else {
		$("#btn_add").hide()
	}
	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function () {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();
	});
});
/// 表格初始化
var purchaseaddurl = 'Auction/Sale/Purchase/SalePurchase/model/addSale.html' //添加路径
var auditPurchase = 'Auction/Sale/Purchase/SalePurchase/model/auditPurchase.html' //审核路径
var editPurchase = 'Auction/Sale/Purchase/SalePurchase/model/edit_model.html' //编辑路径
var pageAuctionPurchase = config.AuctionHost + '/AuctionPurchaseController/pageAuctionPurchase.do';
var deletProjectUrl = config.AuctionHost + '/AuctionPurchaseController/deleteAuctionProject.do'
var recallUrl = config.AuctionHost + "/WorkflowController/updateAuctionXmggState.do" // 撤回项目的接口
var noticeStateUrl = config.AuctionHost + "/AuctionPurchaseController/updateNoticeState.do" //公告发布
var saveAuctionurl = config.AuctionHost + '/AuctionPurchaseController/saveAuctionPurchase.do';
var modelUrl = 'bidPrice/currencyControl/model/departmentModel.html'
var updateDeptMsg = config.AuctionHost + '/ProjectPackageController/updateDeptMsg.do';//采购部门维护接口
var parameter;
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: pageAuctionPurchase, // 请求url		
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
		height: top.tableHeight,
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
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
			field: 'project.projectCode',
			title: '竞卖项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'project.projectName',
			title: '竞卖项目名称',
			align: 'left',
			width: '250',
			formatter: function (value, row, index) {
				if (row.project.projectSource == 1) {
					var projectName = '<div style="white-space: normal;">' + (row.project.projectName || "") + '<span class="text-danger" style="font-weight:bold">(重新竞卖)</span></div>';
				} else {
					var projectName = '<div style="white-space: normal;">' + (row.project.projectName || "") + '</div>'
				}
				return projectName
			}
		}, {
			field: 'project.subDate',
			title: '创建时间',
			align: 'center',
			width: '160'
		}, {
			title: '发布时间',
			field: 'noticeStartDate',
			align: 'center',
			width: '160'
		}, {
			field: 'project.projectState',
			title: '审核状态',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				var State = ""
				if (row.project.projectState == 0) {
					State = "未审核";
					return State
				}
				if (row.project.projectState == 1) {
					State = "审核中";
					return State
				}
				if (row.project.projectState == 2) {
					State = "<div class='text-success' style='font-weight:bold'>审核通过</div>";
					return State
				} else if (row.project.projectState == 3) {
					State = "<div class='text-danger' style='font-weight:bold'>审核未通过</div>";
					return State
				}
			}
		}, {
			field: 'project.projectState',
			title: '发布状态',
			align: 'center',
			width: '100',
			formatter: function (value, row, index) {
				var State = ""
				if (row.project.projectState == 2) {
					if (row.noticeState == 1) {
						State = "<div class='text-success' style='font-weight:bold'>已发布</div>";
						return State
					} else {
						State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
						return State
					}
				} else {
					State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
					return State
				}

			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '240',
			events: {
				'click .purchaserDepartment': function (e, value, row, index) {
					//采购人编辑所属部门
					parameter = {
						projectId: row.projectId,
						departmentIDOld: row.purchaserDepartmentId,
						departmentNameOld: row.purchaserDepartmentName,
					}
					parent.layer.open({
						type: 2 //此处以iframe举例
						, title: '选择所属部门'
						, area: ['400px', '600px']
						, content: modelUrl
						, success: function (layero, index) {
							var iframeWind = layero.find('iframe')[0].contentWindow;
							iframeWind.employee(row.purchaserId, callEmployeeBack, parameter.departmentIDOld, false)
						},

					})
				}
			},
			formatter: function (value, row, index) {
				var recall = '<button id="btn_delete" type="button" class="btn-xs btn btn-warning" onclick=recall_btn(\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>撤回' +
					'</button>'
				var noticeState = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=noticeStateBtn(\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-check" aria-hidden="true"></span>发布' +
					'</button>'
				var State = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=edit_btn(\"' + index + '\",' + row.project.projectState + ')>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑' +
					'</button>'
				var audit = '<button id="btn_delete" type="button" class="btn-xs btn btn-primary" onclick=audit_btn(\"' + index + '\",\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看' +
					'</button>'
				var deletes = '<button id="btn_delete" type="button" class="btn-x btn btn-danger" onclick=deletes_btn(\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除' +
					'</button>'
				var purchaserDepartment = '<button class="btn-xs btn btn-primary purchaserDepartment"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>采购部门维护</button>'
				if (row.createType != undefined && row.createType == 1) {
					return '<div class="btn-group-xs">' + audit + '</div>';
				} else {
					if (row.project.isAgent == 1) {
						return '<div class="btn-group-xs">' + audit + '</div>';
					} else {
						if (row.project.projectState == 2) { //发布状态为审核通过
							if (row.noticeState == 0) { //未发布
								if (row.settingNotice == 1) { //手动发布
									return '<div class="btn-group-xs" >' + audit + noticeState + recall + '</div>';
								} else { //自动发布
									return '<div class="btn-group-xs">' + audit + recall + '</div>';
								}
							} else if (row.noticeState == 1) { //已发布
								return '<div class="btn-group-xs">' + audit + '</div>';
							}
						} else if (row.project.projectState == 1) {
							return '<div class="btn-group-xs">' + audit + recall + '</div>';
						} else {
							return '<div class="btn-group-xs">' + State + deletes + '</div>';
						}
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
		'enterpriseType': '04',
		'project.tenderType': 2,
		'project.isAgent': 0,
		//'project.projectState': $('#search_1').val(), // 请求时向服务端传递的参数
		'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数	
	}

};
function callEmployeeBack(dataTypeList) {
	var itemTypeId = [],//归属不部门Id
		itemTypeName = [];//归属部门名称  

	for (var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	var typeIdList = itemTypeId.join(","),//项目类型的ID
		typeNameList = itemTypeName.join(",");//项目类型的名字     
	var pare = {}
	for (var key in parameter) {
		pare[key] = parameter[key]
	}
	pare.roleType = 2;//1为代理机构部门，2采购人所属部门；
	pare.tenderType = 2;
	pare.departmentIDNew = typeIdList;
	pare.departmentNameNew = typeNameList;
	$.ajax({
		type: "post",
		url: updateDeptMsg,
		data: pare,
		dataType: "json",
		success: function (response) {
			if (response.success) {
				parent.layer.alert('修改成功');
				$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
			} else {
				parent.layer.alert(response.message)
			}
		}
	});
}
function deletes_btn(uid) {
	parent.layer.confirm('确定要删除该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		parent.layer.close(index);
		parent.layer.prompt({
			formType: 2,
			value: '',
			resize: false,
			maxmin: false,
			maxlength: 100,
			title: '请输入删除原因',
		}, function (value, index, elem) {
			parent.layer.close(index)
			$.ajax({
				url: deletProjectUrl,
				type: 'post',
				async: false,
				data: {
					"projectId": uid,
					"reason": value,
				},
				success: function (data) {
					console.log(data)
				},
				error: function (data) {
					parent.layer.alert("修改失败")
				}
			});
			setTimeout(function () {
				$('#table').bootstrapTable(('refresh'));
				$('#packageTalbe').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
			}, 200)
		});
	}, function (index) {
		parent.layer.close(index)
	});
}
//添加功能
function add_btn() {
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '添加竞卖公告',
		id: 'packageclassAdd',
		area: ['1100px', '600px'],
		maxmin: true,//开启最大化最小化按钮
		resize: false,
		content: purchaseaddurl,
		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
		}
	});
};
// 撤回功能
function recall_btn(id) {
	parent.layer.confirm('确定要撤回该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": id,
				'accepType ': 'xmgg'
			},
			success: function (data) {
				if (data.success) {
					parent.layer.alert("撤回成功!")
					setTimeout(function () {
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					parent.layer.alert(data.message)
				}
			},
			error: function (data) {
				parent.layer.alert("撤回失败")
			}
		});
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});

};
//发布公告功能
function noticeStateBtn(uid) {
	parent.layer.confirm('确定要发布该项目 ', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			url: noticeStateUrl,
			type: 'post',
			async: false,
			data: {
				"projectId": uid,
			},
			success: function (data) {
				setTimeout(function () {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
				}, 200)
				parent.layer.close(index);
			},
			error: function (data) {
				parent.layer.alert("发布失败")
			}
		});

	}, function (index) {
		parent.layer.close(index)
	});
};
//编辑功能
var groupCodedata;

function edit_btn($index, projectState) {

	var rowData = $('#table').bootstrapTable('getData');
	groupCodedata = rowData[$index].project.groupCode
	if (groupCodedata == null || groupCodedata == '' || groupCodedata == undefined) {
		if (projectState == 4) {
			editPurchase = 'Auction/Sale/Purchase/SalePurchase/model/addSale.html'
		}
		if (projectState == 5 || projectState == 3 || projectState == 0) {
			editPurchase = 'Auction/Sale/Purchase/SalePurchase/model/edit_model.html'
		}
	} else if ((groupCodedata != null || groupCodedata != '' || groupCodedata != undefined) && groupCodedata == '00270012') {
		editPurchase = 'Auction/Sale/Purchase/SalePurchase/model/JMedit_model.html'
	}

	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '修改竞卖公告',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
		,
		resize: false,
		id: projectState == 4 ? 'packageclassEdit' : 'packageclass',
		content: editPurchase + '?projectId=' + rowData[$index].projectId
		//确定按钮
		,
		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
		}
	});
};
//审核页面
function audit_btn($index, projectId) {
	var rowData = $('#table').bootstrapTable('getData');
	groupCodedata = rowData[$index].project.groupCode
	if (groupCodedata == null || groupCodedata == '' || groupCodedata == undefined) {
		var auditPurchase = 'Auction/Sale/Purchase/SalePurchase/model/auditPurchase.html' //审核路径

	} else if ((groupCodedata != null || groupCodedata != '' || groupCodedata != undefined) && groupCodedata == '00270012') {
		var auditPurchase = 'Auction/Sale/Purchase/SalePurchase/model/JMauditPurchase.html' //审核路径
	}

	sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].projectId));
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '查看竞卖公告',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
		,
		resize: false,
		id: 'packageclass',
		content: auditPurchase + '?projectId=' + projectId + '&createType=' + rowData[$index].createType,
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			parent.layer.close(index);
		}
	});
};

function GetTime(time) {
	var date = new Date(time).getTime()

	return date
};

var priceNames = [];

function getCheckFile(win) {
	priceNames = [];
	win.$("input[name='priceOffer']:checked").each(function () {
		var index = $(this).val();
		var priceName = win.$('#priceName' + index + '').val();
		priceNames.push(priceName);
	});
}
//时间转换是的IE和谷歌都可以判断日期大小
function NewDate(str) {
	if (!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}