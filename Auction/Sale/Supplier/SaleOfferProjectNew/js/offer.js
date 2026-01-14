// 初始化全局变量
var global;										// 基础信息
var recordData;									// 当前报价信息
var packageId = location.hash.substr(1);		// 包件ID
var supplierId = top.enterpriseId;	// 供应商ID
 
var round_startTime;							// 当前轮次开始时间
var _stage;										// 当前轮次
var auctionTimes;								// 轮次间隔时间
var offerId;									// 竞低价采购报价ID
var lowPrice;									// 当前最低价格
var _roundData; 								// 所有轮次数据 多轮/无限
var _open = false;
var endTimeTips = '';

var multiple = 0; //涨价金额(元):+0.00
var amountOfMoney = 0; //本次报价(元):
var quotationUnit;
$.ajax({
	url: top.config.AuctionHost + '/AuctionQuoteController/detail.do',
	data: {
		'packageId': packageId,
		'supplierId': supplierId,
	},
	async: false,
	success: function (res) {
		if (res.success) {
			// 基础信息-全局变量
			global = res.data;
			quotationUnit = global.quotationUnit;
			if(global.quotationType == 1){
				$('.moneyChinese').hide();
				$('.quotationType').show();
			}else{
				$('.moneyChinese').show();
				$('.quotationType').hide();
			}
			$('.quotationUnit').html(quotationUnit?quotationUnit:'元');
			_open = true;
			if(global.offerEndDate){
				endTimeTips = '<div class="endTimeTips">本次竞卖于【'+global.offerEndDate+'】结束</div>'
			}
			auctionTimes = [+global.firstAuctionTime, +global.secondAuctionTime, +global.thirdAuctionTime];
			_stage = global.stage; // 
			offerId = global.Offer ? global.Offer.id : global.auctionOffer.id;

			if (global.stage != 0) {
				$.ajax({
					url: top.config.AuctionHost + '/AuctionQuoteController/record.do',
					data: {
						packageId: packageId,
						auctionType: global.auctionType,
						auctionModel: global.auctionModel,
						offerId: offerId
					},
					//complete:function(xhr,textStatus,errorThrown){},
					beforeSend: function (xhr) {
						var token = $.getToken();
						xhr.setRequestHeader("Token", token);
					},
					async: false,
					success: function (res) {
						if (res.success) {
							if( res.data && res.data.details){
								recordData = res.data.details;
							}else{
								recordData = res.data;
							}
 
						} else layer.alert(res.message);
					}
				});
			}

		}
		else {
			parent.layer.alert(res.message);
			var index=top.parent.layer.getFrameIndex(window.name);
			top.parent.layer.close(index);
			return false;
		}
	}
});
/**
 * stage 
 * 0-竞卖结束
 * 自由竞卖： 		1-自由竞卖阶段 2-自由竞卖限时阶段
 * 多轮/单轮竞卖：	3-第一轮竞卖/单轮 4-第一轮竞卖休息 5-第二轮竞卖 6-第二轮竞卖休息 7-第三轮竞卖
 */

