var listUrl = config.tenderHost + '/SupervisePersonController/pageReleaseList.do';  //列表接口
var delUrl = config.tenderHost + '/SupervisePersonController/updateSupervisePerson.do';  //列表接口
var editPage = "Bidding/BidOpen/SetSupervisor/model/supervisorEdit.html";  //编辑页面

$(function(){
	//加载列表
	initTable();
	
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('refresh');
	});
	
	//编辑
	$("#tableList").on("click", ".btnSet", function(){
		var index = $(this).attr("data-index");
		openEdit(index, 1);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openEdit(index, 2);
	});
	//删除
	$("#tableList").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		layer.confirm('确定删除?', {icon: 3, title:'提示'}, function(idx){
			layer.close(idx);
			deletes(index);
		});
	});
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index, source){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "监标人",
		area: ['800px', '600px'],
		content: editPage + "?enterprisid=" + rowData.enterprisId + "&source=" + source + "&code=" + rowData.interiorBidSectionCode + "&name=" + encodeURIComponent(encodeURIComponent(rowData.bidSectionName))+"&bidid=" + rowData.bidSectionId,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData.supervisePersons);  //调用子窗口方法，传参
		}
	});
}

/*
  * 删除
  */
 function deletes(index) {
 	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
     $.ajax({
         url: delUrl,
         type: "post",
         data: {packageId:rowData.bidSectionId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			$('#tableList').bootstrapTable("refresh");
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 }


// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'pkgCode': $("#pkgCode").val(), // 项目编号
		'pkgName': $("#pkgName").val() // 项目名称	
	};
	return projectData;
};
//表格初始化
function initTable() {
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
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
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
						var strJudge =	'<button type="button" class="btn btn-sm btn-primary btnSet" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>设置</button>';
//						var strBack = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						
						if(row.bidOpenStates == 1){
							str += strSee + strJudge;
						} else {
							str += strSee;
						}
						
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
	$("#tableList").bootstrapTable("refresh");
}
