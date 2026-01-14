
var saveUrl = top.config.tenderHost + '/SupplierSignController/insertSupplierSign.do';//添加报名信息接口
var moreSaveUrl = top.config.tenderHost + '/SupplierSignController/saveSupplierSignItem.do';//添加报名信息接口

var packageId;
//var noticeId;
var bidFileId;
var pageFileDownLoad = 'Bidding/BidFile/BidFileGet/model/FileDownloadList.html';
var isShowCard='1';
var source;//2  多次采集
$(function () {
	//回显默认数据
	var enterArry = entryInfo();
	
	$("input[name='enterpriseName']").val(enterArry.enterpriseName);
	if(isShowCard=='0'){
		$('.isShowCard').show()
	}
	$("[name='linkCardType']").change(function() {
		$('#formFile').data('bootstrapValidator').updateStatus('linkCard', '*')
		$("input[name='linkCard']").val('')
	});
	
	// 获取连接传递的参数
	if ($.getUrlParam("bidFileId") && $.getUrlParam("bidFileId") != "undefined") {
		bidFileId = $.getUrlParam("bidFileId");
	}

	// 获取连接传递的参数
	if ($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined") {
		packageId = $.getUrlParam("packageId");
	}
	if($.getUrlParam("source") == 2){//多次采集
		source = 2;
		isShowCard='0';
	}else{
		if(packageId){
			var supplierLinkData = getHideSupplierLinkBiddingCard(packageId,'2');
			isShowCard=supplierLinkData.isShowCard||supplierLinkData.isShowCard==0?supplierLinkData.isShowCard:1;
		}
	}
	
	
	if(isShowCard=='0'){
		$('.isShowCard').show()
	}
	// 获取连接传递的参数
	/*if($.getUrlParam("noticeId") && $.getUrlParam("noticeId") != "undefined"){
	  noticeId =$.getUrlParam("noticeId") ;
  };*/


	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	$("#formFile").bootstrapValidator({
		feedbackIcons: {
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			agentName: {
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
			agentTel: {
				validators: {
					notEmpty: {
						message: '联系电话不能为空'
					},
					regexp: {
						regexp: /^1[3456789]\d{9}$/,
						message: '请输入正确的联系电话格式'
					}
				}
			},
			enterpriseEmail: {
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
							if(isShowCard!='1'){
								var regex = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/
								var linkCardType =$("input[name='linkCardType']:checked").val();
								var message = '';
								var linkCard = $.trim(value||"") ;
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
	})
});

function getMethod(callback) {
	$("#btnSubmit").click(function () {
		$("#formFile").bootstrapValidator('validate');
		if (!$("#formFile").data('bootstrapValidator').isValid()) {
			return;
		}
		var enterpriseName = $.trim($("input[name='enterpriseName']").val());
		var enterpriseEmail = $("input[name='enterpriseEmail']").val();
		var agentName = $("input[name='agentName']").val();
		var agentTel = $("input[name='agentTel']").val();
		var linkCardType = ''
		var linkCard = ''
		if(isShowCard=='0'){
			linkCardType =$("input[name='linkCardType']:checked").val();
			linkCard = $("input[name='linkCard']").val();
		}
		parent.layer.confirm('确定提交保存?', {
			icon: 3,
			title: '询问'
		}, function (index) {
			parent.layer.close(index);
			if (checkForm($("#formFile"))) {
				$.ajax({
					url: source == 2?moreSaveUrl:saveUrl,
					type: "post",
					data: {
						bidSectionId: packageId,
						linkMen: agentName,
						linkTel: agentTel,
						linkEmail: enterpriseEmail,
						linkCardType:linkCardType,
						linkCard:linkCard,
						examType: '2'
					},
					success: function (data) {
						if (data.success == false) {
							parent.layer.alert(data.message);
							return;
						}
						callback(true)
						var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
						parent.layer.close(index); //再执行关闭
					},
					error: function (data) {
						parent.layer.alert("加载失败", { icon: 2, title: '提示' });
					}
				});
			}

		});

	});
}
//确定按钮





