//获取 可递交竞卖文件审核信息
var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do";

//上传可递交竞卖问审核
var urlAuctionFileCheckStateUpdate = top.config.AuctionHost + "/AuctionFileController/updateAuctionFile.do";

//竞卖文件审核信息
var urlAuctionFileCheckRecord = top.config.AuctionHost + "/AuctionFileController/findAuctionFileRecode.do";

//下载竞卖文件地址
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do";
var fileData = [];
var createType = $.getUrlParam("createType");
var projectId = $.getUrlParam("projectId");
var RenameData = {};//投标人更名信息
$(function() {
	//获取存储的竞卖文件id	
	var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	RenameData = getBidderRenameData(projectId);//投标人更名信息
	//页面显示项目名称编号截止时间
//	$("#fileEndDate").html(rowData.fileEndDate);
//	$("#fileCheckEndDate").html(rowData.fileCheckEndDate);
//	$("#projectName").html(rowData.projectName);
//	$("#projectCode").html(rowData.projectCode);

	getAuctionFileInfo(); //挂载审核文件
	loadAuctionFileCheckRecord(); //挂载审核记录
})

//挂载审核文件
function getAuctionFileInfo(data) {
	var dataParam = {
		"projectId": projectId
	}
	$.ajax({
		type: "get",
		url: urlAuctionFile,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				fileData = result.data;
				loadAuctionFileCheckState(result.data);
				$("#fileEndDate").html(fileData[0].fileEndDate);
				$("#fileCheckEndDate").html(fileData[0].fileCheckEndDate);
				$("#projectName").html(fileData[0].projectName);
				if (fileData[0].projectSource > 0) {
					$("#projectName").html(fileData[0].projectName + '<span class="red">(重新竞卖)</span>');
				}
				$("#projectCode").html(fileData[0].projectCode);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//挂载竞卖文件审核状态
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
				halign: "center",
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.supplierId, value, RenameData, 'body')
				}
			},
			{
				halign: "center",
				title: "竞卖文件",
				formatter: function(value, row, index) {
					var fileNameArr = row.fileName.split(","); //文件名数组
					var filePathArr = row.filePath.split(",");
					var html = "";
					for(var j = 0; j < filePathArr.length; j++) {
						var c = j + 1;
						html += '<div>' + c + '、' + '<a  href="javascript:void(0)" onclick="openAccessory(' + index + ',' + j + ')"  href="javascript:void(0);">' + fileNameArr[j] + '</a></div>';
					}
					return html;
				}
			},
			/*{
							field: "ip",
							halign: "center",
							title: "上传IP"
						}, {
							field: "areas",
							halign: "center",
							title: "地区"
						},*/
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
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.checkState == 1) {
						return "<div class='text-success'><button type='button' onclick='already(\"" + index + "\")' class='btn btn-primary btn-sm'>已审核</span> </button></div>";
					} else if(row.checkState == 0) {
						if(row.auditTimeout == "审核超时") {
							return "<div class='text-danger'>已超时</div>";
						} else {
							if(createType != undefined && createType == 1) {
								return "<div class='text-danger'>待审核</div>";
							} else {

								return "<button type='button' onclick='setAuctionFileCheckState(\"" + index + "\")' class='btn btn-primary btn-sm'>审核</span> </button>";
							}
						}
					} else {
						return "<div class='text-success'><button type='button' onclick='alreadyno(\"" + index + "\")' class='btn btn-primary btn-sm'>已审核</span> </button></div>";
//						return "<div class='text-success'>已审核</div>";
					}
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", data);
}

