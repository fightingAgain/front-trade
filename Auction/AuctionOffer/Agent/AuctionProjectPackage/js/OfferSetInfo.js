var urlSuperviseInfo = config.AuctionHost + '/AuctionSuperviseController/findAuctionSupervise.do';
var urlSaveSupervise = config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var urlfindBidFileDownload = config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
var urlDownloadAuctionFile = config.FileHost + "/FileController/download.do"; //下载竞价文件地址
//是否需要监督字段
var IsSupervise = "0";
var projectId = "";
var packageId = "";
var employeeId = "";
var tenderType = '1';
//页面初始化
function OfferSetInfo(obj) {
	$("#projectCode").html(obj.projectCode);
	$("#projectName").html(obj.projectName);
	$("#packageNum").html(obj.packageNum);
	$("#packageName").html(obj.packageName);
	$("#auctionStartDate").html(obj.auctionStartDate);
	$("#auctionEndDate").html(obj.auctionEndDate);
	projectId = obj.projectId;
	packageId = obj.id;
	getSuperviseInfo();
	//竞价文件提交信息列表
	getOfferFileInfo(projectId);
	setPurchaseFileDownloadDetail(packageId)
}

//查询监督人详情数据
function getSuperviseInfo() {
	$.ajax({
		type: "post",
		url: urlSuperviseInfo,
		data: {
			projectId: projectId,
			packageId: packageId
		},
		async: false,
		dataType: "json",
		success: function(ret) {
			if(ret.success) {
				if(typeof(ret.data) != "undefined") {
					IsSupervise = ret.data.isSupervise;
					$('input:radio[name=isSupervise][value=' + IsSupervise + ']').attr('checked', 'true');
					if(IsSupervise == 0) {
						$("#Supervise").hide();
						$("#SuperviseInfo").hide();
					} else {
						employeeId = ret.data.superviseId;
						$("#Supervise").show();
						$("#SuperviseInfo").show();
						createSuperviseList(ret.data);
					}
				}
			}
		}
	});
}

//选择是否监督
function Is_Supervise(value) {
	if(value == 1) {
		//是
		$("#Supervise").show();
		$("#SuperviseInfo").show();

	} else {
		//否
		$("#Supervise").hide();
		$("#SuperviseInfo").hide();
	}
	IsSupervise = value;
};

//添加监督人弹出层
function add() {
	var param = {
		isSupervise: 1, //是否监督，0为否，1为是
		selectBox: 'radio' //单选或多选，默认为多选
	}
	sessionStorage.setItem("param", JSON.stringify(param));
	top.layer.open({
		type: 2,
		title: '选择监督人',
		area: ['900px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		btn: ['确定', '取消'],
		content: 'view/projectType/getEmployee.html',
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.getMsg(projectId, tenderType);
		},
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var employeeData = iframeWin.callbackEmployee();
			if(!employeeData) return;
			employeeId = employeeData[0].id;
			createSuperviseList(employeeData[0]);
			top.layer.close(index);
		},

	});
}

function createSuperviseList(SuperviseData) {
	$("#SuperviseList").html("");
	var strHtml = "<tr>";
	strHtml += "<td class='text-center'>1</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.userName + "</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.logCode + "</td>";
	strHtml += "<td class='text-center'>" + SuperviseData.tel + "</td>";
	if(typeof(SuperviseData.email) != "undefined") {
		strHtml += "<td>" + SuperviseData.email + "</td>";
	} else {
		strHtml += "<td></td>";
	}
	strHtml += "</tr>";
	$("#SuperviseList").html(strHtml);
}

$("#btnSave").click(function() {
	if(IsSupervise == 1 && employeeId == "") {
		parent.layer.alert("请选择监督人！");
		return;
	}
	if(IsSupervise == 0) {
		employeeId = "";
	}
	var data = {
		projectId: projectId,
		packageId: packageId,
		isSupervise: IsSupervise,
		superviseId: employeeId,
		checkState: IsSupervise
	}

	$.ajax({
		type: "post",
		url: urlSaveSupervise,
		data: data,
		async: false,
		dataType: "json",
		success: function(ret) {
			if(ret.success) {
				//parent.layer.alert("保存成功！");
				parent.$('#OfferList').bootstrapTable('refresh');
				top.layer.closeAll();
			} else {
				parent.layer.alert("保存失败！");
				return;
			}
		}
	});
});

$("#btnClose").click(function() {
	top.layer.closeAll();
});

function getOfferFileInfo(projectId) {
	$.ajax({
		type: "get",
		url: top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do",
		dataType: 'json',
		data: {
			projectId: projectId
		},
		async: true,
		success: function(result) {
			if(result.success) {
				loadAuctionFileCheckState(result.data);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}
function loadAuctionFileCheckState(data) {

	$("#AuctionFileCheck").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "5%",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "enterpriseName",
				halign: "left",
				title: "供应商"
			},
			{
				halign: "center",
				title: "竞价文件",
				cellStyle: {
					css: {
						"padding": "0px"
					}
				},
				formatter: function(value, row, index) {
					var fileNameArr = row.fileName.split(","); //文件名数组
					var filePathArr = row.filePath.split(",");
					var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
					var html = "<table class='table' style='border-bottom:none'>";
					for(var j = 0; j < filePathArr.length; j++) {
						html += "<tr>";
						html += "<td>" + fileNameArr[j] + "</td>"
						html += "<td  width='100px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;"
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
							html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
						}
						html += "</span></td></tr>";
					}
					html += "</table>";
					return html;
				}
			},
			{
				title: "审核状态",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'>合格</div>";
					} else if(row.checkState == 0) {
						return "<div class='text-warning'>未审核</div>";
					} else {
						return "<div class='text-danger'>不合格</div>";
					}
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", data);
}

//预览文件
function previewFile(filePath) {
	openPreview(filePath);
}

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//挂载采购文件下载记录请求
function setPurchaseFileDownloadDetail(uid) {
	console.log(uid)
	$.ajax({
		type: "get",
		url: urlfindBidFileDownload,
		dataType: 'json',
		data:{
			"packageId":uid
		},
		async: true,
		success: function(result) {
			if(result.success) {
				setPurchaseFileDownloadDetailHTML(result.data) //有记录显示
			} else {
				//top.layer.alert(result.message);
			}
		}
	})
}
//挂载采购文件下载记录
function setPurchaseFileDownloadDetailHTML(data) {

	$("#PurchaseFileDownload").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				title: "企业名称",
				align: "left",
				field: "enterprise.enterpriseName"

			},
			{
				field: "purFile.fileName",
				align: "left",
				title: "文件名称",
			}, {
				field: "subDate",
				align: "center",
				title: "下载时间",
				width: "150",
			}/*, {
				title: "IP地址",
				align: "center",
				width: "100",
				field: 'ip'
			},
			{
				title: "地区",
				align: "center",
				width: "100",
				field: 'area'
			}*/,
			{
				title: "联系人",
				align: "center",
				width: "50",
				field: 'linkMan'
			},
			{
				title: "手机号",
				align: "center",
				width: "100",
				field: 'linkTel'
			}, {
				title: "邮箱",
				align: "center",
				width: "150",
				field: 'linkEmail'
			}
		]

	})
	$("#PurchaseFileDownload").bootstrapTable('load', data);
}