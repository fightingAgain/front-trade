/*
 */ 
var tenderTypeCode;
var examType = "";
var iframeWinAdd = "";
var enterpriseType = "";
if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {

	var hurl = PAGEURL.split("?")[1].split("&");

	if(hurl[0].split("=")[0] == "tenderType") { //评审 或  单一
		tenderTypeCode = hurl[0].split("=")[1];		
	}
	if(hurl[1].split("=")[0] == "examType") { //预审
		examType = hurl[1].split("=")[1];		
	}

	if(hurl[2].split("=")[0] == "enterpriseType") { //预审
		enterpriseType = hurl[2].split("=")[1];
	}

} else { //评审

	tenderTypeCode = 0;
	examType = 1;
}

if(examType == 1) {
	//$(".checks").show();
	$(".ready1").html("项目评审中");
	$(".ready1").val("项目评审中");
	$(".ready2").html("评审完成");
	$(".ready2").val("评审完成");
} else {
	$(".ready1").html("资格审查中");
	$(".ready1").val("资格审查中");
	$(".ready2").html("资格审查完成");
	$(".ready2").val("资格审查完成");
}

//查询按钮
$("#btnQuery").click(function() {
	$("#ReportChecktable").bootstrapTable(('refresh'));
});

$("#checkResult,#isSendMess").change(function() {
	$("#ReportChecktable").bootstrapTable(('refresh'));
});

//设置查询条件
function queryParams(params) {
	var para = {
		'checkState': $("#checkResult").val(),
		'projectName': $("#projectName").val(),
		'packageName': $("#packageName").val(),
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'tenderType': tenderTypeCode,
		'enterpriseType': enterpriseType,
		'examType': examType
	};
	return para;
}
//查询列表
$("#ReportChecktable").bootstrapTable({
	url: config.AuctionHost + '/CheckController/findPageList.do',
	pagination: true, //是否分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	striped: true, // 隔行变色,
	sidePagination: 'server', //设置为服务器端分页
	queryParams: queryParams, //参数
	columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		},
		{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '160'
		}, {
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
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'checkState',
			title: '项目评审状态',
			align: 'center',
			width: '150',
			formatter: function(value, row, index) {
				if(row.isStopCheck == 1) {
					return '<span class="text-danger">项目失败</span>'
				} else {
					return value
				}
			}
		},
		{
			field: 'examCheckEndDate',
			title: '资格预审时间',
			align: 'center',
			width: '150'
		}, {
			field: 'checkEndDate',
			title: '评审时间',
			align: 'center',
			width: '150'
		}, {
			field: '#',
			title: '操作',
			align: 'center',
			width: '180px',
			//formatter: AddFunction, //表格中添加按钮
			//events: operateEvents, //给按钮注册事件
			formatter: function(value, row, index) {	
				button = '<button onclick=btnShowCheck("'+index +'") class="btn btn-xs btn-primary"><span class="glyphicon glyphicon glyphicon-search" aria-hidden="true"></span>查看评审</button>';
                //if(row.checkState!="评审完成"&&row.checkState!="资格审查完成"){
                if(row.bidResultType == 0){//结果通知书未发布
                    if(row.isStopCheck==0){
                        button += '<button onclick=StopCheck("'+index +'") class="btn btn-xs btn-primary">项目失败</button>';
                    }
                }
				return button;
			}
		}
		
	]
});

if(examType == 1) {
	$('#ReportChecktable').bootstrapTable('hideColumn', 'examCheckEndDate');
} else {
	$('#ReportChecktable').bootstrapTable('hideColumn', 'checkEndDate');
}

//进入详情页面
function btnShowCheck($index) {
	var rowData = $('#ReportChecktable').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var id=rowData[$index].projectId;
	var pk=rowData[$index].packageId;
	var isSendMess=rowData[$index].isSendMess;
	var createType=rowData[$index].createType;
	var isAgent = rowData[$index].isAgent;
	msg = "";
	checkPackageList(id, pk);
	if(msg == 1) {

		if(id != "") {
			if(examType == 0) {
				//预审
				toPackageInfo(1,id,pk);
				if(packageInfo == "通过"){
					winMiddel(id,pk,isSendMess,createType, isAgent);
				}

			} else {
				//评审
				toPackageInfo(2,id,pk);
				if(packageInfo == "通过"){
					winMiddel(id,pk,isSendMess,createType, isAgent)
				}

			}
		}
	}
}

