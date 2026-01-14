var str = getQueryString("id");
var isFile = getQueryString("isFile");
var urlDownloadFile = top.config.FileHost + "/FileController/download.do"; //下载文件地址
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
var fileList;
$(function() {	
	if(isFile != "" && isFile == '1') {
		$(".offerEndDateDiv").hide();
		$(".offerEndDateDiv").hide();
	}
	var para = {};
	para.id = str;
	
	$.ajax({
		url: config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do',
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
					$("#auctionStartDate").html(data.auctionStartDate); //竞卖开始时间
					$("#oldAuctionStartDate").html(data.oldAuctionStartDate);
					$("#offerEndDate").html(data.offerEndDate); //报价截止时间
					$("#oldOfferEndDate").html(data.oldOfferEndDate);
					$("#askEndDate").html(data.askEndDate); //提出澄清截止时间
					$("#oldAskEndDate").html(data.oldAskEndDate);
					$("#answersEndDate").html(data.answersEndDate); //答复截止时间
					$("#oldAnswersEndDate").html(data.oldAnswersEndDate);
					$("#checkEndDate").html(data.fileCheckEndDate); //询比评审时间
					$("#oldCheckEndDate").html(data.oldFileCheckEndDate);
					$("#fileEndDate").html(data.fileEndDate); //竞卖文件递交截止时间
					$("#oldfileEndDate").html(data.oldFileEndDate);
					$("#fileCheckEndDate").html(data.fileCheckEndDate); //竞卖文件递交截止时间
					$("#oldfileCheckEndDate").html(data.oldFileCheckEndDate);
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
							strhtml += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='viewfile(\"" +i + "\")'>预览</a>";
						}
						strhtml += "</td></tr>";
					}
					$("#supplementfile").html(strhtml);
				} else {
					$("#supplementfile").html("<tr><td colspan='4'>暂无数据</td></tr>");
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
					$("#supplementworkflowItems").html(strhtml);
				} else {
					$("#supplementworkflowItems").html("<tr><td colspan='4'>暂无数据</td></tr>");
				}
				//判断是否存在回执单，有回执单显示回执单按钮
				if(data.pdfUrl){
					pdfUrl=data.pdfUrl
					$('#btnViewPDF').show()
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
function downloadFile(i) {
	var fname=flieList[i].fileName,ftpPath=flieList[i].filePath
	var newUrl = urlDownloadFile + "?ftpPath=" + ftpPath + "&fname=" + fname;
	window.location.href = $.parserUrlForToken(newUrl);
}
//新开网页浏览pdf
function viewfile(i) {
	openPreview(flieList[i].filePath)
}
//预览澄清回执
function btnViewPDF(){
	parent.openPreview(pdfUrl);
}