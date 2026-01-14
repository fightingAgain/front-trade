/**
*  zhouyan 
*  2019-2-20
*  查看标段列表
*  方法列表及功能描述
*/

var tenderUrl = config.tenderHost + '/GDDataController/findGDDataPageList.do'; //获取所有标段列表
var backUrl = config.tenderHost + "/GDDataController/resetGDData.do";	//撤回GDDataController/updateSendBackState
var cancelUrl = config.HghHost + "/GDDataController/updateSendBackState.do";	//退回取消

var editHtml = 'Bidding/Archiving/model/edit.html';//编辑项目资料归档
var viewHtml = 'Bidding/Archiving/model/view.html';//查看项目资料归档
var backHtml = 'media/js/Model/archivingRollback/model/back.html';//退回申请编辑页面
$(function () {
	useType = $.getUrlParam('useType');//公告列表中带过来的标段Id
	getTendereeList()
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	//查询
	$("#btnSearch").click(function () {
		$("#DataFilingTable").bootstrapTable('destroy');
		getTendereeList();
	});
	//两个下拉框事件
	$("#filingState,#auditState").change(function () {
		$("#DataFilingTable").bootstrapTable('destroy');
		getTendereeList();
	});
});


function getTendereeList() {
	$('#DataFilingTable').bootstrapTable({
		method: 'post', // 向服务器请求方式
		url: tenderUrl,
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [5, 10, 25, 50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		height: tableHeight,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onLoadError: function () {
			parent.layer.closeAll("loading");
			parent.layer.alert("请求失败");
		},
		onLoadSuccess: function (data) {
			parent.layer.closeAll("loading");
			if (!data.success) {

				parent.layer.alert(data.message);
			}
		},
		columns: [
			{
				field: 'xh',
				title: '序号',
				width: '50',
				align: 'center',
				formatter: function (value, row, index) {
					var pageSize = $('#DataFilingTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#DataFilingTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'interiorBidSectionCode',
				title: '标段编号',
				align: 'left',
				width: '180',
			},
			{
				field: 'bidSectionName',
				title: '标段名称',
				align: 'left',
				width: '250',
			},
			{
				field: 'tenderProjectType',
				title: '标段类型',
				align: 'center',
				formatter: function (value, row, index) {
					var str = "";
					if (row.systemType == 1) {
						if (value == 'C50') {
							str = "广宣类";
						} else {
							if (value.split('')[0] == 'A') {
								str = "工程";
							} else if (value.split('')[0] == 'B') {
								str = "货物";
							} else if (value.split('')[0] == 'C') {
								str = "服务";
							}
						}
					} else if (row.systemType == 2) {
						if (value == '1') {
							str = "工程类型";
						} else if (value == '2') {
							str = "国内货物";
						} else if (value == '3') {
							str = "国际招标";
						} else if (value == '4') {
							str = "服务类型";
						} else if (value == '5') {
							str = "广宣平台";
						}
						//"1": "工程类型","2": "国内货物", "3": "国际货物","4": "服务类型","5": "广宣平台",
					}

					return str;
				}
			},
			{
				field: 'examType',
				title: '资格审查方式 ',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					var str = "";
					if (value == 1) {
						str = "预审";
					} else if (value == 2) {
						str = "后审";
					}
					return str;
				}
			}, {
				field: 'filingState',
				title: '审核状态 ',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					if (value == "0") {
						return "<div class='text-danger'>未归档</div>"
					} else if (value == "1") {
						return "<div class='text-warning'>已提交</div>"
					} else if (value == "2") {
						return "<div class='text-success'>审核通过</div>"
					} else if (value == "3") {
						return "<div class='text-danger'>审核未通过</div>"
					} else if (value == "6") {
						return "待驳回"
					}
					/* if (value == '0') {
						return "<span style='color:red;'>未提交</span>";
					} else if (value == '1') {
						return "审核中";
					}else if (value == '2') {
						return "<span style='color:green;'>审核通过</span>";
					} else if (value == '3'){
						return "<span style='color:red;'>审核未通过</span>";
					}else if (value == '4'){
						return "<span style='color:red;'>撤回</span>";
					}else{
						return "未编辑";
					} */
				}
			}, {
				field: 'auditState',
				title: '退回申请状态',
				align: 'center',
				width: '140',
				formatter: function (value, row, index) {
					if (value == "1") {
						return "<div class='text-warning'>审核中</div>"
					} else if (value == "2") {
						return "<div class='text-success'>审核通过</div>"
					} else if (value == "3") {
						return "<div class='text-danger'>审核未通过</div>"
					} else if (value == "4") {
						return "审核通过"
					} else {
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
				field: 'status',
				title: '操作 ',
				align: 'left',
				width: '200',
				events: {
					'click .btnEdit': function (e, value, row, index) {
						top.layer.open({
							type: 2,
							title: '项目资料归档',
							area: ['100%', '100%'],
							resize: false,
							//						id:'layerPackage',
							content: editHtml + '?bidSectionId=' + row.bidSectionId + '&examType=' + row.examType + '&tenderMode=' + row.tenderMode +
								'&projectId=' + row.projectId + '&id=' + (row.gdId ? row.gdId : '') + '&systemType=' + row.systemType,
							success: function (layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								//									iframeWin.getLoginInfo(loginInfo);
							},
						});
					},
					'click .btnView': function (e, value, row, index) {
						top.layer.open({
							type: 2,
							title: '查看归档',
							area: ['100%', '100%'],
							resize: false,
							//						id:'layerPackage',
							content: viewHtml + '?id=' + (row.gdId ? row.gdId : '') + '&examType=' + row.examType + '&tenderMode=' +
								row.tenderMode + "&isThrough=" + (row.filingState == 2 ? 1 : 0) + '&source=0' + '&systemType=' + row.systemType,
							success: function (layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								//									iframeWin.getLoginInfo(loginInfo);
							},
						});
					},
					'click .btnBack': function (e, value, row, index) {
						layer.confirm('确定撤回?', { icon: 3, title: '询问' }, function (ind) {
							layer.close(ind);
							backArchive(row.gdId);
						});
					},
					'click .btnApply': function (e, value, row, index) {
						top.layer.open({
							type: 2,
							title: '退回申请',
							area: ['1000px', '600px'],
							resize: false,
							content: backHtml + '?id=' + row.gdId + '&type=zlgdth',
							success: function (layero, index) {
								var iframeWin = layero.find('iframe')[0].contentWindow;
								//									iframeWin.getLoginInfo(loginInfo);
							},
						});
					},
					'click .btnCancel': function (e, value, row, index) {
						layer.confirm('确定撤回退回申请?', { icon: 3, title: '询问' }, function (ind) {
							layer.close(ind);
							$.ajax({
								type: "post",
								url: cancelUrl,
								data: {
									// 'gdProjectSendBackDataId': id,
									'auditState': '0',
									'gdProjectId': row.gdId
								},
								async: true,
								dataType: 'json',
								success: function (data) {
									if (data.success) {
										layer.alert("撤回成功", { title: '提示' }, function (index) {
											layer.close(index);
										})
										$('#DataFilingTable').bootstrapTable('refresh');
									} else {

										layer.alert(data.message, { title: '提示' })
									}
								}
							});
							// backArchive(row.gdId);
						});
					},
				},
				formatter: function (value, row, index) {
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>资料归档</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>查看</button>';
					var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="' + index + '"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
					var strBackApply = '<button  type="button" class="btn btn-primary btn-sm btnApply" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>退回申请</button>';
					var strCancel = '<button  type="button" class="btn btn-primary btn-sm btnCancel" data-index="' + index + '"><span class="glyphicon glyphicon-repeat"></span>退回取消</button>';

					//权限  是否有操作权限1是  0否 或者是线下项目资料归档
					if ((row.owner && row.owner == 1) || (row.systemType && row.systemType == 2)) {
						if (row.filingState == 0) {
							if (row.auditState == 2) {
								return strEdit + strView;
							} else {
								return strEdit;
							}

						} else if (row.filingState == 1) {
							return strView;
						} else if (row.filingState == 2) {
							if (row.auditState == 1) {
								return strView + strCancel;
							} else if (row.auditState == 2) {
								return strView + strBackApply;
							} else {
								return strView + strBackApply;
							}
						} else if (row.filingState == 3) {
							return strEdit + strView;
						} else if (row.filingState == 4) {
							return strEdit + strView;
						} else {
							return strView;
						}
					} else {
						if (row.filingState || row.filingState == 0) {
							return strView;
						}
					}
				}
			}]
	});
}

// 分页查询参数，
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量	
		//      'useType': useType,
		'interiorBidSectionCode': $('#interiorBidSectionCode').val(),//标段编号
		'bidSectionName': $('#bidSectionName').val(),//标段名称
		'filingState': $('#filingState').val(),//标段名称
		'auditState': $('#auditState').val(),//标段名称
		'archivedConfirmStatus': $('#archivedConfirmStatus').val(),
	}
}

/**
 * 撤回
 */
function backArchive(id) {
	$.ajax({
		type: "post",
		url: backUrl,
		data: {
			'id': id
		},
		async: true,
		dataType: 'json',
		success: function (data) {
			if (data.success) {
				layer.alert("撤回成功", { title: '提示' }, function (index) {
					layer.close(index);
				})
				$('#DataFilingTable').bootstrapTable('refresh');
			} else {

				layer.alert(data.message, { title: '提示' })
			}
		}
	});
}