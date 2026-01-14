var token = $.getUrlParam("Token");
var dataId = $.getUrlParam('dataId');;//数据id
var fileUploads = null;//异议附件
var fileView = null;//答复附件
var fileNo = null;//不予受理通知书
var status =$.getUrlParam('status');//异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
$(function(){
	if(status == 1){
		$('.after_sign').css({'display':'none'});//异议状态
		$('.reply').css({'display':'none'});//回复
		$('.back').css({'display':'none'});//撤回
		$('.no_accept').css({'display':'none'});//不予受理
	}else if(status == 3 || status == 2){
		$('.after_sign').css({'display':'table-row'});//异议状态
		$('.reply').css({'display':'none'});//回复
		$('.back').css({'display':'none'});//撤回
		$('.no_accept').css({'display':'none'});//不予受理
	}else if(status == 4 || status == 6 || status == 7){
		$('.back').css({'display':'none'});
		$('.no_accept').css({'display':'none'});
		$('.after_sign').css({'display':'table-row'})
		$('.reply').css({'display':'table-row'});
	}else if(status == 5){
		$('.after_sign').css({'display':'table-row'});//异议状态
		$('.reply').css({'display':'none'});//回复
		$('.back').css({'display':'none'});//撤回
		$('.no_accept').css({'display':'table-row'});//不予受理
	}else if(status == 8 || status == 9){
		$('.after_sign').css({'display':'table-row'});//异议状态
		$('.reply').css({'display':'none'});//回复
		$('.back').css({'display':'table-row'});//撤回
		$('.no_accept').css({'display':'none'});//不予受理
	}
	getDetail(dataId);
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})
//信息反显
function getDetail(id){
	$.ajax({
		type:"post",
		url:config.openingHost+'/ObjectionAnswersController/getAndFile.do',
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				var source = data.data;
				bidId = source.bidSectionId;
				for(var key in source){
					if(source.status == 0){
						source.status = '未提交'
					}else if(source.status == 1){
						source.status = '未签收'
					}else if(source.status == 2){
						source.status = '<span style="color:green">已签收</span>'
					}else if(source.status == 3){
						source.status = '<span>未受理</span>'
					}else if(source.status == 4){
						source.status = '<span style="color:green">已受理</span>'
					}else if(source.status == 5){
						source.status = '<span style="color:red">不予受理</span>'
					}else if(source.status == 6){
						source.status = '<span>未答复</span>'
					}else if(source.status == 7){
						source.status = '<span style="color:green">已答复</span>'
					}else if(source.status == 8){
						source.status = '<span style="color:orange">申请撤回</span>'
					}else if(source.status == 9){
						source.status = '<span style="color:green">已撤回</span>'
					}
					$('#' + key).html(source[key]);
					//optionValueView("#objectionType",source.objectionType);//下拉框信息反显
					$("#objectionType").html("开标");
				};
				//异议附件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						businessId: dataId,
						status:2,
						Token:sessionStorage.getItem('token')
						//isPreview: true,    //false不可预览   true可预览
					});
				};
				//答复附件
				if(!fileView){
					fileView = new StreamUpload("#replayContent",{
						businessId: dataId,
						status:2,
						Token:sessionStorage.getItem('token')
					});
				};
				//不予受理通知书
				if(!fileNo){
					fileNo = new StreamUpload("#noAcceptContent",{
						businessId: dataId,
						status:2,
						Token:sessionStorage.getItem('token')
					});
				}
				
				var fileData = [];
				var replyData = [];
				var noAccept = [];
				if(source.projectAttachmentFiles){
					var files = source.projectAttachmentFiles;
					for(var i = 0;i<files.length;i++){
						if(files[i].attachmentSetCode == 'OBJECTION_FILE'){
							fileData.push(files[i]);//异议附件
						}else if(files[i].attachmentSetCode == 'ANSWERS_FILE'){
							replyData.push(files[i]);//答复附件
						}else if(files[i].attachmentSetCode == 'NO_ACCEPT_FILE'){
							noAccept.push(files[i]);//不予受理通知书
						}
					}
					fileUploads.fileHtml(fileData);
					fileView.fileHtml(replyData);
					fileNo.fileHtml(noAccept);
				}
			}
		}
	});
}
