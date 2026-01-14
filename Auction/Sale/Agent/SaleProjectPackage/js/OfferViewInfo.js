//竞卖项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
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
var packageData,curStage,detailedCount;

$(function() {
	//项目基础信息	
	auctionInfo();

	if(createType == 1){
		//非本人创建项目
		$(".myView").hide();
	}else{
		$(".otherView").hide();
	}
})

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
		success: function(res) {
			if (res.success) {
				packageData = res.data;
				if(packageData.isEnd) jumpToHistory();
				curStage = packageData.stage;
				$("#offerInfo [data-field]").each(function(){$(this).html(packageData[$(this).data('field')])});
				$("#offerInfo h1").html(['自由竞卖', '单轮竞卖','多轮竞卖','多轮竞卖'][packageData.auctionType]);
				$('#auctionStartDate').html(packageData.auctionStartDate);
				$('#offerInfo input[type=radio]').filter(function(){
					return this.value == packageData.isShowName;}).attr('checked','checked');
//				laydate.render({elem: $('[data-field=curStageEndTime]')[0],type: 'datetime',
//					min: packageData.curStageEndTime,value:new Date(packageData.curStageEndTime)});
				 $('#StageEndTime').datetimepicker({
						step:5,
						lang:'ch',
						format: 'Y-m-d H:i:s',
						minDate:new Date(packageData.curStageEndTime),
						value:GMTToStr(new Date(packageData.curStageEndTime))
				});
				
				$("#offerDetail").append(['<div class="col-md-12 no-padding">',
					'<table class="table table-bordered leftTab"></table>',
//					'</div>',
//					'<div class="col-md-6 no-padding">',
//					'<table class="table table-bordered rightTab"></table>',
					'</div>'].join(''));
				var column_left,column_right;			
				switch (packageData.auctionModel) {
					case 1: //按明细
						column_left=[{
							title: '序号',
							width: '50px',
							align: "center",
							formatter: function(value, row, index) {
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
//						{
//							field: 'enterpriseName',
//							title: '最高出价供应商'
//						}
						];
//						column_right=[{
//							title: '序号',
//							width: '50px',
//							formatter: getIndex
//						}, {
//							field: 'enterpriseName',
//							title: '竞卖人',
//							align: "left"
//						}, {
//							field: 'offerMoney',
//							title: '合价（元）',
//							align: "right"
//						},
//						{
//							title: '合价（元）',
//							align: "right",
//							formatter:function(value, row, index){
//								return Number(row.offerMoney) * detailedCount;
//							}
//						},
//						{
//							field: 'subDate',
//							title: '报价时间'
//						}];
						break;
					default://多轮
						column_left=[{
							title: '轮次',
							formatter: function(value, row, index){
								return '第' + sectionToChinese(index+1) + '轮报价';
							}
						}, 
//						{
//							field: 'enterpriseName',
//							title: '最高价竞卖人'
//						}, 
						{
							field: 'rawPrice',
							title: '起始报价（元）',
							align: "center",
							formatter: function(value, row, index){
								//return row.rawPrice || packageData.offerlogs[index - 1].maxPrice;
								if(index && (curStage-1)/2 - 1 == index){
									return row.rawPrice || packageData.offerlogs[index - 1].maxPrice;
								}else return row.rawPrice;
								
							}
						}, {
							field: 'maxPrice',
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
						break;
				}
				//初始化tab

				column_left && $('.leftTab').bootstrapTable({
									columns: column_left,
									data:packageData.details || packageData.offerlogs,
									uniqueId: 'id',
									height: 500,
									onClickRow:function(row,elem){
										$('.selected').removeClass('selected');
										$(elem).addClass('selected');
										if(packageData.auctionModel == 1){//明细
											detailedCount = Number(row.detailedCount);
											loadOfferLog(row.offerItems);
											//$('.rightTab').bootstrapTable("load", row.offerItems);
										}else{//多轮
											loadOfferLog(packageData.offerlogs[$(elem).index()].offerLog || []);
										}
									}
								}) && $('.countDown').append((packageData.auctionModel == 1 ? (curStage == 2 ? '限时' : '倒计时') :
										(curStage % 2 ? ('距离第' + sectionToChinese((curStage - 1) / 2) + '轮报价结束剩余') : 
											('距离第' + sectionToChinese(curStage / 2) + '轮报价开始剩余'))) +
									'<label class="timeInval"></label>');
				
//				$('.rightTab').bootstrapTable({
//					data: packageData.auctionModel == 0 ? packageData.offerlogs : [],
//					height: 500,
//					columns: column_right || 
//						[{
//							title: '序号',
//							width: '50px',
//							formatter: getIndex
//						}, {
//							field: 'enterpriseName',
//							title: '竞卖人',
//							align: "left"
//						}, {
//							field: 'offerMoney',
//							title: '报价（元）',
//							align: "right"
//						}, {
//							field: 'subDate',
//							title: '报价时间'
//						}]
//				});				
				
			}
			countDown();
			packageData.stage%2 && refreshLog();
		}
	})
}

//倒计时
function countDown() {
	setTimeout(countDown, 950); //未结束就循环倒计时
	try {
		$.ajax({
			url:top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
			data:{packageId: packageId},
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success:function(res){
				if(!res.success) return;
				if (!res.data.stage) return jumpToHistory(); //竞卖结束
				if (res.data.stage != curStage){
					curStage = res.data.stage;
					if(packageData.auctionType > 1){
						return location.reload();
					}
				}
				$('#offerDetail .timeInval').html('<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
				$('.notEliminatedCount').html(res.data.notEliminatedCount || 0);
			}
		});
	} catch (e) {}
}


//轮询刷新记录
function refreshLog(){
	$.ajax({
			url:urlViewAuctionInterval,
			data:{packageId: packageId,auctionModel: packageData.auctionModel,tenderType:2},
			async:false,
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success:function(res){
				if(!res.success || !res.data) return; 
		switch(packageData.auctionModel){
			case 0://包件
				packageData.offerlogs = res.data[packageId].offerLog;
				var packageRank = res.data[packageId].supplierRank;
				packageData.offerlogs = packageData.offerlogs.sort(function(a,b){return Number(a.offerMoney)>Number(b.offerMoney)?1:-1});
				//$('.rightTab').bootstrapTable("load", packageData.offerlogs);
				$('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
				$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
			break;
			case 1://明细
				for(var i = 0; i < packageData.details.length; i++){
					var detail_info = res.data[packageData.details[i].id],
						row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.details[i].id),
						elemTr = $('.leftTab tbody tr').eq(row.index);
					if(detail_info.supplierRank.length){
						elemTr.find('td').eq(5).html(detail_info.supplierRank[0].offerMoney);
						//elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
					}
					row.offerItems = detail_info.offerLog;
					if(elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
				}
//				if(!$('.selected-tr').length) $('.leftTab tbody tr[data-index=0]').click();
// 				else $('.selected-tr').click();
			break;
			default://多轮
				var curRound = Math.floor((packageData.stage-1)/2)-1,
					elemTr = $('.leftTab tbody tr').eq(curRound);
				if(res.data && res.data.supplierRank.length){
					//elemTr.find('td').eq(1).html(res.data.supplierRank[0].enterpriseName);
					elemTr.find('td').eq(2).html(res.data.supplierRank[0].offerMoney);
				}
				packageData.offerlogs[curRound].offerLog = res.data.offerLog;
				if(elemTr.hasClass('selected')) loadOfferLog(res.data.offerLog);
			break;
		}
		setTimeout(refreshLog,5000);
			}
		});
//	$.post(urlViewAuctionInterval,{packageId: packageId,auctionModel: packageData.auctionModel,tenderType:2},function(res){
//		if(!res.success || !res.data) return; 
//		switch(packageData.auctionModel){
//			case 0://包件
//				packageData.offerlogs = res.data[packageId].offerLog;
//				var packageRank = res.data[packageId].supplierRank;
//				packageData.offerlogs = packageData.offerlogs.sort(function(a,b){return Number(a.offerMoney)>Number(b.offerMoney)?1:-1});
//				$('.rightTab').bootstrapTable("load", packageData.offerlogs);
//				$('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
//				$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
//			break;
//			case 1://明细
//				for(var i = 0; i < packageData.details.length; i++){
//					var detail_info = res.data[packageData.details[i].id],
//						row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.details[i].id),
//						elemTr = $('.leftTab tbody tr').eq(row.index);
//					if(detail_info.supplierRank.length){
//						elemTr.find('td').eq(5).html(detail_info.supplierRank[0].offerMoney);
//						elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
//					}
//					row.offerItems = detail_info.offerLog;
//					if(elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
//				}
////				if(!$('.selected-tr').length) $('.leftTab tbody tr[data-index=0]').click();
//// 				else $('.selected-tr').click();
//			break;
//			default://多轮
//				var curRound = (packageData.stage-1)/2-1,
//					elemTr = $('.leftTab tbody tr').eq(curRound);
//				if(res.data && res.data.supplierRank.length){
//					elemTr.find('td').eq(1).html(res.data.supplierRank[0].enterpriseName);
//					elemTr.find('td').eq(3).html(res.data.supplierRank[0].offerMoney);
//				}
//				packageData.offerlogs[(packageData.stage-1)/2-1].offerLog = res.data.offerLog;
//				if(elemTr.hasClass('selected')) loadOfferLog(res.data.offerLog);
//			break;
//		}
//		setTimeout(refreshLog,5000);
//	})
}
//设置截止时间 or 设置是否显示竞买人
$("#offerInfo button").click(function() {
	var msgarr = ['修改竞卖截止时间','显示竞卖者','隐藏竞卖者'],isShowName = $("#offerInfo input[name='showEnterpriseName']:checked").val(),
		opera = $(this).data('event') == 'changeEndTime' ? 0 : (isShowName == 0 ? 1 : 2);
	top.layer.confirm('确认'+msgarr[opera]+'？', {
		btn: ['确认', '取消'] //按钮
	}, function(index) {
		var obj = {id: packageId};
		!opera ? (obj.endTime = $("#offerInfo input[type='text']").val()) : (obj.isShowName = isShowName);
		$.ajax({
			url: !opera ? urlchangeEndTime : urlAuctionSetting,
			data: obj,
			success: function(res) {
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

function loadOfferLog(datas){
	//$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
	return index + 1;
}

//跳转历史页面
function jumpToHistory(){
	sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
	location.href = $.parserUrlForToken("OfferHistoryInfo.html?projectId=" + projectId + "&id=" + packageId + "&tType="+"1");
}