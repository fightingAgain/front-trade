var listUrl = config.AuctionHost + '/ObjectionAnswersStatisticsController/page';  //列表接口

var tenderTypeDict = {
	0: '询比采购',
	1: '竞价采购',
	2: '竞卖采购',
	3: '询价报价',
	4: '招标采购',
	12: '谈判采购',
	6: '单一来源',
	7: '框架协议采购',
	8: '战略协议采购',
}
$(function () {
	//开始时间
	$('#dataTime').val(formatDateTime(new Date()))
	$('#dataTime').click(function () {
		WdatePicker({
			el: this,
			dateFmt: 'yyyy-MM',
			// onpicked: function () {
			// 	$dp.$('endTime').click();
			// },
		})
	});
	initSelectOPtions();
	getTotalData()
	
	//查询
	$("#btnSearch").click(function () {
		$("#projectList").bootstrapTable('destroy');
		getTotalData();
	});
	// 下拉框选择查询
	$("#tenderType,#dataTime,#tenderOrganizeForm").change(function () {
		$("#projectList").bootstrapTable('destroy');
		getTotalData();
	});

	$('#btnExport').click(function () {
		if($("#dataTime").val()==""){
			return;
		}
		//导出模版
		var url = config.AuctionHost + "/ObjectionAnswersStatisticsController/export";
		var obj = formParams();
		var loadUrl = $.parserUrlForToken(url);
		$.each(obj, function (key, value) {
			loadUrl += '&' + key + '=' + value
		});
		window.location.href = loadUrl;
	})

	//可以编写自定义函数来格式化日期时间。例如：
	function formatDateTime(date) {
		var year1 = date.getFullYear();
		var month1 = date.getMonth();
		if(month1==0){
			year1--;
			month1=12;
		}
		return `${year1}-${pad(month1)}`;
	}
	function pad(num) { return num.toString().padStart(2, '0')}
});
function getTotalData(){
	var objPara = formParams()
	objPara.offset = 0
	objPara.pageSize = 1
	objPara.pageNumber = 1
	$.ajax({
		type: "post",
		url: listUrl,
		async: false,
		data: objPara,
		success: function (result) {
			if(result.success){
				if(JSON.stringify(result.data.rows.total) != "{}"){
					computeTotal(result.data.rows.total)
				}else{
					for(var i=0;i<=9;i++){
						zgyswj[i] = ''
						zbwj[i] = ''
						kb[i] = ''
						zbgs[i] = ''
						smallTotal[i] = ''
					}
				}
				
			}
		},
	});
	//加载列表
	initDataTab();
}
function initSelectOPtions() {
	var selHtml = "<option value=''>全部</option>";
	for (var key in tenderTypeDict) {
		if(key == 3 || key == 12 ||key == 7 ||key == 8 ){

		}else{
			selHtml += '<option value="' + key + '">' + tenderTypeDict[key] + '</option>'
		}
	}

	$("#tenderType").html(selHtml)
}

// 查询参数
function formParams() {
	var dataTime = $("#dataTime").val();
	if(dataTime==""){
		parent.layer.alert('请选择年月！', { icon: 7, title: '提示' });
		return;
	}
	return {
		dataTime: dataTime?dataTime+'01':dataTime, // 年月
		packageCode: $("#packageCode").val(), // 标段（包件）编号
		packageName: $("#packageName").val(), // 标段（包件）名称
		tenderType: $("#tenderType").val(), // 采购类型	
		tendererName: $("#tendererName").val(), // 招标（采购）人	
		tenderOrganizeForm: $("#tenderOrganizeForm").val(), // 项目经理	
		tenderAgencyLinkmen: $("#tenderAgencyLinkmen").val() // 项目经理	
	}
}
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码

	};
	return $.extend(projectData, formParams());
};
//表格初始化
function initDataTab() {
	$("#projectList").bootstrapTable('destroy');
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
		fixedColumns: true,
		fixedNumber: 3,
		overFixedRemove: false,
		responseHandler: function (result) {
			tableData = result.data.rows.page;
			var obj = JSON.parse(JSON.stringify(result.data))
			obj.rows = tableData
			console.log(obj);
			return obj;
		},
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			topOneHead(),
			topTwoHead(),
			topthreeHead(),
			topfourHead(),
			totalHead(),
		]
	});
};

