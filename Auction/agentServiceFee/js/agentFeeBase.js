var agentUrl = top.config.AuctionHost + "/ProjectBidResultController/getAgentServiceFee.do";
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
////详情
var feeConfirmVersionUrl = top.config.AuctionHost + "/BidResultHisController/getPackageVersion.do";//获取费用版本
function agentInfo(proId, packId, id){
	var version = getFeeConfirmVersion(packId);
	var html = '<table class="table table-bordered" style="margin-bottom:0px;"><tr><td colspan="4" class="active">采购代理服务费<span class="red" style="margin-left: 50px;font-size:14px;">提醒：若服务费收取方式与合同约定不一致，请先按公司规定进行审批。</span></td></tr>\
				<tr>\
					<td class="th_bg">收取方式</td>\
					<td id="collectType" style="min-width:200px"></td>\
					<td class="th_bg">项目类型</td>\
					<td id="dataTypeCode" style="min-width:200px"></td>\
				</tr>\
				<tr>\
					<td class="th_bg"><span id="feeTit1">是否优惠</span></td>\
					<td id="feeTxt1" style="word-break:break-all;"></td>\
					<td class="th_bg"><span id="feeTit2">优惠系数</span></td>\
					<td><span id="feeTxt2"></span></td>\
				</tr>\
				<tr>\
					<td class="th_bg">币种</td>\
					<td>人民币</td>\
					<td class="th_bg">报价单位</td>\
					<td><span id="unit"></span></td>\
				</tr>\
				<tr>\
					<td class="th_bg">服务费支付方式</td>\
					<td>\
						<input type="radio" name="payer" value="0" checked="checked"/>中选人\
						<input type="radio" name="payer" value="1"/>招标人\
					</td>'
					if(version == 1){
						html += '<td colspan="2"><input type="checkbox" name="isReturn" value="0"> 保证金全额退，中标服务费补交</td>'
					}
					html +='</tr>\
				<tr>\
					<td colspan="4" style="padding: 0;">\
						<div class="tips" style="line-height: 40px;color: red;padding-left:10px;">'+((agentPurchaseType==1 || agentPurchaseType==2)&&auctionModel==1 ? "成交总额：明细1 * 数量 + 明细2 * 数量 + ···" : "")+'</div>\
						<table class="table table-bordered" id="agentTable" style="margin-bottom: 0;"></table>\
					</td>\
				</tr>\
				<tr>\
					<td class="th_bg">按标准计算服务费过程</td>\
					<td colspan="3">\
						<div id="calculateProcess"></div>\
					</td>\
				</tr>\
				<tr>\
					<td class="th_bg">附件</td>\
					<td colspan="3">\
						<div style="width: 300px;display: none;margin-bottom: 5px;" id="fileBtn"><input type="file" class="fileloading" name="files" id="agentFeeFile" accept="" /></div>\
						<table class="table table-hover table-bordered" id="file_table"></table>\
					</td>\
				</tr></table>';
	$(html).appendTo("#agentBlock");
	getAgentDetail(proId, packId, id);
}

