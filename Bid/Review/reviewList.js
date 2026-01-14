var listUrl = config.Reviewhost + '/ProjectController/findExpertPageList.do';  //列表接口
var entryUrl = config.tenderHost + '/getEmployeeInfo.do';  //获取登录人信息
var orderUrl = config.Reviewhost + '/ReviewControll/instruct.do';//暂停与恢复接口
var verifyIsEndUrl = config.Reviewhost + '/ProjectController/verifyIsEnd.do';//验证评标是否结束
var reasonHtml = 'Review/reasonList.html';//暂停时进入的页面
var pageCheck  //评审
var loginInfo = {};//当前登录评委信息
// var idCard = top.loginInfo.idCard;
$(function () {
	initDataTab();
	//查询
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
		//		$("#tableList").bootstrapTable("refresh");
	});
	entryInfo();
});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber': params.offset / params.limit + 1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
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
			}, {
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
				formatter: function (value, row, index) {
					if (value == 1) {
						return '资格预审会'
					} {
						return '评审会'
					}
				}
			}, {
				field: 'signResult',
				title: '是否签订承诺书',
				align: 'center',
				width: '100',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					if (row.signResult == 1) {
						return '已签订'
					} else if (row.signResult == 0) {
						return '未签订'
					}
				}
			},/*{
					field: 'checkStartDate',
					title: '评审开始时间',
					align: 'center',
					width: '150'
				},*/
			{
				field: 'checkEndDate',
				title: '评审结束时间',
				align: 'center',
				width: '150',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				}
			},
			{
				field: 'checkState',
				title: '评审状态',
				align: 'center',
				width: '150',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					// 0:未开始 1:评审中 2:评审结束
					if (value == 0) {
						return "未开始"
					} else if (value == 1) {
						return "评审中"
					} else if (value == 2) {
						return "评审结束"
					} else if (value == 3) {
						return "暂停"
					}
				}
			}, {
				field: 'recommendResult',
				title: '组长',
				align: 'center',
				width: '100',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					//0推荐中 1未选出组长 2 选中组长
					if (row.signResult == 0) {
						return "未推选"
					} else {
						if (value == 0) {
							return "推选中"
						} else if (value == 1) {
							return "已推选"
						} else if (value == 2) {
							return "已推选"
						} else {
							return "未推选"
						}
					}
				}
			},
			{
				field: '',
				field: 'status',
				title: '操作',
				align: 'left',
				width: '130px',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				events: {
					'click .btnEnter': function (e, value, row, index) {
						if(!getStateOfEnd(row.bidSectionId, row.examType)){
							top.layer.alert('温馨提示：评审已结束')
							return
						};
						pageCheck = 'Review/dfJudgeCheck/index.html?bidSectionId=' + row.bidSectionId + '&examType=' + row.examType + '&bidSectionCode=' + row.bidSectionCode;  //评标
					
						// 核实个人信息按钮
						var gocheckbutton = '';

						let ifLayerInfo = checkUserType(row);
						if (ifLayerInfo && ifLayerInfo.showButton) {
							gocheckbutton = '<div type="button" class="btn btn-warning btn-sm" id="btnGoCheck" style="margin-right:10px;"> 核实个人信息 </div>'
						}
						

						layer.open({
							type: 2,
							title: '评委评审<div style="float:right;display:inline-block;">' + gocheckbutton +'<span>评委名称：</span><span style="margin-left:10px;margin-right:20px;">' + loginInfo.userName + '<span id="isLeader"></span></span><span>评委身份证：</span><span style="margin-left:10px;">' + loginInfo.idCard + '</span></div>',
							area: ['100%', '100%'],
							resize: false,
							move: false,
							id: 'layerPackage',
							content: pageCheck,
							success: function (layero, index) {
								if(row.signResult == 0){
									honestWarnOpen()
								}
								if (ifLayerInfo.isRemind == 1) {
									if (ifLayerInfo.isExpert == 1) {
										openExpertLayer(1,row)
									} else {
										openExpertLayer(0,row)
									}
								}
							},
							end: function (layero, index) {
								$("#tableList").bootstrapTable("refresh");
								top.layer.closeAll();
							}
						});
						$('body #btnGoCheck').click(function () {
							var idcard = loginInfo.idCard;
							window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard, "_blank");
						})
					},
					'click .evade': function (e, value, row, index) {
						top.layer.confirm("温馨提示:是否确定重新评标?", function (indexs) {
							$.ajax({
								type: "post",
								url: config.Reviewhost + "/ReviewControll/resetAll.do",
								data: {
									packageId: row.bidSectionId,
									examType: row.examType,
								},
								async: true,
								success: function (data) {
									if (data.success) {
										$("#tableList").bootstrapTable("refresh");
										top.layer.close(indexs);
									} else {
										top.layer.alert('温馨提示：' + data.message);
									}
								}
							});
						});
					},
					'click .btnPause': function (e, value, row, index) {
						top.layer.confirm("温馨提示:确定暂停评审?", function (indexs) {
							top.layer.close(indexs);
							top.layer.prompt({ title: '请输入暂停原因', formType: 2 }, function (text, ind) {
								top.layer.close(index);
								$.ajax({
									type: "post",
									url: orderUrl,
									data: {
										'bidSectionId': row.bidSectionId,
										'examType': row.examType,
										'instruct': 'stop',
										'reason': text
									},
									async: true,
									success: function (data) {
										if (data.success) {
											$("#tableList").bootstrapTable("refresh");
											top.layer.close(ind);
										} else {
											top.layer.alert('温馨提示：' + data.message);
										}
									}
								});

							});

						});
					},
					'click .btnPlay': function (e, value, row, index) {
						top.layer.confirm("温馨提示:确定恢复评审?", function (indexs) {
							$.ajax({
								type: "post",
								url: orderUrl,
								data: {
									'bidSectionId': row.bidSectionId,
									'examType': row.examType,
									'instruct': 'recovery'
								},
								async: true,
								success: function (data) {
									if (data.success) {
										$("#tableList").bootstrapTable("refresh");
										top.layer.close(indexs);
									} else {
										top.layer.alert('温馨提示：' + data.message);
									}
								}
							});
						});
					},
					'click .btnView': function (e, value, row, index) {
						layer.open({
							type: 2,
							title: '信息',
							area: ['1000px', '600px'],
							resize: false,
							content: reasonHtml + '?id=' + row.bidSectionId + '&examType=' + row.examType + '&special=PW',
							success: function (layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								//									 iframeWin.passMessage(row)
							},
						});
					},
				},
				formatter: function (value, row, index) {
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEnter" data-index="' + index + '">进入</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '">进入</button>';
					var evade = '<button  type="button" class="btn btn-primary btn-sm evade" data-index="' + index + '">重新评标</button>';
					//						var strPause = '<button  type="button" class="btn btn-primary btn-sm btnPause" data-index="'+index+'">暂停</button>';		
					//						var strPlay = '<button  type="button" class="btn btn-primary btn-sm btnPlay" data-index="'+index+'">恢复</button>';	

					if (row.isPublicProject == 1) {
						if (row.checkState == 1) {
							var str = strEdit;
							if (row.recommendResult == 2) {
								str += evade
							}
							/*if(row.isLeader && row.isLeader == 1){
								str += strPause
							}*/
							return str;
						} else if (row.checkState == 3) {
							return strView
							/*if(row.isLeader && row.isLeader == 1){
								return  strPlay + strView
							}else{
								return strView
							}*/
						} else if (row.checkState == 2) {
							return ''
						} else {
							
							return strEdit
						}
					} else {
						if(row.checkState != 2){
							return strEdit
						}
					}


					/*if(row.checkState==2&&row.isPublicProject==1&&row.recommendResult==2){
						return  strEdit+evade
					}else{
						return  strEdit
					}*/

				}
			}
			]
		]
	});
};

