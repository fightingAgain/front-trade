/**

 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/DocClarifyController/saveOrUpdateDocClarify.do'; //保存接口
var detailUrl = config.tenderHost + '/DocClarifyController/findDetailByBidSectionId.do'; //招标文件详情

var bidSectionPage = 'Bidding/Project/model/bidSectionEdit.html'; //编辑标段页面

var bidUploads = null, //招标文件
	drawUploads = null, //图纸文件
	otherUploads = null; //其他资料文件
var fileId = ""; //招标文件id
var bidSectionId = ""; //标段id
var employeeInfo = entryInfo(); //企业信息
var filePath = ""; //上传到服务器的文件路径
var isExitFile = false; //是否存在招标文件
var typeCode = ""; //项目类型
var isPay; //是否有图纸文件
var bidOpenType; //线上线下开标
var extFilters;
var CAcf = null;
var tenderMode;//招标方式
var feeConfirmVersion;//服务费版本  
$(function() {
	bidSectionId = $.getUrlParam('id');
	//	detail();
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
});

function initUpload() {
	//招标文件
	if(!bidUploads) {
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
				}
			},
			uploadFail:function(){
				$('#fileBid').removeAttr('disabled');
			}
		});
	}

	//上传图纸文件
	if(!drawUploads) {
		drawUploads = new StreamUpload("#drawFile", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + fileId + "/204",
			businessId: fileId,
			status: 1,
			businessTableName: 'T_BID_DOC_CLARIFY', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'DRAWING_DOCUMENT',
			extFilters: [".pdf", ".zip", ".rar"],

			browseFileId: 'btnDraw',
			filesQueueId: 'i_stream_files_queue_draw'
		});
	}

	//上传其他文件
	if(!otherUploads) {
		otherUploads = new StreamUpload("#otherFile", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + fileId + "/204",
			businessId: fileId,
			status: 1,
			businessTableName: 'T_BID_DOC_CLARIFY', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'OTHER_FILE_ATTACHS',
			extFilters: [".pdf", ".cad", ".dwg", ".dxf", ".dwt", ".xml", ".png", ".jpg", ".gif", ".bmp", ".doc", ".docx", ".xlsx", ".xls", ".pptx", ".zip", ".rar"],
			browseFileId: 'btnOther',
			filesQueueId: 'i_stream_files_queue_other'
		});
	}
}

//其他页面调用的方法
function passMessage(data, callback) {
	if(data) {
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
		detail(data.bidSectionId);
	} else {
		$("input[name='marginPayType']").each(function() {
			$(this).attr("checked", true);
		});
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
		if(bidSectionId == "") {
			parent.layer.alert("请选择标段", function(ind) {
				parent.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
		saveForm(true, false, callback);
	});
	//提交审核
	$("#btnSubmit").click(function() {
		if(bidSectionId == "") {
			parent.layer.alert("请选择标段", function(ind) {
				parent.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
		if($("#bidFile .fileListTab tr").length <= 1) {
			parent.layer.alert("请上传招标文件", function(ind) {
				parent.layer.close(ind);
				$('#collapseTwo').collapse('show');
			});
			return;
		}
		if(typeCode == "A" && isPay == 1) {
			if($("#drawFile .fileListTab tr").length <= 1) {
				parent.layer.alert("请上传图纸文件", function(ind) {
					parent.layer.close(ind);
					$('#collapseThree').collapse('show');
				});
				return;
			}
		}
		if($("#addChecker").length <= 0) {
			parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
				title: '提交审核',
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					saveForm(false, false, callback);
				},
				btn2:function(index, layero) {
					parent.layer.close(index);
				}
			})
		} else {
			saveForm(false, false, callback);
		}

	});
	//上传招标文件
	$('#fileBid').click(function() {
		$('#fileBid').attr('disabled','disabled');
		if(bidSectionId == "") {
			parent.layer.alert("请选择标段", {
				icon: 7,
				title: '提示'
			}, function(ind) {
				parent.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			$('#fileBid').removeAttr('disabled');
			return;
		}
	
		if(!(fileId && fileId != "")) {
			saveForm('true', true, function() {
				callback();
				initUpload();
				$('#btnBid').trigger('click');
			});
		} else {
			$('#fileBid').removeAttr('disabled');
			initUpload();
			$('#btnBid').trigger('click');
		}
	
	});
	//上传图纸文件
	$('#fileDraw').click(function() {
		if(bidSectionId == "") {
			parent.layer.alert("请选择标段", {
				icon: 7,
				title: '提示'
			}, function(ind) {
				parent.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
	
		if(!(fileId && fileId != "")) {
			saveForm('true', true, function() {
				callback();
				initUpload();
				$('#btnDraw').trigger('click');
			});
		} else {
			initUpload();
			$('#btnDraw').trigger('click');
		}
	
	});
	//上传其他文件
	$('#fileOther').click(function() {
		if(bidSectionId == "") {
			parent.layer.alert("请选择标段", {
				icon: 7,
				title: '提示'
			}, function(ind) {
				parent.layer.close(ind);
				$('#collapseOne').collapse('show');
			});
			return;
		}
	
		if(!(fileId && fileId != "")) {
			saveForm('true', true, function() {
				callback();
				initUpload();
				$('#btnOther').trigger('click');
			});
		} else {
			initUpload();
			$('#btnOther').trigger('click');
		}
	});
	
}

/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 * isAlert  true是不弹框  false是弹框
 * callback 回调方法
 */
