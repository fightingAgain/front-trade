/**
*  zhouyan 
*  2019-5-13
*  选择项目
*  方法列表及功能描述
*/

var listUrl = config.tenderHost + '/getDepartmentEmployee.do'; //获取分配的项目信息列表

var notIds;//已选中的成员
var biders = {};
$(function(){
	
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
});
function formFather(data,callback){
	notIds = data;
	
	//加载列表
	initDataTab();
	//确定
	$("#btnSure").click(function(){
		var biderData = [];
//		console.log(biders)
		for(var i in biders){
			biderData.push(biders[i]);
		}
//		var row = getChild();
//		console.log(biderData)
		if(biderData){
			if(biderData.length == 0){
				parent.layer.alert("请选择项目成员！",{icon:7})		
			}
			callback(biderData);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index);
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
}
function getChild(){
	var row = $("#tableList").bootstrapTable("getSelections");
	if(row.length>0){
		var index=parent.layer.getFrameIndex(window.name);
    	parent.layer.close(index);
    	return row
	}else{
		parent.layer.alert("请选择项目成员！",{icon:7})			
	}
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'userName': $("#userName").val(), // 标段编号
		'notIds':notIds
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
		height: 500,
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
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
        		
        		parent.layer.aler(data.message);
        	}
        },
        //点击全选框时触发的操作
    onCheckAll:function(rows){
     for(var i = 0; i< rows.length; i++){
			biders[rows[i].id] = rows[i];
		  }
    },

		//点击每一个单选框时触发的操作
    onCheck:function(row){
			biders[row.id] = row;
    },
		//取消每一个单选框时对应的操作；
    onUncheck:function(row){
     delete biders[row.id];
    },
		
		columns: [
			{
				checkbox: true,
				formatter : function(value, row, index) {
				if(biders[row.id]) {
					return {
						checked: true, //设置选中
//						disabled: true //设置是否可用
					};
				}
			}
		    },
			{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
	                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
			},
			{
				field: 'logCode',
				title: '帐号',
				align: 'left',
			},
			{
				field: 'userName',
				title: '姓名',
				align: 'center',
				width: '150',
			},
			{
				field: 'tel',
				title: '员工联系电话 ',
				align: 'center',
				width: '200',
			}
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
