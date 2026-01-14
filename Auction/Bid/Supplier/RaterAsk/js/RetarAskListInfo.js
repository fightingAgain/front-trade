var urlUploadBatch = top.config.bidhost + "/FileController/uploadBatch.do"; //上传附件地址

var urlUpdateRaterAsk = top.config.bidhost + "/RaterAskController/updateRaterAsk.do"; //上传附件信息地址

var urlDownloadAuctionFile = top.config.bidhost + "/FileController/download.do"; //下载文件地址

var urlShowUpdatedAccessory = top.config.bidhost + "/PurFileController/list.do"

var fileArr = [];

var RaterAskData = JSON.parse(sessionStorage.getItem("RaterListInfo")); //评审回复所有信息

var type = getUrlParam("type");

$(function() {
	//上传初始化
	var oFileInput = new FileInput();
	oFileInput.Init("#FileName", urlUploadBatch);

	$(".btn-file").after("<span style='margin-left:10px' class='text-danger'>只能上传jpg, bmp, png, pdf,xls,docx,zip,rar格式的附件</span>")
	//填写表格信息
	//fillRaterAskFrom(RaterAskData);

	$("div[id]").each(function() {
		$(this).html(RaterAskData[this.id]);
	});
	//所有代理的非招标项目，删除采购员姓名和电话字段。
	if(RaterAskData.isAgent == 1){
		$('.purchaserShow').hide();
	}else{
		$('.purchaserShow').show();
	}
	if(RaterAskData.examType !=undefined &&  RaterAskData.examType== 0){
		$("#firstDate").text("第一轮预审开始时间");
		$("#checkEndDate").text(RaterAskData.examCheckEndDate);
	}
	fileTable()
	//判断是查看 还是回复 调整输入框 的展示
	if(type == "check") {
		$("#answerContentInput").hide();
		$("#answerContent").show();
		$("#divEdit").hide();
		$("#divButton").hide();
		//	$("#btn_submit").hide();
		$("#notUpdatedAccessoryTr").hide();
		$("#updatedAccessoryTr").show();
		//展示上传附件
		showUpdatedAccessory();

	} else if(type == "reply") {
		$("#answerContentInput").show();
		$("#answerContent").hide();
		$("#btn_submit").show();
		$("#divButton").show();
		$("#notUpdatedAccessoryTr").show();
		$("#updatedAccessoryTr").hide();
	}
	//表格的回复状态
	if(RaterAskData.answerState == "0") {
		$("#answerState").html("未答复");
	} else {
		$("#answerState").html("已答复");
	}

	$(".fileinput-remove").on("click", function() { //上上传文件清除按钮点击 将地步的上传按钮显示
		$("#btn_submit").show();
	})

})
var filePath, fileName, dataParam;
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$(ctrlName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			autoReplace: true,
			showRemove: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx'
				,'JPG', 'BMP', 'PNG','JPEG','PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
			hideThumbnailContent: true,
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-sm btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			uploadAsync: false,
			showPreview: false,
			showUpload: false,//是否显示上传按钮  
			layoutTemplates: {
				actionZoom: '',
			}
		}).on("filebatchselected", function(event, files) {
			if(fileArr.length > 0) {
				parent.layer.alert('只可上传一个答复附件');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}

			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			
			var upFileName = event.currentTarget.files[0].name;
			var index1=upFileName.lastIndexOf(".");
			var index2=upFileName.length;
			//var filesnames=upFileName.substring(index1+1,index2).toUpperCase();//后缀名
			var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
			if(filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS'){
				parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return ;
			};
			if(event.currentTarget.files[0].size > 2 * 1024 * 1024*1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload"); //插件上传
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			var filesNameArr = data.files; //文件数组
			var filesPathArr = data.response.data; //文件路径数组
			for(var i = 0; i < filesPathArr.length; i++) {
				var newObj = {};
				newObj.fileName = filesNameArr[i].name;
				newObj.filePath = filesPathArr[i];
				newObj.fileSize = filesNameArr[i].size;
				fileArr.push(newObj);
			}
			loadFiles(fileArr);

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("上传失败");
		});
	}
	return oFile;
};

//加载上传文件
function loadFiles() {
	$("#files").bootstrapTable("load", fileArr);
}

//获取路径传值
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//回复区输入改变时 将文件上传按钮失效和生效
function answerContentInput() {
	if($("#answerContentInput").val() != "") {
		$(".fileinput-upload").attr("disabled", false);
	} else if($("#answerContentInput").val() == "") {
		$(".fileinput-upload").attr("disabled", true);
	}
}

//底部提交按钮 
$("#btn_submit").on("click", function() {
	if($("#answerContentInput").val() == "") {
		parent.layer.alert("请填评审回复");
		return;
	}
	if(fileArr.length > 0) {
		var dataParam = {
			"id": RaterAskData.id,
			"answerContent": $("#answerContentInput").val(),
			"fileName": fileArr[0].fileName,
			"filePath": fileArr[0].filePath
		}
	} else {
		var dataParam = {
			"id": RaterAskData.id,
			"answerContent": $("#answerContentInput").val(),
		}
	}

	if(RaterAskData.checkReport == 1){
		parent.layer.alert("评审回复已截止");
		return;
	}

	$.ajax({
		type: "post",
		url: urlUpdateRaterAsk,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				parent.layer.alert("回复成功！");
				parent.$('#RaterAskList').bootstrapTable('refresh'); //主表刷新 关闭弹出层
				parent.layer.close(parent.layer.getFrameIndex(window.name));
			} else {
				parent.layer.alert("回复失败:" + result.message);
			}
		}
	})
})

$("#btn_close").on("click", function() {
	parent.layer.closeAll()
})

//显示已上传的附件
function showUpdatedAccessory() {
	var RaterAskData = JSON.parse(sessionStorage.getItem("RaterListInfo"));

	var dataParam = {
		"modelId": RaterAskData.id,
	}
	$.ajax({
		type: "post",
		url: urlShowUpdatedAccessory,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				if(result.data.length>0){
					var newObj = {};
					newObj.fileName = result.data[0].fileName;
					newObj.filePath = result.data[0].filePath;
					fileArr.push(newObj);
					loadFiles();
				}
				
			}
		}
	})
}
function fileTable(){
	$("#files").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "fileName",
				halign: "center",
				title: "文件名"
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "20%",
				events:{
						'click .fileDownload':function(e, value, row, index){
							var newUrl = urlDownloadAuctionFile + "?ftpPath=" + row.filePath + "&fname=" + row.fileName ;
							window.location.href = $.parserUrlForToken(newUrl); 
						},
						'click .previewFile':function(e, value, row, index){
							openPreview(row.filePath);
						},
						'click .filedelet':function(e, value, row, index){
							parent.layer.confirm('是否删除', {
								btn: ['是', '否'] //可以无限个按钮
							}, function(layerIndex, layero) {
								fileArr.splice(index, 1);
								$("#files").bootstrapTable("load", fileArr);
								parent.layer.close(layerIndex);
							}, function(layerIndex) {
								parent.layer.close(layerIndex)
							});
						},
					},
					formatter:function(value, row, index){	
						var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
						var mixtbody=""  
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
						if(row.fileState==1 && checkTypes != 1){
							if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
								mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
							}
						}else{
							if(type=='reply'){
								mixtbody+='<a class="btn-sm btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
							}
							if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
								mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
							}
						}               
						return mixtbody
					}
			},
		]
	})
}
