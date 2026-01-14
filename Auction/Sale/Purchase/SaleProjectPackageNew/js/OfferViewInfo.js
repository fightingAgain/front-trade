//竞卖项目
var urlViewAuctionInfo = top.config.AuctionHost + '/AuctionQuoteController/detail.do';
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
var urlViewAuctionIntervalNew = top.config.AuctionHost + "/AuctionQuoteController/record.do";




// 查看倒计时
var urlCountDown = top.config.AuctionHost + "/AuctionProjectPackageController/countDown.do";
//变更竞卖截止时间
var urlchangeEndTime = top.config.AuctionHost + "/AuctionProjectPackageController/changeEndTime.do";
//修改包件设置
var urlAuctionSetting = top.config.AuctionHost + "/AuctionProjectPackageController/updatePackageSetting.do";

var projectId = $.query.get("projectId"); //项目id
var packageId = $.query.get("id"); //包件id
var createType = $.query.get("createType") || 0;
var rowresult = JSON.parse(sessionStorage.getItem("rowList"));
var packageData, curStage, detailedCount;

var recordOnceData;

$(function () {
	//项目基础信息	
	auctionInfo();

	if (createType == 1) {
		//非本人创建项目
		$(".myView").hide();
	} else {
		$(".otherView").hide();
	}
})

// 调用一次record
function recordOnce() {
	$.ajax({
		// url: top.config.AuctionHost + '/AuctionProjectPackageController/getOfferLogs.do',
		url: top.config.AuctionHost + '/AuctionQuoteController/record.do',
		data: {
			packageId: packageId,
			auctionType: packageData.auctionType,
			auctionModel: packageData.auctionModel
		},
		async: false,
		//complete:function(xhr,textStatus,errorThrown){},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (res.success) {
				recordOnceData = res.data;
				if (packageData.auctionType > 1) {
					var curRound = Math.floor((curStage - 1) / 2) - 1;
 
					if(curRound==0){
						recordOnceData.offerRounds = [];
						recordOnceData.offerRounds[0] = {
							'offerRound': curRound + 1,
							'startPrice': packageData.biddingStartPrice,
							'winPrice': '暂无',
							'winPriceCN': '暂无'
						};
					}else{
						
					}
 
				}

				if(packageData.auctionType>2){
					if(recordOnceData && recordOnceData.offerRounds){
						$('.leftTab').bootstrapTable('load',recordOnceData.offerRounds);
					}
					
				}


			} else layer.alert(res.message);
		}
	});
}

