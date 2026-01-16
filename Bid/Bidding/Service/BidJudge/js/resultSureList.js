/**

*  确定中标人
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/BidWinCandidateController/findPageList.do';  //列表接口

var viewHtml = 'Bidding/BidJudge/ResultSure/model/resultSureView.html';//查看

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
});
function openView(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看确认中标人',
		area: ['80%', '80%'],
		content: viewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMessage(rowData); 
		}
	});
};
//变更
function reset(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	$.ajax({
		type:"post",
		url:changeUrl,
		async:true,
		data: {
			'id': rowData.id
		},
		success: function(data){
			if(data.success){
				rowData.id = data.data;
        		openEdit(rowData);
                $('#tableList').bootstrapTable(('refresh'));
			}else{
				layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};


// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
		url: listUrl,
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
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function (value, row, index) {
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
				},{
					field: 'tenderProjectType',
					title: '招标项目类型',
					align: 'center',
					width: '150',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						return getTenderType(value);
					}
				},
				{
					field: 'noticeNature',
					title: '公示性质',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						if(value == "1"){//1为正常公示，2为更正公示，3为重发公示，9为其它
							return  '<span>正常</span>'
						}else if(value == "2"){
							return  '<span>变更</span>'
						}else if(value == "3"){
							return  '<span>重发</span>'
						}
					}
				},
				{
					field: 'publicityStartTime',
					title: '发布时间',
					align: 'center',
					cellStyle:{
						css: widthDate
					}
				},
				{
					field: 'noticeState',
					title: '状态',
					align: 'center',
					cellStyle:{
						css: widthState
					},
					formatter: function(value, row, index){
						if(row.noticeState == 0){
							return  '<span>未提交</span>'
						}else if(row.noticeState == 1){
							return  '<span>已提交</span>'
						}else if(row.noticeState == 2){
							return  '<span style="color:green">审核通过</span>'
						}else if(row.noticeState == 3){
							return  '<span style="color:red">审核未通过</span>'
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '120px',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strView
					}
						
						

				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}