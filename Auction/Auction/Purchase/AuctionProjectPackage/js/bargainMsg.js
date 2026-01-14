var getSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/getAuctionPackageBargainResultPageList.do" //议价表格
var saveUrl = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/updateSupplierBargain"; //保存
var url = window.location.search;
var package_id = $.getUrlParam("id");
var sfcSuppid = $.getUrlParam("sfcSuppid")
var time = $.getUrlParam("time")
var col; //表头
var boot; //表格显示状态
var boots
var auctionList = [] //议价数据
var listData = []
var textSupplier = []; //供应商	
var bidSupplierId;
var msgloading;
var endTime;
var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();

$(function() {

	//	listTable()
	initTable();
	$("#endTime").html("议价截止时间：" + time)
	//保存

	//关闭
	$("#btn_close").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	})
//	getBargain()

});
//
//function getBargain() {
//	var obj = {
//		packageId: package_id,
//		supplierEnterpriseId: sfcSuppid
//	}
//
//	$.ajax({
//		type: "post",
//		url: getSupplierUrl,
//		dataType: 'json',
//		data: obj,
//		//		async: false,
//		beforeSend: function(xhr) {
//			var token = $.getToken();
//			xhr.setRequestHeader("Token", token);
//			msgloading = parent.layer.load(0, {
//				shade: [0.3, '#000000']
//			});
//		},
//		success: function(result) {
//			if(result.success) {
//				//				listTable();
//				auctionList = result.rows
//				if(auctionList && auctionList.length > 0) {
//					var auctionSfcOfferes = []
//					for(var i = 0; i < auctionList.length; i++) {
//						endTime = auctionList[0].endTime
//						if(endTime) {
//
//							$("#endTime").html("议价截止时间：" + endTime)
//						}
//
//					}
//				}
//			}
//
//		},
//		complete: function() {
//			parent.layer.close(msgloading);
//
//		}
//	})
//}
//设置查询条件
function getQueryParams(params) {
	var QueryParams = {
		pageSize: params.limit, //每页显示的数据条数
		pageNumber: (params.offset / params.limit) + 1, //页码
		offset: params.offset, // SQL语句偏移量
		packageId: package_id,
		supplierEnterpriseId: sfcSuppid,
		enterpriseType: '04', //0为采购人，1为供应商
		tenderType: 1, //0为询价采购，1为竞价采购，2为竞卖


	};
	return QueryParams;
}
//表格初始化
function initTable() {
	$('#PackageList').bootstrapTable({
	url: getSupplierUrl,
	dataType: 'json',
	method: 'get',
	locale: "zh-CN",
	pagination: true, // 是否启用分页
	showPaginationSwitch: false, // 是否显示 数据条数选择框
	pageSize: 15, // 每页的记录行数（*）
	pageNumber: 1, // table初始化时显示的页数
	pageList: [10, 15, 20, 25],
	clickToSelect: true, //是否启用点击选中行
	sidePagination: 'server', // 服务端分页
	silent: true, // 必须设置刷新事件
	queryParams: getQueryParams, //查询条件参数
	classes: 'table table-bordered', // Class样式
	striped: true,
	uniqueId: "packageId",
	columns: [{
		title: "序号",
		align: "center",
		halign: "center",
		width: "50px",
		formatter: function(value, row, index) {
			return index + 1;
		}
	},
	{
		field: "materialModel",
		title: "规格型号",
		align: "left",
		cellStyle: {
			css: {
				"min-width": "200px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
	{
		field: "materialName",
		title: "名称(内容)",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "200px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
	{
		field: "brandOrOriginPlace",
		title: "品牌/产地",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "200px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
	{
		field: "materialUnit",
		title: "单位",
		align: "center",
		halign: "center",

	},
	{
		field: "count",
		title: "数量",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "60px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
//			{
//				field: "budgetPrice",
//				title: "预算价",
//				align: "center",
//				halign: "center",
//
//			},
	{
		field: "hisPrice",
		title: "供应商报价",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "120px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
	{
		field: "curPrice",
		title: "议价",
		align: "center",
		halign: "center",
		cellStyle: {
			css: {
				"min-width": "120px",
				"word-wrap": "break-word",
				"word-break": "break-all",
				"white-space": "normal"
			}
		},

	},
			//			{
			//				field: "bargainResult",
			//				title: "议价",
			//				align: "center",
			//				visible: boots,
			//				cellStyle: {
			//					css: {
			//						"min-width": "120px",
			//						"word-wrap": "break-word",
			//						"word-break": "break-all",
			//						"white-space": "normal"
			//					}
			//				},
			//
			//			},
		],
	});
	//	$('#PackageList').bootstrapTable("load", auctionList);

};

//保存提交
function saveForm(status) {

	if(status == 'save') {
		var bargainStatus = '2'
	} else if(status == 'submit') {
		var bargainStatus = '3'

	}
	//	if(NewDate(nowSysDate) < NewDate(endTime)) {
	//		return parent.layer.alert("已过报价截止时间");
	//	};
	let obj = {
		packageId: package_id,
		supplierEnterpriseId: top.enterpriseId,
		status: bargainStatus,
		endTime: endTime

	}
	$.ajax({
		type: "POST",
		contentType: "application/x-www-form-urlencoded;charset=utf-8", //WebService 会返回Json类型
		url: saveUrl,
		data: obj,
		dataType: 'json',
		error: function() {
			top.layer.alert("加载失败!");
		},
		success: function(response) {
			if(response.success) {
				var dataSource = response.data;
				var index = parent.layer.getFrameIndex(window.name);

				parent.layer.alert("提交成功!");
				parent.layer.close(index);
				top.parent.$("#bargainList").bootstrapTable("refresh");

			} else {
				parent.layer.alert(response.message);
			}
		}
	})

}

function NewDateT(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();

	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1], t[2], 0);
	return date;
}