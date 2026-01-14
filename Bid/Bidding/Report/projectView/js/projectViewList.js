var listUrl = config.tenderHost + '/FileInfoExportController/fileInfoExportList.do';  //列表接口


$(function(){
	//加载列表
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
		initDataTab();
	});
	//开始时间
	$('#startTime').click(function() {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM-dd HH:mm',
			onpicked: function() {
				$dp.$('endTime').click();
			},
			//			minDate: nowDate,
			maxDate: '#F{$dp.$D(\'endTime\')}'
		})
	});
	//结束时间
	$('#endTime').click(function() {
		if($('#startTime').val() == '') {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				//				minDate: nowDate
			})
		} else {
			WdatePicker({
				el: this,
				dateFmt: 'yyyy-MM-dd HH:mm',
				minDate: '#F{$dp.$D(\'startTime\')}'
			})
		}

	});
	$('#btnExport').click(function(){
		 //导出模版
		var url = config.tenderHost + "/FileInfoExportController/pigeonholeInfoExportList.do";
		var obj = {};
		obj.tenderProjectCode = $("#tenderProjectCode").val();
		obj.tenderProjectName = $("#tenderProjectName").val();
		obj.bidSectionName = $("#bidSectionName").val();
		obj.bidSectionCode = $("#bidSectionCode").val();
		obj.tendererName = $("#tendererName").val();
		obj.legalName = $("#legalName").val();
		obj.startTime = $("#startTime").val();
		obj.endTime = $("#endTime").val();
		var loadUrl = $.parserUrlForToken(url);
		$.each(obj, function(key,value) {
			loadUrl += '&' + key + '=' + value
		});
		window.location.href = loadUrl;
	})

});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		tenderProjectCode: $("#tenderProjectCode").val(), // 招标项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 招标项目名称
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
		bidSectionCode: $("#bidSectionCode").val(), // 标段编号	
		tendererName: $("#tendererName").val(), // 招标人	
		legalName: $("#legalName").val(), // 中标单位	
		startTime: $("#startTime").val(), // 开始时间	
		endTime: $("#endTime").val() // 截止时间	
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#projectList").bootstrapTable({
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
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'tenderProjectCode',
					title: '招标项目编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				},
				{
					field: 'tenderProjectName',
					title: '招标项目名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},{
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				},
				{
					field: 'bidSectionCode',
					title: '标段名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'tendererName',
					title: '招标人名称',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'bidOpeningTime',
					title: '开标时间',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'legalName',
					title: '中标单位',
					align: 'left',
					cellStyle: {
						css: widthName
					}
				},
				{
					field: 'bidPrice',
					title: '中标金额',
					align: 'left',
					cellStyle: {
						css: {"width":"150px", "white-space":"nowrap"}
					}
				},
				{
					field: 'priceUnit',
					title: '单位',
					align: 'right',
					cellStyle: {
						css: {"width":"80px", "white-space":"nowrap"}
					},
					formatter: function (value, row, index) {
						var unit = '';
						if(value == '1'){
							unit = '万元'
						}else if(value == '0'){
							unit = '元'
						}
						if(value){
							return unit
						}else{
							return ''
						}
						
					}
				},
				{
					field: 'openingAddRess',
					title: '开标地点',
					align: 'left',
					cellStyle: {
						css: widthCode
					}
				},
				{
					field: 'tenerAgencyLinkmen',
					title: '项目经理',
					align: 'left',
					cellStyle: {
						css:{'white-space':'nowrap'}
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
	$("#projectList").bootstrapTable("refresh");
}
