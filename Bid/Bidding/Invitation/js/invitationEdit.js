/**
 *  2019-05-22 by zhouyan 
 *  编辑、添加邀请函
 *  方法列表及功能描述
 */
var saveUrl = config.tenderHost + "/BidInviteController/save.do"; //保存地址

var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do'; //相关信息回显
//var resiveUrl = config.tenderHost + '/BidInviteController/getAndFile.do';//数据回显接口
var resiveUrl = config.tenderHost + '/BidInviteController/getInviteByBidId.do'; //数据回显接口
var pastBidderUrl = config.tenderHost + '/BidInviteController/findInviteOldList.do'; //获取原标段邀请的投标人

var bidderPreUrl = config.tenderHost + '/BidInviteController/findPretrialBidderrPageList.do'; //预审合格的投标人

var roomOrderHtml = 'Bidding/Invitation/model/roomOrder.html'; //预约会议室

var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //查看标段详情页面
var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面

var preBidderHtml = "Bidding/Invitation/model/preEnterpriseList.html"; //预审合格的投标人列表

var priceInfoUrl = config.tenderHost + '/BidSectionController/get.do'; // 获取判断二次招标相关信息
var sendTransformMoneyUrl = config.tenderHost + '/DepositController/insertSendDeposit'; // 上传转移保证金数据
var getTransformMoneyInfoEditUrl = config.depositHost + '/ProjectController/findBidderReturnState.do'; //获取转移保证金相关数据
var getTransformMoneyInfoViewUrl = config.depositHost + '/ProjectController/lookBidderReturnState.do';

var copyUrl = config.tenderHost + "/BidInviteController/copy.do"; //变更
var getProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do'; //获取招标项目，标段基本信息
var testDateUrl = config.Syshost + '/HolidaySettingController/getReallyNoticeDate.do';//查询真正的截止日期

var tenderProjectId = ''; //招标项目id
var bidDetail; //从父级传过来的标段详情
var id = ''; //公告列表中带过来的ID
var bidId = ''; //一对一时的标段Id
var projectAttachmentFiles = []; //存放附件信息并传给后台

var fileUploads = null; //上传文件
var biderData = []; //投标人列表
var step = 1; //时间插件间隔分钟数
var bidInviteId = ''; //邀请函id
var inviteId = ''; //邀请函原始id
//var isTender;//是否只编辑投标人0：否，1：是
var tenderProjectType; //招标项目类型
var ue;
var CAcf = null; //实例化CA
var noticeNature = "";
var isLaw = ''; //是否依法0 否 1 是
var examType = ''; //资格审查方式
var source = ''; //1： 需要显示历史投标人（后审重新招标时）
var historyBidders = []; //历史投标人

var transformBidder; //保存保证金

var special = ''; //以此判断是不是控制台过来的变更

