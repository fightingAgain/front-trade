/**

*  选择开标室
*  方法列表及功能描述
*/
var roomUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomListByDate.do';	//  开标室地址
var roomId = '';	// 被选中的标室Id
var clockUrl = config.tenderHost + '/BiddingRoomTimeLockController/insertBiddingRoomClose.do';	// 锁定地址
var unlockUrl = config.tenderHost + '/BiddingRoomTimeLockController/deleteBiddingRoomClose.do';	// 解锁地址
var checkedIndex = '-1';
var startTime = [];
$(function(){
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	
	//开始时间
	$('#roomChooseDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate:nowDate
		})
 	});
	lookup();
	/*
	 * 查询
	 * */
	$('#btnSearch').click(function(){
		$('#tableList thead').html('');
		$('#tableList tbody').html('');
		lookup();
	})
	/*标室锁定与解锁
	 * 点击table的单元格，获取绑定在tr上的标室Id：biddingRoomId-->data-id
	 * 获取绑定在单元格上的时间段timeSlot-->data-time  0：上午；1：下午
	 * 
	 */
	$('#tableList tbody').on('click','[data-color]',function(){
		var clock = $(this).attr('data-color');//获取当前标室状态 0可用 1已预约 2已锁定
		var _this = $(this);
		var tips = ''; // 确认操作的询问语句
		var requestUrl = '';//请求地址
		var biddingRoomId = $(this).closest('tr').attr('data-id');
		var index = $(this).attr('data-index'); //当前点击的单元格在一周中的下标
		var beginTime ='';
		var endTime = '';
		var timeSlot = $(this).closest('tr').attr('data-time');//0：上午；1：下午
		if(timeSlot == '0'){
			//上午
			beginTime = startTime[index].split(' ')[0]+' 00:00:00';//上午的开始时间
			endTime = startTime[index].split(' ')[0]+' 12:00:00';//上午的结束时间
		}else if(timeSlot == '1'){
			//下午
			beginTime = startTime[index].split(' ')[0]+' 12:00:00';//下午的开始时间
			endTime = startTime[index].split(' ')[0]+' 23:59:59';//下午的结束时间
		}
		if(clock == '0'){
			requestUrl = clockUrl;
			tips = '是否确认锁定？';
		}else if(clock == '1'){
			return
		}else if(clock == '2'){
			requestUrl = unlockUrl;
			tips = '是否确认解锁？';
		}
		layer.alert(tips,{icon: 3, title:'询问'},function(index){
			
			$.ajax({
				type:"post",
				url:requestUrl,
				async:true,
				data: {
					'biddingRoomId':biddingRoomId,
					'startTime':beginTime,
					'endTime':endTime,
				},
				success: function(data){
					if(data.success){
						if(clock == '0'){	//锁定
							_this.css({'background':'#ffffff','color':'orangered','text-align':'center'});
							_this.html($('<span class="glyphicon glyphicon-lock"></span>'));
							_this.attr('data-color','2');
						}else if(clock == '2'){ //解锁
							_this.html("锁定").css({'text-align':'center','cursor':'pointer','color':'#333'});
							_this.attr('data-color','0');
							
						}
					}
				},
				error: function(data){
					layer.alert('网络错误！')
				}
			});
			layer.close(index);
		})
		
		
	})
})
function lockFun(url,state,message){
	
}

function lookup(){
	var name = $("#biddingRoomName").val();		// 标室名称
	var time = $("#roomChooseDate").val();		// 时间
	$.ajax({
		type:"post",
		url:roomUrl,
		async:true,
		data: {
			'startDate': time,
			'biddingRoomName': name,
		},
		success: function(data){
			if(data.success){
				roomHtml(data.data)
			}
			
		},
		error: function (data) {
             parent.layer.alert("加载失败");
        }
	});
}
function roomHtml(data){
	var dateArr = [];
	var room = data.room;
	var th = '';
	var td = '';
	//将时间2019-02-18 11:11:42切割，只要02.18
	for(var i = 0;i<data.dates.length;i++){
		var date = data.dates[i].split(' ')[0].substring(5).replace(/\-/g,".");
		dateArr.push(date);
		
	}
	startTime = data.dates;
	th = $('<tr><th style="width:50px;text-align:center">序号</th>'
	+'<th style="text-align:center">评标室</th>'
	+'<th style="text-align:center">时段</th>'
	+'<th style="text-align:center">周一（'+dateArr[0]+'）</th>'
	+'<th style="text-align:center">周二（'+dateArr[1]+'）</th>'
	+'<th style="text-align:center">周三（'+dateArr[2]+'）</th>'
	+'<th style="text-align:center">周四（'+dateArr[3]+'）</th>'
	+'<th style="text-align:center">周五（'+dateArr[4]+'）</th>'
	+'<th style="text-align:center">周六（'+dateArr[5]+'）</th>'
	+'<th style="text-align:center">周日（'+dateArr[6]+'）</th></tr>');
		
	for(var m = 0;m<room.length;m++){
		td = $('<tr data-time="0" data-id="'+room[m].id+'"><td style="width:50px;text-align:center">'+(m*2+1)+'</td>'
		+'<td rowspan="2" style="text-align:center" data-room-choose="" >'+room[m].biddingRoomName+'<span class="" style="color:green;"></span></td>'
		+'<td style="text-align:center">上午</td>'
		+'<td data-index="0" data-color="'+room[m].time[0][0]+'"></td>'
		+'<td data-index="1" data-color="'+room[m].time[0][1]+'"></td>'
		+'<td data-index="2" data-color="'+room[m].time[0][2]+'"></td>'
		+'<td data-index="3" data-color="'+room[m].time[0][3]+'"></td>'
		+'<td data-index="4" data-color="'+room[m].time[0][4]+'"></td>'
		+'<td data-index="5" data-color="'+room[m].time[0][5]+'"></td>'
		+'<td data-index="6" data-color="'+room[m].time[0][6]+'"></td></tr>'
		+'<tr data-time="1" data-id="'+room[m].id+'"><td style="text-align:center">'+(m*2+2)+'</td>'
		+'<td style="text-align:center">下午</td>'
		+'<td data-index="0" data-color="'+room[m].time[1][0]+'"></td>'
		+'<td data-index="1" data-color="'+room[m].time[1][1]+'"></td>'
		+'<td data-index="2" data-color="'+room[m].time[1][2]+'"></td>'
		+'<td data-index="3" data-color="'+room[m].time[1][3]+'"></td>'
		+'<td data-index="4" data-color="'+room[m].time[1][4]+'"></td>'
		+'<td data-index="5" data-color="'+room[m].time[1][5]+'"></td>'
		+'<td data-index="6" data-color="'+room[m].time[1][6]+'"></td></tr>');
		$('#tableList tbody').append(td)
	}
	$('#tableList thead').append(th);
	/*
	 * 根据可用状态不同设置td的背景颜色
	 * 0可用 1已预约 2已锁定
	 * */
	var clock = $('<span class="glyphicon glyphicon-lock"></span>');
	$('td').filter('[data-color="0"]').html("锁定").css({'text-align':'center','cursor':'pointer'});
	$('td').filter('[data-color="1"]').css({'text-align':'center','color':'red'}).html("已占用");
	$('td').filter('[data-color="2"]').append(clock).css({'color':'orangered','text-align':'center','cursor':'pointer'});
}
