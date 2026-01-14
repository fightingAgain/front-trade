var pdfUrl = config.OpenBidHost + '/PdfService.do';//签完章后的保存路径
var pdfPath='';//承诺书ftp线上路径

var bidId = $.getUrlParam("bidSectionId");	//标段id
var opid = $.getUrlParam("bidOpeningId");	//开标id
var fileUrl =  $.getUrlParam("fileUrl");	//开标一览表路径
var Token =  $.getUrlParam("Token");	//token 
var pageNo = $.getUrlParam("pageNo");	//token 
var pos = $.getUrlParam("pos");	//token 
var WebPDF = ''; //PDF
var entryData; //登录信息
var signCode ="";
var ukArr = {};
var signType ;//签名人员类型  0为招标人   1为监标人  2.项目经理
$(document).ready(function(){
	CFCAloading()
	entryInfo();
	signType = $.getUrlParam('signType');
	$('#UCAPISIN').css('height',($(window).height()-100)+'px');
	if (isIe()) { //IE
		WebPDF = document.getElementById("UCAPISIN");
		
	} else {
		WebPDF = new CerticateCollectionX();
	} 
	
	WebPDF.RecordId =  opid;
	
	//获取ca签章pdf
	var pdfPath = top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileUrl+"&Token="+Token;
	WebPDF.ShowMenus = 0 ; //菜单栏隐藏
	WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
	WebPDF.ShowTools = 0 ;//标准工具栏隐藏
	//打开开标一览表
	WebPDF.WebOpenUrlFile(pdfPath);
	
	
	//文件保存路径
	WebPDF.WebUrl = encodeURI(pdfUrl + "?Token=" + Token) ;
	
	//签章
	$('#btnSign').click(function(){
//		WebPDF.IsShowInputBox = true;
		var signText = '';
		if(signType == 0){
			signText = '招标人代表签章'
		}else if(signType == 1){
			signText = '监标人签章'
		}else if(signType == 2){
			signText = '记录人签章'
		}
		var m = WebPDF.PageCount;
		var allResult = false;
		for(var i = 1;i<=m;i++){
			if(i > 1){
				WebPDF.IsShowInputBox = false;
			}else{
				WebPDF.IsShowInputBox = true;
			}
			/**签名人员类型  0为招标人   1为监标人  2.项目经理*/
			var signResult = WebPDF.CreateSignature(0,"",i,0,signText, "1");
			if(signResult == 0){
				allResult = true;
			}else{
//				WebPDF.GetErrorString(signResult);
				continue
			}
		}
		
		if(allResult){
			btnSubmit();
		}
		/*var caType = window.sessionStorage.getItem("CA");
		top.layer.open({
			type: 2,
			title: '密码',
			area: ['300px','200px'],
			resize: false,
			content: 'OpenTender/bidder/model/caPassword.html',
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(getPassword);  //调用子窗口方法，传参
			}
		});*/
	});
	
	function getPassword(pin){
		backstageVerify(pin);
	}
	
	//关闭
	$('#btnClose').click(function(){
		//关闭pdf
		WebPDF.WebClose();
		//关闭弹出框
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index);
	});

});

	//ca后台验签
	function backstageVerify(pin){
		if(pin !=""){
			var caType = window.sessionStorage.getItem("CA");
			CFCAloading(pin);
		}else{
			alert("请输入CA密码");
		}
	}
	
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
	    ukArr.dn = certsCFCA.GetSignCertInfo('SubjectCN');
		ukArr.cn = certsCFCA.GetSignCertInfo('SerialNumber');
		
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


//确定
function btnSubmit(){
	//获取印章数据
	if(signCode==""){
		signCode = WebPDF.SaveBatchSignDataToLocal();
	}
	//判断是否签名
	if(signCode !="" && signCode != undefined && signCode != "undefined" && signCode != null){
		WebPDF.WebSetMsgByName('PACKAGE_ID',bidId);
		WebPDF.WebSetMsgByName('BASE_PATH','/'+entryData.enterpriseId+'/'+bidId+'/502');
		WebPDF.WebSetMsgByName('SIGN_TYPE','5022');
		WebPDF.WebSetMsgByName('EXAM_TYPE','2');
		WebPDF.WebSetMsgByName('CA_DN',ukArr.dn);
		WebPDF.WebSetMsgByName('CA_CODE',ukArr.cn);
		WebPDF.WebSetMsgByName('SIGN_DATE',signCode);
//		try{
			//保存签章数据
			if(WebPDF.webSave()){
				alert('签章成功！');
				$('#btnSign').hide();
			}else{
				alert(WebPDF.Status);
			}
		/*} catch(err){
 			alert("签章保存异常信息:"+ err);
		}*/
	}else{
		alert("签章数据为空!");
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