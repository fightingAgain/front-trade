var detUrl = config.tenderHost + '/DocClarifyController/findDocClarifydetail.do';  //招标文件详情
var historyUrl = config.tenderHost + '/DocClarifyController/findOldAttachmentFileList.do';  //招标文件时间变更历史
var fileDownloadUrl = config.FileHost + "/FileController/download.do";

var pageView = 'Bidding/BidFile/BidFileChange/model/BidFileView.html';

var bidSectionId = '';
var fileId; //招标文件表主键ID
var fileArr = []; //文件数组操作 上传或者修改

var bidUploads = null, //招标文件
	drawUploads = null;  //图纸文件
var isThrough;
var bidInfo;//获取标段信息
var zbwjPdf = '';
var changeCount = 0;//变更次数
$(function() {
	isThrough = $.getUrlParam("isThrough");
	if($.getUrlParam("changeCount") && $.getUrlParam("changeCount") != 'undefined'){
		changeCount = $.getUrlParam("changeCount");
	}
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		fileId =$.getUrlParam("id");
	}
	getDetail();
	bidInfo = getBidSectionDetail(bidSectionId);
	//获取标段中的保证金信息
	if(bidInfo.isCollectDeposit == 1){
		$('.isShowDeposit').show();
		$('#isCollectDeposit').html((bidInfo.isCollectDeposit == 1)?'是':'否');
		if(bidInfo.depositType == 1){
			$('#depositType').html('固定金额');
		}else if(bidInfo.depositType == 2){
			$('#depositType').html('固定比例');
		}
		formatDeposit(bidInfo.depositType);
	}
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//预览
	$('#btnPreview').click(function(){
		previewPdf(zbwjPdf)
	});
});

//其他页面调用的方法
function passMessage(data){
	if(data){
		$("#btnChoose").hide();
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
	}
}

//详情
function getDetail() {
	var postUrl = '';
	var postData = {};
	postUrl = detUrl;
	postData.id = fileId;
	$.ajax({
		url: postUrl,
		type: "post",
		data:postData,
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if(data.data){
				var arr = data.data;
				bidSectionId = arr.bidSectionId;
				fileId = arr.id;
				if(arr.docClarifyItems && arr.docClarifyItems.length > 0){
					for(var i = 0;i<arr.docClarifyItems.length;i++){
						if(arr.docClarifyItems[i].fileType == 'ZW'){
							$('#btnPreview').show();
							zbwjPdf = arr.docClarifyItems[i].fileUrl;
						}
					}
				};
				$("#depositMoney").html(arr.depositMoney?arr.depositMoney:'');
				$("#depositRatio").html(arr.depositRatio?arr.depositRatio:'');
				if(arr.bidDocClarifyState == 2){
					isThrough = 1
				}else{
					isThrough = 0
				}
				$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
					type:"zbwjsp", 
					businessId:fileId, 
					status:3,
					checkState:isThrough
				});
			
				for(var key in arr){
					if(key == "projectAttachmentFiles"){
						var fileArr = {file1:[], file2:[], file3:[]}
						if(!bidUploads){
							bidUploads = new StreamUpload("#bidFile",{
								businessId: fileId,
								status:2
							});
						}
						if(!drawUploads){
							drawUploads = new StreamUpload("#drawFile",{
								businessId: fileId,
								status:2
							});
						}
						for(var i = 0; i < arr[key].length; i++){
							if(arr[key][i].attachmentSetCode == "TENDER_FILE"){
								fileArr.file1.push(arr[key][i]);
							} else if(arr[key][i].attachmentSetCode == "OTHER_FILE_ATTACHS" || arr[key][i].attachmentSetCode == "REPLENISH_FILE"){
								fileArr.file2.push(arr[key][i]);
							} else if(arr[key][i].attachmentSetCode == "DRAWING_DOCUMENT"){
								fileArr.file3.push(arr[key][i]);
							}
						}
						bidUploads.fileHtml(fileArr.file1.concat(fileArr.file2));
						drawUploads.fileHtml(fileArr.file3);
					} else {
						$("#"+key).html(arr[key]);
					}
				}
				if(changeCount == 0){//变更次数(首次 不展示变更部分  只展示招标文件部分)
					$('.change').hide();
					$(".fileWrap, .drawShow").show();
				}else{
					$('.change').show();
					if(arr.isChange == 1){
						$("[name='isChange']").prop("checked", "checked");
						$(".fileWrap").show();
					} else {
						$(".fileWrap").hide();
					}
					if(arr.isReplenish == 1){
						$("[name='isReplenish']").prop("checked", "checked");
						$(".addendum").show();
					} else {
						$(".addendum").hide();
					}
					if(arr.isChangeDeposit && arr.isChangeDeposit == 1){
						$("[name='isChangeDeposit']").prop("checked", "checked");
						$(".changeDeposit").show();
					} else {
						$(".changeDeposit").hide();
					}
				}
			}
			
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};
//保证金
function formatDeposit(depositType) {
	if (depositType == 1) {
		$(".depositTit").html('保证金金额（元）');
		$(".depositMoney").show();
		$(".depositRatio").hide();
	} else {
		$(".depositTit").html('保证金比例（不低于投标总价）%');
		$(".depositMoney").hide();
		$(".depositRatio").show();
	}
}