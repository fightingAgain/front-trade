
var saveUrl = config.tenderHost + '/SupplierSignController/insertSupplierSign.do';//添加报名信息接口


var packageId;
//var noticeId;
var bidFileId;
var pageFileDownLoad = 'Bidding/BidFile/BidFileGet/model/FileDownloadList.html';

$(function () {
	//回显默认数据
	var enterArry = entryInfo();
	$("input[name='enterpriseName']").val(enterArry.enterpriseName);
	/* $("input[name='enterpriseEmail']").val(enterArry.enterpriseEmail);
	$("input[name='agentName']").val(enterArry.userName);
	$("input[name='agentTel']").val(enterArry.tel); */

	// 获取连接传递的参数
	if ($.getUrlParam("bidFileId") && $.getUrlParam("bidFileId") != "undefined") {
		bidFileId = $.getUrlParam("bidFileId");
	}

	// 获取连接传递的参数
	if ($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined") {
		packageId = $.getUrlParam("packageId");
	}

	// 获取连接传递的参数
	/*if($.getUrlParam("noticeId") && $.getUrlParam("noticeId") != "undefined"){
	  noticeId =$.getUrlParam("noticeId") ;
  };*/
	//页面表单验证
	$("#DownloadReportInfo").bootstrapValidator({
		//live: 'submitted',//验证时机，enabled是内容有变化就验证（默认），disabled和submitted是提交再验证  
		excluded: [':disabled', ':hidden', ':not(:visible)'], //排除无需验证的控件，比如被禁用的或者被隐藏的  
		submitButtons: '#btnSubmit', //指定提交按钮，如果验证失败则变成disabled，但我没试成功，反而加了这句话非submit按钮也会提交到action指定页面  
		message: '通用的验证失败消息', //好像从来没出现过  
		feedbackIcons: { //根据验证结果显示的各种图标  
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			agentName: {
				validators: {
					callback: {
						callback: function (value, validators) {
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
			}
		}
	});

	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
});

function getMethod(callback) {
	$("#btnSubmit").click(function () {
		//进行表单验证
		$("#DownloadReportInfo").bootstrapValidator('validate');
		//获取验证结果，如果成功，执行下面代码  
		if ($("#DownloadReportInfo").data('bootstrapValidator').isValid()) {

			var enterpriseName = $("input[name='enterpriseName']").val();
			var enterpriseEmail = $("input[name='enterpriseEmail']").val();
			var agentName = $("input[name='agentName']").val();
			var agentTel = $("input[name='agentTel']").val();


			parent.layer.confirm('确定提交保存?', {
				icon: 3,
				title: '询问'
			}, function (index) {
				parent.layer.close(index);
				$.ajax({
					url: saveUrl,
					type: "post",
					data: {
						//noticeId:noticeId,
						bidSectionId: packageId,
						linkMen: agentName,
						linkTel: agentTel,
						linkEmail: enterpriseEmail,
						examType: '1'
					},
					success: function (data) {
						if (data.success == false) {
							parent.layer.alert(data.message);
							return;
						}
						callback()

						/*parent.layer.alert('提交成功', {icon: 1,title: '提示'});*/
						var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
						parent.layer.close(index); //再执行关闭  


					},
					error: function (data) {
						parent.layer.alert("加载失败", { icon: 2, title: '提示' });
					}
				});

			});
		}

	});
}
//确定按钮





