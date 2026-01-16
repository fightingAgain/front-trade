/*

 */
//var pushUrl = top.config.Reviewhost + '/ReviewControll/publishReviewByNoticeInfo.do'; //推送接口
var pushUrl = top.config.tenderHost + '/pushCheckPublicityProject/publicityPush.do'; //推送接口
var getInfoUrl = top.config.tenderHost + '/projectReceptionController/findPublicityPushInfo.do'; //获取推送数据详情接口
//var getInfoUrl = top.config.Reviewhost + '/ReviewControll/findReviewByBidSectionInfo.do'; //获取推送数据详情接口
var fileUrl = top.config.FileHost + "/FileController/streamFile.do"; //H5上传地址
var flashFileUrl = top.config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址
var dowoloadFileUrl = top.config.FileHost + "/FileController/downloadDecoderFile.do"; //下载文件
var delUrl = top.config.tenderHost + '/projectReceptionController/delete.do';//删除
var fileAddUrl = top.config.tenderHost + "/projectReceptionController/uploadAttachments.do"; //添加附件表的地址
var bidSectionId = $.getUrlParam("id"); //包件id
var examType = $.getUrlParam("examType"); //view是查看，edit是编辑
var dataType; //推送状态，0未推送，1已推送，2，推送失败
var tenderType = $.getUrlParam("tenderType"); //采购类型：0寻比采购。1竞价采购，2竞卖采购，6单一来源
var pushId = ''; //推送id
var bidId = '';
var fileArr = []; //附件数组
var selSupplier = []; //供应商数组
var id = '';
var res;
var fileUploads = null;
$(function() {
	//关闭当前窗口
	$("#btn_close").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

   //初始化获取推送数据
	getPushInfo();
	//删除文件
	$("#fileList").on('click', '.btnDel', function() {
		var delId = $(this).closest('td').attr('data-file-id'); //要删除的文件对应的文件ID
		var delTr = $(this).closest('tr'); // 列表中要删除的行
		var delIndex = $(this).closest('tr').index();
		$.ajax({
			type: 'post',
			url: fileDelUrl,
			data: {
				'id': delId
			},
			success: function(data) {
				if(data.success) {
					fileList.splice(delIndex, 1);
					delTr.remove();
					fileTable(fileList);
				}
			},
			error: function() {
				parent.layer.alert(msg);
			}
		})
	})

	//下载文件
	$('body').on('click', '.btn_load', function () {
		var path = $(this).attr('data_url');
		var name = $(this).attr('data_name');
		/*name = name.substring(0, name.lastIndexOf("."));*/
		var loadUrl = dowoloadFileUrl + '?Token=' + token + '&ftpPath=' + path + '&fname=' + name.replace(/\s+/g, "");
		window.location.href = encodeURI(loadUrl);
	});
	//移除btnDel
	$('body').on('click', '.btnDel', function () {
		var tr = $(this).closest('.file_cont').find('.keep');
		var id = $(this).closest('.file_cont').prop('id');
		var index = $(this).closest('.keep').prevAll().length;
		var delId = $(this).attr('data-file');
		top.layer.confirm('确定删除该文件?', { icon: 3, title: '提示' }, function (ind) {
			//do something
			var arr = [];
			for (var i = 0; i < tr.length; i++) {
				var obj = {};
				obj.name = $(tr[i]).attr('data-name');
				obj.ftpPath = $(tr[i]).attr('data-url');
				obj.id = $(tr[i]).attr('data-id');
				arr.push(obj)
			};
			arr.splice(index, 1);
			var html = '';
			for (var j = 0; j < arr.length; j++) {
				html += '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + arr[j].ftpPath + '" data-name="' + arr[j].name + '" data-id="' + arr[j].id + '">';
				html += '<div style="margin-right:30px;float:left;">' + arr[j].name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + arr[j].ftpPath + '" data_name="' + arr[j].name + '">下载</a>';
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + arr[j].id + '">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
			}
			$('#' + id).html(html);
			delFile(delId);
			top.layer.close(ind);
		});
	})
	//推送按钮
	$('#btn_submit').click(function() {
		if(top.checkForm($("#formProject"))) {
			//			var arr = {};
			//			arr = top.serializeArrayToJson($("#formProject").serializeArray()); //获取表单数据，并转换成对象；
			//          arr.res=res
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
			'packageId': bidSectionId,
			'examType': examType
		},
		success: function(data) {
			if(data.success) {
				res = data.data;
				pushId = res.id;
				bidId = res.bidSectionId;
				for(var key in res) {
					$("#" + key).html(res[key])
				}
				//fileArr = res.deliveryFiles;
				if(res.deliveryFiles && res.deliveryFiles.length > 0) {
					fileArr = res.deliveryFiles;
					fileList = fileArr;
					fileHtml(fileList);
				}
				if(res.dataType == 0) {
					$("#dataType").html('未推送');
				} else if(res.sendState == 1) {
					$("#dataType").html('推送');
				} else {
					$("#dataType").html();
				}
				selSupplier = res.selSupplier
				supplierHtml(res.selSupplier)
				for (var i = 0; i < $('.fileUp').length; i++) {
                 var eleSlect = $('.fileUp').eq(0).prop('id');
					var eleCont = $('.fileUp').eq(0).closest('.file_iterm').next().prop('id');
					var fileCont = $('.fileUp').eq(0).closest('.file_iterm').nextAll('.file_cont').prop('id')
				
					var name = $('.fileUp').eq(0).attr('data-name');
					var ftype = 36;
					//var supplierId = $('#fileUp').eq(0).attr('data-id');
					fileUpload(eleSlect, eleCont, fileCont, pushId, name, ftype);
				}
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
				field: 'legalCode',
				title: '统一社会信用代码',
				align: "center",
				halign: "center",
				width: "15%",

			},
			{
				field: 'finalPrice',
				title: '投标报价（元）',
				align: "left",
				halign: "center"
			}, {
				field: 'score',
				title: '最终得分',
				align: "center",
				halign: "center",
				width: "20%",
			}
		]
	});

}

function fileHtml(data) {
	for(var i = 0; i < data.length; i++) {

		var html = '<div class="keep" style="margin-bottom:10px;margin-top:10px;" data-url="' + data[i].ftpPath + '" data-name="' + data[i].name + '" data-id="' + data[i].id + '">';
		html += '<div style="margin-right:30px;float:left;">' + data[i].name + '</div>'
		html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + data[i].ftpPath + '" data_name="' + data[i].name + '">下载</a>';
		/*if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
			html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
		}*/
		html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + data[i].id + '">移除</a></div>'
		html += '<div style="clear:both;"></div></div>';
		$(html).appendTo('#fileList_36')

	}
}

function fileUpload(eleSlect, eleCont, fileCont, id, name, ftype) {

	var config = {
		multipleFiles: false, // 多个文件一起上传, 默认: false 
		/* swfURL : "/swf/FlashUploader.swf", // SWF文件的位置*/
		browseFileBtn: " ",
		/** 显示选择文件的样式, 默认: `<div>请选择文件</div>` */
		filesQueueHeight: 0,
		/** 文件上传容器的高度（px）, 默认: 450 */
		messagerId: '', //显示消息元素ID(customered=false时有效)
		frmUploadURL: flashFileUrl, // Flash上传的URI 
		uploadURL: fileUrl, //HTML5上传的URI 
		browseFileId: eleSlect, //文件选择DIV的ID
		filesQueueId: eleCont,//文件显示容器的ID(customered=false时有效)
		autoUploading: true, //选择文件后是否自动上传
		autoRemoveCompleted: true, //文件上传后是否移除
		postVarsPerFile: {
			//自定义文件保存路径前缀
			basePath: "/" + bidId,
			Token: $.getToken(),
		},
//		onSelect: function(list) {
//			parent.loadMaskIndex = parent.layer.msg('文件数据上传中,请勿离开当前页面或刷新.', {
//				icon: 16,
//				shade: 0.2,
//				time: false
//			});
//			console.log(list)
//		},
		onRepeatedFile: function(file) {
			parent.layer.alert("文件： " + file.name + " 已存在于上传队列中，请勿重复上传！")
			//		  console.log("文件： " + file.name
			//		   + " 大小：" + file.size + "已存在于上传队列中");
			return false;
		},
		onComplete: function(file) { /** 单个文件上传完毕的响应事件 */

			var path = JSON.parse(file.msg).data.filePath;
			var obj = {
				'ftpUrl': path,
				'fileName': file.name,
				'id': id,
				'name': name,
				'fType': ftype
			}
		//	parent.layer.close(loadMaskIndex);
			saveFile(obj, {
				'id': id,
				'name': name,
				'fileCont': fileCont
			});
		},
		onSelect: function(list) { //	选择文件后的响应事件

		}
	};
	var _t = new Stream(config);
}

function saveFile(obj, elseDatas) {
	var filedatas = '';
	$.ajax({
		type: "post",
		url: fileAddUrl,
		async: true,
		data: obj,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			loadMaskIndex = parent.layer.msg('文件数据上传成功,正在处理数据,请稍候...', {
				icon: 16,
				shade: 0.3,
				time: false
			});
		},
		success: function(res) {
			parent.layer.close(loadMaskIndex);
			if(!res.success) {
				top.layer.alert(res.message)
			} else {
				layer.msg('文件上传成功');
				filedatas = res.data;
				var html = '<div class="keep" style="margin-bottom:10px;margin-top:10px;"  data-url="' + filedatas.ftpPath + '" data-name="' + filedatas.name + '" data-id="' + filedatas.id + '">';
				html += '<div style="margin-right:30px;float:left;">' + filedatas.name + '</div>'
				html += '<div style="float:left;"><a  style="cursor: pointer;" class="btn_load" data_url="' + filedatas.ftpPath + '" data_name="' + ((elseDatas.supplierId && elseDatas.supplierId != "") ? elseDatas.name : filedatas.name) + '">下载</a>';
				/*if(type == 'pdf' || type == 'PDF' || type == 'jpg' || type == 'JPG' || type == 'png' || type == 'PNG'){
					html += '<span style="margin: 0 10px;">|</span><a style="cursor: pointer;" class="btn_view" data_url="'+path+'">预览</a>'
				}*/
				html += '<a style="cursor: pointer;color:red;margin-left:20px;" class="btnDel" data-file="' + filedatas.id + '">移除</a></div>'
				html += '<div style="clear:both;"></div></div>';
				// if (elseDatas.supplierId && elseDatas.supplierId != '') {
				// 	$('#' + elseDatas.fileCont).html(html);
				// } else {
				$(html).appendTo('#' + elseDatas.fileCont);
				// }
			}
		}
	});
	// return datas
}

//删除
function delFile(id) {
	$.ajax({
		type: "post",
		url: delUrl,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (!data.success) {
				top.layer.alert(data.message)
			} else {
				top.layer.alert('删除成功！')
			}
		}
	});
}
