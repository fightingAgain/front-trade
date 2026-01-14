var projectDataID="";//该条数据的项目id
var purchaseaData="";
var packageData="";//包件的数据容器
var publicData="";//邀请供应商数据的容器
var DetailedData="";//设备信息的数据容器
var filesData="";
var purchaserNames=""//采购人姓名

var userName=""//当前登陆人的姓名

var userId=""

var projrctName=""//项目名称

var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var packagePrice = [];//费用信息

//初始化
$(function(){
   Purchase();
   $("#browserUrl").attr('href',siteInfo.portalSite);
   $("#browserUrl").html(siteInfo.portalSite);
   $("#webTitle").html(siteInfo.sysTitle)
});
var isAccepts=""
var allProjectData=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//项目数据的接口；
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var CheckList=config.AuctionHost+'/AuctionPackageDetailedController/findAuctionPackageDetailedList.do'//材料设备 查询
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var BidFileDownloadUrl='Auction/Auction/Supplier/SupplierAuctionPurchase/model/view_DownloadReport.html'//添加下载记录页面
var auctionOutTypeData=[]//不限轮次淘汰方式
var projectSupplements=[];//最新一条且通过的补遗
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
function Purchase(){	
  projectDataID=JSON.parse(sessionStorage.getItem('purchaseaDataId'));
	$.ajax({
	   	url:allProjectData,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectDataID
	   	},
	   	success:function(data){
	   		//项目数据
	   		purchaseaData=data.data;	   		
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
	   		parent.layer.alert("修改失败")
	   	}
	 });
	 Supplement();
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
	package()
	//是否竞卖文件递交0为是1为否
	if(purchaseaData.isFile==0){
		$('.isFileDate').show();
	}else{
		$('.isFileDate').hide();
	}
	if(purchaseaData.project[0].isAgent==0){
		$('.agency').hide();
	}else{
		$('.agency').show();
	}
	if(purchaseaData.project[0].projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}
	userName=top.userName;
	sessionStorage.setItem('userName', userName);//邀请供应商的数据缓存  
	userId=top.enterpriseId;
	isAcceptText();	
};
function isAcceptText(){
	if(purchaseaData.isPublic>1){
		
		for(var i=0;i<publicData.length;i++){
			if(publicData[i].supplierId==userId){
				isAccepts=publicData[i].isAcceptText
			}
		};
		if(isAccepts!="拒绝"&&isAccepts!="接受"){
			 affirmBtn();
		}
		$(".isAccept").show();
		$("#isAcceptText").html('未确认');
		isAcceptsNone(isAccepts);
	}else{
		$(".isAccept").hide();
	};
	
	
};
function isAcceptsNone(isAcceptsd){
	//console.log(isAccepts)
	if(isAcceptsd=='接受'){
			$("#isAcceptText").html('<div class="text-success">'+ isAcceptsd +'</div>');
		}else if(isAcceptsd=='拒绝'){
			$("#isAcceptText").html('<div class="text-danger">'+ isAcceptsd +'</div>');
		}else if(isAcceptsd==''){
			$("#isAcceptText").html('未确认');
		}
};
function affirmBtn(){
	sessionStorage.setItem('Num', '0');//邀请供应商的数据缓存  
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['600px', '300px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'Auction/Auction/Supplier/SupplierAuctionPurchase/model/affirm.html?projectId='+purchaseaData.projectId,
		success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	
        }
	});
};
//包件的按钮
function package(){
	if(packageData.length>0){
		var strHtml = "";
		var btnHtml = "";
		for(i = 0; i < packageData.length; i++) {
			if(i==0){
				strHtml += "<button class='btn btn-default btn-primary packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}else{
				strHtml += "<button class='btn btn-default packageBtn' onclick=setPackageInfo('" + i + "',this)>包件" + (i + 1) + "</button>";
			}
			if(i < packageData.length - 1) {
				strHtml += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}	
			btnHtml+='<tr>'
			       +'<td style="padding:0px">'
			       +'<button style="width:100%;height:100%;background: rgba(210,48,44,.7);border:none;height:32px;color:#fff" onclick=pay(\"'+projectDataID+'\",\"'+packageData[i].id+'\")>包件' + (i + 1) + '</button>'
			       +'</td>'
			       +'</tr>'
		};
		$("#packageBtn").html(strHtml);		
		$("#projectPackages").html(btnHtml);
		setPackageInfo(0);	
	};
	
};
//根据按钮显示的包件信息
function setPackageInfo(obj,thiss) {
	$(thiss).addClass('btn-primary').siblings().removeClass('btn-primary');
	auctionOutTypeData=[];
	var data = packageData[obj];
	purchaseaData.packageId=data.id
	for(var i=0;i<purchaseaData.auctionOutType.length;i++){
		if(purchaseaData.auctionOutType[i].packageId==packageData[obj].id){
			auctionOutTypeData.push(purchaseaData.auctionOutType[i]);
		}
	};
	var data = packageData[obj];
	getProjectPrice(data.id,data.projectId);
	$('div[id]').each(function(){
			$(this).html(data[this.id]);
	});
	if(data.isPayDeposit==0){
		$('.isPayDeposit').attr('colspan','');
		$('.depositPrice').show();
	}else{
		$('.isPayDeposit').attr('colspan','3');
		$('.depositPrice').hide();
	}
	if(data.isPayDetailed==0){
		$('.isPayDetailed').attr('colspan','');
		$('.detailedPrice').show();
	}else{
		$('.isPayDetailed').attr('colspan','3');
		$('.detailedPrice').hide();
	}
	//当为自由竞卖的时候限时显示
	if(data.auctionType==0){
		if(data.auctionModel==0){
			$("#timeLimits").show();
		   $("#timeLimit").html(data.timeLimit);
		}else{
			$("#timeLimits").hide();
		}
		if(data.auctionModel==0&&data.isPrice==0){
		$(".isPriceM").show();
		$(".isPrices").show();
		$(".isPriceH").show();					
		$(".isPriceL").attr('colspan','');
		}else{
			$(".isPriceM").hide();
			$(".isPrices").hide();
			$(".isPriceH").hide();
			$(".isPriceL").attr('colspan','3');				
		};
		
	}else if(data.auctionType==1){
		$("#timeLimits").hide();
		$(".isPriceM").hide();
		$(".isPriceL").attr('colspan','3');		
		if(data.auctionModel==0){
			$(".isPrices").show();
			if(data.isPrice==0){
				$(".isPriceH").show();
			}else{
				$(".isPriceH").hide();
			}
		}else{
			$(".isPrices").hide();
			$(".isPriceH").hide();
		}
	}else{
		$(".isPriceM").hide();		
		if(data.isPrice==0){
			$(".isPrices").show();
			$(".isPriceH").show();
		}else{
			$(".isPriceH").hide();
			$(".isPrices").hide();
		}
		$(".isPriceL").attr('colspan','3');		
	};
	//当为多轮竞卖2轮时
	if(data.auctionType==2){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();	
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
		//当为多轮竞卖3轮时
	}else if(data.auctionType==3){
		$("#auctionType_2").show();
		$("#auctionType_0").hide();	
		$(".auctionType_4").hide();
		$("#outSupplierd").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
	}else{
		$("#auctionType_0").show();
		$("#auctionType_2").hide();
		$(".auctionType_4").hide();		
	};
	if(data.auctionType==4){
		$("#auctionType_2").hide();
		$("#auctionType_0").hide();
		$(".auctionType_4").show();
		$("#outSupplierb").html(packageData[obj].outSupplier==0?'按实际报价供应商数淘汰':'按参与供应商数淘汰')
		$(".outSupplierp").html(packageData[obj].outSupplier==0?'是指，每轮竞价结束后，未报价的供应商直接淘汰，然后从实际报价供应商中淘汰报价低的供应商（即设置的每轮淘汰数，若报价相同，淘汰后报价者），剩余供应商进入下一轮；':'是指，每轮竞价结束后，若未报价供应商数大于等于该轮淘汰数，则未报价供应商直接淘汰，剩余供应商进入下一轮，若未报价供应商数小于该轮淘汰数，则未报价供应商直接淘汰，然后从已报价供应商中淘汰报价低的供应商（设置的该轮淘汰数与未报价供应商的差，若报价相同，淘汰后报价者），剩余供应商进入下一轮。')
		auctionType_4(obj)
	}
	if(data.auctionType==2){
		$(".third").hide();
		$(".thirds").hide();
	}else if(data.auctionType==3&&data.outType==1){
		$(".Supplier").hide();
		$(".thirds").show();
	}else if(data.auctionType==3&&data.outType==0){
		$(".Supplier").show();
		$(".third").show();
		$(".thirds").show();
	}
	auctionPackageDetailed(packageData[obj].id)
	 filesDataView(packageData[obj].id)
}
//附件信息列表
function filesDataView(uid) {
	var tr = ""
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId':uid,
			'modelName':'JJ_AUCTION_PROJECT_PACKAGE'		
		},
		datatype: 'json',
		success: function(data) {
			if(data.success==true){
				filesData=data.data				
			}
		}
	});
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
				formatter:function(value, row, index){				
					return '<button  class="btn btn-sm btn-primary" onclick=openAccessory(\"' + index + '\")>下载</button>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);	
};

