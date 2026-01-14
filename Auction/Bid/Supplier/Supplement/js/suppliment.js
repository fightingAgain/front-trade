
function suppliment(){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
//	if(examTypeShow!=undefined&&examTypeShow!=""&&examTypeShow!=null){//判断否存在传值若存在则为邀请函变更的查看调用
//		var examType=examTypeShow
//	}else{//若不存在则是邀请函的查看
//		var examType=examType
//	};
	if(projectSupplementList.length==0){
		
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
	}else if(projectSupplementList.length>0){
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
	     	   List+='<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审时间': reviewStartTimeLabel)+'</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="'+(examType==0?'oldExamCheckEndDate':'oldCheckEndDate')+'"></div>'	
	     		+'</td>'
	       +'</tr>'
     	
	}
	$("#nowOrOld").html(List)
	hasData()
}
function supplimentInt(examTypeShows){
	if(examTypeShows!=undefined&&examTypeShows!==""&&examTypeShows!=null){//判断否存在传值若存在则为邀请函变更的查看调用
		var examTypeShow=examTypeShows
	}else{//若不存在则是邀请函的查看
		var examTypeShow=examTypeShow
	}
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
	if(projectSupplementList.length==0){
			if(examTypeShow==1){
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
			if(packageInfo.isSign==1&&examTypeShow==1){
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
	     	if(examTypeShow==0){
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
	}else{
		if(examTypeShow==1){
			List='<tr>'
	     		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="noticeStartDate"></div>'    			
	     		+'</td>'
	     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldNoticeEndDate"></div> '   			
	     		+'</td>'
	     	+'</tr>'
     	}
		if(packageInfo.isSign==1&&examTypeShow==1){
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
	     	
	     	if(examTypeShow==0){
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
			   		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
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
			 		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
			 		+'<td style="text-align: left;">'
			 			+'<div id="oldCheckEndDate"></div>'	
			 		+'</td>'
			   	+'</tr>'
	     	}	     				 	 
	}
	$("#nowOrOld").html(List)
	hasData()
}

function packsuppliment(){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告开始时间</td>'
     		+'<td style="text-align: left;" colspan="'+ (packageInfo.isSign==0?'3':"") +'" >'
     			+'<div id="noticeStartDate"></div>'     			
     		+'</td >'
     		if(packageInfo.isSign==1){  
	     		List+='<td style="width:220px;" class="th_bg">报名开始时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="signStartDate"></div>'     			
	     		+'</td >'
     		}
     	List+='</tr>'
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'公告截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="noticeEndDate"></div>'     			
     		+'</td >'    		
     		+'<td style="width:220px;" class="th_bg">原始'+(examType==0?'资格预审':'')+'公告截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldNoticeEndDate"></div>'     			
     		+'</td >'
     	+'</tr>'
     	if(packageInfo.isSign==1){     	
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">报名截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="signEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始报名截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldSignEndDate"></div>'     			
     		+'</td >'
     	+'</tr>'
     	}
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'examAskEndDate':'askEndDate')+'"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'原始资格预审':'原始')+'提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'oldExamAskEndDate':'oldAskEndDate')+'"></div>'     			
     		+'</td >'
     	+'</tr>' 
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审':'')+'答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'examAnswersEndDate':'answersEndDate')+'"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">'+(examType==0?'原始资格预审':'原始')+'答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="'+(examType==0?'oldExamAnswersEndDate':'oldAnswersEndDate')+'"></div>'     			
     		+'</td >'
     	+'</tr>'
     	if(examType==1){
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="offerEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldOfferEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="checkEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldCheckEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	}
     	if(examType==0){
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">资格预审申请文件递交截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="submitExamFileEndDate"></div>'	
     		+'</td>'
     		+'<td style="width:220px;" class="th_bg">原始资格预审申请文件递交截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldSubmitExamFileEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">资格预审时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="examCheckEndDate"></div>'	
     		+'</td>'
     		+'<td style="width:220px;" class="th_bg">原始资格预审时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldExamCheckEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	}
	$("#nowOrOld").html(List);	
}
function packsupplimentInt(examTypeShows){
	if(examTypeShows!=undefined&&examTypeShows!==""&&examTypeShows!=null){//判断否存在传值若存在则为邀请函变更的查看调用
		var examTypeShow=examTypeShows
	}else{//若不存在则是邀请函的查看
		var examTypeShow=examTypeShow
	}
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
	if(examTypeShow==1){
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
     		+'<td style="text-align: left;" colspan="'+ (packageInfo.isSign==0?'3':"") +'">'
     			+'<div id="noticeStartDate"></div>'     			
     		+'</td >'
     	if(packageInfo.isSign==1){
     		List+='<td style="width:220px;" class="th_bg">报名开始时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="signStartDate"></div>'     			
     		+'</td >'
     	}	
		List+='</tr>'
		List+='<tr>'
			+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
			+'<td style="text-align: left;">'
				+'<div id="noticeEndDate"></div>'     			
			+'</td >'
			+'<td style="width:220px;" class="th_bg">原始接受邀请截止时间</td>'
			+'<td style="text-align: left;">'
				+'<div id="oldNoticeEndDate"></div>'     			
			+'</td >'
		+'</tr>'
     	if(packageInfo.isSign==1){
	     	
	     	List+='<tr>'
	     		+'<td style="width:220px;" class="th_bg">报名截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="signEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">原始报名截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldSignEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
	     	}
	}
		     	
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="askEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldAskEndDate"></div>'     			
     		+'</td >'
     	+'</tr>' 
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="answersEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldAnswersEndDate"></div>'     			
     		+'</td >'
     	+'</tr>'
     	if(examTypeShow==0){
     		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="acceptEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">原始接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldAcceptEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
     	}
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="offerEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldOfferEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="checkEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldCheckEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
	$("#nowOrOld").html(List)
}


function hasData(){
	
	var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
	if(projectSupplementList.length>0){
		$('div[id]').each(function(){			
			if(reg.test(packageInfo[this.id])){
				$(this).html(packageInfo[this.id].substring(0,16));
			}
		});
		$('div[id]').each(function(){
			if(reg.test(projectSupplementList[0][this.id])){			
				$(this).html(projectSupplementList[0][this.id].substring(0,16));
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


function oldSuppliment(inTive){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	if(inTive==0){
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
	     	   List+='<td style="width:220px;" class="th_bg">'+(examType==0?'资格预审时间': reviewStartTimeLabel)+'</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="'+(examType==0?'oldExamCheckEndDate':'oldCheckEndDate')+'"></div>'	
	     		+'</td>'
	       +'</tr>'
	}
	
	$("#nowOrOld").html(List)
	hasData()
}