var listUrl = config.tenderHost + '/BidExcepitonBiddingController/findPageBidExcepitonList.do';  //列表接口

var viewPage = "Bidding/TenderAbnormal/AbnormalManage/model/abnormalView.html";  //查看页面

$(function(){
	//加载列表
	initTable();
	
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initTable();
	});
	
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	layer.open({
		type: 2,
		title: "查看招标异常",
		area: [width+'px', height+'px'],
		content: viewPage + "?source=0" + "&id=" + rowData.id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}


// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(), // 项目编号
		'bidSectionName': $("#bidSectionName").val() // 项目名称	
	};
	return projectData;
};
//表格初始化
function initTable() {
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width:'50',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				{
					field: 'publicityState',
					title: '状态',
					align: 'left',
					cellStyle:{
						css: widthState
					},
					formatter:function(value, row, index){
						return parent.Enums.projState[value];
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '120px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strSee;	

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
function passMessage(data){
	$("#tableList").bootstrapTable("refresh");
}
