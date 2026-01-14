function passMessage(params) {
	$("#bidSectionId").val(params.bidSectionId);
	uploadFile("uploadFile",config.OpenBidHost + "/ObjectionAnswersAttachmentController/addOneAttachment?Token="+sessionStorage.getItem('token'));
}
function uploadFile(ctrlName, uploadUrl) {
	$("#" + ctrlName).fileinput({
		language: 'zh',
		uploadUrl: uploadUrl,
		showUploade: false,
		uploadAsync: false,
		autoReplace: false,
		layoutTemplates: {
			actionUpload: '', //取消上传按钮
			actionZoom: '', //取消预览按钮
			actionDelete: '' //取消删除按钮
		},
		showRemove: false,
		showUpload: false,
		showPreview: false,
		//allowedFileExtensions: ['rar', 'zip', 'pdf', 'png'], //接收的文件后缀
		//showUpload: true, //是否显示上传按钮  
		showCaption: false, //是否显示标题  
		browseClass: "btn btn-primary btn-sm", //按钮样式       
		dropZoneEnabled: false, //是否显示拖拽区域  
	}).on("filebatchselected", function(event, files) { //选择文件后处理事件
		var filename = files[0].name,
			size = files[0].size;
		var temporary = filename.substring(0, filename.lastIndexOf(".")),
			filesuffix = filename.substring(filename.lastIndexOf(".") + 1);
		var regEn = /[`~!@#$%^&*_+?"{}.\/;'[\]]/im,
			regCn = /[·！#￥——；|<>[\]]/im;
		if(regEn.test(temporary) || regCn.test(temporary)) {
			parent.layer.alert("名称不能包含" + regEn + regCn + "等特殊字符");
			$(this).fileinput("reset");
			return false;
		}
		if(filesuffix != "xls" && filesuffix != "xlsx") {
			parent.layer.alert('上传文件格式错误,请根据提示上传文件');
			$(this).fileinput("reset");
			return;
		}
		$(this).fileinput("upload"); //文件上传
	}).on('filebatchuploaderror', function(event, data, msg) { //同步上传错误结果处理
		parent.layer.alert(msg);
	}).on('filebatchuploadsuccess', function(event, data, previewId, index) { //同步上传成功结果处理
		var arr = data.response.data.errors;
		if(arr.length) {
			var errorDive = $("div[id=errors]");
			errorDive.empty();
			for(var i = 0; i < arr.length; i++) {
				errorDive.append("<p>(" + (i + 1) + ")" + arr[i] + "</p>");
			}
		}
	}).on('filebatchuploaderror', function(event, data, msg) { //同步上传错误结果处理
		parent.layer.alert(msg);
	});
}