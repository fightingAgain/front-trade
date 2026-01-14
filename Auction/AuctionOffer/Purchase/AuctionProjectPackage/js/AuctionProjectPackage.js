//初始化
$(function(){
   initTable();
	 $('#startDate').attr('lay-key',Math.ceil(Math.random()*10000));
   laydate.render({elem: '#startDate',type: 'datetime',range:true});
});
var rowId="",rowProId="";
function initTable() {
$('#projectPackage').bootstrapTable({
	url: config.AuctionHost + '/AuctionProjectPackageController/pageAuctionPackage.do',
	cache: false,
	pagination: true,
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	clickToSelect: true, //是否启用点击选中行
	pageList: [10,15,20,25],
	sidePagination: 'server',
	queryParams: function (params) {
		var timeArr = $('#startDate').val().split(' - ');
		var paramData = {
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1,
			startDate: timeArr[0],
			endDate: timeArr[1],
			isOffer:$("#auctionStatus").val()
		}
		paramData[$('a.search-type').attr('name')] = $('input[name=search-query]').val();
		return paramData;
	},
	columns: [
		[{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#projectPackage').bootstrapTable('getOptions').pageSize; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#projectPackage').bootstrapTable('getOptions').pageNumber; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectName',
				title: '竞价项目名称',
				align: 'left',
				formatter:function(value, row, index){
				    if(row.isPublic>1){
				    	if(row.projectSource==1){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新采购)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}else if(row.projectSource==0){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
				    	}
				    	
				    }else{
				    	if(row.projectSource==1){
				    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新采购)</span>'
				    	}else if(row.projectSource==0){
				    		return row.projectName
				    	}			    	
				    }
				}
			},
			{
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				width: '200'
			},{
				
				field: 'enterpriseName',
				title: '企业名称',
				align: 'left'
				
		    },
			{
				field: 'packageName',
				title: '包件名称',
				align: 'left'
			},
			{
				field: 'auctionStartDate',
				title: '竞价开始时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'auctionStatus',
				title: '竞价状态',
				align: 'center',
				width: '150',
				formatter: function (value, row, index) {
					return value ? '<span style="color:' + (value == "已过期 - 未报价" || value == "未报价" ? "red" : "green") + '">' + value +
						'</span>' : '';
				}
			},{
				field: 'isAccept',
				title: '邀请状态',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
						if(row.isAccept == 0) {
							return '<div class="text-success" style="font-weight: bold;">接受</div>'
						} else if(row.isAccept == 1) {
							return '<div class="text-success" style="font-weight: bold;">拒绝</div>'
						} else {
							if(row.isPublic > 1){ 
							return '<div>未确认</div>'
							}else{
							return '<div></div>'	
							}
						}
	
				}
			},
			{
				title: '操作',
				align: 'center',
				events: {
					'click .btn-opera': function (e, value, row, index) {
							sessionStorage.setItem("purchaseaDataId", JSON.stringify(row.projectId));
							sessionStorage.setItem("userName", JSON.stringify(row.enterpriseName));
							sessionStorage.setItem("subDate", JSON.stringify(row.auctionStartDate));
							rowId=row.id;
							rowProId=row.projectId;
							openIfiame(row.projectId,row.id,1)
							
					}
				},
				formatter: function (value, row, index) {
					var now = new Date();
					return '<button class="btn btn-primary btn-xs btn-opera">' +
						(new Date(row.auctionStartDate) < now && new Date(row.auctionEndDate) > now ?
							"报价" : "查看") + '</button>';
				}
			}
		]
	]
})
}
$('ul.search-type li').click(function () {
	$(this).siblings('.active').removeClass('active').end().addClass('active');
	$('a.search-type').html($(this).text()).attr('name', $(this).find('a')[0].name);
})

$('.search-btn').click(function () {
	$('#projectPackage').bootstrapTable('refresh');
})
$("#auctionStatus").on('change',function(){
	$('#projectPackage').bootstrapTable('refresh');
})
function affirmBtn(){
	sessionStorage.setItem('Num', '1');//邀请供应商的数据缓存  
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['650px', '300px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: '0502/Bid/Purchase/model/affirm.html',
		success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;         	
        }
	});
}

