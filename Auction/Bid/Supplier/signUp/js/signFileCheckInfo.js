//获取 可递交报价文件审核信息
var urlSignFile = top.config.bidhost + "/BidFileController/fingSignFile.do";

//递交报名文件审核
var urlSignFileCheckStateUpdate = top.config.bidhost + "/BidFileController/checkSignFile.do";

//报名文件审核记录信息
var urlSignFileCheckRecord = top.config.bidhost + "/BidFileController/findSignFileRecode.do";

//下载报名文件地址
var urlDownloadAuctionFile = top.config.bidhost + "/FileController/download.do";

var rowData = JSON.parse(sessionStorage.getItem("rowData"));
var packageId = rowData.packageId;
var projectId = rowData.projectId;
$(function() {
	//获取存储的竞价文件id	
	/*var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));*/
	//页面显示项目名称编号截止时间
	$("#signEndDate").html(rowData.signEndDate);
	$("#offerEndDate").html(rowData.offerEndDate);
	$("#projectName").html(rowData.projectName);
	$("#projectCode").html(rowData.projectCode);
	$("#packageName").html(rowData.packageName);
	$("#packageNum").html(rowData.packageNum);

	getSignFileInfo(); //挂载审核文件
	loadSignFileCheckRecord(); //挂载审核记录
})

//挂载审核文件
function getSignFileInfo(data) {
	var dataParam = {
		"projectId": projectId,
		"packageId": packageId,
		//"examType":1,
		//"fileType":0,
		"enterpriseType":0,
		"isView":0
	}
	$.ajax({
		type: "get",
		url: urlSignFile,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				loadFileCheckState(result.data);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//挂载报名文件审核状态
function loadFileCheckState(data) {

	$("#FileCheck").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "enterpriseName",
				align: "center",
				title: "供应商"
			},
			{
				align: "center",
				title: "报名文件",
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
						
						html += "<td  style='width:100px'>"
                        html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileNameArr[j] + "\",\"" + filePathArr[j] + "\")'>下载</a>&nbsp;&nbsp;"
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							html +="<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[j] + "\")'>预览</a>"
						}						
						html +="</td>"
						html += "</tr>";
					}
					html += "</table>";
					return html;
				}
			},/*{
				field: "ip",
				align: "center",
				title: "上传IP",
				width: "120"
			}, {
				field: "areas",
				align: "center",
				title: "地区",
				width: "100"
			},*/{
				field: "subDate",
				align: "center",
				title: "上传时间",
				width: "150"
			},{
				title: "操作",
				align: "center",
				width: "100px",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'>已审核</div>";
					} else if(row.checkState == 0) {
						if(row.auditTimeout == "审核超时") {
							return "<div class='text-danger'>已超时</div>";
						} else {
							return "<button type='button' onclick='setSignFileCheckState(\"" + row.packageId + "\",\"" + row.id + "\")' class='btn btn-primary btn-sm'>审核</span> </button>";
						}
					} else {
						return "<div class='text-success'>已审核</div>";
					}
				}
			}
		]
	})
	$("#FileCheck").bootstrapTable("load", data);
}

//挂载竞价文件审核记录
function loadSignFileCheckRecord() {
	var dataParam = { //获取projectid
		"packageId": packageId,
		"enterpriseType": 0 //0是采购人 1 是供应商
	}
	$.ajax({
		type: "get",
		url: urlSignFileCheckRecord,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				var newData = result.data;
				loadSignFileCheckRecordTable(newData);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

function loadSignFileCheckRecordTable(data) {
	$("#FileCheckRecord").bootstrapTable({
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
				halign: "center",
				title: "供应商"
			},
			{
				field: "checkState",
				align: "center",
				title: "审核状态",
				formatter: function(value, row, index) {
					if(value == "1") {
						return "<div class='text-success'>合格</div>"
					} else if(value == "2"){
						return "<div class='text-danger'>不合格</div>"
					}
				}
			},
			{
				field: "checkContent",
				title: "审核意见",
				halign: "center"
			},
			{
				field: "checkDate",
				title: "审核时间",
				align: "center"
			},
			{
				field: "userName",
				title: "审核人",
				align: "center"
			}
		]
	})
	$("#FileCheckRecord").bootstrapTable("load", data);

}

//审核文件
function setSignFileCheckState(packageId, id) {
	parent.layer.confirm('审核当前文件', {
			btn: ['合格', '不合格', '关闭']
		},
		function() { //合格
			var dataParam = {
				//"packageId": packageId, //审核结果对象
				"id": id,
				"checkState": "1" //审核结果 1为审核通过，2为审核未通过
			}
			$.ajax({
				type: "get",
				url: urlSignFileCheckStateUpdate,
				datatype: 'json',
				data: dataParam,
				async: true,
				success: function(result) {
					if(result.success) {
						getSignFileInfo(); //刷新列表
						//loadSignFileCheckRecord(); //重载审核记录
						parent.$('#signFileCheckList').bootstrapTable('refresh');
						parent.layer.msg('审核成功！');
						//刷新表格						
					} else {
						parent.layer.msg('审核失败！');
					}
				}
			})
		},
		function() { //不合格

			parent.layer.prompt({
				formType: 2,
				value: '',
				title: '请输入审核意见',
				area: ['250px', '150px'] //自定义文本域宽高
			}, function(value, index, elem) {

				if(value.length > 150) {
					parent.layer.alert("审核意见不能多于150字！")
					return;
				}

				var dataParam = {
					//"packageId": packageId, //审核结果对象
					"id": id,
					"checkState": "2", //审核结果 1为审核通过，2为审核未通过
					"checkContent": value
				}

				$.ajax({
					type: "get",
					url: urlSignFileCheckStateUpdate,
					datatype: 'json',
					data: dataParam,
					async: true,
					success: function(result) {
						if(result.success) {
							parent.layer.close(index);
							getSignFileInfo(); //重新刷新列表
							loadSignFileCheckRecord(); //重载审核记录
							parent.$('#signFileCheckList').bootstrapTable('refresh');
							parent.layer.msg('审核成功');
						} else {
							parent.layer.msg(result.message);
						}

					}
				})
			});
		},
		function() {
			parent.layer.close();
		}
	);
}

/*//获取项目的projectId
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}*/

//下载文件
function openAccessory(fileName, filePath) {
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}

//预览文件
function previewFile(filePath) {
	openPreview(filePath);
}