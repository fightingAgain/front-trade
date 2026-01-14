WORKFLOWTYPE = "xmgg"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

//查看包间信息
var urlfindPurchase = top.config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do';
var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var packagePrice = [];//费用信息
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var purchaseaData = ""; //项目的数据的参数
var projectSupplements=[];
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
	if(sysEnterpriseId&&purchaseaData.project[0].projectSource==1){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			getDeposit();
		}
	}

})
function getProjectPrice(projectId){
	$.ajax({
		url:pricelist,
		type:'get',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"projectId":projectId,
		},
		success:function(data){	 
			packagePrice=data.data;
			if(packagePrice.length>0){	
				for(var i=0;i<packagePrice.length;i++){	
				 if(packagePrice[i].priceName == '项目保证金'){
					if(packagePrice[i].payMethod==0){
						$('.DepositPriceShow').hide();
						$("#payMethod").html('虚拟子账号');	
						$('.type_offline').show();
					}else{
						$('.DepositPriceShow').show();
						$("#payMethod").html('指定账号');
						$('.type_offline').hide();
						if(packagePrice[i].agentType==0){
							$("#agentType").html("平台")
						}
						if(packagePrice[i].agentType==1){
							$("#agentType").html("代理机构")
						}
						if(packagePrice[i].agentType==2){
							$("#agentType").html("采购人")
						}
						$("#bankAccount").html(packagePrice[i].bankAccount);
						$("#bankName").html(packagePrice[i].bankName);
						$("#bankNumber").html(packagePrice[i].bankNumber);					
					}
					$("#price1").html(packagePrice[i].price);
				 }
				 if(packagePrice[i].priceName == '竞价采购文件费'){
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
			if(result.success){
				purchaseaData = result.data //获取的数据
				if(purchaseaData.projectSupplement.length>0){//存在补遗		
					for(var i=0;i<purchaseaData.projectSupplement.length;i++){
						if(purchaseaData.projectSupplement[i].checkState==2){//审核通过
							projectSupplements.push(purchaseaData.projectSupplement[i]) ;							
						}
					}				
				}
				new UEditorEdit({
					contentKey:'content',
					pageType:'view',
				})
				mediaEditor.setValue(purchaseaData)
				initMediaVal(purchaseaData.options, {
					// stage: 'xmgg',
					from: 'jgcg',
					disabled: true,
					projectId: purchaseaData.projectId,
				})
			}
			
		},
		error: function(data) {

		}
	});

	getAccessoryList(); //加载审核文件
     Supplement();
	 $('div[id]').each(function(){
    	$(this).html(purchaseaData[this.id]);
    	if(reg.test(purchaseaData[this.id])){
			$(this).html(purchaseaData[this.id].substring(0,16));
		}
		
	});
	//渲染项目的数据
	$('div[id]').each(function(){
		$(this).html(purchaseaData.project[0][this.id]);
		if(reg.test(purchaseaData.project[0][this.id])){
			$(this).html(purchaseaData.project[0][this.id].substring(0,16));
		}		
	});
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if(purchaseaData.project[0].tenderProjectClassify){
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: purchaseaData.project[0].tenderProjectClassify,
			status: 2,
			viewCallback: function(name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if(purchaseaData.project[0].industriesType){
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: purchaseaData.project[0].industriesType,
			status: 2,
			viewCallback: function(name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
	//包件的信息渲染
	$('div[id]').each(function() {
		$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
	});
	if(purchaseaData.project[0].isAgent == 1){
		$('.isAgent').show();
	}
	$('#quotationType').html(purchaseaData.autionProjectPackage[0].quotationType == 1?'费率':purchaseaData.autionProjectPackage[0].quotationType== 0?'价格':'');
	$('#quotationMethod').html(purchaseaData.autionProjectPackage[0].quotationMethod == 1?'报单价':purchaseaData.autionProjectPackage[0].quotationMethod== 0?'报总价':'');
	if(purchaseaData.autionProjectPackage[0].quotationType == 1){
		$('.quotationTypeUnit').html('%');
	}else{
		$('.quotationTypeUnit').html('元');
	}
	//设备信息的数据渲染
	$('div[id]').each(function() {
		$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
	});
	if(projectSupplements.length>0){
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])){
			$(this).html(projectSupplements[0][this.id].substring(0,16));
		}	
		});
	}
	if(purchaseaData.autionProjectPackage[0].isPayDeposit==0){
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();	
		$("#bankType").html(purchaseaData.autionProjectPackage[0].bankType == 1 ? "工商银行" : purchaseaData.autionProjectPackage[0].bankType == 2? "招商银行":'');
	}else{
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();
	}
	if(purchaseaData.autionProjectPackage[0].isSellFile==0){
		$("#isSellFile").html("需要缴纳");
		$(".isSellShow").show();
		$('.isSellCols').attr('colspan','1')
	}else{
		$("#isSellFile").html("不需要缴纳")
		$(".isSellShow").hide();
		$('.isSellCols').attr('colspan','3');
	}
	//当为自由竞卖的时候限时显示
	if(purchaseaData.autionProjectPackage[0].auctionType == 0) {
		$("#timeLimits").show();
		$("#timeLimit").html(purchaseaData.autionProjectPackage[0].timeLimit)
	};
	//当为单轮竞卖的时候隐藏显示，
	if(purchaseaData.autionProjectPackage[0].auctionType == 1) {
		$("#timeLimits").hide();
	}
	//当为多轮竞卖2轮时
	if(purchaseaData.autionProjectPackage[0].auctionType == 2) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		//当为多轮竞卖3轮时
	} else if(purchaseaData.autionProjectPackage[0].auctionType == 3) {
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

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
	if(purchaseaData.autionProjectPackage[0].auctionType==2&&purchaseaData.autionProjectPackage[0].outType==1){
		$(".third").hide();
		$(".thirds").hide();
		$(".Supplier").hide();
	}else if(purchaseaData.autionProjectPackage[0].auctionType==2&&purchaseaData.autionProjectPackage[0].outType==0){
		$(".Supplier").show();
		$(".third").hide();
		$(".thirds").hide();
	}else if(purchaseaData.autionProjectPackage[0].auctionType==3&&purchaseaData.autionProjectPackage[0].outType==1){
		$(".Supplier").hide();
		$(".thirds").show();
	}else if(purchaseaData.autionProjectPackage[0].auctionType==3&&purchaseaData.autionProjectPackage[0].outType==0){
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}

	if(purchaseaData.project[0].isAgent == 0) {
		$('.noTax').show()
	} else {
		$('.noTax').hide()
	};
	
	/*start代理服务费*/
	var projectServiceFee = purchaseaData.autionProjectPackage[0].projectServiceFee;
	if(projectServiceFee){
		$("#agentBlock td").remove();
		var stHtml = '<td class="th_bg">采购代理服务费收取方式</td>'
    				+'<td><div id="collectType">'+(projectServiceFee.collectType==1?"标准累进制":(projectServiceFee.collectType==2?"其他":"固定金额"))+'</div></td>';
        if(projectServiceFee && projectServiceFee.collectType == 0){
        	stHtml += '<td class="th_bg">固定金额(元)</td>'
    				+'<td><div id="chargeMoney">'+projectServiceFee.chargeMoney +'</div></td>'
        } else if(projectServiceFee && projectServiceFee.collectType == 1){
        	if(projectServiceFee.isDiscount == 1){
        		stHtml +='<td class="th_bg">是否优惠</td><td>否</td>'
        	} else {
				stHtml+='<td class="th_bg">优惠系数（如8折输0.8）</td><td><div id="discountCoefficient">'+projectServiceFee.discountCoefficient+'</div></td>'
        	}
        }else if(projectServiceFee && projectServiceFee.collectType == 2){
        	stHtml +='<td class="th_bg">收取说明</td>'
    				+'<td><div id="collectRemark">'+(projectServiceFee.collectRemark != undefined ? projectServiceFee.collectRemark : "")+'</div></td>'
        }
        $(stHtml).appendTo("#agentBlock");
        $("#agentBlock").css("display", "table-row");
	}
	/*end代理服务费*/
}

////附件信息
function getAccessoryList() {
	$("#AccessoryList").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "fileName",
				halign: "center",
				title: "文件名"
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "10%",
				events:{
					'click .openAccessory':function(e, value, row, index){
						var newUrl = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
						window.location.href = $.parserUrlForToken(newUrl);
					}
				},
				formatter: function(value, row, index) {
					return "<a href='javascript:void(0)' class='btn btn-primary btn-xs openAccessory'>下载</a>"
				}
			},
		]
	})
	$("#AccessoryList").bootstrapTable("load", purchaseaData.purFile);
}
//当有邀请供应商的时候显示邀请供应商的列表
function Public(RenameBisnisId) {
	if(purchaseaData.projectSupplier.length>7){
     	var height="304"
     }else{
     	var height=""
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

//原项目保证金转移到本项目
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:2,
		parameter:{//接口调用的基本参数
			projectId:id,
			projectForm:2,
		},
		packageData:[
			{
				projectId:id, 
				projectForm:2
			}
		]
	})
}