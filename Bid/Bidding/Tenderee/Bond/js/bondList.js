/**
*  zhouyan 
*  2019-4-23
*  提交保证金凭证列表
*  方法列表及功能描述
*/

var pageUrl = config.tenderHost + '/DepositController/tenderPageList.do';  //列表接口

var backUrl = config.tenderHost + "/DepositController/resetBidderDeposit.do";	//撤回  


var editHtml = 'Bidding/Tenderee/Bond/model/bondEdit.html';//编辑
var bidHtml = 'Bidding/Tenderee/Bond/model/bidList.html';//选择标段列表
var viewHtml = 'Bidding/Tenderee/Bond/model/bondView.html';//查看
//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	/*状态查询*/
	$('[name=noticeState]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable();
	});
	
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openView(rowData);
	});
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//新增
	$('#btnAdd').click(function(){
		chooseBid()
	});
	//撤回
	$("#tableList").on("click", ".btnBack", function(){
//		var rowData=$('#tenderNoticeList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		layer.confirm('确定撤回?', {icon: 3, title:'询问'}, function(ind){
			layer.close(ind);
			recall(index)
		});
	});
	
});
//查看
function openView(data){
//	console.log(data)
//	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看保证金凭证',
		area: ['80%', '80%'],
		content: viewHtml+'?id=' + data.bidSectionId + '&examType=' + data.examType,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data,refreshFather); 
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
			'id': rowData.depositId,
			'bidSectionId':rowData.bidSectionId
		},
		success: function(data){
			if(data.success){
				layer.alert('撤回成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			}else{
				layer.alert(data.message,{icon:7,title:'提示'})
			}
		}
	});
};
/*编辑
 * isNew: true 新增
 */
function openEdit(data,isNew){
//	console.log(data)
	var jumpHtml = editHtml + '?id=' + data.bidSectionId + '&examType=' + data.examType;
	var title = '';
	if(isNew){
//		jumpHtml = editHtml + '?id=' + data.bidSectionId + '&examType=' + data.examType;
		title = '新增保证金凭证';
	}else{
//		jumpHtml = editHtml + '?id=' + data.depositId + '&bidId=' + data.bidSectionId;
		title = '编辑保证金凭证';
	}
	layer.open({
		type: 2,
		title: '上传保证金凭证',
		area: ['80%', '80%'],
		content: jumpHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data,refreshFather); //传给编辑页面的数据
		}
	});
};
//新增时选择标段
function chooseBid(){
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['80%', '80%'],
		content: bidHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.formFather(newAdd); 
		}
	});
}
function newAdd(data){
	openEdit(data,true)
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode':$('#interiorBidSectionCode').val(),
		'bidSectionName':$('#bidSectionName').val(),
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
		height:tableHeight,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					width: '50',
					align: 'center',
					formatter: function (value, row, index) {
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},
				/*{
					field: 'interiorTenderProjectCode',
					title: '招标项目编号',
					align: 'left',
//					width: '200',
				},*/{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					width: '150px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value,row,index){
						return getTenderType(value);
					}
				},/*{
					field: 'bidOpeningEndTime',
					title: '截标时间',
					align: 'center',
					width: '200px',
				},*/{
					field: 'payState',
					title: '缴纳状态',
					align: 'center',
					width: '150px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value,row,index){
						var str = '';
						if(value == 0){
							str = '未递交'
						}else if(value == 1){
							str = '提交审核'
						}else if(value == 2){
							str = '<span style="color:green;">已递交</span>'
						}else if(value == 3){
							str = '<span style="color:red;">驳回</span>'
						}else if(value == 4){
							str = '<span style="color:orange;">已撤回</span>'
						}
						return str;
					}
				},{
					field: '',
					title: '操作',
					align: 'left',
					width: '200px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>';
						var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						if(row.timeState == 0){//未开标
							if(row.payState == 0){
								return strEdit + strView;
							}else if(row.payState == 3){
								return strEdit + strView;
							}else if(row.payState == 4){
								return strEdit + strView;
							}else if(row.payState == 1 || row.payState == 2){
								return strView + strBack;
							}
						}else if(row.timeState == 1){//已开标
							return strView
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
//	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}
function refreshFather(){
	$('#projectList').bootstrapTable('refresh');
}