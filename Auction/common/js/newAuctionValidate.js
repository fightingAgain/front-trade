var rowId, rowProId, tenders;

var setCostStateUrl = config.Syshost + '/SupplierCostStateController/setSupplierCostState.do'; // 支付完成回调
var updateGiveCostUrl = config.Syshost + '/GiveServiceChargeController/updateGiveServiceChargeForSup.do'; // 使用自制年费订单

var supplierId = "";


//竞价竞卖验证
function openIfiame(uid, packageId, tender) {
	rowId = packageId;
	rowProId = uid;
	tenders = tender;
	getEnterpriseInfo();
	$.ajax({
		url: config.AuctionHost + '/AuctionProjectPackageController/checkMessageForAuction.do',
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			'projectId': uid,
			'packageId': packageId,
		},
		success: function (res) {
			if (res.success) {
				var reslut = res.data;
				switch (reslut['strKey']) {
					case '501':
						parent.layer.alert('温馨提示：您未参该项目的报价！');
						break;
					case '502':
						parent.layer.alert('温馨提示：' + (tender == 1 ? '竞价' : '竞卖') + '未开始，请在' + reslut['strMessage'] + '参与' + (tender == 1 ? '竞价' : '竞卖') + '。');
						break;
					case '503':
						parent.layer.alert('温馨提示：' + (tender == 1 ? '竞价' : '竞卖') + '未开始，请在' + reslut['strMessage'] + '参与' + (tender == 1 ? '竞价' : '竞卖') + '。');
						break;
					case '504':
						affirmBtn();
						break;
					case '505':
						parent.layer.alert('温馨提示：您未接受该项目的邀请，无法进行' + (tender == 1 ? '竞价' : '竞卖') + '');
						break;
					case '506':
						parent.layer.alert('温馨提示：您未提交' + (tender == 1 ? '竞价' : '竞卖') + '文件或' + (tender == 1 ? '竞价' : '竞卖') + '文件审核未通过');
						break;
					case '507':
						if (reslut['strValue'] == 1) {
							var title = "温馨提示：感谢参与该项目的" + (tender == 1 ? '竞价' : '竞卖') + "，支付" + reslut['strMessage'] + "后，需缴纳平台服务费（<a href='" + platformFeeNoticeUrl + "' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能报价。确认支付" + reslut['strMessage']
						} else {
							var title = "温馨提示：感谢参与该项目的" + (tender == 1 ? '竞价' : '竞卖') + "，您需要先支付" + reslut['strMessage'] + "，是否现在支付？"
						}
						top.layer.confirm(title, function (indexsd) {
							payMoney(packageId, '', '', orderCallback);
							top.layer.close(indexsd);
						});
						break;
					case '508':
						parent.layer.alert('温馨提示：' + "下载" + (tender == 1 ? '竞价' : '竞卖') + "采购文件后才能参与" + (tender == 1 ? '竞价' : '竞卖') + '。');
						break;
					case '509'://不允许下载竞价采购文件/竞卖采购文件
						parent.layer.alert('温馨提示：' + "已过公告截止时间，" + "不允许下载" + (tender == 1 ? '竞价' : '竞卖') + '采购文件。');
						break;
					case '510'://手动报价开启校验
						parent.layer.alert(reslut['strMessage']);
						break;
					case '511':// 无文件时需采集信息
						collectInformationOfSupper(uid, packageId);
						break;
					case '512'://不允许下载竞价采购文件/竞卖采购文件
						parent.layer.alert('温馨提示：项目已失败，无法参与。');
						break;
					case '110'://无需缴纳平台服务费
						openOrder(packageId, uid)
						break;
					case '111':
						orderLidt(packageId, uid, reslut['strMessage'], reslut['strValue']);
						break;
					case '112'://需缴纳平台服务费,有年费,按时间段
						orderCount(packageId, uid, reslut['strMessage'], reslut['strValue'], 1);
						break;
					case '113'://需缴纳平台服务费,有年费,按次数
						orderCount(packageId, uid, reslut['strMessage'], reslut['strValue'], 0);//reslut['strValue']平台服务费金额			   	   
						break;
					case '114'://已生成订单,未交费
						//orderLidt(packageId,uid,reslut['strMessage'],reslut['strValue']);			   	  
						getGoodsList({ enterpriseId: supplierId, moneyType: 5, tenderType: '0'}, payGoodsCallback);
						break;
					case '115'://有制单信息
						updateGiveCost(reslut['strMessage'], reslut['strValue'], uid, packageId);
						break;
					default:
						openOrder(packageId, uid)
						break;
				}
			}
		}
	});
}

//支付订单回调函数(重新验证)
function orderCallback(status, orderId) {
	if (status == 3) {
		openIfiame(rowProId, rowId, tenders);
	}
}

