var packageId = getQueryString("packageId");
var projectId = getQueryString("projectId");
var isFile = getQueryString("isFile");
var isUpdate = getQueryString("isUpdate");
var tenderType = getQueryString("tenderType"); //0是询价采购  1是竞价采购
var lengthNum = getQueryString("lengthNum"); //当前补遗个数
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //上传文件到服务器
var saveProjectSupplement = top.config.bidhost + '/ProjectSupplementController/saveProjectSupplement.do' //
var WorkflowUrl = top.config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var oldNoticeStartDate = sessionStorage.getItem('oldNoticeStartDate')
var isChecker = ""; //是下一级审核还是系统审核
var isCheck = false; //是否设置流程
var saveUrl = ""
var examTypes;
var inviteStates;
var isSigns;
//var projectIds;
$(function() {
	//if(isUpdate != 1){
	$("#supplementDate").hide();
	if(tenderType == "0" || tenderType == "6") { //询价时隐藏竞价开始时间
		examTypes = JSON.parse(sessionStorage.getItem('examType'));
		inviteStates = JSON.parse(sessionStorage.getItem('inviteState'));
		isPublics = JSON.parse(sessionStorage.getItem('isPublic'));
		//projectIds = JSON.parse(sessionStorage.getItem('projectId'));
		isSigns= JSON.parse(sessionStorage.getItem('isSign'));
		Purchasetime() //询价时间设置

		if(examTypes == "0") {
			if(inviteStates == "0") { //为项目预审补遗
				if(isSigns == "0"){
					$(".signEndDateDiv").hide();
				}else if(isSigns = 1){$(".signEndDateDiv").show();}
				$(".askEndDateDiv").hide();
				$(".answersEndDateDiv").hide();
				$(".offerEndDateDiv").hide();
				$(".acceptEndDateDiv").hide();
				$(".checkEndDateDiv").hide();
			} else if(inviteStates == "1") { //项目预审 邀请函变更
				$('.yqh').html('邀请函');
				$("#noticeEndDateDiv").hide();
				$(".examAskEndDateDiv").hide();
				$(".examAnswersEndDateDiv").hide();
				//$(".offerEndDateDiv").hide();
				//$("#offerDiv").show();
				$(".signEndDateDiv").hide();
				$(".examCheckEndDateDiv").hide();
				//$(".submitExamFileEndDateDiv").hide();
			}

		} else if(examTypes == "1") {
			$('.yqh').html('后审');
			$(".examAskEndDateDiv").hide();
			$(".examAnswersEndDateDiv").hide();
			if(isSigns == "0"){
					$(".signEndDateDiv").hide();
				}else if(isSigns = 1){$(".signEndDateDiv").show();}
			$(".acceptEndDateDiv").hide();
			$(".examCheckEndDateDiv").hide();
			//$(".submitExamFileEndDateDiv").hide();
		}
		//saveUrl = config.bidhost + '/ProjectReviewController/findProjectInfo.do';
		saveUrl = config.bidhost + '/ProjectReviewController/findProjectPackageInfo.do';
		
		$(".auctionStartDateDiv").hide();
	} else if(tenderType == "1") { //竞价时更改文本框title
		$(".examAskEndDateDiv").hide();
		$(".examAnswersEndDateDiv").hide();
		$(".signEndDateDiv").hide();
		$(".acceptEndDateDiv").hide();
		$(".examCheckEndDateDiv").hide();
		//$(".submitExamFileEndDateDiv").hide();
		AuctionSaletime(); //时间设置
		$("#lblauctionStartDate").html("竞价开始时间");
		$("#lblofferEndDate").html("竞价文件递交截止时间");
		$("#oldlblofferEndDate").html("原竞价文件递交截止时间");
		$("#lblcheckEndDate").html("竞价文件审核截止时间");
		$("#oldlblcheckEndDate").html("原竞价文件审核截止时间");
		saveUrl = config.bidhost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口
		if(isFile != "" && isFile == '1') {
			//没递交竞价文件
			$(".offerEndDateDiv").hide();
		}

	} else if(tenderType == "2") { //竞价时更改文本框title
		$(".examAskEndDateDiv").hide();
		$(".examAnswersEndDateDiv").hide();
		$(".signEndDateDiv").hide();
		$(".acceptEndDateDiv").hide();
		$(".examCheckEndDateDiv").hide();
		$(".submitExamFileEndDateDiv").hide();
		AuctionSaletime(); //时间设置
		saveUrl = config.bidhost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口
		$("#lblauctionStartDate").html("竞卖开始时间");
		$("#lblofferEndDate").html("竞卖文件递交截止时间");
		$("#oldlblofferEndDate").html("原竞卖文件递交截止时间");
		$("#lblcheckEndDate").html("竞卖文件审核截止时间");
		$("#oldlblcheckEndDate").html("原竞卖文件审核截止时间");
		if(isFile != "" && isFile == '1') {
			//没递交竞价文件
			$(".offerEndDateDiv").hide();
		}
	}

	setSupplementChecker(); //添加审核人信息

	/*}else{
		
		updateSupplier();
		
	}*/
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	$(".btn-file").after("<span class='text-danger' style='margin-left:15px;'>*每次只能选择一个PDF、WORD、压缩文件格式文件上传！</span>");
	oldTime();
})

