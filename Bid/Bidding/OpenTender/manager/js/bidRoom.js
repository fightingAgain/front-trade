	/**********************************************接口*************************************************/	
	var bidListUrl = config.openingHost  + "/BidOpeningSituationController/findBidOpeningList.do"; //今天开标数据查询接口
	var bidOpeningUrl = config.openingHost  + "/BidOpeningSituationController/getMBidOpening.do"; //根据id获取选中的标段信息状态
	var newStopUrl = config.openingHost  + "/BidOpeningStopController/getNewOpeningStop.do"; //保存暂停数据接口
	var saveStopUrl = config.openingHost  + "/BidOpeningStopController/saveBidOpeningStop.do"; //保存暂停数据接口  
	var bidConfirmUrl = config.openingHost  + "/BidOpeningController/bidConfirm.do"; //标段是否继续接口(签到)
	var bidDConfirmUrl = config.openingHost  + "/BidOpeningController/bidDecryptConfirm.do"; //标段是否继续接口  (解密)
	var sendUrl = config.openingHost+"/BidOpeningMessController/managerSendMess"; //发送消息
	
	/***************全局变量***************/	
	var bidId = $.getUrlParam("bid");	//标段id
	var bidOpeningId = ''; //开标数据id
	var IntervalTime = ''; //倒计时时间
	var step = '';//阶段
	var index= 29;
	var stage='';//
	var isconfirm = 1;//项目经理确认弹框
	var bidderIdList = 0; //投标人集合
	/***********************************************页面加载完初始化****************************************/	
	//页面初始化
	$(document).ready(function(){
		//初始化组建
		configComponents();
		//获取用户信息
		entryInfo()
		//初始化表格
		getOpeningBidList();
		//每秒刷新倒计时
		sysInterval();
		//按Enter键发送消息
		$(document).keydown(function(event){
	　　　　if(event.keyCode == 13)chatWithMananger();
	　　});
	})
	
	/*************************************************页面各种方法*****************************************/
	window.onresize = function(){configComponents();}
	//初始化组建
	function configComponents(){
		//设置bootstrapTable起始的高度
	    $('#bidtable').bootstrapTable({ height: $(".biao").height() - 10 });
	    $(".fixed-table-container").css({ height: $(".biao").height() - 10 });
	    
	    $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 });
	}
	
	//页面轮询
	function sysInterval() {
		var	initIntervalId = window.setInterval(function() {
			//查询标段信息状态
			findBidOpening(bidId);
			//进度
			stepTimer(stage);
			index++;
		}, 1000);
	}

	/**初始化今天开标数据列表*/
	function getOpeningBidList(){
		$.ajax({
			type: "get",
			url: bidListUrl,
			dataType: 'json',
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
					        bidderIdList = 0;
					        $("#ptitle").html(""+arr[1]+"项目开标大厅");
					    });
					}
				} 
			}
		});
	}
	
	/**根据id开标数据*/
    function findBidOpening(id){
    	//如果id不为空，则查询数据
    	if(id != ""){
    		$.ajax({
	        	url: bidOpeningUrl,
	        	type: "get",
	        	data: {"bidSectionId":id},
	        	async:false,
	        	beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
	         	success: function (data) {
	         		if(data.success){
	         			//赋值开标数据id
						bidOpeningId = data.data.infors.id;
						//配置目标标段信息
	         			initBidOpening(data.data.infors);
	         		}
	         	}
	       });
    	}
    }

	//配置目标标段信息
	function initBidOpening(obj){
		//0.获取服务器时间
		var sysTime = obj.sysTime;
		//计算日历时间
		initCurssrentDate(sysTime);
		//1.实时推送选择的标段开标信息
	    $("#suspend,#kbyy,#kbylb,#jskb,#recover").hide();
		//2.判断是否需要项目经理点击确认(签到)
		if(obj.exist==1){
			//判断是否需要再次弹出确认框
			if(isconfirm==1){
				parent.layer.confirm('投标家数不足3家,请问是否继续？', {
				  btn: ['继续','流标'] //按钮
				}, function(){
				  managerConfirm(bidId,true);
				}, function(){
				  managerConfirm(bidId,false);
				});
				
				isconfirm==0;
			}
			isconfirm ++;
		}
		
		//2.判断是否需要项目经理点击确认(解密)
		if(obj.existd==1){
			//判断是否需要再次弹出确认框
			if(isconfirm==1){
				parent.layer.confirm('投标家数不足3家,请问是否继续？', {
				  btn: ['继续','流标'] //按钮
				}, function(){
				  managerDConfirm(bidOpeningId,true);
				}, function(){
				  managerDConfirm(bidOpeningId,false);
				});
				
				isconfirm==0;
			}
			isconfirm ++;
		}
		
	    //3.标段投标人状态
	    if(obj.bidOpeningResults){
	    	getBidResults(obj.bidOpeningResults,obj.stageStates);
	    }
	    
	    //4.刷新消息记录
	    if(obj.messages){
	    	autoChatMessage(obj.messages);
	    }
	    
	    //5.显示阶段
	    progressStage(sysTime,obj);
	}
	
	/**********************************************日历时间**************************************************************************/
	//初始化时间
	function initCurssrentDate(systime){
		var arr = formatUnixtimestamp(systime.replace(new RegExp("-","gm"),"/")).split(" ");
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
		var date = new Date(inputTime);
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
	
	/**********************************************进度**************************************************************************/
	//进度阶段
	function progressStage(sysTime,obj){
		$("#manualOpen").hide();
		switch(obj.stageStates) {
			//签到
			case 0:
	    		//状态
				$("#current").html("签到");
				//倒计时
				initInterval(sysTime,obj.bidOpenTime);
				//按钮
				$("#suspend,#recover,#kbyy,#kbylb,#jskb").hide();
				if(obj.openExecute == 2){
					//开标按钮
					$("#manualOpen").show();
				}
				
				//阶段显示
				$("#qd_1").removeClass().addClass("step step2 on");
				$("#jm_2,#qm_2").removeClass().addClass("step step1");
				$("#js_2").removeClass().addClass("step4");
				//滑竿
				stage=".step2 i";
				break;
			//解密	
			case 1:
				//是否暂停
				if(obj.stopStates == 1){
	    			initInterval(0, obj.restLength);
	    			//状态
					$("#current").html("解密(暂停)");
					//按钮
					$("#suspend,#kbyy,#kbylb,#jskb").hide();
			    	$("#recover").show();
	    		}else{
			    	//倒计时
					initInterval(sysTime, obj.decryptEndDate);
					//状态
					$("#current").html("解密");
					//按钮
					$("#recover,#kbylb,#jskb").hide();
					$("#suspend,#kbyy").show();
	    		}
				//阶段显示
				$("#jm_2").removeClass().addClass("step step2 on");
				$("#qd_1,#qm_2").removeClass().addClass("step step1");
				$("#js_2").removeClass().addClass("step4");
				//滑竿
				stage=".step2 i";
				break;
			//签名
			case 2:
				//是否暂停
				if(obj.stopStates == 1){
					//倒计时
	    			initInterval(0, obj.restLength);
	    			//状态
					$("#current").html("签名(暂停)");
					//按钮
					$("#suspend,#kbyy,#kbylb,#jskb").hide();
			    	$("#recover").show();
	    		}else{
			    	//倒计时
					initInterval(sysTime, obj.signEndTime);
					//状态
					$("#current").html("签名");
					//按钮
					$("#recover,#jskb").hide();
					$("#suspend,#kbyy,#kbylb").show();
					//添加一览表路径
					$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
	    		}
	    		//阶段显示
				$("#qd_1,#jm_2").removeClass().addClass("step step3");
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
				$("#recover,#suspend,#kbyy,#jskb").hide();
				$("#kbylb").show();
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
				$("#recover,#suspend,#kbyy,#jskb").hide();
				$("#kbylb").show();
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
				$("#recover,#suspend").hide();
				$("#kbylb,#kbyy,#jskb").show();
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

	/**********************************************计算倒计时******************************************************************/
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
	
	/*************************************************项目经理确认********************************************************************************/
	/**项目经理确认(签到)*/
	function managerConfirm(id,status){
		$.ajax({
	       	url: bidConfirmUrl,
	        type: "get",
	        data: {"bidSectionId":id,"status":status},
	        async:false,
	        beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
	        success: function (data) {
	         	if(data.success){
	         	}
	        }
	    });
	}
	
	/**项目经理确认(解密)*/
	function managerDConfirm(id,status){
		$.ajax({
	       	url: bidDConfirmUrl,
	        type: "get",
	        data: {"openingId":id,"status":status},
	        async:false,
	        beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
	        success: function (data) {
	         	if(data.success){
	         	}
	        }
	    });
	}
						
	/****************************************************投标结果***************************************************************************/
    /**根据标段id查询投标结果*/
    function getBidResults(data,states){
 		//清空列表
	    $("#tbodyResults").empty();
	    //如果数据不为空，则循环添加值
	    if(data != ''){
	        //判断是否是第一次加载下拉框
	        if(bidderIdList == 0){
	         	$("#sendperson").empty().append("<option value='all'>所有人</option>");
	        }
	         		
	        for(var i = 0;i < data.length;i++) {
	         	var signIn = '';
	         	var decrypt = '';
	         	var sign = '';
	         	//签到
	         	if(data[i].signInResult == '0'){
	         		signIn = '<img src="../../images/icno_no.png">';
	         	}else if(data[i].signInResult == '1'){
	         		signIn = '<img src="../../images/icon_yes.png">';
	         	}
	         	//解密
	         	if(data[i].decryptResult == '0'){
	         		decrypt = "<img src='../../images/icno_no.png'>";
	         		if(states ==1){
	         			decrypt = decrypt + "&ensp;<button onclick='importDecrypt(\""+data[i].bidderId+"\")' type='button' class='btn btn-primary btn-xs' style='padding:2px;'>导入</button>";
	         		}
	         	}else if(data[i].decryptResult == '1'){
	         		decrypt = "<img src='../../images/icon_yes.png'>";
	         	}
	         	//签名
	         	if(data[i].signResult == '0'){
	         		sign = '<img src="../../images/icno_no.png">';
	         	}else if(data[i].signResult == '1'){
	         		sign = '<img src="../../images/icon_yes.png">';
	         	}
	         			
	         	var ui = '<tr><td width="3%">'+(i+1)+'</td><td width="15%">'+data[i].bidderName+'</td><td width="5%">'+signIn+'</td><td width="10%">'+(data[i].signInDate == undefined ? '' : data[i].signInDate)+'</td>'
	         	+'<td width="5%">'+decrypt+'</td><td width="10%">'+(data[i].decryptDate == undefined ? '' : data[i].decryptDate)+'</td><td width="5%">'+sign+'</td><td width="10%">'+(data[i].signDate == undefined ? '' : data[i].signDate)+'</td>'
	         	+'<td width="27%">'+(data[i].signInCode == undefined ? '' : ('签到码:'+data[i].signInCode))+'&ensp;'+(data[i].decryptCode == undefined ? '' :'解密码:'+data[i].decryptCode)+'&ensp;'+(data[i].signCode == undefined ? '' :'签名码:'+ data[i].signCode)+'</td></tr>';
	         	//给表格追加数据
	         	$("#tbodyResults").append(ui);
	         			
	         	if(bidderIdList == 0){
	         		//给下拉框添加值
	         		$("#sendperson").append("<option value='"+data[i].bidderId+"'>"+data[i].bidderName+"</option>");
	         	}
	        }
	         	
	        $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 }); 	
	        bidderIdList = 1;//投标人下拉框置为1
	    }
	}
	
	/*******************************************************************暂停、恢复************************************************************************************************/
	/**暂停*/
	function suspend(){
		parent.layer.prompt({title:'请输入暂停的原因'},function(val,i){
			//拼接请求参数
	    	var paraStr = "bidOpeningId=" + bidOpeningId;
			paraStr += "&stopType=0";
			paraStr += "&stopReason=" + val;
			paraStr += "&restLength=" + IntervalTime;
			paraStr += "&step=" + step;
			
			//调用后台请求
			$.ajax({
				type: "post",
				url: saveStopUrl,
				async: true,
				data: paraStr,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
				success: function(ret) {
					if(ret.success) {
						parent.layer.alert("暂停成功");
						//关闭弹出框
						parent.layer.close(i);
					} else {
						layer.msg(ret.message);
					}
				}
			});
    	});
		
	}
	
	/**恢复*/
	function recover(){
		//拼接请求参数
	    var paraStr = "bidOpeningId=" + bidOpeningId;
		paraStr += "&stopType=1";
		paraStr += "&step=" + step;
			
		//调用后台请求
		$.ajax({
			type: "post",
			url: saveStopUrl,
			async: true,
			data: paraStr,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(ret) {
				if(ret.success) {
					//打开倒计时定时器
					initInterval();
					parent.layer.alert("恢复成功");
				} else {
					layer.msg(ret.message);
				}
			}
		});
	}
	
	/***********************************************************消息发送**************************************************************************************/
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
	
    //发送消息
    function chatWithMananger(){
    	var msg = $("#msg").text();//获取消息
    	var sendperson = $("#sendperson").val();//获取发送人
    	var enterpriceName = $("#sendperson option[selected]").text();//获取发送人 
    	//解决ie兼容性问题
		if(msg == $("#msg").attr('placeholder')){
			msg = '';
		}
    	//不能发送空消息
    	if($.trim(msg)!=""){
    		var message = {"bidSectionId":bidId, "sendMess":msg,"receiveEmployeeId":sendperson,"enterpriceName":enterpriceName};
    		$.ajax({
				type: "post",
				url: sendUrl,
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
    
    /*********************************************************开标异议**************************************************************************/
    //打开异议
	function openObjection(){
		layer.open({
			type: 2,
			title: '异议管理',
			area: ['1200px', '600px'],
			resize: false,
			content: 'objectionList.html?bidId='+bidId+'&Token='+sessionStorage.getItem('token'),
		});
	}
	
	/*********************************************************************结束开标********************************************************************/
	/**结束开标*/
	function endOpen(){
		layer.confirm('温馨提示：您确定要结束吗？', {btn: ['是', '否']}, function(o){
			$.ajax({
		       	url: config.openingHost  + "/BidOpeningSituationController/endBidOpening.do",
		        type: "get",
		        data: {"id":bidOpeningId,"bidSectionId":bidId,"stageStates":4},
		        async:false,
		        beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
		        success: function (data) {
		         	if(data.success){
		         		layer.alert("结束成功");
		         		$('#tableList').bootstrapTable(('refresh')); // 很重要的一步，刷新列表
		         	}
		        }
	    	});
			//关闭选择框
		    layer.close(o);			 
		}, function(o){
		   layer.close(o)
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
			/*
			 * 
			var temp = top.layer.open({
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
		
			top.layer.full(temp);
			*/
		}
	}
	
	/*******************************************************************项目经理手动导入************************************************************************/
    //导入
	function importDecrypt(bidderId){
		layer.open({
			type:2, 
			title:'上传投标文件', 
			area:['500px','260px'],
			content:'importDecrypt.html?bidderId='+bidderId+'&bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId,
			scrollbar:false,
		});
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
		  			$("#enterpriseName").html(data.data.enterpriseName);
		  			$("#userName").html(data.data.userName);
		  		}
		  	}
		})
	}

	/********************************************************************项目经理手动开标***************************************************/
	function manualOpen(){
		$.ajax({
			type:"get",
		  	url:config.openingHost + '/BidOpeningSituationController/managerManualOpen.do',
		  	data: {"bidSectionId":bidId},
		  	async:false,
		  	beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
		  	success: function(data){
		  		if(data.success){
		  			layer.alert("开标成功");
		  		}else{
		  			layer.alert("开标失败");
		  		}
		  	}
		})
	}