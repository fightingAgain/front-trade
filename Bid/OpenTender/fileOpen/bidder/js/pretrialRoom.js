/***********************************************全局变量***********************************************/
var IntervalTime = ''; //倒计时时间
var index= 29;
var stage='';
var bidId = $.getUrlParam("bid");	//标段id
var bidOpeningId = ''; //开启数据id
var entryData; //登录信息
var bidIntervalID = "";	//标段定时器
var stepIntervalID = "";	//跑马灯定时器
var mask = "";//遮罩
var CAcf = null;
/***新计时***/
var getTimeUrl = config.OpenBidHost + "/sysTime.do";//获取系统时间
var nowState = '';//当前状态
var nowSignIn = '';//当前签到状态
var nowSecret = '';//当前解密状态
var nowSign = '';//当前签名状态
var timeIntervalID = "";//时间定时器
var overBidOpenTime = '';//开标时间
var overSecretTime = '';//解密时间
var overSignTime = '';//签名时间
var isStop = '';//是否暂停
var lasIntervaltTime = '';//倒计时定时器最后执行的时间
var correctTime = 10;//纠正倒计时的时间段s
var correctTimeCount = 0;//纠正计次
var restLength = 0;//暂停时的剩余时间
var changeFrequencyTime = 60*1000 //改变纠正频率的倒计时时间s
var changedCorrectTime = 1 //改变纠正频率后的 纠正倒计时的时间段s与correctTime相关
/***新计时***/
/***********************************************页面加载完初始化****************************************/
//页面初始化
$(document).ready(function(){
	//获取用户信息
	entryInfo();
	
	if(entryData != null && entryData != undefined){
		$("#userName").html(entryData.enterpriseName);
	}
	
	//初始化表格
	getOpeningBidList();
	
	//每秒刷新倒计时
	sysInterval();
	
	//按Enter键发送消息
	$(document).keydown(function(event){
　　　　if(event.keyCode == 13)chatWithMananger();
　　	});
	
	//跑马灯
	stepIntervalID = window.setInterval(function() {
		//进度
		stepTimer(stage);
		index++;
	},125);
	/***新计时***/
	setCountdown(true, true);
	/***新计时***/
});
/***新计时***/
	//isSet 是否开启定时器
	//isGetState  是否获取签到、暂停状态（第一次进入时需要、其它就是状态发生变化时才改变其值）
	function setCountdown(isSet, isGetState){
		findBidOpening(bidId, isGetState);
		var endTime = '';
		console.log(nowState)
		if(nowState  == ''){
			nowState = 0;
		}
		console.log('是否暂停：',isStop);
		if(isStop == 1){
			// console.log('暂停',timeIntervalID)
			if(timeIntervalID != ''){
				// console.log('暂停--关',timeIntervalID)
				clearInterval(timeIntervalID);
				timeIntervalID = '';
			}
			if(!nowSignIn || nowSignIn == ''){
				//开标暂停（解密阶段暂停）投标人未签到时不显示倒计时
				computeTime(0);
			}else{
				computeTime(restLength);
			}
		}else{
			console.log('开启阶段：',nowState)
			if(nowState == 0 || nowState == 1 || nowState == 2){
				if(nowState == 0){//签到
					endTime = handleTimeFormat(overBidOpenTime);
					sysTime(endTime, isStop,isSet);
				}else if(nowState == 1){//解密
					endTime = handleTimeFormat(overSecretTime);
					//console.log('1=签到状态',nowSignIn)
					if(nowSignIn == '1'){//投标人签到
						sysTime(endTime, isStop,isSet);
					}else{//投标人未签到
						if(timeIntervalID != ''){
							clearInterval(timeIntervalID);
							timeIntervalID = '';
						}
						computeTime(0);
					}
				}else if(nowState == 2){//签名
					endTime = handleTimeFormat(overSignTime);
					if(nowSecret == 1){
						sysTime(endTime, isStop, isSet);
					}else{
						if(timeIntervalID != ''){
							clearInterval(timeIntervalID);
							timeIntervalID = '';
						}
						computeTime(0);
					}
				}
				
			}else{
				countDown = 0;
				if(timeIntervalID != ''){
					clearInterval(timeIntervalID);
					timeIntervalID = '';
				}
				computeTime(0);
			}
		}
	}
	//处理时间格式
	function handleTimeFormat(time){
		var endDateM = '';
		if(isNaN(time)){
			endDateM = (new Date(time.replace(new RegExp("-","gm"),"/"))).getTime(); //得到毫秒数
		}else{
			endDateM = (new Date(time)).getTime(); //得到毫秒数
		}
		return endDateM;
	}
	/* ***********   获取服务器时间     ********** */
	/*endTime 结束时间
	isStop 开标是否暂停
	isSet 是否开启定时器
	*/
   var countDown = 0;//倒计时剩余时间
   var lastPostSysTime = 0;//上次请求服务器时间
   var lastSysTime = '';//上次服务器返回时间
	function sysTime(endTime, isStop, isSet) {
		$.ajax({
			type: "get",
			url: getTimeUrl,
			async: false,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(data) {
				if(data.success) sysdateTime = NewDate(data.data);
				var timeDiff = sysdateTime - new Date().getTime();
				// 当前时间 = 本地时间 + 时间差
				var currTime = new Date().getTime() + timeDiff;
				// 倒计时时间 = 截止时间 - 当前时间
				//当系统返回的时间计算出来的倒计时剩余时间比当前倒计时里的剩余时间大，则舍弃
				/* if(countDown && (endTime - currTime) > countDown){
					console.error(data.data+','+lastSysTime);
				}else{
					countDown = endTime - currTime;
				} */
				countDown = endTime - currTime;
				lastSysTime = data.data;
				//console.log('纠正时间：',countDown);
				if(countDown <= changeFrequencyTime){
					if(correctTime != changedCorrectTime){
						correctTime = changedCorrectTime;
					}
				}else{
					correctTime = 10;
				}
				//console.log('是否设置定时器',isSet)
				if(isSet){
					if(timeIntervalID != ''){
						// console.log('关',timeIntervalID)
						clearInterval(timeIntervalID);
						timeIntervalID = '';
					}
					timeIntervalID = window.setInterval(function() {
						// console.log('开',timeIntervalID)
						if(countDown > 0){
							countDown = countDown -1000;
						}else{
							countDown = 0;
						}
						//console.log('倒计时：',countDown);
						if(!isStop){
							correctTimeCount = correctTimeCount + 1;
							if(Math.abs(lastPostSysTime - new Date().getTime()) > 2000){
								correctTimeCount = 10;
							}
							lastPostSysTime = new Date().getTime();
							console.log('计数：',correctTimeCount);
							console.log('系统时间：',new Date());
							// console.log('系统时间 - 最后时间 =',Math.abs(new Date().getTime() - lasIntervaltTime));
							if(correctTimeCount >= correctTime){
								//长时间纠正一次倒计时
								setCountdown(false);
								correctTimeCount = 0;
							}
						}
						computeTime(countDown);
						//记住最后执行定时器的时间（用来纠正系统后台运行时定时器被浏览器停止的时间差）
						// lasIntervaltTime = new Date().getTime();
					}, 1000)
				}
				
			}
		});

		//2.计算日历时间
		initCurssrentDate(lastSysTime);
	};
	var oldHours = '';//上次的时
	var oldMinute = '';//上次的分
	//倒计时计算
	function computeTime(ss){
		if(parseFloat(ss) <= 0){
			$("#hoursOne").html(0);
			$("#hoursTwo").html(0);
			$("#minuteOne").html(0);
			$("#minuteTwo").html(0);
			$("#secondOne").html(0);
			$("#secondTwo").html(0);
			oldHours = '0';
			oldMinute = '0';
		}else{
			var time = parseFloat(ss) / 1000;   //先将毫秒转化成秒
			var hours = Math.floor(time /3600 ).toString();  // parseInt((IntervalTime /1000/60/60%3600000)).toString();	//时
			var minute =  Math.floor((time /60 % 60)).toString();  // parseInt((IntervalTime /1000/60%60000-)).toString();	//分
			var second =  Math.floor((time % 60)).toString();   //parseInt((IntervalTime % (1000 * 60)) / 1000).toString();  //秒
			if(hours != oldHours){
				if(hours.length< 2){
					$("#hoursOne").html(0);
					$("#hoursTwo").html(hours);
				}else{
					$("#hoursOne").html(hours.substring(0,hours.length-1));
					$("#hoursTwo").html(hours.substring(hours.length-1,hours.length));
				}
				oldHours = hours;
			}
			if(minute != oldMinute){
				if(minute.length< 2){
					$("#minuteOne").html(0);
					$("#minuteTwo").html(minute);
				}else{
					$("#minuteOne").html(minute.substring(0,minute.length-1));
					$("#minuteTwo").html(minute.substring(minute.length-1,minute.length));
				}
				oldMinute = minute;
			}
			if(second.length< 2){
				$("#secondOne").html(0);
				$("#secondTwo").html(second);
			}else{
				$("#secondOne").html(second.substring(0,second.length-1));
				$("#secondTwo").html(second.substring(second.length-1,second.length));
			}
		}
	}
	
	/***新计时***/
