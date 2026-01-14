var projectDataId = getUrlParam('projectId'); //该条数据的项目id
var projectSource = getUrlParam('projectSource'); //是否重新竞价
var allProjectData = config.AuctionHost + '/AuctionPurchaseController/findAuctionProjectPurchase.do'; //项目数据的接口；
var addpackageurl = 'Auction/Auction/Agent/AuctionPurchase/model/addAuctionPackage.html'; //添加包件
var editpackageurl = 'Auction/Auction/Agent/AuctionPurchase/model/editAuctionPackage.html'; //修改包件
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口；
var sendUrl = config.Syshost + "/OptionsController/list.do"; //获取媒体的数据
var updateAuctionPurchase = config.AuctionHost + '/AuctionPurchaseController/saveNewAuctionPurchase.do';//提交公告
var saveProjectPackage = config.AuctionHost + "/AuctionProjectPackageController/saveAuctionProjectPackage.do";//保存包件
var deletProjectUrl = config.AuctionHost + "/AuctionProjectPackageController/deleteProjectPackage.do" //包件删除
var editPurchase = 'Auction/Auction/Agent/AuctionPurchase/model/addAuctionProject.html';//上一步修改项目信息
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var isCheck;
var purchaseaData;
var packageData = [],
	packageData1 = [];
