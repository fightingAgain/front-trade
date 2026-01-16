var findPurchaseUrl = top.config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do' //根据项目ID获取所有项目信息内容
var WorkflowUrl = top.config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
var saveProjectPackage = top.config.AuctionHost + '/BusinessStatisticsController/insertDateReportInfo.do'; //添加包件的接口
var projectData;
var examTypes;
var isCheck;
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var examType = getUrlParam('examType');
var tenderType = getUrlParam('tenderType');
var processType = getUrlParam('processType');//交易流程类型 1 全流程线上流程  2全流程线下流程 3线下项目登记 
var projectType;
var findPurchaseURLHasId = top.config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var resetUrl = top.config.AuctionHost + '/BusinessStatisticsController/reset.do'; //重置
var getPackageFefundTimeUrl = config.depositHost + '/TransactionDetailController/getPackageFefundTime'; //读取保证金应退时间
var flage = getUrlParam('flage'); //是否二次编辑  1 首次  2 二次
WORKFLOWTYPE = "ywtjb"
var provinceName;
var cityName;
var bidOpenAddr;
var feeConfirmVersion=1;
var xmtype,resetRenderData={};
var fileUploads;
var businessId = getUrlParam('id');
var type = getUrlParam('type');
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function() {
	setProvince();
	setCity('420000');
	$("#Province").val('420000');
	$("#City").val('420100');
	$("#provinceName").val('湖北省');
	$("#cityName").val('武汉市');
	//
	setProvinceKb();
	setCityKb('');
	//	$("#ProvinceKb").val('42');
	//	$("#CityKb").val('4201');
	//	$("#provinceNameKb").val('湖北省');
	//	$("#cityNameKb").val('武汉市');
	if(packageId != null && packageId != undefined && packageId != "") {
		Purchase(packageId);
	}
	if(projectId != null && projectId != undefined && projectId != "") {
		Purchase(projectId);
	} else {
		$("#chBtn").show()
	}
	/* ***********************    增加项目登记的业务统计报表    ************************ */
	//控制线下项目登记输入 而其他类型只能回显
	if(processType == "3"){
		$('.bidOpenTime').text('开标时间');
		$('.business, .files').show();
		$('#noticeSendTime, #bidOpenTime, #noticeStartDate, #tenderMode, #bidCheckType, #tenderDesk, #tenderType, #contractSettlementPriceSum, .noBusiness').hide();
	}else{
		$('[name=noticeSendTime], [name=bidOpenTime], [name=noticeStartDate], [name=tenderMode], [name=bidCheckType], [name=tenderDesk], [name=tenderType], [name=contractSettlementPriceSum]').removeAttr('datatype');
		$('[name=contractSettlementPriceSum]').hide()
	}
	//首次建项时间< 公告发布时间/招标文件开始发售时间（年/月/日）< 开标时间 ≤中标通知书发出时间 ≤项目结束时间，若某时间因非必填没有值，则该节点不参与校验。
	$('[name=noticeSendTime]').click(function(){
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd',
			minDate: $('[name=bidOpenTime]').val() != ''?$('[name=bidOpenTime]').val().split(' ')[0]:'',
			onpicked: function(dp) {
				
			}
		})
	})
	$('[name=bidOpenTime]').click(function(){
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: $('[name=noticeStartDate]').val() != ''?($('[name=noticeStartDate]').val() + ' 00:00'):'',
			maxDate: $('[name=noticeSendTime]').val() != ''?($('[name=noticeSendTime]').val() + ' 23:59'):'',
			onpicked: function(dp) {
				
			}
		})
	})
	$('[name=noticeStartDate]').click(function(){
		WdatePicker({
			el: this,
			minDate: projectData.bidOpeningEndTime?projectData.bidOpeningEndTime.split(' ')[0]:'',
			maxDate: $('[name=bidOpenTime]').val() != ''?$('[name=bidOpenTime]').val().split(' ')[0]:'',
			dateFmt: 'yyyy-MM-dd',
			onpicked: function(dp) {
				
			}
		})
	})
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function() {
		//		var obj = $(this);
		if(flage == 1) {
			saveFuct(false, function(businessId){
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + (packageId?packageId:projectId) + "/" + businessId + "/703",
						businessId: businessId,
						status: 1,
						businessTableName: 'T_BUSINESS_STATISTICS',
						tenderType: 0,
					}, '', '0');
				}
				$('#fileLoad').trigger('click');
			});
		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + (packageId?packageId:projectId) + "/" + businessId + "/703",
					businessId: businessId,
					status: 1,
					businessTableName: 'T_BUSINESS_STATISTICS',
					tenderType: 0,
				}, '', '0');
			}
			$('#fileLoad').trigger('click');
		}
	});
	
	/* ***********************    增加项目登记的业务统计报表 end   ************************ */
	$('[name=tenderType]').change(function(){
		top.layer.alert('切换采购方式需重新选择项目类型！');
		tenderType = $(this).val();
		if($(this).val() == 4){
			$(".zb").show();
			$(".xb").hide();
		}else{
			$(".zb").hide();
			$(".xb").show();
		}
	})
	if(processType == "3"){
		$("#changeName, #changeNameCz, #reset_tender").hide();
	}else{
		if(tenderType == "4") {
			$("#changeName").hide();
			$("#changeNameCz").hide();
			$(".zb").show();
			$(".xb").hide();
		} else if(tenderType == "0" || tenderType == "6") {
			// $("#changeName").show();
			$(".zb").hide();
			$(".xb").show();
		} else if(tenderType == "1") {
			// $("#changeName").show();
			$(".zb").hide();
			$(".xb").show();
		} else if(tenderType == "2") {
			$("#changeName").hide();
			$("#changeNameCz").hide();
			$(".zb").hide();
			$(".xb").show();
		}
	}
	//项目成本费用小计= 评审费小计+ 工作人员费用小计+ 综合服务费小计；
	$('#staffCostSubtotal,#reviewFeeSubtotal,#serviceFeleSubtotal').change(function() {
		let a = $('#staffCostSubtotal').val();
		a = a.toString();
		a = a.replace(/[ ]/g, ""); //去除空格  
		a = a.replace(/,/gi, '');
		let b = $('#reviewFeeSubtotal').val();
		b = b.toString();
		b = b.replace(/[ ]/g, ""); //去除空格  
		b = b.replace(/,/gi, '');
		let c = $('#serviceFeleSubtotal').val();
		c = c.toString();
		c = c.replace(/[ ]/g, ""); //去除空格  
		c = c.replace(/,/gi, '');
		$('#projectCostSubtotal').val((+a + +b + +c).toFixed(2));
		var toNum = $('#projectCostSubtotal').val().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#projectCostSubtotal').val(num.join("."));
	})
	let a2 = $('#staffCostSubtotal').val();
	a2 = a2.toString();
	a2 = a2.replace(/[ ]/g, ""); //去除空格  
	a2 = a2.replace(/,/gi, '');
	let b2 = $('#reviewFeeSubtotal').val();
	b2 = b2.toString();
	b2 = b2.replace(/[ ]/g, ""); //去除空格  
	b2 = b2.replace(/,/gi, '');
	let c2 = $('#serviceFeleSubtotal').val();
	c2 = c2.toString();
	c2 = c2.replace(/[ ]/g, ""); //去除空格  
	c2 = c2.replace(/,/gi, '');
	$('#projectCostSubtotal').val((+a2 + +b2 + +c2).toFixed(2));
	var toNum = $('#projectCostSubtotal').val().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$('#projectCostSubtotal').val(num.join("."));
	//不含造价咨询费服务费小计=合计代理服务费+合计标书款
	$('#agencyServiceFee,#totalBidAmount').change(function() {
		let a = $('#agencyServiceFee').val(); //合计代理服务费
		a = a.toString();
		a = a.replace(/[ ]/g, ""); //去除空格  
		a = a.replace(/,/gi, '');
		let b = $('#totalBidAmount').val(); //合计标书款
		b = b.toString();
		b = b.replace(/[ ]/g, ""); //去除空格  
		b = b.replace(/,/gi, '');
		$('#notCostConsultingFee').val((+a + +b).toFixed(2));
		var toNum = $('#notCostConsultingFee').val().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#notCostConsultingFee').val(num.join("."));
	})
	let a3 = $('#agencyServiceFee').val();
	a3 = a3.toString();
	a3 = a3.replace(/[ ]/g, ""); //去除空格  
	a3 = a3.replace(/,/gi, '');
	let b3 = $('#totalBidAmount').val();
	b3 = b3.toString();
	b3 = b3.replace(/[ ]/g, ""); //去除空格  
	b3 = b3.replace(/,/gi, '');
	$('#notCostConsultingFee').val((+a3 + +b3).toFixed(2));
	var toNum = $('#notCostConsultingFee').val().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$('#notCostConsultingFee').val(num.join("."));
	//含造价咨询费服务费小计 =合计代理服务费”+“造价咨询费”+“合计标书款”
	$('#agencyServiceFee,#costConsultingFee,#totalBidAmount').change(function() {
		let a = $('#agencyServiceFee').val(); //合计代理服务费
		a = a.toString();
		a = a.replace(/[ ]/g, ""); //去除空格  
		a = a.replace(/,/gi, '');
		let b = $('#totalBidAmount').val(); //合计标书款
		b = b.toString();
		b = b.replace(/[ ]/g, ""); //去除空格  
		b = b.replace(/,/gi, '');
		let c = $('#costConsultingFee').val();
		c = c.toString();
		c = c.replace(/[ ]/g, ""); //去除空格  
		c = c.replace(/,/gi, '');
		$('#haveCostConsultingFee').val((+a + +c + +b).toFixed(2));
		var toNum = $('#haveCostConsultingFee').val().replace(/\,|\￥/g, "")
		var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
		num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
		$('#haveCostConsultingFee').val(num.join("."));
	})
	let a4 = $('#agencyServiceFee').val();
	a4 = a4.toString();
	a4 = a4.replace(/[ ]/g, ""); //去除空格  
	a4 = a4.replace(/,/gi, '');
	let b4 = $('#totalBidAmount').val();
	b4 = b4.toString();
	b4 = b4.replace(/[ ]/g, ""); //去除空格  
	b4 = b4.replace(/,/gi, '');
	let c4 = $('#costConsultingFee').val();
	c4 = c4.toString();
	c4 = c4.replace(/[ ]/g, ""); //去除空格  
	c4 = c4.replace(/,/gi, '');
	$('#haveCostConsultingFee').val((+a4 + +b4 + +c4).toFixed(2))
	var toNum = $('#haveCostConsultingFee').val().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$('#haveCostConsultingFee').val(num.join("."));
	if(tenderType != "4" && tenderType != "2" ) {
		if(processType != "3"){
			$("#changeNameCz").show();
			$("#changeName").show();
		}
		/* if(projectData.interiorProjectCode == projectData.bidSectionCode) {
			$("#changeNameCz").show();
			$("#changeName").hide();
		} else {
			$("#changeNameCz").hide();
			$("#changeName").show();
		} */
	}
})
//编号切换
$('#changeName').click(function() {
	if($("#bidSectionCode").html() == projectData.bidSectionCode) {
		$("#bidSectionCode").html(projectData.interiorProjectCode);
	} else {
		$("#bidSectionCode").html(projectData.bidSectionCode);
	}
})
$("#changeNameCz").click(function() {
	if(packageId != null && packageId != undefined && packageId != "") {
		var uid = packageId;
	}else{
		var uid = projectId;
	}
		$.ajax({
			url: resetUrl,
			type: 'post',
			async: false,
			dataType: 'json',
			data: {
				'tenderProjectID': uid,
			},
			success: function(data) {
				if(data.success){
					if(tenderType != "4") {
						$("#bidSectionCode").html(data.data.bidSectionCode);
						/* if(data.data.interiorProjectCode == data.data.bidSectionCode) {
							$("#changeNameCz").show();
							$("#changeName").hide();
						} else {
							projectData.bidSectionCode = data.data.bidSectionCode;
							$("#changeNameCz").hide();
							$("#changeName").show();
						} */
					}
				}else{
					top.layer.alert('温馨提示：' + data.message);
				}
			}
		});
		
})
//项目状态
$("#projectState").change(function() {

	if($("#projectState").val() == 2 || $("#projectState").val() == 3) {
		//中标人
		$("#bidWinner").html('无');
		//成交人合计报价金额
		$("#dealTotalAmount").val(0);
		//合计中标金额
		$("#contractSettlementPriceSum").html(0);
		$("[name=contractSettlementPriceSum]").val(0);
		//合计代理服务费-不打折
		$("#agencyServiceNoFee").val(0);
		//合计代理服务费(元)
		$("#agencyServiceFee").val(0);
		//造价咨询费
		$("#costConsultingFee").val(0);
	} else {
		$("#bidWinner").html(projectData.bidWinner);
		//成交人合计报价金额
		$("#dealTotalAmount").val(projectData.dealTotalAmount); //默认为所有中选人合计报价金额
		//合计中标金额
		$("#contractSettlementPriceSum").html();
		$("[name=contractSettlementPriceSum]").val();
		//合计代理服务费-不打折
		$("#agencyServiceNoFee").val();
		//合计代理服务费(元)
		$("#agencyServiceFee").val();
		//造价咨询费
		$("#costConsultingFee").val();
	}
	projectStateChange($(this).val())
});
function projectStateChange(val){
	// if(processType == 3){//线下项目登记
		
	//4 正常结束（已发通知书）/5已发放通知书，项目取消/6经评审有候选人，但未发通知书/7经评审无候选人/8已发公告，未开标/9已建项，未启动
		//中标联系人manyBidderLinkmen/中标人联系电话manyBidderLinkphone/中标人联系邮箱manyBidderLinkemail/多个中标人时备注manyBidderRemark/成交人合计报价金额dealTotalAmount/合计中标金额contractSettlementPriceSum/合计代理服务费-不打折agencyServiceNoFee/合计代理服务费agencyServiceFee
		if(val == 4){
			$('#manyBidderLinkmen, #manyBidderLinkphone, #manyBidderLinkemail, [name=contractSettlementPriceSum], #agencyServiceNoFee, #agencyServiceFee').attr('datatype', '*');
			$('.projectState4').show();
		}else{
			$('#manyBidderLinkmen, #manyBidderLinkphone, #manyBidderLinkemail, [name=contractSettlementPriceSum], #agencyServiceNoFee, #agencyServiceFee').removeAttr('datatype');
			$('.projectState4').hide();
		}
		//公告发布时间/招标文件开始发售时间（年/月/日）
		if(val == 9){
			$('.noticeStartDate .red').hide();
			$('[name=noticeStartDate]').removeAttr('datatype')
		}else{
			$('.noticeStartDate .red').show();
			$('[name=noticeStartDate]').attr('datatype', '*')
		}
		//开标时间
		if(val == 8 || val == 9){
			//开标时间bidOpenTime、开标地点provinceNameKb、参加开标的投标人数tenderNumber、评审费小计reviewFeeSubtotal、工作人员小计、综合服务费小计/合计标书款totalBidAmount
			$('.bidOpenTime .red, .provinceNameKb .red, .tenderNumber .red, .reviewFeeSubtotal .red, .staffCostSubtotal .red, .serviceFeleSubtotal .red').hide();
			$('[name=bidOpenTime], [name=reviewFeeSubtotal], [name=staffCostSubtotal], [name=serviceFeleSubtotal], #totalBidAmount').removeAttr('datatype')
		}else{
			$('.bidOpenTime .red, .provinceNameKb .red, .tenderNumber .red, .reviewFeeSubtotal .red, .staffCostSubtotal .red .serviceFeleSubtotal .red').show();
			$('[name=bidOpenTime], [name=reviewFeeSubtotal], [name=staffCostSubtotal], [name=serviceFeleSubtotal], #totalBidAmount').attr('datatype', '*')
		}
	// }
}
//多个中标人备注
$("#manyBidderRemark").focus(function() {
	$(".manyBidderRemarkP").show()
})
$("#manyBidderRemark").blur(function() {
	$(".manyBidderRemarkP").hide()
})

