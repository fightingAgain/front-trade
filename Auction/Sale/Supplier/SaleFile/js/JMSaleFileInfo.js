var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileList.do";
var urlAuctionFileList = top.config.AuctionHost + "/AuctionFileController/findFileSubmitPageList.do"; //竞卖文件信息详情
//获取 可递交竞卖文件公告
var urlAuctionCheckRecord = top.config.AuctionHost + "/AuctionFileController/findAuctionFileRecode.do"; //审核记录

var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器

var urlUpdateAutionFile = top.config.AuctionHost + "/AuctionFileController/saveAuctionFile.do"; //保存上传文件信息

var urlChangeAutionFile = top.config.AuctionHost + "/AuctionFileController/updateAuctionFileChange.do"; //修改上传文件信息

var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞卖文件地址
var viewurlcar = top.config.AuctionHost + "/AuctionFileController/findCraAll.do";//查询车辆信息
var delUrl=top.config.AuctionHost + "/AuctionFileController/deleteCra.do";//查询车辆信息
var fileArr = []; //文件数组操作 上传或者修改

var type = getUrlParam("type");
var fildata;
var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
$(function() {

	$("#FileName").fileinput(); //上传插件初始化
	//文件上传提示
	$(".btn-file").after('<span class="text-danger" style="margin-left:15px;">只允许上传PDF、表格、文档、图片、压缩包格式的文件！</span>')

	//填充项目信息
	$("#fileEndDate").html(rowData.fileEndDate);
	$("#fileCheckEndDate").html(rowData.fileCheckEndDate);
	$("#projectName").html(rowData.projectName);
	$("#projectCode").html(rowData.projectCode);
	if(type == "check") { // 审核通过
		$(".subfile").hide(); //上传文件
		$("#divEdit").hide(); //上传文件按钮
		$("#btn_submit").hide(); //提交按钮
		$("#btnadd").hide();//车辆添加
		$(".inputclient").hide();
		$(".inputclientsId").hide();
		inputclient
		getAuctionFileInfo(rowData.projectId); //上传成功或者失败重新刷新文件列表
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "checkupdate") { //审核不通过
        $(".divclient").hide();
		$(".divclientsId").hide();
		getAuctionFileInfo(rowData.projectId); //上传成功文件挂载
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "update") { // 未审核

		$("#divEdit").hide(); //上传文件按钮
		$(".subfile").hide(); //上传文件
		$("#btn_submit").hide(); //提交按钮
		$("#btnadd").hide();//车辆添加
		$(".inputclient").hide();
		$(".inputclientsId").hide();
//		$(".divclient").hide();
//		$(".divclientsId").hide();
		getAuctionFileInfo(rowData.projectId); //上传成功或者失败重新刷新文件列表		
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "submit") { //未提交

		$(".uploadFile").hide(); //已上传表格
		$(".record").hide(); //审核记录
	}
	//基本信息
	$("#legaid").val(rowData.auctionBasic.id);
	$("#legalName").html(rowData.auctionBasic.legalName);
	$("#legalRepresent").html(rowData.auctionBasic.legalRepresent);
	$("#legalContact").html(rowData.auctionBasic.legalContact);
	$("#legalContactPhone").html(rowData.auctionBasic.legalContactPhone);
	$("#legalContactAddress").html(rowData.auctionBasic.legalContactAddress);
	$("#basicAccountNo").html(rowData.auctionBasic.basicAccountNo);
	
	initview();//车辆
	$('#vehcartabel').bootstrapTable('refresh');
})
//上传文件列表

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
			formatter: function(value, row, index) {
				//<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName.substring(0, row.fileName.lastIndexOf(".")) + "\",\"" + row.filePath + "\")'>下载</a>
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var html="";
				html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='deleteFile(\"" + index + "\")'>删除</a>&nbsp;&nbsp;"
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
					html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>"
				}
				return html;
				//return "<a href='javascript:void(0)' class='btn btn-danger btn-xs' onclick='deleteFile(\"" + index + "\")'>删除</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>";
			}
		},
	]
})

//已上传文件表格
$("#uploadedfiles").bootstrapTable({
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
			formatter: function(value, row, index) {
				//<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName.substring(0, row.fileName.lastIndexOf(".")) + "\",\"" + row.filePath + "\")'>下载</a>
				return "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName + "\",\"" + row.filePath + "\")'>下载</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>";
			}
		},
	]
})

