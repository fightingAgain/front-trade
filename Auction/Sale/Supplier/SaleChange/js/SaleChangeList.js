var checkboxed = "";
var projectend = "";
var iframeWind="";
//初始化
$(function() {
	initTable();
});
/// 表格初始化
var auditPurchase = 'Auction/Sale/Supplier/SaleChange/model/auditPurchase.html' //审核路径
var pageAuctionPurchase = config.AuctionHost + '/ProjectSupplementController/findProjectSupplementPageList';
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: pageAuctionPurchase, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			formatter:function(value, row, index){					
				if(row.projectSource==1){
					var count = row.projectSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新竞卖)</span>';
					}else{
						return value+' <span class="text-danger">(重新竞卖)</span>';
					}
				}else{
					return value
				}						
			}
		},
		{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {

				var audit = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn btn-sm btn-primary" style="padding: 3px 5px;"  onclick=audit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看' +
					'</button>'

					return audit	

			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // 每页的第一个行的序号，第一页是0，第二页收10...		
		'enterpriseType': '06', //当前登陆人为采购人
		'tenderType': 2, //采购方式0为询价采购、1为竞低价2、竞卖
		'supplementType':3,
		'projectName': $('#projectName').val(), // 项目名称	
		'projectCode': $('#projectCode').val(), // 项目名称	
	}
};
// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
 
 
//查看
function audit_btn($index) { //$index当前选择行的下标
	var rowData = $('#table').bootstrapTable('getData');
	parent.layer.open({
		type: 2,
		title: '查看',
		area: ['1100px','600px'],
		maxmin: true, //开启最大化最小化按钮
		resize: false, //是否允许拉伸
		content: auditPurchase+'?id='+rowData[$index].projectId+'&type=view'+"&projectSourceCount="+rowData[$index].projectSourceCount,
		success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow; 
       	},
		// btn: ['关闭'],//确定按钮	
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			parent.layer.close(index);
		}
	});
};
 