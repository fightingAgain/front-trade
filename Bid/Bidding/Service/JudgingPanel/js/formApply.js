var listUrl = config.JudgesHost + '/ProjectController/pageList.do';
var pushUrl = config.JudgesHost + '/ProjectController/push.do';

var examineUrl = "Judges/offling/model/examine.html"; // 查看信息
var settingUrl = "Judges/offling/model/setting.html"; // 参数设定
var historyUrl = "Judges/offling/model/history.html"; // 历史
var projectPage = 'Judges/offling/model/addProjectList.html';  //项目列表
var projectDetailPage = 'Judges/offling/model/projectDetail.html';  //项目信息
var addProjectPage = 'Judges/offling/model/addProject.html';  //添加项目信息
var enterpriseName = "";
//入口函数 
$(function () {
	initJudgeTable() // 初始化表单
	getLogUser();
	$("#btnSelect").click(function(){
		var height = $(window).height() * 0.9;
		var width = $(window).width() * 0.9;
		parent.layer.open({
			type: 2,
			title: '选择项目',
			area: [width + "px", height + "px"],
			content: projectPage,
			btn: ['保存', '取消'],
			success:function(layero, index){
				parent.layer.closeAll("loading");
				var rowData = $('#inquirtList').bootstrapTable('getData');
//				console.log(JSON.stringify(rowData));
			},
			// 保存按钮的回调函数 
			yes: function (index, layero) {
				parent.layer.close(index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var obj = iframeWin.checkboxed;
				pushProject(obj);
				
			},
			btn2: function (index, layero) {},
		});
	})
});

function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		minStatus:0,
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
	        },{
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
						return projectData[value];
						
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
					width: '100',
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
						} else if (row.status == '9'){
							state = "<div class='text-warning' style='font-weight:bold'>补抽中</div>";
							return state
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '300px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:5px;border: none;" onclick=audit_btn(\"' + index + '\")>' +
							'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看信息' +
							'</button>';
						var strHis = '<button type="button" class="btn-sm btn-warning" style="text-decoration:none;border: none;" onclick=history_btn(\"' + index + '\")>' +
							'<span class="glyphicon glyphicon-file" aria-hidden="true"></span>历史记录' +
							'</button>';
						var strProject = '<button type="button" class="btn-sm btn-primary" style="text-decoration:none;border: none;margin-right:5px;" onclick=project_btn('+index+','+row.status+')>' +
							'<span class="glyphicon glyphicon-file" aria-hidden="true"></span>项目详情' +
							'</button>';
						return strSee + strHis;

					}
				}
			]
		]
	});
};
// 查看项目详情
function project_btn(index, status){
	var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var height = $(window).height() * 0.9;
	var width = $(window).width() * 0.9;
	parent.layer.open({
		type: 2,
		title: rowData[index].bidSectionName + ' 项目详情',
		area: [width + 'px', height + 'px'],
		content: projectDetailPage + '?id='+rowData[index].id+"&status="+status,
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
// 添加项目按钮
function add_btn() {
	var height = $(window).height() * 0.6;
	var width = $(window).width() * 0.4;
	parent.layer.open({
		type: 2,
		title: '添加新的项目',
		area: [width + 'px', height + 'px'],
		content: addProjectPage + '?enterpriseName='+encodeURIComponent(encodeURIComponent(enterpriseName)),
		btn: ['保存', '取消'],
		// 保存按钮的回调函数 
		yes: function (index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			
			if (iframeWin.$("#pkgCode").val() == "") {
				parent.layer.alert("项目编号不能为空");
				return;
			};
			if (iframeWin.$("#pkgName").val() == "") {
				parent.layer.alert("项目名称不能为空");
				return;
			};
			if (iframeWin.$("#tendererName").val() == "") {
				parent.layer.alert("招标人企业名称不能为空");
				return;
			};
			if (iframeWin.$("#agencyName").val() == "") {
				parent.layer.alert("代理机构名称不能为空");
				return;
			};
			if (iframeWin.$("input:radio[name='isProxy']:checked").val() == "" || iframeWin.$("input:radio[name='isProxy']:checked").val() == undefined) {
				parent.layer.alert("请选择是否为代理项目");
				return;
			};
			iframeWin.save(); //执行回调函数
			
		},
		btn2: function (index, layero) {},
	});
};
// audit_btn 查看信息 
function audit_btn($index) {
	var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var height = $(window).height() * 0.9;
	var width = $(window).width() * 0.9;
	parent.layer.open({
		type: 2, // 使用页面
		area: [width + 'px', height + 'px'],
		content: examineUrl + "?source=1&isSet=1&projectId="+rowData[$index].id,
	})
};
// set_btn 参数设定 
function set_btn($index) {
	var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var height = $(window).height() * 0.9 ;
	var width = $(window).width()*0.9 ;
	parent.layer.open({
		type: 2,
		area: [width + 'px', height + 'px'],
		content: settingUrl+"?projectId="+rowData[$index].id+"&status="+rowData[$index].status,

		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			parent.layer.closeAll("loading")
		},
		// 按钮的回调函数
		yes: function (index, layero) {

		},
		btn2: function (index, layero) {

		},
		btn3: function (index, layero) {

		},
	})
};

// 历史记录
function history_btn($index) {
	 var rowData = $('#inquirtList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var height = $(window).height()*0.9 ;
	var width = $(window).width()*0.9 ;
	parent.layer.open({
		type: 2,
		area: [width + 'px', height + 'px'],
		content: historyUrl+"?projectId="+rowData[$index].id,

		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			parent.layer.closeAll("loading");
			iframeWind.getPara(rowData[$index].bidSectionCode, rowData[$index].bidSectionName)
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

//选择项目
function pushProject(obj){
	$.ajax({
         url: pushUrl,
         type: "post",
         async: false,
         data: obj,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
             parent.layer.alert("添加成功");
			$("#inquirtList").bootstrapTable(('refresh'));
         },
         error: function (data) {
             parent.layer.alert("添加失败")
         }
     });
}
//获取登录信息
function getLogUser(){
	$.ajax({
         url: config.JudgesHost + '/getLogUser',
         type: "post",
         async: false,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
            enterpriseName = data.data.user.enterpriseName;
         },
         error: function (data) {
//           parent.layer.alert("添加失败");
         }
     });
}
