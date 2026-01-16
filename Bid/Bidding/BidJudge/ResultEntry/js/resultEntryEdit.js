/**

 *  线下评审结果录入
 *  方法列表及功能描述
 */
var judgesUrl = config.tenderHost + '/UnderLineReportController/findExpertMembers.do'; //获取评委信息
var bidderUrl = config.tenderHost + '/UnderLineReportController/findUnderLineSuppliers.do'; //新增时获取投标人信息
var detailUrl = config.tenderHost + '/UnderLineReportController/findSubmitReport.do'; //编辑时信息反显接口
var detUrl = config.tenderHost + '/UnderLineReportController/findSubmitReportByBidId.do'; //编辑时信息反显接口(根据标段id)
var tableUrl = config.tenderHost + '/UnderLineReportController/findOfflineCheckResult.do'; //编辑时获取投标人信息

var saveUrl = config.tenderHost + '/UnderLineReportController/saveUnderLineReport.do'; //保存地址
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
var reportId = ''; //评标报告id

$(function() {
	examType = $.getUrlParam('examType'); //资格审查方式 1为资格预审，2为资格后审
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	if($.getUrlParam('dataId') && $.getUrlParam('dataId') != undefined) {
		reportId = $.getUrlParam('dataId');
		getDetail(reportId, bidId, examType);
	} else {
		getBidder();
	}
	$('#bidSectionId').val(bidId);
	$('#examType').val(examType);
	//	getJudges();
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: reportId,
		status: 1,
		type: "psbgsp",
	});
	fileUpload(signIn.enterpriseId, bidId);

	//开始时间
	$('#checkStartDate').click(function() {
		if($('#checkEndDate').val() == '') {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm'
			})
		} else {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				maxDate: '#F{$dp.$D(\'checkEndDate\')}'
			})
		}

	});
	//结束时间
	$('#checkEndDate').click(function() {
		if($('#checkStartDate').val() == '') {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
			})
		} else {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				minDate: '#F{$dp.$D(\'checkStartDate\')}'
			})
		}

	});
	//关闭
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//淘汰
	$('#bidResult').on('change', '.isKey', function() {
		var optionValue = $(this).val();
		if(optionValue == 0) {
			$(this).closest('tr').find('.reason').css('display', 'block');
		} else if(optionValue == 1) {
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
	//保存
	$('#btnSave').click(function() {
		save(0, true);
	})
	//提交
	$('#btnSubmit').click(function() {
		var expertId = $("input[name='expertId']:checked").val();
		var winner = [];
		/*if(expertId == '' || expertId == undefined){
			parent.layer.alert('请选择评委组长！',{icon:7,title:'提示'});
			return
		}*/
		var tr = $('#bidResult tbody tr');
		for(var i = 0; i < tr.length; i++) {
			var isKey = $(tr[i]).find('.isKey').val();
			var candidate = $(tr[i]).find('.candidate').val();
			$(tr[i]).find('.isKey').removeAttr('disabled');
			if(isKey == 1) {
				if($(tr[i]).find('[name="offlineCheckResults[' + (i - 1) + '].supplierOrder"]').val() == '') {
					parent.layer.alert('请输入未被淘汰的投标人名次！', {
						icon: 7,
						title: '提示'
					}, function(idx) {
						parent.layer.close(idx);
						$('#collapseTwo').collapse('show');
						$('[name="offlineCheckResults[' + (i - 1) + '].supplierOrder"]').focus();

					});

					return
				} else if($(tr[i]).find('[name="offlineCheckResults[' + (i - 1) + '].score"]').val() == '') {
					parent.layer.alert('请输入未被淘汰的投标人得分！', {
						icon: 7,
						title: '提示'
					}, function(idx) {
						parent.layer.close(idx);
						$('#collapseTwo').collapse('show');
						$('[name="offlineCheckResults[' + (i - 1) + '].score"]').focus();
					});

					return
				}
			} else if(isKey == 0) {
				if($(tr[i]).find('[name="offlineCheckResults[' + (i - 1) + '].reason"]').val() == '') {
					parent.layer.alert('请输入被淘汰的投标人的淘汰原因！', {
						icon: 7,
						title: '提示'
					}, function(idx) {
						parent.layer.close(idx);
						$('#collapseTwo').collapse('show');
						$('[name="offlineCheckResults[' + (i - 1) + '].reason"]').focus();
					});

					return
				}
			}
			if(candidate == 1) {
				winner.push(candidate)
			}
		}
		/* if(winner.length < 1) {
			parent.layer.alert('请选择中标候选人！', {
				icon: 7,
				title: '提示'
			}, function(idx) {
				parent.layer.close(idx);
				$('#collapseTwo').collapse('show');
			});
			return;
		} */
		
		var checkStartDate = Date.parse(new Date($('#checkStartDate').val().replace(/\-/g, "/"))); //会议开始时间
		var checkEndDate = Date.parse(new Date($('#checkEndDate').val().replace(/\-/g, "/"))); //会议结束时间
		if(checkEndDate <= checkStartDate) {
			parent.layer.alert('评标结束时间应在评标开始时间之后！', {
				icon: 7,
				title: '提示'
			}, function(idx) {
				parent.layer.close(idx);
				$('#collapseOne').collapse('show');
			});
			return
		}

		if(checkForm($("#addNotice"))) { //必填验证，在公共文件unit中
			if($("#addChecker").length <= 0) {
				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
					title: '提交审核',
					btn: [' 是 ', ' 否 '],
					yes: function(layero, index) {
						save(1);
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
					save(1);
				});
			}

		}

	});
	//预览
	$("#preview").click(function() {
		var path = $(this).closest('td').find('#fileUrl').val();
		previewPdf(path)
	})
	//若被选中为候选人则报价框出现，可填写报价
	/*$('#bidResult').on('change','.candidate',function(){
		var td = $(this).closest('tr').find('.quoted_price');
		var ipt = '<input type="number" name="" class="form-control " style="text-align: center;"/>';
		if($(this).val() == 1){
			$(ipt).appendTo(td)
		}else{
			td.html('')
		}
	})*/
	/*
	 *上传文件
	 * */
	$('#btnLoad').click(function() {
		if(reportId == "") {
			save(0, false, function(businessId) {
				reportId = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + reportId + "/506",
						businessId: reportId,
						status: 1,
						businessTableName: 'T_BID_CHECK_REPORT',
						attachmentSetCode: 'JUDGE_FILES'
					});
				}
				$('#fileLoad').trigger('click');
			});

		} else {
			//上传文件
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + reportId + "/506",
					businessId: reportId,
					status: 1,
					businessTableName: 'T_BID_CHECK_REPORT',
					attachmentSetCode: 'JUDGE_FILES'
				});
			}
			$('#fileLoad').trigger('click');
		}

	});
});

