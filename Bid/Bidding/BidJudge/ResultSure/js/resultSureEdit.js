/**
 *  zhouyan 
 *  2019-6-4
 *  确定中标人
 *  方法列表及功能描述
 */
var saveUrl = config.tenderHost + '/BidWinCandidateController/saveAndSubmit.do'; //保存
var detailUrl = config.tenderHost + '/BidWinCandidateController/findByBidSectionId.do'; //新增时中标人
var getUrl = config.tenderHost + '/BidWinCandidateController/findWinCandidateByBidId.do'; //编辑时时中标人
var changeUrl = config.tenderHost + "/BidWinCandidateController/reset.do"; //变更 
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do'; //获取标段相关信息
var fileUrl = config.FileHost + "/FileController/streamFile.do"; //H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址
var isLaw; //是否依法 0-否   1是
var firstWinner;
var bidId = ''; //标段id
var dataId = ''; //数据id
var fileUploads = null;
var examType = '2';
var postData = {};
var candidatesArr = []; //候选人
var CAcf = null; //实例化CA
var special = ''; //以此判断是不是控制台过来的变更

var bidderPriceType; //投标报价方式 1.金额  9费率
var rateUnit; //费率单位
var rateRetainBit; //费率保留位数(0~6)

var tenderProjectType; //招标项目类型
var projectAttachmentFiles = []; //存放附件信息并传给后台
var lastWinBidder = [];//最近提交的中标人
var noticeNature;//1为正常公示，2为更正公示，3为重发公示，9为其它
var RenameData;//投标人更名信息
$(function() {
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	//	dataId = $.getUrlParam('id');//公告列表中带过来的标段Id
	/*if(dataId){
		getEdit(dataId);
	}*/
	if($.getUrlParam("special") && $.getUrlParam("special") != "undefined") {
		special = $.getUrlParam('special'); //公示列表中带过来的ID
	}
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getBidInfo(bidId);
	var isContinu = true;
	if(special == 'CHANGE') {
		$.ajax({
			type: "post",
			url: changeUrl,
			async: false,
			dataType: "json", //预期服务器返回的数据类型
			data: {
				'bidSectionId': bidId,
				'examType': 2
			},
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function(data) {
				if(data.success) {
					getEdit(bidId, '2');
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
		getEdit(bidId, '2');
	}
	if(!isContinu) {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
		return
	}
	
	//getEdit(bidId,'2');重复请求，建议删除
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

});

function passMessage(data, callback) {
	examType = 2;
	$('#examType').val(examType);
	if(data.getForm == 'KZT') {
		bidId = data.id;
	} else {
		bidId = data.bidSectionId; //标段id
	}
	// 提交
	$('#btnSubmit').click(function() {
		//$('input:checkbox:checked') 等同于 $('input[type=checkbox]:checked')
		//意思是选择被选中的checkbox
		var bidWinCandidates = [];
		var isNext = true;
		$.each($('[name="bidWinCandidateIds"]:checked'), function() {
			var index = $(this).closest('td').attr('data-index');
			var reson = $(this).closest('tr').find('.remark').val();
			var data = {};
			if(candidatesArr[index].winCandidateOrder != '1') {
				if(reson.replace(/\s+/g, '') == '' || !reson) {
					parent.layer.alert('请输入中标原由！', {
						title: '提示'
					}, function(ind) {
						parent.layer.close(ind);
						$('#collapseTwo').collapse('show');
						$('.remark').eq(index).focus();
					});
					isNext = false;
					return false
				}
			}
			data.id = $(this).val();
			data.remark = reson;
			bidWinCandidates.push(data);
		});
		if(!isNext) {
			return
		}
		if(dataId && dataId != '') {
			postData.id = dataId;
		}
		postData.bidWinCandidateIds = bidWinCandidates;
		postData.noticeContent = $('#noticeContent').val();
		postData.bidSectionId = bidId;
		postData.examType = examType;
		postData.noticeState = 1;
		if($("[name=checkerIds]").length > 0 && $("[name=checkerIds]").val() == ''){
			parent.layer.alert('请选择审核人！');
			return
		}
		if(isLaw == 1) {
			if(bidWinCandidates.length == 0) {
				parent.layer.alert('请选择中标人！', {
					icon: 3,
					title: '提示'
				}, function(ind) {
					parent.layer.close(ind);
					$('#collapseTwo').collapse('show');
				})
			} else if(bidWinCandidates.length == 1) {
				if(!checkFiles(bidWinCandidates)){//未上传附件
					parent.layer.alert('中标人已发生变更，附件必传！');
					return
				}else{
					saveCA(callback);
				}
			} else if(bidWinCandidates.length > 1) {
				parent.layer.alert('依法项目，中标人应该只能选择1家！', {
					icon: 3,
					title: '提示'
				}, function(ind) {
					parent.layer.close(ind);
					$('#collapseTwo').collapse('show');
				})
			}
		} else {
			if(bidWinCandidates.length == 0) {
				parent.layer.alert('请选择中标人！', {
					icon: 3,
					title: '提示'
				}, function(ind) {
					parent.layer.close(ind);
					$('#collapseTwo').collapse('show');
				})
			} else {
				if(!checkFiles(bidWinCandidates)){//未上传附件
					parent.layer.alert('中标人已发生变更，附件必传！');
					return
				}else{
					if($("#addChecker").length <= 0) {
						parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
							title: '提交审核',
							btn: [' 是 ', ' 否 '],
							yes: function(layero, index) {
								saveCA(callback);
							},
							btn2:function(index, layero) {
								parent.layer.close(index);
							}
						})
					} else {
						saveCA(callback);
					}
				}
			}
		}
	});
	function checkFiles(data){
		if((special == 'CHANGE' || noticeNature == '2') && $('.fileListTab tr').length < 2){//变更时，若中标人变了，则附件必传
			var saveWinner = []; 
			for(var y=0;y<data.length;y++){
				saveWinner.push(data[y].id);
			}
			if(lastWinBidder.join(',') == saveWinner.join(',')){
				return true
			}else{
				return false
			}
		}else{
			return true
		}
	}
	//保存
	$('#btnSave').click(function() {
		//$('input:checkbox:checked') 等同于 $('input[type=checkbox]:checked')
		//意思是选择被选中的checkbox
		//      console.log(isLaw)
		var bidWinCandidates = [];
		$.each($('[name="bidWinCandidateIds"]:checked'), function() {
			var index = $(this).closest('td').attr('data-index');
			var reson = $(this).closest('tr').find('.remark').val();
			var data = {};
			data.id = $(this).val();
			data.remark = reson;
			bidWinCandidates.push(data);
		});
		if(dataId && dataId != '') {
			postData.id = dataId;
		};
		postData.bidSectionId = bidId;
		postData.examType = examType;
		postData.bidWinCandidateIds = bidWinCandidates;
		postData.noticeContent = $('#noticeContent').val();
		postData.noticeState = 0;
		save(false, postData, true, callback)
	});

	function saveCA(callback) {
		if(!CAcf) {
			CAcf = new CA({
				target: "#onBidCA",
				confirmCA: function(flag) {
					if(!flag) {
						return;
					}
					postData = parent.serializeArrayToJson($("#onBidCA").serializeArray());
					var bidWinCandidates = [];
					$.each($('[name="bidWinCandidateIds"]:checked'), function() {
						var index = $(this).closest('td').attr('data-index');
						var reson = $(this).closest('tr').find('.remark').val();
						var data = {};
						data.id = $(this).val();
						data.remark = reson;
						bidWinCandidates.push(data);
					});
					if(dataId && dataId != '') {
						postData.id = dataId;
					};
					postData.bidSectionId = bidId;
					postData.examType = examType;
					postData.bidWinCandidateIds = bidWinCandidates;
					postData.noticeContent = $('#noticeContent').val();
					postData.noticeState = 1;
					save(true, postData, false, callback);
				}
			});
		}
		CAcf.sign();

	}
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function() {
		var bidWinCandidates = [];
		$.each($('[name="bidWinCandidateIds"]:checked'), function() {
			var index = $(this).closest('td').attr('data-index');
			var reson = $(this).closest('tr').find('.remark').val();
			var data = {};
			data.id = $(this).val();
			data.remark = reson;
			bidWinCandidates.push(data);
		});
		postData.bidSectionId = bidId;
		
		postData.examType = examType;
		postData.bidWinCandidateIds = bidWinCandidates;
		postData.noticeContent = $('#noticeContent').val();
		postData.noticeState = 0;
		if(dataId && dataId != '') {
			postData.id = dataId;
			save(false, postData, false, callback, function(businessId) {
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + dataId + "/223",
						businessId: dataId,
						status: 1,
						businessTableName: 'T_BID_WIN_NOTICE',
						attachmentSetCode: 'WINNER_DOC'
					});
				}
				$('#fileLoad').trigger('click');
			});
		} else {
			save(false, postData, false, callback, function(businessId) {
				dataId = businessId;
				//上传文件
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + dataId + "/223",
						businessId: dataId,
						status: 1,
						businessTableName: 'T_BID_WIN_NOTICE',
						attachmentSetCode: 'WINNER_DOC'
					});
				}
				$('#fileLoad').trigger('click');
			});
		}
	});
};

