

var roomChooseHtml = 'Bidding/BidIssuing/roomOrder/model/roomChoose.html';
var roomListHtml = "Bidding/BidIssuing/roomOrder/model/roomList.html";  //选择开标室列表

var bidGetUrl = config.tenderHost + '/BiddingRoomQueryController/selectBiddingRoomById.do'; // 根据主键查询预约评标室详情
var saveUrl = config.tenderHost + '/BiddingRoomAppointmentController/save.do'; // 点击添加保存的接口
var bidIds = [];//标段id集合
var rooms = [];//会议室信息
$(function(){
	var bidId = $.getUrlParam('bidId');//标段id
	var date = new Date();
	/*公共文件public中获取当前登录人信息的方法*/
	var entryArr = entryInfo();
	$("#linkMen").val(entryArr.userName);
	$("#linkTel").val(entryArr.tel);
	bidIds.push(bidId);
	
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
    $('#appointmentStartDate').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d H:i',
		minDate: nowDate,
	});
	
	//结束时间
    $('#appointmentEndDate').datetimepicker({
		step:1,
		lang:'ch',
		format:'Y-m-d H:i',
		onShow:function(){
			if($("#appointmentStartDate").val()!=""){
				if(parent.NewDate($("#appointmentStartDate").val())<parent.NewDate(nowDate)){
					$('#appointmentEndDate').datetimepicker({				
						minDate: nowDate,
					});
				}else{
					$('#appointmentEndDate').datetimepicker({				
						minDate: $("#appointmentStartDate").val(),
					});
				}
				
			}else{
				$('#appointmentEndDate').datetimepicker({				
					minDate: nowDate,
				});
			}
		},
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//选择标室
	$('#chooseRoom').click(function(){
		var startDate=$('#appointmentStartDate').val();//预约开始时间
		var endDate=$('#appointmentEndDate').val();//预约开始时间
		var timeData = {};
		timeData.startDate = startDate;
		timeData.endDate = endDate;
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
function roomSure(callback){
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
			if($.trim($('#linkMen').val()) != '' && $.trim($('#linkMen').val()).length > 10){
				parent.layer.alert('请正确输入联系人！');
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
	data.roomId = $("#biddingRoomId").val();
	top.layer.open({
		type: 2,
		title: "选择开标室",
		area: ['1000px', '650px'],
		resize: false,
		content: roomListHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data,roomCallback);  //调用子窗口方法，传参
		}
	});
}
function roomCallback(roomId){
	$("#biddingRoomId").val(roomId);
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
	});
	
}
function roomTable(data){
	$('#roomList tbody').html('');
	var html='';
	if(data.biddingRoomType == '0'){
		data.biddingRoomType = "自有场地";
	}else if(data.biddingRoomType == '1'){
		data.biddingRoomType = "外部场地";
	};
	html = '<tr>'
	+'<td  style="width:50px;text-align:center">1</td>'
	+'<td>'+data.biddingRoomName+'</td>'
	+'<td style="width: 150px;text-align:center">'+data.biddingRoomType+'</td>'
	+'<td>'+data.address+'</td></tr>';
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
