var projectId = $.query.get("projectId");
var packageId = $.query.get("id");
var examType = $.query.get("examType");
var type = "view"; //RELEASE发布公示  view查看详情  VIEW重新发布
var keyId = $.query.get("keyId");

var projectType = "";
var tenderTypeCode = 0;//询比采购
var BidResultItem = []; //分项集合
var checkState = "";
var subData = "";

var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var businessid = '';
var findPackageInfoData;
var ue;
$(function () {
	
	if (examType == 0) {
		$(".unitShow").hide();
		$(".resutPublicShow").hide();
	}else{
		$('#btn_save').show();
	}
	if (keyId == 'undefined') {
		$("input[name='pushPlatform'][value=2]").attr("checked", "checked"); //公告发布媒体
		$("input[name='days']").val("1"); //公告时间
		keyId = "";
	}
	
	var para = ""; //查看数据对象
	var ulr = ""; //查看数据接口

	$("input[name='resultType'][value='0']").attr("checked", true); //默认中选
	$("input[name='isShow'][value='0']").attr("checked", true); //默认显示盖章
	//有无中标人
	$("[name='isWinner']").click(function () {
		var val = $("[name='isWinner']:checked").val();
		if (val == 1) {
			$(".isBid").each(function () {
				$(this).attr('disabled',false);
				$(this).change();
			})
		}else{
			$(".isBid").each(function () {
				$(this).val('1').attr('disabled',true).closest('tr').find('.bidPrice').attr('readonly','readonly');
				// $(this)
				$(this).change();
			})
		}
	});
	$("input[name='isPublic']").attr("disabled", "disabled");
	$('.view').show();
	$('.edit, .red').hide();
	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
	$("input[name='isWinner']").attr("disabled", "disabled"); //有无中选人
	$("input[name='pushPlatform']").attr("disabled", "disabled"); //公告发布媒体
	new UEditorEdit({
		contentKey:'tzscontent',
		pageType:'view',
	})
	$("#btn_submit").hide(); //提交隐藏
	para = {
		id: keyId,
		packageId: packageId,
		projectId: projectId,
		examType: examType,
		tenderType: tenderTypeCode //0为询比采购，1为竞价采购，2为竞卖,6为单一来源
	}
	$.ajax({
		url: top.config.bidhost + "/BidResultHisController/findBidResultInfo.do",
		type: 'get',
		data: para,
		dataType: 'json',
		async: false,
		success: function (result) {
			if(!result.success){
				top.layer.alert(result.message);
				return
			}
			var data = result.data;
			findPackageInfoData = result.data;
			projectType = data.projectType;//项目类型
			mediaEditor.setValue(data);
			if (examType == 0) {
				$("input[name='isPublic'][value=" + '1' + "]").prop("checked", true);
			} else {
				$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			}
				
			//findWorkflowCheckerAndAccp(data.id);
			$(".isWatch").hide();
			BidResultItem = data.bidResultItems;
			subData = data.subDate;
			$(".employee").hide(); //隐藏审核人

			$("td[id]").each(function () { //填冲表格
				$(this).html(data[this.id]);
			});
			$('#days').html(data.days?data.days:'');
			$('#title').html(data.title?data.title:'');
			$('#noticeContent').html(data.content?data.content:'');
			$('[name=pushPlatform][value='+data.pushPlatform+']').attr('checked','checked');
			$("input[name='resultType'][value=" + data.resultType + "]").prop("checked", true); //选择通知类型
			$("input[name='isShow'][value=" + data.isShow + "]").prop("checked", true); //是否公开盖章
			$("input[name='isWinner'][value=" + data.isWinner + "]").attr("checked", true); //有无中选人
			if (examType == 0) {
				$(".readyWatch").hide();
				if (BidResultItem == undefined || BidResultItem.length == 0) { //无供应商
					$("#whyFailureTr").show();
					$("#whyFailure").html("无供应商参与预审");
					return;
				}
				var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>淘汰</td><td style='width:150px'>操作</td></tr>";
				for (var i = 0; i < BidResultItem.length; i++) {
					html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
					html += "<td style='text-align:left'>" + BidResultItem[i].enterpriseName + "</td>";
					html += "<input type='hidden' class='supplierId' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
					if (BidResultItem[i].isBid) {//未中选
						html += "<td><input type='hidden'  name='bidResultItems[" + i + "].isBid' value='1'>是</td>";
					} else {//中选
						html += "<td><input type='hidden'  name='bidResultItems[" + i + "].isBid' value='0'>否</td>";
					}
					html += "<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
				}
				$("#bidResultInfo").html(html);

			} else {



				if (data.resultType == 1) {
					$(".isbid").hide(); //隐藏采购结果中选
				} else {

					/*if(BidResultItem != undefined && BidResultItem.length > 0) {
						for(var i = 0; i < BidResultItem.length; i++) { //中选加载
							if(BidResultItem[i].isBid == 0) {
								$("#enterpriseName").html(BidResultItem[i].enterpriseName);
								$("#bidPrice").html(BidResultItem[i].bidPrice);
							}
						}
					} else {
						$(".isbid").hide(); //隐藏采购结果中选
					}*/
				}

				if (BidResultItem == undefined || BidResultItem.length == 0) { //无供应商
					$("#whyFailureTr").show();
					$("#whyFailure").html("无供应商报价");
					return;
				}

				if (data.resultType == 0) { //0为中选通知 1为为中选通知
					var html = "";

					html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style= 'width:120px;'>成交价</td><td style='width:150px'>操作</td></tr>";

					//var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style= 'width:120px;'>成交金额("+ (top.prieUnit ||"")+")</td><td>报名费(元)</td><td>操作</td></tr>";
					for (var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + BidResultItem[i].enterpriseName + "</td>"; //供应商名称
						if (BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'><div class='text-success'>中选</div></td>";

						} else {
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";

						}


						if (BidResultItem[i].bidPrice != undefined && BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'>" + BidResultItem[i].bidPrice + "</td>"; //成交价格
						} else {
							html += "<td style='width:110px;'></td>"; //成交价格
						}

						html += "<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
					}

					$("#bidResultInfo").html(html);

				} else {
					var html = "<tr><td  style='width:50px;text-align:center;'>序号</td><td  style='text-align:left'>供应商名称</td><td>通知类型</td><td style='width:150px'>操作</td></tr>";
					for (var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td  style='width:50px;text-align:center;'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + BidResultItem[i].enterpriseName + "</td>";
						html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
						html += "<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult(" + i + ",\"views\")'>查看</a></td></tr>";
					}

					$("#bidResultInfo").html(html);
				}
			}

			/*代理服务费*/
			projectServiceFee = data.projectServiceFee;
			initAgentFee({
				purchaseType: tenderTypeCode,
				projectId: projectId,
				packageId: packageId
			});
			initMediaVal(data.options, {
				disabled: true,
				stage: 'jgtzs',
				projectId: projectId,
				packageId: packageId,
				pushPlatform: data.pushPlatform,
			});
			
			if (examType == 0) {
				$(".resutPublicShow").hide();
			}
		}

	})

	if (keyId != 'undefined' && keyId) {
		//审批记录
		$(".workflowList").show();
		findWorkflowCheckerAndAccp(keyId);
	}


})

