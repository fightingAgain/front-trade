/*
 * @Author: yiwen
 * @Date: 2021-11-16

 * @LastEditTime: 2021-01-13 15:21:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork\bidPrice\DataPush\SelfProcurement\js\dataPushInfo.js
 */
var pushUrl = top.config.AuctionHost + '/projectReceptionController/push.do';//推送接口
var getInfoUrl = top.config.AuctionHost + '/projectReceptionController/saveLogPushProject.do';//获取推送数据详情接口
var dowoloadFileUrl = top.config.AuctionHost + "/deliveryFile/download.do"; //下载文件
var deleteFileUrl = top.config.AuctionHost + "/deliveryFile/deleteDeliveryFile.do"; //删除文件接口
var fileUploadUrl = top.config.AuctionHost + "/deliveryFile/upload.do"; //上传或重新上传
var appenFileUrl = top.config.AuctionHost + "/deliveryFile/addUpload.do"; //追加上传
var packageId = $.getUrlParam("packageId");//包件id
var projectId = $.getUrlParam("projectId");//项目id
var organNo = $.getUrlParam("organNo");//企业社会信用码
var type = $.getUrlParam("type");//view是查看，edit是编辑
var dataType;//推送状态，0未推送，1已推送，2，推送失败
var tenderType = $.getUrlParam("tenderType");//采购类型：0寻比采购。1竞价采购，2竞卖采购，6单一来源
var pushId = '';//推送id
var fileArr = [];//附件数组
var selSupplier = [];//供应商数组
$(function () {
	//关闭当前窗口
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//初始化获取推送数据
	getPushInfo();
	//当不为推送成功且为编辑状态
	if (type == 'edit') {
		$('.isEdit').show();
		$('input .isEdit').attr('datatype', '*')
	} else {
		$('.isView').show();
	}
	//推送按钮
	$('#btn_submit').click(function () {
		if (top.checkForm($("#DataPush"))) {
			var arr = {};
			arr = top.serializeArrayToJson($("#DataPush").serializeArray());//获取表单数据，并转换成对象；
			arr.id = pushId;
			arr.packageId = packageId;
			arr.projectId = projectId;
			arr.organNo = organNo;
			arr.tenderType = tenderType;
			$.ajax({
				type: "post",
				url: pushUrl,
				async: true,
				data: arr,
				success: function (data) {
					if (data.success) {
						parent.layer.alert('推送成功！');
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					} else {
						parent.layer.alert(data.message)
					}

				}
			});
		};
	});
	// 判断日期格式
	$(".ageinTime").on('change', function () {
		var time = $(this).val();
		var r = new RegExp("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s((([0-1][0-9])|(2?[0-3]))\\:([0-5]?[0-9])))?$");
		if (time != "" && !r.test(time)) {
			parent.layer.alert('温馨提示：请输入正确格式的日期');
			$(this).val("")
		}
	});
	//日期选择器
	$('.Wdate').click(function () {
		var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',//时间格式
			// minDate:nowDate ,//最小值
			onpicked: function (dp) {//选择完时间的回调


			}
		})
	});
	//提交按钮
	$("#btn_bao").on('click', function () {
		var arr = {};
		arr = top.serializeArrayToJson($("#DataPush").serializeArray());//获取表单数据，并转换成对象；
		arr.id = pushId;
		arr.packageId = packageId;
		arr.projectId = projectId;
		arr.organNo = organNo;
		arr.tenderType = tenderType;
		if (arr.priceType == 9) {
			arr.priceUnit = ""
		}
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/projectReceptionController/saveProjectPushBody.do",
			data: arr,
			dataType: "json",
			async: false,
			success: function (response) {
				if (response.success) {
					parent.layer.alert('温馨提示：保存成功');
					getPushInfo()
				} else {
					parent.layer.alert(response.message);
				}
			}
		});
	})
});
/*
 * 获取推送数据
 * */
