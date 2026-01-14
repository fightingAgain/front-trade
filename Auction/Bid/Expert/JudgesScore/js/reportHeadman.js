//var nowDate = new Date();
$('#projectlist').bootstrapTable({
	method: 'get', // 向服务器请求方式
	url: config.bidhost + '/ExpertLeaderController/findCheckPackageList.do',
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
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#projectlist').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#projectlist').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
			},{
				field: 'projectCode',
				title: '采购项目编号',
				width: '160'
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
			},{
				field: 'packageNum',
				title: '包件编号',
				width: '180'
			},{
				field: 'packageName', 
				title: '包件名称',
				formatter:function(value, row, index){
					if(row.packageSource==1){
						return value+'<span class="text-danger">(重新采购)</span>';
					}else{
						return value;
					}
					
				}
			}, {
				field: 'checkPlan',
				title: '评审方法',
				align:'center',
				width: '120',
				formatter: function(value, row, index) {
                    if(row.examType == 0){
                    	/*if(row.checkEndDate){
                    		if(row.checkPlan == 0) return "综合评分法";
							if(row.checkPlan == 1) return "最低价法";
						}else{	*/
							if(row.examCheckPlan == 0) return "合格制";
							if(row.examCheckPlan == 1) return "有限数量制";
							
						//}
                    }else{
                    	if(row.checkPlan == 0) return "综合评分法";
						if(row.checkPlan == 1) return "最低价法";
						if(row.checkPlan == 2) return "经评审的最低价法(价格评分)";
                    }
				}
			}, /*{
				field: 'expertCheckState',
				title: '评审状态',
				align:'center',
				width: '80',
				formatter: function(value, row, index) {
					if(row.isStopCheck==1){
						return '<span class="text-danger">已流标</span>'
					}else{
						if(row.stopCheckReason!=""&&row.stopCheckReason!=undefined){							
							return '<span class="text-danger">已流标</span>'
						}else{
							return "<span style='color:" + (value == "完成打分" ? "green" : "red") + "'>" + value + "</span>";
						}
					}
					
				}
			},*/{
				field: 'tenderType',
				title: '采购方式',
				width: '110',
				align:'center',
				formatter: function(value, row, index) {
					if(value==0){
						return '询价采购'
					}else if(value==6){
						return '单一来源采购'
					}
					
				}

			},
			{
				field: 'examCheckEndDate',
				title: '询价预审时间',
				width: '150',
				align:'center',
			},
			{
				field: 'checkEndDate',
				title: '询价评审时间',
				width: '150',
				align:'center',
			},
			{
				title: '操作',
				align:'center',
				width: '80',
				events: {
					'click .btn-enter': function(e, value, row, index) {						
						top.layer.open({
							type: 2,
							title: "查看推荐详情",
							area: ['800px', '600px'],							
							content: "Auction/common/Expert/JudgesScore/voteView.html?projectId="+row.id+"&packageId="+row.packageId+ "&examType="+row.examType,
						});				
					},
					'click .btn-headman': function(e, value, row, index) {				
						if(row.isStopCheck == 1) {
							parent.layer.alert("温馨提示：该项目已流标!");
							
							return
						}
						if(row.isSetFinish==0){
							top.layer.open({
								type: 2,
								title: "推荐组长",
								area: ['400px', '500px'],							
								content: "Auction/common/Expert/JudgesScore/vote.html?projectId="+row.id+"&packageId="+row.packageId+ "&examType="+row.examType+"&expertId="+row.expertId,
							});
						}else{
							top.layer.open({
								type: 2,
								title: "投票结果",
								area: ['400px', '500px'],							
								content: "Auction/common/Expert/JudgesScore/voteResult.html?projectId="+row.id+"&packageId="+row.packageId+ "&examType="+row.examType,
							});
						}
						
					},
				},
				formatter: function(value, row, index) {
					if(row.leaderCount==0){
						return '<button class="btn btn-primary btn-xs btn-headman">推荐组长</button>';	
					}else{
						return '<button class="btn btn-primary btn-xs btn-enter">查看</button>';
					};	
				}
			}
		]
	]
})