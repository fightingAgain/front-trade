	/**********************************************接口*************************************************/	
	var bidOpeningUrl = config.tenderHost  + "/BidOpeningSituationController/getMBidOpening.do"; //根据id获取选中的标段信息状态
	
	/***************全局变量***************/	
	var bidId = $.getUrlParam("bid");	//标段id
	var bidOpeningId = ''; //开标数据id
	/***********************************************页面加载完初始化****************************************/	
	$(function(){
		//获取用户信息
		entryInfo();
		//初始化表格
		getOpeningBidList();
		//查询标段信息状态
		findBidOpening(bidId);
	})
	
	/*************************************************页面各种方法*****************************************/
	/**初始化今天开标数据列表*/
	function getOpeningBidList(){
		$.ajax({
			type: "get",
			url: config.openingHost  + "/BidOpeningSituationController/findBidSectionInfo.do?bidSectionId="+bidId,
			dataType: 'json',
			async: false,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
			success: function(data) {
				if(data.success){
					//清空项目列表
					$("#pojectsData").empty();
					//添加项目信息
					var uibg = '<li class="lan" value="'+data.data.id+','+data.data.bidSectionName+'"><div class="hao">1</div>'
				  		+'<div class="biaow"><h3>标段名称：'+data.data.bidSectionName+'</h3><p>标段编码：'+data.data.bidSectionCode+'</p></div></li>';
						
					$("#pojectsData").append(uibg);
					//设置标题
					$("#ptitle").html(""+data.data.bidSectionName+"项目开标大厅");
				} 
			}
		});
	}
	
	/**根据id开标数据*/
    function findBidOpening(id){
    	//如果id不为空，则查询数据
    	if(id != ""){
    		$.ajax({
				type: "get",
				url: config.openingHost+"/BidderOpenTenderController/pushBidSection?bidSectionId="+id,
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
		//0.获取服务器时间
		var sysTime = obj.sysTime;
		//计算日历时间
		initCurssrentDate(sysTime);
		//1.开标结状态
		if(obj.stageStates==4){ 
			$("#current").empty().html("结束");
		}else if(obj.stageStates==5){
			$("#current").empty().html("失败");
		}else if(obj.stageStates==6){
			$("#js_2").removeClass().addClass("step5");
			$("#current").empty().html("结束");
		}
		//添加一览表路径
		$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
		//2.查看聊天消息
		if(obj.messages)autoChatMessage(obj.messages);
	}
	
	/**********************************************日历时间**************************************************************************/
	//初始化时间
	function initCurssrentDate(systime){
		var arr = formatUnixtimestamp(systime.replace(new RegExp("-","gm"),"/")).split(" ");
		$("#hms").empty().html(arr[1]);
		$("#ymd").empty().html(arr[0].split("-")[0] + "年" + arr[0].split("-")[1] + "月" + arr[0].split("-")[2] + "日");
		window.setInterval(function() {//每一秒刷新页面
			var temporary = $.trim($("#ymd").text());
			temporary = temporary.replace("年","-").replace("月","-").replace("日","");
			var dateTime = NewDate(temporary + ' ' + $.trim($("#hms").text()));
			dateTime += 1000;
			var arr = formatUnixtimestamp(dateTime).split(" ");
			$("#hms").empty().html(arr[1]);
			$("#ymd").empty().html(arr[0].split("-")[0] + "年" + arr[0].split("-")[1] + "月" + arr[0].split("-")[2] + "日");
		}, 1000);
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
						
	/****************************************************投标结果***************************************************************************/
    /**根据标段id查询投标结果*/
    function getBidResults(data){
 		//清空列表
	    $("#tbodyResults").empty();
	    //如果数据不为空，则循环添加值
	    if(data != ''){
	
	        for(var i = 0;i < data.length;i++) {
	         	var signIn = '';
	         	var decrypt = '';
	         	var sign = '';
	         	//签到
	         	if(data[i].signInResult == '0'){
	         		signIn = '<img src="../../icons/icno_no.png">';
	         	}else if(data[i].signInResult == '1'){
	         		signIn = '<img src="../../icons/icon_yes.png">';
	         	}
	         	//解密
	         	if(data[i].decryptResult == '0'){
	         		decrypt = '<img src="../../icons/icno_no.png">';
	         	}else if(data[i].decryptResult == '1'){
	         		decrypt = '<img src="../../icons/icon_yes.png">';
	         	}
	         	//签名
	         	if(data[i].signResult == '0'){
	         		sign = '<img src="../../icons/icno_no.png">';
	         	}else if(data[i].signResult == '1'){
	         		sign = '<img src="../../icons/icon_yes.png">';
	         	}
	         			
	         	var ui = '<tr><td width="3%">'+(i+1)+'</td><td width="15%">'+data[i].bidderName+'</td><td width="5%">'+signIn+'</td><td width="10%">'+(data[i].signInDate == undefined ? '' : data[i].signInDate)+'</td>'
	         	+'<td width="5%">'+decrypt+'</td><td width="10%">'+(data[i].decryptDate == undefined ? '' : data[i].decryptDate)+'</td><td width="5%">'+sign+'</td><td width="10%">'+(data[i].signDate == undefined ? '' : data[i].signDate)+'</td>'
	         	+'<td width="27%">'+(data[i].signCode == undefined ? '' : data[i].signCode)+'&ensp;'+(data[i].signInCode == undefined ? '' : data[i].signInCode)+'&ensp;'+(data[i].decryptCode == undefined ? '' : data[i].decryptCode)+'</td></tr>';
	         	//给表格追加数据
	         	$("#tbodyResults").append(ui);

	        }
	         	
	    }
	    
	    $('#bidtable').bootstrapTable('resetView', {height: $("#bidderDiv").height() - 80 });
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

    /*********************************************************开标异议**************************************************************************/
    //打开异议
	function openObjection(){
		layer.open({
			type: 2,
			title: '异议管理',
			area: ['1200px', '600px'],
			resize: false,
			content:'objectionAnswers.html?bidSectionId='+bidId+'&states=4',
		});
	}
	
	/*******************************************************************打开一览表************************************************************************/
	//打开一览表
	function kbySchedule(that){
		//获取pdf路径
		var pdfurl = $(that).attr("pdfurl");  //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
		
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
		  			$("#userName").html(data.data.userName);
		  		}
		  	}
		})
	}
