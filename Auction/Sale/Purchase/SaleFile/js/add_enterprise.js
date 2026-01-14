// 表格初始化
var checkboxed = new Array(); //全局数组
var supplierListUrl = top.config.AuctionHost + "/AuctionWasteController/findAuctionFileRecode.do";
var pId = getUrlParam('id');
var dId = getUrlParam('dId');
var flag;

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function duEnterprise(enterpriseIds) {

	if(enterpriseIds) {
		flag = true;
	} else {
		flag = false;
	}
	findItemEnterprise(enterpriseIds);
	initTable();

}

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: supplierListUrl, // 请求url	
		//data:Json,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageList: [5, 10, 25, 50],
		pageNumber: 1, // table初始化时显示的页数
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [{
				field: 'checked',
				checkbox: true,
				formatter: function(i, row) { // 每次加载 checkbox 时判断当前 row 的 id 是否已经存在全局 Set() 里   	
					if(flag == true) {
						if($.inArray(row.enterpriseId, checkboxed) != -1) { // 因为 判断数组里有没有这个 id
							return {
								checked: true,
								disabled: true, // 存在则选中
							}
						}
					} else {
						checkboxed.push(row.enterpriseId);
						return {
							checked: true,
						}
					}
				}
			},
			{
				field: 'enterpriseName',
				title: '企业名称',
				align: 'left',

			},
			{
				field: 'enterpriseCode',
				title: '企业社会信用代码',
				align: 'left',

			}
		],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	var rowDate = {
		enterpriseName: $('#search_3').val(), // 请求时向服务端传递的参数
		pageNumber: params.offset / params.limit + 1, //当前页数
		pageSize: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量	
		projectId: pId,
	};
	return rowDate

};
// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
});

$('#table').on('uncheck.bs.table check.bs.table check-all.bs.table uncheck-all.bs.table', function(e, rows) {
	var datas = $.isArray(rows) ? rows : [rows]; // 点击时获取选中的行或取消选中的行
	examine(e.type, datas); // 保存到全局 Array() 里
});

$("#evenTrue").on('click', function() {

	parent.layer.confirm(
		"提交后不可修改,是否确认提交？", {
			icon: 3,
			title: "提示"
		},
		function(index, layero) {
			SaveFormData(index); //执行保存操作
		},
		function(index) {
			parent.layer.close(index)
		});

})

function examine(type, datas) {
	if(type.indexOf('uncheck') == -1) {
		$.each(datas, function(i, v) {
			// 添加时，判断一行或多行的 id 是否已经在数组里 不存则添加	         
			　　　　　　
			checkboxed.indexOf(v.enterpriseId) == -1 ? checkboxed.push(v.enterpriseId) : -1;　　　　
		});

	} else {
		$.each(datas, function(i, v) {
			checkboxed.splice(checkboxed.indexOf(v.enterpriseId), 1); //删除取消选中行	                   
		});
	};
};

function findItemEnterprise(enterpriseIds) {

	if(enterpriseIds && enterpriseIds.length > 0) {
		$("#evenTrue").hide();
		enterpriseIds = enterpriseIds.split(',');
		checkboxed = enterpriseIds;
	}
};

function SaveFormData(_index) {
	var supplierIds = '';
	if(checkboxed.length > 0) {
		supplierIds = checkboxed.join();
	}
	var para = {
		'id': dId,
		'supplierIds': supplierIds,
	};
	$('#table').bootstrapTable(('refresh'));
	$('#table').bootstrapTable('getAllSelections')
	$.ajax({
		type: "post",
		url: top.config.AuctionHost + "/AuctionWasteController/saveSuppliers.do",
		async: true,
		data: para,
		success: function(res) {
			if(res.success) {
				// Var frameWindow = parent.$('#'+ thisFrame)[0].contentWindow;
				// frameWindow.getAuctionFileInfo();
				parent.layer.close(_index);
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
				var thisFrame = top.window.document.getElementById("SetSupplier").getElementsByTagName("iframe")[0].id;
				var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				dcmt.getAuctionFileInfo();
				// var index = parent.layer.getFrameIndex(window.name);
				//          parent.layer.close(index);

			} else {
				parent.layer.alert(res.message);
			}
		}
	});
}