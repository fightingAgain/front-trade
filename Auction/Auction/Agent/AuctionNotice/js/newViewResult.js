var rowData = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行
var tenderTypeCode = sessionStorage.getItem('tenderTypeCode');
var ue
function getMsg(datall, type, types) {

	if (datall.isShow == '0') {
		//显示公章
		$.ajax({
			type: "post",
			url: parent.config.AuctionHost + '/BidNoticeController/getCaImage.do',
			data: {
				'projectId': datall.projectId
			},
			dataType: "json",
			success: function (response) {
				if (response.success) {
					if (response.data) {
						$("#gz").attr("src", $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + response.data));
					}
				}
			}
		});
	}
	if (type == "views") {
		$(".editResult").hide();
		if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
			$(".resultContent").html(datall.resultContent);
		}
		return
	};
	var isBidCode = datall.isBid;
	if (types == 'mx') {
		$.ajax({
			type: "post",
			url: parent.config.AuctionHost + '/AuctionSfcOfferBargainResultController/preview.do',
			data: {
				"packageId": datall.packageId,
				"supplierEnterpriseId": datall.supplierId,
				"auctionSfcOfferes": datall.list ? datall.list : null,
				"isBid": datall.isBid
			},
			dataType: "json",
			success: function (result) {
				if (result.success) {

					if (type == "view" || type == "views") {
						$(".editResult").hide();
						if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
							$(".resultContent").html(datall.resultContent);
						} else {
							$(".resultContent").html(result.data);
						}
					}
				}
			}
		});
	} else {
		var url;
		var data;

		if (datall.auctionType == '6') {
			url = parent.config.AuctionHost + '/AuctionSfcOfferBargainResultController/preview.do'
			data = {
				"packageId": datall.packageId,
				"supplierEnterpriseId": datall.supplierId,
				//					"auctionSfcOfferes":datall.list?datall.list:null,
				"isBid": datall.isBid
			}
		} else {
			url = parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do'
			data = {
				"auctionType": datall.auctionType,
				"packageId": datall.packageId,
				"projectId": datall.projectId,
				"examType": datall.examType,
				'type': "jgtzs",
				"tenderType": 1,
				"isBid": isBidCode,
				"supplierId": datall.supplierId,
				"auctionModel": datall.auctionModel,
				"detailedId": datall.packageDetailedId
			}
		}

		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			//		   	data:{
			//		   		"auctionType":datall.auctionType,
			//		   		"packageId":datall.packageId,
			//		   		"projectId":datall.projectId,
			//		   		"examType":datall.examType,
			//		   		'type':"jgtzs",
			//		   		"tenderType":1,
			//		   		"isBid":isBidCode,
			//		   		"supplierId":datall.supplierId,
			//		   		"auctionModel":datall.auctionModel,
			//		   		"detailedId":datall.packageDetailedId
			//		   	},
			data: data,
			success: function (result) {
				if (result.success) {

					if (type == "view" || type == "views") {
						$(".editResult").hide();
						if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
							$(".resultContent").html(datall.resultContent);
						} else {
							$(".resultContent").html(result.data);
						}
					}
				}
			}
		});
	}

}
//关闭
function closeWin() {
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}
//打印
function preview(oper) {
	if (oper < 10) {
		bdhtml = window.document.body.innerHTML;//获取当前页的html代码
		sprnstr = "<!--startprint" + oper + "-->";//设置打印开始区域
		eprnstr = "<!--endprint" + oper + "-->";//设置打印结束区域
		prnhtml = bdhtml.substring(bdhtml.indexOf(sprnstr)); //从开始代码向后取html
		prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML = prnhtml;
		window.print();
		window.document.body.innerHTML = bdhtml;
	} else {
		window.print();
	}
}
