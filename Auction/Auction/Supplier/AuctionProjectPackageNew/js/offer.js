// 初始化全局变量
var global;										// 基础信息
var recordData;									// 当前报价信息
var packageId = $.getUrlParam('packageId');		// 包件ID
var supplierId = $.getUrlParam('supplierId');	// 供应商ID
var round_startTime;							// 当前轮次开始时间
var _stage;										// 当前轮次
var auctionTimes;								// 轮次间隔时间
var offerId;									// 竞低价采购报价ID
var lowPrice;									// 当前最低价格
var _roundData; 								// 所有轮次数据 多轮/无限
var _open = false;
var endTimeTips = '';
var isDfcm = false;//是否传媒自主采购项目
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
			_open = true;

			auctionTimes = [+global.firstAuctionTime, +global.secondAuctionTime, +global.thirdAuctionTime];
			_stage = global.stage; // 
			offerId = global.Offer ? global.Offer.id : global.auctionOffer.id;
			if(global.offerEndDate){
				endTimeTips = '<div class="endTimeTips">本次竞价于【'+global.offerEndDate+'】结束</div>'
			}
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
							// recordData = res.data && res.data.details ? res.data.details : {};
							// console.log('recordData:',recordData);
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
 * 0-竞价结束
 * 自由竞价： 		1-自由竞价阶段 2-自由竞价限时阶段
 * 多轮/单轮竞价：	3-第一轮竞价/单轮 4-第一轮竞价休息 5-第二轮竞价 6-第二轮竞价休息 7-第三轮竞价
 */

