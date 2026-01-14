function time(){
	//公告截止时间
	$('#noticeEndDate').click(function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var noticeMin="";
		if($('#noticeStartDate').html()!=""){
			if(NewDate($('#noticeStartDate').html())>NewDate(nowSysDate)){	
				noticeMin=$('#noticeStartDate').html();
			}else{
				noticeMin=nowSysDate;
			}				
		}else{
			noticeMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: noticeMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				$("#endDate").html(selectTime)
			}
		});
	});
	$('#noticeEndDate').change(function(){
		$("#endDate").html($(this).val()||'-');
	});
	$('#answersEndDate').click(function(){
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
	$('#askEndDate').click(function(){
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
	$('#auctionStartDate').click(function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var auctionStartMin="";
		if($('#noticeEndDate').val()!=""){
			if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
				auctionStartMin=$('#noticeEndDate').val();
			}else{
				auctionStartMin=nowSysDate;
			}				
		}else{
			auctionStartMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: auctionStartMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('#fileEndDate').click(function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var fileEndMin="";
		if($('#noticeStartDate').html()!=""){
			if(NewDate($('#noticeStartDate').html())>NewDate(nowSysDate)){	
				fileEndMin=$('#noticeStartDate').html();
			}else{
				fileEndMin=nowSysDate;
			}				
		}else{
			fileEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: fileEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('#fileCheckEndDate').click(function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var fileCheckEndMin="";
		if($('#fileEndDate').val()!=""){
			if(NewDate($('#fileEndDate').val())>NewDate(nowSysDate)){	
				fileCheckEndMin=$('#fileEndDate').val();
			}else{
				fileCheckEndMin=nowSysDate;
			}				
		}else{
			fileCheckEndMin=nowSysDate;
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: fileCheckEndMin,
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
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

