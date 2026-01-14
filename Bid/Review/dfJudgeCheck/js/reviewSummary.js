var CheckTotalUrl = config.Reviewhost + "/ReviewControll/findCheckTotal.do";
var saveTotalUrl = config.Reviewhost + "/ReviewControll/saveTotalCheckResult.do";
var bidPriceCheckLists, bidChecksLists, bidCheckItemsLists;

var reasonIndex = []; //需要输入修改原因的textarea下标
var mostCol = 0; //最多评审项
var rowspanHtml = '';
var trArr = [];
function reviewSummary(node) {
	var flag = false;
	var param = {
		"method": 'getSummaryData',
		"nodeType": node.nodeType
	}; 
	reviewFlowNode(param, function(data) {
		reasonIndex = [];
		flag = true;
		loadContent('model/reviewSummary/content.html', function() {
			bidPriceCheckLists = data.bidPriceChecks; //投标人数数组

			//          bidChecksLists=data.bidChecks;//评审大项
			//			console.log(data.bidChecks)
			var manageData = data.bidChecks;
			handleToArr(data.bidChecks);//处理成数组
			console.log(trArr)
			
			for(var i = 0; i < manageData.length; i++) {
				manageData[i].bidCheckItems = manageTerms(manageData[i].bidCheckItems)
			}
			bidChecksLists = manageData;
			//           console.log(bidChecksLists)
			var bidCheckItemsObj = getCols(bidChecksLists);
			var bidCheckItemRow = getRows(bidCheckItemsObj.data);
			//          console.log(bidCheckItemRow)
			bidChecksLists = bidCheckItemsObj.data;

			function eachCheck(data) {
				for(var j = 0; j < data.length; j++) {
					var e = data[j];
					if(e.bidChecks && e.bidChecks.length > 0) {
						eachCheck(e.bidChecks);
					} else {
						e.bidChecks = [];
						var isExit = true;
						for(var i = 0; i < bidCheckItems.length; i++) {
							if(e.id == bidCheckItems[i].checkId) {
								e.bidChecks.push(bidCheckItems[i]);
								isExit = false;
							}
						}
						if(isExit) {
							e.bidChecks = [{
								id: e.id,
								checkName: "",
								cols: bidCheckItemsObj.cols
							}];
						}
					}

				}

				return data;

			}
			tableCheckTotal(data);
		});
	}, false);
	return flag;
}
//汇总页面渲染
function tableCheckTotal(data) {
	$('#btn-box').html('');
	var list1 = '';
	if(data.isFinish == 0 && isEnd == 0 && data.isEdit == 1) {
		list1 += '<button id="savePriceCheckTotal" class="btn btn-primary btn-strong keyButton">提交</button></div>'
	}
	list1 += '<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';
	var list2 = '<table id="checkTotalTable" class="table table-bordered table-striped" style="margin-top:10px">'
	list2 += "<thead><tr>";
	list2 += "<th style='text-align:left' width='200px'>投标人名称</th>";
	if(examType == 2) {
		if(rules){
			list2 += "<th style='text-align:center' width='110px'>" + (bidPriceCheckLists[0].otherBidPrice ? "投标总价（" + bidSectionInfo.rateUnit + ")" : "投标总价（" + bidSectionInfo.priceUnit + '）' || '元）') + "</th>";
		}else{
			list2 += "<th style='text-align:right' width='100px'>" + (bidPriceCheckLists[0].otherBidPrice ? "报价（" + bidSectionInfo.rateUnit + ")" : "报价（" + bidSectionInfo.priceUnit + '）' || '元）') + "</th>";
		}
	}
	if(rules){
		list2 += "<th style='text-align:center' width='110px'>" + (bidPriceCheckLists[0].otherBidPrice ? "评标价格（" + bidSectionInfo.rateUnit + ")" : "评标价格（" + bidSectionInfo.priceUnit + '）' || '元）') + "</th>";
	}else{
		list2 += "<th style='text-align:center' width='110px'>最终得分</th>";
	}
	
	
	list2 += "<th style='text-align:center' width='75px'>淘汰</th>";
	list2 += "<th style='text-align:center' width='75px'>排名</th>";
	list2 += "<th style='text-align:center' width='75px'>候选人</th>";
	list2 += "<th style='text-align:center' width='200px'>修改原因</th>";
	list2 += "<th style='text-align:center' width='60px'>操作</th>";
	list2 += "</tr></thead>";
	var num = 0,
		indexNum = 0
	for(var s = 0; s < bidChecksLists.length; s++) {
		if(bidChecksLists[s].checkType == 3) { //打分项
			num++
		}
	};
	list2 += '<tbody>';
	/* 资格预审-有限数量制-评标汇总功能调整如下：  (BU2023070005评标报告模板优化（招标类）   2024.02.20)

1、进入到该页面时，系统根据有限数量制设置的家数X进行候选人的勾选，勾选规则为未淘汰的前X名投标人。注：得分相同时，排名相同，即同分同序，后面的跳过排名，按实际家数排名。如3个并列第1，则第四名排名就是4，而非2。

1.1、勾选的情形

情形1：未淘汰投标人M小于等于X，则全选；

情形2：M大于X，但是第X名不存在排名相同的投标人，勾选前X个投标人。

情形3：M大于X，但是第X名的投标人存在与之同分的，则勾选X名之前且与X名同分的投标人。（实际勾选家数大于X）

解释：有限数量制设置数量X为5，排名为1，1，3，3，5，5，5，8，则应该勾选1，1，3，3，5，5，5；或排名为1，1，1，1，1，1，1，8，则应该勾选1，1，1，1，1，1，1；或排名为1，2，3，4，4，4，7，8，则应该勾选1，2，3，4，4，4。

2、评委组长可以修改候选人的勾选，修改后必须输入修改原因。

3、排名不可操作，系统自动根据逻辑进行勾选。 */
	var lastOrders = 3;
	if(examType == 1 && bidSectionInfo.pretrialCheckType == 2){
		if(bidPriceCheckLists[Number(pretrialPassNumber)-1].orders){
			lastOrders = bidPriceCheckLists[Number(pretrialPassNumber)-1].orders
		}else{
			lastOrders = pretrialPassNumber
		}
	}
	for(var n = 0; n < bidPriceCheckLists.length; n++) { //投标人循环
		list2 += "<tr>";
		list2 += "<td style='text-align:left' width='200px'>" + showBidderRenameMark(bidPriceCheckLists[n].supplierId, bidPriceCheckLists[n].enterpriseName, RenameData, 'content') + "</td>";
		if(examType == 2) {
			if(rules){
				list2 += "<td style='text-align:right' width='" + (bidPriceCheckLists[n].otherBidPrice ? "200" : "100") + "px'>" + (bidPriceCheckLists[n].fixFinalPrice ? bidPriceCheckLists[n].fixFinalPrice : '/') + "</td>";
			}else{
				list2 += "<td style='text-align:right' width='" + (bidPriceCheckLists[n].otherBidPrice ? "200" : "100") + "px'>" + (bidPriceCheckLists[n].otherBidPrice ? bidPriceCheckLists[n].otherBidPrice : (bidPriceCheckLists[n].totalCheck ? bidPriceCheckLists[n].totalCheck : bidPriceCheckLists[n].bidPrice ? bidPriceCheckLists[n].bidPrice : '/')) + "</td>";
			}
			
		}
		if(rules){
			list2 += "<td style='text-align:center' width='75px'>" + (bidPriceCheckLists[n].totalCheck?bidPriceCheckLists[n].totalCheck:"/") + "</td>";
		}else{
			list2 += "<td style='text-align:center' width='75px'>" + getScore(bidPriceCheckLists[n].score) + "</td>";
		}
		list2 += "<td style='text-align:center' width='75px'>" + (bidPriceCheckLists[n].isKey == 1 ? '未淘汰' : "淘汰") + "</td>";
		if(data.isFinish == 0 && isEnd == 0 && data.isEdit == 1) {
			list2 += "<td style='text-align:center' width='75px'>"
			if(bidPriceCheckLists[n].isKey == 1 && data.summaryType == 1) {
				list2 += "<input style='width:60px' class='isorders orders" + n + "' data-order='" + bidPriceCheckLists[n].orders + "' data-index='" + n + "' type='number' "+(examType == 1 && bidSectionInfo.bidderPriceType ==1?'disabled=""' : '')+" value='" + bidPriceCheckLists[n].orders + "' />"
			} else {
				list2 += '/'
			}
			list2 += "</td>";
			if(data.summaryType == 1) {
				if(examType == 1 && bidSectionInfo.pretrialCheckType == 1){
					list2 += "<td style='text-align:center' width='75px'><input type='checkbox' data-choose='" + bidPriceCheckLists[n].isKey + "' data-index='" + n + "' class='isCandidate isChoose" + n + "' " + (bidPriceCheckLists[n].isKey == 0 ? 'disabled=""' : 'checked="" data-mark="1"') + "/></td>";
					list2 += "<td style='text-align:center' width='100px'><textarea rows='2' class='isReason" + n + "' style='padding:5px;resize:none;width:100%;'></textarea></td>";
				}else{
					if(bidPriceCheckLists[n].orders <= lastOrders) {
						list2 += "<td style='text-align:center' width='75px'><input type='checkbox' data-choose='" + bidPriceCheckLists[n].isKey + "' data-index='" + n + "' class='isCandidate isChoose" + n + "' " + (bidPriceCheckLists[n].isKey == 0 ? 'disabled=""' : 'checked="" data-mark="1"') + "/></td>";
						list2 += "<td style='text-align:center' width='100px'><textarea rows='2' class='isReason" + n + "' style='padding:5px;resize:none;width:100%;'></textarea></td>";
					} else {
						list2 += "<td style='text-align:center' width='75px'><input type='checkbox' data-choose='0' data-index='" + n + "' class='isCandidate isChoose" + n + "' " + (bidPriceCheckLists[n].isKey == 0 ? 'disabled=""' : '') + "/></td>";
						list2 += "<td style='text-align:center' width='100px'><textarea rows='2' class='isReason" + n + "' style='padding:5px;resize:none;width:100%;'></textarea></td>";
					}
				}
			} else if(data.summaryType == 3) {
				list2 += "<td style='text-align:center' width='75px'>/</td>";
				list2 += "<td style='text-align:center' width='100px'>/</td>";
			}
		} else if(data.isFinish == 1) {
			list2 += "<td style='text-align:center' width='75px'>" + (bidPriceCheckLists[n].orders || "/") + "</td>";
			list2 += "<td style='text-align:center' width='75px'>" + (bidPriceCheckLists[n].isChoose == 0 ? "否" : "是") + "</td>";
			list2 += "<td style='text-align:center' width='200px'>" + (bidPriceCheckLists[n].reason ? bidPriceCheckLists[n].reason : '/') + "</td>";
		}
		list2 += '<td style="text-align:center" width="60px">'
		list2 += '<button type="button" class="btn btn-sm btn-primary btn_view_open " data-index="' + n + '"><span class="glyphicon glyphicon-chevron-down"></span></button>';
		list2 += '<button type="button" class="btn btn-sm btn-primary btn_view_close" data-index="' + n + '" style="display:none;"><span class="glyphicon glyphicon-chevron-up"></span></button>';
		list2 += "</td></tr>";

	}
	list2 += '</tbody></table>';

	$('#reviewSummaryWarp').html(list2);
	setButton(list1);

	//修改排名
	$(".isorders").on('change', function() {
		var reg = /^[1-9]\d*$/;
		if($(this).val() != "") {
			if(!(reg.test($(this).val()))) {
				top.layer.alert('温馨提示：排名只能为正整数');
				$(this).val("")
			}
		}
		var index = $(this).attr('data-index');
		changeReason($(this), $(this).val(), $('.isChoose' + index), $('.isChoose' + index).prop('checked'));
	});
	//修改默认的是否候选人
	$('.isCandidate').on('change', function() {
		var index = $(this).attr('data-index');
		changeReason($('.orders' + index), $('.orders' + index).val(), $(this), $(this).val());
	});
}

