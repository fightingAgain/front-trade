var url = top.config.AuctionHost;
var projectId=getUrlParam("projectId");
var packageId=getUrlParam("packageId");
var projectCheckerId=getUrlParam("projectCheckerId");
var enterpriseId=getUrlParam("enterpriseId");
var isAgent=getUrlParam("isAgent");
var checkType=getUrlParam("checkType");
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#'+thisFrame)[0].contentWindow;
//确定按钮
$("#SbmReviewer").off("click").click(function() {
	var Reviewer_data = $("#Reviewertable").bootstrapTable('getSelections');
	if(Reviewer_data != null) {
		var para = {
			projectId: projectId,
			packageId: packageId,
			projectCheckerId: projectCheckerId,
			employeeId: Reviewer_data[0].id,
			checkType:checkType //1为预审
		}
		$.ajax({
			type: "post",
			data: para,
			url: url + "/CheckController/saveReviewReportChecker.do",
			success: function(data) {
				if(data.success) {
					dcmt.$("#NowReviewerTalbe").bootstrapTable('load', Reviewer_data);
					parent.layer.alert("保存成功");
					parent.layer.close(parent.layer.getFrameIndex(window.name));
				} else {
					layer.alert("保存失败");
				}
			}
		});
	}
	
});

$("#btnQuery").off("click").click(function() {
	$("#Reviewertable").bootstrapTable(('refresh'));
});

//设置查询条件
function queryParams(params) {
	var para = {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'id': projectId,
		'packageId':packageId,
		'enterpriseId': enterpriseId,
		'isAgent':isAgent,
		'checkType':checkType,
		'userName':$("#name").val(),
		'logCode':$("#code").val(),
	}
	return para;
}

$("#Reviewertable").bootstrapTable({
	method: 'GET', // 向服务器请求方式
	contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
	url: url + '/CheckController/getCheckers.do',
	cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
	striped: true, // 隔行变色
	dataType: "json", // 数据类型
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 10, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	// pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	silent: true, // 必须设置刷新事件
	height:'415',
	toolbar: '#toolbar', // 工具栏ID
	toolbarAlign: 'left', // 工具栏对齐方式
	queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
	queryParamsType: "limit",
	columns: [{
		radio: true,		
	}, {
		field: 'id',
		title: '序号',
		width: '50px',
		cellStyle:{css:{"text-align":"center"}},
		formatter: function(value, row, index) {
			var pageSize = $('#Reviewertable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
			var pageNumber = $('#Reviewertable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
			return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		}
	}, {
		field: 'userName',
		title: '姓名'
	}, {
		field: 'logCode',
		title: '登录名'
	}, {
		field: 'departmentName',
		title: '所属部门'
	}, {
		field: 'employeeState',
		title: '状态',
		formatter: function(value, row, index) {
			switch(value) {
				case 0:
					return "正常";
					break;
				case 1:
					return "删除";
					break;
				case 2:
					return "停用";
					break;
			}
		}
	}]
});


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}