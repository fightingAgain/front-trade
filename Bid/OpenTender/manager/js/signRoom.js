	/**********************************************接口*************************************************/	
	var bidListUrl = config.OpenBidHost  + "/BidOpeningSituationController/findSignBidOpeningList.do"; //今天开标数据查询接口
	var bidOpeningUrl = config.OpenBidHost  + "/BidOpeningSignController/getOtherBidOpening.do"; //根据id获取选中的标段信息状态
	var sendUrl = config.OpenBidHost+"/BidOpeningMessController/managerSendMess"; //发送消息
		
	/***************全局变量***************/
	var bidId = $.getUrlParam("id");	//标段id
	var bidOpeningId = ''; //开标数据id
	var IntervalTime = ''; //倒计时时间
	var step = '';//阶段
	var index= 29;
	var stage='';//
	var bidderIdList = 0; //投标人集合
	var bidIntervalID = "";	//标段定时器
	var mask = "";//遮罩
	
	var isRefresh = false;//判断是加载数据表格还是刷新数据，加载完数据后改变其值为true
	var table;
	var tableData = [];

	var isOpenWind = true;//是否显示弹出框
	var isPublic = 0;//是否公共资源
	var entryData;
	/***********************************************页面加载完初始化****************************************/	
	//页面初始化
	$(document).ready(function(){
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
		//跑马灯
		window.setInterval(function() {
			//进度
			stepTimer(stage);
			index++;
		},125);
		$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
		$('.dtl').css('height',($(window).height()-340)+'px');
		$('.dtr').css('height',($(window).height()-340)+'px');
		$('.dtl_ner').css('height',($(window).height()-445)+'px');
	})
	
	/*************************************************页面各种方法*****************************************/
