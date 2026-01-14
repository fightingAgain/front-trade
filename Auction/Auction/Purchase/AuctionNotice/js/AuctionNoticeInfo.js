var projectId;
var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id");
var tType = getUrlParam("tType"); //看是采购人还是供应商
var projectType;
var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头

var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
var listStatusUrl = top.config.AuctionHost + "/AuctionSfcOfferController/vilidateBargainResult.do" //判断议价是否提交
var suppUrl = top.config.AuctionHost + "/AuctionSfcOfferController/vilidateOfferResult.do" //判断是否有供应商
var BargainResultUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSfcOfferesBargainResult.do" //判断是否有供应商
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var findSupplierMxUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getAuctionOfferesPageList.do" //明细供应商
var failAuctionUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSamePriceOrFailAuction.do" //是否会签完成

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "jggs";
var data;
var businessid = '';
var returnData;
var dataRelusts = [];
var dataVal = [];
var dataVals = []
var isStopCheck = '';//项目是否失败

$(function () {
	if (keyId == 'undefined') {
		keyId = "";
	}
	var url = "";
	var para;
	if (type != "RELEASE") {
		// $(".NewsContents").show();
		new UEditorEdit({
			pageType: "view",
			contentKey: 'noticeContent',
		});
		url = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: keyId,
			packageId: packageId,
			tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖
		}
	} else {
		// $(".NewsContent").show();
		new UEditorEdit({
			contentKey: 'noticeContent',
		});
		url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do";
		para = {
			packageId: packageId,
			tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖
		}
		if (keyId != 'undefined' && keyId) {
			para.bidNoticeId = keyId;
			businessid = keyId;
		}
	}
	if (tType == 'supplier') {
		$('.shenhe').hide();
	}


	$.ajax({
		url: url,
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				data = data.data;
				isStopCheck = data.isStopCheck;
				auctionType = data.auctionType
				auctionModel = data.auctionModel
				projectType = data.projectType
				if (auctionType == '6') {//清单竞价
					supplier();
					barginStatus();
					$("#contentNew").hide();
				}
				if (type == "RELEASE") {
					WorkflowUrl() //加载审核人
					projectId = data.projectId;
					//findWorkflowCheckerAndAccp(projectId);
					$("#projectName").html(data.projectName);
					if (data.projectSource > 0) {
						$("#projectName").html(data.projectName + '<span class="red">(重新竞价)</span>');
					}
					$("#projectCode").html(data.projectCode);
					if (data.isPublic > 1) {
						$("input[name='isPublic'][value=" + (data.isOpen || '1') + "]").prop("checked", true);
					} else {
						$("input[name='isPublic'][value=" + (data.isOpen || '0') + "]").prop("checked", true);
					}
					$("#purchaserName").html(data.purchaserName);
					$("#purchaserAddress").html(data.purchaserAddress);
					$("#purchaserLinkmen").html(data.purchaserLinkmen);
					$("#purchaserTel").html(data.purchaserTel);
					$("#bidNoticeStartDate").val(data.openStartDate);
					$("#bidNoticeEndDate").val(data.opetEndDate);
					$("#packageName").html(data.packageName);
					$("#packageNum").html(data.packageNum);
					// wordHtml()
					if (data.noticeContent) {
						ue.ready(function () {
							ue.execCommand('insertHtml', data.noticeContent);
						});
					} else {
						wordHtml();
					}
				} else {
					$(".isWatch").hide();
					$('.employee').hide() //查看不显示审核人
					//findWorkflowCheckerAndAccp(data.id);
					$("#projectName").html(data.projectName);
					if (data.projectSource > 0) {
						$("#projectName").html(data.projectName + '<span class="red">(重新竞价)</span>');
					}
					$("#projectCode").html(data.projectCode);
					if (data.isPublic > 1) {
						$("input[name='isPublic'][value=" + (data.isOpen || '1') + "]").prop("checked", true);
					} else {
						$("input[name='isPublic'][value=" + (data.isOpen || '0') + "]").prop("checked", true);
					}
					$("#purchaserName").html(data.purchaserName);
					$("#purchaserAddress").html(data.purchaserAddress);
					$("#purchaserLinkmen").html(data.purchaserLinkmen);
					$("#purchaserTel").html(data.purchaserTel);
					$("#bidNoticeStartDate").val(data.openStartDate);
					$("#bidNoticeEndDate").val(data.opetEndDate);
					$("#packageName").html(data.packageName);
					$("#packageNum").html(data.packageNum);
					$("#NewsContent").html(data.noticeContent)
				}
				initMediaVal(data.options, {
					disabled: type != "RELEASE",
					stage: 'jggs',
					projectId: data.projectId,
					filterPackageId: packageId,
				});	
				mediaEditor.setValue(data);
			}
		}
	});


	if (keyId != 'undefined' && keyId) {
		//审批记录
		$(".workflowList").show();
		findWorkflowCheckerAndAccp(keyId);
	}

	if (type != "RELEASE") {
		$("input[name='isPublic']").prop("disabled", "disabled");
		$("#bidNoticeStartDate").prop("disabled", "disabled");
		$("#bidNoticeEndDate").prop("disabled", "disabled");
		$("#btn_submit").hide();
	} else {
		if (projectType == 0) { //项目的项目类型。
			var projectTypes = 'A';
		}
		if (projectType == 1) {
			var projectTypes = 'B';
		}
		if (projectType == 2) {
			var projectTypes = 'C';
		}
		if (projectType == 3) {
			var projectTypes = 'C50';
		}
		if (projectType == 4) {
			var projectTypes = 'W';
		}
		modelOption({
			'tempType': 'biddingProcurementResultsPublicity',
			'projectType': projectTypes
		});
		if (data) {
			$("#noticeTemplate").val(data.templateId); //公告模板id
		}
		//生成模板按钮
		$("#btnModel").on('click', function () {
			if ($('#noticeTemplate').val() != "") {
				var templateId = $('#noticeTemplate').val()
			} else {
				parent.layer.alert('温馨提示：请先选择模板');
				return false;
			}
			parent.layer.confirm('温馨提示：是否确认切换模板', {
				btn: ['是', '否'] //可以无限个按钮
			}, function (index, layero) {
				modelHtml({
					'type': 'jggs',
					'projectId': projectId,
					'packageId': packageId,
					'tempId': templateId,
					'tenderType': 1
				})
				parent.layer.close(index);
			}, function (index) {
				parent.layer.close(index)
			});
		})
	}
});
//供应商
function supplier() {
	var url=findSupplierUrl;
	if(auctionModel == 1){
		url = findSupplierMxUrl;
	} 
	$.ajax({
		type: "POST",
		url: url,
		//		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				returnData = response.data

			}
		}
	})
}
//议价状态
function barginStatus() {
	$.ajax({
		type: "POST",
		url: BargainResultUrl,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				var dataRelust = response.data
				dataRelusts = response.data
				if (response.data) {
					for (var d = 0; d < dataRelust.length; d++) {
						if (dataRelust[d].sfcBarginStatus != '3') {
							dataVals.push(dataRelust[d].sfcBarginStatus)
						} else {
							dataVal.push(dataRelust[d].sfcBarginStatus)
						}
					}
				}
			}
		}
	})

}


