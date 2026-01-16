/**

*  标室管理中的标室查询列表的列表展示与条件查询
*  方法列表及功能描述
*   1、getTendereeList()   分页查询列表
*   2、queryParams()   分页查询要向后台传递的参数  
*/
var roomListUrl = config.tenderHost + "/BiddingRoomQueryController/findBiddingRoomPageList.do";//标室查询列表
var viewHtml = 'Bidding/BidRoomManage/roomCheck/model/roomCheckView.html';		//查看标室详情

$(function(){
	getTendereeList()
	//点击查询按钮时刷新列表
	$("#btnSearch").click(function () {
		$("#tableList").bootstrapTable('destroy');
		getTendereeList()			
	});
	$("#biddingRoomType").change(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList()
	})
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index"); //获取当前数据的index值
		openView(index);
	});
})
function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        url: roomListUrl, // 请求url		
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
        toolbar: '#toolbar', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        height:tableHeight,
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
            field: 'biddingRoomName',
            title: '评标室名称',
            align: 'left',
            cellStyle:{
				css:widthName
			}
        },{
            field: 'biddingRoomType',
            title: '类型',
            align: 'center',
            cellStyle:{
				css:widthState
			},
            formatter: function (value, row, index) {
				var str = "";
				if(value == '0'){
					str = '自有场地'
				}else if(value == '1'){
					str = '外部场地'
				}
				return str
			},
        }, {
            field: 'chargePerson',
            title: '负责人',
            align: 'left',
            cellStyle:{
				css:widthCode
			}
        }, {
            field: 'chargeTel',
            title: '联系电话',
            align: 'center',
            cellStyle:{
				css:widthCode
			}
        }, {
            field: 'isOpen',
            title: '是否开放',
            align: 'center',
            cellStyle:{
				css:widthState
			},
            formatter: function (value, row, index) {
				var str = "";
				if(value == '0'){
					str = '否'
				}else if(value == '1'){
					str = '是'
				}
				return str
			},
        },{
			field: 'status',
			title: '操作',
			align: 'center',
			width: '150px',
			formatter: function (value, row, index) {
				var str = "";
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>详情</button>';
				return strSee
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
        'biddingRoomName': $('#biddingRoomName').val(),
        'biddingRoomType':$("#biddingRoomType").val(),
        'isOpen': '',
    }
}
/**
*  打开查看页面
*  编辑时传当前数据的index值
*  异常信息
*  
*/
function openView(index){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看标室详情',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: viewHtml + '?id=' + rowData.id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
