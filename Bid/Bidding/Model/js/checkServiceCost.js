var checkMessageUrl = config.Syshost + '/SupplierServiceChargeController/checkMessage.do';  //供应商缴纳平台服务费验证
var setSupplierCostStateUrl = config.Syshost + '/SupplierCostStateController/setSupplierCostState.do'; // 平台服务费支付完成回调
var updateCostUseAndCostStateUrl = config.Syshost + '/SupplierCostStateController/updateCostUseAndCostState.do'; // 更新年费使用情况
var updateGiveCostUrl = config.Syshost + '/GiveServiceChargeController/updateGiveServiceChargeForSup.do'; // 使用自制年费订单
var getProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do';  //获取招标项目，标段基本信息
var saveSpecialUrl = config.Syshost + "/SupplierServiceCostController/setSupplierServiceCost.do";   //特殊平台服务费
var serviceCostPage = 'view/Sys/CostManager/SystemCost/model/SupplierServiceCostEdit.html';
var payOptions = {
	//平台服务费需要
	projectId:"",  //项目id
	packId:"",  //标段id
	isOpen:1,
	money:"",
	enterpriseId:"",  //企业id
	isCanDownload:"",  //是否可以下载招标文件
	paySuccess:function(){
		//支付成功回调方法
	}
}
var proData;  //招标项目标段基本信息
var speEnterpriesId;  //特殊平台服务费收取企业id

/***
 * 打开商品列表窗口
 * @param {Object} para
 */
function checkServiceCost(para){
	$.extend(payOptions, para);
	proData = getProjectDetail(payOptions.packId);
	checkMessage();
}

/***
 * 获取招标项目，标段信息
 * @param {Object} id  标段id
 */
function getProjectDetail(id){
	var rst;
	$.ajax({
		type:"post",
		url:getProjectDetailUrl,
		async:false,
		data:{bidSectionId: id},
		success:function(data){
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			rst = data.data;
		}
	});
	return rst;
}

/***
 * 供应商缴纳平台服务费验证 
 */
function checkMessage(){
	$.ajax({
		type: "post",
		url: checkMessageUrl,
		async: false,
		data:{
			packageId:payOptions.packId,
			enterpriseId: proData.enterpriseId,
			agentEnterpriseId: proData.agencyEnterprisId,
			contractReckonPrice: proData.contractReckonPrice,
			priceUnit: proData.priceUnit
		},
		success: function(res) {
			if(!res.success) {
				parent.layer.alert(res.message);
				return;
			}
			var item = res.data;
			switch(item.strKey){
				case "111": //需缴纳平台服务费,没有年费
					unServiceCost(item.strValue);
					break;
				case "112":
					//需缴纳平台服务费,有年费,按时间段
					orderCount(item.strValue, item.strMessage, 1);
					break;
				case "113":
					//需缴纳平台服务费,有年费,按次数
					orderCount(item.strValue, item.strMessage, 0);
					break;
				case "114":
					//已生成单条订单,未交费,返回订单id
					getGoodsList({enterpriseId:payOptions.enterpriseId, moneyType:5, tenderType: '4'}, payGoodsCallback);
					break;
				case "115":
					//已有自制订单,未交费,返回订单id
					updateGiveCost(item.strMessage);
					break;
				case "201":
					//特殊平台服务费 isOpen 1是开标前，2是开标后
					speEnterpriesId = item.strValue.enterpriseId;
					if(item.strValue.isOpen == 1 && payOptions.isOpen == 1){
						unSpecialService(item.strValue.chargesValue);	
					} else if(item.strValue.isOpen == 2 && payOptions.isOpen == 2) {
						unSpecialService(item.strValue.chargesValue, payOptions.money);
					} else {
						payOptions.paySuccess(true);
					}
					break;
				case "213":
					//需缴纳平台服务费,有年费,按次数
					speEnterpriesId = item.speEnterpriesId;
					orderSpecialCount(item.strValue, item.strMessage, 0);
					break;
				case "214":
					//已生成特殊平台服务费订单,未交费,返回订单id
					speEnterpriesId = item.speEnterpriesId;
					getGoodsList({enterpriseId:payOptions.enterpriseId, moneyType:5, tenderType: '4'}, payGoodsCallback);
					break;
				default:   //通过
					payOptions.paySuccess(true);
//					if(payOptions.isCanDownload){
//						payOptions.paySuccess(true);
//					} else {
//						getGoodsList({enterpriseId:payOptions.enterpriseId, packId:payOptions.packId}, payGoodsCallback);
//					}
					break;
			}
		}
	});
}