/**
 * 分数显示效果
 * @param scor
 * @returns {*}
 */
function getScore(scor) {
	if(scor) {
		return scor
	} else if(scor == 0) {
		return '0'
	} else {
		return '/'
	}
};
/* 评审结果显示处理 */
function getIsKey(type, key){
	var result = '';
	if(type == 0) {
		result = (key == 1?'合格' : key == 0?'不合格':'/');
	} else if(type == 1) {
		result = (key == 1?'未偏离' :  key == 0?'偏离':'/');
	} else if(type == 2) {
		result = (key == 1?'响应' :  key == 0?'不响应':'/');
	}else if(type == 3) {
		result = getScore(key);
	}
	return result
}
/*changeReason  判断是否输入原因
 * ele1  修改排名的元素
 * val1  修改后的排名值
 * ele2  修改的是否候选人的元素
 * val2  修改的是否候选人值
 * */
function changeReason(ele1, val1, ele2, val2) {
	var candidate = '';
	var index = ele2.attr('data-index');
	if(ele2.prop('checked')) {
		candidate = 1;
	} else {
		candidate = 0;
	}
	if(ele1.val() != ele1.attr('data-order') || ele2.attr('data-choose') != candidate) {
		if($.inArray(index, reasonIndex) == -1) {
			reasonIndex.push(index)
		}
	} else {
		if($.inArray(index, reasonIndex) != -1) {
			reasonIndex.splice($.inArray(index, reasonIndex), 1);
		}
	}
}
/************************************   汇总详情         ***********************************************/
/*
 * 处理不固定级数的评审项思路：
 * 先处理数据，将每条数据要合并的行与列计算出来放入json数据中
 * 循环数据
 * 当i=0时，先看其在父级中是否为第一项，是则当前td不要，否则创建td， 判断其下子项，当有子项时多创建一个td
 * 当i!=0时，创建td，判断其下子项，当有子项时多创建一个td
 * 其中大量运用递归
 * */

