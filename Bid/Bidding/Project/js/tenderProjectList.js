var listUrl = config.tenderHost + '/TenderProjectController/pageList.do'; //列表接口
var delUrl = config.tenderHost + '/TenderProjectController/delete.do'; //列表接口
var pageEdit = "Bidding/Project/model/tenderProjectEdit.html"; //编辑页面
var pageView = "Bidding/Project/model/tenderProjectView.html"; //查看页面
var workflowUrl = config.tenderHost + '/updateWorkflowItem.do'; //审核接口
var revokeUrl = config.tenderHost + '/TenderProjectController/revokeWorkflowItem.do'; //撤回接口

var setHtml = "Bidding/Project/projectManage/model/projectManageEdit.html"; //项目成员设置页面
var hasFileUrl = config.tenderHost + '/DocClarifyController/getBidFileStatesByTenderProjectId.do';//撤回时查询招标（预审）文件是否已提交
$(function() {
	//加载列表
	  
	initDataTab();

	/*$('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 1, //0是不新增，1是新增
		QueryName: 'btnSearch',
		AddName:'btnAdd',
		queryList: [{
				name: '招标项目编号',
				value: 'interiorTenderProjectCode',
				type: 'input',
			},
			{
				name: '招标项目名称',
				value: 'tenderProjectName',
				type: 'input',
			},
			{
				name: '状态',
				value: 'projState',
				type: 'select',
				option: [

				]
			}

		]
	})*/
	
	$("#projState").addClass("select")
	$("#projState").attr("name","tenderProjectState");
	$("#projState").attr("selectName","projState");
	
	
	initSelect('.select');
	$('<option value="">全部</option>').prependTo("#projState");
	$("#projState").val("");

	//添加
	$("#btnAdd").click(function() {
		openEdit("");
	});
	//查询
	$("#btnSearch").click(function() {
		$("#projectList").bootstrapTable('destroy');
		initDataTab()
	});
	// 状态查询
	$("#projState").change(function() {
		$("#projectList").bootstrapTable('destroy');
		initDataTab()
	});

	//编辑
	$("#projectList").on("click", ".btnEdit", function() {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#projectList").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openView(index);
	});
	//审核
	$("#projectList").on("click", ".btnApproval", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		top.layer.open({
			type: 2,
			title: "招标项目审核",
			area: ['600px', '300px'],
			content: pageReview + "?id=" + rowData.id + "&workflowtype=zbxmsh",
			success: function(layero, index) {}
		});
	});
	//删除招标项目
	$("#projectList").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该招标项目?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			parent.layer.prompt({
				formType: 2,
				value: '',
				resize: false,
				maxmin: false,
				maxlength: 100,
				title: '请输入删除原因',
			}, function(value, ind, elem) {
				parent.layer.close(ind);
				$.ajax({
					url: delUrl,
					type: "post",
					data: {
						'id': rowData.id,
						'reason': value
					},
					success: function(data) {
						if(data.success == false) {
							parent.layer.alert(data.message);
							return;
						}
						parent.layer.alert("删除成功");
						$("#projectList").bootstrapTable("refresh");
					},
					error: function(data) {
						parent.layer.alert("加载失败");
					}
				});
			})
			
		});
	});
	//撤回招标项目
	$("#projectList").on("click", ".btnCancel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定撤回该招标项目?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			getHasFile('project', rowData.id, revokeProject, '此招标项目下有标段已提交招标文件，建议先撤回所有标段的招标文件，否则部分信息无法修改');
		});
	});
	function revokeProject(id){
		$.ajax({
			url: revokeUrl,
			type: "post",
			data: {
				id: id
			},
			success: function(data) {
				if(data.success == false) {
					parent.layer.alert(data.message);
					return;
				}
				parent.layer.alert("撤回成功");
				$("#projectList").bootstrapTable("refresh");
			},
			error: function(data) {
				parent.layer.alert("加载失败");
			}
		});
	}
	//项目成员设置
	$("#projectList").on("click", ".btnSet", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		parent.layer.open({
			type: 2,
			title: '项目成员设置',
			area: ['1000px', '650px'],
			resize: false,
			content: setHtml + '?id=' + rowData.id,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var interiorTenderProjectCode = parent.layer.getChildFrame('#interiorTenderProjectCode', index);
				var tenderProjectName = parent.layer.getChildFrame('#tenderProjectName', index);
				interiorTenderProjectCode.val(rowData.interiorTenderProjectCode);
				tenderProjectName.val(rowData.tenderProjectName);
				//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
			}
		});
	})
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = "",
		url = pageEdit,
		title = "添加招标项目信息";
	if(index != "" && index != undefined) {
		rowData = $('#projectList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		if(rowData.pretrialSum && Number(rowData.pretrialSum) > 0) {
			if((rowData.fulfilSum && Number(rowData.pretrialSum) > Number(rowData.fulfilSum)) || !rowData.fulfilSum) {
				url = pageView + "?id=" + rowData.id + "&tenderProjectState=" + rowData.tenderProjectState + '&isTurn=1';
				title = "预审转后审";

			} else {
				url = pageEdit + "?id=" + rowData.id;
				title = "编辑招标项目信息";
			}
		} else {
			url = pageEdit + "?id=" + rowData.id;
			title = "编辑招标项目信息";
		}
	}

	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		resize: false,
		content: url,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData); //调用子窗口方法，传参
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#projectList').bootstrapTable('getData'); //bootstrap获取当前页的数据

	layer.open({
		type: 2,
		title: "查看招标项目信息",
		area: ['100%', '100%'],
		resize: false,
		content: pageView + "?id=" + rowData[index].id + "&tenderProjectState=" + rowData[index].tenderProjectState + "&owner=" + rowData[index].owner,
		success: function(layero, index) {

		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorTenderProjectCode: $("#interiorTenderProjectCode").val(), // 项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 项目名称	
		tenderProjectState: $("#projState").val() // 项目状态	
	};
	return projectData;
};
//表格初始化
function initDataTab() {
	$("#projectList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		onCheck: function(row) {
			id = row.id;
		},
		fixedColumns: true,
		fixedNumber: 2,
		height:tableHeight,
		toolbar:"#toolbar",
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					cellStyle: {
						//css: widthXh
					},
					formatter: function(value, row, index) {
						var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				}, {
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'left',
					cellStyle: {
						//css: widthCode
					}
				},
				{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle: {
						//css: widthName
					}
				},
				{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						if(value) {
							return getTenderType(value);
						}
					}
				},
				{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					width: '120',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						return parent.Enums.tenderType[value];
					}
				},
				{
					field: 'examType', //资格审查方式 1资格预审 2资格后审
					title: '资格审查方式',
					align: 'center',
					width: '120',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						if(value == 1) {
							return '资格预审'
						} else if(value == 2) {
							return '资格后审'
						}
					}
				},
				{
					field: 'tenderProjectState',
					title: '状态',
					align: 'center',
					cellStyle: {
						//css: widthState
					},
					formatter: function(value, row, index) {
						if(value == 0) {
							return "<span style='color:red;'>未提交</span>";
						} else if(value == 1) {
							return "<span style='color:red;'>审核中</span>";
						} else if(value == 2) {
							return "<span style='color:green;'>审核通过</span>";
						} else if(value == 3) {
							return "<span style='color:red;'>审核不通过</span>";
						} else if(value == 4) {
							return "<span style='color:red;'>已撤回</span>";
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '220px',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>'
						//						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						//						var strSet = '<button  type="button" class="btn btn-success btn-sm btnSet" data-index="'+index+'"><span class="glyphicon glyphicon-cog"></span>项目成员设置</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.tenderProjectState == 0) {
								str += strSee + strEdit + strDel;
							} else if(row.tenderProjectState == 1) {
								str += strSee + strCancel;
							} else if(row.tenderProjectState == 2) {
								if(row.pretrialSum && Number(row.pretrialSum) > 0) {
									if((row.fulfilSum && Number(row.pretrialSum) > Number(row.fulfilSum)) || !row.fulfilSum) {
										str += strSee + strEdit
									} else {
										str += strSee + strCancel;
									}
								} else {
									str += strSee + strCancel;
								}
							} else if(row.tenderProjectState == 3) {
								str += strSee + strEdit + strDel;
							} else if(row.tenderProjectState == 4) {
								str += strSee + strEdit + strDel;
							}
							return str;
						}else{
							return strSee;
						}
						

					}
				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	//	console.log(JSON.stringify(data));
	//	$("#projectList").bootstrapTable("refresh");
}