/***********************************************全局变量***********************************************/
var IntervalTime = ''; //倒计时时间
var index= 29;
var stage='';
var bidId = $.getUrlParam("bid");	//标段id
var bidOpeningId = ''; //开标数据id
var entryData; //登录信息
/***********************************************页面加载完初始化****************************************/
//页面初始化
$(document).ready(function(){
	//获取用户信息
	entryInfo();
	if(entryData != null && entryData != undefined){
		$("#userName").html(entryData.userName);
	}
	//初始化表格
	getOpeningBidList();
	//每秒刷新倒计时
	sysInterval();
	//按Enter键发送消息
	$(document).keydown(function(event){
　　　　if(event.keyCode == 13)chatWithMananger();
　　	});
});

/*************************************************页面各种方法*****************************************/
/**初始化今天开标数据列表*/
function getOpeningBidList(){
	$.ajax({
		type: "POST",
		url: config.openingHost+"/BidderOpenTenderController/findBidSections.do",
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
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
						$("#ptitle").html(""+data.data[i].bidSectionName+"项目开标大厅");
					}else{
						$("#pojectsData").append(ui);
					}
						
					/**点击行切换数据*/
					$("#pojectsData li").click(function(){
					    $(".lan").removeClass("lan").addClass("bs");
					    $(this).addClass("lan");
					    var value = $(this).attr("value");
					    var arr = value.split(",");
					    //标段id
					    bidId = arr[0];
					    $("#ptitle").html(""+arr[1]+"项目开标大厅");
					});
				}
			} 
		}
	});
}

//页面轮询
function sysInterval() {
	window.setInterval(function() {
		//查询标段信息状态
		findBidOpening(bidId);
		//进度
		stepTimer(stage);
		index++;
	}, 1000);
}

/**查询标段信息状态*/
function findBidOpening(id){
    //如果id不为空，则查询数据
    if(id != ""){
    	$.ajax({
			type: "get",
			url: config.openingHost+"/BidderOpenTenderController/pushBidSection?bidSectionId="+id+"&Token="+sessionStorage.getItem('token'),
			async: false,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(rsp) {
				if(rsp.success && rsp.data){
					setTarget(rsp.data.infors);
				} 
			}
		});	
	}
}


//配置目标标段信息
function setTarget(obj){
	//0.开标数据id
	bidOpeningId = obj.id;
	//1.获取服务器时间
	var sysTime = obj.sysTime;
	//2.计算日历时间
	initCurssrentDate(sysTime);
	//3.查看聊天消息
	if(obj.messages)autoChatMessage(obj.messages);
	//4.显示阶段
	progressStage(sysTime,obj);
}
/*************************************************签到|解密|签名|唱标|结束******************************************************************/
function handleBidEachStage(that){
	var pharse = $(that).attr("phare");//类型
	
	if(pharse=="0"){
		//ca签名
		caSignIn();
	}else if(pharse=="1"){
		//获取签名信息
		var fileUrl = $(that).attr("fileUrl");
		var keytext = $(that).attr("keytext");
		//ca解密
		layer.open({
			type:2, 
			title:'开标解密', 
			area:['500px','230px'],
			content:'casignal.html?bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId+'&keytext='+keytext+'&fileUrl='+fileUrl+'&Token='+sessionStorage.getItem('token'),
			scrollbar:false,
		});
	}else if(pharse=="2"){
		var fileUrl = $(that).attr("fileUrl");
		caSign(fileUrl);
	}
}


/**************************************************消息************************************************************************************/
//发送消息给项目经理
function chatWithMananger(){
	var msg = $("#msg").text();//获取消息
	//解决ie兼容性问题
	if(msg == $("#msg").attr('placeholder')){
		msg = '';
	}
	//为空不发送消息
	if($.trim(msg)!=""){
		var message = {"bidSectionId":bidId, "sendMess":msg};
		$.ajax({
			type: "post",
			url: config.openingHost+"/BidOpeningMessController/addBidOpeningMess",
			data: message,
			async: false,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(rsp) {
				if(rsp.success && rsp.data.result)$("#msg").val("");
			}
		});
	}
}

