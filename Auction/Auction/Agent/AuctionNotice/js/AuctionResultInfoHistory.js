var projectType;
var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id");

var projectId = getUrlParam("projectId");
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do"

//发布提交接口
var urlInsertProjectBidResult1 = top.config.AuctionHost + "/ProjectBidResultController/insertProjectBidResult.do?";
var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertJjProjectBidResult.do";
var urlInsertNewProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertNewJjProjectBidResult.do?";//代理服务费
var urlInsertNewProjectBidResult1 = top.config.AuctionHost + "/ProjectBidResultController/insertNewProjectBidResult.do?";//代理服务费
//var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getMXAllSupplieres.do" //供应商
var singleOfferListUrl = top.config.AuctionHost + "/AuctionSfcSingleOfferesController/getLastThreeOfferes.do"
var urlSendMsg = top.config.AuctionHost + "/InFormController/inFormUser";
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false;
var BidResultItem = []; //分项集合
var item = [];
var auctionModel = ""; //按照明细还是包件
var auctionType;
var detailTable = [];
var listData = []
var columnsArry = [];
var returnData = [];
var singleOfferDatas;

var price = "";
var subData = "";
var boot;
var msgloading;
var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型
var itemList = [];
var arrList = []
var businessid = '';
var findPackageInfoData;
var ue;
var RenameData = {};
$(function () {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	if (keyId == 'undefined') {
		$("input[name='pushPlatform'][value=2]").attr("checked", true); //公告发布媒
		$("input[name='days']").val("1"); //公告时间
		keyId = "";
	}
	var para = ""; //查看数据对象
	var ulr = ""; //查看数据接口
	$("input[name='resultType'][value='0']").attr("checked", true); //默认中选
	$("input[name='isShow'][value='0']").attr("checked", true); //默认显示盖章
	//有无中标人
	$("[name='isWinner']").click(function () {
		var val = $("[name='isWinner']:checked").val();
		if (val == 1) {
			$("#bidResultInfo .isBid").each(function () {
				$(this).attr('disabled',false);
				$(this).change();
			})
		}else{
			$("#bidResultInfo .isBid").each(function () {
				$(this).val('1').attr('disabled',true);
				$(this).change();
			})
		}
	});
	$("input[name='isPublic']").attr("disabled", "disabled");
	$('.view').show();
	$('.edit, .red').hide();
	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
	$("input[name='isWinner']").attr("disabled", "disabled"); //有无中选人
	$("#btn_submit").hide(); //提交隐藏
	new UEditorEdit({
		contentKey:'tzscontent',
		pageType:'view',
	})
	// url = top.config.AuctionHost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
	para = {
		id: keyId,
		packageId: packageId,
		projectId: projectId,
		packageId: packageId,
		tenderType: 1 //0为询价采购，1为竞价采购，2为竞卖
	}
	$.ajax({
		url: top.config.AuctionHost + "/BidResultHisController/findBidResultInfo.do",
		type: 'get',
		data: para,
		dataType: 'json',
		async: false,
		success: function (result) {
			if(!result.success){
				top.layer.alert(result.message);
				return
			}
			var data = result.data;
			findPackageInfoData = result.data;
			auctionModel = data.auctionModel; //保存包件还是明细
			auctionType = data.auctionType;
			projectType = data.projectType;
			arrList = data.bidResultItems;
			mediaEditor.setValue(data);
			$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			
			if (auctionType == '6') {
				//				if(type!='view'){

				//				}
				$(".auctionModel").hide();
				$('.colspan3').attr('colspan','3');
				$("#noList").hide();
				$("td[id]").each(function () {
					$(this).html(data[this.id]);
				});
				$('#days').html(data.days?data.days:'');
				$('#title').html(data.title?data.title:'');
				$('#noticeContent').html(data.content?data.content:'');
				$('[name=pushPlatform]').val([data.pushPlatform]);
				//查看页面用bidResultItems数据显示
				if (auctionModel != 1) {
					for (var i = 0; i < arrList.length; i++) {
						arrList[i].supplierEnterpriseName = arrList[i].enterpriseName;
						arrList[i].noTaxRateTotalPrice = arrList[i].bidPrice;
						arrList[i].supplierEnterpriseId = arrList[i].supplierId;
					}

					listTitle()
					intableList();
					$('#detailResult').bootstrapTable("load", arrList);
				} else {
					supplier();
					detailListTable();
				}


				findWorkflowCheckerAndAccp(data.id);

			} else if (auctionType == '7') {
				$(".auctionModel").hide();
				$('.colspan3').attr('colspan','3');
				$("#noList").hide();
				$("td[id]").each(function () {
					$(this).html(data[this.id]);
				});
				$('#days').html(data.days?data.days:'');
				$('#title').html(data.title?data.title:'');
				$('#noticeContent').html(data.content?data.content:'');
				$('[name=pushPlatform]').val([data.pushPlatform]);
				for (var i = 0; i < arrList.length; i++) {
					arrList[i].supplierEnterpriseName = arrList[i].enterpriseName;
					arrList[i].noTaxRateTotalPrice = arrList[i].bidPrice;
					arrList[i].supplierEnterpriseId = arrList[i].supplierId;
				}
				setSingleOfferColumns();
				intableList();
				$("#detailResult").bootstrapTable('load', arrList)
				// supplier();
				// detailListTable()
				findWorkflowCheckerAndAccp(data.id);

			} else {
				subData = data.subDate;
				//findWorkflowCheckerAndAccp(data.id);
				$(".isWatch").hide();
				$(".employee").hide(); //隐藏审核人

				$("td[id]").each(function () { //填冲表格
					$(this).html(data[this.id]);
				});
				$('#days').html(data.days?data.days:'');
				$('#title').html(data.title?data.title:'');
				$('[name=pushPlatform]').val([data.pushPlatform]);
				$('#noticeContent').html(data.content?data.content:'');
				$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
				$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章
				$("input[name='isWinner'][value=" + data.isWinner + "]").attr("checked", true); //有无中选人

				if (data.resultType == 1) {
					$(".isbid").hide(); //隐藏采购结果中选
				} else {
					if (auctionModel == 0) {
						BidResultItem = data.bidResultItems;
						if (BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
							$("#whyFailureTr").show();
							$("#whyFailure").html("无供应商报价");
							return;
						}
						/*if(BidResultItem != undefined && BidResultItem.length > 0) {
							for(var i = 0; i < BidResultItem.length; i++) { //中选加载
								if(BidResultItem[i].isBid == 0) {
									$("#enterpriseName").html(BidResultItem[i].enterpriseName);
									$("#bidPrice").html(BidResultItem[i].bidPrice);
								}
							}
						} else {
							$(".isbid").hide(); //隐藏采购结果中选
						}*/
					}
					/*else {
						$(".isbid").hide(); //隐藏采购结果中选
					}*/
				}

				if (auctionModel == 0) {
					var suppliertalbe = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td>备注</td><tr>";
					var auctionPackageDetaileds = data.auctionPackageDetaileds;
					for (var j = 0; j < auctionPackageDetaileds.length; j++) {
						suppliertalbe += "<tr>";
						suppliertalbe += "<td>" + (j + 1) + "</td>";
						suppliertalbe += "<td style='text-align:left;'>" + (auctionPackageDetaileds[j].detailedName || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedVersion || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedCount || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedUnit || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedContent || "") + "</td>";
						suppliertalbe += "</tr>";
					}
					$("#auctionPackageDetaileds").html(suppliertalbe);

					if (data.resultType == 0) { //0为中选通知 1为为中选通知
						var html = "<tr><td>序号</td><td style='text-align: left;'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:80px'>操作</td></tr>";
						for (var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td width='50px'>" + (i + 1) + "</td>";
							html += "<td style='text-align: left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
							html += "<td style='width:110px;'><div class='" + (BidResultItem[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (BidResultItem[i].isBid == 0 ? "中选" : "未中选") + "</div></td>";
							if (!BidResultItem[i].isBid) {
								html += "<td style='width:110px;text-align:center;'>" + (Number(BidResultItem[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
							} else {
								html += "<td></td>";
							}

							//html += "<td style='width:120px;text-align:center;'>" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费

							/*if(BidResultItem[i].resultContent) {
								html += "<input type='hidden' class='bidContent' name='' value='" + BidResultItem[i].resultContent + "'>";
							} else {
								html += "<input type='hidden' class='bidContent' name='' value=''>";
							}*/

							html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
					} else {
						var html = "<tr><td width='50px;'>序号</td><td style='text-align: left;'>供应商名称</td><td>通知类型</td><td style='width:120px'>操作</td></tr>";
						for (var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td>" + (i + 1) + "</td>";
							html += "<td style='text-align: left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";

							/*if(BidResultItem[i].resultContent) {
								html += "<input type='hidden' class='bidContent' name='' value='" + BidResultItem[i].resultContent + "'>";
							} else {
								html += "<input type='hidden' class='bidContent' name='' value=''>";
							}*/

							html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
					}
				} else {

					item = data.auctionPackageDetaileds;
					if (item == undefined || item.length == 0) { //无供应商
						$("#whyFailureTr").show();
						$("#whyFailure").html("无供应商报价");
						return;
					}
					//"<td>供应商名称</td><tr>";

					//就在这里过滤掉没有报价的设备信息
					let cache_item = [];
					for (let a = 0; a < item.length; a++) {
						// 如果有人报价 则push
						if (item[a].bidResultItems.length > 0) cache_item.push(item[a]);
					}
					item = cache_item;
					// 过滤完成

					var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td width='50px'>排名</td><td style='text-align: left;'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
					for (var j = 0; j < item.length; j++) {
						var count = item[j].bidResultItems.length;
						html += "<tr>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (j + 1) + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
						if (data.resultType == 0) {
							for (var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;text-align: left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" +  showBidderRenameList(item[j].bidResultItems[i].supplierId, item[j].bidResultItems[i].enterpriseName, RenameData, 'body') + "</td>";
								/*html += "<input type='hidden' class='detailedName' data-tr='" + j + "'  data-td='" + i + "' value=" + item[j].detailedName + " >";*/
								html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
								if (!item[j].bidResultItems[i].isBid) {
									html += "<td style='width:110px;text-align:center;'  class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "' >" + (Number(item[j].bidResultItems[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
								} else {
									html += "<td></td>";
								}

								//html += "<td style='width:120px;text-align:center;'  data-tr='" + j + "'  data-td='" + i + "' >" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
								/*if(item[j].bidResultItems[i].resultContent) {
									html += "<input type='hidden' class='bidContent' name='' value='" + item[j].bidResultItems[i].resultContent + "'>";
								} else {
									html += "<input type='hidden' class='bidContent' name='' value=''>";
								}*/

								html += "<td style='vertical-align: middle;text-align: center;'><a href='javascript:void(0)'  data-tr='" + j + "'  data-td='" + i + "' class='viewBidResult btn-sm btn-primary' onclick='viewBidResults(" + i + "," + j + ",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						} else {
							for (var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
								html += "<td style='width:110px;' class='isBidO  text-danger'  data-tr='" + j + "'  data-td='" + i + "'>未中选</td>";

								/*if(item[j].bidResultItems[i].resultContent) {
									html += "<input type='hidden' class='bidContent' name='' value='" + item[j].bidResultItems[i].resultContent + "'>";
								} else {
									html += "<input type='hidden' class='bidContent' name='' value=''>";
								}*/

								html += "<td style='vertical-align: middle;text-align:center;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary'  onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						}

					}

					$("#bidResultInfo").html(html);

				}

				if (keyId != 'undefined' && keyId) {
					//审批记录
					$(".workflowList").show();
					findWorkflowCheckerAndAccp(keyId);
				}

			}
			projectServiceFee = data.projectServiceFee; //代理服务费
			/*代理服务费*/
			initAgentFee({
				purchaseType: 1,
				projectId: projectId,
				packageId: packageId,
				id: keyId
			});
			/*代理服务费*/
			initMediaVal(data.options, {
				disabled: true,
				stage: 'jgtzs',
				projectId: projectId,
				packageId: packageId,
			});
			//历史记录
			if(data.bidResultHisList){
				resultNoticeHistoryTable(data.bidResultHisList, '1')
			}
			if (data.projectSource > 0) {
				$("#projectName").html(data.projectName + '<span class="red">(重新竞价)</span>');
			}
		}
	})
})
function setSingleOfferColumns() {
	columnsArry = [{
		title: '序号',
		align: 'center',
		width: '50px',
		formatter: function (value, row, index) {
			var pageSize = $('#BidResultList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条
			var pageNumber = $('#BidResultList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页
			return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号
		}
	},
		{
			field: 'supplierEnterpriseName',
			title: '供应商名称',
			align: 'left',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
			}
		},
		{
			field: 'isBid',
			title: '通知类型',
			align: 'left',
			width: '80',
			formatter: function (value, row, index) {
				if (value == '0') {
					return '中选<input type="hidden" class="isBid" value="0">'
				} else {
					return '未中选<input type="hidden" class="isBid" value="1">'
				}
			}
		},
		{
			field: 'noTaxRateTotalPrice',
			title: '成交金额(元)',
			align: 'left',
			formatter: function (value, row, index) {
				if (row.isBid == '1') {
					return ""
				} else {
					return value
				}
			}
		},
		{
			field: 'action',
			title: '操作',
			align: 'center',
			width: '160',
			formatter: function (value, row, index) {
				var yl = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"view\")'>预览</a>&nbsp;&nbsp"
				var view = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"views\")'>查看</a>"
				return view
			}
		}
	]
}

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
					if (auctionModel == '1') {

						$("#suppSelect").show()
					}
					listTitle()
				} else {
					$("#suppSelect").hide()
					$("#whyFailureTrs").show();
					$("#whyFailures").html("无供应商报价");
					$("#detailResult").hide()

				}

			}
		}
	})
}

//清单竞价数据
function detailListTable() {
	//按明细
	if (auctionModel == '1') {
		boot = true
		$.ajax({
			//			url: top.config.AuctionHost + "/AuctionSfcOfferController/getMXEnterpriseTatalPrice.do",
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getMXEnterpriseTatalPriceNew.do",
			type: "post",
			async: false,
			data: {
				packageId: packageId,
			},
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
				//				msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
				msgloading = top.layer.msg('数据加载中', {
					icon: 0
				});
			},
			success: function (data) {
				if (data.success) {
					detailTable = [];
					var list = data.data
					if (list && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var auctionSfcOfferes = list[i].auctionSfcOfferesList;

							if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {

								$("#suppSelect").html('查看结果通知书')
								for (var c = 0; c < auctionSfcOfferes.length; c++) {
									auctionSfcOfferes[c].applyNum = list[i].applyNum;
									auctionSfcOfferes[c].materialNum = list[i].materialNum;
									auctionSfcOfferes[c].materialModel = list[i].materialModel;
									auctionSfcOfferes[c].materialName = list[i].materialName;
									auctionSfcOfferes[c].detailId = list[i].id;
									auctionSfcOfferes[c].ids = list[i].id;
									detailTable.push(auctionSfcOfferes[c])

								}


								//									intableList()
							}


						}
						if (detailTable.length < 2000) {
							listData = detailTable;
							intableList();
							$('#detailResult').bootstrapTable("load", listData);
						} else {
							var total = detailTable.length;
							var pageSize = Math.ceil(total / 700)
							var pageIndex = 1;
							var start = (pageIndex - 1) * 700
							var end = start + 700
							listData = detailTable.slice(start, end)
							intableList();
							$('#detailResult').bootstrapTable("load", listData);

							var LockMore = false; //锁定
							$(window).scroll(function (event) {
								var supportPageOffset = window.pageXOffset !== undefined;
								var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
								var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
								var wScrollY = y; // 当前滚动条位置
								var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）
								var bScrollH = document.body.scrollHeight; // 滚动条总高度
								if ((wScrollY + wInnerH) + 50 >= bScrollH) {
									//触底
									if (pageIndex >= pageSize) {
										// 滚动太快，下标超过了数组的长度
										pageIndex = pageSize
										return;
									} else {
										pageIndex++
										start = (pageIndex - 1) * 700
										end = start + 700;
										var listTable1 = detailTable.slice(start, end)

										$('#detailResult').bootstrapTable("append", listTable1);
									}

									if (LockMore) {
										return false;
									}
								}
							});
						}

					}

				} else {
					top.layer.alert(data.message);

				}
			},
			complete: function () {

				parent.layer.close(msgloading);

			}
		});

	} else { //总价
		boot = false
		$.ajax({
			//			url: top.config.AuctionHost + "/AuctionSfcOfferController/getZJEnterpriseTatalPrice.do",
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getZJEnterpriseTatalPriceNew.do",
			type: "post",
			async: false,
			data: {
				packageId: packageId,
			},
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
				//				msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
				msgloading = top.layer.msg('数据加载中', {
					icon: 0
				});
			},
			success: function (data) {
				if (data.success) {
					listTitle()
					var details = data.data
					if (details && details.length > 0) {
						detailTable = data.data
						if (detailTable.length < 2000) {
							listData = detailTable;
							intableList();
							$('#detailResult').bootstrapTable("load", listData);
						} else {
							var total = detailTable.length;
							var pageSize = Math.ceil(total / 700)
							var pageIndex = 1;
							var start = (pageIndex - 1) * 700
							var end = start + 700
							listData = detailTable.slice(start, end)
							intableList();
							$('#detailResult').bootstrapTable("load", listData);

							var LockMore = false; //锁定
							$(window).scroll(function (event) {
								var supportPageOffset = window.pageXOffset !== undefined;
								var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
								var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
								var wScrollY = y; // 当前滚动条位置
								var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）
								var bScrollH = document.body.scrollHeight; // 滚动条总高度
								if ((wScrollY + wInnerH) + 50 >= bScrollH) {
									//触底
									if (pageIndex >= pageSize) {
										// 滚动太快，下标超过了数组的长度
										pageIndex = pageSize
										return;
									} else {
										pageIndex++
										start = (pageIndex - 1) * 700
										end = start + 700;
										var listTable1 = detailTable.slice(start, end)

										$('#detailResult').bootstrapTable("append", listTable1);
									}

									if (LockMore) {
										return false;
									}
								}
							});
						}

						//						intableList()
					} else {
						$("#suppSelect").hide()
						$("#whyFailureTrs").show();
						$("#whyFailures").html("无供应商报价");
						$("#detailResult").hide()
					}

				} else {
					top.layer.alert(data.message);

				}
			},
			complete: function () {

				parent.layer.close(msgloading);

			}
		});

	}

}

function listTitle() {
	if (auctionModel != '1') { //按总价
		columnsArry = [{
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function (value, row, index) {
				var pageSize = $('#BidResultList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条
				var pageNumber = $('#BidResultList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号
			}
		},
			{
				field: 'supplierEnterpriseName',
				title: '供应商名称',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
				}
			},
			{
				field: 'isBid',
				title: '通知类型',
				align: 'left',
				width: '80',
				formatter: function (value, row, index) {
					if (value == '0') {
						return '中选<input type="hidden" class="isBid" value="0">'
					} else {
						return '未中选<input type="hidden" class="isBid" value="1">'
					}
				}
			},
			{
				field: 'noTaxRateTotalPrice',
				title: '成交金额(元)',
				align: 'left',
				formatter: function (value, row, index) {
					if (row.isBid == '1') {
						return ""
					} else {
						return value
					}
				}
			},

			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '160',
				formatter: function (value, row, index) {
					var view = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"views\")'>查看</a>"
					return view

				}
			}
		]

	} else {//按明细
		columnsArry = [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',

			formatter: function (value, row, index) {
				var pageSize = $('#BidResultList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条
				var pageNumber = $('#BidResultList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号
			}
		},
			{
				field: 'ids',
				title: '规格型号',
				align: 'left',
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function (value, row, index) {
					return row.materialModel
				}
			},
			{
				field: 'detailId',
				title: '名称(内容)',
				align: 'left',
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function (value, row, index) {
					return row.materialName
				}
			},

			{
				field: 'supplierEnterpriseName',
				title: '供应商名称',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
				}

			},
			{
				field: 'isBid',
				title: '通知类型',
				align: 'left',
				colspan: 1,
				width: '80',
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				},
				formatter: function (value, row, index) {
					if (value == '0') {
						return '中选<input type="hidden" class="isBid" value="0">'
					} else {
						return '未中选<input type="hidden" class="isBid" value="1">'
					}
				}
			},
			{
				field: 'noTaxRateTotalPrice',
				title: '成交金额(元)',
				align: 'left',
				formatter: function (value, row, index) {
					if (row.isBid == '1') {
						if (row.isFailAuction == 0) {
							return "/";
						} else {
							return "";
						}
					} else {
						return value
					}
				}
			},
		]
	}
}
//合并单元格
function cellFun() {

	var obj = {};
	for (var item in detailTable) {


		var items = detailTable[item]['detailId'];
		obj[items] = (obj[items] + 1) || 1
	}
	var arrIndex = [];
	var tableIndex = 0;
	for (var key in obj) {
		arrIndex.push(obj[key])
		var option = [{
			index: tableIndex,
			field: 'detailId',
			colspan: 1,
			rowspan: obj[key],

		}]
		for (var h = 0; h < option.length; h++) {
			$("#detailResult").bootstrapTable('mergeCells', option[h])
		}
		tableIndex += obj[key]
	}
}
function cellFuns() {
	var obj = {};
	for (var item in detailTable) {
		var items = detailTable[item]['ids'];
		obj[items] = (obj[items] + 1) || 1
	}
	var arrIndex = [];
	var tableIndex = 0;
	for (var key in obj) {
		arrIndex.push(obj[key])
		var option = [{
			index: tableIndex,
			field: 'ids',
			colspan: 1,
			rowspan: obj[key],

		}]
		for (var h = 0; h < option.length; h++) {
			$("#detailResult").bootstrapTable('mergeCells', option[h])
		}
		tableIndex += obj[key]
	}
}
function intableList() {
	$("#detailResult").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: columnsArry,
		onAll: function () {
			if (auctionModel == 1) {

				cellFun();
				cellFuns();

			}
		}
	});
	//		$("#detailResult").bootstrapTable("load", detailTable);

}
//按清单预览
function resultView(index, types) {
	var rows = $("#detailResult").bootstrapTable('getData')[index];
	if (arrList && arrList.length > 0) {
		for (var i = 0; i < arrList.length; i++) {
			if (rows.supplierEnterpriseId == arrList[i].supplierId) {
				rows.resultContent = arrList[i].resultContent;
				rows.pdfUrl = arrList[i].pdfUrl
			}
		}
	}
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {

		rows.isShow = $('input[name="isShow"]:checked').val()
	} else {
		rows.isShow = 0
	}
	rows.projectId = projectId;
	rows.packageId = packageId;
	rows.supplierId = rows.supplierEnterpriseId;
	rows.auctionType = auctionType;
	rows.auctionModel = auctionModel;
	rows.packageDetailedId = rows.id;
	//	rows.isBid = rows.isBid

	if (types == "view") {
		if ($("#bidResultSelect" + index).val() != undefined && $("#bidResultSelect" + index).val() != "") {
			rows.isBid = $("#bidResultSelect" + index).val();
		} else {
			rows.isBid = rows.isBid
		}
		getContentHtml(rows, types);
	} else {
		if (rows.pdfUrl) {
			previewPdf(rows.pdfUrl);
		} else {
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'Auction/Auction/Agent/AuctionNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(rows, types);
				}
			});
		}

	}
}
$("#btn_close").on("click", function () {
	//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
})

