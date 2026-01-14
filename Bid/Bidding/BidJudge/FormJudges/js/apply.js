var projectUrl = config.tenderHost + '/TenderProjectController/judgingPanel.do';//评标项目详情
var bidSectionId = $.getUrlParam('id');
var examType = $.getUrlParam('examType');
var applyObj = {};
var applyUrl = config.JudgesHost + '/ProjectController/push.do';//申请地址
$(function(){
	$.ajax({
		type:"post",
		url:projectUrl,
		async:true,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				if(data.data){
					applyObj = data.data;
					for(var key in data.data){
						$('#'+key).html(data.data[key])
					}
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
})
function passMessage(data,callback){
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	$('#btnApply').click(function(){
		$.ajax({
			type:"post",
			url:applyUrl,
			async:true,
			data: applyObj,
			success: function(data){
				if(data.success){
					
					if(callback){
						callback()
					}
					top.layer.alert('申请成功！')
					var index=parent.layer.getFrameIndex(window.name);
       				parent.layer.close(index);
				}else{
					top.layer.alert(data.message)
				}
			}
		});
	})
}
