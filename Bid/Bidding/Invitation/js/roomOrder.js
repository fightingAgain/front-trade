

var roomChooseHtml = 'Bidding/BidIssuing/roomOrder/model/roomChoose.html';
var roomListHtml = "Bidding/BidIssuing/roomOrder/model/roomList.html";  //选择开标室列表

var bidGetUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情
var saveUrl = config.tenderHost + '/BiddingRoomAppointmentController/save.do'; // 点击添加保存的接口
var bidIds = [];//标段id集合
var rooms = [];//会议室信息
var bidName = '';//标段名称
var isPre = 0;//是否资格预审0否 1是
$(function(){
	var bidId = $.getUrlParam('bidId');//标段id
	if($.getUrlParam('bidId') && $.getUrlParam('bidId') != undefined){
		isPre = $.getUrlParam('isPre');//是否资格预审0否 1是
	}
	if(isPre == 1){
		$('.type-pre').css('display','inline-block');
		$('.type-last').css('display','none');
		$('[name=appointmentType][value=6]').prop('checked',true);
	}else{
		$('[name=appointmentType][value=1]').prop('checked',true);
		
	}
	var date = new Date();
	/*公共文件public中获取当前登录人信息的方法*/
	var entryArr = entryInfo();
	$("#linkMen").val(entryArr.userName);
	$("#linkTel").val(entryArr.tel);
	bidIds.push(bidId);
	

	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
 	$('#appointmentStartDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			onpicked:function(){
				$dp.$('appointmentEndDate').click();
			},
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'appointmentEndDate\')}'
		})
 	});
 	//结束时间
 	$('#appointmentEndDate').click(function(){
 		if($('#appointmentStartDate').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:nowDate
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'appointmentStartDate\')}'
			})
 		}
 		
 	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//会议类型选择
	$('[name=appointmentType]').change(function(){
		var appointmentType = [];
		$.each($('[name=appointmentType]:checked'),function(){
			var meetingName = '';
			if($(this).val() == 1){
				meetingName = '开标会'
			}else if($(this).val() == 2){
				meetingName = '评标会'
			}else if($(this).val() == 6){
				meetingName = '资格预审会'
			}
	   		appointmentType.push(meetingName)
	    });
	    if(appointmentType.length > 0){
	    	var roomName = appointmentType.join('，');
	    	$('#appointmentTitle').val(bidName + ' - ' + roomName);
	    }else{
	    	$('#appointmentTitle').val('');
	    }
	    
	})
	//选择标室
	$('#chooseRoom').click(function(){
		var startDate=$('#appointmentStartDate').val();//预约开始时间
		var endDate=$('#appointmentEndDate').val();//预约开始时间
		var timeData = {};
		timeData.startDate = startDate;
		timeData.endDate = endDate;
		var appointmentType = [];
	   	$.each($('[name=appointmentType]:checked'),function(){
	   		appointmentType.push($(this).val())
	    });
	 	timeData.useType = appointmentType.join(',');
		if(startDate == ''){
			parent.layer.alert('请选择会议开始时间！',{icon:7,title:'提示'},function(index){
				parent.layer.close(index);
				$('#collapseOne').collapse('show');
				$('[name="appointmentStartDate"]').focus();
			})
		}else if(endDate == ''){
			parent.layer.alert('请选择会议结束时间！',{icon:7,title:'提示'},function(index){
				parent.layer.close(index);
				$('#collapseOne').collapse('show');
				$('[name="appointmentEndDate"]').focus();
			})
		}else{
			openRoom(timeData)
		}
	});
})
function roomSure(name,callback){
	var defaultType = $('[name=appointmentType]:checked').val();
	bidName = name;
	if(defaultType == 1){
		$('#appointmentTitle').val(name + ' - 开标会');
	}else if(defaultType == 6){
		$('#appointmentTitle').val(name + ' - 资格预审会');
	}
	
	//提交
	
	$("#btnSubmit").click(function(){
		if(checkForm($("#formName"))){
			var  appointmentStartDate = Date.parse(new Date($('#appointmentStartDate').val().replace(/\-/g,"/"))); 		//会议开始时间
			var  appointmentEndDate = Date.parse(new Date($('#appointmentEndDate').val().replace(/\-/g,"/")));		//会议结束时间
			if(appointmentEndDate <= appointmentStartDate){
				parent.layer.alert('会议结束时间应在会议开始时间之后！',function(ind){
					parent.layer.close(ind);
					$('#collapseOne').collapse('show');
				});
				return
			}
			saveForm(callback);
		}
	});
}
/*function chooseRoom(){
	parent.layer.open({
		type: 2,
		area: ['70%', '80%'],
		title: "选择会议室",
		content: roomChooseHtml + '?roomId=' + $("#biddingRoomId").val()+'&startDate='+$('#appointmentStartDate').val(),
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var body = parent.layer.getChildFrame('body',index);
			iframeWin.passMessage(roomCallback);  //调用子窗口方法，传参
//					iframeWin.bidDetail(bidDetail);
		}
	})
}*/
/*
 * 打开开标室列表
 * */
