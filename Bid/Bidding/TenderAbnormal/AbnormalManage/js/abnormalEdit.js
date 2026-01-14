 var saveUrl = config.tenderHost + '/BidExcepitonController/save.do'; // 保存
 //var detailUrl = config.tenderHost + '/BidExcepitonController/getAndFile.do'; // 详情
 var detailUrl = config.tenderHost + '/BidExcepitonController/getDetailByBidId.do'; // 根据标段id查询详情
 var modelOptionUrl = config.tenderHost + '/WordToHtmlController/findTempBidFileList.do'; //模板下拉框
 var modelUrl = config.tenderHost + '/WordToHtmlController/wordToHtml.do'; //模板地址

 var listPage = "Bidding/TenderAbnormal/AbnormalManage/model/bidSectionList.html"; // 选择标段

 var enterprisId = ""; //企业id
 var idList = [];
 var bidSectionId = ""; //标段id
 var fileUploads = null; // 上传文件
 var abnormalId = ""; //异常id 
 var employeeInfo = entryInfo(); //企业信息
 var source = ""; //1是添加，2是编辑
 var ue;
 var CAcf = null; //实例化CA
 var isPublicProject = ''; //是否公共资源
 var isLaw = ''; //是否依法
 $(function() {
 	//初始化编辑器
 	// ue = UE.getEditor('container');
	 new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'excepitonContent'
	});
 	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
 		source = $.getUrlParam("source");
 		if(source == 1) {
 			$("#btnChoose").show();
 		} else {
 			$("#btnChoose").hide();
 		}
 	}
 	/* if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
 		abnormalId = $.getUrlParam("id");
 	} else { 
 		$("[name='enterpriseName']").val(employeeInfo.enterpriseName);
 		$("[name='enterprisePerson']").val(employeeInfo.userName);
 		$("[name='enterprisePersonTel']").val(employeeInfo.tel);
 	 } */
 	

 	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	
 	//开始时间
	$('#exceptionStartTime').click(function() {
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
						$('#exceptionEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
						dateInHolidayTip($('#exceptionEndTime').val(), '#exceptionEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
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
		if($('#exceptionStartTime').val() != ''){
			var selectTime = $('#exceptionStartTime').val().replace(/\-/g, "/"); //选中的时间
			$('#exceptionEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
			dateInHolidayTip($('#exceptionEndTime').val(), '#exceptionEndTime');
		}
	})
 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});
 	//选择标段
 	$("#btnChoose").click(function() {
 		openList();
 	});
 	$("[name='exceptionTypes']").change(function() {
 		var val = $(this).val();
 		var name = "";
 		if(val == 1) {
 			name = "招标终止公示";
 		} else {
 			name = "招标失败公示";
 		}
 		$("[name='excepitonName']").val($("#bidSectionName").html() + name);
 	});
 	//保存
 	$("#btnSave").click(function() {
 		if(bidSectionId == "") {
 			top.layer.alert("请选择标段");
 			return;
 		}
 		saveForm(true, true);
 	});
 	//提交
 	$("#btnSubmit").click(debounceFun(submitCheck,3*1000,true));

 	//上传文件
 	$('#fileUp').click(function() {
 		if(!bidSectionId) {
 			top.layer.alert("请选择标段");
 			return;
 		}

 		if(!abnormalId) {
 			saveForm(true, false, function() {
 				initUpload();
 				$('#fileLoad').trigger('click');
 			});
 		} else {
 			initUpload();
 			$('#fileLoad').trigger('click');
 		}

 	});

 	//对外公示
 	$("[name='foreign']").change(function() {
 		var val = $("[name='foreign']:checked").val();
 		isPublicity(val);
 	});
 	//初始化模版
 	modelOption(abnormalId);

 	/*全屏*/
 	$('.fullScreen').click(function() {
 		console.log($.parserUrlForToken('fullScreen.html'))
 		parent.layer.open({
 			type: 2,
 			title: '编辑异常公示',
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
 	});
 });
 //实例化上传文件
 function initUpload() {

 	if(!fileUploads) {
 		fileUploads = new StreamUpload("#fileContent", {
 			basePath: "/" + employeeInfo.enterpriseId + "/" + bidSectionId + "/216",
 			businessId: abnormalId,
 			status: 1,
 			businessTableName: 'T_BID_EXCEPITON', //立项批复文件（项目审批核准文件）    项目表附件
 			attachmentSetCode: 'BID_EXCEPITON_FILE'
 		});
 	}
 }

 function passMessage(index, data) {
	if(index == ''){
		//审核
		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
			businessId: '',
			status: 1,
			type: "zbycgs",
		});
	}else{
		$("#bidSectionName").html(data.bidSectionName);
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("[name='excepitonName']").val(data.bidSectionName);
		bidSectionId = data.bidSectionId;
		if(data.getForm && data.getForm == 'KZT') {
			$("#btnChoose").hide();
		}
		var rst = findProjectDetail(bidSectionId);
		initMedia({
			proType: rst
		});
		detail();
	}
 	
 }
 /*
  * 打开查看窗口
  */
 function openList() {
 	var width = $(parent).width() * 0.9;
 	var height = $(parent).height() * 0.9;

 	parent.layer.open({
 		type: 2,
 		title: "标段",
 		area: ['1200px', '650px'],
 		content: listPage,
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;
 			iframeWin.passMessage({
 				idList: idList,
 				callback: bidCallback
 			}); //调用子窗口方法，传参
 		}
 	});
 }

 /*
  * 同级页面返回参数
  */
 function bidCallback(data) {
 	$("#interiorBidSectionCode").html(data[0].interiorBidSectionCode);
 	$("#bidSectionName").html(data[0].bidSectionName);
 	bidSectionId = data[0].id;
 	$("[name='excepitonName']").val(data[0].bidSectionName);
 	isPublicProject = data[0].isPublicProject;
 	isLaw = data[0].isLaw;

 	var rst = findProjectDetail(bidSectionId);
 	initMedia({
 		proType: rst
 	});
 }

