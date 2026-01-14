/**
*  zhouyan 
*  2019-3-15
*  开标情况列表（投标人）
*  方法列表及功能描述
*/
var letterHtml = "Bidding/BidOpen/Superiser/BidSituation/model/letterDecrypt.html"
var newsHtml = "Bidding/BidOpen/Superiser/BidSituation/model/sendNews.html";//发送消息页面
var logListUrl = config.tenderHost + '/BidOpeningLogController/findBidOpeningLogList.do';//日志列表

var logNewUrl = config.tenderHost + "/BidOpeningLogController/findBidOpeningLogListLast.do";  //刷新日志列表
var countDownUrl = config.tenderHost + "/BidOpeningConfigurationController/countdown.do";  //倒计时


var set;//定时器
var rowData ;//父级页面传过来的数据

var packageId = "";  //标段id
var logTimer = "";  //看板信息定时器
var createDate = "";  //距离上一次接收日志的最后的时间
var sendDate = "";  //最后一次接收消息的时间
var msgTime = 1000;
var countNum = 1800000;  //开标倒计时时间
var callback;
$(function(){
	
	
	//控制左右两边的高度一致
	$("#bidderList").height($('#functionList').height());
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
        callback();
	});
//	$('#roomContent').on('click','.tab',function(){
//		var li = $(this).closest('li');
//		var index = li.index();
//		li.addClass('active');
//		li.siblings().removeClass('active');
//		tabContent(rowData[index]);
//		logList(rowData[index]);
//		refresh(rowData[index]);
//		
//	});
	
	$("#roomContent").on("click", "li", function(){
		
		$("#roomContent").find("li").removeClass("active");
		$(this).addClass("active");
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
	
	// 设置各个高度
	$(".main").height($("body").height() - $("header").height() - 60 - $("footer").height());
	$(".openPanel").height($(".main").height());
	$(".l-content").height($(".openPanel").height()-40);
	
});


/*父级调用的函数
 * data:父级传过来的数据
 */
function bidFromFathar(data, parentCallback){
	callback = parentCallback;
	rowData = data;
	$('#roomContent').html('');
	if(data.length>0){
		var li = '';
		for(var i = 0;i<data.length;i++){
			li += '<li role="presentation" data-id="'+data[i].id+'"><a href="javacript:void(0)" class="tab">'+data[i].bidSectionName+'</a></li>'
			
		}
		$(li).appendTo('#roomContent');
	}
	$('#roomContent li').eq(0).addClass('active');
	tabContent(data[0]);
	packageId = data[0].id;
	//看板信息
	bidNewLog(packageId);
	logTimer=setInterval(function(){
    bidNewLog(packageId);
  },msgTime);

	
	countDown(packageId);
	set=setInterval(function(){
		countDown(packageId);
	}, 1000);
};
/*
 * tab切换页的内容
 *data:对应页的数据
 */
function tabContent(data){
	var html = $('#tabContent').html();
	$('#formName').html(html);
	$('#formName').find('#interiorBidSectionCode').html(data.interiorBidSectionCode);
	$('#formName').find('#bidSectionName').html(data.bidSectionName);
};

/**
 * 刷新看板信息
 * @param {Object} id  标段id
 */
function bidNewLog(id){
	$.ajax({
         url: logNewUrl,
         type: "post",
         data: {
         	packageId:packageId,
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
					+'<span class="createDate">['+data[i].createDate+']</span>'
					+'<span class="content">'+data[i].content+'</span>'
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
					+'<span class="createDate">['+data[i].userName+']</span>'
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
         	} else if(arr.openingState == 1){
         		if(countNum < 0){
					$("#countDown").html("开标中");
				} else {
         			showTime();
         		}
         		
         	} else if(arr.openingState == 2){ //暂停开标
         		if(countNum < 0){
					$("#countDown").html("暂停开标");
				} else {
         			showTime();
         		}
         	} else if(arr.openingState == 3){
         		
         		$("#countDown").text("结束开标");
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
		time_distance = countNum
		var m = Math.floor(time_distance/60000) 
	    time_distance -= m * 60000; 
	    // 秒 
	    var s = Math.floor(time_distance/1000) 

	    // 显示时间 
	 	$("#countDown").html(m + "分" + s + "秒");
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