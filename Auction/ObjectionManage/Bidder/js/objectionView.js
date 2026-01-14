/**
*  zhouyan 
*  2019-6-2
*  查看异议
*  方法列表及功能描述
*/
var detailUrl = config.AuctionHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
var fileDownloadUrl = config.FileHost + "/FileController/download.do";//文件下载
var replyUrl = config.AuctionHost + "/ObjectionAnswersReplyController/list.do"; // 查询回复信息

var egisterInfo = entryInfo();
var dataId = '';//数据id
var bidId = '';//包件id
var fileUploads = null;//异议附件
var fileView = null;//答复附件
var replyAppendixFileUpload = null; // 异议答复附件
var fileNo = null;//不予受理通知书
var fileData = [];
var replyData = [];
var noAccept = [];
var status;//异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var examType; // 资格审查方式  预审还是后审
var tenderType;
var enterpriseType;
$(function () {
	status = $.getUrlParam('state');
	dataId = $.getUrlParam('dataId');
	examType = $.getUrlParam("examType");
	tenderType = $.getUrlParam('tenderType');
	enterpriseType = $.getUrlParam('enterpriseType');
	if (status == 1) {
		$('.back_reply').css({ 'display': 'none' });//异议状态
		$('.reply').css({ 'display': 'none' });//答复
		$('.back').css({ 'display': 'none' });//撤回说明
		$('.no_accept').css({ 'display': 'none' });//不予受理
	} else if (status == 3 || status == 2) {
		$('.back_reply').css({ 'display': 'table-row' });//异议状态
		$('.reply').css({ 'display': 'none' });//答复
		$('.back').css({ 'display': 'none' });//撤回说明
		$('.no_accept').css({ 'display': 'none' });//不予受理
	} else if (status == 4 || status == 6 || status == 7) {
		//		$('#sign_in').css({'display':'none'});
		$('.back').css({ 'display': 'none' });//撤回说明
		$('.no_accept').css({ 'display': 'none' });//不予受理
		$('.back_reply').css({ 'display': 'table-row' })//异议状态
		$('.reply').css({ 'display': 'table-row' });//答复
	} else if (status == 5) {
		$('.back_reply').css({ 'display': 'table-row' });//异议状态
		$('.reply').css({ 'display': 'none' });//回复
		$('.back').css({ 'display': 'none' });//撤回
		$('.no_accept').css({ 'display': 'table-row' });//不予受理
	} else if (status == 8 || status == 9) {
		$('.back_reply').css({ 'display': 'table-row' });//异议状态
		$('.reply').css({ 'display': 'none' });//回复
		$('.back').css({ 'display': 'table-row' });//撤回
		$('.no_accept').css({ 'display': 'none' });//不予受理
	}
	getDetail(dataId);
	getReplyList(dataId);
	//关闭
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//答复下载
	$("#replayContent").on("click", ".btnLoad", function () {
		var index = $(this).attr("data-index");
		var road = replyData[index].url;
		var fileName = replyData[index].attachmentFileName;
		fileName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/\s+/g, "");
		$(this).attr('href', $.parserUrlForToken(fileDownloadUrl + '?ftpPath=' + road + '&fname=' + fileName))
	});
	//不予受理通知下载
	$("#noAcceptContent").on("click", ".btnLoad", function () {
		var index = $(this).attr("data-index");
		var road = noAccept[index].url;
		var fileName = noAccept[index].attachmentFileName;
		fileName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/\s+/g, "");
		$(this).attr('href', $.parserUrlForToken(fileDownloadUrl + '?ftpPath=' + road + '&fname=' + fileName))
	});
	doPackageView(tenderType);
})
//信息反显
function getDetail(id) {
	fileData = [];
	replyData = [];
	noAccept = [];
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'id': id,
			examType: examType,
			tenderType: tenderType,
			enterpriseType: enterpriseType,
		},
		success: function (data) {
			if (data.success) {
				var source = data.data;
				bidId = source.packageId;
				for (var key in source) {
					if (source.status == 0) {
						source.status = '未提交'
					} else if (source.status == 1) {
						source.status = '未签收'
					} else if (source.status == 2) {
						source.status = '<span style="color:green">已签收</span>'
					} else if (source.status == 3) {
						source.status = '<span>未受理</span>'
					} else if (source.status == 4) {
						source.status = '<span style="color:green">已受理</span>'
					} else if (source.status == 5) {
						source.status = '<span style="color:red">不予受理</span>'
					} else if (source.status == 6) {
						source.status = '<span>未答复</span>'
					} else if (source.status == 7) {
						source.status = '<span style="color:green">已答复</span>'
					} else if (source.status == 8) {
						source.status = '<span style="color:orange">申请撤回</span>'
					} else if (source.status == 9) {
						source.status = '<span style="color:green">已撤回</span>'
					}
					$('#' + key).html(source[key]);
					formatObjectionTypeView("#objectionType", source.objectionType);//下拉框信息反显
				};
				if (!source.submitTime) {
					$('#submitTime').html('-')
				};
				if (!source.answersDate) {
					$('#answersDate').html('-')
				};
				if (!fileUploads) {
					// 异议附件
					fileUploads = new StreamUpload("#fileContent", {
						businessId: source.id,
						status: 2,
						attachmentSetCode: 'REPLY_APPENDIX_FILE',
					}, top.config.AuctionHost);
				}
				if (!fileView) {
					fileView = new StreamUpload("#replayContent", {
						businessId: dataId,
						attachmentSetCode: 'ANSWERS_FILE',
						status: 2,
					}, top.config.AuctionHost);
				};
				// 答复附件
				if (!replyAppendixFileUpload) {
					replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
						businessId: dataId,
						status: 2,
						attachmentSetCode: 'NO_ACCEPT_FILE',
					}, top.config.AuctionHost);
				}
				//不予受理通知书
				if (!fileNo) {
					fileNo = new StreamUpload("#noAcceptContent", {
						businessId: dataId,
						status: 2,
						attachmentSetCode: 'NO_ACCEPT_FILE',
					}, top.config.AuctionHost);
				}
				var replyAppendixFile = [];
				
				if (source.projectAttachmentFiles) {
					var files = source.projectAttachmentFiles;
					for (var i = 0; i < files.length; i++) {
						if (files[i].modelName == 'OBJECTION_FILE') {
							fileData.push(files[i]);//异议附件
						} else if (files[i].modelName == 'ANSWERS_FILE') {
							replyData.push(files[i]);//答复附件
						} else if (files[i].modelName == 'NO_ACCEPT_FILE') {
							noAccept.push(files[i]);//不予受理通知书
						} else if (files[i].modelName == 'REPLY_APPENDIX_FILE') {
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
}

function getReplyList(id) {
	$.ajax({
		type: "get",
		url: replyUrl + '?answersId=' + id + '&' + parseUrlParam({
			examType: examType,
			tenderType: tenderType,
			enterpriseType: enterpriseType,
		}),
		async: true,
		success: function (data) {
			if (data.success) {
				var res = data.data;
				formatReplyList(res || []);
			}
		},
	});
}