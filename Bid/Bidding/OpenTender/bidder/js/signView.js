var pdfUrl = config.openingHost + '/PdfService.do';//签完章后的保存路径
var pdfPath='';//承诺书ftp线上路径

var bidId = $.getUrlParam("bidSectionId");	//标段id
var opid = $.getUrlParam("bidOpeningId");	//开标id
var fileUrl =  $.getUrlParam("fileUrl");	//开标一览表路径
var Token =  $.getUrlParam("Token");	//token 
var pageNo = $.getUrlParam("pageNo");	//token 
var pos = $.getUrlParam("pos");	//token 
var WebPDF = ''; //PDF
$(document).ready(function(){
	
	if (isIe()) { //IE
		WebPDF = document.getElementById("UCAPISIN");
		
	} else {
		WebPDF = new CerticateCollectionX();
	} 
	
	//获取ca签章pdf  
	var pdfPath = top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileUrl+"&Token="+Token;
	WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
	//WebPDF.IsShowInputBox = true;
	WebPDF.WebOpenUrlFile(pdfPath);
	

	
	//签章
	$('#btnSign').click(function(){
		top.layer.open({
			type: 2,
			title: '密码',
			area: ['300px','230px'],
			resize: false,
			content: 'caPassword.html',
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(getPassword);  //调用子窗口方法，传参
			}
		});
		
	});
	
	function getPassword(pin){
		backstageVerify(pin);
	}
	
	//确定
	$('#btnSubmit').click(function(){
		//获取印章数据
		var signCode = WebPDF.SaveSignDataToLocal();
		//判断是否签名
		if(signCode !="" && signCode != undefined && signCode != "undefined" && signCode != null){
			var parameters = {"bidOpeningId":opid,"bidSectionId":bidId,"signCode":signCode,"signPdf":fileUrl};
			$.ajax({
				type: "post",
				url: top.config.openingHost + '/BidOpeningDetailsController/addBidderSign',
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
			alert("请进行签章!");
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

	//ca后台验签
	function backstageVerify(pin){
		if(pin !=""){
			var certsCa = '';	//验签
			if (isIe()) { //IE
				certsCa = document.getElementById("UCAPICA");
			} else {
				certsCa = new CerticateCollectionX();
			} 
			certsCa.setCryptoInterface(1);
			//过滤签名证书算法("sm2","rsa")
			certsCa.setCF_CertAlg("sm2");
			//获取签名证书
			certsCa.setCF_KeyUsage(0x20);
			//加载证书集返回值等于0表示成功
			var loadResult = certsCa.Load();
			var len = certsCa.getSize();
			if(loadResult != 0 || len < 1) {
				alert("未取到证书,请插入UKEY!");
				return false;
			}
			
			signCert = certsCa.GetAt(0); //certs.SelectCertificateDialog();
			signCert.setUserPIN(pin);
			//签名(0表示attach,1表示detach)*/
			var signedData = signCert.PKCS7String(signCert.GenRandom(), 0);
			
			$.ajax({
				type: "post",
				url: top.config.openingHost + '/BidOpeningDetailsController/backstageVerify',
				data:{"signedData":signedData},
				dataType: "json",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Token", Token);
				},
				success: function(rsp) {
					if(rsp.success) {
						var signResult = WebPDF.CreateSignature(0,pin,pageNo,2,pos,"1");
						var info = WebPDF.SignatureItem(0);
						console.log(info);
						//判断签章是否成功
						if(signResult == 0){
							$("#btnSign").hide();	//隐藏签章按钮
							$("#btnSubmit").show();//显示签名按钮
						}else{
							alert("数字签章失败！");
						}
					} else{
						alert(rsp.message);
					} 
				}
			});
		}else{
			alert("请输入CA密码");
		}
	}