var urlPurchaseList = config.bidhost + '/ProjectPackageController/findProjectPackagePageFileList.do';
var recallUrl = config.bidhost + '/WorkflowController/updateFileState.do' //文件撤回
var iframeWinAdd = "";
var tenderTypeCode;
var examTypeCode, accepTypeCode;
var changeCode;
var uploadpackage = 'Auction/common/Agent/Purchase/model/fileInfo.html';
var viewpackage = 'Auction/common/Agent/Purchase/model/fileInfo.html';
//表格初始化
$(function() {
	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {
		if(PAGEURL.split("?")[1].split("&")[0].split("$")[0].split("=")[0] == "examType") {
			examTypeCode = PAGEURL.split("?")[1].split("&")[0].split("=")[1];
		} else {
			examTypeCode = 1;

		}
	} else {
		examTypeCode = 0;

	}
	if(examTypeCode == 0) {
		accepTypeCode = 'zgyswj'
	} else {
		accepTypeCode = 'xjcgwj'
	}
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！	
		initTable();			
	});
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'projectName': $("#projectName").val(),
		'projectCode': $("#projectCode").val(),
		'packageName': $("#packageName").val(),
		'packageNum': $("#packageNum").val(),
		//'packageState':2,
		'examType': examTypeCode,
		'enterpriseType': '02',
		'tenderType': 0,
		//'change':changeCode
	}
};


function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlPurchaseList, // 请求url		
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
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			width: '250'
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			width: '250',
			formatter: function(value, row, index) {
				if(row.packageSource == 1) {
					return value + '<span class="text-danger">(重新采购)</span>';
				} else {
					return value;
				}

			}
		}, {
			field: 'fileChangeCount',
			title: '变更次数',
			align: 'center',
			formatter:function(value, row, index){
				if(value || value == 0){
					if(value == 0){
						return "首次";
					} else {
						return "第" +value+ "次变更";
					}
				}
			}
		},{
			field: 'subCount',
			title: '文件状态',
			width: '100',
			align: 'center',
			formatter: function(value, row, index) {
				if(row.fileCheckState == undefined || (row.fileCheckState != undefined && row.fileCheckState == 0)) {

					return "<span class='red'>未提交</span>";
				} else {

					if(row.fileCheckState == 1 || row.fileCheckState == 2 || row.fileCheckState == 3) {
						return "<span style='color:green;'>已提交</span>";
					}

					if(row.fileCheckState == 4) {
						return "<span class='red'>未提交</span>";
					}
				}
			}

		}, {
			field: 'subCount',
			title: '文件数量',
			width: '100',
			align: 'center',
			formatter: function(value, row, index) {
				if(row.fileCheckState == undefined || (row.fileCheckState != undefined && row.fileCheckState == 0)) {
					return "0";
				} else {

					if(row.fileCheckState == 1 || row.fileCheckState == 2 || row.fileCheckState == 3) {
						return value;
					}

					if(row.fileCheckState == 4) {
						return "0";
					}
				}
			}

		}, {
			field: 'fileCheckState',
			title: '审核状态',
			width: '100',
			align: 'center',
			formatter: function(value, row, index) {
				//0为未审核，1为审核中，2为审核通过，3为审核不通过
				if(row.fileCheckState == 0) {
					return "<span class='red'>未审核</span>";
				} else if(row.fileCheckState == 1) {
					return "<span style='color:red;'>审核中</span>";
				} else if(row.fileCheckState == 2) {
					return "<span style='color:green;'>审核通过</span>";
				} else if(row.fileCheckState == 3) {
					return "<span style='color:red;'>审核不通过</span>";
				} else if(row.fileCheckState == 4) {
					return "<span style='color:red;'>撤回</span>";
				}
			}
		}, {
			field: '',
			title: '操作',
			align: 'center',
			halign: 'center',
			width: '200',
			formatter: function(value, row, index) {
				var Tdr = "";
				var viewBtn = '<button class="btn-xs btn btn-primary" onclick=fileView(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
				if(row.createType != undefined && row.createType == 1) {
					Tdr += viewBtn;
				} else {
					if (row.fileCheckId) {
						Tdr += viewBtn;
					}
					if(row.fileCheckState == undefined || (row.fileCheckState != undefined && row.fileCheckState == 0)) {
						//上传
						Tdr += '<button class="btn-xs btn btn-primary"onclick=fileBtn(\"' + index + '\",0)><span class="glyphicon glyphicon-export" aria-hidden="true"></span>上传</button>';
					} else {
						// Tdr += '<button class="btn-xs btn btn-primary" onclick=fileView(\"' + index + '\")><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>查看</button>';
						if(row.fileCheckState == 2) {
							//审核通过
							Tdr += '<button class="btn-xs btn btn-primary" onclick=fileChange(\"' + index + '\")><span class="glyphicon glyphicon-edit" aria-hidden="true"></span>变更</button>';
						}
						if(row.fileCheckState == 3) {
							//审核不通过
							Tdr += '<button class="btn-xs btn btn-primary" onclick=fileBtn(\"' + index + '\",1)><span class="glyphicon glyphicon-export" aria-hidden="true"></span>重新上传</button>';
						}
						if(row.fileCheckState == 4) {
							//撤回
							Tdr += '<button class="btn-xs btn btn-primary" onclick=fileBtn(\"' + index + '\",0)><span class="glyphicon glyphicon-export" aria-hidden="true"></span>重新上传</button>';
						}
						if(row.noticeState == 0) { //公告未发布
							if(row.fileCheckState != 4 && row.fileCheckState != 3) {
								//撤回
								Tdr += '<button class="btn-xs btn btn-warning" onclick=recall(\"' + row.id + '\")><span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回</button>'
							}
						} else if(row.noticeState == 1) { //公告已发布
							if(row.fileCheckState == 1) {
								//审核中
								Tdr += '<button class="btn-xs btn btn-warning" onclick=recall(\"' + row.id + '\")><span class="glyphicon glyphicon-share" aria-hidden="true"></span>撤回</button>'
							}
						}
					}
				}

				return Tdr;
			}
		}],
	})
};
//上传文件
function fileBtn($index, checkTypes) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	if(rowData[$index].signTimeout == 1) {
		if(examTypeCode == 0) {
			return parent.layer.alert("温馨提示:当前时间已晚于资格预审申请文件递交截止时间,无法上传操作");
		} else {
			return parent.layer.alert("温馨提示:当前时间已晚于报价截止时间,无法上传操作");
		}
	} else {
		parent.layer.open({
			type: 2 //此处以iframe举例
				,
			title: '上传文件',
			area: ['100%', '100%'],
			maxmin: true //开启最大化最小化按钮
				,
			content: uploadpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType=' + examTypeCode + '&tenderType=0&checkTypes=' + checkTypes+'&special=KZT',
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
			}
		});
	}

};

