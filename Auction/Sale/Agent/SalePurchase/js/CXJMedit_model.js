var purchaseaData = "";
var publicData = []; //邀请供应商的数组
var sourceFundsId = ""; //资金来源Id
var PurchaserData = ""; //企业信息参数
var massage2 = ""; //判断审核人接口返回值为2时的验证
var filesData=[];//附件上传的数组
var typeIdList = ""; //项目类型的ID
var typeNameList = ""; //项目类型的名字
var typeCodeList = ""; //项目类型编号
var mediasIdList = ""; //媒体ID
var mediasNameList = ""; //媒体名字
var mediasCodeList = ""; //媒体编号
var itemMediasId = [] //媒体ID
var itemMediasName = [] //媒体名字
var itemMediasCode = [] //媒体编号
var tabeldata = [] //物资明细数据
var fjwzState="";
var updateAuctionPurchase = config.AuctionHost + '/AuctionPurchaseController/saveNewAuctionPurchase.do'; //提交接口
var findPurchaseURL = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //获取项目信息的接口
var deleteFileUrl= config.AuctionHost + '/PurFileController/delete.do';//删除已上传文件信息
var sourceFundsUrl = config.Syshost + "/OptionsController/list.do"; //资金来源接口
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var pricedeleteAll = config.AuctionHost + '/ProjectPriceController/deleteProjectPriceByPackage.do' //费用删除
var sendUrl = config.Syshost + "/OptionsController/list.do"; //获取媒体的数据
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var pricesave = config.AuctionHost + '/ProjectPriceController/saveProjectPrice.do' //费用添加
var priceupdate = config.AuctionHost + '/ProjectPriceController/updateProjectPrice.do' //费用修改
var pricedelete = config.AuctionHost + '/ProjectPriceController/deleteProjectPrice.do' //费用删除
var packagePrice = []; //费用信息
var findInitMoney = config.AuctionHost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = config.AuctionHost + "/DepositController/findAccountDetailForAuction.do"; //查询保证金账号
var opurl = config.Syshost + "/OptionsController/list.do";
var isCheck;
var projectSupplierList = "" //当是ie9浏览器的时候邀请供应商的数据
var projectIds = getUrlParam('projectId'),
	projectSource;
