var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var urlHistoryInfo = "Auction/Auction/Purchase/AuctionProjectPackage/model/detailItemSupplier.html";
//报价列表
var urlsupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getAllAuctionOfferList.do";
var btnStatusUrl = top.config.AuctionHost + "/BidNoticeController/getBidNoticeByPackageId.do";
var suppUrl = top.config.AuctionHost + "/AuctionSfcOfferController/vilidateOfferResult.do" //判断是否有供应商报价
var bargainSta = top.config.AuctionHost + "/AuctionSfcOfferController/getSfcOfferesBargainResult.do" //判断是议价状态
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var saveNoBargain = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/saveNoBargain.do" //无需议价直接提交
var urlbargainList = top.config.AuctionHost + "/AuctionSfcOfferController/getAuctionOfferesPageList.do" //议价信息列表
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
//清单竞价按明细 查询可议价的所有供应商信息 modify by H
var getSupplierBargainUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getMXAllSupplieres.do";
var vilidateIsSubmitUrl = top.config.AuctionHost + "/AuctionSfcOfferController/vilidateIsSubmit.do"; //提交按钮状态
//供应商
var getSupplierUrl
var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
var type = getUrlParam("type");
var tType = getUrlParam("tType");
var createType = getUrlParam("createType");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];
var status; //业主代表审核状态
var itemState = "";
var AuctioningDetailedId = ""; //明细的id

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "psbg"; //申明项目公告类型
var isAgent = getUrlParam("isAgent");//是否代理项目

var detailedId = "";

var offerData = "";
var detaillist = []; //清单信息
var col; //表格列
var auctionModelType;
var bargainStatus;
var listData = []

var idArr = [];
var flag = true;
var suppId;
var barStatus;
var textTitleField = [];
var supplierId;
var supplierPrice = [];
var barginList = [];
var returnData = [];
var dataResult;
var auctionType;
var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
var total;
var pageSize;
var pageIndex;
var start;
var end;
var submitState; //提交状态，true已提交，false未提交
var sfcBarginStatus; //议价结果
var isDfcm = false;//是否东风传媒自主采购项目
var RenameData = {};//投标人更名信息
$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	vilidateIsSubmit();
	getOfferInfo();
	supplier();
	getTable();

	if(tType != null) {
		var result = JSON.parse(sessionStorage.getItem("auctionresult"));
		//		getMsg(result);
	}
	//竞价文件提交信息列表
	getOfferFileInfo(projectId);

	//WorkflowUrl();

	//	setPurchaseFileDownloadDetail(packageId);
	buyFileDetail(packageId); //购买文件记录
	if(isAgent == 1) {
		warnLists(packageId, 'jj', true,null,null,projectId,'1','1');
	}else{
		warnLists(packageId, 'jj', false,null,null,projectId,'1','1');
	}
	//	btnStatus();
	//	suppStatus();
	//导出
	$("#btnList").click(function() {
		var url = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/exportExcelBidResult.do" + "?packageId=" + packageId;
		//		var url = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/exportExcelBidResult.do";
		window.location.href = $.parserUrlForToken(url);
	});

});

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

function getModel(model) {

}
//议价状态
function btnStatus() {
	$.ajax({
		type: "POST",
		url: bargainSta,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				var dataResult = response.data
				var arr1 = [];
				var arr2 = []
				if(dataResult) {
					sessionStorage.setItem("bargainStatus", JSON.stringify(dataResult));
					initBargin();
					$("#tableListBar").show()
					$("#bargainList").show()
					for(var d = 0; d < dataResult.length; d++) {
						//						if (dataResult[d].sfcBarginStatus != '4') {
						//							tableBargain()
						//							$("#tableListBar").show()
						//							$("#bargainList").show()
						//						}
						if(dataResult[d].sfcBarginStatus != '3') {
							arr1.push(dataResult[d].sfcBarginStatus)
						} else {
							arr2.push(dataResult[d].sfcBarginStatus)
						}
						//						if(dataResult[d].sfcBarginStatus=='1'){						
						//							$("#btn_bargain").hide();
						//							$("#btn_noBargain").hide();
						//							return
						//						}
					}
					if(arr1.length > 0) {
						$("#btn_bargain").hide();
						$("#btn_noBargain").hide();
					}
					if(offerData.isStopCheck == 1){
						("#btn_bargain, #btn_noBargain").hide()
					}else{
						if(auctionModelType == '2' || auctionModelType == '1') {
							if(arr1.length == '0' && arr2.length > 0) {
								if(dataResult.length != returnData.length) {
									$("#btn_bargain").show();
									$("#btn_noBargain").hide()
								} else {
									$("#btn_bargain").hide();
									$("#btn_noBargain").hide();
								}
							}
						} else if(auctionModelType == '3') {
							//						if (arr1.length == 0 && arr2.length < returnData.length) {
							if(arr1.length == 0 && arr2.length == 0) {
								$("#btn_bargain").show();
								$("#btn_noBargain").hide();
							} else {
								$("#btn_bargain").hide();
								$("#btn_noBargain").hide();
							}
							// if(arr1.length=='0'&&arr2.length>0){
							// 	$("#btn_bargain").hide();
							// 	$("#btn_noBargain").hide();
							// }
							// if(arr2.length>0){
							// 	$("#btn_bargain").hide();
							// 	$("#btn_noBargain").hide();
							// }
						}
					}
					

				} else {
					sessionStorage.removeItem("bargainStatus");
				}

				//判断是否显示议价按钮
				if(auctionModelType == 1 && auctionType == 6) {
					getSupplierBargain(dataResult ? dataResult.length : 0);
				}

			}
		}
	})
}

//最低价供应商
function supplier() {
	$.ajax({
		type: "POST",
		url: findSupplierUrl,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				returnData = response.data
				if(returnData && returnData.length > 0) {
					supplierPrice = returnData
					initsuppTable();
					supplierId = returnData[0].supplierEnterpriseId

				} else {
					$("#btn_bargain").hide()
					$("#btn_noBargain").hide()
					initsuppTable();
				}

			}
		}
	})
}

//是否有供应商报价
function suppStatus() {
	$.ajax({
		type: "POST",
		url: suppUrl,
		//		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				if(response.data > 0) {

				} else {
					$("#supplierName").text("无供应商报价")
					$("#btn_bargain").hide()
					$("#btn_noBargain").hide()
				}

			}

		}
	})

}