//判断清单是否议价
//function listStatus() {
//	var flag
//	$.ajax({
//		type: "POST",
//		url: listStatusUrl,
//		async: false,
//		data: {
//			packageId: AuctionNotice.packageId
//		},
//		dataType: 'json',
//		error: function() {
//			top.layer.alert("加载失败!");
//		},
//		success: function(response) {
//			if(response.success) {
//				if(response.data > 0) {
//					flag = true
//				} else {
//					flag = false
//				}
//
//			}
//
//		}
//	})
//	return flag
//}

//清单竞价是否会签成功
function isFail(){
	var flag = false;
	$.ajax({
		url: failAuctionUrl,
		dataType: 'json',
		data: {
			packageId: packageId
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			// 1：会签审核通过，0：有未审核的会签，-1 没有会签
			if(data.data == 1){
				flag = true;
			} else if(data.data == 0){
				top.layer.alert("会签审核中");
				flag = false;
			} else if(data.data == -1){
				flag = true;
			} 
			// else if(data.data == 2){
			// 	top.layer.alert("竞价结果/竞价结果会签未提交");
			// 	flag = false;
			// } 
			else {
				flag = true;
			}
		},
		error: function(){
			parent.layer.alert("温馨提示：请求失败");
		}
	});
	return flag;
}
$("#btn_submit").click(function () {
	if(isStopCheck == 1){
		return top.layer.alert("该项目已失败!");
	}
	if(auctionType == 6 && auctionModel == 1){
		if(!isFail()){
			return;
		}
	}
	if (auctionType == '6') {
		//		var noSupp = suppStatus();
		//		if(auctionModel != '1') {
		if (dataRelusts && dataRelusts.length > 0) {
			for (var j = 0; j < dataRelusts.length; j++) {
				if (dataRelusts[j].sfcBarginStatus == '1') {
					return top.layer.alert("该项目还在议价!");
				}
			}
			if (auctionModel == '2' || auctionModel == '1') {
				if (dataVals.length == '0' && dataVal.length > 0) {
					if (returnData.length > 0) {
						var item1= []; 
						for(var m = 0; m < returnData.length; m++){
							if(returnData[m].sfcBarginStatus == 0){
								continue;
							}
							item1.push(returnData[m]);
						}
						if (dataRelusts.length != item1.length) {
							return top.layer.alert("该项目还在议价!");
						}
					}
				}
			}

		} else {
			if (returnData && returnData.length > 0) {
				return top.layer.alert("该项目还在议价!");
			}

		}

		//		}
	}
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidNoticeStartDate = $("#bidNoticeStartDate").val();
	var bidNoticeEndDate = $("#bidNoticeEndDate").val();
	if (!isPublic) {
		parent.layer.alert("请选择是否公开");
		return;
	}
	if (bidNoticeStartDate == "") {
		parent.layer.alert("请选择公示开始时间");
		return;
	}
	if (bidNoticeEndDate == "") {
		parent.layer.alert("请选择公示截止时间");
		return;
	}

	var d1 = new Date(bidNoticeStartDate.replace(/\-/g, "\/"));
	var d2 = new Date(bidNoticeEndDate.replace(/\-/g, "\/"));
	var d = new Date(nowDate);
	var currentTime = GetTime(d);
	if (GetTime(d1) <= GetTime(d)) {
		parent.layer.alert("开始时间不能早于当前时间");
		return;
	}

	if (GetTime(d2) <= GetTime(d)) {
		parent.layer.alert("结束时间不能早于当前时间");
		return;
	}

	if (d1 >= d2) {
		parent.layer.alert("结束时间不能早于开始时间");
		return;
	}
	// 公开
	if (isPublic == '0' && !isMediaValid()) {
		return;
	}
	if (!mediaEditor.isValidate()) {
		// parent.layer.alert("请填写结果公示或者选择结果公式模板");
		return;
	}
	if (isWorkflow) {
		if ($("#employeeId").val() == "") {
			parent.layer.alert("请选择审核人");
			return;
		}
	}

	var para = {
		'projectId': projectId,
		'packageId': packageId,
		'isOpen': isPublic,
		'openStartDate': bidNoticeStartDate,
		'opetEndDate': bidNoticeEndDate,
		'noticeContent': ue.getContent(),
		'tenderType': 1,
		'templateId': $('#noticeTemplate').val(),
		// 媒体发布
		'optionId': typeIdLists,
		'optionValue': typeCodeLists,
		'optionName': typeNameLists,
	}
	para = $.extend(para, mediaEditor.getValue())
	if (isWorkflow) {
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}

	if (type == "RELEASE") {
		para.id = keyId;
	}

	//提交
	if (isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function (ind) {
			top.layer.close(ind);
			$.ajax({
				url: top.config.AuctionHost + "/BidNoticeController/saveJjBidNotice.do",
				contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
				data: JSON.stringify(para),//解决数据量大时后台接收不到，后台对应用字符串方式接收
				// data: para,
				type: "POST",
				success: function (data) {
					if (data.success) {
						if (top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						parent.$('#AuctionNoticeList').bootstrapTable('refresh');
						//						top.layer.closeAll();
						var index = parent.layer.getFrameIndex(window.name);
						top.layer.close(index);
						top.layer.alert("发布成功");
					} else {
						// top.layer.closeAll();
						// top.layer.close(index);
						top.layer.alert(data.message);
					}
				}
			});
		})
	} else {
		$.ajax({
			url: top.config.AuctionHost + "/BidNoticeController/saveJjBidNotice.do",
			contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
			data: JSON.stringify(para),//解决数据量大时后台接收不到，后台对应用字符串方式接收
			type: "POST",
			success: function (data) {
				if (data.success) {
					if (top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					parent.$('#AuctionNoticeList').bootstrapTable('refresh');
					//					top.layer.closeAll();
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
					top.layer.alert("发布成功");
				} else {
					
					// top.layer.closeAll();
					top.layer.alert(data.message);
				}
			}
		});
	}

});
$('#bidNoticeStartDate').click(function(){
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd HH:mm',
		minDate: nowSysDate,
		maxDate:'#F{$dp.$D(\'bidNoticeEndDate\')}',
		onpicked:function(dp){
			var selectTime = dp.cal.getNewDateStr(); //选中的时间
			$dp.$('bidNoticeEndDate').click();
		}
	});
});
$('#bidNoticeEndDate').click(function(){
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	var noticeMin='';
	if($('#bidNoticeStartDate').val()!=""){
			noticeMin=$('#bidNoticeStartDate').val();
	}else{
		noticeMin=nowSysDate;
	}
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd HH:mm',
		minDate: noticeMin,
		onpicked:function(dp){
			var selectTime = dp.cal.getNewDateStr(); //选中的时间
		}
	});
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function () {
	//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
});

