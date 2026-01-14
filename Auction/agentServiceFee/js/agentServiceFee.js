var saveUrl = top.config.AuctionHost + "/ProjectBidResultController/insertNewProjectBidResult.do"; //提交
var detailUrl = top.config.AuctionHost + '/BidNoticeController/setServiceFee.do'; //获取详情
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do";
//文件
var deleteFileUrl = top.config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息
var saveImgUrl = top.config.AuctionHost + '/PurFileController/save.do'; //删除已上传文件信息
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
var agentFileData = [];

//start代理服务费
var projectServiceFee={};
var findAllGraduatedUrl = top.config.HghHost + "/GraduatedController/findAllGraduated.do"; //计算规则
var saveFileUrl = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var calcUrl = top.config.HghHost + "/GraduatedController/calculateMoney.do"; //批量上传文件到服务器
var calRule;
var basicBidResult;
//end代理服务费

var urlSendMsg = top.config.AuctionHost + "/InFormController/inFormUser";  //是否提交满意度，发送短信
var feeConfirmVersionUrl = top.config.AuctionHost + "/BidResultHisController/getPackageVersion.do";//获取费用版本
var thisFrame = parent.window.document.getElementById("agentFee").getElementsByTagName('iframe');

var prevData;
var projectType;
var RenameData = {};
$(function(){
	$("#agentTable").off("click", ".btnModify").on("click", ".btnModify", function() {
		var idx = $(this).closest("tr").attr("data-index");
		if($(this).closest("tr").find(".sltRule").val() == ""){
			top.layer.alert("温馨提示：请先选择计算规则");
			return;
		}
		top.layer.prompt({
			title: '请输入应缴服务费',
			formType: 0,
		}, function(pass, index) {
			var regu = /^(([1-9][0-9]{0,13})|(0))(\.[0-9]{1,2})?$/;
			var deci = 2;//小数位数
			var inte = 13;// 整数位数
			if(prevData.unit){
				if(prevData.unit.quotePriceType == 1){
					if(prevData.unit.quotePriceUnit == "元"){
						regu = /^(([1-9][0-9]{0,13})|(0))(\.[0-9]{1,2})?$/;
						deci = 2;
						inte = 13;
					} else if(prevData.unit.quotePriceUnit == "千元"){
						regu = /^(([1-9][0-9]{0,10})|(0))(\.[0-9]{1,5})?$/;
						deci = 5;
						inte = 10;
					} else if(prevData.unit.quotePriceUnit == "万元"){
						regu = /^(([1-9][0-9]{0,9})|(0))(\.[0-9]{1,6})?$/;
						deci = 6;
						inte = 9;
					}
				}
			};
			if(pass != "") {
				if(!regu.test(pass)){
					if(pass.substr(pass.length-1,1) == '.' || pass.substr(0,1) == '-'){
						parent.layer.alert("温馨提示：请正确输入应缴服务费");
						return
					}
					if(pass.split('.').length > 1 ){
						if(pass.split('.')[1].length > deci){
							parent.layer.alert("温馨提示：应缴服务费的小数位数最多"+deci+"位，您输入的金额已超出范围！");
							return
						}
						
					}
					if(pass.split('.')[0].length > inte){
						parent.layer.alert("温馨提示：应缴服务费单位最高支持为“兆”，您输入的金额已超出范围！");
						return
					}
					parent.layer.alert("温馨提示：请正确输入应缴服务费");
					return
				}
				
			};
			
			
			//0元，1千元，2万元
			/* var paramUnit = 0;
			var tips = "";
			var reg;
			if(prevData.unit){
				if(prevData.unit.quotePriceType == 1){
					if(prevData.unit.quotePriceUnit == "元"){
						paramUnit = 0;
					} else if(prevData.unit.quotePriceUnit == "千元"){
						paramUnit = 1;
					} else if(prevData.unit.quotePriceUnit == "万元"){
						paramUnit = 2;
					}
				}
			}
			if(paramUnit == 0){
				reg = /^(([1-9]\d{0,11})(\.\d{1,2})?)$|^(0\.((0[1-9])|([1-9]\d?)))|0$/;
				tips="最多保留两位小数";
			} else if(paramUnit == 1){
				reg = new RegExp("^(0|[1-9]\\d*)(\\s|$|\\.\\d{1,5}\\b)");
				tips="最多保留五位小数";
			} else if(paramUnit == 2){
				reg = new RegExp("^(0|[1-9]\\d*)(\\s|$|\\.\\d{1,6}\\b)");
				tips="最多保留六位小数";
			}
			if(!reg.test(pass)){
				top.layer.alert("温馨提示：请正确输入应缴服务费，并且" + tips);
				return;
			} */
			top.layer.close(index);
			top.layer.prompt({
				title: '请输入调整原因',
				formType: 2
			}, function(text, index) {
				top.layer.close(index);
				BidResultItem[idx].receiptsMoney = pass;
	//			BidResultItem[idx].adjustRemark = text;
				if(projectServiceFee.collectType == 1){
					BidResultItem[idx].adjustRemark = (Number(BidResultItem[idx].receiptsMoney) != Number(BidResultItem[idx].discountMoney)?text:"");
				} else if(projectServiceFee.collectType == 0){
					BidResultItem[idx].adjustRemark = (Number(BidResultItem[idx].receiptsMoney) != Number(BidResultItem[idx].serviceFee)?text:"");
				} else {
					BidResultItem[idx].serviceFee = pass;
					BidResultItem[idx].adjustRemark = text;
				}
				agentIsShow(idx);
			});
		});
	});
	$("#agentTable").off("change", ".sltRule").on("change", ".sltRule", function() {
		var index = $(this).closest("tr").attr("data-index");
		var val = $(this).val();
		if(val == ""){return;}
		agentIsShow(index, val);
	});
	$("#btnClose").click(function(){
		var iframIndex = parent.layer.getFrameIndex(window.name);
		top.layer.close(iframIndex);
	});
	//保存
	$("#btnSubmit").click(function(){
		if(!top.checkForm($("#agentForm"))){
			return;
		}
		var bidResult = {};
		
		for(var i = 0; i < BidResultItem.length; i++){
			BidResultItem[i].totalTransaction = BidResultItem[i].bidPrice;
			BidResultItem[i].payer = $("[name='payer']:checked").val();
			BidResultItem[i].isReturn = ($("[name='isReturn']:checked").length>0 ? 0 : 1);
		}
		bidResult.inventoryFee = BidResultItem;
		if(agentFileData.length > 0){
			bidResult.projectServiceFee = {
				id:projectServiceFee.id,
				fileName : agentFileData[0].fileName,
				filePath : agentFileData[0].filePath
			}
		}
		bidResult.opraType = 1;
		bidResult.checkerId = prevData.checkerId;
		bidResult.packageId = prevData.packageId;
		bidResult.projectId = prevData.projectId;
		bidResult.examType = prevData.examType;
		bidResult.pushPlatform = prevData.pushPlatform;
		bidResult.title = prevData.title;
		bidResult.days = prevData.days;
		bidResult.content = prevData.content;
		
		bidResult.optionId = prevData.optionId;
		bidResult.optionValue = prevData.optionValue;
		bidResult.optionName = prevData.optionName;

		bidResult.isOpen = prevData.isOpen;
		if(isWorkflow) { //是否存在审核人
			if($("#employeeId").val() == "") {
				layer.alert("温馨提示：请选择审核人");
				return;
			}
			bidResult.checkerId = $("#employeeId").val();
		} else {
			bidResult.checkerId = 0;
		}
		if(isWorkflow == 0){
			parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			  btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero){
				saveForm(bidResult);
			}, function(index){
			   parent.layer.close(index);
			});
		} else {
			saveForm(bidResult);
		}
		
	});
});
function postMsg(param){
	//type:“编辑，查看”,packageId: ”标段id“,projectId: “项目id”,agentPurchaseType:“采购类型”,auctionModel:“包件还是明细”,
	prevData = param;
	if(prevData.unit){
		$("#unit").html((prevData.unit.quotePriceName ? prevData.unit.quotePriceName + "（" : "") + prevData.unit.quotePriceUnit + (prevData.unit.quotePriceName ? "）" : ""));
	} else {
		$("#unit").html("元");
	}
	type = (prevData.type == "RELEASE" || prevData.type == "CHANGE" || prevData.type == "modify" || prevData.type == "update" ? "RELEASE" : "");
	RenameData = getBidderRenameData(prevData.packageId);//供应商更名信息
	var version = getFeeConfirmVersion(prevData.packageId);
	if(version == 2){
		$('.feeConfirmVersion').hide();
	}
	getDetail();
	WorkflowUrl();
}
//加载审核人
function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "jgtzs"
		},
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) { // 没有设置审核人
				isCheck=true;
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("温馨提示：找不到该级别的审批人,请先添加审批人");
				$("#btnSubmit").hide();
				$('.employee').hide();
				return;
			};
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if(data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for(var i = 0; i < data.data.length; i++) {
						option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
					}
				}
			}
			$("#employeeId").html(option);
		}
	});
}
//详情
function getDetail(){
	
	$.ajax({
		url: detailUrl,
		dataType: 'json',
		data: {
			projectId: prevData.projectId,
			packageId: prevData.packageId,
			auctionModel:prevData.auctionModel,
			id: prevData.id
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert("温馨提示：" + data.message);
				return;
			}
			BidResultItem = data.data.bidResultItems;
			bidDetails = data.data.bidDetails ? data.data.bidDetails : [];
			projectServiceFee = data.data.projectServiceFee;
			projectType = data.data.projectType;
			showAgentInfo();
			agentIsShow();
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
}
//提交接口
function saveForm(param){
	if(prevData.agentPurchaseType!=2){
		var params ={
			'relationId':prevData.packageId,
			'projectId':prevData.projectId,
		}
	}else{
		var params ={
			'relationId':prevData.projectId,
			'projectId':prevData.projectId,
		}
	}
	params.messageType = 1;
	var notText = '';
	$.ajax({
		url: urlSendMsg,
		data: params,
		type: 'post',
		async:false,
		success: function(res) {
			if(res.success) {
				notText = res.data;
			}
		}
	});
	$.ajax({
		url: saveUrl,
		dataType: 'json',
		type: "post",
		data: param,
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert("温馨提示：" + data.message);
				return;
			}
			top.layer.alert("温馨提示：提交成功！" + notText,{closeBtn:0}, function(idx){
				prevData.callback();
				top.layer.closeAll();
			});
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
}

//start代理服务费
function showAgentInfo(){
	if(prevData.auctionModel && prevData.auctionModel == 1){
		for(var i = 0; i < bidDetails.length; i++){
			var html = '<tr><th style="width: 50px;">序号</th><th>名称</th><th>数量</th><th>供应商名称</th><th>通知类型</th><th>成交金额</th></tr>';
			for(var i = 0; i < bidDetails.length; i++){
				html += '<tr><td>'+(i+1)+'</td>';
				html += '<td>'+bidDetails[i].detailedName+'</td><td>'+bidDetails[i].detailedCount+'</td>';
				html+='<td>'+ showBidderRenameList(bidDetails[i].supplierId, bidDetails[i].enterpriseName, RenameData, 'body')+'</td>'
						+'<td>'+(bidDetails[i].isBid == 0 ? "中选" : "未中选")+'</td>'
						+'<td>'+bidDetails[i].bidPrice+'</td>'
					+'</tr>';
			}
			$(html).appendTo("#isBidTable");
		}
	} else {
	
		if(BidResultItem.length > 0){
			var html = '<tr><th style="width: 50px;">序号</th><th>供应商名称</th><th>通知类型</th><th>成交金额</th></tr>';
			for(var i = 0; i < BidResultItem.length; i++){
				html += '<tr><td>'+(i+1)+'</td>';
				html+='<td>'+ showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body')+'</td>'
						+'<td>'+(BidResultItem[i].isBid == 0 ? "中选" : "未中选")+'</td>'
						+'<td>'+(BidResultItem[i].bidPrice ? BidResultItem[i].bidPrice : "")+'</td>'
					+'</tr>';
			}
			$(html).appendTo("#isBidTable");
		}
	}

	//参数：1.file的id，2.附件保存的url,3：附件类型 4 上传完成显示的附件列表table
	var oFileInput = new FileInput();
	if(prevData.agentPurchaseType == 0){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'XB_AUCTION_AGENTFILE', 'file_table', false);
	} else if(prevData.agentPurchaseType == 1){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'JJ_AUCTION_AGENTFILE', 'file_table', false);
	} else if(prevData.agentPurchaseType == 2){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'JM_AUCTION_AGENTFILE', 'file_table', false);
	} else if(prevData.agentPurchaseType == 6){
		oFileInput.Init("agentFeeFile", saveFileUrl, 'DY_AUCTION_AGENTFILE', 'file_table', false);
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
	
	if(prevData.auctionModel == 1){
		$(".tips").html("成交总额：明细1 * 数量 + 明细2 * 数量 + ···");
	}
	
	$("#dataTypeCode").html(projectType == 0 ? "工程" : (projectType == 1 ? "设备" : (projectType == 2 ? "服务" : (projectType == 3 ? "广宣" : "废旧物资"))));
	if(projectServiceFee.collectType && projectServiceFee.collectType == 1){allGraduated();}
	
	if(type != "RELEASE"){
		$("[name='isReturn']").attr("disabled", "disabled");
		$("[name='payer']").attr("disabled", "disabled");
	}
	BidResultItem.length>0&&BidResultItem[0].isReturn==0 ? $("[name='isReturn']").prop("checked", "checked") : "";
	BidResultItem.length>0&&BidResultItem[0].payer ? $("[name='payer']").val([BidResultItem[0].payer]) : "";
}
//计算规则
function allGraduated(){
	$.ajax({
         url: findAllGraduatedUrl,
         type: "post",
         async:false,
         data: {purchaseType:prevData.agentPurchaseType, projectType:projectType},
         success: function (data) {
         	if(!data.success){
        		parent.layer.alert("温馨提示：" + data.message);
        		return;
        	}
            calRule = {};
            for(var i = 0; i < data.data.length; i++){
            	calRule[data.data[i].id] = data.data[i];
            }
         },
         error: function (data) {
             parent.layer.alert("温馨提示：请求失败");
         }
	});
}
//服务费信息
function calculateMoney(index, graduatedId){
	var agentItem = BidResultItem[index];
	agentItem.bidPrice = agentItem.bidPrice;
	if(projectServiceFee.collectType == 0){
		agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:(isNum(projectServiceFee.chargeMoney) ? projectServiceFee.chargeMoney : ""));
		agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:agentItem.serviceFee);
		agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:"");
	} else if(projectServiceFee.collectType == 2){
		agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:"");
		agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:"");
		agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:projectServiceFee.collectRemark);
	} else if(projectServiceFee.collectType == 1){ //标准累计制
		if(!graduatedId){
			agentItem.serviceFee = (isNum(agentItem.serviceFee) ?agentItem.serviceFee:"");
			agentItem.discountMoney = (isNum(agentItem.discountMoney) ?agentItem.discountMoney:"");
			agentItem.receiptsMoney = (isNum(agentItem.receiptsMoney) ?agentItem.receiptsMoney:"");
			agentItem.adjustRemark = (agentItem.adjustRemark ?agentItem.adjustRemark:"");
			agentItem.graduatedId = (agentItem.graduatedId ?agentItem.graduatedId:"");
			agentItem.graduatedName = (agentItem.graduatedName ?agentItem.graduatedName:"");
			agentItem.calculateProcess = (agentItem.calculateProcess ?agentItem.calculateProcess:"");
		} else {
			//0元，1千元，2万元
			var paramUnit = 0;
			if(prevData.unit){
				if(prevData.unit.quotePriceType == 1){
					if(prevData.unit.quotePriceUnit == "元"){
						paramUnit = 0;
					} else if(prevData.unit.quotePriceUnit == "千元"){
						paramUnit = 1;
					} else if(prevData.unit.quotePriceUnit == "万元"){
						paramUnit = 2;
					}
				}
			}
			param = {
				id:graduatedId,
		     	unit:calRule[graduatedId].unit,
		     	discountCoefficient:projectServiceFee.discountCoefficient,
		     	transactionAmount:agentItem.bidPrice,
		     	transactionAmountUnit:paramUnit
			}
			$.ajax({
		         url: calcUrl,
		         type: "post",
		         async:false,
		         data: param,
		         success: function (data) {
		         	if(!data.success){
		        		parent.layer.alert("温馨提示：" + data.message);
		        		return;
		        	}
		         	if(!data.data){
		         		return;
		         	}
		         	agentItem.calculateProcess = data.data.calculateProcess ? data.data.calculateProcess : "";
		         	agentItem.serviceFee = isNum(data.data.serviceFee) ? data.data.serviceFee : "";
		         	agentItem.discountMoney = isNum(data.data.discountMoney) ? data.data.discountMoney : "";
		         	agentItem.receiptsMoney = isNum(data.data.discountMoney) ? data.data.discountMoney : "";
		         	agentItem.adjustRemark = "";
		         	agentItem.graduatedId = graduatedId;
		         	agentItem.graduatedName = calRule[graduatedId].graduatedName;
		         },
		         error: function (data) {
		             parent.layer.alert("温馨提示：请求失败");
		         }
			});
		}
	}
	
}