//获取企业信息
function getEnterpriseInfo() {
	$.ajax({
		type: "get",
		url: top.config.Syshost + "/EmployeeController/logOurView.do",
		async: true,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (data) {
			if (data.success) {
				data = data.data;
				if (data.enterpriseId) {
					supplierId = data.enterpriseId
				}
			}
		}
	});
}



//有年费时调用的方法
function orderCount(packageId, uid, countData, counPries, countType) {//packageId包件id,uid项目ID,examType资格审查状态，countData验证
	top.layer.confirm('参与当前项目的采购，需支付平台服务费。（<a href="' + platformFeeNoticeUrl + '" target ="_blank">点击这里查看平台服务费收费标准</a>）' + (countType == 0 ? '您的年费当前剩余次数' + countData + '次，确定使用？' : '您的年费将于' + (countData.substring(0, 10)) + '到期，确定使用？'), function () {
		$.ajax({
			type: "post",
			url: config.Syshost + "/SupplierCostStateController/updateCostUseAndCostState.do",
			data: {
				'projectId': uid,
				'packageId': packageId,
				'costType': countType,
				'tenderType': tenders
			},
			async: true,
			success: function (data) {
				if (data.success) {
					top.layer.closeAll();
					top.$('#table').bootstrapTable(('refresh'));
					openIfiame(uid, packageId, tenders);
				} else {
					top.layer.closeAll();
				}
			}
		});
	});
}
var oderZise = ""
//无年费时，调用的方法。
function orderLidt(packageId, uid, message, counPries) {

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
	parent.layer.confirm('参与当前项目的采购，需支付平台服务费。（<a href="' + platformFeeNoticeUrl + '" target ="_blank">点击这里查看平台服务费收费标准</a>）', {
		btn: ['购买'] //可以无限个按钮
	}, function (indexds) {
		top.layer.close(indexds);
		openServicePage(packageId);
	});

}

/***
 * 购买平台服务费页面
 */
function openServicePage(pakId) {
	var width = 700;
	var height = 430;
	var title = "购买平台服务费";
	parent.layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		content: "view/Sys/CostManager/SystemCost/model/SupplierServiceCostEdit.html?tenderType=" + 0,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.postParam(function (para) {
				//payWay支付方式  1是微信，2是支付宝
				getGoodsList({ enterpriseId: supplierId, moneyType: 5, tenderType: '0'}, payGoodsCallback);
			});
		}
	});
}

/***
 * 该标段有自制平台服务费,供应商使用自制年费订单
 * @param {Object} id   制单主键id
 */
function updateGiveCost(coId, counPries, proId, packId) {
	// top.layer.confirm('参与当前项目的采购，需支付' + counPries + '元平台服务费。（<a href="' + siteInfo.portalSite + 'portalportal/central/notice_info/detail?id=E8B26D724DC64BACB07179D76F53B53C" target ="_blank">点击这里查看平台服务费收费标准</a>）' + '您当前有平台直接制单信息，确定使用？', function () {
		$.ajax({
			type: "post",
			url: updateGiveCostUrl,
			data: {
				id: coId,
				projectId: proId,
				packageId: packId,
				tenderType: tenders
			},
			async: true,
			success: function (data) {
				if (data.success) {
					top.layer.closeAll();
					openIfiame(proId, packId, tenders);
				} else {
					top.layer.closeAll();
				}
			}
		});

	// });
}




/***
 * 商品支付完成回调
 * @param {Object} data  支付成功返回的参数
 */
function payGoodsCallback(data) {
	var isExist = false;
	if (data.success) {
		var item = data.data[4];  //平台服务费
		if (item.orderId) {
			isExist = true;
			//setSupplierCostState(item.orderId, data.success);
		}
	}
	if (isExist) {
		//payOptions.paySuccess(data.success, false);
		openIfiame(rowProId, rowId, tenders);
	}
}


/***
 * 支付平台服务费完成回调方法 ，年费状态信息
 * @param {Object} orderId  订单id
 */
function setSupplierCostState(orderId, msg) {
	$.ajax({
		url: config.Syshost + '/SupplierCostStateController/setSupplierCostState.do',
		type: "post",
		async: false,
		data: { orderId: orderId, tenderType: top.TENDERTYPE },
		success: function (data) {
			if (data.success == false) {
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
//无文件时采集信息
function collectInformationOfSupper(id, packageId){
	parent.layer.open({
		type: 2,
		title: '信息',
		area: ['1000px', '600px'],
		content: "media/js/Model/model/relatedInfo.html",
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(id, packageId, function () {
				openIfiame(rowProId, rowId, tenders);
			});
		}
	});
}