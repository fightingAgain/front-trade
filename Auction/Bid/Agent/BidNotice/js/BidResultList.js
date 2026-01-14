var urlBidResultList = top.config.bidhost + "/ProjectBidResultController/findProjectBidResult.do"; //询比采购结果通知
var recallUrl = top.config.bidhost + "/WorkflowController/findWorkflowCheckeState.do"; // 撤回项目的接口
var cancellUrl = top.config.bidhost + "/BidResultHisController/cancelChange.do";//取消变更
var urlCheckChange = top.config.bidhost + "/BidResultHisController/checkChange.do";//变更验证
var pushHtml = 'Auction/common/Agent/BidNotice/modal/pushInfo.html'; //数据推送
var urlCheckBus = top.config.bidhost + '/BusinessStatisticsController/findaudtionInfo.do';//业务报表验证接口
var isEvaluateUrl = config.JudgesHost + '/ProjectController/getProjectEvaluateState.do';//专家履职评价是否完成
var tenderTypeCode;
var examTypeCode;
var checkBusType;


//查询按钮
$(function() {

	if(PAGEURL.split("?")[1] != undefined) {
		if(PAGEURL.split("?")[1].split("=")[0] == "examType") {
			tenderTypeCode = 0; //0是询比采购  6是单一来源采购	
			examTypeCode = PAGEURL.split("?")[1].split("=")[1];
		} else if(PAGEURL.split("?")[1].split("=")[0] == "tenderType") {
			tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];
			examTypeCode = 1
		}
	
	} else {
		tenderTypeCode = 0;
		examTypeCode = 0;
	};	
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#BidResultList').bootstrapTable('destroy');
		initTable();
	});

	$("select").change(function() {
		$('#BidResultList').bootstrapTable('destroy');
		initTable();
	})

});
function checkDetail(packageId, type, examType, purExamType, $index) {
	var row = $("#BidResultList").bootstrapTable('getData');
	var rows = $("#BidResultList").bootstrapTable('getData')[$index];
	var title = "";
	if(rows.checkState== undefined&& rows.createType != undefined && rows.createType == 1) {
		title = (examTypeCode == 0 ? "资格审查" : "询比采购");
		return parent.layer.alert("温馨提示："+title+"还未发布结果通知!")
	}else if(rows.checkState== 0&& rows.createType != undefined && rows.createType == 1){
		title = (examTypeCode == 0 ? "资格审查" : "询比采购");
		return parent.layer.alert("温馨提示："+title+"还未发布结果通知!")
	}
	if(type == "RELEASE") {
		checkBusType = 0;
		if(rows.changeCount >0){//变更
			type = 'CHANGE'
		}
		title = examTypeCode == 0 ? "发布资格审查结果通知" : "发布询比采购结果通知";
		
		if(rows.isStopCheck != undefined && rows.isStopCheck == 1) {
			parent.layer.alert("温馨提示：该包件已项目失败！");
			return;
		}
		if (checkObjection(packageId)) {
			return
		}
		//发布结果通知书验证业务报表信息
		if(examTypeCode != 0){
			checkBus(packageId);
		}
		
		if(checkBusType == 1){
			return parent.layer.alert("温馨提示：该项目业务报表信息未提交或未审核通过，无法发布结果通知！");
		}
		if(examTypeCode != 0){
			if(getEvaluate(packageId) != 1){
				return
			}
		}
	}else if(type == "CHANGE") {
		checkBusType = 0;
		title = "发布询比采购结果通知";
		checkChange(row[$index].projectId, packageId, examType)
		if(checkBusType == 1){
			return
		}
	} else {
		title = examTypeCode == 0 ? "查看资格审查结果通知" : "查看询比采购结果通知";
	}
	top.layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		maxmin: true,
		resize: false,
		closeBtn: 1,
		content: 'Auction/common/Agent/BidNotice/modal/BidResultInfo.html?special=' + type + '&examType=' + examType + '&projectId=' +row[$index].projectId+'&id='+row[$index].packageId+'&keyId='+row[$index].id,
	});
}