var bidCode;
var changeCount = 0; // 公告变更计数
var sendTransformMoney = true;//是否上传转移保证金数据
var isChangeDeposit = false; /**线上虚拟子账号是否变更 0 未变更 1 已变更*/
var isPre = ''; //预审还是后审
var signUpType;
var deliverFileType;
var bidSectionName;
var RenameData;//投标人更名信息
$(function() {
	//初始化编辑器
	// ue = UE.getEditor('container');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'bidInviteIssueContent'
	});

	//	id = $.getUrlParam('id'); //公告列表中带过来的ID
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	$('#bidId').val(bidId); //标段Id
	examType = $.getUrlParam('examType'); //资格审查方式
	if($.getUrlParam('bidInviteIssueNature') && $.getUrlParam('bidInviteIssueNature') != undefined) {
		noticeNature = $.getUrlParam('bidInviteIssueNature');
	}
	if($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		special = $.getUrlParam('special');
	}

	getRelevant(bidId);
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	var isContinu = true;
	if(special == 'CHANGE') {
		$.ajax({
			type: "post",
			url: copyUrl,
			async: false,
			dataType: "json", //预期服务器返回的数据类型
			data: {
				'bidSectionId': bidId,
				'bidSectionName': bidSectionName,
			},
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function(data) {
				if(data.success) {
					reviseNotice();
				} else {
					parent.layer.alert(data.message, {
						icon: 7,
						title: '提示'
					});
					isContinu = false;
				}
			},
			error: function() {
				parent.layer.alert("变更失败！");
				isContinu = false;
			}
		});
	} else {
		reviseNotice();
	}

	if(!isContinu) {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
		return
	}
	//	isTender = $.getUrlParam('isTender');//是否只编辑投标人0：否，1：是

	// 获取标段是否二次招标以及相关保证金信息
	getPriceInfo();

	/*重新招标的第一次编辑(不是变更)时显示上次邀请的投标人*/
	if(source == 1 && (noticeNature == '' || noticeNature == '1')) {
		getHistoryBidder(bidId)
	}

	if($.getUrlParam('bidInviteId') && $.getUrlParam('bidInviteId') != undefined) { //邀请函id
		bidInviteId = $.getUrlParam('bidInviteId');
	}
	if($.getUrlParam('bidInviteHistoryId') && $.getUrlParam('bidInviteHistoryId') != undefined) { //原始邀请函id
		inviteId = $.getUrlParam('bidInviteHistoryId');
	}

	$("#bulletinDuty").val(entryInfo().userName);
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: id,
		status: 1,
		type: "yqhsp",
	});
	//选择邀请投标人
	$("#btnBider").click(function() {
		openEnterprise();
	});
	// 移除投标人
	$("#biderBlock").on("click", ".btnDelBider", function() {
		var index = $(this).attr("data-index");
		parent.layer.confirm('确定删除该投标人？', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			parent.layer.close(ind);
			biderData.splice(index, 1);
			$("#biderBlock").html("");
			enterpriseHtml(biderData);
		})

	});

	//模板下拉框
	modelOption({
		tempType: 'invite',
		examType: 2
	});

	//下拉列表数据初始化
	initSelect('.select');
	//重置时间
	$("#emptyTime").click(function() {
		$('.times').val('').css('color','#555');
		$('#bidInviteIssueTime').val('');
		$('.holidayTips').remove();
	})

	/*************************************************Start邀请函时间********************************************************/

	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//公告发布时间
	$('#bidInviteIssueTime').focus(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr().replace(/\-/g, "/"); //选中的时间
				var timeArr = [];
				var times = $('.times');
				$.each(times, function() {
					if($(this).val() != '' && $(this).val() != undefined) {
						timeArr.push($(this).val())
					}
				});
				if(selectTime && selectTime != '') {
					//招标公告发布截止时间、投标文件递交截止时间、
					var arr = [automatic(selectTime, 5, '1'), automatic(selectTime, 20, '2')]
					if(timeArr.length == 0) {
						//从后台获取真正的截止时间
						$.ajax({
							type: "post",
							url: testDateUrl,
							async: true,
							data: {'dateList': arr},
							success: function (data) {
								if (data.success) {
									if(data.data){
										$('#inviteAnswersEndDate').val(data.data[0]); //招标公告发布截止时间
										$('#docGetEndTime').val(data.data[0]); //招标文件获取截止时间
										$('#bidDocReferEndTime').val(data.data[1]); //投标文件递交截止时间
										$('#bidOpenTime').val(data.data[1]); //开标时间
									}
								} else {
									top.layer.alert(data.message)
								}
							}
						});
						$('#docGetStartTime').val(automatic(selectTime, 0)); //招标文件获取开始时间
						$('#clarifyTime').val(automatic(selectTime, 5)); //提出澄清截止时间
						$('#answersEndDate').val(automatic(selectTime, 8)); //答复截止时间
					}
				}
			}
		})
	});
	newChangeTimes();
	/* $('.Wdate').focus(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: nowDate,
		})
	}); */

	/*************************************************End邀请函时间********************************************************/

	/*两个日期之间相差的天数*/
	function daysBetween(startTime, endTime) {
		//Date.parse() 解析一个日期时间字符串，并返回1970/1/1 午夜距离该日期时间的毫秒数
		var time1 = Date.parse(new Date(startTime));
		var time2 = Date.parse(new Date(endTime));
		var nDays = parseInt((time2 - time1) / 1000 / 3600 / 24);
		return nDays;
	};

	/*全屏*/
	$('.fullScreen').click(function() {
		parent.layer.open({
			type: 2,
			title: '编辑公告信息',
			area: ['100%', '100%'],
			content: 'fullScreen.html',
			resize: false,
			btn: ['确定', '取消'],
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				iframeWind.ue.ready(function() {
					//设置编辑器的内容
					iframeWind.ue.setContent(ue.getContent())
				});
			},
			//确定按钮
			yes: function(index, layero) {
				var iframeWinds = layero.find('iframe')[0].contentWindow;
				ue.setContent(iframeWinds.ue.getContent());
				parent.layer.close(index);

			},
			btn2: function() {
				parent.layer.close();
			}
		});
	})
	//	editor.txt.html('xjkasj')

});
// 获取招标项目相关信息.
function getPriceInfo() {
	$.ajax({
		type: "post",
		url: priceInfoUrl,
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: {
			'id': bidId
		},
		success: function(data) {
			if(data.success) {
				var arr = data.data;
				//修改投标保证金递交方式的选择时机（人）  2024-5-31  新版本不再显示保证金转移 && arr.versionNum == 'V1.0'
				if(arr.bidEctionNum > 1 && arr.depositChannel == 7) {
					if(changeCount > 0) {
						$("#transformMoney").hide();
					} else {
						if(arr.isChangeDeposit == 1){//已变更，不支持转移
							isChangeDeposit = true;
							$("#transformMoney").hide();
						}else{
							$("#transformMoney").show();
							getTransformMoneyInfo();
						}
					}
				} else {
					sendTransformMoney = false;
				}
				if(changeCount > 0) {
					sendTransformMoney = false;
				}
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function() {
			parent.layer.alert("数据获取失败!");
		}
	});
}

function getTransformMoneyInfo() {
	var url;
	if(changeCount > 0) {
		url = getTransformMoneyInfoViewUrl;
	} else {
		url = getTransformMoneyInfoEditUrl;
	}
	$.ajax({
		type: "get",
		url: url,
		async: true,
		dataType: "json", //预期服务器返回的数据类型
		data: {
			'packageCode': bidCode
		},
		success: function(data) {
			if(data.success) {
				var arr = data.data;
				transformBidder = arr;

				var html = '';
				html += '<thead style="text-align:center"><tr>' +
					'<td><span>投标人</span></td>' +
					'<td><span>保证金递交金额 (元)</span></td>' +
					'<td><span>状态</span></td>' +
					'<td><span>转入时间</span></td>';
				if(changeCount > 0) {
					html += '<td><span>转入状态</span></td>';
				} else {
					html += '<td><span>操作</span></td>';
				}
				html += '</tr></thead>';

				html += '<tbody style="text-align:center">'
				if(arr.length > 0) {
					// 退还状态: 0 - 未退还 1 - 审核中 2 - 退款成功 3 - 退款失败
					var statusText = {
						'0': '未退还',
						'1': '审核中',
						'2': '退款成功',
						'3': '退款失败',
					}
					for(let i = 0; i < arr.length; i++) {
						// const element = array[i];
						var checkText = '';
						if(changeCount > 0) {
							if(arr[i].transferState == 1) {
								checkText = '<span>转出</span>'
							} else if(arr[i].transferState == 2) {
								checkText = '<span>转入</span>'
							} else if(arr[i].transferState == 0) {
								checkText = '<span>未转移</span>'
							} else {
								checkText = '<span>未转移</span>'
							}
						} else {
							checkText += '<input type="checkbox" value="' + i + '" ';
							if(arr[i].transferState == 2 || arr[i].transferState == 3) {
								checkText += 'checked';
							}
							checkText += '> <span>保证金转移到本项目</span>';
						}

						html += '<tr>';
						html += '<td><span>' + showBidderRenameMark(arr[i].bidderId, arr[i].bidderName, RenameData, 'addNotice') + '<span></td>';
						html += '<td><span>' + arr[i].depositTotalPrice + '<span></td>';
						html += '<td><span>' + statusText[arr[i].bankState] + '<span></td>';
						html += '<td><span>' + (arr[i].transferTime ? arr[i].transferTime : '-') + '<span></td>';
						if(arr[i].bankState == '0' || arr[i].bankState == '3') {
							html += '<td>' + checkText + '</td>';
						} else {
							html += '<td></td>';
						}
						html += '</tr>';
					}

				} else {
					// sendTransformMoney = false;
					html += '<tr><td colspan="5"><span> 暂无保证金相关数据 </span></td></tr>'
				}

				html += '</tbody>'
				$('#transformMoney-table').html(html);
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function() {
			parent.layer.alert("保证金相关数据获取失败!");
		}
	});
}

function sendTransformMoneyInfo() {
	var bidderInfos = [];
	$.each($("#transformMoney-table :checkbox"), function(i, e) {
		if($(this).is(":checked")) {
			let thisIndex = $(this).val();
			bidderInfos.push(transformBidder[thisIndex]);
		}
	})

	$.ajax({
		type: "post",
		url: sendTransformMoneyUrl,
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: {
			'packageId': bidId,
			'bidOpenTime': $('#bidOpenTime').val(),
			'isSubmit': 2,
			'bidderInfos': bidderInfos,
		},
		success: function(data) {
			if(data.success) {
				var arr = data.data;
			} else {
				parent.layer.alert("保证金转移异常!");
			}
		},
		error: function() {
			parent.layer.alert("保证金转移异常!");
		}
	});
}
//保存state：0:保存，1：提交审核
function save(state, isBtn, callback, back) {

	if(state == 1) {
		if(!CAcf) {
			CAcf = new CA({
				target: "#addNotice",
				confirmCA: function(flag) {
					if(!flag) {
						return;
					}
					var bidCodes = [];
					var arr = {};

					$('#bidInviteIssueContent').val(ue.getContent());
					arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
					for(var i = 0; i < $('.bidCodes').length; i++) {
						bidCodes.push($('.bidCodes').eq(i).html())
					}
					var noticeMedia = '襄阳市人民政府门户网站;襄阳市公共资源交易网;湖北省公共资源交易电子服务平台';
					if(state == 1) {
						arr.isSubmit = 1;
					}
					savePost(state, isBtn, callback, arr, back);
				}
			});
		}
		CAcf.sign();
	} else {
		var bidCodes = [];
		var arr = {};

		$('#bidInviteIssueContent').val(ue.getContent());
		arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
		for(var i = 0; i < $('.bidCodes').length; i++) {
			bidCodes.push($('.bidCodes').eq(i).html())
		}
		var noticeMedia = '襄阳市人民政府门户网站;襄阳市公共资源交易网;湖北省公共资源交易电子服务平台';
		savePost(state, isBtn, callback, arr, back);
	}

}

function savePost(state, isBtn, callback, arr, back) {
	if(sendTransformMoney) {
		sendTransformMoneyInfo();
	}
	// if (arr.inviteAnswersEndDate) {
	// 	if (arr.inviteAnswersEndDate.length === 16) {
	// 		arr.inviteAnswersEndDate += ':59';
	// 	}
	// }
	// if (arr.docGetEndTime) {
	// 	if (arr.docGetEndTime.length === 16) {
	// 		arr.docGetEndTime += ':59';
	// 	}
	// }
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: arr,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				bidInviteId = data.data;
				$('[name="inviteId"]').val(inviteId);
				if(back) {
					back(data.data);
				}
				if(callback) {
					callback();
				}

				if(!inviteId) {
					inviteId = data.data;
					$('#bidInviteHistoryId').val(data.data);
				}
				if(state == '0') {
					if(isBtn) {
						parent.layer.alert("保存成功！", {
							icon: 1,
							title: '提示'
						});
					}
					reviseNotice();
				} else {
					parent.layer.alert("提交成功！", {
						icon: 1,
						title: '提示'
					});
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				}
				parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message);
				reviseNotice();
			}
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}

	});
}

