var listUrl = config.tenderHost + '/BidExcepitonController/findPageBidExcepitonList.do';  //列表接口
var delUrl = config.tenderHost + '/BidExcepitonController/delete.do';  //删除接口
var revokeUrl = config.tenderHost + '/BidExcepitonController/revokeWorkflowItem.do';  //撤回接口
var sendUrl = config.tenderHost + '/BidExcepitonController/publishNotice.do';//发送
var editPage = "Bidding/TenderAbnormal/AbnormalManage/model/abnormalEdit.html";  //编辑页面
var viewPage = "Bidding/TenderAbnormal/AbnormalManage/model/abnormalView.html";  //查看页面

$(function(){
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
		parent.layer.confirm('确定删除该招标异常?', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: delUrl,
		         type: "post",
		         data: {id:rowData.id},
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
		parent.layer.confirm('确定撤回该招标项目?', {icon: 3, title:'提示'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: revokeUrl,
		         type: "post",
		         data: {id:rowData.id},
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
		url = editPage+"?id="+rowData.id+"&source=" + source;
	}
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	layer.open({
		type: 2,
		title: "添加招标异常",
		area: ['100%', '100%'],
		content: url,
		success:function(layero, idx){  
			// if(index !== ""){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(index, rowData);  //调用子窗口方法，传参
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
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	layer.open({
		type: 2,
		title: "查看招标异常",
		area: ['100%', '100%'],
		content: viewPage + "?source=0" + "&id=" + rowData.id + "&isThrough=" + (rowData.publicityState == 2 ? 1 : 0),
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}

/*
 * 打开推送窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
$("#tableList").on("click", ".btnSend", function(){
	var rowData = $('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var index = $(this).attr("data-index");
	layer.confirm('确定发布?', { icon: 3, title: '询问' }, function (ind) {
		sendNotice(rowData[index].id)
		layer.close(ind);
	});
})


// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(), // 项目编号
		'bidSectionName': $("#bidSectionName").val() // 项目名称	
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
				},
				{
					field: 'exceptionStartTime',
					title: '公示开始时间',
					align: 'left',
					cellStyle: {
						css: widthDate
					}
				},
				{
					field: 'publicityState',
					title: '状态',
					align: 'left',
					cellStyle: {
						css: widthState
					},
					formatter:function(value, row, index){
						return options.projState.val[value];
					}
				},
				{
					field: 'publicityState',
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
//						var strApproval = '<button  type="button" class="btn btn-primary btn-sm btnApproval" data-index="'+index+'"><span class="glyphicon glyphicon-ok-circle"></span>审核</button>';
						var strSet = '<button  type="button" class="btn btn-success btn-sm btnSet" data-index="'+index+'"><span class="glyphicon glyphicon-cog"></span>项目成员设置</button>';
						//发布
						var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="' + index + '"><span class="glyphicon glyphicon-send"></span>发布</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
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
							if(row.isManager == 1){
								return str + strSet;
							}else{
								return str;
							}
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
