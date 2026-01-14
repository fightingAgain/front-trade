
var saveUrl = config.AuctionHost + '/ObjectionAnswersReplyController/save.do'; //保存

var egisterInfo = entryInfo();
var dataId = ""; // 数据id
var bidId = ""; // 包件id
var replyAppendixFileUpload = null; // 回复附件上传控件
var replyFileList = []; // 回复附件数据
var examType; // 资格审查方式  预审还是后审
var tenderType;
var enterpriseType;
var isShowResult;
$(function () {
	dataId = $.getUrlParam("dataId");
	bidId = $.getUrlParam("bidId");
	examType = $.getUrlParam("examType");
	tenderType = $.getUrlParam('tenderType');
	enterpriseType = $.getUrlParam('enterpriseType');
	isShowResult = $.getUrlParam('isShowResult');
	const businessId = 'TEMP_' + Date.now() + Math.random().toString().replace('.', '');
	replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
		basePath: "/" + egisterInfo.enterpriseId + "/" + bidId + "/" + dataId + "/221",
		businessId: businessId,
		browseFileId: 'replyAppendixFileUpload',  //上传按钮
		status: 4,
		businessTableName: 'T_OBJECTION_ANSWERS',
		attachmentSetCode: 'MULTIPLE_REPLY_FILE',
		changeFile: function (data) {
			//有文件操作是，返回方法，data为文件列表
			replyFileList = data;
		},

	}, top.config.AuctionHost);

	if(isShowResult == 1){
		$(".objection_deal").show();
		dealResultSelect()
	}

	$("#btnSubmit").click(function () {
		handleConfirm();
	});

	$("#btnClose").click(function () {
		handleClose();
	});
});
// 提交数据
function handleConfirm() {
	$('.reply_check').attr('datatype', '*');
	if (checkForm($("#baseForm"))) { 	// 必填验证，在公共文件unit中
		var isOver = $('[name=isOver]:checked').val();
		if(isShowResult == 1 && isOver == undefined){
			parent.layer.alert("温馨提醒：请选择异议处理完毕！")
			return
		}
		var params = parent.serializeArrayToJson($("#baseForm").serializeArray());
		params.answersId = dataId;
		var files = [];
		for (let i = 0; i < replyFileList.length; i++) {
			var file = replyFileList[i];
			if (file.msg) {
				try {
					var realFile = JSON.parse(file.msg).data;
					Object.assign(file, realFile);
				} catch (error) {

				}
			}
			files.push({
				fileName: file.name,
				bidValue1: file.md5Code,
				bidValue2: file.name.split(".").pop(),
				filePath: file.filePath,
				fileSize: file.size,
			})
		}
		params.files = files;
		params.packageId = bidId;
		params.examType = examType;
		params.tenderType = tenderType;
		params.enterpriseType = enterpriseType;
		var loading = parent.layer.load();
		$.ajax({
			type: "post",
			url: saveUrl,
			async: false,
			data: params,
			success: function (data) {
				parent.layer.close(loading);
				if (data.success) {
					handleClose();
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function() {
				parent.layer.close(loading);
			}
		});
	}
}

function handleClose() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
}