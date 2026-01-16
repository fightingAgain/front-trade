/**

*  公告列表
*  方法列表及功能描述
*/
var editHtml = "Bidding/Invitation/model/invitationEdit.html"; // 编辑
var viewUrl = "Bidding/Invitation/model/invitationView.html"; // 查看
var tenderHtml = "Bidding/Invitation/model/tenderEdit.html"; // 编辑投标人
var changeHtml = "Bidding/Invitation/model/invitationChange.html"; // 变更

var delUrl = config.tenderHost + "/BidInviteController/deleteInviteByBidId.do";	//删除
var canceUrl = config.tenderHost + "/BidInviteController/cancel.do";	//取消变更
var backUrl = config.tenderHost + "/BidInviteController/revokeWorkflowItem.do";	//撤回
var pageUrl = config.tenderHost  + "/BidInviteController/findPageList.do"; 	//分页
var bidHtml = "Bidding/Invitation/model/bidSelect.html";	//标段列表

var bidUrl = config.tenderHost + "/NoticeController/findAllById.do";		//标段详情地址
var copyUrl = config.tenderHost + "/BidInviteController/copy.do";	//变更
var sendUrl = config.tenderHost + '/BidInviteController/publishNotice.do';//发布地址
//入口函数 
$(function(){
	
	//加载列表
	initJudgeTable();
	
	$('#query').queryCriteria({
		isExport: 0, //0是不需要导出，1是需要导出
		isQuery: 1, //0是不查询，1是查询
		isAdd: 0, //0是不新增，1是新增
		QueryName: 'btnSearch',
		queryList: [{
				name: '标段编号',
				value: 'interiorBidSectionCode',
				type: 'input',
			},
			{
				name: '标段名称',
				value: 'bidSectionName',
				type: 'input',
			},
			{
				name: '状态',
				value: 'bidInviteState',
				type: 'select',
				option: [{
					name: '全部',
					value: '',
				}, {
					name: '未编辑',
					value: '-1',
				}, {
					name: '未提交',
					value: '0',
				}, {
					name: '审核中',
					value: '1',
				}, {
					name: '审核通过',
					value: '2',
				}, {
					name: '审核未通过',
					value: '3',
				}, {
					name: '变更中',
					value: '4',
				}, ]
			}
		]
	});
	
	
	
	//新增
	$('#btnAdd').click(function(){
		openBidTable()
	});
	//编辑
	$("#tableList").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];//bootstrap获取当前页的数据
		openEdit(rowData);
	});
	//编辑供应商
	
	$("#tableList").on("click", ".btnEditTender", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];//bootstrap获取当前页的数据
		openEdit(rowData,true);
	});
	//变更
	$("#tableList").on("click", ".btnChange", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		if(rowData.timeState == 0){//邀请函是否结束 当前时间小于邀请函截止时间 为1  大于邀请函截止时间为0
			layer.alert('该邀请函截止时间已过，不能变更！',{icon:7,title:'提示'})
		}else{
			layer.confirm('确定变更?', {icon: 3, title:'询问'}, function(ind){
				$.ajax({
					type:"post",
					url: copyUrl,
					async:false,
		            dataType: "json",//预期服务器返回的数据类型
		            data: {
		            	'bidSectionId':rowData.id,
		            	'bidSectionName':rowData.bidSectionName,
		            },
		            beforeSend: function(xhr){
						var token = $.getToken();
				        xhr.setRequestHeader("Token",token);
				    },
		            success: function(data){
		            	if (data.success) {
							rowData.bidInviteId = data.data;
							layer.close(ind);
							rowData.bidInviteIssueNature = 2;
		            		openEdit(rowData);
		                    $('#tableList').bootstrapTable('refresh');
		                }else{
		                	layer.alert(data.message,{icon:7,title:'提示'});
		                }
		            },
		            error: function() {
		            	layer.alert("提交失败！");
		            }
					
				});
				
			});
		};
	});
	//取消变更
	$("#tableList").on("click", ".btnCancel", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		layer.confirm('确定取消变更?', {icon: 3, title:'询问'}, function(ind){
			$.ajax({
				type:"post",
				url: canceUrl,
				async:false,
	            dataType: "json",//预期服务器返回的数据类型
	            data: {bidSectionId:rowData.id},
	            beforeSend: function(xhr){
					var token = $.getToken();
			        xhr.setRequestHeader("Token",token);
			    },
	            success: function(data){
	            	if (data.success) {
	            		layer.alert('取消变更成功！',{icon:6,title:'提示'})
	                    $('#tableList').bootstrapTable('refresh');
	                }else{
	                	layer.alert(data.message,{icon:5,title:'提示'})
	                }
	            },
	            error: function() {
	            	layer.alert("提交失败！");
	            }
				
			});
			
		});
		
	});
	
	
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//删除
	$("#tableList").on("click", ".btnDel", function(){
		var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		var msg = '删除成功！';
		layer.confirm('确定删除?', {icon: 3, title:'询问'}, function(ind){
			layer.close(ind);
			requst(delUrl,rowData[index].id,msg);
		});
	});
	//撤回
	$("#tableList").on("click", ".btnBack", function(){
		var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		var msg = '撤回成功！';
		layer.confirm('确定撤回?', {icon: 3, title:'询问'}, function(ind){
			layer.close(ind);
			requst(backUrl,rowData[index].id,msg)
		});
	});
	/*查询*/
	$('#btnSearch').click(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable()
	});
	/*公告性质查询*/
	$('[name=bidInviteState]').change(function(){
		$("#tableList").bootstrapTable('destroy');
		initJudgeTable()
	});
	//发布
	$('#tableList').on('click','.btnSend',function(){
		var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
		var index = $(this).attr("data-index");
		sendNotice(rowData[index].bidInviteId)
	})
});
//打开标段列表
function openBidTable(){
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
			iframeWin.getFromBid(newlyAdd);  
		}
	});
};
function newlyAdd(data){
	openEdit(data);
}
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 * tender:是否是编辑供应商
 */
