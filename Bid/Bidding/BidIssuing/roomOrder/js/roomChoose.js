/**
*  zhouyan 
*  2019-2-19
*  选择开标室
*  方法列表及功能描述
*/
var roomUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomListByDate.do';	//  开标室地址
var roomId = '';// 被选中的标室Id
var startDate='';	//携带过来的默认开始时间
var checkedIndex = '-1';
$(function(){
	if($.getUrlParam("roomId") && $.getUrlParam("roomId") != "undefined"){
		roomId =$.getUrlParam("roomId");
	}
	if($.getUrlParam("startDate")){
		startDate =$.getUrlParam("startDate");
		$('#roomChooseDate').val(startDate);
	}
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	
	/*
	 * 查询
	 * */
	$('#btnSearch').click(function(){
		$('#tableList thead').html('');
		$('#tableList tbody').html('');
		lookup($('#roomChooseDate').val());
	})
	
	//开始时间
	$('#roomChooseDate').click(function(){
		WdatePicker({
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate:nowDate,
		})
 	});
	lookup(startDate);
	/*
	 * 查询
	 * */
	/*$('#btnSearch').click(function(){
		$('#tableList thead').html('');
		$('#tableList tbody').html('');
		lookup();
	})*/
	//选择标室
	$('#tableList').on('click','[data-id]',function(){
		$(this).find('span').toggleClass('glyphicon glyphicon-ok-sign');
		$(this).closest('tr').siblings().find('[data-id]').find('span').removeClass('glyphicon glyphicon-ok-sign');
	});
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
})
function passMessage(callback){
	//确认
	$('#btnSubmit').click(function(){
		var span = $('.glyphicon-ok-sign');
		if(span.length > 0){
			roomId = span.closest('td').attr('data-id');
			callback(roomId);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}else{
			parent.layer.alert('请选择标室！')
		}
	})
}
function lookup(startTime){
	var name = $("#biddingRoomName").val();		// 标室名称
	var time = startTime;		// 时间
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
	th = $('<tr><th style="width:50px;text-align:center">序号</th>'
	+'<th>评标室</th>'
	+'<th style="width:60px;text-align:center">时段</th>'
	+'<th style="text-align:center">周一（'+dateArr[0]+'）</th>'
	+'<th style="text-align:center">周二（'+dateArr[1]+'）</th>'
	+'<th style="text-align:center">周三（'+dateArr[2]+'）</th>'
	+'<th style="text-align:center">周四（'+dateArr[3]+'）</th>'
	+'<th style="text-align:center">周五（'+dateArr[4]+'）</th>'
	+'<th style="text-align:center">周六（'+dateArr[5]+'）</th>'
	+'<th style="text-align:center">周日（'+dateArr[6]+'）</th></tr>');
		
	for(var m = 0;m<room.length;m++){
		if(roomId == room[m].id){
			checkedIndex = m;
		}
		td = $('<tr><td style="width:50px;text-align:center">'+(m*2+1)+'</td>'
		+'<td rowspan="2" data-room-choose="" data-id="'+room[m].id+'" style="cursor:pointer;">'+room[m].biddingRoomName+'（选择）<span class="" style="color:green"></span></td>'
		+'<td style="width:60px;text-align:center">上午</td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][0]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][2]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][2]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][3]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][4]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][5]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[0][6]+'"></td></tr>'
		+'<tr><td style="width:50px;text-align:center">'+(m*2+2)+'</td>'
		+'<td style="width:60px;text-align:center">下午</td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][0]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][1]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][2]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][3]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][4]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][5]+'"></td>'
		+'<td style="text-align:center" data-color="'+room[m].time[1][6]+'"></td></tr>');
		$('#tableList tbody').append(td)
	}
	$('#tableList thead').append(th);
	/*
	 * 根据可用状态不同设置td的背景颜色
	 * 0可用 1已预约 2已锁定
	 * */
	var clock = $('<span class="glyphicon glyphicon-lock"></span>');
	$('td').filter('[data-color="0"]').css("color", "#055d05").html('可用');
	$('td').filter('[data-color="1"]').css("color", "red").html('已占用');
	$('td').filter('[data-color="2"]').append(clock).css({'color':'orangered','text-align':'center'});
//	console.log(checkedIndex)
	$("[data-id='"+roomId+"']").find('span').addClass('glyphicon glyphicon-ok-sign');
}
