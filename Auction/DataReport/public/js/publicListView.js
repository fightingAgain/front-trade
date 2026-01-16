var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do' //根据项目ID获取所有项目信息内容
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var resetListUrl = top.config.AuctionHost + '/BusinessStatisticsController/findModifyLog.do';//查询修改招标人/委托单位记录
var projectData = [];
var isCheck;
var WORKFLOWTYPE = "ywtjb";
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var id = $.getUrlParam('id');
var edittype = "detailed"; //查看还是审核detailed查看  audit审核
var fileUploads = null;
var businessId = getUrlParam('id');
var type = getUrlParam('type');
// var pageUrlParams = getUrlParamObject(PAGEURL);
// var tenderType = pageUrlParams.tenderType;
var processType = $.getUrlParam('processType');
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
	if(projectId) {
		// findWorkflowCheckerAndAccp(projectId); //审核
		Purchase(projectId);

	}
	if(packageId) {
		// findWorkflowCheckerAndAccp(packageId); //审核
		Purchase(packageId);

	}
	findWorkflowCheckerAndAccp(id);
	if(projectData.tenderType != "4") {
		if($("#bidSectionCode").html() == projectData.bidSectionCode) {
			$("#bidSectionCode").html(projectData.bidSectionCode);
			$("#changeNameCz").hide();
			$("#changeName").show();
		} else {
			$("#bidSectionCode").html(projectData.interiorProjectCode);
			$("#changeNameCz").show();
			$("#changeName").hide();
		}
	} else {
		$("#changeNameCz").hide();
		$("#changeName").hide();
	}
})
//编号切换
$('#changeName').click(function() {
	$("#bidSectionCode").html(projectData.interiorProjectCode);
	$("#changeNameCz").show();
	$("#changeName").hide();
})
$("#changeNameCz").click(function() {
	$("#bidSectionCode").html(projectData.bidSectionCode);
	$("#changeNameCz").hide();
	$("#changeName").show();
})
//获取询比公告发布的数据
function Purchase(uid) {
	$.ajax({
		url: flage == 1 ? findPurchaseUrl : findPurchaseURLHasId, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'post',
		async: false,
		dataType: 'json',
		data: {
			'tenderProjectID': uid,
		},
		success: function(data) {
			projectData = data.data;
			bidSectionId = projectData.bidSectionId;
			if(projectData.id){
				flage=2
			}
			getResetList();
			PurchaseData();
			/* ***********************    增加项目登记的业务统计报表    ************************ */
			if(projectData.processType == 3){
				$('.bidOpenTime').text('开标时间');
				$('.business, .files').show();
				// $('#noticeSendTime, #bidOpenTime, #noticeStartDate, #tenderMode, #bidCheckType, #tenderDesk, #tenderType, .noBusiness').hide();
			}
			if(projectData.processType == 3){
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + (packageId?packageId:projectId) + "/" + businessId + "/703",
						businessId: businessId,
						status: 2,
						businessTableName: 'T_BUSINESS_STATISTICS',
						tenderType: 0,
					}, '', '0');
				}
				if(projectData.purFile) {
					fileUploads.fileHtml(projectData.purFile);
				}
			}
			if (projectData.feeConfirmVersion == 2) {
				$('.feeConfirmVersion').show();
			} else {
				$('.feeConfirmVersion').hide();
			}
		}
	});
};

