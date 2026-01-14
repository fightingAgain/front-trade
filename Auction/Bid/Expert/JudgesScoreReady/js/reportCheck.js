$('#projectlist').bootstrapTable({
	method: 'get', // 向服务器请求方式
	url: config.bidhost + '/WaitCheckProjectController/findPageList.do',
	cache: false,
	striped: true,
	silent: true, // 必须设置刷新事件
	pagination: true,
	pageSize: 15,
	pageNumber: 1,
	pageList: [10, 15, 20, 25],
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	sidePagination: 'server',
	classes: 'table table-bordered', // Class样式
	queryParamsType: "limit",
	queryParams: function(params) {
		var paramData = {
			pageNumber: params.offset / params.limit + 1, //当前页数
			pageSize: params.limit, // 每页显示数量
			offset: params.offset // SQL语句偏移量	
		}
		paramData[$('a.search-type').attr('name')] = $('input[name=search-query]').val();
		return paramData;
	},
	columns: [
		[{
				field: 'projectCode',
				title: '采购项目编号'
			},
			{
				field: 'projectName',
				title: '采购项目名称',
				formatter:function(value, row, index){
					if(row.projectSource==1){
		
						 	var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.projectName +'<span class="text-danger"  style="font-weight:bold">(重新采购)</span></div>';		
							
					
					}else{
						var projectName='<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">'+row.projectName +'</div>';
					}						
					return projectName;
				}
			},
			{
				field: 'tenderTypeText',
				title: '采购方式'
			},
			{
				field: 'checkEndDate',
				title: '询价预审时间'
			},
			{
				title: '操作',
				events: {
					'click .btn-enter': function(e, value, row, index) {
						sessionStorage.setItem('expertId', row.expertId);//获取当前选择行的数据，并缓存	
						//if(row.expertState==1) {
						//判断当前为预审还是评审项目
						if(row.examType == 0){
							//预审
							if(row.examCheckEndDate && GetTime(nowDate) > GetTime(row.examCheckEndDate) ){
								
								if(row.checkEndDate){
									//已经有评审
									if(GetTime(nowDate) > GetTime(row.checkEndDate)){
										//打开评审
										if(row.leaderCount <=0){
											top.layer.alert("项目评审评委未设置组长");
											return;
										}
										var index = top.layer.open({
											type: 2,
											title: "评审项目管理",
											area: ['100%', '100%'],
											btn: ["刷新", "关闭"],
											content: $.parserUrlForToken("0502/Bid/JudgesScore/ProjectPackages.html?projectId="+row.id+"&packageId="+row.packageId),
											btn1: function(index, layero) {
												parent.window[layero.find('iframe')[0]['name']].location.reload();
											},
										});
									}else{
										parent.layer.alert("评审未开始");
										return;
									}	
								}else{
									//还没有评审,打开预审
									if(row.leaderCount <=0){
										top.layer.alert("资格预审评委未设置组长");
										return;
									}
									var index = top.layer.open({
										type: 2,
										title: "评审项目管理",
										area: ['100%', '100%'],
										btn: ["刷新", "关闭"],
										content: $.parserUrlForToken("0502/Bid/JudgesScoreReady/ProjectPackages.html?projectId="+row.id+"&packageId="+row.packageId),
										btn1: function(index, layero) {
											parent.window[layero.find('iframe')[0]['name']].location.reload();
										},
									});
									
								}
							}else{
								parent.layer.alert("预审未开始");
								return;
							}		
							
						}else{
							//评审
							if(row.leaderCount <=0){
								top.layer.alert("项目评审评委未设置组长");
								return;
							}
							if(row.checkEndDate && GetTime(nowDate) > GetTime(row.checkEndDate)){
								//打开评审
								var index = top.layer.open({
									type: 2,
									title: "评审项目管理",
									area: ['100%', '100%'],
									btn: ["刷新", "关闭"],
									content: $.parserUrlForToken("0502/Bid/JudgesScore/ProjectPackages.html?projectId="+row.id+"&packageId="+row.packageId),
									btn1: function(index, layero) {
										parent.window[layero.find('iframe')[0]['name']].location.reload();
									},
								});
							}else{
								parent.layer.alert("评审未开始");
								return;
							}
							
						}
							
							
						/*} else {
							top.layer.alert("评审时间未开始！");
							return;
						}*/
						/*sessionStorage.setItem('expertId', row.expertId);//获取当前选择行的数据，并缓存	
						var index = top.layer.open({
							type: 2,
							title: "评审项目管理",
							area: ['100%', '100%'],
							btn: ["刷新", "关闭"],
							content: $.parserUrlForToken('0502/Bid/JudgesScore/reportCheckMiddel.html') + '#' + row.id,
							btn1: function(index, layero) {
								parent.window[layero.find('iframe')[0]['name']].location.reload();
							},
						});*/
						
						
					}
				},
				formatter: function(value, row, index) {
					return '<button class="btn btn-primary btn-xs btn-enter">进入</button>';
				}
			}
		]
	]
})

$('ul.search-type li').click(function() {
	$(this).siblings('.active').removeClass('active').end().addClass('active');
	$('a.search-type').html($(this).text()).attr('name', $(this).find('a')[0].name);
})

$('.search-btn').click(function() {
	$('#projectlist').bootstrapTable('refresh');
})

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + (date.getMonth() + 1);
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + date.getDate();
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}
