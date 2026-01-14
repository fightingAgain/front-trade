/*
 * @Author: your name
 * @Date: 2020-09-12 11:10:52
 * @LastEditTime: 2020-10-08 17:05:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\Expert\js\expertList.js
 */
//var nowDate = new Date();
var systemTime;
var changType = true; //判断进入状态
$(function () {
	//获取当前时间
	// $.ajax({
	// 	type: "post",
	// 	url: config.AuctionHost + '/PriceSetHistoryController/findBusinessPriceCheckState',
	// 	async: false,
	// 	dataType: "json", //预期服务器返回的数据类型
	// 	data: {
	// 		//	            'bidSectionId':bidId
	// 	},
	// 	success: function (data) {
	// 		if (data.success) {
	// 			dataflag = data.data
	// 		}
	// 	},
	// 	error: function () {
	// 		parent.layer.alert("温馨提示：" + message);
	// 	}
	// });
})

$('#projectlist').bootstrapTable({
	method: 'get', // 向服务器请求方式
	url: config.AuctionHost + '/WaitCheckProjectController/findPageList.do',
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
	height: top.tableHeight,
	toolbar: '#toolbar',
	queryParams: function (params) {
		var paramData = {
			pageNumber: params.offset / params.limit + 1, //当前页数
			pageSize: params.limit, // 每页显示数量
			offset: params.offset, // SQL语句偏移量	
			'projectName': $("#projectName").val(),
			'packageName': $("#packageName").val(),
		}

		return paramData;
	},
	columns: [
		[{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function (value, row, index) {
				var pageSize = $('#projectlist').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#projectlist').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '采购项目编号',
			width: '160'
		},
		{
			field: 'projectName',
			title: '采购项目名称',
			formatter: function (value, row, index) {
				if (row.projectSource == 1) {

					var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span></div>';

				} else {
					var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '</div>';
				}
				return projectName;
			}
		}, {
			field: 'packageNum',
			title: '包件编号',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			formatter: function (value, row, index) {
				if (row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'checkPlan',
			title: '评审方法',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				if (row.examType == 0) {
					/*if(row.checkEndDate){
											if(row.checkPlan == 0) return "综合评分法";
						if(row.checkPlan == 1) return "最低评标价法";
					}else{	*/
					if (row.examCheckPlan == 0) return "合格制";
					if (row.examCheckPlan == 1) return "有限数量制";

					//}
				} else {
					if (row.checkPlan == 0) return "综合评分法";
					if (row.checkPlan == 1) return "最低评标价法";
					if (row.checkPlan == 2) return "经评审的最低价法(价格评分)";
					if (row.checkPlan == 3) return "最低投标价法";
					if (row.checkPlan == 5) return "经评审的最低投标价法";
					if (row.checkPlan == 4) return "经评审的最高投标价法";
				}
			}
		}, {
			field: 'expertCheckState',
			title: '评审状态',
			align: 'center',
			width: '80',
			formatter: function (value, row, index) {
				if (row.isStopCheck == 1) {
					return '<span class="text-danger">项目失败</span>'
				} else {
					if (row.stopCheckReason != "" && row.stopCheckReason != undefined) {
						return '<span class="text-danger">项目失败</span>'
					} else {
						return "<span style='color:" + (value == "完成打分" ? "green" : "red") + "'>" + value + "</span>";
					}
				}

			}
		}, {
			field: 'tenderType',
			title: '采购方式',
			width: '110',
			align: 'center',
			formatter: function (value, row, index) {
				if (value == 0) {
					return '询比采购'
				} else if (value == 6) {
					return '单一来源采购'
				} else if (value == 5) {
					return '竞争性谈判'
				}

			}

		},
		{
			field: 'examCheckEndDate',
			title: '询比预审时间',
			width: '160',
			align: 'center',
		},
		{
			field: 'checkEndDate',
			title: '询比评审时间',
			width: '160',
			align: 'center',
		},
		{
			title: '操作',
			align: 'center',
			width: '80',
			events: {
				'click .btn-enter': function (e, value, row, index) {
					fandChangCheckState(row.packageId);
					if (changType) {
						return false;
					}
					var pare = {
						projectId: row.id,
						packageId: row.packageId,
						expertId:row.expertId
					}
					if (row.purExamType == 0) {
						if (row.examType == 0) {
							pare.examType = 0;
							pare.checkType = 1;
						} else {
							pare.examType = 1;
						}
					} else {
						pare.examType = 1
					}
					$.ajax({
						type: "post",
						url: config.AuctionHost + "/ExpertCheckController/verifyPackageForExpert.do",
						data: pare,
						async: false,
						success: function (data) {
							if (data.success) {
								//打开评审
								msg = "";
								checkPackageList(row.projectId, row.packageId, pare.examType);
								if (msg == 1) {
									// 核实个人信息按钮 代理项目、招标库评委、询比和单一来源的项目
									var gocheckbutton = ''; 
									if(row.isAgent == 1 && row.isBiddingJudge == 1 && (row.tenderType == 0 || row.tenderType == 6)){
										var ifLayerInfo = checkUserType(row);
										if (ifLayerInfo && ifLayerInfo.showButton) {
											gocheckbutton = '<div type="button" class="btn btn-warning btn-sm" id="btnGoCheck" style="margin-right:10px;"> 核实个人信息 </div>'
										}
									}

									var index = top.layer.open({
										type: 2,
										title: '评审项目管理<div style="float:right;display:inline-block;">'+gocheckbutton+'<span>评委名称：</span><span style="margin-left:10px;margin-right:20px;">' + top.userName + '<span id="isLeader"></span></span></div>',
										// title: "评审项目管理",
										area: ['100%', '100%'],
										resize: false,
										move: false,
										id: 'packageclass',
										content: "bidPrice/Review/Expert/modal/index.html?projectId=" + row.id + "&packageId=" + row.packageId + "&expertId=" + row.expertId + '&tenderType=' + row.tenderType + '&examType=' + pare.examType+'&isAgent='+row.isAgent,
										success:function(){
											// 代理项目 未推选组长 询比和单一来源的项目的廉洁提醒
											if(row.isAgent == 1 && row.leaderCount != 1 && (row.tenderType == 0 || row.tenderType == 6)){
												honestWarnOpen()
											}
											// 提醒核实个人信息 代理项目、招标库评委、询比和单一来源的项目 isBiddingJudge:1招标库评委 2业主评委
											if (row.isAgent == 1 && row.isBiddingJudge == 1 && (row.tenderType == 0 || row.tenderType == 6)) {
												if (ifLayerInfo && ifLayerInfo.isRemind == 1) {
													openExpertLayer(1,row)
												}
											}
										},
										end: function (layero, index) {
											$('#projectlist').bootstrapTable(('refresh'));
											top.layer.closeAll();
										}
									});
									$('body #btnGoCheck').click(function () {
										var idcard = row.identityCardNum;
										window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard, "_blank");
									})
								}
							} else {
								top.layer.alert(data.message);
								//msgConfirm(data.message);
								return;
							}
						}
					});

				}
			},
			formatter: function (value, row, index) {

				return '<button class="btn btn-primary btn-xs btn-enter"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>进入</button>';
			}
		}
		]
	]
})

var msg

function checkPackageList(projectId, packageId, exam) {

	$.ajax({
		type: "post",
		url: config.AuctionHost + "/CheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: exam,
			enterpriseType: 2
		},
		async: false,
		success: function (data) {
			if (data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg = 2;
			}
		}
	});

}
$('ul.search-type li').off("click").click(function () {
	$(this).siblings('.active').removeClass('active').end().addClass('active');
	$('a.search-type').html($(this).text()).attr('name', $(this).find('a')[0].name);
})

