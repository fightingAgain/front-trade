var bidId;
var examType;
var bondId;
var pageNo;
var pos;
var thisFrame = parent.window.document.getElementById("layerPackage").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$("#" + thisFrame)[0].contentWindow; 
var idCard = getUrlParam("idCard");//身份证号
var ukArr = {};
var idCardSame = true;//CA信息与当前登录人信息是否一致
var expertReportSign;
$(function(){
	du()
})
function du(){
	bondId = $.getUrlParam("bondId");
	examType = $.getUrlParam("examType");
	bidId = $.getUrlParam("bidSectionId");	//标段id
	var WebPDF = '';
	if (isIe()) { //IE
		WebPDF = document.getElementById("UCAPISIN");
	} else {
		WebPDF = new CerticateCollectionX();
	}

    $.ajax({
        type: "post",
        url: top.config.Reviewhost + '/BidCheckReportController/getSignSite',
        data:{
            'bidSectionId':bidId,
            'examType':examType,
        },
        async: false,
        dataType: "json",
        success: function(rsp) {
            if(rsp.success) {
                expertReportSign = rsp.data;

                var pdfPath = top.config.FileHost + "/fileView" + expertReportSign.pdfUrl;
                WebPDF.ShowMenus = 0 ; //菜单栏隐藏
                WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
                WebPDF.ShowTools = 0 ;//标准工具栏隐藏
                WebPDF.ShowSides = 0 ;//侧边栏可见
                WebPDF.IsShowInputBox = true;

                WebPDF.WebOpenUrlFile(pdfPath);

                if(expertReportSign.type == 1){
                    $('#btnSign').hide();
                    var signDataPath = top.config.FileHost + "/fileView" + expertReportSign.signData;
                    $.ajax({
						url: signDataPath,
						type: "get",
						dataType:"text",
						success: function (dat) {
							WebPDF.LoadLocalSignData(dat);
						}
                    });
				}else{

				}
            } else{
                alert(rsp.message);
            }
        }
    });
	
	//获取左边
	//获取ca签章pdf  



    //签章
	$('#btnSign').click(function(){			
		CFCAload();
		$('#CryptoAgent').remove();
		if(expertCA){
			if(!idCardSame){
				alert('使用的CA与当前登录人信息不一致，请更换CA或重新登录！');
				return
			}
		}


        var isSignS = true;
        var signResult = '';
        var positionArr = expertReportSign.signSite.split(';');
        for(var i = 0;i<positionArr.length;i++){
            if(i==0){
                WebPDF.IsShowInputBox = true;
            }else{
                WebPDF.IsShowInputBox = false;
            }
            var page = positionArr[i].split('-');
            //signResult = WebPDF.SeriesSignatureExt(page[0], page[1], 0, "", 1, page[2], "1-" + WebPDF.PageCount,1,0);
            //定位模式：1绝对坐标；2百分比坐标。Mod为1为绝对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为50px，y坐标为60px处盖章。Mod为2为相对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为页面宽度的百分之50，y坐标为页面高度的百分之60处盖章
            var mode = page.length>3?page[3]:1;
            //定位信息
            var pos = page[2];
            //需要保护的页面信息
            //var area= page.length>4?page[3].replace("_","-"):"1-" + WebPDF.PageCount;
            var area= "1-" + WebPDF.PageCount;
            signResult = WebPDF.SeriesSignature(page[0], page[1], 0, "", mode, pos, area);
            if(signResult != 0){
                isSignS = false;
            }
        }

//		//判断签章是否成功
		if(isSignS){
			//获取印章数据
			var signInfo = {};
            signInfo.id = bondId;
            signInfo.bidSectionId = bidId;
            signInfo.examType = examType;
            signInfo.signData = WebPDF.SaveBatchSignDataToLocal();
			
			//判断是否签名
			if(signInfo.signData !="" && signInfo.signData != undefined && signInfo.signData != "undefined" && signInfo.signData != null){
				$.ajax({
					type: "post",
					url: top.config.Reviewhost + '/BidCheckReportController/signature',
					data:signInfo,
					async: false,
					dataType: 'json',
					success: function(rsp) {
						if(rsp.success) {
                            alert("签章完毕");
							//关闭pdf
							WebPDF.WebClose();
							dcmt.reviewPresentation();
							//关闭弹出框
							var index = top.layer.getFrameIndex(window.name);
							top.layer.close(index);
						} else{
							alert(rsp.message);
						}
					}
				});
			}else{
				alert("请进行签章!");
			}

		}else{
			WebPDF.GetErrorString(signResult);
		}
	});

	//关闭
	$('#btnClose').click(function(){
		//关闭pdf
		WebPDF.WebClose();
		//关闭弹出框
		var index = top.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
}

/**
 *cfca初始化
 */
	function CFCAload(){
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
			
			//获取证书//certsCFCA.SelectCertificateDialog();
			var caOwner = certsCFCA.GetSignCertInfo('SubjectCN');
			if(top.checkHandleCa){//若验证CA办理机构
				var agencys = handlingAgency.split(',')
				if(agencys.indexOf(caOwner.split("@")[0]) == -1){
					top.layer.alert(top.unHandleMsg)
					return
				}
			}
	        ukArr.dn = certsCFCA.GetSignCertInfo('SubjectCN');
	        ukArr.cn = certsCFCA.GetSignCertInfo('SerialNumber');
			ukArr.icardno= caOwner.split("@")[2].substring(1,caOwner.split("@")[2].length);
			 if(idCard != ukArr.icardno){
				idCardSame = false;
			}else{
				idCardSame = true
			}
		
		} catch(e) {
			window.sessionStorage.setItem("CA", "");
			if(!certsCFCA){
				alert("CA签名异常");
				return;
			}
			var errorDesc = certsCFCA.GetLastErrorDesc();
			alert(errorDesc);
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
					var signResult = WebPDF.CreateSignature(0,pin,pageNo,2,pos,"1");
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
		alert("未安装HBUkey驱动");
	}
}