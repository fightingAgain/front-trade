//页面初始化
var sysdateTime = ''; //系统时间
var initIntervalId = '';//定时器id
$(function(){
	//获取服务器时间
	sysTime();
	listTable();
	$("#btnSearch").click(function(){
		$("#listTable").bootstrapTable('destroy');
		listTable();
	}); //查询检索
	sessionStorage.setItem("Token",$.getToken()); //会话期间保存Token
})
/*clearInterval(initIntervalId);
initIntervalId = window.setInterval(function(){
	show_time();
},1000);*/

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
		url: config.OpenBidHost + '/BidderOpenTenderController/findBidSectionPage.do', //请求路径		
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
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: initQueryParameters,
		striped: true,
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
			title: '开标时间',
			align: 'center',
			cellStyle:{
				css: widthDate
			}
		},/*{
			field: 'surplusTime',
			title: '开标剩余时间',
			align: 'center',
			width: '200',
			formatter:function (value, row, index){
				return '<div openingState="0" bidOpenTime="'+row.bidOpenTime+'">'+get_time(row.bidOpenTime)+'</div>';
			}
		},*/{
			field: 'stageStates',
			title: '开标状态',
			align: 'center',
			cellStyle:{
				css: widthState
			},
			formatter: function(value, row, index){
				var status = "";
				if(!row.stageStates) status = "未开标";
				else if(row.stageStates==1) status = "解密中";
				else if(row.stageStates==2) status = "签名中";
				else if(row.stageStates==3) status = "唱标";
				else if(row.stageStates==4) status = "开标结束";
				else if(row.stageStates==5) status = "开标失败";
				else if(row.stageStates==6) status = "开标结束中";
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
//						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: false,
						content: 'OpenTender/bidder/model/bidRoom.html?id='+row.id,
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
//						btn: ["关闭"],
						maxmin: false,
						resize: false,
						title: false,
						content: 'OpenTender/bidder/model/bidRoomView.html?id=' + row.id,
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
				var btnEnter = '<button  type="button" class="btn btn-primary btn-sm btn_entry"><span class="glyphicon glyphicon-edit"></span>进入开标室</button>'
				var btnView = '<button  type="button" class="btn btn-primary btn-sm btn_view"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				if(row.bidStates == 1){
					if(typeof(row.stageStates)=="undefined" || parseInt(row.stageStates)<=3 ||parseInt(row.stageStates)==6){
						//如果标段进入签名环节，但是解密失败，则进入查看页面
						if(row.stageStates ==2 && row.decryptStates == 0){
							return btnView
//							handler = "<a class='btn btn-primary btn-sm' href='OpenTender/bidder/model/bidRoomView.html?bid="+row.id+"' target='开标大厅'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
						}else{
							return btnEnter
//							handler = "<a class='btn btn-primary btn-sm' href='OpenTender/bidder/model/bidRoom.html?bid="+row.id+"' target='开标大厅'><span class=\"glyphicon glyphicon-edit\"></span>进入开标室</a>";
						}
					}else{
						return btnView
//						handler = "<a class='btn btn-primary btn-sm' href='OpenTender/bidder/model/bidRoomView.html?bid="+row.id+"' target='开标大厅'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
					}
				}else{
					return btnView
//					handler = "<a class='btn btn-primary btn-sm' href='OpenTender/bidder/model/bidRoomView.html?bid="+row.id+"' target='开标大厅'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
				}
//				return handler;
			}
		}]
	});
};


//分页列表展示
function refreshTable(){
	$('#listTable').bootstrapTable(('refresh'));
}

/*
 * 倒计时
 */
function show_time(){
	$("#listTable [openingState]").each(function(){
		get_time($(this).attr("bidOpenTime"), $(this));
	});
	
	sysdateTime = sysdateTime + 1000;
}

/*
 * 倒计时
 * bidOpenTime:开标时间
 * obj:dom对象
 */
function get_time(bidOpenTime,obj){
	    var time_end =  new Date(bidOpenTime).getTime(); //设定目标时间
	    // 计算时间差 
	    var time_distance = time_end - sysdateTime; 
		if(time_distance > 0 ){
			// 天
		    var int_day = Math.floor(time_distance/86400000)
		    time_distance -= int_day * 86400000; 
		    // 时
		    var int_hour = Math.floor(time_distance/3600000) 
		    time_distance -= int_hour * 3600000; 
		    // 分
		    var int_minute = Math.floor(time_distance/60000) 
		    time_distance -= int_minute * 60000; 
		    // 秒 
		    var int_second = Math.floor(time_distance/1000) 
		    
		    // 设置定时器
		    var html = "";
		    if(int_day>0){
		    	html = int_day+'天';
		    }
		    if(int_hour>0){
		    	html += int_hour+'小时';
		    }
		    if(int_minute>0){
		    	html += int_minute+'分';
		    }
		    if(int_second>0){
		    	html += int_second+'秒';
		    }
		    html += '后开标';
		    if(obj){
		    	obj.html(html);
		    }
			return html;
		}else{
			return "0秒";
		}
}

	//请求服务器时间
	function sysTime() {
		$.ajax({
			type: "get",
			url: config.Syshost + "/EmployeeController/logSysTime.do",
			async: false,
			success: function(data) {
				if(data.success) sysdateTime = NewDate(data.data);
			}
		});
	}
	
	//字符串时间转时间
	function NewDate(str) {
		if(!str) return 0;
		arr = str.split(" ");
		d = arr[0].split("-");
		t = arr[1].split(":");
		var date = new Date();
		date.setUTCFullYear(d[0], d[1] - 1, d[2]);
		date.setUTCHours(t[0] - 8, t[1], t[2], 0);
		return date.getTime();
	}
	/*function refreshFather(){
		
	}*/
