var purchaseaData="";//项目的数据的参数
var findPurchaseUrl=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var BidFileDownloadUrl='Auction/Sale/Supplier/SupplierSalePurchase/model/view_DownloadReport.html'//添加下载记录页面
var purchaseaData="";
var packageData="";//包件的数据容器
var publicData="";//邀请供应商数据的容器
var DetailedData="";//设备信息的数据容器
var tabeldata = []; //物资信息
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
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//初始化
$(function(){
   	Purchase();
	$("#browserUrl").attr('href',siteInfo.portalSite);
	$("#browserUrl").html(siteInfo.portalSite);
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
	   		tabeldata = purchaseaData.materialDetails?purchaseaData.materialDetails:[];
			initDataTab(tabeldata);
			sessionStorage.setItem('subDate', purchaseaData.auctionStartDate);//邀请供应商的数据缓存				
	   		publicData=purchaseaData.projectSupplier;
	   		if(purchaseaData.autionProjectPackage.length>0){
	   			//包件信息的数据
		   		packageData=purchaseaData.autionProjectPackage;
		   		projrctName=packageData[0].projectName;
		   		//设备信息的数据
		   		DetailedData=purchaseaData.auctionPackageDetailed
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
	$('#StartDate').html($("#noticeStartDate").html())
    $('#endDate').html($("#noticeEndDate").html())
	//当为自由竞卖的时候限时显示
	//当为自由竞卖的时候限时显示
	if(purchaseaData.autionProjectPackage[0].auctionType==1){
		$("#timeLimits").hide();			
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
	
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile==0){
		$('.isFileDate').show()
	}else{
		$('.isFileDate').hide()
	};
	getProjectPrice();
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


var indexNum
function openAccessory(i) {
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
				switch (reslut['strKey']){
					case '501':
						parent.layer.alert('温馨提示：您未参该项目！');
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
					default:
						callbackPay()
					break;
				}
			}
		}
	})

}
function callbackPay(){
	//弹出添加下载记录页面
	top.layer.open({
		type:2 //此处以iframe举例
		,title:'下载文件'
		,area:['500px','600px']
		,content:BidFileDownloadUrl+'?projectId='+projectId+'&packageId='+packageData[0].id
		,success:function(layero,index){
		  var iframeWind=layero.find('iframe')[0].contentWindow; 
			iframeWind.rowData=filesData[indexNum];	 

			iframeWind.subDate=purchaseaData.project[0].subDate
			iframeWind.projectId=projectId   					
		}
	});
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
		}, {
			field: 'storageLocation',
			title: '存放地点',
			align: 'center',
			width: '120',
		}]
	});
	$("#materialList").bootstrapTable("load", tabeldata);
}