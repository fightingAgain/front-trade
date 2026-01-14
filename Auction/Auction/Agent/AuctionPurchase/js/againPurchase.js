var iframeWind = "";
//初始化
$(function() {
	initTable();
});
/// 表格初始化
var purchaseaddurl = 'Auction/Auction/Agent/AuctionPurchase/model/againPurchaseAddModel.html' //重新竞价的添加的页面路径
var auditPurchase = 'Auction/Auction/Agent/AuctionPurchase/model/auditPurchase.html' //查看路径
var editPurchase = 'Auction/Auction/Agent/AuctionPurchase/model/AuctionInfo.html' //编辑路径
var deletProjectUrl = config.AuctionHost + '/AuctionPurchaseController/deleteAuctionProject.do'
var recallUrl = config.AuctionHost + "/WorkflowController/updateAuctionXmggState.do"; // 撤回项目的接口
var noticeStateUrl = config.AuctionHost + "/AuctionPurchaseController/updateNoticeState.do" //公告发布
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.AuctionHost + '/AuctionPurchaseController/pageAuctionPurchase.do', // 请求url
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [5, 15, 25, 50],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'project.projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'project.projectName',
			title: '采购项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.project.projectSource == 1) {
					var projectName = '<span style="white-space: normal;">' + row.project.projectName + '</span>';
				} else {
					var projectName = '<span style="white-space: normal;">' + row.project.projectName + '</span>';
				}
				return projectName;
			}
		}, {
			field: 'project.subDate',
			title: '创建时间',
			align: 'center',
			width: '160'
		}, {
			title: '发布时间',
			field: 'noticeStartDate',
			align: 'center',
			width: '160'
		}, {
			field: 'project.projectState',
			title: '审核状态',
			align: 'center',
			width: '110',
			formatter: function(value, row, index) {
				var State = ""
				if(row.project.projectState == 0) {
					State = "未审核";
					return State
				}
				if(row.project.projectState == 1) {
					State = "审核中";
					return State
				}
				if(row.project.projectState == 2) {
					State = "<div style='font-weight:bold' class='text-success'>审核通过</div>";
					return State
				} else {
					State = "<div style='font-weight:bold' class='text-danger'>审核未通过</div>";
					return State
				}
			}
		}, {
			field: 'project.projectState',
			title: '发布状态',
			align: 'center',
			width: '90',
			formatter: function(value, row, index) {
				var State = ""
				if(row.project.projectState == 2) {
					if(row.noticeState == 1) {
						State = "<div class='text-success' style='font-weight:bold'>已发布</div>";
						return State
					} else {
						State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
						return State
					}
				} else {
					State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
					return State
				}

			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '200',
			formatter: function(value, row, index) {
				var recall = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm  btn-warning" style="text-decoration:none;border: none;" onclick=recall_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>撤回' +
					'</button>'
				var noticeState = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm  btn-primary" style="text-decoration:none;border: none;margin-right:5px;" onclick=noticeStateBtn(\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-check" aria-hidden="true"></span>发布' +
					'</button>'
				var State = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:5px;border:none" onclick=edit_btn(\"' + index + '\",' + row.project.projectState + ')>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑' +
					'</button>'
				var audit = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:5px;border:none" onclick=audit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看' +
					'</button>'
				var deletes = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-danger" style="text-decoration:none;border:none" onclick=deletes_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除' +
					'</button>'
				if(row.createType != undefined && row.createType == 1) {
					return '<div class="btn-group-sm" style="text-align:left">' + audit + '</div>';
				} else {
					if(row.project.projectState == 2) { //发布状态为审核通过
						if(row.noticeState == 0) { //未发布
							if(row.settingNotice == 1) { //手动发布
								return '<div class="btn-group-sm" style="text-align:left">' + audit + noticeState + recall + '</div>';
							} else { //自动发布
								return '<div class="btn-group-sm" style="text-align:left">' + audit + recall + '</div>';
							}
						} else if(row.noticeState == 1) { //已发布
							return '<div class="btn-group-sm" style="text-align:left">' + audit + '</div>';
						}
					} else if(row.project.projectState == 1) { //
						return '<div class="btn-group-sm" style="text-align:left">' + audit + recall + '</div>';
					} else {
						return '<div class="btn-group-sm" style="text-align:left">' + State + deletes + '</div>';
					}
				}
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // 每页的第一个行的序号，第一页是0，第二页收10...	
		'project.projectSource': 1, //项目来源0为首次公告发布，1为重新竞价
		'enterpriseType': '02', //登陆人的身份。0为采购人，1为供应商
		'project.tenderType': 1, //采购方式0为询价采购、1为竞低价2、竞卖
		'project.isAgent': 1,
		'project.projectName': $('#projectName').val(), // 查询条件，项目名称	
	}
};
// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

function deletes_btn($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('确定要删除该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		if(top.sysEnterpriseId){
			var arrlist = sysEnterpriseId.split(',');
			if(arrlist.indexOf(top.enterpriseId)!=-1){							
				reDeposit(rowData)
			}
		}
		$.ajax({
			url: deletProjectUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"projectId": rowData.projectId
			},
			success: function(data) {
				if(data.success){
					parent.layer.alert("删除成功");
					$('#table').bootstrapTable(('refresh'));
					
				}
			},
			error: function(data) {
				parent.layer.alert("修改失败");
			}
		});
		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});
}
// 撤回功能
function recall_btn($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('确定要撤回该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": rowData.projectId,
				'accepType': 'xmgg'
			},
			success: function(data) {
				if(data.success) {
					parent.layer.alert("撤回成功!")
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						
				} else {
					parent.layer.alert(data.message)
				}
			},
			error: function(data) {
				parent.layer.alert("撤回失败")
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

};
//发布公告功能
function noticeStateBtn(uid) {
	parent.layer.confirm('确定要发布该项目 ', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: noticeStateUrl,
			type: 'post',
			async: false,
			data: {
				"projectId": uid,

			},
			success: function(data) {
				setTimeout(function() {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
				}, 200)
				parent.layer.close(index);
			},
			error: function(data) {
				parent.layer.alert("发布失败")
			}
		});

	}, function(index) {
		parent.layer.close(index)
	});
};
//添加功能
function add_btn() {
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '添加重新竞价',
		area: ['1100px', '600px'],
		maxmin: true, //开启最大化最小化按钮
		content: purchaseaddurl,
		/* btn: ['确定重新竞价', '取消']
			//确定按钮
			, */
		success: function(layero, index) {
			iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function(){
				iframeWin.du();
				if(iframeWin.dase == "") {
					parent.layer.alert("请选择包件")
				
					return
				}
				$.ajax({
					url: config.AuctionHost + '/AuctionPurchaseController/againSaveAuctionPurchase.do',
					type: 'post',
					dataType: 'json',
					//contentType:'application/json;charset=UTF-8',
					async:false,
					data: {
						"projectId": iframeWin.gid,
						"purchaseId": iframeWin.uid,
						"packageId": iframeWin.dase,
						'enterpriseType': '02',
						'prefixOrder': orderSoruc.sys,
					},
					success: function(data) {
						if(data.success){
							$('#table').bootstrapTable(('refresh'));
							parent.layer.close(index); //关闭当前弹出框 
						}else{
							parent.layer.alert(data.message)
						}
						
					}
				});
			});
		},	
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow; //获取子页面的所有方法        
			iframeWin.du();
			if(iframeWin.dase == "") {
				parent.layer.alert("请选择包件")

				return
			}
			$.ajax({
				url: config.AuctionHost + '/AuctionPurchaseController/againSaveAuctionPurchase.do',
				type: 'post',
				dataType: 'json',
				//contentType:'application/json;charset=UTF-8',
				async:false,
				data: {
					"projectId": iframeWin.gid,
					"purchaseId": iframeWin.uid,
					"packageId": iframeWin.dase,
					'enterpriseType': '02',
					'prefixOrder': orderSoruc.sys,
				},
				success: function(data) {
					$('#table').bootstrapTable(('refresh'));
					parent.layer.close(index); //关闭当前弹出框 
				}
			});
			
			                 
		}
	});
}

