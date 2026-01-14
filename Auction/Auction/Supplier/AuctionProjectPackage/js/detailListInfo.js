var data1, packageId = location.hash.substr(1),
	curStage, auctionTimes, filesDataDetail, filesData,
	dataDetail = [],
	offerStatus, createrTime;
var saveImgUrl = top.config.AuctionHost + "/PurFileController/save.do"; //保存附件
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var deleteFileUrl = top.config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息
var submitUrl = top.config.AuctionHost + '/AuctionSfcOfferController/auctionSpecificationOffer.do'; //提交
var recallUrl = top.config.AuctionHost + '/AuctionSfcOfferController/deleteAllCurrentEmpSfcOffer.do'; //撤回
//var getTableUrl = top.config.AuctionHost + '/AuctionSfcOfferController/getAuctionOfferList.do'; //清单报价表格
var getTableUrl = top.config.AuctionHost + '/AuctionSfcOfferController/getCurrentEnterpriseAuctionOfferList.do';
var auctionEndDate;
var boots;
var bootstr;
var fileId;
var fileTime;
var path;
var msgloading;
var listTable = [];
var total;
var pageSize;
var pageIndex;
var start;
var end;
var isDfcm = false;//是否东风传媒自主采购项目
var gzFile = [], otherFile = [];
$.ajax({
	url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionDetail.do',
	data: {
		id: packageId
	},
	async: false,
	success: function(res) {
		if(res.success) {
			data1 = res.data;
			auctionEndDate = res.data.auctionEndDate;

			if(data1.budgetIsShow == '1') {
				boots = true
			} else {
				boots = false
			}

			//			auctionTimes = [data1.firstAuctionTime, data1.secondAuctionTime, data1.thirdAuctionTime];
			//			curStage = data1.stage;

			$("#packageNum").html(data1.packageNum)
			$("#packageName").html(data1.packageName)
			if (data1.projectSource > 0) {
				$("#packageName").html(data1.packageName + '<span class="red">(重新竞价)</span>');
			}
			$("#projectCode").html(data1.projectCode)
			$("#projectName").html(data1.projectName)
			$("#endTime").html("(竞价截止时间：" + auctionEndDate + "）")

		} else top.layer.alert(res.message);
	}
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

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1], t[2], 0);
	return date.getTime();
}

$(function() {
	//	清单竞价
	//	filesDataView()
	// initTableList();
	//	if(filesDataDetail.length > 0) {
	isDfcm = checkPurchaserAgent(packageId);
	getTableList();
	//	}
	view_info()

	var oFileInput = new FileInput();
	//清单报价附件初始化
	oFileInput.Init("detailedList", urlSaveAuctionFile, "filesData", "JJ_AUCTION_SFC_OFFER");
	oFileInput.Init("detailedgzList", urlSaveAuctionFile, "filetable", "JJ_AUCTION_SFC_SIGNATURES");
	oFileInput.Init("otherFileList", urlSaveAuctionFile, "filetable", "JJ_AUCTION_SFC_SIGNATURE");

})

//关闭
$("#btn_close").click(function() {
	top.layer.closeAll();

})

