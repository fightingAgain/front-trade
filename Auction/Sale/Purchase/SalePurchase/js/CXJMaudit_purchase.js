var purchaseaData = ""; //项目的数据的参数
var filesData = []; //附件信息数据
var findPurchaseUrl = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var addsupplier = 'Auction/Sale/Agent/SalePurchase/model/add_supplier.html' //邀请供应商的弹出框路径
var packagePrice = []; //费用信息
var tabeldata = []; //物资信息
var WORKFLOWTYPE = "xmgg";
var projectSupplements = []; //最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData = [];
var projectId = $.getUrlParam('projectId')
//初始化
$(function() {
	Purchase();
	$("#browserUrl").attr('href', siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSite);
	$("#webTitle").html(siteInfo.sysTitle);
	//代理机构编辑所属部门
	$("#agencyDepartment").department({
		parameter: {
			projectId: projectId,
			departmentIDOld: purchaseaData.agencyDepartmentId,
			departmentNameOld: purchaseaData.agencyDepartmentName,
		}, //接口调用的基本参数
		roleType: 1, //1代理机构，2采购人
		statusId: top.enterpriseId, //身份id，
		inputName: 'agencyDepartmentName', //数据回显的id
		tenderType: 2, //0是询比，1是竞价，2是竞卖，4是招标，6是单一来源   
	})
	//采购人编辑所属部门
	$("#purchaserDepartment").department({
		parameter: {
			projectId: projectId,
			departmentIDOld: purchaseaData.purchaserDepartmentId,
			departmentNameOld: purchaseaData.purchaserDepartmentName,
		}, //接口调用的基本参数
		roleType: 2, //1代理机构，2采购人
		isMust: false, //是否为必选
		statusId: purchaseaData.purchaserId, //身份id，
		inputName: 'purchaserDepartmentName', //数据回显的id
		tenderType: 2, //0是询比，1是竞价，2是竞卖，4是招标，6是单一来源   
	})
});

