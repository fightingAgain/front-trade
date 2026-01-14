var pdfUrl = config.tenderHost + '/PdfService.do';//签完章后的保存路径
var pdfPath='';//承诺书ftp线上路径
var employeeInfo = entryInfo();//当前登录人信息
var bidId = '';//标段Id
var keyId = '';//该投标人解密详情主键ID
$(function(){
	var index = parent.layer.getFrameIndex(window.name); 
	
	var WebPDF = document.getElementById("UCAPI");
	
	WebPDF.WebUrl= $.parserUrlForToken(pdfUrl);
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		bidId =  getUrlParam("id");
	};
	if(getUrlParam("recordid") && getUrlParam("recordid") != "undefined"){
		WebPDF.RecordId =  getUrlParam("recordid");
	};
	if(getUrlParam("pdfPath") && getUrlParam("pdfPath") != "undefined"){
		pdfPath = getUrlParam("pdfPath")+'?Token='+$.getToken()+'&packageId='+bidId;
//		path = getUrlParam("pdfPath");
		console.log(pdfPath)
//		console.log(path)
		WebPDF.WebOpenUrlFile(pdfPath);
	};
	$('#btnSubmit').click(function(){
		saveFile()
	});
	//关闭
	$('#btnClose').click(function(){
		top.layer.close(index);
	});
//签完章后的保存
	function saveFile(){
		WebPDF.WebSetMsgByName('PACKAGE_ID',bidId);
		WebPDF.WebSetMsgByName('BASE_PATH','/'+employeeInfo.enterpriseId+'/'+bidId+'/501');
		WebPDF.WebSetMsgByName('SIGN_TYPE','501');
		WebPDF.WebSetMsgByName('EXAM_TYPE','2');
		var count = WebPDF.SignatureCount();//获取文档中的签章数量
		if(count>0){
//			WebPDF.webSave();
			if(WebPDF.webSave()){
				alert(WebPDF.Status);
				top.layer.close(index);
			}else{
				alert(WebPDF.Status);
			}
		}else{
			alert('请签章！')
		}
	}
});

