var urlPurchaseList = config.Syshost+'/projectEntrustController/findProject.do';
var viewpackage='bidPrice/AppointManager/appointInfo.html';
var viewBiddingPackage='Bidding/AppointManager/appointInfo.html';
var detailBiddingPackage = 'Bidding/AppointManager/appointInfoDetail.html';
//表格初始化
$(function(){
    $('#startDate').datetimepicker({
        step:5,
        lang:'ch',
        format: 'Y-m-d',
        formatDate:'Y-m-d',
        timepicker: false,
        datepicker: true
    });
    $('#endDate').datetimepicker({
        step:5,
        lang:'ch',
        format: 'Y-m-d',
        formatDate:'Y-m-d',
        timepicker: false,
        datepicker: true
    });

    $(".clearTime").click(function(){
        $(this).parent().find("input").val("");
    });
	initTable(); 
	
	
});
//设置查询条件
function queryParams(params) {
    return {
        'pageNumber':params.offset/params.limit+1,//当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset':params.offset, // SQL语句偏移量
        'projectName': $("#projectName").val(),
        'startDate': $("#startDate").val(),
        'endDate': $("#endDate").val(),
        'packageState': $("#packageState").val(),
        'dataTenderType':top.TENDERTYPE
    }
};
// 搜索按钮触发事件
$("#btnSearch").click(function() {
	
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
$("#packageState").change(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
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
			field: 'projectName',
			title: '项目名称',
			align: 'left',
		},{
			field: 'tenderType',
			title: '项目类型',
			formatter:function(value, row, index){
				if(value==0){
					return '询比采购';
				}else if(value==1){
					return '竞价采购';
				}else if(value==2){
					return '竞卖';
				}else if(value==4){
                    return "招标采购";
                }else if(value==6){
					return '单一来源采购';
				}
			}
		},
        {
			field: 'enterpriseName',
			title: '委托代理机构名称',
			
        },
        {
			field: 'projectManagerName',
			title: '项目经理',
			
		},{
                field: 'createDate',
                title: '创建时间'
            },
		{
			field:'appointState',
			title:'操作',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
                var Tdr="";
                if(row.appointState!=1){
                    Tdr='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=appointBtn(\"'+ index +'\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>项目指派</a>'
                } else{
                    Tdr='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=appointDetailBtn(\"'+ index +'\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>查看</a>'
                }
                return Tdr
            }
		}
		],
	})
};

function appointBtn($index){
    var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    var tenderType = rowData[$index].tenderType;
    var htmlUrl = null;
    if (tenderType == '4') {
        htmlUrl = viewBiddingPackage;
    }else{
        htmlUrl = viewpackage;
    }
    parent.layer.open({
         type: 2 //此处以iframe举例
        ,title: '查看公告'
        ,area: ['1100px', '650px']
        ,maxmin: true//开启最大化最小化按钮
        ,content:htmlUrl+'?projectId='+rowData[$index].projectId+'&id='+rowData[$index].id
        ,success:function(layero,index){
            var iframeWind = layero.find('iframe')[0].contentWindow;
        }
    });
}

function appointDetailBtn($index){
    var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看公告'
        ,area: ['1100px', '650px']
        ,maxmin: true//开启最大化最小化按钮
        ,content:detailBiddingPackage+'?projectId='+rowData[$index].projectId+'&id='+rowData[$index].id
        ,success:function(layero,index){
            var iframeWind=layero.find('iframe')[0].contentWindow;
        }
    });
}


