WORKFLOWTYPE = "xmgg"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
//查看包间信息
var urlfindPurchase = top.config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do';
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var packagePrice = []; //费用信息
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var purchaseaData = ""; //项目的数据的参数
var projectSupplements = [];
var tabeldata = []; //物资信息
var filesData=[];//附件信息数据
//初始化
$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核内容
	}
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);
	//包件信息
	Purchase(id);
	//费用信息
	getProjectPrice(id);
})

function getProjectPrice(projectId) {
	$.ajax({
		url: pricelist,
		type: 'get',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": projectId,
		},
		success: function(data) {
			packagePrice = data.data;
			if(packagePrice.length > 0) {
				for(var i = 0; i < packagePrice.length; i++) {
					if(packagePrice[i].priceName == '项目保证金') {
						if(packagePrice[i].payMethod == 0) {
							$('.DepositPriceShow').hide();
							$("#payMethod").html('虚拟子账号');
						} else {
							$('.DepositPriceShow').show();
							$("#payMethod").html('指定账号');
							if(packagePrice[i].agentType == 0) {
								$("#agentType").html("平台")
							}
							if(packagePrice[i].agentType == 1) {
								$("#agentType").html("代理机构")
							}
							if(packagePrice[i].agentType == 2) {
								$("#agentType").html("采购人")
							}
							$("#bankAccount").html(packagePrice[i].bankAccount);
							$("#bankName").html(packagePrice[i].bankName);
							$("#bankNumber").html(packagePrice[i].bankNumber);
						}
						$("#price1").html(packagePrice[i].price);
					}
					if(packagePrice[i].priceName == '竞价采购文件费') {
						$("#price2").html(packagePrice[i].price);
					}
				}
			}

		}
	});
}

