/**
*  zhouyan 
*  2019-6-16
*  查看标室列表
*  方法列表及功能描述
*/

var tableUrl = config.tenderHost + '/BiddingRoomAppointmentController/findAppointmentByRoomId.do'; //标室使用情况
var checkboxed;


$(function(){
//	var tenderProjectId = $.getUrlParam('tenderProjectId');

});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function getRoomInfo(data,start,end){
	$('#biddingRoomName').html(data.biddingRoomName);//标室名称
	
	if(data.isUse == 0){//标室状态
		$('#isUse').html('可用');
	}else if(data.isUse == 1){//标室状态
		$('#isUse').html('占用');
	}
	
	getTendereeList(data.id,start,end)
	
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
}
function getTendereeList(id,start,end){
	$.ajax({
		type:"post",
		url:tableUrl,
		async:true,
		data: {
			'biddingRoomId': id,
			'startDate':start,
			'endDate':end
		},
		success: function(data){
			if(data.success){
				roomTable(data.data)
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
function roomTable(data){
	$('#tableList tbody').html('');
	var html = '';
	if(data.length>0){
		for(var i = 0;i<data.length;i++){
			html += '<tr>'
				+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
				+'<td>'+data[i].editStartDate+'<span style="margin:0 10px">至</span>'+data[i].editEndDate+'</td>'
				+'<td>'+data[i].userName+'</td>'
			+'</tr>'
		};
	}else{
		html = '<tr><td colspan="3" style="text-align: center;">该时间段此会议室没有占用记录！</td></tr>'
	}
	
	$(html).appendTo('#tableList tbody');
}
