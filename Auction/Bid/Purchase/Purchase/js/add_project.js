var checkboxed;
var PurchasersData_data;

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
/// 表格初始化
$(function(){
	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
})
var findPurchaseUrl=config.bidhost+'/PurchaseController/chooseProjectPageList.do'
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
		height:450,
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
			field: 'project.projectCode',
			title: '采购项目编号',
			align: 'left'
		},{
			field: 'project.projectName',
			title: '采购项目名称',
			align: 'left'
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
				if(row.project.isAgent==1){
					 return '此为代理项目不可选'
				}else{
					  var deletes='<button href="javascript:void(0)" type="button" class="btn-sm btn-primary" style="text-decoration:none;border: none;" onclick=btn(\"'+index+'\",\"'+row.enterpriseId+'\")>'
					   +'选择'
					+'</button>'
					return deletes;
				}
        	
				
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
		    'enterpriseType':'04',
		    'project.projectState':2,
		    'project.tenderType':0,//采购方式0为询比采购、1为竞低价2、竞卖		
		    'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数	
		}   	
};

function btn($index,uid){				
		var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
		PurchasersData=rowData[$index]					   				
		var dcmt = parent.iframeWinAdd;								
		var saveProjectPackage=config.bidhost+'/PurchaseController/saveProjectPackage.do';//添加包件的接口		
		 $.ajax({
		   	url:saveProjectPackage,
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'packageState':0,
		   		'projectId':PurchasersData.projectId,
		   		'examType':PurchasersData.examType,
		   		'projectCode':PurchasersData.projectCode,
		   		'packageName':PurchasersData.projectName,
		   		'isSign':1,
		   		'isSellFile':0
		   	},
		   	success:function(data){ 
		   		if(data.success){
		   			dcmt.$('.packNone').show();
		   			dcmt.projectType=PurchasersData.project.projectType;
		   			dcmt.tenderTypeCode=PurchasersData.project.tenderType;
		   			dcmt.du(data.data,PurchasersData.examType,PurchasersData.project.isAgent);
		   			dcmt.$("#examType").val(PurchasersData.examType);		   			
		   			parent.layer.close(parent.layer.getFrameIndex(window.name));
		   			parent.$('#table').bootstrapTable(('refresh'));
		   		} else {
					parent.layer.alert(data.message, {icon: 0})
				}
		   	},
		   	error:function(data){
		   		parent.layer.alert("添加失败")
		   	}
		 });
		//dcmt.showPurchse(PurchasersData);
		//dcmt.form1()
			
}