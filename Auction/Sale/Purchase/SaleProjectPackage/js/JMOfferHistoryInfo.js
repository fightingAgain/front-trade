var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';
var finalResult = top.config.offerhost + '/info/finalResult';
var finalLogs = top.config.offerhost + '/offer/logs';
var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var urlHistoryInfo = "Auction/Auction/Purchase/AuctionProjectPackage/model/detailItemSupplier.html"
var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("packageId");
var createType = getUrlParam("createType") || 0;
var type = getUrlParam("type");
var tType = getUrlParam("tType");
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
var isAgent; //是否代理项目
var detailedId = "";
var offerData = "";
var supervisorCheck = true; //业主代表是否审核完毕
var urlLive0Check = top.config.AuctionHost + "/WorkflowController/addDataToJJCGRecord"
var urlGetBiddingApprovalRecord = top.config.AuctionHost + "/WorkflowController/findWorkFlowRecords"
//回显审核人
let urlGetResultAuditsUser = top.config.AuctionHost + "/WorkflowController/reviewApprovePerson"
//保存审核人
let urlSaveResultAudits = top.config.AuctionHost + "/WorkflowController/saveWorkflowAccepList.do"
//撤回审核人
let urlRealBack = top.config.AuctionHost + "/WorkflowController/recallWorkflow";
var selectInputId;
var urlAuditProcess = top.config.AuctionHost + "/WorkflowController/checkJJCGWorkFlowOver"
var urlSingleOriginatorOfferesList = top.config.AuctionHost +
	"/AuctionSfcSingleOfferesController/getSingleOriginatorOfferesList.do"
//查询采购审核
var workflowLevel = 0;
//是否为提交过审核人
var isReloadCheck = false;
var isEndCheck;
var lunnum;
var RenameData = {};//投标人更名信息
$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	// singleQuotation();
	getResultAuditsLive();
	getOfferInfo();

	getBiddingApprovalRecord();
	if (tType != null) {
		var result = JSON.parse(sessionStorage.getItem("auctionresult"));
		//		getMsg(result);
	}
	//竞价文件提交信息列表
	getOfferFileInfo(projectId);

	//WorkflowUrl();

	setPurchaseFileDownloadDetail(packageId);
	detailItem();

	if (createType == 1) {

		$(".modify").hide();
		$('.zzbj').attr('readonly', true);

		//$("#detailItemSupplier").hide();
		$("#againDetailItemSupplier").hide();
		$(".chooseSuppler").hide();
		$(".rebut").hide();
		$("#commitBtn").hide();
	}

});

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

