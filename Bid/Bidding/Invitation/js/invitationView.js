
/**
*  zhouyan 
*  2019-2-25
*  查看公告
*  方法列表及功能描述
*/

var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var resiveUrl = config.tenderHost + '/BidInviteController/getInviteByBidId.do';//数据回显接口
var historyUrl = config.tenderHost + '/BidInviteController/getHistoryList.do';//查邀请函历史记录
var sendUrl = config.tenderHost + '/BidInviteController/publishNotice.do';//发布地址

var historyView = 'Bidding/Invitation/model/invitationChangeView.html';//查看公告历史详情页面
//var historyUrl = config.tenderHost + '/NoticeController/getHistoryList.do';//历史公告列表
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var priceInfoUrl = config.tenderHost + '/BidSectionController/get.do';// 获取判断二次招标相关信息
var getTransformMoneyInfoUrl = config.depositHost + '/ProjectController/lookBidderReturnState.do';	//获取转移保证金相关数据


var fileUploads = null; //文件上传
var bidId = '';//标段id
var bidInviteId = '';//邀请函id
var bidInviteHistoryId = '';//原邀请函id
var isThrough;
var bidCode;
var RenameData;//投标人更名信息
$(function () {
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'bidInviteIssueContent'
	});
	//	isThrough = $.getUrlParam("isThrough");
	if ($.getUrlParam('bidSectionId') && $.getUrlParam('bidSectionId') != undefined) {
		bidId = $.getUrlParam('bidSectionId');
	}else{
		bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	}
	var isSend = '';//判断是否发送页面
	if ($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		isSend = $.getUrlParam('special');
	}
	if (isSend == 'RELEASE') {
		$('#btnSend').css('display', 'inline-block');
	}

	if ($.getUrlParam('bidInviteId') && $.getUrlParam('bidInviteId') != undefined) {//邀请函id
		bidInviteId = $.getUrlParam('bidInviteId');
	}
	if ($.getUrlParam('bidInviteHistoryId') && $.getUrlParam('bidInviteHistoryId') != undefined) {//原始邀请函id
		bidInviteHistoryId = $.getUrlParam('bidInviteHistoryId');
	}


	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getRelevant(bidId)
	reviseNotice(bidId)
	// 获取标段是否二次招标以及相关保证金信息
	getPriceInfo()
	$("#bulletinDuty").html(entryInfo().userName);
	/*关闭*/
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	if (!fileUploads) {
		fileUploads = new StreamUpload("#fileContent", {
			businessId: bidInviteId,
			status: 2
		});
	}
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: bidInviteId,
		status: 3,
		type: "yqhsp",
		checkState: isThrough
	});

	/*公告邀请函*/
	$.ajax({
		type: "post",
		url: historyUrl,
		async: true,
		data: {
			'inviteId': bidInviteHistoryId,
			'notId': bidInviteId
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
	$('#tenderNoticeList').on('click', '.btnView', function () {
		var historyId = $(this).closest('td').attr('data-notice-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "历史邀请函",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function (layero, index) {

			}
		});
	})


	//历史邀请函
	//每行下载按钮
	$('#tenderNoticeList').on('click', '.btnDownload', function () {
		var historyId = $(this).closest('td').attr('data-notice-id');//历史公告ID
		var newUrl = config.tenderHost + '/BidInviteController/downloadInvite.do?id=' + historyId;
		window.location.href = $.parserUrlForToken(newUrl);
	})

	//下载全部按钮
	$("#downloadAll").click(function () {
		var tds = $("#tenderNoticeList").find("td[data-notice-id]");//历史公告ID
		var historyIds = [];
		for (var i = 0; i < tds.length; i++) {
			var historyId = $(tds[i]).attr('data-notice-id');
			historyIds.push(historyId);
		}

		var newUrl = config.tenderHost + '/BidInviteController/downloadAllInvite.do?ids=' + historyIds.join(",");
		window.location.href = $.parserUrlForToken(newUrl);

	});


	// 公告历史表格
	function historyTable(data) {
		if (data.length > 0){
			$("#downloadAll").css("display","block");
		}

		$("#tenderNoticeList").html('');
		var html = '<tr>'
			+ '<th style="width: 50px; text-align: center;">序号</th>'
			+ '<th>标题</th>'
			+ '<th style="width: 100px; text-align: center;">变更次数</th>'
			+ '<th style="width: 200px; text-align: center;">发送时间</th>'
			+ '<th style="width: 100px; text-align: center;">操作</th>'
			+ '</tr>';
		for (var i = 0; i < data.length; i++) {

			html += '<tr>'
				+ '<td style="width:50px;text-align:center">' + (i + 1) + '</td>'
				//			+'<td style="width: 200px;text-align:center">'+data[i].bidSectionCode+'</td>'
				+ '<td>' + data[i].bidInviteTitle + '</td>'
				+ '<td style="width: 100px;text-align: center;">' + (data[i].changeCount + 1) + '</td>'
				+ '<td style="width: 200px;text-align: center;">' + data[i].bidInviteIssueTime + '</td>'
				+ '<td style="width: 100px;white-space: nowrap;" data-notice-id="' + data[i].id + '"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+ '<button type="button" class="btn btn-primary btn-sm btnDownload"><span class="glyphicon glyphicon-download-alt"></span>下载</button>'
				+ '</td></tr>';
		}
		$(html).appendTo('#tenderNoticeList')

	}
	//全屏查看公告
	$('.fullScreen').click(function () {
		var content = $('#bidInviteIssueContent').html();
		parent.layer.open({
			type: 2
			, title: '查看邀请函信息'
			, area: ['100%', '100%']
			, content: fullScreen
			, resize: false
			, btn: ['确定', '取消']
			, success: function (layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWind = layero.find('iframe')[0].contentWindow;
				body.find('#noticeContent').html(content);
			}
			//确定按钮
			, yes: function (index, layero) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWinds = layero.find('iframe')[0].contentWindow;
				$('#bidInviteIssueContent').html(body.html());
				parent.layer.close(index);

			}
			, btn2: function () {
				parent.layer.close();
			}
		});
	});
	/*打印*/
	$("body").on("click", "#btnPrint", function () {
		//		$('#btnPrint').removeAttr('style');
		var oldContent = $("body").html();
		preview(1, oldContent)
	});
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
				//修改投标保证金递交方式的选择时机（人）  2024-5-31  新版本不再显示保证金转移 && arr.versionNum == 'V1.0'
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
						html += '<td><span>' + showBidderRenameMark(arr[i].bidderId, arr[i].bidderName, RenameData, 'addNotice') + '<span></td>';
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
}
/*修改时信息回显*/
function reviseNotice(dataId) {
	$.ajax({
		type: "post",
		url: resiveUrl,
		async: false,
		data: {
			'bidSectionId': dataId
		},
		dataType: 'json',
		success: function (data) {
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				if (!data.data) {
					return;
				};
				var dataSource = data.data;
				tenderProjectId = dataSource.tenderProjectId
				bidInviteId = dataSource.id;
				bidInviteHistoryId = dataSource.inviteId;
				if (dataSource.bidInviteState == 2) {
					isThrough = 1
				} else {
					isThrough = '0'
				}

				//供应商回显
				if (dataSource.bidInviteEnterprises) {
					enterpriseHtml(dataSource.bidInviteEnterprises);
				}
				//文件回显
				if (dataSource.projectAttachmentFiles) {
					projectAttachmentFiles = dataSource.projectAttachmentFiles;
					if (!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + dataId + "/201",
							businessId: dataId,
							status: 2,
							businessTableName: '',
							attachmentSetCode: 'TENDER_NOTICE'
						});
					}
					fileUploads.fileHtml(projectAttachmentFiles);
				}
				for (var key in dataSource) {
					$("#" + key).html(dataSource[key]);
				}
				mediaEditor.setValue(dataSource);
			}

			//			$('#bidId').val(dataSource.bidSections[0].id); //标段Id
			//			editor.txt.html(dataSource.bidInviteIssueContent);
			//			fileUpload(bidDetail[0].id,id);

		},
		error: function (data) {
			parent.layer.alert("请求失败")
		},
	});

}
function enterpriseHtml(data) {
	//	console.log(data)
	var html = "";
	idList = [];
	if ($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
                	<tr data-id="' + data.id + '">\
                		<th style="width:50px;text-align:center;">序号</th>\
                		<th>企业名称</th>\
                		<th style="width: 300px;text-align:center;">企业编码</th>\
                		<th style="width: 180px;text-align:center;">联系人</th>\
                		<th style="width: 180px;text-align:center;">联系方式</th>\
                		<th style="width: 100px;text-align:center;">回复状态</th>\
                	</tr>';
	}
	for (var i = 0; i < data.length; i++) {
		//		idList.push(data[i].id);
		var inviteState = '';
		if (data[i].inviteState == 0) {
			inviteState = '未回复'
		} else if (data[i].inviteState == 2) {
			inviteState = '<span style="color:green">同意投标</span>'
		} else if (data[i].inviteState == 1) {
			inviteState = '<span style="color:red">放弃投标</span>'
		}
		var code = '';
		var person = '';
		var personTel = '';
		if (data[i].enterpriseCode) {
			code = data[i].enterpriseCode;
		} else if (!data[i].enterpriseCode && data[i].legalCode) {
			code = data[i].legalCode;
		} else if (!data[i].enterpriseCode && !data[i].legalCode) {
			code = '';
		}
		if (data[i].enterprisePerson) {
			person = data[i].enterprisePerson;
		} else if (!data[i].enterprisePerson && data[i].legalContact) {
			person = data[i].legalContact;
		} else if (!data[i].enterprisePerson && !data[i].legalContact) {
			person = '';
		}
		if (data[i].enterprisePersonTel) {
			personTel = data[i].enterprisePersonTel;
		} else if (!data[i].enterprisePersonTel && data[i].legalContactPhone) {
			personTel = data[i].legalContactPhone;
		} else if (!data[i].enterprisePersonTel && !data[i].legalContactPhone) {
			personTel = '';
		}
		html += '<tr>\
            		<td style="width:50px;text-align:center;">' + (i + 1) + '</td>\
            		<td>' + showBidderRenameMark(data[i].enterpriseId, data[i].enterpriseName, RenameData, 'addNotice') + '<input type="hidden" name="bidInviteEnterprises[' + i + '].enterpriseId" value="' + data[i].id + '"/></td>\
            		<td style="width: 300px;text-align:center;">' + code + '</td>\
            		<td style="width: 180px;text-align:center;">' + person + '</td>\
            		<td style="width: 180px;text-align:center;">' + personTel + '</td>\
            		<td style="width: 100px;text-align:center;">'+ inviteState + '</td>\
            	</tr>';
	}

	if ($("#enterpriseTab").length == 0) {
		html += '</table>';
		$("#biderBlock").html("");
		$(html).appendTo("#biderBlock");
	} else {
		$("#enterpriseTab tr:gt(0)").remove();
		$(html).appendTo("#enterpriseTab");
	}
};



