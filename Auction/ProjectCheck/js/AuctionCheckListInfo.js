WORKFLOWTYPE = "xmgg"; //申明项目公告类型
var id = $.query.get("key"); //主键id 项目id
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var packageData = ""; //包件的数据容器
var publicData = ""; //邀请供应商数据的容器
var DetailedData = ""; //设备信息的数据容器
var projectSupplements = [];
var auctionTypes;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var filesData = [];
var filesDataDetail = []; //附件上传清单的数组
//项目信息查询
var urlfindAutionPurchaseInfo = top.config.AuctionHost + "/ProjectReviewController/findAutionPurchaseInfo.do";
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var packagePrice = []; //费用信息
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var auctionOutTypeData = [] //不限轮次淘汰方式
var typeShow;
var showPrice;
var projectSource;
var isDfcm = false;//是否传媒自主采购项目
//初始化
$(function () {

	if (edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核内容
	}

	//查询审核等级和审核人	
	findWorkflowCheckerAndAccp(id);
	//包件信息
	Purchase(id);
})

//查询项目信息
function Purchase(data) {
	$.ajax({
		url: urlfindAutionPurchaseInfo,
		type: 'get',
		dataType: 'json',
		data: {
			"projectId": data
		},
		async: false,
		success: function (result) {

			purchaseaData = result.data;
			projectSource=purchaseaData.project[0].projectSource;
			//邀请供应商的数据
			publicData = purchaseaData.projectSupplier;
			if (purchaseaData.autionProjectPackage.length > 0) {
				//包件信息的数据
				packageData = purchaseaData.autionProjectPackage;

				//设备信息的数据
				DetailedData = purchaseaData.auctionPackageDetailed;
			};
			if (purchaseaData.projectSupplement.length > 0) { //存在补遗		
				for (var i = 0; i < purchaseaData.projectSupplement.length; i++) {
					if (purchaseaData.projectSupplement[i].checkState == 2) { //审核通过
						projectSupplements.push(purchaseaData.projectSupplement[i]);
					}
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
				disabled: true,
				// stage: 'xmgg',
				projectId: purchaseaData.projectId,
			})
		},
		error: function (data) {
			parent.layer.alert(data.message);
		}
	})
	Supplement(typeShow);
	//渲染公告的数据
	$('div[id]').each(function () {
		$(this).html(purchaseaData[this.id]);
		if (reg.test(purchaseaData[this.id])) {
			$(this).html(purchaseaData[this.id].substring(0, 16));
		}

	});
	$("#contents").html(purchaseaData.content)
	//渲染项目的数据
	$('div[id]').each(function () {
		$(this).html(purchaseaData.project[0][this.id]);
		if (reg.test(purchaseaData.project[0][this.id])) {
			$(this).html(purchaseaData.project[0][this.id].substring(0, 16));
		}
	});
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
	if (projectSupplements.length > 0) {
		$('div[id]').each(function () {
			$(this).html(projectSupplements[0][this.id]);
			if (reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}

		});
	}

	package()
	//当为0，1时不显示邀请供应商列表
	if (purchaseaData.isPublic > 1) {
		PublicDataList(purchaseaData.projectId)
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
	if (purchaseaData.project[0].isAgent == 0) {
		$('.agency').hide();
	} else {
		$('.agency').show()
		$('.noTax').hide();
	}
	if(sysEnterpriseId&&projectSource==1){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			getDeposit();
		}
	}
}
//包件的按钮
function package() {
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
	setPackageInfo(0);
	showPrice = packageData[0].budgetIsShow;
}

