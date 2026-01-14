var data, packageId = location.hash.substr(1),round_startTime,curStage,auctionTimes;
$.ajax({
	url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionHighDetail.do',
	data: {
		id: packageId
	},
	async: false,
	success: function (res) {		
		if (res.success) {
			data = res.data;			
			auctionTimes = [data.firstAuctionTime,data.secondAuctionTime,data.thirdAuctionTime];
			curStage = data.stage;
		}
	}
});

$(function () {
	$('#offerInfo td').each(function (index, item) {
		switch (index) {
			case 0:
				$(this).find('h1').html(['自由竞卖', '单轮竞卖'][data.auctionType] || '多轮竞卖');
				break;
			case 4:
				$(this).html(data.auctionOffer.offerCode);
				break;
			default:
				$(this).data('field') && $(this).html(data[$(this).data('field')] || '');
				break;
		}
	})
    if (data.auctionType <= 1 ) {
		//(按明细)--单轮竞卖、自由竞卖
		view_1();
	} else if (data.auctionType > 1) {
		//多轮竞卖
		view_3();
	}
	!data.isEnd && countDown(); //倒计时
	$('.auctionOffer').click(offer);
	if(!data.isEnd) data.auctionOffer.isEliminated && layer.msg('当前轮次已被淘汰，不可参与报价！');
})

function countDown() {
	if (data.isEnd) return $('#offerDetail .timeInval').html('竞卖已结束');
	setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url:top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			data:{packageId: packageId},
			//complete:function(xhr,textStatus,errorThrown){},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success:function(res){			
				if (!res.success) return;
				if (!res.data.stage) return location.reload(); //竞卖结束
				if (res.data.stage != curStage){
					curStage = res.data.stage;
					if(data.auctionType > 1){
						return location.reload();
					}
				}				
				$('#offerDetail .timeInval').html((res.data.stage == 2 ? '限时' : (data.auctionType < 2 ? '倒计时':
						(curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束剩余') : 
							('距离第' + sectionToChinese(curStage / 2) + '轮报价开始剩余')))) +
					'<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
			}
		});
	} catch (e) {}
}

