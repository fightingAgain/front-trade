
var detailUrl = top.config.tenderHost + "/GXController/findProject.do";

var fileDownloadUrl = top.config.FileHost + "/FileController/download.do";	//下载文件
var examType = 2;  //1是预审，2是后审
var examTypeStatus;
$(function(){
//	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
// 		examType = $.getUrlParam("examType");
// 		
// 	}
	//关闭
	$("#btnClose").click(function(){
		var index = top.parent.layer.getFrameIndex(window.name);
        top.parent.layer.close(index);
	});
	
	$("#examType li").click(function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		var val = $(this).attr("data-val");
		if(val == 1){
			$("#before").show();
			$("#after").hide();
			getDetail({
				bidSectionId:bidSectionId,
				examType: val
			});
		} else {
			$("#before").hide();
			$("#after").show();
			if(examTypeStatus && examTypeStatus == 2){
				getDetail({
					bidSectionId:bidSectionId,
					examType: val
				});
			}
		}
		$("table [id]").html("暂无信息");
		
	});
});

function passMessage(data){
	var param = {
		'bidSectionId': data.id ? data.id : "",
	    'examType': data.examType ? data.examType : ""
	}
	bidSectionId = data.id;
	examType = data.examType;
	if(examType == 1){
		$("#after").hide();
		$("#before").show();
		$("#examType").show();
		$(".inviteBlock").hide();
		$(".noticeTit").html("邀请公告");
		examTypeStatus = data.examTypeStatus;
	} else if(examType == 2){
		$("#after").show();
		$("#before").hide();
		$(".afterBlock").show();
		if(data.tenderType == "2"){
			$(".inviteBlock").hide();
			$(".noticeTit").html("邀请公告");
		}
	}
	
	getDetail(param);
}

