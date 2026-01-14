//var packageId = $.query.get("id");
var returnData;
//var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getMXAllSupplieres.do" //供应商
var passMsg;
var listArr;
var types
var parentCallFn;
$(function() {

})

function getMsgMore(data, listData,type,callback) {
	passMsg = data;
	listArr = listData;
	supplier(data.packageId)	
	types=type
	parentCallFn = callback
}
//选择供应商
function supplier(packageId) {
	$.ajax({
		type: "POST",
		url: findSupplierUrl,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				returnData = response.data

				if(returnData && returnData.length > 0) {
					setSupplier();
				} else {
					$("#suppSelect").hide()

				}

			}
		}
	})
}

function setSupplier() {
	var option = "<option value=''>-请选择-</option>";
	$("#supplier").append(option);
	for(var i = 0; i < returnData.length; i++) {

		option = "<option value='" + returnData[i].supplierEnterpriseId + "'>" + returnData[i].supplierEnterpriseName + "</option>";
		$("#supplier").append(option);

	}

}

$("#btn_submit").click(function() {
	if($("#supplier").val() == "") {
		return parent.layer.alert("请选择供应商");
	}
	if($("#isBidtype").val() == "") {
		return parent.layer.alert("请选择通知类型");
	}
	var arr = passMsg.list;
	var itemList=passMsg.itemArr;
	var arrList = [];
	var bidArr = [];
	var bidArrN=[];
	if(itemList&&itemList.length>0){
		for(var n=0;n<itemList.length;n++){
			if($("#supplier").val() ==itemList[n].supplierId){
				if($("#isBidtype").val() == itemList[n].isBid) {
					passMsg.resultContent = itemList[n].resultContent;
					passMsg.pdfUrl = itemList[n].pdfUrl
				}
			}
		}
	}
	for(var j = 0; j < listArr.length; j++) {
		if($("#supplier").val() == listArr[j].supplierEnterpriseId) {
			if(listArr[j].isBid == '0') {
				bidArr.push(listArr[j].isBid)
			}
			if(listArr[j].isBid == '1') {
				bidArrN.push(listArr[j].isBid)
			}
		}

	}
	if(passMsg.list) {
		for(var i = 0; i < arr.length; i++) {
			if($("#supplier").val() == arr[i].supplierEnterpriseId) {
				arrList.push({
					supplierEnterpriseId: arr[i].supplierEnterpriseId,
					isBid: arr[i].isBid,
					specificationId: arr[i].specificationId,
					noTaxRateTotalPrice: arr[i].noTaxRateTotalPrice,
					id:arr[i].id,
					specificationId:arr[i].specificationId
				})
			} else {
				passMsg.list = []
			}

		}

	}
	if($("#isBidtype").val()=='0'){		
		if(bidArr.length == '0'&&arrList.length=='0') {
			return parent.layer.alert("该供应商无中选明细");
		}
	}
	if($("#isBidtype").val()=='1'){		
		if(bidArrN.length == '0'&&arrList.length=='0') {
			return parent.layer.alert("该供应商无未中选明细");
		}
	}
	if(passMsg.pdfUrl){
		previewPdf(passMsg.pdfUrl);
	}else{
		passMsg.supplierId = $("#supplier").val();
		passMsg.isBid = $("#isBidtype").val()
		passMsg.list = arrList;
		parentCallFn ? parentCallFn(passMsg, types, "mx") : "";
		// top.layer.open({
		// 	type: 2,
		// 	title: "查看结果通知书",
		// 	area: ['550px', '650px'],
		// 	maxmin: false,
		// 	resize: false,
		// 	closeBtn: 1,
		// 	content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
		// 	success: function(layero, index) {
		// 		var body = layer.getChildFrame('body', index);
		// 		var iframeWin = layero.find('iframe')[0].contentWindow;
		// 		iframeWin.getMsg(passMsg, types, "mx");
		// 	}
		// });
	}
})

$("#btn_close").click(function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})