$(function () {
	isDfcm = checkPurchaserAgent(packageId);
	if(_open==false) return false;
	$("#auctionType").html(['自由竞价', '单轮竞价', '多轮竞价', '多轮竞价', '不限轮次'][global.auctionType]);
	$('p[data-field="packageNum"]').html(global.packageCode);
	$('p[data-field="offerCode"]').html(global.Offer ? global.Offer.offerCode : global.auctionOffer.offerCode);
	$('p[data-field="auctionModel"]').html(['按包件', '按明细'][global.auctionModel] || '');
	$('p[data-field="packageName"]').html(global.packageName);
	if (global.projectSource > 0) {
		$('p[data-field="packageName"]').html(global.packageName + '<span class="red">(重新竞价)</span>');
	}
	$('p[data-field="curUser"]').html(global.enterpriseName);

	if (global.priceReduction) {
		$('#ReductionText').html('降价<font style="font-size:12px; color:red">（降价金额= 报价倍数* 降价幅度）</font>');
		$('.offerMoney').attr('placeholder','输入报价倍数');
		$('.priceReductionComputed').fadeIn()
		$('.submitButton').addClass('disabled')

		$('.offerMoney').on({
			compositionend:function(){
				let val = $(this).val()
				if(!(/(^[1-9]\d*$)/.test(val))){
					$('.offerMoney').val('')
					$('#multiple').html('-0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				if(!val){
					$('#multiple').html('-0.00')
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
					$('#multiple').html('-0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
					return false
				}
				if(!val){
					$('#multiple').html('-0.00')
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
	 * 竞价方式: 0-自由竞价  1-单轮竞价, 2-多轮竞价中的2轮竞价, 3-多轮竞价中的3轮竞价, 4-不限轮次, 6-清单式竞价, 7-单项目竞价
	 */
	if (global.auctionType <= 1) {
		if (global.auctionModel == 0) {
			// (按包件)--单轮竞价、自由竞价
			view_package();
		} else if (global.auctionModel == 1) {
			// (按明细)--单轮竞价、自由竞价
			view_detailed();
		}
	} else if (global.auctionType == 2 || global.auctionType == 3) {
		view_duolun();
		if (global.priceReduction) {
			$('#priceReduction').html('× <div class="sp"><span>降价幅度</span> ' + global.priceReduction+'</div>').fadeIn();
			$('#priceUnit').hide();
		}
	} else if (global.auctionType == 4) {
		view_duolun('nolimit');
		if (global.priceReduction) {
			$('#priceReduction').html('× <div class="sp"><span>降价幅度</span> ' + global.priceReduction+'</div>').fadeIn();
			$('#priceUnit').hide();
		}
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
		$('.TimeText').html('<div class="error"></div>当前轮次已被淘汰，不可参与报价！'+endTimeTips);
		$('.inputBox').remove();
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

function reOfferMoneyShow(val){
	if(!val) val = $('.offerMoney').val()
	if(val=='') return false
	if((global.auctionType == 2 || global.auctionType == 3 || global.auctionType == 4) && $('p[data-field="myMinPrice"]').html().replace('元', '').replace('暂无', '')){
		$('.offerMoney').val('');
		return false
	};
	$('.submitButton').removeClass('disabled')
	multiple = (val * global.priceReduction).toFixed(2);
	let maxPriec;
	if($('.minPrice').text().replace('元','').replace('暂无', '') != '' && !isNaN(Number($('.minPrice').text().replace('元','').replace('暂无', '')))){
		maxPriec = Number($('.minPrice').text().replace('元',''))
	}else{
		maxPriec =  Number($('.rawPrice').text().replace('元',''))
	}
	// let maxPriec = !isNaN(Number($('.minPrice').text().replace('元','').replace('暂无', ''))) ? Number($('.minPrice').text().replace('元','')) : Number($('.rawPrice').text().replace('元',''))
	amountOfMoney = parseFloat(maxPriec - Number(multiple)).toFixed(2);
	
	var minPrice = Number($('.minPrice').text().replace('元',''));
	if(!minPrice) minPrice = Number($('.rawPrice').html());
	var bei = Math.floor(minPrice / global.priceReduction)
	if (bei < val) {
		parent.layer.alert("当前最大倍数不能超过" + bei + '倍');
		$('.offerMoney').val('')
		$('#multiple').html('-0.00')
		$('#amountOfMoney').html('')
		$('.submitButton ').addClass('disabled')
		return false
	};

	$('#multiple').html('-'+multiple)
	$('#amountOfMoney').html(amountOfMoney)
}

function getIndex(value, row, index) {
	return index + 1;
}

// 通知信息的创建
function addNotice(_type, _text) {
	$('.detailed_notice').append('<div class="item ' + _type + '">' + _text + '<span class="close">×</span></div>');
}

// (按包件)--单轮竞价、自由竞价
function view_package() {
	/**
	 * 自由竞价
	 */
	if (global.auctionType == 0) {
		$('#priceLog').show();
		$('#submitBox').show();
		$('.nowPrice').hide();
		// 包件基础信息
		$('p[data-field="rawPrice"]').html((global.biddingStartPrice || '暂无'));
		$('p[data-field="moneyChinese"]').html((global.moneyChinese || '暂无'));

		if (global.stage == 0) {
			$('.TimeText').html('<div class="success"></div>竞价已结束'+endTimeTips);
			$('.inputBox').hide();
			$('.timeShow').hide();
		} else {
			if (global.priceReduction) {
				$('#priceReduction').html('× <div class="sp"><span>降价幅度</span> ' + global.priceReduction+'</div>').fadeIn();
				$('#priceUnit').hide();
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
					title: "报价（元）",
					align: "center",
					halign: "center",
					formatter:function(value,row,index){
						if(value){
							return Number(value).toFixed(2);
						}
						
					}
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
					title: "报价（元）",
					align: "center",
				},
				{
					field: "subDate",
					title: "报价时间",
					align: "center",
				},
			]
		});
		if (global.stage != 0) {
			getNewPrice();
		}
	}
	else {
		//单轮竞价
		$('#submitBox').show();
		$('.nowPrice').hide();
		$('.priceLog').show();
		$('.offerLogsTableBox').hide();
		$('.minPriceBox').hide();
		$('.myOfferLogsTableBox').css('marginLeft','0px');
		// $('.rawPriceBox').hide();
 
		// 如果初始化的时候, 自己有报价
 
		$('.moneyChinese').html(global.moneyChinese || '暂无报价');

		$('.detailed_notice').show();

		addNotice('warning', '只有一次报价机会，提交报价后无法撤销，请慎重报价！');

		if (global.stage == 0) {
			$('.TimeText').html('<div class="success"></div>竞价已结束'+endTimeTips);
			$('.auctionOffer').addClass('disabled');
			$('.timeShow').hide();
		}

		// 单轮竞价,只有自己的一条数据
		if(global.stage!=0){
			if(recordData && recordData.myOfferMoney){
				$('.auctionOffer').addClass('disabled');
				// $('.offerMoney').val(recordData.myOfferMoney).prop('disabled', 'disabled');
				$('.inputBox').hide();
				// return false;
			}
		}else{
			if(global && global.offerItems){
				(global.offerItems).forEach(function (val) {
					if (val.supplierId == top.supplierId) {
						$('.auctionOffer').addClass('disabled');
						// $('.offerMoney').val(val.offerMoney).prop('disabled', 'disabled');
						$('.inputBox').hide();
						// return false;
					}
				});
			}else{
				$('.auctionOffer').addClass('disabled');
			}
		}



		// 包件基础信息
		$('p[data-field="rawPrice"]').html((global.biddingStartPrice || '暂无'));
		$('p[data-field="moneyChinese"]').html((global.moneyChinese || '暂无'));

		$('#myOfferLogsTable').bootstrapTable(
			{
				columns: [
					{ field: "offerCode", title: '竞买号', align: 'left', width:'200px' },
					{ field: "offerMoney", title: '报价（元）', align: 'right' },
					{ field: "offerMoneyCN", title: '报价大写', align: 'right',formatter: function(value,row){
						return "<span style='white-space: normal;'>"+value+"</span>";
					}},
					{ field: "subDate", title: '提交时间', align: 'right', width:'200px'  }
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


	// if (global.priceReduction != undefined) {
	// 	$(".offerMoney").on("input", function () {
	// 		var minPrice = $('.minPrice').html().substring(0, $('.minPrice').html().length - 1);
	// 		var bei = Math.floor(minPrice / global.priceReduction)
	// 		if ($(this).val() != "") {
	// 			// if (!(/^\+?[1-9][0-9]*$/.test($(this).val()))) {
	// 			// 	parent.layer.alert("必须为大于零的整数");
	// 			// 	$(this).val("")
	// 			// };
	// 			if (bei < $(this).val()) {
	// 				parent.layer.alert("当前最大倍数不能超过" + bei + '倍');
	// 				$('#multiple').html('-0.00')
	// 				$('#amountOfMoney').html('')
	// 				$('.submitButton ').addClass('disabled')
	// 			};
	// 		}
	// 		// var b = (parseInt(minPrice * 100000000 - $(this).val() * 100000000 * global.priceReduction) / 100000000).toFixed(top.prieNumber || 2);
	// 		// $(".myMinPrice").html(b)
	// 	})
	// } 

}

// (按明细)--单轮竞价、自由竞价
function view_detailed() {
	// 显示对应表格
	$('.detailed').show();
	$('.detailed_notice').html('');
	$('.nowPrice').hide();

	// 是否结束
	if (global.stage == 0) {
		$('.TimeText').html('<div class="success"></div>竞价已结束'+endTimeTips);
		$('.auctionOffer').addClass('disabled');
		$('.timeShow').hide();
	}

	// 是否需要上传报价文件
	if (global.isOfferFile == 0) {
		addNotice('danger', '请先上传报价文件，再进行报价！');
		addNotice('warning', '为了不影响您报价，请提前上传报价文件，若因为上传文件时间过长而导致报价失败，平台概不负责。');
	} else {
		$('#fileTablesBox').hide();
	}

	/**
	 * 拼接表格 Start
	 */
	var col1 = [
		{ formatter: "getIndex", title: '序号', width:'50px', rowspan: 2 },
		{ field: "detailedName", title: isDfcm?"物料名称":"商品名称", rowspan: 2 },
		{ field: "brand", title: '品牌要求', rowspan: 2, visible: isDfcm?false:true },
		// { field: "brand", title: '品牌要求', rowspan: 2, },
		{ field: "detailedVersion", title: '规格型号', rowspan: 2 },
		{field: "technology",title: "材料工艺",visible: isDfcm?true:false,rowspan: 2 },
		// {field: "technology",title: "材料工艺",rowspan: 2 },
		{
			field: "detailedCount", title: '数量', width:'100px',rowspan: 2,
			formatter: function (value, row, index) {
				return '<span class="count" id="count_' + row.id + '">' + row.detailedCount + '</span>'
			}
		},
		{ field: "detailedUnit", title: '单位', align:'center',rowspan: 2,width:'80px'},
		{
			field: "manner",
			title: "方式",
			visible: isDfcm?true:false,
			rowspan: 2,
			formatter: function (value, row, index) {
				//1  购买、2 租赁、3制作
				if(row.manner == '1'){
					return '购买'
				}else if(row.manner == '2'){
					return '租赁'
				}else if(row.manner == '3'){
					return '制作'
				}else{
					return '-'
				}
			}
		
		}

	];
	if (global.auctionType == 0) {
		col1.push({ field: "winPrice", title: '最低报价单价(元)', rowspan: 2,formatter: function(value,row,index){
				if(value){
					return "<span class='td_winPrice'>"+Number(value).toFixed(2)+"</span>"
				}else{
					return "<span class='td_winPrice'>-</span>"
				}
			}
		});
		/* if(global.auctionModel == 0){
			col1.push({
				field: "enterpriseName", title: '最低出价供应商', rowspan: 2, formatter: function (value, row, index) {
					if(!global.isShowName && row.enterpriseName || row.supplierName || row.offerCode){
						return "<span class='td_enterpriseName'>"+value+"</span>"
					}
				}
			});
		} */
		col1.push({
			field: "isWin", title: '是否最低', rowspan: 2, width:'80px', align:'center',formatter: function (value, row, index) {
				if(row.myOfferMoney){
					if (value == true || value == "是") {
						return '<span class="td_isWin"><font color="green">是</font></span>';
					}
					if (value == false || value == "否") {
						return '<span class="td_isWin"><font color="red">否</font></span>';
					}
				}else{
					
					return '<span class="td_isWin">-</span>';
				}

				
			}
		});
	}
	col1.push({ title: '我的报价', colspan: (global.stage!=0 ? 3 : 2) ,rowspan: 1});
	var col2 = [
		{
			field: "myOfferMoney", title: '单价(元)', width:'150px',formatter: function (value, row, index) {
				if (global.stage==0) return value;

				//自由竞价
				if (global.auctionType == 0) {
					return '<input  oninput="if(value.length>17)value=value.slice(0,17)" class="offerMoney form-control" value="' + (value || '') + '">';
					//单轮竞价
				} else if (global.auctionType == 1) {
					if (value) {
						return '<input  oninput="if(value.length>17)value=value.slice(0,17)" class="offerMoney form-control" disabled="disbled" value="' + (value || '') + '">';
					} else {
						return '<input  oninput="if(value.length>17)value=value.slice(0,17)" class="offerMoney form-control">';
					}
				}
			}
		}, {
			field: "sumPrice", title: '合价(元)',
			formatter: function (value, row, index) {
				if (row.offerMoney) {
					return '<span class="td_sumPrice" style="white-space: normal;">'+(+row.detailedCount * +row.offerMoney).toFixed(2)+'</span>';
				}
				if (row.myOfferMoney) {
					return '<span class="td_sumPrice" style="white-space: normal;">'+(+row.detailedCount * +row.myOfferMoney).toFixed(2)+'</span>';
				}
				if(!row.offerMoney && !row.myOfferMoney){
					return '<span class="td_sumPrice" style="white-space: normal;">-</span>';
				}
			}
		}
	];
	if (global.stage != 0) {
		col2.push({
			title: '操作',width:'80px', align:'center',formatter: function (value, row, index) {
				if (row.myOfferMoney && global.auctionType != 0) {
					return '<button class="btn btn-primary disabled auctionOffer" id="' + row.id + '" ' + (global.auctionType == 1 && row.myMinPrice && ' style="display:none"') + '>提交</button>'
				}
				return '<button class="btn btn-primary auctionOffer" id="' + row.id + '" ' + (global.auctionType == 1 && row.myMinPrice && ' style="display:none"') + '>提交</button>'
			}
		});
	}
	/**
	 * 拼接表格 End
	 */


	// 参与情况
	$('.textBox').html([
		'<p class="p1">您一共参加了 <span class="zong0">0</span>项竞价，',
		function () {
			if (global.auctionType != 1) {
				return '目前有<span class="zong1">0</span>项为最低报价</p>'
			}
		}(),
		'<p class="p2">总报价: <span class="zong2">0</span> 元</p>'
	].join(''));

	// 拼接新数组
	var d = [];
	var _joinNumber = 0;	// 已报价个数
	var _sumPrice = 0; 		// 报价总金额
	var _winer = 0; 		// 最低报价个数

	// 包件信息与报价信息合并
	(global.packageDetails).forEach(function (val) {
		var _cache = val;
		if (global.stage==0) {
			$.each(global.details, function (key, value) {
				if (key == _cache.id) {
					$.each(value, function (key, value) {
						_cache[key] = value;
					});
				}
			});
		} else {
			// auctionType 0-自由竞价  1-单轮竞价,
			$.each(recordData, function (key, value) {
				if (key == _cache.id) {
					$.each(value, function (k, v) {
						_cache[k] = v;
					});
				}
			});
 
		}
		if (_cache['myOfferMoney']) {
			_joinNumber++;
			_sumPrice += _cache['myOfferMoney'] * (+_cache.detailedCount)
		}
		if (_cache['isWin'] == true || _cache['isWin'] == '是') {
			_winer++;
		}
		d.push(_cache);
	});
 
	$('.zong0').html(_joinNumber);	// 已报价个数
	$('.zong1').html(_winer);	// 报价总金额
	$('.zong2').html(_sumPrice);	// 报价总金额
	/* var columns = new Array();
	columns = col1.concat(col2); */
	// 直接渲染到表格
	$('#detailedsTable').bootstrapTable('destroy').bootstrapTable({
		height:500,
		columns: [col1, col2],
		data: d
	});
 
	// 如果没结束 渲染
	if (global.stage!=0) {
		getNewPrice();
	}
 
}

// 当前轮起始价格
function getPreWinPrice(offerRoundsData, round) {
	if (round < 0 || !offerRoundsData) {
		return '暂无';
	}
	var currentData = offerRoundsData[round];
	if (currentData && typeof currentData.winPrice !== 'undefined' && currentData.winPrice !== null) {
		return currentData.winPrice;
	}
	return getPreWinPrice(offerRoundsData, round - 1);
}

/**
 * 多轮竞价
*/
function view_duolun(type) {
	// _stage 当前轮次
	var now_round = parseInt(_stage / 2);
 
	// 如果竞价结束
	if (global.stage == 0) {

		if(!global.isEliminated){
			$('.TimeText').html('<div class="success" style="margin-top:50px;"></div>');
			$('.TimeText').append('本项目竞价已结束<br/>'+endTimeTips);
		}else{
			$('.TimeText').html('<div class="error" style="margin-top:50px;"></div>');
			$('.TimeText').append('很抱歉,您已被淘汰<br/>'+endTimeTips);
		}
		if(global.isEnd == 1 && !global.isAllEliminated){
			$('.TimeText').append('<div style="margin-top: 15px; font-size: 14px; font-weight: 100;">成功竞买号为：<b>' + global.offerRounds[global.offerRounds.length - 1].winPriceOfferCode + '</b>。<br/>竞买价格为：<font color="red"><b>' + global.offerRounds[global.offerRounds.length - 1].winPrice + '元</b></font></div>');
		}
		if(global.isEnd == 0 && global.isEliminated==1){
			$('.TimeText').append('<div style="margin-top: 15px; font-size: 14px; font-weight: 100;">您的报价为：<font color="red"><b>' + global.Item[0].offerMoney + '元</b></font></div>');
		}
		$('.timeShow').hide();
 
		return false;
	} else {
		$('#submitBox').show();
		$('.detailed_notice').html('');
		$('.liTableBox').show();
		$('.curStageBox').show();
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
	 * 2/3 多轮竞价
	 */
	if (!type) {
		// 当前轮次展示
		var cn_round = '第' + sectionToChinese(now_round) + '轮竞价';
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
			_price.lun = '第' + sectionToChinese(i + 1) + '轮竞价';
			if (i < 1) {
				_price.jjqj = global.biddingStartPrice ?  global.biddingStartPrice + '元' : '暂无';		// jjqj
			} else if(i < now_round){
				if (offerRoundsData){
					if(offerRoundsData[i]) {
						_price.jjqj = rounddata.startPrice
					} else {
						_price.jjqj = getPreWinPrice(offerRoundsData, i - 1);
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
				_price.blbj = rounddata.myOfferMoney ? rounddata.myOfferMoney + '元' : '暂无';
				_price.blbjdx = rounddata.myOfferMoneyCN ? rounddata.myOfferMoneyCN : '暂无';
				_price.blbjzd = rounddata.winPrice ? rounddata.winPrice + '元' : '暂无';
			}

			liData.push({
				lun: '第' + sectionToChinese(i + 1) + '轮竞价',
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
		var cn_round = '第' + sectionToChinese(now_round) + '轮竞价';
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
			_price.lun = '第' + sectionToChinese(i + 1) + '轮竞价';
			if (i < 1) {
				_price.jjqj = global.biddingStartPrice ?  global.biddingStartPrice + '元' : '暂无';		// jjqj
			} else {
				if (offerRoundsData[i]) {
					_price.jjqj = rounddata.startPrice
				} else {
					_price.jjqj = getPreWinPrice(offerRoundsData, i - 1);
				}
			}
			if (rounddata == null) {
				_price.blbj = '暂无';		// blbj
				_price.blbjdx = '暂无';		// blbjdx
				_price.blbjzd = '暂无';			// blbjzd
			} else {
				_price.blbj = rounddata.myOfferMoney ? rounddata.myOfferMoney + '元' : '暂无';
				_price.blbjdx = rounddata.myOfferMoneyCN ? rounddata.myOfferMoneyCN : '暂无';
				_price.blbjzd = rounddata.winPrice ? rounddata.winPrice + '元' : '暂无';
			}

			liData.push({
				lun: '第' + sectionToChinese(i + 1) + '轮竞价',
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
 
}

// 创建询比轮次竞价数据
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
		html += '<h4>本轮报价</h4>\
							<p>'+ liData[i].blbj + '（' + liData[i].blbjdx + '）' + '</p>';

		if (i + 1 < now_round) {
			html += '<h4>最低报价</h4><p>' + liData[i].blbjzd + '</p>';
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

// 轮询请求当前竞价状态
function countDown() {
	if (global.stage==0) return $('#offerDetail .timeInval').html('竞价已结束');
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
				//竞价结束
				if (res.data.isEnd == 1 || res.data.stage==0 ) {
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

// 报价按钮点击事件
function offer(e) {
	var offerMoney;		// 报价金额
	var minPrice;		// 最低报价
	var offerRound;		// 当前轮次
	lowPrice = Number(lowPrice);
	// auctionType <= 1 自由/单轮
	// auctionModel == 0 按包件
	if (global.auctionType <= 1 && global.auctionModel == 0) {
		offerMoney = Number($('.offerMoney').val());
		if (isNaN(offerMoney) || !/(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/.test(offerMoney)) return layer.alert('请输入最多两位小数的正数金额');

		minPrice = Number($('p[data-field="minPrice"]').html().replace('<span>元</span>', '').replace('暂无', '')) || global.biddingStartPrice || 0;
		
		if (global.priceReduction) {
			if (isNaN(offerMoney) || !/^\+?[1-9][0-9]*$/.test(offerMoney)) {
				return layer.alert('请输入大于零的整数倍数');
			}
			var bei = Math.floor(minPrice / global.priceReduction);
			if (offerMoney > bei) {
				return layer.alert('当前最大倍数不能超过' + bei + '倍');
			}
			offerMoney = (accMul(minPrice, 1000000) - accMul(offerMoney * global.priceReduction, 1000000)) / 1000000;
			offerMoney = offerMoney.toFixed(2); // 四舍五入去除浮点小数
		}
	} else if (global.auctionType <= 1 && global.auctionModel == 1) {
		// auctionType <= 1 自由/单轮
		// auctionModel == 1 按明细
		var this_tr = $(e.target).parent().parent();
		if(this_tr.find('input').val()==''){
			return layer.alert('报价金额未填写或不符合要求');
		}else{
			offerMoney = Number(this_tr.find('input').val());
		}
		
		minPrice = Number(this_tr.find('td').find('.td_winPrice').text()) || global.biddingStartPrice || 0;
		if(global.auctionType != 1){
			if(!isNaN(this_tr.find('td').find('.td_winPrice').text())){
				lowPrice = Number(this_tr.find('td').find('.td_winPrice').text()) || global.biddingStartPrice || 0;
			}else{
				lowPrice = Infinity;
			}
		}
	} else {
		if(global.auctionType == 2 || global.auctionType == 3 || global.auctionType == 4){
			// 多轮竞价
			offerMoney = Number($('.offerMoney').val());
			lowPrice = Number($('.rawPrice').text().replace('元',''));
			minPrice = lowPrice || global.biddingStartPrice || 0;
			offerRound = parseInt(_stage / 2);
			
			if (global.priceReduction) {
				if (isNaN(offerMoney) || !/^\+?[1-9][0-9]*$/.test(offerMoney)) {
					return layer.alert('请输入大于零的整数倍数');
				}
				var bei = Math.floor(minPrice / global.priceReduction);
				if (offerMoney > bei) {
					return layer.alert('当前最大倍数不能超过' + bei + '倍');
				}
				offerMoney = (accMul(minPrice, 1000000) - accMul(offerMoney * global.priceReduction, 1000000)) / 1000000;
				offerMoney = offerMoney.toFixed(2); // 四舍五入去除浮点小数
			}
		}
		
	};

	if (isNaN(offerMoney) || !/(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/.test(offerMoney)) return layer.alert('请输入最多两位小数的正数金额');
 
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

	offerMoney = parseFloat(offerMoney).toFixed(2);
	if (offerMoney <= 0) return layer.alert('温馨提示: 报价金额不能为0或不符合要求');
	if(lowPrice && lowPrice != 0){
		if (offerMoney >= lowPrice) return layer.alert('温馨提示: 报价金额不得大于或等于当前最低价格');
	}
	layer.confirm('报价金额<span>' + offerMoney + '</span>元，确定提交？', function (index) {
		layer.load(2);
		let params = {
			'packageId': packageId,
			'offerId': offerId,
			'offerMoney': offerMoney,
			'offerRound': offerRound,
			'packageDetailedId': e.target.id
		}
 
		if(global.priceReduction){
			params.multiple = Number($('.offerMoney').val())
			params.amountOfMoney = (accMul(Number($('.offerMoney').val()) * global.priceReduction,1000000))/1000000
		}
		$.post(top.config.AuctionHost + '/AuctionProjectPackageController/bidAuctionOffer', params, function (res) {
			layer.closeAll();
			if (res.success) {
				if (global.auctionType == 1) {
					//单轮中,报价完毕刷新
					return location.reload();
				} else if (global.auctionType > 1) {
					//多轮
					return location.reload();
				}
				if(global.auctionModel == 1){
					$('#detailedsTable').bootstrapTable('resetView');
				}
				// 如果成功提交则刷新数据 否则只提示错误
				res.data && showData(res.data, 'offer');

				if(global.priceReduction){
					$('.offerMoney').val('')
					$('#multiple').html('+0.00')
					$('#amountOfMoney').html('')
					$('.submitButton ').addClass('disabled')
				}

			} else {
				layer.alert(res.message);
			}

		})
		layer.close(index);
	})
}

// 渲染数据(通用方法)
function showData(tabdata, type) {
 
	tabdata = tabdata || [];
	/**
   * 按包件
   */
	if (global.auctionType <= 1 && global.auctionModel == 0) {

		/**
		 * 自由竞价
		 */
		if (global.auctionType == 0) {
			if (tabdata.length > 0) {
				lowPrice = tabdata[0].offerMoney ? tabdata[0].offerMoney : null;
 
			}
			$('.minPrice').html((tabdata[0] && (tabdata[0].offerMoney ? tabdata[0].offerMoney : null) || (global.rawPrice ? (Number(global.rawPrice).toFixed(2))  : null) || '暂无'));

			var mydata = [];
			// 取出供应商报价数组
			tabdata.forEach(function (val) {
				if (!val.supplierId) {
					mydata = $.grep(tabdata, function (n, i) {
						return !!n.isOwn;
					});
				}else if (val.supplierId == supplierId) {
					mydata.push(val);
				}
			});
			//  载入我的报价记录
			$('#myOfferLogsTable').bootstrapTable('load', mydata);
 
			//  载入所有报价记录
			$('#offerLogsTable').bootstrapTable('load', tabdata);

			// 我的最低报价&&本轮报价大写
			var myminoffer = mydata[0] || {};
			if(myminoffer && myminoffer.offerMoney){
				$('.myMinPrice').html(Number(myminoffer.offerMoney).toFixed(2));
			}else{
				$('.myMinPrice').html('暂无报价');
			}
			$('.moneyChinese').html(myminoffer.offerMoneyCN || myminoffer.moneyChinese || '暂无报价');
		}
		/*
		* 单轮竞价
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
					$('.myMinPrice').html(mydata[0].offerMoney);
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
	/**
   * 按明细
   */
	if (global.auctionType <= 1 && global.auctionModel == 1) {
 
		var offerItem = 0;	// 参与个数
		var minItem = 0;	// 最低报价数
		var sumOffer = 0;	// 合计报价金额
		/**
		 * 自由竞价
		 */
		if (global.auctionType == 0) {
			// type ='offer' 是 提交价格的标识
			$.each(tabdata, function (i, v) {
				if (type == 'offer') {
					if(v.minPrice){
						var thisTds = $('#count_' + v.id).parent().parent().find('td');
						if (v.isMin == '是') { ++minItem }
						thisTds.find('.td_winPrice').text(Number(v.minPrice).toFixed(2));
						thisTds.find('.td_enterpriseName').text(!global.isShowName && v.enterpriseName || v.supplierName || v.offerCode);
						
						if(v.myMinPrice){
							thisTds.find('.td_isWin').html(v.isMin == '是' ? '<font color="green">是</font>' : (v.isMin == '否' ? '<font color="red">否</font>' : '-'));
							var count = +$('#count_' + v.id).text();
							var sumPrice = v.myMinPrice * count || 0;
							thisTds.find('.td_sumPrice').text(sumPrice.toFixed(2) || '-'); // 合价
						}
					}
				} else {
					var thisTds = $('#count_' + i).parent().parent().find('td');
					thisTds.find('.td_winPrice').text(Number(v.winPrice).toFixed(2));
					thisTds.find('.td_enterpriseName').text(!global.isShowName && v.enterpriseName || v.supplierName || v.offerCode);
					if(v.myOfferMoney){
						thisTds.find('.td_isWin').html(v.isWin == true ? '<font color="green">是</font>' : (v.isWin == false ? '<font color="red">否</font>' : '-'));
						if (v.isWin) { ++minItem }
						var count = +$('#count_' + i).text();
						var sumPrice = v.myOfferMoney * count || 0;
						thisTds.find('.td_sumPrice').text(sumPrice.toFixed(2) || '-'); // 合价
					}

					// if(v.myOfferMoney){
					// 	thisTds.eq(9).find('.offerMoney').val(v.myOfferMoney || '');
					// }
				}

				if (v.myOfferMoney) {
					++offerItem;
				} else if (v.myMinPrice) {
					++offerItem;
				} else if (v.offerMoney) {
					++offerItem;
				}
				sumOffer += (Number(sumPrice) || 0);

			});
		}
		/**
		 * 单轮竞价
		 */
		if (global.auctionType == 1) {
			$.each(tabdata, function (i, v) {
				if (type == 'offer') {
					var thisTds = $('#count_' + v.id).parent().parent().find('td');
					if (v.isMin == '是') { ++minItem }
					var count = +$('#count_' + v.id).text();
					var sumPrice = +v.myMinPrice * +count;
					thisTds.find('.td_enterpriseName').text(sumPrice || 0);
				} else {
					var thisTds = $('#count_' + i).parent().parent().find('td');
					$('#' + v.id).addClass('disabled');
					$('#' + v.id).parent().parent().find('.offerMoney').val(v.offerMoney).prop('disabled', 'disabled');
					if (v.isWin) { ++minItem }
					if(v.myOfferMoney){
						var count = +$('#count_' + i).text();
						var sumPrice = +v.myOfferMoney * +count;
						thisTds.find('.td_enterpriseName').text(sumPrice.toFixed(2) || 0);
					}

				}

				if (v.myOfferMoney) {
					++offerItem;
				} else if (v.myMinPrice) {
					++offerItem;
				} else if (v.offerMoney) {
					++offerItem;
				}
				sumOffer += (Number(sumPrice) || 0);


			});
		}
 
		$(".zong0").html(offerItem);
		$(".zong1").html(minItem);
		$(".zong2").html(sumOffer.toFixed(2));
		if(global.auctionModel == 1){
			$('#detailedsTable').bootstrapTable('resetView');
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

function accMul(arg1, arg2) {
	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
	try { m += s1.split(".")[1].length } catch (e) { }
	try { m += s2.split(".")[1].length } catch (e) { }
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}