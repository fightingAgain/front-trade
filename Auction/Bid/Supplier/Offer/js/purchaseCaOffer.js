var projectID = $.query.get("key");
var packageID = $.query.get("kid");
var type = $.query.get("type");
var isAgent = $.query.get("isAgent");
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var updateOffer = top.config.bidhost + '/OfferController/insertPackageItemList.do'//
var saveflieUrl = top.config.bidhost + '/PurFileController/insertOfferFile.do';
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //采购文件分页
var deleteFileUrl = top.config.bidhost + '/OfferFileController/deleteOfferFile.do';//删除已上传文件信息
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var resetFlieUrl = config.bidhost + '/OfferController/resetOfferInfo.do';//撤回报价信息
var searchOldOfferUrl = config.bidhost + '/BidFileController/findReceiptOfferList.do';//查询撤回报价历史记录信息
var saveByExcel = config.bidhost + '/OfferController/saveOfferByExcel.do'//导入报价
var searchClearFile = config.bidhost + '/OfferClearFileController/findOfferClearFileList.do';//查询工程量清单报价文
var packageDetaileds = ""//报价明细的数据
var packageCheckLists = [];
var offerDataRows;//报价信息
var offerId;//报价信息主键
var fileData = [];
var purchaseaData;
var downloadData = [];
var isOfferDetailedItem, isOpenDarkDoc, doubleEnvelopes;//是否需要分项报价表
var offerForms, offerFile, fileUp;
var offerData = new Array();
var statats = 3;
var signStateTimer = '';
var clearFileLtst = [];//工程量清单报价文件
/** 资格后审是否加密 0不加密 1加密 */
var encipherStatus; // 是否加解密

$(function () {
	$("#packageId").val(packageID);
	$("#projectId").val(projectID);
	offer();
	if (type == "0") {
		$("#btn_reset").hide();
		$("#btnShowFile").hide();
		$("#btnDownLoad").hide();
		if (encipherStatus == 1) {
			$("#btn_submit").show();
			$("#btn_bao").hide();
			$("#btn_sign").hide();
		} else {
			$("#btn_bao").show();
			$("#btn_sign").show();
		}
		$('.uploaButton').show();
		statats = 3
	} else if (type == "1") {
		$("#btn_reset").show();
		$("#btn_close").show();
		statats = 4
	} else {
		$("#btn_close").show();
		statats = 4
	}

	getEnterpriseName('enterpriseName', packageID);//供应商名称反显，公共js public.js
	haveData();
	setHistory();
	findReceipt1();
	// findReceipt2();
	//所有代理的非招标项目，删除采购员姓名和电话字段。
	if (isAgent == 1) {
		$('.purchaserShow').hide();
	} else {
		$('.purchaserShow').show();
	}

	$(".dropdown-input-group .dropdown-menu li").click(function () {
		$(this).parent().parent().find('input').val($(this).attr('data-value'));
		$(this).parent().parent().find('.input-group-label').text($(this).text());
	})
	var clearFileInput = new FileInput();
	clearFileInput.Init();
	if (encipherStatus == 1) {
		var responseFileInput = new ResponseFileInput();
		responseFileInput.Init();
	}


});
var offerAttention = [];
function offer() {
	$.ajax({
		url: config.bidhost + '/PurchaseController/findProjectPackageListAim.do',
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'packageId': packageID,
		},
		success: function (data) {
			for (key in data.data) {
				$("#" + key).html(data.data[key])
			}
			isOfferDetailedItem = data.data.isOfferDetailedItem;
			offerAttention = data.data.offerAttention;
			isOpenDarkDoc = data.data.isOpenDarkDoc;
			doubleEnvelopes = data.data.doubleEnvelope;
			purchaseaData = data.data;
			encipherStatus = data.data.encipherStatus;
			packageDetaileds = data.data.packageDetaileds;
			if (purchaseaData.isHasDetailedListFile && purchaseaData.isHasDetailedListFile == 1 && encipherStatus != 1) {//有清单
				$('.manifestShow').show();
				getClearFiles();
			};
		}
	});
};
//临时保存报价文件
$("#btn_bao").click(function () {
	add_file(0);
	$('#offerState').val(0);
	$('.fileState').val(0);
	$.ajax({
		url: updateOffer,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			};
			if (data.success == true) {
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				parent.layer.alert('保存成功');
				// haveData();
				// fileDataBtn();
			};
		},
		error: function (data) {
			parent.layer.alert("保存失败");
		}
	});
})
//报价表
function offerFormData() {
	if (encipherStatus == 1) return;
	$("#offerForm").offerForm({
		viewURL: config.bidhost + '/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter: {//接口调用的基本参数
			packageId: packageID,
			projectId: projectID,
			examType: 1,
		},
		status: statats,//1为编辑2为查看
		tableName: 'offerTable',//表格名称
		offerData: offerData
	})
}
//报价文件目录
function offerFileList() {
	if (encipherStatus == 1) {
		encipherOfferFileList();
		return;
	}
	$("#offerFileList").offerFileList({
		status: statats,//1为编辑2为查看
		parameter: {//接口调用的基本参数
			packageId: packageID,
			projectId: projectID,
		},
		isShow: isOfferDetailedItem,//是否需要分项报价
		isDoubleEnvelope: doubleEnvelopes,
		isDarkMark: isOpenDarkDoc,
		offerAttention: offerAttention,
		// tableName: 'fileHtml',//分项报价DOM
		offerData: downloadData
	})
}

