/**
*  zhouyan 
*  2019-3-15
*  开标情况列表（投标人）
*  方法列表及功能描述
*/
var letterHtml = "Bidding/BidOpen/Bidder/BidSituation/model/letterDecrypt.html"
var newsHtml = "Bidding/BidOpen/Bidder/BidSituation/model/sendNews.html";//发送消息页面
var logListUrl = config.tenderHost + '/BidOpeningLogController/findBidOpeningLogList.do';//日志列表
var logUrl = config.tenderHost + "/BidOpeningLogController/findBidOpeningLogList.do";  //日志列表
var logNewUrl = config.tenderHost + "/BidOpeningLogController/findBidOpeningLogListLast.do";  //刷新日志列表
var countDownUrl = config.tenderHost + "/BidOpeningConfigurationController/countdown.do";  //倒计时
var decryptUrl = config.tenderHost + '/BidOpeningController/startDecrypt.do';//信封码上传接口
var findDecryptUrl = config.tenderHost + '/BidOpeningDecryptDetailsController/findUrlByEnterpriseIdAndPackageId.do';//查询解密设置详情  投标函附录url
var pdfUrl = config.tenderHost + '/BidOpeningDecryptDetailsController/getBidOPeningPdf.do';// 投标函pdf地址
var findPdfUrl = config.tenderHost + "/BidOpeningConfigurationController/findBidPdfUrl.do";  //查询确认一览表Url
var getSecretUrl = config.tenderHost + "/BidFileController/findsecretKeyText.do";//UK解密时获取加密密文地址

var decryptHtml = "Bidding/BidOpen/BidSituation/model/fileDecrypt.html";//投标文件解密/确认查看
var confirmHtml = "Bidding/BidOpen/Bidder/BidSituation/model/confirmView.html";//打开一览表页面
var pdfHtml = "Bidding/BidOpen/Bidder/BidSituation/model/pdfView.html";//pdf查看签章页面
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var set;//定时器
var rowData ;//父级页面传过来的数据
var currentBidId = '';//当前操作的标段Id
var logTimer = "";  //看板信息定时器
var createDate = "";  //距离上一次接收日志的最后的时间
var sendDate = "";  //最后一次接收消息的时间
var msgTime = 1000;
var countNum = 1800000;  //开标倒计时时间
var bidOpeningConfigurationId = "";//解密设置ID
var enterpriseId = "";
var ciphertext = '';

