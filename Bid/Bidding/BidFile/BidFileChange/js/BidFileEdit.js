/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/DocClarifyController/saveChange.do'; //保存接口
//var detailUrl = config.tenderHost + '/DocClarifyController/findDocClarifydetail.do';  //招标文件详情
var detailUrl = config.tenderHost + '/DocClarifyController/findChangDocDetail.do'; //招标文件详情
//var dateUrl = config.tenderHost + '/DocClarifyController/getBidSectionDateTime.do';  //时间详情
var dateUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do'; //时间详情
var historyUrl = config.tenderHost + '/DocClarifyController/findOldAttachmentFileList.do'; //招标文件时间变更历史
var bidUploads = null, //招标文件
	addendumUploads = null; //补遗文件
var fileId = ""; //招标文件id
var bidDocClarifyId = ""; //原始招标文件id
var employeeInfo = entryInfo(); //企业信息
var filePath = ""; //上传到服务器的文件路径
var isExitFile = false; //是否存在招标文件
var examType = 2;
var extFilters = []; //招标文件类型
var bidSectionId = ""; //标段id
var CAcf = null;
var isLaw = ''; //是否依法招标 0否 1 是
var docGetEndTime = ''; //文件获取截止时间
var special = ''; //来源
var bidId = ''; //标段id
var btnType = ''; //变更还是编辑
var timeData;
var bidInfo;//获取标段信息
$(function() {
	bidId = $.getUrlParam('id');
	if($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		btnType = $.getUrlParam('special');
	}
	bidInfo = getBidSectionDetail(bidId);
	//获取标段中的保证金信息
	if(bidInfo.isCollectDeposit == 1){
		$('.isShowDeposit').show();
		$("[name='isCollectDeposit'][value='" + bidInfo.isCollectDeposit + "']").prop("checked", true);
		$("[name='depositType'][value='" + bidInfo.depositType + "']").prop("checked", true);
		$("[name='depositMoney']").val(bidInfo.depositMoney?bidInfo.depositMoney:'');
		$("[name='depositRatio']").val(bidInfo.depositRatio?bidInfo.depositRatio:'');
		formatDeposit(bidInfo.depositType);
	}
	noteDate(bidId)
	detail(bidId);

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
			if($("[name='isChangeDeposit']").is(":checked")) {
				$('#approval').show();
			}
		}
	});
	$("[name='isReplenish']").click(function() {
		if($(this).is(":checked")) {
			$(".addendum").show();
		} else {
			$(".addendum").hide();
		}
	});
	//变更保证金
	$("[name='isChangeDeposit']").click(function() {
		if($(this).is(":checked")) {
			$(".changeDeposit").show();
		} else {
			$(".changeDeposit").hide();
			if($("[name='isChange']").is(":checked")) {
				$('#approval').show();
			}
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
			businessTableName: 'T_BID_DOC_CLARIFY', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'TENDER_FILE',
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

				console.log(filePath)
			}
		});
	}

	//上传文件
	if(!addendumUploads) {
		addendumUploads = new StreamUpload("#addendumFile", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + fileId + "/204",
			businessId: fileId,
			status: 1,
			businessTableName: 'T_BID_DOC_CLARIFY_REPLENISH', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'REPLENISH_FILE',

			browseFileId: 'btnAddendum',
			filesQueueId: 'i_stream_files_queue_addendum'
		});
	}
}
//其他页面调用的方法
function passMessage(data, callback) {
	if(data) {
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
		bidSectionId = data.bidSectionId;
	}
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: fileId,
		status: 1,
		type: "zbwjsp",
	});
	//保存按钮
	$("#btnSave").click(function() {
		saveForm(true, false, callback);
	});
	//提交审核
	$("#btnSubmit").click(function() { 
		if($("#addChecker").length <=0) {
			top.layer.open({
			type: 0,
			title: '提交审核', 
			btn: [' 是 ', ' 否 '],
			resize: false,
			content: "此流程未设置审批人，提交后将自动审核通过，是否确认提交?",
			yes:  function(layero, index){
				saveForm(false, false, callback);
			},
			bnt2: function(index){
				layer.close(index)
			}
		})
		}else{
			parent.layer.alert('确认提交审核？', function(index) {
				parent.layer.close(index)
				saveForm(false, false, callback);
			})
		}
		
	});
	//上传招标文件
	$('#fileBid').click(function() {
		var obj = $(this);
		if(bidDocClarifyId == "") {
			parent.layer.alert("请选择标段", {
				icon: 7,
				title: '提示'
			}, function(ind) {
				top.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
	
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
				callback();
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
		if(bidDocClarifyId == "") {
			parent.layer.alert("请选择标段", {
				icon: 7,
				title: '提示'
			}, function(ind) {
				top.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
	
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
				callback();
				initUpload();
				$('#btnAddendum').trigger('click');
			});
		} else {
			initUpload();
			$('#btnAddendum').trigger('click')
		}
	
	});
}

/**
 * 选择标段回调方法
 * @param {Object} data  
 */

/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 * isAlert  true是不弹框  false是弹框
 * callback 回调方法
 */
function saveForm(isSave, isAlert, callback) {
	//	var data = parent.serializeArrayToJson($("#formName").serializeArray());

	if(bidDocClarifyId == "") {
		parent.layer.alert("请选择标段", {
			icon: 7,
			title: '提示'
		}, function(ind) {
			top.layer.close(ind);
			$('#collapseOne').collapse('show');
		});
		return;
	}

	if($("[name='docName']").val() == "") {
		top.layer.alert("请输入变更标题", function(index) {
			top.layer.close(index);
			$('#collapseOne').collapse('show');
			$("[name='docName']").focus();
		});
		return;

	}
	if((!$("[name='isChange']").is(":checked")) && (!$("[name='isChangeDeposit']").is(":checked"))) {
		top.layer.alert("请选择变更类型", function(ind) {
			parent.layer.close(ind);
			$('#collapseOne').collapse('show');
		});
		return;
	}
	if($("[name='isChange']").is(":checked")) {
		if(!isSave) {
			if($("#bidFile .fileListTab tr").length <= 1) {
				parent.layer.alert("请上传招标文件", function(ind) {
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
			if($("#addendumFile .fileListTab tr").length <= 1 && $.trim($("[name='clarifyTime']").val()) == "" && $.trim($("[name='answersEndDate']").val()) == "" && $.trim($("[name='bidDocReferEndTime']").val()) == "" && $.trim($("[name='bidOpenTime']").val()) == "") {
				parent.layer.alert("请填写变更时间", function(ind) {
					parent.layer.close(ind);
					$('#collapseThree').collapse('show');
				});
				return;
			}
			var clarifyTime = Date.parse(new Date($('#clarifyTime').val().replace(/\-/g, "/"))); //提出澄清截止时间
			var answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g, "/"))); //答复截止时间
			var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g, "/"))); //投标文件递交截止时间
			var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g, "/"))); //开标时间
			var docGetEndTime = Date.parse(new Date($('#docGetEndTime').val().replace(/\-/g, "/"))); //文件获取截止时间
			var noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g, "/"))); //公告发布截止时间
			var noticeSendTime = Date.parse(new Date(timeData.noticeSendTime.replace(/\-/g, "/"))); //公告发布时间
			var docGetStartTime = Date.parse(new Date(timeData.docGetStartTime.replace(/\-/g, "/"))); //招标文件获取时间

			var nDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));

			if($("[name='isChange']").is(":checked")) {
				if(bidDocReferEndTime < nDate) {
					parent.layer.alert('招标文件获取截止时间应在当前系统时间之后！', function(ind) {
						parent.layer.close(ind);
						//				$('.collapse').collapse('hide');
						$('#collapseThree').collapse('show');
					});
					return;
				}
			}

			if(noticeEndTime <= noticeSendTime) {
				parent.layer.alert('公告发布截止时间应在公告发布时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}
			if(docGetEndTime < docGetStartTime) {
				parent.layer.alert('招标文件获取截止时间应在招标文件获取时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}

			if(clarifyTime < docGetEndTime) {
				parent.layer.alert('提出澄清截止时间应在文件获取截止时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}
			if(answersEndDate < clarifyTime) {
				parent.layer.alert('答复截止时间应在提出澄清截止时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}
			if(bidDocReferEndTime < answersEndDate) {
				parent.layer.alert('投标文件递交截止时间应在答复截止时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}
			if(bidOpenTime < bidDocReferEndTime) {
				parent.layer.alert('开标时间应在投标文件递交截止时间之后！', function(ind) {
					parent.layer.close(ind);
					//				$('.collapse').collapse('hide');
					$('#collapseThree').collapse('show');
				});
				return
			}
			//公告截止时间与开始时间相差的天数
			var time3 = bidDocReferEndTime - clarifyTime;

			var times3 = 15 * 24 * 60 * 60 * 1000;
			//			if(verifyTime){
			if(isLaw == 1) {
				if(time3 < times3) {
					parent.layer.alert('依法招标的项目，投标文件递交截止时间与提出澄清截止时间相差的天数要大于等于15天', function(ind) {
						parent.layer.close(ind);
						$('#collapseThree').collapse('show');
					});
					return
				}

			}
			//			}

		}
	}
	if($("[name='isChangeDeposit']").is(":checked")){
		if($('[name=depositType]:checked').val() == '1'){
			if($.trim($('[name=depositMoney]').val()) == '' || $.trim($('[name=depositMoney]').val()).length > 14){
				parent.layer.alert('温馨提示：请正确输入保证金金额', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return;
			}
		}else if($('[name=depositType]:checked').val() == '2'){
			if($.trim($('[name=depositRatio]').val()) == '' || $.trim($('[name=depositRatio]').val()).length > 14){
				parent.layer.alert('温馨提示：请正确输入保证金比例', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return;
			}
		}
		if(!isSave) {
			if($("[name='checkerIds']").val() == "") {
				parent.layer.alert("请选择审核人员", function(ind) {
					parent.layer.close(ind);
					$('#collapseWorkflow').collapse('show');
				});
				return;
			}
		}
	}

	if(!isSave) {
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
		CAcf.sign();
	} else {
		var arr = getPara(isSave);
		savePost(isSave, isAlert, callback, arr);
	}

}

function getPara(isSave) {
	var para = {};
	para.bidDocClarifyId = bidDocClarifyId;
	para.bidSectionId = bidId;
	para.docName = $("[name=docName]").val();

	para.isChange = 0;
	para.isReplenish = 0;
	if($("[name='isChangeDeposit']").is(":checked")) {
		para.isChangeDeposit = 1;
		para.depositType = $('[name=depositType]:checked').val();
		para.isCollectDeposit = $('[name=isCollectDeposit]:checked').val();
		if($('[name=depositType]:checked').val() == '1'){
			para.depositMoney = $('[name=depositMoney]').val();
		}else if($('[name=depositType]:checked').val() == '2'){
			para.depositRatio = $('[name=depositRatio]').val();
		}
		if(!isSave) {
			para.checkerIds = $("[name='checkerIds']").val();
		}
	}
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
		para.clarifyTime = $("[name='clarifyTime']").val();
		para.answersEndDate = $("[name='answersEndDate']").val();
		para.bidDocReferEndTime = $("[name='bidDocReferEndTime']").val();
		para.bidOpenTime = $("[name='bidOpenTime']").val();
		para.noticeEndTime = $("[name='noticeEndTime']").val();
		para.docGetEndTime = $("[name='docGetEndTime']").val();
	}
	if(fileId != "") {
		para.id = fileId;
	}
	para.examType = examType;

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
				/*if(isForward == '1'){
					callback(bidId);
				}else{
					callback();
				}*/
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
			/*//控制台编辑从中间页面过来时，中间页面无tools.refreshFather() 函数
			if(isForward != '1'){
				parent.tools.refreshFather();
			}*/
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}
	});
}

/**
 * 获取招标文件详情
 * id 标段id
 */
function detail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			bidSectionId: id,
		},
		success: function(data) {
			// console.log(data)
			if(!data.success) {
				parent.layer.alert(data.msg);
				return;
			}
			data.data.isReplenish = 0;
			var arr = data.data;
			bidDocClarifyId = arr.bidDocClarifyId;
			bidDocClarifyState = arr.bidDocClarifyState;
			if(arr.bidOpenType == 1) {
				extFilters = [".zbwj"];
			} else {
				extFilters = [".doc", ".docx", ".pdf", ".PDF"];
			}
			if(arr.id) {
				if(arr.bidDocClarifyState != 2) {
					fileId = arr.id;
				} else {
					arr = [];
				}
				$("[name='depositMoney']").val(arr.depositMoney?arr.depositMoney:'');
				$("[name='depositRatio']").val(arr.depositRatio?arr.depositRatio:'');
			}
			bidSectionId = arr.bidSectionId;
			$("[name='isChange']").removeAttr("checked");
			$("[name='isReplenish']").removeAttr("checked");
			$(".change").hide();
			$(".addendum").hide();
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
							if(arr[key][i].attachmentSetCode == "TENDER_FILE") {
								fileArr.file1.push(arr[key][i]);
								filePath = arr[key][i].url;
							} else if(arr[key][i].attachmentSetCode == "OTHER_FILE_ATTACHS"|| arr[key][i].attachmentSetCode == "REPLENISH_FILE") {
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

					} else if(key == "isChangeDeposit") {
						if(arr[key] == 1) {
							$("[name='isChangeDeposit']").prop("checked", "checked");
							$(".changeDeposit").show();
						}

					} else if(key == "isReplenish") {
						if(arr[key] == 1) {
							$("[name='isReplenish']").prop("checked", "checked");
							$(".addendum").show();
						}
					} else {
						$("[name='" + key + "']").val(arr[key]);
					}
					if(key == 'noticeEndTime' || key == 'docGetEndTime' || key == 'bidDocReferEndTime' || key == 'bidOpenTime'){
						dateInHolidayTip(arr[key], ('#' + key));//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
				}
			}
			//			noteDate(arr);
		}
	});
}
/**
 * 获取招标文件详情
 * id 招标文件当前id
 */