//获取项目、招标项目、标段相关信息
function getRelevant(bidId) {
	$.ajax({
		type: "post",
		url: haveInfoUrl,
		async: false,
		data: {
			'id': bidId
		},
		success: function (data) {
			if (data.success) {
				var arr = data.data;
				bidCode = arr.interiorBidSectionCode;
				msgInfo = JSON.parse(JSON.stringify(data.data));
				getRoomList(bidId, '2');//会议室数据
				for (var key in arr) {
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
						if (key == "signUpType") {	//报名方式 1.线上报名 2.线下报名
							if (arr.signUpType == '1') {
								arr.signUpType = '线上获取'
							} else if (arr.signUpType == '2') {
								arr.signUpType = '线下获取'
							}
						} else if (key == "deliverFileType") {	//投标文件递交方式	1.线上递交    2.线下递交
							if (arr.deliverFileType == '1') {
								arr.deliverFileType = '线上递交'
							} else if (arr.deliverFileType == '2') {
								arr.deliverFileType = '线下递交'
							}
						} else if (key == "bidOpenType") {	 // 开标方式 1为线上开标，2为线下开标
							if (arr.bidOpenType == '1') {
								arr.bidOpenType = '线上开标'
							} else if (arr.bidOpenType == '2') {
								arr.bidOpenType = '线下开标'
							}
						}

						/*if(key == "bidType"){	//1为明标，2为暗标
							if(arr.bidType == '1'){
			     				arr.bidType = '是'
			     			}else if(arr.bidType == '2'){
			     				arr.bidType = '否'
			     			}
						}else if(key == "syndicatedFlag"){	//1为是，2为否
							if(arr.syndicatedFlag == '1'){
			     				arr.syndicatedFlag = '允许'
			     			}else if(arr.syndicatedFlag == '0'){
			     				arr.syndicatedFlag = '不允许'
			     			}
						}else if(key == "signUpType"){	//报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1'){
			     				arr.signUpType = '线上获取'
			     			}else if(arr.signUpType == '2'){
			     				arr.signUpType = '线下获取'
			     			}
						}else if(key == "bidOpenType"){	//1为线上开标，2为线下开标
							if(arr.bidOpenType == '1'){
			     				arr.bidOpenType = '线上开标'
			     			}else if(arr.bidOpenType == '2'){
			     				arr.bidOpenType = '线下开标'
			     			}
						}else if(key == "bidCheckType"){	//1线，2为线下
							if(arr.bidCheckType == '1'){
			     				arr.bidCheckType = '线上评审'
			     			}else if(arr.bidCheckType == '2'){
			     				arr.bidCheckType = '线下评审'
			     			}
						}else if(key == "examType"){	//1为资格预审，2为资格后审
							if(arr.examType == '1'){
			     				arr.examType = '资格预审'
			     			}else if(arr.examType == '2'){
			     				arr.examType = '资格后审'
			     			}
						}else if(key == "tenderMode"){	//1为资格预审，2为资格后审
							if(arr.tenderMode == '1'){
			     				arr.tenderMode = '公开招标'
			     			}else if(arr.tenderMode == '2'){
			     				arr.tenderMode = '邀请招标'
			     			}
						}
						else if(key == "priceUnit"){	//1为资格预审，2为资格后审
							if(arr.priceUnit == '1'){
			     				arr.priceUnit = '万元'
			     			}else if(arr.priceUnit == '2'){
			     				arr.priceUnit = '元'
			     			}
						}else if(key == 'projectCosts'){
							if(arr.projectCosts.length == 0){
								$('.price').html('无');
							}else{
								if( arr.projectCosts[0].costName == '招标文件费'){
									if(arr.projectCosts[0].isPay == 0){
										$('.price').html('无');
									}else if(arr.projectCosts[0].isPay == 1){
										$('.price').html(arr.projectCosts[0].payMoney);
									}
									
								}
							}
						}else if(!arr.projectCosts){
							$('.price').html('无');
						}*/
						$('#' + key).html(arr[key]);
						optionValueView("#" + key, arr[key]);//下拉框信息反显
						if (!bidInviteId) {
							$('#bidInviteTitle').val(arr.bidSectionName + '-邀请函')
						}

					}

				}
			}
		}
	});
};
//打印
function preview(oper, html) {
	if (oper < 10) {
		$("#gz").css("right", "100px");
		bdhtml = window.document.body.innerHTML;//获取当前页的html代码
		sprnstr = "<!--startprint" + oper + "-->";//设置打印开始区域
		eprnstr = "<!--endprint" + oper + "-->";//设置打印结束区域
		prnhtml = bdhtml.substring(bdhtml.indexOf(sprnstr) + 18); //从开始代码向后取html
		prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML = prnhtml;
		window.print();
		window.document.body.innerHTML = bdhtml;
		$("#gz").css("right", "10px");
	} else {
		window.print();
	}
	document.body.innerHTML = html;
}
function passMessage(data, callback) {
	$('#btnSend').click(function () {
		parent.layer.confirm('确定发送？', { icon: 3, title: '询问' }, function (index) {
			sendNotice(bidInviteId, false, callback);
			parent.layer.close(index);
		})

	})
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
		async: true,
		data: sendData,
		success: function (data) {
			if (data.success) {
				if (data.data == '1') {
					parent.layer.confirm('投标邀请发出时间小于当前时间，若要继续发送，请点确定?', { icon: 3, title: '询问' }, function (ind) {
						sendNotice(bid, 1, callback)
						parent.layer.close(ind);
					});
				} else if (data.data == '2') {
					if (callback) {
						callback()
					}
					parent.layer.alert('发送成功!')
					$('#btnSend').css('display', 'none');
				} else if (data.data == '3') {
					parent.layer.confirm('投标邀请回复截止时间小于当前时间，若要继续发送，请点确定?', { icon: 3, title: '询问' }, function (ind) {
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