//获取数据
function Purchase(uid) {
	$.ajax({
		url: flage == 1 ? findPurchaseUrl : findPurchaseURLHasId,
		type: 'post',
		async: false,
		dataType: 'json',
		data: {
			'tenderProjectID': uid,
		},
		success: function(data) {
			if(data.success){
				projectData = data.data;
				if(projectData.tenderType || projectData.tenderType == 0){
					tenderType = projectData.tenderType
				}
				feeConfirmVersion= projectData.feeConfirmVersion
				if(processType == "3"){
					if(projectData.tenderType == 4){
						$(".zb").show();
						$(".xb").hide();
					}else{
						$(".zb").hide();
						$(".xb").show();
					}
				};
				businessId = projectData.id;
				PurchaseData();
				if(processType == "3" && flage == 2){
					if(!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + (packageId?packageId:projectId) + "/" + businessId + "/703",
							businessId: businessId,
							status: 1,
							businessTableName: 'T_BUSINESS_STATISTICS',
							tenderType: 0,
						}, '', '0');
					}
					if(projectData.purFile) {
						fileUploads.fileHtml(projectData.purFile);
					}
				}
				packageId=projectData.bidSectionId;
				getPackageFefundTime();
			}else{
				top.layer.alert('温馨提示：' + data.message);
			}

		}
	});

	var reData = {
		"workflowLevel": 0,
		"workflowType": "ywtjb"
	}

	// if(packageInfo.id != ''){
	// 	reData.id = packageInfo.id;
	// 	$('.record').show();
	// 	findWorkflowCheckerAndAccp(packageInfo.id);
	// }

	//获取审核人列表
	$.ajax({
		url: WorkflowUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function(data) {
			var option = ""
			//判断是否有审核人
			if(data.message == 0) {
				isCheck = true;
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				parent.layer.alert("温馨提示：找不到该级别的审批人,请先添加审批人");
				massage2 = data.message;
				return;
			};
			var checkerId = '';
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data) {
					if(data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if(data.data.workflowCheckers.length > 0) {

						if(data.data.employee) {
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for(var i = 0; i < checkerList.length; i++) {

							if(checkerId != '' && checkerList[i].employeeId == checkerId) {
								option += '<option value="' + checkerList[i].employeeId + '" selected="selected">' + checkerList[i].userName + '</option>'
							} else {
								option += '<option value="' + checkerList[i].employeeId + '">' + checkerList[i].userName + '</option>'
							}

						}
					}
				} else {
					option = '<option>暂无审核人员</option>'
				}
			}
			$("#employeeId").html(option);
		}
	});
	//	time()
};
//渲染数据
function PurchaseData() {
	console.log(111)
	for(key in projectData) {
		if(key == "bidSectionName" || key == "bidSectionCode" || key == "exceptionCause" || key == "exception" || key == "businessIncomeServiceFee") {
			$("#" + key).html(projectData[key]);
			$('input[name="' + key + '"]').val(projectData[key]);
		} else if(key == "projectImplementAdder") {
			getCode(projectData[key]);
			getName(projectData[key]);
		} else if(key == "publlcProcurement") {
			$('input[name=' + key + '][value=' + projectData[key] + ']').attr('checked', true);
		} else if(key == "bidOpenAdder") {
			getCodeKb(projectData[key]);
			getNameKb(projectData[key]);
		} else {
			$('input[name="' + key + '"]').val(projectData[key]);
			$('select[name="' + key + '"]').val(projectData[key]);
			$("#manyBidderRemark").val(projectData.manyBidderRemark);
		}

	}
	//参加开标的投标人家数
	if(projectData.tenderNumber != undefined || projectData.tenderNumber != null) {
		$("#tenderNumber").val(projectData.tenderNumber)
	} else {
		$("#tenderNumber").val('');
	}
	//成交人合计报价金额(元)
	if(projectData.dealTotalAmount != undefined || projectData.dealTotalAmount != null) {
		if(projectData.tenderType == 4 && processType != 3) {
			$("#dealTotalAmount").val()
		} else {
			$("#dealTotalAmount").val(projectData.dealTotalAmount)
		}
	} else {
		$("#dealTotalAmount").val('');
	}
	//工作人员费用小计(元)
	if(projectData.staffCostSubtotal != undefined || projectData.staffCostSubtotal != null) {
		$("#staffCostSubtotal").val(projectData.staffCostSubtotal);
	} else {
		$("#staffCostSubtotal").val('');
	}
	//审费小计(元)
	if(projectData.reviewFeeSubtotal != undefined || projectData.reviewFeeSubtotal != null) {
		$("#reviewFeeSubtotal").val(projectData.reviewFeeSubtotal);
	} else {
		$("#reviewFeeSubtotal").val('');
	}
	//合服务费小计(元)
	if(projectData.serviceFeleSubtotal != undefined || projectData.serviceFeleSubtotal != null) {
		$("#serviceFeleSubtotal").val(projectData.serviceFeleSubtotal);
	} else {
		$("#serviceFeleSubtotal").val('');
	}

	//合计代理服务费-不打折(元)
	if(projectData.agencyServiceNoFee != undefined || projectData.agencyServiceNoFee != null) {
		$("#agencyServiceNoFee").val(projectData.agencyServiceNoFee);
	} else {
		$("#agencyServiceNoFee").val('');
	}
	//合计代理服务费(元)
	if(projectData.agencyServiceFee != undefined || projectData.agencyServiceFee != null) {
		$("#agencyServiceFee").val(projectData.agencyServiceFee);
	} else {
		$("#agencyServiceFee").val('');
	}
	//合计中标金额(元)
	if(projectData.contractSettlementPriceSum != undefined || projectData.contractSettlementPriceSum != null) {
		if(projectData.tenderType == 4){
			if(flage == "1"){
				var tonumList = projectData.contractSettlementPriceSum * 10000
		
				$("[name=contractSettlementPriceSum]").val(tonumList)
				var toNum = $("[name=contractSettlementPriceSum]").val().replace(/\,|\￥/g, "")
				console.log(toNum)
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString()
				$("[name=contractSettlementPriceSum]").val(num);
				
			}else{
				$("[name=contractSettlementPriceSum]").val(projectData.contractSettlementPriceSum);
			}
		}else{
			$("[name=contractSettlementPriceSum]").val(projectData.contractSettlementPriceSum);
		}	
		
	} else {
		$("[name=contractSettlementPriceSum]").val('');
	}
	$("#contractSettlementPriceSum").html($("[name=contractSettlementPriceSum]").val());
	//造价咨询费(元)
	if(projectData.costConsultingFee != undefined || projectData.costConsultingFee != null) {
		$("#costConsultingFee").val(projectData.costConsultingFee);
	} else {
		$("#costConsultingFee").val('');
	}
	//合计标书款(元)
	if(projectData.totalBidAmount != undefined || projectData.totalBidAmount != null) {
		$("#totalBidAmount").val(projectData.totalBidAmount);
	} else {
		$("#totalBidAmount").val('');
	}
	$("#projectState").val(projectData.projectState);
	projectStateChange(projectData.projectState);
	if(processType == 3){
		$("[name=noticeSendTime]").val(projectData.noticeSendTime);
		$(".fzb").show();
		$("#dealTotalAmount").attr('datatype','*');
	}else{
		$("#noticeSendTime").html(projectData.noticeSendTime);
		if(projectData.tenderType == 4) {
			$(".fzb").hide();
			$("#dealTotalAmount").val('');
			$("#dealTotalAmount").removeAttr('datatype');
		}else{
			$(".fzb").show();
			$("#dealTotalAmount").attr('datatype','*');
		}
	}
	if(projectData.tenderType == 4) { //----------招标采购
		$('.red_tips').hide();
		$("#bidOpenTime").html(projectData.bidOpenTime);
		$("#tenderType").html('招标采购');
		if(projectData.checkState == 3 || flage != "1") {
			//checkState 0保存 1 提交审核  2审核通过 3 审核不通过
			if(projectData.entrsuSum) {
				$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum).toFixed(2).replace(/(\.\d{2})\d+$/, "$1").toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			} else {
				$("#entrsuSum").val('0');
			}
		} else if(flage == "1") {
			if(Number(projectData.entrsuSum) != Number(projectData.tenderStyle)) {
				if(projectData.entrsuSum) {
					var entrsuSumList = projectData.entrsuSum * 10000
					$("#entrsuSum").val() == $("#entrsuSum").val(entrsuSumList);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum).toFixed(2).replace(/(\.\d{2})\d+$/, "$1").toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			} else {
				if(projectData.entrsuSum) {
					$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum).toFixed(2).replace(/(\.\d{2})\d+$/, "$1").toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			}
		}
		if(processType == "3"){
			$("#bidCheckType").val(projectData.bidCheckType);
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
					default:  break;
				}
				$("#bidCheckType").html(text);
			} else {
				$("#bidCheckType").attr("optionName", "checkType" + projectData.projectType.substring(0, 1));
				optionValueView($("#bidCheckType"),projectData.bidCheckType);
			}
		}
		
		//评审办法
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
		if (processType == '2') {
			var dic = {
				"1": "工程类型",
				"2": "国内货物",
				"3": "国际招标",
				"4": "服务类型",
				"5": "广宣平台",
				"11": "装备",
				"12": "后勤物资",
			}
			var options = '<option value="1">工程类型</option>'
			+ '<option value="2">国内货物</option>'
			+ '<option value="3">国际招标</option>'
			+ '<option value="4">服务类型</option>'
			+ '<option value="5">广宣平台</option>'
			+ '<option value="11">装备</option>'
			+ '<option value="12">后勤物资</option>';
			var projectType = dic[projectData.projectType] ? projectData.projectType : '1';
			$("#projectType").html(options).val(projectType);
		} else {
			if(projectData.projectType == 'A') {
				$("#projectType").find("option").eq(0).prop("selected", true)
			} else if(projectData.projectType == 'B') {
				$("#projectType").find("option").eq(1).prop("selected", true)
			} else if(projectData.projectType == '9') {
				$("#projectType").find("option").eq(2).prop("selected", true)
			} else if(projectData.projectType == 'C') {
				$("#projectType").find("option").eq(3).prop("selected", true)
			} else if(projectData.projectType == 'C50') {
				$("#projectType").find("option").eq(4).prop("selected", true)
			} else if(projectData.projectType == '4') {
				$("#projectType").find("option").eq(5).prop("selected", true)
			} else if(projectData.projectType == '11') {
				$("#projectType").find("option").eq(6).prop("selected", true)
			} else if(projectData.projectType == '12') {
				$("#projectType").find("option").eq(7).prop("selected", true)
			}
		}
	} else if(projectData.tenderType == 0) { //-------询比采购
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.creatTime);
		$("#tenderType").html('询价采购');
		//委托金额（预算）
		if(projectData.checkState == 3 || flage != "1") {
			if(projectData.entrsuSum) {
				$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			} else {
				$("#entrsuSum").val('0');
			}
		} else if(flage == "1") {
			if(Number(projectData.entrsuSum) != Number(projectData.tenderStyle)) {
				if(projectData.entrsuSum) {
					var entrsuSumList = projectData.entrsuSum * 10000
					$("#entrsuSum").val() == $("#entrsuSum").val(entrsuSumList);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			} else {
				if(projectData.entrsuSum) {
					$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			}
		}
		//评审办法
		if(processType == "3"){
			$("#bidCheckType").val(projectData.bidCheckType);
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
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.projectType == '1') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.projectType == '9') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.projectType == '2') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.projectType == '3') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.projectType == '4') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.projectType == '11') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.projectType == '12') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
		if(projectData.dataTypeName == '建安工程') {
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.dataTypeName == '国内货物') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.dataTypeName == '国际货物') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.dataTypeName == '服务') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.dataTypeName == '广宣') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.dataTypeName == '废旧物资') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.dataTypeName == '装备') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.dataTypeName == '后勤物资') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
	} else if(projectData.tenderType == 6) { //----------单一来源
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.creatTime);
		$("#tenderType").html('单一来源');
		//委托金额（预算）
		if(projectData.checkState == 3 || flage != "1") {
			if(projectData.entrsuSum) {
				$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			} else {
				$("#entrsuSum").val('0');
			}
		} else if(flage == "1") {
			if(Number(projectData.entrsuSum) != Number(projectData.tenderStyle)) {
				if(projectData.entrsuSum) {
					var entrsuSumList = projectData.entrsuSum * 10000
					$("#entrsuSum").val() == $("#entrsuSum").val(entrsuSumList);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			} else {
				if(projectData.entrsuSum) {
					$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			}
		}
		if(processType == "3"){
			$("#bidCheckType").val(projectData.bidCheckType);
		}else{
			//评审办法
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
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.projectType == '1') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.projectType == '9') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.projectType == '2') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.projectType == '3') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.projectType == '4') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.projectType == '11') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.projectType == '12') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
		if(projectData.dataTypeName == '建安工程') {
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.dataTypeName == '国内货物') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.dataTypeName == '国际货物') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.dataTypeName == '服务') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.dataTypeName == '广宣') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.dataTypeName == '废旧物资') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.dataTypeName == '装备') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.dataTypeName == '后勤物资') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
	} else if(projectData.tenderType == 1) { //-----竞价采购
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.offerStartDate);
		$("#tenderType").html('竞价采购');
		//委托金额（预算）
		if(projectData.checkState == 3 || flage != "1") {
			if(projectData.bidCheckType == 6 || projectData.bidCheckType == 7) {
				var entrsuSumList2 = projectData.entrsuSum
				$("#entrsuSum").val() == $("#entrsuSum").val(Number(entrsuSumList2));
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			} else {
				$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum)
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			}
		} else if(flage == "1") {
			if(Number(projectData.entrsuSum) != Number(projectData.tenderStyle)) {
				if(projectData.bidCheckType == 6 || projectData.bidCheckType == 7) {
					var entrsuSumList2 = projectData.entrsuSum
					$("#entrsuSum").val() == $("#entrsuSum").val(Number(entrsuSumList2));
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					var entrsuSumList = projectData.entrsuSum * 10000
					$("#entrsuSum").val() == $("#entrsuSum").val(entrsuSumList)
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				}
			} else {
				if(projectData.bidCheckType == 6 || projectData.bidCheckType == 7) {
					var entrsuSumList2 = projectData.entrsuSum
					$("#entrsuSum").val() == $("#entrsuSum").val(Number(entrsuSumList2));
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum)
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				}
			}
		}
		//评审办法 	自由竞价 单轮竞价 多轮竞价 不限轮次 清单式竞价 单项目竞价
		if(processType == "3"){
			$("#bidCheckType").val(projectData.bidCheckType);
		}else{
			if(projectData.bidCheckType == 0) {
				$("#bidCheckType").html('自由竞价')
			}
			if(projectData.bidCheckType == 1) {
				$("#bidCheckType").html('单轮竞价')
			}
			if(projectData.bidCheckType == 5) {
				$("#bidCheckType").html('多轮竞价')
			}
			if(projectData.bidCheckType == 2) {
				$("#bidCheckType").html('多轮竞价(2)轮')
			}
			if(projectData.bidCheckType == 3) {
				$("#bidCheckType").html('多轮竞价(3)轮')
			}
			if(projectData.bidCheckType == 4) {
				$("#bidCheckType").html('不限轮次')
			}
			if(projectData.bidCheckType == 6) {
				$("#bidCheckType").html('清单式竞价');
			}
			if(projectData.bidCheckType == 7) {
				$("#bidCheckType").html('单项目竞价')
			}
		}
		//项目类型
		if(projectData.projectType == '0') {
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.projectType == '1') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.projectType == '9') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.projectType == '2') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.projectType == '3') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.projectType == '4') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.projectType == '11') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.projectType == '12') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
		if(projectData.dataTypeName == '建安工程') {
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.dataTypeName == '国内货物') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.dataTypeName == '国际货物') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.dataTypeName == '服务') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.dataTypeName == '广宣') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.dataTypeName == '废旧物资') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.dataTypeName == '装备') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.dataTypeName == '后勤物资') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
	} else if(projectData.tenderType == 2) { //--------竞卖采购
		$('.red_tips').hide();
		$("#bidOpenTime").html(projectData.bidOpenTime?projectData.bidOpenTime:projectData.offerStartDate);
		$("#tenderType").html('竞卖采购');

		//委托金额（预算）
		if(projectData.checkState == 3 || flage != "1") {
			if(projectData.entrsuSum) {
				$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
				var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
				var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
				$("#entrsuSum").val(num.join("."));
			} else {
				$("#entrsuSum").val('0');
			}
		} else if(flage == "1") {
			if(Number(projectData.entrsuSum) != Number(projectData.tenderStyle)) {
				if(projectData.entrsuSum) {
					var entrsuSumList = projectData.entrsuSum * 10000
					$("#entrsuSum").val() == $("#entrsuSum").val(entrsuSumList);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			} else {
				if(projectData.entrsuSum) {
					$("#entrsuSum").val() == $("#entrsuSum").val(projectData.entrsuSum);
					var toNum = $("#entrsuSum").val().replace(/\,|\￥/g, "")
					var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
					num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
					$("#entrsuSum").val(num.join("."));
				} else {
					$("#entrsuSum").val('0');
				}
			}
		}
		//评审办法  自由竞卖 单轮竞卖 多轮竞卖
		if(processType == "3"){
			$("#bidCheckType").val(projectData.bidCheckType);
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
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.projectType == '1') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.projectType == '9') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.projectType == '2') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.projectType == '3') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.projectType == '4') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.projectType == '11') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.projectType == '12') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
		if(projectData.dataTypeName == '建安工程') {
			$("#dataTypeName").find("option").eq(0).prop("selected", true)
		} else if(projectData.dataTypeName == '国内货物') {
			$("#dataTypeName").find("option").eq(1).prop("selected", true)
		} else if(projectData.dataTypeName == '国际货物') {
			$("#dataTypeName").find("option").eq(2).prop("selected", true)
		} else if(projectData.dataTypeName == '服务') {
			$("#dataTypeName").find("option").eq(3).prop("selected", true)
		} else if(projectData.dataTypeName == '广宣') {
			$("#dataTypeName").find("option").eq(4).prop("selected", true)
		} else if(projectData.dataTypeName == '废旧物资') {
			$("#dataTypeName").find("option").eq(5).prop("selected", true)
		} else if(projectData.dataTypeName == '装备') {
			$("#dataTypeName").find("option").eq(6).prop("selected", true)
		} else if(projectData.dataTypeName == '后勤物资') {
			$("#dataTypeName").find("option").eq(7).prop("selected", true)
		}
	} else if(projectData.tenderType == 13) { //--------竞争性磋商
		$("#tenderType").html('竞争性磋商');
		$("#dealTotalAmount").attr('disabled', false);
	} else if(projectData.tenderType == 12) { //--------竞争性谈判
		$("#tenderType").html('竞争性谈判');
		$("#dealTotalAmount").attr('disabled', false);
	}

	if(projectData.marketType == 'DF') {
		$("#marketType").html('内部市场')
	}
	$("#purchaserName").html(projectData.purchaserName);
	//交易平台
	/**
	 * 
	 * 线下 platformType 
	 * {
            '1': '交易平台',
            '2': '政府平台',
            '3': '国际招标平台',
            '4': '其他',
        },
	 *  线上 tenderDesk
		{
			0: '平台',
			2: '长安平台',
			3: '企采平台',
			4: '政府采购平台',
			5: '必联网',
			6: '政府交易平台',
			7: '线下项目',
			8: '中汽创智平台',
			9: '国际招标网',
			99: '其他交易平台',
		}
	 */
	if (processType == '2') {
		var dic = {
            '1': '平台',
            '2': '政府平台',
            '3': '国际招标平台',
            '4': '其他',
        }
		$("#tenderDesk").html(dic[projectData.tenderDesk] || '平台')
	} else {
		if(projectData.tenderDesk == "0") {
			$("#tenderDesk").html('平台');
		} else if (projectData.tenderDesk == "1") {
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
	$("#projectDepartmentName").val(projectData.projectDepartmentName);
	/* if(projectData.projectOfficeName) {
		$("#projectOfficeName").val(projectData.projectOfficeName);
	} else {
		$("#projectOfficeName").val(projectData.projectDepartmentName);
	} */
	$("#projectOfficeName").val(projectData.projectOfficeName);
	$("#tenderAgencyLinkmen").html(projectData.tenderAgencyLinkmen);
	$("#enterpriseName").html(projectData.enterpriseName);
	$("#noticeStartDate").html(projectData.noticeStartDate);
	$('#legalName').html(projectData.legalName);
	$("#bidOpeningEndTime").html(projectData.bidOpeningEndTime);
	if(projectData.tenderMode == 1 || projectData.tenderMode == 0) {
		$("#tenderMode").html('公开');
	} else if(projectData.tenderMode == 2) {
		$("#tenderMode").html('邀请');
	}
	if(projectData.isObjection == 1) {
		$("#isObjection").find("option").eq(1).prop("selected", true)
	} else {
		$("#isObjection").find("option").eq(0).prop("selected", true)
	}

	$("#tenderProjectID").val(projectId);
	$("#month").val(projectData.complectMonth)
	$("#backups").val(projectData.backups)
	if(projectData["exception"]) {
		$(".exceptionView1").show()
	}

};

//审核确定按钮
$("#btn_submit").click(function() {
	if(checkForm($("#formbackage"))) { //必填验证，在公共文件unit中
		if(processType == "3"){//线下项目登记的验证时间关系
			if(checkTimes()){
				if($("#employeeId").val() == "") {
					parent.layer.alert("请选择审核人");
					return false;
				};
				saveFuct(true);
			}
		}else{
			if($("#employeeId").val() == "") {
				parent.layer.alert("请选择审核人");
				return false;
			};
			saveFuct(true);
		}
	}
});
//保存
$("#btn_bao").click(function() {
	saveFuct(false);
})
//isSubmit: true 提交   false 保存
function saveFuct(isSubmit, callback) {
	var reviewFeeSubtotal = $("#reviewFeeSubtotal").val();
	reviewFeeSubtotal = reviewFeeSubtotal.toString();
	reviewFeeSubtotal = reviewFeeSubtotal.replace(/[ ]/g, ""); //去除空格
	reviewFeeSubtotal = reviewFeeSubtotal.replace(/,/gi, '');

	var staffCostSubtotal = $("#staffCostSubtotal").val();
	staffCostSubtotal = staffCostSubtotal.toString();
	staffCostSubtotal = staffCostSubtotal.replace(/[ ]/g, ""); //去除空格
	staffCostSubtotal = staffCostSubtotal.replace(/,/gi, '');

	var serviceFeleSubtotal = $("#serviceFeleSubtotal").val();
	serviceFeleSubtotal = serviceFeleSubtotal.toString();
	serviceFeleSubtotal = serviceFeleSubtotal.replace(/[ ]/g, ""); //去除空格
	serviceFeleSubtotal = serviceFeleSubtotal.replace(/,/gi, '');

	var totalBidAmount = $("#totalBidAmount").val();
	totalBidAmount = totalBidAmount.toString();
	totalBidAmount = totalBidAmount.replace(/[ ]/g, ""); //去除空格
	totalBidAmount = totalBidAmount.replace(/,/gi, '');

	var agencyServiceNoFee = $("#agencyServiceNoFee").val();
	agencyServiceNoFee = agencyServiceNoFee.toString();
	agencyServiceNoFee = agencyServiceNoFee.replace(/[ ]/g, ""); //去除空格
	agencyServiceNoFee = agencyServiceNoFee.replace(/,/gi, '');

	var agencyServiceFee = $("#agencyServiceFee").val();
	agencyServiceFee = agencyServiceFee.toString();
	agencyServiceFee = agencyServiceFee.replace(/[ ]/g, ""); //去除空格
	agencyServiceFee = agencyServiceFee.replace(/,/gi, '');

	var costConsultingFee = $("#costConsultingFee").val();
	costConsultingFee = costConsultingFee.toString();
	costConsultingFee = costConsultingFee.replace(/[ ]/g, ""); //去除空格
	costConsultingFee = costConsultingFee.replace(/,/gi, '');

	var projectCostSubtotal = $("#projectCostSubtotal").val();
	projectCostSubtotal = projectCostSubtotal.toString();
	projectCostSubtotal = projectCostSubtotal.replace(/[ ]/g, ""); //去除空格
	projectCostSubtotal = projectCostSubtotal.replace(/,/gi, '');

	var notCostConsultingFee = $("#notCostConsultingFee").val();
	notCostConsultingFee = notCostConsultingFee.toString();
	notCostConsultingFee = notCostConsultingFee.replace(/[ ]/g, ""); //去除空格
	notCostConsultingFee = notCostConsultingFee.replace(/,/gi, '');

	var haveCostConsultingFee = $("#haveCostConsultingFee").val();
	haveCostConsultingFee = haveCostConsultingFee.toString();
	haveCostConsultingFee = haveCostConsultingFee.replace(/[ ]/g, ""); //去除空格
	haveCostConsultingFee = haveCostConsultingFee.replace(/,/gi, '');

	var dealTotalAmount = $("#dealTotalAmount").val();
	dealTotalAmount = dealTotalAmount.toString();
	dealTotalAmount = dealTotalAmount.replace(/[ ]/g, ""); //去除空格
	dealTotalAmount = dealTotalAmount.replace(/,/gi, '');

	var entrsuSum = $("#entrsuSum").val();
	entrsuSum = entrsuSum.toString();
	entrsuSum = entrsuSum.replace(/[ ]/g, ""); //去除空格
	entrsuSum = entrsuSum.replace(/,/gi, '');

	var contractSettlementPriceSum = $("[name=contractSettlementPriceSum]").val();
	contractSettlementPriceSum = contractSettlementPriceSum.toString();
	contractSettlementPriceSum = contractSettlementPriceSum.replace(/[ ]/g, ""); //去除空格
	contractSettlementPriceSum = contractSettlementPriceSum.replace(/,/gi, '');
	var projectDataList = {};
	var datalist = projectData;
	
	for(var key in datalist) {
		projectDataList[key] = datalist[key];
	};
	if(isSubmit){
		if(tenderType === ''){
			parent.layer.alert("温馨提示：请选择采购方式");
			return false;
		}
		if(tenderType == 4) {
			var pro = $("#projectType").val();
			if($("#projectType").val() == "") {
				parent.layer.alert("温馨提示：请选择项目类型");
				return false;
			}
		} else {
			var pro = $("#dataTypeName").val();
			projectDataList.dataTypeName = $("#dataTypeName option:selected").text();
			if($("#dataTypeName").val() == "") {
				parent.layer.alert("温馨提示：请选择项目类型");
				return false;
			}
			
		}
		if(!(processType != "3" && tenderType == 4)){
			if($("#dealTotalAmount").val() == "" || $("#dealTotalAmount").val() == undefined) {
				parent.layer.alert("温馨提示：请填写成交人合计报价金额(元)");
				return false;
			}
		}
		if($("#Province").val() == "" || $("#Province").val() == undefined) {
			parent.layer.alert("温馨提示：请选择项目实施地点(省/市)");
			return false;
		}
		if($('[name=projectState]').val() != 8 && $('[name=projectState]').val() != 9){
			if($("#ProvinceKb").val() == "" || $("#ProvinceKb").val() == undefined) {
				parent.layer.alert("温馨提示：请选择开标地点");
				return false;
			}
			if($("#tenderNumber").val() == "" || $("#tenderNumber").val() == undefined) {
				parent.layer.alert("温馨提示：请添加参加开标的投标人家数");
				return false;
			}
		}
		if($('[name=projectState]').val() == 4){
			if($("#agencyServiceNoFee").val() == "" || $("#agencyServiceNoFee").val() == undefined) {
				parent.layer.alert("温馨提示：请填写合计代理服务费-不打折(元)");
				return false;
			}
			if($("#agencyServiceFee").val() == "" || $("#agencyServiceFee").val() == undefined) {
				parent.layer.alert("温馨提示：请填写合计代理服务费(元)");
				return false;
			}
		}
		/* if($("#costConsultingFee").val() == "" || $("#costConsultingFee").val() == undefined) {
			parent.layer.alert("温馨提示：请填写造价咨询费(元)");
			return false;
		} */
		if($("#backups").val().length > 1000) {
			parent.layer.alert("温馨提示：备注不能超过1000字符");
			return false;
		}
	}else{
		if(tenderType == 4) {
			var pro = $("#projectType").val();
		} else {
			var pro = $("#dataTypeName").val()
			projectDataList.dataTypeName = $("#dataTypeName option:selected").text();
		}
	}
	
	projectDataList.outSystemNumber = $("#outSystemNumber").val();
	projectDataList.projectDepartmentName = $("#projectDepartmentName").val();
	projectDataList.projectDepartmentId = $("#projectDepartmentId").val();
	projectDataList.projectOfficeName = $("#projectOfficeName").val();
	projectDataList.projectOfficeId = $("#projectOfficeId").val();
	projectDataList.purchaserLinkmen = $("#purchaserLinkmen").val();
	projectDataList.purchaserLinkphone = $("#purchaserLinkphone").val();
	projectDataList.purchaserLinkemail = $("#purchaserLinkemail").val();
	projectDataList.publlcProcurement = $("[name='publlcProcurement']").val();
	projectDataList.projectState = $("#projectState").val();
	projectDataList.projectImplementAdder = $("#City").val();
	projectDataList.bidOpenAdder = $("#CityKb").val();
	projectDataList.tenderNumber = $("#tenderNumber").val();
	projectDataList.isObjection = $("#isObjection").val();
	projectDataList.projectType = pro;
	projectDataList.reviewFeeSubtotal = reviewFeeSubtotal;
	projectDataList.staffCostSubtotal = staffCostSubtotal;
	projectDataList.serviceFeleSubtotal = serviceFeleSubtotal;
	projectDataList.projectCostSubtotal = projectCostSubtotal;
	projectDataList.manyBidderRemark = $("#manyBidderRemark").val();
	projectDataList.manyBidderLinkmen = $("#manyBidderLinkmen").val();
	projectDataList.manyBidderLinkphone = $("#manyBidderLinkphone").val();
	projectDataList.manyBidderLinkemail = $("#manyBidderLinkemail").val();
	projectDataList.dealTotalAmount = dealTotalAmount;
	projectDataList.entrsuSum = entrsuSum;
	projectDataList.tenderStyle =projectData.tenderStyle;
	projectDataList.contractSettlementPriceSum = contractSettlementPriceSum;
	projectDataList.agencyServiceNoFee = agencyServiceNoFee;
	projectDataList.agencyServiceFee = agencyServiceFee;
	projectDataList.costConsultingFee = costConsultingFee;
	projectDataList.totalBidAmount = totalBidAmount;
	projectDataList.notCostConsultingFee = notCostConsultingFee;
	projectDataList.haveCostConsultingFee = haveCostConsultingFee;
	projectDataList.backups = $("#backups").val();
	projectDataList.bidSectionCode =  $("#bidSectionCode").html();
	projectDataList.filePrice = $("#filePrice").val();
	projectDataList.finalIncome = $("#finalIncome").val();
	projectDataList.refundActualTime = $("#refundActualTime").val();

	projectDataList.auditorId = $('#employeeId option:selected').val();
	projectDataList.auditorName = $('#employeeId option:selected').text();
	projectDataList.checkerId = $('#employeeId option:selected').val();
	if(processType == "3"){
		projectDataList.tenderType = $('[name=tenderType]').val();
		projectDataList.tenderDesk = $('[name=tenderDesk]').val();
		projectDataList.bidCheckType = $.trim($('[name=bidCheckType]').val());
		projectDataList.tenderMode = $('[name=tenderMode]').val();
		projectDataList.noticeStartDate = $('[name=noticeStartDate]').val();
		projectDataList.bidOpenTime = $('[name=bidOpenTime]').val();
		projectDataList.noticeSendTime = $('[name=noticeSendTime]').val();
	}
	if(!$.isEmptyObject(resetRenderData)){
		projectDataList.ago = resetRenderData.ago;
		projectDataList.after = resetRenderData.after;
		projectDataList.reason = resetRenderData.reason;
		projectDataList.purchaserName = resetRenderData.after;
	}
	
	if(isSubmit){
		projectDataList.checkState = 1;
	}else{
		projectDataList.checkState = 0;
	}

	if(isSubmit&&isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			save(projectDataList, isSubmit, callback);
		});
	} else {
		save(projectDataList, isSubmit, callback);
	}
}
function save(arr, isSubmit, callback){
	$.ajax({
		url: saveProjectPackage, //修改包件的接口
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: arr,
		success: function(data) {
			if(data.success == true) {
				if(top.window.document.getElementById("consoleWindow")) {
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				};
				parent.$('#table').bootstrapTable('refresh'); // 很重要的一步，刷新url！
				if(callback){
					callback(data.data);
				}else{
					if(isSubmit){
						if(feeConfirmVersion==2){
							parent.layer.alert("温馨提示：提交审核成功,请在中标结果通知书发出/项目结束35天内在业务管理系统完成费用确认。")
						}else{
							parent.layer.alert("温馨提示：提交审核成功")
						}
						
						parent.layer.close(parent.layer.getFrameIndex(window.name));
					}else{
						parent.layer.alert("温馨提示：保存成功");
					}
				}
				
			} else {
				parent.layer.alert('温馨提示：'+data.message);
				return false;
			}
		}
	});
}
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

