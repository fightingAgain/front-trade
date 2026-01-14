var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var searchUrl = config.AuctionHost +"/ProjectViewsController/findProjectCheckList.do";
//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlViewAuctionInfoNew = top.config.AuctionHost + '/AuctionQuoteController/detail.do';

var urlViewAuctionIntervalNew = top.config.AuctionHost + "/AuctionQuoteController/record.do";


//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";

var updateCheck = top.config.AuctionHost + '/AuctionSuperviseController/updateAuctionSuperviseAudit.do';

var url = window.location.search;
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var bussid = getUrlParam('id');
var type = getUrlParam('type');
var tType = getUrlParam("tType");
var tenderType = getUrlParam('tender');
//var projectId = url.getQueryString("projectId");
//var packageId = url.getQueryString("packageId");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];

var AuctioningDetailedId = ""; //明细的id

var detailedId = "";

var offerData = "";

var auctionType = ""; //竞卖方式
var RenameData = {};//投标人更名信息

$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	getOfferInfo();
	
	if(type == 'check'){
		$("#checkMeg").show();
	}
});

function getOfferInfo() {
	//getCheckList();
	$.ajax({
		url: urlViewAuctionInfoNew,
		data: {
			packageId: packageId,
			state: 1,
			tenderType: 2,
		},
		async: false,
		success: function(res) {
			if(res.success) {
				var data = res.data;
				offerData = data;
				auctionType = data.auctionType;
				$("td[id]").each(function() {
					$(this).html(data[this.id]);
					if(this.id == "auctionStartDate"){
						$(this).html( (new Date(data['startTime'])).Format("yyyy-MM-dd hh:mm:ss"));
					}
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
							default:
								break;
						}
					}
				});
				if(data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
					//					//					if(data.auctionModel == 0) { //按照包件
					//					$("#offerRank").html("<table id='freePackageRank'></table>");
					//					$("#offerRecord").html("<table id='freePackageRecord'></table>");
					//					freePackageRank();
					//					freePackageRecord();
					//					//明细记录
					//					//					} else { //按照明细
					$("#offerRank").html("<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRank'></table></div>");
					$("#offerRecord").html("<div style='width:50%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRecord'></table></div>");
					freeDetailRank();
					freeDetailRecord();
					freeDetailRK();
					freeDetailRD();
					//	}
				} else {
					//多轮
					$("#offerRank").html("<table id='roundRank'></table>");
					$("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
					roundRank();
					roundRecord();
					roundItem();
				}

				//				//竞价类型 	auctionModel：0为按包件，1为按明细
				//				if(data.auctionModel == undefined) {
				//					//报价记录：
				//					//1、自由竞价、单轮竞价中按包件
				//					//2、多轮竞价
				//					auctionOfferItems = data.auctionOfferItems;
				//					getAuctionOfferItem(0);
				//				}
				//
				//				//按包件
				//				if((data.auctionModel == 0) && (data.auctionType == 0 || data.auctionType == 1)) {
				//					auctionOfferItems = data.auctionOfferItems;
				//					getAuctionOfferItem1(1);
				//				}
				//
				//				//按明细
				//				if((data.auctionModel == 1) && (data.auctionType == 0 || data.auctionType == 1)) {
				//					auctionDetaileItems = data.auctionDetailed;
				//					getAuctionOfferItem1(2);
				//				}

				//是否需要业主代表确认及业主代表

				if(data.supervise && data.supervise.isSupervise == 1) {
					if(typeof(data.supervise.userName) != "undefined") {
						$("#employeeName").html(data.supervise.userName);
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
			if(offerData.packageDetails[index].offerItems !== undefined && offerData.packageDetails[index].offerItems !== null && offerData.packageDetails[index].offerItems !== "") {
				$("#freeDetailRank").bootstrapTable("load", offerData.packageDetails[index].offerItems);
				detailedId = row.id;
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
						$("#freeDetailRank").bootstrapTable("load", offerData.results);
						detailedId = row.id;
						// if(offerData.packageDetails[index].offerItems !== undefined && offerData.packageDetails[index].offerItems !== null && offerData.packageDetails[index].offerItems !== "") {
						// 	$("#freeDetailRank").bootstrapTable("load", offerData.results);
						// 	detailedId = row.id;
							
						// }

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
	$("#freeDetailRK").bootstrapTable("load", offerData.packageDetails);

}

function freeDetailRD() {
	$("#freeDetailRD").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			$("#freeDetailRecord").bootstrapTable("load", offerData.offerItems);
			// if(offerData.packageDetails[index].offerItems !== undefined && offerData.packageDetails[index].offerItems !== null && offerData.packageDetails[index].offerItems !== "") {
			// 	$("#freeDetailRecord").bootstrapTable("load", offerData.offerItems);
			// }
		},
		onPostBody: function() {
			$("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						$("#freeDetailRecord").bootstrapTable("load", offerData.offerItems);
						// if(offerData.packageDetails[index].offerItems !== undefined && offerData.packageDetails[index].offerItems !== null && offerData.packageDetails[index].offerItems !== "") {
						// 	$("#freeDetailRecord").bootstrapTable("load", offerData.packageDetails[index].offerItems);
						// }
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
	$("#freeDetailRD").bootstrapTable("load", offerData.packageDetails);
}

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
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				formatter: function(value, row, index) {
					if(value){
						return Number(value).toFixed(2);
					}else{
						return '-';
					}
				}
			},
			{
				field: 'lastMoney',
				title: '最终报价（元）',
				align: 'right',
				formatter: function(value, row, index) {
					if(row.offerMoney){
						if(row.isEliminated != undefined  && row.isEliminated == '1'){
							return "<span>"+Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
						}else{
							return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
						}
					}else{
						return '-'
					}
				}
			},{
				title: '修改原因',
				align: 'left',
				field: 'editReason',
			}
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
		}, {
			field: 'supplierName',
			title: '供应商',
			align: 'left',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierId, value, RenameData, 'body')
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
				field: 'supplierName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
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
				field: 'lastMoney',
				title: '最终报价（元）',
				align: 'right',
				width: "150",
				formatter: function(value, row, index) {
					if(row.isEliminated != undefined  && row.isEliminated == '1'){
						return "<span>"+Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
					}else{
						return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
					}
					
				}
			},{
				title: '修改原因',
				align: 'left',
				field: 'editReason',
				width:'120px'
			}
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
			field: 'supplierName',
			title: '供应商',
			align: 'left',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierId, value, RenameData, 'body')
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

	if(auctionType == 1) {
		$("#freePackageRecord").bootstrapTable("load", offerData.offerlogs);
	}
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
			{
				field: 'lastMoney',
				title: '最终报价（元）',
				align: 'right',
				width: "150",
				formatter: function(value, row, index) {
					if(row.isEliminated != undefined  && row.isEliminated == '1'){
						return "<span>"+Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
					}else{
						return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
					}
					
				}
			},{
				title: '修改原因',
				align: 'left',
				field: 'editReason',
				width:'120px'
			}
		]
	})
	$("#roundRank").bootstrapTable("load", offerData.results);
}

