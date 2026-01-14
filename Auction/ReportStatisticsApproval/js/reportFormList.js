/*
 * 页面加载，绑定Table数据源
 * */
var urlProjectCheckList = top.config.AuctionHost + '/CwBusinessStatisticsController/findCwDateReportPageList'; //项目审核分页地址
var urlCheck = "bidPrice/ReportStatisticsApproval/model/reportReview.html"
$(function() {
	

	
	$('#query').queryCriteria({
		isExport: 1, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 0, //0是不新增，1是新增
		QueryName: 'btnSearch',
		ExportName:'btnDownload',
		queryList: [{
				name: '审核状态',
				value: 'checkState',
				type: 'select',
				option: [{
					name: '全部',
					value: '',
				},  {
					name: '审核中',
					value: '1',
				}, {
					name: '审核通过',
					value: '2',
				}, {
					name: '审核未通过',
					value: '3',
				}, {
					name: '已撤回',
					value: '4',
				}, ]
			},
			{
				name: '采购类型',
				value: 'tenderType',
				type: 'select',
				option: [{
					name: '全部',
					value: '',
				},{
					name: '询比采购',
					value: '0',
				}, {
					name: '竞价采购',
					value: '1',
				}, {
					name: '竞卖',
					value: '2',
				}, {
					name: '招标采购',
					value: '4',
				}]
			},
			{
				name: '项目名称',
				value: 'tenderProjectName',
				type: 'input',
			},
			{
				name: '项目编号',
				value: 'tenderProjectCode',
				type: 'input',
			}, {
				name: '包件名称',
				value: 'bidSectionName',
				type: 'input',
			},
			{
				name: '包件编号',
				value: 'bidSectionCode',
				type: 'input',
			},{
				name: '项目归属处室',
				value: 'projectOfficeName',
				type: 'input',
			}, {
				name: '项目经理',
				value: 'tenderAgencyLinkmen',
				type: 'input',
			},
			{
				name: '项目经理所属处室',
				value: 'enterpriseld',
				type: 'input',
			},
			{
				name: '业主单位',
				value: 'purchaserName',
				type: 'input',
			},
			{
				name: '业主采购人员',
				value: 'purchaserLinKmen',
				type: 'input',
			},
			{
				name: '中标（中选）单位',
				value: 'legalName',
				type: 'input',
			},
			{
				name: '项目分配时间',
				startDate:"subStartDate",
				endDate:"subEndDate",
				type: 'date',
			},
			{
				name: '通知发出时间',
				startDate:"noticeSendStartTime",
				endDate:"noticeSendEndTime",
				type: 'date',
			}
		]
	})


	
	$("#query").on('click', '#btnSearch', function() {
		if(!$("#enterpriseld").val()) {
			$("#dept").val("")
		}
		$('#ProjectAuditTable').bootstrapTable('destroy');
		intTable()
	})

/*	$("#query").on('change', '#checkState', function() {
		$('#ProjectAuditTable').bootstrapTable(('refresh'));
	})*/
	$("#query").on('click', '#btnDownload', function() {
		var url = config.AuctionHost + "/CwBusinessStatisticsController/exportCwDateReportPageList";
		var tenderProjectName = $("#tenderProjectName").val();
		var tenderProjectCode = $("#tenderProjectCode").val();
		var bidSectionCode = $("#bidSectionCode").val();
		var bidSectionName = $("#bidSectionName").val();

		var obj = {};
		obj.tenderType = $("#tenderType").val();
		obj.tenderProjectCode = $("#tenderProjectCode").val();
		obj.tenderProjectName = $("#tenderProjectName").val();
		obj.bidSectionName = $("#bidSectionName").val();
		obj.bidSectionCode = $("#bidSectionCode").val();

		//新增修改
		if(!$("#enterpriseld").val()) {
			$("#dept").val("")
			departmentId = ""
		}
		obj.subDateStart = $("#subStartDate").val()
		obj.subDateEnd = $("#subEndDate").val()
		obj.noticeSendTimeStart = $("#noticeSendStartTime").val()
		obj.noticeSendTimeEnd = $("#noticeSendEndTime").val()
		obj.departmentName = $("#enterpriseld").val()
		obj.departmentId = $("#dept").val()
		obj.purchaserName = $("#purchaserName").val()
		obj.purchaserLinKmen = $("#purchaserLinKmen").val()
		obj.legalName = $("#legalName").val()
		obj.checkState = $("#checkState").val()
		obj.projectOfficeName = $("#projectOfficeName").val()

		/* var tenderType = '';
		if($("#tenderType").val()) {
			tenderType = $("#tenderType").val();
		}
		obj.tenderType = tenderType; */
		var loadUrl = $.parserUrlForToken(url);
		$.each(obj, function(key, value) {
			loadUrl += '&' + key + '=' + encodeURIComponent(value)
		});
		window.location.href = loadUrl;
	})

	$("#query").on('click', '#enterpriseld', function() {
		getEnterpriseld()
	})

	$("#query").on('change', '#enterpriseld', function() {
		if(!$("#enterpriseld").val()) {
			$("#departmentName").val("")
			$("#dept").val("")
		}

	})

		$("#query").on('click', '#subStartDate,#noticeSendStartTime', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			
		})

	})


	$("#query").on('click', '#subEndDate', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: $("#subStartDate").val(),
			
		})
	})

	$("#query").on('click', '#noticeSendEndTime', function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			minDate: $("#noticeSendStartTime").val(),
			
		})

	})
	$("#query").on('change', '#packageState,#tenderType,#workflowType', function() {
		$('#ProjectAuditTable').bootstrapTable('destroy');
		intTable()
		if(this.id=="tenderType"){
			if($(this).val()==4){
				$('.bidSection').html('标段')
			}else{
				$('.bidSection').html('包件')
			}
			
		}
	})
	$("#query").on('click', '#projectOfficeName', function() {
		var name='agency';
		if(name=='agency'){
			var uid=top.enterpriseId;
			var mnuid=$("#projectOfficeId").val();
		}
		parent.layer.open({
		    type: 2 //此处以iframe举例
		    ,title: '选择所属处室'
		    ,area: ['400px', '600px']
		    ,content:'view/projectType/employee.html'
		    ,success:function(layero,index){
		    	var iframeWind=layero.find('iframe')[0].contentWindow;
		    	iframeWind.employee(uid,name,function(aRopName,dataTypeList){
					var  itemTypeId=[];//项目类型的ID
					var  itemTypeName=[];//项目类型的名字
					var  itemTypeCode=[];//项目类型编号
								
					for(var i=0;i<dataTypeList.length;i++){
						itemTypeId.push(dataTypeList[i].id);	
						itemTypeName.push(dataTypeList[i].departmentName);
					};
					typeIdList=itemTypeId.join(",");//项目类型的ID
					typeNameList=itemTypeName.join(",");//项目类型的名字
					$("#projectOfficeId").val(typeIdList);
					$("#projectOfficeName").val(typeNameList);
					$('#ProjectAuditTable').bootstrapTable('destroy');
					intTable()
				},mnuid, false, true)
		    },
		     
		})
	})
	$("#checkState").val(2)
	intTable()
	//导出
	/*$("#btnList").click(function() {
		var url = config.AuctionHost + "/CwBusinessStatisticsController/exportCwDateReportPageList";
		var tenderProjectName = $("#tenderProjectName").val();
		var tenderProjectCode = $("#tenderProjectCode").val();
		var bidSectionCode = $("#bidSectionCode").val();
		var bidSectionName = $("#bidSectionName").val();
		//		var tenderType=0;
		//		if($("#tenderType").val()){
		//			 tenderType=$("#tenderType").val();
		//		}

		var obj = {};
		obj.tenderType = $("#tenderType").val();
		obj.tenderProjectCode = $("#tenderProjectCode").val();
		obj.tenderProjectName = $("#tenderProjectName").val();
		obj.bidSectionName = $("#bidSectionName").val();
		obj.bidSectionCode = $("#bidSectionCode").val();
		var tenderType = 0;
		if($("#tenderType").val()) {
			tenderType = $("#tenderType").val();
		}
		obj.tenderType = tenderType;
		var loadUrl = $.parserUrlForToken(url);
		$.each(obj, function(key, value) {
			loadUrl += '&' + key + '=' + value
		});
		window.location.href = loadUrl;

		//		var url = config.AuctionHost + "/CwBusinessStatisticsController/exportCwDateReportPageList.do" + "?tenderProjectName=" +tenderProjectName+"&tenderProjectCode="+tenderProjectCode+
		//		"&bidSectionCode="+bidSectionCode+"&bidSectionName="+bidSectionName+"&tenderType="+tenderType;
		//		
		//		window.location.href = $.parserUrlForToken(url);
	});*/

	//查询按钮
	/*$("#btnQuery").click(function() {
		$('#ProjectAuditTable').bootstrapTable('destroy');
		intTable()
	});*/
	//两个下拉框事件
	/*$("#packageState,#tenderType,#workflowType").change(function() {
		$('#ProjectAuditTable').bootstrapTable('destroy');
		intTable()
		if(this.id == "tenderType") {
			if($(this).val() == 4) {
				$('.bidSection').html('标段')
			} else {
				$('.bidSection').html('包件')
			}

		}
	});*/

});

