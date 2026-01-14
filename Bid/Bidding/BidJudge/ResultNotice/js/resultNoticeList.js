/**
*  zhouyan 
*  2019-4-15
*  评审结果公示
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/ResultNoticeController/findResultNoticePageList.do';  //列表接口
var backUrl = config.tenderHost + "/ResultNoticeController/revocation.do";	//撤回  
var delUrl = config.tenderHost + "/ResultNoticeController/delete.do";	//删除
var verifyUrl = config.bidhost + "/BusinessStatisticsController/findaudtionInfo.do";	//验证业务报表是否发送
var sendUrl = config.tenderHost + "/ResultNoticeController/publish.do";//发送

var editHtml = 'Bidding/BidJudge/ResultNotice/model/noticeEdit.html';//编辑
var viewHtml = 'Bidding/BidJudge/ResultNotice/model/noticeView.html';//查看
var bidHtml = 'Bidding/BidJudge/ResultNotice/model/bidList.html';//新增时选择标段页面
var pushHtml = 'Bidding/BidJudge/ResultNotice/model/pushInfo.html';//推送
$(function () {
	initDataTab();
	//查询
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		initDataTab()
	});

	$("#btnAdd").click(function () {
		getBId()
	});

	//编辑
	$('#tableList').on('click', '.btnEdit', function () {
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//查看
	$('#tableList').on('click', '.btnView', function () {
		var index = $(this).attr("data-index");
		openView(index);
	});
	//推送
	$('#tableList').on('click', '.btnPush', function () {
		var index = $(this).attr("data-index");
		openPush(index);
	});
	//撤回
	$('#tableList').on('click', '.btnBack', function () {
		var index = $(this).attr("data-index");
		layer.alert('温馨提示：确认要撤回？', { icon: 3, title: '询问' }, function (ask) {
			layer.close(ask);
			recall(index)
		})
	});
	//删除
	$('#tableList').on('click', '.btnDel', function () {
		var index = $(this).attr("data-index");
		layer.alert('温馨提示：确认要删除？', { icon: 3, title: '询问' }, function (ask) {
			layer.close(ask);
			cutOff(index)
		})
	});
	//发送
	$('#tableList').on('click', '.btnSend', function () {
		var index = $(this).attr("data-index");
		layer.confirm('温馨提示：是否确认发送中标结果通知书？', function (ask) {
			layer.close(ask);
			sendNotice(index)
		})
	});
	
});

//选择标段
function getBId() {
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.bidFromFathar(formFather);
		}
	});
}

function formFather(data) {
	openEdit(data)
}


//编辑
function openEdit(data) {
	//验证是否完成业务报表登记
	 $.ajax({
		type:"post",
		url:verifyUrl,
	 	async:true,
		data: {
	 		'tenderProjectID': data.bidSectionId
	 	},
	 	success: function(res){
	 		if(res.success){
	 			//判断是否有值
	 			if(res.data){
					var dataUrl;
					var title;
					if (data.id) {
						title = '编辑中标结果通知';
						dataUrl = editHtml+'?id='+data.id+'&bidId='+data.bidSectionId;
					} else {
						title = '新增中标结果通知';
						dataUrl = editHtml+'?examType='+'&bidId='+data.bidSectionId + "&bidWinNoticeId="+data.bidWinNoticeId;
					}
					layer.open({
						type: 2,
						title: title,
						area: ['100%', '100%'],
						content: dataUrl,
						resize: false,
						success: function (layero, index) {
							var iframeWin = layero.find('iframe')[0].contentWindow;
							//调用子窗口方法，传参
							iframeWin.passMessage(data, refreshFather);
						}
					});
	 			}else{
					parent.layer.alert("温馨提示：业务统计报表未审核通过不能发送通知书！",{ icon: 7, title: '提示' });
				}
	 		}else{
	 			parent.layer.alert('温馨提示：'+data.message);
	 		}
	 	}
	}); 
}
function openView(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看结果通知',
		area: ['100%', '100%'],
		content: viewHtml + '?id=' + rowData.bidSectionId + '&examType=2&isThrough=' + (rowData.submitState == 2 ? 1 : 0),
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData);
		}
	});
}
//推送
function openPush(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '数据推送',
		area: ['100%', '100%'],
		content: pushHtml + '?id=' + rowData.bidSectionId + '&examType=2',
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData);
		}
	});
}

//撤回
function recall(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type: "post",
		url: backUrl,
		async: true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType': 2
		},
		success: function (data) {
			if (data.success) {
				layer.alert('温馨提示：撤回成功!', { icon: 6, title: '提示' }, function (ind) {
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			} else {
				layer.alert('温馨提示：撤回失败!', { icon: 5, title: '提示' });
			}
		}
	});
};
//删除
function cutOff(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type: "post",
		url: delUrl,
		async: true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType': 2
		},
		success: function (data) {
			if (data.success) {
				layer.alert('温馨提示：删除成功!', { icon: 6, title: '提示' }, function (ind) {
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			} else {
				layer.alert('温馨提示：删除失败!', { icon: 5, title: '提示' });
			}
		}
	});
};
//发送
function sendNotice(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type: "post",
		url: sendUrl,
		async: true,
		data: {
			'id': rowData.id
			// 'bidSectionId': rowData.bidSectionId,
			// 'examType': 2
		},
		success: function (data) {
			if (data.success) {
				layer.alert('温馨提示：发送成功!', { icon: 6, title: '提示' }, function (ind) {
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			} else {
				layer.alert('温馨提示：发送失败!', { icon: 5, title: '提示' });
			}
		}
	});
	
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
		tenderProjectCode: $("#tenderProjectCode").val(), // 项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 项目名称
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态	
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
		height:tableHeight,
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
				field: 'interiorBidSectionCode',
				title: '标段编号',
				align: 'left',
				cellStyle: {
					css: widthCode
				}
			},
			{
				field: 'bidSectionName',
				title: '标段名称',
				align: 'left',
				cellStyle: {
					css: widthName
				}
			},
			{
				field: 'tenderProjectType',
				title: '招标项目类型',
				align: 'center',
				cellStyle: {
					css: widthState
				},
				formatter: function (value, row, index) {
					return getTenderType(value);
					//						return tenderTypeData[value.substring(0,1)];
				}
			},
			{
				field: 'tenderMode',
				title: '招标方式',
				align: 'left',
				cellStyle: {
					css: widthState
				},
				formatter: function (value, row, index) {
					return getOptionValue('tenderMode', value)
				}
			},
			{
				field: 'states', //招标文件主表的创建时间
				title: '标段状态',
				align: 'center',
				cellStyle: {
					css: widthState
				},
				formatter: function (value, row, index) {
					if (value == 1) {
						return "生效";
					} else {
						return "<span style='color:red;'>招标异常</span>";
					}
				}
			},
			{
				field: 'submitState',
				title: '审核状态',
				align: 'center',
				cellStyle: {
					css: widthState
				},
				formatter: function (value, row, index) {
					if (value == 0) {
						return '<span>未提交</span>'
					} else if (value == 1) {
						return '<span>待审核</span>'
					} else if (value == 2) {
						return '<span style="color:green">审核通过</span>'
					} else if (value == 3) {
						return '<span style="color:red">审核未通过</span>'
					} else if (value == 4) {
						return "<span style='color:blue;'>已撤回</span>";
					} else {
						return "未编辑";
					}
				}
			},{
					field: 'publishState',
					title: '发送状态',
					align: 'center',
					width: '150',
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span style="color:red">未发送</span>'
						}else if(value == 1){
							return  '<span style="color:green">已发送</span>'
						}
					}
				},
			/*{
				field: 'noticeStartTime',
				title: '发布时间',
				align: 'center',
				width: '200',
			},*/
			{
				field: '',
				title: '操作',
				align: 'left',
				width: '230px',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="' + index + '"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
					var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
					//var strPush = '<button  type="button" class="btn btn-primary btn-sm btnPush" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>推送</button><button class="puclic btn-primary btn-xs" data-type="edit"><span class="glyphicon glyphicon-eye-open">公示推送</button>';
					var strPush = '<button  type="button" class="btn btn-primary btn-sm btnPush" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>推送</button>';
					var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="' + index + '"><span class="glyphicon glyphicon-send"></span></span>发送</button>';
					if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
						if (row.states != 1) {
							if (row.submitState || row.submitState == 0) {
								return strView;
							} else {
								return "";
							}
						}
						if (row.submitState || row.submitState == 0) {
							if (row.submitState == '0') {
								return strEdit + strView + strDel;
							} else if (row.submitState == '1') {
								return strView + strBack;
							} else if (row.submitState == '2') {
								if (row.oldProjectId && row.oldProjectId != '' && row.oldProjectId != null && row.oldProjectId != undefined) {
									if(row.publishState == 0){
										return strView + strPush + strSend
									}else{
										return strView + strPush
									}
									// return strView + strPush
								} else {
									if(row.publishState == 0){
										return strView + strSend
									}else{
										return strView
									}
									
								}
							} else if (row.submitState == '3') {
								return strEdit + strView + strDel;
							} else if (row.submitState == '4') {
								return strEdit + strView;
							}
						} else {
							return strEdit;
						}
					}else{
						if (row.submitState || row.submitState == 0) {
							return strView;
						} else {
							return "";
						}
					}
					
				}



			}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather() {
	$('#tableList').bootstrapTable('refresh');
}