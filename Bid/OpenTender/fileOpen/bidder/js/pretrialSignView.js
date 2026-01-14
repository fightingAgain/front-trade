var pdfUrl = config.OpenBidHost + '/PdfService.do';//签完章后的保存路径
var pdfPath='';//承诺书ftp线上路径

var bidId = $.getUrlParam("bidSectionId");	//标段id
var opid = $.getUrlParam("bidOpeningId");	//开标id
var fileUrl =  $.getUrlParam("fileUrl");	//开标一览表路径
var Token =  $.getUrlParam("Token");	//token 
var WebPDF = ''; //PDF
var entryData; //登录信息
var signCode ="";
$(document).ready(function(){
	
	entryInfo();
	
	if (isIe()) { //IE
		WebPDF = document.getElementById("UCAPISIN");
	} else {
		WebPDF = new CerticateCollectionX();
	} 
	
	WebPDF.RecordId =  entryData.enterpriseId;
	
	//获取ca签章pdf
	var pdfPath = top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileUrl+"&Token="+Token;
	WebPDF.ShowMenus = 0 ; //菜单栏隐藏
	WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
	WebPDF.ShowTools = 0 ;//标准工具栏隐藏
	WebPDF.IsShowInputBox = true;
	//打开开标一览表
	WebPDF.WebOpenUrlFile(pdfPath);
	
	//文件保存路径
	WebPDF.WebUrl = encodeURI(pdfUrl + "?Token=" + Token) ;
	
	//签章
	$('#btnSign').click(function(){
		var caType = window.sessionStorage.getItem("CA");
		//判断有没有选择证书
		if(!caType) {
			alert("请退出签名页面,重新选择ca类型！");
		}else{
			//判断有没有选择证书
			if(caType == "CFCA"){
				CFCAloading();
			}else if(caType == "HBCA"){
				HBCAloading('123456');
			}else{
				alert("请退出签名页面,重新签名");
			}
		}
	});
	
	//关闭
	$('#btnClose').click(function(){
		//关闭pdf
		WebPDF.WebClose();
		//关闭弹出框
		var index = parent.layer.getFrameIndex(window.name); 
		top.layer.close(index);
	});

});
	
/******************************************************************CA选择****************************************************************************/

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
		var issuerDNFilter = "CFCA";
		var SerialNum = "";
		var CertCSPName = "CFCA FOR UKEY CSP v1.1.0";
		var SelCertResult = certsCFCA.SelectSignCert(subjectDNFilter, issuerDNFilter, SerialNum, CertCSPName);
		
		//var time = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		//var	card = entryData.identityCardNum;
		//var	random = hex_md5(card + time);//取一个随机数
		//获取证书//certsCFCA.SelectCertificateDialog();
		//var signature = certsCFCA.SignMsgPKCS7(random, "SHA-1", false);
		
		var dn = certsCFCA.GetSignCertInfo('SubjectDN');
	    var cn = certsCFCA.GetSignCertInfo('SerialNumber');
		
		$.ajax({
			type: "post",
			url: top.config.OpenBidHost + '/BidOpeningDetailsController/backstageVerifyCFCA',
			data:{"DN":dn,"CN":cn},
			dataType: "json",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", Token);
			},
			success: function(rsp) {
				if(rsp.success) {
					//判断签章是否成功
					var signResult = WebPDF.CreateSignature(0,'',1,2,'50*50','1');
					//判断签章是否成功
					if(signResult == 0){
						btnSubmit();
					}else{
						alert("数字签章失败,请检测签章插件和UKEY驱动！");
					}
				} else{
					alert(rsp.message);
				} 
			}
		});
	
	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		if(!certsCFCA){
			top.layer.alert("CA签名异常");
			return;
		}
		var errorDesc = certsCFCA.GetLastErrorDesc();
		top.layer.msg(errorDesc);
	}
}

/**
 * HBCA初始化
 */
function HBCAloading(pin){
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

		certsHBCA.setCryptoInterface(1);
		//过滤签名证书算法("sm2","rsa")
		certsHBCA.setCF_CertAlg("sm2");
		//获取签名证书
		certsHBCA.setCF_KeyUsage(0x20);
		//加载证书集返回值等于0表示成功
		var loadResult = certsHBCA.Load();
		var len = certsHBCA.getSize();
		if(loadResult != 0 || len < 1) {
			alert("未取到证书,请插入UKEY!");
			return false;
		}
			
		signCert = certsHBCA.GetAt(0); //certs.SelectCertificateDialog();
		signCert.setUserPIN(pin);
		//签名(0表示attach,1表示detach)*/
		var signedData = signCert.PKCS7String(signCert.GenRandom(), 0);
			
		$.ajax({
			type: "post",
			url: top.config.OpenBidHost + '/BidOpeningDetailsController/backstageVerifyHBCA',
			data:{"signedData":signedData},
			dataType: "json",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", Token);
			},
			success: function(rsp) {
				if(rsp.success) {
					//判断签章是否成功
					var signResult = WebPDF.CreateSignature(0,'',1,1,'80*50','1');
					//判断签章是否成功
					if(signResult == 0){
						$("#btnSign").hide();	//隐藏签章按钮
						$("#btnSubmit").show();//显示签名按钮
					}else{
						alert("数字签章失败,请检测签章插件和UKEY驱动！");
					}
				} else{
					alert(rsp.message);
				} 
			}
		});
	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		top.layer.msg("未安装HBUkey驱动");
	}
}

	//确定
	function btnSubmit(){
		//获取印章数据
		if(signCode==""){
			signCode = WebPDF.SaveSignDataToLocal();
		}
		//判断是否签名
		if(signCode !="" && signCode != undefined && signCode != "undefined" && signCode != null){
			WebPDF.WebSetMsgByName('PACKAGE_ID',bidId);
			WebPDF.WebSetMsgByName('OPENING_ID',opid);
			WebPDF.WebSetMsgByName('BASE_PATH','/'+entryData.enterpriseId+'/'+bidId+'/502');
			WebPDF.WebSetMsgByName('SIGN_TYPE','502');
			WebPDF.WebSetMsgByName('EXAM_TYPE','1');
			//保存签章数据
			if(WebPDF.webSave()){
				var parameters = {"bidOpeningId":opid,"bidSectionId":bidId};
				$.ajax({
					type: "post",
					url: top.config.OpenBidHost + '/FileOpenDetailsController/addPretrialBidderSign',
					data:parameters,
					async: false,
					dataType: "json",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Token", Token);
					},
					success: function(rsp) {
						if(rsp.success) {
							
							//关闭pdf
							WebPDF.WebClose();
							console.log(signCode);
							
							//关闭弹出框
							var index = parent.layer.getFrameIndex(window.name); 
							top.layer.close(index);
						} else{
							alert(rsp.message);
						} 
					}
				});
			}else{
				alert(WebPDF.Status);
			}
		}else{
			alert("请进行签章!");
		}
	}

	/********************************************************************获取当前登录人信息***************************************************/
	function entryInfo(){
		$.ajax({
			type:"post",
		  	url:config.tenderHost + '/getEmployeeInfo.do',
		  	async:false,
		  	beforeSend: function(xhr) {
				xhr.setRequestHeader("Token", sessionStorage.getItem('token'));
			},
		  	success: function(data){
		  		if(data.success){
		  			entryData = data.data;
		  		}
		  	}
		});
	}