// 加密时递交响应文件的其他附件
function encipherOfferFileList() {
	if (encipherStatus != 1) return;
	$("#encipherOfferFileList").offerFileList({
		status: statats,//1为编辑2为查看
		parameter: {//接口调用的基本参数
			packageId: packageID,
			projectId: projectID,
		},
		custom: false,
		isShow: isOfferDetailedItem,//是否需要分项报价
		isDoubleEnvelope: doubleEnvelopes,
		isDarkMark: isOpenDarkDoc,
		offerAttention: offerAttention,
		// tableName: 'fileHtml',//分项报价DOM
		offerData: downloadData,
		hideColumn: ['mustUpload'],
		formatterAttachment: function (list) {
			return $.map(list, function (v) {
				v.mustUpload = 0;
				return v;
			})
		}
	})
}
//分项报价附件
function fileList() {
	if (encipherStatus == 1) return;
	$("#fileList").fileList({
		status: statats,//1为编辑2为查看
		parameter: {//接口调用的基本参数
			packageId: packageID,
			projectId: projectID,
			offerFileListId: "0"
		},
		isShow: isOfferDetailedItem,//是否需要分项报价
		offerAttention: offerAttention,
		flieName: '#fileHtml',//分项报价DOM
		offerData: downloadData
	})
}
//提交报价文件
$("#btn_submit").click(function () {
	add_file(1);
	if (top.checkForm($("#form"))) {
		if (isOfferDetailedItem == 0) {
			if ($("[name='offerFileList[0].filePath']").val() == "") {
				top.layer.alert("温馨提示：请上传分项报价表");
				return;
			}
		}
		var bidderProxy = $.trim($('input[name="bidderProxy"]').val());
		var projectLeader = $.trim($('input[name="projectLeader"]').val());

		function validateUserName(userName, label) {
			var regex = /\d/;
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
			userName = $.trim(userName) || ''
			if (userName == '') {
				top.layer.alert('温馨提示：' + '请输入' + label);
				return;
			} else if (charLength(userName) < 3) {
				top.layer.alert('温馨提示：' + label + '名称必须大于2个字符');
				return;
			} else if (regex.test(userName)) {
				top.layer.alert('温馨提示：' + '请输入正确的' + label + '姓名格式');
				return;
			} else if (userName.length > 25) {
				top.layer.alert('温馨提示：' + label + '名称不能超过25个字符');
				return;
			}
			return true;
		}
		if (!validateUserName(bidderProxy, '投标人代表')) {
			return
		}
		if (!validateUserName(projectLeader, '项目负责人')) {
			return
		}

		var bidderProxyCardType = $.trim($("#bidderProxyCardType").val())
		var bidderProxyCard = $.trim($("#bidderProxyCard").val());
		var projectLeaderCardType = $.trim($("#projectLeaderCardType").val());
		var projectLeaderCard = $.trim($("#projectLeaderCard").val());
		var IDCardRegex = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;

		// 投标人代表
		if (bidderProxyCard == '') {
			top.layer.alert('请输入投标人代表证件号码');
			return;
		}
		// 如果是身份证号
		if (bidderProxyCardType == '0') {
			if (!IDCardRegex.test(bidderProxyCard)) {
				top.layer.alert('请输入正确的投标人代表身份证号');
				return;
			}
		}

		// 项目负责人
		if (projectLeaderCard == '') {
			top.layer.alert('请输入项目负责人证件号码');
			return;
		}
		// 如果是身份证号
		if (projectLeaderCardType == '0') {
			if (!IDCardRegex.test(projectLeaderCard)) {
				top.layer.alert('请输入正确的项目负责人身份证号');
				return;
			}
		}
		$("#offerState").val(1);
		$('.fileState').val(1)
		handleSubmit();
	}
})
var CAcf = null;  //实例化CA
function handleSubmit() {
	if (encipherStatus === 1) {
		caSaveForm();
		return;
	}
	$.ajax({
		url: updateOffer,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);

			};
			if (data.success == true) {
				//生成确认回执单
				addReceipt(4, '');
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				//parent.layer.close(index);
				parent.layer.alert('报价成功');
				haveData();
				findReceipt1();
				setHistory();
				fileDataBtn()

			}

		},
		error: function (data) {
			parent.layer.alert("修改失败");
		}
	});
}

