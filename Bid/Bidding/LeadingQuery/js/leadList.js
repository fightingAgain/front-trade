/**

 *  工程项目项目负责人信息查询
 *   1、initTable()   分页查询
 */

var listUrl = config.tenderHost + '/ProjectManagerController/findProjectManagerPage.do'; //招标文件--标段查询分页接口
var contentHtml = 'Bidding/LeadingQuery/model/content.html';//公示内容
var projectTypeUrl = config.Syshost + "/SysDictController/findOptionsByName.do";//项目分类
var projectTypeCode = "";//项目分类
//表格初始化
$(function() {
	getProjectClassify();
	// $('.selectpicker').selectpicker('val','');
	$('.selectpicker').selectpicker('selectAll');
	initTable();
	/* $(".projectType").dataLinkage({
		optionName: "TENDER_PROJECT_CLASSIFY_0CODE",
		optionValue: "A",
		areAll: true,
		selectCallback: function (code) {
			projectTypeCode = code;
			$("#table").bootstrapTable('destroy');
			initTable();
		}
	}); */
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$("#table").bootstrapTable('destroy');
		initTable();
	});
	$('.selectpicker').on('changed.bs.select',function(e){
		$("#table").bootstrapTable('destroy');
		initTable();
	});
	//重置
	$('#btnReset').click(function(){
		// $('.selectpicker').selectpicker('refresh');
		$('.selectpicker').selectpicker('selectAll');
		$('#name,#legalName,#cfa,#startDate,#endDate').val('');
		$("#table").bootstrapTable('destroy');
		initTable();
	})
	//开始时间
	$('#startDate').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd',
			onpicked: function() {
				$dp.$('endDate').click();
			},
			// minDate: nowDate,
			maxDate: '#F{$dp.$D(\'endDate\')}'
		})
	});
	//结束时间
	$('#endDate').click(function() {
		if($('#startDate').val() == '') {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd',
				// minDate: nowDate
			})
		} else {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd',
				minDate: '#F{$dp.$D(\'startDate\')}'
			})
		}
	
	});
	
});
//设置查询条件
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'name': $("#name").val(),
		'legalName': $("#legalName").val(),
		'cfa': $("#cfa").val(),
		'projectType':$('#projectType').val().join(','),
		'startDate': $("#startDate").val(),
		'endDate': $("#endDate").val()
	}
};

function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: listUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		height: top.tableHeight,
		onCheck: function(row) {
			id = row.id;
			projectId = row.peojectId;
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'name',
			title: '姓名',
			align: 'left',
			cellStyle:{
				css:widthState
			}
		}, {
			field: 'legalName',
			title: '公司名称',
			align: 'left',
			cellStyle:{
				css:widthName
			}
		},{
			field: 'cfa',
			title: '证书名称及编号',
			align: 'left',
			width: '300'
			/* cellStyle:{
				css:widthState
			}, */
		},
		{
			field: 'interiorBidSectionCode', //招标文件主表的创建时间
			title: '项目编号',
			align: 'center',
			cellStyle:{
				css:widthDate
			},
			formatter:function(value, row, index){
				return '<span class="projectCode"><a>'+(value?value:"")+'</a></span>'
			},
			events:{
				'click .projectCode': function(e,value, row, index){
					var newUrl = contentHtml + '?id=' + row.bidSectionId;
					window.open(newUrl, "_blank");
				},
			}
		},
		{
			field: 'projectTypeName', //招标文件主表的创建时间
			title: '项目分类',
			align: 'center',
			cellStyle:{
				css:widthState
			},
			/* formatter:function(value, row, index){
				//规划、投资策划与决策、勘察、设计、监理、工程造价、项目管理（含代建）、工程施工、其他工程
				
			} */
		}, {
			field: 'noticeSendTime',
			title: '中标通知书发送日期',
			cellStyle:{
				css:widthDate
			},
			align: 'center',
			formatter:function(value, row, index){
				//规划、投资策划与决策、勘察、设计、监理、工程造价、项目管理（含代建）、工程施工、其他工程
				if(value){
					return value.split(' ')[0]
				}
				
			}
		}],
	})
}
function refreshFather(){
	$('#table').bootstrapTable('refresh');
};
//项目分类
function getProjectClassify(){
	$.ajax({
		url: projectTypeUrl,
	 	type: "post",
	 	async:false,
	 	data:{
			'optionName':'TENDER_PROJECT_CLASSIFY_0CODE'
		},
	 	success: function (data) {
			if(!data.success){
				parent.layer.alert(data.message);
				return;
			}
			var result = data.data;
			var html = '';
			$.each(result, function(index,item){
				if(item.optionValue.length > 1 &&item.optionValue.substring(0,1) == "A"){
					html += '<option value="'+item.optionValue+'">'+item.optionText+'</option>'
				}
			});
			$(html).appendTo('#projectType')
		}
	})
}