$("#btn_submit").click(function() {
	$("#supplementfrom").bootstrapValidator('validate'); //保存按钮disable
	
	if($("#title").val() == ""){
		parent.layer.alert("标题不能为空");
		return;
	}
	
	var cc = $("input[name='isChangeDate']:checked").val();
	if(cc != 0) {
		if(GetTime(oldNoticeStartDate) >= GetTime(new Date())) {
			if(GetTime(oldNoticeStartDate) > GetTime($("#noticeEndDate").val())) return parent.layer.alert("公告截止时间不得小于公告开始时间");
		} else {
			if(GetTime($("#noticeEndDate").val()) < GetTime(new Date())) return parent.layer.alert("公告截止时间不得小于当前时间");
		}

		if(GetTime($("#noticeEndDate").val()) < GetTime($("#askEndDate").val())) return parent.layer.alert("提出澄清截止时间不得大于公告截止时间");
		if(GetTime($("#askEndDate").val()) > GetTime($("#answersEndDate").val())) return parent.layer.alert("提出澄清截止时间不得大于答复截止时间");

		if(tenderType == "0" || tenderType == "6") {
			if(examTypes == "0") {
				/*if(inviteStates=="0"){*/
					if(GetTime($("#noticeEndDate").val()) > GetTime($("#oldNoticeEndDate").val())) return parent.layer.alert("补遗截止时间不得晚于公告截止时间");
					//if(GetTime($("#acceptEndDate").val())<GetTime($("#noticeEndDate").val())) return parent.layer.alert("预审评审时间不得晚于报名截止时间");
				/*}else if (inviteStates=="1"){
					if(GetTime($("#noticeEndDate").val()) > GetTime($("#oldNoticeEndDate").val())) return parent.layer.alert("补遗截止时间不得晚于预审评审截止时间");
				}*/
			} else if(examTypes == "1") {
				if(GetTime($("#noticeEndDate").val()) > GetTime($("#offerEndDate").val())) return parent.layer.alert("补遗截止时间不得晚于报价截止时间");
				if(GetTime($("#checkEndDate").val()) < GetTime($("#offerEndDate").val())) return parent.layer.alert("询价评审时间不得小于报价截止时间");
			}
		}
		if(tenderType == "1") {

			if(isFile == '0') {
				//递交竞价文件
				if(GetTime($("#noticeEndDate").val()) < GetTime($("#offerEndDate").val())) return parent.layer.alert("竞价文件递交截止时间不得大于公告截止时间");
				if(GetTime($("#checkEndDate").val()) < GetTime($("#offerEndDate").val())) return parent.layer.alert("竞价文件审核截止时间不得小于竞价文件递交截止时间");
			}

		}
		if(tenderType == "2") {
			if(isFile == '0') {
				//递交竞价文件
				if(GetTime($("#noticeEndDate").val()) < GetTime($("#offerEndDate").val())) return parent.layer.alert("竞卖文件递交截止时间不得大于公告截止时间");
				if(GetTime($("#checkEndDate").val()) < GetTime($("#offerEndDate").val())) return parent.layer.alert("竞卖文件审核截止时间不得小于竞卖文件递交截止时间");
			}
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

		if(tenderType == "0" || tenderType == "6") {
			para.packageId = packageId;
		}
		para.projectId = projectId;
		para.checkState = '0';
		para.title = $("#title").val();
		para.isChangeDate = $("input[name='isChangeDate']:checked").val();
		para.supplement = $("#supplement").val();
		para.tenderType = tenderType;
		if(para.isChangeDate == '1') {
			if(tenderType == "0" || tenderType == "6") {
				if(examTypes == "0") {
					if(inviteStates=="0"){
						para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
						para.examAskEndDate = $("#examAskEndDate").val(); //预审提出澄清截止时间
						para.examAnswersEndDate = $("#examAnswersEndDate").val(); //预审答复截止时间
						para.examCheckEndDate = $("#examCheckEndDate").val(); //预审评审时间
						if(isSigns == "1"){
							para.signEndDate = $("#signEndDate").val(); //报名截止时间
						}
						//para.submitExamFileEndDate = $("#submitExamFileEndDate").val(); //资格预审申请文件递交截止时间
					}else if(inviteStates=="1"){
						para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
						para.askEndDate = $("#askEndDate").val(); //提出澄清截止时间
						para.answersEndDate = $("#answersEndDate").val(); //答复截止时间
						para.offerEndDate = $("#offerEndDate").val(); //报价截止时间
						/*if(isSigns == "1"){
							para.signEndDate = $("#signEndDate").val(); //报名截止时间
						}*/
						para.checkEndDate = $("#checkEndDate").val(); //询价评审时间
						para.acceptEndDate=$("#acceptEndDate").val(); //接受邀请时间
					}
				}else if(examTypes == "1") {
					if(isSigns == "1"){
						para.signEndDate = $("#signEndDate").val(); //报名截止时间
					}
					para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
					para.askEndDate = $("#askEndDate").val(); //提出澄清截止时间
					para.answersEndDate = $("#answersEndDate").val(); //答复截止时间
					para.offerEndDate = $("#offerEndDate").val(); //报价截止时间
					para.checkEndDate = $("#checkEndDate").val(); //询价评审时间
				}
			} else if(tenderType == "1") {
				para.auctionStartDate = $("#auctionStartDate").val(); //竞价开始时间
				para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
				para.askEndDate = $("#askEndDate").val(); //提出澄清截止时间
				para.answersEndDate = $("#answersEndDate").val(); //答复截止时间
				if(isFile == '0') {
					para.fileEndDate = $("#offerEndDate").val(); //竞价文件递交截止时间
					para.fileCheckEndDate = $("#checkEndDate").val(); //竞价文件审核截止时间
				}
			} else if(tenderType == "2") {
				para.auctionStartDate = $("#auctionStartDate").val(); //竞卖开始时间
				para.noticeEndDate = $("#noticeEndDate").val(); //公告截止时间
				para.askEndDate = $("#askEndDate").val(); //提出澄清截止时间
				para.answersEndDate = $("#answersEndDate").val(); //答复截止时间
				if(isFile == '0') {
					para.fileEndDate = $("#offerEndDate").val(); //竞卖文件递交截止时间
					para.fileCheckEndDate = $("#checkEndDate").val(); //竞卖文件审核截止时间
				}
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
		//		purFiles["purFiles[" + i + "].modelName"] = "jj_pur_Project_Supplement";
		//		purFiles["purFiles[" + i + "].fileName"] = data.files[i].name;
		//		purFiles["purFiles[" + i + "].filePath"] = data.response.data[i];
		//		purFiles["purFiles[" + i + "].fileSize"] = data.files[i].size;

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
	var nowDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
	//公告截止时间
	var date = new Date();
	if(new Date(oldNoticeStartDate).getTime() <= new Date(nowDate).getTime()) {
		var StartDate=new Date(nowDate)
	}else{
		var StartDate=new Date(oldNoticeStartDate)		
	}
	 
    $('#noticeEndDate').datetimepicker({
		step:5,
		lang:'ch',
		format: 'Y-m-d H:i:s',
		minDate:date,
		onSelectTime:function(e) {				
			$('#noticeEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					minDate:StartDate
			});			
			if(examTypes == "0"){
				if(inviteStates == "0"){
					$('#examAskEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
							$('#examAnswersEndDate').datetimepicker({
								step:5,
								lang:'ch',
								format: 'Y-m-d H:i:s',						
								minDate:b
							});
						}
					});
					$('#examAnswersEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
							$('#examAskEndDate').datetimepicker({
								step:5,
								lang:'ch',
								format: 'Y-m-d H:i:s',						
								maxDate:b
							});
						}
					});
					
					$('#signEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
					});
					
					$('#submitExamFileEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
					});
					
					$('#examCheckEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
					});
				}else if(inviteStates == "1"){
					$('#askEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
						$('#answersEndDate').datetimepicker({
									format: 'Y-m-d H:i:s',						
									minDate:b
								});
							}
						});
					$('#answersEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							value:GMTToStr(e),
							maxDate:e,
							onSelectTime:function(b) {
								$('#askEndDate').datetimepicker({
									step:5,
									lang:'ch',
									format: 'Y-m-d H:i:s',
									maxDate:b
								});
							}
						});
					
						$('#offerEndDate').datetimepicker({
								step:5,
								lang:'ch',
								format: 'Y-m-d H:i:s',
								value:GMTToStr(e),
								maxDate:e,					
							});
						$('#acceptEndDate').datetimepicker({
								step:5,
								lang:'ch',
								format: 'Y-m-d H:i:s',
								value:GMTToStr(e),
								maxDate:e,					
							});
						$('#checkEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							value:GMTToStr(e),
							maxDate:e,					
						});
				}
				
			}else if(examTypes == "1"){
				$('#askEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					maxDate:e,
					onSelectTime:function(b) {
					$('#answersEndDate').datetimepicker({
								format: 'Y-m-d H:i:s',						
								minDate:b
							});
						}
					});
				$('#answersEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
							$('#askEndDate').datetimepicker({
								step:5,
								lang:'ch',
								format: 'Y-m-d H:i:s',
								maxDate:b
							});
						}
					});
				
					$('#offerEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							value:GMTToStr(e),
							maxDate:e,					
						});
					$('#signEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							value:GMTToStr(e),
							maxDate:e,					
						});
					$('#checkEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							value:GMTToStr(e),
							maxDate:e,					
						});
			}
			
		},
	});
	
	/*var noticeEndDate = laydate.render({
		elem: '#noticeEndDate',
		min: 0,
		istime: true,
		type: 'datetime',
		trigger: 'click',
		ready: function(date) {
			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
				noticeEndDate.config.min = {
					year: new Date().getFullYear(),
					month: new Date().getMonth(),
					date: new Date().getDate(),
					hours: new Date().getHours(),
					minutes: new Date().getMinutes(),
					seconds: new Date().getSeconds()
				};
			} else {
				noticeEndDate.config.min = {
					year: new Date(oldNoticeStartDate).getFullYear(),
					month: new Date(oldNoticeStartDate).getMonth(),
					date: new Date(oldNoticeStartDate).getDate(),
					hours: new Date(oldNoticeStartDate).getHours(),
					minutes: new Date(oldNoticeStartDate).getMinutes(),
					seconds: new Date(oldNoticeStartDate).getSeconds()
				};
			}
			

		},
		done: function(value, dates, endDate) {

			//askEndDate  提出澄清截止时间			
			//answersEndDate 答复截止时间
			//offerEndDate 报价截止时间
			//checkEndDate  评审截止时间

			$("#noticeEndDate").val(value);
			$("#askEndDate").val(value);
			$("#answersEndDate").val(value);
			$("#offerEndDate").val(value);
			$("#checkEndDate").val(value);

			$("#examAskEndDate").val(value);
			$("#examAnswersEndDate").val(value);
			$("#signEndDate").val(value);
			$("#examCheckEndDate").val(value);

			$("#supplementfrom").bootstrapValidator('revalidateField', 'noticeEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'askEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'answersEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'offerEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'checkEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'examAskEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'examAnswersEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'signEndDate');
			$("#supplementfrom").bootstrapValidator('revalidateField', 'examCheckEndDate');
			//其他截止时间 设置
			askEndDate.config.max = {
				year: dates.year,
				month: dates.month - 1,
				date: dates.date,
				hours: dates.hours,
				minutes: dates.minutes,
				seconds: dates.seconds
			}

			answersEndDate.config.max = {
				year: dates.year,
				month: dates.month - 1,
				date: dates.date,
				hours: dates.hours,
				minutes: dates.minutes,
				seconds: dates.seconds
			}
			offerEndDate.config.min = {
				year: dates.year,
				month: dates.month - 1,
				date: dates.date,
				hours: dates.hours,
				minutes: dates.minutes,
				seconds: dates.seconds
			}
			examAskEndDate.config.max = {
				year: dates.year,
				month: dates.month - 1,
				date: dates.date,
				hours: dates.hours,
				minutes: dates.minutes,
				seconds: dates.seconds
			}

			examAnswersEndDate.config.max = {
					year: dates.year,
					month: dates.month - 1,
					date: dates.date,
					hours: dates.hours,
					minutes: dates.minutes,
					seconds: dates.seconds
				}
		}
	})*/
	
	//提出澄清截止时间
	$('#askEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',	
	});
	
	//	提出澄清截止时间