function getOfferInfo() {
	//getCheckList();
	$.ajax({
		url: urlViewAuctionInfo,
		data: {
			packageId: packageId,
			state: 1,
			tenderType: 2,
		},
		async: false,
		success: function(res) {
			if (res.success) {
				var data = res.data;
				offerData = data;
				getFinalResult(offerData);
				getMsg(data)
				lunnum = offerData.saleCount;
				$("td[id]").each(function() {
					$(this).html(data[this.id]);

					//竞价方式
					if (this.id == "auctionType") {
						switch (data[this.id]) {
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
							default:
								$(this).html("不限轮次");
								break;
						}
					}
				});
				if (workflowLevel && workflowLevel > 0) {
					if (isEndCheck) {
						if (offerData.isRecItemFile == 0) {
							$("#detailItemSupplier").show();
						} else {
							$("#againDetailItemSupplier").show();
						}
					}
				} else {
					//判断是否发布结果通知书0为未发布
					if (offerData.isSendResult == 0) {
						if (offerData.isRecItemFile == 0) {
							$("#detailItemSupplier").show();
						} else {
							$("#againDetailItemSupplier").show();
						}
					}
				}

				if (data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					if (data.auctionModel == 0) { //按照包件
						$("#offerRank").html("<table id='freePackageRank'></table>");
						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
						//	$("#detail").bootstrapTable("load",)	
					} else { //按照明细
						$(".detail").hide();
						$("#offerRank").html(
							"<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRank'></table></div>"
						);
						$("#offerRecord").html(
							"<div style='width:30%;float: left;'><table id='freeDetailRD' class='table table-bordered pull-left'></table></div><div style='width: 70%;float: left;'><table id='freeDetailRecord'></table></div>"
						);
						freeDetailRank();
						freeDetailRecord();
						freeDetailRK();
						freeDetailRD();
					}
				} else {
					//多轮
					$("#offerRank").html("<table id='roundRank'></table>");
					$("#offerRecord").html(
						"<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>"
					);
					roundRank();
					roundRecord();
					roundItem();
					//	$("#detail").bootstrapTable("load",)	
				}
				//是否需要业主代表确认及业主代表
				if (data.auctionSupervise.isSupervise == 1) {
					if (typeof(data.auctionSupervise.userName) != "undefined") {
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

				//是否显示最低报价
				if (data.auctionType > 0) {
					$(".isShowPrice").css("display", "table-row");
					$("#isShowPrice").html(data.isShowPrice == 1 ? "否" : "是");
				} else {
					$(".isShowPrice").css("display", "none");
				}
			}
		}
	});
}

//导出报价历史记录
function exportExcel() {
	var offerlogs = offerData.offerlogs || '';
	var details = offerData.details || '';
	if (offerlogs.length > 0 || details.length > 0) {
		var url = config.AuctionHost + "/OfferController/outOfferWasteHisByExcel.do" + "?packageId=" + packageId +
			"&tenderType=2";
		window.location.href = $.parserUrlForToken(url);
	} else {
		top.layer.alert("温馨提示：报价记录不存在");
	}
}

//导出销售汇总表
function exportRankExcel() {
	var offerlogs = offerData.offerlogs || '';
	var details = offerData.details || '';
	if (offerlogs.length > 0 || details.length > 0) {
		var url = config.AuctionHost + "/OfferController/outOfferWasteRankByExcel.do" + "?packageId=" + packageId +
			"&tenderType=2";
		window.location.href = $.parserUrlForToken(url);
	} else {
		top.layer.alert("温馨提示：报价记录不存在");
	}
}

//导出报价排名记录
function exportQuotationRankingExcel() {
	var offerlogs = offerData.offerlogs || '';
	var details = offerData.details || '';
	if (offerlogs.length > 0 || details.length > 0) {
		var url = config.AuctionHost + "/AuctionSfcSingleOfferesController/excelExport.do" + "?packageId=" + packageId;
		window.location.href = $.parserUrlForToken(url);
	} else {
		top.layer.alert("温馨提示：报价记录不存在");
	}
}

//一键下载
function oneClickDownload() {
	var offerlogs = offerData.offerlogs || '';
	var details = offerData.details || '';
	if (offerlogs.length > 0 || details.length > 0) {
		var url = config.AuctionHost + "/AuctionSfcSingleOfferesController/downloadFileList.do" + "?packageId=" + packageId;
		window.location.href = $.parserUrlForToken(url);
	} else {
		top.layer.alert("温馨提示：报价记录不存在");
	}
}

function detail() {
	$("#detail").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
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
				width: '160'
			},
			{
				field: 'detailedCount',
				title: '数量',
				align: 'center',
				width: '100'
			},
			{
				field: 'detailedUnit',
				title: '单位',
				align: 'center',
				width: '100'
			}
		]
	})
}

function freeDetailRK() {
	$("#freeDetailRK").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index]
				.offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
				$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
				detailedId = row.id;
				if (status == '已提交审核' || status == '审核通过') {
					// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
					$(".modify").hide();
					$('.zzbj').attr('readonly', true);
				}

				if (itemState == '1' || itemState == '2' || itemState == '4' || itemState == '3') {
					// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
					$(".modify").hide();
					$('.zzbj').attr('readonly', true);
				}

				if (isAgent) {
					if (isAgent == '1') {
						$(".modify").hide();
						$('.zzbj').attr('readonly', true);
					}
				}
			}
		},
		onClickCell: function(field, value, row, $element) {
			curField = 1;
			if (field !== "Status") {
				//执行代码
			}
		},
		onPostBody: function() {
			$("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if (index == 0) {
						if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[
								index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
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
				field: 'priceType',
				title: '顶价/低价',
				formatter: function(value, row, index) {
					if (value == 1) {
						return "顶价";
					} else {
						return "低价";
					}
					return
				}
			},
			{
				field: 'salesPrice',
				title: '起始价',
				align: 'center',

			},
			{
				field: 'detailedVersion',
				title: '规格型号',
			},
			{
				field: 'storageLocation',
				title: '存放地点',
				align: 'center',

			}
		]
	})

	$("#freeDetailRK  input[type='radio']").attr("name", "freeDetailRD");
	$("#freeDetailRK").bootstrapTable("load", offerData.auctionPackageDetaileds);

}

