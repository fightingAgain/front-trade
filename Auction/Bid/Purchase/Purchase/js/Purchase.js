var iframeWind = "";
//初始化
$(function () {
	/* 东咨智采平台采购人专区，询比采购下“项目信息”和“包件信息”菜单页面，隐藏“新建项目”和“新建包件”功能按钮，仅限“岚图汽车销售服务有限公司”和“岚图汽车科技有限公司” */
	var hideCodeArr = ['91420100MA49KU580R','91420100MA4F0N7L7F'];//岚图汽车销售服务有限公司、岚图汽车科技股份有限公司
	if(hideCodeArr.indexOf(top.EnterpriseData.enterpriseCode) > -1){
		$('#btn_add').hide();
	}else{
		$('#btn_add').show();
	}
	/* 东咨智采平台采购人专区，询比采购下“项目信息”和“包件信息”菜单页面，隐藏“新建项目”和“新建包件”功能按钮，仅限“岚图汽车销售服务有限公司”和“岚图汽车科技有限公司” --end */
	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function () {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();
	});
});
/// 表格初始化

var deletProjectUrl = config.bidhost + '/PurchaseController/deleteProject.do'//删除项目接口
var noticeStateUrl = config.bidhost + '/PurchaseController/updateNoticeState.do'//手动发布公告
var recallUrl = config.bidhost + "/WorkflowController/updateProjectState.do"// 撤回项目的接口
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.bidhost + '/PurchaseController/findPurchase.do', // 请求url	
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		paginationLoop: false,//第一页或者最后一页时，prve和next不可点击
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25, 50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		height: top.tableHeight,
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
			formatter: function (value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'project.projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180',
		}, {
			field: 'project.projectName',
			title: '采购项目名称',
			align: 'left',
			width: '650',
			formatter: function (value, row, index) {
				var projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.project.projectName + '</div>';
				return projectName;
			}
		}, {
			field: 'project.subDate',
			title: '创建时间',
			align: 'center',
			width: '160'
		}, {
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter: function (value, row, index) {
				if (value == 0) {
					return '资格预审';
				} else {
					return '资格后审';
				}

			}
		}, {
			field: 'project.projectState',
			title: '项目状态',
			align: 'center',
			width: '100',
			formatter: function (value, row, index) {
				var State = ""
				if (row.project.projectState == 2) {
					State = "<div class='text-success' style='font-weight:bold'>已确认</div>";
					return State;
				} else {
					State = "未确认";
					return State;
				};
			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '130',
			formatter: function (value, row, index) {
				var recall = '<button id="btn_delete" type="button" class="btn-xs btn  btn-warning" onclick=recall_btn(\"' + row.projectId + '\")>'
					+ '<span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回'
					+ '</button>'
				var State = '<button type="button" class="btn-xs btn btn-primary" onclick=edit_btn(\"' + index + '\")>'
					+ '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑'
					+ '</button>'
				var audit = '<button type="button" class="btn-xs btn btn-primary" onclick=audit_btn(\"' + index + '\")>'
					+ '<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看'
					+ '</button>'
				var deletes = '<button type="button" class="btn-xs btn btn-danger" onclick=deletes_btn(\"' + row.projectId + '\")>'
					+ '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除'
					+ '</button>'
				if (row.project.isAgent == 1) {
					return '<div class="btn-group-xs" >' + audit + '</div>';
				} else {
					if (row.createType == 1) {
						return '<div class="btn-group-xs" >' + audit + '</div>';
					} else {
						if (row.project.projectState == 2) {
							return '<div class="btn-group-xs" >' + audit + recall + '</div>';
						} else {
							return '<div class="btn-group-xs" >' + State + deletes + '</div>';
						}

					}
				}

			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'enterpriseType': '04',
		'project.tenderType': 0,
		'project.projectState': $('#search_1').val(), // 请求时向服务端传递的参数
		'project.projectName': $('#search_3').val(), // 请求时向服务端传递的参数	
	};
};

function deletes_btn(uid) {
	parent.layer.confirm('温馨提示：您确定要删除该项目吗？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		parent.layer.close(index);
		parent.layer.prompt({
			formType: 2,
			value: '',
			resize: false,
			maxmin: false,
			maxlength: 100,
			title: '请输入删除原因',
		}, function (value, index, elem) {
			parent.layer.close(index);
			$.ajax({
				url: deletProjectUrl,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: {
					"id": uid,
					"reason": value,
				},
				success: function (data) {
					$('#table').bootstrapTable(('refresh'));
				},
				error: function (data) {
					parent.layer.alert("删除失败")
				}
			});
		});
	}, function (index) {
		parent.layer.close(index)
	});
}
// 撤回功能
function recall_btn(uid) {
	parent.layer.confirm('确定要撤回该项目？', {
		btn: ['是', '否'] //可以无限个按钮
	}, function (index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId": uid,
				//'accepType':'xmgg'  		
			},
			success: function (data) {
				if (data.success) {
					parent.layer.alert("撤回成功!")
					setTimeout(function () {
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)

				} else {
					parent.layer.alert(data.message)
				}

			},
			error: function (data) {
				parent.layer.alert("撤回失败")
			}
		});
		parent.layer.close(index);
	}, function (index) {
		parent.layer.close(index)
	});

}
//添加功能
function add_btn() {
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '新建项目'
		, area: ['1000px', '600px']
		, content: 'Auction/common/Purchase/Purchase/model/addProjectModel.html'
		//确定按钮
		, success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.$("input[name='project.tenderType']").val(0);
			iframeWind.$("input[name='project.projectSource']").val(0);
		}
	});
};
//编辑功能
function edit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData');//bootstrap获取当前页的数据	
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '编辑项目信息'
		, area: ['1000px', '600px']
		, maxmin: true //开启最大化最小化按钮
		, content: 'Auction/common/Purchase/Purchase/model/editProjectModel.html?projectId=' + rowData[$index].projectId
		, id: 'purchaser'
		, success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.$("input[name='project.tenderType']").val(rowData[$index].project.tenderType);
			if (rowData[$index].project.tenderType == 6) {
				iframeWind.$(".examTypeNone").hide();
				iframeWind.$('.cols6').attr('colspan', '3')
			}
		}
	});
}
//查看
function audit_btn($index) {
	var rowData = $('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
	parent.layer.open({
		type: 2 //此处以iframe举例
		, title: '查看项目信息'
		, area: ['1000px', '600px']
		, maxmin: true //开启最大化最小化按钮
		, content: 'Auction/common/Purchase/Purchase/model/viewPurchase.html?projectId=' + rowData[$index].projectId + '&createType=' + rowData[$index].createType
	});
};

function GetTime(time) {
	var date = new Date(time).getTime();

	return date;
};

