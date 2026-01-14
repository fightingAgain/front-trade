WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var id = $.query.get("key"); //主键id 项目id

var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核

var purExamType = $.query.get("purExamType"); 

var tenderTypeCode = $.query.get("tenderTypeCode"); 

var BidNotice = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行

var urlBidNoticeInfo = top.config.AuctionHost + "/JtProjectBidResultController/findBidResultInfo.do"; //  公式信息

var BidResultItem = []; //分项集合
var subData ="";
var unit="";
var RenameData = {}
$(function() {

	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}
	
	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
	$(".isWatch").hide();
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);

	//结果信息填充的
	BidNoticeInfo(id);
})

var examType;
//结果公示信息填充
function BidNoticeInfo(data) {
	$.ajax({
		type: "post",
		url: urlBidNoticeInfo,
		data: {
			"id": data,
			tenderType: tenderTypeCode, //0为询价采购，1为竞价采购，2为竞卖
			//purExamType:purExamType
		},
		dataType: 'json',
		async: false,
		success: function(result) {
			var data = result.data;
			subData = data.subDate;
			if(tenderTypeCode==13){
			unit=data.unit
			}else{
		   unit='元';
			}
			BidResultItem = data.bidResultItems;
			examType = data.examType;
			$("td[id]").each(function() { //填冲表格
				$(this).html(data[this.id]);
			})

			$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
			$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章
			RenameData = getBidderRenameData(data.packageId);//供应商更名信息
			if(data.examType == 0){
				$(".readyWatch").hide();
				if(BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
					$("#whyFailureTr").show();
					$("#whyFailure").html("无供应商参与预审");
					return;
				};				
				var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>淘汰</td><td>操作</td></tr>";
				for(var i = 0; i < BidResultItem.length; i++) {
					BidResultItem[i].isShow=data.isShow;
					html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
					html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
					html += "<input type='hidden' class='supplierId' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
					//html += data.price!=null?"<td  style='width:120px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].serviceCharge'  value='"+(data.price.toFixed(2))+"' />"+(data.price.toFixed(2))+"</td>":"<td  style='width:100px;text-align:center'></td>"; //服务费	
					if(BidResultItem[i].isBid){
				    	html += "<td><input type='hidden' class='isBid' name='bidResultItems[" + i + "].isBid' value='1'>是</td>";
				    } else {
				    	html += "<td><input type='hidden' class='isBid' name='bidResultItems[" + i + "].isBid' value='0'>否</td>";
				    }   
					//html += checkState!=""?"<td><a href='javascript:void(0)' class='viewBidResult' onclick='viewBidResult(this)'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult' onclick='editBidResult(this)'>编辑</a></td></tr>":"<td><a href='javascript:void(0)' class='viewBidResult' onclick='viewBidResult(this)'>查看</a></td></tr>";
					html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
				}
				$("#bidResultInfo").html(html);
				
				
			}else{
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
	
				if(data.resultType == 0) { //0为中选通知 1为为中选通知
					var html = "";
					if(examType == 0){
						html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style='width:120px'>成交金额("+(unit||"元") +")</td><td>操作</td></tr>";
					}else{
						html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style='width:120px'>成交金额("+(unit||"元") +")</td><td>操作</td></tr>";
					}
					for(var i = 0; i < BidResultItem.length; i++) {
						BidResultItem[i].isShow=data.isShow;
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
						if(BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'><div class='text-success'>中选</div></td>";
							//html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:center'>"+(Number(BidResultItem[i].totalCheck).toFixed(6))+"</td>":"<td style='width:110px;'></td>"; //成交价格
						} else {
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
							//html += "<td style='width:110px;'></td>";
						}
						
						
						if(BidResultItem[i].bidPrice != undefined &&BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'>" + BidResultItem[i].bidPrice + "</td>"; //成交价格
						} else {
							html += "<td style='width:110px;'></td>"; //成交价格
						}
						//html += BidResultItem[i].price!=null?"<td  style='width:120px;text-align:center'>"+(BidResultItem[i].price.toFixed(2))+"</td>":"<td  style='width:120px;'></td>"; //服务费	
						
						if(BidResultItem[i].resultContent){
					    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
					    } else {
					    	html += "<input type='hidden' class='bidContent' name='' value=''>";
					    }
					    
						html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
					}
					$("#bidResultInfo").html(html);
				} else {
					var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						BidResultItem[i].isShow=data.isShow;
						html += "<tr><td>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
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
			}
		}
	});
}

function viewBidResult($index,type) {	
	BidResultItem[$index].packageId=BidNotice.packageId;
	BidResultItem[$index].projectId=BidNotice.projectId;
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