//新增时查候选人
function getDetail(id, type) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data) {
			if(data.success) {
				if(data.data && data.data.length > 0) {
					candidatesArr = data.data;
					tenderTable(data.data)
				}
			}
		}
	});
};
//编辑时查候选人
function getEdit(id, type) {
	$.ajax({
		type: "post",
		url: getUrl,
		async: false,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					$('#dataId').val(data.data.id);
					dataId = data.data.id;
					candidatesArr = data.data.bidWinCandidates;
					noticeNature =  data.data.noticeNature;
					tenderTable(data.data.bidWinCandidates);
					$("#noticeContent").text(data.data.noticeContent);
					if(special == 'CHANGE' || noticeNature == '2'){
						//审核
						$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
							businessId: dataId,
							status: 1,
							type: "zbqdzbr",
						});
					}
					if(!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + data.bidSectionId + "/" + id + "/224",
							businessId: dataId,
							status: 1,
							businessTableName: 'T_BID_WIN_NOTICE',
							attachmentSetCode: 'WINNER_DOC'
						});
					}
					if(data.data.projectAttachmentFiles) {
						fileUploads.fileHtml(data.data.projectAttachmentFiles);
					}
					if(data.data.lastBidWinCandidates){
						for(var k=0;k<data.data.lastBidWinCandidates.length;k++){
							if(data.data.lastBidWinCandidates[k].isWinBidder == 1){
								lastWinBidder.push(data.data.lastBidWinCandidates[k].winCandidateId)
							}
							
						}
						
					}
				} else {
					getDetail(id, type)
				}

			}
		}
	});
}
//确定中标人列表
function tenderTable(data) {
	var html = '';
	firstWinner = data[0].bidWinCandidates;
	$('#winnerList').html('');
	var isScore = false;
	var priceUnitParm = '';
	if(data && data.length > 0) {
		if(data[0].score) {
			isScore = true;
		}
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
			'<th style="width: 50px;text-align: center;">序号</th>' +
			'<th style="min-width:200px;">投标人名称</th>';
		if(isScore) {
			html += '<th style="width: 100px;text-align: center;">得分</th>';
		}
		html += '<th style="width: 200px;text-align: center;">' + priceUnitParm + '</th>' +
			'<th style="width: 80px;text-align: center;">名次</th>' +
			'<th style="width: 150px;text-align: center;">是否中标人</th>' +
			'<th style="width: 300px;text-align: center;">中标原由</th>' +
			'</tr>';

	}
	for(var i = 0; i < data.length; i++) {
		var check = '';
		if(data[i].isWinBidder && data[i].isWinBidder == 1) {
			check = 'checked="checked"';
		}
		if(data[i].priceUnit) {
			if(data[i].priceUnit == 0) {
				data[i].priceUnit = "（元"
			} else if(data[i].priceUnit == 1) {
				data[i].priceUnit = "（万元"
			}
		} else {
			data[i].priceUnit = ""
		}
		if(data[i].priceCurrency) {
			if(data[i].priceCurrency == 156) {
				data[i].priceCurrency = "/人民币）"
			}
		} else {
			data[i].priceCurrency = "）"
		}
		var bidPrice = (data[i].bidPrice || data[i].bidPrice == 0) ? data[i].bidPrice : '';
		var otherBidPrice = (data[i].otherBidPrice || data[i].otherBidPrice == 0) ? data[i].otherBidPrice : '';
		html += '<tr>' +
			'<td style="text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>'
		if(isScore) {
			html += '<td style="text-align: center;">' + (data[i].score ? data[i].score : "/") + '</td>'
		}
		//			+'<td style="width: 100px;text-align: center;">'+data[i].winCandidateName+'</td>'

		if(bidderPriceType == 1) {
			html += '<td style="text-align: right;">' + bidPrice + '</td>'
		} else if(bidderPriceType == 9) {
			html += '<td style="text-align: right;">' + otherBidPrice + '</td>'
		}
		html += '<td style="text-align: center;">' + data[i].winCandidateOrder + '</td>' +
			'<td style="text-align: center;" data-index="' + i + '">' +
			'<input type="checkbox" name="bidWinCandidateIds" class="checkBlackList" id="" ' + check + ' value="' + data[i].winCandidateId + '" data-winCandidateCode="' + data[i].winCandidateCode + '"/>' +
			'</td>' +
			'<td style="text-align: center;">' +
			'<textarea class="form-control remark" name="remark" style="resize:none" >' + (data[i].remark ? data[i].remark : '') + '</textarea>' +
			'</td>' +
			'</tr>';
	}
	$(html).appendTo('#winnerList')
	//黑名单验证
	$('.checkBlackList').click(function() {
		var enterpriseCode = $(this).attr('data-winCandidateCode')
		//若在黑名单中，checkbox添加disable不可选中属性
		var parm = checkBlackList(enterpriseCode, tenderProjectType, "g");
		if(parm.isCheckBlackList) {
			parent.layer.alert(parm.message, {
				icon: 7,
				title: '提示'
			});
			$(this).removeAttr('checked');
			$(this).attr('disabled', 'disabled');
		}
	});
};