function listTable() {
	if(returnData && returnData.length > 0) {
		col = [
			[{
					title: "序号",
					valign: "middle",
					align: "center",
					width: "50px",
					colspan: 1,
					rowspan: 2,
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "50px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						return index + 1;
					}
				},
				{
					field: "materialNum",
					title: "物料号",
					valign: "middle",
					align: "center",
					visible: isDfcm?false:true,
					colspan: 1,
					rowspan: 2,
					width: "140px",
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "140px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}

				},
				{
					field: "materialName",
					title: "名称",
					valign: "middle",
					title: isDfcm?"物料名称":"名称",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					width: "200px",
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}

				},
				{
					field: "materialModel",
					title: "规格型号",
					valign: "middle",
					align: "center",
					colspan: 1,
					rowspan: 2,
					width: "200px",
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}

				},
				{
					field: "workmanship",
					title: "材料工艺",
					valign: "middle",
					align: "center",
					visible: isDfcm?true:false,
					colspan: 1,
					rowspan: 2,
					width: "200px",
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				
				},
				{
					field: "brandOrOriginPlace",
					title: "品牌/产地",
					valign: "middle",
					visible: isDfcm?false:true,
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "200px",
					cellStyle: {
						css: {
							//						"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}

				},
				{
					field: "applyNum",
					title: "申请号",
					valign: "middle",
					visible: isDfcm?false:true,
					align: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "170px",
					cellStyle: {
						css: {
							//						"min-width": "170px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}

				},

				{
					field: "materialUnit",
					title: "单位",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "80px",
					cellStyle: {
						css: {
							//						"min-width": "80px",
							"white-space": "nowrap"
						}
					}

				},
				{
					field: "count",
					title: "数量",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "80px",
					cellStyle: {
						css: {
							//						"min-width": "80px",
							"white-space": "nowrap"
						}
					}

				},
				{
					field: "way",
					title: "方式",
					visible: isDfcm?true:false,
					align: "center",
					valign: "middle",
					colspan: 1,
					rowspan: 2,
					cellStyle: {
						css: {
							"white-space": "nowrap"
						}
					}
				},
				{
					field: "budgetPrice",
					title: "预算价",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return parseFloat(value)
						}

					}

				},
				{
					field: "deliveryDate",
					title: "要求交货期(订单后xx天)",
					valign: "middle",
					align: "center",
					visible: isDfcm?false:true,
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					/* formatter: function(value, row, index) {
						if(value) {
							return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");

						}
					} */
				},
				{
					field: "minPrice",
					title: "最低单价",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return '<span>' + parseFloat(value) + '</span>';
						}
					}
				},
				{
					field: "differencePrice",
					title: "差额(预算价-最低单价)",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: function(value, row, index) {
						//						var val = (isNaN(Number(row.budgetPrice) - Number(row.minPrice))) ? 0 : (Number(row.budgetPrice) - Number(row.minPrice));
						if(parseFloat(value) < 0) {
							return {
								css: {
									"white-space": "nowrap",
									"word-wrap": "break-word",
									"word-break": "break-all",
									"background": "red"
								}
							}
						} else {
							return {
								css: {
									"white-space": "nowrap",
									"word-wrap": "break-word",
									"word-break": "break-all"
								}
							}
						}
					},
					formatter: function(value, row, index) {
						return value ? parseFloat(value) : value;
						//						var val = (Number(row.budgetPrice) - Number(row.minPrice)).toFixed(2);
						//						return isNaN(val) ? "" : val;
					}
				},
				{
					field: "isBargain",
					title: "建议议价",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value == undefined) {
							return "";
						}
						if(value == '0') {
							return '<span>是</span>';
						} else {
							return '<span>否</span>';
						}
					}
				},

				{
					field: "bargainResult",
					title: "议价结果",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return '<span>' + parseFloat(value) + '</span>'
						}

					}
				},

				{
					field: "biddingPrice",
					title: "建议成交价",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					}
				},
				{
					field: "priceDefferences",
					title: "差价(预算价-建议成交价)",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return '<span>' + parseFloat(value) + '</span>';
						}
					}
				},
				{
					field: "priceDefferencesPercent",
					title: "差价%",
					valign: "middle",
					align: "center",
					colspan: 1,
					rowspan: 2,
					halign: "center",
					//				width: "120px",
					cellStyle: {
						css: {
							//						"min-width": "120px",
							"white-space": "nowrap"
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return parseFloat(value) + "%";
						}

					}

				}
			]
		];
		if(auctionModelType == 1 && $("#btn_bargain").is(":hidden") && isHasFail) {
			col[0].push({
				field: "isFailAuction",
				title: "&nbsp;竞价失败&nbsp;",
				valign: "middle",
				align: "center",
				colspan: 1,
				rowspan: 2,
				halign: "center",
				formatter: function(value, row, index) {
					if(Number(row.budgetPrice) - Number(row.minPrice) < 0) {
						if($("#btn_submit").is(":visible")) {
							if(value == 1) {
								return html = '<label><input type="checkbox" value="0" class="isFail">是</label>';
							} else {
								return html = '<label><input type="checkbox" checked="checked" value="0" class="isFail">是</label>';
							}
						}
						if(value == 1) {
							return "否";
						} else {
							return "是";
						}

					} else {
						return "";
					}
				}
			})
		}
	} else {
		col = [
			[{
					title: "序号",
					align: "center",
					halign: "center",
					width: "50px",
					formatter: function(value, row, index) {
						return index + 1;
					}
				},
				{
					field: "materialNum",
					title: "物料号",
					valign: "middle",
					visible: isDfcm?false:true,
					align: "center",
					width: "170px",
					cellStyle: {
						css: {
							"min-width": "170px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: "materialName",
					title: isDfcm?"物料名称":"名称",
					align: "center",
					halign: "center",
					width: "200px",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: "materialModel",
					title: "规格型号",
					align: "left",
					width: "200px",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: "workmanship",
					title: "材料工艺",
					valign: "middle",
					align: "center",
					visible: isDfcm?true:false,
					colspan: 1,
					rowspan: 2,
					width: "200px",
					class: "colstyle",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				
				},
				{
					field: "brandOrOriginPlace",
					title: "品牌/产地",
					align: "center",
					visible: isDfcm?false:true,
					halign: "center",
					width: "200px",
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: "applyNum",
					title: "申请号",
					visible: isDfcm?false:true,
					valign: "middle",
					align: "center",
					width: "170px",
					cellStyle: {
						css: {
							"min-width": "170px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: "materialUnit",
					title: "单位",
					align: "center",
					halign: "center",
					width: '100px'
				},
				{
					field: "count",
					title: "数量",
					align: "center",
					halign: "center",
					width: '80px',
					cellStyle: {
						css: {
							"min-width": "80px",
							"white-space": "nowrap"
						}
					}

				},
				{
					field: "way",
					title: "方式",
					visible: isDfcm?true:false,
					align: "center",
					valign: "middle",
					colspan: 1,
					rowspan: 2,
					cellStyle: {
						css: {
							"white-space": "nowrap"
						}
					}
				},
				{
					field: "budgetPrice",
					title: "预算价",
					align: "center",
					halign: "center",
					width: '100px'

				},
				{
					field: "deliveryDate",
					title: "要求交货期(订单后xx天)",
					align: "center",
					halign: "center",
					visible: isDfcm?false:true,
					width: "100px",
					cellStyle: {
						css: {
							"min-width": "100px",
							"white-space": "nowrap"
						}
					},
					/* formatter: function(value, row, index) {
						if(value) {
							return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");

						}

					} */

				},
				{
					field: "minPrice",
					title: "最低单价",
					align: "center",
					halign: "center",
					width: "90px",
					cellStyle: {
						css: {
							"min-width": "90px",
							"white-space": "nowrap"
						}
					}
				},
				{
					field: "differencePrice",
					title: "差额(预算价-最低单价)",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
					width: "120px",
					cellStyle: function(value, row, index) {
						//						var val = (isNaN(Number(row.budgetPrice) - Number(row.minPrice))) ? 0 : (Number(row.budgetPrice) - Number(row.minPrice));
						if(parseFloat(value) < 0) {
							return {
								css: {
									"min-width": "120px",
									"white-space": "nowrap",
									"word-wrap": "break-word",
									"word-break": "break-all",
									"background": "red"
								}
							}
						} else {
							return {
								css: {
									"min-width": "120px",
									"white-space": "nowrap",
									"word-wrap": "break-word",
									"word-break": "break-all"
								}
							}
						}
					},
					formatter: function(value, row, index) {
						return value ? parseFloat(value) : value;
						//						var val = (Number(row.budgetPrice) - Number(row.minPrice)).toFixed(2);
						//						return isNaN(val) ? "" : val;
					}
				},
				{
					field: "isBargain",
					title: "建议议价",
					align: "center",
					halign: "center",
					formatter: function(value, row, index) {
						if(value == undefined) {
							return "";
						}
						if(value == '0') {
							return '<span>是</span>';
						} else {
							return '<span>否</span>';
						}

					}

				},
				{
					field: "bargainResult",
					title: "议价结果",
					align: "center",
					halign: "center",
					width: "90px",
					cellStyle: function(value, row, index) {
						if(value) {
							return {
								css: {
									"min-width": "90px",
									"white-space": "nowrap"
								}
							}
						} else {
							return {}
						}
					}
				},
				{
					field: "biddingPrice",
					title: "建议成交价",
					align: "center",
					halign: "center",
					width: "90px",
					cellStyle: function(value, row, index) {
						if(value) {
							return {
								css: {
									"min-width": "90px",
									"white-space": "nowrap"
								}
							}
						} else {
							return {}
						}
					}
				},
				{
					field: "priceDefferences",
					title: "差价(预算价-建议成交价)",
					align: "center",
					halign: "center",
					width: "90px",
					cellStyle: function(value, row, index) {
						if(value) {
							return {
								css: {
									"min-width": "90px",
									"white-space": "nowrap"
								}
							}
						} else {
							return {}
						}
					}
				},
				{
					field: "priceDefferencesPercent",
					title: "差价%",
					align: "center",
					halign: "center",
					width: "90px",
					cellStyle: function(value, row, index) {
						if(value) {
							return {
								css: {
									"min-width": "90px",
									"white-space": "nowrap"
								}
							}
						} else {
							return {}
						}

					}

				}
				// {
				// 	field: "remark",
				// 	title: "备注",
				// 	align: "center",
				// 	halign: "center",
				// 	cellStyle: {
				// 		css: {
				// 			"width": "200px",
				// 			"white-space": "nowrap"
				// 		}
				// 	},

				// },
			]
		]
	}

}

//获取供应商
function getSupplier() {
	$.ajax({
		url: getSupplierUrl,
		type: "post",
		data: obj,
		//		async: false,
		success: function(data) {
			var result = data.data;
			setProjectTypeData(result)

		},
		error: function(data) {
			parent.layer.alert(data.message);
		}
	});
}

//供应商报价
function getTable() {
	$.ajax({
		url: urlsupplier,
		type: "post",
		async: false,
		data: {
			packageId: packageId,
		},
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = top.layer.msg('数据加载中', {
				icon: 0
			});
			//			msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
		},
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(res) {
			if(res.success) {
				isDfcm = checkPurchaserAgent(packageId);
				detaillist = res.data;
				if(detaillist && detaillist.length > 0) {
					var auctionSfcOfferes = [];
					var textVals = [];
					var isMinPrice = [];
					var objsss = [];

					for(var i = 0; i < detaillist.length; i++) {
						var unitPriceNum = 0;
						auctionSfcOfferes = detaillist[i].auctionSfcOfferItemList
						if(auctionSfcOfferes && auctionSfcOfferes.length > 0) {
							for(var c = 0; c < auctionSfcOfferes.length; c++) {
								for(var e = returnData.length - 1; e >= 0; e--) {
									if(returnData[e].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
										var priceTtotal = 'totalPrice' + e;
										var priceUnit = 'unitPrice' + e;
										var priceSId = 'supplierId' + e;
										var priceIsBid = 'isSamePrice' + e;
										var priceItemId = 'itemId' + e;
										// var remark = 'remark' + e;
										// var answerDeliveryDate = 'answerDeliveryDate' + e
										if(detaillist[i].id == auctionSfcOfferes[c].specificationId) {
											detaillist[i][priceTtotal] = auctionSfcOfferes[c].noTaxRateTotalPrice;
											detaillist[i][priceUnit] = auctionSfcOfferes[c].noTaxRateUnitPrice;
											detaillist[i][priceSId] = auctionSfcOfferes[c].supplierEnterpriseId;
											detaillist[i][priceItemId] = auctionSfcOfferes[c].id;
											detaillist[i][priceIsBid] = auctionSfcOfferes[c].isSamePrice == 0 ? 0 : 1;
											// detaillist[i][remark] = auctionSfcOfferes[c].remark;
											// detaillist[i][answerDeliveryDate] = auctionSfcOfferes[c].answerDeliveryDate
										}
										if(auctionSfcOfferes[c].noTaxRateUnitPrice == detaillist[i].minPrice) {
											unitPriceNum++;
										}
									}
								}
								//供应商报价
								//								textVals.push({
								//									'taxRateTotalPrice': auctionSfcOfferes[c].noTaxRateTotalPrice,
								//									'noTaxRateUnitPrice': auctionSfcOfferes[c].noTaxRateUnitPrice,
								//									'purSpecificationId': auctionSfcOfferes[c].specificationId,
								//									'auctionSfcOfferesId': auctionSfcOfferes[c].id,
								//									'supplierEnterpriseId': auctionSfcOfferes[c].supplierEnterpriseId,
								//									'supplierEnterpriseName': auctionSfcOfferes[c].supplierEnterpriseName
								//								});
								//供应商
								//								if(textTitleField) {
								//									var result = false;
								//									for(var textIndex = 0; textIndex < textTitleField.length; textIndex++) {
								//										if(textTitleField[textIndex].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
								//											result = true;
								//										}
								//									}
								//									if(!result) {
								//										textTitleField.push({
								//											'supplierEnterpriseId': auctionSfcOfferes[c].supplierEnterpriseId,
								//											'supplierEnterpriseName': auctionSfcOfferes[c].supplierEnterpriseName
								//										});
								//									}
								//								}

							}

						}
						if(auctionModelType == 1) {
							if(unitPriceNum > 1) {
								isHasBid = true;
							}
							if(Number(detaillist[i].budgetPrice) - Number(detaillist[i].minPrice) < 0) {
								isHasFail = true;
							}
						}

					}
					btnStatus();
					if(true) {
						if(offerData.isStopCheck == 1){
							$("#btn_submit").hide(); 
						}else{
							if($("#btn_bargain").is(":hidden")) {
								getResultAuditsLive();
								if(isCheck) {
									$("#btn_submit").show();
								} else {
									if(submitState) {
										$("#btn_submit").hide();
									} else {
										$("#btn_submit").show();
									}
								}
								auditProcess();
								getResultAuditsUser();
							}
						}
						

					}
					listTable();

					//添加表格动态列及赋值
					if(returnData && returnData.length > 0) {
						for(var e = returnData.length - 1; e >= 0; e--) {
							var obj1 = {
								field: 'totalPrice' + e,
								title: '不含税总价(' + returnData[e].noTaxRateTotalPrice + ')',
								valign: "middle",
								align: "center",
								//								width: "130px",
								cellStyle: {
									css: {
										"background": '#fff',
										//										"min-width": "130px",
										"word-wrap": "break-word",
										"word-break": "break-all",
										"white-space": "normal"
									}
								},
								formatter: function(value, row, index) {
									if(value) {
										return parseFloat(value)
									}
								}

							};
							var obj2 = {
								field: 'unitPrice' + e,
								title: '不含税单价',
								valign: "middle",
								align: "center",
								//								width: "120px",
								cellStyle: addStyle2,
								formatter: function(value, row, index) {
									if(value) {
										return parseFloat(value)
									}
								}

							};
							var obj3 = {
								field: 'unitPrice' + e,
								title: '是否中选',
								valign: "middle",
								class: e,
								formatter: function(value, row, index, field) {
									if(value == undefined) {
										return "";
									}
									var unitPriceNum = 0;
									for(var m = 0; m < returnData.length; m++) {
										if(row["unitPrice" + m] == row.minPrice) {
											unitPriceNum++;
										}
									}
									var html = "";
									if(unitPriceNum > 1 && value == row.minPrice) {
										var idx = field.substring(9);
										if($("#btn_submit").is(":visible")) {
											var isShow = "";
											if(Number(row.budgetPrice) - Number(row.minPrice) < 0 && (row.isFailAuction == 0 || row.isFailAuction == undefined)) {
												isShow = " style='display:none'";
											}

											if(row["isSamePrice" + idx] == 0) {
												html = '<label' + isShow + ' data-id="' + row["itemId" + idx] + '"><input type="radio" checked="checked" name="isBid' + index + '">中选</label>';
											} else {
												html = '<label' + isShow + ' data-id="' + row["itemId" + idx] + '"><input type="radio" name="isBid' + index + '">中选</label>';
											}
										} else {
											if(row["isSamePrice" + idx] == 0) {
												html = "中选";
											}
										}
									}
									return html;
								}
							}
							// var obj3 = {
							// 	field: 'answerDeliveryDate' + e,
							// 	title: '响应交货期',
							// 	valign: "middle",
							// 	align: "center",
							// 	cellStyle: {
							// 		css: {
							// 			"min-width": "120px",
							// 			"white-space": "nowrap"
							// 		}
							// 	},
							// 	formatter: function(value, row, index) {
							// 		if(value) {
							// 			return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");

							// 		} 

							// 	}

							// }
							// var obj4 = {
							// 	field: 'remark' + e,
							// 	title: '备注',
							// 	valign: "middle",
							// 	align: "center",
							// 	cellStyle: {
							// 		css: {
							// 			"min-width": "150px",
							// 			"white-space": "nowrap"
							// 		}
							// 	},

							// }
							var obj = {
								"title": returnData[e].supplierEnterpriseName,
								"field": 'supplier' + e,
								"valign": "middle",
								"align": "center",
								"colspan": ($("#btn_bargain").is(":hidden") && (isHasFail || isHasBid) ? 3 : 2),
								"rowspan": 1

							};
							// objsss.splice(0,0,obj2, obj1,obj3,obj4)
							if(auctionModelType == 1) {
								if($("#btn_bargain").is(":hidden") && (isHasFail || isHasBid)) {
									objsss.splice(0, 0, obj2, obj1, obj3);
								} else {
									objsss.splice(0, 0, obj2, obj1);
								}
								//objsss.splice(0, 0, obj2, obj1, obj3);
							} else {
								objsss.splice(0, 0, obj2, obj1);
							};
							if(isDfcm){
								col[0].splice(11, 0, obj);
							}else{
								col[0].splice(10, 0, obj);
							}
							
							//						for(var n = 0; n < textVals.length; n++) {
							//							if(returnData[e].supplierEnterpriseId == textVals[n].supplierEnterpriseId) {
							//								var priceTtotal = 'totalPrice' + e;
							//								var priceUnit = 'unitPrice' + e
							//								for(var o = 0; o < detaillist.length; o++) {
							//									if(detaillist[o].id == textVals[n].purSpecificationId) {
							//										detaillist[o][priceTtotal] = textVals[n].taxRateTotalPrice;
							//										detaillist[o][priceUnit] = textVals[n].noTaxRateUnitPrice
							//									}
							//								}
							//							}
							//						}

						}
					}
					//					for(var e = 0; e < returnData.length; e++) {
					//						var obj = {
					//							"title": returnData[e].supplierEnterpriseName,
					//							"field": 'supplier' + e,
					//							"valign": "middle",
					//							"align": "center",
					//							"colspan": 2,
					//							"rowspan": 1
					//
					//						}
					//
					//						var objss = {
					//							field: 'totalPrice' + e,
					//							title: '不含税总价',
					//							valign: "middle",
					//							align: "center",
					//							cellStyle: addStyle1
					//
					//						}
					//						var objs = {
					//							field: 'unitPrice' + e,
					//							title: '不含税单价',
					//							valign: "middle",
					//							align: "center",
					//							cellStyle: {
					//								css: {
					//
					//									"min-width": "200px",
					//									"word-wrap": "break-word",
					//									"word-break": "break-all",
					//									"white-space": "normal"
					//								}
					//
					//							}
					//
					//						}
					//
					//						objsss.push(objs, objss)
					//						col[0].splice(6, 0, obj);
					//						console.log(col.sort())
					//						for(var n = 0; n < textVals.length; n++) {
					//							if(returnData[e].supplierEnterpriseId == textVals[n].supplierEnterpriseId) {
					//								var fields = 'supplier' + e;
					//								var priceTtotal = 'totalPrice' + e;
					//								var priceUnit = 'unitPrice' + e
					//								for(var o = 0; o < detaillist.length; o++) {
					//									if(detaillist[o].id == textVals[n].purSpecificationId) {
					//										detaillist[o][priceTtotal] = textVals[n].taxRateTotalPrice;
					//										detaillist[o][priceUnit] = textVals[n].noTaxRateUnitPrice
					//									}
					//								}
					//							}
					//						}
					//
					//					}
					col.splice(1, 0, objsss)

					if(detaillist.length < 2500) {

						listData = detaillist;
						initTable();
						$('#detailPackageList').bootstrapTable("load", listData);
					} else {
						total = detaillist.length;
						pageSize = Math.ceil(total / 100)
						pageIndex = 1;
						start = (pageIndex - 1) * 100
						end = start + 100
						listData = detaillist.slice(start, end)
						initTable();
						$('#detailPackageList').bootstrapTable("load", listData);

					}

				}
			}

		},
		complete: function() {
			parent.layer.close(msgloading);

		}

	})

}

//报价最低的供应商添加颜色
function addStyle1(value, row, index) {
	if(parseFloat(value) <= parseFloat(row.minPrice)) {
		return {
			css: {
				"background": 'red',
				"min-width": "200px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		}
	} else {
		return {
			css: {
				"background": '#FFF',
				"min-width": "200px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		}
	}

}

//报价最低的供应商添加颜色
function addStyle2(value, row, index) {
	if(parseFloat(value) <= parseFloat(row.minPrice)) {
		return {
			css: {
				"background": '#009100',
				//				"min-width": "120px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		}
	} else {
		return {
			css: {
				"background": '#FFF',
				"min-width": "120px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		}
	}

}

//报价明细表格初始化
function initTable() {
	if(detaillist.length > 9) {
		var height = "400"
	} else {
		var height = ""
	}

	$('#detailPackageList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: col,
		height: height,
		onAll: function() {
			if(detaillist.length > 2500) {
				$("#detailPackageList").parent(".fixed-table-body").scroll(function(event) {
					var y = $(this).scrollTop()
					var wScrollY = y; // 当前滚动条位置  
					var wInnerH = $(this)[0].clientHeight; // 设备窗口的高度（不会变）  
					var bScrollH = $(this)[0].scrollHeight; // 滚动条总高度 
					var LockMore = false;
					if((wScrollY + wInnerH) + 50 >= bScrollH) {
						//触底							
						if(pageIndex >= pageSize) {
							// 滚动太快，下标超过了数组的长度
							pageIndex = pageSize
							return;
						} else {
							pageIndex++
							start = (pageIndex - 1) * 100
							end = start + 100;
							var listTable1 = detaillist.slice(start, end)
							$('#detailPackageList').bootstrapTable("append", listTable1);
						}

						if(LockMore) {
							return false;
						}
					}

				})
			}
		},
		onPostBody: function() {
			var header = $(".fixed-table-header table thead tr th");
			var body = $(".fixed-table-body table thead tr th");
			var footer = $(".fixed-table-footer table thead tr th");
			body.each(function(index, item) {
				// console.log($(item).width());
				header.width($(item).width());
				footer.width($(item).width());
			});
			//重点就在这里，获取渲染后的数据列td的宽度赋值给对应头部的th,这样就表头和列就对齐了
			//			var header=$(".fixed-table-header table thead tr th");
			//			var body=$(".fixed-table-body table thead tr th");
			////			var footer=$(".fixed-table-header table tr td");
			//			body.each(function(){
			//				header.width($(this).width());
			////				footer.width($(this).width());
			//			});
		}
	});
	//	$('#detailPackageList').bootstrapTable("load", detaillist);

};

//供应商报价
function initsuppTable() {
	$('#supplPackageList').bootstrapTable({
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
			},
			{
				field: "supplierEnterpriseName",
				title: "供应商名称",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
				}

			},
			{
				field: "noTaxRateTotalPrice",
				title: "不含税总价",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "190px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value, row, index) {
					if(value) {
						return parseFloat(value)
					}
				}

			},
			{
				field: "priceDefferences",
				title: "差价（预算价-不含税总价）",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "190px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "priceDefferencesPercent",
				title: "差价比例（差价/预算价）",
				align: "center",
				halign: "center",
				formatter: function(value, row, index) {
					if(value) {
						return parseFloat(value) + "%"
					}
				},
				cellStyle: {
					css: {
						"width": "190px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}
			},
			{
				field: "offerTime",
				title: "报价时间",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "180px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "nowarp"
					}
				}
			},
			{
				field: "",
				title: "项目清单报价文件",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "nowarp"
					}
				},
				formatter: function(value, row, index) {
					var filesName;
					var filesPath;
					var timeArr = []
					$.ajax({
						type: "get",
						url: getImgListUrl,
						async: false,
						data: {
							'modelId': packageId,
							'modelName': "JJ_AUCTION_SFC_OFFER",
							'employeeId': row.employeeId

						},
						datatype: 'json',
						success: function(data) {
							var flieData = data.data
							if(data.success == true) {
								if(flieData.length == 1) {
									filesName = flieData[0].fileName
									filesPath = flieData[0].filePath

								} else {
									for(var e = 0; e < flieData.length; e++) {
										//									var subDate = new Date(flieData[e].subDate).getTime() / 1000;
										var subDate = Date.parse(new Date(flieData[e].subDate.replace(/\-/g, "/")));
										timeArr.push({
											time: subDate,
											filesName: flieData[e].fileName,
											filesPath: flieData[e].filePath
										})
									}
									var max = timeArr[0].time
									for(var t = 0; t < timeArr.length; t++) {
										var cur = timeArr[t].time;
										cur > max ? max = cur : null
									}
									//									var maxTime = timestampToTime(max);								
									for(var e = 0; e < timeArr.length; e++) {
										if(max == timeArr[e].time) {
											filesName = timeArr[e].filesName
											filesPath = timeArr[e].filesPath

										}
									}

								}
							}
						}
					});

					var dols = '<a href="javascript:void(0)" id="fliesName" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'
					return dols

				},

			},
			{
				field: "",
				title: "盖章版报价文件及其他附件",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value, row, index) {
					var dowload;
					var filesName;
					var filesPath;
					var fileArr = {
						arr1: [],
						arr2: []
					};
					$.ajax({
						type: "get",
						url: getImgListUrl,
						async: false,
						data: {
							'modelId': packageId,
							'modelName': "JJ_AUCTION_SFC_SIGNATURE",
							'employeeId': row.employeeId

						},
						datatype: 'json',
						success: function(data) {
							var flieData = data.data;

							if(data.success == true) {
								if(flieData.length > 0) {
									fileArr.arr1 = data.data;

								}
							}
						}
					});
					$.ajax({
						type: "get",
						url: getImgListUrl,
						async: false,
						data: {
							'modelId': packageId,
							'modelName': "JJ_AUCTION_SFC_SIGNATURES",
							'employeeId': row.employeeId

						},
						datatype: 'json',
						success: function(data) {
							var flieData = data.data
							if(data.success == true) {
								if(flieData.length > 0) {
									fileArr.arr2 = data.data;

								}
							}
						}
					});
					var flieData = fileArr.arr1.concat(fileArr.arr2);
					for(var m = 0; m < flieData.length; m++) {
						if(flieData.length == 1) {
							filesName = flieData[0].fileName
							filesPath = flieData[0].filePath
							dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'

						} else {
							filesName = flieData[0].fileName
							filesPath = flieData[0].filePath
							dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>&nbsp;&nbsp;&nbsp;&nbsp;'
							for(var e = 1; e < flieData.length; e++) {
								filesName = flieData[e].fileName
								filesPath = flieData[e].filePath
								dowload += '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>&nbsp;&nbsp;&nbsp;&nbsp;'

							}
						}
					}
					return dowload

				},

			},
		]

	});
	$('#supplPackageList').bootstrapTable("load", supplierPrice);

};

function timestampToTime(timestamp) {
	var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var Y = date.getFullYear() + '-';
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	var D = date.getDate() + ' ';
	var h = date.getHours() + ':';
	var m = date.getMinutes() + ':';
	var s = "0" + date.getSeconds();
	if(s.length == 1) {

		var s = "0" + date.getSeconds();
	} else {
		var s = date.getSeconds();
	}
	return Y + M + D + h + m + s;
}
//下载附件
function openDowload(path, name) {
	if(name) {
		var url = config.FileHost + "/FileController/download.do" + "?fname=" + name + "&ftpPath=" + path;
		window.location.href = $.parserUrlForToken(url);
	} else {
		var url = config.FileHost + "/FileController/download.do" + "?fname=" + filesName + "&ftpPath=" + path;
		window.location.href = $.parserUrlForToken(url);
	}

}

function initBargin() {
	$.ajax({
		type: "POST",
		url: urlbargainList,
		data: {
			packageId: packageId,
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				barginList = response.data;
				tableBargain();

			}
		}
	})
}

//议价记录
function tableBargain() {
	$('#bargainList').bootstrapTable({
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
				field: "supplierEnterpriseName",
				title: "供应商名称",
				align: "left",
				cellStyle: {
					css: {
						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
				}

			},
			{
				field: "endTime",
				title: "议价截止时间",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "agreeOrNotTime",
				title: "供应商确认时间",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "sfcBarginStatus",
				title: "议价结果",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function(value, row, index) {
					console.log(value, row, index)
					switch(value) {
						case 0:
							return "<span style='color: red;'>落选供应商，无需议价</span>"
							break;
						case 1:
							return "<span >待确认</span>"
							break;
						case 2:
							return "<span style='color: green;'>已确认</span>"
							break;
						case 3:
							return "<span style='color: red;'>已拒绝</span>"
							break;
						case 4:
							return "<span>不议价</span>"
							break;

					}
				}

			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '160',
				formatter: function(value, row, index) {
					if(row.sfcBarginStatus == 0 || row.sfcBarginStatus == 4 || !row.sfcBarginStatus) {
						return "";
					} else {
						return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"
					}
				}
			}
		]
	});
	$("#bargainList").bootstrapTable("load", barginList);
}

