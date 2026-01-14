var dataFilingUrl = top.config.AuctionHost + '/ProjectArchiveController/findProjectArchivePageList.do';
var recallUrl = top.config.AuctionHost + '/ProjectDateController/resetGDData.do';
var backHtml = 'media/js/Model/archivingRollback/model/back.html';//退回申请编辑页面
var cancelUrl = config.HghHost + "/GDDataController/updateSendBackState.do";	//退回取消
$(function() {
	//查询按钮
	$("#btnQuery").click(function() {
		$("#DataFilingTable").bootstrapTable('destroy');
		intable();
	});
	//两个下拉框事件
	$("#itemState,#tenderType,#auditState").change(function() {
		$("#DataFilingTable").bootstrapTable('destroy');
		intable();
	});
	intable()
})
//设置查询参数
function queryParams(params) {
	var para = {
		'pageNumber': params.offset / params.limit + 1,
		'pageSize': params.limit,
		'offset': params.offset, // SQL语句偏移量
		'tenderType': $("#tenderType").val(),
		'checkState': $("#itemState").val(),
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'auditState': $("#auditState").val(),
		'archivedConfirmStatus': $('#archivedConfirmStatus').val(),
	};
	return para;
}

function intable() {
	$("#DataFilingTable").bootstrapTable({
		url: dataFilingUrl,
		dataType: 'json',
		method: 'get',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		height: top.tableHeight,
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		clickToSelect: true, //是否启用点击选中行
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: queryParams, //查询条件参数
		striped: true,
		columns: [{
				title: '序号',
				align: 'center',
				width: "50px",
				formatter: function(value, row, index) {
					var pageSize = $('#DataFilingTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#DataFilingTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			}, {
				field: 'projectCode',
				title: '项目编号',
				align: 'left',
				cellStyle: {
					css: widthCode
				}
			}, {
				field: 'projectName',
				title: '项目名称',
				align: 'left',
				cellStyle: {
					css: widthName
				},
				formatter: function(value, row, index) {
					if(row.projectSource == 1) {
						var projectName = row.projectName + '<span class="text-danger"  style="font-weight:bold">(重新采购)</span>'
					} else {
						var projectName = row.projectName;
					}
					return projectName;
				}
			},
			{
				field: 'packageNum',
				title: '包件编号',
				align: 'left',
				cellStyle: {
					css: widthCode
				}
			},
			{
				field: 'packageName',
				title: '包件名称',
				align: 'left',
				cellStyle: {
					css: widthName
				}
			},
			{
				field: 'tenderType',
				title: '采购类型',
				align: 'center',
				width: '100',
				cellStyle: {
					css: {
						'white-space': 'nowrap'
					}
				},
				//0为询比采购，1为竞价采购，2为竞卖，3为询比报价，4为招标采购，5为谈判采购，6为单一来源采购，7为框架协议采购，8为战略协议采购
				formatter: function(value, row, index) {
					switch(value) {
						case 0:
							if(row.examType == 0) {
								return "<div>询比采购</div>";
							} else {
								return "<div>询比采购</div>";
							}
							break;
						case 1:
							return "<div>竞价采购</div>";
							break;
						case 2:
							return "<div>竞卖采购</div>";
							break;
						case 3:
							return "<div>询比报价</div>";
							break;
						case 4:
							return "<div>招标采购</div>";
							break;
						case 5:
							return "<div>谈判采购</div>";
							break;
						case 6:
							return "<div>单一来源采购</div>";
							break;
						case 7:
							return "<div>框架协议采购</div>";
							break;
						case 8:
							return "<div>战略协议采购</div>";
							break;
					}
				}
			},
			{
				field: 'filingState',
				title: '审核状态',
				align: 'center',
				width: '100',
				cellStyle: {
					css: {
						'white-space': 'nowrap'
					}
				},
				formatter: function(value, row, index) {
					if(value == "0") {
						return "<div class='text-danger'>未归档</div>"
					} else if(value == "1") {
						return "<div class='text-warning'>已提交</div>"
					} else if(value == "2") {
						return "<div class='text-success'>审核通过</div>"
					} else if(value == "3") {
						return "<div class='text-danger'>审核不通过</div>"
					}else if(value == "6") {
						return "待驳回"
					}
					/* if(value == "0") {
						return "<div class='text-danger'>未提交</div>"
					} else if(value == "1") {
						return "<div class='text-warning'>审核中</div>"
					} else if(value == "2") {
						return "<div class='text-success'>审核通过</div>"
					} else if(value == "3") {
						return "<div class='text-danger'>审核未通过</div>"
					} */
				}
			},
			{
				field: 'auditState',
				title: '退回申请状态',
				align: 'center',
				width: '100',
				cellStyle: {
					css: {
						'white-space': 'nowrap'
					}
				},
				formatter: function(value, row, index) {
					if(value == "1") {
						return "<div class='text-warning'>审核中</div>"
					} else if(value == "2") {
						return "<div class='text-success'>审核通过</div>"
					} else if(value == "3") {
						return "<div class='text-danger'>审核不通过</div>"
					}else if(value == "4") {
						return "审核通过"
					}else{
						return "-"
					}
				}
			},
			{
				field: 'archivedConfirmStatus',
				title: '项目资料移交状态',
				align: 'left',
				formatter: function (value, row, index) {
					if (value == 0) {
						return '未移交'
					} else if (value == 1) {
						return '已移交'
					} else if (value == 2) {
						return '已接收';
					}
				}
			},
			{
				field: '#',
				title: '操作',
				align: 'center',
				width: '150',
				events: {
					'click .detailed': function(e, value, row, index) {
						var type = $(this).data('type');
						switch(row.tenderType) {
							case 0: //询比
								if(row.examType == 0) { //预审
									var Infourl = 'bidPrice/DataFiling/model/examTypeDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								} else { //后审
									var Infourl = 'bidPrice/DataFiling/model/DataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								}
								break;
							case 6: //询比
								var Infourl = 'bidPrice/DataFiling/model/DataFilingInfoDY.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								break;
							case 1: //竞价
								var Infourl = 'bidPrice/DataFiling/model/auctionDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								break;
							case 2: //竞卖
								var Infourl = 'bidPrice/DataFiling/model/SaleDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								break;
							default:
								break;
						}
						parent.layer.open({
							type: 2 //此处以iframe举例
								,
							title: '查看资料归档',
							area: ['100%', '100%'],
							maxmin: true //开启最大化最小化按钮
								,
							content: Infourl,
							success: function(layero, index) {
								var iframeWind = layero.find('iframe')[0].contentWindow;
							}
						});
					},
					'click .filing': function(e, value, row, index) {
						var type = $(this).data('type');
						switch(row.tenderType) {
							case 0: //询比
								if(row.examType == 0) { //预审
									var Infourl = 'bidPrice/DataFiling/model/examTypeDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								} else { //后审
									var Infourl = 'bidPrice/DataFiling/model/DataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								}
								break;
							case 6: //询比
								var Infourl = 'bidPrice/DataFiling/model/DataFilingInfoDY.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								break;
							case 1: //竞价
								var Infourl = 'bidPrice/DataFiling/model/auctionDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								break;
							case 2: //竞卖
								var Infourl = 'bidPrice/DataFiling/model/SaleDataFilingInfo.html?packageId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								break;
							default:
								break;
						}
						parent.layer.open({
							type: 2 //此处以iframe举例
								,
							title: '查看资料归档',
							area: ['100%', '100%'],
							maxmin: true //开启最大化最小化按钮
								,
							content: Infourl,
							success: function(layero, index) {
								var iframeWind = layero.find('iframe')[0].contentWindow;
							}
						});
					},
					
					'click .recall': function(e, value, row, index) {
						parent.layer.confirm('确定要撤回该资料归档', {
							btn: ['是', '否'] //可以无限个按钮
						}, function(indexs, layero) {
							$.ajax({
								url: recallUrl,
								type: 'post',
								//dataType:'json',
								async: false,
								//contentType:'application/json;charset=UTF-8',
								data: {
									"id": row.id,
									'accepType': 'zlgd',
								},
								success: function(data) {
									if(data.success) {
										$('#DataFilingTable').bootstrapTable('refresh'); // 很重要的一步，刷新url！
										parent.layer.close(indexs);
									} else {
										parent.layer.alert(data.message)
									}

								},
								error: function(data) {
									parent.layer.alert("撤回失败")
								}
							});

						}, function(indexs) {
							parent.layer.close(indexs)
						});
					},
					'click .btnApply': function(e,value, row, index){
						top.layer.open({
							type: 2,
							title: '退回申请',
							area: ['1000px', '600px'],
							resize: false,
							content:  backHtml+'?id='+ row.id + '&type=fzbzlgdth',
							success:function(layero, index){
								var iframeWin = layero.find('iframe')[0].contentWindow;	
	//									iframeWin.getLoginInfo(loginInfo);
							},
						});
					},
					'click .btnCancel': function(e,value, row, index){
						layer.confirm('确定撤回退回申请?', {icon: 3, title:'询问'}, function(ind){
							layer.close(ind);
							$.ajax({
								type:"post",
								url:cancelUrl,
								data: {
									// 'gdProjectSendBackDataId': id,
									'auditState': '0',
									'gdProjectId': row.id
								},
								async:true,
								dataType: 'json',
								success: function(data){
									if(data.success){
										layer.alert("撤回成功",{title:'提示'},function(index){
											layer.close(index);
										})
										$('#DataFilingTable').bootstrapTable('refresh'); 
									}else{
										
										layer.alert(data.message,{title:'提示'})
									}
								}
							});
							// backArchive(row.gdId);
						});
					},
				},
				formatter: function(value, row, index) {
					var btn = "";
					var btn_filing = "<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>资料归档</button>";
					var btn_view = "<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
					var btn_recall = "<button type='button' class='btn btn-xs btn-warning recall'><span class='glyphicon glyphicon-share' aria-hidden='true'></span>撤回</button>"
					var btn_refiling = "<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>重新归档</button>";
					var btn_sub = "<button type='button' data-type='edit' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span>提交审核</button>";
					// var btn_back = "<button type='button' data-type='edit' class='btn btn-xs btn-primary back'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span>退回申请</button>";
					
					var strBackApply = '<button  type="button" class="btn btn-primary btn-sm btnApply" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>退回申请</button>';
					var strCancel = '<button  type="button" class="btn btn-primary btn-sm btnCancel" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>退回取消</button>';
					
					if(row.employeeId=="1"){
						if(row.filingState == 0){
							if(row.auditState == 2){
								return btn_filing + btn_view;
							}else{
								return btn_filing;
							}
						}else if(row.filingState == 1){
							return btn_view;
							// return btn_view + btn_recall;
						}else if(row.filingState == 2){
							if(row.auditState == 0){
								return btn_view + strBackApply;
							}else if(row.auditState == 1){
								return btn_view + strCancel;
							}else if(row.auditState == 2){
								return btn_view + strBackApply;
							}else if(row.auditState == 3){
								return btn_view + strBackApply;
							}else{
								return btn_view + strBackApply;
							}
						}else if(row.filingState == 3){
							return btn_filing + btn_view;
						}else if(row.filingState == 4){
							return btn_filing + btn_view;
						}else{
							return btn_view;
						}
					}else{
						return btn_view;
					}
					
					/* if(row.filingFinish == 0 && row.employeeId=="1") {
						btn += btn_filing;
					} else {
						if(row.filingState == 1) {
							btn += btn_view + btn_recall;
						} else if(row.filingState == 2) {
							btn += btn_view;
						} else if(row.filingState == 3) {
							btn += btn_recall;
						}else if((row.filingState == undefined ||row.filingState == 0)&& row.employeeId=="0") {
							btn += btn_view;
						} else {
							btn += btn_sub;
						}
					
					} */
					
					/* if(row.filingFinish == 0 && row.employeeId=="1") {
						btn += "<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>资料归档</button>";
					} else {
						if(row.filingState == 1) {
							btn += "<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
							btn += "<button type='button' class='btn btn-xs btn-warning recall'><span class='glyphicon glyphicon-share' aria-hidden='true'></span>撤回</button>";
						} else if(row.filingState == 2) {
							btn += "<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
						} else if(row.filingState == 3) {
							btn += "<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>重新归档</button>";
						}else if((row.filingState == undefined ||row.filingState == 0)&& row.employeeId=="0") {
							btn += "<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
						} else {
							btn += "<button type='button' data-type='edit' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span>提交审核</button>";
						}

					} */
					return '<div class="btn-group">' + btn + '</div>'
				}

			}
		]
	});
}