$(function () {
	if(_open==false) return false;
	$("#auctionType").html(['自由竞卖', '单轮竞卖'][global.auctionType] || '多轮竞卖');
	$('p[data-field="packageNum"]').html(global.packageCode);
	$('p[data-field="offerCode"]').html(global.Offer ? global.Offer.offerCode : global.auctionOffer.offerCode);
	$('p[data-field="auctionModel"]').html(['按包件', '按明细'][global.auctionModel] || '');
	$('p[data-field="packageName"]').html(global.packageName);
	if (global.projectSource > 0) {
		$('p[data-field="packageName"]').html(global.packageName + '<span class="red">(重新竞卖)</span>');
	}
	$('p[data-field="curUser"]').html(global.enterpriseName);

	$('p[data-field="detailedName"]').html(global.packageDetails[0].detailedName || '暂无');
	$('p[data-field="brand"]').html(global.packageDetails[0].brand || '暂无');
	$('p[data-field="detailedVersion"]').html(global.packageDetails[0].detailedVersion || '暂无');
	$('p[data-field="detailedCount"]').html(global.packageDetails[0].detailedCount || '暂无');
	$('p[data-field="detailedUnit"]').html(global.packageDetails[0].detailedUnit || '暂无');

	if (global.priceReduction) {
		$('#ReductionText').html('涨价<font style="font-size:12px; color:red">（涨价金额= 报价倍数* 涨价幅度）</font>');
		$('.offerMoney').attr('placeholder','输入报价倍数');
		$('.priceReductionComputed').fadeIn()
		$('.submitButton').addClass('disabled')
 
		$('.offerMoney').on({
			compositionend:function(){
				let val = $(this).val()
				if(!(/(^[1-9]\d*$)/.test(val))){
					$('.offerMoney').val('')
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				if(!val){
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				reOfferMoneyShow(val)
			},
			input:function(){
				let val = $(this).val()
				if(!(/(^[1-9]\d*$)/.test(val))){
					$('.offerMoney').val('')
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				if(!val){
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				reOfferMoneyShow(val)
			}
		})







	}

	/**
	 * 根据类型业务流程开始
	 * 竞卖方式: 0-自由竞卖  1-单轮竞卖, 2-多轮竞卖中的2轮竞卖, 3-多轮竞卖中的3轮竞卖, 4-不限轮次, 6-清单式竞卖, 7-单项目竞卖
	 */
	if (global.auctionType <= 1) {
		if (global.auctionModel == 0) {
			// (按包件)--单轮竞卖、自由竞卖
			view_package();
		} else if (global.auctionModel == 1) {
			// (按明细)--单轮竞卖、自由竞卖
			view_detailed();
		}
	} else if (global.auctionType > 1) {
		view_duolun();
	}

	/*
	* 关闭左上角提示信息
	*/
	$('.detailed_notice').on('click', '.close', function () {
		$(this).parent().fadeOut('fast', function () {
			$(this).remove();
		})
	});

	if (global.stage == 0) return false; // 已结束

	if (global.auctionOffer.isEliminated) {
		/**
		 * 已被淘汰
		 */
		$('.timeShow').hide();
		$('.TimeText').html('<div class="error"></div>您已被淘汰，不可参与报价！'+endTimeTips);
		$('.inputBox').remove(); // 被淘汰 移除报价按钮
		$('#submitBox').remove();
		$('.swiper-container').remove();
	} else {

		/**
		 * 没有结束 && 没有被淘汰
		 */
		countDown();

	}
	/**
	 * 点击报价按钮执行事件
	*/
	$('.auctionOffer').click(offer);


});

function getIndex(value, row, index) {
	return index + 1;
}

// 通知信息的创建
function addNotice(_type, _text) {
	$('.detailed_notice').append('<div class="item ' + _type + '">' + _text + '<span class="close">×</span></div>');
}

// (按包件)--单轮竞卖、自由竞卖
function view_package() {
	/**
	 * 自由竞卖
	 */
	if (global.auctionType == 0) {
		$('#priceLog').show();
		$('#submitBox').show();
		$('.nowPrice').hide();
		// 包件基础信息
		// $('p[data-field="minPrice"]').html( (data.minPrice || data.rawPrice ? (data.minPrice || data.rawPrice) + '<span>元</span>' : '暂无'));
		$('p[data-field="rawPrice"]').html((global.biddingStartPrice || '暂无'));
		// $('p[data-field="myMinPrice"]').html((data.myMinPrice+'<span>元</span>' || '暂无报价'));
		$('p[data-field="moneyChinese"]').html((global.moneyChinese || '暂无'));

		if (global.stage == 0) {
			$('.TimeText').html('<div class="success" style="margin-top:50px;"></div>竞卖已结束'+endTimeTips);
			$('.inputBox').hide();
			$('.timeShow').hide();
		} else {
			if (global.priceReduction) {
				$('#priceReduction').html('× <div class="sp"><span>涨价幅度</span> ' + global.priceReduction+(quotationUnit?quotationUnit:'元')+'</div>').fadeIn();
			}
		}
		$('#offerLogsTable').bootstrapTable({
			pagination: false,
			undefinedText: "",
			height: '280',
			columns: [
				{
					field: "xuhao",
					title: "序号",
					align: "center",
					halign: "center",
					width: "50px",
					formatter: getIndex
				},
				{
					field: "offerMoney",
					title: "报价（"+(quotationUnit?quotationUnit:'元')+"）",
					align: "center",
					halign: "center",
				},
				{
					field: "subDate",
					title: "报价时间",
					align: "center",
					halign: "center",
				},
			]
		});
		$('#myOfferLogsTable').bootstrapTable({
			pagination: false,
			undefinedText: "",
			height: '280',
			columns: [
				{
					field: "xuhao",
					title: "序号",
					align: "center",
					halign: "center",
					width: "50px",
					formatter: getIndex
				},
				{
					field: "offerMoney",
					title: "报价（"+(quotationUnit?quotationUnit:'元')+"）",
					align: "center",
					halign: "center",
				},
				{
					field: "subDate",
					title: "报价时间",
					align: "center",
					halign: "center",
				},
			]
		});
		if (global.stage != 0) {
			getNewPrice();
		}
	}
	else {
		//单轮竞卖
		$('#submitBox').show();
		$('.nowPrice').hide();
		$('.priceLog').show();
		$('.offerLogsTableBox').hide();
		$('.minPriceBox').hide();
		$('.myOfferLogsTableBox').css('marginLeft','0px');
		// $('.rawPriceBox').hide();
 
		// 如果初始化的时候, 自己有报价
		if (global.Item && global.Item.length >0) {
			$('.myMinPrice').html(global.myMinPrice);
			$('.auctionOffer').addClass('disabled');
		}
		$('.moneyChinese').html(global.moneyChinese || '暂无报价');

		if (global.priceReduction) {
			$('#priceReduction').html('× <div class="sp"><span>涨价幅度</span> ' + global.priceReduction+(quotationUnit?quotationUnit:'元')+'</div>').fadeIn();
		}
 
		$('.detailed_notice').show();

		addNotice('warning', '只有一次报价机会，提交报价后无法撤销，请慎重报价！');

		if (global.stage == 0) {
			$('.TimeText').html('<div class="success" style="margin-top:50px;"></div>竞卖已结束'+endTimeTips);
			$('.auctionOffer').addClass('disabled');
			$('.inputBox').hide();
			$('.timeShow').hide();
		}

		if(global.stage!=0){
			if(recordData && recordData.myOfferMoney){
				$('.auctionOffer').addClass('disabled');
				if (global.priceReduction){
					$('.offerMoney').val('').prop('disabled', 'disabled');
				}else{
					$('.offerMoney').val(recordData.myOfferMoney).prop('disabled', 'disabled');
				}
				
				// return false;
			}
		}else{
			if(global && global.offerItems){
				(global.offerItems).forEach(function (val) {
					if (val.supplierId == top.supplierId) {
						$('.auctionOffer').addClass('disabled');
						$('.offerMoney').val(val.offerMoney).prop('disabled', 'disabled');
						// return false;
					}
				});
			}else{
				$('.auctionOffer').addClass('disabled');
			}
		}

		// 包件基础信息
		// $('p[data-field="minPrice"]').html( (data.minPrice || data.rawPrice ? (data.minPrice || data.rawPrice) + '<span>元</span>' : '暂无'));
		$('p[data-field="rawPrice"]').html((global.biddingStartPrice || '暂无'));
		// $('p[data-field="myMinPrice"]').html((data.myMinPrice+'<span>元</span>' || '暂无报价'));
		$('p[data-field="moneyChinese"]').html((global.moneyChinese || '暂无'));

		$('#myOfferLogsTable').bootstrapTable(
			{
				columns: [
					{ field: "offerCode", title: '竞买号', align: 'left' },
					{ field: "offerMoney", title: '报价（'+(quotationUnit?quotationUnit:'元')+'）', align: 'right' },
					{ field: "offerMoneyCN", title: '报价大写', align: 'right' },
					{ field: "subDate", title: '提交时间', align: 'right' }
				]
			}
		);

	}
	if (global.stage != 0) {
		if(global.auctionType == 1){
			if(recordData && recordData.myOfferMoney){
				var r_data = [
					{
						'myOfferMoney':recordData.myOfferMoney,
						'myOfferMoneyCN':recordData.myOfferMomyOfferMoneyCNney,
						'offerMoney':recordData.myOfferMoney,
						'offerMoneyCN':recordData.myOfferMoneyCN,
						'offerCode':recordData.offerCode,
						'subDate':recordData.subDate,
					}
				];
				showData(r_data);
			}else{
				showData([]);
			}

		}else{
			showData(recordData && recordData.offerItems && recordData.offerItems.length > 0 ? global.offerItems : []);
		}
	}else{
		showData(global && global.offerItems && global.offerItems.length > 0 ? global.offerItems : []);
	}
	if (global.priceReduction != undefined) {
		$(".offerMoney").on("blur", function () {
			var minPrice = $('.minPrice').html().substring(0, $('.minPrice').html().length - 1);
			var bei = Math.floor(minPrice / global.priceReduction)
			if ($(this).val() != "") {
				// if (!(/^\+?[1-9][0-9]*$/.test($(this).val()))) {
				// 	parent.layer.alert("必须为大于零的整数");
				// 	$(this).val("")
				// };
				if (bei < $(this).val()) {
					parent.layer.alert("当前最大倍数不能超过" + bei + '倍');
					$(this).val("")
				};
			}
			// var b = (parseInt(minPrice * 100000000 - $(this).val() * 100000000 * global.priceReduction) / 100000000).toFixed(top.prieNumber || 2);
			// $(".myMinPrice").html(b)
		})
	} else {
		$(".offerMoney").on('change', function () {
			if ($(this).val() != "") {
				// if (!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
				// 	parent.layer.alert("报价必须大于零且最多两位小数");
				// 	$(this).val("");
				// 	return
				// };
				var b = Number($(this).val());
				$(this).val(b);
			};
		});
	}

}

/**
 * 多轮竞卖
*/
function view_duolun(type) {

	// _stage 当前轮次
	var now_round = parseInt(_stage / 2);
 
	// 如果竞卖结束
	if (global.stage == 0) {
		if(!global.isEliminated){
			$('.TimeText').html('<div class="success" style="margin-top:50px;"></div>');
			$('.TimeText').append('本项目竞价已结束<br/>'+endTimeTips);
		}else{
			$('.TimeText').html('<div class="error" style="margin-top:50px;"></div>');
			$('.TimeText').append('很抱歉,您已被淘汰<br/>'+endTimeTips);
		}
		if(global.isEnd == 1 && !global.isAllEliminated){
			$('.TimeText').append('<div style="margin-top: 15px; font-size: 14px; font-weight: 100;">成功竞买号为：<b>' + global.offerRounds[global.offerRounds.length - 1].winPriceOfferCode + '</b>。<br/>竞买价格为：<font color="red"><b>' + global.offerRounds[global.offerRounds.length - 1].winPrice+(quotationUnit?quotationUnit:'元') + '</b></font></div>');
		}
		if(global.isEnd == 0 && global.isEliminated==1){
			$('.TimeText').append('<div style="margin-top: 15px; font-size: 14px; font-weight: 100;">您的报价为：<font color="red"><b>' + global.Item[0].offerMoney+(quotationUnit?quotationUnit:'元') + '</b></font></div>');
		}
		$('.timeShow').hide();
		return false;
	} else {
		$('#submitBox').show();
		$('.detailed_notice').html('');
		$('.liTableBox').show();
		$('.curStageBox').show();
	}

	if (global.priceReduction) {
		// $('#priceReduction').html('× 涨价幅度 ' + global.priceReduction).fadeIn();
		$('#priceReduction').html('× <div class="sp"><span>涨价幅度</span> ' + global.priceReduction+(quotationUnit?quotationUnit:'元')+'</div>').fadeIn();
	}

	// 报价准备阶段 禁用按钮
	if (_stage % 2 == 0) $('.auctionOffer').addClass('disabled');

	$.ajax({
		// url: top.config.AuctionHost + '/AuctionProjectPackageController/getOfferLogs.do',
		url: top.config.AuctionHost + '/AuctionQuoteController/record.do',
		data: {
			packageId: packageId,
			auctionType: global.auctionType,
			auctionModel: global.auctionModel,
			offerId: offerId
		},
		async: false,
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (res.success) {
				offerRoundsData = res.data ? res.data.offerRounds : {};

			} else layer.alert(res.message);
		}
	});

	var liData = [];

	/**
	 * 2/3 多轮竞卖
	 */
	if (!type) {
		// 当前轮次展示
		var cn_round = '第' + sectionToChinese(now_round) + '轮竞卖';
		$('.nowPrice').html(cn_round);
		if (global.auctionOffer.isEliminated != 1) {
			if (_stage != 0) {

				// 当前轮次展示
				$('.nowPrice').html(cn_round);
				$('.otherText').append('<span>第' + sectionToChinese(now_round) + '轮</span>');

				// 当前轮次信息展示
				// if (global.stage!=0 && (_stage % 2 === 0)) {
				// 	$('.noticeBox').html(cn_round + '间隔<span>' + global.intervalTime / 60000 + '</span>分钟后开始，开始时间<span class="yj_time">' + getStartTime(global.startTime, now_round) + '</span>');
				// } else {
				// 	$('.noticeBox').html('<center class="timeInval' + _stage + '">' + (global.stage!=0 && (_stage % 2 !== 0) ? (cn_round + '时长<span>' + auctionTimes[now_round] + '</span>分钟，结束时间<span class="yj_time">' + getStartTime(global.startTime, now_round) + '</span>') : ((_stage % 2 === 0) ? '' : (cn_round + '已结束'))) + '</center>');
				// }
			}
		}

		// auctionType = 2/3 = 总轮次 便利后渲染出底部总览
 
		for (var i = 0; i < global.auctionType; i++) {

			var rounddata = offerRoundsData ? (offerRoundsData[i] ? offerRoundsData[i] : null) : null;
			// offerRoundsData[i] 如果有 myOfferMoney 则 本轮已经报价
			// offerRoundsData[i-1] 为上一轮winPrice 或 global.biddingStartPrice;

			var _price = {};
			_price.lun = '第' + sectionToChinese(i + 1) + '轮竞卖';
			if (i < 1) {
				_price.jjqj = global.biddingStartPrice ?  global.biddingStartPrice: '暂无';		// jjqj
			} else if(i < now_round){
				if (offerRoundsData){
					if(offerRoundsData[i]) {
						_price.jjqj = rounddata.startPrice
					} else if (offerRoundsData[i - 1]) {
						_price.jjqj = offerRoundsData[i - 1].winPrice + '';
					}
				}
			}else{
				_price.jjqj = '暂无';	
			}
			if (rounddata == null) {
				_price.blbj = '暂无';		// blbj
				_price.blbjdx = '暂无';		// blbjdx
				_price.blbjzd = '暂无';			// blbjzd
			} else {
				_price.blbj = rounddata.myOfferMoney ? rounddata.myOfferMoney: '暂无';
				_price.blbjdx = rounddata.myOfferMoneyCN ? rounddata.myOfferMoneyCN : '暂无';
				_price.blbjzd = rounddata.winPrice ? rounddata.winPrice: '暂无';
			}

			liData.push({
				lun: '第' + sectionToChinese(i + 1) + '轮竞卖',
				jjqj: _price.jjqj,
				blbj: _price.blbj,
				blbjdx: _price.blbjdx,
				blbjzd: _price.blbjzd
			});

			// 显示当前轮次信息
			if (now_round - 1 == i) {
				$('p[data-field="rawPrice"]').html(_price.jjqj);
				$('p[data-field="myMinPrice"]').addClass('colorBlue').html(_price.blbj);
				if (_price.blbj != '暂无') $('.auctionOffer').addClass('disabled');
				$('p[data-field="moneyChinese"]').html(_price.blbjdx);
				$('.minPriceBox').remove();
			}
		}
	} else {
		/**
		 * 无线轮次
		 */
		// 当前轮次展示
		var cn_round = '第' + sectionToChinese(now_round) + '轮竞卖';
		$('.nowPrice').html(cn_round);
		if (global.auctionOffer.isEliminated != 1) {
			if (_stage != 0) {

				// 当前轮次展示
				$('.nowPrice').html(cn_round);
				$('.otherText').append('<span>第' + sectionToChinese(now_round) + '轮</span>');

				// 当前轮次信息展示
				// if (global.stage!=0 && (_stage % 2 === 0)) {
				// 	$('.noticeBox').html(cn_round + '间隔<span>' + global.intervalTime / 60000 + '</span>分钟后开始，开始时间<span class="yj_time">' + getStartTime(global.startTime, now_round) + '</span>');
				// } else {
				// 	$('.noticeBox').html('<center class="timeInval' + _stage + '">' + (global.stage!=0 && (_stage % 2 !== 0) ? (cn_round + '时长<span>' + auctionTimes[0] + '</span>分钟，结束时间<span class="yj_time">' + getStartTime(global.startTime, now_round) + '</span>') : ((_stage % 2 === 0) ? '' : (cn_round + '已结束'))) + '</center>');
				// }
			}
		}
		// auctionType = 2/3 = 总轮次 便利后渲染出底部总览
 
		for (var i = 0; i < now_round; i++) {
			var rounddata = offerRoundsData ? (offerRoundsData[i] ? offerRoundsData[i] : null) : null;
			// offerRoundsData[i] 如果有 myOfferMoney 则 本轮已经报价
			// offerRoundsData[i-1] 为上一轮winPrice 或 global.biddingStartPrice;

			var _price = {};
			_price.lun = '第' + sectionToChinese(i + 1) + '轮竞卖';
			if (i < 1) {
				_price.jjqj = global.biddingStartPrice + (quotationUnit?quotationUnit:'元');		// jjqj
			} else {
				if (offerRoundsData[i]) {
					_price.jjqj = rounddata.startPrice
				} else if (offerRoundsData[i - 1]) {
					_price.jjqj = offerRoundsData[i - 1].winPrice + '';
				}
			}
			if (rounddata == null) {
				_price.blbj = '暂无';		// blbj
				_price.blbjdx = '暂无';		// blbjdx
				_price.blbjzd = '暂无';			// blbjzd
			} else {
				_price.blbj = rounddata.myOfferMoney ? rounddata.myOfferMoney + (quotationUnit?quotationUnit:'元') : '暂无';
				_price.blbjdx = rounddata.myOfferMoneyCN ? rounddata.myOfferMoneyCN : '暂无';
				_price.blbjzd = rounddata.winPrice ? rounddata.winPrice +(quotationUnit?quotationUnit:'元') : '暂无';
			}

			liData.push({
				lun: '第' + sectionToChinese(i + 1) + '轮竞卖',
				jjqj: _price.jjqj,
				blbj: _price.blbj,
				blbjdx: _price.blbjdx,
				blbjzd: _price.blbjzd
			});

			// 显示当前轮次信息
			if (now_round - 1 == i) {
				$('p[data-field="rawPrice"]').html(_price.jjqj);
				$('p[data-field="myMinPrice"]').addClass('colorBlue').html(_price.blbj);
				if (_price.blbj != '暂无') $('.auctionOffer').addClass('disabled');
				$('p[data-field="moneyChinese"]').html(_price.blbjdx);
				$('.minPriceBox').remove();
			}
		}
	}
	liView(liData);
 
	$(".offerMoney").on('change', function () {
		if ($(this).val() != "") {
			// if (!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))) {
			// 	parent.layer.alert("报价必须大于零且允许保留小数点后面两位数");
			// 	$(this).val("");
			// 	return
			// };
			var b = $(this).val();
			$(this).val(b);
		};
	});
}

// 创建询比轮次竞卖数据
function liView(liData) {
	var now_round = parseInt(_stage / 2);
	for (var i = 0; i < liData.length; i++) {
		if (now_round == i + 1) {
			var tclass = 'active';
		} else {
			var tclass = "noActive";
		}
		if (i + 1 == now_round) {
			tclass = "active";
		} else if (i + 1 < now_round) {
			tclass = "";
		}
		var html = '<div class="item swiper-slide ' + tclass + ' ' + now_round + '">\
						<div class="info">\
							<h4>起价</h4>';
		html += '<p>' + liData[i].jjqj + '</p>';
		if(global.quotationType == 1){
			html += '<h4>本轮报价</h4>\
								<p>'+ liData[i].blbj + '</p>';
		}else{
			html += '<h4>本轮报价</h4>\
								<p>'+ liData[i].blbj + '（' + liData[i].blbjdx + '）' + '</p>';
		}
		

		if (i + 1 < now_round) {
			html += '<h4>最高报价</h4><p>' + liData[i].blbjzd + '</p>';
		} else {
			html += '';
		}

		html += '</div>\
						<div class="b">\
							<div class="dot"></div>\
							<div class="text">'+ liData[i].lun + '</div>\
						</div>\
					</div>';
		$('.place_box').append(html);
	}
	var swiper = new Swiper('.swiper-container', {
		slidesPerView: 3,
		centeredSlides: true,
	});
	swiper.swipeTo(now_round - 1);
	$('.place_box').on('click', '.dot', function () {
		var index = $(this).parents('.item').index();
		swiper.swipeTo(index);
	});
	swiper.init();

}


// 获取时间
function getStartTime(date, round) {
	date = new Date(date);
	if (round) {
		round_startTime = date.setMinutes(date.getMinutes() + Number(auctionTimes[round - 1]));
	} else {
		round_startTime = date.setMinutes(date.getMinutes() + Number(offerData.intervalTime));
	}
	return new Date(round_startTime).Format('yyyy-MM-dd hh:mm:ss');
}

// 轮询请求当前竞卖状态
function countDown() {
	if (global.stage==0) return $('#offerDetail .timeInval').html('竞卖已结束');
	// 未结束 - 开始轮询
	try {
		$.ajax({
			url: top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			async: false,
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			data: { packageId: packageId },
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function (res) {
				if (!res.success) return;
				//竞卖结束
				if (res.data.isEnd == 1 || res.data.stage==0) {
					return location.reload();
				}
				// 非当前轮次
				if (res.data.stage != _stage) {
					_stage = res.data.stage;
					if (global.auctionType > 1) {
						return location.reload();
					}
				}
				var day = parseInt(res.data.minute/60);
				var min = res.data.minute%60;
				// 设置小时
				$('#day').html(function () {
					if (day < 10) {
						var d = "0" + day;
						return d;
					} else {
						return day;
					}
				});
				// 设置分针
				$('#hour').html(function () {
					if (min < 10) {
						var m = "0" + min;
						return m;
					} else {
						return min;
					}
				});
				// 设置秒针
				$('#min').html(function () {
					if (res.data.second < 10) {
						var second = "0" + res.data.second;
						return second;
					} else {
						return res.data.second;
					}
				});
				$('.TimeText').html((res.data.stage == 2 ? '限时' : (global.auctionType < 2 ? '倒计时' : (_stage % 2 ? ('距离第' + sectionToChinese((_stage - 1) / 2) + '轮报价结束') : ('距离第' + sectionToChinese(_stage / 2) + '轮报价开始')))));
				// 继续执行countDown
				setTimeout(countDown, 950);
			}
		});
	} catch (e) { }
}

function reOfferMoneyShow(val){
	if(!val) val = $('.offerMoney').val()
	if(val=='') return false
	if(val) $('.submitButton').removeClass('disabled')
	multiple = (val * global.priceReduction).toFixed(2);
	let maxPriec = !isNaN(Number($('.minPriceV').html())) ? Number($('.minPriceV').html()) : Number($('.rawPrice').html())
	amountOfMoney = parseFloat(maxPriec + Number(multiple)).toFixed(2);
	
	var MaxLength = (amountOfMoney.toString()).length;
	if(MaxLength>14){
		parent.layer.alert('温馨提示: 报价超出最大阈值');
		$('.offerMoney').val('');
		$('#multiple').html('+0.00')
		$('#amountOfMoney').html('')
		$('.submitButton ').addClass('disabled')
		return false;
	}
	$('#multiple').html('+'+multiple)
	$('#amountOfMoney').html(amountOfMoney)
}

// 报价
function offer(e) {
	var offerMoney,maxPrice,offerRound,numBus;	
    if(global.auctionType <= 1){
		var this_tr = $(e.target).parent().parent();
		if(global.auctionType==0){
			maxPrice = Number($('.rawPrice').html());
			highPrice = Number($('.minPriceV').html());
			if(!isNaN(highPrice)){
				maxPrice = highPrice
			}
		}else{
			maxPrice = Number($('.rawPrice').html());
		};	
		var tMoney=Number($('.offerMoney').val())*global.priceReduction	
		offerMoney = tMoney + maxPrice;	
		numBus=Number($('.offerMoney').val())
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		maxPrice = Number($('.rawPrice').text());
		var tMoney=Number($('.offerMoney').val())*global.priceReduction		
		offerMoney = tMoney + maxPrice;	
		numBus=Number($('.offerMoney').val())
		offerRound =parseInt(_stage/2);
	}

	/**
	 * huzexuan
	 * 获取最终报价的总金额长度,超过则提示超过阈值
	 */
	var MaxPrice = parseFloat(offerMoney).toFixed();
	var MaxLength = (MaxPrice.toString()).length;
	if(MaxLength>14){
		parent.layer.alert('温馨提示: 报价超出最大阈值');
		return false;
	}

	
	if(isNaN(numBus) || !(/^\+?[1-9][0-9]*$/.test(numBus))) return layer.alert('温馨提示: 请输入正整数');	

	offerMoney = parseFloat(offerMoney).toFixed(2);
	console.log('报价:',$('.offerMoney').val(),offerMoney,offerMoney)
	layer.confirm('报价金额<span>' + offerMoney + '</span>'+(quotationUnit?quotationUnit:'元')+'，确定提交？', function (index) {
		layer.load(2);
		let params = {
			'packageId': packageId,
			'offerId': offerId,
			'offerMoney': offerMoney,
			'offerRound': offerRound,
			'packageDetailedId': global.packageDetails[0].id
		}
		if(global.priceReduction){
			params.multiple = Number($('.offerMoney').val())
			params.amountOfMoney = tMoney
		}
		$.post(top.config.AuctionHost + '/AuctionProjectPackageController/bidAuctionOffer', params, function (res) {
			layer.closeAll();
			if (res.success) {
				if(global.auctionType == 1){
					return location.reload();
				}else if(global.auctionType > 1){//多轮
					return location.reload();
				}
				res.data && getNewPriceOnce();

				if(global.priceReduction){
					$('.offerMoney').val('')
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
				}
			} else{
				layer.alert(res.message);
			}
			/*if(res.success){
				$(e.target).attr('disabled','disabled');
			}*/
		})
		layer.close(index);
	})

}

// 渲染数据(通用方法)
function showData(tabdata, type) {
 
	tabdata = tabdata || [];
	if(type=='noArray'){
		var mydata= [];
		mydata[0] = {
			'offerCode':tabdata.offerCode,
			'offerMoney':tabdata.myOfferMoney,
			'offerMoneyCN':tabdata.myOfferMoneyCN,
			'subDate':tabdata.subDate
		}
		$('#myOfferLogsTable').bootstrapTable('load',mydata);
	}
	/**
   * 按包件
   */
	if (global.auctionType <= 1 && global.auctionModel == 0) {

		/**
		 * 自由竞卖
		 */
		if (global.auctionType == 0) {
			if (tabdata.length > 0) {
				lowPrice = tabdata[0].offerMoney ? tabdata[0].offerMoney : null;
			}
			$('.minPrice').html('<font class="minPriceV">'+(tabdata[0] && (tabdata[0].offerMoney ? tabdata[0].offerMoney + '</font>' : null) || (global.rawPrice ? global.rawPrice + '' : null) || '暂无'));

			var mydata = [];
			// 取出供应商报价数组

			for(var j = 0,len=tabdata.length; j < len; j++) {
				if (!tabdata[j].supplierId) {
					mydata = $.grep(tabdata, function (n, i) {
						return !!n.isOwn;
					});
				}else if (tabdata[j].supplierId == supplierId) {
					mydata.push(tabdata[j]);
				}
			} 
			//  载入我的报价记录
			$('#myOfferLogsTable').bootstrapTable('load', mydata);
 
			//  载入所有报价记录
			$('#offerLogsTable').bootstrapTable('load', tabdata);

			// 我的最低报价&&本轮报价大写
			var myminoffer = mydata[0] || {};
			$('.myMinPrice').html(myminoffer.offerMoney ? myminoffer.offerMoney + "" : '' || '暂无报价');
			$('.moneyChinese').html(myminoffer.offerMoneyCN || myminoffer.moneyChinese || '暂无报价');
		}
		/*
		* 单轮竞卖
		*/
		if (global.auctionType == 1) {
			if(global.stage !=0){
				var mydata = tabdata;
				if(mydata && mydata[0] && mydata[0].myOfferMoney){
					$('.myMinPrice').html(mydata[0].myOfferMoney);
					$('.moneyChinese').html(mydata[0].offerMoneyCN);
				}
			}else{
				var mydata = [];
				tabdata.forEach(function (val) {
					if (!val.supplierId) {
						mydata = $.grep(tabdata, function (n, i) {
							return !!n.isOwn;
						});
						mydata[0].offerMoneyCN = val.moneyChinese;
					}
					if (val.supplierId == supplierId) {
						mydata.push(val);
					}
				});

				// 如果遍历出来 有报价则显示
				if (mydata.length > 0) {
					$('.myMinPrice').html(mydata[0].offerMoney + '');
					if (mydata[0].isOwn == 1) {
						$('.moneyChinese').html(mydata[0].moneyChinese);
					} else {
						$('.moneyChinese').html(mydata[0].offerMoneyCN);
					}
				}
			}
			$('#myOfferLogsTable').bootstrapTable('load', mydata);

		}
	}
}

// 定时获取最新报价数据
function getNewPrice() {
	$.ajax({
		url: top.config.AuctionHost + '/AuctionQuoteController/record.do',
		data: {
			packageId: packageId,
			auctionType: global.auctionType,
			auctionModel: global.auctionModel,
			offerId: offerId
		},
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (res.success) {
				if (res.data.offerItems) {
					showData(res.data.offerItems);
				}
				if (res.data.details) {
					showData(res.data.details);
				}
				
				if(global.priceReduction){
					reOfferMoneyShow()
				}
				setTimeout(getNewPrice, 5000); // 调用返回成功后在重复
			} else layer.alert(res.message);
		}
	});
}

// 定时获取最新报价数据
function getNewPriceOnce() {
	$.ajax({
		url: top.config.AuctionHost + '/AuctionQuoteController/record.do',
		data: {
			packageId: packageId,
			auctionType: global.auctionType,
			auctionModel: global.auctionModel,
			offerId: offerId
		},
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (res.success) {
				if (res.data.offerItems) {
					showData(res.data.offerItems);
				}else if (res.data.details) {
					showData(res.data.details);
				}else{
					showData(res.data,'noArray');
				}

			} else layer.alert(res.message);
		}
	});
}
 
function accMul(arg1, arg2) {
	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
	try { m += s1.split(".")[1].length } catch (e) { }
	try { m += s2.split(".")[1].length } catch (e) { }
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

 