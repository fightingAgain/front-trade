 //2018-03-04 by H

 var saveUrl = config.tenderHost + '/ControlPriceController/save.do'; // 点击添加项目保存的接口
 var getUrl = config.tenderHost + '/ControlPriceController/getAndFile.do'; // 点击添加项目保存的接口
 var fileUrl = config.FileHost + "/FileController/streamFile.do"; //H5上传地址
 var flashFileUrl = config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址
 var fileDelUrl = config.tenderHost + "/ProjectAttachmentFileController/delete.do"; //文件删除地址
 var fileDownload = config.FileHost + "/FileController/download.do"; //下载文件
 var fileAddUrl = config.tenderHost + "/ProjectAttachmentFileController/insertProjectAttachmentFile.do"; //添加附件表的地址
 var bidDetail = config.tenderHost + '/ControlPriceController/findDetailByBidSectionId.do'; //根据标段id查询标段详情

 var changeUrl = config.tenderHost + '/ControlPriceController/getChangeControlPrice.do'; //变更接口

 var bidSectionId = ""; //标段id
 var controlpriceid = ""; //控制价id
 var isMulti = true;
 var enterPriseIframe = "";
 var projectForm = '';

 var projectId = ''; //项目id ，在上传文件时要保存一下项目，根据这个id来判断项目是否
 var fileId = ''; //保存文件到附件表时传回来的文件ID
 var fileList = []; //保存文件信息

 var projectAttachmentFiles = []; //存放附件信息并传给后台

 var priceUploads = null;//控制价文件
 var fileUploads = null;//附件
 

 var special = ''; //控制台传过来的参数
 var isHasDetailedListFile = '';
 $(function() {
 	//数据初始化
 	// 	initData();
	//下拉框数据初始化
	initSelect('.select');
 	// 获取连接传递的参数
 	if($.getUrlParam("controlpriceid") && $.getUrlParam("controlpriceid") != "undefined") {
 		controlpriceid = $.getUrlParam("controlpriceid");
 	}

 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
 		bidSectionId = $.getUrlParam("id");
 	}

 	if($.getUrlParam("special") && $.getUrlParam("special") != "undefined") {
 		special = $.getUrlParam("special");
 	}
 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined") {
 		bidSectionId = $.getUrlParam("bidSectionId");
 	}
	var bidData = getBidSectionDetail(bidSectionId);
	isHasDetailedListFile = (bidData.isHasDetailedListFile || bidData.isHasDetailedListFile == 0)?bidData.isHasDetailedListFile:'';
 	var isContinu = true;
 	if(special == 'CHANGE') {
 		$.ajax({
 			type: "post",
 			url: changeUrl,
 			async: false,
 			dataType: "json", //预期服务器返回的数据类型
 			data: {
 				'bidSectionId': bidSectionId
 			},
 			beforeSend: function(xhr) {
 				var token = $.getToken();
 				xhr.setRequestHeader("Token", token);
 			},
 			success: function(data) {
 				if(data.success) {
 					getBidInfo(bidSectionId);
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
 		getBidInfo(bidSectionId);
 	}
 	if(!isContinu) {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 		return
 	}
 	//审核
 	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 		businessId: controlpriceid,
 		status: 1,
 		type: "kzjsp",
 	});
 	$('#btnFile').click(function() {
 		if(!(controlpriceid && controlpriceid != "")) {
 			saveForm('true', false, function() {
 				initUpload();
 				$('#fileLoad').trigger('click');
 			});
 		} else {
 			initUpload();
 			$('#fileLoad').trigger('click');
 		}

 	});
	$('#btnPriceFile').click(function() {
		if(!(controlpriceid && controlpriceid != "")) {
			saveForm('true', false, function() {
				initUpload();
				$('#filePriceLoad').trigger('click');
			});
		} else {
			initUpload();
			$('#filePriceLoad').trigger('click');
		}
	
	});

 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});

 	/*$("#controlPrice").blur(function(){
 		if($("[name='controlPrice']").val().replace(/,/g,'') != ""){
 			
 		}
 		
 	});*/

 });

 function passMessage(data, callback) {
 	$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
 	$("#bidSectionName").html(data.bidSectionName);
 	//保存
 	$("#btnSave").click(function() {
 		saveForm(true, true, callback);
 	});
 	//提交
 	$("#btnSubmit").click(function() {
 		if(checkForm($("#formName"))) {
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
 				parent.layer.alert('确认提交审核？', function(index) {
 					saveForm(false, false, callback);
 				})
 			}

 		}
 	});
 }

 function initUpload() {
 	if(!priceUploads) {
		if(isHasDetailedListFile == 1){
			priceUploads = new StreamUpload("#filePriceContent", {
				basePath: "/" + entryInfo().enterpriseId + "/" + bidSectionId + "/" + controlpriceid + "/214",
				businessId: controlpriceid,
				status: 1,
				extFilters:[".xml", ".cos"],
				businessTableName: 'T_CONTROL_PRICE', //
				attachmentSetCode: 'CONTROL_PRICE_CLEAN',
				browseFileId: 'filePriceLoad',
				filesQueueId: 'i_stream_files_queue_Price',
				isMult: false
			});
		}else{
			priceUploads = new StreamUpload("#filePriceContent", {
				basePath: "/" + entryInfo().enterpriseId + "/" + bidSectionId + "/" + controlpriceid + "/214",
				businessId: controlpriceid,
				status: 1,
				businessTableName: 'T_CONTROL_PRICE', //
				attachmentSetCode: 'CONTROL_PRICE_CLEAN',
				browseFileId: 'filePriceLoad',
				filesQueueId: 'i_stream_files_queue_Price',
			});
		}
 	}
	if(!fileUploads) {
		fileUploads = new StreamUpload("#fileContent", {
			basePath: "/" + entryInfo().enterpriseId + "/" + bidSectionId + "/" + controlpriceid + "/214",
			businessId: controlpriceid,
			status: 1,
			businessTableName: 'T_CONTROL_PRICE', //
			attachmentSetCode: 'CONTROL_PRICE_FILE',
		});
	}
 }

 //小写金额转大写
 function priceChange() {
 	var val = $("[name='controlPrice']").val().replace(/,/g, '');
 	$("[name='controlPrice']").val(digitToThousands(val));

 	if(val == "") {
 		$("[name='controlPriceUpper']").val("");
 	} else {
 		$("[name='controlPriceUpper']").val(digitUppercase(val));
 	}
 }

 function priceInputs(e, num) {
 	var regu = /^[0-9\,]+\.?[0-9]*$/;
 	if(e.value != "") {
 		if(!regu.test(e.value)) {
 			parent.layer.alert("请输入正确的数字", function(index) {
 				parent.layer.close(index);
 				//				e.value = e.value.substring(0, e.value.length - 1);
 				e.focus();
 			});
 			e.value = "";

 		} else {
 			if(num == 0) {
 				if(e.value.indexOf('.') > -1) {
 					e.value = e.value.substring(0, e.value.length - 1);
 					e.focus();
 				}
 			}
 			if(e.value.indexOf('.') > -1) {
 				if(e.value.split('.')[1].length > num) {
 					e.value = e.value.substring(0, e.value.length - 1);
 					e.focus();
 				}
 			}
 		}
 	}
 	priceChange();
 }

 /*
  * 表单提交
  * isSave: true保存， false提交  
  * isTips: true有提示  false无提示
  */
 function saveForm(isSave, isTips, callback) {
 	var arr = {},
 		tips = "";
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	arr.interfaceName = $('[name=interfaceCode ] option:selected').html();
 	if(arr.controlPrice && arr.controlPrice != "") {
 		arr.controlPrice = Number(arr.controlPrice.replace(/,/g, ''));
 	}

 	if(!isSave) {
 		/*if($("#fileContent tr").length <= 1){
	 		parent.layer.alert("请上传附件");
	 		return;
	 	}*/
 		arr.isSubmit = 1;
 		tips = "控制价提交成功";
 	} else {
 		tips = "控制价保存成功";
 	}
 	if(bidSectionId != "") {
 		arr.packageId = bidSectionId;
 	}
 	if(controlpriceid != "") {
 		arr.id = controlpriceid;
 	}
 	// 	parent.layer.confirm('确定提交保存?', {
 	//		icon: 3,
 	//		title: '询问'
 	//	}, function(index) {
 	//		parent.layer.close(index);
 	$('#btnSubmit').attr('disabled', true);
	 $.ajax({
 		url: saveUrl,
 		type: "post",
 		data: arr,
 		async: false,
 		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			} else {

 				//	        		parent.tools.refreshFather();
 				if(isSave) {
 					controlpriceid = data.data;
 					if(isTips) {
 						top.layer.alert("保存成功");
 					}

 				} else {
 					parent.layer.alert(tips);
 					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 					parent.layer.close(index); //再执行关闭  
 				}
 				if(callback) {
 					callback()
 				}
 			}

 		},
 		error: function(data) {
			$('#btnSubmit').attr('disabled', false);
 			parent.layer.alert("加载失败", {
 				icon: 2,
 				title: '提示'
 			});
 		}
 	});
 	//	});

 };
 function getBidInfo(id) {
 	$.ajax({
 		type: "post",
 		url: bidDetail,
 		async: true,
 		data: {
 			'bidSectionId': id
 		},
 		success: function(data) {
 			if(data.success) {
 				if(data.data) {
 					var res = data.data;
 					if(res.id) {
 						controlpriceid = res.id;
 						initUpload()
 					}
 					for(var key in res) {
 						if(key == "projectAttachmentFiles") {
							var fileArr = {
								file1: [],
								file2: []
							};
							for(var i = 0; i < res[key].length; i++) {
								if(res[key][i].attachmentSetCode == "CONTROL_PRICE_CLEAN") {
									fileArr.file1.push(res[key][i]);
									filePath = res[key][i].url;
								} else if(res[key][i].attachmentSetCode == "CONTROL_PRICE_FILE") {
									fileArr.file2.push(res[key][i]);
								}
							}
							priceUploads.fileHtml(fileArr.file1);
							fileUploads.fileHtml(fileArr.file2);
 						}else if(key == "isControlPrice"){
							$('[name=isControlPrice]').val([res[key]]);
						} else {
 							$('#' + key).html(res[key]);
 							$('[name=' + key + ']').val(res[key]);
 						}

 					}
 				}

 			} else {
 				top.layer.alert(data.message)
 			}
 		}
 	});
 }