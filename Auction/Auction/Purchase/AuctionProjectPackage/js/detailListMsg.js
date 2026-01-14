//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
//供应商
var urlsupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getAllAuctionOfferList.do";
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
//修改包件设置
var urlAuctionSetting = top.config.AuctionHost + "/AuctionProjectPackageController/updatePackageSetting.do";
var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var supplierCountUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getAuctionOfferesCount.do" //供应商人数
var projectId = location.search.getQueryString("projectId"); //项目id
var packageId = location.search.getQueryString("id"); //包件id
var rowresult = JSON.parse(sessionStorage.getItem("rowList"));
var packageData, curStage, detailedCount, detaillist = [],
	col, msgloading, listData = [];
textTitleField = [];
returnData = []
var total;
var pageSize
var pageIndex;
var start
var end
$(function() {
	//项目基础信息	
	auctionInfo();
	//	supplier()
	//	getTable();

	//	listTable();
	//	initTable()

	checkIsSupervisor()
	//关闭
	$("#btn_close").click(function() {
		//		top.layer.closeAll();
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	// 修改截止时间
	$(".changeEndTime").click(function () {
	    if ($('[name=auctionEndDate]').val() == "") {
	        parent.layer.alert('请选择竞价截止时间')
	        return
	    }
	
	    var pare = {
	        'packageId': packageId,
	        'projectId': projectId,
	        'tenderType': 1,
	        'supplierCountConfig': 0,
	        'auctionEndTime': $('[name=auctionEndDate]').val(),
	        'reason': '变更竞价截止时间'
	    }
	
	    top.layer.confirm('确认修改竞价截止时间？', {
	        btn: ['确认', '取消'] //按钮
	    }, function (index) {
	        $.ajax({
	            url: top.config.AuctionHost + "/AuctionPackageConfigController/insertPackageConfig.do",
	            data: pare,
	            type: "post",
	            success: function (res) {
	                top.layer.close(index);
	                if (res.success) {
	                    top.layer.alert("修改成功");
	                } else {
	                    top.layer.alert("修改失败：" + res.message);
	                }
	            }
	        })
	    });
	})

})
//供应商人数
function getCount() {
	setTimeout(getCount, 950);
	$.ajax({
		type: "POST",
		url: supplierCountUrl,
		beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		},
		data: {
			packageId: packageId
		},
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(!response.success) return;
			if(response.success) {
				$("#offerSupplierCount").html(response.data.offerCount)
				if(response.data.stage==0) return jumpToHistory(); //竞价结束

			}
		}
	})
}

//function getMsg(data) {
//	$("td[id]").each(function() {
//		$(this).html(data[this.id]);
//
//		//竞价方式
//		if(this.id == "auctionType") {
//			switch(data[this.id]) {
//				case 0:
//					$(this).html("自由竞价");
//					break;
//				case 1:
//					$(this).html("单轮竞价");
//					break;
//				case 2:
//					$(this).html("多轮竞价 2轮竞价");
//					break;
//				case 3:
//					$(this).html("多轮竞价 3轮竞价");
//					break;
//				case 6:
//					$(this).html("清单式竞价");
//					break;
//				default:
//					$(this).html("不限轮次");
//					break;
//			}
//		}
//		//竞价类型
//		if(this.id == "auctionModel") {
//			switch(data[this.id]) {
//				case 1:
//					$(this).html("按明细");
//					break;
//				case 2:
//					$(this).html("按总价排序后议价");
//					break;
//				case 3:
//					$(this).html("按总价最低中选");
//					break;
//			}
//		}
//	})

//}
//供应商
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

			}
		}
	})
}