function WorkflowUrl() {
	var reData = {
		"workflowLevel": 0,
		"workflowType": "jggs"
	}
	if (businessid != '') {
		reData.id = businessid;
	}
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function (data) {
			var option = ""
			//判断是否有审核人		   	  
			if (data.message == 0) {
				isCheck = true;
				//$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if (data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").hide();
				$('.employee').hide();
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
}

function GetTime(time) {
	var date = new Date(time).getTime();
	return date;
};

function wordHtml() {
	if (auctionType == '6') {
		$.ajax({
			url: parent.config.AuctionHost + '/AuctionSfcOfferController/getSfcOfferesBidNotice',
			type: 'post',
			dataType: 'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"packageId": packageId,
			},
			success: function (result) {
				if (result.success) {
					ue.ready(function () {

						ue.execCommand('insertHtml', result.data);
					});

				}
			}
		});

	} else if (auctionType == '7') {
		$.ajax({
			url: parent.config.AuctionHost + '/AuctionSfcSingleOfferesController/getNoticeContent.do',
			type: 'post',
			dataType: 'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"packageId": packageId,
			},
			success: function (result) {
				if (result.success) {
					ue.ready(function () {
						ue.execCommand('insertHtml', result.data);
					});

				}
			}
		});
	} else {

		var obj = {
			"packageId": packageId,
			"projectId": projectId,
			'type': 'jggs',
			'tenderType': 1
		}

		$.ajax({
			url: parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
			type: 'post',
			dataType: 'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: obj,
			success: function (result) {
				if (result.success) {
					ue.ready(function () {

						ue.execCommand('insertHtml', result.data);
					});

				}
			}
		});
	}
}

// function wordHtml(){
// 	$.ajax({
// 		   	url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
// 		   	type:'post',
// 		   	dataType:'json',
// 		   	async:false,
// 		   	//contentType:'application/json;charset=UTF-8',
// 		   	data:{
// 		   		"packageId":AuctionNotice.packageId,
// 		   		"projectId":projectId,
// 		   		'type':'jggs',
// 		   		'tenderType':1
// 		   	},
// 		   	success:function(result){	 
// 		   		if(result.success){	
// 		   			ue.ready(function() {
// 						//ue.setContent(result.data, true);		
// 						ue.execCommand('insertHtml', result.data);
// 					}); 	
// 		   			//editor.txt.html(result.data)
// 		   		}
// 		   	}  
// 		});
// }