

/**

*  选择标段的列表
*  方法列表及功能描述
*/
var tenderUrl = config.tenderHost + '/NoticeController/findBidSectionList.do'; //获取所有标段列表
//var editUrl = "Bidding/BidNotice/Notice/model/tenderNoticeAdd.html"; // 新增
var checkboxed;
var options = "";

$(function(){
 	getTendereeList();
 	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();
	});
 	
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function getFromBid(callback){
	//确定
	$("#btnSure").click(function(){
		var row = $("#tableList").bootstrapTable("getSelections");
		if(row.length > 0){
			callback(row[0]);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}else{
			parent.layer.alert('请选择标段！')
		}
	});
}


function getTendereeList(){
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
        onCheck: function (row) {
            checkboxed = row
        },
        columns: [{
        	radio:true
        },
        {
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
		},
		{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
		},
		{
			field: 'tenderMode',
			title: '招标方式 ',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){//1为公开招标，2为邀请招标
            	var str="";
            	if(value==1){
            		str="公开招标";
            	} else if(value==2){
            		str ="邀请招标";
            	}
            	return str;
            }
		},
		{
			field: 'examType',
			title: '资格审查方式 ',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
            	var str="";
            	if(value==1){
            		str="资格预审";
            	} else if(value==2){
            		str ="资格后审";
            	}
            	return str;
            }
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
        'interiorBidSectionCode':$("#interiorBidSectionCode").val(),
        'bidSectionName':$("#bidSectionName").val(),
    }
}