function passMessage(data) {
	if(data.getForm && data.getForm == "KZT") {
		getDetail('', data.bidSectionId, 2);
	}
	for(var key in data) {
		$('#' + key).val(data[key])
	}
	if(data.tenderProjectType) {
		var typeCode = data.tenderProjectType.substring(0, 1);
		$("#checkType").attr("optionName", "checkType" + typeCode);
		optionValueView($("#checkType"), data.checkType)
	}
}
//获取评委信息
function getJudges() {
	$.ajax({
		type: "post",
		url: judgesUrl,
		async: true,
		data: {
			'packageId': bidId,
			'examType': examType
		},
		success: function(data) {
			if(data.success) {
				judgesHtml(data.data)
			}
		}
	});
};

function judgesHtml(data) {
	$('#judges tbody').html('');
	var html = '';
	for(var i = 0; i < data.length; i++) {
		if(data[i].expertType == 1) {
			data[i].expertType = '在库专家'
		} else if(data[i].expertType == 2) {
			data[i].expertType = '招标人代表'
		};
		var inpt = '';
		if(data[i].isChairMan && data[i].isChairMan == 1) {
			inpt = '<input type="radio" name="expertId" checked value="' + data[i].id + '" />';
		} else {
			inpt = '<input type="radio" name="expertId" value="' + data[i].id + '"/>';
		}
		html += '<tr>' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + data[i].expertName + '</td>' +
			'<td style="width: 200px;text-align: center;">' + data[i].expertType + '</td>' +
			'<td style="width: 200px;text-align: center;">' + data[i].expertTel + '</td>' +
			'<td style="width: 200px;text-align: center;">' + getOptionValue('identityCardType', data[i].identityCardType) + '</td>' +
			'<td style="width: 300px;text-align: center;">' + data[i].identityCardNum + '</td>' +
			'<td style="width: 80px;text-align: center;">' + inpt + '</td>' +
			'</tr>';
	};
	$(html).appendTo('#judges tbody');
}
//获取投标人信息
function getBidder() {
	$.ajax({
		type: "post",
		url: bidderUrl,
		async: true,
		data: {
			'bidSectionId': bidId
		},
		success: function(data) {
			if(data.success) {
				if(data.data.length > 0) {
					bidderHtml(data.data);
				}
			}
		}
	});
};

