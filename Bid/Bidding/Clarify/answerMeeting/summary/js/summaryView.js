var saveUrl = ''; //保存接口
var detailUrl = config.tenderHost + '/AnswerMeetingNoticeController/getAanswerSummaryByBidId.do'; //编辑时获取详情接口
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do'; //获取标段相关信息
var fileDownloadUrl = config.FileHost + "/FileController/download.do"; //下载文件

var sumId = ''; //数据id
var bidId = ''; //标段id
var fileUploads = null; //上传文件
var fileData = []; //文件信息
//var loginInfo = entryInfo();//登录人信息
$(function() {
	//初始化编辑器
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

})

function passMessage(data) {
	var bidData = {}
	for(var key in data) {
		bidData[key] = data[key];
	}
	if(data.getForm && data.getForm == 'KZT') {
		bidId = bidData.id;
	} else {
		bidId = bidData.bidSectionId;
	}
	getBidInfo(bidId);
	getDetail(bidId);
	//文件下载
	$('#summaryHistoryList').on('click', '.btnDownload', function() {
		var ftpPath = $(this).attr('data-url');
		var fileName = $(this).attr('data-fname');
		fileName = fileName.substring(0, fileName.lastIndexOf("."));
		$(this).attr('href', $.parserUrlForToken(fileDownloadUrl + '?ftpPath=' + ftpPath + '&fname=' + fileName))
	})
}

//修改时获取详情
function getDetail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'bidSectionId': id
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					listHtml(data.data);
					// summaryList = data.data;
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}

//查询提出问题列表
function listHtml(data) {
	$('#summaryHistoryList').html('');
	var viewHtml = '';

	var summaryData = [];
	if(data.length > 0) {
		for(var i = 0; i < data.length; i++) {
			var html = '';
			var btn = '';
			var fileHtml = '';
			var createTime = ''; //发送时间
			var clarifyType = '';
			if(data[i].noticeState == 0) {
				createTime = '<span style="color:red;">未发送</span>';
			} else {
				var time = data[i].createTime.split(':').splice(0, 2).join(':');
				createTime = '<span> 上传时间 : ' + time + '</span>';
			}
			// if (data[i].clarifyType == 1) {
			//     clarifyType = '资格预审文件 '
			// } else if (data[i].clarifyType == 4) {
			//     clarifyType = '招标文件 '
			// }
			if(data[i].projectAttachmentFiles) {
				var fileData = data[i].projectAttachmentFiles;
				fileHtml = '<div><label style="font-weight: 600;">会议纪要附件：</label>'
				for(var j = 0; j < fileData.length; j++) {
					fileHtml += '<a target="_blank" data-url="' + fileData[j].url + '" data-fname="' + fileData[j].attachmentFileName + '" class=" btnDownload" style="margin-right:50px;cursor:pointer;text-decoration:none">' + fileData[j].attachmentFileName + '</a>'
				}
				fileHtml += '</div>';
				//			fileHtml = '<table class="table table-bordered ">'
				//      		+'<tr>'
				//      			+'<th style="width: 50px;text-align: center;">序号</th>'
				//      			+'<th>文件名称</th>'
				//      			+'<th>文件大小</th>'
				//      			+'<th>创建人</th>'
				//      			+'<th style="width: 150px;text-align: center;">创建时间</th>'
				//      			+'<th style="width: 80px;text-align: center;">操作</th>'
				//      		+'</tr>';
				//      	for(var j = 0;j<fileData.length;j++){
				//      		fileHtml += '<tr>'
				//      			+'<td style="width: 50px;text-align: center;">'+(j+1)+'</td>'
				//      			+'<td>'+fileData[j].attachmentFileName+'</td>'
				//      			+'<td>'+changeUnit(fileData[j].attachmentSize)+'</td>'
				//      			+'<td>'+fileData[j].createEmployeeName+'</td>'
				//      			+'<td style="width: 150px;text-align: center;">'+fileData[j].createDate+'</td>'
				//      			+'<td><a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a></td>'
				//      		+'</tr>'
				//      	}
				//      	fileHtml += '</table>'
			}
			html += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">' +
				'<div style="margin: 10px 0;position: relative;">' +
				'<span style="padding: 5px 10px;margin-right:20px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">会议纪要' + (data.length - i) + '</span>' + createTime + btn +
				'</div>' +
				'<div><label style="font-weight: 600;">答疑会通知名称：</label><span>' + (data[i].noticeName || '') + '</span></div>' +
				'<div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">联系人：</label><span>' + (data[i].linkMen || '') + '</span></div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">联系人电话：</label > <span>' + (data[i].linkTel || '') + '</span></div>' +
				'</div>' +
				'<div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">组织形式：</label><span>' + (data[i].organizationForm == 0 ? '线上组织' : '线下组织') + '</span></div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">答疑会地点：</label><span>' + (data[i].address || '') + '</span></div>' +
				'</div>' +
				'<div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">会议开始时间：</label><span>' + (data[i].noticeStartTime || '') + '</span></div>' +
				'<div style="display:inline-block;width:50%;"><label style = "font-weight: 600;">会议结束时间：</label><span>' + (data[i].noticeEndTime || '') + '</span></div>' +
				'</div>'
				// + '<div><label style="font-weight: 600;">澄清类型：</label><span>' + clarifyType + '</span><label style="font-weight: 600;margin-left:50px;">澄清标题：</label><span>' + (data[i].clarifyTitle ? data[i].clarifyTitle : '') + '</span></div>'
				// + '<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">澄清内容：</label><span>' + (data[i].clarifyContent ? data[i].clarifyContent : '') + '</span></div>'
				//      	+'<div style="padding:5px 10px 10px 10px">'+data[i].clarifyContent+'</div>'
				+
				'<div>' + fileHtml + '</div>'
				// + '<div><label style="font-weight: 600;">发送时间：</label><span>' + createTime + '</span></div>'
				+
				'</div>'
			// if (data[i].noticeState == 1) {
			viewHtml += html;
			/*if (summaryData) {
				summaryData = data[i];
			}else{
				summaryData +=data[i]
			}*/
			summaryData.push(data[i])

			// }
		}
	}
	$(viewHtml).appendTo('#summaryHistoryList');

	listSummaryInfo(summaryData);
}