function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		enterpriseType: '04', //0为采购人，1为供应商
		tenderType: 1, //0为询价采购，1为竞价采购，2为竞卖
		packageId: packageId

	};
	return QueryParams;
}
//查看议价明细
function checkDetail(packageId, type, index) {
	//	var row = $("bargainList").bootstrapTable('getRowByUniqueId', packageId);
	var rows = $("#bargainList").bootstrapTable('getData')[index];
	sfcBarginStatus = rows.sfcBarginStatus
	//	sessionStorage.setItem("bargainList", JSON.stringify(row));
	top.layer.open({
		type: 2,
		title: '查看清单议价',
		area: ['100%', '100%'],
		// maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Purchase/AuctionProjectPackage/model/bargainMsg.html?id=' + packageId + '&sfcSuppid=' + rows.supplierEnterpriseId + '&time=' + rows.endTime,
	});
}

//无需议价
$("#btn_noBargain").click(function() {
	parent.layer.confirm("确定不议价提交？", {
		icon: 3,
		title: '询问'
	}, function(index) {
		parent.layer.close(index);
		$.ajax({
			type: "POST",
			url: saveNoBargain,
			data: {
				packageId: packageId,
				supplierEnterpriseId: supplierId,
				sfcBarginStatus: '4',
				auctionType: auctionType,
				auctionModel: auctionModelType
			},
			dataType: 'json',
			error: function() {
				top.layer.alert("加载失败!");
			},
			success: function(response) {
				if(response.success) {
					$("#btn_bargain").hide();
					$("#btn_noBargain").hide();
					getTable();
					initTable();
					top.layer.alert("提交成功!");

				}
			}
		})

	})

})

