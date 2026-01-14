var searchUrl = config.AuctionHost + '/AuctionProjectPackageController/pagePurchaseList.do';
var urlHistoryInfo = 'Auction/Auction/Purchase/AuctionProjectPackage/model/OfferHistoryInfo.html';
var urlOfferSetInfo = 'Auction/Auction/Purchase/AuctionProjectPackage/model/OfferSetInfo.html';
var urlOfferViewInfo = 'Auction/Auction/Purchase/AuctionProjectPackage/model/OfferViewInfo.html';
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
//查询按钮
$("#btnSearch").on('click', function() {
	$('#OfferList').bootstrapTable('refresh');
});

$("#checkStatus").on('change', function() {
	$('#OfferList').bootstrapTable('refresh');
});
function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中	
	//findNewInfo(row);
	if(row.auctionStatus == '已结束') {

		if(row.checkStatus == '未提交') {			
			//已结束,未提交
			return [
				'<a href="javascript:void(0)"  id="btnCommit" class="btn-sm btn-primary" onclick=btnButton("'+row.projectId+'","'+row.id+'","'+(row.enterpriseId || "")+'","'+(row.pEnterpriseId || "")+'") style="text-decoration:none" ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>&nbsp;&nbsp;&nbsp;提&nbsp;交&nbsp;&nbsp;&nbsp;</a>&nbsp;&nbsp;',
			].join("")
		}

		return [
			'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" onclick=btnButton("'+row.projectId+'","'+row.id+'","'+(row.enterpriseId || "")+'","'+(row.pEnterpriseId || "")+'") style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看历史</a>&nbsp;&nbsp;',
		].join("")
	}

	if(row.auctionStatus == '竞价中') {
		return [
			'<a href="javascript:void(0)" id="btnView" class="btn-sm btn-primary" onclick=btnButton("'+row.projectId+'","'+row.id+'","'+(row.enterpriseId || "")+'","'+(row.pEnterpriseId || "")+'") style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;&nbsp;&nbsp;查&nbsp;看&nbsp;&nbsp;&nbsp;</a>&nbsp;&nbsp;',
		].join("")
	}

	if(row.auctionStatus == '未开始') {
		return [
			'<a href="javascript:void(0)" id="btnSet" class="btn-sm btn-primary" onclick=btnButton("'+row.projectId+'","'+row.id+'","'+(row.enterpriseId || "")+'","'+(row.pEnterpriseId || "")+'") style="text-decoration:none" ><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;&nbsp;&nbsp;设&nbsp;置&nbsp;&nbsp;&nbsp;</a>&nbsp;&nbsp;',
		].join("")
	}
}

function btnButton(projectId,packageId,eid,pid){
	$.ajax({
		url: findOneInfo,
		type: "post",
		data: {
			enterpriseType: "04",
			tenderType: "1", //竟低价采购
			projectId : projectId,
			packageId : packageId
			
		},
		dataType: "json",
		async: false,
		success: function(data) {
			var result = data.data;
			if(result.auctionStatus == '已结束') {

				if(result.checkStatus == '未提交') {
					//已结束,未提交
					layer.open({
						type: 2,
						title: '竞价采购详情',
						area: [ '1100px',  '600px'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						id:'packageclass',
						content: urlHistoryInfo + '?projectId=' + projectId + '&packageId=' + packageId + '&type=' + 'commit',
						success:function(layero, index){
				        	var body = layer.getChildFrame('body', index);    
				            var iframeWin=layero.find('iframe')[0].contentWindow;
				            result.eid = eid;
				            result.pid = pid;
				            iframeWin.getMsg(result);
						}
					});
					
				}else{
					layer.open({
						type: 2,
						title: '竞价采购历史详情',
						area: [ '1100px',  '600px'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						id:'packageclass',
						content: urlHistoryInfo + '?projectId=' + projectId+ '&packageId=' +packageId,
						success:function(layero, index){
				        	var body = layer.getChildFrame('body', index);    
				            var iframeWin=layero.find('iframe')[0].contentWindow;
				            result.eid = eid;
				            result.pid = pid;
				            iframeWin.getMsg(result);
						}
					});
					
				}
			}
		
			if(result.auctionStatus == '竞价中') {
				
				sessionStorage.setItem("rowList", JSON.stringify(result));
				layer.open({
					type: 2,
					title: '竞价采购详情',
					area: [ '1100px',  '600px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					content: urlOfferViewInfo + '?projectId=' + projectId + '&packageId=' + packageId
				});
				
			}
		
			if(result.auctionStatus == '未开始') {
				parent.layer.open({
					type: 2 //此处以iframe举例
						,
					title: '竞价采购设置',
					area: [ '1100px',  '600px'],
					maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						,
					resize: false //是否允许拉伸
						,
					content: urlOfferSetInfo,
					success: function(layero, index) {
						iframeWin = layero.find('iframe')[0].contentWindow;
						iframeWin.OfferSetInfo(result);
					}
				});
			}
			
		}
	})
}



//加载数据
$("#OfferList").bootstrapTable({
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
	pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: function(params) {
		var paramData = {
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			checkStatus: $("#checkStatus").val(),
			enterpriseType: "04",
			tenderType: "1", //竟低价采购
			projectName: $("#projectName").val(),
			projectCode: $("#projectCode").val()
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
					var pageSize = $('#OfferList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#OfferList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectCode',
				title: '项目编号',
				align: 'left',
				width: '180'

			},
			{
				field: 'projectName',
				title: '项目名称',
				align: 'left',
				formatter: function(value, row, index) {
					if(row.projectSource == 1) {
						var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span>'
					} else {
						var projectName = row.projectName
					}
					return projectName
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
				align: 'left'
			},
			{
				field: 'auctionStatus',
				title: '竞价状态',
				align: 'left',
				width: '100',
				formatter:function(value, row, index){
					return value ? '<span style="color:' + (value == "未开始" || value == "已结束" ? "red" : "green") + '">' + value +
						'</span>' : '';
				}
			},
			{
				field: 'checkStatus',
				title: '审核状态',
				align: 'left',
				width: '100',
				formatter:function(value, row, index){
					return value ? '<span style="color:' + (value == "未提交" ||value=="未审核"? "red" : "green") + '">' + value +
						'</span>' : '';
				}
			},
			{
				field: 'Button',
				title: '操作',
				align: 'center',
				width: '140',
				formatter: AddFunction, //表格中添加按钮
				//events: operateEvents, //给按钮注册事件

			},

		]
	]
});

//设置页面信息
function showOffer(obj) {	
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '竞价采购设置',
		area: [ '1100px',  '600px'],
		maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			,
		resize: false //是否允许拉伸
			,
		content: urlOfferSetInfo,
		success: function(layero, index) {
			iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.OfferSetInfo(obj);
		}
	});
}