/*************************************************页面各种方法*****************************************/
/**初始化今天开启数据列表*/
function getOpeningBidList(){
	$.ajax({
		type: "POST",
		url: config.OpenBidHost+"/BidderFileOpenController/findBidSectionPretrial.do",
		async: false,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data) {
			if(data.success){
				//清空项目列表
				$("#pojectsData").empty();
				//共有几个项目
				$("#nums").html(data.data.length);
				//循环添加项目信息
				for(var i = 0;i < data.data.length;i++) {
					//带背景色
					var uibg = '<li class="lan" value="'+data.data[i].id+','+data.data[i].bidSectionName+'"><div class="hao">'+(i+1)+'</div>'
				  		+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
					//不带背景色
					var ui = '<li class="bs" value="'+data.data[i].id+','+data.data[i].bidSectionName+'"><div class="hao">'+(i+1)+'</div>'
				  		+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
					//选中当前数据行
					if(bidId == data.data[i].id){
						$("#pojectsData").append(uibg);
						$("#ptitle").html(""+data.data[i].bidSectionName+"项目开启大厅");
					}else{
						$("#pojectsData").append(ui);
					}
						
					/**点击行切换数据*/
					$("#pojectsData li").click(function(){
						//切换时,开启遮罩
						mask =parent.layer.load(0, {shade: [0.3, '#000000']});
					    $(".lan").removeClass("lan").addClass("bs");
					    $(this).addClass("lan");
					    var value = $(this).attr("value");
					    var arr = value.split(",");
					    //标段id
					    bidId = arr[0];
					    $("#ptitle").html(""+arr[1]+"项目开启大厅");
					    $("#handlerBtn").hide();
						/***新计时***/
						if(timeIntervalID != ''){
							clearInterval(timeIntervalID);
							timeIntervalID = '';
						}
						countDown = 0;
						setCountdown(true, true);
						/***新计时***/
					});
				}
			} 
		}
	});
}