function linkTable(index) {
	
	//循环评审大项
	/* $.each() */
	
	
	
	
	
	
	
	var experts = getExperts();
	for(var s = 0; s < bidChecksLists.length; s++) {
		var bidChecksData = {
			maxLevel: 0,
			levelData: {},
			minData: []
		};
		eachChildren(bidChecksLists[s].bidCheckItems, 0, bidChecksData)
		//		console.log(mostCol)
	};
	var list = '<table class="table table-bordered table-striped">'
	list += "<tr>";
	//					list += "<td style='text-align:left' width='200px'>投标人名称</td>";
	list += "<td style='text-align:center' width='120px'>评标项</td>";
	list += "<td style='text-align:center' colspan='" + mostCol + "' width='400px'>评标内容</td>";
	for(var i = 0; i < experts.length; i++) {
		list += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + experts[i].expertName + ")</td>";
	}
	list += "<td style='text-align:center' width='110px'>评审结果</td>";
	list += "</tr>";
	for(var s = 0; s < bidChecksLists.length; s++) { //评审大项循环				
		list += "<tr>";
		/****** 计算最多评审项 *****/
		var itemMost = '';
		var bidChecksData = {
			maxLevel: 0,
			levelData: {},
			minData: []
		};
		itemMost = eachChildren(bidChecksLists[s].bidCheckItems, 0, bidChecksData)
		//		console.log(bidChecksData)
		list += "<td style='text-align:left' width='200px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + bidChecksLists[s].checkName + "</td>";
		var firstData = bidChecksData.levelData[1];
		var hasIndex = '';
		var childNum = 0;
		//		console.log(firstData)
		for(var z = 0; z < firstData.length; z++) { //循环具体评审项
			if(z == 0) {
				var col = mostCol;
				if(firstData[z].bidCheckItems) {
					list += "<td style='text-align:left'  colspan='" + firstData[z].cols + "' rowspan='" + firstData[z].rows + "' width='200px'>" + firstData[z].checkName + "</td>";
					for(var g = 0; g < firstData[z].bidCheckItems.length; g++) {
						var dataList = firstData[z].bidCheckItems[g];
						if(g == 0) {
							var firstColsId = '';

							function creatFirstTr(data) {
								if(data.bidCheckItems) {
									creatFirstTr(data.bidCheckItems[0])
								} else {
									firstColsId = data.id;
									list += "<td style='text-align:left'  colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
								}
							};
							creatFirstTr(dataList);
							for(var i = 0; i < experts.length; i++) { //循环评委
								for(var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) { //	评审大项结果				       			
									if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == firstColsId) {
										if(experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
											var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
											if(bidChecksLists[s].checkType == 3) {
												list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
											} else {
												var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
												if(isk == undefined || isk === "") {
													list += "<td style='text-align:center' width='100px'>/</td>";
												} else {
													if(bidChecksLists[s].checkType == 0) {
														list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
													} else if(bidChecksLists[s].checkType == 1) {

														list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
													} else if(bidChecksLists[s].checkType == 2) {
														list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
													}
												}

											}

										}
									}
								}
							}
							var checkLastResults = '';
							for(var x = 0; x < bidPriceCheckLists[index].checkLastResults.length; x++) {
								if(bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id) {
									checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
								}
							}
							if(checkLastResults) {
								if(bidChecksLists[s].checkType == 3) {
									var checkScor = getScore(checkLastResults.score);
									//list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (checkScor ? checkScor : '/') + "</td>";
									list += "<td style='text-align:center' width='75px'>" + (checkScor ? checkScor : '/') + "</td>";
								} else {
									var isk = checkLastResults.isKey;
									if(isk === undefined || isk === "") {
										//	list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
										list += "<td style='text-align:center' width='75px'>/</td>";
									} else {
										if(bidChecksLists[s].checkType == 0) {
											list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '合格' : "不合格") + "</td>";

										} else if(bidChecksLists[s].checkType == 1) {

											list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
										} else if(bidChecksLists[s].checkType == 2) {
											list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
										}
									}

								}
							} else {
								//								list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
								list += "<td style='text-align:center' width='75px'>/</td>";
							}
							if(s == 0) {
								list += "</tr>";
							};
						} else {
							creaTermTr(dataList, g)
						}
					}
				} else {
					list += "<td style='text-align:left' colspan='" + firstData[z].cols + "' rowspan='" + firstData[z].rows + "' width='200px'>" + firstData[z].checkName + "</td>";
					for(var i = 0; i < experts.length; i++) { //循环评委
						for(var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) { //	评审大项结果				       			
							if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == firstData[z].id) {
								if(experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
									var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
									if(bidChecksLists[s].checkType == 3) {
										list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
									} else {
										var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
										if(isk == undefined || isk === "") {
											list += "<td style='text-align:center' width='100px'>/</td>";
										} else {
											if(bidChecksLists[s].checkType == 0) {
												list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
											} else if(bidChecksLists[s].checkType == 1) {

												list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
											} else if(bidChecksLists[s].checkType == 2) {
												list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
											}
										}

									}

								}
							}
						}
					}

					var checkLastResults = '';
					for(var x = 0; x < bidPriceCheckLists[index].checkLastResults.length; x++) {
						if(bidPriceCheckLists[index].checkLastResults[x].checkId == bidChecksLists[s].id) {
							checkLastResults = bidPriceCheckLists[index].checkLastResults[x];
						}
					}
					if(checkLastResults) {
						var aid;
						// if(bidChecksLists[s].checkType == 3) {
							var checkScor = getScore(checkLastResults.score);
							var scorelist;
							var scorelista;
							var isK = '';
							for(var a = 0; a < bidChecksLists.length; a++) {
								// if(bidChecksLists[a].checkType == 3) {
									if(bidChecksLists[s].checkName == bidChecksLists[a].checkName) {
										var bidCheckItemsList = bidChecksLists[a].bidCheckItems
										if(bidCheckItemsList.length > 1) {
											var checkItemSummariesList = bidPriceCheckLists[0].checkItemSummaries
											for(var a1 = 0; a1 < checkItemSummariesList.length; a1++) {
												if(bidChecksLists[a].bidCheckItems[0].checkId == checkItemSummariesList[a1].checkId) {
													if(bidChecksLists[a].bidCheckItems[0].id == checkItemSummariesList[a1].checkItemId) {
														if(bidChecksLists[a].checkType == 3){
															scorelista = checkItemSummariesList[a1].score
														}else{
															isK = checkItemSummariesList[a1].isKey
														}
														
														break;
													} else {
														scorelista = "/"
														break;
													}
												} else {
													scorelista = "/"
													break;
												}
											}
										} else if(bidCheckItemsList.length == 1) {
											for(var b = 0; b < bidCheckItemsList.length; b++) {
												var checkItemSummariesList = bidPriceCheckLists[index].checkItemSummaries
												for(var a1 = 0; a1 < checkItemSummariesList.length; a1++) {
													if(bidCheckItemsList[b].checkId == checkItemSummariesList[a1].checkId) {
														if(bidCheckItemsList[b].id == checkItemSummariesList[a1].checkItemId) {
															if(bidChecksLists[a].checkType == 3){
																scorelista = checkItemSummariesList[a1].score
															}else{
																isK = checkItemSummariesList[a1].isKey
															}
															break;
														} else {
															scorelista = "/"
															break;
														}

													} else {
														scorelista = "/"
														break;
													}
												}
											}
										}

									}
								// }
								
							}
							if(bidChecksLists[s].checkType == 3){
								if(scorelista != "/") {
									list += "<td style='text-align:center' width='75px' colspan='1' rowspan='1'>" + (scorelista ? scorelista : '/') + "</td>";
								} else {
									list += "<td style='text-align:center' width='75px' colspan='1' rowspan='1'>/</td>";
								}
							}else{
								if(isk === undefined || isk === "") {
									//								list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
									list += "<td style='text-align:center' width='75px' >/</td>";
								} else {
									if(bidChecksLists[s].checkType == 0) {
										//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
										list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
									} else if(bidChecksLists[s].checkType == 1) {
							
										//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
										list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
									} else if(bidChecksLists[s].checkType == 2) {
										//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
										list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
									}
								}
							}
							

						// } else {
						// 	var isk = checkLastResults.isKey;
						// 	if(isk === undefined || isk === "") {
						// 		//								list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
						// 		list += "<td style='text-align:center' width='75px' >/</td>";
						// 	} else {
						// 		if(bidChecksLists[s].checkType == 0) {
						// 			//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
						// 			list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
						// 		} else if(bidChecksLists[s].checkType == 1) {

						// 			//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
						// 			list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
						// 		} else if(bidChecksLists[s].checkType == 2) {
						// 			//									list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
						// 			list += "<td style='text-align:center' width='75px' rowspan='1'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
						// 		}
						// 	}

						// }
					} else {
						//						list += "<td style='text-align:center' width='75px' rowspan='" + (bidChecksLists[s].checkType == 3 ? bidChecksData.minData.length + 1 : bidChecksData.minData.length) + "'>/</td>";
						list += "<td style='text-align:center' width='75px'>/</td>";
					}
					if(s == 0) {
						list += "</tr>";
					};
				}
			} else {
				creaTermTr(firstData[z], z)
			}
			if(bidChecksLists[s].checkType == 3) { //打分项
				if(z == firstData.length - 1) {
					list += "<tr>";
					list += "<td style='text-align:left' width='200px' colspan='" + mostCol + "'>总分</td>";
					for(var i = 0; i < experts.length; i++) {
						if(bidPriceCheckLists[index].expertChecks != undefined && bidPriceCheckLists[index].expertChecks.length > 0) {
							for(var bs = 0; bs < bidPriceCheckLists[index].expertChecks.length; bs++) {
								if(experts[i].expertId == bidPriceCheckLists[index].expertChecks[bs].expertId && bidPriceCheckLists[index].expertChecks[bs].checkId == bidChecksLists[s].id) {
									//									list += "<td style='text-align:center' width='100px'>" + getScore(bidPriceCheckLists[index].expertChecks[bs].score) + "</td>";
									list += "<td style='text-align:center' width='100px'></td>";
								}
							}

						} else {
							list += "<td style='text-align:center' width='100px'>/</td>";
						}
					}

					list += "<td style='text-align:center' width='75px' colspan='1'>" + (checkScor ? checkScor : '/') + "</td>";
					list += "</tr>";
				}
			}

			function creaTermTr(data, indexs) {
				if(indexs != 0) {
					if(data.bidCheckItems) {
						list += "<tr>";
						list += "<td style='text-align:left' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
						for(var x = 0; x < data.bidCheckItems.length; x++) {
							if(x == 0) {
								list += "<td style='text-align:left' colspan='" + data.bidCheckItems[x].cols + "' rowspan='" + data.bidCheckItems[x].rows + "' width='200px'>" + data.bidCheckItems[x].checkName + "</td>";
								for(var i = 0; i < experts.length; i++) {
									for(var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {
										if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == data.bidCheckItems[x].id) {
											if(experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
												var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);

												if(bidChecksLists[s].checkType == 3) {
													list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
												} else {
													var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
													if(isk === undefined || isk === "") {
														list += "<td style='text-align:center' width='100px'>/</td>";
													} else {
														if(bidChecksLists[s].checkType == 0) {
															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
														} else if(bidChecksLists[s].checkType == 1) {

															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
														} else if(bidChecksLists[s].checkType == 2) {
															list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
														}
													}

												}
											}
										}
									}
								}
								list += "</tr>";
							} else {
								creaTermTr(data.bidCheckItems[x], x)
							}
						}

					} else {
						var scorsData
						list += "<tr>";
						list += "<td style='text-align:left' colspan='" + data.cols + "' rowspan='" + data.rows + "' width='200px'>" + data.checkName + "</td>";
						for(var i = 0; i < experts.length; i++) {

							for(var bs = 0; bs < bidPriceCheckLists[index].expertCheckItems.length; bs++) {
								if(bidPriceCheckLists[index].expertCheckItems[bs].checkItemId == data.id) {
									if(experts[i].expertId == bidPriceCheckLists[index].expertCheckItems[bs].expertId) {
										var scors = getScore(bidPriceCheckLists[index].expertCheckItems[bs].score);
										scorsData = scors
										if(bidChecksLists[s].checkType == 3) {
											list += "<td style='text-align:center' width='100px'>" + (scors ? scors : '/') + "</td>";
										} else {
											var isk = bidPriceCheckLists[index].expertCheckItems[bs].isKey;
											if(isk === undefined || isk === "") {
												list += "<td style='text-align:center' width='100px'>/</td>";
											} else {
												if(bidChecksLists[s].checkType == 0) {
													list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
												} else if(bidChecksLists[s].checkType == 1) {

													list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
												} else if(bidChecksLists[s].checkType == 2) {
													list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
												}
											}

										}
									}
								}
							}
						}
						if(isk === undefined || isk === "") {
							var scorelist2;

							if(bidPriceCheckLists[index].supplierName) {
								if(bidChecksLists[s].checkType == 3) {
									var checkItemSummariesList = bidPriceCheckLists[index].checkItemSummaries
									for(var a1 = 1; a1 < checkItemSummariesList.length; a1++) {
										if(data.id == checkItemSummariesList[a1].checkItemId) {
											scorelist2 = checkItemSummariesList[a1].score
											break;
										}
									}
								}
							}
							console.log(scorelist2, '11')
							if(scorsData != "/") {
								list += "<td style='text-align:center' width='75px' colspan='1' rowspan='1'>" + (scorelist2 ? scorelist2 : '/') + "</td>";
							} else {
								list += "<td style='text-align:center' width='75px' colspan='1' rowspan='1'>/</td>";
							}
							//list += "<td style='text-align:center' width='75px' colspan='1' rowspan='1' class='n+1'>" + (scorelist2 ? scorelist2 : '/') + "</td>";

						} else {
							if(bidChecksLists[s].checkType == 0) {
								list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '合格' : "不合格") + "</td>";
							} else if(bidChecksLists[s].checkType == 1) {

								list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '未偏离' : "偏离") + "</td>";
							} else if(bidChecksLists[s].checkType == 2) {
								list += "<td style='text-align:center' width='100px'>" + (isk == 1 ? '响应' : "不响应") + "</td>";
							}
						}
						list += "</tr>";
					}
				}
			}
		}
		if((firstData.length == 1 || !firstData) && s != 0) {
			list += "</tr>";
		}

	}
	list += '</table>'
	$('.linkBox' + index).html(list);
};
$('#content').on('input', 'textarea', function(e) {
	$(e.target).css('height', 'auto').css('height', this.scrollHeight + 'px');
});

