var data, packageId = location.hash.substr(1),round_startTime,curStage,auctionTimes;
$.ajax({
	url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionDetail.do',
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
		else layer.alert(res.message);
	}
});

$(function () {
	$('#offerInfo td').each(function (index, item) {
		switch (index) {
			case 0:
				$(this).find('h1').html(['自由竞价', '单轮竞价','多轮竞价','多轮竞价','不限轮次'][data.auctionType]);
				break;
			case 4:
				$(this).html(data.auctionOffer.offerCode);
				break;
			case 5:
				$(this).html(['按包件', '按明细'][data.auctionModel] || '');
				break;
			default:
				$(this).data('field') && $(this).html(data[$(this).data('field')] || '');
				break;
		}
	})
	if (data.auctionType <= 1 && data.auctionModel == 1) {
		//(按明细)--单轮竞价、自由竞价
		view_1();
	} else if (data.auctionType <= 1 && data.auctionModel == 0) {
		//(按包件)--单轮竞价、自由竞价
		view_2();
	} else if (data.auctionType <= 3) {
		//多轮竞价（两轮、三轮）
		view_3();
	} else if (data.auctionType == 4) {
		//多轮竞价（不限轮次）
		view_4();
	}
	!data.isEnd && countDown(); //倒计时
	$('.auctionOffer').click(offer);
	
	data.auctionOffer.isEliminated && layer.msg('当前轮次已被淘汰，不可参与报价！');
})