//详情,后审
function getDetail(param){
	$.ajax({
		type: "post",
		url: detailUrl,
		data:param,
		success: function(rst) {
			if(!rst.success) {
				parent.layer.alert(rst.message);
				return;
			}
			if(!rst.data){
				return;
			}
			var data = rst.data;
			var tit = "";
			if(examType == 1){
				tit = "Before";
			}
			
			
			//项目信息
			if(data.interiorBidSectionCode){
				var html = "";
				html += data.interiorTenderProjectCode ? '招标项目编号：<span class="txt">'+data.interiorTenderProjectCode+'</span>' : "";
				html += data.tenderProjectName ? '招标项目名称：<span class="txt">'+data.tenderProjectName+'</span>' : "";
				html += data.interiorBidSectionCode ? '标段编号：<span class="txt">'+data.interiorBidSectionCode+'</span>' : "";
				html += data.bidSectionName ? '标段名称：<span class="txt">'+data.bidSectionName+'</span>' : "";
				$("#bidSection" + tit).html(html);
			}
			
			//邀请函
			if(data.bidInviteIssueContent){
				var html = "";
				var noticeStr = data.bidInviteIssueContent ? data.bidInviteIssueContent.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.bidInviteIssueContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#notice" + tit).html(html);
			}
			//招标公告
			if(data.noticeContent){
				var html = "";
				var noticeStr = data.noticeContent ? data.noticeContent.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.noticeContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#notice" + tit).html(html);
			}
			//文件
			if(data.url){
				var html = "";
				var road = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+data.url+'&fname='+(data.docFile ? data.docFile : "").replace(/\s+/g,""));
				html += data.url ? '<a class="btn btn-primary btn-sm" href="'+road+'">下载</a>' : "";
				$("#file" + tit).html(html);
			}
			//变更补遗
			if(data.docClarifyDtos && data.docClarifyDtos.length > 0){
				var html = "";
				var item = data.docClarifyDtos;
				for(var i = 0; i < item.length; i++){
					var road = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+item[i].url+'&fname='+(item[i].docName ? item[i].docName : "").replace(/\s+/g,""));
					html += data.url ? (item[i].docName ? item[i].docName : "") + '<a style="margin-right:20px;" class="btn btn-primary btn-sm" href="'+road+'">下载</a>' : "";
				}
				$("#fileChange" + tit).html(html);
			}
			//开标
			if(data.bidOpenTime){
				var html = "";
				html += data.bidOpenTime ? '开标时间：<span class="txt">'+data.bidOpenTime+'</span>' : "";
				$("#open" + tit).html(html);
			}
			//评标
			if(data.checkStartDate){
				var html = "";
				html += data.checkStartDate ? '评审时间：<span class="txt">'+data.checkStartDate+'</span>' : "";
				$("#review" + tit).html(html);
			}
			//投标文件
			if(data.bidFiles && data.bidFiles.length > 0){
				var html = '<table class="table table-bordered"><tr><th style="width:50px;">序号</th><th>投标人</th><th>投标文件</th></tr>';
				for(var i = 0; i < data.bidFiles.length; i++){
					var item = data.bidFiles[i];
					var road = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+item.url+'&fname='+item.bidFileName.replace(/\s+/g,""));
					html += '<tr><td>'+(i+1)+'</td><td>'+item.supplierName+'</td><td><a class="btn btn-primary btn-xs" href="'+road+'">下载</a></td></tr>'
				}
				html += '</table>';
				$("#getFile" + tit).html(html);
			}
			//答疑会
			if(data.answerNoticeContent){
				var html = "";
				var noticeStr = data.answerNoticeContent ? data.answerNoticeContent.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.answerNoticeContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#answer" + tit).html(html);
			}

			//保证金
			if(data.bidderDeposits){
				var item = data.bidderDeposits;
				var html = "";
				if(item.length > 0){
					for(var i = 0; i < item.length; i++){
						html += item[i].bidderName ? '投标人：<span class="txt">'+item[i].bidderName+'</span>' : "";
						html += item[i].depositMoney ? '保证金：<span class="txt">'+item[i].depositMoney+'元</span><br/>' : "";
					}
					$("#bond" + tit).html(html);
				}
			}
			//澄清
			if(data.clarifys){
				var item = data.clarifys;
				var html = "";
				if(item.length > 0){
					for(var i = 0; i < item.length; i++){
						html += item[i].clarifyTitle ? '澄清标题：<span class="txt">'+item[i].clarifyTitle+'</span>' : "";
						html += item[i].clarifyContent ? '澄清内容：<span class="txt">'+item[i].clarifyContent+'</span><br/>' : "";
						
					}
					$("#clear" + tit).html(html);
				}
			}
			//评委会组建
			if(data.experts){
				var item = data.experts;
				var html = "评委：";
				if(item.length > 0){
					for(var i = 0; i < item.length; i++){
						html += item[i].expertName ? '<span class="txt">'+item[i].expertName+'</span>' : "";
					}
					$("#judges" + tit).html(html);
				}
			}
			//异议
			if(data.objectionAnswersDtos){
				var item = data.objectionAnswersDtos;
				if(item.length > 0){
					
					var html = '<table class="table table-bordered"><tr><th style="width:50px;">序号</th><th>异议标题</th><th>异议内容</th><th>回复标题</th><th>回复内容</th></tr>';
					for(var i = 0; i < data.objectionAnswersDtos.length; i++){
						var item = data.objectionAnswersDtos[i];
						html += '<tr><td>'+(i+1)+'</td><td>'+(item.objectionTitle ? item.objectionTitle : "")+'</td><td>'+(item.objectionContent ? item.objectionContent : "")+'</td><td>'+(item.answersTitle ? item.answersTitle : "")+'</td><td>'+(item.answersContent ? item.answersContent : "")+'</td></tr>'
					}
					html += '</table>';
					$("#objection" + tit).html(html);
				}
			}
			
			
			//中标候选人
			if(data.publicityContent){
				var html = "";
				var noticeStr = data.publicityContent ? data.publicityContent.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.publicityContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#winBid" + tit).html(html);
			}
			
			//结果通知
			if(data.resultNoticeItems && data.resultNoticeItems.length > 0){
				var html = "";
				var item = data.resultNoticeItems;
				if(item.length > 0){
					for(var i = 0; i < item.length; i++){
						var noticeStr = item[i].resultNotic ? item[i].resultNotic.replace(/&nbsp;/g, "&nbsp; ") : "";
						html += item[i].resultNotic ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
					}
				}
				

				$("#resultNotice" + tit).html(html);
			}
			// 合同
			if(data.zcontractApproval){
				var item = data.zcontractApproval;
				var html = "";
				html += item.contractTitle ? '合同名称：<span class="txt">'+item.contractTitle+'</span>' : "";
				html += item.contractMoney ? '合同金额：<span class="txt">'+item.contractMoney+'万元</span>' : "";
				html += item.signingDate ? '签订日期：<span class="txt">'+item.signingDate+'</span>' : "";
				html += item.contractExecutionStatus ? '合同执行状态：<span class="txt">'+item.contractExecutionStatus+'</span>' : "";
				$("#contract" + tit).html(html);
			}
			// 项目验收
			if(data.projectAccept){
				var item = data.projectAccept;
				var html = "";
				html += item.acceptDeptmentName ? '验收组织部门：<span class="txt">'+item.acceptDeptmentName+'</span>' : "";
				html += item.acceptEmployeeName ? '组织人：<span class="txt">'+item.acceptEmployeeName+'</span>' : "";
				html += item.acceptDate ? '验收时间：<span class="txt">'+item.acceptDate+'</span>' : "";
				html += item.lastApprover ? '验收最终批准人：<span class="txt">'+item.lastApprover+'</span>' : "";
				html += item.ratifyDate ? '批准时间：<span class="txt">'+item.ratifyDate+'</span>' : "";
				$("#acceptance" + tit).html(html);
			}
			// 付款情况
			if(data.contractPay){
				var item = data.contractPay;
				var html = "";
				html += item.payeeEnterpriseName ? '收款单位名称：<span class="txt">'+item.payeeEnterpriseName+'</span>' : "";
				html += item.payeeAccount ? '收款帐号：<span class="txt">'+item.payeeAccount+'</span>' : "";
				html += item.totalAmount ? '总金额：<span class="txt">'+item.totalAmount+'万元</span>' : "";
				$("#payment" + tit).html(html);
			}
		}
	});
}
