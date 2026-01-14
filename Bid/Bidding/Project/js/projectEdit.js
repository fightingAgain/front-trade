var saveUrl = config.tenderHost + '/ProjectController/save.do'; // 点击添加项目保存的接口
var getUrl = config.tenderHost + '/ProjectController/getAndFile.do'; // 获取项目信息的接口
var WorkflowUrl = config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
/* var fileUrl = config.tenderHost + "/FileController/upload.do";		//文件上传地址*/
var fileUrl = config.FileHost + "/FileController/streamFile.do"; //H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do'; //flash上传的地址
var fileDelUrl = config.tenderHost + "/ProjectAttachmentFileController/delete.do"; //文件删除地址
var fileDownload = config.FileHost + "/FileController/download.do"; //下载文件
var fileAddUrl = config.tenderHost + "/ProjectAttachmentFileController/insertProjectAttachmentFile.do"; //添加附件表的地址
var enterpriseUrl = "Bidding/Model/enterpriseList.html"; //招标人页面
var pageView = "Bidding/Project/model/projectView.html"; //查看页面
var id = "";
var isMulti = true;
var enterPriseIframe = "";
var projectForm = '';
var tendererId = []; //	存其他招标人Id ，在添加其他招标人时查重
var tendererArr = []; //存其他招标人信息，方便添加与删除招标人信息后保存时的数组下标值
var mainTender = {}; //存主招标人信息，方便添加与删除招标人信息后保存时的数组下标值
var mainTenderId = ''; //	存主招标人Id ，在添加其他招标人时查重
var projectId = ''; //项目id ，在上传文件时要保存一下项目，根据这个id来判断项目是否
var fileId = ''; //保存文件到附件表时传回来的文件ID
var fileList = []; //保存文件信息
var industriesType = "";
var enterpriseId; //企业ID

var employeeInfo = entryInfo();

var fileUploads = null;
var getRegion = null; // 行政区域

