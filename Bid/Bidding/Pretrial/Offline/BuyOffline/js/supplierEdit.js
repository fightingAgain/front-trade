/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/SupplierSignController/savePre.do';  //保存接口
var bidSectionUrl = config.tenderHost + '/BidSectionController/get.do'; // 标段详情
var supplierInfoUrl = config.tenderHost + '/SupplierSignController/getSupplierSignInfo.do'; // 获取供应商信息
var detailUrl = config.tenderHost + '/SupplierSignController/selectById.do'; // 获取供应商信息

var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面
 
var employeeInfo = entryInfo(); //企业信息
var bidSectionId = ""; //标段id
var supplierId = ""; //投标人id
var buyId = "";  //购标人信息id
var bidUploads = null; //附件
var refreshTable;
$(function(){
	
	// 获取连接传递的参数
 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined"){
		bidSectionId =$.getUrlParam("bidSectionId");
		getBidSectionDetail();
	}
 	if($.getUrlParam("supplierId") && $.getUrlParam("supplierId") != "undefined"){
		supplierId =$.getUrlParam("supplierId");
	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		buyId =$.getUrlParam("id");
		$("#btnChoose").hide();
		getBuyDetail();
	} else {
		$("#btnChoose").show();
	}
		
	//选择标段
	$("#btnChoose").click(function(){
		openChoose();
	});
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	$("#btnBuy").click(function(){
		openEdit();
	})
	
	//保存按钮
	$("#btnSave").click(function() { 
		
		saveForm(true);
	});
	//提交审核
	$("#btnSubmit").click(function() {
		if(supplierId == ""){
			top.layer.alert("请选择购标单位",function(ind){
				parent.layer.close(ind);
				$('#collapseThree').collapse('show');
			});
			return;
		}
		if(checkForm($("#formName"))){
			saveForm(false);
		}
		
	});
	
	//上传招标文件
	$('#fileUp').click(function(){
		var obj = $(this);
		if(!supplierId){
			parent.layer.alert("请选择购标单位",function(ind){
				parent.layer.close(ind);
				$('#collapseThree').collapse('show');
			});
			return;
		}
		if(!(buyId && buyId!="")){
			saveForm('true', true, function(){
				//上传文件
				if(!bidUploads){
					bidUploads = new StreamUpload("#fileContent",{
						basePath:"/"+employeeInfo.enterpriseId+"/"+buyId+"/218",
						businessId: buyId,
						status:1,
						businessTableName:'T_SUPPLIER_SIGN',  //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode:'TSUPPLIER_SIGN_FILE',
						browseFileId:'btnFile',
						extFilters: ['.jpg','.png','.pdf'],
						isPreview: true    //false不可预览   true可预览
					});
				}
				$('#btnFile').trigger('click');
			});
		}else{
			//上传文件
			if(!bidUploads){
				bidUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+buyId+"/218",
					businessId: buyId,
					status:1,
					businessTableName:'T_SUPPLIER_SIGN',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'TSUPPLIER_SIGN_FILE',
					browseFileId:'btnFile',
					extFilters: ['.jpg','.png','.pdf'],
					isPreview: true    //false不可预览   true可预览
				});
			};
			$('#btnFile').trigger('click');
		}
		
		
		
	});
});

//其他页面调用的方法
function passMessage(callback){
	refreshTable = callback;
}

/*
 * 打开供应商页面
 */
function openChoose(){
	var width = window.$(parent).width() * 0.9;
	var height = window.$(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: '投标人',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: enterprisePage,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({callback:chooseCallback,enterpriseType:"3"});  //调用子窗口方法，传参
		}
	});
}
/**
 * 选择供应商回调方法
 * @param {Object} data  
 */
function chooseCallback(data){
	if(data.length > 0){
		var arr = data[0];
		supplierId = arr.id;
		getSupplierDetail();
	}
}

/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 * isAlert  true是不弹框  false是弹框
 * callback 回调方法
 */
function saveForm(isSave, isAlert, callback){
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	data.bidSectionId = bidSectionId;
	data.supplierId = supplierId;
	
	
	if(!isSave){
		data.isSubmit = 1;
		if($("#fileContent tr").length <= 1){
			top.layer.alert("请上传支付底单", function(index){
				top.layer.close(index);
				$("#fileContent").closest('.panel-collapse').collapse('show');
				$("#fileContent").closest('.collapse').siblings().find(".panel-collapse").collapse("hide");
			});
			return;
		}
	}
	if(buyId != ""){
		data.id = buyId;
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
			
			filePath = "";
			buyId = data.data;
			if(callback && buyId){
				callback();
			}
			refreshTable();
			if(isSave){
				if(!isAlert){
					top.layer.alert("保存成功");
				}
			} else {
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
				top.layer.alert("提交成功");
			}
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
         		var totalMoney = 0;
         		for(var i = 0; i < arr.projectCosts.length; i++){
         			var money = 0;
         			if(arr.projectCosts[i].costName == "资格预审文件费"){
         				if(arr.projectCosts[i].isPay == 1){
         					money = Number(arr.projectCosts[i].payMoney ? arr.projectCosts[i].payMoney : 0);
         				}
         				$("#fileCost").html(money == 0 ? "0.00" : money);
         			}
//       			if(arr.projectCosts[i].costName == "图纸文件押金费"){
//       				if(arr.projectCosts[i].isPay == 1){
//       					money = Number(arr.projectCosts[i].payMoney ? arr.projectCosts[i].payMoney : 0);
//       				}
//       				$("#drawCost").html(money == 0 ? "0.00" : money);
//       			}
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
//供应商详情
 function getSupplierDetail() {	
     $.ajax({
         url: supplierInfoUrl,
         type: "post",
         data: {id:supplierId},
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
         			$("[name='"+key+"']").val(arr[key]);
         		}
         	}
         	$("#supplierName").val(arr.supplierName ? arr.supplierName : "");
         	$("#createTime").html(arr.createTime ? arr.createTime : "");
         	//上传文件
			if(!bidUploads){
				bidUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+buyId+"/218",
					businessId: buyId,
					status:1,
					businessTableName:'T_SUPPLIER_SIGN',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'TSUPPLIER_SIGN_FILE',
					browseFileId:'btnFile',
					extFilters: ['.jpg','.png','.pdf'],
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
