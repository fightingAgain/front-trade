var packageId = getQueryString("packageId");
var projectId = getQueryString("projectId");
var isFile = getQueryString("isFile");
var isUpdate = getQueryString("isUpdate");
var tenderType = 2; //0是询价采购  1是竞价采购
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //上传文件到服务器
var saveProjectSupplement = top.config.AuctionHost + '/ProjectSupplementController/saveProjectSupplement.do' //
var WorkflowUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var oldNoticeStartDate = sessionStorage.getItem('oldNoticeStartDate')
var isChecker = ""; //是下一级审核还是系统审核
var isCheck = false; //是否设置流程
var saveUrl = ""
var examTypes;
var inviteStates;
var isSigns;
var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
//var projectIds;
$(function() {
	//if(isUpdate != 1){	
    $('#supplementDate').hide();
	saveUrl = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口
	$("#lblauctionStartDate").html("竞卖开始时间");
	$("#lblofferEndDate").html("竞卖文件递交截止时间");
	$("#oldlblofferEndDate").html("原竞卖文件递交截止时间");
	$("#lblcheckEndDate").html("竞卖文件审核截止时间");
	$("#oldlblcheckEndDate").html("原竞卖文件审核截止时间");
	if(isFile != "" && isFile == '1') {
		//没递交竞价文件
		$(".offerEndDateDiv").hide();
	}

	setSupplementChecker(); //添加审核人信息
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	$(".btn-file").after("<span class='text-danger' style='margin-left:15px;'>*每次只能选择一个PDF、WORD、压缩文件格式文件上传！</span>");
	oldTime();
	Purchasetime();//时间设置
})

$("#btn_submit").click(function() {
	$("#supplementfrom").bootstrapValidator('validate'); //保存按钮disable
	
	if($("#title").val() == ""){
		parent.layer.alert("标题不能为空");
		return;
	}	
	var cc = $("input[name='isChangeDate']:checked").val();
	if(cc != 0) {
		if(NewDate(oldNoticeStartDate) >= NewDate(nowSysDate)) {
			if(NewDate(oldNoticeStartDate) > NewDate($("#noticeEndDate").val())) return parent.layer.alert("公告截止时间不得小于公告开始时间");
		} else {
			if(NewDate($("#noticeEndDate").val()) < NewDate(nowSysDate)) return parent.layer.alert("公告截止时间不得小于当前时间");
		}

		if(NewDate($("#noticeEndDate").val()) < NewDate($("#askEndDate").val())) return parent.layer.alert("提出澄清截止时间不得大于公告截止时间");
		if(NewDate($("#askEndDate").val()) > NewDate($("#answersEndDate").val())) return parent.layer.alert("提出澄清截止时间不得大于答复截止时间");
		if(isFile == '0') {
			//递交竞价文件
			if(NewDate($("#noticeEndDate").val()) < NewDate($("#fileEndDate").val())) return parent.layer.alert("竞卖文件递交截止时间不得大于公告截止时间");
			if(NewDate($("#fileCheckEndDate").val()) < NewDate($("#fileEndDate").val())) return parent.layer.alert("竞卖文件审核截止时间不得小于竞卖文件递交截止时间");
		}
	}

	if($("#supplementfrom").data('bootstrapValidator').isValid()) {
		var para = {};
		for(var i = 0; i < filetable.length; i++) {
			para["purFiles[" + i + "].modelName"] = "JJ_PUR_PROJECT_SUPPLEMENT";
			para["purFiles[" + i + "].fileName"] = filetable[i].fileName;
			para["purFiles[" + i + "].filePath"] = filetable[i].filePath;
			para["purFiles[" + i + "].fileSize"] = filetable[i].fileSize;
		};
		para.projectId = projectId;
		para.checkState = '0';
		para.title = $("#title").val();
		para.isChangeDate = $("input[name='isChangeDate']:checked").val();
		para.supplement = $("#supplement").val();
		para.tenderType = tenderType;
		if(para.isChangeDate == '1') {
			para.auctionStartDate = $("#auctionStartDate").val(); //竞卖开始时间
			para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
			para.askEndDate = $("#askEndDate").val(); //提出澄清截止时间
			para.answersEndDate = $("#answersEndDate").val(); //答复截止时间
			if(isFile == '0') {
				para.fileEndDate = $("#fileEndDate").val(); //竞卖文件递交截止时间
				para.fileCheckEndDate = $("#fileCheckEndDate").val(); //竞卖文件审核截止时间
			}
		}
		if(isChecker) {
			if($("#employeeId").val() == "") {
				parent.layer.alert("请选择审核人员！");
				return;
			}
			para.checkerId = $("#employeeId").val();
		} else {
			para.checkerId = 0;
		}

		if(isUpdate == 1) {
			para.id = supplierId;
		}

		if(isCheck) {
			top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
				$.ajax({
					url: saveProjectSupplement,
					type: 'post',
					data: para,
					success: function(data) {
						var index = top.layer.getFrameIndex(window.name);

						if(data.success) {
							top.layer.close(index);
							top.$("#table").bootstrapTable('refresh'); //顶层分页刷新
							top.layer.alert("添加成功");
						} else {
							if(data.message == "操作失败") {
								top.layer.alert("添加失败");
							} else {
								top.layer.alert(data.message);
							}

							//
						}
					}
				});
			});
		} else {
			$.ajax({
				url: saveProjectSupplement,
				type: 'post',
				data: para,
				success: function(data) {
					var index = top.layer.getFrameIndex(window.name);

					if(data.success) {
						top.layer.close(index);
						top.$("#table").bootstrapTable('refresh'); //顶层分页刷新
						top.layer.alert("添加成功");
					} else {
						if(data.message == "操作失败") {
							top.layer.alert("添加失败");
						} else {
							top.layer.alert(data.message);
							//top.layer.alert("添加补遗失败");
						}

						//
					}
				}
			});
		}

	}
});

