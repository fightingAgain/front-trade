var listUrl = config.tenderHost + '/ProjectController/pageReceiveList.do';  //委托接收项目列表接口
//var delUrl = config.tenderHost + '/ProjectController/delete.do';  //列表接口
var sendTo = "Bidding/Project/TakeOver/model/sendProjectTo.html";  //项目派项
var sendUrl = config.tenderHost + '/ProjectController/updateReceive.do';  //接受委托请求地址

$(function(){
	//加载列表
	parent.initData();
	initDataTab();
	
	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#receiveState").change(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	
	//查看
	$("#projectList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
	//	接受委托
	$("#btnAdd").click(function(){
		//获取选中的项目信息
		var data = $("#projectList").bootstrapTable('getSelections');
		//至少选中一个项目
		if(data.length<1){
			parent.layer.alert('请选择接收项目！')
		}else{
			var ids = [];
			// 获取项目id，以数组的形式传给后台
			for(var i = 0;i<data.length;i++){
				ids.push(data[i].id)
			}
			console.log(ids)
			layer.alert('确认接收委托？', function(index){
				$.ajax({
				  	type:"post",
				  	url: sendUrl,
				  	traditional:true,
				  	async:true,
				  	data: {
				  		'ids': ids,
				  		'receiveState':1,
				  	},
				  	success: function(){
				  		//请求成功后刷新列表
				  		$("#projectList").bootstrapTable("refresh");
				  	},
				  	error: function(){
				  		
				  	},
				});
				  
				layer.close(index);
			});   
			
			
		}
		
	})
});

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 * 派项给项目经理
 */
function openView(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#projectList').bootstrapTable('getData'); //bootstrap获取当前页的数据
//	console.log("^^^^"+JSON.stringify(rowData));
	layer.open({
		type: 2,
		title: "派项",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: sendTo + "?id=" + rowData[index].id,
		success:function(layero, index){
			
		}
	});
}
//数据初始化
/*function initData() {
	var html = "";
 	var projState = parent.Enums.projState;
 	for(var key in projState){
 		html += '<option value="'+key+'">'+projState[key]+'</option>';
 	}
 	$(html).appendTo("#projectState");
}*/
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
//		projectCode: $("#projectCode").val(), // 项目编号
		projectName: $("#projectName").val(), // 项目名称	
//		projectState: $("#projectState").val() // 项目状态	
		type: 2,
		isAll: 1,
		receiveState: $("#receiveState").val()
		
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
            checkboxed = row
        },
		columns: [
				[{
	        		checkbox:true
	        	},{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '80',
					formatter: function (value, row, index) {
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'projectCode',
					title: '项目编号',
					align: 'left'
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
				},
				{
					field: 'tendererName',
					title: '招标人名称',
					align: 'center'
				},
				{
					field: 'userName',
					title: '项目经理',
					align: 'center'
				},
				{
					field: 'receiveState',
					title: '状态',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){
						return parent.Enums.receiveState[value];
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>派项</button>';
						/*var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-primary btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤销</button>';
						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';*/
						/*if(row.projectState == 0){
							str += strSee + strEdit + strDel;
						} else if(row.projectState == 1){
							str += strSee + strApproval;
						} else if(row.projectState == 2){
							str += strSee;	
						} else if(row.projectState == 3){
							str += strSee + strEdit + strDel;
						}*/
						
						return strSee ;

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