//审核记录表格
$("#AuctionCheckRecord").bootstrapTable({
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
			field: "enterpriseName",
			align: "center",
			title: "供应商"
		},
		{
			field: "checkResult",
			align: "center",
			title: "审核状态",
			formatter: function(value, row, index) {
				if(value == 0) {
					return "<div class='text-success'>合格</div>"
				} else {
					return "<div class='text-danger'>不合格</div>"
				}
			}
		},
		{
			field: "checkContent",
			align: "center",
			title: "审核意见",
		},
		{
			field: "checkDate",
			title: "审核时间",
			align: "center",
			halign: "center",
			width: "20%"
		},
	]
})
$(".priceNum").on('change',function(){
  if(!(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test($(this).val()))){
    parent.layer.alert("请输入正确的身份证号");
    $(this).val("");
   return 
  }
})
//获取竞卖文件的信息
function getAuctionFileInfo(data) {
	var dataParam = {
		"projectId": data
	}
	$.ajax({
		type: "post",
		url: urlAuctionFile,
		datatype: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				setAuctionFile(result.data[0]) //填充竞卖文件信息表格信息
				$("#divclient").html(result.data[0].auctionBasic.client);
                 $("#divclientsId").html(result.data[0].auctionBasic.clientsId);
                 $("#client").val(result.data[0].auctionBasic.client);
                 $("#clientsId").val(result.data[0].auctionBasic.clientsId);
				//存储文件信息Id 				
				sessionStorage.setItem("AuctionFileId", result.data[0].id);

			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//插件设置 
$("#FileName").fileinput({
	language: 'zh', //设置语言
	uploadUrl: urlSaveAuctionFile, //上传的地址
	uploadAsync: false,
	autoReplace: false,
	layoutTemplates: {
		actionUpload: '', //取消上传按钮
		actionZoom: '', //取消预览按钮
		actionDelete: '' //取消删除按钮
	},
	showRemove: false,
	showUpload: false, //是否显示上传按钮  
	showPreview: false,
	//allowedFileExtensions: ['rar', 'zip', 'pdf', 'png'], //接收的文件后缀
	showCaption: false, //是否显示标题  
	browseClass: "btn btn-primary btn-sm", //按钮样式       
	dropZoneEnabled: false, //是否显示拖拽区域  
	//maxFileCount: 1, //表示允许同时上传的最大文件个数
	//上传参数
}).on("filebatchselected", function(event, files) {
	if(event.currentTarget.files.length > 1) {
		parent.layer.alert('单次上传文件数只能为1个');
		$(this).fileinput("reset"); //选择的格式错误 插件重置
		return;
	}
//	var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
//	if(ffilesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
//									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
//		parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');
//		$(this).fileinput("reset"); //选择的格式错误 插件重置
//		return;
//	};
	if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024) {
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
	parent.layer.msg("上传失败:" + msg);
});

//填充竞卖文件信息表格信息
function setAuctionFile(data) {
	var fileNameArr = data.fileName.split(","); //文件名数组
	var filePathArr = data.filePath.split(","); //路径数组
	var uploadFileArr = [];
	for(var i = 0; i < fileNameArr.length; i++) {
		var newObj = {};
		newObj.fileName = fileNameArr[i];
		newObj.filePath = filePathArr[i];
		uploadFileArr.push(newObj);
	}
	$("#uploadedfiles").bootstrapTable("load", uploadFileArr);
}

//获取参数
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//上传文件获取参数
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}

//上传成功或者失败重新刷新文件列表
function refreshAuctionFileInfo() {
	var data = sessionStorage.getItem("AuctionFileCheckId");
	var type = getUrlParam("type");
	getAuctionFileInfo(data, type);
}

//加载审核记录
function loadAuctionCheckRecord() {
	var dataParam = {
		"projectId": getProjectId(),
		"enterpriseType": '06' //0是采购人 1 是供应商
	}
	$.ajax({
		type: "get",
		url: urlAuctionCheckRecord,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				var newData = result.data;
				loadCheckRecordTable(newData)
			}
		}
	})
}

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

//加载上传文件
function loadFiles() {
	$("#files").bootstrapTable("load", fileArr);
}

//删除上传文件
function deleteFile(index) {
	parent.layer.confirm('是否删除', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(layerIndex, layero) {
		fileArr.splice(index, 1);
		$("#files").bootstrapTable("load", fileArr);
		parent.layer.close(layerIndex);
	}, function(layerIndex) {
		parent.layer.close(layerIndex)
	});
}
//预览文件
function previewFile(filePath) {//	
	openPreview(filePath);
}

//加载审核记录
function loadCheckRecordTable(data) {
	$("#AuctionCheckRecord").bootstrapTable("load", data);
}

