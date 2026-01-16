/**

*  标室管理中的标室查询列表的列表的详情
*  方法列表及功能描述
*   1、getDetail()   信息反显
*/

var getUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情
var searchUrl = config.tenderHost + "/BiddingRoomQueryController/findBiddingRoomSectionList.do";	//开标室开标标段信息查询与可用时段
var bidDetailHtml =  "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面
var id = ""; //评标室ID
 $(function(){
 	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
 	/* 获取当前时间*/
	function getNow(s) {
	    return s < 10 ? '0' + s: s;
	}
	
	var myDate = new Date();
	//获取当前年
	var year=myDate.getFullYear();
	//获取当前月
	var month=myDate.getMonth()+1;
	//获取当前日
	var date=myDate.getDate(); 
	var h=myDate.getHours();       //获取当前小时数(0-23)
	var m=myDate.getMinutes();     //获取当前分钟数(0-59)
	var s=myDate.getSeconds();  
	
	var now=year+'-'+getNow(month)+"-"+getNow(date)+" 00:00:00";
	$('#searchStartDate').val(now)
	//查询时间
	$('#searchStartDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate:nowDate
		})
 	});
   
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail();
		getBid(now)
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	// 开标室使用情况查询
	$('#btnSearch').click(function(){
		var StartDate = $('#searchStartDate').val();	// 搜索的开始时间
		var searchDate = StartDate.split(' ')[0] + ' 00:00:00'; 	//拼接一个搜索的结束时间
		if(StartDate){
			getBid(searchDate)
		}else{
			parent.layer.alert('请选择日期！')
		}
		
	})
	//查看标段
	$("#bidList").on('click','.btnView',function(){
		var bidVieId = $(this).closest('td').attr('data-bid-id');  //当前标段id
		var width = $(parent).width() * 0.8;
		var height = $(parent).height() * 0.8;
		top.layer.open({
			type: 2,
			title: "标段详情",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: bidDetailHtml + '?id=' + bidVieId,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
			}
		});
	})
 });
 /**
*  功能描述 需要描述清楚业务逻辑实现过程
*  参数说明
*  参数1
*  参数2 
*  返回值描述  描述清楚返回值类型、区域范围
*  异常信息
*  
*/

 function getDetail() {	
     $.ajax({
         url: getUrl,
         type: "post",
         data: {id:id},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		var arr = data.data;
	         	for(var key in arr){
	         		if(key == "biddingRoomType"){ //评标室类型
	         			if(arr.biddingRoomType == '0'){
	         				arr.biddingRoomType = '自有场地'
	         			}else if(arr.biddingRoomType == '1'){
	         				arr.biddingRoomType = '外部场地'
	         			}
	         		} else if(key == "isOpen"){ 	// 是否开放
	         			if(arr.isOpen == '0'){
	         				arr.isOpen = '否'
	         			}else if(arr.isOpen == '1'){
	         				arr.isOpen = '是'
	         			}
	         		}
	            	$("#"+key).html(arr[key]);
	            	
	           	}
        	}
         	
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
 /**
*  标段表格
*  data为对象数组
*  
*/
function getBid(date){
	$.ajax({
		type:"post",
		url:searchUrl,
		async:true,
		data:{
			'biddingRoomId': id, //评标室ID
			'appointmentStartDate': date, //	预约开始时间
		},
		success: function(data){
			var arr = data.data;
			if(data.success){
				if(arr.bidSectionlist){
					bidHtml(arr.bidSectionlist);
					if(arr.morningOccupy == '0'){
						$('#morning').html('空闲');
					}else if(arr.morningOccupy == '1'){
						$('#morning').html('占用');
					}
					if(arr.afternoonOccupy == '0'){
						$('#afteroon').html('空闲');
					}else if(arr.morningOccupy == '1'){
						$('#afteroon').html('占用');
					}
				}
				
			}
		},
		error: function(data){
			parent.layer.alert("网络错误！")
		}
	});
}
 /**
*  标段表格
*  data为对象数组
*  
*/
function bidHtml(data){
	$('#bidList tbody').html('');
	var html='';
	for(var i = 0;i<data.length;i++){
		if(data[i].tenderMode == '1'){
			data[i].tenderMode = "公开招标";
		}else if(data[i].tenderMode == '2'){
			data[i].tenderMode = "邀请招标";
		}
		html = $('<tr>'
		+'<td>'+(i+1)+'</td>'
		+'<td>'+data[i].interiorBidSectionCode+'</td>'
		+'<td>'+data[i].bidSectionName+'</td>'
		+'<td>'+data[i].tenderMode+'</td>'
		+'<td>'+data[i].contractReckonPrice+'</td>'
		+'<td data-bid-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
		+'</td></tr>');
		$("#bidList tbody").append(html);
	}
	
}