function openEdit(data,tender){
	var isTender;
	var url = '';
	var title = '';
	if(tender){
		url = tenderHtml+'?id='+data.id + "&bidInviteId=" + data.bidInviteId + "&bidInviteHistoryId=" + data.bidInviteHistoryId + '&isTender=' + isTender + '&examType=' + data.examType + '&htmlTypes=view';
		title = "修改投标人";
	}else{
		if(data.bidInviteId){
			if(data.bidInviteIssueNature == 2){
				url = changeHtml+'?id='+data.id + "&bidInviteId=" + data.bidInviteId + "&bidInviteHistoryId=" + data.bidInviteHistoryId + '&isTender=' + isTender + "&bidInviteIssueNature="+data.bidInviteIssueNature + "&examType=" + data.examType;
				title = "变更邀请函";
			} else {
				url = editHtml+'?id='+data.id + "&bidInviteId=" + data.bidInviteId + "&bidInviteHistoryId=" + data.bidInviteHistoryId + '&isTender=' + isTender + '&examType=' + data.examType;
				title = "修改邀请函";
			}
		}else{
			url = editHtml+'?id='+data.id + '&isTender=' + isTender + '&examType=' + data.examType,
			title = "添加邀请函"
		}
	}
	
	
	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		content: url,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(data,refreshFather);  
		}
	});
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	
	var rowData=$('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	
	layer.open({
		type: 2,
		title: "查看邀请函",
		area: ['100%', '100%'],
		content: viewUrl + '?id='+rowData.id + "&bidInviteId=" + rowData.bidInviteId + "&bidInviteHistoryId=" + rowData.bidInviteHistoryId + "&isThrough=" + (rowData.bidInviteState == 2 ? 1 : 0)+ '&htmlTypes=view',
		resize: false,
		success: function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(rowData,refreshFather); 
		}
	});
}
function requst(address,info,msg){
	$.ajax({
		type:"post",
		url:address,
		data: {
			'bidSectionId': info
		},
		async:true,
		dataType: 'json',
		success: function(data){
			if(data.success){
				layer.alert(msg,{title:'提示'},function(index){
					layer.close(index);
					$('#tableList').bootstrapTable('refresh'); 
				})
			}else{
				layer.alert(data.message,{title:'提示'})
			}
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'interiorBidSectionCode':$('#interiorBidSectionCode').val(),
		'bidSectionName':$('#bidSectionName').val(),
		'bidInviteState':$('#bidInviteState').val(),
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
		onCheck: function (row) {
			id = row.id;
		},
		fixedColumns: true,
		fixedNumber: 2,
		height: top.tableHeight,
		toolbar:"#toolbar",
		columns: [
			[{
					field: 'xh',
					title: '序号',
					cellStyle: {
						css: widthXh
					},
					align: 'center',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},
				{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},
				/*{
					field: 'tenderMode',
					title: '招标方式',
					align: 'center',
					width: '100',
					formatter: function (value, row, index) {
						if (row.tenderMode == '1') {
							return "公开招标";
						} else if (row.tenderMode == '2') {
							return "邀请招标";
						}
					}
				},*/
				/*{
					field: 'changeCount',
					title: '邀请函次数',
					align: 'center',
					width: '150',
					formatter: function (value, row, index) {
						var str;
						if(row.changeCount != undefined){
							str = Number(value)+1;
						}else{
							
							str = 0;
						}
						return str
					}
				},*/
				{
					field: 'bidInviteIssueNature',
					title: '邀请函性质',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {//投标邀请性质   1为正常邀请，2为更正邀请，3为重发邀请，9为其它
						if (value == '1') {
							return "正常邀请";
						} else if (value == '2') {
							return "<span style='color:red;'>变更邀请</span>";
						}
					}
					
				},
				{
					field: 'subDate',
					title: '提交时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					}
				},
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
					field: 'bidInviteState',
					title: '邀请函状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {
						if (value == '-1') {
							return "未编辑";
						} else if (value == '0') {
							return "<span style='color:red;'>未提交</span>";
						} else if (value == '1') {
							return "审核中";
						}else if (value == '2') {
							return "<span style='color:green'>审核通过</span>";
						} else if (value == '3'){
							return "<span style='color:green'>审核未通过</span>";
						} else if (value == '4'){
							return "<span style='color:blue;'>已撤回</span>";
						} else if (value == '5'){
							return "<span style='color:orange'>变更中</span>";
						}
					}
				},{
					field: 'publishState',
					title: '发送状态',
					align: 'center',
					width: '100',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						if (value == '0') {
							return "<span style='color:red'>未发送</span>";
						} else if (value == '1') {
							return "<span style='color:green'>已发送</span>";
						}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '250px',
					cellStyle:{
						css:{"white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strJudge =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strTender =	'<button  type="button" class="btn btn-primary btn-sm btnEditTender" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑投标人</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-danger btn-sm btnCancel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>取消变更</button>';
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						var strChange = '<button  type="button" class="btn btn-primary btn-sm btnChange" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>变更</button>';
						var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="'+index+'"><span class="glyphicon glyphicon-send"></span>发送</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.states != 1){
								if(row.bidInviteState || row.bidInviteState === 0){
									return strSee;
								} else {
									return "";
								}
							}
							if(row.bidInviteState== -1){
								return  strJudge;
							}else if(row.bidInviteState==0){
								return  strSee +strJudge+strDel;
							}else if(row.bidInviteState==1){
								return  strSee+strBack;
							}else if(row.bidInviteState==2){
								if(row.publishState == 0){
									return  strSee+strBack+strSend;
								}else if(row.publishState == 1){
									if(row.timeState == 0){
										return  strSee + strBack;
									}else if(row.timeState == 1){
										return  strSee+strChange+strTender;
									}else if(row.timeState == 2){
										return  strSee;
									}
								}
							}else if(row.bidInviteState==3){
								return  strSee +strJudge + strDel;
							}else if(row.bidInviteState==4){
								return  strSee+strJudge+strDel;
							}else if(row.bidInviteState == 5){
								return  strSee+strJudge+strCancel;
							}
						}else{
							if(row.bidInviteState== -1){
								return '';
							}else{
								return strSee;
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
//	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}
//发布
function sendNotice(bid,state){
	var sendData ={};
	sendData.id = bid;
	if(state){
		sendData.confirm = state;
	}
	$.ajax({
		type:"post",
		url:sendUrl,
		async:true,
		data:sendData,
		success: function(data){
			if(data.success){
				if(data.data == '1'){
					layer.confirm('投标邀请发出时间小于当前时间，若要继续发送，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						layer.close(ind);
					});
				}else if(data.data == '2'){
					$('#tableList').bootstrapTable('refresh');
					layer.alert('发送成功!')
				}else if(data.data == '3'){
					layer.confirm('投标邀请回复截止时间小于当前时间，若要继续发送，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						layer.close(ind);
					});
				}
			}else{
				layer.alert(data.message)
			}
		}
		
	});
}
function refreshFather(){
	$('#tableList').bootstrapTable('refresh');
}