var searchUrl = config.AuctionHost +"/ProjectViewsController/findProjectCheckList.do";
var urlHistoryInfo = 'bidPrice/ProjectCheck/modal/SaleOfferHistoryInfo.html';
var urlOfferViewInfo = 'bidPrice/ProjectCheck/modal/SaleOfferViewInfo.html';
//查询按钮
$("#btnSearch").on('click', function() {
	$('#AuctionSuperviseList').bootstrapTable('refresh');
});

$("#checkStatus").on('change', function() {
	$('#AuctionSuperviseList').bootstrapTable('refresh');
});


function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	if(row.checkState=='2' ){//已提交状态
		
		return [
			'<a href="javascript:void(0)" id="btnCheck" onclick=btnButton("'+row.projectId+'","'+row.packageId+'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>审核</a>&nbsp;&nbsp;',
		].join("")
		
	}else{
		if(row.auctionStatus == '已结束'){
			return [
				'<a href="javascript:void(0)" id="btnShowLast" onclick=btnButton("'+row.projectId+'","'+row.packageId+'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
			].join("")
		}else{
			return [
				'<a href="javascript:void(0)" id="btnShow" onclick=btnButton("'+row.projectId+'","'+row.packageId+'")  class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
			].join("")
		}
	}
}

function btnButton(projectId,packageId){
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			tenderType: "2", //竟高价采购
			workflowType : 'jjqk',
			projectId : projectId,
			packageId : packageId
			
		},
		dataType: "json",
		async: false,
		success: function(data) {
			if(data.success){
				var result = data.rows[0];
				if(result.checkState=='2' ){//已提交状态
					var height = top.$(window).height() * 0.9;
					var width = top.$(window).width() * 0.8;
					layer.open({
						type: 2,
						title: '竞卖详情审核',
						area: [width + 'px', height + 'px'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						content: urlHistoryInfo + '?projectId=' + result.projectId + '&packageId=' + result.packageId +'&id='+result.id+ '&type='+"check"+ "&tender=2"
					});
					
				}else{
					if(result.auctionStatus == '已结束'){
						var height = top.$(window).height() * 0.9;
						var width = top.$(window).width() * 0.8;
						layer.open({
							type: 2,
							title: '竞卖详情',
							area: [width + 'px', height + 'px'],
							maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							resize: false, //是否允许拉伸
							content: urlHistoryInfo + '?projectId=' + result.projectId + '&packageId=' + result.packageId+'&id='+result.id + '&type='+"look"+ "&tender=2"
						});
					}else{
						if(result.auctionStatus == '未开始'){
							layer.alert("竞价未开始!");
							return;
						}
						
						var height = top.$(window).height() * 0.9;
						var width = top.$(window).width() * 0.8;
						layer.open({
							type: 2,
							title: '竞卖详情',
							area: [width + 'px', height + 'px'],
							maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							resize: false, //是否允许拉伸
							content: urlOfferViewInfo + '?projectId=' + result.projectId + '&packageId=' + result.packageId+'&id='+result.id + '&type='+"look"
						});
					}
				}
			}
		}
	})
}


$("#AuctionSuperviseList").bootstrapTable({
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
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: function(params) {
		var paramData = {
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			checkState: $("#checkStatus").val(),
			//enterpriseType: "0",
			workflowType : 'jjqk',
			tenderType: "2", //竞卖
			projectName: $("#projectName").val(),
			projectCode: $("#projectCode").val(),
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
					var pageSize = $('#AuctionSuperviseList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#AuctionSuperviseList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectCode',
				title: '项目编号',
				align: 'left',
				
			},
			{
				field: 'projectName',
				title: '项目名称',
				align: 'left',
				formatter:function(value, row, index){
					if(row.projectSource==1){
						var count = row.projectSourceCount;
						if(count){
							return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
						}else{
							return value+' <span class="text-danger">(重新采购)</span>';
						}
					}else{
						return value;
					}
					
				}
				// formatter: function(value, row, index) {
				// if(row.projectSource == 1) {
				// 		var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span>'
				// 	} else {
				// 		var projectName = row.projectName;
				// 	}
				// 	return projectName;
				// }
			},
			{
				field: 'checkStatus',
				title: '审核状态',
				align: 'left',
				width: '100',
				formatter: function(value, row, index) {
					if(row.checkState == '3'){
						return "<span>审核通过</span>";
					}else if(row.checkState == '4'){
						return "<span>审核未通过</span>";
					}else if(row.checkState == '2'){
						return "<span>未审核</span>";
					}else{
						return "<span>未提交</span>";
					}		
				}
			},
			{
				field: 'Button',
				title: '操作',
				align: 'center',
				width: '110',
				formatter: AddFunction, //表格中添加按钮
				//events: operateEvents, //给按钮注册事件

			},

		]
	]
});