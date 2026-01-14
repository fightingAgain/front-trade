/**
 *  zhouyan 
 *  2019-2-25
 *  公告列表
 *  方法列表及功能描述
 */
var bidHtml = "Bidding/BidNotice/Notice/model/bidSelect.html"; //标段列表

var changeUrl = "Bidding/Pretrial/Notice/model/noticeChange.html"; // 变更
var editUrl = "Bidding/Pretrial/Notice/model/noticeEdit.html"; // 新增
var viewUrl = "Bidding/Pretrial/Notice/model/noticeView.html"; // 查看
var delUrl = config.tenderHost + "/NoticeController/delete.do"; //删除
var backUrl = config.tenderHost + "/NoticeController/revokeWorkflowItem.do"; //撤回
var pageUrl = config.tenderHost + "/NoticeController/pageReleaseList.do"; //分页
var bidUrl = config.tenderHost + "/NoticeController/findAllById.do"; //标段详情地址
var copyUrl = config.tenderHost + "/NoticeController/copy.do"; //变更地址

var sendUrl = config.tenderHost + '/NoticeController/publishNotice.do'; //发布地址
var nowDate = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g, "/")));
//入口函数 
$(function() {
	//	var  noticeSendTime = Date.parse(new Date($('#noticeSendTime').val().replace(/\-/g,"/")));		//公告发布时间
	//加载列表
	initJudgeTable();

	$('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 0, //0是不新增，1是新增
		QueryName: 'btnSearch',
		queryList: [{
				name: '标段编号',
				value: 'interiorBidSectionCode',
				type: 'input',
			},
			{
				name: '标段名称',
				value: 'bidSectionName',
				type: 'input',
			},
			{
				name: '状态',
				value: 'noticeState',
				type: 'select',
				option: [{
					name: '全部',
					value: '',
				}, {
					name: '审核中',
					value: '1',
				}, {
					name: '审核通过',
					value: '2',
				}, {
					name: '审核未通过',
					value: '3',
				}, {
					name: '已撤回',
					value: '4',
				}, {
					name: '变更中',
					value: '5',
				}, ]
			}
		]
	});

	//新增
	$('#btnAdd').click(function() {
		openBidTable()
	});
	//编辑
	$("#noticeList").on("click", ".btnEdit", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#noticeList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//变更
	$("#noticeList").on("click", ".btnChange", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#noticeList').bootstrapTable('getData')[index];
		if(rowData.openingState == 1) { //是否开标状态   是否已经开标     当前时间大于开标开始时间为1  小于开标开始时间为0
			layer.alert('该公告文件开启时间已过，不能变更！', {
				icon: 7,
				title: '提示'
			})
		} else {
			layer.confirm('确定变更?', {
				icon: 3,
				title: '询问'
			}, function(ind) {
				layer.close(ind);
				$.ajax({
					type: "post",
					url: copyUrl,
					async: false,
					dataType: "json", //预期服务器返回的数据类型
					data: {
						noticeId: rowData.noticeId
					},
					beforeSend: function(xhr) {
						var token = $.getToken();
						xhr.setRequestHeader("Token", token);
					},
					success: function(data) {
						if(data.success) {
							//	            		id=data.data;

							rowData.id = data.data;
							rowData.noticeNature = 2;
							parent.$('#noticeList').bootstrapTable('refresh');
							openEdit(rowData);

						} else {
							layer.alert(data.message, {
								title: '提示'
							})
						}
					},
					error: function() {
						parent.layer.alert("提交失败！");
					}

				});

			});
		}
	});
	//查看
	$("#noticeList").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openView(index);
	});
	//删除
	$("#noticeList").on("click", ".btnDel", function() {
		var rowData = $('#noticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		layer.confirm('确定删除?', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			layer.close(ind);
			requst(delUrl, rowData[index].id, 1);
		});
	});
	//取消变更
	$("#noticeList").on("click", ".btnCancel", function() {
		var rowData = $('#noticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		layer.confirm('确定取消变更?', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			layer.close(ind);
			requst(delUrl, rowData[index].id, 2);
		});
	});
	//撤回
	$("#noticeList").on("click", ".btnBack", function() {
		var rowData = $('#noticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		/*if(rowData[index].publishState == 1){
			layer.alert('公告已发布，不能撤回！',{icon:7,title:'提示'})
		}else{*/
		layer.confirm('确定撤回?', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			layer.close(ind);
			requst(backUrl, rowData[index].id, 3)
		});
		//		}
	});
	/*查询*/
	$('#btnSearch').click(function() {
		$("#noticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	// 状态查询
	$("#noticeState").change(function() {
		$("#noticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*公告性质查询*/
	$('[name=noticeNature]').change(function() {
		$("#noticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*公告类型查询*/
	$('[name=bulletinType]').change(function() {
		$("#noticeList").bootstrapTable('destroy');
		initJudgeTable();
	});
	//发布
	$('#noticeList').on('click', '.btnSend', function() {
		var rowData = $('#noticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		sendNotice(rowData[index].id)
	})
});
//发布
function sendNotice(bid, state) {
	var sendData = {};
	sendData.id = bid;
	if(state) {
		sendData.confirm = state;
	}
	$.ajax({
		type: "post",
		url: sendUrl,
		async: true,
		data: sendData,
		success: function(data) {
			if(data.success) {
				if(data.data == '1') {
					layer.confirm('公告开始时间小于当前时间，若要继续发布，请点确定?', {
						icon: 3,
						title: '询问'
					}, function(ind) {
						sendNotice(bid, 1)
						layer.close(ind);
					});
				} else if(data.data == '2') {
					$('#noticeList').bootstrapTable('refresh');
					layer.alert('发布成功!')
				} else if(data.data == '3') {
					layer.confirm('公告结束时间小于当前时间，若要继续发布，请点确定?', {
						icon: 3,
						title: '询问'
					}, function(ind) {
						sendNotice(bid, 1)
						layer.close(ind);
					});
				}
			} else {
				layer.alert(data.message)
			}
		}

	});
}
//打开标段列表
function openBidTable() {
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.getFromBid(newlyAdd);
		}
	});
};

function newlyAdd(data) {
	openEdit(data);
}

/*
 * 打开编辑窗口
 * data: 传到新增、编辑页面的数据
 * isChange：是否点击变更按钮
 */
function openEdit(data) {
	//	console.log(data)
	var url = '';
	var title = '';
	var changeCount = 0;
	var change = 0; //0: 不是变更按钮，1：变更按钮
	if(!data.changeCount) {
		changeCount = 0
	} else {
		changeCount = data.changeCount;
	}
	if(data.noticeId) {
		if(data.noticeNature == 2) {
			url = changeUrl + '?id=' + data.bidSectionId + "&noticeId=" + data.noticeId;
			title = "变更公告";
		} else {
			url = editUrl + '?id=' + data.bidSectionId + "&noticeId=" + data.noticeId;
			title = "修改公告";
		}
	} else {
		url = editUrl + '?id=' + data.bidSectionId + '&isPublicProject=' + data.isPublicProject;
		title = "添加公告"
	}
	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		content: url,
		resize: false,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(data, refreshFather);
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {

	var rowData = $('#noticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	/***********  区别页面来源   ***********/
	rowData[index]['getForm'] = 'ZC';
	layer.open({
		type: 2,
		title: "查看公告",
		area: ['100%', '100%'],
		content: viewUrl + "?id=" + rowData[index].bidSectionId + '&htmlTypes=view'+ '&isThrough='+0,
		//		content: viewUrl + "?id=" + rowData[index].id+"&noticeId=" + rowData[index].noticeId+'&bidSectionId='+rowData[index].bidSectionId + "&isThrough=" + (rowData[index].noticeState == 2 ? 1 : 0)+"&source=0",
		resize: false,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData[index], refreshFather);
		}
	});
}
/**
 * 删除  取消  撤回
 * @param {Object} address
 * @param {Object} info
 * @param {Object} state  1是删除  2是取消  3是撤回
 */
function requst(address, info, state) {
	$.ajax({
		type: "post",
		url: address,
		data: {
			'id': info
		},
		async: true,
		dataType: 'json',
		success: function(data) {
			if(data.success) {
				var msg = "";
				if(state == 1) {
					msg = "删除成功";
				} else if(state == 2) {
					msg = "取消成功";
				} else if(state == 3) {
					msg = "撤回成功";
				}
				layer.alert(msg, {
					title: '提示'
				}, function(index) {
					layer.close(index);
				})
				$('#noticeList').bootstrapTable('refresh');
			} else {

				layer.alert(data.message, {
					title: '提示'
				})
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
		'bulletinType': '2', //资格预审
		'interiorBidSectionCode': $('#interiorBidSectionCode').val(),
		'bidSectionName': $('#bidSectionName').val(),
		'noticeState': $('#noticeState').val(),
	};
	return projectData;
};
//表格初始化
function initJudgeTable() {
	$("#noticeList").bootstrapTable({
		url: pageUrl,
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
		height: top.tableHeight,
		toolbar:"#toolbar",
		onCheck: function(row) {
			id = row.id;
		},
		fixedColumns: true,
		fixedNumber: 2,
		columns: [
			[{
					field: 'xh',
					title: '序号',
					cellStyle: {
						css: widthXh
					},
					align: 'center',
					formatter: function(value, row, index) {
						var pageSize = $('#noticeList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#noticeList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				}, {
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {
						if(row.tenderMode == '1') {
							return "公开招标";
						} else if(row.tenderMode == '2') {
							return "邀请招标";
						}
					}
				},
				{
					field: 'noticeNature',
					title: '公告性质',
					align: 'center',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {
						if(value == '1') {
							return "正常公告";
						} else if(value == '2') {
							return "更正公告";
						} else if(value == '3') {
							return "重发公告";
						} else if(value == '9') {
							return "其它";
						}
					}
				},
				/*{
					field: 'changeCount',
					title: '公告次数',
					align: 'center',
					width: '100',
					formatter: function (value, row, index) {
						var str;
						if(row.changeCount != undefined){
							str = value+1;
						}else{
							
							str = 0;
						}
						return str
					}
				},*/
				{
					field: 'subDate',
					title: '提交时间',
					align: 'center',
					cellStyle: {
						css: widthDate
					},
				},
				{
					field: 'states', //招标文件主表的创建时间
					title: '标段状态',
					align: 'center',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {
						if(value == 1) {
							return "生效";
						} else {
							return "<span style='color:red;'>招标异常</span>";
						}
					}
				},
				{
					field: 'noticeState',
					title: '审核状态',
					align: 'center',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {
						if(value == '-1') {
							return "未编辑";
						} else if(value == '0') {
							return "<span style='color:red;'>未提交</span>";
						} else if(value == '1') {
							return "审核中";
						} else if(value == '2') {
							return "<span style='color:green;'>审核通过</span>";
						} else if(value == '3') {
							return "<span style='color:red;'>审核未通过</span>";
						} else if(value == '4') {
							return "<span style='color:blue;'>已撤回</span>";
						} else if(value == '5') {
							return "<span style='color:orange;'>变更中</span>";
						}
					}
				},
				{
					field: 'publishState',
					title: '发布状态',
					align: 'center',
					formatter: function(value, row, index) {
						if(value == 0) {
							return "<span style='color:red;'>未发布</span>";
						} else if(value == 1) {
							return "<span style='color:green;'>已发布</span>";
						} else {
							return ''
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strJudge = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>取消</button>';
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="' + index + '"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						var strChange = '<button  type="button" class="btn btn-primary btn-sm btnChange" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>变更</button>';
						var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="' + index + '"><span class="glyphicon glyphicon-send"></span>发布</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否	
							if(row.states != 1) {
								if(row.noticeState || row.noticeState === 0) {
									return strSee;
								} else {
									return "";
								}
							}
							if(row.noticeState == -1) {
								return strJudge;
							} else if(row.noticeState == 0) {
								return strSee + strJudge + strDel;
							} else if(row.noticeState == 1) {
								return strSee + strBack;
							} else if(row.noticeState == 2) {
								if(row.publishState == 1) { //已发布
									if((nowDate > Date.parse(new Date(row.noticeSendTime.replace(/\-/g, "/"))))) { //发布时间已到
										return strSee + strChange;
									} else { //发布时间未到
										return strSee + strBack
									}
								} else { //未发布
									return strSee + strBack + strSend;
								}
							} else if(row.noticeState == 3) {
								return strSee + strJudge + strDel;
							} else if(row.noticeState == 4) {
								return strSee + strJudge + strDel;
							} else if(row.noticeState == 5) {
								return strSee + strJudge + strCancel;
							}
						}else{
							if(row.noticeState != -1){
								return strSee;
							}else{
								return '';
							}
							
						}
					}
				}
			]
		]
	});
};

/*
 * 
 * 刷新页面
 */
function refreshFather() {
	$('#noticeList').bootstrapTable('refresh');
}