//上传附件
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(FileName, uploadUrl, filetable, type) {
//		if(FileName != "otherFileList"){
			filesDataView(FileName, filetable, type);
//		}
		$("#" + FileName).fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx', 'xls'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮
			showCaption: false, //是否显示标题
			//showCaption: false, //是否显示标题
			browseClass: "btn btn-primary", //按钮样式
			dropZoneEnabled: false, //是否显示拖拽区域
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview: false,
			showRemove: false,
			layoutTemplates: {
				actionDelete: "",
				actionUpload: ""
			}

		}).on("filebatchselected", function(event, files) {
			if(event.currentTarget.files.length > 1) {
				parent.layer.alert('单次上传文件数只能为1个');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
			if(event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024 * 1024) {
				parent.layer.alert('上传的文件不能大于2G');
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			};
			$(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {

			path = data.response.data[0];
			var nowData = getNowFormatDate();
           /* var nowDatas = new Date(nowData).getTime() / 1000;
            var endtime = new Date(auctionEndDate).getTime() / 1000;*/
            var nowDatas  = new Date(Date.parse(nowData.replace(/-/g,"/"))).getTime()/ 1000;
            var endtime  = new Date(Date.parse(auctionEndDate.replace(/-/g,"/"))).getTime()/ 1000;
			if(Number(endtime) < Number(nowDatas)) {
				return top.layer.alert('已过竞价截止时间无法上传附件');
			}
			$.ajax({
				type: "post",
				url: saveImgUrl,
				async: true,
				data: {
					'modelId': data1.id,
					'modelName': type,
					'fileName': data.files[0].name,
					'fileSize': data.files[0].size / 1000 + "KB",
					'filePath': data.response.data[0]
				},
				datatype: 'json',
				success: function(data) {
					if(data.success == true) {
						if(FileName == 'detailedList') {

							upDetail('0')
						} else {

							filesDataView(FileName, filetable, type);
						}

					}
				}

			});

		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function filesDataView(name, filetable, type, str) {

	var tr = "";
	var file = "";
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'modelId': packageId,
			'modelName': type,
			'employeeId': top.userId

		},
		datatype: 'json',
		success: function(data) {
			var flieData = data.data;
			var flieDatas = [];
			var timeArr = [];
			if(data.success == true) {
				if(type == "JJ_AUCTION_SFC_OFFER") {
					if(str == "ch") {
						flieDatas = [];
					}else if(str=="error"){
						flieDatas = [];
					} else {									
						if(dataDetail.length == '0') {
							flieDatas = [];
							for(var e = 0; e < flieData.length; e++) {
								if(path) {
									if(flieData[e].filePath == path) {
										fileId = flieData[e].id;
										fileTime = flieData[e].subDate;

									}
								}
							}
						} else {							
							for(var e = 0; e < flieData.length; e++) {
								if(path) {
									if(flieData[e].filePath == path) {
										fileId = flieData[e].id;
										fileTime = flieData[e].subDate;
									}
								}
								/*var subDate = new Date(flieData[e].subDate).getTime() / 1000;*/
                                var subDate  = new Date(Date.parse(flieData[e].subDate.replace(/-/g,"/"))).getTime()/ 1000;
								timeArr.push({
									time: subDate,
									subDate: flieData[e].subDate,
									filesName: flieData[e].fileName,
									filesPath: flieData[e].filePath,
									fileSize: flieData[e].fileSize
								})
							}
							if(timeArr&&timeArr.length>0){								
								var max = timeArr[0].time;
								for(var t = 0; t < timeArr.length; t++) {
									var cur = timeArr[t].time;
									cur > max ? max = cur : null
								}
								for(var e = 0; e < timeArr.length; e++) {
									if(max == timeArr[e].time) {
										flieDatas.push({
											fileName: timeArr[e].filesName,
											filePath: timeArr[e].filesPath,
											subDate: timeArr[e].subDate,
											fileSize: flieData[e].fileSize,
											id: flieData[e].id,
											modelName: flieData[e].modelName
										})

									}
								}
							}
						}

					}
					//					}

					//					if(flieData && flieData.length > 0) {
					//						for(var e = 0; e < flieData.length; e++) {
					//							if(path) {
					//								if(flieData[e].filePath == path) {
					//									fileId = flieData[e].id
					//									fileTime = flieData[e].subDate
					//
					//								}
					//							}
					//						}
					//					}
					bootstr = true;
					filesDataDetail = flieDatas;
					//					initFileTable(name, filetable)
				} else if(type == "JJ_AUCTION_SFC_SIGNATURES"){
					bootstr = false;
					gzFile = flieData;
					
					//					initFileTable(name, filetable)
				} else if(type == "JJ_AUCTION_SFC_SIGNATURE"){
					otherFile = flieData;
				}
				filesData = gzFile.concat(otherFile);
				//				filesDataDetail = flieData
				//				initFileTable(name, filetable)

			}
		}
	});
	$('#' + filetable).bootstrapTable({
		pagination: false,
		undefinedText: "",
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
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left"

			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width: '100px'

			},
			{
				field: "subDate",
				title: "报价时间",
				align: "center",
				halign: "center",
				width: '150px',
				visible: bootstr

			},
			{
				field: "#",
				title: "操作",
				halign: "center",
				width: '120px',
				align: "center",
				events: {
					'click .openAccessory': function(e, value, row, index) {
						var url = top.config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
						window.location.href = $.parserUrlForToken(url);
					}
				},
				formatter: function(value, row, index) {
					var dels = '<button  class="btn btn-sm btn-danger" onclick=fileDetel(' + index + ',\"' + row.id + '\",\"' + row.modelName + '\")>删除</button>';
					var dowload = '<button  class="btn btn-sm btn-primary openAccessory">下载</button>';
					if(type == 'JJ_AUCTION_SFC_OFFER') {
						if(offerStatus == '1') {
							return dowload
						} else if(offerStatus == '0') {
						/*	var creater_time = new Date(createrTime).Format("yyyy-MM-dd hh:mm");
							var sub_date = new Date(row.subDate).Format("yyyy-MM-dd hh:mm");*/
								return dowload + dels;
//							if(path) {
//								if(path == row.filePath) {
//									return dowload + dels
//								} else {
//									return dowload
//								}
//							} else {
//								if(NewDate(creater_time) == NewDate(sub_date)) {
//									return dowload + dels
//								} else {
//									return dowload
//								}

//							}

						} else if(offerStatus == undefined) {
							return dowload
						}
					} else {
						if(data1.isEnd || offerStatus == '1'){
							return dowload
						}else{
							return dowload + dels
						}
					}

				}

			}
		]
	});
	if(type == 'JJ_AUCTION_SFC_OFFER') {
		$('#' + filetable).bootstrapTable("load", filesDataDetail);
	} else {
		$('#' + filetable).bootstrapTable("load", filesData);
	}

};
//附件列表
//function initFileTable(name, filetable) {
//	console.log(filesDataDetail)
//
//	if(type=="JJ_AUCTION_SFC_OFFER"){
//		console.log(123)
//		$('#' + filetable).bootstrapTable("load", filesDataDetail);
//	}else{
//		
//	}
//
////	$('#' + filetable).bootstrapTable("load", filesDataDetail);
//
//}