//报价
function offer(e) {
	var offerMoney,maxPrice,offerRound,numBus;	
    if(data.auctionType <= 1){
		var this_tr = $(e.target).parent().parent();
		if(data.auctionType==0){
			maxPrice = Number(this_tr.find('td').eq(7).text());
		}else{
			maxPrice = Number(this_tr.find('td').eq(6).text());
		};	
		var tMoney=Number(this_tr.find('input').val())*data.priceReduction	
		offerMoney=(accMul(tMoney,1000000)+accMul(maxPrice,1000000))/1000000;	
		numBus=Number(this_tr.find('input').val())
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		maxPrice = Number(this_tab.find('.maxPrice').text());
		var tMoney=Number(this_tab.find('input').val())*data.priceReduction		
		offerMoney=(accMul(tMoney,1000000)+accMul(maxPrice,1000000))/1000000;	
		numBus=Number(this_tab.find('input').val())
		offerRound =parseInt(curStage/2);
	}	
	
	if(isNaN(numBus) || !(/^\+?[1-9][0-9]*$/.test(numBus))) return layer.alert('请输入正整数');	
//	if (data.priceReduction) offerMoney =parseInt(offerMoney) ;	
//	if (!isNaN(maxPrice) && maxPrice > 0 && offerMoney <= maxPrice) return layer.alert('报价金额不得小于当前最高报价');
//	if (offerMoney < 0) return layer.alert('报价金额不得小于0');	
	layer.confirm('报价金额<span>' + offerMoney + '</span>元，确定提交？', function (index) {
		layer.load(2);
		$.post(top.config.AuctionHost + '/AuctionProjectPackageController/auctionHighOffer.do', {
			packageId: packageId,
			offerId: data.auctionOffer.id,
			offerMoney: offerMoney,
			offerRound: offerRound,
			packageDetailedId: e.target.id
		}, function (res) {
			layer.closeAll();
			if (res.success) {
				if(data.auctionType == 1) $(e.target).css('display','none');//单轮
				else if(data.auctionType > 1){//多轮
					return location.reload();
				}
			} else layer.alert(res.message);
			res.data && refreshLogs(res.data);
			/*if(res.success){
				$(e.target).attr('disabled','disabled');
			}*/
		})
		layer.close(index);
	})

}
//（按明细）--单轮、自由
function view_1() {
	$('#offerDetail').append(['<div class="no-padding">',
		'<table id="detailedsTable" class="table table-bordered"></table>',
		'</div>'
	].join(''));
	var col1 = [],col2 = [];
	col1.push({formatter:"getIndex",title:'序号',rowspan:2,width: '50'});
	col1.push({field:"detailedName",title:'商品名称',rowspan:2});
	col1.push({field:"brand",title:'品牌要求',rowspan:2});
	col1.push({field:"detailedVersion",title:'规格型号',rowspan:2});
	col1.push({field:"detailedCount",title:'数量',rowspan:2});
	col1.push({field:"detailedUnit",title:'单位',rowspan:2});
	col1.push({field:"rawPrice",title:'起始价(元)',rowspan:2,formatter:function(values, row, index){
			return data.rawPrice;
			},
	});
		if(data.auctionType == 0){
			col1.push({field:"maxPrice",title:'最高报价(元)',rowspan:2,formatter:function(values, row, index){
				return values||data.rawPrice||'';
				},
			});
//			col1.push({field:"enterpriseName",title:'最高出价供应商',rowspan:2,formatter:function(valuel, row, index){
//				return  row.enterpriseName
//			}});
			col1.push({field:"isMax",title:'是否最高',rowspan:2});			
		}	
	if(!data.isEnd){
	col1.push({title:'我的报价',colspan:!data.isEnd?4:2});
	col2.push({field:"myMaxPrice",title:'涨价幅度',width: '150',formatter:function(valuel, row, index){
			if(data.isEnd) return ((valuel-data.rawPrice)/data.priceReduction||'')+'*'+data.priceReduction;
			return '<input  style="width:60px;text-align:right" class="offerMoney" '+ (data.auctionType==1?'value="'+((valuel-data.rawPrice)/data.priceReduction||'')+'':'') +'">*'+data.priceReduction
		}
	});
	col2.push({field:"myMaxPrice",title:'我的报价(元)',width: '150',formatter:function(valuel, row, index){
			if(data.isEnd) return valuel;
			return valuel
		}
	});
	}else{
		col1.push({field:"myMaxPrice",title:'我的报价(元)',width: '150',formatter:function(valuel, row, index){
			if(data.isEnd) return valuel;
			return valuel
		}
	});
	}
	
//	col2.push({field:"sumPrice",title:'合价(元)'});
	!data.isEnd && col2.push({field:"cz",title:'操作',formatter:function(valuem, row, index){
			if(data.isEnd) return valuem;			
			return '<button id='+ row.id +' class="btn btn-primary auctionOffer"  '  + (data.auctionType == 1 && row.myMaxPrice && 'style="display:none"') + '>提交</button>'
	}});
	$('#detailedsTable').bootstrapTable({
		columns:[col1,col2],
		data: data.details
	});
	if(data.auctionType == 0){
		var colspan =data.isEnd?12:14,countSpan = data.isEnd ? 2 : 3;
	}else{
		var colspan =data.isEnd?10:12,countSpan = data.isEnd ? 2 : 3;
	}
	
	$('#detailedsTable tbody').append([
		'<tr><td colspan="'+colspan+'" class="timeInval">'+(data.isEnd?'竞卖已结束':'')+'</td></tr>',
		'<tr style="'+ (data.auctionType==0?'':'display:none' )+'">',
		'<td colspan="'+colspan+'">您一共参加了 <span>0</span>项竞卖，目前有<span>0</span>项为最高报价</td>',
		//'<td colspan="'+countSpan+'"></td>',
		'</tr>'
	].join(''));
	$(".offerMoney").on('change',function(){
		if(data.auctionType == 0) {				
			$(this).eq(11).text($(this).val());
		}else{
			$(this).eq(8).text($(this).val());
		}
	})
	refreshLogs(data.details);
	!data.isEnd && data.auctionType == 0 && getLogs();
}

