var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';

//竞卖项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlViewAuctionInfoNew = top.config.AuctionHost + "/AuctionQuoteController/detail.do";
 


var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞卖文件地址
var urlHistoryInfo="Auction/Sale/Agent/SaleProjectPackage/model/detailItemSupplier.html"
var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("id");
var createType = getUrlParam("createType") || 0;
var type = getUrlParam("type");
var quotationUnit=getUrlParamCodeURI("quotationUnit");
var tType = getUrlParam("tType");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];
var tenderType='2'
var AuctioningDetailedId = ""; //明细的id

var detailedId = "";

var offerData = ""; // 数据

var auctionType = ""; //竞卖方式
var status; //业主代表审核状态
var itemState = "";
var isAgent;//是否代理项目
var RenameData = {};//投标人更名信息
$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
//	if(tType != null){
//		var result = JSON.parse(sessionStorage.getItem("auctionresult"));
//		getMsg(result);
//	}
	getOfferInfo()
	//竞卖文件提交信息列表
	getOfferFileInfo(projectId);
	
//	setPurchaseFileDownloadDetail(packageId);
	buyFileDetail(packageId, true); //购买文件记录
	warnLists(packageId, 'jm', true, true,null,projectId,'2','1');
	detailItem();
	
	if(createType == 1){	
		$(".modify").hide();
		$('.zzbj').attr('readonly',true);
		//$("#detailItemSupplier").hide();
		$("#againDetailItemSupplier").hide();
		$(".chooseSuppler").hide();
		$("#commitBtn").hide();
	}
});
function passMessage(data){
	quotationUnit = data.quotationUnit;
	
};
function getMsg(obj){
	if(offerData.isStopCheck == 1){
		$("#commitBtn").hide();
	}else{
		if(type == 'commit') {
			//展示提交按钮
			$("#commitBtn").show();
		}
		status = obj.checkStatus;
		if(status == '未提交'){
			$("#commitBtn").show();
		}
	}
	if(status == '已提交审核' || status == '审核通过'){
		
		$(".modify").hide();
		$('.zzbj').attr('readonly',true);
	}
	
	
	if(obj.itemState != undefined){
		itemState = obj.itemState;
		if(obj.itemState == '1' || obj.itemState == '2' || obj.itemState == '4' || obj.itemState == '3'){
			//发布公示  未审核  通过  无需审核
			
			$('.zzbj').attr('readonly',true);
			$("#commitBtn").hide();
		}
	}	
	
	
}
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
				quotationUnit = data.quotationUnit;
				auctionType = data.auctionType;
				getMsg(data);
				if(offerData.offerEndDate){
					$('.offerEndDate').html('本次竞卖于【'+offerData.offerEndDate+'】终止').addClass('offerEndDateBox');
				}else{
					$('.offerEndDate').removeClass('offerEndDateBox');
				}
				$("td[id]").each(function() {
					$(this).html(data[this.id]);

					//竞卖方式
					if(this.id == "auctionType") {
						switch(data[this.id]) {
							case 0:
								$(this).html("自由竞卖");
								break;
							case 1:
								$(this).html("单轮竞卖");
								break;
							case 2:
								$(this).html("多轮竞卖 2轮竞卖");
								break;
							case 3:
								$(this).html("多轮竞卖 3轮竞卖");
								break;
							default:
								break;
						}
					}

					if(this.id == "startTime") {
						$(this).html((new Date(data[this.id])).Format("yyyy-MM-dd hh:mm:ss"));	
					}

					if (this.id == 'projectName') {
						if (data.projectSource > 0) {
							$(this).html(data[this.id] + '<span class="red">(重新竞卖)</span>');
						}
					}
				});
				//判断是否发布结果通知书0为未发布
				if(offerData.isSendResult==0 && offerData.isStopCheck != 1){
					if(offerData.isRecItemFile==0){
						$("#detailItemSupplier").show();
					}else{
						$("#againDetailItemSupplier").show();
					}	
				}
				if(data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
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
				//是否需要业主代表确认及业主代表

				if(data.supervise && data.supervise.isSupervise == 1) {
					if(typeof(data.supervise.userName) != "undefined") {
						$("#employeeName").html(data.supervise.userName);
						if(offerData.isStopCheck == 1){
							$('#commitBtn').hide();
						}else{
							$('#commitBtn').show();
						}
						$("#checkMes").show();
						$("#checkPerson").show();
						getCheckList();
					} else {
						$("#employeeName").html("未设置");
					}
				} else {
					$("#employeeName").html("无需业主代表");
				}
				
				//是否显示最高报价
				if(data.auctionType > 0){
					$(".isShowPrice").css("display","table-row");
					$("#isShowPrice").html(data.isShowPrice == 1 ? "否":"是");
				} else {
					$(".isShowPrice").css("display","none");
				}
			}
		}
	});
}

