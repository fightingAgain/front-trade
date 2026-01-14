var listUrl = config.tenderHost + '/ProjectController/pageTenderList.do';  //列表分页接口
var delUrl = config.tenderHost + '/ProjectController/delete.do';  //列表删除项目接口

var pageEdit = "Bidding/Tenderee/Project/model/projectEdit.html";  //编辑页面
var pageView = "Bidding/Tenderee/Project/model/projectView.html";  //查看页面
var pageReview = "Bidding/Model/review.html"; //审核页面

$(function(){
	//加载列表
	initData();
	initDataTab();
	//添加
	$("#btnAdd").click(function(){
		openEdit("");
	});
	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	//编辑
	$("#projectList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#projectList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//删除标段
	$("#projectList").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#projectList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该项目?', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: delUrl,
		         type: "post",
		         data: {id:rowData.id},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		            parent.layer.alert("删除成功");
					$("#projectList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	})
	//审核
	$("#projectList").on("click", ".btnApproval", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#projectList').bootstrapTable('getData')[index];
		top.layer.open({
			type: 2,
			title: "项目审核",
			area: ['600px', '300px'],
			content: pageReview + "?id=" + rowData.id + "&workflowtype=xmsh",
			success:function(layero, index){
			}
		});
	});
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData="",
		url = pageEdit,
		title = "添加项目信息";
	if(index != "" && index != undefined){
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
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#projectList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	console.log("^^^^"+JSON.stringify(rowData));
	layer.open({
		type: 2,
		title: "查看项目信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?id=" + rowData[index].id,
		success:function(layero, index){
			
		}
	});
}
//数据初始化
function initData() {
	var html = "";
 	var projState = parent.Enums.projState;
 	for(var key in projState){
 		html += '<option value="'+key+'">'+projState[key]+'</option>';
 	}
 	$(html).appendTo("#projectState");
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		projectCode: $("#projectCode").val(), // 项目编号
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val(), // 项目状态
		type:1,//查询类型   1业主 2 代理机构
		isAll:1 //   是否查询企业下所有的项目   1是  0否
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
					width: '200',
					align: 'center'
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
				},
				{
					field: 'agencyEnterprisName',
					title: '代理机构名称',
					align: 'left'
				},
				{
					field: 'userName',
					title: '项目经理',
					align: 'center',
					width: '120'
				},
				{
					field: 'projectState',
					title: '审核状态',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){
						return parent.Enums.projState[value];
					}
				},
				{
					field: 'receiveState',
					title: '接收状态',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){//0为暂未处理，1为接收，2为拒绝，3为驳回
						if(value == 0){
							return '<span>暂未处理</span>'
						}else if(value == 1){
							return '<span>接收</span>'
						}else if(value == 2){
							return '<span>拒绝</span>'
						}else if(value == 3){
							return '<span>驳回</span>'
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						//var strCancel = '<button  type="button" class="btn btn-primary btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤销</button>';
						//var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						if(row.projectState == 0 ){
							if(row.receiveState == undefined){
								str += strSee + strEdit + strDel;
							}else if(row.receiveState == 0){
								str += strSee + strDel;
							}else if(row.receiveState == 1 || row.receiveState == 2){
								str += strSee; 
							}else if(row.receiveState == 3){
								str += strSee + strEdit + strDel;
							}
						}else{
							str += strSee;
						}
						/*else if(row.projectState == 1){
							str += strSee + strDel;
						} else if(row.projectState == 2){
							str += strSee;	
						} else if(row.projectState == 3){
							str += strSee + strEdit + strDel;
						}*/
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
