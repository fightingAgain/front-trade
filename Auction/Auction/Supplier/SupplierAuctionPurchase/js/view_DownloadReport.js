var UrlsaveFileDownload = config.AuctionHost + "/BidFileDownloadController/saveBidFileDownload.do"
var dowoloadFileUrl = config.FileHost + '/FileController/download.do';
var urlfindBidFileDownload = config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //查询文件下载记录
/*
 * 保存  提交按钮
 * */
$("#btn_submit").click(function () {
	console.log(rowData)
	//进行表单验证
	$("#DownloadReportInfo").bootstrapValidator('validate');
	//获取验证结果，如果成功，执行下面代码  
	if ($("#DownloadReportInfo").data('bootstrapValidator').isValid()) {

		Save();
	};
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var examType = getUrlParam("examType");
var type = getUrlParam("type");
var rowData;
var packageId = getUrlParam("packageId");
var projectId = getUrlParam("projectId");
var subDate;
var isShowCard='1';
var isPayDeposit = getUrlParam("isPayDeposit");//是否缴纳保证金
$(function(){
	if(projectId&&packageId){
		var supplierLinkData = getHideSupplierLinkBidPriceCard(projectId,packageId,'1','1');
		isShowCard=supplierLinkData.isShowCard||supplierLinkData.isShowCard==0?supplierLinkData.isShowCard:1;
	}
	
	if(isShowCard=='0'){
		$('.isShowCard').show()
	}
	$("[name='linkCardType']").change(function() {
		$('#DownloadReportInfo').data('bootstrapValidator').updateStatus('linkCard', '*')
		$("input[name='linkCard']").val('')
	});
})

var isQd = false;
//添加函数
function Save() {

	$.ajax({
		type: "post",
		url: UrlsaveFileDownload,
		datatype: 'json',
		data: {
			"packageId": rowData.modelId,
			"fileId": rowData.id,
			'linkMan': $("#linkMan").val(),
			'linkTel': $("#linkTel").val(),
			'linkEmail': $("#linkEmail").val(),
			'linkCardType':$("input[name='linkCardType']:checked").val(),
			'linkCard': $("input[name='linkCard']").val()
		},
		async: false,
		success: function (data) {
			if (data.success) {
				if (isQd) {
					var newUrl = config.FileHost + "/FileController/qdjjExportDownload.do" + "?ftpPath=" + rowData.filePath + "&fname=" + rowData.fileName + "&packageId=" + packageId;
				} else {
					var newUrl = config.FileHost + "/FileController/download.do" + "?ftpPath=" + rowData.filePath + "&fname=" + rowData.fileName;
				}
				window.location.href = $.parserUrlForToken(newUrl);
				findCode();
			} else {
				top.layer.close(index);
				parent.layer.alert(data.message)
			}
		}
	});

}
function findCode() {
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/ProjectReviewController/findCode.do",
		data: {
			"packageId": packageId,
			"projectId": projectId,
			'tenderType': 1,
		},
		async: false,
		dataType: "json",
		success: function (response) {
			if (response.success) {
				if (response.data == "200") {
					var index = top.layer.getFrameIndex(window.name);
					top.layer.close(index);
				} else {
					parent.layer.confirm('本项目的保证金帐号已生成，请到“保证金管理(虚拟子帐号)-查看项目保证金”中查看！', {
						btn: ['查看项目保证金金额帐号信息', '关闭'] //可以无限个按钮
					}, function (index, layero) {
						rows = {
							'id': packageId,
							'subDate': rowData.subDate,
							'tenderType': 1
						}
						var viewUrl = "Bond/tenderCashList/model/tenderCashView.html?tenderType=1"; // 查看
						parent.layer.open({
							type: 2,
							title: '查看项目保证金',
							area: ['100%', '100%'],
							maxmin: false,
							resize: false,
							closeBtn: 1,
							content: viewUrl,
							success: function (layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								//调用子窗口方法，传参
								iframeWin.passMessage(rows);

							}
						});
						parent.layer.close(index);
					}, function (index) {
						parent.layer.close(index);
					});
				}
			} else {
				parent.layer.alert(response.message)
				var index = top.layer.getFrameIndex(window.name);
				top.layer.close(index);
			}
		}
	});
}
//页面表单验证
$("#DownloadReportInfo").bootstrapValidator({
	//live: 'submitted',//验证时机，enabled是内容有变化就验证（默认），disabled和submitted是提交再验证  
	excluded: [':disabled', ':hidden', ':not(:visible)'], //排除无需验证的控件，比如被禁用的或者被隐藏的  
	submitButtons: '#btn_submit', //指定提交按钮，如果验证失败则变成disabled，但我没试成功，反而加了这句话非submit按钮也会提交到action指定页面  
	message: '通用的验证失败消息', //好像从来没出现过  
	feedbackIcons: { //根据验证结果显示的各种图标  
		valid: 'glyphicon glyphicon-ok',
		invalid: 'glyphicon glyphicon-remove',
		validating: 'glyphicon glyphicon-refresh'
	},
	fields: {
		linkMan: {
			validators: {
				callback: {
					callback: function(value, validators) {
						var regex = /\d/;
						var label = '联系人';
						function charLength(str) {
							var len = 0;
							str = String(str);
							for (var i = 0; i < str.length; i++) {
								if ((str.charCodeAt(i) >= 0x4E00) && (str.charCodeAt(i) <= 0x9FBF)) { 
									len += 2; 
								} else {
									len++; 
								}
							}
							return len;
						}
						var userName = $.trim(value) || '';
						var message = '';
						if (userName == '') {
							message = '请输入' + label;
						} else if (charLength(userName) < 3) {
							message = label + '名称必须大于2个字符';
						} else if (regex.test(userName)) {
							message = '请输入正确的' + label + '姓名格式';
						} else if (userName.length > 25) {
							message = label + '名称不能超过25个字符';
						}
						if (message) {
							return {
								valid: false,
								message: message
							}
						}
						return true;
					}
				}
			}
		},
		linkTel: {
			validators: {
				notEmpty: {
					message: '联系方式(手机号)不能为空'
				},
				regexp: {
					regexp: /^1[3456789]\d{9}$/,
					message: '请输入正确的联系电话格式'
				}
			}
		},
		linkEmail: {
			validators: {
				notEmpty: {
					message: '常用邮箱不能为空'
				},
				regexp: {
					regexp: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
					message: '请输入正确的邮箱格式'
				}
			}
		},
		linkCard: {
			validators: {
				callback: {
					callback: function(value, validators) {
						if(isShowCard=='0'){
							var regex = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/
							var linkCardType = $("input[name='linkCardType']:checked").val();
							console.log(linkCardType)
							var message = '';
							var linkCard = $.trim(value|| '') ;
							if (linkCard == '') {
								message = '请输入证件号码';
							}
							if(linkCardType=='0'){
								if (!regex.test(linkCard)) {
									message = '请输入正确的证件号码格式';
								}
							}
							if (message) {
								return {
									valid: false,
									message: message
								}
							}
						}
						return true;
					}
				},
				
				
			}
		}
	}
});

//关闭按钮
$("#btn_close").click(function () {
	//top.layer.close(top.layer.index);
	top.layer.close(parent.layer.getFrameIndex(window.name));
});
