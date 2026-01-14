/**
*  zhouyan 
*  2019-3-27
*  评委签订承诺书
*  方法列表及功能描述
* 进入页面后根据地址栏携带过来的参数获取线上承诺书->展示线上承诺书->签章->提交（验证是否签章）
*/

var pdfUrl = config.tenderHost + '/PdfService.do';//签完章后的保存路径
var promiseUrl = config.tenderHost + '/ExpertSignInController/getLetterOfCommitmentPdf.do';//获取承诺书地址
var bidId = '';//标段Id
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return decodeURIComponent(r[2]);
	return null; // 返回参数值  
}
$(function(){
	var employeeInfo = entryInfo();//当前登录人信息
	var index = parent.layer.getFrameIndex(window.name); 
	var WebPDF = document.getElementById("UCAPI");
	
	WebPDF.WebUrl= $.parserUrlForToken(pdfUrl);
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		bidId =  getUrlParam("id");
		WebPDF.WebOpenUrlFile(promiseUrl+'?Token='+$.getToken()+'&packageId='+bidId);
		WebPDF.RecordId =  bidId;
	}
	$('#btnSubmit').click(function(e){
		e.cancelBubble = true;
		saveFile()
	});
	//关闭
	$('#btnClose').click(function(){
		top.layer.close(index);
	});
//签完章后的保存
	function saveFile(){
		WebPDF.WebSetMsgByName('PACKAGE_ID',bidId);
		WebPDF.WebSetMsgByName('BASE_PATH','/'+employeeInfo.id+'/'+bidId+'/503');
		WebPDF.WebSetMsgByName('SIGN_TYPE','503');
		WebPDF.WebSetMsgByName('EXAM_TYPE','2');
		var count = WebPDF.SignatureCount();//获取文档中的签章数量
		//根据文档上的签章数量来验证是否签章
		if(count>0){
			if(WebPDF.webSave()){
				alert(WebPDF.Status);
				top.layer.close(index);
				parent.$("#tableList").bootstrapTable('refresh');
			}else{
				alert(WebPDF.Status);
			}
		}else{
			alert('请签章！')
		}
		
	}
});

