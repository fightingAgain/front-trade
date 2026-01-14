var WORKFLOWTYPE = "zlgd";
var tenderTypeCode = getUrlParam('tenderType'); //0询比，6单一来源
var packageId = getUrlParam('bidSectionId');
var projectId = getUrlParam('projectId');
var uid = getUrlParam('uid');
var type = getUrlParam('type');
var filingState = getUrlParam('filingState');
var employeeId = getUrlParam('employeeId');
var fillingUrl = top.config.AuctionHost + '/ProjectArchiveController/findProjectArchive.do';
var fillingDelet = top.config.AuctionHost + '/ProjectDateController/deleteProjectDateFile'
var downloadFileUrl = config.FileHost + '/FileController/download.do'; //下载文件
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器;
var alldownUrl = top.config.AuctionHost + '/ProjectArchiveController/downloadAllFile.do'; //一键下载
var AccessoryList = [];
var mask;
var gdBackType = '';//退回修改类型
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do"
var isWorkflow='';//判断是否需要审核
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var resData;
$(function() {
	
	mask = top.layer.load(0, {shade: [0.3, '#000000'],shadeClose: false,});
	if(filingState == 1 || filingState == 2) {
		resChu();
	} else {
		if(employeeId == "0") {
			resChu();
		} else {
			filling();
		}
	}
	if(uid) {
		$('.record').show();
		findWorkflowCheckerAndAccp(uid);
	} 
	if(type == 'edit') {
		WorkflowUrl()
		$(".isbtn").show();
	}else{
		$('.employee').hide(); //查看不显示审核人
	}
	$("#btnClose").on('click', function() {
		top.layer.closeAll();
	})
	$("#downLoadAll").on('click', function() {
		var newUrl = alldownUrl + "?packageId=" + packageId + '&tenderType=' + tenderTypeCode;
		window.location.href = $.parserUrlForToken(newUrl);
	})
})

function resChu() {
	$.ajax({
		url: fillingUrl,
		async: false,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		//IE9浏览器ajax的跨域问题
		data: {
			'packageId': packageId,
			'tenderType': tenderTypeCode,
			'projectId': projectId
		},
		success: function(result) {
			if(result.success) {
				resData = result.data;
				$("#projectName").html(resData.projectPackage.projectName);
				$("#projectCode").html(resData.projectPackage.projectCode);
				$("#packageName").html(resData.projectPackage.packageName);
				$("#packageNum").html(resData.projectPackage.packageNum);

				if((resData['基本信息'] == undefined && resData['公告信息'] == undefined) || (resData['基本信息'] == "" && resData['公告信息'] == "")) {
					filling();
				} else {
					dataList();
				}

			}
		}
	});
}
//资料归档
function filling() {
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + '/ProjectArchiveController/saveProjectArchiveForBid.do',
		async: false,
		data: {
			'packageId': packageId,
			'tenderType': tenderTypeCode,
			'projectId': projectId,
			'id': uid
		},
		dataType: "json",
		success: function(ret) {
			if(ret.success) {
				resChu()
				top.$('#DataFilingTable').bootstrapTable('refresh');
			} else {
				layer.alert(ret.message);
				return;
			}
		}
	});
}
//数据渲染
function dataList() {
	$('.pdfName').each(function() {
		var listName = $(this).html();
		var jsonList = resData[listName];
		tableList(listName, jsonList);
		console.log(tableList(listName, jsonList))
		var oFileInput = new FileInput();
		oFileInput.Init(listName, urlSaveAuctionFile, jsonList);
	})
}

