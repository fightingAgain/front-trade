/**
*  Xiangxiaoxia 
*  2019-2-25
*  审核--招标文件审核人列表页面
*  方法列表及功能描述
*   1、initTable()   分页查询
*/

var urlBidCheckList = config.tenderHost+'/DocClarifyController/findCheckPageList.do';//招标文件--审核分页接口


var pageEdit= 'Bidding/BidFile/BidFileCheck/model/BidFileCheckEdit.html';
var pageView= 'Bidding/BidFile/BidFileCheck/model/BidFileCheckView.html'; 

//表格初始化
$(function(){
	initTable();
	
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();
	});

	// 状态查询
	$("#checkState").change(function(){
		$("#table").bootstrapTable('destroy');
		initTable();
//		$("#table").bootstrapTable("refresh");
	});
	
	//查看
	$("#table").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	
	//审核
	$("#table").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
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
		'checkState': $("#checkState").val(),
		
	}
};

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index){
	var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.7;
	layer.open({
		type: 2,
		title: "招标文件查看",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?id=" + rowData[index].bidSectionId+ "&bidFileId=" + rowData[index].id,
		success:function(layero, index){
		}
	});
}


/*
 * 打开审核窗口
 * index是当前所要查看的索引值，
 */
function openEdit(index){
	var rowData=$('#table').bootstrapTable('getData'); //bootstrap获取当前页的数据
	var width = top.$(window).width() * 0.8;
	var height = top.$(window).height() * 0.7;
	layer.open({
		type: 2,
		title: "招标文件审核",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageEdit + "?id=" + rowData[index].bidSectionId+ "&bidFileId=" + rowData[index].id,
		success:function(layero, index){
		}
	});
	
	
}

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:urlBidCheckList,// 请求url		
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
		/*onCheck:function(row){
			id=row.id;
			projectId=row.peojectId;
		},*/
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
			align: 'left',
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
			field: 'tenderMode',
			title: '招标方式',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			formatter:function(value, row, index){
				if(value==1){
					return '<span>公开招标</span>';
				}else if(value == 2){
					return '<span>邀请招标</span>';
				}
			}
		},/*{
			field: 'contractReckonPrice', //招标文件主表的创建时间
			title: '合同估算价',
			align: 'left',
			width: '100',
		},*/{
			field: 'tendererName',
			title: '招标人',
			align: 'center',
			//width: '120',
			cellStyle:{
				css:widthName
			}
		},{
			field: 'tenderAgencyName', //招标文件主表的创建时间
			title: '代理机构',
			align: 'left',
			cellStyle:{
				css:widthName
			}
		},{
			field: 'linkMen',
			title: '联系人',
			align: 'center',
			//width: '120',
			cellStyle:{
				css:widthDate
			},
		},{
			field: 'linkTel', //招标文件主表的创建时间
			title: '联系电话',
			align: 'center',
			//width: '180',
			cellStyle:{
				css:widthDate
			},
		},{
			field: 'workflowStartDate',
			title: '提交时间',
			align: 'center',
			cellStyle:{
				css:widthDate
			},
		},{
			field: 'bidDocClarifyState', //招标文件主表的创建时间
			title: '审核状态',
			cellStyle:{
				css:widthState
			},
			align: 'center',
			formatter:function(value, row, index){
				//0为未审核，1为审核中，2为审核通过，3为审核不通过
				if(row.bidDocClarifyState == 1){
					return "<span style='color:red;'>审核中</span>";
				}else if(row.bidDocClarifyState == 2){
					return "<span style='color:green;'>审核通过</span>";
				}else if(row.bidDocClarifyState == 3){
					return "<span style='color:red;'>审核不通过</span>";
				}
			}
		},{
			field:'',
			title:'操作',
			align: 'left',
			width: '150',
			formatter:function(value, row, index){
				var str = "";
				var strSee = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				var strCheck = '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>审核</button>';
				if(row.bidDocClarifyState == 1){//审核
					str += strCheck  ;
				}else{//查看
					str += strSee  ;
				}
				//str += strSee +strCheck;
				return str ;
			}
		}
		],
	}) 
};



