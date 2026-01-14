var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

var urlGetCheckReal = top.config.AuctionHost + "/WorkflowController/findWorkFlowRecords"

//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var singleOfferListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getSingleOriginatorOfferesList.do'
var getOfferListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件

var urlHistoryInfo = "Auction/Auction/Agent/AuctionProjectPackage/model/detailItemSupplier.html"
var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
var createType = getUrlParam("createType") || 0;
var type = getUrlParam("type");
var tType = getUrlParam("tType");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];
var status; //监督人审核状态
var itemState = "";
var AuctioningDetailedId = ""; //明细的id
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "psbg"; //申明项目公告类型
var isAgent;//是否代理项目
var detailedId = "";
var offerData = "";
var checkSuccess = top.config.AuctionHost + "/WorkflowController/jjcgWorkFlowAuditingOK.do";
var checkNoSuccess = top.config.AuctionHost + "/WorkflowController/jjcgWorkFlowAuditingNO.do";
var flag = getUrlParam("flag");
//if(flag){
//	$("#commitBtn").hide();
//	getCheckReal();
//}

//清单竞价
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do";//供应商
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
var urlsupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getAllAuctionOfferList.do";
//清单竞价
$(function () {
	if (flag) {
		getCheckReal();
		$("#biddingApproval").hide();
		$("#btn_submit").hide();
	}
	getOfferInfo();
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

	$("#btnList").click(function () {
		var url = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/exportExcelBidResult.do" + "?packageId=" + packageId;
		//		var url = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/exportExcelBidResult.do";
		window.location.href = $.parserUrlForToken(url);
	});


});

function getMsg(obj) {

	//	if(type == 'commit') {
	//		//展示提交按钮
	//		$("#commitBtn").show();
	//	}
	//	
	status = obj.checkStatus;
	//	getOfferInfo();
	//console.log(obj);

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
			tenderType: 1,
		},
		async: false,
		success: function (res) {
			if (res.success) {
				var data = res.data;
				offerData = data;
				auctionModelType = data.auctionModel;
				getMsg(data)
				$("td[id]").each(function () {
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
							case 6:
								if (typeof (auctionModelType) == 'undefined') {
									$(this).html("清单竞价");
								} else {

									if (auctionModelType == '1') {
										var strs = "（按明细）"
									} else if (auctionModelType == '2') {
										var strs = "（按总价排序后议价）"
									} else if (auctionModelType == '3') {
										var strs = "（按总价最低中选）"
									}
									$(this).html("清单竞价" + strs);
								}
								break;
							case 7:
								$(this).html("单项目竞价");
								break;
							default:
								$(this).html("不限轮次");
								break;
						}
					}
				});
				//判断是否发布结果通知书0为未发布
				//				if(offerData.isSendResult==0){
				//					if(offerData.isRecItemFile==0){
				//						$("#detailItemSupplier").show();
				//					}else{
				//						$("#againDetailItemSupplier").show();
				//					}	
				//				}
				if (data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					if (data.auctionModel == 0) { //按照包件
						$("#offerRank").html("<table id='freePackageRank'></table>");
						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
						//	$("#detail").bootstrapTable("load",)	
					} else { //按照明细
						$(".detail").hide();
						$("#offerRank").html("<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRank'></table></div>");
						$("#offerRecord").html("<div style='width:50%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRecord'></table></div>");
						freeDetailRank();
						freeDetailRecord();
						freeDetailRK();
						freeDetailRD();
					}
				} else if (data.auctionType == 6) {
					//清单竞价
					$(".hideOnAuction7").hide();
					$(".hideOnAuction6").hide();
					$(".showOnAuction6").show();

					supplier();
					getTable();
				} else if (data.auctionType == 7) {
					$("#offerRank").html("<table id='roundRank'></table>");
					getOfferRank();
					$(".hideOnAuction7").hide();

				} else {
					//多轮
					$("#offerRank").html("<table id='roundRank'></table>");
					$("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
					roundRank();
					roundRecord();
					roundItem();
					//	$("#detail").bootstrapTable("load",)	
				}
				//是否需要监督确认及监督人
				if (data.auctionSupervise.isSupervise == 1) {
					if (typeof (data.auctionSupervise.userName) != "undefined") {
						$("#employeeName").html(data.auctionSupervise.userName);
						$("#checkMes").show();
						$("#checkPerson").show();
						getCheckList();
					} else {
						$("#employeeName").html("未设置");
					}
				} else {
					$("#employeeName").html("无需监督");
				}
			}
		}
	});
}

