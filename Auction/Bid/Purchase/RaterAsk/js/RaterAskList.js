var urlRaterAskList = top.config.bidhost + "/RaterAskController/findRaterAskList.do"; //评审回复

var flags='';
var tenderTypeCode;
/*if(PAGEURL.split("?")[1]!=undefined){
	tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];; //0是询比采购  6是单一来源采购
}else{
	tenderTypeCode=0
}*/
var examType = "";
var checkType= "";
if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != ""){
	if(PAGEURL.split("?")[1].split("=")[0] == "tenderType"){ //单一
		tenderTypeCode =  PAGEURL.split("?")[1].split("=")[1];
		checkType = 1;
		examType = 1;
	}
	
	if(PAGEURL.split("?")[1].split("=")[0] == "examType"){ //预审
		checkType = 1;
		examType = PAGEURL.split("?")[1].split("=")[1];
		tenderTypeCode = 0;
	}
}else{//评审
	examType = 1;
	tenderTypeCode = 0;
}

window.operateEvents = {
	"click #checkAsk": function(e, value, row, index) {
		sessionStorage.setItem("RaterListInfo", JSON.stringify(row));
		//保存对象目标文件对象
		top.layer.open({
			type: 2,
			title: '查看评审回复',
			area: ['80%', '80%'],
			maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
			resize: false, //是否允许拉伸
			closeBtn: 1,
			content: '0502/Bid/RaterAsk/modal/RetarAskListInfo.html?type=check',
		});
	},
	"click #replyAsk": function(e, value, row, index) {
		sessionStorage.setItem("RaterListInfo", JSON.stringify(row));
		//保存对象目标文件对象
		
		flags = row.checkReport;
		if(flags == 0){
			top.layer.open({
				type: 2,
				title: '评审回复',
				area: ['80%', '80%'],
				maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
				resize: false, //是否允许拉伸
				closeBtn: 1,
				content: '0502/Bid/RaterAsk/modal/RetarAskListInfo.html?type=reply',
			});
		}else{
			top.layer.alert("评审回复已截止");
		}
		
		
	},
}

//查询按钮
$(function() {
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#RaterAskList').bootstrapTable('refresh');
	});

	$("select").on('change', function() {
		$('#RaterAskList').bootstrapTable('refresh');
	});
});

//设置查询条件
function getQueryParams(params) {
	var AuctionFile = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		packageName: $("#packageName").val(), //采购项目名称
		packageNum: $("#packageNum").val(), //采购醒目编号
//		checkState: $("#checkState").val(),
		answerState: $("#answerState").val(), //审核状态
		roleType: 1,
		tenderType:tenderTypeCode,
		examType:examType,
		//examCheckType:checkType
	};
	return AuctionFile;
}

$("#RaterAskList").bootstrapTable({
	url: urlRaterAskList,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	clickToSelect: true, //是否启用点击选中行
	pageList: [10, 15, 20, 25],
	search: false, // 不显示 搜索框
	sidePagination: 'server', // 服务端分页
	classes: 'table table-bordered', // Class样式
	//showRefresh : true, // 显示刷新按钮
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	striped: true,
	uniqueId: "projectId",
	columns: [{
			field: 'xh',
			title: '序号',
			width: "50px",
			align: 'center',
			formatter: function(value, row, index) {
				var pageSize = $('#RaterAskList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#RaterAskList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '200'
		},
		{
			field: 'packageName',
			title: '包件名称',
			align: 'left'
		},
		{
			field: 'askContent',
			title: '问题内容',
			align: 'left'
		},/*
		{
			field: 'checkReport',
			title: '评审状态',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.checkReport == "0") {
					return "<div class='text-success'>评审中</div>"
				} else if(row.checkReport == "1") {

					return "<div class='text-danger'>评审结束</div>"
				}
			}
		},*/
		{
			field: 'answerState',
			title: '答复状态',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
				if(row.answerState == "0") {
					return "<div>未答复</div>"
				} else if(row.answerState == "1") {
					return "<div>已答复</div>"
				}
			}
		},
		{
			field: 'askDate',
			title: '提问时间',
			align: 'center',
			width: '180'
		},
		{
			field: 'action',
			title: '操作',
			align: 'center',
			width: '100',
			events: operateEvents,
			formatter: function(value, row, index) {
				if(row.answerState == "1") { //答复状态为已经答复 点击查看
					return '<button type="button"  id="checkAsk" class="btn btn-primary btn-sm"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				} else if(row.answerState == "0" && row.answerState == "0") {
					return '<button type="button"  id ="replyAsk" class="btn btn-primary btn-sm"><span class="glyphicon glyphicon-paste"></span>答复</button>'
				}
			}
		}
	]
});



