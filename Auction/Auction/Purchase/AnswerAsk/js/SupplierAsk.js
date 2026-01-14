var searchUrl = config.AuctionHost + '/AuctionPurchaseController/findAuctionPurchaseForAsk.do'; //查询质疑

var checkboxed = "";
//页面加载后显示
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#PurchaseAsk').bootstrapTable('refresh', {
			url: searchUrl
		});
	});

});

window.operateEvents = { //添加一个按钮对应的事件
	"click #btn_add": function(e, value, row, index) {

		layer.open({
			type: 2 //此处以iframe举例
				,
			title: '提问',
			maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			scrollbar: false,
			resize: false, //是否允许拉伸
			area: ['700px', '600px'],
			content: '0502/Auction/AnswerAsk/CommitAsk.html',
			btn: ['提交', '取消']
				//确定按钮
				,
			yes: function(index, layero) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				
				if(iframeWin.$("#askTitle").val().length > 100){
					layer.msg("提问标题不能超过100字");
					return ;
				 }
				
				if(iframeWin.$("#askTitle").val().length == 0){
					layer.msg("提问标题不能为空");
					return ;
				 }
				 if(iframeWin.$("#askContent").val().length > 1000){
					layer.msg("提问内容不能超过1000字");
					return ;
				 }
				 
				 if(iframeWin.$("#askContent").val().length == 0){
					layer.msg("提问内容不能为空");
					return ;
				 } 
				 
				
				iframeWin.Ti()        
			},
			btn2: function() {

			},
			success: function(layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.$("#projectName").text(row.project.projectName);
				iframeWin.$("#projectId").val(row.projectId);
			}
		});

	},
	"click #btnShow": function(e, value, row, index) {
		var height = top.$(window).height() * 0.8;
		var width = top.$(window).width() * 0.8;
		layer.open({
			type: 2,
			title: '查看澄清',
			area: [width + 'px', height + 'px'],
			maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: '0502/Auction/AnswerAsk/Ask.html',
			success: function(layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var data = {
					projectName: row.project.projectName,
					projectCode: row.project.projectCode,
					askEndDate: row.askEndDate,
					answersEndDate: row.answersEndDate,
					projectSource:row.project.projectSource,
				};
				iframeWin.setProjectInfo(data);
				iframeWin.initTable(row);
			}
		});
	}
}

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	if($("#checkState").val() == '0' || $("#checkState").val() == '') {
		return [
			'<a href="javascript:void(0)" id="btn_add" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-pencil " aria-hidden="true"></span>提问</a>&nbsp;&nbsp;',
			'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看</a>',
		].join("")
	} else {
		return [
			'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看</a>',
		].join("")
	}
}

//加载数据
$("#PurchaseAsk").bootstrapTable({
	url: searchUrl,
	dataType: 'json',
	method: 'get',
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
	queryParamsType: "limit",
	onCheck: function(row) {
		checkboxed = row.id;
	},
	queryParams: function(params) {
		var paramData = {
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			askAnswerTime: $("#checkState").val(),
			enterpriseType: "1",
			'project.projectName': $("#projectName").val(),
			'project.tenderType': "1", //竟低价采购
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
					var pageSize = $('#PurchaseAsk').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#PurchaseAsk').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
				    if(row.isPublic>1){
				    	if(row.project.projectSource==1){
				    		return row.project.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}else if(row.project.projectSource==0){
				    		return row.project.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}
				    	
				    }else{
				    	if(row.project.projectSource==1){
				    		return row.project.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span>'
				    	}else if(row.project.projectSource==0){
				    		return row.project.projectName
				    	}			    	
				    }
				}
			},
			{
				field: 'askEndDate',
				title: '提出澄清截止时间',
				align: 'centrt',
				width: '180'
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
				width: '160px',
				formatter: AddFunction, //表格中添加按钮
				events: operateEvents, //给按钮注册事件

			},

		]
	]
});

//提问状态的改变
$("#checkState").change(function() {

	$('#PurchaseAsk').bootstrapTable('refresh', {
		url: searchUrl
	});

});