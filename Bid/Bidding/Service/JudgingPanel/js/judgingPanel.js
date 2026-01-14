var listUrl = config.JudgesHost + '/ExtractRulesController/pageList.do';

var examineUrl = "Judges/offling/model/examine.html"; // 查看信息
var historyUrl = "Judges/offling/model/history.html"; // 历史记录
var viewResultUrl = "Judges/judgingPanel/model/viewResult.html"; //抽取
var projectPage = "Judges/offling/model/projectDetail.html";  //项目详情页面
//入口函数 
$(function () {
	initJudgeTable() // 初始化表单
});

function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		minStatus:6,
		maxStatus:11,
		'bidSectionCode': $("#bidSectionCode").val(), // 项目编号
		'bidSectionName': $("#bidSectionName").val() // 项目名称	
	};
	return projectData;
};
// 查询按钮初始化数据
$("#btnSearch").click(function () {
	$('#inquirtList').bootstrapTable(('refresh')); 				
});
//表格初始化
function initJudgeTable() {
	$("#inquirtList").bootstrapTable({
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
	            field: 'xh',
	            title: '序号',
	            align: 'center',
	            width: '50',
	            formatter: function (value, row, index) {
	                var pageSize = $('#inquirtList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#inquirtList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
	        }, {
					field: 'bidSectionCode',
					title: '项目编号'
				},
				{
					field: 'bidSectionName',
					title: '项目名称'
				},
				{
					field: 'projectType',
					title: '项目分类',
					align: 'center',
					width: '90',
					formatter: function (value, row, index) {
						var state = '';
						if (row.projectType == '0') {
							state = "<div class='text-primary' style='font-weight:bold'>工程</div>";
							return state;
						} else if (row.projectType == '1') {
							state = "<div class='text-primary' style='font-weight:bold'>货物</div>";
							return state;
						} else {
							state = "<div class='text-primary' style='font-weight:bold'>服务</div>";
							return state;
						}
					}
				},
				{
					field: 'tendererName',
					title: '招标人'
				},
				// {
				// 	field: 'agencyName',
				// 	title: '监抽人',
				// 	align: 'center',
				// 	width: '120'
				// },
				{
					field: 'status',
					title: '状态',
					align: 'center',
					width: 100,
					formatter: function (value, row, index) {
						var state = "";
						if (row.status == "0") {
							state = "<div class='text-danger' style='font-weight:bold'>待组建</div>";
							return state;
						} else if (row.status == "11") {
							state = "<div class='text-success' style='font-weight:bold'>组建完成</div>";
							return state;
						} else if (row.status == "6") {
							state = "<div class='text-warning' style='font-weight:bold'>组建中</div>";
							return state;

						} else if (row.status == '3') {
							state = "<div class='text-primary' style='font-weight:bold'>退回设置</div>";
							return state;
						} else {
							state = "<div class='text-warning' style='font-weight:bold'>补抽中</div>";
							return state
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '200px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:10px;border: none;" onclick=audit_btn(\"' + index + '\")>' +
							'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看信息' +
							'</button>';
						var strHistory = '<button type="button" class="btn-sm btn-warning" style="text-decoration:none;border: none;" onclick=history_btn(\"' + index + '\")>' +
							'<span class="glyphicon glyphicon-file" aria-hidden="true"></span>历史记录' +
							'</button>';
						
						return strSee+ strHistory;

					}
				}
			]
		]
	});
};

// audit_btn 查看信息 
function audit_btn($index) {
	var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var width = top.$(parent).width() * 0.9;
    var height = top.$(parent).height() * 0.9;
	parent.layer.open({
		type: 2, // 使用页面
		area: [width + 'px', height + 'px'],
		content: examineUrl+"?source=1&isSet=2&projectId="+rowData[$index].id,
	})
};

// 历史记录
function history_btn($index) {
	var rowData = $('#inquirtList').bootstrapTable('getData');
	var width = top.$(parent).width() * 0.9;
    var height = top.$(parent).height() * 0.9;
	parent.layer.open({
		type: 2,
		area: [width + 'px', height + 'px'],
		content: historyUrl+"?isSet=2&projectId="+rowData[$index].id,

		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			parent.layer.closeAll("loading");
			iframeWind.getPara(rowData[$index].bidProjectCode, rowData[$index].bidProjectName);
		},
		// 按钮的回调函数
		yes: function (index, layero) {

		},
		btn2: function (index, layero) {

		},
		btn3: function (index, layero) {

		},
	})
}

//组建评委会
function judge_btn($index){
	var rowData = $('#inquirtList').bootstrapTable('getData');
	var width = top.$(parent).width() * 0.9;
    var height = top.$(parent).height() * 0.9;
	parent.layer.open({
		type: 2,
		area: [width + 'px', height + 'px'],
		content: viewResultUrl+"?source=2&isSet=2&projectId="+rowData[$index].id,

		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			parent.layer.closeAll("loading");
		},
		// 按钮的回调函数
		yes: function (index, layero) {

		},
		btn2: function (index, layero) {

		},
		btn3: function (index, layero) {

		},
	})
}

function back_btn($index){
	parent.layer.prompt({title: '请输入退回原因',formType:2}, function(text, index){
		if(!$.trim(text)){
			return;
		}
	    var rowData = $('#inquirtList').bootstrapTable('getData');
	    $.ajax({
	        url: config.JudgesHost + '/ProjectController/revoke.do',
	        type: 'post',
	        dataType: 'json',
	        data: {
	            'id': rowData[$index].id,
	            "returnReason":text
	        },
	        success: function (data) {
	        	parent.layer.close(index);
	            if(data.success){
	            	$('#inquirtList').bootstrapTable(('refresh'));
	            } else {
	            	parent.layer.alert(data.message);
	            }
	        }
	    })
	});
	
}
// 查看项目详情
function project_btn(index, status){
	var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var height = $(window).height() * 0.9;
	var width = $(window).width() * 0.9;
	parent.layer.open({
		type: 2,
		title: rowData[index].bidSectionName + ' 项目详情',
		area: [width + 'px', height + 'px'],
		content: projectPage + '?id='+rowData[index].id+"&status="+status,
		btn: ['返回'],
		success:function(layeor, index){
			parent.layer.closeAll("loading");
		},
		// 保存按钮的回调函数 
		yes: function (index, layero) {
			parent.layer.close(index);
		}
	});
}
