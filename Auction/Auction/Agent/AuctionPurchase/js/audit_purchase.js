var projectDataID = getUrlParam('projectId');//该条数据的项目id
var projectSource=getUrlParam('projectSource');//是否重新竞价
var purchaseaData = "";
var packageData = "";//包件的数据容器
var publicData = "";//邀请供应商数据的容器
var DetailedData = "";//设备信息的数据容器
var packagePrice = [];//费用信息
var filesData = [];
var filesDataDetail = []; //附件上传清单的数组
var auctionTypes;
var typeShow;
var showPrice;
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if (r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//初始化
$(function () {
	//退出
	$("#btn_close").click(function () {
		var index = top.parent.layer.getFrameIndex(window.name);
		top.parent.layer.close(index);
	});
	Purchase();
	$("#browserUrl").attr('href', siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSiteUrl);
	$("#webTitle").html(siteInfo.sysTitle);
	if(sysEnterpriseId&&projectSource==1){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			getDeposit();
		}
	};
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectDataID,
		status:2,//1编辑   2 查看  3 采购人专区的代理项目
	});
})
var allProjectData = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //项目数据的接口；
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var CheckList = config.AuctionHost + '/AuctionPackageDetailedController/findAuctionPackageDetailedList.do'//材料设备 查询
var packagePrice = []; //费用信息
// var viewSupplierUrl = "Auction/common/Agent/Purchase/AuctionPurchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var addsupplier = 'Auction/Auction/Agent/AuctionPurchase/model/add_supplier.html'//邀请供应商的弹出框路径
var auctionOutTypeData = []//不限轮次淘汰方式
var WORKFLOWTYPE = "xmgg";
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
var projectSupplements = [];//最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var oldProjectId = '';
function Purchase() {
	findWorkflowCheckerAndAccp(projectDataID);
	$.ajax({
		url: allProjectData,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectDataID
		},
		success: function (data) {
			//项目数据
			purchaseaData = data.data;
			if(purchaseaData.project && purchaseaData.project.length>0 &&purchaseaData.project[0].oldProjectId){//推送的项目
				oldProjectId = purchaseaData.project[0].oldProjectId;
				$('#viewPushInfo').show();
			}
			//邀请供应商的数据
			publicData = purchaseaData.projectSupplier;
			if (purchaseaData.autionProjectPackage.length > 0) {
				//包件信息的数据
				packageData = purchaseaData.autionProjectPackage;

				//设备信息的数据
				DetailedData = purchaseaData.auctionPackageDetailed
			}
			if (purchaseaData.projectSupplement.length > 0) { //存在补遗		
				for (var i = 0; i < purchaseaData.projectSupplement.length; i++) {
					//if(purchaseaData.projectSupplement[i].checkState==2){//审核通过
					projectSupplements.push(purchaseaData.projectSupplement[i]);
					//}
				}
			}
			if (packageData.length > 0) {
				for (var b = 0; b < packageData.length; b++) {
					auctionTypes = packageData[b].auctionType
					if (auctionTypes == '6') {

						typeShow = auctionTypes
					}


				}
			}
			new UEditorEdit({
				contentKey:'content',
				pageType:'view',
			})
			mediaEditor.setValue(purchaseaData)
			initMediaVal(purchaseaData.options, {
				// stage: 'xmgg',
				from: 'jjcg',
				disabled: true,
				projectId: purchaseaData.projectId,
			})
		},
		error: function (data) {
			parent.layer.alert("修改失败")
		}
	});
	Supplement(typeShow);
	//渲染公告的数据
	for (key in purchaseaData) {
		$('#' + key).html(purchaseaData[key]);
		if (reg.test(purchaseaData[key])) {
			$('#' + key).html(purchaseaData[key].substring(0, 16));
		}
	}
	//渲染项目的数据
	for (key in purchaseaData.project[0]) {
		$('#' + key).html(purchaseaData.project[0][key]);
		if (reg.test(purchaseaData.project[0][key])) {
			$('#' + key).html(purchaseaData.project[0][key].substring(0, 16));
		}
	}
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '襄阳市');
	$("#agencyDepartmentName").html(purchaseaData.agencyDepartmentName || "无所属部门")
	$("#purchaserDepartmentName").html(purchaseaData.purchaserDepartmentName || "无所属部门");
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if(purchaseaData.project[0].tenderProjectClassify){
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: purchaseaData.project[0].tenderProjectClassify,
			status: 2,
			viewCallback: function(name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if(purchaseaData.project[0].industriesType){
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: purchaseaData.project[0].industriesType,
			status: 2,
			viewCallback: function(name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
	package()
	//当为0，1时不显示邀请供应商列表
	switch (purchaseaData.isPublic) {
		case 0:
			$('#isPublics').html('公开')
			$('#isPublic').html('所有供应商')
			break;
		case 1:
			$('#isPublics').html('公开')
			$('#isPublic').html('所有本公司认证供应商')
			break;
		case 2:
			$('#isPublics').html('邀请')
			$('#isPublic').html('仅限邀请供应商')
			break;
		case 3:
			$('#isPublics').html('邀请')
			$('#isPublic').html('仅邀请本公司认证供应商')
			break;
	}
	if (purchaseaData.isPublic > 1) {
		$('.publicTable').show();
		Publics()
	} else {
		$('.publicTable').hide()
	}
	//是否竞卖文件递交0为是1为否
	if (purchaseaData.isFile == 0) {
		$('.isFileDate').show()
	} else {
		$('.isFileDate').hide()
	}
	if (purchaseaData.project[0].projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	}
	$('#StartDate').html($("#noticeStartDate").html())
	$('#endDate').html($("#noticeEndDate").html())
}
//包件的按钮
function package() {
	if (packageData.length > 0) {
		var strHtml = "";
		for (i = 0; i < packageData.length; i++) {
			if (i == 0) {
				strHtml += "<button class='btn btn-default btn-primary packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			} else {
				strHtml += "<button class='btn btn-default packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}

			if (i < packageData.length - 1) {
				strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
		}
		$("#packageBtn").html(strHtml);
		showPrice = packageData[0].budgetIsShow;
		setPackageInfo(0)
	}

}
//根据按钮显示的包件信息
function setPackageInfo(obj, thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary')
	auctionOutTypeData = [];
	var data = packageData[obj];
	showPrice = data.budgetIsShow;
	Supplement(data.auctionType);
	$('div[id]').each(function () {
		$(this).html(purchaseaData[this.id]);
	});
	switch (purchaseaData.isPublic) {
		case 0:
			$('#isPublics').html('公开')
			$('#isPublic').html('所有供应商')
			break;
		case 1:
			$('#isPublics').html('公开')
			$('#isPublic').html('所有本公司认证供应商')
			break;
		case 2:
			$('#isPublics').html('邀请')
			$('#isPublic').html('仅限邀请供应商')
			break;
		case 3:
			$('#isPublics').html('邀请')
			$('#isPublic').html('仅邀请本公司认证供应商')
			break;
	}
	purchaseaData.packageId = data.id
	for (var i = 0; i < purchaseaData.auctionOutType.length; i++) {
		if (purchaseaData.auctionOutType[i].packageId == packageData[obj].id) {
			auctionOutTypeData.push(purchaseaData.auctionOutType[i]);
		}
	};
	$('div[id]').each(function () {
		if (this.id == "budgetPrice") {
			if (data[this.id] == "" || data[this.id] == undefined) {
				$(this).html('');
				$(".budgetPrices").hide();
				$(".budgetPrice").hide();
				$("#typejj").attr("colspan", "3")
			} else {
				$(".budgetPrices").show();
				$(".budgetPrice").show();
				$("#typejj").removeAttr("colspan", "3")
				$(this).html(data[this.id]);
			}
		} else {
			$(this).html(data[this.id]);
		}
	});
	$("#content").html(purchaseaData.content);
	$("#package_content").html(data.content);
	if (data.isPayDeposit == 0) {
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();
		$("#bankType").html(data.bankType == 1 ? "工商银行" : data.bankType == 2? "招商银行":'');
	} else {
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();
	}
	if (data.isSellFile == 0) {
		$("#isSellFile").html("需要缴纳");
		$(".isSellShow").show();
		$('.isSellCols').attr('colspan', '1')
	} else {
		$("#isSellFile").html("不需要缴纳")
		$(".isSellShow").hide();
		$('.isSellCols').attr('colspan', '3');
	}
	$('#outNumber').html(data.outNumber?data.outNumber:'');
	//当为自由竞卖的时候限时显示
	if (data.auctionType == 0) {
		$("#timeLimits").show();
		$("#maxAuctionTimes").show();
		$("#timeLimit").html(data.timeLimit||'-');
		$("#maxAuctionTime").html(data.maxAuctionTime||'-');
	}
	//当为多轮竞卖2轮时
	if (data.auctionType == 2) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		//当为多轮竞卖3轮时
	} else if (data.auctionType == 3) {
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
	if (data.auctionType == 4) {
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").show();
		$("#outSupplierb").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
		auctionType_4(obj)
	}
	/*
	** 1、自由竞价-按包件-设置竞价起始价
	** 2、多轮竞价/不限轮次-设置竞价起始价-设置降价幅度
	 */
	$('#isPriceReduction').html((data.isPriceReduction == 1)?'否':'是');
	if((data.auctionType == 4 || data.auctionType == 2 || data.auctionType == 3) || (data.auctionType == 0 && data.auctionModel == 0)){
		$('.isPrices').show();
		if(data.isPrice == 0){//设置竞价起始价
			if(data.auctionType == 0){//自由竞价 显示竞价起始价、降价幅度，不显示是否设置降价幅度
				$('.rawPrice, .isPriceReduction, .priceReduction').show();
				$('.isPriceReductionText').hide();
				$('.priceReductionCols').attr('colspan','3');
				$('.isPriceReductionCols').attr('colspan','');
			}else{// 显示竞价起始价、是否设置降价幅度
				$('.rawPrice, .isPriceReduction, .isPriceReductionText').show();
				if(data.isPriceReduction == 0){//设置降价幅度
					$('.priceReduction').show();
					$('.priceReductionCols, .isPriceReductionCols').attr('colspan','');
				}else{//不设置降价幅度
					$('.priceReduction').hide();
					$('.isPriceReductionCols').attr('colspan','3');
				}
			}
			$('.isPriceText').attr('colspan','1');
		}else{//不设置竞价起始价
			$(".rawPrice, .isPriceReduction").hide();
			$('.priceReductionCols, .isPriceReductionCols').attr('colspan','');
			$('.isPriceText').attr('colspan','3');
		}
	}else{
		$(".isPrices, .isPriceReduction").hide();
	}
	if (data.auctionType == 2 && data.outType == 1) {
		$(".third").hide();
		$(".thirds").hide();
		$(".Supplier").hide();
	} else if (data.auctionType == 2 && data.outType == 0) {
		$(".Supplier").show();
		$(".third").hide();
		$(".thirds").hide();
	} else if (data.auctionType == 3 && data.outType == 1) {
		$(".Supplier").hide();
		$(".thirds").show();
	} else if (data.auctionType == 3 && data.outType == 0) {
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}

	//当为清单报价时
	if (data.auctionType == 6 || data.auctionType == 7) {
		if (data.auctionModel == '1') {
			$('#typemsg').html('根据各供应商报价，推荐各分项最低报价的供应商分别中选，即可多家供应商中选（可议价）')
		} else if (data.auctionModel == '2') {
			$('#typemsg').html('① 根据各供应商报价，分别明确各项最低报价；② 按照各供应商总报价金额由低到高进行排序，按排序分别进行议价，若第1名同意以各项最低报价成交，则推荐第1名中选，并不再继续与其他供应商议价；若第1名不同意成交，则与第2名议价，若第2名同意成交，则推荐第2名中选，并不再继续与其他厂家议价；依次类推，直至确定候选供应商。③ 经议价，若各供应商均不同意以“各项最低报价”成交，则推荐总报价最低的供应商中选；④ 一家供应商中选。')
		} else if (data.auctionModel == '3') {
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

	} else {
		$(".auctionType_6").hide()
		$(".PackageDetailedList").show();
		$(".PackageDetailedLists").show();
		$(".detailed_list").hide()
		//		$("#tr_operation_table").hide()
		$(".auctionType_6_type").show();
	}
	getProjectPrice(packageData[obj].id, packageData[obj].projectId);
	
	//设备信息
	auctionPackageDetailed(packageData[obj].id)
	filesDataView(packageData[obj].id); //附件查询
	filesViews(packageData[obj].id, data.auctionType);
	
	/*start代理服务费*/
	if(data.projectServiceFee){
		var projectServiceFee = data.projectServiceFee;
		$("#agentBlock td").remove();
		var stHtml = '<td class="th_bg">采购代理服务费收取方式</td>'
    				+'<td><div id="collectType">'+(projectServiceFee.collectType==1?"标准累进制":(projectServiceFee.collectType==2?"其他":"固定金额"))+'</div></td>';
        if(projectServiceFee && projectServiceFee.collectType == 0){
        	stHtml += '<td class="th_bg">固定金额(元)</td>'
    				+'<td><div id="chargeMoney">'+projectServiceFee.chargeMoney +'</div></td>'
        } else if(projectServiceFee && projectServiceFee.collectType == 1){
        	if(projectServiceFee.isDiscount == 1){
        		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
        	} else {
				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient">'+projectServiceFee.discountCoefficient+'</div></td>'
        	}
        }else if(projectServiceFee && projectServiceFee.collectType == 2){
        	stHtml +='<td class="th_bg">收取说明</td>'
			+'<td><div id="collectRemark">'+(projectServiceFee.collectRemark ? projectServiceFee.collectRemark : '-')+'</div></td>'
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
		success: function (data) {
			if (data.success == true) {
				filesData = data.data
			}
		}
	});
	if (filesData.length > 7) {
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
			formatter: function (value, row, index) {
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
			width: '100px',
			align: "center",
			events: {
				'click .openAccessory': function (e, value, row, index) {
					var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					window.location.href = $.parserUrlForToken(url);
				}
			},
			formatter: function (value, row, index) {
				return '<button type="button" class="btn btn-sm btn-primary openAccessory">下载</button>'
			}
		},
		]
	});
	$('#filesData').bootstrapTable("load", filesData);
};

//清单附件信息列表
function filesViews(uid, actype) {
	var model = '';
	if (actype == 7) {
		model = 'JJ_AUCTION_SINGLE_OFFERES';
	} else if (actype == 6) {
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
		success: function (data) {
			if (data.success == true) {
				filesDataDetail = data.data;
				if (filesDataDetail && filesDataDetail.length > 0) {
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
	
	var url = config.FileHost + "/FileController/download.do" + "?fname=" + filesDataDetail[0].fileName + "&ftpPath=" + filesDataDetail[0].filePath;
	window.location.href = $.parserUrlForToken(url);
})


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
		success: function (data) {
			packagePrice = data.data;
			if (packagePrice.length > 0) {
				for (var i = 0; i < packagePrice.length; i++) {
					if (packagePrice[i].priceName == '项目保证金') {
						if (packagePrice[i].payMethod == 0) {
							$('.DepositPriceShow').hide();
							$("#payMethod").html('虚拟子账号');
							$('.type_offline').show();
							$("#bankType").html(packagePrice[i].bankType == 1 ? "工商银行" : packagePrice[i].bankType == 2? "招商银行":'');
						} else {
							$('.DepositPriceShow').show();
							$('.type_offline').hide();
							$("#payMethod").html('指定账号');
							if (packagePrice[i].agentType == 0) {
								$("#agentType").html("平台")
							}
							if (packagePrice[i].agentType == 1) {
								$("#agentType").html("代理机构")
							}
							if (packagePrice[i].agentType == 2) {
								$("#agentType").html("采购人")
							}
							$("#bankAccount").html(packagePrice[i].bankAccount);
							$("#bankName").html(packagePrice[i].bankName);
							$("#bankNumber").html(packagePrice[i].bankNumber);
						}
						$("#price1").html(packagePrice[i].price);
					}
					if (packagePrice[i].priceName == '竞价采购文件费') {
						$("#price2").html(packagePrice[i].price);
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
		success: function (data) {
			if (data.success) {
				checkListData = data.data
			}
		}
	});
	if (checkListData.length > 7) {
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
			title: "材料设备名称",
			align: "left",
			halign: "left",

		},
		{
			field: "brand",
			title: "品牌要求",
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
			title: "备注",
			halign: "left",
			align: "left",
		}
		]
	});
	$('#PackageDetailedList').bootstrapTable("load", checkListData);
}
//邀请供应商
function add_supplier() {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if (NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法追加供应商');
		return;
	};
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '追加邀请供应商'
		, area: ['1100px', '600px']
		, content: addsupplier
		, success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.du(purchaseaData.isPublic, projectDataID, purchaseaData.purchaserId, purchaseaData.supplierClassifyCode, 'true');
		}
	});
}
//当有邀请供应商的时候显示邀请供应商的列表
function Publics() {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if (NewDate(purchaseaData.noticeEndDate) > NewDate(PublicnowDate)) {
		$(".addSupplier").show();
		$(".sendMsg").show();
	};
	Publicid = [];
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + "/ProjectSupplierController/findProjectSupplierList.do",
		async: false,
		data: {
			'projectId': projectDataID,
			'tenderType': 1
		},
		success: function (resx) {
			if (resx.success) {
				publicData = resx.data
				for (var i = 0; i < publicData.length; i++) {
					Publicid.push(publicData[i].supplierId);
				};
				sessionStorage.setItem('keysjd', JSON.stringify(Publicid)); //邀请供应商的id缓存    				
			}
		}
	});
	if (publicData.length > 7) {
		var height = "304"
	} else {
		var height = ""
	}
	var RenameData = getBidderRenameData(projectDataID);//投标人更名信息
	$('#tableList').bootstrapTable({
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
			field: "enterprise.enterpriseName",
			title: "企业名称",
			align: "left",
			halign: "left",
			formatter: function (value, row, index) {
				if (row.isAppend == 1) {
					var isAccept = "<div>" + showBidderRenameList(row.supplierId, value, RenameData, 'body') + "<span class='text-danger'>(追加)</span></div>"
				} else {
					var isAccept = "<div>" + showBidderRenameList(row.supplierId, value, RenameData, 'body') + "</div>"
				}
				return isAccept
			}
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
			formatter: function (value, row, index) {
				if (row.enterprise.enterpriseLevel == 0) {
					var enterpriseLevel = "未认证"
				};
				if (row.enterprise.enterpriseLevel == 1) {
					var enterpriseLevel = "提交认证"
				};
				if (row.enterprise.enterpriseLevel == 2) {
					var enterpriseLevel = "受理认证"
				};
				if (row.enterprise.enterpriseLevel == 3) {
					var enterpriseLevel = "已认证"
				};
				if (row.enterprise.enterpriseLevel == 4) {
					var enterpriseLevel = "已认证"
				};
				return enterpriseLevel
			}
		}, {
			field: "isAccept",
			title: "确认状态",
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				if (value == 0) {
					var isAccept = "<div class='text-success' style='font-weight:bold'>接受</div>"
				} else if (value == 1) {
					var isAccept = "<div class='text-danger' style='font-weight:bold'>拒绝</div>"
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
			formatter: function (value, row, index) {
				var Tdr = '<div class="btn-group">'
				Tdr += '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier(' + index + ')">查看</a>'
				if (row.isAccept != 0 && row.isAccept != 1 && !$('#tableList').hasClass('tableOfJD')) {
					if (NewDate(purchaseaData.noticeEndDate) > NewDate(PublicnowDate)) {
						Tdr += '<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"' + row.id + '\","' + index + '")>删除</a>'
					};
				}
				Tdr += '</div>'
				return Tdr
			}
		}
		]
	});

	$('#tableList').bootstrapTable("load", publicData); //重载数据
	$("#fixed-table-loading").hide();
};
//删除供应商
function supplierDelet(uid) {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if (NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法删除');
		return;
	};
	parent.layer.confirm('确定要删除该供应商', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			type: "get",
			url: top.config.AuctionHost + "/ProjectSupplierController/deleteProjectSupplier.do",
			async: false,
			data: {
				'id': uid
			},
			success: function (res) {
				if (res.success) {
					Publics();
					parent.layer.close(index);
				} else {
					parent.layer.alert(res.message);
					parent.layer.close(index);
				}
			}
		});
	}, function (index) {
		parent.layer.close(index)
	});
};
//查看邀请供应商信息
function viewSupplier(i) {
	var rowData = $('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '查看'
		, area: ['700px', '500px']
		, content: viewSupplierUrl
		, success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
			iframeWind.du(rowData[i])//弹出框弹出时初始化     	
		}

	});
};
//追加供应商发送短信
$(".sendMsg").on('click', function () {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if (NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法发送短信');
		return;
	};
	parent.layer.confirm('是否确认发送短信', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			type: "get",
			url: top.config.AuctionHost + "/ProjectSupplierController/sendMsgProjectSupplier.do",
			async: false,
			data: {
				'projectId': projectDataID,
				'tenderType': 1
			},
			success: function (res) {
				if (res.success) {
					parent.layer.alert('短信发送成功')
					Publics();
				} else {
					parent.layer.alert(res.message)
				}
				parent.layer.close(index)
			}
		});
	}, function (index) {
		parent.layer.close(index)
	});
})
function auctionType_4(obj) {
	if (auctionOutTypeData.length > 0) {
		var strHtml = "";
		strHtml = '<tr>'
			+ '<td rowspan="' + (auctionOutTypeData.length + 4) + '" class="th_bg">淘汰方式</td>'
			+ '<td style="text-align: left;" colspan="4">'
			+ '(1)、首轮报价供应商数' + (auctionOutTypeData[0].countType == 0 ? '大于等于' : '大于') + auctionOutTypeData[0].countValue + '家时，'
			+ '每轮淘汰' + auctionOutTypeData[0].outValue + '家供应商；'
			+ '<span style="' + (auctionOutTypeData[0].countValue == 0 ? '' : 'display:none') + '">，每轮至少保留' + auctionOutTypeData[0].keepValue + '家供应商；</span>'
			+ '</td>'
			+ '</tr>'
		if (auctionOutTypeData.length > 2) {
			for (var i = 1; i < auctionOutTypeData.length - 1; i++) {
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
		if (auctionOutTypeData[0].countValue != 0 && auctionOutTypeData[0].countValue != undefined) {
			strHtml += '<tr>'
			strHtml += '<td style="text-align: left;" colspan="4">'
			if (auctionOutTypeData.length > 2) {
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

function NewDate(str) {
	if (!str) {
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

//原项目保证金转移到本项目
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:1,
		parameter:{//接口调用的基本参数
			projectId:projectDataID,
			projectForm:1,
		},
		packageData:[
			{
				projectId:projectDataID, 
				projectForm:1
			}
		]
	})
};
/* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, purchaseaData.bidValue1)
});