//是否数字
function isNum(val){
	if (parseFloat(val).toString() == "NaN") {
　　　　	return false;
　　	} else {
　　　　	return true;
　　	}
}

function agentIsShow(index, ruleId) {
	if(!projectServiceFee){
		return;
	}
	
	if(index != undefined){
		calculateMoney(index, ruleId);
	}
	
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
	
	
	for(var i = 0; i < BidResultItem.length; i++) {
		var agentItem = BidResultItem[i];
		if(agentItem.isBid != 0) {
			continue;
		}
		if(index == undefined){
			calculateMoney(i);
		}
		
		flag = true;
		agentItem.serviceFee==="" ? "" : serviceTotal =numAdd(Number(serviceTotal), Number(agentItem.serviceFee));
		agentItem.discountMoney==="" ? "" : discountTotal =numAdd(Number(discountTotal), Number(agentItem.discountMoney));
		agentItem.receiptsMoney==="" ? "" : receiptsTotal = numAdd(Number(receiptsTotal), Number(agentItem.receiptsMoney));
		enterName = agentItem.enterpriseName;
		agentItem.calculateProcess=="" ? "" : calculateProcess += "根据"+enterName+"的中标/成交金额计算的服务费：" + agentItem.calculateProcess + "<br/>";
		
		html += '<tr data-index="'+i+'">' 
			+'<td>' + showBidderRenameList(agentItem.supplierId, agentItem.enterpriseName, RenameData, 'body') + '</td>' 
			+'<td style="text-align:right;">' + (agentItem.bidPrice ? agentItem.bidPrice : "") + '</td>' 
			
		if(projectServiceFee.collectType == 1){ //标准累计制
			if(type=="RELEASE"){ //编辑
				html+='<td><select class="form-control sltRule" datatype="*" errormsg="请选择第'+(i+1)+'行计算规则"><option value="">请选择计算规则</option>';
				if(calRule){
					for(var key in calRule){
						if(agentItem.graduatedId && agentItem.graduatedId == key){
							html += '<option value="'+key+'" selected="selected">'+calRule[key].graduatedName+'</option>';
						} else {
							html += '<option value="'+key+'">'+calRule[key].graduatedName+'</option>';
						}
						
					}
				}
				html+='</select></td>' 
			} else {
				html += '<td>'+agentItem.graduatedName+'</td>';
			}
		}
		html+='<td style="text-align:right;">'+agentItem.serviceFee+'</td>';
		if(projectServiceFee.collectType == 1){
			html+='<td style="text-align:right;">'+agentItem.discountMoney+'</td>';
		}
		var strColor="";
		if(projectServiceFee.collectType == 1){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.discountMoney)?"color:red":"");
		} else if(projectServiceFee.collectType == 0){
			strColor = (Number(agentItem.receiptsMoney) != Number(agentItem.serviceFee)?"color:red":"");
		} else {
			strColor = "color:red";
		}
		
		html+='<td style="text-align:right;"><span style="'+strColor+'">' + agentItem.receiptsMoney+'</span>';
		if(type == "RELEASE"){
			html+='<a href="javascript:;" data-index="' + i + '" class="btn-primary btn-xs btnModify" style="margin-left:5px;text-decoration: none;">···</a>'
		}
		html+='</td>'
			+'<td style="width:240px;"><div style="width:200px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="'+ (agentItem.adjustRemark ? agentItem.adjustRemark : "") +'">'+(agentItem.adjustRemark ? agentItem.adjustRemark : "")+'</div></td>'
			+'</tr>';
		
	}
	if(flag){
		
		if(projectServiceFee.collectType ==1){
			html += '<tr><td colspan="3" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+serviceTotal+'</td><td style="text-align:right;border: none;">'+discountTotal+'</td><td style="text-align:right;border: none;'+(type=="RELEASE"?"padding-right:36px;" : "")+'">'+receiptsTotal+'</td><td style="border: none;"></td></tr>'
		} else {
			html += '<tr><td colspan="2" style="border: none;">合计：</td><td style="text-align:right;border: none;">'+serviceTotal+'</td><td style="text-align:right;border: none;'+(type=="RELEASE"?"padding-right:36px;" : "")+'">'+receiptsTotal+'</td><td style="border: none;"></td></tr>'
		}
	//	$("#agentFeeTotal").html(agentFeeTotal);
		$("#calculateProcess").html(projectServiceFee.collectType ==1 ? calculateProcess : "");
		$(html).appendTo("#agentTable");
		if(flag) {
			$(".agentBlock").css("display", "table-row");
		} else {
			$(".agentBlock").css("display", "none");
		}
	}
}

