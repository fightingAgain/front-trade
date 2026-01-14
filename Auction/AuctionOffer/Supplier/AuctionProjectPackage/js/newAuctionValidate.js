var rowId,rowProId,tenders,biddingTimes;

var setCostStateUrl = top.config.Syshost + '/SupplierCostStateController/setSupplierCostState.do'; // 支付完成回调
var updateGiveCostUrl = top.config.Syshost + '/GiveServiceChargeController/updateGiveServiceChargeForSup.do'; // 使用自制年费订单

var supplierId = "";

//竞价竞卖验证平台服务费
function openIframe(packageId,times){
	rowId=packageId;
	biddingTimes = times;
	getEnterpriseInfo();		
	$.ajax({
	   url:config.AuctionHost+'/AuctionProjectPackageController/checkWasteMessageForAuction.do',
	   type:'get',
	   dataType:'json',
	   async:false,
	   data:{
		   'packageId':packageId,								   		
	   },
	   success:function(res){		   	
		   if(res.success){
			   var reslut=res.data,tender;
			   rowProId = uid = reslut.projectId;
			   tenders = tender = reslut.tenderType;
			   switch (reslut['strKey']){
				   case '507':
						   if(reslut['strValue']==1){
							var title="温馨提示：感谢参与该项目的"+ (tender==1?'竞价':'竞卖') +"，支付"+reslut['strMessage']+"后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能报价。确认支付"+reslut['strMessage']
						   }else{
							var title="温馨提示：感谢参与该项目的"+ (tender==1?'竞价':'竞卖') +"，您需要先支付"+reslut['strMessage']+"，是否现在支付？"
						   }
						   top.layer.confirm(title, function(indexsd) {							
							payMoney(packageId,'','',orderCallback);
							top.layer.close(indexsd);	
						});
					   break;
				case '110'://无需缴纳平台服务费
					openOrder(packageId,biddingTimes)
					break;
				case '111':
					orderLidt(packageId,uid,reslut['strMessage'],reslut['strValue']);
					break;
				case '112'://需缴纳平台服务费,有年费,按时间段
					orderCount(packageId,uid,reslut['strMessage'],reslut['strValue'],1);			   	  			   	    
					break;
				case '113'://需缴纳平台服务费,有年费,按次数
					orderCount(packageId,uid,reslut['strMessage'],reslut['strValue'],0);//reslut['strValue']平台服务费金额			   	   
					break;
				case '114'://已生成订单,未交费		   	  
					getGoodsList({enterpriseId:supplierId,moneyType:5}, payGoodsCallback);
					break;
				case '116'://商用车保证金审核未通过
					parent.layer.alert('温馨提示：您的保证金还未审核通过!');
					break;
				default:
					openOrder(packageId,biddingTimes)
					break;
			   }
		   }
	   }  
});
}


//支付订单回调函数(重新验证)
function orderCallback(status,orderId){
	if(status == 3){
		openIframe(rowId,biddingTimes);
	}
}

//获取企业信息
function getEnterpriseInfo(){
	$.ajax({
		type: "get",
		url: top.config.Syshost + "/EmployeeController/logOurView.do",
		async: true,
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	   
	    },
		success: function(data) {
			if(data.success) {
				data = data.data;
				if(data.enterpriseId){
					supplierId = data.enterpriseId
				}
			}
		}
	});
}