//报价信息
function initTableList() {
	if(dataDetail.length > 9) {
		var height = "400"
	} else {
		var height = ""
	}
	$('#detaillist_operation_table').bootstrapTable({
		pagination: false,
		undefinedText: "",
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
				field: "materialNum",
				title: "物料号",
				align: "left",
				visible: isDfcm?false:true,
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "materialName",
				title: isDfcm?"物料名称":"名称",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "materialModel",
				title: "规格型号",
				align: "center",
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			}, {
				field: 'workmanship',
				title: '材料工艺',
				visible: isDfcm?true:false,
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}
			},
			{
				field: "brandOrOriginPlace",
				title: "品牌/产地",
				align: "center",
				halign: "center",
				visible: isDfcm?false:true,
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "applyNum",
				title: "申请号",
				align: "center",
				visible: isDfcm?false:true,
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			
			{
				field: "materialUnit",
				title: "单位",
				align: "center",
				halign: "center"

			},
			{
				field: "count",
				title: "数量",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "70px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},			
			{
				field: "way",
				title: "方式",
				visible: isDfcm?true:false,
				align: "center",
				/* formatter: function (value, row, index) {
					//1  购买、2 租赁、3制作
					if(value == '1'){
						return '购买'
					}else if(value == '2'){
						return '租赁'
					}else if(value == '3'){
						return '制作'
					}else{
						return '-'
					}
				} */
			},
			{
				field: "budgetPrice",
				title: "预算价",
				align: "center",
				halign: "center",
				visible: boots,
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "deliveryDate",
				title: "要求交货期(订单后xx天)",
				align: "center",
				halign: "center",
				visible: isDfcm?false:true,
				cellStyle: {
					css: {
						"min-width": "100px",
						"white-space": "nowrap"
					}
				},
				/* formatter: function(value, row, index) {
					if(value) {
						return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");
						
					} 

				} */

			},
			/* {
				field: 'detailedContent',
				title: "补充说明",
				align: 'left',
				visible: isDfcm?true:false,
				cellStyle: {
					css: {
						"min-width": "150px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}
			},		 */	
			{
				field: "taxRate",
				title: "税率%",
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
				formatter: function(value, row, index) {
					if(value) {
						return  parseFloat(value) + "%"
					}
				}
			},
			
			{
				field: "noTaxRateUnitPrice",
				title: "不含税单价",
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
                formatter: function(value, row, index) {
                    if(value) {
                        return  parseFloat(value);
                    }
                }
			},
			{
				field: "noTaxRateTotalPrice",
				title: "不含税总价",
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
				field: "taxRateUnitPrice",
				title: "含税单价",
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
                formatter: function(value, row, index) {
                    if(value) {
                        return  parseFloat(value);
                    }
                }
			},
			{
				field: "taxRateTotalPrice",
				title: "含税总价",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "120px",
						"word-wrap": "break-word",
						"word-break": "break-all",
						"white-space": "normal"
					}
				}

			},
			{
				field: "answerDeliveryDate",
				title: "响应交货期(订单后xx天)",
				align: "center",
				halign: "center",
				visible: isDfcm?false:true,
				cellStyle: {
					css: {
						"min-width": "100px",
						"white-space": "nowrap"
					}
				},
				/* formatter: function(value, row, index) {
					if(value) {
						return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");
						
					} 

				} */

			},
			{
				field: "remark",
				title: "备注",
				align: "center",
				halign: "center",
				cellStyle: {
					css: {
						"min-width": "150px",
						"white-space": "nowrap"
					}
				}
			}
		],
		height:height,
		onAll:function(){
			if(dataDetail.length > 2500) {
				$("#detaillist_operation_table").parent(".fixed-table-body").scroll(function(event) {
					var y =$(this).scrollTop();
					var wScrollY = y; // 当前滚动条位置  
					var wInnerH = $(this)[0].clientHeight; // 设备窗口的高度（不会变）  
					var bScrollH = $(this)[0].scrollHeight; // 滚动条总高度 
					var LockMore = false;    
					if (wScrollY + wInnerH >= bScrollH) {
						//触底							
						if (pageIndex >= pageSize) {
							// 滚动太快，下标超过了数组的长度
							pageIndex = pageSize;
							return;
						} else {
							pageIndex++;
							start = (pageIndex - 1) * 100;
							end = start + 100;
							var listTable1 = dataDetail.slice(start, end);

							$('#detaillist_operation_table').bootstrapTable("append", listTable1);
						}
						if (LockMore) {
							return false;
						}
					}
				})
			}
		}
	});

}