//点击下载附件信息
function openAccessory(i) {
	//弹出添加下载记录页面
	top.layer.open({
		type:2 //此处以iframe举例
		,title:'下载文件'
		,area:['500px','600px']
		,content:BidFileDownloadUrl+'?projectId='+projectId+'&packageId='+packageData[0].id
		,success:function(layero,index){
          var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.rowData=filesData[i];	        					
        }
	});

}
//设备信息的数据
function auctionPackageDetailed(uid){
	var checkListData=[];//把包件ID相同的设备信息放到一个数组中，
	$.ajax({
	   	url:CheckList,
	   	type:'post',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'packageId':uid
	   	},
	   	success:function(data){
	   		if(data.success){
	   			checkListData=data.data
	   		}	
	   	}
	 });	 
	if(checkListData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#PackageDetailedList').bootstrapTable({
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
				field: "detailedName",
				title: "材料设备名称",
				align: "left",
				halign: "left",

			},
			{
				field: "brand",
				title: "品牌要求",
				align: "center",
				halign: "center",
				width:'100px',

			},
			{
				field: "detailedVersion",
				title: "型号规格",
				halign:"center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "detailedCount",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "detailedUnit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},
			{
				field: "budget",
				title: "采购预算（元）",
				halign: "center",
				width:'100px',
				align: "center",
				formatter:function(value, row, index){
				if(value==undefined){
					var budget="暂无预算"
				}else{
					var budget=value;
				};
				return budget
				}
			},
			{
				field: "detailedContent",
				title: "备注",
				halign: "left",
				align: "left",
			}			
		]
	});
	$('#PackageDetailedList').bootstrapTable("load", checkListData);
}
function auctionType_4(obj){
	if(auctionOutTypeData.length>0){
           var strHtml=""; 
             strHtml='<tr>'
                        +'<td rowspan="'+ (auctionOutTypeData.length+4) +'" style="text-align: right;">淘汰方式：</td>'
						+'<td style="text-align: left;" colspan="4">'
							+'(1)、首轮报价供应商数'+(auctionOutTypeData[0].countType==0?'大于等于':'大于')+auctionOutTypeData[0].countValue+'家时，'						
							+'每轮淘汰'+  auctionOutTypeData[0].outValue +'家供应商；'
							+'<span style="'+(auctionOutTypeData[0].countValue==0?'':'display:none')+'">，每轮保留'+auctionOutTypeData[0].keepValue+'家供应商；</span>'
						+'</td>'
					+'</tr>'
					if(auctionOutTypeData.length>2){
						for(var i=1;i<auctionOutTypeData.length-1;i++){
						    strHtml += '<tr><td style="text-align: left;" colspan="4">('+(i+1)+')、首轮报价供应商数'
						    strHtml += (auctionOutTypeData[i-1].countType == 0?'小于':'小于等于')
							strHtml += auctionOutTypeData[i-1].countValue
							strHtml += '且' +(auctionOutTypeData[i].countType==0?'大于等于':'大于')
							strHtml += auctionOutTypeData[i].countValue
							strHtml += '家时，每轮淘汰'
							strHtml += auctionOutTypeData[i].outValue
							strHtml += '家供应商；</td>'
							strHtml +='</tr>'
						}
					}
				if(auctionOutTypeData[0].countValue!=0&&auctionOutTypeData[0].countValue!=undefined){
						strHtml +='<tr>'
						strHtml +='<td style="text-align: left;" colspan="4">'
						if(auctionOutTypeData.length>2){
						strHtml +='('+ auctionOutTypeData.length +')、首轮报价供应商数'+(auctionOutTypeData[auctionOutTypeData.length-2].countType==0?'小于':'小于等于')
						}else{
						strHtml +='('+ auctionOutTypeData.length +')、首轮报价供应商数'+(auctionOutTypeData[0].countType==0?'小于':'小于等于')
						}
						strHtml +=auctionOutTypeData[auctionOutTypeData.length-1].countValue+'家时，每轮淘汰'
						strHtml +=auctionOutTypeData[auctionOutTypeData.length-1].outValue+'家；'
						strHtml +='</td>'
						strHtml +='</tr>'
						strHtml +='<td style="text-align: left;" colspan="4">'
						strHtml +='('+ (auctionOutTypeData.length+1) +')、每轮保留'+ auctionOutTypeData[auctionOutTypeData.length-1].keepValue +'家供应商；'
						strHtml +='</td>'
						strHtml +='<tr>'
						strHtml +='</tr>'
						
				}
           	         strHtml +='<tr>'           	                         
           	         strHtml +='<td colspan="4" style="text-align: left;">'
           	         strHtml +='('+ (auctionOutTypeData.length+2) +')、当剩余供应商数小于等于淘汰家数与保留家数之和时'+(packageData[obj].lastOutType==1?'每轮淘汰1家直至剩余'+auctionOutTypeData[auctionOutTypeData.length-1].keepValue+'家。':'一轮淘汰，保留'+ auctionOutTypeData[auctionOutTypeData.length-1].keepValue +'家。')
           	         strHtml +='</td>'
           	         strHtml +='</tr>'
           	   $("#tbOutType").html(strHtml);	
	           	       					 			
			}
}
function pay(uid,packageId){
	$.post(top.config.AuctionHost + '/AuctionProjectPackageController/verifyPackage.do',{id:packageId},function(res){
			if(!res.success){				
				if(res.message == '未确定是否接受邀请'){
					affirmBtn();
				}else if(res.message != "系统异常"){
					top.layer.confirm("温馨提示：感谢参与该项目的竞价，您需要先支付"+data.message+"费用，是否现在支付？", function() {
						parent.$('.page-content .content').load('view/Bid/Order/MyOrder.html',function(){
						parent.$('#tenderType').val('1');
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
					title: "竞价采购报价",
					area: ['100%', '100%'],
					content: $.parserUrlForToken('0502/Auction/AuctionProjectPackage/model/view_Package.html') + '#' + packageId
				});																	
			}
		})
}
function getProjectPrice(packageId,projectId){
	$.ajax({
	   	url:pricelist,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageId,
	   		"projectId":projectId,
	   	},
	   	success:function(data){	 
	   		packagePrice=data.data;
	   		
	   		if(packagePrice.length>0){
	   			var optionText;
				for(var z=0;z<packagePrice.length;z++){
					if(packagePrice[z].priceName=="项目保证金"){
						optionText=packagePrice[z];
						packagePrice.splice(z,1);
						break;
					}
				}
				if(optionText != undefined){
					packagePrice.push(optionText);
				}
	   			mixtbody = "";
   				for(var i=0;i<packagePrice.length;i++){
   					if(packagePrice[i].priceName=='项目保证金'){
   						mixtbody+='<tr><td style="width: 74px;" rowspan="3" >是</td>'
				  	  	mixtbody+='<td style="text-align: left;" rowspan="3">'+packagePrice[i].priceName +'</td>'
				  	  	mixtbody+=packagePrice[i].payWay == 0?'<td style="text-align: left;">银联</td>':'<td style="text-align: left;">移动支付</td>';
   					}else{
   						mixtbody+='<tr><td style="width: 74px;">是</td>'
				  	  	mixtbody+='<td style="text-align: left;">'+packagePrice[i].priceName +'</td>'
				  	  	mixtbody+=packagePrice[i].payWay == 0?'<td style="text-align: left;">银联</td>':'<td style="text-align: left;">移动支付</td>';
   					}
					
	                if(packagePrice[i].payTime == 0){
	                	mixtbody+='<td style="text-align: left;">报价前缴纳</td>';
	                }else if (packagePrice[i].payTime == 1){
	                	mixtbody+='<td style="text-align: left;">中标供应商缴纳</td>';
	                }else if (packagePrice[i].payTime == 2){
	                	mixtbody+='<td style="text-align: left;">任意时间缴纳</td>';
	                }
	                mixtbody+=packagePrice[i].payType == 0?'<td style="text-align: left;">按百分比收取</td>':'<td style="text-align: left;">按固定金额收取</td>';
	                
	                if(packagePrice[i].payType == 0){
	                	mixtbody+='<td style="text-align: right;">'+((packagePrice[i].chargePercent)||0 )+'％</td></tr>'
	                }else{
	                	mixtbody+='<td style="text-align: right;">'+(packagePrice[i].price ?(packagePrice[i].price.toFixed(2)):"")+'</td></tr>'
	                }
	                	
	              	
					
					if(packagePrice[i].priceName == '项目保证金'){
						mixtbody +='<tr>';
			   	  		mixtbody +='<td style="text-align: left;">收取机构</td>';
			   	  		mixtbody +='<td style="text-align: left;">';
			   	  		if(packagePrice[i].agentType == 0){
		                	mixtbody+='<span>平台</span>';
		                }else if (packagePrice[i].agentType == 1){
		                	mixtbody+='<span>代理机构</span>';
		                }else if (packagePrice[i].agentType == 2){
		                	mixtbody+='<span>采购人</span>';
		                }
						mixtbody +='</td>';
						mixtbody +='<td style="text-align: left;">开户银行</td>';
						mixtbody +='<td style="text-align: left;">'+((packagePrice[i].bankName)||"")+'</td>';
			   	  		mixtbody +='</tr>';
			   	  		mixtbody +='<tr>';
			   	  		mixtbody +='<td style="text-align: left;">账户名</td>';
			   	  		mixtbody +='<td style="text-align: left;">'+((packagePrice[i].bankAccount)||"")+'</td>';
						mixtbody +='<td style="text-align: left;">账号</td>';
						mixtbody +='<td style="text-align: left;">'+((packagePrice[i].bankNumber)||"")+'</td>';
			   	  		mixtbody +='</tr>';
					}
				}
   				
	   			$('#tbodybzj').html(mixtbody);
		    }else{
		  	    $('#tbodybzj').html('<tr ><td colspan="6">暂无信息</td></tr>');
		    }

	   	}  
	});
}

