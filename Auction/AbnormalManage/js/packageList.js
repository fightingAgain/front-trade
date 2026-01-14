var tenderUrl = top.config.AuctionHost + '/BidExceptionController/findPackagePage.do'; //获取所有标段列表
var checkboxed;
//var tendererName = "";
//var enterpriceId = "";
var selectColumn = "";
var options = "";
var tenderType, enterpriseType;
$(function(){
	tenderType = $.getUrlParam("tenderType");
	enterpriseType = $.getUrlParam("enterpriseType");
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	$("#eventquery").click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList(selectColumn)
	});
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(data,callback){
	
	var defaults = {
		idList:[],  //已被选中列表的id集合
		isMulti:false,   //是否多选，true为是，false为单选
		'tenderProjectState': 2  
	}
	options = $.extend(defaults, data);
	if(options.isMulti){
		selectColumn = {
            checkbox: true,
            formatter: function(value, row, index) {
				for(i = 0; i < options.idList.length; i++) {
					if(row.id == options.idList[i]) {
						return {
							checked: true //设置选中
						}
					}
				}

			}
        }
	} else {
		selectColumn = {
			radio: true
	   }
	}
	
	getTendereeList(selectColumn)
	
	//确定
	$("#btnSure").click(function(){
		var row = getChild();
		if(row){
			options.callback(row);
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
		parent.layer.alert("请选择招标项目");			
	}
}

function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:tenderUrl,
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
		height: 500,
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
        onCheck: function (row) {
            checkboxed = row
        },
        columns: [selectColumn, 
        {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
		},
		{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(value){
					if(row.projectSource == 1){
						return value + '<span style="color:#BB2413;">(重新采购)</span>'
					}else{
						return value
					}
				}else{
					return ''
				}
			}
		},
		]
    });
//  $("#tableList").bootstrapTable("load", newList);
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'packageNum': $("#packageNum").val(), // 项目编号
		'packageName': $("#packageName").val(), // 项目名称
		'enterpriseType': enterpriseType,
		'tenderType': tenderType
    }
}