//	var askEndDate = laydate.render({
//		elem: '#askEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		trigger: 'click',
//		ready: function(date) {
//			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//				askEndDate.config.min = {
//					year: new Date().getFullYear(),
//					month: new Date().getMonth(),
//					date: new Date().getDate(),
//					hours: new Date().getHours(),
//					minutes: new Date().getMinutes(),
//					seconds: new Date().getSeconds()
//				};
//			} else {
//				askEndDate.config.min = {
//					year: new Date(oldNoticeStartDate).getFullYear(),
//					month: new Date(oldNoticeStartDate).getMonth(),
//					date: new Date(oldNoticeStartDate).getDate(),
//					hours: new Date(oldNoticeStartDate).getHours(),
//					minutes: new Date(oldNoticeStartDate).getMinutes(),
//					seconds: new Date(oldNoticeStartDate).getSeconds()
//				};
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#askEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'askEndDate');
//			answersEndDate.config.min = {
//				year: dates.year,
//				month: dates.month - 1,
//				date: dates.date,
//				hours: dates.hours,
//				minutes: dates.minutes,
//				seconds: dates.seconds
//			}
//		}
//	})
		
	//预审提出澄清截止时间
	$('#examAskEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',	
	});
		
	//	预审提出澄清截止时间
//	var examAskEndDate = laydate.render({
//		elem: '#examAskEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		ready: function(date) {
//			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//				examAskEndDate.config.min = {
//					year: new Date().getFullYear(),
//					month: new Date().getMonth(),
//					date: new Date().getDate(),
//					hours: new Date().getHours(),
//					minutes: new Date().getMinutes(),
//					seconds: new Date().getSeconds()
//				};
//			} else {
//				examAskEndDate.config.min = {
//					year: new Date(oldNoticeStartDate).getFullYear(),
//					month: new Date(oldNoticeStartDate).getMonth(),
//					date: new Date(oldNoticeStartDate).getDate(),
//					hours: new Date(oldNoticeStartDate).getHours(),
//					minutes: new Date(oldNoticeStartDate).getMinutes(),
//					seconds: new Date(oldNoticeStartDate).getSeconds()
//				};
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#examAskEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'examAskEndDate');
//			examAnswersEndDate.config.min = {
//				year: dates.year,
//				month: dates.month - 1,
//				date: dates.date,
//				hours: dates.hours,
//				minutes: dates.minutes,
//				seconds: dates.seconds
//			}
//		}
//	})
		//答复截止时间
		$('#answersEndDate').datetimepicker({
				step:5,
				lang:'ch',
				format: 'Y-m-d H:i:s',	
		});
	
	//答复截止时间
