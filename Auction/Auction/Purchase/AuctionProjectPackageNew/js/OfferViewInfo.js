//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlViewAuctionInfoNew = top.config.AuctionHost + "/AuctionQuoteController/detail.do";
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
var urlViewAuctionIntervalNew = top.config.AuctionHost + "/AuctionQuoteController/record.do";

// 查看倒计时
var urlCountDown = top.config.AuctionHost + "/AuctionProjectPackageController/countDown.do";
//变更竞价截止时间
var urlchangeEndTime = top.config.AuctionHost + "/AuctionProjectPackageController/changeEndTime.do";
//修改包件设置
var urlAuctionSetting = top.config.AuctionHost + "/AuctionProjectPackageController/updatePackageSetting.do";

var projectId = location.search.getQueryString("projectId"); //项目id
var packageId = location.search.getQueryString("id"); //包件id
var createType = location.search.getQueryString("createType") || 0;
var rowresult = JSON.parse(sessionStorage.getItem("rowList"));
var packageData, curStage, detailedCount;

var recordOnceData;

var isDfcm = false;//是否东风传媒自主采购项目
$(function () {
	isDfcm = checkPurchaserAgent(packageId);
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
					// 当前轮次
					var curRound = Math.floor((curStage - 1) / 2) - 1;
					// 多轮 第一轮如果没有人报价
					if(curRound==0){
						if(recordOnceData && recordOnceData.offerRounds){
							recordOnceData.offerRounds[0] = {
								'offerRound': curRound + 1,
								'startPrice': packageData.biddingStartPrice || '-',
								'winPrice': recordOnceData.offerRounds[0].winPrice,
								'winPriceCN': '暂无'
							};
						}else{
							recordOnceData.offerRounds = [];
							recordOnceData.offerRounds[0] = {
								'offerRound': curRound + 1,
								'startPrice': packageData.biddingStartPrice || '-',
								'winPrice': '暂无',
								'winPriceCN': '暂无'
							};
						}

					}else{
						
					}
 
				}


			} else layer.alert(res.message);
		}
	});
}

