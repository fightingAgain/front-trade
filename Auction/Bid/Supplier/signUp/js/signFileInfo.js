var urlSignFile = top.config.bidhost + "/BidFileController/fingSignFile.do";
//获取 可递交竞价文件公告

var urlSignCheckRecord = top.config.bidhost + "/BidFileController/findSignFileRecode.do"; //审核记录

var urlSaveSignFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器

var urlUpdateSignFile = top.config.bidhost + "/BidFileController/updateSignFile.do"; //保存上传文件信息

//var urlChangeSignFile = top.config.bidhost + "/PurFileController/updateOfferFile.do"; //修改上传文件信息

var urlDownloadSignFile = top.config.bidhost + "/FileController/download.do"; //下载竞价文件地址

var deleteUrl = top.config.bidhost + "/BidFileController/resetSignFile.do"; //撤回上传文件

var fileArr = []; //文件数组操作 上传或者修改
var type = getUrlParam("type");

var rowData = JSON.parse(sessionStorage.getItem("rowData"));
var projectId =rowData.projectId;//获取项目ID
var packageId = rowData.packageId;//获取包件ID
var fileId;
var checkState;
 
$(function() {

	$("#FileName").fileinput(); //上传插件初始化
	//文件上传提示
	$(".btn-file").after('<span class="text-danger" style="margin-left:15px;">只支持pdf、表格、文档、图片、压缩包格式的文件！</span>')

	//填充项目信息
	$("#signEndDate").html(rowData.signEndDate);
	$("#offerEndDate").html(rowData.offerEndDate);
	$("#projectName").html(rowData.projectName);
	$("#projectCode").html(rowData.projectCode);
	$("#packageName").html(rowData.packageName);
	$("#packageNum").html(rowData.packageNum);

	if(type == "check") { // 审核通过
		$(".subfile").hide(); //上传文件
		$("#divEdit").hide(); //上传文件按钮
		$("#btn_submit").hide(); //提交按钮
		getSignFileInfo(projectId,packageId); //上传成功或者失败重新刷新文件列表
		loadSignCheckRecord(); //挂载审核记录
		findReceipt();
		//$(".record").hide(); //审核记录
	} else if(type == "checkupdate") { //审核不通过

		getSignFileInfo(projectId,packageId); //上传成功文件挂载
		loadSignCheckRecord(); //挂载审核记录
		findReceipt();
		//$(".record").hide(); //审核记录
	} else if(type == "update") { // 未审核

		$("#divEdit").hide(); //上传文件按钮
		$(".subfile").hide(); //上传文件
		$("#btn_submit").hide(); //提交按钮
		getSignFileInfo(projectId,packageId); //上传成功或者失败重新刷新文件列表		
		loadSignCheckRecord(); //挂载审核记录
		findReceipt();
		//$(".record").hide(); //审核记录
	} else if(type == "submit") { //未提交
		
		$(".uploadFile").hide(); //已上传表格
		$(".record").hide(); //审核记录
		$("#btnShowFile").hide();
		$("#btnDownLoad").hide();
	}
})

//上传文件列表

$("#files").bootstrapTable({
	pagination: false,
	undefinedText: "",
	columns: [{
		title: "序号",
		align: "center",
		width: "50px",
		formatter: function(value, row, index) {
			return index + 1;
		}
	}, {
		field: "fileName",
		halign: "center",
		title: "文件名"
	}, {
		title: "操作",
		align: "center",
		width: "20%",
		formatter: function(value, row, index) {
			//<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName.substring(0, row.fileName.lastIndexOf(".")) + "\",\"" + row.filePath + "\")'>下载</a>
			var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
			var html="";
			html +="<a href='javascript:void(0)' class='btn btn-danger btn-xs' onclick='deleteFile(\"" + index + "\")'>删除</a>&nbsp;&nbsp;"
			if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
				html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>"
			}	
			//return "<a href='javascript:void(0)' class='btn btn-danger btn-xs' onclick='deleteFile(\"" + index + "\")'>删除</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>";
			return html;
		}
	}, ]
})
//审核记录表格
$("#signCheckRecord").bootstrapTable({
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
	}, {
		field: "checkState",
		align: "center",
		title: "审核状态",
		formatter: function(value, row, index) {
			if(value == 0) {
				return "<div class='text-success'>未审核</div>"
			} else if(value == 1){
				return "<div class='text-danger'>合格</div>"
			}else if(value == 2){
				return "<div class='text-danger'>不合格</div>"
			}
		}
	}, {
		field: "checkContent",
		align: "center",
		title: "审核意见"
	}, {
		field: "checkDate",
		title: "审核时间",
		align: "center",
		width: "20%"
	}, ]
})