window.openAudit = {
	"click .detailed": function(e, value, row, index) {
		let tenderType = row.tenderType;
		let url = "";
		/* switch(tenderType) {
			case 0:
				url = "bidPrice/ReportStatisticsApproval/model/xbReportReview.html?iscw=true&"
				break;
			case 1:
				url = "bidPrice/ReportStatisticsApproval/model/jjReportReview.html?iscw=true&"
				break;
			case 2:
				url = "bidPrice/ReportStatisticsApproval/model/jmReportReview.html?iscw=true&"
				break;
			case 4:
			url = "bidPrice/ReportStatisticsApproval/model/dbReportReview.html?iscw=true&"
				break;
			default:
				return false;
				break;
		} */
		url = "bidPrice/DataReport/public/model/publicListView.html";
		top.layer.open({
			type: 2,
			area: ["100%", "100%"],
			maxmin: true,
			resize: false,
			title: "查看",
			content: url + "?projectId=" + row.tenderProjectID + '&flage=2&id=' + row.id,
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
					iframeWind.du(row)
				}

			}
		});
	},
//	"click .audit": function(e, value, row, index) {
//		let tenderType = row.tenderType;
//		let url = "";
//		switch(tenderType) {
//			case 0:
//				url = "bidPrice/ReportStatisticsApproval/model/xbReportReview.html?iscw=true"
//				break;
//			case 1:
//				url = "bidPrice/ReportStatisticsApproval/model/jjReportReview.html?iscw=true"
//				break;
//			case 2:
//				url = "bidPrice/ReportStatisticsApproval/model/jmReportReview.html?iscw=true"
//				break;
//			case 4:
//				break;
//		}
//		top.layer.open({
//			type: 2,
//			area: ["1100px", "650px"],
//			maxmin: true,
//			resize: false,
//			title: "审核",
//			content: url + "?projectId=" + row.id + "&accepType=" + row.accepType + "&tenderType=" + row.tenderType + '&edittype=audit',
//			success: function(layero, index) {
//				var iframeWind = layero.find('iframe')[0].contentWindow;
//				if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj") { //项目公告
//					iframeWind.du(row)
//				}
//
//			}
//		});
//	}
}
//设置查询条件
function queryParams(params) {
	// $("#projectName").val(),
	var para = {
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'tenderProjectName': $("#tenderProjectName").val(),
		'tenderProjectCode': $("#tenderProjectCode").val(),
		'bidSectionCode': $("#bidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val(),
		'tenderAgencyLinkmen': $("#tenderAgencyLinkmen").val(),
		'tenderType': $("#tenderType").val(),

		//新增修改
		'checkState': $("#checkState").val(),
		'subDateStart': $("#subStartDate").val(),
		'subDateEnd': $("#subEndDate").val(),
		'noticeSendTimeStart': $("#noticeSendStartTime").val(),
		'noticeSendTimeEnd': $("#noticeSendEndTime").val(),
		'departmentName': $("#enterpriseld").val(),
		'departmentId': $("#dept").val(),
		'purchaserName': $("#purchaserName").val(),
		'purchaserLinkmen': $("#purchaserLinKmen").val(),
		'legalName': $("#legalName").val(),
		'projectOfficeName': $("#projectOfficeName").val()
	};
	return para;
}

function intTable() {
	var type = $("#tenderType").val();
	//查询列表
	$("#ProjectAuditTable").bootstrapTable({
		url: urlProjectCheckList,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
			toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		clickToSelect: true, //是否启用点击选中行
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: queryParams, //查询条件参数
		striped: true,
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: "50px",
				formatter: function(value, row, index) {
					var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'tenderProjectName',
				title: '项目名称',
				align: 'left',

			},
			{
				field: 'tenderProjectCode',
				title: '项目编号',
				align: 'left',
				width: '180'
			}, {
				visible: type != 2,
				field: 'bidSectionName',
				title: (type == 4 ? '标段名称' : '包件名称'),
				align: 'left',
			},
			{
				visible: type != 2,
				field: 'bidSectionCode',
				title: (type == 4 ? '标段编号' : '包件编号'),
				align: 'left',
				width: '180'
			},

			{
				field: 'tenderAgencyLinkmen',
				title: '项目经理',
				align: 'left',
				width: '100',
			},
			{
				field: 'tenderType',
				title: '审核类型',
				align: 'center',
				width: '180',
				formatter: function(value, row, index) {
					srt = "";
					switch(value) {
						case 0:
							srt = "询比采购"
							break;
						case 1:
							srt = "竞价采购"
							break;
						case 2:
							srt = "竞卖"
							break;
							//					case 3:
							//					srt = "询比采购"
							//						break;
						case 4:
							srt = "招标采购"
							break;
					}
					return srt;
				}
			},

			{
				field: 'checkState',
				title: '审核状态',
				align: 'center',
				width: '100',
				formatter: function(value, row, index) {
					if(value == "0") {
						return "<div class='text-info'>未提交</div>"
					} else if(value == "1") {
						return "<div class='text-warning'>审核中</div>"
					} else if(value == "2" || value == "5") {
						return "<div class='text-success'>审核通过</div>"
					} else if(value == "3") {
						return "<div class='text-danger'>审核未通过</div>"
					}else if(value == "4"){
						return "<div class='text-danger'>已撤回</div>"
					}
				}
			},
			{
				field: '#',
				title: '操作',
				align: 'center',
				width: '80',
				events: openAudit,
				formatter: function(value, row, index) {
					return "<button type='button'  class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
				}
			}
		]
	});
}

