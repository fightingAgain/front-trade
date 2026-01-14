

var entryUrl = config.tenderHost + '/getEmployeeInfo.do';  //获取登录人信息
var pdfSaveUrl = config.Reviewhost + '/PdfService.do';//签完章后的保存路径
var bidSectionId = $.getUrlParam('bidSectionId');
var id = $.getUrlParam('id');
var examType = $.getUrlParam('examType');
var filePath = $.getUrlParam('path');
var entryData;
var ukArr = {};
var chapterType = '';//1 个人 2 企业
var WebPDF = '';
$(function(){
	entryInfo()
	//回复生成PDF
//	setPdf()
//	function setPdf(){
		
		
		if (isIe()) { //IE
			WebPDF = document.getElementById("UCAPISIN");
		} else {
			WebPDF = new CerticateCollectionX();
		}
		
		WebPDF.ShowMenus = 0 ; //菜单栏隐藏
		WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
		WebPDF.ShowTools = 0 ;//标准工具栏隐藏
		WebPDF.ShowSides = 0 ;//侧边栏可见
		WebPDF.RecordId =  id;
//		console.log($.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + filePath))
		WebPDF.WebOpenUrlFile($.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + filePath));
//	}


	
	//关闭
	$('#btnClose').click(function(){
		//关闭pdf
		WebPDF.WebClose();
		//关闭弹出框
		var index = top.layer.getFrameIndex(window.name); 
		top.layer.close(index);
	});
})
function passMessage(callback){
	//确认
	$('#btnSure').click(function(){
//			WebPDF.ShowSignDlg(1);//显示电子签章窗口 0: 弹出盖骑缝章窗口1: 弹出电子签章窗口3: 弹出手写签名窗口4: 弹出批量验证窗口5: 弹出二维条码窗口6: 弹出参数设置窗口7: 弹出光学防伪窗口8: 弹出文字批注显示
//			WebPDF.IsShowInputBox = true; 
			WebPDF.WebSetMsgByName('PACKAGE_ID',bidSectionId);
			WebPDF.WebSetMsgByName('BASE_PATH','/'+bidSectionId+'/507');
			WebPDF.WebSetMsgByName('SIGN_TYPE','507');
			WebPDF.WebSetMsgByName('EXAM_TYPE',examType);
			
			WebPDF.WebSetMsgByName('CA_DN',ukArr.dn);
			WebPDF.WebSetMsgByName('CA_CODE',ukArr.cn);
			WebPDF.WebUrl= $.parserUrlForToken(pdfSaveUrl);
			var count = WebPDF.SignatureCount();
			if(count > 0){
				if(WebPDF.webSave()){
					alert('温馨提示：签章成功！');
					callback()
					var index = top.layer.getFrameIndex(window.name);
					top.layer.close(index);
				}else{
					alert('温馨提示：'+WebPDF.Status);
				}
			}else{
				alert('温馨提示：请先签章！');
			}
	});
}
function entryInfo(){
	$.ajax({
		type:"post",
	  	url:entryUrl,
	  	async:false,
	  	success: function(data){
	  		if(data.success){
	  			entryData = data.data
	  		}
	  	},
	  	error: function(){
	  		
	  	},
	})
}
//签章
	$('#btnSign').click(function(){//显示电子签章窗口 0: 弹出盖骑缝章窗口1: 弹出电子签章窗口3: 弹出手写签名窗口4: 弹出批量验证窗口5: 弹出二维条码窗口6: 弹出参数设置窗口7: 弹出光学防伪窗口8: 弹出文字批注显示
		CFCAloading();
		$('#CryptoAgent').remove();
		if(expertCA){
			if(!isNameSame){
				alert('温馨提示：使用的CA与当前企业信息不一致，请更换CA或重新登录！');
				return
			}
		}
		
		WebPDF.ShowSignDlg(1)
		WebPDF.IsShowInputBox = true;
	});
	
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
			var caOwner;
			
			//获取证书//certsCFCA.SelectCertificateDialog();
			var Subject = certsCFCA.GetSignCertInfo('SubjectCN');
			if(top.checkHandleCa){//若验证CA办理机构
				var agencys = handlingAgency.split(',')
				if(agencys.indexOf(Subject.split("@")[0]) == -1){
					top.layer.alert(top.unHandleMsg)
					return
				}
			}
			for(var i=0;i<Subject.split(",").length;i++){
				//找到持有人信息
				caOwner=Subject.split(",")[i];
				if(caOwner.split("@")[2].substring(0,1) == '0'){
					chapterType = 1;//个人
				}else if(caOwner.split("@")[2].substring(0,1) == 'N'){
					chapterType = 2;//企业
				}
				ukArr.icardno= caOwner.split("@")[2].substring(1,caOwner.split("@")[2].length);
				caOwner= caOwner.split("@")[1];
				continue;
			}
			
	        ukArr.dn = certsCFCA.GetSignCertInfo('SubjectCN');
	        ukArr.cn = certsCFCA.GetSignCertInfo('SerialNumber');
	        if(chapterType == 1){
	        	if(entryData.identityCardNum != ukArr.icardno){
					isNameSame = false;
				}else{
					isNameSame = true
				}
	        }else if(chapterType == 2){
	        	if(entryData.enterpriseCode != ukArr.icardno){
					isNameSame = false;
				}else{
					isNameSame = true
				}
	        }
	        
		} catch(e) {
			window.sessionStorage.setItem("CA", "");
			if(!certsCFCA){
				alert("温馨提示：CA签名异常");
				return;
			}
			certsCFCA.GetLastErrorDesc();
		}
	}