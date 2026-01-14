WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

var BidNotice = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行

var urlBidNoticeInfo = top.config.AuctionHost + "/BidResultHisController/findBidResultInfo.do"; //  公式信息
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var singleOfferListUrl = top.config.AuctionHost + "/AuctionSfcSingleOfferesController/getLastThreeOfferes.do"
var resultNoticeHistoryView = "Auction/SaleWaste/Purchase/SaleResult/model/ResultInfoHistory.html";//查看历史
sessionStorage.setItem("tenderTypeCode", "2");
var BidResultItem = []; //分项集合
var listArr = []
var item = [];
var columnsArry = [];
var price = "";
var subData = "";
var auctionModel = "";
var detailTable = [];
var package_id
var projectId;
var examType = 1;
var RenameData = {};
$(function () {

	if (edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}

	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章

	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);

	//结果信息填充的
	BidNoticeInfo(id);
})
var showMsg;

//结果公示信息填充
function BidNoticeInfo(data) {
	$.ajax({
		type: "post",
		url: urlBidNoticeInfo,
		data: {
			"id": data,
			tenderType: 2 //0为询比采购，1为竞价采购，2为竞卖
		},
		dataType: 'json',
		async: false,
		success: function (result) {
			if(!result.success){
				top.layer.alert(result.message);
				return
			}
			var data = result.data;
			showMsg = data.isShow;
			subData = data.subDate;
			package_id = data.packageId;
			projectId = data.projectId;
			auctionType = data.auctionType;
			listArr = data.bidResultItems;

			RenameData = getBidderRenameData(projectId);//供应商更名信息

			getTable();

			if (data.price != undefined) {
				price = data.price;
			}

			if (data.auctionModel) {
				auctionModel = data.auctionModel;
			}

			if (data.auctionType == '6') {
				$("#noList").hide();
				$("td[id]").each(function () { //填冲表格
					$(this).html(data[this.id]);
					$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章
				})
				supplier(data.packageId)
				detailListTable(data.packageId)
			} else if (data.auctionType == '7') {
				$("#noList").hide();
				$("td[id]").each(function () { //填冲表格
					$(this).html(data[this.id]);
					$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章
				})
				singleOfferList();
			} else {

				if (data.auctionModel == '0') {
					//按包件
					BidResultItem = data.bidResultItems;
				} else if (data.auctionModel == '1') {
					//按明细
					if (data.auctionPackageDetaileds != null) {
						var auctionPackageDetaileds = data.auctionPackageDetaileds;
						for (var i = 0; i < auctionPackageDetaileds.length; i++) {
							if (auctionPackageDetaileds[i].bidResultItems != null) {
								var it = auctionPackageDetaileds[i].bidResultItems;
								for (var j = 0; j < it.length; j++) {
									BidResultItem.push(it[j]);
								}
							}

						}
					}
				} else {
					BidResultItem = data.bidResultItems;
				}



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
					} else {
						$(".isbid").hide(); //隐藏采购结果中选
					}
				}

				if (BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
					$("#whyFailureTr").show();
					$("#whyFailure").html("无供应商报价");
					return;
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
					$("#ming").show();
					$("#auctionPackageDetaileds").html(suppliertalbe);
					if (data.resultType == 0) { //0为中选通知 1为为中选通知
						var html = "<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td style='text-align:center;'>成交金额(元)</td><td>操作</td></tr>";
						for (var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td style='text-align:center;width:50px'>" + (i + 1) + "</td>";
							html += "<td style='text-align:left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
							if (BidResultItem[i].isBid == 0) {
								html += "<td style='width:110px;'><div class='text-success'>中选</div></td>";
								if (BidResultItem[i].bidPrice != undefined) {
									html += "<td style='width:110px;text-align:center;'>" + Number(BidResultItem[i].bidPrice).toFixed(2) + "</td>"; //成交价格
								} else {
									html += "<td style='width:110px;text-align:center;'></td>"; //成交价格
								}
							} else {
								html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
								html += "<td></td>"
							}


							//html += price!=""?"<td  style='width:120px;text-align:center'>"+price+"</td>":"<td  style='width:120px;'></td>"; //服务费
							if (BidResultItem[i].resultContent) {
								html += "<input type='hidden' class='bidContent' name='' value='" + BidResultItem[i].resultContent + "'>";
							} else {
								html += "<input type='hidden' class='bidContent' name='' value=''>";
							}
							html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult(" + i + ",\"views\")''>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
					} else {
						var html = "<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td>操作</td></tr>";
						for (var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td style='text-align:center;'>" + (i + 1) + "</td>";
							html += "<td style='text-align:left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
							if (BidResultItem[i].resultContent) {
								html += "<input type='hidden' class='bidContent' name='' value='" + BidResultItem[i].resultContent + "'>";
							} else {
								html += "<input type='hidden' class='bidContent' name='' value=''>";
							}
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
					var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>单位</td><td width='50px'>排名</td><td style='text-align: left;'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td>操作</td></tr>";
					for (var j = 0; j < item.length; j++) {
						var count = item[j].bidResultItems.length;
						html += "<tr>";
						html += "<td  style='vertical-align: middle;'>" + (j + 1) + "</td>";
						html += "<td  style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
						html += "<td  style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
						// html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
						html += "<td  style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
						if(item[j].bidResultItems.length==0){
						   html += "<td  style='vertical-align: middle;'></td>";
						   html += "<td  style='vertical-align: middle;'>无供应商报价</td>";
						   html += "<td  style='vertical-align: middle;'></td>";
						   html += "<td  style='vertical-align: middle;'></td>";
						   html += "<td  style='vertical-align: middle;'></td>"; 
						   html += "</tr>";
						}else{
						if (data.resultType == 0) {
							for (var i = 0; i < item[j].bidResultItems.length; i++) {
								
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;text-align: left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" +  showBidderRenameList(item[j].bidResultItems[i].supplierId, item[j].bidResultItems[i].enterpriseName, RenameData, 'body') + "</td>";
								//html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
								/*if(!item[j].bidResultItems[i].isBid){
									html += "<td style='width:110px;text-align:center;'  class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "' >" + (Number(item[j].bidResultItems[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
								}else{
									html += "<td></td>";
								}*/
								if (item[j].bidResultItems[i].isBid == 0) {
									html += "<td style='width:110px;' data-tr='" + j + "'  data-td='" + i + "'  class='isBidO'><div class='text-success'>中选</div></td>";
								} else {
									html += "<td style='width:110px;' data-tr='" + j + "'  data-td='" + i + "'  class='isBidO'><div class='text-danger'>未中选</div></td>";
								}

								if (item[j].bidResultItems[i].bidPrice != undefined && item[j].bidResultItems[i].isBid == 0) {
									html += "<td style='width:110px;' class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].bidPrice + "</td>"; //成交价格
								} else {
									html += "<td style='width:110px;' class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "'></td>"; //成交价格
								}


								//html += "<td style='width:120px;text-align:center;'  data-tr='" + j + "'  data-td='" + i + "' >" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
								if (item[j].bidResultItems[i].resultContent) {
									html += "<input type='hidden' class='bidContent' name='' value='" + item[j].bidResultItems[i].resultContent + "'>";
								} else {
									html += "<input type='hidden' class='bidContent' name='' value=''>";
								}
								html += "<td style='vertical-align: middle;text-align: center;'><a href='javascript:void(0)'  data-tr='" + j + "'  data-td='" + i + "' class='viewBidResult btn-sm btn-primary' onclick='viewBidResults(" + i + "," + j + ",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						} else {
							for (var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
								html += "<td style='width:110px;' class='isBidO  text-danger'  data-tr='" + j + "'  data-td='" + i + "'>未中选</td>";
								if (item[j].bidResultItems[i].resultContent) {
									html += "<input type='hidden' class='bidContent' name='' value='" + item[j].bidResultItems[i].resultContent + "'>";
								} else {
									html += "<input type='hidden' class='bidContent' name='' value=''>";
								}
								html += "<td style='vertical-align: middle;text-align:center;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						}
						}
					}

					$("#bidResultInfo").html(html);
				}
			}
			if(data.bidResultHisList){
				resultNoticeHistoryTable(data.bidResultHisList, '1')
			}
		}
	});
}
//获取供应商
function supplier(id) {
	$.ajax({
		type: "POST",
		url: findSupplierUrl,
		async: false,
		data: {
			packageId: id
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				var returnData = response.data

				if (returnData && returnData.length > 0) {
					listTitle();
					if (auctionModel == '1') {

						$("#suppSelect").show()
					}
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


function detailListTable(id) {
	//按明细
	if (auctionModel == '1') {
		boot = true
		$.ajax({
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getMXEnterpriseTatalPrice.do",
			type: "post",
			data: {
				packageId: id,
			},
			success: function (data) {
				if (data.success) {
					var list = data.data
					if (list && list.length > 0) {
						for (var i = 0; i < list.length; i++) {
							var auctionSfcOfferes = list[i].auctionSfcOfferesList;
							if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {
								for (var c = 0; c < auctionSfcOfferes.length; c++) {
									auctionSfcOfferes[c].applyNum = list[i].applyNum;
									auctionSfcOfferes[c].materialNum = list[i].materialNum;
									auctionSfcOfferes[c].materialModel = list[i].materialModel;
									auctionSfcOfferes[c].materialName = list[i].materialName;
									auctionSfcOfferes[c].detailId = list[i].id;
									auctionSfcOfferes[c].ids = list[i].id;
									auctionSfcOfferes[c].idss = list[i].id;
									auctionSfcOfferes[c].idss = list[i].id;
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
		});

	} else { //总价

		$.ajax({
			url: top.config.AuctionHost + "/AuctionSfcOfferController/getZJEnterpriseTatalPrice.do",
			type: "post",
			data: {
				packageId: id,
			},
			success: function (data) {
				if (data.success) {
					listTitle()
					var details = data.data
					if (details && details.length > 0) {

						detailTable = data.data

						intableList();
						$("#detailResult").bootstrapTable("load", detailTable);
					} else {

						$("#whyFailureTrs").show();
						$("#whyFailures").html("无供应商报价");
						$("#detailResult").hide()
					}

				} else {
					top.layer.alert(data.message);

				}
			}
		});

	}

}

function singleOfferList() {
	$.ajax({
		type: "POST",
		url: singleOfferListUrl,
		async: false,
		data: {
			packageId: package_id
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				var singleOfferDatas = ''
				singleOfferDatas = response.data
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
		width: '180',
		formatter:function(value, row, index){					
			return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
		}
	},
	{
		field: 'isBid',
		title: '通知类型',
		align: 'left',
		formatter: function (value, row, index) {
			if (value == '0') {
				return '中选'
			} else {
				return '未中选'
			}


		}
	},
	{
		field: 'noTaxRateTotalPrice',
		title: '成交金额(元)',
		align: 'left',
		formatter: function (value, row, index) {
			return value
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
			width: '180',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
			}
		},
		{
			field: 'isBid',
			title: '通知类型',
			align: 'left',
			formatter: function (value, row, index) {

				if (value == '0') {
					return '中选'
				} else {
					return '未中选'
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
				var yl = "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='resultView(" + index + ",\"views\")'>预览</a>&nbsp;&nbsp"
				var edit = "<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='resultEdit(" + index + ")'>编辑</a>&nbsp;&nbsp"
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
			formatter: function (value, row, index) {
				return row.materialModel
			}
		},
		{
			field: 'detailId',
			title: '名称(内容)',
			align: 'left',
			formatter: function (value, row, index) {
				return row.materialName
			}
		},

		{
			field: 'supplierEnterpriseName',
			title: '供应商名称',
			align: 'left',
			width: '180',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierEnterpriseId, value, RenameData, 'body')
			}

		},
		{
			field: 'isBid',
			title: '通知类型',
			align: 'left',
			colspan: 1,
			formatter: function (value, row, index) {

				if (value == '0') {
					return '中选'
				} else {
					return '未中选'
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



//按明细通知预览
function resultViewMx() {
	var obj = {}
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {

		obj.isShow = $('input[name="isShow"]:checked').val()
	} else {
		obj.isShow = 0
	}
	obj.projectId = projectId;
	obj.packageId = package_id
	obj.auctionType = auctionType;
	obj.auctionModel = auctionModel;
	obj.itemArr = listArr
	top.layer.open({
		type: 2,
		title: "选择供应商",
		area: ['400px', '250px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Agent/AuctionNotice/modal/selectSupplier.html?id=' + package_id,
		success: function (layero, index) {
			//			var body = layero.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsgMore(obj, detailTable, "views");

		}
	});



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


}

//按清单预览
function resultView(index, type) {
	var rows = $("#detailResult").bootstrapTable('getData')[index];
	if (listArr && listArr.length > 0) {

		for (var i = 0; i < listArr.length; i++) {
			if (rows.supplierEnterpriseId == listArr[i].supplierId) {
				rows.resultContent = listArr[i].resultContent;
				rows.pdfUrl = listArr[i].pdfUrl
			}
		}
	}
	rows.projectId = projectId;
	rows.packageId = package_id;
	rows.supplierId = rows.supplierEnterpriseId;
	rows.isShow = showMsg;
	rows.auctionType = auctionType;
	rows.auctionModel = auctionModel;
	rows.packageDetailedId = rows.id;
	rows.isBid = rows.isBid;
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
				//					var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(rows, type);
			}
		});
	}


}


// 新预览功能
function viewBidResultsNew($index,$flag) {
	var row = $("#tableNotice").bootstrapTable("getData")[$index];
	if (row.pdfUrl) {
		previewPdf(row.pdfUrl);
	} else {
		top.layer.open({
			type: 2,
			title: "查看结果通知书",
			area: ['550px', '650px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/common/Agent/BidNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(row, type);
			}
		});
	}
}

//按包件
function viewBidResult($index, type) {
	BidResultItem[$index].isShow = showMsg;
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
			content: 'Auction/common/Agent/BidNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(BidResultItem[$index], type);
			}
		});
	}

}


//按明细
function viewBidResults($index, $temp, type) {
	var resDate = {};
	resDate = item[$temp].bidResultItems[$index];
	resDate.auctionModel = auctionModel;
	resDate.isShow = showMsg;
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
			content: 'Auction/common/Agent/BidNotice/modal/newViewResult.html',
			success: function (layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(resDate, type);
			}
		});
	}

}


 
function getTable(){
 
	$.ajax({
		url:top.config.AuctionHost + "/BidWasteNoticeController/findPackageInfo.do",
		type: 'get',
		data: {
			'packageId': package_id,
			'projectId': projectId,
			'tenderType': 2, //0为询价采购，1为竞价采购，2为竞卖
			// 'bidResultId':keyId,
		},
		dataType: 'json',
		async: false,
		success: function (result) {
			var data = result.data;
			var itemNew = [];

			$("#tableNotice").bootstrapTable({
				dataType: 'json',
				method: 'get',
				locale: "zh-CN",
				pagination: false, // 是否启用分页
				showPaginationSwitch: false, // 是否显示 数据条数选择框
				search: false, // 不显示 搜索框
				classes: 'table table-bordered', // Class样式
				//showRefresh : true, // 显示刷新按钮
				silent: true, // 必须设置刷新事件
				// striped: true,
				uniqueId: "id",
				columns: [{
					title: "序号",
					align: "center",
					halign: "center",
					width: "5%",
					formatter: function (value, row, index) {
						return index + 1;
					}
				},
				{
					field: 'enterpriseName',
					title: '中标供应商名称',
					align:'center',
					formatter: function (value, row, index) {
						return '<span style="white-space: normal;">'+showBidderRenameList(row.supplierId, value, RenameData, 'body')+'</span>';
					}
				},
				{
					field: 'isEliminated',
					title: '通知类型',
					formatter: function (value, row, index) {
						if (value == 0) {
							return '<div class="form-control">中选</div><input type="hidden" name="BidResultItems['+index+'].isBid" value="0">';
						} else {
							return '<div class="form-control">未中选</div><input type="hidden" name="BidResultItems['+index+'].isBid" value="1">';
						}
					}
					
				},
				{
					field: 'genItemName',
					title: '总称',
					align: 'left',
					formatter: function (value, row, index) {
						if (value) {
							return '<b>' + value + '</b>'
						} else {
							return '-'
						}
					}
				},
				{
					field: 'detailedName',
					title: '品种',
				},
				{
					field: 'priceType',
					title: '顶价/低价',
					formatter: function (value, row, index) {
		
						if (value == 0) {
							return "竞低价";
						} else if(value == 1){
							return "竞高价";
						}
		
					}
				},
		
				
				{
					field: 'proportion',
					title: '权重',
					formatter: function (value, row, index) {
						if(value){
							return (+value * 100).toFixed(2) + '%';
						}
					}
				},
				{
					field: 'offerMoney',
					title: '成交金额',
					align: 'center',
					formatter: function(value, row, index){
						if(value){
		
							return "<input type='hidden' class='bidContent' name='bidResultItems[" + index + "].bidPrice' value='" + row.offerMoney + "'>"+value;
						}
					}
				},
				{
					field: 'detailedUnit',
					title: '单位',
					align: 'center',
					formatter: function(value, row, index) {
						if(value) {
							return '<div>元/' + value + '</div>'
						} else {
							return '<div>-</div>'
						}
			
					}
				},
				{
					field: 'cz',
					title: '操作',
					align: 'center',
					formatter: function (value, row, index) {
						// return '<button class="btn btn-xs btn-primary">操作</button>'
						var str = '';
						str += "<a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResultsNew(" + index + ",\"views\")'>查看</a>";
 
						return str;
		
					}
				}
				],
				UniqueId:"id",
				undefinedText: "",
				paganization: false
			});
		
			var _data = data.auctionOfferList;
			var newData = [];
			for(let i = 0; i<_data.length; i++){
				let newItem = {
					'enterpriseName':_data[i].enterpriseName,
					'isEliminated':_data[i].isEliminated,
					'packageId':_data[i].packageId,
					'projectId':_data[i].projectId,
					'supplierId':_data[i].supplierId,
					'resultContent':_data[i].resultContent,
					'pdfUrl':_data[i].pdfUrl,
				};
				if(!_data[i].isEliminated){
					for(let o = 0; o<_data[i].materialDetails.length; o++){
						let childItem =  $.extend({},newItem, _data[i].materialDetails[o]);
						newData.push(childItem);
					}
				}else{
					newData.push(newItem);
				}
			}
		
			let obj = {};
			for(let change=0; change<newData.length; change++) {
				obj = {
					"id": newData[change]['id'],
					"detailedCount": newData[change]['detailedCount'],
					"detailedName": newData[change]['detailedName'],
					"detailedUnit": newData[change]['detailedUnit'],
					"enterpriseName": newData[change]['enterpriseName'],
					"genItemName": newData[change]['genItemName'],
					"isEliminated": newData[change]['isEliminated'],
					"itemFlag": newData[change]['itemFlag'],
					"offerMoney": newData[change]['offerMoney'],
					"packageId": newData[change]['packageId'],
					"priceType": newData[change]['priceType'],
					"projectId": newData[change]['projectId'],
					"proportion": newData[change]['proportion'],
					"supplierId": newData[change]['supplierId'],
					'resultContent':newData[change]['resultContent'],
					'pdfUrl':newData[change]['pdfUrl'],
				}
		
				var newData_sid = newData[change].supplierId;
				for(let i = 0; i<data.auctionPackageDetaileds.length; i++){ 
					if(data.auctionPackageDetaileds[i].offerItems && data.auctionPackageDetaileds[i].offerItems[0] && data.auctionPackageDetaileds[i].offerItems[0].supplierId == newData_sid){
						obj.resultContent = data.auctionPackageDetaileds[i].offerItems[0].resultContent;
					}
				}
		
				newData[change] = obj;
			}
			itemNew = newData;
			$("#tableNotice").bootstrapTable('load',newData);
		
			mergeCells('tableNotice',newData);
			mergeCellsgenItemName('tableNotice',newData);
		}
	})
}

// IE兼容 ES7 的 includes 方法
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (valueToFind, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }
            while (k < len) {
                if (sameValueZero(o[k], valueToFind)) {
                    return true;
                }
                k++;
            }
            return false;
        }
    });
}

function mergeCells(table,tabdata){
 
    var length = tabdata.length; //总计多少条数据
    var FlagList = [];  // 多少条itemFlag
    var index = []; // 0 , 2
	var count = []  // 2 , 2

	var enterpriseName_genItemName = [];

	for(let i=0; i<length; i++){
		if(tabdata[i].enterpriseName){
			var item = tabdata[i].enterpriseName;
			if(!FlagList.includes(item)){
				FlagList.push(item);
				index.push(i);
				enterpriseName_genItemName.push(item);
			}	
		}
	} 
    for(let i=0; i<FlagList.length; i++){
        let num = 0;
        for(let c=0; c<tabdata.length; c++){
            if(tabdata[c].enterpriseName == FlagList[i]){
                num++;
            }
        }
        count.push(num);
	}


    // 需要 index 和 count
    for(let r = 0; r < index.length; r++){
		$('#'+table).bootstrapTable('mergeCells',{index:index[r], field:'enterpriseName', colspan: 1, rowspan: count[r]});
		$('#'+table).bootstrapTable('mergeCells',{index:index[r], field:'isEliminated', colspan: 1, rowspan: count[r]});
		$('#'+table).bootstrapTable('mergeCells',{index:index[r], field:'cz', colspan: 1, rowspan: count[r]});
	}
}

 
function mergeCellsgenItemName(table,tabdata){
    var length = tabdata.length; //总计多少条数据
    var FlagList = [];  // 多少条itemFlag
    var index = []; // 0 , 2 , 
	var count = []  // 2 , 2
 
	for(let i=0; i<length; i++){
		if(tabdata[i].genItemName){
			var item = tabdata[i].genItemName;
			if(!FlagList.includes(item)){
				FlagList.push(item);
				index.push(i);
			}	
		}
	} 
    for(let i=0; i<FlagList.length; i++){
        let num = 0;
        for(let c=0; c<tabdata.length; c++){
            if(tabdata[c].genItemName == FlagList[i]){
                num++;
            }
        }
        count.push(num);
	}
	// console.log(index);console.log(count);

    // 需要 index 和 count
    for(let r = 0; r < index.length; r++){
		$('#'+table).bootstrapTable('mergeCells',{index:index[r], field:'genItemName', colspan: 1, rowspan: count[r]});
	}
}
 