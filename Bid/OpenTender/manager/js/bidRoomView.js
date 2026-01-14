	/**********************************************接口*************************************************/	
	var bidOpeningUrl = config.OpenBidHost  + "/BidOpeningSituationController/getMBidOpening.do"; //根据id获取选中的标段信息状态
	
	/***************全局变量***************/	
	var bidId = $.getUrlParam("id");	//标段id
	var bidOpeningId = ''; //开标数据id
	var token = sessionStorage.getItem('token');
	var RenameData;//投标人更名信息
	/***********************************************页面加载完初始化****************************************/	
	$(function(){
//		console.log(sessionStorage.getItem('token'))
//		parent.$('.layui-layer-title').css('display','none');
		//获取用户信息
		entryInfo()
//		configComponents();
		//初始化表格
		getOpeningBidList();
		//查询标段信息状态
		RenameData = getBidderRenameMark(bidId);//投标人更名信息
		findBidOpening(bidId);
		$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
		$('.dtl').css('height',($(window).height()-335)+'px');
		$('.dtr').css('height',($(window).height()-335)+'px');
		$('.dtl_ner').css('height',($(window).height()-440)+'px');
		
	})
	
	/*************************************************页面各种方法*****************************************/
//	window.onresize = function(){configComponents();}
	//初始化组建
