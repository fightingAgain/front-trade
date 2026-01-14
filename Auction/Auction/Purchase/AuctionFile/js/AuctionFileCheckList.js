var urlAuctionFileCheckList = top.config.AuctionHost + "/AuctionFileController/findAuctionFilePageList.do"; //竞价文件信息详情

//查询按钮
$(function() {
	initTable()
	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#AuctionFileCheckList').bootstrapTable('destroy');
		initTable()
	});
	//下拉框选择刷新
	$("select").change(function() {
		$('#AuctionFileCheckList').bootstrapTable('destroy');
		initTable()
	})

});

//设置查询条件
function getQueryParams(params) {
	var AuctionFile = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		projectName: $("#projectName").val(), //采购项目名称
		projectCode: $("#projectCode").val(), //采购醒目编号
		checkState: $("#checkState").val(), //审核状态
		'enterpriseType':'04',
		tenderType: "1" //竞低价
	};
	return AuctionFile;
}
function initTable(){
	$("#AuctionFileCheckList").bootstrapTable({
		url: urlAuctionFileCheckList,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		clickToSelect: true, //是否启用点击选中行
		pageList: [10,15,20,25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
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
					var pageSize = $('#AuctionFileCheckList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#AuctionFileCheckList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'projectName',
				title: '竞价项目名称',
				align: 'left',
				formatter: function(value, row, index) {
					if(row.projectSource == 1) {
						return projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + value + '<span class="text-danger" style="font-weight:bold">(重新竞价)</span></div>';
					} else {
						return projectName = '<div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + value + '</div>';
					}
				}
			},
			{
				field: 'projectCode',
				title: '竞价项目编号',
				align: 'left',
				width: '180'
			},
			{
				field: 'fileEndDate',
				title: '竞价文件递交截止时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'fileCheckEndDate',
				title: '竞价文件审核截止时间',
				align: 'center',
				width: '180'
			},
			{
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '120',
				formatter: function(value, row, index) {
					if(row.checkState == "0") {
						return "<div class='text-warning'>未审核</div>"
					} else {
						return "<div class='text-success'>已审核</div>"
					}
				}
			},
			{
				field: 'action',
				title: '操作',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(row.createType != undefined && row.createType == 1){
							return '<button type="button" onclick="AuctionFileCheck(\'' + row.projectId + '\',\'check\',\'' + row.createType + '\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
					}else{
						
						if(row.checkState == "0") {
							return '<button type="button" onclick="AuctionFileCheck(\'' + row.projectId + '\',\'audit\',\'' + row.createType + '\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-edit"></span>审核</button>'
						} else {
							return '<button type="button" onclick="AuctionFileCheck(\'' + row.projectId + '\',\'check\',\'' + row.createType + '\')" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
						}
					}
				}
			}
		]
	});
}


//查看竞价文件事件绑定
function AuctionFileCheck(data, type,createType) {
	console.log(data)
	//存储竞价文件id	
	var rowData = $("#AuctionFileCheckList").bootstrapTable("getRowByUniqueId", data);
	sessionStorage.setItem("AuctionFileCheckDate", JSON.stringify(rowData));
	var canOPen = false;
	isShowSupplierInfo(data, '', '', 'submit', '1', function(result){
		if(result.isShowSupplier == 1){
			canOPen = true;
		}
	})
	// 审核时间未到 监标人未设置 拦截不能审核
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	if(type == 'audit' && (rowData.setSupervisor == null || rowData.setSupervisor == undefined) && NewDate(rowData.fileCheckEndDate)>NewDate(nowSysDate)){
		top.layer.alert('未提交监标人设置信息，请提交后再进行审核。');
		return
	}
	if(!canOPen){
		top.layer.alert('未到递交截止时间，不允许审核！供应商如在递交截止时间前发现文件存在问题的，可自行撤回修改');
		return
	};
	var title = "";
	switch(type) {
		case "check":
			title = '查看审核结果';
			break;
		case "audit":
			title = '审核竞价文件';
			break;
	}
	top.layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'Auction/Auction/Purchase/AuctionFile/modal/AuctionFileCheckInfo.html?createType='+createType+ '&projectId=' + data+'&type='+type,
	});
}

function NewDate(str) {
	if (!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
} 