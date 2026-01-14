var tableUrl = config.MeetingHost + '/BiddingRoomAppointmentV2Controller/getMeetRelevance.do'; //获取所有标段列表
var saveList = top.config.MeetingHost + '/BiddingRoomAppointmentV2Controller/saveRelevanceRoom.do';//保存
var isSameUrl = top.config.tenderHost + '/TenderProjectController/getBidSectionIdByTenderId.do';//查询标段是否同一个招标项目下
var relateUrl = '';//关联地址
var saveData = {};
var bidSectionId = '';
$(function(){
	
});
function passMassage(data,callback){
	bidSectionId = data.id;
	// console.log(data)
	getTendereeList()
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
	    parent.layer.close(index);
	});
	//查询
	$('#eventquery').click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();
	});
	//确定
	$("#btnSure").click(function(){
		var row = $("#tableList").bootstrapTable("getSelections");
		// var obj = {};
		//标段信息
		
		if(row.length>0){
			saveData.projectId = data.id;//当前标段id
			saveData.bidSectionName = data.bidSectionName;//标段名称
			saveData.bidSectionCode = data.interiorBidSectionCode;//标段编号
			saveData.appointmentTitle = data.tenderProjectName;//招标项目名称
			saveData.examType = data.stage;//当前阶段状态
			saveData.sysCode = zbSysCode;//当前平台编码
			saveData.isSubmit = '1';
			saveData.biddingRooms = row[0].biddingRooms;
			//查询标段是否同一个招标项目下
			$.ajax({
				type: "post",
				url: isSameUrl,
				dataType:'json',
				async: true,
				data: {
					bidSections: [{
						id: data.id
					},{
						id:row[0].projectId
					}]
				},
				success: function(response) {
					if(response.success) {
						if(response.data){
							parent.layer.confirm("温馨提示："+response.data,{title:'询问'},function(ind){
								save(saveData,callback);
								parent.layer.close(ind);
							})
						}else{
							save(saveData,callback);
						}
					} else {
						parent.layer.alert("温馨提示："+response.message)
					}
				}
			});
			// save(saveData)
		}else{
			parent.layer.alert("温馨提示：请选择需要关联的标段")			
		}
	});
}
function save(data,callback){
	$.ajax({
		type: "post",
		url: saveList,
		dataType:'json',
		async: true,
		data: data,
		success: function(response) {
			if(response.success) {
				if(callback){
					callback()
				}
				parent.layer.alert("温馨提示：关联成功!")
				var index=parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
			} else {
				parent.layer.alert("温馨提示："+response.message)
			}
		}
	});
}
function getTendereeList(selectColumn){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:tableUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: false, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
		height: 500,
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        // toolbar: '#toolbar', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
		clickToSelect: true,                //是否启用点击选中行
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
		onLoadSuccess:function(data){
			parent.layer.closeAll("loading");
			if(!data.success){
				parent.layer.alert(data.message);
			}
		},
		onLoadError:function(){
		    parent.layer.closeAll("loading");
		    parent.layer.alert("温馨提示：请求失败");
		},
        columns: [
		{
			radio: true,
		}, 
        {
			field: 'bidSectionCode',
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
		},
		//标段编号、标段名称、会议室名称、会议室类型、会议开始时间、会议结束时间、会议地点
 		{
			field: '',
			title: '会议室名称 ',
			align: 'left',
			cellStyle:{
				css:{'white-space': 'nowrap','padding': '0px !important'}
			},
			formatter:function(value, row, index){
				var list = row.biddingRooms;
				var html="<table class='table table-add' style='border-bottom: none;background:none'>";
				for(var i=0;i<list.length;i++){
					html+='<tr>';
						html+='<td style="'+(i == 0?"":"border-top: 1px solid #ddd;")+'">'+list[i].biddingRoomName +'</td>';
					html+='</tr>';
				};
				html+="</table>";
				return html
			}
		},
		{
			field: '',
			title: '会议室类型',
			align: 'left',
			cellStyle:{
				css:{'white-space': 'nowrap','padding': '0px !important'}
			},
			formatter:function(value, row, index){
				var list = row.biddingRooms;
				var html="<table class='table table-add' style='border-bottom: none;background:none'>";
				for(var i=0;i<list.length;i++){
					var str = []
					var roomType = list[i].appointmentType.split(',');
					for(var j = 0; j < roomType.length; j++) {
						if(roomType[j] == 1) {
							str.push('开标');
						} else if(roomType[j] == 2) {
							str.push('评审')
						} else if(roomType[j] == 9) {
							str.push('其他')
						}
					}
					var aa = str.join('、');
					html+='<tr>';
						 html+='<td style="'+(i == 0?"":"border-top: 1px solid #ddd;")+'">'+str.join('、')+'</td>';
					html+='</tr>';
				};
				html+="</table>";
				return html
			}
		},
		{
			field: '',
			title: '会议开始时间',
			align: 'center',
			cellStyle:{
				css:{'white-space': 'nowrap','padding': '0px !important'}
			},
			formatter:function(value, row, index){
				var list = row.biddingRooms;
				var html="<table class='table table-add' style='border-bottom: none;background:none'>";
				for(var i=0;i<list.length;i++){
					html+='<tr>';
						 html+='<td style="'+(i == 0?"":"border-top: 1px solid #ddd;")+'">'+list[i].appointmentStartDate +'</td>';
					html+='</tr>';
				};
				html+="</table>";
				return html
			}
		},
		{
			field: '',
			title: '会议结束时间',
			align: 'center',
			cellStyle:{
				css:{'white-space': 'nowrap','padding': '0px !important'}
			},
			formatter:function(value, row, index){
				var list = row.biddingRooms;
				var html="<table class='table table-add' style='border-bottom: none;background:none'>";
				for(var i=0;i<list.length;i++){
					html+='<tr>';
						 html+='<td style="'+(i == 0?"":"border-top: 1px solid #ddd;")+'">'+list[i].appointmentEndDate +'</td>';
					html+='</tr>';
				};
				html+="</table>";
				return html
			}
		},
		{
			field: '',
			title: '会议地点',
			align: 'left',
			cellStyle:{
				css:{'white-space': 'nowrap','padding': '0px !important'}
			},
			formatter:function(value, row, index){
				var list = row.biddingRooms;
				var html="<table class='table table-add' style='border-bottom: none;background:none'>";
				for(var i=0;i<list.length;i++){
					html+='<tr>';
						 html+='<td style="'+(i == 0?"":"border-top: 1px solid #ddd;")+'">'+list[i].address +'</td>';
					html+='</tr>';
				};
				html+="</table>";
				return html
			}
		} 
		]
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量
		'bidSectionCode': $('#bidSectionCode').val(),
		'bidSectionName': $('#bidSectionName').val(),
		'projectId': bidSectionId
    }
}