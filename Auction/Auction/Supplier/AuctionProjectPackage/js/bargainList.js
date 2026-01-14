var urlBidNoticeList = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/getAuctionPackageBargain.do"; //采购结果通知
var recallUrl = top.config.AuctionHost + "/WorkflowController/updateJggsState.do"; // 撤回项目的接口
var nowDate = new Date();
var tableOneData = [];
var width = top.$(window).width() * 0.8;
var height = top.$(window).height() * 0.8;

function checkDetail(packageId, type, index) {
//	var row = $("bargainList").bootstrapTable('getRowByUniqueId', packageId);
	var rows = $("#bargainList").bootstrapTable('getData')[index];
//	sessionStorage.setItem("bargainList", JSON.stringify(row));
	top.layer.open({
		type: 2,
		title: '查看清单议价',
		area: ['100%', '100%'],
		// maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Auction/Supplier/AuctionProjectPackage/model/bargainMsg.html?packageId=' + packageId+ '&sfcStatus=' + rows.sfcBarginStatus+ '&time=' + rows.endTime,
	});
}

//查询按钮
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#bargainList').bootstrapTable('refresh');
	});
		//状态查询
	$('#sfcBarginStatus').change(function(){

			$("#bargainList").bootstrapTable('refresh');


	});

});

//设置查询条件
function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号	
		packageName: $("#packageName").val(),
		sfcBarginStatus: $("#sfcBarginStatus").val(),
		enterpriseType: '04', //0为采购人，1为供应商
		tenderType: 1, //0为询价采购，1为竞价采购，2为竞卖
		supplierEnterpriseId: top.enterpriseId

	};
	return QueryParams;
}

$("#bargainList").bootstrapTable({
	url: urlBidNoticeList,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	height:top.tableHeight,
	toolbar: '#toolbar', // 工具栏ID
	clickToSelect: true, //是否启用点击选中行
	sidePagination: 'server', // 服务端分页
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	classes: 'table table-bordered', // Class样式
	striped: true,
	uniqueId: "packageId",
	columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#AuctionNoticeList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#AuctionNoticeList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180'
		},
		{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新竞价)</span>'
				} else {
					var projectName = row.projectName
				}
				return projectName
			}
		},
		{
			field: 'packageName',
			title: '包件名称',
			align: 'left'
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'center',
			width: '160px'
		},
		{
			field: 'sfcBarginStatus',
			title: '议价状态',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {

				switch(value) {
					case '1':
						return "<span >待确认</span>"
						break;
					case '2':
						return "<span style='color: green;'>已确认</span>"
						break;
					case '3':
						return "<span style='color: red;'>已拒绝</span>"
						break;

				}
			}
		},
			{
			field: 'endTime',
			title: '议价截止时间',
			align: 'center',
			width: '160px'
		},
		{
			field: 'action',
			title: '操作',
			align: 'center',
			width: '160',
			formatter: function(value, row, index) {
				return "<button onclick='checkDetail(\"" + row.packageId + "\",\"view\",\"" + index + "\")' class='btn btn-primary btn-xs'><span class='glyphicon glyphicon-eye-open'>查看详情</button>"

			}
		}
	]

})

function GetTime(time) {
	var date = new Date(time).getTime();

	return date;
};

function updates(id) {
	top.layer.confirm('确定要撤回该公示吗', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": id,
				'accepType': 'jggs'
			},
			success: function(data) {
				if(data.success) {
					parent.layer.alert("撤回成功!")
					setTimeout(function() {
						$('#AuctionNoticeList').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function(data) {
				top.layer.alert("撤回失败")
			}
		});

		top.layer.close(index);
	}, function(index) {
		top.layer.close(index)
	});
}