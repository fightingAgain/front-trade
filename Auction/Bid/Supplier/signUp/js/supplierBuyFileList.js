var searchUrl = config.bidhost + '/OfferController/findSignPageList.do';
var checkPackageItem=config.bidhost +'/CheckController/checkPackageListItem.do' //评审项查询
var examType = "";
var checkType = "";
var tenderTypeCode;
//查询按钮
$(function() {
	/*if(PAGEURL.split("?")[1]!=undefined){
		examType = PAGEURL.split("?")[1].split("=")[1];; //0是询比采购  6是单一来源采购
	}else{
		examType=0
	}*/

	if(PAGEURL.split("?")[1] != undefined && PAGEURL.split("?")[1] != "") {
		if(PAGEURL.split("?")[1].split("=")[0] == "checkType") { //预审后审  或  后审
			checkType = PAGEURL.split("?")[1].split("=")[1]; //1
			examType = 1;
			tenderTypeCode = 0;
		}
		if(PAGEURL.split("?")[1].split("=")[0] == "examType") { //预审
			examType = PAGEURL.split("?")[1].split("=")[1]; //1
		}
		if(PAGEURL.split("?")[1].split("=")[0] == "tenderType") { //后审
			examType = 1; //1
			checkType = 1;
			tenderTypeCode = PAGEURL.split("?")[1].split("=")[1];
		}
	} else { //预审
		examType = 0
		tenderTypeCode = 0
	}

	//查询按钮
	$("#btnSearch").on('click', function() {
		$('#signBuyFileList').bootstrapTable('refresh');
	});

	initTable();

});

//设置查询条件
function getQueryParams(params) {
	var File = {
		'pageSize': params.limit, //每页显示的数据条数
		'pageNumber': (params.offset / params.limit) + 1, //页码
		'projectName': $("#projectName").val(), //采购项目名称
		//projectCode: $("#projectCode").val(), //采购项目编号
		'packageName': $("#packageName").val(), //采购包件名称
		'isOffer': 1,
		// 'tenderType': tenderTypeCode
			//packageNum: $("#packageNum").val(), //采购包件编号
			//checkState: $("#checkState").val(), //审核状态
			//fileState: $("#fileState").val(), //递交状态

	};

	if(examType == 1) {
		File.examType = 1;
	} else {
		File.examType = 0;
	}

	if(checkType != "") {
		File.checkType = 1;
	}
	return File;
}
var msg;
var rowData;
var rowExamType;
window.operateEvents = { //添加一个按钮对应的事件
	"click #btnShow": function(e, value, row, index) {
		var status = examType == 0 ? (row.examStatus || 0): (row.status || 0);
		rowData=row;
		rowExamType=row.examType
		//验证文件和评审项
		newValidate(null,row.projectId,row.id,examType,1);
	}
}

function AddFunction(value, row, index) { //把需要创建的按钮封装到函数中
	//sessionStorage.setItem('purchaseInfo',JSON.stringify(row));
	if(examType == 0) {
		//预审  判断是否需要出售文件 
		if(row.isSellFile == 0) {
			//出售 已交费
			if(row.examStatus == 3) {
				return [
					'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
				].join("")
			} else { 
				if(row.examProjectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
					return [
						'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
					].join("")
				}else{
					//未交费
					return [
						'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>购买</a>&nbsp;&nbsp;',
					].join("")
				}
			}
		} else {
			//不出售
			return [
				'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
			].join("")
		}
	} else {
		//预售后审 
		if(row.examType == 0) { //出售 未交费
			if(row.isSellPriceFile == 0) {
				//出售 已交费
				if(row.status == 3) {
					return [
						'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
					].join("")
				} else { 
					if(row.projectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
						return [
							'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
						].join("")
					}else{
						//未交费
						return [
							'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>购买</a>&nbsp;&nbsp;',
						].join("")
					}
				}
			} else {
				//不出售
				return [
					'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
				].join("")
			}
		} else {
			//后审
			if(row.isSellFile == 0) {
				//出售 已交费
				if(row.status == 3) {
					return [
						'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
					].join("")
				} else { 
					if(row.projectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
						return [
							'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
						].join("")
					}else{
						//未交费
						return [
							'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>购买</a>&nbsp;&nbsp;',
						].join("")
					}
				}
			} else {
				//不出售
				return [
					'<a href="javascript:void(0)" id="btnShow" class="btn-sm btn-warning" style="text-decoration:none" ><span class="glyphicon glyphicon-download" aria-hidden="true"></span>下载</a>&nbsp;&nbsp;',
				].join("")
			}
		}

	}
}