//获取报名文件的信息
function getSignFileInfo(projectId,packageId) {
	var dataParam = {
		"enterpriseType":1,
		"projectId": projectId,
		"packageId": packageId,
		"enterpriseType":1
		//"examType":"1",
		//"isView":0
	}
	$.ajax({
		type: "post",
		url: urlSignFile,
		datatype: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				if(result.data.length > 0){
					if(result.data[0].fileState == 2){
						$("#divEdit").show(); //上传文件按钮
						$(".subfile").show(); //上传文件
						$("#btn_submit").show();
						$("#btnShowFile").hide();
						$("#btnDownLoad").hide();
					}
					rowData = "";
					//填充竞价文件信息表格信息
					var rowData='<tr>'
			     		+'<td style="width:50px;">序号</td>'
			     		+'<td style="text-align:left">文件名称</td>'
			     		/*+'<td style="width:150px;text-align:left">上传IP地址</td>'
			     		+'<td style="width:70px;">地区</td>'*/
			     		+'<td style="width:50px;">上传人</td>'
			     		+'<td style="width:50px;">上传时间</td>'
			     		+'<td style="width:50px;">撤回人</td>'
			     		+'<td style="width:70px;">撤回时间</td>'
			     		+'<td style="width:100px;">文件状态</td>'
			     		+'<td style="width:130px;">操作</td>'
			     	+'</tr>';
					for(var i = 0; i < result.data.length; i++) {
						if(result.data[i].editEmployeeId == '' ||result.data[i].editEmployeeId == undefined ){
								result.data[i].editUserName == '无';
						}
						if(result.data[i].editDate == '' ||result.data[i].editDate == undefined ){
								result.data[i].editDate == '无';
						}
						if(result.data[i].employeeId == '' ||result.data[i].employeeId == undefined ){
								result.data[i].userName == '无';
						}
						if(result.data[i].subDate == '' ||result.data[i].subDate == undefined ){
								result.data[i].subDate == '无';
						}
						if(result.data[i].areas == '' ||result.data[i].areas == undefined ){
								result.data[i].areas == '无';
						}
						var filesnames = result.data[i].fileName.substring(result.data[i].fileName.lastIndexOf(".") + 1).toUpperCase();
						//setSignFile(result.data[i]);
					rowData+='<tr>'
				     		+'<td style="text-align:center;width:50px;">'+(i+1)+'</td>'
				     		+'<td style="text-align:left;width:300px;">'+result.data[i].fileName+'</td>'
				     		/*+'<td style="text-align:left;width:150px;">'+result.data[i].ip+'</td>'
				     		+'<td style="width:100px;">'+(result.data[i].areas || "")+'</td>'*/
				     		+'<td style="width:100px;">'+(result.data[i].userName || "")+'</td>'
				     		+'<td style="width:150px;">'+(result.data[i].subDate || "") +'</td>'
				     		+'<td style="width:100px;">'+(result.data[i].editUserName || "")+'</td>'
				     		+'<td style="width:150px;">'+(result.data[i].editDate || "" )+'</td>'	
				     		+'<td style="width:100px;">'+(result.data[i].fileStateText || "")+'</td>'				     					   		
		     				+'<td style="width:200px;font-size:12px"><a href="javascript:void(0)" class="btn btn-primary btn-xs" onclick=openAccessory(\"' + result.data[i].fileName + '\",\"' + result.data[i].filePath + '\")>下载</a>&nbsp;&nbsp;'
		     			if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							rowData +='<a href="javascript:void(0)" class="btn btn-primary btn-xs" onclick=previewFile(\"'+ result.data[i].filePath + '\")>预览</a>&nbsp;&nbsp'
						}
		     			if(result.data[i].fileState != 2){
		     				rowData +='<a href="javascript:void(0)" class="btn btn-primary btn-xs" onclick=reset(\"' + result.data[i].id + '\",\"' + result.data[i].checkState + '\")>撤回</a>'
		     			}
		     			rowData +='</td></tr>';
						//存储文件信息Id 				
						//sessionStorage.setItem("SignFileId", result.data[i].id);
					}
					$("#uploadedfiles").append(rowData);
				}else{
					//$("#uploadedfiles").bootstrapTable("load", result.data);
					$("#btnShowFile").hide();
					$("#btnDownLoad").hide();
					parent.$('#signFileList').bootstrapTable('refresh');
				}
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//插件设置 
$("#FileName").fileinput({
	language: 'zh', //设置语言
	uploadUrl: urlSaveSignFile, //上传的地址
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
	//maxFileCount: 1, //表示允许同时上传的最大文件个数
	//上传参数
}).on("filebatchselected", function(event, files) {
	if(event.currentTarget.files.length > 1) {
		parent.layer.alert('单次上传文件数只能为1个');
		$(this).fileinput("reset"); //选择的格式错误 插件重置
		return;
	}
	var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
	if(filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
		parent.layer.alert('只能上传pdf、表格、文档、图片、压缩包格式的附件');
		$(this).fileinput("reset"); //选择的格式错误 插件重置
		return;
	};
	if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024) {
		parent.layer.alert('上传的文件不能大于2G');
		$(this).fileinput("reset"); //选择的格式错误 插件重置
		return;
	};
	$(this).fileinput("upload"); //插件上传
}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
	if(data.response.success){
		var filesNameArr = data.files; //文件数组
		var filesPathArr = data.response.data; //文件路径数组
		for(var i = 0; i < filesPathArr.length; i++) {
			var newObj = {};
			newObj.fileName = filesNameArr[i].name;
			newObj.filePath = filesPathArr[i];
			newObj.fileSize = filesNameArr[i].size;
			fileArr.push(newObj);
		}
	}
	loadFiles(fileArr);
}).on('filebatchuploaderror', function(event, data, msg) {
	parent.layer.msg("上传失败:" + msg);
});
//获取参数
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//上传成功或者失败重新刷新文件列表
function refreshSignFileInfo() {
	var data = sessionStorage.getItem("SignFileCheckId");
	var type = getUrlParam("type");
	getSignFileInfo(data, type);
}

