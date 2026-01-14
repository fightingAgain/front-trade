/**
*  zhouyan 
*  2019-6-3
*  确定中标人
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidWinCandidateController/findPageList.do';  //列表接口
var changeUrl = config.tenderHost + "/BidWinCandidateController/reset.do";	//变更 
var delUrl = config.tenderHost + "/BidWinNoticeController/deleteByPrimaryKey.do";	//删除
var cancelUrl = config.tenderHost + "/BidWinCandidateController/cancel.do";	//取消变更
var backUrl = config.tenderHost + "/BidWinCandidateController/resetWinCandidate.do";//撤回
var editHtml = 'Bidding/BidJudge/ResultSure/model/resultSureEdit.html';//编辑
var viewHtml = 'Bidding/BidJudge/ResultSure/model/resultSureView.html';//查看
var bidHtml = 'Bidding/BidJudge/ResultSure/model/bidList.html';//新增时选择标段页面

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//新增
	
	$("#btnAdd").click(function(){
		openBid()
	});
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		if (checkObjection(rowData.bidSectionId)) {
			return
		}
		openEdit(rowData);
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//变更
	$('#tableList').on('click','.btnReset',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认是否变更？',{icon:3,title:'询问',btn: ['确定', '取消']},function(ask){
			layer.close(ask);
			reset(index)
		})
	});
	
	//取消变更
	$('#tableList').on('click','.btnCancel',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认是否取消变更？',{icon:3,title:'询问',btn: ['确定', '取消']},function(ask){
			layer.close(ask);
			cancel(index);
		})
	});
	//撤回
	$('#tableList').on('click','.btnBack',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认是否撤回？',{icon:3,title:'询问',btn: ['确定', '取消']},function(ask){
			layer.close(ask);
			recall(index);
		})
	});
	
	
});
//选择标段
function openBid(){
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.getBid(bidInfo); 
		}
	});
}
function bidInfo(data){
	openEdit(data)
}
//编辑
function openEdit(data){
	
	var dataUrl;
	if(data.id){
		dataUrl = editHtml+'?id='+data.bidSectionId;
	}else{
		dataUrl = editHtml+'?id='+data.bidSectionId;
	}
	layer.open({
		type: 2,
		title: '确认中标人',
		area: ['100%', '100%'],
		content: dataUrl,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(data,refreshFather); 
		}
	});
};
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看确认中标人',
		area: ['100%', '100%'],
		content: viewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData); 
		}
	});
};
//变更
function reset(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:changeUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType': 2
		},
		success: function(data){
			if(data.success){
				rowData.id = data.data;
        		openEdit(rowData);
                $('#tableList').bootstrapTable(('refresh'));
			}else{
				layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};


//取消变更
function cancel(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:cancelUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType': 2
		},
		success: function(data){
			if(data.success){
				layer.alert('取消变更成功!',{icon:6,title:'提示'},function(ind){
	                    $('#tableList').bootstrapTable(('refresh'));
	                    layer.close(ind);
				});
			}else{
				layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};
//撤回

function recall(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:backUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType': 2
		},
		success: function(data){
			if(data.success){
				layer.alert('撤回成功!',{icon:6,title:'提示'},function(ind){
	                    $('#tableList').bootstrapTable('refresh');
	                    layer.close(ind);
				});
			}else{
				layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
		tenderProjectCode: $("#tenderProjectCode").val(), // 项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 项目名称
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
		url: listUrl,
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
		height: top.tableHeight,
		toolbar:"#toolbarTop",
		striped: true,
		onCheck: function (row) {
			id = row.id;
		},
		fixedColumns: true,
		fixedNumber: 2,
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					cellStyle: {
						css: widthXh
					},
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						return getTenderType(value);
					}
				},
				{
					field: 'noticeNature',
					title: '公示性质',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == "1"){//1为正常公示，2为更正公示，3为重发公示，9为其它
							return  '<span>正常</span>'
						}else if(value == "2"){
							return  '<span>变更</span>'
						}else if(value == "3"){
							return  '<span>重发</span>'
						}
					}
				},
//				{
//					field: 'publicityStartTime',
//					title: '发布时间',
//					align: 'center',
//					cellStyle:{
//						css:widthDate
//					},
//				},
				{
					field: 'states', //招标文件主表的创建时间
					title: '标段状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter:function(value, row, index){
						if(value == 1){
							return "生效";
						} else {
							return "<span style='color:red;'>招标异常</span>";
						}
					}
				},
				{
					field: 'noticeState',
					title: '审核状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(row.noticeState == 0){
							return  '<span>未提交</span>'
						}else if(row.noticeState == 1){
							return  '<span>待审核</span>'
						}else if(row.noticeState == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(row.noticeState == 3){
							return  '<span style="color:red">审核未通过</span>'
						}else if(row.noticeState == 4){
							return  '<span style="color:red">已撤回</span>'
						} else {
							return "未编辑";
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strReset = '<button  type="button" class="btn btn-primary btn-sm btnReset" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>变更</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>取消变更</button>';
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="' + index + '"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.states != 1){
								if(row.noticeState || row.noticeState == 0){
									return strView;
								} else {
									return "";
								}
							}
							if(row.noticeState || row.noticeState == 0){
								if(row.noticeState == '0' || row.noticeState == '3' || row.noticeState == '4'){
									if(row.noticeNature == "1"){
										return strEdit+strView;
									}else if(row.noticeNature == "2"){
										return strEdit+strView+strCancel;
									}else{
										return strEdit+strView;
									}
								}else if(row.noticeState == '2'){
									return strView+strReset;
								}else if(row.noticeState == '1'){
									return strView + strBack;
								}
							}else{
								return strEdit;
							}
						}else{
							if(row.noticeState || row.noticeState == 0){
								return strView;
							} else {
								return "";
							}
						}
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
function passMessage(data){
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}
/*************************      编辑保存提交后刷新列表               ********************/
function refreshFather(){
	$('#tableList').bootstrapTable('refresh');
}

// 异议拦截校验
function checkObjection(bidSectionId) {
	var flag = true;
	$.ajax({
		type: "post",
		url: config.tenderHost + '/ObjectionAnswersController/getObjectionAnswersBybidSectionId',
		async: false,
		data: {
			'bidSectionId': bidSectionId,
		},
		success: function (res) {
			if (res.success == false) {
				parent.layer.alert(res.message);
			} else {
				if (res.data) {
					parent.layer.alert('温馨提示：该项目存在未处理完毕的异议，请尽快处理。');
				}
				flag = res.data;
			}
		}
	});
	return flag;
}