function checkUserType(rowData) {
	var url = config.JudgesHost + '/SysExpertController/isRemindByIdCardAndSectionCode';
	var resData;
	$.ajax({
		type: "post",
		url: url,
		async: false,
		data: {
			idCard: loginInfo.idCard,
			bidSectionId: rowData.bidSectionId
		},
		success: function (res) {
			if (res.success) {
				resData = res.data;
			}
		},
		error: function () {
		}
	})
	return resData;
}

function openExpertLayer(type, rowData) {
	if (type == 1) {
		var content = '<div style="">' +
			'<div style="color:red;text-indent:2em;">' + userName + '专家您好，请确认您的专家信息是否正确。</div>' +
			'</div>';

		top.layer.confirm(
			content,
			{
				title: '温馨提示',
				offset: 'lb', //具体配置参考：offset参数项
				btn: ['去核实个人信息', '稍后再说'],
				area: ['300px', '200px'],
				btnAlign: 'c', //按钮居中
				shade: 0, //不显示遮罩
			},
			function (index) {
				var idcard = loginInfo.idCard;
				window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard, "_blank");
				top.layer.close(index);
			},
			function (index) {
				top.layer.close(index);
			}
		);

		// top.layer.open({
		// 	type: 1,
		// 	offset: 'lb', //具体配置参考：offset参数项
		// 	content: content,
		// 	btn: ['去核实个人信息', '稍后再说'],
		// 	area: ['300px', '200px'],
		// 	btnAlign: 'c', //按钮居中
		// 	shade: 0, //不显示遮罩
		// 	yes: function (index) {
		// 		var idcard = loginInfo.idCard;
		// 		window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard, "_blank");
		// 		top.layer.close(index);
		// 	},
		// 	btn2: function (index) {
		// 		top.layer.close(index);
		// 	}
		// });
	} else {
		var content = '<div style="">' +
			'<div style="color:red;text-indent:2em;">诚恳邀请您注册申请为平台专家，接受邀请后，系统自动发送注册链接短信到您手机上。</div>' +
			'</div>';
		// if (!loginInfo.tel) {
		// 	$.ajax({
		// 		type: "post",
		// 		url: config.bidhost +'/TenderProjectController/getOwnerExpertPhone.do',
		// 		async: false,
		// 		data: {
		// 			bidSectionId: rowData.bidSectionId,
		// 			idCard: loginInfo.idCard,
		// 		},
		// 		success: function (res) {
		// 			if (res.success) {
		// 				if (res.data) {
		// 					loginInfo.tel = res.data;
		// 				}
		// 			} else {
		// 				top.layer.alert(res.message);
		// 			}
		// 		},
		// 		error: function () {
		// 			top.layer.alert('连接错误');
		// 		}
		// 	})
		// }

		top.layer.confirm(
			content,
			{
				title: '温馨提示',
				offset: 'lb', //具体配置参考：offset参数项
				btn: ['接受邀请', '以后再说'],
				area: ['300px', '200px'],
				btnAlign: 'c', //按钮居中
				shade: 0, //不显示遮罩
			},
			function (index) {
				var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
				$.ajax({
					type: "post",
					url: url,
					async: false,
					data: {
						bidSectionId: rowData.bidSectionId,
						idCard: loginInfo.idCard,
						remindType: 1,
						phone: loginInfo.tel
					},
					success: function (res) {
						if (res.success) {
							top.layer.alert('已发送邀请短信至您的手机，请按短信说明完成注册。');
							top.layer.close(index);
						} else {
							top.layer.alert(res.message);
						}
					},
					error: function () {
						top.layer.alert('连接错误');

					},
				})
			},
			function (index) {
				var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
				$.ajax({
					type: "post",
					url: url,
					async: false,
					data: {
						bidSectionId: rowData.bidSectionId,
						idCard: loginInfo.idCard,
						remindType: 0,
						phone: loginInfo.tel
					},
					success: function (res) {
						if (res.success) {
							top.layer.alert('操作成功.');
							top.layer.close(index);
						} else {
							top.layer.alert(res.message);
						}
					},
					error: function () {
						top.layer.alert('连接错误');
					},
				})
			}
		);

		// top.layer.open({
		// 	type: 1,
		// 	offset: 'lb', //具体配置参考：offset参数项
		// 	content: content,
		// 	btn: ['接受邀请', '以后再说'],
		// 	area: ['300px', '200px'],
		// 	btnAlign: 'c', //按钮居中
		// 	shade: 0, //不显示遮罩
		// 	yes: function (index) {
		// 		var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
		// 		$.ajax({
		// 			type: "post",
		// 			url: url,
		// 			async: false,
		// 			data: {
		// 				bidSectionId: rowData.bidSectionId,
		// 				idCard: loginInfo.idCard,
		// 				remindType: 1,
		// 				phone: loginInfo.tel
		// 			},
		// 			success: function (res) {
		// 				if (res.success) {
		// 					top.layer.alert('已发送邀请短信至您的手机，请按短信说明完成注册。');
		// 					top.layer.close(index);
		// 				} else {
		// 					top.layer.alert(res.message);
		// 				}
		// 			},
		// 			error: function () {
		// 				top.layer.alert('连接错误');

		// 			},
		// 		})
		// 	},
		// 	btn2: function (index) {
		// 		var url = config.JudgesHost + '/SysExpertController/saveExpertRemind';
		// 		$.ajax({
		// 			type: "post",
		// 			url: url,
		// 			async: false,
		// 			data: {
		// 				bidSectionId: rowData.bidSectionId,
		// 				idCard: loginInfo.idCard,
		// 				remindType: 0,
		// 				phone: loginInfo.tel
		// 			},
		// 			success: function (res) {
		// 				if (res.success) {
		// 					top.layer.alert('操作成功.');
		// 					top.layer.close(index);
		// 				} else {
		// 					top.layer.alert(res.message);
		// 				}
		// 			},
		// 			error: function () {
		// 				top.layer.alert('连接错误');
		// 			},
		// 		})
		// 	}
		// });
	}
}