//加载审核记录
function loadSignCheckRecord() {
	var dataParam = {
		"packageId": packageId,
		"enterpriseType": 1 //0是采购人 1 是供应商
	}
	$.ajax({
		type: "get",
		url: urlSignCheckRecord,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				var newData = result.data;
				loadCheckRecordTable(newData);
			}
		}
	})
}

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadSignFile + "?ftpPath=" + filePath + "&fname=" + fileName;
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
		var itemList=new Array();
		fileArr=itemList.concat(fileArr);
		fileArr.splice(index, 1);
		$("#files").bootstrapTable("load", fileArr);
		parent.layer.close(layerIndex);
	}, function(layerIndex) {
		parent.layer.close(layerIndex)
	});
}
//预览文件
function previewFile(filePath) {
	openPreview(filePath);
}

//撤回文件
function reset(id,checkState) {
	checkState=checkState;
	parent.layer.confirm('是否撤回', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(layerIndex, layero) {
		if(checkState == "0"){
			$.ajax({
				type: "get",
				url: deleteUrl,
				dataType: 'json',
				data: {
					id:id
				},
				async: false,
				success: function(result) {
					if(result.success) {
						getSignFileInfo(projectId,packageId);
						parent.layer.alert("撤回成功");
					}else{
						parent.layer.alert("撤回失败");
					}
				}
			})
		}else{
			return parent.layer.alert("已审核，不能撤回");
		}
	}, function(layerIndex) {
		parent.layer.close(layerIndex)
	});
}
//加载审核记录
function loadCheckRecordTable(data) {
	$("#signCheckRecord").bootstrapTable("load", data);
}

$("#btn_submit").on("click", function() {
	if(fileArr.length == 0) {
		top.layer.alert("请选择文件！");
		return;
	}
	
	if(fileArr.length > 1) {
		top.layer.alert("上传文件数量为1！");
		return;
	}

	if(new Date(rowData.signEndDate).getTime() < new Date().getTime()) {
		parent.layer.alert("当前时间已超过报名文件提交截止时间，上传失败");
		return;
	};

	var newUrl = "";

	var fileName = ""; //保存文件名
	var fileNameArr = []; //文件名数组
	var filePath = ""; //保存文件路径
	var filePathArr = []; //文件路劲数组
	var fileSize = 0; //文件大小总和*/
	var examType = rowData.examType;
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
		"packageId":packageId,
		//"examType":examType,
		"checkState":"0",
		"fileState":"1"
	}

	if(type == "checkupdate" || type =="update") {
		newUrl = urlUpdateSignFile;
	} else if(type == "submit") {
		newUrl = urlUpdateSignFile;
		
	}
	$.ajax({
		type: "get",
		url: newUrl,
		datatype: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				Receipt();
				parent.$('#signFileList').bootstrapTable('refresh');
				parent.layer.closeAll();
				parent.layer.alert("上传成功");

			} else {
				parent.layer.alert("上传失败");
			}
		}
	})
})

var ReceiptData;
function findReceipt(){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/findReceiptList.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:1,//报名文件回执单
		},
		async: true,
		success: function(data) {
			if(data.success){			
				ReceiptData =data.data;
			}
		}
	});
}

function Receipt(){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/receiptToPdf.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:1//报名文件回执单
		},
		async: true,
		success: function(data) {
			if(data.success){
				var path = data.data
				addReceipt(path);
			}
		}
	});
}

function addReceipt(path){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/addBidReceipt.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:1,//报名文件回执单
			filePath:path
		},
		async: true,
		success: function(data) {
			if(data.success){
				//top.$('#table').bootstrapTable(('refresh'));
				//top.layer.closeAll();
				top.layer.alert("生成回执成功");
			}else{
				//top.layer.closeAll();
				if(data.message){
					top.layer.alert(data.message);
				}else{
					top.layer.alert("生成回执单失败");
				}
			}
		}
	});
}

//预览
$("#btnShowFile").click(function(){
	if(ReceiptData.length>0){
		window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + ReceiptData[0].filePath));
	}
	
})

//下载
$("#btnDownLoad").click(function(){
	if(ReceiptData.length>0){
		var newUrl = urlDownloadSignFile + "?ftpPath=" + ReceiptData[0].filePath +"&fname="+"报名回执单";
		window.location.href = $.parserUrlForToken(newUrl);
	}
})

//关闭按钮
$("#btn_close").on("click", function() {
	top.layer.closeAll();
})

function GetTime(time) {
	var date = new Date(time).getTime();

	return date;
};