var optiondata = []; //媒体数组
var isDf = false; //是否是东风工程或是东风咨询企业
var WORKFLOWTYPE = 'xmgg';
//文件上传参数
var files = {
	name: "",
	size: "",
	url: ""
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$("#browserUrl").attr('href', siteInfo.portalSite);
$("#browserUrl").html(siteInfo.portalSite);
$("#webTitle").html(siteInfo.sysTitle)
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');

//初始化
//提交审核
$("#btn_submit").click(function() {
	$("#content").val(ue.getContent())
	if(timeCheck($("#form"))) {
		text();
	}
})

medias();
//提交审核
function form() {
	$('input[name="project.projectState"]').val(1); //提交审核的状态，1为提交审核

	acutionData();
	//提交审核
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(indexs, layero) {
			// 时间处理
			var vmForm = $("#form");
			['noticeEndDate', 'endDate'].forEach(function(key) {
				var value = vmForm.find('#' + key).val();
				if (value && value.length == 16) {
					vmForm.find('#' + key).val(value + ':59')
				}
			})
			$.ajax({
				url: updateAuctionPurchase,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: vmForm.serialize() + projectPrices+'&fjwzState='+'fjwz_wl',
				success: function(data) {
					if(data.success) {
						//						parent.layer.closeAll();
						if(top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						parent.layer.close(indexs)
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);

						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						parent.layer.alert("提交成功")
					} else {
						parent.layer.alert(data.message)
					}

				},
				error: function(data) {
					parent.layer.alert("提交失败")
				}
			});
		}, function(indexs) {
			parent.layer.close(indexs)
		})
	} else {
		// 时间处理
		var vmForm = $("#form");
		['noticeEndDate', 'endDate'].forEach(function(key) {
			var value = vmForm.find('#' + key).val();
			if (value && value.length == 16) {
				vmForm.find('#' + key).val(value + ':59')
			}
		})
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: vmForm.serialize() + projectPrices+'&fjwzState='+'fjwz_wl',
			success: function(data) {
				if(data.success) {
					//					parent.layer.closeAll();
					if(top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
					parent.layer.alert("提交审核成功")
				} else {
					parent.layer.alert(data.message)
				}
			},
			error: function(data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}
}
//临时保存
$("#btn_bao").click(function() {
	$("#content").val(ue.getContent())
	forms();
})
//退出
$("#btn_close").click(function() {
	//	parent.layer.closeAll()
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})
//临时保存
function forms() {
	$('input[name="project.projectState"]').val(0); //提交审核的状态，0为临时保存		
	acutionData();
	// 时间处理
	var vmForm = $("#form");
	['noticeEndDate', 'endDate'].forEach(function(key) {
		var value = vmForm.find('#' + key).val();
		if (value && value.length == 16) {
			vmForm.find('#' + key).val(value + ':59')
		}
	})
	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: vmForm.serialize() + projectPrices+'&fjwzState='+'fjwz_wl',
		success: function(data) {
			if(data.success) {
				['noticeEndDate', 'endDate'].forEach(function(key) {
					var value = vmForm.find('#' + key).val();
					if (value && value.length > 16) {
						vmForm.find('#' + key).val(value.slice(0,16))
					}
				})
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
				parent.layer.alert("保存成功")
			} else {
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});
}
$(function() {
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	Purchase();
	setTimeout(function() {
		var iframeid = $('#editor iframe').attr('id');
		var viewClass = $("#" + iframeid).contents().find("body.view").addClass('viewWitdh');
	}, 1000)
})
var projectMsg = {};
//项目的数据
function Purchase() {
	$.ajax({
		url: findPurchaseURL,
		type: 'get',
		async: false,
		data: {
			'projectId': projectIds
		},
		success: function(data) {
			purchaseaData = data.data;
			projectSource = purchaseaData.project[0].projectSource;
			tabeldata = purchaseaData.materialDetails
			initDataTab(tabeldata);
				   		if(purchaseaData.purFile.length>0){
				   			filesData=purchaseaData.purFile;
				   			
				   		}
				   		filesDataView()
		},
		error: function(data) {

		}
	});
	if(purchaseaData.project[0].projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	};
	$('div[id]').each(function() {
		$(this).html(purchaseaData[this.id]);
	});
	//渲染项目的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData.project[0][this.id]);
	});
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '武汉市');
	if(purchaseaData.project[0].projectType == 0) {
		$("#projectType").html("工程");
		var projectType = 'A'
	}
	if(purchaseaData.project[0].projectType == 1) {
		$("#projectType").html("设备");
		var projectType = 'B'
	}
	if(purchaseaData.project[0].projectType == 2) {
		$("#projectType").html("服务");
		var projectType = 'C'
	}
	if(purchaseaData.project[0].projectType == 3) {
		$("#projectType").html("广宣");
		var projectType = 'C50'
	};
	if(purchaseaData.project[0].projectType == 4) {
		$("#projectType").html("废旧物资");
		var projectType = 'W'
	};
	modelOption({
		'tempType': 'auctionNotice',
		'projectType': projectType
	});
	$("#noticeTemplate").attr('name', 'templateId');
	$("#noticeTemplate").val(purchaseaData.templateId); //公告模板id	
	//生成模板按钮
	$("#btnModel").on('click', function() {
		if($('#noticeTemplate').val() != "") {
			var templateId = $('#noticeTemplate').val()
		} else {
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		if(ue.getContent() != "") {
			parent.layer.confirm('温馨提示：是否确认切换模板', {
				btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero) {
				changHtml(templateId)
				parent.layer.close(index);
			}, function(index) {
				parent.layer.close(index)
			});
		} else {
			changHtml(templateId)
		}
	});
	if(purchaseaData.isPublic > 1) {
		$("input[name='isPublics'][value='1']").attr("checked", true);
		$('.isPublics1').show();
		$('.isPublics0').hide();
		$(".yao_btn").show();
		$("#CODENAME").val(purchaseaData.supplierClassifyName);
		$("#supplierClassifyCode").val(purchaseaData.supplierClassifyCode);
		classificaCode = purchaseaData.supplierClassifyCode;
		Publics();
		if(purchaseaData.isPublic == 3) {
			$('.isPublics3').show();
		}
	} else {
		$("input[name='isPublics'][value='0']").attr("checked", true);
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
		$('.isPublics0').show();
		$('.isPublics1').hide();
		$(".yao_btn").hide();
	}
	$("input[name='isPublic'][value='" + purchaseaData.isPublic + "']").attr("checked", true);
	$("input[name='isFile'][value='" + (purchaseaData.isFile || 0) + "']").attr("checked", true);
	$("input[name='settingNotice'][value='" + (purchaseaData.settingNotice || 0) + "']").attr("checked", true);
	$('#noticeStartDate').val(purchaseaData.noticeStartDate != undefined ? purchaseaData.noticeStartDate.substring(0, 16) : ''); //公告开始时间
	$("#StartDate").html(purchaseaData.noticeStartDate != undefined ? purchaseaData.noticeStartDate.substring(0, 16) : '');
	$('#noticeEndDate').val(purchaseaData.noticeEndDate != undefined ? purchaseaData.noticeEndDate.substring(0, 16) : ''); //公告截止时间
	$("#endDate").html(purchaseaData.noticeEndDate != undefined ? purchaseaData.noticeEndDate.substring(0, 16) : '')
	$('#askEndDate').val(purchaseaData.askEndDate != undefined ? purchaseaData.askEndDate.substring(0, 16) : ''); //提出澄清截止时间
	$('#answersEndDate').val(purchaseaData.answersEndDate != undefined ? purchaseaData.answersEndDate.substring(0, 16) : ''); //答复截止时间
	$('#auctionStartDate').val(purchaseaData.auctionStartDate != undefined ? purchaseaData.auctionStartDate.substring(0, 16) : ''); //竞卖开始时间	
	$('#auctionDateEnd').val(purchaseaData.auctionDateEnd != undefined ? purchaseaData.auctionDateEnd.substring(0, 16) : ''); //竞卖结束时间	
	$('#projectId').val(purchaseaData.projectId); //项目Id
	$("#purchaseId").val(purchaseaData.id); //公告ID
	$("#isPublics").val(purchaseaData.isPublic)
	$("#content").val(purchaseaData.content) //备注
	$("#agencyDepartmentId").val(purchaseaData.agencyDepartmentId);
	$("#agencyDepartment").val(purchaseaData.agencyDepartmentName);
	$("#purchaserDepartmentId").val(purchaseaData.purchaserDepartmentId);
	$("#purchaserDepartment").val(purchaseaData.purchaserDepartmentName);
	ue.ready(function() {
		//ue.setContent(result.data, true);		
		ue.execCommand('insertHtml', purchaseaData.content);
	});
	$("input[name='isFile']").eq(purchaseaData.isFile).attr("checked", true) //是否竞卖文件递交。0为是，1为否
	//为1时显示
	if(purchaseaData.isFile == 0) {
		$("#isFileN").show();
		$('#fileEndDate').val(purchaseaData.fileEndDate != undefined ? purchaseaData.fileEndDate.substring(0, 16) : ''); //竞卖文件递交截止时间
		$('#fileCheckEndDate').val(purchaseaData.fileCheckEndDate != undefined ? purchaseaData.fileCheckEndDate.substring(0, 16) : ''); //竞卖文件审核截止时间
	} else {
		$("#isFileN").hide();
		$('#fileEndDate').val(""); //竞卖文件递交截止时间
		$('#fileCheckEndDate').val(""); //竞卖文件审核截止时间
		$("#fileEndDate").removeAttr("data-datename");
		$("#fileCheckEndDate").removeAttr("data-datename");
	}
	if(purchaseaData.autionProjectPackage.length > 0) {
		$("#budgetPrice").val(purchaseaData.autionProjectPackage[0].budgetPrice); //预算价
		$("input[name='project.auctionProjectPackages[0].materialRelationship'][value='" + (purchaseaData.autionProjectPackage[0].materialRelationship || 0) + "']").attr("checked", true);//是否进行物料关系
		$("input[name='project.auctionProjectPackages[0].isPayDeposit'][value='" + purchaseaData.autionProjectPackage[0].isPayDeposit + "']").attr("checked", true);
		$("input[name='project.auctionProjectPackages[0].isSellFile'][value='" + purchaseaData.autionProjectPackage[0].isSellFile + "']").attr("checked", true);
		$("input[name='project.auctionProjectPackages[0].taxIncluded'][value='" + purchaseaData.autionProjectPackage[0].taxIncluded + "']").attr("checked", true);
		$("#taxPoint").val(purchaseaData.autionProjectPackage[0].taxPoint);
		//当单轮竞卖是竞卖时常为
//		if(purchaseaData.autionProjectPackage[0].auctionType == 1) {
            $(".auctionTypeP").html("单轮竞卖是指竞卖项目设置竞卖开始时间、竞卖时长等竞卖要素，符合要求的供应商在竞卖开始时之后进行报价操作；供应商仅可报价一次；报价截止后，按照“满足竞卖项目要求且有效报价最高”的原则确定成交供应商（如果出现供应商报价均为最高，则先报价者优先）；若无供应商参与报价，竞卖失败")
			if(purchaseaData.autionProjectPackage[0].auctionDuration != 10 && purchaseaData.autionProjectPackage[0].auctionDuration != 15 && purchaseaData.autionProjectPackage[0].auctionDuration != 30 && purchaseaData.autionProjectPackage[0].auctionDuration != 60) {
				$('input[name="auctionDurations"][value="0"]').attr("checked", true);
				$("#auctionDurations").show();
				$("#auctionDurations").val(purchaseaData.autionProjectPackage[0].auctionDuration)
			} else {
				$('input[name="auctionDurations"][value="' + purchaseaData.autionProjectPackage[0].auctionDuration + '"]').attr("checked", true);
				$("#auctionDurations").hide();
			}
			$("input[name='auctionModels'][value='" + purchaseaData.autionProjectPackage[0].auctionModel + "']").attr("checked", true); //竞卖类型	
//		}
		$("#dataTypeName").val(purchaseaData.autionProjectPackage[0].dataTypeName);
		$('#dataTypeId').val(purchaseaData.autionProjectPackage[0].dataTypeId);
		$('#dataTypeCode').val(purchaseaData.autionProjectPackage[0].dataTypeCode);		
		
		$("#content").val(purchaseaData.autionProjectPackage[0].content)
		if(purchaseaData.autionProjectPackage[0].isShowPrice == 0) {
			$("input[name='isOffer']").attr('checked', true);

		}
		$("#isShowPrice").val(purchaseaData.autionProjectPackage[0].isShowPrice);
		if(purchaseaData.autionProjectPackage[0].isShowName == 0) {
			$("input[name='isName']").attr('checked', true)
		};
		$("#isShowName").val(purchaseaData.autionProjectPackage[0].isShowName);
		if(purchaseaData.autionProjectPackage[0].isShowNum == 0) {
			$("input[name='isCode']").attr('checked', true)
		};
		$("#isShowNum").val(purchaseaData.autionProjectPackage[0].isShowNum);
	} 
	if(purchaseaData.options.length > 0) {
		for(var i = 0; i < purchaseaData.options.length; i++) {
			itemTypeName.push(purchaseaData.options[i].optionText);
			itemTypeId.push(purchaseaData.options[i].id);
			itemTypeCode.push(purchaseaData.options[i].optionValue)
		}
		typeNameList = itemTypeName.join(',');
		typeIdList = itemTypeId.join(',');
		typeCodeList = itemTypeCode.join(',');
	} else {
		for(var i = 0; i < optiondata.length; i++) {
			if(optiondata[i].id == "186954d7656946d687e5ed42f26f5c88") {
				itemTypeName.push(optiondata[i].optionText);
				typeNameList = optiondata[i].optionText;
				typeIdList = optiondata[i].id;
				typeCodeList = optiondata[i].optionValue;
			}
		}
	}
	$("#optionName").selectpicker("val", itemTypeName).trigger("change");
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);
	if(purchaseaData.autionProjectPackage.length > 0) {
		if(purchaseaData.autionProjectPackage[0].dataTypeId != "" && purchaseaData.autionProjectPackage[0].dataTypeId != undefined && purchaseaData.autionProjectPackage[0].dataTypeId != null) {
			typeIdList = purchaseaData.autionProjectPackage[0].dataTypeId;

		}
	}
	sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
	sourceFunds();
	//当前登录人的信息

	time();
	packagePriceData(); //其它费用信息;
};
// //切换模板
function changHtml(templateId) {
	$('input[name="project.projectState"]').val(0); //提交审核的状态，0为临时保存		
	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function(data) {
			if(data.success == true) {
				modelHtml({
					'type': 'xmgg',
					'projectId': purchaseaData.project[0].id,
					'tempId': templateId,
					'tenderType': 2
				})
			} else {
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});
};
// 选择部门
$(".Department").on("click", function() {
	var name = $(this).data('title');
	if(name == 'agency') {
		var uid = top.enterpriseId
		var mnuid = purchaseaData.agencyDepartmentId;
	} else {
		var uid = purchaseaData.purchaserId;
		var mnuid = purchaseaData.purchaserDepartmentId
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.employee(uid, name, callEmployeeBack, mnuid)
		},

	})
})