$('.search-btn').off("click").click(function () {
	$('#projectlist').bootstrapTable('refresh');
})

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + (date.getMonth() + 1);
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + date.getDate();
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}

function GetTime(time) {
	var date = new Date(time.replace("-", "/").replace("-", "/")).getTime();
	return date;
};

function msgConfirm(notice) {
	top.layer.confirm(notice, {
		btn: ['确定'] //可以无限个按钮
	}, function (index, layero) {
		top.layer.close(index);
		top.$('#projectlist').bootstrapTable('refresh');
	});
}


function fandChangCheckState(packageId) {
	$.ajax({
		type: "post",
		url: config.AuctionHost + '/PriceSetHistoryController/findBusinessPriceCheckState',
		async: false,
		dataType: "json", //预期服务器返回的数据类型
		data: {
			'packageId': packageId
		},
		success: function (data) {
			if (!data.success) {
				parent.layer.alert("温馨提示：" + data.message);
			} else {
				changType = false;
			}
		},
		error: function () {
			parent.layer.alert("温馨提示：" + data.message);
		}
	});
}

function checkUserType(rowData) {
	var url = config.JudgesHost + '/SysExpertController/isRemindByIdCardAndSectionCode';
	var resData;
	$.ajax({
		type: "post",
		url: url,
		async: false,
		data: {
			idCard: rowData.identityCardNum,
			bidSectionId: rowData.packageId
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
				var idcard = rowData.identityCardNum;
				window.open(siteInfo.expertIndexUrl + '?idcard=' + idcard, "_blank");
				top.layer.close(index);
			},
			function (index) {
				top.layer.close(index);
			}
		);
	}
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