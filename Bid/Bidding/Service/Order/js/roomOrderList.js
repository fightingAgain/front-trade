/**
*  zhouyan 
*  2019-2-18
*  发标中的开评标场地预约与条件查询
*  方法列表及功能描述
*   1、getTendereeList()   分页查询列表
*   2、queryParams()   分页查询要向后台传递的参数  
*/
var roomListUrl = config.tenderHost + "/BiddingRoomController/findRoomPageList.do" ;		//	开评标场地预约的列表地址
var addHtml = "Bidding/BidIssuing/roomOrder/model/roomOrderAdd.html";	//  添加、编辑时打开的页面
var viewHtml = "Bidding/BidIssuing/roomOrder/model/roomOrderView.html";	//  查看时打开的页面
var delUrl = config.tenderHost + "/BiddingRoomAppointmentController/delete.do";	//  删除预约
var updateUrl = config.tenderHost + "/BiddingRoomAppointmentController/updateState.do";	//  撤回预约
var tableH = 600 ;//表格高度
$(function(){
//	var tableH = $(".container-fluid").eq(0).height()-$(".container-fluid").eq(0).find('.row-fluid').eq(0).height()-$("#toolbarTop").height()-40;
	getTendereeList();
	//状态
	initSelect('.select');
	$('<option value="">全部</option>').prependTo("#appointmentState");
	$("#appointmentState").val("");
	
	//开始时间
	$('#appointmentStartDate').click(function(){
		if($('#appointmentEndDate').val() != ''){
			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm',
				maxDate:'#F{$dp.$D(\'appointmentEndDate\')}'
			})
		}else{
			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm',
			})
		}
		
 	});
   
	//结束时间
	$('#appointmentEndDate').click(function(){
 		if($('#appointmentStartDate').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'appointmentStartDate\')}'
			})
 		}
 		
 	});
	
	//点击查询按钮时刷新列表
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();				
	});
	$("#appointmentState").change(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();
	})
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index"); //获取当前数据的index值
		openView(index);
	});
	//设置的表格高度
	
//	console.log($('#tableList').find('.fixed-table-pagination'));
		
		
})
function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        url: roomListUrl, // 请求url	
//      height:tableH,
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
        fixedColumns: true, 
		striped: true,
//      fixedNumber: 2, //固定列数
        onLoadError:function(){
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		parent.layer.alert(data.message);
        	}
        },
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
		},{
            field: 'appointmentTitle',
            title: '标题',
            align: 'left',
            cellStyle:{
				css: widthName
			}
            /*formatter:function(value, row, index){
            	var str="";
            	var num = 15;
            	if(value.length>num){
            		str = value.substring(0,(num-1)) + '...';
            	}else{
            		str = value
            	}
            	return str;
            }*/
        },{
            field: 'appointmentStartDate',
            title: '开始时间',
            align: 'center',
            cellStyle:{
				css: widthDate
			}
        }, {
            field: 'appointmentEndDate',
            title: '结束时间',
            cellStyle:{
				css: widthDate
			},
            align: 'center',
        }/*, {
            field: 'appointmentState',
            title: '状态',
            width: '150px',
            align: 'center',
            formatter:function(value, row, index){
            	var str="";
            	if(value==0){
            		str="未提交";
            	} else if(value==1){
            		str ="提交审核";
            	}else if(value==2){
            		str="<span style='color:green'>审核通过</span>";
            	}else if(value==3){
            		str="<span style='color:red'>审核未通过</span>";
            	}else if (value == 4){
					return "<span style='color:blue;'>已撤回</span>";
				}
            	return str;
            }
        }*/, {
            field: 'subDate',
            title: '提交时间',
            cellStyle:{
				css: widthDate
			},
            align: 'center',
        },{
			field: 'status',
			title: '操作',
			align: 'center',
			width: '120px',
			cellStyle:{
				css:{'white-space':'nowrap'}
			},
			formatter: function (value, row, index) {
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				return strSee;
			}
		}]
    });
}
// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'appointmentTitle': $('#appointmentTitle').val(),
        'appointmentState':$("#appointmentState").val(),
        'startDate':$("#appointmentStartDate").val(),
        'endDate':$("#appointmentEndDate").val(),
    }
}
/**
*  打开查看页面
*  编辑时传当前数据的index值
*  异常信息
*  
*/
function openView(index){
	var width = top.$(window).width() * 0.7;
	var height = top.$(window).height() * 0.8;
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看预约详情',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: viewHtml + '?id=' + rowData.id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