//竞价信息
function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfoNew,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: 1,
		},
		async: false,
		success: function (res) {
			if (res.success) {
				packageData = res.data;
				if (packageData.auctionType == '6') {
					if (packageData.isEnd || packageData.stage==0) {
						jumpToDetaillist()
					} else {
						jumpToDetail()
					}
				} else if (packageData.auctionType == '7') {
					if (packageData.isEnd || packageData.stage==0) {
						jumpSingleOfferHistory()
					} else {
						jumpSingleOfferView()
					}
				} else {
					if (packageData.isEnd || packageData.stage==0){
						jumpToHistory();
					}
				}
				curStage = packageData.stage;
				// 初始化
				$("p[data-field]").each(function () {
					if ($(this).data('field') == 'auctionModel') {
						$(this).html(packageData.auctionModel == 0 ? '按包件' : '按明细');
					} else if ($(this).data('field') == 'startTime') {
						$(this).html((new Date(packageData.startTime)).Format("yyyy-MM-dd hh:mm:ss"));
					} else if ($(this).data('field') == 'packageName') {
						if (packageData.projectSource > 0) {
							$(this).html(packageData[$(this).data('field')] + '<span class="red">(重新竞价)</span>');
						} else {
							$(this).html(packageData[$(this).data('field')]);
						}
					} else {
						$(this).html(packageData[$(this).data('field')]);
					}
					
				});

				$("#auctionType").html(['自由竞价', '单轮竞价', '多轮竞价', '多轮竞价', '不限轮次'][packageData.auctionType]);

				$('#offerInfo input[type=radio]').filter(function () {
					return this.value == packageData.isShowName;
				}).attr('checked', 'checked');

				$('#StageEndTime').datetimepicker({
					step: 5,
					lang: 'ch',
					format: 'Y-m-d H:i:s',
					minDate: GMTToStr(new Date()),
					value: GMTToStr(new Date())
				});

				$("#offerDetail").append(['<div class="col-md-12 no-padding">',
					'<table class="table table-bordered leftTab"></table>',
					'</div>',
				].join(''));

				var column_left, column_right;

				if (packageData.auctionType <= 1) {

					if (packageData.auctionModel == 0) {
						$('.TimeText').html((res.data.stage == 2 ? '限时' : '倒计时'));
						if (packageData.isShowPrice != 1) {
							$('.leftTab').append('<tr><td><div class="showPriceBox"><div class="item">当前最低报价（元）<span class="minPrice">暂无</span></div><div class="item">竞价起始价（元）<span>' + (packageData.biddingStartPrice || '暂无') + '</span></div></div></td></tr>');
						} else {
							$('.leftTab').append('<tr><td><div class="showPriceBox"><div class="item">竞价起始价（元）<span>' + (packageData.biddingStartPrice || '无') + '</span></div></div></td></tr>');
						}

						refreshLog()
					}
					if (packageData.auctionModel == 1) {
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
							title: isDfcm?"物料名称":"名称",
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
							field: 'technology',
							title: '材料工艺',
							width: '200px',
							visible: isDfcm?true:false,
						}, {
							field: 'detailedCount',
							title: '数量',
							width: '80px',
						}, {
							field: 'detailedUnit',
							title: '单位',
							width: '80px',
						},{
							field: "manner",
							title: "方式",
							visible: isDfcm?true:false,
							formatter: function (value, row, index) {
								//1  购买、2 租赁、3制作
								if(value == '1'){
									return '购买'
								}else if(value == '2'){
									return '租赁'
								}else if(value == '3'){
									return '制作'
								}else{
									return '-'
								}
							}
						
						}, {
							field: 'minPrice',
							title: '最低报价',
							align: 'right',
							width: '200px',
						},
						{
							field: 'enterpriseName',
							title: '最低出价供应商',
							align: 'left',
							width: '200px',
						}
						];
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
							formatter: function (value, row, index) {
								return Number(row.offerMoney) * detailedCount;
							}
						}, {
							field: 'subDate',
							title: '报价时间'
						}];
						refreshLog()
					}
				} else {
					column_left = [{
						title: '轮次',
						formatter: function (value, row, index) {
							return '第' + sectionToChinese(index + 1) + '轮报价';
						}
					},{
						field: 'startPrice',
						title: '起始报价（元）',
						align: "center",
						formatter: function (value, row, index) {
							if (index > 0 && (index + 1) * 2 <= curStage) {
								return row.startPrice || packageData.biddingStartPrice || row.findPrice;
							} else return row.startPrice;
						}
					},{
						field: 'winPrice',
						title: '最低报价（元）',
						align: "center",
						formatter: function (value, row, index) {
							return value;
						}
					}];
					if (packageData.outType == 1 && (curStage == 4 || curStage == 6) && createType == 0) {
						column_left.push({
							title: '操作',
							formatter: function (value, row, index) {
								return curStage / 2 - 2 == index && "<button class='btn btn-primary btn-sm setSupplierOut'>设置</button>" || "";
							},
							events: {
								'click .setSupplierOut': function (e, value, row, index) {
									//--------------------------设置淘汰评委--------------------------
									var outSupplier = index ? 'secondOutSupplier' : 'firstOutSupplier',
										keepSupplier = index ? 'secondKeepSupplier' : 'firstKeepSupplier';
									top.layer.open({
										title: '设置当前轮次淘汰保留数',
										content: ['<div class="setOutKeep">',
											'<div><label>第' + sectionToChinese(index + 1) + '轮淘汰数</label>',
											'<input  class="form-control" name="' + outSupplier +
											'" value="' + (packageData[outSupplier] || '') + '"></div>',
											'<div><label>第' + sectionToChinese(index + 1) + '轮最低保留数</label>',
											'<input  class="form-control" name="' + keepSupplier +
											'" value="' + (packageData[keepSupplier] || '') + '"></div>',
											'</div>'
										].join(''),
										yes: function (index, layero) {
											var outNum = top.$('.setOutKeep input[name=' + outSupplier + ']').val(),
												keepNum = top.$('.setOutKeep input[name=' + keepSupplier + ']').val();
											if (!outNum || !keepNum) {
												return top.layer.msg("淘汰/保留数量不能为空");
											}
											var param = {
												id: packageId,
												projectId: projectId
											};
											param[outSupplier] = packageData[outSupplier] = outNum;
											param[keepSupplier] = packageData[keepSupplier] = keepNum;
											$.post(urlAuctionSetting, param, function (res) {
												if (res.success) {
													top.layer.msg("设置成功！");
													top.layer.close(index);
												} else top.layer.alert("设置失败！");
											})
										}
									});
								}
							}
						})
					}
					packageData.stage % 2 && refreshLog();
				}
				recordOnce();
				//初始化tab
				var vheight = $(document).height()- 200;
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

		}
	})
}