//议价
$("#btn_bargain").click(function() {
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '议价',
		area: ['100%', '100%'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		id: "bargainIfram",
		// content: 'Auction/Auction/Agent/AuctionProjectPackage/model/bargain.html?id=' + packageId + '&type=' + auctionModelType + '&auctionType=' + auctionType+'&isDfcm='+isDfcm,
		content: 'Auction/Auction/Purchase/AuctionProjectPackage/model/bargain.html?id=' + packageId + '&type=' + auctionModelType + '&auctionType=' + auctionType+'&isDfcm='+isDfcm,
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function() {
				location.reload();
			});

		}
	});
})

function getMsg(obj) {
	if(offerData.isStopCheck == 1){
		$("#commitBtn, #btn_bargain, #btn_noBargain").hide();
	}else{
		if (type == 'commit') {
			//展示提交按钮
			$("#commitBtn").show();
		}
		if (createType != undefined && createType == 1) {
		
			$("#btn_bargain").hide()
			$("#btn_noBargain").hide()
		}
		status = obj.checkStatus;
		if (status == '未提交') {
			$("#commitBtn").show();
		}
	}
	if(status == '已提交审核' || status == '审核通过') {
		$('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
		$('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
		$('#roundRank').bootstrapTable('hideColumn', 'ccc');
		$(".modify").hide();
		$('.zzbj').attr('readonly', true);

		$("#commitBtn").hide();
		//$(".employee").hide();
	}


	if(obj.itemState != undefined) {
		itemState = obj.itemState;
		if(itemState == '1' || itemState == '2' || itemState == '4') {
			//发布公示  审核中  审核通过  无需审核
			$('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
			$('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
			$('#roundRank').bootstrapTable('hideColumn', 'ccc');
			$(".modify").hide();
			$('.zzbj').attr('readonly', true);
			$("#commitBtn").hide();
			//$(".employee").hide();
		}

	}

	if(status == '未提交' || status == '审核不通过' || (status == '无需审核' && (itemState == "" || itemState == 3))) {
		$('#freeDetailRank').bootstrapTable('hideColumn', 'editReason');
		$('#freePackageRank').bootstrapTable('hideColumn', 'editReason');
		$('#roundRank').bootstrapTable('hideColumn', 'editReason');
	}

	if(obj.eid != "" && obj.pid != "") {

		if(obj.eid != obj.pid) {
			$(".modify").hide();
			$('.zzbj').attr('readonly', true);
		}
	}
}

function getOfferInfo() {
	//getCheckList();
	$.ajax({
		url: urlViewAuctionInfo,
		data: {
			packageId: packageId,
			state: 1,
			tenderType: 1,
		},
		async: false,
		success: function(res) {
			if(res.success) {
				var data = res.data;
				offerData = data;
				auctionModelType = data.auctionModel;
				auctionType = data.auctionType
				getMsg(data)
				if(data.auctionModel == '1') {

					$("#btn_noBargain").hide();

					//					$("#btn_bargain").hide()
					//					$("#btn_noBargain").hide()

				}
				if(data.budgetPrice !== "" && data.budgetPrice != undefined) {
					$("#budgetPrices").show()
					$("#budgetPrice").html(data.budgetPrice + "元")
				}
				if(data.noTaxBudgetPrice !== "" && data.noTaxBudgetPrice != undefined) {

					$("#noTaxBudgetPrice").html(data.noTaxBudgetPrice + "元")
				}
				$("td[id]").each(function() {
					$(this).html(data[this.id]);

					//竞价方式
					if(this.id == "auctionType") {
						switch(data[this.id]) {
							case 0:
								$(this).html("自由竞价");
								break;
							case 1:
								$(this).html("单轮竞价");
								break;
							case 2:
								$(this).html("多轮竞价 2轮竞价");
								break;
							case 3:
								$(this).html("多轮竞价 3轮竞价");
								break;
							case 6:
								if(typeof(auctionModelType) == 'undefined') {
									$(this).html("清单竞价");
								} else {

									if(auctionModelType == '1') {
										var strs = "（按明细）"
									} else if(auctionModelType == '2') {
										var strs = "（按总价排序后议价）"
									} else if(auctionModelType == '3') {
										var strs = "（按总价最低中选）"
									}
									$(this).html("清单竞价" + strs);
								}
								break;
							default:
								$(this).html("不限轮次");
								break;
						}
					}
					if (this.id == 'projectName') {
						if (data.projectSource > 0) {
							$(this).html(data[this.id] + '<span class="red">(重新竞价)</span>');
						}
					}
				});
				//判断是否发布结果通知书0为未发布
				if(offerData.isStopCheck == 1){
					$("#detailItemSupplier,#againDetailItemSupplier ").hide();
				}else{
					if (offerData.isSendResult == 0) {
						if(offerData.isRecItemFile == 0) {
							$("#detailItemSupplier").show();
						} else {
							$("#againDetailItemSupplier").show();
						}
					}
				}
				if(data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					if(data.auctionModel == 0) { //按照包件

						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
						//	$("#detail").bootstrapTable("load",)	
					} else { //按照明细
						$(".detail").hide();

						$("#offerRecord").html("<div style='width:50%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRecord'></table></div>");

						//						freeDetailRecord();
						//						freeDetailRK();
						//						freeDetailRD();
					}
				} else {
					//多轮

					$("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
					//					roundRank();
					//					roundRecord();
					//					roundItem();
					//	$("#detail").bootstrapTable("load",)	
				}
				//是否需要业主代表确认及业主代表
				if(data.auctionSupervise.isSupervise == 1) {
					if(typeof(data.auctionSupervise.userName) != "undefined") {
						$("#employeeName").html(data.auctionSupervise.userName);
						$("#checkMes").show();
						$("#checkPerson").show();
						getCheckList();
					} else {
						$("#employeeName").html("未设置");
					}
				} else {
					$("#employeeName").html("无需业主代表");
				}
			}
		}
	});
}

function freeDetailRK() {
	$("#freeDetailRK").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if(offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
				$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
				detailedId = row.id;
				if(status == '已提交审核' || status == '审核通过') {
					$('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					$('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					$('#roundRank').bootstrapTable('hideColumn', 'ccc');
					$(".modify").hide();
					$('.zzbj').attr('readonly', true);
				}

				if(itemState == '1' || itemState == '2' || itemState == '4' || itemState == '3') {
					$('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					$('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					$('#roundRank').bootstrapTable('hideColumn', 'ccc');
					$(".modify").hide();
					$('.zzbj').attr('readonly', true);
				}

				if(isAgent) {
					if(isAgent == '1') {
						$(".modify").hide();
						$('.zzbj').attr('readonly', true);
					}
				}
			}
		},
		onClickCell: function(field, value, row, $element) {
			curField = 1;
			if(field !== "Status") {
				//执行代码
			}
		},
		onPostBody: function() {
			$("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						if(offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
							$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
							detailedId = row.id;
						}

						return true;
					}
				}
			},
			{
				field: 'detailedName',
				title: '商品名称',
			},
			{
				field: 'brand',
				title: '品牌要求',
			},
			{
				field: 'detailedVersion',
				title: '规格型号',
			},
			{
				field: 'detailedCount',
				title: '数量',
				align: 'center',

			},
			{
				field: 'detailedUnit',
				title: '单位',
				align: 'center',

			}
		]
	})

	$("#freeDetailRK").bootstrapTable("load", offerData.auctionPackageDetaileds);

}

//设置查询条件
function queryParams(params) {
	return {
		'projectId': projectId,
		'packageId': packageId,
	}
}

function getCheckList() {
	$("#checkList").bootstrapTable('destroy');
	//加载数据
	$("#checkList").bootstrapTable({
		url: findCheck,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: false, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		classes: 'table table-bordered', // Class样式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		silent: true, // 必须设置刷新事件
		striped: true,
		columns: [
			[{
					//field: 'Id',
					title: '序号',
					align: 'center',
					width: '50px',
					formatter: function(value, row, index) {
						return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				},
				{
					field: 'checkState',
					title: '审核状态',
					align: 'center',
					width: '160',
					formatter: function(value, row, index) {
						if(row.checkState == '0') {
							return "<span>无需审核</span>";
						} else if(row.checkState == '1') {
							return "<span>未提交</span>";
						} else if(row.checkState == '2') {
							return "<span>已提交</span>";
						} else if(row.checkState == '3') {
							return "<span>审核通过</span>";
						} else if(row.checkState == '4') {
							return "<span>审核未通过</span>";
						}

					}
				},
				{
					field: 'checkContent',
					title: '审核意见',
					align: 'left'

				},
				{
					field: 'userName',
					title: '审核人',
					align: 'center',
					width: '160'
				},
				{
					field: 'checkDate',
					title: '操作时间',
					align: 'center',
					width: '160'
				}
			]
		]
	});
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function commitMsg() {
	top.layer.confirm('你确定提交吗？', {
		btn: ['确定', '取消'] //按钮
	}, function() {
		var sup = {
			projectId: projectId,
			packageId: packageId,
			checkState: '2' //已提交
		}

		$.ajax({
			type: "post",
			url: urlSaveSupervise,
			data: sup,
			async: false,
			dataType: "json",
			success: function(ret) {
				if(ret.success) {
					parent.$('#OfferList').bootstrapTable('refresh');
					//					top.layer.closeAll();
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
					top.layer.alert("提交竞价采购情况成功")
				} else {
					parent.layer.alert("提交竞价采购情况失败！");
					return;
				}
			}
		});
	})
}
//关闭
$("#btn_close").click(function() {
	//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})

function getOfferFileInfo(projectId) {
	$.ajax({
		type: "get",
		url: top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do",
		dataType: 'json',
		data: {
			projectId: projectId,
			'stage':'submit'
		},
		async: true,
		success: function(result) {
			if(result.success) {
				loadAuctionFileCheckState(result.data);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

function loadAuctionFileCheckState(data) {

	$("#AuctionFileCheck").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "5%",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "enterpriseName",
				halign: "left",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				halign: "center",
				title: "竞价文件",
				cellStyle: {
					css: {
						"padding": "0px"
					}
				},
				formatter: function(value, row, index) {
					if( row.fileName){
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
						var html = "<table class='table' style='border-bottom:none'>";
						for(var j = 0; j < filePathArr.length; j++) {
							let filesnames = fileNameArr[j].substring(fileNameArr[j].lastIndexOf(".") + 1).toUpperCase()
							html += "<tr>";
							html += "<td>" + fileNameArr[j] + "</td>"
							html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
							if(filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
								html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
							}
							html += "</span></td></tr>";
						}
						html += "</table>";
						return html;
					}else{
						return '';
					}
				}
			},
			{
				title: "审核状态",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'>合格</div>";
					} else if(row.checkState == 0) {
						return "<div class='text-warning'>未审核</div>";
					} else {
						return "<div class='text-danger'>不合格</div>";
					}
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", data);
}

//预览文件
function previewFile(filePath) {
	openPreview(filePath);
}

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);

}

function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": WORKFLOWTYPE
		},
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) {
				//isCheck = true;
				//$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#commitBtn").hide();
				$('.employee').hide();
				return;
			};
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if(data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for(var i = 0; i < data.data.length; i++) {
						option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
					}
				}
			}
			$("#employeeId").html(option);
		}
	});

}

