/**
*  Xiangxiaoxia 
*  2019-3-4
*  投标人-质疑列表页面
*  方法列表及功能描述
*   1、initTable()   分页查询
*/

var urlAskList = config.tenderHost+'/ProjectAskAnswersController/findBidAskPageList.do';//质疑查看记录   投标人分页接

var pageClarifyView= 'Bidding/BidAskAndAnswer/Ask/model/ClarifyView.html';
var pageAskView= 'Bidding/BidAskAndAnswer/Ask/model/AskView.html'; 

//表格初始化
$(function(){
	initTable();
	
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
	});

	
	//质疑
	$("#table").on("click", ".btnAsk", function(){
		var index = $(this).attr("data-index");
		openAsk(index);
	});
	
	//澄清
	$("#table").on("click", ".btnClarify", function(){
		var index = $(this).attr("data-index");
		openClarify(index);
	});
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val(),
	}
};

/*
 * 打开质疑查看窗口
 * index是当前所要查看的索引值，
 */
function openAsk(index){
	var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var width = top.$(window).width() * 0.7;
	var height = top.$(window).height() * 0.7;
	layer.open({
		type: 2,
		title: "查看质疑",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageAskView + "?packageId=" + rowData[index].packageId+ "&askEndDate="+rowData[index].askEndDate+ "&examType="+rowData[index].examType,
		success:function(layero, index){
		}
	});
}


/*
 * 打开澄清查看窗口
 * index是当前所要查看的索引值，
 */
function openClarify(index){
	var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var width = top.$(window).width() * 0.7;
	var height = top.$(window).height() * 0.7;
	layer.open({
		type: 2,
		title: "查看澄清",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageClarifyView + "?packageId=" + rowData[index].packageId+ "&examType="+rowData[index].examType,
		success:function(layero, index){
		}
	});
	
	
}

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:urlAskList,// 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			id=row.id;
			projectId=row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'center',
			width: '200'
		},{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'center',
		},{
			field: 'tenderMode',
			title: '招标方式',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				if(value==1){
					return '<span>公开招标</span>';
				}else if(value == 2){
					return '<span>邀请招标</span>';
				}
			}
		},{
			field: 'askCount', 
			title: '质疑数',
			align: 'center',
			width: '100',
		},{
			field: 'clarifyCount',
			title: '澄清数',
			align: 'center',
			width: '120',
		},{
			field:'',
			title:'操作',
			align: 'left',
			width: '150',
			formatter:function(value, row, index){
				var str = "";
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnAsk" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>质疑</button>';
				var strCheck = '<button  type="button" class="btn btn-primary btn-sm btnClarify" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>澄清</button>';
				str += strSee +strCheck;
				return str ;
			}
		}
		],
	}) 
};