//倒计时
function countDown() {
	setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url: top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			data: {
				packageId: packageId
			},
			beforeSend: function (xhr) {
				var token = $.getToken();
				xhr.setRequestHeader("Token", token);
			},
			success: function (res) {
				if (!res.success) return;
				if (!res.data.stage) {
					if (res.data.auctionType == '7') {
						return jumpSingleOfferHistory()
					}
					return jumpToHistory(); //竞价结束
				}
				if (res.data.stage != curStage) {
					curStage = packageData.stage = res.data.stage;
					if (packageData.auctionType > 1) {
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
				$('.TimeText').html((res.data.stage == 2 ? '限时' : (packageData.auctionType < 2 ? '倒计时' : (curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束') : ('距离第' + sectionToChinese(curStage / 2) + '轮报价开始')))));
				// 继续执行countDown

				// $('#offerDetail .timeInval').html('<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
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
			auctionType: packageData.auctionType
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (!res.success || !res.data) return;
			recordOnceData = res.data;
 
			if (packageData.auctionType <= 1) {
				if (packageData.auctionModel == 0) {
					// packageData.offerlogs = res.data[packageId].offerLog;
					// var packageRank = res.data[packageId].supplierRank;
					// packageData.offerlogs = packageData.offerlogs.sort(function (a, b) {
					// 	return Number(a.offerMoney) > Number(b.offerMoney) ? 1 : -1
					// });
					//	$('.rightTab').bootstrapTable("load", packageData.offerlogs);
					$('.minPrice').html(recordOnceData.winPrice || '暂无');
					//$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
				}
				if (packageData.auctionModel == 1) {
					for (var i = 0; i < packageData.packageDetails.length; i++) {

						
						if(res && res.data && res.data.details){
							var detail_info = res.data.details[packageData.packageDetails[i].id];
							var row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.packageDetails[i].id);
							var elemTr = $('.leftTab tbody tr').eq(row.index);
							if (detail_info && detail_info.offerItems) {
								if(packageData.isShowPrice != 1){
									if(isDfcm){
										elemTr.find('td').eq(7).html(detail_info.winPrice);
										elemTr.find('td').eq(8).html(detail_info.enterpriseName);
									}else{
										elemTr.find('td').eq(5).html(detail_info.winPrice);
										elemTr.find('td').eq(6).html(detail_info.enterpriseName);
									}
								}else{
									if(isDfcm){
										elemTr.find('td').eq(7).html('<font color="red">***</font>');
										elemTr.find('td').eq(8).html('<font color="red">***</font>');
									}else{
										elemTr.find('td').eq(5).html('<font color="red">***</font>');
										elemTr.find('td').eq(6).html('<font color="red">***</font>');
									}
									
								}
							}
							row.offerItems = [];
							// if (elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
						}else{
						 
						}

					}
					// if(!$('.selected-tr').length) $('.leftTab tbody tr[data-index=0]').click();
					// else $('.selected-tr').click();
				}
			} else {
				var curRound = Math.floor((curStage - 1) / 2) - 1,
					elemTr = $('.leftTab tbody tr').eq(curRound);

				
				if(recordOnceData && recordOnceData.offerRounds){
					if(recordOnceData.offerRounds[curRound] == undefined){
						recordOnceData.offerRounds.push({
							'offerRound': curRound +1,
							'startPrice': recordOnceData.offerRounds[curRound-1].winPrice,
							'winPrice':'暂无',
							'winPriceCN': '暂无'
						});
					}
				}else{
					recordOnceData.offerRounds = [];
					recordOnceData.offerRounds.push({
						'offerRound': curRound +1,
						'startPrice': packageData.biddingStartPrice ? packageData.biddingStartPrice : '暂无',
						'winPrice':'暂无',
						'winPriceCN': '暂无'
					});
				}



				if (res.data && res.data.offerRounds && res.data.offerRounds.length) {
					if(recordOnceData.offerRounds[curRound].winPrice){
						elemTr.find('td').eq(2).html('<font style="font-weight:bold; color:red">'+recordOnceData.offerRounds[curRound].winPrice+'</font>');
					}else{
						elemTr.find('td').eq(2).html('<font style="font-weight:bold; color:red">-</font>');
					}
					
				}
				// packageData.offerRounds[curRound].offerLog = res.data.offerLog; 
			}
			setTimeout(refreshLog, 5000);
		}
	});
}

//设置截止时间 or 设置是否显示竞买人
$("#offerInfo button").click(function () {
	var msgarr = ['修改竞价截止时间', '显示竞买者', '隐藏竞买者'],
		isShowName = $("#offerInfo input[name='showEnterpriseName']:checked").val(),
		opera = $(this).data('event') == 'changeEndTime' ? 0 : (isShowName == 0 ? 1 : 2);
	top.layer.confirm('确认' + msgarr[opera] + '？', {
		btn: ['确认', '取消'] //按钮
	}, function (index) {
		var obj = {
			id: packageId
		};
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
 
function getIndex(value, row, index) {
	return index + 1;
}

function jumpToDetail() {
	location.href = $.parserUrlForToken("../../AuctionProjectPackage/model/detailListMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}

function jumpToDetaillist() {
	location.href = $.parserUrlForToken("../../AuctionProjectPackage/model/detailListHistoryMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}
// 跳转到单项目竞价页面
function jumpSingleOfferView() {
	location.href = $.parserUrlForToken("../../AuctionProjectPackage/model/singleOfferView.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}
// 跳转到单项目竞价历史页面
function jumpSingleOfferHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("../../AuctionProjectPackage/model/singleBidHistory.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}

//跳转历史页面
function jumpToHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("OfferHistoryInfo.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}