//竞价信息
function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: 1,
		},
		success: function(res) {
			if(res.success) {
				packageData = res.data;
				$("td[id]").each(function() {
					$(this).html(packageData[this.id]);

					//竞价方式
					if(this.id == "auctionType") {
						switch(packageData[this.id]) {
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
								$(this).html("清单式竞价");
								break;
							default:
								$(this).html("不限轮次");
								break;
						}
					}
					//竞价类型
					if(this.id == "auctionModel") {
						switch(packageData[this.id]) {
							case 1:
								$(this).html("按明细");
								break;
							case 2:
								$(this).html("按总价排序后议价");
								break;
							case 3:
								$(this).html("按总价最低中选");
								break;
						}
					}
				})
				//在竞价截止前可修改，修改时所选时间必须大于等于当前系统时间
				var nowDate = Date.parse(new Date(top.$("#systemTime").html() + "/" + top.$("#sysTime").html().replace(/\-/g, "/"))); //文件获取截止时间
				var endData = Date.parse(new Date(packageData.auctionEndDate.replace(/\-/g, "/")))
				if(nowDate < endData){
					$('.isCanChange').show();
					$('#auctionEndDate').hide();
					$('[name=auctionEndDate]').val(packageData.auctionEndDate);
					$('[name=auctionEndDate]').datetimepicker({
					    step: 5,
					    lang: 'ch',
					    format: 'Y-m-d H:i:s',
					    minDate: $("#systemTime").html() + " " + top.$("#sysTime").html(),
					    // value: GMTToStr(new Date(packageData.curStageEndTime))
					});
				}else{
					$('.isCanChange').hide();
					$('#auctionEndDate').show();
				};
				getCount()
				
				
				//				$("#endTime").html(packageData.auctionEndDate)
				if(packageData.isEnd) jumpToHistory();
				curStage = packageData.stage;
			}
		}
	})
}

function listTable() {
	if(returnData.length > 0) {
		col = [
			[{
					title: "序号",
					valign: "middle",
					align: "center",
					width: "50px",
					colspan: 1,
					rowspan: 2,
					formatter: function(value, row, index) {
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
					field: "applyNum",
					title: "申请号",
					valign: "middle",
					align: "center",
					colspan: 1,
					rowspan: 2,
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
					field: "materialModel",
					title: "规格型号",
					valign: "middle",
					align: "center",
					colspan: 1,
					rowspan: 2,
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
					field: "materialName",
					title: "名称(内容)",
					valign: "middle",
					align: "center",
					halign: "center",
					colspan: 1,
					rowspan: 2,
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
					field: "materialUnit",
					title: "单位",
					valign: "middle",
					align: "center",
					halign: "center",
					width: '100px',
					colspan: 1,
					rowspan: 2,

				},
				{
					field: "count",
					title: "数量",
					valign: "middle",
					align: "center",
					halign: "center",
					width: '100px',
					colspan: 1,
					rowspan: 2,

				},
				{
					field: "minPrice",
					title: "最低报价",
					valign: "middle",
					align: "center",
					halign: "center",
					width: '100px',
					colspan: 1,
					rowspan: 2,

				},
				{
					field: "budgetPrice",
					title: "预算价",
					valign: "middle",
					align: "center",
					halign: "center",
					width: '100px',
					colspan: 1,
					rowspan: 2,

				},
			],

		]
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
					align: "center",
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
					field: "applyNum",
					title: "申请号",
					valign: "middle",
					align: "center",
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
					field: "materialModel",
					title: "规格型号",
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
					field: "materialName",
					title: "名称(内容)",
					align: "center",
					halign: "center",
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
					align: "center",
					halign: "center",
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
					field: "materialUnit",
					title: "单位",
					align: "center",
					halign: "center",
					width: '100px',

				},
				{
					field: "count",
					title: "数量",
					align: "center",
					halign: "center",
					width: '100px',

				},
				{
					field: "minPrice",
					title: "最低报价",
					align: "center",
					halign: "center",
					width: '100px',

				},
				{
					field: "budgetPrice",
					title: "预算价",
					align: "center",
					halign: "center",
					width: '100px',

				},
			],

		]
	}

}