function caSaveForm(callback) {
	if (responseList.length === 0) {
		top.layer.alert("请递交响应文件", { icon: 7, title: '提示' }, function (ind) {
			parent.layer.close(ind);
		});
		return;
	}
	var loading = top.layer.load();
	if (!CAcf) {
		CAcf = new CA({
			target: "#form",
			confirmCA: function (flag) {
				if (!flag) {
					top.layer.close(loading);
					return;
				}
				if (callback) {
					savePost(callback);
				} else {
					savePost();
				}
				top.layer.close(loading);
			}
		});
	}
	CAcf.sign(null, function() {
		top.layer.close(loading);
	});
}

function savePost(callback) {
	var responseFile = responseList[0] || {};
	var params = {};
	var formArr = $('#form').serializeArray();
	$.each(formArr, function () {
		params[this.name] = this.value;
	});
	params.isEncryption = 1;
	params.originalFileUrl = responseFile.filePath;
	params.fileName = responseFile.fileName;
	params.fileSize = responseFile.fileSize;
	$.ajax({
		url: top.config.bidhost + '/OfferController/insertCaPackageItemList',
		type: 'post',
		async: false,
		data: params,
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);

			};
			if (data.success == true) {
				//生成确认回执单
				addReceipt(4, '');
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				//parent.layer.close(index);
				parent.layer.alert('报价成功');
				haveData();
				findReceipt1();
				setHistory();
				fileDataBtn()
				if (callback) {
					callback()
				}
			}
		},
		error: function (data) {
			parent.layer.alert("递交失败");
		}
	});
}