//	window.onresize = function(){configComponents();}
	//初始化组建
	/*function configComponents(){
		//设置bootstrapTable起始的高度
	    $('#bidtable').bootstrapTable({ height: $(".biao").height() - 10 });
	    $(".fixed-table-container").css({ height: $(".biao").height() - 10 });
	    
	    $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 });
	}*/
	
	//页面轮询
	function sysInterval() {
		bidIntervalID = window.setInterval(function() {
			//查询标段信息状态
			findBidOpening(bidId);
//			$(document).scrollTop($(document)[0].scrollHeight);
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
						var uibg = '<li class="lan" value="'+data.data[i].id+','+data.data[i].bidSectionName+'" data-public="'+data.data[i].isPublicProject+'"><div class="hao">'+(i+1)+'</div>'
				  			+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
						//不带背景色
						var ui = '<li class="bs" value="'+data.data[i].id+','+data.data[i].bidSectionName+'"  data-public="'+data.data[i].isPublicProject+'"><div class="hao">'+(i+1)+'</div>'
				  			+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
						//选中当前数据行
						if(bidId == data.data[i].id){
							isPublic = data.data[i].isPublicProject;
							$("#pojectsData").append(uibg);
							$("#ptitle").html(""+data.data[i].bidSectionName+"项目开标大厅");
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
					        bidderIdList = 0;
					        isPublic = $(this).attr("data-public");
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
					var token = $.getToken();
					xhr.setRequestHeader("Token",token);
				},
	         	success: function (data) {
	         		if(data.success){
	         			//赋值开标数据id
						bidOpeningId = data.data.infors.id;
						//配置目标标段信息
	         			initBidOpening(data.data.infors);
//	         			scroolToEnd()
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
	    $("#handlerBtn,#kbylb").hide();
	
	    //3.标段投标人状态
	    if(obj.bidOpeningResults){
	    	if(isRefresh){
	    		//保存当前滚动条位置    		
				var top = $(document).scrollTop();
				var left = $("[lay-id=tableReload] .layui-table-main")[0].scrollLeft;
		    	getBidResults(obj.bidOpeningResults,obj.stageStates);
		    	$("[lay-id=tableReload] .layui-table-main")[0].scrollLeft = left;
				$(document).scrollTop(top);
				
	    	}else{
	    		getBidResults(obj.bidOpeningResults,obj.stageStates);
	    	}
	    }
	    //4.刷新消息记录
	    if(obj.messages){
	    	autoChatMessage(obj.messages);
	    }
	    
	    //5.显示阶段
	    progressStage(sysTime,obj);
	    
	    //存储开标状态
	    $("#stageStates").val(obj.stageStates);
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
		//判断是否有遮罩
		if(mask !=""){
			//关闭遮罩
			parent.layer.close(mask);
			//置空
			mask = "";
		}
		$("#manualOpen").hide();
		switch(obj.stageStates) {
			//签到
			case 0:
	    		//状态
				$("#current").html("签到");
				//倒计时
				initInterval(sysTime,obj.bidOpenTime);
				//社会的公共资源类项目才需要其他人签名/签章
				if(isPublic == 1 && top.systemType == 'sh' && obj.results.signInResult == 0){
					$("#kbylb").hide();
					$("#handlerBtn").html('签到').attr("phare","0").removeAttr("disabled").addClass("on");
					$("#handlerBtn").show();
				}else{
					//按钮
					$("#handlerBtn,#kbylb").hide();
				}
				
				
				//阶段显示
				$("#qd_1").removeClass().addClass("step step2 on");
				$("#jm_2,#qm_2,#cb_2").removeClass().addClass("step step1");
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
	    		}else{
			    	//倒计时
					initInterval(sysTime, obj.decryptEndDate);
					//状态
					$("#current").html("解密");
	    		}
	    		
	    		//社会的公共资源类项目才需要其他人签名/签章
				if(isPublic ==1 && top.systemType == 'sh' && obj.results.signInResult == 0){
					$("#kbylb").hide();
					$("#handlerBtn").html('签到').attr("phare","0").removeAttr("disabled").addClass("on");
					$("#handlerBtn").show();
				}else{
					//按钮
					$("#handlerBtn,#kbylb").hide();
				}
	    		
	    		//按钮
//				$("#handlerBtn,#kbylb").hide();
				
				//阶段显示
				$("#jm_2").removeClass().addClass("step step2 on");
				$("#qd_1,#qm_2,#cb_2").removeClass().addClass("step step1");
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
					$("#handlerBtn,#kbylb").hide();
	    		}else{	    			
			    	//倒计时
					initInterval(sysTime, obj.signEndTime);
					//状态
					$("#current").html("签名");
					//社会的公共资源类项目才需要其他人签名/签章
					if(isPublic ==1 && top.systemType == 'sh' && obj.results.signInResult == 0){
						$("#kbylb").hide();
						$("#handlerBtn").html('签到').attr("phare","0").removeAttr("disabled").addClass("on");
						$("#handlerBtn").show();
					}else{
						//社会的公共资源类项目才需要其他人签名/签章
						if(isPublic ==1 && top.systemType == 'sh' && (!obj.results.signResult || obj.results.signResult == 0)){
							$("#kbylb").hide();
							if(obj.pdfUrl){
								$("#handlerBtn").show().attr({'fileUrl':obj.pdfUrl,'data-type':obj.results.signType});
							}
							$("#handlerBtn").empty().html("签名").attr("phare","2").removeAttr("disabled").addClass("on");
						}else{
							$("#kbylb").show();
							$("#handlerBtn").hide();
						}
					}
					//按钮
//					$("#kbylb").hide();
//					$("#handlerBtn").show();
										
					//添加一览表路径
					$("#handlerBtn").attr("fileUrl",""+obj.pdfUrl+"");
	    		}
	    		
	    		//阶段显示
				$("#qd_1,#jm_2,#cb_2").removeClass().addClass("step step1");
				$("#qm_2").removeClass().addClass("step step2 on");
				$("#js_2").removeClass().addClass("step4");
				//滑竿
				stage=".step2 i";
				break;
			//唱标
			case 3:
				//设置倒计时为零
				initInterval(0,0);
				//是否暂停
				if(obj.stopStates == 1){
					//状态
					$("#current").html("唱标(暂停)");
					//按钮
					$("#handlerBtn,#jskb").hide();
				}else{
					//状态
					$("#current").html("唱标");
					//社会的公共资源类项目才需要其他人签名/签章
					if(isPublic ==1 && top.systemType == 'sh' && obj.results.signInResult == 0){
						$("#kbylb").hide();
						$("#handlerBtn").html('签到').attr("phare","0").removeAttr("disabled").addClass("on");
						$("#handlerBtn").show();
					}else{
						//按钮
						$("#handlerBtn").hide();
						$("#kbylb").show();
					}
				}
		
				//添加pdf路径
				$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");				
								
				//阶段显示
				$("#qd_1,#jm_2,#qm_2").removeClass().addClass("step step1");
				$("#cb_2").removeClass().addClass("step step2 on");
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
				$("#handlerBtn").hide();
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
				$("#handlerBtn").hide();
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
				//
//				clearInterval(bidIntervalID);
				//倒计时
				initInterval(0,0);//置空
				//添加一览表路径
				$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
				//社会的公共资源类项目才需要其他人签名/签章
				if(isPublic ==1 && top.systemType == 'sh' && obj.results.signInResult == 0){
					$("#kbylb").hide();
					$("#handlerBtn").html('签到').attr("phare","0").removeAttr("disabled").addClass("on");
					$("#handlerBtn").show();
				}else{
					//社会的公共资源类项目才需要其他人签名/签章
					if(isPublic ==1 && top.systemType == 'sh' && (!obj.results.signResult || obj.results.signResult == 0)){
						$("#kbylb").hide();
						if(obj.pdfUrl){
							$("#handlerBtn").show().attr({'fileUrl':obj.pdfUrl,'data-type':obj.results.signType});
						}
						$("#handlerBtn").empty().html("签名").attr("phare","2").removeAttr("disabled").addClass("on");
					}else{
						$("#kbylb").show();
						$("#handlerBtn").hide();
					}
				}
				//按钮
//				$("#handlerBtn").hide();
//				$("#kbylb").show();
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
			$("#hoursOne").html(0);
			$("#hoursTwo").html(0);
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
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
	        success: function (data) {
	         	if(data.success){
	         		bidIntervalID = window.setInterval(function() {
						//查询标段信息状态
						findBidOpening(bidId);
					}, 1000);
	         	}else{
	         		parent.layer.alert("继续失败");
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
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
	        success: function (data) {
	         	if(data.success){
	         		bidIntervalID = window.setInterval(function() {
						//查询标段信息状态
						findBidOpening(bidId);
					}, 1000);
	         	}else{
	         		parent.layer.alert("继续失败");
	         	}
	        }
	    });
	}
						
					
	/****************************************************投标结果***************************************************************************/
    /**根据标段id查询投标结果*/
    function getBidResults(data){ 	
    	layui.use('table', function(){
		var table = layui.table;
		  
		var tableIns =  table.render({
		    elem: '#bidtable'
		    ,cols: [[
		      	{title: '序号', type:'numbers', fixed: 'left'}
		      	,{field:'bidderName',  title: '投标单位名', fixed: 'left',width:'300'}
		      	,{field:'fileSubmitTime', title: '递交时间',width:'200',align:'center'}
		      	,{field:'signInResult', title: '是否签到',width:'100',align:'center',
		      		templet: function(value){
		      			if(!value.signInResult || value.signInResult == '0'){
			         		return '<div><img src="../../images/icno_no.png"></div>';
			         	}else if(value.signInResult == '1'){
			         		return '<div><img src="../../images/icon_yes.png"></div>';
			         	}
		      		}
		      	}
		      	,{field:'signInDate', title: '签到时间',width:'200',align:'center'}
		      	,{field:'decryptResult', title: '是否解密',width:'100',align:'center',
		      		templet: function(value){
		      			if(!value.decryptResult || value.decryptResult == '0'){
			         		return '<div><img src="../../images/icno_no.png"></div>';
			         	}else if(value.decryptResult == '1'){
			         		return '<div><img src="../../images/icon_yes.png"></div>';
			         	}
		      		}
		      	}
		      	,{field:'decryptDate', title: '解密时间',width:'200',align:'center'}
		      	,{field:'signResult',title: '是否签名',width:'100',align:'center',
		      		templet: function(value){
		      			if(!value.signResult || value.signResult == '0'){
			         		return '<div><img src="../../images/icno_no.png"></div>';
			         	}else if(value.signResult == '1'){
			         		return '<div><img src="../../images/icon_yes.png"></div>';
			         	}
		      		}
		      	}
		      	,{field:'signDate', title: '签名时间',width:'200',align:'center'}
		      	,{field:'signInCode', title: 'CA信息',width:'1070',
		      		templet: function(value){
		      			return '<div>'+(value.signInCode == undefined ? '' : ('签到码:'+value.signInCode))+'&ensp;'+(value.decryptCode == undefined ? '' :'解密码:'+value.decryptCode)+'&ensp;'+(value.signCode == undefined ? '' :'签名码:'+ value.signCode)+'</div>'
		      		}
		      	}
		    ]]
		    ,data:data
		  	});
		  
		});

	}
		
	/***********************************************************消息发送**************************************************************************************/
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
		$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
	}
	
	
	
	
	/*******************************************************************打开一览表************************************************************************/
	//打开一览表
	function kbySchedule(that){
		var token = $.getToken();
		//获取pdf路径
		var pdfurl = $(that).attr("pdfurl"); //"//502/20190615/pdf/005004feb30e4592b1255215c8c3b165.pdf"; //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
		
		//判断是否有pdf
		if(pdfurl==''||pdfurl== "undefined"){
			layer.alert("暂无pdf");
		}else{
			//pdf预览
			var temp = top.layer.open({
				type: 2,
				title: "预览 ",
				area: ['100%','100%'],
				maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
				resize: false, //是否允许拉伸
				btn:["关闭"],
				content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfurl+"&Token="+token,
				yes:function(index,layero){
					top.layer.close(index);
				}
			});
		
			top.layer.full(temp);
		}
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
		  			//$("#enterpriseName").html(data.data.enterpriseName);
		  			$("#userName").html(data.data.userName);
		  		}
		  	}
		})
	}


	/*********************************        展开收起             ****************************/
