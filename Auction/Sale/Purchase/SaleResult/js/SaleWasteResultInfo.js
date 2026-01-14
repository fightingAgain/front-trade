var projectType;
var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id");
var projectId = getUrlParam("projectId");
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do"

//发布提交接口 
var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertProjectBidResult.do?";
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var singleOfferListUrl = top.config.AuctionHost + "/AuctionSfcSingleOfferesController/getLastThreeOfferes.do"

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
var checkState = "";
var subData = "";
var boot;
var msgloading;
var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型
var itemList = [];
var arrList = []
var businessid = '';
var RenameData = {};
$(function () {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	if (keyId == 'undefined') {
		keyId = "";
	}
	var para = ""; //查看数据对象
	var ulr = ""; //查看数据接口

	$("input[name='resultType'][value='0']").attr("checked", true); //默认中选
	$("input[name='isShow'][value='0']").attr("checked", true); //默认显示盖章

	//	if(rowData.price != undefined) {
	//		price = rowData.price;
	//	}
	//
	//	if(rowData.checkState == undefined) {
	//		checkState = "预览";
	//	} else {
	//		if(rowData.checkState == '3' || rowData.checkState == "0") {
	//			checkState = "预览";
	//		}
	//	}
	if (type == 'RELEASE') {
		checkState = "预览";
	}

	if (type != 'RELEASE') { //查看

		$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
		$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
		$("#btn_submit").hide(); //提交隐藏
		url = top.config.AuctionHost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
		para = {
			id: keyId,
			packageId: packageId,
			tenderType: 2 //0为询价采购，1为竞价采购，2为竞卖
		}

	} else {
		url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do"; //查看包件
		para = {
			packageId: packageId,
			projectId: projectId,
			tenderType: 2, //0为询价采购，1为竞价采购，2为竞卖
		}
		if (keyId != 'undefined' && keyId) {
			para.bidResultId = keyId;
			businessid = keyId;
		}
		$(".isbid").hide(); //隐藏采购结果中选
	}

	$.ajax({
		url: url,
		type: 'get',
		data: para,
		dataType: 'json',
		async: false,
		success: function (result) {
			var data = result.data;
			auctionModel = data.auctionModel; //保存包件还是明细	
			auctionType = data.auctionType;
			projectType = data.projectType
			arrList = data.bidResultItems
			if (auctionType == '6') {
				//				if(type!='view'){	

				//				}
				$(".auctionModel").hide();
				$("#noList").hide();
				$("td[id]").each(function () {
					$(this).html(data[this.id]);
				});
				supplier();
				detailListTable()
				if (type == "RELEASE") { //当发布时		
					WorkflowUrl(); //加载审核人
					findWorkflowCheckerAndAccp(data.projectId);
				} else {
					findWorkflowCheckerAndAccp(data.id);
					$(".employee").hide(); //隐藏审核人
				}

			} else if (auctionType == '7') {
				$(".auctionModel").hide();
				$("#noList").hide();
				$("td[id]").each(function () {
					$(this).html(data[this.id]);
				});
				singleOfferList();
				// supplier();
				// detailListTable()
				if (type == "RELEASE") { //当发布时		
					WorkflowUrl(); //加载审核人
					findWorkflowCheckerAndAccp(data.projectId);
				} else {
					findWorkflowCheckerAndAccp(data.id);
					$(".employee").hide(); //隐藏审核人
				}
			} else {
				if (type == "RELEASE") { //当发布时				
					WorkflowUrl(); //加载审核人
					$("td[id]").each(function () {
						$(this).html(data[this.id]);
					})
					//findWorkflowCheckerAndAccp(data.projectId);
					if (auctionModel == 0) { //按照包件
						BidResultItem = data.auctionOfferItems;
						var suppliertalbe = "<tr><td style='width:50px;text-align:center' >序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td>备注</td><tr>";
						var auctionPackageDetaileds = data.auctionPackageDetaileds;
						for (var j = 0; j < auctionPackageDetaileds.length; j++) {
							suppliertalbe += "<tr>";
							suppliertalbe += "<td style='width:50px;text-align:center'>" + (j + 1) + "</td>";
							suppliertalbe += "<td style='text-align:left;'>" + (auctionPackageDetaileds[j].detailedName || "") + "</td>";
							suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedVersion || "") + "</td>";
							suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedCount || "") + "</td>";
							suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedUnit || "") + "</td>";
							suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedContent || "") + "</td>";
							suppliertalbe += "</tr>";
						}
						$("#auctionPackageDetaileds").html(suppliertalbe);

						if (BidResultItem == undefined || BidResultItem.length == 0) { //无供应商
							$("#whyFailureTr").show();
							$("#whyFailure").html("无供应商报价");
							return;
						}
						var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
						for (var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
							html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
							html += "<input type='hidden' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";

							if (BidResultItem[i].isEliminated != undefined && BidResultItem[i].isEliminated == '0') { //未淘汰
								if (BidResultItem[i].isBid != undefined) {
									if (BidResultItem[i].isBid == 0) {
										//中选
										html += "<td style='width:110px;'><select class='form-control isBid' data-index='" + i + "' name='bidResultItems[" + i + "].isBid'><option value='0'>中选</option><option value='1'>未中选</option></select></td>";
										// html += "<td>中选</td>"
									} else {
										//未中选
										html += "<td style='width:110px;'><select class='form-control isBid' data-index='" + i + "' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
										// html += "<td>未中选</td>"
									}

								} else {
									html += "<td style='width:110px;'><select class='form-control isBid' data-index='" + i + "' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
									// html += "<td>未中选</td>"
								}
							} else {
								html += "<td style='width:110px;'><input type='hidden' name='bidResultItems[" + i + "].isBid' value='1'><span>未中选</span></td>";
							}

							//html += "<td  style='width:100px;'><input type='text' readonly='readonly' class='form-control bidPrice' name='bidResultItems[" + i + "].bidPrice'/></td>";
                           
							if (BidResultItem[i].lastPrice != null) {
								html += "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='" + (Number(BidResultItem[i].lastPrice).toFixed(2)) + "' />" + (Number(BidResultItem[i].lastPrice).toFixed(2)) + "</td>";
							} else {
								if (BidResultItem[i].lastMoney != null) {
									html += "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='" + (Number(BidResultItem[i].lastMoney).toFixed(2)) + "' />" + (Number(BidResultItem[i].lastMoney).toFixed(2)) + "</td>";
								} else {

									html += BidResultItem[i].offerMoney != null ? "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice' value='" + (Number(BidResultItem[i].offerMoney).toFixed(2)) + "' />" + (Number(BidResultItem[i].offerMoney).toFixed(2)) + "</td>" : "<td  style='width:120px;'> </td>";
								}
							}

							//html += price!=""?"<td  style='width:120px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].serviceCharge' value='"+(price.toFixed(2))+"' />"+(price.toFixed(2))+"</td>":"<td  style='width:100px;text-align:center'></td>"; //服务费

							if (BidResultItem[i].resultContent) {
								html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value='" + BidResultItem[i].resultContent + "'>";
							} else {
								html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value=''>";
							}

							html += checkState != "" ? "<td><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult(" + i + ",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='editBidResult(" + i + ")'>编辑</a></td></tr>" : "<td><a href='javascript:void(0)' class='viewBidResult' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
						$(".isBid").change(function () {
							var _index = $(this).attr('data-index');
							var isBidThis = $(this)
							if (BidResultItem[_index].resultContent != "" && BidResultItem[_index].resultContent != undefined) {
								parent.layer.confirm('温馨提示：切换后您编辑的内容将会改变，确定切换？', {
									btn: ['是', '否'] //可以无限个按钮
								}, function (index, layero) {
									BidResultItem[_index].resultContent = "";
									isBidThis.parent().parent().find(".bidContent").val("");
									parent.layer.close(index)
									if (isBidThis == 0) {
										isBidThis.parent().parent().siblings().each(function () {
											if (isBidThis.children().eq(3).children().eq(0).val() == 0) {
												isBidThis.children().eq(3).children().eq(0).val(1);
												isBidThis.children().eq(3).children().eq(0).parent().siblings().eq(3).children().attr("readonly", "readonly");
												parent.layer.alert("只能选择一个中选人");
											}
										});
									}
								}, function (index) {
									if (isBidThis.val() == 0) {
										isBidThis.val('1')
									} else {
										isBidThis.val('0')
									}
									parent.layer.close(index)
								})
							}

						})

						//通知类型选择 底部的结果变更			
						$("input[name='resultType']").on("click", function () {
							if ($("input[type='radio'][name='resultType']:checked").val() == 1) { //当为未通过时
								$(".isBid").val("1");
								$(".isBid").attr("disabled", true);
								$(".bidPrice").val("");
								$(".serviceCharge").val("");
								$(".bidPrice").attr("readonly", "readonly");
								$(".serviceCharge").attr("readonly", "readonly");
							} else {
								$(".isBid").removeAttr("disabled");
							}
						})

						$(".isBid").on("change", function () { //中选 填写金额
							if ($(this).val() == 0) {
								$(this).parent().siblings().eq(3).children().removeAttr("readonly");
							} else {
								$(this).parent().siblings().eq(3).children().attr("readonly", "readonly");
							}
						})
					} else if (auctionModel == 1) { //按照明细
						item = data.auctionPackageDetaileds;
						if (item == undefined || item.length <= 0) { //无供应商
							$("#whyFailureTr").show();
							$("#whyFailure").html("无供应商报价");
							return;
						}
						//"<td>供应商名称</td><tr>";
						var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>单位</td><td width='50px'>排名</td><td style='vertical-align: middle;text-align:left'>供应商名称</td><td>通知类型</td><td>服务费</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
						var index = -1;
						for (var j = 0; j < item.length; j++) {
							var count = item[j].offerItems.length;
							html += "<tr>";
							html += "<td  style='vertical-align: middle;'>" + (j + 1) + "</td>";
							html += "<td  style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
							html += "<td style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
//							html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
							html += "<td  style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
							if(item[j].offerItems.length==0){
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'>无供应商报价</td>";
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'></td>"; 
                               html += "</tr>";
							}else{
							for (var i = 0; i < item[j].offerItems.length; i++) {
								index++;
								html += "<td style='vertical-align: middle;text-align:center' >" + (i + 1) + "</td>";
								if(item[j].offerItems[i].enterpriseName==""|| item[j].offerItems[i].enterpriseName==undefined){
									html += "<td style='vertical-align: middle;text-align:left' class='enterpriseName' data-tr='" + j + "'  data-td='" + i + "'>无供应商报价</td>";
								}else{
									html += "<td style='vertical-align: middle;text-align:left' class='enterpriseName' data-tr='" + j + "'  data-td='" + i + "'>" +  showBidderRenameList(item[j].offerItems[i].supplierId, item[j].offerItems[i].enterpriseName, RenameData, 'body') + "</td>";
								}
								html += "<input type='hidden' name='BidResultItems[" + index + "].packageDetailedId' value=" + item[j].id + ">";
								/*html += "<input type='hidden' class='detailedName' data-tr='" + j + "'  data-td='" + i + "' value=" + item[j].detailedName + " >";*/
								html += "<input type='hidden' name='BidResultItems[" + index + "].supplierId' value=" + item[j].offerItems[i].supplierId + ">";

								if (item[j].offerItems[i].isBid != undefined) {
									if (item[j].offerItems[i].isBid == 0) {
										//中选
										html += "<td style='width:110px;vertical-align: middle;'><select disabled class='form-control isBid' data-tr='" + j + "'  data-td='" + i + "'  name='BidResultItems[" + index + "].isBid'><option value='0'>中选</option></select></td>";
										// html += "<td>中选</td>"
									} else {
										//未中选
										//html += "<td style='width:110px;vertical-align: middle;'><select class='form-control isBid' data-tr='" + j + "'  data-td='" + i + "'  name='BidResultItems[" + index + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
										// html += "<td>未中选</td>"
									}

								} else {
									html += "<td style='width:110px;vertical-align: middle;'><select style='pointer-events: none;' class='form-control isBid' data-tr='" + j + "'  data-td='" + i + "'  name='BidResultItems[" + index + "].isBid'><option value='0'>中选</option></select></td>";
									// html += "<td>未中选</td>"
								}
								 html += "<td style='text-align:left'>"+item[j].offerItems[i].servicePrice+"</td>";
								//html += "<td style='width:100px;vertical-align: middle;'><input type='text'  data-tr='" + j + "'  data-td='" + i + "'  readonly='readonly' class='form-control bidPrice' name='BidResultItems[" + index + "].bidPrice'/></td>";

								if (item[j].offerItems[i].lastPrice != null) {
									html += "<td  style='width:100px;text-align:center'><input type='hidden' class='bidPrice' data-tr='" + j + "'  data-td='" + i + "' name='BidResultItems[" + index + "].bidPrice'  value='" + (Number(item[j].offerItems[i].lastPrice).toFixed(2)) + "' />" + (Number(item[j].offerItems[i].lastPrice).toFixed(2)) + "</td>";
								} else {
									if (item[j].offerItems[i].lastMoney != null) {
										html += "<td  style='width:100px;text-align:center'><input type='hidden' class='bidPrice' data-tr='" + j + "'  data-td='" + i + "' name='BidResultItems[" + index + "].bidPrice'  value='" + (Number(item[j].offerItems[i].lastMoney).toFixed(2)) + "' />" + (Number(item[j].offerItems[i].lastMoney).toFixed(2)) + "</td>";
									} else {

										html += item[j].offerItems[i].offerMoney != "" ? "<td  style='width:100px;text-align:center'><input type='hidden' class='bidPrice' data-tr='" + j + "'  data-td='" + i + "' name='BidResultItems[" + index + "].bidPrice'  value='" + (Number(item[j].offerItems[i].offerMoney).toFixed(2)) + "'/>" + Number(item[j].offerItems[i].offerMoney).toFixed(2) + "</td>" : "<td  style='width:100px;'></td>";
									}
								}

								//html += price!=""?"<td  style='width:120px;text-align:center'><input type='hidden' name='BidResultItems[" + index + "].serviceCharge' value='"+(price.toFixed(2))+"' />"+(price.toFixed(2))+"</td>":"<td  style='width:120px;text-align:center'></td>"; //服务费

								if (item[j].offerItems[i].resultContent) {
									html += "<input type='hidden' class='bidContent' data-tr='" + j + "'  data-td='" + i + "' name='bidResultItems[" + index + "].resultContent' value='" + item[j].offerItems[i].resultContent + "'>";
								} else {
									html += "<input type='hidden' class='bidContent' data-tr='" + j + "'  data-td='" + i + "' name='bidResultItems[" + index + "].resultContent' value=''>";
								}

								html += checkState != "" ? "<td style='vertical-align: middle;text-align:center;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' data-tr='" + j + "' data-td='" + i + "' onclick='viewBidResults(" + i + "," + j + ",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary'  data-tr='" + j + "' data-td='" + i + "' onclick='editBidResults(" + i + "," + j + "," + index + ")'>编辑</a></td>" : "<td style='vertical-align: middle;text-align:center;'><a href='javascript:void(0)' class='viewBidResult' data-tr='" + j + "' data-td='" + i + "' onclick='viewBidResults(" + i + "," + j + ",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
							}
						}
						//	console.log(html);
						$("#bidResultInfo").html(html);
						$(".isBid").change(function () {
							$(this).parent().parent().find(".bidContent").val("");
							var tr = $(this).data("tr");
							var td = $(this).data("td");
							if ($(this).val() == 0) {
								$("select[data-tr='" + tr + "']").each(function () {
									if ($(this).val() == 0 && $(this).data("td") != td) {
										layer.alert("每个明细只能选择一个中选人");
										$("select[data-tr='" + tr + "']").each(function () {
											if ($(this).val() == 0 && $(this).data("td") != td) {
												$(this).val(1);
											}
										})
										$("input[data-tr='" + tr + "']").each(function () {
											if ($(this).data("td") != td) {
												//$(this).val("");
												$(this).attr("readonly", "readonly");
											}
										})
									}
								})
								$("input[data-tr='" + tr + "'][data-td='" + td + "']").removeAttr("readonly");
							}
						})
						//通知类型选择 底部的结果变更			
						$("input[name='resultType']").on("click", function () {
							if ($("input[type='radio'][name='resultType']:checked").val() == 1) { //当为未通过时
								$(".isBid").val("1");
								$(".isBid").attr("disabled", true);
								$(".bidPrice").val("");
								$(".serviceCharge").val("");
								$(".bidPrice").attr("readonly", "readonly");
								$(".serviceCharge").attr("readonly", "readonly");
							} else {
								$(".isBid").removeAttr("disabled");
							}
						})
					}
				} else { //查看时
					subData = data.subDate;
					//findWorkflowCheckerAndAccp(data.id);
					$(".isWatch").hide();
					$(".employee").hide(); //隐藏审核人

					$("td[id]").each(function () { //填冲表格
						$(this).html(data[this.id]);
					})
					$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
					$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章

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
						var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>单位</td><td width='50px'>排名</td><td style='text-align: left;'>供应商名称</td><td>通知类型</td><td>服务费</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
						for (var j = 0; j < item.length; j++) {
							var count = item[j].bidResultItems.length;
							html += "<tr>";
							html += "<td style='vertical-align: middle;'>" + (j + 1) + "</td>";
							html += "<td style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
							html += "<td style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
//							html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
							html += "<td style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
							if(item[j].bidResultItems.length==0){
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'>无供应商报价</td>";
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'></td>";
                               html += "<td  style='vertical-align: middle;'></td>"; 
                               html += "</tr>";
							}else{
							if (data.resultType == 0){
								for (var i = 0; i < item[j].bidResultItems.length; i++) {
									html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
									html += "<td style='vertical-align: middle;text-align: left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
									/*html += "<input type='hidden' class='detailedName' data-tr='" + j + "'  data-td='" + i + "' value=" + item[j].detailedName + " >";*/
									html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
									html += "<td style='text-align:left'>"+item[j].bidResultItems[i].servicePrice+"</td>";
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
									html += "<td style='vertical-align: middle;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + showBidderRenameList(item[j].bidResultItems[i].supplierId, item[j].bidResultItems[i].enterpriseName, RenameData, 'body') + "</td>";
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

						}

						$("#bidResultInfo").html(html);

					}
				}

				if (keyId != 'undefined' && keyId) {
					//审批记录
					$(".workflowList").show();
					findWorkflowCheckerAndAccp(keyId);
				}

			}
		}
	})
})