//发布结果通知书验证业务报表信息
function checkBus(packId){
	$.ajax({
		url: urlCheckBus, 
		data: {
			'tenderProjectID':packId
		},
		type: 'post',
		async: false,
		success: function(data) {
			if(data.success) {
				if(data.data){
					checkBusType = 0;//可以发布
				}else{
					checkBusType = 1;//不可以发布
				}
			} else {
				layer.alert(data.message);
			}
		}
	});
}
//验证变更
function checkChange(projectId, packageId, examType){
	$.ajax({
		url: urlCheckChange, 
		data: {
			'projectId': projectId,
			'packageId': packageId,
			'examType': examType
		},
		type: 'post',
		async: false,
		success: function(data) {
			if(data.success) {
				// if(data.data){
					checkBusType = 0;//可以发布
				// }else{
				// 	checkBusType = 1;//不可以发布
				// }
			} else {
				checkBusType = 1;//不可以发布
				layer.alert(data.message);
			}
		}
	});
}
/* *********************************     专家履职评价是否完成     ******************************** */
function getEvaluate(id){
	var result = '0';
	$.ajax({
		type:"post",
		url:isEvaluateUrl,
		async:false,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				if(data.data && data.data == 1){
					result = '1';
				}else{
					top.layer.alert('温馨提示：评委履职情况评价表还未完成！')
				}
			}else{
				top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
	return result
}
/* *********************************     专家履职评价是否完成  -end   ******************************** */

//设置查询条件
function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号	
		packageName: $("#packageName").val(),
		resultType: $("#resultType").val(), //通知类型
		enterpriseType: '02', //0为采购人，1为供应商
		tenderType: '0', //0为询比采购，1为竞价采购，2为竞卖
		examType: examTypeCode
	};
	return QueryParams;
}
function initTable(){
	$("#BidResultList").bootstrapTable({
		url: urlBidResultList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		clickToSelect: true, //是否启用点击选中行
		sidePagination: 'server', // 服务端分页
		silent: true, // 必须设置刷新事件
		classes: 'table table-bordered', // Class样式
		queryParams: getQueryParams, //查询条件参数
		striped: true,
		uniqueId: "packageId",
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#BidResultList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#BidResultList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectCode',
				title: '采购项目编号',
				align: 'left',
				width: '180'
			},
			{
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
			},
			{
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '180'
			},
			{
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
			},
			{
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					//0为未审核，1为审核中，2为审核通过，3为审核不通过
					switch(value) {
						case 0:
							return "未审核";
							break;
						case 1:
							return "<span style='color: red;'>审核中</span>";
							break;
						case 2:
							return "<span style='color: green;'>审核通过</span>"
							break;
						case 3:
							return "<span style='color: red;'>审核不通过</span>"
							break;
						default:
							return "未提交";
					}
				}
			}, {
				field: 'purExamType',
				title: '资格审查方式',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					if(row.purExamType == 0) {
						return "资格预审";
					} else {
						return "资格后审";
					}
				}
			},
			{
				field: 'checkState',
				title: '发布状态',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					if(value == "2") {
						return "<span style='color: green;'>已发布</span>";
					} else {
						return "<span style='color: red;'>未发布</span>";
					}
				}
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '200',
				formatter: function(value, row, index) {
					var strCancel = "<button onclick='cancelChange(\"" + row.id + "\",\"" + (row.isStopCheck || 0) + "\")' class='btn btn-warning btn-xs'><span class='glyphicon glyphicon-share'>取消变更</button>"
					if(row.createType != undefined && row.createType == 1) {
						return "<button onclick='checkDetail(\"" + row.packageId + "\",\"VIEW\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
					} else {
						if(typeof(row.checkState) == 'undefined') {
							return "<button onclick='checkDetail(\"" + row.packageId + "\",\"RELEASE\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-edit'>发布结果</button>"
						} else if(row.checkState == 0) {
							return "<button onclick='checkDetail(\"" + row.packageId + "\",\"RELEASE\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-edit'>发布结果</button>" + (row.changeCount >0?strCancel:"")
						} else if(row.checkState == 1) {
							return "<button onclick='checkDetail(\"" + row.packageId + "\",\"VIEW\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>&nbsp;&nbsp;<button onclick='updates(\"" + row.id + "\",\"" + (row.isStopCheck || 0) + "\")' class='btn btn-warning btn-xs'><span class='glyphicon glyphicon-share'>撤回</button>"
						} else if(row.checkState == 3) {
							return "<button onclick='checkDetail(\"" + row.packageId + "\",\"RELEASE\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-edit'>重新发布</button>" + (row.changeCount >0?strCancel:"")
						} else {
							//日产的询价项目推送
							if(row.checkState == 2 && row.examType == 1){
								return "<button onclick='checkDetail(\"" + row.packageId + "\",\"VIEW\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button><button onclick='checkDetail(\"" + row.packageId + "\",\"CHANGE\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-edit'>变更</button>"
							}else{
								if(row.organNo && row.organNo != '' && row.organNo != 0) {
									return "<button onclick='checkDetail(\"" + row.packageId + "\",\"VIEW\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
								} else {
									return "<button onclick='checkDetail(\"" + row.packageId + "\",\"VIEW\",\"" + row.examType + "\",\"" + row.purExamType + "\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
								}
							}
						}
					}
	
				}
			}
	
		]
	});
	
}

function updates(id,isStopCheck) {
	
	if(isStopCheck != undefined && isStopCheck == 1) {
		parent.layer.alert("温馨提示：该包件已项目失败，无法撤回！");
		return;
	}
	
	top.layer.confirm('确定要撤回该结果通知吗', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": id,
				'accepType': 'jgtzs'
			},
			success: function(data) {
				if(data.success) {
					parent.layer.alert("撤回成功!")
					setTimeout(function() {
						$('#BidResultList').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function(data) {
				top.layer.alert("撤回失败")
			}
		});

		top.layer.close(index);
	}, function(index) {
		top.layer.close(index)
	});
}
function cancelChange(id,isStopCheck){
	if(isStopCheck != undefined && isStopCheck == 1) {
		parent.layer.alert("温馨提示：该包件已项目失败，无法取消变更！");
		return;
	}
	
	top.layer.confirm('确定要取消变更', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: cancellUrl,
			type: 'post',
			async: false,
			data: {
				"id": id,
			},
			success: function(data) {
				if(data.success) {
					parent.layer.alert("取消变更成功!")
					setTimeout(function() {
						$('#BidResultList').bootstrapTable('refresh'); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function(data) {
				top.layer.alert("取消变更失败")
			}
		});
	
		top.layer.close(index);
	}, function(index) {
		top.layer.close(index)
	});
}
function pushDetail(pId, id, organNo) {
	top.layer.open({
		type: 2,
		title: '数据推送',
		area: ['1000px', '600px'],
		maxmin: true,
		resize: false,
		content: pushHtml + '?packageId=' + pId + '&projectId=' + id + '&organNo=' + organNo,
	});
}
