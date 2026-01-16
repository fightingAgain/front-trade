/**

 *  编辑、添加公告
 *  方法列表及功能描述
 */

var saveUrl = config.tenderHost + "/NoticeController/save.do"; //保存地址
var resiveUrl = config.tenderHost + "/NoticeController/findNoticeDetails.do"; //公告详情 
var backUrl = config.tenderHost + "/NoticeController/revokeWorkflowItem.do"; //撤回   
var tenderUrl = config.tenderHost + "/NoticeController/findAllById.do"; //招标项目详情地址
var bidUrl = config.tenderHost + "/NoticeController/findBidSectionList.do"; //标段详情地址
var fileUrl = config.FileHost + "/FileController/streamFile.do"; //H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址
var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do'; //相关信息回显

var copyHtml = "Bidding/Model/relateNoticeList.html"; //复制
var bidHtml = "Bidding/Model/bidSectionList.html"; //标段列表
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //查看标段详情页面
var roomOrderHtml = 'Bidding/Invitation/model/roomOrder.html'; //预约会议室
var copyUrl = config.tenderHost + "/NoticeController/copy.do"; //变更地址
var testDateUrl = config.Syshost + '/HolidaySettingController/getReallyNoticeDate.do';//查询真正的截止日期

var bidIdArr = []; // 存放标段编号
var bidArr = [];
var tenderProjectId = ''; //招标项目id
var bidDetail; //从父级传过来的标段详情
var id = ''; //公告列表中带过来的ID
var noticeId = ''; //公告列表中带过来的原始公告ID
var bidId = ''; //一对一时的标段Id
var projectAttachmentFiles = []; //存放附件信息并传给后台
var roomData = []; //会议室列表信息

var fileUploads = null; //上传文件

var isPublicProject = ''; //是否公共资源
var isSign = ''; //是否需要报名
var isLaw = ''; //是否依法招标 0否 1 是
var ue;
var CAcf = null; //实例化CA
var noticeNature;