/*
 * isSubmit true:提交 false: 保存
 * dat： 提交是数据
 * isTips： 保存时是否提示
 * callback
 */
function save(isSubmit, dat, isTips, callback, back) {
	$('#btnSubmit').attr('disabled', true);
	if($("[name=checkerIds]").length > 0){
		dat.checkerIds = $("[name=checkerIds]").val();
	}
	dat.bulletinType = 9;
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: dat,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				dataId = data.data;
				if(isSubmit) {
					parent.layer.alert('确认成功！', {
						icon: 6,
						title: '提示'
					})
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				} else {
					if(isTips) {
						parent.layer.alert('保存成功！', {
							icon: 6,
							title: '提示'
						});
					}
				}
				if(callback) {
					callback()
				}
				if(back) {
					back(data.data)
				}
			} else {
				parent.layer.alert(data.message, {
					icon: 5,
					title: '提示'
				});
			}
		},
		error: function() {
		 $('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}
	});
}
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
				//获取招标项目类型，用于验证黑名单
				tenderProjectType = data.data.tenderProjectType;
				if(data.data) {
					isLaw = data.data.isLaw;
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
					for(var key in data.data) {
						$('#' + key).html(data.data[key])
					}
					$('#bidSectionId').val(data.data.bidSectionId);

				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}

/***************yiwen20210909*****************/

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