//导出报价历史记录
function exportExcel(){
	var offerlogs = offerData.offerItems||'';
	var details = offerData.details||'';
	if(offerlogs.length>0 || details.length>0){
		var url = config.AuctionHost + "/OfferController/outOfferHisByExcel.do"+"?packageId="+packageId+"&tenderType=2";
		window.location.href =$.parserUrlForToken(url);	
	}else{
		top.layer.alert("温馨提示：报价记录不存在");
	}
}

function detailItem() {
	$("#detailItem").bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:config.AuctionHost+'/AuctionOfferController/findItemFileSuppliers.do', // 请求url
		//data:Json,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		queryParams: function(){
			return {
				'packageId':packageId,
				'isSubmitItemFile':1
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
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
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
				events:{
					'click .download':function(e,value, row, index){
						var newUrl = urlDownloadAuctionFile + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
						window.location.href = $.parserUrlForToken(newUrl);
					},
					'click .rebut':function(e,value, row, index){
						top.layer.confirm("温馨提示:确定驳回该分项报价表吗?", function(indexs) {
							parent.layer.close(indexs);
							parent.layer.prompt({
								title: '请输入驳回理由',
								value: '',
								formType: 2,
								yes: function(ind, layero){
									var value = layero.find(".layui-layer-input").val();
									$.ajax({
										type: "get",
										url: config.AuctionHost+'/AuctionItemFileController/rejectAuctionItemFile.do',
										async: false,
										dataType: 'json',
										data: {
											'id':row.id,
											'reason':value,			
										},
										success: function(data) {			
											if(data.success==true){
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
					if( row.filePath){
						var btn ='<a class="btn-sm btn-primary download" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>下载</a>'
						if(offerData.isSendResult==0){
							btn +='<a class="btn-sm btn-warning rebut" href="javascript:void(0)" style="text-decoration:none;margin-right:5px"><span class="glyphicon glyphicon-share" aria-hidden="true"></span>驳回</a>'	
						}
						return btn
					}	
				}

			}
		]
	})
}
$(".chooseSuppler").on('click',function(){
	// if(!offerData.rankItems){
	// 	parent.layer.alert("无供应商报价")
	// 	return
	// }
	top.layer.open({
		type: 2,
		title: '选择供应商',
		area: [ '800px',  '500px'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: urlHistoryInfo + '?projectId=' + projectId + '&packageId=' + packageId + '&type=' + 'commit',
		
	});
})
function freeDetailRK() {
	$("#freeDetailRK").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if(offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
				$("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
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
						if(offerData.results !== undefined && offerData.results !== null && offerData.results !== "") {
							$("#freeDetailRank").bootstrapTable("load", offerData.results);
							detailedId = row.id;
							if(status == '已提交审核' || status == '审核通过'){								
								$('.zzbj').attr('readonly',true);
							}
							
							if(itemState == '1' || itemState == '2' || itemState == '4' || itemState == '3'){								
								$('.zzbj').attr('readonly',true);
							}
							
							if(isAgent){
								if(isAgent == '1'){
									$(".modify").hide();
									$('.zzbj').attr('readonly',true);
								}
							}
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
	$("#freeDetailRK").bootstrapTable("load", offerData.packageDetails);

}

function freeDetailRD() {
	$("#freeDetailRD").bootstrapTable({
		undefinedText: "",
		paganization: false,
		onCheck: function(row, ele) {
			var index = $(ele).parents("tr").index();
			if(offerData.offerItems !== undefined && offerData.offerItems !== null && offerData.offerItems !== "") {
				$("#freeDetailRecord").bootstrapTable("load", offerData.offerItems);
			}
		},
		onPostBody: function() {
			$("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						if(offerData.offerItems !== undefined && offerData.offerItems !== null && offerData.offerItems !== "") {
							$("#freeDetailRecord").bootstrapTable("load", offerData.offerItems);
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
					if(isReminderCollection(row.supplierCode)){
						return '<span class="glyphicon glyphicon-exclamation-sign" style="color: #ccbb09;margin-right: 5px"></span>' + showBidderRenameList(row.supplierId, value, RenameData, 'body');
					}else{
						return showBidderRenameList(row.supplierId, value, RenameData, 'body');
					}
				}
			},
			{
				field: 'offerMoney',
				title: '报价金额（'+(quotationUnit?quotationUnit:'元')+'）',
				align: 'right',
				width: "150",
				formatter: function(value, row, index) {
					if(value){
						return Number(value).toFixed(2);
					}else{
						return '-';
					}
				}
			},
			{
				field: 'tt',
				title: '是否淘汰',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					if(row.isEliminated != undefined  && row.isEliminated == '1'){
						return "<span style='color:red;'>已淘汰</span>";
					}else{
						return "<span style='color:greed;'>未淘汰</span>";
					}
				}
			},
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
			title: '报价（'+(quotationUnit?quotationUnit:'元')+'）',
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
				field: 'enterpriseName',
				title: '供应商',
				align: 'left',
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}

			},

			{
				field: 'offerMoney',
				title: '报价金额（'+(quotationUnit?quotationUnit:'元')+'）',
				align: 'right',
				width: "150",
				formatter: function(value, row, index) {
					if(value){
						return Number(value).toFixed(2);
					}else{
						return '-';
					}
				}
			},
			{
				field: 'tt',
				title: '是否淘汰',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					if(row.isEliminated != undefined  && row.isEliminated == '1'){
						return "<span style='color:red;'>已淘汰</span>";
					}else{
						return "<span style='color:greed;'>未淘汰</span>";
					}
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
			align: 'left',
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierId, value, RenameData, 'body')
			}

		}, {
			field: 'offerMoney',
			title: '报价（'+(quotationUnit?quotationUnit:'元')+'）',
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
				align: 'left',
				formatter:function(value, row, index){	
					if(isReminderCollection(row.supplierCode)){
						return '<span class="glyphicon glyphicon-exclamation-sign" style="color: #ccbb09;margin-right: 5px"></span>' + showBidderRenameList(row.supplierId, value, RenameData, 'body');
					}else{
						return showBidderRenameList(row.supplierId, value, RenameData, 'body');
					}
				}

			},
			{
				field: 'offerMoney',
				title: '报价金额（'+(quotationUnit?quotationUnit:'元')+'）',
				align: 'right',
				width: "150",
				formatter: function(value, row, index) {
					if(value){
						return Number(value).toFixed(2);
					}else{
						return '-';
					}
				}
			},
			{
				field: 'tt',
				title: '是否淘汰',
				align: 'right',
				width: "120",
				formatter: function(value, row, index) {
					if(row.isEliminated != undefined  && row.isEliminated == '1'){
						return "<span style='color:red;'>已淘汰</span>";
					}else{
						return "<span style='color:greed;'>未淘汰</span>";
					}
				}
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
				title: '最高价报价（'+(quotationUnit?quotationUnit:'元')+'）',
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
			title: "竞卖人",
			formatter:function(value, row, index){					
				return showBidderRenameList(row.supplierId, value, RenameData, 'body')
			}
		}, {
			field: "offerMoney",
			title: "报价（"+(quotationUnit?quotationUnit:"元")+"）",
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

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function getUrlParamCodeURI(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return decodeURI(r[2]);
	return null; // 返回参数值  
}
function commitMsg() {
	top.layer.confirm('你确定提交吗？', {
		btn: ['确定', '取消'] //按钮
	}, function() {
		var sup = {
			projectId: projectId,
			packageId: packageId,
			checkState: '2' //已提交
		}

		$.ajax({
			type: "post",
			url: urlSaveSupervise,
			data: sup,
			async: false,
			dataType: "json",
			success: function(ret) {
				if(ret.success) {
					parent.$('#OfferList').bootstrapTable('refresh');
//					top.layer.closeAll();
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
					top.layer.alert("提交竞卖情况成功")
				} else {
					parent.layer.alert("提交竞卖情况失败！");
					return;
				}
			}
		});
	})
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
			projectId: projectId,
			'stage':'submit'
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
				align: "left",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				halign: "center",
				title: "竞卖文件",
				cellStyle: {
					css: {
						"padding": "0px"
					}
				},
				formatter: function(value, row, index) {
					if( row.fileName){
						var fileNameArr = row.fileName.split(","); //文件名数组
						var filePathArr = row.filePath.split(",");
						var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
						var html = "<table class='table' style='border-bottom:none'>";
						for(var j = 0; j < filePathArr.length; j++) {
							html += "<tr>";
							html += "<td>" + fileNameArr[j] + "</td>"
							html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
							if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
								html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
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


//挂载采购文件下载记录请求
function setPurchaseFileDownloadDetail(uid) {
	//console.log(uid)
	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data:{
			"packageId":uid
		},
		async: false,
		success: function(result) {
			if(result.success) {
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
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
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "企业名称",
				align: "left",
				field: "enterprise.enterpriseName",
				formatter:function(value, row, index){
					if(isReminderCollection(row.enterprise.enterpriseCode)){
						return '<span class="glyphicon glyphicon-exclamation-sign" style="color: #ccbb09;margin-right: 5px"></span>' + showBidderRenameList(row.enterpriseId, value, RenameData, 'body');
					}else{
						return showBidderRenameList(row.enterpriseId, value, RenameData, 'body');
					}
				}
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
			}, {
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
			},
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