//页面轮询
function sysInterval() {
	bidIntervalID = window.setInterval(function() {
		//查询标段信息状态
		findBidOpening(bidId);
	}, 1000);
}

/**查询标段信息状态*/
/*isNotCorrect true 不计入纠正
	isGetState  是否获取签到、暂停状态（第一次进入时需要、其它就是状态发生变化时才改变其值）
	*/
function findBidOpening(id, isGetState){
    //如果id不为空，则查询数据
    if(id != ""){
    	$.ajax({
			type: "get",
			url: config.OpenBidHost+"/BidderFileOpenController/pushBidSection?bidSectionId="+id+"&Token="+sessionStorage.getItem('token'),
			async: false,
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
			success: function(rsp) {
				if(rsp.success && rsp.data){
					/***新计时***/
					overBidOpenTime = rsp.data.infors.bidOpenTime?rsp.data.infors.bidOpenTime:'';//开标时间
					overSecretTime = rsp.data.infors.decryptEndDate?rsp.data.infors.decryptEndDate:'';//解密时间
					overSignTime = rsp.data.infors.signEndTime?rsp.data.infors.signEndTime:'';//签名时间
					//第一次进入页面时拿签到状态、暂停状态
					if(isGetState){
						nowSignIn = rsp.data.infors.results.signInResult;//当前签到状态
						isStop = rsp.data.infors.stopStates;//是否暂停
					}
					//console.log('当前状态',nowSignIn)
					// console.log('系统当前状态',rsp.data.infors.results.signInResult)
					if(nowSignIn != rsp.data.infors.results.signInResult){
						nowSignIn = rsp.data.infors.results.signInResult;//当前签到状态
						//当定时器未开启时要开启定时器
						if(timeIntervalID == '' ){
							setCountdown(true);
						}else{
							setCountdown(false);
						}
					}
					nowSecret = rsp.data.infors.results.decryptResult;//当前解密状态
					nowSign = rsp.data.infors.results.signResult;//当前签名状态
					//当前阶段发生变化时
					// console.log('当前阶段',nowState)
					// console.log('系统当前阶段',rsp.data.infors.stageStates)
					if(nowState != rsp.data.infors.stageStates){
						nowState = rsp.data.infors.stageStates;//当前阶段
						setCountdown(false);
					}
					// console.log('当前暂停状态',isStop)
					// console.log('系统当前暂停状态',rsp.data.infors.stopStates)
					if(isStop != rsp.data.infors.stopStates){
						isStop = rsp.data.infors.stopStates;//是否暂停
						//console.log('当前暂停状态',isStop)
						if(timeIntervalID != ''){
							clearInterval(timeIntervalID);
							timeIntervalID = '';
						}
						setCountdown(true);
					}
					//暂停时的剩余时间
					restLength = rsp.data.infors.restLength?rsp.data.infors.restLength:'0';
					//签到、解密、签名时进行时间偏差纠正
					
					
					/***新计时***/
					setTarget(rsp.data.infors);
				} 
			}
		});	
	}
}


