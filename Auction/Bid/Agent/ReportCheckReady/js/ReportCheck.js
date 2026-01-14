
var tenderTypeCode;

 if(PAGEURL.split("?")[1]!=undefined){
		tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];; //0是询价采购  6是单一来源采购
	}else{
		tenderTypeCode=0
	}
//查询按钮
$("#btnQuery").click(function() {
	$("#ReportChecktable").bootstrapTable(('refresh'));
});

$("#checkResult,#isSendMess").change(function() {
	$("#ReportChecktable").bootstrapTable(('refresh'));
});

//设置查询条件
function queryParams(params) {
	var para = {
		checkResult: $("#checkResult").val(),
		isSendMess: $("#isSendMess").val(),
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		tenderType:tenderTypeCode,
		checkType:1
	};
	if($("#projectSelect").val() == "0") {
		para.projectName = $("#projectinput").val();
	} else {
		para.projectCode = $("#projectinput").val();
	}
	return para;
}
//查询列表
$("#ReportChecktable").bootstrapTable({
	url: config.bidhost + '/CheckController/findPageList.do',
	pagination: true, //是否分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	striped: true, // 隔行变色,
	sidePagination: 'server', //设置为服务器端分页
	queryParams: queryParams, //参数
	columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		},
		{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '160'
		}, {
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					var projectName = row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span>'
				} else {
					var projectName = row.projectName
				}
				return projectName
			}
		}, {
			field: 'isSendMess',
			title: '评委抽取情况',
			align: 'center',
			width: '160',
			formatter: function(value, row, index) {
				return value == 0 ? "<span style='color: red;'>抽取未完成</span>" : "<span style='color:green;'>抽取已完成</span>";
			}
		}, {
			field: 'examCheckEndDate',
			title: '预审时间',
			align: 'center',
			width: '160'
		}, {
			field: '#',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				return "<a href='javascript:void(0)' type='button' class='btn-sm btn-primary' onclick='toCheckInfo(\"" + row.projectId + "\",\"" + row.isSendMess + "\")'><span class='glyphicon glyphicon-search' aria-hidden='true'></span>进入</a>";
			}
		}
	]
});

//进入详情页面
function toCheckInfo(id, isSendMess) {
	if(id != "") {
		top.layer.open({
			type: 2,
			area: ['100%', '100%'],
			btn: ["关闭"],
			maxmin: false,
			resize: false,
			title: "项目预审管理",
			content: '0502/Bid/ReportCheckReady/ReportCheckInfo.html?projectId='+id+"&isSendMess="+isSendMess,
			btn1:function(index, layero){
				parent.window[layero.find('iframe')[0]['name']].location.reload();
			},
			
		})
	}
}