var special = ''; //控制台带过来的特殊值
$(function() {
	$('.th_bg').prev().css('width', (Number($('.th_bg').closest('tr').width()) - 424) / 2 + "px"); //设置第2列与第4列宽度一致
	//初始化编辑器
	// ue = UE.getEditor('container');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'noticeContent'
	});

	//	noticeId = $.getUrlParam('noticeId');//公告列表中带过来的原始公告ID
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	if($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		special = $.getUrlParam('special'); //公告列表中带过来的ID
	}
	getRelevant(bidId);
	//媒体
	var rst = findProjectDetail(bidId);
	initMedia({
		proType: rst,
		isDisabled: noticeNature == 2 ? true : false
	});
	if(special == 'CHANGE') {
		$.ajax({
			type: "post",
			url: resiveUrl,
			async: false,
			dataType: "json", //预期服务器返回的数据类型
			data: {
				'bidSectionId': bidId
			},
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function(data) {
				if(data.success) {
					noticeId = data.data.noticeId;
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function() {
				parent.layer.alert("提交失败！");
			}
		});
		if(noticeId && noticeId != '') {
			$.ajax({
				type: "post",
				url: copyUrl,
				async: false,
				dataType: "json", //预期服务器返回的数据类型
				data: {
					noticeId: noticeId
				},
				beforeSend: function(xhr) {
					var token = $.getToken();
					xhr.setRequestHeader("Token", token);
				},
				success: function(data) {
					if(data.success) {
						noticeNature = 2;
						reviseNotice();
					} else {
						top.layer.alert(data.message)
					}
				},
				error: function() {
					parent.layer.alert("提交失败！");
				}
			});
		}
	} else {
		reviseNotice();
	}

	//	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
	//		id = $.getUrlParam('id');//公告列表中带过来的ID
	//	}
	var date = new Date();
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: id,
		status: 1,
		type: "yscggg",
	});

	//模板下拉框
	modelOption({
		tempType: 'notice',
		examType: 1
	});

	//下拉列表数据初始化
	initSelect('.select');
	//公告发布时间
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//	console.log(nowDate)
	//开始时间
	$('#noticeSendTime').focus(function() {
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
					//招标公告发布截止时间、投标文件递交截止时间
					var arr = [automatic(selectTime, 5, '1'), automatic(selectTime, 10, '2')]
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
										$('#noticeEndTime').val(data.data[0]); //招标公告发布截止时间
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
						if(isSign == 1) {
							$('#signStartDate').val(automatic(selectTime, 0)); //报名开始时间
							$('#signEndDate').val(automatic(selectTime, 5, 1)); //报名截止时间
						}
					}
				}
			}
		})

	});
	newChangeTimes();
	//重置时间
	$("#emptyTime").click(function() {
		$('.times').val('').css('color','#555');
		$('#noticeSendTime').val('');
		$("input:disabled").removeAttr("disabled");
		$('.holidayTips').remove();
	})

	/*两个日期之间相差的天数*/
	function daysBetween(startTime, endTime) {
		//Date.parse() 解析一个日期时间字符串，并返回1970/1/1 午夜距离该日期时间的毫秒数
		var time1 = Date.parse(new Date(startTime));
		var time2 = Date.parse(new Date(endTime));
		var nDays = parseInt((time2 - time1) / 1000 / 3600 / 24);
		return nDays;
	};
	/*修改*/
	if(noticeId != "" && noticeId != null) {
		$("#noticeId").val(noticeId);

	}

	/*选择复制*/
	$("#btnCopy").click(function() {
		if(tenderProjectId != '') {
			parent.layer.open({
				type: 2,
				area: ['1000px', '600px'],
				title: "选择公告",
				content: copyHtml + '?tenderProjectId=' + tenderProjectId,
				resize: false,
				success: function(layero, index) {
					var iframeWin = layero.find('iframe')[0].contentWindow;
					var body = parent.layer.getChildFrame('body', index);
					//					console.log(tenderProjectId)
					//调用子窗口方法，传参
					iframeWin.passMessage(function(data) {
						//						console.log(bidIdArr);
						var index = $('.tenders tbody tr').length;
						//						先循环一次，移除数组中已经在列表存在的标段
						for(var i = 0; i < data.length; i++) {
							if($.inArray(data[i].interiorBidSectionCode, bidIdArr) != -1) {
								data.splice(i, 1)
							}
						}
						//						再次循环数组，添加标段
						for(var i = 0; i < data.length; i++) {
							var tr = $('<tr><td>' + (index + i + 1) + '</td>' +
								'<td class="bidCodes">' + data[i].interiorBidSectionCode + '</td>' +
								'<td>' + data[i].bidSectionName + '</td>' +
								'<td><button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + (i + 1) + '"><span class="glyphicon glyphicon-remove"></span>移除</button></td></tr>')
							$('.tenders tbody').append(tr);
							bidIdArr.push(data[i].interiorBidSectionCode);
							bidArr.push(data[i])
						}
					});
				}
			})
		} else {
			parent.layer.alert('请选择标段！')
		}

	})

	/*全屏*/
	$('.fullScreen').click(function() {
		//		console.log($.parserUrlForToken('fullScreen.html'))
		parent.layer.open({
			type: 2,
			title: '编辑公告信息',
			area: ['100%', '100%'],
			content: 'fullScreen.html',
			resize: false,
			btn: ['确定', '关闭'],
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

	//删除文件
	$('#fileList tbody').on('click', '.btnDel', function() {
		var index = $(this).closest('tr').index(); //当前删除的文件下标
		$(this).closest('tr').remove();
		projectAttachmentFiles.splice(index, 1);
		fileHtml(projectAttachmentFiles);
	})

	/*查看标段*/
	$('#bidList').on('click', '.btnView', function() {
		parent.layer.open({
			type: 2,
			area: ['1000px', '600px'],
			title: "标段详情",
			content: bidDetailHtml + "?id=" + bidDetail[0].bidSectionId,
			resize: false,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var body = parent.layer.getChildFrame('body', index);
			}
		})
	})

})

/*修改时信息回显*/
function reviseNotice(id) {
	$.ajax({
		type: "post",
		url: resiveUrl,
		data: {
			'bidSectionId': bidId
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			if(data.success) {
				if(!data.data) {

					$('#noticeName').val(bidSectionName + '-招标公告');
					return
				}
				var dataSource = data.data;
				if(dataSource.tenderProjectId) {
					tenderProjectId = dataSource.tenderProjectId
				}
				if(dataSource.noticeNature) {
					noticeNature = dataSource.noticeNature;
				}
				if(dataSource.id) {
					id = dataSource.id;
					noticeId = dataSource.noticeId;
				} else {
					$('#noticeName').val(dataSource.bidSectionName + '-招标公告')
				}
				//文件回显
				if(dataSource.projectAttachmentFiles) {
					var projectAttachmentFiles = dataSource.projectAttachmentFiles;
					//				fileHtml(dataSource.projectAttachmentFiles);
					if(!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + id + "/201",
							businessId: id,
							status: 1,
							businessTableName: 'T_NOTICE',
							attachmentSetCode: 'TENDER_NOTICE'
						});
					}
					fileUploads.fileHtml(projectAttachmentFiles);
				}

				//	          	$('#bidId').val(dataSource.bidSections[0].id);//标段Id
				//	          	bidId=dataSource.bidSections[0].id;
				//				$('#bidSectionCode').val(dataSource.bidSections[0].interiorBidSectionCode);//标段编号
				//				$('#bidName').val(dataSource.bidSections[0].bidSectionName);//标段名称
				//公告内容
				mediaEditor.setValue(dataSource);
				// if(dataSource.noticeContent) {
				// 	ue.ready(function() {
				// 		ue.setContent(dataSource.noticeContent);
				// 		ue.addInputRule(function(root) {
				// 			$.each(root.getNodesByTagName('a'), function(i, node) {
				// 				node.tagName = "p";
				// 			});
				// 		});
				// 	});
				// }
				if(noticeNature == 2 || (dataSource.noticeNature && dataSource.noticeNature == 2)) {
					/*********     区别正常公告与变更公告的页面显示     *********/
					$('.normalNoticeTime').html($('.oleNoticeTime').html());
					$('.oleNoticeTime').html('');
					//开始时间
					newChangeTimes();
					/*********     区别正常公告与变更公告的页面显示 end    *********/
					processTime(dataSource)

				} else {
					/*********     区别正常公告与变更公告的页面显示     *********/
					$('.oleNoticeTime').html('')
					/*********     区别正常公告与变更公告的页面显示 end    *********/
				}
				if(dataSource.noticeOldTime) {
					for(var k in dataSource.noticeOldTime) {
						$("#old" + k).html(dataSource.noticeOldTime[k]);
					}
				}
				for(var key in dataSource) {
					var newEle = $("[name='" + key + "']")
					if(newEle.prop('type') == 'radio') {
						newEle.val([dataSource[key]]);
					} else if(newEle.prop('type') == 'checkbox') {
						newEle.val(dataSource[key] ? dataSource[key].split(',') : []);
					} else {
						newEle.val(dataSource[key]);
					}
					if(key == 'noticeEndTime' || key == 'docGetEndTime' || key == 'bidDocReferEndTime' || key == 'bidOpenTime'){
						dateInHolidayTip(dataSource[key], ('#' + key));//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
					//	            	$("[name=" + key+"]").val(dataSource[key]);
				}
				$('#bidId').val(bidId);
				$('#bidId').val(dataSource.bidSections[0].id); //标段Id
				$('#bidSectionCode').val(dataSource.bidSections[0].interiorBidSectionCode); //标段编号
				$('#bidName').val(dataSource.bidSections[0].bidSectionName); //标段名称
			} else {
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

}

/*保存state：0:保存，1：提交审核
 * isBtn:判断是否需要弹出提示信息
 * callback：点击上传文件时调用
 */
function save(state, isBtn, callback, back) {
	var bidCodes = [];
	for(var i = 0; i < $('.bidCodes').length; i++) {
		bidCodes.push($('.bidCodes').eq(i).html())
	}
	//		var noticeMedia = '襄阳市人民政府门户网站;襄阳市公共资源交易网;湖北省公共资源交易电子服务平台';
	$('#noticeContent').val(ue.getContent());
	var param = "";
	if(state == 1) {
		if(!CAcf) {
			CAcf = new CA({
				target: "#addNotice",
				confirmCA: function(flag) {
					if(!flag) {
						return;
					}
					$("input:disabled").removeAttr("disabled");
					// 时间处理
					var vmForm = $("#addNotice");
					// ['noticeEndTime', 'docGetEndTime', 'signEndDate'].forEach(key => {
					// 	var value = vmForm.find('#' + key).val();
					// 	if (value && value.length == 16) {
					// 		vmForm.find('#' + key).val(value + ':59')
					// 	}
					// })
					param = $.param({
						'isSubmit': 1,
						publishState: 0
					}) + '&' + vmForm.serialize();
					saveForm(param, state, isBtn, callback, back)
				}
			});
		}
		CAcf.sign();

	} else {
		$("input:disabled").removeAttr("disabled");
		// 时间处理
		var vmForm = $("#addNotice");
		// ['noticeEndTime', 'docGetEndTime', 'signEndDate'].forEach(key => {
		// 	var value = vmForm.find('#' + key).val();
		// 	if (value && value.length == 16) {
		// 		vmForm.find('#' + key).val(value + ':59')
		// 	}
		// })
		param = $.param({
			publishState: 0
		}) + '&' + vmForm.serialize();
		saveForm(param, state, isBtn, callback, back)
	}

}

function saveForm(param, state, isBtn, callback, back) {
	// if (param.noticeEndTime) {
	// 	if (param.noticeEndTime.length === 16) {
	// 		param.noticeEndTime += ':59';
	// 	}
	// }
	// if (param.docGetEndTime) {
	// 	if (param.docGetEndTime.length === 16) {
	// 		param.docGetEndTime += ':59';
	// 	}
	// }
	// if (param.signEndDate) {
	// 	if (param.signEndDate.length === 16) {
	// 		param.signEndDate += ':59';
	// 	}
	// }
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: param,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				$(".mediaDisabled").attr("disabled", "disabled");
				if(callback) {
					callback();
				}
				if(back) {
					back(data.data);
				}
				id = data.data;
				if(!noticeId) {
					noticeId = id;
					$("#noticeId").val(noticeId)
				}
				noticeId = data.data;
				if(state == '0') {
					/*if(callback){
	            			callback(data.data)
	            		}*/
					if(isBtn) {
						parent.layer.alert("保存成功", {
							icon: 1,
							title: '提示'
						});

					}
					// if(noticeNature == 2){
					// 	processTime(serialize($('#addNotice').serializeArray()))
					// }
					// $("input:disabled").removeAttr("disabled");

					//	            		reviseNotice(id);
				} else {
					parent.layer.alert("提交成功", {
						icon: 1,
						title: '提示'
					});
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				}
				//                  parent.$('#noticeList').bootstrapTable('refresh');
			} else {
				$("input:disabled").removeAttr("disabled");
				parent.layer.alert(data.message);
				// if(noticeNature == 2){
				// 	processTime(serialize($('#addNotice').serializeArray()))
				// }
				//             		reviseNotice(id);
			}
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}

	});
}

function fileUpload(bId, nId) {
	var name = ''; // 文件名
	var type = ''; //文件类型

	var enterpriseId = entryInfo().enterpriseId; //企业ID
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
		browseFileId: "fileLoad", //文件选择DIV的ID
		autoUploading: true, //选择文件后是否自动上传
		autoRemoveCompleted: true, //文件上传后是否移除
		postVarsPerFile: {
			//自定义文件保存路径前缀
			basePath: "/" + enterpriseId + "/" + bId + "/" + nId + "/201",
			Token: $.getToken()
		},
		onComplete: function(file) { /** 单个文件上传完毕的响应事件 */
			var obj = {};
			obj.attachmentFileName = file.name; //文件名称
			obj.url = JSON.parse(file.msg).data.filePath; //后台返回的文件路径
			if(file.size < 1024) {
				obj.attachmentSize = Math.ceil(size) + "b";
			} else if(1024 <= file.size && file.size < 1024 * 1024) {
				obj.attachmentSize = Math.ceil(file.size / 1024) + "kb";
			} else {
				obj.attachmentSize = Math.ceil(file.size / 1024) + "m";
			}

			projectAttachmentFiles.push(obj);
			//	    	console.log(projectAttachmentFiles);
			fileHtml(projectAttachmentFiles);
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
}

function passMessage(data, callback) {
	var newData = [];
	newData.push(data);
	bidDetail = newData;
	if(data.getForm == 'KZT') {
		bidId = data.id;
	} else {
		bidId = data.bidSectionId; //标段id
	}

	//	noticeNature = data.noticeNature;

	//	if(data.id){//编辑
	//		reviseNotice(data.id);
	//	}

	//将标段相关信息保存到页面的隐藏域，提交的时候需要提交到后台
	//	for(var key in data){
	//  	$("#" + key).val(data[key]);
	//	}
	//	bidId=data.bidSectionId;
	//	tenderProjectId = data.tenderProjectId;
	$('#bidId').val(bidId); //标段Id
	$('#bidSectionCode').val(data.interiorBidSectionCode); //标段编号
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);

	});
	/*保存*/
	$('#btnSave').click(function() {
		save(0, true, callback);
		callback();
	})
	/*提交*/

	$('#btnSubmit').click(function() {
		var noticeSendTime = Date.parse(new Date($('#noticeSendTime').val().replace(/\-/g, "/"))); //公告发布时间
		var noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g, "/"))); //公告截止时间
		var signStartDate = Date.parse(new Date($('#signStartDate').val().replace(/\-/g, "/"))); //公告发布时间
		var signEndDate = Date.parse(new Date($('#signEndDate').val().replace(/\-/g, "/"))); //公告截止时间
		var docGetStartTime = Date.parse(new Date($('#docGetStartTime').val().replace(/\-/g, "/"))); //文件获取开始时间
		var docGetEndTime = Date.parse(new Date($('#docGetEndTime').val().replace(/\-/g, "/"))); //文件获取截止时间
		var clarifyTime = Date.parse(new Date($('#clarifyTime').val().replace(/\-/g, "/"))); //提出澄清截止时间
		var answersEndDate = Date.parse(new Date($('#answersEndDate').val().replace(/\-/g, "/"))); //答复截止时间
		var bidDocReferEndTime = Date.parse(new Date($('#bidDocReferEndTime').val().replace(/\-/g, "/"))); //申请文件递交截止时间
		var bidOpenTime = Date.parse(new Date($('#bidOpenTime').val().replace(/\-/g, "/"))); //开标时间
		if(!isRoom) {
			parent.layer.alert('请预约资格预审会议室！', function(ind) {
				parent.layer.close(ind);
				$('#collapseFour').collapse('show');
			});
			return
		}
		if($('[name=noticeMedia]:checked').length == 0) {
			parent.layer.alert('请选择公告发布媒体！', function(ind) {
				parent.layer.close(ind);
				$('#collapseSix').collapse('show');
			});
			return
		}
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if(noticeEndTime <= noticeSendTime) {
				parent.layer.alert('公告截止时间应在公告发布时间之后！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			if(docGetStartTime < noticeSendTime || docGetStartTime > noticeEndTime) {
				parent.layer.alert('资格预审文件获取时间应在公告发布时间之后，公告截止时间之前！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			if(docGetEndTime < docGetStartTime) {
				parent.layer.alert('资格预审文件获取截止时间应在资格预审文件获取时间之后！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
			if(clarifyTime < docGetEndTime) {
				parent.layer.alert('提出澄清截止时间应在文件获取截止时间之后！', function(ind) {
					parent.layer.close(ind);
					$('#collapseFive').collapse('show');
				});
				return
			}
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
			if(isSign == 1) {
				if(signStartDate < noticeSendTime || signStartDate > noticeEndTime) {
					parent.layer.alert('报名开始时间应在公告发布时间之后，公告截止时间之前！', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
				if(signEndDate < signStartDate) {
					parent.layer.alert('报名截止时间应在报名开始时间之后！', function(ind) {
						parent.layer.close(ind);
						$('#collapseFive').collapse('show');
					});
					return
				}
			};
			//公告截止时间与开始时间相差的天数
			var differTime = noticeEndTime - noticeSendTime;
			var time1 = docGetEndTime - docGetStartTime;
			var time2 = bidOpenTime - noticeSendTime;
			var time3 = bidDocReferEndTime - docGetEndTime;
			var time4 = bidDocReferEndTime - clarifyTime;
			var time5 = answersEndDate - clarifyTime;
			var times = 5 * 24 * 60 * 60 * 1000;
			var times2 = 2 * 24 * 60 * 60 * 1000;
			var times3 = 3 * 24 * 60 * 60 * 1000;
			var times20 = 20 * 24 * 60 * 60 * 1000;
			if(verifyTime) {
				if(isLaw == 1) {
					if(differTime < times) {
						parent.layer.alert('依法招标的项目，公告截止时间与开始时间相差的天数要大于等于5天', function(ind) {
							parent.layer.close(ind);
							$('#collapseFive').collapse('show');
						});
						return
					}
					if(time1 < times) {
						parent.layer.alert('依法招标的项目，资格预审文件获取时间不少于5天', function(ind) {
							parent.layer.close(ind);
							$('#collapseFive').collapse('show');
						});
						return
					}
					if(time3 < times) {
						parent.layer.alert('依法招标的项目，资格预审申请文件递交截止时间与预审文件获取截止时间相差不得少于5天', function(ind) {
							parent.layer.close(ind);
							$('#collapseFive').collapse('show');
						});
						return
					}
					if(time4 < times2) {
						parent.layer.alert('依法招标的项目，资格预审申请文件递交截止时间与提出澄清截止时间相差不得少于2天', function(ind) {
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
				}
			}
			if(!mediaEditor.isValidate()) {
				$('#collapseSeven').collapse('show');
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
					})
				}

			}
		}
	})
	//选择模板
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
				save(0, false, callback);
				modelHtml({
					'tempBidFileid': modelId, //模板Id
					'bidSectionId': bidId
				});
			})
		} else {
			save(0, false, callback)
			modelHtml({
				'tempBidFileid': modelId, //模板Id
				'bidSectionId': bidId
			});
		}
	})
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(event) {
		event.stopPropagation();
		if(!(id != "" && id != null)) {
			save(0, false, callback, function(businessId) {
				id = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + id + "/201",
						businessId: id,
						status: 1,
						businessTableName: 'T_NOTICE',
						attachmentSetCode: 'TENDER_NOTICE'

					});
				}
				$('#fileLoad').trigger('click');
			});
		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + id + "/201",
					businessId: id,
					status: 1,
					businessTableName: 'T_NOTICE',
					attachmentSetCode: 'TENDER_NOTICE'

				});
			}
			$('#fileLoad').trigger('click');
		}

	});

}
//文件上传表格
function fileHtml(data) {
	$('#fileList tbody').html('');
	var html = '';
	for(var i = 0; i < data.length; i++) {
		if(data[i].tenderMode == '1') {
			data[i].tenderMode = '公开招标'
		} else if(data[i].tenderMode == '1') {
			data[i].tenderMode = '邀请招标'
		}
		html = $('<tr>' +
			'<td style="width:50px;text-align:center">' + (i + 1) + '</td>' +
			'<input type="hidden" name="projectAttachmentFiles[' + i + '].attachmentFileName" value="' + data[i].attachmentFileName + '"/>' //附件文件名
			+
			'<input type="hidden" name="projectAttachmentFiles[' + i + '].url" value="' + data[i].url + '"/>' //附件URL地址
			+
			'<td>' + data[i].attachmentFileName + '</td>' +
			'<td style="width:200px;text-align:center">' + data[i].createDate + '</td>' //附件上传时间
			+
			'<td style="width:200px;text-align:center">' + data[i].createEmployeeName + '</td>' //附件上传人
			+
			'<td style="width:150px;text-align:center">' + data[i].attachmentSize + '</td>' //文件大小
			+
			'<td style="width: 100px;"><button type="button" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>删除</button></td>' +
			'</tr>');
		$("#fileList tbody").append(html);
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
				isLaw = arr.isLaw;
				msgInfo = JSON.parse(JSON.stringify(data.data));
				getRoomList(bidId, '1');
				bidSectionName = arr.bidSectionName;
				tenderProjectId = arr.tenderProjectId;
				$('#tenderProjectId').val(arr.tenderProjectId);
				$('#bidSectionCode').val(arr.interiorBidSectionCode); //标段编号
				$('#bidName').val(arr.bidSectionName); //标段名称
				for(var key in arr) {
					if(key == 'signUp') {
						isSign = arr.signUp;
						//报名时显示报名开始结束时间
						if(arr.signUp == 0) { //不报名时不显示
							$('.signUp').css({
								'display': 'none'
							});
							$('.signUp .times').removeAttr('datatype');
						} else if(arr.signUp == 1) {
							$('.signUp').css({
								'display': 'table-row'
							});
							$('.signUp .times').attr('datatype', '*');
						}
					}

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
						if(key == "bidType") { //1为明标，2为暗标
							if(arr.bidType == '1') {
								arr.bidType = '是'
							} else if(arr.bidType == '2') {
								arr.bidType = '否'
							}
						} else if(key == "syndicatedFlag") { //1为是，2为否
							if(arr.syndicatedFlag == '1') {
								arr.syndicatedFlag = '允许'
							} else if(arr.syndicatedFlag == '0') {
								arr.syndicatedFlag = '不允许'
							}
						} else if(key == "signUpType") { //报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1') {
								arr.signUpType = '线上获取'
							} else if(arr.signUpType == '2') {
								arr.signUpType = '线下获取'
							}
						} else if(key == "pretrialOpenType") { //1为线上开标，2为线下开标
							if(arr.pretrialOpenType == '1') {
								arr.pretrialOpenType = '线上开启'
							} else if(arr.pretrialOpenType == '2') {
								arr.pretrialOpenType = '线下开启'
							}
						} else if(key == "bidCheckType") { //1线，2为线下
							if(arr.bidCheckType == '1') {
								arr.bidCheckType = '线上评审'
							} else if(arr.bidCheckType == '2') {
								arr.bidCheckType = '线下评审'
							}
						} else if(key == "examType") { //1为资格预审，2为资格后审
							if(arr.examType == '1') {
								arr.examType = '资格预审'
							} else if(arr.examType == '2') {
								arr.examType = '资格后审'
							}
						} else if(key == "tenderMode") { //1为资格预审，2为资格后审
							if(arr.tenderMode == '1') {
								arr.tenderMode = '公开招标'
							} else if(arr.tenderMode == '2') {
								arr.tenderMode = '邀请招标'
							}
						} else if(key == "priceUnit") { //1为资格预审，2为资格后审
							if(arr.priceUnit == '1') {
								arr.priceUnit = '万元'
							} else if(arr.priceUnit == '0') {
								arr.priceUnit = '元'
							}
						} else if(key == 'projectCosts') {
							if(arr.projectCosts.length == 0 || !arr.projectCosts) {
								$('.price').html('无');
							} else {
								if(arr.projectCosts[0].costName == '招标文件费') {
									$('.price').html(arr.projectCosts[0].payMoney);
								}
							}

						}
						$('#' + key).html(arr[key]);
						optionValueView("#" + key, arr[key]); //下拉框信息反显
						//						console.log(id)
						if(!id) {
							$('#noticeName').val(arr.bidSectionName + '-资格预审公告')
						}

					}

				}
			}
		}
	});
};