//根据按钮显示的包件信息
function setPackageInfo(obj, thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary')
	var data = packageData[obj];
	showPrice = data.budgetIsShow
	//	公告信息
	Supplement(data.auctionType);
	$('div[id]').each(function () {
		$(this).html(purchaseaData[this.id]);
		if (reg.test(purchaseaData[this.id])) {
			$(this).html(purchaseaData[this.id].substring(0, 16));
		}

	});
	auctionOutTypeData = [];
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
		$('#maxAuctionTimeBox').show();
		$("#maxAuctionTime").html(data.maxAuctionTime);
		$("#timeLimits").show();
		$("#timeLimit").html(data.timeLimit);
		/* if (data.auctionModel == 0 && data.isPrice == 0) {
			$(".isPriceM").show();
			$(".isPrices").show();
			$(".isPriceH").show();
			$(".isPriceL").attr('colspan', '');
		} else {
			$(".isPriceM").hide();
			$(".isPrices").hide();
			$(".isPriceH").hide();
			$(".isPriceL").attr('colspan', '3');
		}; */

	} else if (data.auctionType == 1) {
		$('#maxAuctionTimeBox').hide();
		$("#timeLimits").hide();
		
	} else {
		$('#maxAuctionTimeBox').hide();
		
	};
	//当为多轮竞卖2轮时
	if (data.auctionType == 2) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
		$(".startPrice").show();
		
		//当为多轮竞卖3轮时
	} else if (data.auctionType == 3) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$(".auctionType_4").hide();
		$(".startPrice").show();
		$("#outSupplierd").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

	} else {
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
		$(".auctionType_4").hide();
		$(".startPrice").hide();
	};
	if (data.auctionType == 4) {
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").show();
		$("#outSupplierf").html(packageData[obj].outSupplier == 0 ? '按实际报价供应商数淘汰' : '按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier == 0 ? '是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价高的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；' : '是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价高的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
		$(".startPrice").show();
		auctionType_4(obj)
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
		$("#tbList").hide();
		//		$(".PackageDetailedLists").hide();
		$(".auctionType_6").show();
		$("#priceNum").hide();
		$("#priceNums").hide();

		//		$(".detailed_list").show()
		//		$("#tr_operation_table").show()
		$(".auctionType_6_type").hide()

	} else {
		$(".auctionType_6").hide();
		$("#priceNum").show();
		$("#priceNums").show();
		//		$(".detailed_list").hide()
		//		$("#tr_operation_table").hide()
		$(".auctionType_6_type").show()
		$("#tbList").show();
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
	/*
	** 1、自由竞价-按包件-设置竞价起始价
	** 2、多轮竞价/不限轮次-设置竞价起始价-设置降价幅度
	 */
	$('#isPriceReduction').html((data.isPriceReduction == 1)?'否':'是');
	if((data.auctionType == 4 || data.auctionType == 2 || data.auctionType == 3) || (data.auctionType == 0 && data.auctionModel == 0)){
		$('.isPrices').show();
		if(data.isPrice == 0){//设置竞价起始价
			$('.isPriceText').attr('colspan','1');
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
		}else{//不设置竞价起始价
			$(".rawPrice, .isPriceReduction").hide();
			$('.priceReductionCols, .isPriceReductionCols').attr('colspan','');
			$('.isPriceText').attr('colspan','3');
		}
	}else{
		$(".isPrices, .isPriceReduction").hide();
	}
	//当淘汰方式设置为间隔中设置
	if (data.outType == 1) {
		$(".Supplier").hide();
		$(".none third Supplier").hide();
	};
	isDfcm = checkPurchaserAgent(packageData[obj].id);
	getProjectPrice(packageData[obj].id, packageData[obj].projectId);
	auctionPackageDetailed(packageData[obj].id)
	filesDataView(packageData[obj].id);
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
							$("#bankType").html(packagePrice[i].bankType == 1 ? "工商银行" : packagePrice[i].bankType == 2? "招商银行":'');
							$('.type_offline').show();
						} else {
							$('.DepositPriceShow').show();
							$("#payMethod").html('指定账号');
							$('.type_offline').hide();
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
//当有邀请供应商的时候显示邀请供应商的列表
function PublicDataList(RenameBisnisId) {
	if (publicData.length > 7) {
		var height = "304"
	} else {
		var height = ""
	}
	if(publicData.length>0){
		var RenameData = getBidderRenameData(RenameBisnisId);//投标人更名信息
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: "enterprise.enterpriseName",
			title: "企业名称",
			align: "left",
			halign: "left",
			formatter:function(value, row, index){									
				return showBidderRenameList(row.supplierId, value, RenameData, 'body')
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
			field: "isAcceptText",
			title: "确认状态",
			halign: "center",
			width: '100px',
			align: "center",
			formatter: function (value, row, index) {
				if (value == "接受") {
					var isAccept = "<div class='text-success' style='font-weight:bold'>" + value + "</div>"
				} else if (value == "拒绝") {
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
			formatter: function (value, row, index) {
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
					var newUrl = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					window.location.href = $.parserUrlForToken(newUrl);
				}
			},
			formatter: function (value, row, index) {
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
			console.log(data)
			if (data.success == true) {
				filesDataDetail = data.data;
				if (filesDataDetail && filesDataDetail.length > 0) {
					$("#fliesName").html(filesDataDetail[0].fileName);
					$(".openAccessorys").attr("data-id", uid);
				} else {
					$("#fliesName").html('');
					$("#fliesName").next().hide();
				}
			}
		}
	});
	if (filesData.length > 7) {
		var height = '304'
	} else {
		var height = ''
	}
	//	$('#detaillist_operation_table').bootstrapTable({
	//		pagination: false,
	//		undefinedText: "",
	//		height: height,
	//		columns: [{
	//				title: "序号",
	//				align: "center",
	//				halign: "center",
	//				width: "50px",
	//				formatter: function(value, row, index) {
	//					return index + 1;
	//				}
	//			},
	//			{
	//				field: "fileName",
	//				title: "文件名称",
	//				align: "left",
	//				halign: "left",
	//
	//			},
	//			{
	//				field: "fileSize",
	//				title: "文件大小",
	//				align: "center",
	//				halign: "center",
	//				width: '100px',
	//
	//			},
	//			{
	//				field: "#",
	//				title: "操作",
	//				halign: "center",
	//				width: '50px',
	//				align: "center",
	//				events: {
	//					'click .openAccessory': function(e, value, row, index) {
	//						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
	//						window.location.href = $.parserUrlForToken(url);
	//					}
	//				},
	//				formatter: function(value, row, index) {
	//					return '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
	//				}
	//			},
	//		]
	//	});
	//	$('#detaillist_operation_table').bootstrapTable("load", filesDataDetail);
};

$(".openAccessory").click(function () {
	//	if(showPrice=='0'){				
	//		var url = config.FileHost + "/FileController/qdjjExportDownload.do" + "?fname=" + filesDataDetail[0].fileName + "&ftpPath=" + filesDataDetail[0].filePath;
	//		window.location.href = $.parserUrlForToken(url);
	//	}else {
	//		var url = config.FileHost + "/FileController/download.do.do" + "?fname=" + filesDataDetail[0].fileName + "&ftpPath=" + filesDataDetail[0].filePath;
	//		window.location.href = $.parserUrlForToken(url);
	//	}
	var url = config.FileHost + "/FileController/download.do" + "?fname=" + filesDataDetail[0].fileName + "&ftpPath=" + filesDataDetail[0].filePath;
	window.location.href = $.parserUrlForToken(url);
})

//设备信息的数据
function auctionPackageDetailed(uid) {
	var data = []; //把包件ID相同的设备信息放到一个数组中，
	var tbodym = []
	for (var i = 0; i < DetailedData.length; i++) {
		if (DetailedData[i].packageId == uid) {
			data.push(DetailedData[i]) //把包件ID相同的设备信息放到一个数组中，			
		}
	}
	//包间设备信息表格初始化
	$("#PackageDetailedList").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
			title: '序号',
			width: "50px",
			halign: "center",
			align: "center",
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			halign: "center",
			align: "center",
			field: 'detailedName',
			title: isDfcm?"物料名称":"材料设备名称",
		}, {
			field: 'brand',
			halign: "center",
			align: "center",
			title: '品牌要求',
			visible: isDfcm?false:true,
		},
		{
			field: 'detailedVersion',
			halign: "center",
			align: "center",
			title: '型号规格'
		},{
			field: "technology",
			title: "材料工艺",
			halign: "center",
			visible: isDfcm?true:false,
			width: '100px',
			align: "center",

		},
		{
			field: 'detailedCount',
			halign: "center",
			align: "center",
			title: '数量'
		},
		{
			field: 'detailedUnit',
			halign: "center",
			align: "center",
			title: '单位'
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
			field: 'budget',
			halign: "center",
			align: "center",
			title: '采购预算(元)'
		}, {
			field: 'detailedContent',
			halign: "center",
			align: "center",
			title: isDfcm?"补充说明":"备注",
		}
		]
	})
	$("#PackageDetailedList").bootstrapTable("load", data);
}

