/**

 *  编辑、添加异议
 *  方法列表及功能描述
 */
var bidHtml = "Bidding/ObjectionManage/Bidder/model/bidList.html"; //选择标段
var addReplyPopHtml = 'Bidding/ObjectionManage/Manager/model/addReplyPop.html';//查看
var saveUrl = config.tenderHost + "/ObjectionAnswersController/saveObjection.do"; //保存
var detailUrl = config.tenderHost + "/ObjectionAnswersController/getAndFile.do"; //反显时的详情接口
var replyUrl = config.tenderHost + "/ObjectionAnswersReplyController/list.do"; // 查询回复信息
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var canReplyUrl = config.tenderHost + "/ObjectionAnswersReplyController/isCanReply.do"; // 判断是否可以回复

var egisterInfo = entryInfo();
var dataId = ""; //数据id
var fileUploads = null; //异议附件
var fileView = null; //答复函
var replyAppendixFileUpload = null; // 异议答复附件
var fileNo = null; //不予受理通知书
var status; //异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var examType; // 资格审查方式  预审还是后审
var bidSectionId, objectionType; // 标段ID
var onlyView = $.getUrlParam("onlyView");//是否仅查看
var baseInfo = {};
var isShowResult = $.getUrlParam('isShowResult');//是否展示异议处理功能 1 显示 0 不显示
$(function () {
	if(isShowResult == 0){
		$(".yycljg").hide()
	}
	dataId = $.getUrlParam("dataId");
	status = $.getUrlParam("state");
	// examType = $.getUrlParam("examType");
	bidSectionId = $.getUrlParam("bidSectionId");
	objectionType = $.getUrlParam('objectionType');//"1":"资格预审文件","4":"招标文件","5":"开标","7":"中标候选人公示"
	examType = objectionType ==1?'1':'2';
	if (status == 1) {
		$(".after_sign").css({ display: "none" }); //异议状态
		$(".reply").css({ display: "none" }); //回复
		$(".back").css({ display: "none" }); //撤回
		$(".no_accept").css({ display: "none" }); //不予受理
	} else if (status == 3 || status == 2) {
		$(".after_sign").css({ display: "table-row" }); //异议状态
		$(".reply").css({ display: "none" }); //回复
		$(".back").css({ display: "none" }); //撤回
		$(".no_accept").css({ display: "none" }); //不予受理
	} else if (status == 4 || status == 6 || status == 7) {
		$(".back").css({ display: "none" });
		$(".no_accept").css({ display: "none" });
		$(".after_sign").css({ display: "table-row" });
		$(".reply").css({ display: "table-row" });
	} else if (status == 5) {
		$(".after_sign").css({ display: "table-row" }); //异议状态
		$(".reply").css({ display: "none" }); //回复
		$(".back").css({ display: "none" }); //撤回
		$(".no_accept").css({ display: "table-row" }); //不予受理
	} else if (status == 8 || status == 9) {
		$(".after_sign").css({ display: "table-row" }); //异议状态
		$(".reply").css({ display: "none" }); //回复
		$(".back").css({ display: "table-row" }); //撤回
		$(".no_accept").css({ display: "none" }); //不予受理
	}
	isShowSupplierInfo(bidSectionId, examType, '', function(data){
		if(data.isShowSupplier == 1 || data.isShowBidFile ==1){
			getDetail(dataId, '1');
		}else{
			getDetail(dataId, '0');
		}
	})
	getReplyList(dataId);
	//关闭
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	// 新增回复
	$("#btnAddReply").click(function () {
		parent.layer.open({
			type: 2,
			title: '新增回复',
			area: ['80%', '60%'],
			content: addReplyPopHtml + '?dataId=' + dataId + '&state=' + status + '&examType=' + examType + '&bidId=' + bidSectionId+'&isShowResult='+isShowResult,
			resize: true,
			success: function (layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
			},
			end() {
				isShowSupplierInfo(bidSectionId, examType, '', function(data){
					if(data.isShowSupplier == 1 || data.isShowBidFile ==1){
						getDetail(dataId, '1');
					}else{
						getDetail(dataId, '0');
					}
				})
				getReplyList(dataId);
				parent.parent.$('#tableList').bootstrapTable('refresh');
			}
		});
	})
});
//信息反显
function getDetail(id, isShowSupplier) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			'id': id,
			'isShowSupplier': isShowSupplier
		},
		success: function (data) {
			if (data.success) {
				baseInfo = data.data;
				var source = data.data;
				bidSectionId = source.bidSectionId;
				for (var key in source) {
					if (source.status == 0) {
						source.status = "未提交";
					} else if (source.status == 1) {
						source.status = "未签收";
					} else if (source.status == 2) {
						source.status = '<span style="color:green">已签收</span>';
					} else if (source.status == 3) {
						source.status = "<span>未受理</span>";
					} else if (source.status == 4) {
						source.status = '<span style="color:green">已受理</span>';
					} else if (source.status == 5) {
						source.status = '<span style="color:red">不予受理</span>';
					} else if (source.status == 6) {
						source.status = "<span>未答复</span>";
					} else if (source.status == 7) {
						source.status = '<span style="color:green">已答复</span>';
					} else if (source.status == 8) {
						source.status = '<span style="color:orange">申请撤回</span>';
					} else if (source.status == 9) {
						source.status = '<span style="color:green">已撤回</span>';
					}
					$("#" + key).html(source[key]);
					if(key == 'isOver'){
						$("#" + key).html(source[key]==1?'是':'否');
						if(source[key] == 1){
							$(".objection_result").show()
						}
					}else if(key == 'results'){
						$("#" + key).html(dealResultTypeDict[source[key]]);
					}
					optionValueView("#objectionType", source.objectionType); //下拉框信息反显
				}
				if (!source.submitTime) {
					$("#submitTime").html("-");
				}
				if (!source.answersDate) {
					$("#answersDate").html("-");
				}
				//异议附件
				if (!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						businessId: dataId,
						status: 2,
						//isPreview: true,    //false不可预览   true可预览
					});
				}
				//答复函
				if (!fileView) {
					fileView = new StreamUpload("#replayContent", {
						businessId: dataId,
						status: 2,
					});
				}
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

				var fileData = [];
				var replyData = [];
				var noAccept = [];
				var replyAppendixFile = [];
				if (source.projectAttachmentFiles) {
					var files = source.projectAttachmentFiles;
					for (var i = 0; i < files.length; i++) {
						if (files[i].attachmentSetCode == "OBJECTION_FILE") {
							fileData.push(files[i]); //异议附件
						} else if (files[i].attachmentSetCode == "ANSWERS_FILE") {
							replyData.push(files[i]); //答复附件
						} else if (files[i].attachmentSetCode == "NO_ACCEPT_FILE") {
							noAccept.push(files[i]); //不予受理通知书
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
		},
	});
}

function getReplyList(id) {
	$.ajax({
		type: "get",
		url: replyUrl + '?answersId=' + id,
		async: false,
		success: function (data) {
			if (data.success) {
				var res = data.data;
				formatReplyList(res || []);
			}
		},
	});
	if(!onlyView){
		doCanReply();
	}
}

function doCanReply() {
	// 已答复状态才可能展示新增回复按钮
	if (status != 7) {
		return;
	}
	$.ajax({
		type: "get",
		url: canReplyUrl + '?bidSectionId=' + bidSectionId + '&examType=' + examType,
		async: false,
		success: function (data) {
			if (data.success) {
				var res = data.data;
				// source.isCanReply = true;
				if (res && !baseInfo.isOver ) {
					$('#btnAddReply').show();
				} else {
					$('#btnAddReply').hide();
				}
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