//配置目标标段信息
function setTarget(obj){
	//0.开启数据id
	bidOpeningId = obj.id;
	//1.获取服务器时间
	var sysTime = obj.sysTime;
	//3.查看聊天消息
	if(obj.messages)autoChatMessage(obj.messages);
	//4.显示阶段
	progressStage(sysTime,obj);
}
/*************************************************签到|解密|签名|唱标|结束******************************************************************/
function handleBidEachStage(that){
	var pharse = $(that).attr("phare");//类型
	
	if(pharse=="0"){
		//ca签到
		$('#handlerBtn').css('pointer-events', 'none');//防止连续点击
		caSignIn();
	}else if(pharse=="1"){
		//获取签名信息
		var fileUrl = $(that).attr("fileUrl");
		var keytext = $(that).attr("keytext");
		//ca解密
		layer.open({
			type:2, 
			title:'开启解密', 
			area:['500px','230px'],
			content:'casignal.html?bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId+'&keytext='+keytext+'&fileUrl='+fileUrl+'&Token='+sessionStorage.getItem('token'),
			scrollbar:false,
		});
	}else if(pharse=="2"){
		//ca签名
		$('#handlerBtn').css('pointer-events', 'none');//防止连续点击
		caSign();
	}
}


/**************************************************消息************************************************************************************/
//发送消息给项目经理
function chatWithMananger(){
	var msg = $("#msg").val();//获取消息
	//解决ie兼容性问题
	if(msg == $("#msg").attr('placeholder')){
		msg = '';
	}
	
	//为空不发送消息
	if($.trim(msg)!=""){
		if(msg.length<300){
			var message = {"bidSectionId":bidId, "sendMess":msg,"examType":1};
			$.ajax({
				type: "post",
				url: config.OpenBidHost+"/BidOpeningMessController/addBidOpeningMess",
				data: message,
				async: false,
				beforeSend: function(xhr) {
					var token = $.getToken();
					xhr.setRequestHeader("Token",token);
				},
				success: function(rsp) {
					if(rsp.success && rsp.data.result)$("#msg").val("");
				}
			});
		}else{
			layer.alert("发送的消息不能超过300字!");
		}
	}
}

//展示消息
function autoChatMessage(obj){
	$("#chartWin").empty();
	for(var i=0; i<obj.length; i++){
		if(obj[i].enterpriceName == "系统消息"){
			var message = "<li><div style='width:100%;word-wrap:break-word;word-break:break-all;'>【"+obj[i].sendDate+"】&ensp;<B>"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</B></div></li>";
			$("#chartWin").append(message);
		}else{
			var message = "<li><div style='width:100%;word-wrap:break-word;word-break:break-all;'>【"+obj[i].sendDate+"】&ensp;"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</div></li>";
			$("#chartWin").append(message);
		}
	}
}

