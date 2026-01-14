/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */


var bidSectionPage = 'Bidding/BidSituation/BuyOfflineCheck/model/bidSectionList.html';  //标段列表
var pageEdit = 'Bidding/BidSituation/BuyOfflineCheck/model/supplierEdit.html';  //编辑投标人购标信息
var pageView = 'Bidding/BidSituation/BuyOfflineCheck/model/supplierView.html';  //编辑投标人购标信息

var listUrl = config.tenderHost + '/SupplierSignController/selectfinancialPageByBidSectionId.do';  //线下购标的供应商列表
var deleteUrl = config.tenderHost + '/SupplierSignController/delete.do';  //线下购标的供应商列表
var importExcelUrl = config.tenderHost + '/SupplierSignController/importExcel.do';  //线下购标的供应商列表
var exportExcelUrl = config.tenderHost + '/SupplierSignController/exportExcel.do';  //线下购标的供应商列表
var bidSectionId = "";  //招标文件id

var examType = 2;
$(function(){
		
	//选择标段
	$("#btnChoose").click(function(){
		openChoose();
	});
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	$("#btnBuy").click(function(){
		if(bidSectionId == ""){
			top.layer.alert("请选择标段");
			return;
		}
		openEdit();
	})
	
	//保存按钮
	$("#btnSave").click(function() { 
		
		saveForm(true);
	});
	//提交审核
	$("#btnSubmit").click(function() {
		
		saveForm(false);
		
	});
	
	//编辑
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index, 1);
	});
	//查看
	$("#tableList").on("click", ".btnCheck", function(){
		var index = $(this).attr("data-index");
		openView(index, 2);
	});
	//删除文件
	$("#tableList").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该购标信息?', {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: deleteUrl,
				type: "post",
				data: {
					id: rowData.id
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
					$("#tableList").bootstrapTable("refresh");
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
	$("#btnDownLoad").click(function(){
		exportExcel();
	})
});
//excel导入
function importf(obj){ 
  	var f = obj.files[0];
	var formFile = new FormData();
	formFile.append("bidSectionId", bidSectionId); 
	formFile.append("file", f); //加入文件对象
	var data=formFile
   $.ajax({
		type: "post",
		url: importExcelUrl,
		async: false,
		dataType: 'json',
		cache: false,//上传文件无需缓存
        processData: false,//用于对data参数进行序列化处理 这里必须false
        contentType: false, //必须
		data: data,
		success: function(data) {	
			$("#tableList").bootstrapTable("refresh");
		}
	});
	
}
//导出模版
function exportExcel(){
	window.location.href =$.parserUrlForToken(exportExcelUrl) ;
}

//其他页面调用的方法
function passMessage(data){
	if(data){
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
		bidSectionId = data.bidSectionId; 
		getTendereeList();
	}
}

/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index) {
	var width = window.$(parent).width() * 0.9;
	var height = window.$(parent).height() * 0.9;
	var tenderId = "";
	if(index != "" && index != undefined){
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		tenderId = rowData.id;
	}
	parent.layer.open({
		type: 2,
		title: "购标人信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageEdit + "?bidSectionId=" + bidSectionId + "&id=" + tenderId,
		success: function(layero, idx) {
//			var iframeWin = layero.find('iframe')[0].contentWindow;	
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		},
		end:function(){
			$('#tableList').bootstrapTable(('refresh'));
		}
	});
}
/*
 * 打开查看窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index, state) {
	var width = window.$(parent).width() * 0.9;
	var height = window.$(parent).height() * 0.9;
	var tenderId = "";
	if(index != "" && index != undefined){
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		tenderId = rowData.id;
	}
	parent.layer.open({
		type: 2,
		title: "购标人信息",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?bidSectionId=" + bidSectionId + "&id=" + tenderId + "&source="+state,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(function(){
				$('#tableList').bootstrapTable(('refresh'));
			});  //调用子窗口方法，传参
		}
	});
}


/*
 * 打开标段页面
 */
function openChoose(){
	var width = window.$(parent).width() * 0.9;
	var height = window.$(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: '标段',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: bidSectionPage,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({callback:chooseCallback});  //调用子窗口方法，传参
		}
	});
}
/**
 * 选择标段回调方法
 * @param {Object} data  
 */
function chooseCallback(data){
	if(data.length > 0){
		$("#interiorBidSectionCode").html(data[0].interiorBidSectionCode);
		$("#bidSectionName").html(data[0].bidSectionName);
		bidDocClarifyId = data[0].id;
	}
}


function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:listUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        toolbar: '#toolbar', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onLoadError:function(){
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		
        		parent.layer.alert(data.message);
        	}
        },
        columns: [
        {
			field: 'xh',
			title: '序号',
			width: '50',
			align: 'center',
			formatter: function (value, row, index) {
                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
		},
        {
			field: 'invoice',
			title: '投标人',
			align: 'left',
		},
		{
			field: 'createTime',
			title: '下单日期',
			align: 'left',
		},		
		{
			field: 'linkMen',
			title: '联系人',
			align: 'left',
		},
		{
			field: 'linkPhone',
			title: '手机',
			align: 'left',
		},
		{
			field: 'states',
			title: '状态',
			align: 'left',
			formatter: function (value, row, index) {
				if(value == 0){
					return "未提交";
				} else if(value == 1){
					return "审核中";
				} else if(value == 2){
					return "审核通过";
				} else if(value == 3){
					return "审核未通过";
				}
			}
		},
		{
			field: 'states',
			title: '操作',
			align: 'left',
			width:'170px',
			formatter: function (value, row, index) {

				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				var strCheck = '<button  type="button" class="btn btn-primary btn-sm btnCheck" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>审核</button>';
				if(value == 1){
					return strCheck;
				} else {
					return strSee;
				}
			}
		}]
    });

}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'bidSectionId': bidSectionId // 项目编号
    }
}
