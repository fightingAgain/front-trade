var tenderUrl = config.tenderHost + '/ProjectController/pageAgencyListAll.do'; //获取分配的项目信息列表
var checkboxed;
var tendererName = "";
var enterpriceId = "";
var options = "";
var selectColumn = "";
$(function(){
	
	$("#btnSearch").click(function () {
		$('#tableList').bootstrapTable(('refresh')); 				
	});
	
	//确定
	$("#btnSave").click(function(){
		options.callback($("#tableList").bootstrapTable("getSelections"));
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
});

function passMessage(data){
	
	var defaults = {
		idList:[],  //已被选中列表的id集合
		isMulti:false,   //是否多选，true为是，false为单选
		enterpriseType: 0,   //enterpriseType
		callback:""
	}
	options = $.extend(defaults, data);
	if(options.isMulti){
		selectColumn = {
            checkbox: true,
            formatter: function(value, row, index) {
				for(i = 0; i < options.idList.length; i++) {
					if(row.id == options.idList[i]) {
						return {
							checked: true, //设置选中
							disabled: true //设置是否可用
						};
					}
				}

			}
        }
	} else {
		selectColumn = {
			radio: true,
	    }
	}
	getTendereeList(selectColumn);
}

function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        url: tenderUrl, // 请求url		
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
		height: 500,
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
//      toolbar: '#toolbar', // 工具栏ID
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
        		parent.layer.aler(data.message);
        	}
        },
        onCheck: function (row) {
            checkboxed = row
        },
        columns: [selectColumn, {
            field: 'interiorProjectCode',
            title: '项目编号',
            align: 'left',
            cellStyle:{
            	css:widthCode
            }
        },{
            field: 'projectName',
            title: '项目名称',
            align: 'left',
            cellStyle:{
            	css:widthName
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
        'interiorProjectCode': $('#interiorProjectCode').val(),
        'projectName':$("#projectName").val(),
        'projectState':2
    }
}