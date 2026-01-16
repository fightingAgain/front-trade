/**

*  异议管理列表（投标人）
*  方法列表及功能描述
*/
var listUrl = config.AuctionHost + '/ObjectionAnswersController/findPageList.do';  //列表接口
var recallUrl = config.AuctionHost + '/ObjectionAnswersController/revocation.do';  //撤回接口
var delUrl = config.AuctionHost + "/BidSuccessFulPublicityController/deleteByPrimaryKey.do";	//删除

var editHtml = 'bidPrice/ObjectionManage/Manager/model/objectionEdit.html';//编辑
var viewHtml = 'bidPrice/ObjectionManage/Manager/model/objectionView.html';//查看
var backHtml = 'bidPrice/ObjectionManage/Manager/model/objectionBack.html';//撤回确认页面
var dealResultHtml = 'bidPrice/ObjectionManage/Manager/model/objectionResult.html';//异议处理结果
var pageUrlParams = getUrlParamObject(PAGEURL);

// pageUrlParams 配置菜单参数
$(function () {
	initDataTab();
	//查询
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//添加
	$('#btnAdd').click(function () {
		openEdit();
	});
	//撤回确认
	$('#tableList').on('click', '.btnSure', function () {
		var index = $(this).attr("data-index");
		openBack(index);
	});
	//签收
	$('#tableList').on('click', '.btnSign', function () {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//受理
	$('#tableList').on('click', '.btnAccept', function () {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//答复
	$('#tableList').on('click', '.btnReply', function () {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$('#tableList').on('click', '.btnView', function () {
		var index = $(this).attr("data-index");
		openView(index);
	});
	//异议处理结果
	$('#tableList').on('click', '.btnDealResult', function () {
		var dataIndex = $(this).attr("data-index");
		parent.layer.confirm('温馨提示：异议处理完毕后，对本异议不能再新增回复。', {
			btn: ['确定', '取消'] //可以无限个按钮
		}, function(index, layero){
			openDeal(dataIndex);
			parent.layer.close(index);			 
		}, function(index){
			 parent.layer.close(index)
		});
	});
	doPackageView(pageUrlParams.tenderType);
});
function openBack(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '撤回确认',
		area: ['1000px', '400px'],
		content: backHtml + '?dataId=' + rowData.id + '&' + parseUrlParam(pageUrlParams),
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
}
//编辑
function openEdit(index, state) {
	var jumpUrl;
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	jumpUrl = editHtml + '?dataId=' + rowData.id + '&state=' + rowData.status + '&bidId=' + rowData.packageId + '&' + parseUrlParam(pageUrlParams)+"&isShowResult="+rowData.isShowResult;
	layer.open({
		type: 2,
		title: '异议受理',
		area: ['80%', '80%'],
		content: jumpUrl,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
};
//查看
function openView(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看异议',
		area: ['80%', '80%'],
		content: viewHtml + '?dataId=' + rowData.id + '&state=' + rowData.status + '&packageId=' + rowData.packageId + '&' + parseUrlParam(pageUrlParams)+"&isShowResult="+rowData.isShowResult,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
};
//异议处理结果
function openDeal(index) {
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '异议处理结果',
		area: ['360px', '240px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: dealResultHtml + '?dataId=' + rowData.id + '&state=' + rowData.status + '&packageId=' + rowData.packageId + '&' + parseUrlParam(pageUrlParams),
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		packageNum: $("#packageNum").val(), // 包件编号
		packageName: $("#packageName").val(), // 包件名称	
	};
	return Object.assign(projectData, pageUrlParams);
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
		responseHandler: function(res) {
			return res.data;
		},
		striped: true,
		height: top.tableHeight,
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
				field: 'packageNum',
				title: isProjectMode(pageUrlParams.tenderType) ? '项目编号' : '包件编号',
				align: 'left',
				cellStyle: {
					css: widthCode
				},
			},
			{
				field: 'packageName',
				title: isProjectMode(pageUrlParams.tenderType) ? '项目名称' : '包件名称',
				align: 'left',
				cellStyle: {
					css: widthName
				},
			}, {
				field: 'objectionTitle',
				title: '异议标题',
				align: 'left',
				cellStyle: {
					css: widthName
				},
			},
			{
				field: 'objectionType',
				title: '异议类型',
				align: 'center',
				width: '150',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					var str = '';
					if (value == 8) {
						str = '结果公示'
					} else if (value == 9) {
						str = '项目异常公示';
					}
					return str
				}
			}, {
				field: 'submitTime',
				title: '提出时间',
				align: 'left',
				cellStyle: {
					css: widthDate
				}
			},
			{
				field: 'status',
				title: '异议状态',
				align: 'center',
				width: '150',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					if (value == 0) {
						return '<span>未提交</span>'
					} else if (value == 1) {
						return '<span>未签收</span>'
					} else if (value == 2) {
						return '<span style="color:green">已签收</span>'
					} else if (value == 3) {
						return '<span>未受理</span>'
					} else if (value == 4) {
						return '<span style="color:green">已受理</span>'
					} else if (value == 5) {
						return '<span style="color:red">不予受理</span>'
					} else if (value == 6) {
						return '<span>未答复</span>'
					} else if (value == 7) {
						return '<span style="color:green">已答复</span>'
					} else if (value == 8) {
						return '<span style="color:orange">申请撤回</span>'
					} else if (value == 9) {
						return '<span style="color:green">已撤回</span>'
					}
				}
			}, {
				field: 'answersDate',
				title: '答复时间',
				align: 'left',
				cellStyle: {
					css: widthDate
				}
			}, {
				field: '',
				title: '操作',
				align: 'left',
				width: '230px',
				cellStyle: {
					css: { 'white-space': 'nowrap' }
				},
				formatter: function (value, row, index) {
					var strSign = '<button  type="button" class="btn btn-primary btn-sm btnSign" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>签收</button>';
					var strSure = '<button  type="button" class="btn btn-primary btn-sm btnSure" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>确认</button>';
					var strAccept = '<button  type="button" class="btn btn-primary btn-sm btnAccept" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>受理</button>';
					var strReply = '<button  type="button" class="btn btn-primary btn-sm btnReply" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>答复</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strDeal = '<button  type="button" class="btn btn-primary btn-sm btnDealResult" data-index="' + index + '">异议处理完毕</button>';
					var btnStr = ''
					if (row.status == 1) {
						btnStr =  strSign + strView
					} else if (row.status == 2 || row.status == 3) {
						btnStr =  strAccept + strView
					} else if (row.status == 4 || row.status == 6) {
						btnStr =  strReply + strView
					} else if (row.status == 5 || row.status == 7) {
						btnStr =  strView
					} else if (row.status == 8) {
						btnStr =  strView
					} else if (row.status == 9) {
						btnStr =  strView
					}
					var isShowResult = 0
					if(row.submitTime){
						var submitTime = Date.parse(new Date(row.submitTime.replace(/\-/g, "/")));
						var onLineTime = top.OBJECTION_ONLINE_TIME;
						var onLineTime = Date.parse(new Date(onLineTime.replace(/\-/g, "/")));
						if(submitTime>onLineTime){
							isShowResult = 1;
						}
					}
					row.isShowResult = isShowResult;
					if(!row.isOver &&  row.status == 7 && isShowResult == 1){
						btnStr += strDeal;
					}
					return btnStr;
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