function winMiddel(projectId,packageId,createType, isAgent){
	checkUrl = "bidPrice/Review/projectManager/modal/index.html";
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		maxmin: false,
		resize: false,
		title: false,
		id:'packageclass',
		content: checkUrl+'?projectId='+projectId+"&packageId="+packageId+'&createType='+createType+'&examType='+examType+'&tenderType='+tenderTypeCode+'&isAgent=' + isAgent,		
	})
}

var packageInfo = "";

function toPackageInfo(flag, projectId, packageId) {
	packageInfo = "";

	$.ajax({
		type: "post",
		url: config.AuctionHost + "/WaitCheckProjectController/verifyPackage.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			checkType: flag
		},
		async: false,
		success: function(data) {
			if(data.success) {
				packageInfo = "通过";
			} else {
				//查询项目是否流标,如若流标给出提示信息
				getIsStopCheckMsg(packageId,data.message);
				//top.layer.alert(data.message);
			}
		}
	});
}

//查询项目是否已经流标,给出流标原因
function getIsStopCheckMsg(packageId,verMsg){
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/WaitCheckProjectController/getIsStopCheckMsg.do",
		data: {
			packageId: packageId,
		},
		async: false,
		success: function(data) {
			if(data.success) {
				top.layer.alert(verMsg);
			} else {
				top.layer.alert("包件项目失败原因："+data.message);
			}
		}
	});
}

var msg

function checkPackageList(projectId, packageId) {

	$.ajax({
		type: "post",
		url: config.AuctionHost + "/CheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType
		},
		async: false,
		success: function(data) {
			if(data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg = 2;
			}
		}
	});

}
//只重新获取主数据，进度
function StopCheck(packUid, proUid) {
	if(examType == 1) {
		var pra = {
			projectId: proUid,
			packageId: packUid,
			roleType: 0
		};
	} else {
		var pra = {
			projectId: proUid,
			packageId: packUid,
			roleType: 0,
			examCheckType: 1,
		};
	};
	var packageData = [];
	$.ajax({
		type: "get",
		url: config.AuctionHost + "/ProjectReviewController/getProjectCheckInfo.do",
		data: pra,
		async: false,
		success: function(data) {
			if(data.success) {
				packageData = data.data;
			}

		}
	});
	if(packageData.stopCheckReason != "" && packageData.stopCheckReason != undefined && packageData.stopCheckSource == 1) {
		//专家发起项目失败,项目经理确认
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function(indexs) {
			$.ajax({
				type: "post",
				url: config.AuctionHost + "/ProjectReviewController/setIsStopCheck.do",
				data: {
					'id': packUid,
					'isStopCheck': 1,
					'stopCheckReason': packageData.stopCheckReason,
					'examType': examType
				},
				async: false,
				success: function(data) {
					if(data.success) {
						top.layer.alert("操作成功");
						$("#ReportChecktable").bootstrapTable(('refresh'));
						parent.layer.close(indexs);
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		})
	} else {
		//项目经理发起项目失败
		if(packageData.checkResult == '未完成'){
			//评审报告未审核完成之前,评委若有打分记录则由评委发起
			if(packageData.checkItemInfos.length > 0) {
				top.layer.alert("温馨提示：专家已打分，无法发起项目失败");
				return
			}
		}
		
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function(indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入项目失败原因',
				formType: 2
			}, function(text, index) {
				if(text == "") {
					parent.layer.alert('请填写项目失败原因');

					return
				}
				$.ajax({
					type: "post",
					url: config.AuctionHost + "/ProjectReviewController/setIsStopCheck.do",
					data: {
						'id': packUid,
						'isStopCheck': 1,
						'stopCheckReason': text,
						'examType': examType
					},
					async: true,
					success: function(data) {
						if(data.success) {
							top.layer.alert("操作成功");
							$("#ReportChecktable").bootstrapTable(('refresh'));
						} else {
							top.layer.alert(data.message);
						}
					}
				});
				parent.layer.close(index);
			});
		});
	}
}