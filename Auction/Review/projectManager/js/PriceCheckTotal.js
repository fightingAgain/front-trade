/*

 */ 
/*==========   评审记录汇总   ==========*/
var CheckTotals;
var checkRemark="",orderOfferList=new Array();
var WORKFLOWTYPE = 'psbg';

$(function(){
	if(isTotalCheck == 1){
		$('.edit').show();
		if(examType == 1){
			$(".tenderTypeW").show();
			$("#quotePriceUnit").html(quotePriceUnit);
			$(".checkRemarkCol").attr('colspan','1')
		}
	}else{
		$('.view').show();
		if(examType == 1){
			$(".tenderTypeW").show();
			$("#quotePriceUnit").html(quotePriceUnit);
			$(".checkRemarkCol").attr('colspan','1')
		}
	}
	
    if (createType == 1) {
		$(".isCreateType").hide();
	} else {
		$(".isCreateType").show();
	}
	PriceCheckTotal()
	if(CheckTotals.checkReports.length>0&&CheckTotals.checkReports[0].isCheck==3){
		$("#isShowCheckReportId").show();
		findWorkflowCheckerAndAccp(progressList.checkReportId);
	}	
})

function PriceCheckTotal() {
	$.ajax({
		type: "post",
		url: url + "/ManagerCheckController/getCheckTotalForManager.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			checkPlan: checkPlan,
			examType:examType,
		},
		async: false,
		success: function (data) {
			if(!data.success){
				parent.layer.alert(data.message);
				$("#"+_THISID).click();
				return
			}
			CheckTotals = data.data;
			_THISID=_thisId;
			var priceCheckTotals = data.data.priceCheckTotals;
			if(CheckTotals.orderOfferList){
				orderOfferList = CheckTotals.orderOfferList;
			}
			//按钮控制
			if (CheckTotals) {	
				$(".PriceCheckBtn").show();
				if (CheckTotals.checkItem == '已完成') {
					if (CheckTotals.checkReports != undefined && CheckTotals.checkReports.length > 0) {
						checkRemark = CheckTotals.checkReports[0].checkRemark
					}
					if(isTotalCheck == 1){//组长汇总
						$("#savePriceCheckTotal").hide();
					}else{
						$("#savePriceCheckTotal").attr("disabled", true);
						$("#savePriceCheckTotal").css("pointer-events", "none");
						
					}
					$("#editReport").attr("disabled", false);
					//$("#editReport").css("pointer-events", "none");
					$("#checkPlace").val(priceCheckTotals[0].checkPlace);
					$("#checkPlace").attr("disabled", true);
					//后审不显示评审时间（已评审完成的，有数据就显示）
					if(priceCheckTotals[0].checkDate){
						$('.checkDate').show();
						$('.checkPlace').prop('colspan','1');
						$("#checkDate").val(priceCheckTotals[0].checkDate);
						$("#checkDate").attr("disabled", true);
					}else{
						$('.checkDate').hide();
						$('.checkPlace').prop('colspan','3');
					}
					
					$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					$("#checkRemark").attr("disabled", true);
				} else {
					if (priceCheckTotals && priceCheckTotals.length > 0) {
						$("#checkPlace").val(priceCheckTotals[0].checkPlace);
						//后审不显示评审时间（已评审完成的，有数据就显示）
						if(priceCheckTotals[0].checkDate){
							$('.checkDate').show();
							$('.checkPlace').prop('colspan','1');
							$("#checkDate").val(priceCheckTotals[0].checkDate);
							$("#checkDate").attr("disabled", true);
						}else{
							$('.checkDate').hide();
							$('.checkPlace').prop('colspan','3');
						}
						$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					}else{
						//后审不显示评审时间
						if(examType == 1){
							$('.checkDate').hide();
							$('.checkPlace').prop('colspan','3');
						}else{
							$('.checkDate').show();
							$('.checkPlace').prop('colspan','1');
						}
					}
				}
				
				if (CheckTotals.checkReport == "已完成") {
					// $("#generateReport").attr("disabled", true);
					// $("#generateReport").css("pointer-events", "none");
					$("#editReport").attr("disabled", true);
					$("#editReport").css("pointer-events", "none");
				} else {
					$("#editReport").attr("disabled", false);
					$("#editReport").css("pointer-events", "auto");
				}
				//有评审记录时，暂时历史记录
				var checkItem;
				if (CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) {
					checkItem = CheckTotals.priceCheckItems;
				} else {
					checkItem = CheckTotals.priceChecks;
				}
				var RenameData = getBidderRenameData(packageId);//供应商更名信息
				if ((checkPlan == 1|| checkPlan == 3 || checkPlan == 4 || checkPlan == 5)&&examType==1) {
					var colspan=[
						{
							field: '#',
							title: '序号',
							width: '50px',
							align: 'center',							
							formatter: function (value, row, index) {
								return index + 1;
							}
						}, {
							field: 'enterpriseName',
							title: '供应商名称',
							width: '200px',
							formatter: function(value, row, index){
								return CheckTotals.isOpenDarkDoc == 0?value:showBidderRenameList(row.supplierId, row.enterpriseName, RenameData, 'body')
							}
						},
						{
							field: 'isOut',
							title: '淘汰',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								return value == 1 ? "<span id='isOut_" + row.supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + row.supplierId + "' value='0'>否</sapn>";
							}
						}, {
							field: 'saleTaxTotal',
							title: '供应商报价',
							align: 'right',
							width: '150px',
							formatter: function (value, row, index) {
								if(row.isEvpOut){
									return "<span class='red'>未解密</span>";
								}else{
									return "<span type='text'>" + (row.saleTaxTotal || '') + "</span>";
								}
								
							}
						}, {
							field: 'fixCount',
							title: '算术修正值',
							width: '120px',
						}, {
							field: 'fixFinalPrice',
							title: '修正后总价',
							align: 'right',
							width: '120px',
						},
						{
							field: 'defaultItem',
							title: '缺漏项'+(checkPlan == 4?'减':'加')+'价',
							align: 'right',
							width: '100px',
						}
					]
					if(checkPlan == 1 || checkPlan == 4 || checkPlan == 5){
						colspan.push(
							{
								field: 'deviateNum',
								title: '计入总数偏离项数',							
								width: '150px'
							}
						)
					}
					colspan.push(
						{
							field: 'deviatePrice',
							title: '偏离'+(checkPlan == 4?'减':'加')+'价',
							align: 'right',
							width: '150px'
						},
						{
							field: 'totalCheck',
							title: '评审总价',
							align: 'right',
							width: '150px'
						},
						{
							field: 'reason',
							title: '调整原因',
							width: '100px',
						},
						{
							field: 'supplierOrder',
							title: '排名',
							align: 'center',
							halign: 'center',
							width: '80px',
							formatter: function (value, row, index) {
								if(isStopCheck!=1){
									if (CheckTotals.checkItem == '已完成') {
										if (row.isOut == 1) { //淘汰							
										} else {
											return value;
										}									
									} else {
										if (row.isOut == 1) { //淘汰
											return "<input type='hidden' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/><span>/</span>";
										} else {

											return "<input type='text' class='supplierOrder' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/>";
										}

									}
								}else{
									return "<input type='hidden' id='supplierOrder_" + row.supplierId + "' style='width:100%' value='" + (value || index + 1) + "'/><span>/</span>";
								}
							}
						},
						{
							field: 'isChoose',
							title: '候选人',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function (value, row, index) {
								if(isStopCheck!=1){
									if (CheckTotals.checkItem == '已完成') {
										return value == 0 ? "否" : "是";
									} else {
										if (row.isOut == 1) { //淘汰
											return "<input type='hidden' id='isChoose_" + row.supplierId + "'  disabled='disabled'/><span>/</span>";
	
										} else {
											if(!isAgent || isAgent == 0){//采购专区
												return "<input type='checkbox' class='isChoose' id='isChoose_" + row.supplierId + "' checked='checked' />";
											}else{
												if (index <= 2) {
													return "<input type='checkbox' class='isChoose' id='isChoose_" + row.supplierId + "' checked='checked' />";
												} else {
													return "<input type='checkbox' class='isChoose' id='isChoose_" + row.supplierId + "'  />";
												}
											}
										}
	
									}
								}else{
									return "<input type='hidden' id='isChoose_" + row.supplierId + "'  disabled='disabled'/><span>/</span>";
								}
								

							}
						}
					)
					$("#checkTotalTable").bootstrapTable({
						columns: colspan
					});
					$("#checkTotalTable").bootstrapTable("load", checkItem);
					
				} else {
					var html = '';
					var checker = CheckTotals.experts; //评委
					var list=[]
					for(var i=0;i<CheckTotals.packageCheckLists.length;i++){
						if(CheckTotals.packageCheckLists[i].checkType!=4){
							list.push(CheckTotals.packageCheckLists[i])
						}						
					}					
					var priceChecks = CheckTotals.priceChecks; //打分情况
					if (priceChecks) {
						html += "<tbody><tr>";
						html += "<td style='text-align:left;width:200px'>供应商名称</td>";
						html += "<td style='text-align:center;width:120px'>评审项</td>";
						html += "<td style='text-align:center;width:300px'>评审内容</td>";
						for(var i = 0; i < checker.length; i++) {
							if(examType==1){
								html += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + checker[i].expertName + ")</td>";
							}else{
								html += "<td style='text-align:center' width='100px'>" + checker[i].expertName + "</td>";
							}
							
						}
						if(examType==1){
							html += "<td style='text-align:center' width='90px'>分项平均分</td>";
							html += "<td style='text-align:center' width='120px'>分项平均总得分</td>";
							html += "<td style='text-align:center' width='110px'>商务报价得分</td>";
							html += "<td style='text-align:center' width='75px'>淘汰</td>";
							html += "<td style='text-align:center' width='80px'>总分</td>";
							html += "<td style='text-align:center' width='70px'>排名</td>";
							html += "<td style='text-align:center' width='75px'>候选人</td>";
						}else{
							html += "<td style='text-align:center' width='70px'>结果</td>";
							html += "<td style='text-align:center' width='75px'>评审结果</td>";
						}

						//跨行条数
						var enterpriseRowspan = 0;
						for (var x = 0; x < list.length; x++) { //评审项
							enterpriseRowspan += list[x].packageCheckItems.length;
							if(examType==1){
								if (list[x].checkType == 1 || list[x].checkType == 3) enterpriseRowspan++;
							}
							
						}
						if(examType==1){
							for (var i = 0; i < priceChecks.length; i++) {
								if (list && list.length > 0) {
									html += "<tr>";
									html += "<td style='text-align:left;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (CheckTotals.isOpenDarkDoc == 0?priceChecks[i].enterpriseName:showBidderRenameList(priceChecks[i].supplierId, priceChecks[i].enterpriseName, RenameData, 'body')) + "</td>";
									for (var x = 0; x < list.length; x++) { //评审项
										var item = list[x].packageCheckItems;
										for (var z = 0; z < item.length; z++) { //评审内容
											if (z != 0) {
												html += "<tr>";
											};
											if (z == 0) {
												if (item.length == 1 && x != 0) {
													html += "<tr>";
												}
												html += "<td style='text-align:center;white-space:normal;word-break: break-all;'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + list[x].checkName + "</td>";
											};
											html += "<td style='text-align:left;white-space:normal;word-break: break-all;'>" + item[z].checkTitle + "</td>";
											for (var e = 0; e < checker.length; e++) { //评委
												//html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
												if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id]) != 'undefined' && typeof (priceChecks[i].expertScores[checker[e].id][item[z].id]) != "undefined") {
													html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
											}
	
											if (list[x].checkType == 1 || list[x].checkType == 3) {
												if (priceChecks[i].expertScores) {
													if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
														html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] || '/') + "</td>";
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
											} else {
												if (list[x].checkType == 0) {
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "符合" : "不符合") + "</td>";
														} else {
															html += "<td style='text-align:center'>/</td>";
														}
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												} else if (list[x].checkType == 2) {
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id] == 0 ? "合格" : "不合格") + "</td>";
														} else {
															html += "<td style='text-align:center'>/</td>";
														}
													} else {
														html += "<td style='text-align:center'>/</td>";
													}
												}
											}
	
											if (z == 0) {
												if (list[x].checkType == 1 || list[x].checkType == 3) {//评分制
													if (priceChecks[i].expertScores) {
														if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
															if (list[x].checkType == 3) {
																var teps = Number(priceChecks[i].expertScores[list[x].id]);
															} else {
																var teps = (Number(priceChecks[i].expertScores[list[x].id]) * Number((list[x].weight || "1")));
															}
															var tep = roundFun(teps, (top.prieNumber || 2));
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (tep || '/') + "</td>"
														} else {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													} else {
														html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
													}
												} else {//合格制
	
													if (list[x].checkType == 0) {
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "符合" : "不符合") + "</td>";
															} else {
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
															}
														} else {
															html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													} else if (list[x].checkType == 2) {//偏离制
														if (priceChecks[i].expertScores) {
															if (typeof (priceChecks[i].expertScores[list[x].id]) != "undefined") {
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">" + (priceChecks[i].expertScores[list[x].id] == 0 ? "合格" : "不合格") + "</td>";
															} else {
																html += "<td style='text-align:center'" + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
															}
														} else {
															html += "<td style='text-align:center' " + ((list[x].checkType == 1 || list[x].checkType == 3) ? "rowspan='" + (item.length + 1) + "'" : "rowspan='" + item.length + "'") + ">/</td>"
														}
													}
												}
	
											};
											if (z != 0) {
												html += "</tr>";
											} else {
												/*if(x==list.length-1&&item.length==1 && list[x].checkType == 1){
													html += "/<tr>";
												}*/
	
												if (item.length == 1 && x != 0) {
													html += "</tr>";
												}
											}
											if (x == 0 && z == 0) {
												html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].score || '/') + "</td>";
	
												html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isOut ? "<span id='isOut_" + priceChecks[i].supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + priceChecks[i].supplierId + "' value='0'>否</sapn>") + "</td>";
												html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + (priceChecks[i].total || '') + "</sapn>" + "</td>";
												if (CheckTotals.checkItem == '已完成') {
													if(isStopCheck!=1){
														if (priceChecks[i].isOut == 1) {
															html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">/</td>";
														} else {
															html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].supplierOrder || '') + "</td>";
														}
													}else{
														html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">/</td>";
													}
													html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + ">" + (priceChecks[i].isChoose ? "是" : "否") + "</td>";
												} else {
													if(isStopCheck!=1){
														if (priceChecks[i].isOut == 1) { //1淘汰，0否
											
															html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' style='width:100%' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'>/</td>";
	
															html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' id='isChoose_" + priceChecks[i].supplierId + "' disabled='disabled'>/</td>";
														} else {
											
															html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='text' style='width:100%' class='supplierOrder' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'></td>";
															if(!isAgent || isAgent == 0){//采购专区
																html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "' checked></td>";
															}else{
																if (i <= 2) {
																	html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "' checked></td>";
																} else {
																	html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='checkbox' class='isChoose' id='isChoose_" + priceChecks[i].supplierId + "'></td>";
																}
															}
															
	
														}
													}else{
											
														html += "<td style='text-align:center;' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' style='width:100%' id='supplierOrder_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].supplierOrder || (i + 1)) + "'>/</td>";
														html += "<td style='text-align:center' " + (enterpriseRowspan > 0 ? "rowspan='" + enterpriseRowspan + "'" : "") + "><input type='hidden' id='isChoose_" + priceChecks[i].supplierId + "' disabled='disabled'>/</td>";
													}
												}
												html += "</tr>";
											}
										}
										if (list[x].checkType == 1 || list[x].checkType == 3) {
											html += "<tr><td style='text-align:center'>得分</td>";
											for (var e = 0; e < checker.length; e++) {
												if (priceChecks[i].expertScores && typeof (priceChecks[i].expertScores[checker[e].id]) != "undefined" && typeof (priceChecks[i].expertScores[checker[e].id][list[x].id]) != "undefined") {
													html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
												} else {
													html += "<td style='text-align:center'>/</td>";
												}
												//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] || '/') + "</td>";
											}
	
											if (priceChecks[i].expertScores) {
												html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
											} else {
												html += "<td style='text-align:center'>/</td>";
											}
											//html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>";
											html += "</tr>";
										}
									}
								}
							}
						}else{
							for(var i = 0; i < priceChecks.length; i++) {
								if(list && list.length > 0) {
									html += "<tr>";
									html += "<td style='text-align:center;'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +" >" + priceChecks[i].enterpriseName + "</td>";
									for(var x = 0; x < list.length; x++) { //评审项
										var item = list[x].packageCheckItems;
										for(var z = 0; z < item.length; z++) { //评审内容
											if(z != 0) {
												html += "<tr>"
											};
											if(z == 0) {
												if(item.length==1 &&  x!=0 ){
													html += "<tr>";
												}
												html += "<td style='text-align:center;white-space:normal;word-break: break-all;' rowspan='" +item.length+ "'>" + list[x].checkName + "</td>";
											};
											
											html += "<td style='text-align:left;white-space:normal;word-break: break-all;'>" + item[z].checkTitle + "</td>";
											for(var e = 0; e < checker.length; e++) { //评委
												if(typeof(priceChecks[i].expertScores) != "undefined" && typeof(priceChecks[i].expertScores[checker[e].id]) != "undefined"){
												
													html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
												}else{
													html += "<td style='text-align:center'>/</td>";
												}
												
											}
																				
		
											if(z == 0) {										
												if(list[x].checkType == 1){
													if(priceChecks[i].expertScores){
														if(typeof(priceChecks[i].expertScores[list[x].id]) != "undefined"){
															html += "<td style='text-align:center' rowspan='" +item.length+ "'>" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>"
														}else{
															html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>"
														}
													}else{
														html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
													}
												}else{
													if(priceChecks[i].expertScores != undefined){
														if(typeof(priceChecks[i].expertScores[list[x].id]) != "undefined"){
															html += "<td style='text-align:center' rowspan='" +item.length+ "'>" + (priceChecks[i].expertScores[list[x].id]==0?"合格":"不合格") + "</td>"
														}else{
															html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
														}
														
													}else{
														html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
													}
													
												}
												
											};
											if(z != 0) {
												
												html += "</tr>"
											}else{
												if(item.length==1 &&  x!=0 ){
													html += "</tr>";
												}
											}
											if(x == 0 && z == 0) {												
												if(CheckTotals.checkItem == '已完成') {
													if(priceChecks[i].isOut==1){
														html += "<td style='text-align:center;'  value='1'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">不合格</td>";																														
													}else{
														html += "<td style='text-align:center;'  value='0'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">合格</td>";
													}				
												}else{
													if(priceChecks[i].isOut==0){
														if(checkPlan == 1 || checkPlan == 4 || checkPlan == 5){ //有效数量
															html += "<td style='text-align:center' "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +"><input class='iso' type='checkbox' id='isChoose_" + priceChecks[i].supplierId + "' ></td>";													
														}else{
															html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">合格</td>";
														}
														
														
													}else{
														html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +")>不合格</td>";
													}
												}
												
												html += "<td style='text-align:center;display:none' "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +"><span id='total_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].total||'')+ "'>" + priceChecks[i].total + "</sapn>"+"</td>";
												
												html += "</tr>";
											}
										}
									}
								}
							}							
						}
						
					}
					$("#checkTotalTable").html(html + '</tbody>');
				}
			}
		}
	});
};
function canSubmitCheck(callback) {
	var actionUrl = top.config.AuctionHost + '/RaterAskController/checkNotAnswerAsk';
	var canSubmit = true;
	$.ajax({
		url: actionUrl,
		data: {
			packageId: packageId,
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
//提交结果-评审记录汇总
$("#savePriceCheckTotal").off('click').click(function() {
	canSubmitCheck(doSavePriceCheckTotal);
})
function doSavePriceCheckTotal() {
	if(examType==1&&CheckTotals.priceCheck == "未完成") {
		top.layer.alert("价格评审未完成，不能进行评审记录汇总");
		return false;
	}
	if (CheckTotals.checkItem == "已完成") {
		top.layer.alert("评审记录汇总已完成");
		return false;
	}
	var checkPlace = $("#checkPlace").val();
	var checkDate = $("#checkDate").val();
	if(checkPlace == "") {
		top.layer.alert("请输入评审地点");
		return false;
	}
	if (checkPlace.length > 60) {
		top.layer.alert("评审地点不得超过60个字");
		return false;
	}
	if(examType==0){
		if(checkDate == "") {
			top.layer.alert("请选择评审时间");
			return false;
		}
		var r = new RegExp("^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))\\s+([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$");		
		if(checkDate!=""&&!r.test(checkDate)){
			parent.layer.alert('请输入正确格式的日期');
			return;
		}
	}
	
	var para = {
		projectId: projectId,
		packageId: packageId,
		checkPlace: checkPlace,
		// checkDate: checkDate,
		itemState: '0',
		examType: examType
	};
	if(examType==1){
		for (var i = 0; i < CheckTotals.priceChecks.length; i++) {
			if(CheckTotals.priceChecks[i].id){
				para['priceCheckItems[' + i + '].id'] = CheckTotals.priceChecks[i].id;
			}
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.priceChecks[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = $("#supplierOrder_" + CheckTotals.priceChecks[i].supplierId).val();
			para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.priceChecks[i].supplierId).attr('value');
			if (checkPlan == '0' || checkPlan == '2') {
				para['priceCheckItems[' + i + '].total'] = $("#total_" + CheckTotals.priceChecks[i].supplierId).attr('value')||"";
			}
			if ($("#isChoose_" + CheckTotals.priceChecks[i].supplierId).is(":checked")) { //选中  
				para['priceCheckItems[' + i + '].isChoose'] = "1";
			} else {
				para['priceCheckItems[' + i + '].isChoose'] = "0";
			}
		}
		if ($("#checkRemark") && $("#checkRemark").val().length > 0) {
			para.checkRemark = $("#checkRemark").val();
		}
		savePrice(para)
	}
	
	if(examType==0){
		var count = 0; //淘汰的数量
		para.checkDate = checkDate;
		for(var i = 0; i < CheckTotals.priceChecks.length; i++) {
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.priceChecks[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = i+1;
			if(checkPlan == 0){ //合格制	
				para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.priceChecks[i].supplierId).attr('value');
				if(para['priceCheckItems[' + i + '].isOut'] == 0){
					para['priceCheckItems[' + i + '].isChoose'] = "1"; //是候选人
				}else{
					para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人
				}
			}else{ //最多有限数量制
				para['priceCheckItems[' + i + '].total'] = $("#total_" + CheckTotals.priceChecks[i].supplierId).attr('value') || "" ;					
				if(CheckTotals.priceChecks[i].isOut == 0){
					if($("#isChoose_" + CheckTotals.priceChecks[i].supplierId).is(":checked")) { //选中 中选							
						para['priceCheckItems[' + i + '].isChoose'] = "1"; //候选人	
						para['priceCheckItems[' + i + '].isOut']=0;					
					} else {						
						para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人	
						para['priceCheckItems[' + i + '].isOut']=1;
						count++;					
					}	
				}else{
					para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人
					para['priceCheckItems[' + i + '].isOut']=1;
					count++;
				}
				
			}			
		}
		
		if($("#checkRemark") && $("#checkRemark").val().length > 0) {
			para.checkRemark = $("#checkRemark").val();
		}
		if(checkPlan == 1 || checkPlan == 4 || checkPlan == 5){ //有效数量
			if((CheckTotals.priceChecks.length-count) > keepNum){
				parent.layer.confirm('温馨提示：当前中选供应商数量超过最多保留供应商数，是否确定提交', {
				  btn: ['是', '否'] //可以无限个按钮
				}, function(index, layero){
					savePrice(para);
					parent.layer.close(index);					 
				}, function(index){
				   parent.layer.close(index);
				});
			}else{
				if(CheckTotals.isAllOut==1){
					savePrice(para);	
				}else{
					if((CheckTotals.priceChecks.length-count)==0){
						parent.layer.confirm('温馨提示：未勾选候选人，所有供应商将会被淘汰，是否确定提交', {
						  btn: ['是', '否'] //可以无限个按钮
						}, function(index, layero){
							savePrice(para);
							parent.layer.close(index);					 
						}, function(index){
						   parent.layer.close(index);
						});
					}else{
						savePrice(para);
					}
				}
							
			}
		}
		else{
			savePrice(para);
		}
	}	
};
function savePrice(para){
	/**
	 * 满意度,发送短信 isAgent = 1 -> 代理项目
	 */
	if(CheckTotals.isAgent == 1 && examType == 1){
		var notText = '';
		var urlSendMsg = top.config.AuctionHost + "/InFormController/inFormUser";
		var params = {
			'relationId':CheckTotals.packageId,
			'projectId':CheckTotals.projectId,
			'projectName':CheckTotals.packageName,
			'projectCode':CheckTotals.packageNum
		}
		$.ajax({
			url: urlSendMsg,
			data: params,
			async:false,
			type: 'post',
			success: function(res) {
				if(res.success) {
					notText = res.data;
				}
			}
		});
	}

	/**
	 * EnD-------------------------
	 */

	 
	$.ajax({
		type: "post",
		url: url + "/ReviewCheckController/saveCheckTotal.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
                getData();
				$('#'+_thisId).click();
				if(notText){
					top.layer.alert("提交成功"+', '+notText);
				}else{
					top.layer.alert("提交成功");
				}
				
			} else {				
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		},
		error: function (err) {
			
		}
	});
}
$('#editReport').off('click').on('click', function () {
	if (CheckTotals.checkItem == "未完成") {
		top.layer.alert("评审汇总未完成无法生成评审报告");
		return false;
	}
	if (CheckTotals.checkReport == "已完成") {
		top.layer.alert("评审报告已生成");
		return false;
	}
	top.layer.open({
		type: 2,
		title: "编辑报告",
		area: ['100%', '100%'],
		content: 'bidPrice/Review/projectManager/modal/editReport.html',
		success: function (layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.edit(projectId, packageId, examType, checkRemark, CheckTotals.isNeedSignReport)
		},

	});
})
//预览
$("#viewCheckReport").off('click').click(function () {
	if (CheckTotals.checkReport == '已完成') {
		//window.open($.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
		previewPdf(CheckTotals.checkReports[0].reportUrl);
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
function viewCheckReport(reportUrl) {
	previewPdf(reportUrl);
}
//下载
$("#downloadCheckReport").off('click').click(function () {
	if (CheckTotals.checkReport == '已完成') {
		window.open($.parserUrlForToken(top.config.FileHost + "/FileController/download.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl + "&fname=" + progressList.packageName + "_评审报告.pdf"));
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
$('#checkDate').datetimepicker({
	step: 5,
	lang: 'ch',
	format: 'Y-m-d H:i:s',
});
/*==========   评审记录汇总 END  ==========*/