//展示消息
function autoChatMessage(obj){
	$("#chartWin").empty();
	for(var i=0; i<obj.length; i++){
		if(obj[i].enterpriceName == "系统消息"){
			var message = "<li>【"+obj[i].sendDate+"】&ensp;<B>"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</B></li>";
			$("#chartWin").append(message);
		}else{
			var message = "<li>【"+obj[i].sendDate+"】&ensp;"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</li>";
			$("#chartWin").append(message);
		}
	}
}

/***********************************************进度***************************************************************************/
//进度阶段
function progressStage(sysTime,obj){
	$("#handlerBtn").show();
	$("#stageStates").val(obj.stageStates);
	switch(obj.stageStates) {
		//签到
		case 0:
	    	//状态
			$("#current").html("签到");
			//倒计时
			initInterval(sysTime,obj.bidOpenTime);
			//签到状态
			if(obj.results.signInResult == 1){
				$("#handlerBtn").empty().html("签到完成").attr("disabled","disabled");
			}else{
				$("#handlerBtn").empty().html("签到").attr("phare","0").removeAttr("disabled");
			}
			//按钮
			$("#kbyy,#kbylb").hide();
			
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
					$("#handlerBtn").empty().html("解密完成").attr("disabled","disabled");
				}else{
					$("#handlerBtn").empty().html("解密").attr("phare","1").attr("keytext",obj.results.secretKeyText).attr("fileUrl",obj.results.fileUrl).removeAttr("disabled");
				}
				//是否暂停
				if(obj.stopStates == 1){
		    		initInterval(0, obj.restLength);
		    		//状态
					$("#current").html("解密(暂停)");
					//按钮
					$("#kbyy,#kbylb").hide();
					$("#handlerBtn").attr("disabled","disabled");
		    	}else{
				    //倒计时
					initInterval(sysTime, obj.decryptEndDate);
					//状态
					$("#current").html("解密");
					//按钮
					$("#recover,#kbylb").hide();
					$("#suspend,#kbyy").show();
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
					$("#handlerBtn").empty().html("签到完成").attr("disabled","disabled");
				}else{
					$("#handlerBtn").empty().html("签到").attr("phare","0").removeAttr("disabled");
				}
				
				if(obj.openExecute == 2){
					//开标按钮
					$("#handlerBtn").hide();
				}
				
				//倒计时
				initInterval(0,0);//置空
				//状态
				$("#current").html("签到");
				//按钮
				$("#kbyy,#kbylb").hide();
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
					$("#handlerBtn").empty().html("签名完成").attr("disabled","disabled");
				}else {
					$("#handlerBtn").empty().html("签名").attr("phare","2").attr("fileUrl",obj.pdfUrl).removeAttr("disabled");
				}
			}else{
				//隐藏签名按钮
				$("#handlerBtn").hide();
			}
			//是否暂停
			if(obj.stopStates == 1){
				//倒计时
	    		initInterval(0, obj.restLength);
	    		//状态
				$("#current").html("签名(暂停)");
				//按钮
				$("#kbyy,#kbylb").hide();
				$("#handlerBtn").attr("disabled","disabled");
			    $("#recover").show();
	    	}else{
			    //倒计时
				initInterval(sysTime, obj.signEndTime);
				//状态
				$("#current").html("签名");
				//按钮
				$("#recove").hide();
				$("#kbyy").show();
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
			initInterval(0,0);//置空
			//添加一览表路径
			$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
			//按钮
			$("#recover,#suspend,#kbyy,#handlerBtn").hide();
			$("#kbylb,#kbyy").show();
			$("#stageStates").val(4);
			//阶段显示
			$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step4");
			//滑竿
			stage="";
			break;
		//失败
		case 5:
			//状态
			$("#current").html("失败");
			//倒计时
			initInterval(0,0);//置空
			//添加一览表路径
			$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
			//按钮
			$("#recover,#suspend,#handlerBtn").hide();
			$("#kbylb,#kbyy").show();
			$("#stageStates").val(4);
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
			initInterval(0,0);//置空
			//添加一览表路径
			$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
			//按钮
			$("#recover,#suspend,#kbyy,#handlerBtn").hide();
			$("#kbylb,#kbyy").show();
			$("#stageStates").val(4);
			//阶段显示
			$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
			$("#js_2").removeClass().addClass("step5");
			//滑竿
			stage="";
			break;
	}	
}

