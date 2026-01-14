/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/PretrialDocClarifyController/saveChangePretrialDoc.do'; //保存接口
var detailUrl = config.tenderHost + '/PretrialDocClarifyController/findPretrialDocChangeByBidId.do'; //招标文件详情
var dateUrl = config.tenderHost + '/PretrialDocClarifyController/getBidSectionDateTime.do'; //时间
var historyUrl = config.tenderHost + '/PretrialDocClarifyController/findOldAttachmentFileList.do'; //招标文件时间变更历史

var bidSectionPage = 'Bidding/Pretrial/BidFile/manage/model/bidSectionList.html'; //选择标段

var bidUploads = null, //招标文件
	addendumUploads = null; //补遗文件
var fileId = ""; //招标文件id
var pretrialDocClarifyId = ""; //原始招标文件id
var employeeInfo = entryInfo(); //企业信息
var filePath = ""; //上传到服务器的文件路径
var isExitFile = false; //是否存在招标文件
var examType = 1;
var extFilters; //招标文件类型
var bidSectionId = ""; //标段id
var btnType = ''; //变更还是编辑
var CAcf = null;
var pretrialOpenType = ''; //文件开启方式
var isLaw = ''; //是否依法
$(function() {
	bidSectionId = $.getUrlParam('id');

	if($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		btnType = $.getUrlParam('special');
	}
	noteDate();
	detail();

	//选择标段
	/* $("#btnChoose").click(function(){
		openChoose();
	}); */

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	//变更或补遗
	$("[name='isChange']").click(function() {
		if($(this).is(":checked")) {
			$(".change").show();
		} else {
			$(".change").hide();
		}
	});
	$("[name='isReplenish']").click(function() {
		if($(this).is(":checked")) {
			$(".addendum").show();
		} else {
			$(".addendum").hide();
		}
	});

	//上传招标文件
	$('#fileBid').click(function() {
		var obj = $(this);

		if($("[name='docName']").val() == "") {
			top.layer.alert("请输入变更标题", function(index) {
				top.layer.close(index);
				$('#collapseOne').collapse('show');
				$("[name='docName']").focus();
			});
			return;

		}
		if(!(fileId && fileId != "")) {
			saveForm('true', true, function() {
				initUpload();
				$('#btnBid').trigger('click');
			});
		} else {
			initUpload();
			$('#btnBid').trigger('click');
		}

	});
	//上传补遗文件
	$('#fileAddendum').click(function() {
		var obj = $(this);

		if($("[name='docName']").val() == "") {
			top.layer.alert("请输入变更标题", function(index) {
				top.layer.close(index);
				$('#collapseOne').collapse('show');
				$("[name='docName']").focus();

			});
			return;

		}
		if(!(fileId && fileId != "")) {
			saveForm('true', true, function() {
				initUpload();
				$('#btnAddendum').trigger('click');
			});
		} else {
			initUpload();
			$('#btnAddendum').trigger('click')
		}

	});

	//保存按钮
	$("#btnSave").click(function() {
		saveForm(true);
	});
	//提交审核
	$("#btnSubmit").click(function() {
		if($("#addChecker").length <= 0) {
			parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
				title: '提交审核',
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					saveForm(false);
				},
				btn2:function(index, layero) {
					parent.layer.close(index);
				}
			})
		} else {
			saveForm(false);
		}

	});

});

//上传文件初始化
function initUpload() {
	if(!bidUploads) {
		//上传文件
		bidUploads = new StreamUpload("#bidFile", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + fileId + "/204",
			businessId: fileId,
			status: 1,
			businessTableName: 'T_PRETRIAL_DOC_CLARIFY', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'QUALIFICATION_DOC',
			browseFileId: 'btnBid',
			filesQueueId: 'i_stream_files_queue_bid',
			extFilters: extFilters,
			isMult: false,
			changeFile: function(data) {

				if(data.length > 0) {
					filePath = data[data.length - 1].url;
				} else {
					filePath = "";
				}

				//				console.log(filePath)
			}
		});
	}

	//上传文件
	if(!addendumUploads) {
		addendumUploads = new StreamUpload("#addendumFile", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + fileId + "/204",
			businessId: fileId,
			status: 1,
			businessTableName: 'T_PRETRIAL_DOC_CLARIFY', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'QUALIFICATION_DOC_ATTACHS',

			browseFileId: 'btnAddendum',
			filesQueueId: 'i_stream_files_queue_addendum'
		});
	}
}
//其他页面调用的方法
function passMessage(data) {
	if(data) {
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
		//		fileId = data.id;
		//		pretrialDocClarifyId = data.pretrialDocClarifyId;
		pretrialOpenType = data.pretrialOpenType;
		if(pretrialOpenType == 1) {
			extFilters = [".zswj"];
		} else {
			extFilters = [".doc", ".docx", ".pdf", ".PDF"];
		}
		//		bidSectionId = data.bidSectionId;

		//		isLaw = data.isLaw;
		//		changeHistory();
	}

}