$("#btn_submit").on("click", function() {
	if(fileArr.length == 0) {
		top.layer.alert("请选择文件！");
		return;
	}
	
	if(new Date(rowData.fileEndDate).getTime() < new Date().getTime()) {
		parent.layer.alert("当前时间已超过竞卖文件提交截止时间，上传失败");
		return;
	};

	var newUrl = "";

	var fileName = ""; //保存文件名
	var fileNameArr = []; //文件名数组
	var filePath = ""; //保存文件路径
	var filePathArr = []; //文件路劲数组
	var fileSize = 0; //文件大小总和
	var projectId = getProjectId();
	//对上传的文件数组进行操作
	for(var i = 0; i < fileArr.length; i++) {
		fileNameArr.push(fileArr[i].fileName);
		filePathArr.push(fileArr[i].filePath);
		fileSize += fileArr[i].fileSize;
	}
	fileName = fileNameArr.join();
	filePath = filePathArr.join();
	var dataParam = {
		"fileName": fileName,
		"filePath": filePath,
		"fileSize": fileSize,
		"projectId": projectId,
		"client":$("#client").val(),
		"clientsId":$("#clientsId").val(),
	}

	if(type == "checkupdate") {
		newUrl = urlChangeAutionFile;
		var id = sessionStorage.getItem("AuctionFileId");
		dataParam.id = id;
	} else if(type == "submit") {
		newUrl = urlUpdateAutionFile;
	}
	if(fildata.length<=0){
		parent.layer.alert("请添加车辆信息!");
		return false;
	}
	$.ajax({
		type: "post",
		url: newUrl,
		datatype: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				parent.$('#AuctionFileList').bootstrapTable('refresh');
				parent.layer.msg("上传成功");
				parent.layer.closeAll();

			} else {
				parent.layer.alert(result.message);
			}
		}
	})
})

//关闭按钮
$("#btn_close").on("click", function() {
	top.layer.closeAll();
})

function GetTime(time) {
	var date = new Date(time).getTime();
	return date;
};
//车辆
function initview(){
	$.ajax({
		url: viewurlcar,
		type: "post",
		dataType: 'json',
		data: {
			"projectId": rowData.projectId
		},
		async: false,
		success: function(data) {
			fildata= data.data;
			 initdata(fildata);
		},
		error: function(data) {
			top.layer.alert("加载车辆列表失败!", {
				icon: 2
			})
		}
	});
}
function initdata(fildata){
	$("#vehcartabel").bootstrapTable({
	columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: "plate",
			align: "left",
			title: "车辆号"
		},
		{
			field: "model",
			align: "left",
			title: "车辆型号",
		},
		{
			field: "weight",
			align: "left",
			title: "总质量",
		},
//		{
//			field: "path",
//			title: "附件地址",
//			align: "left",
//		},
		{
			field: "",
			title: "操作",
			align: "left",
			formatter: function(value, row, index) {
				if(type == "update" || type == "check"){
				var strurl = '<a href="javascript:void(0)" class="btn btn-primary btn-xs"  style="color:#FFFFFF" onclick="fileDownload(\'' + row.path + '\',\'' + row.fileName + '\')">下载</a>';
				var strlook = '<a href="javascript:void(0)" class="btn btn-primary btn-xs" onclick="subpreviewFile(\'' + row.path + '\')">预览</a>'
				return strurl+strlook;
				}
				if(type =="submit" || type =="checkupdate"){
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit"  onclick=editview(\"' + index + '\") data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
				    var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" onclick=deletPackage(\"' + row.id + '\") data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
				    return strEdit+strDel;
				}
			    
			}
		},
	]
})
	$("#vehcartabel").bootstrapTable("load",fildata)
}
function editview($index){
	var veData = $('#vehcartabel').bootstrapTable('getData');
//	sessionStorage.setItem("vehcartabeldata", JSON.stringify(veData));
	top.layer.open({
		type: 2,
		title: "修改车辆信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Supplier/SaleFile/modal/JMeditmodel.html?id=' + veData[$index].id+'&projectId='+rowData.projectId,
		success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;		
		}
	});
}
function deletPackage(id){
	parent.layer.confirm('温馨提示：您是否要删除该车辆信息？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: delUrl, //修改包件的接口
			type: 'post',
			async: false,
			data: {
				'id': id,
			},
			success: function(data) {
				if(data.success == true) {
					parent.layer.alert("删除成功");
				    $('#vehcartabel').bootstrapTable(('refresh'));
				    initview()
//				    initdata();
				} else {
					parent.layer.alert(data.message)
				}
				$('#vehcartabel').bootstrapTable('refresh');
				initview()
//				  initdata();
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});
	
}
function fileDownload(path,fileName){
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + encodeURI(path) + "&fname=" + encodeURI(fileName);
	window.location.href = $.parserUrlForToken(newUrl);
}
function subpreviewFile(path){
	openPreview(path);
}
function add(){
	top.layer.open({
		type: 2,
		title: "新增车辆信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Supplier/SaleFile/modal/JMaddmodel.html?projectId='+rowData.projectId
	});
}
