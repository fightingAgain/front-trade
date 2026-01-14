/**
 *  zhouyan 
 *  2019-4-15
 *  编辑、添加公告
 *  方法列表及功能描述
 */

//var saveUrl = config.tenderHost + "/BidWinNoticeController/save.do";	//保存地址
var submitUrl = config.tenderHost + "/BidWinNoticeController/save.do"; //提交地址
var resiveUrl = config.tenderHost + "/BidWinNoticeController/findBidWinCandidateList.do"; //新增时查看中标人地址
var recallUrl = config.tenderHost + "/BidWinNoticeController/findBidWinNoticeByBidId.do"; //详情地址

var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do'; //获取标段相关信息

var publicId = ''; //数据id
var bidId = ''; //一对一时的标段Id
var examType = ''; //资格审查方式 1为资格预审，2为资格后审
var noticeNature = ''; //公告性质  1 正常公告 2 更正公告 3 重发公告 9 其他
var postData = {};
var fileUploads;
var bidWinNoticeId;
var ue;
var isLaw = ''; //是否依法
var CAcf = null; //实例化CA

var bidderPriceType; //投标报价方式 1.金额  9费率
var rateUnit; //费率单位
var rateRetainBit; //费率保留位数(0~6)
var RenameData;//投标人更名信息
$(function() {
	//初始化编辑器
	// ue = UE.getEditor('container');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'noticeContent'
	});
	examType = $.getUrlParam('examType'); //资格审查方式 1为资格预审，2为资格后审
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getBidInfo(bidId)
	getDetail(bidId, examType)
	/*if($.getUrlParam("bidWinNoticeId") && $.getUrlParam("bidWinNoticeId") != "undefined"){
		 bidWinNoticeId = $.getUrlParam('bidWinNoticeId');//公告列表中带过来的ID
	};
	if($.getUrlParam('noticeNature') && $.getUrlParam('noticeNature') != undefined){
		noticeNature = $.getUrlParam('noticeNature');//公告列表中带过来的ID
	};
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		 publicId = $.getUrlParam('id');//公告列表中带过来的ID
	}else{
		winCandidateInfo();//中标人信息
	}*/

	$('#bidSectionId').val(bidId);
	$('#examType').val(examType);
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: publicId,
		status: 1,
		type: "zbjggs",
	});

	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
	$('#noticeStartTime').click(function() {
		nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		if($('#noticePeriod').val() == '') {
			top.layer.alert('请先输入公示期');
		}else{
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				minDate: nowDate,
				onpicked: function(dp) {
					var selectTime = dp.cal.getNewDateStr().replace(/\-/g, "/"); //选中的时间
					var noticePeriod = Number($('#noticePeriod').val());
					if(selectTime && selectTime != '') {
						$('#noticeEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
						dateInHolidayTip($('#noticeEndTime').val(), '#noticeEndTime');
					}
				}
			})
		}
	});
	//修改公示期
	$('#noticePeriod').change(function(){
		var noticePeriod = Number($(this).val());
		if(noticePeriod == 0 || noticePeriod == ''){
			top.layer.alert('请正确输入公示期');
			return
		}
		if($('#noticeStartTime').val() != ''){
			var selectTime = $('#noticeStartTime').val().replace(/\-/g, "/"); //选中的时间
			$('#noticeEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
			dateInHolidayTip($('#noticeEndTime').val(), '#noticeEndTime');
		}
	})
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

				}
				//确定按钮
				,
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

	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

})