//撤回报价信息
$("#btn_reset").click(function () {
	parent.layer.confirm('提示：撤回后需重新编辑提交，请确认是否撤回？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (layerIndex, layero) {
		var resetUrl = resetFlieUrl;
		if (encipherStatus == 1) {
			resetUrl = top.config.bidhost + '/OfferController/resetCaOfferInfo';
		}
		$.ajax({
			url: resetUrl,
			type: 'post',
			async: false,
			data: {
				'id': offerId,
				'packageId': packageID,
				'projectId': projectID
			},
			success: function (data) {
				if (data.success) {
					addReceipt(5, offerId);
					$("#btn_reset, #btn_submit").hide();
					if (encipherStatus == 1) {
						$("#btn_submit").show();
						$("#btn_bao").hide();
						$("#btn_sign").hide();
					} else {
						$("#btn_bao").show();
						$("#btn_sign").show();
					}
					$('.uploaButton').show();
					$('input').attr('readonly', false);
					freshView(false);
					statats = 3;
					// downloadData = [];
					offerFormData();
					offerFileList();
					fileList();
					setHistory();
					fileTable();
					parent.layer.alert("撤回成功");
				} else {
					//parent.layer.closeAll();
					parent.layer.alert(data.message);
				}
			}
		});
	}, function (layerIndex) {
		parent.layer.close(layerIndex)
	});

})

//生成回执单操作
function addReceipt(receiptType, fileId) {
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/insertBidReceipt.do",
		data: {
			projectId: projectID,
			packageId: packageID,
			receiptType: receiptType,//资格申请回执单类型
			fileId: fileId
		},
		async: false,
		success: function (data) {
			if (data.success) {
				//top.$('#table').bootstrapTable(('refresh'));
				//top.layer.closeAll();
				//top.layer.alert("生成回执成功");
			} else {
				//top.layer.closeAll();
				/*if(data.message){
					top.layer.alert(data.message);
				}else{
					top.layer.alert("生成回执单失败");
				}*/
			}
		}
	});
}

var ReceiptData1;
function findReceipt1() {
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/findReceiptList.do",
		data: {
			projectId: projectID,
			packageId: packageID,
			receiptType: 4,//报价文件提交回执单
		},
		async: false,
		success: function (data) {
			if (data.success) {
				ReceiptData1 = data.data || [];
				if (ReceiptData1.length > 0) {
					$("#btnShowFile").show();
					$("#btnDownLoad").show();
				}
			}
		}
	});
}

var ReceiptData2;
function findReceipt2() {
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/findReceiptOfferList.do",
		data: {
			projectId: projectID,
			packageId: packageID,
			receiptType: 5,//报价文件撤回回执单
		},
		async: false,
		success: function (data) {
			if (data.success) {
				ReceiptData2 = data.data;
			}
		}
	});
}

//报价文件提交回执单预览
$("#btnShowFile").click(function () {
	if (ReceiptData1.length > 0) {
		previewPdf(ReceiptData1[0].filePath);
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + ReceiptData1[0].filePath));
	}
})

//报价文件提交回执单下载
$("#btnDownLoad").click(function () {
	if (ReceiptData1.length > 0) {
		var newUrl = downloadFileUrl + "?ftpPath=" + ReceiptData1[0].filePath + "&fname=报价文件提交回执单.pdf";
		window.location.href = $.parserUrlForToken(newUrl);
	}
})

//报价文件撤回回执单预览
function btnShowFile2(index) {
	if (ReceiptData2.length > 0) {
		for (var i = 0; i < ReceiptData2.length; i++) {
			if (index == i) {
				//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + ReceiptData2[i].filePath));
				previewPdf(ReceiptData2[i].filePath);
			}
		}
	}
}
//报价文件撤回回执单下载
function btnDownLoad2(index) {
	if (ReceiptData2.length > 0) {
		for (var i = 0; i < ReceiptData2.length; i++) {
			if (index == i) {
				var newUrl = downloadFileUrl + "?ftpPath=" + ReceiptData2[i].filePath + "&fname=" + (ReceiptData2[i].receiptType == 10 ? "签章" : "报价") + "记录回执单.pdf";
				window.location.href = $.parserUrlForToken(newUrl);
			}
		}
	}
}