//挂载采购文件下载记录请求
function setPurchaseFileDownloadDetail(uid) {
	//console.log(uid)
	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data: {
			"packageId": uid
		},
		async: true,
		success: function(result) {
			if(result.success) {
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
}
//挂载采购文件下载记录
function setPurchaseFileDownloadDetailHTML(data) {

	$("#PurchaseFileDownload").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "企业名称",
				align: "left",
				field: "enterprise.enterpriseName",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}

			},
			{
				field: "purFile.fileName",
				align: "left",
				title: "文件名称",
			}, {
				field: "subDate",
				align: "center",
				title: "下载时间",
				width: "150",
			},
			/*{
				title: "IP地址",
				align: "center",
				width: "100",
				field: 'ip'
			},
			{
				title: "地区",
				align: "center",
				width: "100",
				field: 'area'
			},*/
			{
				title: "联系人",
				align: "center",
				width: "50",
				field: 'linkMan'
			},
			{
				title: "手机号",
				align: "center",
				width: "100",
				field: 'linkTel'
			}, {
				title: "邮箱",
				align: "center",
				width: "150",
				field: 'linkEmail'
			}
		]

	})
	$("#PurchaseFileDownload").bootstrapTable('load', data);
}

//modify by H 2020-09-08
var updateUrl = top.config.AuctionHost + "/AuctionSfcOfferController/updateOfferItems.do"; //提交
var urlGetResultAuditsUser = top.config.AuctionHost + "/WorkflowController/reviewApprovePerson.do"; //审核记录
var urlLive0Check = top.config.AuctionHost + "/WorkflowController/addDataToJJCGRecord";
var urlAuditProcess = top.config.AuctionHost + "/WorkflowController/checkJJCGWorkFlowOver"; //判断流程是否完成
var urlSaveResultAudits = top.config.AuctionHost + "/WorkflowController/saveWorkflowAccepList.do";
var urlGetCheckReal = top.config.AuctionHost + "/WorkflowController/findWorkFlowRecords"; // 查询审核记录
//查询采购审核
var workflowLevel = 0;
//是否为提交过审核人
var isReloadCheck = false;
var isEndCheck;
var isHasFail = false; //是否有竞价失败
var isHasBid = false; //是否有多个最低报价

