var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var pushUrl = config.tenderHost + '/projectReceptionController/push.do';//推送接口
var getInfoUrl = config.tenderHost + '/projectReceptionController/saveLogPushProject.do';//获取推送数据详情接口

var fileUpUrl = config.tenderHost + '/projectReceptionController/uploadAttachments.do';//获取上传文件资料
//var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var dowoloadFileUrl = config.FileHost + "/FileController/downloadDecoderFile.do"; //下载文件
var delUrl = config.tenderHost + '/projectReceptionController/delete.do';//删除
var packageId = $.getUrlParam("id");//包件id
//var projectId = $.getUrlParam("projectId");//项目id
var pushId = '';//推送id
var fileArr = [];
var registerInfo = entryInfo();
var token = sessionStorage.token;
var loadMaskIndex = '';
$(function () {

	var fileArr = [
		/*		{'ftype': '31','name': '招标文件确认函'},
				{'ftype': '33','name': '业主评委授权委托书'},*/
		{ 'ftype': '34', 'name': '招标文件' },
		{ 'ftype': '35', 'name': '评委抽取表' },
		{ 'ftype': '36', 'name': '评标报告' },
		{ 'ftype': '37', 'name': '中标候选人公示' },
		{ 'ftype': '38', 'name': '中标公示' },
		{ 'ftype': '39', 'name': '其他人投标文件' },
		{ 'ftype': '40', 'name': '中标人投标文件' },
		{ 'ftype': '42', 'name': '中标候选人推荐表' },
		{ 'ftype': '43', 'name': '中标人报价盖章件' },
		/*		{'ftype': '41','name': '中标人确定书'},*/
		{ 'ftype': '21', 'name': '投标人技术方案' },
		{ 'ftype': '22', 'name': '投标人报价文件' },
		{ 'ftype': '23', 'name': '投标人中标通知书' },
		{ 'ftype': '24', 'name': '投标人结果通知书' },
		{ 'ftype': '99', 'name': '其他附件' }
	]
	var html = '';
	for (var m = 0; m < fileArr.length; m++) {
		if (fileArr[m].ftype == 21 || fileArr[m].ftype == 22 || fileArr[m].ftype == 23 || fileArr[m].ftype == 24) {
			continue;
		}
		html += '<tr>';
		if (fileArr[m].ftype == 42 || fileArr[m].ftype == 43) {
			html += '<td colspan="4" style="font-weight: bold;" class="active">' + fileArr[m].name + '<i style="color:red">*</i></td>';
		} else {
			html += '<td colspan="4" style="font-weight: bold;" class="active">' + fileArr[m].name + '</td>';
		}
		html += '</tr>';
		html += '<tr>';
		html += '<td colspan="4">'
		html += '<div class="file_iterm" style="text-align: right;"><button type="button" class="btn btn-primary btn-sm fileUp fileUpBtn_' + fileArr[m].ftype + '" id="fileUp_' + fileArr[m].ftype + '" data-name="' + fileArr[m].name + '" data-ftype="' + fileArr[m].ftype + '" data-id="">上传</button></div>';
		html += '<div class="progress_cont" id="fileUp_' + fileArr[m].ftype + '"></div>';
		html += '<div class="file_cont" id="fileList_' + fileArr[m].ftype + '"></div>';
		html += '</td>';
		html += '</tr>';
	}
	$('.supplier-box').after(html);
	getPushInfo();


	//关闭当前窗口
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	$('#btn_submit').click(function () {

		if ($('#fileList_42').html() == '') {
			parent.layer.alert('必须上传中标候选人推荐表')
			return;
		} else if ($('#fileList_43').html() == '') {
			parent.layer.alert('必须上传中标人报价盖章件')
			return;
		}

		$.ajax({
			type: "post",
			url: pushUrl,
			async: true,
			data: {
				'id': pushId
			},
			success: function (data) {
				if (data.success) {
					parent.layer.alert('推送成功！')
				} else {
					parent.layer.alert(data.message)
				}
			}
		});
	});
	//下载
	$('body').on('click', '.btn_load', function () {
		var path = $(this).attr('data_url');
		var name = $(this).attr('data_name');
		/*name = name.substring(0, name.lastIndexOf("."));*/
		var loadUrl = dowoloadFileUrl + '?Token=' + token + '&ftpPath=' + path + '&fname=' + name.replace(/\s+/g, "");
		window.location.href = encodeURI(loadUrl);
	});
	//移除btnDel
	$('body').on('click', '.btnDel', function () {
		var tr = $(this).closest('.file_cont').find('.keep');
		var id = $(this).closest('.file_cont').prop('id');
		var index = $(this).closest('.keep').prevAll().length;
		var delId = $(this).attr('data-file');
		top.layer.confirm('确定删除该文件?', { icon: 3, title: '提示' }, function (ind) {
			//do something
			var arr = [];
			for (var i = 0; i < tr.length; i++) {
				var obj = {};
				obj.name = $(tr[i]).attr('data-name');
				obj.ftpPath = $(tr[i]).attr('data-url');
				obj.id = $(tr[i]).attr('data-id');
				arr.push(obj)
			};
			arr.splice(index, 1);
			var html = '';
			for (var j = 0; j < arr.length; j++) {
				html += '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + arr[j].ftpPath + '" data-name="' + arr[j].name + '" data-id="' + arr[j].id + '">';
				html += '<div style="margin-right:30px;float:left;">' + arr[j].name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + arr[j].ftpPath + '" data_name="' + arr[j].name + '">下载</a>';
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + arr[j].id + '">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
			}
			$('#' + id).html(html);
			delFile(delId);
			top.layer.close(ind);
		});
	})

});