//	var answersEndDate = laydate.render({
//		elem: '#answersEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		min: 0,
//		ready: function(date) {
//
//			if($("#askEndDate").val() == "") {
//				if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//					answersEndDate.config.min = {
//						year: new Date().getFullYear(),
//						month: new Date().getMonth(),
//						date: new Date().getDate(),
//						hours: new Date().getHours(),
//						minutes: new Date().getMinutes(),
//						seconds: new Date().getSeconds()
//					};
//				} else {
//					answersEndDate.config.min = {
//						year: new Date(oldNoticeStartDate).getFullYear(),
//						month: new Date(oldNoticeStartDate).getMonth(),
//						date: new Date(oldNoticeStartDate).getDate(),
//						hours: new Date(oldNoticeStartDate).getHours(),
//						minutes: new Date(oldNoticeStartDate).getMinutes(),
//						seconds: new Date(oldNoticeStartDate).getSeconds()
//					};
//				}
//			}
//
//		},
//		done: function(value, dates, endDate) {
//			$("#answersEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'answersEndDate');
//		}
//	})
		//预审答复截止时间
		$('#examAnswersEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',	
		});
	//预审答复截止时间
//	var examAnswersEndDate = laydate.render({
//		elem: '#examAnswersEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		min: 0,
//		ready: function(date) {
//
//			if($("#examAskEndDate").val() == "") {
//				if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//					examAnswersEndDate.config.min = {
//						year: new Date().getFullYear(),
//						month: new Date().getMonth(),
//						date: new Date().getDate(),
//						hours: new Date().getHours(),
//						minutes: new Date().getMinutes(),
//						seconds: new Date().getSeconds()
//					};
//				} else {
//					examAnswersEndDate.config.min = {
//						year: new Date(oldNoticeStartDate).getFullYear(),
//						month: new Date(oldNoticeStartDate).getMonth(),
//						date: new Date(oldNoticeStartDate).getDate(),
//						hours: new Date(oldNoticeStartDate).getHours(),
//						minutes: new Date(oldNoticeStartDate).getMinutes(),
//						seconds: new Date(oldNoticeStartDate).getSeconds()
//					};
//				}
//			}
//
//		},
//		done: function(value, dates, endDate) {
//			$("#examAnswersEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'examAnswersEndDate');
//		}
//	})
		//报价截止时间
		$('#offerEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',						
		});
	
	//报价截止时间
//	var offerEndDate = laydate.render({
//		elem: '#offerEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		ready: function(date) {
//			if($("#noticeEndDate").val() == "") {
//				if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//					offerEndDate.config.min = {
//						year: new Date().getFullYear(),
//						month: new Date().getMonth(),
//						date: new Date().getDate(),
//						hours: new Date().getHours(),
//						minutes: new Date().getMinutes(),
//						seconds: new Date().getSeconds()
//					};
//				} else {
//					offerEndDate.config.min = {
//						year: new Date(oldNoticeStartDate).getFullYear(),
//						month: new Date(oldNoticeStartDate).getMonth(),
//						date: new Date(oldNoticeStartDate).getDate(),
//						hours: new Date(oldNoticeStartDate).getHours(),
//						minutes: new Date(oldNoticeStartDate).getMinutes(),
//						seconds: new Date(oldNoticeStartDate).getSeconds()
//					};
//				}
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#offerEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'offerEndDate');
//
//			checkEndDate.config.min = {
//				year: dates.year,
//				month: dates.month - 1,
//				date: dates.date,
//				hours: dates.hours,
//				minutes: dates.minutes,
//				seconds: dates.seconds
//			}
//		}
//	})
		//评审截止时间
		$('#checkEndDate').datetimepicker({
				step:5,
				lang:'ch',
				format: 'Y-m-d H:i:s',	
		});
	//评审截止时间
