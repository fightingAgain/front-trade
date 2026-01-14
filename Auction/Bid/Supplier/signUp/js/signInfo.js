//var projectID = $.query.get("key");
//var packageID = $.query.get("kid");
var urlSaveAuctionFile = config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var saveflieUrl = top.config.bidhost + '/PurFileController/insertOfferFileList.do';
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //
var searchExamFileUrl = config.bidhost + '/BidFileController/findReceiptExamList.do'; //采购文件分页
var deleteFileUrl = config.bidhost + '/PurFileController/deleteOfferFile.do'; //删除已上传文件信息
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
var downloadFileUrl = config.bidhost + "/FileController/download.do"; //文件下载
var packageCheckLists = [];
var fileData = [];
var type = getUrlParam('type');
var submitTimeout = getUrlParam('submitTimeout');
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var checkTimeout=getUrlParam('checkTimeout');
var resetFlieUrl = config.bidhost + "/PurFileController/updateOfferFile.do";//文件撤回

var tempPackageCheckList = new Array();//资格预审评审项

$(function() {
	//submitTimeout为0表示可以递交资格申请文件，为1表示不能递交
	if(submitTimeout == 0) {
		
		
	}
	else {
		//查看页面
		if(type == "view"){
			$("#btn_bao").hide();
			$("#btn_submit").hide();			
		}else{
			$("#btn_bao").show();
			$("#btn_submit").show();	
		}
	}
	offer();
	setFileHistory();//加载文件上传撤回历史记录
	findReceipt1();
	findReceipt2();
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
});
//获取项目信息及评审项
function offer() {
	$.ajax({
		url: config.bidhost + '/PurchaseController/findProjectPackageInfo.do',
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			id: packageId,
		},
		success: function(data) {

			$('div[id]').each(function() {
				$(this).html(data.data[this.id]);
			});
			$("#projectId").val(data.data.projectId) //项目ID			

			var packageCheckList = data.data.packageCheckLists;
			var tr = "";
			for(var i = 0; i < packageCheckList.length; i++) {
				if(packageCheckList[i].examType == 0) {
					packageCheckLists.push(packageCheckList[i])
				}
			}
			for(var i = 0; i < packageCheckLists.length; i++) {

				tr += '<tr><td style="text-align: center;">' + (i + 1) + '</td>' +
					'<td style="text-align: left;text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + packageCheckLists[i].checkName + '</td>' +
					'<td style="text-align: left;text-overflow: ellipsis;white-space:nowrap;overflow:hidden;"><span id="fileName' + i + '"></span><input type="hidden" id="fileid' + i + '"></td>'
				if(submitTimeout == 0) {
					tr += '<td style="text-align: center;">' +
						'<span style="float: left;" class="btn btn-primary btn-file" id="fileBtn' + i + '" onclick=fileBtn(' + i + ',\"' + packageCheckLists[i].id + '\")>' +
						'<i id="ian' + i + '" class="glyphicon glyphicon-folder-open" ></i>' +
						'<span id="span' + i + '" class="hidden-xs">&nbsp;&nbsp;选择 …</span>' +
						'<input type="file" class="fileloading" data-show-preview="false" name="files" id="FileName' + i + '">' +
						'</span>' +
						'<span id="up' + i + '" style="float:left;margin-left:10px" class="btn btn-primary caozu" onclick=fileDownload(' + i + ')>下载</span>' +
						'<span id="de' + i + '" style="margin-left:10px;float: left;" class="btn btn-danger caozu" onclick=fileDetel(' + i + ',\"' + packageCheckLists[i].id + '\")>删除</span>' +
						'<span id="res' + i + '" style="float:left;margin-left:10px" class="btn btn-warning caozu" onclick=reset(' + i + ')>撤回</span>'+
						'</td>'
				} else if(submitTimeout == 1) {
					tr += '<td style="text-align: center;">' +
						'<span style="float:left;margin-left:10px" class="btn btn-primary caozu" onclick=fileDownload(' + i + ')>下载</span></td>';
						/*'<span style="float:left;margin-left:10px" class="btn btn-warning" onclick=reset(' + i + ')>撤回</span>'*/
						
				}
				tr += '</tr>'
				fileData.push({
					projectId: projectId,
					packageId: packageId,
					packageCheckListId: "",
					examType: packageCheckLists[0].examType,
					checkName: packageCheckLists[i].checkName,
					id:"",
					fileName: "",
					filePath: "",
					fileSize: ""
				});
			}
			$("#tablede").html(tr);
			fileDataBtn();

		}
	});
}
var bersak = "";