function freeDetailRD() {
	var html = '';
	html += '<thead><tr><th></th>'
	html += '<th>轮次</th></tr></thead>'
	html += '<tbody>'

	for (var s = 1; s <= lunnum; s++) {
		html += '<tr class="selected">'
		if (s == 1) {
			html += '<td class="bs-checkbox" style="width:50px;"><input checked onclick="getckboxdate(\'' + s +
				'\')" type="radio" class="rackbox" name="rackbox" id="rackbox_' + s + '"/></td>'
			$.ajax({
				url: finalLogs,
				type: 'post',
				async: false,
				data: {
					'packageId': packageId,
					'biddingTimes': 1
				},
				success: function(data) {
					if (data.success) {
						$("#freeDetailRecord").bootstrapTable("load", data.data);
					}
				}
			})
		} else {
			html += '<td class="bs-checkbox" style="width:50px;"><input onclick="getckboxdate(\'' + s +
				'\')" type="radio" class="rackbox" name="rackbox" id="rackbox_' + s + '"/></td>'
		}
		html += '<td>第' + s + '轮次</td></tr>'
	}
	html += '</tbody>'
	$("#freeDetailRD").html(html);
}

function getckboxdate(index) {
	$.ajax({
		url: finalLogs,
		type: 'post',
		async: false,
		data: {
			'packageId': packageId,
			'biddingTimes': index
		},
		success: function(data) {
			if (data.success) {
				$("#freeDetailRecord").bootstrapTable("load", data.data);
			}
		}
	});
}

function detailItem() {
	$("#detailItem").bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.AuctionHost + '/AuctionOfferController/findItemFileSuppliers.do', // 请求url
		//data:Json,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		queryParams: function() {
			return {
				'packageId': packageId,
				'isSubmitItemFile': 1
			}
		}, // 请求参数，这个关系到后续用到的异步刷新		
		paganization: false,
		columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: 'enterpriseName',
				title: '供应商名称',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				field: 'fileName',
				title: '附件名称',
			},
			{
				field: 'subDate',
				title: '上传时间',

			},
			{
				field: 'id',
				title: '操作',
				align: 'center',
				events: {
					'click .download': function(e, value, row, index) {
						var newUrl = urlDownloadAuctionFile + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
						window.location.href = $.parserUrlForToken(newUrl);
					},
					'click .rebut': function(e, value, row, index) {
						top.layer.confirm("温馨提示:确定驳回该分项报价表吗?", function(indexs) {
							parent.layer.close(indexs);
							parent.layer.prompt({
								title: '请输入驳回理由',
								value: '',
								formType: 2,
								yes: function(ind, layero) {
									var value = layero.find(".layui-layer-input").val();
									$.ajax({
										type: "get",
										url: config.AuctionHost + '/AuctionItemFileController/rejectAuctionItemFile.do',
										async: false,
										dataType: 'json',
										data: {
											'id': row.id,
											'reason': value,
										},
										success: function(data) {
											if (data.success == true) {
												$('#detailItem').bootstrapTable('refresh');
											}else{
												top.layer.alert(data.message);
											}
										}
									});
									parent.layer.close(ind);
								}
							});
						});
					}
				},
				formatter: function(value, row, index) {
					if (row.filePath) {
						var btn =
							'<a class="btn-sm btn-primary download" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>下载</a>'
						if (workflowLevel && workflowLevel > 0) {
							if (isEndCheck) {
								btn +=
									'<a class="btn-sm btn-warning rebut" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-share" aria-hidden="true"></span>驳回</a>'
							}
						} else {
							if (offerData.isSendResult == 0 && createType == 0) {
								btn +=
									'<a class="btn-sm btn-warning rebut" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-share" aria-hidden="true"></span>驳回</a>'
							}
						}

						return btn
					}

				}

			}
		]
	})
}
$(".chooseSuppler").on('click', function() {
	// if(offerData.rankItems.length==0){
	// 	parent.layer.alert("无供应商报价")
	// 	return
	// }
	top.layer.open({
		type: 2,
		title: '选择供应商',
		area: ['800px', '500px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: urlHistoryInfo + '?projectId=' + projectId + '&packageId=' + packageId + '&type=' + 'commit',
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);

		}
	});
})