//	var checkEndDate = laydate.render({
//		elem: '#checkEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		ready: function(date) {
//			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//				checkEndDate.config.min = {
//					year: new Date().getFullYear(),
//					month: new Date().getMonth(),
//					date: new Date().getDate(),
//					hours: new Date().getHours(),
//					minutes: new Date().getMinutes(),
//					seconds: new Date().getSeconds()
//				};
//			} else {
//				checkEndDate.config.min = {
//					year: new Date(oldNoticeStartDate).getFullYear(),
//					month: new Date(oldNoticeStartDate).getMonth(),
//					date: new Date(oldNoticeStartDate).getDate(),
//					hours: new Date(oldNoticeStartDate).getHours(),
//					minutes: new Date(oldNoticeStartDate).getMinutes(),
//					seconds: new Date(oldNoticeStartDate).getSeconds()
//				};
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#checkEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'checkEndDate');
//		}
//	})
		//预审评审截止时间
		$('#examCheckEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',	
		});
	//预审评审截止时间
//	var examCheckEndDate = laydate.render({
//		elem: '#examCheckEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		ready: function(date) {
//			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//				examCheckEndDate.config.min = {
//					year: new Date().getFullYear(),
//					month: new Date().getMonth(),
//					date: new Date().getDate(),
//					hours: new Date().getHours(),
//					minutes: new Date().getMinutes(),
//					seconds: new Date().getSeconds()
//				};
//			} else {
//				examCheckEndDate.config.min = {
//					year: new Date(oldNoticeStartDate).getFullYear(),
//					month: new Date(oldNoticeStartDate).getMonth(),
//					date: new Date(oldNoticeStartDate).getDate(),
//					hours: new Date(oldNoticeStartDate).getHours(),
//					minutes: new Date(oldNoticeStartDate).getMinutes(),
//					seconds: new Date(oldNoticeStartDate).getSeconds()
//				};
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#examCheckEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'examCheckEndDate');
//		}
//	})
//		
	//报名截止时间
		$('#signEndDate').datetimepicker({
				step:5,
				lang:'ch',
				format: 'Y-m-d H:i:s',	
		});
		
	//报名截止时间
		/*$('#submitExamFileEndDate').datetimepicker({
				step:5,
				lang:'ch',
				format: 'Y-m-d H:i:s',	
		});*/
		
	//接受邀请截止时间
		$('#acceptEndDate').datetimepicker({
				step:5,
				lang:'ch',
				format: 'Y-m-d H:i:s',	
		});
	//接受邀请截止时间
//	var acceptEndDate = laydate.render({
//		elem: '#acceptEndDate',
//		min: 0,
//		istime: true,
//		type: 'datetime',
//		ready: function(date) {
//			if(new Date(oldNoticeStartDate).getTime() <= new Date().getTime()) {
//				acceptEndDate.config.min = {
//					year: new Date().getFullYear(),
//					month: new Date().getMonth(),
//					date: new Date().getDate(),
//					hours: new Date().getHours(),
//					minutes: new Date().getMinutes(),
//					seconds: new Date().getSeconds()
//				};
//			} else {
//				acceptEndDate.config.min = {
//					year: new Date(oldNoticeStartDate).getFullYear(),
//					month: new Date(oldNoticeStartDate).getMonth(),
//					date: new Date(oldNoticeStartDate).getDate(),
//					hours: new Date(oldNoticeStartDate).getHours(),
//					minutes: new Date(oldNoticeStartDate).getMinutes(),
//					seconds: new Date(oldNoticeStartDate).getSeconds()
//				};
//			}
//		},
//		done: function(value, dates, endDate) {
//			$("#acceptEndDate").val(value);
//			$("#supplementfrom").bootstrapValidator('revalidateField', 'acceptEndDate');
//		}
//	})

};

