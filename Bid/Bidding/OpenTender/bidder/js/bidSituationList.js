//页面初始化
var sysdateTime = ''; //系统时间
var initIntervalId = '';//定时器id
$(document).ready(function(){ 
	//获取服务器时间
	sysTime();
	listTable();
	$("#btnSearch").click(function(){
		//$("#listTable").bootstrapTable('refresh'); 
		$("#tableList").bootstrapTable('destroy');
		listTable();
	}); //查询检索
	sessionStorage.setItem("Token",$.getToken()); //会话期间保存Token
});

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
		url: config.openingHost + '/BidderOpenTenderController/findBidSectionPage', //请求路径		
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
			cellStyle: {
				css: widthCode
			}
		},{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
			cellStyle: {
				css: widthName
			}
		},{
			field: 'bidOpenTime',
			title: '开标时间',
			align: 'center',
			cellStyle: {
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
			title: '状态',
			align: 'center',
			cellStyle: {
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
			field: '',
			title: '操作',
			align: 'left',
			width: '100',
			cellStyle: {
				css:{'white-space':'nowrap'}
			},
			formatter: function(value, row, index){
				if(typeof(row.stageStates)=="undefined" || parseInt(row.stageStates)<=3){
					var handler = "<a class='btn btn-primary btn-sm' href='Bidding/OpenTender/bidder/model/bidRoom.html?bid="+row.id+"' target='开标大厅'><span class=\"glyphicon glyphicon-edit\"></span>进入开标室</a>";
				}else{
					var handler = "<a class='btn btn-primary btn-sm' href='Bidding/OpenTender/bidder/model/bidRoomView.html?bid="+row.id+"' target='开标大厅'><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
				}
				return handler;
			}
		}]
	});
};

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