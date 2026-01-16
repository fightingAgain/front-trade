	/**

*  开标情况列表（投标人）
*  方法列表及功能描述
*/
var roomHtml = "Bidding/BidOpen/Bidder/BidSituation/model/bidRoom.html"; // 开标室页面
var pageUrl = config.tenderHost  + "/BidOpeningConfigurationController/pageList.do"; 	//分页
var signHtml = "Bidding/BidOpen/Bidder/BidSituation/model/signIn.html"; // 签到页面
var checkSignUrl = config.tenderHost  + "/BidOpeningSignInController/findSignInType.do";//查看是否签到
//var viewHtml = "Bidding/BidOpen/Bidder/BidSituation/model/bidSituationView.html"; //  查看页面
var sign=false;//是否签到
var bidIds = [];//后台返回的未签到的标段Id
var checkedData;//选中的标段数据

//入口函数 
$(function(){
	//加载列表
	initJudgeTable();
	//多选进入开标室
	$('#btnAdd').click(function(){
		var rowData = $('#tableList').bootstrapTable('getSelections'); //bootstrap获取选中的数据
		checkedData = rowData;
		checkSign(rowData);
	})
	//进入开标室
	$("#tableList").on('click','.btnEdit',function(){
		var index = $(this).attr("data-index");
		var rowData = $("#tableList").bootstrapTable('getData')[index];
		checkedData = [rowData];
		checkSign([rowData]);
	})
	//查看
	/*$("#tableList").on('click','.btnView',function(){
		openView();
	})*/
	
	/*查询*/
	$('#btnSearch').click(function(){
		$('#tableList').bootstrapTable(('refresh')); 	
	});
	setInterval(show_time, 1000);
});
//查看是否签到
function checkSign(rowData){
	var bidSectionIds = [];
	if(rowData.length>0){
		for(var i = 0;i<rowData.length;i++){
			if(rowData[i].id){
				bidSectionIds.push(rowData[i].id);
			}
		};
		$.ajax({
			type:"post",
			url:checkSignUrl,
			async:true,
			traditional:true,
			data: {
				bidSectionIds:bidSectionIds
			},
			success: function(data){
				if(data.success){
					bidIds = data.data;//后台返回的未签到的标段Id
					if(bidIds.length>0){
						openSign(bidIds);
					}else{
						openRoom(rowData);
					}
				}else{
					layer.alert(data.message,{icon:5,title:'提示'},function(index){
						layer.close(index)
					})
				}
				
			},
			error: function(data){
				layer.alert(data.message,{icon:5,title:'提示'},function(index){
					layer.close(index)
				})
			}
		});
	}else{
		layer.alert('请选择标段!',{icon:5,title:'提示'},function(index){
			layer.close(index)
		})
	}
	
};
/*打开签到页面
 * */
function openSign(bidIds){
	layer.open({
		type: 2,
		title: '签到',
		area: ['400px', '300px'],
		content: signHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(rowData); 
			iframeWin.fromChild(bidIds,fromSign);
		}
	});
}
function fromSign(index){
	parent.layer.close(index);
	//打开开标室
	openRoom(checkedData)
}
/*
 * 打开开标室窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openRoom(data){
//	var rowData = $('#tableList').bootstrapTable('getSelections'); //bootstrap获取选中的数据
		layer.open({
			type: 2,
			title: '开标室',
			area: ['80%', '85%'],
			content: roomHtml,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
	//			console.log(iframeWin)
				//调用子窗口方法，传参
				iframeWin.bidFromFathar(data); 
	//			  
			},
			cancel: function(){
					$('#tableList').bootstrapTable(('refresh')); 	
				}
		});
	
}

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(){
	
	var rowData=$('#tableList').bootstrapTable('getData'); //bootstrap获取当前页的数据
	
	layer.open({
		type: 2,
		title: "开标室",
		area: ['100%', '100%'],
		content: viewHtml,
		resize: false,
		success: function(layero, index){
			
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
		'openingState':$('#openingState').val(),
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
		clickToSelect: false, //是否启用点击选中行
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
				checkbox:true,
			},
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
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'center',
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
				},{
					field: 'signDate',
					title: '签到时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},{
					field: '',
					title: '签到情况',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function (value, row, index) {
						var str="";
						if(row.signDate){
							str = '已签到';
						}else{
							str = '未签到';
						}
						return str
						
					}
				},
				{
					field: 'bidOpenTime',
					title: '开标时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'openingState',
					title: '开标情况',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
					formatter: function (value, row, index) {
						var str='';
						if(row.openingState == '0'){
							 str='<div openingState="0" bidOpenTime="'+row.bidOpenTime+'">'+get_time(row.bidOpenTime)+'</div>'
						}else if(row.openingState == '1'){
							 str='<div >开标中</div>'
						}else if(row.openingState == '2'){
							 str='<div>暂停开标</div>'
						}else if(row.openingState == '3'){
							 str='<div>结束开标</div>'
						}
						return str
						
					}
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					formatter: function (value, row, index) {
						var str = "";
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						var strJudge =	'<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>进入开标室</button>';
						if(row.openingState==0){
							return  strJudge
						}else if(row.openingState==1){
							return  strJudge
						}else if(row.openingState==2){
							return  strJudge
						}else if(row.openingState==3){
							return  strJudge
						}
					}
				}
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
/*
 * 倒计时
 */
function show_time(){
	$("#tableList [openingState]").each(function(){
		get_time($(this).attr("bidOpenTime"), $(this));
	});
}
/*
 * 倒计时
 * bidOpenTime:开标时间
 * obj:dom对象
 */
function get_time(bidOpenTime,obj){
	    var sysTime = $('.systemTime').html() +' '+ $('.sysTime').html(); //设定当前时间
	    var time_start = new Date(sysTime).getTime();
	    var time_end =  new Date(bidOpenTime).getTime(); //设定目标时间
	
	    // 计算时间差 
	    var time_distance = time_end - time_start; 
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
			if(obj){
		    	obj.removeAttr("openingState");
				obj.html("开标中");
		   }
			return "开标中";
		}
}
