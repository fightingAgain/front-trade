
var avoidHtml="Review/judgeCheck/model/avoid.html";//回避单位 avoidHtml
// var pdfSaveUrl = config.Reviewhost + '/PdfService.do';//签完章后的保存路径
var confirmAvoidHtml = "bidPrice/Review/Expert/modal/confirmAvoid.html";//确认回避信息 页面，签订承诺书之前
var signStateUrl = url + '/ExpertSignInController/getSignInInfo.do';//获取签到状态
var getSignUrl = url + '/ExpertSignInController/getSign.do';//
var signUrl = url + '/ExpertSignInController/sign.do';//签章
var promisePdfUrl = '';//承诺书地址
var ukArr = {};
var idCardSame = true;//CA信息与当前登录人信息是否一致
var certs,signState,isAvoid,remarks;
var CAcf = null;
var isCloseSign = true;
var userInfo = entryInfo();
$(function(){
	getSignState();
})
//评委签到信息查询
function getSignState(){
	var param = {};	
	if(isAvoid && isAvoid != ''){
		param.isAvoid = isAvoid;
	}
	console.log(isAvoid)
	if(remarks && remarks.length > 0){
		param.remarks = remarks;
	}
	param.expertId = expertIds;
	reviewFlowNode(param, signStateUrl, function(data){
		// origSingUrl 未签章文件url   singUrl   保存的是签名后的 pdf
		promisePdfUrl = data.origSingUrl?data.origSingUrl:"";
		if(data.signResult == 0){//未签到时获取未签到承诺书pdf
			if(progressList.checkReport=='未完成'){//评审未结束
				if(isAvoid && isAvoid != ''){
					$('#btnSign').show();
					var signSeconds = 60;
					if(signTimer == ''){
						signTimer = setInterval(function() {
							signSeconds--;
							if(signSeconds <= 0) {
								clearInterval(signTimer);
								$("#btnSign").attr("disabled",false).html('<span class="glyphicon glyphicon-saved"></span>签章');
							} else {
								$("#btnSign").attr("disabled",true);
								// $("#btnSms").attr("style", "border-left: 1px solid !important;background-color: #E2E2E2 !important;");
								$("#btnSign").html(signSeconds + "秒");
							}
						}, 1000);
					}
					$('#btnConfirm').hide();
					top.layer.alert("回避信息确认完毕，请继续“签章”完成承诺书签订",{title:"操作提醒"})
					isAvoid = '';
					remarks = '';
				}else{
					$('.signBtn').show();
					$('#btnSign').hide();
					if(signTimer != ''){
						clearInterval(signTimer);
					};
					$('#btnConfirm').show();
				}
			}else{
				$('.signBtn').hide();
			}
			$('#signPromiseBox').show();
			$('#signPromiseBox').attr("src",siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+(data.origSingUrl?data.origSingUrl:''));
		}else if(data.signResult == 1){
			//评委签到后可查看项目相关信息与招标文件
			$('.signBtn').hide();
			$('#signPromiseBox').show();
			$('#signPromiseBox').attr("src",siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+(data.singUrl?data.singUrl:''));
		}
	},true);
}
$('#btnSign').click(function(){
	new CA().signature(function(publicKey){
		let data;
		let icardno = "";
		if(expertCA){
			icardno = userInfo.identityCardNum
		}
		var param = {
			// "nodeType":"signPromise",
			// "method":"getSign",
			"publicKey":publicKey,
			"expertId": expertIds
		};
		reviewFlowNode(param, getSignUrl, function(res){
			data = res;
		});
		if(data){
			return data;
		}else{
			throw new Error("");
		}
	}, function(params){
		let data;
		var param = {
			// "nodeType":"signPromise",
			// "method":"sign",
			"pdfId":params.pdfId,
			"sigString":params.sigString,
			"caCode":params.caCode,
			"caDn":params.caDn,
			"expertId": expertIds
		};
		reviewFlowNode(param, signUrl, function(res){
			data = res;
		});
		if(data){
			return data;
		}else{
			throw new Error("");
		}
	}, function(){
		return {};
	}, function(url){
		$('#btnPromise').remove();
		$('#btnSign').remove();
		openSignPromise(url);
		top.layer.alert('温馨提示：签章成功！');
	},icardno);
})

function openSignPromise(singUrl){
	$("#signPromiseBox").attr("src", siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+singUrl);
}
//点击确认回避信息
$('body').on('click','#btnConfirm',function(){
	$('#show_open').show();
	top.layer.open({
		type: 2,
		// title: "确认回避信息",
		title: false,
		closeBtn: 0,//不显示关闭按钮
		area: ['500px', '330px'],
		id: 'avoidConfirm',
		// btn:['确定','取消'],
		shadeClose: false,//点击遮罩层关闭
		maxmin: false,
		resize: false,
		content: confirmAvoidHtml,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function(data){
				isAvoid = data.isAvoid;
				remarks = data.remarks;
				getSignState()
			})
		},
		end: function(){
			$('#show_open').hide();
		}
	});
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

		//获取证书//certsCFCA.SelectCertificateDialog();
		var caOwner = CryptoAgent.GetSignCertInfo('SubjectCN');
		ukArr.dn = CryptoAgent.GetSignCertInfo('SubjectCN');
		ukArr.cn = CryptoAgent.GetSignCertInfo('SerialNumber');

		ukArr.icardno= caOwner.split("@")[2].substring(1,caOwner.split("@")[2].length);
		if(userInfo.identityCardNum != ukArr.icardno){
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