/**
 *  zhouyan 
 *  2019-4-15
 *  编辑、添加公公示
 *  方法列表及功能描述
 */

var saveUrl = config.tenderHost + "/BidSuccessFulPublicityController/saveAndUpdate.do"; //保存地址
//var subUrl = config.tenderHost + "/BidSuccessFulPublicityController/insert.do";	//提交地址
var resiveUrl = config.tenderHost + "/BidSuccessFulPublicityController/findAlreadys.do"; //新增时候选人反显地址
var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/getSuccessFulByBidId.do"; //修改时反显地址
var backUrl = config.tenderHost + "/NoticeController/revokeWorkflowItem.do"; //撤回   
var modelUrl = config.tenderHost + '/BidSuccessFulPublicityController/toTemplat.do'; //模板地址

var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do'; //获取标段相关信息
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do'; //根据标段id获取标段时间信息
var copyUrl = config.tenderHost + "/BidSuccessFulPublicityController/saveCopy.do"; //变更

var tenderHtml = 'Bidding/BidJudge/CandidatesPublicity/model/tenderList.html'; //选择候选人
var bidId = ''; //标段Id
var examType = 2; //资格审查方式 1为资格预审，2为资格后审
var bidCheckType; //评标方式 1.线上评标  2.线下评标
var isPublicProject = ''; //是否公共资源
var publicId = ''; //公示id,保存后才有
var candi = []; //候选人数据
var fileUploads = null;
var ue;
var isLaw = ''; //是否依法
var CAcf = null; //实例化CA
var special = ''; //以此判断是不是控制台过来的变更