//删除附件
function fileDetel(i, uid, modelName) {
	var nowData = getNowFormatDate();
    var nowDatas  = new Date(Date.parse(nowData.replace(/-/g,"/"))).getTime()/ 1000;
    var endtime  = new Date(Date.parse(auctionEndDate.replace(/-/g,"/"))).getTime()/ 1000;
	if(Number(endtime) < Number(nowDatas)) {
		return top.layer.alert('已过竞价截止时间无法删除');
	}
	parent.layer.confirm('确定要删除该附件', {
		btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
		// 附件 清单总监附件
		if(modelName == 'JJ_AUCTION_SFC_OFFER') {
			filesDataDetail.splice(i, 1);
		} else {
			//递交采购文件附件
			filesData.splice(i, 1);
		}
		if(uid.length == 32) {
			$.ajax({
				type: "post",
				url: deleteFileUrl,
				dataType: 'json',
				data: {
					"id": uid
				},
				success: function(data) {
					//					filesDataView();
					//					initFileTable();
					if(modelName == 'JJ_AUCTION_SFC_OFFER') {
						filesDataView('detailedList', "filesData", 'JJ_AUCTION_SFC_OFFER');
						recall('del')
					} else if(modelName == 'JJ_AUCTION_SFC_SIGNATURES'){
						filesDataView("detailedgzList", "filetable", "JJ_AUCTION_SFC_SIGNATURES");
						
					} else {
						filesDataView("detailedList", "filetable", "JJ_AUCTION_SFC_SIGNATURE");
					}

					parent.layer.close(index);
				}
			});
		}

	}, function(index) {
		parent.layer.close(index)
	});

}

