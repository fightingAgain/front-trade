var searchUrl = config.AuctionHost + '/AuctionProjectPackageController/pagePurchaseList.do';
var urlHistoryInfo = 'Auction/Auction/Agent/AuctionProjectPackage/model/OfferHistoryInfo.html';
var urlOfferSetInfo = 'Auction/Auction/Agent/AuctionProjectPackage/model/OfferSetInfo.html';
var urlOfferViewInfo = 'Auction/Auction/Agent/AuctionProjectPackage/model/OfferViewInfo.html';
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
$(function(){
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function () {
		$('#OfferList').bootstrapTable('destroy');
		initTable()
	});

	$("#checkStatus").on('change', function () {
		$('#OfferList').bootstrapTable('destroy');
		initTable()
	});
})

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	var createType = row.createType || 0;
	//findNewInfo(row);
	if (row.auctionStatus == '已结束') {

		if (row.checkStatus == '未提交') {
			//已结束,未提交
			return [
				'<button type="button"  id="btnCommit" class="btn-xs btn btn-primary" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '") ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>提交</button>',
			].join("")
		}

		return [
			'<button type="button" id="btnShow" class="btn-xs btn btn-primary" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '") ><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看历史</button>',
		].join("")
	}

	if (row.auctionStatus == '竞价中') {
		return [
			'<button type="button" id="btnView" class="btn-xs btn btn-primary" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '") ><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
		].join("")
	}

	if (row.auctionStatus == '未开始') {
		return [
			'<button type="button" id="btnSet" class="btn-xs btn btn-primary" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '") ><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>设置</button>',
		].join("")
	}
}

