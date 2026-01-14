var offerData, packageId =getUrlParam('packageId'),round_startTime,curStage,auctionTimes,titmer,recordedData;
var biddingTimes=getUrlParam('biddingTimes');
var getLogsTime
function offerList(){
	$.ajax({
		url: top.config.offerhost + '/info/detail',
		data: {
			'packageId': packageId,
			'supplierId':top.enterpriseId,
			'supplierName':top.enterpriseName,
			'biddingTimes':biddingTimes,
		},
		async: false,
		beforeSend: function(xhr){
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);		      
		},
		success: function (res) {
			if (res.success) {
				offerData = res.data;
				auctionTimes = [offerData.firstAuctionTime,offerData.secondAuctionTime,offerData.thirdAuctionTime];
				curStage = (offerData.stage+1);
				if (offerData.biddingType <= 1 && !offerData.packageModel) {
					//(按明细)--单轮竞价、自由竞价
					view_1();
				} else if (offerData.biddingType <= 1 && offerData.packageModel) {
					//(按包件)--单轮竞价、自由竞价
					view_2();
				} else if (offerData.biddingType <= 3) {
					//多轮竞价（两轮、三轮）
					view_3();
				}
				$('.auctionOffer').click(offer);	
				offerData.offerInfo.isEliminated && layer.msg('当前轮次已被淘汰，不可参与报价！');
			}else{
				parent.layer.confirm('温馨提示:'+res.message, {
					btn: ['确定'] //可以无限个按钮
				}, function(indexs, layero) {								
					parent.layer.close(indexs);
					var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.close(index); 
				})
				
				return
			}
		}
	});
}
$(function () {
	offerList()
	$('#offerInfo td').each(function (index, item) {
		switch (index) {
			case 0:
				$(this).find('h1').html(['自由竞价', '单轮竞价','两轮竞价','三轮竞价'][offerData.biddingType]);
				break;
			case 4:
				$(this).html(offerData.offerInfo.offerCode);
				break;
			case 5:
				if(offerData.packageModel==true){
					$(this).html('按包件');
				}else if(offerData.packageModel==false){
					$(this).html('按明细');
				}else{
					$(this).html('');
				}				
				break;
			default:
				$(this).data('field') && $(this).html(offerData[$(this).data('field')] || '');
				break;
		}
	})
	// $("#curUser").html(top.enterpriseName)
	getEnterpriseName('curUser', packageId);
	if(offerData.stage!=-1&&offerData.offerInfo.isEliminated!=1){
		countDown(); //倒计时
	}else{
		$('#offerDetail .timeInval').html('竞价已结束');
	}
	
})
var minute="";
function countDown() {
	titmer=setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url:top.config.offerhost + '/info/countdown',
			async: false,
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);		      
		    },
			data:{
				packageId: packageId,
				biddingTimes:biddingTimes,
				offerId:offerData.offerInfo.id
			},
			success:function(res){
				if (!res.success){
					offerList();
					if(curStage==0){
						$('#offerDetail .timeInval').html('竞价已结束');
						clearTimeout(titmer);
					}else{
						$('#offerDetail .timeInval').html('竞价未开始');
					}
					$(".auctionOffer").hide();					
					return;
				} 
				if(curStage!=(res.data.stage+1)||(minute==0&&res.data.minute>minute)){
					offerList();
					curStage=(res.data.stage+1);
					
				}	
				minute=res.data.minute
				if(curStage!=0){				
					var strHtml;					
					if(offerData.biddingType == 0){
						if(offerData.timeLimit!=undefined&&offerData.timeLimit!=null){
							strHtml="倒计时"
						}else{
							strHtml="限时"
						}						
					}else if(offerData.biddingType == 1){
						strHtml="倒计时"					
					}else {
						if((curStage)%2==0){
							strHtml="第"+ sectionToChinese(Math.floor((curStage)/2))+"轮竞价结束倒计时"
						}else if((curStage)%2!=0){
							strHtml="第"+ sectionToChinese(Math.floor((curStage)/2)+1) +"轮竞价开始倒计时"
						}
					}
					let diff_min = ~~res.data.minute,timeInval;
					var day = Math.floor(diff_min / (60 * 24)),
					hour = Math.floor((diff_min - day * 24 * 60) / 60),
					minute = diff_min - day * 24 * 60 - hour * 60;
					timeInval = (day?'<span>'+day+'</span>天':'')+(hour?'<span>'+hour+'</span>时':'')
						+(minute?'<span>'+minute+'</span>分':'')+'<span>'+res.data.second+'</span>秒';
					$('#offerDetail .timeInval').html(strHtml+timeInval);
					// $('#offerDetail .timeInval').html(strHtml+'<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒'	);
				}else{
					if(offerData.stage==-1){
						$('#offerDetail .timeInval').html('竞价已结束');
					}
					
					clearTimeout(titmer)
				}
				
				
			}
		});
	} catch (e) {}
}
//报价
function offer(e) {
	var offerMoney,winPrice,offerRound,amountCalculateMethod,offerMode = offerData.offerMode;
	if(offerData.biddingType <= 1 && offerData.packageModel){
		offerMoney = Number($('.offerMoney').val());
		winPrice = Number($('.winPrice').text().replace('元', '').replace('暂无', '')) || offerData.biddingStartPrice || 0;
		if(offerData.priceCutRange){
			if(isNaN(offerMoney) || !/^\+?[1-9][0-9]*$/.test(offerMoney)){
				return layer.alert('请输入大于零的整数倍数');
			}
			var bei=Math.floor(winPrice/offerData.priceCutRange);
			if(offerMoney>bei){
				return layer.alert('当前最大倍数不能超过'+bei+'倍');
			}
			offerMoney = (accMul(winPrice,1000000)-accMul(offerMoney * offerData.priceCutRange,1000000))/1000000;
		} 
	}else if(offerData.biddingType <= 1 && !offerData.packageModel){
		var this_tr = $(e.target).parent().parent();
		offerMoney = Number(this_tr.find('input').val());
		winPrice = ~~$(e.target).attr('startPrice') || 0;
		offerMode = ~~$(e.target).attr('offerMode');
		amountCalculateMethod= ~~$(e.target).attr('amountCalculateMethod');
		
		if(amountCalculateMethod){
			if(isNaN(offerMoney) || !/^\+?[1-9][0-9]*$/.test(offerMoney)){
				return layer.alert('请输入大于零的整数倍数');
			}
			offerMoney =Math.round(offerMoney/10)*10;
		}else{
			if(isNaN(offerMoney) || !/^[+-]?(\d){1,}0$/.test(offerMoney)){
				return layer.alert('请输入大于零的10的整数倍数');
			}
		}
		
		
		if(offerMode==1){
			var bei=Math.floor(winPrice*10);
			if(offerMoney>bei){
				return layer.alert('当前最大倍数不能超过'+10+'倍');
			}
		}else if(offerMode==0){
			var bei=Math.floor(winPrice/10);
			if(offerMoney<bei){
				return layer.alert('当前最大倍数不能低于'+10+'倍');
			}
		}
		
		
		
	}else{
		var this_tab = $(e.target).parents('table').eq(0);
		offerMoney = Number(this_tab.find('input').val());
		winPrice = Number(this_tab.find('.winPrice').text());
		offerRound = parseInt(curStage/2);		
	};	
	if(isNaN(offerMoney) || !/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(offerMoney))
	return layer.alert('请输入最多两位小数的正数金额');
	if (offerMoney <= 0) return layer.alert('报价金额不得小于0');
	if (!isNaN(winPrice) && winPrice > 0 && (offerMode?offerMoney <= winPrice:offerMoney >= winPrice))
	return layer.alert('报价金额必须'+(offerMode?'大':'小')+'于当前最低报价');
	var result = false;
	var tishi = ''
	if(offerMode=1){
		var beis=Math.floor(winPrice*3);
		result = offerMoney>beis;
		tishi = '超过';
	}else if(offerMode=0){
		var beis=Math.floor(winPrice/3);
		result = offerMoney<beis;
		tishi = '低于';
	}
	if(result){
		 parent.layer.confirm('报价金额'+tishi+'当前价格3倍是否确认提交？', function (index) {
		 	parent.layer.confirm('报价金额<span>' + offerMoney + '</span>元，确定提交？', function (index) {
		 		$.post(top.config.offerhost + '/offer/submit', {
		 			packageId: packageId,
		 			offerId: offerData.offerInfo.id,
		 			offerMoney: offerMoney,
		 			offerRound: offerRound,
		 			packageDetailedId: e.target.id,
		 			biddingTimes:biddingTimes,
		 		}, function (res) {
		 			if (res.success) {
		 				if(offerData.biddingType == 1) $(e.target).remove();//单轮
		 				getLogs();
		 				parent.layer.close(index);
		 			} else	layer.alert(res.message);
		 			res.data && refreshLogs();
		 		})
		 		
		 	})
		 })
	}else{
		parent.layer.confirm('报价金额<span>' + offerMoney + '</span>元，确定提交？', function (index) {
			$.post(top.config.offerhost + '/offer/submit', {
				packageId: packageId,
				offerId: offerData.offerInfo.id,
				offerMoney: offerMoney,
				offerRound: offerRound,
				packageDetailedId: e.target.id,
				biddingTimes:biddingTimes,
			}, function (res) {
				if (res.success) {
					if(offerData.biddingType == 1) $(e.target).remove();//单轮
					getLogs();
					parent.layer.close(index);
				} else	layer.alert(res.message);
				res.data && refreshLogs();
			})
			
		})
	}
	
}

