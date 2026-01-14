var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + 'WorkflowController/findWorkFlowWasteRecords.do';
var finalResult = top.config.offerhost + '/info/finalResult';
var finalLogs = top.config.offerhost + '/offer/logs';
var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口

var urlGetCheckReal = top.config.AuctionHost + "/WorkflowController/findWorkFlowWasteRecords"
var urlGetBiddingApprovalRecord = top.config.AuctionHost + "/WorkflowController/findWorkFlowWasteRecords"//会签记录
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
var WORKFLOWTYPE = "fjwz_jmhq"; //申明项目公告类型
var isAgent; //是否代理项目
var detailedId = "";
var offerData = "";
var lunnum;
var checkSuccess = top.config.AuctionHost + "/WorkflowController/wasteWorkFlowAuditingOK.do";
var checkNoSuccess = top.config.AuctionHost + "/WorkflowController/wasteWorkFlowAuditingNO.do";
var flag = getUrlParam("flag");
if(flag) {
	$("#commitBtn").hide();
	getCheckReal();
}

$(function() {
	getOfferInfo();
	if(tType != null) {
		var result = JSON.parse(sessionStorage.getItem("auctionresult"));
	}
	//竞价文件提交信息列表
	getOfferFileInfo(projectId);
	detailItem();

	if(createType == 1) {
		$(".modify").hide();
		$('.zzbj').attr('readonly', true);
		$("#againDetailItemSupplier").hide();
		$(".chooseSuppler").hide();
		$(".rebut").hide();
		$("#commitBtn").hide();
	}
	
    getBiddingApprovalRecord();
});

function getMsg(obj) {

	status = obj.checkStatus;
	

	if(status == '已提交审核' || status == '审核通过') {
		
		$(".modify").hide();
		$('.zzbj').attr('readonly', true);

		$("#commitBtn").hide();
		//$(".employee").hide();
	}

	if(status == '未提交') {
		$("#commitBtn").show();
	}

	if(obj.itemState != undefined) {
		itemState = obj.itemState;
		if(itemState == '1' || itemState == '2' || itemState == '4') {
			$(".modify").hide();
			$('.zzbj').attr('readonly', true);
			$("#commitBtn").hide();
		}

	}
}