$("#detailPackageList").off("click", ".isFail").on("click", ".isFail", function() {
	if($(this).is(":checked")) {
		$(this).closest("tr").find("input:radio").parent("label").hide();
	} else {
		$(this).closest("tr").find("input:radio").parent("label").show();
	}
});
//清单竞价按明细 查询可议价的所有供应商信息

function getSupplierBargain(num) {
	$.ajax({
		type: "POST",
		url: getSupplierBargainUrl,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				if(offerData.isStopCheck == 1){
					$("#btn_bargain, #btn_submit").hide();
				}else{
					if(num == response.data.length) {
						$("#btn_bargain").hide();
					} else {
						$("#btn_bargain").show();
						$("#btn_submit").hide();
					}
				}
			}
		}
	})
}

function vilidateIsSubmit() {
	$.ajax({
		type: "POST",
		url: vilidateIsSubmitUrl,
		async: false,
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				if(Number(response.data) > 0) {
					$("#btn_submit").hide();
				}

			}
		}
	})
}

$("#btn_submit").click(function() {
	var btnType = $(this).attr("data-type");
	var rows = $("#bargainList").bootstrapTable('getData');
	console.log(rows)
	var flag = true;
	for(var r = 0; r < rows.length; r++){
		if(rows[r].sfcBarginStatus == 1) {
			flag = false;
		}
	}

			if(!flag){
				top.layer.confirm('温馨提示：供应商议价未完成，是否确认发起会签？', {
					btn: ['是', '否']
				}, function() {
					if(workflowLevel == 0) {
						top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
							saveForm(btnType);
						});
					} else {
						for(var i = 1; i <= workflowLevel; i++) {
							let workflowLevel = $("#selectLv" + i).val();
							if(workflowLevel.length == 0) {
								parent.layer.alert("添加审批人员！");
								return false;
							}
						}
						saveForm(btnType);
					}
				}, function(index, layer) {
					top.layer.close(index);
				})
			}else{
				if(workflowLevel == 0) {
					top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
						saveForm(btnType);
					});
				} else {
					for(var i = 1; i <= workflowLevel; i++) {
						let workflowLevel = $("#selectLv" + i).val();
						if(workflowLevel.length == 0) {
							parent.layer.alert("添加审批人员！");
							return false;
						}
					}
					saveForm(btnType);
				}
			}
		


	//	if(workflowLevel == 0) {
	//		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
	//			saveForm(btnType);
	//		});
	//	} else {
	//		for(var i = 1; i <= workflowLevel; i++) {
	//			let workflowLevel = $("#selectLv" + i).val();
	//			if(workflowLevel.length == 0) {
	//				parent.layer.alert("添加审批人员！");
	//				return false;
	//			}
	//		}
	//		saveForm(btnType);
	//	}
})

