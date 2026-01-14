//时间选择期
function time(){	
	$(".ageinBtn").on('click',function(){
		$(".ageinTime").val("")
	})
	$(".ageinTime").on('change',function(){
		var time = $(this).val();
		var r = new RegExp("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s((([0-1][0-9])|(2?[0-3]))\\:([0-5]?[0-9])))?$");		
		if(time!=""&&!r.test(time)){
			parent.layer.alert('请输入正确格式的日期');
			$(this).val("")
		}
	});
	//公告开始时间
    $('#noticeStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',				
		onShow:function(e){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();			
			$('#noticeStartDate').datetimepicker({						
				//minDate:NewDateT(nowSysDate)
			})
		},
	});
	//项目分配时间
	$('#bidOpeningEndTime').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeStartDate').val()!=""){
				if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
					var noticeMin=$('#noticeStartDate').val()+':01'
				}else{
					var noticeMin=nowSysDate
				}				
			}else{
				var noticeMin=nowSysDate
			}
			$('#bidOpeningEndTime').datetimepicker({						
					//minDate:NewDateT(noticeMin)
			})
		},

	});
	//评审
	$('#creatTime').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',				
			onShow:function(){
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
				if($('#bidOpeningEndTime').val()!=""){
					if(NewDate($('#bidOpeningEndTime').val())>NewDate(nowSysDate)){	
						var askEndMin=NewDateT($('#bidOpeningEndTime').val()+':00');
					}else{
						var askEndMin=NewDateT(nowSysDate);
					}					
				}else{
					var askEndMin=NewDateT(nowSysDate);
				};				
				$('#creatTime').datetimepicker({						
						//minDate:askEndMin,
						//maxDate:askEndMax,
				})
			},
	});
	//中选通知书发出时间
	$('#noticeSendTime').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',			
			onShow:function(){
				var answersMinDate="";
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
				if($('#creatTime').val()!=""){//判断是否存在提出澄清截止时间
					if(NewDate($('#creatTime').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，
						answersMinDate=$('#creatTime').val()+':00';//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
					}else{
						answersMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
					}					
				}else{
					answersMinDate=nowSysDate//不存在则是当前时间
				}
				$('#noticeSendTime').datetimepicker({						
						//minDate:NewDateT(answersMinDate)
				})
			},
			onClose:function(e){
				var day=new Date(e).getDate();
				var month=(new Date(e).getMonth()+1);
				var newMonth
				if(parseInt(day)>25){
					newMonth=(month+1)+'月'
				}else if(parseInt(day)<=25){
					newMonth=(month)+'月'
				}
				if($('#noticeSendTime').val() == ''){
				return;
			}
				$('#complectMonth').val(newMonth)
			}
	});	

}
function times(){
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
	//公告开始时间
    $('#noticeStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			$('#noticeStartDate').datetimepicker({						
				//minDate:NewDateT(nowSysDate)
			})
		},
		onClose:function(e) {
			$("#sellFileStartDate").val($("#noticeStartDate").val());
			if(packageInfo.isSign==1){					
				$("#signStartDate").val($("#noticeStartDate").val())
			}
		},
	});
	//公告截止时间
	$('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){	
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();		
			if($('#noticeStartDate').val()!=""){
				if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
					var noticeMin=$('#noticeStartDate').val()+':01'
				}else{
					var noticeMin=nowSysDate
				}				
			}else{
				var noticeMin=nowSysDate
			};
			$('#noticeEndDate').datetimepicker({						
					//minDate:NewDateT(noticeMin)
			})
		},
		onClose:function(e) {
			$("#sellFileEndDate").val($("#noticeEndDate").val());
			$("#acceptEndDate").val($("#noticeEndDate").val());
			if(packageInfo.isSign==1){					
				$("#signEndDate").val($("#noticeEndDate").val())
			}
		},
	});
	$('#askEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
					var askEndMin=NewDateT($('#noticeEndDate').val()+':00');
				}else{
					var askEndMin=NewDateT(nowSysDate);
				}					
			}else{
				var askEndMin=NewDateT(nowSysDate);
			};
			$('#askEndDate').datetimepicker({						
				//minDate:askEndMin,		
			})
		},	
	});
	$('#answersEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var answersMinDate="";
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#askEndDate').val()!=""){//判断是否存在提出澄清截止时间
				if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，
					answersMinDate=$('#askEndDate').val()+':00';//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
				}else{
					answersMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
				}					
			}else{
				answersMinDate=nowSysDate//不存在则是当前时间
			}
			$('#answersEndDate').datetimepicker({						
					//minDate:NewDateT(answersMinDate)
			})
		},
	});
	$('#acceptEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();						
			$('#bidEndDate').datetimepicker({						
					//minDate:NewDateT(nowSysDate),
			})
		},
		onClose:function(e) {
			if($('input[name="isSellPriceFile"]:checked').val()==0){
				$("#sellPriceFileStartDate").val(packageInfo.noticeStartDate)
				$("#sellPriceFileEndDate").val($("#acceptEndDate").val());	
			}			
		},	
	});
	//报价截止时间
	$('#bidEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#acceptEndDate').val()!=""){
				if(NewDate($('#acceptEndDate').val())>NewDate(nowSysDate)){	
					var bidEndMin=$('#acceptEndDate').val()+':00';
				}else{
					var bidEndMin=nowSysDate//否则则是当前时间为最小值
				}						
			}else{
				var bidEndMin=nowSysDate;
			};				
			$('#bidEndDate').datetimepicker({						
					//minDate:NewDateT(bidEndMin),
	
			})
		},	
	});
	//评审时间
	$('#checkEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',			
			onShow:function(){	
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();		
				if($('#bidEndDate').val()!=""){
						if(NewDate($('#bidEndDate').val())>NewDate(nowSysDate)){	
							var checkEndMin=$('#bidEndDate').val()+':00';
						}else{
							var checkEndMin=nowSysDate//否则则是当前时间为最小值
						}						
					}else{
						var checkEndMin=nowSysDate;
					};
				$('#checkEndDate').datetimepicker({					
					//minDate:NewDateT(checkEndMin)
				})
			},			
	});
};
function datetimepicker(examType){
	var timeList="";
	timeList+='<tr>'
			timeList+='<td  class="th_bg" >'+ (examType==1?'公告开始时间':'资格预审公告开始时间') +'<i class="red">*</i></td>'
			timeList+='<td style="text-align: left;">'
				timeList+='<input type="text" autocomplete="off" data-min="today" data-datename="'+ (examType==1?'公告开始时间':'资格预审公告开始时间') +'" class="btn btn-default ageinTime" id="noticeStartDate" name="noticeStartDate" value="'+ (packageInfo.noticeStartDate!=undefined?packageInfo.noticeStartDate.substring(0,16):"") +'" style="width: 200px;text-align: left;">'
				if(packageInfo.isSellFile==0){
					timeList+='<input type="hidden" class="btn btn-default ageinTime" id="sellFileStartDate" value="'+ packageInfo.noticeStartDate +'" name="sellFileStartDate">'//文件发售开始时间
				}
			timeList+='</td>'
     		timeList+='<td  class="th_bg" style="width:250px;">'+ (examType==1?'公告截止时间':'资格预审公告截止始时间') +'<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="noticeStartDate" data-datename="'+ (examType==1?'公告截止时间':'资格预审公告截止始时间') +'" class="btn btn-default ageinTime" id="noticeEndDate" value="'+ (packageInfo.noticeEndDate!=undefined?packageInfo.noticeEndDate.substring(0,16):"") +'" name="noticeEndDate" style="width: 200px;text-align: left;">'
				if(packageInfo.isSellFile==0){
					timeList+='<input type="hidden" class="btn btn-default ageinTime" id="sellFileEndDate" value="'+ packageInfo.noticeEndDate +'" name="sellFileEndDate">'//<!--文件发售截止时间-->
				}				
     		timeList+='</td>'     		
     	timeList+='</tr>'
     	if(packageInfo.isSign==1){
     		timeList+='<tr>'     		
	     		timeList+='<td class="th_bg" style="width:250px;">报名开始时间<i class="red">*</i></td>'
				timeList+='<td class=""style="text-align: left;">'
					timeList+='<input type="text" autocomplete="off" data-min="noticeStartDate" data-max="signEndDate" data-datename="报名开始时间" class="btn btn-default ageinTime" id="signStartDate" value="'+ (packageInfo.signStartDate!=undefined?packageInfo.signStartDate.substring(0,16):"") +'" name="signStartDate" style="width: 200px;text-align: left;" readonly="readonly">'
				timeList+='</td>'
	     		timeList+='<td class="th_bg" style="width:250px;">报名截止时间<i class="red">*</i></td>'
				timeList+='<td style="text-align: left;">'
					timeList+='<input type="text" autocomplete="off" data-min="signEndDate" data-max="'+ (examType==1?'offerEndDate':'examCheckEndDate') +'" data-datename="报名开始时间" class="btn btn-default ageinTime" id="signEndDate" value="'+ (packageInfo.signEndDate!=undefined?packageInfo.signEndDate.substring(0,16):"") +'" name="signEndDate" style="width: 200px;text-align: left;" readonly="readonly">'
				timeList+='</td>'
	        timeList+='</tr>'
     	} 
	if(examType==1){    	
     	timeList+='<tr>'
     		timeList+='<td  class="th_bg" >提出澄清截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="answersEndDate" data-datename="提出澄清截止时间" class="btn btn-default ageinTime" id="askEndDate" value="'+ (packageInfo.askEndDate!=undefined?packageInfo.askEndDate.substring(0,16):"") +'" name="askEndDate" style="width: 200px;text-align: left;">'
     		timeList+='</td >'
   		    timeList+='<td  class="th_bg" >答复截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="askEndDate"  data-datename="答复截止时间" class="btn btn-default ageinTime" id="answersEndDate" value="'+ (packageInfo.answersEndDate!=undefined?packageInfo.answersEndDate.substring(0,16):"") +'" name="answersEndDate" style="width: 200px;text-align: left;">'
     		timeList+='</td >'
     	timeList+='</tr>'    	
     	timeList+='<tr>'
     		timeList+='<td  class="th_bg" >报价截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="checkEndDate" data-datename="报价截止时间" class="btn btn-default ageinTime" id="bidEndDate" value="'+ (packageInfo.offerEndDate!=undefined?packageInfo.offerEndDate.substring(0,16):"") +'" name="offerEndDate" style="width: 200px;text-align: left;">'
     		timeList+='</td>'
     		timeList+='<td class="th_bg">询比评审时间<i class="red">*</i></td>'
     		timeList+='<td  style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off"  data-min="offerEndDate" data-max="" data-datename="询比评审时间" class="btn btn-default ageinTime" name="checkEndDate" value="'+ (packageInfo.checkEndDate!=undefined?packageInfo.checkEndDate.substring(0,16):"") +'" id="checkEndDate"  style="width: 200px;text-align: left;">'
     		timeList+='</td>'    		    		
     	timeList+='</tr>'  
	}else{
     	timeList+='<tr>'
     		timeList+='<td  class="th_bg" >资格预审提出澄清截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="noticeEndDate" data-max="examAnswersEndDate" data-datename="资格预审提出澄清截止时间" class="btn btn-default ageinTime" id="askEndDate" name="examAskEndDate" value="'+ (packageInfo.examAskEndDate!=undefined?packageInfo.examAskEndDate.substring(0,16):"") +'" style="width: 200px;text-align: left;">'
     		timeList+='</td >'
   		    timeList+='<td  class="th_bg" >资格预审答复截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="examAskEndDate"  data-datename="资格预审答复截止时间" class="btn btn-default ageinTime" id="answersEndDate" name="examAnswersEndDate" value="'+ (packageInfo.examAnswersEndDate!=undefined?packageInfo.examAnswersEndDate.substring(0,16):"") +'" style="width: 200px;text-align: left;">'
     		timeList+='</td >'
     	timeList+='</tr>'    	
     	timeList+='<tr>'
     		timeList+='<td  class="th_bg" >资格预审申请文件递交截止时间<i class="red">*</i></td>'
     		timeList+='<td style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off"  data-min="noticeEndDate" data-max="examCheckEndDate" data-datename="资格预审申请文件递交截止时间" class="btn btn-default ageinTime" id="submitExamFileEndDate" name="submitExamFileEndDate" value="'+ (packageInfo.submitExamFileEndDate!=undefined?packageInfo.submitExamFileEndDate.substring(0,16):"") +'" style="width: 200px;text-align: left;">'
     		timeList+='</td>'
     		timeList+='<td  class="th_bg" >预审评审时间<i class="red">*</i></td>'
     		timeList+='<td  style="text-align: left;">'
     			timeList+='<input type="text" autocomplete="off" data-min="submitExamFileEndDate"  data-datename="预审评审时间" class="btn btn-default ageinTime" name="examCheckEndDate" id="checkEndDate" value="'+ (packageInfo.examCheckEndDate!=undefined?packageInfo.examCheckEndDate.substring(0,16):"") +'"  style="width: 200px;text-align: left;">'
     		timeList+='</td>'    		    		
     	timeList+='</tr>'
	}
	$('#timeList').html(timeList);
	time()
}

