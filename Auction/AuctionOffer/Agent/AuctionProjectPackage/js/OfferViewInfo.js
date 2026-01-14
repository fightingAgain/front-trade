//竞价项目
var urlViewAuctionInfo = top.config.offerhost + '/info/detail'
//查看报价
var urlViewAuctionInterval = top.config.offerhost + "/offer/record";
// 查看倒计时
var urlCountDown = top.config.offerhost + "/info/countdown";
//修改包件设置
var urlAuctionSetting = top.config.offerhost + "/info/setOutKeep";
//变更竞价截止时间
var urlchangeEndTime = top.config.offerhost + "/info/changeTime";
var projectId = location.search.getQueryString("projectId"); //项目id
var packageId = location.search.getQueryString("packageId"); //包件id
var biddingTimes=location.search.getQueryString("biddingTimes");
var packageData, curStage, detailedCount,offerData;

$(function() {
	//项目基础信息	
	auctionInfo();
	if(packageData.stage==-1) jumpToHistory();
	$("#packageCode").html(packageData.packageCode);
	$("#packageName").html(packageData.packageName);
	$("#biddingTimes").html(packageData.biddingTimes);
	$("#offerInfo h1").html(['自由竞价', '单轮竞价', '两轮竞价', '三轮竞价', '不限轮次'][packageData.biddingType]);
  	$('#StageEndTime').datetimepicker({
			step:5,
			lang:'ch',
			format: 'Y-m-d H:i:s',
			minDate:new Date(packageData.biddingStartTime),
			value:GMTToStr(new Date(packageData.biddingStartTime))
	});
	
	if(curStage!=0){
		countDown();
		refreshLog()
	}else{
		$('.countDown').html('竞价已结束')
		resLog(packageData);
		$("#isStageEndTime").hide();

	}	
})
function getData(){
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			biddingTimes:biddingTimes
		},
		async:false,
		success: function(res) {
			if(res.success) {
				packageData = res.data;					
			}
				
		}
	})
}
//竞价信息
function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			biddingTimes:biddingTimes
		},
		async:false,
		beforeSend: function(xhr){
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		 },
		success: function(res) {
			if(res.success) {
				packageData = res.data;				
				curStage = (packageData.stage+1);
				$("#offerDetail").html(['<div class="col-md-12 no-padding">',
					'<table class="table table-bordered leftTab"></table>',
					'</div>',			
				].join(''));
				var column_left, column_right;
				if(packageData.biddingType<2){
					if(packageData.packageModel) {
						$('.leftTab').html([							
							'<tr><td colspan="2" style="font-size: 20px !important;font-weight: bold;">当前最低报价(元):<span class="winPrice"></span></td></tr>',
							'<tr><td colspan="2" style="font-size: 20px !important;font-weight: bold;">竞价起始价（元）:' + (packageData.biddingStartPrice || '无') + '</td></tr>'
						]);
					}else{
						column_left = [{
							title: '序号',
							width: '50px',
							align: "center",
							formatter: function(value, row, index) {
								row.index = index;
								return index + 1;
							}
						}, {
							field: 'code',
							title: '编号'
						}, {
							field: 'name',
							title: '名称'
						}, {
							field: 'classify',
							title: '分类'
						}, {
							field: 'version',
							title: '规格型号'
						}, {
							field: 'count',
							title: '数量'
						}, {
							field: 'unit',
							title: '单位'
						}, {
							field: 'storageLocation',
							title: '存放地点'
						}, {
							field:"startPrice",
							title:'起始价',
							align:'center',
							formatter:function(value, row, index){
								return (row.offerMode == 0 ? '竞低价':'竞高价') + 
								'(<span style="color:red;">'+(row.tempStartPrice || value || '-')+'</span>)';
							}
						}, {
							field: 'winPrice',
							title: '最高/低报价',
							align: 'center'
						}, {
							title: '最高/低出价供应商',
							align: 'left',
							halign: 'left',
							formatter: function(value, row, index) {
								return row.supplierName || row.winPriceOfferCode;
							}
						}];
						column_right = [{
							title: '序号',
							width: '50px',
							formatter: getIndex
						}, {
							field: 'enterpriseName',
							title: '竞买人',
							align: 'left'
						}, {
							field: 'offerMoney',
							title: '单价（元）',
							align: "right"
						}, {
							title: '合价（元）',
							align: "right",
							formatter: function(value, row, index) {
								return Number(row.offerMoney) * detailedCount;
							}
						}, {
							field: 'subDate',
							title: '报价时间'
						}];
					
					}	
				}else{
					column_left = [{
						field: 'offerRound',
						title: '轮次',
						formatter: function(value, row, index) {
							return '第' + sectionToChinese(value) + '轮';
						}
					}, 
					{
						field: 'startPrice',
						title: '起始报价（元）',
						align: "center",						
					}, {
						field: 'winPrice',
						title: '最低报价（元）',
						align: "center"
					}];
					if(!packageData.bulletinSet&&curStage%2!=0&&curStage!=-1) {
						column_left.push({
							title: '操作',
							formatter: function(value, row, index) {
								return   "<button class='btn btn-primary btn-sm setSupplierOut'>设置</button>";								
							},
							events: {
								'click .setSupplierOut': function(e, value, row, $index) {
									//--------------------------设置淘汰评委--------------------------									
									top.layer.open({
										title: '设置当前轮次淘汰保留数',
										content: ['<div class="setOutKeep">',
											'<div><label>第' + sectionToChinese($index + 1) + '轮淘汰数</label>',
											'<input  class="form-control" name="outNum" value="' + (packageData['roundsOutSupplierNum'].length>0?packageData['roundsOutSupplierNum'][$index] : '') + '"></div>',
											'<div><label>第' + sectionToChinese($index + 1) + '轮最低保留数</label>',
											'<input  class="form-control" name="keepNum" value="' + (packageData['roundsKeepSupplierNum'].length>0?packageData['roundsKeepSupplierNum'][$index]:'') + '"></div>',
											'</div>'
										].join(''),
										btn:(Math.floor((curStage)/2)==($index+1))?['确定','取消']:['取消'],
										btn1: function(index, layero) {
											if(Math.floor((curStage)/2)==($index+1)){
												var outNum = top.$('.setOutKeep input[name="outNum"]').val(),
													keepNum = top.$('.setOutKeep input[name="keepNum"]').val();
												if (!(/(^[0-9]\d*$)/.test(outNum))) {
													parent.layer.alert("只能输入正整数");
													return false;
												}
												if (!(/(^[0-9]\d*$)/.test(keepNum))) {
													parent.layer.alert("只能输入正整数");
													return false;
												}
												if(!outNum || !keepNum) {
													parent.layer.alert("淘汰/保留数量不能为空");
													return false
												}
												var param = {
													packageId: packageId,
													biddingTimes:packageData.biddingTimes
												};
												param['outNum'] = packageData['outNum'] = outNum;
												param['keepNum'] = packageData['keepNum'] = keepNum;
												$.post(urlAuctionSetting, param, function(res) {
													if(res.success) {
														top.layer.msg("设置成功！");
														getData();
														top.layer.close(index);
													} else{
														top.layer.alert(res.message);
													} 
												})
											}else{
												top.layer.close(index);
											}										
										},
										btn2: function(index, layero){
											top.layer.close(index);
										},								
									});
								}
							}
						})
					}
					
				}
				
				//初始化tab
				column_left && $('.leftTab').bootstrapTable({
					columns: column_left,
					data: packageData.packageDetails || packageData.offerItems,
					uniqueId: 'id',
					height: 500,
					onClickRow: function(row, elem) {
						$('.selected').removeClass('selected');
						$(elem).addClass('selected'); 
					}
				})
			}
		}
	})
}

