var listUrl = config.AuctionHost + '/ControlPriceController/findControlPricePageSupplier.do';  //列表接口

var pageView = "bidPrice/ControlPrice/model/bidderViewPrice.html";  //查看页面


$(function(){
	//加载列表
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tabList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$("#tabList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var rowData=$('#tabList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看控制价信息",
		area: ['100%', '100%'],
		resize: false,
		content: pageView + "?id=" + rowData[index].packageId + "&dataId=" + rowData[index].controlPriceId + "&role=gys",
		success:function(layero, idx){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			// iframeWin.passMessage(rowData[index]);  //调用子窗口方法，传参
		}
	});
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		packageNum: $("#packageNum").val(), // 项目编号
		packageName: $("#packageName").val() // 项目名称	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tabList").bootstrapTable({
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
		                var pageSize = $('#tabList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tabList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'packageNum',
					title: '包件编号',
					align: 'center',
					width: '240',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'packageName',
					title: '包件名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: 'createDate',
					title: '创建时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'checkState',
					title: '操作',
					align: 'left',
					width: '100px',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strSee ;

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
	console.log(JSON.stringify(data));
	$("#tabList").bootstrapTable("refresh");
}
