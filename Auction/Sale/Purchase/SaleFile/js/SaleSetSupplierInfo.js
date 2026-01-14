//获取 可递交竞卖文件审核信息
var urlAuctionFile = top.config.AuctionHost + "/AuctionFileController/findAuctionFileDetail.do";
var findPurchaseURL = config.AuctionHost + '/ProjectReviewController/findAutionPurchaseInfo.do'; //获取项目信息的接口
//提交设置
var submitUrl = config.AuctionHost + '/AuctionWasteController/pushPackageSet.do'; //提交推送信息的接口
var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
var fileData = [];
var createType = $.getUrlParam("createType");
var projectId = $.getUrlParam("projectId");
var project;
var packageId;
var tabeldata;
$(function() {
	//获取存储的竞卖文件id	
	var rowData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	//页面显示项目名称编号截止时间
	//	$("#fileEndDate").html(rowData.fileEndDate);
	//	$("#fileCheckEndDate").html(rowData.fileCheckEndDate);
	//	$("#projectName").html(rowData.projectName);
	//	$("#projectCode").html(rowData.projectCode);

	getAuctionFileInfo(); //挂载审核文件
})

//关闭当前窗口
$("#btnClose").click(function() {
	sessionStorage.removeItem("record"); //清除session信息
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
});

//提交按钮
$("#btnSubmit").click(function() {

	if(1 == 1) { //验证表单数据
		parent.layer.confirm(
			"确定要提交设置吗？", {
				icon: 3,
				title: "提示"
			},
			function(index) {
				SubmitData(); //执行提交操作
			}
		);
	}

});

//挂载审核文件
function getAuctionFileInfo() {
	var dataParam = {
		"projectId": projectId
	}
	$.ajax({
		type: "get",
		url: findPurchaseURL,
		dataType: 'json',
		data: dataParam,
		async: true,
		success: function(result) {
			if(result.success) {
				fileData = result.data;
				project = fileData.project[0];
				tabeldata = fileData.materialDetails
				loadAuctionFileCheckState(tabeldata);
				packageId = fileData.autionProjectPackage[0].id;
				if(fileData.auctionStartDate < nowDate) {
					$("#btnSubmit").hide();
				}
				//渲染项目的数据
				for(key in fileData.project[0]) {
					$('#' + key).html(fileData.project[0][key]);
				}
				$("#isPublicText").html(fileData.isPublicText);
				$("#dataTypeName").html(fileData.autionProjectPackage[0].dataTypeName);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}

//挂载竞卖文件审核状态
function loadAuctionFileCheckState(tabeldata) {

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
				field: "productCode",
				align: 'left',
				title: "物料编码"
			},
			{
				field: "detailedName",
				title: "物料名称",
			}, {
				field: 'detailedVersion',
				title: '规格型号',
				align: 'left',
				width: '120',
			}, {
				field: 'priceType',
				title: '底价/顶价',
				align: 'left',
				width: '120',
				formatter: function(value, row, index) {
					if(row.priceType == 0) {
						return '<div>底价</div>'
					} else if(row.priceType == 1) {
						return '<div>顶价</div>'
					}
				}
			}, {
				field: 'salesPrice',
				title: '起始价',
				align: 'left',
				width: '120',
			}, {
				field: 'servicePrice',
				title: '服务费',
				align: 'center',
				width: '120',
				//			formatter:function(value, row, index){
				//					return '<input type="text" class="form-control priceNumber" onblur=funonblur(\"' + index + '\") id="budgets_' + index + '" name="" value="' + (value || "") + '"/>';
				//			}
			}, {
				field: 'storageLocation',
				title: '存放地点',
				align: 'left',
				width: '120',
			}, {
				title: "操作",
				align: 'left',
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					if(row.supplierIds) {
						var str = '<button  type="button" class="btn btn-secondary btn-sm btnView" onclick=viewbao(\"' + index + '\") data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看企业</button>';
					} else {
						var str = '<button  type="button" class="btn btn-secondary btn-sm btnView" onclick=viewbao(\"' + index + '\") data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>设置企业</button>';
					}
					return str;
				}
			}
		]
	})
	$("#AuctionFileCheck").bootstrapTable("load", tabeldata);
}

function viewbao($index) {
	var rowData = $('#AuctionFileCheck').bootstrapTable('getData');
	parent.layer.open({
		type: 2,
		title: "查看小组成员信息",
		area: ['1100px', '600px'],
		resize: false,
		content: 'Auction/Sale/Purchase/SaleFile/modal/add_enterprise.html?&id=' + projectId + '&dId=' + rowData[$index].id,
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.duEnterprise(rowData[$index].supplierIds);
		},
		btn: ['关闭']
			//确定按钮
			,
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			parent.layer.close(index);
		}
	});
}

function callBackEmployee(data) {

}

//获取项目的projectId
function getProjectId() {
	var projectData = JSON.parse(sessionStorage.getItem("AuctionFileCheckDate"));
	var obj = projectData.projectId;
	return obj;
}

function SubmitData() {
	$.ajax({
		type: "get",
		url: submitUrl,
		dataType: 'json',
		data: {
			'id': projectId,
			'packageId': packageId
		},
		async: true,
		success: function(result) {
			if(result.success) {
				parent.layer.alert("设置成功!", {
					icon: 6,
					time: 3000
				});
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
			} else {
				parent.layer.msg(result.message);
			}
		}
	})
}