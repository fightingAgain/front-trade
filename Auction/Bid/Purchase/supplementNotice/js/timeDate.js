//时间选择期
function time(examType){
	$(".ageinBtn").on('click',function(){
		$(".ageinTime").val("")
	})
	$(".ageinTime").on('change',function(){
		var time = $(this).val();
		var r = new RegExp("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s((([0-1][0-9])|(2?[0-3]))\\:([0-5]?[0-9])))?$");		
		if(!r.test(time)){
			parent.layer.alert('请输入正确格式的日期');
			$(this).val("")
		}
	});
	//公告截止时间
	$('form').on('click', '#noticeEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var noticeMin="";
		if(NewDate(packageInfo.noticeStartDate)>NewDate(nowSysDate)){	
			noticeMin=packageInfo.noticeStartDate;
		}else{
			noticeMin=nowSysDate;
		}				
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: noticeMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				$("#sellFileEndDate").val(selectTime);
				if(packageInfo.isSign==1){
					$("#signEndDate").val(selectTime);
				}
			}
		});
	});
	$('form').on('change', '#noticeEndDate', function(){
		$("#sellFileEndDate").val($(this).val());
		if(packageInfo.isSign==1){
			$("#signEndDate").val($(this).val());
		}
	});
	//提出澄清截止时间
	$('form').on('click', '#askEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var askEndMin="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
				askEndMin=$('#noticeEndDate').val();
			}else{
				askEndMin=nowSysDate;
			}				
		}else{
			askEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: askEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	//答复截止时间
	$('form').on('click', '#answersEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var answersMinDate="";
		if($('#askEndDate').val()!=""){
			if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，	
				answersMinDate=$('#askEndDate').val();//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
			}else{
				answersMinDate=nowSysDate;//小于当前时间。询比的最小时间则为当前时间
			}				
		}else{
			answersMinDate=nowSysDate;//小于当前时间。询比的最小时间则为当前时间
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: answersMinDate,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	//报价截止时间
	$('form').on('click', '#bidEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var bidEndMin="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，	
				bidEndMin=$('#noticeEndDate').val();//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
			}else{
				bidEndMin=nowSysDate;//小于当前时间。询比的最小时间则为当前时间
			}				
		}else{
			bidEndMin=nowSysDate;//小于当前时间。询比的最小时间则为当前时间
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: bidEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	//询比评审时间或预审评审时间
	$('form').on('click', '#checkEndDate', function(){
		var  checkEndMinDate="";//询比评审时间或预审评审时间的最小时间判断
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		if(examType==1){//当为后审时，存在报价文件，则询比时间的最小值必须大于报价文件
			if($('#bidEndDate').val()!=""){//判断是否存在报价时间
				if(NewDate($('#bidEndDate').val())>NewDate(nowSysDate)){//如果存在判断报价时间跟当前时间，
					checkEndMinDate=$('#bidEndDate').val();//如果报价时间大于当前时间，则询比的最小值是报价时间
				}else{
					checkEndMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
				}
				
			}else{
				checkEndMinDate=nowSysDate//不存在则是当前时间
			}
		}else if(examType==0){//当为预审时，则是资格预审申请文件递交截止时间是预审评审的最小值				
			if($('#submitExamFileEndDate').val()!=""){//判断是否存在格预审申请文件递交截止时间					
				if(NewDate($('#submitExamFileEndDate').val())>NewDate(nowSysDate)){//如果格预审申请文件递交截止时间大于当前时间						
					checkEndMinDate=$('#submitExamFileEndDate').val();//预审评审的最小时间则是格预审申请文件递交截止时间
				}else{
					checkEndMinDate=nowSysDate//否则则是当前时间为最小值
				}			
			}else{
				checkEndMinDate=nowSysDate//不存在则是当前时间
			}
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: checkEndMinDate,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('form').on('click', '#submitExamFileEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var submitExamMinDate="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
				submitExamMinDate=$('#noticeEndDate').val();
			}else{
				submitExamMinDate=nowSysDate;
			}				
		}else{
			submitExamMinDate=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: submitExamMinDate,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
};

function examTime(examTypeShow){
	$(".ageinBtn").on('click',function(){
		$(".ageinTime").val("")
	})
	$(".ageinTime").on('change',function(){
		var time = $(this).val();
		var r = new RegExp("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s((([0-1][0-9])|(2?[0-3]))\\:([0-5]?[0-9])))?$");		
		if(!r.test(time)){
			parent.layer.alert('请输入正确格式的日期');
			$(this).val("")
		}
	});
	//公告截止时间
	$('form').on('click', '#noticeEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var noticeMin="";
		if(NewDate(packageInfo.noticeStartDate)>NewDate(nowSysDate)){	
			noticeMin=packageInfo.noticeStartDate;
		}else{
			noticeMin=nowSysDate;
		}				
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: noticeMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				$("#sellFileEndDate").val(selectTime);
				$("#acceptEndDate").val(selectTime);
				if(packageInfo.isSign==1){					
					$("#signEndDate").val(selectTime)
				}
			}
		});
	});
	$('form').on('change', '#noticeEndDate', function(){
		$("#sellFileEndDate").val($(this).val());
		$("#acceptEndDate").val($(this).val());
		if(packageInfo.isSign==1){					
			$("#signEndDate").val($(this).val())
		}
	});
	$('form').on('click', '#askEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var askEndMin="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
				askEndMin=$('#noticeEndDate').val();
			}else{
				askEndMin=nowSysDate;
			}				
		}else{
			askEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: askEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('form').on('click', '#answersEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var answersMinDate="";
		if($('#askEndDate').val()!=""){
			if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){	
				answersMinDate=$('#askEndDate').val();
			}else{
				answersMinDate=nowSysDate;
			}				
		}else{
			answersMinDate=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: answersMinDate,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('form').on('click', '#bidEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var bidEndMin="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
				bidEndMin=$('#noticeEndDate').val();
			}else{
				bidEndMin=nowSysDate;
			}				
		}else{
			bidEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: bidEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	
	//接受邀请截止时间
	$('form').on('click', '#acceptEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: nowSysDate,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(packageInfo.isSellPriceFile==0){
					$("#sellPriceFileEndDate").val(selectTime)
				}
			}
		});
	});
	$('form').on('change', '#acceptEndDate', function(){
		if(packageInfo.isSellPriceFile==0){
			$("#sellPriceFileEndDate").val($(this).val())
		}
	});
	$('form').on('click', '#checkEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var checkEndMin="";
		if($('#bidEndDate').val()!=""){
			if(NewDate($('#bidEndDate').val())>NewDate(nowSysDate)){	
				checkEndMin=$('#bidEndDate').val();
			}else{
				checkEndMin=nowSysDate;
			}				
		}else{
			checkEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: checkEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
};

function datetimepickers(examType){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var timeList="";
	timeList+='<tr>'
		timeList+='<td  class="th_bg" >'+ (examType==1?'公告开始时间':'资格预审公告开始时间') +'</td>'
		timeList+='<td style="text-align: left;">'
			timeList+='<div id="oldnoticeStartDate">'+ (packageInfo.noticeStartDate!=undefined?packageInfo.noticeStartDate.substring(0,16):"") +'</div>'	     			
		timeList+='</td>'
		timeList+='<td  class="th_bg" style="width:250px;">'+ (examType==1?'公告截止时间':'资格预审公告截止时间') +'</td>'
		timeList+='<td style="text-align: left;">'
			timeList+='<div id="oldnoticeEndDate">'+ (packageInfo.noticeEndDate!=undefined?packageInfo.noticeEndDate.substring(0,16):"")+'</div>'
		timeList+='</td>'     		
	timeList+='</tr>'
	if(packageInfo.isSign==1){
		timeList+='<tr>'     		
			timeList+='<td class="th_bg" style="width:250px;">报名开始时间</td>'
			timeList+='<td class=""style="text-align: left;">'
				timeList+='<div id="oldsignStartDate">'+ (packageInfo.signStartDate!=undefined?packageInfo.signStartDate.substring(0,16):"")+'</div>'					
			timeList+='</td>'
			timeList+='<td class="th_bg" style="width:250px;">报名截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldsignEndDate">'+ (packageInfo.signEndDate!=undefined?packageInfo.signEndDate.substring(0,16):"")+'</div>'		
			timeList+='</td>'
		timeList+='</tr>'
	}  
	if(examType==1){			   	
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldaskEndDate">'+(packageInfo.askEndDate!=undefined?packageInfo.askEndDate.substring(0,16):"")+'</div>'   			
			timeList+='</td >'
			  timeList+='<td  class="th_bg" >提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="answersEndDate" data-datename="提出澄清截止时间" class="btn btn-default ageinTime Wdate" id="askEndDate"  name="askEndDate" style="width: 200px;text-align: left;">'
			timeList+='</td >'
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldanswersEndDate">'+(packageInfo.answersEndDate!=undefined?packageInfo.answersEndDate.substring(0,16):"")+'</div>'  			
			timeList+='</td >'
			  timeList+='<td  class="th_bg" >答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="answersEndDate" data-datename="答复截止时间" class="btn btn-default ageinTime Wdate" id="answersEndDate"  name="answersEndDate" style="width: 200px;text-align: left;">'
			timeList+='</td >'
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始报价截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldofferEndDate">'+(packageInfo.offerEndDate!=undefined?packageInfo.offerEndDate.substring(0,16):"")+'</div>'   			
			timeList+='</td>'
			timeList+='<td  class="th_bg" >报价截止时间</td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="'+ (packageInfo.isSign==1?'signStartDate':'noticeEndDate') +'" data-max="checkEndDate" data-datename="报价截止时间" class="btn btn-default ageinTime Wdate" name="offerEndDate"  id="bidEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始' + reviewStartTimeLabel + '</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldcheckEndDate">'+(packageInfo.checkEndDate!=undefined?packageInfo.checkEndDate.substring(0,16):"")+'</div>'       			
			timeList+='</td>'
			timeList+='<td  class="th_bg" >' + reviewStartTimeLabel + '</td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="offerEndDate" data-datename="询比评审时间" class="btn btn-default Wdate ageinTime" name="checkEndDate"  id="checkEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
   }else{		
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始资格预审提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldexamAskEndDate">'+(packageInfo.examAskEndDate!=undefined?packageInfo.examAskEndDate.substring(0,16):"")+'</div>'     			
			timeList+='</td >'
			  timeList+='<td  class="th_bg" >资格预审提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="examAnswersEndDate" data-datename="资格预审提出澄清截止时间" class="btn btn-default Wdate ageinTime" id="askEndDate" name="examAskEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td >'    	
		timeList+='</tr>' 
		timeList+='<tr>'     		
			timeList+='<td  class="th_bg" >原始资格预审答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldexamAnswersEndDate">'+(packageInfo.examAnswersEndDate!=undefined?packageInfo.examAnswersEndDate.substring(0,16):"") +'</div>'
			timeList+='</td >'
			  timeList+='<td  class="th_bg" >资格预审答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="examAnswersEndDate" data-datename="资格预审提出澄清截止时间" class="btn btn-default Wdate ageinTime" id="answersEndDate" name="examAnswersEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td >'
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原资格预审申请文件递交截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldsubmitExamFileEndDate">'+(packageInfo.submitExamFileEndDate!=undefined?packageInfo.submitExamFileEndDate.substring(0,16):"")+'</div>' 
			timeList+='</td>'
			timeList+='<td  class="th_bg" ><span class="examCheckEndDate">资格预审申请文件递交截止时间</span></td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="'+ (packageInfo.isSign==1?'signStartDate':'noticeEndDate') +'" data-max="examCheckEndDate" data-datename="资格预审申请文件递交截止时间" class="btn btn-default Wdate ageinTime" name="submitExamFileEndDate" id="submitExamFileEndDate"   style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始预审评审时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldexamCheckEndDate">'+(packageInfo.examCheckEndDate!=undefined?packageInfo.examCheckEndDate.substring(0,16):"")+'</div>' 
			timeList+='</td>'
			timeList+='<td  class="th_bg" ><span class="examCheckEndDate">预审评审时间</span></td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off"  data-min="submitExamFileEndDate"  data-datename="预审评审时间" class="btn btn-default ageinTime Wdate" name="examCheckEndDate" id="checkEndDate"   style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
   }
	$('#timeList').html(timeList);
	time(examType);
}
function examDatetimepicker(examType){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var timeList="";
		if(examType==1){
			timeList+='<tr>'
			   timeList+='<td  class="th_bg" >接受邀请开始时间</td>'
	     		timeList+='<td style="text-align: left;">'
	     			timeList+='<div id="oldnoticeStartDate">'+ (packageInfo.noticeStartDate!=undefined?packageInfo.noticeStartDate.substring(0,16):"") +'</div>'	     			
	     		timeList+='</td>'
	     		timeList+='<td  class="th_bg" style="width:250px;">接受邀请截止时间</td>'
	     		timeList+='<td style="text-align: left;">'
	     			timeList+='<div id="oldnoticeEndDate">'+ (packageInfo.noticeEndDate!=undefined?packageInfo.noticeEndDate.substring(0,16):"")+'</div>'
	     			timeList+='<input type="hidden"  id="acceptEndDate" name="acceptEndDate"/>'
	     		timeList+='</td>'     		
	     	timeList+='</tr>'
	     	if(packageInfo.isSign==1){
	     		timeList+='<tr class="isSignDateNone">'     		
		     		timeList+='<td class="th_bg" style="width:250px;">报名开始时间</td>'
					timeList+='<td class=""style="text-align: left;">'
						timeList+='<div id="oldsignStartDate">'+ (packageInfo.signStartDate!=undefined?packageInfo.signStartDate.substring(0,16):"")+'</div>'					
					timeList+='</td>'
		     		timeList+='<td class="th_bg" style="width:250px;">报名截止时间</td>'
					timeList+='<td style="text-align: left;">'
						timeList+='<div id="oldsignEndDate">'+ (packageInfo.signEndDate!=undefined?packageInfo.signEndDate.substring(0,16):"")+'</div>'
					timeList+='</td>'
		        timeList+='</tr>'
	     	} 
	    }    	    	
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldaskEndDate">'+(packageInfo.askEndDate!=undefined?packageInfo.askEndDate.substring(0,16):"")+'</div>'  			
			timeList+='</td >'
			timeList+='<td  class="th_bg" >提出澄清截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate"  data-max="answersEndDate" data-datename="提出澄清截止时间" class="btn btn-default ageinTime Wdate" id="askEndDate"  name="askEndDate" style="width: 200px;text-align: left;">'
				timeList+='<input type="hidden" class="btn btn-default ageinTime"  id="sellPriceFileStartDate" name="sellPriceFileStartDate" value="'+ packageInfo.noticeStartDate +'"  style="width: 200px;text-align: left;">'
			timeList+='</td >'
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldanswersEndDate">'+(packageInfo.answersEndDate!=undefined?packageInfo.answersEndDate.substring(0,16):"") +'</div>'   			
			timeList+='</td >'
			timeList+='<td  class="th_bg" >答复截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="askEndDate"  data-datename="答复截止时间" class="btn btn-default ageinTime Wdate" id="answersEndDate"  name="answersEndDate" style="width: 200px;text-align: left;">'
			timeList+='</td >'
		timeList+='</tr>'
		if(examType==0){
			timeList+='<tr>'
				timeList+='<td class="th_bg" >原始接受邀请截止时间</td>'
				timeList+='<td  style="text-align: left;" >'
					timeList+='<div id="oldacceptEndDate">'+(packageInfo.acceptEndDate!=undefined?packageInfo.acceptEndDate.substring(0,16):"")+'</div>'
				timeList+='</td>' 
				timeList+='<td class="th_bg" >接受邀请截止时间</td>'
				timeList+='<td  style="text-align: left;">'
					timeList+='<input type="text" autocomplete="off" data-min="today" data-max="offerEndDate"  data-datename="接受邀请截止时间" class="btn btn-default ageinTime Wdate"  id="acceptEndDate" name="acceptEndDate" style="width: 200px;text-align: left;">'	     			
					timeList+='<input type="hidden" class="btn btn-default ageinTime"  id="sellPriceFileEndDate" name="sellPriceFileEndDate" style="width: 200px;text-align: left;">'
					
				timeList+='</td>'
			timeList+='</tr>'	     
		}
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始报价截止时间</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldofferEndDate">'+(packageInfo.offerEndDate!=undefined?packageInfo.offerEndDate.substring(0,16):"") +'</div>'   			
			timeList+='</td>'
			timeList+='<td  class="th_bg" >报价截止时间</td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="'+(examType==0?'acceptEndDate':'noticeEndDate') +'" data-max="checkEndDate"  data-datename="报价截止时间" class="btn btn-default ageinTime Wdate" name="offerEndDate"  id="bidEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
		timeList+='<tr>'
			timeList+='<td  class="th_bg" >原始' + reviewStartTimeLabel + '</td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<div id="oldcheckEndDate">'+(packageInfo.checkEndDate!=undefined?packageInfo.checkEndDate.substring(0,16):"")  +'</div>'       			
			timeList+='</td>'
			timeList+='<td  class="th_bg" >' + reviewStartTimeLabel + '</td>'
			timeList+='<td  style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="offerEndDate"  data-datename="' + reviewStartTimeLabel + '" class="btn btn-default ageinTime Wdate" name="checkEndDate"  id="checkEndDate"  style="width: 200px;text-align: left;">'
			timeList+='</td>'    		    		
		timeList+='</tr>'
	$('#timeList').html(timeList);
	examTime(examType);
}
function NewDate(str){
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date();   
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1]);
  return date.getTime();  
} 
function NewDateT(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date(); 
 
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date;  
}