var listUrl = config.tenderHost + '/ControlPriceController/findBidSectionList.do';  //列表接口
var delUrl = config.tenderHost + '/ControlPriceController/delete.do';  //删除接口
var revokeUrl = config.tenderHost + '/ControlPriceController/revokeWorkflowItem.do';  //撤回
var changeUrl = config.tenderHost + '/ControlPriceController/change.do';  //变更接口

var pageEdit = "Bidding/ControlPrice/model/controlPriceEdit.html";  //编辑页面
var pageView = "Bidding/ControlPrice/model/controlPriceView.html";  //查看页面
var bidSectionPage = "Bidding/ControlPrice/model/bidSectionList.html";	//标段列表


$(function(){
	
	initDataTab();
	
	$('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 0, //0是不新增，1是新增
		QueryName: 'btnSearch',
		queryList: [{
				name: '标段编号',
				value: 'interiorBidSectionCode',
				type: 'input',
			},
			{
				name: '标段名称',
				value: 'bidSectionName',
				type: 'input',
			},
			{
				name: '状态',
				value: 'checkState',
				type: 'select',
				option: [ ]
			}
		]
	});
	$("#checkState").addClass("select")
	$("#checkState").attr("selectName","projState")
	//加载列表
	initData();
	
	//添加
	$("#btnAdd").click(function(){
		openEdit("");
	});
	//查询
	$("#btnSearch").click(function(){
		$("#tabList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#checkState").change(function(){
		$("#tabList").bootstrapTable('destroy');
		initDataTab();
	});
	//编辑
	$("#tabList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tabList').bootstrapTable('getData')[index];
		openEdit(rowData);
	});
	//变更
	$("#tabList").on("click", ".btnChange", function(){
		var index = $(this).attr("data-index");
		//openView(index);
		var rowData = $('#tabList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定变更?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
		         url: changeUrl,
		         type: "post",
		         data: {id: rowData.controlPriceId},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}else{
		        		openChang(rowData,data.data);
		        	}
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
		    });
		});
	});
	

	//查看
	$("#tabList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//撤回
	$("#tabList").on("click", ".btnRevoke", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tabList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定撤回?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
		         url: revokeUrl,
		         type: "post",
		         data: {bidSectionId: rowData.id,examType: 2},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	parent.layer.alert("撤回成功");
		         	$("#tabList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
		     });
		});
	});
	
	
	//删除
	$("#tabList").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tabList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
		         url: delUrl,
		         type: "post",
		         data: {bidSectionId: rowData.id,examType: 2},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		         	parent.layer.alert("删除成功");
		         	$("#tabList").bootstrapTable("refresh");
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
function openEdit(rowData){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var url = "";
	if(rowData != "" && rowData != undefined){
		url = pageEdit + "?id=" + rowData.id + "&controlpriceid=" + rowData.controlPriceId,
		title = "编辑控制价";
	} else {
		url = bidSectionPage;
		title = "选择标段"
	}
	
	
	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		resize: false,
		content: url,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData,refreshFather);  //调用子窗口方法，传参
		}
	});
}

/**
 * 打开变更查看
 */
function openChang(rowData,id){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var url = pageEdit + "?bidSectionId=" + rowData.id + "&controlpriceid=" + id,
	title = "编辑控制价";
	
	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		resize: false,
		content: url,
		success:function(layero, index){
			//刷新列表
			$("#tabList").bootstrapTable("refresh");
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData,refreshFather);  //调用子窗口方法，传参
		}
	});
}

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.9;
	var rowData=$('#tabList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看控制价信息",
		area: ['1200px', '600px'],
		resize: false,
		content: pageView + "?isThrough=" + (rowData.checkState == 2 ? 1 : 0)+"&id=" + rowData.id  + "&controlpriceid=" + rowData.controlPriceId,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
//数据初始化
function initData() {
	//状态
	initSelect('.select');
	$('<option value="">全部</option>').prependTo("#checkState");
	$("#checkState").val("");
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 项目编号
		bidSectionName: $("#bidSectionName").val(), // 项目名称	
		checkState: $("#checkState").val() // 项目状态	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tabList").bootstrapTable({
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
		height: top.tableHeight,
		toolbar:"#toolbar",
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
		                var pageSize = $('#tabList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tabList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
					field: 'tenderMode',
					title: '招标方式',
					align: 'left',
					width:'120',
					align:'center',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter:function(value, row, index){
						return parent.Enums.tenderType[value];
					}
				},
				{
					field: 'createDate',
					title: '创建时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'checkState',
					title: '状态',
					align: 'center',
					width: '120',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function(value, row, index){
						//0为未审核，1为审核中，2为审核通过，3为审核不通过
						if(value == -1) {
							return "<span>未编辑</span>";
						} else if(value == 0) {
							return "<span style='color:red;'>未提交</span>";
						} else if(value == 1) {
							return "<span style='color:red;'>审核中</span>";
						} else if(value == 2) {
							return "<span style='color:green;'>审核通过</span>";
						} else if(value == 3) {
							return "<span style='color:red;'>审核不通过</span>";
						} else if(value == 4){
							return "<span style='color:red;'>已撤回</span>";
						}
					}
				},
				{
					field: 'checkState',
					title: '操作',
					align: 'left',
					width: '220px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strChange = '<button  type="button" class="btn btn-primary btn-sm btnChange" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>变更</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnRevoke" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.checkState == 0) { //0为临时保存，1为提交审核，2为审核通过，3为审核未通过
								str += strSee + strEdit + strDel;
							} else if(row.checkState == 1) {
								str += strSee + strCancel;
							} else if(row.checkState == 2) {
								str += strSee + strChange;
							} else if(row.checkState == 3) {
								str += strSee + strEdit + strDel;
							} else if(value == 4){
								str += strSee + strEdit;
							} else {
								str += strEdit;
							}
							return str;
						}else{
							if(row.checkState == '-1'){
								return '';
							}else{
								return strSee;
							}
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
function passMessage(data){
	console.log(JSON.stringify(data));
	$("#tabList").bootstrapTable("refresh");
}
/*var tool = {
	refreshFather: function(){
		$('#table').bootstrapTable('refresh');
	}
}
window.tools = tool;*/
function refreshFather(){
	$('#tabList').bootstrapTable('refresh');
}