/*修改时信息回显*/
function reviseNotice(dataId) {
	$.ajax({
		type: "post",
		url: resiveUrl,
		async: false,
		data: {
			//			'id': dataId,
			'bidSectionId': bidId
		},
		dataType: 'json',
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				if(data.data) {
					var dataSource = data.data;
					bidInviteId = dataSource.id;
					// 保存变更次数;
					changeCount = dataSource.changeCount;
					if(dataSource.inviteId) {
						inviteId = dataSource.inviteId
					}
					noticeNature = dataSource.bidInviteIssueNature;

					tenderProjectId = dataSource.tenderProjectId
					//投标人回显
					if(dataSource.bidInviteEnterprises) {
						if(dataSource.bidInviteEnterprises.length > 0) {
							biderData = dataSource.bidInviteEnterprises;
							for(var i = 0; i < biderData.length; i++) {
								if(biderData[i].inviteState == 2 || biderData[i].inviteState == 1) {
									biderData[i].isDisabled = true;
								} else {
									biderData[i].isDisabled = false;
								}
								biderData[i].danweiguid = biderData[i].enterpriseId;
							}
							enterpriseHtml(dataSource.bidInviteEnterprises);
						} else {
							//资格预审标段新增邀请函时投标人列表
							if(isPre == 1) {
								getBidderPre()
							}
						}

					} else {
						//资格预审标段新增邀请函时投标人列表
						if(isPre == 1) {
							getBidderPre()
						}
					}
					//文件回显
					if(dataSource.projectAttachmentFiles) {
						projectAttachmentFiles = dataSource.projectAttachmentFiles;
						if(!fileUploads) {
							fileUploads = new StreamUpload("#fileContent", {
								basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + dataId + "/201",
								businessId: dataSource.id,
								status: 1,
								businessTableName: '',
								attachmentSetCode: 'T_BID_INVITE'
							});
						}
						fileUploads.fileHtml(projectAttachmentFiles);
					}

					if(noticeNature == 2 || (dataSource.bidInviteIssueNature && dataSource.bidInviteIssueNature == 2)) {
						/*********     区别正常邀请函与变更邀请函的页面显示     *********/
						$('.normalNoticeTime').html($('.oleNoticeTime').html());
						$('.oleNoticeTime').html('');
						//日历
						var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
						//开始时间
						newChangeTimes()
						/*********     区别正常公告与变更公告的页面显示 end    *********/
						processTime(dataSource)
					} else {
						/*********     区别正常公告与变更公告的页面显示     *********/
						$('.oleNoticeTime').html('')
						/*********     区别正常公告与变更公告的页面显示 end    *********/
					}
					$('#deliverFileType').html(deliverFileType);
					$('#signUpType').html(signUpType);
					for(var key in dataSource) {
						$("[name=" + key + "]").val(dataSource[key]);
						if(key == 'inviteAnswersEndDate' || key == 'docGetEndTime' || key == 'bidDocReferEndTime' || key == 'bidOpenTime'){
							dateInHolidayTip(dataSource[key], ('#' + key));//当公示截止时间落在节假日Bidding/Model/js/public.js；
						}
					}
					mediaEditor.setValue(dataSource);
					// if(dataSource.bidInviteIssueContent) {
					// 	ue.ready(function() {
					// 		ue.setContent(dataSource.bidInviteIssueContent);
					// 	});
					// }
					if(dataSource.bidInviteOldTime) {
						for(var k in dataSource.bidInviteOldTime) {
							$("#old" + k).html(dataSource.bidInviteOldTime[k]);
						}
					}

					/* if (noticeNature == 2) {
						var nowDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));

						var bidInviteIssueTime = Date.parse(new Date($('#bidInviteIssueTime').val().replace(/\-/g, "/")));		//投标邀请发出时间
						var inviteAnswersEndDate = Date.parse(new Date($('#inviteAnswersEndDate').val().replace(/\-/g, "/")));		//投标邀请回复截止时间
						var docGetStartTime = Date.parse(new Date($('#docGetStartTime').val().replace(/\-/g, "/")));		//文件获取开始时间
						var docGetEndTime = Date.parse(new Date($('#docGetEndTime').val().replace(/\-/g, "/"))); 		//文件获取截止时间
						var clarifyTime = Date.parse(new Date($('#clarifyTime').val().replace(/\-/g, "/"))); 		//提出澄清截止时间
						var answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g, "/"))); 		//答复截止时间
						var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g, "/"))); 		//申请文件递交截止时间
						var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g, "/")));		//开标时间

						var dateData = {
							bidInviteIssueTime: bidInviteIssueTime,
							// inviteAnswersEndDate:inviteAnswersEndDate, 
							docGetStartTime: docGetStartTime,
							// docGetEndTime:docGetEndTime, 
							// clarifyTime:clarifyTime, 
							// answersEndDate:answersEndDate, 
							// bidDocReferEndTime:bidDocReferEndTime, 
							// bidOpenTime:bidOpenTime
						};
						for (var k in dateData) {
							if (nowDate > dateData[k]) {
								$("#" + k).attr("disabled", "disabled");
							}
						}
					} */
				} else {
					if(isPre == 1) {
						getBidderPre()
					}
				}
			}

			//			$('#bidId').val(dataSource.bidSections[0].id); //标段Id
			//			fileUpload(bidDetail[0].id,id);

		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});
}