function btnButton(projectId, packageId, creType) {
	
	$.ajax({
		url: findOneInfo,
		type: "post",
		data: {
			enterpriseType: "02",
			tenderType: "1", //竟低价采购
			projectId: projectId,
			packageId: packageId

		},
		dataType: "json",
		async: false,
		success: function (data) {		
			var result = data.data;
			var htmlUrl
			if (result.auctionStatus == '已结束') {
				if (result.checkStatus == '未提交') {
					var checkStatus = 1
					//已结束,未提交
					if (result.auctionType == 6) {
						htmlUrl = 'Auction/Auction/Agent/AuctionProjectPackage/model/detailListHistoryMsg.html?projectId=' + projectId + '&id=' + packageId + '&type=commit&createType=' + creType
					} else if (result.auctionType == 7) {
						htmlUrl = "Auction/Auction/Agent/AuctionProjectPackage/model/singleBidHistory.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1"
					} else {
						htmlUrl = urlHistoryInfo + '?projectId=' + projectId + '&id=' + packageId + '&type=commit&createType=' + creType
					}
				} else {
					var checkStatus = 0
					if (result.auctionType == 6) {
						htmlUrl = 'Auction/Auction/Agent/AuctionProjectPackage/model/detailListHistoryMsg.html?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType
					} else if (result.auctionType == 7) {
						htmlUrl = "Auction/Auction/Agent/AuctionProjectPackage/model/singleBidHistory.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1"
					} else {
						htmlUrl = urlHistoryInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType
					}
				}
				if (result.auctionType == 6 || result.auctionType == 7) {
					var url = config.AuctionHost + "/AuctionSfcOfferController/getAuctionOfferesCount.do"
					if (result.auctionType == 7) {
						url = config.AuctionHost + "/AuctionSfcSingleOfferesController/getAuctionOfferesCount.do"
					}
					$.ajax({
						type: "post",
						url: url,
						data: {
							projectId: projectId,
							packageId: packageId
						},
						dataType: "json",
						success: function (response) {
							if (response.success) {
								if (response.data.offerCount < 3) {
									if (response.data.supplierCountConfig == 1 || response.data.supplierCountConfig == 2) {
										layer.open({
											type: 2,
											title: '竞价采购历史详情',
											area: ['100%', '100%'],
											maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
											resize: false, //是否允许拉伸
											id: 'packageclass',
											content: htmlUrl,
											success: function (layero, index) {
												var body = layer.getChildFrame('body', index);
												var iframeWin = layero.find('iframe')[0].contentWindow;
											}
										});
									} else {
										layer.open({
											type: 2,
											title: '不足三家设置',
											area: ['600px', '600px'],
											maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
											resize: false, //是否允许拉伸
											// id: 'packageclass',
											content: 'Auction/Auction/Agent/AuctionProjectPackage/model/notThreeSetUp.html?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType + '&offerCount=' + response.data.offerCount + '&creType=' + creType + '&checkStatus=' + checkStatus,
											success: function (layero, index) {
												var body = layer.getChildFrame('body', index);
												var iframeWin = layero.find('iframe')[0].contentWindow;
											}
										});
									}

								} else {
									layer.open({
										type: 2,
										title: '竞价采购历史详情',
										area: ['100%', '100%'],
										maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
										resize: false, //是否允许拉伸
										id: 'packageclass',
										content: htmlUrl,
										success: function (layero, index) {
											var body = layer.getChildFrame('body', index);
											var iframeWin = layero.find('iframe')[0].contentWindow;
										}
									});
								}
							}
						},
						error:function(){
							
						}
					});
				} else {
					layer.open({
						type: 2,
						title: '竞价采购历史详情',
						area: ['100%', '100%'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						id: 'packageclass',
						content: htmlUrl,
						success: function (layero, index) {
							var body = layer.getChildFrame('body', index);
							var iframeWin = layero.find('iframe')[0].contentWindow;
						}
					});
				}
			}

			if (result.auctionStatus == '竞价中') {

				sessionStorage.setItem("rowList", JSON.stringify(result));
				if (result.auctionType == 6) {
					layer.open({
						type: 2,
						title: '竞价采购详情',
						area: ['1100px', '600px'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						id: 'packageclass',
						content: 'Auction/Auction/Agent/AuctionProjectPackage/model/detailListMsg.html' + '?projectId=' + projectId + '&id=' + packageId,
						success: function (layero, index) {
							var body = layer.getChildFrame('body', index);
							var iframeWin = layero.find('iframe')[0].contentWindow;
						}
					});
				} else {

					layer.open({
						type: 2,
						title: '竞价采购详情',
						area: ['1100px', '600px'],
						maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
						resize: false, //是否允许拉伸
						id: 'packageclass',
						content: urlOfferViewInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType
					});
				}

			}

			if (result.auctionStatus == '未开始') {
				parent.layer.open({
					type: 2 //此处以iframe举例
					,
					title: '竞价采购设置',
					area: ['1100px', '600px'],
					maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					,
					resize: false //是否允许拉伸
					,
					id: 'packageclass',
					content: urlOfferSetInfo + '?createType=' + creType + '&id=' + packageId + '&projectId=' + projectId,
					success: function (layero, index) {
						iframeWin = layero.find('iframe')[0].contentWindow;
					}
				});
			}

		},
		error:function(){
			
		}
	})
}


function initTable(){
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
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: function (params) {
			var paramData = {
				pageSize: params.limit,
				pageNumber: (params.offset / params.limit) + 1, //页码
				checkStatus: $("#checkStatus").val(),
				enterpriseType: "02",
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
				formatter: function (value, row, index) {
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
				formatter: function (value, row, index) {
					if (row.projectSource == 1) {
						var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新竞价)</span>'
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
					if(row.isStopCheck == 1){
						return '<span style="color:red">项目失败</span>';
					} else {
						return value ? '<span style="color:' + (value == "未开始" || value == "已结束" ? "red" : "green") + '">' + value +
						'</span>' : '';
					}
				}
			},
			{
				field: 'checkStatus',
				title: '业主代表审核状态',
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

}

//设置页面信息
function showOffer(obj) {
	parent.layer.open({
		type: 2 //此处以iframe举例
		,
		title: '竞价采购设置',
		area: ['1100px', '600px'],
		maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,
		resize: false //是否允许拉伸
		,
		content: urlOfferSetInfo,
		id: 'packageclass',
		success: function (layero, index) {
			iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.OfferSetInfo(obj);
		}
	});
}