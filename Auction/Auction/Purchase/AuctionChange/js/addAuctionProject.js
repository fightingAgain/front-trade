var projectDataID = ""; //该条数据的项目id
var purchaseaData = "";
var packageData = ""; //包件的数据容器
var publicData = ""; //邀请供应商数据的容器
var DetailedData = ""; //设备信息的数据容器
var packagePrice = []; //费用信息
var filesData = [];
var isFile;
var findAutionPurchaseInfoUrl = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口；
var findProjectSupplementInfoUrl = config.AuctionHost + "/ProjectSupplementController/findProjectSupplementInfo";
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var CheckList = config.AuctionHost + '/AuctionPackageDetailedController/findAuctionPackageDetailedList.do' //材料设备 查询
var WorkflowUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var saveChange = config.AuctionHost + '/ProjectSupplementController/saveProjectSupplement'; // 保存接口
var sendUrl = config.Syshost + "/OptionsController/list.do"; //获取媒体的数据
var packagePrice = []; //费用信息
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var auctionOutTypeData = [] //不限轮次淘汰方式
var WORKFLOWTYPE = "xmby";
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
var projectSupplements = []; //最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var ue = UE.getEditor('editor');
var isChecker = 0;

var globalInfo;

var urlType = getUrlParam('type')
var urlProjectId = getUrlParam('projectId')
var mid = getUrlParam('id')
var projectSourceCount = getUrlParam('projectSourceCount')
var checkState=getUrlParam('checkState');
var isDfcm = false;//是否传媒自主采购项目
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

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
			parent.layer.alert('请选择竞价开始时间!');
			return false;
		}
		let fileEndDate = $('#fileEndDate').val()
		let fileCheckEndDate = $('#fileCheckEndDate').val()
		if(globalInfo && (globalInfo.isFile != 1 && globalInfo.isFile != undefined)) {
			if(!fileEndDate) {
				parent.layer.alert('请选择竞价文件递交截止时间!');
				return false;
			}
			if(!fileCheckEndDate) {
				parent.layer.alert('请选择竞价文件审核截止时间!');
				return false;
			}
			var fileEndDateCheck = Date.parse(new Date(fileEndDate.replace(/\-/g, "/"))); //竞价文件递交截止时间
			var fileCheckEndDateCheck = Date.parse(new Date(fileCheckEndDate.replace(/\-/g, "/"))); //竞价文件审核截止时间
			if(fileCheckEndDateCheck <= fileEndDateCheck){
				top.layer.alert('竞价文件审核截止时间必须大于竞价文件递交截止时间');
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
					parent.layer.alert('竞价开始时间必须大于公告截止时间、竞价文件审核截止时间!');
					return false;
				}
			} else {
				parent.layer.alert('竞价开始时间必须大于公告截止时间!');
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
			'checkState': 0,
			'supplementType': 3,
			'tenderType': '1', //1=竞价 2=竞卖
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
					parent.layer.closeAll()
					parent.layer.alert('公告变更提交成功!');
					parent.$('#table').bootstrapTable('refresh');
				} else {
					parent.layer.alert(res.message)
				}

			}
		});
	});
	$('#btn_close').click(function() {
		parent.layer.closeAll()
	});

	if(urlType == 'edit') {
		$('.active button').hide()
		let pid = {
			'id': mid,
			'supplementType': 3
		};
		showPurchse(pid)
	}
})

