/*
 * 2020-4-22
 * 
 * by  zhouyan
 * 
 * */


var listUrl = config.Reviewhost + '/ProjectController/findTenderPageList.do';  //列表接口
var viewHtml = 'Review/tender/clarifyConfirm/model/view.html';//查看时进入的页面
var pageCheck;
$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
});
// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'examType': 2,
		'BidSectionCode': $("#interiorBidSectionCode").val(), // 标段编号
		'bidSectionName': $("#bidSectionName").val(), // 标段名称			
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
						css:{
							"min-width":"200px", 
							"word-wrap": "break-word", 
							"word-break": "break-all", 
							"white-space": "normal"
						}
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:{
							"min-width":"300px", 
							"word-wrap": "break-word", 
							"word-break": "break-all", 
							"white-space": "normal"
						}
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
				},
				{
					field: 'checkEndDate',
					title: '评标结束时间',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					}
				},
				{
					field: 'checkState',
					title: '评标状态',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						// 0:未开始 1:评标中 2:评标结束
						if(value==0){
							return "未开始"
						}else if(value==1){
							return "评标中"
						}else if(value==2){
							return "评审结束"
						}else if(value==3){
							return "暂停"
						}
					}
				},{
					field: 'recommendResult',
					title: '组长',
					align: 'center',
					width: '100',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						//0推荐中 1未选出组长 2 选中组长
						if(row.groupExpertName){
							return "已推选"
						}else{
							if(row.signResult == 0){
								return "未推选"
							}else{
								if(value==0){
									return "推选中"
								}else if(value==1){
									return "已推选"
								}else if(value==2){
									return "已推选"
								}else{
									return "未推选"
								}
							}
							
						}
					}
				},{
					field: 'states',
					title: '标段状态',
					align: 'center',
					width: '100',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						//0.编辑 1.生效 2.撤回 3.招标完成 4.流标 5.重新招标 6.终止
						if(value == 0){
							return '编辑'
						}else if(value == 1){
							return '生效'
						}else if(value == 2){
							return '撤回'
						}else if(value == 3){
							return '招标完成'
						}else if(value == 4){
							return '流标'
						}else if(value == 5){
							return '重新招标'
						}else if(value == 6){
							return '终止'
						}
					}
				},
				{
					field: '',
					field: 'status',
					title: '操作',
					align: 'center',
					width: '200px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					events:{
						'click .btnView':function(e,value, row, index){
							layer.open({
								type: 2,
								title: '查看问题',
								area: ['1000px', '600px'],
								resize: false,
								content: viewHtml + '?id=' + row.bidSectionId + '&examType=' + row.examType,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
									iframeWin.passMessage(row)
								},
							});
						},
					},
					formatter: function(value, row, index){
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'">查看</button>';
						return strView ;
					}
				}
			]
		]
	});
};
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather(){
	$('#tableList').bootstrapTable('refresh');
}