//倒计时
var minute="";
function countDown() {
	var titmer=setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url: urlCountDown,
			data: {
				packageId: packageId,
				biddingTimes:biddingTimes
			},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success: function(res) {
				if (!res.success){	
					auctionInfo();																
					if(curStage!=0){						
						$('.countDown').html('竞价未开始');
					}else{
						jumpToHistory();
						$('.countDown').html('竞价已结束');
						clearTimeout(titmer);
					}					
					return;
				}
				if(curStage!=(res.data.stage+1)||(minute==0&&res.data.minute>minute)){
					auctionInfo();
					curStage=(res.data.stage+1);
					refreshLog();
				}
				minute=res.data.minute				
				if(curStage!=0){	
					console.log(Math.floor((curStage)/2))			
					var strHtml;					
					if(packageData.biddingType == 0){
						if(packageData.timeLimit!=undefined&&packageData.timeLimit!=null){
							strHtml="倒计时"
						}else{
							strHtml="限时"
						}						
					}else if(packageData.biddingType == 1){
						strHtml="倒计时"					
					}else {
						if((curStage)%2==0){
							strHtml="第"+ sectionToChinese(Math.floor((curStage)/2)) +"轮竞价结束倒计时"
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
					$('.countDown').html(strHtml+'<label class="timeInval">'+timeInval+'</label>');
					// $('.countDown').html(strHtml+'<label class="timeInval"><span style="margin-left:20px;color:red">' + res.data.minute + '</span>分<span style="color:red">' + res.data.second + '</span>秒</label>');
					
				}else{
					$('.countDown').html('竞价已结束');
					clearTimeout(titmer)
				}												
			}
		});
	} catch(e) {}
}