function getPushInfo() {
	$.ajax({
		type: "post",
		url: getInfoUrl,
		async: false,
		data: {
			'packageId': packageId,
			'projectId': projectId,
			'organNo': organNo,
			'tenderType': tenderType
		},
		success: function (data) {
			if (data.success) {
				var res = data.data;
				pushId = res.id;
				for (var key in res) {
					$('#' + key).html(res[key]);
					$('[name="' + key + '"]').val(res[key])
				}
				//判断公告发出时间是否存在
				if (res.ansSengDatea) {
					$('[name="ansSengDatea"]').val(dateSpile(res.ansSengDatea))
				}
				//判断答复截止时间是否存在
				if (res.ansEndDatea) {
					$('[name="ansEndDatea"]').val(dateSpile(res.ansEndDatea))
				}
				//判断招投标（采购）文件时间是否存在
				if (res.submitDatea) {
					$('[name="submitDatea"]').val(dateSpile(res.submitDatea))
				}
				//判断技术标评价时间是否存在
				if (res.techReviewDatea) {
					$('[name="techReviewDatea"]').val(dateSpile(res.techReviewDatea))
				}
				//判断商务标评价时间是否存在
				if (res.reportDatea) {
					$('[name="reportDatea"]').val(dateSpile(res.reportDatea))
				}
				//判断评审报告生成时间是否存在
				if (res.noticeSendDatea) {
					$('[name="noticeSendDatea"]').val(dateSpile(res.noticeSendDatea))
				}
				//判断结果通知书发送时间是否存在
				if (res.busReviewDatea) {
					$('[name="busReviewDatea"]').val(dateSpile(res.busReviewDatea))
				}
				//报价类型 0为金额，9为费率
				if (res.priceType == 9) {
					$('.priceType1').hide()
					$("#priceType").html('费率');
					$('.iscolspan').attr('colspan', '3')
				} else {
					$("#priceType").html('金额');
					$('.priceType1').show();
					$('.iscolspan').attr('colspan', '1')
				}
				//报价类型 0为金额，9为费率
				if (res.priceUnit == 1) {
					$("#priceType").html('万元')
				} else {
					$("#priceType").html('元')
				}
				//获取推送状态：0未推送，1推送成功，2推送失败
				dataType = res.dataType
				if (res.dataType == 0) {
					$('#dataType').html("未推送");
				} else if (res.dataType == 1) {
					$('#dataType').html("推送成功");
				} else if (res.dataType == 2) {
					$('#dataType').html("推送失败");
				}

				//答疑记录
				if (res.ansRecord) {
					$('#answerList').html(res.ansRecord)
				};

				//答谈判记录
				if (res.negotiationRecord) {
					$('#talksList').html(res.negotiationRecord)
				}
				if (tenderType == 0 || tenderType == 6) {
					$('.tender').show();
					//澄清记录
					if (res.priceNegotiationRecord) {
						$('#clarifyList').html(res.priceNegotiationRecord)
					};
					var list = ['11', '13', '15']
				} else {
					$('.tender').hide();
					var list = ['11', '13']
				}
				if (res.deliveryFiles && res.deliveryFiles.length > 0) {
					fileArr = res.deliveryFiles;
					for (var i = 0; i < list.length; i++) {
						fileHtml(fileArr, list[i])
					}

				}
				if (res.selSupplier && res.selSupplier.length > 0) {
					selSupplier = res.selSupplier;
					supplierHtml()
					supplierFileList(res.selSupplier)
				}
				// 报价排名
				$("#offerRank").html("<table id='roundRank'></table>");

				auctionInfo(res.packageId);
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
$('[name="priceType"]').on('change', function () {
	if ($(this).val() == 1) {
		$('.priceType1').show();
		$('.iscolspan').attr('colspan', '1')
	} else {
		$('.priceType1').hide();
		$('.iscolspan').attr('colspan', '3')
	}
})
/*
 * 候选供应商
 */
function supplierHtml() {
	$('#supplierList').html('');
	var html = '';
	html += '<table class="table table-bordered">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 50px;text-align: center;">序号</th>';
	html += '<th>供应商名称</th>';
	html += '<th style="width: 150px;text-align: center;">社会信用代码</th>';
	html += '<th style="width: 150px;text-align: right;">报价金额（元）</th>';
	html += '<th style="width: 150px;text-align: center;">是否为中选供应商</th>';
	html += '<th style="width: 150px;text-align: right;">成交金额（元）</th>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';
	for (var i = 0; i < selSupplier.length; i++) {
		html += '<tr>';
		html += '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>';
		html += '<td>' + selSupplier[i].supplierName + '</td>';
		html += '<td style="width: 150px;text-align: center;">' + selSupplier[i].socialCreditcode + '</td>';
		//询比、单一来源项目报价金额应显示为修正后总价
		html += '<td style="width: 150px;text-align: right;">' + ((tenderType == 1 || tenderType == 2) ? selSupplier[i].openPrice : selSupplier[i].correctionPrice) + '</td>';
		html += '<td style="width: 150px;text-align: center;">'
		html += '<input type="hidden" name="selSupplier[' + i + '].id" value="' + selSupplier[i].id + '"/>'

		html += '<select name="selSupplier[' + i + '].isWin" class="form-control isWin" data-index="' + i + '">'
		html += '<option value="1" ' + (selSupplier[i].isWin == 1 ? 'selected' : '') + '>是</option>'
		html += '<option value="0" ' + (selSupplier[i].isWin != 1 ? 'selected' : '') + '>否</option>'
		html += '</select>'

		html += '</td>';
		html += '<td style="width: 150px;text-align: right;">'
		if (selSupplier[i].isWin == 1) {

			html += '<input type="text" name="selSupplier[' + i + '].winPrice" style="text-align: right;" data-index="' + i + '" value="' + (selSupplier[i].winPrice || "") + '"  class="form-control priceNumber" datatype="*" data-price="2" errormsg="请输入成交金额"/>'
		} else {

			html += '/<input type="hidden" name="selSupplier[' + i + '].winPrice" value="' + selSupplier[i].winPrice + '"/>'
		}
		html += '</td>';
		html += '</tr>';
	}
	html += '</tbody></table>';
	$('#supplierList').html(html);

}
$('#supplierList').on('change', '.isWin', function () {
	var _i = $(this).data('index')
	selSupplier[_i].isWin = $(this).val();
	supplierHtml()
});
$('#supplierList').on('change', '.priceNumber', function () {
	var _i = $(this).data('index')
	if ($(this).val() != "") {
		if (!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			parent.layer.alert("温馨提示：金额必须大于零且最多两位小数");
			$(this).val("");

			return
		};
	}
	selSupplier[_i].winPrice = $(this).val();
});
function fileHtml(data, num) {
	var html = '';
	html += '<table class="table table-bordered">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 50px;text-align: center;">序号</th>';
	html += '<th>附件名称</th>';
	html += '<th style="width: 150px;text-align: center;">文件传递时间</th>';
	html += '<th style="width: 150px;">操作</th>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';
	for (var i = 0; i < data.length; i++) {
		var type = '';

		var postfix = data[i].path.split('.');
		if (data[i].ftype == num) {
			html += '<tr>';
			html += '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>';
			html += '<td>' + data[i].name + '</td>';
			html += '<td style="width: 150px;text-align: center;">' + dateSpile(data[i].dataTime) + '</td>';
			html += '<td style="width: 150px;">';
			html += "<a href='javascript:void(0)' class='btn-sm btn-primary btn_down' data-index='" + i + "' style='text-decoration:none;margin-right:10px;'>下载</a>";
			if (postfix[1] == "pdf" || postfix[1] == "PDF") {
				html += "<a href='javascript:void(0)' class='btn-sm btn-primary btn_view' data-index='" + i + "' style='text-decoration:none;margin-right:10px;'>预览</a>";
			}
			html += '</td>';
			html += '</tr>';
		}


	};
	html += '</tbody></table>';
	$('#fileList' + num).html(html);
	$('#fileList' + num).find('.btn_down').click(function () {
		var index = $(this).attr('data-index');
		var newUrl = dowoloadFileUrl + '?ftpPath=' + fileArr[index].ftpPath + '&fname=' + fileArr[index].name
		window.location.href = $.parserUrlForToken(newUrl);
	});
	$('#fileList' + num).find('.btn_view').click(function () {
		var index = $(this).attr('data-index');
		top.layer.open({
			type: 2,
			area: ['100%', '100%'],
			btn: ["关闭"],
			maxmin: false,
			resize: false,
			title: "预览",
			content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileArr[index].ftpPath)
		})
	});
}
//日期截取到分
function dateSpile(ss) {
	return ss.substring(0, 16);
}
function supplierFileList(data) {
	for (var i = 0; i < data.length; i++) {
		data[i]['技术方案附件_21'] = [];
		data[i]['报价文件_22'] = [];
		if (data[i].isWin == 1) {
			data[i]['中选结果通知书附件_23'] = [];
		}
		if (data[i].isWin == 0) {
			data[i]['未中选结果通知书附件_24'] = [];
		}
		data[i]['澄清附件(多文件不压缩)_25'] = [];
		data[i]['报价表盖章件_26'] = [];

		for (var j = 0; j < data[i].attachments.length; j++) {
			if (data[i].attachments[j].ftype == 21) {
				data[i]['技术方案附件_21'].push(data[i].attachments[j])
			}
			if (data[i].attachments[j].ftype == 22) {
				data[i]['报价文件_22'].push(data[i].attachments[j])
			}

			if (data[i].attachments[j].ftype == 23) {
				data[i]['中选结果通知书附件_23'].push(data[i].attachments[j])
			}

			if (data[i].attachments[j].ftype == 24) {
				data[i]['未中选结果通知书附件_24'].push(data[i].attachments[j])
			}

			if (data[i].attachments[j].ftype == 25) {
				data[i]['澄清附件(多文件不压缩)_25'].push(data[i].attachments[j])
			}
			if (data[i].attachments[j].ftype == 26) {
				data[i]['报价表盖章件_26'].push(data[i].attachments[j])
			}
		}
	}
	var html = '';
	html += '<table class="table table-bordered">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 50px;text-align: center;">序号</th>';
	html += '<th>供应商名称</th>';
	html += '<th style="width:200px;">附件名称</th>';
	html += '<th style="width:80px;text-align: center;">是否上传</th>';
	html += '<th style="width:400px;text-align: center;">操作</th>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';
	for (var i = 0; i < data.length; i++) {
		html += '<tr>';
		html += '<td rowspan="5" style="width: 50px;text-align: center;">' + (i + 1) + '</td>';
		html += '<td rowspan="5" >' + data[i].supplierName + '</td>';
		for (var key in data[i]) {
			if (/.*[\u4e00-\u9fa5]+.*$/.test(key)) {
				var keyList = key.split("_");
				html += '<td>' + keyList[0] + '</td>';
				html += '<td style="text-align: center;">' + (data[i][key].length > 0 ? '是' : '否') + '</td>';
				html += '<td style="width: 150px;">';
				if (data[i][key].length == 0 || keyList[1] == 25) {
					if (type != "view") {
						html += "<button type='button' data-index='" + keyList[1] + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnUpload'" +
							" style='text-decoration:none;margin-right:10px;'>上传</button>";
						html += '<input type="file" name="files" multiple="multiple" id="btnUpload' + i + keyList[1] + '" onchange=Excel(this,' + i + ',' + keyList[1] + ',"btnUpload")>';
					}
					if (keyList[1] == 25) {
						if (data[i][key].length > 0) {
							html += '<table class="table table-bordered" style="margin-top:5px">'
							for (var j = 0; j < data[i][key].length; j++) {
								var postfix = data[i][key][j].path.split('.');
								html += '<tr>';
								html += '<td>' + data[i][key][j].name + '</td>';
								html += '<td style="width:150px">'
								html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnDown' style='margin-right:5px;'>下载</button>";
								html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-danger fileinput-button btnDel' style='margin-right:5px;'>删除</button>";
								if (postfix[1] == "pdf" || postfix[1] == "PDF") {
									html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnView' style='margin-right:5px;'>预览</button>";
								}
								html += '</td>'
								html += '</tr>';
							}
							html += '</table>'
						}

					}
				} else {
					for (var j = 0; j < data[i][key].length; j++) {
						var postfix = data[i][key][j].path.split('.');
						html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnDown' style='margin-right:10px;'>下载</button>";
						if (type != "view") {
							html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnAgainUpload' style='margin-right:10px;'>重新上传</button>";
							html += '<input type="file" name="files" multiple="multiple" id="btnAgainUpload' + i + j + '" onchange=Excel(this,' + i + ',' + keyList[1] + ',"btnAgainUpload","' + data[i][key][j].id + '")>';
							html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnAdd' style='tmargin-right:10px;'>追加上传</button>";
							html += '<input type="file" name="files" multiple="multiple" id="btnAdd' + i + j + '" onchange=Excel(this,' + i + ',' + keyList[1] + ',"btnAdd","' + data[i][key][j].id + '")>';
							html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-danger fileinput-button btnDel' style='margin-right:10px;'>删除</button>";
						}
						if (postfix[1] == "pdf" || postfix[1] == "PDF") {
							html += "<button type='button' data-name='" + key + "' data-index='" + j + "' data-omg='" + i + "' class='btn-xs btn btn-primary fileinput-button btnView' style='margin-right:10px;'>预览</button>";
						}
					}
				}
				html += '</td>';
				html += '</tr>';
			}

		}
	}
	html += '</tbody></table>';
	$('#tableList').html(html);
	//下载
	$('#tableList .btnDown').click(function () {
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		var _name = $(this).data('name');
		var newUrl = dowoloadFileUrl + '?ftpPath=' + data[_i][_name][index].ftpPath + '&fname=' + data[_i][_name][index].name
		window.location.href = $.parserUrlForToken(newUrl);
	});
	//上传
	$('#tableList .btnUpload').click(function () {
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		$('#btnUpload' + _i + index).trigger('click')
	});
	//重新上传
	$('#tableList .btnAgainUpload').click(function () {
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		$('#btnAgainUpload' + _i + index).trigger('click')
	});
	//追加上传
	$('#tableList .btnAdd').click(function () {
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		$('#btnAdd' + _i + index).trigger('click')
	});
	//删除
	$('#tableList .btnDel').click(function () {
		var index = $(this).data('index');
		var _i = $(this).data('omg');
		var _name = $(this).data('name');
		parent.layer.confirm('确定要删除该附件', {
			btn: ['是', '否'] //可以无限个按钮
		}, function (indexs, layero) {
			$.ajax({
				type: "post",
				url: deleteFileUrl,
				async: false,
				dataType: 'json',
				data: {
					"deliveryFileId": data[_i][_name][index].id,
				},
				success: function (data) {
					if (data.success) {
						getPushInfo();
						parent.layer.close(indexs);
					} else {
						parent.layer.alert(data.message)
					}
				}
			});
		}, function (indexs) {
			parent.layer.close(indexs)
		});
	});
	//预览
	$('#tableList .btnView').click(function () {
		var index = $(this).attr('data-index');
		var _i = $(this).data('omg');
		var _name = $(this).data('name');
		top.layer.open({
			type: 2,
			area: ['100%', '100%'],
			btn: ["关闭"],
			maxmin: false,
			resize: false,
			title: "预览",
			content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + data[_i][_name][index].ftpPath)
		})
	});
}
// 上传文件流
var rABSl = false; //是否将文件读取为二进制字符串
function Excel(obj, _i, fileType, type, fileId) {
	if (obj.files != null) {
		var url = fileUploadUrl;
		var formFile = new FormData();
		formFile.append("ftype", fileType);
		formFile.append("deliveryId", selSupplier[_i].deliveryId);
		formFile.append("supplierId", selSupplier[_i].supplierId);
		if (type == 'btnAdd') {
			url = appenFileUrl;
		}
		if (fileType != 25 && fileId) {
			formFile.append("id", fileId);
		}
		for (var i = 0; i < obj.files.length; i++) {
			formFile.append("files", obj.files[i]); //加入文件对象
		}
		$.ajax({
			type: "post",
			url: url,
			data: formFile,
			cache: false,//上传文件无需缓存
			processData: false,//用于对data参数进行序列化处理 这里必须false
			contentType: false, //必须
			success: function (response) {
				if (response.success) {
					parent.layer.alert("上传成功")
					getPushInfo();
				} else {
					parent.layer.alert(response.message)
				}
			}
		});
	}
}

//竞价信息
function auctionInfo(packageId) {
	//竞价项目
	var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: tenderType,
		},
		success: function (res) {
			if (res.success) {
				var packageData = res.data;
				if (packageData.auctionType == '6') {
					if (packageData.isEnd) {
						getOfferInfo(packageId);
					} else {
						getOfferInfo(packageId);
					}
				} else if (packageData.auctionType == '7') {
					if (packageData.isEnd) {
						getOfferRank(packageId);
					} else {
						getOfferInfo(packageId);
					}
				} else {
					if (packageData.isEnd) getOfferInfo(packageId);
				}
			}
		}
	})
}