function singleOfferList() {
	$.ajax({
		type: "POST",
		url: singleOfferListUrl,
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
				singleOfferDatas = response.data
				console.log(singleOfferDatas)
				if (singleOfferDatas && singleOfferDatas.length > 0) {
					listTitle();
					setSingleOfferColumns();
					intableList()
					$("#detailResult").bootstrapTable('load', singleOfferDatas)
				} else {
					$("#suppSelect").hide();
					$("#whyFailureTrs").show();
					$("#whyFailures").html("无供应商报价");
					$("#detailResult").hide()
				}
			}
		}
	})
}
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
			// if (type != "RELEASE") {
			if (value == '0') {
				return '中选'
			} else {
				return '未中选'
			}
			// } else {

			// 	if (value == '0') {
			// 		return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' onChange='changeSelect(\"" + index + "\",\"" + row.id + "\")'><option value='1'>未中选</option><option value='0' selected>中选</option></select>"
			// 	} else {
			// 		return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' onChange='changeSelect(\"" + index + "\",\"" + row.id + "\")'><option value='1' selected>未中选</option><option value='0' >中选</option></select>"
			// 	}
			// }
		}
	},
	{
		field: 'noTaxRateTotalPrice',
		title: '成交金额(元)',
		align: 'left',
		formatter: function (value, row, index) {
			if (type != 'RELEASE') {
				if (row.isBid == '1') {
					return ""
				} else {
					return value
				}
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
			if (type == 'RELEASE') {
				return yl
			} else {
				return view
			}
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
					$("#suppSelect").hide();
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
		boot = true;
		$.ajax({
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getMXEnterpriseTatalPrice.do",
			type: "post",
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

					var list = data.data
					if (list && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var auctionSfcOfferes = list[i].auctionSfcOfferesList;

							if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {

								if (type != "RELEASE") {
									$("#suppSelect").html('查看结果通知书')


								}
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
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getZJEnterpriseTatalPrice.do",
			type: "post",
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
					return '中选'
				} else {
					return '未中选'
				}
				//				if (type != "RELEASE") {
				//					if (value == '0') {
				//						return '中选'
				//					} else {
				//						return '未中选'
				//					}
				//				} else {
				//
				//					if (value == '0') {
				//						return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' onChange='changeSelect(\"" + index + "\",\"" + row.id + "\")'><option value='1'>未中选</option><option value='0' selected>中选</option></select>"
				//					} else {
				//						return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' onChange='changeSelect(\"" + index + "\",\"" + row.id + "\")'><option value='1' selected>未中选</option><option value='0' >中选</option></select>"
				//					}
				//				}

			}
		},
		{
			field: 'noTaxRateTotalPrice',
			title: '成交金额(元)',
			align: 'left',
			formatter: function (value, row, index) {
				if (type != 'RELEASE') {
					if (row.isBid == '1') {
						return ""
					} else {
						return value
					}
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
				var edit = "<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='resultEdit(" + index + ")'>编辑</a>&nbsp;&nbsp"
				var view = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"views\")'>查看</a>"
				//					if(rowData.checkState == undefined) {
				//						return yl
				//						//						return yl + edit
				//					} else if(rowData.checkState == 0) {
				//						return yl
				//						//						return yl + edit
				//					} else if(rowData.checkState == 2) {
				//						return view
				//					} else if(rowData.checkState == 3) {
				//						return yl
				//						//						return yl + edit
				//					} else {
				//						return view
				//					}
				if (type == 'RELEASE') {
					return yl
				} else {
					return view
				}

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
		//			{
		//					field: "id",
		//					title: "物料号",
		//					valign: "middle",
		//					align: "center",
		//					cellStyle: {
		//						css: {
		//							"min-width": "170px",
		//							"word-wrap": "break-word",
		//							"word-break": "break-all",
		//							"white-space": "normal"
		//						}
		//					},
		//					formatter: function(value, row, index) {
		//						return row.materialNum 
		//					}
		//
		//			},
		//			{
		//					field: "idss",
		//					title: "申请号",
		//					valign: "middle",
		//					align: "center",
		//					cellStyle: {
		//						css: {
		//							"min-width": "170px",
		//							"word-wrap": "break-word",
		//							"word-break": "break-all",
		//							"white-space": "normal"
		//						}
		//					},
		//					formatter: function(value, row, index) {
		//						return row.applyNum 
		//					}
		//
		//			},
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
					return '中选'
				} else {
					return '未中选'
				}
				//				if (type != "RELEASE") {
				//					if (value == '0') {
				//						return '中选'
				//					} else {
				//						return '未中选'
				//					}
				//				} else {
				//
				//					if (value == '0') {
				//						return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' getValue='" + value + "'  onChange='changeSelect(this,\"" + index + "\",\"" + row.id + "\")'><option value='1'>未中选</option><option value='0' selected>中选</option></select>"
				//					} else {
				//						return "<select class='form-control isBid' id='bidResultSelect" + index + "' name='bidResultSelect" + index + "' getValue='" + value + "' onChange='changeSelect(this,\"" + index + "\",\"" + row.id + "\")'><option value='1' selected>未中选</option><option value='0' >中选</option></select>"
				//					}
				//				}

			}
		},
		{
			field: 'noTaxRateTotalPrice',
			title: '成交金额(元)',
			align: 'left',
			formatter: function (value, row, index) {
				if (type != 'RELEASE') {
					if (row.isBid == '1') {
						return ""
					} else {
						return value
					}
				} else {
					return value
				}

			}

		},
			//			{
			//				field: 'action',
			//				title: '操作',
			//				align: 'center',
			//				width: '160',
			//
			//				formatter: function(value, row, index) {
			//					var yl = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"view\")'>预览</a>&nbsp;&nbsp"
			//					var edit = "<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='resultEdit(" + index + ")'>编辑</a>&nbsp;&nbsp"
			//					var view = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"view\")'>查看</a>"
			//					if(rowData.checkState == undefined) {
			//						return yl
			//						//						return yl + edit
			//					} else if(rowData.checkState == 0) {
			//						return yl
			//						//						return yl + edit
			//					} else if(rowData.checkState == 2) {
			//						return view
			//					} else if(rowData.checkState == 3) {
			//						return yl
			//						//						return yl + edit
			//					} else {
			//						return view
			//					}
			//
			//				}
			//			}

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
function cellFunss() {
	var obj = {};
	for (var item in detailTable) {
		var items = detailTable[item]['idss'];
		obj[items] = (obj[items] + 1) || 1
	}
	var arrIndex = [];
	var tableIndex = 0;
	for (var key in obj) {
		arrIndex.push(obj[key])
		var option = [{
			index: tableIndex,
			field: 'idss',
			colspan: 1,
			rowspan: obj[key],

		}]
		for (var h = 0; h < option.length; h++) {
			$("#detailResult").bootstrapTable('mergeCells', option[h])
		}
		tableIndex += obj[key]
	}
}

function cellFunsss() {
	var obj = {};
	for (var item in detailTable) {
		var items = detailTable[item]['idsss'];
		obj[items] = (obj[items] + 1) || 1
	}
	var arrIndex = [];
	var tableIndex = 0;
	for (var key in obj) {
		arrIndex.push(obj[key])
		var option = [{
			index: tableIndex,
			field: 'idsss',
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
				cellFuns()
			}
		}
	});
	//		$("#detailResult").bootstrapTable("load", detailTable);
}

//选择通知类型按总价
function changeSelect(el, index, id) {
	var bidRow = $('#detailResult').bootstrapTable('getData')[index];
	var Ovalue = $(el).attr('getValue')
	var selectVal = $("#bidResultSelect" + index).val();
	if (selectVal != Ovalue) {
		itemList.push({
			supplierEnterpriseId: bidRow.supplierEnterpriseId,
			isBid: selectVal,
			specificationId: bidRow.id,
			noTaxRateTotalPrice: bidRow.noTaxRateTotalPrice,
			id: bidRow.id,
			specificationId: bidRow.specificationId
		})

	} else {
		itemList = []
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
	obj.itemArr = arrList
	if (type == 'RELEASE') {
		top.layer.open({
			type: 2,
			title: "选择供应商",
			area: ['400px', '250px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/Auction/Purchase/AuctionNotice/modal/selectSupplier.html?id=' + packageId,
			success: function (layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsgMore(obj, detailTable, "view");
			}
		});
	} else {
		top.layer.open({
			type: 2,
			title: "选择供应商",
			area: ['400px', '250px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/Auction/Purchase/AuctionNotice/modal/selectSupplier.html?id=' + packageId,
			success: function (layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsgMore(obj, detailTable, "views");

			}
		});

	}



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

		top.layer.open({
			type: 2,
			title: "查看结果通知书",
			area: ['550px', '650px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(rows, types);
			}
		});
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
				content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(rows, types);
				}
			});
		}

	}
}

//按清单编辑
function resultEdit(indexs) {
	var rows = $("#detailResult").bootstrapTable('getData')[indexs];
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
		rows.isShow = $('input[name="isShow"]:checked').val();
	} else {
		rows.isShow = 0;
	}

	//	if($("#bidResultSelect" + index).val() != undefined && $("#bidResultSelect" + index).val() != "") {
	//			rows.isBid = $("#bidResultSelect" + index).val();
	//		} else {
	//			rows.isBid = 1
	//		}

	rows.auctionModel = auctionModel;
	rows.projectId = projectId;
	rows.packageId = packageId;
	rows.isBid = rows.isBid

	if (projectType == 0) { //项目的项目类型。
		rows.projectType = 'A';
	}
	if (projectType == 1) {
		rows.projectType = 'B';
	}
	if (projectType == 2) {
		rows.projectType = 'C';
	}
	if (projectType == 3) {
		rows.projectType = 'C50';
	}
	if (projectType == 4) {
		rows.projectType = 'W';
	}
	top.layer.open({
		type: 2,
		title: "编辑结果通知书",
		area: ['650px', '650px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		btn: ["保存", "取消"],
		content: 'Auction/Auction/Purchase/AuctionNotice/modal/editViewResult.html',
		success: function (layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(rows, "edit");

		},
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if (iframeWin.ue.getContent() == "") {
				parent.layer.alert("请填写结果通知或选项结果通知模板");
				return;
			}

			rows.templateId = iframeWin.templateId
			rows.resultContent = iframeWin.ue.getContent() //编辑后的通知临时存到数据中
			//			detailTable[indexs].templateId=iframeWin.templateId;
			//			detailTable[indexs].contentRes=iframeWin.ue.getContent();
			parent.layer.close(index);

		}
	});
}

