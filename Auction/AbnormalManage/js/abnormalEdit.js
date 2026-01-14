 var saveUrl = top.config.AuctionHost + '/BidExceptionController/save.do'; // 保存
 var submitUrl = top.config.AuctionHost + '/BidExceptionController/submit.do'; // 提交
 var detailUrl = top.config.AuctionHost + '/BidExceptionController/findBidExceptioInfo.do'; // 根据包件id查询详情
 var modelUrl = top.config.AuctionHost + '/WordToHtmlController/wordToHtml.do'; //模板地址
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口；
 var listPage = "bidPrice/AbnormalManage/model/packageList.html"; // 选择包件
 var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
 var deleteFileUrl=top.config.AuctionHost+'/PurFileController/delete.do';//删除附件
 var downloadFileUrl = top.config.FileHost + '/FileController/download.do';//下载文件

 var enterprisId = ""; //企业id
 var idList = [];
 var packageId = "", projectId = ""; //包件id
 var abnormalId = ""; //异常id 
 var source = ""; //1是添加，2是编辑
 var WORKFLOWTYPE = 'xmyc';
 var ue;
 var tenderType, enterpriseType,normalFileList=[];
 var isCheck;
 var special = $.getUrlParam("special");
 $(function() {
 	//初始化编辑器
 	// ue = UE.getEditor('container');
 	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
 		source = $.getUrlParam("source");
 	}
	new UEditorEdit({
		pageType: "edit",
		contentKey:"exceptionContent",
		isShowTemplateSelect: false,
	});
	tenderType = $.getUrlParam("tenderType");
	if(tenderType == 0 || tenderType == 6){
		$('.exceptionTypes2').show();
	}
	enterpriseType = $.getUrlParam("enterpriseType");
	packageId = $.getUrlParam("packageId");
	if(source == 1) {//添加
		$("#btnChoose").show();
	}else{//编辑
		/* if(special == 'KZT'){
			$("#btnChoose").show();
		} */
		detail();//详情
	}
 	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	testForm();
 	//开始时间
	$('#exceptionStartTime').click(function() {
		nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		if($('#noticePeriod').val() == '') {
			top.layer.alert('请先输入公示期');
		}else{
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				minDate: nowDate,
				onpicked: function(dp) {
					$(this).change();
					var selectTime = dp.cal.getNewDateStr().replace(/\-/g, "/"); //选中的时间
					var noticePeriod = Number($('#noticePeriod').val());
					if(selectTime && selectTime != '') {
						$('#exceptionEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
						dateInHolidayTip($('#exceptionEndTime').val(), '#exceptionEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
					}
				}
			})
		}
	});
	//修改公示期
	$('#noticePeriod').change(function(){
		var noticePeriod = Number($(this).val());
		if(noticePeriod == 0 || noticePeriod == ''){
			top.layer.alert('请正确输入公示期');
			return
		}
		if($('#exceptionStartTime').val() != ''){
			var selectTime = $('#exceptionStartTime').val().replace(/\-/g, "/"); //选中的时间
			$('#exceptionEndTime').val(automatic(selectTime, noticePeriod, '1')); //招标公告发布截止时间
			dateInHolidayTip($('#exceptionEndTime').val(), '#exceptionEndTime');
		}
	})
 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});
 	//选择包件
 	$("#btnChoose").click(function() {
 		openList();
 	});
 	$("[name='exceptionTypes']").change(function() {
 		var val = $(this).val();
 		var name = "";
 		if(val == 1) {
 			name = "项目终止公示";
 		} else {
 			name = "项目失败公示";
 		}
 		$("[name='exceptionName']").val($("#packageName").html() + name);
 	});
 	//保存
 	$("#btnSave").click(function() {
		console.log(packageId)
 		if(packageId == "" || !packageId) {
 			top.layer.alert("请选择包件");
 			return;
 		}
 		saveForm(true, true);
 	});
 	//提交
 	$("#btnSubmit").click(debounceFun(submitCheck,3*1000,true));
	//文件上传初始化
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile, 'normal');
 	//对外公示
 	$("[name='foreign']").change(function() {
 		var val = $("[name='foreign']:checked").val();
 		isPublicity(val);
 	});
 	//初始化模版
 	modelOption({
 		'tempType': tenderType== 1?'auctionExceptionNotice':tenderType== 2?'saleExceptionNotice':tenderType== 6?'singleExceptionNotice':'bidExceptionNotice',
 	});
 	$("#noticeTemplate").attr('name', 'templateId');
 	//生成模板按钮
 	$("#btnModel").on('click', function () {
 		if ($('#noticeTemplate').val() != "") {
 			var templateId = $('#noticeTemplate').val()
 		} else {
 			parent.layer.alert('温馨提示：请先选择模板');
 			return false;
 		}
 		if (ue.getContent() != "") {
 			parent.layer.confirm('温馨提示：是否确认切换模板', {
 				btn: ['是', '否'] //可以无限个按钮
 			}, function (index, layero) {
 				changHtml(templateId)
 				parent.layer.close(index);
 			}, function (index) {
 				parent.layer.close(index)
 			});
 		} else {
 			changHtml(templateId)
 		}
 	});

 	/*全屏*/
 	$('.fullScreen').click(function() {
 		console.log($.parserUrlForToken('fullScreen.html'))
 		parent.layer.open({
 			type: 2,
 			title: '编辑异常公示',
 			area: ['100%', '100%'],
 			content: 'fullScreen.html',
 			resize: false,
 			btn: ['确定', '取消'],
 			success: function(layero, index) {
 					var iframeWind = layero.find('iframe')[0].contentWindow;
 					iframeWind.ue.ready(function() {
 						//设置编辑器的内容
 						iframeWind.ue.setContent(ue.getContent())
 					});
 				}
 				//确定按钮
 				,
 			yes: function(index, layero) {
 				var iframeWinds = layero.find('iframe')[0].contentWindow;
 				ue.setContent(iframeWinds.ue.getContent());
 				parent.layer.close(index);

 			},
 			btn2: function() {
 				parent.layer.close();
 			}
 		});
 	});
 });

 /*
  * 打开查看窗口
  */
 function openList() {
 	parent.layer.open({
 		type: 2,
 		title: "包件",
 		area: ['1000px', '650px'],
 		content: listPage + '?tenderType='+tenderType+'&enterpriseType='+enterpriseType,
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;
 			iframeWin.passMessage({
 				idList: idList,
 				callback: bidCallback
 			}); //调用子窗口方法，传参
 		}
 	});
 }

 /*
  * 同级页面返回参数
  */
 function bidCallback(data) {
 	$("#packageName").html(data[0].packageName);
 	$("#packageNum").html(data[0].packageNum);
 	packageId = data[0].packageId;
 	projectId = data[0].projectId;
	detail()
 	// var rst = findProjectDetail(packageId);
 	// initMedia({
 	// 	proType: rst
 	// });
 }

