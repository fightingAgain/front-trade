var saveUrl = config.tenderHost + '/BidFileController/unZip.do';  //提交接口
var insertUrl = config.tenderHost + '/BidFileController/insert.do';  //保存接口
var detailUrl = config.tenderHost + '/BidFileController/getBidFileByBidId.do';  //详情接口
var historyUrl = config.tenderHost + '/BidFileLogController/get.do';  //回执单历史记录
var bidUrl = config.tenderHost + '/BidSectionController/getBidSectionByBidId.do';//查询标段相关信息

var bidSectionId = "";  //标段id
var bidFileId = "";  //业务id
var fileUploads = null;  //上传文件
var employeeInfo = entryInfo();  //企业信息
var source = "";  //1是编辑  2是查看
var filePath = ""; //文件路径
var files = "";  //上传的文件信息
var status = ""; //上传文件状态
var md5Code = "";  //是否加密
var receiptUrl = "";  //回执地址
var extFilters;
var CAcf = null;  //实例化CA

var examType = '';
var special = '';//判断是否从控制台来
var tenderProjectType;

$(function () {

	// 获取连接传递的参数
	if ($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
	}
	if ($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		bidSectionId = $.getUrlParam("id");
	}
	if ($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	if ($.getUrlParam("special") && $.getUrlParam("special") != "undefined") {
		special = $.getUrlParam("special");
	}
	if (source == 1 || special == "KZT") {
		$("#fileUp").show();
		$("#btnSubmit").show();
		freshView(false);
		$(".viewShow").show();
		status = 1;
	} else {
		$("#fileUp").hide();
		$('.red').hide();
		$("#btnSubmit").hide();
		freshView(true);
		$("[name='email']").attr("readonly", "readonly");
		$("[name='email']").addClass("readonly");
		$(".viewShow").hide();
		status = 2;
	}
	getBidInfo(bidSectionId);
	detail();
	history();

	$("[name='authorizedPerson']").val(employeeInfo.userName);
	$("[name='phone']").val(employeeInfo.tel);
	$("[name='email']").val(employeeInfo.email);

	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	//提交
	$("#btnSubmit").click(function () {
		parent.layer.confirm('确定提交?', {
			icon: 3,
			title: '询问'
		}, function (index) {
			parent.layer.close(index);
			//			saveForm();
		});
	});

	$("#formName").on("click", ".btnSee", function () {
		var url = $(this).attr("data-url");
		previewResult(url);
	});

	$("#historyTable").on("click", ".btnPrint", function () {

	});

	//打印回执
	$("#btnPrint").click(function () {
		if (receiptUrl == "") {
			top.layer.alert("请先确认递交投标文件", { icon: 7, title: '提示' }, function (ind) {
				parent.layer.close(ind);
				$('#collapseTwo').collapse('show');
			});
			return;
		}
		previewResult(receiptUrl);
	});

	$(".dropdown-input-group .dropdown-menu li").click(function () {
		$(this).parent().parent().find('input').val($(this).attr('data-value'));
		$(this).parent().parent().find('.input-group-label').text($(this).text());
	})

});
function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: bidUrl,
		async: false,
		data: {
			'id': id,
			examType: 2
		},
		success: function (data) {
			if (data.success) {
				if (data.data) {
					var arr = data.data;
					bidOpenType = arr.bidOpenType ? arr.bidOpenType : "";
					if (bidOpenType == 1) {
						extFilters = [".tbwj", ".XYTF", ".xytf"];
					} else {
						extFilters = [".pdf", ".zip", ".rar"];
					}
					$("#interiorTenderProjectCode").html(arr.interiorTenderProjectCode ? arr.interiorTenderProjectCode : "");
					$("#tenderProjectName").html(arr.tenderProjectName ? arr.tenderProjectName : "");
					$("#interiorBidSectionCode").html(arr.interiorBidSectionCode ? arr.interiorBidSectionCode : "");
					$("#bidSectionName").html(arr.bidSectionName ? arr.bidSectionName : "");
					$("#bidDocReferEndTime").html(arr.bidDocReferEndTime ? arr.bidDocReferEndTime : "");
					if (arr.tenderProjectType) {
						var tenderProjectName = "";
						tenderProjectType = arr.tenderProjectType.substring(0, 1);
						if (tenderProjectType == "A") {
							tenderProjectName = "工程";
						} else if (tenderProjectType == "B") {
							tenderProjectName = "货物";
						} else if (tenderProjectType == "C") {
							tenderProjectName = "服务";
							if (arr.tenderProjectType == "C50") {
								tenderProjectName = "广宣类";
							}
						}
						$("#tenderProjectClassifyName").html(tenderProjectName);
					}
					$("#syndicatedFlag").html(arr.syndicatedFlag == 1 ? "是" : "否");
					$("#tendererName").html(arr.tendererName ? arr.tendererName : "");
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
function uploadsFile(callback) {
	if (fileUploads) {
		return;
	}
	//上传文件
	fileUploads = new StreamUpload("#fileContent", {
		basePath: "/" + employeeInfo.enterpriseId + "/" + bidSectionId + "/205",
		businessId: bidFileId,
		status: status,
		extFilters: extFilters,
		businessTableName: 'T_BID_FILE',  //
		attachmentSetCode: 'BID_FILE',
		isMult: false,
		changeFile: function (data) {
			if (data.length > 0) {
				filePath = data[data.length - 1].url;
				$("#createDate").html(data[data.length - 1].createDate);
			}

		},
		getMd5Code: function (file) {
			md5Code = file.md5code;
			$("#md5Code").val(file.md5code);
			$("#fileName").html(file.name);
		},
		addSuccess: function (path) {
			filePath = path;
			window.setTimeout(function () {
				if (callback) {
					saveForm(callback);
				} else {
					saveForm();
				}

			}, 100);
		},
		uploadFail: function () {
			$('#fileUp').removeAttr('disabled');
		}
	});
}

function freshView(isView) {
	if (isView) {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').attr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', true);
	} else {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').removeAttr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', false);
	}
}

function initView() {
	$('.dropdown-input-group').each(function (el) {
		var val = $(this).find('input').val();
		var text = $(this).find('.dropdown-menu li[data-value= ' + val+ ']').text();
		$(this).find('.input-group-label').text(text);
	})
}

function passMessage(data, callback) {
	$('#fileUp').click(function () {
		var bidderProxy = $.trim($('#bidderProxy').val());
		var projectLeader = $.trim($('#projectLeader').val());

		var bidderProxyCardType = $.trim($("#bidderProxyCardType").val())
		var bidderProxyCard = $.trim($("#bidderProxyCard").val());
		var projectLeaderCardType = $.trim($("#projectLeaderCardType").val());
		var projectLeaderCard = $.trim($("#projectLeaderCard").val());
		
		var IDCardRegex = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;

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

		$('#fileUp').attr('disabled', 'disabled');
		if (!(bidFileId && bidFileId != "")) {
			insertForm(function () {
				uploadsFile(callback);
				$('#fileLoad').trigger('click');
			});
		} else {
			//黑名单验证
			$('#fileUp').removeAttr('disabled');
			var parm = checkBlackList(entryInfo().enterpriseCode, tenderProjectType, 'd');
			if (parm.isCheckBlackList) {
				parent.layer.alert(parm.message, { icon: 7, title: '提示' });
				return;
			}
			uploadsFile(callback);
			$('#fileLoad').trigger('click');
		}
	});
}
/*
  * 提交
  */
function saveForm(callback) {
	if (!md5Code) {
		top.layer.alert("请递交投标文件", { icon: 7, title: '提示' }, function (ind) {
			parent.layer.close(ind);
			$('#collapseTwo').collapse('show');
		});
		return;
	}

	if (!CAcf) {
		CAcf = new CA({
			target: "#formName",
			confirmCA: function (flag) {
				if (!flag && filePath != "") {
					fileUploads.fileDel(0);
					filePath = "";
					$("#fileName").html("");
					$("#createDate").html("");
					$("#md5Code").val("");
					return;
				}
				if (callback) {
					savePost(callback);
				} else {
					savePost();
				}

			}
		});
	}
	CAcf.sign();
}
function savePost(callback) {
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	if (md5Code) {
		data.md5Code = md5Code;
	} else {
		top.layer.alert("请递交投标文件", { icon: 7, title: '提示' }, function (ind) {
			parent.layer.close(ind);
			$('#collapseTwo').collapse('show');
		});
		$('#fileUp').removeAttr('disabled');
		return;
	}
	if (filePath) {
		data.originalFileUrl = filePath;
	}

	data.bidSectionId = bidSectionId;
	data.id = bidFileId;


	$.ajax({
		url: saveUrl,
		type: "post",
		data: data,
		async: false,
		success: function (data) {
			if (data.success == undefined) {
				$('#fileUp').removeAttr('disabled');
				return;
			}
			if (data.success == false) {
				parent.layer.alert(data.message);
				parent.$("#tableList").bootstrapTable("refresh");
				fileUploads.fileList();
				$("#fileName").html("");
				$("#createDate").html("");
				$("#md5Code").val("");
				$('#fileUp').removeAttr('disabled');
				return;
			}
			if (callback) {
				callback()
			}
			$("#fileUp").hide();
			freshView(true)


			$('.red').hide();
			receiptUrl = data.data;
			parent.$("#tableList").bootstrapTable("refresh");
			history();
			top.layer.open({
				type: 1,
				btn: ["回执", "关闭"],
				area: ["300px", "190px"],
				content: '<div style="padding:30px 20px;text-align:center;font-size:18px;">投标文件递交成功</div>',
				yes: function (idx, layero) {
					top.layer.close(idx);
					previewResult(data.data);
				}
			});

		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
}
function previewResult(pdfPath) {
	var temp = top.layer.open({
		type: 2,
		title: "预览 ",
		area: ['100%', '100%'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		//		btn:["打印", "关闭"],
		content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			window.print();
		}
	});
}
/*
  * 保存
  */
function insertForm(callback) {
	var data = { bidSectionId: bidSectionId };
	if (bidFileId) {
		data.id = bidFileId;
	}
	data.bidderProxy = $.trim($('#bidderProxy').val());
	data.projectLeader = $.trim($('#projectLeader').val());

	data.bidderProxyCardType = $.trim($("#bidderProxyCardType").val())
	data.bidderProxyCard = $.trim($("#bidderProxyCard").val());
	data.projectLeaderCardType = $.trim($("#projectLeaderCardType").val());
	data.projectLeaderCard = $.trim($("#projectLeaderCard").val());

	$.ajax({
		url: insertUrl,
		type: "post",
		data: data,
		async: false,
		success: function (data) {
			$('#fileUp').removeAttr('disabled');
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if (data.success == undefined) {//验证后台黑名单拦截时，data直接为验证内容信息，success没有值，此时不打开选择文件页面
				return;
			}
			bidFileId = data.data;

			if (callback) {
				callback();
			}
			parent.$("#tableList").bootstrapTable("refresh");

		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
}
/*
  * 详情
  */
function detail() {
	$.ajax({
		url: detailUrl,
		type: "post",
		async: false,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType
		},
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if (data.data) {
				var arr = data.data;
				bidFileId = arr.id;
				/*bidOpenType = arr.bidOpenType ? arr.bidOpenType : "";
			  if(bidOpenType == 1){
				  extFilters = [".tbwj"];
			  } else {
				  extFilters = [".pdf", ".zip", ".rar"];
			  }*/
				if (!fileUploads) {
					uploadsFile();
				}

				if (arr.projectAttachmentFiles && arr.projectAttachmentFiles.length > 0) { //文件信息
					var fileArr = arr.projectAttachmentFiles;

					//   			for(var i = 0; i < fileArr.length; i++){
					//   				fileArr[i].url = arr.receiptUrl;
					//   			}
					fileUploads.fileHtml(fileArr);
					if (source == 2) {
						$(".fileListTab .btnDownload").after('<a href="javascript:;" class="btn-primary btn-sm btnSee" data-url="' + arr.receiptUrl + '"><span class="glyphicon glyphicon-eye-open"></span> 回执单</a>')
					}
					$("#createDate").html(fileArr[0].createDate);
					$("#md5Code").val(fileArr[0].md5Code);
					md5Code = fileArr[0].md5Code;
					$("#fileName").html(fileArr[0].attachmentFileName);
					filePath = fileArr[0].url ? fileArr[0].url : "";
				}
				if (arr.status == 1) {
					$("#createDate").html(arr.createDate);
					$("#orderId").html(arr.id);
				}
				receiptUrl = arr.receiptUrl ? arr.receiptUrl : "";
				if (arr.bidFileLogs && arr.bidFileLogs.length > 0) {
					historyHtml(arr.bidFileLogs);
				}
				$("[name='email']").val(arr.email);
				$('#projectLeader').val(arr.projectLeader ? arr.projectLeader : '');
				$('#bidderProxy').val(arr.bidderProxy ? arr.bidderProxy : '');
				$("#bidderProxyCardType").val(arr.bidderProxyCardType || 0);
				$("#bidderProxyCard").val(arr.bidderProxyCard || '');
				$("#projectLeaderCardType").val(arr.projectLeaderCardType || 0);
				$("#projectLeaderCard").val(arr.projectLeaderCard || '');
				initView();
			}
		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
}
/*
  * 回执单历史记录
  */
function history() {
	$.ajax({
		url: historyUrl,
		type: "post",
		async: false,
		data: {
			bidSectionId: bidSectionId
		},
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if (data.data && data.data.length > 0) {
				historyHtml(data.data);
			}
		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
}

// 回执历史记录
function historyHtml(data) {
	var html = "";
	$("#historyTable").remove();
	if ($("#historyTable").length == 0) {
		html += '<table id="historyTable" class="table table-bordered" style="margin-top: 5px;">\
	                	<tr>\
	                		<th style="width:50px;text-align:center;">序号</th>\
	                		<th>投标人</th>\
	                		<th style="width: 180px;text-align:center;">递交时间</th>\
	                		<th style="width: 180px;text-align:center;">撤回时间</th>\
	                		<th style="width: 100px;">回执单</th>\
	                		<th style="width: 100px;">撤回回执单</th>\
	                	</tr>';
	}
	for (var i = 0; i < data.length; i++) {
		html += '<tr>\
                		<td style="text-align:center;">'+ (i + 1) + '</td>\
                		<td>'+ data[i].enterpriseName + '</td>\
                		<td style="text-align:center;">'+ (data[i].createTime ? data[i].createTime : "") + '</td>\
                		<td style="text-align:center;">'+ (data[i].revokeDate ? data[i].revokeDate : "") + '</td>\
                		<td><a class="btn-primary btn-sm btnSee" data-url="'+ data[i].receiptUrl + '"><span class="glyphicon glyphicon-eye-open"></span> 预览</a></td>\
                		<td>'+ (data[i].revokerReceiptUrl ? '<a class="btn-primary btn-sm btnSee" data-url="' + data[i].revokerReceiptUrl + '"><span class="glyphicon glyphicon-eye-open"></span> 预览</a>' : "") + '</td>\
                	</tr>';
	}

	if ($("#historyTable").length == 0) {
		html += '</table>';
		$("#historyBlock").html("");
		$(html).appendTo("#historyBlock");
	} else {
		$(html).appendTo("#historyTable");
	}
}
