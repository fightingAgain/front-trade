/**
 * 2019-11-22 by hwf
 * 报名
 */


var pageView= 'Bidding/Signup/model/signView.html'; //查看报名信息

var listUrl = config.tenderHost+'/SupplierSignController/findSignUpSupplierList.do';//投标人报名信息记录i--标段查询分页接口
var bidSectionId = "";  //标段id

var examType;
$(function(){
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		bidSectionId =$.getUrlParam("id");
	}
	signUpList();
	var bidDetail = findProjectDetail(bidSectionId);
	$("#interiorBidSectionCode").html(bidDetail.interiorBidSectionCode);
	$("#bidSectionName").html(bidDetail.bidSectionName);
	
	
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
	

});

/*
 * 打开查看窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(id, state, callback) {
	
	parent.layer.open({
		type: 2,
		title: "报名信息",
		area: ['90%', '90%'],
		resize: false,
		content: pageView + "?bidSectionId=" + bidSectionId + "&keyId=" + id + "&examType="+examType+"&source="+state,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(function(){
				signUpList();
				if(callback){
					callback()
				}
//				parent.$("#table").bootstrapTable('refresh');
			});  //调用子窗口方法，传参
		}
	});
}

//报名列表
function signUpList(){
	$.ajax({
		type: "post",
		url: listUrl,
		data:{bidSectionId:bidSectionId, examType:examType},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			
			var html = "";
			rowData = data.data;
			$("#tableList tr:gt(0)").remove();
			for(var i = 0; i < data.data.length; i++){
				var item = data.data[i];
				var states = "";
				if(item.states == 0){
					states = "未提交";
				} else if(item.states == 1){
					states = "审核中";
				} else if(item.states == 2){
					states = "审核通过";
				} else if(item.states == 3){
					states = "审核未通过";
				}
				html += '<tr>'
							+'<td>'+(i+1)+'</td>'
							+'<td>'+(item.supplierName ? item.supplierName : "")+'</td>'
							+'<td>'+(item.createTime ? item.createTime : "")+'</td>'
							+'<td>'+(item.legalContact ? item.legalContact : "")+'</td>'
							+'<td>'+(item.legalContactPhone ? item.legalContactPhone : "")+'</td>'
							+'<td>'+(item.legalEmail ? item.legalEmail : "")+'</td>'
							+'<td>'+states+'</td>';
//				if(item.states == 1){
//					html += '<td><button type="button" class="btn btn-primary btn-sm btnCheck" data-id="' + item.id + '"><span class="glyphicon glyphicon-eye-open"></span>审核</button></td>';
//					
//				} else {
					html += '<td><button type="button" class="btn btn-primary btn-sm btnView" data-id="' + item.id + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button></td>';
//				}
				html += '</tr>';
			}
			$(html).appendTo("#tableList");
			
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
                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
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
			field: 'legalContact',
			title: '联系人',
			align: 'left',
		},
		{
			field: 'legalContactPhone',
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
        'bidSectionId': bidSectionId, // 项目编号
        'examType':examType
    }
}
function passMessage(data,callback){
	
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var id = $(this).attr("data-id");
		openView(id, 0);
	});
	//审核
	$("#tableList").on("click", ".btnCheck", function(){
		var id = $(this).attr("data-id");
		openView(id, 1, callback);
	});
}
