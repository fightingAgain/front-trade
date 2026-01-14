var checkboxed = "";
var projectend = "";
var iframeWind = "";
var tenderTypeCode, enter;
var inExamType = 1;
//初始化
$(function() {
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {
		if(PAGEURL.split("?")[1].split("=")[0] == "tenderType") { //单一
			tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];
		}
		if(PAGEURL.split("?")[1].split("=")[0] == "enter") { //单一
			enter = PAGEURL.split("?")[1].split("=")[1];
		}
	} else { //评审		
		tenderTypeCode = 0;
		enter = 4;
	}
	sessionStorage.setItem('tenderTypeCode', tenderTypeCode); //0是询比采购  6是单一来源采购，并缓存	
	initTable();
	$("#packageState").on('change', function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();	
	})
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();	    				
	});
});
/// 表格初始化
var deletProjectUrl = config.bidhost + '/PurchaseController/deleteProject.do' //删除项目接口
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人的信息
var recallUrl = config.bidhost + '/WorkflowController/updateInviteWorkflow.do' // 撤回项目的接口
var noticeStateUrl = config.bidhost + '/PurchaseController/updateNoticeState.do' //手动发布公告
var saveProjectPackage = config.bidhost + '/PurchaseController/startWorkflowAccep.do'; //添加包件的接口
var deletPackageUrl = config.bidhost + '/PurchaseController/deletePackage.do' //删除包件接口
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.bidhost + '/PurchaseController/findInvitationList.do', // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
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
		onCheck: function(row) {
			checkboxed = row.id;
			projectend = row.project.projectState;

		},
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
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180',
		}, {
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',

		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180',
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
		}, {
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(value == 0) {
					return '资格预审';
				} else {
					return '资格后审';
				}

			}

		}, {
			field: 'noticeState',
			title: '邀请状态',
			align: 'center',
			width: '80',
			formatter: function(value, row, index) {
				var State = "";
				if(row.examType == 1) {
					if(row.packageState == 2) {
						if(value == 1) { //审核状态。0为未审核，1为审核中，2为审核通过。3为审核未通过
							State = "<div class='text-success' style='font-weight:bold'>已发布</div>";

						} else { //审核为非未通过的状态都为未发布
							State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
						}
					} else {
						State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
					}
				} else {
					if(row.packageState == 2) {
						if(row.inviteState == 1) { //审核状态。0为未审核，1为审核中，2为审核通过。3为审核未通过
							State = "<div class='text-success' style='font-weight:bold'>已发布</div>";

						} else { //审核为非未通过的状态都为未发布
							State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
						}
					} else {
						State = "<div class='text-danger' style='font-weight:bold'>未发布</div>";
					}
				}

				return State
			}
		}, {
			field: 'packageState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				if(row.inviteState == 1) {
					if(value == 1) {
						return '审核中';
					} else if(value == 2) {
						return "<div class='text-success' style='font-weight:bold'>审核通过</div>";
					} else if(value == 3) {
						return "<div class='text-danger' style='font-weight:bold'>审核不通过</div>";
					} else {
						return '未提交';
					}
				} else {
					return '未提交';
				}

			}

		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '150',
			formatter: function(value, row, index) {
				//编辑
				var State = '<button href="javascript:void(0)"  type="button" class="btn-xs btn btn-primary"  onclick=edit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑' +
					'</button>'

				//撤回
				var States = '<button href="javascript:void(0)"  type="button" class="btn-xs btn btn-warning" onclick=recall(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回' +
					'</button>'
				//查看
				var audit = '<button href="javascript:void(0)"  type="button" class="btn-xs btn btn-primary" onclick=audit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看' +
					'</button>'
				// 删除
				var delet = '<button class="btn-xs btn btn-danger" href="javascript:void(0)" onclick=deletPackage(\"' + index + '\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</button>'
				if(row.createType != undefined && row.createType == 1) {
					return '<div class="btn-group-xs">' + audit + '</div>';
				} else {

					if(row.packageState == 2) {
						if(row.inviteState == 1) {
							return '<div class="btn-group-xs">' + audit + '</div>';
						} else {
							return '<div class="btn-group-xs">' + State + delet + '</div>';
						}
					} else if(row.packageState == 1) {
						return '<div class="btn-group-xs">' + audit + States + '</div>';
					} else {
						return '<div class="btn-group-xs">' + State + delet + '</div>';
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
		'offset': params.offset, // SQL语句偏移量
		'enterpriseType': '02',
		'inviteState': $('#search_1').val(), // 根据发布状态查询
		'packageName': $('#search_3').val(), // 根据项目名称查询
		'tenderType': 0,
		'packageSource': 1
	};

};
//撤回
function recall($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('温馨提示：确定要撤回该邀请函？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"businessId": rowData.id,
				'examType': rowData.examType,
			},
			success: function(data) {
				if(data.success) {
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

}
//添加
function add_bao() {
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择重新采购',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: 'Auction/common/Agent/invAgainPurchase/model/add_project.html?tenderType=0&examType=1',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;			
		}
	});
};

//编辑功能
function edit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var inurl = 'Auction/common/Agent/invAgainPurchase/model/invitationInfo.html'
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '发送邀请函',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: inurl+'?projectType=' + rowData[$index].projectType+"&projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType='+rowData[$index].examType+'&createType='+rowData[$index].createType,
		success: function(layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			
		}
	});
}
//删除包件
function deletPackage($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('温馨提示：删除邀请函的同时，系统会删除其对应的采购文件、评审项。您确定要删除该公告？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		if(top.sysEnterpriseId){
			var arrlist = sysEnterpriseId.split(',');
			if(arrlist.indexOf(top.enterpriseId)!=-1){
				reDeposit(rowData)
			}
		}
		$.ajax({
			url: deletPackageUrl, //修改包件的接口
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {

				'id': rowData.id,
			},
			success: function(data) {
				if(data.success == true) {
					parent.layer.alert("删除成功");
					$('#table').bootstrapTable(('refresh'));
					
				} else {
					parent.layer.alert(data.message)
				}
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});
}
//查看
function audit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据  
	var inurl = 'Auction/common/Agent/invitation/model/invitationCheck.html'
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看邀请函',
		area: ['1100px', '600px'],
		maxmin: true //开启最大化最小化按钮
			,
		content: inurl+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType='+rowData[$index].examType+'&createType='+rowData[$index].createType,
		success: function(layero, index) {
				var iframeWins = layero.find('iframe')[0].contentWindow;
				
			}
			//确定按钮
			,
	});
};

function GetTime(time) {
	var date = new Date(time).getTime();

	return date;
};

function reDeposit(rowData){
	$.ajax({
		url: config.bidhost+'/DepositDivertController/proPurchaseAgainRecall.do',
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": rowData.projectId,
			"packageId":rowData.id,
			'projectForm': 0,			
		},
		success: function(data) {
			
		},
	});
}