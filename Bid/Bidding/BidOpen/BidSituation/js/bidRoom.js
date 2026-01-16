/**

*  开标情况列表（项目经理）
*  方法列表及功能描述
*/
//接口地址
var stopUrl = config.tenderHost + "/BidOpeningController/stop.do";  //暂停开标
var restartUrl = config.tenderHost + "/BidOpeningController/restart.do";  //恢复开标
var startUrl = config.tenderHost + "/BidOpeningController/start.do";  //开始开标
var logUrl = config.tenderHost + "/BidOpeningLogController/findBidOpeningLogList.do";  //日志列表
var logNewUrl = config.tenderHost + "/BidOpeningLogController/findBidOpeningLogListLast.do";  //刷新日志列表
var countDownUrl = config.tenderHost + "/BidOpeningConfigurationController/countdown.do";  //倒计时
var findDecryptUrl = config.tenderHost + "/BidOpeningConfigurationController/findByBidOpeningConfigurationId.do";  //查询确认一览表Url
var endDecryptUrl = config.tenderHost + "/BidOpeningController/endDecrypt.do";  //生成确认一览表Url
var endUrl = config.tenderHost + "/BidOpeningController/end.do";  //


var checkSignHtml = "Bidding/BidOpen/BidSituation/model/checkSign.html";//查看签到信息
var decryptHtml = "Bidding/BidOpen/BidSituation/model/fileDecrypt.html";//投标文件解密/确认查看
var newsHtml = "Bidding/BidOpen/BidSituation/model/sendNews.html";//发送消息页面
var set;//定时器
var rowData='';//从父级传过来的数据
var packageId = "";  //标段id
var logTimer = "";  //看板信息定时器
var createDate = "";  //距离上一次接收日志的最后的时间
var sendDate = "";  //最后一次接收消息的时间
var msgTime = 1000;
var countNum = 1800000;  //开标倒计时时间
var bidOpeningConfigurationId = "";//解密设置ID
$(function(){
	
	
	//控制左右两边的高度一致
//	$("#bidderList").height($('#functionList').height());
	//切换标段
	$("#bidderList").on("click", "li", function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		reset();
		packageId = $(this).attr("data-id");
		bidNewLog(packageId);
		logTimer=setInterval(function(){
	    bidNewLog(packageId);
	  },msgTime);
		
		countDown(packageId);
		set=setInterval(function(){
			countDown(packageId);
		}, 1000);
	});
	//查看签到信息
	$('#btnView').click(function(){
		checkSign();
	});
	//下达开标指令
	$('#btnOrder').click(function(){
		parent.layer.alert('确定下达开标指令？',{icon: 3,title:'询问'},function(index){
			bidStart(packageId);
			parent.layer.close(index);
		})
	});
	//暂停开标
	$('#btnPause').click(function(){
		var _this = $(this);
		
//		_this.html('恢复开标').removeClass('btnPause').addClass('renewBid');
		parent.layer.alert('确认暂停开标？',{icon: 3,title:'询问'},function(index){
			
			parent.layer.prompt({
				formType: 2,
				title:'暂停原因',
				area: ['300px', '100px'] 
			},function(value, ind, elem){
			  	parent.layer.close(ind);
			  	bidStop("",value);
			  	
			});
			parent.layer.close(index);
			
		})
	});
	//恢复开标
	$('#btnReview').click(function(){
		bidRestart("");
//		var that = $(this);
//		alert('恢复开标');
//		that.css('display','none');
//		$('#btnPause').css('display','inline');
////		that.html('暂停开标').removeClass('renewBid').addClass('btnPause');
	});
	//结束开标
	$('#btnEnd').click(function(){
		parent.layer.alert('确认结束开标？',{icon: 3,title:'询问'},function(index){
			parent.layer.close(index);
			bidEnd();
		})
	});
	//投标文件解密/确认查看
	$('#btnDecrypt').click(function(){
		decrypt();
	});
	//发送消息
	$('#btnSend').click(function(){
		parent.layer.open({
			type: 2,
			title: '消息',
			area: ['600px', '430px'],
			content: newsHtml + "?packageid="+packageId,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
	//			console.log(iframeWin)
				//调用子窗口方法，传参
	//			iframeWin.bidFromFathar(rowData);  
			}
		});
	});

	//开标一览表查看
	$('#btnOpen').click(function(){
		//openPreview('/20190324/pdf/cf8ddb3c33f125646abead8d1c00cf30.pdf');
		$.ajax({
	         url: findDecryptUrl,
	         type: "post",
	         data: {
	         	id:bidOpeningConfigurationId, //bidOpeningConfigurationId
	         },
	         success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}
	         	if(data.data && data.data.pdfUrl){
	         		openPreview(data.data.pdfUrl);
	         	}else{
	         		parent.layer.alert("未生成开标一览表,请稍候查看",{icon:7,title:'提示'});
	        		return;
	         	}
	         },
	         error: function (data) {
	             parent.layer.alert("请求失败");
	         }
	     });
	});
	
	
	//生成开标一览表
	$("#btnCreate").click(function(){ 
		parent.layer.confirm('如有投标人已完成确认操作,生成一览表后须重新确认!  请确定是否生成一览表?', {
		icon: 5,
		title: '询问'
	}, function(index) {
			$.ajax({
		         url: endDecryptUrl,
		         type: "post",
		         data: {
		         	bidOpeningConfigurationId:bidOpeningConfigurationId, //bidOpeningConfigurationId
		         },
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	parent.layer.closeAll();
					parent.layer.alert("生成开标一览表成功", {
						icon: 1,
						title: '提示'
					});
		         },
		         error: function (data) {
		             parent.layer.alert("请求失败");
		         }
		     });
		}, function(index) {
			parent.layer.close(index);
		})
	});
	
	// 设置各个高度
	$(".main").height($("body").height() - $("header").height());
	$(".openPanel").height($(".main").height()-$(".openCount").height()-$(".openBtn").height()-65);
	$("#logBoard, #msgBoard").height($(".openPanel").height()-80);
});
//查看签到信息
function checkSign(){
	parent.layer.open({
		type: 2,
		title: '查看签到信息',
		area: ['70%', '70%'],
		content: checkSignHtml + "?packageid=" + packageId,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(rowData);  
		}
	});
}
//投标文件解密/确认查看
function decrypt(){
	parent.layer.open({
		type: 2,
		title: '投标文件解密/确认查看',
		area: ['70%', '70%'],
		content: decryptHtml+ "?packageId=" + packageId,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(rowData);  
		}
	});
}

