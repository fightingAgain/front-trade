var bidId = $.getUrlParam("bidSectionId");	//标段id
var opid = $.getUrlParam("bidOpeningId");	//开标id
var keytext =  $.getUrlParam("keytext");	//ca信封码
var fileUrl =  $.getUrlParam("fileUrl");	//投标文件路径
var token =  $.getUrlParam("Token");	//token 

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

var letterDecrypt='';//信封码
//确定
function saveDecrypt(){
	//判断是否选中
	if($('#select').is(':checked')) {
		letterDecrypt = $('#keyText').val();
		//判断是否输入
		if(letterDecrypt == ''){
			parent.layer.alert('请输入信封码！')
			return false;
		}else{
			var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"keyText":letterDecrypt,"fileUrl":fileUrl}; //数据
			var urlDecrypt = config.openingHost + '/BidOpeningDetailsController/addEnvelopeDecrypt'; //解密路径
			
			saveDecryptInfo(parameters,urlDecrypt);
		}
	}else{
		var caType = window.sessionStorage.getItem("CA");
		//判断有没有选择证书
		if(!caType) {
			caType = selectCa();
		}else{
			if(caType == "CFCA"){
				CFCAloading();
			}else if(caType == "HBCA"){
			    HBCAloading();
			}
		}
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
	$.ajax({
		type: "post",
		url: urlDecrypt,
		data:parameters,
		async: false,
		dataType: "json",
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token", token);
		},
		success: function(rsp) {
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

/***************************************ca接口************************************************/
/**
 *ca选择
 */
function selectCa() {
	top.layer.open({
		type: 1,
		title: "请选择CA类型",
		shadeClose: true, //开启遮罩关闭
		content: '<select id="CA" class="form-control" style="padding:10px 10px;margin: 30px auto 0;height:auto;display:block; border-radius:4px;width:80%;"><option value="HBCA">HBCA</option><option value="CFCA">CFCA</option></select>',
		btn: ['确定', '取消'],
		area: ["350px", "200px"],
		yes: function(index, layero) {
				var caName = top.$("#CA").val();
				if(caName == "CFCA") {
					window.sessionStorage.setItem("CA", "CFCA");
					CFCAloading();
					top.layer.close(index);
				} else {
					window.sessionStorage.setItem("CA", "HBCA");
					HBCAloading();
					top.layer.close(index);
				}

		},
		btn2: function(index, layero) {
			top.layer.close(index);
		},
		cancel: function(index, layero) {
			top.layer.close(index);
		}
	});
}

/**
 *cfca初始化
 */
function CFCAloading(){
	var certsCFCA;
	//声明签名证书对象
	try {
		var eDiv = document.createElement("div");
		if(navigator.appName.indexOf("Internet") >= 0 || navigator.appVersion.indexOf("Trident") >= 0) {
			if(window.navigator.cpuClass == "x86") {
				eDiv.innerHTML = "<object id='CryptoAgent' codebase='CryptoKit.DFMBidding.x86.cab' classid='clsid:F52C4CD7-67BC-4415-918A-6E6334E70337' style='display:none;'></object>";
			} else {
				eDiv.innerHTML = "<object id='CryptoAgent' codebase='CryptoKit.DFMBidding.x64.cab' classid='clsid:48ECD656-A3F6-4174-9D76-11EB598B6F9F' style='display:none;'></object>";
			}
		}
		
		document.body.appendChild(eDiv);
		certsCFCA = document.getElementById("CryptoAgent");
		var subjectDNFilter = "";
		var issuerDNFilter = "";
		var SerialNum = "";
		var CertCSPName = "CFCA FOR UKEY CSP v1.1.0";
		var SelCertResult = certsCFCA.SelectEncryptCert(subjectDNFilter, issuerDNFilter, SerialNum, CertCSPName);
		//获取证书//certsCFCA.SelectCertificateDialog();
		var CN = certsCFCA.GetEncryptCertInfo("SerialNumber");
		var decryptedData = encryptCert.DecryptMsgCMSEnvelope(keytext, "CFCA FOR UKEY CSP v1.1.0");
		
		var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"keyText":decryptedData,"fileUrl":fileUrl,"signedData":CN};
		var urlDecrypt = config.openingHost + '/BidOpeningDetailsController/addBidderCFCADecrypt';
		
		//执行签到
		saveDecryptInfo(parameters,urlDecrypt);
	
	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		if(!certsCFCA){
			top.layer.alert("11");
			return;
		}
		var errorDesc = certsCFCA.GetLastErrorDesc();
		
		top.layer.msg(errorDesc);
	}
}

/**
 * HBCA初始化
 */
function HBCAloading() {
	var	certsHBCA;
	//声明签名证书对象
	try {
		//初始化object对象
		var eDiv = document.createElement("div");
		eDiv.innerHTML = '<object id="UCAPI" classid="CLSID:18201fef-1ac1-4900-8862-5ec6154bb307" style="display:none;"></object>';
		document.body.appendChild(eDiv);
		
		if(isIe()) { //IE
			certsHBCA = document.getElementById("UCAPI");
		} else {
			certsHBCA = new CerticateCollectionX();
		}
		
		//根据属性设置过滤条件(1表示使用SKF接口，2表示CSP(CSP不能枚举SM2证书)，)
	    certsHBCA.setCryptoInterface(1);
		//过滤签名证书算法("sm2","rsa")
		certsHBCA.setCF_CertAlg("sm2");
		//获取签名证书
		certsHBCA.setCF_KeyUsage(0x10);
		//加载证书集返回值等于0表示成功
		var loadResult = certsHBCA.Load();
		var len = certsHBCA.getSize();
		if(loadResult != 0 || len < 1){
			parent.layer.alert("未取到证书!");
			return false;
		}
		var encryptCert = certsHBCA.GetAt(0);
		var decryptedData = encryptCert.EnvOpen(keytext);
		
		if(decryptedData == undefined || decryptedData == null ||decryptedData == "undefined" || decryptedData == ""){
			parent.layer.alert("UKey解密异常，请采用信封解密!");
			return false;
		}
		
		var signedData = encryptCert.PKCS7String(encryptCert.GenRandom(), 0);
	
		var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"keyText":decryptedData,"fileUrl":fileUrl,"signedData":signedData};
		var urlDecrypt = config.openingHost + '/BidOpeningDetailsController/addBidderHBCADecrypt';
		
		saveDecryptInfo(parameters,urlDecrypt);

	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		top.layer.msg("未安装HBUkey驱动");
	}
}
