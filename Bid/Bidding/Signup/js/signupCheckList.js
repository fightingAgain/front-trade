
var signList = config.tenderHost+'/SupplierSignController/findXMSignUpPageList.do';//报名列表



var pageEdit ='Bidding/Signup/model/signEdit.html';//编辑报名信息
var pageView= 'Bidding/Signup/model/signCheck.html'; //查看报名信息


var bidData = '';//标段数据
var fileState = 1;  //文件当前状态，1是购买，2是下载
//表格初始化
$(function(){
	initTable();
	
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();
	});
	
	//报名
	$("#table").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//查看
	$("#table").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		openView(index);
	});
	//购标状态
	$("[name='states']").change(function(){
		$("#table").bootstrapTable('destroy');
		initTable();
	});
});

//报名
function openEdit(index){
	bidData = $('#table').bootstrapTable('getData')[index];
	layer.open({
		type: 2,
		title: "报名",
		area: ['100%', '100%'],
		resize: false,
		content: pageEdit+ "?bidSectionId=" + bidData.bidSectionId + "&examType=" + bidData.examType
	});
}
//查看
function openView(index){
	bidData = $('#table').bootstrapTable('getData')[index];
	var createType = bidData.owner == 1?'0':'1';
	layer.open({
		type: 2,
		title: "报名信息",
		area: ['100%', '100%'],
		resize: false,
		content: pageView+ "?id=" + bidData.bidSectionId + "&examType=" + bidData.examType + '&createType=' + createType,
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(bidData,refreshFather);  //调用子窗口方法，传参
		}
	});
}


//验证是否购买平台服务费
function checkService(callback){
	checkServiceCost({
		projectId:bidData.projectId,
		packId:bidData.bidSectionId,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		paySuccess:function(data, isService){
			$("#table").bootstrapTable('refresh');
			if(data){
				
				
			} else {
				top.layer.alert("支付失败");
			}
		}
	});
}

//设置查询条件
function queryParams(params) {
	return {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'interiorBidSectionCode': $("#interiorBidSectionCode").val(),
		'bidSectionName': $("#bidSectionName").val(),
		'states': $("[name='states']").val()
	}
};

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:signList,// 请求url		
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
		height: top.tableHeight,
		toolbar:"#toolbarTop",
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
			field: 'tenderProjectClassifyCode',
			title: '招标项目类型',
			align: 'center',
			cellStyle: {
				css:{'white-space':'nowrap'}
			},
			formatter:function(value, row, index){
				if(value){
					return getTenderType(value);
				}
			}
		},{
			field: 'examType', //招标文件主表的创建时间
			title: '资格审查方式',
			width: '180',
			align: 'center',
			formatter:function(value, row, index){
				if(value == 1){
					return "资格预审";
				} else if(value == 2){
					return "资格后审";
				}
			}
		}/*,{
			field: 'payMoney', //招标文件主表的创建时间
			title: '报名费',
			width: '120',
			align: 'center'
		}*/,{
			field: 'bidderNum',
			title: '已报名',
			align: 'center',
			width:"100"
		},{
			field: 'auditedNum',
			title: '已审核',
			align: 'center',
			width:"100"
		},{
			field: 'notAuditedNum',
			title: '未审核',
			align: 'center',
			width:"100"
		},{
			field:'states',
			title:'操作',
			align: 'left',
			width: '150',
			formatter:function(value, row, index){
				var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
				return strView;

			}
		}
		],
	}) 
};

function refreshFather(){
	$('#table').bootstrapTable('refresh');
}




