/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/SupplierSignController/insertSupplierSign.do';  //保存接口
var bidSectionUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var supplierInfoUrl = config.tenderHost + '/SupplierSignController/getSupplierSignInfo.do'; // 获取供应商信息
var detailUrl = config.tenderHost + '/SupplierSignController/selectBySignUpId.do'; // 获取购标人信息

 
var employeeInfo = entryInfo(); //企业信息
var bidSectionId = ""; //标段id
var examType = ""; //标段阶段
var keyId = "";  //购标人信息id
var bidUploads = null; //附件
$(function(){
	getSupplierDetail();
	// 获取连接传递的参数
 	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		bidSectionId =$.getUrlParam("id");
		getBidSectionDetail();
		getBuyDetail();
	}
		
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	$("#btnBuy").click(function(){
		openEdit();
	})
	
	
	
});
function passMessage(data,callback){
	//保存按钮
	$("#btnSave").click(function() { 
		saveForm(true,callback);
	});
	//提交审核
	$("#btnSubmit").click(function() {
		if(!checkForm($("#formName"))){
			return;
		}
		saveForm(false,callback);
	});
}


/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 * isAlert  true是不弹框  false是弹框
 * callback 回调方法
 */
function saveForm(isSave, callback){
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	data.bidSectionId = bidSectionId;
	data.examType = examType;
	var enterpriseName = data.supplierName;
	if(!enterpriseName){
		top.layer.alert("企业名称获取不到，请重新登录",{icon:7,title:'提示'});
		return;
	}
	if(keyId != ""){
		data.id = keyId;
	}
	
	
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data:data,
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			
			keyId = data.data;
			if(callback){
				callback()
			}
//			parent.checkService();
			
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
			
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
         		$("#fileCost").html(0);
         		$("#drawCost").html(0);
         		$("#ysCost").html(0);
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
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
//详情
 function getBuyDetail() {	
     $.ajax({
         url: detailUrl,
         type: "post",
         data: {bidSectionId:bidSectionId, examType: examType},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(!data.data){
         		return;
         	}
         	
         	var arr = data.data;
         	keyId = arr.id;
         	for(var key in arr){
         		if(key == "hasPostage"){
         			$("[name='"+key+"'][value='"+arr[key]+"']").attr("checked", "checked");
         		} else {
         			$("[name='"+key+"']").val(arr[key]);
         		}
         	}
         	$("#supplierName").val(arr.supplierName ? arr.supplierName : "");
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
};