//关闭按钮
$("#btn_close").on("click", function () {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
})
//导出模板
function exportExcel() {
	var url = config.bidhost + "/PackageDetailedController/outPackageDetailedByExcel.do?packageId=" + packageID;
	window.location.href = $.parserUrlForToken(url);
}
//如果有数据，则赋值
var detailLists = [];
function haveData() {
	$.ajax({
		url: config.bidhost + '/OfferController/findProjectList.do',
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectID,
			'packageId': packageID,
			'enterpriseType': '06',//识别供应商
			//'offerState':0
		},
		success: function (data) {
			if (data.success) {
				if (data.data.length > 0) {
					offerData = data.data[0];
					offerId = data.data[0].id
					//offerState报价状态   0为临时保存，1为正式提交
					if (data.data[0].offerState == 1) {
						$("#btn_reset").show();
						$("#btn_bao, #btn_submit").hide();
						$("#btn_sign").hide();
						$('input').attr('readonly', true);
						freshView(true);
						$('.uploaButton').hide();
						statats = 4
					} else {
						$("#btn_reset, #btn_submit").hide();
						if (encipherStatus == 1) {
							$("#btn_submit").show();
							$("#btn_bao").hide();
							$("#btn_sign").hide();
							$(".uploaButton").show();
						} else {
							$("#btn_bao").show();
							$("#btn_sign").show();
						}
						$('input').attr('readonly', false);
						freshView(false);
						statats = 3
					}
				}
				if (encipherStatus == 1 && offerData.originalFileUrl) {
					responseList = [{
						fileName: offerData.fileName,
						fileSize: offerData.fileSize,
						filePath: offerData.originalFileUrl,
						userName: offerData.userName,
						subDate: offerData.subDate,
					}];
					$('#md5Code').html(offerData.md5Code);
					$('#subDate').html(offerData.subDate);
				}
				/* $("input[name='legalPerson']").val(offerData.legalPerson);
				$("input[name='linkTel']").val(offerData.linkTel); */
				$("input[name='bidderProxy']").val(offerData.bidderProxy ? offerData.bidderProxy : '');//投标人代表
				$("input[name='projectLeader']").val(offerData.projectLeader ? offerData.projectLeader : '');//项目负责人

				$("#bidderProxyCardType").val(offerData.bidderProxyCardType || 0);
				$("#bidderProxyCard").val(offerData.bidderProxyCard || '');
				$("#projectLeaderCardType").val(offerData.projectLeaderCardType || 0);
				$("#projectLeaderCard").val(offerData.projectLeaderCard || '');
				initView();
			}

		}
	})
	fileDataBtn();
	offerFormData();
	offerFileList();
	fileList();
	fileTable();
	$("#offerAttention").html(purchaseaData.offerAttention);
};


function fileDataBtn() {
	$.ajax({
		url: searchUrlFile,
		type: 'get',
		async: false,
		data: {
			'projectId': projectID,
			'packageId': packageID,
			'examType': 1,
			'enterpriseType': '06',
			// 'isView': 0
		},
		success: function (data) {
			if (data.success) {
				if (data.data.length > 0) {
					downloadData = data.data
				}
			}
		}
	});
};

//挂载采购报价信息撤回请求
function setHistory() {
	$.ajax({
		type: "post",
		url: searchOldOfferUrl,
		dataType: 'json',
		data: {
			'packageId': packageID,
			'offerState': 2
		},
		async: false,
		success: function (result) {
			if (result.success) {
				findReceipt2();
				setHistoryHTML(result.data) //有记录显示
			} else {
				top.layer.alert(result.message);
			}
		}
	})
}
//挂载采购文件下载记录
function setHistoryHTML(data) {

	$("#historyTable").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [
			{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function (value, row, index) {
					return index + 1;
				}
			},
			{
				title: "操作人",
				align: "left",
				field: 'userName',
			},
			{
				title: "操作时间",
				align: "center",
				field: 'subDate',
				width: '180'
			},
			{
				field: "receiptType",
				align: "center",
				title: "状态",
				width: '100',
				formatter: function (value, row, index) {
					if (value == 4 || value == 6) {
						return "提交"
					} else if (value == 5) {
						return "撤回"
					} else if (value == 10) {
						return "签章"
					}
				}
			},
			{
				title: "操作",
				align: "center",
				width: "255",
				field: '',
				formatter: function (value, row, index) {
					//var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody = ""
					/*if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>&nbsp;&nbsp"
						}
						mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick=fileDownload(" + index + ")>下载</a>&nbsp;&nbsp";*/
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-sm' onclick='btnShowFile2(" + index + ")'>" + (row.receiptType == 10 ? "签章" : "") + "回执单预览</a>&nbsp;&nbsp"
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-sm' onclick='btnDownLoad2(" + index + ")'>" + (row.receiptType == 10 ? "签章" : "") + "回执单下载</a>&nbsp;&nbsp"
					return mixtbody;
				}
			}
		]

	})
	$("#historyTable").bootstrapTable('load', data);
	$(".fixed-table-loading").hide();
}
//excel导入