/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 * isAlert  true是不弹框  false是弹框
 * callback 回调方法
 */
function saveForm(isSave, isAlert, callback) {
	//	var data = parent.serializeArrayToJson($("#formName").serializeArray());

	if($("[name='docName']").val() == "") {
		top.layer.alert("请输入变更标题", function(index) {
			top.layer.close(index);
			$('#collapseOne').collapse('show');
			$("[name='docName']").focus();
		});
		return;

	}
	if((!$("[name='isChange']").is(":checked"))) {
		top.layer.alert("请选择变更类型", function(ind) {
			parent.layer.close(ind);
			$('#collapseOne').collapse('show');
		});
		return;
	}
	if($("[name='isChange']").is(":checked")) {
		if(!isSave) {
			if($("#bidFile .fileListTab tr").length <= 1) {
				parent.layer.alert("请上传资格预审文件", function(ind) {
					top.layer.close(ind);
					$('#collapseTwo').collapse('show');
				});
				return;
			}
			if($("[name='checkerIds']").val() == "") {
				parent.layer.alert("请选择审核人员", function(ind) {
					parent.layer.close(ind);
					$('#collapseWorkflow').collapse('show');
				});
				return;
			}
		}
	}
	if($("[name='isReplenish']").is(":checked")) {

		if(!isSave) {
			if($("#addendumFile .fileListTab tr").length <= 1 && $.trim($("#clarifyTime").html()) == "" && $.trim($("[name='answersEndDate']").val()) == "" && $.trim($("#bidDocReferEndTime").val()) == "" && $.trim($("#bidOpenTime").val()) == "") {
				parent.layer.alert("请填写变更时间", function(ind) {
					parent.layer.close(ind);
					$('#collapseThree').collapse('show');
				});
				return;
			}
			var clarifyTime = Date.parse(new Date($('#clarifyTime').html().replace(/\-/g, "/"))); //提出澄清截止时间
			var answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g, "/"))); //答复截止时间
			var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g, "/"))); //申请文件递交截止时间
			var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g, "/"))); //开标时间
			if(answersEndDate < clarifyTime) {
				parent.layer.alert('答复截止时间应在提出澄清截止时间之后！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			if(bidDocReferEndTime < answersEndDate) {
				parent.layer.alert('资格预审文件递交截止时间应在答复截止时间之后！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			if(bidOpenTime != bidDocReferEndTime) {
				parent.layer.alert('开启时间应与资格预审文件递交截止时间一致！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			//公告截止时间与开始时间相差的天数
			var time4 = bidDocReferEndTime - clarifyTime;
			var time5 = bidDocReferEndTime - answersEndDate;
			var times2 = 2 * 24 * 60 * 60 * 1000;
			var times3 = 3 * 24 * 60 * 60 * 1000;
			//			if(verifyTime){
			if(isLaw == 1) {
				if(time4 < times3) {
					parent.layer.alert('依法招标的项目，资格预审申请文件递交截止时间与提出澄清截止时间相差不得少于3天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(time5 < times2) {
					parent.layer.alert('依法招标的项目，资格预审申请文件递交截止时间与答复截止时间相差不得少于2天', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
			}
			//			}
		}
	}

	if(!isSave) {
		$('#btnSubmit').attr('disabled', true);
		if(!CAcf) {
			CAcf = new CA({
				target: "#formName",
				confirmCA: function(flag) {
					if(!flag) {
						return;
					}

					var arr = getPara(isSave);
					arr.isSubmit = 1;
					arr.caConfirmCode = $("[name='caConfirmCode']").val();
					arr.caCode = $("[name='caCode']").val();
					arr.caConfirmDate = $("[name='caConfirmDate']").val();
					arr.caDn = $("[name='caDn']").val();
					savePost(isSave, isAlert, callback, arr);
				}
			});
		}
		setTimeout(function(){
			$('#btnSubmit').attr('disabled', false);
		},2000)
		CAcf.sign();
	} else {
		var arr = getPara(isSave);
		savePost(isSave, isAlert, callback, arr);
	}
}

function getPara(isSave) {
	var para = {};
	para.pretrialDocClarifyId = pretrialDocClarifyId;
	para.docName = $("[name=docName]").val();

	para.isChange = 0;
	para.isReplenish = 0;
	if($("[name='isChange']").is(":checked")) {
		para.isChange = 1;
		if(filePath != "") {
			para.url = filePath;
		}
		if(!isSave) {
			para.checkerIds = $("[name='checkerIds']").val();
		}
	}
	if($("[name='isReplenish']").is(":checked")) {
		para.isReplenish = 1;
		para.clarifyTime = $("#clarifyTime").html();
		para.answersEndDate = $("[name='answersEndDate']").val();
		para.pretrialDocReferEndTime = $("[name='pretrialDocReferEndTime']").val();
		para.pretrialOpenTime = $("[name='pretrialOpenTime']").val();
	}
	if(fileId != "") {
		para.id = fileId;
	}
	para.examType = examType;
	para.bidSectionId = bidSectionId;

	return para;
}

function savePost(isSave, isAlert, callback, arr) {
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: arr,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}

			fileId = data.data;
			if(callback && fileId) {
				callback();
			}
			if(isSave) {
				if(!isAlert) {
					top.layer.alert("保存成功");
				}
			} else {
				filePath = "";
				top.layer.alert("提交成功");
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
			}
			parent.$('#table').bootstrapTable('refresh');
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}
	});
}