var commitData = "";
$("#btn_submit").on("click", function () {

	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();

	/*if(!resultType) {
		layer.alert("请选择通知类型！");
		return;
	}*/
	if (!isShow) {
		layer.alert("请选择是否加盖企业公章！");
		return;
	}

	if (isWorkflow) {
		if ($("#employeeId").val() == "") {
			layer.alert("请选择审核人");
			return;
		}
	}

	var isBidPriceNull = ''; //判断中选金额是否为空
	var isBidPriceReg = ''; //判断中选金额是否符合正则
	//	var isServiceChargeNull = ''; //判断税费是否为空
	//	var isServiceChargeReg = ''; //判断税费是否为空

	var reg = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/
	if (auctionModel == 0) {
		$(".bidPrice").each(function () {
			if ($(this).parent().siblings().eq(3).children().val() == 0) {
				if ($(this).val() == "") {
					isBidPriceNull = 1;
				}
				if (!reg.test($(this).val())) {
					isBidPriceReg = 1;
				}
			}
		})
	} else {
		$(".bidPrice").each(function () {
			var tr = $(this).data("tr");
			var td = $(this).data("td");

			if ($("select[data-tr='" + tr + "'][data-td='" + td + "']").val() == 0) {
				if ($(this).val() == "") {
					isBidPriceNull = 1;
				}
				if (!reg.test($(this).val())) {
					isBidPriceReg = 1;
				}
			}
		})
	}

	if ($("input[type='radio'][name='resultType']:checked").val() == 1) {
		$(".isBid").removeAttr("disabled");
	}

	/*var para = {
		projectId: rowData.projectId,
		packageId: rowData.packageId,
		resultType: resultType,
		isShow: isShow,
		tenderType: 1,
		auctionModel:auctionModel
	}

	if(type == "modify" || type == "update") {
		para.id = rowData.id
	}

	if(isWorkflow) { //是否存在审核人
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}*/

	var bidResult = $("#bidResult").serialize();
	if (auctionType == '6') {
		var resultItem = [];
		if (auctionModel == '1') {
			for (var g = 0; g < detailTable.length; g++) {
				resultItem.push({
					isBid: detailTable[g].isBid,
					supplierEnterpriseId: detailTable[g].supplierEnterpriseId,
					bidPrice: detailTable[g].noTaxRateTotalPrice,
					specificationId: detailTable[g].specificationId,
					id: detailTable[g].id
				})
			}
			commitData = serializeForm($("#bidResult"));
			commitData.projectId = projectId;
			commitData.packageId = packageId;
			commitData.resultType = resultType;
			commitData.isShow = $('input[name="isShow"]:checked').val();
			commitData.tenderType = 2;
			commitData.auctionModel = auctionModel;
			commitData.auctionType = auctionType;
			commitData.auctionSfcOfferItemList = resultItem
		} else {
			for (var g = 0; g < detailTable.length; g++) {
				resultItem.push({
					isBid: detailTable[g].isBid,
					supplierId: detailTable[g].supplierEnterpriseId,
					bidPrice: detailTable[g].noTaxRateTotalPrice,
					id: detailTable[g].id
				})
			}
			commitData = serializeForm($("#bidResult"));
			commitData.projectId = projectId;
			commitData.packageId = packageId;
			commitData.resultType = resultType;
			commitData.isShow = $('input[name="isShow"]:checked').val();
			commitData.tenderType = 2;
			commitData.auctionModel = auctionModel;
			commitData.auctionType = auctionType;
			commitData.bidResultItems = resultItem
		}

	} else if (auctionType == '7') {
		var resultItem = [];
		for (var g = 0; g < singleOfferDatas.length; g++) {
			resultItem.push({
				isBid: singleOfferDatas[g].isBid,
				supplierId: singleOfferDatas[g].supplierEnterpriseId,
				bidPrice: singleOfferDatas[g].noTaxRateTotalPrice,
				id: singleOfferDatas[g].id
			})
		}
		commitData = serializeForm($("#bidResult"));
		commitData.projectId = projectId;
		commitData.packageId = packageId;
		commitData.resultType = resultType;
		commitData.isShow = $('input[name="isShow"]:checked').val();
		commitData.tenderType = 2;
		commitData.auctionModel = auctionModel;
		commitData.auctionType = auctionType;
		commitData.bidResultItems = resultItem
	} else {

		//commitData = $.param(para) + "&" + bidResult;

		commitData = serializeForm($("#bidResult"));
		commitData.projectId = projectId;
		commitData.packageId = packageId;
		commitData.resultType = resultType;
		commitData.isShow = isShow;
		commitData.tenderType = 2;
		commitData.auctionModel = auctionModel;
		commitData.auctionType = auctionType;
	}

	if (type == "RELEASE") {
		commitData.id = keyId
	}

	if (isWorkflow) { //是否存在审核人
		commitData.checkerId = $("#employeeId").val();
	} else {
		commitData.checkerId = 0;
	}

	var results = serializeForm($("#bidResult"));

	if (bidResult.length > 0) {
		var isalert = true;
		for (ore in results) {
			var arr = ore.split('.');

			if (arr[arr.length - 1] == 'isBid' && results[ore] == 0) {
				isalert = false;
				break
			}
		}

		if (isalert) {
			parent.layer.confirm('当前未设置中选供应商是否继续', {
				btn: ['是', '否'] //可以无限个按钮
			}, function (index, layero) {
				if (isWorkflow == 0) {
					//没有设置流程审批
					parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
						btn: ['是', '否'] //可以无限个按钮
					}, function (index1, layero) {
						commit();
						parent.layer.close(index1);
					}, function (index2) {
						parent.layer.close(index2);
					});
				} else {
					commit();
				}
				parent.layer.close(index);
			}, function (index) {
				parent.layer.close(index);
			});
		} else {
			if (isWorkflow == 0) {
				//没有设置流程审批
				parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
					btn: ['是', '否'] //可以无限个按钮
				}, function (index, layero) {
					commit();
					parent.layer.close(index);
				}, function (index) {
					parent.layer.close(index);
				});
			} else {
				commit();
			}
		}
	} else {
		if (isWorkflow == 0) {
			//没有设置流程审批
			parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
				btn: ['是', '否'] //可以无限个按钮
			}, function (index, layero) {
				commit();
				parent.layer.close(index);
			}, function (index) {
				parent.layer.close(index);
			});
		} else {
			commit();
		}
	}


})

