var tenderTypeCode;
if(PAGEURL.split("?")[1] !=undefined&&PAGEURL.split("?")[1] != ""){
	
	 var hurl = PAGEURL.split("?")[1].split("&");
	
	if(hurl[0].split("=")[0]=="tenderType"){ //评审 或  单一
		tenderTypeCode =  hurl[0].split("=")[1];
	}

}else{
	
	tenderTypeCode = 0;
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
		
		checkState:$("#checkResult").val(),
		projectName : $("#projectName").val(),
		packageName : $("#packageName").val(),
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		tenderType:tenderTypeCode
	};
	
	return para;
}
//查询列表
$("#ReportChecktable").bootstrapTable({
	url: config.AuctionHost + '/CheckController/findReportCheckSupervisePageList.do',
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
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){				
				if(row.packageSource==1){
					return value+'<span class="text-danger">(重新采购)</span>';					
				}else{
					return value;				
				}
				
			}
		},{
			field: 'checkState',
			title: '项目评审状态',
			align: 'center',
			width: '140',
			formatter: function(value, row, index) {
				if(row.isStopCheck==1){
					return '<span class="text-danger">已流标</span>'
				}else{
					return value
				}				
			}
		},{
			field: 'examCheckEndDate',
			title: '资格预审时间',
			align: 'center',
			width: '140'
		}, {
			field: 'checkEndDate',
			title: '评审时间',
			align: 'center',
			width: '140'
		},{
			field: 'examType',
			title: '审查方式',
			align: 'center',
			width: '90',
			formatter: function(value, row, index) {
				if(row.examType == 0){
					return "资格预审";
				}else{
					return "资格后审";
				}
			}
		},{
			field: '#',
			title: '操作',
			align: 'center',
			width: '110',
			//formatter: AddFunction, //表格中添加按钮
			//events: operateEvents, //给按钮注册事件
			formatter: function(value, row, index) {
			
				if(tenderTypeCode==0){
					button = '<a href="javascript:void(0)" id="btnShowCheck" onclick=btnShowCheck("'+row.projectId +'","'+row.packageId +'","'+ row.isSendMess +'","'+ row.examType +'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>';
					
				}else{
					button = '<a href="javascript:void(0)" id="btnShowCheck" onclick=btnShowCheck("'+row.projectId +'","'+row.packageId +'","'+ row.isSendMess +'","'+ row.examType +'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-search" aria-hidden="true"></span>查看</a>';
				}
					
							
				return button;
			}
		}
	]
});

if(tenderTypeCode==6){
	$('#ReportChecktable').bootstrapTable("hideColumn", 'examCheckEndDate'); //隐藏分值	
	$('#ReportChecktable').bootstrapTable("hideColumn", 'examType'); //隐藏分值	
}


//进入详情页面
function btnShowCheck(id,pk,isSendMess,examType) {
	msg = "";
	checkPackageList(id,pk,examType);
	if(msg == 1){
	
		if(id != "") {
			if(examType == 0){
				//预审
				toPackageInfo(1,id,pk);
				if(packageInfo == "通过"){
					winMiddel(id,pk,isSendMess,1);
				}
				
			}else{
				//评审
				toPackageInfo(2,id,pk);
				if(packageInfo == "通过"){
					winMiddel(id,pk,isSendMess,2)
				}
		
			}
		}
	}
}

function winMiddel(projectId,packageId,isSendMess,examType){
	var checkUrl = "bidPrice/ReportCheckSupervise/modal/ReadyReportCheckInfo.html";
	if(examType == 2){
		checkUrl = "bidPrice/ReportCheckSupervise/modal/ReportCheckInfo.html";
	}
	
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		btn: ["刷新","关闭"],
		maxmin: false,
		resize: false,
		title: "包件评审",
		id:'PackageInfo',
		content: checkUrl+'?ReportCheck_id='+projectId+"&isSendMess="+isSendMess+"&packageId="+packageId,
		btn1:function(index, layero){
			parent.window[layero.find('iframe')[0]['name']].location.reload();
		},
	})
}

var packageInfo = "";
function toPackageInfo(flag,projectId,packageId) {
	packageInfo = "";
	
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/WaitCheckProjectController/verifyPackage.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			checkType: flag
		},
		async: false,
		success: function(data) {
			if(data.success) {
				packageInfo = "通过";
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

var msg;
function checkPackageList(projectId,packageId,examType){
	
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/CheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: examType
		},
		async: false,
		success: function(data) {
			if(data.success) {
				msg = 1;
			} else {
				top.layer.alert(data.message);
				msg =  2;
			}
		}
	});

}