function canSubmitCheck(callback) {
    var actionUrl = config.Reviewhost + '/RaterAskListController/checkNotAnswerAsk';
    var canSubmit = true;
    $.ajax({
        url: actionUrl,
        data: {
            packageId: bidSectionId,
            examType: examType
        },
        async: false,
        type: 'post',
        success: function(res) {
            if(res.success) {
                canSubmit = !!res.data;
            }
        }
    });
    if (!canSubmit) {
        parent.layer.confirm('存在未答复的问题，是否确认汇总？确认后供应商无法再答复！', {
            icon: 3,
            title: '询问',
            btn: ['确认', '取消'] //可以无限个按钮
        }, function (index) {
            parent.layer.close(index);
            callback && callback();
        }, function(index) {
            parent.layer.close(index);
        })
    } else {
        callback && callback();
    }
}

//提交审核
$("#btn-box").on('click', '#savePriceCheckTotal', function() {
	/*  */
	var lastCheckedNumbers = 0;
	var checkLastResults = [];
	
	for(var i = 0; i < bidPriceCheckLists.length; i++) {
		if(bidPriceCheckLists[i].isKey == 1) {
			if($(".orders" + i).val() == "") {
				top.layer.alert('温馨提示：排名不能为空');
				return;
			}
		};
		var isChoose, isMake = 0;//isMake是否手动修改
		if($(".isChoose" + i).is(':checked') == true) {
			isChoose = 1;
			lastCheckedNumbers = lastCheckedNumbers + 1;
		} else {
			isChoose = 0;
			/* 默认选中，被手动修改为未选中（不是候选人） */
			if($(".isChoose" + i).attr('data-mark') == 1){
				isMake = 1
			}
		}
		checkLastResults.push({
			supplierId: bidPriceCheckLists[i].supplierId,
			isKey: bidPriceCheckLists[i].isKey,
			score: bidPriceCheckLists[i].score,
			orders: $(".orders" + i).val(),
			reason: $(".isReason" + i).val(),
			isChoose: isChoose,
			isMake: isMake==1?1:0
		});
	};
	
	/* 资格预审-有限数量制提交时的校验规则（提示语）：

1、候选人家数不得大于有限数量制设置的家数

2、“｛投标人名称｝”的候选人被修改，请输入修改原因

 */
	if(examType == 1 && bidSectionInfo.bidderPriceType ==1 && lastCheckedNumbers > Number(pretrialPassNumber)){
		top.layer.alert('温馨提示：候选人家数不得大于有限数量制设置的家数');
		return;
	}
	if(reasonIndex.length > 0) {
		for(var e = 0; e < reasonIndex.length; e++) {
			if($.trim($('.isReason' + reasonIndex[e]).val()) == '') {
				if(examType == 1 && bidSectionInfo.bidderPriceType ==1){
					top.layer.alert((bidPriceCheckLists[reasonIndex[e]].enterpriseName+'的候选人被修改，请输入修改原因'), function(ind) {
						top.layer.close(ind);
						$('.isReason' + reasonIndex[e]).focus();
					})
					return
				}else{
					top.layer.alert('请输入修改原因', function(ind) {
						top.layer.close(ind);
						$('.isReason' + reasonIndex[e]).focus();
					})
					return
				}
			}
		}
	}
	var param = {
		"method": 'saveSummaryData',
		"nodeType": currNode.nodeType,
		"checkLastResults": checkLastResults
	};
	canSubmitCheck(function() {
	//IE下停止刷新列表防止PDF遮住弹出层，无法下一步操作
	isStopTab = true;
	$(this).attr('disabled',true);
	reviewFlowNode(param, function(data) {
		top.layer.alert('提交成功', function(ind) {
			isStopTab = false;
			currFunction();
			top.layer.close(ind)
		});
	});
	isStopTab = false;
	})
	
});

