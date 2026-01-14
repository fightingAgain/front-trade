var urlsupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getAllAuctionOfferList.do"; //明细列表
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do";//供应商列表
var urlUpdateBidResultNew = top.config.AuctionHost + "/ProjectBidResultController/updateBidResultNew.do"; //清单明细中选人切换时
var urlbargainList = top.config.AuctionHost + "/AuctionSfcOfferController/getAuctionOfferesPageList.do";//议价信息列表
var packageId = getUrlParam("id");
var auctionModelType = 1;
var backList = []; //黑名单列表
var detailTable = [];
var prevCallback; //回调方法
var barginList = []; 
$(function(){
	//提交
	$("#btn_submit").click(function(){
		UpdateBidResultNew();
	});
	//是否竞价失败
	$("#detailPackageList").off("click", ".isFail").on("click", ".isFail", function(){
		if($(this).is(":checked")){
			$(this).closest("tr").find("input:radio").parent("label").hide();
		} else {
			$(this).closest("tr").find("input:radio").parent("label").show();
		}
	});
	//关闭
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
});
function getMsg(params, callback){
	backList = params;
	prevCallback = callback;
	initBargin();
	supplier();
	getTable();
}
//确定更换下一候选人为中选
function UpdateBidResultNew() {
	var commitData = {};
	var flag = false;
	var specificationIds = []; //竞价失败
	var isBidData = [];
	$("#detailPackageList tbody tr").each(function(){
		var len = $(this).find("input:radio:checked").length;
		var index = $(this).attr("data-index");
		var isFail = $(this).find(".isFail").length > 0 ? true : false;
		if($(this).find("input:radio").length > 0){
			if(len == 0 && ((isFail && (!$(this).find(".isFail").is(":checked"))) || (!isFail))){
				top.layer.alert("第" + (Number(index) + 1) + "行请选择中选人");
				flag = true;
				return false;
			}
			isBidData.push({
				id:$(this).find("input:radio:checked").attr("data-id"),
				specificationId: listData[index].id
			});
		}
		if($(this).find("input:checkbox").length > 0 && $(this).find(".isFail").is(":checked")){
			specificationIds.push($(this).find(".isFail").attr("data-id"));
		}
	});
	if(flag){return;}
	
	var arr = [];
	var isAuctionFail;
	for(var i = 0; i < detailTable.length; i++){
		arr.push({
			isBid: detailTable[i].isBid,
			supplierEnterpriseId: detailTable[i].supplierEnterpriseId,
			bidPrice: detailTable[i].noTaxRateTotalPrice,
			specificationId: detailTable[i].specificationId,
			id: detailTable[i].id
		});
		for (var j = 0; j < specificationIds.length; j++) {
			if(specificationIds[j] == detailTable[i].specificationId){
				arr[arr.length - 1].isBid = 1;
				break;
			}
		}
		if(j == specificationIds.length){
			for(var k = 0; k < isBidData.length; k++){
				if(isBidData[k].id == detailTable[i].id){
					arr[arr.length - 1].isBid = 0;
					break;
				} else {
					if(isBidData[k].specificationId == detailTable[i].specificationId){
						arr[arr.length - 1].isBid = 1;
					}
				}
			}
		}
	}
	

	commitData.auctionSfcOfferItemList = arr;
	commitData.packageId = packageId;
	commitData.specificationIds = specificationIds.join(","); //竞价失败
	$.ajax({
		url: urlUpdateBidResultNew,
		type:'post',
		dataType: 'json',
		async: false,
		data: commitData,
		success: function (data) {
			if(!data.success){
				top.layer.alert(data.message);
			}
			top.layer.alert("提交成功",{closeBtn:0},function(idx){
				prevCallback();
			});
			var index = top.layer.getFrameIndex(window.name);
			top.layer.close(index);
		}
	});
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
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				returnData = response.data;
				for(var i = 0; i < returnData.length; i++){
					for(var j = 0; j < backList.length; j++){
						if(returnData[i].supplierEnterpriseId == backList[j].supplierId){
							returnData[i].isBack = 1; //1是黑名单
						}
					}
					for(var k = 0; k < barginList.length; k++){
						if(returnData[i].supplierEnterpriseId == barginList[k].supplierEnterpriseId){
							returnData[i].sfcBarginStatus = barginList[k].sfcBarginStatus;
						}
					}
				}
			}
		}
	})
}
//获取供应商议价状态
function initBargin() {
	$.ajax({
		type: "POST",
		url: urlbargainList,
		data: {
			packageId: packageId,
		},
		async: false,
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				barginList = response.data;
			}
		}
	})
}