function bidderHtml(data) {
	$('#bidResult').html('');
	var html = '';
	var priceUnit = '';
	if(data[0].priceUnit == 0) {
		priceUnit = '（元）'
	} else if(data[0].priceUnit == 1) {
		priceUnit = '（万元）'
	};
	html = '<tr>' +
		'<th style="width: 50px;text-align: center;">序号</th>' +
		'<th>投标人名称</th>' +
		'<th style="width: 80px;text-align: center;">名次</th>' +
		'<th style="width: 80px;text-align: center;">得分</th>' +
		'<th style="width: 90px;text-align: center;">是否候选人</th>' +
		'<th style="width: 180px;text-align: center;">报价' + priceUnit + '</th>' +
		'<th style="width: 80px;text-align: center;">是否淘汰</th>' +
		'<th >淘汰原因</th>' +
		'</tr>'
	for(var i = 0; i < data.length; i++) {
		if(!data[i].otherBidPrice) {
			data[i].otherBidPrice = '';
		};
		if(!data[i].supplierOrder) {
			data[i].supplierOrder = '';
		};
		if(!data[i].score) {
			data[i].score = '';
		};
		if(!data[i].reason) {
			data[i].reason = '';
		};
		var option1 = '';
		var isCandidate = false;
		var disable = '';
		if(!data[i].isBidWinCandidate || data[i].isBidWinCandidate == 0) {
			option1 = '<option value="0">否</option>' +
				'<option value="1">是</option>'
		} else if(data[i].isBidWinCandidate && data[i].isBidWinCandidate == 1) {
			isCandidate = true;
			disable = 'disabled';
			option1 = '<option value="0">否</option>' +
				'<option value="1" selected>是</option>'
		};
		var option2 = '';
		var textarea = '';
		if(data[i].isKey == 0) {
			option2 = '<option value="1">未淘汰</option>' +
				'<option value="0" selected>淘汰</option>';
			textarea = '<textarea name="offlineCheckResults[' + i + '].reason"  class="form-control reason" rows="2" maxlength="85" cols="" style="resize: none;">' + data[i].reason + '</textarea>';
		} else if(data[i].isKey == 1 || !data[i].isKey) {
			option2 = '<option value="1" selected>未淘汰</option>' +
				'<option value="0">淘汰</option>';
			textarea = '<textarea name="offlineCheckResults[' + i + '].reason"  class="form-control reason" rows="2" maxlength="85" cols="" style="resize: none;display:none;">' + data[i].reason + '</textarea>';
		};
		if(!data[i].priceFormCode) {
			data[i].priceFormCode = '';
		}
		if(!data[i].bidderOrgCode) {
			data[i].bidderOrgCode = '';
		}
		if(!data[i].bidderCodeType) {
			data[i].bidderCodeType = '';
		}
		if(!data[i].supplierId) {
			data[i].supplierId = data[i].bidderId;
		}

		html += '<tr>' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + data[i].bidderName + '<input type="hidden" name="offlineCheckResults[' + i + '].supplierId" value="' + data[i].supplierId + '"/>' //投标人ID
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].bidderName" value="' + data[i].bidderName + '"/>' //投标人名称
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].bidderCodeType" value="' + (data[i].bidderCodeType ? data[i].bidderCodeType : '') + '"/>' //投标人类别
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].bidderOrgCode" value="' + (data[i].bidderOrgCode ? data[i].bidderOrgCode : '') + '"/>' //投标人代码
			+
			'</td>' +
			'<td style="width: 80px;text-align: center;"><input type="text" name="offlineCheckResults[' + i + '].supplierOrder" oninput="priceInput(this,0)" value="' + data[i].supplierOrder + '" class="form-control " style="text-align: center;"/></td>' //投标人排名
			+
			'<td style="width: 100px;text-align: center;"><input type="number" name="offlineCheckResults[' + i + '].score" oninput="priceInput(this,2)" onblur="priceTest(this)" value="' + data[i].score + '"  class="form-control " style="text-align: center;"/></td>' //最终分值

			+
			'<td style="width: 90px;text-align: center;">' +
			'<select name="offlineCheckResults[' + i + '].isBidWinCandidate" class="form-control candidate">' + option1 + '</select>' +
			'</td>' +
			'<td style="width: 180px;text-align: center;" class="quoted_price">' +
			'<input type="number" name="offlineCheckResults[' + i + '].bidPrice" value="' + data[i].bidPrice + '" class="form-control " style="text-align: center;"/>' //投标价格
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].priceCurrency" value="' + (data[i].priceCurrency ? data[i].priceCurrency : '156') + '"/>' //价格币种代码 156人民币
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].priceUnit" value="' + (data[i].priceUnit ? data[i].priceUnit : '0') + '"/>' //此处填写代码0，以元为单位
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].priceFormCode" value="' + (data[i].priceFormCode ? data[i].priceFormCode : '') + '"/>' //价款形式代码1 金额以价格数值表示2 费率/比率/优惠率/合格率等以百分比表示3 其他形式
			+
			'<input type="hidden" name="offlineCheckResults[' + i + '].otherBidPrice" value="' + (data[i].otherBidPrice ? data[i].otherBidPrice : '') + '"/>' //百分比、下浮率、比率或文字描述类型的报价
			+
			'</td>' +
			'<td style="width: 110px;text-align: center;">' +
			'<select name="offlineCheckResults[' + i + '].isKey" ' + disable + ' class="form-control isKey">' + option2 + '</select>' //是否合格 0为否 1为是
			+
			'</td>' +
			'<td>' + textarea + '</td>' //淘汰原因
			+
			'</tr>';
	}
	$(html).appendTo('#bidResult');

};