function freeDetailRank() {
	$("#freeDetailRank").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
				title: '排名',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'supplierName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}
			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					return Number(value).toFixed(2);
				}
			},
		]
	})

}

function freeDetailRecord() {
	$("#freeDetailRecord").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: 'detailName',
				title: '物料名称',
				align: 'left'
			},
			{
				field: 'detailCode',
				title: '物料编码',
				align: 'left'
			},
			{
				field: 'supplierName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}

			}, {
				field: 'offerMoney',
				title: '报价（元）',
				align: 'right',
				formatter: function(value, row, index) {
					return Number(value).toFixed(2);
				}

			}, {
				field: 'offerTime',
				title: '报价时间',
				align: 'center'
			}
		]
	})
}

//自由或者单轮  按照包件排名
function freePackageRank() {
	$("#freePackageRank").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}

			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					return Number(value).toFixed(2);
				}
			},
		]
	})

	$("#freePackageRank").bootstrapTable("load", offerData.rankItems);

}

//自由或者单轮  按照包件报价记录
function freePackageRecord() {
	$("#freePackageRecord").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
			title: '序号',
			width: '50px',
			align: 'center',
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商',
			align: 'left',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
			}

		}, {
			field: 'offerMoney',
			title: '报价（元）',
			align: 'right',
			formatter: function(value, row, index) {
				return Number(value).toFixed(2);
			}

		}, {
			field: 'subDate',
			title: '报价时间',
			align: 'center'
		}]
	})
	$("#freePackageRecord").bootstrapTable("load", offerData.offerlogs);
}

//多伦报价 报价排名
function roundRank() {
	$("#roundRank").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
				title: '排名',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}

			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					return Number(value).toFixed(2);
				}
			},
			{
				field: 'isEliminated',
				title: '是否淘汰',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					if (row.isEliminated != undefined && row.isEliminated == '1') {
						return "<span class='text-danger'>已淘汰</span>";
					} else {
						return "<span  class='text-success'>未淘汰</span>";
					}
				}
			},
		]
	})
	$("#roundRank").bootstrapTable("load", offerData.rankItems);

}

//多伦报价 报价轮次
function roundItem() {
	$("#roundItem").bootstrapTable({
		undefinedText: "",
		paganization: false,
		clickToSelect: true,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if (offerData.offerlogs[index].offerLog !== undefined && offerData.offerlogs[index].offerLog !== null &&
				offerData.offerlogs[index].offerLog !== "") {
				$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog);
			}
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if (index == 0) {

						$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog || []);
						return true;
					}
				}
			},
			{
				title: '轮次',
				align: "center",
				formatter: function(value, row, index) {
					return "第" + sectionToChinese(index + 1) + "轮报价";
				}
			}, {
				field: 'enterpriseName',
				title: '最低价竞买人',
				align: "center",
				formatter: function(value, row, index) {
					return (value || "无报价人");
				}
			}, {
				field: 'minPrice',
				title: '最低价报价（元）',
				align: "right",
				formatter: function(value, row, index) {
					return value ? (Number(value).toFixed(2)) : "无最低报价";
				}
			}
		]
	})

	$("#roundItem").bootstrapTable("load", offerData.offerlogs);
	//	alert(1);
}