$("input[name='isChangeDate']").change(function() {
	if($(this).val() == 1) {
		$("#supplementDate").show();
	} else {
		$("#supplementDate").hide();
	}
});
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['pdf'], //接收的文件后缀
			showRemove: false,
			showPreview: false,
			showUpload: false, //是否显示上传按钮  
			layoutTemplates: {
				actionUpload: '', //取消上传按钮
				actionZoom: '', //取消预览按钮
				actionDelete: '' //取消删除按钮
			},
			showCaption: false, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
		}).on("filebatchselected", function(event, files) {
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
			if(filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS') {
				parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			if(event.currentTarget.files[0].size > 2 * 1024 * 1024*1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插
				return;
			};
			$(this).fileinput("upload"); //插件上传
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {
			//	$("#lbl_filename").html("");
			addFile(data);
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

//附件文件
//var purFiles = {};
var filetable = new Array();

function addFile(data) {
	for(var i = 0; i < data.files.length; i++) {
		filetable.push({
			fileName: data.files[i].name,
			filePath: data.response.data[i],
			fileSize: data.files[i].size
		});
	}
	bingfileTable(filetable);
};

//文件列表
function bingfileTable(data) {
	var tabletr = "";
	for(var i = 0; i < data.length; i++) {
		var filesnames = data[i].fileName.substring(data[i].fileName.lastIndexOf(".") + 1).toUpperCase();
		tabletr += "<tr><td style='width:70%;text-align: left;'>" + data[i].fileName + "</td>";
		tabletr += "<td><a type='button' class='btn btn-danger btn-sm' style='text-decoration: none;' href='#' onclick='deleteFile(\"" + data[i].fileName + "\")'>删除</a>&nbsp;&nbsp;"
		if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
			tabletr += "<a type='button' class='btn btn-primary btn-sm' style='text-decoration: none;' href='#' onclick='view(\"" + data[i].filePath + "\")'>预览</a>";
		}
		tabletr += "</td></tr>"
	}
	$("#fileTabletr").html(tabletr);
	$(".fileTableRow").show();
	$("#fileTable").show();
}

//删除文件
function deleteFile(fileName) {

	parent.layer.confirm('是否删除', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(layerIndex, layero) {
		var index = -1;
		for(var i = 0; i < filetable.length; i++) {
			if(filetable[i].fileName.indexOf(fileName) > -1) {
				index = i;
				filetable.splice(index, 1);
			}
		}
		bingfileTable(filetable);
		parent.layer.close(layerIndex);
	}, function(layerIndex) {
		parent.layer.close(layerIndex)
	});

}

//新开网页浏览pdf
function view(filePath) {
	openPreview(filePath)
}


//采购时间
function Purchasetime() {
	//var nowSysDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
	if($("#noticeEndDate").html()!=undefined){
		if(NewDate(nowSysDate)<NewDate($("#noticeEndDate").html())){//判断系统当前时间跟公告开始的时间的大小
			var nowDate=$("#noticeEndDate").html();
		}else{
			var nowDate=nowSysDate;
		};
	}else{
		var nowDate=nowSysDate;
	}
	//公告截止时间
	$('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){			
			if($('#noticeStartDate').val()!=""){
				if(NewDate($('#noticeStartDate').val())>NewDate(nowDate)){	
					var noticeMin=$('#noticeStartDate').val()+':00'
				}else{
					var noticeMin=nowDate
				}				
			}else{
				var noticeMin=nowDate
			};
			$('#noticeEndDate').datetimepicker({						
					minDate:NewDateT(noticeMin)
			})
		},
	});	
	$('#answersEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			var answersMinDate=""
			if($('#askEndDate').val()!=""){//判断是否存在提出澄清截止时间
				if(NewDate($('#askEndDate').val())>NewDate(nowDate)){//如果存在判断提出澄清截止时间跟当前时间，
					answersMinDate=$('#askEndDate').val()+':00';//如果提出澄清截止时间大于当前时间，则询价的最小值是报价时间
				}else{
					answersMinDate=nowDate//小于当前时间。询价的最小时间则为当前时间
				}					
			}else{
				answersMinDate=nowDate//不存在则是当前时间
			}
			$('#answersEndDate').datetimepicker({						
					minDate:NewDateT(answersMinDate)
			})
		},
	});
	$('#askEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowDate)){	
					var askEndMin=NewDateT($('#noticeEndDate').val()+':00');
				}else{
					var askEndMin=NewDateT(nowDate);
				}					
			}else{
				var askEndMin=NewDateT(nowDate);
			};
			if($('#answersEndDate').val()!=""){
				if(NewDate($('#answersEndDate').val())>NewDate(nowDate)){	
					var askEndMax=NewDateT($('#answersEndDate').val()+':00');
				}else{
					var askEndMax=NewDateT('2100-12-31 23:59:59');
				}					
			}else{
				var askEndMax=NewDateT('2100-12-31 23:59:59');
			}
			$('#askEndDate').datetimepicker({						
					minDate:askEndMin,
					//maxDate:askEndMax,
			})
		},
	});
	$('#auctionStartDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i',
		onShow:function(){			
			if($('#noticeEndDate').val()!=""){
				if(NewDate($('#noticeEndDate').val())>NewDate(nowDate)){	
					var auctionStartMin=$('#noticeEndDate').val()+':00'
				}else{
					var auctionStartMin=nowDate
				}				
			}else{
				var auctionStartMin=nowDate
			};
			$('#auctionStartDate').datetimepicker({						
					minDate:NewDateT(auctionStartMin)
			})
		},
	});
	$('#fileEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',
			onShow:function(){			
				if($('#noticeStartDate').val()!=""){
					if(NewDate($('#noticeStartDate').val())>NewDate(nowDate)){	
						var fileEndMin=$('#noticeStartDate').val()+':00'
					}else{
						var fileEndMin=nowDate
					}				
				}else{
					var fileEndMin=nowDate
				};
				if($('#auctionStartDate').val()!=""){
					if(NewDate($('#auctionStartDate').val())>NewDate(nowDate)){	
						var fileEndMax=$('#auctionStartDate').val()+':00';
					}else{
						var fileEndMax='2100-12-31 23:59:59';
					}					
				}else{
					var fileEndMax='2100-12-31 23:59:59';
				}
				$('#fileEndDate').datetimepicker({						
						minDate:NewDateT(fileEndMin),
						//maxDate:NewDateT(fileEndMax)
				})
			},
	});	
	$('#fileCheckEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i',
			onShow:function(){			
				if($('#fileEndDate').val()!=""){
					if(NewDate($('#fileEndDate').val())>NewDate(nowDate)){	
						var fileCheckEndMin=$('#fileEndDate').val()+':00'
					}else{
						var fileCheckEndMin=nowDate
					}				
				}else{
					var fileCheckEndMin=nowDate
				};
				if($('#auctionStartDate').val()!=""){
					if(NewDate($('#auctionStartDate').val())>NewDate(nowDate)){	
						var fileCheckEndMax=$('#auctionStartDate').val()+':00';
					}else{
						var fileCheckEndMax='2100-12-31 23:59:59';
					}					
				}else{
					var fileCheckEndMax='2100-12-31 23:59:59';
				}
				$('#fileCheckEndDate').datetimepicker({						
						minDate:NewDateT(fileCheckEndMin),						
				})
			},
	});
};
//关闭按钮
$("#btn_close").click(function() {
	//top.layer.close(top.layer.index);
	var index = top.layer.getFrameIndex(window.name);
	top.layer.close(index);
});

