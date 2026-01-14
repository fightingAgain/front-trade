var checkboxed="";
var projectend="";
//初始化
 var userId="3604be78001444d4a72469ef1ca3762e"
$(function(){
   time();
   initTable();
});
/// 表格初始化

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:config.host+'/PurchaseController/findPurchase.do', // 请求url		
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
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'right', // 工具栏对齐方式
        sortStable:true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row.id;			
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
			width: '180',
			formatter:function(value, row, index){
				 var date=GMTToStr(row.project.subDate) 
				 return date 
			}
		},{
			title: '发布时间',
			field: 'noticeStartDate',
			align: 'center',
			width: '180',
			formatter:function(value, row, index){
				if(row.noticeStartDate!=""&&row.noticeStartDate!=null){
					var date=GMTToStr(row.noticeStartDate) ;
				 return date
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
		    'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数
		    'project.employeeId':userId
		}   	
};
// 搜索按钮触发事件
$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
//添加功能
function add_btn(){
	var height=$(window).height()*0.5
	var width=$(window).width()*0.5
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加重新采购'
        ,area: [width+'px', height+'px']
        ,content:'http://127.0.0.1:8020/BidWeb/view/Purchase2/model/purchase_add_model.html'
        ,btn: ['确定重新采购','取消'] 
        //确定按钮
        ,yes: function(index,layero){    
        
         var iframeWin=layero.find('iframe')[0].contentWindow;
        
         iframeWin.du()
         console.log(iframeWin.check_val)
         parent.layer.close(index);                   
        },
        btn2:function(){
        	
        },
        btn3:function(){
        	
        }  
      });
}
function time(){
	layui.use('laydate', function(){
	 var laydate = layui.laydate;
	//自定义格式
	  laydate.render({
	    elem: '#search_2'
	    ,format: 'yyyy年MM月dd日'
	  });
	})
}

//格林威治时间转换成北京时间
function GMTToStr(time){
    var date = new Date(time)
    if(date.getMonth()<10){
    	var Month='0'+(date.getMonth()+1)
    }else{
    	var Month=date.getMonth()+1
    };
    if( date.getDate()<10){
    	var Dates='0'+date.getDate()
    }else{
    	var Dates=date.getDate()
    };
    if(date.getHours()<10){
    	var Hours='0'+date.getHours()
    }else{
    	var Hours=date.getHours()
    }
    if(date.getMinutes()<10){
    	var Minutes='0'+date.getMinutes()
    }else{
    	var Minutes=date.getMinutes()
    };
    if(date.getSeconds()<10){
    	var Seconds='0'+date.getSeconds()
    }else{
    	var Seconds=date.getSeconds()
    };
    var Str=date.getFullYear() + '-' +
    Month + '-' + 
    Dates + ' ' + 
    Hours + ':' + 
    Minutes + ':' + 
    Seconds
    return Str
}