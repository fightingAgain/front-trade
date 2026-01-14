var checkboxed;
var PurchasersData_data;
var findPurchaseUrl=config.bidhost+'/ProjectPackageController/findProjectPackageContactPageList.do';
// 表格初始化
$(function(){
	initTable()
})
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:findPurchaseUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[5,10,25,50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		height:'540',
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row		
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width:'180px'
		},{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			width:'200px'
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width:'180px'
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			width:'200px'
		},{
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				if(value==0){
					return '资格预审';
				}else{
					return '资格后审';
				}
				
			}
		},
		{
			field: '#',
			title: '操作',
			width:'100',
			formatter: function(value, row, index) {
				var deletes='<button  type="button" class="btn-xs btn btn-primary" onclick=btn(\"'+index+'\")>'
					   +'<span class="glyphicon glyphicon-ok"></span>选择'
					+'</button>'
				return '<div class="btn-group-xs" >'+deletes+'</div>';
        	}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	    var para={		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量		    
		    'enterpriseType':'04',
		    'tenderType':0,//采购方式0为询比采购、1为竞低价2、竞卖		
		    'packageName': $('#search_3').val(), // 请求时向服务端传递的参数	
		    'isPublic':1
		} 
		return para		
};
// 搜索按钮触发事件
$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var addpackage='Auction/common/Purchase/againPurchase/model/noticeInfo.html';//后审的编辑页面
var flag="";
function btn($index){	  
	    var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
		PurchasersData=rowData[$index]					   				
		var uid;
		parent.layer.confirm('确定重新采购', {
		  btn: ['是', '否'] //可以无限个按钮
		}, function(indexdd, layero){						
			$.ajax({
			url:config.bidhost+'/PurchaseController/savePackageResource.do', //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
				type: 'get',
				async:false,
				dataType: 'json',
				data: {
					'id':rowData[$index].id,
					'enterpriseType':'04',
					'prefixOrder':orderSoruc.sys,
					
				},
				success: function(data) {			
					if(data.success){
						uid=data.data
						parent.$('#table').bootstrapTable(('refresh'));
							
					}
				}
			});
			if(uid!=""&&uid!=undefined){             			
				parent.layer.open({
					type: 2 //此处以iframe举例
					,title: '编辑公告'
					,area: ['1100px', '600px']
					,maxmin: true//开启最大化最小化按钮
					,content:addpackage+"?projectId="+rowData[$index].projectId+'&packageId='+uid+'&examType='+rowData[$index].examType
					,success:function(layero,index){    
						var iframeWind=layero.find('iframe')[0].contentWindow; 				        	
						parent.layer.close(parent.layer.getFrameIndex(window.name));
						
					}
					
				});
			}		
		   parent.layer.close(indexdd);
		}, function(index){
			
		});					
}