//选择项目
function choseProject() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择可变更公告',
		area: ['1100px', '600px'],
		content: 'Auction/Auction/Purchase/AuctionChange/model/Purchasers.html?tenderType=1'
			//,btn: ['关闭']
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

	$.ajax({
		url: findProjectSupplementInfoUrl,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: Data,
		success: function(findChangeData) {
			globalInfo = findChangeData.data;

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

					for(let item in data.data) {
						if(item == 'project') {
							for(let p in data.data.project[0]) {
								if(p == 'employeeId') break
								if(p == 'isAgent') {
									$('#' + p).html(data.data.project[0][p] == 1 ? '是' : '否')
								} else {
									$('#' + p).html(data.data.project[0][p] == 1 ? '是' : '否')
								}
							}
						} else {
							$('#' + item).html(data.data[item])
						}

						if(item == 'noticeEndDate' || item == 'askEndDate' || item == 'answersEndDate' || item == 'auctionStartDate' || item == 'fileEndDate' || item == 'fileCheckEndDate') {
							$('#old' + item).html(data.data[item])
						}
					}
					if(checkState!=3){
						ue.ready(function () {
							//ue.setContent(result.data, true);	
							ue.setContent('')
							ue.execCommand('insertHtml', data.data.content);
						});
					}
					isFile = data.data.isFile
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
						if(citem == 'remark') {
							$('#editor').html(findChangeData.data[citem])
						} else {
							$('#' + citem).html(findChangeData.data[citem]);
						}
					}
					setSupplementChecker(); //添加审核人信息

					initMediaVal(purchaseaData.options, {
						stage: 'xmby',
						projectId: findChangeData.data.projectId,
						// packageId: '',
					});	
					mediaEditor.setValue(findChangeData.data);
				}
			});

		},
		error: function(data) {
			parent.layer.alert("修改失败")
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
		'tempType': 'biddingProcurementNotice',
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
	if(projectSourceCount != "undefined" && projectSourceCount != null && projectSourceCount != "0") {
		$("#projectName").val(purchaseaData.project[0].projectName);
		$("#projectSourceCount").html('(第' + projectSourceCount + '次重新竞价)');
		$("#projectSourceCount").show();
	} else {
		$("#projectName").val(purchaseaData.project[0].projectName);
		$("#projectSourceCount").hide();
	}
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '襄阳市');
	$("#isAgent").html(purchaseaData.project[0].isAgent == 1 ? '是' : '否');
	$("#projectTypeText").html(purchaseaData.project[0].projectTypeText);
	package()
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
//切换模板
function changHtml(templateId) {
	$("#projectState").val(0) //审核状态0为临时保存，1为提交审核
	$.ajax({
		url: saveChange, //修改包件的接口
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function(data) {
			if(data.success == true) {
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
//包件的按钮
function package() {
	if(packageData.length > 0) {
		var strHtml = "";
		for(i = 0; i < packageData.length; i++) {
			if(i == 0) {
				strHtml += "<button class='btn btn-default btn-primary packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			} else {
				strHtml += "<button class='btn btn-default packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}

			if(i < packageData.length - 1) {
				strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
		}
		$("#packageBtn").html(strHtml);

		setPackageInfo(0)
	}

}

//根据按钮显示的包件信息
function setPackageInfo(obj, thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary')
	auctionOutTypeData = [];
	var data = packageData[obj];
	purchaseaData.packageId = data.id
	for(var i = 0; i < purchaseaData.auctionOutType.length; i++) {
		if(purchaseaData.auctionOutType[i].packageId == packageData[obj].id) {
			auctionOutTypeData.push(purchaseaData.auctionOutType[i]);
		}
	};
	$('div[id]').each(function() {
		$(this).html(data[this.id]);
	});
	$('#isOfferFile').html(data.isOfferFile == 0 ? '提交报价文件' : '不提交报价文件');
	if(data.isPayDeposit == 0) {
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();
	} else {
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();

	}
	if(data.isSellFile == 0) {
		$("#isSellFile").html("需要缴纳");
		$(".isSellShow").show();
		$('.isSellCols').attr('colspan', '1')
	} else {
		$("#isSellFile").html("不需要缴纳")
		$(".isSellShow").hide();
		$('.isSellCols').attr('colspan', '3');
	}
	//当为自由竞卖的时候限时显示
	if(data.auctionType == 0) {
		if(data.auctionModel == 0) {
			$("#timeLimits").show();
			$("#timeLimit").html(data.timeLimit);
		} else {
			$("#timeLimits").hide();
		}
		if(data.auctionModel == 0 && data.isPrice == 0) {
			$(".isPriceM").show();
			$(".isPrices").show();
			$(".isPriceH").show();
			$(".isPriceL").attr('colspan', '');
		} else {
			$(".isPriceM").hide();
			$(".isPrices").hide();
			$(".isPriceH").hide();
			$(".isPriceL").attr('colspan', '3');
		};

	} else if(data.auctionType == 1) {
		$("#timeLimits").hide();
		$(".isPriceM").hide();
		$(".isPriceL").attr('colspan', '3');
		if(data.auctionModel == 0) {
			$(".isPrices").show();
			if(data.isPrice == 0) {
				$(".isPriceH").show();
			} else {
				$(".isPriceH").hide();
			}
		} else {
			$(".isPrices").hide();
			$(".isPriceH").hide();
		}
	} else {
		$(".isPriceM").hide();

		if(data.isPrice == 0) {
			$(".isPrices").show();
			$(".isPriceH").show();
		} else {
			$(".isPriceH").hide();
			$(".isPrices").hide();
		}

		$(".isPriceL").attr('colspan', '3');
		$('#isPriceReduction').html((data.isPriceReduction == 1)?'否':'是');
		/* 2、多轮竞价/不限轮次-设置竞价起始价-设置降价幅度 */
		if(data.auctionType == 2 || data.auctionType == 3 || data.auctionType == 4 ){//多轮/不限轮次
			if (data.isPrice == 0) {//设置竞价起始价
				$(".isPriceReduction").show();
				if(data.isPriceReduction == 0){//设置降价幅度
					$('.priceReduction').show();
					$('.isPriceReductionCols').attr('colspan','');
				}else{//不设置降价幅度
					$('.priceReduction').hide();
					$('.isPriceReductionCols').attr('colspan','3');
				}
			} else {//不设置竞价起始价
				$(".isPriceReduction").hide();
			}
			
		}else{
			$(".isPriceReduction").hide();
		}
	};
	//当为多轮竞卖2轮时
	if(data.auctionType == 2) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		//当为多轮竞卖3轮时
	} else if(data.auctionType == 3) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

	} else {
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
		$(".auctionType_4").hide();
	};
	if(data.auctionType == 4) {
		console.log(packageData[obj].outSupplier)
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").show();
		$("#outSupplierb").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		auctionType_4(obj);
	}
	if(data.auctionType == 2 && data.outType == 1) {
		$(".third").hide();
		$(".thirds").hide();
		$(".Supplier").hide();
	} else if(data.auctionType == 2 && data.outType == 0) {
		$(".Supplier").show();
		$(".third").hide();
		$(".thirds").hide();
	} else if(data.auctionType == 3 && data.outType == 1) {
		$(".Supplier").hide();
		$(".thirds").show();
	} else if(data.auctionType == 3 && data.outType == 0) {
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}
	if(data.auctionType == 6 || data.auctionType == 7) {
		if(data.auctionModel == '1') {
			$('#typemsg').html('根据各供应商报价，推荐各分项最低报价的供应商分别中选，即可多家供应商中选（可议价）')
		} else if(data.auctionModel == '2') {
			$('#typemsg').html('① 根据各供应商报价，分别明确各项最低报价；② 按照各供应商总报价金额由低到高进行排序，按排序分别进行议价，若第1名同意以各项最低报价成交，则推荐第1名中选，并不再继续与其他供应商议价；若第1名不同意成交，则与第2名议价，若第2名同意成交，则推荐第2名中选，并不再继续与其他厂家议价；依次类推，直至确定候选供应商。③ 经议价，若各供应商均不同意以“各项最低报价”成交，则推荐总报价最低的供应商中选；④ 一家供应商中选。')
		} else if(data.auctionModel == '3') {
			$('#typemsg').html('根据各供应商报价，推荐总价最低的供应商中选，即一家供应商中选（可议价）')
		}
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$(".PackageDetailedList").hide();
		$(".PackageDetailedLists").hide();
		$(".auctionType_6").show();
		$(".detailed_list").show();
		//		$("#tr_operation_table").show()
		$(".auctionType_6_type").hide();
		$(".budgetPrices").hide();
		$('.equipment_box').hide();
	} else {
		$('.equipment_box').show();
		$(".auctionType_6").hide()
		$(".PackageDetailedList").show();
		$(".PackageDetailedLists").show();
		$(".detailed_list").hide()
		//		$("#tr_operation_table").hide()
		$(".auctionType_6_type").show();
		$(".budgetPrices").show();
	}
	//其它费用信息
	getProjectPrice(packageData[obj].id, packageData[obj].projectId);
	isDfcm = checkPurchaserAgent(packageData[obj].id);
	//设备信息
	auctionPackageDetailed(packageData[obj].id);
	filesDataView(packageData[obj].id);
	filesViews(packageData[obj].id, data.auctionType);

	/*end代理服务费*/
	var projectServiceFee = purchaseaData.projectServiceFee;
	if(purchaseaData.openServiceFee == 1 && projectServiceFee) {
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

//附件信息列表
function filesDataView(uid) {
	var tr = ""
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId': uid,
			'modelName': 'JJ_AUCTION_PROJECT_PACKAGE'
		},
		datatype: 'json',
		success: function(data) {
			if(data.success == true) {
				filesData = data.data
			}
		}
	});
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
					return '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},
		]
	});
	$('#filesData').bootstrapTable("load", filesData);
};
//清单附件信息列表
function filesViews(uid, actype) {
	var model = '';
	if(actype == 7) {
		model = 'JJ_AUCTION_SINGLE_OFFERES';
	} else if(actype == 6) {
		model = 'JJ_AUCTION_SPECIFICATION';
	} else {
		return;
	}
	var tr = ""
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId': uid,
			'modelName': model
		},
		datatype: 'json',
		success: function(data) {
			if(data.success == true) {
				filesDataDetail = data.data;
				if(filesDataDetail && filesDataDetail.length > 0) {
					$("#fliesName").html(filesDataDetail[0].fileName)
				} else {
					$("#fliesName").html('');
					$("#fliesName").next().hide();
				}
			}
		}
	});

};
$(".openAccessory").click(function () {
	var url = top.config.FileHost + "/FileController/download.do" + "?fname=" + filesDataDetail[0].fileName + "&ftpPath=" + filesDataDetail[0].filePath;
	window.location.href = $.parserUrlForToken(url);
});
//查询费用信息
function getProjectPrice(packageId, projectId) {
	$.ajax({
		url: pricelist,
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"packageId": packageId,
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

//设备信息的数据
function auctionPackageDetailed(uid) {
	var checkListData = []; //把包件ID相同的设备信息放到一个数组中，
	$.ajax({
		url: CheckList,
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'packageId': uid
		},
		success: function(data) {
			if(data.success) {
				checkListData = data.data
			}
		}
	});
	if(checkListData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	$('#PackageDetailedList').bootstrapTable({
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
			field: "detailedName",
			title: isDfcm?"物料名称":"材料设备名称",
			align: "left",
			halign: "left",
		
		},
		{
			field: "brand",
			title: "品牌要求",
			visible: isDfcm?false:true,
			align: "center",
			halign: "center",
			width: '100px',
		
		},
		{
			field: "detailedVersion",
			title: "型号规格",
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				return (value == undefined || value == "") ? "暂无型号" : value
			}
		
		},{
			field: "technology",
			title: "材料工艺",
			halign: "center",
			visible: isDfcm?true:false,
			width: '100px',
			align: "center",
		
		}, {
			field: "detailedCount",
			title: "数量",
			halign: "center",
			width: '100px',
			align: "center",
		
		},
		{
			field: "detailedUnit",
			title: "单位",
			halign: "center",
			width: '100px',
			align: "center"
		},{
			field: "manner",
			title: "方式",
			visible: isDfcm?true:false,
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				//1  购买、2 租赁、3制作
				if(value == '1'){
					return '购买'
				}else if(value == '2'){
					return '租赁'
				}else if(value == '3'){
					return '制作'
				}
			}
		
		},
		{
			field: "budget",
			title: "采购预算（元）",
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				if (value == undefined) {
					var budget = "暂无预算"
				} else {
					var budget = value;
				};
				return budget
			}
		},
		{
			field: "detailedContent",
			title: isDfcm?"补充说明":"备注",
			halign: "left",
			align: "left",
		}
		]
	});
	$('#PackageDetailedList').bootstrapTable("load", checkListData);
}