function getStartTime(date,round){
	date = new Date(date);
	if(!round_startTime) round_startTime = new Date(data.curStageEndTime);
	else{
		if(round){
			round_startTime = date.setMinutes(date.getMinutes()+Number(auctionTimes[round-1]));
		}else{
			round_startTime = date.setMinutes(date.getMinutes()+Number(data.intervalTime));
		}
	}
	return new Date(round_startTime).Format('yyyy-MM-dd hh:mm:ss');
}

//多轮竞卖
function view_3() {
	var order = ['零','一', '二', '三', '四', '五'];
	$('#offerDetail').append(['<table class="table">',
		function () {
			var rounds = "",index=1,stages = 2;//3代表第一轮竞卖阶段;
			// getStartTime(round_startTime,data.firstAuctionTime);//第一轮结束时间;	
		    if(data.auctionOffer.isEliminated!=1){
				if(curStage!==0){
					var cur_round = '第' + order[parseInt(curStage/2)] + '轮竞卖',c_r,round_data=data.offerlogs[parseInt(curStage/2)-1]||{};				
					rounds += 
					    '<tr><th style="text-align:center;font-size: 24px !important;font-weight: bold;">共' + (order[data.auctionType]=="二"?'两':order[data.auctionType]) + '轮竞卖</th>'+
						(!data.isEnd && curStage <= stages ? ('<tr><td class="timeInval'+curStage+'">' + cur_round + '间隔<span>'+ data.intervalTime +
							'</span>分钟后开始，开始时间<span class="yj_time">'+ getStartTime(round_startTime,i+1) +'</span></td></tr>'):
							( stages++ && '')) +
						'<tr><td><table class="table table-bordered" data-index="'+(index++)+'">' +
						'<caption><center class="timeInval'+curStage+'">'+
						(!data.isEnd && (curStage%2!==0) ? (cur_round + '时长<span>'+
							auctionTimes[parseInt(curStage/2)-1] + '</span>分钟，开始时间<span class="yj_time">' + 
							getStartTime(round_startTime) +'</span>'):((curStage%2===0) ? '' : (cur_round + '已结束'))) +
						'</center></caption>' +
						'<tr><th colspan="4">' + cur_round + '</th></tr>' +
						'<tr><th width="25%">竞卖起价</th><td width="25%" class="maxPrice">' + 
						(round_data.rawPrice || ((data.offerlogs[parseInt(curStage/2)-2] && data.offerlogs[parseInt(curStage/2)-2].maxPrice)||'暂无')) + 
						'</td><td width="25%"></td><td width="25%"></td></tr>' +
						'<tr><th>涨价幅度</th><td>' + 					
						'<input style="width:80px;text-align:right"  '+(round_data.myOfferMoney&& 'disabled')+' value="' + ((round_data.myOfferMoney-(round_data.rawPrice || (( data.offerlogs[parseInt(curStage/2)-2] && data.offerlogs[parseInt(curStage/2)-2].maxPrice))))/data.priceReduction||'')+'">*'+data.priceReduction+'</td>'+
						'<th>本轮报价</th><td>' + (round_data.myOfferMoney || '暂无') +
						'</td></tr>' +						
						'<tr><th>本轮报价大写</th><td>' + (round_data.moneyChinese || '暂无') + '</td><td></td><td></td></tr>' + 
						(!data.isEnd &&!round_data.myOfferMoney&&(curStage%2!==0)? '<tr><td colspan="4"><button class="btn btn-primary auctionOffer">提交</button></td></tr>':'') + 
						'</table></td></tr>'+
						'<table class="table table-bordered" id="liTable">'+
						'</table>';
				}else{
					rounds +='<table class="table table-bordered" id="liTable">'+
							'</table>';
					
				}
			}else{
				rounds +='<table class="table table-bordered" id="liTable">'+
							'</table>';
			}
			
			return rounds.replace('timeInval'+curStage,'timeInval');
		}(),
		data.isEnd ? ('<tr><td colspan="4">本项目竞卖已结束！</td></tr><tr><td colspan="4">成功竞卖号为：' + data.successOfferCode +
		'。 竞卖价格为：' + (data.maxPrice==undefined?"0":data.maxPrice) + '元。</td></tr>') : '',
		'</table>'
	].join(''));
	var liData=[]
	for (var i = 0; i < data.auctionType; i++) {
		var round_data=data.offerlogs[i]||{};	
		liData.push({
			lun:'第' + sectionToChinese(i+1) + '轮竞卖',
			jjqj:(round_data.rawPrice || ((data.offerlogs[i-1] && data.offerlogs[i-1].minPrice)||'暂无')),
			blbj:(round_data.myOfferMoney || '暂无'),
			blbjdx:(round_data.moneyChinese || '暂无'),
			blbjzd:(round_data.maxPrice || '暂无')
		})
	}
	liView(liData);
}
//多轮报价的历史记录
function liView(liData){
	$('#liTable').bootstrapTable({
		columns:[
		{field:"lun",title:'轮次'},
		{field:"jjqj",title:'竞卖起价(元)'},
		{field:"blbj",title:'本轮报价(元)'},
		{field:"blbjdx",title:'本轮报价大写'},
		{field:"blbjzd",title:'本轮最高报价(元)'},
		],
	
	});
//	if(data.auctionOffer.isEliminated!=1){
//		if(curStage!==0){
//			$('#liTable').bootstrapTable("hideColumn", 'blbjzd'); //隐藏分值
//		}else{
//			$('#liTable').bootstrapTable("showColumn", 'show'); //隐藏分值
//		}
//	}else{
//		$('#liTable').bootstrapTable("showColumn", 'show'); //隐藏分值
//	}
	$('#liTable').bootstrapTable("load", liData); //重载数据
	$('.fixed-table-loading').hide();
}
//定时刷新数据
function getLogs() {
	setTimeout(getLogs, 5000);
	$.ajax({
		url:top.config.AuctionHost + '/AuctionProjectPackageController/getHighDetails.do',
		data:{
			packageId: packageId,
		    auctionType: data.auctionType,		
		},
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);
	    },
		success:function(res){			
			if (res.success) {
				if (res.data[0].offerMoney != Number($('.maxPrice').text().replace('元', '').replace('暂无', ''))) {
					refreshLogs(res.data);
				}
			} else layer.alert(res.message);
		}
	});
}

