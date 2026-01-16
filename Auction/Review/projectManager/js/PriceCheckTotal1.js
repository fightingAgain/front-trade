/*
 */ 
/*==========   评审记录汇总   ==========*/
var CheckTotals;
var checkRemark;
$(function(){
	if(examType == 1){
		$(".tenderTypeW").show();
		$("#quotePriceUnit").html(quotePriceUnit);
		$(".checkRemarkCol").attr('colspan','1')
	}
    var _ph=$("#reportContent").height();
    var _bh=$("#checkTotalBtn").height();
    $("#checkTotalDiv").height(_ph-_bh)
	PriceCheckTotal();
	if(progressList.projectCheckers[0].isShowReport==0){
		$("#isShowReport").show()
	}
	
})

//评审记录汇总
var CheckTotals;
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
		async: true,
		success: function(data) {
			if(!data.success){
				parent.layer.alert(data.message)			
				$("#"+_THISID).click();
				return
			}
			_THISID=_thisId;
			data = data.data;
			CheckTotals = data;			
			if(data.checkItem == '已完成') {
				$("#checkPlace").html(data.priceCheckTotals[0].checkPlace);
				$("#checkDate").html(data.priceCheckTotals[0].checkDate);
				$("#checkRemark").html(data.priceCheckTotals[0].checkRemark);

				var checkItem;
				if(data.priceCheckItems) {
					checkItem = data.priceCheckItems;
				} else {
					checkItem = data.priceChecks;
				}
				if(checkPlan == '1'||checkPlan=="3" || checkPlan=="4") {
					var colspan=[
						{
							field: '#',
							title: '序号',
							width: '50px',
							align: 'center',
							cellStyle: {
								css: {
									"text-align": "center"
								}
							},
							formatter: function(value, row, index) {
								return index + 1;
							}
						}, {
							field: 'enterpriseName',
							title: '供应商名称',
							width: '200px',
						},
						{
							title: '淘汰',
							field: 'isOut',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function(value, row, index) {
								return value == 1 ? "是" : "否";
							}
						},{
							field: 'saleTaxTotal',
							title: '供应商报价',
							width: '150px',
							align: 'right',
						},{
							field: 'fixCount',
							title: '算术修正值',
							width: '120px',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
								
							}
						},{
							field: 'fixFinalPrice',
							title: '修正后总价',
							width: '120px',
							align: 'right',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
							}
						},
						{
							field: 'defaultItem',
							title: '缺漏项'+(checkPlan=="4"?'减':'加')+'价',
							width: '120px',
							align: 'right',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
							}
						}
					]
					if(checkPlan == '1' || checkPlan=="4"){
						colspan.push(
							{
								field: 'deviateNum',
								title: '计入总数偏离项数',
								width: '150px',								
							}
						)
					}
					colspan.push(
						{
							field: 'deviatePrice',
							title: '偏离'+(checkPlan=="4"?'减':'加')+'价',
							width: '150px',
							align: 'right',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
							}
						},
						{
							field: 'totalCheck',
							title: '评审总价',
							width: '150px',
							align: 'right',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
							}
						},
						{
							field: 'reason',
							title: '调整原因',
							width: '150px',
							formatter: function(value, row, index) {
								
								if(row.isOut == '1'){
									return "/"
								}else{
									return value;
								}
							}
						},
						{
							field: 'supplierOrder',
							title: '排名',
							align: 'center',
							halign: 'center',
							width: '80px',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return '/'
								}else{
									return value;
								}
							}
						},
						{
							field: 'isChoose',
							title: '候选人',
							width: '80px',
							align: 'center',
							halign: 'center',
							formatter: function(value, row, index) {
								if(row.isOut == '1'){
									return '/'
								}else{
									return value == 0 ? "否" : "是";
								}									
							}
						}
					)
					$("#checkTotalTable").bootstrapTable({
						data: checkItem,
						columns: colspan
					});
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
					if(priceChecks) {
						html += "<thead><tr>";
						html += "<th style='text-align:left' width='200px'>供应商名称</th>";
						html += "<th style='text-align:center' width='120px'>评审项</th>";
						html += "<th style='text-align:center' width='400px'>评审内容</th>";
						for(var i = 0; i < checker.length; i++) {
							if(examType==1){
								html += "<th style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + checker[i].expertName + ")</th>";
							}else{
								html += "<th style='text-align:center' width='100px'>" + checker[i].expertName + "</th>";
							}
							
						}
						if(examType==1){
							html += "<th style='text-align:center' width='90px'>分项平均分</th>";
							html += "<th style='text-align:center' width='120px'>分项平均总得分</th>";
							html += "<th style='text-align:center' width='110px'>商务报价得分</th>";
							html += "<th style='text-align:center' width='75px'>淘汰</th>";
							html += "<th style='text-align:center' width='80px'>总分</th>";
							html += "<th style='text-align:center' width='70px'>排名</th>";
							html += "<th style='text-align:center' width='75px'>候选人</th>";
						}else{
							html += "<th style='text-align:center' width='70px'>结果</th>";
							html += "<th style='text-align:center' width='75px'>评审结果</th>";
						}
						
						html += "</tr></thead>";

						//跨行条数
						var enterpriseRowspan = 0;
						for(var x = 0; x < list.length; x++) { //评审项
							enterpriseRowspan += list[x].packageCheckItems.length;
							if(list[x].checkType == 1||list[x].checkType == 3) enterpriseRowspan++;
						}
						if(examType==1){
							console.log('1', 1);
							for(var i = 0; i < priceChecks.length; i++) {

								if(list && list.length > 0) {
									html += "<tbody><tr>";
									html += "<td style='text-align:left;' rowspan='" + enterpriseRowspan + "'>" + priceChecks[i].enterpriseName + "</td>";
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
												html += "<td style='text-align:center;white-space:normal;word-break: break-all;' rowspan='" + ((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + list[x].checkName + "</td>";
											};
											html += "<td style='text-align:left;white-space:normal;word-break: break-all;'>" + item[z].checkTitle + "</td>";
											for(var e = 0; e < checker.length; e++) { //评委
												html += "<td style='text-align:center'>" + ((priceChecks[i].expertScores && priceChecks[i].expertScores[checker[e].id] && priceChecks[i].expertScores[checker[e].id][item[z].id]) ? priceChecks[i].expertScores[checker[e].id][item[z].id] : '/') + "</td>";
											}
	
											if(list[x].checkType == 1||list[x].checkType == 3) {
												html += "<td style='text-align:center'>" + ((priceChecks[i].expertScores && priceChecks[i].expertScores[item[z].id]) ? priceChecks[i].expertScores[item[z].id] : "/") + "</td>";
											} else {
												if(list[x].checkType == 0){
													html += "<td style='text-align:center'>"+(priceChecks[i].expertScores ? (priceChecks[i].expertScores[item[z].id]==0?"符合":"不符合") : '/')+"</td>";
												}else if(list[x].checkType == 2){
													html += "<td style='text-align:center'>"+(priceChecks[i].expertScores ? (priceChecks[i].expertScores[item[z].id]==0?"合格":"不合格") : '/')+"</td>";
												}else{
													html += "<td style='text-align:center'>0</td>";
												}
											}
	
											if(z == 0) {
												if(list[x].checkType == 1||list[x].checkType == 3) {
													html += "<td style='text-align:center' rowspan='" + 
														((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + 
														((priceChecks[i].expertScores && priceChecks[i].expertScores[list[x].id]) ? priceChecks[i].expertScores[list[x].id] : "/") + 
													"</td>"
												
												} else {
												
													if(list[x].checkType == 0){
														html += "<td style='text-align:center' rowspan='" + 
															((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) +
														 "'>"
														 +(priceChecks[i].expertScores ? (priceChecks[i].expertScores[list[x].id]==0?"符合":"不符合") : '/')+ "</td>"
													}else if(list[x].checkType == 2){
														
														html += "<td style='text-align:center' rowspan='" + 
																((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) +
														 "'>" + 
														( priceChecks[i].expertScores ? (priceChecks[i].expertScores[list[x].id] == 0?"合格":"不合格") : '/') + "</td>"
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
												html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].score || '/') + "</td>";											
												html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].isOut ? "<span id='isOut_" + priceChecks[i].supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + priceChecks[i].supplierId + "' value='0'>否</sapn>") + "</td>";
												html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + priceChecks[i].total + "</sapn></td>";
												html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].supplierOrder || '') + "</td>";
												html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].isChoose ? "是" : "否") + "</td>";
												html += "</tr>";
											}
										}
										if(list[x].checkType == 1||list[x].checkType == 3) {
											html += "<tr><td style='text-align:center'>得分</td>";
											for(var e = 0; e < checker.length; e++) {
												html += "<td  style='text-align:center' >" + ((priceChecks[i].expertScores && priceChecks[i].expertScores[checker[e].id] && priceChecks[i].expertScores[checker[e].id][list[x].id]) ? priceChecks[i].expertScores[checker[e].id][list[x].id] : "/" )+ "</td>";
											}
											html += "<td  style='text-align:center' >" + ((priceChecks[i].expertScores && priceChecks[i].expertScores[list[x].id]) ? priceChecks[i].expertScores[list[x].id] : "/" )+ "</td>";
											html += "</tr>";
										}
									}
								}
							}
						}else{

							console.log('2', 2);
							for(var i = 0; i < priceChecks.length; i++) {
								if(list && list.length > 0) {
									html += "<tr>";
									html += "<td style='text-align:center;' rowspan='" + enterpriseRowspan + "'>" + priceChecks[i].enterpriseName + "</td>";
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
														html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>"
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
														html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  rowspan='" + enterpriseRowspan + "'>不合格</td>";
													}else{
														html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  rowspan='" + enterpriseRowspan + "'>合格</td>";
													}
												}else{
													if(priceChecks.isOut==0){
														if(checkPlan == 1 || checkPlan == 4){		
															html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'><input class='iso' type='checkbox' id='isChoose_" + priceChecks[i].supplierId + "' ></td>";
															
														}else{
															
															html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  rowspan='" + enterpriseRowspan + "'>合格</td>";
														}
														
														
													}else{
														//if(checkPlan == 3){
															html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  rowspan='" + enterpriseRowspan + "'>不合格</td>";
													}
												}
												
												html += "<td style='text-align:center;display:none' rowspan='" + enterpriseRowspan + "'><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + priceChecks[i].total + "</sapn>"+"</td>";
												html += "</tr>";
											}
										}
									}
								}
							}
							
						}
						
					}
					$("#checkTotalTable").html(html + '</tbody>');
					// $('#checkTotalTable').magicTable({thfix: 0, leftIndex: 3, leftFlg: true});//leftIndex:3;左边固定四列
				}
			} else {
				top.layer.alert("评审记录汇总未完成！");			
			}
		}
	});
}
//预览
$("#viewCheckReport").off('click').click(function() {
	if(CheckTotals.checkReport == '已完成') {
		previewPdf(CheckTotals.checkReports[0].reportUrl);
		//window.open($.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
function viewCheckReport(reportUrl){
	previewPdf(reportUrl);
}
//下载
$("#downloadCheckReport").off('click').click(function() {
	var str2= progressList.packageName.replace(/[\!\|\~\`\#\$\%\^\&\*\"\?]/g, ' ');
	if(CheckTotals.checkReport == '已完成') {
		window.open($.parserUrlForToken(top.config.FileHost + "/FileController/download.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl + "&fname=" + str2 + "_评审报告.pdf"));
	} else {
		top.layer.alert("评审报告未生成！");
	}
});