var urlPurchaseList = config.bidhost+'/PurchaseController/findPurchaseForNotice.do';
var urlPurchaseInfo = "Auction/common/Supplier/Purchase/model/SupplierPurchaseInfo.html";
var iframeWin="";
var tenderTypeCode;
var examType;
//表格初始化
$(function(){
	
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != ""){
		if(PAGEURL.split("?")[1].split("=")[0] == "tenderType"){ //单一
			tenderTypeCode =  PAGEURL.split("?")[1].split("=")[1];
			
		}		
	}else{//评审
		
		tenderTypeCode = 0;		
	}	
   sessionStorage.setItem('tenderTypeCode', tenderTypeCode);//0是询比采购  6是单一来源采购，并缓存	
  
   initTable();
   // 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'project.projectName': $("#projectName").val(),
		'project.projectCode': $("#projectCode").val(),
		'project.packageName': $("#packageName").val(),
		'project.packageNum': $("#packageNum").val(),
		'purchaserName': $("#purchaserName").val(),
		'enterpriseType':'06',
		'project.tenderType':tenderTypeCode,
		
	}
};
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:urlPurchaseList,// 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		height:top.tableHeight,
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			id=row.id;
			projectId=row.peojectId;
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
			field: 'project.projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		},{
			field: 'project.projectName',
			title: '项目名称',
			align: 'left',			
			width: '250'
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		},{
			field: 'packageName',
			title: '包件名称',
			width: '250',
			formatter:function(value, row, index){
				if(row.packageSource == 1) {
					return row.packageName + '<span class="text-danger">(重新采购)</span>'
				} else if(row.packageSource == 0) {
					return row.packageName
				}
				
			}
		},{
			field: 'purchaserName',
			title: '采购人',
			align: 'left'
		},{
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
			    if(row.examType == 0){
					return "资格预审";
			    }else{
			    	return "资格后审";
			    }
			}
		},{
			field: 'noticeStartDate',
			title: '公告开始时间',
			align: 'center',
			width: '180'
		},{
			field: 'noticeEndDate',
			title: '公告截止时间',
			align: 'center',
			width: '180'
		},
		{
			field:'',
			title:'操作',
			align: 'center',
			width: '120',
			events: operateEvents,
  			formatter: operateFormatter
		}
		],
	})
};

function operateFormatter(value, row, index) {
   return [
   '<button class="RoleOfedit btn btn-primary btn-xs" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看</button>',
   ].join('');
 }


window.operateEvents = {
    'click .RoleOfedit': function (e, value, row, index) {
    	showPurchaseInfo(index);
     }
   };

//查看页面
function showPurchaseInfo($index){
	//存储
	
	//sessionStorage.setItem("PurchaseData",JSON.stringify(obj));
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('purchaseaDataId', JSON.stringify(rowData[$index].projectId));//获取当前选择行的数据，并缓存	
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:tenderTypeCode==0?'查看询比采购公告':'单一来源采购公告'
        ,area: ['1100px', '650px']
        ,maxmin: true //开启最大化最小化按钮
        ,content:urlPurchaseInfo
        ,success:function(layero,index){
        	iframeWin=layero.find('iframe')[0].contentWindow;  
        	iframeWin.Purchase(rowData[$index].projectId)
        	iframeWin.du(rowData[$index].packageId,rowData[$index].examType)
        	//iframeWin.findpackage(obj.projectId);
        	//iframeWin.findpackageDetail();
        }
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow; 
          parent.layer.close(index);
        },
     });
};