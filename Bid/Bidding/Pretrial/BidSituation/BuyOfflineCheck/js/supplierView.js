/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/SupplierSignController/financialSave.do';  //保存接口
var bidSectionUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var supplierInfoUrl = config.tenderHost + '/SupplierSignController/getSupplierSignInfo.do'; // 获取供应商信息
var detailUrl = config.tenderHost + '/SupplierSignController/selectById.do'; // 获取供应商信息

var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面
 
var employeeInfo = entryInfo(); //企业信息
var bidSectionId = ""; //标段id
var supplierId = ""; //投标人id
var buyId = "";  //购标人信息id
var bidUploads = null; //附件
var source; //1是查看  2是审核
var callback;
$(function(){
	
	// 获取连接传递的参数
 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined"){
		bidSectionId =$.getUrlParam("bidSectionId");
		getBidSectionDetail();
	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		buyId =$.getUrlParam("id");
		getBuyDetail();
	}
   	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
		source =$.getUrlParam("source");
		if(source == 1){
			$("#btnPass").hide();
			$("#btnNoPass").hide();
			$("#btnClose").show();
			$(".checkBlock").hide();
		} else {
			$("#btnPass").show();
			$("#btnNoPass").show();
			$("#btnClose").hide();
			$(".checkBlock").show();
		}
	}
		
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//通过
	$("#btnPass").click(function(){
		saveForm(2);
	});
	//不通过
	$("#btnNoPass").click(function(){
		if($.trim($("#reason").val()) == ""){
			parent.layer.alert("请输入审核不通过原因",function(index){
				parent.layer.close(index);
				$("#reason").closest('.panel-collapse').collapse('show');
				$("#reason").closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
				$("#reason").focus();
			});
			return;
		}
		saveForm(3);
	});


});

//其他页面调用的方法
function passMessage(data){
	callback = data;
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
         		var totalMoney = 0;
         		for(var i = 0; i < arr.projectCosts.length; i++){
         			var money = 0;
         			if(arr.projectCosts[i].costName == "招标文件费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney);
         				}
         				$("#fileCost").html(money);
         			}
         			if(arr.projectCosts[i].costName == "图纸文件押金费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney);
         				}
         				$("#drawCost").html(money);
         			}
         			totalMoney += money;
         		}
         	}
         	$("[name='totalMoney']").val(totalMoney);
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
         data: {id:buyId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	for(var key in arr){
         		if(key == "hasPostage"){
         			$("[name='"+key+"'][value='"+arr[key]+"']").attr("checked", "checked");
         		} else {
         			$("#"+key).html(arr[key]);
         		}
         	}
         	//上传文件
			if(!bidUploads){
				bidUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+buyId+"/218",
					businessId: buyId,
					status:2,
					businessTableName:'T_SUPPLIER_SIGN',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'TSUPPLIER_SIGN_FILE',
					browseFileId:'btnFile',
					isPreview: true    //false不可预览   true可预览
				});
			}
			if(arr.projectAttachmentFiles && arr.projectAttachmentFiles.length > 0){
				bidUploads.fileHtml(arr.projectAttachmentFiles);
			}
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
};

function saveForm(state){
	var data = {}
	if(buyId != ""){
		data.id = buyId;
	}
	data.states = state;
	data.reason = $("#reason").val();
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
			callback();
			parent.layer.alert("审核成功");
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
		}
	});
}