function listSummaryInfo(data) {
	console.log(data)
	var arr = data;
	if(arr.length > 0) {
		let js = arr[0];
		if(js.organizationForm == 0) {
			js.organizationForm = '线上组织'
		} else if(js.organizationForm == 1) {
			js.organizationForm = '线下组织'
		}
		for(var key in js) {
			$('#' + key).html(js[key]);
		}
	}
	var files = []
	for(var i = 0; i < arr.length; i++) {
		let js = arr[i];
		if(js.projectAttachmentFiles) {
			var projectAttachmentFiles = js.projectAttachmentFiles;
			//				fileHtml(dataSource.projectAttachmentFiles);
			if(!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					businessId: js.id,
					status: 2,
					businessTableName: 'T_ANSWER_MEETING_SUMMARY',
					attachmentSetCode: 'MEETING_SUMMARY'
				});
			}
			if(projectAttachmentFiles && projectAttachmentFiles.length > 0) {
				//fileUploads.fileHtml(projectAttachmentFiles);
				for(var j=0;j<projectAttachmentFiles.length;j++){
					files.push(projectAttachmentFiles[j])
				}
			}

			/*if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+sumId+"/605",
					businessId: sumId,
					status:1,
					businessTableName:'T_ANSWER_MEETING_NOTICE',  
					attachmentSetCode:'MEETING_NOTICE',
					changeFile:function(data){
						//有文件操作是，返回方法，data为文件列表
						fileData = data
					}
					
				});
			}
			fileData = projectAttachmentFiles;
			fileUploads.fileHtml(projectAttachmentFiles);*/
		}

	}
console.log(files)
	fileUploads.fileHtml(files);

	/*sumId = arr.id;

	//文件回显
	if(arr.projectAttachmentFiles) {
		var projectAttachmentFiles = arr.projectAttachmentFiles;
		if(!fileUploads) {
			fileUploads = new StreamUpload("#fileContent", {
				businessId: sumId,
				status: 2,
				businessTableName: 'T_ANSWER_MEETING_SUMMARY',
				attachmentSetCode: 'MEETING_SUMMARY'
			});
		}
		if(projectAttachmentFiles && projectAttachmentFiles.length > 0) {
			fileUploads.fileHtml(projectAttachmentFiles);
		}
		
	}*/
}

/*****************     根据标段id获取标段相关信息        *************************/
function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: bidInfoUrl,
		async: true,
		data: {
			'id': id
		},
		success: function(data) {
			if(data.success) {
				for(var key in data.data) {
					$('#' + key).html(data.data[key]);
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}