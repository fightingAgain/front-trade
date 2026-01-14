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
		var SelCertResult = certsCFCA.SelectSignCert(subjectDNFilter, issuerDNFilter, SerialNum, CertCSPName);
		
		var time = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		var	card = entryData.identityCardNum;
		var	random = hex_md5(card + time);//取一个随机数
		//获取证书//certsCFCA.SelectCertificateDialog();
		var signature = certsCFCA.SignMsgPKCS7(random, "SHA-1", false);
		
		var params = {"signedData": signature,"bidSectionId": bidId,"random":random,};
		
		//执行签到
		if($.trim(signature) != '') {
			$.ajax({
				type: "post",
				url: config.openingHost + "/BidOpeningSignInController/addBidderCfCASignIn",
				async: false,
				data:params,
				dataType: "json",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
				success: function(rsp) {
					if(rsp.success) {
						parent.layer.alert(rsp.data, {icon: 6});
					} else {
						parent.layer.alert(rsp.message, {icon: 6});
					}
				}
			});
		}
	
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

		//加载驱动
		//根据属性设置过滤条件(1表示使用SKF接口，2表示CSP(CSP不能枚举SM2证书)，)
		certsHBCA.setCryptoInterface(1);
		//过滤签名证书算法("sm2","rsa")
		certsHBCA.setCF_CertAlg("sm2");
		//获取签名证书
		certsHBCA.setCF_KeyUsage(0x20);
		//加载证书集返回值等于0表示成功
		var loadResult = certsHBCA.Load();
		var len = certsHBCA.getSize();
		if(loadResult != 0 || len < 1) {
			top.layer.msg("请插入Ukey");
			return false;
		}
		
		var signCert = certsHBCA.GetAt(0); //certs.SelectCertificateDialog();
		//签名(0表示attach,1表示detach)*/
		var signedData = signCert.PKCS7String(signCert.GenRandom(), 0);
		
		var params = {"signedData": signedData,"bidSectionId": bidId};
		
		//执行签到
		if($.trim(signedData) != '') {
			$.ajax({
				type: "post",
				url: config.openingHost + "/BidOpeningSignInController/addBidderHBCASignIn",
				async: false,
				data:params,
				dataType: "json",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
				},
				success: function(rsp) {
					if(rsp.success) {
						parent.layer.alert(rsp.data, {icon: 6});
					} else {
						parent.layer.alert(rsp.message, {icon: 6});
					}
				}
			});
		}
	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		top.layer.msg("未安装HBUkey驱动");
	}
}

/**********************************************************ca签到*******************************************************************************************/
function caSignIn(){
	//声明证书集对象
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