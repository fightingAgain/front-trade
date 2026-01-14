
var tenderTypeCode;
var examType = "";
var iframeWinAdd="";
var btnType = "";
if(PAGEURL.split("?")[1] !=undefined&&PAGEURL.split("?")[1] != ""){
	
	 var hurl = PAGEURL.split("?")[1].split("&");
	
	if(hurl[0].split("=")[0]=="tenderType"){ //评审 或  单一
		tenderTypeCode =  hurl[0].split("=")[1];
		examType = 1;
	}
	
	if(hurl[0].split("=")[0] == "examType"){ //预审
		examType = hurl[0].split("=")[1];
		tenderTypeCode = 0;
	}
	
	if(hurl[1].split("=")[0] == "type"){ //预审
		btnType = hurl[1].split("=")[1];
	}

}else{//评审
	
	tenderTypeCode = 0;
	examType = 1;
}

if(examType == 1){
	//$(".checks").show();
	$(".ready1").html("项目评审中");
	$(".ready1").val("项目评审中");
	$(".ready2").html("评审完成");
	$(".ready2").val("评审完成");
}else{
	//$(".checks").hide();
	$(".ready1").html("资格审查中");
	$(".ready1").val("资格审查中");
	$(".ready2").html("资格审查完成");
	$(".ready2").val("资格审查完成");
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
		//checkResult: $("#checkResult").val(),
		//isSendMess: $("#isSendMess").val(),
		checkState:$("#checkResult").val(),
		projectName : $("#projectName").val(),
		packageName : $("#packageName").val(),
		pageNumber: params.offset / params.limit + 1,
		pageSize: params.limit,
		tenderType:tenderTypeCode,
		examType:examType
	};
	/*if($("#projectSelect").val() == "0") {
		para.projectName = $("#projectinput").val();
	} else {
		para.projectCode = $("#projectinput").val();
	}*/
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
//				if(row.packageSource==1){
//					return value+'<span class="text-danger">(重新采购)</span>';					
//				}else{
//					return value;				
//				}
				if(row.packageSource==1){
					var count = row.packageSourceCount;
					if(count){
						return value+' <span class="text-danger">(第'+count+'次 重新采购)</span>';
					}else{
						return value+' <span class="text-danger">(重新采购)</span>';
					}			
				}else{
					return value;				
				}
			}
		},{
			field: 'checkState',
			title: '项目评审状态',
			align: 'center',
			width: '150',
			formatter: function(value, row, index) {
				if(row.isStopCheck==1){
					return '<span class="text-danger">已流标</span>'
				}else{
					return value
				}				
			}
		},/*{
			field: 'isSendMess',
			title: '评委抽取情况',
			align: 'center',
			width: '160',
			formatter: function(value, row, index) {
				return value == 0 ? "<span style='color: red;'>抽取未完成</span>" : "<span style='color:green;'>抽取已完成</span>";
			}
		},*/{
			field: 'examCheckEndDate',
			title: '资格预审时间',
			align: 'center',
			width: '150'
		}, {
			field: 'checkEndDate',
			title: '评审时间',
			align: 'center',
			width: '150'
		}, {
			field: '#',
			title: '操作',
			align: 'center',
			width:btnType==3?'200px':'120px',
			//formatter: AddFunction, //表格中添加按钮
			//events: operateEvents, //给按钮注册事件
			formatter: function(value, row, index) {
				if(btnType == 1){ //评审设置
					
					button = '<a href="javascript:void(0)" id="btnSet" onclick=btnSet("'+row.projectId +'","'+row.packageId +'","'+ row.isStopCheck +'","'+ row.createType +'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-pencil" aria-hidden="true"></span>评审设置</a>';
					
				}
				
				if(btnType == 2){ //组建评委
					
					button ='<a href="javascript:void(0)" id="btnChecker" onclick=toCheckInfo("'+row.projectId +'","'+row.packageId +'","'+ row.isSendMess +'","'+ row.createType +'","'+ row.isStopCheck +'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-pencil" aria-hidden="true"></span>组建评委</a>';
					
				}		
				if(btnType == 3){ //评审
					button = '<a href="javascript:void(0)" id="btnShowCheck" onclick=btnShowCheck("'+row.projectId +'","'+row.packageId +'","'+ row.isSendMess +'","'+ row.createType +'") class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon glyphicon-search" aria-hidden="true"></span>查看评审</a>';
					//if(row.checkState!="评审完成"&&row.checkState!="资格审查完成"){
					if(row.bidResultType == 0){//结果通知书未发布
						if(row.isStopCheck==0){
							button += '<a href="javascript:void(0)" onclick=StopCheck("'+row.packageId +'","'+row.projectId +'") class="btn-sm btn-primary" style="text-decoration:none;margin-left:5px" >流标</a>';
						}
					}
				
				}
				return button;
			}
		}
	]
});

if(examType == 1){
	$('#ReportChecktable').bootstrapTable('hideColumn', 'examCheckEndDate');
}else{
	$('#ReportChecktable').bootstrapTable('hideColumn', 'checkEndDate');
}