function PurchaseData() {
	changeFeeColor();
	//渲染公告的数据
	for(key in projectData) {
		if(key == 'marketType') {
			if(projectData[key] == 'DF') {
				$("#" + key).html('内部市场')
			}
			if(projectData[key] == 'JP') {
				$("#" + key).html('社会军品')
			}
			if(projectData[key] == 'SH') {
				$("#" + key).html('社会民品')
			}
		} else if(key == "projectImplementAdder") {
			//		$("#projectImplementAdder").html(projectData.projectImplementAdder)

			let areaCode = projectData[key];
			var strName = "";
			$.ajaxSettings.async = false;
			$.getJSON('../../../../media/js/base/prov-city.json', function(data) {
				for(var i = 0; i < data.length; i++) {
					if(data[i].code == areaCode) {
						strName += data[i].name;
						return;
					}
					for(var j = 0; j < data[i].childs.length; j++) {
						if(data[i].childs[j].code == areaCode) {
							strName += data[i].name + "  " + data[i].childs[j].name;
							return;
						}
						for(var k = 0; k < data[i].childs[j].childs.length; k++) {
							if(data[i].childs[j].childs[k].code == areaCode) {
								strName += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
								return;
							}
						}
					}
				}
			});
			$("#" + key).html(strName);

		} else if(key == "bidOpenAdder") {
			let areaCode2 = projectData[key];
			var strName2 = "";
			$.ajaxSettings.async = false;
			$.getJSON('../../../../media/js/base/prov-city.json', function(data) {
				for(var i = 0; i < data.length; i++) {
					if(data[i].code == areaCode2) {
						strName2 += data[i].name;
						return;
					}
					for(var j = 0; j < data[i].childs.length; j++) {
						if(data[i].childs[j].code == areaCode2) {
							strName2 += data[i].name + "  " + data[i].childs[j].name;
							return;
						}
						for(var k = 0; k < data[i].childs[j].childs.length; k++) {
							if(data[i].childs[j].childs[k].code == areaCode2) {
								strName2 += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
								return;
							}
						}
					}
				}
			});
			$("#" + key).html(strName2);
		} else if(key == "compositeServiceSubtoral") {
			$("#" + key).html(projectData[key].toFixed(2))
		} else if(key == "projectCostSubtotal") {
			$("#" + key).html(projectData[key].toFixed(2))
		} else if(key == "publlcProcurement") {
			$("#" + key).html(projectData[key]==1?"否":projectData[key]==="0"?"是":"");
		} else {
			$("#" + key).html(projectData[key]);
		}

	}
	//-------------------------------------------------------------------
	if(projectData.reviewFeeSubtotal != undefined || projectData.reviewFeeSubtotal != null) {
		$("#reviewFeeSubtotal").html() == $("#reviewFeeSubtotal").html(projectData.reviewFeeSubtotal)
		var toNum = $("#reviewFeeSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#reviewFeeSubtotal").html(num.join(".") + '元');
	} else {
		$("#reviewFeeSubtotal").html('' + '元')
	}

	//-------------------------------------------------------------------
	if(projectData.staffCostSubtotal != undefined || projectData.staffCostSubtotal != null) {
		$("#staffCostSubtotal").html() == $("#staffCostSubtotal").html(projectData.staffCostSubtotal)
		var toNum = $("#staffCostSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#staffCostSubtotal").html(num.join(".") + '元');
	} else {
		$("#staffCostSubtotal").html('' + '元')
	}

	//-------------------------------------------------------------------
	if(projectData.serviceFeleSubtotal != undefined || projectData.serviceFeleSubtotal != null) {
		$("#serviceFeleSubtotal").html() == $("#serviceFeleSubtotal").html(projectData.serviceFeleSubtotal)
		var toNum = $("#serviceFeleSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#serviceFeleSubtotal").html(num.join(".") + '元');
	} else {
		$("#serviceFeleSubtotal").html('' + '元')
	}

	//-------------------------------------------------------------------
	if(projectData.projectCostSubtotal != undefined || projectData.projectCostSubtotal != null) {
		$("#projectCostSubtotal").html() == $("#projectCostSubtotal").html(projectData.projectCostSubtotal)
		var toNum = $("#projectCostSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#projectCostSubtotal").html(num.join(".") + '元');
	} else {
		$("#projectCostSubtotal").html('' + '元')
	}

	//-------------------------------------------------------------------
	if(projectData.dealTotalAmount != undefined || projectData.dealTotalAmount != null) {
		$("#dealTotalAmount").html() == $("#dealTotalAmount").html(projectData.dealTotalAmount)
		var toNum = $("#dealTotalAmount").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#dealTotalAmount").html(num.join(".") + '元');
	} else {
		$("#dealTotalAmount").html('' + '元')
	}

	//-------------------------------------------------------------------

	if(projectData.contractSettlementPriceSum != undefined || projectData.contractSettlementPriceSum != null) {
		if(projectData.tenderType == 4) {
			if(flage == "1") {
				var tonumList = projectData.contractSettlementPriceSum * 10000
				$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(tonumList)
				var toNum = $("#contractSettlementPriceSum").html().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#contractSettlementPriceSum").html(num.join(".") + '元');
			} else {
				$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(projectData.contractSettlementPriceSum)
				var toNum = $("#contractSettlementPriceSum").html().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#contractSettlementPriceSum").html(num.join(".") + '元');
			}

		} else {
			$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(projectData.contractSettlementPriceSum)
			var toNum = $("#contractSettlementPriceSum").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#contractSettlementPriceSum").html(num.join(".") + '元');
		}

	} else {
		$("#contractSettlementPriceSum").html('' + '元')
	}

	//--------------------------------------------------------------------
	if(projectData.agencyServiceNoFee != undefined || projectData.agencyServiceNoFee != null) {
		$("#agencyServiceNoFee").html() == $("#agencyServiceNoFee").html(projectData.agencyServiceNoFee)
		var toNum = $("#agencyServiceNoFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#agencyServiceNoFee").html(num.join(".") + '元');
	} else {
		$("#agencyServiceNoFee").html('' + '元')
	}

	//-------------------------------------------------------------------
	if(projectData.agencyServiceFee != undefined || projectData.agencyServiceFee != null) {
		$("#agencyServiceFee").html() == $("#agencyServiceFee").html(projectData.agencyServiceFee)
		var toNum = $("#agencyServiceFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#agencyServiceFee").html(num.join(".") + '元');
	} else {
		$("#agencyServiceFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.costConsultingFee != undefined || projectData.costConsultingFee != null) {
		$("#costConsultingFee").html() == $("#costConsultingFee").html(projectData.costConsultingFee)
		var toNum = $("#costConsultingFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#costConsultingFee").html(num.join(".") + '元');
	} else {
		$("#costConsultingFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.totalBidAmount != undefined || projectData.totalBidAmount != null) {
		$("#totalBidAmount").html() == $("#totalBidAmount").html(projectData.totalBidAmount)
		var toNum = $("#totalBidAmount").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#totalBidAmount").html(num.join(".") + '元');
	} else {
		$("#totalBidAmount").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.notCostConsultingFee != undefined || projectData.notCostConsultingFee != null) {
		$("#notCostConsultingFee").html() == $("#notCostConsultingFee").html(projectData.notCostConsultingFee)
		var toNum = $("#notCostConsultingFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#notCostConsultingFee").html(num.join(".") + '元');
	} else {
		$("#notCostConsultingFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.haveCostConsultingFee != undefined || projectData.haveCostConsultingFee != null) {
		$("#haveCostConsultingFee").html() == $("#haveCostConsultingFee").html(projectData.haveCostConsultingFee)
		var toNum = $("#haveCostConsultingFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#haveCostConsultingFee").html(num.join(".") + '元');
	} else {
		$("#haveCostConsultingFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	//成交人合计报价金额(元)
	if(projectData.dealTotalAmount != undefined || projectData.dealTotalAmount != null) {
		if(projectData.tenderType == 4) {
			$("#dealTotalAmount").html()
		} else {
			$("#dealTotalAmount").html() == $("#dealTotalAmount").html(projectData.dealTotalAmount)
			var toNum = $("#dealTotalAmount").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#dealTotalAmount").html(num.join(".") + '元');
		}
	} else {
		$("#dealTotalAmount").html('' + '元');
	}
	let tenderDesk = projectData["tenderDesk"];
	let tenderMode = projectData["tenderMode"];
	if(tenderMode == 1 || tenderMode == 0) {
		$("#tenderMode").html("公开");
	} else if(tenderMode == 2) {
		$("#tenderMode").html("邀请");
	}
	if(projectData.tenderType == 13) {
		$("#tenderType").html("竞争性磋商");
	} else if(projectData.tenderType == 12) {
		$("#tenderType").html("竞争性谈判");
	} else if(projectData.tenderType == 6) {
		$("#tenderType").html("单一来源");
		//成交金额
		$(".fzb").show();
		//$("#dealTotalAmount").html(projectData.dealTotalAmount);
		//委托金额（预算）

		if(projectData.entrsuSum) {
			$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum);
			var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#entrsuSum").html(num.join("."));
		} else {
			$("#entrsuSum").html('0 元');
		}

		//项目类型
		/**
		 * 线上
		 * {
		 * 	0: '建安工程',
		 *  1: '国内货物',
		 *  9: '国际货物',
		 * 	2: '服务',
		 *  3: '广宣',
		 *  4: '废旧物资',
		 * }
		 * 线下
		 * {
            "1": "工程类型",
            "2": "国内货物",
            "3": "国际招标",
            "4": "服务类型",
            "5": "广宣平台",
        },
		 */
		//评审办法
		if(projectData.processType == 3){
			$("#bidCheckType").html(projectData.bidCheckType);
		}else{
			if(projectData.bidCheckType == 0) {
				$("#bidCheckType").html('综合评分法')
			}
			if(projectData.bidCheckType == 1) {
				$("#bidCheckType").html('最低评标价法')
			}
			if(projectData.bidCheckType == 2) {
				$("#bidCheckType").html('经评审最低价法')
			}
			if(projectData.bidCheckType == 3) {
				$("#bidCheckType").html('最低投标价法')
			}
			if(projectData.bidCheckType == 4) {
				$("#bidCheckType").html('经评审的最高投标价法')
			}
			if(projectData.bidCheckType == 5) {
				$("#bidCheckType").html('经评审的最低投标价法')
			}
		}
		if(projectData.projectType == '0') {
			$("#projectType").html('建安工程')
		} else if(projectData.projectType == '1') {
			$("#projectType").html('国内货物')
		} else if(projectData.projectType == '9') {
			$("#projectType").html('国际货物')
		} else if(projectData.projectType == '2') {
			$("#projectType").html('服务')
		} else if(projectData.projectType == '3') {
			$("#projectType").html('广宣')
		} else if(projectData.projectType == '4') {
			$("#projectType").html('废旧物资')
		}
	} else if(projectData.tenderType == 0 ) {
		$("#tenderType").html("询价采购");
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.creatTime);
		//成交金额
		$(".fzb").show();
		//$("#dealTotalAmount").html(projectData.dealTotalAmount);
		//委托金额（预算）
		if(projectData.entrsuSum) {
			$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum);
			var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#entrsuSum").html(num.join("."));
		} else {
			$("#entrsuSum").html('0 元');
		}
		//评审办法
		if(projectData.processType == 3){
			$("#bidCheckType").html(projectData.bidCheckType);
		}else{
			if(projectData.bidCheckType == 0) {
				$("#bidCheckType").html('综合评分法')
			}
			if(projectData.bidCheckType == 1) {
				$("#bidCheckType").html('最低评标价法')
			}
			if(projectData.bidCheckType == 2) {
				$("#bidCheckType").html('经评审最低价法')
			}
			if(projectData.bidCheckType == 3) {
				$("#bidCheckType").html('最低投标价法')
			}
			if(projectData.bidCheckType == 4) {
				$("#bidCheckType").html('经评审的最高投标价法')
			}
			if(projectData.bidCheckType == 5) {
				$("#bidCheckType").html('经评审的最低投标价法')
			}
		}
		//项目类型
		if(projectData.projectType == '0') {
			$("#projectType").html('建安工程')
		} else if(projectData.projectType == '1') {
			$("#projectType").html('国内货物')
		} else if(projectData.projectType == '9') {
			$("#projectType").html('国际货物')
		} else if(projectData.projectType == '2') {
			$("#projectType").html('服务')
		} else if(projectData.projectType == '3') {
			$("#projectType").html('广宣')
		} else if(projectData.projectType == '4') {
			$("#projectType").html('废旧物资')
		}
	} else if(projectData.tenderType == 1) {
		$("#tenderType").html("竞价采购");
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.offerStartDate);
		//成交金额
		$(".fzb").show();
		//$("#dealTotalAmount").html(projectData.dealTotalAmount);
		//委托金额（预算）
		//		if(projectData.entrsuSum) {
		//			if(projectData.bidCheckType == 6 || projectData.bidCheckType == 7) {
		//				var entrsuSumList2 = projectData.entrsuSum
		//				//$("#entrsuSum").html(Number(entrsuSumList2).toFixed(2) + '元');
		//				$("#entrsuSum").html() == $("#entrsuSum").html(Number(entrsuSumList2));
		//				var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
		//				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		//				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		//				$("#entrsuSum").html(num.join(".") + '元');
		//			} else {
		//				//var entrsuSumList = projectData.entrsuSum * 10000
		//				//$("#entrsuSum").html(entrsuSumList.toFixed(2) + '元');
		//				$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum)
		//				var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
		//				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		//				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		//				$("#entrsuSum").html(num.join(".") + '元');
		//			}
		//		} else {
		//			$("#entrsuSum").html('0 元');
		//		}

		//委托金额（预算）

		if(projectData.entrsuSum) {
			if(projectData.bidCheckType == 6 || projectData.bidCheckType == 7) {
				var entrsuSumList2 = projectData.entrsuSum
				$("#entrsuSum").html() == $("#entrsuSum").html(Number(entrsuSumList2));
				var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").html(num.join("."));
			} else {
				$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum)
				var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").html(num.join("."));
			}

		} else {
			$("#entrsuSum").html('0 元');
		}

		//评审办法 	自由竞价 单轮竞价 多轮竞价 不限轮次 清单式竞价 单项目竞价
		if(projectData.processType == 3){
			$("#bidCheckType").html(projectData.bidCheckType);
		}else{
			if(projectData.bidCheckType == 0) {
				$("#bidCheckType").html('自由竞价')
			}
			if(projectData.bidCheckType == 1) {
				$("#bidCheckType").html('单轮竞价')
			}
			if(projectData.bidCheckType == 2) {
				$("#bidCheckType").html('多轮竞价(2)轮')
			}
			if(projectData.bidCheckType == 3) {
				$("#bidCheckType").html('多轮竞价(3)轮')
			}
			if(projectData.bidCheckType == 5) {
				$("#bidCheckType").html('多轮竞价')
			}
			if(projectData.bidCheckType == 4) {
				$("#bidCheckType").html('不限轮次')
			}
			if(projectData.bidCheckType == 6) {
				$("#bidCheckType").html('清单式竞价')
			}
			if(projectData.bidCheckType == 7) {
				$("#bidCheckType").html('单项目竞价')
			}
		}
		//项目类型
		if(projectData.projectType == '0') {
			$("#projectType").html('建安工程')
		} else if(projectData.projectType == '1') {
			$("#projectType").html('国内货物')
		} else if(projectData.projectType == '9') {
			$("#projectType").html('国际货物')
		} else if(projectData.projectType == '2') {
			$("#projectType").html('服务')
		} else if(projectData.projectType == '3') {
			$("#projectType").html('广宣')
		} else if(projectData.projectType == '4') {
			$("#projectType").html('废旧物资')
		}
	} else if(projectData.tenderType == 2) {
		$("#tenderType").html("竞卖采购");
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.offerStartDate);
		//成交金额
		$(".fzb").show();
		//$("#dealTotalAmount").html(projectData.dealTotalAmount);
		//委托金额（预算）

		if(projectData.entrsuSum) {
			$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum);
			var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#entrsuSum").html(num.join("."));
		} else {
			$("#entrsuSum").html('0 元');
		}

		//评审办法  自由竞卖 单轮竞卖 多轮竞卖
		if(projectData.processType == 3){
			$("#bidCheckType").html(projectData.bidCheckType);
		}else{
			if(projectData.bidCheckType == 0) {
				$("#bidCheckType").html('自由竞卖')
			}
			if(projectData.bidCheckType == 1) {
				$("#bidCheckType").html('单轮竞卖')
			}
			if(projectData.bidCheckType == 2) {
				$("#bidCheckType").html('多轮竞卖(2)轮')
			}
			if(projectData.bidCheckType == 3) {
				$("#bidCheckType").html('多轮竞卖(3)轮')
			}
			if(projectData.bidCheckType == 4) {
				$("#bidCheckType").html('多轮竞卖')
			}
		}
		//项目类型
		if(projectData.projectType == '0') {
			$("#projectType").html('建安工程')
		} else if(projectData.projectType == '1') {
			$("#projectType").html('国内货物')
		} else if(projectData.projectType == '9') {
			$("#projectType").html('国际货物')
		} else if(projectData.projectType == '2') {
			$("#projectType").html('服务')
		} else if(projectData.projectType == '3') {
			$("#projectType").html('广宣')
		} else if(projectData.projectType == '4') {
			$("#projectType").html('废旧物资')
		}
	} else if(projectData.tenderType == 16) {
		$("#tenderType").html("预研");
	} else if(projectData.tenderType == 4) {
		$("#tenderType").html("招标采购");
		//成交金额
		$(".fzb").hide();
		//开标时间
		$("#bidOpenTime").html(projectData.bidOpenTime);
		//评审办法
		if(projectData.processType == 3){
			$("#bidCheckType").html(projectData.bidCheckType);
		}else{
			if(processType == '2') {
				var text = '';
				switch (projectData.bidCheckType) {
					case '1': text = '合格制'; break;
					case '2': text = '有限数量制'; break;
					case '3': text = '经评审的最低投标价法'; break;
					case '4': text = '最低投标价法'; break;
					case '5': text = '最低评标价法'; break;
					case '6': text = '经评审的最低投标价法（非日产）'; break;
					case '7': text = '经评审的最低投标价法（日产）'; break;
					case '9': text = '综合评估法(无权重)'; break;
					case '10': text = '综合评估法(权重)'; break;
					default: break;
				}
				$("#bidCheckType").html(text);
			} else {
				$("#bidCheckType").attr("optionName", "checkType" + projectData.projectType.substring(0, 1));
				optionValueView($("#bidCheckType"),projectData.bidCheckType);
			}
		}
		/* if(projectData.bidCheckType == 3) {
			$("#bidCheckType").html('经评审的最低投标价法')
		}
		if(projectData.bidCheckType == 4) {
			$("#bidCheckType").html('最低投标价法')
		}
		if(projectData.bidCheckType == 5) {
			$("#bidCheckType").html('最低评标价法')
		}
		if(projectData.bidCheckType == 6) {
			$("#bidCheckType").html('经评审的最低投标价法（非日产）')
		}
		if(projectData.bidCheckType == 7) {
			$("#bidCheckType").html('经评审的最低投标价法（日产）')
		}
		if(projectData.bidCheckType == 9) {
			$("#bidCheckType").html('综合评估法(无权重)')
		}
		if(projectData.bidCheckType == 10) {
			$("#bidCheckType").html('综合评估法(权重)')
		} */
		//项目类型
		projectType = projectData.projectType;
		if (processType == '2') {
			var dic = {
				"1": "工程类型",
				"2": "国内货物",
				"3": "国际招标",
				"4": "服务类型",
				"5": "广宣平台",
			}
			$("#projectType").html(dic[projectData.projectType] || '-')
		} else {
			if(projectData.projectType == 'A') {
				$("#projectType").html('建安工程')
			} else if(projectData.projectType == 'B') {
				$("#projectType").html('国内货物')
			} else if(projectData.projectType == '9') {
				$("#projectType").html('国际货物')
			} else if(projectData.projectType == 'C') {
				$("#projectType").html('服务')
			} else if(projectData.projectType == 'C50') {
				$("#projectType").html('广宣')
			} else if(projectData.projectType == '4') {
				$("#projectType").html('废旧物资')
			}
		}
		if(projectData.entrsuSum) {
			$("#entrsuSum").html() == $("#entrsuSum").html(projectData.entrsuSum);
			var toNum = $("#entrsuSum").html().replace(/\,|\￥/g, "")
			var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
			num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
			$("#entrsuSum").html(num.join("."));
		} else {
			$("#entrsuSum").html('0 元');
		}

		
		
	}
	$("#projectDepartmentName").html(projectData.projectDepartmentName);
	if(projectData.projectOfficeName) {
		$("#projectOfficeName").html(projectData.projectOfficeName);
	} else {
		$("#projectOfficeName").html(projectData.projectDepartmentName);
	}
	/* if(projectData["exception"]) {
		$(".exceptionView1").show();
		$(".exceptionView2").show();
	} */
	if(projectData.isObjection == 0) {
		$("#isObjection").html('否')
	} else if(projectData.isObjection == 1) {
		$("#isObjection").html('是')
	}
	// 正常结束（已发通知书）/已发放通知书，项目取消/经评审有候选人，但未发通知书/经评审无候选人/已发公告，未开标/已建项，未启动
	if(projectData.projectState == 1) {
		$("#projectState").html("正常结束且已发通知书");
	} else if(projectData.projectState == 2) {
		$("#projectState").html("流标未产生收入也未发生费用");
	} else if(projectData.projectState == 3) {
		$("#projectState").html("流标但已产生收入或已发生费用");
	} else if(projectData.projectState == 4) {
		$("#projectState").html("正常结束（已发通知书）");
	} else if(projectData.projectState == 5) {
		$("#projectState").html("已发放通知书，项目取消");
	} else if(projectData.projectState == 6) {
		$("#projectState").html("经评审有候选人，但未发通知书时项目取消");
	} else if(projectData.projectState == 7) {
		$("#projectState").html("经评审无候选人");
	} else if(projectData.projectState == 8) {
		$("#projectState").html("已发公告，未开标");
	} else if(projectData.projectState == 9) {
		$("#projectState").html("已建项，未启动");
	}
	if (processType == '2') {
		var dic = {
            '1': '平台',
            '2': '政府平台',
            '3': '国际招标平台',
            '4': '其他',
        }
		$("#tenderDesk").html(dic[projectData.tenderDesk] || '-');
	} else {
		//交易类型
		if(projectData.tenderDesk == "0") {
			$("#tenderDesk").html('平台');
		} else if(projectData.tenderDesk == "1") {
			$("#tenderDesk").html('平台');
		} else if(projectData.tenderDesk == "2") {
			$("#tenderDesk").html('长安平台');
		} else if(projectData.tenderDesk == "3") {
			$("#tenderDesk").html('企采平台');
		} else if(projectData.tenderDesk == "4") {
			$("#tenderDesk").html('政府采购平台');
		} else if(projectData.tenderDesk == "5") {
			$("#tenderDesk").html('必联网');
		} else if(projectData.tenderDesk == "6") {
			$("#tenderDesk").html('政府交易平台');
		} else if(projectData.tenderDesk == "7") {
			$("#tenderDesk").html('线下项目');
		} else if(projectData.tenderDesk == "8") {
			$("#tenderDesk").html('中汽创智平台');
		} else if(projectData.tenderDesk == "9") {
			$("#tenderDesk").html('国际招标网');
		} else if(projectData.tenderDesk == "99") {
			$("#tenderDesk").html('其他交易平台');
		}
	}
	
};
function toWanyuan(a, b) {
	try {
		return new Decimal(a).div(new Decimal(b)).toNumber()
	} catch (error) {
		return null;
	}
}
//元，万元切换
$("#wanyuan").click(function() {
	//已选中的再次点击切换时不变
	if($(this).hasClass('btn-primary')){
		return
	};
	$("#wanyuan").addClass('btn-primary');
	$("#yuan").removeClass('btn-primary');
	var dividend = 10000;
	var reviewFeeSubtotal = projectData.reviewFeeSubtotal;
	var reviewFeeSubtotalNum = toWanyuan(reviewFeeSubtotal, dividend);
	if(reviewFeeSubtotal != undefined || reviewFeeSubtotal != null) {
		//$("#reviewFeeSubtotal").html(reviewFeeSubtotalNum.toFixed(6) + '万元');
		$("#reviewFeeSubtotal").html() == $("#reviewFeeSubtotal").html(reviewFeeSubtotalNum);
		var toNum = $("#reviewFeeSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#reviewFeeSubtotal').html(num.join(".") + '万元');
	} else {
		$("#reviewFeeSubtotal").html('0万元');
	}
	//------------------------------------------------------------------
	var staffCostSubtotal = projectData.staffCostSubtotal;
	var staffCostSubtotalNum = toWanyuan(staffCostSubtotal, dividend);
	if(staffCostSubtotal != undefined || staffCostSubtotal != null) {
		$("#staffCostSubtotal").html() == $("#staffCostSubtotal").html(staffCostSubtotalNum);
		//$("#staffCostSubtotal").html(staffCostSubtotalNum.toFixed(6) + '万元');
		var toNum = $('#staffCostSubtotal').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#staffCostSubtotal').html(num.join(".") + '万元');
	} else {
		$("#staffCostSubtotal").html('0万元');
	}

	//------------------------------------------------------------------
	var serviceFeleSubtotal = projectData.serviceFeleSubtotal;
	var staffCostSubtotalNum = toWanyuan(serviceFeleSubtotal, dividend);
	if(serviceFeleSubtotal != undefined || serviceFeleSubtotal != null) {
		$("#serviceFeleSubtotal").html() == $("#serviceFeleSubtotal").html(staffCostSubtotalNum)
		//$("#serviceFeleSubtotal").html(staffCostSubtotalNum.toFixed(6) + '万元');
		var toNum = $('#serviceFeleSubtotal').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#serviceFeleSubtotal').html(num.join(".") + '万元');
	} else {
		$("#serviceFeleSubtotal").html('0万元');
	}

	//------------------------------------------------------------------
	var projectCostSubtotal = projectData.projectCostSubtotal;
	var projectCostSubtotalNum = toWanyuan(projectCostSubtotal, dividend);
	if(projectCostSubtotal != undefined || projectCostSubtotal != null) {
		//$("#projectCostSubtotal").html(projectCostSubtotalNum.toFixed(6) + '万元');
		$("#projectCostSubtotal").html() == $("#projectCostSubtotal").html(projectCostSubtotalNum);
		var toNum = $('#projectCostSubtotal').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#projectCostSubtotal').html(num.join(".") + '万元');
	} else {
		$("#projectCostSubtotal").html('0万元');
	}
	//------------------------------------------------------------------
	var dealTotalAmount = projectData.dealTotalAmount;
	var dealTotalAmountNum = toWanyuan(dealTotalAmount, dividend);
	if(dealTotalAmount != undefined || dealTotalAmount != null) {
		//$("#dealTotalAmount").html(dealTotalAmountNum.toFixed(6) + '万元');
		$("#dealTotalAmount").html() == $("#dealTotalAmount").html(dealTotalAmountNum);
		var toNum = $('#dealTotalAmount').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#dealTotalAmount').html(num.join(".") + '万元');
	} else {
		$("#dealTotalAmount").html('0万元');
	}

	//------------------------------------------------------------------
	var contractSettlementPriceSum = projectData.contractSettlementPriceSum;
	var contractSettlementPriceSumNum = toWanyuan(contractSettlementPriceSum, dividend);
	if(contractSettlementPriceSum != undefined || contractSettlementPriceSum != null) {
		$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(contractSettlementPriceSumNum);
		//$("#contractSettlementPriceSum").html(contractSettlementPriceSumNum.toFixed(6) + '万元');
		var toNum = $('#contractSettlementPriceSum').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#contractSettlementPriceSum').html(num.join(".") + '万元');
	} else {
		$("#contractSettlementPriceSum").html('0万元');
	}

	//------------------------------------------------------------------
	var agencyServiceNoFee = projectData.agencyServiceNoFee;
	var agencyServiceNoFeeNum = toWanyuan(agencyServiceNoFee, dividend);
	if(agencyServiceNoFee != undefined || agencyServiceNoFee != null) {
		//$("#agencyServiceNoFee").html(agencyServiceNoFeeNum.toFixed(6) + '万元');
		$("#agencyServiceNoFee").html() == $("#agencyServiceNoFee").html(agencyServiceNoFeeNum)
		var toNum = $('#agencyServiceNoFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#agencyServiceNoFee').html(num.join(".") + '万元');
	} else {
		$("#agencyServiceNoFee").html('0万元');
	}

	//------------------------------------------------------------------
	var agencyServiceFee = projectData.agencyServiceFee;
	var agencyServiceFeeNum = toWanyuan(agencyServiceFee, dividend);
	if(agencyServiceFee != undefined || agencyServiceFee != null) {
		//$("#agencyServiceFee").html(agencyServiceFeeNum.toFixed(6) + '万元');
		$("#agencyServiceFee").html() == $("#agencyServiceFee").html(agencyServiceFeeNum);
		var toNum = $('#agencyServiceFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#agencyServiceFee').html(num.join(".") + '万元');
	} else {
		$("#agencyServiceFee").html('0万元');
	}

	//------------------------------------------------------------------
	var costConsultingFee = projectData.costConsultingFee;
	var costConsultingFeeNum = toWanyuan(costConsultingFee, dividend);
	if(costConsultingFee != undefined || costConsultingFee != null) {
		//$("#costConsultingFee").html(costConsultingFeeNum.toFixed(6) + '万元');
		$("#costConsultingFee").html() == $("#costConsultingFee").html(costConsultingFeeNum);
		var toNum = $('#costConsultingFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#costConsultingFee').html(num.join(".") + '万元');
	} else {
		$("#costConsultingFee").html('0万元');
	}

	//------------------------------------------------------------------
	var totalBidAmount = projectData.totalBidAmount;
	var totalBidAmountNum = toWanyuan(totalBidAmount, dividend);
	if(totalBidAmount != undefined || totalBidAmount != null) {
		//$("#totalBidAmount").html(totalBidAmountNum.toFixed(6) + '万元');
		$("#totalBidAmount").html() == $("#totalBidAmount").html(totalBidAmountNum);
		var toNum = $('#totalBidAmount').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#totalBidAmount').html(num.join(".") + '万元');
	} else {
		$("#totalBidAmount").html('0万元');
	}

	//------------------------------------------------------------------
	var notCostConsultingFee = projectData.notCostConsultingFee;
	var notCostConsultingFeeNum = toWanyuan(notCostConsultingFee, dividend);
	if(notCostConsultingFee != undefined || notCostConsultingFee != null) {
		$("#notCostConsultingFee").html() == $("#notCostConsultingFee").html(notCostConsultingFeeNum);
		//$("#notCostConsultingFee").html(notCostConsultingFeeNum.toFixed(6) + '万元');
		var toNum = $('#notCostConsultingFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#notCostConsultingFee').html(num.join(".") + '万元');
	} else {
		$("#notCostConsultingFee").html('0万元');
	}

	//------------------------------------------------------------------
	var haveCostConsultingFee = projectData.haveCostConsultingFee;
	var haveCostConsultingFeeNum = toWanyuan(haveCostConsultingFee, dividend);
	if(haveCostConsultingFee != undefined || haveCostConsultingFee != null) {
		//$("#haveCostConsultingFee").html(haveCostConsultingFeeNum.toFixed(6) + '万元');
		$("#haveCostConsultingFee").html() == $("#haveCostConsultingFee").html(haveCostConsultingFeeNum);
		var toNum = $('#haveCostConsultingFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#haveCostConsultingFee').html(num.join(".") + '万元');
	} else {
		$("#haveCostConsultingFee").html('0万元');
	}

	//------------------------------------------------------------------
	var finalIncome = projectData.finalIncome;
	var finalIncomeNum = toWanyuan(finalIncome, dividend);
	if(finalIncome != undefined || finalIncome != null) {
		//$("#haveCostConsultingFee").html(haveCostConsultingFeeNum.toFixed(6) + '万元');
		$("#finalIncome").html() == $("#finalIncome").html(finalIncomeNum);
		var toNum = $('#finalIncome').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#finalIncome').html(num.join(".") + '万元');
	} else {
		$("#finalIncome").html('0万元');
	}
})
$("#yuan").click(function() {
	//已选中的再次点击切换时不变
	if($(this).hasClass('btn-primary')){
		return
	};
	$("#yuan").addClass('btn-primary');
	$("#wanyuan").removeClass('btn-primary');

	var reviewFeeSubtotal2 = projectData.reviewFeeSubtotal;
	if(reviewFeeSubtotal2 != undefined || reviewFeeSubtotal2 != null) {
		//$("#reviewFeeSubtotal").html(reviewFeeSubtotal2 + '元');
		$("#reviewFeeSubtotal").html() == $("#reviewFeeSubtotal").html(reviewFeeSubtotal2)
		var toNum = $("#reviewFeeSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#reviewFeeSubtotal").html(num.join(".") + '元');

	} else {
		$("#reviewFeeSubtotal").html('');
	}
	//------------------------------------------------------------------
	var staffCostSubtotal2 = projectData.staffCostSubtotal;
	if(staffCostSubtotal2 != undefined || staffCostSubtotal2 != null) {
		//$("#staffCostSubtotal").html(staffCostSubtotal2 + '元');
		$("#staffCostSubtotal").html() == $("#staffCostSubtotal").html(staffCostSubtotal2);
		var toNum = $("#staffCostSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#staffCostSubtotal").html(num.join(".") + '元');
	} else {
		$("#staffCostSubtotal").html('');
	}

	//--------------------------------------------------------------------
	var serviceFeleSubtotal2 = projectData.serviceFeleSubtotal;
	if(serviceFeleSubtotal2 != undefined || serviceFeleSubtotal2 != null) {
		//$("#serviceFeleSubtotal").html(serviceFeleSubtotal2 + '元');
		$("#serviceFeleSubtotal").html() == $("#serviceFeleSubtotal").html(serviceFeleSubtotal2);
		var toNum = $("#serviceFeleSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#serviceFeleSubtotal").html(num.join(".") + '元');
	} else {
		$("#serviceFeleSubtotal").html('');
	}

	//--------------------------------------------------------------------
	var projectCostSubtotal2 = projectData.projectCostSubtotal;
	if(projectCostSubtotal2 != undefined || projectCostSubtotal2 != null) {
		//$("#projectCostSubtotal").html(projectCostSubtotal2 + '元');
		$("#projectCostSubtotal").html() == $("#projectCostSubtotal").html(projectCostSubtotal2);
		var toNum = $("#projectCostSubtotal").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#projectCostSubtotal").html(num.join(".") + '元');
	} else {
		$("#projectCostSubtotal").html('');
	}

	//--------------------------------------------------------------------
	var dealTotalAmount = projectData.dealTotalAmount;
	//$("#dealTotalAmount").html(dealTotalAmount + '元');
	$("#dealTotalAmount").html() == $("#dealTotalAmount").html(dealTotalAmount);
	var toNum = $("#dealTotalAmount").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#dealTotalAmount").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var contractSettlementPriceSum = projectData.contractSettlementPriceSum;
	//$("#contractSettlementPriceSum").html(contractSettlementPriceSum + '元');
	$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(contractSettlementPriceSum);
	var toNum = $("#contractSettlementPriceSum").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#contractSettlementPriceSum").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var agencyServiceNoFee = projectData.agencyServiceNoFee;
	//$("#agencyServiceNoFee").html(agencyServiceNoFee + '元');
	$("#agencyServiceNoFee").html() == $("#agencyServiceNoFee").html(agencyServiceNoFee);
	var toNum = $("#agencyServiceNoFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#agencyServiceNoFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var agencyServiceFee = projectData.agencyServiceFee;
	//$("#agencyServiceFee").html(agencyServiceFee + '元');
	$("#agencyServiceFee").html() == $("#agencyServiceFee").html(agencyServiceFee);
	var toNum = $("#agencyServiceFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#agencyServiceFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var costConsultingFee = projectData.costConsultingFee;
	//$("#costConsultingFee").html(costConsultingFee + '元');
	$("#costConsultingFee").html() == $("#costConsultingFee").html(costConsultingFee);
	var toNum = $("#costConsultingFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#costConsultingFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var totalBidAmount = projectData.totalBidAmount;
	//$("#totalBidAmount").html(totalBidAmount + '元');
	$("#totalBidAmount").html() == $("#totalBidAmount").html(totalBidAmount);
	var toNum = $("#totalBidAmount").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#totalBidAmount").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var notCostConsultingFee = projectData.notCostConsultingFee;
	//$("#notCostConsultingFee").html(notCostConsultingFee + '元');
	$("#notCostConsultingFee").html() == $("#notCostConsultingFee").html(notCostConsultingFee);
	var toNum = $("#notCostConsultingFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#notCostConsultingFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var haveCostConsultingFee = projectData.haveCostConsultingFee;
	//$("#haveCostConsultingFee").html(haveCostConsultingFee + '元');
	$("#haveCostConsultingFee").html() == $("#haveCostConsultingFee").html(haveCostConsultingFee);
	var toNum = $("#haveCostConsultingFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#haveCostConsultingFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var finalIncome = projectData.finalIncome;
	$("#finalIncome").html() == $("#finalIncome").html(finalIncome);
	var toNum = $("#finalIncome").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#finalIncome").html(num.join(".") + '元');

})
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
var editList = [];
function getResetList(){
	
	$.ajax({
		url:  resetListUrl,
		type: 'get',
		async: false,
		dataType: 'json',
		data: {
			'businessId': bidSectionId
		},
		success: function(data) {
			if(data.success){
				if(data.data.length > 0){
					editList = data.data;
					$('.hover_table').css('cursor','pointer');
					if(editList[editList.length-1].ago != editList[0].after){
						$('#purchaserName').addClass('blueBorder');
					}
					recordTable(data.data);
				}
			}else{
				top.layer.alert('温馨提示：' + data.message);
			}
	
		}
	});
};
$('.hover_table').hover(function (){
	if(editList.length > 0){
		$("#resetRecord").show();
	}
},function (){
	$("#resetRecord").hide();
});
function recordTable(data){
	$('#resetRecordTable').bootstrapTable({
		pagination: false,
		columns: [{
			field: "userName",
			title: "修改人",
			// align: "center",
			halign: "center",
			width: "100px",
			
		},
		{
			field: "subDate",
			title: "修改时间",
			align: "center",
			width: "100px",
	
		},
		{
			field: "context",
			title: "修改内容",
			align: "left",
			width: '200px',
			formatter: function (value, row, index) {
				if(index == data.length -1){
					return '由“<span style="font-style: oblique;color: #A8A8A8;">' +row.ago+ '</span>”修改为“<span style="font-style: oblique;color: #000;">' +row.after+ '</span>”'
				}else{
					return '由“<span style="font-style: oblique;color: #000;">' +row.ago+ '</span>”修改为“<span style="font-style: oblique;color: #000;">' +row.after+ '</span>”';
				}
				
			}
	
		},
		{
			field: "reason",
			title: "修改原因",
			align: "left",
			width: '200px',
	
		}]
	});
	$('#resetRecordTable').bootstrapTable("load", data);
}
/* 3、标色提醒：每一次从费用确认回显的数据进行如下比对，如数值不一致，则标红。

【并在原备注后换行拼接一句话：”已变更X次（中标人/服务费/评审费/工作人员费用/造价咨询费/标书费）“，并显示出变更的字段。之前的备注不动。

————————该需求和结果通知变更带来的业务统计报表变更合并处理。】

   3.1、业务收入：合计招标代理服务费和合计招标代理服务费比对，若不一致，业务收入：合计招标代理服务费标红；

   3.2、评审费小计和原评审费小计比对，若不一致，标红

   3.3、工作人员费用小计和原工作人员费用小计比对，若不一致，标红 */
function changeFeeColor(){
	var isAdd = false;//备注是否增加
	var changeType = [];
	/* 业务收入：合计招标代理服务费 */
	if(projectData.businessIncomeServiceFee || projectData.businessIncomeServiceFee == 0){
		if(projectData.lastIncomeServiceFee || projectData.lastIncomeServiceFee == 0){
			if(projectData.businessIncomeServiceFee != projectData.lastIncomeServiceFee){
				$('#businessIncomeServiceFee').closest('td').css('background','#e9bfbf');
				isAdd = true;
				changeType.push("服务费");
			}
		}else{
			if((projectData.agencyServiceFee || projectData.agencyServiceFee == 0) && projectData.businessIncomeServiceFee != projectData.agencyServiceFee){
				$('#businessIncomeServiceFee').closest('td').css('background','#e9bfbf')
				isAdd = true;
				changeType.push("服务费");
			}
		}
		
	}
	/* 评审费小计 */
	if((projectData.reviewFeeSubtotal || projectData.reviewFeeSubtotal == 0) && (projectData.lastEvaAmount || projectData.lastEvaAmount == 0) && projectData.reviewFeeSubtotal != projectData.lastEvaAmount){
		$('#reviewFeeSubtotal').closest('td').css('background','#e9bfbf');
		isAdd = true;
		changeType.push("评审费");
	}
		
	/* 工作人员费用小计 */
	if((projectData.staffCostSubtotal || projectData.staffCostSubtotal == 0) && (projectData.lastWorkerAmount || projectData.lastWorkerAmount == 0) && projectData.staffCostSubtotal != projectData.lastWorkerAmount){
		$('#staffCostSubtotal').closest('td').css('background','#e9bfbf');
		isAdd = true;
		changeType.push("工作人员费用");
	}
}