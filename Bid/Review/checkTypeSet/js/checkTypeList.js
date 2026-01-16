/**

*  评标报告列表
*/

var checkTypeUrl = config.Reviewhost + '/CheckTypeController/findPageList'; //评标办法列表
var examType;
$(function(){
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
        getList();
	});
});

/*
 * 页面传参方法
 */
function passMessage(_examType, callback){
    examType = _examType;
    getList();
	//确定
	$("#btnSure").click(function(){
		var row = $("#tableList").bootstrapTable("getSelections");
		if(row.length>0){
			callback(row[0]);
			var index=top.layer.getFrameIndex(window.name);
            top.layer.close(index);
		}else{
            top.layer.alert("温馨提示：请选择评标办法")
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
}

function getList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url: checkTypeUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
		// height: (top.tableHeight -  $('#toolbarTop').height()),
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
            top.layer.alert("温馨提示：请求失败");
        },
        onLoadSuccess:function(data){
            top.layer.closeAll("loading");
        	if(!data.success){
                top.layer.alert('温馨提示：'+data.message);
        	}
        },
        columns: [
        {
        	radio:true
        },
        {
            field: 'checkTypeCode',
            title: '评标办法编号',
            align: 'left'
        },
        {
            field: 'examType',
            title: '评审会',
            align: 'left',
            formatter:function(value, row, index){
                if(value == 1){
                    return '资格预审会'
                }else if(value == 2){
                    return '平评标会'
                }
            }
        },
        {
            field: 'checkTypeName',
            title: '评标办法名称',
            align: 'left'
        }
        ]
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'examType': examType,
    }
}