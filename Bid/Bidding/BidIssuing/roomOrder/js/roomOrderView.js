/**
*  zhouyan 
*  2019-2-18
*  标室管理中的标室查询列表的列表的详情
*  方法列表及功能描述
*   1、getDetail()   信息反显
*/

var getUrl = config.tenderHost + '/BiddingRoomAppointmentController/get.do'; // 查看预约详情的接口
var bidDetailHtml =  "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面
var id = "";
 $(function(){
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
		getDetail(id);
	}
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	//查看标段详情
	$('#bidList').on('click','.btnView',function(){
		var bidVieId = $(this).closest('td').attr('data-bid-id');  //当前标段id
		var width = $(parent).width() * 0.7;
		var height = $(parent).height() * 0.7;
		console.log(bidVieId)
		top.layer.open({
			type: 2,
			title: "标段详情",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: bidDetailHtml + '?id=' + bidVieId,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				/*iframeWin.passMessage({callback:bidCallback});  //调用子窗口方法，传参*/
				
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

 function getDetail(id) {	
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
	         		if(key == "appointmentType"){	//用途 1为资格预审，2为开评标
	         			var type = arr.appointmentType.split(',');
	         			var appoinCheckbox = $('[name=appointmentType]');
	         			if($.inArray('9',type) != -1){
	         				$('.appoinOther').css('display','none');
	         			}
	         			if(type.length>0){
	         				for(var i = 0;i<appoinCheckbox.length;i++){
		         				for(var j = 0;j<type.length;j++){
		         					if($(appoinCheckbox[i]).val() == type[j]){
		         						$('[name=appointmentType]').eq(i).prop('checked',true)
		         					}
	         						$('[name=appointmentType]').eq(i).prop('disabled',true)
		         					
		         				}
		         			}
	         			}
	         		}else if(key == "biddingRooms" && arr.biddingRooms.length > 0 ){ //标室信息
		         		roomHtml(arr.biddingRooms);
	         		}else if(key == "bidSections" && arr.bidSections.length>0){ //标段信息
	         			bidHtml(arr.bidSections)
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
function roomHtml(data){
	$('#roomList tbody').html('');
	var html='';
	
	for(var i = 0;i<data.length;i++){
		if(data[i].biddingRoomType == '0'){
			data[i].biddingRoomType = "自有场地";
		}else if(data[i].biddingRoomType == '1'){
			data[i].biddingRoomType = "外部场地";
		};
		html += '<tr>'
		+'<td style="width: 50px;text-align:center">'+(i+1)+'</td>'
		+'<td>'+data[i].biddingRoomName+'</td>'
		+'<td style="width: 150px;text-align:center">'+data[i].biddingRoomType+'</td>'
		+'<td>'+data[i].address+'</td></tr>';
	}
	$(html).appendTo("#roomList tbody")
//	$("#roomList tbody").append(html);
	
}
function bidHtml(data){
	$('#bidList tbody').html('');
	var html='';
	for(var i = 0;i<data.length;i++){
		if(data[i].tenderMode == '1'){
			data[i].tenderMode = "公开招标";
		}else if(data[i].tenderMode == '2'){
			data[i].tenderMode = "邀请招标";
		}
		if(data[i].priceUnit){
			if(data[i].priceUnit == 0){
				data[i].priceUnit =  '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">元<span>'
			}else if(data[i].priceUnit == 1){
				data[i].priceUnit = '<span style="text-align:left;display:inline-block;width:30px;margin-left:5px;">万元<span>'
			}
		}else{
			data[i].priceUnit = ""
		}
		html = $('<tr>'
		+'<td style="width: 50px;text-align:center">'+(i+1)+'</td>'
		+'<td style="width: 200px;text-align:left">'+data[i].interiorBidSectionCode+'</td>'
		+'<td>'+data[i].bidSectionName+'</td>'
		+'<td style="width: 100px;text-align:center">'+data[i].tenderMode+'</td>'
		+'<td style="width: 200px;text-align:center">'+data[i].contractReckonPrice+data[i].priceUnit+'</td>'
		+'<td data-bid-id="'+data[i].bidSectionId+'" style="width: 200px;text-align:center;"><button class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
		+'</td></tr>');
		$("#bidList tbody").append(html);
	}
	
}
