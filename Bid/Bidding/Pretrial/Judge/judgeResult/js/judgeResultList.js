/**

*  评审结果公告
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidWinNoticeController/findBidWinNoticeYuShenPageList.do';  //列表接口
var backUrl = config.tenderHost + "/BidWinNoticeController/revocationYUShen.do";	//撤回  
var delUrl = config.tenderHost + "/BidWinNoticeController/deleteByPrimaryKeyYuShen.do";	//删除


var editHtml = 'Bidding/Pretrial/Judge/judgeResult/model/edit.html';//编辑
var viewHtml = 'Bidding/Pretrial/Judge/judgeResult/model/view.html';//查看

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
	/*$("#btnAdd").click(function(){
		getBId()
	});
	*/
	//撤回
	$('#tableList').on('click','.btnBack',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认要撤回？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			recall(index)
		})
	});
	//删除
	$('#tableList').on('click','.btnDel',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认要删除？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			cutOff(index)
		})
	});
});
//编辑
function openEdit(data){
	var dataUrl;
	dataUrl = editHtml+'?id='+data.bidSectionId+'&examType='+data.examType
//	if(data.id){
//		dataUrl = editHtml+'?id='+data.id+'&examType='+data.examType+'&bidId='+data.bidSectionId + "&bidWinNoticeId=" + data.bidWinNoticeId + '&noticeNature=' + data.noticeNature + '&pretrialCheckType='+data.pretrialCheckType; 
//	}else{
//		dataUrl = editHtml+'?examType='+data.examType+'&bidId='+data.bidSectionId + "&bidWinNoticeId=" + data.bidWinNoticeId  + '&pretrialCheckType='+data.pretrialCheckType;
//	}
	layer.open({
		type: 2,
		title: '编辑预审结果公告',
		area: ['100%', '100%'],
		content: dataUrl,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			if(!data.id){
				//调用子窗口方法，传参
				iframeWin.passMessage(data,refreshFather); 
//			}
		}
	});
};
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看预审结果公告',
		area: ['100%', '100%'],
		content: viewHtml+'?id='+rowData.id+'&bidId='+rowData.bidSectionId + "&isThrough=" + (rowData.status == 2 ? 1 : 0)+ '&pretrialCheckType='+rowData.pretrialCheckType+'&source=0',
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData); 
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
			'examType': 1
		},
		success: function(data){
			if(data.success){
				layer.alert('撤回成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			}else{
				layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};
//删除
function cutOff(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:delUrl,
		async:true,
		data: {
			'id': rowData.id
		},
		success: function(data){
			if(data.success){
				layer.alert('删除成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
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
		/*tenderProjectCode: $("#tenderProjectCode").val(), // 项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 项目名称
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态*/	
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
		striped: true,
		height: top.tableHeight,
		toolbar:"#toolbarTop",
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
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
					field: 'createTime',
					title: '创建时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				/*{
					field: 'noticeNature',
					title: '公告性质',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 1){//公告性质  1 正常公告 2 更正公告 3 重发公告 9 其他
							return  '<span>正常公告</span>'
						}else if(value == 2){
							return  '<span>更正公告</span>'
						}
					}
				},*/
				{
					field: 'states', // 0.编辑 1.生效 2.撤回 3.招标完成 4.流标 5.重新招标
					title: '标段状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter:function(value, row, index){
						if(value == 1){
							return "生效";
						} else if(value == 0){
							return "编辑";
						}else if(value == 2){
							return "撤回";
						}else if(value == 3){
							return "<span style='color:green;'>招标完成</span>";
						}else if(value == 4){
							return "<span style='color:red;'>招标失败</span>";
						}else if(value == 5){
							return "<span style='color:blue;'>重新招标</span>";
						}else if(value == 5){
							return "终止";
						}
					}
				},
				{
					field: 'status',
					title: '审核状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span>未提交</span>'
						}else if(value == 1){
							return  '<span>待审核</span>'
						}else if(value == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(value == 3){
							return  '<span style="color:red">审核未通过</span>'
						}else if (value == 4){
							return "<span style='color:blue;'>已撤回</span>";
						} else {
							return  '<span>未编辑</span>'
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
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.states != 1){
								if(row.status || row.status == 0){
									return strView;
								} else {
									return "";
								}
							}
							if(row.status || row.status == 0){
								if(row.status == '0'){
									return strEdit+strView+strDel;
								}else if(row.status == '1'){
									return strView+strBack;
								}else if(row.status == '2'){
									return strView
								}else if(row.status == '3'){
									return strEdit+strView+strDel;
								} else{
									return strEdit+strView+strDel;
								}
							}else{
								return strEdit;
							}
						}else{
							if(row.status || row.status == 0){
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
/********************       刷新列表             *********************/
function refreshFather(){
	$('#tableList').bootstrapTable('refresh');
}