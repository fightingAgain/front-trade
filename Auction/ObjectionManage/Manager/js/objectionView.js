/**

 *  编辑、添加异议
 *  方法列表及功能描述
 */
var bidHtml = "bidPrice/ObjectionManage/Bidder/model/bidList.html"; //选择包件
var addReplyPopHtml = 'bidPrice/ObjectionManage/Manager/model/addReplyPop.html';//查看
var saveUrl = config.AuctionHost + "/ObjectionAnswersController/saveObjection.do"; //保存
var detailUrl = config.AuctionHost + "/ObjectionAnswersController/getAndFile.do"; //反显时的详情接口
var replyUrl = config.AuctionHost + "/ObjectionAnswersReplyController/list.do"; // 查询回复信息

var canReplyUrl = config.AuctionHost + "/ObjectionAnswersReplyController/isCanReply.do"; // 判断是否可以回复

var egisterInfo = entryInfo();
var dataId = ""; //数据id
var fileUploads = null; //异议附件
var fileView = null; //答复函
var replyAppendixFileUpload = null; // 异议答复附件
var fileNo = null; //不予受理通知书
var status; //异议状态：0-保存未提交（可以再次编辑），1-已提交未签收，2-已提交已签收，3-已签收未受理，4-已签收已受理，5-已签收不予受理（可以再次编辑），6-已受理未答复，7-已受理已答复，8-未签收申请撤回，9-已撤回
var examType; // 资格审查方式  预审还是后审
var tenderType;
var enterpriseType;
var packageId; // 包件ID
var onlyView = $.getUrlParam("onlyView");//是否仅查看
var baseInfo = {};
var isShowResult = $.getUrlParam('isShowResult');//是否展示异议处理功能 1 显示 0 不显示
$(function () {
	if(isShowResult == 0){
		$(".yycljg").hide()
	}
	dataId = $.getUrlParam("dataId");
	status = $.getUrlParam("state");
	examType = $.getUrlParam("examType");
	tenderType = $.getUrlParam('tenderType');
	enterpriseType = $.getUrlParam('enterpriseType');
	packageId = $.getUrlParam("packageId");
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
	getDetail(dataId);
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
			content: addReplyPopHtml + '?dataId=' + dataId + '&state=' + status + '&bidId=' + packageId + '&' + parseUrlParam({
				examType: examType,
				tenderType: tenderType,
				enterpriseType: enterpriseType,
				isShowResult: isShowResult,
			}),
			resize: true,
			success: function (layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
			},
			end: function() {
				getDetail(dataId);
				getReplyList(dataId);
				parent.parent.$('#tableList').bootstrapTable('refresh');
			}
		});
	})

	doPackageView(tenderType);
});
//信息反显
function getDetail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			id: id,
			examType: examType,
			tenderType: tenderType,
			enterpriseType: enterpriseType,
		},
		success: function (data) {
			if (data.success) {
				var source = data.data;
				baseInfo = data.data;
				packageId = source.packageId;
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
					formatObjectionTypeView("#objectionType", source.objectionType); //下拉框信息反显
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
					}, top.config.AuctionHost);
				}
				//答复函
				if (!fileView) {
					fileView = new StreamUpload("#replayContent", {
						businessId: dataId,
						status: 2,
					}, top.config.AuctionHost);
				}
				// 答复附件
				if (!replyAppendixFileUpload) {
					replyAppendixFileUpload = new StreamUpload("#replyAppendixFile", {
						businessId: dataId,
						status: 2,
					}, top.config.AuctionHost);
				}
				//不予受理通知书
				if (!fileNo) {
					fileNo = new StreamUpload("#noAcceptContent", {
						businessId: dataId,
						status: 2,
					}, top.config.AuctionHost);
				}

				var fileData = [];
				var replyData = [];
				var noAccept = [];
				var replyAppendixFile = [];
				if (source.projectAttachmentFiles) {
					var files = source.projectAttachmentFiles;
					for (var i = 0; i < files.length; i++) {
						if (files[i].modelName == "OBJECTION_FILE") {
							fileData.push(files[i]); //异议附件
						} else if (files[i].modelName == "ANSWERS_FILE") {
							replyData.push(files[i]); //答复附件
						} else if (files[i].modelName == "NO_ACCEPT_FILE") {
							noAccept.push(files[i]); //不予受理通知书
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
		},
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
	if (status != 7) {
		return;
	}
	$.ajax({
		type: "get",
		url: canReplyUrl + '?packageId=' + packageId + '&' + parseUrlParam({
			examType: examType,
			tenderType: tenderType,
			enterpriseType: enterpriseType,
		}),
		async: false,
		success: function (data) {
			if (data.success) {
				var res = data.data;
				// source.isCanReply = true;
				if (res && !baseInfo.isOver) {
					$('#btnAddReply').show();
				} else {
					$('#btnAddReply').hide();
				}
			}
		},
	});
}