/**开标进度滑杆*/
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
			var minute = parseInt((IntervalTime /1000/60%60000)).toString();	//分
			var second = parseInt((IntervalTime % (1000 * 60)) / 1000).toString();  //秒
					
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

/*******************************************************************ca签名**************************************************************************/
function caSign(fileUrl){
	//获取签章位置
	//判断是否有pdf
	if(fileUrl=='' && fileUrl== "undefined" && fileUrl== undefined){
		layer.alert("暂无开标一览表");
	}else{
		var parameters = {"bidOpeningId":bidOpeningId,"signPdf":fileUrl};
		$.ajax({
			type: "get",
			url: config.openingHost+"/BidOpeningDetailsController/getCaSignArea",
			async: false,
			data:parameters,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(rsp) {
				//判断开标一览表是否生成
				if(fileUrl != null && fileUrl !=undefined && fileUrl !=''){
					//ca签名
					layer.open({
						type:2, 
						title:'CA签名', 
						area: ['100%','100%'],
						content:'signView.html?pageNo='+rsp.data.pageNo+'&pos='+rsp.data.pos+'&bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId+'&fileUrl='+fileUrl+'&Token='+sessionStorage.getItem('token'),
						scrollbar:false,
					});
				}else{
			        layer.alert('开标一览表未生成',{icon:5,title:'提示'});
			    }
			}
		});
	}
}

/*******************************************************************关闭页面**************************************************************************/
function custom_close(){
	// 重置window.opener用来获取打开当前窗口的窗口引用
　　	// 这里置为null,避免IE下弹出关闭页面确认框
	window.opener = null;
	// JS重写当前页面
	window.open("", "_self", "");
	// 顺理成章的关闭当前被重写的窗口
	window.close();
}

/********************************************************************异议列表*****************************************************************/
function openObjection(){
	var states = $("#stageStates").val();
	layer.open({
		type:2, 
		title:"异议管理", 
		area: ['1200px', '600px'],
		content:'objectionAnswers.html?bidSectionId='+bidId+'&states='+states,
	});
}

/*******************************************************************打开一览表************************************************************************/
//打开一览表
function kbySchedule(that){
	//获取pdf路径
	var pdfurl = $(that).attr("pdfurl"); //"//502/20190615/pdf/005004feb30e4592b1255215c8c3b165.pdf"; //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
		
	//判断是否有pdf
	if(pdfurl==''||pdfurl== "undefined"){
		layer.alert("暂无开标一览表");
	}else{
		//pdf预览
		previewPdf(pdfurl);
		/*var temp = top.layer.open({
			type: 2,
			title: "预览 ",
			area: ['100%','100%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			btn:["关闭"],
			content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfurl+"&Token="+sessionStorage.getItem('token'),
			yes:function(index,layero){
				top.layer.close(index);
			}
		});
		
		top.layer.full(temp);*/
	}
}

	/********************************************************************获取当前登录人信息***************************************************/
	function entryInfo(){
		$.ajax({
			type:"post",
		  	url:config.tenderHost + '/getEmployeeInfo.do',
		  	async:false,
		  	beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
		  	success: function(data){
		  		if(data.success){
		  			entryData = data.data;
		  		}
		  	}
		})
	}