// 表格初始化
var checkboxed = new Array();  //全局数组
var data1;
var data2;
var data = new Array();
var supplierListUrl="";
var isPublics="";
var newData="";
var purchaserIds;
var classificaCodes;
function du(isPublic,purchaserId,classificaCode){	
	isPublics=isPublic;
	purchaserIds=purchaserId;
	classificaCodes=classificaCode;
	if(isPublic==3){
		supplierListUrl=top.config.bidhost + "/SupplierDataTypeSetController/findEnterprisePageListByCodes.do";
	}else{
		supplierListUrl=config.bidhost+'/EnterpriseController/page.do'
	}	
	data1 = JSON.parse(sessionStorage.getItem('keysjd'));
	data2 = JSON.parse(sessionStorage.getItem('sadasd'));
	if(data1!=null){
		checkboxed=data1;
	}	
	if(data2!=null){
    	/*
    	 * 注释代码，添加邀请函，每次只添加新增的供应商
    	
    	 */
    	
//  	data=data2;
//  	newData=data.unique1()
		
		/*end*/
    }
	initTable();   
}
// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
	du(isPublics,purchaserIds,classificaCodes)
});
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:supplierListUrl, // 请求url	
		//data:Json,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageList:[5,10,25,50],
		height:'515',
		toolbar: '#toolbar', // 工具栏ID
		pageNumber: 1, // table初始化时显示的页数
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
//		onCheckAll:function(rows){
//		
//			data=[]
//			
//		},				
		columns: [{
			checkbox:true,
			formatter: function (i,row) { // 每次加载 checkbox 时判断当前 row 的 id 是否已经存在全局 Set() 里   				
                if($.inArray(row.id,checkboxed)!=-1){// 因为 判断数组里有没有这个 id
					return {
						checked : true ,
						disabled : true,// 存在则选中						
					}
				}    
            }
		},
		{
			field: 'enterpriseName',
			title: '企业名称',
			align: 'left',
			formatter:function(value, row, index){
			   if(row.supEnterpriseName!=undefined){
			   	var enterpriseName=row.supEnterpriseName;
			   
			   }else if(row.enterpriseName!=undefined){
			   	var enterpriseName=row.enterpriseName;
			   }
			   	return enterpriseName
			}
		},
		{
			field: 'enterprisePerson',
			title: '联系人',
			align: 'center'
		}, {
			field: 'subDate',
			title: '创建时间',
			align: 'center',			
		},{
			field: 'enterpriseLevel',
			title: '认证级别',
			align: 'center',
			formatter:function(value, row, index){
				if(row.enterpriseLevel==1){					
					return "提交认证"
				};
				if(row.enterpriseLevel==2){					
					return "受理认证"
				};
				if(row.enterpriseLevel==3){
					return "已认证"
				};
				if(row.enterpriseLevel==4){
					return "认证2"
				}else{
					return "未认证"
				}
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	var rowDate={
		enterpriseName: $('#search_3').val(), // 请求时向服务端传递的参数
		pageNumber:params.offset/params.limit+1,//当前页数
		pageSize: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量		
		enterpriseType:"",
		
	};
	if(isPublics==3){
		rowDate.enterpriseType='04';
		rowDate.purchaserId=purchaserIds;
		rowDate.code=classificaCodes;
	}else{
		rowDate.enterpriseType='06';
		rowDate.type=0;
	}
	return rowDate
	
};
$('#table').on('uncheck.bs.table check.bs.table check-all.bs.table uncheck-all.bs.table',function(e,rows){
        var datas = $.isArray(rows) ? rows : [rows];        // 点击时获取选中的行或取消选中的行
        examine(e.type,datas);                              // 保存到全局 Array() 里
});
function examine(type,datas){ 	
	if(type.indexOf('uncheck')==-1){    
		$.each(datas,function(i,v){
		  // 添加时，判断一行或多行的 id 是否已经在数组里 不存则添加	         
　　　　　　checkboxed.indexOf(v.id) == -1 ? checkboxed.push(v.id) : -1;
				data.push({supplierId:v.id,enterprise:v,isAppend:1})
		
　　　　	});
	   
	}else{
		$.each(datas,function(i,v){		        	
			checkboxed.splice(checkboxed.indexOf(v.id),1);    //删除取消选中行
			for(var m=0;m<data.length;m++){
				if(data[m].supplierId==v.id){
					data.splice(m,1);    //删除取消选中行
				}
			}	            
		});
	};
	newData=data.unique1(); 
};

Array.prototype.unique1 = function(){
   var res = [this[0]];
   for(var i = 1; i < this.length; i++){
var repeat = false;
for(var j = 0; j < res.length; j++){
   if(this[i].supplierId == res[j].supplierId){
    repeat = true;
    break;
   }
}
if(!repeat){
   res.push(this[i]);
}
   }
   return res;
}
