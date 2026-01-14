var getSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getOfferItemBargainList.do" //议价表格

//var findeSupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getTotalPrice.do" //供应商
//var findeSupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do" //供应商
var findeSupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplieres.do" //供应商列表，新
//var saveUrl = top.config.AuctionHost + "/AuctionSfcOfferController/updateBagainingResult.do"; //保存
var saveUrl = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/saveAuctionBargain.do"; //保存
var url = window.location.search;
var package_id = getUrlParam("id")
var type = getUrlParam("type");
var auctionType = getUrlParam("auctionType");
var bargainStatus = JSON.parse(sessionStorage.getItem("bargainStatus"));
var col; //表头
var boot; //表格显示状态
var auctionList = [] //议价数据
var listData = []
var textSupplier = []; //供应商	
var bidSupplierId;
var msgloading
var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
var suppStatus;
var suppName;
var total;
var pageSize
var pageIndex;
var start
var end

$(function () {
	if(type == 1){
		$("#btnAll_submit").show();
		$("#btnOne_submit").show();
	} else {
		$("#btnAll_submit").hide();
		$("#btnOne_submit").hide();
	}
	$('#endTime').datetimepicker({
		step: 5,
		lang: 'ch',
		format: 'Y-m-d H:i',
		onShow: function () {
			$('#endTime').datetimepicker({
				minDate: NewDateT(nowSysDate)
			})
		},
		onClose: function (e) {
			//			$("#StartDate").html($('#noticeStartDate').val());
		},
	});

	//保存
	//	$("#btn_save").click(function() {
	//		if(checkForm($("#form"))) {
	//			saveForm('save')
	//		}
	//
	//	})
	//提交
	$("#btn_submit").click(function () {
		// parent.layer.confirm("确定提交议价", {
		// 	icon: 3,
		// 	title: '询问'
		// }, function(index) {
		// 	parent.layer.close(index);
		if (checkForm($("#form"))) {
			saveForm('submit');
		}

		// })

	})
	//关闭
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	})
	if (type == '1') {
		getSupplier();
		//		getBargain();
		boot = false;
	} else {
		getSupplier();

		//		$("#toolbar").show();
		boot = false;

	}

});

//按总价供应商
function getSupplier() {
	$.ajax({
		type: "POST",
		url: findeSupplier,
		//		async: false,
		data: {
			packageId: package_id
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				var SfcList = response.data;
				if(type == 1){
					getSupplierBargain(SfcList.length);
				}
				//				var SfcList = response.data.auctionSfcOfferesList
				if (type == '2' || type == '1') {
					if (bargainStatus) {
						var result = [];
						for (var i = 0; i < SfcList.length; i++) {
							var obj = SfcList[i];
							var num = obj.supplierEnterpriseId;
							var isExist = false;
							for (var j = 0; j < bargainStatus.length; j++) {
								var aj = bargainStatus[j];
								var n = aj.supplierEnterpriseId;
								if (n == num) {
									isExist = true;
									break;
								}
							}
							if (!isExist) {
								result.push(obj);
							}
						}
						textSupplier = result
						bidSupplierId = textSupplier[0].supplierEnterpriseId
						if (textSupplier) {
							setSupplier();
							getBargain();

						}
					} else {
						bidSupplierId = SfcList[0].supplierEnterpriseId
						$("#supplier").val(bidSupplierId);
						textSupplier = SfcList
						if (textSupplier) {
							setSupplier();
							getBargain();

						}
					}
				} else if (type == '3') {
					var id;
					var text;
					if (bargainStatus && bargainStatus.length > 0) {
						for (let i = 0; i < SfcList.length; i++) {
							var flag = true;
							for (let j = 0; j < bargainStatus.length; j++) {
								if (SfcList[i].supplierEnterpriseId == bargainStatus[j].supplierEnterpriseId) {
									flag = false;
								}
							}
							if (flag) {
								id = SfcList[i].supplierEnterpriseId;
								text = SfcList[i];
								break;
							}
						}
						bidSupplierId = id
						$("#supplier").val(bidSupplierId);
						textSupplier = text;
					} else {
						bidSupplierId = SfcList[0].supplierEnterpriseId
						$("#supplier").val(bidSupplierId);
						textSupplier = SfcList[0]
					}

					if (textSupplier) {
						setSupplier();
						getBargain();
					}
				}
			}
		}
	})
}