/**
   FileReader共有4种读取方法：
   1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
   2.readAsBinaryString(file)：将文件读取为二进制字符串
   3.readAsDataURL(file)：将文件读取为Data URL
   4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
*/
var wb;//读取完成的数据
var rABS = false; //是否将文件读取为二进制字符串
function importf(obj) {//导入
	if (!obj.files) {
		return;
	};
	var f = obj.files[0];
	var index1 = f.name.lastIndexOf(".");
	var index2 = f.name.length;
	var FilesName = f.name.substring(index1 + 1, index2)
	if (FilesName == 'xlsx' && FilesName == 'xls') {
		parent.layer.alert("上传文件格式错误")
		return
	}
	var formFile = new FormData();
	formFile.append("projectId", projectID);
	formFile.append("packageId", packageID);
	formFile.append("excel", f); //加入文件对象
	var data = formFile
	$.ajax({
		type: "post",
		url: saveByExcel,
		async: true,
		dataType: 'json',
		cache: false,//上传文件无需缓存
		processData: false,//用于对data参数进行序列化处理 这里必须false
		contentType: false, //必须
		data: data,
		success: function (data) {
			if (data.success == true) {
				parent.layer.alert('批量导入成功');
				var excelData = data.data;
				var result = [];
				for (var i = 0; i < excelData.length; i++) {
					if (excelData[i].saleTaxTotal == "" || !(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test(excelData[i].saleTaxTotal))) {
						$("#saleTaxTotal" + i).val(0)
					} else {
						var saleTaxTotal = excelData[i].saleTaxTotal
						$("#saleTaxTotal" + i).val(parseFloat(saleTaxTotal))
					}
					result.push(excelData[i].saleTaxTotal * 100000000);
				}
				var resultL = eval(result.join('+')) / 100000000;
				$('input[name="priceTotal"]').val(resultL);
				$('#priceTotal').html(resultL);

			} else {
				parent.layer.alert(data.message)
			}
			$('input[type="file"]').val("");
		}
	});
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$('#btn_sign').click(function () {
	//**0.询比采购 1.竞价采购 2.竞买采购 3.询价采购 4.招标采购 5.谈判采购 6.单一来源*/
	var dataParam = {
		'packageId': packageID,
		'projectId': projectID,
	};
	//查询签章文件  源  media/js/Model/public.js
	getSignFileOfBidPrice(dataParam, '0', function () {
		setHistory();
		$('#btn_sign').hide();
		$('#btn_submit').show();
	});
})


function freshView(isView) {
	if (isView) {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').attr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', true);
	} else {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').removeAttr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', false);
	}

	if (encipherStatus == 1) {
		$('.encipher-hide').hide();
		$('.encipher-show').show();
	} else {
		$('.encipher-hide').show();
		$('.encipher-show').hide();
	}
}

function initView() {
	$('.dropdown-input-group').each(function (el) {
		var val = $(this).find('input').val();
		var text = $(this).find('.dropdown-menu li[data-value= ' + val + ']').text();
		$(this).find('.input-group-label').text(text);
	})
}

