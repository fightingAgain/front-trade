/**
 *  zhouyan 
 *  2019-2-25
 *  公告列表
 *  方法列表及功能描述
 */
var editUrl = "Bidding/Project/model/bidSectionEdit.html"; // 后审新增
var editPreUrl = "Bidding/Project/model/preBidSectionEdit.html"; // 预审新增
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //后审  查看标段详情页面
var bidDetailPreHtml = "Bidding/BidIssuing/roomOrder/model/preBidView.html"; //后审  查看标段详情页面
var bidSectionPage = "Bidding/Project/reTender/model/bidSectionList.html"; //标段列表

var delUrl = config.tenderHost + "/NoticeController/delete.do"; //删除
//var backUrl = config.tenderHost + "/NoticeController/revokeWorkflowItem.do";	//撤回
var pageUrl = config.tenderHost + "/BidExcepitonController/findPageBidEctionNum.do"; //分页

var bidUrl = config.tenderHost + "/NoticeController/findAllById.do"; //标段详情地址
var copyUrl = config.tenderHost + "/NoticeController/copy.do"; //保存地址
var bidDelUrl = config.tenderHost + '/BidSectionController/delete.do'; //删除标段
var revokeUrl = config.tenderHost + '/BidSectionController/revokeWorkflowItem.do'; //撤回接口
//入口函数 
$(function() {
	//加载列表
	initJudgeTable();

	//编辑
	$("#tableList").on("click", ".btnEdit", function() {
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#tableList").on("click", ".btnView", function() {
		var index = $(this).attr("data-index");
		openView(index);
	});
	/*查询*/
	$('#btnSearch').click(function() {
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*添加*/
	$('#btnAdd').click(function() {
		openEdit("");
	});
	//删除标段
	$("#tableList").on("click", ".btnDel", function() {
		var index = $(this).attr("data-index");
		rowData = $('#tableList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该标段?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: bidDelUrl,
				type: "post",
				data: {
					id: rowData.id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert("删除成功");
					$("#tableList").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	});

	//撤回标段
	$("#tableList").on("click", ".btnRevoke", function() {
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		getHasFile('bid', rowData.id, revokeProject, '此标段有已提交的资格预审文件/招标文件，建议先撤回资格预审文件/招标文件，否则部分信息无法修改');
		
	});
	function revokeProject(id){
		parent.layer.confirm('确定撤回该标段?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: revokeUrl,
				type: "post",
				data: {
					id: id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.layer.alert("撤回成功");
					$("#tableList").bootstrapTable("refresh");
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
		
	}
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index, data) {
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData = "",
		url = "",
		title = "";
	if(index == -1) {
		title = "标段信息";
		rowData = data;
		// if(data.examType == 2) {
			url = editUrl + "?bidSectionId=" + rowData.bidSectionId + "&examType=" + rowData.examType + "&tenderProjectId=" + rowData.tenderProjectId + "&source=1&classCode=" + (rowData.tenderProjectType == "C50"?rowData.tenderProjectType:rowData.tenderProjectType.substring(0, 1)) + "&isPublicProject=" + rowData.isPublicProject;
		// } else if(data.examType == 1) {
		// 	url = editPreUrl + "?bidSectionId=" + rowData.bidSectionId + "&examType=" + rowData.examType + "&tenderProjectId=" + rowData.tenderProjectId + "&source=1&classCode=" + (rowData.tenderProjectType == "C50"?rowData.tenderProjectType:rowData.tenderProjectType.substring(0, 1)) + "&isPublicProject=" + rowData.isPublicProject;
		// }

	} else if(index != "" && index != undefined) {
		rowData = $('#tableList').bootstrapTable('getData')[index];
		// if(rowData.examType == 2) {
			url = editUrl + "?id=" + rowData.id + "&examType=" + rowData.examType + "&source=1&isPublicProject=" + rowData.isPublicProject + "&tenderProjectId=" + rowData.tenderProjectId + "&classCode=" + (rowData.tenderProjectType == "C50"?rowData.tenderProjectType:rowData.tenderProjectType.substring(0, 1));
		/* } else if(rowData.examType == 1) {
			url = editPreUrl + "?id=" + rowData.id + "&examType=" + rowData.examType + "&source=1&isPublicProject=" + rowData.isPublicProject + "&tenderProjectId=" + rowData.tenderProjectId + "&classCode=" + (rowData.tenderProjectType == "C50"?rowData.tenderProjectType:rowData.tenderProjectType.substring(0, 1));
		} */
		title = "标段信息";
	} else {
		url = bidSectionPage;
		title = "选择标段"
	}
	top.layer.open({
		type: 2,
		title: title,
		area: ['1000px', '600px'],
		resize: false,
		content: url,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			rowData.source = 1;
			if(index == "") {
				iframeWin.passMessage(rowData, bidOpenEdit);
			} else {
				iframeWin.passMessage(rowData); //调用子窗口方法，传参
			}
		}
	});

}

function bidOpenEdit(data) {
	openEdit(-1, data[0]);
}

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	bidDetailPreHtml
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var jumpUrl = '';
	if(rowData[index].examType == 2) {
		jumpUrl = bidDetailHtml + "?id=" + rowData[index].id + "&source=1&examType=" + rowData[index].examType + "&classCode=" + rowData[index].tenderProjectType.substring(0, 1) + "&isPublicProject=" + rowData[index].isPublicProject;
	} else if(rowData[index].examType == 1) {
		jumpUrl = bidDetailPreHtml + "?id=" + rowData[index].id + "&source=1&examType=" + rowData[index].examType + "&classCode=" + rowData[index].tenderProjectType.substring(0, 1) + "&isPublicProject=" + rowData[index].isPublicProject;
	}
	layer.open({
		type: 2,
		title: "标段信息",
		area: ['1000px', '600px'],
		content: jumpUrl,
		resize: false,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData[0]); //调用子窗口方法，传参
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode': $('#interiorBidSectionCode').val(),
		'bidSectionName': $('#bidSectionName').val(),
		'noticeState': $('#noticeState').val(),
	};
	return projectData;
};
//表格初始化
function initJudgeTable() {
	$("#tableList").bootstrapTable({
		url: pageUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		fixedColumns: true,
		height:tableHeight,
		toolbar:"#toolbarTop",
		fixedNumber: 2,
		onCheck: function(row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					//width: '50',
					align: 'center',
					formatter: function(value, row, index) {
						var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
						var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
						return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
					},
					cellStyle: {
						css: widthXh
					}
				},
				{
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				}, {
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				}, {
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				}, {
					field: 'states',
					title: '状态',
					align: 'left',
					cellStyle: {
						css: widthState
					},
					formatter: function(value, row, index) {

						if(value == 0) {
							return "未提交";
						} else if(value == 1) {
							return "生效";
						} else if(value == 2) {
							return "撤回";
						} else if(value == 3) {
							return "招标完成";
						} else if(value == 4) {
							return "招标失败";
						} else if(value == 5) {
							return "重新招标";
						} else if(value == 6) {
							return "终止";
						}
					}
				},
				{
					field: 'states',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle: {
						css: {
							'white-space': 'nowrap'
						}
					},
					formatter: function(value, row, index) {

						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strRevoke = '<button  type="button" class="btn btn-danger btn-sm btnRevoke" data-index="' + index + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
						//						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤回修改</button>';
						//						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						var strSet = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="' + index + '"><span class="glyphicon glyphicon-ok-circle"></span>项目成员设置</button>';
						// if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(value == 0) {
								str += strSee + strEdit + strDel;
							} else if(value == 1) {
								str += strSee + strRevoke;
							} else if(value == 2) {
								str += strSee + strEdit + strDel;
							} else if(value == 3) {
								str += strSee;
							} else if(value == 4) {
								str += strSee;
							} else if(value == 5) {
								str += strSee;
							} else if(value == 6) {
								str += strSee;
							}
							return str;
						// }else{
						// 	return strSee;
						// }
						
					}
				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	//	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}