//撤回资格申请文件
function reset($index){
	if(submitTimeout== 1) {
		parent.layer.alert("评审已开始，无法撤回！");
		return;
	}
	
	parent.layer.confirm('温馨提示：撤回后需重新上传，请确认是否撤回？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(layerIndex, layero) {
			$.ajax({
			   	url:resetFlieUrl,
			   	type:'post',
			   	async:false,			   
			   	data:{			   		
			   		'id':fileData[$index].id
			   	},
			   	success:function(data){	   	
			   		if(data.success){
			   			addReceipt(3,fileData[$index].id);
			   			$('#historyFileTable').bootstrapTable('refresh');
			   			parent.layer.alert("撤回成功");
			   			$("#fileName" + $index).html('');
			   			$('#fileBtn'+$index).show();
						$('#up'+$index).hide();
						$('#de'+$index).hide();
						$('#res'+$index).hide();
						$("#btn_bao").show();
						$("#btn_submit").show();				       
						fileData[$index].packageCheckListId="";						
						fileData[$index].fileName="";
						fileData[$index].filePath="";
						fileData[$index].fileSize="";
						//fileDataBtn();
						findReceipt1();
						setFileHistory();
						//刷新父页面
						parent.$('#table').bootstrapTable('refresh');
			   		}else{
			   			parent.layer.alert("撤回失败");	
			   		}
			   	}
			});
	}, function(layerIndex) {
		parent.layer.close(layerIndex)
	});
	
}

var ReceiptData1;
function findReceipt1(){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/findReceiptList.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:2,//资格申请提交回执单
		},
		async: false,
		success: function(data) {
			if(data.success){			
				ReceiptData1=data.data;
			}
		}
	});
}

var ReceiptData2;
function findReceipt2(){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/findReceiptList.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:3,//资格申请撤回回执单
		},
		async: false,
		success: function(data) {
			if(data.success){			
				ReceiptData2 =data.data;
			}
		}
	});
}

//生成回执单
function addReceipt(receiptType,fileId){
	$.ajax({
		type: "post",
		url: top.config.bidhost + "/BidFileController/insertBidReceipt.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			receiptType:receiptType,//资格申请回执单类型
			fileId:fileId
		},
		async: false,
		success: function(data) {
			if(data.success){
				//top.$('#table').bootstrapTable(('refresh'));
				//top.layer.closeAll();
				//top.layer.alert("生成回执成功");
				findReceipt1();
				findReceipt2();
			}else{
				//top.layer.closeAll();
				if(data.message){
					top.layer.alert(data.message);
				}else{
					//top.layer.alert("生成回执单失败");
				}
			}
		}
	});
}

//预览
$("#btnShowFile").click(function(){
	if(ReceiptData1.length >0){
		previewPdf(ReceiptData1[0].filePath);
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + ReceiptData1[0].filePath));
	}
})

//下载
$("#btnDownLoad").click(function(){
	if(ReceiptData1.length >0){
		var newUrl = downloadFileUrl + "?ftpPath=" + ReceiptData1[0].filePath +"&fname="+"资格申请文件提交回执单.pdf";
		window.location.href = $.parserUrlForToken(newUrl);
	}
})

