	var bidpageUrl = config.OpenBidHost  + "/BidOpeningSituationController/findSignPageList.do"; //标段分页查询接口

	var sysdateTime = ''; //系统时间
	var initIntervalId = '';//定时器id
	$(function(){
		//获取服务器时间
		sysTime();
		//加载列表
		initJudgeTable();
		
		/*查询*/
		$('#btnSearch').click(function(){
			$("#tableList").bootstrapTable('destroy');
			initJudgeTable();
		});
		
		sessionStorage.setItem('token',$.getToken());//数据存入session
		
	});
	
	/*clearInterval(initIntervalId);
	initIntervalId = window.setInterval(function(){
		show_time();
	},1000);*/
	
	/**查询参数*/
	function getQueryParams(params) {
		var projectData = {
			offset: params.offset,
			pageSize: params.limit,
			pageNumber: (params.offset / params.limit) + 1, //页码
			'bidSectionCode':$('#bidSectionCode').val(),
			'bidSectionName':$('#bidSectionName').val(),
		};
		return projectData;
	};

	//表格初始化
	function initJudgeTable() {
		$("#tableList").bootstrapTable({
			url: bidpageUrl,
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
			queryParams: getQueryParams,
			striped: true,
			onCheck: function (row) {
	            checkboxed = row
	        },
			columns: [
				{
					field: 'xh',
					title: '序号',
					width: '50',
					align: 'center',
					formatter: function (value, row, index) {
			            var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
			            var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
			            return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			        }
				},
				{
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
				},
				{
					field: 'bidOpenTime',
					title: '开标时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				/*{
					field: 'surplusTime',
					title: '开标剩余时间',
					align: 'center',
					width: '200',
					formatter:function (value, row, index){
						return '<div openingState="0" bidOpenTime="'+row.bidOpenTime+'">'+get_time(row.bidOpenTime)+'</div>';
					}
				},*/
				{
					field: 'stageState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function (value, row, index) { 
						switch(row.stageState) {
				            case 1:
				                str='<div >解密中</div>'
				                break;
				            case 2:
				                str='<div >签名中</div>'
				                break;
				            case 3:
				                str='<div >唱标</div>'
				                break;
				            case 4:
				                str='<div >开标结束</div>'
				                break;
				            case 5:
				                str='<div >开标失败</div>'
				                break;
				            case 6:
				                str='<div >开标结束中</div>'
				                break;
				            default:
				            	str='<div >未开标</div>'
						}
						
						return str
					}
				},
				{
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
				},
				{
					field: 'reason',
					title: '失败原因',
					align: 'left',
					cellStyle:{
						css:{'min-width':'200px'}
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					events:{
						'click .btn_entry':function(e,value, row, index){
							top.layer.open({
								type: 2,
								area: ['100%', '100%'],
//								btn: ["关闭"],
								maxmin: false,
								resize: false,
								title: false,
								content: 'OpenTender/manager/model/signRoom.html?id='+row.id,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
						//			console.log(iframeWin)
									//调用子窗口方法，传参
									iframeWin.passMessage(row,refreshFather);  
								}
							})
						},
						'click .btn_view':function(e,value, row, index){
							top.layer.open({
								type: 2,
								area: ['100%', '100%'],
								maxmin: false,
								resize: false,
								title: false,
								content: 'OpenTender/manager/model/bidRoomView.html?id=' + row.id,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
						//			console.log(iframeWin)
									//调用子窗口方法，传参
									iframeWin.passMessage(row);  
								}
							})
						}
					},
					formatter: function (value, row, index) {
						var handler = "";
						var btnEnter = '<button  type="button" class="btn btn-primary btn-sm btn_entry"><span class="glyphicon glyphicon-edit"></span>进入开标室</button>'
						var btnView = '<button  type="button" class="btn btn-primary btn-sm btn_view"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
						if(row.bidStates == 1){
							//开标已完成 开标结束中，为查看
							if(typeof(row.stageState)=="undefined" || parseInt(row.stageState)<=3|| parseInt(row.stageState)==6){
								return btnEnter
//								handler = "<a class='btn btn-primary btn-sm btn_entry' href='javascript:void(0);' target='开标大厅'><span class=\"glyphicon glyphicon-edit\"></span>进入开标室</a>";
							}else{
								return btnView;
//								handler = "<a class='btn btn-primary btn-sm btn_view' href='javascript:void(0);' target='开标大厅' ><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
							}
						}else{
							return btnView
//							handler = "<a class='btn btn-primary btn-sm btn_view' href='javascript:void(0);' target='开标大厅' ><span class='glyphicon glyphicon-eye-open'></span>查看</a>";
						}
						
//						return handler;
					}
				}
			]
		});
	};
   
//分页列表展示
function refreshTable(){
	$('#tableList').bootstrapTable(('refresh'));
}

//下载开标记录
$("#tableList").on("click", ".downFile", function(){
	var bidSectionId = $(this).attr("data-id");
	var examType = $(this).attr("data-examType");
	$(this).attr('href',$.parserUrlForToken(fileDownloadUrl+'?bidSectionId='+bidSectionId+'&examType='+examType));
});


/*
 * 倒计时8888
 */
function show_time(){
	if($("#openState").length == 0){
		clearInterval(initIntervalId);
	}
	$("#tableList [openingState]").each(function(){
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
				if(data.success){sysdateTime = NewDate(data.data);} 
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
	function refreshFather(){
		$('#tenderNoticeList').bootstrapTable('refresh');
	}