$(function() {

	//下拉框数据初始化
	initSelect('.select');

	// 引用util.js文件中的manageEle方法初始化表单容器
	manageEle('#formName');
	initValidator() //初始化表单验证规则

	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		//审核
		$("#approval").ApprovalProcess({
			url: top.config.tenderHost,
			businessId: id,
			status: 1,
			type: "xmsp"
		});
		getDetail();
	} else {
		// 初始化省市联动
		getRegion = new MultiLinkage("#areaBlock", {
			name: "",
			status: 1,
			code: '4206'
		});
		selectDefault('#fundSource', '8');
		$('#tendererCodeType').val('2');
		//审核
		$("#approval").ApprovalProcess({
			url: top.config.tenderHost,
			businessId: id,
			status: 1,
			type: "xmsp",
		});

		//获取行业列表
		$(".proIndustriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: "E",
			selectCallback: function(code) {

				industriesType = code;
			}
		});

	}

	if($("[name='checkerIds']").length > 0) {
		$("#btnSubmit").html('<span class="glyphicon glyphicon-saved"></span>提交审核');
	} else {
		$("#btnSubmit").html('<span class="glyphicon glyphicon-saved"></span>生效');
	}

	//上传按钮
	$('#fileUp').click(function() {
		var obj = $(this);
		if($("[name='interiorProjectCode']").val() == "") {
			parent.layer.alert("请填写项目编号", {
				icon: 7,
				title: '提示'
			});
			$('#collapseOne').collapse('show');
			return;
		} else if($("[name='projectName']").val() == "") {
			parent.layer.alert("请填写项目名称", {
				icon: 7,
				title: '提示'
			});
			$('#collapseOne').collapse('show');
			return;
		}

		if(!(id && id != "")) {
			saveForm('true', false, function() {
				initUpload();
				$('#fileLoad').trigger('click');
			});
		} else {
			initUpload();
			$('#fileLoad').trigger('click');
		}

	});
	$("#agencyEnterprisName").val(employeeInfo.enterpriseName ? employeeInfo.enterpriseName : "");
	$("#agencyEnterprisId").val(employeeInfo.enterpriseId ? employeeInfo.enterpriseId : "");
	// 	$("#contactor").val(employeeInfo.userName);
	// 	$("#contactInformation").val(employeeInfo.tel);
	$("#enterpriseCode").val(employeeInfo.enterpriseCode ? employeeInfo.enterpriseCode : "");

	//上传文件
	//	fileUploads = new StreamUpload("#fileContent",{
	//		basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/201",
	//		businessId: id,
	//		status:1
	//	});

	// 	$(".pageModel").height($("body").height()-54);

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	/*$('#contributionScale').blur(function(){
		var scale = Number($(this).val());
		if(scale>100){
			parent.layer.alert('出资比例只能输入0-100的数值',{icon:7,title:'提示'},function(index){
				parent.layer.close(index);
			})
		}
	})*/

	//保存
	$("#btnSave").click(function() {
		/*if($('#contributionScale') && $('#contributionScale').val() != ''){
	 		var scale = Number($('#contributionScale').val());
			if(scale>100){
				parent.layer.alert('出资比例只能输入0-100的数值',{icon:7,title:'提示'},function(index){
					parent.layer.close(index);
				});
				return
			}
		 }*/
		//验证前所有折叠的都要展开，表单验证不验证隐藏的元素

		$.each($('.panel-collapse'), function() {
			$(this).collapse('show')
		});
		$('#formName').bootstrapValidator('resetForm');

		$('#formName').bootstrapValidator('validate');
		notTestEmpty('#formName', false);

		if($("#formName").data('bootstrapValidator').isValid()) {
			parent.layer.confirm('确定保存?', {
				icon: 3,
				title: '询问'
			}, function(index) {
				parent.layer.close(index);
				saveForm(true, true);
			})
		} else {
			invalidNot("#formName")
		}
		// parent.layer.confirm('确定保存?', {
		// 	icon: 3,
		// 	title: '询问'
		// }, function (index) {
		// 	parent.layer.close(index);
		// 	saveForm(true, true);
		// })
	});

	//提交
	$("#btnSubmit").click(function() {
		//验证前所有折叠的都要展开，表单验证不验证隐藏的元素
		$.each($('.panel-collapse'), function() {
			$(this).collapse('show')
		});

		$('#formName').bootstrapValidator('resetForm');
		notTestEmpty('#formName', true);
		$('#formName').bootstrapValidator('validate');

		var btnTxt = "";
		if($("[name='checkerIds']").length > 0) {
			btnTxt = "提交审核";
		} else {
			btnTxt = "生效";
		}
		if($("#formName").data('bootstrapValidator').isValid()) {
			if($("[name='checkerIds']").length<=0){
			
			parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认' + btnTxt, {
				//				icon: 3,
				title: btnTxt,
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					//parent.layer.close(index);
					if(checkForm($("#formName"))) {
						/*var scale = Number($('#contributionScale').val());
						if(scale>100){
							parent.layer.alert('出资比例只能输入0-100的数值',{icon:7,title:'提示'},function(index){
								parent.layer.close(index);
							});
							return
						}else{
							saveForm(false);
						}*/
						saveForm(false);
					}
				},
				btn2:function(index, layero) {
					parent.layer.close(index);
				}
			})
			}else{
				parent.layer.confirm('是否确认' + btnTxt, {
				title: btnTxt,
				btn: [' 是 ', ' 否 '],
				yes: function(layero, index) {
					if(checkForm($("#formName"))) {
					
						saveForm(false);
					}
				},
				btn2:function(layero, index) {
					parent.layer.close(index);
				}
			})
			}
		} else {
			invalidNot("#formName")

		}

	});

	//选择招标人
	$("#btnTender").click(function() {
		isMulti = false;
		openEnterprise();
	});

	//选择其他招标人
	$("#btnOtherTender").click(function() {
		isMulti = true;
		openEnterprise();
	});

	//删除招标人
	$("#enterpriseBlock").on("click", ".btnDel", function() {
		var id = $(this).attr("data-id");
		var index = $(this).closest('tr').index();
		$(this).parent().parent().remove();
		tendererId.splice(index, 1);
		tendererArr.splice(index, 1);
		enterpriseHtml(tendererArr)

	});

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
	$("#fileList").on('click', '.downloadModel', function() {
		var road = $(this).closest('td').attr('data-file-url'); // 下载文件路径
		var fileName = $(this).closest('td').attr('data-file-name'); // 下载文件路径
		$(this).attr('href', $.parserUrlForToken(fileDownload + '?ftpPath=' + road + '&fname=' + fileName))

	});
});
//初始化文件上传
function initUpload() {
	if(!fileUploads) {
		fileUploads = new StreamUpload("#fileContent", {
			basePath: "/" + employeeInfo.enterpriseId + "/" + id + "/201",
			businessId: id,
			status: 1,
			businessTableName: 'T_PROJECT', //立项批复文件（项目审批核准文件）    项目表附件
			attachmentSetCode: 'PROJECT_APPROVAL_FILE'
		});
	}
}