function priceTest(ele) {
	if(Number(ele.value) > 100) {
		parent.layer.alert('得分超过100，请确认！', {
			title: '提示'
		}, function(ind) {
			parent.layer.close(ind);
		})
	}
}
/*保存
 * state:0 保存，1提交
 * isTips: true 保存成功时弹提示  false 不弹
 */
function save(state, isTips, callback) {

	var param = $.param({
		'reportState': state
	}) + '&' + $('#addNotice').serialize();
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: param,
		success: function(data) {
			if(data.success) {
				reportId = data.data;
				if(state == 0) {
					if(isTips) {
						parent.layer.alert('保存成功！', {
							icon: 6,
							title: '提示'
						});
					}
					if(callback) {
						callback(reportId)
					}
				} else if(state == 1) {
					parent.layer.alert('提交成功！', {
						icon: 6,
						title: '提示'
					});
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.close(index); //再执行关闭
				}
				parent.$("#tableList").bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message);
			}
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
function getDetail(id, bidId, type) {
	var postUrl = "";
	var postData = {};
	if(id) {
		postUrl = detailUrl;
		postData.id = id;
		postData.examType = examType;
	} else {
		postUrl = detUrl;
		postData.bidSectionId = bidId;
		postData.examType = examType;
	}
	$.ajax({
		type: "post",
		url: postUrl,
		async: true,
		data: postData,
		success: function(data) {
			if(data.success) {
				var dataSource = data.data;
				if(!reportId && dataSource) {
					reportId = dataSource.id;
				}
				for(var key in dataSource) {
					if(key == 'checkType') {
						var typeCode = dataSource.tenderProjectType.substring(0, 1);
						$("#checkType").attr("optionName", "checkType" + typeCode);
						optionValueView($("#checkType"), dataSource.checkType)
					} else {
						$("[name=" + key + "]").val(dataSource[key]);
					}
				};
				if(dataSource) {
					if(dataSource.fileUrl && dataSource.fileUrl != '') {
						$('#fileUrl').val(dataSource.fileUrl);
						$("#fileName").html(dataSource.noticeName);
						$('#preview').css('display', 'inline-block');
					}
					if(!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + reportId + "/506",
							businessId: reportId,
							status: 1,
							businessTableName: 'T_BID_CHECK_REPORT',
							attachmentSetCode: 'JUDGE_FILES'
						});
					}
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
			}
		}
	});
	$.ajax({
		type: "post",
		url: tableUrl,
		async: true,
		data: {
			'bidSectionId': bidId,
			'examType': type
		},
		success: function(data) {
			if(data.success) {
				if(data.data && data.data.length > 0) {
					bidderHtml(data.data)
				}
			} else {
				parent.layer.alert(data.message)
			}

		}
	});
}