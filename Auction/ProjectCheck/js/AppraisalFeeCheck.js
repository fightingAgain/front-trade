var urlPurchaseList=top.config.AuctionHost+'/WorkflowAcceptController/findProjectCheckList.do';//分页列表
var viewcheckPrice='bidPrice/ProjectCheck/modal/AppraisalFeeCheckInfo.html'
$(function(){
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {	
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
	});
	$("#projectState").change(function() {	
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
	});
})
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'packageName':$("#packageName").val(),
        'packageNum':$("#packageNum").val(),
        'workflowType': 'psfsh',
		'projectState':0,
	}
};


function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlPurchaseList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
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
				width: '180'
			},{
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '180'
			},{
				field: 'packageName',
				title: '包件名称',
				align: 'left',
				width: '180'
			},
			{
				field: 'checkState',
				title: '审核状态',
				align: 'left',
				width: '180',
				formatter: function(value, row, index) {
                    if(value == "0") {
                        return "<div class='text-info'>未审核</div>"
                    } else if(value == "1") {
                        return "<div class='text-warning'>待审核</div>"
                    } else if(value == "2") {
                        return "<div class='text-success'>审核通过</div>"
                    } else if(value == "3") {
                        return "<div class='text-danger'>审核未通过</div>"
                    }
                }
			},{
				field: 'ss',
				title: '操作',
				align: 'center',
				width: '200',
				events:{					
					'click .view':function(e,value, row, index){
						parent.layer.open({
							type: 2 //此处以iframe举例
								,
							title: '查看评审费',
							area: ['100%', '100%'],
							maxmin: true //开启最大化最小化按钮
								,
							content: viewcheckPrice+'?id='+row.id+'&type=VIEW',
							success: function(layero, index) {
								var iframeWind = layero.find('iframe')[0].contentWindow;
								
							},	
						});
					},
					'click .edit':function(e,value, row, index){
						parent.layer.open({
							type: 2 //此处以iframe举例
								,
							title: '评审费审核',
							area: ['100%', '100%'],
							maxmin: true //开启最大化最小化按钮
								,
							content: viewcheckPrice+'?id='+row.id+'&type=EDIT',
							success: function(layero, index) {
								var iframeWind = layero.find('iframe')[0].contentWindow;
								
							},	
						});
					},
				},
				formatter: function(value, row, index) {
					var Tdr = "";
					if(row.checkState==0){
						Tdr += '<button type="button" class="btn btn-sm btn-primary edit"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>审核</button>' 						
					}else{
						Tdr += '<button type="button" class="btn btn-sm btn-primary view"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</button>';	
					}
					return Tdr
				}
			}
           			
		],
	})
};