function time(){
	//公告开始时间
    $('#noticeStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',		
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
			$('#noticeStartDate').datetimepicker({						
				minDate:NewDateT(nowSysDate)
			})
		},
		onClose:function(e) {
			$("#StartDate").html($('#noticeStartDate').val());
		},
	});
	//公告截止时间
	$('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){	
			var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();		
			if($('#noticeStartDate').val()!=""){
				if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
					var noticeMin=$('#noticeStartDate').val()+':00'
				}else{
					var noticeMin=nowSysDate
				}				
			}else{
				var noticeMin=nowSysDate
			};
			$('#noticeEndDate').datetimepicker({						
					minDate:NewDateT(noticeMin)
			})
		},
		onClose:function(e) {
			$("#endDate").html($('#noticeEndDate').val())
		},
	});	
	$('#answersEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var answersMinDate="";
			var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();	
			if($('#askEndDate').val()!=""){//判断是否存在提出澄清截止时间
				if(NewDate($('#askEndDate').val())>NewDate(nowSysDate)){//如果存在判断提出澄清截止时间跟当前时间，
					answersMinDate=$('#askEndDate').val()+':00';//如果提出澄清截止时间大于当前时间，则询价的最小值是报价时间
				}else{
					answersMinDate=nowSysDate//小于当前时间。询价的最小时间则为当前时间
				}					
			}else{
				answersMinDate=nowSysDate//不存在则是当前时间
			}
			$('#answersEndDate').datetimepicker({						
					minDate:NewDateT(answersMinDate)
			})
		},
	});
	$('#askEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
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
					//maxDate:askEndMax,
			})
		},
	});
	$('#auctionStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){	
			var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();		
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowSysDate)){	
					var auctionStartMin=$('#noticeEndDate').val()+':00'
				}else{
					var auctionStartMin=nowSysDate
				}				
			}else{
				var auctionStartMin=nowSysDate
			};
			$('#auctionStartDate').datetimepicker({						
					minDate:NewDateT(auctionStartMin)
			})
		},
	});
	$('#fileEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',
			onShow:function(){	
				var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();		
				if($('#noticeStartDate').val()!=""){
					if(NewDate($('#noticeStartDate').val())>NewDate(nowSysDate)){	
						var fileEndMin=$('#noticeStartDate').val()+':00'
					}else{
						var fileEndMin=nowSysDate
					}				
				}else{
					var fileEndMin=nowSysDate
				};
				if($('#auctionStartDate').val()!=""){
					if(NewDate($('#auctionStartDate').val())>NewDate(nowSysDate)){	
						var fileEndMax=$('#auctionStartDate').val()+':00';
					}else{
						var fileEndMax='2100-12-31 23:59:59';
					}					
				}else{
					var fileEndMax='2100-12-31 23:59:59';
				}
				$('#fileEndDate').datetimepicker({						
						minDate:NewDateT(fileEndMin),
						maxDate:NewDateT(fileEndMax)
				})
			},
	});	
	$('#fileCheckEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',
			onShow:function(){	
				var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();			
				if($('#fileEndDate').val()!=""){
					if(NewDate($('#fileEndDate').val())>NewDate(nowSysDate)){	
						var fileCheckEndMin=$('#fileEndDate').val()+':00'
					}else{
						var fileCheckEndMin=nowSysDate
					}				
				}else{
					var fileCheckEndMin=nowSysDate
				};
				if($('#auctionStartDate').val()!=""){
					if(NewDate($('#auctionStartDate').val())>NewDate(nowSysDate)){	
						var fileCheckEndMax=$('#auctionStartDate').val()+':00';
					}else{
						var fileCheckEndMax='2100-12-31 23:59:59';
					}					
				}else{
					var fileCheckEndMax='2100-12-31 23:59:59';
				}
				$('#fileCheckEndDate').datetimepicker({						
						minDate:NewDateT(fileCheckEndMin),
						maxDate:NewDateT(fileCheckEndMax)
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

