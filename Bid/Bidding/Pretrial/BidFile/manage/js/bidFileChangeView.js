var detUrl = config.tenderHost + '/PretrialDocClarifyController/findPretrialDocClarifyById.do';  //招标文件详情
var dateUrl = config.tenderHost + '/PretrialDocClarifyController/getBidSectionDateTime.do';  //时间
var fileId; //招标文件表主键ID
var fileArr = []; //文件数组操作 上传或者修改

var bidUploads = null, //招标文件
	addendumUploads = null;  //补遗文件
var isThrough;
var bidSectionId = '';//标段id
var zbwjPdf = '';
var changeCount = 0;//变更次数
$(function() {
	isThrough = $.getUrlParam("isThrough");
	fileId = $.getUrlParam("id");
	if($.getUrlParam("changeCount") && $.getUrlParam("changeCount") != 'undefined'){
		changeCount = $.getUrlParam("changeCount");
	}
	getDetail();
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
		fileId = data.id;
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
		data: postData,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if (!data.data) {
				return;
			};
			var arr = data.data;
			bidSectionId = arr.bidSectionId;
			fileId = arr.id;
			if(changeCount == 0){//变更次数
				$('.change').hide();
				$(".fileWrap").show();
			}else{
				$('.change').show();
				if(arr.isChange == 1){//文件变更
					$("[name='isChange']").prop("checked", "checked");
					$(".fileWrap").show();
				} else {
					$(".fileWrap").hide();
				}
				if(arr.isReplenish == 1){//时间变更
					noteDate();
					$("[name='isReplenish']").prop("checked", "checked");
					$(".addendum").show();
				} else {
					$(".addendum").hide();
				}
				
			}
			if(arr.docClarifyItems && arr.docClarifyItems.length > 0){
				for(var i = 0;i<arr.docClarifyItems.length;i++){
					if(arr.docClarifyItems[i].fileType == 'ZW'){
						$('#btnPreview').show();
						zbwjPdf = arr.docClarifyItems[i].fileUrl;
					}
				}
			};
			isThrough = arr.pretrialDocClarifyState == 2 ? 1 : 0;
			$("#btnClose").show();
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				type:"zgyswjsp", 
				businessId:fileId, 
				status:3,
				checkState:isThrough
			});
		 	
			for(var key in arr){
				if(key == "projectAttachmentFiles"){
					var fileArr = {file1:[], file2:[]}
					if(!bidUploads){
						bidUploads = new StreamUpload("#bidFile",{
							businessId: fileId,
							status:2
						});
					}
					for(var i = 0; i < arr[key].length; i++){
						if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC"){
							fileArr.file1.push(arr[key][i]);
						} else if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC_ATTACHS"){
							fileArr.file2.push(arr[key][i]);
						}
					}
					bidUploads.fileHtml(fileArr.file1.concat(fileArr.file2));
				} else {
					$("#"+key).html(arr[key]);
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

/**
 * 获取招标文件详情
 * id 招标文件当前id
 */
function noteDate(){
	$.ajax({
		type: "post",
		url: dateUrl,
		async: false,
		data:{
			bidSectionId:bidSectionId
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.msg);
				return;
			}
			var arr = data.data;
			$("#clarifyTime").html(arr.clarifyTime?arr.clarifyTime:'');
		}
	});
}