function passMessage(data, refresh) {

}
function passMessage(data) {

}
/*
 * 获取推送数据
 * */
function getPushInfo() {
	// loadMaskIndex = parent.layer.msg('页面数据处理中,请稍候...', {
	// 	icon: 16,
	// 	// shade: 0.2,
	// 	time: false
	// });
	$.ajax({
		type: "post",
		url: getInfoUrl,
		async: true,
		data: {
			'packageId': packageId,
			//			'projectId': projectId
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			loadMaskIndex = parent.layer.msg('页面数据处理中,请稍候...', {
				icon: 16,
				shade: 0.3,
				time: false
			});
		},
		success: function (data) {
			parent.layer.close(loadMaskIndex);
			if (data.success) {
				var res = data.data;
				pushId = res.id;
				for (var key in res) {
					$('#' + key).html(res[key]);
				}
				//答疑记录
				if (res.ansRecord) {
					$('#answerList').html(res.ansRecord);
				}
				//评审答疑记录
				if (res.priceNegotiationRecord) {
					$('#clarifyList').html(res.priceNegotiationRecord);
				}
				if (res.selSupplier && res.selSupplier.length > 0) {
					supplierHtml(res.selSupplier);
				}
				if (res.deliveryFiles && res.deliveryFiles.length > 0) {
					fileArr = res.deliveryFiles;
					fileHtml(fileArr);
				}
				if (res.dataType == 1 || res.dataType == 2) {
					$('#btn_submit').html('再次推送');
				}
				// 页面数据导入成功后初始化上传按钮
				for (var i = 0; i < $('.fileUp').length; i++) {
					var eleSlect = $('.fileUp').eq(i).prop('id');
					var eleCont = $('.fileUp').eq(i).closest('.file_iterm').next().prop('id');
					var fileCont = $('.fileUp').eq(i).closest('.file_iterm').nextAll('.file_cont').prop('id')
					var name = $('.fileUp').eq(i).attr('data-name');
					var ftype = $('.fileUp').eq(i).attr('data-ftype');
					var supplierId = $('.fileUp').eq(i).attr('data-id');
					fileUpload(eleSlect, eleCont, fileCont, pushId, name, ftype, supplierId);
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}

/*
 * 候选供应商
 * 
 */
function supplierHtml(data) {
	$('#supplierList').html('');
	var html = '';
	html += '<table class="table table-bordered">';
	html += '<thead>';
	html += '<tr>';
	html += '<th style="width: 50px;text-align: center;">序号</th>';
	html += '<th style="width: 200px;">供应商名称</th>';
	html += '<th style="width: 150px;text-align: center;">社会信用代码</th>';
	//				html += '<th style="width: 120px;text-align: center;">技术评价结果</th>';
	html += '<th style="width: 150px;text-align: center;">报价金额（元）</th>';
	html += '<th style="width: 150px;text-align: center;">是否为中标供应商</th>';
	html += '<th style="width: 150px;text-align: center;">中标金额（元）</th>';
	//				html += '<th style="width: 150px;">技术方案</th>';
	//				html += '<th style="width: 150px;">报价文件</th>';
	html += '<th style="width: 150px;">中/结果通知书</th>';
	//				html += '<th style="width: 150px;">落标通知书</th>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';
	for (var i = 0; i < data.length; i++) {
		html += '<tr>';
		html += '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>';
		html += '<td style="width: 200px;">' + data[i].supplierName + '</td>';
		html += '<td style="width: 150px;text-align: center;">' + data[i].socialCreditcode + '</td>';
		html += '<td style="width: 150px;text-align: center;">' + (data[i].openPrice?data[i].openPrice:"/") + '</td>';
		html += '<td style="width: 150px;text-align: center;">' + (data[i].isWin == 1 ? "是" : "否") + '</td>';
		html += '<td style="width: 150px;text-align: center;">' + (data[i].isWin == 1 ? (data[i].winPrice?data[i].winPrice:"/") : "/") + '</td>';
		html += '<td style="width: 150px;">';

		html += '<div class="progress_cont" id="fileListUp_' + (data[i].isWin == 1 ? "23" : "24") + '_' + i + '"></div>'

		var btn_up21 = '';
		btn_up21 += '<div class="file_iterm" style="text-align: right;"><button type="button" class="btn btn-primary btn-sm fileUp fileUpBtn_21_' + i + '" id="fileUp_21_' + i + '" data-name="技术方案" data-ftype="21" data-id="' + data[i].supplierId + '">上传技术方案</button></div>';
		btn_up21 += '<div class="progress_cont" id="fileUp_21_' + i + '"></div>';
		btn_up21 += '<div class="file_cont" id="fileList_21_' + i + '">';

		var btn_notice = '';
		btn_notice += '<div class="file_iterm" style="text-align: right;"><button type="button" class="btn btn-primary btn-sm fileUp fileUpBtn_' + (data[i].isWin == 1 ? "23" : "24") + '_' + i + '" id="fileUp_' + (data[i].isWin == 1 ? "23" : "24") + '_' + i + '" data-name="' + (data[i].isWin == 1 ? "中标通知书" : "结果通知书") + '" data-ftype="' + (data[i].isWin == 1 ? "23" : "24") + '" data-id="' + data[i].supplierId + '">上传' + (data[i].isWin == 1 ? "中标通知书" : "结果通知书") + '</button></div>';
		btn_notice += '<div class="progress_cont" id="fileUp_' + (data[i].isWin == 1 ? "23" : "24") + '_' + i + '"></div>';
		btn_notice += '<div class="file_cont" id="fileList_' + (data[i].isWin == 1 ? "23" : "24") + '_' + i + '">';

		html += btn_up21;
		if (data[i].attachments && data[i].attachments.length > 0) {
			for (var j = 0; j < data[i].attachments.length; j++) {
				if (data[i].attachments[j].ftype == '21') {
					html += '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + data[i].attachments[j].ftpPath + '" data-name="' + data[i].attachments[j].name + '" data-id="' + data[i].attachments[j].id + '">';
					html += '<div style="margin-right:30px;float:left;">' + data[i].attachments[j].name + '</div>'
					html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].attachments[j].ftpPath + '" data_name="' + data[i].attachments[j].name + '">下载</a>';
					html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + data[i].attachments[j].id + '">移除</a></div>'
					html += '<div style="clear:both;"></div></div>';
				}
			}
		}
		html += '</div >';

		html += btn_notice;
		if (data[i].attachments && data[i].attachments.length > 0) {
			for (var j = 0; j < data[i].attachments.length; j++) {
				if (data[i].attachments[j].ftype == '23' || data[i].attachments[j].ftype == '24') {
					html += '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + data[i].attachments[j].ftpPath + '" data-name="' + data[i].attachments[j].name + '" data-id="' + data[i].attachments[j].id + '">';
					html += '<div style="margin-right:30px;float:left;">' + data[i].attachments[j].name + '</div>'
					html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].attachments[j].ftpPath + '" data_name="' + data[i].attachments[j].name + '">下载</a>';
					html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + data[i].attachments[j].id + '">移除</a></div>'
					html += '<div style="clear:both;"></div></div>';
				}
			}
		}
		html += '</div >';
		html += '</td>';
		html += '</tr>';

	}
	html += '</tbody></table>';
	$(html).appendTo('#supplierList');
}
function fileHtml(data) {
	for (var i = 0; i < data.length; i++) {
		if (data[i].ftype == 21 || data[i].ftype == 23 || data[i].ftype == 24) {
			continue;
		}
		if (data[i].supplierId != 'undefined' && data[i].supplierId) {
			var html1 = '';
			html1 += '<div>' + data[i].name + '</div>';
			$(html1).appendTo('.bidder_' + data[i].ftype + '_' + data[i].supplierId);
		} else {
			var html = '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + data[i].ftpPath + '" data-name="' + data[i].name + '" data-id="' + data[i].id + '">';
			html += '<div style="margin-right:30px;float:left;">' + data[i].name + '</div>'
			html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].ftpPath + '" data_name="' + data[i].name + '">下载</a>';
			/*if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
				html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
			}*/
			html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + data[i].id + '">移除</a></div>'
			html += '<div style="clear:both;"></div></div>';
			$(html).appendTo('#fileList_' + data[i].ftype)
		}
	}


}
/*//下载
$('#fileList').on('click','.btn_down',function(){
	var index = $(this).attr('data-index');
	var newUrl =dowoloadFileUrl + '?ftpPath=' + fileArr[index].ftpPath + '&fname=' + fileArr[index].name+'&Token='+token;
	window.location.href = encodeURI(newUrl);
});*/
//预览
$('#fileList').on('click', '.btn_view', function () {
	var index = $(this).attr('data-index');
	previewPdf(fileArr[index].ftpPath);
	/*top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		btn: ["关闭"],
		maxmin: false,
		resize: false,
		title: "预览",
		content: top.config.FileHost + "/FileController/fileView.do?ftpPath=" + fileArr[index].ftpPath + '&Token=' + token
	})*/
});

function fileUpload(eleSlect, eleCont, fileCont, id, name, ftype, supplierId) {

	var config = {
		multipleFiles: false, /** 多个文件一起上传, 默认: false */
		swfURL: "/swf/FlashUploader.swf", /** SWF文件的位置 */
		//  	tokenURL : "/tk", /** 根据文件名、大小等信息获取Token的URI（用于生成断点续传、跨域的令牌） */
		frmUploadURL: flashFileUrl, /** Flash上传的URI */
		filesQueueHeight: 0, /** 文件上传容器的高度（px）, 默认: 450 */
		messagerId: '',//显示消息元素ID(customered=false时有效)
		uploadURL: fileUrl, /** HTML5上传的URI */
		browseFileId: eleSlect,//文件选择DIV的ID
		filesQueueId: eleCont,//文件显示容器的ID(customered=false时有效)
		autoUploading: true,//选择文件后是否自动上传
		autoRemoveCompleted: true,//文件上传后是否移除
		//	    extFilters: ['.pdf','.PDF','.doc','.docx'],
		postVarsPerFile: {
			//自定义文件保存路径前缀
			Token: $.getToken(),
			basePath: "/" + registerInfo.enterpriseId + "/" + packageId + "/" + id + "/702"
		},
		onSelect: function (list) {
			parent.loadMaskIndex = parent.layer.msg('文件数据上传中,请勿离开当前页面或刷新.', {
				icon: 16,
				shade: 0.2,
				time: false
			});
			console.log(list)
		},
		onRepeatedFile: function (file) {
			parent.layer.alert("文件： " + file.name + " 已存在于上传队列中，请勿重复上传！")
			//		  console.log("文件： " + file.name
			//		   + " 大小：" + file.size + "已存在于上传队列中");
			return false;
		},
		onComplete: function (file) {
			var path = JSON.parse(file.msg).data.filePath;
			var obj = {
				'ftpUrl': path,
				'fileName': file.name,
				'id': id,
				'name': name,
				'fType': ftype
			}
			if (supplierId && supplierId != '') {
				obj["supplierId"] = supplierId
			}
			parent.layer.close(loadMaskIndex);
			saveFile(obj, { 'supplierId': supplierId, 'name': name, 'fileCont': fileCont });
			// console.log(filedatas)

			// var html = '<div class="keep" style="margin-bottom:10px;margin-top:10px;"  data-url="' + filedatas.ftpPath + '" data-name="' + filedatas.name + '" data-id="' + filedatas.id + '">';
			// html += '<div style="margin-right:30px;float:left;">' + ((supplierId && supplierId != "") ? name : filedatas.name) + '</div>'
			// html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + filedatas.ftpPath + '" data_name="' + ((supplierId && supplierId != "") ? name : filedatas.name) + '">下载</a>';
			// /*if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
			// 	html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
			// }*/
			// html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + filedatas.id + '">移除</a></div>'
			// html += '<div style="clear:both;"></div></div>';
			// if (supplierId && supplierId != '') {
			// 	$('#' + fileCont).html(html);
			// } else {
			// 	$(html).appendTo('#' + fileCont);
			// }
		}
	};

	var _t = new Stream(config);
}
function saveFile(obj, elseDatas) {
	var filedatas = '';
	$.ajax({
		type: "post",
		url: fileUpUrl,
		async: true,
		data: obj,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			loadMaskIndex = parent.layer.msg('文件数据上传成功,正在处理数据,请稍候...', {
				icon: 16,
				shade: 0.3,
				time: false
			});
		},
		success: function (res) {
			parent.layer.close(loadMaskIndex);
			if (!res.success) {
				top.layer.alert(res.message)
			} else {
				layer.msg('文件上传成功');
				filedatas = res.data;
				var html = '<div class="keep" style="margin-bottom:10px;margin-top:10px;"  data-url="' + filedatas.ftpPath + '" data-name="' + filedatas.name + '" data-id="' + filedatas.id + '">';
				html += '<div style="margin-right:30px;float:left;">' + filedatas.name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + filedatas.ftpPath + '" data_name="' + ((elseDatas.supplierId && elseDatas.supplierId != "") ? elseDatas.name : filedatas.name) + '">下载</a>';
				/*if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
					html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
				}*/
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + filedatas.id + '">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
				// if (elseDatas.supplierId && elseDatas.supplierId != '') {
				// 	$('#' + elseDatas.fileCont).html(html);
				// } else {
				$(html).appendTo('#' + elseDatas.fileCont);
				// }
			}
		}
	});
	// return datas
}
//删除
function delFile(id) {
	$.ajax({
		type: "post",
		url: delUrl,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (!data.success) {
				top.layer.alert(data.message)
			} else {
				top.layer.alert('删除成功！')
			}
		}
	});
}
