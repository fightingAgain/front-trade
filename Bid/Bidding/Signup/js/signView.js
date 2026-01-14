/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/SupplierSignController/ConReSupplier.do';  //保存接口
var bidSectionUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var supplierInfoUrl = config.tenderHost + '/SupplierSignController/getSupplierSignInfo.do'; // 获取供应商信息
var detailUrl = config.tenderHost + '/SupplierSignController/selectBySignUpId.do'; // 获取购标人信息
var supDetailUrl = config.tenderHost + '/SupplierSignController/selectById.do'; // 获取购标人信息

 
var employeeInfo = entryInfo(); //企业信息
var bidSectionId = ""; //标段id
var examType = ""; //标段阶段
var bidUploads = null; //附件
var keyId; //数据id  当此id存在时，是审核，否则是查看
var prevCallback;
var source = 0; //链接来源  0:查看  1审核
$(function(){
	getSupplierDetail();
	// 获取连接传递的参数
 	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
 	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
 		source = $.getUrlParam("source");
 		if(source == 1){
 			$(".checkReason").show();
 			$("#btnPass").show();
 			$("#btnNoPass").show();
 		}
 	}
 	if($.getUrlParam("keyId") && $.getUrlParam("keyId") != "undefined"){
 		keyId = $.getUrlParam("keyId");
 		
 	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		bidSectionId =$.getUrlParam("id");
		getBidSectionDetail();
	}
 	getBuyDetail();
		
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	$("#btnPass").click(function(){
		parent.layer.confirm('确定审核通过?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			saveForm(2);
		});
	});
	$("#btnNoPass").click(function(){
		if($.trim($("[name='reason']").val()) == ""){
			top.layer.alert("请输入审核原因", function(idx){
				top.layer.close(idx);
				
				$("[name='reason']").closest('.panel-collapse').collapse('show');
				$("[name='reason']").closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
				$("[name='reason']").focus();
			});
			return;
		}
		parent.layer.confirm('确定审核不通过?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			saveForm(3);
		});
	});
	
});

//上级页面调用方法
function passMessage(callback){
	prevCallback = callback;
}



/**
 * 保存或提交接口
 * state  2是确认  3是驳回
 */
function saveForm(state){
	$('#btnPass,#btnNoPass').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data:{id:keyId, states:state, reason:$.trim($("[name='reason']").val())},
		success: function(data) {
			$('#btnPass,#btnNoPass').attr('disabled', false);
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			parent.layer.alert(state == 2 ? "审核通过" : "审核不通过");
			if(prevCallback){
				prevCallback();
			}
			
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
			
		},
		error: function() {
			$('#btnPass,#btnNoPass').attr('disabled', false);
			parent.layer.alert("审核失败！");
		}
	});
}

//标段详情
 function getBidSectionDetail() {	
     $.ajax({
         url: bidSectionUrl,
         type: "post",
         data: {id:bidSectionId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	$("#interiorBidSectionCode").html(arr.interiorBidSectionCode);
         	$("#bidSectionName").html(arr.bidSectionName);
         	if(arr.projectCosts && arr.projectCosts.length > 0){
         		$("#fileCost").html("0.00");
         		$("#drawCost").html("0.00");
         		$("#ysCost").html("0.00");
         		var totalMoney = 0;
         		for(var i = 0; i < arr.projectCosts.length; i++){
         			var money = 0;
         			if(arr.projectCosts[i].costName == "招标文件费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney ? arr.projectCosts[i].payMoney : 0);
         				}
         				$("#fileCost").html(money == 0 ? "0.00" : money);
         			}
         			if(arr.projectCosts[i].costName == "图纸文件押金费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney ? arr.projectCosts[i].payMoney : 0);
         				}
         				$("#drawCost").html(money == 0 ? "0.00" : money);
         			}
         			if(arr.projectCosts[i].costName == "资格预审文件费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney ? arr.projectCosts[i].payMoney : 0);
         				}
         				$("#ysCost").html(money == 0 ? "0.00" : money);
         			}
         			totalMoney += money;
         		}
         	}
         	$("#totalMoney").html(totalMoney);
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
//供应商详情
 function getSupplierDetail() {	
     $.ajax({
         url: supplierInfoUrl,
         type: "post",
         data: {id:employeeInfo.enterpriseId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(data.data){
	         	var arr = data.data;
	         	$("[name='supplierName']").val(arr.legalName ? arr.legalName : "");
	         	$("[name='invoice']").val(arr.legalName ? arr.legalName : "");
	         	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	         	$("#createTime").html(arr.createTime ? arr.createTime : nowDate);
	         	$("[name='bank']").val(arr.basicBank ? arr.basicBank : "");
	         	$("[name='bankAccount']").val(arr.basicAccountNo ? arr.basicAccountNo : "");
	         	$("[name='address']").val(arr.taxAddress ? arr.taxAddress : "");
	         	$("[name='linkMen']").val(arr.legalContact ? arr.legalContact : "");
	         	$("[name='linkTel']").val(arr.taxTel ? arr.taxTel : "");
	         	$("[name='linkPhone']").val(arr.legalContactPhone ? arr.legalContactPhone : "");
	         	$("[name='linkFax']").val(arr.enterpriseFox ? arr.enterpriseFox : "");
	         	$("[name='linkEmail']").val(arr.legalEmail ? arr.legalEmail : "");
	        }
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
//根据标段id获取详情
 function getBuyDetail() {
 	var url = "", param = {};
 	if(keyId){
 		url = supDetailUrl;
 		param = {id:keyId, examType: examType}
 	} else {
 		url = detailUrl;
 		param = {bidSectionId:bidSectionId, examType: examType};
 	}
     $.ajax({
         url: url,
         type: "post",
         data: param,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(!data.data){
         		return;
         	}
         	var arr = data.data;
         	for(var key in arr){
         		if(key == "states"){
         			var stateTxt = "";
         			if(arr[key] == 1){
         				stateTxt = "审核中";
         			} else if(arr[key] == 2){
         				stateTxt = "审核通过";
         			} else if(arr[key] == 3){
         				stateTxt = "审核不通过";
         			}
         			$("#states").html(stateTxt);
         		} else {
         			$("#"+key).html(arr[key]);
         		}
         	}
         	$("#supplierName").html(arr.supplierName ? arr.supplierName : "");
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
};