function getAgentDetail(proId, packId, id){
	$.ajax({
		url: agentUrl,
		dataType: 'json',
		data: {
			projectId: proId,
			packageId: packId,
			id: id
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			if(!data.data.inventoryFee || data.data.inventoryFee.length == 0){
				$("#agentBlock").html("");
				return false;
			}
			projectServiceFee = data.data.projectServiceFee;
			showAgentInfo(data.data.projectType);
			agentIsShow(data.data.inventoryFee);
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
}
function agentIsShow(inventoryFee) {
	
	var flag = false;
	var html = "";
	var serviceTotal = "", receiptsTotal = "", discountTotal = "";
	var calculateProcess = "";
	
	$("#agentTable tr").remove();
	if($("#agentTable tr").length == 0){
		html += '<tr><th>中选人</th><th style="text-align:right;">成交总额</th>';
		if(projectServiceFee.collectType == 1){
			html += '<th>计算规则</th>';
		}
		html += '<th style="text-align:right;">成交服务费用-按标准计取</th>';
		if(projectServiceFee.collectType == 1){
			html += '<th style="text-align:right;">优惠后</th>';
		}
		html+='<th style="text-align:right;">应缴服务费</th><th>调整原因</th></tr>'
	}
	
	
	for(var i = 0; i < inventoryFee.length; i++) {
		var agentItem = inventoryFee[i];
		enterName = agentItem.supplierName;
		!isNum(agentItem.serviceFee) ? "" : serviceTotal =numAdd(Number(serviceTotal), Number(agentItem.serviceFee));
		!isNum(agentItem.discountMoney) ? "" : discountTotal =numAdd(Number(discountTotal), Number(agentItem.discountMoney));
		!isNum(agentItem.receiptsMoney) ? "" : receiptsTotal = numAdd(Number(receiptsTotal), Number(agentItem.receiptsMoney));
		agentItem.calculateProcess=="" ? "" : calculateProcess +="根据"+enterName+"的中标/成交金额计算的服务费：" + agentItem.calculateProcess + "<br/>";
		
		html += '<tr data-index="'+i+'">' 
			+'<td>' + showBidderRenameList(agentItem.supplierId, agentItem.supplierName, RenameData, 'body') + '</td>' 
			+'<td style="text-align:right;">' + agentItem.totalTransaction + '</td>' 
			
		if(projectServiceFee.collectType == 1){ //标准累计制
				html += '<td>'+agentItem.graduatedName+'</td>';
		}
		html+='<td style="text-align:right;">'+(isNum(agentItem.serviceFee) ? agentItem.serviceFee : "")+'</td>';
		if(projectServiceFee.collectType == 1){
			html+='<td style="text-align:right;">'+(isNum(agentItem.discountMoney) ? agentItem.discountMoney : "")+'</td>';
		}
		var strColor="";
		if(projectServiceFee.collectType == 1){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.discountMoney)?"color:red":"");
		} else if(projectServiceFee.collectType == 0){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.serviceFee)?"color:red":"");
		} else {
			strColor = "color:red";
		}
		
		html+='<td style="text-align:right;"><span style="'+strColor+'">' + (isNum(agentItem.receiptsMoney) ? agentItem.receiptsMoney : "")+'</span>';

		html+='</td>'
			+'<td style="width:240px;"><div style="width:240px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ (agentItem.adjustRemark ? agentItem.adjustRemark : "") +'">'+(agentItem.adjustRemark ? agentItem.adjustRemark : "")+'</div></td>'
			+'</tr>';
		
	}
		
	if(projectServiceFee.collectType ==1){
		html += '<tr><td colspan="3" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+serviceTotal+'</td><td style="text-align:right;border: none;">'+discountTotal+'</td><td style="text-align:right;border: none;">'+receiptsTotal+'</td><td style="border: none;"></td></tr>'
	} else {
		html += '<tr><td colspan="2" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+serviceTotal+'</td><td style="text-align:right;border: none;">'+receiptsTotal+'</td><td style="border: none;"></td></tr>'
	}