//查看文件
function fileView($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看文件',
		area: ['100%', '100%'],
		maxmin: true //开启最大化最小化按钮
			,
		content: viewpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType=' + examTypeCode + '&tenderType=0&special=VIEW',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		}
	});
};
//变更
function fileChange($index) {
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据	
	if(rowData[$index].signTimeout == 1) {
		if(examTypeCode == 0) {
			return parent.layer.alert("温馨提示:当前时间已晚于资格预审申请文件递交截止时间,无法变更操作!");
		} else {
			return parent.layer.alert("温馨提示:当前时间已晚于报价截止时间,无法变更操作!");
		}
	} else {
		parent.layer.open({
			type: 2 //此处以iframe举例
				,
			title: '变更文件',
			area: ['100%', '100%'],
			maxmin: true //开启最大化最小化按钮
				,
			content: uploadpackage+"?projectId="+rowData[$index].projectId+'&packageId='+rowData[$index].id+'&examType=' + examTypeCode + '&tenderType=0&special=CHANGE',
			success: function(layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
			}
		});
	}
}
//撤回
function recall(uid) {
	parent.layer.confirm('确定要撤回该' + (examTypeCode == 1 ? '询比采购文件' : '资格预审文件'), {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"businessId": uid,
				'examType': examTypeCode,
				'accepType': accepTypeCode
			},
			success: function(data) {
				if(data.success) {
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
				} else {
					parent.layer.alert(data.message)
				}

			},
			error: function(data) {
				parent.layer.alert("撤回失败")
			}
		});

		parent.layer.close(index);
	}, function(index) {
		parent.layer.close(index)
	});

}