//特殊平台服务费下单
function specialService(payMoney, speMoney){
	var param = {
		costType: 0,
		costName: "特殊平台服务费", 
		monthCount: 1, 
		payMoney: payMoney,
		speEnterpriesId: speEnterpriesId,
		tenderType: top.TENDERTYPE,
		packageId: payOptions.packId
	}
	if(speMoney || speMoney == 0){
		param.speMoney = speMoney;
	}
	$.ajax({
         url: saveSpecialUrl,
         type: "post",
         data: param,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.msg(data.message);
        		return;
        	}
         	if(data.data && data.data != ""){
         		getGoodsList({enterpriseId:payOptions.enterpriseId, moneyType:5, tenderType: '4'}, payGoodsCallback);
           }
			
         },
        error: function (data) {
            parent.layer.alert("请求失败");
        }
	});
}

//未缴纳特殊平台服务费
function unSpecialService(payMoney, speMoney){
	var tips = "";
	if(typeof payOptions.isCanDownload == "string"){
		tips = "您当前未缴纳特殊平台服务费，请先缴纳特殊平台服务费";
	} else {
		tips = "购买文件后，需缴纳特殊平台服务费才能下载文件。";
	}
	parent.layer.confirm(tips, {
		btn: ['购买', '取消'], //可以无限个按钮
		closeBtn:0
	}, function(indexds){
		top.layer.close(indexds);
		specialService(payMoney, speMoney);
	}, function(indexds){
		payOptions.paySuccess(false);
		
	});
}

/***
 * 有年费时调用的方法
 * @param {Object} sPrice  需缴纳平台服务费金额
 * @param {Object} sCount  剩余次数或到期时间
 * @param {Object} sType   0是次数  1是时间段
 */
function orderSpecialCount(sPrice,sCount,sType){//packageId包件id,uid项目ID,examType资格审查状态，countData验证
	top.layer.confirm('您的特殊平台服务费当前剩余次数'+sCount +'次，确定使用？', {btn: ['确定', '取消'],closeBtn:0}, 
		function(idx) {
			top.layer.close(idx);
			updateCostState(sType);

		},function(idx){
			payOptions.paySuccess(false);
		});
}

/***
 * 有年费时调用的方法
 * @param {Object} sPrice  需缴纳平台服务费金额
 * @param {Object} sCount  剩余次数或到期时间
 * @param {Object} sType   0是次数  1是时间段
 */
function orderCount(sPrice,sCount,sType){//packageId包件id,uid项目ID,examType资格审查状态，countData验证
	top.layer.confirm((sType==0?'您的平台服务费当前剩余次数'+sCount +'次，确定使用？':'您的平台服务费将于'+(sCount.substring(0,10))+'到期，确定使用？'), {btn: ['确定', '取消'],closeBtn:0}, 
		function(idx) {
			top.layer.close(idx);
			updateCostState(sType);

		},function(idx){
			payOptions.paySuccess(false);
		});
}
/***
 * 已购买年费,更新年费使用信息
 * @param {Object} sType 0是次数  1是时间段
 */
function updateCostState(sType){
	var param = {
		packageId: payOptions.packId,
		projectId: proData.tenderProjectId,
		costType: sType,
		tenderType:top.TENDERTYPE
	}
	if(speEnterpriesId){
		param.speEnterpriesId = speEnterpriesId;
	}
	$.ajax({
		type: "post",
		url: updateCostUseAndCostStateUrl,
		async: false,
		data: param,
		
		success: function(data) {
			if(data.success){		
				payOptions.paySuccess(true, true);
//				console.log("平台服务费使用更新成功");
			}else{
				top.layer.alert(data.message);				
			}
		}
	});
}