/*********************      变更公告处理时间        **************************/
function processTime(timeData) {
	var nowDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));

	var bidInviteIssueTime = Date.parse(new Date(timeData.bidInviteIssueTime.replace(/\-/g, "/"))); //投标邀请发出时间
	var inviteAnswersEndDate = Date.parse(new Date(timeData.inviteAnswersEndDate.replace(/\-/g, "/"))); //投标邀请回复截止时间
	var docGetStartTime = Date.parse(new Date(timeData.docGetStartTime.replace(/\-/g, "/"))); //文件获取开始时间
	var docGetEndTime = Date.parse(new Date(timeData.docGetEndTime.replace(/\-/g, "/"))); //文件获取截止时间
	var clarifyTime = Date.parse(new Date(timeData.clarifyTime.replace(/\-/g, "/"))); //提出澄清截止时间
	var answersEndDate = Date.parse(new Date(timeData.answersEndDate.replace(/\-/g, "/"))); //答复截止时间
	var bidDocReferEndTime = Date.parse(new Date(timeData.bidDocReferEndTime.replace(/\-/g, "/"))); //申请文件递交截止时间
	var bidOpenTime = Date.parse(new Date(timeData.bidOpenTime.replace(/\-/g, "/"))); //开标时间

	var dateData = {
		bidInviteIssueTime: bidInviteIssueTime,
		// inviteAnswersEndDate:inviteAnswersEndDate, 
		docGetStartTime: docGetStartTime,
		// docGetEndTime:docGetEndTime, 
		// clarifyTime:clarifyTime, 
		// answersEndDate:answersEndDate, 
		// bidDocReferEndTime:bidDocReferEndTime, 
		// bidOpenTime:bidOpenTime
	};
	for(var k in dateData) {
		if(nowDate > dateData[k]) {
			$("#" + k).attr("disabled", "disabled");
		}
	}
}

