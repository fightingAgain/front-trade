var purchaseaData = ""; //项目的数据的参数
var filesData = []; //附件信息数据

var findAutionPurchaseInfoUrl = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口；
var findProjectSupplementInfoUrl = config.AuctionHost + "/ProjectSupplementController/findProjectSupplementInfo";

var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var WorkflowUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var saveChange = config.AuctionHost + '/ProjectSupplementController/saveProjectSupplement'; // 保存接口
var sendUrl = config.Syshost + "/OptionsController/list.do"; //获取媒体的数据
var packagePrice = []; //费用信息
var WORKFLOWTYPE = "xmby";
var projectSupplements = []; //最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var projectId;
var isFile;
var isChecker = 0;

var globalInfo;
var projectDataID = '';

var urlType = getUrlParam('type')
var urlProjectId = getUrlParam('projectId')
var mid = getUrlParam('id')
var checkState = getUrlParam('checkState')
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

var ue = UE.getEditor('editor');
//初始化
$(function() {
	new UEditorEdit({
		contentKey:"remark"
	});
	// Purchase()
	$("#browserUrl").attr('href', siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSite);
	$("#webTitle").html(siteInfo.sysTitle);

	$('#btn_submit').click(function() {
		if(!projectDataID) {
			parent.layer.alert('请先选择项目!');
			return false;
		}
		let noticeEndDate = $('#noticeEndDate').val()
		if(!noticeEndDate) {
			parent.layer.alert('请选择公告截止时间!');
			return false;
		}
		let askEndDate = $('#askEndDate').val()
		if(!askEndDate) {
			parent.layer.alert('请选择提出澄清截止时间!');
			return false;
		}
		let answersEndDate = $('#answersEndDate').val()
		if(!answersEndDate) {
			parent.layer.alert('请选择答复截止时间!');
			return false;
		}
		let auctionStartDate = $('#auctionStartDate').val()
		if(!auctionStartDate) {
			parent.layer.alert('请选择竞卖开始时间!');
			return false;
		}
		let fileEndDate = $('#fileEndDate').val()
		let fileCheckEndDate = $('#fileCheckEndDate').val()
		if(globalInfo && globalInfo.isFile != 1) {
			if(!fileEndDate) {
				parent.layer.alert('请选择竞卖文件递交截止时间!');
				return false;
			}
			if(!fileCheckEndDate) {
				parent.layer.alert('请选择竞卖文件审核截止时间!');
				return false;
			}
			var fileEndDateCheck = Date.parse(new Date(fileEndDate.replace(/\-/g, "/"))); //竞价文件递交截止时间
			var fileCheckEndDateCheck = Date.parse(new Date(fileCheckEndDate.replace(/\-/g, "/"))); //竞价文件审核截止时间
			if(fileCheckEndDateCheck <= fileEndDateCheck){
				top.layer.alert('竞卖文件审核截止时间必须大于竞卖文件递交截止时间');
				return false
			}
		}

		// 竞价开始时间必须大于等于公告截止时间、提出澄清截止时间、答复截止时间、竞价文件递交截止时间、竞价文件审核截止时间；
//		if(NewDate(auctionStartDate) < NewDate(noticeEndDate) || NewDate(auctionStartDate) < NewDate(askEndDate) || NewDate(auctionStartDate) < NewDate(answersEndDate)) {
//			if(globalInfo && globalInfo.isFile != 1) {
//				if(NewDate(auctionStartDate) < NewDate(fileEndDate) || NewDate(auctionStartDate) < NewDate(fileCheckEndDate)) {
//					parent.layer.alert('竞价开始时间必须大于等于公告截止时间、提出澄清截止时间、答复截止时间、竞价文件递交截止时间、竞价文件审核截止时间!');
//					return false;
//				}
//			} else {
//				parent.layer.alert('竞价开始时间必须大于等于公告截止时间、提出澄清截止时间、答复截止时间!');
//				return false;
//			}
//		}
        if(NewDate(auctionStartDate) < NewDate(noticeEndDate) || NewDate(auctionStartDate) < NewDate(fileCheckEndDate)) {
 			if(globalInfo.isFile != 1 && globalInfo.isFile != undefined) {
 				if(NewDate(auctionStartDate) < NewDate(fileCheckEndDate)) {
 					parent.layer.alert('竞卖开始时间必须大于公告截止时间、竞卖文件审核截止时间!');
 					return false;
 				}
 			} else {
 				parent.layer.alert('竞卖开始时间必须大于公告截止时间!');
 				return false;
 			}
 		}
		// 答复截止时间必须大于等于提出澄清截止时间；
		if(NewDate(answersEndDate) < NewDate(askEndDate)) {
			parent.layer.alert('答复截止时间必须大于等于提出澄清截止时间!');
			return false;
		}
		if(globalInfo && globalInfo.isFile != 1) {
			// 竞价文件审核截止时间必须大于等于竞价文件递交截止时间。
			if(NewDate(fileCheckEndDate) < NewDate(fileEndDate)) {
				parent.layer.alert('竞价文件审核截止时间必须大于等于竞价文件递交截止时间!');
				return false;
			}
		}
		if(globalInfo.isFile) {
			if(textdata(globalInfo.isFile)) {
				parent.layer.alert(textdata(globalInfo.isFile));
				return;
			};
		} else {
			if(textdata(isFile)) {
				parent.layer.alert(textdata(isFile));
				return;
			};
		}
		if(isChecker == 1) {
			let checkerId = $("#employeeId").val()
			if(!checkerId) {
				parent.layer.alert('请选择审核人!');
				return false;
			}
		}
		if(isChecker == 1) {
			let checkerId = $("#employeeId").val()
			if(!checkerId) {
				parent.layer.alert('请选择审核人!');
				return false;
			}
		}
		var ueContent = ue.getContent();
		ueContent = ueContent.replace(/<style[\s\S]*?<\/style>/ig, "");
		ueContent = ueContent.replace(/<\/?.+?\/?>/g, "");
		ueContent = ueContent.replace(/&nbsp;/ig, "");
		ueContent = ueContent.trim();
		if(ueContent == '') {
			parent.layer.alert("请输入公告信息!");
			return false;
		}
		let params = {
			'projectId': projectDataID.projectId || urlProjectId,
			'id': mid,
			'checkState': 0,
			'supplementType': 3,
			'tenderType': '2', //1=竞价 2=竞卖
			'auctionStartDate': $('#auctionStartDate').val(),
			'noticeEndDate': $('#noticeEndDate').val(),
			'askEndDate': $('#askEndDate').val(),
			'answersEndDate': $('#answersEndDate').val(),
			'fileEndDate': $('#fileEndDate').val(),
			'fileCheckEndDate': $('#fileCheckEndDate').val(),
			'checkerId': $("#employeeId").val(),
			'remark': ue.getContent(),
			'editorValue': ue.getContent(),

			// 媒体发布
			'optionId': typeIdLists,
			'optionValue': typeCodeLists,
			'optionName': typeNameLists,
		}
		params = $.extend(params, mediaEditor.getValue())
		if(globalInfo && globalInfo.isFile != 1) {
			params.fileEndDate = $('#fileEndDate').val();
			params.fileCheckEndDate = $('#fileCheckEndDate').val();
		}
		if(mid) {
			params.id = mid
		}
		$.ajax({
			url: saveChange,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: params,
			success: function(res) {
				if(res.success) {
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
					parent.layer.alert('公告变更提交成功!');
					parent.$('#table').bootstrapTable('refresh');
				} else {
					parent.layer.alert(res.message)
				}

			}
		});
	});
	$('#btn_close').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});

	if(urlType == 'edit') {
		$('.active button').hide()
		let pid = {
			'id': mid,
			'supplementType': 3,
			'projectId': urlProjectId
		};
		showPurchse(pid)
	}
});

