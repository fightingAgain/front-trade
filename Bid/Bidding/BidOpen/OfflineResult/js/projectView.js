var saveUrl = config.tenderHost + "/BidOpeningOffController/saveBidOpeningDetails.do";  //保存
var customListUrl = config.tenderHost + '/BidOpeningOffController/findBidOpeningData.do'; // 自定义列表
var detailUrl = config.tenderHost + '/BidOpeningOffController/getBidOpeningDetails.do'; // 开标详情

var options;  //从上一个页面传过来的参数
var bidUploads = null; //投标文件
var bidSectionId = "";  //标段id
var openId = "";  //开标记录id
var filePath = "";  //投标文件路径
var employeeInfo = entryInfo(); //企业信息
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
			saveForm(false, function(){
				obj.click();
			});
		}
		
		if(!bidUploads){ 
			initUpload();
		}
		
	});
	
	//保存
	$("#btnSave").click(function(){
		if(checkForm($("#formName"))){
			saveForm(true);
		}
	});
  
	
 });
 
 //初始化上传插件
 function initUpload(){
 	bidUploads = new StreamUpload("#fileContent",{
		businessId: openId,
		status:2,
		businessTableName:'T_BID_FILE',  //立项批复文件（项目审批核准文件）    项目表附件
		attachmentSetCode:'BID_FILE',		
	});
 }

 
 // 窗口之间调用的方法
 function passMessage(data){
 	options = data;
 	bidSectionId = data.bidSectionId;
 	
 	$("#bidderName").html(data.supplierName);
 	$("#bidSectionName").html(data.bidSectionName);
 	customList();
 	
 	openId = data.bidOpeningDetailsId ? data.bidOpeningDetailsId : "";
 	if(openId != ""){
 		detailList();
 	}
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
				html += '<td class="th_bg">'+arr[i].dataName+'</td><td  data-name="'+arr[i].dataName+'">'+(arr[i].dataValue ? arr[i].dataValue : "")+'</td>';
				
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
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			$("#bidderName").html(arr.bidderName);
			$("#bidPrice").html(arr.bidPrice);
			if(arr.openingDatas && arr.openingDatas.length > 0){
				for(var i = 0; i < arr.openingDatas.length; i++){
					$("[data-name='"+arr.openingDatas[i].dataName+"']").html(arr.openingDatas[i].dataValue);
					if(i == 0){
						$('.projectPriceUnit').html(arr.openingDatas[i].priceUnit == '1'?'万元':'元');
					}
				}
			}
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

 