//汇总详情展开
$('#content').on('click', '.btn_view_open', function() {
	$(this).closest('td').find('.btn_view_close').show();
	if($(this).closest('tr').next().hasClass('son')) {
		$(this).closest('tr').next().remove();
	}
	var index = $(this).attr('data-index');
	var colspan = 7;
	if(examType == 2) {
		colspan = 8;
	}
	var newTr = '<tr class="son"><td colspan="' + colspan + '"><div class="linkBox' + index + '"></div></td></tr>';
	$(this).closest('tr').after(newTr);
	// linkTable(index);
	childTable(index);
	$(this).hide();
});

//汇总详情收起
$('#content').on('click', '.btn_view_close', function() {
	$(this).closest('td').find('.btn_view_open').show();
	if($(this).closest('tr').next().hasClass('son')) {
		$(this).closest('tr').next().remove();
	}
	$(this).hide();
})
/**********       处理json数据为树形结构       **********/
function manageTerms(data) {
	var bidCheckItems = [];
	$.each(data, function(index, item) {
		var node = {
			//			checkId: item.checkId,
			id: item.id,
			checkName: item.checkName,
			checkStandard: item.checkStandard,
			checkId: item.checkId,
		};
		if(item.isKey) {
			node.isKey = item.isKey;
		}
		if(item.score) {
			node.score = item.score;
		}
		if(item.expertIsKey) {
			node.expertIsKey = item.expertIsKey;
		}
		if(item.expertScore) {
			node.expertScore = item.expertScore;
		}
		if(item.fileChapterUrl) {
			node.fileChapterUrl = item.fileChapterUrl;
		}
		var pnode = item.pid && findParentNode(bidCheckItems, 'id', item.pid);
		(pnode && (pnode.bidCheckItems || (pnode.bidCheckItems = [])) && pnode.bidCheckItems.push(node)) || bidCheckItems.push(node);
	});
	return bidCheckItems
}