//竞价 竞卖的
function AuctionSaletime() {
	    var nowDate=top.$("#systemTime").html()+" "+top.$(".sysTime").html();
		//公告截止时间
		var date = new Date();
		if(new Date(oldNoticeStartDate).getTime() <= new Date(nowDate).getTime()) {
			var StartDate=new Date(nowDate)
		}else{
			var StartDate=new Date(oldNoticeStartDate)		
		}
		 
	    $('#noticeEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:new Date(nowDate),
			onSelectTime:function(e) {				
				$('#noticeEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						minDate:StartDate
					});
					
				$('#askEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					maxDate:e,
					onSelectTime:function(b) {
						$('#answersEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',						
							minDate:b
						});
					}
				});
				$('#answersEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					maxDate:e,
					onSelectTime:function(b) {
						$('#askEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							maxDate:b
						});
					}
				});
				$('#auctionStartDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					minDate:e,
					onSelectTime:function(b) {
						$('#askEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							minDate:b
						});
					}
				});
				$('#fileEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
						$('#fileCheckEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							minDate:b
						});
					}
						
				});	
				$('#fileCheckEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					maxDate:e,
					onSelectTime:function(b) {
						$('#fileEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							maxDate:b
						});
					}
				});
				$('#offerEndDate').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						value:GMTToStr(e),
						maxDate:e,
						onSelectTime:function(b) {
						$('#checkEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							minDate:b
						});
					}
						
				});	
				$('#checkEndDate').datetimepicker({
					step:5,
					lang:'ch',
					format: 'Y-m-d H:i:s',
					value:GMTToStr(e),
					maxDate:e,
					onSelectTime:function(b) {
						$('#offerEndDate').datetimepicker({
							step:5,
							lang:'ch',
							format: 'Y-m-d H:i:s',
							maxDate:b
						});
					}
				});
				}	
			})		

	//提出澄清截止时间
	$('#askEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});

	$('#offerEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});
	$('#checkEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});


	//答复截止时间
	$('#answersEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});
	//竞价开始
	$('#auctionStartDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});	
	//竞价文件递交截止时间
	$('#fileEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
	});
	$('#fileCheckEndDate').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:StartDate
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

function GetTime(time) {
	var date = new Date(time).getTime();

	return date;
};

function getFiles(id) {
	$.ajax({
		url: config.bidhost + '/PurFileController/list.do',
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
		url: config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do',
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
	var para;
	if(tenderType == "0" || tenderType == "6"){
		para = {
			"packageId": packageId,
		}
	}else if(tenderType == "1" || tenderType == "2"){
		para = {
			"projectId": projectId,
		}
	}
	
	$.ajax({
				url: saveUrl,
				type: 'get',
				dataType: 'json',
				async: false,
				data:para/* {
					"packageId": packageId,
				}*/,
				success: function(res) {
					if(res.success == true) {
						if(res.data.projectSupplement.length==0) {
							/*$("#oldNoticeEndDate").html(res.data.noticeEndDate);
							$("#noticeEndDate").val(res.data.noticeEndDate);*/

							if(tenderType == "0" || tenderType == "6") {
								if(examTypes == "0") {
									//项目预审，未发布邀请函
									if(inviteStates == "0") {
										$("#oldNoticeEndDate").html(res.data.noticeEndDate);
										$("#noticeEndDate").val(res.data.noticeEndDate);
										$("#oldExamAskEndDate").html(res.data.examAskEndDate);
										$("#examAskEndDate").val(res.data.examAskEndDate);
										$("#oldExamAnswersEndDate").html(res.data.examAnswersEndDate);
										$("#examAnswersEndDate").val(res.data.examAnswersEndDate);
										$("#oldExamCheckEndDate").html(res.data.examCheckEndDate);
										$("#examCheckEndDate").val(res.data.examCheckEndDate);
										if(isSigns=="1" && tenderType == "0"){
											$("#oldSignEndDate").html(res.data.signEndDate);//根据公开范围判断
											$("#signEndDate").val(res.data.signEndDate);
										}
									} else if(inviteStates == "1") { //项目预审，已发布邀请函（邀请函变更）
										$("#oldAskEndDate").html(res.data.askEndDate);
										$("#askEndDate").val(res.data.askEndDate);
										$("#oldAnswersEndDate").html(res.data.answersEndDate);
										$("#answersEndDate").val(res.data.answersEndDate);
										$("#oldOfferEndDate").html(res.data.offerEndDate);
										$("#offerEndDate").val(res.data.offerEndDate);
										/*$("#oldSignEndDate").html(res.data.signEndDate);
										$("#signEndDate").val(res.data.signEndDate);*/
										$("#oldCheckEndDate").html(res.data.checkEndDate);
										$("#checkEndDate").val(res.data.checkEndDate);
										$("#oldAcceptEndDate").html(res.data.acceptEndDate);
										$("#acceptEndDate").val(res.data.acceptEndDate);
									}

								} else if(examTypes == "1") { //项目后审
									$("#oldNoticeEndDate").html(res.data.noticeEndDate);
									$("#noticeEndDate").val(res.data.noticeEndDate);
									$("#oldAskEndDate").html(res.data.askEndDate);
									$("#askEndDate").val(res.data.askEndDate);
									$("#oldAnswersEndDate").html(res.data.answersEndDate);
									$("#answersEndDate").val(res.data.answersEndDate);
									$("#oldOfferEndDate").html(res.data.offerEndDate);
									$("#offerEndDate").val(res.data.offerEndDate);
									if(isSigns=="1" && tenderType == "0"){
										$("#oldSignEndDate").html(res.data.signEndDate);
										$("#signEndDate").val(res.data.signEndDate);
									}
									$("#oldCheckEndDate").html(res.data.checkEndDate);
									$("#checkEndDate").val(res.data.checkEndDate);
								}

							} else if(tenderType == "1" || tenderType == "2") {
								$("#oldNoticeEndDate").html(res.data.noticeEndDate);
								$("#noticeEndDate").val(res.data.noticeEndDate);
								$("#oldAskEndDate").html(res.data.askEndDate);
								$("#askEndDate").val(res.data.askEndDate);
								$("#oldAnswersEndDate").html(res.data.answersEndDate);
								$("#answersEndDate").val(res.data.answersEndDate);

								$("#oldOfferEndDate").html(res.data.fileEndDate);
								$("#offerEndDate").val(res.data.fileEndDate);

								$("#oldCheckEndDate").html(res.data.fileCheckEndDate);
								$("#checkEndDate").val(res.data.fileCheckEndDate);
								$("#oldAuctionStartDate").html(res.data.auctionStartDate);
								$("#auctionStartDate").val(res.data.auctionStartDate);

							}

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

										/*$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
										$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);*/
										if(tenderType == "0" || tenderType == "6") {
											if(examTypes == "0") {
												//预审未发送邀请函时
												if(inviteStates == "0") {
													if(res.data.projectSupplement[i].isChangeDate == "0"){
														$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
														$("#noticeEndDate").val(res.data.projectSupplement[i].oldNoticeEndDate);
														$("#oldExamAskEndDate").html(res.data.projectSupplement[i].oldExamAskEndDate);
														$("#examAskEndDate").val(res.data.projectSupplement[i].oldExamAskEndDate);
														$("#oldExamAnswersEndDate").html(res.data.projectSupplement[i].oldExamAnswersEndDate);
														$("#examAnswersEndDate").val(res.data.projectSupplement[i].oldExamAnswersEndDate);
														$("#oldExamCheckEndDate").html(res.data.projectSupplement[i].oldExamCheckEndDate);
														$("#examCheckEndDate").val(res.data.projectSupplement[i].oldExamCheckEndDate);
														if(isSigns=="1" && tenderType == "0"){
															$("#oldSignEndDate").html(res.data.projectSupplement[i].oldSignEndDate);
															$("#signEndDate").val(res.data.projectSupplement[i].oldSignEndDate);
														}
													}else if(res.data.projectSupplement[i].isChangeDate == "1"){
														$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
														$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
														$("#oldExamAskEndDate").html(res.data.projectSupplement[i].oldExamAskEndDate);
														$("#examAskEndDate").val(res.data.projectSupplement[i].examAskEndDate);
														$("#oldExamAnswersEndDate").html(res.data.projectSupplement[i].oldExamAnswersEndDate);
														$("#examAnswersEndDate").val(res.data.projectSupplement[i].examAnswersEndDate);
														$("#oldExamCheckEndDate").html(res.data.projectSupplement[i].oldExamCheckEndDate);
														$("#examCheckEndDate").val(res.data.projectSupplement[i].examCheckEndDate);
														if(isSigns=="1" && tenderType == "0"){
															$("#oldSignEndDate").html(res.data.projectSupplement[i].oldSignEndDate);
															$("#signEndDate").val(res.data.projectSupplement[i].signEndDate);
														}
													}
												} else if(inviteStates == "1") { //项目预审，已发布邀请函（邀请函变更）
													if(res.data.projectSupplement[i].isChangeDate == "0"){
														//$("#noticeEndDate").val(res.data.projectSupplement[i].oldNoticeEndDate);
														$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
														$("#askEndDate").val(res.data.projectSupplement[i].oldAskEndDate);
														$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
														$("#answersEndDate").val(res.data.projectSupplement[i].oldAnswersEndDate);
														$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldOfferEndDate);
														$("#offerEndDate").val(res.data.projectSupplement[i].oldOfferEndDate);
														$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldCheckEndDate);
														$("#checkEndDate").val(res.data.projectSupplement[i].oldCheckEndDate);
														$("#oldAcceptEndDate").html(res.data.projectSupplement[i].oldAcceptEndDate);
														$("#acceptEndDate").val(res.data.projectSupplement[i].oldAcceptEndDate);
													}else if(res.data.projectSupplement[i].isChangeDate == "1"){
														$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
														$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
														$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
														$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
														$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldOfferEndDate);
														$("#offerEndDate").val(res.data.projectSupplement[i].offerEndDate);
														$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldCheckEndDate);
														$("#checkEndDate").val(res.data.projectSupplement[i].checkEndDate);
														$("#oldAcceptEndDate").html(res.data.projectSupplement[i].oldAcceptEndDate);
														$("#acceptEndDate").val(res.data.projectSupplement[i].acceptEndDate);
													}
													
												}
												/*$("#oldExamAskEndDate").html(res.data.projectSupplement[i].oldExamAskEndDate);
										$("#examAskEndDate").val(res.data.projectSupplement[i].examAskEndDate);
										$("#oldExamAnswersEndDate").html(res.data.projectSupplement[i].oldExamAnswersEndDate);
										$("#examAnswersEndDate").val(res.data.projectSupplement[i].examAnswersEndDate);
										
									    $("#oldExamCheckEndDate").html(res.data.projectSupplement[i].oldExamCheckEndDate);
									    $("#examCheckEndDate").val(res.data.projectSupplement[i].examCheckEndDate);
										$("#oldAcceptEndDate").html(res.data.projectSupplement[i].oldAcceptEndDate);*/
											} else if(examTypes == "1") {
												if(res.data.projectSupplement[i].isChangeDate == "0"){
													$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
													$("#noticeEndDate").val(res.data.projectSupplement[i].oldNoticeEndDate);
													$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
													$("#askEndDate").val(res.data.projectSupplement[i].oldAskEndDate);
													$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
													$("#answersEndDate").val(res.data.projectSupplement[i].oldAnswersEndDate);
													$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldOfferEndDate);
													$("#offerEndDate").val(res.data.projectSupplement[i].oldOfferEndDate);
													if(isSigns=="1" && tenderType == "0"){
														$("#oldSignEndDate").html(res.data.projectSupplement[i].oldSignEndDate);
														$("#signEndDate").val(res.data.projectSupplement[i].oldSignEndDate);
													}
													$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldCheckEndDate);
													$("#checkEndDate").val(res.data.projectSupplement[i].oldCheckEndDate);
												}else if(res.data.projectSupplement[i].isChangeDate == "1"){
													$("#oldNoticeEndDate").html(res.data.projectSupplement[i].oldNoticeEndDate);
													$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
													$("#oldAskEndDate").html(res.data.projectSupplement[i].oldAskEndDate);
													$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
													$("#oldAnswersEndDate").html(res.data.projectSupplement[i].oldAnswersEndDate);
													$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
													$("#oldOfferEndDate").html(res.data.projectSupplement[i].oldOfferEndDate);
													$("#offerEndDate").val(res.data.projectSupplement[i].offerEndDate);
													if(isSigns=="1" && tenderType == "0"){
														$("#oldSignEndDate").html(res.data.projectSupplement[i].oldSignEndDate);
														$("#signEndDate").val(res.data.projectSupplement[i].signEndDate);
													}
													$("#oldCheckEndDate").html(res.data.projectSupplement[i].oldCheckEndDate);
													$("#checkEndDate").val(res.data.projectSupplement[i].checkEndDate);
												}
												

											}
										} else if(tenderType == "1" || tenderType == "2") {
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
								}
							} else {
								for(var i = 0; i < res.data.projectSupplement.length; i++) {

									if(res.data.projectSupplement[i].noticeEndDate != undefined) {

										/*$("#oldNoticeEndDate").html(res.data.projectSupplement[i].noticeEndDate);
										$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);*/

										if(tenderType == "0" || tenderType == "6") {
											if(examTypes == "0") {
													//预审未发送邀请函时
													if(inviteStates == "0") {
														$("#oldNoticeEndDate").html(res.data.projectSupplement[i].noticeEndDate);
														$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
														$("#oldExamAskEndDate").html(res.data.projectSupplement[i].examAskEndDate);
														$("#examAskEndDate").val(res.data.projectSupplement[i].examAskEndDate);
														$("#oldExamAnswersEndDate").html(res.data.projectSupplement[i].examAnswersEndDate);
														$("#examAnswersEndDate").val(res.data.projectSupplement[i].examAnswersEndDate);
														$("#oldExamCheckEndDate").html(res.data.projectSupplement[i].examCheckEndDate);
														$("#examCheckEndDate").val(res.data.projectSupplement[i].examCheckEndDate);
														if(isSigns=="1" && tenderType == "0"){
															$("#oldSignEndDate").html(res.data.signEndDate);//根据公开范围判断
															$("#signEndDate").val(res.data.signEndDate);
														}
													} else if(inviteStates == "1") { //项目预审，已发布邀请函（邀请函变更）
														$("#oldAskEndDate").html(res.data.projectSupplement[i].askEndDate);
														$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
														$("#oldAnswersEndDate").html(res.data.projectSupplement[i].answersEndDate);
														$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
														$("#oldOfferEndDate").html(res.data.projectSupplement[i].offerEndDate);
														$("#offerEndDate").val(res.data.projectSupplement[i].offerEndDate);
														/*$("#oldSignEndDate").html(res.data.projectSupplement[i].signEndDate);
														$("#signEndDate").val(res.data.projectSupplement[i].signEndDate);*/
														$("#oldCheckEndDate").html(res.data.projectSupplement[i].checkEndDate);
														$("#checkEndDate").val(res.data.projectSupplement[i].checkEndDate);
														$("#oldAcceptEndDate").html(res.data.projectSupplement[i].acceptEndDate);
														$("#acceptEndDate").val(res.data.projectSupplement[i].acceptEndDate);
													}

												} else if(examTypes == "1") {
													$("#oldNoticeEndDate").html(res.data.projectSupplement[i].noticeEndDate);
													$("#noticeEndDate").val(res.data.projectSupplement[i].noticeEndDate);
													$("#oldAskEndDate").html(res.data.projectSupplement[i].askEndDate);
													$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
													$("#oldAnswersEndDate").html(res.data.projectSupplement[i].answersEndDate);
													$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
													$("#oldOfferEndDate").html(res.data.projectSupplement[i].offerEndDate);
													$("#offerEndDate").val(res.data.projectSupplement[i].offerEndDate);
													if(isSigns=="1" && tenderType == "0"){
														$("#oldSignEndDate").html(res.data.signEndDate);//根据公开范围判断
														$("#signEndDate").val(res.data.signEndDate);
													}
													$("#oldCheckEndDate").html(res.data.projectSupplement[i].checkEndDate);
													$("#checkEndDate").val(res.data.projectSupplement[i].checkEndDate);
												}

											} else if(tenderType == "1" || tenderType == "2") {
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

											}
											return
										} else {
											/*$("#oldNoticeEndDate").html(res.data.noticeEndDate);
											$("#noticeEndDate").val(res.data.noticeEndDate);*/

											if(tenderType == "0" || tenderType == "6") {
												if(examTypes == "0") {
														//预审未发送邀请函时
														if(inviteStates == "0") {
															$("#oldNoticeEndDate").html(res.data.noticeEndDate);
															$("#noticeEndDate").val(res.data.noticeEndDate);
															$("#oldExamAskEndDate").html(res.data.projectSupplement[i].examAskEndDate);
															$("#examAskEndDate").val(res.data.projectSupplement[i].examAskEndDate);
															$("#oldExamAnswersEndDate").html(res.data.projectSupplement[i].examAnswersEndDate);
															$("#examAnswersEndDate").val(res.data.projectSupplement[i].examAnswersEndDate);
															$("#oldExamCheckEndDate").html(res.data.projectSupplement[i].examCheckEndDate);
															$("#examCheckEndDate").val(res.data.projectSupplement[i].examCheckEndDate);
															if(isSigns=="1" && tenderType == "0"){
																$("#oldSignEndDate").html(res.data.signEndDate);//根据公开范围判断
																$("#signEndDate").val(res.data.signEndDate);
															}
															
														} else if(inviteStates == "1") { //项目预审，已发布邀请函（邀请函变更）
															$("#oldAskEndDate").html(res.data.projectSupplement[i].askEndDate);
															$("#askEndDate").val(res.data.projectSupplement[i].askEndDate);
															$("#oldAnswersEndDate").html(res.data.projectSupplement[i].answersEndDate);
															$("#answersEndDate").val(res.data.projectSupplement[i].answersEndDate);
															$("#oldOfferEndDate").html(res.data.projectSupplement[i].offerEndDate);
															$("#offerEndDate").val(res.data.projectSupplement[i].offerEndDate);
															/*$("#oldSignEndDate").html(res.data.projectSupplement[i].signEndDate);
															$("#signEndDate").val(res.data.projectSupplement[i].signEndDate);*/
															$("#oldCheckEndDate").html(res.data.projectSupplement[i].checkEndDate);
															$("#checkEndDate").val(res.data.projectSupplement[i].checkEndDate);
															$("#oldAcceptEndDate").html(res.data.projectSupplement[i].acceptEndDate);
															$("#acceptEndDate").val(res.data.projectSupplement[i].acceptEndDate);
														}
													} else if(examTypes == "1") {
														$("#oldNoticeEndDate").html(res.data.noticeEndDate);
														$("#noticeEndDate").val(res.data.noticeEndDate);
														$("#oldAskEndDate").html(res.data.askEndDate);
														$("#askEndDate").val(res.data.askEndDate);
														$("#oldAnswersEndDate").html(res.data.answersEndDate);
														$("#answersEndDate").val(res.data.answersEndDate);
														$("#oldOfferEndDate").html(res.data.offerEndDate);
														$("#offerEndDate").val(res.data.offerEndDate);
														if(isSigns=="1" && tenderType == "0"){
															$("#oldSignEndDate").html(res.data.signEndDate);//根据公开范围判断
															$("#signEndDate").val(res.data.signEndDate);
														}
														$("#oldCheckEndDate").html(res.data.checkEndDate);
														$("#checkEndDate").val(res.data.checkEndDate);
													}
												} else if(tenderType == "1" || tenderType == "2") {
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
					}
			})
	};