function saveForm(btnType) {
	var arr = {
		packageId: packageId,
		boFailAuctiones: [],
		boAuctionOfferItemes: []
	};
	if(btnType == 0) {
		arr.identifier = 0;
	}
	var flag = false;
	$("#detailPackageList tbody tr").each(function() {
		//boFailAuctiones：超过预算价处理的数组   boAuctionOfferItemes：供应商最低报价相同的数组
		var index = $(this).attr("data-index");
		var col = $(this).find("input:radio:checked").closest("td").attr("class");
		var len = $(this).find("input:radio:checked").length;
		var isFail = $(this).find(".isFail").length > 0 ? true : false;
		if($(this).find("input:radio").length > 0) {
			if(len == 0 && ((isFail && (!$(this).find(".isFail").is(":checked"))) || (!isFail))) {
				top.layer.alert("第" + (Number(index) + 1) + "行请选择中选人");
				flag = true;
				return false;
			}
			arr.boAuctionOfferItemes.push({
				//supplierEnterpriseId: detaillist[index].auctionSfcOfferItemList[col].supplierEnterpriseId,
				isSamePrice: 0,
				id: $(this).find("input:radio:checked").parent("label").attr("data-id")
			});
		}
		if($(this).find("input:checkbox").length > 0) {
			arr.boFailAuctiones.push({
				specificationId: detaillist[index].id,
				isFailAuction: $(this).find(".isFail").is(":checked") ? 0 : 1
			});
		}
	});
	if(flag) {
		return;
	}
	$.ajax({
		type: "POST",
		url: updateUrl,
		async: false,
		data: arr,
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(!response.success) {
				top.layer.alert(response.message);
				return;
			}

			if(btnType == 1) {
				saveCheck();
			} else {
				$("#btn_submit").hide();
				parent.layer.alert("提交成功");

				var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
			}
		}
	})
}