//包件信息
function Purchase(data) {
	$.ajax({
		url: urlfindPurchase,
		type: 'get',
		async: false,
		data: {
			'projectId': data
		},
		success: function(result) {
			if(result.success) {
				purchaseaData = result.data //获取的数据
				if(purchaseaData.purFile.length>0){
		   			filesData=purchaseaData.purFile;
		   		}
				filesDataView();
				tabeldata = purchaseaData.materialDetails;
				initDataTab(tabeldata);
				if(purchaseaData.projectSupplement.length > 0) { //存在补遗		
					for(var i = 0; i < purchaseaData.projectSupplement.length; i++) {
						if(purchaseaData.projectSupplement[i].checkState == 2) { //审核通过
							projectSupplements.push(purchaseaData.projectSupplement[i]);
						}
					}
				}
			}

		},
		error: function(data) {

		}
	});

	Supplement();
	$('div[id]').each(function() {
		$(this).html(purchaseaData[this.id]);
		if(reg.test(purchaseaData[this.id])) {
			$(this).html(purchaseaData[this.id].substring(0, 16));
		}

	});
	//渲染项目的数据
	$('div[id]').each(function() {
		$(this).html(purchaseaData.project[0][this.id]);
		if(reg.test(purchaseaData.project[0][this.id])) {
			$(this).html(purchaseaData.project[0][this.id].substring(0, 16));
		}
	});
	//包件的信息渲染
	$('div[id]').each(function() {
		$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
	});
	//设备信息的数据渲染
	$('div[id]').each(function() {
		if(purchaseaData.auctionPackageDetailed.length >0){
			$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
		}
		
	});
	if(projectSupplements.length > 0) {
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}
		});
	}
	if(purchaseaData.autionProjectPackage[0].isPayDeposit == 0) {
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();
	} else {
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();
	}
	// if(purchaseaData.autionProjectPackage[0].isSellFile == 0) {
	// 	$("#isSellFile").html("需要缴纳");
	// 	$(".isSellShow").show();
	// 	$('.isSellCols').attr('colspan', '1')
	// } else {
	// 	$("#isSellFile").html("不需要缴纳")
	// 	$(".isSellShow").hide();
	// 	$('.isSellCols').attr('colspan', '3');
	// }
	//当为单轮竞卖的时候隐藏显示，
	if(purchaseaData.autionProjectPackage[0].auctionType == 1) {
		$("#timeLimits").hide();
	} else {
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
	}
	//当为0，1时不显示邀请供应商列表
	if(purchaseaData.isPublic > 1) {
		$('.publicTable').show();
		Public(purchaseaData.projectId)
	} else {
		$('.publicTable').hide()
	}
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile == 0) {
		$('.isFileDate').show()
	} else {
		$('.isFileDate').hide()
	};
	if(purchaseaData.autionProjectPackage[0].auctionType == 2 && purchaseaData.autionProjectPackage[0].outType == 1) {
		$(".third").hide();
		$(".thirds").hide();
		$(".Supplier").hide();
	} else if(purchaseaData.autionProjectPackage[0].auctionType == 2 && purchaseaData.autionProjectPackage[0].outType == 0) {
		$(".Supplier").show();
		$(".third").hide();
		$(".thirds").hide();
	} else if(purchaseaData.autionProjectPackage[0].auctionType == 3 && purchaseaData.autionProjectPackage[0].outType == 1) {
		$(".Supplier").hide();
		$(".thirds").show();
	} else if(purchaseaData.autionProjectPackage[0].auctionType == 3 && purchaseaData.autionProjectPackage[0].outType == 0) {
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}
    if(purchaseaData.autionProjectPackage[0].taxIncluded == "0") {
		$("#taxIncluded").html("含税");
		$('.tsxstyle').show();
	} else {
		$("#taxIncluded").html("不含税");
		$('.tsxstyle').hide();
	}
	if(purchaseaData.autionProjectPackage[0].materialRelationship == "0") {
		$("#materialRelationship").html("是");
	} else {
		$("#materialRelationship").html("否");
	}
}
//附件信息
function filesDataView(){
	if(filesData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'100px',

			},			
			{
				field: "#",
				title: "操作",
				halign: "center",
				width:'100px',
				align: "center",
				events:{
					'click .openAccessory':function(e,value, row, index){
						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					    window.location.href =$.parserUrlForToken(url) ;
					}
				},
				formatter:function(value, row, index){				
					return '<button type="button" class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
}
//当有邀请供应商的时候显示邀请供应商的列表
function Public(RenameBisnisId) {
	if(purchaseaData.projectSupplier.length > 7) {
		var height = "304"
	} else {
		var height = ""
	}
	if(purchaseaData.projectSupplier.length>0){
		var RenameData = getBidderRenameData(RenameBisnisId);//投标人更名信息
	}
	$("#tableList").bootstrapTable({
		data: purchaseaData.projectSupplier,
		undefinedText: "",
		pagination: false,
		columns: [{
				field: 'enterprise.enterpriseName',
				halign: "center",
				align: "center",
				title: '企业名称',
				formatter:function(value, row, index){									
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			}, {
				field: 'enterprise.enterprisePerson',
				halign: "center",
				align: "center",
				title: '联系人'
			}, {
				field: 'enterprise.enterprisePersonTel',
				halign: "center",
				align: "center",
				title: '联系电话'
			},
			{
				field: 'enterprise.enterpriseLevelText',
				halign: "center",
				align: "center",
				title: '认证状态'
			}, {
				field: 'enterprise.isAcceptText',
				halign: "center",
				align: "center",
				title: '确认状态',
				formatter: function(value, row, index) {
					if(value == '拒绝') {
						return '<div class="text-danger">拒绝</div>';
					} else if(value == '接受') {
						return '<div class="text-success">接受</div>';
					} else {
						return "未确认";
					}
				}
			}, {
				title: '操作',
				halign: "center",
				align: "center",
				formatter: function(value, row, index) {
					return '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick="viewSupplier(' + index + ')">查看</a>'
				}
			}
		]
	})
}

function viewSupplier(i) {
	parent.layer.open({
		type: 2, //此处以iframe举例
		title: '查看',
		area: ['650px', '400px'],
		maxmin: false,
		resize: false,
		content: "Auction/common/Agent/Purchase/model/viewSupplier.html",
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow; //获取包件弹出框整个对象
			iframeWind.du(purchaseaData.projectSupplier[i]) //弹出框弹出时初始化     	
		}
	});
}

function initDataTab(tabeldata) {
	$("#materialList").bootstrapTable({
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter: function(value, row, index) {
				var pageSize = $('#materialList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#materialList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'productCode',
			title: '物料编码',
			align: 'left',
		}, {
			field: 'detailedName',
			title: '物料名称',
			align: 'left',
		}, {
			field: 'detailedUnit',
			title: '计量单位',
			align: 'left',
			width: '100',
			formatter: function(value, row, index) {
				if(row.detailedUnit == "" || row.detailedUnit == undefined) {
					return '<div>个</div>'
				} else {
					return '<div>' + row.detailedUnit + '</div>'
				}
			}
		}, {
			field: 'detailedVersion',
			title: '规格型号',
			align: 'center',
			width: '120',
		}, {
			field: 'priceType',
			title: '底价顶价标识',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.priceType == 1) {
					return '<div>底价</div>'
				} else if(row.priceType == 0) {
					return '<div>顶价</div>'
				}
			}
		}, {
			field: 'salesPrice',
			title: '竞卖起始价(元)',
			align: 'center',
			width: '120',
		}, {
			field: 'servicePrice',
			title: '服务费(元)',
			align: 'center',
			width: '120',
		}, {
			field: 'storageLocation',
			title: '存放地点',
			align: 'center',
			width: '120',
		}]
	});
	$("#materialList").bootstrapTable("load", tabeldata);
}