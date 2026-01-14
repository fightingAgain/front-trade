
var saveUrl = config.tenderHost + '/ObjectionAnswersReplyController/save.do'; //保存

var egisterInfo = entryInfo();
var dataId = ""; // 数据id
var bidId = ""; // 标段id
var replyAppendixFileUpload = null; // 回复附件上传控件
var replyFileList = []; // 回复附件数据
var examType; // 资格审查方式  预审还是后审
var isShowResult;

// Object.assign
if (typeof Object.assign != 'function') {
	Object.assign = function (target, varArgs) {
		// .length of function is 2
		if (target == null) {
			// TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) {
				// Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
}

$(function () {
	dataId = $.getUrlParam("dataId");
	bidId = $.getUrlParam("bidId");
	examType = $.getUrlParam("examType");
	isShowResult = $.getUrlParam("isShowResult")
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

	});

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
		for(let i = 0; i < replyFileList.length; i++) {
			var file = replyFileList[i];
			if (file.msg) {
				try {
					var realFile = JSON.parse(file.msg).data;
					Object.assign(file, realFile);
				} catch (error) {
					console.error(error);
				}
			}
			files.push({
				attachmentCount: 1,
				attachmentName: file.name,
				attachmentFileName: file.name,
				attachmentType: file.name.split(".").pop(),
				url: file.filePath,
				attachmentState: 1,
				md5Code: file.md5Code,
				size: file.size,
			})
		}
		params.files = files;
		params.bidSectionId = bidId;
		params.examType = examType;
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