$("#btn_close").on("click", function () {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
})

function viewBidResult($index, tamp) {
	if ($('input[name="isShow"]:checked').val() != undefined && $('input[name="isShow"]:checked').val() != "") {
		BidResultItem[$index].isShow = $('input[name="isShow"]:checked').val()
	} else {
		BidResultItem[$index].isShow = 0
	}
	BidResultItem[$index].projectId = projectId;
	BidResultItem[$index].packageId = packageId;
	BidResultItem[$index].examType = examType;
	if (tamp == "view") {
		if (examType == 0) {
			if ($('input[name= "bidResultItems[' + $index + '].isBid"]').val() != undefined && $('input[name= "bidResultItems[' + $index + '].isBid"]').val() != "") {
				BidResultItem[$index].isBid = $('input[name= "bidResultItems[' + $index + '].isBid"]').val();
			} else {
				BidResultItem[$index].isBid = 1
			}
		} else {
			if ($('.isBid[name="bidResultItems[' + $index + '].isBid"]').val() != undefined && $('.isBid[name="bidResultItems[' + $index + '].isBid"]').val() != "") {
				BidResultItem[$index].isBid = $('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
			} else {
				BidResultItem[$index].isBid = 1
			}

			//中选金额
			if ($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val() != undefined && $('input[name= "bidResultItems[' + $index + '].bidPrice"]').val() != "") {
				console.log($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val());
				BidResultItem[$index].bidPrice = $('input[name= "bidResultItems[' + $index + '].bidPrice"]').val();
			}

		}
		// 改为查看pdf页面形式
		getContentHtml(BidResultItem[$index], tamp)
	} else if (tamp == "views") {
		if (BidResultItem[$index].pdfUrl) {
			previewPdf(BidResultItem[$index].pdfUrl);
		} else {
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				maxmin: true,
				resize: false,
				closeBtn: 1,
				content: 'Auction/common/Agent/BidNotice/modal/newViewResult.html',
				success: function (layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(BidResultItem[$index], tamp);
				}
			});
		}

	}
}