function submitCheck() {
	console.log("点击了")
	  if(bidSectionId == "") {
 			top.layer.alert("请选择标段");
 			return;
 		}
		if (checkObjection(bidSectionId)) {
			return
		}
 		if(checkForm($("#formName"))) {
 			if($("[name='foreign']:checked").val() == 1 && !mediaEditor.isValidate()) {
 				// parent.layer.alert('请填写公示内容！');
 				return;
 			}
 			if($("#addChecker").length <= 0) {
 				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
 					title: '提交审核',
 					btn: [' 是 ', ' 否 '],
 					yes: function(layero, index) {
 						saveForm(false, true);
 					},
 					btn2:function(index, layero) {
 						parent.layer.close(index);
 					}
 				})
 			} else {
 				saveForm(false, true);
 			}

 		}
 }
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave, isTips, callback) {

 	if(!isSave) {
 		if(!CAcf) {
 			CAcf = new CA({
 				target: "#formName",
 				confirmCA: function(flag) {
 					if(!flag) {
 						return;
 					}
 					savePost(isSave, isTips, callback);
 				}
 			});
 		}
 		CAcf.sign();
 	} else {
 		savePost(isSave, isTips, callback);
 	}

 };

 function savePost(isSave, isTips, callback) {
 	$('#excepitonContent').val(ue.getContent());
 	$(".mediaDisabled").removeAttr("disabled");
 	var data = parent.serializeArrayToJson($("#formName").serializeArray());
 	var noticeMedia = [];
 	$("[name='noticeMedia']").each(function() {
 		if($(this).is(":checked")) {
 			noticeMedia.push($(this).val());
 		}
 	});
 	if(noticeMedia.length > 0) {
 		data.noticeMedia = noticeMedia.join(",");
 	}

 	if(bidSectionId) {
 		data.bidSectionId = bidSectionId;
 	}
 	if(abnormalId) {
 		data.id = abnormalId;
 	}
 	if(!isSave) {
 		data.isSubmit = 1;

 	}

 	$.ajax({
 		url: saveUrl,
 		type: "post",
 		data: data,
 		async: false,
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			$(".mediaDisabled").attr("disabled", "disabled");
 			abnormalId = data.data;
 			if(isTips) {
 				if(isSave) {
 					parent.layer.alert("保存成功");
 				} else {
 					parent.layer.alert("提交审核成功");
 				}
 			}
 			if(callback) {
 				callback();
 			}
 			parent.$("#tableList").bootstrapTable("refresh");
 			if(!isSave) {
 				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 				parent.layer.close(index); //再执行关闭
 			}
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }

 /**
  * 详情
  */
 function detail() {

 	$.ajax({
 		url: detailUrl,
 		type: "post",
 		asnyc: false,
 		data: {
 			bidSectionId: bidSectionId
 		},
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			var arr = data.data
 			if(arr) {
 				if(arr.id) {
 					abnormalId = arr.id;
 					initUpload();
 				}
 				bidSectionId = arr.bidSectionId;
 				for(var key in arr) {
 					if(key == "projectAttachmentFiles") {
 						if(arr.projectAttachmentFiles.length > 0) {
 							fileUploads.fileHtml(arr.projectAttachmentFiles);
 						}
 					} else if(key == "foreign") {
 						$("[name='foreign'][value='" + arr[key] + "']").prop("checked", "checked");
 						isPublicity(arr[key]);
 						if(arr.noticeMedia) {
 							var noticeMedia = arr.noticeMedia.split(",");
 							$("[name='noticeMedia']").prop("checked", false);
 							for(var i = 0; i < noticeMedia.length; i++) {
 								$("[name='noticeMedia'][value='" + noticeMedia[i] + "']").prop("checked", "checked");
 							}
 						}
 					} else if(key == "noticeMedia") {
 						continue;
 					} else {
 						$("[name='" + key + "']").val(arr[key]);
 					}
 				};
				mediaEditor.setValue(arr);
 				// if(arr.excepitonContent) {
 				// 	ue.ready(function() {
 				// 		ue.setContent(arr.excepitonContent);
 				// 	});
 				// }
				if(arr.exceptionEndTime){
					dateInHolidayTip(arr.exceptionEndTime, '#exceptionEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
				}
 			} else {
 				$("[name='enterpriseName']").val(employeeInfo.enterpriseName);
 				$("[name='enterprisePerson']").val(employeeInfo.userName);
 				$("[name='enterprisePersonTel']").val(employeeInfo.tel);
 			}
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId: abnormalId,
				status: 1,
				type: "zbycgs",
			});
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 };
 //是否对外公示
 function isPublicity(val) {
 	if(val == 1) {
 		$(".isShow").show();
 		$("[name='exceptionStartTime']").attr("datatype", "*");
 		$("[name='exceptionEndTime']").attr("datatype", "*");
 	} else {
 		$(".isShow").hide();
 		$("[name='exceptionStartTime']").removeAttr("datatype");
 		$("[name='exceptionEndTime']").removeAttr("datatype");
 	}

 }

 //选择模版
 function modelOption(meter) {
 	$.ajax({
 		type: "post",
 		url: modelOptionUrl,
 		async: true,
 		data: {
 			'tempType': ""
 		},
 		success: function(data) {
 			var arr = data.data;
 			if(data.success) {
 				var option = "";
 				for(var i = 0; i < arr.length; i++) {
 					option = $('<option data-model-id="' + arr[i].id + '" data-model-url="' + arr[i].url + '">' + arr[i].tempName + '</option>');
 					$('#noticeTemplate').append(option);
 				}
 			}
 		}
 	});
 }
 
  /* 
 *  防抖函数
 * func 要执行的函数
 * wait: 延迟时间 
 * immediate：true/false 控制是否立即执行 true:wait时间内执行第一次 false wait时间内连续点击执行最后一次
 */
	function debounceFun(func, wait, immediate) {
		if (!wait) wait = 2 * 1000;
		let timerout;
		return function () {
				let context = this;
				let args = arguments;
				clearTimeout(timerout)
				if (immediate){
						let callNow = !timerout;
						timerout = setTimeout(() => {
								timerout = null;
						}, wait);
						if (callNow) func.apply(context, args);
				} else{
						timerout = setTimeout(function() {
								func.apply(context, args);
						}, wait);
				}
		}
	}
	
	// 异议拦截校验
function checkObjection(bidSectionId) {
	var flag = true;
	$.ajax({
		type: "post",
		url: config.tenderHost + '/ObjectionAnswersController/getObjectionAnswersBybidSectionId',
		async: false,
		data: {
			'bidSectionId': bidSectionId,
		},
		success: function (res) {
			if (res.success == false) {
				parent.layer.alert(res.message);
			} else {
				if (res.data) {
					parent.layer.alert('温馨提示：该项目存在未处理完毕的异议，请尽快处理。');
				}
				flag = res.data;
			}
		}
	});
	return flag;
}