function commit() {


	$.ajax({
		url: urlInsertProjectBidResult,
		type: "post",
		data: commitData,
		success: function (data) {
			if (data.success) {
				if (top.window.document.getElementById("consoleWindow")) {
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				}
				parent.$('#BidResultList').bootstrapTable('refresh');
				var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
				//				top.layer.closeAll();
				top.layer.alert("发布成功");
			} else {
				layer.alert(data.message);
				$("select[name='isBid']").each(function () {
					$(this).attr("disabled", true);
				})
			}
		}
	});
}

function serializeForm(form) {
	var obj = {};
	$.each(form.serializeArray(), function (index) {
		if (obj[this['name']]) {
			obj[this['name']] = obj[this['name']] + ',' + this['value'];
		} else {
			obj[this['name']] = this['value'];
		}
	});


	return obj;
}

$("#btn_close").on("click", function () {
	//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
})

//加载审核人
function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "jgtzs"
		},
		success: function (data) {
			var option = ""
			//判断是否有审核人		   	  
			if (data.message == 0) { // 没有设置审核人
				isCheck = true;
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if (data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").hide();
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
		top.layer.open({
			type: 2,
			title: "查看结果通知书",
			area: ['550px', '650px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(BidResultItem[$index], temp);
			}
		});
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
				content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
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
		top.layer.open({
			type: 2,
			title: "查看结果通知书",
			area: ['550px', '650px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(resDate, flag);
			}
		});
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
				content: 'Auction/Auction/Purchase/AuctionNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(resDate, flag);
				}
			});
		}
	}

}