function passMessage(data, callback) {
	var newData = [];
	newData.push(data);
	bidDetail = newData;
	if(data.bidInviteIssueNature) {
		noticeNature = data.bidInviteIssueNature;
	}

	//	bidderHtml(newData);
	//将标段相关信息保存到页面的隐藏域，提交的时候需要提交到后台
	for(var key in data) {
		$('[data-name=' + key + ']').val(data[key]);
	}
	//	bidId = data.id;
	tenderProjectId = data.tenderProjectId;
	//	$('#bidId').val(data.id); //标段Id

	$("#btnModel").click(function() {
		var modelId = $('#noticeTemplate option:selected').attr('data-model-id'); //选中的模板的id
		var modelUrl = $('#noticeTemplate option:selected').attr('data-model-url'); //选中的模板的url
		var hashtml = ue.hasContents();
		if(hashtml) {
			parent.layer.confirm('确定替换模板？', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index)
				save(0, false, callback)
				modelHtml({
					'tempBidFileid': modelId, //模板Id
					'bidSectionId': bidId,
					'examType': 2
				});
			});
		} else {
			save(0, false, callback)
			modelHtml({
				'tempBidFileid': modelId, //模板Id
				'bidSectionId': bidId,
				'examType': 2
			});
		}

	});
	$('#fileUp').click(function() {
		if(!(bidInviteId != "" && bidInviteId != null)) {
			save(0, false, callback, function(businessId) {
				bidInviteId = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + bidInviteId + "/201",
						businessId: bidInviteId,
						status: 1,
						businessTableName: '',
						attachmentSetCode: 'T_BID_INVITE'
					});
				}
				$('#fileLoad').trigger('click');
			});
		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + bidInviteId + "/201",
					businessId: bidInviteId,
					status: 1,
					businessTableName: '',
					attachmentSetCode: 'T_BID_INVITE'
				});
			}
			$('#fileLoad').trigger('click');
		}

	});

	/*保存*/
	$('#btnSave').click(function() {
		//投标人黑名单验证
		if(biderData != null && biderData.length > 0) {
			var strHtml = '';
			var flag = false;
			for(var i = 0; i < biderData.length; i++) {
				var parm = checkBlackList(biderData[i].organNo ? biderData[i].organNo : biderData[i].enterpriseCode, tenderProjectType, 'b1');
				if(parm.isCheckBlackList&&biderData[i].newFlag) {
					flag = true;
					strHtml += parm.message;
					strHtml += "<br/>";
				}
			}
			if(flag) {
				parent.layer.alert(strHtml, {
					icon: 7,
					title: '提示'
				});
				return;
			}
		}
		save(0, true, callback);
	})
	/*提交*/
	$('#btnSubmit').click(function() {

		var bidInviteIssueTime = Date.parse(new Date($('#bidInviteIssueTime').val().replace(/\-/g, "/"))); //投标邀请发出时间
		var inviteAnswersEndDate = Date.parse(new Date($('#inviteAnswersEndDate').val().replace(/\-/g, "/"))); //投标邀请回复截止时间
		var docGetStartTime = Date.parse(new Date($('#docGetStartTime').val().replace(/\-/g, "/"))); //文件获取开始时间
		var docGetEndTime = Date.parse(new Date($('#docGetEndTime').val().replace(/\-/g, "/"))); //文件获取截止时间
		var clarifyTime = Date.parse(new Date($('#clarifyTime').val().replace(/\-/g, "/"))); //提出澄清截止时间
		var answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g, "/"))); //答复截止时间
		var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g, "/"))); //申请文件递交截止时间
		var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g, "/"))); //开标时间

		if(inviteAnswersEndDate <= bidInviteIssueTime) {
			parent.layer.alert('投标邀请回复截止时间应在投标邀请发出时间之后！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(docGetStartTime < bidInviteIssueTime || docGetStartTime > inviteAnswersEndDate) {
			parent.layer.alert('招标文件获取时间应大于等于投标邀请发出时间，投标邀请回复截止时间之前！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(docGetEndTime < docGetStartTime || docGetEndTime == docGetStartTime) {
			parent.layer.alert('招标文件获取截止时间应在招标文件获取时间之后！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(clarifyTime < docGetEndTime) {
			parent.layer.alert('提出澄清截止时间应大于等于文件获取截止时间！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(answersEndDate < clarifyTime || answersEndDate == clarifyTime) {
			parent.layer.alert('答复截止时间应在提出澄清截止时间之后！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(bidDocReferEndTime < answersEndDate) {
			parent.layer.alert('投标文件递交截止时间应答复截止时间之后！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		if(bidOpenTime != bidDocReferEndTime) {
			parent.layer.alert('开标时间应与投标文件递交截止时间一致！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFive').collapse('show');
			});
			return
		}
		//邀请回复截止时间与发出时间相差的天数
		var differTime = inviteAnswersEndDate - bidInviteIssueTime;
		var time1 = docGetEndTime - docGetStartTime;
		var time2 = bidOpenTime - bidInviteIssueTime;
		var time3 = bidDocReferEndTime - clarifyTime;
		var time4 = bidDocReferEndTime - docGetStartTime;
		var time5 = answersEndDate - clarifyTime;
		var times = 5 * 24 * 60 * 60 * 1000;
		var times20 = 20 * 24 * 60 * 60 * 1000;
		var times2 = 2 * 24 * 60 * 60 * 1000;
		var times3 = 3 * 24 * 60 * 60 * 1000;
		var times15 = 15 * 24 * 60 * 60 * 1000;
		if(verifyTime) {
			if(isLaw == 1) {
				if(differTime < times) {
					parent.layer.alert('依法招标的项目，邀请回复截止时间与发出时间相差的天数要至少5天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time1 < times) {
					parent.layer.alert('依法招标的项目，招标文件获取时间不少于5天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time3 < times15) {
					parent.layer.alert('依法招标的项目，提出澄清截止时间（至少投标截止时间前15天提出）', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time5 > times3) {
					parent.layer.alert('依法招标的项目，答复截止时间距离提出澄清截止时间不超过3天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time4 < times20) {
					parent.layer.alert('依法招标的项目，投标文件递交截止时间距离招标文件获取开始时间不少于20天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time2 < times20) {
					parent.layer.alert('依法招标的项目，开标时间与邀请发出时间相差的天数要大于等于20天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}

			}
		}

		if(!isRoom) {
			parent.layer.alert('请预约会议室！', function(ind) {
				parent.layer.close(ind);
				//				$('.collapse').collapse('hide');
				$('#collapseFour').collapse('show');
			});
			return
		}
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if(!mediaEditor.isValidate()) {
				$('#collapseSeven').collapse('show');
				return
			}
			if(isLaw == 1) {
				if(biderData.length < 3) {
					parent.layer.alert('依法招标项目至少有3个投标人！', function(ind) {
						parent.layer.close(ind);
						$('#collapseSix').collapse('show');
					})
					return
				}
			} else if(isLaw == 0) {
				if(biderData.length == 0) {
					parent.layer.alert('请选择投标人！', function(ind) {
						parent.layer.close(ind);
						$('#collapseSix').collapse('show');
					})
					return
				}
			}
			//投标人黑名单验证
			/* for(var i=0;i<biderData.length;i++){
				if(checkBlackList(biderData[i].organNo?biderData[i].organNo:biderData[i].enterpriseCode,tenderProjectType,'b1')){
					return;
				}
			} */
			//投标人黑名单验证
			if(biderData != null && biderData.length > 0) {
				var strHtml = '';
				var flag = false;
				for(var i = 0; i < biderData.length; i++) {
					var parm = checkBlackList(biderData[i].organNo ? biderData[i].organNo : biderData[i].enterpriseCode, tenderProjectType, 'b1');
					if(parm.isCheckBlackList&&biderData[i].newFlag) {
						flag = true;
						strHtml += parm.message;
						strHtml += "<br/>";
					}
				}
				if(flag) {
					parent.layer.alert(strHtml, {
						icon: 7,
						title: '提示'
					});
					return;
				}
			}

			// 检测保证金相关数据
			let isalert = false;
			var text = '';
			if(isChangeDeposit){
				isalert = true;
				text = '<span style="font-weight: bold;">重新采购时保证金生成虚拟子账户银行与上一次有差异，请您谨慎操作并<span style="color: #BB2413;">尽快退还上一项目的保证金</span>。</span>';
			}else{
				text = '<span>邀请{'
				var textarr = [];
				$.each($("#transformMoney-table :checkbox"), function(i, e) {
					if(!$(this).is(":checked")) {
						isalert = true;
						let thisIndex = $(this).val();
						textarr.push(transformBidder[thisIndex].bidderName);
					}
				})
				
				text += textarr.join(',');
				text += '}</span><span>保证金没有转移到本项目，确认不转移吗？</span>';
			}
			if(isalert) {
				parent.layer.confirm(text, {
					btn: ['确定', '取消'],
					title: "温馨提示"
				}, function() {
					if($("#addChecker").length <= 0) {
						parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
							title: '提交审核',
							btn: [' 是 ', ' 否 '],
							yes: function(layero, index) {
								save(1, false, callback);
							},
							btn2:function(index, layero) {
								parent.layer.close(index);
							}
						})
					} else {
						parent.layer.alert('确认提交审核？', function(index) {
							save(1, false, callback);
							//parent.layer.close(index);
						})
					}

				});
			} else {
				if($("#addChecker").length <= 0) {
					parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
						title: '提交审核',
						btn: [' 是 ', ' 否 '],
						yes: function(layero, index) {
							save(1, false, callback);
						},
						btn2:function(index, layero) {
							parent.layer.close(index);
						}
					})
				} else {
					parent.layer.alert('确认提交审核？', function(index) {
						save(1, false, callback);
						//parent.layer.close(index);
					})
				}

			}
			// parent.layer.alert('确认提交审核？', function (index) {
			// 	save(1, false, callback);
			// 	parent.layer.close(index);
			// })		
		}
	})
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
}

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();

	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1], t[2], 0);
	return date;
}