function initTable() {
	$("#signBuyFileList").bootstrapTable({
		url: searchUrl,
		dataType: 'json',
		method: 'get',
		locale: "zh-CN",
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		clickToSelect: true, //是否启用点击选中行
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		queryParams: getQueryParams, //查询条件参数
		striped: true,
		//uniqueId: "packageId",
		columns: [{
			field: 'xh',
			title: '序号',
			width: '50',
			align: 'center',
			formatter: function(value, row, index) {
				var pageSize = $('#signFileList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#signFileList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180'
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(row.isPublic > 1) {
					if(row.packageSource == 1) {
						return value + '<span class="text-danger">(重新采购)</span><span class="text-danger">(邀请)</span>'
					} else if(row.packageSource == 0) {
						return value + '<span class="text-danger">(邀请)</span>'
					}

				} else {
					if(row.packageSource == 1) {
						return value + '<span class="text-danger">(重新采购)</span>'
					} else if(row.projectSource == 0) {
						return value
					}
				}							
			}
		}, {
			field: 'status',
			title: '购买情况',
			align: 'center',
			width: '180',
			formatter: function(value, row, index) {
				if(examType == 0) {
					//资格预审文件是否发售   是
					if(row.isSellFile == 0) {
						if(row.examStatus == 3) { //已缴费
							return '<span class="text-success">已购买</span>';
						} else {
							if(row.examProjectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
								return '<span class="text-success">无需购买</span>';
							}else{
								//未缴费
								return '<span style="color:red">未购买</span>';
							}
						}
					} else { //无需购买
						return '<span class="text-success">无需购买</span>';
					}
				} else {
					//预售后审 
					if(row.examType == 0) { //出售 未交费
						if(row.isSellPriceFile == 0) {
							//出售 已交费
							if(row.status == 3) {
								return '<span class="text-success">已购买</span>';
							} else {
								if(row.projectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
									return '<span class="text-success">无需购买</span>';
								}else{
									//未缴费
									return '<span style="color:red">未购买</span>';
								}
							}
						} else {
							//不出售
							return '<span class="text-success">无需购买</span>';
						}
					} else {
						//后审
						if(row.isSellFile == 0) {
							//出售 已交费
							if(row.status == 3) {
								return '<span class="text-success">已购买</span>';
							} else { 
								if(row.projectPrice == 0){//费用金额设置为0，无订单创建，无需缴费
									return '<span class="text-success">无需购买</span>';
								}else{
									//未缴费
									return '<span style="color:red">未购买</span>';
								}
							}
						} else {
							//不出售
							return '<span class="text-success">无需购买</span>';
						}
					}
				}
			}
		}, {
			field: 'action',
			title: '操作',
			align: 'center',
			width: '120',
			formatter: AddFunction, //表格中添加按钮
			events: operateEvents, //给按钮注册事件
		}]
	});

}
function openOrder(flag,packageId,uid){
	//生成报名费订单
	layer.open({
		type: 2,
		title: examType == 0 ? '资格预审文件下载' : '采购文件下载',
		area: ['1100px','600px'],
		id:'downfiles',
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: 'Auction/common/Supplier/signUp/fileDownLoad.html?examType=' + rowExamType + '&checkType=' + checkType + '&fileType=' + examType + '&status=' + status+'&packageId='+rowData.id,
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.tableShow();

		}
	});		
}