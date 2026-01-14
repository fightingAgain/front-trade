
var checkboxed="";
var codes="";
var names="";
var endtimes=""
$(function(){
   initTable();
   // 搜索按钮触发事件
	$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
});
/// 表格初始化
var urlProjectSupplementList = config.AuctionHost+'/ProjectSupplementController/findPageList.do';
var view='Auction/Auction/Purchase/AuctionSupplement/model/view_model.html';
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:urlProjectSupplementList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
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
			checkboxed=row.projectId;
			codes=row.project.projectCode;
			names=row.project.projectName;
			sessionStorage.setItem('supplementData', JSON.stringify(row));
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180'
		},{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			formatter:function(value, row, index){					
				if(row.projectSource==1){
					var projectName=row.projectName +'<span class="text-danger" style="font-weight:bold">(重新竞价)</span>'		
				}else{
					var projectName=row.projectName
				}						
				return projectName
			}
		},{
			field: 'noticeEndDate',
			title: '补遗截止时间',
			align: 'center',
			width: '160'
		},{
			title: '补遗数量',
			field: 'subCount',
			align: 'center',
			width: '100'
		},{
			title: '未通过数',
			field: 'checkCount',
			align: 'center',
			width: '100'
		}
		,{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){	
				var State='<div class="btn-group">'
						+'<button type="button" class="btn-xs btn btn-primary"onclick=showProjectSupplementInfo(\"'+row.id+'\",\"'+(row.enterpriseId || "")+'\",\"'+(row.pEnterpriseId||"")+'\",\"'+row.createType+'\")>'
						   +'<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> 查看'
						+'</button>'
	        			+'</div>'
				return State
			}
		}
		],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {	
    return {		 
			pageNumber:params.offset/params.limit+1,//当前页数
			pageSize: params.limit, // 每页显示数量
			offset:params.offset, // SQL语句偏移量	
			tenderType:1,//
			enterpriseType:"04", //0是采购人 1是供应商身份
			projectName:$("#projectName").val(),
			projectCode:$("#projectCode").val()
    }	
};


//补遗
function showProjectSupplementInfo(projectId,enterpriseId,pEnterpriseId,createType){
	var projectIds="";
	layer.open({
		type: 2,
		title: '竞价补遗',
		area: ['1100px', '600px'],
		// maxmin: false,
		resize: false,
		content:view + "?projectId="+projectId+"&tenderType=2&enterpriseType=04&createType="+createType,
		success: function(layero, index){
        	var body = layer.getChildFrame('body', index);    
            var iframeWin = layero.find('iframe')[0].contentWindow;     
        }
	});
}