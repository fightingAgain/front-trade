/**
*  zhouyan 
*  2019-6-2
*  查看异议
*  方法列表及功能描述
*/
var detailUrl = config.tenderHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
var fileDownloadUrl = config.FileHost + "/FileController/download.do";//文件下载
var replyUrl = config.tenderHost + "/ObjectionAnswersReplyController/list.do"; // 查询回复信息

var egisterInfo = entryInfo();
var dataId = '';//数据id
var bidId = '';//标段id
var fileUploads = null;//异议附件
var fileView = null;//答复附件
var replyAppendixFileUpload = null; // 异议答复附件
var fileNo = null;//不予受理通知书
var fileData = [];
var replyData = [];
var noAccept = [];
var status;//异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var examType; // 资格审查方式  预审还是后审
$(function () {
	//	initSelect('.select');
	status = $.getUrlParam('state');
	dataId = $.getUrlParam('dataId');
	examType = $.getUrlParam("examType");
	if (status == 1) {
		$('.back_reply').css({ 'display': 'none' });//异议状态
		$('.reply').css({ 'display': 'none' });//答复
		$('.back').css({ 'display': 'none' });//撤回说明
		$('.no_accept').css({ 'display': 'none' });//不予受理
	} else if (status == 3 || status == 2) {
		//		$('#sign_in').css({'display':'none'});
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
	/*if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
			businessId: dataId,
			status:1,
			businessTableName:'T_OBJECTION_ANSWERS',
			attachmentSetCode:'OBJECTION_FILE'
		});
	};*/
	//关闭
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
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
			'id': id
		},
		success: function (data) {
			if (data.success) {
				var source = data.data;
				bidId = source.bidSectionId;
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
					optionValueView("#objectionType", source.objectionType);//下拉框信息反显
				};
				if(!source.submitTime){
					$('#submitTime').html('-')
				};
				if(!source.answersDate){
					$('#answersDate').html('-')
				};
				if (!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						businessId: source.id,
						status: 2,
						//isPreview: true,    //false不可预览   true可预览
					});
				}
				if (!fileView) {
					fileView = new StreamUpload("#replayContent", {
						businessId: dataId,
						status: 2,
					});
				};
				// 答复附件
				if (!replyAppendixFileUpload) {
					replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
						businessId: dataId,
						status: 2,
					});
				}
				//不予受理通知书
				if (!fileNo) {
					fileNo = new StreamUpload("#noAcceptContent", {
						businessId: dataId,
						status: 2,
					});
				}
				var replyAppendixFile = [];
				if (source.projectAttachmentFiles) {
					var files = source.projectAttachmentFiles;
					for (var i = 0; i < files.length; i++) {
						if (files[i].attachmentSetCode == 'OBJECTION_FILE') {
							fileData.push(files[i]);//异议附件
						} else if (files[i].attachmentSetCode == 'ANSWERS_FILE') {
							replyData.push(files[i]);//答复附件
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
}

function getReplyList(id) {
	$.ajax({
		type: "get",
		url: replyUrl + '?answersId=' + id,
		async: true,
		success: function (data) {
			if (data.success) {
				var res = data.data;
				formatReplyList(res || []);
			}
		},
	});
}

function formatReplyList(list) {
	$('#multiple-reply-list').empty();
	var tableDiv = '';
	list.forEach(function (el) {
		var div = '';
		div += '<table class="table table-bordered ">'
		div += '<tr>'
		div += '<td class="th_bg">回复内容</td>'
		div += '<td colspan="3">'
		div += el.answersContent
		div += '</td>'
		div += '</tr>'
		div += '<tr>'
		div += '<td class="th_bg">附件</td>'
		div += '<td colspan="3">'
		div += formatFileTable(el.files)
		div += '</td>'
		div += '</tr>'
		div += '<tr>'
		div += '<td class="th_bg">回复人</td>'
		div += '<td>'
		div += el.answersEmployeeName;
		div += '</td>'
		div += '<td class="th_bg">回复时间</td>'
		div += '<td>'
		div += el.answersDate
		div += '</td>'
		div += '</tr>'
		div += '</table>'
		tableDiv += div;
	})
	$('#multiple-reply-list').html(tableDiv);
}

function formatFileTable(files) {
	if ((files || []).length == 0) {
		return '';
	}
	var trArr = [];
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var fileName = file.attachmentFileName || file.attachmentName;
		var suffix = fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + fileName + "</td>"
		strHtml += "<td >" + changeUnit(file.attachmentSize) + "</td>"
		strHtml += "<td >" + file.createEmployeeName + "</td>"
		strHtml += "<td >" + file.createDate + "</td>"
		strHtml += "<td style='text-align: center;'>";
		if (suffix == 'PNG' || suffix == 'JPG' || suffix == 'JPGE' || suffix == 'PDF') {
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + file.url + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		} else {
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + file.url + "','" + encodeURIComponent(fileName) + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>&nbsp;&nbsp;"
		}
		strHtml += "</td></tr>";
		trArr.push(strHtml);
	}

	var tableDiv = '';
	tableDiv += '<table class="table table-bordered" style="margin-bottom: 0;">'
	tableDiv += '<tr>'
	tableDiv += '<td style="width: 50px;">序号</td>'
	tableDiv += '<td>附件名称</td>'
	tableDiv += '<td style="width:120px; text-align:center">文件大小</td>'
	tableDiv += '<td>上传者</td>'
	tableDiv += '<td style="width:150px; text-align:center">上传时间</td>'
	tableDiv += '<td style="width:150px;text-align: center;">操作</td>'
	tableDiv += '</tr>'
	tableDiv += trArr.join('')
	tableDiv += '</table>'
	return tableDiv;
}


function changeUnit(size) {
	var num = Number(size);
	if (num >= 1024 * 1024 * 1024) {
		return (num / 1024 / 1024 / 1024).toFixed(2) + "G";
	} else if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
		return (num / 1024 / 1024).toFixed(2) + "M";
	} else if (num >= 1024 && num < 1024 * 1024) {
		return (num / 1024).toFixed(2) + "KB";
	} else {
		return num + "B";
	}
}

//下载
function downloadFile(filePath, fileName) {
	var newUrl = downloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

//预览
function showImage(filePath) {
	openPreview(filePath, "850px", "700px");
}