function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}

function setSupplementChecker() {
	$.ajax({
		url: WorkflowUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "xmby"
		},
		success: function(data) {
			var option = "";
			//判断是否有审核人		   	  
			if(data.message == "0") {
				isCheck = true;
				//parent.layer.alert("找不到该类型的审批设置，将默认为系统审核人审批");
				isChecker = 0; //系统审核
				$('.employee').hide()
				return;
			};
			if(data.message == "2") {
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$('.employee').hide();
				$("#btn_submit").attr("disabled", true);
				return;
			};
			if(data.success == true) {
				$('.employee').show();
				isChecker = 1;
				option = "<option value=''>请选择审核人员</option>"
				for(var i = 0; i < data.data.length; i++) {
					option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
				}
				$("#employeeId").html(option);
			}
		}
	});
}

function NewDate(str) {
 	if(!str){  
   	 	return 0;  
  	}  
  	arr=str.split(" ");  
  	d=arr[0].split("-");  
  	t=arr[1].split(":");
  	var date = new Date();   
  	date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  	date.setUTCHours(t[0]-8, t[1]);
  	return date.getTime();  
};
function NewDateT(str){  
	  if(!str){  
	    return 0;  
	  }  
	  arr=str.split(" ");  
	  d=arr[0].split("-");  
	  t=arr[1].split(":");
	  var date = new Date(); 
	 
	  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	  date.setUTCHours(t[0]-8, t[1], t[2], 0);
	  return date;  
}
function getFiles(id) {
	$.ajax({
		url: config.AuctionHost + '/PurFileController/list.do',
		type: 'post',
		dataType: 'json',
		async: false,
		data: {
			"modelId": supplierId
		},
		success: function(data) {
			if(data.success) {
				data = data.data;
			}
		}
	});
}

