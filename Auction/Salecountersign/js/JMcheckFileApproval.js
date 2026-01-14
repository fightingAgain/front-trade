//上传可递交竞卖问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var loadFile = top.config.FileHost + "/FileController/download.do"; //文件下载
var findurl = top.config.AuctionHost + "/AuctionWasteFileController/findAuctionFileBasic.do"; //审核信息
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
var projectId=getUrlParam('projectId');
var packageId = getUrlParam("packageId");
var checkState=getUrlParam('checkState');
var accepType='fjwz_jmwj';

var edittype = 'audit'; //查看还是审核detailed查看  audit审核

var supervisorCheck = true; //监督人是否审核完毕
var dataInfo;
var WORKFLOWTYPE = accepType; //
//查询采购审核
var workflowLevel = 0;
var urlWorkFlow = top.config.AuctionHost + "/WorkflowController/updateWorkflowAccep.do";

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
			url: urlWorkFlow,
			data: {
				'businessId': id,
				'workflowResult': check,
				'workflowType':accepType,
				'workflowContent': $("#content").val()
			},
			success: function(res) {
				console.log(res);
				if(res.success) {
					parent.$('#ProjectAuditTable').bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					top.layer.alert("审核保存成功");
					parent.$("#ProjectAuditTable").bootstrapTable("refresh");
					
				} else {
					top.layer.alert("审核保存失败")
					//top.layer.alert(res.message);
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
    //查询审核等级和审核人
    findWorkflowCheckerAndAccp(id);
    
	viewfindurl(supplierId);
	if(checkState==0){
		$("#btnsubmit").show();
	}else{
		
		$("#btnsubmit").hide();
	}
	initFileView();
	// getResultAuditsLive();
	getBiddingApprovalRecord();
});

function viewfindurl(supplierId) {
	$.ajax({
		type: "post",
		url: findurl,
		data: {
			"enterpriseId": supplierId,
			"projectId": projectId
		},
		async: false,
		success: function(data) {
			if(data.success) {
				dataInfo = data.data;
				var messdata = dataInfo
				$("#legaid").val(messdata.id);
				$("#legalName").html(messdata.legalName);
				$("#legalRepresent").html(messdata.legalRepresent);
				$("#legalContact").html(messdata.legalContact);
				$("#legalContactPhone").html(messdata.legalContactPhone);
				$("#legalContactAddress").html(messdata.legalContactAddress);
				$("#basicAccountNo").html(messdata.basicAccountNo);
				$("#divclient").html(messdata.client);
				$("#divclientsId").html(messdata.clientsId);
//				var fildata = data.data.auctionVehicleList
//				initdata(fildata);
                
			}
		}
	})
}
//填充竞卖文件信息表格信息
function initFileView(data) {
	var dataParam = {
		"projectId": projectId,
		'enterpriseId':supplierId
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
	$('.fileBox').html('-');
	$(".fileBox").each(function(){
		var obj = $(this);
		var obi = obj.data('index');
		for(let i in uploadFileArr){
			
			if(uploadFileArr[i].fileType == obi){
				console.log(uploadFileArr[i]);
				var str ='<div><span class="ov">'+uploadFileArr[i].fileName+'</span>';
				var fileExtension = uploadFileArr[i].fileName.substring(uploadFileArr[i].fileName.lastIndexOf('.') + 1);
				if(fileExtension=='pdf' || fileExtension == 'jpg' || fileExtension=='gif' || fileExtension=='bmp' || fileExtension == 'pdf'|| fileExtension == 'png'){
					str+='<button type="button" class="btn btn-primary btn-xs" onclick="previewFile(\''+uploadFileArr[i].filePath+'\')">预览</button>';
				}
				str+='<button class="btn btn-primary btn-xs" onclick="openAccessory(\''+uploadFileArr[i].fileName+ '\',\''+uploadFileArr[i].filePath+'\')">下载</button></div>';
				$('.fileBox'+uploadFileArr[i].fileType).html(str);
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

function fileDownload(fileName,filePath){
	var newUrl = loadFile + "?ftpPath=" + encodeURI(filePath) + "&fname=" + encodeURI(fileName);
	window.location.href = $.parserUrlForToken(newUrl);
}
function previewFile(filePath){
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
			'accepType':WORKFLOWTYPE,
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
				if (value == 0) {
					return "审核通过"
				} else if (value == 1) {
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

function getMsg(obj) {

	if (type == 'commit') {
		//展示提交按钮
		$("#commitBtn").show();
	}

	status = obj.checkStatus;
	//	getOfferInfo();

	if (status == '已提交审核' || status == '审核通过') {
		// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
		// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
		// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
		$(".modify").hide();
		$('.zzbj').attr('readonly', true);

		$("#commitBtn").hide();
		//$(".employee").hide();
	}

	if (status == '未提交') {
		$("#commitBtn").show();
	}

	if (obj.itemState != undefined) {
		itemState = obj.itemState;
		if (itemState == '1' || itemState == '2' || itemState == '4') {
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

//关闭按钮
$("#btn_close").on("click", function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
	
});