var publicDatas = []; //邀请供应商数据的容器
var massage2 = ""
var ue = UE.getEditor('editor');
var WORKFLOWTYPE = 'xmgg';
var fileView1 = [];
var fileView2 = [];
var fileViewName;
var packageDataType = [];
var depositList, isDf;
var manual, oldProjectId = '';

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function () {
	$("#approval").ApprovalProcess({
		businessId: projectDataId,
		status: 1,
		type: "xmgg",
	});
	$.ajax({
		url: allProjectData,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectDataId
		},
		success: function (data) {
			//项目数据
			purchaseaData = data.data;
			$("#manual").val(purchaseaData.manual);
			//manual=purchaseaData.manual
			$("#projectId").val(purchaseaData.projectId);
			$("#purchaseId").val(purchaseaData.id);
			$("#isPublics").val(purchaseaData.isPublic);
			// var echoObj = {publishType:2,pdfUrl:"/df2023/20240325/pdf/0abb5a67e86c49c8b64639b84b44da93.pdf"}
			new UEditorEdit({
				contentKey:'content',
			})
			
			//邀请供应商的数据
			publicData = purchaseaData.projectSupplier;
			if (projectSource != 1) {
				$("#addBao").show();
				$("#btn_prev").show();
			}
			mediaEditor.setValue(purchaseaData)
			initMediaVal(purchaseaData.options, {
				// stage: 'xmgg',
				projectId: projectDataId,
			})
		},
		error: function (data) {
			parent.layer.alert("修改失败")
		}
	});
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId: projectDataId,
		status: 1,//1编辑   2 查看  3 采购人专区的代理项目
	});
	time();
	
	//渲染公告的数据
	$('div[id]').each(function () {
		$(this).html(purchaseaData[this.id]);
	});

	if (purchaseaData.content) {
		ue.ready(function () {
			ue.setContent(purchaseaData.content);
		});
	}
	$('input[id]').each(function () {
		if (reg.test(purchaseaData[this.id])) {
			$(this).val(purchaseaData[this.id].substring(0, 16));
		}
	});
	$("#browserUrl").attr('href', siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSiteUrl);
	$("#webTitle").html(siteInfo.sysTitle)
	$("#provinceName").html(purchaseaData.provinceName || '湖北省');
	$("#cityName").html(purchaseaData.cityName || '武汉市');
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if (purchaseaData.tenderProjectClassify) {
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: purchaseaData.tenderProjectClassify,
			status: 2,
			viewCallback: function (name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if (purchaseaData.industriesType) {
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: purchaseaData.industriesType,
			status: 2,
			viewCallback: function (name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
	if (purchaseaData.isPublic > 1) {
		$("input[name='isPublics'][value='1']").attr("checked", true);
		$('.isPublics1').show();
		$('.isPublics0').hide();
		$(".yao_btn").show();
		$("#CODENAME").val(purchaseaData.supplierClassifyName);
		$("#supplierClassifyCode").val(purchaseaData.supplierClassifyCode);
		classificaCode = purchaseaData.supplierClassifyCode;
		Publics();
		if (purchaseaData.isPublic == 3) {
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
	if (purchaseaData.oldProjectId) {//推送的项目
		oldProjectId = purchaseaData.oldProjectId;
		$('#viewPushInfo').show();
		$('.agencyDepartment').hide();
		$('#agencyDepartmentId, #agencyDepartment').show();
		$("#agencyDepartmentId").val(purchaseaData.agencyDepartmentId);
		$("#agencyDepartment").val(purchaseaData.agencyDepartmentName);
	} else {
		if (purchaseaData.agencyDepartmentName || purchaseaData.belongDepartmentName) {
			$('.agencyDepartment').show().html(purchaseaData.agencyDepartmentName ? purchaseaData.agencyDepartmentName : purchaseaData.belongDepartmentName);
			$('#agencyDepartmentId, #agencyDepartment').hide();
			$("#agencyDepartmentId").val(purchaseaData.agencyDepartmentId ? purchaseaData.agencyDepartmentId : purchaseaData.belongDepartmentId);
			$("#agencyDepartment").val(purchaseaData.agencyDepartmentName ? purchaseaData.agencyDepartmentName : purchaseaData.belongDepartmentName);
		} else {
			$('#agencyDepartmentId, #agencyDepartment').show();
			$('.agencyDepartment').hide();
		}
	}
	$("#purchaserDepartmentId").val(purchaseaData.purchaserDepartmentId);
	$("#purchaserDepartment").val(purchaseaData.purchaserDepartmentName);
	if (purchaseaData.isFile == 0) {
		if (purchaseaData.manual == 1) {
			$(".supplierData").show();
			$('.colss').attr('colspan', '1');
			$('#supplierCount').val('3');
		} else {
			$(".supplierData").hide();
			$('.colss').attr('colspan', '3');
			$('#supplierCount').val('');
		}
		$("#isFileN").show();
		$('#fileEndDate').val(purchaseaData.fileEndDate != undefined ? purchaseaData.fileEndDate.substring(0, 16) : ''); //竞价文件递交截止时间
		$('#fileCheckEndDate').val(purchaseaData.fileCheckEndDate != undefined ? purchaseaData.fileCheckEndDate.substring(0, 16) : ''); //竞价文件审核截止时间
	} else {
		$(".supplierData").hide();
		$('.colss').attr('colspan', '3');
		$('#supplierCount').val('');
		/* if(purchaseaData.manual == 1) {
			$(".supplierData").show();
			$('.colss').attr('colspan', '1');
		} else {
			$(".supplierData").hide();
			$('.colss').attr('colspan', '3');
		} */
		$("#isFileN").hide();
		$("#fileEndDate").removeAttr("data-datename");
		$("#fileCheckEndDate").removeAttr("data-datename");
		$('#fileEndDate').val(""); //竞价文件递交截止时间
		$('#fileCheckEndDate').val(""); //竞价文件审核截止时间
	};
	$("input[name='settingNotice'][value='" + (purchaseaData.settingNotice || 0) + "']").attr("checked", true);
	if (purchaseaData.projectType == 0) {
		$("#projectType").html("工程");
		var projectType = 'A';
	}
	if (purchaseaData.projectType == 1) {
		$("#projectType").html("设备");
		var projectType = 'B';
	}
	if (purchaseaData.projectType == 2) {
		$("#projectType").html("服务");
		var projectType = 'C';
	}
	if (purchaseaData.projectType == 3) {
		$("#projectType").html("广宣");
		var projectType = 'C50';
	};
	if (purchaseaData.projectType == 4) {
		$("#projectType").html("废旧物资");
		var projectType = 'W';
	};
	//当为0，1时不显示邀请供应商列表
	if (purchaseaData.isPublic > 1) {
		$(".yao_btn").show();
		classificaCode = purchaseaData.supplierClassifyCode
		Publics();
	} else {
		$(".yao_btn").hide();
	}
	if (purchaseaData.projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	};
	package();
	modelOption({
		'tempType': 'biddingProcurementNotice',
		'projectType': projectType
	});
	$("#noticeTemplate").attr('name', 'templateId');
	$("#noticeTemplate").val(purchaseaData.templateId); //公告模板id	
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
	setTimeout(function () {
		var iframeid = $('#editor iframe').attr('id');
		var viewClass = $("#" + iframeid).contents().find("body.view").addClass('viewWitdh');
	}, 1000);
	if (sysEnterpriseId && projectSource == 1) {
		var arrlist = sysEnterpriseId.split(',');
		if (arrlist.indexOf(top.enterpriseId) != -1) {
			isDf = true
			getDeposit()
		}
	}
});
// 选择部门
$(".Department").on("click", function () {
	var name = $(this).data('title');
	if (name == 'agency') {
		var uid = top.enterpriseId
		var mnuid = $("#agencyDepartmentId").val();
	} else {
		var uid = purchaseaData.purchaserId;
		var mnuid = $("#purchaserDepartmentId").val()
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee.html',
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.employee(uid, name, callEmployeeBack, mnuid)
		},

	})
})
function callEmployeeBack(aRopName, dataTypeList) {
	var itemTypeId = []; //项目类型的ID
	var itemTypeName = []; //项目类型的名字			
	for (var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList = itemTypeId.join(","); //项目类型的ID
	typeNameList = itemTypeName.join(","); //项目类型的名字
	if (aRopName == 'agency') {
		$("#agencyDepartmentId").val(typeIdList);
		$("#agencyDepartment").val(typeNameList);
	} else {
		$("#purchaserDepartmentId").val(typeIdList);
		$("#purchaserDepartment").val(typeNameList);
	}
}
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
					'type': 'xmgg',
					'projectId': purchaseaData.projectId,
					'tempId': templateId,
					'tenderType': 1
				})
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
//临时保存
$("#btn_bao").click(function () {
	forms();
})
//上一步
$("#btn_prev").click(function () {
	// forms(getBack);
	getBack()
});
//回退
function getBack() {
	var index = top.parent.layer.getFrameIndex(window.name);
	top.parent.layer.close(index);
	top.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '修改项目信息',
		area: ['100%', '100%'],
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: editPurchase + '?projectId=' + purchaseaData.projectId + '&projectSource=' + purchaseaData.projectSource + '&isBack=true',
		//btn: ['提交审核', '保存', '取消'],//确定按钮
		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
		},
	});
};
//退出
$("#btn_close").click(function () {
	var index = top.parent.layer.getFrameIndex(window.name);
	top.parent.layer.close(index);
})