/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}
function entryInfo() {
	$.ajax({
		type: "post",
		url: entryUrl,
		async: false,
		success: function (data) {
			if (data.success) {
				loginInfo.idCard = data.data.identityCardNum
				loginInfo.userName = data.data.userName
				loginInfo.tel = data.data.tel
				//	  			console.log(data.data)
			}
		},
		error: function () {

		},
	})
}
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather() {
	$('#tableList').bootstrapTable('refresh');
}
function getStateOfEnd(bidSectionId,examType){
	var isOpen = false;
	$.ajax({
		type: "post",
		url: verifyIsEndUrl,
		data: {
			'bidSectionId': bidSectionId,
			'examType': examType,
		},
		async: false,
		success: function (data) {
			if (data.success) {
				isOpen = data.data;
			} else {
				top.layer.alert('温馨提示：' + data.message);
			}
		}
	});
	return isOpen
}

// 添加专家廉洁提示
function honestWarnOpen(){
    top.layer.open({
        type: 2,
        title: '廉洁提醒',
        area: ['60%', '90%'],
        resize: false,
        move: false,
        closeBtn:0,
        content: 'honestWarn.html',
        success: function (layero, index) {
			layero.find('.layui-layer-setwin').hide();
            var iframeWin = layero.find('iframe')[0].contentWindow;
		    iframeWin.passMessage(function(){
		    	
		    });
        },
        end: function (layero, index) {
            
        }
    });
}