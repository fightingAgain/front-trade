//上传可递交竞卖问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var findurl = top.config.AuctionHost + "/AuctionWasteFileController/findAuctionFileBasic"; //审核信息
var urlGetBiddingApprovalRecord = top.config.AuctionHost + "/WorkflowController/findWorkFlowWasteRecords"
//获取 可递交竞卖文件审核信息
var urlAuctionFile = top.config.AuctionHost + "/AuctionWasteFileController/findAuctionFileDetail.do";
//回显审核人
let urlGetResultAuditsUser = top.config.AuctionHost + "/WorkflowController/reviewApprovePerson"
//保存审核人
let urlSaveResultAudits = top.config.AuctionHost + "/WorkflowController/saveWasteWorkflowAccepList.do"
//撤回审核人
let urlRealBack = top.config.AuctionHost + "/WorkflowController/recallWasteWorkflow";
var selectInputId;
var urlAuditProcess = top.config.AuctionHost + "/WorkflowController/checkJJCGWorkFlowOver"
var urlLive0Check = top.config.AuctionHost + "/WorkflowController/addDataToJJCGRecord"
var fileUp = null;
var id = getUrlParam('id');
var supplierId = getUrlParam('enterpriseId');
var projectId = getUrlParam('projectId');
var packageId = getUrlParam("packageId");
var checkState = getUrlParam('checkState');
var supervisorCheck = true; //监督人是否审核完毕
var dataInfo;
var WORKFLOWTYPE = "fjwz_zzwj"; //
//查询采购审核
var workflowLevel = 0;
var checkSuccess = top.config.AuctionHost + "/WorkflowController/wasteWorkFlowAuditingOK.do";
var checkNoSuccess = top.config.AuctionHost + "/WorkflowController/wasteWorkFlowAuditingNO.do";

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function commitMsg() {
	let check = $("input[name='auditState']:checked").val();
	let workflowContent = $("#content").val();

	if(check) {
		var url;
		if(check == 0) {
			url = checkSuccess;
		} else {
			url = checkNoSuccess;
			if(workflowContent == null || $.trim(workflowContent) == "") {
				top.layer.alert("不通过填写说明！")
				return false;
			}
		}

		$.ajax({
			type: "post",
			url: url,
			data: {
				'businessId': id,
				'workflowResult': check,
				'workflowType': 'fjwz_zzwj',
				'workflowContent': $("#content").val()
			},
			success: function(res) {
				console.log(res);
				if(res.success) {
					parent.$('#ProjectAuditTable').bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					top.layer.alert("审核保存成功")
				} else {
					top.layer.alert("审核保存失败")
					return false;
				}
			}

		})

	} else {
		top.layer.alert("选择审核结果！")
	}

	return false;

}
$(function() {
	viewfindurl(supplierId);
	if(checkState == 0) {
		$("#btnsubmit").show();
	} else {

		$("#btnsubmit").hide();
	}
	initFileView();
	getResultAuditsLive();
	getBiddingApprovalRecord();
})

