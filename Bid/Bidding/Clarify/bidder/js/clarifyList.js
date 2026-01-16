/**

*  评审结果公示
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/AskAnswersController/findPageList.do';  //列表接口
var recordUrl = config.tenderHost + '/AskAnswersController/insertLog.do';//投标人查看记录

//var bidHtml = 'Bidding/Clarify/bidder/model/bidList.html';//标段列表
var clarifyHtml = 'Bidding/Clarify/bidder/model/clarifyEdit.html';//澄清页面
var viewHtml = 'Bidding/Clarify/bidder/model/view.html';//查看供应商自己提出的问题
var clarifyViewHtml = 'Bidding/Clarify/bidder/model/clarifyView.html';//查看项目经理澄清

$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//新增
	$('#btnAdd').click(function(){
		openClarify()
	})
	//查看供应商自己提出的问题
	$('#tableList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前数据
		openView(rowData)
	});
	//查看项目经理澄清
	$('#tableList').on('click','.btnClarify',function(){
		var index = $(this).attr('data-index');
		var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前数据
		/*$.ajax({
			type:"post",
			url:recordUrl,
			async:true,
			data: {
				'bidSectionId':rowData.bidSectionId
			},
			success: function(data){
				
			}
		});*/
		openClarifyView(rowData)
	})
});
//选择标段
function chooseBid(){
	layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.bidFromFathar(formFather);
		}
	})
}
function formFather(data){
	openClarify(data)
};
//新增澄清
function openClarify(){
	layer.open({
		type: 2,
		title: '提出问题',
		area: ['1000px', '650px'],
		content: clarifyHtml+ '?isChoose=1',
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(); 
		}
	});
};
//查看供应商自己提出的问题
function openView(data){
	layer.open({
		type: 2,
		title: '查看问题',
		area: ['1000px', '650px'],
		content: viewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data); 
		}
	});
}
//查看项目经理澄清
function openClarifyView(data){
	layer.open({
		type: 2,
		title: '查看澄清',
		area: ['1000px', '650px'],
		content: clarifyViewHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data); 
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
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
		height:tableHeight,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			{
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
			{
				field: 'tenderProjectType',
				title: '项目类型',
				align: 'center',
				width: '200',
				cellStyle:{
					css:{"white-space":"nowrap"}
				},
				formatter: function(value, row, index){
					return getTenderType(value);
				}
			},
			{
				field: 'examType',
				title: '资格审查方式',
				align: 'center',
				width: '100px',
				cellStyle:{
					css:{"white-space":"nowrap"}
				},
				formatter: function (value, row, index) {
					if(value == 1){
						return '预审'
					}else if(value == 2){
						return '后审'
					}
				}
			},
			{
				field: 'bidStage',
				title: '阶段',
				align: 'center',
				width: '150px',
				cellStyle:{
					css:{"white-space":"nowrap"}
				},
				formatter: function (value, row, index) {
					if(row.examType == 1){
						if(value == 1){
							return '预审阶段'
						}else if(value == 2){
							return '预审转后审阶段'
						}
					}else if(value == 2){
						return '后审阶段'
					}
					
				}
			},
			{
				field: 'clarifyTime',
				title: '澄清截止时间',
				align: 'center',
				cellStyle:{
					css:widthDate
				}
			},
			{
				field: 'status',
				title: '操作',
				align: 'left',
				width: '230px',
				cellStyle:{
					css:{"white-space":"nowrap"}
				},
				formatter: function (value, row, index) {
					var str = "";
					var answerNum = '';//项目经理澄清数量
					var askNum = '';//投标人提问数量
					if(row.aswersNumber){
						answerNum = '('+row.aswersNumber+')';
					}
					if(row.putclarifyNumber){
						askNum = '('+row.clarifyNumber+'/'+row.putclarifyNumber+')';
					}
					var strClarify ='<button  type="button" class="btn btn-primary btn-sm btnClarify" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看澄清'+answerNum+'</button>';
					var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>提出问题'+askNum+'</button>';
					return strClarify + strSee
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
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}