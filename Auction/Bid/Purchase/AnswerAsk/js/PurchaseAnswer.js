var searchUrl = config.bidhost + '/PurchaseController/findPurchaseForAsk.do';
var examTypeCode;
var inviteStateCode;


$(function() {
	//页面加载后显示
	if(PAGEURL.split("?")[1] != undefined){		
		if(PAGEURL.split("?")[1].split("=")[0] == "examType"){ //项目预审
			examTypeCode = PAGEURL.split("?")[1].split("=")[1];	
		}
	}else{//评审
		examTypeCode = 1;
	}
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#PurchaseAnswer').bootstrapTable('destroy');
		initTable()
	})
	//提问状态的改变
	$("#checkState").change(function() {
		$('#PurchaseAnswer').bootstrapTable('destroy');
		initTable()
	});
});


window.operateEvents = { //添加一个按钮对应的事件
	
	"click #btnShow": function(e, value, row, index) {
		
		layer.open({
			type: 2,
			title: '查看澄清',
			area: ["1100px", "600px"],
			// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/common/Purchase/AnswerAsk/Answer.html?examType=' + examTypeCode +"&projectId="+row.projectId+"&id="+row.packageId+"&createType="+row.createType,
			success: function(layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				
			}
		});
	}
}

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	return [
		'<button type="button" id="btnShow" class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
	].join("")
}
function initTable(){
	//加载数据
	$("#PurchaseAnswer").bootstrapTable({
		url: searchUrl,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		clickToSelect: true, //是否启用点击选中行
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: function(params) {
			var paramData = {
				pageSize: params.limit,
				pageNumber: (params.offset / params.limit) + 1, //页码
				askAnswerTime: $("#checkState").val(),
				enterpriseType: '04',
				'project.projectName': $("#projectName").val(),
				'project.packageName': $("#packageName").val(),
				'tenderType': 0, //询比采购
				examType:examTypeCode,
			};
			return paramData;
		},
		striped: true,
		columns: [
			[{
					field: 'Id',
					title: '序号',
					align: 'center',
					width: '50px',
					formatter: function(value, row, index) {
						var pageSize = $('#PurchaseAnswer').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#PurchaseAnswer').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				},
				{
					field: 'project.projectCode',
					title: '采购项目编号',
					align: 'left',
					width: '180'
				},
				{
					field: 'project.projectName',
					title: '采购项目名称',
					align: 'left',
					formatter:function(value, row, index){
						if(row.project.projectSource==1){
			
								var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.project.projectName +'<span class="text-danger"  style="font-weight:bold">(重新采购)</span></div>';		
								
						
						}else{
							var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.project.projectName +'</div>';
						}						
						return projectName;
					}
				},
				{
					field: 'packageNum',
					title: '包件编号',
					align: 'left',
					width: '180'
				},
				{
					field: 'packageName',
					title: '包件名称',
					align: 'left',
					formatter:function(value, row, index){
						if(row.packageSource==1){
							return value+'<div class="text-danger">(重新采购)</div>';
						}else{
							return value;
						}
						
					}
				},
				{
					field: 'answersEndDate',
					title: '答复截止时间',
					align: 'center',
					width: '180'
				},
				{
					field: 'askCount',
					title: '提问数',
					align: 'left',
					width: '100'
				},
				{
					field: 'answerCount',
					title: '回复数',
					align: 'left',
					width: '100'
				},
				{
					field: 'Button',
					title: '操作',
					align: 'center',
					width:'160px',
					formatter: AddFunction, //表格中添加按钮
					events: operateEvents, //给按钮注册事件

				},

			]
		]
	});
}


