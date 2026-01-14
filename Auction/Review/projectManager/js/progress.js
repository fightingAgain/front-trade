/*
 * @Author: your name
 * @Date: 2020-09-11 10:35:38
 * @LastEditTime: 2020-12-14 16:17:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\progress.js
 */
//评审进度管理
var ProgressData = new Object();
$(function() {
	getProgress();

})

function getProgress() {
	$.ajax({
		type: "post",
		url: url + "/ManagerCheckController/findManagerCheckRunProgress.do",
		data: {
			'packageId': packageId,
			'examType': examType,
			'projectId': projectId,
		},
		dataType: "json",
		async: false,
		success: function(response) {
			if(response.success) {
				_THISID = _thisId;
				ProgressData = response.data;
				ProjectCheckState();
				BindCheckStateRestor();
			} else {
				parent.layer.alert(response.message);
				$("#" + _THISID).click();
			}
		}
	});
}

function ProjectCheckState() {
	var packageCheckStates = ProgressData.packageCheckStates; //评委评审进度
	var packageCheckLists = ProgressData.packageCheckLists; //评审项目
	var projectCheckerItems = ProgressData.projectCheckerItems; //评委
	//表头
	var titletr = "<table class='table table-bordered'><tr>"
	titletr += "<th style='width:50px'>序号</th>"
	titletr += "<th>评委</th>";
	if(progressList.isRecommendExpert == 1){//是否推选组长 0否1是
		titletr += "<th>推选组长</th>"
	}
	for(var x = 0; x < packageCheckLists.length; x++) {
		if(ProgressData.doubleEnvelope == 1 && examType == 1) {
			titletr += "<th>" + packageCheckLists[x].checkName + '</br><i class="text-danger">（第' + top.sectionToChinese(packageCheckLists[x].envelopeLevel) + '信封）</i>' + "</th>";
		} else {
			titletr += "<th>" + packageCheckLists[x].checkName + "</th>";
		}

	}
	
	if(examType == 1 && progressList.isShowOfferTab != 1) {
		titletr += "<th>价格评审" + (progressList.doubleEnvelope == 1 ? '</br><i class="text-danger">(第二信封)</i>' : '') + "</th>"
	}
	titletr += "<th>评审记录汇总</th>"
	titletr += "<th>评审报告</th>"
	if(ProgressData.projectCheckers[0].isNeedSignReport && ProgressData.projectCheckers[0].isNeedSignReport == 1){
		titletr += "<th>签章</th>"
	}
	titletr += "<th>审核</th>"
	titletr += "</tr>"
	//数据行
	if(projectCheckerItems.length > 0) {
		for(var x = 0; x < projectCheckerItems.length; x++) { //循环每个评委
			var tr = "<tr>";
			tr += "<td>" + (x + 1) + "</td>";
			tr += "<td>" + projectCheckerItems[x].checkerEmployeeName + "</td>";
			if(x == 0 && progressList.isRecommendExpert == 1){
				var rowspan = projectCheckerItems.length;
				if(ProgressData.recommendStatus == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.recommendStatus + "</span></td>";
				}else{
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.recommendStatus + "</span></td>";
				}
			}
			for(var i = 0; i < packageCheckLists.length; i++) { //循环评审项目
				var checkState = ""; //评审结果
				var _i, _j;
				for(var j = 0; j < packageCheckStates.length; j++) { //循环评审进度
					if(packageCheckLists[i].checkType != 4) {
						//找到评审记录里面评委id和评审项对应的数据行
						if(projectCheckerItems[x].checkerEmployeeId == packageCheckStates[j].checkerEmployeeId && packageCheckLists[i].id == packageCheckStates[j].packageCheckListId) {
							checkState = !packageCheckStates[j].checkState ? "" : packageCheckStates[j].checkState;
						}
					} else {
						if(packageCheckLists[i].id == packageCheckStates[j].packageCheckListId) {
							checkState = !packageCheckStates[j].checkState ? "" : packageCheckStates[j].checkState;
							_i = i;
							_j = j
						}
					}
				}
				if(packageCheckLists[i].checkType != 4) {
					//找到评审记录里面评委id和评审项对应的数据行
					if(checkState.length > 0) {
						tr += "<td><span style='color:green'>" + checkState + "</span></td>";
					} else {
						tr += "<td><span style='color:red'>未完成</span></td>";
					}
				} else {
					if(x == 0) {
						var rowspan = projectCheckerItems.length;
						if(checkState.length > 0) {
							tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + checkState + "</span></td>";
						} else {
							tr += "<td rowspan='" + rowspan + "'><span style='color:red'>未完成</span></td>";
						}
					}

				}

			}

			if(x == 0) {
				var rowspan = projectCheckerItems.length;
				if(examType == 1 && progressList.isShowOfferTab != 1) {
					if(ProgressData.priceCheck == "已完成") {
						tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.priceCheck + "</span></td>";
					} else {
						tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.priceCheck + "</span></td>";
					}
				}

				if(ProgressData.checkItem == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.checkItem + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.checkItem + "</span></td>";
				}

				//					if(ProgressData.checkReport == "已完成") {
				//						tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.checkReport + "</span></td>";
				//					} else {
				//						tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.checkReport + "</span></td>";
				//					}
			}
			if(ProgressData.isNeedSure != 1) {
				if(x == 0) {
					if(ProgressData.checkReport == "已完成") {
						tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.checkReport + "</span></td>";
					} else {
						tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.checkReport + "</span></td>";
					}
				}
			} else {
				if(projectCheckerItems[x].sureReport == 1) {
					tr += "<td class='9' rowspan='1'><span style='color:green'> 已完成</span></td>";
				} else {
					tr += "<td class='9' rowspan='1'><span style='color:red'>未完成</span></td>";
				}
			}
			if(ProgressData.projectCheckers[0].isNeedSignReport && ProgressData.projectCheckers[0].isNeedSignReport == 1){
				for(var d=0;d<ProgressData.expertReportSigns.length;d++){
					if(projectCheckerItems[x].checkerEmployeeId == ProgressData.expertReportSigns[d].expertId){
						if(ProgressData.expertReportSigns[d].type == 1){
							tr += "<td  rowspan='1'><span style='color:green'> 已完成</span></td>";
						}else{
							tr += "<td rowspan='1'><span style='color:red'>未完成</span></td>";
						}
					}
				}
			}
			if(x == 0) {
				if(ProgressData.checkResult == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + ProgressData.checkResult + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + ProgressData.checkResult + "</span></td>";
				}
			}
			tr += "</tr>";
			titletr += tr;
		}
	} else {
		titletr += "<tr><td colspan='" + (packageCheckLists.length + 6) + "'>没有找到匹配的记录</td></tr>";
	}
	//回退按钮
	if(projectCheckerItems.length > 0) {
		var isbackType = 0; //0不可退回  1可回退 2项目失败
		if(ProgressData.isStopCheck != 1 && (ProgressData.stopCheckReason == "" || ProgressData.stopCheckReason == undefined) && ProgressData.checkResult != "已完成" && createType != 1) {
			isbackType = 1;
		}

		if(ProgressData.isStopCheck == 1 && ProgressData.checkResult != "已完成" && createType != 1) {
			isbackType = 2;
		}
		if(isbackType == 1 || isbackType == 2) {
			titletr += "<tr class='btntr'>";
			titletr += "<td colspan='2'></td>";
			if(progressList.isRecommendExpert == 1) {
				titletr += "<td>";
				if(ProgressData.recommendStatus == "已完成"){
					titletr += (isbackType == 2 ? "" : "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"recommendExpert\",\"推荐组长\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>")
				}
				titletr += "</td>"
			}
			for(var x = 0; x < packageCheckLists.length; x++) {
				var isCheckState = false;
				for(var i = 0; i < packageCheckStates.length; i++) {
					if(packageCheckStates[i].packageCheckListId == packageCheckLists[x].id) {
						if(packageCheckStates[i].checkState == "已完成") {
							isCheckState = true;
						}
					}
				}
				titletr += "<td>"
				if(isCheckState ) {
					titletr += (isbackType == 2 ? "" : "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"" + packageCheckLists[x].id + "\",\"" + packageCheckLists[x].checkName + "\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>");
				}
				titletr += "</td>"
			}

			if(examType == 1 && progressList.isShowOfferTab != 1) {
				titletr += "<td>"
				if(ProgressData.priceCheck == "已完成") {
					titletr += (isbackType == 2 ? "" : "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"price\",\"价格评审\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>")
				}
				titletr += "</td>";
			}

			titletr += "<td>"
			if(ProgressData.checkItem == "已完成") {
				titletr += "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"item\",\"评审记录汇总\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>"
			}
			titletr += "</td>";
			titletr += "<td>"
			if(ProgressData.checkReport == "已完成") {
				titletr += "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"report\",\"评审报告\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>"
			}
			titletr += "</td>";
			if(ProgressData.projectCheckers[0].isNeedSignReport && ProgressData.projectCheckers[0].isNeedSignReport == 1){
				titletr += "<td>"
				if(ProgressData.signReport == "已完成") {
					titletr += "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"signReport\",\"签章\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>"
				}
				titletr += "</td>";
			}
			titletr += "<td>"
			if(ProgressData.checkResult == "已完成") {
				titletr += "<button type='button' class='btn btn-warning btn-sm openBreak' onclick='openBreak(\"result\",\"报告审核\")'><span class='glyphicon glyphicon-share-alt'></span>退回到此阶段</button>"
			}
			titletr += "</td>";
			titletr += "</tr>";
		}

	}

	$("#ProjectCheckStateDiv").html(titletr + "</table>");
};

