var str = $.query.get("id");
var examTypes;
var inviteStates;
var isPublics;
var isSigns;
var urlDownloadFile = top.config.bidhost + "/FileController/download.do"; //下载文件地址
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
$(function() {
	var tenderType = getQueryString("tenderType");
	if(tenderType == "0" || tenderType == "6") { //询价采购
		$("#auctionStartDatetr").hide(); //竞价递交行
		$("#fileEndDatetr").hide(); //文件终止行
		$("#fileCheckEndDatetr").hide(); //文件审核
		examTypes = JSON.parse(sessionStorage.getItem('examType'));
		inviteStates = JSON.parse(sessionStorage.getItem('inviteState'));
		isPublics = JSON.parse(sessionStorage.getItem('isPublic'));
		isSigns = JSON.parse(sessionStorage.getItem('isSign'));
	} else if(tenderType == "1") {
		$("#offerEndDatetr").hide(); //询价截止
		$("#checkEndDatetr").hide(); //审核截止
		$("#signEndDatetr").hide(); //报名截止时间
	} else if(tenderType == "2") { 
		$("#offerEndDatetr").hide(); //询价截止
		$("#checkEndDatetr").hide(); //审核截止
		$("#signEndDatetr").hide();	//报名截止时间
	}

	var para = {};
	if(tenderType == "0") {
		para.examType = examTypes;
		para.id = str;
	} else{
		para.id = str;
	}
	
	$.ajax({
		url: config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do',
		type: 'post',
		dataType: 'json',
		async: false,
		data: para,
		success: function(data) {
			if(data.success) {
				data = data.data;
				$("#title").html(data.title);
				if(data.isChangeDate == "0") {
					$("#isChangeDate").html('不变更');
					$("#supplementTime").hide();
				} else {
					$("#isChangeDate").html('变更');
					$("#noticeEndDate").html(data.noticeEndDate); //公告截止时间
					$("#oldNoticeEndDate").html(data.oldNoticeEndDate);
					if(tenderType == "0" || tenderType == "6") {
						if(examTypes == "0") {
							if(inviteStates == "0") {
								$(".pub_tr").hide();
								//$(".add_tr").hide();
								$(".file_tr").hide();
								if(isSigns == "1" && tenderType == "0") {
									$("#signEndDatetr").show();
									$("#signEndDate").html(data.signEndDate); //报名截止时间
									$("#oldSignEndDate").html(data.oldSignEndDate);
								} else {
									$("#signEndDatetr").hide();
								}
								$(".acceptEndDateDiv").hide();
								$("#examAskEndDate").html(data.examAskEndDate); //预审提出澄清截止时间
								$("#oldExamAskEndDate").html(data.oldExamAskEndDate);
								$("#examAnswersEndDate").html(data.examAnswersEndDate); //预审答复截止时间
								$("#oldExamAnswersEndDate").html(data.oldExamAnswersEndDate);
								$("#examCheckEndDate").html(data.examCheckEndDate); //预审评审截止时间
								$("#oldExamCheckEndDate").html(data.oldExamCheckEndDate);
								
							} else if(inviteStates == "1") {
								$("#noticeDiv").hide();
								$("#signEndDatetr").hide();
								$(".yqh").html("邀请函");
								$(".exam_tr").hide();
								//$(".add_tr").hide();
								$(".file_tr").hide();
								$("#offerEndDate").html(data.offerEndDate); //报价截止时间
								$("#oldOfferEndDate").html(data.oldOfferEndDate);
								$("#askEndDate").html(data.askEndDate); //提出澄清截止时间
								$("#oldAskEndDate").html(data.oldAskEndDate);
								$("#answersEndDate").html(data.answersEndDate); //答复截止时间
								$("#oldAnswersEndDate").html(data.oldAnswersEndDate);
								$("#checkEndDate").html(data.checkEndDate); //询价评审时间
								$("#oldCheckEndDate").html(data.oldCheckEndDate);
								$("#acceptEndDate").html(data.acceptEndDate); //接受邀请时间
								$("#oldAcceptEndDate").html(data.oldAcceptEndDate);
							}

						} else if(examTypes == "1") {
							if(isSigns == "1" && tenderType == "0") {
								$("#signEndDatetr").show();
								$("#signEndDate").html(data.signEndDate); //报名截止时间
								$("#oldSignEndDate").html(data.oldSignEndDate);
							} else {
								$("#signEndDatetr").hide();
							}
							$(".acceptEndDateDiv").hide();
							$(".exam_tr").hide();
							//$(".add_tr").hide();
							$(".file_tr").hide();
							$("#offerEndDate").html(data.offerEndDate); //报价截止时间
							$("#oldOfferEndDate").html(data.oldOfferEndDate);
							$("#askEndDate").html(data.askEndDate); //提出澄清截止时间
							$("#oldAskEndDate").html(data.oldAskEndDate);
							$("#answersEndDate").html(data.answersEndDate); //答复截止时间
							$("#oldAnswersEndDate").html(data.oldAnswersEndDate);
							$("#checkEndDate").html(data.checkEndDate); //询价评审时间
							$("#oldCheckEndDate").html(data.oldCheckEndDate);
							$("#signEndDate").html(data.signEndDate); //报名截止时间
							$("#oldSignEndDate").html(data.oldSignEndDate);
						}
					} else {
						$(".exam_tr").hide();
						$("#signEndDatetr").hide();
						$(".acceptEndDateDiv").hide();
						$("#auctionStartDate").html(data.auctionStartDate); //竞价开始时间
						$("#oldauctionStartDate").html(data.oldAuctionStartDate);
						$("#offerEndDate").html(data.offerEndDate); //报价截止时间
						$("#oldOfferEndDate").html(data.oldOfferEndDate);
						$("#askEndDate").html(data.askEndDate); //提出澄清截止时间
						$("#oldAskEndDate").html(data.oldAskEndDate);
						$("#answersEndDate").html(data.answersEndDate); //答复截止时间
						$("#oldAnswersEndDate").html(data.oldAnswersEndDate);
						$("#checkEndDate").html(data.fileCheckEndDate); //询价评审时间
						$("#oldCheckEndDate").html(data.oldFileCheckEndDate);
						$("#fileEndDate").html(data.fileEndDate); //竞价文件递交截止时间
						$("#oldfileEndDate").html(data.oldFileEndDate);
						$("#fileCheckEndDate").html(data.fileCheckEndDate); //竞价文件递交截止时间
						$("#oldfileCheckEndDate").html(data.oldFileCheckEndDate);
					}
				}
				$("#supplement").html(data.supplement);
				/*if(data.oldCheckEndDate == undefined) {
					$("#fileEndDatetr").hide()
					$("#fileCheckEndDatetr").hide()

				}*/
				//附件
				fileList=data.purFiles;
				if(data.purFiles.length > 0) {
					var strhtml = "";
					for(var i = 0; i < data.purFiles.length; i++) {
						var filesnames = data.purFiles[i].fileName.substring(data.purFiles[i].fileName.lastIndexOf(".") + 1).toUpperCase();
						strhtml += "<tr><td  colspan='2'  class='text-left'>" + data.purFiles[i].fileName + "</td>";
						strhtml += "<td><a href='javascript:void(0)'  class='btn btn-primary btn-xs' onclick='downloadFile(\"" + i + "\")'>下载</a>"
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
							strhtml += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='viewfile(\"" + i + "\")'>预览</a>";
						}
						strhtml += "</td></tr>";
					}
					$("#supplementfile").append(strhtml);
				} else {
					$("#supplementfile").append("<tr><td colspan='4'>暂无数据</td></tr>");
				}

				//审核信息
				if(data.workflowItems.length > 0) {
					var strhtml = "";
					for(var i = 0; i < data.workflowItems.length; i++) {
						if(data.workflowItems[i].workflowResult == "0") {
							strhtml += "<tr><td>通过</td>";
						} else {
							strhtml += "<tr><td>不通过</td>";
						}
						if(data.workflowItems[i].workflowContent == undefined) {
							strhtml += "<td align='center'>无</td>";
						} else {
							strhtml += "<td  class='text-left'>" + data.workflowItems[i].workflowContent + "</td>";
						}
						strhtml += "<td>" + data.workflowItems[i].userName + "</td>";
						strhtml += "<td>" + data.workflowItems[i].subDate + "</td></tr>";
					}
					$("#supplementworkflowItems").append(strhtml);
				} else {
					$("#supplementworkflowItems").append("<tr><td colspan='4'>暂无数据</td></tr>");
				}
			}
		}
	});
	$.ajax({
		url: findEnterpriseInfo,
		type: 'get',
		dataType: 'json',
		async: false,
		success: function(data) {}
	});
});

function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}

//下载文件
function downloadFile($index) {
	var fname=fileList[$index].fileName,ftpPath=fileList[$index].filePath;
	var newUrl = urlDownloadFile + "?ftpPath=" + ftpPath + "&fname=" + fname;
	window.location.href = $.parserUrlForToken(newUrl);
}
//新开网页浏览pdf
function viewfile($index) {
	openPreview(fileList[$index].filePath)
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + filePath));
}