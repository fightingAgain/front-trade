/*

 */
//var pushUrl = top.config.AuctionHost + '/projectReceptionController/push.do'; //推送接口
var pushUrl = top.config.AuctionHost + '/projectReceptionController/NoticeEndProjectPush.do'; //推送接口
//var getInfoUrl = top.config.AuctionHost + '/projectReceptionController/saveLogPushProject.do'; //获取推送数据详情接口
var getInfoUrl = top.config.AuctionHost + '/projectReceptionController/noticePushProject.do'; //获取推送数据详情接口
var dowoloadFileUrl = top.config.AuctionHost + "/deliveryFile/download.do"; //下载文件
var deleteFileUrl = top.config.AuctionHost + "/deliveryFile/deleteDeliveryFile.do"; //删除文件接口
var uploadFileUrl = top.config.AuctionHost + "/deliveryFile/upload.do"; //上传附件
var packageId = $.getUrlParam("packageId"); //包件id
var projectId = $.getUrlParam("projectId"); //项目id
var organNo = $.getUrlParam("organNo"); //企业社会信用码
var type = $.getUrlParam("type"); //view是查看，edit是编辑
var dataType; //推送状态，0未推送，1已推送，2，推送失败
var tenderType = $.getUrlParam("tenderType"); //采购类型：0寻比采购。1竞价采购，2竞卖采购，6单一来源
var pushId = ''; //推送id
var bidId = '';
var fileArr = []; //附件数组
var selSupplier = []; //供应商数组
var AccessoryList = []; //上传附件的数组
var id = '';
var res;
$(function() {
	//关闭当前窗口
	$("#btn_close").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//初始化获取推送数据
	getPushInfo();
	//$("#FileName").fileinput(); //上传插件初始化
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", uploadFileUrl);
	//推送按钮
	$('#btn_submit').click(function() {
		if(top.checkForm($("#DataPush"))) {
			//			var arr = {};
			//			arr = top.serializeArrayToJson($("#DataPush").serializeArray()); //获取表单数据，并转换成对象；
			//			arr.id = pushId;
			//			arr.packageId = packageId;
			//			arr.projectId = projectId;
			//			arr.organNo = organNo;
			//			arr.tenderType = tenderType;
			$.ajax({
				type: "post",
				url: pushUrl,
				async: true,
				data: res,
				success: function(data) {
					if(data.success) {
						parent.layer.alert('推送成功！');
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					} else {
						parent.layer.alert(data.message)
					}

				}
			});
		};
	});
});
/*
 * 获取推送数据
 * */
function getPushInfo() {
	$.ajax({
		type: "post",
		url: getInfoUrl,
		async: false,
		data: {
			'packageId': packageId,
			'projectId': projectId,
			'organNo': organNo
		},
		success: function(data) {
			if(data.success) {
				res = data.data;
				pushId = res.id;
				bidId = res.bidSectionId;
				for(var key in res) {
					$('#' + key).html(res[key]);
				}
				AccessoryList = res.deliveryFiles;
				fileTable(AccessoryList);

				
				//获取推送状态：0未推送，1推送成功，2推送失败
				dataType = res.dataType
				if(res.dataType == 0) {
					$('#dataType').html("未推送");
				} else if(res.dataType == 1) {
					$('#dataType').html("推送成功");
				} else if(res.dataType == 2) {
					$('#dataType').html("推送失败");
				}
				selSupplier = res.selSupplier
				supplierHtml(res.selSupplier)
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}

/*
 * 候选供应商
 * 
 */
function supplierHtml(data) {
	$("#listhistory").bootstrapTable({
		data: data,
		pagination: false,
		undefinedText: "",
		columns: [{
				title: '序号',
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'supplierName',
				title: '投标人',
				align: "center",
				halign: "center",
				width: "15%",
			},
			{
				field: 'socialCreditcode',
				title: '统一社会信用代码',
				align: "center",
				halign: "center",
				width: "15%",

			},
			{
				field: 'openPrice',
				title: '投标报价（元）',
				align: "right",
				halign: "center"
			}, {
				field: 'totalScore',
				title: '最终得分',
				align: "center",
				halign: "center",
				width: "20%",
			}
		]
	});
}

//初始化fileinput
/*-----------附件上传-------------*/
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadFileUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadFileUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png', 'jpeg', 'pdf', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'JPG', 'BMP', 'PNG', 'JPEG', 'PDF', 'ZIP', 'RAR', 'DOC', 'DOCX', 'XLS', 'XLSX'], //接收的文件后缀
			//showUpload: true, //是否显示上传按钮
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
			uploadExtraData: function(previewId, index) { //额外参数的关键点
				return {
					'deliveryId': pushId,
					'ftype': 99
				}
			}

		}).on("filebatchselected", function(event, files) {
			var filesnames = event.currentTarget.files[0].name.split('.')[1];
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			if(data.response.success) {
				AccessoryList.push({
					id: data.response.data.id,
					name: data.files[0].name,
					fileSize: data.files[0].size / 1000 + "KB",
					ftpPath: data.response.data.ftpPath,
					ftype: 99
					//createTime: new Date().Format("yyyy-MM-dd hh:mm:ss")
				})
			}

			fileTable(AccessoryList);
			getPushInfo()

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

// 附件信息
function fileTable(AccessoryList) {
	console.log(AccessoryList);
	var str = '';
	for(var i = 0; i < AccessoryList.length; i++) {
		str += '<div class="class' + 0 + '" data-index="' + 0 + '"><span class="ov">' + AccessoryList[i].name + '</span>';
		str += '<button class="btn btn-primary" onclick="openAccessory(\'' + AccessoryList[i].name + '\',\'' + AccessoryList[i].ftpPath + '\')">下载</button>';
		var fileExtension = AccessoryList[i].name.substring(AccessoryList[i].name.lastIndexOf('.') + 1);
		fileExtension = fileExtension.toLowerCase();
		if(fileExtension == 'pdf' || fileExtension == 'jpg' || fileExtension == 'gif' || fileExtension == 'bmp' || fileExtension == 'png') {
			str += '<button type="button" class="btn btn-primary" onclick="previewFile(\'' + AccessoryList[i].ftpPath + '\')">预览</button>';
		}

		str += '<button type="button" class="btn btn-danger" onclick="deleteFile2(\'' + AccessoryList[i].id + '\')">删除</button></div>';

	}
	//$('.fileBox' + uploadFileArr[i].fileType).html(str);
	$('.fileBoxlist').html(str)
}
// 查看附件
function previewFile(fileUrl) {
	openPreview(fileUrl);
}
//文件下载
function openAccessory(fileName, fileUrl) {
	var newUrl = dowoloadFileUrl + "?ftpPath=" + encodeURI(fileUrl) + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

function deleteFile2(id) {
	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(indexs, layero) {
		$.ajax({
			type: "post",
			url: deleteFileUrl,
			async: false,
			dataType: 'json',
			data: {
				"deliveryFileId": id,
			},
			success: function(data) {
				if(data.success) {
					getPushInfo();
					parent.layer.close(indexs);
				} else {
					parent.layer.alert(data.message)
				}
			}
		});
	})
}