// 
/*
 * 表单提交
 * isSave: true保存， false提交  
 * isBtn：true保存按钮保存。false其他按钮保存
 */
function saveForm(isSave, isBtn, callback) {
	var arr = {},
		tips = "";
	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	if(!isSave) {
		arr.isSubmit = 1;
		tips = "项目信息提交成功";
	} else {
		tips = "项目信息保存成功";
	}
	// if ($("[name='interiorProjectCode']").val() == "") {
	// 	parent.layer.alert("请填写项目编号!", { icon: 7, title: '提示' });
	// 	$('#collapseOne').collapse('show');
	// 	$("[name='interiorProjectCode']").focus();
	// 	return;
	// }
	// if ($("[name='projectName']").val() == "") {
	// 	parent.layer.alert("请填写项目名称!", { icon: 7, title: '提示' });
	// 	$('#collapseOne').collapse('show');
	// 	$("[name='projectName']").focus();
	// 	return;
	// }
	// var str = $("[name='projectName']").val();
	// if (str.length > 300) {
	// 	parent.layer.alert("项目名称输入长度不能超过300个字", { icon: 7, title: '提示' });
	// 	return;
	// }
	// var strAddress = $("[name='address']").val();
	// if (strAddress.length > 50) {
	// 	parent.layer.alert("项目地址输入长度不能超过50个字", { icon: 7, title: '提示' });
	// 	return;
	// }
	//是否选行政区域
	if($("#areaBlock select:eq(2)").val()) {
		arr.regionCode = $("#areaBlock select:eq(2)").val();
	} else {
		arr.regionCode = $("#areaBlock select:eq(1)").val();
	}
	if(!arr.regionCode && !isSave) {
		parent.layer.alert("请选择行政区域", function(idx) {
			parent.layer.close(idx);
			$('#collapseOne').collapse('show');
			$("#areaBlock select:eq(2)").focus();
		});
		return;
	}
	//项目来源，委托项目会带有这个参数，代理机构创建的项目则为2
	if(projectForm != '') {
		arr.projectForm = projectForm
	} else {
		arr.projectForm = '2';
	}
	if(id != "") {
		arr.id = id;
	}
	arr.industriesType = industriesType;

	if(checkInputLength($("#formName"))) {
		$('#btnSubmit').attr('disabled', true);
		$.ajax({
			url: saveUrl,
			type: "post",
			async: false,
			data: arr,
			beforeSend: function(xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function(data) {
				$('#btnSubmit').attr('disabled', false);
				if(data.success == false) {
					parent.layer.alert(data.message);
					return;
				} else {
					if(isSave) {
						projectId = data.data;
						$("#projectId").val(projectId);
						id = projectId
						if(callback) {
							callback()
						}
						if(isBtn) {
							parent.layer.alert(tips, {
								icon: 1,
								title: '提示'
							});
						}
					} else {
						parent.layer.alert(tips, {
							closeBtn:0,
							icon: 1,
							title: '提示'
						}, function(idx) {
							parent.layer.close(idx);
							parent.$(".layui-layer-title").html("查看项目信息");
							window.location.href = pageView + "?id=" + data.data + "&isThrough=" + ($("[name='checkerIds']").length > 0 ? 0 : 1);
						});
					}
				}
				parent.$("#projectList").bootstrapTable('refresh');
			},
			error: function(data) {
				$('#btnSubmit').attr('disabled', false);
				parent.layer.alert("加载失败", {
					icon: 2,
					title: '提示'
				});
			}
		});
	}
};

function getDetail() {
	$.ajax({
		url: getUrl,
		type: "post",
		data: {
			id: id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			arr.projectForm ? projectForm = arr.projectForm : "";
			initUpload();

			for(var key in arr) {
				if(key == "regionCode") {
					// 初始化省市联动
					getRegion = new MultiLinkage("#areaBlock", {
						name: "",
						status: 1,
						code: arr[key]
					});
					getRegion.codeToName(arr[key]);
				} else if(key == "industriesType") {
					continue;
				} else if(key == "tenderees" && arr[key].length > 0) {
					var data = [];
					for(var i = 0; i < arr.tenderees.length; i++) {
						if(arr.tenderees[i].tendererType == 0) { //主招标人
							for(var key in arr.tenderees[i]) {
								$("[name='tenderees[0]." + key + "']").val(arr.tenderees[i][key]);
							}
							mainTenderId = arr.tenderees[i].tendererEnterprisId;
							mainTender = arr.tenderees[i];
						} else { //其他招标人
							if($.inArray(arr.tenderees[i].tendererEnterprisId, tendererId) == -1) {
								tendererId.push(arr.tenderees[i].tendererEnterprisId);
								tendererArr.push(arr.tenderees[i]);
							}
						}

					};
					enterpriseHtml(tendererArr);
				} else if(key == "projectAttachmentFiles") { //文件信息
					var fileArr = arr.projectAttachmentFiles;
					if(fileArr.length > 0) {
						fileList = fileArr;
						fileUploads.fileHtml(fileList);
					}

				} else if(key == "relateCode") {
					$("[name='relateCode'][value='" + arr[key] + "']").attr("checked", "checked");
				} else {
					$("[id='" + key + "']").val(arr[key]);
				}
				$("#projectId").val(arr.id);
				//信息反显时赋值给projectId以此来判断上传文件时项目是否存在
				projectId = arr.id;

			}
			$(".proIndustriesType").dataLinkage({
				optionName: "INDUSTRIES_TYPE",
				optionValue: arr.industriesType ? arr.industriesType : "",
				selectCallback: function(code) {
					industriesType = code;
				}
			});
			$("#legalPerson").html(arr.legalPerson);

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
};

/*
 * 打开招标人页面
 */
function openEnterprise() {
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "招标人",
		area: ['1000px', '650px'],
		resize: false,
		content: enterpriseUrl,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.passMessage({
				isMulti: isMulti,
				callback: enterpriseCallback
			}); //调用子窗口方法，传参

		}
	});
}
/*
 * 同级页面返回参数
 */
function enterpriseCallback(data) {
	if(isMulti) {
		// 选择其他招标人时为多选，向数组tendererArr中添加选中的招标人信息，想数组tendererId中添加选中招标人的id
		for(var i = 0; i < data.length; i++) {
			if($.inArray(data[i].id, tendererId) == -1 && data[i].id != mainTenderId) {
				tendererId.push(data[i].id);
				tendererArr.push({
					tendererName: data[i].enterpriseName,
					tendererEnterprisId: data[i].id,
					tendererCode: data[i].enterpriseCode,
					//					tendererCodeType:data[i].enterpriseCodeType,
					legalPerson: data[i].legalPerson,
					agentName: data[i].agentName,
					agentTel: data[i].agentTel,
					enterpriseAddress: data[i].enterpriseAddress,
					id: ""
				})
			}
		}
		enterpriseHtml(tendererArr);

	} else {
		//选择主招标人时，若数组tendererArr、tendererId中存在则移除再替换数组tendererArr、tendererId中的第一个数据，因为主招标人是以tendererArr[0]的数据来显示的
		var arr = {
			tendererName: data[0].legalName,
			tendererEnterprisId: data[0].id,
			tendererCode: data[0].legalCode,
			//			tendererCodeType:data[0].enterpriseCodeType,
			legalPerson: data[0].legalRepresent,
			agentName: data[0].agentName,
			agentTel: data[0].agentTel,
			enterpriseAddress: data[0].taxAddress,
			agentEmail: data[0].legalEmail,
			id: ""
		}
		if($.inArray(data[0].id, tendererId) != -1) {
			var index = $.inArray(data[0].id, tendererId);
			tendererArr.splice(index, 1);
			tendererId.splice(index, 1);
			enterpriseHtml(tendererArr);
		}
		mainTenderId = arr.tendererEnterprisId;
		mainTender = arr;
		// 反显主招标人信息
		for(var key in mainTender) {
			$("[name='tenderees[0]." + key + "']").val(mainTender[key]);
		}
		//反显主招标人
		$("[name='tenderees[0].tendererName']").val(mainTender.tendererName);
		//项目业主
		$("[name='tenderees[0].projectOwner']").val(mainTender.tendererName);
		//项目法人
		$("[name='legalPerson']").val(arr.tendererName);
		$("#legalPerson").html(arr.tendererName);
		$("[name='contactor']").val(data[0].legalContact);
		$("[name='contactInformation']").val(data[0].legalContactPhone);
	}
}
// 招标人代表表格
function enterpriseHtml(data) {
	var html = "";
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<thead><tr data-id="' + data.id + '">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                		<th style="width: 100px;">操作</th>\
	                	</tr></thead><tbody>';
	}
	for(var i = 0; i < data.length; i++) {
		html += '<tr>\
	                    		<td>' + data[i].tendererName + '\
	                    			<input type="hidden" name="tenderees[' + (i + 1) + '].tendererType" value="1" />\
	                    			<input type="hidden" name="tenderees[' + (i + 1) + '].tendererName" value="' + data[i].tendererName + '" />\
				                    <input type="hidden" name="tenderees[' + (i + 1) + '].tendererEnterprisId" value="' + data[i].tendererEnterprisId + '" />\
				                    <input type="hidden" name="tenderees[' + (i + 1) + '].tendererCode" value="' + data[i].tendererCode + '" />\
				                    <input type="hidden" name="tenderees[' + (i + 1) + '].legalPerson" value="' + data[i].legalPerson + '" />\
	                    		</td>\
	                    		<td><input type="text" name="tenderees[' + (i + 1) + '].agentName" class="form-control" value="' + data[i].agentName + '"></td>\
	                    		<td><input type="text" name="tenderees[' + (i + 1) + '].agentTel" class="form-control" value="' + data[i].agentTel + '"></td>\
	                    		<td>\
	                    			<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button>\
	                    		</td>\
	                    	</tr>';
	}

	if($("#enterpriseTab").length == 0) {
		html += '</tbody></table>';
		$("#enterpriseBlock").html("");
		$(html).appendTo("#enterpriseBlock");
	} else {
		$("#enterpriseTab tbody").html("");
		$(html).appendTo("#enterpriseTab tbody");
	}
}