/***********************************************进度***************************************************************************/
//进度阶段
function progressStage(sysTime,obj){
	//判断是否有遮罩
	if(mask !=""){
		//关闭遮罩
		parent.layer.close(mask);
		//置空
		mask = "";
	}
	$("#handlerBtn").show();
	$("#stageStates").val(obj.stageStates);
	switch(obj.stageStates) {
		//签到
		case 0:
	    	//状态
			$("#current").html("签到");
			//倒计时
			//initInterval(sysTime,obj.bidOpenTime);
			//签到状态
			if(obj.results.signInResult == 1){
				$("#handlerBtn").empty().html("签到完成").attr("disabled","disabled").removeClass("on").css('pointer-events', 'none');
			}else{
				$("#handlerBtn").empty().html("签到").attr("phare","0").removeAttr("disabled").addClass("on").css('pointer-events', 'auto');
			}
			
			//阶段显示
			$("#qd_1").removeClass().addClass("step step2 on");
			$("#jm_2").removeClass().addClass("step step1");
			$("#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step4");
			//滑竿
			stage=".step2 i";
			break;
		//解密	
		case 1:
			//解密状态
			if(obj.results.signInResult == 1){
				if(obj.results.decryptResult == 1){
					$("#handlerBtn").empty().html("解密完成").attr("disabled","disabled").removeClass("on").css('pointer-events', 'none');
					$("#offerBtn").show(); 
				}else{
					$("#handlerBtn").empty().html("解密").attr("phare","1").attr("keytext",obj.results.secretKeyText).attr("fileUrl",obj.results.fileUrl).removeAttr("disabled").addClass("on").css('pointer-events', 'auto');
				}
				//是否暂停
				if(obj.stopStates == 1){
		    		//initInterval(0, obj.restLength);
		    		//状态
					$("#current").html("解密(暂停)");
					$("#handlerBtn").attr("disabled","disabled").css('pointer-events', 'none');
		    	}else{
				    //倒计时
					//initInterval(sysTime, obj.decryptEndDate);
					//状态
					$("#current").html("解密");
		    	}
				
				//阶段显示
				$("#jm_2").removeClass().addClass("step step2 on");
				$("#qd_1,#qm_2").removeClass().addClass("step step1");
				$("#js_2").removeClass().addClass("step4");
				//滑竿
				stage=".step2 i";
			}else{
				//签到状态
				if(obj.results.signInResult == 1){
					$("#handlerBtn").empty().html("签到完成").attr("disabled","disabled").removeClass("on").css('pointer-events', 'none');
				}else{
					$("#handlerBtn").empty().html("签到").attr("phare","0").removeAttr("disabled").addClass("on").css('pointer-events', 'auto');
				}
				
				if(obj.openExecute == 2){
					//开启按钮
					$("#handlerBtn").hide();
				}
				
				//倒计时
				//initInterval(0,0);//置空
				//状态
				$("#current").html("签到");
				//按钮
				$("#kbyy,#kbylb,#offerBtn").hide();
				//阶段显示
				$("#qd_1").removeClass().addClass("step step2 on");
				$("#jm_2,#qm_2").removeClass().addClass("step step1");
				$("#js_2").removeClass().addClass("step4");
				//滑竿
				stage=".step2 i";
			}
			break;
		//签名
		case 2:
			if(obj.results.decryptResult == 1){
				//签名状态
				if(obj.results.signResult == 1) {
					$("#handlerBtn").empty().html("签名完成").attr("disabled","disabled").removeClass("on").css('pointer-events', 'none');
				}else {
					$("#handlerBtn").empty().html("签名").attr("phare","2").attr("fileUrl",obj.results.signPdf).removeAttr("disabled").addClass("on").css('pointer-events', 'auto');
				}
			}else{
				//隐藏签名按钮
				$("#handlerBtn").hide();
				//清除定时器
				window.clearInterval(bidIntervalID); 
				window.clearInterval(stepIntervalID); 
				
				layer.alert('解密失败,即将退出', {
				     icon:5,
				     title:'提示',
				     closeBtn: 1 ,   // 是否显示关闭按钮
				     btn: ['确定'], //按钮
				     yes:function(){
				         custom_close();
				     }
				});
			}
			//是否暂停
			if(obj.stopStates == 1){
				//倒计时
	    		//initInterval(0, obj.restLength);
	    		//状态
				$("#current").html("签名(暂停)");
				$("#handlerBtn").attr("disabled","disabled").css('pointer-events', 'none');
	    	}else{
			    //倒计时
				//initInterval(sysTime, obj.signEndTime);
				//状态
				$("#current").html("签名");
	    	}
	    	//阶段显示
			$("#qd_1,#jm_2").removeClass().addClass("step step1");
			$("#qm_2").removeClass().addClass("step step2 on");
			$("#js_2").removeClass().addClass("step4");
			//滑竿
			stage=".step2 i";
			break;
		//结束
		case 4:
			//状态
			$("#current").html("结束");
			//倒计时
			//initInterval(0,0);//置空
			$("#stageStates").val(4);
			//阶段显示
			$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step4");
			$("#handlerBtn").hide();//隐藏签名按钮
			//滑竿
			stage="";
			break;
		//失败
		case 5:
			//状态
			$("#current").html("失败");
			//倒计时
			//initInterval(0,0);//置空
			$("#stageStates").val(4);
			$("#handlerBtn").hide();//隐藏签名按钮
			//阶段显示
			$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step4");
			//滑竿
			stage="";
			break;
		//结束中
		case 6:
			//状态
			$("#current").html("结束中");
			//倒计时
			//initInterval(0,0);//置空
			$("#stageStates").val(6);
			$("#handlerBtn").hide();//隐藏签名按钮
			//阶段显示
			$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step5");
			//滑竿
			stage="";
			break;
	}	
}