//按钮及上传控件显示
function view_info() {
	if(!data1.isEnd) {
		//		提交状态
		if(offerStatus == '1') {
			if(dataDetail.length > 0) {
				$("#btnClose").show();
				$("#btnSumit").hide();
				$(".detailed_list").hide()
			} else {
				$(".detailed_list").show();
				$("#btnClose").hide();
				$("#btnSumit").hide();
			}
		} else if(offerStatus == '0') {
			if(dataDetail.length > 0) {
				$("#btnClose").show();
				$("#btnSumit").show();
				$(".detailed_list").hide()
			} else {
				$(".detailed_list").show();
				$("#btnClose").hide();
				$("#btnSumit").hide();
			}
		}
	} else if(data1.isEnd == '1') {
		$("#filesOthers").hide();
		$(".detailed_list").hide();
		$("#btnClose").hide();
		$("#btnSumit").hide();
	}

}

//清单报价附件提交
function upDetail(status) {
	var obj = {
		packageId: packageId,
		auctionType: data1.auctionType,
		auctionModel: data1.auctionModel,
		sfcOfferStatus: status
	};
	$.ajax({
		url: submitUrl,
		data: obj,
		//		async: false,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			//			msgloading = top.layer.msg('数据加载中', {icon: 0});
			msgloading = parent.layer.load(0, {
				shade: [0.3, '#000000']
			});
		},
		success: function(res) {
			if(res.success) {
				if(status == '1') {
					offerStatus = '1';
					top.layer.alert('报价成功');
					location.reload();
				} else {
					offerStatus = '0';
					getTableList();
					view_info();

				}

				filesDataView('detailedList', "filesData", 'JJ_AUCTION_SFC_OFFER');
				view_info();
			} else {
				filesDataView('detailedList', "filesData", 'JJ_AUCTION_SFC_OFFER');
				top.layer.alert(res.message);
				$.ajax({
					type: "post",
					url: deleteFileUrl,
					async: false,
					dataType: 'json',
					data: {
						"id": fileId
					},
					success: function(data) {
						filesDataView('detailedList', "filesData", 'JJ_AUCTION_SFC_OFFER','error');

					}

				});

			}
		},
		complete: function() {
			parent.layer.close(msgloading);

		}

	});
}

