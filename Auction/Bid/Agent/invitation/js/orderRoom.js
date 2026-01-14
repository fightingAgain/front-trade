var callbackappointmentData;
// 预约会议室
function orderRoom(){
	if($('#packageName').html()==""){
		parent.layer.alert("请选择包件");        		     		
		return;
    };
    if(appointmentData){
		if(appointmentData.length>0){
			parent.layer.alert("温馨提示：已预约会议室，如若变更会议室，请先取消预约");        		     		
			return;
		}   
    }
	var data={
		'appointmentTitle':packageInfo.packageName,
		'linkMen':top.userName||"企业管理员",
		'linkTel':top.userTel,
		'examType':2,
		'biddingRoomPackages':[
			{
				'id':packageInfo.id,
				'projectName':packageInfo.packageName,
				'projectCode':packageInfo.packageNum,
				'tenderType':'0',
			}
		]
	}
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '会议室列表'
        ,area: ['1100px', '600px']
        ,content:siteInfo.roomOrderUrl+'Meeting/roomOrder/model/roomList.html'
        //确定按钮
        ,success:function(layero,index){    
			var iframeWin=layero.find('iframe')[0].contentWindow; 
			 iframeWin.passMessage(data,callbackappointment)
        }        
	});
}
// 回调函数，获取返回值
function callbackappointment(data){
	data.projectId=packageInfo.projectId;
	data.packageId=packageInfo.id;
	data.examType=1;
	data.supplierEnterpriseName=packageInfo.purchaserName;
	data.supplierEnterpriseId=packageInfo.purchaserId;	
	$.ajax({
		type: "post",
		url: config.bidhost+'/BiddingRoomAppointmentController/saveBiddingRoomAppointment.do',
		data: data,
		dataType: "json",
		async:false,
		success: function (response) {
			if(response.success){
				
			}
		}
	});
	callbackData(data)	
}
//数据显示
function callbackData(data){
	callbackappointmentData=data;
	var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();//当前时间
	if(packageInfo.packageState==1||packageInfo.packageState==2){
		if(data){
			// 当评审开始时间大于当前时间时，显示预约按钮
            if(packageInfo.checkEndDate&&(NewDate(packageInfo.checkEndDate)> NewDate(nowDate))){
				$('.colseOrder').show();
				$('.showOrder').hide();
            }else if(!packageInfo.checkEndDate){
				$('.colseOrder').show();
				$('.showOrder').hide();
			};
		}else{
			// 当评审开始时间大于当前时间时，显示预约按钮
            if(packageInfo.checkEndDate&&(NewDate(packageInfo.checkEndDate)> NewDate(nowDate))){
				$('.showOrder').show();
				$('.colseOrder').hide();
            }else if(!packageInfo.checkEndDate){
				$('.showOrder').show();
				$('.colseOrder').hide();
			};	
		}	
	}
	var biddingRooms=[];
	if(data){
		$('.colseOrder').show();
		$('.showOrder').hide();
		var title={'1':'开标',"2":"评审",'9':'其他'}
		$("#appointmentTitle").html(data.appointmentTitle);
		var roomType = [];
		var typeArr = [];
		roomType = data.appointmentType.split(',');
		
		for(var j = 0;j<roomType.length;j++){
			if(roomType[j] == 1){
				typeArr.push('开标');
			}else if(roomType[j] == 2){
				typeArr.push('评审');
			}else if(roomType[j] == 9){
				typeArr.push('其他');
			}
		}
			 
		$("#appointmentType").html(typeArr.join('、'));
		$("#appointmentStartDate").html(data.appointmentStartDate);
		$("#appointmentEndDate").html(data.appointmentEndDate);
		if(data.biddingRooms){
			biddingRooms=data.biddingRooms
		}
	}else{
		$('.showOrder').show();
		$('.colseOrder').hide();
		$("#appointmentTitle").html("");
		$("#appointmentType").html("");
		$("#appointmentStartDate").html("");
		$("#appointmentEndDate").html("");
	}
	$('#biddingRooms').bootstrapTable({
		classes: 'table table-bordered', // Class样式
		columns: [
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){				
                return index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'biddingRoomName',
			title: '会议室名称',
			align: 'left',
		},{
			field: '',
			title: '操作 ',
			align: 'center',
			width: '150',
			formatter:function(value, row, index){
            	var str='<button type="button" class="btn btn-sm btn-primary btnDetail" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>详情</button>';
            	return str;
            }
		}]
	});
  $("#biddingRooms").bootstrapTable("load", biddingRooms);
  $("#colseOrder").off('click').on('click',function(){
		parent.layer.confirm('温馨提示：您确定要取消预约吗？', {
			btn: ['是', '否'] //可以无限个按钮
	 	}, function(index, layero){
		   	$.ajax({   	
				 url:config.MeetingHost+'/BiddingRoomAppointmentController/updateState.do',//修改包件的接口
				 type:'post',
				 //dataType:'json',
				 async:false,
				 //contentType:'application/json;charset=UTF-8',
				 data:{
					 'id':data.id,
					 'appointmentState':5
				 },
				 success:function(response){			   		
					 if(response.success==true){
						
						 deletOrderData(data.id)
						 parent.layer.close(index);
					 }else{
						 parent.layer.alert(response.message)
					 }
				 }   	
		 	});
		  
						 
	  	}, function(index){
		 	parent.layer.close(index)
	  	});
  })
  
}
//详情
$('#biddingRooms').on('click','.btnDetail',function(){
	var start = callbackappointmentData.appointmentStartDate;
	var end = callbackappointmentData.appointmentEndDate;
	var index = $(this).attr('data-index');
	var rowData= $('#biddingRooms').bootstrapTable('getData')[index];
	toDetail(rowData,start,end)
});
//取消预约
function deletOrderData(uid){
	$.ajax({   	
		url:config.bidhost+'/BiddingRoomAppointmentController/deleteBiddingRoomAppointment.do',//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			'id':uid,			
		},
		success:function(response){			   		
			if(response.success==true){
				parent.layer.alert("取消预约成功");
				callbackData(null)				
			}else{
				parent.layer.alert(response.message)
			}
		}   	
	});
}
var detailHtml = siteInfo.roomOrderUrl+'Meeting/roomOrder/model/orderDetail.html';//预约详情
//会议室详情
function toDetail(data,start,end){
	top.layer.open({
		type: 2,
		title: '标室使用情况',
		area: ['800px', '650px'],
		resize: false,
		content: detailHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getRoomInfo(data,start,end);
		}
	})
}