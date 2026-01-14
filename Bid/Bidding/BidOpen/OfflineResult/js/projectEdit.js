var saveUrl = config.tenderHost + "/BidOpeningOffController/saveBidOpeningDetails.do";  //保存
var customListUrl = config.tenderHost + '/BidOpeningOffController/findBidOpeningData.do'; // 自定义列表
var detailUrl = config.tenderHost + '/BidOpeningOffController/getBidOpeningDetails.do'; // 开标详情
var getBidInfoUrl = top.config.tenderHost + '/BidSectionController/getById.do';//获取标段信息（用于新增时判断金额单位）

var options;  //从上一个页面传过来的参数
var bidUploads = null; //投标文件
var bidSectionId = "";  //标段id
var openId = "";  //开标记录id
var filePath = "";  //投标文件路径
var employeeInfo = entryInfo(); //企业信息
var priceUnit, projectPriceUnit;
$(function(){
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	//上传招标文件
	$('#btnFile').click(function(){
		var obj = $(this);
		
		if(!(openId && openId!="")){
			if(checkForm($("#formName"))){
				saveForm(false, function(){
					initUpload();
					$('#btnBid').trigger('click');
				});
				
			}
		}else {
			initUpload();
			$('#btnBid').trigger('click');
		}
	
		
		
		
	});
	
	//保存
	$("#btnSave").click(function(){
		if(checkForm($("#formName"))){
			saveForm(true);
		}
	});
	//开始时间
 	$('[name="deliveryDate"]').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
		})
 	});
 	$('[name="warrantyDate"]').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
		})
 	});
 	//项目实施时间
 	$('[name="startTime"]').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
		})
 	});
	
	
 });
 
 //初始化上传插件
 function initUpload(){
 	if(bidUploads){
 		return;
 	}
 	bidUploads = new StreamUpload("#fileContent",{
		basePath:"/"+employeeInfo.enterpriseId+"/"+bidSectionId+"/205",
		businessId: openId,
		status:1,
		businessTableName:'T_BID_FILE',  //立项批复文件（项目审批核准文件）    项目表附件
		attachmentSetCode:'BID_FILE',
		browseFileId:'btnBid',
		isMult:false,
		changeFile:function(data){
			if(data.length > 0){
				filePath = data[data.length-1].url;
			}
		}
	});
 }

 
 // 窗口之间调用的方法
 function passMessage(data){
 	options = data;
 	bidSectionId = data.bidSectionId;
 	
 	$("[name='bidderName']").val(data.supplierName);
 	$("#bidSectionName").html(data.bidSectionName);
 	customList();
 	
 	openId = data.bidOpeningDetailsId ? data.bidOpeningDetailsId : "";
 	if(openId != ""){
 		detailList();
 	}else{
		getPriceUnit();
	}
	$('#formName').on('input','[name=bidPrice]', function(){
		priceInput(this, (priceUnit == 1?"6":"2"))
	})
	$('#formName').on('input','[name=safeTyCost], [name=civilizedCost], [name=qualityCost]', function(){
		priceInput(this, (projectPriceUnit == 1?"6":"2"))
	})
 }
 
 //自定义列
 function customList(){
	$.ajax({
		url: customListUrl,
		type: "post",
		data: {
			bidSectionId: bidSectionId
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var html = "";
			var arr = data.data;
			for(var i = 0; i < arr.length; i++){
				if(i % 2 == 0){
					html += '<tr>';
				}
				html += '<td class="th_bg">'+arr[i].dataName+'</td><td><input type="text" data-name="'+arr[i].dataName+'" class="form-control iptCustom" value="'+(arr[i].dataValue ? arr[i].dataValue : "")+'"></td>';
				
				if(i % 2 != 0){
					html += '</tr>';
				}
			}
			$(html).appendTo("#formTable");
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 2,
				title: '提示'
			});
		}
	});
}
 //详情
 function detailList(){
	$.ajax({
		url: detailUrl,
		type: "post",
		data: {
			id: openId
		},
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			$("[name='bidderName']").val(arr.bidderName);
			$("[name='bidPrice']").val(arr.bidPrice);
			if(arr.openingDatas && arr.openingDatas.length > 0){
				for(var i = 0; i < arr.openingDatas.length; i++){
					$("[data-name='"+arr.openingDatas[i].dataName+"']").val(arr.openingDatas[i].dataValue);
					if(i == 0){
						$('[name=projectPriceUnit]').val((arr.openingDatas[i].priceUnit || arr.openingDatas[i].priceUnit == 0)?arr.openingDatas[i].priceUnit:'0');
						$('.projectPriceUnit').html(arr.openingDatas[i].priceUnit == '1'?'万元':'元');
						projectPriceUnit = arr.openingDatas[i].priceUnit;
					}
				}
			}
			$('[name=priceUnit]').val((arr.priceUnit || arr.priceUnit == 0)?arr.priceUnit:'0');
			priceUnit =(arr.priceUnit || arr.priceUnit == 0)?arr.priceUnit:'0';
			$('.priceUnit').html(arr.priceUnit == '1'?'万元':'元');
			if(!bidUploads){ 
				initUpload();
			}
			if(arr.projectAttachmentFiles && arr.projectAttachmentFiles.length > 0){
				bidUploads.fileHtml(arr.projectAttachmentFiles);
			}
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 2,
				title: '提示'
			});
		}
	});
}
 //保存
function saveForm(isAlert,callback){
	var data = {};
	if(openId){
		data.id = openId;
	} 
	if(filePath){
		data.filePath = filePath;
	}
	data.bidSectionId = bidSectionId;
	data.bidderName = options.supplierName;
	data.bidderId = options.supplierId;
	data.bidPrice = $("[name='bidPrice']").val();
	data.priceUnit = $("[name='priceUnit']").val();
	data.priceCurrency = $("[name='priceCurrency']").val();
	
	var OpeningDatas = [];
	$("[data-name]").each(function(){
		var item = {};
		item.dataName = $(this).attr("data-name");
		item.dataValue = $(this).val();
		item.priceUnit = $('[name=projectPriceUnit]').val();
		OpeningDatas.push(item);
	});
	data.OpeningDatas = OpeningDatas;
	
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
			openId = data.data;
			if(callback){
				callback();
			}
			if(isAlert){
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
				top.layer.alert("保存成功");
			}
			options.callBack();
		}
	});
};
function getPriceUnit(){
	$.ajax({
		type: "post",
		url: getBidInfoUrl,
		async: false,
		data:{id: bidSectionId},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			//isUnifiedUnit 是否统一金额单位为元 0否1是
			$('[name=projectPriceUnit], [name=priceUnit]').val(data.data.isUnifiedUnit == 1?"0":"1");
			$('.projectPriceUnit, .priceUnit').html(data.data.isUnifiedUnit == 1?"元":"万元");
			priceUnit = data.data.isUnifiedUnit == 1?"0":"1";
			projectPriceUnit = data.data.isUnifiedUnit == 1?"0":"1";
			
		}
	});
}