function fileBtn(num, uid) {
	bersak = 0;
	var oFileInput = new FileInput();
	oFileInput.Init("FileName" + num, urlSaveAuctionFile, num, uid);
	$("#fileBtn" + num).removeClass("btn");
	$("#fileBtn" + num).removeClass("btn-primary");
	$("#fileBtn" + num).removeClass("btn-file");
	$("#ian" + num).hide();
	$("#span" + num).hide();
};
//文件删除

function fileDetel(num) {
	parent.layer.confirm("温馨提示：是否确认删除该文件?", {
		btn: ['确 定', '取 消']
	},
	function(index) {
        $('#fileName' + num).html("");
		$('#fileSize' + num).html("");
		fileData[num].packageCheckListId="";
		fileData[num].fileName="";
		fileData[num].filePath="";
		fileData[num].fileSize="";
		var id = $('#fileid' + num).val();
		$.ajax({
			url: deleteFileUrl,
			type: 'post',
			async: false,
			data: {
				'id': id,
			},
			success: function(data) {
				//fileData.splice(num,1);				
				$('#fileBtn'+num).show();
				$('#up'+num).hide();
				$('#de'+num).hide();
				$('#res'+num).hide();
			}
		});
		parent.layer.close(index)
	}
);
	

}
//文件下载
function fileDownload($index) {
	if($('#fileName' + $index).html() == "") {
		parent.layer.alert("无附件无法下载")
		return
	}
	var newUrl = downloadFileUrl + "?ftpPath=" + fileData[$index].filePath + "&fname=" + fileData[$index].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）

	oFile.Init = function(ctrlName, uploadUrl, i, uid) {
		$("#" + ctrlName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['jpg', 'gif', 'png','pdf','zip','rar'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			//showCaption: true, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			showRemove: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			}
			//上传参数
		}).on("filebatchselected", function(event, files) {
			var upFileName = event.currentTarget.files[0].name;
			var index1 = upFileName.lastIndexOf(".");
			var index2 = upFileName.length;
			var filesnames = upFileName.substring(index1 + 1, index2).toUpperCase(); //后缀名
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
//			var upFileName = event.currentTarget.files[0].name;
//			var index1 = upFileName.lastIndexOf(".");
//			var beforName=upFileName.substring(0,index1);
//			var regEn = /[`~!@#$%^&*_+?"{}.\/;'[\]]/im,
//  			regCn = /[·！#￥——；|<>[\]]/im;
//			if(regEn.test(beforName) || regCn.test(beforName)) {
//			    parent.layer.alert("名称不能包含"+ regEn+regCn+"等特殊字符");
//			    $(this).fileinput("reset"); //选择的格式错误 插件重置
//			    return false;
//        	}
//			var index2 = upFileName.length;
//			var filesnames = upFileName.substring(index1 + 1, index2).toUpperCase(); //后缀名
//			if(filesnames != 'DOCX' && filesnames != 'DOC' && filesnames != 'PDF' && filesnames != 'XLSX' && filesnames != 'XLS' && filesnames != 'JPGE' && filesnames != 'JPG' && filesnames != 'ZIP' && filesnames != 'RAR') {
//				parent.layer.alert('上传附件格式错误,请根据提示上传附件');
//				$(this).fileinput("reset"); //选择的格式错误 插件重置
//				return;
//			};
			if(event.currentTarget.files[0].size > 2*1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			if(data.response.success){
				$('#fileName' + i).html(data.files[0].name);
				//上传到附件信息表中
				//if(bersak==0){								
				fileData[i].packageCheckListId = uid;
				fileData[i].fileName = data.files[0].name;
				fileData[i].filePath = data.response.data[0];
				fileData[i].fileSize = data.files[0].size / 1000 + "KB";
				$("#fileBtn"+i).hide();
				$('#up'+i).show();
				$('#de'+i).show();
			}
			//bersak=1;		    
			//return bersak;
			//};
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

//保存资格申请文件
$("#btn_bao").click(function() {
	if(submitTimeout == 1) {
		parent.layer.alert("温馨提示：资格预审申请文件递交时间已截止，无法递交！");
		return;
	}
	//先重新加载文件数据	
	var purFileList = "";
	for(var i = 0; i < fileData.length; i++) {
		if(fileData[i].fileName != "") {
			if(i == 0) {
				purFileList += 'offerFileList[' + i + '].projectId=' + fileData[i].projectId
				purFileList += '&offerFileList[' + i + '].packageId=' + fileData[i].packageId
				purFileList += '&offerFileList[' + i + '].packageCheckListId=' + fileData[i].packageCheckListId
				purFileList += '&offerFileList[' + i + '].examType=' + fileData[i].examType
				purFileList += '&offerFileList[' + i + '].fileName=' + fileData[i].fileName
				purFileList += '&offerFileList[' + i + '].filePath=' + fileData[i].filePath
				purFileList += '&offerFileList[' + i + '].fileSize=' + fileData[i].fileSize
				purFileList += '&offerFileList[' + i + '].fileState=0'
			} else {
				purFileList += '&offerFileList[' + i + '].projectId=' + fileData[i].projectId
				purFileList += '&offerFileList[' + i + '].packageId=' + fileData[i].packageId
				purFileList += '&offerFileList[' + i + '].packageCheckListId=' + fileData[i].packageCheckListId
				purFileList += '&offerFileList[' + i + '].examType=' + fileData[i].examType
				purFileList += '&offerFileList[' + i + '].fileName=' + fileData[i].fileName
				purFileList += '&offerFileList[' + i + '].filePath=' + fileData[i].filePath
				purFileList += '&offerFileList[' + i + '].fileSize=' + fileData[i].fileSize
				purFileList += '&offerFileList[' + i + '].fileState=0'
			}

		} else {
			top.layer.alert("请上传" + fileData[i].checkName + "的资格预审申请文件");
			return false;
		}
	};
	purFileList += "&projectId=" + projectId + "&packageId=" + packageId + "&examType=0";
	$.ajax({
		url: saveflieUrl,
		type: 'post',
		async: false,
		data: purFileList,
		success: function(data) {
			if(data.success) {
				//parent.layer.closeAll();
				parent.layer.alert("保存成功");
				fileDataBtn();
				//刷新父页面
				parent.$('#table').bootstrapTable('refresh');
			} else {
				//parent.layer.closeAll();
				parent.layer.alert("保存失败");
			}
		}
	});
})

//提交资格申请文件
$("#btn_submit").click(function() {
	if(submitTimeout == 1) {
		parent.layer.alert("温馨提示：资格预审申请文件递交时间已截止，无法递交！");
		return;
	}	
	var purFileList = "";
	for(var i = 0; i < fileData.length; i++) {
		if(fileData[i].fileName != "") {
			if(i == 0) {
				purFileList += 'offerFileList[' + i + '].projectId=' + fileData[i].projectId
				purFileList += '&offerFileList[' + i + '].packageId=' + fileData[i].packageId
				purFileList += '&offerFileList[' + i + '].packageCheckListId=' + fileData[i].packageCheckListId
				purFileList += '&offerFileList[' + i + '].examType=' + fileData[i].examType
				purFileList += '&offerFileList[' + i + '].fileName=' + fileData[i].fileName
				purFileList += '&offerFileList[' + i + '].filePath=' + fileData[i].filePath
				purFileList += '&offerFileList[' + i + '].fileSize=' + fileData[i].fileSize
				purFileList += '&offerFileList[' + i + '].fileState=1'
			} else {
				purFileList += '&offerFileList[' + i + '].projectId=' + fileData[i].projectId
				purFileList += '&offerFileList[' + i + '].packageId=' + fileData[i].packageId
				purFileList += '&offerFileList[' + i + '].packageCheckListId=' + fileData[i].packageCheckListId
				purFileList += '&offerFileList[' + i + '].examType=' + fileData[i].examType
				purFileList += '&offerFileList[' + i + '].fileName=' + fileData[i].fileName
				purFileList += '&offerFileList[' + i + '].filePath=' + fileData[i].filePath
				purFileList += '&offerFileList[' + i + '].fileSize=' + fileData[i].fileSize
				purFileList += '&offerFileList[' + i + '].fileState=1'
			}

		} else {
			top.layer.alert("请上传" + fileData[i].checkName + "的资格预审申请文件");
			return false;
		}
	};
	purFileList += "&projectId=" + projectId + "&packageId=" + packageId + "&examType=0"+"&fileType="+"递交";
	$.ajax({
		url: saveflieUrl,
		type: 'post',
		async: false,
		data: purFileList,
		success: function(data) {
			if(data.success) {
				//parent.layer.closeAll();
				addReceipt(2,'');
				parent.layer.alert("递交资格预审申请文件成功");
				$("#btnShowFile").show();
				$("#btnDownLoad").show();
				$("#btn_bao").hide();
				$("#btn_submit").hide();
				$("#btn_close").show();
				fileDataBtn();
				findReceipt1();
				setFileHistory();
				//刷新父页面
				parent.$('#table').bootstrapTable('refresh');
			} else {
				//parent.layer.closeAll();
				parent.layer.alert(data.message);
			}
		}
	});
})

//关闭当前页面
$("#btn_close").click(function() {
	//递交文件的关闭按钮
	if(type != "view"){
		var str = [];
		for(var i = 0; i < fileData.length; i++) {
			if(fileData[i].fileName == "") {
				//未上传的文件
				str.push(fileData[i].checkName);
			}
		}
	
		if(str.length > 0) {
			parent.layer.confirm("您还未递交" + str + "的资格预审申请文件,确定关闭吗?", {
					btn: ['确 定', '取 消']
				},
				function(index) {
					parent.layer.close(index);
					parent.layer.close(parent.layer.getFrameIndex(window.name));
				}
			);
		} else {
			parent.layer.close(parent.layer.getFrameIndex(window.name));
		}
	}else{
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	}	
})

function fileDataBtn() {	
	$.ajax({
		url: searchUrlFile,
		type: 'get',
		async: false,
		data: {
			'packageId': packageId,
			'examType': 0,
			'enterpriseType': '06',
			'isView':0
		},
		success: function(data) {
			if(data.success) {
				if(data.data.length > 0) {
//					var isFileState=true;
					var fileNum=[]//文件状态为正式提交的数量的数组
					for(var i = 0; i < data.data.length; i++) {
						for(var x = 0; x < packageCheckLists.length; x++) {
							if(data.data[i].packageCheckListId == packageCheckLists[x].id) {
								$("#fileName" + x).html(data.data[i].fileName);
								$('#fileid' + x).val(data.data[i].id);
								fileData[x].packageCheckListId = packageCheckLists[x].id;
								fileData[x].fileName = data.data[i].fileName;
								fileData[x].filePath = data.data[i].filePath;
								fileData[x].fileSize = data.data[i].fileSize;
								fileData[x].id = data.data[i].id;
							}
							if($("#fileName" + x).html()!=""){
								$("#btnShowFile").show();
								$("#btnDownLoad").show();
							}
							if($("#fileName" + x).html()==""){
								$('#fileBtn'+x).show();
								$('#up'+x).hide();
								$('#de'+x).hide();
								$('#res'+x).hide();
								$("#btnShowFile").hide();
								$("#btnDownLoad").hide();
							}else{
								$('#fileBtn'+x).hide();
								$('#up'+x).show();
								$('#de'+x).hide();
								$('#res'+x).show();
							}
							if(data.data[i].fileState==0){
								isFileState=false;								
								$('#res'+x).hide();	
								$('#de'+x).show();
							}
						}
						if(data.data[i].fileState==1){
								fileNum.push(data.data[i]);								
								
							}
					}
					if(fileNum.length==packageCheckLists.length){//如果文件状态为1的数量跟评审项的数量相同则可以预览和下载回执单
						$("#btnShowFile").show();
						$("#btnDownLoad").show();
						$("#btn_bao").hide();
						$("#btn_submit").hide();
						$("#btn_close").show();
					}else{
						$("#btnShowFile").hide();
						$("#btnDownLoad").hide();
						$("#btn_bao").show();
						$("#btn_submit").show();
						$("#btn_close").show();
					}
				}else{//当没有文件时
					$("#btnShowFile").hide();
					$("#btnDownLoad").hide();
					$('.caozu').hide();
				}
			}

		}
	});
};


//挂载采购文件上传撤回请求
function setFileHistory() {
	$.ajax({
		type: "post",
		url: searchExamFileUrl,
		dataType: 'json',
		data: {
			'packageId': packageId,
			'examType': 0,
			'enterpriseType': '06',
			'isView':1
		},
		async: false,
		success: function(result) {
			if(result.success) {
				findReceipt2();
				setFileHistoryHTML(result.data) //有记录显示
			} else {
				top.layer.alert(result.message);
			}
		}
	})
}


//挂载采购文件下载记录
function setFileHistoryHTML(data) {
	$("#historyExamFileTable").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [
			{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "操作人",
				align: "left",
				field: 'userName',				
			},
			{
				title: "操作时间",
				align: "center",
				field: 'subDate',
				width: '180'
			},
			{
				field: "receiptType",
				align: "center",
				title: "状态",
				width: '100',
				formatter: function(value, row, index) {
					if(value==2||value==7){
						return "提交"
					}else if(value==3){
						return "撤回"
					}
				}
			}, 
			{
				title: "操作",
				align: "center",
				width:"250",
				field: '',
				formatter: function(value, row, index) {
					//var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var mixtbody=""
					/*if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>&nbsp;&nbsp"
						}
						mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick=fileDownload(" + index + ")>下载</a>&nbsp;&nbsp";*/
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-sm' onclick='btnShowFile3(\"" + row.filePath + "\")'>回执单预览</a>&nbsp;&nbsp"
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-sm' onclick='btnDownLoad3(\"" + row.filePath + "\")'>回执单下载</a>&nbsp;&nbsp"
					return mixtbody;
				}
			}
		]

	})
	$("#historyExamFileTable").bootstrapTable('load', data);
	
	$(".fixed-table-loading").hide();
	$(".no-records-found").hide();
}

//文件回执单预览
function btnShowFile3(path){
	
	previewPdf(path);
		
}
//文件回执单撤回
function btnDownLoad3(path){

	var newUrl = downloadFileUrl + "?ftpPath=" + path +"&fname="+"资格申请文件记录回执单.pdf";
	window.location.href = $.parserUrlForToken(newUrl);

}



//撤回回执单预览
function btnShowFile2(index){
	if(ReceiptData2.length >0){
		for(var i = 0; i < ReceiptData2.length; i++){
			if(index == i){
				previewPdf(ReceiptData2[i].filePath);
				//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + ReceiptData2[i].filePath));
			}
		}
	}
}
//撤回回执单下载
function btnDownLoad2(index){
	if(ReceiptData2.length >0){
		for(var i = 0; i < ReceiptData2.length; i++){
			if(index == i){
				var newUrl = downloadFileUrl + "?ftpPath=" + ReceiptData2[i].filePath +"&fname="+"资格申请文件撤回回执单.pdf";
				window.location.href = $.parserUrlForToken(newUrl);
			}
		}
	}
}

//文件下载
function fileReDownload(filePath,fileName) {
			var newUrl =downloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
			window.location.href = $.parserUrlForToken(newUrl);
		}
//文件预览
function previewFile(obj) {
	parent.openPreview(obj, "850px", "700px");
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}