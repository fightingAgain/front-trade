var searchUrl = config.AuctionHost + '/NegotiationController/pageNegotiationItemForSupplier.do';
var updateNegotiatorItem = config.AuctionHost + "/NegotiationController/updateNegotiationItem"; //修改谈判明细

var checkboxed = "";
var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
//页面加载后显示
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#SupplierNegotiator').bootstrapTable('refresh', {
			url: searchUrl
		});
	});

});

window.operateEvents = { //添加一个按钮对应的事件
	"click #btnCheck": function(e, value, row, index) {
		nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		var height = top.$(window).height() * 0.75;
		var width = top.$(window).width() * 0.6;
		if(GetTime(nowDate)>GetTime(row.endDate) && row.isAccept != '0' && row.isAccept != '1'){
			add(row.id,row.endDate);
			layer.confirm('已超过价格确认截止时间,默认为拒绝谈判', {
				btn: ['确定'] //按钮
			}, function(index) {
				layer.close(index);
				layer.open({
					type: 2 //此处以iframe举例
						,
					title: '查看',
					area: [width + 'px', height + 'px'],
					resize: false, //是否允许拉伸
					content: 'Auction/Sale/Supplier/SaleSupplierNegotiator/sPriceNegotiator.html?type=check' + '&isAgent='+row.isAgent,
					success: function(layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = layero.find('iframe')[0].contentWindow;
		
						iframeWin.show(row);
					}
				});
			})
			
		}else{
			layer.open({
				type: 2 //此处以iframe举例
					,
				title: '查看',
				area: [width + 'px', height + 'px'],
				content: 'Auction/Sale/Supplier/SaleSupplierNegotiator/sPriceNegotiator.html?type=check' + '&isAgent='+row.isAgent,
				resize: false, //是否允许拉伸
				success: function(layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					
					iframeWin.show(row);
				}
			});
		}

	},
	"click #btnAnswer": function(e, value, row, index) {
		var height = top.$(window).height() * 0.8;
		var width = top.$(window).width() * 0.6;
		layer.open({
			type: 2,
			title: '答复',
			area: [width + 'px', height + 'px'],
			// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			content: 'Auction/Sale/Supplier/SaleSupplierNegotiator/sPriceNegotiator.html?type=answer' + '&isAgent='+row.isAgent,
			success: function(layero, index) {
				var body = layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.show(row);
			}
		});
	}
}

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	//判断当前行的答复状态 0 接受 1不接受
	if(row.isAccept == '0' || row.isAccept == '1' || GetTime(nowDate)>GetTime(row.endDate)) {
		return [
			'<a href="javascript:void(0)" id="btnCheck" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>&nbsp;&nbsp;',
		].join("")
	} else {
		return [
			'<a href="javascript:void(0)" id="btnAnswer" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-pencil" aria-hidden="true"></span>答复</a>&nbsp;&nbsp;',

		].join("")
	}
}

//加载数据
$("#SupplierNegotiator").bootstrapTable({
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
	onCheck: function(row) {
		checkboxed = row.id;
	},
	queryParams: function(params) {
		var paramData = {
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			isAccept: $("#checkState").val(),
			'projectName': $("#projectName").val(),
			'projectCode': $("#projectCode").val(),
			'enterpriseType': '06',
			'tenderType': 2 //竟高价采购
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
					var pageSize = $('#SupplierNegotiator').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#SupplierNegotiator').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'negotiation.projectCode',
				title: '项目编号',
				align: 'left',
				width: '180'
			},
			{
				field: 'negotiation.projectName',
				title: '项目名称',
				align: 'left'
			},
			{
				field: 'negotiationPrice',
				title: '谈判价格(元)',
				align: 'right',
				width: '120'
			},
			{
				field: 'endDate',
				title: '价格确认截止时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'isAccept',
				title: '答复状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
					if(row.isAccept == "0") {
						return "<label style='color:green;'>已接受</label>";
					} else if(row.isAccept == "1") {
						return "<label style='color:red;'>已拒绝</label>";
					} else if(GetTime(nowDate)>GetTime(row.endDate) && row.isAccept != '0' && row.isAccept != '1') {
						return "<label style='color:red;'>已拒绝</label>";
					}else {
						return "<label style='color:black;'>未答复</label>";
					}
				}
			},
			{
				field: 'replyDate',
				title: '答复时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'Button',
				title: '操作',
				align: 'center',
				width: '100',
				formatter: AddFunction, //表格中添加按钮
				events: operateEvents, //给按钮注册事件

			},

		]
	]
});

//答复状态的改变
$("#checkState").change(function() {

	$('#SupplierNegotiator').bootstrapTable('refresh', {
		url: searchUrl
	});

});

function GetTime(time){
	var date=new Date(time).getTime();
	
	return date;
};


var negoItem;
function add(id,endDate){
	negoItem = {
		'id': id,
		'isAccept': '1',
		'type': 0,
		//'replyDate':endDate,
	}
	
	
	$.ajax({ //修改谈判明细
		url: updateNegotiatorItem,
		type: 'post',
		async: true,
		dataType: 'json',
		data: negoItem,
		success: function(data) {
			if(data.success) {
				$('#SupplierNegotiator').bootstrapTable('refresh', {url: searchUrl});
			} else {
				
			}
		}
	});
}
