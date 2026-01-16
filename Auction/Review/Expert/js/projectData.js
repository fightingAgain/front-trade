/*
 */ 
var findPurchaseUrl=top.config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var projectData=[];
var projectSupplementList=[];
var packageInfo="";
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var fileUp;//报价表
var purExamType;
var isShowCard='1', isShowScreen='1';
$(function(){
	//<<专家评审页面增加操作说明 >>  最新评审时间在该功能上线时间后的标段/包件展示该说明，之前的不展示  2024.2.2
	if(progressList.isShowExplain && progressList.isShowExplain == 1){
		$('.showExplain').show();
	}else{
		$('.showExplain').hide();
	}
	var supplierLinkData = getHideSupplierLinkBidPriceCard(projectId,packageId,'0',examType);
	isShowCard=supplierLinkData.isShowCard||supplierLinkData.isShowCard==0?supplierLinkData.isShowCard:1;
	isShowScreen=supplierLinkData.isShowScreen||supplierLinkData.isShowScreen==0?supplierLinkData.isShowScreen:1;
	Purchase(projectId);
    // du(packageId, examType);
	isShowSupplierInfo(projectId, packageId, examType, 'review', '0', function(data, html){
		if(data.isShowSupplier == 1){
			if(examType == 1){
				$('.showIP').show();
				$('.showWarningList').show();
				reviewWarnLists();
				getMachineList();
			};
		}else{
			$('.showWarningList, .showIP').hide();
		}
		du(packageId, examType, data.isShowSupplier);
	})
	
	if(purExamType==0&&examType==1){
		supplimentInt();
	}else{
		if(packageInfo.isPublic<2){	
			suppliment();
		}else{		
			supplimentInt();
		}
	}	
    /*start报价*/
   	if(examType == 1){
		offerFormData();
		fileList();
	}
	/*end报价*/
})
//获取询比公告发布的数据
function Purchase(uid){		
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':uid,
			
		},
		success: function(data) {			
			if(data.success){
				projectData=data.data;
				_THISID=_thisId;
				purExamType=projectData.examType;
				PurchaseData();
			}
		}
	});	
	
};
function PurchaseData(){
	 //渲染公告的数据
    $('div[id]').each(function(){
        $(this).html(projectData[this.id]);
    });
    
    if(projectData.projectType==0){
        $('.engineering').show()
    }else{
        $('.engineering').hide()
    }
    if(projectData.isAgent==1){
        $('.isAgent1').show()
    }else{
        $('.isAgent1').hide()
    }                 
}
//打开弹出框时加载的数据和内容。
function du(uid, examType, isShowSupplier){
	$.ajax({
	   	url:top.config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){	   	  	
                packageInfo=data.data;//包件信息
                for(var i=0;i<packageInfo.projectSupplement.length;i++){
					if(packageInfo.projectSupplement[i].examType==examType){	   	  			
						//if(packageInfo.projectSupplement[i].checkState==2){
							projectSupplementList.push(packageInfo.projectSupplement[i])
						//}	   	  			
					}
				}
				// if(packageInfo.reviewSetting && tenderType == 0 && packageInfo.reviewSetting.show == 1){
					// $('.showIP').show();
					/* 数据处理 同一供应商去重、不同供应商相同标红、白名单标绿  */
					/* if(packageInfo.ipOfferList && packageInfo.ipOfferList.length > 0){
						var newList = packageInfo.ipOfferList;
						for(var i = 0; i < newList.length;i++){
							//去重
							newList[i].downIp = removeRepeat(newList[i].ipBidFileDownloadList);
							newList[i].uploadIp = removeRepeat(newList[i].ipOfferFileList);
						};
						//不同供应商相同标红、白名单标绿
						for(var h = 0; h < newList.length;h++){
							newList[h].downIpList = [];
							newList[h].uploadIpList = [];
							for( var j = 0;j < newList[h].downIp.length;j++){
								var newDownObj = {};
								if(packageInfo.whiteListHisList && packageInfo.whiteListHisList.length > 0){
									//有白名单时下载数据处理
									newDownObj = creatFlage(newList[h].downIp[j], newList, 'down', h, packageInfo.whiteListHisList);
								}else{
									//无白名单时下载数据处理
									newDownObj = creatFlage(newList[h].downIp[j], newList, 'down', h);
								}
								if(!$.isEmptyObject(newDownObj)){
									newList[h].downIpList.push(newDownObj);
								}
							}
							for( var k = 0;k < newList[h].uploadIp.length;k++){
								var newUploadObj = {};
								if(packageInfo.whiteListHisList && packageInfo.whiteListHisList.length > 0){
									//有白名单时上传数据处理
									newUploadObj = creatFlage(newList[h].uploadIp[k], newList, 'upload', h, packageInfo.whiteListHisList);
								}else{
									//无白名单时上传数据处理
									newUploadObj = creatFlage(newList[h].uploadIp[k], newList, 'upload', h);
								}
								if(!$.isEmptyObject(newUploadObj)){
									newList[h].uploadIpList.push(newUploadObj);
								}
								
							}
							
						};
						tableForIp(newList);
					}; */
				// }else{
				// 	// $('.showIP').hide();
				// }
			}
	   	},
	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	package(isShowSupplier);
};