var responseList = [];
var ResponseFileInput = function () {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function () {
		$("#responseFile").fileinput({
			language: 'zh', //设置语言
			uploadUrl: top.config.bidhost + "/FileController/uploadBatch.do", //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['xywj'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮
			showCaption: false, //是否显示标题
			browseClass: "btn btn-primary", //按钮样式
			dropZoneEnabled: false, //是否显示拖拽区域
			showPreview: false,
			mustUpload: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			},
		}).on("filebatchselected", function (event, files) {
			var filesnames = event.currentTarget.files[0].name.split('.')[1]
			if (event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			var file = event.currentTarget.files[0];
			if (file) {
				if (file.size > 200 * 1024 * 1024) {
					parent.layer.alert('上传文件最大为200M', {icon: 0});
					$(this).fileinput("reset"); //选择的格式错误 插件重置
					return ;
				}
			}
			
			$(this).fileinput("upload");

		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
			if (data.response.success === false) {
				parent.layer.alert(data.response.message);
				$(this).fileinput("reset");
				return;
			}
			if (data.response.success) {
				responseList = [];
				responseList.push(
					{
						fileName: data.files[0].name,
						fileSize: data.files[0].size / 1000 + "KB",
						filePath: data.response.data[0],
						userName: (top.userName || ""),
						subDate: top.$("#systemTime").html() + ' ' + top.$("#sysTime").html()
					}
				)
			}
			responseFileTable()
		}).on('filebatchuploaderror', function (event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function responseFileTable() {
	$('#responseFileTable').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",

		},
		{
			field: "fileSize",
			title: "文件大小",
			align: "center",
			halign: "center",
			width: '120px'

		},
		{
			field: "subDate",
			title: "上传时间",
			align: "center",
			halign: "center",
			width: '180px'

		},
		{
			field: "userName",
			title: "上传人",
			align: "center",
			halign: "center",
			width: '100px'

		},
		{
			field: "caoz",
			title: "操作",
			width: '200px',
			events: {
				'click .fileDownload': function (e, value, row, index) {
					var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
					window.location.href = $.parserUrlForToken(newUrl);
				},
				'click .previewFile': function (e, value, row, index) {
					openBidPricePreview(row.filePath);
				},
				'click .filedelet': function (e, value, row, index) {
					parent.layer.confirm('确定要删除该附件', {
						btn: ['是', '否'] //可以无限个按钮
					}, function (indexs, layero) {
						var itemList = new Array();
						responseList = itemList.concat(responseList);
						responseList.splice(index, 1)
						responseFileTable()
						parent.layer.close(indexs);
					}, function (indexs) {
						parent.layer.close(indexs)
					});
				},
			},
			formatter: function (value, row, index) {
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody = ""
				mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
				if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
				}
				if (statats == 3) {
					mixtbody += '<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
				}
				return mixtbody
			}

		}
		]
	});
	$('#responseFileTable').bootstrapTable("load", responseList); //重载数据
};