var bidderPriceType; //投标报价方式 1.金额  9费率
var rateUnit; //费率单位
var rateRetainBit; //费率保留位数(0~6)
var tenderProjectType = '';//招标项目类型
var noticePeriod = '3';//公示期
var RenameData;//投标人更名信息
$(function() {
	//初始化编辑器
	// ue = UE.getEditor('container');
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		contentKey: 'publicityContent'
	});
	//	examType = $.getUrlParam('examType');//公示列表中带过来的原始公示ID
	bidId = $.getUrlParam('id'); //公示列表中带过来的标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	if($.getUrlParam("special") && $.getUrlParam("special") != "undefined") {
		special = $.getUrlParam('special'); //公示列表中带过来的ID
		//		 reviseDetail(publicId);//修改时信息反显
	}
	getBidInfo(bidId);
	var isContinu = true;
	if(special == 'CHANGE') {
		$.ajax({
			type: "post",
			url: copyUrl,
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
					reviseDetail(bidId, '2');
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
		reviseDetail(bidId, '2');
	}
	if(!isContinu) {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
		return
	}
	
	getTimeInfo(bidId);
	//	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
	//		 publicId = $.getUrlParam('id');//公示列表中带过来的ID
	////		 reviseDetail(publicId);//修改时信息反显
	//	}else{
	//		if(bidId){
	//			var rst = findProjectDetail(bidId);
	//			initMedia({
	//				proType:rst
	//			});
	//		}
	//		reviseNotice();//新增时信息反显
	//	}

	//添加候选人
	$('.chooseTender').click(function() {
		chooseTender(bidId, candi)
	});
	//删除候选人
	$('#candidates').on('click', '.btnDel', function() {
		var winId = $(this).closest('tr').attr('data-winner-id');
		var index;
		for(var i = 0; i < candi.length; i++) {
			if(winId == candi[i].winCandidateId) {
				index = i;
			}
		}
		parent.layer.confirm('确定删除该中标候选人？', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			if(index != undefined) {
				candi.splice(index, 1);
			}
			candidateHtml(candi);
			parent.layer.close(ind)
		})
	})
	var date = new Date();
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: publicId,
		status: 1,
		type: "hxrgs",
	});

	//模板下拉框
	modelOption({
		tempType: 'letterBulletin'
	});

	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
	$('#publicityStartTime').click(function() {
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
						$('#publicityEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
						dateInHolidayTip($('#publicityEndTime').val(), '#publicityEndTime');
					}
				}
			})
		}
	});
	//修改公示期
	$('#noticePeriod').change(function(){
		var noticePeriod = Number($(this).val());
		if(noticePeriod == 0 || noticePeriod == ''){
			top.layer.alert('公示期必须大于0');
			$(this).val('');
			return
		}
		if($('#publicityStartTime').val() != ''){
			var selectTime = $('#publicityStartTime').val().replace(/\-/g, "/"); //选中的时间
			$('#publicityEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
			dateInHolidayTip($('#publicityEndTime').val(), '#publicityEndTime');
		}
	})

	/*两个日期之间相差的天数*/
	function daysBetween(startTime, endTime) {
		//Date.parse() 解析一个日期时间字符串，并返回1970/1/1 午夜距离该日期时间的毫秒数
		var time1 = Date.parse(new Date(startTime));
		var time2 = Date.parse(new Date(endTime));
		var nDays = parseInt((time2 - time1) / 1000 / 3600 / 24);
		return nDays;
	};

	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	/*全屏*/
	$('.fullScreen').click(function() {
		parent.layer.open({
			type: 2,
			title: '编辑公示信息',
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

	function chooseTender(did, data) {
		parent.layer.open({
			type: 2,
			title: '选择候选人',
			area: ['1000px', '650px'],
			content: tenderHtml + '?bidId=' + did + '&bidCheckType=' + bidCheckType,
			resize: false,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				//			console.log(iframeWin)
				//调用子窗口方法，传参
				iframeWin.tenderFromFathar(tenderGet, data);
			}
		});
	};

	function tenderGet(data) {
		candi = [];
		for(var i = 0; i < data.length; i++) {
			//			if(!data[i].bidPrice){
			//				data[i].bidPrice = data[i].otherBidPrice;
			//			}
			candi.push(data[i]);
		}
		candidateHtml(candi);
	}

	//提交
	function submit(dataId) {
		$('#publicityContent').val(ue.getContent());
		if(dataId != '') {
			var param = $.param({
				'publicityType': 1,
				'id': dataId
			}) + '&' + $('#addNotice').serialize();
		} else {
			var param = $.param({
				'publicityType': 1
			}) + '&' + $('#addNotice').serialize();
		}
		$.ajax({
			type: "post",
			url: subUrl,
			dataType: "json", //预期服务器返回的数据类型
			data: param,
			success: function(data) {
				if(data.success) {
					publicId = data.data;
					$('#dataId').val(data.data);
					parent.layer.alert("提交成功", {
						icon: 1,
						title: '提示'
					}, function() {
						parent.layer.closeAll();
					});
					/*var index=parent.layer.getFrameIndex(window.name);
                    	parent.layer.close(index);*/
					parent.$('#tableList').bootstrapTable('refresh');
				};
			},
			error: function() {
				parent.layer.alert("提交失败！");
			}

		});

	}
	//公示发布方式
	$('[name=isManual]').change(function() {
		publishType($('[name=isManual]:checked').val())

	})
});
/*
 * 公示发布方式
 * val  是否手动发布；0代表手动 1代表自动
 * */
function publishType(val) {
	if(val == 1) {
		$('[name=noticePeriod]').val(noticePeriod);
		$('[name=publicityStartTime]').attr('datatype', '*');
		$('[name=publicityEndTime]').attr('datatype', '*');
		$('.publish_own').show();
	} else {
		$('[name=publicityStartTime]').val('');
		$('[name=publicityEndTime]').val('');
		$('[name=noticePeriod]').attr('datatype', '*');
		$('[name=publicityStartTime]').removeAttr('datatype');
		$('[name=publicityEndTime]').removeAttr('datatype');
		$('.publish_own').hide();
	}
}

/*新增时信息回显*/
function reviseNotice() {
	$.ajax({
		type: "post",
		url: resiveUrl,
		data: {
			'bidSectionId': bidId,
			'examType': 2
		},
		dataType: 'json',
		success: function(data) {
			var dataSource = data.data;
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				if(data.data.length > 0) {
					candidateHtml(data.data);
					candi = data.data;
				}

			}

		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

};
/*修改时信息回显*/
function reviseDetail(id, type) {
	$.ajax({
		type: "post",
		url: detailUrl,
		data: {
			'bidSectionId': id,
			'examType': 2
		},
		dataType: 'json',
		success: function(data) {

			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				if(data.data) {
					var dataSource = data.data;
					if(dataSource.id) {
						publicId = dataSource.id;
						var rst = findProjectDetail(dataSource.bidSectionId);
						initMedia({
							proType: rst,
							isDisabled: dataSource.publicityType == 2 ? true : false
						});
						noticePeriod = dataSource.noticePeriod?dataSource.noticePeriod:'3';
						for(var key in dataSource) {
							if(key == 'bidForm') {
								$(":radio[name='bidForm'][value='" + dataSource[key] + "']").prop("checked", "checked");
							} else if(key == 'isPublicBidPrice') {
								$(":radio[name='isPublicBidPrice'][value='" + dataSource[key] + "']").prop("checked", "checked");
							} else if(key == 'noticeMedia') {
								$('[name=noticeMedia]').val(dataSource[key] ? dataSource[key].split(',') : []);
							} else {
								var newEle = $("[name='" + key + "']")
								if(newEle.prop('type') == 'radio') {
									newEle.val([dataSource[key]]);
									if(key == 'isManual') {
										publishType(dataSource.isManual)
									}
								} else {
									$("[name=" + key + "]").val(dataSource[key]);
								}
							}
						};
						//公示内容
						mediaEditor.setValue(dataSource);
						// if(dataSource.publicityContent) {
						// 	ue.ready(function() {
						// 		ue.setContent(dataSource.publicityContent);
						// 	});
						// }
						//文件
						if(!fileUploads) {
							fileUploads = new StreamUpload("#fileContent", {
								basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/222",
								businessId: publicId,
								status: 1,
								businessTableName: 'T_BID_SUCCESSFUL_PUBLICITY',
								attachmentSetCode: 'PUBLICITY_DOC'
							});
						}
						if(dataSource.projectAttachmentFiles) {
							fileUploads.fileHtml(dataSource.projectAttachmentFiles);
						}
						if(dataSource.bidWinCandidates && dataSource.bidWinCandidates.length > 0) {
							candidateHtml(dataSource.bidWinCandidates);
							candi = dataSource.bidWinCandidates;
						}
						if(dataSource.publicityEndTime){
							dateInHolidayTip(dataSource.publicityEndTime, '#publicityEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
						}
					}
				} else {
					if(bidId) {
						var rst = findProjectDetail(bidId);
						initMedia({
							proType: rst
						});
					}
					reviseNotice(); //新增时信息反显
				}
			}

		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

}

//获取父页面传过来的值
function passMessage(data, callback) {
	bidId = data.bidSectionId; //标段id
	isLaw = data.isLaw;
	if(data.getForm == 'KZT') {
		bidId = data.id;
	} else {
		bidId = data.bidSectionId; //标段id
	}

	//	reviseDetail(bidId,'2');
	$("#btnModel").click(function() {
		var modelId = $('#noticeTemplate option:selected').attr('data-model-id');
		var hashtml = ue.hasContents();
		if(hashtml) {
			parent.layer.confirm('确定替换模板？', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index);
				$('#publicityContent').val(ue.getContent());
				$(".mediaDisabled").removeAttr("disabled");
				var param = $.param({
					'publicityState': 0
				}) + '&' + $('#addNotice').serialize();
				save(param, 0, false, callback);
				//生成模版
				ue.setContent('');
				$.ajax({
					type: "post",
					url: modelUrl,
					async: false,
					data: {
						'tempBidFileid': modelId, //模板Id
						'bidSectionId': bidId,
						'examType': 2
					},
					success: function(data) {
						if(data.success) {
							ue.setContent(data.data);
						} else {
							parent.layer.alert(data.message);
						}
					}
				});

			});
		} else {
			$('#publicityContent').val(ue.getContent());
			$(".mediaDisabled").removeAttr("disabled");
			var param = $.param({
				'publicityState': 0
			}) + '&' + $('#addNotice').serialize();
			save(param, 0);
			ue.setContent('');
			$.ajax({
				type: "post",
				url: modelUrl,
				async: false,
				data: {
					'tempBidFileid': modelId, //模板Id
					'bidSectionId': bidId,
					'examType': 2
				},
				success: function(data) {
					if(data.success) {
						ue.setContent(data.data);
					} else {
						parent.layer.alert(data.message);
					}
				}
			});
		}
	})
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function() {
		if(publicId == "") {
			$('#publicityContent').val(ue.getContent());
			$(".mediaDisabled").removeAttr("disabled");
			var param = $.param({
				'publicityState': 0
			}) + '&' + $('#addNotice').serialize();
			save(param, 0, false, callback, function(businessId) {
				publicId = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/222",
						businessId: publicId,
						status: 1,
						businessTableName: 'T_BID_SUCCESSFUL_PUBLICITY',
						attachmentSetCode: 'PUBLICITY_DOC'
					});
				}
				$('#fileLoad').trigger('click');
			});

		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + publicId + "/222",
					businessId: publicId,
					status: 1,
					businessTableName: 'T_BID_SUCCESSFUL_PUBLICITY',
					attachmentSetCode: 'PUBLICITY_DOC'
				});
			}
			$('#fileLoad').trigger('click');
		}
	});
	/*保存*/
	$('#btnSave').click(function() {
		$('#publicityContent').val(ue.getContent());
		$(".mediaDisabled").removeAttr("disabled");
		var param = $.param({
			'publicityState': 0
		}) + '&' + $('#addNotice').serialize();
		save(param, 0, true, callback);
		//		save(0,true);
	})
	/*提交*/
	$('#btnSubmit').click(function() {
		var noticeSendTime = Date.parse(new Date($('#publicityStartTime').val().replace(/\-/g, "/"))); //公示发布时间
		var noticeEndTime = Date.parse(new Date($('#publicityEndTime').val().replace(/\-/g, "/"))); //公示截止时间

		var times = 3 * 24 * 60 * 60 * 1000;

		if($('[name=noticeMedia]:checked').length == 0) {
			parent.layer.alert('请选择公示发布媒体！', function(ind) {
				parent.layer.close(ind);
				$('#collapseTwo').collapse('show');
			});
			return
		}
		if(Number($('#noticePeriod').val()) <= 0) {
			parent.layer.alert('温馨提示：请正确输入公示期！', {
				icon: 7,
				title: '提示'
			}, function(ind) {
				parent.layer.close(ind);
				$('#collapseTwo').collapse('show');
			});
			return;
		}
		if(checkForm($("#addNotice"))) { //必填验证，在公共文件util中
			if(verifyTime) {
				if(isLaw == 1) {
					if((noticeEndTime - noticeSendTime) < times) {
						parent.layer.alert('公示结束时间应在公示开始时间3天之后！');
						return
					}
				}
			}
			if(!(mediaEditor.isValidate())) {
				$('#collapseFour').collapse('show');
			} else if(candi.length <= 0) {
				parent.layer.alert('请选择中标候选人！', {
					icon: 7,
					title: '提示'
				}, function(ind) {
					parent.layer.close(ind);
					$('#collapseThree').collapse('show');
				})
			} else {
				if($("#addChecker").length <= 0) {
					parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
						title: '提交审核',
						btn: [' 是 ', ' 否 '],
						yes: function(layero, index) {
							saveCA(1, callback)
						},
						btn2:function(index, layero){
							parent.layer.close(index);
						}
					})
				} else {
					parent.layer.alert('确认提交审核？', function(index) {
						saveCA(1, callback)
						parent.layer.close(index);
					})
				}

			}
		}
	})
	//	if(data.id){//编辑
	//		var rst = findProjectDetail(bidId);
	//		//媒体
	//		initMedia({
	//			proType:rst,
	//			isDisabled: data.publicityType == 2 ? true : false
	//		});
	//		reviseDetail(data.id);
	//	}
	//	isPublicProject = data.isPublicProject;
	//	for(var key in data){
	//		$('#'+key).val(data[key])
	//	}
	//	if(data.bidSuccessfulPublicityId){
	//		publicId = data.bidSuccessfulPublicityId;//公示id,保存后才有
	//		$('#dataId').val(publicId); 
	//	}

};