function setSupplier() {
	var options
	$("#supplier").append(options);
	if (textSupplier.length > 0) {
		for (var r = 0; r < textSupplier.length; r++) {
			if (bidSupplierId == textSupplier[r].supplierEnterpriseId) {

				options = "<option value='" + textSupplier[r].supplierEnterpriseId + "' selected>" + textSupplier[r].supplierEnterpriseName + "</option>";
			} else {

				options = "<option value='" + textSupplier[r].supplierEnterpriseId + "'>" + textSupplier[r].supplierEnterpriseName + "</option>";
			}

			$("#supplier").append(options);

		}
	} else {
		$("#supplier").attr("disabled", "disabled")
		if (bidSupplierId == textSupplier.supplierEnterpriseId) {

			options = "<option value='" + textSupplier.supplierEnterpriseId + "' selected>" + textSupplier.supplierEnterpriseName + "</option>";
		} else {

			options = "<option value='" + textSupplier.supplierEnterpriseId + "'>" + textSupplier.supplierEnterpriseName + "</option>";
		}

		$("#supplier").append(options);
	}

}

function changeSelt() {
	$('#PackageList').bootstrapTable('destroy');
	var supplierVal = $("#supplier").val()
	bidSupplierId = supplierVal;
	getBargain()
}

//议价列表
function getBargain() {
	//按明细
	if (type == '1') {
		var obj = {
			packageId: package_id,
			supplierEnterpriseId: bidSupplierId
		}
	} else if (type == '2') { //按总价
		var obj = {
			packageId: package_id,
			supplierEnterpriseId: bidSupplierId
		}
	} else if (type == '3') {
		var obj = {
			packageId: package_id,
			supplierEnterpriseId: bidSupplierId
		}
	}
	$.ajax({
		type: "post",
		url: getSupplierUrl,
		dataType: 'json',
		data: obj,
		//		async: false,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = parent.layer.load(0, {
				shade: [0.3, '#000000']
			});
		},
		success: function (result) {
			if (result.success) {
				listTable();
				auctionList = result.data
				if (auctionList && auctionList.length > 0) {
					var auctionSfcOfferes;
					var textVals = [];
					var textTitleField = [];
					var isMinPrice = [];
					for (var i = 0; i < auctionList.length; i++) {
						auctionSfcOfferes = auctionList[i].auctionSfcOfferItem;
						textVals.push({
							'taxRateTotalPrice': auctionSfcOfferes.noTaxRateUnitPrice,
							'purSpecificationId': auctionSfcOfferes.specificationId,
							'auctionSfcOfferesId': auctionSfcOfferes.id,
							'supplierEnterpriseId': auctionSfcOfferes.supplierEnterpriseId,
							'supplierEnterpriseName': auctionSfcOfferes.supplierEnterpriseName,
						})
						//						if(auctionSfcOfferes && auctionSfcOfferes.length > 0) {
						//							for(var c = 0; c < auctionSfcOfferes.length; c++) {
						//								textVals.push({
						//									'taxRateTotalPrice': auctionSfcOfferes[c].noTaxRateTotalPrice,
						//									'purSpecificationId': auctionSfcOfferes[c].specificationId,
						//									'auctionSfcOfferesId': auctionSfcOfferes[c].id,
						//									'supplierEnterpriseId': auctionSfcOfferes[c].supplierEnterpriseId,
						//									'isMinPrice': auctionSfcOfferes[c].isMinPrice
						//								});
						if (textTitleField) {
							var result = false;
							for (var textIndex = 0; textIndex < textTitleField.length; textIndex++) {
								if (textTitleField[textIndex].supplierEnterpriseId == auctionSfcOfferes.supplierEnterpriseId) {
									result = true;
								}
							}
							if (!result) {
								textTitleField.push({
									'supplierEnterpriseId': auctionSfcOfferes.supplierEnterpriseId,
									'supplierEnterpriseName': auctionSfcOfferes.supplierEnterpriseName
								});
							}
							//}

							//}
							//$("#endTime").val(auctionSfcOfferes.endTime)
						}
					}
					for (var e = 0; e < textTitleField.length; e++) {
						var obj = {
							"title": textTitleField[e].supplierEnterpriseName,
							"field": 'supplier' + e,
							"align": "center",
							"cellStyle": {
								css: {
									"min-width": "120px",
									"white-space": "nowrap"
								}
							},

						}
						col.splice(6, 0, obj)
						for (var n = 0; n < textVals.length; n++) {
							if (textTitleField[e].supplierEnterpriseId == textVals[n].supplierEnterpriseId) {
								var fields = 'supplier' + e
								var fieldId = 'supplierId' + e
								for (var o = 0; o < auctionList.length; o++) {
									if (auctionList[o].id == textVals[n].purSpecificationId) {
										auctionList[o][fields] = textVals[n].taxRateTotalPrice
										auctionList[o][fieldId] = textVals[n].supplierEnterpriseId
									}
								}
							}
						}
					}
					if (auctionList.length < 2500) {
						listData = auctionList;
						initTable();
						$('#PackageList').bootstrapTable("load", listData);
					} else {
						total = auctionList.length;
						pageSize = Math.ceil(total / 100)
						pageIndex = 1;
						start = (pageIndex - 1) * 100
						end = start + 100
						listData = auctionList.slice(start, end)
						initTable();
						$('#PackageList').bootstrapTable("load", listData);

						// var LockMore = false; //锁定
						// $(window).scroll(function (event) {
						// 	var supportPageOffset = window.pageXOffset !== undefined;
						// 	var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
						// 	var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
						// 	var wScrollY = y; // 当前滚动条位置  
						// 	var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）  
						// 	var bScrollH = document.body.scrollHeight; // 滚动条总高度      
						// 	if ((wScrollY + wInnerH) >= bScrollH) {
						// 		//触底							
						// 		if (pageIndex >= pageSize) {
						// 			// 滚动太快，下标超过了数组的长度
						// 			pageIndex = pageSize
						// 			return;
						// 		} else {
						// 			pageIndex++
						// 			start = (pageIndex - 1) * 100
						// 			end = start + 100;
						// 			var listTable1 = auctionList.slice(start, end)

						// 			$('#PackageList').bootstrapTable("append", listTable1);
						// 		}

						// 		if (LockMore) {
						// 			return false;
						// 		}
						// 	}
						// });
					}
				}
			}

		},
		complete: function () {
			parent.layer.close(msgloading);

		}
	})
}