function viewSupplier(i) {
	parent.layer.open({
		type: 2, //此处以iframe举例
		title: '查看',
		area: ['650px', '400px'],
		maxmin: false,
		resize: false,
		content: "bidPrice/ProjectCheck/modal/viewSupplier.html",
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow; //获取包件弹出框整个对象
			iframeWind.du(publicData[i]) //弹出框弹出时初始化     	
		}
	});
}

function auctionType_4(obj) {
	if (auctionOutTypeData.length > 0) {
		var strHtml = "";
		strHtml = '<tr>' +
			'<td rowspan="' + (auctionOutTypeData.length + 4) + '" class="th_bg">淘汰方式</td>' +
			'<td style="text-align: left;" colspan="4">' +
			'(1)、首轮报价供应商数' + (auctionOutTypeData[0].countType == 0 ? '大于等于' : '大于') + auctionOutTypeData[0].countValue + '家时，' +
			'每轮淘汰' + auctionOutTypeData[0].outValue + '家供应商；' +
			'<span style="' + (auctionOutTypeData[0].countValue == 0 ? '' : 'display:none') + '">，每轮至少保留' + auctionOutTypeData[0].keepValue + '家供应商；</span>' +
			'</td>' +
			'</tr>'
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
/*
	修改人：金
	修改时间：2020-12-02
	修改内容：原项目保证金转移到本项目

*/
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:1,
		parameter:{//接口调用的基本参数
			projectId:purchaseaData.projectId,
			projectForm:1,
		},
		packageData:[
			{
				projectId:purchaseaData.projectId, 
				projectForm:1
			}
		]
	})
}
/*=====END原项目保证金转移到本项目===== */