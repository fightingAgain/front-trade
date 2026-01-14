var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileList.do";
//获取 可递交竞价文件公告

var urlAuctionCheckRecord = top.config.AuctionHost + "/AuctionFileController/findAuctionFileRecode.do"; //审核记录

var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器

var urlUpdateAutionFile = top.config.AuctionHost + "/AuctionFileController/saveAuctionFile.do"; //保存上传文件信息

var urlChangeAutionFile = top.config.AuctionHost + "/AuctionFileController/updateAuctionFileChange.do"; //修改上传文件信息

var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var backUrl = top.config.AuctionHost + "/AuctionFileController/revokeFile.do";//撤回

var fileArr = []; //文件数组操作 上传或者修改

var type = getUrlParam("type");

var rowData ="";
var signStateTimer = '';
var isShowCard ='1'
function initView() {
	$('.dropdown-input-group').each(function (el) {
		var val = $(this).find('input').val();
		var text = $(this).find('.dropdown-menu li[data-value= ' + val+ ']').text();
		$(this).find('.input-group-label').text(text);
	})
}
function freshView(isView) {
	if (isView) {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').attr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', true);
	} else {
		$('#bidderProxy, #projectLeader, #bidderProxyCard, #projectLeaderCard').removeAttr('readonly', 'readonly');
		$('.dropdown-toggle').attr('disabled', false);
	}
}
function du(data){
	rowData=data
	$("#FileName").fileinput(); //上传插件初始化
	//文件上传提示
	// isShowCard=getHideSupplierLinkBidPriceCard(id,packageId,'1','1')
	if(isShowCard=='0'){
		$('.isShowCard').show()
	}
	//填充项目信息
	$("#fileEndDate").html(rowData.fileEndDate);
	$("#fileCheckEndDate").html(rowData.fileCheckEndDate);
	$("#projectName").html(rowData.projectName);
	if (rowData.projectSource > 0) {
		$("#projectName").html(rowData.projectName + '<span class="red">(重新竞价)</span>');
	} else {
		$("#projectName").html(rowData.projectName);
	}
	$("#projectCode").html(rowData.projectCode);
	$("#bidderProxy").html(rowData.bidderProxy?rowData.bidderProxy:'');
	$("#projectLeader").html(rowData.projectLeader?rowData.projectLeader:'');
	$("[name=bidderProxy]").val(rowData.bidderProxy?rowData.bidderProxy:'');
	$("[name=projectLeader]").val(rowData.projectLeader?rowData.projectLeader:'');
	$("#bidderProxyCardType").val(rowData.bidderProxyCardType || 0);
	$("#bidderProxyCard").val(rowData.bidderProxyCard || '');
	$("#linkCardType").val(rowData.linkCardType || 0);
	$("#linkCard").val(rowData.linkCard || '');
	$("#projectLeaderCardType").val(rowData.projectLeaderCardType || 0);
	$("#projectLeaderCard").val(rowData.projectLeaderCard || '');
	initView()
	if(type == "check") { // 审核通过
		$(".subfile, .red").hide(); //上传文件
		$("#divEdit").hide(); //上传文件按钮
		$("#btn_submit, #btn_sign, #btn_back").hide(); //提交按钮
		$('.view').show();
		freshView(true);
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "checkupdate") { //审核不通过
		$('.edit, .red').show();
		$('#btn_sign').show();
		$("#btn_submit, #btn_back").hide(); //提交按钮
		freshView(false);
		serviceFeeFileWarn(getProjectId());
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "update") { // 未审核
		$('.view').show();
		$("#divEdit").hide(); //上传文件按钮
		$(".subfile, .red").hide(); //上传文件
		$("#btn_submit, btn_sign").hide(); //提交按钮
		var fileEndDate = Date.parse(new Date(rowData.fileEndDate.replace(/\-/g, "/"))); //递交截止时间
		var nowDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));
		if(nowDate < fileEndDate){//递交截止时间前，供应商可以撤回，撤回后在递交截止时间前可以重新递交文件。
			$('#btn_back').show();//撤回
		}
		freshView(true);
		loadAuctionCheckRecord(); //挂载审核记录

	} else if(type == "submit") { //未提交
		$('.edit, .red').show();
		$('#btn_sign, #divEdit').show();
		$(".subfile, .red").show(); //上传文件
		$("#btn_submit, #btn_back").hide(); //提交按钮
		$(".uploadFile").hide(); //已上传表格
		$(".record").hide(); //审核记录
		serviceFeeFileWarn(getProjectId());
		freshView(false);
	}
	getAuctionFileInfo(rowData.projectId); //上传成功文件挂载
	getSignRecord(rowData.projectId, 'historySignTable')

	$(".dropdown-input-group .dropdown-menu li").click(function () {
		$(this).parent().parent().find('input').val($(this).attr('data-value'));
		$(this).parent().parent().find('.input-group-label').text($(this).text());
	})
}

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
	}, {
		title: "操作",
		align: "center",
		halign: "center",
		width: "20%",
		events:{
			
			'click .previewFile':function(e,value, row, index){
				openPreview(row.filePath);
			},
			
		},
		formatter: function(value, row, index) {
			//<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName.substring(0, row.fileName.lastIndexOf(".")) + "\",\"" + row.filePath + "\")'>下载</a>
			var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
			var html="";
			html +="<a href='javascript:void(0)' class='btn btn-danger btn-xs' onclick='deleteFile(\"" + index + "\")'>删除</a>&nbsp;&nbsp;"
			if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
				html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>";
			}
			return html;
		}
	}, ]
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
	}, /*{
		field: "fileIp",
		align: "center",
		title: "上传IP地址"
	},{
		field: "fileArea",
		align: "center",
		title: "地区"
	},*/{
		title: "操作",
		align: "center",
		halign: "center",
		width: "20%",
		events:{
			'click .openAccessory':function(e,value, row, index){
				var newUrl = urlDownloadAuctionFile + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
				window.location.href = $.parserUrlForToken(newUrl);
			},
			'click .previewFile':function(e,value, row, index){
				openPreview(row.filePath);
			},
			
		},
		formatter: function(value, row, index) {
			var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
			//<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName.substring(0, row.fileName.lastIndexOf(".")) + "\",\"" + row.filePath + "\")'>下载</a>
			var tr= "<a href='javascript:void(0)' class='btn btn-primary btn-xs openAccessory'>下载</a>&nbsp;&nbsp;"
			if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
				tr+="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>";
			}
			return tr
		}
	}, ]
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
	}, {
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
	}, {
		field: "checkContent",
		align: "center",
		title: "审核意见",
		
	}, {
		field: "checkDate",
		title: "审核时间",
		align: "center",
		halign: "center",
		width: "20%"
	}, ]
})