//初始表头
function listTable() {
	col = [{
		title: "序号",
		align: "center",
		halign: "center",
		width: "50px",
		formatter: function (value, row, index) {
			return index + 1;
		}
	},
	//		{
	//			field: "materialNum",
	//			title: "物料号",
	//			valign: "middle",
	//			align: "center",
	//			cellStyle: {
	//				css: {
	//					"min-width": "170px",
	//					"word-wrap": "break-word",
	//					"word-break": "break-all",
	//					"white-space": "normal"
	//				}
	//			},
	//
	//		},
	//		{
	//			field: "applyNum",
	//			title: "申请号",
	//			valign: "middle",
	//			align: "center",
	//			cellStyle: {
	//				css: {
	//					"min-width": "170px",
	//					"word-wrap": "break-word",
	//					"word-break": "break-all",
	//					"white-space": "normal"
	//				}
	//			},
	//
	//		},
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

	},
	{
		field: "count",
		title: "数量",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "80px",
				"white-space": "nowrap"
			}
		},

	},
	{
		field: "budgetPrice",
		title: "预算价",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "120px",
				"white-space": "nowrap"
			}
		},
		formatter: function (value, row, index) {
			if (value) {
				return '<span>' + parseFloat(value) + '</span>'
			}


		}

	},
	// {
	// 	field: "unitBudgetPrice",
	// 	title: "预算单价",
	// 	align: "center",
	// 	halign: "center",
	// 	cellStyle: {
	// 		css: {
	// 			"min-width": "120px",
	// 			"white-space": "nowrap"
	// 		}
	// 	},
	// 	formatter: function (value, row, index) {
	// 		if (value) {
	// 			return '<span>' + parseFloat(value) + '</span>'
	// 		}


	// 	}

	// },
	{
		field: "priceDefferences",
		title: "差额（预算价-最低报价）",
		align: "center",
		halign: "center",
		cellStyle: function (value, row, index) {
			if (row.priceDefferencesPercent < 0) {//已经提交数据，颜色变化
				return {
					css: {
						'background': 'red',
						"width": "190px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}
			}
			return {
				css: {
					"width": "190px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			};

		},
		formatter: function (value, row, index) {
			if (value) {
				return '<span>' + parseFloat(value) + '</span>'
			}
		},

	},
	{
		field: "priceDefferencesPercent",
		title: "差额比例",
		align: "center",
		halign: "center",
		cellStyle: function (value, row, index) {
			if (value < 0) {//已经提交数据，颜色变化
				return {
					css: {
						'background': 'red',
						"width": "190px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}
			}
			return {
				css: {
					"min-width": "100px",
					"word-wrap": "break-word",
					"word-break": "break-all",
					"white-space": "normal"
				}
			};

		},
		formatter: function (value, row, index) {
			if (value) {
				return '<span>' + parseFloat(value) + '%</span>'
			}
		},


	},
	{
		field: "minPrice",
		title: "最低单价",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "120px",
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
		field: "bidSupplierId",
		title: "选择供应商",
		align: "center",
		visible: boot,
		cellStyle: {
			css: {
				"min-width": "200px",
				"white-space": "nowrap"
			}
		},
		formatter: function (value, row, index) {
			var cellObj = row.auctionSfcOfferItem
			var arrSelect = []
			var headOption = "<option value =''>请选择</option>";
			if (cellObj) {
				for (var f = 0; f < cellObj.length; f++) {
					arrSelect.push({
						'supplierEnterpriseName': cellObj[f].supplierEnterpriseName,
						'supplierEnterpriseId': cellObj[f].supplierEnterpriseId,
						'id': cellObj[f].id,
						'cellIndex': index
					});
				}
			}
			$.each(arrSelect, function (i, obj) {
				if (value == obj.supplierEnterpriseId) {
					headOption = headOption + "<option value='" + obj.supplierEnterpriseId + "' getId='" + obj.id + "' getsupId='" + obj.supplierEnterpriseId + "'  selected>" + obj.supplierEnterpriseName + "</option>";
				} else {
					headOption = headOption + "<option value='" + obj.supplierEnterpriseId + "' getId='" + obj.id + "' getsupId='" + obj.supplierEnterpriseId + "'  >" + obj.supplierEnterpriseName + "</option>";

				}
			});
			if (cellObj) {

				option = '<select class="form-control" id="bidSupplierName' + index + '""  name="bidSupplierName' + index + '" datatype="*" errormsg="请选择供应商"  style="height:33px;" onChange="changeSelect(this,\'' + index + '\',\'' + row.id + '\')">' +
					headOption + '</select>'
				return option;
			} else {
				option = '<select class="form-control" id="bidSupplierName' + index + '""  name="bidSupplierName' + index + '"   style="height:33px;" onChange="changeSelect(this,\'' + index + '\',\'' + row.id + '\')">' +
					headOption + '</select>'
				return option;
			}

		}

	}, {
		field: "minPrice",
		title: "议价",
		align: "center",
		cellStyle: {
			css: {
				"min-width": "100px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},
		formatter: function (value, row, index) {
			if (value) {
				return '<input class="form-control" type="text" name="bargainingPrice' + index + '" id="bargainingPrice' + index + '"  onblur="isBargainResult(\'' + index + '\',\'' + row.id + '\')" data-value="' + parseFloat(value) + '"  value="' + parseFloat(value) + '"  />';
			} else {
				return '<input class="form-control" type="text" name="bargainingPrice' + index + '" id="bargainingPrice' + index + '"  onblur="isBargainResult(\'' + index + '\',\'' + row.id + '\')" data-value=""    />';

			}

		}

	},
	]
}


//选择供应商
function changeSelect(el, index, id) {
	let supplierEnterpriseId = $(el).find("option:selected").attr('getsupId')
	let ids = $(el).find("option:selected").attr('getId')
	auctionList[index].bidSupplierId = supplierEnterpriseId
	//	auctionList[index].ids = ids

}

//议价
function isBargainResult(index, id) {
	var writevalue = $("#bargainingPrice" + index).val(); //获取改变后的输入框的值
	var isminPrice = $("#bargainingPrice" + index).attr('data-value');
	var reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
	if (!reg.test(writevalue)) {
		top.layer.alert("温馨提示：请正确输入议价!");
		$("#bargainingPrice" + index).val(isminPrice);
		return;
	}
	
	var rows = $('#PackageList').bootstrapTable('getData')[index];
	if(Number(writevalue) > Number(isminPrice)){
		top.layer.alert("温馨提示：议价需小于等于最低单价");
		$("#bargainingPrice" + index).val(isminPrice);
		return;
	}
	auctionList[index].bargainResult = writevalue

}

//表格初始化
function initTable() {
	if (auctionList.length > 20) {
		var height = "550"
	} else {
		var height = ""
	}
	$('#PackageList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: col,
		height: height,
		onAll: function () {
			if (auctionList.length > 2500) {
				$("#PackageList").parent(".fixed-table-body").scroll(function (event) {
					var y = $(this).scrollTop()
					var wScrollY = y; // 当前滚动条位置  
					var wInnerH = $(this)[0].clientHeight; // 设备窗口的高度（不会变）  
					var bScrollH = $(this)[0].scrollHeight; // 滚动条总高度 
					var LockMore = false;
					if (wScrollY + wInnerH >= bScrollH) {
						//触底							
						if (pageIndex >= pageSize) {
							// 滚动太快，下标超过了数组的长度
							pageIndex = pageSize
							return;
						} else {
							pageIndex++
							start = (pageIndex - 1) * 100
							end = start + 100;
							var listTable1 = auctionList.slice(start, end)

							$('#PackageList').bootstrapTable("append", listTable1);
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
	//	$('#PackageList').bootstrapTable("load", auctionList);

};

function saveForm(status) {
	var bargainPrice = [];
	var auctionSfcOfferesList = [];
	var state = [];
	var noPrice = []
	var reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
	var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	var nowDatas = new Date(nowSysDate).getTime() / 1000;

	if (status == 'save') {
		var bargainResultStatus = '0'
	} else if (status == 'submit') {
		var bargainResultStatus = '1'

	}
	if (suppStatus) {
		return top.layer.alert(suppName + "还在议价，不能提交其他议价！");
	}
	for (var q = 0; q < auctionList.length; q++) {
		//	验证
		if (auctionList[q].bargainResult) {
			if (!reg.test(auctionList[q].bargainResult)) {
				return top.layer.alert("温馨提示：请正确输入议价!");
			}
			if(Number(auctionList[q].bargainResult) > Number(auctionList[q].minPrice)) {
				return top.layer.alert("温馨提示：议价需小于等于最低单价!");
			}
			//			else if(Number(auctionList[q].bargainResult) >= Number(auctionList[q].budgetPrice)) {
			//				return top.layer.alert("议价金额需低于预算价!");
			//			}
		}
		//		if(type != '1') {
		auctionSfcOfferesList.push(auctionList[q].auctionSfcOfferItem)
		if (auctionSfcOfferesList && auctionSfcOfferesList.length > 0) {
			for (var o = 0; o < auctionSfcOfferesList.length; o++) {
				if (auctionSfcOfferesList[o].specificationId == auctionList[q].id) {
					bargainPrice.push({
						'offeresItemId': auctionSfcOfferesList[o].id,
						'offeresId': auctionSfcOfferesList[o].sfcOfferesId,
						'specificationId': auctionList[q].id,
						'curPrice': $("#bargainingPrice" + q).val(),
						'hisPrice': auctionSfcOfferesList[o].noTaxRateUnitPrice
					})
					if (typeof (auctionList[q].bargainResult) != "undefined" && auctionList[q].bargainResult != "") {
						//							if(Number(auctionList[q].bargainResult) >= Number(auctionList[q].supplier0)) {
						//								return top.layer.alert("议价金额需低于供应商报价!");
						//							}
						// bargainPrice.push({
						// 	'offeresItemId': auctionSfcOfferesList[o].id,
						// 	'offeresId': auctionSfcOfferesList[o].sfcOfferesId,
						// 	'specificationId': auctionList[q].id,
						// 	'curPrice': auctionList[q].bargainResult,
						// 	'hisPrice': auctionSfcOfferesList[o].noTaxRateTotalPrice
						// })
					}
					if (auctionList[q].bargainResult == "") {
						state.push({
							status: false
						})

					}
					if (auctionList[q].minPrice != $("#bargainingPrice" + q).val()) {
						noPrice.push({
							status: false
						})
					}

				}
			}
		}
		//		}
	}
	// if (bargainPrice) {
	// 	for (var a = 0; a < bargainPrice.length; a++) {
	// 		for (var j = a + 1; j < bargainPrice.length; j++) {
	// 			if (bargainPrice[a].specificationId == bargainPrice[j].specificationId) { //第一个等同于第二个，splice方法删除第二个
	// 				bargainPrice.splice(j, 1);
	// 				j--;
	// 			}
	// 		}
	// 	}
	// }
	if (state.length == auctionSfcOfferesList.length) {
		return top.layer.alert("温馨提示：请输入议价金额");
	}
	if ($("#endTime").val() == "") {
		return top.layer.alert("温馨提示：请选择议价截止时间");
	}
	if ($("#endTime").val()) {
		var endtime = new Date($("#endTime").val()).getTime() / 1000;
		if (Number(endtime) < Number(nowDatas)) {
			return top.layer.alert("温馨提示：议价时间不得早于当前时间");
		}
	}
	var arr = {
		'status': bargainResultStatus,
		'auctionSfcOfferBargainResultes': bargainPrice,
		'packageId': package_id,
		'supplierEnterpriseId': bidSupplierId,
		'endTime': $("#endTime").val()
	}
	

	if (noPrice.length < 1) {
		parent.layer.confirm('当前未设置议价金额确定默认最低单价提交？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function (index, layero) {

			commitForm(arr)
			parent.layer.close(index);


		}, function (index) {
			parent.layer.close(index);
		});
	} else {
		parent.layer.confirm('温馨提示：确定提交议价？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function (index, layero) {

			commitForm(arr)
			parent.layer.close(index);


		}, function (index) {
			parent.layer.close(index);
		});
	}

}

function commitForm(arr) {
	if (type == '1') {
		var urlSave = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/saveMxAuctionBargain.do"
	} else {
		var urlSave = saveUrl
	}
	$.ajax({
		type: "POST",
		// contentType: "application/x-www-form-urlencoded;charset=utf-8", //WebService 会返回Json类型
		contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
		url: urlSave,
		data: JSON.stringify(arr),//解决数据量大时后台接收不到，后台对应用字符串方式接收
		async: false,
		dataType: 'json',
		processData : false,
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				var dataSource = response.data;
				preCallback();
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.alert("温馨提示：议价提交成功!");
				parent.layer.close(index);
			} else {
				parent.layer.alert("温馨提示："+response.message);
			}
		}
	})
}


function passMessage(callback) {
	preCallback = callback;
}

function NewDateT(str) {
	if (!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();

	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1], t[2], 0);
	return date;
}

//议价  modify by H
var saveAllNoBargain = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/saveNoBargain.do";//无需议价直接提交
var saveNoBargain = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/currentNoBargain.do";//无需议价直接提交
//全部不议价
$("#btnAll_submit").click(function () {
	parent.layer.confirm("确定所有供应商不议价？", {
		icon: 3,
		title: '询问'
	}, function (index) {
		$.ajax({
			type: "POST",
			url: saveAllNoBargain,
			data: {
				packageId: package_id,
				sfcBarginStatus: '4',
				auctionType: auctionType,
				auctionModel: type
			},
			dataType: 'json',
			error: function () {
				top.layer.alert("加载失败!");
			},
			success: function (response) {
				if (response.success) {
					preCallback();
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.alert("温馨提示：所有供应商不议价提交成功!");
					parent.layer.close(index);

				}
			}
		})
		parent.layer.close(index);

	});

});
//无需议价
$("#btnOne_submit").click(function () {
	parent.layer.confirm("确定该供应商不议价？", {
		icon: 3,
		title: '询问'
	}, function (index) {
		$.ajax({
			type: "POST",
			url: saveNoBargain,
			data: {
				packageId: package_id,
				supplierEnterpriseId: $("#supplier").val()
			},
			dataType: 'json',
			error: function () {
				top.layer.alert("加载失败!");
			},
			success: function (response) {
				if (response.success) {
					preCallback();
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.alert("温馨提示：该供应商不议价提交成功!");
					parent.layer.close(index);
					
				}
			}
		})
		parent.layer.close(index);

	});

});

//清单竞价按明细 查询可议价的所有供应商信息
var getSupplierBargainUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getMXAllSupplieres.do"; //查看附件
function getSupplierBargain(num){
	$.ajax({
		type: "POST",
		url: getSupplierBargainUrl,
		async:false,
		data: {
			packageId: package_id
		},
		dataType: 'json',
		error: function () {
			top.layer.alert("加载失败!");
		},
		success: function (response) {
			if (response.success) {
				if(num < response.data.length){
					$("#btnAll_submit").hide();
				}

			}
		}
	})
}