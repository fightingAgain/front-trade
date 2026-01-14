WORKFLOWTYPE = "jggs"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

var tenderType = $.query.get("tenderType"); //查看项目结果类型

var BidNotice = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行

var urlBidNoticeInfo = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do"; //  公式信息

var bidNoticetable = new Array(); //供应商分项表格

$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}

	$("input[name='isPublic']").attr("disabled", "disabled");
	$("#bidNoticeStartDate").attr("disabled", "disabled");
	$("#bidNoticeEndDate").attr("disabled", "disabled");
	$("#btns").html("");
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);

	//结果信息填充的
	BidNoticeInfo(id);
})

//结果公示信息填充
function BidNoticeInfo(data) {
	$.ajax({
		type: "post",
		url: urlBidNoticeInfo,
		data: {
			"id": data,
			tenderType: 0 //0为询比采购，1为竞价采购，2为竞卖
		},
		dataType: 'json',
		async: false,
		success: function(result) {
			var data = result.data;

			$("#projectName").html(data.projectName);
			$("#projectCode").html(data.projectCode);
			$("input[name='isPublic'][value=" + data.isOpen + "]").prop("checked", true);
			$("#purchaserName").html(data.purchaserName);
			$("#purchaserAddress").html(data.purchaserAddress);
			$("#purchaserLinkmen").html(data.purchaserLinkmen);
			$("#purchaserTel").html(data.purchaserTel);
			$("#bidNoticeStartDate").val(data.openStartDate);
			$("#bidNoticeEndDate").val(data.opetEndDate);
			$("#packageName").html(data.packageName);
			$("#packageNum").html(data.packageNum);
			$("#NewsContent").html(data.noticeContent)
			new UEditorEdit({
				contentKey:'noticeContent',
				pageType:'view',
			})
			mediaEditor.setValue(data)
			initMediaVal(data.options, {
				disabled: true,
				stage: 'jggs',
				projectId: data.projectId,
				packageId: data.packageId,
			})
		}
	});
}