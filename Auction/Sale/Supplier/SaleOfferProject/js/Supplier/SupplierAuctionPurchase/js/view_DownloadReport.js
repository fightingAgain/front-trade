var UrlsaveFileDownload = config.AuctionHost + "/BidFileDownloadController/saveBidFileDownload.do"
var dowoloadFileUrl = config.FileHost + '/FileController/download.do';
var urlfindBidFileDownload = config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //查询文件下载记录
/*
 * 保存  提交按钮
 * */
$("#btn_submit").click(function() {
	//进行表单验证
	$("#DownloadReportInfo").bootstrapValidator('validate');
	//获取验证结果，如果成功，执行下面代码  
	if($("#DownloadReportInfo").data('bootstrapValidator').isValid()) {
		
		Save();
	};
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var examType = getUrlParam("examType");
var type = getUrlParam("type");
var rowData

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
		},
		async: false,
		success: function(data) {
			if(data.success) {
				
				var newUrl = dowoloadFileUrl + "?ftpPath=" + rowData.filePath + "&fname=" +rowData.fileName ;
				window.location.href =$.parserUrlForToken(newUrl);	
				var index = top.layer.getFrameIndex(window.name);								
				top.layer.close(index);			
				// top.layer.alert('下载成功！');												
			} else {
				parent.layer.alert(data.message)
				top.layer.close(index);
				// top.layer.alert('下载失败！');
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
				notEmpty: {
					message: '联系人名称不能为空'
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
		}
	}
});

//关闭按钮
$("#btn_close").click(function() {
	//top.layer.close(top.layer.index);
	top.layer.close(parent.layer.getFrameIndex(window.name));
});
