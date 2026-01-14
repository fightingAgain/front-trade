/*
 * @Author: your name
 * @Date: 2020-09-11 15:40:11

 * @LastEditTime: 2021-01-15 11:44:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\packageCheckList.js
 */
//刷新竞价起始价--参与竞价供应商最低价
//加载二级选项卡tab
var packageCheckItems;
var suppliers;
var checkItemInfos;
var offerFileList;
var detaildivcenter;
var detaildiv;
var supplierData;
var data;
var bidPriceData;
var bidPriceResults;
var packageCheckListId;
var isOpenSunmmary = false, isOpenReason = false;//是否已打开确认页面、修改原因页面
var summaryResult = 'bidPrice/Review/Expert/modal/sunmmaryResultConfirm.html';//评审结果确认
var reasonSummer = 'bidPrice/Review/Expert/modal/reasonConfirm.html';//评审原因确认
$(function () {
	if (_checkType != 4) {
		insetItmeTab()
	} else {
		checkItemTab()
	}
})
function insetItmeTab() {
	var packageCheckList = new Object();
	//参数
	var para = {
		projectId: projectId,
		packageId: packageId,
	};
	//非第一个评审项时寻找上一个评审项id
	for (var i = 0; i < progressList.packageCheckLists.length; i++) {
		if (_thisId == progressList.packageCheckLists[i].id) {
			packageCheckList = progressList.packageCheckLists[i];
			if (i != 0) {

				para.prePackageCheckListId = progressList.packageCheckLists[i - 1].id;
			} else {
				para.prePackageCheckListId = '';

			}
		}
	}
	para.packageCheckListId = packageCheckList.id;
	packageCheckListId = packageCheckList.id;
	para.expertId = expertIds;
	para.examType = examType;
	$.ajax({
		type: "post",
		url: url + "/ExpertCheckController/getSupplierForExp.do",
		data: para,
		async: false,
		success: function (result) {
			if (result.success) {
				data = result.data;
				_THISID = _thisId;
				supplierUl(data, packageCheckList);
				if(data.expertNodeType){
					if(data.expertNodeType == 1){
						openSunmmaryResult(expertIds, packageCheckListId, examType);
					}else if(data.expertNodeType == 2){
						openReasonSummer(expertIds, packageCheckListId, examType);
					}
				}
				
			} else {

				parent.layer.alert(result.message)

				$("#" + _THISID).click();
			}
		}
	});

}
function supplierUl(data, packageCheckList) {

	if (data.offers.length > 0) {
		var RenameData = getBidderRenameData(packageId);//供应商更名信息
		suppliers = data.offers;
		detaildiv = "";

		if (data.isShowCheckResult == 0) {
			supplierData = CheckResult(packageCheckList.id)
			if (supplierData && supplierData.length > 0) {
				detaildiv += '<div id="checkResultContent">'
				detaildiv += '<div style="border-left: 4px solid #1a7acd ;height: 36px ; line-height: 36px;padding-left: 5px;margin-bottom: 10px;margin-top:10px">'
				detaildiv += '评审结果'
				detaildiv += '</div>'
				detaildiv += "<table id='checkResultContent_" + packageCheckList.id + "' class='tab-content table table-bordered'>";
				detaildiv += "</table>";
				detaildiv += '</div>'
			}
		}
		detaildiv += "<div style='width: 100%;margin-top:10px' id='ulTab_" + packageCheckList.id + "' >";
		detaildiv += "<ul id='Tab_" + packageCheckList.id + "' class='nav nav-tabs' style='background-color:#FBFBFB;border-top: 0px solid;'>"; //供应商小的tab绑定					
		for (var j = 0; j < suppliers.length; j++) {
			if (j == 0) { //第一个选中
				detaildiv += "<li class='active' value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
				detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab(" + j + ",\"" + packageCheckList.id + "\"," + packageCheckList.checkType + ")'>" + (data.isOpenDarkDoc == 0?showBidderRenameList(suppliers[j].supplierId, suppliers[j].enterpriseName, RenameData, 'body'):suppliers[j].enterpriseName) + "</a>";
				detaildiv += "</li>";
			} else {
				detaildiv += "<li  value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
				detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab(" + j + ",\"" + packageCheckList.id + "\"," + packageCheckList.checkType + ")'>" + (data.isOpenDarkDoc == 0?showBidderRenameList(suppliers[j].supplierId, suppliers[j].enterpriseName, RenameData, 'body'):suppliers[j].enterpriseName) + "</a>";
				detaildiv += "</li>";
			}
		}
		detaildiv += "</ul>";
		detaildiv += "</div>";
		detaildiv += "<div id='TabContent_" + packageCheckList.id + "' class='tab-content'></div>";
		$("#packageCheckLists").html(detaildiv);
		//isShowCheckResult 0 显示 1不显示,checkFinish 已完成 未完成
		if (data.isShowCheckResult == 0 && supplierData && supplierData.length > 0) {
			var cols = [
				{
					title: '序号',
					width: '50px',
					cellStyle: {
						css: {
							"text-align": "center"
						}
					},
					formatter: function (value, row, index) {
						return index + 1;
					}
				}, {
					field: 'enterpriseName',
					title: '供应商',
					formatter: function(value, row, index){
						return data.isOpenDarkDoc == 0?value:showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
					}
				}
			];
			if (packageCheckList.checkType == 2 || packageCheckList.checkType == 0) {
				cols.push({
					field: 'deviateNum',
					title: packageCheckList.checkType == 2 ? '偏离项数' : '不合格关键项数',
				})
			}
			cols.push({
				field: 'isKeyScore',
				title: ((packageCheckList.checkType == 1 || packageCheckList.checkType == 3) ? '分值合计' : '是否合格'),
				formatter: function (value, row, index) {
					var detaildivcenter = "";
					if (packageCheckList.checkType == 1 || packageCheckList.checkType == 3) {
						detaildivcenter = row.score
					} else {
						if (row.isKey == 0) {
							detaildivcenter = "合格"
						} else {
							detaildivcenter = "不合格"
						}
					}
					return detaildivcenter
				}

			})
			if (packageCheckList.checkType == 3) {
				cols.push({
					field: 'isOut',
					title: '是否合格',
					formatter: function (value, row, index) {
						var detaildivcenter = "";
						detaildivcenter = row.score
						if (row.isKey == 0) {
							detaildivcenter = "合格"
						} else {
							detaildivcenter = "不合格"
						}

						return detaildivcenter
					}

				})
			}

			$("#checkResultContent_" + packageCheckList.id).bootstrapTable({
				columns: cols
			});
			$("#checkResultContent_" + packageCheckList.id).bootstrapTable('load', supplierData);
		}
		checkItemTab(0, packageCheckList.id, packageCheckList.checkType)
		if (progressList.isStopCheck == 1) {
			$(".btn").hide();
			$('input').attr('disabled', true);
			$('button').attr('disabled', true);
		}
	}

}

function CheckResult(uid) {
	var data = [];
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + '/ExpertCheckController/getCheckTotalByListId.do',
		data: {
			'projectId': projectId,
			'packageId': packageId,
			'packageCheckListId': uid,
			'examType': examType
		},
		async: false,
		dataType: "json",
		success: function (response) {
			if (response.success) {
				data = response.data
			}
		}
	});
	return data
}
function checkItemTab(j, uid, type) {
	var datalst;
	if (_checkType == 4) {
		var pare = {
			"packageCheckListId": _thisId,
			'packageId': packageId,
			'projectId': projectId,
			'examType': examType,
			'expertId': expertIds
		}
	} else {
		var pare = {
			"packageCheckListId": uid,
			'packageId': packageId,
			'projectId': projectId,
			'examType': examType,
			'supplierId': suppliers[j].supplierId,
			'expertId': expertIds
		}
	}
	$.ajax({
		url: url + '/ExpertCheckController/getPackageCheckItemForExp.do',
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: pare,
		success: function (data) {
			if (data.success) {
				checkItemInfos = data.data.checkItemInfos;
				offerFileList = data.data.offerFileList;
				datalst = data.data.packageCheckList;
				packageCheckItems = data.data.checkItemInfos;
				bidPriceData = data.data.bidPrice;
				bidPriceResults = data.data.bidPriceResults
			}
		}
	});
	//不同评审方式，不同table
	var isShow = true;
	var detaildivcenter = "";
	var detaildivList = "";
	if (_checkType == 4) {
		let body = $("#packageCheckLists").empty().append(['<div class="panel panel-info">',
			'<div class="panel-heading">',
			'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
			'竞价结果',
			'</h3>',
			'</div>',
			function () {
				if (!bidPriceData) {
					return '<div class="panel-body">请等待项目经理启动竞价......</div>';
				} else if (!bidPriceData.bidpriceStatus) {
					return '<div class="panel-body">竞价中，请耐心等候......</div>';
				} else if (bidPriceData.bidpriceStatus == 2) {
					return '<div class="panel-body">竞价已流标，原因：' + data.failReason + '</div>';
				} else if (bidPriceData.resultSubmited == 0) {
					return '<div class="panel-body">请等待项目经理提交竞价结果......</div>';
				} else if (bidPriceData.resultSubmited == 1 && !bidPriceResults) {
					return '<div class="panel-body">项目经理已提交竞价结果......</div>';
				} else if (bidPriceData.resultSubmited == 1 && bidPriceResults) {
					let table = $('<table class="table table-bordered"></table>');
					table.bootstrapTable({
						pagination: false,
						undefinedText: "",
						data: bidPriceResults,
						columns: [{
							field: 'bidpriceRank',
							title: '竞价排名',
							width: '80px',
							align: 'center'
						}, {
							field: 'supplierName',
							title: '供应商名称',
							align: 'center'
						}, {
							field: 'priceTotal',
							title: '报价总价',
							align: 'center'
						}, {
							field: 'bidpriceAmount',
							title: '竞价报价',
							align: 'right'
						}, {
							field: 'bidpriceNum',
							title: '竞价报价次数',
							align: 'center'
						}]
					});
					return table.prop("outerHTML") + '<hr style="margin-top:0;">'
				} else {
					return '';
				}
			}()
		].join(''));
		return
	}
	//评审方法&汇总方式
	switch (type) {
		case 0:

			detaildivList += "<div style='float: left;line-height: 22px;font-size:14px;'><span style='color:red'>评审方法：合格制 </br>";
			detaildivList += "汇总方式： 评委全体成员按照少数服从多数（" + (datalst.totalM || "二") + "分之" + (datalst.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span></div>";

			break;
		case 1:
			detaildivList += "<div style='float: left;line-height: 22px;font-size:14px'><span style='color:red'>评审方法：评分制  " + (examType == 1 ? "权重值：" + (datalst.weight || '') : "") + "</br>";
			if (datalst.totalType == 0) {
				detaildivList += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
			} else if (datalst.totalType == 1) {
				detaildivList += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
			} else {
				if (progressList.projectCheckers[0].checkerCount >= datalst.totalType) {
					detaildivList += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
				} else {
					detaildivList += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
				}
			}
			detaildivList += '</span></div>'
			break;
		case 2:
			detaildivList += "<div style='float: left;line-height: 22px;font-size:14px;'><span style='color:red'>评审方法：偏离制</br>";

			detaildivList += "<span style='color:red'>该评审项允许最大偏离项数：" + (datalst.deviate || "") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			detaildivList += "<span style='color:red'>是否计入总数：" + (datalst.isSetTotal == 0 ? "计入总数" : "不计入总数") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			if (data.isSetTotal == 0) {
				detaildivList += "<span style='color:red'>是否"+(checkPlan == 4?'减':'加')+"价：" + (datalst.isAddPrice == 0 ? ""+(checkPlan == 4?'减':'加')+"价" : "不"+(checkPlan == 4?'减':'加')+"价") + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			}
			if (data.isAddPrice == 0) {
				detaildivList += "<span style='color:red'>偏离"+(checkPlan == 4?'减':'加')+"价幅度：" + (datalst.addPrice || "") + "%</br>";
			}
			detaildivList += "汇总方式： 评委全体成员按照少数服从多数（" + (datalst.totalM || "二") + "分之" + (datalst.totalN || "一") + "）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项偏离都将淘汰。</br>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮/下调（采购文件中特别注明的条款，其报价的浮动按具体要求执行 ）</br>" + (data.deviate ? '该评审项偏离项数超过' + data.deviate + '项将被淘汰。' : '') + "</span></div>";
			break;
		case 3:

			detaildivList += "<div style='float: left;line-height: 22px;font-size:14px;'><span style='color:red'>评审方法：评分合格制</br>";
			if (datalst.totalType == 0) {
				detaildivList += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
			} else if (datalst.totalType == 1) {
				detaildivList += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
			} else {
				if (progressList.projectCheckers[0].checkerCount >= datalst.totalType) {
					detaildivList += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
				} else {
					detaildivList += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
				}
			}
			detaildivList += "</br>当最终得分低于" + (datalst.lowerScore || "") + "分时，供应商被淘汰";
			detaildivList += '</span></div>'
			break;
	}
	$("#detaildivList").html(detaildivList)
	if (checkItemInfos.length > 0) {
		for (var x = 0; x < checkItemInfos.length; x++) {
			if (checkItemInfos[x].itemState == 1) {
				isShow = false;
				break;
			}
		}
	}

	switch (type) {
		case 0:
			detaildivcenter += '<div style="position: relative;">'
			detaildivcenter += '<div style="border-left: 4px solid #1a7acd ;height: 36px ; line-height: 36px;padding-left: 5px;margin-bottom: 10px;margin-top:10px">'
			detaildivcenter += '评审项'
			detaildivcenter += '</div>'
			detaildivcenter += "<div style='text-align: right;position: absolute; bottom: -2px;right: 10px;'>"
			if (offerFileList.length > 0) {
				detaildivcenter += "<button onclick=downloadFile(" + 0 + ") class='btn-sm btn btn-primary download'><span class='glyphicon glyphicon-save' aria-hidden='true'></span>" + datalst.checkName + "文件下载</button>"
			}
			//按钮
			if (isShow) {

				detaildivcenter += "<button id='alltrue_" + uid + "_" + suppliers[j].supplierId + "' type='button' style='margin-left:5px' class='btn btn-primary btn-sm isStopCheck' onclick='allIskey(\"0\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'><span class='glyphicon glyphicon-ok'></span>全部合格</button>";
				detaildivcenter += "<button id='allfalse_" + uid + "_" + suppliers[j].supplierId + "' type='button' style='margin-left:5px' class='btn btn-warning btn-sm isStopCheck' onclick='allIskey(\"1\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'><span class='glyphicon glyphicon-remove'></span>全部不合格</button>";
				detaildivcenter += "<button id='save_" + uid + "_" + suppliers[j].supplierId + "' type='button' style='margin-left:5px' class='btn btn-primary btn-sm isStopCheck' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'><span class='glyphicon glyphicon-saved'></span>临时保存</button>";
				detaildivcenter += "<button id='sbumit_" + uid + "_" + suppliers[j].supplierId + "' type='button' style='margin-left:5px' class='btn btn-primary btn-sm isStopCheck' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'><span class='glyphicon glyphicon-saved'></span>提交结果</button>";
			}
			detaildivcenter += '</div>'
			detaildivcenter += '</div>'
			var _H = $("#reportContent").height();
			var _ch = $("#checkResultContent").height() || 0;
			detaildivcenter += "<div style='color:red; font-size:14px;line-height: 20px;'>温馨提示：1、针对单一条款打分/评审的说明理由（包括但不限于：对客观分/项评审不一致的说明等），应填入对应条款的“原因”中。2、针对整体打分情况的说明（包括但不限于：总分高于或低于招标文件规定区间的原因等）应填写在评审页面下方的“说明”中。</div>"
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height:" + (_H - _ch - 160) + "px;'>"
				+ "<table class='table table-bordered itemChecks' style='table-layout: fixed;margin-bottom:0px'>"
				+ "<tr>"
				+ "<td width='50px' style='text-align:center'>序号</td>"
				+ "<td width='250px'>评价内容</td>"
				+ "<td width='300px'>评价标准</td>"
				+ "<td width='120px'>是否关键要求</td>"
				+ "<td width='200px'>备注</td>"
				+ "<td width='100px'>是否合格</td>"
				+ "<td width='200px'>不合格原因</td></tr>";
			//行
			for (var z = 0; z < checkItemInfos.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td style='white-space:normal;word-break: break-all;'>" + checkItemInfos[z].checkTitle + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td style='text-align:center'>" + (checkItemInfos[z].isKey == 0 ? "是" : "否") + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].remark || '') + "</td>";
				var isKey = checkItemInfos[z].itemKey;
				var reason = checkItemInfos[z].reason;
				if (isKey == 0) { //合格
					if (isShow) {
						detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
					} else {
						detaildivcenter += "<td>合格</td>";
					}
				} else if (isKey == 1) {
					if (isShow) {
						detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0'>合格</option><option value='1' selected='selected'>不合格</option></select></td>";
					} else {
						detaildivcenter += "<td>不合格</td>";
					}
				} else {
					if (isShow) {
						detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
					} else {
						detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "' disabled='disabled'><option value=''>未选择</option><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
					}
				}
				if (isShow) {
					detaildivcenter += "<td><input type='text' " + (isKey == 0 || !isKey ? 'disabled' : '') + " class='reason' id='reason_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "' value='" + (reason || '') + "'/></td></tr>";
				} else {
					detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (reason || '') + "</td></tr>";
				}
			}
			break;
		case 1:
		case 3:
			detaildivcenter += '<div style="position: relative;">'
			detaildivcenter += '<div style="border-left: 4px solid #1a7acd ;height: 36px ; line-height: 36px;padding-left: 5px;margin-bottom: 10px;margin-top:10px">'
			detaildivcenter += '评审项'
			detaildivcenter += '</div>'
			detaildivcenter += "<div style='text-align: right;position: absolute; bottom: -2px;right: 10px;'>"
			if (offerFileList.length > 0) {
				detaildivcenter += "<button onclick=downloadFile(" + 0 + ") class='btn-sm btn btn-primary download'><span class='glyphicon glyphicon-save' aria-hidden='true'></span>" + datalst.checkName + "文件下载</button>"
			}
			//按钮
			if (isShow) {

				detaildivcenter += "<button id='saveBtn_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm isStopCheck' style='margin-left:5px' onclick='saveScore(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'><span class='glyphicon glyphicon-saved'></span>临时保存</button>";
				detaildivcenter += "<button id='submitBtn_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm isStopCheck' style='margin-left:5px' onclick='saveScore(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'><span class='glyphicon glyphicon-saved'></span>提交结果</button>";

			}
			detaildivcenter += "</div>";
			detaildivcenter += "</div>";
			var _H = $("#reportContent").height();
			var _ch = $("#checkResultContent").height() || 0;
			detaildivcenter += "<div style='color:red; font-size:14px;line-height: 20px;'>温馨提示：1、针对单一条款打分/评审的说明理由（包括但不限于：对客观分/项评审不一致的说明等），应填入对应条款的“原因”中。2、针对整体打分情况的说明（包括但不限于：总分高于或低于招标文件规定区间的原因等）应填写在评审页面下方的“说明”中。</div>"
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height:" + (_H - _ch - 190) + "px;'>"
				+ "<table class='table table-bordered itemChecks' style='table-layout: fixed;margin-bottom:0px'>"
				+ "<tr><td width='50px' style='text-align:center'>序号</td>"
				+ "<td width='250px'>评价内容</td>"
				+ "<td width='300px'>评价标准</td>"
				+ "<td style='text-align:center' width='100px'>分值</td>"
				+ "<td width='200px'>备注</td>"
				+ "<td style='text-align:center' width='100px'>打分类型</td>"
				+ "<td style='text-align:center' width='100px'>得分</td>"
				+ "<td width='200px'>原因</td></tr>";
			//行
			var result = [];
			for (var z = 0; z < checkItemInfos.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td style='white-space:normal;word-break: break-all;'>" + checkItemInfos[z].checkTitle + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td style='text-align:center'>" + (checkItemInfos[z].score || '') + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].remark || '') + "</td>";

				var score = checkItemInfos[z].itemScore;
				var scoreReason = checkItemInfos[z].scoreReason;
				var itemScoreType = checkItemInfos[z].itemScoreType;

				detaildivcenter += "<td style='text-align:center'>" + (itemScoreType == 1 ? '主观分' : itemScoreType == 2 ? '客观分' : '') + "</td>";
				if (score) { //打分
					if (isShow) { //可以再提交

						detaildivcenter += "<td><input style='width:100%' class='supplierScore supplierScore_" + suppliers[j].supplierId + "_" + uid + " supplierScore_" + suppliers[j].supplierId + '_' + z + "' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + score + "'/></td>";
					} else {
						detaildivcenter += "<td style='text-align:center'>" + score + "</td>";
					}
					result.push(score * 100000000);
				} else {

					detaildivcenter += "<td><input style='width:100%' class='supplierScore supplierScore_" + suppliers[j].supplierId + "_" + uid + " supplierScore_" + suppliers[j].supplierId + '_' + z + "' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></td>";
				}
				if (isShow) {
					detaildivcenter += "<td><input type='text' class='reason' id='reason_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "' value='" + (scoreReason || '') + "'/></td>";
				} else {
					detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (scoreReason || '') + "</td>";
				}
				score = "";

			}
			detaildivcenter += '</tr></table>'
			detaildivcenter += '</div>'
			var resultL = eval(result.join('+')) / 100000000;
			detaildivcenter += "<div style='font-size:18px;margin-right:30px;margin-top:20px;height:30px;' class='text-danger'><span style='float:right;'>合计:<span class='red totleScore_" + suppliers[j].supplierId + "_" + uid + "'>" + (resultL || 0) + "</span></span></div>"
			if (isShow) { //可以再提交
				detaildivcenter +="<div><span style='vertical-align:top'>说明：</span><textarea placeholder='如需填写打分说明信息，请在提交结果前录入，限200字以内。' style='display: inline;vertical-align:top;resize:none;width:calc(100% - 50px)' type='text' id='description' class='reason form-control' maxlength='200' rows='3'>"+(checkItemInfos[0].reason?checkItemInfos[0].reason:'')+"</textarea></div>";
			}else{
				detaildivcenter +="<div><span style='vertical-align:top'>说明：</span><div style='display: inline;vertical-align:top;resize:none;width:calc(100% - 50px)'>"+(checkItemInfos[0].reason?checkItemInfos[0].reason:'')+"</div></div>";
			}
			
			break;
		case 2:
			detaildivcenter += '<div style="position: relative;">'
			detaildivcenter += '<div style="border-left: 4px solid #1a7acd ;height: 36px ; line-height: 36px;padding-left: 5px;margin-bottom: 10px;margin-top:10px">'
			detaildivcenter += '评审项'
			detaildivcenter += '</div>'
			detaildivcenter += "<div style='text-align: right;position: absolute; bottom: -2px;right: 10px;'>"
			if (offerFileList.length > 0) {
				for (var h = 0; h < offerFileList.length; h++) {
					if (offerFileList[h].id == uid && offerFileList[h].supplierId == suppliers[j].supplierId) {
						detaildivcenter += "<button type='button' onclick=downloadFile(" + h + ") class='btn-sm btn btn-primary download' ><span class='glyphicon glyphicon-save' aria-hidden='true'></span>" + datalst.checkName + "文件下载</button>"
					}
				}
			}
			//按钮
			if (isShow) {
				detaildivcenter += "<button id='alltrue_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm isStopCheck' style='margin-left:5px' onclick='allIskey(\"0\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'><span class='glyphicon glyphicon-ok'></span>全部未偏离</button>";
				detaildivcenter += "<button id='allfalse_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-warning btn-sm isStopCheck' style='margin-left:5px' onclick='allIskey(\"1\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'><span class='glyphicon glyphicon-remove'></span>全部偏离</button>";
				detaildivcenter += "<button id='save_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm isStopCheck' style='margin-left:5px' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'><span class='glyphicon glyphicon-saved'></span>临时保存</button>";
				detaildivcenter += "<button id='sbumit_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm isStopCheck' style='margin-left:5px' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'><span class='glyphicon glyphicon-saved'></span>提交结果</button>";

			}
			detaildivcenter += '</div>'
			detaildivcenter += '</div>'
			detaildivcenter += "<div style='color:red; font-size:14px;line-height: 20px;'>温馨提示：1、针对单一条款打分/评审的说明理由（包括但不限于：对客观分/项评审不一致的说明等），应填入对应条款的“原因”中。2、针对整体打分情况的说明（包括但不限于：总分高于或低于招标文件规定区间的原因等）应填写在评审页面下方的“说明”中。</div>"
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height: 400px;' >"
				+ "<table class='table table-bordered itemChecks' style='table-layout: fixed;margin-bottom:0px'>"
				+ "<tr><td width='50px' style='text-align:center'>序号</td>"
				+ "<td width='250px'>评价内容</td>"
				+ "<td width='300px'>评价标准</td>"
				+ "<td width='120px'>是否关键要求</td><td>备注</td>"
				+ "<td width='100px'>是否偏离</td>"
				+ "<td width='200px'>偏离原因</td></tr>";
			//行
			for (var z = 0; z < checkItemInfos.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td style='white-space:normal;word-break: break-all;'>" + checkItemInfos[z].checkTitle + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td style='text-align:center'>" + (checkItemInfos[z].isKey == 0 ? "是" : "否") + "</td>";
				detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (checkItemInfos[z].remark || '') + "</td>";
				var isKey = checkItemInfos[z].itemKey;
				var reason = checkItemInfos[z].reason;
				if (isKey != 5) {
					if (isKey == 0) {
						if (isShow) {
							detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
						} else {
							detaildivcenter += "<td>未偏离</td>";
						}

					} else if (isKey == 1) {
						if (isShow) {
							detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0'>未偏离</option><option value='1' selected='selected'>偏离</option></select></td>";
						} else {
							detaildivcenter += "<td>偏离</td>";
						}
					} else {
						if (isShow) {
							detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value='' >未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
						} else {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'  disabled='disabled'><option value=''>未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
						}
					}
					if (isShow) {
						detaildivcenter += "<td><input type='text' " + (isKey == 0 || !isKey ? 'disabled' : '') + " class='reason' id='reason_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "' value='" + (reason || '') + "'/></tr>";
					} else {
						detaildivcenter += "<td style='white-space:normal;word-break: break-all;'>" + (reason || '') + "</tr>";
					}
				} else {
					detaildivcenter += "<td><select class='isKey' data-index='" + j + "' data-size='" + z + "' id='isKey_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
					detaildivcenter += "<td><input type='text' " + (isKey == 0 || !isKey ? 'disabled' : '') + " class='reason' id='reason_" + suppliers[j].supplierId + "_" + checkItemInfos[z].id + "'/></tr>";
				}
			}
			detaildivcenter += '</table>'
			detaildivcenter += '</div>'
			break;
	}
	
	$("#TabContent_" + uid).html(detaildivcenter);
	tatile(suppliers[j].supplierId, uid);
	$('.isKey').off('change');
	$('.isKey').on('change', function () {
		var _j = $(this).data('index');
		var _z = $(this).data('size');
		if ($(this).val() == 1) {
			$('#reason_' + suppliers[_j].supplierId + "_" + packageCheckItems[_z].id).attr('disabled', false);
		} else {
			$('#reason_' + suppliers[_j].supplierId + "_" + packageCheckItems[_z].id).attr('disabled', true);
			$('#reason_' + suppliers[_j].supplierId + "_" + packageCheckItems[_z].id).val('')
		}

	})
}
//文件下载
function downloadFile(h) {
	var newUrl = loadFile + "?ftpPath=" + offerFileList[h].filePath + "&fname=" + offerFileList[h].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
function loadExcel(uid, enterpriseName, checkName) {
	var urls = url + "/PackageCheckItemController/outPackageCheckItemByExcel.do?packageCheckListId=" + uid + '&exclName=' + enterpriseName + checkName + '的评审打分';
	window.location.href = $.parserUrlForToken(urls);
}
//评委保存评分  综合评分法
function saveScore(supplierId, packageCheckListId, checkType, itemState) {
	fandChangCheckState(packageId);
	if (changType) {
		return false;
	}
	var reason = $('#description').val();
	if(reason != '' && reason.length > 200){
		top.layer.alert("温馨提示：说明200字以内（含）");
		return
	}
	//var mask =parent.layer.load(0, {shade: [0.3, '#000000']});
	var data = packageCheckItems;
	for (var i = 0; i < data.length; i++) {
		if (packageCheckListId == data[i].packageCheckListId) {
			if (itemState == 1) {
				if ($("#" + supplierId + "_" + data[i].id).val() == "") {
					top.layer.alert("温馨提示：请输入第" + (i + 1) + "项的完整打分");
					return false;
				}
				if (parseFloat($("#" + supplierId + "_" + data[i].id).val()) > parseFloat(data[i].score)) {
					top.layer.alert("温馨提示：第" + (i + 1) + "项的得分大于分值");
					return false;
				}
			}
		}
	}
	var tempKey = "";
	var tempId = "";
	var tempPackageCheckItemId = "";
	var tempScore = "";
	var tempReason = "";
	for (var i = 0; i < data.length; i++) {
		if (packageCheckListId == data[i].packageCheckListId) {
			if (i == 0) {
				if ($("#" + supplierId + "_" + data[i].id).val()) {
					tempScore = $("#" + supplierId + "_" + data[i].id).val().replace(/\s*/g, "");
				} else {
					tempScore = "~";
				}
				if ($("#reason_" + supplierId + "_" + data[i].id).val()) {
					tempReason = $("#reason_" + supplierId + "_" + data[i].id).val();
				} else {
					tempReason = "~";
				}
				tempKey = "~";
				tempPackageCheckItemId = data[i].id;
			}
			else {
				if ($("#" + supplierId + "_" + data[i].id).val()) {
					tempScore += "@" + $("#" + supplierId + "_" + data[i].id).val().replace(/\s*/g, "");
				} else {
					tempScore += "@" + "~";
				}
				if ($("#reason_" + supplierId + "_" + data[i].id).val()) {
					tempReason += "@" + $("#reason_" + supplierId + "_" + data[i].id).val();
				} else {
					tempReason += "@" + "~";
				}
				tempKey += "@" + "~";
				tempPackageCheckItemId += "@" + data[i].id;
			}
			if (data[i].supplierId == supplierId) {
				if (tempId == "") {
					if (data[i].id) {
						tempId = data[i].id;
					} else {
						tempId = "~";
					}

				} else {
					if (data[i].id) {
						tempId += "@" + data[i].id;
					} else {
						tempId += "@" + "~";
					}
				}
			}
		}
	}

	var para = {
		"supplierCount": suppliers.length,
		"expertId": expertIds,
		"checkType": checkType,
		"projectId": projectId,
		"packageId": packageId,
		"supplierId": supplierId,
		"packageCheckListId": packageCheckListId,
		"isKey": tempKey,
		"scoreReason": tempReason,
		"reason": reason,
		"score": tempScore,
		"packageCheckItemId": tempPackageCheckItemId,
		"itemState": itemState,
		"tempKey": "",
		"id": tempId,
		"tempType": 1,
		"examType": examType,
	};
	$.ajax({
		type: "post",
		url: url + "/ExpertCheckController/judgesScore.do",
		data: para,
		success: function (ret) {
			//parent.layer.close(mask);
			if (ret.success) //执行保存方法
			{
				if (itemState == 1) {
					$('#Tab_' + packageCheckListId + ' li.active a').click()
					getData();
				}

			} else {
				top.layer.alert(ret.message);
			}
		}
	});
}

//全部合格||全部不合格
function allIskey(key, supplierId, packageCheckLists) {
	var data = packageCheckItems;
	for (var i = 0; i < data.length; i++) {
		if (packageCheckLists == packageCheckItems[i].packageCheckListId) {
			$("#isKey_" + supplierId + "_" + data[i].id).val(key);
		}
	}
	if (key == 1) {
		$('.reason').attr('disabled', false)
	} else {
		$('.reason').attr('disabled', true);
		$('.reason').val("");
	}
}

//点击提交结果  最低评标价法
function sbumitIskey(supplierId, packageCheckListId, checkType, itemState) {
	fandChangCheckState(packageId)
	if (changType) {
		return false;
	}
	var data = packageCheckItems;
	if (itemState == 1) {
		for (var i = 0; i < data.length; i++) {
			if (packageCheckListId == data[i].packageCheckListId) {
				if ($("#isKey_" + supplierId + "_" + data[i].id).val() == "") {
					top.layer.alert("温馨提示：请完善评审结果再提交");
					return false;
				}
				if ($("#isKey_" + supplierId + "_" + data[i].id).val() == "1" && $.trim($("#reason_" + supplierId + "_" + data[i].id).val()) == '') {
					top.layer.alert("温馨提示：请填写第" + (i + 1) + "项不合格或偏离原因再提交");
					return false;
				}
			}
		}
	}

	var tempIsKey = "";
	var tempReason = "";
	var tempKey = "";
	var tempId = "";
	var tempPackageCheckItemId = "";
	for (var i = 0; i < data.length; i++) {
		if (packageCheckListId == data[i].packageCheckListId && $("#isKey_" + supplierId + "_" + data[i].id).val() != "") {
			if (i == 0) {
				tempIsKey = $("#isKey_" + supplierId + "_" + data[i].id).val();
				if ($("#reason_" + supplierId + "_" + data[i].id).val()) {
					tempReason = $("#reason_" + supplierId + "_" + data[i].id).val();
				} else {
					tempReason = "~";
				}
				tempKey = data[i].isKey;
				tempPackageCheckItemId = data[i].id;
			}
			else {
				tempIsKey += "@" + $("#isKey_" + supplierId + "_" + data[i].id).val();
				if ($("#reason_" + supplierId + "_" + data[i].id).val()) {
					tempReason += "@" + $("#reason_" + supplierId + "_" + data[i].id).val();
				} else {
					tempReason += "@" + "~";
				}
				tempKey += "@" + data[i].isKey;
				tempPackageCheckItemId += "@" + data[i].id;
			}
			if (data[i].supplierId == supplierId) {
				if (tempId == "") {
					if (data[i].id) {
						tempId = data[i].id;
					} else {
						tempId = "~";
					}

				} else {
					if (data[i].id) {
						tempId += "@" + data[i].id;
					} else {
						tempId += "@" + "~";
					}
				}
			}

		}
	}

	var para = {
		"supplierCount": suppliers.length,
		"expertId": expertIds,
		"checkType": checkType,
		"projectId": projectId,
		"packageId": packageId,
		"supplierId": supplierId,
		"packageCheckListId": packageCheckListId,
		"isKey": tempIsKey,
		"reason": tempReason,
		"score": 0,
		"packageCheckItemId": tempPackageCheckItemId,
		"itemState": itemState,
		"tempKey": tempKey,
		"id": tempId,
		"examType": examType
	};

	$.ajax({
		type: "post",
		url: url + "/ExpertCheckController/judgesScore.do",
		data: para,
		success: function (data) {
			if (data.success) //执行保存方法
			{
				if (itemState == 1) {
					$('#Tab_' + packageCheckListId + ' li.active a').click()
					getData();
				}
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

function tatile(liId, uid) {
	$(".supplierScore_" + liId + '_' + uid).on('change', function () {
		var Score = $(this).parent().siblings().eq(3).html();
		var reg = /^\d+(\.\d{1,2})?$/;

		if (!(reg.test($(this).val()))) {
			parent.layer.alert('温馨提示：分值必须大于等于零,且小数点后面最多两位小数');
			$(this).val("");
			return false;
		};
		if (parseFloat($(this).val()) > parseFloat(Score)) {
			parent.layer.alert('温馨提示：不能超过' + Score + '分');
			return;
		}
		var result = [];
		$(".supplierScore_" + liId + '_' + uid).each(function () {
			if ($(this).val() !== "") {
				result.push($(this).val() * 100000000);
			}
		});
		var resultL = eval(result.join('+')) / 100000000;
		$('.totleScore_' + liId + '_' + uid).html(resultL)
	})
};
/* ***************                  评审确认                      ************************* */
function openSunmmaryResult(eId, cId, examType){
	if(isOpenSunmmary){
		return
	}
	top.layer.open({
		type: 2,
		// title: reviewNode.nodeName + "评标汇总",
		title: "评标汇总",
		area: ['100%', '100%'],
		resize: false,
		content: summaryResult + '?expertIds=' + eId + '&examType=' + examType + '&packageCheckListId=' + cId + '&projectId=' + projectId,
		success: function (layero, index) {
		    var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(){
				$("#btnRefresh").click();
			});
		    isOpenSunmmary = true;
		},
		end: function () {
		    isOpenSunmmary = false;
		}
	});
}
//原因
function openReasonSummer(eId, cId, examType){
	if(isOpenReason){
		return
	}
	top.layer.open({
		type: 2,
		// title: reviewNode.nodeName + "评标汇总",
		title: "评分原因",
		area: ['100%', '100%'],
		resize: false,
		content: reasonSummer + '?expertIds=' + eId + '&examType=' + examType + '&packageCheckListId=' + cId,
		success: function (layero, index) {
		    var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(){
		    	$("#btnRefresh").click();
		    });
		    isOpenReason = true;
		
		},
		end: function () {
		    isOpenReason = false;
		}
	});
}