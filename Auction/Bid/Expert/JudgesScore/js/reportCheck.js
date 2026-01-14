//var nowDate = new Date();
var systemTime;
$(function(){
	//获取当前时间
	/*$.ajax({
		type: "get",
		url: top.config.Syshost + "/EmployeeController/logOurView.do",
		async: false,
		success: function(data) {
			if(data.success) {
				data = data.data;
				if(data) {
					
					systemTime = data.currentTime;
					
					window.setInterval(function() {
						systemTime += 1000;
						//$("#systemTime").html(formatUnixtimestamp(systemTime));
					}, 1000);

				}
			}

		}
	});*/
})


$('#projectlist').bootstrapTable({
	method: 'get', // 向服务器请求方式
	url: config.bidhost + '/WaitCheckProjectController/findPageList.do',
	cache: false,
	striped: true,
	silent: true, // 必须设置刷新事件
	pagination: true,
	pageSize: 15,
	pageNumber: 1,
	pageList: [10, 15, 20, 25],
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	sidePagination: 'server',
	classes: 'table table-bordered', // Class样式
	queryParamsType: "limit",
	queryParams: function(params) {
		var paramData = {
			pageNumber: params.offset / params.limit + 1, //当前页数
			pageSize: params.limit, // 每页显示数量
			offset: params.offset // SQL语句偏移量	
		}
		paramData[$('a.search-type').attr('name')] = $('input[name=search-query]').val();
		return paramData;
	},
	columns: [
			[{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#projectlist').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#projectlist').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
			},{
				field: 'projectCode',
				title: '采购项目编号',
				width: '160'
			},
			{
				field: 'projectName',
				title: '采购项目名称',
				formatter:function(value, row, index){
					if(row.projectSource==1){
		
						 	var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.projectName +'<span class="text-danger"  style="font-weight:bold">(重新采购)</span></div>';		
							
					
					}else{
						var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.projectName +'</div>';
					}						
					return projectName;
				}
			},{
				field: 'packageNum',
				title: '包件编号',
				width: '180'
			},{
				field: 'packageName', 
				title: '包件名称',
				formatter:function(value, row, index){
					if(row.packageSource==1){
						return value+'<span class="text-danger">(重新采购)</span>';
					}else{
						return value;
					}
					
				}
			}, {
				field: 'checkPlan',
				title: '评审方法',
				align:'center',
				width: '120',
				formatter: function(value, row, index) {
                    if(row.examType == 0){
                    	/*if(row.checkEndDate){
                    		if(row.checkPlan == 0) return "综合评分法";
							if(row.checkPlan == 1) return "最低价法";
						}else{	*/
							if(row.examCheckPlan == 0) return "合格制";
							if(row.examCheckPlan == 1) return "有限数量制";
							
						//}
                    }else{
                    	if(row.checkPlan == 0) return "综合评分法";
						if(row.checkPlan == 1) return "最低价法";
						if(row.checkPlan == 2) return "经评审的最低价法(价格评分)";
						if(row.checkPlan == 3) return "最低投标价法";
						if(row.checkPlan == 4) return "经评审的最高投标价法";
						if(row.checkPlan == 5) return "经评审的最低投标价法";
                    }
				}
			}, {
				field: 'expertCheckState',
				title: '评审状态',
				align:'center',
				width: '80',
				formatter: function(value, row, index) {
					if(row.isStopCheck==1){
						return '<span class="text-danger">已流标</span>'
					}else{
						if(row.stopCheckReason!=""&&row.stopCheckReason!=undefined){							
							return '<span class="text-danger">已流标</span>'
						}else{
							return "<span style='color:" + (value == "完成打分" ? "green" : "red") + "'>" + value + "</span>";
						}
					}
					
				}
			},{
				field: 'tenderType',
				title: '采购方式',
				width: '110',
				align:'center',
				formatter: function(value, row, index) {
					if(value==0){
						return '询价采购'
					}else if(value==6){
						return '单一来源采购'
					}else if(value==12){
						return '竞争性谈判采购'
					}else if(value==13){
						return '竞争性磋商采购'
					}
					
				}

			},
			{
				field: 'examCheckEndDate',
				title: '预审时间',
				width: '150',
				align:'center',
			},
			{
				field: 'checkEndDate',
				title: '评审时间',
				width: '150',
				align:'center',
			},
			{
				title: '操作',
				align:'center',
				width: '80',
				events: {
					'click .btn-enter': function(e, value, row, index) {
						if(row.tenderType==12){						
							$.ajax({
								type: "post",
								url: config.bidhost + "/JtCheckController/verifyPackageForExpert.do",
								data: {
									projectId: row.id,
									packageId: row.packageId,
									examType: 0,
									checkType:1
								},
								async: false,
								success: function(data) {
									if(data.success) {
										
											msg = "";
											checkPackageListJztp(row.projectId,row.packageId,0);
											if(msg == 1){
											
												var index = top.layer.open({
													type: 2,
													title: "评审项目管理",
													area: ['100%', '100%'],
													btn: ["刷新", "关闭"],
													content: $.parserUrlForToken("bidPrice/CompeteParley/Review/includePrice/modal/include.html?projectId="+row.id+"&packageId="+row.packageId+ "&checkPlan=" + row.examCheckPlan+'&expertId='+row.expertId+'&tenderType='+row.tenderType+'&turn='+row.turn),
													btn1: function(index, layero) {
														parent.window[layero.find('iframe')[0]['name']].location.reload();
													},
												});
											
											}

									} else {
										top.layer.alert(data.message);										
										return;
									}
								}
							});
							}else if(row.tenderType==13){
						
								$.ajax({
									type: "post",
									url: config.bidhost + "/JcCheckController/verifyPackageForExpert.do",
									data: {
										projectId: row.id,
										packageId: row.packageId,
										examType: 0,
										checkType:1
									},
									async: false,
									success: function(data) {
										if(data.success) {												
											msg = "";
											checkPackageListJzCs(row.projectId,row.packageId,0);
											if(msg == 1){
											
												var index = top.layer.open({
													type: 2,
													title: "评审项目管理",
													area: ['100%', '100%'],
													btn: ["刷新", "关闭"],
													content: $.parserUrlForToken("bidPrice/CompeteDiscussion/Review/includePrice/modal/include.html?projectId="+row.id+"&packageId="+row.packageId+ "&checkPlan=" + row.examCheckPlan+'&expertId='+row.expertId+'&tenderType='+row.tenderType+'&turn='+row.turn),
													btn1: function(index, layero) {
														parent.window[layero.find('iframe')[0]['name']].location.reload();
													},
												});											
											}
										} else {
											top.layer.alert(data.message);
											//msgConfirm(data.message);
											return;
										}
									}
								});
						}else{
						//判断当前为预审还是评审项目						
						if(row.examType == 0){
							$.ajax({
								type: "post",
								url: config.bidhost + "/WaitCheckProjectController/verifyPackageForExpert.do",
								data: {
									projectId: row.id,
									packageId: row.packageId,
									examType: 0,
									checkType:1
								},
								async: false,
								success: function(data) {
									if(data.success) {
										msg = "";
										checkPackageList(row.projectId,row.packageId,0);
										if(msg == 1){										
											var index = top.layer.open({
												type: 2,
												title: "评审项目管理",
												area: ['100%', '100%'],
												btn: ["刷新", "关闭"],
												content: $.parserUrlForToken("Auction/common/Expert/JudgesScoreReady/ExpertCheckInfo.html?projectId="+row.id+"&packageId="+row.packageId+ "&checkPlan=" + row.examCheckPlan+'&expertId='+row.expertId+'&tenderType='+row.tenderType),
												btn1: function(index, layero) {
													parent.window[layero.find('iframe')[0]['name']].location.reload();
												},
											});
										
										}
									} else {
										top.layer.alert(data.message);
										//msgConfirm(data.message);
										return;
									}
								}
							});	
						}else{
							//评审
							if(row.purExamType == 1){
								$.ajax({
									type: "post",
									url: config.bidhost + "/WaitCheckProjectController/verifyPackageForExpert.do",
									data: {
										projectId: row.id,
										packageId: row.packageId,
										examType: 1,
									},
									async: false,
									success: function(data) {
										if(data.success) {
											
											//打开评审
											msg = "";
											checkPackageList(row.projectId,row.packageId,1);
											if(msg == 1){
												var index = top.layer.open({
													type: 2,
													title: "评审项目管理",
													area: ['100%', '100%'],
													btn: ["刷新", "关闭"],
													content: $.parserUrlForToken("Auction/common/Expert/JudgesScore/ExpertCheckInfo.html?projectId="+row.id+"&packageId="+row.packageId+ "&checkPlan=" + row.checkPlan+'&expertId='+row.expertId+'&tenderType='+row.tenderType),
													btn1: function(index, layero) {
														parent.window[layero.find('iframe')[0]['name']].location.reload();
													},
												});
											}
										} else {
											top.layer.alert(data.message);
											//msgConfirm(data.message);
											return;
									 	}
									}
								});
								
							}else{
								$.ajax({
									type: "post",
									url: config.bidhost + "/WaitCheckProjectController/verifyPackageForExpert.do",
									data: {
										projectId: row.id,
										packageId: row.packageId,
										examType: 0,
									},
									async: false,
									success: function(data) {
										if(data.success) {
											//预审后审
											/*if(row.isStopCheck == 1) {
												parent.layer.alert("温馨提示：该项目已流标!");
												return;
											}else{
												if(row.stopCheckReason!=""&&row.stopCheckReason!=undefined){
													parent.layer.alert("温馨提示：该项目已申请流标!");
													return
												}								
											}*/
											
											//if(row.checkEndDate && systemTime > GetTime(row.checkEndDate)){
												
												/*if(row.purExamType == 1 && row.offerSupplierCount < row.supplierCount){
													//当参与人数小于最少供应商人数时提示
													top.layer.alert("温馨提示：该包件参与供应商人数不足"+row.supplierCount+"个");
													return;
												}*/
												
												/*if(row.purExamType == 0 && row.inviteSupplierCount && row.offerSupplierCount < row.inviteSupplierCount){
													//当参与人数小于最少供应商人数时提示
													top.layer.alert("温馨提示：该包件参与供应商人数不足"+row.inviteSupplierCount+"个");
													return;
												}
												
												if(row.leaderCount <=0){
													top.layer.alert("温馨提示：项目评审评委还未设置组长");
													return;
												}*/
												
												//打开评审
												msg = "";
												checkPackageList(row.projectId,row.packageId,1);
												if(msg == 1){
													var index = top.layer.open({
														type: 2,
														title: "评审项目管理",
														area: ['100%', '100%'],
														btn: ["刷新", "关闭"],
														content: $.parserUrlForToken("Auction/common/Expert/JudgesScore/ExpertCheckInfo.html?projectId="+row.id+"&packageId="+row.packageId+ "&checkPlan=" + row.checkPlan+'&expertId='+row.expertId+'&tenderType='+row.tenderType),
														btn1: function(index, layero) {
															parent.window[layero.find('iframe')[0]['name']].location.reload();
														},
													});
												}
											/*}else{
												parent.layer.alert("温馨提示：项目评审还未开始,请在"+row.checkEndDate+"之后进入");
												return;
											}*/
										} else {
											top.layer.alert(data.message);
											//msgConfirm(data.message);
											return;
									 	}
									}
								});
								
								
								
							}
							
							
						}
						}
													
					},
//					'click .btn-enter': function(e, value, row, index) {
//						
//					}
				},
				formatter: function(value, row, index) {
						
					return '<button class="btn btn-primary btn-xs btn-enter">进入</button>';
				}
			}
		]
	]
})