// 获取报价列表
function getOfferRank() {
	$.ajax({
		type: "post",
		url: singleOfferListUrl,
		data: { packageId: packageId },
		success: function (res) {
			console.log(res)
			var listData = res.data;
			listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIERTECH_OFFER')
			$("#roundRank").bootstrapTable({
				undefinedText: "",
				paganization: false,
				columns: [{
					title: '排名',
					width: '50px',
					align: 'center',
					formatter: function (value, row, index) {
						return index + 1;
					}
				},
				{
					field: 'supplierEnterpriseName',
					title: '供应商',
					align: 'center'

				}, {
					field: 'noTaxRateTotalPrice',
					title: '报价总计(不含税)',
					align: 'center'

				}, {
					field: 'taxRate',
					title: '税率(%)',
					align: 'center'

				}, {
					field: 'taxRateTotalPrice',
					title: '报价总计(含税)',
					align: 'center'

				}, {
					field: 'offerTime',
					title: '报价时间',
					align: 'center'
				},
				{
					title: '报价文件附件',
					align: 'left',
					formatter: function (value, row, index) {
						var fileDatas = row.fileDatas;
						console.log(fileDatas)
						if (fileDatas) {
							var html = "<table class='table' style='border-bottom:none'>";
							for (var i = 0; i < fileDatas.length; i++) {
								html += "<tr>";
								html += "<td>" + fileDatas[i].fileName + "</td>"
								html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileDatas[i].fileName + "\",\"" + fileDatas[i].filePath + "\")'>下载</a>&nbsp;"
								// if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
								//     html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[i] + "\")'>预览</a>"
								// }
								html += "</span></td></tr>";
							}
							html += "</table>";
							return html;
						} else {
							return '暂无文件'
						}
					}
				}

				]
			})
			$("#roundRank").bootstrapTable("load", listData);
		}
	});
}
function getEmployeeOfferFileList(employeeData, modelName) {
	employeeData.forEach(function (val, index) {
		$.ajax({
			type: "get",
			url: getOfferListUrl,
			async: false,
			data: {
				'modelId': packageId,
				'modelName': modelName,
				'employeeId': val.employeeId
			},
			datatype: 'json',
			success: function (res) {
				if (res.success) {
					employeeData[index].fileDatas = res.data;
					$('#btnExcelDownload').show()
					$('#btnFileListDownload').show()
				}
			}
		});
	})
	return employeeData;
}
//导出报价历史记录
function exportExcel() {
	var offerlogs = offerData.offerlogs || '';
	var details = offerData.details || '';
	if (offerlogs.length > 0 || details.length > 0) {
		var url = config.AuctionHost + "/OfferController/outOfferHisByExcel.do" + "?packageId=" + packageId + "&tenderType=1";
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
			formatter: function (value, row, index) {
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
		onCheck: function (row, ele) {
			var index = $(ele).parents("tr").index();
			if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
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
		onClickCell: function (field, value, row, $element) {
			curField = 1;
			if (field !== "Status") {
				//执行代码
			}
		},
		onPostBody: function () {
			$("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {
					if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
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

	$("#freeDetailRK  input[type='radio']").attr("name", "freeDetailRD");
	$("#freeDetailRK").bootstrapTable("load", offerData.auctionPackageDetaileds);

}

function freeDetailRD() {
	$("#freeDetailRD").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function (row, ele) {
			var index = $(ele).parents("tr").index();
			if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
				$("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
			}
		},
		onPostBody: function () {
			$("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {
					if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
						$("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
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

	$("#freeDetailRD").bootstrapTable("load", offerData.details);

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
		queryParams: function () {
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			field: 'enterpriseName',
			title: '供应商名称',
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
				'click .download': function (e, value, row, index) {
					var newUrl = urlDownloadAuctionFile + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
					window.location.href = $.parserUrlForToken(newUrl);
				},
				'click .rebut': function (e, value, row, index) {
					top.layer.confirm("温馨提示:确定驳回该分项报价表吗?", function (indexs) {
						parent.layer.close(indexs);
						parent.layer.prompt({
							title: '请输入驳回理由',
							value: '',
							formType: 2,
							yes: function (ind, layero) {
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
									success: function (data) {
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
			formatter: function (value, row, index) {
				if (row.filePath) {
					var btn = '<a class="btn-sm btn-primary download" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>下载</a>'
					if (offerData.isSendResult == 0 && createType == 0) {
						btn += '<a class="btn-sm btn-warning rebut" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-share" aria-hidden="true"></span>驳回</a>'
					}
					return btn
				}

			}

		}
		]
	})
}
$(".chooseSuppler").on('click', function () {
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
		success: function (layero, index) {
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商',
			align: 'left'
		},

		{
			field: 'offerMoney',
			title: '报价金额（元）',
			align: 'right',
			width: "120",
			formatter: function (value, row, index) {
				return Number(value).toFixed(2);
			}
		},
			// {
			// 	field: 'lastMoney',
			// 	title: '最终报价（元）',
			// 	align: 'right',
			// 	width: "150",
			// 	formatter: function(value, row, index) {
			// 		return "<input type='text' class='form-control zzbj' value='" + Number(value || row.offerMoney).toFixed(2)+ "'>"
			// 	}
			// },
			// {
			// 	title: '操作',
			// 	align: 'center',
			// 	field: 'bbb',
			// 	width: "65px",
			// 	events: {
			// 		"click .modify": function(e, value, row, index) {
			// 			/*if(status == '无需审核' && row.lastMoney != undefined){
			// 				top.layer.alert("您已修改,不能重复修改");
			// 				return;
			// 			}*/
			// 			var lastMoney = $(this).parents("tr").children().eq(3).children().val();
			// 			if(lastMoney == "") {
			// 				top.layer.alert("最终报价不可为空！");
			// 				return;
			// 			}
			// 			if(lastMoney <= 0) {
			// 				top.layer.alert("最终报价不能为零！");
			// 				return;
			// 			}
			// 			if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test(lastMoney))){ 
			// 				top.layer.alert("最终报价只能是数字"); 	
			// 				return;
			// 			};

			// 			if(lastMoney.split('.').length >1 &&　lastMoney.split('.')[1].length>2){ 
			// 				top.layer.alert("最终报价只能保留两位小数"); 	
			// 				return;
			// 			};

			// 			lastMoney = parseFloat(lastMoney).toFixed(2);
			// 			var num = lastMoney.split('.')[0];
			// 			if(num.length>17){
			//         		top.layer.alert("最终报价不能超过17位");	     	 		
			// 	     	    return;
			//         	}

			// 			top.layer.prompt({
			// 				title: '请输入修改最终报价原因',
			// 				formType: 2
			// 			}, function(text, index) {
			// 				if(text.trim()==""){
			// 					top.layer.alert("修改最终报价原因为空!");	     	 		
			// 	     	    	return;
			// 				}
			// 				var param = {
			// 					packageId: packageId,
			// 					supplierId: row.supplierId,
			// 					lastMoney: lastMoney,
			// 					editReason:text
			// 				}

			// 				$.ajax({
			// 					url: urlUpdateLastMoney,
			// 					type: "post",
			// 					data: param,
			// 					success: function(res) {
			// 						if(res.success) {
			// 							getOfferInfo();
			// 							top.layer.close(index);
			// 							top.layer.alert("修改成功！")
			// 						} else {
			// 							top.layer.alert("修改失败！")
			// 						}
			// 					}
			// 				})
			// 			});

			// 		},	
			// 	},
			// 	formatter: function(value, row, index) {

			// 		return "<button class='btn btn-sm btn-primary modify'>确认修改</button>";
			// 	}
			// },{
			// 	title: '修改原因',
			// 	align: 'left',
			// 	field: 'editReason',
			// 	width:'120px'
			// }
		]
	})



	//	$("#freeDetailRank").bootstrapTable("load", offerData.offerlogs);
}

function freeDetailRecord() {
	$("#freeDetailRecord").bootstrapTable({
		undefinedText: "",
		paganization: false,
		columns: [
			{
				title: '序号',
				width: '50px',
				align: 'center',
				formatter: function (value, row, index) {
					return index + 1;
				}
			},
			{
				field: 'enterpriseName',
				title: '供应商',
				align: 'left'

			}, {
				field: 'offerMoney',
				title: '报价（元）',
				align: 'right',
				formatter: function (value, row, index) {
					return Number(value).toFixed(2);
				}

			}, {
				field: 'subDate',
				title: '报价时间',
				align: 'center'
			}]
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商',
			align: 'left'

		},

		{
			field: 'offerMoney',
			title: '报价金额（元）',
			align: 'right',
			width: "120",
			formatter: function (value, row, index) {
				return Number(value).toFixed(2);
			}
		},
			// {
			// 	field: 'lastMoney',
			// 	title: '最终报价（元）',
			// 	align: 'right',
			// 	width: "150",
			// 	formatter: function(value, row, index) {
			// 		return "<input type='text' class='form-control zzbj' value='" + Number(value|| row.offerMoney).toFixed(2) + "'>"
			// 	}
			// },
			// {
			// 	title: '操作',
			// 	align: 'center',
			// 	field: 'aaa',
			// 	width: '65px',
			// 	events: {
			// 		"click .modify": function(e, value, row, index) {

			// 			/*if(status == '无需审核' && row.lastMoney != undefined){
			// 				top.layer.alert("您已修改,不能重复修改");
			// 				return;
			// 			}*/

			// 			var lastMoney = $(this).parents("tr").children().eq(3).children().val();
			// 			if(lastMoney == "") {
			// 				top.layer.alert("最终报价不可为空！");
			// 				return;
			// 			}
			// 			if(lastMoney <= 0) {
			// 				top.layer.alert("最终报价不能为零！");
			// 				return;
			// 			}
			// 			if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test(lastMoney))){ 
			// 				top.layer.alert("最终报价只能是数字"); 	
			// 				return;
			// 			};

			// 			if(lastMoney.split('.').length >1 &&　lastMoney.split('.')[1].length>2){ 
			// 				top.layer.alert("最终报价只能保留两位小数"); 	
			// 				return;
			// 			};

			// 			lastMoney = parseFloat(lastMoney).toFixed(2);
			// 			var num = lastMoney.split('.')[0];
			// 			if(num.length>17){
			//         		top.layer.alert("最终报价不能超过17位");	     	 		
			// 	     	    return;
			//         	}

			// 			top.layer.prompt({
			// 				title: '请输入修改最终报价原因',
			// 				formType: 2
			// 			}, function(text, index) {
			// 				if(text.trim()==""){
			// 					top.layer.alert("修改最终报价原因为空!");	     	 		
			// 	     	    	return;
			// 				}
			// 				var param = {
			// 					packageId: packageId,
			// 					supplierId: row.supplierId,
			// 					lastMoney: lastMoney,
			// 					editReason:text
			// 				}

			// 				$.ajax({
			// 					url: urlUpdateLastMoney,
			// 					type: "post",
			// 					data: param,
			// 					success: function(res) {
			// 						if(res.success) {
			// 							getOfferInfo();
			// 							top.layer.close(index);
			// 							top.layer.alert("修改成功！")
			// 						} else {
			// 							top.layer.alert("修改失败！")
			// 						}
			// 					}
			// 				})
			// 			});
			// 		},

			// 	},
			// 	formatter: function(value, row, index) {

			// 		return "<button class='btn btn-sm btn-primary modify'>确认修改</button>";
			// 	},
			// },{
			// 	title: '修改原因',
			// 	align: 'left',
			// 	field: 'editReason',
			// 	width:'120px'
			// }
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商',
			align: 'left'

		}, {
			field: 'offerMoney',
			title: '报价（元）',
			align: 'right',
			formatter: function (value, row, index) {
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商',
			align: 'left'

		},

		{
			field: 'offerMoney',
			title: '报价金额（元）',
			align: 'right',
			width: "120",
			formatter: function (value, row, index) {
				return Number(value).toFixed(2);
			}
		},
		{
			field: 'isEliminated',
			title: '是否淘汰',
			align: 'right',
			width: "120",
			formatter: function (value, row, index) {
				if (row.isEliminated != undefined && row.isEliminated == '1') {
					return "<span class='text-danger'>已淘汰</span>";
				} else {
					return "<span  class='text-success'>未淘汰</span>";
				}
			}
		},
			// {
			// 	field: 'lastMoney',
			// 	title: '最终报价（元）',
			// 	align: 'right',
			// 	width: "150",
			// 	formatter: function(value, row, index) {

			// 		if(itemState == '1' || itemState == '2' || itemState == '3' || status == '已提交审核' || status == '审核通过'){
			// 			if(row.isEliminated != undefined  && row.isEliminated == '1'){
			// 				return "<span>"+Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
			// 			}else{
			// 				return "<input type='text' class='form-control zzbj' value='" + Number(value || row.offerMoney).toFixed(2) + "'>"
			// 			}
			// 		}else{
			// 			if(row.isEliminated != undefined  && row.isEliminated == '1'){
			// 				return "<span>"+Number(value || row.offerMoney).toFixed(2) + "</span>";
			// 			}else{
			// 				return "<input type='text' class='form-control zzbj' value='" + Number(value || row.offerMoney).toFixed(2) + "'>"
			// 			}
			// 		}

			// 	}
			// },
			// {
			// 	title: '操作',
			// 	align: 'center',
			// 	field: 'ccc',
			// 	width: '65px',
			// 	events: {
			// 		"click .modify": function(e, value, row, index) {
			// 			/*if(status == '无需审核' && row.lastMoney != undefined){
			// 				top.layer.alert("您已修改,不能重复修改");
			// 				return;
			// 			}*/

			// 			var lastMoney = $(this).parents("tr").children().eq(3).children().val();
			// 			if(lastMoney == "") {
			// 				top.layer.alert("最终报价不可为空！");
			// 				return;
			// 			}
			// 			if(lastMoney <= 0) {
			// 				top.layer.alert("最终报价不能为零！");
			// 				return;
			// 			}
			// 			if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test(lastMoney))){ 
			// 				top.layer.alert("最终报价只能是数字"); 	
			// 				return;
			// 			};

			// 			if(lastMoney.split('.').length >1 &&　lastMoney.split('.')[1].length>2){ 
			// 				top.layer.alert("最终报价只能保留两位小数"); 	
			// 				return;
			// 			};

			// 			lastMoney = parseFloat(lastMoney).toFixed(2);
			// 			var num = lastMoney.split('.')[0];
			// 			if(num.length>17){
			//         		top.layer.alert("最终报价不能超过17位");	     	 		
			// 	     	    return;
			//         	}
			// 			top.layer.prompt({
			// 				title: '请输入修改最终报价原因',
			// 				formType: 2
			// 			}, function(text, index) {
			// 				if(text.trim()==""){
			// 					top.layer.alert("修改最终报价原因为空!");	     	 		
			// 	     	    	return;
			// 				}
			// 				var param = {
			// 					packageId: packageId,
			// 					supplierId: row.supplierId,
			// 					lastMoney: lastMoney,
			// 					editReason:text
			// 				}

			// 				$.ajax({
			// 					url: urlUpdateLastMoney,
			// 					type: "post",
			// 					data: param,
			// 					success: function(res) {
			// 						if(res.success) {
			// 							getOfferInfo();
			// 							top.layer.close(index);
			// 							top.layer.alert("修改成功！")
			// 						} else {
			// 							top.layer.alert("修改失败！")
			// 						}
			// 					}
			// 				})
			// 			});
			// 		},
			// 	},
			// 	formatter: function(value, row, index) {
			// 		if(row.isEliminated != undefined  && row.isEliminated == '1'){
			// 			return "<span style='color:red;'>已淘汰</span>";
			// 		}else{
			// 			return "<button class='btn btn-sm btn-primary modify'>确认修改</button>";
			// 		}	
			// 	}
			// },{
			// 	title: '修改原因',
			// 	align: 'left',
			// 	field: 'editReason',
			// 	width:'120px'
			// }
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
		onCheck: function (row, ele) {
			var index = $(ele).parents("tr").index();
			if (offerData.offerlogs[index].offerLog !== undefined && offerData.offerlogs[index].offerLog !== null && offerData.offerlogs[index].offerLog !== "") {
				$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog);
			}
		},
		columns: [{
			radio: true,
			formatter: function (value, row, index) {
				if (index == 0) {

					$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog || []);
					return true;
				}
			}
		},
		{
			title: '轮次',
			align: "center",
			formatter: function (value, row, index) {
				return "第" + sectionToChinese(index + 1) + "轮报价";
			}
		}, {
			field: 'enterpriseName',
			title: '最低价竞买人',
			align: "center",
			formatter: function (value, row, index) {
				return (value || "无报价人");
			}
		}, {
			field: 'minPrice',
			title: '最低价报价（元）',
			align: "right",
			formatter: function (value, row, index) {
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: "enterpriseName",
			title: "竞买人"
		}, {
			field: "offerMoney",
			title: "报价（元）",
			align: 'right',
			formatter: function (value, row, index) {
				return Number(value).toFixed(2);
			}
		}, {
			field: "subDate",
			title: "报价时间"
		}, {
			field: "offerRound",
			title: "报价轮次",
			formatter: function (value, row, index) {
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
				formatter: function (value, row, index) {
					return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '160',
				formatter: function (value, row, index) {
					if (row.checkState == '0') {
						return "<span>无需审核</span>";
					} else if (row.checkState == '1') {
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
	let check = $("input[name='auditState']:checked").val();
	let workflowContent = $("#content").val();

	if (check) {
		var url;
		if (check == 0) {
			url = checkSuccess;
		} else {
			url = checkNoSuccess;
			if (workflowContent == null || $.trim(workflowContent) == "") {
				top.layer.alert("不通过填写说明！")
				return false;
			}
		}

		$.ajax({
			type: "post",
			url: url,
			data: {
				'businessId': packageId,
				'workflowResult': check,
				'workflowContent': $("#content").val()
			},
			success: function (res) {
				console.log(res);
				if (res.success) {
					parent.$('#ProjectAuditTable').bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					top.layer.alert("审核保存成功")
				} else {
					top.layer.alert(res.message)
					return false;
				}
			}

		})


	} else {
		top.layer.alert("选择审核结果！")
	}

	return false;

}

$("#btn_close").click(function () {
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
		success: function (result) {
			if (result.success) {
				loadAuctionFileCheckState(result.data);
			} else {
				parent.layer.alert(result.message);
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
			formatter: function (value, row, index) {
				return index + 1;
			}
		}, {
			field: "enterpriseName",
			halign: "left",
			title: "供应商"
		},
		{
			halign: "center",
			title: "竞价文件",
			cellStyle: {
				css: {
					"padding": "0px"
				}
			},
			formatter: function (value, row, index) {
				if( row.fileName){
					var fileNameArr = row.fileName.split(","); //文件名数组
					var filePathArr = row.filePath.split(",");
					// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var html = "<table class='table' style='border-bottom:none'>";
					for (var j = 0; j < filePathArr.length; j++) {
						var filesnames = filePathArr[j].substring(filePathArr[j].lastIndexOf(".") + 1).toUpperCase();
						html += "<tr>";
						html += "<td>" + fileNameArr[j] + "</td>"
						html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
						if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
							html += "<a href='javascript:void(0)' data-index='" + j + "' class='btn btn-primary btn-xs previewFile' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
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
			formatter: function (value, row, index) {
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
		success: function (data) {
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
	//console.log(uid)
	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data: {
			"packageId": uid
		},
		async: false,
		success: function (result) {
			if (result.success) {
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
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
		queryParams: { 'businessId': packageId }, // 请求参数，这个关系到后续用到的异步刷新
		silent: true, // 必须设置刷新事件
		striped: true,
		columns: [{
			//field: 'Id',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function (value, row, index) {
				return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'workflowResult',
			title: '审核状态',
			align: 'center',
			width: '160',
			formatter: function (value, row, index) {
				if (row.workflowResult == '0') {
					return "<span>审核通过</span>";
				} else if (row.workflowResult == '1') {
					return "<span>审核不通过</span>";
				} else if (row.workflowResult == '2') {
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
//挂载采购文件下载记录
function setPurchaseFileDownloadDetailHTML(data) {

	$("#PurchaseFileDownload").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
			title: "序号",
			align: "center",
			width: "50px",
			formatter: function (value, row, index) {
				return index + 1;
			}
		},
		{
			title: "企业名称",
			align: "left",
			field: "enterprise.enterpriseName"

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
		}, /*{
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

//清单竞价
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
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				returnData = response.data
				if (returnData && returnData.length > 0) {
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
			formatter: function (value, row, index) {
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
			formatter: function (value, row, index) {
				if (value) {
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
			formatter: function (value, row, index) {
				if (value) {
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
			},

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
			},

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
			formatter: function (value, row, index) {
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
					success: function (data) {
						var flieData = data.data
						if (data.success == true) {
							if (flieData.length == 1) {
								filesName = flieData[0].fileName
								filesPath = flieData[0].filePath

							} else {
								for (var e = 0; e < flieData.length; e++) {
									//										var subDate = new Date(flieData[e].subDate).getTime() / 1000;
									var subDate = Date.parse(new Date(flieData[e].subDate.replace(/\-/g, "/")));
									timeArr.push({
										time: subDate,
										filesName: flieData[e].fileName,
										filesPath: flieData[e].filePath
									})
								}
								var max = timeArr[0].time
								for (var t = 0; t < timeArr.length; t++) {
									var cur = timeArr[t].time;
									cur > max ? max = cur : null
								}
								//									var maxTime = timestampToTime(max);								
								for (var e = 0; e < timeArr.length; e++) {
									if (max == timeArr[e].time) {
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
			formatter: function (value, row, index) {
				var dowload;
				var filesName;
				var filesPath;
				var fileArr = { arr1: [], arr2: [] };
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
					success: function (data) {
						var flieData = data.data;

						if (data.success == true) {
							if (flieData.length > 0) {
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
					success: function (data) {
						var flieData = data.data
						if (data.success == true) {
							if (flieData.length > 0) {
								fileArr.arr2 = data.data;

							}
						}
					}
				});
				var flieData = fileArr.arr1.concat(fileArr.arr2);
				for (var m = 0; m < flieData.length; m++) {
					if (flieData.length == 1) {
						filesName = flieData[0].fileName
						filesPath = flieData[0].filePath
						dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'

					} else {
						filesName = flieData[0].fileName
						filesPath = flieData[0].filePath
						dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>&nbsp;&nbsp;&nbsp;&nbsp;'
						for (var e = 1; e < flieData.length; e++) {
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

//供应商报价
function getTable() {
	$.ajax({
		url: urlsupplier,
		type: "post",
		data: {
			packageId: packageId,
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = top.layer.msg('数据加载中', {
				icon: 0
			});
			//			msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
		},
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (res) {
			if (res.success) {

				detaillist = res.data;
				if (detaillist && detaillist.length > 0) {
					var auctionSfcOfferes = [];
					var textVals = [];
					var isMinPrice = [];
					var objsss = []
					for (var i = 0; i < detaillist.length; i++) {
						auctionSfcOfferes = detaillist[i].auctionSfcOfferItemList
						if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {
							for (var c = 0; c < auctionSfcOfferes.length; c++) {
								for (var e = returnData.length - 1; e >= 0; e--) {
									if (returnData[e].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
										var priceTtotal = 'totalPrice' + e;
										var priceUnit = 'unitPrice' + e;
										var priceSId = 'supplierId' + e;
										var priceIsBid = 'isSamePrice' + e;
										var priceItemId = 'itemId' + e;
										// var remark = 'remark' + e;
										// var answerDeliveryDate = 'answerDeliveryDate' + e
										if (detaillist[i].id == auctionSfcOfferes[c].specificationId) {
											detaillist[i][priceTtotal] = auctionSfcOfferes[c].noTaxRateTotalPrice;
											detaillist[i][priceUnit] = auctionSfcOfferes[c].noTaxRateUnitPrice;
											detaillist[i][priceSId] = auctionSfcOfferes[c].supplierEnterpriseId;
											detaillist[i][priceItemId] = auctionSfcOfferes[c].id;
											detaillist[i][priceIsBid] = auctionSfcOfferes[c].isSamePrice == 0 ? 0 : 1;
											// detaillist[i][remark] = auctionSfcOfferes[c].remark;
											// detaillist[i][answerDeliveryDate] = auctionSfcOfferes[c].answerDeliveryDate
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
								//								//供应商
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
								//			
							}

						}

					}
					listTable()
					//添加表格动态列及赋值
					if (returnData && returnData.length > 0) {
						for (var e = returnData.length - 1; e >= 0; e--) {

							var obj1 = {
								field: 'totalPrice' + e,
								title: '不含税总价(' + returnData[e].noTaxRateTotalPrice + ')',
								valign: "middle",
								align: "center",
								cellStyle: {
									css: {
										"background": '#fff',
										"word-wrap": "break-word",
										"word-break": "break-all",
										"white-space": "normal"
									}
								},
								formatter: function (value, row, index) {
									if (value) {
										return parseFloat(value)
									}
								}
							};
							var obj2 = {
								field: 'unitPrice' + e,
								title: '不含税单价',
								valign: "middle",
								align: "center",
								width: "120px",
								cellStyle: addStyle2,
								formatter: function (value, row, index) {
									if (value) {
										return parseFloat(value)
									}

								}

							}
							var obj3 = {
								field: 'unitPrice' + e,
								title: '是否中选',
								valign: "middle",
								class: e,
								formatter: function (value, row, index, field) {
									var unitPriceNum = 0;
									for (var m = 0; m < returnData.length; m++) {
										if (row["unitPrice" + m] == row.minPrice) {
											unitPriceNum++;
										}
									}
									var html = "";
									if (unitPriceNum > 1 && value == row.minPrice) {

										var idx = field.substring(9);
										if (row["isSamePrice" + idx] == 0) {
											html = '中选';
										} else {
											html = '';
										}
									}
									return html;
								}
							}

							var obj = {
								"title": returnData[e].supplierEnterpriseName,
								"field": 'supplier' + e,
								"valign": "middle",
								"align": "center",
								"colspan": (offerData.auctionModel == 1 ? 3 : 2),
								"rowspan": 1

							}
							// objsss.splice(0,0,obj2, obj1,obj3,obj4)
							if (offerData.auctionModel == 1) {
								objsss.splice(0, 0, obj2, obj1, obj3);
							} else {
								objsss.splice(0, 0, obj2, obj1);
							}
							col[0].splice(10, 0, obj);


						}
					}

					col.splice(1, 0, objsss)
					if (detaillist.length < 2500) {

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
		complete: function () {
			parent.layer.close(msgloading);

		}

	})

}

//报价最低的供应商添加颜色
function addStyle2(value, row, index) {
	if (parseFloat(value) <= parseFloat(row.minPrice)) {
		return {
			css: {
				"background": '#009100',
				"min-width": "120px",
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
	if (detaillist.length > 9) {
		var height = "400"
	} else {
		var height = ""
	}
	$('#detailPackageList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: col,
		height: height,
		onAll: function () {
			if (detaillist.length > 2500) {
				$("#detailPackageList").parent(".fixed-table-body").scroll(function (event) {
					var y = $(this).scrollTop()
					var wScrollY = y; // 当前滚动条位置  
					var wInnerH = $(this)[0].clientHeight; // 设备窗口的高度（不会变）  
					var bScrollH = $(this)[0].scrollHeight; // 滚动条总高度 
					var LockMore = false;
					if ((wScrollY + wInnerH) + 50 >= bScrollH) {
						//触底							
						if (pageIndex >= pageSize) {
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

						if (LockMore) {
							return false;
						}
					}


				})
			}
		},
		onPostBody: function () {
			//重点就在这里，获取渲染后的数据列td的宽度赋值给对应头部的th,这样就表头和列就对齐了
			var header = $(".fixed-table-header table thead tr th");
			var body = $(".fixed-table-header table tbody tr td");
			var footer = $(".fixed-table-header table tr td");
			body.each(function () {
				header.width((this).width());
				footer.width((this).width());
			});
		}
	});
	//	$('#detailPackageList').bootstrapTable("load", detaillist);

};
function listTable() {
	if (returnData.length > 0) {
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
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function (value, row, index) {
					return index + 1;
				}
			},
			{
				field: "materialNum",
				title: "物料号",
				valign: "middle",
				align: "center",
				colspan: 1,
				rowspan: 2,
				width: "170px",
				class: "colstyle",
				cellStyle: {
					css: {
						"min-width": "170px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},
			{
				field: "materialName",
				title: "名称",
				valign: "middle",
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
				},

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
				},

			},
			{
				field: "brandOrOriginPlace",
				title: "品牌/产地",
				valign: "middle",
				align: "center",
				halign: "center",
				colspan: 1,
				rowspan: 2,
				width: "200px",
				cellStyle: {
					css: {
						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},
			{
				field: "applyNum",
				title: "申请号",
				valign: "middle",
				align: "center",
				colspan: 1,
				rowspan: 2,
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
				valign: "middle",
				align: "center",
				halign: "center",
				width: '100px',
				colspan: 1,
				rowspan: 2,
				cellStyle: {
					css: {
						"min-width": "100px",
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
				width: "80px",
				cellStyle: {
					css: {
						"min-width": "80px",
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
				width: "120px",
				cellStyle: {
					css: {
						"min-width": "120px",
						"white-space": "nowrap"
					}
				},
				formatter: function (value, row, index) {
					if (value) {
						return parseFloat(value)
					}

				}

			},
			{
				field: "deliveryDate",
				title: "要求交货期(订单后xx天)",
				valign: "middle",
				align: "center",
				halign: "center",
				colspan: 1,
				rowspan: 2,
				width: "150px",
				cellStyle: {
					css: {
						"min-width": "150px",
						"white-space": "nowrap"
					}
				},
				/* formatter: function (value, row, index) {
					if (value) {
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
				width: "90px",
				cellStyle: {
					css: {
						"min-width": "90px",
						"white-space": "nowrap"
					}
				},
				formatter: function (value, row, index) {
					if (value) {
						return '<span>' + parseFloat(value) + '</span>'
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
				cellStyle: function (value, row, index) {
					//						var val = (isNaN(Number(row.budgetPrice) - Number(row.minPrice))) ? 0 : (Number(row.budgetPrice) - Number(row.minPrice));
					if (parseFloat(value) < 0) {
						return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all", "background": "red" } }
					} else {
						return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all" } }
					}
				},
				formatter: function (value, row, index) {
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
				formatter: function (value, row, index) {
					if (value == '0') {
						return '<span>是</span>'
					} else {
						return '<span>否</span>'
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
				//				width: "90px",
				cellStyle: function (value, row, index) {
					if (value) {
						return {
							css: {
								//								"min-width": "90px",
								"white-space": "nowrap"
							}
						}
					} else {
						return {}
					}

				},

			},
			{
				field: "biddingPrice",
				title: "建议成交价",
				valign: "middle",
				align: "center",
				halign: "center",
				colspan: 1,
				rowspan: 2,
				//				width: "90px",
				cellStyle: function (value, row, index) {
					if (value) {
						return {
							css: {
								//								"min-width": "90px",
								"white-space": "nowrap"
							}
						}
					} else {
						return {}
					}

				},
				formatter: function (value, row, index) {
					if (value) {
						return '<span>' + parseFloat(value) + '</span>'
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
				//				width: "90px",
				cellStyle: function (value, row, index) {
					if (value) {
						return {
							css: {
								//								"min-width": "90px",
								"white-space": "nowrap"
							}
						}
					} else {
						return {}
					}

				},
				formatter: function (value, row, index) {
					if (value) {
						return '<span>' + parseFloat(value) + '</span>'
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
				//				width: "90px",
				formatter: function (value, row, index) {
					if (value) {
						return parseFloat(value) + "%"
					}

				},
				cellStyle: function (value, row, index) {
					if (value) {
						return {
							css: {
								//								"min-width": "90px",
								"white-space": "nowrap"
							}
						}
					} else {
						return {}
					}

				},

			},
				// {
				// 	field: "remark",
				// 	title: "备注",
				// 	valign: "middle",
				// 	align: "center",
				// 	halign: "center",
				// 	colspan: 1,
				// 	rowspan: 2,
				// 	cellStyle: {
				// 		css: {
				// 			"width": "200px",
				// 			"white-space": "nowrap"
				// 		}
				// 	},

				// },
			],

		];
		if (offerData.auctionModel == 1) {
			col[0].push({
				field: "isFailAuction",
				title: "&nbsp;竞价失败&nbsp;",
				valign: "middle",
				align: "center",
				colspan: 1,
				rowspan: 2,
				halign: "center",
				formatter: function (value, row, index) {
					if (Number(row.budgetPrice) - Number(row.minPrice) < 0) {
						isHasFail = true;
						if (value == 1) {
							return "否";
						} else {
							return "是";
						}

					} else {
						return;
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
				formatter: function (value, row, index) {
					return index + 1;
				}
			},
			{
				field: "materialNum",
				title: "物料号",
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
				},

			},
			{
				field: "materialName",
				title: "名称",
				align: "center",
				halign: "center",
				//				width: "200px",
				cellStyle: {
					css: {
						//						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},
			{
				field: "materialModel",
				title: "规格型号",
				align: "left",
				//				width: "200px",
				cellStyle: {
					css: {
						//						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},
			{
				field: "brandOrOriginPlace",
				title: "品牌/产地",
				align: "center",
				halign: "center",
				//				width: "200px",
				cellStyle: {
					css: {
						//						"min-width": "200px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},
			{
				field: "applyNum",
				title: "申请号",
				valign: "middle",
				align: "center",
				//				width: "170px",
				cellStyle: {
					css: {
						//						"min-width": "170px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},

			},



			{
				field: "materialUnit",
				title: "单位",
				align: "center",
				halign: "center",
				//				width: '100px',

			},
			{
				field: "count",
				title: "数量",
				align: "center",
				halign: "center",
				//				width: '80px',
				cellStyle: {
					css: {
						//						"min-width": "80px",
						"white-space": "nowrap"
					}
				},

			},
			{
				field: "budgetPrice",
				title: "预算价",
				align: "center",
				halign: "center",
				//				width: '120px',
				cellStyle: {
					css: {
						//						"min-width": "120px",
						"white-space": "nowrap"
					}
				},

			},
			{
				field: "deliveryDate",
				title: "要求交货期(订单后xx天)",
				align: "center",
				halign: "center",
				//				width: "120px",
				cellStyle: {
					css: {
						//						"min-width": "120px",
						"white-space": "nowrap"
					}
				},
				/* formatter: function (value, row, index) {
					if (value) {
						return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");

					}

				} */

			},
			{
				field: "minPrice",
				title: "最低单价",
				align: "center",
				halign: "center",
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
				cellStyle: function (value, row, index) {
					//						var val = (isNaN(Number(row.budgetPrice) - Number(row.minPrice))) ? 0 : (Number(row.budgetPrice) - Number(row.minPrice));
					if (parseFloat(value) < 0) {
						return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all", "background": "red" } }
					} else {
						return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all" } }
					}
				},
				formatter: function (value, row, index) {
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
				formatter: function (value, row, index) {
					if (value == '0') {
						return '<span>是</span>'
					} else {
						return '<span>否</span>'
					}

				}

			},
			{
				field: "bargainResult",
				title: "议价结果",
				align: "center",
				halign: "center",

			},
			{
				field: "biddingPrice",
				title: "建议成交价",
				align: "center",
				halign: "center",

			},
			{
				field: "priceDefferences",
				title: "差价(预算价-建议成交价)",
				align: "center",
				halign: "center",
			},
			{
				field: "priceDefferencesPercent",
				title: "差价%",
				align: "center",
				halign: "center",

			},
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
			],

		]
	}

}
//清单竞价

//下载附件
function openDowload(path, name) {
	if (name) {
		var url = config.FileHost + "/FileController/download.do" + "?fname=" + name + "&ftpPath=" + path;
		window.location.href = $.parserUrlForToken(url);
	} else {
		var url = config.FileHost + "/FileController/download.do" + "?fname=" + filesName + "&ftpPath=" + path;
		window.location.href = $.parserUrlForToken(url);
	}

}