function openRoom(data){
//	console.log(rooms)
	data.roomId = $("#biddingRoomId").val();
	top.layer.open({
		type: 2,
		title: "选择会议室",
		area: ['90%', '650px'],
		resize: false,
		content: roomListHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data,rooms,roomCallback);  //调用子窗口方法，传参
		}
	});
}
function roomCallback(data,start,end){
	$('#appointmentStartDate').val(start);
	$('#appointmentEndDate').val(end);
	rooms = data;
	roomTable(data)
	/*$("#biddingRoomId").val(roomId);
	$.ajax({
		type:"post",
		url:bidGetUrl,
		async:true,
		data: {
			'id':roomId
		},
		success: function(data){
			if(data.success){
				rooms = data.data;
				roomTable(data.data);
			}
		},
		error: function(data){
			parent.layer.alert("网络错误！")
		}
	});*/
	
}
function roomTable(data){
	$('#roomList tbody').html('');
	var html='';
	
	for(var i = 0;i<data.length;i++){
		if(data[i].biddingRoomType == '0'){
			data[i].biddingRoomType = "自有场地";
		}else if(data[i].biddingRoomType == '1'){
			data[i].biddingRoomType = "外部场地";
		};
		html += '<tr>'
		+'<td  style="width:50px;text-align:center">'+(i+1)+'</td>'
		+'<td><input type="hidden" name="biddingRoomIds['+i+']" value="'+data[i].id+'" />'+data[i].biddingRoomName+'</td>'
		+'<td style="width: 150px;text-align:center">'+data[i].biddingRoomType+'</td>'
		+'<td>'+data[i].address+'</td></tr>';
	}
	
	$(html).appendTo("#roomList tbody");
//	$("#roomList tbody").append(html);
	
}
function saveForm(callback) {
 	var arr = {}, tips="";
 	var appointmentType = [];
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
 	arr.packageIds = bidIds;
 	$.each($('[name=appointmentType]:checked'),function(){
   		appointmentType.push($(this).val())
    });
    if(appointmentType.length == 0){
    	parent.layer.alert('请选择会议类型!',function(ind){
			parent.layer.close(ind);
			$('#collapseOne').collapse('show');
		});
    	return
    };
    arr.appointmentType = appointmentType.join(',');
    if(rooms.length == 0){
    	parent.layer.alert('请选择会议室!',function(ind){
			parent.layer.close(ind);
			$('#collapseTwo').collapse('show');
		});
    	return
    }
 	tips="预约信息提交成功";
 	arr.isSubmit = 1;
	$.ajax({
         url: saveUrl,
         type: "post",
         data: arr,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		$("#appointmentId").val(data.data);
        		callback(bidIds[0]);
    			parent.layer.alert(tips,{icon:6,title:'提示'},function(ind){
    				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(ind); //再执行关闭  
					parent.layer.close(index); //再执行关闭  
    			});
        	}
			parent.$("#tableList").bootstrapTable('refresh');
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
	});
	
 };