//	$("#agentFeeTotal").html(agentFeeTotal);
	$("#calculateProcess").html(projectServiceFee.collectType ==1 ? calculateProcess : "");
	$(html).appendTo("#agentTable");
	
	inventoryFee.length>0&&inventoryFee[0].isReturn==0 ? $("[name='isReturn']").prop("checked", "checked") : "";
	inventoryFee.length>0&&inventoryFee[0].payer ? $("[name='payer']").val([inventoryFee[0].payer]) : "";
}
//是否数字
function isNum(val){
	if (parseFloat(val).toString() == "NaN") {
　　　　	return false;
　　	} else {
　　　　	return true;
　　	}
}
//加
function numAdd(num1, num2){
	var baseNum = 0, baseNum1 = 0, baseNum2 = 0;
	try{
		baseNum1 = num1.toString().split(".")[1].length;
	} catch (e){
		baseNum1 = 0;
	}
	try{
		baseNum2 = num2.toString().split(".")[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	
	baseNum = Math.pow(10, Math.max(baseNum1,baseNum2));
	
	return (num1*baseNum + num2*baseNum)/baseNum;
	
}

//start代理服务费
function showAgentInfo(pType){

	//参数：3：附件类型 4 上传完成显示的附件列表table
	if(agentPurchaseType == 0){
		filesDataView('XB_AUCTION_AGENTFILE', 'file_table');
	} else if(agentPurchaseType == 1){
		filesDataView('JJ_AUCTION_AGENTFILE', 'file_table');
	} else if(agentPurchaseType == 2){
		filesDataView('JM_AUCTION_AGENTFILE', 'file_table')
	} else if(agentPurchaseType == 6){
		filesDataView('DY_AUCTION_AGENTFILE', 'file_table');
	}
	

	if(projectServiceFee.collectType == 1){
		$("#collectType").html("标准累进制");
		$("#feeTit1").html("是否优惠");
		if(projectServiceFee.isDiscount == 1){
			$("#feeTxt1").html("不优惠");
			$("#feeTit2").hide();
			$("#feeTxt2").hide();
		} else {
			$("#feeTxt1").html("优惠");
			$("#feeTit2").html("优惠系数");
			$("#feeTxt2").html(projectServiceFee.discountCoefficient);
			$("#feeTit2").show();
			$("#feeTxt2").show;
		}
		
	} else if(projectServiceFee.collectType == 2){
		$("#collectType").html("其他");
		$("#feeTit1").html("收取说明");
		$("#feeTxt1").html(projectServiceFee.collectRemark != undefined ? projectServiceFee.collectRemark : "");
		$("#feeTit2").hide();
		$("#feeTxt2").hide();
	} else if(projectServiceFee.collectType == 0) {
		$("#collectType").html("固定金额");
		$("#feeTit1").html("收费金额");
		$("#feeTxt1").html(projectServiceFee.chargeMoney);
		$("#feeTit2").hide();
		$("#feeTxt2").hide();
	}
	if(typeof quotePriceUnit != "undefined" && quotePriceUnit){
		$("#unit").html((quotePriceUnit.quotePriceName ? quotePriceUnit.quotePriceName + "（" : "") + quotePriceUnit.quotePriceUnit + (quotePriceUnit.quotePriceName ? "）" : ""));
	} else {
		$("#unit").html("元");
	}
	
	$("#dataTypeCode").html(pType == 0 ? "工程" : (pType == 1 ? "设备" : (pType == 2 ? "服务" : (pType == 3 ? "广宣" : "废旧物资"))));
//	if(projectServiceFee.collectType && projectServiceFee.collectType == 1){allGraduated();}
	
	if(type == "view" || type == "VIEW"){
		$("[name='isReturn']").attr("disabled", "disabled");
		$("[name='payer']").attr("disabled", "disabled");
	}
	
}
function filesDataView(modelName, viewTableId) {
	var tr = ""
	var file = "";
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId': projectServiceFee.id,
			'modelName': modelName
		},
		datatype: 'json',
		success: function (data) {
			let flieData = data.data;
			if (data.success == true) {
				agentFileData = flieData;
				if(agentFileData.length > 0 || type=="view" || type=="VIEW"){
					$("#fileBtn").hide();
				} else {
					$("#fileBtn").show();
				}
			}
		}
	});
	if (agentFileData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#' + viewTableId).bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",

		},
		{
			field: "fileSize",
			title: "文件大小",
			align: "center",
			halign: "center",
			width: '100px',

		},
		{
			field: "#",
			title: "操作",
			halign: "center",
			width: '140px',
			align: "center",
			events: {
				'click .openAccessory': function (e, value, row, index) {
					var url = top.config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					window.location.href = $.parserUrlForToken(url);
				}
			},
			formatter: function (value, row, index) {
				var dowl = '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
				return dowl;
			}
		},
		]
	});
	$('#' + viewTableId).bootstrapTable("load", agentFileData);
	$(".fixed-table-loading").hide();
};
/******************start代理服务费通知书***********************/
var projectServiceFee; //是否有代理服务费
var agentPurchaseType; //采购类型
var agentFeePage = "bidPrice/agentServiceFee/agentFeeEdit.html";
function initAgentFee(param){
	agentPurchaseType = param.purchaseType;
	if(projectServiceFee){
		var agentFlag = false;
		$(".isBid").each(function(){
			if($(this).val() == 0){
				agentFlag = true;
				return;
			}
		});
		if(agentFlag){
			$("#btn_submit").text("下一步");
			$("#btn_submit").attr("data-type", "0");
			$(".employee").hide();
		} else {
			$("#btn_submit").text("提交审核");
			$("#btn_submit").attr("data-type", "1");
			$("#btn_submit").is(":visible") ? $(".employee").show() : "";
		}
	} else {
		$("#btn_submit").text("提交审核");
		$("#btn_submit").attr("data-type", "1");
	}
	if(agentPurchaseType == 0 && examType == 0){
		return;
	}
	if(param.type){
		type = param.type;
	}
	if(projectServiceFee && (type == "view" || type=="VIEW")){
		agentInfo(param.projectId, param.packageId, param.id);
	}
}

//打开代理服务费窗口
function openAgentFee(param){
	top.layer.open({
		type: 2,
		title: "采购代理服务费",
		area: ['1000px', '600px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		id:"agentFee",
		content: agentFeePage,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.postMsg(param);
		}
	});
}

/******************end代理服务费通知书***********************/
function getFeeConfirmVersion(id){
	var version = 1
	$.ajax({
		url: feeConfirmVersionUrl,
		dataType: 'json',
		data: {
			'packageId': id
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			if(data.data){
				version = data.data
			}
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
	return version
}