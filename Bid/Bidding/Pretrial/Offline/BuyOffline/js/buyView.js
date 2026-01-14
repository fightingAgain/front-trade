/**
*  zhouyan 
*  2019-4-28
*  购标情况
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/SupplierSignController/selectByBidSectionId.do';//供应商
var pageView = 'Bidding/BidSituation/BuyOffline/model/supplierView.html';  //查看

var bidId='';//标段id
$(function(){
	bidId = $.getUrlParam('id');//标段Id
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	/*$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'packageId': bidId
		},
		success: function(data){
			if(data.success){
				if(){
					
				}
				bidderHtml(data.data)
			}
		}
	});*/
	getTendereeList();
})
/*
 * 打开查看窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index) {
	var width = window.$(parent).width() * 0.8;
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
		content: pageView + "?bidSectionId=" + bidId + "&id=" + tenderId,
		success: function(layero, idx) {
//			var iframeWin = layero.find('iframe')[0].contentWindow;	
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
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
			field: 'supplierName',
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
			field: 'linkTel',
			title: '电话',
			align: 'center',
			width: '150px',
		},
		{
			field: 'linkPhone',
			title: '手机',
			align: 'center',
			width: '150px',
		},
		{
			field: 'states',
			title: '状态',
			align: 'center',
			width: '100px',
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
			align: 'center',
			width: '120px',
			formatter: function (value, row, index) {
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				return strSee;
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
        'bidSectionId': bidId // 项目编号
    }
}