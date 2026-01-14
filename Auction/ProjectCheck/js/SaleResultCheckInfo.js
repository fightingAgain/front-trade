WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

var BidNotice = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行

var urlBidNoticeInfo = top.config.AuctionHost + "/BidResultHisController/findBidResultInfo.do"; //  公式信息
var resultNoticeHistoryView = "Auction/Sale/Agent/SaleResult/model/SaleResultInfoHistory.html";//查看历史
var BidResultItem = []; //分项集合
var price = "";
var subData ="",isAgent,quotationType,quotationUnit,examType=1;
var RenameData = {};
$(function() {
	new UEditorEdit({
		contentKey:'content',
		pageType:'view',
	})
	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}

	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
	$("input[name='isPublic']").attr("disabled", "disabled");

	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);

	//结果信息填充的
	BidNoticeInfo(id);
})
var showMsg;
//结果公示信息填充
function BidNoticeInfo(data) {
	$.ajax({
		type: "post",
		url: urlBidNoticeInfo,
		data: {
			"id": data,
			tenderType: 2 //0为询比采购，1为竞价采购，2为竞卖
		},
		dataType: 'json',
		async: false,
		success: function(result) {
			var data = result.data;
			showMsg = data.isShow;
			subData = data.subDate;
			auctionModel = data.auctionModel;
			isAgent = data.isAgent;
			if(data.price != undefined){
				price = data.price;
			}
			$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			BidResultItem = data.bidResultItems;
			$("td[id]").each(function() { //填冲表格
				$(this).html(data[this.id]);
			});
			if(data.isAgent == 1){
				$('.isAgent').show();
				$('.notAgent').hide();
				$('#isWinner').html(data.isWinner == 1?'有':'无');
			};
			
			$('#days').html(data.days?data.days:'');
			$('#title').html(data.title?data.title:'');
			$('[name=pushPlatform][value='+data.pushPlatform+']').attr('checked','checked');
			// $('#noticeContent').html(data.content?data.content:'');
			mediaEditor.setValue(data)
			$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
			$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章

			if(data.resultType == 1) {
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

			if(BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
				$("#whyFailureTr").show();
				$("#whyFailure").html("无供应商报价");
				return;
			}
			RenameData = getBidderRenameData(data.projectId);//供应商更名信息
			quotationType = BidResultItem[0].quotationType;
			quotationUnit = BidResultItem[0].quotationUnit;
			if(data.resultType == 0) { //0为中选通知 1为为中选通知
				var html = "<tr><td style='text-align:center;width:50px'>序号</td><td style='text-align:left;'>供应商名称</td>"
				if(isAgent == 1 && quotationType == 1){
					html +="<td>报价金额（"+quotationUnit+"）</td>"
				};
				html += "<td>通知类型</td><td>成交金额(" + (isAgent == 1?quotationUnit:"元") + ")</td><td>操作</td></tr>";
				for(var i = 0; i < BidResultItem.length; i++) {
					html += "<tr><td>" + (i + 1) + "</td>";
					html += "<td style='text-align:left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
					if(isAgent == 1 && quotationType == 1){
						html += "<td style='width:150px;'>"+(BidResultItem[i].lastOffer?BidResultItem[i].lastOffer:"")+"</td>"
					}
					if(BidResultItem[i].isBid == 0) {
						html += "<td style='width:110px;'><div class='text-success'>中选</div></td>";
						if(BidResultItem[i].bidPrice != undefined) {
							html += "<td style='width:110px;text-align:center'>" + BidResultItem[i].bidPrice + "</td>"; //成交价格
						} else {
							html += "<td style='width:110px;text-align:center'></td>"; //成交价格
						}
					} else {
						html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
						html += "<td></td>";
					}

					
					
					//html += price!=""?"<td  style='width:120px;text-align:center'>"+price+"</td>":"<td  style='width:120px;'></td>"; //服务费
					
					if(BidResultItem[i].resultContent){
				    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
				    } else {
				    	html += "<input type='hidden' class='bidContent' name='' value=''>";
				    }
						    
					html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
				}
				$("#bidResultInfo").html(html);
			} else {
				var html = "<tr><td></td><td>供应商名称</td><td>通知类型</td><td>操作</td></tr>";
				for(var i = 0; i < BidResultItem.length; i++) {
					html += "<tr><td>" + (i + 1) + "</td>";
					html += "<td>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
					html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
					if(BidResultItem[i].resultContent){
				    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
				    } else {
				    	html += "<input type='hidden' class='bidContent' name='' value=''>";
				    }
					html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
				}
				$("#bidResultInfo").html(html);
			}
			/*代理服务费*/
			projectServiceFee = data.projectServiceFee; 
			initAgentFee({
				type:"view",
				purchaseType:1,
				projectId:data.projectId,
				packageId:data.packageId,
				id: id
			}); 
			mediaEditor.setValue(data)
			/*代理服务费*/
			initMediaVal(data.options, {
				disabled: true,
				stage: 'jgtzs',
				projectId: data.projectId,
				pushPlatform: data.pushPlatform,
				// packageId: data.packageId,
			});
			if(data.bidResultHisList){
				resultNoticeHistoryTable(data.bidResultHisList, '1')
			}
		}
	});
}
function viewBidResult($index,type) {	
	BidResultItem[$index].isShow = showMsg;
	if(BidResultItem[$index].pdfUrl){
		previewPdf(BidResultItem[$index].pdfUrl);
	}else{
		top.layer.open({
			type: 2,
			title: "查看结果通知书",
			area: ['550px', '650px'],
			maxmin: false,
			resize: false,
			closeBtn: 1,
			content: 'Auction/common/Agent/BidNotice/modal/newViewResult.html',
			success: function(layero, index) {
				var body = parent.layer.getChildFrame('body', index);
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMsg(BidResultItem[$index],type);
			}
		});
	}
	
}