function findParentNode(nodes, attr, val) {
	if(!val) return false;
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i][attr] == val) {
			return nodes[i];
		}
		var node;
		if(nodes[i].bidCheckItems && nodes[i].bidCheckItems.length > 0) {
			node = findParentNode(nodes[i].bidCheckItems, attr, val);
			if(node) return node;

		}
	}
	return null;
};
/************       处理数据         ***********/
function eachChildren(bidChecks, level, bidChecksData) {
	var col = 0;
	var row = 0;
	if(bidChecks && bidChecks.length > 0) {
		level = level == undefined ? 1 : level + 1;
		if(bidChecksData.maxLevel < level) {
			bidChecksData.maxLevel = level;
		}
		if(mostCol < level) {
			mostCol = level;
		}
		for(var i = 0; i < bidChecks.length; i++) {
			bidChecks[i].level = level;
			bidChecks[i].col = eachChildren(bidChecks[i].bidCheckItems, bidChecks[i].level, bidChecksData);

			if(!bidChecksData.levelData[bidChecks[i].level]) {
				bidChecksData.levelData[bidChecks[i].level] = [];
			}
			bidChecksData.levelData[bidChecks[i].level].push(bidChecks[i]);

			if(!bidChecks[i].bidCheckItems || bidChecks[i].bidCheckItems.length == 0) {
				bidChecksData.minData.push(bidChecks[i]);
				bidChecks[i].row = bidChecks[i].level;
				bidChecks[i].colspan = mostCol - bidChecks[i].level + 1;
			} else {
				bidChecks[i].row = 0;
				bidChecks[i].colspan = 1;
			}
			if(bidChecks[i].col == 0) {
				bidChecks[i].col = 1

			}
			col += bidChecks[i].col;
		}
	}
	return col;
}
/**
 * 获取树的每一级别所占的列数
 */
