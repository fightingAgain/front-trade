WORKFLOWTYPE = "psbg"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

var tenderType = $.query.get("tenderType"); //查看项目结果类型

var examType = $.query.get("examType"); //评审类型

var rowData = JSON.parse(sessionStorage.getItem("rowData")); //行数据

//访问路径
var url = top.config.AuctionHost;

var urlFindProjectReviewInfo = top.config.AuctionHost + "/JtProjectPackageController/findProjectPackageInfo.do";

var packageData1; //本页面获取的包件信息

var packageData;

$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}

	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);

	InfoAndProjectCheck();
	InfoAndProjectCheckOne();
})

//调用接口，读取页面信息
function InfoAndProjectCheck() {
	$.ajax({
		type: "get",
		url: urlFindProjectReviewInfo,
		data: {
			projectId: rowData.projectId,
			packageId: rowData.packageId,
			roleType: "0",
		},
		async: false,
		success: function(data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);

			packageData1 = data.data;
			//PackageOffer(packageData); //供应商报价
			//offerDetaileds(packageData.offerDetaileds); //报价详情
			//packageDetaileds(packageData); //询价采购清单
			
		}
	});
}

function InfoAndProjectCheckOne() {
	$.ajax({
		type: "get",
		url: top.config.AuctionHost+"/JtCheckReportController/findCheckReport.do",
		data: {
			projectId: rowData.projectId,
			packageId: rowData.packageId,
			roleType: "0",
		},
		async: false,
		success: function(data) {
			packageData = data.data;
			CheckReport(packageData);
		}
	});
}
//评审报告
function CheckReport(packageData) {
	$("#CheckReportTable").bootstrapTable({
		//data: packageData.checkReports,
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'reportUrl',
			title: '评审报告',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return packageData1.packageName + "_评审报告";
			}
		}, {
			field: 'xz',
			title: '下载',
			width: '100px',
			align: 'center',
			events:{
				'click .download':function(e,value, row, index){
					var ulr=$.parserUrlForToken(url + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + packageData1.packageName + "_评审报告.pdf");
					window.location.href = ulr;
				}
			},
			formatter: function(value, row, index) {
				return "<button type='button' class='btn btn-primary btn-xs download' >下载</button>";
			}
		}
	]
	});
	$("#CheckReportTable").bootstrapTable("load", packageData)

}