function getResultAuditsLive() {
	var table = $("#resultAuditList");
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + '/WorkflowController/findjjcgjgWorkflowLevel',
		async: false,
		success: function(res) {
			if(res.success) {
				if(res.data) {
					workflowLevel = res.data.workflowLevel;
					if(workflowLevel == 0) {
						return;
					}
					getCheckReal();
					if(workflowLevel > 0) {
						isCheck = true;
						$("#btn_submit").html("竞价结果会签");
						$("#btn_submit").attr("data-type", "1");
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
						html += "<input hidden='true' class='form-control'  id=" + "selectLv" + i + "    style='width: 100%;height: 100%;'readonly  /> ";
						html += "</td>"
						html += "<td>"
						html += "<input class='form-control'  id=" + "selectLvName" + i + "  onclick = 'selectClick(this.id)'    style='width: 100%;height: 100%;'readonly  /> ";
						html += "</td>"
						html += "</tr>"
						table.append(html)
					}
					//                  getResultAuditsUser();
					//                  auditProcess();
					//                  vilidateIsSubmit();
				} else {
					$("#btn_submit").html("竞价结果提交");
					$("#btn_submit").attr("data-type", "0");
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
			'businessId': packageId
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
					$("#btn_submit").hide();

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
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		scrollbar: false, // 父页面 滚动条禁止
		// content: '/Auction/Auction/Agent/AuctionProjectPackage/model/getResultAuditList.html',
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

function saveCheck() {
	if(workflowLevel == 0) {
		$.ajax({
			type: "post",
			url: urlLive0Check,
			data: {
				'businessId': packageId
			},
			success: function(res) {
				if(res.success) {
					top.layer.alert(res.message);
					return;
				}
				$("#btn_submit").hide();
				parent.layer.alert("提交成功");

				var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
			}
		});
	} else {
		var data = [];
		var js = "";

		for(var i = 1; i <= workflowLevel; i++) {

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
					'packageId': packageId
				})
			},
			success: function(res) {

				if(res.success) {
					parent.layer.alert("提交成功");
					$("#btn_submit").hide();
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
				} else {
					parent.layer.msg(res.message);
				}

			}
		});
	}
}

function auditProcess() {
	$.ajax({
		type: "get",
		url: urlAuditProcess,
		async: false,
		data: {
			'businessId': packageId
		},
		success: function(res) {
			if(res.success) {
				isEndCheck = true
				if(isReloadCheck) {
					$("#checkReload").show();
				}
			} else {
				$("#checkReload").hide();
				$("#btn_submit").hide();
				$("#selectLvName" + 1).attr("disabled", "disabled");
				$("#selectLvName" + 2).attr("disabled", "disabled");
				$("#selectLvName" + 3).attr("disabled", "disabled");
				$("#selectLvName" + 4).attr("disabled", "disabled");
				//              parent.layer.alert("采购审核流程已完成！");
				isEndCheck = false
			}
		}
	});
}

//回显审核意见
function getCheckReal() {
	$(".checkRecord").css("display", "table-row");
	$("#biddingApprovalList").bootstrapTable({
		url: urlGetCheckReal,
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
			'businessId': packageId
		}, // 请求参数，这个关系到后续用到的异步刷新
		silent: true, // 必须设置刷新事件
		striped: true,
		columns: [{
				//field: 'Id',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'workflowResult',
				title: '审核状态',
				align: 'center',
				width: '160',
				formatter: function(value, row, index) {
					if(row.workflowResult == '0') {
						return "<span>审核通过</span>";
					} else if(row.workflowResult == '1') {
						return "<span>审核不通过</span>";
					} else if(row.workflowResult == '2') {
						return "<span>已撤销</span>";
					}

				}
			},
			{
				field: 'workflowContent',
				title: '审核意见',
				align: 'left'

			},
			{
				field: 'userName',
				title: '审核人',
				align: 'center',
				width: '160'
			},
			{
				field: 'subDate',
				title: '操作时间',
				align: 'center',
				width: '160'
			}
		]

	});
}