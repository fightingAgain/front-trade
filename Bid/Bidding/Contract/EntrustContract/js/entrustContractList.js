/**
*  zhouyan 
*  2019-5-16
*  项目管理列表
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/MandateContractController/findPageList.do';  //列表接口
var delUrl = config.tenderHost + '/MandateContractController/delete.do';  //列表接口

var editHtml = "Bidding/Contract/EntrustContract/model/entrustContractEdit.html";//编辑页面
var viewHtml = "Bidding/Contract/EntrustContract/model/entrustContractView.html";//查看页面


$(function(){
	//加载列表
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//新增
	$("#btnAdd").on("click", function(){
		openEdit();
	});
	//编辑
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//删除合同
	$("#tableList").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#tableList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该合同?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: delUrl,
		         type: "post",
		         data: {id:rowData.id},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}else{
		        		parent.layer.alert("删除成功");
		        	}
					$("#tableList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	});
	
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var url = editHtml;
	if(index!=undefined || index == 0){
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		url += "?contractId=" + rowData.id + "&tenderProjectId=" + rowData.id;
	}
	layer.open({
		type: 2,
		title: '委托合同',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url ,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#tableList').bootstrapTable('getData')[index];
	var url = viewHtml + "?contractId=" + rowData.id;
	layer.open({
		type: 2,
		title: '查看委托合同',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url ,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		contractName: $("#contractName").val(), // 委托合同名称
		tendererEnterprisName: $("#tendererEnterprisName").val(), // 招标人名称	
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
		height: top.tableHeight,
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
		height:tableHeight,
		toolbar:"#toolbarTop",
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
					field: 'contractName',
					title: '委托合同名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				{
					field: 'tendererEnterprisName',
					title: '招标人名称',
					align: 'left',
				},
				{
					field: 'contractState',
					title: '合同状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {
						if(value == 0){
							return '未提交'
						}else if(value == 1){
							return '<span style="color:green;">已提交</span>'
						}
					}
				},
				{
					field: 'createTime',
					title: '创建时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'center',
					width: '230px',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView =	'<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>查看</button>';
						var strDel =	'<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						/*if(row.contractState == 0){
							return strEdit + strDel;
						}else if(row.contractState == 1){
							return strView;
						}*/
						return strEdit + strView + strDel;
						

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
