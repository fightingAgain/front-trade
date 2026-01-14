var getSignSiteUrl = top.config.Reviewhost + '/BidCheckReportController/getSignSite';
var signatureUrl = top.config.Reviewhost + '/BidCheckReportController/signature';

var pdfSaveUrl =  top.config.Reviewhost + '/PdfService.do';//签完章后的保存路径

var bondId = $.getUrlParam("bondId");
var examType = $.getUrlParam("examType");
var bidSectionId = $.getUrlParam("bidSectionId");	//标段id
var idCard = $.getUrlParam("idCard");//身份证号

var thisFrame = parent.window.document.getElementById("layerPackage").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$("#" + thisFrame)[0].contentWindow;

var ukArr = {};
var idCardSame = true;//CA信息与当前登录人信息是否一致
var expertReportSign;
$(function () {
	du()
})
function du() {
	var WebPDF = '';
	if (isIe()) { //IE
		WebPDF = document.getElementById("UCAPISIN");
	} else {
		WebPDF = new CerticateCollectionX();
	}

	$.ajax({
		type: "post",
		url: getSignSiteUrl,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType,
		},
		async: false,
		dataType: "json",
		success: function (rsp) {
			if (rsp.success) {
				expertReportSign = rsp.data;

				var pdfPath = top.config.FileHost + "/fileView" + expertReportSign.pdfUrl;
				WebPDF.ShowMenus = 0; //菜单栏隐藏
				WebPDF.ShowSigns = 0; //签章工具栏隐藏
				WebPDF.ShowTools = 0;//标准工具栏隐藏
				WebPDF.ShowSides = 0;//侧边栏可见
				WebPDF.IsShowInputBox = true;
				WebPDF.WebUrl= $.parserUrlForToken(pdfSaveUrl);
				WebPDF.WebOpenUrlFile(pdfPath);

				if (expertReportSign.type == 1) {
					$('#btnSign').hide();
					var signDataPath = top.config.FileHost + "/fileView" + expertReportSign.signData;
					$.ajax({
						url: signDataPath,
						type: "get",
						dataType: "text",
						success: function (dat) {
							WebPDF.LoadLocalSignData(dat);
						}
					});
				} else {

				}
			} else {
				alert('温馨提示：' + rsp.message);
			}
		}
	});

	//获取左边
	//获取ca签章pdf



	//签章
	$('#btnSign').click(function () {
		CFCAload();
		$('#CryptoAgent').remove();
		if (expertCA) {
			if (!idCardSame) {
				alert('温馨提示：使用的CA与当前登录人信息不一致，请更换CA或重新登录！');
				return
			}
		}


		var isSignS = true;
		var signResult = '';
		var positionArr = expertReportSign.signSite.split(';');
		for (var i = 0; i < positionArr.length; i++) {
			if (i == 0) {
				WebPDF.IsShowInputBox = true;
			} else {
				WebPDF.IsShowInputBox = false;
			}
			var page = positionArr[i].split('-');
			//signResult = WebPDF.SeriesSignatureExt(page[0], page[1], 0, "", 1, page[2], "1-" + WebPDF.PageCount,1,0);
			//定位模式：1绝对坐标；2百分比坐标。Mod为1为绝对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为50px，y坐标为60px处盖章。Mod为2为相对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为页面宽度的百分之50，y坐标为页面高度的百分之60处盖章
			var mode = page.length > 3 ? page[3] : 1;
			//定位信息
			var pos = page[2];
			//需要保护的页面信息
			//var area= page.length>4?page[3].replace("_","-"):"1-" + WebPDF.PageCount;
			var area = "1-" + WebPDF.PageCount;
			signResult = WebPDF.SeriesSignature(page[0], page[1], 0, "", mode, pos, area);
			if (signResult != 0) {
				isSignS = false;
				break;
			}
		}

		//		//判断签章是否成功
		if (isSignS) {
			//获取印章数据
			var signInfo = {};
			signInfo.id = bondId;
			signInfo.bidSectionId = bidSectionId;
			signInfo.examType = examType;
			var signData = WebPDF.SaveBatchSignDataToLocal();
			console.log(signData);
			WebPDF.RecordId = bondId;
			WebPDF.WebSetMsgByName('PACKAGE_ID',bidSectionId);
			WebPDF.WebSetMsgByName('BASE_PATH','/'+bidSectionId+'/505');
			WebPDF.WebSetMsgByName('SIGN_TYPE','505');
			WebPDF.WebSetMsgByName('EXAM_TYPE',examType);
			WebPDF.WebSetMsgByName('CA_DN',ukArr.dn);
			WebPDF.WebSetMsgByName('CA_CODE',ukArr.cn);
			WebPDF.WebSetMsgByName('SIGN_DATE',signData);

			signInfo.signData = signData;

			//判断是否签名
			if (signInfo.signData != "" && signInfo.signData != undefined && signInfo.signData != "undefined" && signInfo.signData != null) {
				/*if(WebPDF.webSave()){
					$('#btnSign').hide();
					alert('温馨提示：签章成功！');
					// WebPDF.WebClose();
					dcmt.currFunction();
					//关闭弹出框
					var index = top.layer.getFrameIndex(window.name);
					top.layer.close(index);
				}else{
					alert('温馨提示：'+WebPDF.Status);
				}*/
				$.ajax({
					type: "post",
					url: signatureUrl,
					data: signInfo,
					async: false,
					dataType: 'json',
					success: function (rsp) {
						if (rsp.success) {
							alert("温馨提示：签章完毕");
							//关闭pdf
							WebPDF.WebClose();
							//							dcmt.reviewReport();
							dcmt.currFunction();
							//关闭弹出框
							var index = top.layer.getFrameIndex(window.name);
							top.layer.close(index);
						} else {
							alert('温馨提示：' + rsp.message);
						}
					}, error: function () {
						alert("温馨提示：保存签章数据失败");
					}
				});
			} else {
				alert("温馨提示：未获取到签章数据!");
			}

		} else {
			WebPDF.GetErrorString(signResult);
			alert('温馨提示：' + WebPDF.GetErrorString(signResult));
		}
	});

	//关闭
	$('#btnClose').click(function () {
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
function CFCAload() {
	var certsCFCA;
	//声明签名证书对象
	try {
		var eDiv = document.createElement("div");
		if (navigator.appName.indexOf("Internet") >= 0 || navigator.appVersion.indexOf("Trident") >= 0) {
			if (window.navigator.cpuClass == "x86") {
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
		var caOwner = CryptoAgent.GetSignCertInfo('SubjectCN');
		ukArr.dn = CryptoAgent.GetSignCertInfo('SubjectCN');
		ukArr.cn = CryptoAgent.GetSignCertInfo('SerialNumber');
		ukArr.icardno = caOwner.split("@")[2].substring(1, caOwner.split("@")[2].length);
		if (idCard != ukArr.icardno) {
			idCardSame = false;
		} else {
			idCardSame = true
		}

	} catch (e) {
		window.sessionStorage.setItem("CA", "");
		if (!certsCFCA) {
			alert("温馨提示：CA签名异常");
			return;
		}
		var errorDesc = certsCFCA.GetLastErrorDesc();
		alert('温馨提示：' + errorDesc);
	}
}