function winCandidateInfo(id) {
	//媒体
	var rst = findProjectDetail(bidId);
	initMedia({
		proType: rst,
		isDisabled: noticeNature == 2 ? true : false
	});
	$.ajax({
		type: "post",
		url: resiveUrl,
		data: {
			'bidSectionId': id
		},
		dataType: 'json',
		success: function(data) {
			var dataSource = data.data;
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			candidateHtml(dataSource);
		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});
};

function passMessage(data, callback) {
	if(data.getForm == 'KZT') {
		bidId = data.id;
	} else {
		bidId = data.bidSectionId; //标段id
	}
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function() {
		//		var obj = $(this);
		if(publicId == "") {
			save(0, false, callback, function(businessId) {
				publicId = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/224",
						businessId: publicId,
						status: 1,
						businessTableName: 'T_BID_WIN_NOTICE',
						attachmentSetCode: 'RESULT_NOTICE_DOC'
					});
				}
				$('#fileLoad').trigger('click');
			});
		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/224",
					businessId: publicId,
					status: 1,
					businessTableName: 'T_BID_WIN_NOTICE',
					attachmentSetCode: 'RESULT_NOTICE_DOC'
				});
			}
			$('#fileLoad').trigger('click');
		}
	});

	//模板下拉框
	modelOption({
		tempType: 'letterNotice'
	});
	$("#btnModel").click(function() {
		var modelId = $('#noticeTemplate option:selected').attr('data-model-id');
		var hashtml = ue.hasContents();
		if(hashtml) {
			parent.layer.confirm('确定替换模板？', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index);
				save(0, false, callback, function(data) {
					modelHtml({
						'tempBidFileid': modelId, //模板Id
						'bidSectionId': bidId,
						'examType': 2
					});
				})

			});
		} else {
			save(0, false, callback, function(data) {
				modelHtml({
					'tempBidFileid': modelId, //模板Id
					'bidSectionId': bidId,
					'examType': 2
				});
			})

		}
	})
	/*保存*/
	$('#btnSave').click(function() {
		save(0, true, callback);
	})
	/*提交*/
	$('#btnSubmit').click(function() {

		var noticeSendTime = Date.parse(new Date($('#noticeStartTime').val().replace(/\-/g, "/"))); //公示发布时间
		var noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g, "/"))); //公示截止时间

		var times = 3 * 24 * 60 * 60 * 1000;

		if($('[name=noticeMedia]:checked').length == 0) {
			parent.layer.alert('请选择公告发布媒体！', function(ind) {
				parent.layer.close(ind);
				$('#collapseFour').collapse('show');
			});
			return
		}
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if(verifyTime) {
				if(isLaw == 1) {
					if((noticeEndTime - noticeSendTime) < times) {
						parent.layer.alert('公告截止时间应在公告开始时间3天之后！');
						return
					}
				}

			}
			if(!mediaEditor.isValidate()) {
				$('#collapseTwo').collapse('show');
			} else {
				if($("#addChecker").length <= 0) {
					parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
						title: '提交审核',
						btn: [' 是 ', ' 否 '],
						yes: function(layero, index) {
							saveCA(1, callback)
						},
						btn2:function(index, layero) {
							parent.layer.close(index);
						}
					})
				} else {
					parent.layer.alert('确认提交审核？', function(index) {
						//					submit(1);
						parent.layer.close(index);
						saveCA(1, callback)
					})
				}

			}
		}
	})

	//	noticeNature = data.noticeNature;
	//	isLaw = data.isLaw;
	//	
	//	
	//	//媒体
	//	var rst = findProjectDetail(data.bidSectionId);
	//	initMedia({
	//		proType:rst,
	//		isDisabled: noticeNature == 2 ? true : false
	//	});

	/*if(data.id){
		
		getDetail(publicId);//修改时信息反显
	} else {
		for(var key in data){
			$('#'+key).val(data[key]);
		};
	}*/
};
//保存
function save(state, isTips, callback, back) {
	$('#bidSectionId').val(bidId); //标段Id
	$('#noticeContent').val(ue.getContent());
	$('#examType').val(examType);
	$("input:disabled").removeAttr("disabled");
	if(publicId == '') {
		param = $.param({
			'noticeNature': 1,
			'noticeState': state,
			'bulletinType': 3
		}) + '&' + $('#addNotice').serialize();
	} else {
		param = $.param({
			'noticeNature': 1,
			'id': publicId,
			'noticeState': state,
			'bulletinType': 3
		}) + '&' + $('#addNotice').serialize();
	};
	
	//		if(bidWinNoticeId){
	//			param += "&bidWinNoticeId=" + bidWinNoticeId;
	//		}
	$.ajax({
		type: "post",
		url: submitUrl,
		dataType: "json", //预期服务器返回的数据类型
		async: false,
		data: param,
		success: function(data) {
			if(data.success) {
				$(".mediaDisabled").attr("disabled", "disabled");
				publicId = data.data;
				if(isTips) {
					parent.layer.alert("保存成功", {
						icon: 1,
						title: '提示'
					});
				}
				if(callback) {
					callback()
				}
				if(back) {
					back(publicId)
				}
				//              parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message, {
					icon: 5,
					title: '提示'
				});
			}
		},
		error: function() {
			parent.layer.alert("保存失败！");
		}
	});
}
//提交
function submit(arr, state, callback) {
	//		$('#bidSectionId').val(bidId);//标段Id
	//		$('#noticeContent').val(ue.getContent());
	//		$('#examType').val(examType);

	/*if(publicId == ''){
		param =$.param({'noticeNature':1,'bidSectionCode':'','noticeState':state,'isSubmit':1}) + '&' +$('#addNotice').serialize();
	}else{
		param =$.param({'noticeNature':1,'id':publicId,'bidSectionCode':'','noticeState':state,'isSubmit':1}) + '&' +$('#addNotice').serialize();
	};*/
	$.ajax({
		type: "post",
		url: submitUrl,
		dataType: "json", //预期服务器返回的数据类型
		data: arr,
		success: function(data) {
			if(data.success) {
				if(callback) {
					callback()
				}
				$(".mediaDisabled").attr("disabled", "disabled");
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
				parent.layer.alert("提交成功", {
					icon: 1,
					title: '提示'
				});
				//              parent.$('#tableList').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message, {
					icon: 5,
					title: '提示'
				});
			}
		},
		error: function() {
			parent.layer.alert("提交失败！");
		}

	});
}
/*
 * 保存
 * isSend true 发送  false保存
 * isTips 保存时是否提示 
 */