var zgyswj=[],zbwj=[],kb=[],zbgs=[], zbgs9 = [], smallTotal=[];
// 计算合计
function computeTotal(data) {
	/* objectionType 1.资格预审文件    2.资格文件开启  3.资格评审  4.招标文件  5.开标  6.评审 7.中标候选人公示 8.采购结果公示 9.项目异常公示*/
	/* 异议状态：，5-已签收不予受理（可以再次编辑），8-未签收申请撤回，9-已撤回 
		异议处理结果：30 驳回、31 修改文件、32 招标无效、33 投标无效、34 中标无效 
		 41 正在处理 */
		 /* 40 异议数量  31 修改文件 32 招标无效、33 投标无效、34 中标无效 30 驳回、5-已签收不予受理（可以再次编辑） 8-未签收申请撤回 41 正在处理*/
	zgyswj = [
		resetCount(data[1],1,40),
		resetCount(data[1],1,41),
		resetCount(data[1],1,31),
		resetCount(data[1],1,32),
		resetCount(data[1],1,33),
		resetCount(data[1],1,34),
		resetCount(data[1],1,35),
		resetCount(data[1],1,36),
		resetCount3(data[1],1,30,35,36),
		resetCount(data[1],1,8),
		resetCount(data[1],1,5),
	]
	zbwj = [
		resetCount(data[4],4,40),
		resetCount(data[4],4,41),
		resetCount(data[4],4,31),
		resetCount(data[4],4,32),
		resetCount(data[4],4,33),
		resetCount(data[4],4,34),
		resetCount(data[4],4,35),
		resetCount(data[4],4,36),
		resetCount3(data[4],4,30,35,36),
		resetCount(data[4],4,8),
		resetCount(data[4],4,5),
	]
	kb = [
		resetCount(data[5],5,40),
		resetCount(data[5],5,41),
		resetCount(data[5],5,31),
		resetCount(data[5],5,32),
		resetCount(data[5],5,33),
		resetCount(data[5],5,34),
		resetCount(data[5],5,35),
		resetCount(data[5],5,36),
		resetCount3(data[5],5,30,35,36),
		resetCount(data[5],5,8),
		resetCount(data[5],5,5),
	]
	var zbgs7 = [
		resetCount(data[7],7,40),
		resetCount(data[7],7,41),
		resetCount(data[7],7,31),
		resetCount(data[7],7,32),
		resetCount(data[7],7,33),
		resetCount(data[7],7,34),
		resetCount(data[7],7,35),
		resetCount(data[7],7,36),
		resetCount3(data[7],7,30,35,36),
		resetCount(data[7],7,8),
		resetCount(data[7],7,5),
	]
	var zbgs8 = [
		resetCount(data[8],8,40),
		resetCount(data[8],8,41),
		resetCount(data[8],8,31),
		resetCount(data[8],8,32),
		resetCount(data[8],8,33),
		resetCount(data[8],8,34),
		resetCount(data[8],8,35),
		resetCount(data[8],8,36),
		resetCount3(data[8],8,30,35,36),
		resetCount(data[8],8,8),
		resetCount(data[8],8,5),
	]
	zbgs9 = [
		resetCount(data[9],9,40),
		resetCount(data[9],9,41),
		resetCount(data[9],9,31),
		resetCount(data[9],9,32),
		resetCount(data[9],9,33),
		resetCount(data[9],9,34),
		resetCount(data[9],9,35),
		resetCount(data[9],9,36),
		resetCount3(data[9],9,30,35,36),
		resetCount(data[9],9,8),
		resetCount(data[9],9,5),
	]
	zbgs = []
	smallTotal = []
	for(var i=0;i<zbgs9.length;i++){
		zbgs[i] = zbgs7[i] + zbgs8[i];
		smallTotal[i] = zgyswj[i] + zbwj[i] + kb[i] + zbgs7[i] + zbgs8[i] + toNumber(zbgs9[i]);
	}
	console.log(zbgs);
	console.log(smallTotal);

	function toNumber(v) {
		if (/[0-9.]/.test(v)) {
			return +v;
		} else {
			return 0;
		}
	}



}
function topOneRightHead() {
	return [
		{
			title: "小计",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,
		},
		{
			title: "资格预审文件",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,

		},
		{
			title: "招标文件",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,
		},
		{
			title: "开标",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,
		},
		{
			title: "中标候选人公示/结果公示",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,
		},
		{
			title: "项目异常公示",
			valign: "middle",
			align: "center",
			colspan: 11,
			rowspan: 1,
		},
	]
}
function topOneHead() {
	var arrH = [
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			valign: "middle",
			width: '50',
			colspan: 1,
			rowspan: 4,
			formatter: function (value, row, index) {
				var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'packageCode',
			title: '标段/包件编号',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
			width: '180',
		},
		{
			field: 'packageName',
			title: '标段/包件名称',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
			width: '180',
		},
		{
			field: 'tenderType',
			title: '采购类型',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
			width: '180',
			formatter: function (value, row, index) {
				return tenderTypeDict[value]
			}
		},
		{
			field: 'tendererName',
			title: '招标（采购）人',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
		},
		{
			field: 'tenderOrganizeForm',
			title: '招标组织形式',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
			formatter: function (value, row, index) {
				return top.Enums.tenderOrgForm[value]
			}
		},
		{
			field: 'tenderAgencyLinkmen',
			title: '项目经理',
			valign: "middle",
			align: "center",
			colspan: 1,
			rowspan: 4,
		},

	]
	return arrH.concat(topOneRightHead())
}
function topTwoHead() {
	var oneHead = topOneRightHead()
	var resArr = []
	for (var i = 0; i < oneHead.length; i++) {
		resArr.push(
			{
				title: '异议数量(次)',
				align: 'center',
				colspan: 1,
				rowspan: 3,
			},
			{
				title: '正在处理',
				align: 'center',
				colspan: 1,
				rowspan: 3,
			},
			{
				title: '处理结束',
				align: 'center',
				colspan: 9,
				rowspan: 1,
			},
		)
	}
	return resArr;
}
function topthreeHead() {
	var oneHead = topOneRightHead()
	var resArr = []
	for (var i = 0; i < oneHead.length; i++) {
		resArr.push(
			{
				title: '异议成立',
				align: 'center',
				colspan: 4,
				rowspan: 1,
			},
			{
				title: '异议不成立',
				align: 'center',
				colspan: 3,
				rowspan: 1,
			},
			{
				title: '撤回',
				align: 'center',
				colspan: 1,
				rowspan: 2,
			},
			{
				title: '不受理',
				align: 'center',
				colspan: 1,
				rowspan: 2,
			},
		)
	}
	return resArr;
}
function topfourHead() {
	var oneHead = topOneRightHead()
	var resArr = []
	for (var i = 0; i < oneHead.length; i++) {
		resArr.push(
			{
				title: '修改文件',
				align: 'center',
			},
			{
				title: '招标无效',
				align: 'center',
			},
			{
				title: '投标无效',
				align: 'center',
			},
			{
				title: '中标无效',
				align: 'center',
			},
			{
				title: '未修改文件',
				align: 'center',
			},
			{
				title: '未变更结果',
				align: 'center',
			},
			{
				title: '驳回(小计)',
				align: 'center',
			},
		)
	}
	return resArr;
}
function totalHead() {
	console.log(zgyswj);
	console.log(zbwj);
	console.log(kb);
	console.log(zbgs);
	console.log(smallTotal);
	/* 异议状态：，5-已签收不予受理（可以再次编辑），8-未签收申请撤回，9-已撤回 
异议处理结果：30 驳回、31 修改文件、32 招标无效、33 投标无效、34 中标无效 
40 异议数量 41 正在处理 */
	var resArr = [
		{
			field: '异议数量(次)',
			title: smallTotal[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 40)
			}
		},
		{
			field: '正在处理',
			title: smallTotal[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 41)
			}
		},
		{
			field: '修改文件',
			title: smallTotal[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 31)
			}
		},
		{
			field: '招标无效',
			title: smallTotal[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 32)
			}
		},
		{
			field: '投标无效',
			title: smallTotal[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 33)
			}
		},
		{
			field: '中标无效',
			title: smallTotal[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 34)
			}
		},
		{
			field: '未修改文件',
			title: smallTotal[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 35)
			}
		},
		{
			field: '未变更结果',
			title: smallTotal[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 36)
			}
		},
		{
			field: '驳回(小计)',
			title: smallTotal[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal2(row.detailList, 30,35,36)
			}
		},
		{
			field: '撤回',
			title: smallTotal[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 8)
			}
		},
		{
			field: '不受理',
			title: smallTotal[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return projectSmallTotal(row.detailList, 5)
			}
		},
	]

	var typeObj = {
		"1":zgyswj,
		"4":zbwj,
		"5":kb,
		"78":zbgs,
	}

	var resArr1 = [
		{
			field: '异议数量(次)',
			title: zgyswj[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return resetCount(row.detailList, '1', 40)
			}
		},
		{
			field: '正在处理',
			title: zgyswj[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 正在处理 
				return resetCount(row.detailList, '1', 41)
			}
		},
		{
			field: '修改文件',
			title: zgyswj[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 修改文件 
				return resetCount(row.detailList, '1', 31)
			}
		},
		{
			field: '招标无效',
			title: zgyswj[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 招标无效 
				return resetCount(row.detailList, '1', 32)
			}
		},
		{
			field: '投标无效',
			title: zgyswj[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 投标无效 
				return resetCount(row.detailList, '1', 33)
			}
		},
		{
			field: '中标无效',
			title: zgyswj[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, '1', 34)
			}
		},
		{
			field: '未修改文件',
			title: zgyswj[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, '1', 35)
			}
		},
		{
			field: '未变更文件',
			title: zgyswj[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, '1', 36)
			}
		},
		{
			field: '驳回(小计)',
			title: zgyswj[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 驳回 
				return resetCount2(row.detailList, '1', 30,35,36)
			}
		},
		{
			field: '撤回',
			title: zgyswj[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 撤回 
				return resetCount(row.detailList, '1', 8)
			}
		},
		{
			field: '不受理',
			title: zgyswj[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 不受理 
				return resetCount(row.detailList, '1', 5)
			}
		},
		
	]
	var resArr2 = [
		{
			field: '异议数量(次)',
			title: zbwj[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return resetCount(row.detailList, "4", 40)
			}
		},
		{
			field: '正在处理',
			title: zbwj[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 正在处理 
				return resetCount(row.detailList, "4", 41)
			}
		},
		{
			field: '修改文件',
			title: zbwj[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 修改文件 
				return resetCount(row.detailList, "4", 31)
			}
		},
		{
			field: '招标无效',
			title: zbwj[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 招标无效 
				return resetCount(row.detailList, "4", 32)
			}
		},
		{
			field: '投标无效',
			title: zbwj[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 投标无效 
				return resetCount(row.detailList, "4", 33)
			}
		},
		{
			field: '中标无效',
			title: zbwj[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "4", 34)
			}
		},
		{
			field: '未修改文件',
			title: zbwj[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "4", 35)
			}
		},
		{
			field: '未变更结果',
			title: zbwj[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "4", 36)
			}
		},
		{
			field: '驳回(小计)',
			title: zbwj[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 驳回 
				return resetCount2(row.detailList, "4", 35,36,30)
			}
		},
		{
			field: '撤回',
			title: zbwj[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 撤回 
				return resetCount(row.detailList, "4", 8)
			}
		},
		{
			field: '不受理',
			title: zbwj[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 不受理 
				return resetCount(row.detailList, "4", 5)
			}
		},
		
	]
	var resArr3 = [
		{
			field: '异议数量(次)',
			title: kb[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return resetCount(row.detailList, "5", 40)
			}
		},
		{
			field: '正在处理',
			title: kb[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 正在处理 
				return resetCount(row.detailList, "5", 41)
			}
		},
		{
			field: '修改文件',
			title: kb[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 修改文件 
				return resetCount(row.detailList, "5", 31)
			}
		},
		{
			field: '招标无效',
			title: kb[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 招标无效 
				return resetCount(row.detailList, "5", 32)
			}
		},
		{
			field: '投标无效',
			title: kb[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 投标无效 
				return resetCount(row.detailList, "5", 33)
			}
		},
		{
			field: '中标无效',
			title: kb[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "5", 34)
			}
		},
		{
			field: '未修改文件',
			title: kb[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "5", 35)
			}
		},
		{
			field: '未变更结果',
			title: kb[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "5", 36)
			}
		},
		{
			field: '驳回(小计)',
			title: kb[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 驳回 
				return resetCount2(row.detailList, "5", 30,35,36)
			}
		},
		{
			field: '撤回',
			title: kb[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 撤回 
				return resetCount(row.detailList, "5", 8)
			}
		},
		{
			field: '不受理',
			title: kb[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 不受理 
				return resetCount(row.detailList, "5", 5)
			}
		},
	]
	var resArr4 = [
		{
			field: '异议数量(小计)',
			title: zbgs[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return resetCount(row.detailList, "78", 40)
			}
		},
		{
			field: '正在处理',
			title: zbgs[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 正在处理 
				return resetCount(row.detailList, "78", 41)
			}
		},
		{
			field: '修改文件',
			title: zbgs[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 修改文件 
				return resetCount(row.detailList, "78", 31)
			}
		},
		{
			field: '招标无效',
			title: zbgs[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 招标无效 
				return resetCount(row.detailList, "78", 32)
			}
		},
		{
			field: '投标无效',
			title: zbgs[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 投标无效 
				return resetCount(row.detailList, "78", 33)
			}
		},
		{
			field: '中标无效',
			title: zbgs[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "78", 34)
			}
		},
		{
			field: '未修改文件',
			title: zbgs[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "78", 35)
			}
		},
		{
			field: '未变更结果',
			title: zbgs[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "78", 36)
			}
		},
		{
			field: '驳回(小计)',
			title: zbgs[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 驳回 
				return resetCount2(row.detailList, "78", 30,35,36)
			}
		},
		{
			field: '撤回',
			title: zbgs[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 撤回 
				return resetCount(row.detailList, "78", 8)
			}
		},
		{
			field: '不受理',
			title: zbgs[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 不受理 
				return resetCount(row.detailList, "78", 5)
			}
		},
	]

	var resArr5 = [
		{
			field: '异议数量(小计)',
			title: zbgs9[0],
			align: 'center',
			formatter: function (value, row, index) {
				// 异议数量 
				return resetCount(row.detailList, "9", 40)
			}
		},
		{
			field: '正在处理',
			title: zbgs9[1],
			align: 'center',
			formatter: function (value, row, index) {
				// 正在处理 
				return resetCount(row.detailList, "9", 41)
			}
		},
		{
			field: '修改文件',
			title: zbgs9[2],
			align: 'center',
			formatter: function (value, row, index) {
				// 修改文件 
				return resetCount(row.detailList, "9", 31)
			}
		},
		{
			field: '招标无效',
			title: zbgs9[3],
			align: 'center',
			formatter: function (value, row, index) {
				// 招标无效 
				return resetCount(row.detailList, "9", 32)
			}
		},
		{
			field: '投标无效',
			title: zbgs9[4],
			align: 'center',
			formatter: function (value, row, index) {
				// 投标无效 
				return resetCount(row.detailList, "9", 33)
			}
		},
		{
			field: '中标无效',
			title: zbgs9[5],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "9", 34)
			}
		},
		{
			field: '未修改文件',
			title: zbgs9[6],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "9", 35)
			}
		},
		{
			field: '未变更结果',
			title: zbgs9[7],
			align: 'center',
			formatter: function (value, row, index) {
				// 中标无效 
				return resetCount(row.detailList, "9", 36)
			}
		},
		{
			field: '驳回(小计)',
			title: zbgs9[8],
			align: 'center',
			formatter: function (value, row, index) {
				// 驳回 
				return resetCount2(row.detailList, "9", 30,35,36)
			}
		},
		{
			field: '撤回',
			title: zbgs9[9],
			align: 'center',
			formatter: function (value, row, index) {
				// 撤回 
				return resetCount(row.detailList, "9", 8)
			}
		},
		{
			field: '不受理',
			title: zbgs9[10],
			align: 'center',
			formatter: function (value, row, index) {
				// 不受理 
				return resetCount(row.detailList, "9", 5)
			}
		},
	]




	// for(var key in typeObj){
	// 	resArr4.push(
	// 		{
	// 			field: '异议数量',
	// 			title: typeObj[key][0],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 异议数量 
	// 				return resetCount(row.detailList, key, 40)
	// 			}
	// 		},
	// 		{
	// 			field: '修改文件',
	// 			title: typeObj[key][1],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 修改文件 
	// 				return resetCount(row.detailList, key, 31)
	// 			}
	// 		},
	// 		{
	// 			field: '招标无效',
	// 			title: typeObj[key][2],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 招标无效 
	// 				return resetCount(row.detailList, key, 32)
	// 			}
	// 		},
	// 		{
	// 			field: '投标无效',
	// 			title: typeObj[key][3],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 投标无效 
	// 				return resetCount(row.detailList, key, 33)
	// 			}
	// 		},
	// 		{
	// 			field: '中标无效',
	// 			title: typeObj[key][4],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 中标无效 
	// 				return resetCount(row.detailList, key, 34)
	// 			}
	// 		},
	// 		{
	// 			field: '驳回',
	// 			title: typeObj[key][5],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 驳回 
	// 				return resetCount(row.detailList, key, 30)
	// 			}
	// 		},
	// 		{
	// 			field: '不受理',
	// 			title: typeObj[key][6],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 不受理 
	// 				return resetCount(row.detailList, key, 5)
	// 			}
	// 		},
	// 		{
	// 			field: '撤回',
	// 			title: typeObj[key][7],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 撤回 
	// 				return resetCount(row.detailList, key, 8)
	// 			}
	// 		},
	// 		{
	// 			field: '正在处理',
	// 			title: typeObj[key][8],
	// 			align: 'center',
	// 			formatter: function (value, row, index) {
	// 				// 正在处理 
	// 				return resetCount(row.detailList, key, 41)
	// 			}
	// 		},
	// 	)
	// }



	// title设置为返回的总数
	

	resArr.unshift({
		title: "合计",
		valign: "middle",
		align: "center",
		colspan: 7,
		rowspan: 1
	})
	return resArr.concat(resArr1).concat(resArr2).concat(resArr3).concat(resArr4).concat(resArr5);
}