//精度问题
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
//减
function numSub(num1, num2){
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
	
	return (num1*baseNum - num2*baseNum)/baseNum;
}
//乘
function numMulti(num1, num2){
	var baseNum = 0;
	try {
		baseNum += num1.toString().split(".")[1].length;
	} catch (e) { }
	try {
		baseNum += num2.toString().split(".")[1].length;
	} catch (e) { }
	
	return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", ""))/Math.pow(10, baseNum)
}
//除
function numDiv(num1, num2) {
	var baseNum1 = 0,
		baseNum2 = 0;
	var baseNum3, baseNum4;
	try {
		baseNum1 = num1.toString().split(".")[1].length;
	} catch (e) {
		baseNum1 = 0;
	}
	try {
		baseNum2 = num2.toString().split(".")[1].length;
	} catch (e) {
		baseNum2 = 0;
	}
	baseNum3 = Number(num1.toString().replace(".", ""));
	baseNum4 = Number(num2.toString().replace(".", ""));
	return (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1);
}

//上传附件
var FileInput = function () {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function (FileName, uploadUrl, filetype, filetable, flag) {
		filesDataView(filetype, filetable);
		$("#" + FileName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx', 'xls'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮
			showCaption: false, //是否显示标题
			//showCaption: false, //是否显示标题
			browseClass: "btn btn-primary", //按钮样式
			dropZoneEnabled: false, //是否显示拖拽区域
			maxFileCount: 1,
			//			maxFileCount: flag?1:0, //表示允许同时上传的最大文件个数
			showPreview: false,
			showRemove: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			}

		}).on("filebatchselected", function (event, files) {
			if (event.currentTarget.files.length > 1) {
				parent.layer.alert('温馨提示：单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			if (event.currentTarget.files[0].size > 50 * 1024 * 1024) {
				parent.layer.alert('温馨提示：上传的文件不能大于50M');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
			if(!data.response.success){
				return;
			}
			$.ajax({
				type: "post",
				url: saveImgUrl,
				async: false,
				data: {
					'modelId': projectServiceFee.id,
					'modelName': filetype,
					'fileName': data.files[0].name,
					'fileSize': data.files[0].size / 1000 + "KB",
					'filePath': data.response.data[0]
				},
				datatype: 'json',
				success: function (data) {
					if (data.success == true) {
						filesDataView(filetype, filetable);
					}
				}
			});

		}).on('filebatchuploaderror', function (event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};
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
				if(agentFileData.length > 0 || type!="RELEASE"){
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
				var dels = '<button  class="btn btn-sm btn-danger" onclick=fileDetel(' + index + ',\"' + row.id + '\",\"' + row.modelName + '\",\"' + viewTableId + '\")>删除</button>'
				return dowl + (type=="RELEASE" ? dels : "");
			}
		},
		]
	});
	$('#' + viewTableId).bootstrapTable("load", agentFileData);
	$(".fixed-table-loading").hide();
};

function fileDetel(i, uid, modelName, viewTableId) {

	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		
		$.ajax({
			type: "post",
			url: deleteFileUrl,
			async: false,
			dataType: 'json',
			data: {
				"id": uid,
			},
			success: function (data) { 
				filesDataView(modelName, viewTableId);
			}
		});
		
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
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