$(function(){
	//控制左右两边的高度一致
	$("#bidderList").height($('#functionList').height());
	//UK解密
	$('#formName').on('click','#btnUKDecrypt',function(){
		$.ajax({
			type:"post",
			url:getSecretUrl,
			async:true,
			data:{
				'bidSectionId':currentBidId
			},
			success: function(data){
				if(data.success){
					if(data.data){
						if(data.data.secretKeyText){
							ciphertext = data.data.secretKeyText;
							console.log(ciphertext)
							var cipherCode = ukCipher(ciphertext);//解密后的密码
							fromLetter(cipherCode);
						}
					}
				console.log(data)
				}
			}
		});
	});
	//信封解密
	$('#formName').on('click','#btnDecrypt',function(){
		top.layer.open({
			type: 2,
			title: '信封解密',
			area: ['500px', '200px'],
			content: letterHtml,
			resize: false,
			success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			    iframeWin.fromChild(fromLetter);
			}
		})
	});
	
	
	//投标函附录
	$('#formName').on('click','#btnLetter',function(){
		var keyId = '';
		$.ajax({
	         url: findDecryptUrl,
	         type: "post",
	         data: {
	         	packageId:currentBidId 
	         },
	         success: function (data) {
	         	console.log(data)
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        	}else{
	        		if(data.data){
		         		var url = data.data.decryptPdf;
		         		var keyId = data.data.id;
		         	}
		         	if(url && url != ''){
	         			openPreview(url);
		         	}else{
		         		viewPdf(pdfUrl,keyId);
	//	         		parent.layer.alert(data.message);
	//	         		return;
		         	}
	        	}
	         	
	         },
	         error: function (data) {
	             parent.layer.alert("请求失败");
	         }
	    });
	});
	//UK解密
	function ukCipher(text){
			//声明证书集对象
		var certs ;
		if (isIe()) { //IE
			certs = document.getElementById("UCAPI");
		} else {
			certs = new CerticateCollectionX();
		} 
		//根据属性设置过滤条件(1表示使用SKF接口，2表示CSP(CSP不能枚举SM2证书)，)
	    certs.setCryptoInterface(1);
		//过滤签名证书算法("sm2","rsa")
		certs.setCF_CertAlg("sm2");
		//获取签名证书
		certs.setCF_KeyUsage(0x10);
		//加载证书集返回值等于0表示成功
		var loadResult = certs.Load();
		var len = certs.getSize();
		if(loadResult != 0 || len < 1){
			alert("未取到证书!");
			return false;
		}
		encryptCert = certs.GetAt(0);
		var decryptedData = encryptCert.EnvOpen(text);
		console.log(decryptedData);
		return decryptedData;
	}

		
	/*
	 * 打开投标附录函
	 * pdfPath:打开的路径
	 * keyId:该投标人解密详情主键ID
	 */
	function viewPdf(pdfPath,keyId){
		previewPdf(pdfPath+'&recordid='+keyId+'&id='+currentBidId);
		/*var temp = top.layer.open({
			type: 2,
			title: "预览 ",
			area: ['100%','100%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
//			btn:["确定","关闭"],
			content: pdfHtml+'?pdfPath='+ pdfPath+'&recordid='+keyId+'&id='+currentBidId,
		   success: function(index,layero){
//		   	console.log($.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + encodeURIComponent(pdfPath)))
		   		/*var iframeWin = layero.filter('iframe')[0].contentWindow;
			//调用子窗口方法，传参
				iframeWin.fromChild(pdfPath);*/
		   }
		});
		
		top.layer.full(temp);*/
	
	}
	
	
	//确认一览表
	$('#formName').on('click','#btnConfirm',function(){
		$.ajax({
	         url: findPdfUrl,
	         type: "post",
	         data: {
	         	id:bidOpeningConfigurationId, 
	         	packageId:currentBidId
	         },
	         success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message,{icon:7,title:'提示'});
	        		return;
	        	}else{
	        		if(data.data.pdfUrl){
	        			if(data.data.isEdit == 0){
	        				viewPreview(data.data.pdfUrl);//确认盖章
	        			}else if(data.data.isEdit == 1){
	        				openPreview(data.data.pdfUrl);//查看预览
	        			}
	        		}else{
	        			parent.layer.alert('开标一览表未生成',{icon:5,title:'提示'});
	        		}
	        	}
	         	
	         },
	         error: function (data) {
	             parent.layer.alert("请求失败");
	         }
	    });
	});
	/*
	 * 打开一览表
	 * pdfPath:打开的路径
	 */
	function viewPreview(pdfPath){
		var temp = top.layer.open({
			type: 2,
			title: "预览 ",
			area: ['100%','100%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			btn:[],
			content: confirmHtml+'?pdfPath='+ top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath+'&id='+currentBidId+'&recordid='+bidOpeningConfigurationId,
		   	success: function(index,layero){
		   		
		   }
		});
		top.layer.full(temp);
	}
	//发送消息
	$('#formName').on('click','#btnSend',function(){
		parent.layer.open({
			type: 2,
			title: '消息',
			area: ['500px', '430px'],
			content: newsHtml + "?packageid="+currentBidId+"&employeeid="+enterpriseId,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
	//			console.log(iframeWin)
				//调用子窗口方法，传参
	//			iframeWin.bidFromFathar(rowData);  
			}
		});
	})
	//tab切换
	$('#roomContent').on('click','.tab',function(){
		reset();
		var li = $(this).closest('li');
		var index = li.index();
		li.addClass('active');
		li.siblings().removeClass('active')
		tabContent(rowData[index]);
		/*logList(rowData[index]);
		refresh(rowData[index]);*/
		currentBidId = rowData[index].id;
		bidNewLog(currentBidId);
		logTimer=setInterval(function(){
	    bidNewLog(currentBidId);
	  },msgTime);
		set=setInterval(function(){
			countDown(currentBidId);
		}, 1000);
		
	})
	
	// 设置各个高度
	$(".main").height($("body").height() - $("header").height() - 60 - $("footer").height());
	$(".openPanel").height($(".main").height());
	$(".l-content").height($(".openPanel").height()-40);
	
});
/*调用信封解码要调用的函数
 * letterDecrypt:信封解码页面传过来的参数
 */