function getCols(treeData) {
	var floor = 0;
	var max = 0;

	function each(data, floor) {
		for(var j = 0; j < data.length; j++) {
			var e = data[j];
			e.floor = floor
			if(floor > max) {
				max = floor
			}
			if(e.bidChecks && e.bidChecks.length > 0) {
				each(e.bidChecks, floor + 1)
			}
			if(e.bidCheckItems && e.bidCheckItems.length > 0) {
				if(e.bidCheckItems[0].checkName && e.bidCheckItems[0].checkName != "") {
					each(e.bidCheckItems, floor + 1);
				} else {

					e.checkStandard = "";

					for(var i = 0; i < e.bidCheckItems.length; i++) {
						e.checkStandard += e.bidCheckItems[i].checkStandard;

						if(e.bidCheckItems[i].rangeMin || e.bidCheckItems[i].rangeMin == 0) {
							e.checkStandard += " (" + e.bidCheckItems[i].rangeMin + " - " + e.bidCheckItems[i].rangeMax + "分)";
						} else {
							e.checkStandard += e.bidCheckItems[i].rangeMax || e.bidCheckItems[i].rangeMax == 0 ? " (" + e.bidCheckItems[i].rangeMax + "分)" : "";
						}
						e.checkStandard += "<br/>";
					}
					e.bidCheckItems = [];
				}
			}
		}
	}
	each(treeData, 1);

	function setCols(data) {
		for(var j = 0; j < data.length; j++) {
			var e = data[j];
			e.cols = 1;
			if(e.bidChecks && e.bidChecks.length > 0) {
				setCols(e.bidChecks);
			} else if(e.bidCheckItems && e.bidCheckItems.length > 0) {
				setCols(e.bidCheckItems);
			} else {
				e.cols = max + 1 - e.floor;
			}
		}
	}
	setCols(treeData);

	return {
		data: treeData,
		cols: max
	};
}

