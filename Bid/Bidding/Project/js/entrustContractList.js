/**
*  zhouyan 
*  2019-5-16
*  项目管理列表
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/MandateContractController/findSubmitPageList.do';  //列表接口

var editHtml = "Bidding/Contract/EntrustContract/model/entrustContractEdit.html";//编辑页面
var callback;


$(function(){
	//加载列表
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//确定
	$("#btnSure").click(function(){
		var row = getChild();
		if(row){
			callback(row);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index);
		}
	});
	//关闭
	$("#btnClose").click(function(){
		var index=parent.layer.getFrameIndex(window.name);
    	parent.layer.close(index);
	});
	//新增
	$("#btnAdd").on("click", function(){
		openEdit();
	});
});
function getChild(){
	var row = $("#tableList").bootstrapTable("getSelections");
	if(row.length>0){
		var index=parent.layer.getFrameIndex(window.name);
    	parent.layer.close(index);
    	return row
	}else{
		parent.layer.alert("请选择委托合同");			
	}
}

/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(){
	var width = $(parent).width() * 0.8;
	var height = $(parent).height() * 0.9;
	var url = editHtml;
	top.layer.open({
		type: 2,
		title: '委托合同',
		area: ['1000px', '650px'],
		resize: false,
		content: url +"?source=2",
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		},
		end:function(){
			$("#tableList").bootstrapTable("refresh");
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
		height: 500,
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
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
				radio: true
			},{
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
					title: '委托合同',
					align: 'left',
				},
				{
					field: 'tendererEnterprisName',
					title: '招标人',
					align: 'left',
				},
				{
					field: 'contractState',
					title: '合同状态',
					width: '100',
					align: 'center',
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
					width: '160'
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
	callback = data.callback;
}
