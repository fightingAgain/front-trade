var duoBaoActivityList=[
    {
     id:0,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:1,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:2,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:3,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1飒沓谁打啊阿斯达",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:4,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2撒打算湿答答湿答答",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:5,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:6,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    {
     id:7,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    }, {
     id:7,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    }, {
     id:7,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    }, {
     id:7,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    }, {
     id:7,
     type:"询价",
     ProjectName:"项目1",
     PackageName:"包件1",
     PackageNum:"DXER-2322134566",
     EnterpriseName:"供应商2",
     DepositMoney:"0.1",
     SubDate:"2018-06-07 18：00：00",
     AuditDate:"未发布",
     DepositState:"审核中"
     
    },
    
   
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
//		onCheck:function(row){
//			checkboxed.push(row)
//			
//			console.log(checkboxed)
//		},
//		onUncheck:function(row,index){
//			checkboxed.splice(index,1)
//			console.log(checkboxed)
//		},
		columns: [
		{
			field: 'type',
			title: '类别',
			align: 'center'
		}, {
			field: 'ProjectName',
			title: '项目名称',
			align: 'center'
		}, {
			field: 'PackageName',
			title: '包件名称',
			align: 'center'
		}, {
			field: 'PackageNum',
			title: '包件编号',
			align: 'center'
		}, {
			field: 'EnterpriseName',
			title: '企业名称',
			align: 'center'
		},{
			field: 'DepositMoney',
			title: '金额',
			align: 'center'
		}, {
			field: 'SubDate',
			title: '提交时间',
			align: 'center'
		},
		{
			field: 'AuditDate',
			title: '审核时间',
			align: 'center'
		},
		{
			field: 'DepositState',
			title: '受理状态',
			align: 'center'
		},
		
		{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100px',
			formatter: function(value, row, index) {
				var view = '<a onclick="view('+ index +','+row.id+')">审核</a> ';
				var update = '<a onclick="reufund('+ index +','+row.id+')">受理 </a>';
				// console.log(JSON.stringify(row));

				if (row.totalCounts === '审核中') {
					return view 
				} else {
					return update;
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
        ,title: '保证金审核'
        ,area: ['800px', '850px']
        ,content:'model/AuditDeposit.html'
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
//退款
function reufund(num,uid){
	layer.open({
        type: 2 //此处以iframe举例
        ,title: '保证金审核'
        ,area: ['800px', '850px']
        ,content:'model/AuditDeposit.html'
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