function bidFromFathar(data){
	packageId = data[0].id;
	//看板信息
	bidNewLog(packageId);
	logTimer=setInterval(function(){
    bidNewLog(packageId);
  },msgTime);

	rowData = data;
	bidLi(rowData);
	countDown(packageId);
	set=setInterval(function(){
		countDown(packageId);
	}, 1000);
}
/*
 * 左边的标段li
 *data为父页面传过来的数据
 */
function bidLi(data){
	$("#bidderList ul").html('');
	if(data.length>0){
		var li = '';
		for(var i=0;i<data.length;i++){
			if(i == 0){
				li += '<li data-id="'+data[i].id+'" class="active">';
			} else {
				li += '<li data-id='+data[i].id+'>';
			}
			li += '<a href="#" class="interiorBidSectionCode">'+data[i].interiorBidSectionCode+'</a><p><a href="#" class="bidSectionName">'+data[i].bidSectionName+'</a></p></li>'; 
		}
		$(li).appendTo('#bidderList ul');
	}
	
	
}

/**
 * 暂停开标
 * @param {Object} id   解密设置ID
 * @param {Object} stopReason    暂停原因
 */
function bidStop(id, stopReason){
	$.ajax({
         url: stopUrl,
         type: "post",
         data: {
         	bidOpeningConfigurationId:bidOpeningConfigurationId,
         	stopReason:stopReason
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	$("#btnPause").css('display','none');
			$('#btnReview').css('display','inline');
			
			$("#btnDecrypt").attr('disabled','true');
     		$("#btnOpen").attr('disabled','true');
			$('#btnCreate').attr('disabled','true');
			$('#btnSend').attr('disabled','true');
			$('#btnView').attr('disabled','true');
			$('#btnEnd').attr('disabled','true');
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}

/**
 * 恢复开标
 * @param {Object} id  解密设置ID
 */
function bidRestart(id){
	$.ajax({
         url: restartUrl,
         type: "post",
         data: {
         	bidOpeningConfigurationId:bidOpeningConfigurationId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	$("#btnPause").css('display','inline');
			$('#btnReview').css('display','none');
			
         	$("#btnDecrypt").removeAttr('disabled');
     		$("#btnOpen").removeAttr('disabled');
			$('#btnCreate').removeAttr('disabled');
			$('#btnSend').removeAttr('disabled');
			$('#btnEnd').removeAttr('disabled');
			$('#btnView').removeAttr('disabled');
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
/**
 * 开始开标
 * @param {Object} id  标段id
 */
function bidStart(id){
	$.ajax({
         url: startUrl,
         type: "post",
         data: {
         	packageId:id
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	$("#btnOrder").attr('disabled','true');
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
/**
 * 结束开标
 */
function bidEnd(){
	$.ajax({
         url: endUrl,
         type: "post",
         data: {
         	bidOpeningConfigurationId:bidOpeningConfigurationId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	$("#btnOrder").attr('disabled','true');
     		$("#btnPause").attr('disabled','true');
			$('#btnReview').attr('disabled','true');
			$('#btnEnd').attr('disabled','true');
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
/**
 * 日志列表,时间
 * @param {Object} id  标段id
 */
function bidLog(id){
	$.ajax({
         url: logUrl,
         type: "post",
         data: {
         	packageId:id
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	if(arr.length > 0){
	         	createDate = arr[arr.length - 1].createDate;
	         	logHtml(data.data);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}

/**
 * 刷新看板信息
 * @param {Object} id  标段id
 */
function bidNewLog(id){
	$.ajax({
         url: logNewUrl,
         type: "post",
         data: {
         	packageId:id,
         	createDate: createDate,
         	sendDate: sendDate
         },
         beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	   
	    },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var logs = data.data.BidOpeningLog;
         	if(logs.length > 0){
	         	createDate = logs[logs.length - 1].createDate;
	         	logHtml(logs);
         	}
         	var msg = data.data.BidOpeningMess;
         	if(msg.length > 0){
         		sendDate = msg[msg.length - 1].sendDate;
         		msgHtml(msg);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
//看板信息
function logHtml(data){
//	$('#logBoard').html('');
	var li='';
	for(var i = 0;i<data.length;i++){
		li += '<li>'
					+'['+data[i].createDate+']'
					+'<span href="#" class="content">'+data[i].content+'</span>'
				+'</li>'
	}
	$(li).appendTo('#logBoard');
	$('#logBoard').parent().scrollTop($('#logBoard').parent()[0].scrollHeight);
	
}
//看板消息
function msgHtml(data){
	var li='';
	for(var i = 0;i<data.length;i++){
		li += '<li>'
					+'['+data[i].userName+']</span>'
					+'<span class="content">'+data[i].sendMess+'</span>'
				+'</li>'
	}
	$(li).appendTo('#msgBoard');
	$('#msgBoard').parent().scrollTop($('#msgBoard').parent()[0].scrollHeight);
}

/**
 * 开标倒计时
 * @param {Object} id  标段id
 */
function countDown(id){
	$.ajax({
         url: countDownUrl,
         type: "post",
         data: {
         	packageId:id
         },
         beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	   
	    },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	countNum = Number(arr.countdownTime);
         	bidOpeningConfigurationId = arr.id;
         	if(arr.openingState == 0){
         		$("#countDown").text("未开标");
         		
         		$("#btnOrder").removeAttr('disabled');
         		$("#btnPause").removeAttr('disabled');
				$('#btnReview').removeAttr('disabled');
				$('#btnEnd').removeAttr('disabled');
				$('#btnDecrypt').removeAttr('disabled');
				$('#btnView').removeAttr('disabled');
				$('#btnCreate').removeAttr('disabled');
				$('#btnOpen').removeAttr('disabled');
				$('#btnSend').removeAttr('disabled');
         		
				$("#btnPause").css('display','inline');
				$('#btnReview').css('display','none');
	
         	} else if(arr.openingState == 1){
         		if(countNum < 0){
					$("#countDown").html("开标中");
				} else {
         			showTime();
         		}
         		$("#btnOrder").attr('disabled','true');
         		
				$("#btnPause").removeAttr('disabled');
				$('#btnReview').removeAttr('disabled');
				$('#btnEnd').removeAttr('disabled');
				$('#btnDecrypt').removeAttr('disabled');
				$('#btnView').removeAttr('disabled');
				$('#btnCreate').removeAttr('disabled');
				$('#btnOpen').removeAttr('disabled');
				$('#btnSend').removeAttr('disabled');
				
				$("#btnPause").css('display','inline');
				$('#btnReview').css('display','none');
         	} else if(arr.openingState == 2){ //暂停开标
         		if(countNum < 0){
					$("#countDown").html("暂停开标");
				} else {
         			showTime();
         		}
				$("#btnDecrypt").attr('disabled','true');
	     		$("#btnOpen").attr('disabled','true');
				$('#btnCreate').attr('disabled','true');
				$('#btnSend').attr('disabled','true');
				$('#btnEnd').attr('disabled','true');
				$('#btnView').attr('disabled','true');
				$("#btnOrder").attr('disabled','true');
				
				$("#btnPause").removeAttr('disabled');
				$('#btnReview').removeAttr('disabled');
				
				
				
				$("#btnPause").css('display','none');
				$('#btnReview').css('display','inline');
         	} else if(arr.openingState == 3){
         		$("#countDown").text("结束开标");
         		
         		$("#btnDecrypt").attr('disabled','true');
         		$("#btnOrder").attr('disabled','true');
				$("#btnPause").attr('disabled','true');
				$('#btnReview').attr('disabled','true');
				$('#btnCreate').attr('disabled','true');
				$('#btnSend').attr('disabled','true');
				$('#btnEnd').attr('disabled','true');
				$('#btnView').attr('disabled','true');
				$('#btnOpen').attr('disabled','true');
				
				$("#btnPause").css('display','inline');
				$('#btnReview').css('display','none');
				clearInterval(logTimer);
         		clearInterval(set);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
/**
 * 倒计时
 * state  true为正在倒计时,false为停止倒计时
 */
function showTime(){ 
	
//  var m=Math.floor(countNum/(60*1000));//初始分
//  var s = Math.floor((countNum % (60000))/1000);//初始秒
		time_distance = countNum
		var m = Math.floor(time_distance/60000) 
	    time_distance -= m * 60000; 
	    // 秒 
	    var s = Math.floor(time_distance/1000) 

//    if(s<10){
//   //如果秒数少于10在前面加上0
//      $('#time_s').html('0'+s);
//    }else{
//      $('#time_s').html(s);
//    }
//    s--;
//    if(s<0){
//   	//如果秒数少于0就变成59秒
//      s=59;
//      m--;
//    }
	    // 显示时间 
	 	$("#countDown").html("开标倒计时：" + m + "分" + s + "秒");
};



//重置页面
function reset(){
	clearInterval(logTimer);
	clearInterval(set);
	$('#logBoard').html("");
	$('#msgBoard').html("");
	createDate = "";
	sendDate = "";
		
}

