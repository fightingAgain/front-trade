var urlAuctionFileCheckList = top.config.bidhost + "/BidFileController/findSignFilePageList.do"; //报价文件信息详情

//查询按钮
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#signFileCheckList').bootstrapTable('refresh');
	});
	//下拉框选择刷新
	$("select").change(function() {
		$('#signFileCheckList').bootstrapTable('refresh');
	})
	
});

//设置查询条件
function getQueryParams(params) {
	var File = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		projectName: $("#projectName").val(), //采购项目名称
		packageName: $("#packageName").val(), //项目包件名称
		checkState: $("#checkState").val(), //审核状态
	};
	return File;
}

$("#signFileCheckList").bootstrapTable({
	url: urlAuctionFileCheckList,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	clickToSelect: true, //是否启用点击选中行
	pageList: [10,15,20,25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	striped: true,
	uniqueId: "projectId",
	columns: [{
			field: 'xh',
			title: '序号',
			width: "50px",
			align: 'center',
			formatter: function(value, row, index) {
				var pageSize = $('#signFileCheckList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#signFileCheckList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'projectName',
			title: '项目名称',
			align: 'left',			
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		},
		{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(row.packageSource==1){
					return value+'<div class="text-danger">(重新采购)</div>';
				}else{
					return value;
				}
				
			}
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		},
		{
			field: 'signEndDate',
			title: '报名文件递交截止时间',
			align: 'center',
			width: '180'
		},
		{
			field: 'offerEndDate',
			title: '报名文件审核截止时间',
			align: 'center',
			width: '180'
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.checkState == "0") {
					return "<div class='text-warning'>未审核</div>"
				} else {
					return "<div class='text-success'>已审核</div>"
				}
			}
		},
		{
			field: 'action',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(row.checkState == "0") {
					return '<button type="button" onclick="FileCheck(' + index + ',\'audit\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-pencil"></span>审核</button>'
				} else {
					return '<button type="button" onclick="FileCheck(' + index + ',\'check\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				}
			}
		}
	]
});

//查看报名文件事件绑定
function FileCheck($index, type) {
	//存储报名文件id	
	/*var rowData = $("#signFileCheckList").bootstrapTable("getRowByUniqueId", data);
	sessionStorage.setItem("AuctionFileCheckDate", JSON.stringify(rowData));*/
	var rowData = $('#signFileCheckList').bootstrapTable('getData'); //
	sessionStorage.setItem('rowData', JSON.stringify(rowData[$index])); //获取当前选择行的数据，并缓存
	var title = "";
	switch(type) {
		case "check":
			title = '查看审核结果';
			break;
		case "audit":
			title = '审核报价文件';
			break;
	}
	top.layer.open({
		type: 2,
		title: title,
		area: ['80%', '80%'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: '0502/Supplier/signUp/model/signFileCheckInfo.html',
	});
}