/*
 * 打开投标人页面
 */
function openEnterprise() {
	var jumpHtml = '';
	jumpHtml = preBidderHtml; //预审后审合并用一个页面
	/* if (isPre == 1) {
		jumpHtml = preBidderHtml;
	} else {
		jumpHtml = enterprisePage;
	} */
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "投标人",
		area: ['1000px', '650px'],
		resize: false,
		content: jumpHtml + '?bidId=' + bidId,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({
				isMulti: true,
				biderData: biderData,
				enterpriseType: 3,
				callback: enterpriseCallback,
				isDisabled: true,
				examType: isPre, //1:预审 else：后审
				tenderProjectType: tenderProjectType //招标项目类型
			}); //调用子窗口方法，传参

		}
	});
}

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data) {
	var temporaryData = biderData; //临时存储编辑也投标人
	biderData = [];
	//	biderData = data;
	for(var i = 0; i < data.length; i++) {
		biderData.push(data[i])
		for(var j = 0; j < temporaryData.length; j++) {
			var contrastId = '';
			temporaryData[j].enterpriseId ? contrastId = temporaryData[j].enterpriseId : temporaryData[j].id ? contrastId = temporaryData[j].id : '';
			if(contrastId == data[i].danweiguid) { //若临时存储的数据与选中的数据相同则取用临时存储数据
				if($('#enterpriseTab .person').eq(i).hasClass('can_change')) {
					biderData[i].enterprisePerson = $('#enterpriseTab .person').eq(i).val();
					biderData[i].enterprisePersonTel = $('#enterpriseTab .personTel').eq(i).val();
				}
			}
		}
	}
	enterpriseHtml(biderData);
}