/***
 * 无年费时，调用的方法。
 * @param {Object} counPries 平台服务费金额
 * @param {Object} type  1是只支付年费，2是年费和商品一块支付
 */
function unServiceCost(counPries){
	var tips = "";
	if(typeof payOptions.isCanDownload == "string"){
		tips = "您当前未缴纳平台服务费，请先缴纳平台服务费,<a style='color: #337ab7;'  href='"+ platformFeeNoticeUrl +"' target='_blank'>点击这里查看平台服务费收费标准</a>";
	} else {
		tips = "购买文件后，需缴纳平台服务费才能下载文件。<a style='color: #337ab7;'  href='"+ platformFeeNoticeUrl +"' target='_blank'>点击这里查看平台服务费收费标准</a>";
	}
	parent.layer.confirm(tips, {
		btn: ['购买', '取消'], //可以无限个按钮
		closeBtn:0
	}, function(indexds){
		top.layer.close(indexds);
		openServicePage();
	}, function(indexds){
		payOptions.paySuccess(false);
//		getGoodsList({enterpriseId:payOptions.enterpriseId, packId:payOptions.packId}, function(data){
//			if(data.success){
//				if(!data.data){
//					payOptions.paySuccess(false);
//					top.layer.close(indexds);
//				} else {
//					payGoodsCallback(data);
//				}
//			}
//		});
		
	});

}
/***
 * 购买平台服务费页面
 */
function openServicePage(){
	var width = 700;
	var height = 430;
	var title = "购买平台服务费";
	parent.layer.open({
			type: 2,
			title: title,
			area: [width + 'px', height + 'px'],
			content: serviceCostPage + '?tenderType='+(tenderType == 4?'4':'0'),
			closeBtn:0,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.postParam(function(para){
					if(para == false){
						payOptions.paySuccess(false);
					} else {
						getGoodsList({enterpriseId:payOptions.enterpriseId, moneyType:5, tenderType: '4'}, payGoodsCallback);
					}	
				});
			}
		});
}
/***
 * 该标段有自制平台服务费,供应商使用自制年费订单
 * @param {Object} id   制单主键id
 */
function updateGiveCost(id){
	$.ajax({
		type: "post",
		url: updateGiveCostUrl,
		data: {
			id:id,
			packageId: payOptions.packId,
			tenderType: top.TENDERTYPE,
			projectId: proData.tenderProjectId
		},
		async: true,
		success: function(data) {
			if(data.success){					
				payOptions.paySuccess(true);
//				getGoodsList({enterpriseId:payOptions.enterpriseId, packId:payOptions.packId}, payGoodsCallback);
			}else{
				top.layer.closeAll();					
			}
		}
	});
}

/***
 * 商品支付完成回调
 * @param {Object} data  支付成功返回的参数
 */
function payGoodsCallback(data){
	var isExist = false;
	if(data.success){
		if(data.data && data.data.length > 0){
			var item = data.data[4];  //平台服务费
			if(item.orderId){
				isExist = true;
				checkMessage();
//				setSupplierCostState(item.orderId, data.success);
			}
		}
	}
//	if(!isExist){
//		payOptions.paySuccess(data.success);
//		checkMessage();
//	}
	
}


/***
 * 支付平台服务费完成回调方法 ，年费状态信息
 * @param {Object} orderId  订单id
 */
function setSupplierCostState(orderId, msg){
	var param = {
		orderId:orderId, 
		tenderType:top.TENDERTYPE
	}
	if(speEnterpriesId){
		param.speEnterpriesId = speEnterpriesId;
	}
	$.ajax({
         url: setSupplierCostStateUrl,
         type: "post",
         async:false,
         data: param,
         success: function (data) {
         	if(data.success == false){
        		top.layer.alert(data.message);
        		return;
        	}
         	checkMessage();
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
  
}