function viewfindurl(supplierId) {
	$.ajax({
		type: "post",
		url: findurl,
		datatype: 'json',
		data: {
			"enterpriseId": supplierId,
			"projectId": projectId
		},
		async: false,
		success: function(data) {
			if(data.success) {
				dataInfo = data.data;
				var messdata = dataInfo;
				$("#legaid").val(messdata.id);
				$("#legalName").html(messdata.legalName);
				$("#legalRepresent").html(messdata.legalRepresent);
				$("#legalContact").html(messdata.legalContact);
				$("#legalContactPhone").html(messdata.legalContactPhone);
				$("#legalContactAddress").html(messdata.legalContactAddress);
				$("#basicAccountNo").html(messdata.basicAccountNo);
				$("#bidderProxy").html(messdata.bidderProxy);
				$("#projectLeader").html(messdata.projectLeader);

				$("#bidderProxyCardType").html(formatCardType(messdata.bidderProxyCardType));
				$("#bidderProxyCard").html(messdata.bidderProxyCard);
				$("#projectLeaderCardType").html(formatCardType(messdata.projectLeaderCardType));
				$("#projectLeaderCard").html(messdata.projectLeaderCard);

				function formatCardType(value) {
					if (value == '0') {
						return '(身份证号)';
					} else if (value == '1') {
						return '(护照)';
					}
				}
			}
		}
	})
}
//填充竞卖文件信息表格信息
function initFileView(data) {
	var dataParam = {
		"projectId": projectId,
		'supplierId':supplierId
	}
	$.ajax({
		type: "get",
		url: urlAuctionFile,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				fileData = result.rows;
				//				fileTable(result.data);
				setAuctionFile(fileData[0]);
				$("#fileEndDate").html(fileData[0].fileEndDate);
				$("#fileCheckEndDate").html(fileData[0].fileCheckEndDate);
				$("#projectName").html(fileData[0].projectName);
				$("#projectCode").html(fileData[0].projectCode);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

function setAuctionFile(data) {
	var fileNameArr = data.fileName.split(","); //文件名数组
	var filePathArr = data.filePath.split(","); //路径数组
	var fileTypeArr = data.fileType.split(","); //路径数组
	var uploadFileArr = [];
	for(var i = 0; i < fileNameArr.length; i++) {
		var newObj = {};
		newObj.fileName = fileNameArr[i];
		newObj.filePath = filePathArr[i];
		newObj.fileType = fileTypeArr[i];
		uploadFileArr.push(newObj);
	} 
	$('.file-input').hide();
	//$('.fileBox').html('-');
	$(".fileBox").each(function(){
		var obj = $(this);
		var obi = obj.data('index');
		for(let i in uploadFileArr){
			
			if(uploadFileArr[i].fileType == obi){
				console.log(uploadFileArr[i]);
				if(uploadFileArr[i].fileType == '6') {
					if(data.bondType==0){
						$("input[name='bondType']").eq(0).attr("checked", "checked");
					}else{
						$("input[name='bondType']").eq(1).attr("checked", "checked");
					}
					$("input[name='bondType']").attr("disabled", "disabled");
				}else{
					if(data.bondType==0){
						$("input[name='bondType']").eq(0).attr("checked", "checked");
					}else{
						$("input[name='bondType']").eq(1).attr("checked", "checked");
					}
					$("input[name='bondType']").attr("disabled", "disabled");
				}
				if(uploadFileArr[i].fileType == '7') {
					if(data.entrustType==0){
						$("input[name='entrustType']").eq(0).attr("checked", "checked");
					}else{
						$("input[name='entrustType']").eq(1).attr("checked", "checked");
					}
					$("input[name='entrustType']").attr("disabled", "disabled");

				}else {
					if(data.bondType==0){
						$("input[name='entrustType']").eq(0).attr("checked", "checked");
					}else{
						$("input[name='entrustType']").eq(1).attr("checked", "checked");
					}
				   $("input[name='entrustType']").attr("disabled", "disabled");
				}
				var str ='<div><span class="ov">'+uploadFileArr[i].fileName+'</span>';
				var fileExtension = uploadFileArr[i].fileName.substring(uploadFileArr[i].fileName.lastIndexOf('.') + 1);
				if(fileExtension=='pdf' || fileExtension == 'jpg' || fileExtension=='gif' || fileExtension=='bmp' || fileExtension == 'pdf'|| fileExtension == 'png'){
					str+='<button type="button" class="btn btn-primary btn-xs" onclick="previewFile(\''+uploadFileArr[i].filePath+'\')">预览</button>';
				}
				str+='<button class="btn btn-primary btn-xs" onclick="fileDownload(\''+uploadFileArr[i].fileName+ '\',\''+uploadFileArr[i].filePath+'\')">下载</button></div>';
				//$('.fileBox'+uploadFileArr[i].fileType).html(str);
				$(str).appendTo('.fileBox' + uploadFileArr[i].fileType);
				$('.fileBox' + uploadFileArr[i].fileType).find('.file-input').hide();
			}
		}
	});
}
//已上传文件表格
//function fileTable(data){
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
		},
		{
			title: "操作",
			align: "center",
			halign: "center",
			width: "20%",
			formatter: function(value, row, index) {
					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var donw="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='fileDownload(\"" + row.fileName + "\",\"" + row.filePath + "\")'>下载</a>"
					var view = "&nbsp;&nbsp;<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + row.filePath + "\")'>预览</a>";
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
						return donw+view;
					}  
					return donw;			
				}
		},
	]
})
//	$("#uploadedfiles").bootstrapTable("load", data);
//}

function fileDownload(fileName, filePath) {
	var newUrl = loadFile + "?ftpPath=" + encodeURI(filePath) + "&fname=" + encodeURI(fileName);
	window.location.href = $.parserUrlForToken(newUrl);
}

