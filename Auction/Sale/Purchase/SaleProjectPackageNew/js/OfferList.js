var searchUrl = config.AuctionHost + '/AuctionProjectPackageController/pagePurchaseList.do';
var urlHistoryInfo = 'Auction/Sale/Purchase/SaleProjectPackageNew/model/OfferHistoryInfo.html';
var urlOfferSetInfo = 'Auction/Sale/Purchase/SaleProjectPackage/model/OfferSetInfo.html';
var urlOfferViewInfo = 'Auction/Sale/Purchase/SaleProjectPackageNew/model/OfferViewInfo.html';
var urlWasteOfferViewInfo = 'Auction/AuctionOffer/Purchase/AuctionProjectPackage/OfferList.html';
var findOneInfo = config.AuctionHost + "/AuctionProjectPackageController/findOnePurchase.do";
var urlJMHistoryInfo = 'Auction/Sale/Purchase/SaleProjectPackage/model/JMOfferHistoryInfo.html';
var urlPrice = config.AuctionHost + "/AuctionProjectPackageController/isContinue";
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#OfferList').bootstrapTable('destroy');
		initTable()
	});

	$("#checkStatus").on('change', function() {
		$('#OfferList').bootstrapTable('destroy');
		initTable()
	});
})
var eid = "";
var pid = "";

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中

	var createType = row.createType || 0;
	if(row.isStopCheck == 1){
		createType = 1;
		return [
			'<button type="button" id="btnShow" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '","' + row.isAgent + '") class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看历史</button>',
		].join("")
	}else{
		if(row.auctionStatus == '已结束') {
		
			if(row.checkStatus == '未提交') {
				//已结束,未提交
				return [
					'<button type="button" id="btnCommit" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '","' + row.isAgent + '") class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>提交</button>',
				].join("")
			}
		
			if(row.pEnterpriseId && row.enterpriseId) {
				eid = row.enterpriseId;
				pid = row.pEnterpriseId;
			}
			return [
				'<button type="button" id="btnShow" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '","' + row.isAgent + '") class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看历史</button>',
			].join("")
		}
		
		if(row.auctionStatus == '竞卖中') {
			return [
				'<button type="button" id="btnView" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '","' + row.isAgent + '") class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
			].join("")
		}
		
		if(row.auctionStatus == '未开始') {
			if(row.isShow == 0) {
				return [
					'<button type="button" id="btnPrice" class="btn-xs btn btn-primary" onclick=btnPrice("' + index + '")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>开启报价</button>',
				].join("")
			} else {
				return [
					'<button type="button" id="btnSet" onclick=btnButton("' + row.projectId + '","' + row.id + '","' + createType + '","' + row.isAgent + '") class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>设置</button>',
				].join("")
			}
		}
	}
}
function btnPrice($index) {
	//报价
	var rowData = $('#OfferList').bootstrapTable('getData');
	var rowObj = rowData[$index]
	var tipStr = ''
	if (rowObj.supplierCount > 0 && rowObj.isFile == 0 && rowObj.offerSupplierCount < rowObj.supplierCount) {
		tipStr = '参与报价供应商数量不足' + rowData[$index].supplierCount + '家，'
	}
	parent.layer.confirm('温馨提示：' + tipStr + '是否继续开启报价', {
		btn: ['继续', '不继续'],
		yes: function(index, layero) {
			$.ajax({
				url: urlPrice,
				type: "post",
				data: {
					isOpenQuotation: 0,
					checkStatus: rowData[$index].checkStatus, //竟低价采购
					projectId: rowData[$index].projectId,
                    packageId:rowData[$index].id
				},
				dataType: "json",
				async: false,
				success: function (data) {
					if (!data.success) {
						top.layer.alert(data.message)
						return
					}
					$('#OfferList').bootstrapTable('destroy');
		            initTable()
					parent.layer.close(index);
				}
			})
		},
		btn2: function(index, layero) {
            $.ajax({
				url: urlPrice,
				type: "post",
				data: {
					isOpenQuotation: 1,
					checkStatus: rowData[$index].checkStatus, //竟低价采购
					projectId: rowData[$index].projectId,
                    packageId:rowData[$index].id
				},
				dataType: "json",
				async: false,
				success: function(data) {
					if (!data.success) {
						top.layer.alert(data.message)
						return
					}
					$('#OfferList').bootstrapTable('destroy');
		            initTable()
					parent.layer.close(index);
				}
			})

		}
	})
}
function btnButton(projectId, packageId, creType, isAgent) {
	$.ajax({
		url: findOneInfo,
		type: "post",
		data: {
			enterpriseType: "02",
			tenderType: "2", //竟低价采购
			projectId: projectId,
			packageId: packageId

		},
		dataType: "json",
		async: false,
		success: function(data) {
			var result = data.data;
			if(result.isStopCheck == 1){
				layer.open({
					type: 2,
					title: '竞卖历史详情',
					area: ['100%', '100%'],
					maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					id: 'packageclass',
					content: urlHistoryInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType+ '&isAgent=' + isAgent,
					success: function(layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = layero.find('iframe')[0].contentWindow;
						/* result.eid = eid;
						 result.pid = pid;*/
						//				            iframeWin.getMsg(result);
					}
				});
			}else{
				if(result.auctionStatus == '已结束') {
				
					if(result.checkStatus == '未提交') {
						//已结束,未提交
						layer.open({
							type: 2,
							title: '竞卖详情',
							area: ['100%', '100%'],
							maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							resize: false, //是否允许拉伸
							id: 'packageclass',
							content: urlHistoryInfo + '?projectId=' + projectId + '&id=' + packageId + '&type=' + 'commit' + '&createType=' + creType + '&isAgent=' + isAgent,
							success: function(layero, index) {
								var body = layer.getChildFrame('body', index);
								var iframeWin = layero.find('iframe')[0].contentWindow;
								/*result.eid = eid;
								result.pid = pid;*/
								//				            iframeWin.getMsg(result);
							}
						});
				
					} else {
				
						if(result.groupCode != "" && result.groupCode == '00270012') {
							layer.open({
								type: 2,
								title: '竞卖历史详情',
								area: ['100%', '100%'],
								maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
								resize: false, //是否允许拉伸
								id: 'packageclass',
								content: urlJMHistoryInfo + '?packageId=' + packageId,
								success: function(layero, index) {
									var body = layer.getChildFrame('body', index);
									var iframeWin = layero.find('iframe')[0].contentWindow;
									/*result.eid = eid;
									result.pid = pid;*/
									// iframeWin.getMsg(result);
								}
							});
						} else {
							layer.open({
								type: 2,
								title: '竞卖历史详情',
								area: ['100%', '100%'],
								maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
								resize: false, //是否允许拉伸
								id: 'packageclass',
								content: urlHistoryInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType+ '&isAgent=' + isAgent,
								success: function(layero, index) {
									var body = layer.getChildFrame('body', index);
									var iframeWin = layero.find('iframe')[0].contentWindow;
									/* result.eid = eid;
									 result.pid = pid;*/
									//				            iframeWin.getMsg(result);
								}
							});
						}
					}
				}
				
				if(result.auctionStatus == '竞卖中') {
					if(result.groupCode != "" && result.groupCode == '00270012') {
						layer.open({
							type: 2,
							title: '竞卖详情',
							area: ['100%', '100%'],
							id: 'packageclass',
							maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							resize: false, //是否允许拉伸
							content: urlWasteOfferViewInfo + '?packageId=' + packageId,
						});
					} else {
						sessionStorage.setItem("rowList", JSON.stringify(result));
						layer.open({
							type: 2,
							title: '竞卖详情',
							area: ['100%', '100%'],
							id: 'packageclass',
							maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							resize: false, //是否允许拉伸
							content: urlOfferViewInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType+ '&isAgent=' + isAgent,
						});
					}
				}
				
				if(result.auctionStatus == '未开始') {
					parent.layer.open({
						type: 2 //此处以iframe举例
							,
						title: '竞卖设置',
						area: ['1100px', '600px'],
						id: 'packageclass',
						maxmin: true //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
							,
						resize: false //是否允许拉伸
							,
						content: urlOfferSetInfo + '?projectId=' + projectId + '&id=' + packageId + '&createType=' + creType+ '&isAgent=' + isAgent,
						success: function(layero, index) {
							iframeWin = layero.find('iframe')[0].contentWindow;
						}
					});
				}
			}
		}
	})
}

function initTable() {
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
		height: top.tableHeight,
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
				checkStatus: $("#checkStatus").val(),
				enterpriseType: "04",
				tenderType: "2", //竞卖采购
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
							var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新竞卖)</span>'
						} else {
							var projectName = row.projectName
						}
						return projectName
					}
				},
				/*{
					field: 'packageNum',
					title: '包件编号',
					align: 'left',
					width: '180'
				},*/
				{
					field: 'auctionStartDate',
					title: '竞卖开始时间',
					align: 'center',
					width: '180',
				},
				{
					field: 'auctionStatus',
					title: '竞卖状态',
					align: 'left',
					width: '100',
					formatter: function(value, row, index) {
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
					title: '审核状态',
					align: 'left',
					width: '100',
					formatter: function(value, row, index) {
						return value ? '<span style="color:' + (value == "未提交" || value == "未审核" ? "red" : "green") + '">' + value +
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
		title: '竞卖设置',
		area: ['1100px', '600px'],
		maxmin: true //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
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