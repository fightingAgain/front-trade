var listUrl = config.tenderHost + '/ProjectController/pageAgencyList.do'; //列表接口
var delUrl = config.tenderHost + '/ProjectController/delete.do'; //删除接口
var backUrl = config.tenderHost + '/ProjectController/revokeWorkflowItem.do'; //撤回接口

var pageEdit = "Bidding/Project/model/projectEdit.html"; //编辑页面
var pageView = "Bidding/Project/model/projectView.html"; //查看页面
var pageReview = "Bidding/Model/review.html"; //审核页面

$(function() {
	/*ca测试*/
	$('#btnCA').click(function() {
		layer.open({
			type: 2,
			title: 'CA校验',
			area: ['100%', '100%'],
			resize: false,
			content: 'Bidding/Project/CAcheck.html',
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
			}
		});
	})
	
	initDataTab();

	/*$('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 1, //0是不新增，1是新增
		QueryName:'btnSearch',
		AddName:'btnAdd',
		queryList: [{
				name: '项目编号',
				value: 'interiorProjectCode',
				type: 'input',
			},
			{
				name: '项目名称',
				value: 'projectName',
				type: 'input',
			},
			{
				name: '状态',
				value: 'projectState',
				type: 'select',
				option: [

				]
			}
		]
	});*/
	$("#projectState").addClass("select")
	$("#projectState").attr("name","projectState")
	$("#projectState").attr("selectname","projState")
	
	//加载列表
	initSelect('.select');
	$('<option value="">全部</option>').prependTo("#projectState");
	$("#projectState").val("");

	//添加
	$("#btnAdd").click(function() {
		openEdit("");
	});
	//查询
	$("#btnSearch").click(function() {
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function() {
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
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
	//删除标段
	$("#projectList").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该项目?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: delUrl,
				type: "post",
				data: {
					id: rowData.id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					} else {
						parent.layer.alert("删除成功");
					}
					$("#projectList").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	});
	//撤回审核
	$("#projectList").on("click", ".btnRevoke", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定撤回该项目?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: backUrl,
				type: "post",
				data: {
					id: rowData.id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					} else {
						parent.layer.alert("撤回审核成功！");
					}
					$("#projectList").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	});
	//审核
	$("#projectList").on("click", ".btnApproval", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#projectList').bootstrapTable('getData')[index];
		top.layer.open({
			type: 2,
			title: "项目审核",
			area: ['600px', '300px'],
			content: pageReview + "?id=" + rowData.id + "&workflowtype=xmsh",
			success: function(layero, index) {}
		});
	});
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.8;
	var rowData = "",
		url = pageEdit,
		title = "添加项目信息";
	if(index != "" && index != undefined) {
		rowData = $('#projectList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		url += "?id=" + rowData.id;
		title = "编辑项目信息";
	}

	layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.8;
	var rowData = $('#projectList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看项目信息",
		area: ['100%','100%'],
		resize: false,
		content: pageView + "?id=" + rowData[index].id + "&isThrough=" + (rowData[index].projectState == 2 ? 1 : 0),
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
		},
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorProjectCode: $("#interiorProjectCode").val(), // 项目编号
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态	
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
		height: top.tableHeight,
		toolbar:"#toolbar",
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					cellStyle: {
						css: widthXh
					},
					formatter: function(value, row, index) {
						var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					}
				}, {
					field: 'interiorProjectCode',
					title: '项目编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'tendererName',
					title: '招标人名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				//				{
				//					field: 'userName',
				//					title: '项目经理',
				//					align: 'left',
				//					cellStyle: {
				//						css:{'white-space':'nowrap'}
				//					}
				//				},
				{
					field: 'projectState',
					title: '状态',
					align: 'center',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {
						if(value == '0') {
							return "未提交";
						} else if(value == '1') {
							return "审核中";
						} else if(value == '2') {
							return "<span style='color:green;'>审核通过</span>";
						} else if(value == '3') {
							return "<span style='color:red;'>审核未通过</span>";
						} else if(value == '4') {
							return "<span style='color:blue;'>已撤回</span>";
						} else if(value == '5') {
							return "<span style='color:orange;'>变更中</span>";
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
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
						var strRevoke = '<button  type="button" class="btn btn-primary btn-sm btnRevoke" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
						//						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤回修改</button>';
						//						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						var strSet = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="' + index + '"><span class="glyphicon glyphicon-ok-circle"></span>项目成员设置</button>';
						// if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.projectState == 0) {
								str += strSee + strEdit + strDel;
							} else if(row.projectState == 1) {
								str += strSee + strRevoke;
							} else if(row.projectState == 2) {
								str += strSee + strRevoke;
							} else if(row.projectState == 3) {
								str += strSee + strEdit + strDel;
							} else if(row.projectState == 4) {
								str += strSee + strEdit + strDel;
							} else if(row.projectState == 5) {
								str += strSee + strEdit + strDel;
							}
							if(row.isManager == 1) {
								return str + strSet;
							} else {
								return str;
							}
						// }else{
						// 	return strSee;
						// }
						

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
	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}