/*====ajax请求获取包件信息的数据获取====*/
function package(isShowSupplier){
	if(purExamType==0&&examType==1){
		examMontageHtml()
	}else{
		montageHtml();
	}
    for(key in packageInfo){
		$("#"+key).html(packageInfo[key]);
		if(reg.test(packageInfo[key])){
			$("#"+key).html(packageInfo[key].substring(0,16));
		}
	}
	$("#remark").html(packageInfo.remark);
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
//	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');
	$("#examtypeName").html(packageInfo.examType==0?'资格预审':'资格后审');
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "含在代理服务费中（代理机构承担）":(packageInfo.feeUnderparty == 2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付"));
	$("#tax").html(packageInfo.tax);
	if(packageInfo.packageSource==1){
		$("#isSupplierCount").show();
		$("input[name='supplierCount']").val(packageInfo.supplierCount)
	}else{
		$("#supplierCount").show()
	}
	if(packageInfo.isPublic==0){
 		$("#isPublic").html("所有供应商");
 	}
 	if(packageInfo.isPublic==1){
 		$("#isPublic").html("所有本公司认证供应商");
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅限邀请供应商");
 	}
 	if(packageInfo.isPublic==3){
 		$("#isPublic").html("仅邀请本公司认证供应商");
	};

	if(examType==1){
 		if(packageInfo.checkPlan==0){
	 		var checkPlans="综合评分法";
	 		
	 	}else if(packageInfo.checkPlan==1){
	 		var checkPlans="最低评标价法";
	 		
	 	}else if(packageInfo.checkPlan==2){
	 		var checkPlans="经评审的最低价法(价格评分)";
	 		
	 	}else if(packageInfo.checkPlan==3){
			var checkPlans="最低投标价法";
		}else if(packageInfo.checkPlan==4){
			var checkPlans="经评审的最高投标价法";
		}else if(packageInfo.checkPlan==5){
			var checkPlans="经评审的最低投标价法";
		}	 	
	 $("#remark").html(packageInfo.examRemark);
 	}else if(examType==0){
 		if(packageInfo.examCheckPlan==0){
	 		var checkPlans="合格制";	
	 	}else if(packageInfo.examCheckPlan==1){
	 		var checkPlans="有限数量制";	
	 	};
	 	
	 	 $("#remark").html(packageInfo.remark);
 	}; 	
	 $("#checkPlan").html(checkPlans);	
	if(packageInfo.options.length>0){
		// var optionText=[]
		// for(var i=0;i<packageInfo.options.length;i++){
		// 	optionText.push(packageInfo.options[i].optionText)
		// 	// dist+=packageInfo.options[i].optionText+(i==0&&packageInfo.options.length>1?'、':"")	
		// }
		
		// $("#optionNamesdw").html(optionText.join('，'))
		var options = packageInfo.options;
		var stage = '';

		var optionText = [];
		var emptyText = [];
		
		for(var i=0;i<options.length;i++){
			if (stage == options[i].stage) {
				optionText.push(options[i].optionText);
			}
			if (!options[i].stage) {
				emptyText.push(options[i].optionText);
			}	
		}
		if (optionText.length == 0) {
			optionText = emptyText;
		}
		
		$("#optionNamesdw").html(optionText.join('，'))
	}else{
		$("#optionNamesdw").html('无')
	}	
	getProjectPrice(isShowSupplier);	
	//start 招标代理服务费
	if(packageInfo.openServiceFee == 1){
		for(var key in packageInfo.projectServiceFee){
			if(key == "collectType"){
				$("#collectType").html(packageInfo.projectServiceFee[key]==1?"标准累进制":(packageInfo.projectServiceFee[key]==2?"其他":"固定金额"));
			} else {
				$("#" + key).html(packageInfo.projectServiceFee[key]);
			}
		}
	}
	//end 招标代理服务费
};

function suppliment(){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
	// if(projectSupplementList.length==0){
		
		List='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告开始时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="noticeStartDate"></div>'    			
     		+'</td>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="noticeEndDate"></div> '   			
     		+'</td>'
     	+'</tr>'
     	if(packageInfo.isSign==1){	       
     		List+='<tr>'
     				List+='<td class="th_bg" style="width:220px;">报名开始时间</td>'
					+'<td  style="text-align: left;">'
						+'<div id="signStartDate"></div>'				
					+'</td>'
					List+='<td class="th_bg" style="width:220px;">报名截止时间</td>'
					+'<td  style="text-align: left;">'
						+'<div id="signEndDate"></div>'				
					+'</td>'					
				+'</tr>' 
	     	} 
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'examAskEndDate':'askEndDate')+'"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'examAnswersEndDate':'answersEndDate')+'"></div>'     			
     		+'</td >'
     	+'</tr>' 
	             	
     	List+='<tr>'	     		
	     		if(examType==0){     			      
	 			List+='<td style="width:220px;" class="th_bg">资格预审申请文件递交截止时间</td>'
	     		+'<td class="newTime" style="text-align: left;">'
	     			+'<div id="submitExamFileEndDate"></div> '    			
	     		+'</td>'
	     		}else{
	     			List+='<td style="width:220px;" class="th_bg"><span>报价截止时间</span></td>'
		     		+'<td  style="text-align: left;">'
		     			+'<div  id="offerEndDate"></div>'
		     		+'</td>'
	     		}
	     	   List+='<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审时间': reviewStartTimeLabel)+'</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="'+(examType==0?'examCheckEndDate':'checkEndDate')+'"></div>'	
	     		+'</td>'
	       +'</tr>'
	/* }else if(projectSupplementList.length>0){
		List='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告开始时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="noticeStartDate"></div>'    			
     		+'</td>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldNoticeEndDate"></div> '   			
     		+'</td>'
     	+'</tr>'
 	 	if(packageInfo.isSign==1){	       
     		List+='<tr>'
     				List+='<td class="th_bg" style="width:220px;">报名开始时间</td>'
					+'<td  style="text-align: left;">'
						+'<div id="oldSignStartDate"></div>'				
					+'</td>'
					List+='<td class="th_bg" style="width:220px;">报名截止时间</td>'
					+'<td  style="text-align: left;">'
						+'<div id="oldSignEndDate"></div>'				
					+'</td>'					
				+'</tr>' 
     	}
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'oldExamAskEndDate':'oldAskEndDate')+'"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'oldExamAnswersEndDate':'oldAnswersEndDate')+'"></div>'     			
     		+'</td >'
     	+'</tr>'      		            	
     	List+='<tr>'	     		
	     		if(examType==0){     			      
	 			List+='<td style="width:220px;" class="th_bg">资格预审申请文件递交截止时间</td>'
	     		+'<td class="newTime" style="text-align: left;">'
	     			+'<div id="oldSubmitExamFileEndDate"></div> '    			
	     		+'</td>'
	     		}else{
	     			List+='<td style="width:220px;" class="th_bg"><span>报价截止时间</span></td>'
		     		+'<td  style="text-align: left;">'
		     			+'<div  id="oldOfferEndDate"></div>'
		     		+'</td>'
	     		}
	     	   List+='<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审时间':'询比评审时间')+'</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="'+(examType==0?'oldExamCheckEndDate':'oldCheckEndDate')+'"></div>'	
	     		+'</td>'
	       +'</tr>'
     	
	} */
	$("#nowOrOld").html(List)
	hasData()
}
function supplimentInt(){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1 && purExamType==1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
	// if(projectSupplementList.length==0){
			if(purExamType==1){
				List='<tr>'
		     		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
		     		+'<td style="text-align: left;">'
		     			+'<div id="noticeStartDate"></div>'    			
		     		+'</td>'
		     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
		     		+'<td style="text-align: left;">'
		     			+'<div id="noticeEndDate"></div> '   			
		     		+'</td>'
		     	+'</tr>'
		 	}
			if(packageInfo.isSign==1&&purExamType==1){
			 	List+='<tr>'
     			+'<td class="th_bg" style="width:220px;">报名开始时间</td>'
					+'<td   style="text-align: left;">'
						+'<div id="signStartDate"></div>'				
					+'</td>'
					+'<td class="th_bg" style="width:220px;">报名截止时间</td>'
					+'<td  style="text-align: left;">'
						+'<div id="signEndDate"></div>'				
					+'</td>'
				+'</tr>' 
		    }
	     	List+='<tr>'
	     		+'<td style="width:220px;" class="th_bg">提出澄清截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="askEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">答复截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="answersEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'	     	
	     	if(purExamType==0){
	     		List+='<tr>'
			 		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
			 		+'<td style="text-align: left;" >'
			 			+'<div id="acceptEndDate"></div>'	
			 		+'</td>'
					+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="offerEndDate"></div> '    			
			 		+'</td>'
			   	+'</tr>'
			   	+'<tr>'
			   		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
			 		+'<td style="text-align: left;" colspan="3">'
			 			+'<div id="checkEndDate"></div>'	
			 		+'</td>'
			 		
				 +'</tr>'
	     	}else{
	     		List+='<tr>'			 
					+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="offerEndDate"></div> '    			
			 		+'</td>'
			 		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="checkEndDate"></div>'	
			 		+'</td>'
			   	+'</tr>'
	     	};	     				 	   
	/* }else{
		if(purExamType==1){
			List='<tr>'
	     		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="noticeStartDate"></div>'    			
	     		+'</td>'
	     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="noticeEndDate"></div> '   			
	     		+'</td>'
	     	+'</tr>'
     	}
		if(packageInfo.isSign==1&&purExamType==1){
		 	List+='<tr>'
 			+'<td class="th_bg" style="width:220px;">报名开始时间</td>'
				+'<td   style="text-align: left;">'
					+'<div id="oldSignStartDate"></div>'				
				+'</td>'
				+'<td class="th_bg" style="width:220px;">报名截止时间</td>'
				+'<td  style="text-align: left;">'
					+'<div id="oldSignEndDate"></div>'				
				+'</td>'
			+'</tr>' 
	    }
	     	List+='<tr>'
	     		+'<td style="width:220px;" class="th_bg">提出澄清截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldAskEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">答复截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldAnswersEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
	     	
	     	if(purExamType==0){
	     		List+='<tr>'
			 		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
			 		+'<td style="text-align: left;" >'
			 			+'<div id="oldAcceptEndDate"></div>'	
			 		+'</td>'
					+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="oldOfferEndDate"></div> '    			
			 		+'</td>'
			   	+'</tr>'
			   	+'<tr>'
			   		+'<td style="width:220px;" class="th_bg">询比评审时间</td>'
			 		+'<td style="text-align: left;" colspan="3">'
			 			+'<div id="oldCheckEndDate"></div>'	
			 		+'</td>'
			 		
				 +'</tr>'
	     	}else{
	     		List+='<tr>'			 
					+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="oldOfferEndDate"></div> '    			
			 		+'</td>'
			 		+'<td style="width:220px;" class="th_bg">询比评审时间</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="oldCheckEndDate"></div>'	
			 		+'</td>'
			   	+'</tr>'
	     	}	     				 	 
	} */
	$("#nowOrOld").html(List)
	hasData()
}
function hasData(){
	
	var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
	if(projectSupplementList.length>0){
		$('div[id]').each(function(){
			if(reg.test(projectSupplementList[0][this.id])){			
				$(this).html(projectSupplementList[0][this.id].substring(0,16));
			}			
		});	
		$('div[id]').each(function(){			
			if(reg.test(packageInfo[this.id])){
				$(this).html(packageInfo[this.id].substring(0,16));
			}
		});
		if(projectSupplementList[0].examType==1){
			if(packageInfo.examType==0){
				$("#examRemark").html(projectSupplementList[0].oldExamRemark)
			}else{
				$("#remark").html(projectSupplementList[0].oldRemark)
			}			
		}else if(projectSupplementList[0].examType==0){
			$("#remark").html(projectSupplementList[0].oldRemark)
		}
	}else{
		$('div[id]').each(function(){			
			if(reg.test(packageInfo[this.id])){
				$(this).html(packageInfo[this.id].substring(0,16));
			}
		});
	}
	
}