//xinzeng
//审核成功撤回
function recall_btn2(id) {

	parent.layer.prompt({
		title: '撤回原因',
		FormType: 1
	}, function(text, index) {
		if(text.trim().length == 0) {
			console.log(text)
			parent.layer.alert("请输入撤回原因")
			return;
		}
		$.ajax({
			url: recallCompileDateReport,
			type: 'post',
			async: false,
			data: {
				"id": id,
				'checkState': 4,
				"workflowContent": text
			},
			success: function(data) {
				if(data.success) {
					parent.layer.close(index)
					parent.layer.alert("撤回成功!")
					setTimeout(function() {
						$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
					}, 200)
				} else {
					parent.layer.alert(data.message)
				}
			},
			error: function() {
				parent.layer.alert("操作失败")
			}
		})
	}, function(index) {
		parent.layer.close(index)
	})

};

// 选择部门
function getEnterpriseld() {
	var mnuid = $("#enterpriseld").val()
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee2.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.employee("","",callEmployeeBack,mnuid)
		},

	})
}

function callEmployeeBack(aRopName,dataTypeList) {
	var  itemTypeId=[];
	var  itemTypeName=[];
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList=itemTypeId.join(",");
	typeNameList=itemTypeName.join(",");
	
	$("#dept").val(typeIdList);
	$("#deptName").html(typeNameList);
	$("#enterpriseld").val(typeNameList);
}


//取消撤回
function cancel_btn2(id) {
	parent.layer.confirm('确定要取消撤回 ', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallCompileDateReport,
			type: 'post',
			async: false,
			data: {
				"id": id,
				"checkState": 5
			},
			success: function(data) {
				setTimeout(function() {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！			
				}, 200)
				parent.layer.close(index);
			},
			error: function(data) {
				parent.layer.alert("取消失败")
			}
		});

	}, function(index) {
		parent.layer.close(index)
	});
}