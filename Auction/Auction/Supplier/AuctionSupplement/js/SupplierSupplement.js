var urlProjectSupplementList = config.AuctionHost + '/ProjectSupplementController/findPageList.do';
var view = 'Auction/Auction/Supplier/AuctionSupplement/model/view_model.html'

//表格初始化
$(function() {
	initTable();
	// 搜索按钮触发事件
	$("#eventquery").click(function() {
		$('#SupplementListtable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable()
	});

});

//设置查询条件
function queryParams(params) {
	return {
		pageNumber: params.offset / params.limit + 1, //当前页数
		pageSize: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量	
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val(),
		tenderType: 1, //竞价
		enterpriseType:'06' //0是采购人 1是供应商身份
	}
}


function initTable() {
	$('#SupplementListtable').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlProjectSupplementList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#SupplementListtable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#SupplementListtable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			formatter:function(value, row, index){
			    if(row.isPublic>1){
			    	if(row.projectSource==1){
			    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span><span class="text-danger" style="font-weight: bold;">(邀请)</span>'
			    	}else if(row.projectSource==0){
			    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(邀请)</span>'
			    	}
			    }else{
			    	if(row.projectSource==1){
			    		return row.projectName+'<span class="text-danger" style="font-weight: bold;">(重新竞价)</span>'
			    	}else if(row.projectSource==0){
			    		return row.projectName
			    	}			    	
			    }
			}
		}, {
			field: 'purchaserName',
			title: '采购人',
			align: 'left',
			width: '250',

		},{
			title: '补遗数量',
			field: 'subCount',
			align: 'center',
			width: '100'
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {				
				var State = '<div class="btn-group" style="padding-left: 10px;">' +
					'<a class="btn-sm btn-primary" href="#" style="text-decoration:none" onclick=showProjectSupplementInfo(\"' + row.projectId + '\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看' +
					'</a>' +
					'</div>'
				return State
			}
		}]
	})
};

function operateFormatter(value, row, index) {
	return [
		'<button class="RoleOfedit btn btn-primary btn-xs" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看</button>',
	].join('');
}

window.operateEvents = {
	'click .RoleOfedit': function(e, value, row, index) {
		showSupplementInfo(row);
	}
};

//查看页面
function showProjectSupplementInfo(projectId) {
	var projectIds = "";
	layer.open({
		type: 2,
		title: '竞价补遗',
		area: ['1000px', '600px'],
		// maxmin: false,
		resize: false,
		content: view + "?projectIds=" + projectId + "&enterpriseType=06" + "&tenderType=1",
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
		}
	});
}

//格林威治时间转换成北京时间
function GMTToStr(time) {
	var date = new Date(time)
	if(date.getMonth() < 10) {
		var Month = '0' + (date.getMonth() + 1)
	} else {
		var Month = date.getMonth() + 1
	};
	if(date.getDate() < 10) {
		var Dates = '0' + date.getDate()
	} else {
		var Dates = date.getDate()
	};
	if(date.getHours() < 10) {
		var Hours = '0' + date.getHours()
	} else {
		var Hours = date.getHours()
	}
	if(date.getMinutes() < 10) {
		var Minutes = '0' + date.getMinutes()
	} else {
		var Minutes = date.getMinutes()
	};
	if(date.getSeconds() < 10) {
		var Seconds = '0' + date.getSeconds()
	} else {
		var Seconds = date.getSeconds()
	};
	var Str = date.getFullYear() + '-' +
		Month + '-' +
		Dates + ' ' +
		Hours + ':' +
		Minutes + ':' +
		Seconds
	return Str
}