var purchaseaData="";//项目的数据的参数
var findPurchaseUrl=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var BidFileDownloadUrl='Auction/Sale/Supplier/SupplierSalePurchase/model/view_DownloadReport.html'//添加下载记录页面
var dowoloadFileUrl = config.FileHost + '/FileController/download.do';//采购文件下载
var purchaseaData="";
var packageData="";//包件的数据容器
var publicData="";//邀请供应商数据的容器
var DetailedData="";//设备信息的数据容器

var purchaserNames=""//采购人姓名

var userName=""//当前登陆人的姓名

var userId=""

var projrctName=""//项目名称

var isAccepts=""//确认状态
var projectId=getUrlParam('projectId')
var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var packagePrice = [];//费用信息
var projectSupplements=[];//最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var islink = 1;//是否采集信息
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//初始化
$(function(){
	$('#btn_close').click(function(){
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
   	Purchase();
	$("#browserUrl").attr('href',siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSiteUrl);
	$("#webTitle").html(siteInfo.sysTitle);
});
function Purchase(){
  
   $.ajax({
	   	url:findPurchaseUrl,
	   	type:'get',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectId
	   	},
	   	success:function(data){	   
	   		purchaseaData=data.data//获取的数据
	   		//邀请供应商的数据
	   		purchaserNames=data.data.purchaserName;
			sessionStorage.setItem('subDate', purchaseaData.auctionStartDate);//邀请供应商的数据缓存				
	   		publicData=purchaseaData.projectSupplier;
	   		if(purchaseaData.autionProjectPackage.length>0){
	   			//包件信息的数据
		   		packageData=purchaseaData.autionProjectPackage;
		   		projrctName=packageData[0].projectName;
		   		//设备信息的数据
		   		DetailedData=purchaseaData.auctionPackageDetailed;
	   		};
	   		if(purchaseaData.purFile.length>0){
	   			filesData=purchaseaData.purFile;
	   			
	   			filesDataView()
	   		}
	   		if(purchaseaData.projectSupplement.length>0){//存在补遗		
				for(var i=0;i<purchaseaData.projectSupplement.length;i++){
					if(purchaseaData.projectSupplement[i].checkState==2){//审核通过
						projectSupplements.push(purchaseaData.projectSupplement[i]) ;							
					}
				}				
			}
			//实例化编辑器
			new UEditorEdit({
				contentKey:'content',
				pageType:'view',
			})
			mediaEditor.setValue(purchaseaData)
	   				   	
	   	},
	   	error:function(data){
	   		
	   	}
	});
	userName=top.userName;
	sessionStorage.setItem('userName', userName);//邀请供应商的数据缓存  
	userId=top.enterpriseId;
	isAcceptText()
	 //公告的信息渲染
    Supplement();
		 //公告的信息渲染
	    //渲染公告的数据
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
	//包件的信息渲染
	$('div[id]').each(function(){
		$(this).html(purchaseaData.autionProjectPackage[0][this.id]);
	});
	//设备信息的数据渲染
	$('div[id]').each(function(){
		$(this).html(purchaseaData.auctionPackageDetailed[0][this.id]);
	});
	$('#quotationType').html(purchaseaData.autionProjectPackage[0].quotationType == 1?'费率':purchaseaData.autionProjectPackage[0].quotationType== 0?'价格':'');
	$('#quotationMethod').html(purchaseaData.autionProjectPackage[0].quotationMethod == 1?'报单价':purchaseaData.autionProjectPackage[0].quotationMethod== 0?'报总价':'');
	if(purchaseaData.autionProjectPackage[0].quotationType == 1){
		$('.quotationTypeUnit').html('%');
	}else{
		$('.quotationTypeUnit').html('元');
	}
	if(purchaseaData.project[0].isAgent==0){
		$('.agency').hide();
		$('.purchaserShow').show();
	}else{
		$('.agency').show();
		$('.purchaserShow').hide();
	};
	if(projectSupplements.length>0){
		$('div[id]').each(function() {
			$(this).html(projectSupplements[0][this.id]);
			if(reg.test(projectSupplements[0][this.id])){
				$(this).html(projectSupplements[0][this.id].substring(0,16));
			}	
		});
	}
	$("#remark").html(purchaseaData.content);
	$('#StartDate').html($("#noticeStartDate").html())
    $('#endDate').html($("#noticeEndDate").html())
	//当为自由竞卖的时候限时显示
	//当为自由竞卖的时候限时显示
	if(purchaseaData.autionProjectPackage[0].auctionType==0){
		$("#timeLimits").show();
		$("#timeLimit").html(purchaseaData.autionProjectPackage[0].timeLimit)			
	}
	if(purchaseaData.projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	};
	if(packageData[0].isPayDeposit==0){
		$("#isPayDeposit").html("需要缴纳");
		$('.isDepositShow').show();	
	}else{
		$("#isPayDeposit").html("不需要缴纳");
		$('.isDepositShow').hide();
	}
	if(packageData[0].isSellFile==0){
		$("#isSellFile").html("需要缴纳");
		$(".isSellShow").show();
		$('.isSellCols').attr('colspan','1')
	}else{
		$("#isSellFile").html("不需要缴纳")
		$(".isSellShow").hide();
		$('.isSellCols').attr('colspan','3');
	}
	//当为单轮竞卖的时候隐藏显示，
	if(purchaseaData.autionProjectPackage[0].auctionType==1){
		$("#timeLimits").hide();		
	};
	//当为多轮竞卖2轮时
	if(purchaseaData.autionProjectPackage[0].auctionType==2){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		//当为多轮竞卖3轮时
	}else if(purchaseaData.autionProjectPackage[0].auctionType==3){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();
		$("#outSupplierd").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(purchaseaData.autionProjectPackage[0].outSupplier==0?'是指，每轮竞卖结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞卖结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')

		
	}else{
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
	};
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile==0){
		$('.isFileDate').show()
	}else{
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
	getProjectPrice();
	
	
	//start 招标代理服务费
	if(purchaseaData.autionProjectPackage&&purchaseaData.autionProjectPackage.length>0&&purchaseaData.autionProjectPackage[0].projectServiceFee){
		var projectServiceFee = purchaseaData.autionProjectPackage[0].projectServiceFee;
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
        $(stHtml).appendTo(".agentBlock");
        $(".agentBlock").css("display", "table-row");
	}
	//end 招标代理服务费
};
function isAcceptText(){
	if(purchaseaData.isPublic>1){		
		for(var i=0;i<publicData.length;i++){
			if(publicData[i].supplierId==userId){
				if(publicData[i].isAcceptText!=undefined){
					isAccepts=publicData[i].isAcceptText
				};				
			}
		};
		if(isAccepts!="拒绝"&&isAccepts!="接受"){
			affirmBtn()
		}
		$(".isAccept").show();
		isAcceptsNone(isAccepts)
	}else{
		$(".isAccept").hide()
	}
};
function isAcceptsNone(isAcceptsd){
	if(isAcceptsd=='接受'){
			$("#isAcceptText").html('<div class="text-success">'+ isAcceptsd +'</div>')
		}else if(isAcceptsd=='拒绝'){
			$("#isAcceptText").html('<div class="text-danger">'+ isAcceptsd +'</div>')
		}else if(isAcceptsd==''){
			$("#isAcceptText").html('未确认')
		}
};

//附件信息
function filesDataView() {
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
				width:'80px',
				align: "center",
				formatter:function(value, row, index){				
					return '<a  class="btn btn-sm btn-primary" onclick=openAccessory(\"' + index + '\")>下载</a>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);
}
var indexNum
function openAccessory(i) {
	islink = 1;
	//弹出添加下载记录页面
	indexNum=i
	$.ajax({
		url:config.AuctionHost+'/AuctionFileController/checkDownFile.do',
		type:'post',
		dataType:'json',
		async:false,
		data:{
			'projectId':projectId,
			'packageId':packageData[0].id,	
		 	'prefixOrder':orderSoruc.sys,
		 	'checkMessageType':2
		},
		success:function(res){
			if(res.success){
				var reslut=res.data;
				islink = reslut.islink;
				switch (reslut['strKey']){
					case '501':
						parent.layer.alert('温馨提示：您未参与该项目！');
						break;
					case '502':
					parent.layer.alert('温馨提示：您未接受邀请，不允许下载竞卖采购文件！');
					break;
					case '507':
						if(reslut['strValue']==1){
							var title="温馨提示：感谢参与该项目的竞价，支付竞卖采购文件费用后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能报价。确认支付竞卖采购文件费"
						}else{
							var title="温馨提示：感谢参与该项目的竞价，您需要支付竞卖采购文件费费用，是否现在支付？"
						}
						top.layer.confirm(title, function(indexss) {
							payMoney(packageData[0].id,reslut['strMessage'],'Ordertable',callbackPay);
						 	top.layer.close(indexss);
					 	});
						break;
					case '509'://不允许下载竞价采购文件/竞卖采购文件
	   				    parent.layer.alert('温馨提示：已过公告截止时间，不允许下载竞卖采购文件。');
	   					break;
					case '512'://不允许下载竞价采购文件/竞卖采购文件
						parent.layer.alert('温馨提示：项目已失败，不允许下载竞卖采购文件。');
						break;
					default:
						callbackPay()
					break;
				}
			}
		}
	})

}
function callbackPay(){
	if(islink == 1){
		//弹出添加下载记录页面
		top.layer.open({
			type:2 //此处以iframe举例
			,title:'下载文件'
			,area:['500px','600px']
			,content:BidFileDownloadUrl+'?projectId='+projectId+'&packageId='+packageData[0].id+'&isPayDeposit='+packageData[0].isPayDeposit
			,success:function(layero,index){
			  var iframeWind=layero.find('iframe')[0].contentWindow; 
				iframeWind.rowData=filesData[indexNum];	 
		
				iframeWind.subDate=purchaseaData.project[0].subDate  					
			}
		});
	}else{
		var newUrl = dowoloadFileUrl + "?ftpPath=" + filesData[indexNum].filePath + "&fname=" + filesData[indexNum].fileName;
		window.location.href = $.parserUrlForToken(newUrl);
	}
	
}
function affirmBtn(){
	sessionStorage.setItem('Num', '0');//
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['600px', '300px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'Auction/Sale/Supplier/SupplierSalePurchase/model/affirm.html?projectId='+purchaseaData.projectId,
		success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	  
        }
	});
}
function pay(){
	$.post(top.config.AuctionHost + '/AuctionProjectPackageController/verifyPackage.do',{id:packageData[0].id},function(res){
			if(!res.success){				
				if(res.message == '未确定是否接受邀请'){
					parent.layer.confirm('采购人'+userName+'邀请您参与'+purchaseaData[0].projectName+'项目，请确认是否参加', {
					  btn: ['是', '否'] //可以无限个按钮
					}, function(index, layero){
					    
					  parent.layer.close(index);
					  affirmBtn();
					}, function(index){
					   parent.layer.close(index);
					});
				}/*else if(res.message == '有未支付的订单') {
						top.layer.confirm("您有未支付的订单,确定前往支付", function() {
							parent.$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
									parent.$('#tenderType').val('2');
									parent.$('#status').val('0');
								});
							top.layer.closeAll();
						});
				}*/else if(res.message != "系统异常"){
					top.layer.confirm("温馨提示：感谢参与该项目的竞卖，您需要先支付"+data.message+"费用，是否现在支付？", function() {
						parent.$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
								parent.$('#tenderType').val('2');
								parent.$('#status').val('0');
							});
						top.layer.closeAll();
					});
				} else{
				   parent.layer.alert(res.message);										
				}																		
			}else{
				var index = parent.layer.open({
					type: 2,
					title: "竞卖报价",
					area: ['100%', '100%'],
					content: $.parserUrlForToken('0502/Sale/SaleOfferProject/model/view_Offer.html') + '#' + packageData[0].id
				});																	
			}
		})
}
function getProjectPrice(){
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
						}else{
							$('.DepositPriceShow').show();
							$("#payMethod").html('指定账号');
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
//年费
function findServiceCostSet(){
	$.ajax({
		url:config.Syshost+'/ServiceCostSetController/findServiceCostSetList.do',
		type:'get',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"tenderType":0,			
		},
		success:function(data){	 
			if(data.success){
				var list="";
				var listN="";
				for(var i=0;i<data.data.length;i++){
					if(data.data[i].costType==0){
						list+=data.data[i].serviceCharge+'元/次'	
					}
					if(data.data[i].costType==1){
						listN+=data.data[i].serviceCharge+'元/年'
						
					}
				}
				$("#findServiceCostSetList").html(list+'或'+listN+'（<a href="'+ platformFeeNoticeUrl +'" target ="_blank">点击这里查看平台服务费收费标准</a>）')
			}
		}  
 	});
}