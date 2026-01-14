var urlPurchaseList = config.bidhost+'/BidFileController/findFileChangePageList.do';
var iframeWinAdd="";
var tenderTypeCode;
var examTypeCode;
var changeCode;
/*var uploadpackage= 'Auction/common/Agent/Purchase/model/fileInfo.html?type=upload';
var viewpackage= 'Auction/common/Agent/Purchase/model/fileInfo.html?type=view'; */

//表格初始化
$(function(){
	if(PAGEURL.split("?")[1]!=undefined &&　PAGEURL.split("?")[1] != ""){
		if(PAGEURL.split("?")[1].split("&")[0].split("$")[0].split("=")[0]=="examType"){		
			examTypeCode= PAGEURL.split("?")[1].split("&")[0].split("=")[1];			
		}else{			
			examTypeCode=1;	
		}
	}else{	
			examTypeCode=0;
	}
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
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'packageName': $("#packageName").val(),
		'packageNum': $("#packageNum").val(),
		'enterpriseType':'04',
		'examType':examTypeCode,
		'tenderType':0,
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
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
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
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		},{
			field: 'projectName',
			title: '项目名称',
			align: 'left',
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		},{
			field: 'packageName',
			title: '包件名称',
			formatter:function(value, row, index){
				if(row.packageSource==1){
					return value+'<div class="text-danger">(重新采购)</div>';
				}else{
					return value;
				}
				
			}
		},{
			field: 'subCount',
			title: '文件状态',
			width: '100',
			align: 'center',
			formatter:function(value, row, index){
				return "<span class='red'>已变更</span>";
			}
			
		},{
			field: 'fileState',
			title: '审核状态',
			width: '100',
			align: 'center',
			formatter:function(value, row, index){
				//0为未审核，1为审核中，2为审核通过，3为审核不通过
				if(value == '0')return '未审核';
				if(value == '1')return '审核中';
				if(value == '2')return "<span style='color:green;'>审核通过</span>";
				if(value == '3')return "<span class='red'>审核不通过</span>";
			}
			
		},{
			field:'',
			title:'操作',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				
				var Tdr='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=fileView(\"'+ index +'\")>查看</a>';
	     		return Tdr;
				
			}
		}
		],
	}) 
};


//查看文件
function fileView($index){
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看文件变更记录'
        ,area: ['80%', '80%']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Purchase/Purchase/model/fileChangeInfo.html?projectId='+rowData[$index].projectId+'&packageId='+rowData[$index].packageId+'&examType=' + examTypeCode + '&keyId='+rowData[$index].id
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow;    
        }
    });
};