//供应商报价
function getTable() {
	$.ajax({
		url: urlsupplier,
		type: "post",
		async:false,
		data: {
			packageId: packageId,
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = top.layer.msg('数据加载中', {
				icon: 0
			});
		},
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (res) {
			if (res.success) {
				
				detaillist = res.data;
				var detailBackList = [];
				if (detaillist && detaillist.length > 0) {
					var auctionSfcOfferes = [];
					var textVals = [];
					var isMinPrice = [];
					var objsss = [];
					for (var i = 0; i < detaillist.length; i++) {
						detaillist[i].idx = i;
						var flag = false;
						auctionSfcOfferes = detaillist[i].auctionSfcOfferItemList
						if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {
							for (var c = 0; c < auctionSfcOfferes.length; c++) {
								detailTable.push(auctionSfcOfferes[c]);
								for (var e = returnData.length - 1; e >= 0; e--) {
									if(returnData[e].sfcBarginStatus == 0){
										continue;
									}
									
									if (returnData[e].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
										var priceTtotal = 'totalPrice' + e;
										var priceUnit = 'unitPrice' + e;
										var priceSId = 'supplierId' + e;
										var priceItemId = 'itemId' + e;
										var priceIsBack = 'isBack' + e;
										if (detaillist[i].id == auctionSfcOfferes[c].specificationId) {
											detaillist[i][priceTtotal] = auctionSfcOfferes[c].noTaxRateTotalPrice;
											detaillist[i][priceUnit] = auctionSfcOfferes[c].noTaxRateUnitPrice;
											detaillist[i][priceSId] = auctionSfcOfferes[c].supplierEnterpriseId;
											detaillist[i][priceItemId] = auctionSfcOfferes[c].id;
											detaillist[i][priceIsBack] = returnData[e].isBack ? 1 : 0;
										}
										if(returnData[e].isBack == 1 && auctionSfcOfferes[c].isBid == 0){
											flag = true;
										}
									}
								}			
							}
							if(flag){
								detailBackList.push(detaillist[i]);
							}
						}
					}
					listTable()
					//添加表格动态列及赋值
					if (returnData && returnData.length > 0) {
						for (var e = returnData.length - 1; e >= 0; e--) {
							if(returnData[e].sfcBarginStatus == 0){
								continue;
							}
							
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
								width:"120px",
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
									if(!value){
										return "";
									}
									var idx = field.substring(9);
									var html = "";
									var isDisabled = "";
									if(row["isBack"+idx] == 1){
										isDisabled = " disabled='disabled'";
									}
									html = '<label class="label-inline"><input'+isDisabled+' type="radio" name="isBid'+index+'" data-idx="'+row.idx+'" data-id="'+row["itemId"+idx]+'">中选</label>';
									
									return html;
								}
							}
							var obj = {
								"title": returnData[e].supplierEnterpriseName,
								"field": 'supplier' + e,
								"valign": "middle",
								"align": "center",
								"colspan": 3,
								"rowspan": 1

							}
							if(auctionModelType == 1){
								objsss.splice(0, 0, obj2, obj1, obj3);
							} else {
								objsss.splice(0, 0, obj2, obj1);
							}
							col[0].splice(10, 0, obj);

						}
					}
					col.splice(1, 0, objsss)
					if (detailBackList.length < 2500) {

						listData = detailBackList;
						initTable();
						$('#detailPackageList').bootstrapTable("load", listData);
					} else {
						total = detailBackList.length;
						pageSize = Math.ceil(total / 100)
						pageIndex = 1;
						start = (pageIndex - 1) * 100
						end = start + 100
						listData = detailBackList.slice(start, end)
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

//表格列
function listTable() {
	col = [
		[{
			title: "序号",
			valign: "middle",
			align: "center",
			width: "50px",
			colspan: 1,
			rowspan: 2,
			class:"colstyle",
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
			class:"colstyle",
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
			class:"colstyle",
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
			class:"colstyle",
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
			cellStyle: function (value, row, index) {
				if (parseFloat(value) < 0) {
					return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all", "background": "red" } }
				} else {
					return { css: { "white-space": "nowrap", "word-wrap": "break-word", "word-break": "break-all" } }
				}
			},
			formatter: function (value, row, index) {
				return value ? parseFloat(value) : value;
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
				if(value == undefined){
					return "";
				}
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
			cellStyle: function (value, row, index) {
				if (value) {
					return {
						css: {
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
			cellStyle: function (value, row, index) {
				if (value) {
					return {
						css: {
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
			cellStyle: function (value, row, index) {
				if (value) {
					return {
						css: {
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
			formatter: function (value, row, index) {
				if (value) {
					return parseFloat(value) + "%"
				}

			},
			cellStyle: function (value, row, index) {
				if (value) {
					return {
						css: {
							"white-space": "nowrap"
						}
					}
				} else {
					return {}
				}

			},

		}
		],

	];
	col[0].push({
	 	field: "isFailAuction",
	 	title: "&nbsp;竞价失败&nbsp;",
	 	valign: "middle",
	 	align: "center",
	 	colspan: 1,
		rowspan: 2,
	 	halign: "center",
	 	formatter: function (value, row, index) {
	 		return html = '<label class="label-inline"><input type="checkbox" value="0" class="isFail" data-id="'+row.id+'">是</label>';
//	 		if(Number(row.budgetPrice) - Number(row.minPrice) < 0){
// 				if(value == 1){
// 					return html = '<label class="label-inline"><input type="checkbox" value="0" class="isFail" data-id="'+row.id+'">是</label>';
//	 			} else {
//	 				return html = '<label class="label-inline"><input type="checkbox" checked="checked" value="0" class="isFail" data-id="'+row.id+'">是</label>';
//	 			}
//	 			
//	 		} else {
//	 			return "";
//	 		}
	 	}
	});

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
	$('#detailPackageList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: col,
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