/**开启进度滑杆*/
function stepTimer(stage){
	if(stage !=''){
		if(index >= $(".step").width()-10){
            index = 29;
        }
		$(stage).css("left", index+"px");
	}
}
/**********************************************日历时间**************************************************************************/
//初始化时间
function initCurssrentDate(systime){
	var arr = formatUnixtimestamp(systime).split(" ");
	$("#hms").empty().html(arr[1]);
	$("#ymd").empty().html(arr[0].split("-")[0] + "年" + arr[0].split("-")[1] + "月" + arr[0].split("-")[2] + "日");
}
	
//字符串时间转时间
function NewDate(str) {
	if(!str) return 0;
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1], t[2], 0);
	return date.getTime();
}
	
//时间格式化
function formatUnixtimestamp(inputTime) {
	var date = new Date(inputTime.replace(new RegExp("-","gm"),"/"));
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

/***********************************倒计时********************************************/
//初始化倒计时
function initInterval(time,endTime) {
	var timeDateM = 0;
	var endDateM = 0;
	if(isNaN(time)){
		timeDateM = (new Date(time.replace(new RegExp("-","gm"),"/"))).getTime(); //得到毫秒数
	}else{
		timeDateM = (new Date(time)).getTime(); //得到毫秒数
	}
	if(isNaN(endTime)){
		endDateM = (new Date(endTime.replace(new RegExp("-","gm"),"/"))).getTime(); //得到毫秒数
	}else{
		endDateM = (new Date(endTime)).getTime(); //得到毫秒数
	}
	IntervalTime = endDateM-timeDateM;
	if(IntervalTime>0){
		if($.trim(IntervalTime)!=""){
			var time = parseFloat(IntervalTime) / 1000;   //先将毫秒转化成秒
			var hours = Math.floor(time /3600 ).toString();  // parseInt((IntervalTime /1000/60/60%3600000)).toString();	//时
			var minute =  Math.floor((time /60 % 60)).toString();  // parseInt((IntervalTime /1000/60%60000-)).toString();	//分
			var second =  Math.floor((time % 60)).toString();   //parseInt((IntervalTime % (1000 * 60)) / 1000).toString();  //秒
							
			if(hours.length< 2){
				$("#hoursOne").html(0);
				$("#hoursTwo").html(hours);
			}else{
				$("#hoursOne").html(hours.substring(0,hours.length-1));
				$("#hoursTwo").html(hours.substring(hours.length-1,hours.length));
			}	
			
			if(minute.length< 2){
				$("#minuteOne").html(0);
				$("#minuteTwo").html(minute);
			}else{
				$("#minuteOne").html(minute.substring(0,minute.length-1));
				$("#minuteTwo").html(minute.substring(minute.length-1,minute.length));
			}
					
			if(second.length< 2){
				$("#secondOne").html(0);
				$("#secondTwo").html(second);
			}else{
				$("#secondOne").html(second.substring(0,second.length-1));
				$("#secondTwo").html(second.substring(second.length-1,second.length));
			}
		}
	}else{
		$("#minuteOne").html(0);
		$("#minuteTwo").html(0);
		$("#secondOne").html(0);
		$("#secondTwo").html(0);
	}
}

function passMessage(data,callback){
	/*************************************           关闭页面            ****************************************/
	$(document).on('click','#custom_close',function(){
		callback()
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
}

	/********************************************************************获取当前登录人信息***************************************************/
	function entryInfo(){
		$.ajax({
			type:"post",
		  	url:config.tenderHost + '/getEmployeeInfo.do',
		  	async:false,
		  	beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
		  	success: function(data){
		  		if(data.success){
		  			entryData = data.data;
		  		}
		  	}
		})
	}