//选择项目
function choseProject() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择项目',
		area: ['1100px', '600px'],
		content: 'Auction/Sale/Purchase/SaleChange/model/Purchasers.html?tenderType=2'
			//,btn: ['关闭']
			,
		maxmin: true //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			,
		resize: false //是否允许拉伸
			,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.du()
		}
	});
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

function clearData() {
	ue.setContent('')
	$('#auctionStartDate').val('')
	$('#noticeEndDate').val('')
	$('#askEndDate').val('')
	$('#answersEndDate').val('')
	$('#fileEndDate').val('')
	$('#fileCheckEndDate').val('')
	$("#employeeId").val('')
}

function showPurchse(Data) {

	if(urlType != 'edit') clearData();

	time()
	projectDataID = Data;
	if(projectDataID.id) {
		findWorkflowCheckerAndAccp(projectDataID.id);
	}
	if(Data.id) {
		var DataList = {
			id: Data.id,
			supplementType: Data.supplementType
		}
	} else {
		var DataList = Data
	}
	$.ajax({
		url: findProjectSupplementInfoUrl,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: DataList,
		success: function(findChangeData) {
			globalInfo = findChangeData.data;
			mediaEditor.setValue(globalInfo);

			if(urlType == 'edit') {
				$('#askEndDate').val(globalInfo.askEndDate)
				$('#answersEndDate').val(globalInfo.answersEndDate)
				$('#noticeEndDate').val(globalInfo.noticeEndDate)
				$('#auctionStartDate').val(globalInfo.auctionStartDate)
				$('#fileEndDate').val(globalInfo.fileEndDate)
				$('#fileCheckEndDate').val(globalInfo.fileCheckEndDate)
			}
			$.ajax({
				url: findAutionPurchaseInfoUrl,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: {
					'projectId': findChangeData.data.projectId,
				},
				success: function(data) {
					globalInfo = data.data;
					for(let item in data.data) {
						if(item == 'project') {
							console.log(data.data.project[0])
							for(let p in data.data.project[0]) {
								if(p == 'employeeId') break
								if(p == 'isAgent') {
									$('#' + p).html(data.data.project[0][p] == 1 ? '是' : '否')
								} else {
									$('#' + p).html(data.data.project[0][p])
								}
							}
							if(data.data.project[0].projectSourceCount != "undefined" && data.data.project[0].projectSourceCount != null && data.data.project[0].projectSourceCount != "0") {
								$("#projectName").html(data.data.project[0].projectName);
								$("#packageSourceCount").html('(第' + data.data.project[0].projectSourceCount + '次重新竞卖)');
								$("#packageSourceCount").show();
							} else {
								$("#projectName").html(data.data.project[0].projectName);
								$("#packageSourceCount").hide();
							}
						} else {
							$('#' + item).html(data.data[item])
						}

						if(item == 'noticeEndDate' || item == 'askEndDate' || item == 'answersEndDate' || item == 'auctionStartDate' || item == 'fileEndDate' || item == 'fileCheckEndDate') {
							$('#old' + item).html(data.data[item])
						}
					}
					if(checkState!=3){
						ue.ready(function() {
							ue.setContent('')
							ue.execCommand('insertHtml', data.data.content);
						});
					}
					isFile = data.data.isFile;
					if(data.data.isFile == 1) {
						$('.isFileBool').hide()
					} else {
						$('.isFileBool').show()
					}

					//项目数据
					purchaseaData = data.data;
					//邀请供应商的数据
					publicData = purchaseaData.projectSupplier;
					if(purchaseaData.autionProjectPackage.length > 0) {
						//包件信息的数据
						packageData = purchaseaData.autionProjectPackage;

						//设备信息的数据
						DetailedData = purchaseaData.auctionPackageDetailed

					}
					if(purchaseaData.projectSupplement.length > 0) { //存在补遗		
						for(var i = 0; i < purchaseaData.projectSupplement.length; i++) {
							//if(purchaseaData.projectSupplement[i].checkState==2){//审核通过
							projectSupplements.push(purchaseaData.projectSupplement[i]);
							//}
						}
					}

					for(let citem in findChangeData.data) {
						if(citem == 'content') {
							$('#editor').html(findChangeData.data[citem])
						} else {
							$('#' + citem).html(findChangeData.data[citem]);
						}
					}
					setSupplementChecker(); //添加审核人信息
					initMediaVal(purchaseaData.options, {
						stage: 'xmby',
						'projectId': findChangeData.data.projectId,
					})
				},
				error: function(data) {
					parent.layer.alert("修改失败")
				}
			});
		}
	});
	// Supplement();
	//渲染公告的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData[this.id]);
		if(reg.test(purchaseaData[this.id])) {
			$(this).html(purchaseaData[this.id].substring(0, 16));
		}

	});
	//渲染项目的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData.project[0][this.id]);
		if(reg.test(purchaseaData.project[0][this.id])) {
			$(this).html(purchaseaData.project[0][this.id].substring(0, 16));
		}
	});
	if(purchaseaData.project[0].projectType == 0) {
		$("#projectType").html("工程");
		var projectType = 'A';
	}
	if(purchaseaData.project[0].projectType == 1) {
		$("#projectType").html("设备");
		var projectType = 'B';
	}
	if(purchaseaData.project[0].projectType == 2) {
		$("#projectType").html("服务");
		var projectType = 'C';
	}
	if(purchaseaData.project[0].projectType == 3) {
		$("#projectType").html("广宣");
		var projectType = 'C50';
	};
	if(purchaseaData.project[0].projectType == 4) {
		$("#projectType").html("废旧物资");
		var projectType = 'W';
	};
	modelOption({
		'tempType': 'auctionNotice',
		'projectType': projectType
	});
	$("#noticeTemplate").attr('name', 'templateId');
	$("#noticeTemplate").val(purchaseaData.project[0].templateId); //公告模板id	
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
	setTimeout(function() {
		var iframeid = $('#editor iframe').attr('id');
		var viewClass = $("#" + iframeid).contents().find("body.view").addClass('viewWitdh');
	}, 1000);
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '襄阳市');
	Purchase(projectDataID.projectId)
	//当为0，1时不显示邀请供应商列表
	if(purchaseaData.isPublic > 1) {
		$('.publicTable').show();
		public()
	} else {
		$('.publicTable').hide()
	}
	if(purchaseaData.isPublic == 0) {
		$("#isPublic").html("所有供应商");
	}
	if(purchaseaData.isPublic == 1) {
		$("#isPublic").html("所有本公司认证供应商");
	}
	if(purchaseaData.isPublic == 2) {
		$("#isPublic").html("仅限邀请供应商");
	}
	if(purchaseaData.isPublic == 3) {
		$("#isPublic").html("仅邀请本公司认证供应商");
		$("#isPublics3").show();
	};
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile == 0) {
		$('.isFileDate').show()
	} else {
		$('.isFileDate').hide()
	}
	if(purchaseaData.project[0].projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	}
	if(sysEnterpriseId && purchaseaData.project[0].projectSource == 1) {
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId) != -1) {
			getDeposit();
		}
	}

	if(projectSupplements.length > 0) {
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}
		});
	}
	$('#StartDate').html($("#noticeStartDate").html())
	$('#endDate').html($("#noticeEndDate").html())
}

 // //切换模板
 function changHtml(templateId){
	modelHtml({'type':'xmgg', 'projectId':purchaseaData.project[0].id,'tempId':templateId,'tenderType':2})
}