function resetCount(data, objectionType, objectionStatus) {
	var str = '-'
	if(data){
		objectionType = objectionType.toString()
		for (var i = 0; i < data.length; i++) {
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus) {
				str =  data[i].objectionCount;
				break
			}
		}
	}
	return str;
}
function resetCount2(data, objectionType, objectionStatus,objectionStatus2,objectionStatus3) {
	var str = 0;
	if(data){
		objectionType = objectionType.toString()
		for (var i = 0; i < data.length; i++) {
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus) {
				str +=  data[i].objectionCount;
			}
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus2) {
				str +=  data[i].objectionCount;
			}
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus3) {
				str +=  data[i].objectionCount;
			}
		}
	}
	return str===0?"-":str;
}
function resetCount3(data, objectionType, objectionStatus,objectionStatus2,objectionStatus3) {
	var str = 0;
	if(data){
		objectionType = objectionType.toString()
		for (var i = 0; i < data.length; i++) {
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus) {
				str +=  data[i].objectionCount;
			}
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus2) {
				str +=  data[i].objectionCount;
			}
			if (objectionType.indexOf(data[i].objectionType) != -1 && data[i].objectionStatus == objectionStatus3) {
				str +=  data[i].objectionCount;
			}
		}
	}
	return str;
}

function projectSmallTotal(data, objectionStatus) {
	var numCount = 0;
	for (var i = 0; i < data.length; i++) {
		if (data[i].objectionStatus == objectionStatus) {
			numCount +=  data[i].objectionCount;
		}
	}
	return numCount>0?numCount:'-';
}

function projectSmallTotal2(data, objectionStatus,objectionStatus1,objectionStatus2) {
	var numCount = 0;
	for (var i = 0; i < data.length; i++) {
		if (data[i].objectionStatus == objectionStatus || data[i].objectionStatus==objectionStatus1 || data[i].objectionStatus==objectionStatus2) {
			numCount +=  data[i].objectionCount;
		}
	}
	return numCount>0?numCount:'-';
}
/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data) {
	console.log(JSON.stringify(data));
	$("#projectList").bootstrapTable("refresh");
}
