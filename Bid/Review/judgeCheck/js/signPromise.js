/**
*  dengqiang
*  2020-01-21
*  评委签订承诺书
*  方法列表及功能描述
* 进入页面后根据地址栏携带过来的参数获取线上承诺书->展示线上承诺书->签章->提交（验证是否签章）
*/
var avoidHtml="Review/judgeCheck/model/avoid.html";//回避单位 avoidHtml
var pdfSaveUrl = config.Reviewhost + '/PdfService.do';//签完章后的保存路径
var ukArr = {};
var idCardSame = true;//CA信息与当前登录人信息是否一致
var certs,signState;
//$('#UCAPI').height(($(window).height()-$('#contents .mainTable').height()-75)+'px');
$('#btn-box').on('click','#btnSign',function(){
	CFCAloading();
	$('#CryptoAgent').remove();
	if(expertCA){
		if(!idCardSame){
			alert('温馨提示：使用的CA与当前登录人信息不一致，请更换CA或重新登录！');
			return
		}
	}
	if(document.getElementById("UCAPI")){
		var WebPDF = '';
		if (isIe()) { //IE
			WebPDF = document.getElementById("UCAPI");
		} else {
			WebPDF = new CerticateCollectionX();
		}
		WebPDF.WebSetMsgByName('PACKAGE_ID',bidSectionId);
		WebPDF.WebSetMsgByName('BASE_PATH','/'+bidSectionId+'/503');
		WebPDF.WebSetMsgByName('SIGN_TYPE','503');
		WebPDF.WebSetMsgByName('EXAM_TYPE',examType);
		WebPDF.WebSetMsgByName('CA_DN',ukArr.dn);
		WebPDF.WebSetMsgByName('CA_CODE',ukArr.cn);
		WebPDF.IsShowInputBox = true;
		var signResult = WebPDF.CreateSignature(0,"",1,0,"评委签章", "1");
//		var signResult=WebPDF.SeriesSignature(1, WebPDF.PageCount, 0, "", 2, pagePosData, "1-" + WebPDF.PageCount);
		//判断签章是否成功
		if(signResult == 0){
			if(WebPDF.webSave()){
				$('#btnPromise').remove();
				$('#btnSign').remove();
				alert('温馨提示：签章成功！');
			}else{
				alert('温馨提示：'+WebPDF.Status);
			}
		}else{
			WebPDF.GetErrorString(signResult);
		}
		
	}
})
function signPromise(node){
	if(reviewRoleType == 1 || reviewRoleType == 2){
        expert();
	}else{
        notExpert();
	}
    function notExpert(){
		if($("#expertSignPtomiseList").length == 0){
            $("#content").load('model/signPromise/notExpert.html', function(){
                getPromise();
            });
		}
        $('#btn-box').load('model/signPromise/button.html');
    }

	function expert(){
		$('#btn-box').load('model/signPromise/button.html');
        $("#content").load('model/signPromise/expert.html',function(){
            var WebPDF = document.getElementById("UCAPI");
            if(WebPDF && WebPDF.ShowMenus){
                WebPDF.ShowMenus = 0 ; //菜单栏隐藏
                WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
                WebPDF.ShowTools = 0 ;//标准工具栏隐藏
                WebPDF.ShowSides = 0 ;//侧边栏可见
                WebPDF.WebUrl= $.parserUrlForToken(pdfSaveUrl);
                WebPDF.RecordId =  bidSectionId;
                getSignState(WebPDF);
            }
        });
    }

	//评委签到信息查询
	function getSignState(WebPDF){
		var param = {
			"nodeType":"signPromise",
			"method":"getSignInInfo",
		};
        reviewFlowNode(param, function(data){
            if(data.signResult == 0){//未签到时获取未签到承诺书pdf
                if(isEnd==0){//评审未结束
                    $('.signBtn').show();
                }else{
                    $('.signBtn').hide();
                    WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
                    WebPDF.ShowMenus = 0 ; //菜单栏隐藏
                }
                $('.noReview').hide();
                WebPDF.WebOpenUrlFile(top.config.FileHost + "/fileView" + data.singUrl);
            }else if(data.signResult == 1){
                //评委签到后可查看项目相关信息与招标文件
                $('.noReview').show();
                $('.signBtn').hide();
                WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
                WebPDF.ShowMenus = 0 ; //菜单栏隐藏
                WebPDF.WebOpenUrlFile(top.config.FileHost + "/fileView" + data.singUrl);
            }
		},true);
	}

    function getPromise(){
        var param = {
            "nodeType":"signPromise",
            "method":"findSignInList",
        };
        reviewFlowNode(param, function(data){
            signHtml(data);
        },true);
    }

    function signHtml(expertList){
        $("#expertSignPtomiseList").bootstrapTable({
            columns: [{
                title: '序号',
                width: '50px',
                cellStyle: {
                    css: {
                        "text-align": "center"
                    }
                },
                formatter: function(value, row, index) {
                    return index + 1;
                }
            },{
                field: 'expertName',
                title: '评委姓名',
                 width: '100',
            },{
                field: 'expertType',
                title: '类型',
                width: '100',
				align: 'center',
                formatter: function(value, row, index) {//1为在库专家，2为招标人代表
                    if(value == 1){
                    	return '在库专家'
					}else if(value == 2){
                        return '招标人代表'
					}
                }
            },{
                field: 'idCard',
                title: '身份证号',
                width: '200',
				align: 'center',
                
            },{
                field: 'signTel',
                title: '联系方式',
                width: '150',
				align: 'center',
            },{
                field: 'signTime',
                title: '签到时间',
                width: '150',
				align: 'center'
            },{
                field: 'signResult',
                title: '状态',
                width: '80',
				align: 'center',
                formatter: function(value, row, index) {
                    if(value == 1){
                    	return '<span class="text-success">已签到</span>'
					}else{
                        return '未签到'
					}
                }
            },{
				field: 'singUrl',
				title: '操作',
				width: '80',
                align: 'center',
                events: {
                    'click .btnPromiseView': function(e,value, row){
                        parent.previewPdf(value, "100%", "100%");
                    }
                },
                formatter: function(value, row, index) {
                    if(row.signResult == 1){
                        return '<button type="button" class="btn btn-primary btnPromiseView" style="display: inline-block;">查看</button>';
                    }else{
                        return ''
                    }
                }
			},
            ]
        });
        $("#expertSignPtomiseList").bootstrapTable('load',expertList)
    }
    return true;
}


//查看回避单位
$("#btn-box").on('click','#avoidBtn',function(){
    $('#content').hide();
    top.layer.open({
        type: 2,
        title: "查看回避单位",
        area: ['1000px','600px'],
        resize: false,
        content: avoidHtml + "?bidSectionId=" + bidSectionId+"&examType=" + examType,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
        },
        end:function(layero, index){
            $('#content').show();
            supplierdiv(supplierArrId)
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
				alert("温馨提示：CA签名异常");
				return;
			}
			var errorDesc = certsCFCA.GetLastErrorDesc();
			alert('温馨提示：'+errorDesc);
		}
	}