/*if(tenderTypeCode==6){
	$('#ReportChecktable').bootstrapTable("hideColumn", 'examCheckEndDate'); //隐藏分值	
}*/

//项目评审管理
function btnSet(id,pk,isStopCheck,createType) {
	
	msg = "";
	checkPackageList(id, pk);
	if(msg == 1) {
		if(id != "") {
			var setUrl = "Auction/common/Purchase/ReportCheckReady/ReportSet.html";
			if(examType == 1) {
				setUrl = "Auction/common/Purchase/ReportCheck/ReportSet.html";
			}
			top.layer.open({
				type: 2,
				area: ['1100px', '600px'],
				maxmin: false,
				resize: false,
				title: "项目评审管理",
				content: setUrl +'?projectId='+id+"&isStopCheck="+isStopCheck+"&packageId="+pk+'&createType='+createType,
				
			})
		}
	}
}


//进入详情页面
function toCheckInfo(id,pk,isSendMess,createType,isStopCheck) {
	if(isStopCheck==1){
		parent.layer.alert("温馨提示：该包件已流标");
		return;
	}
	msg = "";
	checkPackageList(id, pk);
	if(msg == 1) {
		if(id != "") {
			var infoUrl = "Auction/common/Purchase/ReportCheckReady/ReportCheckInfo.html";
			if(examType == 1) {
				infoUrl = "Auction/common/Purchase/ReportCheck/ReportCheckInfo.html";
			}
			//设置评审管理
			layer.open({
				type: 2, //此处以iframe举例
				title: '组建评委',
				area: ['100%', '100%'],
				id:'packageclass',
				content: infoUrl + '?projectId='+id+"&isSendMess="+isSendMess+"&packageId="+pk+'&createType='+createType,
				success: function(layero, index) {
				},end:function(){
					top.$("#ReportChecktable").bootstrapTable(('refresh'));
				}
			});
		}
	}
}

//进入详情页面
function btnShowCheck(id,pk,isSendMess) {
	msg = "";
	checkPackageList(id,pk);
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

function winMiddel(projectId,packageId,createType){
	var checkUrl = "Auction/common/Purchase/ReportCheckReady/PackageInfo.html";
	if(examType == 1) {
		checkUrl = "Auction/common/Purchase/ReportCheck/PackageInfo.html";
	}
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		maxmin: false,
		resize: false,
		title: "包件评审",
		id:'packageclass',
		content: checkUrl+'?projectId='+projectId+"&packageId="+packageId+'&createType='+createType,
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
		url: config.bidhost + "/WaitCheckProjectController/verifyPackage.do",
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
var msg
function checkPackageList(projectId,packageId){
	
	$.ajax({
		type: "post",
		url: config.bidhost + "/CheckController/checkPackageListItem.do",
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
//只重新获取主数据，进度
function StopCheck(packUid,proUid) {
	if(examType==1){
		var pra={
			projectId: proUid,
			packageId: packUid,
			roleType: 0
		};
	}else{
		var pra={
			projectId: proUid,
			packageId: packUid,
			roleType: 0,
			examCheckType:1,
		};
	};
	var packageData=[];
	$.ajax({
		type: "get",
		url: config.bidhost + "/ProjectReviewController/getProjectCheckInfo.do",
		data: pra,
		async: false,
		success: function(data) {
			if(data.success){
				packageData = data.data;
			}
			
		}
	});
	if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined&&packageData.stopCheckSource==1){		
		top.layer.confirm("温馨提示：流标后该包件将作废，是否确定流标？", function(indexs) {
			$.ajax({
				type: "post",
				url: config.bidhost + "/ProjectReviewController/setIsStopCheck.do",
				data: {
					'id': packUid,
					'isStopCheck': 1,
					'stopCheckReason':packageData.stopCheckReason,
					'examType':examType
				},
				async: false,
				success: function(data) {
					if(data.success) {						
						top.layer.alert("流标成功");
						$("#ReportChecktable").bootstrapTable(('refresh'));
						parent.layer.close(indexs);
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		})
	}else{
		if(packageData.checkItemInfos.length>0){
			top.layer.alert("温馨提示：专家已打分，无法流标");		
			return
		}
		top.layer.confirm("温馨提示：流标后该包件将作废，是否确定流标？", function(indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入流标原因',
				formType: 2
			}, function(text, index) {
				if(text==""){
					parent.layer.alert('请填写流标原因');
					
					return
				}
				$.ajax({
					type: "post",
					url: config.bidhost + "/ProjectReviewController/setIsStopCheck.do",
					data: {
						'id': packUid,
						'isStopCheck': 1,
						'stopCheckReason':text,
						'examType':examType
					},
					async: true,
					success: function(data) {
						if(data.success) {							
							top.layer.alert("流标成功");
							$("#ReportChecktable").bootstrapTable(('refresh'));
						} else {
							top.layer.alert(data.message);
						}
					}
				});
				parent.layer.close(index);
				});		
		});
	}	
}


