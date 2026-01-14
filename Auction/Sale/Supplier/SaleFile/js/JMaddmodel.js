var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var urlUpdateAutionFile = top.config.AuctionHost + "/AuctionFileController/saveAuctionFile.do"; //保存上传文件信息
var addurl = top.config.AuctionHost + "/AuctionFileController/addAndUpdateCra.do";
var fileUp = null;
var projectId = getUrlParam('projectId');
var thisFrame = parent.window.document.getElementById("classId").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#' + thisFrame)[0].contentWindow;

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	//附件上传删除
	$("#delFile").click(function() {
		viewdetale();
	})
	//附件上传下载
	$("#downFile").click(function() {
		viewdown();
	})
	$(".priceNumber").on('change', function() {
		if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			parent.layer.alert("总质量为数字类型且最多两位小数");
			$(this).val("");
			return
		};
	});
})
var offerFileData;
var path;
var fileName;
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, urlSaveAuctionFile) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: urlSaveAuctionFile, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//			allowedFileExtensions: ['jpg', 'bmp', 'png', 'jpeg', 'pdf',  'JPG', 'BMP', 'PNG', 'JPEG', 'PDF'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			},

		}).on("filebatchselected", function(event, files) {
			var filesnames = event.currentTarget.files[0].name.split('.')[1]
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			var upFileName = event.currentTarget.files[0].name;
			//			var index1=upFileName.lastIndexOf(".");			
			//			var index2=upFileName.length;
			//			var filesnames=upFileName.substring(index1+1,index2).toUpperCase();//后缀名
			//if(filesnames != 'PDF' || filesnames != 'JPG'||filesnames != 'BMP' || filesnames != 'PNG'||filesnames != 'JPEG' || filesnames != 'pdf'||filesnames != 'jpg'|| filesnames != 'bmp' || filesnames != 'png'||filesnames != 'jpge'){
			if(filesnames == "PDF" || filesnames == "pdf" || filesnames == "JPG" || filesnames == "jpg" || filesnames == "BMP" || filesnames == "bmp" || filesnames == "JPEG" || filesnames == "jpeg" || filesnames == "PNG" || filesnames == "png") {

			} else {
				parent.layer.alert('只能上传PDF,JPG,PNG,JPEG格式文件');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			$(this).fileinput("upload");

		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			if(data.response.success) {

				path = data.response.data[0];
				fileName = data.files[0].name;
				offerFile = data.files[0];
				$(".input-group").hide();
				$("#delFile").show();
				$("#downFile").show();
				$("#lookFile").show();
				$("input[name='fileName']").val(data.files[0].name);
				$("input[name='filesize']").val(data.files[0].size / 1000 + "KB");
				$("input[name='path']").val(data.response.data[0]);
				$("#SignfileName").html(fileName);

			}
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};
// 查看附件
$("#lookFile").click(function() {
	previewFile(path);
})

function previewFile(path) {
	openPreview(path);
}
//文件下载
function viewdown() {
	var newUrl = loadFile + "?ftpPath=" + encodeURI(path) + "&fname=" + encodeURI(fileName);
	window.location.href = $.parserUrlForToken(newUrl);
}

function viewdetale() {
	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(indexs, layero) {
		var itemList = new Array();
		offerFileData = itemList.concat(offerFileData);
		offerFileData.splice(1);
		$(".input-group").show();
		$("#fileIn").hide();
		$("#delFile").hide();
		$("#downFile").hide();
		$("#lookFile").hide();
		$("input[name='fileName']").val("");
		$("input[name='filesize']").val("");
		$("input[name='path']").val("");
		$("#SignfileName").html("");

		parent.layer.close(indexs);
	})

}

function saveEnclosure(id) {
	$.ajax({
		type: "post",
		url: urlUpdateAutionFile,
		async: false,
		data: {
			path: path,
			fileName: fileName
		},
		success: function(data) {
			if(data.success) {
				var filedata = data;
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

$("#btnsubmit").click(function() {
	var TableData = $('#form').serialize() + '&projectId=' + projectId;
	if(checkForm($("#form"))) { //验证表单数据
		SaveFormData(TableData); //执行保存操作
	}
})

function SaveFormData(TableData) {

	if($("#SignfileName").html() == "" || $("#SignfileName").html() == null) {
		parent.layer.alert("附件地址不能为空!");
		return false;
	}
	$.ajax({
		type: "POST",
		contentType: "application/x-www-form-urlencoded;charset=utf-8", //WebService 会返回Json类型
		url: addurl,
		data: TableData,
		dataType: 'json',
		error: function() {
			layer.alert("保存失败!", {
				icon: 2
			});
		},
		success: function(response) {
			var data = response.data;
			if(response.success) {
				saveEnclosure(); //保存附件表数据
				parent.layer.alert("保存成功!");
				parent.layer.close(parent.layer.getFrameIndex(window.name));
				dcmt.$("#vehcartabel").bootstrapTable(('refresh'));
				dcmt.initview()

			} else {
				parent.layer.alert(response.message);
			}
			$("#vehcartabel").bootstrapTable('refresh');
		}
	})
}

//关闭按钮
$("#btnClose").on("click", function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})