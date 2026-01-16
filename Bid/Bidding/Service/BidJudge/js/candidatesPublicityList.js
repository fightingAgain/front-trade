/**

*  评审结果公示
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidSuccessFulPublicityServerController/findBidSuccessFulPublicityPageList.do';  //列表接口


var viewHtml = 'Bidding/BidJudge/CandidatesPublicity/model/candidatesView.html';//查看

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//添加
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
});
//查看
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看候选人公示',
		area: ['80%', '80%'],
		//content: viewHtml+'?bidSectionId='+rowData.bidSectionId+'&examType='+rowData.examType+'&id='+rowData.id,
		content:viewHtml+'?id='+rowData.bidSectionId+'&examType='+rowData.examType + "&isThrough=" + (rowData.publicityState == 2 ? 1 : 0),
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.passMessage(rowData); 
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
				},{
					field: 'publicityStartTime',
					title: '公示开始时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'publicityEndTime',
					title: '公示截止时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'publicityType',
					title: '公示性质',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 1){//公示类型 1 正常 2 更正 9 其他
							return  '<span>正常公示</span>'
						}else if(value == 2){
							return  '<span>变更公示</span>'
						}
					}
				},
				{
					field: 'publicityState',
					title: '审核状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span>未提交</span>'
						}else if(value == 1){
							return  '<span>待审核</span>'
						}else if(value == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(value == 3){
							return  '<span style="color:red">审核未通过</span>'
						}else if (value == 4){
							return "<span style='color:blue;'>已撤回</span>";
						}else if(value == 5){
							return  '<span style="color:red">暂停</span>'
						}
					}
				},{
					field: 'publishState',
					title: '发布状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span style="color:red">未发布</span>'
						}else if(value == 1){
							return  '<span style="color:green">已发布</span>'
						}else if(value == 2){
							return  '<span style="color:orange">变更中</span>'
						}
					}
				},{
					field: '',
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