/**
 * 投标人
 * @param {Object} data
 */
function enterpriseHtml(data) {
	
	var html = "";
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">';
		html += '<tr data-id="' + data.enterpriseId + '">';
		html += '<th style="width:50px;text-align:center;">序号</th>';
		html += '<th>企业名称</th>';
		html += '<th style="width: 300px;text-align:center;">社会信用代码</th>';
		html += '<th style="width: 180px;text-align:center;">联系人<i class="red">*</i></th>';
		html += '<th style="width: 180px;text-align:center;">联系方式<i class="red">*</i></th>';
		html += '<th style="width: 100px;text-align:center;">操作</th>';
		html += '</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		var btnRemove = '<button type="button" data-index="' + i + '" class="btn btn-danger btn-sm btnDelBider"><span class="glyphicon glyphicon-remove"></span>移除</button>';
		var code = '';
		var person = '';
		var personTel = '';
		if(!data[i].inviteState) {
			data[i].inviteState = 0;
		}
		if(!data[i].enterpriseId) {
			data[i].enterpriseId = data[i].id;
		}
		if(data[i].enterpriseCode) {
			code = data[i].enterpriseCode;
		} else if(!data[i].enterpriseCode && data[i].legalCode) {
			code = data[i].legalCode;
		} else if(!data[i].enterpriseCode && !data[i].legalCode) {
			code = '';
		}
		if(data[i].enterprisePerson) {
			person = data[i].enterprisePerson;
		} else if(!data[i].enterprisePerson && data[i].legalContact) {
			person = data[i].legalContact;
		} else if(!data[i].enterprisePerson && !data[i].legalContact) {
			person = '';
		}
		if(data[i].enterprisePersonTel) {
			personTel = data[i].enterprisePersonTel;
		} else if(!data[i].enterprisePersonTel && data[i].legalContactPhone) {
			personTel = data[i].legalContactPhone;
		} else if(!data[i].enterprisePersonTel && !data[i].legalContactPhone) {
			personTel = '';
		}
		/*判断是否历史投标人*/
		if(historyBidders.length > 0) {
			for(var j = 0; j < historyBidders.length; j++) {
				if(data[i].enterpriseId == historyBidders[j].enterpriseId) {
					data[i].isHistory = '1';
				}
			}
		}
		var legalName = data[i].enterpriseName ? data[i].enterpriseName : data[i].legalName;
		html += '<tr>';
		html += '<td style="width:50px;text-align:center;">' + (i + 1) + '</td>';
		html += '<td>' + showBidderRenameMark(data[i].enterpriseId, legalName, RenameData, 'addNotice') + '<span class="historyTops">' + ((data[i].isHistory && data[i].isHistory == '1') ? "【历史投标人】" : "") + '</span><input type="hidden" name="bidInviteEnterprises[' + i + '].enterpriseId" value="' + data[i].enterpriseId + '"/>'
		if(data[i].isHistory && data[i].isHistory == '1') {
			html += '<input type="hidden" name="bidInviteEnterprises[' + i + '].isEnter" value="1"/>'
		}
		if(data[i].inviteState == 0) {
			html += '</td>';
			html += '<td style="width: 300px;text-align:center;">' + code + '<input type="hidden" name="bidInviteEnterprises[' + i + '].inviteState" value="' + data[i].inviteState + '"/></td>';
			html += '<td style="width: 180px;text-align:center;"><input type="text"  maxlength="11" datatype="*" errormsg="温馨提示:请输入联系人!" class="form-control person can_change" name="bidInviteEnterprises[' + i + '].enterprisePerson" value="' + person + '"/>' + '' + '</td>';
			html += '<td style="width: 180px;text-align:center;"><input type="text"  maxlength="11" datatype="mobile" errormsg="温馨提示:请输入正确的手机号!" class="form-control personTel" name="bidInviteEnterprises[' + i + '].enterprisePersonTel" value="' + personTel + '"/>' + '' + '</td>';
			html += '<td>' + ((data[i].inviteState == 0 || data[i].inviteState == 1 || (data[i].isHistory && data[i].isHistory == '1')) ? btnRemove : '') + '<input type="hidden" name="bidInviteEnterprises[' + i + '].messageState" value="' + (data[i].messageState != undefined ? data[i].messageState : 0) + '"/></td>';
			html += '</tr>';
		} else {
			html += '</td>';
			html += '<td style="width: 300px;text-align:center;">' + code + '<input type="hidden" name="bidInviteEnterprises[' + i + '].inviteState" value="' + data[i].inviteState + '"/></td>';
			html += '<td style="width: 180px;text-align:center;" class="person">' + person + '<input type="hidden" name="bidInviteEnterprises[' + i + '].enterprisePerson" value="' + person + '"/></td>';
			html += '<td style="width: 180px;text-align:center;" class="personTel">' + personTel + '<input type="hidden" name="bidInviteEnterprises[' + i + '].enterprisePersonTel" value="' + personTel + '"/></td>';
			html += '<td>' + ((data[i].inviteState == 0 || data[i].inviteState == 1 || (data[i].isHistory && data[i].isHistory == '1')) ? btnRemove : '') + '<input type="hidden" name="bidInviteEnterprises[' + i + '].messageState" value="' + (data[i].messageState != undefined ? data[i].messageState : 0) + '"/></td>';
			html += '</tr>';
		}
	}

	if($("#enterpriseTab").length == 0) {
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
		success: function(data) {
			if(data.success) {
				var arr = data.data;
				bidCode = arr.interiorBidSectionCode;
				bidSectionName = arr.bidSectionName;
				msgInfo = JSON.parse(JSON.stringify(data.data));
				tenderProjectType = arr.tenderProjectType;
				getRoomList(bidId, '2');
				//后审的招标次数大于1 的为重新招标的需要显示历史投标人的
				if(arr.examType == 2 && Number(arr.bidEctionNum) > 1) {
					source = "1";
				}
				isLaw = arr.isLaw;
				isPre = arr.examType;

				for(var key in arr) {
					if(key == "tenderProjectType") {
						$("#tenderProjectTypeTxt").dataLinkage({
							optionName: "TENDER_PROJECT_TYPE",
							optionValue: arr[key],
							status: 2,
							viewCallback: function(name) {
								$("#tenderProjectTypeTxt").html(name)
							}
						});
					} else {
						if(key == "signUpType") { //报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1') {
								arr.signUpType = '线上获取'
							} else if(arr.signUpType == '2') {
								arr.signUpType = '线下获取'
							}
							signUpType = arr.signUpType;
						} else if(key == "deliverFileType") { //投标文件递交方式	1.线上递交    2.线下递交
							if(arr.deliverFileType == '1') {
								arr.deliverFileType = '线上递交'
							} else if(arr.deliverFileType == '2') {
								arr.deliverFileType = '线下递交'
							}
							deliverFileType = arr.deliverFileType;
						} else if(key == "bidOpenType") { // 开标方式 1为线上开标，2为线下开标
							if(arr.bidOpenType == '1') {
								arr.bidOpenType = '线上开标'
							} else if(arr.bidOpenType == '2') {
								arr.bidOpenType = '线下开标'
							}
						}
						$('#' + key).html(arr[key]);
						optionValueView("#" + key, arr[key]); //下拉框信息反显
						if(!id) {
							$('#noticeName').val(arr.bidSectionName + '-邀请函')
							$('#bidInviteTitle').val(arr.bidSectionName + '-邀请函')
						}
					}
				};
				$('[name=bidSectionName]').val(arr.bidSectionName)
			}
		}
	});
};