//多伦报价 报价记录
function roundRecord() {
	$("#roundRecord").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [{
			title: '序号',
			width: '50px',
			align: 'center',
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: "enterpriseName",
			title: "竞买人"
		}, {
			field: "offerMoney",
			title: "报价（元）",
			align: 'right',
			formatter: function(value, row, index) {
				return Number(value).toFixed(2);
			}
		}, {
			field: "subDate",
			title: "报价时间"
		}, {
			field: "offerRound",
			title: "报价轮次",
			formatter: function(value, row, index) {
				return "第" + sectionToChinese(value) + "轮";
			}
		}]
	})
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
						if (row.checkState == '0') {
							return "<span>无需审核</span>";
						} else if (row.checkState == '1') {
							supervisorCheck = false;
							return "<span>未提交</span>";
						} else if (row.checkState == '2') {
							return "<span>已提交</span>";
						} else if (row.checkState == '3') {
							return "<span>审核通过</span>";
						} else if (row.checkState == '4') {
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
	if (r != null) return unescape(r[2]);
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
				if (ret.success) {
					parent.$('#OfferList').bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					//					top.layer.closeAll();
					top.layer.alert("提交竞价采购情况成功")
				} else {
					parent.layer.alert("提交竞价采购情况失败！");
					return;
				}
			}
		});
	})
}

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
		async: false,
		success: function(result) {
			if (result.success) {
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
				title: "竞卖文件",
				cellStyle: {
					css: {
						"padding": "0px"
					}
				},
				formatter: function(value, row, index) {
					if( row.fileName){
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
						var html = "<table class='table' style='border-bottom:none'>";
						for (var j = 0; j < filePathArr.length; j++) {
							html += "<tr>";
							html += "<td>" + fileNameArr[j] + "</td>"
							html +=
								"<td  width='100px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" +
								fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
							if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
								html += "<a href='javascript:void(0)' data-index='" + j +
									"' class='btn btn-primary btn-xs previewFile' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
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
					if (row.checkState == 1) {
						return "<div class='text-success'>合格</div>";
					} else if (row.checkState == 0) {
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
			if (data.message == 0) {
				//isCheck = true;
				//$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if (data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#commitBtn").hide();
				$('.employee').hide();
				return;
			};
			if (data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if (data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if (data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for (var i = 0; i < data.data.length; i++) {
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

	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data: {
			"packageId": uid
		},
		async: false,
		success: function(result) {
			if (result.success) {
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
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
			'businessId': packageId
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

function getResultAuditsLive() {
	var table = $("#resultAuditList");
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + '/WorkflowController/findjjcgjgWorkflowLevel',
		async: false,
		success: function(res) {
			if (res.success) {
				if (res.data) {
					$("#doCheck").show();
					workflowLevel = res.data.workflowLevel;

					if (workflowLevel > 0) {
						$("#resultAuditResMsg").show();
						$("#resultAuditListTable").show();
					}
					for (var i = 1; i <= workflowLevel; i++) {
						var str = "";
						switch (i) {
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
					auditProcess();

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
			if (res.success) {
				let js = res.data;
				for (var i = 0; i < js.length; i++) {
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
				if (js.length > 0) {
					$("#selectLvName" + 1).attr("disabled", "disabled");
					$("#selectLvName" + 2).attr("disabled", "disabled");
					$("#selectLvName" + 3).attr("disabled", "disabled");
					$("#selectLvName" + 4).attr("disabled", "disabled");
					if (workflowLevel > 0) {
						isReloadCheck = true;
						$("#checkReload").hide()
					}
				}
				if (js.length > 0) {
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

$("#doCheck").click(function() {
	if (supervisorCheck) {
		if (workflowLevel == 0) {
			top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
				$.ajax({
					type: "post",
					url: urlLive0Check,
					data: {
						'businessId': packageId
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

			for (var i = 1; i <= workflowLevel; i++) {
				let workflowLevel = $("#selectLv" + i).val();
				if (workflowLevel.length == 0) {
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
						'packageId': packageId
					})
				},
				success: function(res) {

					if (res.success) {
						var index = parent.layer.getFrameIndex(window.name);
						top.layer.close(index);
					} else {
						parent.layer.msg(res.message);
					}

				}
			});
		}

	} else {
		parent.layer.alert("业主代表未审核完毕，不能提交采购审核！");
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
				'businessId': packageId,
				'workflowResult': 2
			},
			success: function(res) {
				if (res.success) {
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
			'businessId': packageId
		},
		success: function(res) {
			if (res.success) {
				isEndCheck = true
				if (isReloadCheck) {
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

//单项报价排名
function singleQuotation() {
	$("#singleQuotationTable").bootstrapTable({
		url: urlSingleOriginatorOfferesList,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		clickToSelect: true, //是否启用点击选中行
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: queryParams, //查询条件参数
		striped: true,
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
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
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

}

function getFinalResult(offerData) {
	var results = [];
	$.ajax({
		type: "post",
		dataType: 'json',
		url: finalResult,
		async: false,
		data: {
			'packageId': offerData.id
		},
		success: function(res) {
			if (res.success) {
				results = res.data.results
			}
		}
	});

	if (results.length > 0) {
		var detailsdate = offerData.auctionPackageDetaileds
		for (var i = 0; i < detailsdate.length; i++) {
			var offerItems = []
			for (var j = 0; j < results.length; j++) {
				if (detailsdate[i].id == results[j].detailId) {
					offerItems.push(results[j])
				}
			}
			offerData.auctionPackageDetaileds[i].offerItems = offerItems

		}
	}
}