function previewFile(filePath) {
	openPreview(filePath);
}
//获取采购审核记录
function getBiddingApprovalRecord() {

	//	$("#biddingApprovalRecord").bootstrapTable('destroy');
	$("#biddingApprovalRecord").bootstrapTable({
		url: urlGetBiddingApprovalRecord,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: false, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		classes: 'table table-bordered', // Class样式
		queryParams: {
			'businessId': id,
			'workflowType': WORKFLOWTYPE,
		}, // 请求参数，这个关系到后续用到的异步刷新
		silent: true, // 必须设置刷新事件
		striped: true,
		columns: [{
			title: "序号",
			align: "center",
			width: "50px",
			formatter: function(value, row, index) {
				$("#resultAuditMsg").show();
				$("#resultAuditTable").show();
				return index + 1;
			}
		}, {
			title: "姓名",
			align: "left",
			field: "userName"
		}, {
			title: "审核状态",
			align: "left",
			field: "workflowResult",
			formatter: function(value, row, index) {
				if(value == 0) {
					return "审核通过"
				} else if(value == 1) {
					return "审核不通过"
				} else {
					return "撤回"
				}
			}
		}, {
			title: "审核说明",
			align: "left",
			field: "workflowContent"
		}, {
			title: "时间",
			align: "left",
			field: "subDate"
		}]

	})
}
//会签
function getResultAuditsLive() {
	var table = $("#resultAuditList");
	$.ajax({
		type: "post",
		// url: top.config.AuctionHost + '/WorkflowController/findWasteWorkflowLevel.do',
		url: top.config.AuctionHost + '/WorkflowController/findWasteWorkflowLevel.do',
		data: {
			"workflowType": "fjwz_zzwj"
		},
		async: false,
		success: function(res) {
			if(res.success) {
				if(res.data) {
					$("#doCheck").show();
					workflowLevel = res.data.workflowLevel;
					if(workflowLevel > 0) {
						$("#resultAuditResMsg").show();
						$("#resultAuditListTable").show();
					}
					for(var i = 1; i <= workflowLevel; i++) {
						var str = "";
						switch(i) {
							case 1:
								str = "一"
								break;
							case 2:
								str = "二"
								break;
							case 3:
								str = "三"
								break;
							case 4:
								str = "四"
								break;
						}
						var html = "<tr>"
						html += "<td  class = 'th_bg'  style= 'text-align: left;'>" + str + "级审核员" + "</td>";
						html += "<td hidden='true'>"
						html += "<input hidden='true' class='form-control'  id=" + "selectLv" + i +
							"    style='width: 100%;height: 100%;'readonly  /> ";
						html += "</td>"
						html += "<td>"
						html += "<input class='form-control'  id=" + "selectLvName" + i +
							"  onclick = 'selectClick(this.id)'    style='width: 100%;height: 100%;'readonly  /> ";
						html += "</td>"
						html += "</tr>"
						table.append(html)
					}
					getResultAuditsUser();
					//					auditProcess();

				}
			}
		}
	});

}

//添加人员回调函数
function callBackEmployee(ids, names) {
	layer.closeAll();

	$("#" + selectInputId).val(names);

	let id = selectInputId.replace("Name", "");

	$("#" + id).val(ids);

}
//回显采购
function getResultAuditsUser() {
	$.ajax({
		type: "get",
		dataType: 'json',
		url: urlGetResultAuditsUser,
		async: false,
		data: {
			'businessId': id
		},
		success: function(res) {
			if(res.success) {
				let js = res.data;
				for(var i = 0; i < js.length; i++) {
					let j = js[i];
					let workflowLevel = j.workflowLevel;
					let name = j.userName;
					let employeeId = j.employeeId;
					let eid = i + 1;
					$("#selectLvName" + eid).val(name);
					$("#selectLvName" + eid).attr("disabled", "disabled");
					$("#selectLv" + eid).val(employeeId);
					//$("#checkReload").show()
					$("#doCheck").hide()
				}
				if(js.length > 0) {
					$("#selectLvName" + 1).attr("disabled", "disabled");
					$("#selectLvName" + 2).attr("disabled", "disabled");
					$("#selectLvName" + 3).attr("disabled", "disabled");
					$("#selectLvName" + 4).attr("disabled", "disabled");
					if(workflowLevel > 0) {
						isReloadCheck = true;
						$("#checkReload").hide()
					}
				}
				if(js.length > 0) {
					$("#againDetailItemSupplier").hide();
					$(".rebut").hide();
				}

			}

		}
	})
}