$(".departmentName, .projectDepartmentName").click(function() {
	var name = this.name;
	var uid = top.enterpriseId
	var mnuid = (name == 'projectOfficeName') ? $('input[name=projectOfficeId]').val() :
		(name == 'projectDepartmentName' ? $('input[name=projectDepartmentId]').val() : null);
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			if(name == 'projectDepartmentName'){
				iframeWind.employee(uid, name, callEmployeeBack, mnuid, true)
			}else{
				iframeWind.employee(uid, name, callEmployeeBack, mnuid)
			}
		},
	})
})

function callEmployeeBack(aRopName, dataTypeList) {
	var itemTypeId = [];
	var itemTypeName = [];
	for(var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList = itemTypeId.join(",");
	typeNameList = itemTypeName.join(",");
	if(aRopName == 'projectOfficeName') {
		$('input[name=projectOfficeName]').val(typeNameList);
		$('input[name=projectOfficeId]').val(typeIdList);
	} else if(aRopName == 'projectDepartmentName') {
		$('input[name=projectDepartmentId]').val(typeIdList);
		$('input[name=projectDepartmentName]').val(typeNameList);
	}
}
//
$(".positiveInt").on('change', function() {
	var regnum = new RegExp(/^([1-9]\d*|[0]{1,1})$/);
	if(!regnum.test($(this).val())) {
		parent.layer.alert("温馨提示:参加开标的投标人家数为正整数!");
		$(this).val("");
		return;
	}
})
//验证金额
$(".priceNumber").on('blur', function() {

	var regexNumber = new RegExp(/^(0|\+?[1-9][0-9]*)$/);
	var regexPrice = new RegExp('^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,2})?$');

	if($(this).attr('name') == 'tenderNumber' && !regexNumber.test($(this).val())) {
		parent.layer.alert("温馨提示:投标人家数必须为大于等于0的整数！");
		$(this).val("");
		return;
	};

	//	if(($(this).val().indexOf('.') + 1) == $(this).val().length) {
	//		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多2位小数!");
	//		$(this).val("");
	//		return;
	//	}
	var reg = /^\d{1,13}(\.\d{1,2})?$/

	if(!(reg.test($(this).val()))) {
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多2位小数!");
		$(this).val("");
		return
	};
	//	if($(this).val().indexOf(',') != -1) {
	//		parent.layer.alert("温馨提示:请使用中文逗号，易于区分!");
	//		return;
	//	}

	var result = false;
	if(($(this).val().indexOf('，') != -1)) {
		var len = $(this).val().split('，');
		for(j = 0, num = len.length; j < num; j++) {

			if((len[j].indexOf('.') + 1) == len[j].length) {
				parent.layer.alert("温馨提示:金额必须大于等于零且数值最多2位小数!");

				return;
			}

			var result = regexPrice.test(len[j])
			if(result == false) {
				break;
			}
		}
		if(!result) {
			parent.layer.alert("温馨提示:金额必须大于等于零且数值最多2位小数!");
			return;
		};
	} else {
		if(!regexPrice.test($(this).val())) {
			parent.layer.alert("温馨提示:金额必须大于等于零且数值最多2位小数!");
			$(this).val("");
			return;
		};

	}
	var toNum = $(this).val().replace(/\,|\￥/g, "")
	var num = parseFloat(toNum.replace(/(\.\d{2})\d+$/, "$1")).toFixed(2).toString().split(".");
	num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
	$(this).val(num.join("."));
});
$(".priceNumber").on('focus', function() {
	$(this).val($(this).val().replace(",",""));
})
// 将金额类型转为数字类型
//			function toNum(str) {
//				return str.replace(/\,|\￥/g, "");
//			}
// 保留两位小数（不四舍五入）
//function toPrice1(num) {
//				num = parseFloat(toNum(num).replace(/(\.\d{2})\d+$/,"$1")).toFixed(2).toString().split(".");
//				num[0] = num[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)','ig'),"$1,");
//				return "￥" + num.join(".");;
//			}
$('#reset_tender').click(function(){
	parent.layer.open({
		type: 2 ,//此处以iframe举例
		maxmin: true,
		resize: false,
		title: '修改',
		area: ['800px', '600px'],
		content: 'bidPrice/DataReport/public/model/resetTender.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.passMessage($('#purchaserName').html(), function(data){
				$('#purchaserName').html(data.after);
				resetRenderData = data;
			})
		},
	})
});
function checkTimes(){
	//首次建项时间< 公告发布时间/招标文件开始发售时间（年/月/日）< 开标时间 ≤中标通知书发出时间 ≤项目结束时间，若某时间因非必填没有值，则该节点不参与校验。
	var bidOpeningEndTime = projectData.bidOpeningEndTime || '';//首次建项时间
	var noticeStartDate = $('[name=noticeStartDate]').val();//公告发布时间/招标文件开始发售时间（年/月/日）
	var bidOpenTime = $('[name=bidOpenTime]').val();//开标时间
	var noticeSendTime = $('[name=noticeSendTime]').val();//中标通知书发出时间(项目结束时间（月度更新）注：中标通知书发出时间/项目异常的公告时间/开标失败的开标时间)
	if(bidOpeningEndTime != "" && noticeStartDate != ""){
		if(Date.parse(new Date(bidOpeningEndTime.split(' ')[0].replace(/\-/g, "/"))) > Date.parse(new Date(noticeStartDate.replace(/\-/g, "/")))){
			top.layer.alert('项目分配时间应小于或等于公告发布时间/招标文件开始发售时间')
			return false
		}
	}
	if(noticeStartDate != "" && bidOpenTime != ""){
		if(Date.parse(new Date(noticeStartDate.replace(/\-/g, "/"))) > Date.parse(new Date(bidOpenTime.split(' ')[0].replace(/\-/g, "/")))){
			top.layer.alert('公告发布时间/招标文件开始发售时间应小于或等于开标时间')
			return false
		}
	}
	if(bidOpenTime != "" && noticeSendTime != ""){
		if(Date.parse(new Date(bidOpenTime.split(' ')[0].replace(/\-/g, "/"))) > Date.parse(new Date(noticeSendTime.replace(/\-/g, "/")))){
			top.layer.alert('开标时间时间应小于或等于中标通知书发出时间')
			return false
		}
	}
	return true
}
function getPackageFefundTime(){
	$.ajax({
		url: getPackageFefundTimeUrl,
		type: 'post',
		data: {
			packageId: packageId,
		},
		async:false,
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if(data.data.refundActualTime){
				$("#refundActualTime").val(data.data.refundActualTime);
			}else{
				$("#refundActualTime").val("");
			}
		},
		error: function (data) {
			parent.layer.alert('加载失败');
		},
	});
}