/*************start获取报价信息****************/
var quotePriceUnit;
//正负数字的正则表达式
var re = new RegExp("^[+-]?(([0-9][0-9]*)|(([0]\\.\\d{1,2}|[0-9][0-9]*\\.\\d{1,2})))$");
//大于0的数字的正则表达式
var rm = new RegExp("^(([1-9][0-9]*)|(([0]\\.\\d{1,2}|[1-9][0-9]*\\.\\d{1,2})))$")
var weiChnise = '两'
getPriceUnit();
function getPriceUnit() {
	$.ajax({
		url: top.config.bidhost + "/NegotiationController/findPriceList.do",
		dataType: 'json',
		data: {
			packageId: packageId
		},
		async: false,
		success: function (data) {
			if (!data.success) {
				top.layer.alert(data.message);
				return;
			}
			if (data.data && data.data.quotePriceUnit) {
				quotePriceUnit = data.data;
				$("#quotePriceUnit").html((data.data.quotePriceName ? data.data.quotePriceName + "（" : "") + data.data.quotePriceUnit + (data.data.quotePriceName ? "）" : ""));
			} else {
				$("#quotePriceUnit").html("元");
			}
			if (data.data && data.data.pointNum != undefined) {
				pointNum = data.data.pointNum
			} else {
				pointNum = 2
			}
			if (pointNum == 0) {
				var rs = "^[1-9][0-9]*$";
				weiChnise = '零'
			} else {
				//大于0的数字的正则表达式
				var rs = "^(([1-9][0-9]*)|(([0]\\.\\d{1," + pointNum + "}|[1-9][0-9]*\\.\\d{1," + pointNum + "})))$";
				weiChnise = (pointNum == 2 ? '两' : top.sectionToChinese(pointNum))
			}
			rm = new RegExp(rs);

		},
		error: function () {
			parent.layer.alert("温馨提示：请求失败");
		}
	});
}
/*************end获取报价信息****************/
//全屏查看公告
$('body').on('click', '.fullScreen', function () {
	var content = $('#noticeContent').html();
	parent.layer.open({
		type: 2
		, title: '查看公告信息'
		, area: ['100%', '100%']
		, content: 'bidPrice/Public/model/fullScreenView.html'
		, resize: false
		, success: function (layero, index) {
			var body = parent.layer.getChildFrame('body', index);
			var iframeWind = layero.find('iframe')[0].contentWindow;
			body.find('#noticeContent').html(content)
		}
		//确定按钮
		, yes: function (index, layero) {
			parent.layer.close(index);
		}

	});
});


// 修改预览查看为pdf文件弹框
function getContentHtml(datall, type) {
	function openViewPdf(resultContent) {
		// 改为查看pdf页面形式
		$.ajax({
			type: "post",
			url: top.config.bidhost + "/ProjectBidResultController/previewResultPdf",
			async: true,
			data: {
				'projectId': projectId,
				'isShow': datall.isShow,
				'resultContent': resultContent,
			},
			success: function (data) {
				if (data.success) {
					previewPdf(data.data)
				}
			}
		});
	}
	if (type == "views" || type == "view") {
		if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
			openViewPdf(datall.resultContent)
			return
		}
	};
	var isBidCode=datall.isBid;
	$.ajax({
		url:parent.config.bidhost + '/WordToHtmlController/wordToHtml.do', 
		type:'post',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"packageId":datall.packageId,
			"projectId":datall.projectId,
			"examType":datall.examType,
			'type':"jgtzs",
			"tenderType":0,
			"isBid":isBidCode,
			"supplierId":datall.supplierId,
			"auctionModel":datall.auctionModel,
			"detailedId":datall.packageDetailedId,
			"bidPrice":datall.bidPrice || ''
		},
		success: function (result) {
			if (result.success) {

				if (type == "view" || type == "views") {
					if (datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined") {
						openViewPdf(datall.resultContent);
					} else {
						openViewPdf(result.data);
					}
				}
			}
		}
	});	

}