function getOfferInfo(packageId) {
	var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
	var offerData;
	$.ajax({
		url: urlViewAuctionInfo,
		data: {
			packageId: packageId,
			state: 1,
			tenderType: tenderType,
		},
		async: true,
		success: function (res) {
			if (res.success) {
				var data = res.data;
				offerData = data;
				if (data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					if (data.auctionModel == 0) { // 按照包件
						$("#offerRank").html("<table id='freePackageRank'></table>");
						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
					} else {
						$("#offerRank").html("<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;padding-left:12px;'><table id='freeDetailRank'></table></div>");
						$("#offerRecord").html("<div style='width:50%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 50%;float: left;padding-left:12px;'><table id='freeDetailRecord'></table></div>");
						freeDetailRank();
						freeDetailRecord();
						freeDetailRK();
						freeDetailRD();
					}
				} 
				else if (data.auctionType == 7) {
					$("#offerRecord").html("<table id='freePackageRecord'></table>");
					freePackageRecord();
				} 
				else {
					// 多轮
					$("#offerRank").html("<table id='roundRank'></table>");
					$("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;padding-left:12px;'><table id='roundRecord'></table></div>");
					roundRank();
					roundRecord();
					roundItem();
				}
			}
		}
	});

	//自由或者单轮  按照包件排名
	function freePackageRank() {
		$("#freePackageRank").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'

			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}
			},
			]
		})
		$("#freePackageRank").bootstrapTable("load", offerData.rankItems);
	}

	//自由或者单轮  按照包件报价记录
	function freePackageRecord() {
		$("#freePackageRecord").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'

			}, {
				field: 'offerMoney',
				title: '报价（元）',
				align: 'right',
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}

			}, {
				field: 'subDate',
				title: '报价时间',
				align: 'center'
			}]
		})
		$("#freePackageRecord").bootstrapTable("load", offerData.offerlogs);
	}

	function freeDetailRank() {
		$("#freeDetailRank").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '排名',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'
			},
			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}
			},
			]
		});
	}

	function freeDetailRecord() {
		$("#freeDetailRecord").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			},
			{
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'

			}, {
				field: 'offerMoney',
				title: '报价（元）',
				align: 'right',
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}

			}, {
				field: 'subDate',
				title: '报价时间',
				align: 'center'
			}
			]
		})
	}

	function freeDetailRK() {
		$("#freeDetailRK").bootstrapTable({
			undefinedText: "",
			paganization: false,
			onCheck: function (row, ele) {
				var index = $(ele).parents("tr").index();
				if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
					$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
				}
			},
			onPostBody: function () {
				$("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
			},
			columns: [{
				radio: true,
				formatter: function (value, row, index) {
					if (index == 0) {
						if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
							$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);

						}

						return true;
					}
				}
			},
			{
				field: 'detailedName',
				title: '商品名称',
			},
			{
				field: 'brand',
				title: '品牌要求',
			},
			{
				field: 'detailedVersion',
				title: '规格型号',
			},
			{
				field: 'detailedCount',
				title: '数量',
				align: 'center',

			},
			{
				field: 'detailedUnit',
				title: '单位',
				align: 'center',

			}
			]
		})

		$("#freeDetailRK  input[type='radio']").attr("name", "freeDetailRD");
		$("#freeDetailRK").bootstrapTable("load", offerData.auctionPackageDetaileds);

	}
	function freeDetailRD() {
		$("#freeDetailRD").bootstrapTable({
			undefinedText: "",
			paganization: false,
			onCheck: function (row, ele) {
				var index = $(ele).parents("tr").index();
				if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
					$("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
				}
			},
			onPostBody: function () {
				$("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
			},
			columns: [{
				radio: true,
				formatter: function (value, row, index) {
					if (index == 0) {
						if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
							$("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
						}
						return true;
					}
				}
			},
			{
				field: 'detailedName',
				title: '商品名称',
			},
			{
				field: 'brand',
				title: '品牌要求',
			},
			{
				field: 'detailedVersion',
				title: '规格型号',

			},
			{
				field: 'detailedCount',
				title: '数量',
				align: 'center',

			},
			{
				field: 'detailedUnit',
				title: '单位',
				align: 'center',

			}
			]
		})

		$("#freeDetailRD").bootstrapTable("load", offerData.details);

	}
	//多伦报价 报价排名
	function roundRank() {
		$("#roundRank").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '排名',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'

			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function (value, row, index) {
					if (!value) return '';
					return Number(value).toFixed(2);
				}
			},
			{
				field: 'isEliminated',
				title: '是否淘汰',
				align: 'right',
				width: "120",
				formatter: function (value, row, index) {
					if (row.isEliminated != undefined && row.isEliminated == '1') {
						return "<span class='text-danger'>已淘汰</span>";
					} else {
						return "<span  class='text-success'>未淘汰</span>";
					}
				}
			},
			]
		})
		$("#roundRank").bootstrapTable("load", offerData.rankItems);

	}

	//多伦报价 报价记录
	function roundRecord() {
		$("#roundRecord").bootstrapTable({
			undefinedText: "",
			paganization: false,
			columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			}, {
				field: "enterpriseName",
				title: "竞买人"
			}, {
				field: "offerMoney",
				title: "报价（元）",
				align: 'right',
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}
			}, {
				field: "subDate",
				title: "报价时间"
			}, {
				field: "offerRound",
				title: "报价轮次",
				formatter: function (value, row, index) {
					return "第" + sectionToChinese(value) + "轮";
				}
			}]
		})
	}

	//多伦报价 报价轮次
	function roundItem() {
		$("#roundItem").bootstrapTable({
			undefinedText: "",
			paganization: false,
			clickToSelect: true,
			onCheck: function (row, ele) {
				var index = $(ele).parents("tr").index();
				if (offerData.offerlogs[index].offerLog !== undefined && offerData.offerlogs[index].offerLog !== null && offerData.offerlogs[index].offerLog !== "") {
					$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog);
				}
			},
			columns: [{
				radio: true,
				formatter: function (value, row, index) {
					if (index == 0) {

						$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog || []);
						return true;
					}
				}
			},
			{
				title: '轮次',
				align: "center",
				formatter: function (value, row, index) {
					return "第" + sectionToChinese(index + 1) + "轮报价";
				}
			}, {
				field: 'enterpriseName',
				title: '最低价竞买人',
				align: "center",
				formatter: function (value, row, index) {
					return (value || "无报价人");
				}
			}, {
				field: 'minPrice',
				title: '最低价报价（元）',
				align: "right",
				formatter: function (value, row, index) {
					return value ? (Number(value).toFixed(2)) : "无最低报价";
				}
			}
			]
		})

		$("#roundItem").bootstrapTable("load", offerData.offerlogs);
	}
}

