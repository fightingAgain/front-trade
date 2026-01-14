/*
 * 页面加载，绑定Table数据源
 * */
var urlProjectCheckList = top.config.AuctionHost + '/ProjectViewsController/findProjectCheckList.do'; //项目审核分页地址
var WORKFLOWTYPE;
$(function() {

	//查询按钮
	$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});
    if($('#tenderType').val()==0||$('#tenderType').val()==6 ||$('#tenderType').val()==12 ||$('#tenderType').val()==13){//当为询价或单一来源时
		$('#ProjectAuditTable').bootstrapTable("showColumn", 'packageName'); //显示包件名称
		$('#ProjectAuditTable').bootstrapTable("showColumn", 'packageNum'); //显示包件编号			
	}else{
		$('#ProjectAuditTable').bootstrapTable("hideColumn", 'packageName'); //隐藏包件名称
		$('#ProjectAuditTable').bootstrapTable("hideColumn", 'packageNum'); //隐藏包件编号
	}
	//两个下拉框事件
	$("#packageState,#tenderType").change(function() {
		if($('#tenderType').val()==0||$('#tenderType').val()==6 ||$('#tenderType').val()==12 ||$('#tenderType').val()==13){//当为询价或单一来源时
			$('#ProjectAuditTable').bootstrapTable("showColumn", 'packageName'); //显示包件名称
			$('#ProjectAuditTable').bootstrapTable("showColumn", 'packageNum'); //显示包件编号	
		}else{
			$('#ProjectAuditTable').bootstrapTable("hideColumn", 'packageName'); //隐藏包件名称
			$('#ProjectAuditTable').bootstrapTable("hideColumn", 'packageNum'); //隐藏包件编号
		}
		$('#ProjectAuditTable').bootstrapTable('refresh');
	});

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
        sessionStorage.setItem('tenderTypeCode', row.tenderType);//0是询价采购  6是单一来源采购，并缓存			
		switch(row.tenderType) {
			case 0: //询比	
            case 6: //单一来源	
			    WORKFLOWTYPE = "xmgg";
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "查看",
					success:function(layero,index){
						
			        	var iframeWind=layero.find('iframe')[0].contentWindow;			        	
			        	
			        },
					content: 'bidPrice/ProjectCheck/modal/ProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "detailed"
				});
				break;
			case 1: //竞价
				sessionStorage.setItem('purchaseaddata', JSON.stringify(row));
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "查看",
					content: 'bidPrice/ProjectCheck/modal/AuctionCheckListInfo.html?key=' + row.id + '&edittype=' + "detailed"
				});
				break;
			case 2: //竞卖
				sessionStorage.setItem('purchaseaddata', JSON.stringify(row));
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "查看",
					content: 'bidPrice/ProjectCheck/modal/SaleCheckListInfo.html?key=' + row.id + '&edittype=' + "detailed"
				});
				break;
				case 12: //竞争性谈判
				    WORKFLOWTYPE = "jztp_ggxx";
					top.layer.open({
						type: 2,
						area: ["1100px", "650px"],
						maxmin: true,
						resize: false,
						title: "查看",
						success:function(layero,index){
							
				        	var iframeWind=layero.find('iframe')[0].contentWindow;			        	
				        	iframeWind.du(row.id,row.examType);
				        	iframeWind.Purchase(row.projectId);
				        	iframeWind.PackageCheckList(0);
				        	if(row.examType==1){
				        		iframeWind.packageDetailData();
				        		if(iframeWind.packageInfo.businessPriceSet!=""&&iframeWind.packageInfo.businessPriceSet!=undefined){
				        			iframeWind.scoreTypeBtn(iframeWind.packageInfo.businessPriceSet.checkType,iframeWind.packageInfo.checkPlan);
				        		};
								
				        	};
				        	if(row.inviteState==1){
				        		if(row.examType==0){
				        			iframeWind.suppliment();
				        		}else{
				        			iframeWind.supplimentInt(1);
				        		};
				        	}else{
				        		iframeWind.suppliment();
				        	};			 			        	
				        	iframeWind.package();
				        	iframeWind.hasData();
				        	iframeWind.findWorkflowCheckerAndAccp(row.id);
				        	
				        },
						content: 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=' + 'detailed'+'&tenderType='+12
					});
					break;
			case 13: //竞争性磋商谈判
				    WORKFLOWTYPE = "jztp_ggxx";
					top.layer.open({
						type: 2,
						area: ["1100px", "650px"],
						maxmin: true,
						resize: false,
						title: "查看",
						success:function(layero,index){
							
				        	var iframeWind=layero.find('iframe')[0].contentWindow;			        	
				        	iframeWind.du(row.id,row.examType);
				        	iframeWind.Purchase(row.projectId);
				        	iframeWind.PackageCheckList(0);
				        	if(row.examType==1){
				        		iframeWind.packageDetailData();
				        		if(iframeWind.packageInfo.businessPriceSet!=""&&iframeWind.packageInfo.businessPriceSet!=undefined){
				        			iframeWind.scoreTypeBtn(iframeWind.packageInfo.businessPriceSet.checkType,iframeWind.packageInfo.checkPlan);
				        		};
								
				        	};
				        	if(row.inviteState==1){
				        		if(row.examType==0){
				        			iframeWind.suppliment();
				        		}else{
				        			iframeWind.supplimentInt(1);
				        		};
				        	}else{
				        		iframeWind.suppliment();
				        	};			 			        	
				        	iframeWind.package();
				        	iframeWind.hasData();
				        	iframeWind.findWorkflowCheckerAndAccp(row.id);
				        	
				        },
						content: 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "detailed"+'&tenderType='+13
					});
					break;
		}
	},
	"click .audit": function(e, value, row, index) {
        sessionStorage.setItem('tenderTypeCode', row.tenderType);//0是询价采购  6是单一来源采购，并缓存	
		switch(row.tenderType) {
			case 0: //询价	
            case 6: //单一来源
			    WORKFLOWTYPE = "xmgg";
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "审核",
					success:function(layero,index){    
			        	var iframeWind=layero.find('iframe')[0].contentWindow;	
			        },
					content: 'bidPrice/ProjectCheck/modal/ProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"
				});
				break;
			case 1: //竞价
				sessionStorage.setItem('purchaseaddata', JSON.stringify(row));
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "审核",
					content: 'bidPrice/ProjectCheck/modal/AuctionCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"+'&tenderType='+1
				});
				break;
			case 2: //竞卖
				sessionStorage.setItem('purchaseaddata', JSON.stringify(row));
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "审核",
					content: 'bidPrice/ProjectCheck/modal/SaleCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"+'&tenderType='+2
				});
				break;
			case 6: //单一来源
				top.layer.open({
					type: 2,
					area: ["1100px", "650px"],
					maxmin: true,
					resize: false,
					title: "审核",
					success:function(layero,index){    
			        	var iframeWinds=layero.find('iframe')[0].contentWindow;			        	
			        	iframeWinds.Purchase(row.projectId);
			        	iframeWinds.du(row.id,1);
			        	iframeWinds.PackageCheckList(0);
			        	if(row.examType==1){
			        		iframeWinds.packageDetailData();
							if(iframeWinds.packageInfo.businessPriceSet!=""&&iframeWinds.packageInfo.businessPriceSet!=undefined){
			        			iframeWinds.scoreTypeBtn(iframeWinds.packageInfo.businessPriceSet.checkType,iframeWinds.packageInfo.checkPlan);
			        		}
			        	}
			        	iframeWinds. supplimentInt(1);
			        	iframeWinds.hasData();
			        	iframeWinds.package();
			        	iframeWinds.findWorkflowCheckerAndAccp(row.id);
			        },
					content: 'bidPrice/ProjectCheck/modal/ProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"
				});
				break;
				case 12 : //竞争性谈判
				    WORKFLOWTYPE = "jztp_ggxx";
					top.layer.open({
						type: 2,
						area: ["1100px", "650px"],
						maxmin: true,
						resize: false,
						title: "审核",
						success:function(layero,index){    
				        	var iframeWind=layero.find('iframe')[0].contentWindow;
				        	
				        	iframeWind.du(row.id,row.examType);
				        	iframeWind.Purchase(row.projectId);
				        	iframeWind.PackageCheckList(0);
				        	if(row.examType==1){
				        		iframeWind.packageDetailData();
								if(iframeWind.packageInfo.businessPriceSet!=""&&iframeWind.packageInfo.businessPriceSet!=undefined){
				        			iframeWind.scoreTypeBtn(iframeWind.packageInfo.businessPriceSet.checkType,iframeWind.packageInfo.checkPlan);
				        		}
				        	}
				        	if(row.inviteState==1){
				        		if(row.examType==0){
				        			iframeWind.suppliment();
				        		}else{
				        			iframeWind.supplimentInt(1);
				        		}
				        	}else{
				        		iframeWind.suppliment();
				        	}	
				        	iframeWind.hasData();
				        	iframeWind.package();
				        	iframeWind.findWorkflowCheckerAndAccp(row.id);
				        },
						content: 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"+'&tenderType='+12
					});
					break;
					case 13 : //竞争性磋商
				    WORKFLOWTYPE = "jztp_ggxx";
					top.layer.open({
						type: 2,
						area: ["1100px", "650px"],
						maxmin: true,
						resize: false,
						title: "审核",
						success:function(layero,index){    
				        	var iframeWind=layero.find('iframe')[0].contentWindow;
				        	
				        	iframeWind.du(row.id,row.examType);
				        	iframeWind.Purchase(row.projectId);
				        	iframeWind.PackageCheckList(0);
				        	if(row.examType==1){
				        		iframeWind.packageDetailData();
								if(iframeWind.packageInfo.businessPriceSet!=""&&iframeWind.packageInfo.businessPriceSet!=undefined){
				        			iframeWind.scoreTypeBtn(iframeWind.packageInfo.businessPriceSet.checkType,iframeWind.packageInfo.checkPlan);
				        		}
				        	}
				        	if(row.inviteState==1){
				        		if(row.examType==0){
				        			iframeWind.suppliment();
				        		}else{
				        			iframeWind.supplimentInt(1);
				        		}
				        	}else{
				        		iframeWind.suppliment();
				        	}	
				        	iframeWind.hasData();
				        	iframeWind.package();
				        	iframeWind.findWorkflowCheckerAndAccp(row.id);
				        },
						content: 'bidPrice/ProjectCheck/modal/JtProjectCheckListInfo.html?key=' + row.id + '&edittype=' + "audit"+'&tenderType='+13
					});
					break;
		}
	}
}
//设置查询条件
function queryParams(params) {
	if($("#tenderType").val()==12 ||$("#tenderType").val()==13){
		var workflowType="jztp_ggxx"
	}else{
		var workflowType="xmgg"
	}
	
	
	var para = {
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		workflowType: workflowType,
		// auditState: $("#packageState").val(),
		projectState: $("#packageState").val(),
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val()
	};
	if($("#tenderType").val() != "") {
		para.tenderType = $("#tenderType").val();
	}
	return para;
}
//查询列表
$("#ProjectAuditTable").bootstrapTable({
	url: urlProjectCheckList,
	dataType: 'json',
	method: 'get',
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15,20,25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	clickToSelect: true, //是否启用点击选中行
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: queryParams, //查询条件参数
	striped: true,
	columns: [{
			title: '序号',
			align: 'center',
			width: "50px",
			formatter: function(value, row, index) {
				var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'projectName',
			title: '项目名称',
			align: 'left',	
			formatter:function(value, row, index){
				if(row.projectSource==1){
					var count = row.projectSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
					}else{
						return value+' <span class="text-danger">(重新采购)</span>';
					}
				}else{
					return value;
				}
				
			}
			// formatter: function(value, row, index) {
			// 	if(row.projectSource == 1) {
			// 		if($("#tenderType").val() == 1){
			// 			var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span></div>';
			// 		}else if($("#tenderType").val() == 2){
			// 			var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger" style="font-weight:bold">(重新竞卖)</span></div>';
			// 		}
			// 	} else {
			// 		var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '</div>';
			// 	}
			// 	return projectName;
			// }
		},
		{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width:'200'
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(row.packageSource==1){
					var count = row.packageSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
					}else{
						return value+' <span class="text-danger">(重新采购)</span>';
					}
				}else{
					return value;
				}
				
			}
			// formatter:function(value, row, index){
			// 	if(row.packageSource==1){
			// 		return value+'<span class="text-danger">(重新采购)</span>';
			// 	}else{
			// 		return value;
			// 	}
				
			// }
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width:'200'
		},
		{
			field: 'tenderType',
			title: '项目类型',
			align: 'center',
			width: '120',
			//0为询价采购，1为竞价采购，2为竞卖，3为询价报价，4为招标采购，5为谈判采购，6为单一来源采购，7为框架协议采购，8为战略协议采购
			formatter: function(value, row, index) {
				switch(value) {
					case 0:
					if(row.examType==0){
						return "<div>预审公告审核</div>";
					}else{
						if(row.inviteState==1){
							return "<div>后审邀请函审核</div>";
						}else{
							return "<div>后审公告审核</div>";
						}
					}					 		  
						break;
					case 1:
						return "<div>竞价采购</div>";
						break;
					case 2:
						return "<div>竞卖</div>";
						break;
					case 3:
						return "<div>询价报价</div>";
						break;
					case 4:
						return "<div>招标采购</div>";
						break;
					case 12:
					//console.log(row);
						if(row.isPublic>1){
							return "<div>竞争性谈判采购邀请函</div>";
						}else{
							return "<div>竞争性谈判采购公告</div>";
						}
						break;
					case 13:
						if(row.isPublic>1){
							return "<div>竞争性磋商采购邀请函</div>";
						}else{
							return "<div>竞争性磋商采购公告</div>";
						}
					break;	
					case 6:
						return "<div>单一来源采购</div>";
						break;
					case 7:
						return "<div>框架协议采购</div>";
						break;
					case 8:
						return "<div>战略协议采购</div>";
						break;
				}
			}
		},
		{
			field: 'subDate',
			title: '提交日期',
			align: 'center',
			width: '150'
		},		
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == "0") {
					return "<div class='text-info'>未审核</div>"
				} else if(value == "1") {
					return "<div class='text-warning'>待审核</div>"
				} else if(value == "2") {
					return "<div class='text-success'>审核通过</div>"
				} else if(value == "3") {
					return "<div class='text-danger'>审核未通过</div>"
				}
			}
		},
		{
			field: '#',
			title: '操作',
			align: 'center',
			width: '80',
			events: openAudit,
			formatter: function(value, row, index) {
				if(row.checkState == "2" || row.checkState == "3") {
					return "<button type='button'  class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				} else {
					return "<button type='button'  class='btn btn-xs btn-primary audit'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>审核</button>";
				}	
			}
		}
	]
});