//当有邀请供应商的时候显示邀请供应商的列表
function public() {
	if(publicData.length > 7) {
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

	$('#tableList').bootstrapTable("load", publicData); //重载数据
	$("#fixed-table-loading").hide();
};

//查看邀请供应商信息
function viewSupplier(i) {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看',
		area: ['700px', '500px'],
		content: viewSupplierUrl,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow; //获取包件弹出框整个对象
			iframeWind.du(publicData[i]) //弹出框弹出时初始化     	
		}

	});
};

function auctionType_4(obj) {
	if(auctionOutTypeData.length > 0) {
		var strHtml = "";
		strHtml = '<tr>' +
			'<td rowspan="' + (auctionOutTypeData.length + 4) + '" class="th_bg">淘汰方式</td>' +
			'<td style="text-align: left;" colspan="4">' +
			'(1)、首轮报价供应商数' + (auctionOutTypeData[0].countType == 0 ? '大于等于' : '大于') + auctionOutTypeData[0].countValue + '家时，' +
			'每轮淘汰' + auctionOutTypeData[0].outValue + '家供应商；' +
			'<span style="' + (auctionOutTypeData[0].countValue == 0 ? '' : 'display:none') + '">，每轮至少保留' + auctionOutTypeData[0].keepValue + '家供应商；</span>' +
			'</td>' +
			'</tr>'
		if(auctionOutTypeData.length > 2) {
			for(var i = 1; i < auctionOutTypeData.length - 1; i++) {
				strHtml += '<tr><td style="text-align: left;" colspan="4">(' + (i + 1) + ')、首轮报价供应商数'
				strHtml += (auctionOutTypeData[i - 1].countType == 0 ? '小于' : '小于等于')
				strHtml += auctionOutTypeData[i - 1].countValue
				strHtml += '且' + (auctionOutTypeData[i].countType == 0 ? '大于等于' : '大于')
				strHtml += auctionOutTypeData[i].countValue
				strHtml += '家时，每轮淘汰'
				strHtml += auctionOutTypeData[i].outValue
				strHtml += '家供应商；</td>'
				strHtml += '</tr>'
			}
		}
		if(auctionOutTypeData[0].countValue != 0 && auctionOutTypeData[0].countValue != undefined) {
			strHtml += '<tr>'
			strHtml += '<td style="text-align: left;" colspan="4">'
			if(auctionOutTypeData.length > 2) {
				strHtml += '(' + auctionOutTypeData.length + ')、首轮报价供应商数' + (auctionOutTypeData[auctionOutTypeData.length - 2].countType == 0 ? '小于' : '小于等于')
			} else {
				strHtml += '(' + auctionOutTypeData.length + ')、首轮报价供应商数' + (auctionOutTypeData[0].countType == 0 ? '小于' : '小于等于')
			}
			strHtml += auctionOutTypeData[auctionOutTypeData.length - 1].countValue + '家时，每轮淘汰'
			strHtml += auctionOutTypeData[auctionOutTypeData.length - 1].outValue + '家；'
			strHtml += '</td>'
			strHtml += '</tr>'
			strHtml += '<td style="text-align: left;" colspan="4">'
			strHtml += '(' + (auctionOutTypeData.length + 1) + ')、每轮至少保留' + auctionOutTypeData[auctionOutTypeData.length - 1].keepValue + '家供应商；'
			strHtml += '</td>'
			strHtml += '<tr>'
			strHtml += '</tr>'

		}
		strHtml += '<tr>'
		strHtml += '<td colspan="4" style="text-align: left;">'
		strHtml += '(' + (auctionOutTypeData.length + 2) + ')、当剩余供应商数小于等于淘汰家数与保留家数之和时' + (packageData[obj].lastOutType == 1 ? '每轮淘汰1家直至剩余' + auctionOutTypeData[auctionOutTypeData.length - 1].keepValue + '家。' : '一轮淘汰，保留' + auctionOutTypeData[auctionOutTypeData.length - 1].keepValue + '家。')
		strHtml += '</td>'
		strHtml += '</tr>'
		$("#tbOutType").html(strHtml);

	}
}

//原项目保证金转移到本项目
function getDeposit() {
	$("#depositHtml").deposit({
		status: 2, //1为编辑2为查看
		tenderType: 1,
		parameter: { //接口调用的基本参数
			projectId: projectDataID,
			projectForm: 1,
		},
		packageData: [{
			projectId: projectDataID,
			projectForm: 1
		}]
	})
}
//添加媒体
var itemTypeId = [] //媒体ID
var itemTypeName = [] //媒体名字
var itemTypeCode = [] //媒体编号