function forms(callback) {
	$("#projectState").val(0) //审核状态0为临时保存，1为提交审核
	$("#content").val(ue.getContent())
	//formd()
	// 时间处理
	var vmForm = $("#form");
	['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
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
		data: vmForm.serialize() + "&projectId=" + purchaseaData.projectId,
		success: function (data) {
			if (data.success == true) {
				['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
					var value = vmForm.find('#' + key).val();
					if (value && value.length > 16) {
						vmForm.find('#' + key).val(value.slice(0,16))
					}
				})
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				if (isDf) {
					depositList.saveData(2);
				}
				if (callback) {
					callback()
				} else {
					parent.layer.alert("保存成功");
				}
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function (data) {
			parent.layer.alert("保存失败")
		}
	});
}
//提交审核
$("#btn_submit").click(function () {
	for (var a = 0; a < fileView2.length; a++) {
		for (var j = a + 1; j < fileView2.length; j++) {
			if (fileView2[a].id == fileView2[j].id) { //第一个等同于第二个，splice方法删除第二个
				fileView2.splice(j, 1);
				j--;
			}
		}
	}
	for (var i = 0; i < packageDataType.length; i++) {
		for (var j = i + 1; j < packageDataType.length; j++) {
			if (packageDataType[i].id == packageDataType[j].id) { //第一个等同于第二个，splice方法删除第二个
				packageDataType.splice(j, 1);
				j--;
			}
		}
	}
	if (fileView1.length == 0) {
		if (packageDataType.length > 0) {
			if (fileView2.length != packageDataType.length) {
				return parent.layer.alert("包件" + fileViewName + "的清单文件未上传");

			}
		}
	}
	if (!isMediaValid()) {
		return;
	}
	$("#content").val(ue.getContent())
	if (text()) {
		parent.layer.alert(text());
		return
	}
	if (timeCheck($("#form"))) {
		if($('[name=isFile]:checked').val() == 0){
			var fileEndDate = Date.parse(new Date($('#fileEndDate').val().replace(/\-/g, "/"))); //竞价文件递交截止时间
			var fileCheckEndDate = Date.parse(new Date($('#fileCheckEndDate').val().replace(/\-/g, "/"))); //竞价文件审核截止时间
			if(fileCheckEndDate <= fileEndDate){
				top.layer.alert('竞价文件审核截止时间必须大于竞价文件递交截止时间');
				return
			}
		}
		if (isDf) {
			if (depositList.subitemData()) {
				top.layer.confirm((publicDatas.length > 0 ? '邀请' : '') + '{' + depositList.subitemData() + '},保证金没有转移到本项目，确认不转移吗？', function (index) {
					form();
					parent.layer.close(index);
				})
			} else {
				form();
				/* if($("#manual").val() == 1) {
					$(".supplierData").show();
					form();
				} else {
					$(".supplierData").hide();
					$("#supplierCount").val("");
					form();
				} */
			}
		} else {
			form();
			/* if($("#manual").val() == 1) {
				$(".supplierData").show();
				form();
			} else {
				$(".supplierData").hide();
				$("#supplierCount").val("");
				form();
			} */
		}
	}
})

