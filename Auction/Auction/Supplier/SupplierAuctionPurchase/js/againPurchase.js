var checkboxed="";
var projectend="";
//初始化
$(function(){
  // time();
   initTable();
});
/// 表格初始化
var auditPurchase='0502/Auction/AuctionPurchase/model/auditPurchase.html'//审核路径
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:config.AuctionHost+'/AuctionPurchaseController/findAuctionPurchaseForNotice.do', // 请求url
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[5,10,25,50],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
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
			checkboxed=row.id;		
			projectend=row.project.projectState;
			sessionStorage.setItem('purchaseaddata', JSON.stringify(row));
		},
		columns: [{
			radio:true
		},{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'project.projectCode',
			title: '采购项目编号',
			align: 'left'
		},{
			field: 'project.projectName',
			title: '采购项目名称',
			align: 'left'
		},{
			field: 'project.subDate',
			title: '创建时间',
			align: 'center',
			width: '180'
		},{
			title: '发布时间',
			field: 'noticeStartDate',
			align: 'center',
			width: '180'
		},{
			field: 'project.projectState',
			title: '审核状态',
			align: 'center',
			width: '140',
			formatter:function(value, row, index){
				var State=""
				if(row.project.projectState==0){
					State="未审核";
					return State
				}if(row.project.projectState==1){
					State="审核中";
					return State
				}if(row.project.projectState==2){
					State="<div class='text-success'>审核通过</div>";
					return State
				}else{
					State="<div class='text-danger'>审核未通过</div>";
					return State
				}
			}
		},{
			field: 'project.projectState',
			title: '发布状态',
			align: 'center',
			width: '140',
			formatter:function(value, row, index){
				var State=""
				if(row.project.projectState==2){
					State="已发布";
					return State
				}else{
					State="未发布";
					return State
				}
			}
		},{
			field: 'cz',
			title: '操作',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				var State='<a href="javascript:void(0)" style="text-decoration:none" type="button" class="btn-sm btn-primary" onclick="audit_btn('+ index +')"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>查看</a>'				
				return State
				
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	   return {		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量	
		  'project.projectSource':1, // 请求时向服务端传递的参数
		  'enterpriseType':'06',
		  'project.tenderType':1,//采购方式0为询价采购、1为竞低价2、竞卖	
		  'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数	
		}   	
};
// 搜索按钮触发事件
$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
//审核页面
function audit_btn($index){
 var rowData=$('#table').bootstrapTable('getData');
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].projectId));	
  var height=top.$(window).height()*0.8;
	var width=top.$(window).width()*0.8;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改'
        ,area: [width+'px', height+'px']
        ,content:auditPurchase
        ,btn: ['确定','取消'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow;                    
          parent.layer.close(index);
        },
        btn2:function(){
        	
        } 
      });
};