function Purchase() {
	findWorkflowCheckerAndAccp(projectId);
	$.ajax({
		url: findPurchaseUrl,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'projectId': projectId
		},
		success: function(data) {
			if(data.success) {
				purchaseaData = data.data //获取的数据	
				if(purchaseaData.purFile.length > 0) {
					filesData = purchaseaData.purFile;
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
	//渲染公告的数据
	for(key in purchaseaData) {
		$('#' + key).html(purchaseaData[key]);
		if(reg.test(purchaseaData[key])) {
			$('#' + key).html(purchaseaData[key].substring(0, 16));
		}
	}
	//渲染项目的数据
	for(key in purchaseaData.project[0]) {
		$('#' + key).html(purchaseaData.project[0][key]);
		if(reg.test(purchaseaData.project[0][key])) {
			$('#' + key).html(purchaseaData.project[0][key].substring(0, 16));
		}
	}
	$("#provinceName").html(purchaseaData.project[0].provinceName || '湖北省');
	$("#cityName").html(purchaseaData.project[0].cityName || '襄阳市');
	$("#agencyDepartmentName").html(purchaseaData.agencyDepartmentName || "无所属部门")
	$("#purchaserDepartmentName").html(purchaseaData.purchaserDepartmentName || "无所属部门");
	if(purchaseaData.project[0].isAgent == 0) {
		$('.agency').hide()
	} else {
		$('.agency').show()
	}
	if(purchaseaData.project[0].projectType == 0) {
		$('.engineering').show()
	} else {
		$('.engineering').hide()
	}
	if(projectSupplements.length > 0) {
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])) {
				$(this).html(projectSupplements[0][this.id].substring(0, 16));
			}
		});
	}
	$('#StartDate').html($("#noticeStartDate").html())
	$('#endDate').html($("#noticeEndDate").html())
	if(purchaseaData.autionProjectPackage.length > 0) {
		//包件的信息渲染
		$('div[id]').each(function() {
			$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
		});
		//当为单轮竞卖的时候隐藏显示，
		if(purchaseaData.autionProjectPackage[0].auctionType == 1) {
			$("#timeLimits").hide();
		}

		//当为0，1时不显示邀请供应商列表
		if(purchaseaData.isPublic > 1) {
			$('.publicTable').show();
			Publics()
		} else {
			$('.publicTable').hide()
		}
		//是否竞卖文件递交0为是1为否
		if(purchaseaData.isFile == 0) {
			$('.isFileDate').show()
		} else {
			$('.isFileDate').hide()
		};
		if(purchaseaData.autionProjectPackage[0].isPayDeposit == 0) {
			$("#isPayDeposit").html("需要缴纳");
			$('.isDepositShow').show();
		} else {
			$("#isPayDeposit").html("不需要缴纳");
			$('.isDepositShow').hide();
		}
		if(purchaseaData.autionProjectPackage[0].isSellFile == 0) {
			$("#isSellFile").html("需要缴纳");
			$(".isSellShow").show();
			$('.isSellCols').attr('colspan', '1')
		} else {
			$("#isSellFile").html("不需要缴纳")
			$(".isSellShow").hide();
			$('.isSellCols').attr('colspan', '3');
		}
		if(purchaseaData.autionProjectPackage[0].taxIncluded == 0) {
			$("#taxIncluded").html("含税");
			$('.tsxstyle').show();
		} else {
			$("#taxIncluded").html("不含税");
			$('.tsxstyle').hide();
		}
		if(purchaseaData.autionProjectPackage[0].materialRelationship == 0) {
			$("#materialRelationship").html("是");
		} else {
			$("#taxIncluded").html("否");
		}
	}
	if(purchaseaData.auctionPackageDetailed.length > 0) {
		//设备信息的数据渲染
		$('div[id]').each(function() {
			$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
		});
	};
	getProjectPrice(); //费用信息		
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
				width:'50px',
				align: "center",
				events:{
					'click .openAccessory':function(e,value, row, index){
						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					    window.location.href =$.parserUrlForToken(url) ;
					}
				},
				formatter:function(value, row, index){				
					return '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
}
//邀请供应商
function add_supplier() {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法追加供应商');
		return;
	};
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '追加邀请供应商',
		area: ['1100px', '600px'],
		content: addsupplier,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.du(purchaseaData.isPublic, projectId, purchaseaData.purchaserId, purchaseaData.supplierClassifyCode, 'true');
		}
	});
}
//当有邀请供应商的时候显示邀请供应商的列表
function Publics() {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) > NewDate(PublicnowDate)) {
		$(".addSupplier").show();
		$(".sendMsg").show();
	};
	var Publicid = [];
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + "/ProjectSupplierController/findProjectSupplierList.do",
		async: false,
		data: {
			'projectId': projectId,
			'tenderType': 2
		},
		success: function(resx) {
			if(resx.success) {
				publicData = resx.data
				for(var i = 0; i < publicData.length; i++) {
					Publicid.push(publicData[i].supplierId);
				};
				sessionStorage.setItem('keysjd', JSON.stringify(Publicid)); //邀请供应商的id缓存    				
			}
		}
	});
	if(publicData.length > 7) {
		var height = "304"
	} else {
		var height = ""
	}
	var RenameData = getBidderRenameData(projectId);//投标人更名信息
	$('#tableList').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height: height,
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
				field: "enterprise.enterpriseName",
				title: "企业名称",
				align: "left",
				halign: "left",
				formatter: function(value, row, index) {
					if(row.isAppend == 1) {
						var isAccept = "<div>" + showBidderRenameList(row.supplierId, value, RenameData, 'body',1) + "<span class='text-danger'>(追加)</span></div>"
					} else {
						var isAccept = "<div>" + showBidderRenameList(row.supplierId, value, RenameData, 'body') + "</div>"
					}
					return isAccept
				}
			},
			{
				field: "enterprise.enterprisePerson",
				title: "联系人",
				halign: "center",
				align: "center",
				width: "120px",
			}, {
				field: "enterprise.enterprisePersonTel",
				title: "联系电话",
				halign: "center",
				width: '100px',
				align: "center",
			}, {
				field: "enterprise.enterpriseLevel",
				title: "认证状态",
				halign: "center",
				width: '100px',
				align: "center",
				formatter: function(value, row, index) {
					if(row.enterprise.enterpriseLevel == 0) {
						var enterpriseLevel = "未认证"
					};
					if(row.enterprise.enterpriseLevel == 1) {
						var enterpriseLevel = "提交认证"
					};
					if(row.enterprise.enterpriseLevel == 2) {
						var enterpriseLevel = "受理认证"
					};
					if(row.enterprise.enterpriseLevel == 3) {
						var enterpriseLevel = "已认证"
					};
					if(row.enterprise.enterpriseLevel == 4) {
						var enterpriseLevel = "已认证"
					};
					return enterpriseLevel
				}
			}, {
				field: "isAccept",
				title: "确认状态",
				halign: "center",
				width: '100px',
				align: "center",
				formatter: function(value, row, index) {
					if(value == 0) {
						var isAccept = "<div class='text-success' style='font-weight:bold'>接受</div>"
					} else if(value == 1) {
						var isAccept = "<div class='text-danger' style='font-weight:bold'>拒绝</div>"
					} else {
						var isAccept = "未确认"
					}
					return isAccept
				}
			}, {
				field: "cz",
				title: "操作",
				halign: "center",
				align: "center",
				width: '120px',
				formatter: function(value, row, index) {
					var Tdr = '<div class="btn-group">'
					Tdr += '<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier(' + index + ')">查看</a>'
					if(row.isAccept != 0 && row.isAccept != 1) {
						if(NewDate(purchaseaData.noticeEndDate) > NewDate(PublicnowDate)) {
							Tdr += '<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=supplierDelet(\"' + row.id + '\","' + index + '")>删除</a>'
						};
					}
					Tdr += '</div>'
					return Tdr
				}
			}
		]
	});

	$('#tableList').bootstrapTable("load", publicData); //重载数据
};
//删除供应商
function supplierDelet(uid) {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法删除');
		return;
	};
	parent.layer.confirm('确定要删除该供应商', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			type: "get",
			url: top.config.AuctionHost + "/ProjectSupplierController/deleteProjectSupplier.do",
			async: false,
			data: {
				'id': uid
			},
			success: function(res) {
				if(res.success) {
					Publics();
					parent.layer.close(index);
				} else {
					parent.layer.alert(res.message);
					parent.layer.close(index);
				}
			}
		});
	}, function(index) {
		parent.layer.close(index)
	});
};
//查看邀请供应商信息
function viewSupplier(i, dThis) {
	//sessionStorage.setItem('publicData', JSON.stringify(purchaseaData.projectSupplier[i]));//当前供应商的数据缓存
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看',
		area: ['650px', '400px'],
		content: viewSupplierUrl,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow; //获取包件弹出框整个对象
			iframeWind.du(purchaseaData.projectSupplier[i]) //弹出框弹出时初始化     	
		}

	});
};
//追加供应商发送短信
$(".sendMsg").on('click', function() {
	var PublicnowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	if(NewDate(purchaseaData.noticeEndDate) < NewDate(PublicnowDate)) {
		parent.layer.alert('公告截止时间已过，无法发送短信');
		return;
	};
	parent.layer.confirm('是否确认发送短信', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			type: "get",
			url: top.config.AuctionHost + "/ProjectSupplierController/sendMsgProjectSupplier.do",
			async: false,
			data: {
				'projectId': projectId,
				'tenderType': 1
			},
			success: function(res) {
				if(res.success) {
					parent.layer.alert('短信发送成功')
					Publics();
				} else {
					parent.layer.alert(res.message)
				}
				parent.layer.close(index)
			}
		});
	}, function(index) {
		parent.layer.close(index)
	});
})

function getProjectPrice() {
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

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
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
			field: 'detailedVersion',
			title: '规格型号',
			align: 'center',
			width: '120',
		},{
			field: 'priceType',
			title: '底价顶价标识',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.priceType==0){
					return '<div>底价</div>'
				}else if(row.priceType==1){
					return '<div>顶价</div>'
				}
			}
		},{
			field: 'salesPrice',
			title: '竞卖起始价',
			align: 'center',
			width: '120',
		},{
			field: 'servicePrice',
			title: '服务费',
			align: 'center',
			width: '120',
//			formatter:function(value, row, index){
//					return '<input type="text" class="form-control priceNumber" onblur=funonblur(\"' + index + '\") id="budgets_' + index + '" name="" value="' + (value || "") + '"/>';
//			}
		}, {
			field: 'storageLocation',
			title: '存放地点',
			align: 'center',
			width: '120',
		}]
	});
	$("#materialList").bootstrapTable("load", tabeldata);
}