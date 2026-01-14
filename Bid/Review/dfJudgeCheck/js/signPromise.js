/**
 *  dengqiang
 *  2020-01-21
 *  评委签订承诺书
 *  方法列表及功能描述
 * 进入页面后根据地址栏携带过来的参数获取线上承诺书->展示线上承诺书->签章->提交（验证是否签章）
 */
var avoidHtml="Review/judgeCheck/model/avoid.html";//回避单位 avoidHtml
var pdfSaveUrl = config.Reviewhost + '/PdfService.do';//签完章后的保存路径
var confirmAvoidHtml = "Review/dfJudgeCheck/model/confirmAvoid.html";//确认回避信息 页面，签订承诺书之前
var reSignUrl = config.Reviewhost + "/resetSignIn.do";//项目经理点击重签时请求接口
var recordUrl = config.Reviewhost + "/findAllSignInLogs.do";//评委承诺书签订记录
var promisePdfUrl = '';//承诺书地址
var ukArr = {};
var idCardSame = true;//CA信息与当前登录人信息是否一致
var certs,signState,isAvoid,remarks;
var timer="";
//$('#UCAPI').height(($(window).height()-$('#contents .mainTable').height()-75)+'px');
$('#btn-box').on('click','#btnSign',function(){
	new CA().signature(function(publicKey){
		let data;
		let icardno = "";
		if(expertCA){
			icardno = userInfo.identityCardNum
		}
		var param = {
			"nodeType":"signPromise",
			"method":"getSign",
			"publicKey":publicKey
		};
		reviewFlowNode(param, function(res){
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
			"nodeType":"signPromise",
			"method":"sign",
			"pdfId":params.pdfId,
			"sigString":params.sigString,
			"caCode":params.caCode,
			"caDn":params.caDn
		};
		reviewFlowNode(param, function(res){
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
	$("#signPromise").attr("src", siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+singUrl);
}
//点击确认回避信息
$('#btn-box').on('click','#btnConfirm',function(){
	$('#show_open').show();
	top.layer.open({
		type: 2,
		// title: "确认回避信息",
		title: false,
		closeBtn: 0,//不显示关闭按钮
		area: ['500px', '330px'],
		// btn:['确定','取消'],
		shadeClose: false,//点击遮罩层关闭
		resize: false,
		content: confirmAvoidHtml,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function(data){
				isAvoid = data.isAvoid;
				remarks = data.remarks;
				signPromise()
			})
		},
		end: function(){
			$('#show_open').hide();
		}
	});
});
function signPromise(node){
	if(reviewRoleType == 1 || reviewRoleType == 2){
		expert();
	}else{
		notExpert();
	}
	function notExpert(){
		// if($("#expertSignPtomiseList").length == 0){
		$("#content").load('model/signPromise/notExpert.html', function(){
			getPromise();
			getRecord();
		});
		// }
		$('#btn-box').load('model/signPromise/button.html');
	}

	function expert(){
		$('#btn-box').load('model/signPromise/button.html');
		$("#content").load('model/signPromise/expert.html',function(){
			getSignState()
		});
	}

	//评委签到信息查询
	function getSignState(){
		var param = {
			"nodeType":"signPromise",
			"method":"getSignInInfo"
		};
		if(isAvoid && isAvoid != ''){
			param.isAvoid = isAvoid;
		}
		if(remarks && remarks.length > 0){
			param.remarks = remarks;
		}
		reviewFlowNode(param, function(data){
			// origSingUrl 未签章文件url   singUrl   保存的是签名后的 pdf
			promisePdfUrl = data.origSingUrl?data.origSingUrl:"";
			if(data.signResult == 0){//未签到时获取未签到承诺书pdf
				if(isEnd==0){//评审未结束
					if(isAvoid && isAvoid != ''){
						$('#btnSign').show();
						var seconds = 60;
						timer = setInterval(function() {
							seconds--;
							if(seconds == 0) {
								clearInterval(timer);
								$("#btnSign").attr("disabled",false).html('<span class="glyphicon glyphicon-saved"></span>签章');
							} else {
								$("#btnSign").attr("disabled",true);
								// $("#btnSms").attr("style", "border-left: 1px solid !important;background-color: #E2E2E2 !important;");
								$("#btnSign").html(seconds + "秒");
							}
						}, 1000);
						$('#btnConfirm').hide();
						top.layer.alert("回避信息确认完毕，请继续“签章”完成承诺书签订",{title:"操作提醒"})
						isAvoid = '';
						remarks = '';
					}else{
						$('.signBtn').show();
						$('#btnSign').hide();
						if(timer != ''){
							clearInterval(timer);
						};
						$('#btnConfirm').show();
					}
				}else{
					$('.signBtn').hide();
				}
				$('.noReview').hide();

				$('#signPromise').show();
				$('#signPromise').attr("src",siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+(data.origSingUrl?data.origSingUrl:''));
			}else if(data.signResult == 1){
				//评委签到后可查看项目相关信息与招标文件
				$('.noReview').show();
				$('.signBtn').hide();

				$('#signPromise').show();
				$('#signPromise').attr("src",siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+(data.singUrl?data.singUrl:''));
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
				align: 'center',
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
				formatter: function(value, row, index) {
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
				field: 'isAvoid',
				title: '有无回避条款情况(有/无)',
				width: '80',
				align: 'center',
				formatter: function(value, row, index) {
					if(value == '1'){
						return '有'
					}else if(value == '0'){
						return '无'
					}
				}
			},{
				field: 'signResult',
				title: '状态',
				width: '80',
				align: 'center',
				formatter: function(value, row, index) {
					if(value == 1){
						return '<span class="text-success">已签到</span>'
					}else {
						if(row.singUrl){
							return '<span class="text-success" style="color:orange">重签中</span>'
						}else{
							return '未签到'
						}
					}
				}
			},{
				field: 'singUrl',
				title: '操作',
				width: '200',
				align: 'center',
				events: {
					'click .btnPromiseView': function(e,value, row){
						parent.openPreview(value, "100%", "100%");
					},
					//重新签订
					'click .reSignPromise': function(e,value, row){
						var html = '<div style="padding:10px;"><div style="margin-bottom:10px;"><i class="red">*</i>重签原因：</div><div><textarea rows="5" cols="" style="resize: none;width: 100%;border-radius: 4px !important;padding:5px;" name="reason"></textarea></div></div>';
						top.layer.open({
							type: 1,
							title: '重签原因',
							area: ['500px', '400px'],
							resize: false,
							content: html,
							btn:['确定','取消'],
							success: function(layero, index) {
								//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
							},
							yes: function(index, layero) {
								// var iframeWin = layero.find('iframe')[0].contentWindow;
								var reason = $.trim(layero.find('[name=reason]').val());
								if(reason == ''){
									top.layer.alert('温馨提示：请输入重签原因！');
									return
								};
								if(reason.length > 100){
									top.layer.alert('温馨提示：重签原因不得超过100个字！');
									return
								};
								var postData = {
									/* 'bidSectionId': bidSectionId,
									'examType': examType, */
									'expertId': row.expertId,
									'resetRemarks':reason
								};
								setReSign(postData, getPromise);
								top.layer.close(index);
							},

						})
					}
				},
				formatter: function(value, row, index) {
					var view = '<button type="button" class="btn btn-primary btnPromiseView" style="display: inline-block;">查看</button>';
					var reSign = '<button type="button" class="btn btn-warning reSignPromise" style="display: inline-block;">重新签订</button>';
					if(row.signResult == 1){
						if(checkResult == 2){//已下达评标指令
							return view
						}else{
							if(reviewRoleType == 4){
								return view + reSign
							}else{
								return view
							}

						}
					}else{
						if(value){
							return view
						}else{
							return ''
						}
					}
				}
			},
			]
		});
		$("#expertSignPtomiseList").bootstrapTable('load',expertList)
	};
	//评委承诺书签订记录
	function getRecord(){
		var param = {
			"nodeType":"signPromise",
			"method":"findAllSignInLogs",
		};
		reviewFlowNode(param, function(data){
			signRecord(data);
		},true);
		/* $.ajax({
			type:"get",
			url: recordUrl,
			async: true,
			data:{
				'bidSectionId':bidSectionId,
				'examType':examType
			},
			success:function(res){
				if(res.success){
					signRecord(res.data);
				}else{
		            top.layer.alert('温馨提示：'+res.message);
				}
			}
		}); */
	}
	function signRecord(expertLists){
		$("#expertSignRecordList").bootstrapTable({
			columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
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
				formatter: function(value, row, index) {
					if(row.isAbandon == 1){
						return value + '<span class="red">（已废弃）</span>'
					}else{
						return value
					}
				}
			},{
				field: 'signTel',
				title: '联系方式',
				width: '150',
				align: 'center',
			},{
				field: 'signTime',
				title: '签订时间',
				width: '200',
				align: 'center',

			},{
				field: 'resetRemarks',
				title: '说明',
				width: '200',
				align: 'left',
				formatter: function(value, row, index) {
					if(row.abandonReason){
						return value + '<span>；'+ row.abandonReason +'</span>'
					}else{
						return value
					}
				}
			},{
				field: 'singUrl',
				title: '操作',
				width: '80',
				align: 'center',
				events: {
					'click .btnPromiseView': function(e,value, row){
						parent.openPreview(value, "100%", "100%");
					},
				},
				formatter: function(value, row, index) {
					var view = '<button type="button" class="btn btn-primary btnPromiseView" style="display: inline-block;">查看</button>';
					return view
				}
			},
			]
		});
		$("#expertSignRecordList").bootstrapTable('load',expertLists)
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
			alert("CA签名异常");
			return;
		}
		var errorDesc = certsCFCA.GetLastErrorDesc();
		alert(errorDesc);
	}
}

/* 重签 */
function setReSign(data, callback){
	var param = {
		"nodeType":"signPromise",
		"method":"resetSignIn",
	};
	$.extend(param, data)
	reviewFlowNode(param, function(data){
		callback();
	},true);
	/* $.ajax({
		url: reSignUrl,
		type: "POST",
		data: data,
		async: true,
		success: function (data) {
			if(data.success){
				callback();
			}else{
				parent.layer.alert('温馨提示：' + data.message)
			}
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	}); */
}