// 获取报价列表
function getOfferRank(packageId) {
	var singleOfferListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getSingleOriginatorOfferesList.do';
	$.ajax({
		type: "post",
		url: singleOfferListUrl,
		data: { packageId: packageId },
		success: function (res) {
			var listData = res.data;
			listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIERTECH_OFFER', 'fileDatas')
			listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIER_OFFER', 'listFileDatas')
			$("#roundRank").bootstrapTable({
				undefinedText: "",
				paganization: false,
				columns: [{
					title: '排名',
					width: '50px',
					align: 'center',
					formatter: function (value, row, index) {
						return index + 1;
					}
				},
				{
					field: 'supplierEnterpriseName',
					title: '供应商',
					align: 'center'

				}, 
				// {
				// 	field: 'noTaxRateTotalPrice',
				// 	title: '报价总计(不含税)',
				// 	align: 'center'

				// }, {
				// 	field: 'taxRate',
				// 	title: '税率(%)',
				// 	align: 'center'

				// }, 
				{
					field: 'taxRateTotalPrice',
					title: '报价总计(含税)',
					align: 'center'

				}, {
					field: 'offerTime',
					title: '报价时间',
					align: 'center'
				},
				// {
				// 	title: '报价文件附件',
				// 	align: 'left',
				// 	formatter: function (value, row, index) {
				// 		var fileDatas = row.fileDatas;
				// 		console.log(fileDatas)
				// 		if (fileDatas) {
				// 			var html = "<table class='table' style='border-bottom:none'>";
				// 			for (var i = 0; i < fileDatas.length; i++) {
				// 				html += "<tr>";
				// 				html += "<td>" + fileDatas[i].fileName + "</td>"
				// 				html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileDatas[i].fileName + "\",\"" + fileDatas[i].filePath + "\")'>下载</a>&nbsp;"
				// 				html += "</span></td></tr>";
				// 			}
				// 			html += "</table>";
				// 			return html;
				// 		} else {
				// 			return '暂无文件'
				// 		}
				// 	}
				// },
				// {
				// 	title: '清单文件附件',
				// 	align: 'left',
				// 	formatter: function (value, row, index) {
				// 		var listFileDatas = row.listFileDatas;
				// 		if (listFileDatas) {
				// 			var html = "<table class='table' style='border-bottom:none'>";
				// 			for (var i = 0; i < listFileDatas.length; i++) {
				// 				html += "<tr>";
				// 				html += "<td>" + listFileDatas[i].fileName + "</td>"
				// 				html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + listFileDatas[i].fileName + "\",\"" + listFileDatas[i].filePath + "\")'>下载</a>&nbsp;"
				// 				html += "</span></td></tr>";
				// 			}
				// 			html += "</table>";
				// 			return html;
				// 		} else {
				// 			return '暂无文件'
				// 		}
				// 	}
				// }

				]
			})
			$("#roundRank").bootstrapTable("load", listData);
		}
	});
	function getEmployeeOfferFileList(employeeData, modelName, fileName) {
		var getOfferListUrl = top.config.AuctionHost + "/PurFileController/list.do"; 
		employeeData.forEach(function (val, index) {
			$.ajax({
				type: "get",
				url: getOfferListUrl,
				async: false,
				data: {
					'modelId': packageId,
					'modelName': modelName,
					'employeeId': val.employeeId
				},
				datatype: 'json',
				success: function (res) {
					if (res.success) {
						if (fileName) {
							employeeData[index][fileName] = res.data;
						} else {
							employeeData[index].fileDatas = res.data;
						}
						$('#btnExcelDownload').show()
						$('#btnFileListDownload').show()
					}
				}
			});
		})
		return employeeData;
	}
}

//下载文件
function openAccessory(fileName, filePath) {
	var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}