function saveCA(state, callback) {
	if(!CAcf) {
		CAcf = new CA({
			target: "#addNotice",
			confirmCA: function(flag) {
				if(!flag) {
					return;
				}
				$('#publicityContent').val(ue.getContent());
				$(".mediaDisabled").removeAttr("disabled");
				var param = $.param({
					'publicityState': state
				}) + '&' + $('#addNotice').serialize();
				save(param, state, false, callback);
			}
		});
	}
	CAcf.sign();
}
//保存
function save(arr, isSave, isTips, callback, back) {
	var canSave = true;
	var msg = "";
	$.each($('#candidates tbody tr'), function(i, iterm){
		if( $.trim($(this).find('.projectManagerMane').val()).length > 20){
			msg = '投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的项目负责人的长度限制20字以内';
			canSave = false;
			return false;
		}
		if($.trim($(this).find('.cfa').val()).length > 100){
			msg = '投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的证书名称及编号的长度限制100字以内';
			canSave = false;
			return false;
		}
		if($.trim($(this).find('.projectTime').val()).length > 20){
			msg = '投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的工期的长度限制20字以内';
			canSave = false;
			return false;
		}
		if(isSave == 1 && tenderProjectType == 'A'){
			if($.trim($(this).find('.projectManagerMane').val()).length <= 0){
				msg = '请输入投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的项目负责人';
				canSave = false;
				return false;
			}
			if($.trim($(this).find('.cfa').val()).length <= 0){
				msg = '请输入投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的证书名称及编号';
				canSave = false;
				return false;
			}
			if($.trim($(this).find('.projectTime').val()).length <= 0){
				msg = '请输入投标人【'+$(this).find('.winCandidateName').attr('data-name')+'】的工期';
				canSave = false;
				return false;
			}
		}
	});
	if(!canSave){
		top.layer.alert(msg);
		return
	};
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		dataType: "json", //预期服务器返回的数据类型
		async: false,
		data: arr,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				$(".mediaDisabled").attr("disabled", "disabled");
				publicId = data.data;
				$('#dataId').val(data.data);
				if(isSave == 1) {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					parent.layer.alert("提交成功！", {
						icon: 6,
						title: '提示'
					});

				}
				if(isTips) {
					parent.layer.alert("保存成功！", {
						icon: 6,
						title: '提示'
					});
				}
				if(callback) {
					callback()
				}
				if(back) {
					back(data.data)
				}
				//                  parent.$('#tableList').bootstrapTable(('refresh'));
			} else {
				parent.layer.alert(data.message, {
					icon: 5,
					title: '提示'
				});
			}
		},
		error: function() {
		 $('#btnSubmit').attr('disabled', false);
			parent.layer.alert("保存失败！");
		}
	});
}
//候选人
function candidateHtml(data) {
	$('#candidates').html('');
	var html = '';
	var priceUnitParm = '';
	if(data && data.length > 0) {
		if(bidderPriceType == 1) {
			if(data[0].priceUnit == 0) {
				priceUnitParm = '投标价格（元）';
			} else if(data[0].priceUnit == 1) {
				priceUnitParm = '投标价格（万元）';
			};
		} else if(bidderPriceType == 9) {
			priceUnitParm = '投标价格（' + rateUnit + '）';
		}
		html += '<thead><tr>'
		html += '<th style="width: 50px;min-width: 50px;text-align: center;">序号</th>' ;
		html += '<th style="min-width: 200px;">投标人名称</th>' ;
		html += '<th style="width: 300px;min-width: 300px;text-align: center;">统一社会信用代码</th>' ;
		html += '<th style="width: 150px;min-width: 150px;text-align: center;">' + priceUnitParm + '</th>';
		html += '<th style="width: 100px;min-width: 100px;text-align: center;">得分</th>';
		if(tenderProjectType == 'A'){
			html += '<th style="width: 100px;min-width: 100px;text-align: center;">项目负责人</th>';
			html += '<th style="width: 150px;min-width: 100px;text-align: center;">证书名称及编号</th>';
			html += '<th style="width: 100px;min-width: 100px;text-align: center;">工期</th>';
		};
		html += '<th style="width: 150px;min-width: 150px;text-align: center;">操作</th>' ;
		html += '</tr></thead><tbody>';
	}

	 //根据得分排序

	function sortScore(a, b) {
		return b.score - a.score
	}; //利用js中的sort方法

	data.sort(sortScore);
	
	for(var i = 0; i < data.length; i++) {
		var priceUnit = ''; //单位
		var priceCurrency = ''; //币种
		var bidPrice = ''; //中标价格
		var otherBidPrice = ''; //费率中标
		if(data[i].comeFrom) {
			data[i].winCandidateName = data[i].bidderName;
			data[i].winCandidateId = data[i].supplierId;
		}

		priceUnit = data[i].priceUnit ? data[i].priceUnit : '0';
		priceCurrency = data[i].priceCurrency ? data[i].priceCurrency : '156';
		
		if(bidderPriceType == 1){
			bidPrice  = (data[i].bidPrice || data[i].bidPrice == 0)?data[i].bidPrice:'';
		}else if(bidderPriceType == 9){
			otherBidPrice = (data[i].otherBidPrice || data[i].otherBidPrice == 0)?data[i].otherBidPrice:'';
		}
		html += '<tr data-winner-id="' + data[i].winCandidateId + '">' +
			'<td style="width: 50px;min-width: 50px;text-align: center;">' + (i + 1) + '<input type="hidden" name="bidWinCandidates[' + i + '].bidSectionId" value="' + bidId + '"/>' +
			'<input type="hidden" name="bidWinCandidates[' + i + '].examType" value="' + 2 + '"/>' +
			'<input type="hidden" name="bidWinCandidates[' + i + '].winCandidateId" value="' + data[i].winCandidateId + '"/>' //中标候选人ID
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].winCandidateName" value="' + data[i].winCandidateName + '"/>' //中标候选人名称
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].winCandidateCode" value="' + data[i].enterpriseCode + '"/>' //中标候选人代码
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].bidderCodeType" value="' + (data[i].bidderCodeType ? data[i].bidderCodeType : '') + '"/>' //中标候选人类别
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].bidPrice" value="' + bidPrice + '"/>' //bidPrice投标价格
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].winCandidateOrder" value="' + (data[i].winCandidateOrder ? data[i].winCandidateOrder : '') + '"/>' //bidPrice投标价格
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].priceCurrency" value="' + priceCurrency + '"/>' //价格币种代码 156人民币
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].priceUnit" value="' + priceUnit + '"/>' //此处填写代码0，以元为单位
			+
			'<input type="hidden" name="bidWinCandidates[' + i + '].otherBidPrice" value="' + otherBidPrice + '"/>' //otherBidPrice投标价格费率
			+
			'</td>' +
			'<td style="min-width: 200px;" class="winCandidateName" data-name="' + data[i].winCandidateName + '">' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>' +
			'<td style="width: 300px;min-width: 300px;text-align: center;">' + (data[i].enterpriseCode ? data[i].enterpriseCode : '') + '</td>'
		if(bidderPriceType == 1) {
			html += '<td style="width: 150px;min-width: 150px;text-align: right;">' + bidPrice + '</td>'
		} else if(bidderPriceType == 9) {
			html += '<td style="width: 150px;min-width: 150px;text-align: right;">' + otherBidPrice + '</td>'
		}
		html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + ((data[i].score || data[i].score == 0) ? data[i].score : '/') + '<input type="hidden" name="bidWinCandidates[' + i + '].score" value="' + ((data[i].score || data[i].score == 0) ? data[i].score : '') + '"/></td>' ;
		if(tenderProjectType == 'A'){
			html += '<td style="width: 100px;min-width: 100px;text-align: center;"><input type="text" class="form-control projectManagerMane" name="bidWinCandidates[' + i + '].projectManagerMane" value="' + (data[i].projectManagerMane?data[i].projectManagerMane:"") + '"/></td>';
			html += '<td style="width: 150px;min-width: 100px;text-align: center;"><input type="text" class="form-control cfa" name="bidWinCandidates[' + i + '].cfa" value="' + (data[i].cfa?data[i].cfa:"") + '"/></td>';
			html += '<td style="width: 100px;min-width: 100px;text-align: center;"><input type="text" class="form-control projectTime" name="bidWinCandidates[' + i + '].projectTime" value="' + (data[i].projectTime?data[i].projectTime:"") + '"/></td>';
		};
		html += '<td style="width: 150px;min-width: 150px;text-align: center;">' +
		'<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + i + '"><span class="glyphicon glyphicon-remove"></span>删除</button>' +
		'</td>' +
		'</tr>';
	};
	html += "</tbody>";
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
					//评标方式
					bidCheckType = data.data.bidCheckType;
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
					tenderProjectType = data.data.tenderProjectType.charAt(0);
					//					isPublicProject = data.data.isPublicProject;
					$('#bidSectionId').val(id);
					$('#examType').val(2);
					for(var key in data.data) {
						$('#' + key).html(data.data[key])
					}
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}
/**********************        根据标段id获取标段相关时间信息         ********************/
function getTimeInfo(id) {
	$.ajax({
		type: "post",
		url: timeUrl,
		async: true,
		data: {
			'bidSectionId': id,
			'examType': 2
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					$('#checkStartDate').html(data.data.checkStartDate);
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}