function Purchase(id) {
	projectId = id
	findWorkflowCheckerAndAccp(projectId);
	getProjectPrice(); //费用信息
	$.ajax({
		url: findAutionPurchaseInfoUrl,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectId
		},
		success: function(data) {
			if(data.success) {
				purchaseaData = data.data //获取的数据	
				if(purchaseaData.purFile.length > 0) {
					filesData = purchaseaData.purFile;
					filesDataView()
				}
				if(purchaseaData.projectSupplement.length > 0) { //存在补遗		
					for(var i = 0; i < purchaseaData.projectSupplement.length; i++) {
						if(purchaseaData.projectSupplement[i].checkState == 2) { //审核通过
							projectSupplements.push(purchaseaData.projectSupplement[i]);
						}
					}
				}
			}

		},
		error: function(data) {

		}
	});
	Supplement();
	//公告的信息渲染
	//渲染公告的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData[this.id]);
		if(reg.test(purchaseaData[this.id])) {
			$(this).html(purchaseaData[this.id].substring(0, 16));
		}

	});
	//渲染项目的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData.project[0][this.id]);
		if(reg.test(purchaseaData.project[0][this.id])) {
			$(this).html(purchaseaData.project[0][this.id].substring(0, 16));
		}
	});
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '襄阳市');
	if(purchaseaData.project[0].projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	}
	if(projectSupplements.length > 0) {
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}
		});
	}
	$('#StartDate').html($("#noticeStartDate").html())
	$('#endDate').html($("#noticeEndDate").html())
	if(purchaseaData.autionProjectPackage.length > 0) {
		//包件的信息渲染
		$('div[id]').each(function() {
			$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
		});
		//当为自由竞卖的时候限时显示
		if(purchaseaData.autionProjectPackage[0].auctionType == 0) {
			$("#timeLimits").show();
			$("#timeLimit").html(purchaseaData.autionProjectPackage[0].timeLimit)
		}
		//当为单轮竞卖的时候隐藏显示，
		if(purchaseaData.autionProjectPackage[0].auctionType == 1) {
			$("#timeLimits").hide();
		}
		//当为多轮竞卖2轮时
		if(purchaseaData.autionProjectPackage[0].auctionType == 2) {
			$("#auctionType_2").show();
			$("#auctionType_0").hide();
			$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
			$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier == 0 ? '是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
			//当为多轮竞卖3轮时
		} else if(purchaseaData.autionProjectPackage[0].auctionType == 3) {
			$("#auctionType_2").show();
			$("#auctionType_0").hide();
			$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
			$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier == 0 ? '是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		} else {
			$("#auctionType_0").show();
			$("#auctionType_2").hide();
		}
		//当为0，1时不显示邀请供应商列表
		if(purchaseaData.isPublic > 1) {
			$('.publicTable').show();
			Public()
		} else {
			$('.publicTable').hide()
		}
		if(purchaseaData.isPublic == 0) {
			$("#isPublic").html("所有供应商");
		}
		if(purchaseaData.isPublic == 1) {
			$("#isPublic").html("所有本公司认证供应商");
		}
		if(purchaseaData.isPublic == 2) {
			$("#isPublic").html("仅限邀请供应商");
		}
		if(purchaseaData.isPublic == 3) {
			$("#isPublic").html("仅邀请本公司认证供应商");
			$("#isPublics3").show();
		};
		//是否竞卖文件递交0为是1为否
		if(purchaseaData.isFile == 0) {
			$('.isFileDate').show()
		} else {
			$('.isFileDate').hide()
		};
		if(purchaseaData.autionProjectPackage[0].isPayDeposit == 0) {
			$("#isPayDeposit").html("需要缴纳");
			$('.isDepositShow').show();
		} else {
			$("#isPayDeposit").html("不需要缴纳");
			$('.isDepositShow').hide();
		}
		if(purchaseaData.autionProjectPackage[0].isSellFile == 0) {
			$("#isSellFile").html("需要缴纳");
			$(".isSellShow").show();
			$('.isSellCols').attr('colspan', '1')
		} else {
			$("#isSellFile").html("不需要缴纳")
			$(".isSellShow").hide();
			$('.isSellCols').attr('colspan', '3');
		}
		if(purchaseaData.autionProjectPackage[0].auctionType == 2 && purchaseaData.autionProjectPackage[0].outType == 1) {
			$(".third").hide();
			$(".thirds").hide();
			$(".Supplier").hide();
		} else if(purchaseaData.autionProjectPackage[0].auctionType == 2 && purchaseaData.autionProjectPackage[0].outType == 0) {
			$(".Supplier").show();
			$(".third").hide();
			$(".thirds").hide();
		} else if(purchaseaData.autionProjectPackage[0].auctionType == 3 && purchaseaData.autionProjectPackage[0].outType == 1) {
			$(".Supplier").hide();
			$(".thirds").show();
		} else if(purchaseaData.autionProjectPackage[0].auctionType == 3 && purchaseaData.autionProjectPackage[0].outType == 0) {
			$(".Supplier").show();
			$(".third").show();
			$(".thirds").show();
		}
	}
	if(purchaseaData.auctionPackageDetailed.length > 0) {
		//设备信息的数据渲染
		$('div[id]').each(function() {
			$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
		});
	};

	/*end代理服务费*/
	var projectServiceFee = purchaseaData.projectServiceFee;
	if(projectServiceFee) {
		$("#agentBlock td").remove();
		var stHtml = '<td class="th_bg">采购代理服务费收取方式</td>' +
			'<td><div id="collectType">' + (projectServiceFee.collectType == 1 ? "标准累进制" : (projectServiceFee.collectType == 2 ? "其他" : "固定金额")) + '</div></td>';
		if(projectServiceFee && projectServiceFee.collectType == 0) {
			stHtml += '<td class="th_bg">固定金额(元)</td>' +
				'<td><div id="chargeMoney">' + projectServiceFee.chargeMoney + '</div></td>'
		} else if(projectServiceFee && projectServiceFee.collectType == 1) {
			if(projectServiceFee.isDiscount == 1) {
				stHtml += '<td class="th_bg">是否优惠</td><td>否</td>'
			} else {
				stHtml += '<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient">' + projectServiceFee.discountCoefficient + '</div></td>'
			}
		} else if(projectServiceFee && projectServiceFee.collectType == 2) {
			stHtml += '<td class="th_bg">收取说明</td>' +
				'<td><div id="collectRemark">' + projectServiceFee.collectRemark + '</div></td>'
		}
		$(stHtml).appendTo("#agentBlock");
		$("#agentBlock").css("display", "table-row");
	}
	/*end代理服务费*/
}