function countDown() {
	if (data.isEnd) return $('#offerDetail .timeInval').html('竞价已结束');
	setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url:top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			async: false,
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);		      
		    },
			data:{packageId: packageId},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success:function(res){
				if (!res.success) return;
				if (!res.data.stage) return location.reload(); //竞价结束
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
	var offerMoney,minPrice,offerRound;
	if(data.auctionType <= 1 && data.auctionModel == 0){
		offerMoney = Number($('.offerMoney').val());
		minPrice = Number($('.minPrice').text().replace('元', '').replace('暂无', '')) || data.rawPrice || 0;
		if(data.priceReduction&&data.auctionType==0){
			if(isNaN(offerMoney) || !/^\+?[1-9][0-9]*$/.test(offerMoney)){
				return layer.alert('请输入大于零的整数倍数');
			}
			var bei=Math.floor(minPrice/data.priceReduction);
			if(offerMoney>bei){
				return layer.alert('当前最大倍数不能超过'+bei+'倍');
			}
			offerMoney = (accMul(minPrice,1000000)-accMul(offerMoney * data.priceReduction,1000000))/1000000;
		} 
	}else if(data.auctionType <= 1 && data.auctionModel == 1){
		var this_tr = $(e.target).parent().parent();
		offerMoney = Number(this_tr.find('input').val());
		minPrice = Number(this_tr.find('td').eq(6).text()) || data.rawPrice || 0;
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		offerMoney = Number(this_tab.find('input').val());
		minPrice = Number(this_tab.find('.minPrice').text());
		offerRound = parseInt(curStage/2);
	};	
	if(isNaN(offerMoney) || !/(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/.test(offerMoney)) return layer.alert('请输入最多两位小数的正数金额');	
	if(data.minPrice){
		if (!isNaN(minPrice) && minPrice > 0 && offerMoney >= minPrice) return layer.alert('报价金额必须小于当前最低报价');
	}else{
		if(data.rawPrice&&data.rawPrice > 0){
			if (offerMoney >= data.rawPrice) return layer.alert('报价金额必须小于当起始价');
		}
	}
	if (offerMoney < 0) return layer.alert('报价金额不得小于0');
	layer.confirm('报价金额<span>' + offerMoney + '</span>元，确定提交？', function (index) {
		layer.load(2);
		$.post(top.config.AuctionHost + '/AuctionProjectPackageController/auctionOffer.do', {
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
			} else	layer.alert(res.message);
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
	col1.push({formatter:"getIndex",title:'序号',rowspan:2});
	col1.push({field:"detailedName",title:'商品名称',rowspan:2});
	col1.push({field:"brand",title:'品牌要求',rowspan:2});
	col1.push({field:"detailedVersion",title:'规格型号',rowspan:2});
	col1.push({field:"detailedCount",title:'数量',rowspan:2});
	col1.push({field:"detailedUnit",title:'单位',rowspan:2});
	if(data.auctionType == 0){
		col1.push({field:"minPrice",title:'最低报价单价(元)',rowspan:2});
		col1.push({title:'最低出价供应商',rowspan:2,formatter:function(value, row, index){
			return !data.isShowName && row.enterpriseName || row.offerCode;
		}});
		col1.push({field:"isMin",title:'是否最低',rowspan:2});
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
			return '<button class="btn btn-primary auctionOffer" id="'+row.id+'" ' + (data.auctionType == 1 && row.myMinPrice && ' style="display:none"') + '>提交</button>'
		}});
	$('#detailedsTable').bootstrapTable({
		columns:[col1,col2],
		data: data.details
	});
	var colspan = data.auctionType == 0?(data.isEnd?11:12):(data.isEnd?8:9),countSpan = data.isEnd ? 2 : 3;
	$('#detailedsTable tbody').append([
		'<tr><td colspan="'+colspan+'" class="timeInval">'+(data.isEnd?'竞价已结束':'')+'</td></tr>',
		'<tr>',
		'<td colspan="'+(colspan-countSpan)+'">您一共参加了 <span>0</span>项竞价，目前有<span>0</span>项为最低报价</td>',
		'<td colspan="'+countSpan+'">总报价： <span>0</span> 元</td>',
		'</tr>'
	].join(''));
	refreshLogs(data.details);
	!data.isEnd && data.auctionType == 0 && getLogs();
	$(".offerMoney").on('change',function(){		
		if($(this).val()!=""){			
			if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
				parent.layer.alert("单价必须大于零且最多两位小数"); 	
				$(this).val("");
				
				return
			};
			var b = (parseInt( $(this).val() * 10000000 ) / 10000000 ).toFixed(top.prieNumber||2);
			$(this).val(b);
		};
	});
}

//（按包件）--单轮、自由
function view_2() {
	if(data.auctionType == 0){//自由竞价
		$('#offerDetail').append([
			'<div class="col-md-5 no-padding" style="height: 500px;text-align: center;">',
			'<table class="table table-bordered" height="100%">',
			'<tr><td colspan="2"><h2>当前最低报价</h2></td></tr>',
			'<tr><td colspan="2">',
			'<span class="minPrice">' + (data.minPrice || data.rawPrice ? (data.minPrice || data.rawPrice) + '元' : '暂无'),
			data.isEnd ? '<br />出价竞买者：' + data.successOfferCode : '',
			'</span>',
			'</td></tr>',
			data.isEnd ? '<tr><td colspan="2">竞价已结束</td></tr>' : '<tr><td colspan="2" class="timeInval"></td></tr>',
			'<tr><td>竞价起价（元）</td><td>' + (data.rawPrice || '暂无') + '</td></tr>',
			function () {
				var offerHtml = "";
				if (!data.isEnd) {
					if (data.priceReduction) {
						offerHtml += '<tr><td>降价幅度</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;' + data.priceReduction + '元';
						offerHtml += '<span style="margin-left:10px">请在框内输入正整数<span></td></tr>';
					} else {
						offerHtml += '<tr><td>报价（元）</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '<span style="margin-left:10px">请在框内输入正数，最多2位小数<span></td></tr>';
					}					
				}
				return offerHtml;
			}(),
			'<tr><td>报价小写（元）</td><td class="myMinPrice">' + (data.myMinPrice || '暂无报价') + '</td></tr>',
			'<tr><td>报价大写</td><td class="moneyChinese">' + (data.moneyChinese || "暂无报价") + '</td></tr>',
			'</table>',
			'</div>',
			'<div class="col-md-7 no-padding" style="height: 600px;">',
			'<div style="border:1px solid #ddd;">',
			'<caption style="padding-left: 20px;font-size: 14px;background-color:#3995C8;color:#000000;">报价记录</caption>',
			'<table id="offerLogsTable" class="table table-bordered table-striped">',			
			'</table></div>',
			'<div style="border:1px solid #ddd;">',
			'<caption style="padding-left: 20px;font-size: 14px;background-color:#3995C8;color:#000000;">我的报价</caption>',
			'<table id="myOfferLogsTable" class="table table-bordered table-striped">',
			'</table>',
			'</div></div>',
			data.isEnd ? '' :
			'<center class="col-md-12 margin-top-20"><button class="btn btn-primary auctionOffer">报价</button></center>'
		].join(''));
		$('#offerLogsTable').bootstrapTable({
			pagination: false,
			undefinedText: "",
			height:'280',
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
			height:'280',
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
				},
				{
					field: "subDate",
					title: "报价时间",
					align: "center",
					halign: "center",				
				},
			]
		});
		!data.isEnd && getLogs();
	}else{//单轮竞价
		$('#offerDetail').append([
			'<div class="col-md-5 no-padding" style="height:300px;">',
			'<table class="table table-bordered" height="100%">',
			data.isEnd ? '<tr><td colspan="2">竞价已结束</td></tr>' : '<tr><td colspan="2" class="timeInval"></td></tr>',
			'<tr><td>竞价起价（元）</td><td>' + (data.rawPrice || '暂无') + '</td></tr>',
			'<tr><td>报价小写（元）</td><td class="myMinPrice">' + (data.myMinPrice ? data.myMinPrice : '<input  class="offerMoney">') + '</td></tr>',
			'<tr><td>报价大写</td><td class="moneyChinese">' + (data.moneyChinese || '暂无报价') + '</td></tr>',
			'</table>',
			'</div>',
			'<div class="col-md-7 no-padding" style="height: 300px;border:1px solid #ddd;">',
			'<table id="myOfferLogsTable" class="table table-condensed">',
			'<caption><center>我的报价</center></caption>',
			'<thead>',
			'<tr><th data-field="offerCode">竞买号</th>',
			'<th data-field="offerMoney">报价（元）</th><th data-field="subDate">报价时间</th></tr></thead>',
			'<tbody>',
			'</tbody></table>',
			'</div>',
			data.isEnd ? '' :
			'<center class="col-md-12 margin-top-20"><button class="btn btn-primary auctionOffer" ' + (data.auctionType == 1 && data.myMinPrice && ' style="display:none"') + '>报价</button><span style="margin-left:20px">只有一次报价机会，提交报价后无法撤销，请慎重报价！</span></center>'
		].join(''))
		$('#myOfferLogsTable').bootstrapTable();
	}
	refreshLogs(data.offerlogs);
	if(data.priceReduction!=undefined&&data.auctionType==0){		
		$(".offerMoney").on("blur",function(){
			var minPrice= $('.minPrice').html().substring(0, $('.minPrice').html().length - 1);
			var bei=Math.floor(minPrice/data.priceReduction)
			if($(this).val()!=""){
				if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
					parent.layer.alert("必须为大于零的整数"); 
					$(this).val("")
				};
				if(bei<$(this).val()){ 
					parent.layer.alert("当前最大倍数不能超过"+bei+'倍'); 
					$(this).val("")
				};
			}	
			var b = (parseInt(minPrice*100000000-$(this).val()*100000000*data.priceReduction)/100000000).toFixed(top.prieNumber||2);		
			$(".myMinPrice").html(b)
		})
	}else{
		$(".offerMoney").on('change',function(){		
			if($(this).val()!=""){			
				if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
					parent.layer.alert("报价必须大于零且最多两位小数"); 	
					$(this).val("");					
					return
				};
				var b = (parseInt( $(this).val() * 10000000 ) / 10000000 ).toFixed(top.prieNumber||2);
				$(this).val(b);
			};
		});
	}
	
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

