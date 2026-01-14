var UrlSearchEnterprise = config.Syshost+'/EnterpriseController/findEnterprisePageList.do';

//表格初始化
$(function(){
    initTable();
   
   	//添加
	$("#btnAdd").click(function(){
		openEdit(0);
	});
});

//设置查询条件
function getQueryParams(params) {
	data={
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'legalName': $("#legalName").val(),//企业名称
		'legalCode': $("#legalCode").val(),//企业编码
		'legalRole':"2"//企业类型，代理机构
	}
	return data
}

// 搜索按钮触发事件
$("#btnSearch").click(function() {
	$('#enterPrisetable').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

//初始化表单
function initTable() {
	$('#enterPrisetable').bootstrapTable({
		url: UrlSearchEnterprise,
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
	        checkboxed = row
	    },
		columns: [{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter:function(value, row, index){
					var pageSize=$('#enterPrisetable').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  				
	                var pageNumber=$('#enterPrisetable').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页                    
	                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
			},
			{
				field: 'legalName',
				title: '企业名称',
				align: 'left',
			},
			{
				field: 'legalCode',
				title: '企业代码',
				align: 'left',
			},
			{
				field: 'licenseNo',
				title: '营业执照号码',
				align: 'center',
			},
			{
				field: 'legalUnitAddress',
				title: '法人机构地址',
				align: 'left',		
			},
			{
				field: 'legalContact',
				title: '联系人',
				align: 'left',		
			},
			{
				field: 'legalContactPhone',
				title: '联系人电话',
				align: 'center',		
			},
			{
				field:'',
				title:'操作',
				align: 'center',
				width: '210',
				formatter: function (value, row, index) {
					
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm" onclick="openEdit(\''+row.danweiguid+'\')"><span class="glyphicon glyphicon-edit"></span>开标设置</button>';
					
					return strEdit;
				}
			}
		]
	})
}

//打开开标设置
function openEdit(value){
	
	layer.open({
		type: 2,
		title: "编辑开标设置",
		area: ['700px','400px'],
		resize: false,
		content: "OpenTender/config/model/bidConfigInfo.html?id="+ value,
	});
}