function submitCheck() {
	if(!packageId) {
		top.layer.alert("请选择包件");
		return;
	}
	if (top.checkObjection(packageId)) {
		return
	}
	$('#formName').data('bootstrapValidator').validate();//触发验证
	if (!$("#formName").data('bootstrapValidator').isValid()) {
		invalidNot("#formName")
	}else{
		if($("[name='foreign']:checked").val() == 1 && ue.getContentTxt() == '') {
			parent.layer.alert('请填写公示内容！');
			return;
		}
		
		if(isCheck) {
			parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
				title: '提交审核',
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					saveForm(false, true);
				},
				btn2:function(index, layero) {
					parent.layer.close(index);
				}
			})
		} else {
			if($("#employeeId").val()==""){
				parent.layer.alert("请选择审核人");
				return;
			};
			parent.layer.alert('确认提交审核？', function(index) {
				saveForm(false, true);
			})
		}
	}
	

 }
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave, isTips, callback) {
	savePost(isSave, isTips, callback);
 };

 function savePost(isSave, isTips, callback) {
 	$('#exceptionContent').val(ue.getContent());
 	$(".mediaDisabled").removeAttr("disabled");
 	var data = parent.serializeArrayToJson($("#formName").serializeArray());
 	
	if($('[name=foreign]:checked').val() == 1){
		data.optionId = typeIdLists;
		data.optionValue = typeCodeLists;
		data.optionName = typeNameLists;
	}
	if(normalFileList.length > 0){
		data.fileList = normalFileList;
	}
 	if(packageId) {
 		data.packageId = packageId;
 	}
	if(projectId) {
		data.projectId = projectId;
	}
 	// if(!isSave) {
 	// 	data.isSubmit = 1;

 	// }
 	$.ajax({
 		url: isSave?saveUrl:submitUrl,
 		type: "post",
 		data: data,
 		async: false,
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			$(".mediaDisabled").attr("disabled", "disabled");
 			abnormalId = data.data;
 			if(isTips) {
 				if(isSave) {
 					parent.layer.alert("保存成功");
 				} else {
 					parent.layer.alert("提交审核成功");
 				}
 			}
 			if(callback) {
 				callback();
 			}
 			parent.$("#tableList").bootstrapTable("refresh");
 			if(!isSave) {
 				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 				parent.layer.close(index); //再执行关闭
 			}
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }

 /**
  * 详情
  */
 function detail() {

 	$.ajax({
 		url: detailUrl,
 		type: "post",
 		asnyc: false,
 		data: {
 			packageId: packageId,
			tenderType: tenderType
 		},
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
			sourceFunds();//审核
 			var arr = data.data;
			$("#packageName").html(arr.packageName);
			$("#packageNum").html(arr.packageNum);
			$("[name='exceptionName']").val(arr.exceptionName?arr.exceptionName:(arr.packageName +'项目终止公示')).change();
			projectId = arr.projectId;
 				if(arr.id) {
 					abnormalId = arr.id;
 				}
 				packageId = arr.packageId;
 				for(var key in arr) {
 					if(key == "fileList") {
 						normalFileList=arr[key];
 						fileTable();
 					} else if(key == "foreign") {
 						$("[name='foreign'][value='" + arr[key] + "']").prop("checked", "checked");
 						isPublicity(arr[key]);
 					}else {
 						$("[name='" + key + "']").val(arr[key]);
 					}
 				};
				if(tenderType== 2){//竞卖（无包件）
					initMediaVal(arr.options, {
						disabled: false,
						stage: 'xmyc',
						projectId: projectId,
					});
				} else {//竞价 、询比、单一来源
					initMediaVal(arr.options, {
						disabled: false,
						stage: 'xmyc',
						projectId: projectId,
						filterPackageId: packageId,
					});
				}
 				if(arr.exceptionContent) {
 					ue.ready(function() {
 						ue.setContent(arr.exceptionContent);
 					});
				}
				mediaEditor.setValue(arr);
				if(arr.exceptionEndTime){
					dateInHolidayTip(arr.exceptionEndTime, '#exceptionEndTime');//当公示截止时间落在节假日Bidding/Model/js/public.js；
				}
				$("#noticeTemplate").val(arr.templateId); //公告模板id	
			// //审核
			// $("#approval").ApprovalProcess({
			// 	businessId: abnormalId,
			// 	status: 1,
			// 	type: "zbycgs",
			// });
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 };
 //是否对外公示
 function isPublicity(val) {
 	if(val == 1) {
 		$(".isShow").show();
 	} else {
 		$(".isShow").hide();
 	}
 }

  /* 
 *  防抖函数
 * func 要执行的函数
 * wait: 延迟时间 
 * immediate：true/false 控制是否立即执行 true:wait时间内执行第一次 false wait时间内连续点击执行最后一次
 */
	function debounceFun(func, wait, immediate) {
		if (!wait) wait = 2 * 1000;
		let timerout;
		return function () {
				let context = this;
				let args = arguments;
				clearTimeout(timerout)
				if (immediate){
						let callNow = !timerout;
						timerout = setTimeout(function() {
								timerout = null;
						}, wait);
						if (callNow) func.apply(context, args);
				} else{
						timerout = setTimeout(function() {
								func.apply(context, args);
						}, wait);
				}
		}
	}
	//审核
function sourceFunds() {

	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmyc"
	}

	if (abnormalId != '') {
		reData.id = abnormalId;
		$('.record').show();
		findWorkflowCheckerAndAccp(abnormalId);
	}

	//获取审核人列表
	$.ajax({
		url: WorkflowUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function (data) {
			var option = ""
			//判断是否有审核人		   	  
			if (data.message == 0) {
				isCheck == true;
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide()
				return;
			};
			if (data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				massage2 = data.message;
				return;
			};
			var checkerId = '';
			if (data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if (data.data) {
					if (data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if (data.data.workflowCheckers.length > 0) {

						if (data.data.employee) {
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for (var i = 0; i < checkerList.length; i++) {

							if (checkerId != '' && checkerList[i].employeeId == checkerId) {
								option += '<option value="' + checkerList[i].employeeId + '" selected="selected">' + checkerList[i].userName + '</option>'
							} else {
								option += '<option value="' + checkerList[i].employeeId + '">' + checkerList[i].userName + '</option>'
							}

						}
					}
				} else {
					option = '<option>暂无审核人员</option>'
				}
			}
			$("#employeeId").html(option);
		}
	});
};
//切换模板
function changHtml(templateId) {
	$("#projectState").val(0) //审核状态0为临时保存，1为提交审核
	$.ajax({
		url: updateAuctionPurchase, //修改包件的接口
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function (data) {
			if (data.success == true) {
				modelHtml({
					'type': 'xmyc',
					'projectId': projectId,
					'tempId': templateId,
					'tenderType': tenderType
				})
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
};
//附件上传
var FileInput = function() {
 	
 	var oFile = new Object();
 	//初始化fileinput控件（第一次初始化）
 	oFile.Init = function(ctrlName, uploadUrl, _type) {
 		$("#"+ctrlName).fileinput({
 			language: 'zh', //设置语言
 			uploadUrl: uploadUrl, //上传的地址
 			uploadAsync: false,
 			autoReplace: false,
 			//allowedFileExtensions: ['jpg', 'bmp', 'png','jpeg','pdf','zip','rar','doc','docx','xls','xlsx','JPG', 'BMP', 'PNG','JPEG','PDF','ZIP','RAR','DOC','DOCX','XLS','XLSX'], //接收的文件后缀
 			showUpload: false, //是否显示上传按钮  
 			showCaption: false, //是否显示标题  
 			browseClass: "btn btn-primary", //按钮样式       
 			dropZoneEnabled: false, //是否显示拖拽区域  
 			//maxFileCount: 1, //表示允许同时上传的最大文件个数
 			showPreview :false,
 			layoutTemplates:{
 				actionDelete:"",
 				actionUpload:""
 			},
 //			//上传参数
 //			uploadExtraData:function(){//向后台传递参数
 //	            var path=''
 //                return path; 
 //              },
 
 		}).on("filebatchselected", function (event, files) {
 			var filesnames=event.currentTarget.files[0].name.split('.')[1]
 			if(event.currentTarget.files.length>1){
 				parent.layer.alert('单次上传文件数只能为1个');				
 				$(this).fileinput("reset"); //选择的格式错误 插件重置
 			    return;
 			}	
 			$(this).fileinput("upload");
 							
 		}).on("filebatchuploadsuccess", function (event, data, previewId, index) {
 			if (data.response.success===false) { 
 				parent.layer.alert(data.response.message);
 				$(this).fileinput("reset"); 
 				return;
 			}
 			if(data.response.success){
 				if(_type == 'normal'){
 					normalFileList.push(
 						{   					
 						    fileName:data.files[0].name,
 						    fileSize:data.files[0].size/1000+"KB",
 						    filePath:data.response.data[0],
 						    userName:(top.userName||""),
 						    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
 					    }
 					)
 				}else if(_type == 'price'){
					priceFileList = [];
 					priceFileList.push(
 						{   					
 						    fileName:data.files[0].name,
 						    fileSize:data.files[0].size/1000+"KB",
 						    filePath:data.response.data[0],
 						    userName:(top.userName||""),
 						    subDate:top.$("#systemTime").html()+' '+top.$("#sysTime").html()
 					    }
 					)
 				}
 				
 			}
 			
 			fileTable()
 		}).on('filebatchuploaderror', function(event, data, msg) {
 			parent.layer.msg("失败");
 		});
 	}
 	return oFile;
 };
 //文件列表
 function fileTable(){
 	$('#fileTables').bootstrapTable({
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
 			},
 			{
 				field: "fileName",
 				title: "文件名称",
 				align: "left",
 				halign: "left",
 
 			},
 			{
 				field: "fileSize",
 				title: "文件大小",
 				align: "center",
 				halign: "center",
 				width:'120px'
 
 			},
 			{
 				field: "subDate",
 				title: "上传时间",
 				align: "center",
 				halign: "center",
 				width:'180px'
 
 			},
 			{
 				field: "userName",
 				title: "上传人",
 				align: "center",
 				halign: "center",
 				width:'100px'
 
 			},
 			{
 				field: "caoz",
 				title: "操作",
 				width:'200px',
 				events:{
 					'click .fileDownload':function(e, value, row, index){
 						var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName ;
     					window.location.href = $.parserUrlForToken(newUrl); 
 					},
 					'click .previewFile':function(e, value, row, index){
 						openBidPricePreview(row.filePath);
 					},
 					'click .filedelet':function(e, value, row, index){
 						parent.layer.confirm('确定要删除该附件', {
 							  btn: ['是', '否'] //可以无限个按钮
 							}, function(indexs, layero){
 								let itemList=new Array();
								normalFileList=itemList.concat(normalFileList);
								normalFileList.splice(index,1);
 								if(row.id!=undefined){
 									$.ajax({
 									   type: "post",
 									   url: deleteFileUrl,
 									   async: false,
 									   dataType: 'json',
 									   data: {
 										   "id":row.id ,		
 									   },
 									   success: function(data) {	
 											if(data.success){
 												
 											}else{
 												top.layer.alert(data.message)
 											}
 									   }
 								   });   
 							   	}
 								fileTable()	
 							  	parent.layer.close(indexs);			 
 							}, function(indexs){
 							   parent.layer.close(indexs)
 							}); 
 					},
 				},
 				formatter:function(value, row, index){	
 					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
 					var mixtbody=""  
 						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
 						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
 							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
 						}
 						// if(type != "VIEW"){
 							mixtbody+='<a class="btn btn-xs btn-danger filedelet" href="javascript:void(0)" style="text-decoration:none">删除</a>&nbsp;&nbsp'
 						// }              
 						return mixtbody
 				}
 				 
 			}
 		]
 	});
 	$('#fileTables').bootstrapTable("load", normalFileList); //重载数据
 };
 /**********   表单验证   ***********/
 function testForm(){
 	$('#formName').bootstrapValidator({
 //      message: 'This value is not valid',
         //提供输入验证图标提示
         feedbackIcons: {
             valid: 'glyphicon glyphicon-ok',
             validating: 'glyphicon glyphicon-refresh'
         },
         fields: {
         	'enterpriseName': {//项目异常提出单位
                 validators: {
                 	notEmpty: {
                         message: '请输入项目异常提出单位'
                 	},
					stringLength: {
					    max: 500,
					    message: '项目异常提出单位长度不能超过500个字 '
					}
                 }
             },
 			'exceptionName': {//项目异常名称
 				trigger: 'change',
 			    validators: {
 			    	notEmpty: {
 			            message: '请输入项目异常名称'
 			    	},
					stringLength: {
					    max: 200,
					    message: '项目异常名称长度不能超过200个字 '
					}
 			    }
 			},
 			'noticePeriod': {//公示期
				/* validators: {
					callback: {
						message: '请正确输入公示期',
						callback: function(value, validators) {
							var reg = /^[1-9][0-9]{0,1}$/
							if(value == '' || !reg.test(value)){
								return false
							}else{
								return true
							}
						}
					}
			    } */                 
				validators: {
                 	notEmpty: {
                        message: '请输入公示期'
                 	},
					regexp: {
						regexp:  /^[1-9][0-9]{0,1}$/,
						message: '请正确输入公示期'
					}
                 }
             },
			 'abnormalReason': {//异常原因
			    validators: {
					callback: {
						message: '请选择异常原因',
						callback: function(value, validators) {
							if(value == ''){
								return false
							}else{
								return true
							}
						}
					}
			    }
			  },
             'exceptionStartTime': {//公示开始时间
 				trigger: 'change',
                validators: {
                 	notEmpty: {
                         message: '请选择公示开始时间'
                 	}
                }
             },
             'exceptionInfor': {//异常情况描述
				validators: {
					notEmpty: {
						message: '请输入异常情况描述'
					},
					stringLength: {
					    max: 500,
					    message: '异常情况描述长度不能超过500个字 '
					}
				}
             },
 			'enterprisePerson': {//项目经理
 			    validators: {
 			    	notEmpty: {
 			            message: '项目经理不能为空'
 			    	},
 					stringLength: {
 					    max: 10,
 					    message: '项目经理长度不能超过10个字 '
 					}
 			    }
 			},
            'enterprisePersonTel': {//联系电话
				validators: {
					notEmpty: {
					    message: '联系电话不能为空'
					},
					regexp: {
						regexp: /(^1\d{10}$)|(^\d{3}-\d{8}$)|(^\d{4}-\d{7}$)/,
						message: '请正确输入联系电话'
					} 
				}
            }
        }
	})
 };