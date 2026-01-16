/**

*  查看标室列表
*  方法列表及功能描述
*/

var tenderUrl = config.tenderHost + '/BiddingRoomAppointmentController/findRoomPageListByDate.do'; //获取所有标段列表

var detailHtml = 'Bidding/BidIssuing/roomOrder/model/orderDetail.html';//预约详情
var orderView = 'Bidding/BidIssuing/roomOrder/model/orderView.html';//预约情况

var checkboxed;
var biders = {};

$(function(){
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	
	
	//查询
	$("#btnSearch").click(function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		if(start == ''){
			parent.layer.alert('请选择开始时间！')
		}else if(end == ''){
			parent.layer.alert('请选择结束时间！')
		}else{
			var  appointmentStartDate = Date.parse(new Date($('#startDate').val().replace(/\-/g,"/"))); 		//会议开始时间
			var  appointmentEndDate = Date.parse(new Date($('#endDate').val().replace(/\-/g,"/")));		//会议结束时间
			if(appointmentEndDate <= appointmentStartDate){
				parent.layer.alert('会议结束时间应在会议开始时间之后！');
				return
			}
			$("#tableList").bootstrapTable('destroy');
			getTendereeList();
		}
		
	});
	//状态查询
	$('#isUse').change(function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		if(start == ''){
			parent.layer.alert('请选择开始时间！')
		}else if(end == ''){
			parent.layer.alert('请选择结束时间！')
		}else{
			$("#tableList").bootstrapTable('destroy');
			getTendereeList();
//			$("#tableList").bootstrapTable("refresh");
		}
	});
	//区域查询
	$('#areaCode').change(function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		if(start == ''){
			parent.layer.alert('请选择开始时间！')
		}else if(end == ''){
			parent.layer.alert('请选择结束时间！')
		}else{
			$("#tableList").bootstrapTable('destroy');
			getTendereeList();
//			$("#tableList").bootstrapTable("refresh");
		}
	});
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	
	//开始时间
 	$('#startDate').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			onpicked:function(){
				$dp.$('endDate').click();
			},
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'endDate\')}'
		})
 	});
 	//结束时间
 	$('#endDate').click(function(){
 		if($('#startDate').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:nowDate
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'startDate\')}'
			})
 		}
 		
 	});
	
	//详情
	$('#tableList').on('click','.btnDetail',function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		var index = $(this).attr('data-index');
		var rowData= $('#tableList').bootstrapTable('getData')[index];
		toDetail(rowData,start,end)
	});
	//预约情况查看
	$('#btnView').click(function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		var timeObj = {};
		timeObj.start = start;
		timeObj.end = end;
		getView(timeObj)
	})
	
});
function getView(data){
	parent.layer.open({
		type: 2,
		title: '预约情况',
		area: ['1000px', '100%'],
		resize: false,
		content: orderView,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getTime(data);
		}
	})
}

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(data,rooms,callback){
	$('#startDate').val(data.startDate);//用于查询的开始时间
	$('#endDate').val(data.endDate);//用于查询的结束时间
	$('#useType').val(data.useType);
	//转换数据格式用于判断是否选中
	if(rooms && rooms.length > 0){
		for(var i =0 ; i< rooms.length; i++){
			biders[rooms[i].id] = rooms[i];
		}
	}
	
	getTendereeList()
	
	//确定
	$("#btnSure").click(function(){
		var start = $('#startDate').val();
		var end = $('#endDate').val();
		var biderData = [];
		for(var i in biders){
			/*if(!biders[i].id){
				biders[i].id = biders[i].id;
			}*/
			
			biderData.push(biders[i]);
		}
		if(biderData.length == 0){
			parent.layer.alert('请选择会议室！')
		}else{
			callback(biderData,start,end);
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index);
		}
		
		/*var rowData =  $("#tableList").bootstrapTable("getSelections");
		if(rowData.length>0){
			if(rowData[0].isUse == 1){
				parent.layer.alert('该标室已被占用，请选择可用的标室！',{icon:7,title:'提示'})
			}else{
				callback(rowData[0].id);
				var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.close(index);
			}
			
		}else{
			parent.layer.alert('请选择标室！')
		}*/
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
}
function getChild(){
	var row = $("#tableList").bootstrapTable("getSelections");
	if(row.length>0){
		var index=parent.layer.getFrameIndex(window.name);
    	parent.layer.close(index);
    	return row
	}else{
		parent.layer.alert("请选择标室！")			
	}
}
function toDetail(data,start,end){
	parent.layer.open({
		type: 2,
		title: '标室使用情况',
		area: ['800px', '650px'],
		resize: false,
		content: detailHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getRoomInfo(data,start,end);
		}
	})
}

function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:tenderUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onLoadError:function(){
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		
        		parent.layer.alert(data.message);
        	}
        },//点击全选框选中时触发的操作
    onCheckAll:function(rows){
     for(var i = 0; i< rows.length; i++){
			biders[rows[i].id] = rows[i];
		  }
    },
		//点击全选框取消时触发的操作
    onUncheckAll:function(rows){
     	for(var i = 0; i< rows.length; i++){
				delete biders[rows[i].id];
		  	}
    },
		//点击每一个单选框时触发的操作
    onCheck:function(row){

				biders[row.id] = row;
			
    },
		//取消每一个单选框时对应的操作；
    onUncheck:function(row){
     delete biders[row.id];   
    },
        columns: [{
        	checkbox:true,
        	formatter: function(value, row, index) {
				if(biders[row.id]) {
					return {
						checked: true, //设置选中
//						disabled: true //设置是否可用
					};
				}
			}
        },
        {
			field: 'biddingRoomName',
			title: '会议室名称',
			align: 'left',
		},{
			field: 'enterpriseName',
			title: '所属单位',
			align: 'left',
		},{
			field: 'areaCode',
			title: '所属地区',
			align: 'left',
			formatter: function(value, row, index){
				return getOptionValue('areaCode',value)
			}
		},{
			field: 'useType',
			title: '会议室类型',
			align: 'left',
			formatter: function(value, row, index){
				var roomType = [];
				var typeArr = [];
				roomType = value.split(',');
				
				for(var j = 0;j<roomType.length;j++){
					if(roomType[j] == 1){
						typeArr.push('开标');
					}else if(roomType[j] == 2){
						typeArr.push('评标');
					}else if(roomType[j] == 9){
						typeArr.push('其他');
					}
				}
				return typeArr.join(',')
			}
		},
		{
			field: 'isUse',
			title: '可用状态 ',
			align: 'center',
			width: '150',
			formatter:function(value, row, index){
            	var str="";
            	if(value==1){
            		str="占用 ";
            	} else if(value==0){
            		str ="可用";
            	}
            	return str;
            }
		},
		{
			field: '',
			title: '操作 ',
			align: 'center',
			width: '150',
			formatter:function(value, row, index){
            	var str='<button type="button" class="btn btn-sm btn-primary btnDetail" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>详情</button>';
            	return str;
            }
		}]
    });
//  $("#tableList").bootstrapTable("load", newList);
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'startDate': $('#startDate').val(),//开始时间
        'endDate': $('#endDate').val(),//结束时间
        'useType': $('#useType').val(),//使用用途
        'biddingRoomName': $('#biddingRoomName').val(),//标室名称
        'isUse': $('#isUse').val(),//可用状态 0占用 1可用
        'areaCode':$("[name=areaCode]").val()
    }
}