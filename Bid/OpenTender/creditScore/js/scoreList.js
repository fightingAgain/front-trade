/**

 *  信用分列表
 *  方法列表及功能描述
 *   1、initTable()   分页查询
 */

var listUrl = config.OpenBidHost + '/BidOpeningSituationController/findCreditScorePageList.do'; //可以设置信用分的标段列表
var resetflieurl = config.tenderHost + '/DocClarifyController/resetDocClarifyById.do'; //撤回招标文件及附件信息
var deleteUrl = config.tenderHost + '/DocClarifyController/deleteDocClarify.do'; //删除招标文件及附件信息

var editHtml = 'OpenTender/creditScore/model/bidderInfo.html';

//表格初始化
$(function() {
	initTable();

	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();
	});
	

	//编辑
	$("#table").on("click", ".btnEdit", function() {
		var index = $(this).attr("data-index");
		openEdit(index,'EDIT');
	});
	//查看
	$("#table").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openEdit(index,'VIEW');
	});
	
	
	//撤回文件
	$("#table").on("click", ".btnCancel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#table').bootstrapTable('getData')[index];
		parent.layer.confirm('确定撤回该招标文件?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: resetflieurl,
				type: "post",
				data: {
					id: rowData.id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert("撤回成功", {
						icon: 1,
						title: '提示'
					});
					$("#table").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败", {
						icon: 2,
						title: '提示'
					});
				}
			});
		});
	});
	//删除文件
	$("#table").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#table').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: deleteUrl,
				type: "post",
				data: {
					bidSectionId: rowData.bidSectionId,
					examType:2
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert("删除成功", {
						icon: 1,
						title: '提示'
					});
					$("#table").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败", {
						icon: 2,
						title: '提示'
					});
				}
			});
		});
	});
	
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val()
	}
};

/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index,btnType) {
	var rowData = "",jumpUrl = "";
	
	if(index != "" && index != undefined){
		rowData = $('#table').bootstrapTable('getData')[index];
	}
	jumpUrl = editHtml + '?id=' + rowData.id + '&special='+ btnType
	layer.open({
		type: 2,
		title: btnType == 'EDIT'?'编辑信用分':'查看信用分',
		area: ['1000px', '600px'],
		resize: false,
		content: jumpUrl,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData,refreshFather);  //调用子窗口方法，传参
		},
		end:function(){
			$('#table').bootstrapTable('refresh');
		}
	});
}



function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: listUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
			cellStyle:{
				css:widthCode
			}
		}, {
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
			cellStyle:{
				css:widthName
			}
		},{
			field: 'bidStates',
			title: '标段状态',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			formatter: function(value, row, index) {
				// 0.编辑 1.生效 2.撤回 3.招标完成 4.招标失败 5.重新招标
				if(value == 0){
					return "编辑"
				}else if(value == 1){
					return "生效"
				}else if(value == 2){
					return "撤回"
				}else if(value == 3){
					return "招标完成"
				}else if(value == 4){
					return "招标失败"
				}else if(value == 5){
					return "重新招标"
				}
			}
		},{
			field: 'bidOpenType',
			title: '开标类型',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			formatter: function(value, row, index) {
				if(value == 1){
					return "线上开标"
				}else if(value == 2){
					return "线下开标"
				}
			}
		}, {
			field: 'bidOpenTime',
			title: '开标时间',
			align: 'center',
			cellStyle:{
				css:widthDate
			}
		},{
			field: 'stageState',
			title: '开标阶段',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			formatter: function(value, row, index) {
				//1.解密中 2.签名中 3. 唱标 4.开标结束 5.开标失败 6.开标结束中
				if(value == 1){
					return "解密中"
				}else if(value == 2){
					return "签名中"
				}else if(value == 3){
					return "唱标"
				}else if(value == 4){
					return "开标结束"
				}else if(value == 5){
					return "开标失败"
				}else if(value == 6){
					return "开标结束中"
				}
			}
		},{
			field: 'creditScoreStatus',
			title: '信用分录入状态',
			align: 'center',
			cellStyle:{
				css:widthDate
			},
			formatter: function(value, row, index) {
				//0.临时保存 1.提交 2.审核通过 3.审核不通过
				if(value == 0){
					return "未提交"
				}else if(value == 1){
					return "提交"
				}else if(value == 2){
					return "<span style='color:green;'>审核通过</span>"
				}else if(value == 3){
					return "<span style='color:red;'>审核不通过</span>"
				}else{
					return "未编辑"
				}
			}
		},
		{
			field: '',
			title: '操作',
			align: 'left',
			width: '200',
			cellStyle:{
				css:{'white-space':'nowrap'}
			},
			formatter: function(value, row, index) {
				var str = "";
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
				var strChange = '<button  type="button" class="btn btn-primary btn-sm btnChange" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>变更</button>';
				var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
				var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
				
				if(row.creditScoreStatus == 0){
					str = strSee + strEdit
				}else if(row.creditScoreStatus == 1){
					str = strSee
				}else if(row.creditScoreStatus == 2){
					str = strSee
				}else if(row.creditScoreStatus == 3){
					str = strSee + strEdit
				}else{
					str = strEdit
				}
				return str
			}
		}],
	})
};
function refreshFather(){
	$('#table').bootstrapTable('refresh');
}
