var Token = "";
//页面初始化
$(document).ready(function(){ 
	//获取toke
	Token = $.getToken();
	listTable();
	$("#btnSearch").click(function(){
		//$("#listTable").bootstrapTable('refresh'); 
		$("#tableList").bootstrapTable('destroy');
		listTable();
	}); //查询检索
	sessionStorage.setItem("Token",Token); //会话期间保存Token
});

//采集分页查询参数
function initQueryParameters(params){
	var parameters = {
		'pageNumber':params.offset / params.limit + 1, //当前页
		'pageSize':params.limit, //每页容量
		'offset':params.offset, //查询偏移量
		'bidSectionCode':$("#bidSectionCode").val(),
		'bidSectionName':$("#bidSectionName").val()
	};
	return parameters;
};
//分页列表展示
function listTable(){
	$("#listTable").bootstrapTable({
		url: config.OpenBidHost + '/BidderFileOpenController/findBidSectionPretrialPage', //请求路径		
		method: 'POST', //向服务器请求方式
		contentType: "application/x-www-form-urlencoded", //如果是post必须定义
		toolbar: '#toolbar', //工具栏ID
		striped: true, //隔行变色
		cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		pagination: true, //是否启用分页
		sortable: false, //是否启用排序
        sortOrder: "asc", //排序方式
        queryParams: initQueryParameters, //请求参数，这个关系到后续用到的异步刷新
        sidePagination: 'server', //服务端分页
		dataType: "json", //数据类型
		showPaginationSwitch: false, //是否显示 数据条数选择框
		pageNumber: 1, //表格初始化时显示的页数
		pageSize: 10, //每页的记录行数（*）
		pageList:[10,15,20,25],
		showColumns: true, //是否显示所有的列
        showRefresh: true, //是否显示刷新按钮
		search: false, // 不显示 搜索框
		classes: 'table table-bordered', // CLASS样式
		silent: true, // 必须设置刷新事件
		toolbarAlign: 'left', //工具栏对齐方式
		queryParamsType: "limit",
		clickToSelect: false, //是否启用点击选中行
		uniqueId: "id", //每一行的唯一标识，一般为主键列
		showToggle: false, //是否显示详细视图和列表视图的切换按钮
        cardView: false, //是否显示详细视图
        detailView: false, //是否显示父子表
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index){
				var pageSize = $("#listTable").bootstrapTable('getOptions').pageSize || 15;		//通过表的#id 可以得到每页多少条  
                var pageNumber = $("#listTable").bootstrapTable('getOptions').pageNumber || 1;	//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index + 1 ;								//返回每条的序号： 每页条数*(当前页-1)+序号 
			}
		},{
			field: 'bidSectionCode',
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
		},{
			field: 'bidOpenTime',
			title: '开启时间',
			align: 'center',
			cellStyle:{
				css: widthDate
			}
		},{
			field: 'stageStates',
			title: '开启状态',
			align: 'center',
			cellStyle:{
				css: widthState
			},
			formatter: function(value, row, index){
				var status = "";
				if(!row.stageStates) status = "未开启";
				else if(row.stageStates==1) status = "解密中";
				else if(row.stageStates==2) status = "签名中";
				else if(row.stageStates==3) status = "唱标";
				else if(row.stageStates==4) status = "开启结束";
				else if(row.stageStates==5) status = "开启失败";
				else if(row.stageStates==6) status = "开启结束中";
				return status;
			}
		},{
			field: 'stageStates',
			title: '状态',
			align: 'center',
			cellStyle:{
				css: widthState
			},
			formatter: function(value, row, index){
				var status = "";
				if(row.signInStates){
					if(row.decryptStates == null){
						status = "未解密";
					}else if(row.decryptStates == 0){
						status = "解密失败";
					}else if(row.decryptStates == 1){
						if(row.signStates == null){
							status = "未签名";
						}else if(row.signStates == 0){
							status = "签名失败";
						}else if(row.signStates == 1){
							status = "签名成功";
						}
					}
				}else{
					status = "未签到";
				}
				
				return status;
			}
		},{
			field: 'bidStates',
			title: '标段状态',
			align: 'center',
			cellStyle:{
				css: widthState
			},
			formatter: function(value, row, index){
				var status = "";
				if(row.bidStates == 1){
					status = "生效";
				}else if(row.bidStates == 4){
					status = "<div style='color: red;'>招标失败</div>";
				}else if(row.bidStates == 5){
					status = "重新招标";
				}else if(row.bidStates == 6){
					status = "<div style='color: red;'>终止</div>";
				}
				return status;
			}
		},{
			field: 'reason',
			title: '失败原因',
			align: 'left',
			cellStyle:{
				css:{'min-width':'200px'}
			},
		},
		{
			field: '',
			title: '操作',
			align: 'left',
			width: '100',
			cellStyle:{
				css:{'white-space':'nowrap'}
			},
			events:{
				'click .btn_entry':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						closeBtn: 0,//不显示关闭按钮
						maxmin: false,
						resize: false,
						title: false,
						content: 'OpenTender/fileOpen/bidder/model/pretrialRoom.html?bid='+row.id,
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;
				//			console.log(iframeWin)
							//调用子窗口方法，传参
							iframeWin.passMessage(row,refreshTable);  
						}
					})
				},
				'click .btn_view':function(e,value, row, index){
					top.layer.open({
						type: 2,
						area: ['100%', '100%'],
						closeBtn: 0,//不显示关闭按钮
						maxmin: false,
						resize: false,
						title: false,
						content: 'OpenTender/fileOpen/bidder/model/pretrialRoomView.html?bid=' + row.id,
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;
				//			console.log(iframeWin)
							//调用子窗口方法，传参
							iframeWin.passMessage(row);  
						}
					})
				}
			},
			formatter: function(value, row, index){
				var handler = "";
				var btnEnter = '<button  type="button" class="btn btn-primary btn-sm btn_entry"><span class="glyphicon glyphicon-edit"></span>进入开启室</button>'
				var btnView = '<button  type="button" class="btn btn-primary btn-sm btn_view"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				if(row.bidStates == 1){
					if(typeof(row.stageStates)=="undefined" || parseInt(row.stageStates)<=3 ||parseInt(row.stageStates)==6){
						//如果标段进入签名环节，但是解密失败，则进入查看页面
						if(row.stageStates ==2 && row.decryptStates == 0){
							return btnView
//							handler = "<a class='btn btn-primary btn-sm' href='OpenTender/fileOpen/bidder/model/pretrialRoomView.html?bid="+row.id+"' target='开启室'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
						}else{
							return btnEnter
//							handler = "<a class='btn btn-primary btn-sm' href='OpenTender/fileOpen/bidder/model/pretrialRoom.html?bid="+row.id+"' target='开启室'><span class=\"glyphicon glyphicon-edit\"></span>进入开启室</a>";
						}
					}else{
						return btnView
//						handler = "<a class='btn btn-primary btn-sm' href='OpenTender/fileOpen/bidder/model/pretrialRoomView.html?bid="+row.id+"' target='开启室'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
					}
				}else{
					return btnView
//					handler = "<a class='btn btn-primary btn-sm' href='OpenTender/fileOpen/bidder/model/pretrialRoomView.html?bid="+row.id+"' target='开启室'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
				}
				return handler;
			}
		}]
	});
};

//分页列表展示
function refreshTable(){
	$('#listTable').bootstrapTable('refresh');
}