//获取竞价文件的信息
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
				if(result.data && result.data.length > 0){
					fileArr = [];
					setAuctionFile(result.data[0]) //填充竞价文件信息表格信息
						//存储文件信息Id 				
					sessionStorage.setItem("AuctionFileId", result.data[0].id);
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
	uploadUrl: urlSaveAuctionFile, //上传的地址
	uploadAsync: false,
	autoReplace: false,
	layoutTemplates: {
		actionUpload: '', //取消上传按钮
		actionZoom: '', //取消预览按钮
		actionDelete: '' //取消删除按钮
	},
	showRemove: false,
	showUpload: false,//是否显示上传按钮
	showPreview: false,  
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
//	if(filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
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

//填充竞价文件信息表格信息
function setAuctionFile(data) {
	var fileNameArr = data.fileName.split(","); //文件名数组
	var filePathArr = data.filePath.split(","); //路径数组
	var uploadFileArr = [];
	for(var i = 0; i < fileNameArr.length; i++) {
		var newObj = {};
		newObj.fileName = fileNameArr[i];
		newObj.filePath = filePathArr[i];
		uploadFileArr.push(newObj);
		fileArr.push(newObj);
	}
	$("#uploadedfiles").bootstrapTable("load", uploadFileArr);
	$("#files").bootstrapTable("load", fileArr);
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
	var projectData = rowData;
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
				loadCheckRecordTable(newData);
			}
		}
	})
}
//加载上传文件
function loadFiles() {
	$("#files").bootstrapTable("load", fileArr);
}

