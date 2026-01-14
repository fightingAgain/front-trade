var verifyCaUrl = config.Syshost + "/CaController/verifyCa.do";

//声明证书集对象
var certs ;
//声明签名证书对象
var signCert;
 
//初始化显示和选择证书
function init(){
	try {
		if (isIe()) { //IE
			certs = document.getElementById("UCAPI");
		} else {
			certs = new CerticateCollectionX();
		}
		//根据属性设置过滤条件(1表示使用SKF接口，2表示CSP(CSP不能枚举SM2证书)，)
	    certs.setCryptoInterface(1);
		//过滤签名证书算法("sm2","rsa")
		certs.setCF_CertAlg("sm2");
		//获取签名证书
		certs.setCF_KeyUsage(0x20);
		//加载证书集返回值等于0表示成功
		var loadResult = certs.Load();
        var len = certs.getSize();
        if (loadResult != 0 || len < 1) {
            top.layer.alert("请插入Ukey");
            return false;
        }
	 }catch (e) {
        top.layer.alert("未安装Ukey驱动");
        return false;
    }
//			var cert = certs.GetAt(1);
		for(var i = 0;i < len;i++){
			var cert = certs.GetAt(i);
			var option = document.createElement("option");
			option.value = i;
			option.innerHTML = cert.getFriendlyName();
			$('#select').append(option);
		}
		return true;
}

function signName(text){
	var initState = init();
	if(!initState){
		return false;
	}
	var random; //取一个随机数
	var card;
	var time = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if(entryData){
		card = entryData.identityCardNum;
	} else {
		card = entryInfo().identityCardNum;
	}
	if(text){
		random = text;
	} else {
		random = hex_md5(card + time);
	}
	var signData = {};
	
//		 document.getElementById("randomData").value = random;
	//文本框获取密码
	 var pin = $('#password').val();	
	//下拉框选中哪一张证书
	 signCert = certs.GetAt(parseInt(document.getElementById("select").value));
	//设置pin码
	 signCert.setUserPIN(pin);
	//签名(0表示attach，1表示detach)
	 var signedData = signCert.PKCS7String(random,0);
	 var caCode = signCert.getSerialNumber();
	 var caDn = signCert.getSubject();
	//var signedData = signCert.PKCS1String(randomData);
	 //alert("签名结果："+ signedData);

	 $.ajax({
		type: "post",
		url: verifyCaUrl,
		async: false,
		data:{signedData:signedData},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			//将签名值传到后台
			signData.caConfirmDate = time;
			signData.caConfirmCode = signedData;
			signData.caCode = caCode;
			signData.caDn = caDn;	
		}
	});
	 
	
	return signData;
	/*$('#caConfirmCode').val(signedData);
	$('#caCode').val(caCode);
	$('#caDn').val(caDn);*/
//		 document.getElementById("signedData").value = signedData;
}

function initCA(options){
	var defaults = {
		target: "body"
	}
	var settings = $.extend( {}, defaults, options);
	var html = "";
	if($(".caBlock").length == 0){
		html = '<div style="display: none;" class="caBlock">'
					+'<select id="select" class=" form-control" ></select>'
					+'<object id="UCAPI" classid="CLSID:18201fef-1ac1-4900-8862-5ec6154bb307" style="display: none;"></object>'
					+'<input type="text" name="caConfirmDate">'
					+'<input type="text" name="caConfirmCode">'
					+'<input type="text" name="caCode">'
					+'<input type="text" name="caDn">'
				+'</div>';
		$(html).appendTo(settings.target);
	}
	var sign = signName();
	if((!sign.caConfirmCode) || (!sign.caCode) || (!sign.caDn)){
		return false;
	}
	$("[name='caConfirmCode']").val(sign.caConfirmCode);
	$("[name='caCode']").val(sign.caCode);
	$("[name='caConfirmDate']").val(sign.caConfirmDate);
	$("[name='caDn']").val(sign.caDn);
	
	return true;
}