Date.prototype.format = function() {
	var s = '';
	s += this.getFullYear() + '-'; // 获取年份。
	if((this.getMonth() + 1) >= 10) { // 获取月份。
		s += (this.getMonth() + 1) + "-";
	} else {
		s += "0" + (this.getMonth() + 1) + "-";
	}
	if(this.getDate() >= 10) { // 获取日。
		s += this.getDate();
	} else {
		s += "0" + this.getDate();
	}
	return(s); // 返回日期。
};

function getAll(begin, end) {
	var ab = begin.split("-");
	var ae = end.split("-");
	var db = new Date();
	db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
	var de = new Date();
	de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
	var unixDb = db.getTime();
	var unixDe = de.getTime();
	var str = "";
	for(var k = unixDb + 24 * 60 * 60 * 1000; k < unixDe;) {
		str += (new Date(parseInt(k))).format() + ",";
		k = k + 24 * 60 * 60 * 1000;
	}
	return str;
}
//				getAll('2017-06-24', '2017-07-02')
/*********************      变更公告处理时间        **************************/
function processTime(timeData) {
	var nowDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));
	var noticeSendTime = Date.parse(new Date(timeData.noticeSendTime.replace(/\-/g, "/"))); //公告发布时间
	var noticeEndTime = Date.parse(new Date(timeData.noticeEndTime.replace(/\-/g, "/"))); //公告截止时间
	var signStartDate = timeData.signStartDate ? Date.parse(new Date(timeData.signStartDate.replace(/\-/g, "/"))) : 0;//报名开始时间
	var signEndDate = timeData.signEndDate ? Date.parse(new Date(timeData.signEndDate.replace(/\-/g, "/"))) : 0;//报名截止时间
	var docGetStartTime = Date.parse(new Date(timeData.docGetStartTime.replace(/\-/g, "/"))); //文件获取开始时间
	var docGetEndTime = Date.parse(new Date(timeData.docGetEndTime.replace(/\-/g, "/"))); //文件获取截止时间
	var clarifyTime = Date.parse(new Date(timeData.clarifyTime.replace(/\-/g, "/"))); //提出澄清截止时间
	var answersEndDate = Date.parse(new Date(timeData.answersEndDate.replace(/\-/g, "/"))); //答复截止时间
	var bidDocReferEndTime = Date.parse(new Date(timeData.bidDocReferEndTime.replace(/\-/g, "/"))); //申请文件递交截止时间
	var bidOpenTime = Date.parse(new Date(timeData.bidOpenTime.replace(/\-/g, "/"))); //开标时间
	var dateData = {
		noticeSendTime: noticeSendTime,
		noticeEndTime: noticeEndTime,
		signStartDate: signStartDate,
		signEndDate: signEndDate,
		docGetStartTime: docGetStartTime,
		docGetEndTime: docGetEndTime,
		clarifyTime: clarifyTime,
		answersEndDate: answersEndDate,
		bidDocReferEndTime: bidDocReferEndTime,
		bidOpenTime: bidOpenTime
	};
	for(var k in dateData) {
		if(nowDate > dateData[k]) {
			$("#" + k).attr("disabled", "disabled");
		}
	}
}
/*********************      变更公告处理时间  end        **************************/
function serialize(arr) {
	var obj = {};
	$.each(arr, function() {
		if(obj[this.name]) {
			if(!obj[this.name].push) {
				obj[this.name] = [obj[this.name]];
			}
			obj[this.name].push(this.value || "");
		} else {
			obj[this.name] = this.value || "";
		}
	});
	return obj
}
/* 时间选择 */
function newChangeTimes(){
	$('.times').focus(function() {
		var that = this;
		if($('#noticeSendTime').val() == ''){
			top.layer.alert('请先选择资格预审公告发布时间！');
			return
		};
		var timeStart = $('#noticeSendTime').val().replace(/\-/g, "/"), minTime = '';
		if(isLaw == 1){
			if($(this).prop('id') == 'noticeEndTime' || $(this).prop('id') == 'docGetEndTime'){
				minTime = automatic(timeStart, 5, '1');
			}else if($(this).prop('id') == 'bidDocReferEndTime' || $(this).prop('id') == 'bidOpenTime'){
				minTime = automatic(timeStart, 10, '1');
			}else{
				minTime = nowDate;
			}
		}else{
			minTime = nowDate;
		}

		var eleInputId = $(that).prop('id');
		var minDTime,maxTime;
		var dateFmt = 'yyyy-MM-dd HH:mm';
		// 资格预审公告发布截止时间/资格预审文件获取截止时间/报名截止时间
		if(eleInputId == 'noticeEndTime' || eleInputId == 'docGetEndTime' || eleInputId == 'signEndDate' ){
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
					if(eleId == 'noticeEndTime' || eleId == 'docGetEndTime' || eleId == 'bidDocReferEndTime' || eleId == 'bidOpenTime'){
						dateInHolidayTip(selectTime, that);
					}
				}
			}
		})
	});
}