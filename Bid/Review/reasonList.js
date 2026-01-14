var reasonListUrl = config.Reviewhost + '/ReviewControll/getCheckOperateRecordList.do'//暂停原因(记录)
var reasonUrl = config.Reviewhost + '/ReviewControll/selectNewStopRecord.do'//暂停原因（最新）
var bidSectionId = '';
var examType = '';
var special = '';//用来区分评委（PW）、操作人员（CZ） 
$(function(){
	bidSectionId = $.getUrlParam('id');//标段id
	examType =  $.getUrlParam('examType');
	special =  $.getUrlParam('special');
	var data_url = reasonListUrl;
	if(special == 'PW'){
		data_url = reasonUrl;
		$('.reason_no_expert').css('display','none')
		$('.reason_expert').css('display','block')
	}else{
		$('.reason_expert').css('display','none')
		$('.reason_no_expert').css('display','block')
	}
	$.ajax({
		type:"post",
		url:data_url,
		async:true,
		data: {
			'bidSectionId': bidSectionId,
			'examType':examType,
		},
		success: function(data){
			if(data.success){
				if(special == 'PW'){
					$('.new_reason_box').html(data.data.reason)
				}else{
					var html = '';
					var reasonList = data.data;
					if(special == 'CZ'){
						if(reasonList.length == 0){
							$('.pause_explain').html('无暂停记录')
						}
					}
					for(var i = 0;i < reasonList.length; i++){
						html += '<div class="pause_reason_list">';
							html += '<div class="list_box">';
								html += '<div class="pause_title">暂停时间：</div>';
								html += '<div class="pause_cont">'+reasonList[i].stopDate+'</div>';
								html += '<div class="clear"></div>';
							html += '</div>';
							html += '<div class="list_box">';
								html += '<div class="pause_title">暂停原因：</div>';
								html += '<div class="pause_cont">'+reasonList[i].reason+'</div>';
								html += '<div class="clear"></div>';
							html += '</div>';
							html += '<div class="list_box">';
								html += '<div class="pause_title">恢复时间：</div>';
								html += '<div class="pause_cont">'+(reasonList[i].recoveryDate?reasonList[i].recoveryDate:"暂无")+'</div>';
								html += '<div class="clear"></div>';
							html += '</div>';
						html += '</div>';
					}
					$(html).appendTo('.reason_no_expert')
				}
			}else{
                top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
})