function saveCA(state, callback) {
	if(!CAcf) {
		CAcf = new CA({
			target: "#addNotice",
			confirmCA: function(flag) {
				if(!flag) {
					return;
				}
				$("input:disabled").removeAttr("disabled");
				$('#bidSectionId').val(bidId); //标段Id
				$('#noticeContent').val(ue.getContent());
				$('#examType').val(examType);
				if(publicId == '') {
					arr = $.param({
						'noticeNature': 1,
						'bidSectionCode': '',
						'noticeState': state,
						'isSubmit': 1,
						'bulletinType': 3
					}) + '&' + $('#addNotice').serialize();
				} else {
					arr = $.param({
						'noticeNature': 1,
						'id': publicId,
						'bidSectionCode': '',
						'noticeState': state,
						'isSubmit': 1,
						'bulletinType': 3
					}) + '&' + $('#addNotice').serialize();
				};
				if(publicId && publicId != '') {
					arr.id = publicId;
				}
				submit(arr, state, callback);
			}
		});
	}
	CAcf.sign();
}

/*修改时信息回显*/
function getDetail(id, type) {
	$.ajax({
		type: "post",
		url: recallUrl,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		dataType: 'json',
		success: function(data) {

			if(data.success == false) {
				parent.layer.alert(data.message, {
					icon: 7,
					title: '提示'
				}, function(index) {
					parent.layer.closeAll();
				});
				return;
			} else {
				if(data.data) {

					var dataSource = data.data;
					if(dataSource.noticeNature) {
						noticeNature = dataSource.noticeNature;
					}
					//媒体
					var rst = findProjectDetail(bidId);
					initMedia({
						proType: rst,
						isDisabled: noticeNature == 2 ? true : false
					});
					for(var key in dataSource) {
						if(key == 'modality') { //公告形式 1自定义 2网页模版
							$("input[type=radio][name='modality'][value='" + dataSource[key] + "']").attr("checked", 'checked');
						} else if(key == 'noticeMedia') {
							$('[name=noticeMedia]').val(dataSource[key] ? dataSource[key].split(',') : []);
						} else {
							$("[name=" + key + "]").val(dataSource[key]);
						}
					};
					if(dataSource.id) {
						publicId = dataSource.id;

						//公告内容
						mediaEditor.setValue(dataSource);
						// if(dataSource.noticeContent) {
						// 	ue.ready(function() {
						// 		ue.setContent(dataSource.noticeContent);
						// 	});
						// }
						if(dataSource.bidWinCandidates) {
							candidateHtml(dataSource.bidWinCandidates);
						}
						if(!fileUploads) {
							fileUploads = new StreamUpload("#fileContent", {
								basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/224",
								businessId: publicId,
								status: 1,
								businessTableName: 'T_BID_WIN_NOTICE',
								attachmentSetCode: 'RESULT_NOTICE_DOC'
							});
						}
						if(dataSource.projectAttachmentFiles) {
							fileUploads.fileHtml(dataSource.projectAttachmentFiles);
						}
					} else {
						winCandidateInfo(id)
					}
					if(dataSource.noticeEndTime){
						dateInHolidayTip(dataSource.noticeEndTime, '#noticeEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
				}
			}
		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

}

/*function bidFromFathar(data){
	var newData=[];
	newData.push(data);
	bidDetail=newData;
	//将标段相关信息保存到页面的隐藏域，提交的时候需要提交到后台
	for(var key in data){
    	$("#" + key).val(data[key]);
  	}
	bidId=data.bidSectionId;
	tenderProjectId = data.tenderProjectId;
  	
}*/

//候选人
function candidateHtml(data) {
	$('#candidates').html('');
	var html = '';
	var priceUnitParm = '';
	if(data && data.length > 0) {
		/* if(data[0].priceUnit == 0){
			priceUnit = '（元）'
		}else if(data[0].priceUnit == 1){
			priceUnit = '（万元）'
		}; */
		if(bidderPriceType == 1) {
			if(data[0].priceUnit == 0) {
				priceUnitParm = '投标价格（元）';
			} else if(data[0].priceUnit == 1) {
				priceUnitParm = '投标价格（万元）';
			};
		} else if(bidderPriceType == 9) {
			priceUnitParm = '投标价格（' + rateUnit + '）';
		}
		html = '<tr>' +
			'<th style="width: 50px;text-align: center;">排名</th>' +
			'<th style="text-align: left;">投标人名称</th>' +
			'<th style="width: 200px;text-align: center;">' + priceUnitParm + '</th>' +
			'<th style="width: 150px;text-align: center;">是否中标人</th>' +
			'</tr>';
	}
	var isWinBidderText;
	for(var i = 0; i < data.length; i++) {
		var priceUnit = ''; //单位
		var priceCurrency = ''; //币种
		if(data[i].isWinBidder == 1) {
			isWinBidderText = "是";
		} else {
			isWinBidderText = "否";
		}
		if(data[i].priceUnit) {
			if(data[i].priceUnit == 0) {
				priceUnit = "（元"
			} else if(data[i].priceUnit == 1) {
				priceUnit = "（万元"
			}
		} else {
			data[i].priceUnit = ""
		}
		if(data[i].priceCurrency) {
			if(data[i].priceCurrency == 156) {
				priceCurrency = "/人民币）"
			}
		} else {
			priceCurrency = "）"
		}
		var bidPrice = data[i].bidPrice ? data[i].bidPrice : '';
		var otherBidPrice = data[i].otherBidPrice ? data[i].otherBidPrice : '';

		html += '<tr data-winner-id="' + data[i].winCandidateId + '">' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td style="text-align: left;">' +showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>'
		if(bidderPriceType == 1) {
			html += '<td style="width: 300px;text-align: right;">' + data[i].bidPrice + '</td>'
		} else if(bidderPriceType == 9) {
			html += '<td style="width: 300px;text-align: right;">' + data[i].otherBidPrice + '</td>'
		}
		html += '<td style="width: 100px;text-align: center;">' + isWinBidderText + '</td>' +
			'</tr>';
	};
	$(html).appendTo('#candidates');

};

/**********************        根据标段id获取标段相关信息         ********************/
function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: bidInfoUrl,
		async: false,
		data: {
			'id': id
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					isLaw = data.data.isLaw;
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
					/*for(var key in data.data){
						$('#' + key).val(data.data[key])
					}*/
					$('#bidSectionId').val(data.data.bidSectionId);

				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}