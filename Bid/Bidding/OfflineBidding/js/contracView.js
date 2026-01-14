var getDetailUrl = config.offlineHost + "/OfflineMandateContractController/selectById";
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var id = ""; //项目id
// var source = 0; //链接来源  0:查看  1审核
var fileUploads = null;
var employeeInfo = entryInfo();
var isThrough;
$(function () {
	// 获取连接传递的参数
	id = $.getUrlParam("id");

	if (id && id != '' && id != null && id != undefined) {
		getDetail();
	} else {
		return false
	}
	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//文件下载
	$("#fileList").on('click', '.downloadModel', function () {
		var road = $(this).closest('td').attr('data-file-url');	// 下载文件路径
		var fileName = $(this).closest('td').attr('data-file-name');	// 下载文件路径
		$(this).attr('href', $.parserUrlForToken(fileDownload + '?ftpPath=' + road + '&fname=' + fileName))
	})
});
// 获取页面数据
function getDetail() {
	$.ajax({
		url: getDetailUrl,
		type: 'post',
		data: { id: id },
		success: function (data) {
			console.log(data)
			var contracData = data.data;
			if (data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			contracData = formatData(contracData);
			for (var key in contracData) {
				var dom = $('#' + key);
				if (dom && dom != undefined && 
					contracData[key] != null && 
					contracData[key] != undefined) 
					{
					dom.text(contracData[key])
				}
			}
			if (!fileUploads) {
				fileUploads = new StreamUpload("#fileContent", {
					businessId: id,
					status: 2
				});
			}
			if (contracData.projectAttachmentFiles) {
				fileUploads.fileHtml(contracData.projectAttachmentFiles);
			}
		},
		error: function (data) {
			parent.layer.alert("加载失败");
		}
	});
};

// 处理页面数据
function formatData(data) {
	var formatDataType = {
		// 处理几个select框的显示数据
		contractType: {
			'1': '长期',
			'2': '有效'
		},
		payType: {
			'1': '固定金额',
			'2': '固定比例',
			'3': '标准累进制'
		},
		tenderProbjetType: {
			'A': '工程类型',
			'B': '货物类型',
			'C': '服务类型'
		},
		payObject: {
			'1': '招标人',
			'2': '中标人'
		},
	}
	for (var key in formatDataType) {
		if (data[key] != '' && data[key] != null && data[key] != undefined) {
			data[key] = formatDataType[key][data[key]];
		}
	}
	return data;
}