//提交
function btnSumit() {
	var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//	var nowData = getNowFormatDate();
/*	var nowDatas = new Date(nowSysDate).getTime() / 1000;
	var endtime = new Date(auctionEndDate).getTime() / 1000;*/
    var nowDatas  = new Date(Date.parse(nowSysDate.replace(/-/g,"/"))).getTime()/ 1000;
    var endtime  = new Date(Date.parse(auctionEndDate.replace(/-/g,"/"))).getTime()/ 1000;
	//	console.log(nowSysDate)
	//	console.log(Number(endtime) < Number(nowDatas))
	
	if(gzFile.length == 0){
		top.layer.alert("请上传盖章版报价文件");
		return;
	}
	
	if(Number(endtime) < Number(nowDatas)) {
		return top.layer.alert('已过竞价截止时间无法提交');
	} else {
		upDetail('1');
	}
}
//清单附件详情表格
function getTableList() {
	$.ajax({
		url: getTableUrl,
		data: {
			packageId: packageId
		},
		async: false,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = top.layer.msg('数据加载中', {
				icon: 0
			});
			//			msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
		},
		success: function(res) {
			if(res.success) {
				dataDetail = res.data;
				if(dataDetail.length < 500) {
					listTable = dataDetail;
					initTableList();
					$('#detaillist_operation_table').bootstrapTable("load", listTable);

				} else {
					total = dataDetail.length;
					pageSize = Math.ceil(total / 100);
					pageIndex = 1;
					start = (pageIndex - 1) * 100;
					end = start + 100;
					listTable = dataDetail.slice(start, end);
					initTableList();
					$('#detaillist_operation_table').bootstrapTable("load", listTable);

					// var LockMore = false; //锁定
					// $(window).scroll(function(event) {
					// 	var supportPageOffset = window.pageXOffset !== undefined;
					// 	var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
					// 	//						var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
					// 	var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
					// 	var wScrollY = y; // 当前滚动条位置  
					// 	var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）  
					// 	var bScrollH = document.body.scrollHeight; // 滚动条总高度      
					// 	if(wScrollY + wInnerH >= bScrollH) {
					// 		//触底							
					// 		if(pageIndex >= pageSize) {
					// 			// 滚动太快，下标超过了数组的长度
					// 			pageIndex = pageSize
					// 			return;
					// 		} else {
					// 			pageIndex++
					// 			start = (pageIndex - 1) * 500
					// 			end = start + 500;
					// 			var listTable1 = dataDetail.slice(start, end)

					// 			$('#detaillist_operation_table').bootstrapTable("append", listTable1);
					// 		}

					// 		if(LockMore) {
					// 			return false;
					// 		}
					// 	}
					// });
				}

				if(dataDetail && dataDetail.length > 0) {
					offerStatus = dataDetail[0].sfcOfferStatus;
					if(offerStatus == '0') {

						createrTime = dataDetail[0].createrTime;
					}
				}

				//				filesDataView();
				//				$('#filesData').bootstrapTable("load", filesDataDetail);
				view_info();

			}
		},
		complete: function() {
			parent.layer.close(msgloading);

		}
	});

}

function GetScrollPositions() {
	if('pageXOffset' in window) { // all browsers, except IE before version 9
		var scrollLeft = window.pageXOffset;
		var scrollTop = window.pageYOffset;
	} else { // Internet Explorer before version 9
		var zoomFactor = GetZoomFactor();
		var scrollLeft = Math.round(document.documentElement.scrollLeft / zoomFactor);
		var scrollTop = Math.round(document.documentElement.scrollTop / zoomFactor);
	}
	alert("The current horizontal scroll amount: " + scrollLeft + "px");
	alert("The current vertical scroll amount: " + scrollTop + "px");
}

//撤回
function btnClose() {
	var nowSysDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//	var nowData = getNowFormatDate();
	/*alert(nowSysDate +"====="+auctionEndDate);*/
	/*var nowDatas = new Date(nowSysDate).getTime() / 1000;
	var endtime = new Date(auctionEndDate).getTime() / 1000;*/
    var nowDatas  = new Date(Date.parse(nowSysDate.replace(/-/g,"/"))).getTime()/ 1000;
    var endtime  = new Date(Date.parse(auctionEndDate.replace(/-/g,"/"))).getTime()/ 1000;
	if(filesDataDetail.length > 0) {
		if(Number(endtime) < Number(nowDatas)) {
			return top.layer.alert('已过竞价截止时间无法撤回');
		} else {

			recall()
		}

	}
}

function recall(str) {
	$.ajax({
		url: recallUrl,
		data: {
			packageId: packageId
		},
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			msgloading = parent.layer.load(0, {
				shade: [0.3, '#000000']
			});
		},
		success: function(res) {
			if(res.success) {
				if(str == 'del') {
					top.layer.alert('删除成功');

				} else {

					top.layer.alert('撤回成功');
					location.reload();

					
				}
				listTable = [];
				$(".detailed_list").show();
				$("#btnClose").hide();
				$("#btnSumit").hide();
				$('#detaillist_operation_table').bootstrapTable("load", listTable);
				filesDataView('detailedList', "filesData", 'JJ_AUCTION_SFC_OFFER', "ch")
			} else top.layer.alert(res.message);
		},
		complete: function() {
			parent.layer.close(msgloading);

		}
	});
}