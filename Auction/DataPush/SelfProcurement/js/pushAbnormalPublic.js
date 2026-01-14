var detailUrl =top.config.AuctionHost + '/projectReceptionController/findProjectExcepiton.do';//详情
var pushUrl = top.config.AuctionHost + '/projectReceptionController/sendProjectExcepiton.do';//推送接口
var tenderType = 0;//采购方式
var packageId = $.getUrlParam("bidSectionId");//包件id
var projectId = $.getUrlParam("projectId");//项目id
$(function(){
	if(tenderType == 4){
		$('.tenderType6').hide();//非招标（目前有询比、单一来源）
		$('.tenderType4').show();//招标
	}else{
		$('.tenderType4').hide();//招标
		$('.tenderType6').show();//非招标（目前有询比、单一来源）
	}
	getDetail();
	
	//关闭当前窗口
	$("#btn_close").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
});
function passMessage(callback){
	//推送
	$("#btn_submit").on('click',function(){
		var arr={};
		arr = top.serializeArrayToJson($("#DataPush").serializeArray());//获取表单数据，并转换成对象；
		arr.id = pushId;
		arr.packageId = packageId;
	
		$.ajax({
			type: "post",
			url: pushUrl,
			data: arr,
			dataType: "json",
			async:false,
			success: function (response) {
				if(callback){
					callback()
				}
				if (response.success) {
					parent.layer.alert('推送成功！');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				} else {
					parent.layer.alert(response.message)
				}
			}
		});
	})
}
//详情
function getDetail(){
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'packageId': packageId,
			'projectId': projectId
		},
		success: function (data) {
			if (data.success) {
				var res = data.data;
				pushId = res.id;
				for (var key in res) {
					$('#' + key).html(res[key])
					$('[name='+key+']').val(res[key])
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}


