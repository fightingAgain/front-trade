var duoBaoActivityList=[
    {
     id:0,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"未发布",
    },
     {
     id:1,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"未缴纳",
     startTime:"已发布",
    },
     {
     id:2,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"未缴纳",
     startTime:"已发布",
    },
     {
     id:3,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"未缴纳",
     startTime:"未发布",
    },
     {
     id:4,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"未发布",
    },
     {
     id:5,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"已发布",
    },
     {
     id:6,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"未缴纳",
     startTime:"已发布",
    },
     {
     id:7,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"1224",
    },
     {
     id:8,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"已发布",
    },
     {
     id:9,
     name:"张三",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"已缴纳",
     startTime:"未发布",
    },
     {
     id:10,
     name:"李四",
     status:"2018-05-07",
     participationCounts:"2018-05-07",
     totalCounts:"未缴纳",
     startTime:"已发布",
    }    
    ]
$(document).ready(function() {
	// 初始化表格
	initTable();
});

var checkboxed=[]
// 表格初始化
function initTable() {
	$('#eventTable').bootstrapTable({
		method: 'post', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		//url: '/program/event/findbyitem', // 请求url
		data:duoBaoActivityList,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		search: false, // 不显示 搜索框
		//sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式

		// showRefresh : true, // 显示刷新按钮

		silent: true, // 必须设置刷新事件

		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'right', // 工具栏对齐方式

		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		onCheck:function(value, row,index){
			checkboxed.push(row)
			
			console.log(index)
		},
		onUncheck:function(value, row,index){
			console.log()
			checkboxed.splice(index,1)
			console.log(checkboxed)
		},
		columns: [{
			checkbox:true
		},
		{
			field: 'startTime',
			title: '询价采购名称',
			align: 'center'
		}, {
			field: 'name',
			title: '包件编号',
			align: 'center'
		}, {
			field: 'status',
			title: '包件名称',
			align: 'center'
		}, {
			field: 'participationCounts',
			title: '报价截止时间',
			align: 'center'
		}, {
			field: 'totalCounts',
			title: '缴纳状态',
			align: 'center'
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '280px',
			formatter: function(value, row, index) {
				var view = '<a onclick="view('+ index +','+row.id+')">查看</a> ';
				var update = '<a onclick="reufund('+ index +','+row.id+')">申请退款 </a>';
				var review = '<a onclick="pay('+ index +','+row.id+')">缴纳 </a>';

				// console.log(JSON.stringify(row));

				if (row.totalCounts === '未缴纳') {
					return review 
				} else {
					return view + update;
				}

			}
		}],
	});
}

// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		eventName: $('#eventqueryform input[name=\'eventName\']').val(), // 请求时向服务端传递的参数
		status: $('#eventqueryform input[name=\'status\']').val(), // 请求时向服务端传递的参数
		location: $('#eventqueryform input[name=\'location\']').val(), // 请求时向服务端传递的参数
		startdate: $('#eventqueryform input[name=\'startdate\']').val(), // 请求时向服务端传递的参数
		enddate: $('#eventqueryform input[name=\'enddate\']').val(), // 请求时向服务端传递的参数
		limit: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量
	}
}

// 搜索按钮触发事件
$(function() {
	$("#eventquery").click(function() {
		$('#eventTable').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
		// console.log("/program/area/findbyItem?offset="+0+"&"+$("#areaform").serialize())
		$('#eventqueryform input[name=\'eventName\']').val('')
		$('#eventqueryform input[name=\'status\']').val('')
		$('#eventqueryform input[name=\'location\']').val('')
		$('#eventqueryform input[name=\'startdate\']').val('')
		$('#eventqueryform input[name=\'enddate\']').val('')
	});
});
//查看
function view(num,uid){
	layer.open({
        type: 2 //此处以iframe举例
        ,title: '缴纳保证金'
        ,area: ['800px', '850px']
        ,content:'model/view_Deposit.html'
        ,btn: ['保存','保存并提交','取消'] 
        //确定按钮
        ,yes: function(index,layero){    
        
         var iframeWin=layero.find('iframe')[0].contentWindow;
                 
         layer.close(index);     
        },
        btn2:function(){
        	
        },
        btn3:function(){
        	
        }  
      });
	console.log("第"+num+'行','id:'+uid)
	
}
//缴纳
function pay(num,uid){
	layer.open({
        type: 2 //此处以iframe举例
        ,title: '缴纳保证金'
        ,area: ['800px', '850px']
        ,content:'model/pay_Deposit.html'
        ,btn: ['确定缴纳','取消'] 
        //确定按钮
        ,yes: function(index,layero){    
        
         var iframeWin=layero.find('iframe')[0].contentWindow;
         
         ilayer.close(index);         
        },
        btn2:function(){
        	
        },
        btn3:function(){
        	
        }  
      });
	console.log("第"+num+'行','id:'+uid)
	
}
//退款
function reufund(num,uid){
	layer.open({
        type: 2 //此处以iframe举例
        ,title: '申请退款'
        ,area: ['800px', '850px']
        ,content:'model/apply_Deposit.html'
        ,btn: ['提交','取消'] 
        //确定按钮
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;        
         layer.close(index);     
        },
        btn2:function(){
        	
        },
        btn3:function(){
        	
        }  
      });
	console.log("第"+num+'行','id:'+uid)
	
}

