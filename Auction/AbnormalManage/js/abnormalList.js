var listUrl = config.AuctionHost + '/BidExceptionController/findBidExceptionPage.do';  //列表接口
var delUrl = config.AuctionHost + '/BidExceptionController/delete.do';  //删除接口
var revokeUrl = config.AuctionHost + '/BidExceptionController/revoke.do';  //撤回接口
var sendUrl = config.AuctionHost + '/BidExceptionController/publishNotice.do';//发送
var editPage = "bidPrice/AbnormalManage/model/abnormalEdit.html";  //编辑页面
var viewPage = "bidPrice/AbnormalManage/model/abnormalView.html";  //查看页面
var tenderType, enterpriseType;
$(function(){
	if(PAGEURL.split("?")[1] != undefined) {
		tenderType = PAGEURL.split("?")[1].split("=")[1].split("&")[0]; 
	}
	if(PAGEURL.split("&")[1] != undefined) {
		enterpriseType = PAGEURL.split("&")[1].split("=")[1]; 
	}
	console.log(tenderType)
	console.log(enterpriseType)
	//加载列表
	initTable();
	
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initTable();
	});
	
	//添加
	$("#btnAdd").click(function(){
		openEdit("", 1);
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//编辑
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index, 2);
	});
	//删除招标项目
	$("#tableList").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#tableList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定删除该项目异常?', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: delUrl,
		         type: "post",
		         data: {'packageId':rowData.packageId},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		            parent.layer.alert("删除成功");
					$("#tableList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	});
	//撤回招标项目
	$("#tableList").on("click", ".btnCancel", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#tableList').bootstrapTable('getData')[index];
		parent.layer.confirm('确定撤回该项目?', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: revokeUrl,
		         type: "post",
		         data: {'packageId':rowData.packageId},
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}
		            parent.layer.alert("撤回成功");
					$("#tableList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	});
	//发布
	$("#tableList").on("click", ".btnSend", function(){
		var rowData = $('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		layer.confirm('确定发布?', { icon: 3, title: '询问' }, function (ind) {
			sendNotice(rowData[index].id)
			layer.close(ind);
		});
	})
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index, source){
	var url = "";
	if(index === ""){ 
		url = editPage+"?source=" + source;
	} else {
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		url = editPage+"?id="+rowData.id+"&source=" + source + "&packageId="+rowData.packageId;
	}
	url = url + '&tenderType='+tenderType+'&enterpriseType='+enterpriseType
	layer.open({
		type: 2,
		title: "添加项目异常",
		area: ['100%', '100%'],
		content: url,
		success:function(layero, idx){  
			// if(index !== ""){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				// iframeWin.passMessage(index, rowData);  //调用子窗口方法，传参
			// }
		}
	});
}
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: "查看项目异常",
		area: ['100%', '100%'],
		content: viewPage + "?source=0"+ "&packageId="+rowData.packageId + '&tenderType='+tenderType,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			// iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}



// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'packageNum': $("#packageNum").val(), // 项目编号
		'packageName': $("#packageName").val(), // 项目名称	
		'enterpriseType': enterpriseType,
		'tenderType': tenderType
	};
	return projectData;
};
//表格初始化
function initTable() {
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
		height:tableHeight,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width:'50',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
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
					},
					formatter:function(value, row, index){
						if(value){
							if(row.projectSource == 1){
								return value + '<span style="color:#BB2413;">(重新'+(tenderType==1?'竞价':(tenderType==2?'竞卖':'采购'))+')</span>'
							}else{
								return value
							}
						}else{
							return ''
						}
					}
				},{
					field: 'exceptionStartTime',
					title: '公示开始时间',
					align: 'center',
					width: 150,
				},
				{
					field: 'publicityState',
					title: '状态',
					align: 'left',
					cellStyle: {
						css: widthState
					},
					formatter:function(value, row, index){
						//0为临时保存，1为提交审核(审核中)，2为审核通过，3为审核未通过，4撤回
						if(value === 0){
							return '保存'
						}else if(value == 1){
							return '审核中'
						}else if(value == 2){
							return '审核通过'
						}else if(value == 3){
							return '审核未通过'
						}else if(value == 4){
							return '撤回'
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle: {
						css:{'white-space':'nowrap'}
					},
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strEdit =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="'+index+'"><span class="glyphicon glyphicon-share-alt"></span>撤回</button>'
						//发布
						var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="' + index + '"><span class="glyphicon glyphicon-send"></span>发布</button>';
						if(row.createType === 0){//权限  0 本人创建  1非本人创建
							if(row.publicityState == 0){
								str += strSee + strEdit + strDel;
							} else if(row.publicityState == 1){
								str += strSee;	
							} else if(row.publicityState == 2){
								str += strSee;
								/* if(!row.publishState && row.foreign && row.foreign == 1){
									str += strSend;
								} */
							} else if(row.publicityState == 3){
								str += strSee + strEdit + strDel;
							} else if(row.publicityState == 4){
								str += strSee + strEdit + strDel;
							}
							if(row.isRevoke && row.isRevoke == 1){
								str += strCancel
							}
							return str;
						}else{
							return strSee;
						}
						

					}
				}
			]
		]
	});
};
//发布
function sendNotice(id) {
	$.ajax({
		type: "post",
		url: sendUrl,
		async: true,
		data: {
			id: id
		},
		success: function (data) {
			if (data.success) {
				$('#tableList').bootstrapTable('refresh');
				layer.alert('发布成功!')
			} else {
				layer.alert(data.message)
			}
		}

	});
}
/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
	$("#tableList").bootstrapTable("refresh");
}
