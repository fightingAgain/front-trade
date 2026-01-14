// 2019-03-11 by hwf

var listUrl = config.tenderHost + '/TenderProjectController/judgingPanelPageList.do';  //列表接口

var pushUrl = config.tenderHost + '/TenderProjectController/pushJudgingPanel.do';  //推送接口


$(function(){
	//加载列表
	initDataTab();
	
	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});

	//撤回
	
	$("#projectList").on("click", ".btnPush", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定推送项目?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: pushUrl,
		         type: "post",
		         data: rowData,
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}else{
		        		parent.layer.alert("推送成功");
		        	}
					$("#projectList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	});

});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		pkgCode: $("#pkgCode").val(), // 项目编号
		pkgName: $("#pkgName").val(), // 项目名称	
		examType: 2 // 
	};
	return projectData;
};
//表格初始化
function initDataTab(){
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
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'projectCode',
					title: '项目编号',
					align: 'center',
					width: '200',
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
				},
				{
					field: 'pkgCode',
					title: '标段编号',
					align: 'left',
					width: '200'
				},
				{
					field: 'pkgName',
					title: '标段名称',
					align: 'center'
				},
//				{
//					field: 'state',
//					title: '资格审查方式',
//					align: 'center',
//					width: '100',
//					formatter: function(value, row, index){
//						if(row.pkgId.substr(row.pkgId.length-1,1) == 1){
//							return "资格预审";
//						} else {
//							return "资格后审";
//						}
//					}
//				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '100',
					formatter: function (value, row, index) {
						var str = '<button  type="button" class="btn btn-primary btn-sm btnPush" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>推送</button>';
						
						return str ;

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
	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}