//多轮竞价(两轮、三轮)
function view_3() {
	$('#offerDetail').append(['<table class="table">',
		function () {
			var rounds = "",index=1,stages = 2;//3代表第一轮竞价阶段;
			// getStartTime(round_startTime,data.firstAuctionTime);//第一轮结束时间	
			if(data.auctionOffer.isEliminated!=1){
				if(curStage!==0){				
					var cur_round = '第' + sectionToChinese(parseInt(curStage/2)) + '轮竞价',c_r,round_data=data.offerlogs[parseInt(curStage/2)-1]||{};
					rounds += 
					    '<tr><th style="text-align:center;font-size: 24px !important;font-weight: bold;">共' + (sectionToChinese(data.auctionType)=="二"?'两':sectionToChinese(data.auctionType)) + '轮竞价</th>'+
						(!data.isEnd&&(curStage%2===0)? ('<tr><td class="timeInval'+curStage+'">' + cur_round + '间隔<span>'+ data.intervalTime +
							'</span>分钟后开始，开始时间<span class="yj_time">'+ getStartTime(round_startTime,parseInt(curStage/2)) +'</span></td></tr>'):
							'') +
						'<tr><td><table class="table table-bordered" data-index="'+(index++)+'">' +
						'<caption><center class="timeInval'+curStage+'">'+
						(!data.isEnd && (curStage%2!==0)? (cur_round + '时长<span>'+
							auctionTimes[parseInt(curStage/2)-1] + '</span>分钟，开始时间<span class="yj_time">' + 
							getStartTime(round_startTime) +'</span>'):((curStage%2===0) ? '' : (cur_round + '已结束'))) +
						'</center></caption>' +
						'<tr><th colspan="4"  style="text-align:center;">' + cur_round + '</th></tr>' +
						'<tr><th width="25%">竞价起价(元)</th><td width="25%" class="minPrice">' + 
						(round_data.rawPrice || ((data.offerlogs[parseInt(curStage/2)-2] && data.offerlogs[parseInt(curStage/2)-2].minPrice)||'暂无')) + 
						'</td><td width="25%"></td><td width="25%"></td></tr>' +
						'<tr><th>本轮报价(元)</th><td>' + 
						(!data.isEnd &&!round_data.myOfferMoney&&(curStage%2!==0)?'<input class="offerMoney"  '+((round_data.myOfferMoney) && 'disabled')+' value="' + (round_data.myOfferMoney||'')+'">':(round_data.myOfferMoney||''))+
						'</td>'+
						'<th>本轮报价(元)</th><td>' + (round_data.myOfferMoney || '暂无') +'</td></tr>'+ 	
						'<tr><th>本轮报价大写</th><td>' + (round_data.moneyChinese || '暂无') + '</td><td></td><td></td></tr>' + 
						(!data.isEnd &&!round_data.myOfferMoney&&(curStage%2!==0)? '<tr><td colspan="4"><button class="btn btn-primary auctionOffer">提交</button></td></tr>':'') +
						'</table>'+
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
		data.isEnd ? ('<tr style="text-align:center"><td colspan="4" >本项目竞价已结束！</td></tr><tr><td colspan="4">成功竞买号为：' + data.successOfferCode +
		'。 竞买价格为：' + data.minPrice + '元。</td></tr>') : '',
		'</table>'
	].join(''));
	var liData=[]
	for (var i = 0; i < data.auctionType; i++) {
		var round_data=data.offerlogs[i]||{};	
		liData.push({
			lun:'第' + sectionToChinese(i+1) + '轮竞价',
			jjqj:(round_data.rawPrice || ((data.offerlogs[i-1] && data.offerlogs[i-1].minPrice)||'暂无')),
			blbj:(round_data.myOfferMoney || '暂无'),
			blbjdx:(round_data.moneyChinese || '暂无'),
			blbjzd:(round_data.minPrice || '暂无')
		})
	}
	liView(liData);
	$(".offerMoney").on('change',function(){		
		if($(this).val()!=""){			
			if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
				parent.layer.alert("报价必须大于零且最多两位小数"); 	
				$(this).val("");					
				return
			};
			var b = (parseInt( $(this).val() * 10000000 ) / 10000000 ).toFixed(top.prieNumber||2);
			$(this).val(b);
		};
	});
}
//多轮报价的历史记录
function liView(liData){
	$('#liTable').bootstrapTable({
		columns:[
		{field:"lun",title:'轮次',align:'left'},
		{field:"jjqj",title:'竞价起价(元)',align:'left'},
		{field:"blbj",title:'本轮报价(元)',align:'left'},
		{field:"blbjdx",title:'本轮报价大写',align:'left'},
		{field:"blbjzd",title:'本轮最低报价(元)',align:'left'},
		],
	
	});
	$('#liTable').bootstrapTable("load", liData); //重载数据
	$('.fixed-table-loading').hide();
}
//多轮竞价(不限轮次)
function view_4() {
	$('#offerDetail').append(['<table class="table">',
		function () {
			var roundsHtml = "",index=1,stages = 2;//3代表第一轮竞价阶段;
			var rounds = !data.isEnd ? parseInt((curStage-1)/2)+(curStage-1)%2 : data.offerlogs.length;
			// curStage=5 代表第二阶段竞价  rounds = 2; curStage =6 代表第二阶段间隔  此时有第三轮 rounds=3
			if(data.auctionOffer.isEliminated!=1){
				if(curStage!==0){
					var cur_round = '第' + sectionToChinese(parseInt(curStage/2)) + '轮竞价',c_r,round_data=data.offerlogs[parseInt(curStage/2)-1]||{};
					roundsHtml += 
						//每轮间隔信息
						 //'<tr><th style="text-align:center;font-size: 24px !important;font-weight: bold;">共' + (sectionToChinese(parseInt(curStage/2))=="二"?'两':sectionToChinese(parseInt(curStage/2))) + '轮竞价</th>'+
						(!data.isEnd&&(curStage%2===0)? ('<tr><td class="timeInval'+curStage+'">' + cur_round + '间隔<span>'+ data.intervalTime +
							'</span>分钟后开始，开始时间<span class="yj_time">'+ getStartTime(round_startTime,parseInt(curStage/2)) +'</span></td></tr>'):
							'') +
						'<tr><td><table class="table table-bordered" data-index="'+(index++)+'">' +
						'<caption><center class="timeInval'+curStage+'">'+
						(!data.isEnd && (curStage%2!==0)? (cur_round + '时长<span>'+
							auctionTimes[parseInt(curStage/2)-1] + '</span>分钟，开始时间<span class="yj_time">' + 
							getStartTime(round_startTime) +'</span>'):((curStage%2===0) ? '' : (cur_round + '已结束'))) +
						'</center></caption>' +
						'<tr><th colspan="4"  style="text-align:center;">' + cur_round + '</th></tr>' +
						'<tr><th width="25%">竞价起价(元)</th><td width="25%" class="minPrice">' + 
						(round_data.rawPrice || ((data.offerlogs[parseInt(curStage/2)-2] && data.offerlogs[parseInt(curStage/2)-2].minPrice)||'暂无')) + 
						'</td><td width="25%"></td><td width="25%"></td></tr>' +
						'<tr><th>本轮报价(元)</th><td>' + 
						'<input class="offerMoney"  '+((round_data.myOfferMoney) && 'disabled')+' value="' + (round_data.myOfferMoney||'')+'">'+
						'</td>'+
						'<th>本轮最低报价(元)</th><td>' + (round_data.minPrice || '暂无') +'</td></tr>'+ 	
						'<tr><th>本轮报价大写</th><td>' + (round_data.moneyChinese || '暂无') + '</td><td></td><td></td></tr>' + 
						(!data.isEnd &&!round_data.myOfferMoney&&(curStage%2!==0)? '<tr><td colspan="4"><button class="btn btn-primary auctionOffer">提交</button></td></tr>':'') +
						'</table>'+
				        '<table class="table table-bordered" id="liTable">'+
						'</table>';	
				}else{
					roundsHtml +='<table class="table table-bordered" id="liTable">'+
							'</table>';
					
				}
			}else{
				roundsHtml +='<table class="table table-bordered" id="liTable">'+
							'</table>';
			}
			return roundsHtml.replace('timeInval'+curStage,'timeInval');
		}(),
		data.isEnd ? ('<tr style="text-align:center"><td colspan="4" >本项目竞价已结束！</td></tr><tr><td colspan="4">成功竞买号为：' + data.successOfferCode +
		'。 竞买价格为：' + data.minPrice + '元。</td></tr>') : '',
		'</table>'
	].join(''));
	var liData=[];
	var rounds = !data.isEnd ? parseInt((curStage-1)/2)+(curStage-1)%2 : data.offerlogs.length;
	for (var i = 0; i < rounds; i++) {
		var round_data=data.offerlogs[i]||{};	
		liData.push({
			lun:'第' + sectionToChinese(i+1) + '轮竞价',
			jjqj:(round_data.rawPrice || ((data.offerlogs[i-1] && data.offerlogs[i-1].minPrice)||'暂无')),
			blbj:(round_data.myOfferMoney || '暂无'),
			blbjdx:(round_data.moneyChinese || '暂无'),
			blbjzd:(round_data.minPrice || '暂无')
		})
	}
	liView(liData);
	$(".offerMoney").on('change',function(){		
		if($(this).val()!=""){			
			if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
				parent.layer.alert("报价必须大于零且允许保留小数点后面两位数"); 	
				$(this).val("");					
				return
			};
			var b = (parseInt( $(this).val() * 10000000 ) / 10000000 ).toFixed(top.prieNumber||2);
			$(this).val(b);
		};
	});
}



//自由报价时定时刷新数据
function getLogs() {
	setTimeout(getLogs, 5000);
	$.ajax({
		url:top.config.AuctionHost + '/AuctionProjectPackageController/getOfferLogs.do',
		data:{
			packageId: packageId,
			auctionType: data.auctionType,
			auctionModel: data.auctionModel	
		},
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);
	    },
		success:function(res){			
			if (res.success) {
				if(res.data.length>0){
					if (res.data[0].offerMoney != Number($('.minPrice').text().replace('元', '').replace('暂无', ''))) {
						refreshLogs(res.data);
					}
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
	if(data.auctionType < 2 && data.auctionModel == 0){//按包件
		if(data.auctionType == 0){//自由竞价
			$('.minPrice').html((tabdata[0] && tabdata[0].offerMoney || data.rawPrice || '--') + '元');
			$('#offerLogsTable').bootstrapTable('load', tabdata);
			var my_data = $.grep(tabdata, function (n, i) {
					return !!n.isOwn;
			});
			$('#myOfferLogsTable').bootstrapTable('load', my_data);
			var myminoffer = my_data[0]||{};
			$('.myMinPrice').html(myminoffer.offerMoney || '暂无报价');
			$('.moneyChinese').html(myminoffer.moneyChinese || '暂无报价');
		}else{//单轮竞价
			$('#myOfferLogsTable').bootstrapTable('load', tabdata);
			if(tabdata.length){
				$('.myMinPrice').html(tabdata[0].offerMoney);
				$('.moneyChinese').html(tabdata[0].moneyChinese);
			}
		}
	}else if(data.auctionType < 2 && data.auctionModel == 1){//按明细
		var offerItem=0,minItem=0,sumOffer=0;
		$.each(tabdata,function(i,v){
			if(!data.isEnd){
				var thisTds = $('#'+v.id).parent().parent().find('td');
				if(data.auctionType == 0) {
					thisTds.eq(6).text(v.minPrice);
					thisTds.eq(7).text(!data.isShowName && v.enterpriseName || v.offerCode);
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
}
function accMul(arg1,arg2)
{
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}