function fileUpload(id) {

	var name = ''; // 文件名
	var path = ''; //文件返回路径
	var type = ''; //文件类型

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
		browseFileId: "fileLoad", //文件选择DIV的ID
		autoUploading: true, //选择文件后是否自动上传
		autoRemoveCompleted: true, //文件上传后是否移除
		postVarsPerFile: {
			//自定义文件保存路径前缀
			basePath: "/" + employeeInfo.enterpriseId + "/" + id + "/201",
			Token: $.getToken(),
		},
		onComplete: function(file) { /** 单个文件上传完毕的响应事件 */

			name = file.name; //文件名称
			path = JSON.parse(file.msg).data.filePath; //后台返回的文件路径
			type = file.name.split(".").pop(); //文件的后缀  文件类型

			var length = $('#fileList tbody tr').length + 1; //添加上去的文件序号
			if(path) {
				//保存文件到附件表
				$.ajax({
					type: 'post',
					url: fileAddUrl,
					data: {
						'businessId': projectId,
						'businessTableName': 'T_PROJECT', //立项批复文件（项目审批核准文件）    项目表附件
						'attachmentSetCode': 'PROJECT_APPROVAL_FILE',
						'attachmentCount': '1',
						'attachmentName': name,
						'attachmentType': type,
						'attachmentFileName': name,
						'url': path,
						'attachmentState': '0'
					},
					success: function(data) {
						var fileData = {
							attachmentCount: '1',
							attachmentFileName: name,
							attachmentName: name,
							attachmentSetCode: "PROJECT_APPROVAL_FILE",
							attachmentState: '0',
							attachmentType: type,
							businessId: projectId,
							businessTableName: "T_PROJECT",
							id: data.data,
							url: path
						}
						fileList.push(fileData);
						fileId = data.data;
						//文件上传成功后在列表中显示，且可移除
						var html = $('<tr><td style="width: 60px; text-align: center;">' + length + '</td><td >' + name + '</td>' +
							'<td data-file-id="' + fileId + '" data-file-url="' + path + '" data-file-name="' + name + '">' +
							'<button type="button" data-id="" class="btn btn-primary btn-sm btn-download" >' +
							'<a style="color: #ffffff;" class="downloadModel" target="_blank" ><span class="glyphicon glyphicon-download"></span>下载</a></button>' +
							'<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button></td></tr>');
						$('#fileList tbody').append(html);
						parent.layer.alert("上传成功", {
							icon: 1,
							title: '提示'
						});
					},
					error: function() {
						parent.layer.alert(msg);
					}
				})
			}
		},
		onSelect: function(list) { //	选择文件后的响应事件

		}
	};
	var _t = new Stream(config);
}

