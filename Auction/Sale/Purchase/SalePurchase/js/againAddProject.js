/*
 */ 
var checkboxed;
//初始化
/* $(function(){
   	initTable();
   	// 搜索按钮触发事件
	$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();			
	});
}); */
function passMessage(callback){
	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function() {	    
		$('#table').bootstrapTable('destroy'); // 很重要的一步，刷新url！	
		initTable();			
	});
	$('#btn_close').click(function(){
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
	$('#btn_save').click(function(){
		var row = $("#table").bootstrapTable('getSelections')[0];
		callback(row);
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
}
/// 表格初始化
var pageAuctionPurchase=config.AuctionHost+'/AuctionPurchaseController/chooseAuctionProjectPageList.do'
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:pageAuctionPurchase, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[5,10,25,50],
		height: 400,
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row			
		},
		columns: [{
			radio:true
		},{
			field: 'xh',
			title: '序号',
			align: 'center',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'project.projectCode',
			title: '采购项目编号',
			align: 'center'
		},{
			field: 'project.projectName',
			title: '采购项目名称',
			align: 'center'
		}/* ,{
			field: 'project.projectSource',
			title: '采购方式',
			align: 'center',
			formatter:function(value, row, index){				
				var projectSource=""
				if(row.project.projectSource==0){
					projectSource="首次发布公告"
				}else{
					projectSource="重新竞卖"
				}
				return projectSource
			}
		} */],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	   return {		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量	
		    'project.projectSource':0,  // 请求时向服务端传递的参数
			'enterpriseType':'04',
			'project.isAgent':0,
		    'project.projectState':2,
		    'project.tenderType':2,//采购方式0为询价采购、1为竞低价2、竞卖	
		    'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数	
		}   	
};
