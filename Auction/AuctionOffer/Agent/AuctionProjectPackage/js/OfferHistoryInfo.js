
var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口


//竞价项目
var urlViewAuctionInfo = top.config.offerhost + '/info/detail';
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlHistoryInfo="Auction/Auction/Agent/AuctionProjectPackage/model/detailItemSupplier.html"
var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("packageId");
var type = getUrlParam("type");
var tType = getUrlParam("tType");
var biddingTimes=getUrlParam("biddingTimes");
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
var isAgent;//是否代理项目
var detailedId = "";
var offerData = "";
$(function() {
	getOfferInfo();
});

function getOfferInfo() {
	//getCheckList();
	$.ajax({
		url: urlViewAuctionInfo,
		data: {
			'packageId': packageId,			
			'biddingTimes':biddingTimes,
		},
		async: false,
		success: function(res) {
			if(res.success) {
				var data = res.data;
				offerData = data;
				$("td[id]").each(function() {
					$(this).html(data[this.id]);
					//竞价方式
					if(this.id == "biddingType") {
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
								$(this).html("不限轮次");
								break;
						}
					}
				});
				if(data.biddingType == 0 || data.biddingType == 1) { // 单轮或者自由
					if(data.packageModel) { //按照包件
						$("#offerRank").html("<table id='freePackageRank'></table>");
						$("#offerRecord").html("<table id='freePackageRecord'></table>");
						freePackageRank();
						freePackageRecord();
						//	$("#detail").bootstrapTable("load",)	
					} else { //按照明细
						$(".detail").hide();
						$("#offerRank").html("<div style='width:60%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 40%;float: left;'><table id='freeDetailRank'></table></div>");
						$("#offerRecord").html("<div style='width:60%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 40%;float: left;'><table id='freeDetailRecord'></table></div>");
						freeDetailRank();
						freeDetailRecord();
						freeDetailRK();
						freeDetailRD();
					}
				} else {
					//多轮
					$("#offerRank").html("<table id='roundRank'></table>");
					$("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
					roundRank();
					roundRecord();
					roundItem();
					//	$("#detail").bootstrapTable("load",)	
				}				
			}
		}
	});
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
			var ranks = offerData.results.filter(
				function(r){
					return r.packageDetailedId == row.id
				}
			)
			$("#freeDetailRank").bootstrapTable("load", ranks);
		},
		onPostBody: function() {
			$("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						if(offerData.results) {
							var ranks = offerData.results.filter(
								function(r){
									return r.packageDetailedId == row.id
								}
							)
							$("#freeDetailRank").bootstrapTable("load", ranks);
							detailedId = row.id;
						}
						return true;
					}
				}
			}, {
				field: 'name',
				title: '商品名称',
				align: 'left'
			}, {
				field: 'brand',
				title: '品牌要求',
				align: 'center'
			}, {
				field: 'version',
				title: '规格型号',
				align: 'center'
			}, {
				field: 'count',
				title: '数量',
				align: 'center'

			}, {
				field: 'unit',
				title: '单位',
				align: 'center'
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
			$("#freeDetailRecord").bootstrapTable("load", offerData.details[row.id] && offerData.details[row.id].offerItems || []);
		},
		onPostBody: function() {
			$("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						if(offerData.details[row.id] && offerData.details[row.id].offerItems) {
							$("#freeDetailRecord").bootstrapTable("load", offerData.details[row.id].offerItems);
						}
						return true;
					}
				}
			}, {
				field: 'code',
				title: '商品编号',
			}, {
				field: 'name',
				title: '商品名称',
			}, {
				field: 'brand',
				title: '品牌要求',
			}, {
				field: 'version',
				title: '规格型号',
			}, {
				field: 'count',
				title: '数量',
				align: 'center',
			}, {
				field: 'unit',
				title: '单位',
				align: 'center'
			}, {
				field: 'startPrice',
				title: '起始价',
				align: 'center',
				formatter: function(value, row, index){
					return (row.offerMode ? '竞高价':'竞低价') + '<span>'+(row.tempStartPrice || value||'-')+'</span>'
				}
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
				field: 'offerRank',
				width: '50px',
				align: 'center'
			}, {
				field: 'supplierName',
				title: '供应商',
				align: 'left'
			}, {
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					return  value?(Number(value).toFixed(2)) : "无报价";
				}
			}
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
				formatter: function(value, row, index) {
					return index + 1;
				}
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
				return  value?(Number(value).toFixed(2)) : "无报价";
			}

		}, {
			field: 'offerTime',
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
				align: 'left'

			},

			{
				field: 'offerMoney',
				title: '报价金额（元）',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					return  value?(Number(value).toFixed(2)) : "无报价";
				}
			},
			
		]
	})
	
	
	$("#freePackageRank").bootstrapTable("load", offerData.results);
	
	
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
			align: 'left'

		}, {
			field: 'offerMoney',
			title: '报价（元）',
			align: 'right',
			formatter: function(value, row, index) {
				return  value?(Number(value).toFixed(2)) : "无报价";
			}

		}, {
			field: 'offerTime',
			title: '报价时间',
			align: 'center'
		}]
	})
	$("#freePackageRecord").bootstrapTable("load", offerData.offerItems);
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
					return  value?(Number(value).toFixed(2)) : "无报价";
					
				}
			},
			
		]
	})
	$("#roundRank").bootstrapTable("load",offerData.results);
	
}

//多伦报价 报价轮次
function roundItem() {
	$("#roundItem").bootstrapTable({
		undefinedText: "",
		paganization: false,
		clickToSelect: true,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if(offerData.offerRounds[index] !== undefined && offerData.offerRounds[index] !== null && offerData.offerRounds[index] !== "") {
				$("#roundRecord").bootstrapTable("load", offerData.offerRounds[index].offerItems);
			}
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {

						$("#roundRecord").bootstrapTable("load", offerData.offerRounds[index].offerItems||[]);
						return true;
					}
				}
			},
			{
				title: '轮次',
				align: "center",
				formatter: function(value, row, index) {
					return "第" + sectionToChinese(index+1) + "轮报价";
				}
			}, {
				field: 'winPriceSupplierName',
				title: '最低价竞买人',
				align: "center",
				formatter: function(value, row, index) {
					return( value || "无报价人");
				}
			}, {
				field: 'winPrice',
				title: '最低价报价（元）',
				align: "right",
				formatter: function(value, row, index) {
					return  value?(Number(value).toFixed(2)) : "无报价";
				}
			}
		]
	})

	$("#roundItem").bootstrapTable("load", offerData.offerRounds);
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
				return  value?(Number(value).toFixed(2)) : "无报价";
			}
		}, {
			field: "offerTime",
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

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
})
