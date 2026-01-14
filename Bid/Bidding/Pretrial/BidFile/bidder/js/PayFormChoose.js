
var searchUrlFile=config.tenderHost+'/BidFileController/findFileListByOrder.do';//文件查询接口
var getUrl = config.tenderHost+'/BiddingRoomAppointmentController/getBidSection.do';//获取
var fileUrl = config.tenderHost + "/FileController/upload.do";		//文件上传地址


var id;

$(function(){
	
	
	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
	}
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
});

//确定按钮
$("#btnSubmit").click(function() {
	var payForm = $("input[name='payForm']:checked").val();
	if(!payForm){
		layer.alert("请选择支付方式",{icon:7,title:'提示'});
		return;
	}else{
		//已选择支付方式   弹出付款二维码页面
		
	}
	
});
	