/* ********************    工程量清单报价文件         ******************** */
var FileInput = function () {

	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function () {
		$("#priceFileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: top.config.bidhost + "/FileController/uploadBatch.do", //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['xml', 'XML', 'hbtb', 'HBTB', 'hbkj', 'HBKJ', 'cos', 'COS'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮
			showCaption: false, //是否显示标题
			browseClass: "btn btn-primary", //按钮样式
			dropZoneEnabled: false, //是否显示拖拽区域
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			},
			//			//上传参数
			//			uploadExtraData:function(){//向后台传递参数
			//	            var path=''
			//                return path; 
			//              },

		}).on("filebatchselected", function (event, files) {
			var filesnames = event.currentTarget.files[0].name.split('.')[1]
			if (event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			$(this).fileinput("upload");

		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
			if (data.response.success === false) {
				parent.layer.alert(data.response.message);
				$(this).fileinput("reset");
				return;
			}
			if (data.response.success) {
				clearFileLtst = [];
				clearFileLtst.push(
					{
						fileName: data.files[0].name,
						fileSize: data.files[0].size / 1000 + "KB",
						filePath: data.response.data[0],
						userName: (top.userName || ""),
						subDate: top.$("#systemTime").html() + ' ' + top.$("#sysTime").html()
					}
				)
			}
			fileTable()
		}).on('filebatchuploaderror', function (event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

// 工程清单
function fileTable() {
	if (encipherStatus == 1) {
		responseFileTable();
		return;
	};
	$('#manifestTable').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "fileName",
			title: "文件名称",
			align: "left",
			halign: "left",

		},
		{
			field: "fileSize",
			title: "文件大小",
			align: "center",
			halign: "center",
			width: '120px'

		},
		{
			field: "subDate",
			title: "上传时间",
			align: "center",
			halign: "center",
			width: '180px'

		},
		{
			field: "userName",
			title: "上传人",
			align: "center",
			halign: "center",
			width: '100px'

		},
		{
			field: "caoz",
			title: "操作",
			width: '200px',
			events: {
				'click .fileDownload': function (e, value, row, index) {
					var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
					window.location.href = $.parserUrlForToken(newUrl);
				},
				'click .previewFile': function (e, value, row, index) {
					openBidPricePreview(row.filePath);
				},
				'click .filedelet': function (e, value, row, index) {
					parent.layer.confirm('确定要删除该附件', {
						btn: ['是', '否'] //可以无限个按钮
					}, function (indexs, layero) {
						var itemList = new Array();
						clearFileLtst = itemList.concat(clearFileLtst);
						clearFileLtst.splice(index, 1)
						fileTable()
						parent.layer.close(indexs);
					}, function (indexs) {
						parent.layer.close(indexs)
					});
				},
			},
			formatter: function (value, row, index) {
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody = ""
				mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
				if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
				}
				if (statats == 3) {
					mixtbody += '<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
				}
				return mixtbody
			}

		}
		]
	});
	$('#manifestTable').bootstrapTable("load", clearFileLtst); //重载数据
};
function add_file(num) {
	var hiddeninput = ""
	//上传附件的数组。拼接成可以转到后台接受的格式
	if (clearFileLtst.length > 0) {
		for (var n = 0; n < clearFileLtst.length; n++) {
			hiddeninput += '<input type="hidden" name="clearFileList[' + n + '].fileName" value="' + clearFileLtst[n].fileName + '" />'
			hiddeninput += '<input type="hidden" name="clearFileList[' + n + '].filePath" value="' + clearFileLtst[n].filePath + '" />'
			hiddeninput += '<input type="hidden" name="clearFileList[' + n + '].fileSize" value="' + clearFileLtst[n].fileSize + '" />'
			hiddeninput += '<input type="hidden" name="clearFileList[' + n + '].subDate" value="' + clearFileLtst[n].subDate + '" />'
			// hiddeninput+='<input type="hidden" name="clearFileList['+ n +'].examType" value="'+ examType +'" />'
			// hiddeninput+='<input type="hidden" name="clearFileList['+ n +'].packageId" value="'+ packageInfo.id +'" />'
			// hiddeninput+='<input type="hidden" name="clearFileList['+ n +'].projectId" value="'+ packageInfo.projectId +'" />'
			hiddeninput += '<input type="hidden" name="clearFileList[' + n + '].fileState" value="' + num + '" />'
			// if(checkTypes == 1){//重新上传
			// 	hiddeninput+='<input type="hidden" name="clearFileList['+ n +'].bidFileCheckId" value="'+ (bidFileId||"") +'" />'
			// }else{
			// 	hiddeninput+='<input type="hidden" name="clearFileList['+ n +'].bidFileCheckId" value="'+ (clearFileLtst[n].bidFileCheckId||bidFileId||"") +'" />'
			// }


		}

	}
	$("#formFile").html(hiddeninput);
};
function getClearFiles() {
	if (encipherStatus == 1) return;
	$.ajax({
		url: searchClearFile,
		type: 'post',
		dataType: 'json',
		async: false,
		data: {
			'packageId': packageID,
			'examType': 1
		},
		success: function (data) {
			if (data.success) {
				if (data.data.length > 0) {
					clearFileLtst = data.data;
					fileTable();
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}

/* ********************    工程量清单报价文件  --end         ******************** */