$('.table_pack').click(function(){
//	console.log($(window).height()-245)
	$('.table_pack').css('display','none');
	$('.biaonr').css('display','none');
	$('.table_open').css('display','inline-block');
	$('.dtl').css('height',($(window).height()-340)+'px');
	$('.dtr').css('height',($(window).height()-340)+'px');
	$('.dtl_ner').css('height',($(window).height()-445)+'px');
	$('body').css('height',$(window).height()+'px');
})
$('.table_open').click(function(){
	$('.table_open').css('display','none');
	$('.table_pack').css('display','inline-block');
	$('.biaonr').css('display','block');
	$('.dtl').css('height',($(window).height()-435)+'px');
	$('.dtr').css('height',($(window).height()-435)+'px');
	$('.dtl_ner').css('height',($(window).height()-540)+'px');
	//保持消息通知展示最新的
	$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
})
function scroolToEnd() {
   var h = $(document).height()-$(window).height();
   $(document).scrollTop(h);
}
function passMessage(data,callback){
	/*************************************           关闭页面            ****************************************/
	$(document).on('click','#custom_close',function(){
		callback()
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	/*************************************           结束            ****************************************/
	$(document).on('click','#jskb',function(){
		endOpen(callback)
		
	});
	
}


/*************************************************签到|签名******************************************************************/
function handleBidEachStage(that){
	var pharse = $(that).attr("phare");//类型
	
	if(pharse=="0"){
		//ca签到
		var certsCFCA;
		//声明签名证书对象
		try {
			var eDiv = document.createElement("div");
			if(navigator.appName.indexOf("Internet") >= 0 || navigator.appVersion.indexOf("Trident") >= 0) {
				if(window.navigator.cpuClass == "x86") {
					eDiv.innerHTML = "<object id='CryptoAgent' codebase='CryptoKit.DFMBidding.x86.cab' classid='clsid:F52C4CD7-67BC-4415-918A-6E6334E70337' style='display:none;'></object>";
				} else {
					eDiv.innerHTML = "<object id='CryptoAgent' codebase='CryptoKit.DFMBidding.x64.cab' classid='clsid:48ECD656-A3F6-4174-9D76-11EB598B6F9F' style='display:none;'></object>";
				}
			}
			
			document.body.appendChild(eDiv);
			certsCFCA = document.getElementById("CryptoAgent");
			var subjectDNFilter = "";
			var issuerDNFilter = "CFCA";
			var SerialNum = "";
			var CertCSPName = "CFCA FOR UKEY CSP v1.1.0";
			var SelCertResult = certsCFCA.SelectSignCert(subjectDNFilter, issuerDNFilter, SerialNum, CertCSPName);
			var caOwner;
			var icardno;
			var Type;
			var time = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
			var	card = entryData.identityCardNum;
			// 加密
			var signInCode = certsCFCA.SignMsgPKCS7(bidId, "SHA-1", false);
			//获取ca信息
			var	Subject = certsCFCA.GetSignCertInfo("SubjectDN");
			
			for(var i=0;i<Subject.split(",").length;i++){
				//找到持有人信息
				if((Subject.split(",")[i]).indexOf("CN=") != -1){
					caOwner=Subject.split(",")[i];
					icardno= caOwner.split("@")[2].substring(1,caOwner.split("@")[2].length);
					caOwner= caOwner.split("@")[1];
				}
				//找到CA类型信息
				if((Subject.split(",")[i]).indexOf("-2") != -1){
					Type=Subject.split(",")[i];
					Type =Type.substring(4);
				}
				if('Individual-2'==Type){
					Type = 2
				}else if('Organizational-2'==Type){
					Type = 1
				}
				continue;
			}
				
			var dn = certsCFCA.GetSignCertInfo('SubjectDN');
	    	var cn = certsCFCA.GetSignCertInfo('SerialNumber');
			
			
			//获取证书//certsCFCA.SelectCertificateDialog();
			
			
			var params = {"signedData": icardno,"bidSectionId": bidId,"examType":2 ,"signedType":Type, 'signInCode': signInCode,'signInCaCode': cn, 'signInCaDn': dn};
			
			//执行签到
			if($.trim(signInCode) != '') {
				$.ajax({
					type: "post",
					url: config.OpenBidHost + "/BidOpeningSignController/addOtherSignIn.do",
					async: false,
					data:params,
					dataType: "json",
					beforeSend: function(xhr) {
						var token = $.getToken();
						xhr.setRequestHeader("Token",token);
					},
					success: function(rsp) {
						if(rsp.success) {
							parent.layer.alert(rsp.data, {icon: 6});
						} else {
							parent.layer.alert(rsp.message, {icon: 6});
						}
					}
				});
			}
		
		} catch(e) {
//			alert(e)
			window.sessionStorage.setItem("CA", "");
			if(!certsCFCA){
				top.layer.alert("CA签到异常");
				return;
			}
			var errorDesc = certsCFCA.GetLastErrorDesc();
			top.layer.msg(errorDesc);
		}
	}else{
		var fileUrl = $(that).attr("fileUrl");
		/*** 签名人员类型  0为招标人   1为监标人  2.项目经理***/
		var signType = $(that).attr("data-type");
		
		//判断是否有pdf
		if(fileUrl != null && fileUrl=='' && fileUrl== "undefined" && fileUrl== undefined){
			layer.alert("暂无pdf");
		}else{
			var token = $.getToken();
			//ca签名
			layer.open({
				type:2, 
				title:'CA签名', 
				area: ['100%','100%'],
				content:'signView.html?bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId+'&fileUrl='+fileUrl+'&Token='+token + '&signType=' + signType,
				scrollbar:false,
			});	
		}	
	}
}