//（按明细）--单轮、自由
function view_1() {
	$('#offerDetail').html(['<div class="no-padding">',
		'<table id="detailedsTable" class="table table-bordered"></table>',
		'<table id="detailedsTables" class="table table-bordered"></table>',
		'</div>'
	].join(''));
	var col1 = [],col2 = [];
	col1.push({formatter:"getIndex",title:'序号',align:'center',rowspan:2});
	col1.push({field:"code",title:'编号',align:'center',rowspan:2});
	col1.push({field:"name",title:'商品名称',align:'left',rowspan:2});
	col1.push({field:"classify",title:'分类',align:'center',rowspan:2});
	col1.push({field:"brand",title:'品牌要求',align:'center',rowspan:2});
	col1.push({field:"version",title:'规格型号',align:'center',rowspan:2});
	col1.push({field:"count",title:'数量',align:'center',rowspan:2
	,formatter:function(value, row, index){
		return '<span class="count">'+(value || 1)+'</span>';
	}});
	col1.push({field:"unit",title:'单位',align:'center',rowspan:2});
	col1.push({field:"storageLocation",align:'center',title:'存放地点',rowspan:2});
	col1.push({field:"servicePrice",align:'center',title:'服务费(元)',rowspan:2});
	col1.push({field:"amountCalculateMethod",align:'center',title:'报价计算方式',rowspan:2,formatter:function(value, row, index){
		return (row.amountCalculateMethod == 0 ? '十的整倍数法':'四舍五入法');
	}});
	col1.push({field:"startPrice",title:'起始价',align:'center',rowspan:2
	,formatter:function(value, row, index){
		return (row.offerMode == 0 ? '竞低价':'竞高价') + '(<span style="color:red;">'+(row.tempStartPrice || value || '-')+'</span>)';
	}});
	if(offerData.biddingType == 0&&offerData.offerMode!=2){
		col1.push({field:"winPrice",title:'最高/低报价单价(元)',align:'center',rowspan:2
		,formatter:function(value, row, index){
			return '<span class="winPrice">'+value+'</span>';
		}});
		col1.push({title:'最高/低出价供应商',align:'center',rowspan:2,formatter:function(value, row, index){
			return '<span class="winSupplier">'+(row.winSupplier || row.offerCode)+'</span>';
		}});
		col1.push({field:"isWin",title:'是否最'+(offerData.offerMode?'高':'低')+'',align:'center',rowspan:2,formatter:function(value, row, index){
			return '<span class="isWin">'+(value?'是':'否')+'</span>';
		}});
	}
	col1.push({title:'我的报价',align:'center',colspan:offerData.stage == -1?2:3});
	col2.push({field:"myOfferMoney",align:'center',title:'单价(元)',formatter:function(value, row, index){
			if(offerData.stage==-1 || 
				(row.allowOfferSuppliers && 
					row.allowOfferSuppliers.search(top.enterpriseId) == -1)) 
					return '<span class="offerMoney">'+(value||'-')+'</span>';
			return '<input  style="width: 100%;" class="offerMoney" id="offerMoney'+row.id+'" value="'+(value||'')+'">'
		}
	});
	col2.push({field:"sumPrice",align:'center',title:'合价(元)',formatter:function(value, row, index){
		return '<span id="sumPrice_'+row.id+'">'+(value||'-')+'</span>';
	}});
	offerData.stage!=-1 && col2.push({title:'操作',align:'center',formatter:function(value, row, index){
		if((offerData.biddingType == 0 || !row.myOfferMoney)&&(!row.allowOfferSuppliers || 
			row.allowOfferSuppliers.search(top.enterpriseId) != -1)){
				return '<button class="btn btn-primary auctionOffer" id="'+row.id+
				'" offerMode="'+row.offerMode+'" amountCalculateMethod="'+row.amountCalculateMethod+'" startPrice='+(row.tempStartPrice||row.startPrice||'')+'>提交</button>'
			}
		}});
	$('#detailedsTable').bootstrapTable({
		columns:[col1,col2],
		data: offerData.packageDetails
	});
	var colspan = offerData.biddingType == 0?(offerData.stage==-1?15:16):(offerData.stage==-1?11:12),countSpan = offerData.stage==-1 ? 2 : 3;
	$('#detailedsTables').html([
		'<tr><td colspan="'+colspan+'" class="timeInval">'+(offerData.stage==-1?'竞价已结束':'')+'</td></tr>',
		'<tr>',
		'<td colspan="'+(colspan-countSpan)+'">您一共参加了 <span>0</span>项竞价</td>',
		'<td colspan="'+countSpan+'">总报价： <span id="gather">0</span> 元</td>',
		'</tr>',
		'<tr><td colspan="'+colspan+'" style="padding-left: 20px;font-size: 16px;color:red;"><p style="float:left; line-height: 20px;">说明：服务费是另外收取，不含在此次报价中!</p></td>',
		'</tr>'
	].join(''));
	if(offerData.stage!=-1){
		getLogs();
	}else{
		refreshLogs(offerData)
	}
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
	if(offerData.biddingType == 0){//自由竞价
		$('#offerDetail').html([
			'<div class="col-md-5 no-padding" style="height: 500px;text-align: center;">',
			'<table class="table table-bordered" height="100%">',
			'<tr><td colspan="2"><h2>当前最低报价</h2></td></tr>',
			'<tr><td colspan="2">',
			'<span class="winPrice">' + ((offerData.offerItems&&offerData.offerItems.winPrice )|| offerData.biddingStartPrice ? ((offerData.offerItems&&offerData.offerItems.winPrice )|| offerData.biddingStartPrice) + '元' : '暂无'),
			(offerData.stage==-1 ? '<br />出价竞买者：' + offerData.successOfferCode : ''),
			'</span>',
			'</td></tr>',
			(offerData.stage==-1 ? '<tr><td colspan="2">竞价已结束</td></tr>' : '<tr><td colspan="2" class="timeInval"></td></tr>'),
			'<tr><td>竞价起价（元）</td><td>' + (offerData.biddingStartPrice || '暂无') + '</td></tr>',
			function () {
				var offerHtml = "";
				if (offerData.stage!=-1) {
					if (offerData.priceCutRange) {
						offerHtml += '<tr><td>降价幅度</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;' + offerData.priceCutRange + '元';
						offerHtml += '<span style="margin-left:10px">请在框内输入正整数<span></td></tr>';
					} else {
						offerHtml += '<tr><td>报价（元）</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '<span style="margin-left:10px">请在框内输入正数，最多2位小数<span></td></tr>';
					}					
				}
				return offerHtml;
			}(),
			'<tr><td>报价小写（元）</td><td class="myOfferMoney"></td></tr>',
			'<tr><td>报价大写</td><td class="moneyChinese"></td></tr>',
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
			offerData.stage==-1 ? '' :
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
					field: "offerTime",
					title: "报价时间",
					align: "center",
					halign: "center",				
				},
			]
		});
	}else{//单轮竞价
		$('#offerDetail').html([
			'<div class="col-md-12 no-padding" style="height:300px;">',
			'<table class="table table-bordered" height="100%">',
			(offerData.stage==-1 ? '<tr><td colspan="2">竞价已结束</td></tr>' : '<tr><td colspan="2" class="timeInval"></td></tr>'),
			'<tr><td>竞价起价（元）</td><td>' + (offerData.biddingStartPrice || '暂无') + '</td></tr>',
			function () {
				var offerHtml = "";
				if (offerData.stage!=-1) {
					if (offerData.priceCutRange) {
						offerHtml += '<tr><td>降价幅度</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;' + offerData.priceCutRange + '元';
						offerHtml += '<span style="margin-left:10px">请在框内输入正整数<span></td></tr>';
					} else {
						offerHtml += '<tr class="isofferMoney"><td>报价（元）</td><td><input  class="offerMoney" style="width:100px">';
						offerHtml += '<span style="margin-left:10px">请在框内输入正数，最多2位小数<span></td></tr>';
					}					
				}
				return offerHtml;
			}(),
			'<tr><td>报价小写（元）</td><td class="myOfferMoney"></td></tr>',
			'<tr><td>报价大写</td><td class="moneyChinese"></td></tr>',
			'</table>',
			'</div>',
			// '<div class="col-md-7 no-padding" style="height: 300px;border:1px solid #ddd;">',
			// '<div style="border:1px solid #ddd;">',
			// '<caption style="padding-left: 20px;font-size: 14px;background-color:#3995C8;color:#000000;">我的报价</caption>',
			// '<table id="myOfferLogsTable" class="table table-bordered table-striped">',
			// '</table>',
			// '</div></div>',
			'</div>',
			offerData.stage==-1 ? '' :
			'<center class="col-md-12 margin-top-20"><button class="btn btn-primary auctionOffer">报价</button><span style="margin-left:20px">只有一次报价机会，提交报价后无法撤销，请慎重报价！</span></center>'
		].join(''))
	
	}
	
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
				field: "offerTime",
				title: "报价时间",
				align: "center",
				halign: "center",				
			},
		]
	});
	if(offerData.stage!=-1){
		getLogs();
	}else{
		refreshLogs(offerData)
	}
	if(offerData.priceReduction!=undefined){		
		$(".offerMoney").on("blur",function(){
			var winPrice= $('.winPrice').html().substring(0, $('.winPrice').html().length - 1);
			var bei=Math.floor(winPrice/offerData.priceReduction)
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
			var b = (parseInt(winPrice*100000000-$(this).val()*100000000*offerData.priceReduction)/100000000).toFixed(top.prieNumber||2);		
			$(".myOfferMoney").html(b)
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
	if(!round_startTime) round_startTime = new Date(offerData.curStageEndTime);
	else{
		if(round){
			round_startTime = date.setMinutes(date.getMinutes()+Number(auctionTimes[round-1]));
		}else{
			round_startTime = date.setMinutes(date.getMinutes()+Number(offerData.intervalTime));
		}
	}
	return new Date(round_startTime).Format('yyyy-MM-dd hh:mm:ss');
}

//多轮竞价(两轮、三轮)
function view_3() {
	$('#offerDetail').html(['<table class="table">',
		function () {
			var rounds = "",index=1,stages = 1;//1代表第一轮竞价阶段;
			// getStartTime(round_startTime,data.firstAuctionTime);//第一轮结束时间	
			if(offerData.offerInfo.isEliminated!=1){
				if(offerData.stage!=-1){			
					var cur_round = '第' + sectionToChinese(parseInt(curStage/2)) + '轮竞价',round_data=offerData;
					rounds += 
					    '<tr><th style="text-align:center;font-size: 24px !important;font-weight: bold;">共' + (sectionToChinese(offerData.biddingType)=="二"?'两':sectionToChinese(offerData.biddingType)) + '轮竞价</th>'+
						(curStage!=1&&(curStage%2===0)? ('<tr><td class="timeInval'+curStage+'">' + cur_round + '间隔<span>'+ offerData.intervalTime +
							'</span>分钟后开始，开始时间<span class="yj_time">'+ getStartTime(round_startTime,parseInt(curStage/2)) +'</span></td></tr>'):
							'') +
						'<tr><td><table class="table table-bordered" data-index="'+(index++)+'">' +
						'<caption><center class="timeInval'+curStage+'">'+
						(curStage!=1  && (curStage%2!==0)? (cur_round + '时长<span>'+
							auctionTimes[parseInt(curStage/2)] + '</span>分钟，开始时间<span class="yj_time">' + 
							getStartTime(round_startTime) +'</span>'):((curStage%2===0) ? '' : (cur_round + '已结束'))) +
						'</center></caption>' +
						// '<tr><th colspan="4"  style="text-align:center;">' + cur_round + '</th></tr>' +
						'<tr><th width="25%">竞价起价(元)</th><td width="25%" class="winPrice" id="winPriceVul">' + 
						(round_data.biddingStartPrice||'暂无') + 
						'</td><td width="25%"></td><td width="25%"></td></tr>' +
						'<tr><th>本轮报价(元)</th><td>' + 
						'<input class="offerMoney"  id="offerMoneyVule">'+
						'</td>'+
						'<th>本轮报价(元)</th><td id="offerMoneyOur"> 暂无</td></tr>'+ 	
						'<tr><th>本轮报价大写</th><td id="offerMoneyOurCN">暂无</td><td></td><td></td></tr>' + 
						('<tr><td colspan="4"><button class="btn btn-primary auctionOffer">提交</button></td></tr>') +
						'</table>'+
				        '<table class="table table-bordered" id="liTable">'+
						'</table>';
				}else{
					rounds +='<table class="table table-bordered" id="liTable">'+
							'</table>';
					
				}
			}else{
				$('#offerDetail').html('<div style="text-align:center;font-size: 24px !important;font-weight: bold;">您已被淘汰</div>')
				rounds +='<table class="table table-bordered" id="liTable">'+
					'</table>';
			}
			
			return rounds.replace('timeInval'+curStage,'timeInval');
		}(),
		offerData.stage==-1 ? ('<tr style="text-align:center"><td colspan="4" >本项目竞价已结束！</td></tr><tr><td colspan="4">成功竞买号为：<span id="winPriceOfferCode"></span>。 竞买价格为：<span id="zuioffer"></span>元。</td></tr>') : '',
		'</table>'
	].join(''));
	if(offerData.stage!=-1){
		getLogs();
	}else{
		refreshLogs(offerData)
	}
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
// 多轮报价的历史记录
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
//自由报价时定时刷新数据
function getLogs() {
	if(offerData.biddingType == 0){
		getLogsTime=setTimeout(getLogs, 5000);
	}
	$.ajax({
		url:top.config.offerhost + '/offer/record',
		data:{
			packageId: packageId,
			offerId: offerData.offerInfo.id,
			biddingTimes:biddingTimes,			
		},
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);
	    },
		success:function(res){			
			if (res.success) {
				if(res.data){		
					refreshLogs(res.data)	
				}	
			} else{				
				if(offerData.biddingType < 2){
					getLogsTime && clearTimeout(getLogsTime)
				}	
			} 
		}
	});
}

function getIndex(value, row, index) {
	return index + 1;
}
//加载报价记录表
function refreshLogs(tabdata) {
	tabdata =  tabdata || [];
	if(offerData.biddingType < 2 && offerData.packageModel){//按包件
		if(offerData.biddingType == 0){//自由竞价
			$('.winPrice').html((tabdata.winPrice!==undefined?tabdata.winPrice:(offerData.biddingStartPrice||'--')) + '元');
			var my_data=[];
			for(var i=0;i<tabdata.offerItems.length;i++){
				if(offerData.offerInfo.id==tabdata.offerItems[i].offerId){
					my_data.push(tabdata.offerItems[i]);
				}
			}
			var myOffer = my_data[0]||{};
			$('#offerLogsTable').bootstrapTable('load', tabdata.offerItems);
			$('.myOfferMoney').html(myOffer.offerMoney!==undefined?myOffer.offerMoney:'暂无报价');
			$('.moneyChinese').html(myOffer.offerMoneyCN || '暂无报价');	
			$('#myOfferLogsTable').bootstrapTable('load', my_data);		
		}else{//单轮竞价
			if(tabdata.offerItems){
				var my_data=[];
				for(var i=0;i<tabdata.offerItems.length;i++){
					if(offerData.offerInfo.id==tabdata.offerItems[i].offerId){
						my_data.push(tabdata.offerItems[i]);
					}
				}
				var myOffer = my_data[0]||{};				
				$('.myOfferMoney').html(myOffer.offerMoney!==undefined?myOffer.offerMoney:'暂无报价');
				$('.moneyChinese').html(myOffer.offerMoneyCN || '暂无报价');
			}else{
				$('.myOfferMoney').html(tabdata.myOfferMoney!==undefined?tabdata.myOfferMoney:'暂无报价');
				$('.moneyChinese').html(tabdata.myOfferMoneyCN || '暂无报价');
				if(tabdata.myOfferMoney){
					$(".auctionOffer").hide();
					$(".isofferMoney").hide();
				}
			}
		}
		
	}else if(offerData.biddingType < 2 && !offerData.packageModel){//按明细
		var offerItem=0,winItem=0,sumOffer=0;
		// var gather=new Array();
		for(let key in tabdata.details){
			var row = tabdata.details[key];
			var this_tr = $('#sumPrice_'+key).parent().parent();
			if(offerData.biddingType == 0) {
				this_tr.find('.winPrice').text(row.winPrice);
				this_tr.find('.winSupplier').text(row.winSupplier || row.offerCode);
				this_tr.find('.isWin').text(row.isWin?'是':'否');
			}
			if(offerData.biddingType!=0&&offerData.offerMode!=2){
				offerData.stage == -1 && this_tr.find('.offerMoney').text(row.myOfferMoney) || this_tr.find('.offerMoney').val(row.myOfferMoney);
			}
			offerData.biddingType == 1 && !!row.myOfferMoney && $('#'+key).remove();
			let count = ~~this_tr.find('.count').text();
			let sumPrice = row.myOfferMoney * count || 0;
			$('#sumPrice_'+key).text(sumPrice);
			row.offerItems && row.offerItems.length && ++offerItem;
			row.isWin && ++winItem;
			sumOffer += sumPrice;
		}

		// for(var i=0;i<offerData.packageDetails.length;i++){
		// 	var jsonData=tabdata.packageDetails[offerData.packageDetails[i].id];
		// 	if(jsonData){
		// 		if(offerData.stage!=-1){
		// 			var thisTds = $('#'+offerData.packageDetails[i].id).parent().parent().find('td');
		// 			if(offerData.biddingType == 0) {
		// 				thisTds.eq(6).text(jsonData.winPrice);
		// 				thisTds.eq(7).text(jsonData.winPriceSupplierName || jsonData.offerCode);
		// 				if(jsonData.winPriceOfferId==offerData.offerInfo.id){
		// 					thisTds.eq(8).text("是");
		// 					++winItem
		// 				}else{
		// 					thisTds.eq(8).text("否");
		// 				}
		// 				var sumPrice=(jsonData.winPrice*offerData.packageDetails[i].count)
		// 				thisTds.eq(10).text(sumPrice);
		// 				$("#offerMoney"+offerData.packageDetails[i].id).val(jsonData.offerItems[0].offerMoney)
		// 				gather.push(jsonData.offerItems[0].offerMoney)
		// 			}else{
		// 				thisTds.eq(7).text(jsonData.sumPrice);
		// 				$('#'+offerData.packageDetails[i].id).remove();
		// 			}
		// 		}
		// 		++offerItem				
		// 	}
		// }
		// sumOffer=eval(gather.join("+"))
		var spans = $('#detailedsTables tr:last-child span');
		spans.eq(0).html(offerItem);
		//spans.eq(1).html(winItem);
		spans.eq(1).html(sumOffer);
	}else{
		$.each(tabdata.offerRounds,function(i,v){
			if(v.offerRound==parseInt(curStage/2)){
				$("#offerMoneyOur").html(v.myOfferMoney);
				$("#offerMoneyOurCN").html(v.myOfferMoneyCN);
				$("#offerMoneyVule").val(v.myOfferMoney);
				if(v.myOfferMoney||curStage==0||curStage%2!==0){
					$(".auctionOffer").hide();
				}	
			}
		})
		var liData=[]
		for (var i = 0; i < tabdata.offerRounds.length; i++) {
			var round_data=tabdata.offerRounds[i]||{};	
			liData.push({
				lun:'第' + sectionToChinese(round_data.offerRound) + '轮竞价',
				jjqj:(round_data.startPrice!==undefined?round_data.startPrice:'暂无'),
				blbj:(round_data.myOfferMoney!==undefined?round_data.myOfferMoney:'暂无'),
				blbjdx:(round_data.myOfferMoneyCN || '暂无'),
				blbjzd:(round_data.winPrice!==undefined?round_data.winPrice:'暂无')
			})
			if(round_data.winPrice){
				$("#winPriceVul").html(round_data.winPrice);
				$("#zuioffer").html(round_data.winPrice);
				$("#winPriceOfferCode").html(round_data.winPriceOfferCode);
			}	
		}
		liView(liData);
		
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
var clockTimer;
function clock(time){
	var today=new Date(),//当前时间
	 
		h=today.getHours(),
	 
		m=today.getMinutes(),
	 
		s=today.getSeconds();
	 
	  var stopTime=new Date(time),//结束时间
	 
		stopH=stopTime.getHours(),
	 
		stopM=stopTime.getMinutes(),
	 
		stopS=stopTime.getSeconds();
	 
	  var shenyu=stopTime.getTime()-today.getTime(),//倒计时毫秒数
	 
		shengyuD=parseInt(shenyu/(60*60*24*1000)),//转换为天
	 
		D=parseInt(shenyu)-parseInt(shengyuD*60*60*24*1000),//除去天的毫秒数
	 
		shengyuH=parseInt(D/(60*60*1000)),//除去天的毫秒数转换成小时
	 
		H=D-shengyuH*60*60*1000,//除去天、小时的毫秒数
	 
		shengyuM=parseInt(H/(60*1000)),//除去天的毫秒数转换成分钟
	 
		M=H-shengyuM*60*1000;//除去天、小时、分的毫秒数
	 
		S=parseInt((shenyu-shengyuD*60*60*24*1000-shengyuH*60*60*1000-shengyuM*60*1000)/1000)//除去天、小时、分的毫秒数转化为秒
		$('#offerDetail .timeInval').html('距离竞价开始还有'+shengyuD+"天"+shengyuH+"小时"+shengyuM+"分"+S+"秒"); 
		clockTimer=setTimeout(clock,500);
		if(curStage>0){
			clearTimeout(clockTimer)	
		}	
			 
}
