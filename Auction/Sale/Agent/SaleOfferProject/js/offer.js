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
		//else layer.alert(res.message);
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
	
	if(data.isEliminated === false) layer.msg('当前轮次已被淘汰，不可参与报价！');
})

function countDown() {
	if (data.isEnd) return $('#offerDetail .timeInval').html('竞卖已结束');
	setTimeout(countDown, 900); //未结束就循环倒计时
	try {
		$.ajax({
			url:top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			data:{packageId: packageId},
			complete:function(xhr,textStatus,errorThrown){},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success:function(res){			
				if (!res.data.stage) return location.reload(); //竞卖结束
				if (res.data.stage != curStage){
					curStage = res.data.stage;
					if(data.auctionType > 1){
						return location.reload();
					}
				}
				
				$('#offerDetail .timeInval').html((res.data.stage == 2 ? '限时' : '倒计时') +
					'<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
			}
		});
	} catch (e) {}
}

//报价
function offer(e) {
	var offerMoney,maxPrice,offerRound;
    if(data.auctionType <= 1){
		var this_tr = $(e.target).parent().parent();
		offerMoney = Number(this_tr.find('input').val());
		maxPrice = Number(this_tr.find('td').eq(6).text());
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		offerMoney = Number(this_tab.find('input').val());
		maxPrice = Number(this_tab.find('.maxPrice').text());
		offerRound = this_tab.data('index');
	}
	if(isNaN(offerMoney) || !/^[1-9]\d*$/.test(offerMoney)) return layer.alert('请输入正整数');
	if (data.priceReduction) offerMoney =parseInt(offerMoney) ;	
	if (!isNaN(maxPrice) && maxPrice > 0 && offerMoney <= maxPrice) return layer.alert('报价金额不得小于当前最高报价');
	if (offerMoney < 0) return layer.alert('报价金额不得小于0');
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
				if(data.auctionType == 1)  $(e.target).css('display','none');//单轮
				else if(data.auctionType > 1){//多轮
					var pTr= $(e.target).parent().parent();
					pTr.siblings().find('input').attr('disabled','disabled');
					pTr.remove();
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
	$('#offerDetail').append(['<div class="col-md-12 no-padding">',
		'<table id="detailedsTable" class="table table-bordered"></table>',
		'</div>'
	].join(''));
	var col1 = [],col2 = [];
	col1.push({formatter:"getIndex",title:'序号',rowspan:2});
	col1.push({field:"detailedName",title:'商品名称',rowspan:2});
	col1.push({field:"brand",title:'品牌要求',rowspan:2});
	col1.push({field:"detailedVersion",title:'规格型号',rowspan:2});
	col1.push({field:"detailedCount",title:'数量',rowspan:2});
	col1.push({field:"detailedUnit",title:'单位',rowspan:2});
	if(data.auctionType == 0){
		col1.push({field:"minPrice",title:'最高报价单价(元)',rowspan:2});
		col1.push({field:"enterpriseName",title:'最高出价供应商',rowspan:2});
		col1.push({field:"isMin",title:'是否最高',rowspan:2});
	}
	col1.push({title:'我的报价',colspan:!data.isEnd?3:2});
	col2.push({field:"myMinPrice",title:'单价(元)',formatter:function(value, row, index){
			if(data.isEnd) return value;
			return '<input  class="offerMoney" value="'+(value||'')+'">'
		}
	});
	col2.push({field:"sumPrice",title:'合价(元)'});
	!data.isEnd && col2.push({title:'操作',formatter:function(value, row, index){
			if(data.isEnd) return value;
			return '<button class="btn btn-primary auctionOffer" id="'+row.id+'" ' + (data.auctionType == 1 && row.myMaxPrice && 'style="display:none"') + '>提交</button>'
		}});
	$('#detailedsTable').bootstrapTable({
		columns:[col1,col2],
		data: data.details
	});
	var colspan = data.auctionType == 0?(data.isEnd?11:12):(data.isEnd?8:9),countSpan = data.isEnd ? 2 : 3;
	$('#detailedsTable tbody').append([
		'<tr><td colspan="'+colspan+'" class="timeInval">'+(data.isEnd?'竞卖已结束':'')+'</td></tr>',
		'<tr>',
		'<td colspan="'+(colspan-countSpan)+'">您一共参加了 <span>0</span>项竞卖，目前有<span>0</span>项为最高报价</td>',
		'<td colspan="'+countSpan+'">总报价： <span>0</span> 元</td>',
		'</tr>'
	].join(''));
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
	var order = ['一', '二', '三', '四', '五'];
	$('#offerDetail').append(['<table class="table">',
		function () {
			var rounds = "",index=1,stages = 2;//3代表第一轮竞卖阶段;
			// getStartTime(round_startTime,data.firstAuctionTime);//第一轮结束时间
			for (var i = 0; i < data.auctionType; i++) {
				var cur_round = '第' + order[i] + '轮竞卖',c_r,round_data=data.offerlogs[i]||{};
				rounds += 
					(!data.isEnd && curStage <= stages ? ('<tr><td class="timeInval'+(stages++)+'">' + cur_round + '间隔<span>'+ data.intervalTime +
						'</span>分钟后开始，开始时间<span class="yj_time">'+ getStartTime(round_startTime,i) +'</span></td></tr>'):
						( stages++ && '')) +
					'<tr><td><table class="table table-bordered" data-index="'+(index++)+'">' +
					'<caption><center class="timeInval'+(stages && (c_r=stages++))+'">'+
					(!data.isEnd && curStage < c_r ? (cur_round + '时长<span>'+
						auctionTimes[i] + '</span>分钟，开始时间<span class="yj_time">' + 
						getStartTime(round_startTime) +'</span>'):(curStage == c_r ? '' : (cur_round + '已结束'))) +
					'</center></caption>' +
					'<tr><th colspan="4">' + cur_round + '</th></tr>' +
					'<tr><th width="25%">竞卖起价</th><td width="25%" class="maxPrice">' + 
					(round_data.rawPrice || ((curStage == c_r && data.offerlogs[i-1] && data.offerlogs[i-1].maxPrice)||'暂无')) + 
					'</td><td width="25%"></td><td width="25%"></td></tr>' +
					'<tr><th>本轮报价</th><td>' + 
					((data.isEnd || (!data.isEnd && (curStage == c_r && data.isEliminated === false || curStage > c_r))) ? (round_data.myOfferMoney || '暂无') :
					('<input  '+((curStage != c_r||round_data.myOfferMoney) && 'disabled')+' value="' + (round_data.myOfferMoney||'')+'">')) + '</td>'+
					'<th>本轮最高报价</th><td>' + (round_data.maxPrice || '暂无') +
					'</td></tr>' + 	
					'<tr><th>本轮报价大写</th><td>' + (round_data.moneyChinese || '暂无') + '</td><td></td><td></td></tr>' + 
					(!data.isEnd && (data.isEliminated || curStage == 3) && !round_data.myOfferMoney && curStage <= c_r ? '<tr><td colspan="4"><button class="btn btn-primary auctionOffer">提交</button></td></tr>':'') + 
					'</table></td></tr>';
			}
			return rounds.replace('timeInval'+curStage,'timeInval');
		}(),
		data.isEnd ? ('<tr><td colspan="4">本项目竞卖已结束！</td></tr><tr><td colspan="4">成功竞卖号为：' + data.successOfferCode +
		'。 竞卖价格为：' + (data.maxPrice==undefined?"0":data.maxPrice) + '元。</td></tr>') : '',
		'</table>'
	].join(''));
}

//定时刷新数据
function getLogs() {
	setTimeout(getLogs, 5000);
	$.post(top.config.AuctionHost + '/AuctionProjectPackageController/getHighDetails.do', {
		packageId: packageId,
		auctionType: data.auctionType,		
		//method:max
	}, function (res) {
		if (res.success) {
			if (res.data[0].offerMoney != Number($('.maxPrice').text().replace('元', '').replace('暂无', ''))) {
				refreshLogs(res.data);
			}
		} else layer.alert(res.message);
	})
}

function getIndex(value, row, index) {
	return index + 1;
}

//加载报价记录表
function refreshLogs(tabdata) {
	tabdata = tabdata || [];
	if(data.auctionType < 2){//按明细
		var offerItem=0,minItem=0,sumOffer=0;
		$.each(tabdata,function(i,v){
			if(!data.isEnd){
				var thisTds = $('#'+v.id).parent().parent().find('td');
				if(data.auctionType == 0) {
					thisTds.eq(6).text(v.minPrice);
					thisTds.eq(7).text(v.minUserName);
					thisTds.eq(8).text(v.isMin);
					thisTds.eq(10).text(v.sumPrice);
				}else{
					thisTds.eq(7).text(v.sumPrice);
				}
			}
			v.myMinPrice && ++offerItem && (sumOffer+=Number(v.sumPrice));
			v.isMin == "是" && ++minItem;
		})
		var spans = $('#detailedsTable tbody tr:last-child span');
		spans.eq(0).html(offerItem);
		spans.eq(1).html(minItem);
		spans.eq(2).html(sumOffer);
	}
	$('.fixed-table-loading').remove();
	$('.fixed-table-loading').remove();
}
