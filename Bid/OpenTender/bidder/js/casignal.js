var bidId = $.getUrlParam("bidSectionId");	//标段id
var opid = $.getUrlParam("bidOpeningId");	//开标id
var keytext =  $.getUrlParam("keytext");	//ca信封码
var fileUrl =  $.getUrlParam("fileUrl");	//投标文件路径
var token =  $.getUrlParam("Token");	//token 
var mask ;
var isLock = false;//未锁定，能解密
/****************************************************进行CA解密*****************************************************/
//选择解密方式
$("#select").on('click',function(){
	//判断是否选中
	if($('#select').is(':checked')) {
   		$("#envelope").show();
   		$("#decryptType").html("信封解密");
	}else{
		$("#envelope").hide();
		$("#decryptType").html("CA解密");
	}
});

//关闭
$('#btnClose').click(function(){
	var index=parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
});
$('#btnSubmit').click(function(){
	$(this).attr('disabled', true);
	saveDecrypt()
})

var letterDecrypt='';//信封码
//确定
function saveDecrypt(){
	//判断是否选中
	if($('#select').is(':checked')) {
		letterDecrypt = $('#keyText').val();
		//判断是否输入
		if(letterDecrypt == ''){
			parent.layer.alert('请输入信封码！');
			$('#btnSubmit').removeAttr('disabled');
			return false;
		}else{
			var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"keyText":letterDecrypt,"fileUrl":fileUrl}; //数据
			var urlDecrypt = config.OpenBidHost + '/BidOpeningDetailsController/addEnvelopeDecrypt.do'; //解密路径
			
			saveDecryptInfo(parameters,urlDecrypt);
		}
	}else{
		let CAcf = new CA();
		CAcf.decrypt(keytext).then(function (user){
			if(user){
				var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"keyText":user.decryptedData,"fileUrl":fileUrl,"signedData":user.caDn,"examType":2};
				var urlDecrypt = config.OpenBidHost + '/BidOpeningDetailsController/addBidderCFCADecrypt.do';

				//执行签到
				saveDecryptInfo(parameters,urlDecrypt);
			}
		})
	}

}

/***************************************文件上传************************************************/
$("#files").change(function () {
	var _this = this;
    fileUpload_onselect(_this);
})

function fileUpload_onselect(obj){
    var selectedFile = document.getElementById("files").files[0];
    var reader = new FileReader();//这是核心！！读取操作都是由它完成的
    reader.readAsText(selectedFile,'gb2312');
    reader.onload = function(oFREvent){//读取完毕从中取值
        $('#keyText').val(oFREvent.target.result);
    }
}

/***************************************保存文件************************************************/
function saveDecryptInfo(parameters,urlDecrypt){
	//保存
	if(!isLock){
		isLock = true;
		$.ajax({
			type: "post",
			url: urlDecrypt,
			data:parameters,
			async: false,
			dataType: "json",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", token);
				mask =parent.layer.load(0, {shade: [0.3, '#000000']});
			},
			success: function(rsp) {
				$('#btnSubmit').removeAttr('disabled');
				isLock = false;
				parent.layer.close(mask);
				if(rsp.success) {
					parent.layer.alert(rsp.data, { icon: 6 });
					//关闭弹出框
					var index=parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				} else {
					parent.layer.alert(rsp.message, { icon: 6 });
				}
			}
		});	
	}
}