//多伦报价 报价轮次
function roundItem() {
	$("#roundItem").bootstrapTable({
		undefinedText: "",
		paganization: false,
		clickToSelect: true,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if(offerData.offerRounds[index].offerItems !== undefined && offerData.offerRounds[index].offerItems !== null && offerData.offerRounds[index].offerItems !== "") {
				$("#roundRecord").bootstrapTable("load", offerData.offerRounds[index].offerItems);
			}
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						$("#roundRecord").bootstrapTable("load", offerData.offerRounds[index].offerItems);
						return true;
					}
				}
			},
			{
				title: '序号',
				align: "center",
				formatter: function(value, row, index) {
					switch(index) {
						case 0:
							return "第一轮报价";
							break;
						case 1:
							return "第二轮报价";
							break;
						case 2:
							return "第三轮报价";
							break;
					}
				}
			}, {
				field: 'winPriceSupplierName',
				title: '最高价竞买人',
				align: "center",
				formatter: function(value, row, index) {
					return( value || "无报价人");
				}
			}, {
				field: 'winPrice',
				title: '最高价报价（元）',
				align: "right",
				formatter: function(value, row, index) {
					return  value? (Number(value).toFixed(2)): "暂无最高报价";
				}
			}
		]
	})

	$("#roundItem").bootstrapTable("load", offerData.offerRounds);
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
			field: "supplierName",
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
				switch(value) {
					case 1:
						return "第一轮";
						break;
					case 2:
						return "第二轮";
						break;
					case 3:
						return "第三轮";
						break;
				}
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




$("#btn_close").click(function() {
	top.layer.closeAll();
})

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$("#btnSave").click(function(){
	var checkResult = $("input:radio[name=checkResult]:checked").val(); //审核结果，0为通过,1为未通过
	var checkContent = $("#checkContent").val(); //审核意见
	
	if(checkResult == "1" && checkContent == "") {
		parent.layer.msg("请输入审核意见！");
		return;
	}
	
	if(checkContent.length > 200) {
		parent.layer.msg("审核意见不能超过200个字！");
		return;
	}
	
	//保存审核信息
	$.ajax({
		type: "post",
		url: updateCheck,
		async: true,
		data: {
			'id': bussid,
			'checkResult' : checkResult,
			'checkContent' : checkContent,
			'projectId':projectId,
			'packageId':packageId
		},
		datatype: 'json',
		success: function(data) {
			if(data.success) {
				parent.$('#ProjectAuditTable').bootstrapTable('refresh');				
				parent.layer.alert("提交竞价审核情况成功!");
				parent.layer.close(parent.layer.getFrameIndex(window.name));
			}else{
				parent.layer.alert(data.message);
				return;
			}
		}
	});
}) 
	

//取消按钮
$("#btnCancel").click(function(){
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});