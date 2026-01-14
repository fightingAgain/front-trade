var token = $.getUrlParam("Token");
var bidId = $.getUrlParam("bidId");	//标段id
var dataId = $.getUrlParam('dataId');//数据id
var isShowResult = $.getUrlParam('isShowResult');//
var status = $.getUrlParam('state');//异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var fileUploads = null;//异议附件
var fileView = null;//答复附件
var fileNo = null;//不予受理通知书
var egisterInfo = entryInfo();
var replyAppendixFileUpload = null; // 异议答复附件

var bidHtml = 'Bidding/ObjectionManage/Bidder/model/bidList.html';//选择标段

var saveUrl = config.OpenBidHost + '/ObjectionAnswersController/sign.do';//保存
var replyUrl = config.OpenBidHost + '/ObjectionAnswersController/submitAReply.do';//保存答复
var detailUrl = config.OpenBidHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
//var backUrl = config.tenderHost + '/ObjectionAnswersController/revocation.do';//申请撤回
var initDataTab;

$(function(){
	$('#bidSectionId').val(bidId);
	//根据状态，调整页面显示
	if(status == 1){//未签收
		//隐藏受理
		$('.after_sign').css({'display':'none'});
		//隐藏答复
		$('.reply').css({'display':'none'});
		$('#btnSubmit').hide();
	}else if(status == 3 || status == 2){//已签收 未受理
		//隐藏签收按钮
		$('#sign_in').css({'display':'none'});
		$('#btnSubmit').show();
		//显示受理
		$('.after_sign').css({'display':'table-row'});
		//隐藏答复
		$('.reply').css({'display':'none'});
	}else if(status == 4 || row.status == 6){//已受理 已受理未答复
		//隐藏签收按钮
		$('#sign_in').css({'display':'none'});
		$('#btnSubmit').show();
		//显示受理
		$('.after_sign').css({'display':'table-row'});
		//显示答复
		$('.reply').css({'display':'table-row'});
		if(isShowResult == 1){
			dealResultSelect()
		}else{
			$(".yycljg").hide();
		}
		//答复附件
		if(!fileView){
			fileView = new StreamUpload("#replayContent",{
				basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/220",
				businessId: dataId,
				browseFileId: "fileLoad",  //上传按钮
				status:1,
				businessTableName:'T_OBJECTION_ANSWERS',
				attachmentSetCode:'ANSWERS_FILE',
				Token:token
			});
		}
		if (!replyAppendixFileUpload) {
			replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
				basePath: "/" + egisterInfo.enterpriseId + "/" + bidId + "/" + dataId + "/220",
				businessId: dataId,
				browseFileId: "replyAppendixFileUpload",  //上传按钮
				status: 1,
				businessTableName: 'T_OBJECTION_ANSWERS',
				attachmentSetCode: 'REPLY_APPENDIX_FILE',
				filesQueueId: 'filesQueueId' + Math.random().toString().replace('.',''),
			});
		}
	}
	
	//给页面赋值值
	$('#dataId').val(dataId);
	
	//获取值
	getDetail(dataId);
	
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
        initDataTab();
	});
	
	//根据状态，切换受理通知书是否上传
	$('[name=status]').change(function(){
		if($(this).val() == 5){
			$('.no_accept').css({'display':'table-row'});
		}else if($(this).val() == 4){
			$('.no_accept').css({'display':'none'});
		}
	})
	
	//确认
	$('#btnSubmit').click(function(){
		if(status == 3 || status == 2){
			status = $('[name=status]:checked').val();
			if(status == undefined){
				//重新赋值为已签收为受理状态
				status =3;
				parent.layer.alert('请选择答复状态！',{icon:7,title:'提示'})
			}else{
				save(true,status);
			}
		}else if(status == 4 || status == 6){
			$('.reply_check').attr('datatype','*');
			if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
				var isOver = $('[name=isOver]:checked').val();
				if(isShowResult == 1 && isOver == undefined){
					parent.layer.alert("温馨提醒：请选择异议处理完毕！")
					return
				}
				saveReply()
			}
		}
	});
	
	//签收
	$('#sign_in').click(function(){
		save(false)
	});
	
	//不予受理通知书上传
	if(!fileNo){
		fileNo = new StreamUpload("#noAcceptContent",{
			basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/221",
			businessId: dataId,
			browseFileId: "fileUp",  //上传按钮
			status:1,
			businessTableName:'T_OBJECTION_ANSWERS',
			attachmentSetCode:'NO_ACCEPT_FILE',
			Token:token
		});
	}
})