var supplierId;

function showMsg(id) {
	supplierId = id;
}

function updateSupplier() {
	var para = {};
	if(tenderType == "0"||tenderType == "6"){
		para.examType =examTypeData;
		para.modelName='JJ_PUR_PROJECT_SUPPLEMENT';
		para.id =supplierId;																																																		
	}else{
		para.modelName='JJ_PUR_PROJECT_SUPPLEMENT';
		para.id =supplierId;
	}
	$.ajax({
		url: config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do',
		type: 'post',
		dataType: 'json',
		async: false,
		data:para,
		/*{
			"id": supplierId,
		},*/
		success: function(data) {
			if(data.success) {
				data = data.data;
			}
		}
	});
}

function oldTime() {
	$.ajax({
				url: saveUrl,
				type: 'get',
				dataType: 'json',
				async: false,
				data:{
					"projectId": projectId
				},
				success: function(res) {
					if(res.success == true) {
						if(res.data.projectSupplement.length==0) {
							$("#oldNoticeEndDate").html(res.data.noticeEndDate);
							
							$("#oldAskEndDate").html(res.data.askEndDate);
							
							$("#oldAnswersEndDate").html(res.data.answersEndDate);
							

							$("#oldFileEndDate").html(res.data.fileEndDate);
							

							$("#oldFileCheckEndDate").html(res.data.fileCheckEndDate);
						
							$("#oldAuctionStartDate").html(res.data.auctionStartDate);
						

						} else {

							if(isUpdate == 1) {
								for(var i = 0; i < res.data.projectSupplement.length; i++) {
									if(res.data.projectSupplement[i].id && res.data.projectSupplement[i].id == supplierId) {
										$("#title").val(res.data.projectSupplement[i].title || "");
										$("#supplement").val(res.data.projectSupplement[i].supplement || "");
										if(res.data.projectSupplement[i].isChangeDate && res.data.projectSupplement[i].isChangeDate == 1) {
											//变更时间
											$("input[name='isChangeDate']").val([res.data.projectSupplement[i].isChangeDate]);
											$("#supplementDate").show();
										}

										if(res.data.projectSupplement[i].purFiles) {
											if(res.data.projectSupplement[i].purFiles.length > 0) {
												for(var j = 0; j < res.data.projectSupplement[i].purFiles.length; j++) {
													filetable.push(res.data.projectSupplement[i].purFiles[j]);
												}
												$("#fileTableRow").show();
												bingfileTable(res.data.projectSupplement[i].purFiles);
											}

										}
										if(res.data.projectSupplement[i].isChangeDate == "0"){
												$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
												$("#noticeEndDate").val(res.data.projectSupplement[i].oldNoticeEndDate);
												$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldFileEndDate);
												$("#offerEndDate").val(res.data.projectSupplement[i].oldFileEndDate);
	
												$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
												$("#askEndDate").val(res.data.projectSupplement[i].oldAskEndDate);
												$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
												$("#answersEndDate").val(res.data.projectSupplement[i].oldAnswersEndDate);
	
												$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldFileCheckEndDate);
												$("#checkEndDate").val(res.data.projectSupplement[i].oldFileCheckEndDate);
												$("#oldAuctionStartDate").html(res.data.projectSupplement[i].oldAuctionStartDate);
												$("#auctionStartDate").val(res.data.projectSupplement[i].oldAuctionStartDate);
												
											}else if(res.data.projectSupplement[i].isChangeDate == "1"){
												$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
												$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
												$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldFileEndDate);
												$("#offerEndDate").val(res.data.projectSupplement[i].fileEndDate);
	
												$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
												$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
												$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
												$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
	
												$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldFileCheckEndDate);
												$("#checkEndDate").val(res.data.projectSupplement[i].fileCheckEndDate);
												$("#oldAuctionStartDate").html(res.data.projectSupplement[i].oldAuctionStartDate);
												$("#auctionStartDate").val(res.data.projectSupplement[i].auctionStartDate);
											}

									}
								}
							} else {
								for(var i = 0; i < res.data.projectSupplement.length; i++) {
									if(res.data.projectSupplement[i].noticeEndDate != undefined) {										
											$("#oldNoticeEndDate").html(res.data.projectSupplement[i].noticeEndDate);
											$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
											$("#oldOfferEndDate").html(res.data.projectSupplement[i].fileEndDate);
											$("#offerEndDate").val(res.data.projectSupplement[i].fileEndDate);

											$("#oldAskEndDate").html(res.data.projectSupplement[i].askEndDate);
											$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
											$("#oldAnswersEndDate").html(res.data.projectSupplement[i].answersEndDate);
											$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);

											$("#oldCheckEndDate").html(res.data.projectSupplement[i].fileCheckEndDate);
											$("#checkEndDate").val(res.data.projectSupplement[i].fileCheckEndDate);
											$("#oldAuctionStartDate").html(res.data.projectSupplement[i].auctionStartDate);
											$("#auctionStartDate").val(res.data.projectSupplement[i].auctionStartDate);
											return
									} else {											
												$("#oldNoticeEndDate").html(res.data.noticeEndDate);
												$("#noticeEndDate").val(res.data.noticeEndDate);
												$("#oldOfferEndDate").html(res.data.fileEndDate);
												$("#offerEndDate").val(res.data.fileEndDate);

												$("#oldAskEndDate").html(res.data.askEndDate);
												$("#askEndDate").val(res.data.askEndDate);
												$("#oldAnswersEndDate").html(res.data.answersEndDate);
												$("#answersEndDate").val(res.data.answersEndDate);

												$("#oldCheckEndDate").html(res.data.fileCheckEndDate);
												$("#checkEndDate").val(res.data.fileCheckEndDate);
												$("#oldAuctionStartDate").html(res.data.auctionStartDate);
												$("#auctionStartDate").val(res.data.auctionStartDate);
											}
										}

								}
							}
						}
					}
			})
	};