function getIndex(value, row, index) {
	return index + 1;
}

//加载报价记录表
function refreshLogs(tabdata) {
	tabdata = tabdata || [];
	if(data.auctionType < 2){//按明细
		var offerItem=0,maxItem=0,sumOffer=0;
		$.each(tabdata,function(i,v){
			if(!data.isEnd){
				var thisTds = $('#'+v.id).parent().parent().find('td');
				
				if(data.auctionType == 0) {
					thisTds.eq(7).text(v.maxPrice);
					//thisTds.eq(7).text(v.enterpriseName);
					thisTds.eq(8).text(v.isMax);
					thisTds.eq(10).text(v.myMaxPrice);
					//thisTds.eq(12).text(v.sumPrice);
				}
				else{
					thisTds.eq(8).text(v.myMaxPrice);
					//thisTds.eq(9).text(v.sumPrice);
				}
			}
			v.myMaxPrice && ++offerItem && (sumOffer+=Number(v.sumPrice));
			v.isMax == "是" && ++maxItem;
		})
		var spans = $('#detailedsTable tbody tr:last-child span');
		spans.eq(0).html(offerItem);
		spans.eq(1).html(maxItem);
		spans.eq(2).html(sumOffer);
	}
	$('.fixed-table-loading').remove();
	$('.fixed-table-loading').remove();
}
function accMul(arg1,arg2)
{
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}