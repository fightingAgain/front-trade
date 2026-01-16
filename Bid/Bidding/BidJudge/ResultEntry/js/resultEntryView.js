/**

 *  线下评审结果录入
 *  方法列表及功能描述
 */
var judgesUrl = config.tenderHost + '/ExpertRecommendController/getReportExperts.do'; //获取评委信息
//var bidderUrl = config.tenderHost + '/BidCheckReportController/findUnderLineSuppliers.do';//获取投标人信息
var detailUrl = config.tenderHost + '/UnderLineReportController/findSubmitReport.do';
var detUrl = config.tenderHost + '/UnderLineReportController/findSubmitReportByBidId.do'; //编辑时信息反显接口(根据标段id)
var tableUrl = config.tenderHost + '/UnderLineReportController/findOfflineCheckResult.do';

var examType = ''; //资格审查方式 1为资格预审，2为资格后审
var bidId = ''; //标段Id
var fileUploads = null;
var reportId = ''; //评标报告id
var isThrough; //是否审核通过
$(function() {
	isThrough = $.getUrlParam("isThrough");
	examType = $.getUrlParam('examType'); //资格审查方式 1为资格预审，2为资格后审
	bidId = $.getUrlParam('id'); //公告列表中带过来的标段Id
	reportId = $.getUrlParam('dataId'); //公告列表中带过来的标段Id
	/* if($.getUrlParam('isFromConsole')=="1"){
		reportId=getBidOpenId();
	} */
	getDetail(reportId, bidId, examType);

	//	getJudges();

	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: reportId,
		status: 3,
		type: "psbgsp",
		checkState: isThrough
	});
	//关闭
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//预览
	$("#preview").click(function() {
		var path = $(this).closest('td').find('#fileUrl').val();
		previewPdf(path)
	})
	if(!fileUploads) {
		fileUploads = new StreamUpload("#fileContent", {
			businessId: reportId,
			status: 2
		});
	}
});

function passView(data) {
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
/*function getJudges(){
	$.ajax({
		type:"post",
		url:judgesUrl,
		async:true,
		data: {
			'packageId': bidId,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				judgesHtml(data.data)
			}
		}
	});
};*/
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
			inpt = '<span style="color:green">是</span>';
		} else {
			inpt = '<span style="color:red">否</span>';
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
/*function getBidder(){
	$.ajax({
		type:"post",
		url:bidderUrl,
		async:true,
		data: {
			'bidSectionId': bidId
		},
		success: function(data){
			if(data.success){
				bidderHtml(data.data);
			}
		}
	});
};*/
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
		if(!data[i].score && data[i].score != 0) {
			data[i].score = '';
		};
		if(!data[i].reason) {
			data[i].reason = '';
		};
		var option1 = ''
		if(!data[i].isBidWinCandidate) {
			option1 = '<span style="color:red">否</span>'
		} else if(data[i].isBidWinCandidate && data[i].isBidWinCandidate == 1) {
			option1 = '<span style="color:green">是</span>'
		};
		var option2 = ''
		if(data[i].isKey == 0 || !data[i].isKey) {
			option2 = '<span style="color:red">淘汰</span>'
		} else if(data[i].isKey == 1) {
			option2 = '<span style="color:green">未淘汰</span>'
		}
		html += '<tr>' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + data[i].bidderName + '</td>' +
			'<td style="width: 80px;text-align: center;">' + data[i].supplierOrder + '</td>' //投标人排名
			+
			'<td style="width: 80px;text-align: center;">' + data[i].score + '</td>' //最终分值

			+
			'<td style="width: 90px;text-align: center;">' + option1 + '</td>' +
			'<td style="width: 180px;text-align: center;" class="quoted_price">' + data[i].bidPrice + '</td>' +
			'<td style="width: 110px;text-align: center;">' + option2 + '</td>' +
			'<td>' + data[i].reason + '</td>' //淘汰原因
			+
			'</tr>';
	}
	$(html).appendTo('#bidResult');
};
/*function fileHtml(arr){
	$('#file_table').html('');
	var html = '<table class="table table-bordered ">'
			+'<tr>'
				+'<th style="width: 50px;text-align: center;">序号</th>'
				+'<th >文件名称</th>'
				+'<th style="width: 150px;text-align: center;">上传人</th>'
				+'<th style="width: 150px;text-align: center;">文件大小</th>'
				+'<th style="width: 200px;text-align: center;">上传时间</th>'
			+'</tr>'
			+'<tr>'
				+'<td style="width: 50px;text-align: center;">1</td>'
				+'<td>'+arr.fileName+'<input type="hidden" name="fileUrl" value="'+arr.filePath+'"/></td>'
				+'<td style="width: 150px;text-align: center;">'+arr.name+'</td>'
				+'<td style="width: 150px;text-align: center;">'+arr.fileSize+'</td>'
				+'<td style="width: 200px;text-align: center;"></td>'
			+'</tr>'
		+'</table>'
	$(html).appendTo('#file_table');
};*/
//反显
function getDetail(id, bId, type) {
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
					if(key == 'checkType'){
						var typeCode = dataSource.tenderProjectType.substring(0, 1);
						$("#checkType").attr("optionName", "checkType" + typeCode);
						optionValueView($("#checkType"), dataSource.checkType)
					}else{
						$("#" + key).html(dataSource[key]);
					}
				};
				if(dataSource.fileUrl && dataSource.fileUrl != '') {
					$('#fileUrl').val(dataSource.fileUrl);
					$("#fileName").html(dataSource.noticeName);
					$('#preview').css('display', 'inline-block');
				}
				if(dataSource.projectAttachmentFiles) {
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
				$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
					businessId: reportId,
					status: 3,
					type: "psbgsp",
					checkState: isThrough
				});

			}
		}
	});
	$.ajax({
		type: "post",
		url: tableUrl,
		async: true,
		data: {
			'bidSectionId': bId,
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
			/*if(data.success){
				var dataSource = data.data;
				for(var key in dataSource){
	            	$("[name=" + key+"]").val(dataSource[key]);
	          	}
			}*/
		}
	});
}

/*获通知id*/
/* function getBidOpenId() {
	var id;
	$.ajax({
		type: "get",
		url: config.tenderHost + '/UnderLineReportController/findSubmitReportByBidId.do',
		async: false,
		data: {
			"bidSectionId": bidId,
			"examType": examType,
		},
		success: function(data) {
			if(data.success) {
				
				var js = data.data
				isThrough = (js.reportState == 2 ? 1 : 0)
				passView(js)
				id = js.id
			}

		}

	});
	return id;
} */