/*satrt报价表*/
function offerFormData(){
	$("#offerForm").offerForm({
		viewURL:top.config.AuctionHost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageId,
			projectId:packageInfo.projectId, 
			examType:packageInfo.examType,
		},
		status:2,//1为编辑2为查看
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(isOfferDetailedItem,offerAttention){
	if(isOfferDetailedItem==undefined){
		isOfferDetailedItem = packageInfo.isOfferDetailedItem;
	}
	if(offerAttention==undefined){
		offerAttention = packageInfo.offerAttention;
	}
//	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageId,
				projectId:packageInfo.projectId, 
				offerFileListId:"0"
			},
			isShow:isOfferDetailedItem,//是否需要分项报价
			offerAttention:offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		});
//	}

}
/*end报价表*/
/***********************************  供应商网络信息 ***********************************/
/* 数据处理 */
// 同一供应商ip去重 
function removeRepeat(data){
	var new_arry = [];
	for(var i = 0;i<data.length;i++){
		//判断元素是否存在new_arry中，不存在则插入
		if(data[i].ip){
			if($.inArray(data[i].ip, new_arry) == -1){
				new_arry.push(data[i].ip)
			}
		}
	}
	return new_arry
}
//不同供应商ip对比
function creatFlage(ip, list, type, index, whiteList){
	var new_obj = {};
	var isIn = false;
	//先看是否在白名单中
	if(whiteList){
		for(var n = 0;n<whiteList.length;n++){
			if(whiteList[n].whiteParam == ip){
				//在白名单中
				isIn = true;
				new_obj.ip = ip;
				new_obj.flag = 2;
				new_obj.remarks = whiteList[n].remarks;
			}
		}
	}
	//不在白名单中
	if(!isIn){
		if(list.length > 1){
			for(var i = 0;i<list.length;i++){
				if(i != index){
					var contrastList = [];
					if(type == 'down'){
						contrastList = list[i].downIp;
					}else if(type == 'upload'){
						contrastList = list[i].uploadIp;
					}
					if($.inArray(ip, contrastList) != -1){
						//与其他供应商ip重复
						new_obj.ip = ip;
						new_obj.flag = 1;
					}else{
						new_obj.ip = ip;
					}
				}
			}
		}else{//只有一家供应商
			new_obj.ip = ip;
		}
		
	}
	return new_obj
}