//加载项目回退记录
function BindCheckStateRestor() {

	var data = ProgressData.projectCheckBacks || [];
	var _h = $("#reportContent").height() - $("#ProjectCheckStateHeight").height() - 80;
	$("#ProjectCheckStateRestoreTalbe").bootstrapTable({
		height: _h,
		data: data,
		columns: [{
				title: '序号',
				width: '50px',
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'backName',
				title: '恢复评审项',
				width: '300px',
			},
			{
				field: 'remark',
				title: '操作备注',
				width: '500px',
			},
			{
				field: 'employeeName',
				title: '操作人',
				width: '150px',
			}, {
				field: 'subDate',
				title: '操作时间',
				width: '180px',
			}
		]
	});

}

var businessId = "";
//退回到此阶段按钮
function openBreak(backId, backName) {
	if(ProgressData.checkResult == "已完成") {
		return top.layer.alert("已提交审核，无法回退");
	}
	if(backId.length > 15) {
		var a = 0;
		for(var i = 0; i < ProgressData.packageCheckStates.length; i++) {
			if(ProgressData.packageCheckStates[i].packageCheckListId == backId) {
				if(ProgressData.packageCheckStates[i].checkState == "已完成")
					a++;
				break;
			}
		}
		if(a < 1) {
			return top.layer.alert("无需回退");
		}
	} else {
		switch(backId) {
			case "recommendExpert":
				if(ProgressData.recommendStatus == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "price":
				if(ProgressData.priceCheck == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "item":
				if(ProgressData.checkItem == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "report":
				if(ProgressData.checkReport == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "result":
				if(ProgressData.checkResult == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
		}
	}

	businessId = "";
	breakProjectCheckMsg(backId, backName);
};

//验证是否可以退回评审报告
function breakProjectCheckMsg(backId, backName) {
	$.ajax({ //验证评审报告是否可以退回
		type: "get",
		url: url + "/ProjectCheckBackController/checkBackMessage.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType
		},
		async: false,
		success: function(res) {
			if(res.success) {
				var reslut = res.data;
				switch(reslut['strKey']) {
					case '801':
						businessId = reslut['strMessage'];
						//parent.layer.alert();
						break;
					default:
						break;
				}
			}
		},
		error: function(err) {
			parent.layer.alert("退回失败");
		}
	});

	if(businessId != "") {
		parent.layer.confirm('温馨提示：当前项目已经生成评审报告并且评审报告正在审核中，确认退回？', {
			btn: ['确定', '取消']
		}, function(index1, layero) {
			breakProject(backId, backName);
			parent.layer.close(index1);
		}, function(index2, layero) {
			parent.layer.close(index2);
		});
	} else {
		breakProject(backId, backName);
	}
}

//退回原因
function breakProject(backId, backName) {

	parent.layer.prompt({
		title: '请输入回退原因',
		formType: 2
	}, function(text, index) {
		saveBreak(backId, backName, text);
		parent.layer.close(index);
	});
}

//保存退信信息
function saveBreak(backId, backName, backRemark) {
	if(backRemark != "") {
		$.ajax({ //请求插入回退历史记录
			type: "get",
			url: url + "/ProjectCheckBackController/insertProjectCheckBack.do",
			data: {
				projectId: projectId,
				packageId: packageId,
				backName: backName,
				backId: backId,
				remark: backRemark,
				examType: examType,
				businessId: businessId
			},
			async: false,
			success: function(data) {
				if(data.success) {
					$('#' + _thisId).click();
					parent.layer.alert("退回成功");

				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function(err) {
				parent.layer.alert("退回失败");
			}
		});
	} else {
		parent.layer.alert("请输入退回原因");
	}
}