function getRows(data) {
	var rowAll = 0,
		colAll = 0;
	for(var i = 0; i < data.length; i++) {
		var rows = 0;
		var cols = 0;
		if(data[i].bidChecks && data[i].bidChecks.length > 0) {
			rows += getRows(data[i].bidChecks).rows;
		} else if(data[i].bidCheckItems && data[i].bidCheckItems.length > 0) {
			rows += getRows(data[i].bidCheckItems).rows;
		} else {
			rows += 1;
		}
		data[i].rows = rows;
		rowAll += rows;
	}

	return {
		rows: rowAll,
		data: data
	};
}
/* 评审项汇总数组处理 */
function handleToArr(data){
	trArr = [];
	$.each(data, function(index, item){
		//处理行合并参数
		var rows = 1;
		if(item.bidCheckItems && item.bidCheckItems.length > 1){
			rows = handleRows(item.bidCheckItems, rows);
		}
		item.checkRows = rows;//评审项的合并行
		if(item.avgType == 2){//单项
			item.lastRows = 1;//最后的评审结果汇总
		}else{//合并
			item.lastRows = rows;//最后的评审结果汇总
		}
		
		trArr.push(item);
	})
};
//递归处理行合并参数
function handleRows(data, rows){
	var rowspan = rows;
	if(data.length > 1){
		rowspan += data.length -1
	};
	$.each(data, function(index, item){
		if(item.bidCheckItems && item.bidCheckItems.length > 1){
			handleRows(item.bidCheckItems, rowspan)
		}
	});
	return rowspan
};
//子表
function childTable(index){
	var experts = getExperts();
	var list = '<table class="table table-bordered table-striped">'
	list += "<tr>";
	list += "<td style='text-align:left' width='120px'>评标项</td>";
	list += "<td style='text-align:left' colspan='" + mostCol + "' width='400px'>评标内容</td>";
	for(var i = 0; i < experts.length; i++) {
		list += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + experts[i].expertName + ")</td>";
	}
	list += "<td style='text-align:center' width='110px'>评审结果</td>";
	list += "</tr>";
	$.each(trArr, function(ind, item){//评审大项
		$.each(item.bidCheckItems, function(childInd, childItem){//评审项内容
			list += "<tr>";
			// ***********     评标项
			if(childInd == 0){
				list += "<td style='text-align:left' rowspan='"+item.checkRows+"' width='120px'>"+item.checkName+"</td>";
			}
			// ***********     评标内容
			list += "<td style='text-align:left' width='400px'>"+childItem.checkName+"</td>";
			//  **********     评委，获得每个评审项每个评委的评审结果
			$.each(experts, function(expertsInd, expertsItem){
				var tdCont;
				$.each(bidPriceCheckLists[index].expertCheckItems, function(expertResultInd, expertResultItem){
					
					if(childItem.id == expertResultItem.checkItemId && expertsItem.expertId == expertResultItem.expertId){
						if(item.checkType == 3){
							tdCont = getIsKey(item.checkType, expertResultItem.score);
						}else{
							tdCont = getIsKey(item.checkType, expertResultItem.isKey);
						}
					}
				});
				list += "<td style='text-align:center' width='100px'>"+tdCont+"</td>";
			});
			// *********    最后的评审结果
			if(item.avgType == 2){//结果不合并
				$.each(bidPriceCheckLists[index].checkItemSummaries, function(resultInd, resultItem){
					if(childItem.id == resultItem.checkItemId){
						if(item.checkType == 3){
							list += "<td style='text-align:center' width='110px'>"+getIsKey(item.checkType, resultItem.score)+"</td></tr>";
						}else{
							list += "<td style='text-align:center' width='110px'>"+getIsKey(item.checkType, resultItem.isKey)+"</td></tr>";
						}
					}
					// if(resultInd == (bidPriceCheckLists[index].checkItemSummaries.length -1)){
					// 	list +=""
					// }
				});
			}else{//结果合并
				var resultcont = '', resultKey;
				$.each(bidPriceCheckLists[index].checkLastResults, function(resultInd, resultItem){
					if(item.id == resultItem.checkId){
						if(item.checkType == 3){
							resultKey = resultItem.score;
						}else{
							resultKey = resultItem.isKey;
						}
					}
				});
				resultcont = getIsKey(item.checkType, resultKey);
				if(childInd == 0){//评标项
					list += "<td style='text-align:center' rowspan='"+(item.avgType == 2?'1':item.checkRows)+"' width='110px'>"+resultcont+"</td></tr>";
				}
			}
			
		})
		
	});
	list += '</table>'
	$('.linkBox' + index).html(list);
}
