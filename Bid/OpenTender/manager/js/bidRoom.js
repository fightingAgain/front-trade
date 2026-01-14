	/**********************************************接口*************************************************/	
	var bidListUrl = config.OpenBidHost  + "/BidOpeningSituationController/findBidOpeningList.do"; //今天开标数据查询接口
	var bidOpeningUrl = config.OpenBidHost  + "/BidOpeningSituationController/getMBidOpening.do"; //根据id获取选中的标段信息状态
	var newStopUrl = config.OpenBidHost  + "/BidOpeningStopController/getNewOpeningStop.do"; //保存暂停数据接口
	var saveStopUrl = config.OpenBidHost  + "/BidOpeningStopController/saveBidOpeningStop.do"; //保存暂停数据接口  
	var bidConfirmUrl = config.OpenBidHost  + "/BidOpeningController/bidConfirm.do"; //标段是否继续接口(签到)
	var bidDConfirmUrl = config.OpenBidHost  + "/BidOpeningController/bidDecryptConfirm.do"; //标段是否继续接口  (解密)
	var sendUrl = config.OpenBidHost+"/BidOpeningMessController/managerSendMess"; //发送消息
	var setUrl = config.OpenBidHost + '/BidSectionDataController/getOpenReviewData.do';//查询需要在开标环节设置的参数
	var setHtml = 'OpenTender/manager/model/setReview.html';//设置评审参数
	var startSignUrl = config.OpenBidHost + '/BidOpeningController/startSign.do';//开始签名
	/***************全局变量***************/	
	var bidId = $.getUrlParam("id");	//标段id
	var bidOpeningId = ''; //开标数据id
	var IntervalTime = ''; //倒计时时间
	var step = '';//阶段
	var index= 29;
	var stage='';//
	var isconfirm = 1;//项目经理确认弹框
	var bidderIdList = 0; //投标人集合
	var bidIntervalID = "";	//标段定时器
	
	/***新计时***/
	var getTimeUrl = config.OpenBidHost + "/sysTime.do";//获取系统时间
	var nowState = '';//当前状态
	var timeIntervalID = "";//时间定时器
	var overBidOpenTime = '';//开标时间
	var overSecretTime = '';//解密时间
	var overSignTime = '';//签名时间
	var isStop = false;//是否暂停
	var lasIntervaltTime = '';//倒计时定时器最后执行的时间
	var correctTime = 10;//纠正倒计时的时间段s
	var correctTimeCount = 0;//纠正计次
	var restLength = 0;//暂停时的剩余时间
	var changeFrequencyTime = 60*1000 //改变纠正频率的倒计时时间s
	var changedCorrectTime = 1 //改变纠正频率后的 纠正倒计时的时间段s与correctTime相关
	/***新计时***/
	var mask = "";//遮罩
	
	
	var isRefresh = false;//判断是加载数据表格还是刷新数据，加载完数据后改变其值为true
	var table;
	var tableData = [];
	
	var reviewData = [];//需要设置的评审项参数
	var isShowSet = false;//是否显示设置评审项参数的按钮
	var RenameData;//投标人更名信息
	/***********************************************页面加载完初始化****************************************/	
	/* 监听浏览器 */
	/* var hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
	var visibilityChangeEvent = hiddenProperty.replace(/hidden/i,'visibilitychange');
	// 监听浏览器的窗口改变事件  document.hidden 事件 false 就是没被隐藏 true 就是被隐藏
	var onVisibilityChange = function(){
	        if (document[hiddenProperty]) {
	            console.log('窗口被切换了');
	        } else {
	            console.log('窗口切换回来了');
	        }
	    }
	 document.addEventListener(visibilityChangeEvent,onVisibilityChange) */
	/* 监听浏览器 */
	//页面初始化
	$(document).ready(function(){
		// 检查监标人是否已经设置过了
		validSupervisor()
		//评审参数设置
		getSet()
		//初始化组建
//		configComponents();
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
		/***新计时***/
		setCountdown(true, true);
		/***新计时***/
	})
	/***新计时***/
	//isSet 是否开启定时器
	//isGetStopState 是否获取暂停参数
	function setCountdown(isGetStopState, isSet){
		findBidOpening(bidId, isGetStopState, true);
		var endTime;
		if(nowState  == ''){
			nowState = 0;
		}
		console.log(nowState);
		//签到（0）、 解密（1）、签名（2）阶段有倒计时，其它阶段无倒计时
		if(nowState == 0 || nowState == 1 || nowState == 2){
			if(nowState == 0){
				endTime = handleTimeFormat(overBidOpenTime);
			}else if(nowState == 1){
				endTime = handleTimeFormat(overSecretTime);
			}else if(nowState == 2){
				endTime = handleTimeFormat(overSignTime);
			}
			if(!isStop){
				sysTime(endTime, isStop, isSet);
			}else{
				// console.log('暂停',timeIntervalID)
				if(timeIntervalID != ''){
					// console.log('暂停--关',timeIntervalID)
					clearInterval(timeIntervalID);
					timeIntervalID = '';
				}
				computeTime(restLength);
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
						
						//记住最后执行定时器的时间（用来纠正系统后台运行时定时器被浏览器停止的时间差）
						lasIntervaltTime = new Date().getTime();
						//签到、解密、签名时进行时间偏差纠正
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
						// console.log('最后时间：',new Date())
						// initInterval(currTime,endTime);
					    // 显示倒计时信息
					    // setCountDownInfo(countDown)
					}, 1000)
				}
				
			}
		});

		//计算日历时间
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
			// findBidOpening(bidId);
			findBidOpening(bidId, false);
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
						var uibg = '<li class="lan" value="'+data.data[i].id+','+data.data[i].bidSectionName+'"><div class="hao">'+(i+1)+'</div>'
				  			+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
						//不带背景色
						var ui = '<li class="bs" value="'+data.data[i].id+','+data.data[i].bidSectionName+'"><div class="hao">'+(i+1)+'</div>'
				  			+'<div class="biaow"><h3>标段名称：'+data.data[i].bidSectionName+'</h3><p>标段编码：'+data.data[i].bidSectionCode+'</p></div></li>';
						
						//选中当前数据行
						if(bidId == data.data[i].id){
							$("#pojectsData").append(uibg);
							$("#ptitle").html(""+data.data[i].bidSectionName+"项目开标大厅");
							RenameData = getBidderRenameMark(bidId);//投标人更名信息
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
							RenameData = getBidderRenameMark(bidId);//投标人更名信息
							isRefresh = false;//切换标段后重新加载投标人信息
					        bidderIdList = 0;
					        $("#ptitle").html(""+arr[1]+"项目开标大厅");
							
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
	
	/**根据id开标数据*/
	/*isNotCorrect true 不计入纠正
	isGetStopState  是否获取暂停参数
	*/
	
    function findBidOpening(id, isGetStopState, isNotCorrect){
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
						
						/***新计时***/
						overBidOpenTime = data.data.infors.bidOpenTime?data.data.infors.bidOpenTime:'';//开标时间
						overSecretTime = data.data.infors.decryptEndDate?data.data.infors.decryptEndDate:'';//解密时间
						overSignTime = data.data.infors.signEndTime?data.data.infors.signEndTime:'';//签名时间
						//当前阶段发生变化时
						console.log('+++++当前阶段：'+data.data.infors.stageStates);
						if(nowState != data.data.infors.stageStates){
							nowState = data.data.infors.stageStates;//当前阶段
							console.log('+++++开启倒计时阶段：'+nowState);
							setCountdown(false);
						}
						
						if(isNotCorrect){
							isStop = data.data.infors.stopStates == 1?true:false;//是否暂停
						}
						restLength = data.data.infors.restLength?data.data.infors.restLength:'0';
						//签到、解密、签名时进行时间偏差纠正
						/* if(lasIntervaltTime != '' &&  data.data.infors.stopStates != 1 && (data.data.infors.stageStates == 0 || data.data.infors.stageStates == 1 || data.data.infors.stageStates == 2)){
							if(!isNotCorrect){
								correctTimeCount = correctTimeCount + 1;
								if(Math.abs(lastPostSysTime - new Date().getTime()) > 1500){
									correctTimeCount = 10;
								}
								lastPostSysTime = new Date().getTime();
								//console.log('计数：',correctTimeCount);
								//console.log('系统时间：',new Date());
								// console.log('系统时间 - 最后时间 =',Math.abs(new Date().getTime() - lasIntervaltTime));
								if(Math.abs(new Date().getTime() - lasIntervaltTime) < 2000 ){
									if(correctTimeCount >= correctTime && !isNotCorrect){
										//长时间纠正一次倒计时
										setCountdown(false);
										correctTimeCount = 0;
									}
								}else{
									setCountdown(false);
								}
							}
							
						} */
						
						/***新计时***/
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
		//1.实时推送选择的标段开标信息
	    $("#suspend,#kbyy,#kbylb,#jskb,#recover").hide();
		//2.判断是否需要项目经理点击确认(签到)
		if(obj.exist==1){
			//判断是否需要再次弹出确认框
			if(isconfirm==1){
				//清除定时器
				window.clearInterval(bidIntervalID); 
				parent.layer.confirm('投标家数不足3家,请问是否继续？', {closeBtn: 0,
				btn: ['继续','招标失败'] //按钮
				,btn1:function(layid,layero){
					//关闭弹出框
					parent.layer.close(layid);
					managerConfirm(bidId,true);
				},btn2:function(layid,layero){
					parent.layer.prompt({
						formType: 2,
						value: '',
						closeBtn: 0,
						maxlength: 200,
						title: '请输入招标失败原因'
					}, function(value, index, elem){
						parent.layer.close(index);
						//关闭弹出框
						parent.layer.close(layid);
						managerConfirm(bidId,false,value);
					});
					return false
				}});
				
				isconfirm==0;
			}
			isconfirm ++;
		}
		
		//2.判断是否需要项目经理点击确认(解密)
		if(obj.existd==1){
			//判断是否需要再次弹出确认框
			if(isconfirm==1){
				//清除定时器
				window.clearInterval(bidIntervalID); 
				parent.layer.confirm('投标家数不足3家,请问是否继续？', {closeBtn: 0,
				btn: ['继续','招标失败'] //按钮
				,btn1: function(layid,layero){
					//关闭弹出框
					parent.layer.close(layid);
					managerDConfirm(bidOpeningId,true);
				},btn2: function(layid,layero){
					parent.layer.prompt({
						formType: 2,
						value: '',
						closeBtn: 0,
						maxlength: 200,
						title: '请输入招标失败原因'
					}, function(value, index, elem){
						parent.layer.close(index);
						//关闭弹出框
						parent.layer.close(layid);
						managerDConfirm(bidOpeningId,false, value);
					});
					return false
				}});
			}
			isconfirm ++;
		}
		
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
	    progressStage(obj);
	    
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
	function progressStage(obj){
		//判断是否有遮罩
		if(mask !=""){
			//关闭遮罩
			parent.layer.close(mask);
			//置空
			mask = "";
		}
		if(obj.stageStates && obj.stageStates != 0){
			$('.biao').show();//项目经理点击开启按钮前”完全隐藏投标人信息表格
		}
		//开标过程记录
		if(obj.processPdfUrl){
			$('#kbgcjl').attr("pdfurl",""+obj.processPdfUrl+"").show();
		};
		$("#manualOpen").hide();
		switch(obj.stageStates) {
			//签到
			case 0:
	    		//状态
				$("#current").html("签到");
				//倒计时
				//initInterval(sysTime,obj.bidOpenTime);
				//按钮
				$("#suspend,#recover,#kbyy,#kbylb,#jskb,#kbjl").hide();
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
	    			//initInterval(0, obj.restLength);
	    			//状态
					$("#current").html("解密(暂停)");
					//按钮
					$("#suspend,#kbyy,#kbylb,#jskb").hide();
			    	$("#recover,#kbjl").show();
	    		}else{
			    	//倒计时
					// initInterval(sysTime, obj.decryptEndDate);
					//状态
					$("#current").html("解密");
					//按钮
					$("#recover,#kbylb,#jskb").hide();
					$("#suspend,#kbyy,#kbjl").show();
					if(isShowSet){
						$('#parameter').show();
					}else{
						$('#parameter').hide();
					}
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
	    			//initInterval(0, obj.restLength);
	    			//状态
					$("#current").html("签名(暂停)");
					//按钮
					$("#suspend,#kbyy,#kbylb,#jskb").hide();
			    	$("#recover,#kbjl").show();
	    		}else{
	    			if(isShowSet){
						$('#parameter').show();
					}else{
						$('#parameter').hide();
					}
					if(!obj.pdfUrl){
						$('#sign').show();
					}else{
						$('#sign').hide();
					}
					//状态
					$("#current").html("签名");
			    	//倒计时
					//initInterval(sysTime, obj.signEndTime);
					//状态
					$("#current").html("签名");
					//按钮
					$("#recover,#jskb").hide();
					$("#suspend,#kbyy,#kbylb,#kbjl").show();
					
					
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
				//initInterval(0,0);//置空
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
				//initInterval(0,0);//置空
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
				//
//				clearInterval(bidIntervalID);
				//倒计时
				//initInterval(0,0);//置空
				//添加一览表路径
				$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
				//按钮
				$("#recover,#suspend").hide();
				$("#kbylb,#kbyy,#jskb,#kbjl").show();
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
	function managerConfirm(id, status, reson){
		var save_data = {
			"bidSectionId":id,
			"status":status,
		};
		if(reson){
			save_data.flowReason = reson;
		};
		$.ajax({
	       	url: bidConfirmUrl,
	        type: "get",
	        data: save_data,
	        async:false,
	        beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
	        success: function (data) {
	         	if(data.success){
	         		bidIntervalID = window.setInterval(function() {
						//查询标段信息状态
						// findBidOpening(bidId);
						findBidOpening(bidId, false);
					}, 1000);
	         	}else{
	         		parent.layer.alert("继续失败");
	         	}
	        }
	    });
	}
	
	/**项目经理确认(解密)*/
	function managerDConfirm(id, status, reson){
		var save_data = {
			"openingId":id,
			"status":status,
		};
		if(reson){
			save_data.flowReason = reson;
		};
		$.ajax({
	       	url: bidDConfirmUrl,
	        type: "get",
	        data: save_data,
	        async:false,
	        beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
	        success: function (data) {
	         	if(data.success){
	         		bidIntervalID = window.setInterval(function() {
						//查询标段信息状态
						findBidOpening(bidId, false);
					}, 1000);
	         	}else{
	         		parent.layer.alert("继续失败");
	         	}
	        }
	    });
	}
						
	/****************************************************投标结果***************************************************************************/
    /**根据标段id查询投标结果*/
    function getBidResults(data,states){
 		//清空列表
//	    $("#bidtable").empty();
	    if(!isRefresh){
	  		tableData = data;
		    layui.use('table', function(){
			  	table = layui.table;
				var tableIns =  table.render({
				    elem: '#bidtable'
				   , limit: Number.MAX_VALUE // 数据表格默认全部显示
				    ,cols: [[
				      	{title: '序号', type:'numbers', fixed: 'left'}
				      	,{field:'bidderName',  title: '投标单位名', fixed: 'left',width:'300',
							templet: function(value){
								return showBidderRenameMark(value.bidderId, value.bidderName, RenameData, 'room_body')
							}
						}
				      	,{field:'fileSubmitTime', title: '递交时间',width:'200',align:'center'}
				      	,{field:'signInResult', title: '是否签到',width:'100',align:'center',
				      		templet: function(value){
				      			if(value.signInResult == '0'){
					         		return '<div><img src="../../images/icno_no.png"></div>';
					         	}else if(value.signInResult == '1'){
					         		return '<div><img src="../../images/icon_yes.png"></div>';
					         	}else{
					         		return ''
					         	}
				      		}
				      	}
				      	,{field:'signInDate', title: '签到时间',width:'200',align:'center'}
				      	,{field:'decryptResult', title: '是否解密',width:'100',align:'center',
				      		templet: function(value){
				      			if(value.decryptResult == '0'){
					         		if(states ==1){
				         				return "<div><img src='../../images/icno_no.png'><button onclick='importDecrypt(\""+value.bidderId+"\")' type='button' class='btn btn-primary btn-xs' style='padding:2px;'>导入</button></div>";
				         			}else{
				         				return '<div><img src="../../images/icno_no.png"></div>';
				         			}
					         	}else if(value.decryptResult == '1'){
					         		return '<div><img src="../../images/icon_yes.png"></div>';
					         	}else{
					         		return '未解密'
					         	}
				      		}
				      	}
				      	,{field:'decryptDate', title: '解密时间',width:'200',align:'center'}
				      	,{field:'signResult',title: '是否签名',width:'100',align:'center',
				      		templet: function(value){
				      			if(value.signResult == '0'){
					         		return '<div><img src="../../images/icno_no.png"></div>';
					         	}else if(value.signResult == '1'){
					         		return '<div><img src="../../images/icon_yes.png"></div>';
					         	}else{
					         		return ''
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
				    ,id:'tableReload'
				    ,done: function(){
				    	isRefresh = true
				    }
			  	});
	  		})
	    }else{
	    	var isSame = true;
	    	for(var i = 0;i<data.length;i++){
	    		$.each(data[i], function(key,value) {
	    			if(tableData.length == 0 || tableData[i][key] != value){
	    				isSame = false;
	    				tableData = data;
	    			}
	    		});
	    	}
	    	if(!isSame){
	    		table.reload('tableReload',{data:data})
	    	}
	    }
	    
	    //如果数据不为空，则循环添加值
	    if(data != ''){
	        //判断是否是第一次加载下拉框
	        if(bidderIdList == 0){
	         	$("#sendperson").empty().append("<option value='all'>所有人</option>");
	        }
	         		
	        for(var i = 0;i < data.length;i++) {
//	         	var signIn = '';
//	         	var decrypt = '未解密';
//	         	var sign = '';
//	         	//签到
//	         	if(data[i].signInResult == '0'){
//	         		signIn = '<img src="../../images/icno_no.png">';
//	         	}else if(data[i].signInResult == '1'){
//	         		signIn = '<img src="../../images/icon_yes.png">';
//	         	}
//	         	//解密
//	         	if(data[i].decryptResult == '0'){
//	         		decrypt = "<img src='../../images/icno_no.png'>";
//	         		if(states ==1){
//	         			decrypt = decrypt + "&ensp;<button onclick='importDecrypt(\""+data[i].bidderId+"\")' type='button' class='btn btn-primary btn-xs' style='padding:2px;'>导入</button>";
//	         		}
//	         	}else if(data[i].decryptResult == '1'){
//	         		decrypt = "<img src='../../images/icon_yes.png'>";
//	         	}
//	         	//签名
//	         	if(data[i].signResult == '0'){
//	         		sign = '<img src="../../images/icno_no.png">';
//	         	}else if(data[i].signResult == '1'){
//	         		sign = '<img src="../../images/icon_yes.png">';
//	         	}
//	         			
//	         	var ui = '<tr><td width="3%" style="text-align:center;">'+(i+1)+'</td><td width="15%">'+data[i].bidderName+'</td><td width="5%" style="text-align:center;">'+data[i].fileSubmitTime+'</td><td width="5%" style="text-align:center;">'+signIn+'</td><td width="10%">'+(data[i].signInDate == undefined ? '' : data[i].signInDate)+'</td>'
//	         	+'<td width="5%" style="text-align:center;">'+decrypt+'</td><td width="10%">'+(data[i].decryptDate == undefined ? '' : data[i].decryptDate)+'</td><td width="5%" style="text-align:center;">'+sign+'</td><td width="10%">'+(data[i].signDate == undefined ? '' : data[i].signDate)+'</td>'
//	         	+'<td width="27%">'+(data[i].signInCode == undefined ? '' : ('签到码:'+data[i].signInCode))+'&ensp;'+(data[i].decryptCode == undefined ? '' :'解密码:'+data[i].decryptCode)+'&ensp;'+(data[i].signCode == undefined ? '' :'签名码:'+ data[i].signCode)+'</td></tr>';
//	         	//给表格追加数据
//	         	$("#tbodyResults").append(ui);
	         			
	         	if(bidderIdList == 0){
	         		//给下拉框添加值
	         		$("#sendperson").append("<option value='"+data[i].bidderId+"'>"+data[i].bidderName+"</option>");
	         	}
	        }
	         	
//	        $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 }); 	
	        bidderIdList = 1;//投标人下拉框置为1
	    }
	    $(document).scrollTop($(document)[0].scrollHeight);
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
					var token = $.getToken();
					xhr.setRequestHeader("Token",token);
				},
				success: function(ret) {
					if(ret.success) {
						/***新计时***/
						isStop = true;
						setCountdown(false);
						/***新计时***/
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
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
			success: function(ret) {
				if(ret.success) {
					//打开倒计时定时器
					//initInterval();
					/***新计时***/
					isStop = false;
					setCountdown(true, true);
					
					/***新计时***/
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
				var message = "<li><div style='width:100%;word-wrap:break-word;word-break:break-all;'>【"+obj[i].sendDate+"】&ensp;<B>"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</B></div></li>";
				$("#chartWin").append(message);
			}else{
				var message = "<li><div style='width:100%;word-wrap:break-word;word-break:break-all;'>【"+obj[i].sendDate+"】&ensp;"+obj[i].enterpriceName+":&ensp;"+obj[i].sendMess+"</div></li>";
				$("#chartWin").append(message);
			}
		}
		$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
	}
	
    //发送消息
    function chatWithMananger(){
    	var msg = $("#msg").val();//获取消息
    	var sendperson = $("#sendperson").val();//获取发送人
    	var enterpriceName = $("#sendperson option[selected]").text();//获取发送人 
    	//解决ie兼容性问题
		if(msg == $("#msg").prop('placeholder')){
			msg = '';
		}
	
    	//不能发送空消息
    	if($.trim(msg)!=""){
    		if(msg.length<300){
				var message = {"bidSectionId":bidId, "sendMess":msg,"receiveEmployeeId":sendperson,"enterpriceName":enterpriceName,"examType":2};
	    		$.ajax({
					type: "post",
					url: sendUrl,
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
    
    /*********************************************************开标异议**************************************************************************/
    //打开异议
	function openObjection(){
		var token = $.getToken();
		var states = $("#stageStates").val();
		layer.open({
			type: 2,
			title: '异议管理',
			area: ['1200px', '600px'],
			resize: false,
			content: 'objectionList.html?bidId='+bidId+'&VG=0&states='+states+'&Token='+token,
		});
	}
	
	
	
	
	/*******************************************************************打开一览表************************************************************************/
	//打开一览表
	function kbySchedule(that){
		var token = $.getToken();
		//获取pdf路径
		var pdfurl = $(that).attr("pdfurl"); //"//502/20190615/pdf/005004feb30e4592b1255215c8c3b165.pdf"; //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
		
		//判断是否有pdf
		if(pdfurl==''||pdfurl== "undefined"){
			layer.alert("暂无开标一览表");
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
	
	/*******************************************************************项目经理手动导入************************************************************************/
    //导入
	function importDecrypt(bidderId){
		layer.open({
			type:2, 
			title:'上传投标文件', 
			area:['500px','300px'],
			content:'importDecrypt.html?bidderId='+bidderId+'&bidOpeningId='+bidOpeningId+'&bidSectionId='+bidId,
			scrollbar:false,
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
		  			//$("#enterpriseName").html(data.data.enterpriseName);
		  			$("#userName").html(data.data.userName);
		  		}
		  	}
		})
	}

	/********************************************************************项目经理手动开标***************************************************/
	function manualOpen(){
		$('#manualOpen').css('pointer-events', 'none');//防止连续点击
		$.ajax({
			type:"get",
		  	url:config.OpenBidHost + '/BidOpeningSituationController/managerManualOpen.do',
		  	data: {"bidSectionId":bidId},
		  	async:false,
		  	beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
		  	success: function(data){
				$('#manualOpen').css('pointer-events', 'auto');
		  		if(data.success){
		  			// layer.alert(data.data);
		  		}else{
		  			layer.alert(data.message);
		  		}
		  	}
		})
	}
	
	/********************************************************************项目经理录入开标记录***************************************************/
	function openSituation(){
		var token = $.getToken();
		//获取开标状态
		var states = $("#stageStates").val();
		layer.open({
			type: 2,
			title: '开标记录',
			area: ['1200px', '600px'],
			resize: false,
			content: 'editOpenSituation.html?bidOpeningId='+bidOpeningId+'&states='+states+'&Token='+token,
		});
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
		callback();
		if(timeIntervalID != ''){
			clearInterval(timeIntervalID)
		}
		if(bidIntervalID != ''){
			clearInterval(bidIntervalID)
		}
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	/*************************************           结束            ****************************************/
	$(document).on('click','#jskb',function(){
		endOpen(callback)
	});
}
/*********************************************************************结束开标********************************************************************/
	/**结束开标*/
function endOpen(callback){
	top.layer.confirm('温馨提示：您确定要结束吗？', {btn: ['是', '否']}, function(o){
		$.ajax({
	       	url: config.OpenBidHost  + "/BidOpeningSituationController/endBidOpening.do",
	        type: "get",
	        data: {"id":bidOpeningId,"bidSectionId":bidId,"stageStates":4},
	        async:false,
	        beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
	        success: function (data) {
	         	if(data.success){
	         		top.layer.alert("结束成功");
					//存储预警信息
					saveWarningInfo(bidId, 2);
	         		callback()
	         	}
	        }
    	});
		//关闭选择框
	    top.layer.close(o);			 
	}, function(o){
	   top.layer.close(o)
	});
}
/*****************         评审参数设置             *****************************************/
function getSet(){
	$.ajax({
		type:"post",
		url:setUrl,
		async:true,
		data:{
			'bidSectionId':bidId,
			'examType':'2'
		},
		success: function(data){
			if(data.success){
				if(data.data && data.data.length > 0){
					reviewData = data.data;
//					var isSetShow = false;
					for(var i = 0;i<reviewData.length;i++){
						if(!reviewData[i].dataValue){
							isShowSet = true
						}
					};
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
$('#parameter').click(function(){
	parent.layer.open({
		type: 2,
		title: '评审参数设置',
		area: ['1000px', '600px'],
		resize: false,
		content: setHtml + '?id=' + bidId + '&examType=2',
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(reviewData);  //调用子窗口方法，传参
		}
	});
})
/****************       评审参数需要设置而未设置 到签名阶段时   项目经理页面出现开始签名按钮         *****************/
$('#sign').click(function(){
	$.ajax({
		type:"post",
		url:startSignUrl,
		async:true,
		data: {
			'bidOpeningId':bidOpeningId
		},
		success: function(data){
			if(!data.success){
				parent.layer.alert(data.message)
			}
		}
	});
})
/*******************************************************************打开开标过程记录************************************************************************/
	//打开开标过程记录
function kbgcySchedule(that){
	//获取pdf路径
	var pdfurl = $(that).attr("pdfurl");//"//502/20190615/pdf/005004feb30e4592b1255215c8c3b165.pdf"; //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
	
	//判断是否有pdf
	if(pdfurl==''||pdfurl== "undefined"){
		layer.alert("暂无开标过程记录");
	}else{
		//pdf预览
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
	}
}

// 检查是否设置了监标人是否添加提示
function validSupervisor() {
	$.ajax({
		type: 'get',
		url: config.OpenBidHost + '/BidOpeningSituationController/validSupervisor.do',
		data: { bidSectionId: bidId },
		success: function (data) {
			if (!data.success) {
				parent.layer.alert(data.message,{
					title: '提示',
					closeBtn:0,
					btn:['关闭']
				});
			}
		},
	});
}