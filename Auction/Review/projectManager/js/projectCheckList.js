/*
 * @Author: your name
 * @Date: 2020-09-09 10:38:07

 * @LastEditTime: 2020-12-15 16:32:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\projectCheckList.js
 */ 
var tenderTypeCode;
var examType = "";
var enterpriseType = "";
$(function(){
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {

		var hurl = PAGEURL.split("?")[1].split("&");
	
		if(hurl[0].split("=")[0] == "tenderType") { //评审 或  单一
			tenderTypeCode = hurl[0].split("=")[1];		
		}
		if(hurl[1].split("=")[0] == "examType") { //预审
			examType = hurl[1].split("=")[1];		
		}
	
		if(hurl[2].split("=")[0] == "enterpriseType") { //预审
			enterpriseType = hurl[2].split("=")[1];
		}
	
	} else { //评审
		tenderTypeCode = 0;
		examType = 1;
	}
	if(examType == 1) {
		//$(".checks").show();
		$(".ready1").html("项目评审中");
		$(".ready1").val("项目评审中");
		$(".ready2").html("评审完成");
		$(".ready2").val("评审完成");
	} else {
		$(".ready1").html("资格审查中");
		$(".ready1").val("资格审查中");
		$(".ready2").html("资格审查完成");
		$(".ready2").val("资格审查完成");
	}
	initTable();
	//查询按钮
	$("#btnQuery").click(function() {
		$('#ReportChecktable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable()
	});

	$("#checkResult,#isSendMess").change(function() {
		$('#ReportChecktable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable()
	});
})
//设置查询条件
function queryParams(params) {
	var para = {
		'checkState': $("#checkResult").val(),
		'projectName': $("#projectName").val(),
		'packageName': $("#packageName").val(),
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'tenderType': tenderTypeCode,
		'enterpriseType': enterpriseType,
		'examType': examType
	};
	return para;
}
function initTable(){
	var cols=[];
	cols.push(
		{
			field: '#',
			title: '序号',
			width: '50px',
			align: 'center',
			formatter: function(value, row, index) {
				var pageSize = $('#ReportChecktable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#ReportChecktable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			width: '250',
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					var projectName = row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span>'
				} else {
					var projectName = row.projectName
				}
				return projectName
			}
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			width: '250',
			formatter: function(value, row, index) {
				if(row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'checkState',
			title: '项目评审状态',
			align: 'center',
			width: '150',
			formatter: function(value, row, index) {
				if(row.isStopCheck == 1) {
					return '<span class="text-danger">项目失败</span>'
				} else {
					return value
				}
			}
		}
	)
	if(examType==1){
		cols.push(
			{
				field: 'checkEndDate',
				title: '评审时间',
				align: 'center',
				width: '150'
			}
		)
	}else{
		cols.push(
			{
				field: 'examCheckEndDate',
				title: '资格预审时间',
				align: 'center',
				width: '150'
			}
		)
	}
	cols.push(
		{
			field: '#',
			title: '操作',
			align: 'left',
			width: '240px',
			//formatter: AddFunction, //表格中添加按钮
			//events: operateEvents, //给按钮注册事件
			formatter: function(value, row, index) {	
				button = '<button onclick=btnShowCheck("'+index +'") class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看评审</button>';
				// if(row.checkState!="评审完成"&&row.checkState!="资格审查完成"){
					if(row.bidResultType == 0){//结果通知书未发布
						if(row.isStopCheck==0){
							button += '<button onclick=StopCheck("'+index +'") class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>项目失败</button>';
						}
					}
				// }
				return button;
			}
		}
	)
	//查询列表
	$("#ReportChecktable").bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: config.AuctionHost + '/CheckController/findPageList.do',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns:cols
	});
}
var msg
function checkPackageList(projectId,packageId,exam){
	
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/CheckController/checkPackageListItem.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examType: exam,

			enterpriseType:enterpriseType
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
//进入详情页面
function btnShowCheck($index) {
	var rowData = $('#ReportChecktable').bootstrapTable('getData'); //bootstrap获取当前页的数据
	checkUrl = "bidPrice/Review/projectManager/modal/index.html";
	msg = "";
	checkPackageList(rowData[$index].projectId,rowData[$index].packageId,examType);
	if(msg == 1){
		top.layer.open({
			type: 2,
			area: ['100%', '100%'],
			maxmin: false,
			resize: false,
			title: "包件评审",
			id:'packageclass',

			content: checkUrl+'?projectId='+rowData[$index].projectId+"&packageId="+rowData[$index].packageId+'&createType='+rowData[$index].createType+'&examType='+examType+'&enterpriseType='+enterpriseType+'&tenderType='+tenderTypeCode+'&isAgent='+rowData[$index].isAgent,		
		})
	}
}
var packageInfo = "";

function toPackageInfo(flag, projectId, packageId) {
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
				//查询项目是否流标,如若流标给出提示信息
				getIsStopCheckMsg(packageId,data.message);
				//top.layer.alert(data.message);
			}
		}
	});
}

//查询项目是否已经流标,给出流标原因
function getIsStopCheckMsg(packageId,verMsg){
	$.ajax({
		type: "post",
		url: config.AuctionHost + "/WaitCheckProjectController/getIsStopCheckMsg.do",
		data: {
			packageId: packageId,
		},
		async: false,
		success: function(data) {
			if(data.success) {
				top.layer.alert(verMsg);
			} else {
				top.layer.alert("包件项目失败原因："+data.message);
			}
		}
	});
}
//只重新获取主数据，进度
function StopCheck($index) {
	var rowData = $('#ReportChecktable').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var pra = {
		projectId: rowData[$index].projectId,
		packageId: rowData[$index].packageId,
		examType: examType
	};
	var packageData = [];
	$.ajax({
		type: "get",
		url: config.AuctionHost + "/ManagerCheckController/findManagerCheckProgress.do",
		data: pra,
		async: false,
		success: function(data) {
			if(data.success) {
				packageData = data.data;
			}

		}
	});
	if(packageData.stopCheckReason != "" && packageData.stopCheckReason != undefined && packageData.stopCheckSource == 1) {
		//专家发起项目失败,项目经理确认
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function(indexs) {
			$.ajax({
				type: "post",
				url: config.AuctionHost + "/ProjectReviewController/setIsStopCheck.do",
				data: {
					'id': rowData[$index].packageId,
					'isStopCheck': 1,
					'stopCheckReason': packageData.stopCheckReason,
					'examType': examType
				},
				async: false,
				success: function(data) {
					if(data.success) {
						top.layer.alert("操作成功");
						$("#ReportChecktable").bootstrapTable(('refresh'));
						parent.layer.close(indexs);
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		})
	} else {
		//项目经理发起项目失败
		if (packageData.checkResult == '未完成') {
			//评审报告未审核完成之前,评委若有打分记录则由评委发起
			if (packageData.isCheckItemType==1) {
				top.layer.alert("温馨提示：专家已打分，无法发起项目失败");
				return
			}
		}
		top.layer.confirm("温馨提示：项目失败后该包件将作废，是否确定项目失败？", function(indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入项目失败原因',
				formType: 2
			}, function(text, index) {
				if(text == "") {
					parent.layer.alert('请填写项目失败原因');

					return
				}
				$.ajax({
					type: "post",
					url: config.AuctionHost + "/ProjectReviewController/setIsStopCheck.do",
					data: {
						'id': rowData[$index].packageId,
						'isStopCheck': 1,
						'stopCheckReason': text,
						'examType': examType
					},
					async: true,
					success: function(data) {
						if(data.success) {
							top.layer.alert("操作成功");
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