//按包件
function viewBidResult($index, temp) {
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
		BidResultItem[$index].isShow = $('input[name="isShow"]:checked').val()
	} else {
		BidResultItem[$index].isShow = 0
	}
	BidResultItem[$index].projectId = projectId;
	BidResultItem[$index].packageId = packageId;
	if (temp == "view") {
		if ($('select[name= "bidResultItems[' + $index + '].isBid"]').val() != undefined && $('select[name= "bidResultItems[' + $index + '].isBid"]').val() != "") {
			BidResultItem[$index].isBid = $('select[name= "bidResultItems[' + $index + '].isBid"]').val();
		} else {
			BidResultItem[$index].isBid = 1
		}
		getContentHtml(BidResultItem[$index], temp);
	} else if (temp == "views") {
		if (BidResultItem[$index].pdfUrl) {
			previewPdf(BidResultItem[$index].pdfUrl);
		} else {
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'Auction/Auction/Agent/AuctionNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(BidResultItem[$index], temp);
				}
			});
		}

	}
}

//按明细
function viewBidResults($index, $temp, flag) {

	var resDate = {};
	resDate.projectId = projectId;
	resDate.packageId = packageId;
	if (flag == "view") { //预览
		if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
			item[$temp].offerItems[$index].isShow = $('input[name="isShow"]:checked').val()
		} else {
			item[$temp].offerItems[$index].isShow = 0
		}

		if ($("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val() != undefined && $("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val() != "") {
			item[$temp].offerItems[$index].isBid = $("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val();
		} else {
			item[$temp].offerItems[$index].isBid = 1
		}

		item[$temp].offerItems[$index].auctionModel = auctionModel;
		//明细id
		item[$temp].offerItems[$index].packageDetailedId = item[$temp].id;
		resDate = item[$temp].offerItems[$index];
		resDate.projectId = projectId;
		resDate.packageId = packageId;
		getContentHtml(resDate, flag)
	} else {
		//查看
		resDate = item[$temp].bidResultItems[$index];
		resDate.auctionModel = auctionModel;
		if (item[$temp].bidResultItems[$index].pdfUrl) {
			previewPdf(item[$temp].bidResultItems[$index].pdfUrl);
		} else {
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'Auction/Auction/Agent/AuctionNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(resDate, flag);
				}
			});
		}
	}

}
//全屏查看公告
$('body').on('click', '.fullScreen', function () {
	var content = $('#noticeContent').html();
	parent.layer.open({
		type: 2
		, title: '查看公告信息'
		, area: ['100%', '100%']
		, content: 'bidPrice/Public/model/fullScreenView.html'
		, resize: false
		, success: function (layero, index) {
			var body = parent.layer.getChildFrame('body', index);
			var iframeWind = layero.find('iframe')[0].contentWindow;
			body.find('#noticeContent').html(content)
		}
		//确定按钮
		, yes: function (index, layero) {
			parent.layer.close(index);
		}

	});
});