//附件信息
function filesDataView() {
	if(filesData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
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
				width: '100px',

			},
			{
				field: "#",
				title: "操作",
				halign: "center",
				width: '50px',
				align: "center",
				events: {
					'click .openAccessory': function(e, value, row, index) {
						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
						window.location.href = $.parserUrlForToken(url);
					}
				},
				formatter: function(value, row, index) {
					return '<button type="button" class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},
		]
	});
	$('#filesData').bootstrapTable("load", filesData);
}

//当有邀请供应商的时候显示邀请供应商的列表
function Public() {
	if(purchaseaData.projectSupplier.length > 7) {
		var height = "304"
	} else {
		var height = ""
	}
	$('#tableList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
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
				field: "enterprise.enterpriseName",
				title: "企业名称",
				align: "left",
				halign: "left",
			},
			{
				field: "enterprise.enterprisePerson",
				title: "联系人",
				halign: "center",
				align: "center",
				width: "120px",
			}, {
				field: "enterprise.enterprisePersonTel",
				title: "联系电话",
				halign: "center",
				width: '100px',
				align: "center",
			}, {
				field: "enterprise.enterpriseLevel",
				title: "认证状态",
				halign: "center",
				width: '100px',
				align: "center",
				formatter: function(value, row, index) {
					if(row.enterprise.enterpriseLevel == 0) {
						var enterpriseLevel = "未认证"
					};
					if(row.enterprise.enterpriseLevel == 1) {
						var enterpriseLevel = "提交认证"
					};
					if(row.enterprise.enterpriseLevel == 2) {
						var enterpriseLevel = "受理认证"
					};
					if(row.enterprise.enterpriseLevel == 3) {
						var enterpriseLevel = "已认证"
					};
					if(row.enterprise.enterpriseLevel == 4) {
						var enterpriseLevel = "已认证"
					};
					return enterpriseLevel
				}
			}, {
				field: "isAcceptText",
				title: "确认状态",
				halign: "center",
				width: '100px',
				align: "center",
				formatter: function(value, row, index) {
					if(value == "接受") {
						var isAccept = "<div class='text-success' style='font-weight:bold'>" + value + "</div>"
					} else if(value == "拒绝") {
						var isAccept = "<div class='text-danger' style='font-weight:bold'>" + value + "</div>"
					} else {
						var isAccept = "未确认"
					}
					return isAccept
				}
			}, {
				field: "cz",
				title: "操作",
				halign: "center",
				align: "center",
				width: '120px',
				formatter: function(value, row, index) {
					var Tdr = '<div class="btn-group">' +
						'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier(' + index + ')">查看</a>' +
						'</div>'
					return Tdr
				}
			}
		]
	});

	$('#tableList').bootstrapTable("load", purchaseaData.projectSupplier); //重载数据
};

