var purchaseaData = ""; //项目的数据的参数
var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var addsupplier = 'Auction/Sale/Agent/SalePurchase/model/add_supplier.html' //邀请供应商的弹出框路径
WORKFLOWTYPE = $.getUrlParam('accepType');
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData = [];
var projectId = $.getUrlParam('projectId')
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var tenderType = $.getUrlParam('tenderType')
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var lookCheck = config.AuctionHost + "/BusinessStatisticsController/findAuditDateReport"
var checkReslut = config.AuctionHost + "/WorkflowController/updateWorkflowAccep"
var cwlookCheck = config.AuctionHost + "/CwBusinessStatisticsController/selectCwDateReport"
var iscw = $.getUrlParam('iscw');
var fileUploads = null;
var businessId;
//初始化
$(function() {
	if(iscw) {
		edittype = "detailed"
		WORKFLOWTYPE = "ywtjb"
	}
	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#biddingApproval").hide()
	} else {

		//$("#CheckResult").hide()
	}
	Purchase();

	findWorkflowCheckerAndAccp(projectId);
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
});
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

function Purchase() {
	var path = "";
	if(iscw) {
		path = cwlookCheck;
	} else {
		path = lookCheck
	}

	$.ajax({
		url: path,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'id': projectId
		},
		success: function(data) {
			if(data.success) {
				projectData = data.data //获取的数据	
				businessId = projectData.id;
				if(projectData.processType == "3"){
					$('.bidOpenTime').text('开标时间');
					$('.business').show();
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
			}else{
				
			}

		},
		error: function(data) {

		}
	});
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
			let areaCode = projectData[key];
			var strName = "";
			$.ajaxSettings.async = false;
			$.getJSON('../../../media/js/base/prov-city.json', function(data) {
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
						if(data[i].childs[j].childs){
							for(var k = 0; k < data[i].childs[j].childs.length; k++) {
								if(data[i].childs[j].childs[k].code == areaCode) {
									strName += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
									return;
								}
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
			$.getJSON('../../../media/js/base/prov-city.json', function(data) {
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
						if(data[i].childs[j].childs){
							for(var k = 0; k < data[i].childs[j].childs.length; k++) {
								if(data[i].childs[j].childs[k].code == areaCode2) {
									strName2 += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
									return;
								}
							}
						}
						
					}
				}
			});
			$("#" + key).html(strName2);
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
			$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(projectData.contractSettlementPriceSum)
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
	if(projectData.businessIncomeServiceFee != undefined || projectData.businessIncomeServiceFee != null) {
		$("#businessIncomeServiceFee").html() == $("#businessIncomeServiceFee").html(projectData.businessIncomeServiceFee)
		var toNum = $("#businessIncomeServiceFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#businessIncomeServiceFee").html(num.join(".") + '元');
	} else {
		$("#businessIncomeServiceFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.costConsultingFee != undefined || projectData.costConsultingFee != null) {
		$("#costConsultingFee").html() == $("#costConsultingFee").html(projectData.costConsultingFee);
		var toNum = $("#costConsultingFee").html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$("#costConsultingFee").html(num.join(".") + '元');
	} else {
		$("#costConsultingFee").html('' + '元');
	}

	//-------------------------------------------------------------------
	if(projectData.totalBidAmount != undefined || projectData.totalBidAmount != null) {
		$("#totalBidAmount").html() == $("#totalBidAmount").html(projectData.totalBidAmount);
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
		$("#dealTotalAmount").html('');
	}
	if(projectData.tenderType == 13) {
		$("#tenderType").html("竞争性磋商");
	} else if(projectData.tenderType == 12) {
		$("#tenderType").html("竞争性谈判");
	} else if(projectData.tenderType == 6) {
		$("#tenderType").html("单一来源");
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
	} else if(projectData.tenderType == 0) {
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
		if(projectData.processType == 3){//交易流程类型 1 全流程线上流程  2全流程线下流程 3线下项目登记 
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
		if(projectData.processType == 3){//交易流程类型 1 全流程线上流程  2全流程线下流程 3线下项目登记
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
		if(projectData.processType == 3){//交易流程类型 1 全流程线上流程  2全流程线下流程 3线下项目登记
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
		//开标时间
		$("#bidOpenTime").html(projectData.bidOpenTime);
		//评审办法
		if (projectData.processType == '2') {
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
			if(projectData.processType == 3){//交易流程类型 1 全流程线上流程  2全流程线下流程 3线下项目登记
				$("#bidCheckType").html(projectData.bidCheckType);
			}else{
				if(projectData.bidCheckType == 3) {
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
				}
			}
		}
		
		//项目类型
		if (projectData.processType == '2') {
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
				$("#projectType").html('建安工程');
			} else if(projectData.projectType == 'B') {
				$("#projectType").html('国内货物');
			} else if(projectData.projectType == '9') {
				$("#projectType").html('国际货物')
			} else if(projectData.projectType == 'C') {
				$("#projectType").html('服务');
			} else if(projectData.projectType == 'C50') {
				$("#projectType").html('广宣');
			} else if(projectData.projectType == '4') {
				$("#projectType").html('废旧物资')
			}
		}
	}
	if (projectData.processType == '2') {
		var dic = {
            '1': '平台',
            '2': '政府平台',
            '3': '国际招标平台',
            '4': '其他',
        }
		$("#tenderDesk").html(dic[projectData.tenderDesk] || '平台')
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
	//项目状态
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
		$("#projectState").html("经评审有候选人，但未发通知书");
	} else if(projectData.projectState == 7) {
		$("#projectState").html("经评审无候选人");
	} else if(projectData.projectState == 8) {
		$("#projectState").html("已发公告，未开标");
	} else if(projectData.projectState == 9) {
		$("#projectState").html("已建项，未启动");
	}
	//
	$("#projectDepartmentName").html(projectData.projectDepartmentName);
	if(projectData.projectOfficeName) {
		$("#projectOfficeName").html(projectData.projectOfficeName);
	} else {
		$("#projectOfficeName").html(projectData.projectDepartmentName);
	}
	//
	if(projectData.isObjection == 0) {
		$("#isObjection").html('否')
	} else if(projectData.isObjection == 1) {
		$("#isObjection").html('是')
	}
	if(projectData["exception"]) {
		$(".exceptionView1").show()
		$(".exceptionView2").show()
	}
	//公开/邀请
	let tenderMode = projectData["tenderMode"];
	if(tenderMode == 1 || tenderMode == 0) {
		$("#tenderMode").html("公开");
	} else if(tenderMode == 2) {
		$("#tenderMode").html("邀请");
	}
}
//元，万元切换
$("#wanyuan").click(function() {
	$("#wanyuan").addClass('btn-primary');
	$("#yuan").removeClass('btn-primary');
	var dividend = 10000;
	var reviewFeeSubtotal = projectData.reviewFeeSubtotal;
	var reviewFeeSubtotalNum = reviewFeeSubtotal / dividend;
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
	var staffCostSubtotalNum = staffCostSubtotal / dividend;
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
	var staffCostSubtotalNum = serviceFeleSubtotal / dividend;
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
	var projectCostSubtotalNum = projectCostSubtotal / dividend;
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
	var dealTotalAmountNum = dealTotalAmount / dividend;
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
	var contractSettlementPriceSumNum = contractSettlementPriceSum / dividend;
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
	var agencyServiceNoFeeNum = agencyServiceNoFee / dividend;
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
	var agencyServiceFeeNum = agencyServiceFee / dividend;
	if(agencyServiceFee != undefined || agencyServiceFee != null) {
		$("#agencyServiceFee").html() == $("#agencyServiceFee").html(agencyServiceFeeNum);
		var toNum = $('#agencyServiceFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#agencyServiceFee').html(num.join(".") + '万元');
	} else {
		$("#agencyServiceFee").html('0万元');
	}
	var businessIncomeServiceFee = projectData.businessIncomeServiceFee;
	var businessIncomeServiceFeeNum = businessIncomeServiceFee / dividend;
	if(businessIncomeServiceFee != undefined || businessIncomeServiceFee != null) {
		$("#businessIncomeServiceFee").html() == $("#businessIncomeServiceFee").html(businessIncomeServiceFeeNum);
		var toNum = $('#businessIncomeServiceFee').html().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{6})\d+$/, "$1")).toFixed(6).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#businessIncomeServiceFee').html(num.join(".") + '万元');
	} else {
		$("#businessIncomeServiceFee").html('0万元');
	}
	

	//------------------------------------------------------------------
	var costConsultingFee = projectData.costConsultingFee;
	var costConsultingFeeNum = costConsultingFee / dividend;
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
	var totalBidAmountNum = totalBidAmount / dividend;
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
	var notCostConsultingFeeNum = notCostConsultingFee / dividend;
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
	var haveCostConsultingFeeNum = haveCostConsultingFee / dividend;
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
})
$("#yuan").click(function() {
	$("#yuan").addClass('btn-primary');
	$("#wanyuan").removeClass('btn-primary');

	var reviewFeeSubtotal2 = projectData.reviewFeeSubtotal;
	if(reviewFeeSubtotal2 != undefined || reviewFeeSubtotal2 != null) {
		$("#reviewFeeSubtotal").html() == $("#reviewFeeSubtotal").html(reviewFeeSubtotal2)
		//$("#reviewFeeSubtotal").html(reviewFeeSubtotal2 + '元');
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
	//	/$("#contractSettlementPriceSum").html(contractSettlementPriceSum + '元');
	$("#contractSettlementPriceSum").html() == $("#contractSettlementPriceSum").html(contractSettlementPriceSum)
	var toNum = $("#contractSettlementPriceSum").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#contractSettlementPriceSum").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var agencyServiceNoFee = projectData.agencyServiceNoFee;
	//$("#agencyServiceNoFee").html(agencyServiceNoFee + '元');
	$("#agencyServiceNoFee").html() == $("#agencyServiceNoFee").html(agencyServiceNoFee)
	var toNum = $("#agencyServiceNoFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#agencyServiceNoFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var agencyServiceFee = projectData.agencyServiceFee;
	$("#agencyServiceFee").html() == $("#agencyServiceFee").html(agencyServiceFee);
	var toNum = $("#agencyServiceFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#agencyServiceFee").html(num.join(".") + '元');
	//--------------------------------------------------------------------
	var businessIncomeServiceFee = projectData.businessIncomeServiceFee;
	$("#businessIncomeServiceFee").html() == $("#businessIncomeServiceFee").html(businessIncomeServiceFee);
	var toNum = $("#businessIncomeServiceFee").html().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$("#businessIncomeServiceFee").html(num.join(".") + '元');
	
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

})

function NewDate(str) {
	if(!str) {
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

$("#btn_close").click(function() {
	parent.layer.closeAll();

});

//审核
$("#btn_bao").click(function() {

	let check = $("input[name='auditState']:checked").val();

	let workflowContent = $("#checkMsg").val();

})