function testCode(ele) {
	var han = /[\u4e00-\u9fa5]/;
	if($.trim(ele.value) != '') {
		if(han.test($.trim(ele.value))) {
			parent.layer.alert('请正确输入项目编号', function(index) {
				parent.layer.close(index)
				ele.value = '';
				ele.focus();
			});
		}
	}
}

// 初始化表单验证相关代码
function initValidator() {
	$('#formName').bootstrapValidator({
		//      message: 'This value is not valid',
		//提供输入验证图标提示
		feedbackIcons: {
			valid: 'glyphicon glyphicon-ok',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			'interiorProjectCode': {
				validators: {
					notEmpty: {
						message: '项目编号不能为空'
					},
					stringLength: {
						max: 125,
						message: '项目编号的长度不能超过125个字 '
					}
				}
			},
			'projectName': {
				validators: {
					notEmpty: {
						message: '项目名称不能为空'
					},
					stringLength: {
						max: 30,
						message: '项目名称的长度不能超过30个字 '
					}
				}
			},
			'contactInformation': {
				validators: {
					notEmpty: {
						message: '手机号码不能为空'
					},
					regexp: {
						regexp: /^1[3456789]\d{9}$/,
						message: '请输入正确的手机号码'
					},
				}
			},
			'contactor': {
				validators: {
					notEmpty: {
						message: '联系人不能为空'
					},
				}
			},
			'legalPerson': {
				trigger: 'change',
				validators: {
					notEmpty: {
						message: '招标人不能为空'
					}
				}
			},
			'contributionScale': { //出资比例
				validators: {
					notEmpty: {
						message: '出资比例不能为空'
					},
					stringLength: {
						max: 330,
						message: '出资比例长度不能超过330个字'
					}
				}
			},
			'address': { //项目地点
				validators: {
					notEmpty: {
						message: '项目地点不能为空'
					},
					stringLength: {
						max: 66,
						message: '项目地点长度不能超过66个字'
					}
				}
			},
			'projectScale': { //项目规模
				validators: {
					notEmpty: {
						message: '项目规模不能为空'
					},
					stringLength: {
						max: 1330,
						message: '项目规模长度不能超过1330个字'
					}
				}
			},

			// 'approvalName': {//项目审批文件名
			// 	validators: {
			// 		notEmpty: {
			// 			message: '项目审批文件名不能为空'
			// 		},
			// 		stringLength: {
			// 			max: 166,
			// 			message: '项目审批文件名长度不能超过166个字'
			// 		}
			// 	}
			// },
			// 'approvalNumber': {//项目审批文号
			// 	validators: {
			// 		notEmpty: {
			// 			message: '项目审批文号不能为空'
			// 		},
			// 		stringLength: {
			// 			max: 200,
			// 			message: '项目审批文号长度不能超过200个字'
			// 		}
			// 	}
			// },
			// 'approvalAuthority': {//项目审批单位
			// 	validators: {
			// 		notEmpty: {
			// 			message: '项目审批单位不能为空'
			// 		},
			// 		stringLength: {
			// 			max: 66,
			// 			message: '项目审批单位长度不能超过66个字'
			// 		}
			// 	}
			// }
		}
	})
}