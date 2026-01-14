var getSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/getAuctionPackageBargainResultPageList.do" //议价表格
var saveUrl = top.config.AuctionHost + "/AuctionSfcOfferBargainResultController/updateSupplierBargain"; //保存
var url = window.location.search;
var package_id = $.getUrlParam("packageId")
var sfcStatus = $.getUrlParam("sfcStatus")
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
	if(sfcStatus=='1'){
		$("#btn_save").show();
		$("#btn_submit").show();
		boot=false
		boots=true
		
	}else{
		boot=true
		boots=false
	}	
		
	$("#endTime").html("议价截止时间：" + time)	
	//	listTable()
	initTable()
	//保存
	$("#btn_save").click(function() {
		if(checkForm($("#form"))) {
			saveForm('save')
		}

	})
	//提交
	$("#btn_submit").click(function() {
		parent.layer.confirm("确定拒绝议价", {
			icon: 3,
			title: '询问'
		}, function(index) {
			parent.layer.close(index);
			if(checkForm($("#form"))) {
				saveForm('submit');
			}

		})

	})
	//关闭
	$("#btn_close").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	})
//	getBargain()



});

//将时间按照    年-月-日 时：分：秒   
function getNowFormatDate() {
	var nowTime = new Date();
	var month = nowTime.getMonth() + 1; //一定要+1,表示月份的参数介于 0 到 11 之间。也就是说，如果希望把月设置为 8 月，则参数应该是 7。
	var date = nowTime.getDate();
	var dateMin = nowTime.getMinutes();
	var dateSeconds = nowTime.getSeconds()
	var seperator1 = "-"; //设置成自己想要的年月日格式：年-月-日
	var seperator2 = ":"; //设置成自己想要的时分秒格式：时:分:秒
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(date <= 9) {
		date = "0" + date;
	}
	if(dateMin <= 9) {
		dateMin = "0" + dateMin;
	}
	if(dateSeconds <= 9) {
		dateSeconds = "0" + dateSeconds;
	}
	var currentDate = nowTime.getFullYear() + seperator1 + month + seperator1 + date + " " +
		nowTime.getHours() + seperator2 + dateMin + seperator2 + dateSeconds;
	return currentDate;
}

//function getBargain() {
//	var obj = {
//		packageId: package_id,
//		supplierEnterpriseId: top.enterpriseId
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
//				auctionList = result.data
//				if(auctionList && auctionList.length > 0) {
//					var auctionSfcOfferes = []
//					for(var i = 0; i < auctionList.length; i++) {
//						auctionSfcOfferes = auctionList[i].auctionSfcOfferItemList
//						if(auctionSfcOfferes && auctionSfcOfferes.length > 0) {
//							for(var c = 0; c < auctionSfcOfferes.length; c++) {
//								endTime = auctionSfcOfferes[0].endTime
//								if(endTime){
//									
//									$("#endTime").html("议价截止时间："+endTime)
//								}
//
//								auctionList[i].endTime = auctionSfcOfferes[c].endTime
//								auctionList[i].noTaxRateTotalPrice = auctionSfcOfferes[c].noTaxRateTotalPrice
//
//							}
//						}
//					}
//
//					if(auctionList.length < 500) {
//						listData = auctionList;
//						initTable();
//						$('#PackageList').bootstrapTable("load", listData);
//					} else {
//						var total = auctionList.length;
//						var pageSize = Math.ceil(total / 50)
//						var pageIndex = 1;
//						var start = (pageIndex - 1) * 50
//						var end = start + 50
//						listData = auctionList.slice(start, end)
//						initTable();
//						$('#PackageList').bootstrapTable("load", listData);
//
//						var LockMore = false; //锁定
//						$(window).scroll(function(event) {
//							var supportPageOffset = window.pageXOffset !== undefined;
//							var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
//							var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
//							var wScrollY = y; // 当前滚动条位置  
//							var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）  
//							var bScrollH = document.body.scrollHeight; // 滚动条总高度      
//							if((wScrollY + wInnerH) >= bScrollH) {
//								//触底							
//								if(pageIndex >= pageSize) {
//									// 滚动太快，下标超过了数组的长度
//									pageIndex = pageSize
//									return;
//								} else {
//									pageIndex++
//									start = (pageIndex - 1) * 50
//									end = start + 50;
//									var listTable1 = auctionList.slice(start, end)
//
//									$('#PackageList').bootstrapTable("append", listTable1);
//								}
//
//								if(LockMore) {
//									return false;
//								}
//							}
//						});
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
		supplierEnterpriseId: top.enterpriseId,
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
		],
	});
	//	$('#PackageList').bootstrapTable("load", auctionList);

};


//保存提交
function saveForm(status) {
	var nowData = getNowFormatDate()
	if(NewDate(nowData) > NewDate(time)){
		return parent.layer.alert("已过议价截止时间无法提交，默认该议价已拒绝");
	}
	

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

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}