//查看邀请供应商信息
function viewSupplier(i, dThis) {
	//sessionStorage.setItem('publicData', JSON.stringify(purchaseaData.projectSupplier[i]));//当前供应商的数据缓存
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看',
		area: ['650px', '400px'],
		content: viewSupplierUrl,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow; //获取包件弹出框整个对象
			iframeWind.du(purchaseaData.projectSupplier[i]) //弹出框弹出时初始化     	
		}

	});
};

function getProjectPrice() {
	$.ajax({
		url: pricelist,
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": projectId,
		},
		success: function(data) {
			packagePrice = data.data;
			if(packagePrice.length > 0) {
				for(var i = 0; i < packagePrice.length; i++) {
					if(packagePrice[i].priceName == '项目保证金') {
						if(packagePrice[i].payMethod == 0) {
							$('.DepositPriceShow').hide();
							$("#payMethod").html('虚拟子账号');
						} else {
							$('.DepositPriceShow').show();
							$("#payMethod").html('指定账号');
							if(packagePrice[i].agentType == 0) {
								$("#agentType").html("平台")
							}
							if(packagePrice[i].agentType == 1) {
								$("#agentType").html("代理机构")
							}
							if(packagePrice[i].agentType == 2) {
								$("#agentType").html("采购人")
							}
							$("#bankAccount").html(packagePrice[i].bankAccount);
							$("#bankName").html(packagePrice[i].bankName);
							$("#bankNumber").html(packagePrice[i].bankNumber);
						}
						$("#price1").html(packagePrice[i].price);
					}
					if(packagePrice[i].priceName == '竞价采购文件费') {
						$("#price2").html(packagePrice[i].price);
					}
					if(packagePrice[i].priceName == '平台服务费') {
						$("#price3").html(packagePrice[i].price);
					}
				}
			}

		}
	});
}
//原项目保证金转移到本项目
function getDeposit() {
	$("#depositHtml").deposit({
		status: 2, //1为编辑2为查看
		tenderType: 2,
		parameter: { //接口调用的基本参数
			projectId: projectId,
			projectForm: 2,
		},
		packageData: [{
			projectId: projectId,
			projectForm: 2
		}]
	})
}

//添加媒体
var itemTypeId = [] //媒体ID
var itemTypeName = [] //媒体名字
var itemTypeCode = [] //媒体编号