//有年费时调用的方法
function orderCount(packageId,uid,countData,counPries,countType){//packageId包件id,uid项目ID,examType资格审查状态，countData验证
	top.layer.confirm('参与当前项目的采购，需支付'+ counPries +'元平台服务费。（<a href="'+ platformFeeNoticeUrl +'" target ="_blank">点击这里查看平台服务费收费标准</a>）'+(countType==0?'您的年费当前剩余次数'+countData +'次，确定使用？':'您的年费将于'+(countData.substring(0,10))+'到期，确定使用？'), function() {
		$.ajax({
			type: "post",
			url: config.Syshost + "/SupplierCostStateController/updateCostUseAndCostState.do",
			data: {
				'projectId': uid,
		   		'packageId': packageId,
		   		'costType':countType,
		   		'tenderType':tenders
			},
			async: true,
			success: function(data) {
				if(data.success){					
					top.layer.closeAll();
					top.$('#table').bootstrapTable(('refresh'));
					openIframe(rowId,biddingTimes);
				}else{
					top.layer.closeAll();					
				}
			}
		});
	});
}
var oderZise=""
//无年费时，调用的方法。
function orderLidt(packageId,uid,message,counPries){

	/*parent.layer.confirm('参与当前项目的采购，需支付'+ counPries +'元平台服务费。', {
	  btn: ['购买年费'] //可以无限个按钮
	}, function(indexds, layero){
		top.layer.close(indexds);
		var width = 700;
		var height = 430;
		var title = "购买平台服务费";
		parent.layer.open({
			type: 2,
			title: title,
			area: [width + 'px', height + 'px'],
			content: 'view/Order/Pay/PlatformCostEdit.html',
			success:function(layero, index){
				console.log(layero);
				console.log(index)
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.postParam(wechatPay); 
			}
		});
	
	});*/
	parent.layer.confirm('参与当前项目的采购，需支付'+ counPries +'元平台服务费。（<a href="'+ platformFeeNoticeUrl +'" target ="_blank">点击这里查看平台服务费收费标准</a>）', {
		btn: ['购买'] //可以无限个按钮
	}, function(indexds){
		top.layer.close(indexds);
		openServicePage(packageId);
	});

}

/***
 * 购买平台服务费页面
 */
function openServicePage(pakId){
	var width = 700;
	var height = 430;
	var title = "购买平台服务费";
	parent.layer.open({
			type: 2,
			title: title,
			area: [width + 'px', height + 'px'],
			content: "view/Sys/CostManager/SystemCost/model/SupplierServiceCostEdit.html?tenderType="+0,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.postParam(function(para){
					//payWay支付方式  1是微信，2是支付宝
					getGoodsList({enterpriseId:supplierId,moneyType:5}, payGoodsCallback);
				});
			}
		});
}

/***
 * 该标段有自制平台服务费,供应商使用自制年费订单
 * @param {Object} id   制单主键id
 */
function updateGiveCost(coId,counPries,proId,packId){
	top.layer.confirm('参与当前项目的采购，需支付'+ counPries +'元平台服务费。（<a href="'+ platformFeeNoticeUrl +'" target ="_blank">点击这里查看平台服务费收费标准</a>）'+'您当前有平台直接制单信息，确定使用？', function() {
		$.ajax({
			type: "post",
			url: updateGiveCostUrl,
			data: {
				id:coId,
				projectId: proId,
				packageId: packId,
				tenderType: tenders
			},
			async: true,
			success: function(data) {
				if(data.success){	
					top.layer.closeAll();
					openIframe(rowId,biddingTimes);
				}else{
					top.layer.closeAll();					
				}
			}
		});

	});
}




/***
 * 商品支付完成回调
 * @param {Object} data  支付成功返回的参数
 */
function payGoodsCallback(data){
	var isExist = false;
	if(data.success){
		var item = data.data[4];  //平台服务费
		if(item.orderId){
			isExist = true;
			//setSupplierCostState(item.orderId, data.success);
		}
	}
	if(isExist){
		//payOptions.paySuccess(data.success, false);
		openIframe(rowId,biddingTimes);
	}
}


/***
 * 支付平台服务费完成回调方法 ，年费状态信息
 * @param {Object} orderId  订单id
 */
function setSupplierCostState(orderId, msg){
	$.ajax({
         url: config.Syshost + '/SupplierCostStateController/setSupplierCostState.do',
         type: "post",
         async:false,
         data: {orderId:orderId, tenderType:top.TENDERTYPE},
         success: function (data) {
         	if(data.success == false){
        		top.layer.alert(data.message);
        		return;
        	}
         	//payOptions.paySuccess(msg, true);
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
  
}