function callEmployeeBack(aRopName, dataTypeList) {
	var itemTypeId = []; //项目类型的ID
	var itemTypeName = []; //项目类型的名字			
	for(var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList = itemTypeId.join(","); //项目类型的ID
	typeNameList = itemTypeName.join(","); //项目类型的名字
	if(aRopName == 'agency') {
		$("#agencyDepartmentId").val(typeIdList);
		$("#agencyDepartment").val(typeNameList);
	} else {
		$("#purchaserDepartmentId").val(typeIdList);
		$("#purchaserDepartment").val(typeNameList);
	}
}
//资金来源数据获取
function sourceFunds() {

	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmgg"
	}

	if(projectIds != '') {
		reData.id = projectIds;
		$('.record').show();
		findWorkflowCheckerAndAccp(projectIds);
	}

	//获取审核人列表
	$.ajax({
		url: WorkflowUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) {
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide();
				isCheck = true;
				return;
			};
			if(data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				massage2 = data.message;
				return;
			};
			var checkerId = '';
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data) {
					if(data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if(data.data.workflowCheckers.length > 0) {

						if(data.data.employee) {
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for(var i = 0; i < checkerList.length; i++) {

							if(checkerId != '' && checkerList[i].employeeId == checkerId) {
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
$('input[name="isFile"]').on('click', function() {
	if($(this).val() == 0) {
		$("#fileEndDate").attr("data-datename", '竞卖文件递交截止时间');
		$("#fileCheckEndDate").attr("data-datename", '竞卖文件审核截止时间');
		$("#fileEndDate").attr("type", 'text');
		$("#fileCheckEndDate").attr("type", 'text');
		$("#isFileN").show();
	} else {
		$("#fileEndDate").removeAttr("data-datename");
		$("#fileCheckEndDate").removeAttr("data-datename");
		$("#fileEndDate").attr("type", 'hidden');
		$("#fileCheckEndDate").attr("type", 'hidden');
		$("#isFileN").hide();
		$("#fileEndDate").val("");
		$("#fileCheckEndDate").val("");
	}

});

//是否缴纳保证金
$('input[name="project.auctionProjectPackages[0].isPayDeposit"]').on('click', function() {
	if($(this).val() == 1) {
		$("#depositPrice").attr('disabled', true);
		$("#depositPrice").val("");
	} else {
		$("#depositPrice").attr('disabled', false);
	};
});


//项目类型  
var itemTypeId = [] //项目类型的ID
var itemTypeName = [] //项目类型的名字
var itemTypeCode = [] //项目类型编号
function dataTypes() {
	if(purchaseaData.project[0].projectType == 0) {
		var code = "A"
	} else if(purchaseaData.project[0].projectType == 1) {
		var code = "B"
	} else if(purchaseaData.project[0].projectType == 2) {
		var code = "C"
	} else if(purchaseaData.project[0].projectType == 3) {
		var code = "C50"
	} else if(purchaseaData.project[0].projectType == 4) {
		var code = "W"
	}
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code=' + code,
		btn: ['确定', '取消'],
		scrolling: 'no',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		},
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit() //触发事件得到选中的项目类型的值
			//iframeWin.dataTypeList为所选项目类型返回的数组
			if(dataTypeList.length > 1 || dataTypeList.length == 0) {
				parent.layer.alert("请选择一条项目类型")
				return
			}
			itemTypeId = [] //项目类型的ID
			itemTypeName = [] //项目类型的名字
			itemTypeCode = [] //项目类型编号

			for(var i = 0; i < dataTypeList.length; i++) {
				itemTypeId.push(dataTypeList[i].id)
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList = itemTypeId.join(",") //项目类型的ID
			typeNameList = itemTypeName.join(",") //项目类型的名字
			typeCodeList = itemTypeCode.join(",") //项目类型编号	
			sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList)
			if(typeCodeList.substring(0, 1) == "A") {
				$("#engineering").val(0);
				$('.engineering').show();
			}
			if(typeCodeList.substring(0, 1) == "B") {
				$("#engineering").val(1);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0, 1) == "C") {
				$("#engineering").val(2);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0, 3) == "C50") {
				$("#engineering").val(3);
				$('.engineering').hide();
			};
			parent.layer.close(index)
		}

	});
};
//添加媒体
var itemTypeId = [] //媒体ID
var itemTypeName = [] //媒体名字
var itemTypeCode = [] //媒体编号
function medias() {
	$.ajax({
		url: sendUrl,
		type: "post",
		async: false,
		dataType: "json",
		data: {
			"optionName": "PUBLISH_MEDIA_NAME"
		},
		success: function(result) {
			var op = "";
			if(result.success) {
				optiondata = result.data;
				for(var i = 0; i < result.data.length; i++) {
					op += '<option class="' + result.data[i].optionValue + '" value="' + result.data[i].optionText + '" data-tokens="' + result.data[i].id + '">' + result.data[i].optionText + '</option>'
				}
				$("#optionName").html(op)
			}
		}
	})

}
$('#reduceNum').on('click', function() {
	var obj = $("input[name='project.auctionProjectPackages[0].timeLimit']");
	if(obj.val() <= 1) {
		obj.val(1);
	} else {
		obj.val(parseInt(obj.val()) - 1);
	}
	obj.change();
})
$('#addNum').on('click', function() {
	var obj = $("input[name='project.auctionProjectPackages[0].timeLimit']");
	obj.val(parseInt(obj.val()) + 1);
	obj.change();
});
//取出选择的任务执行人的方法
function getOptoions() {
	var optionId = [],
		optionValue = [],
		optionName = [];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	for(var i = 0; i < $("li.selected").length; i++) {
		optionValue.push($("li.selected").eq(i).find("a").attr("class"));
		optionId.push($("li.selected").eq(i).find("a").attr("data-tokens"));
		optionName.push($("li.selected").eq(i).find(".text").text());

	}
	typeIdList = optionId.join(",") //媒体ID
	typeNameList = optionName.join(",") //媒体名字
	typeCodeList = optionValue.join(",") //媒体编号	
	//赋值给隐藏的Input域	
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);

}