function noteDate(id) {
	$.ajax({
		type: "post",
		url: dateUrl,
		async: false,
		data: {
			bidSectionId: id,
			examType: '2'
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			if(data.data) {
				var arr = data.data;
				initDate(arr);
			}
		}
	});
}

function initDate(arr) {
	timeData = arr;
	var noticeSendTime = arr.noticeSendTime.replace(/\-/g, "/");
	//公告发布截止时间
	//	$("#noticeEndTime").val(arr.noticeEndTime);
	$(".noticeEndTime").html(arr.noticeEndTime);

	//招标文件获取截止时间
	//	$("#docGetEndTime").val(arr.docGetEndTime);
	$(".docGetEndTime").html(arr.docGetEndTime);

	//提出澄清截止时间
	//	$("#clarifyTime").val(arr.clarifyTime);
	$(".clarifyTime").html(arr.clarifyTime);

	//答疑截止时间
	// 	$('#answersEndDate').val(arr.answersEndDate);
	$('.answersEndDate').html(arr.answersEndDate);

	//投标文件递交截止时间
	//	$('#bidDocReferEndTime').val(arr.bidDocReferEndTime);
	$('.bidDocReferEndTime').html(arr.bidDocReferEndTime);

	//开标时间
	//	$('#bidOpenTime').val(arr.bidOpenTime);
	$('.bidOpenTime').html(arr.bidOpenTime);

	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//公告发布截止时间
	$('#noticeEndTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: isLaw == 1?automatic(docGetEndTime, 5, '1'):nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					dateInHolidayTip(selectTime, this);
				}
			}
		})
	});
	//招标文件获取截止时间
	$('#docGetEndTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: isLaw == 1?automatic(docGetEndTime, 5, '1'):nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					dateInHolidayTip(selectTime, this);
				}
			}
		})
	});
	//澄清
	$('#clarifyTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: nowDate,
			maxDate: '#F{$dp.$D(\'answersEndDate\')}',
		})
	});
	//答疑截止时间
	$('#answersEndDate').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: nowDate
		});
	})
	//投标文件递交截止时间

	$('#bidDocReferEndTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: isLaw == 1?automatic(docGetEndTime, 20, '1'):nowDate,
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
	$('#bidOpenTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: isLaw == 1?automatic(docGetEndTime, 20, '1'):nowDate,
			onpicked: function(dp) {
				var selectTime = dp.cal.getNewDateStr(); //选中的时间
				if(selectTime && selectTime != '') {
					//查询是否是休息日期
					dateInHolidayTip(selectTime, this);
				}
			}
		})
	});
	var dateData = {
		noticeEndTime: arr.noticeEndTime,
		docGetEndTime: arr.docGetEndTime
		// 		clarifyTime: arr.clarifyTime,
		// 		answersEndDate: arr.answersEndDate,
		// 		bidDocReferEndTime: arr.bidDocReferEndTime,
		// 		bidOpenTime: arr.bidOpenTime
	}

	var nDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));
	for(var k in dateData) {
		if(nDate > Date.parse(new Date(dateData[k].replace(/\-/g, "/")))) {
			$("#" + k).attr("disabled", "disabled");
			$("#" + k).val(dateData[k]);
		}
	}

}
//保证金
function formatDeposit(depositType) {
	if (depositType == 1) {
		$(".depositTit").html('保证金金额（元）<i class="red">*</i>');
		// $("[name=depositMoney]").attr("datatype", "positiveNum");
		// $("[name=depositRatio]").removeAttr("datatype");
		$(".depositMoney").show();
		$(".depositRatio").hide();
	} else {
		$(".depositTit").html('保证金比例（不低于投标总价）%<i class="red">*</i>');
		// $("[name=depositMoney]").removeAttr("datatype");
		// $("[name=depositRatio]").attr("datatype", "positiveNum");
		$(".depositMoney").hide();
		$(".depositRatio").show();
	}
}