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
var caOwner;
var icardno;
var Type;//1 企业  2个人
var isSame = false;//ca信息是否匹配
var CAcf = null;
$(document).ready(function(){
	
	entryInfo();
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
		if(!CAcf){
			CAcf = new CA();
		}
		CAcf.CASignView(ukArr,function(){
			WebPDF.IsShowInputBox = true;
			var signResult = WebPDF.SeriesSignature(pageNo, pageNo, 0, '', 1, pos, "1-" + WebPDF.PageCount);
			//判断签章是否成功
			if(signResult == 0){
				btnSubmit();
			}else{
				WebPDF.GetErrorString(signResult);
				alert(WebPDF.GetErrorString(signResult));
			}
		});
		
		
		/*var caType = window.sessionStorage.getItem("CA");
		//判断有没有选择证书
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
	
	/*function getPassword(pin){
		backstageVerify(pin);
	}*/
	
	//关闭
	$('#btnClose').click(function(){
		//关闭pdf
		WebPDF.WebClose();
		//关闭弹出框
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index);
	});

});
/******************************************************************CA选择****************************************************************************/

/**
 *cfca初始化
 */
function CFCAloading(pin){
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
		//获取ca信息
//		var	Subject = certsCFCA.GetSignCertInfo("SubjectDN");
		
		
		var dn = certsCFCA.GetSignCertInfo('SubjectDN');
	    var cn = certsCFCA.GetSignCertInfo('SerialNumber');
	    ukArr.dn = CryptoAgent.GetSignCertInfo('SubjectCN');
		ukArr.cn = CryptoAgent.GetSignCertInfo('SerialNumber');
		for(var i=0;i<dn.split(",").length;i++){
			//找到持有人信息
			if((dn.split(",")[i]).indexOf("CN=") != -1){
				caOwner=dn.split(",")[i];
				icardno= caOwner.split("@")[2].substring(1,caOwner.split("@")[2].length);
				caOwner= caOwner.split("@")[1];
			}
			//找到CA类型信息
			if((dn.split(",")[i]).indexOf("-2") != -1){
				Type=dn.split(",")[i];
				Type =Type.substring(4);
			}
			if('Individual-2'==Type){ //个人
				Type = 2
			}else if('Organizational-2'==Type){//企业
				Type = 1
			}
			continue;
		}
//		$.ajax({
//			type: "post",
//			url: top.config.OpenBidHost + '/BidOpeningDetailsController/backstageVerifyCFCA',
//			data:{"DN":dn,"CN":cn},
//			dataType: "json",
//			beforeSend: function(xhr) {
//				xhr.setRequestHeader("Token", Token);
//			},
//			success: function(rsp) {
//				if(rsp.success) {
//					//判断签章是否成功
////					SeriesSignature(StartPageNo,EndPageNo,Index,Pass,Mode,Pos,Area)
//					//功能说明：	在指定页的指定位置上进行批量签章
//					//输入参数：	StartPageNo	数字整型	//开始页数
//					//EndPageNo	数字整型	//结束页数
//					//Index	数字整型	//签章序号（自0开始）
//					////如为-1则弹出盖章窗口印章由用户自行选择
//					//Pass		字符串型	//签章密码
//					//Mode	数字整型	//定位模式：1绝对坐标；2相对坐标。具体的坐标以Pos为定位值。
//					//Pos		字符串型	//定位信息：坐标（如"50*50"）或为定位文本
//					//Area 	字符串型    	//保存分页信息，标志了哪些页被签章进行保护，以逗号分隔，页码可以是数字也可以是区间(以减号分隔) 例如“1,2-5,6”，特点是即使在文档后追加页也不会影响签章的验证结果。值为空时则为全部文档内容保护，在文档后追加会影响签章的验证结果。当值为-1时，则所盖印章不对文档进行保护。
//					//输出参数：	FALSE/TRUE 是否成功
//					//特别说明：	PDF页面坐标原点在左下角，X轴向右为正，Y轴向上为正。
//					//Mod为1为绝对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为50px，y坐标为60px处盖章。
//					//Mod为2为相对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为页面宽度的百分之50，y坐标为页面高度的百分之60处盖章。
//					//调用示例：	WebPDF.SeriesSignature(1,2,0,"123456",1,"80*50","1,2-5,6");
//					
//					var signResult = WebPDF.SeriesSignature(pageNo, pageNo, 0, pin, 1, pos, "1-" + WebPDF.PageCount);
//					
//					//CreateSignature
//					//Index	数字整型	//签章序号（自0开始）
//					//Pass		字符串型	//签章密码
//					//PageNo	数字整型	//页数
//					//Mode	数字整型	//定位模式：
//						//0文本定位，以PageNo为开始搜索的页，不执行循环搜索；
//						//1绝对坐标，以PageNo为要定位的页；
//						//2相对坐标，以PageNo为具体页，Pos为定位值来定位。
//						//3文本定位，以PageNo为开始搜索的页，向上搜索，不执行循环搜索；
//						//4文本定位，以PageNo为开始搜索的页，向上搜索，执行循环搜索；
//						//5文本定位，以PageNo为开始搜索的页，向下搜索，执行循环搜索；
//					//Pos		字符串型	//定位坐标（如"150*150"）或为定位文本
//					//Area 	字符串型	//保存分页信息，标志了哪些页被签章进行保护，以逗号分隔，页码可以是数字也可以是区间(以减号分隔) 例如”1,2-5,6”，特点是即使在文档后追加页也不会影响签章的验证结果。值为空时则为文档内容保护，在文档后追加会影响签章的验证结果。当值为-1时，则所盖印章不对文档进行保护。
////					var signResult = WebPDF.CreateSignature(0,pin,pageNo,1,pos,"1");
//					//判断签章是否成功
//					if(signResult == 0){
//						btnSubmit();
//					}else{
//						WebPDF.GetErrorString(signResult);
////						alert("数字签章失败,请检测签章插件和UKEY驱动！");
//					}
//				} else{
//					alert(rsp.message);
//				} 
//			}
//		});
	
	} catch(e) {
		window.sessionStorage.setItem("CA", "");
		if(!certsCFCA){
			top.layer.alert("CA签名异常");
			return;
		}
		alert(e.message)
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
			WebPDF.WebSetMsgByName('SIGN_TYPE','5021');
			WebPDF.WebSetMsgByName('EXAM_TYPE','2');
			WebPDF.WebSetMsgByName('CA_DN',ukArr.dn);
			WebPDF.WebSetMsgByName('CA_CODE',ukArr.cn);
			WebPDF.WebSetMsgByName('SIGN_DATE',signCode);
			try{
				//保存签章数据
				if(WebPDF.webSave()){
					alert('签章成功！');
					$('#btnSign').hide();
				}else{
					alert(WebPDF.Status);
				}
			} catch(err){
     			alert("签章保存异常信息:"+ err);
			}
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