//其他页面调用的方法
function passMessage(data){
	initDataTab = data;
}

/*
 * isSign: 是否签收
 */
function save(isSign,state){
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	if(!isSign){
		arr.status = 3;
	};
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				dataId = data.data;
				if(!isSign){
					top.parent.layer.alert('签收成功！',{icon:6,title:'提示'});
					//隐藏签收按钮
					$('#sign_in').hide();
					$('#btnSubmit').show();
					//显示受理
					$('.after_sign').css({'display':'table-row'});
					status = 3;
				}
				if(state == 4){
					top.parent.layer.alert('受理成功！',{icon:6,title:'提示'},function(index){
						parent.layer.close(index);
						var index1 = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index1);
					})
				}else if(state == 5){
					top.parent.layer.alert('不予受理成功！',{icon:6,title:'提示'},function(index){
						parent.layer.close(index);
						var index1 = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index1);
					})
				}
				
				initDataTab();
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};

//保存答复
function saveReply(){
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	$.ajax({
		type:"post",
		url:replyUrl,
		async:false,
		data: arr,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				dataId = data.data;
				parent.layer.alert('答复成功！',{icon:6,title:'提示'},function(index){
					parent.layer.close(index);
				    var index1 = parent.layer.getFrameIndex(window.name);
				    parent.layer.close(index1);
				})
				initDataTab();
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};

//信息反显
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				var source = data.data;
				bidId = source.bidSectionId;
				for(var key in source){
					$('#' + key).val(source[key]);
					if(key == "enterpriseName"){
						$("#enterpriseName").html(source[key]);
					}
					$("#objectionType").html("开标");
				};
				if(source.status == 4){
					$("input:radio[name=status][value=4]").attr("checked",true); 
					$('[name=status]').prop('disabled','disabled')
				}
				//异议附件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						businessId: source.id,
						status:2,
						Token:token
						//isPreview: true,    //false不可预览   true可预览
					});
				};
				//答复附件
				if(!fileView){
					fileView = new StreamUpload("#replayContent",{
						businessId: source.id,
						status:2,
						Token:token
					});
				};
				if (!replyAppendixFileUpload) {
					replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
						businessId: source.id,
						status: 2,
					});
				}
				//不予受理通知书
				if(!fileNo){
					fileNo = new StreamUpload("#noAcceptContent",{
						businessId: source.id,
						status:2,
						Token:token
					});
				};
				var fileData = [];//异议附件
				var replyData = [];//答复附件
				var noAccept = [];//不予受理通知书
				var replyAppendixFile = [];
				if(source.projectAttachmentFiles){
					var files = source.projectAttachmentFiles;
					for(var i = 0;i<files.length;i++){
						if(files[i].attachmentSetCode == 'OBJECTION_FILE'){
							fileData.push(files[i])
						}else if(files[i].attachmentSetCode == 'ANSWERS_FILE'){
							replyData.push(files[i]);//答复附件
						}else if(files[i].attachmentSetCode == 'NO_ACCEPT_FILE'){
							noAccept.push(files[i]);//不予受理通知书
						} else if (files[i].attachmentSetCode == 'REPLY_APPENDIX_FILE') {
							replyAppendixFile.push(files[i]);
						}
					}
					fileUploads.fileHtml(fileData);
					fileView.fileHtml(replyData);
					fileNo.fileHtml(noAccept);
					replyAppendixFileUpload.fileHtml(replyAppendixFile);
				}
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
