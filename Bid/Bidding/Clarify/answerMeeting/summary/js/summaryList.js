/**

*  答疑会纪要
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/AnswerMeetingNoticeController/findSummaryPageList.do';  //列表接口

var bidHtml = 'Bidding/Clarify/answerMeeting/summary/model/bidList.html';//标段列表
var editHtml = 'Bidding/Clarify/answerMeeting/summary/model/summaryEdit.html';//编辑页面
var viewHtml = 'Bidding/Clarify/answerMeeting/summary/model/summaryView.html';//查看
var detailViewHtml = 'Bidding/Clarify/answerMeeting/summary/model/summaryDetailView.html' //新答疑纪要页面

$(function () {
	initDataTab();
	
	/* $('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 1, //0是不新增，1是新增
		QueryName: 'btnSearch',
		AddName: 'btnAdd',
		queryList: [{
				name: '标段编号',
				value: 'interiorBidSectionCode',
				type: 'input',
			},
			{
				name: '标段名称',
				value: 'bidSectionName',
				type: 'input',
			},{
				name: '招标项目名称',
				value: 'tenderProjectName',
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
					name: '未发送',
					value: '0',
				}, {
					name: '已发送',
					value: '1',
				}, ]
			}
		]
	}); */
	
	
	
	
	//查询
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//新增
	$('#btnAdd').click(function () {
		chooseBid()
	});
	//编辑
	$('#tableList').on('click', '.btnEdit', function () {
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前数据
		openDetailView(rowData, false)
	});
	//查看
	$('#tableList').on('click', '.btnView', function () {
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前数据
		openView(rowData)
	});

});
//选择标段
function chooseBid() {
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.bidFromFathar(formFather);
		}
	})
}
function formFather(data) {
	openEdit(data, true)
};
/*编辑
 * state true:新增  false:编辑 
 */
function openEdit(data, state) {
	var title = '';
	if (state) {
		title = '新增答疑会纪要'
	} else {
		title = '编辑答疑会纪要'
	}
	layer.open({
		type: 2,
		title: title,
		area: ['80%', '90%'],
		content: editHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data, refreshFather);
		}
	});
};

//查看供应商自己提出的问题
function openView(data) {
	layer.open({
		type: 2,
		title: '查看答疑会纪要',
		area: ['80%', '90%'],
		content: viewHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data);
		}
	});
}

// 跳转到新的答疑纪要页面中
function openDetailView(data, flag) {
	console.log(data);
	layer.open({
		type: 2,
		title: '编辑答疑会纪要',
		area: ['80%', '90%'],
		content: detailViewHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data, flag);
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
		tenderProjectName: $("#tenderProjectName").val(), // 招标项目名称
		noticeState: $("[name=noticeState]").val() //状态
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
		height: top.tableHeight,
		toolbar:"#toolbar",
		queryParams: getQueryParams,
		striped: true,
		onCheck: function (row) {
			id = row.id;
		},
		fixedColumns: true,
		fixedNumber: 2,
		columns: [
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				cellStyle: {
						css: widthXh
					},
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
				field: 'tenderProjectName',
				title: '招标项目名称',
				align: 'left',
				cellStyle: {
					css: widthName
				}
			},
			{
				field: 'tenderProjectType',
				title: '项目类型',
				align: 'center',
				width: '200',
				formatter: function (value, row, index) {
					return getTenderType(value);
				}
			},
			{
				field: 'noticeState',
				title: '状态',
				align: 'center',
				cellStyle: {
					css: widthState
				},
				formatter: function (value, row, index) {
					if (value == 0) {
						return '未发送'
					} else if (value == 1) {
						return '<span style="color:green;">已发送</span>'
					}
				}
			},
			{
				field: 'createTime',
				title: '提交时间',
				align: 'center',
				cellStyle: {
					css: widthDate
				}

			},
			{
				field: 'status',
				title: '操作',
				align: 'left',
				cellStyle: {
					css: { "white-space": "nowrap" }
				},
				formatter: function (value, row, index) {
					var str = "";
					var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
					if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
						return strEdit + strSee;
					}else{
						return strSee;
					}
				}
			}
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather() {
	$('#tableList').bootstrapTable('refresh');
}