function openAccessory(_index, _j) {
	var filePathArr = fileData[_index].filePath.split(",");
	var fileNameArr = fileData[_index].filePath.split(",");
	var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePathArr[_j] + "&fname=" + fileNameArr[_j];
	window.location.href = $.parserUrlForToken(newUrl);
}
//挂载竞卖文件审核记录
function loadAuctionFileCheckRecord(data) {
	var dataParam = { //获取projectid
		"projectId": projectId,
		"enterpriseType": '02' //0是采购人 1 是供应商
	}
	$.ajax({
		type: "get",
		url: urlAuctionFileCheckRecord,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				var newData = result.data;
				loadAuctionFileCheckRecordTable(newData);
				//				if(newData.length > 0) {
				//					$(".NoAuctionFileCheckRecord").hide(); //无数据栏隐藏
				//					var html = "";
				//					for(var i = 0; i < newData.length; i++) {
				//						var b = i + 1;
				//						html += "<tr>"
				//						html += "<td>" + b + "</td>" //序号
				//						html += "<td>" + newData[i].enterpriseName + "</td>" //供应商
				//						if(newData[i].checkResult == "0") {
				//							html += "<td>合格</td>" //审核结果						
				//						} else {
				//							html += "<td>不合格</td>" //审核结果	
				//						}
				//						if(newData[i].checkContent == undefined) {
				//							html += "<td></td>" //审核意见							
				//						} else {
				//							html += "<td>" + newData[i].checkContent + "</td>" //审核意见
				//						}
				//						html += "<td>" + newData[i].checkDate + "</td>" //审核时间
				//						html += "<td>" + newData[i].userName + "</td>" //审核人
				//						html += "</tr>"
				//					}
				//					$("#AuctionFileCheckRecord").html(html);
				//
				//				} else {
				//					$(".NoAuctionFileCheckRecord").show();
				//					return;
				//				}
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

function loadAuctionFileCheckRecordTable(data) {
	$("#AuctionFileCheckRecord").bootstrapTable({
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
				title: "供应商",
				formatter:function(value, row, index){					
					return showBidderRenameList(row.enterpriseId, value, RenameData, 'body')
				}
			},
			{
				field: "checkResult",
				align: "center",
				title: "审核状态",
				formatter: function(value, row, index) {
					if(value == "0") {
						return "<div class='text-success'>合格</div>"
					} else {
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
	$("#AuctionFileCheckRecord").bootstrapTable("load", data);

}

//审核文件
function setAuctionFileCheckState($index){
	var veData = $('#AuctionFileCheck').bootstrapTable('getData');
	top.layer.open({
		type: 2,
		title: "审核信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Purchase/SaleFile/modal/JMauditmodel.html?supplierId='+veData[$index].supplierId+'&id='+veData[$index].id+'&projectId='+veData[$index].projectId+'&checkState='+veData[$index].checkState
	});
}

function already($index){
	var veData = $('#AuctionFileCheck').bootstrapTable('getData');
	top.layer.open({
		type: 2,
		title: "审核查看信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Purchase/SaleFile/modal/JMauditmodel.html?supplierId='+veData[$index].supplierId+'&id='+veData[$index].id+'&projectId='+veData[$index].projectId+'&checkState='+veData[$index].checkState
	});
}
function alreadyno($index){
	var veData = $('#AuctionFileCheck').bootstrapTable('getData');
	top.layer.open({
		type: 2,
		title: "审核查看信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Purchase/SaleFile/modal/JMauditmodel.html?supplierId='+veData[$index].supplierId+'&id='+veData[$index].id+'&projectId='+veData[$index].projectId+'&checkState='+veData[$index].checkState
	});
}
//function setAuctionFileCheckState(projectId, id) {
//	parent.layer.confirm('审核当前文件', {
//			btn: ['合格', '不合格', '关闭']
//		},
//		function() { //合格
//			var dataParam = {
//				"projectId": projectId, //审核结果对象
//				"id": id,
//				"checkResult": "0" //审核结果 0通过 1 不通过
//			}
//			$.ajax({
//				type: "get",
//				url: urlAuctionFileCheckStateUpdate,
//				datatype: 'json',
//				data: dataParam,
//				async: true,
//				success: function(result) {
//					if(result.success) {
//						getAuctionFileInfo(); //刷新列表
//						loadAuctionFileCheckRecord(); //重载审核记录
//						parent.$('#AuctionFileCheckList').bootstrapTable('refresh');
//						parent.layer.msg('审核成功！');
//						//刷新表格						
//					} else {
//						parent.layer.msg('审核失败！');
//					}
//				}
//			})
//		},
//		function() { //不合格
//
//			parent.layer.prompt({
//				formType: 2,
//				value: '',
//				title: '请输入审核意见',
//				area: ['250px', '150px'] //自定义文本域宽高
//			}, function(value, index, elem) {
//
//				if(value.length > 150) {
//					parent.layer.alert("审核意见不能多于150字！")
//					return;
//				}
//
//				var dataParam = {
//					"projectId": projectId,
//					"id": id,
//					"checkResult": "1", //审核结果 0通过 1 不通过
//					"checkContent": value
//				}
//
//				$.ajax({
//					type: "get",
//					url: urlAuctionFileCheckStateUpdate,
//					datatype: 'json',
//					data: dataParam,
//					async: true,
//					success: function(result) {
//						if(result.success) {
//							parent.layer.close(index);
//							getAuctionFileInfo(); //重新刷新列表
//							loadAuctionFileCheckRecord(); //重载审核记录
//							parent.$('#AuctionFileCheckList').bootstrapTable('refresh');
//							parent.layer.msg('审核成功');
//						} else {
//							parent.layer.msg(result.message);
//						}
//
//					}
//				})
//			});
//		},
//		function() {
//			parent.layer.close();
//		}
//	);
//}

//获取项目的projectId
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}

//关闭按钮
$("#btn_close").on("click", function() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
	parent.$('#AuctionFileCheckList').bootstrapTable('refresh');
})