function tableList(listName, jsonList) {

	$('table[data-title=' + listName + ']').bootstrapTable({
		pagination: false,
		undefinedText: "",
		classes: 'table table-striped table_list', // Class样式
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				return index + 1
			}
		}, {
			field: 'fileName',
			title: '名称',
			align: 'left',
		}, {
			field: "caoz",
			title: type == 'view' ? '操作' : '<input type="file" class="fileloading" multiple name="files" data-title="' + listName + '">',
			width: '200px',
			events: {
				'click .fileDownload': function(e, value, row, index) {
					var newUrl = downloadFileUrl + "?ftpPath=" + row.fileUrl + "&fname=" + row.fileName;
					window.location.href = $.parserUrlForToken(newUrl);
				},
				'click .previewFile': function(e, value, row, index) {
					openPreview(row.fileUrl);
				},
				'click .delete': function(e, value, row, indexs) {
					top.layer.confirm('温馨提示：是否确定删除？', function() {
						console.log(row.id.length)
						if(row.id.length == '32') {
							$.ajax({
								url: fillingDelet,
								async: false,
								cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
								//IE9浏览器ajax的跨域问题
								data: {
									'id': row.id,
								},
								success: function(result) {
									if(result.success) {
										// resChu()
										parent.layer.alert("删除成功");
										for(var i = 0; i < AccessoryList.length; i++) {
											if(jsonList[indexs].id == AccessoryList[i].id) {
												AccessoryList.splice(i, 1)
											}
										}
										jsonList.splice(indexs, 1);
										tableList(listName, jsonList);
									}
								}
							});
						} else {
							for(var i = 0; i < AccessoryList.length; i++) {
								if(jsonList[indexs].id == AccessoryList[i].id) {
									AccessoryList.splice(i, 1)
								}
							}
							console.log(AccessoryList)
							jsonList.splice(indexs, 1)
							tableList(listName, jsonList)
							parent.layer.alert("删除成功");
						}
					});
				},
			},
			formatter: function(value, row, index) {
				if(row.fileUrl != undefined) {
					var filesnames = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1).toUpperCase();
				} else {
					var filesnames = ""
				}
				var mixtbody = "<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
				/* if(row.fileType == 1 && type == 'edit') {
					mixtbody += "<a href='javascript:void(0)' class='btn btn-danger btn-xs delete'>删除</a>&nbsp;&nbsp"
				} */
				if(type == 'edit'){
					if((gdBackType == 1 && row.fileType == 3) || (gdBackType == 2 && row.fileType == 1) || (gdBackType == '' && row.fileType == 1)){
						mixtbody += "<a href='javascript:void(0)' class='btn btn-danger btn-xs delete'>删除</a>&nbsp;&nbsp"
					}
				}
				if(filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
					mixtbody += "<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
				}
				return mixtbody
			}
		}],
	})
	$('table[data-title=' + listName + ']').bootstrapTable('load', jsonList)

}
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl, jsonList) {
		$('input[data-title=' + ctrlName + ']').fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			allowedFileExtensions: ['jpg', 'bmp', 'png', 'jpeg', 'pdf', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'JPG', 'BMP', 'PNG', 'JPEG', 'PDF', 'ZIP', 'RAR', 'DOC', 'DOCX', 'XLS', 'XLSX'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-sm btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			},
			//			//上传参数
			//			uploadExtraData:function(){//向后台传递参数
			//	            var path=''
			//                return path; 
			//              },

		}).on("filebatchselected", function(event, files) {
			var filesnames = event.currentTarget.files[0].name.split('.')[1]
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			if(data.response.success) {
				var strId = new Date().getTime();
				AccessoryList.push({
					id: strId,
					fileName: data.files[0].name,
					fileSize: data.files[0].size / 1000 + "KB",
					fileUrl: data.response.data[0],
					projectStage: ctrlName,
					fileType: (gdBackType == 1?3:1)
				})
				jsonList.push({
					id: strId,
					fileName: data.files[0].name,
					fileSize: data.files[0].size / 1000 + "KB",
					fileUrl: data.response.data[0],
					fileType: 1

				})
				tableList(ctrlName, jsonList)
			}

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};
$("#btnBao").on('click', function() {
	var fliurl = config.AuctionHost + '/ProjectDateController/submitSelfProjectDate.do';
	sub(fliurl, '保存')
})
$("#btnsubtime").on('click', function() {
	var fliurl = config.AuctionHost + '/ProjectDateController/submitSelfProjectDate.do';
	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			top.layer.alert("请选择审核人");
			return;
		}
	}
	//提交
	if(!isWorkflow) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			sub(fliurl, '提交')
		})
	} else {
		sub(fliurl, '提交')
	}
	
})

function sub(fliurl, titles) {
	var pare = {
		'packageId': packageId,
		'projectId': projectId,
	}
	if(isWorkflow) {
		pare.checkId = $("#employeeId").val();
	} else {
		pare.checkId = 0;
	}
	for(var i = 0; i < AccessoryList.length; i++) {
		pare['projectDateFiles[' + i + '].fileName'] = AccessoryList[i].fileName;
		pare['projectDateFiles[' + i + '].fileUrl'] = AccessoryList[i].fileUrl;
		pare['projectDateFiles[' + i + '].projectStage'] = AccessoryList[i].projectStage;
	}
	$.ajax({
		url: fliurl,
		async: false,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		//IE9浏览器ajax的跨域问题
		data: pare,
		success: function(result) {
			if(result.success) {
				parent.$('#DataFilingTable').bootstrapTable(('refresh')); // 很重要的一步，刷新url
				AccessoryList = [];
				resChu();
				if(titles == "提交") {
					parent.layer.closeAll();
				};
				parent.layer.alert(titles + "成功");
			} else {
				parent.layer.alert(result.message)
			}
		}
	});
}
//加载审核人
function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "zlgd"
		},
		success: function (data) {
			var option = ""
			//判断是否有审核人
			if (data.message == 0) { // 没有设置审核人
				isWorkflow = 0;
				$('.employee').remove()
				return;
			};
			if (data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").remove();
				$('.employee').remove();
				return;
			};
			if (data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if (data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if (data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for (var i = 0; i < data.data.length; i++) {
						option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
					}
				}
			}
			$("#employeeId").html(option);
		}
	});
}