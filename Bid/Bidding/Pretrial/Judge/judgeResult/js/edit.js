/**
 *  zhouyan 
 *  2019-4-30
 *  线下评审结果录入
 *  方法列表及功能描述
 */
var bidderUrl = config.tenderHost + '/BidWinNoticeController/findBidWinCandidateListYuShen.do'; //新增时获取投标人信息
var detailUrl = config.tenderHost + '/BidWinNoticeController/findResultsExamByBidId.do'; //编辑时信息反显接口
var infoUrl = config.tenderHost + '/BidWinNoticeController/findBidSectionByBidId.do'; //标段相关信息

var saveUrl = config.tenderHost + '/BidWinNoticeController/saveYuShen.do'; //保存地址
var fileUrl = config.FileHost + '/FileController/streamFile.do'; //H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址

var examType = ''; //资格审查方式 1为资格预审，2为资格后审
var bidId = ''; //标段Id

var fileSize; //文件大小
var fileName; //文件名称
var filePath; //文件路径
var answersFileList = []; //文件上传保存路径
fileUploads = null;

var signIn = entryInfo(); //当前登录人信息
var dataId = ''; //评标报告id
var pretrialCheckType = ''; //预审评审办法
var bidderList = []; //投标人
var isPublicProject = ''; //是否公共资源
var isLaw = ''; //是否依法
var tenderProjectType;
var CAcf = null; //实例化CA
$(function() {
	//初始化编辑器
	// ue = UE.getEditor('container');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'passedApplicantList',
	});
	examType = $.getUrlParam('examType'); //资格审查方式 1为资格预审，2为资格后审
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined) {
		bidId = $.getUrlParam('id'); //公告列表中带过来的标段
	}
	pretrialCheckType = $.getUrlParam('pretrialCheckType'); //公告列表中带过来的标段

	//媒体类型
	var rst = findProjectDetail(bidId);
	initMedia({
		proType: rst
	});

	//	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
	//		bidId = $.getUrlParam('id');
	//		
	//	}else{
	//		getPublish($('[name=isPublish]:checked').val())
	//	}
	getBidInfo(bidId)
	getDetail(bidId, examType);
	$('#bidSectionId').val(bidId);
	//	$('#examType').val(examType);
	//	getJudges();
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: dataId,
		status: 1,
		type: "ysjggs",
	});
	//	fileUpload(signIn.enterpriseId,bidId);

	//开始时间
	$('#noticeStartTime').click(function() {
		nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		if($.trim($('#noticePeriod').val()) == '') {
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
	//关闭
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//是否公示
	//	getPublish($('[name=isPublish]:checked').val())
	$('[name=isPublish]').change(function() {
		getPublish($(this).val())
	})
	//模板下拉框
	//	modelOption({tempType:'notice'});
	//选择模板

	//淘汰
	$('#bidResult').on('change', '.isKey', function() {
		var optionValue = $(this).val();
		var isKey = $(this).closest('td').attr('data-iskey')
		if(optionValue != isKey) {
			$(this).closest('tr').find('.reason').css('display', 'block');
		} else {
			$(this).closest('tr').find('.reason').css('display', 'none');
			$(this).closest('tr').find('.reason').val('');
		}
	});
	//候选人
	$('#bidResult').on('change', '.candidate', function() {
		var optionValue = $(this).val();
		if(optionValue == 1) {
			$(this).closest('tr').find('.isKey').val('1');
			$(this).closest('tr').find('.isKey').attr('disabled', true);
			$(this).closest('tr').find('.reason').css('display', 'none');
			$(this).closest('tr').find('.reason').val('');
		} else if(optionValue == 0) {
			var isKeyValue = $(this).closest('tr').find('.isKey').val();
			$(this).closest('tr').find('.isKey').removeAttr('disabled');
			if(isKeyValue == 0) {
				$(this).closest('tr').find('.reason').css('display', 'block');
			} else if(isKeyValue == 1) {
				$(this).closest('tr').find('.reason').css('display', 'none');
				$(this).closest('tr').find('.reason').val('');
			}
		}
	});

	//预览
	$("#preview").click(function() {
		var path = $(this).closest('td').find('#fileUrl').val();
		previewPdf(path)
	})

});

function passMessage(data, callback) {
	//	for(var key in data){
	//		$('#'+key).html(data[key]);
	//	}
	//	$('#checkType').html(getTenderType(data.tenderProjectType))
	//	if(!data.id){
	//		
	//		getBidder(data.bidSectionId);
	//	}
	$("#btnModel").click(function() {
		modelId = $('#noticeTemplate option:selected').attr('data-model-id'); //选中的模板的id
		//		var modelId = $('#noticeTemplate option:selected').attr('data-model-id');//选中的模板的id
		var modelUrl = $('#noticeTemplate option:selected').attr('data-model-url'); //选中的模板的url
		var hashtml = ue.hasContents();
		if(hashtml) {
			parent.layer.confirm('确定替换模板？', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index)
				save(false, false, callback, function() {
					modelHtml({
						tempBidFileid: modelId,
						bidSectionId: bidId,
						'examType': 1
					});
				})

			})
		} else {
			save(false, false, callback, function() {
				modelHtml({
					tempBidFileid: modelId,
					bidSectionId: bidId,
					'examType': 12
				});
			})
		}

	});
	//保存
	$('#btnSave').click(function() {
		save(0, true, callback);
	})
	//提交
	$('#btnSubmit').click(function() {
		console.log(1111)
		$('#passedApplicantList').val(ue.getContent());
		//		bidderList
		var expertId = $("input[name='expertId']:checked").val();
		var winner = []; //最终合格的投标人
		var tr = $('#bidResult tbody tr');
		for(var i = 0; i < tr.length; i++) {
			var isKey = $(tr[i]).find('.isKey').val();
			//			var candidate = $(tr[i]).find('.candidate').val();
			$(tr[i]).find('.isKey').removeAttr('disabled');
			if(isKey != bidderList[i].isKey) { //最终是否合格与评审是否合格不一致时需输入原因
				if($(tr[i]).find('[name="bidWinCandidates[' + (i - 1) + '].reason"]').val() == '') {
					parent.layer.alert('请输入原因！', {
						icon: 7,
						title: '提示'
					}, function(idx) {
						parent.layer.close(idx);
						$('#collapseTwo').collapse('show');
						$('[name="bidWinCandidates[' + (i - 1) + '].reason"]').focus();
					});

					return
				}
			}
			if(isKey == 1) {
				winner.push(bidderList[i])
			}
		}
		if(winner.length < 3) {
			parent.layer.alert('合格的投标人少于3家！', {
				icon: 7,
				title: '提示'
			}, function(idx) {
				parent.layer.close(idx);
				$('#collapseTwo').collapse('show');
			});
			return;
		}
		if($('[name=isPublish]:checked').val() == 1) { //公示
			$.each($('[data-test]'), function() {
				$(this).attr('datatype', $(this).attr('data-test'))
			})
			if($.trim($('#noticePeriod').val()) == '' || $.trim($('#noticePeriod').val()) == 0){
				top.layer.alert('请正确输入公示期');
				return
			}
			if($('#noticeStartTime').val() != '' && $('#noticeEndTime').val() != '') {
				var checkStartDate = Date.parse(new Date($('#noticeStartTime').val().replace(/\-/g, "/"))); //会议开始时间
				var checkEndDate = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g, "/"))); //会议结束时间
				if(checkEndDate <= checkStartDate) {
					parent.layer.alert('公示开始时间应在公示结束时间之后！', {
						icon: 7,
						title: '提示'
					}, function(idx) {
						parent.layer.close(idx);
						$('#collapseOne').collapse('show');
					});
					return
				}
			}
			if($('[name=noticeMedia]:checked').length == 0) {
				parent.layer.alert('请选择公告发布媒体！', function(ind) {
					parent.layer.close(ind);
					$('#collapseSix').collapse('show');
				});
				return
			}
		} else if($('[name=isPublish]:checked').val() == 0) {
			$.each($('[data-test]'), function() {
				$(this).removeAttr('datatype')
			})
		} else {
			parent.layer.alert('请选择资格预审结果是否公示！', {
				icon: 7,
				title: '提示'
			}, function(idx) {
				parent.layer.close(idx);
				$('#collapseOne').collapse('show');
			});
			return
		}
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if($("#checkerIds").length <= 0) {
				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
					title: '提交审核',
					btn: [' 是 ', ' 否 '],
					yes: function(layero, index) {
						if($('[name=isPublish]:checked').val() == 0) {
							var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
							savePost(1, arr, false, callback)
						} else {
							save(1, false, callback);
						}
					},
					btn2:function(index, layero) {
						parent.layer.close(index);
					}
				})
			} else {
				parent.layer.alert('确认提交？', {
					icon: 3,
					title: '询问'
				}, function(index) {
					parent.layer.close(index);
					if($('[name=isPublish]:checked').val() == 0) {
						var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
						savePost(1, arr, false, callback)
					} else {
						save(1, false, callback);
					}

				});
			}

		}

	});
}
//保存state：0:保存，1：提交审核
function save(state, isTips, callback, back) {
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

					$('#passedApplicantList').val(ue.getContent());
					$(".mediaDisabled").removeAttr("disabled");
					arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
					for(var i = 0; i < $('.bidCodes').length; i++) {
						bidCodes.push($('.bidCodes').eq(i).html())
					}
					if(state == 1) {
						arr.isSubmit = 1;
					}
					savePost(state, arr, false, callback, back);
				}
			});
		}
		CAcf.sign();
	} else {
		var bidCodes = [];
		var arr = {};

		$('#passedApplicantList').val(ue.getContent());
		$(".mediaDisabled").removeAttr("disabled");
		arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
		for(var i = 0; i < $('.bidCodes').length; i++) {
			bidCodes.push($('.bidCodes').eq(i).html())
		}
		savePost(state, arr, isTips, callback, back);
	}
}
//获取投标人信息
function getBidder(bid) {
	$.ajax({
		type: "post",
		url: bidderUrl,
		async: true,
		data: {
			'bidSectionId': bid
		},
		success: function(data) {
			if(data.success) {
				if(data.data.length > 0) {
					bidderList = data.data;
					bidderHtml(data.data);
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
};

function bidderHtml(data) {
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	$('#bidResult').html('');
	var html = '';
	var priceUnit = '';
	if(data[0].priceUnit == 0) {
		priceUnit = '（元）'
	} else if(data[0].priceUnit == 1) {
		priceUnit = '（万元）'
	};
	html = '<thead><tr>'
	html += '<th style="width: 50px;text-align: center;">序号</th>'
	html += '<th style="min-width: 200px;white-space: normal;">投标人</th>'
	html += '<th style="min-width: 150px;white-space: normal;">组织机构代码</th>'
	if(pretrialCheckType == 2) {
		html += '<th style="min-width: 80px;white-space: normal;">得分</th>'
	}
	html += '<th style="width: 120px;text-align: center;">是否合格</th>'
	html += '<th style="min-width: 200px;white-space: normal;">修改原因</th>'
	html += '</tr></thead><tbody>'
	for(var i = 0; i < data.length; i++) {

		if(!data[i].reason) {
			data[i].reason = '';
		};
		var option1 = '';
		var isCandidate = false;
		var disable = '';

		var option2 = '';
		var textReason = '';
		var isQual = '';
		if(data[i].isWinBidder || data[i].isWinBidder == 0) {
			isQual = data[i].isWinBidder;
		} else {
			if(data[i].isKey) {
				isQual = data[i].isKey;
			}
		}
		if(isQual == 0) {
			option2 = '<option value="1">合格</option>' +
				'<option value="0" selected>不合格</option>';
			textReason = '<textarea name="bidWinCandidates[' + i + '].remark"  class="form-control reason" rows="2" cols="" style="resize: none;">' + (data[i].remark ? data[i].remark : '') + '</textarea>';
		} else if(isQual == 1 || isQual == '') {
			option2 = '<option value="1" selected>合格</option>' +
				'<option value="0">不合格</option>';
			textReason = '<textarea name="bidWinCandidates[' + i + '].remark"  class="form-control reason" rows="2" cols="" style="resize: none;display:none;">' + (data[i].remark ? data[i].remark : '') + '</textarea>';
		};

		html += '<tr>'
		html += '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>'
		html += '<input type="hidden"  name="bidWinCandidates[' + i + '].bidSectionId" value="' + bidId + '" />' //标段ID
		html += '<input type="hidden"  name="bidWinCandidates[' + i + '].winCandidateId" value="' + data[i].winCandidateId + '" />' //中标候选人ID
		html += '<input type="hidden"  name="bidWinCandidates[' + i + '].winCandidateName" value="' + data[i].winCandidateName + '" />' //中标候选人名称
		html += '<input type="hidden"  name="bidWinCandidates[' + i + '].winCandidateCode" value="' + (data[i].winCandidateCode ? data[i].winCandidateCode : '') + '" />' //组织机构代码
		html += '<input type="hidden"  name="bidWinCandidates[' + i + '].winCandidateOrder" value="' + (data[i].winCandidateOrder ? data[i].winCandidateOrder : '') + '" />' //中标候选人排名

		html += '<td style="min-width: 200px;white-space: normal;">' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>'
		html += '<td style="min-width: 150px;white-space: normal;" class = "winCandidateCode">' + (data[i].winCandidateCode ? data[i].winCandidateCode : '') + '</td>'
		if(pretrialCheckType == 2) {
			html += '<td style="min-width: 80px;white-space: normal;">' + (data[i].score ? data[i].score : '/') + '</td>'
			html += '<input type="hidden"  name="bidWinCandidates[' + i + '].score" value="' + (data[i].score ? data[i].score : '') + '" />' //最终分值
		}
		html += '<td style="width: 120px;text-align: center;" data-id="' + data[i].winCandidateId + '" data-iskey="' + data[i].isKey + '">'
		html += '<select name="bidWinCandidates[' + i + '].isWinBidder" class="form-control isKey">' + option2 + '</select>'
		html += '</td>'
		html += '<td style="min-width: 200px;white-space: normal;">' + textReason + '</td>'
		html += '</tr>'
	}
	html += '</tbody>';
	$(html).appendTo('#bidResult');

};

function priceTest(ele) {
	if(Number(ele.value) >= 1000) {
		parent.layer.alert('请正确输入得分', {
			title: '提示'
		}, function(ind) {
			parent.layer.close(ind);
			ele.focus();
		})
	}
}
/*保存
 * state:0 保存，1提交
 * isTips: true 保存成功时弹提示  false 不弹
 */
function savePost(state, param, isTips, callback, back) {
	$('#passedApplicantList').val(ue.getContent());
	//	var param = parent.serializeArrayToJson($('#addNotice').serializeArray())
	var mediaIn = '';
	var mediaArr = [];
	$.each($('[name=noticeMedia]:checked'), function() {
		mediaArr.push($(this).val())
	})
	param.noticeMedia = mediaArr.join(',');
	if(state == 1) {
		param.isSubmit = state;
	}
	if(dataId && dataId != '') {
		param.id = dataId;
	}
	var biderData = [];
	$.each($('#bidResult .winCandidateCode'), function(index) {
		var obj = {};
		obj.winCandidateCode = $(this).text();
		biderData.push(obj);
	})

	//黑名单烟验证
	if(biderData != null && biderData.length > 0) {
		var strHtml = '';
		var flag = false;
		for(var i = 0; i < biderData.length; i++) {
			var parm = checkBlackList(biderData[i].winCandidateCode, tenderProjectType, 'b1');
			if(parm.isCheckBlackList) {
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
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: param,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				$(".mediaDisabled").attr("disabled", "disabled");
				dataId = data.data;
				if(callback) {
					callback()
				}
				if(back) {
					back(dataId)
				}
				if(state == 0) {
					if(isTips) {
						parent.layer.alert('保存成功！', {
							icon: 6,
							title: '提示'
						});
					}
				} else if(state == 1) {
					parent.layer.alert('提交成功！', {
						closeBtn:0,
						icon: 6,
						title: '提示'
					}, function(o) {
						top.layer.close(o);
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					});

				}
				//				parent.$("#tableList").bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}
	});
}
//上传
function fileUpload(enterpriseId, id) {
	var config = {
		multipleFiles: false, // 多个文件一起上传, 默认: false 
		/* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
		browseFileBtn: " ",
		/** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
		filesQueueHeight: 0,
		/** 文件上传容器的高度（px）, 默认: 450 */
		messagerId: '', //显示消息元素ID(customered=false时有效)
		frmUploadURL: flashFileUrl, // Flash上传的URI 
		uploadURL: fileUrl, //HTML5上传的URI 
		browseFileId: "fileUpload", //文件选择DIV的ID
		autoUploading: true, //选择文件后是否自动上传
		autoRemoveCompleted: true, //文件上传后是否移除
		extFilters: ['.pdf', '.PDF'], //允许上传文件的类型
		postVarsPerFile: {
			//自定义文件保存路径前缀
			basePath: "/" + enterpriseId + "/" + id + "/" + 505, //  207	答疑文件
			Token: $.getToken(),
		},
		onComplete: function(file) { /** 单个文件上传完毕的响应事件 */

			var fileArr = {
				fileName: file.name,
				fileSize: file.size / 1000 + "KB",
				filePath: JSON.parse(file.msg).data.filePath,
				name: signIn.userName,
				fileType: file.name.split(".").pop()
			}
			//	    	fileHtml(fileArr);

			$("#fileName").html($('#bidSectionName').val() + '-线下评审报告');
			$('#preview').css('display', 'inline-block');
			$('#fileUrl').val(fileArr.filePath);
			parent.layer.alert('文件上传成功！')

		},
		onSelect: function(list) { //	选择文件后的响应事件
			//		  	console.log("select files: " + list.length);
			for(var i = 0; i < list.length; i++) {
				//				obj.attachmentFileName=list[i].name;
				//		      	console.log("file name: "+ list[i].name+ " file size:"+ list[i].size);
			}

		}
	};
	var _t = new Stream(config);
};
//反显
function getDetail(id, type) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'bidSectionId': id,
			'examType': 1
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					var dataSource = data.data;
					if(!dataId) {
						dataId = dataSource.id;
					}
					for(var key in dataSource) {

						var newEle = $("[name='" + key + "']")
						if(newEle.prop('type') == 'radio') {
							newEle.val([dataSource[key]]);
						} else if(newEle.prop('type') == 'checkbox') {
							newEle.val(dataSource[key] ? dataSource[key].split(',') : []);
						} else {
							$("[name=" + key + "]").val(dataSource[key]);
						}

					};
					if(dataSource.fileUrl && dataSource.fileUrl != '') {
						$('#fileUrl').val(dataSource.fileUrl);
						$("#fileName").html(dataSource.noticeName);
						$('#preview').css('display', 'inline-block');
					}
					if(dataSource.bidWinCandidates.length > 0) {
						bidderList = dataSource.bidWinCandidates;
						bidderHtml(dataSource.bidWinCandidates);
					}
					if(dataSource.isPublish == 0) {
						$('.isPublish').hide();
					} else {
						$('.isPublish').show();
					}
					//	          	if(dataSource.noticeMedia){
					//	          		var mediaData = {
					//						'isPublicProject': isPublicProject,
					//						'isLaw': isLaw,
					//						'check': dataSource.noticeMedia,
					//					}
					//	          		initMedia(mediaData);
					//	          	}
					//公告内容
					mediaEditor.setValue(dataSource);
					// if(dataSource.passedApplicantList) {
					// 	ue.ready(function() {
					// 		ue.setContent(dataSource.passedApplicantList);
					// 		ue.addInputRule(function(root) {
					// 			$.each(root.getNodesByTagName('a'), function(i, node) {
					// 				node.tagName = "p";
					// 			});
					// 		});
					// 	});
					// }
					getPublish(dataSource.isPublish);
					if(dataSource.noticeEndTime){
						dateInHolidayTip(dataSource.noticeEndTime, '#noticeEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
				} else {
					getBidder(id);
					getPublish('0')
				}
				/*if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+dataId+"/506",
						businessId: dataId,
						status:1,
						businessTableName:'T_BID_CHECK_REPORT',  
						attachmentSetCode:'JUDGE_FILES'
					});
				}*/
				//	          	fileUploads.fileHtml(dataSource.projectAttachmentFiles);
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
//是否公示
function getPublish(val) {
	if(val == 1) {
		$('.isPublish').show();
		$('[name=isPublish]').closest('td').removeAttr('colspan')
	} else {
		$('[name=isPublish]').closest('td').attr('colspan','3')
		$('.isPublish').hide();
		//选择不公示时时间和公示内容清空
		$('.hideEmpty').val('');
		ue.ready(function() {
			ue.setContent('');
		})

	}
}

function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: infoUrl,
		async: true,
		data: {
			'bidSectionId': id,
			'examType': '1'
		},
		success: function(data) {
			if(data.success) {
				for(var key in data.data) {
					$('#' + key).html(data.data[key])
				}
				if(data.data.tenderProjectType) {
					tenderProjectType = data.data.tenderProjectType;
					$('#checkType').html(getTenderType(data.data.tenderProjectType))
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
};