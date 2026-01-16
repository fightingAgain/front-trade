/**

*  递交保证金查看
*  方法列表及功能描述
*/
var getUrl = config.tenderHost + '/DepositController/selectEnterpriseInfo.do';//相关信息回显
var historyUrl = config.tenderHost + '/DepositController/selectDepositLogList.do';//请求操作记录数据接口
var detailUrl = config.tenderHost + '/DepositController/findDepositDetail.do';//保证金凭证详情
var bidUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//查询标段相关信息
var bondId = '';//保证金id
var bidId = '';//标段id
var examType = '';
var fileUploads = null; //上传文件
$(function () {
	if ($.getUrlParam('examType') && $.getUrlParam('examType') != undefined) {
		examType = $.getUrlParam('examType');//保证金id
	}
	if ($.getUrlParam('id') && $.getUrlParam('id') != undefined) {
		bidId = $.getUrlParam('id');//保证金id
	}
	getBidInfo(bidId)
	getInfo();
	getDetail(bidId, examType)



})
function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: bidUrl,
		async: false,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				if (data.data) {
					var arr = data.data;
					var depositType = '';//保证金递交
					var money = '';//标段设置的保证金金额
					if (arr.depositType == 1) {
						depositType = '固定金额';
						money = arr.depositMoney;
					} else if (arr.depositType == 2) {
						depositType = '比例';
						money = arr.depositRatio + '%';
						$('.bond_unit').css({ 'display': 'none' });
					};

					for (var key in arr) {
						if (key == 'depositMoney' || key == 'depositRatio') {
							$('#depositMoney').html(money)
						} else {
							$('#' + key).html(arr[key])
						}
					}
					$('#depositType').html(depositType);
					$('[name="bidSectionId"]').val(arr.bidSectionId);

					if (arr.depositId) {
						$('[name="id"]').val(arr.depositId);
						//						getDetail(data.depositId)
					}
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}

function getInfo() {
	$.ajax({
		type: "post",
		url: getUrl,
		async: false,
		success: function (data) {
			if (data.success) {
				for (var key in data.data) {
					$('#' + key).html(data.data[key])
				}

			}
		}
	});
};
//修改时的详情
function getDetail(id, examType) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			'bidSectionId': id,
			'examType': examType
		},
		success: function (data) {
			if (data.success) {
				var sourse = data.data;
				bondId = sourse.id;
				if (!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						businessId: bondId,
						status: 2,
						attachmentSetCode: 'BOND_DOC'
					});
				}
				var depositChannel = '';
				for (var key in sourse) {
					if (key == 'depositChannel') {
						if (sourse.depositChannel == 1) {
							depositChannel = '资金现金'
						} else if (sourse.depositChannel == 2) {
							depositChannel = '银行保函'
						} else if (sourse.depositChannel == 3) {
							depositChannel = '担保'
						} else if (sourse.depositChannel == 4) {
							depositChannel = '电汇'
						} else if (sourse.depositChannel == 5) {
							depositChannel = '汇票'
						} else if (sourse.depositChannel == 6) {
							depositChannel = '支票'
						} else if (sourse.depositChannel == 7) {
							depositChannel = '虚拟子账户'
						} else if (sourse.depositChannel == 9) {
							depositChannel = '其他'
						};

					} else if (key == 'invoiceGetType') {
						if (sourse.invoiceGetType == 1) {
							sourse.invoiceGetType = '邮寄发票，同意快递到付';
							$('.scene').css('display', 'none')
							$('.mail').css('display', 'inlin-block')
						} else if (sourse.invoiceGetType == 2) {
							sourse.invoiceGetType = '现场领取';
							$('.scene').css('display', 'inlin-block')
							$('.mail').css('display', 'none')
						}
					} else if (key == 'invoiceType') {
						if (sourse.invoiceType == 1) {
							sourse.invoiceType = '增值税普通发票';
						}
					}
					if (sourse.projectAttachmentFiles) {
						fileUploads.fileHtml(sourse.projectAttachmentFiles);
					}
					if (key == 'depositMoney') {
						$('#money').html(sourse.depositMoney)
					} else if (key == 'depositMoney') {

					} else {
						$('#' + key).html(sourse[key])
					}

				};
				$('#depositChannel').html(depositChannel)
				getHistory(bondId)
			}
		}
	});
}
//请求操作记录数据
function getHistory(id) {
	$.ajax({
		type: "post",
		url: historyUrl,
		async: true,
		data: {
			'bidderDepositId': id
		},
		success: function (data) {
			if (data.success) {
				if (data.data) {
					historyTable(data.data)
				}
			}
		}
	});
};
//操作记录表格
function historyTable(data) {
	var html = '';
	$('#recordList').html('');
	html = '<tr>'
		+ '<th style="width: 50px;text-align: center;">序号</th>'
		+ '<th style="width: 150px;text-align: center;">操作人</th>'
		+ '<th style="width: 100px;text-align: center;">缴纳状态</th>'
		+ '<th style="width: 150px;text-align: center;">操作时间</th>'
		//		+'<th style="width: 150px;text-align: center;">审批人</th>'
		+ '<th style="width: 150px;text-align: center;">审核时间</th>'
		+ '<th>备注</th>'
		+ '</tr>';
	for (var i = 0; i < data.length; i++) {
		var state = '';
		if (data[i].depositStatus == 0) {
			state = '未提交'
		} else if (data[i].depositStatus == 1) {
			state = '提交审核'
		} else if (data[i].depositStatus == 2) {
			state = '审核通过'
		} else if (data[i].depositStatus == 3) {
			state = '审核不通过'
		} else if (data[i].depositStatus == 4) {
			state = '撤回'
		}
		html += '<tr>'
			+ '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>'
			+ '<td style="width: 150px;text-align: center;">' + data[i].userName + '</td>'
			+ '<td style="width: 100px;text-align: center;">' + state + '</td>'
			+ '<td style="width: 150px;text-align: center;">' + (data[i].createTime ? data[i].createTime : '') + '</td>'
			//			+'<td style="width: 150px;text-align: center;">'+(data[i].confirmName?data[i].confirmName:'')+'</td>'
			+ '<td style="width: 150px;text-align: center;">' + (data[i].confirmTime ? data[i].confirmTime : '') + '</td>'
			+ '<td>' + (data[i].reason ? data[i].reason : '') + '</td>'
			+ '</tr>'
	}
	$(html).appendTo('#recordList')
}
function passMessage(data) {
	/*关闭*/
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
}
