var checkboxed = "";
var projectend = "";
var iframeWind="";
//初始化
$(function() {
	initTable();
});
/// 表格初始化
var purchaseaddurl = 'Auction/Auction/Purchase/AuctionChange/model/addAuctionProject.html' //添加路径
var auditPurchase = 'Auction/Auction/Purchase/AuctionChange/model/auditPurchase.html' //审核路径
var editPurchase = 'Auction/Auction/Purchase/AuctionChange/model/editAuctionProject.html' //编辑路径
var pageAuctionPurchase = config.AuctionHost + '/ProjectSupplementController/findProjectSupplementPageList';
// var deletProjectUrl = config.AuctionHost + '/AuctionPurchaseController/deleteAuctiondo'
// var recallUrl = config.AuctionHost +"/WorkflowController/updateAuctionXmggState.do"// 撤回项目的接口
// var noticeStateUrl=config.AuctionHost +"/AuctionPurchaseController/updateNoticeState.do"//公告发布
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: pageAuctionPurchase, // 请求url		
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
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		sortStable: true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
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
			formatter: function(value, row, index) {
				if(row.projectSource == 1) {
					var count = row.projectSourceCount;
					if(count){
						var projectName = ' <div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger">(第'+count+'次 重新竞价)</span></div>';
					}else{
						var projectName = ' <div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '<span class="text-danger">(重新竞价)</span></div>';
					}
				} else {
					var projectName = ' <div style="text-overflow: ellipsis;white-space:nowrap;overflow:hidden;">' + row.projectName + '</div>';
				}
				return projectName;
			}
		}, {
			field: 'title',
			title: '变更公告标题',
		},
		{
			field: 'checkState',
			title: '审核状态',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				var State = ""
				if(row.checkState == 0) {
					State = "未审核";
					return State
				}
				if(row.checkState == 1) {
					State = "审核中";
					return State
				}
				if(row.checkState == 2) {
					State = "<div class='text-success' style='font-weight:bold'>审核通过</div>";

					return State;
				} else if(row.checkState == 3) {
					State = "<div class='text-danger' style='font-weight:bold'>审核未通过</div>";
					return State
				};
			}
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100',
			formatter: function(value, row, index) {
				var State = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn btn-sm btn-primary" style="padding: 3px 5px;"  onclick=edit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑' +
					'</button>'
				var audit = '<button href="javascript:void(0)" id="btn_delete" type="button" class="btn btn-sm btn-primary" style="padding: 3px 5px;"  onclick=audit_btn(\"' + index + '\")>' +
					'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看' +
					'</button>'

				if(row.checkState==1 || row.checkState==2){
					return audit	
				}else{
					return State
				}

			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // 每页的第一个行的序号，第一页是0，第二页收10...		
		'enterpriseType': '04', //当前登陆人为采购人
		'supplementType':3,
		'tenderType': 1, //采购方式0为询价采购、1为竞低价2、竞卖
		'projectName': $('#projectName').val(), // 项目名称	
		'projectCode': $('#projectCode').val(), // 项目名称	
	}
};
// 搜索按钮触发事件
$("#eventquery").click(function() {
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

function deletes_btn($index) {
	var rowData = $('#table').bootstrapTable('getData')[$index]; //bootstrap获取当前页的数据
	parent.layer.confirm('确定要删除该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		if(top.sysEnterpriseId&&rowData.projectSource==1){
			var arrlist = sysEnterpriseId.split(',');
			if(arrlist.indexOf(top.enterpriseId)!=-1){							
				reDeposit(rowData)
			}
		}
		$.ajax({
			url: deletProjectUrl,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: {
				"projectId": rowData.projectId
			},
			success: function(data) {
				if(data.success){
					parent.layer.alert("删除成功")
					$('#table').bootstrapTable(('refresh'));
					parent.layer.close(index);
					
				}
			},
			error: function(data) {
				parent.layer.alert("删除失败")
			}
		});
		
	}, function(index) {
		parent.layer.close(index)
	});
}
// 撤回功能
function recall_btn(id) {
	parent.layer.confirm('确定要撤回该项目', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			url: recallUrl,
			type: 'post',
			async: false,
			data: {
				"businessId":id,
	   			'accepType':'xmgg'
			},
			success: function(data) {
				if(data.success){
		   			parent.layer.alert("撤回成功!")
		   			$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
		   		}else{
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

};
//发布公告功能
function noticeStateBtn(uid){
	parent.layer.confirm('确定要发布该项目 ', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({
		   	url:noticeStateUrl,
		   	type:'post',
		   	async:false,
		   	data:{
		   		"id":uid,	 
		   		
		   	},
		   	success:function(data){	 
				if(data.success){
					$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
					parent.layer.close(index);
				}  
				
		   	},
		   	error:function(data){
		   		parent.layer.alert("发布失败")
		   	}
		});
	  			 
	}, function(index){
	   parent.layer.close(index)
	});
};
//添加功能
function add_btn() {

	parent.layer.open({
		type: 2,
		title: '公告变更',
		area: ['100%','100%'],
		id:'packageclass',
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: purchaseaddurl,
		//btn: ['提交审核', '保存', '取消'],//确定按钮
		success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow; 
       	},				
	});
};
//编辑功能
function edit_btn($index) { //$index当前选择行的下标，projectState是当前选择行的审核状态0为未审核，1为审核中，2为审核通过。
	var rowData = $('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	parent.layer.open({
		type: 2,
		title: '编辑竞价公告',
		area: ['100%','100%'],
		id:'packageclass',
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: purchaseaddurl+'?id='+rowData[$index].id+'&type=edit&projectId='+rowData[$index].projectId+"&projectSourceCount="+rowData[$index].projectSourceCount+"&checkState="+rowData[$index].checkState,
		//btn: ['提交审核', '保存', '取消'],//确定按钮
		success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow; 
       	},				
	});
}
//查看
function audit_btn($index) { //$index当前选择行的下标
	var rowData = $('#table').bootstrapTable('getData');
	parent.layer.open({
		type: 2,
		title: '查看公告变更',
		area: ['100%','100%'],
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: auditPurchase+'?id='+rowData[$index].id+'&type=view'+"&projectSourceCount="+rowData[$index].projectSourceCount,
		success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow; 
       	},
		// btn: ['关闭'],//确定按钮	
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			parent.layer.close(index);
		}
	});
};

function reDeposit(rowData){
	$.ajax({
		url: config.AuctionHost+'/DepositDivertController/proPurchaseAgainRecall.do',
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"projectId": rowData.projectId,
			'projectForm': 1,			
		},
		success: function(data) {
			
		},
	});
}