//编辑功能
function edit_btn($index, projectState) { //$index当前选择行的下标，projectState是当前选择行的审核状态0为未审核，1为审核中，2为审核通过。
	if(projectState == 1) {
		parent.layer.alert("审核中无法编辑");
		return
	}
	if(projectState == 2) {
		parent.layer.alert("通过审核无法编辑");
		return
	}
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据  
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '修改竞价采购公告',
		area: ['1100px', '600px'],
		id: 'packageclass',
		maxmin: true //开启最大化最小化按钮
			,
		resize:false,
		content: editPurchase + '?projectId=' + rowData[$index].projectId+'&projectSource='+rowData[$index].project.projectSource,
		success: function(layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;			
		}
	});
}
//查看
function audit_btn($index) { //$index当前选择行的下标
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	parent.layer.open({
		type: 2, //此处以iframe举例
		title: '查看',
		area: ['1000px', '600px'],
		maxmin: true, //开启最大化最小化按钮
		resize:false,
		content: auditPurchase + '?projectId=' + rowData[$index].projectId+'&projectSource='+rowData[$index].project.projectSource,
		// btn: ['关闭'], //确定按钮	
		yes: function(index, layero) {
			parent.layer.close(index);
		}
	});
};

function reDeposit(rowData){
	$.ajax({
		url: config.AuctionHost+'/DepositDivertController/proPurchaseAgainRecall.do',
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": rowData.projectId,
			'projectForm': 1,			
		},
		success: function(data) {
			
		},
	});
}