var msg
function checkPackageList(projectId,packageId,exam){
	
	$.ajax({
		type: "post",
		url: config.bidhost + "/CheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: exam,
			enterpriseType:2
		},
		async: false,
		success: function(data) {
			if(data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg =  2;
			}
		}
	});

}

$('ul.search-type li').click(function() {
	$(this).siblings('.active').removeClass('active').end().addClass('active');
	$('a.search-type').html($(this).text()).attr('name', $(this).find('a')[0].name);
})

$('.search-btn').click(function() {
	$('#projectlist').bootstrapTable('refresh');
})

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + (date.getMonth() + 1);
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + date.getDate();
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}

function GetTime(time){
	var date=new Date(time.replace("-", "/").replace("-", "/")).getTime();
	return date;
};

function msgConfirm(notice){
	top.layer.confirm(notice, {
	  btn: ['确定'] //可以无限个按钮
	}, function(index, layero){
	   top.layer.close(index);
	   top.$('#projectlist').bootstrapTable('refresh');
	});
}

function checkPackageListJztp(projectId,packageId,exam){
	
	$.ajax({
		type: "post",
		url: config.bidhost + "/JtCheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			enterpriseType:2
		},
		async: false,
		success: function(data) {
			if(data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg =  2;
			}
		}
	});

}
function checkPackageListJzCs(projectId,packageId,exam){
	
	$.ajax({
		type: "post",
		url: config.bidhost + "/JcCheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			enterpriseType:2
		},
		async: false,
		success: function(data) {
			if(data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg =  2;
			}
		}
	});

}