//时间选择期
function changTime(examType){	
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
	$('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if(NewDate(packageInfo.noticeStartDate)>NewDate(nowSysDate)){	
				var noticeMin=packageInfo.noticeStartDate
			}else{
				var noticeMin=nowSysDate
			}	
			$('#noticeEndDate').datetimepicker({						
					//minDate:NewDateT(noticeMin)
			})
		},
		onClose:function(e) {
			$("#sellFileEndDate").val($('#noticeEndDate').val());
			if(packageInfo.isSign==1){
					$("#signEndDate").val($('#noticeEndDate').val());
			}
			
		},
	});
	
	//提出澄清截止时间
	$('#askEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',				
			onShow:function(){		
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();			
				if($('#noticeEndDate').val()!=""){
					if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
						var askEndMin=NewDateT($('#noticeEndDate').val()+':00');
					}else{
						var askEndMin=NewDateT(nowSysDate);
					}					
				}else{
					var askEndMin=NewDateT(nowSysDate);										
				};				
				$('#askEndDate').datetimepicker({						
						//minDate:askEndMin,
						//maxDate:askEndMax,
				})
			},
	});
	//答复截止时间
	
	$('#answersEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',			
			onShow:function(){
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
				var answersMinDate=""
				if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，
					answersMinDate=$('#askEndDate').val()+':00';//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
				}else{
					answersMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
				}
				$('#answersEndDate').datetimepicker({						
						//minDate:NewDateT(answersMinDate)
				})
			},
	});
	//报价截止时间
	$('#bidEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
					var bidEndMin=$('#noticeEndDate').val()+':00';
				}else{
					var bidEndMin=nowSysDate//否则则是当前时间为最小值
				}						
			}else{
				var bidEndMin=nowSysDate//否则则是当前时间为最小值
			}													
			$('#bidEndDate').datetimepicker({						
					minDate:NewDateT(bidEndMin),
					//maxDate:NewDateT(bidEndMax),
			})
		},			
	});	
	
	//询比评审时间或预审评审时间
	$('#checkEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){			
			var  checkEndMinDate="";//询比评审时间或预审评审时间的最小时间判断
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if(examType==1){//当为后审时，存在报价文件，则询比时间的最小值必须大于报价文件
				if($('#bidEndDate').val()!=""){//判断是否存在报价时间
					if(NewDate($('#bidEndDate').val())>NewDate(nowSysDate)){//如果存在判断报价时间跟当前时间，
						checkEndMinDate=$('#bidEndDate').val()+':00';//如果报价时间大于当前时间，则询比的最小值是报价时间
					}else{
						checkEndMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
					}
					
				}else{
					checkEndMinDate=nowSysDate//不存在则是当前时间
				}
			}else if(examType==0){//当为预审时，则是资格预审申请文件递交截止时间是预审评审的最小值				
				if($('#submitExamFileEndDate').val()!=""){//判断是否存在格预审申请文件递交截止时间					
					if(NewDate($('#submitExamFileEndDate').val())>NewDate(nowSysDate)){//如果格预审申请文件递交截止时间大于当前时间						
						checkEndMinDate=$('#submitExamFileEndDate').val()+':00';//预审评审的最小时间则是格预审申请文件递交截止时间
					}else{
						checkEndMinDate=nowSysDate//否则则是当前时间为最小值
					}			
				}else{
					checkEndMinDate=nowSysDate//不存在则是当前时间
				}
			}					
			$('#checkEndDate').datetimepicker({						
					minDate:NewDateT(checkEndMinDate),				
			})
	    },
	});
	$('#submitExamFileEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var submitExamMinDate = "";
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){//如果格预审申请文件递交截止时间大于当前时间
					submitExamMinDate=$('#noticeEndDate').val()+':00';//预审评审的最小时间则是格预审申请文件递交截止时间
				}else{
					submitExamMinDate=nowSysDate//否则则是当前时间为最小值
				}
			}else{
				submitExamMinDate=nowSysDate//否则则是当前时间为最小值
			}				
			$('#submitExamFileEndDate').datetimepicker({						
					minDate:NewDateT(submitExamMinDate),				
			})
	    },
	});
};
function examChangTime(examTypeShow){	
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
	$('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){	
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();			
			if(NewDate(packageInfo.noticeStartDate)>NewDate(nowSysDate)){	
				var noticeMin=packageInfo.noticeStartDate
			}else{
				var noticeMin=nowSysDate
			}
			$('#noticeEndDate').datetimepicker({						
					minDate:NewDateT(noticeMin)
			})
		},
		onClose:function(e) {
			$("#sellFileEndDate").val($("#noticeEndDate").val());			
			$("#acceptEndDate").val($("#noticeEndDate").val());
			if(packageInfo.isSign==1){					
				$("#signEndDate").val($("#noticeEndDate").val())
			}
		},
	});
	$('#askEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
					var askEndMin=NewDateT($('#noticeEndDate').val()+':00');
				}else{
					var askEndMin=NewDateT(nowSysDate);
				}					
			}else{
				var askEndMin=NewDateT(nowSysDate);
			};
			$('#askEndDate').datetimepicker({						
					minDate:askEndMin,					
			})
		},	
	});
	$('#answersEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			var answersMinDate=""
			if($('#askEndDate').val()!=""){//判断是否存在提出澄清截止时间
				if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，
					answersMinDate=$('#askEndDate').val()+':00';//如果提出澄清截止时间大于当前时间，则询比的最小值是报价时间
				}else{
					answersMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
				}					
			}else{
				answersMinDate=nowSysDate//小于当前时间。询比的最小时间则为当前时间
			}
			$('#answersEndDate').datetimepicker({						
					minDate:NewDateT(answersMinDate)
			})
		},
	});
	$('#bidEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
					var bidEndMin=$('#noticeEndDate').val()+':00';
				}else{
					var bidEndMin=nowSysDate//否则则是当前时间为最小值
				}						
			}else{
				var bidEndMin=nowSysDate//否则则是当前时间为最小值
			};										
			$('#bidEndDate').datetimepicker({						
					minDate:NewDateT(bidEndMin),
					//maxDate:NewDateT(bidEndMax),
			})
		},	
	});
	//接受邀请截止时间
	$('#acceptEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){	
			var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();		
			$('#acceptEndDate').datetimepicker({										
				minDate:NewDateT(nowSysDate)
			})
		},
		onClose:function(e) {
			if(packageInfo.isSellPriceFile==0){
				$("#sellPriceFileEndDate").val($('#acceptEndDate').val())
			}
		},
	});
	$('#checkEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',			
			onShow:function(){	
				var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();			
				if($('#bidEndDate').val()!=""){
						if(NewDate($('#bidEndDate').val())>NewDate(nowSysDate)){	
							var checkEndMin=$('#bidEndDate').val()+':00';
						}else{
							var checkEndMin=nowSysDate//否则则是当前时间为最小值
						}						
					}else{
						var checkEndMin=nowSysDate//否则则是当前时间为最小值						
					};
				$('#checkEndDate').datetimepicker({					
					minDate:NewDateT(checkEndMin)
				})
			},			
	});
};


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