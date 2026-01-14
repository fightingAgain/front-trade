WORKFLOWTYPE = "xmby";

//查询补遗信息
var urlfindProjectSupplementInfo = top.config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do';

var id = $.query.get("key"); //获取id

var edittype = $.query.get("edittype"); //查看还是审核 audit 审核  detailed 查看

var tenderType = $.query.get("tenderType"); //判断是竞价还是竞卖

var isTimeOut = $.query.get("timeOut"); //是否过期
var isStopCheck = ''; //是否失败
var supplementType = $.query.get("supplementType");
var urlDownloadFile = top.config.FileHost + "/FileController/download.do"; //下载文件地址
var changeNoticeType;
var changeEndDate;
$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核操作表隐藏
	}

	if(tenderType == 2) {
		$("#startTime").text("竞卖开始时间");
		$("#oldStartTime").text("原始竞卖开始时间");
		$("#subFileEndTime").text("竞卖文件递交截止时间");
		$("#oldSubFileEndTime").text("原始竞卖文件递交截止时间");
		$("#checkFileEndTime").text("竞卖文件审核截止时间");
		$("#oldCheckFileEndTime").text("原始竞卖文件审核截止时间");
	} else {
		$("#startTime").text("竞价开始时间");
		$("#oldStartTime").text("原始竞价开始时间");
		$("#subFileEndTime").text("竞价文件递交截止时间");
		$("#oldSubFileEndTime").text("原始竞价文件递交截止时间");
		$("#checkFileEndTime").text("竞价文件审核截止时间");
		$("#oldCheckFileEndTime").text("原始竞价文件审核截止时间");
	}
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);
	//查询补遗信息
	setSupplement(id);
})

//查询补遗信息
function setSupplement(id) {
	$.ajax({
		url: urlfindProjectSupplementInfo,
		type: 'post',
		dataType: 'json',
		async: false,
		data: {
			"id": id,
			"supplementType":supplementType,
		},
		success: function(result) {
			if(!result.success){
				top.layer.alert(result.message);
				return
			}
			var data = result.data;
			//			if(data.isChangeDate == "0") {
			//				$("#supplementTime").hide(); //时间显示
			//			}

			$("div[id]").each(function() {
				$(this).html(data[this.id]); //表格内容填充
			})
			if(data.auctionEndDate){
				$("#auctionEndDatetr").show()
			}

			if(data.isChangeDate) { //是否变更时间显示
				$("#isChangeDate").html("已变更");
				$("#supplementEndDate").html(data.noticeEndDate);
				if(data.fileEndDate!=undefined){
					$("#fileEndDatetr").show();
					$("#fileCheckEndDatetr").show();
				}else{
					$("#fileEndDatetr").hide();
					$("#fileCheckEndDatetr").hide();
				}
			} else {
				$("#isChangeDate").html("未变更");
				$("#supplementEndDate").html(data.oldAuctionStartDate||data.oldNoticeEndDate);
				$("#supplementTime").hide(); //时间显示
			}
			if(isTimeOut==1 && data.isStopCheck != 1){
				top.layer.alert('该补遗文件已过期只能选择不通过');
				$('input[name="auditState"]').attr('disabled',true)
				$('input[name="auditState"][value="1"]').attr('checked',true)
			}
			//下载文件挂载
			getpurFileList(data.purFiles)

		}
	});
}

function getpurFileList(data) {
	$("#AccessoryList").bootstrapTable({
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
			}, {
				field: "fileName",
				halign: "center",
				title: "文件名"
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "10%",
				formatter: function(value, row, index) {
					return "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + row.fileName + "\",\"" + row.filePath + "\")'>下载</a>"
				}
			},
		]
	})
	$("#AccessoryList").bootstrapTable("load", data);
}

//点击下载附件信息
function openAccessory(filename, filePath) {
	var newUrl = top.config.FileHost + "/FileController/download.do" + "?fname=" + filename + "&ftpPath=" + filePath;
	window.location.href = $.parserUrlForToken(newUrl);
}