var data, packageId = location.hash.substr(1),round_startTime,curStage,auctionTimes,quotationUnit;
$.ajax({
	url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionHighDetail.do',
	data: {
		id: packageId
	},
	async: false,
	success: function (res) {		
		if (res.success) {
			data = res.data;
			quotationUnit = data.quotationUnit;
			auctionTimes = [data.firstAuctionTime,data.secondAuctionTime,data.thirdAuctionTime];
			curStage = data.stage;
		}
	}
});

$(function () {
	$('#offerInfo td').each(function (index, item) {
		switch (index) {
			case 0:
				$(this).find('h1').html(['单轮竞卖']);
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
			maxPrice = Number(this_tr.find('td').eq(8).text());
		}else{
			maxPrice = Number(this_tr.find('td').eq(8).text());
		};	
		// var tMoney=Number(this_tr.find('input').val())*data.priceReduction	
		offerMoney=Number(this_tr.find('input').val());	
		numBus=Number(this_tr.find('input').val());
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		maxPrice =Number(this_tr.find('td').eq(8).text());
		// var tMoney=Number(this_tab.find('input').val())*data.priceReduction		
		offerMoney=Number(this_tab.find('input').val());	
		numBus=Number(this_tab.find('input').val())
		offerRound =parseInt(curStage/2);
	}	
	
	if(isNaN(numBus) || !(/^\+?[1-9][0-9]*$/.test(numBus))) return layer.alert('请输入正整数');	
	layer.confirm('报价金额<span>' + offerMoney + '</span>'+(quotationUnit?quotationUnit:'元')+'，确定提交？', function (index) {
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
			} else layer.alert(res.message);
			res.data && refreshLogs(res.data);
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
	col1.push({field:"productCode",title:'物料编码',rowspan:2});
	col1.push({field:"detailedName",title:'物料名称',rowspan:2});
//	col1.push({field:"itemType",title:'物料分类',rowspan:2});
//	col1.push({field:"detailedUnit",title:'计量单位',rowspan:2});
	col1.push({field:"detailedVersion",title:'规格型号',rowspan:2});
	col1.push({field:"storageLocation",title:'存放地点',rowspan:2});
	col1.push({field:"budget",title:'竞卖起始价('+(quotationUnit?quotationUnit:'元')+')',rowspan:2});	
if(data.auctionType == 0){
			col1.push({field:"maxPrice",title:'最高报价('+(quotationUnit?quotationUnit:'元')+')',rowspan:2,formatter:function(values, row, index){
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
	// col2.push({field:"myMaxPrice",title:'涨价幅度',width: '150',formatter:function(valuel, row, index){
	// 		if(data.isEnd) return ((valuel-data.rawPrice)/data.priceReduction||'')+'*'+data.priceReduction;
	// 		return '<input  style="width:60px;text-align:right" class="offerMoney" '+ (data.auctionType==1?'value="'+((valuel-data.rawPrice)/data.priceReduction||'')+'':'') +'">*'+data.priceReduction
	// 	}
	// });
	col2.push({field:"myMaxPrice",title:'我的报价('+(quotationUnit?quotationUnit:'元')+')',width: '150',formatter:function(valuel, row, index){
			if(data.isEnd) return valuel;
			return '<input  style="width:60px;text-align:right" class="offerMoney"  value="'+row.myMaxPrice+'">'
		}
	});
	}else{
		col1.push({field:"myMaxPrice",title:'我的报价('+(quotationUnit?quotationUnit:'元')+')',width: '150',formatter:function(valuel, row, index){
			if(data.isEnd) return valuel;
			return valuel
		}
	});
	}
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

//定时刷新数据
function getLogs() {
	setTimeout(getLogs, 5000);
	$.ajax({
		url:top.config.AuctionHost + '/AuctionProjectPackageController/getHighDetails.do',
		data:{
			packageId: packageId,
		    auctionType: data.auctionType,		
		},
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
					thisTds.eq(8).text(v.isMax);
					thisTds.eq(10).text(v.myMaxPrice);
				}
				else{
					thisTds.eq(8).text(v.myMaxPrice);
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