//竞卖信息
function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: 2,
		},
		success: function (res) {
			if (res.success) {
				packageData = res.data;
				if (packageData.isEnd) jumpToHistory();
				curStage = packageData.stage;
				$("p[data-field]").each(function () {
					if ($(this).data('field') == 'auctionModel') {
						$(this).html(packageData['auctionModel'] == 0 ? '按包件' : '按明细');
					} else if ($(this).data('field') == 'packageName') {
						if (packageData.projectSource > 0) {
							$(this).html(packageData[$(this).data('field')] + '<span class="red">(重新竞卖)</span>');
						} else {
							$(this).html(packageData[$(this).data('field')]);
						}
					} else {
						$(this).html(packageData[$(this).data('field')]);
					}
				});
				$("#auctionType").html(['自由竞卖', '单轮竞卖', '多轮竞卖', '多轮竞卖'][packageData.auctionType]);
				$('p[data-field="auctionStartDate"]').html((new Date(packageData.startTime)).Format("yyyy-MM-dd hh:mm:ss"));
				$('#offerInfo input[type=radio]').filter(function () {
					return this.value == packageData.isShowName;
				}).attr('checked', 'checked');
				//				laydate.render({elem: $('[data-field=curStageEndTime]')[0],type: 'datetime',
				//					min: packageData.curStageEndTime,value:new Date(packageData.curStageEndTime)});
				$('#StageEndTime').datetimepicker({
					step: 5,
					lang: 'ch',
					format: 'Y-m-d H:i:s',
					minDate: GMTToStr(new Date()),
					value: GMTToStr(new Date())
				});

				$("#offerDetail").append(['<div class="">',
					'<table class="table table-bordered leftTab"></table>',
					//					'</div>',
					//					'<div class="col-md-6 no-padding">',
					//					'<table class="table table-bordered rightTab"></table>',
					'</div>'].join(''));
				var column_left, column_right;
				if(packageData.auctionType == 0){
					column_left = [{
						title: '序号',
						width: '50px',
						align: "center",
						formatter: function (value, row, index) {
							row.index = index;
							return index + 1;
						}
					}, {
						field: 'detailedName',
						title: '名称',
						formatter:function(value,row){
							if(value){
								return '<span style="white-space: normal;">'+value+'</span>';
							}
						}
					}, {
						field: 'detailedVersion',
						title: '规格型号',
						formatter:function(value,row){
							if(value){
								return '<span style="white-space: normal;">'+value+'</span>';
							}
						}
					}, {
						field: 'detailedCount',
						title: '数量'
					}, {
						field: 'detailedUnit',
						title: '单位'
					}, {
						field: 'maxPrice',
						title: '最高报价（元）',
						align: 'center',
					},
					];
				}else if(packageData.auctionType == 1){
					column_left = [{
						title: '序号',
						width: '50px',
						align: "center",
						formatter: function (value, row, index) {
							row.index = index;
							return index + 1;
						}
					}, {
						field: 'detailedName',
						title: '名称'
					}, {
						field: 'detailedVersion',
						title: '规格型号'
					}, {
						field: 'detailedCount',
						title: '数量'
					}, {
						field: 'detailedUnit',
						title: '单位'
					}, {
						field: 'maxPrice',
						title: '最高报价（元）',
						align: 'center',
					},
					];
				}else if(packageData.auctionType >= 2){
					column_left = [{
						title: '轮次',
						formatter: function (value, row, index) {
							return '第' + sectionToChinese(index + 1) + '轮报价';
						}
					},
 
					{
						field: 'startPrice',
						title: '起始报价（元）',
						align: "center",
						formatter: function (value, row, index) {
							//return row.rawPrice || packageData.offerlogs[index - 1].maxPrice;
							if (index && (curStage - 1) / 2 - 1 == index) {
								return row.startPrice;
							} else return row.startPrice;
						}
					}, {
						field: 'winPrice',
						title: '最高报价（元）',
						align: "center",

					}];
					if(packageData.outType == 1 && (curStage == 4 || curStage == 6) && createType == 0){
						column_left.push({title: '操作',formatter:function(value, row, index){
								return curStage/2 - 2 == index && "<button class='btn btn-primary btn-sm setSupplierOut'>设置</button>" || "";
							},
							events:{
								'click .setSupplierOut':function(e, value, row, index){
									//--------------------------设置淘汰评委--------------------------
									var outSupplier = index ? 'secondOutSupplier':'firstOutSupplier',
										keepSupplier = index ? 'secondKeepSupplier':'firstKeepSupplier';
									top.layer.open({
										title:'设置当前轮次淘汰保留数',
										content:['<div class="setOutKeep">',
												'<div><label>第' + sectionToChinese(index+1) + '轮淘汰数</label>',
												'<input  class="form-control" name="' + outSupplier +
													'" value="'+ (packageData[outSupplier]||'')+'"></div>',
												'<div><label>第' + sectionToChinese(index+1) + '轮最低保留数</label>',
												'<input  class="form-control" name="' + keepSupplier +
													'" value="'+ (packageData[keepSupplier]||'')+'"></div>',
											'</div>'].join(''),
										yes:function(index, layero){
											var outNum = top.$('.setOutKeep input[name="'+ outSupplier +'"]').val(),
												keepNum = top.$('.setOutKeep input[name="'+ keepSupplier +'"]').val();
											if(!outNum || !keepNum){
												return layer.alert("淘汰/保留数量不能为空");
											}
											if (!(/(^[1-9]\d*$)/.test(outNum))) {
												parent.layer.alert("只能输入正整数");
												return false;
											}
											if (!(/(^[1-9]\d*$)/.test(keepNum))) {
												parent.layer.alert("只能输入正整数");
												return false;
											}
											var param = {id: packageId,projectId: projectId};
											param[outSupplier] = packageData[outSupplier] = outNum;
											param[keepSupplier] = packageData[keepSupplier] = keepNum;
											$.post(urlAuctionSetting,param,function(res){
												if(res.success) {
													top.layer.msg("设置成功！");
													top.layer.close(index);
												}
												else top.layer.alert("设置失败！");
											})
										}
									});
								}
							}
						})
					}
				}
 
				recordOnce();
				//初始化tab
				var vheight = $(document).height() - 200;
				if(packageData.auctionType >= 2){
					column_left && $('.leftTab').bootstrapTable({
						columns: column_left,
						data: recordOnceData.offerRounds,
						uniqueId: 'id',
						height: vheight,
						onClickRow: function (row, elem) {
							$('.selected').removeClass('selected');
							$(elem).addClass('selected');
							if (packageData.auctionModel == 1) {//明细
								detailedCount = Number(row.detailedCount);
								loadOfferLog(row.offerItems);
								//$('.rightTab').bootstrapTable("load", row.offerItems);
							} else {//多轮
								//loadOfferLog(packageData.offerlogs[$(elem).index()].offerLog || []);
							}
						}
					}) && $('.TimeText').html((packageData.auctionModel == 1 ? (curStage == 2 ? '限时' : '倒计时') :
						(curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束剩余') :
							('距离第' + sectionToChinese(curStage / 2) + '轮报价开始剩余'))) +
						'<label class="timeInval"></label>');
				}else{
					column_left && $('.leftTab').bootstrapTable({
						columns: column_left,
						data: packageData.packageDetails || packageData.offerlogs,
						uniqueId: 'id',
						height: vheight,
						onClickRow: function (row, elem) {
							$('.selected').removeClass('selected');
							$(elem).addClass('selected');
							if (packageData.auctionModel == 1) {//明细
								detailedCount = Number(row.detailedCount);
								loadOfferLog(row.offerItems);
								//$('.rightTab').bootstrapTable("load", row.offerItems);
							} else {//多轮
								//loadOfferLog(packageData.offerlogs[$(elem).index()].offerLog || []);
							}
						}
					}) && $('.TimeText').html((packageData.auctionModel == 1 ? (curStage == 2 ? '限时' : '倒计时') :
						(curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束剩余') :
							('距离第' + sectionToChinese(curStage / 2) + '轮报价开始剩余'))) +
						'<label class="timeInval"></label>');
				}


			}
			countDown();
			
			if (packageData.auctionType == 0 && packageData.auctionModel == 0) {
				
				refreshLog();
			} else {
				if(packageData.stage % 2){
					refreshLog();
				}else{
					refreshLog();
					
				}
				 
			}
		}
	})
}

