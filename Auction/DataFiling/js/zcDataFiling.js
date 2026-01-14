var dataFilingUrl = top.config.AuctionHost + '/ProjectArchiveController/findSelfProjectArchivePageList.do';
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
									var Infourl = 'bidPrice/DataFiling/model/zcExamTypeDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								} else { //后审
									var Infourl = 'bidPrice/DataFiling/model/zcDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								}
								break;
							case 6: //询比
								var Infourl = 'bidPrice/DataFiling/model/zcDataFilingInfoDY.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								break;
							case 1: //竞价
								var Infourl = 'bidPrice/DataFiling/model/zcAuctionDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
								break;
							case 2: //竞卖
								var Infourl = 'bidPrice/DataFiling/model/zcSaleDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState;
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
									var Infourl = 'bidPrice/DataFiling/model/zcExamTypeDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								} else { //后审
									var Infourl = 'bidPrice/DataFiling/model/zcDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								}
								break;
							case 6: //询比
								var Infourl = 'bidPrice/DataFiling/model/zcDataFilingInfoDY.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								break;
							case 1: //竞价
								var Infourl = 'bidPrice/DataFiling/model/zcAuctionDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
								break;
							case 2: //竞卖
								var Infourl = 'bidPrice/DataFiling/model/zcSaleDataFilingInfo.html?bidSectionId=' + row.packageId + '&tenderType=' + row.tenderType + '&projectId=' + row.projectId + '&type=' + type + '&uid=' + row.id + '&filingState=' + row.filingState+'&employeeId='+row.employeeId;
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
				},
				formatter: function(value, row, index) {
					var btn = "";
					var btn_filing = "<button type='button' data-type='edit' class='btn btn-xs btn-primary filing'><span class='glyphicon glyphicon-print' aria-hidden='true'></span>资料归档</button>";
					var btn_view = "<button type='button' data-type='view' class='btn btn-xs btn-primary detailed'><span class='glyphicon glyphicon-eye-open' aria-hidden='true'></span>查看</button>";
					
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
								return btn_view ;
							}else if(row.auditState == 1){
								return btn_view ;
							}else if(row.auditState == 2){
								return btn_view ;
							}else if(row.auditState == 3){
								return btn_view ;
							}else{
								return btn_view ;
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
				}

			}
		]
	});
}