var sendMsgUrl = config.tenderHost + "/InFormController/inFormUser"; //满意度调查发送短信的接口

var listUrl = config.Reviewhost + '/ProjectController/findManagerPageList.do'; //列表接口
var orderUrl = config.Reviewhost + '/ReviewControll/instruct.do'; //暂停与恢复接口
var reasonHtml = 'Review/reasonList.html'; //暂停时进入的页面
var dataPushPublic='Review/dataPush/dataPushPublic.html'
var pageCheck;
var loginInfo;
var examType;
$(function() {
	examType = window.PAGEURL.getQueryString("examType");
	if(!examType) {
		examType = 2;
	}
	loginInfo = entryInfo();
	initDataTab();
	//查询
	$("#btnSearch").click(function() {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
});
// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'examType': examType,
		'BidSectionCode': $("#interiorBidSectionCode").val(), // 标段编号
		'bidSectionName': $("#bidSectionName").val(), // 标段名称			
	};
	return projectData;
};
//表格初始化
function initDataTab() {
	$("#tableList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		height: (top.tableHeight - $('#toolbarTop').height()),
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		onCheck: function(row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function(value, row, index) {
						var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				}, {
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle: {
						css: {
							"min-width": "200px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle: {
						css: {
							"min-width": "300px",
							"word-wrap": "break-word",
							"word-break": "break-all",
							"white-space": "normal"
						}
					}
				}, {
					field: 'examType',
					title: '评审会类型',
					align: 'center',
					formatter: function(value, row, index) {
						if(value == 1) {
							return '资格预审会'
						} {
							return '评审会'
						}
					}
				},
				/*{
									field: 'checkStartDate',
									title: '评标开始时间',
									align: 'center',
									width: '150'
								},*/
				{
					field: 'checkEndDate',
					title: '评标结束时间',
					align: 'center',
					width: '150',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					}
				},
				{
					field: 'checkState',
					title: '评标状态',
					align: 'center',
					width: '150',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						// 0:未开始 1:评标中 2:评标结束
						if(value == 0) {
							return "未开始"
						} else if(value == 1) {
							return "评标中"
						} else if(value == 2) {
							return "评审结束"
						} else if(value == 3) {
							return "暂停"
						}
					}
				}, {
					field: 'recommendResult',
					title: '组长',
					align: 'center',
					width: '100',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						//0推荐中 1未选出组长 2 选中组长
						if(row.groupExpertName) {
							return "已推选"
						} else {
							if(row.signResult == 0) {
								return "未推选"
							} else {
								if(value == 0) {
									return "推选中"
								} else if(value == 1) {
									return "已推选"
								} else if(value == 2) {
									return "已推选"
								} else {
									return "未推选"
								}
							}

						}
					}
				}, {
					field: 'states',
					title: '标段状态',
					align: 'center',
					width: '100',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						//0.编辑 1.生效 2.撤回 3.招标完成 4.流标 5.重新招标 6.终止
						if(value == 0) {
							return '编辑'
						} else if(value == 1) {
							return '生效'
						} else if(value == 2) {
							return '撤回'
						} else if(value == 3) {
							return '招标完成'
						} else if(value == 4) {
							return '流标'
						} else if(value == 5) {
							return '重新招标'
						} else if(value == 6) {
							return '终止'
						}
					}
				},
				{
					field: '',
					field: 'status',
					title: '操作',
					align: 'center',
					width: '200px',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					events: {
						'click .btnEnter': function(e, value, row, index) {
							if(!isTabNewReview) {
								if(systemType == 'sh') {
									//资格后审核
									if(row.examType == 2) {
										if(row.checkType == '3') { //经评审最低价
											pageCheck = "Review/Universally/Minimum/pmCurrency/model/judgeCheck.html"; //评标
										} else if(row.checkType == '10') { //综合（权重）
											pageCheck = "Review/epc/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										} else if(row.checkType == '4') {
											pageCheck = "Review/Universally/miniBidPrice/pmCurrency/model/judgeCheck.html"; //最低投标价 （无详细评审）
										} else if(row.checkType == '5') {
											pageCheck = "Review/Universally/miniJudgePrice/pmCurrency/model/judgeCheck.html"; //最低评标价 （无详细评审）
										} else if(row.checkType == '2') { //综合（无权重）
											pageCheck = "Review/Universally/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										} else {
											pageCheck = "Review/Universally/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										}
									} else {
										//资格预审
										if(/1/.test(row.checkType)) {
											pageCheck = "Review/pretrial/qualified/pmCurrency/model/judgeCheck.html"; //合格制
										} else {
											pageCheck = "Review/pretrial/limitedNumber/pmCurrency/model/judgeCheck.html"; //有限数量制
										}
									}
								} else if(systemType == 'df') {
									//资格后审核
									if(row.examType == 2) {
										if(row.checkType == '3') { //经评审最低价
											pageCheck = "Review/df/Universally/Minimum/pmCurrency/model/judgeCheck.html"; //评标
										} else if(row.checkType == '10') { //综合（权重）
											pageCheck = "Review/df/epc/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										} else if(row.checkType == '4') {
											pageCheck = "Review/df/Universally/miniBidPrice/pmCurrency/model/judgeCheck.html"; //最低投标价 （无详细评审）
										} else if(row.checkType == '5') {
											pageCheck = "Review/df/Universally/miniJudgePrice/pmCurrency/model/judgeCheck.html"; //最低评标价 （无详细评审）
										} else if(row.checkType == '9') { //综合（无权重）
											pageCheck = "Review/df/Universally/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										} else {
											pageCheck = "Review/df/Universally/comprehensive/pmCurrency/model/judgeCheck.html"; //评标
										}

									} else {
										//资格预审
										if(/1/.test(row.checkType)) {
											pageCheck = "Review/df/pretrial/qualified/pmCurrency/model/judgeCheck.html"; //合格制
										} else {
											pageCheck = "Review/df/pretrial/limitedNumber/pmCurrency/model/judgeCheck.html"; //有限数量制
										}
									}
								}

								pageCheck = pageCheck + '?bidSectionId=' + row.bidSectionId + '&idCode=' + loginInfo.idCard + '&examType=' + row.examType + '&checkType=' + row.checkType + '&isPublicProject=' + row.isPublicProject;
							} else {
								if(systemType == 'sh') {
									pageCheck = 'Review/judgeCheck/index.html?bidSectionId=' + row.bidSectionId + '&examType=' + row.examType; //评标
								} else {
									pageCheck = 'Review/dfJudgeCheck/index.html?bidSectionId=' + row.bidSectionId + '&examType=' + row.examType; //评标
								}
							}

							if(row.checkState == 0) {
								top.layer.alert('温馨提示：评审还未开始')
							} else {
								layer.open({
									type: 2,
									title: "评标管理",
									area: ['100%', '100%'],
									resize: false,
									id: 'layerPackage',
									content: pageCheck + '&type=pbgl&owner=' + row.owner,
									success: function(layero, index) {
										var iframeWin = layero.find('iframe')[0].contentWindow;
										iframeWin.passMessage(row, refreshFather);
									},
									end: function(layero, index) {
										$("#tableList").bootstrapTable("refresh");
									}
								});
							}

						},
						'click .btnEnd': function(e, value, row, index) {
							top.layer.confirm("温馨提示:是否结束该标段的评审?", function(indexs) {

								$.ajax({
									type: "post",
									url: config.Reviewhost + '/ReviewControll/instruct.do',
									data: {
										'bidSectionId': row.bidSectionId,
										'examType': row.examType,
										'instruct': 'end'
									},
									async: true,
									success: function(data) {
										if(data.success) {
											if(row.examType == 2) {
												sendMessage(row.bidSectionId, indexs);
											} else {
												$("#tableList").bootstrapTable("refresh");
												top.layer.close(indexs);
												top.layer.alert("结束评标成功");
											}
										} else {
											top.layer.alert('温馨提示：' + data.message);
										}
									}
								});
							});
						},
						'click .btnPause': function(e, value, row, index) {
							top.layer.confirm("温馨提示:确定暂停评审?", function(indexs) {
								$.ajax({
									type: "post",
									url: orderUrl,
									data: {
										'bidSectionId': row.bidSectionId,
										'examType': row.examType,
										'instruct': 'stop'
									},
									async: true,
									success: function(data) {
										if(data.success) {
											$("#tableList").bootstrapTable("refresh");
											top.layer.close(indexs);
										} else {
											top.layer.alert('温馨提示：' + data.message);
										}
									}
								});
							});
						},
						'click .btnPlay': function(e, value, row, index) {
							top.layer.confirm("温馨提示:确定恢复评审?", function(indexs) {
								$.ajax({
									type: "post",
									url: orderUrl,
									data: {
										'bidSectionId': row.bidSectionId,
										'examType': row.examType,
										'instruct': 'recovery'
									},
									async: true,
									success: function(data) {
										if(data.success) {
											$("#tableList").bootstrapTable("refresh");
											top.layer.close(indexs);
										} else {
											top.layer.alert('温馨提示：' + data.message);
										}
									}
								});
							});
						},
						'click .btnView': function(e, value, row, index) {
							layer.open({
								type: 2,
								title: '信息',
								area: ['1000px', '600px'],
								resize: false,
								content: reasonHtml + '?id=' + row.bidSectionId + '&examType=' + row.examType,
								success: function(layero, index) {
									var iframeWin = layero.find('iframe')[0].contentWindow;
									//									 iframeWin.passMessage(row)
								},
							});
						},
						//公示推送
//						'click .puclic': function(e, value, row, index) {
//							type = $(this).data('type')
//							top.layer.open({
//								type: 2,
//								title: '公示推送',
//								area: ['1000px', '600px'],
//								content: dataPushPublic + '?id=' + row.bidSectionId + '&examType=' + row.examType,
//							});
//						}
						/*'click .evade':function(e,value, row, index){
							top.layer.confirm("温馨提示:是否确定重新评标该标段?", function(indexs) {
								$.ajax({
									type: "post",
									url: config.Reviewhost  + "/ReviewControll/resetAll.do",
									data: {
										packageId: row.bidSectionId,
										examType:row.examType,

									},
									async: true,
									success: function(data) {
										if(data.success) {
											$("#tableList").bootstrapTable("refresh");
											top.layer.close(indexs);
										} else {
											top.layer.alert(data.message);
										}
									}
								});	
							});
						},*/
					},
					formatter: function(value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnEnter" data-index="' + index + '">查看评标</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '">查看评标</button>';
						var strEnd = '<button  type="button" class="btn btn-primary btn-sm btnEnd" data-index="' + index + '">结束评标</button>';
//						var strEnd = '<button  type="button" class="btn btn-primary btn-sm btnEnd" data-index="' + index + '">结束评标</button><button class="btn btn-primary btn-sm puclic" data-type="edit">公示推送</button>';
						//						var strPause = '<button  type="button" class="btn btn-primary btn-sm btnPause" data-index="'+index+'">暂停评标</button>';		
						//						var strPlay = '<button  type="button" class="btn btn-primary btn-sm btnPlay" data-index="'+index+'">恢复评标</button>';	
						//						var evade = '<button  type="button" class="btn btn-primary btn-sm evade" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>重新评标</button>';		
						if(loginInfo.enterpriseId != 'AAA999') { //项目经理
							if(row.checkState == 1) { //评审中
								var str = strSee;
								/*if(row.isPublicProject != 1){//非公共资源
									str += strPause
								}*/
								if(row.checkReport == 1) {
									str += strEnd
								}
								return str;
							} else if(row.checkState == 3) { //暂停
								return strView
								/*if(row.isPublicProject != 1){//非公共资源
									return strPlay+ strView
								}else{
									return  strView
								}*/

							} else {
								return strSee;
							}
						} else {
							return strSee;
						}
						/*if(row.checkReport == 1 && row.checkState == 1 && loginInfo.enterpriseId != 'AAA999'){
							return strSee + strEnd;
						}else{
							return strSee ;
						}*/
					}
				}
			]
		]
	});
};
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather() {
	$('#tableList').bootstrapTable('refresh');
}
/**********************将标段的标段Id传到后面,判断是否发送短信，如果没有就发送短信，有就不需要发送短信***************/
function sendMessage(bidSectionId, indexs) {
	$.ajax({
		type: "post",
		url: sendMsgUrl,
		async: false,
		data: {
			'relationId': bidSectionId,
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					parent.layer.alert(data.data, {
						closeBtn: 0
					}, function(index) {
						$("#tableList").bootstrapTable("refresh");
						top.layer.close(indexs);
						top.layer.close(index);
						top.layer.alert("结束评标成功");
					});
				}
			}
		}
	});
}