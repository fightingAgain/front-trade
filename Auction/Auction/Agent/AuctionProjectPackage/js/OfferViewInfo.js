//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
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
var isJD = location.search.getQueryString("special");
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

//竞价信息
function auctionInfo() {
	$.ajax({
		url: urlViewAuctionInfo,
		type: "post",
		data: {
			packageId: packageId,
			state: 0,
			tenderType: 1,
		},
		success: function (res) {
			if (res.success) {
				packageData = res.data;
				console.log(packageData.auctionType)
				console.log(packageData.isEnd)
				if (packageData.auctionType == '6') {
					if (packageData.isEnd || packageData.isStopCheck == 1) {
						jumpToDetaillist()
					} else {
						jumpToDetail()
					}
				} else if (packageData.auctionType == '7') {
					if (packageData.isEnd || packageData.isStopCheck == 1) {
						jumpSingleOfferHistory()
					} else {
						jumpSingleOfferView()
					}
				} else {
					if (packageData.isEnd || packageData.isStopCheck == 1) jumpToHistory();
				}
				curStage = packageData.stage;
				$("#offerInfo [data-field]").each(function () {
					if ($(this).data('field') == 'packageName') {
						if (packageData.projectSource > 0) {
							$(this).html(packageData[$(this).data('field')] + '<span class="red">(重新竞价)</span>');
						} else {
							$(this).html(packageData[$(this).data('field')]);
						}
					} else {
						$(this).html(packageData[$(this).data('field')]);
					}
				});
				$("#offerInfo h1").html(['自由竞价', '单轮竞价', '多轮竞价', '多轮竞价', '不限轮次'][packageData.auctionType]);

				$('#offerInfo input[type=radio]').filter(function () {
					return this.value == packageData.isShowName;
				}).attr('checked', 'checked');
				$('#StageEndTime').datetimepicker({
					step: 5,
					lang: 'ch',
					format: 'Y-m-d H:i:s',
					minDate: new Date(packageData.curStageEndTime),
					value: GMTToStr(new Date(packageData.curStageEndTime))
				});
				$("#offerDetail").append(['<div class="col-md-12 no-padding">',
					'<table class="table table-bordered leftTab"></table>',
					'</div>',
					//					'<div class="col-md-6 no-padding">',
					//					'<table class="table table-bordered rightTab"></table>',
					//					'</div>'
				].join(''));
				var column_left, column_right;
				switch (packageData.auctionModel) {
					case 0: //按包件
						$('.leftTab').append([

							//'<tr><td colspan="2"><br />出价竞买者：<span class="minEnterprise"></span></td></tr>',
							'<tr><td colspan="2" class="countDown">' + (res.data.stage == 2 ? '限时' : '倒计时') + '<label class="timeInval"></label></td></tr>',
							packageData.isShowPrice == 1 ? '' : '<tr><td colspan="2" style="font-size: 20px !important;font-weight: bold;">当前最低报价(元):<span class="minPrice"></span></td></tr>',
							'<tr><td colspan="2" style="font-size: 20px !important;font-weight: bold;">竞价起始价（元）:' + (packageData.rawPrice || '无') + '</td></tr>'
						]);
						refreshLog()
						break;
					case 1: //按明细
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
							field: 'minPrice',
							title: '最低报价',
							align: 'center'

						},
						{
							field: 'enterpriseName',
							title: '最低出价供应商',
							align: 'left',
							halign: 'left'
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
						break;
					default: //多轮
						column_left = [{
							title: '轮次',
							formatter: function (value, row, index) {
								return '第' + sectionToChinese(index + 1) + '轮报价';
							}
						},
						//						{
						//							field: 'enterpriseName',
						//							title: '最低价竞买人',
						//							align: 'left'
						//						},
						{
							field: 'rawPrice',
							title: '起始报价（元）',
							align: "center",
							formatter: function (value, row, index) {
								if (index > 0 && (index + 1) * 2 <= curStage) {
									return row.rawPrice || packageData.offerlogs[index - 1].minPrice;
								} else return row.rawPrice;
							}
						}, {
							field: 'minPrice',
							title: '最低报价（元）',
							align: "center"
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
						break;
				}
				//初始化tab
				column_left && $('.leftTab').bootstrapTable({
					columns: column_left,
					data: packageData.details || packageData.offerlogs,
					uniqueId: 'id',
					height: 500,
					onClickRow: function (row, elem) {
						$('.selected').removeClass('selected');
						$(elem).addClass('selected');
						if (packageData.auctionModel == 1) { //明细
							detailedCount = Number(row.detailedCount);
							console.log(row.offerItems)
							loadOfferLog(row.offerItems);
							//							$('.rightTab').bootstrapTable("load", row.offerItems);
						} else { //多轮
							loadOfferLog(packageData.offerlogs[$(elem).index()].offerLog || []);
						}
					}
				}) && $('.countDown').append((packageData.auctionModel == 1 ? (curStage == 2 ? '限时' : '倒计时') :
					(curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束剩余') :
						('距离第' + sectionToChinese(curStage / 2) + '轮报价开始剩余'))) +
					'<label class="timeInval"></label>');
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
					if(packageData.auctionType > 1) {
						return location.reload();
					}
//					if (packageData.auctionType == 4 || (packageData.auctionType > 1 && packageData.outType == 1)) {
//						return location.reload();
//					}
				}
				$('#offerDetail .timeInval').html('<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
				$('.notEliminatedCount').html(res.data.notEliminatedCount || 0);
			}
		});
	} catch (e) { }
}

//轮询刷新记录
function refreshLog() {
	$.ajax({
		url: urlViewAuctionInterval,
		async: false,
		data: {
			packageId: packageId,
			auctionModel: packageData.auctionModel
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
		},
		success: function (res) {
			if (!res.success || !res.data) return;
			switch (packageData.auctionModel) {
				case 0: //包件
					packageData.offerlogs = res.data[packageId].offerLog;
					var packageRank = res.data[packageId].supplierRank;
					packageData.offerlogs = packageData.offerlogs.sort(function (a, b) {
						return Number(a.offerMoney) > Number(b.offerMoney) ? 1 : -1
					});
					//						$('.rightTab').bootstrapTable("load", packageData.offerlogs);
					$('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
					//$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
					break;
				case 1: //明细
					for (var i = 0; i < packageData.details.length; i++) {
						var detail_info = res.data[packageData.details[i].id],
							row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.details[i].id),
							elemTr = $('.leftTab tbody tr').eq(row.index);
						if (detail_info.supplierRank.length) {
							elemTr.find('td').eq(5).html(detail_info.supplierRank[0].offerMoney);
							elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
						}
						row.offerItems = detail_info.offerLog;
						if (elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
					}
					//				if(!$('.selected-tr').length) $('.leftTab tbody tr[data-index=0]').click();
					// 				else $('.selected-tr').click();
					break;
				default: //多轮
					var curRound = Math.floor((curStage - 1) / 2) - 1,
						elemTr = $('.leftTab tbody tr').eq(curRound);
					if (res.data && res.data.supplierRank.length) {
						//							elemTr.find('td').eq(1).html(res.data.supplierRank[0].enterpriseName);
						elemTr.find('td').eq(2).html(res.data.supplierRank[0].offerMoney);
					}
					packageData.offerlogs[curRound].offerLog = res.data.offerLog;
					if (elemTr.hasClass('selected')) loadOfferLog(res.data.offerLog);
					break;
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

function loadOfferLog(datas) {
	//	$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
	return index + 1;
}

function jumpToDetail() {
	location.href = $.parserUrlForToken("detailListMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=1&isJD=" + isJD);
}

function jumpToDetaillist() {
	location.href = $.parserUrlForToken("detailListHistoryMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=1&isJD=" + isJD);
}
// 跳转到单项目竞价页面
function jumpSingleOfferView() {
	location.href = $.parserUrlForToken("singleOfferView.html?projectId=" + projectId + "&id=" + packageId + "&tType=1&isJD=" + isJD);
}
// 跳转到单项目竞价历史页面
function jumpSingleOfferHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("singleBidHistory.html?projectId=" + projectId + "&id=" + packageId + "&tType=1&isJD=" + isJD);
}

//跳转历史页面
function jumpToHistory() {
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("OfferHistoryInfo.html?projectId=" + projectId + "&id=" + packageId + "&tType=1&isJD=" + isJD);
}