/*
 * 2018-11-12  H  add
 * 编辑结果通知书
 */
function editBidResult($index) {
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
		BidResultItem[$index].isShow = $('input[name="isShow"]:checked').val();
	} else {
		BidResultItem[$index].isShow = 0;
	}

	if ($('select[name= "bidResultItems[' + $index + '].isBid"]').val() != undefined && $('select[name= "bidResultItems[' + $index + '].isBid"]').val() != "") {
		BidResultItem[$index].isBid = $('select[name= "bidResultItems[' + $index + '].isBid"]').val();
	} else {
		BidResultItem[$index].isBid = 1
	}

	BidResultItem[$index].auctionModel = auctionModel;
	BidResultItem[$index].projectId = projectId;
	BidResultItem[$index].packageId = packageId;
	if (projectType == 0) { //项目的项目类型。
		BidResultItem[$index].projectType = 'A';
	}
	if (projectType == 1) {
		BidResultItem[$index].projectType = 'B';
	}
	if (projectType == 2) {
		BidResultItem[$index].projectType = 'C';
	}
	if (projectType == 3) {
		BidResultItem[$index].projectType = 'C50';
	}
	if (projectType == 4) {
		BidResultItem[$index].projectType = 'W';
	}
	top.layer.open({
		type: 2,
		title: "编辑结果通知书",
		area: ['650px', '650px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		btn: ["保存", "取消"],
		content: 'Auction/Auction/Purchase/AuctionNotice/modal/editViewResult.html',
		success: function (layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(BidResultItem[$index], "edit");

		},
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if (iframeWin.ue.getContent() == "") {
				parent.layer.alert("请填写结果通知或选项结果通知模板");
				return;
			}
			BidResultItem[$index].templateId = iframeWin.templateId
			BidResultItem[$index].resultContent = iframeWin.ue.getContent() //编辑后的通知临时存到数据中
			$('input[name="bidResultItems[' + $index + '].resultContent"]').val(iframeWin.ue.getContent());
			parent.layer.close(index);
		}
	});
}

