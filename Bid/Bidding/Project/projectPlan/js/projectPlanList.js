/**

*  招标项目计划列表
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/TenderProjectPlanController/findPageList.do';  //列表接口
var delUrl = config.tenderHost + '/ProjectController/delete.do';  //删除接口
var backUrl = config.tenderHost + '/ProjectController/revokeWorkflowItem.do';  //撤回接口

//var pageEdit = "Bidding/Project/model/projectEdit.html";  //编辑页面
var pageView = "Bidding/Project/projectPlan/model/projectPlanView.html";  //查看页面

var tenderProjectUrl = "Bidding/Project/projectPlan/model/tenderProjectList.html"; //选择招标项目页面
var editHtml = "Bidding/Project/projectPlan/model/projectPlanEdit.html";//编辑页面

$(function(){
	//加载列表
	initDataTab();
	//添加
	$("#btnAdd").click(function(){
		openEdit();
	});
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//编辑
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		var rowData=$('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openView(rowData);
	});
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	if(!index){
		layer.open({
			type: 2,
			title: '选择招标项目',
			area: ['1000px','600px'],
			resize: false,
			content: tenderProjectUrl,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.formFather(formChild);  //调用子窗口方法，传参
			}
		});
	}else{
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openInform(rowData)
	}
};
function formChild(data){
	openInform(data)
}
function openInform(data){
	
		layer.open({
		type: 2,
		title: '编辑',
		area: ['70%','600px'],
		resize: false,
		content: editHtml+ "?id=" + data.id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getInfo(data);  //调用子窗口方法，传参
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(data){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	layer.open({
		type: 2,
		title: "查看招标项目计划",
		area: ['70%','600px'],
		resize: false,
		content: pageView + "?id=" + data.id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMessage(data);  //调用子窗口方法，传参
		}
	});
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorTenderProjectCode: $("#interiorTenderProjectCode").val(), // 标段编号
		tenderProjectName: $("#tenderProjectName").val(), // 标段名称	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
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
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'left',
				},
				{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
				},
				{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'left',
					formatter: function(value, row, index){
						return getOptionValue('tenderProjectType',value)
					}
				},
				{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					width: '150',
					formatter:function(value, row, index){
		            	var str="";
		            	if(value==1){
		            		str="公开招标";
		            	} else if(value==2){
		            		str ="邀请招标";
		            	}
		            	return str;
		            }
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '170px',
					formatter: function (value, row, index) {
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strView + strEdit ;
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
function passMessage(data){
//	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}