/**
 * 获取招标文件详情
 * id 招标文件当前id
 */
function detail() {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			'bidSectionId': bidSectionId,
			//			'examType': examType
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.msg);
				return;
			}
			if(!data.data) {
				return;
			}
			data.data.isReplenish = 0;
			var arr = data.data;
			pretrialDocClarifyId = arr.pretrialDocClarifyId ? arr.pretrialDocClarifyId : '';
			pretrialOpenType = arr.pretrialOpenType ? arr.pretrialOpenType : '';
			if(pretrialOpenType == 1) {
				extFilters = [".zswj"];
			} else {
				extFilters = [".doc", ".docx", ".pdf", ".PDF"];
			}
			isLaw = data.isLaw;

			if(arr.id) {
				if(arr.pretrialDocClarifyState != 2) {
					fileId = arr.id;
				} else {
					arr = [];
				}
				$("[name='isChange']").removeAttr("checked");
				$("[name='isReplenish']").removeAttr("checked");
				$(".change").hide();
				$(".addendum").hide();
			}
			/*变更时不显示上一条生效的数据*/
			if(btnType != 'CHANGE') {
				for(var key in arr) {
					if(key == "projectAttachmentFiles") {
						var fileArr = {
							file1: [],
							file2: []
						};
						//上传文件
						if(!bidUploads) {
							initUpload();
						}
						if(!addendumUploads) {
							initUpload();
						}
						for(var i = 0; i < arr[key].length; i++) {
							if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC") {
								fileArr.file1.push(arr[key][i]);
								filePath = arr[key][i].url;
							} else if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC_ATTACHS") {
								fileArr.file2.push(arr[key][i]);
							}
						}
						bidUploads.fileHtml(fileArr.file1);
						addendumUploads.fileHtml(fileArr.file2);
					} else if(key == "isChange") {
						if(arr[key] == 1) {
							$("[name='isChange']").prop("checked", "checked");
							$(".change").show();
						}
					} else if(key == "isReplenish") {
						if(arr[key] == 1) {
							$("[name='isReplenish']").prop("checked", "checked");
							$(".addendum").show();
						}
					} else {
						$("[name='" + key + "']").val(arr[key]);
					}
					if(key == 'bidDocReferEndTime' || key == 'bidOpenTime'){
						dateInHolidayTip(arr[key], ('#' + key));//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
				}
			}
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId: fileId,
				status: 1,
				type: "zgyswjsp",
			});

		}
	});
}
/**
 * 获取招标文件详情
 * id 招标文件当前id
 */
function noteDate() {
	$.ajax({
		type: "post",
		url: dateUrl,
		async: false,
		data: {
			bidSectionId: bidSectionId
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.msg);
				return;
			}
			if(data.data){
				var arr = data.data;
				initDate(arr);
			}
		}
	});
}

function initDate(arr) {
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var docGetEndTime = arr.docGetEndTime.replace(/\-/g, "/");
	var miniData = automatic(docGetEndTime, 5, '1')
	//提出澄清截止时间
	$("#clarifyTime").html(arr.clarifyTime);
	/*$('#clarifyTime').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'answersEndDate\')}',
		})
 	});*/
	//答疑截止时间
	$('#answersEndDate').val(arr.answersEndDate);
	$('#answersEndDate').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: nowDate
		});
	})
	//投标文件递交截止时间
	$('#bidDocReferEndTime').val(arr.bidDocReferEndTime);
	$('#bidDocReferEndTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate:  isLaw == 1?miniData:nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					dateInHolidayTip(selectTime, this);
				}
			}
		})
	});
	//开标时间
	$('#bidOpenTime').val(arr.bidOpenTime);
	$('#bidOpenTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate:  isLaw == 1?miniData:nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					dateInHolidayTip(selectTime, this);
				}
			}
		})
	});
}