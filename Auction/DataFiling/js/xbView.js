
var detailUrl = top.config.AuctionHost + "/OutSidesController/findDetailList.do";

var fileDownloadUrl = top.config.FileHost + "/FileController/download.do";	//下载文件
var examType = 2;  //1是预审，2是后审
var tenderType = 2;
$(function(){
	if($.getUrlParam("tenderType") && $.getUrlParam("tenderType") != "undefined"){
   		tenderType = $.getUrlParam("tenderType");
   		
   	}
	//关闭
	$("#btnClose").click(function(){
		var index = top.parent.layer.getFrameIndex(window.name);
        top.parent.layer.close(index);
	});
	
	$("#examType li").click(function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		examType = $(this).attr("data-val");
		if(examType == 0){
			$("#before").show();
			$("#after").hide();
		} else {
			$("#before").hide();
			$("#after").show();
		}
//		$("table [id]").html("暂无信息");
	});
});

function passMessage(data){
	var param = {
		'packageId': data.packageId ? data.packageId : "",
	    'tenderType': tenderType
	}
	examType = data.examType;
	if(examType == 0){
		$("#after").hide();
		$("#before").show();
		$("#examType").show();
		$(".noticeTit").html("邀请函");
	} else if(examType == 1){
		$("#after").show();
		$("#before").hide();
		$(".afterBlock").show();
		if(data.tenderType == 1){
			$(".inviteBlock").hide();
			$(".noticeTit").html("邀请函");
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
			if(examType == 0){
				tit = "Before";
			}
			
			//项目立项
			
			//项目信息
			if(data.packageName){
				var html = "";
				html += data.projectCode ? '项目编号：<span class="txt">'+data.projectCode+'</span>' : "";
				html += data.projectName ? '项目名称：<span class="txt">'+data.projectName+'</span>' : "";
				html += data.packageNum ? '包件编号：<span class="txt">'+data.packageNum+'</span>' : "";
				html += data.packageName ? '包件名称：<span class="txt">'+data.packageName+'</span>' : "";
				$("#bidSection" + tit).html(html);
			}
			
			
			//公告后审
			if(data.remark){
				var html = "";
				html += data.noticeStartDate ? '公告开始时间：<span class="txt">'+data.noticeStartDate+'</span>' : "";
				html += data.noticeEndDate ? '公告结束时间：<span class="txt">'+data.noticeEndDate+'</span>' : "";
				var noticeStr = data.remark ? data.remark.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.remark ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#notice").html(html);
			}
			//公告预审
			if(data.examRemark){
				var html = "";
				html += data.noticeStartDate ? '公告开始时间：<span class="txt">'+data.noticeStartDate+'</span>' : "";
				html += data.noticeEndDate ? '公告结束时间：<span class="txt">'+data.noticeEndDate+'</span>' : "";
				var noticeStr = data.examRemark ? data.examRemark.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.examRemark ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#notice" + tit).html(html);
			}
			
			//结果公示预审
			if(data.noticeContent1){
				var html = "";
				html += data.openStartDate1 ? '公告开始时间：<span class="txt">'+data.openStartDate1+'</span>' : "";
				html += data.opetEndDate1 ? '公告结束时间：<span class="txt">'+data.opetEndDate1+'</span>' : "";
				var noticeStr = data.noticeContent1 ? data.noticeContent1.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.noticeContent1 ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#resultPublic" + tit).html(html);
			}
			//结果公示后审
			if(data.noticeContent2){
				var html = "";
				html += data.openStartDate2 ? '公告开始时间：<span class="txt">'+data.openStartDate2+'</span>' : "";
				html += data.opetEndDate2 ? '公告结束时间：<span class="txt">'+data.opetEndDate2+'</span>' : "";
				var noticeStr = data.noticeContent2 ? data.noticeContent2.replace(/&nbsp;/g, "&nbsp; ") : "";
				html += data.noticeContent2 ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				$("#resultPublic").html(html);
			}
			
			
			//预审文件
			if(data.examBidFiles && data.examBidFiles.length > 0){
				var html = "";
				for(var i = 0; i < data.examBidFiles.length; i++){
					var item = data.examBidFiles[i]
					var road = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+item.filePath+'&fname='+(item.fileName ? item.fileName : "").replace(/\s+/g,""));
					html += item.filePath ? item.fileName+'<a class="btn btn-primary btn-xs" href="'+road+'" style="margin:0 10px 0 5px;">下载</a>' : "";
				}
				$("#file" + tit).html(html);
			}
			//后审文件
			if(data.bidFiles && data.bidFiles.length > 0){
				var html = "";
				for(var i = 0; i < data.bidFiles.length; i++){
					var item = data.bidFiles[i]
					var road = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+item.filePath+'&fname='+(item.fileName ? item.fileName : "").replace(/\s+/g,""));
					html += item.filePath ? item.fileName+'<a class="btn btn-primary btn-xs" href="'+road+'" style="margin:0 10px 0 5px;">下载</a>' : "";
				}
				$("#file").html(html);
			}
			//报价询价
			if(data.bidOffers && data.bidOffers.length > 0){
				var html = "";
				for(var i = 0; i < data.bidOffers.length; i++){
					var item = data.bidOffers[i]
					html += item.supplierName ? '企业名称：<span class="txt">'+item.supplierName+'</span>' : "";
					html += item.priceTotal ? '价格：<span class="txt">'+item.priceTotal+'</span>' : "";
				}
				$("#sign").html(html);
			}
			//竞价
			if(data.auctionOffers && data.auctionOffers.length > 0){
				var html = "";
				for(var i = 0; i < data.auctionOffers.length; i++){
					var item = data.auctionOffers[i]
					html += item.enterpriseName ? '企业名称：<span class="txt">'+item.enterpriseName+'</span>' : "";
					html += item.offerMoney ? '价格：<span class="txt">'+item.offerMoney+'</span>' : "";
				}
				$("#auction").html(html);
			}
			
			//评标预审
			if(data.examCheckEndDate){
				var html = "";
				html += data.examCheckEndDate ? '评审时间：<span class="txt">'+data.examCheckEndDate+'</span>' : "";
				$("#review" + tit).html(html);
			}
			//评标后审
			if(data.checkEndDate){
				var html = "";
				html += data.checkEndDate ? '评审时间：<span class="txt">'+data.checkEndDate+'</span>' : "";
				$("#review").html(html);
			}
			
			

			// 结果通知预审
			if(data.examBidResults && data.examBidResults.length > 0){
				var html = "";
//				html += item.notificationTitle ? '通知标题：<span class="txt">'+item.notificationTitle+'</span>' : "";
//				html += item.notificationTime ? '通知时间：<span class="txt">'+item.notificationTime+'</span>' : "";
				for(var i = 0; i < data.examBidResults.length; i++){
					var item = data.examBidResults[i];
					var noticeStr = item.resultContent ? item.resultContent.replace(/&nbsp;/g, "&nbsp; ") : "";
					html += item.resultContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				}
				$("#resultNotice" + tit).html(html);
			}
			// 结果通知后审
			if(data.bidResults && data.bidResults.length > 0){
				var html = "";
				for(var i = 0; i < data.bidResults.length; i++){
					var item = data.bidResults[i];
					var noticeStr = item.resultContent ? item.resultContent.replace(/&nbsp;/g, "&nbsp; ") : "";
					html += item.resultContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				}
				$("#resultNotice").html(html);
			}
			//结果通知竞价
			if(data.auctionResults && data.auctionResults.length > 0){
				var html = "";
				for(var i = 0; i < data.auctionResults.length; i++){
					var item = data.auctionResults[i];
					var noticeStr = item.resultContent ? item.resultContent.replace(/&nbsp;/g, "&nbsp; ") : "";
					html += item.resultContent ? '<div class="noticeW" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;padding:10px;margin-top:20px;">'+noticeStr+'</div>' : "";
				}
				$("#resultNotice").html(html);
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