//轮询刷新记录
function refreshLog() {
	if(packageData.biddingType<2){
		setTimeout(function(){
			refreshLog()
		},5000)
	}
	$.ajax({
			url: urlViewAuctionInterval,
			async:false,
			data: {
				packageId: packageId,			
				biddingTimes:biddingTimes
			},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success: function(res) {
				if(!res.success){										
					return;
				} 
				resLog(res.data);								
				
			}
	});
}

function resLog(resData){
	var supplierCount=new Array();
	if(packageData.biddingType<2){
		if(packageData.packageModel){							
			$('.winPrice').html(resData.winPrice || '暂无');
		}else{
			for(var i = 0; i < packageData.packageDetails.length; i++) {
				var jsonData=resData.details[packageData.packageDetails[i].id];
				if(jsonData){
					row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.packageDetails[i].id),
					elemTr = $('.leftTab tbody tr').eq(row.index);
					elemTr.find('td').eq(9).html(jsonData.winPrice);
					elemTr.find('td').eq(10).html(jsonData.supplierName || jsonData.winPriceOfferCode);
					
					// jsonData.winPrice && ++offerItem && (sumOffer+=Number(v.sumPrice));
					// v.isMin == "是" && ++minItem;
				}							
				// row.offerItems = detail_info.offerLog;
				// if(elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
			}
		}
	}else{		
		if(resData) {
			$('.leftTab').bootstrapTable('load',resData.offerRounds);	
		}		
	}
}
//设置截止时间 or 设置是否显示竞买人
$("#offerInfo button").click(function() {
	var msgarr = ['修改竞价截止时间', '显示竞买者', '隐藏竞买者'],
		isShowName = $("#offerInfo input[name='showEnterpriseName']:checked").val(),
		opera = $(this).data('event') == 'changeEndTime' ? 0 : (isShowName == 0 ? 1 : 2);
	top.layer.confirm('确认' + msgarr[opera] + '？', {
		btn: ['确认', '取消'] //按钮
	}, function(index) {
		var obj = {
			packageId: packageId,
			biddingTimes:biddingTimes
		};
		!opera ? (obj.stageEndTime = $("#offerInfo input[type='text']").val()) : (obj.isShowName = isShowName);
		$.ajax({
			url: !opera ? urlchangeEndTime : urlAuctionSetting,
			data: obj,
			success: function(res) {
				top.layer.close(index);
				if(res.success) {
					top.layer.msg("修改成功");
				} else {
					top.layer.alert("修改失败：" + res.message);
				}
			}
		})
	});
})

function loadOfferLog(datas) {
//	$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
	return index + 1;
}
//跳转历史页面
function jumpToHistory() {
	location.href = $.parserUrlForToken("OfferHistoryInfo.html?packageId="+packageId+"&biddingTimes="+biddingTimes);
}		 