/*	function configComponents(){
		//设置bootstrapTable起始的高度
	    $('#bidtable').bootstrapTable({ height: $(".biao").height() - 10 });
	    $(".fixed-table-container").css({ height: $(".biao").height() - 10 });
	    
	    $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 });
	}*/

	/**初始化今天开标数据列表*/
	function getOpeningBidList(){
		$.ajax({
			type: "get",
			url: config.OpenBidHost  + "/BidOpeningSituationController/findBidSectionInfo.do?bidSectionId="+bidId,
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
	         		}
	         	}
	       });
    	}
    }

	//配置目标标段信息
	function initBidOpening(obj){
		//0.获取服务器时间
		var systime = obj.sysTime;
		initCurssrentDate(systime);
	    //1.开标结状态
	    if(obj.stageStates==4){
			$("#current").html("结束");//状态
			
		}else if(obj.stageStates==5){
			$("#current").html("失败");//状态
		}else if(obj.stageStates==6){
			$("#js_2").removeClass().addClass("step5");
			$("#jskb").show();
			$("#current").html("结束中");//状态
		}	
		
		$("#kbylb").attr("pdfurl",""+obj.pdfUrl+"");
		//开标过程记录
		if(obj.processPdfUrl){
			$('#kbgcjl').attr("pdfurl",""+obj.processPdfUrl+"").show();
		}
		
		//2.刷新消息记录
		if(obj.messages){
	    	autoChatMessage(obj.messages);
	    }
		
		//3.标段投标人状态
	    if(obj.bidOpeningResults){
	    	getBidResults(obj.bidOpeningResults);
	    }
	}
	
	/**********************************************日历时间**************************************************************************/
	//初始化时间
	function initCurssrentDate(systime){
		var arr = formatUnixtimestamp(systime.replace(new RegExp("-","gm"),"/")).split(" ");
		$("#hms").empty().html(arr[1]);
		$("#ymd").empty().html(arr[0].split("-")[0] + "年" + arr[0].split("-")[1] + "月" + arr[0].split("-")[2] + "日");
		$("#week").empty().html("星期" + "日一二三四五六".charAt(new Date().getDay()));
		window.setInterval(function() {//每一秒刷新页面
			var temporary = $.trim($("#ymd").text());
			temporary = temporary.replace("年","-").replace("月","-").replace("日","");
			var dateTime = NewDate(temporary + ' ' + $.trim($("#hms").text()));
			dateTime += 1000;
			var arr = formatUnixtimestamp(dateTime).split(" ");
			$("#hms").empty().html(arr[1]);
			$("#ymd").empty().html(arr[0].split("-")[0] + "年" + arr[0].split("-")[1] + "月" + arr[0].split("-")[2] + "日");
			$("#week").empty().html("星期" + "日一二三四五六".charAt(new Date().getDay()));
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
    	
    	layui.use('table', function(){
		  var table = layui.table;
		  
		var tableIns =  table.render({
		    elem: '#bidtable'
		    ,limit: Number.MAX_VALUE // 数据表格默认全部显示
//		    ,url:'/demo/table/user/'
//		    ,width: 892
//		    ,height: 330
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
			         		return '<div><img src="../../images/icno_no.png"></div>';
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
		  	});
		  
		});
    	
    	
    	
// 		//清空列表
//	    $("#tbodyResults").empty();
//	    //如果数据不为空，则循环添加值
//	    if(data != ''){
//	
//	        for(var i = 0;i < data.length;i++) {
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
//	         		decrypt = '<img src="../../images/icno_no.png">';
//	         	}else if(data[i].decryptResult == '1'){
//	         		decrypt = '<img src="../../images/icon_yes.png">';
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
//	        }
//	        
//	        $('#bidtable').bootstrapTable('resetView',{ height: $(".biao").height() - 80 });
//	    }
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
	}
	
	/*********************************************************************结束开标********************************************************************/
	/**结束开标*/
	function endOpen(){
		layer.confirm('温馨提示：您确定要结束吗？', {btn: ['是', '否']}, function(o){
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
		         		layer.alert("结束成功");
		         		//重新刷新页面
						$("#current").html("结束");//状态
						$("#js_2").removeClass().addClass("step4");
						$("#jskb").hide();
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
		var pdfurl = $(that).attr("pdfurl");//"//502/20190615/pdf/005004feb30e4592b1255215c8c3b165.pdf"; //"//502/20190615/pdf/6d2014994a7948d49ee407de0fa76a9f.pdf";//"//502/20190615/pdf/00034440e73f4b908e114b30445cf1aa.pdf";    "//502/20190615/pdf/2c7f52d6e51c4300b41119c03ed9ce5c.pdf"; //$(that).attr("pdfurl");"
		
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
				content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfurl+"&Token="+sessionStorage.getItem('token'),
				yes:function(index,layero){
					top.layer.close(index);
				}
			});
		
			top.layer.full(temp);
		}
	}
	
	/*******************************************************************关闭页面**************************************************************************/
/*	function custom_close(){
		window.opener.refreshTable();
	    // 重置window.opener用来获取打开当前窗口的窗口引用
　　		// 这里置为null,避免IE下弹出关闭页面确认框
	    window.opener = null;
	    // JS重写当前页面
	    window.open("", "_self", "");
	    // 顺理成章的关闭当前被重写的窗口
	    window.close();
	}
*/
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
		  			$("#userName").html(data.data.userName);
		  		}
		  	}
		})
	}
	
    /*********************************************************开标异议**************************************************************************/
    //打开异议
	function openObjection(){
		var token = $.getToken();
		layer.open({
			type: 2,
			title: '异议管理',
			area: ['1200px', '600px'],
			resize: false,
			content: 'objectionList.html?bidId='+bidId+'&VG=0&states=4&Token='+token,
		});
	}
	
	/*******************************************************项目经理查看开标记录*********************************************************************/
	function openSituation(){
		$.ajax({
			type:"get",
			url:config.OpenBidHost + '/BidOpeningController/getOpenSituationInfo.do',
			data: {"id":bidOpeningId},
			async:false,
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token",token);
			},
			success: function(data){
				if(data.success){
				  	var content = '';
				  	//判断是否有开标数据
				  	if(data.data){
				  		content = data.data
				  	}else{
				  		content = "<p>暂无开标记录</>"
				  	}
				  	//打开擦看页面
				  	layer.open({
						type: 1,
						title: '查看开标记录',
						area: ['1200px', '600px'],
						btn:['关闭'],
						resize: false,
						content: '<div style="max-height:450px;overflow:auto;padding:20px;">'+content+'</div>',
						btn1: function(index){
							layer.close(index)
						}
					});
				}else{
					parent.layer.alert(data.message);
				}
			}
		});
	}
/*********************************        展开收起             ****************************/
$('.table_pack').click(function(){
	$('.table_pack').css('display','none');
	$('.biaonr').css('display','none');
	$('.table_open').css('display','inline-block');
	$('.dtl').css('height',($(window).height()-270)+'px');
	$('.dtr').css('height',($(window).height()-270)+'px');
	$('.dtl_ner').css('height',($(window).height()-375)+'px');
})
$('.table_open').click(function(){
	
	$('.table_open').css('display','none');
	$('.table_pack').css('display','inline-block');
	$('.biaonr').css('display','block');
	$('.dtl').css('height',($(window).height()-335)+'px');
	$('.dtr').css('height',($(window).height()-335)+'px');
	$('.dtl_ner').css('height',($(window).height()-440)+'px');
	$('.dtl_ner').scrollTop($('.dtl_ner')[0].scrollHeight);
})



function passMessage(data,callback){
	$(document).on('click','#custom_close',function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	})
}
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