var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件

var setUrl1 = config.tenderHost + "/GDDataController/autoArchive.do";//自动生成PDF,随systemType变化
var setUrl2 = config.offlineHost + "/OfflineGDDataController/autoArchive";//自动生成PDF,随systemType变化
var guiUrl1 = config.tenderHost + "/GDDataController/findGDDataInfo.do";//根据归档id获取归档详情,随systemType变化
var guiUrl2 = config.offlineHost + "/OfflineGDDataController/findGDDataInfo";//根据归档id获取归档详情,随systemType变化
var saveUrl1 = config.tenderHost + "/GDDataController/saveArchiveChang.do";//保存
var saveUrl2 = config.offlineHost + "/OfflineGDDataController/saveArchiveChang"; // 保存
var fileDownloadUrl1 = config.tenderHost + "/GDDataController/downloadFile.do";//一键打包下载
var fileDownloadUrl2 = config.offlineHost + "/OfflineGDDataController/downloadFile"; // 一键打包下载

var examType = '';//资格审查方式  1预审  2 后审
var tenderMode = '';//招标方式 1公开 2 邀请
var bidSectionId = '';//标段id
var projectId = '';//项目id
var dataId = '';//归档id
var registerInfo = entryInfo();
var systemType = 1;//数据来源于那个系统，1.BiddingService，2.OfflineBiddingService
var gdBackType = '';
$(function () {
	var processPub = [
		{ 'name': '基本信息', 'stage': 'total' },
		{ 'name': '招标委托合同', 'stage': 'total', 'isEnd': '1' }
	];
	var processPre = [
		{ 'name': '资格预审公告信息', 'stage': 'pretrial' },
		{ 'name': '资格预审文件信息', 'stage': 'pretrial' },
		//		{'name': '报名信息','stage': 'pretrial'},
		{ 'name': '资格预审文件购买信息', 'stage': 'pretrial' },
		{ 'name': '递交资格申请信息', 'stage': 'pretrial' },
		{ 'name': '资格申请文件信息', 'stage': 'pretrial' },
		//		{'name': '落选的投标人递交的资格申请文件','stage': 'pretrial'},
		{ 'name': '递交资格申请文件回执信息', 'stage': 'pretrial' },
		{ 'name': '资格预审文件开启', 'stage': 'pretrial' },
		//		{'name': '资格预审评委抽取记录','stage': 'pretrial'},
		{ 'name': '资格审查评审设置信息', 'stage': 'pretrial' },
		{ 'name': '资格审查评审委员信息（含抽取历史）', 'stage': 'pretrial' },
		{ 'name': '资格审查评标专家承诺书', 'stage': 'pretrial' },
		{ 'name': '资格审查评审报告信息', 'stage': 'pretrial' },
		{ 'name': '资格审查查重报告信息', 'stage': 'pretrial' },
		{ 'name': '资格审查评审澄清信息', 'stage': 'pretrial' },
		{ 'name': '资格审查结果（正文及公示）', 'stage': 'pretrial' },
		{ 'name': '资格审查结果通知', 'stage': 'pretrial' }
	];
	var processTrial = [
		{ 'name': '保证金递交情况信息', 'stage': 'trial' },
		{ 'name': '邀请函信息', 'stage': 'trial' },
		{ 'name': '招标文件信息', 'stage': 'trial' },
		{ 'name': '招标控制价信息', 'stage': 'trial' },
		{ 'name': '答疑会信息', 'stage': 'trial' },
		{ 'name': '答疑澄清信息', 'stage': 'trial' },
		{ 'name': '招标文件购买信息', 'stage': 'trial' },
		{ 'name': '投标文件递交情况信息', 'stage': 'trial' },
		{ 'name': '投标文件递交回执信息', 'stage': 'trial' },
		{ 'name': '投标文件信息', 'stage': 'trial' },
		//		{'name': '投标文件信息（落标人的投标文件）','stage': 'trial'},
		{ 'name': '开标信息', 'stage': 'trial' },
		{ 'name': '评审设置信息', 'stage': 'trial' },
		{ 'name': '评审委员信息（含抽取历史）', 'stage': 'trial' },
		{ 'name': '评标专家承诺书信息', 'stage': 'trial' },
		{ 'name': '清标资料信息', 'stage': 'trial' },
		{ 'name': '评审报告信息', 'stage': 'trial' },
		{ 'name': '评审查重报告信息', 'stage': 'trial' },
		{ 'name': '评审澄清信息', 'stage': 'trial' },
		{ 'name': '异议管理信息', 'stage': 'trial' },
		{ 'name': '中标候选人公示信息', 'stage': 'trial' },
		{ 'name': '中标结果公告信息', 'stage': 'trial' },
		{ 'name': '中标结果通知书信息', 'stage': 'trial' },
		{ 'name': '落标结果通知书信息', 'stage': 'trial' },
		//		{'name': '中标合同备案信息','stage': 'trial'},
		{ 'name': '招标异常信息', 'stage': 'trial' },
		{ 'name': '企业名称变更信息', 'stage': 'trial' },
		{ 'name': '其他资料', 'stage': 'trial' },
	];
	//数据来源于那个系统，1.BiddingService，2.OfflineBiddingService
	systemType = $.getUrlParam('systemType');

	//资格审查方式  1预审  2 后审
	examType = $.getUrlParam('examType');
	//招标方式 1公开 2 邀请
	tenderMode = $.getUrlParam('tenderMode');

	bidSectionId = $.getUrlParam('bidSectionId');
	projectId = $.getUrlParam('projectId');
	if ($.getUrlParam('id') && $.getUrlParam('id') != undefined) {
		dataId = $.getUrlParam('id');
	}
	/* 退回申请 */
	if (dataId) {
		$('.show_fallback').show();
		// var backType = type == 'edit'?'2':'1';
		rollBack('1', 'view_fallback', dataId, 'zlgdth')
	} else {
		$('.show_fallback').hide();
	}
	//查看退回历史
	$('#backHistoryList').click(function (event) {
		event.stopPropagation();
		openHistory(dataId, 'zlgdth')
	});

	/* 退回申请   -- end */
	if (examType == 2) {
		$('.pretrial').hide();
		if (tenderMode == 1) {
			processTrial.splice(1, 1, { 'name': '招标公告信息', 'stage': 'trial' })
		}
	} else if (examType == 1) {
		$('.pretrial').show();
	}
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: dataId,
		status: 1,
		//type: "gdsp",
		enterpriseId: '82843a905ce7474c8fffea2714947b36',
		type: 'zlgd'
	});
	var htmlZ = '';
	var htmlY = '';
	var htmlH = '';

	for (var m = 0; m < processPub.length; m++) {
		htmlZ += '<div class="file_iterm iterm_box' + m + '" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
			+ '<div style="margin-bottom:10px;">'
			+ '<span class="project_name" data_name="' + processPub[m].name + '" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">' + processPub[m].name + '：</span>'
			+ '<span><a href="javascript: void(0);" class="fileUp" data-total="' + m + '" id="fileUp_' + m + '" style="display:inline;font-size:16px;">上传文件</a></span>'
			+ '</div>'
			+ '<div class="row contant_' + m + '">'

			+ '</div>'
			+ '<div class="progress_cont" id="fileContent_' + m + '"></div>'
			+ '</div>'
	}
	for (var l = 0; l < processPre.length; l++) {
		htmlY += '<div class="file_iterm iterm_box' + (processPub.length + l) + '" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
			+ '<div style="margin-bottom:10px;">'
			+ '<span class="project_name" data_name="' + processPre[l].name + '" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">' + processPre[l].name + '：</span>'
			+ '<span><a href="javascript: void(0);" class="fileUp" data-total="' + (processPub.length + l) + '" id="fileUp_' + (processPub.length + l) + '" style="display:inline;font-size:16px;">上传文件</a></span>'
			+ '</div>'
			+ '<div class="row contant_' + (processPub.length + l) + '">'

			+ '</div>'
			+ '<div class="progress_cont" id="fileContent_' + (processPub.length + l) + '"></div>'
			+ '</div>'
	}
	for (var n = 0; n < processTrial.length; n++) {
		htmlH += '<div class="file_iterm iterm_box' + (processPub.length + processPre.length + n) + '" style="margin-bottom:30px;padding:10px 30px;box-shadow: 0 2px 5px #DDDDDD;">'
			+ '<div style="margin-bottom:10px;">'
			+ '<span class="project_name" data_name="' + processTrial[n].name + '" style="display:inline-block;padding:0 0 5px 5px;border-left:2px solid #3995C8;border-bottom:2px solid #3995C8;margin-right:30px;font-weight:600;">' + processTrial[n].name + '：</span>'
			+ '<span><a href="javascript: void(0);" class="fileUp" data-total="' + (processPub.length + processPre.length + n) + '" id="fileUp_' + (processPub.length + processPre.length + n) + '" style="display:inline;font-size:16px;">上传文件</a></span>'
			+ '</div>'
			+ '<div class="row contant_' + (processPub.length + processPre.length + n) + '">'

			+ '</div>'
			+ '<div class="progress_cont" id="fileContent_' + (processPub.length + processPre.length + n) + '"></div>'
			+ '</div>'
	}
	//	$(htmlZ).appendTo('.wrapPublic');
	$('.wrapPublic').html(htmlZ);
	$('.wrapPre').html(htmlY);
	$('.wrapTrial').html(htmlH);


	//关闭
	$('html').on('click', '#btnClose', function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	})
	//if(dataId && dataId != ''){
	//	getDetail(dataId)

	//}else{
	setPdf();
	//}
	//保存
	$('#btnSave').click(function () {
		save();
	});
	//提交审核
	$('#btnSubmit').click(function () {
		save(1);
	});
	//预览
	$('body').on('click', '.btn_view', function () {
		var path = $(this).attr('data_url');
		//	openPreview(path,'1000px','600px');
		previewPdf(path)
	});
	//下载
	$('body').on('click', '.btn_load', function () {
		var path = $(this).attr('data_url');
		var name = $(this).attr('data_name');
		name = name.substring(0, name.lastIndexOf("."));
		var loadUrl = downloadFileUrl + '?ftpPath=' + path + '&fname=' + name.replace(/\s+/g, "");
		window.location.href = $.parserUrlForToken(loadUrl);
	});

	//移除btnDel
	$('body').on('click', '.btnDel', function () {
		var arr = [];
		var tr = $(this).closest('.row').find('.keep');
		var num = $(this).attr('data-index');
		var index = $(this).closest('.keep').prevAll().length;
		for (var i = 0; i < tr.length; i++) {
			var obj = {};
			obj.projectDataId = dataId;
			obj.projectStage = $(tr[i]).attr('data_stage');
			obj.fileType = $(tr[i]).attr('data_type');
			obj.fileName = $(tr[i]).attr('data_name');
			obj.fileUrl = $(tr[i]).attr('data_url');
			arr.push(obj)
		};
		arr.splice(index, 1);
		var html = '';
		for (var j = 0; j < arr.length; j++) {
			var type = arr[j].fileUrl.split('.')[1];
			html += '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="' + arr[j].fileUrl + '" data_id="' + arr[j].projectDataId + '" data_stage="' + arr[j].projectStage + '" data_type="' + arr[j].fileType + '" data_name="' + arr[j].fileName + '">';
			html += '<div style="margin-right:30px;float:left;">' + arr[j].fileName + '</div>'
			html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + arr[j].fileUrl + '" data_name="' + arr[j].fileName + '">下载</a>';
			if (type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG') {
				html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="' + arr[j].fileUrl + '">预览</a>'
			}
			if ((gdBackType == 1 && arr[j].fileType == 3) || (gdBackType == 2 && arr[j].fileType == 1) || (gdBackType == '' && arr[j].fileType == 1)) {
				// if(arr[j].fileType == 1){
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel remove_' + num + '" data-index="' + num + '">移除</a>'
			}
			html += '</div><div style="clear:both;"></div></div>'


			//			html += '<tr class="keep" data_url="'+arr[j].fileUrl+'" data_id="'+arr[j].projectDataId+'" data_stage="'+arr[j].projectStage+'" data_type="'+arr[j].fileType+'" data_name="'+arr[j].fileName+'">'
			//  			html += '<td style="width: 50px;text-align: center;">'+(j+1)+'</td>'
			//  			html += '<td>'+arr[j].fileName+'</td>'
			//  			html += '<td style="width: 230px;text-align: left;">'
			//  				html += '<button type="button" class="btn btn-sm btn-primary btn_load" data_url="'+arr[j].fileUrl+'" data_name="'+arr[j].fileName+'"><span class="glyphicon glyphicon-arrow-down"></span>下载</button>';
			//  				if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
			//  					html += '<button type="button" class="btn btn-sm btn-primary btn_view" data_url="'+arr[j].fileUrl+'"><span class="glyphicon glyphicon-eye-open"></span>预览</button>'
			//  				}
			//  				if(arr[j].fileType == 1){
			//  					html += '<button type="button" class="btn btn-danger btn-sm btnDel remove_'+num+'" data-index="'+num+'"><span class="glyphicon glyphicon-remove"></span>移除</button>'	
			//  				}
			//  			html += '</td>'
			//  		html += '</tr>'
		}
		$('.contant_' + num).html(html);
	})

	//打包下载
	$("#btnPack").click(function () {
		var url = systemType == 1 ? fileDownloadUrl1 : fileDownloadUrl2;
		$(this).attr('href', $.parserUrlForToken(url + '?gdId=' + dataId));
	});

});
//根据标段id查询归档id
function setPdf() {
	$.ajax({
		type: "post",
		url: systemType == 1 ? setUrl1 : setUrl2,
		async: true,
		data: {
			'projectId': projectId,
			'bidSectionId': bidSectionId,
			'examType': examType
		},
		success: function (data) {
			if (data.success) {
				dataId = data.data;
				parent.$('#DataFilingTable').bootstrapTable('refresh');
				getDetail(dataId)
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
//根据归档id获取归档详情
function getDetail(id) {
	$.ajax({
		type: "post",
		url: systemType == 1 ? guiUrl1 : guiUrl2,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				if (data.data.gdProjectDataFiles) {
					var sourse = data.data.gdProjectDataFiles;
					fileTables(sourse)
				}
				$('#bidSectionName').html(data.data.bidSectionName);
				$('#interiorBidSectionCode').html(data.data.interiorBidSectionCode);
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
	for (var i = 0; i < $('.fileUp').length; i++) {
		var eleSlect = $('.fileUp').eq(i).prop('id');
		var eleCont = $('.fileUp').eq(i).closest('.file_iterm').find('.progress_cont').prop('id');
		//项目类型
		var stage = $('.fileUp').eq(i).closest('.file_iterm').find('.project_name').html().split('：')[0];
		fileUpload(eleSlect, eleCont, id, i, stage);
	}
}
function fileUpload(eleSlect, eleCont, id, index, stage) {
	var config = {
		multipleFiles: true, /** 多个文件一起上传, 默认: false */
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
			basePath: "/" + registerInfo.enterpriseId + "/" + bidSectionId + "/" + id + "/701"
		},
		onRepeatedFile: function (file) {
			parent.layer.alert("文件： " + file.name + " 已存在于上传队列中，请勿重复上传！")
			//		  console.log("文件： " + file.name
			//		   + " 大小：" + file.size + "已存在于上传队列中");
			return flase;
		},
		onComplete: function (file) {
			var path = JSON.parse(file.msg).data.filePath;
			var type = path.split('.')[1];
			var html = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="' + path + '" data_id="' + id + '" data_stage="' + stage + '" data_type="' + (gdBackType == 1 ? "3" : "1") + '" data_name="' + file.name + '">';
			html += '<div style="margin-right:30px;float:left;">' + file.name + '</div>'
			html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + path + '" data_name="' + file.name + '">下载</a>';
			if (type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG') {
				html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="' + path + '">预览</a>'
			}
			html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel remove_' + index + '" data-index="' + index + '">移除</a></div>'
			html += '<div style="clear:both;"></div></div>';
			$('.contant_' + index).append(html)
		}
	};
	var _t = new Stream(config);
}
//保存
function save(statu) {
	var saveDate = {};

	if (statu) {
		saveDate.isSubmit = 1
	}
	saveDate.id = dataId;
	if ($('[name=checkerId]').length > 0) {
		saveDate.checkerIds = $('[name=checkerId]').val();
		if (statu == 1 && saveDate.checkerIds.length == 0) {
			parent.layer.alert('请选择审批人！');
			return;
		}
	}
	var arr = [];
	for (var i = 0; i < $('.keep').length; i++) {
		var obj = {};
		obj.projectDataId = dataId;
		obj.projectStage = $('.keep').eq(i).attr('data_stage');
		obj.fileType = $('.keep').eq(i).attr('data_type');
		obj.fileName = $('.keep').eq(i).attr('data_name');
		obj.fileUrl = $('.keep').eq(i).attr('data_url');
		obj.id = $('.keep').eq(i).attr('data-fileid');
		arr.push(obj);
	};
	saveDate.gdProjectDataFiles = arr;
	$.ajax({
		type: "post",
		url: systemType == 1 ? saveUrl1 : saveUrl2,
		async: true,
		data: saveDate,
		success: function (data) {
			if (data.success) {
				if (statu) {
					parent.layer.alert('提交审核成功');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				} else {
					parent.layer.alert('保存成功')
				}
				parent.$('#DataFilingTable').bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message)
			}
		},
	});
}

function fileTables(data) {
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < $('.file_iterm').length; j++) {
			var stage = $('.file_iterm').eq(j).find('.project_name').attr('data_name');
			if (data[i].projectStage == stage) {
				var type = data[i].fileUrl.split('.')[1];
				var html = '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 keep" style="margin-bottom:20px;" data_url="' + data[i].fileUrl + '" data-fileid="' + (data[i].id ? data[i].id : "") + '" data_id="' + data[i].projectDataId + '" data_stage="' + data[i].projectStage + '" data_type="' + data[i].fileType + '" data_name="' + data[i].fileName + '">';
				html += '<div style="margin-right:30px;float:left;">' + data[i].fileName + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].fileUrl + '" data_name="' + data[i].fileName + '">下载</a>';
				if (type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG') {
					html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="' + data[i].fileUrl + '">预览</a>'
				}
				if ((gdBackType == 1 && data[i].fileType == 3) || (gdBackType == 2 && data[i].fileType == 1) || (gdBackType == '' && data[i].fileType == 1)) {
					// if(data[i].fileType == 1){
					html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel remove_' + j + '" data-index="' + j + '">移除</a>'
				}
				html += '</div>'
				html += '<div style="clear:both;"></div></div>';
				$('.file_iterm').eq(j).find('.row').append(html)

			}
		}
	}
}


//pdf预览
/* function openPreview(pdfPath){
	var suffix = pdfPath ? pdfPath.substring(pdfPath.lastIndexOf(".")) : "";
	if(suffix == ".pdf" || suffix == ".PDF"){
		var temp = top.layer.open({
			type: 2,
			title: "预览 ",
			area: ['100%','100%'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			btn:["关闭"],
			content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
			yes:function(index,layero){
				top.layer.close(index);
			}
		});
		top.layer.full(temp);
	}
} */

//pdf预览
function previewPdf(pdfPath) {
	var suffix = pdfPath ? pdfPath.substring(pdfPath.lastIndexOf(".")) : "";
	if (suffix == ".pdf" || suffix == ".PDF") {
		viewPdf(pdfPath);
	} else {
		var src = $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath);
		viewImage(src);
	}

}
//查看pdf
function viewPdf(pdfPath) {
	var temp = top.layer.open({
		type: 2,
		title: "预览 ",
		area: ['100%', '100%'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		btn: ["关闭"],
		content: $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + pdfPath),
		yes: function (index, layero) {
			top.layer.close(index);
		}
	});

	top.layer.full(temp);
}
/***
 * 预览图片
 * @param {Object} pdfPath  图片地址
 */
function viewImage(pdfPath) {
	var url = '<div style="position:fixed;left:0;right:0;top:0;bottom:0;background-color:rgba(0,0,0,0.7);z-index:29891021 !important;" id="mask-dialog">'
		+ '<div style="position:fixed;left:0;right:0;top:0;bottom:0;" id="mask-bg"></div>'
		+ '	<img id="mask-img" src="' + pdfPath + '" style="display:block;position:absolute;cursor:move;">'
		+ '	<div style="position:fixed;bottom:10px;text-align:center;width:100%;" id="mask-btn">'
		+ '		<button id="mask-zoomOut" class="glyphicon glyphicon-zoom-out" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
		+ '		<button id="mask-zoomIn" class="glyphicon glyphicon-zoom-in" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
		+ '		<button id="mask-rotate" class="glyphicon glyphicon-repeat" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
		+ '		<button id="mask-close" class="glyphicon glyphicon-remove" style="cursor:pointer;font-size:22px;padding:10px;color:#fff;background-color: rgba(9,7,35,0.9);border:0;border-radius:4px;"></button>'
		+ '	</div>'
		+ '</div>';
	top.$("body").append(url);

	top.$("#mask-bg, #mask-close").click(function () {
		top.$("#mask-dialog").remove();
	});
	top.document.getElementById('mask-img').onmousewheel = function (event) {
		if (event.wheelDelta < 0) {
			zoom_n -= 0.1;
			if (zoom_n <= 0.1) {
				zoom_n = 0.1;
			}
			transformImg();
		} else {
			zoom_n += 0.1;
		}
		transformImg();
	}
	top.document.getElementById('mask-img').onload = function () {
		//图片居中显示
		var box_width = top.$("#mask-dialog").width(); //图片盒子宽度
		var box_height = top.$("#mask-dialog").height();//图片盒子高度
		var initial_width = top.$("#mask-img").width();//初始图片宽度
		var initial_height = top.$("#mask-img").height();//初始图片高度

		if (initial_width > initial_height) {
			if (initial_width > box_width) {
				top.$("#mask-img").css("width", box_width);
			}
			var last_imgHeight = top.$("#mask-img").height();
		} else {
			if (initial_height > box_height) {
				top.$("#mask-img").css("height", box_height);
			}
			var last_imgWidth = top.$("#mask-img").width();
		}
		var imgH = top.$("#mask-img").height() / 2;
		var imgW = top.$("#mask-img").width() / 2;
		top.$("#mask-img").css({ "margin-left": -imgW, "margin-top": -imgH, "left": "50%", "top": "50%" });
		//	    top.$("#mask-img").css("margin-top", -imgH);
	}

	//图片拖拽
	var $div_img = top.$("#mask-img");
	//绑定鼠标左键按住事件
	$div_img.bind("mousedown", function (event) {
		event.preventDefault && event.preventDefault(); //去掉图片拖动响应
		//获取需要拖动节点的坐标
		var offset_x = $(this)[0].offsetLeft;//x坐标
		var offset_y = $(this)[0].offsetTop;//y坐标
		//获取当前鼠标的坐标
		var mouse_x = event.pageX;
		var mouse_y = event.pageY;
		//绑定拖动事件
		//由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素
		top.$("#mask-dialog").bind("mousemove", function (ev) {
			// 计算鼠标移动了的位置
			var _x = ev.pageX - mouse_x;
			var _y = ev.pageY - mouse_y;
			//设置移动后的元素坐标
			var now_x = (offset_x + _x) + "px";
			var now_y = (offset_y + _y) + "px";
			//改变目标元素的位置
			$div_img.css({
				top: now_y,
				left: now_x,
				marginTop: 0,
				marginLeft: 0
			});
		});
	});
	//当鼠标左键松开，接触事件绑定
	top.$("#mask-dialog").bind("mouseup", function () {
		top.$("#mask-dialog").unbind("mousemove");
	});
	//放大缩小
	var zoom_n = 1;
	top.$("#mask-zoomIn").click(function () { //放大
		zoom_n += 0.1;
		transformImg();
	});
	top.$("#mask-zoomOut").click(function () { //缩小
		zoom_n -= 0.1;
		if (zoom_n <= 0.1) {
			zoom_n = 0.1;
		}
		transformImg();
	});
	//旋转
	var spin_n = 0;
	top.$("#mask-rotate").click(function () {
		spin_n += 90;
		transformImg();
	});

	function transformImg() {
		top.$("#mask-img").css({
			"transform": "scale(" + zoom_n + ") rotate(" + spin_n + "deg)",
			"-moz-transform": "scale(" + zoom_n + ") rotate(" + spin_n + "deg)",
			"-ms-transform": "scale(" + zoom_n + ") rotate(" + spin_n + "deg)",
			"-o-transform": "scale(" + zoom_n + ") rotate(" + spin_n + "deg)",
			"-webkit-transform": "scale(" + zoom_n + ") rotate(" + spin_n + "deg)"
		});
	}

}