//倒计时
function countDown() {
	setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url: top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			data: { packageId: packageId },
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function (res) {
				if (!res.success) return;
				if (res.data.isEnd) return jumpToHistory(); //竞卖结束
				if (res.data.stage != curStage) {
					curStage = res.data.stage;
					if (packageData.auctionType > 1) {
						return location.reload();
					}
				}
				// $('#offerDetail .timeInval').html('<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
				
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
				$('.TimeText').html((res.data.stage == 2 ? '限时' : (packageData.auctionType < 2 ? '倒计时' : (curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束') : ('距离第' + sectionToChinese(curStage / 2) + '轮报价开始')))));
				$('.notEliminatedCount').html(res.data.notEliminatedCount || 0);
			}
		});
	} catch (e) { }
}


//轮询刷新记录
function refreshLog() {
	$.ajax({
		url: urlViewAuctionIntervalNew,
		data: {
			packageId: packageId,
			auctionModel: packageData.auctionModel,
			auctionType: packageId.auctionType,
			tenderType: 2,
		},
		async: false,
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (!res.success || !res.data) return;

			if (packageData.auctionType == 0) {
				if (packageData.auctionType > 1) {
					packageData.offerlogs = res.data[packageId].offerLog;
					var packageRank = res.data[packageId].supplierRank;
					packageData.offerlogs = packageData.offerlogs.sort(function (a, b) { return Number(a.offerMoney) > Number(b.offerMoney) ? 1 : -1 });
					//$('.rightTab').bootstrapTable("load", packageData.offerlogs);
					$('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
					$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
				} else {
					for (var i = 0; i < packageData.packageDetails.length; i++) {
						var detail_info = res.data && res.data;

						var row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.packageDetails[i].id);
 
						var elemTr = $('.leftTab tbody tr').eq(row.index);
						if (detail_info) {
							// if (!packageData.isShowPrice) {
								elemTr.find('td').eq(5).html(detail_info.winPrice);
							// }
							//elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
							row.offerItems = detail_info.offerItems;
							// if (elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
						}

					}
				}
			} else if (packageData.auctionType == 1) {
				if (packageData.auctionType > 1) {
					packageData.offerlogs = res.data[packageId].offerLog;
					var packageRank = res.data[packageId].supplierRank;
					packageData.offerlogs = packageData.offerlogs.sort(function (a, b) { return Number(a.offerMoney) > Number(b.offerMoney) ? 1 : -1 });
					//$('.rightTab').bootstrapTable("load", packageData.offerlogs);
					$('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
					$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
				} else {
					for (var i = 0; i < packageData.packageDetails.length; i++) {
						var detail_info = res.data && res.data,
							row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.packageDetails[i].id),
							elemTr = $('.leftTab tbody tr').eq(row.index);
						if (detail_info && detail_info.offerItems && detail_info.offerItems.length > 0) {
							elemTr.find('td').eq(5).html(detail_info.winPrice);
							//elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
							row.offerItems = detail_info.offerItems;
							if (elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
						}else if(packageData.isShowPrice == 1){
							elemTr.find('td').eq(5).html('***');
						}

					}
				}
			} else if (packageData.auctionType >= 2) {
 
				var curRound = Math.floor((packageData.stage - 1) / 2) - 1,
					elemTr = $('.leftTab tbody tr').eq(curRound);
				if (res.data && res.data.offerRounds && res.data.offerRounds.length) {
					elemTr.find('td').eq(1).html(res.data.offerRounds[curRound].startPrice);
					elemTr.find('td').eq(2).html(res.data.offerRounds[curRound].winPrice);
				}
				// packageData.offerlogs[curRound].offerRounds = res.data.offerRounds;
				// if (elemTr.hasClass('selected')) loadOfferLog(res.data.offerLog);
			}
 
			setTimeout(refreshLog, 5000);
		}
	});
}
//设置截止时间 or 设置是否显示竞买人
$("#offerInfo button").click(function () {
	var msgarr = ['修改竞卖截止时间', '显示竞卖者', '隐藏竞卖者'], isShowName = $("#offerInfo input[name='showEnterpriseName']:checked").val(),
		opera = $(this).data('event') == 'changeEndTime' ? 0 : (isShowName == 0 ? 1 : 2);
	top.layer.confirm('确认' + msgarr[opera] + '？', {
		btn: ['确认', '取消'] //按钮
	}, function (index) {
		var obj = { id: packageId };
		!opera ? (obj.endTime = $("#offerInfo input[type='text']").val()) : (obj.isShowName = isShowName);
		$.ajax({
			url: !opera ? urlchangeEndTime : urlAuctionSetting,
			data: obj,
			success: function (res) {
				top.layer.close(index);
				if (res.success) {
					top.layer.msg("修改成功");
				} else {
					top.layer.alert("修改失败：" + res.message);
				}
			}
		})
	});
})

function loadOfferLog(datas) {
	$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
	return index + 1;
}

//跳转历史页面
function jumpToHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("OfferHistoryInfo.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}