function getOfferInfo() {
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
				// getFinalResult(offerData);
				getMsg(data)
				lunnum = offerData.saleCount;
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
							case 7:
								$(this).html("单项目竞价");
								break;
							default:
								$(this).html("不限轮次");
								break;
						}
					}
				});
				
				if(data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					if(data.auctionModel == 0) { //按照包件
						$("#offerRank").html("<table id='freePackageRank'></table>");
						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
						//	$("#detail").bootstrapTable("load",)	
					} else { //按照明细
						$(".detail").hide();
						$("#offerRank").html("<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRank'></table></div>");
						$("#offerRecord").html("<div style='width:30%;float: left;'><table id='freeDetailRD' class='table table-bordered pull-left'></table></div><div style='width: 70%;float: left;'><table id='freeDetailRecord'></table></div>");
						freeDetailRank();
						freeDetailRecord();
					}
				} else if(data.auctionType == 7) {
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
		data: {
			packageId: packageId
		},
		success: function(res) {
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
						formatter: function(value, row, index) {
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
						formatter: function(value, row, index) {
							var fileDatas = row.fileDatas;
							console.log(fileDatas)
							if(fileDatas) {
								var html = "<table class='table' style='border-bottom:none'>";
								for(var i = 0; i < fileDatas.length; i++) {
									html += "<tr>";
									html += "<td>" + fileDatas[i].fileName + "</td>"
									html += "<td  width='100px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileDatas[i].fileName + "\",\"" + fileDatas[i].filePath + "\")'>下载</a>&nbsp;"
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
	employeeData.forEach(function(val, index) {
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
			success: function(res) {
				if(res.success) {
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
	if(offerlogs.length > 0 || details.length > 0) {
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
			if(offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
				$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
				detailedId = row.id;
				if(status == '已提交审核' || status == '审核通过') {
					// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
					$(".modify").hide();
					$('.zzbj').attr('readonly', true);
				}

				if(itemState == '1' || itemState == '2' || itemState == '4' || itemState == '3') {
					// $('#freeDetailRank').bootstrapTable('hideColumn', 'bbb');
					// $('#freePackageRank').bootstrapTable('hideColumn', 'aaa');
					// $('#roundRank').bootstrapTable('hideColumn', 'ccc');
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
				field: 'priceType',
				title: '顶价/低价',
				formatter: function(value, row, index) {
					if(value == 0) {
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

	for(var s = 1; s <= lunnum; s++) {
		html += '<tr class="selected">'
		if(s == 1) {
			html += '<td class="bs-checkbox" style="width:50px;"><input checked onclick="getckboxdate(\'' + s + '\')" type="radio" class="rackbox" name="rackbox" id="rackbox_' + s + '"/></td>'
			$.ajax({
				url: finalLogs,
				type: 'post',
				async: false,
				data: {
					'packageId': packageId,
					'biddingTimes': 1
				},
				success: function(data) {
					if(data.success) {
						$("#freeDetailRecord").bootstrapTable("load", data.data);
					}
				}
			})
		} else {
			html += '<td class="bs-checkbox" style="width:50px;"><input onclick="getckboxdate(\'' + s + '\')" type="radio" class="rackbox" name="rackbox" id="rackbox_' + s + '"/></td>'
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
			if(data.success) {
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
											if(data.success == true) {
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
					if(row.filePath) {
						var btn = '<a class="btn-sm btn-primary download" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>下载</a>'
						//						if(offerData.isSendResult == 0 && createType == 0) {
						//							btn += '<a class="btn-sm btn-warning rebut" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-share" aria-hidden="true"></span>驳回</a>'
						//						}
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
				align: 'left'
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
				field: 'enterpriseName',
				title: '规格型号',
				align: 'left'
			},
			{
				field: 'supplierName',
				title: '供应商',
				align: 'left'

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
				align: 'left'

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
			align: 'left'

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
				align: 'left'

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
					if(row.isEliminated != undefined && row.isEliminated == '1') {
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
			if(offerData.offerlogs[index].offerLog !== undefined && offerData.offerlogs[index].offerLog !== null && offerData.offerlogs[index].offerLog !== "") {
				$("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog);
			}
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {

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
					return(value || "无报价人");
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
		'businessId':packageId,
		'workflowType':'fjwz_jmhq'
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
	let check = $("input[name='auditState']:checked").val();
	let workflowContent = $("#content").val();

	if(check) {
		var url;
		if(check == 0) {
			url = checkSuccess;
		} else {
			url = checkNoSuccess;
			if(workflowContent == null || $.trim(workflowContent) == "") {
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
				'workflowType':'fjwz_jmhq',
				'workflowContent': $("#content").val()
			},
			success: function(res) {
				console.log(res);
				if(res.success) {
					parent.$('#ProjectAuditTable').bootstrapTable('refresh');
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					top.layer.alert("审核保存成功")
				} else {
					top.layer.alert("审核保存失败")
					return false;
				}
			}

		})

	} else {
		top.layer.alert("选择审核结果！")
	}

	return false;

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
			projectId: projectId
		},
		async: false,
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
				formatter: function(value, row, index) {
					var fileNameArr = row.fileName.split(","); //文件名数组
					var filePathArr = row.filePath.split(",");
					// var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var html = "<table class='table' style='border-bottom:none'>";
					for(var j = 0; j < filePathArr.length; j++) {
						var filesnames = filePathArr[j].substring(filePathArr[j].lastIndexOf(".") + 1).toUpperCase();
						html += "<tr>";
						html += "<td>" + fileNameArr[j] + "</td>"
						html += "<td  width='100px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
						if(filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
							html += "<a href='javascript:void(0)' data-index='" + j + "' class='btn btn-primary btn-xs previewFile' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
						}
						html += "</span></td></tr>";
					}
					html += "</table>";
					return html;
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
		async: false,
		success: function(result) {
			
		}
	})
}

//回显审核意见
function getCheckReal() {
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
			'businessId': packageId,'workflowType':'fjwz_jmhq',
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

	})

}

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
			'businessId': packageId,
			'workflowType': WORKFLOWTYPE,
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
				if(value == 0) {
					return "审核通过"
				} else if(value == 1) {
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