function getBidderPre() {
	$.ajax({
		type: "post",
		url: bidderPreUrl,
		async: true,
		data: {
			'bidSectionId': bidId
		},
		success: function(data) {
			if(data.success) {
				if(data.rows && data.rows.length > 0) {
					biderData = data.rows;
					enterpriseHtml(data.rows)
				}

			}
		}
	});
}
/**去掉字符串前后所有空格*/
/*function trim(str){ 
return str.replace(/(^\s*)|(\s*$)/g, ""); 
} */
/*
 * getHistoryBidder : 重新招标时获取历史邀请的投标人
 * 
 * */
function getHistoryBidder(bid) {
	$.ajax({
		type: "post",
		url: pastBidderUrl,
		async: true,
		data: {
			'bidSectionId': bid
		},
		success: function(data) {
			if(data.success) {
				historyBidders = data.data;

				if(bidInviteId == '') {
					biderData = JSON.parse(JSON.stringify(data.data));
					for(var i = 0; i < biderData.length; i++) {
						biderData[i].danweiguid = biderData[i].enterpriseId;
					}
					enterpriseHtml(historyBidders);
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
/* 时间 */
function newChangeTimes(){
	$('.times').focus(function() {
		var that = this;
		nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		if($('#bidInviteIssueTime').val() == ''){
			top.layer.alert('请先选择投标邀请发出时间！');
			return
		};
		var timeStart = $('#bidInviteIssueTime').val().replace(/\-/g, "/"), minTime = '';
		if(isLaw == 1){
			if($(this).prop('id') == 'inviteAnswersEndDate' || $(this).prop('id') == 'docGetEndTime'){
				minTime = automatic(timeStart, 5, '1');
			}else if($(this).prop('id') == 'bidDocReferEndTime' || $(this).prop('id') == 'bidOpenTime'){
				minTime = automatic(timeStart, 20, '1');
			}else{
				minTime = nowDate;
			}
		}else{
			minTime = nowDate;
		}

		var eleInputId = $(that).prop('id');
		var minDTime,maxTime;
		// // 投标邀请回复截止时间/招标文件获取截止时间/报名截止时间&投标邀请回复截止时间
		var dateFmt = 'yyyy-MM-dd HH:mm';
		if(eleInputId == 'inviteAnswersEndDate' || eleInputId == 'docGetEndTime'){
			dateFmt = 'yyyy-MM-dd 23:59';
			if (window.parent._IGNORE_TIME_LIMIT_ === 1) {
				dateFmt = 'yyyy-MM-dd HH:mm';
			}
		}

		WdatePicker({
			el: this,
			dateFmt: dateFmt,
			minDate: minTime,
			minTime: minDTime,
			maxTime: maxTime,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					var eleId = $(that).prop('id');
					if(eleId == 'inviteAnswersEndDate' || eleId == 'docGetEndTime' || eleId == 'bidDocReferEndTime' || eleId == 'bidOpenTime'){
						dateInHolidayTip(selectTime, that);
					}
				}
			}
		})
	
	});
}