function fromLetter(letterDecrypt){
	var index;
	var content = '<div style="font-size:16px; color:#3995C8 ">'+entryInfo().enterpriseName+'</div>'
	+'<div style="color:#3995C8 ">正在解密请稍等</div>'
	+'<div class="progress progress-striped active">'
						+'<div class="progress-bar progress-bar-success" role="progressbar"'
							 +'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"'
							 +'style="width: 100%;">'
							+'<span class="sr-only"></span>'
						+'</div>'
					+'</div>';
	$.ajax({
		type:"post",
		url:decryptUrl,
		async:true,
		beforeSend: function(xhr){
		    var token = $.getToken();
		    xhr.setRequestHeader("Token",token);
		    index =parent.layer.open({
		    	title:false,
		    	btn:[],
		    	area: '300px',
		    	closeBtn: 0,
		    	content:content
		    });
		},
		data: {
			'key': letterDecrypt,
			'bidOpeningConfigurationId': bidOpeningConfigurationId,
			'packageId':currentBidId
		},
		success: function(data){
			parent.layer.close(index);
			if(data.success){
				parent.layer.alert('恭喜解密成功!',{icon:6,title:'提示'});
			}else{
				parent.layer.alert('抱歉解密失败!<br>'+data.message,{icon:5,title:'提示'});
			}
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
/*父级调用的函数
 * data:父级传过来的数据
 */
function bidFromFathar(data){
	rowData = data;
	$('#roomContent').html('');
	if(data.length>0){
		var li = '';
		for(var i = 0;i<data.length;i++){
			li += '<li role="presentation"><a href="javacript:void(0)" class="tab">'+data[i].bidSectionName+'</a></li>'
		}
		$(li).appendTo('#roomContent');
	}
	$('#roomContent li').eq(0).addClass('active');
	tabContent(data[0]);
	/*logList(data[0]);
	refresh(data[0]);*/
	currentBidId = data[0].id;
	bidNewLog(currentBidId);
	countDown(currentBidId);
	logTimer=setInterval(function(){
    bidNewLog(currentBidId);
  },msgTime);
	set=setInterval(function(){
		countDown(currentBidId);
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
/*日志看板数据请求
 * data:要传递的数据
 *
 */
/*function logList(data){
	$.ajax({
		type:"post",
		url:logListUrl,
		async:true,
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);
    	},
		data:{
			'packageId':data.id
		},
		success: function(data){
			logHtml(data.data)
		},
		error:function(data){
			
		}
	});
};*/
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
};
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
         	enterpriseId = arr.enterpriseId;
         	if(arr.openingState == 0){
         		$("#countDown").text("未开标");
         		$('.notStarted').attr('disabled',true);
         	} else if(arr.openingState == 1){
         		$("#btnOrder").attr("disabled","disabled");
         		$('.notStarted').attr('disabled',false);
         		showTime();
         		
         	} else if(arr.openingState == 2){
         		showTime();
         		$('.notStarted').attr('disabled',true);
         	} else if(arr.openingState == 3){
         		$("#countDown").text("结束开标");
         		$('.btn').attr('disabled','disabled');
         		$('.notStarted').attr('disabled',true);
         		clearInterval(logTimer);
         		clearInterval(set);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
//消息看板
function msgHtml(data){
	var li='';
	for(var i = 0;i<data.length;i++){
		li += '<li>'
					+'<span class="createDate">【'+data[i].userName+'】</span>'
					+'<span class="content">'+data[i].sendMess+'</span>'
				+'</li>'
	}
	$(li).appendTo('#msgBoard');
	$('#msgBoard').parent().scrollTop($('#msgBoard').parent()[0].scrollHeight);
}


/*日志看板页面
 * data:页面数据
 *
 */

function logHtml(data){
//	$('#logBoard').html('');
	var li='';
	for(var i = 0;i<data.length;i++){
		li += '<li>'
					+'<span id="createDate">【'+data[i].createDate+'】</span>'
					+'<span id="content">'+data[i].content+'</span>'
				+'</li>'
	}
	$(li).appendTo('#logBoard');
	$('#logBoard').parent().scrollTop($('#logBoard').parent()[0].scrollHeight);
}
//重置页面
function reset(){
	clearInterval(logTimer);
	clearInterval(set);
	$('#logBoard').html("");
	$('#msgBoard').html("");
	createDate = "";
	sendDate = "";
}
//定时刷新
/*function refresh(data){
	var time = setInterval(function() {
            logList(data)
        }, 2000);
}*/
