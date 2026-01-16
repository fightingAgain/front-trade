
/**

*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/NoticeController/findNoticeDetails.do";	//查看地址

var historyUrl = config.tenderHost + '/NoticeController/getHistoryListByBidId.do';//历史公告列表
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var sendUrl = config.tenderHost + '/NoticeController/publishNotice.do';//发布地址

var priceInfoUrl = config.tenderHost + '/BidSectionController/get.do';// 获取判断二次招标相关信息
var getTransformMoneyInfoUrl = config.depositHost + '/ProjectController/lookBidderReturnState.do';	//获取转移保证金相关数据

var historyView = 'Bidding/BidNotice/Notice/model/noticeChangeView.html';//查看公告历史详情页面
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面

var fileUploads = null; //文件上传
var bidId = '';//标段id
var isThrough;
var noticeId = '';//数据id
var bidCode;
$(function () {
	$('.th_bg').prev().css('width', (Number($('.th_bg').closest('tr').width()) - 424) / 2 + "px");//设置第2列与第4列宽度一致
	isThrough = $.getUrlParam("isThrough");
	bidId = $.getUrlParam('id');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	var isSend = '';//判断是否发送页面
	if ($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		isSend = $.getUrlParam('special');
	}
	if (isSend == 'RELEASE') {
		$('#btnSend').css('display', 'inline-block');
	}
	//	bidId = $.getUrlParam('bidSectionId');//公告列表中带过来的标段Id


	//媒体
	initMedia({
		isDisabled: true
	});
	getRoomList(bidId, '2')
	getRelevant(bidId)
	/*关闭*/
	$('body').on('click', '#btnClose', function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$.ajax({
		type: "post",
		url: viewUrl,
		async: false,
		data: {
			'bidSectionId': bidId
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if (!data.data) {
				return;
			}
			var dataSource = data.data;
			if (dataSource.noticeState == 2) {
				isThrough = 1
			} else {
				isThrough = 0
			}
			noticeId = dataSource.id;
			if (!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					businessId: noticeId,
					status: 2,
					businessTableName: 'T_NOTICE',
					attachmentSetCode: 'TENDER_NOTICE'
				});
			}
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId: noticeId,
				status: 3,
				type: "zbcggg",
				checkState: isThrough
			});
			/*标段信息*/
			if (dataSource.bidSections) {
				var bid = dataSource.bidSections;
				bidderHtml(bid);
			}
			//文件回显
			if (dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0) {
				//				fileHtml(dataSource.projectAttachmentFiles);
				fileUploads.fileHtml(dataSource.projectAttachmentFiles);
			}
			var timeKeys = ['signEndDate', 'noticeEndTime'];
			for (var key in dataSource) {
				var newEle = $("[name='" + key + "']")
				if (newEle.prop('type') == 'checkbox') {
					newEle.val(dataSource[key] ? dataSource[key].split(',') : []);
				}
				if (timeKeys.indexOf(key) > -1) {
					$("#" + key).html(dataSource[key] ? dataSource[key].substr(0, 16) : '');
				} else {
					$("#" + key).html(dataSource[key]);
				}
			}
			// $('#noticeContent').html(dataSource.noticeContent);
			mediaEditor.setValue(dataSource);

		},
		error: function () {
			parent.layer.alert("数据加载失败！");
		}
	});
	// 获取标段是否二次招标以及相关保证金信息
	getPriceInfo()
	/*公告历史*/
	$.ajax({
		type: "post",
		url: historyUrl,
		async: true,
		data: {
			'bidSectionId': bidId
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function (data) {
			if (data.success) {
				historyTable(data.data);
			}
		},
		error: function () {
			parent.layer.alert("数据加载失败！");
		}
	});
	/*
	 * 查看公告历史详情
	 * 
	 * */
	$('body').on('click', '.btnHistoryView', function () {
		var historyId = $(this).closest('td').attr('data-notice-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "历史公告",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function (layero, index) {

			}
		});
	})
	/*查看标段*/
	$('body').on('click', '.btnView', function () {
		//		console.log(bidDetail)
		var bidSectionId = $(this).closest('td').attr('data-bid-id');
		parent.layer.open({
			type: 2,
			area: ['1000px', '600px'],
			title: "标段详情",
			content: bidDetailHtml + "?id=" + bidSectionId,
			resize: false,
			success: function (layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var body = parent.layer.getChildFrame('body', index);
				//					iframeWin.bidDetail(bidDetail);
			}
		})
	})

	// 公告历史表格
	function historyTable(data) {
		$("#tenderNoticeList tbody").html('');
		var html = '';
		for (var i = 0; i < data.length; i++) {

			html = $('<tr>'
				+ '<td style="width:50px;text-align:center">' + (i + 1) + '</td>'
				//			+'<td style="width: 200px;text-align:center">'+data[i].interiorBidSectionCode+'</td>'
				+ '<td>' + data[i].noticeName + '</td>'
				+ '<td style="width: 100px; text-align: center;">' + (data[i].changeCount + 1) + '</td>'
				+ '<td style="width: 200px;text-align:center">' + data[i].noticeSendTime + '</td>'
				+ '<td style="width: 100px;" data-notice-id="' + data[i].id + '"><button type="button" class="btn btn-primary btn-sm btnHistoryView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+ '</td></tr>');
			$("#tenderNoticeList tbody").append(html);
		}

	}
	// 标段表格
	function bidderHtml(data) {
		$("#bidList tbody").html('');
		var html = '';
		for (var i = 0; i < data.length; i++) {
			if (data[i].tenderMode == '1') {
				data[i].tenderMode = '公开招标'
			} else if (data[i].tenderMode == '1') {
				data[i].tenderMode = '邀请招标'
			}
			html = $('<tr>'
				+ '<td style="width:50px;text-align:center">' + (i + 1) + '</td>'
				+ '<td style="width: 200px;text-align:center">' + data[i].interiorBidSectionCode + '</td>'
				+ '<td>' + data[i].bidSectionName + '</td>'
				+ '<td style="width: 100px;text-align:center">' + data[i].tenderMode + '</td>'
				+ '<td style="width: 100px;" data-bid-id="' + data[i].id + '"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+ '</td></tr>');
			$("#bidList tbody").append(html);
		}

	}
	//全屏查看公告
	$('body').on('click', '.fullScreen', function () {
		var content = $('#noticeContent').html();
		parent.layer.open({
			type: 2
			, title: '查看公告信息'
			, area: ['100%', '100%']
			, content: fullScreen
			, resize: false
			, btn: ['关闭']
			, success: function (layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWind = layero.find('iframe')[0].contentWindow;
				body.find('#noticeContent').html(content)
			}
			//确定按钮
			, yes: function (index, layero) {
				parent.layer.close(index);
			}

		});
	});
	/*	$('#btnSend').click(function(){
			sendNotice(noticeId);
		})*/
})
// 获取招标项目相关信息.
function getPriceInfo() {
	$.ajax({
		type: "post",
		url: priceInfoUrl,
		async: false,
		dataType: "json",//预期服务器返回的数据类型
		data: { 'id': bidId },
		success: function (data) {
			if (data.success) {
				var arr = data.data;
				//修改投标保证金递交方式的选择时机（人）  2024-5-31  新版本不再显示保证金转移
				if (arr.bidEctionNum > 1&& arr.depositChannel == 7) {
					$("#transformMoney").show();
					getTransformMoneyInfo();
				}
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function () {
			parent.layer.alert("数据获取失败!");
		}
	});
}

function getTransformMoneyInfo() {
	$.ajax({
		type: "get",
		url: getTransformMoneyInfoUrl,
		async: true,
		dataType: "json",//预期服务器返回的数据类型
		data: { 'packageId': bidId },
		success: function (data) {
			if (data.success) {
				var arr = data.data;

				var html = '';
				html += '<thead style="text-align:center"><tr>' +
					'<td><span>投标人 </span></td>' +
					'<td><span>保证金递交金额 (元)</span></td>' +
					'<td><span>状态</span></td>' +
					'<td><span>转入时间</span></td>' +
					'<td><span>转入状态</span></td>' +
					'</tr></thead>';

				html += '<tbody style="text-align:center">'
				if (arr.length > 0) {
					// 退还状态: 0 - 未退还 1 - 审核中 2 - 退款成功 3 - 退款失败
					var statusText = {
						'0': '未退还',
						'1': '审核中',
						'2': '退款成功',
						'3': '退款失败',
					}
					for (let i = 0; i < arr.length; i++) {
						// const evar checkText = '<input type="checkbox" value="' + i + '" ';lement = array[i];
						var checkText;
						if (arr[i].transferState == 1) {
							checkText = '<span>转出</span>'
						} else if (arr[i].transferState == 2) {
							checkText = '<span>转入</span>'
						} else if (arr[i].transferState == 0) {
							checkText = '<span>未转移</span>'
						} else {
							checkText = '<span>未转移</span>'
						}

						html += '<tr>';
						html += '<td><span>' + arr[i].bidderName + '<span></td>';
						html += '<td><span>' + arr[i].depositTotalPrice + '<span></td>';
						html += '<td><span>' + statusText[arr[i].bankState] + '<span></td>';
						html += '<td><span>' + (arr[i].transferTime ? arr[i].transferTime : '-') + '<span></td>';
						if (arr[i].bankState == '0' || arr[i].bankState == '3') {
							html += '<td>' + checkText + '</td>';
						} else {
							html += '<td><span>不能转入</span></td>';
						}
						html += '</tr>';
					}

				} else {
					html += '<tr><td colspan="5"><span> 暂无保证金相关数据 </span></td></tr>'
				}

				html += '</tbody>'
				$('#transformMoney-table').html(html);
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function () {
			parent.layer.alert("保证金相关数据获取失败!");
		}
	});
}

function passMessage(data, callback) {

	$('#btnSend').click(function () {
		parent.layer.confirm('确定发布？', { icon: 3, title: '询问' }, function (index) {
			sendNotice(noticeId, false, callback);			
			parent.layer.close(index);
		})

		/*if(callback){
			callback()
		}*/
	})
}
//文件表格
function fileHtml(data) {
	$('#fileList tbody').html('');
	var html = '';
	for (var i = 0; i < data.length; i++) {
		if (data[i].tenderMode == '1') {
			data[i].tenderMode = '公开招标'
		} else if (data[i].tenderMode == '1') {
			data[i].tenderMode = '邀请招标'
		}
		html = $('<tr>'
			+ '<td style="width:50px;text-align:center">' + (i + 1) + '</td>'
			+ '<input type="hidden" name="projectAttachmentFiles[' + i + '].attachmentFileName" value="' + data[i].attachmentFileName + '"/>'	//附件文件名
			+ '<input type="hidden" name="projectAttachmentFiles[' + i + '].url" value="' + data[i].url + '"/>'	//附件URL地址
			+ '<td><a href="' + $.parserUrlForToken(fileDownload + '?ftpPath=' + data[i].url + '&fname=' + data[i].attachmentFileName) + '">' + data[i].attachmentFileName + '</a></td>'
			+ '<td style="width:200px;text-align:center">' + data[i].createDate + '</td>'		//附件上传时间
			+ '<td style="width:200px;text-align:center">' + data[i].createEmployeeName + '</td>'		//附件上传人
			+ '<td style="width:150px;text-align:center">' + data[i].attachmentSize + '</td>'		//文件大小
			+ '</tr>');
		$("#fileList tbody").append(html);
	}
};
//获取项目、招标项目、标段相关信息
function getRelevant(id) {
	$.ajax({
		type: "post",
		url: haveInfoUrl,
		async: false,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				var arr = data.data;
				bidCode = arr.interiorBidSectionCode;
				msgInfo = JSON.parse(JSON.stringify(data.data));
				for (var key in arr) {
					if (key == 'signUp') {
						//报名时显示报名开始结束时间
						if (arr.signUp == 0) {//不报名时不显示
							$('.signUp').css({ 'display': 'none' });
						} else if (arr.signUp == 1) {
							$('.signUp').css({ 'display': 'table-row' });
						}
					}
					if (key == "tenderProjectType") {
						$("#tenderProjectTypeTxt").dataLinkage({
							optionName: "TENDER_PROJECT_TYPE",
							optionValue: arr[key],
							status: 2,
							viewCallback: function (name) {
								$("#tenderProjectTypeTxt").html(name)
							}
						});
					} else {
						if (key == "bidType") {	//1为明标，2为暗标
							if (arr.bidType == '1') {
								arr.bidType = '是'
							} else if (arr.bidType == '2') {
								arr.bidType = '否'
							}
						} else if (key == "syndicatedFlag") {	//1为是，2为否
							if (arr.syndicatedFlag == '1') {
								arr.syndicatedFlag = '允许'
							} else if (arr.syndicatedFlag == '0') {
								arr.syndicatedFlag = '不允许'
							}
						} else if (key == "signUpType") {	//报名方式 1.线上报名 2.线下报名
							if (arr.signUpType == '1') {
								arr.signUpType = '线上获取'
							} else if (arr.signUpType == '2') {
								arr.signUpType = '线下获取'
							}
						} else if (key == "bidOpenType") {	//1为线上开标，2为线下开标
							if (arr.bidOpenType == '1') {
								arr.bidOpenType = '线上开标'
							} else if (arr.bidOpenType == '2') {
								arr.bidOpenType = '线下开标'
							}
						} else if (key == "bidCheckType") {	//1线，2为线下
							if (arr.bidCheckType == '1') {
								arr.bidCheckType = '线上评审'
							} else if (arr.bidCheckType == '2') {
								arr.bidCheckType = '线下评审'
							}
						} else if (key == "examType") {	//1为资格预审，2为资格后审
							if (arr.examType == '1') {
								arr.examType = '资格预审'
							} else if (arr.examType == '2') {
								arr.examType = '资格后审'
							}
						} else if (key == "tenderMode") {	//1为资格预审，2为资格后审
							if (arr.tenderMode == '1') {
								arr.tenderMode = '公开招标'
							} else if (arr.tenderMode == '2') {
								arr.tenderMode = '邀请招标'
							}
						}
						else if (key == "priceUnit") {	//1为资格预审，2为资格后审
							if (arr.priceUnit == '1') {
								arr.priceUnit = '万元'
							} else if (arr.priceUnit == '0') {
								arr.priceUnit = '元'
							}
						} else if (key == 'projectCosts') {
							if (arr.projectCosts.length == 0) {
								$('.price').html('无');
							} else {
								if (arr.projectCosts[0].costName == '招标文件费') {
									$('.price').html(arr.projectCosts[0].payMoney);
								}
							}
						}
						$('#' + key).html(arr[key]);
						optionValueView("#" + key, arr[key]);//下拉框信息反显
					}

				}
			}
		}
	});
};
function printbox() {
	var oldContent = document.body.innerHTML;
	document.body.innerHTML = document.getElementById("noticeContent").innerHTML;
	window.print();
	document.body.innerHTML = oldContent;
}
//发布
function sendNotice(bid, state, callback) {
	var sendData = {};
	sendData.id = bid;
	if (state) {
		sendData.confirm = state;
	}
	$.ajax({
		type: "post",
		url: sendUrl,
		async: false,
		data: sendData,
		success: function (data) {
			if (data.success) {
				if (data.data == '1') {
					parent.layer.confirm('公告开始时间小于当前时间，若要继续发布，请点确定?', { icon: 3, title: '询问' }, function (ind) {
						sendNotice(bid, 1, callback)
						parent.layer.close(ind);
					});
				} else if (data.data == '2') {
					if (callback) {
						callback()
					}
					$('#btnSend').css('display', 'none');
					//					parent.tools.refreshFather();
					//					$('#tenderNoticeList').bootstrapTable('refresh');
					parent.layer.alert('发布成功!')
				} else if (data.data == '3') {
					parent.layer.confirm('公告结束时间小于当前时间，若要继续发布，请点确定?', { icon: 3, title: '询问' }, function (ind) {
						sendNotice(bid, 1, callback)
						parent.layer.close(ind);
					});
				}
			} else {
				parent.layer.alert(data.message)
			}
		}

	});
}