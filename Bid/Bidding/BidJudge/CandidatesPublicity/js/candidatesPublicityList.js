/**
*  zhouyan 
*  2019-4-15
*  评审结果公示
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidSuccessFulPublicityController/findPageList.do';  //列表接口
var recallUrl = config.tenderHost + '/BidSuccessFulPublicityController/resetPublicity.do';  //撤回接口
var delUrl = config.tenderHost + "/BidSuccessFulPublicityController/deletePublicity.do";	//删除
var pauseUrl = config.tenderHost + "/BidSuccessFulPublicityController/pause.do";	//暂停
var playUrl = config.tenderHost + "/BidSuccessFulPublicityController/recovery.do";	//恢复 
var copyUrl = config.tenderHost + "/BidSuccessFulPublicityController/saveCopy.do";	//变更
var cancelUrl = config.tenderHost + "/BidSuccessFulPublicityController/cancelChange.do";	//取消变更
var sendUrl = config.tenderHost + '/BidSuccessFulPublicityController/publish.do';//发布


var editHtml = 'Bidding/BidJudge/CandidatesPublicity/model/candidatesEdit.html';//编辑
var viewHtml = 'Bidding/BidJudge/CandidatesPublicity/model/candidatesView.html';//查看
var bidHtml = 'Bidding/BidJudge/CandidatesPublicity/model/bidList.html';//新增时选择标段页面

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//添加
	$('#btnAdd').click(function(){
		getBId()
	})
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
	//撤回
	$('#tableList').on('click','.btnBack',function(){
		var index = $(this).attr("data-index");
		layer.confirm('确认要撤回？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			recall(index)
		})
	});
	//暂停
	$('#tableList').on('click','.btnPause',function(){
		var index = $(this).attr("data-index");
		layer.confirm('确认要暂停？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			setPause(index)
		})
	});
	//恢复
	$('#tableList').on('click','.btnPlay',function(){
		var index = $(this).attr("data-index");
		layer.confirm('确认要恢复？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			setPlay(index)
		})
	});
	//删除
	$('#tableList').on('click','.btnDel',function(){
		var index = $(this).attr("data-index");
		layer.confirm('确认要删除？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			cutOff(index)
		})
	});
	//变更
	$('#tableList').on('click','.btnChange',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		layer.confirm('确认要变更？',{icon:3,title:'询问'},function(ind){
			if(rowData.changeState && rowData.changeState == 1){
				parent.layer.alert("温馨提示：已确认中标人，无法变更",{icon:7,title:'提示'});
				return;
			}
			$.ajax({
				type:"post",
				url: copyUrl,
				async:false,
	            dataType: "json",//预期服务器返回的数据类型
	            data: {
	            	'bidSectionId':rowData.bidSectionId
	            },
	            beforeSend: function(xhr){
					var token = $.getToken();
			        xhr.setRequestHeader("Token",token);
			    },
	            success: function(data){
	            	if (data.success) {
	            		rowData = $('#tableList').bootstrapTable('getData')[index];
						rowData.id = data.data;
						layer.close(ind);
	            		openEdit(rowData);
	                    parent.$('#tableList').bootstrapTable('refresh');
	                }else{
	                	parent.layer.alert(data.message,{icon:7,title:'提示'});
	                }
	            },
	            error: function() {
	            	parent.layer.alert("变更失败！");
	            }
			});
		})
	});
	//取消变更
	$('#tableList').on('click','.btnCancel',function(){
		var index = $(this).attr("data-index");
		layer.confirm('确认要取消变更？',{icon:3,title:'询问'},function(ask){
			layer.close(ask);
			cancelChange(index)
		})
	});
	//发布
	$('#tableList').on('click','.btnSend',function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		sendNotice(rowData.id)
	});
	
});
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
					layer.confirm('公示开始时间小于当前时间，若要继续发布，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						layer.close(ind);
					});
				}else if(data.data == '2'){
					$('#tableList').bootstrapTable('refresh');
					layer.alert('发布成功!')
				}else if(data.data == '3'){
					layer.confirm('公示结束时间小于当前时间，若要继续发布，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						layer.close(ind);
					});
				}
				if(data.data && data.data.keepOn && data.data.keepOn == '4'){
					layer.confirm('发布后，公示截止日期为“'+(data.data.date.split(' ')[0])+'”，非国家法定工作日，是否继续发布？', {icon: 3, title:'询问', btn:['继续发布','不发布']}, function(ind){
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
//选择标段
function getBId(){
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
			iframeWin.bidFromFathar(formFather);
		}
	});
}
function formFather(data){
	openEdit(data,true)
}
//编辑
function openEdit(data){
	var jumpUrl;
	var title;
	if(data.id){
		jumpUrl = editHtml+'?id='+data.bidSectionId+'&examType='+data.examType;
		title = '编辑中标候选人公示';
	}else{
		jumpUrl = editHtml+'?id='+data.bidSectionId+'&examType='+data.examType;
		title = '新增中标候选人公示';
	}
//	if(data.id){
//		jumpUrl = editHtml+'?bidSectionId='+data.bidSectionId+'&examType='+data.examType+'&id='+data.id+'&bidCheckType='+data.bidCheckType ;
//		title = '编辑中标候选人公示';
//	}else{
//		jumpUrl = editHtml+'?bidSectionId='+data.bidSectionId+'&examType='+data.examType+'&bidCheckType='+data.bidCheckType + '&isPublicProject=' + data.isPublicProject;
//		title = '新增中标候选人公示';
//	}
	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		content: jumpUrl,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.passMessage(data,refreshFather); 
		}
	});
};
//查看
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看候选人公示',
		area: ['100%', '100%'],
		content: viewHtml+'?id='+rowData.bidSectionId+'&examType='+rowData.examType + "&isThrough=" + (rowData.publicityState == 2 ? 1 : 0),
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.passMessage(rowData); 
		}
	});
};
//暂停
function setPause(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:pauseUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType':2
		},
		success: function(data){
			if(data.success){
				layer.alert('暂停成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			}else{
				layer.alert('暂停失败!',{icon:5,title:'提示'});
			}
		}
	});
};
//恢复
function setPlay(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:playUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType':2
		},
		success: function(data){
			if(data.success){
				layer.alert('恢复成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			}else{
				layer.alert('恢复失败!',{icon:5,title:'提示'});
			}
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
			'bidSectionId': rowData.bidSectionId,
			'examType':2
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
			'bidSectionId': rowData.bidSectionId,
			'examType':2
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
//取消变更
function cancelChange(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:cancelUrl,
		async:true,
		data: {
			'bidSectionId': rowData.bidSectionId,
			'examType':2
		},
		success: function(data){
			if(data.success){
				layer.alert('取消成功!',{icon:6,title:'提示'},function(ind){
					$("#tableList").bootstrapTable("refresh");
					layer.close(ind)
				});
			}else{
				layer.alert('取消失败!',{icon:5,title:'提示'});
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
		onCheck: function (row) {
			id = row.id;
		},
		fixedColumns: true,
		height: top.tableHeight,
		fixedNumber: 2,
		toolbar:"#toolbarTop",
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
					field: 'publicityStartTime',
					title: '公示开始时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'publicityEndTime',
					title: '公示截止时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'publicityType',
					title: '公示性质',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 1){//公示类型 1 正常 2 更正 9 其他
							return  '<span>正常公示</span>'
						}else if(value == 2){
							return  '<span>变更公示</span>'
						}
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
					field: 'publicityState',
					title: '审核状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							if(row.publicityType == 1){//公示类型 1 正常 2 更正 9 其他
								return  '<span>未提交</span>'
							}else if(row.publicityType == 2){
								return  '<span>变更中</span>'
							}
						}else if(value == 1){
							return  '<span>待审核</span>'
						}else if(value == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(value == 3){
							return  '<span style="color:red">审核未通过</span>'
						}else if (value == 4){
							return "<span style='color:blue;'>已撤回</span>";
						}else if(value == 5){
							return  '<span style="color:red">暂停</span>'
						} else {
							return  '<span>未编辑</span>'
						}
					}
				},{
					field: 'publishState',
					title: '发布状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(value == 0){
							return  '<span style="color:red">未发布</span>'
						}else if(value == 1){
							return  '<span style="color:green">已发布</span>'
						}else if(value == 2){
							return  '<span style="color:orange">未发布</span>'
						}
					}
				},{
					field: '',
					title: '操作',
					align: 'left',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var topTime = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g,"/")));
						var strEdit = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strBack = '<button  type="button" class="btn btn-primary btn-sm btnBack" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>撤回</button>';
						var strPause = '<button  type="button" class="btn btn-primary btn-sm btnPause" data-index="'+index+'"><span class="glyphicon glyphicon-pause"></span>暂停</button>';
						var strPlay = '<button  type="button" class="btn btn-primary btn-sm btnPlay" data-index="'+index+'"><span class="glyphicon glyphicon-play"></span>恢复</button>';
						var strChange = '<button  type="button" class="btn btn-primary btn-sm btnChange" data-index="'+index+'"><span class="glyphicon glyphicon-repeat"></span>变更</button>';
						var strDel = '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="'+index+'"><span class="glyphicon glyphicon-remove"></span>删除</button>';
						var strCancel = '<button  type="button" class="btn btn-warning btn-sm btnCancel" data-index="'+index+'"><span class="glyphicon glyphicon-remove-circle"></span>取消变更</button>';
						var strSend = '<button  type="button" class="btn btn-success btn-sm btnSend" data-index="'+index+'"><span class="glyphicon glyphicon-send"></span>发布</button>';
						if(row.owner && row.owner == 1){//权限  是否有操作权限1是  0否
							if(row.states != 1){
								if(row.publicityState || row.publicityState === 0){
									return strView;
								} else {
									return "";
								}
							}
							if(row.publicityState == '0'){
								if(row.publicityType == 2){
									return strEdit + strView + strCancel;
								}else{
									return strEdit+strView+strDel;
								}
							}else if(row.publicityState == '1'){
								return strView+strBack;
							}else if(row.publicityState == '2'){
								if(row.isManual == 1){//自动发布
									if(row.publishState == 1){//已发布
										if(topTime > Date.parse(new Date(row.publicityStartTime.replace(/\-/g,"/")))){//发布时间已到
											if(row.timeState == 1){
												return  strView+strChange+ strPause;
											}else{
												return  strView+strChange;
											}
										}else{//发布时间未到
											return  strView+strBack
										}
									}else{//未发布
										return  strView+strBack+strSend;
									}
								}else{//手动发布
									if(row.publishState == 1){//已发布
										if(row.timeState == 1){
											return  strView+strChange+ strPause;
										}else{
											return strView+strChange;
										}
									}else{//未发布
										return  strView+strBack+strSend;
									}
								}
							}else if(row.publicityState == '3'){
								return strEdit+strView+strDel;
							}else if(row.publicityState == '4'){
								return strEdit + strView +strDel;
							}else if(row.publicityState == '5'){
								return strPlay + strView;
							} else {
								return strEdit;
							}
						}else{
							if(row.publicityState || row.publicityState === 0){
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