//供应商报价
function getTable() {
	$.ajax({
		url: urlsupplier,
		type: "post",
		data: {
			packageId: packageId,
		},
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = parent.layer.load(0, {
				shade: [0.3, '#000000']
			});
		},
		success: function(res) {
			if(res.success) {
				detaillist = res.data
				if(detaillist && detaillist.length > 0) {
					var auctionSfcOfferes = []
					var textVals = [];
					var objsss = []
					for(var i = 0; i < detaillist.length; i++) {
						auctionSfcOfferes = detaillist[i].auctionSfcOfferItemList
						if(auctionSfcOfferes && auctionSfcOfferes.length > 0) {
							for(var c = 0; c < auctionSfcOfferes.length; c++) {
								for(var e = 0; e < returnData.length; e++) {
									if(returnData[e].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
										var priceTtotal = 'totalPrice' + e;
										var priceUnit = 'unitPrice' + e
										if(detaillist[i].id == auctionSfcOfferes[c].specificationId) {
											detaillist[i][priceTtotal] = auctionSfcOfferes[c].noTaxRateTotalPrice;
											detaillist[i][priceUnit] = auctionSfcOfferes[c].noTaxRateUnitPrice
										}
									}
								}
								//								textVals.push({
								//									'taxRateTotalPrice': auctionSfcOfferes[c].noTaxRateTotalPrice,
								//									'noTaxRateUnitPrice': auctionSfcOfferes[c].noTaxRateUnitPrice,
								//									'purSpecificationId': auctionSfcOfferes[c].specificationId,
								//									'auctionSfcOfferesId': auctionSfcOfferes[c].id,
								//									'supplierEnterpriseId': auctionSfcOfferes[c].supplierEnterpriseId
								//								});
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
								//
								//								}
							}
						}
					}
					listTable();
					if(returnData && returnData.length > 0) {

						for(var e = 0; e < returnData.length; e++) {
							var obj = {
								"title": returnData[e].supplierEnterpriseName,
								"field": 'supplier' + e,
								"colspan": 2,
								"rowspan": 1,
							}
							var objss = {
								field: 'totalPrice' + e,
								title: '不含税总价',
								valign: "middle",
								align: "center",
								cellStyle: addStyle

							}
							var objs = {
								field: 'unitPrice' + e,
								title: '不含税单价',
								valign: "middle",
								align: "center",
								cellStyle: addStyle

							}

							//						objsss.push(objs, objss)
							objsss.splice(0, 0, objs, objss)
							col[0].splice(6, 0, obj);

							//						for(var n = 0; n < textVals.length; n++) {
							//							if(textTitleField[e].supplierEnterpriseId == textVals[n].supplierEnterpriseId) {
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
					col.splice(1, 0, objsss)
					if(detaillist.length < 3000) {
						listData = detaillist;
						initTable();
						$('#detaillist_msg').bootstrapTable("load", listData);
					} else {
						total = detaillist.length;
						pageSize = Math.ceil(total / 100)
						pageIndex = 1;
						start = (pageIndex - 1) * 100;
						end = start + 100
						listData = detaillist.slice(start, end)
						initTable();
						$('#detaillist_msg').bootstrapTable("load", listData);

						//						var LockMore = false; //锁定
						//						$(window).scroll(function(event) {
						//							var supportPageOffset = window.pageXOffset !== undefined;
						//							var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
						//							var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
						//							var wScrollY = y; // 当前滚动条位置  
						//							var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）  
						//							var bScrollH = document.body.scrollHeight; // 滚动条总高度      
						//							if(wScrollY + wInnerH >= bScrollH) {
						//								//触底							
						//								if(pageIndex >= pageSize) {
						//									// 滚动太快，下标超过了数组的长度
						//									pageIndex = pageSize
						//									return;
						//								} else {
						//									pageIndex++
						//									start = (pageIndex - 1) * 650
						//									end = start + 650;
						//									var listTable1 = detaillist.slice(start, end)
						//	
						//									$('#detaillist_msg').bootstrapTable("append", listTable1);
						//								}
						//	
						//								if(LockMore) {
						//									return false;
						//								}
						//							}
						//						});
					}
				}
			}
		},
		complete: function() {

			parent.layer.close(msgloading);

		}

	})

}

function addStyle(value, row, index) {
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

//表格初始化
function initTable() {
	if(detaillist.length > 20) {
		var height = "550"
	} else {
		var height = ""
	}
	$('#detaillist_msg').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: col,
		height: height,
		onAll: function() {
			if(detaillist.length > 3000) {
				$("#detaillist_msg").parent(".fixed-table-body").scroll(function(event) {
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
							$('#detaillist_msg').bootstrapTable("append", listTable1);
						}

						if(LockMore) {
							return false;
						}
					}

				})
			}
		}
	});

};

function loadOfferLog(datas) {
	//	$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
	return index + 1;
}

//跳转历史页面
function jumpToHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("detailListHistoryMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}

// 检查是不是监标人进入此页面
function checkIsSupervisor() {
	$.ajax({
		type: 'post',
		url: top.config.Syshost + '/ProjectSupervisorController/isSupervisor.do',
		data: {
			projectId: projectId,
		},
		async: false,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader('Token', token);
		},
		success: function (data) {
			if (data.success) {
				if (data.data) {
						$(".changeEndTime,input[name=auctionEndDate]").attr('disabled','disabled')
				}
			}
		},
	});
}