function acutionData() {
	$('#packageName').val($("#projectName").val());
	$('#packageNum').val($("#projectCode").val());

	var AuctionTime = "";
	//当为自由竞卖和单轮竞卖时，判断竞卖类型和竞卖时常
	 if($('input[name="auctionType"]:checked').val() == 1) {
		$('input[name="project.auctionProjectPackages[0].auctionModel"]').val($('input[name="auctionModels"]:checked').val())
		$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val($("input[name='auctionDurations']:checked").val())
		
	} else {
		$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val("")
	};
}

function text() {
	if($("#budgetPrice").val() == "") {
		parent.layer.alert("预算价不能为空");
		return;
	};

	if($("#rawPrice").val() == "") {
		parent.layer.alert("竞卖起始价不能为空");
		return;
	};
	if($("#priceReduction").val() == "") {
		parent.layer.alert("涨价幅度不能为空");
		return;
	}
	if($("#dataTypeName").val() == "") {
		parent.layer.alert("项目类型不能为空");
		return;
	};
	if($('input[name="project.auctionProjectPackages[0].isPayDeposit"]:checked').val() == 0) {
		if($("#payMethod").val() != 0) {
			if(!$("input[name='project.auctionProjectPackages[0].projectPrices[1].agentType']:checked").val()) {
				parent.layer.alert("请选择保证金收取机构");
				return;
			}
			if($("#bankAccount").val() == "") {
				parent.layer.alert("请输入保证金账户名");
				return;
			}

			if($("#bankName").val() == "") {
				parent.layer.alert("请输入保证金开户银行");
				return;
			}
			if($("#bankNumber").val() == "") {
				parent.layer.alert("请输入保证金账号");
				return;
			}
		}
		if($("#price1").val() == "") {
			parent.layer.alert("请输入保证金金额");
			return;
		}
		checkBank();
	};
	if($('input[name="project.auctionProjectPackages[0].isSellFile"]:checked').val() == 0) {
		if($("#price2").val() == "") {
			parent.layer.alert("请输入竞卖采购文件费");
			return;
		}
		if(filesData.length == 0) {
			parent.layer.alert("请上传竞卖采购文件");
			return false;
		}
	};
	if(massage2 == 2) {
		parent.layer.alert("找不到该级别的审批人,请联系管理员");
		return
	};
	if($("#content").val() == "") {
		parent.layer.alert("请填写竞卖公告信息");
		return
	};
	if($("#employeeId").val() == "") {
		parent.layer.alert("请选择审核人");
		return
	};
	form();
}

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}
//表格初始化
function initDataTab(tabeldata) {
	$("#materialList").bootstrapTable({
		pagination: false,
		showLoading: false, //隐藏数据加载中提示状态
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter: function(value, row, index) {
				var pageSize = $('#materialList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#materialList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'productCode',
			title: '物料编码',
			align: 'left',
		}, {
			field: 'detailedName',
			title: '物料名称',
			align: 'left',
		},{
			field: 'detailedVersion',
			title: '规格型号',
			align: 'center',
			width: '120',
		}, {
			field: 'priceType',
			title: '底价顶价标识',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.priceType==0){
					return '<div>底价</div>'
				}else if(row.priceType==1){
					return '<div>顶价</div>'
				}
			}
		},{
			field: 'salesPrice',
			title: '竞卖起始价',
			align: 'center',
			width: '120',
		},{
			field: 'servicePrice',
			title: '服务费',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
					return '<input type="text" class="form-control priceNumber" onblur=funonblur(\"' + index + '\") id="servicePrice_' + index + '" name="" value="' + (value || "") + '"/>';
			}
		}, {
			field: 'storageLocation',
			title: '存放地点',
			align: 'center',
			width: '120',
		}]
	});
	$("#materialList").bootstrapTable("load", tabeldata);
	//金额验证；
	$(".priceNumber").on('change', function() {
		if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			parent.layer.alert("金额必须大于零且最多两位小数");
			$(this).val("");
			return
		};
	});
}
function funonblur(index){
	var rowData = $('#materialList').bootstrapTable('getData');
	var id = rowData[index].id;
	$.ajax({
		url: config.AuctionHost + '/AuctionPurchaseController/saveMaterialDetails.do',
		type: 'post',
		async: false,
		data: {
			id: id,
			servicePrice: $("#servicePrice_" + index).val()
		},
		success: function(data) {
			if(data.success == true) {
			} 
		}
	});
}
function viewbao($index) {
	var rowData = $('#materialList').bootstrapTable('getData');
    var id=rowData[$index].id;
	$.ajax({
		url: config.AuctionHost + '/AuctionPurchaseController/saveMaterialDetails.do',
		type: 'post',
		async: false,
		data: {
			id: id,
			servicePrice: $("#servicePrice_" + index).val()
		},
		success: function(data) {
			if(data.success == true) {
				parent.layer.alert("保存成功");

			} else {
				layer.alert(data.message, {
					icon: 2
				});
			}
		}
	});
}
//上传附件
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx','xls'], //接收的文件后缀
//			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			//showCaption: true, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview :false,
			showRemove:false,
			layoutTemplates:{
				actionDelete:"",
				actionUpload:""
			}

		}).on("filebatchselected", function(event, files) {			
			if(event.currentTarget.files.length>1){
				parent.layer.alert('单次上传文件数只能为1个');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			}
			if(event.currentTarget.files[0].size>2*1024*1024*1024){
				parent.layer.alert('上传的文件不能大于2G');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			};			
	        $(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {           
		    filesData.push(
				{   
					id:new Date().getTime(),
				    fileName:data.files[0].name,
				    fileSize:data.files[0].size/1000+"KB",
				    filePath:data.response.data[0]
			    }
			)
		    filesDataView()
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function filesDataView(){
	var tr=""	   
	for(var i=0;i<filesData.length;i++){
		tr+='<input type="hidden" name="project.purFiles['+ i +'].fileName" value="'+ filesData[i].fileName +'"/>'
          +'<input type="hidden" name="project.purFiles['+ i +'].filePath" value="'+ filesData[i].filePath +'"/>'
          +'<input type="hidden" name="project.purFiles['+ i +'].fileSize" value="'+ filesData[i].fileSize +'"/>'
	};
	$("#filesDatas").html(tr);
	if(filesData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
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
				width:'100px',

			},			
			{
				field: "cz",
				title: "操作",
				halign: "center",
				width:'150px',
				align: "center",
				events:{
					'click .download':function(e,value, row, index){
						var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.filePath + "&fname=" +row.fileName;
						window.location.href = $.parserUrlForToken(newUrl);
					}
				},
				formatter:function(value, row, index){	
					return  "<a href='javascript:void(0)' class='btn btn-sm btn-primary download' style='text-decoration:none;margin-right:5px'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>"			
							+'<a href="javascript:void(0)"  class="btn btn-sm btn-danger" onclick=fileDetel('+ index +',\"'+row.id +'\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</a>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);		
}

function fileDetel(i,uid){	
	parent.layer.confirm('确定要删除该附件', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		var itemList=new Array();
		filesData=itemList.concat(filesData);
		filesData.splice(i,1)
		if(uid.length==32){
	    	 $.ajax({
				type: "post",
				url: deleteFileUrl,
				async: false,
				dataType: 'json',
				data: {
					"id":uid ,		
				},
				success: function(data) {		
				}
			});   
	    }
	filesDataView()
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});	
	
};