function selectClick(e) {
	selectInputId = e;
	layer.open({
		type: 2,
		area: ['800px', '550px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		scrollbar: false, // 父页面 滚动条禁止
		// content: 'Auction/Auction/Purchase/AuctionProjectPackage/model/getResultAuditList.html',
		content: 'getResultAuditList.html',
		title: '选择流程审批人员',
		success: function(layero, index) {
			var body = parent.layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			iframeWin.$("#employeeId").val(employeeId);
			iframeWin.BindWorkflowCheckerInfo();
		}
	});
}

function getMsg(obj) {

	if(type == 'commit') {
		//展示提交按钮
		$("#commitBtn").show();
	}

	status = obj.checkStatus;
	//	getOfferInfo();

	if(status == '已提交审核' || status == '审核通过') {
		// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
		// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
		// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
		$(".modify").hide();
		$('.zzbj').attr('readonly', true);

		$("#commitBtn").hide();
		//$(".employee").hide();
	}

	if(status == '未提交') {
		$("#commitBtn").show();
	}

	if(obj.itemState != undefined) {
		itemState = obj.itemState;
		if(itemState == '1' || itemState == '2' || itemState == '4') {
			//发布公示  审核中  审核通过  无需审核
			// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
			// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
			// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
			$(".modify").hide();
			$('.zzbj').attr('readonly', true);
			$("#commitBtn").hide();
			//$(".employee").hide();
		}

	}

	// if(status == '未提交' || status == '审核不通过' || (status == '无需审核' && (itemState=="" || itemState==3))){
	// 	$('#freeDetailRank').bootstrapTable('hideColumn', 'editReason');
	// 	$('#freePackageRank').bootstrapTable('hideColumn', 'editReason');
	// 	$('#roundRank').bootstrapTable('hideColumn', 'editReason');
	// }

}
$("#doCheck").click(function() {
	if(supervisorCheck) {
		if(workflowLevel == 0) {
			top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
				$.ajax({
					type: "post",
					url: urlLive0Check,
					data: {
						'businessId': id,
					},
					success: function(res) {
						parent.layer.msg(res.message);

						var index = parent.layer.getFrameIndex(window.name);
						top.layer.close(index);
					}
				})
			});
		} else {
			var data = [];
			var js = "";

			for(var i = 1; i <= workflowLevel; i++) {
				let workflowLevel = $("#selectLv" + i).val();
				if(workflowLevel.length == 0) {
					parent.layer.alert("添加审批人员！");
					return false;
				}
				let p = {
					"employIds": $("#selectLv" + i).val(),
					'level': i
				}
				data.push(p);

				// js = JSON.stringify(data)
			}

			$.ajax({
				type: "post",
				dataType: 'json',
				url: urlSaveResultAudits,
				async: false,
				data: {
					'levelList': JSON.stringify({
						'levelMsg': data,
						'workflowType': 'fjwz_zzwj',
						'packageId': id,
						'tenderType': 2
					})
				},
				success: function(res) {

					if(res.success) {
						var index = parent.layer.getFrameIndex(window.name);
						top.layer.close(index);
					} else {
						parent.layer.msg(res.message);
					}

				}
			});
		}

	} else {
		parent.layer.alert("监督人未审核完毕，不能提交采购审核！");
	}

})
//审核撤回
$("#checkReload").click(function() {
	parent.layer.confirm('温馨提示：确定要撤回？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			type: "post",
			dataType: 'json',
			url: urlRealBack,
			async: false,
			data: {
				'businessId': id,
				'workflowType': WORKFLOWTYPE,
				'workflowResult': 2
			},
			success: function(res) {
				if(res.success) {
					parent.layer.msg("撤回成功！");
					location.reload();
				} else {
					parent.layer.msg(res.message);
				}
			}
		})
		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

});

function auditProcess() {
	$.ajax({
		type: "get",
		url: urlAuditProcess,
		async: false,
		data: {
			'businessId': id
		},
		success: function(res) {
			if(res.success) {
				isEndCheck = true
				if(isReloadCheck) {
					$("#checkReload").show();
				}
			} else {
				$("#checkReload").hide();
				$("#doCheck").hide();
				$("#selectLvName" + 1).attr("disabled", "disabled");
				$("#selectLvName" + 2).attr("disabled", "disabled");
				$("#selectLvName" + 3).attr("disabled", "disabled");
				$("#selectLvName" + 4).attr("disabled", "disabled");
				parent.layer.alert("采购审核流程已完成！");
				isEndCheck = false
			}
			// if(workflowLevel == 0) {
			// 	$("#checkReload").hide();
			// 	$.ajax({
			// 		type: "post",
			// 		url: urlLive0Check,
			// 		data: { 'businessId': packageId },

			// 	})

			// }
		}
	});
}
//关闭按钮
$("#btn_close").on("click", function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
	parent.$("#Salecountersign").bootstrapTable("refresh");
})