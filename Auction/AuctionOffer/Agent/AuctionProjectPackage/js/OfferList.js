var packageId=top.PAGEURL.getQueryString('packageId') || $.getUrlParam('packageId');
var applicationModule=top.PAGEURL.getQueryString('applicationModule') || $.getUrlParam('applicationModule');
//初始化
$(function() {
	initTable();
	//开始时间
	$('#startDate').datetimepicker({
		lang: 'ch',
		format: 'Y-m-d H:i:s',
		onShow: function() {

		},

	});
	$('#endDate').datetimepicker({
		lang: 'ch',
		format: 'Y-m-d H:i:s',
		onShow: function() {
			if($('#startDate').val() != "") {
				var noticeMin = $('#startDate').val()
			} else {
				var noticeMin = '1900-01-01 00:00:00'
			};
			$('#endDate').datetimepicker({
				minDate: noticeMin
			})
		},

	});
});
var rowId = "",
	rowProId = "",
	detailListType = "";
var biddingtime
function initTable() {
	$('#projectPackage').bootstrapTable({
		url: top.config.offerhost + '/info/list',
		cache: false,
		pagination: true,
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		clickToSelect: true, //是否启用点击选中行
		pageList: [10, 15, 20, 25],
		sidePagination: 'server',
		queryParams: function(params) {
			var paramData = {
				'pageSize': params.limit,
				'pageNumber': (params.offset / params.limit) + 1,
				'startDate': $("#startDate").val(),
				'endDate': $("#endDate").val(),
				'status': $("#status").val(),
				'packageCode':$("#packageCode").val(),
				'packageName':$("#packageName").val(),
				'packageId':packageId,
				'applicationModule':applicationModule
			}		
			return paramData;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50px',
					formatter: function(value, row, index) {
						var pageSize = $('#projectPackage').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#projectPackage').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				},
				{
					field: 'packageName',
					title: '包件名称',
					align: 'left',
					formatter: function(value, row, index) {
						return value + (~~row.purchaseTimes > 1 ? 
							'<span style="color:red">第'+row.purchaseTimes+'次重新采购</span>' : '');
					}
				},
				{
					field: 'packageCode',
					title: '包件编号',
					align: 'left',
					width: '200'
				},
				{
					field: 'biddingStartTime',
					title: '竞价开始时间',
					align: 'center',
					width: '180'
				},
				{
					field: 'biddingTimes',
					title: '竞价次数',
					align: 'center',
					width: '180',
					formatter: function(value, row, index) {
						return '第'+value+'次'
						
					}
				},
				
				{
					field: 'status',
					title: '竞价状态',
					align: 'center',
					width: '150',
					formatter: function(value, row, index) {
						if(value==2){
							return '<div class="red">已结束</div>'
						}else if(value==1){
							return '<div style="color:green">竞价中</div>'
						}else{
							return '<div style="color:red">未开始</div>'
						}
						}		
				}, 
				{
					title: '操作',
					align: 'center',
					events: {
						'click .btn-opera': function(e, value, row, index) {
							var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();//当前系统时间
							if(NewDatefp(row.biddingStartTime)>NewDatefp(nowSysDate)){
								parent.layer.alert('温馨提示：竞价未开始');																		
							}else if(row.status==1){
								parent.layer.alert('温馨提示：竞价未结束');
							}else{
								openWin(row.packageId,row.biddingTimes)
							}													
						}
					},
					formatter: function(value, row, index) {
						return '<button class="btn btn-primary btn-xs btn-opera">' +
							(row.status == 2 ? "历史记录" : "报价情况") + '</button>';
					}
				}
			]
		]
	})
}
$('ul.search-type li').click(function() {
	$(this).siblings('.active').removeClass('active').end().addClass('active');
	$('a.search-type').html($(this).text()).attr('name', $(this).find('a')[0].name);
})

$('.search-btn').click(function() {
	$('#projectPackage').bootstrapTable('refresh');
})
$("#status").on('change', function() {
	$('#projectPackage').bootstrapTable('refresh');
})
function openWin(packageId,biddingTimes,id) {
	parent.layer.open({
		type: 2,
		title: "查看报价情况",
		area: ['100%', '100%'],
		content: 'Auction/AuctionOffer/Agent/AuctionProjectPackage/model/OfferViewInfo.html?packageId='+ packageId+'&biddingTimes='+biddingTimes
	});
}
 //时间转换是的IE和谷歌都可以判断日期大小
 function NewDatefp(str){  
	if(!str){  
	    return 0;  
	}  
	var timeDATE=new Date(Date.parse(str.replace(/-/g, "/"))).getTime()
	return  timeDATE;  
} 