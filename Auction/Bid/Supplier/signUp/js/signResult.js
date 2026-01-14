var searchUrl = top.config.bidhost + "/OfferController/findCheckLastResult.do";

$(function() {
	$("#btnSearch").on('click', function() {
		$('#table').bootstrapTable('refresh', {
			url: searchUrl
		});
	});
});

// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'tenderType': 0,
		'projectName': $('#projectName').val(), // 请求时向服务端传递的参数
		'projectCode': $('#projectName').val(),
		'packageName': $('#projectName').val(),
		'packageNum': $('#projectName').val()
	};
};


$('#table').bootstrapTable({
	method: 'GET', // 向服务器请求方式
	contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
	url: searchUrl, // 请求url		
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	striped: true, // 隔行变色
	dataType: "json", // 数据类型
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageList: [10, 15, 20, 25],
	pageNumber: 1, // table初始化时显示的页数
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	toolbar: '#toolbar', // 工具栏ID
	toolbarAlign: 'left', // 工具栏对齐方式
	queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
	columns: [{
		field: 'xh',
		title: '序号',
		align: 'center',
		width: '50px',
		formatter: function(value, row, index) {
			var pageSize = $('#table').bootstrapTable('getOptions').pageSize||15; //通过表的#id 可以得到每页多少条  
			var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber||1; //通过表的#id 可以得到当前第几页  
			return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		}
	}, {
		field: 'projectCode',
		title: '项目编号',
		align: 'left',
	},{
		field: 'projectName',
		title: '采购项目名称',
		align: 'left'
	},{
		field: 'packageName',
		title: '包件名称',
		align: 'left'
	}, {
		field: 'packageNum',
		title: '包件编号',
		align: 'left',
	}, {
		field: 'packageNum',
		title: '包件编号',
		align: 'left',
	}, {
		field: 'examCheckEndDate',
		title: '预审开始时间',
		width: '180px',
		align: 'center',
	}, {
		field: 'isOut',
		title: '状态',
		align: 'center',
		width: '120px',
		formatter: function(value, row, index) {
			if(row.isOut == 0) {
				return "<span style='color:green'>已通过</span>";
			} else if(row.isOut == 1) {
				return "<span style='color:red'>已淘汰</span>";
			}else{
				return "评审中";
			}
		}
	}
	
	
	],
});