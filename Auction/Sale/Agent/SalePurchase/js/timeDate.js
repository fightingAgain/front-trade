function time(){
	//公告开始时间
	$('form').on('click', '#noticeStartDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate: nowSysDate,
			maxDate:'#F{$dp.$D(\'noticeEndDate\')}',
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				$("#StartDate").html(selectTime||'-');
			}
		});
	});
	$('form').on('change', '#noticeStartDate', function(){
		$("#StartDate").html($(this).val()||'-');
	});
	//公告截止时间
	$('form').on('click', '#noticeEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var noticeMin='';
		if($('#noticeStartDate').val()!=""){
			if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
				noticeMin=$('#noticeStartDate').val().substring(0,10);
			}else{
				noticeMin=nowSysDate.substring(0,10);
			}				
		}else{
			noticeMin=nowSysDate.substring(0,10);
		}
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd 23:59',
			minDate: noticeMin,
			// maxDate:'#F{$dp.$D(\'trainEndTime\')}',
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				$("#endDate").html(selectTime||'-');
			}
		});
	});
	$('form').on('change', '#noticeEndDate', function(){
		$("#endDate").html($(this).val()||'-');
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
			maxDate:'#F{$dp.$D(\'answersEndDate\')}',
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
			// maxDate:'#F{$dp.$D(\'auctionEndDate\')}',
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	
	$('form').on('click', '#fileEndDate', function(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var fileEndMin="";
		if($('#noticeStartDate').val()!=""){
			if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
				fileEndMin=$('#noticeStartDate').val();
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
			// maxDate:'#F{$dp.$D(\'auctionEndDate\')}',
			onpicked:function(dp){
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
			}
		});
	});
	$('form').on('click', '#fileCheckEndDate', function(){
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
			// maxDate:'#F{$dp.$D(\'auctionEndDate\')}',
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

