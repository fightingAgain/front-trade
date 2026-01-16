/**

*  线下评审结果录入列表
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/UnderLineReportController/findPageAuditList.do';  //列表接口


var viewHtml = 'Bidding/BidJudge/ResultEntry/model/resultEntryView.html';//查看




$(function(){
	initDataTab();
//	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$('#tableList').on('click','.btnView',function(e){
		e.stopPropagation();
		var index = $(this).attr("data-index");
		openView(index);
	});
	
	
	
});
//打开查看页面
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看评审结果',
		area: ['80%', '100%'],
		content: viewHtml+'?id='+rowData.bidSectionId+'&examType='+rowData.examType+ '&dataId='+rowData.bidCheckReportId,
		resize: false,
		success:function(layero, index){
			$(':focus').blur();
			var iframeWin = layero.find('iframe')[0].contentWindow;
			/*var interiorBidSectionCode = parent.layer.getChildFrame('#interiorBidSectionCode', index);
			var bidSectionName = parent.layer.getChildFrame('#bidSectionName', index);
			interiorBidSectionCode.val(rowData.interiorBidSectionCode);
			bidSectionName.val(rowData.bidSectionName);*/
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passView(rowData); 
		}
	});
	
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
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
				width: '50',
				formatter: function (value, row, index) {
	                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					},
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},/*{
					field: 'bidCheckType',
					title: '评标方式',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){
						if(row.bidCheckType==1){
							return  '线上评审'
						}else if(row.bidCheckType==2){
							return  '线下评审'
						}
					}
				},*/{
					field: 'checkStartDate',
					title: '评审开始时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'checkEndDate',
					title: '评审结束时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'reportState',
					title: '评审状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						
						if(value == 0 ){
							return  '未提交'
						}else if(value == 1){
							return  '待审核'
						}else if(value == 2){
							return  '审核通过'
						}else if(value == 3){
							return  '审核未通过'
						}
					}
				},/*{
					field: 'groupExpertName',
					title: '组长',
					align: 'center',
					width: '100',
				},*/
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '120px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strView;
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
	$("#tableList").bootstrapTable("refresh");
}