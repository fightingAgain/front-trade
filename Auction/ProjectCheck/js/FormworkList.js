var listUrl = top.config.Syshost + '/TempBidWebController/findPageList.do';  //列表接口
var orderType = [];
$(function(){
	
	//主体类型  01为招标人，02为代理机构，03为投标人，04为采购人，05 自然人 ，06 供应商
	/*
	 * 代理机构（'02'）可查 招标与非招标
	 * 招标人（'01'）、采购人（'04'）只能查 非招标
	 * 
	 * */
	// if($.inArray('01',enterpriseType) != -1 || $.inArray('04',enterpriseType) != -1){
	// 	orderType = [
	// 		{name:'询比采购',value:'0'},
	// 		{name:'竞价采购',value:'1'},
	// 		{name:'竞卖',value:'2'},
	// 		{name:'单一来源采购',value:'6'}
	// 	];
	// }else if($.inArray('02',enterpriseType) != -1 || enterpriseType[0] == ''){
		orderType = [
			{name:'招标采购',value:'4'},
			{name:'询比采购',value:'0'},
			{name:'竞价采购',value:'1'},
			{name:'竞卖',value:'2'},
			{name:'单一来源采购',value:'6'}
		];
	// }
	var options = '';
	options+='<option value="'+""+'">全部</option>'
	for(var i = 0;i<orderType.length;i++){
		options += '<option value="'+orderType[i].value+'">'+orderType[i].name+'</option>'
	}
	$(options).appendTo('#projectKind')
	//加载列表
	initDataTab();
	
	//添加
	$("#btnAdd").click(function(){
		openEdit("");
	});
	
	//查询
	$("#btnSearch").click(function(){
		$("#ProjectAuditTable").bootstrapTable('destroy');
		initDataTab()
	});
	//查询
	$("#projectKind").change(function(){
		$("#ProjectAuditTable").bootstrapTable('destroy');
		initDataTab()
	});
	$("#tempState").change(function(){
		$("#ProjectAuditTable").bootstrapTable('destroy');
		initDataTab()
	});

});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		tempName: $("#tempName").val(), //版本编号
		tempState: $("#tempState").val(), // 状态	
		'projectKind': $("#projectKind").val() //采购类型	
	};
	return projectData;
};

//表格初始化
function initDataTab(){
	$("#ProjectAuditTable").bootstrapTable({
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
	        checkboxed = row
	    },
		columns: [
			[{
				field: 'xh',
				title: '序号',
				align: 'center',
				width: '50',
				formatter: function (value, row, index) {
		            var pageSize = $('#ProjectAuditTable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		            var pageNumber = $('#ProjectAuditTable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		            return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		        }
			},
			{
				field: 'tempName',
				title: '模板名称',
				align: 'left',
				width: '200',
			},
			{
				field: 'tempTypeName',
				title: '模板类型',
				align: 'center',
				halign: 'center',
				width: '160',
			},
			{
				field: 'projectType',
				title: '项目类型',
				align: 'center',
				halign: 'center',
				width: '160',
				formatter: function(value, row, index) {				 								
					var str="";
					switch (value){
						case "A":
							str="工程";
							break;
						case "B":
							if(row.projectKind==4){
								str="货物";
							}else{
								str="设备";
							}	
							break;
						case "C":
							str="服务";
							break;
						case "C50":
							str="广宣";
							break;
						case "0":
							str="不限";
							break;		
					}
					return str;
				}
			},
			{
				field: 'createTime',
				title: '提交时间',
				align: 'center',
				halign: 'center',
				width: '160',
			},
			{
				field: 'tempState',
				title: '状态',
				align: 'center',
				halign: 'center',
				width: '160',
				formatter: function(value, row, index) {				 								
					var str="";
					switch (value){
						case 1:
							str="审核中";
							break;
						case 2:
							str="审核通过";
							break;
						case 3:
							str="审核不通过";
							break;
					}
					return str;
				}
			},	
			{
				field: 'tempStates',
				title: '操作',
				align: 'left',
				width: '100px',
				events:{
					"click .detailed": function(e, value, row, index) {
						var contentUrl='bidPrice/ProjectCheck/modal/FormworkView.html?id=' + row.id + '&edittype=detailed&projectKind='+row.projectKind	;
						top.layer.open({
							type: 2,
							area: ["1100px", "650px"],
							maxmin: true,
							resize: false,
							title: "查看",			
							content: contentUrl,
							
						});
					},
					"click .audit": function(e, value, row, index) {
						var contentUrl='bidPrice/ProjectCheck/modal/FormworkView.html?id=' + row.id + '&edittype=audit&projectKind='+row.projectKind
						top.layer.open({
							type: 2,
							area: ["1100px", "650px"],
							maxmin: true,
							resize: false,
							title: "审核",            
							content: contentUrl,
							
						});
					},
				},
				formatter: function (value, row, index) {
					var str = ""; 
					var strEdit = '<button  type="button" class="btn btn-primary btn-sm audit" ><span class="glyphicon glyphicon-edit "></span>审核</button>';
					var strView = '<button  type="button" class="btn btn-primary btn-sm detailed" ><span class="glyphicon glyphicon-eye-open "></span>查看</button>';
					//根据状态不同显示不同按钮
					switch (row.tempState){

						case 1:
							str = strEdit;
							break;
						default	:
							str = strView;
						break;			
					}
					
					return str;
				}
			}]
		]
	});
};