function form() {
 
	if (isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function (index, layero) {
			$("#projectState").val(1) //审核状态0为临时保存，1为提交审核	
			// 时间处理
			var vmForm = $("#form");
			['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
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
				data: vmForm.serialize() + "&projectId=" + purchaseaData.projectId,
				success: function (data) {
					if (data.success == true) {
						if (top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						if (isDf) {
							depositList.saveData(1);
						}
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						top.layer.alert("提交审核成功");
						var index = top.parent.layer.getFrameIndex(window.name);
						top.parent.layer.close(index);
					} else {
						top.layer.alert(data.message);
					}
				},
				error: function (data) {
					top.layer.alert("提交审核失败")
				}
			});
		})
	} else {
		$("#projectState").val(1) //审核状态0为临时保存，1为提交审核
		// 时间处理
		var vmForm = $("#form");
		['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
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
			data: vmForm.serialize() + "&projectId=" + purchaseaData.projectId,
			success: function (data) {
				if (data.success == true) {
					if (top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					if (isDf) {
						depositList.saveData(1);
					}
					parent.layer.alert("提交审核成功");
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					var index = top.parent.layer.getFrameIndex(window.name);
					top.parent.layer.close(index);
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function (data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}
}
//资金来源数据获取
function sourceFunds() {

};
//添加包件
function add_bao() {
	$.ajax({
		url: saveProjectPackage,
		type: 'post',
		async: false,
		data: {
			'packageName': purchaseaData.projectName,
			'auctionType': 0,
			'auctionModel': 0,
			'projectId': projectDataId,
			'isAgent': 1,
		},
		success: function (data) {
			if (data.success) {
				package();
				if (data.data) {
					editPackage(data.data);
				}
			} else {
				parent.layer.alert(data.message);
			};
		},
		error: function (data) {
			parent.layer.alert("添加失败")
		}
	});
};
//修改包件
function editPackage(uid) {
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '编辑包件',
		area: ['100%', '100%'],
		content: editpackageurl + '?projectSource=' + projectSource + '&projectType=' + purchaseaData.projectType,
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.du(uid)
		}
	});
}
//删除包件
function deletPackage(uid) {
	parent.layer.confirm('确定要删除该包件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			url: deletProjectUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"id": uid
			},
			success: function (data) {
				if (data.success) {
					for (var i = 0; i < packageDataType.length; i++) {
						if (packageDataType[i].id == uid) {
							packageDataType.splice(i, 1);

						}
					}
					package();
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function (data) {
				parent.layer.alert("删除失败")
			}
		});
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});
}
// 包件列表
function package() {
	packageData = [];
	fileView2 = [];
	packageData1 = [];
	$.ajax({
		type: "post",
		url: config.AuctionHost + '/AuctionProjectPackageController/findAuctionProjectPackageList.do',
		data: {
			'projectId': projectDataId
		},
		dataType: "json",
		async: false,
		success: function (response) {
			if (response.success) {
				packageData = response.data;
				if (packageData.length == 0) {
					$("#EndDate").hide();
					$("#auctionEndDate").removeAttr("data-datename");
				} else {
					for (var p = 0; p < packageData.length; p++) {
						if (packageData[p].auctionType == 6) {
							packageDataType.push(packageData[p])
							$("#EndDate").show();
							$("#auctionEndDate").attr("data-datename", "竞价截止时间");
						} else if (packageData[p].auctionType == 7) {
							$("#EndDate").show();
							$("#auctionEndDate").attr("data-datename", "竞价截止时间");
						} else {
							$("#EndDate").hide();
							$("#auctionEndDate").removeAttr("data-datename");
						}
					}
				}
				for (var i = 0; i < packageData.length; i++) {
					packageData1.push({
						packageId: packageData[i].id,
						projectId: packageData[i].projectId,
						projectForm: 1
					})
				}
			}
		}
	});
	if (packageData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#tablebjb').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
		columns: [{
			title: "序号",
			align: "center",
			halign: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "packageNum",
			title: "包件编号",
			align: "left",
			halign: "left",
			width: "200px",

		},
		{
			field: "packageName",
			title: "包件名称",
			halign: "left",
			align: "left",

		}, {
			field: "auctionType",
			title: "竞价方式",
			halign: "center",
			width: '150px',
			align: "center",
			formatter: function (value, row, index) {
				if (value == 0) {
					return '自由竞价'
				}
				if (value == 1) {
					return '单轮竞价'
				}
				if (value == 2) {
					return '多轮竞价中的2轮竞价'
				}
				if (value == 3) {
					return '多轮竞价中的3轮竞价'
				}
				if (value == 4) {
					return '无限轮次竞价'
				}
				if (value == 6) {
					fileListView(row.id, row.packageName)
					$("#EndDate").show();
					return '清单式竞价'
				}
				if (value == 7) {
					fileListView(row.id, row.packageName)
					$("#EndDate").show();
					return '单项目竞价'
				}
			}
		}, {
			field: "#",
			title: "操作",
			halign: "center",
			align: "center",
			width: '120px',
			formatter: function (value, row, index) {
				var Tdr = '<div class="btn-group">' +
					'<button type="button" class="btn-xs btn btn-primary" style="margin-right:10px" onclick=editPackage(\"' + row.id + '\",' + index + ')>编辑</button>'
				if (projectSource != 1) {
					Tdr += '<button type="button" class="btn-xs btn btn-danger" onclick=deletPackage(\"' + row.id + '\",' + index + ')>删除</button>'
				}

				Tdr += '</div>' +
					'</td>'
				return Tdr
			}
		}
		]
	});
	$('#tablebjb').bootstrapTable("load", packageData); //重载数据	
};
//清单附件
function fileListView(id, name) {
	fileViewPackageId = id
	$.ajax({
		type: "get",
		url: config.AuctionHost + "/PurFileController/list.do",
		async: false,
		data: {
			'modelId': id,
			'modelName': "JJ_AUCTION_SPECIFICATION"
		},
		datatype: 'json',
		success: function (data) {
			var flieData = data.data;
			if (data.success == true) {
				if (flieData.length == 0) {
					fileView1 = flieData
					fileViewName = name

				} else {
					fileView2.push(flieData[0])
				}

			}
		}
	});
}

//原项目保证金转移到本项目
function getDeposit() {
	if (!depositList) {
		depositList = $("#depositHtml").deposit({
			status: 1, //1为编辑2为查看
			tenderType: 1,
			parameter: { //接口调用的基本参数
				projectId: purchaseaData.projectId,
				projectForm: 1,
			},
			packageData: packageData1
		})
	}
};
/* 查看派项信息 */
$('#viewPushInfo').click(function () {
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, purchaseaData.bidValue1)
});