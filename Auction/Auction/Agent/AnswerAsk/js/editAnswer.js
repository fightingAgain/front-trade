var searchUrl = parent.config.AuctionHost+'/AskAnswersController/findPageList.do';
var saveUrl = parent.config.AuctionHost+'/AskAnswersController/updateAskAnswers.do';//保存答复
var fileLoad = parent.config.FileHost + "/FileController/upload.do";//上传附件
var saveImgUrl = parent.config.AuctionHost +"/PurFileController/saveBatch.do"; //保存附件
var getImgListUrl = parent.config.AuctionHost + "/PurFileController/page.do"; //查看附件
var findFileUrl = parent.config.AuctionHost + "/PurFileController/list.do";
var dowoloadFileUrl = parent.config.FileHost + '/FileController/download.do';//下载文件

var fileSize;//文件大小
var fileName;//文件名称
var filePath;//文件路径
var fileType;//文件类型
var size;
var AnswersFileList = []; //文件上传保存路径
var AnswersFile; //单个文件

//初始化
$(function() {
	uploadFile();
});
//查询提问附件
var askFiles;
function findFileList(id, callback){
    $.ajax({
		type: "post",
		url: findFileUrl,
		datatype: 'json',
		data: {
			modelName:'JJ_PUR_ASK_ANSWERS',
			modelId:id
			//examType:fileExamType
		},
		async: true,
		success: function(data) {
			if(data.success) {
				askFiles = data.data;
				setAskFile();
			}
		}
	});
	$("#btn_close").on("click", function () {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	$('#btn_submit').click(function(){
		if(callback){
			callback();
		}
	});
}

function setAskFile() {
		$("#askFile").empty();
		var strHtml;
		for(var i = 0; i < askFiles.length; i++) {
			var filesnames = askFiles[i].fileName.substring(askFiles[i].fileName.lastIndexOf(".") + 1).toUpperCase();
			strHtml += "<tr>";
			strHtml += "<td>" + askFiles[i].fileName + "</td>&nbsp;&nbsp;";
			strHtml += "<td>"
			if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){			
			strHtml +="<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + askFiles[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
			}
			strHtml += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile1(\"" + i + "\")><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
			strHtml +="</td></tr>&nbsp;&nbsp;"
		}
		$("#askFile").html(strHtml);
	}


function uploadFile() {
	//实例化上传文件插件
	var oFileInput = new FileInput();
	oFileInput.Init("#FileName", fileLoad);
}

//初始化fileinput
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
				actionUpload: '', //取消上传按钮
				actionZoom: '', //取消预览按钮
				actionDelete: '' //取消删除按钮
			}
		}).on("filebatchselected", function(event, files) {
			if(event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			$("#lbl_filename").html("");
			var f = data.files[0];
			size = f.size;
			if(size < 1024) {
				fileSize = Math.ceil(size) + "b";
			} else if(1024 <= size && size < 1024 * 1024) {
				fileSize = Math.ceil(size / 1024) + "kb";
			} else {
				fileSize = Math.ceil(size / 1024) + "m";
			}
			fileType = f.type;
			//fileType = fileType;
			//var name = f.name.split(".");
			fileName = f.name;
			//filePath = f.filePath;
			var path = data.response.data;
			filePath = path;

			$(".file-caption-name").val(data);
			AnswersFile = {
				fileType: fileType,
				fileName: fileName,
				filePath: filePath,
				fileSize: fileSize,
			};
			AnswersFileList.push(AnswersFile);

			$("#divShow").show();
			setImage1();
			if(AnswersFileList.size == 0) {
				$("#divShow").hide();
			}

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.alert("失败");
		});
	}

	return oFile;
};

//文件上传
function fileUp(id) {

	var file = "";
	for(var k = 0; k < AnswersFileList.length; k++) {
		file += "&purFiles[" + k + "].model2Name=" + "JJ_PUR_ASK_ANSWERS";
		file += "&purFiles[" + k + "].model2Id=" + id;
		file += "&purFiles[" + k + "].fileType=" + AnswersFileList[k].fileType;
		file += "&purFiles[" + k + "].fileName=" + AnswersFileList[k].fileName;
		file += "&purFiles[" + k + "].filePath=" + AnswersFileList[k].filePath;
		file += "&purFiles[" + k + "].fileSize=" + AnswersFileList[k].fileSize;
	}

	//上传文件
	$.ajax({
		type: "post",
		url: saveImgUrl,
		async: true,
		data: file,
		datatype: 'json',
		success: function(data) {}
	});

}

//显示图片
function setImage1(){
	$("#imgList1").empty();
	for(var i=0;i<AnswersFileList.length;i++){
		var filesnames = AnswersFileList[i].fileName.substring(AnswersFileList[i].fileName.lastIndexOf(".") + 1).toUpperCase();
		var strHtml = "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
		strHtml += "<td >" + AnswersFileList[i].fileName + "</td><td style='text-align: center;'>";
		//strHtml += "<td style='text-align: center;'><a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + AnswersFileList[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
			strHtml += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + AnswersFileList[i].filePath + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>&nbsp;&nbsp;"
		}
		strHtml += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=delImage('" + i + "')><span class='glyphicon glyphicon-remove' aria-hidden='true'></span>删除</a></td></tr>";
		$("#imgList1").append(strHtml);
	}
}

function delImage(i){
	parent.layer.confirm('确定要删该附件吗？',
		{btn:['确 定','取 消']},
		function(){
			AnswersFileList.splice(i,1);
			setImage1();
			if(AnswersFileList.length == 0){
				$("#divShow").hide();
			}
			parent.layer.alert("删除成功!");
	    		parent.layer.close(parent.layer.index);
	    	},
	    	function(){
	    		parent.layer.close(parent.layer.index);
	    	}
	   )
	}
	
function showImage(obj){
		openPreview(obj,"850px","600px");
}


function downloadFile1(i) {
	var newUrl =dowoloadFileUrl + '?ftpPath=' + askFiles[i].filePath + '&fname=' + askFiles[i].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

function Ti(){
	$.ajax({
	   	url:saveUrl,
	   	type:'post',
	   	dataType:'json',
	   	async: false,
	    data:$("#form").serialize(),
	   	success:function(data){
	   	    //console.log(data);
	   	    if(data.success){ 
	   	    	fileUp(data.data);
	   	    	parent.layer.close(parent.layer.index);
	   	    	parent.layer.alert("您的答复提交成功!");
	   	    }else{
	   	    	parent.layer.close(parent.layer.index);
	   	    	parent.layer.alert(data.message);
	   	    }
	   	}	
   });
}