// 修改预览查看为pdf文件弹框
function getContentHtml(datall, type, types) {
	function openViewPdf(resultContent) {
		// 改为查看pdf页面形式
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/ProjectBidResultController/previewResultPdf",
			async: true,
			data: {
				'projectId': projectId,
				'isShow': $('input[name="isShow"]:checked').val(),
				'resultContent': resultContent,
			},
			success: function (data) {
				if (data.success) {
					previewPdf(data.data)
				}
			}
		});
	}
	if (type == "views") {
		if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
			openViewPdf(datall.resultContent)
			return
		}
	};
	var isBidCode = datall.isBid;
	if (types == 'mx') {
		$.ajax({
			type: "post",
			url: parent.config.AuctionHost + '/AuctionSfcOfferBargainResultController/preview.do',
			data: {
				"packageId": datall.packageId,
				"supplierEnterpriseId": datall.supplierId,
				"auctionSfcOfferes": datall.list ? datall.list : null,
				"isBid": datall.isBid
			},
			dataType: "json",
			success: function (result) {
				if (result.success) {

					if (type == "view" || type == "views") {
						if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
							openViewPdf(datall.resultContent)
						} else {
							openViewPdf(result.data)
						}
					}
				}
			}
		});
	} else {
		var url;
		var data;

		if (datall.auctionType == '6') {
			url = parent.config.AuctionHost + '/AuctionSfcOfferBargainResultController/preview.do'
			data = {
				"packageId": datall.packageId,
				"supplierEnterpriseId": datall.supplierId,
				//					"auctionSfcOfferes":datall.list?datall.list:null,
				"isBid": datall.isBid
			}
		} else {
			url = parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do'
			data = {
				"auctionType": datall.auctionType,
				"packageId": datall.packageId,
				"projectId": datall.projectId,
				"examType": datall.examType,
				'type': "jgtzs",
				"tenderType": 1,
				"isBid": isBidCode,
				"supplierId": datall.supplierId,
				"auctionModel": datall.auctionModel,
				"detailedId": datall.packageDetailedId
			}
		}


		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			async: false,
			data: data,
			success: function (result) {
				if (result.success) {

					if (type == "view" || type == "views") {
						if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
							openViewPdf(datall.resultContent)
						} else {
							openViewPdf(result.data);
						}
					}
				}
			}
		});
	}
}
//按明细通知预览
function resultViewMx() {
	var obj = {}
	if (itemList.length > 0) {
		obj.list = itemList
	}
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {

		obj.isShow = $('input[name="isShow"]:checked').val()
	} else {
		obj.isShow = 0
	}
	obj.projectId = projectId;
	obj.packageId = packageId;
	obj.auctionType = auctionType;
	obj.auctionModel = auctionModel;
	obj.itemArr = arrList;
	top.layer.open({
		type: 2,
		title: "选择供应商",
		area: ['400px', '250px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Agent/AuctionNotice/modal/selectSupplier.html?id=' + packageId,
		success: function (layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsgMore(obj, detailTable, "views",getContentHtml);
		}
	});
}