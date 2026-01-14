/**
*  zhouyan 
*  2019-10-24
*  变量列表
*  方法列表及功能描述
*/

var tenderUrl = config.Syshost + '/TempWebVariableController/findVariableListByType.do'; //获取所有变量列表
var checkboxed;
var options = {
		data:[],  //已被选中列表的id集合
		isMulti:false,   //是否多选，true为是，false为单选
		'tenderProjectState': 2  ,
		callback:function(){}
	};
var bidSetions = {};
var selectColumn = "";
var useType = '';//会议类型
$(function(){
	useType = $.getUrlParam('useType');//公告列表中带过来的标段Id
	
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();
	});
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(callback){
	getTendereeList();
	//确定
	$("#btnSure").click(function(){
		var row = $("#tableList").bootstrapTable("getSelections");
		if(row.length>0){
			callback(row);
			var index=top.layer.getFrameIndex(window.name);
            top.layer.close(index);
		}else{
            top.layer.alert("请选择变量")
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
	
}

function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url: tenderUrl,
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
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onLoadError:function(){
            top.layer.closeAll("loading");
            top.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){
            top.layer.closeAll("loading");
        	if(!data.success){

                top.layer.alert(data.message);
        	}
        },
        columns: [
        {
        	radio:true
        },
        {
			field: 'variableName',
			title: '变量名称',
			align: 'left',
		},
		{
			field: 'variableFormat',
			title: '变量内容',
			align: 'left',
		}]
    });
//  $("#tableList").bootstrapTable("load", newList);
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'variableName': $("#variableName").val(), 
        'tempType':'report'
    }
}