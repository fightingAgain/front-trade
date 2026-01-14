/**
*  zhouyan 
*  2019-6-2
*  异议管理列表（投标人）
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/ObjectionAnswersController/ObjectionAnswersList.do';  //列表接口
var recallUrl = config.tenderHost + '/ObjectionAnswersController/revocation.do';  //撤回接口
var delUrl = config.tenderHost + "/ObjectionAnswersController/deleteByHard.do";	//删除

var editHtml = 'Bidding/ObjectionManage/Bidder/model/objectionEdit.html';//编辑
var viewHtml = 'Bidding/ObjectionManage/Bidder/model/objectionView.html';//查看
//var bidHtml = 'Bidding/BidJudge/CandidatesPublicity/model/bidList.html';//新增时选择标段页面

var examType = 2; // 1为资格预审 2为资格后审

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//添加
	$('#btnAdd').click(function(){
		openEdit();
	})
	//编辑
	$('#tableList').on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		
		openEdit(index);
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//撤回
	$('#tableList').on('click','.btnBack',function(){
		var index = $(this).attr("data-index");
		layer.alert('确认要申请撤回？',{icon:3,title:'询问'},function(ask){
			recall(index)
			layer.close(ask);
			/*layer.prompt({
			  	formType: 2,
			  	title: '请输入撤回说明',
			  	resize: false,
			  	area: ['400px', '200px'] //自定义文本域宽高
			}, function(value, ind, elem){
		  		layer.close(ind);
		  		recall(index,value)
			});*/
			
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
function openEdit(index){
	var jumpUrl;
	var title;
	var rowData;
	if(index){
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		jumpUrl = editHtml + '?dataId=' + rowData.id;
		title = '编辑异议';
	}else{
		jumpUrl = editHtml;
		title = '新增异议';
	}
	layer.open({
		type: 2,
		title: title,
		area: ['80%', '80%'],
		content: jumpUrl,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(data); 
		}
	});
};
//查看
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看异议',
		area: ['80%', '80%'],
		content: viewHtml + '?dataId=' + rowData.id + '&state=' + rowData.status + '&examType=' + examType + '&bidSectionId=' + rowData.bidSectionId,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.passMessage(rowData); 
		}
	});
};
//撤回
function recall(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:recallUrl,
		async:true,
		data: {
			'id': rowData.id
//			'instructions': value
		},
		success: function(data){
			if(data.success){
				layer.alert(data.data,{icon:6,title:'提示'},function(ind){
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
				layer.alert('删除失败!',{icon:5,title:'提示'});
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
					cellStyle: {
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},{
					field: 'objectionTitle',
					title: '异议标题',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'objectionType',
					title: '异议类型',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value,row,index){
						var str = '';
						if(value == 1){
							str = '资格预审文件'
						}else if(value == 2){
							str = '资格文件开启'
						}else if(value == 3){
							str = '资格评审'
						}else if(value == 4){
							str = '招标文件'
						}else if(value == 5){
							str = '开标'
						}else if(value == 6){
							str = '评审'
						}else if(value == 7){
							str = '中标候选人公示';
						} else if (value == 9) {
							str = '项目异常公示';
						}
						return str
					}
				},{
					field: 'submitTime',
					title: '提出时间',
					align: 'left',
					cellStyle: {
						css: widthDate
					}
				},
				{
					field: 'status',
					title: '异议状态',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span>未提交</span>'
						}else if(value == 1){
							return  '<span>未签收</span>'
						}else if(value == 2){
							return  '<span style="color:green">已签收</span>'
						}else if(value == 3){
							return  '<span>未受理</span>'
						}else if(value == 4){
							return  '<span style="color:green">已受理</span>'
						}else if(value == 5){
							return  '<span style="color:red">不予受理</span>'
						}else if(value == 6){
							return  '<span>未答复</span>'
						}else if(value == 7){
							return  '<span style="color:green">已答复</span>'
						}else if(value == 8){
							return  '<span style="color:orange">申请撤回</span>'
						}else if(value == 9){
							return  '<span style="color:green">已撤回</span>'
						}
					}
				},{
					field: 'answersDate',
					title: '答复时间',
					align: 'left',
					cellStyle: {
						css: widthDate
					}
				},{
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
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>申请撤回</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						if(row.status == 0){
							return strEdit+strView+strDel
						}else if(row.status == 1){
							return strBack+strView
						}else if(row.status == 2 || row.status == 3 || row.status == 4 || row.status == 5 || row.status == 6 || row.status == 7 || row.status == 8){
							return strView
						}else if(row.status == 9){
							return strEdit+strView
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