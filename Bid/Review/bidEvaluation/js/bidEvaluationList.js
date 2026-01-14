var listUrl = config.Reviewhost + '/ProjectController/findNotReviewPageList.do';  //列表接口
var bidEvaluationInfo = "Review/bidEvaluation/model/bidEvaluationInfo.html";  //评标
$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable("refresh");
	});
});
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		BidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
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
		height: (top.tableHeight -  $('#toolbarTop').height()),
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
				},{
					field: 'bidSectionCode',
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
					field: 'examType',
					title: '评审会类型',
					align: 'center',
					formatter: function(value, row, index){
						if(value==1){
							return  '资格预审会'
						}{
							return  '评审会'
						}
					}
				},/*{
					field: 'checkStartDate',
					title: '评标开始时间',
					align: 'center',
					width: '150'
				},*/				
				{
					field: '',
					field: 'status',
					title: '操作',
					align: 'center',
					width: '100px',
					cellStyle:{
						css: {'white-space':'nowrap'}
					},
					events:{
						'click .btnEnter':function(e,value, row, index){
							layer.open({
								type: 2,
								title: "评标设置",
								area: ['1000px', '600px'],
								resize: false,
								id:'layerPackage',
								content: bidEvaluationInfo+'?bidSectionId='+row.bidSectionId+'&examType='+row.examType,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;								
								}
							});
						},
						'click .btnView':function(e,value, row, index){
							layer.open({
								type: 2,
								title: "查看评标设置",
								area: ['1000px', '600px'],
								resize: false,
								id:'layerPackage',
								content: bidEvaluationInfo+'?bidSectionId='+row.bidSectionId+'&examType='+row.examType + '&isView=true',
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;								
								}
							});
						},
					},
					formatter: function(value, row, index){
						var strEdit = '<button  type="button" class="btn btn-sm btn-primary btn-sm btnEnter" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>设置</button>';	
						var strView = '<button  type="button" class="btn btn-sm btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';	
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							return  strEdit
						}else{
							return  strView
						}
					}
				}
			]
		]
	});
};