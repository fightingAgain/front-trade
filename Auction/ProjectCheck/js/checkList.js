/*
 * 页面加载，绑定Table数据源
 * */
var urlProjectCheckList = top.config.AuctionHost + '/ProjectViewsController/findProjectCheckList.do'; //项目审核分页地址
$(function() {

	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});
	//两个下拉框事件
	$("#packageState,#tenderType,#workflowType").change(function() {

		$('#ProjectAuditTable').bootstrapTable('refresh');
	});

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
		switch(row.tenderType) {
			case 0: //询比	
			case 6: //单一来源	
				if(row.workflowType == "xmgg") { //项目公告
					var contentUrl = 'bidPrice/ProjectCheck/modal/ProjectCheckListInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "xmby") { //项目公告变更
					if(row.noticeType == 0) { //公告变更
						var contentUrl = 'bidPrice/ProjectCheck/modal/purchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
		
					} else { //邀请函变更
						var contentUrl = 'bidPrice/ProjectCheck/modal/examPurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=detailed&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
					}
				}
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //预审/采购文件
					var contentUrl = 'bidPrice/ProjectCheck/modal/fileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&id=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "kzjsp") { //控制价
					var contentUrl = 'bidPrice/ProjectCheck/modal/controlPriceView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed';
				}
				if(row.workflowType == "psxbg") { //评审变更
					var contentUrl = 'bidPrice/ProjectCheck/modal/PSfileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&id=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "psbg") { //评审报告
					var contentUrl = 'bidPrice/ProjectCheck/modal/RaterReportCheckInfo.html?key=' + row.id + '&edittype=detailed&examType=' + row.examType + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
				}
				if(row.workflowType == 'fzbcnsqdsz' || row.workflowType == 'fzbpsbgqdsz'){//非招标承诺书签订设置
					var contentUrl = 'bidPrice/ProjectCheck/modal/statements.html?key=' + row.id + '&edittype=detailed&examType=' + row.examType + '&packageId=' + row.packageId + '&projectId=' + row.projectId+'&workflowType='+row.workflowType;
				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/BidNoticeCheckListInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					var contentUrl = 'bidPrice/ProjectCheck/modal/BidResultCheckInfo.html?key=' + row.id + '&edittype=detailed' + '&purExamType=' + row.purExamType + '&tenderTypeCode=' + row.tenderType;
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType='+ row.tenderType;
				}
				if(row.workflowType == "zlgd") { //项目异常
					if(row.examType==1){
						var contentUrl = 'bidPrice/ProjectCheck/modal/DataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType='+ row.tenderType+'&projectId=' + row.projectId;
					}else{
						var contentUrl = 'bidPrice/ProjectCheck/modal/examTypeDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType='+ row.tenderType+'&projectId=' + row.projectId;
					}
					
				}
				break;
			case 1: //竞价
				if(row.workflowType == "xmgg") {
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionCheckListInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "xmby") { //竞价补遗
					if(row.supplementType == 3) {
						var contentUrl = 'bidPrice/ProjectCheck/modal/jjChangeCheck.html?id=' + row.id + '&edittype=detailed&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SupplementAuctionCheckListInfo.html?key=' + row.id + '&edittype=detailed&tenderType=1';
					}
				}
				if(row.workflowType == "jjqk") { //竞价情况
					if(row.auctionStatus == '已结束') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look&tender=1';
					} else {
						if(row.auctionStatus == '未开始') {
							layer.alert("竞价未开始!");
							return;
						}
						var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look';
					}
				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionNoticeCheckListInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionResultCheckInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "jjhq") { //结果通知书
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionResultCheckInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType=1';
				}
				if(row.workflowType == "zlgd") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/auctionDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType=1&projectId=' + row.projectId;
				}
				break;
			case 2: //竞卖
				if(row.workflowType == "xmgg") {
					if((row.groupCode != null || row.groupCode != '' || row.groupCode != undefined) && row.groupCode == '00270012') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/JMSaleCheckListInfo.html?key=' + row.id + '&edittype=detailed'
					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleCheckListInfo.html?key=' + row.id + '&edittype=detailed'
					}
				}
				if(row.workflowType == "xmby") { //竞卖补遗
					if(row.supplementType == 2) {
						var contentUrl = 'bidPrice/ProjectCheck/modal/jmChangeCheck.html?id=' + row.id + '&edittype=detailed&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
					} else{
						var contentUrl = 'bidPrice/ProjectCheck/modal/SupplementAuctionCheckListInfo.html?key=' + row.id + '&edittype=detailed&tenderType=2' + '&supplementType=' + row.supplementType;
					}
				}
				if(row.workflowType == "jjqk") { //竞卖情况
					if(row.auctionStatus == '已结束') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look&tender=2';
					} else {
						if(row.auctionStatus == '未开始') {
							layer.alert("竞卖未开始!");
							return;
						}
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look';
					}
				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/SaleNoticeCheckListInfo.html?key=' + row.id + '&edittype=detailed';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					if((row.groupCode != null || row.groupCode != '' || row.groupCode != undefined) && row.groupCode == '00270012') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/JMSaleResultCheckInfo.html?key=' + row.id + '&edittype=detailed' + '&packageId=' + row.packageId;
					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=detailed' + '&packageId=' + row.packageId;
					}
		
				}
				//废旧物资竞卖销售单
				if(row.workflowType == "fjwz_xsd") {
					var contentUrl = "bidPrice/ProjectCheck/modal/SaleCheckXsdInfo.html?projectId=" + row.projectId + '&edittype=detailed';
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType=2';
				}
				if(row.workflowType == "zlgd") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/SaleDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed&tenderType=2&projectId=' + row.projectId;
				}
				break;
			case 5: //竞争谈判
				if(row.workflowType == "jztp_ggxx") {
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=audit&tenderType=5&edittype=detailed' + '&pulice=' + row.isPublic
				}
				if(row.workflowType == "jztp_xmby") { //竞争谈判补遗
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?key=' + row.id + '&edittype=detailed&tenderType=2' + '&packageId=' + row.packageId + '&pulice=' + row.isPublic;
				}
				if(row.workflowType == "jztp_tpwj") { //竞争谈判文件
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtfileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&key=' + row.id + '&packageId=' + row.packageId + '&edittype=detailed';
				}
				// if(row.workflowType=="jjqk"){//竞卖情况
				//     if(row.auctionStatus == '已结束'){
				//         var contentUrl='bidPrice/ProjectCheck/modal/SaleOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId+'&id='+row.id + '&type=look&tender=2';                        
				//     }else{
				//         if(row.auctionStatus == '未开始'){
				//             layer.alert("竞卖未开始!");
				//             return;
				//         }
				//         var contentUrl='bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId+'&id='+row.id + '&type=look';              
				//     }
				// }
				// if(row.workflowType=="jggs"){//结果公示
				//     var contentUrl='bidPrice/ProjectCheck/modal/SaleNoticeCheckListInfo.html?key=' + row.id + '&edittype=detailed';	
				// }
				// if(row.workflowType=="jgtzs"){//结果通知书
				//     var contentUrl='bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=detailed';
				// }			
				break;
		}
		
		top.layer.open({
			type: 2,
			area: ["100%", "100%"],
			maxmin: true,
			resize: false,
			title: "查看",
			content: contentUrl,
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj" || row.workflowType == "psxbg") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	},
	"click .audit": function(e, value, row, index) {
		switch(row.tenderType) {
			case 0: //询比
			case 6: //单一来源
				if(row.workflowType == "xmgg") { //项目公告
					var contentUrl = 'bidPrice/ProjectCheck/modal/ProjectCheckListInfo.html?key=' + row.id + '&edittype=audit'
				}
				if(row.workflowType == "xmby") { //项目公告变更
					if(row.noticeType == 0) { //公告变更
						var contentUrl = 'bidPrice/ProjectCheck/modal/purchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
					} else { //邀请函变更
						var contentUrl = 'bidPrice/ProjectCheck/modal/examPurchaseChangeCheckListInfo.html?id=' + row.id + '&edittype=audit&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
					}
				}
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
					var contentUrl = 'bidPrice/ProjectCheck/modal/fileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&id=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "kzjsp") { //控制价
					var contentUrl = 'bidPrice/ProjectCheck/modal/controlPriceView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit';
				}
				if(row.workflowType == "psxbg") { //评审变更
					var contentUrl = 'bidPrice/ProjectCheck/modal/PSfileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&id=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "psbg") { //评审报告
					var contentUrl = 'bidPrice/ProjectCheck/modal/RaterReportCheckInfo.html?key=' + row.id + '&edittype=audit&examType=' + row.examType + '&packageId=' + row.packageId + '&projectId=' + row.projectId;
				}
				if(row.workflowType == 'fzbcnsqdsz' || row.workflowType == 'fzbpsbgqdsz'){//非招标承诺书签订设置
					var contentUrl = 'bidPrice/ProjectCheck/modal/statements.html?key=' + row.id + '&edittype=audit&examType=' + row.examType + '&packageId=' + row.packageId + '&projectId=' + row.projectId+'&workflowType='+row.workflowType;
				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/BidNoticeCheckListInfo.html?key=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					var contentUrl = 'bidPrice/ProjectCheck/modal/BidResultCheckInfo.html?key=' + row.id + '&edittype=audit' + '&purExamType=' + row.purExamType + '&tenderTypeCode=' + row.tenderType;
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=' + row.tenderType;
				}
				if(row.workflowType == "zlgd") { //资料归档
					if( row.examType==1){
						var contentUrl = 'bidPrice/ProjectCheck/modal/DataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=' + row.tenderType+'&projectId=' + row.projectId;
					}else{
						var contentUrl = 'bidPrice/ProjectCheck/modal/examTypeDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=' + row.tenderType+'&projectId=' + row.projectId;
					}
					
				}
				break;
			case 1: //竞价
				if(row.workflowType == "xmgg") {
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionCheckListInfo.html?key=' + row.id + '&edittype=audit'
				}
				if(row.workflowType == "xmby") { //竞卖补遗
					if(row.supplementType == 3) {
						var contentUrl = 'bidPrice/ProjectCheck/modal/jjChangeCheck.html?id=' + row.id + '&edittype=audit&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId + '&tenderType=' + row.tenderType;

					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SupplementAuctionCheckListInfo.html?key=' + row.id + '&edittype=audit&tenderType=1&timeOut=' + row.isTimeOut;
					}

				}
				if(row.workflowType == "jjqk") { //竞价情况
					if(row.auctionStatus == '已结束') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=check&tender=1';
					} else {
						if(row.auctionStatus == '未开始') {
							layer.alert("竞卖未开始!");
							return;
						}
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look';
					}

				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionNoticeCheckListInfo.html?key=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					var contentUrl = 'bidPrice/ProjectCheck/modal/AuctionResultCheckInfo.html?key=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=1';
				}
				if(row.workflowType == "zlgd") { //资料归档
					var contentUrl = 'bidPrice/ProjectCheck/modal/auctionDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=' + row.tenderType+'&projectId=' + row.projectId;				
				}
				break;
			case 2: //竞卖
				if(row.workflowType == "xmgg") {
					if((row.groupCode != null || row.groupCode != '' || row.groupCode != undefined) && row.groupCode == '00270012') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/JMSaleCheckListInfo.html?key=' + row.id + '&edittype=audit'
					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleCheckListInfo.html?key=' + row.id + '&edittype=audit';
					}

				}
				if(row.workflowType == "xmby") { //竞卖补遗
					if(row.supplementType == 3) {
						var contentUrl = 'bidPrice/ProjectCheck/modal/jmChangeCheck.html?id=' + row.id + '&edittype=audit&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId + '&tenderType=' + 2;

					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SupplementAuctionCheckListInfo.html?key=' + row.id + '&edittype=audit&tenderType=2&timeOut=' + row.isTimeOut;
					}

				}
				if(row.workflowType == "jjqk") { //竞卖情况
					if(row.auctionStatus == '已结束') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=check&tender=2';
					} else {
						if(row.auctionStatus == '未开始') {
							layer.alert("竞卖未开始!");
							return;
						}
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId + '&id=' + row.id + '&type=look';
					}
				}
				if(row.workflowType == "jggs") { //结果公示
					var contentUrl = 'bidPrice/ProjectCheck/modal/SaleNoticeCheckListInfo.html?key=' + row.id + '&edittype=audit';
				}
				if(row.workflowType == "jgtzs") { //结果通知书
					if((row.groupCode != null || row.groupCode != '' || row.groupCode != undefined) && row.groupCode == '00270012') {
						var contentUrl = 'bidPrice/ProjectCheck/modal/JMSaleResultCheckInfo.html?key=' + row.id + '&edittype=audit' + '&packageId=' + row.packageId;
					} else {
						var contentUrl = 'bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=audit' + '&packageId=' + row.packageId;
					}
				}
				//废旧物资竞卖销售单
				if(row.workflowType == "fjwz_xsd") {
					var contentUrl = "bidPrice/ProjectCheck/modal/SaleCheckXsdInfo.html?projectId=" + row.projectId + '&edittype=audit';
				}
				if(row.workflowType == "xmyc") { //项目异常
					var contentUrl = 'bidPrice/ProjectCheck/modal/abnormalView.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=2';
				}
				if(row.workflowType == "zlgd") { //资料归档
					var contentUrl = 'bidPrice/ProjectCheck/modal/SaleDataFilingInfo.html?workflowType=' + row.workflowType + '&id=' + row.id + '&packageId=' + row.packageId + '&edittype=audit&tenderType=' + row.tenderType+'&projectId=' + row.projectId;;					
				}
				break;
			case 5: //竞争谈判
				if(row.workflowType == "jztp_ggxx") { //公告
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=audit&tenderType=5' + '&pulice=' + row.isPublic;
				}
				if(row.workflowType == "jztp_xmby") { //竞争谈判补遗
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtpurchaseChangeCheckListInfo.html?key=' + row.id + '&edittype=audit&isTimeOut=' + row.isTimeOut + '&packageId=' + row.packageId + '&projectId=' + row.projectId + '&pulice=' + row.isPublic;
				}
				if(row.workflowType == "jztp_tpwj") { //竞争谈判文件
					var contentUrl = 'bidPrice/ProjectCheck/modal/JtfileCheckInfo.html?workflowType=' + row.workflowType + '&purExamType=' + row.examType + '&key=' + row.id + '&packageId=' + row.packageId + '&edittype=audit';
				}
				// if(row.workflowType=="xmby"){//竞卖补遗
				//     var contentUrl='bidPrice/ProjectCheck/modal/SupplementAuctionCheckListInfo.html?key=' + row.id + '&edittype=audit&tenderType=2&timeOut='+row.isTimeOut;
				// }
				// if(row.workflowType=="jjqk"){//竞卖情况
				//     if(row.auctionStatus == '已结束'){
				//         var contentUrl='bidPrice/ProjectCheck/modal/SaleOfferHistoryInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId+'&id='+row.id + '&type=check&tender=2';                        
				//     }else{
				//         if(row.auctionStatus == '未开始'){
				//             layer.alert("竞卖未开始!");
				//             return;
				//         }
				//         var contentUrl='bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html?projectId=' + row.projectId + '&packageId=' + row.packageId+'&id='+row.id + '&type=look';              
				//     }                                            
				// }
				// if(row.workflowType=="jggs"){//结果公示
				//     var contentUrl='bidPrice/ProjectCheck/modal/SaleNoticeCheckListInfo.html?key=' + row.id + '&edittype=audit';
				// }	
				// if(row.workflowType=="jgtzs"){//结果通知书
				//     var contentUrl='bidPrice/ProjectCheck/modal/SaleResultCheckInfo.html?key=' + row.id + '&edittype=audit';
				// }
				break;
		}
		top.layer.open({
			type: 2,
			area: ["100%", "100%"],
			maxmin: true,
			resize: false,
			title: "审核",
			content: contentUrl,
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj" || row.workflowType == "psxbg") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	}
}
//设置查询条件
function queryParams(params) {
	var para = {
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'workflowType': $("#workflowType").val(),
		'projectState': $("#packageState").val(),
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'tenderType': $("#tenderType").val()
	};
	return para;
}
//查询列表
$("#ProjectAuditTable").bootstrapTable({
	url: urlProjectCheckList,
	dataType: 'json',
	method: 'get',
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	clickToSelect: true, //是否启用点击选中行
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: queryParams, //查询条件参数
	striped: true,
	columns: [{
			title: '序号',
			align: 'center',
			width: "50px",
			formatter: function(value, row, index) {
				var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					if(row.tenderType == 1) {
						var projectName = '<span style="white-space: normal;">' + row.projectName + '</span><span class="text-danger" style="font-weight:bold">(重新竞价)</span>';
					} else if(row.tenderType == 2) {
						var projectName = '<span style="white-space: normal;">' + row.projectName + '</span><span class="text-danger" style="font-weight:bold">(重新竞卖)</span>';
					}
				} else {
					var projectName = '<span style="white-space: normal;">' + row.projectName + '</span>';
				}
				return projectName;
			}
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '200'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		},
		{
			field: 'workflowType',
			title: '审核类型',
			align: 'left',
			width: '200',
			formatter: function(value, row, index) {
				switch(value) {
					case 'fjwz_xsd':
						return "<div>废旧物资竞卖销售单</div>";
						break;
					case 'xmgg':
						if(row.tenderType == 0) {
							if(row.examType == 0) {
								return "<div>询比预审公告审核</div>";
							} else {
								if(row.inviteState == 1) {
									return "<div>询比后审邀请函审核</div>";
								} else {
									return "<div>询比后审公告审核</div>";
								}
							}
						} else if(row.tenderType == 1) {
							return "<div>竞价公告</div>";
						} else if(row.tenderType == 2) {
							return "<div>竞卖公告</div>";
						} else if(row.tenderType == 6) {
							return "<div>单一来源公告审核</div>";
						}
						break;
					case 'xmby':
						if(row.tenderType == 0) {
							if(row.noticeType == 0) {
								return "<div>询比公告变更</div>";
							}
							if(row.noticeType == 1) {
								return "<div>询比邀请函变更</div>";
							}
						} else if(row.tenderType == 1) {
							if(row.supplementType==3){
								return "<div>竞价公告变更</div>";
							}else{
								return "<div>竞价补遗</div>";
							}
							
						} else if(row.tenderType == 2) {
							if(row.supplementType==3){
								return "<div>竞卖公告变更</div>";
							}else{
								return "<div>竞卖补遗</div>";
							}
						} else if(row.tenderType == 6) {
							return "<div>单一来源公告变更</div>";
						}
						break;
					case 'zgyswj':
						return "<div>资格预审文件</div>";
						break;
					case 'xjcgwj':
						if(row.tenderType == 0) {
							return "<div>询比采购文件</div>";
						} else if(row.tenderType == 6) {
							return "<div>单一来源采购文件</div>";
						}
						break;
					case 'psbg':
						if(row.examType == 0) {
							return "<div>资格预审评审报告</div>";
						} else {
							return "<div>评审报告</div>";
						}

						break;
					case 'psxbg':
						return "<div>询比评审项变更</div>";
						break;
					case 'jjqk':
						if(row.tenderType == 1) {
							return "<div>竞价情况</div>";
						}
						if(row.tenderType == 2) {
							return "<div>竞卖情况</div>";
						}
						break;
					case 'jggs':
						if(row.tenderType == 0) {
							return "<div>询比结果公示</div>";
						} else if(row.tenderType == 1) {
							return "<div>竞价结果公示</div>";
						} else if(row.tenderType == 2) {
							return "<div>竞卖结果公示</div>";
						} else if(row.tenderType == 6) {
							return "<div>单一来源结果公示</div>";
						}
						break;
					case 'jgtzs':
						if(row.tenderType == 0) {
							return "<div>询比结果通知书</div>";
						} else if(row.tenderType == 1) {
							return "<div>竞价结果通知书</div>";
						} else if(row.tenderType == 2) {
							return "<div>竞卖结果通知书</div>";
						} else if(row.tenderType == 6) {
							return "<div>单一来结果通知书</div>";
						}
						break;
					case 'jztp_ggxx':
						if(row.tenderType == 5) {
							if(row.isPublic == 0 || row.isPublic == 1) {
								return "<div>谈判采购公告信息</div>";
							}
							if(row.isPublic == 2 || row.isPublic == 3) {
								return "<div>谈判邀请函</div>";
							}
						}
						break;
					case 'jztp_xmby':
						if(row.tenderType == 5) {
							if(row.isPublic == 0 || row.isPublic == 1) {
								return "<div>谈判采购项目补遗</div>";
							}
							if(row.isPublic == 2 || row.isPublic == 3) {
								return "<div>谈判邀请函项目补遗</div>";
							}
						}
						break;
					case 'jztp_tpwj':
						if(row.tenderType == 5) {
							return "<div>谈判采购文件</div>";
						}
						break;
					case 'kzjsp':
						if(row.tenderType == 0 || row.tenderType == 6) {
							return "<div>控制价</div>";
						}
						break;
					case 'xmyc':
						return "<div>项目异常</div>";
						break;
					case 'zlgd':
						return "<div>资料归档</div>";
						break;
					case 'fzbcnsqdsz':
						return "<div>非招标承诺书签订设置</div>";
						break;
					case 'fzbpsbgqdsz':
						return "<div>非招标评审报告签订设置</div>";
						break;
						

				}
			}
		},
		{
			field: 'userName',
			title: '项目经理',
			align: 'left',
			width: '100',
		},
		{
			field: 'subDate',
			title: '创建时间',
			align: 'center',
			width: '180'
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == "0") {
					return "<div class='text-info'>未审核</div>"
				} else if(value == "1") {
					return "<div class='text-warning'>待审核</div>"
				} else if(value == "2") {
					return "<div class='text-success'>审核通过</div>"
				} else if(value == "3") {
					return "<div class='text-danger'>审核未通过</div>"
				}
			}
		},
		{
			field: '#',
			title: '操作',
			align: 'center',
			width: '80',
			events: openAudit,
			formatter: function(value, row, index) {
				if(row.checkState == "2" || row.checkState == "3") {
					return "<button type='button'  class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				} else {
					return "<button type='button'  class='btn btn-xs btn-primary audit'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>审核</button>";
				}

			}
		}
	]
});