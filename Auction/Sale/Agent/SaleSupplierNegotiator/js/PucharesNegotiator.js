//var searchUrl = config.AuctionHost+'/NegotiationController/pageNegotiation';
var searchUrl = config.AuctionHost + '/NegotiationController/pageNegotiationForPurchaser';
var checkboxed = "";
//页面加载后显示
$(function () {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function () {
		$('#PucharesNegotiator').bootstrapTable('destroy');
		initTable()
	});
	//答复状态的改变
	$("#checkState").change(function () {
		$('#PucharesNegotiator').bootstrapTable('destroy');
		initTable()
	});
});

window.operateEvents = { //添加一个按钮对应的事件
	"click #btnCheck": function (e, value, row, index) {
		var createType = row.createType || 0;
		//查看 线上谈判
		layer.open({
			type: 2 //此处以iframe举例
			,
			title: '价格谈判',
			area: ['1000px', '600px'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Sale/Agent/SaleSupplierNegotiator/pPriceNegotiator.html?' + "createType=" + createType + '&projectId=' + row.projectId + '&id=' + row.packageId,
			success: function (layero, index1) {
				var body = layer.getChildFrame('body', index1);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.tableShow(row);
			}
		});

	},
	"click #btnNot": function (e, value, row, index) {
		//查看 不谈判
		layer.open({
			type: 2 //此处以iframe举例
			,
			title: '价格谈判',
			area: ['900px', '400px'],
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Sale/Agent/SaleSupplierNegotiator/NotNegotiator.html',
			success: function (layero, index1) {
				var body = layer.getChildFrame('body', index1);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.tableShow(row);
			}
		});

	},
	"click #btnUnderCheck": function (e, value, row, index) {
		//查看 线下谈判
		layer.open({
			type: 2 //此处以iframe举例
			,
			title: '价格谈判',
			area: ['1000px', '600px'],
			id: "negotiators",
			maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Sale/Agent/SaleSupplierNegotiator/underline.html?projectId=' + row.projectId + '&id=' + row.packageId,
			success: function (layero, index1) {
				var body = layer.getChildFrame('body', index1);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getShow(row);
			}
		});

	},
	"click #btnNegotiator": function (e, value, row, index) {
		if (row.itemState != undefined && row.itemState == 2) {
			layer.alert("该阶段无法谈判");
			return;
		}
		//谈判  选择是线上还是线下谈判还是不谈判
		layer.open({
			type: 2,
			title: '选择谈判方式',
			area: ['650px', '225px'],
			maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Sale/Agent/SaleSupplierNegotiator/NegotiatorMethod.html?projectId=' + row.projectId + '&id=' + row.packageId,
			success: function (layero, index2) {
				//var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMessage(row);
			}
		});

	},
	"click #btnView": function (e, value, row, index) {

		layer.alert("温馨提示：项目发布人还未进行谈判！");
	}
}

//0 已谈判 查看  1未谈判  选择
function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	if (row.negotiationState == '0' && row.negotiationType == '0') {
		return [
			//线上谈判,已谈判
			'<button type="button" id="btnCheck" class="btn-xs btn btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
		].join("")
	}

	if (row.negotiationState == '0' && row.negotiationType == '2') {
		return [
			//不谈判
			'<button type="button" id="btnNot" class="btn-xs btn btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
		].join("")
	}

	if (row.negotiationState == '0' && row.negotiationType == '1') {
		return [
			//线下谈判,已谈判
			'<button type="button" id="btnUnderCheck" class="btn-xs btn btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>',
		].join("")
	}

	if (row.negotiationState == '1') {
		if (row.createType != "undefined" && row.createType == 1) {//当前项目不为自己发布的项目时
			return [

				'<button type="button" id="btnView" class="btn-xs btn btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>查看</button>',

			].join("")
		} else {
			return [
				//未谈判
				'<button type="button" id="btnNegotiator" class="btn-xs btn btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>谈判</button>',

			].join("")
		}
	}
	//}

}
function initTable() {
	//加载数据
	$("#PucharesNegotiator").bootstrapTable({
		url: searchUrl,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
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
		onCheck: function (row) {
			checkboxed = row.id;
		},
		queryParams: function (params) {
			var paramData = {
				'pageSize': params.limit,
				'pageNumber': (params.offset / params.limit) + 1, //页码
				'enterpriseType': '02', //采购人
				'negotiationState': $("#checkState").val(),
				'projectName': $("#projectName").val(),
				'projectCode': $("#projectNumber").val(),
				'tenderType': 2 //竟高价采购

			};
			if ($("#checkState").val() == '2') {
				paramData.negotiationType = 2
			}
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
					var pageSize = $('#PucharesNegotiator').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#PucharesNegotiator').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
				width: '500',
				formatter: function (value, row, index) {
					if (row.projectSource == 1) {

						var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新竞卖)</span>';


					} else {
						var projectName = row.projectName;
					}
					return projectName;
				}
			},
			{
				field: 'negotiationState',
				title: '谈判状态',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					if (row.negotiationState == "0" && row.negotiationType == "2") {
						return "<label >不谈判</label>";
					}
					if (row.negotiationState == "0" && row.negotiationType != "2") { //已谈判
						return "<label class='text-success'>已谈判</label>";
					}
					if (row.negotiationState == "1") { //未谈判
						return "<label style='color:red'>未谈判</label>";
					}
				}
			},
			{
				field: 'subDate',
				title: '创建时间',
				align: 'center',
				width: '160'
			},
			{
				field: 'Button',
				title: '操作',
				align: 'center',
				width: '200px',
				formatter: AddFunction, //表格中添加按钮
				events: operateEvents, //给按钮注册事件

			},

			]
		]
	});
}


