//初始化
$(function() {
	initTable();

	$('#query').queryCriteria({
		isExport: 1, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 0, //0是不新增，1是新增
		QueryName: 'btnSearch',
		ExportName: 'btnDownload',
		queryList: [{
				name: '审核状态',
				value: 'checkState',
				type: 'select',
				option: [{
					name: '全部',
					value: '',
				}, {
					name: '审核通过',
					value: '2',
				}, {
					name: '审核中',
					value: '1',
				}, {
					name: '审核未通过',
					value: '3',
				}, {
					name: '已撤回',
					value: '4',
				}, {
					name: '未提交',
					value: '0',
				}]
			},
			{
				name: '项目名称',
				value: 'tenderProjectName',
				type: 'input',
			},
			{
				name: '项目编号',
				value: 'tenderProjectCode',
				type: 'input',
			},
			{
				name: '包件名称',
				value: 'bidSectionName',
				type: 'input',
			},

			{
				name: '包件编号',
				value: 'bidSectionCode',
				type: 'input',
			},{
				name: '系统外编号',
				value: 'outSystemNumber',
				type: 'input',
			}, {
				name: '项目经理所属处室',
				value: 'enterpriseld',
				type: 'input',
			},
			{
				name: '业主单位',
				value: 'purchaserName',
				type: 'input',
			},
			{
				name: '业主采购人员',
				value: 'purchaserLinKmen',
				type: 'input',
			},
			{
				name: '中标（中选）单位',
				value: 'legalName',
				type: 'input',
			},
			{
				name: '项目分配时间',
				startDate: "subStartDate",
				endDate: "subEndDate",
				type: 'date',
			},
			{
				name: '通知发出时间',
				startDate: "noticeSendStartTime",
				endDate: "noticeSendEndTime",
				type: 'date',
			}
		]
	})

	$("#query").on('click', '#btnSearch', function() {
		if(!$("#enterpriseld").val()) {
			$("#dept").val("")
		}
		//$('#table').bootstrapTable(('refresh'));
			$("#table").bootstrapTable('destroy');
		initTable();
	})

	/*$("#query").on('change', '#checkState', function() {
		$('#table').bootstrapTable(('refresh'));
	})*/
	$("#query").on('click', '#btnDownload', function() {
		var tenderProjectName = $("#tenderProjectName").val();
		var tenderProjectCode = $("#tenderProjectCode").val();
		var bidSectionCode = $("#bidSectionCode").val();
		var bidSectionName = $("#bidSectionName").val();
		var checkState = $("#checkState").val();

		//新增修改
		let subDateStart = $("#subStartDate").val()
		let subDateEnd = $("#subEndDate").val()
		let noticeSendTimeStart = $("#noticeSendStartTime").val()
		let noticeSendTimeEnd = $("#noticeSendEndTime").val()
		let departmentName = $("#enterpriseld").val()
		let departmentId = $("#dept").val()
		let purchaserName = $("#purchaserName").val()
		let purchaserLinKmen = $("#purchaserLinKmen").val()
		let legalName = $("#legalName").val()
		let enterpriseType = "02";
		var outSystemNumber = $('#outSystemNumber').val();

		if(!$("#enterpriseld").val()) {
			$("#dept").val("")
			departmentId = ""
		}

		var url = config.AuctionHost + "/BusinessStatisticsController/exportDateReportPageList.do" + "?tenderProjectName=" + tenderProjectName + "&tenderProjectCode=" + tenderProjectCode + "&bidSectionCode=" + bidSectionCode +
			"&bidSectionName=" + bidSectionName + "&tenderType=1" + "&checkState=" + checkState +
			"&subDateStart=" + subDateStart + "&subDateEnd=" + subDateEnd + "&noticeSendTimeStart=" + noticeSendTimeStart +
			"&noticeSendTimeEnd=" + noticeSendTimeEnd + "&departmentName=" + departmentName + "&departmentId=" + departmentId +
			"&purchaserName=" + purchaserName + "&purchaserLinKmen=" + purchaserLinKmen + "&legalName=" + legalName + '&outSystemNumber='+outSystemNumber
		//+ "&enterpriseType=" + enterpriseType
		window.location.href = $.parserUrlForToken(url);
	})

	$("#query").on('click', '#enterpriseld', function() {
		getEnterpriseld()
	})

	$("#query").on('change', '#enterpriseld', function() {
		if(!$("#enterpriseld").val()) {
			$("#departmentName").val("")
			$("#dept").val("")
		}

	})

	$("#query").on('click', '#subStartDate,#noticeSendStartTime', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',

		})

	})

	$("#query").on('click', '#subEndDate', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: $("#subStartDate").val(),

		})
	})

	$("#query").on('click', '#noticeSendEndTime', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: $("#noticeSendStartTime").val(),

		})

	})
	
});
/// 表格初始化
var purchaseaddurl = 'Auction/Auction/Agent/AuctionPurchase/model/againPurchaseAddModel.html' //重新采购的添加的页面路径
//var auditPurchase = 'bidPrice/DataReport/Auction/Agent/model/auditPurchase.html' //查看路径
//var editPurchase = 'bidPrice/DataReport/Auction/Agent/model/editReport.html' //编辑路径
var auditPurchase = 'bidPrice/DataReport/public/model/publicListView.html'; //查看路径
var editPurchase = 'bidPrice/DataReport/public/model/publicListEdit.html';  //编辑路径
//var deletProjectUrl = config.AuctionHost + '/AuctionPurchaseController/deleteAuctionProject.do'
var recallUrl = config.AuctionHost + "/WorkflowController/updateAuctionYwtjbState"; // 撤回项目的接口
var noticeStateUrl = config.AuctionHost + "/AuctionPurchaseController/updateNoticeState.do" //公告发布
//取消项目方法
var deletProjectUrl = config.AuctionHost + "/BusinessStatisticsController/deleteCompileDateReport"
//审核通过后撤回
var recallCompileDateReport = config.AuctionHost + "/BusinessStatisticsController/recallCompileDateReport"

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.AuctionHost + '/BusinessStatisticsController/findDateReportPageList.do', // 请求url
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [5, 15, 25, 50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		height: top.tableHeight,
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
				width: '50',
				formatter: function(value, row, index) {
					var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'tenderProjectCode',
				title: '项目编号',
				align: 'left',
				width: '180'
			}, {
				field: 'tenderProjectName',
				title: '项目名称',
				align: 'left',
			}, {
				field: 'bidSectionCode',
				title: '包件编号',
				align: 'left',
				width: '180'
			}, {
				field: 'outSystemNumber',
				title: '系统外编号',
				align: 'left',
				width: '180'
			}, {
				field: 'bidSectionName',
				title: '包件名称',
				width: '250',
				formatter: function(value, row, index) {
					if(row.packageSource == 1) {
						return value + '<span class="text-danger">(重新竞价)</span>';
					} else {
						return value;
					}

				}
			}, {
				field: 'exception',
				title: '异常',
				align: 'left',
				formatter: function(value, row, index) {
					return value || "";

				}
			}, {
				field: 'exceptionCause',
				title: '异常原因',
				align: 'left',
				formatter: function(value, row, index) {
					return value || "";

				}
			}, {
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(value == 0) {
						return '未提交';
					} else if(value == 1) {
						return '审核中';
					} else if(value == 2 || value == 5) {
						return '<div class="text-success">审核通过</div>';
					} else if(value == 3) {
						return '<div class="text-danger">审核未通过</div>';
					} else if(value == 4) {
						return '<div class="text-danger">已撤回</div>';
					}

				}
			},
			{
				field: '',
				title: '操作',
				align: 'center',
				width: '200',
				events: {
					'click .recall': function(e,value, row, index){
						recall_btn2(row.id, row.tenderProjectID, row.tenderType)
					},
				},
				formatter: function(value, row, index) {
					var Tdr = "";
					if(row.createType != undefined && row.createType == 1) {
						Tdr += '<button type="button" class="btn btn-sm btn-primary view" onclick=audit_btn(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
					} else {
						if(row.checkState == 0) { //未提交		
							Tdr += '<button type="button" class="btn btn-sm btn-primary view" onclick=audit_btn(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
							Tdr += '<button type="button" class="btn btn-sm btn-primary edit" onclick=edit_btn(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true" ></span>编辑</button>'
						} else if(row.checkState == 1) { //审核中
							Tdr += '<button type="button" class="btn btn-sm btn-primary view" onclick=audit_btn(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
							//Tdr += '<button type="button" class="btn btn-sm btn-warning recall" onclick=recall_btn(\"' + row.id + '\")><span class="glyphicon glyphicon-search" aria-hidden="true" ></span>撤回</button>'
						} else if(row.checkState == 2 || row.checkState == 5) { //审核通过
							Tdr += '<button type="button" class="btn btn-sm btn-primary view" onclick=audit_btn(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
							Tdr += '<button type="button" class="btn btn-sm btn-warning recall"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span>撤回</button>'
						} else if(row.checkState == 3) { //已撤回 审核未通过
							Tdr += '<button type="button" class="btn btn-sm btn-primary view" onclick=audit_btn(\"' + index + '\")><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>'
							Tdr += '<button type="button" class="btn btn-sm btn-primary edit" onclick=edit_btn(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑</button>'
						} else if(row.checkState == 4) {
							Tdr += '<button type="button" class="btn btn-sm btn-primary edit" onclick=edit_btn(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true" ></span>编辑</button>'
							Tdr += '<button type="button" class="btn btn-sm btn-warning cancelRecall" onclick=cancel_btn2(\"' + row.id + '\")><span class="glyphicon glyphicon-trash" aria-hidden="true" ></span>取消撤回</button>'
						}
					}

					return Tdr
				}
			}
		],
	});
};
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'tenderProjectName': $("#tenderProjectName").val(),
		'tenderProjectCode': $("#tenderProjectCode").val(),
		'bidSectionCode': $("#bidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val(),
		'packageNum': $("#packageNum").val(),
		'checkState': $("#checkState").val(),
		'enterpriseType': '02',
		'tenderType': 1,
		//新增修改
		'subDateStart': $("#subStartDate").val(),
		'subDateEnd': $("#subEndDate").val(),
		'noticeSendTimeStart': $("#noticeSendStartTime").val(),
		'noticeSendTimeEnd': $("#noticeSendEndTime").val(),
		'departmentName': $("#enterpriseld").val(),
		'departmentId': $("#dept").val(),
		'purchaserName': $("#purchaserName").val(),
		'purchaserLinkmen': $("#purchaserLinKmen").val(),
		'legalName': $("#legalName").val(),
		'outSystemNumber': $("#outSystemNumber").val(),
	}
};
// 搜索按钮触发事件
$("#btnSearch").click(function() {

	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
$("#checkState").change(function() {

	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

// 撤回功能
function recall_btn(id) {
	parent.layer.confirm('确定要撤回该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": id,
			},
			success: function(data) {
				if(data.success) {
					parent.layer.alert("撤回成功!")
					setTimeout(function() {
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
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

};
//取消功能
function cancel_btn(uid) {
	parent.layer.confirm('确定要取消该项目 ', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: deletProjectUrl,
			type: 'post',
			async: false,
			data: {
				"id": uid,

			},
			success: function(data) {
				setTimeout(function() {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
				}, 200)
				parent.layer.close(index);
			},
			error: function(data) {
				parent.layer.alert("取消失败")
			}
		});

	}, function(index) {
		parent.layer.close(index)
	});
};

//编辑功能
function edit_btn($index, projectState) { //$index当前选择行的下标，projectState是当前选择行的审核状态0为未审核，1为审核中，2为审核通过。
	if(projectState == 1) {
		parent.layer.alert("审核中无法编辑");
		return
	}
	if(projectState == 2) {
		parent.layer.alert("通过审核无法编辑");
		return
	}
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据  

	var flag = 1;
	let rd = rowData[$index]
	if(rd.id) {
		flag = 2;
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '编辑业务统计报表信息',
		area: ['100%', '100%'],
		id: 'packageclass',
		maxmin: true ,//开启最大化最小化按钮
		resize: false,
		content: editPurchase + '?projectId=' + rowData[$index].tenderProjectID + "&flage=" + flag + "&tenderType=" + rowData[$index].tenderType,
		success: function(layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.$("#addBao").hide();
		}
	});
}
//查看
function audit_btn($index) { //$index当前选择行的下标
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	var flag = 1;
	let rd = rowData[$index]
	if(rd.id) {
		flag = 2;
	}
	parent.layer.open({
		type: 2, //此处以iframe举例
		title: '查看业务统计报表信息',
		area: ['100%', '100%'],
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: auditPurchase + '?projectId=' + rowData[$index].tenderProjectID + "&flage=" + flag + "&tenderType=" + rowData[$index].tenderType + "&id=" + rowData[$index].id,
		// btn: ['关闭'], //确定按钮	
		yes: function(index, layero) {
			parent.layer.close(index);
		}
	});
};

//xinzeng
//审核成功撤回
function recall_btn2(id, bidSectionId, tenderType) {
	/* ***************        验证项目是否重采       ****************** */
	var msg = checkRePurchase(tenderType, bidSectionId);
	if(msg != ''){
		top.layer.alert(msg);
		return
	}
	/* ***************        验证项目是否重采   --end    ****************** */
	layer.open({
		id: 1,
		type: 1,
		title: '撤回原因',
		style: 'width:400px;height:300px;',
		content: "<div style='display:flex;justify-content:center;'><textarea id='area' style='width:400px;height:250px;'></textarea></div>",
		btn: ['确认', '取消'],
		yes: function(index, layero) {
			//获取输入框里面的值
			var closeContent = top.$("#area").val() || $("#area").val();
			if(closeContent && closeContent.trim().length > 0) {
				if(closeContent.length > 500) {
					parent.layer.alert("温馨提示：最多输入500字！")
					return;
				}
				$.ajax({
					url: recallCompileDateReport,
					type: 'post',
					async: false,
					data: {
						"id": id,
						'checkState': 4,
						"workflowContent": closeContent
					},
					success: function(data) {
						if(data.success) {
							parent.layer.close(index)
							parent.layer.alert("撤回成功!")
							setTimeout(function() {
								$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
							}, 200)
						} else {
							parent.layer.alert(data.message)
						}
					},
					error: function() {
						parent.layer.alert("操作失败")
					}
				})

			} else {
				parent.layer.alert("请输入原因")
			}

		},
		no: function(index, layero) {
			parent.layer.close(index)
		}
	});

	/*parent.layer.prompt({
		title: '撤回原因',
		FormType: 1
	}, function(text, index) {
		if(text.trim().length == 0) {
			console.log(text)
			parent.layer.alert("请输入撤回原因")
			return;
		}
		$.ajax({
			url: recallCompileDateReport,
			type: 'post',
			async: false,
			data: {
				"id": id,
				'checkState': 4,
				"workflowContent": text
			},
			success: function(data) {
				if(data.success) {
					parent.layer.close(index)
					parent.layer.alert("撤回成功!")
					setTimeout(function() {
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					parent.layer.alert(data.message)
				}
			},
			error: function() {
				parent.layer.alert("操作失败")
			}
		})
	}, function(index) {
		parent.layer.close(index)
	})*/

};

// 选择部门
function getEnterpriseld() {
	var mnuid = $("#enterpriseld").val()
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee2.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.employee("", "", callEmployeeBack, mnuid)
		},

	})
}

function callEmployeeBack(aRopName, dataTypeList) {
	var itemTypeId = [];
	var itemTypeName = [];
	for(var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList = itemTypeId.join(",");
	typeNameList = itemTypeName.join(",");

	$("#dept").val(typeIdList);
	$("#deptName").html(typeNameList);
	$("#enterpriseld").val(typeNameList);
}

//取消撤回
function cancel_btn2(id) {
	parent.layer.confirm('确定要取消撤回该项目 ', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallCompileDateReport,
			type: 'post',
			async: false,
			data: {
				"id": id,
				"checkState": 5
			},
			success: function(data) {
				setTimeout(function() {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
				}, 200)
				parent.layer.close(index);
			},
			error: function(data) {
				parent.layer.alert("取消失败")
			}
		});
	}, function(index) {
		parent.layer.close(index)
	});
}