//删除上传文件
function deleteFile(index) {
	parent.layer.confirm('是否删除', {
		btn:['是', '否'] //可以无限个按钮
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

//加载审核记录
function loadCheckRecordTable(data) {
	$("#AuctionCheckRecord").bootstrapTable("load", data);
}

$("#btn_submit").on("click", function() {
	var bidderProxy = $.trim($('input[name="bidderProxy"]').val());
	var projectLeader = $.trim($('input[name="projectLeader"]').val());
	function validateUserName(userName, label) {
		var regex = /\d/;
		function charLength(str) {
			var len = 0;
			str = String(str);
			for (var i = 0; i < str.length; i++) {
				if ((str.charCodeAt(i) >= 0x4E00) && (str.charCodeAt(i) <= 0x9FBF)) { 
					len += 2; 
				} else {
					len++; 
				}
			}
			return len;
		}
		userName = $.trim(userName) || ''
		if (userName == '') {
			top.layer.alert('温馨提示：' + '请输入' + label);
			return;
		} else if (charLength(userName) < 3) {
			top.layer.alert('温馨提示：' + label + '名称必须大于2个字符');
			return;
		} else if (regex.test(userName)) {
			top.layer.alert('温馨提示：' + '请输入正确的' + label + '姓名格式');
			return;
		} else if (userName.length > 25) {
			top.layer.alert('温馨提示：' + label + '名称不能超过25个字符');
			return;
		}
		return true;
	}
	if (!validateUserName(bidderProxy, '投标人代表')) {
		return
	}
	if (!validateUserName(projectLeader, '项目负责人')) {
		return
	}
	var bidderProxyCardType = $.trim($("#bidderProxyCardType").val())
	var bidderProxyCard = $.trim($("#bidderProxyCard").val());
	var projectLeaderCardType = $.trim($("#projectLeaderCardType").val());
	var projectLeaderCard = $.trim($("#projectLeaderCard").val());
	var linkCardType = $.trim($("#linkCardType").val())
	var linkCard = $.trim($("#linkCard").val());
	var IDCardRegex = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	// 投标人代表
	if (bidderProxyCard == '') {
		top.layer.alert('请输入投标人代表证件号码');
		return;
	}
	// 如果是身份证号
	if (bidderProxyCardType == '0') {
		if (!IDCardRegex.test(bidderProxyCard)) {
			top.layer.alert('请输入正确的投标人代表身份证号');
			return;
		}
	}
	// if (linkCard == '') {
	// 	top.layer.alert('请输入联系人证件号码');
	// 	return;
	// }
	// if (linkCardType == '0'&&isShowCard=='0') {
	// 	if (!IDCardRegex.test(bidderProxyCard)) {
	// 		top.layer.alert('请输入正确的联系人证件号码');
	// 		return;
	// 	}
	// }
	// 项目负责人
	if (projectLeaderCard == '') {
		top.layer.alert('请输入项目负责人证件号码');
		return;
	}
	// 如果是身份证号
	if (projectLeaderCardType == '0') {
		if (!IDCardRegex.test(projectLeaderCard)) {
			top.layer.alert('请输入正确的项目负责人身份证号');
			return;
		}
	}

	if(fileArr.length == 0) {
		top.layer.alert("请选择文件！");
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
		"projectId": projectId
	}
	dataParam.bidderProxy = $.trim($('input[name="bidderProxy"]').val());
	dataParam.projectLeader = $.trim($('input[name="projectLeader"]').val());

	dataParam.bidderProxyCardType = bidderProxyCardType;
	dataParam.bidderProxyCard = bidderProxyCard;
	if(isShowCard=='0'){
		dataParam.linkCardType = linkCardType;
		dataParam.linkCard = linkCard;
	}
	dataParam.projectLeaderCardType = projectLeaderCardType;
	dataParam.projectLeaderCard = projectLeaderCard;

	if(type == "checkupdate") {
		newUrl = urlChangeAutionFile;
		var id = sessionStorage.getItem("AuctionFileId");
		dataParam.id = id;
	} else if(type == "submit") {
		if(rowData.id){
			newUrl = urlChangeAutionFile;
			dataParam.id = rowData.id;
		}else {
			newUrl = urlUpdateAutionFile;
		}
	}
	$.ajax({
		type: "post",
		url: newUrl,
		datatype: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				parent.layer.alert('文件递交成功！<span class="text-danger">请下载竞价采购文件（如有），若未下载则无法参与报价。</span>',function(){
					parent.$('#AuctionFileList').bootstrapTable('refresh');
					parent.layer.closeAll();
				});
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
$('#btn_sign').click(function(){
	var dataParam = {};
	var projectId = getProjectId();
	//**0.询比采购 1.竞价采购 2.竞买采购 3.询价采购 4.招标采购 5.谈判采购 6.单一来源*/
	dataParam.projectId = projectId;
	//查询签章文件  源  media/js/Model/public.js
	getSignFileOfBidPrice(dataParam, '1', function(){
		getSignRecord(projectId, 'historySignTable');
		$('#btn_sign').hide();
		$('#btn_submit').show();
	});
});
//撤回
$('#btn_back').click(function(){
	top.layer.confirm('温馨提示:撒回后需重新编辑递交竞价文件，请确认是否撒回?', {btn:['是', '否']}, function(ind){
		$.ajax({
			type: "post",
			url: backUrl,
			datatype: 'json',
			data: {'id': rowData.id},
			async: true,
			success: function(result) {
				if(result.success) {
					top.layer.alert('撤回成功');
					type = 'submit';
					du(rowData);
				} else {
					top.layer.alert(result.message);
				}
			}
		});
		top.layer.close(ind)
	})
})