function editBidResults($index, $temp, _index) {
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
		item[$temp].offerItems[$index].isShow = $('input[name="isShow"]:checked').val();
	} else {
		item[$temp].offerItems[$index].isShow = 0;
	}

	if ($("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val() != undefined && $("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val() != "") {
		item[$temp].offerItems[$index].isBid = $("select[data-tr='" + $temp + "'][data-td='" + $index + "']").val();
	} else {
		item[$temp].offerItems[$index].isBid = 1
	}

	item[$temp].offerItems[$index].packageDetailedId = item[$temp].id;
	item[$temp].offerItems[$index].auctionModel = auctionModel;
	item[$temp].offerItems[$index].projectId = projectId;
	item[$temp].offerItems[$index].packageId = packageId;
	if (projectType == 0) { //项目的项目类型。
		item[$temp].offerItems[$index].projectType = 'A';
	}
	if (projectType == 1) {
		item[$temp].offerItems[$index].projectType = 'B';
	}
	if (projectType == 2) {
		item[$temp].offerItems[$index].projectType = 'C';
	}
	if (projectType == 3) {
		item[$temp].offerItems[$index].projectType = 'C50';
	}
	if (projectType == 4) {
		item[$temp].offerItems[$index].projectType = 'W';
	}
	top.layer.open({
		type: 2,
		title: "编辑结果通知书",
		area: ['650px', '650px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		btn: ["保存", "取消"],
		content: 'Auction/Auction/Purchase/AuctionNotice/modal/editViewResult.html',
		success: function (layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(item[$temp].offerItems[$index], "edit");

		},
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if (iframeWin.ue.getContent() == "") {
				parent.layer.alert("请填写结果通知或选项结果通知模板");
				return;
			}
			item[$temp].offerItems[$index].templateId = iframeWin.templateId
			item[$temp].offerItems[$index].resultContent = iframeWin.ue.getContent() //编辑后的通知临时存到数据中
			$('input[name="bidResultItems[' + _index + '].resultContent"]').val(iframeWin.ue.getContent());
			parent.layer.close(index);
		}
	});
}