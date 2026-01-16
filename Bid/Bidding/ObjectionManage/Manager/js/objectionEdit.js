/**

*  项目经理处理异议
*  方法列表及功能描述
*/
var bidHtml = 'Bidding/ObjectionManage/Bidder/model/bidList.html';//选择标段

var saveUrl = config.tenderHost + '/ObjectionAnswersController/sign.do';//保存
var replyUrl = config.tenderHost + '/ObjectionAnswersController/submitAReply.do';//保存答复
var detailUrl = config.tenderHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
//var backUrl = config.tenderHost + '/ObjectionAnswersController/revocation.do';//申请撤回

var egisterInfo = entryInfo();
var dataId = '';//数据id
var bidId = '';//标段id
var fileUploads = null;//异议附件
var fileView = null;//异议答复函	
var replyAppendixFileUpload = null; // 异议答复附件
var fileNo = null;//不予受理通知书
var fileNoArr = [];
var status;//异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var objectionType;//"1":"资格预审文件","4":"招标文件","5":"开标","7":"中标候选人公示"
var isShowResult = $.getUrlParam('isShowResult');//是否展示异议处理功能 1 显示 0 不显示
$(function () {
	//	initSelect('.select');
	dataId = $.getUrlParam('dataId');
	bidId = $.getUrlParam('bidId');
	status = $.getUrlParam('state');
	objectionType = $.getUrlParam('objectionType');
	var examType = objectionType ==1?'1':'2';
	if (status == 1) {
		$('#btnSubmit').hide();
		$('.after_sign').css({ 'display': 'none' });
		$('.reply').css({ 'display': 'none' });
	} else if (status == 3 || status == 2) {
		$('#sign_in').css({ 'display': 'none' });
		$('#btnSubmit').show();
		$('.after_sign').css({ 'display': 'table-row' });
		$('.reply').css({ 'display': 'none' });
	} else if (status == 4 || status == 6) {
		$('#btnSubmit').show();
		$('#sign_in').css({ 'display': 'none' });
		$('.after_sign').css({ 'display': 'table-row' });
		$('.reply').css({ 'display': 'table-row' });
		if(isShowResult == 1){
			dealResultSelect()
		}else{
			$(".yycljg").hide();
		}
		// 异议答复函
		if (!fileView) {
			fileView = new StreamUpload("#replayContent", {
				basePath: "/" + egisterInfo.enterpriseId + "/" + bidId + "/" + dataId + "/220",
				businessId: dataId,
				browseFileId: "fileLoad",  //上传按钮
				status: 1,
				businessTableName: 'T_OBJECTION_ANSWERS',
				attachmentSetCode: 'ANSWERS_FILE'
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
	$('#dataId').val(dataId);
	isShowSupplierInfo(bidId, examType, '', function(data){
		if(data.isShowSupplier == 1 || data.isShowBidFile ==1){
			getDetail(dataId, '1');
		}else{
			getDetail(dataId, '0');
		}
	})
	//关闭
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$('[name=status]').change(function () {
		//		console.log($(this).val())
		if ($(this).val() == 5) {
			$('.no_accept').css({ 'display': 'table-row' });
		} else if ($(this).val() == 4) {
			$('.no_accept').css({ 'display': 'none' });
		}
	})
	//确认
	$('#btnSubmit').click(function () {
		if (!($('[name=status]').prop('disabled'))) {
			status = $('[name=status]:checked').val();
			if (status == 'undefined') {
				parent.layer.alert('请选择答复状态！', { icon: 7, title: '提示' })
			} else {
				save(true, status)
				return
			}
		}

		if (status == 3 || status == 2) {
			status = $('[name=status]:checked').val();
			if (status == 'undefined') {
				parent.layer.alert('请选择答复状态！', { icon: 7, title: '提示' })
			} else {
				save(true, status)
			}
		} else if (status == 4 || status == 6) {
			$('.reply_check').attr('datatype', '*');
			if (checkForm($("#addNotice"))) {//必填验证，在公共文件unit中
				var isOver = $('[name=isOver]:checked').val();
				if(isShowResult == 1 && isOver == undefined){
					parent.layer.alert("温馨提醒：请选择异议处理完毕！")
					return
				}
				saveReply()
			}
		} else if (status == 5) {
			if (checkForm($("#addNotice"))) {//必填验证，在公共文件unit中
				if (fileNoArr.length == 0) {
					parent.layer.alert('请上传不予受理通知书！')
				} else {
					saveReply()
				}

			}
		}
	});
	//签收
	$('#sign_in').click(function () {
		save(false)
	});
	//不予受理通知书上传
	if (!fileNo) {
		fileNo = new StreamUpload("#noAcceptContent", {
			basePath: "/" + egisterInfo.enterpriseId + "/" + bidId + "/" + dataId + "/221",
			businessId: dataId,
			browseFileId: "fileUp",  //上传按钮
			status: 1,
			businessTableName: 'T_OBJECTION_ANSWERS',
			attachmentSetCode: 'NO_ACCEPT_FILE',
			changeFile: function (data) {
				//有文件操作是，返回方法，data为文件列表
				fileNoArr = data;
			},

		});
	}
})

/*
 * isSign: 是否签收
 */
function save(isSign, state) {
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	if (!isSign) {
		arr.status = 3;
	};
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: arr,
		success: function (data) {
			if (data.success) {
				dataId = data.data;
				if (!isSign) {
					parent.layer.alert('签收成功！', { icon: 6, title: '提示' });
					$('#sign_in').hide();
					$('#btnSubmit').show();
					$('.after_sign').css({ 'display': 'table-row' });
					status = 3;
				}
				if (state == 4) {
					parent.layer.alert('受理成功！', { icon: 6, title: '提示' }, function (index) {
						parent.layer.closeAll();
					})
				} else if (state == 5) {
					parent.layer.alert('不予受理成功！', { icon: 6, title: '提示' }, function (index) {
						parent.layer.closeAll();
					})
				}
				parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
//保存答复
function saveReply() {
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	$.ajax({
		type: "post",
		url: replyUrl,
		async: false,
		data: arr,
		success: function (data) {
			if (data.success) {
				dataId = data.data;
				parent.layer.alert('答复成功！', { icon: 6, title: '提示' }, function (index) {
					parent.layer.closeAll();
				})
				parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
//信息反显
function getDetail(id, isShowSupplier) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'id': id,
			'isShowSupplier': isShowSupplier
		},
		success: function (data) {
			if (data.success) {
				var source = data.data;
				bidId = source.bidSectionId;
				for (var key in source) {
					$('#' + key).html(source[key]);
					$('#' + key).val(source[key]);
					optionValueView("#objectionType", source.objectionType);//下拉框信息反显
				};
				if (!source.submitTime) {
					$('#submitTime').html('-')
				};
				if (!source.answersDate) {
					$('#answersDate').html('-')
				};
				if (source.status == 4) {
					$("input:radio[name=status][value=4]").attr("checked", true);
					$('[name=status]').prop('disabled', 'disabled')
				}
				//异议附件
				if (!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						businessId: source.id,
						status: 2,
						//isPreview: true,    //false不可预览   true可预览
					});
				};
				//异议答复函
				if (!fileView) {
					fileView = new StreamUpload("#replayContent", {
						businessId: source.id,
						status: 2,
					});
				};
				if (!replyAppendixFileUpload) {
					replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
						businessId: source.id,
						status: 2,
					});
				}
				//不予受理通知书
				if (!fileNo) {
					fileNo = new StreamUpload("#noAcceptContent", {
						businessId: source.id,
						status: 2,
					});
				};
				var fileData = [];//异议附件
				var replyData = [];//异议答复函	
				var noAccept = [];//不予受理通知书
				var replyAppendixFile = [];
				if (source.projectAttachmentFiles) {
					var files = source.projectAttachmentFiles;
					for (var i = 0; i < files.length; i++) {
						if (files[i].attachmentSetCode == 'OBJECTION_FILE') {
							fileData.push(files[i])
						} else if (files[i].attachmentSetCode == 'ANSWERS_FILE') {
							replyData.push(files[i]);//异议答复函	
						} else if (files[i].attachmentSetCode == 'NO_ACCEPT_FILE') {
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