function saveForm(isSave, isAlert, callback) {
	var data;
	if(!isSave) {
		if($("[name='checkerIds']").length > 0 && $("[name='checkerIds']").val() == "") {
			parent.layer.alert("请选择审核人", function(ind) {
				parent.layer.close(ind);
				$('#collapseWorkflow').collapse('show');
			});
			return;
		}
		if(!CAcf) {
			CAcf = new CA({
				target: "#formName",
				confirmCA: function(flag) {
					if(!flag) {
						return;
					}
					data = parent.serializeArrayToJson($("#formName").serializeArray());
					data.isSubmit = 1;
					data.bidSectionId = bidSectionId;
					if(fileId != "") {
						data.id = fileId;
					}
					if(filePath != "") {
						data.url = filePath;
					}
					savePost(data, isSave, isAlert, callback);
				}
			});
		}
		CAcf.sign();
	} else {
		data = parent.serializeArrayToJson($("#formName").serializeArray());
		if(filePath != "") {
			data.url = filePath;
		}
		data.bidSectionId = bidSectionId;
		if(fileId != "") {
			data.id = fileId;
		}
		savePost(data, isSave, isAlert, callback);
	}

}

function savePost(arr, isSave, isAlert, callback) {
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: arr,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			$('#fileBid').removeAttr('disabled');
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
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);

				top.layer.alert("提交成功");
			}
			//			parent.tools.refreshFather();
			//			parent.$('#table').bootstrapTable('refresh');
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
function detail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: false,
		data: {
			bidSectionId: id,
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.msg);
			} else {
				var arr = data.data;
				feeConfirmVersion = arr.feeConfirmVersion;
				if(arr.id) {
					fileId = arr.id;
					/*//审核
					$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
						businessId: fileId,
						status: 1,
						type: "zbwjsp",
					});*/

					/*if(!bidUploads) {
						initUpload();
					}
					if(!drawUploads) {
						initUpload();
					}
					if(!otherUploads) {
						initUpload();
					}*/
				}
				//无论预审项目还是后审项目，在招标文件提交前（审核状态为：“未编辑”、“未提交”），项目经理可以通过上述功能入口修改标段设置信息；
				if(!arr.bidDocClarifyState || arr.bidDocClarifyState == 0 || arr.bidDocClarifyState == 4){
					$('#btnEditBid').show();
				}else{
					$('#btnEditBid').hide();
				}
				bidOpenType = arr.bidOpenType;
				if(bidOpenType == 1) {
					extFilters = [".zbwj"];
				} else {
					extFilters = [".doc", ".docx", ".pdf", ".PDF"];
				}

				if(fileId) {
					initUpload();
				}

				typeCode = arr.tenderProjectType.substring(0, 1);
				isPay = arr.isPay;
				tenderMode = arr.tenderMode;
				if(typeCode == "A") {
					if(isPay == 0) {
						$(".drawShow").hide();
					} else {
						$(".drawShow").show();
					}
				} else {
					$(".drawShow").hide();
				}

				for(var key in arr) {
					if(key == "projectAttachmentFiles") {
						var fileArr = {
							file1: [],
							file2: [],
							file3: []
						};

						for(var i = 0; i < arr[key].length; i++) {
							if(arr[key][i].attachmentSetCode == "TENDER_FILE") {
								fileArr.file1.push(arr[key][i]);
								filePath = arr[key][i].url;
							} else if(arr[key][i].attachmentSetCode == "DRAWING_DOCUMENT") {
								fileArr.file2.push(arr[key][i]);
							} else if(arr[key][i].attachmentSetCode == "OTHER_FILE_ATTACHS") {
								fileArr.file3.push(arr[key][i]);
							}
						}
						bidUploads.fileHtml(fileArr.file1);
						drawUploads.fileHtml(fileArr.file2);
						otherUploads.fileHtml(fileArr.file3);

					} else if(key == "marginPayType") {
						continue;
					} else {
						$("[name='" + key + "']").val(arr[key]);
						$("#" + key).html(arr[key]);
					}
				}
				if(arr.marginPayType != undefined && arr.marginPayType != '') {
					var marginPayTypeData = [];
					marginPayTypeData = arr.marginPayType.split(',');
					for(var i = 0; i < marginPayTypeData.length; i++) {
						$("[name='marginPayType']:eq(" + marginPayTypeData[i] + ")").attr('checked', true);
					}
					//				$("input[name='marginPayType']").attr("disabled",true);
				}
			}

		}
	});
};
$('#btnEditBid').click(function(e){
	e.stopPropagation();
	top.layer.open({
		type: 2,
		title: "标段信息",
		area: ['1200px', '600px'],
		content: bidSectionPage + "?id=" + bidSectionId + "&isPublicProject=0&from=bidFile&examType=2&classCode=" + typeCode+"&tenderMode=" + tenderMode+"&feeConfirmVersion="+feeConfirmVersion,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({
				bidSectionId: bidSectionId
			}); //调用子窗口方法，传参
		}
	});
})
