var rowData = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行

var type = $.query.get("type"); //update发布公示  view查看详情
sessionStorage.setItem("tenderTypeCode","2");
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do"

//发布提交接口 
var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertProjectBidResult.do?";

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck=false;

var BidResultItem = []; //分项集合
var checkState = "";
var subData = "";
var auctionModel = ""; //按照明细还是包件
var price = 0;
var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型
var quotationType;//报价方式 0 金额  1 费率
var quotationUnit;
$(function() {
	var para = ""; //查看数据对象
	var ulr = ""; //查看数据接口
	
	if(rowData.price != undefined){
		price = rowData.price;
	}
	
	if(rowData.checkState == undefined ){
		checkState = "预览";
	}else{
		if(rowData.checkState == '3' ||rowData.checkState=="0"){
			checkState = "预览";
		}
	}

	$("input[name='resultType'][value='0']").attr("checked", true); //默认中选
	$("input[name='isShow'][value='0']").attr("checked", true); //默认显示盖章

	if(type == "view") { //查看
		
		$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
		$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
		$("#btn_submit").hide(); //提交隐藏
		url = top.config.AuctionHost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
		para = {
			id: rowData.id,
			packageId: rowData.packageId,
			tenderType: 2 //0为询价采购，1为竞价采购，2为竞卖
		}
	}else if(type == "views") { //查看
		
		$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
		$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
		$("#btn_submit").hide(); //提交隐藏
		url = top.config.AuctionHost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
		para = {
			id: rowData.bidResultId,
			packageId: rowData.packageId,
			tenderType: 2 //0为询价采购，1为竞价采购，2为竞卖
		}
	} else {
		url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do"; //查看包件
		para = {
			packageId: rowData.packageId,
			tenderType: 2 //0为询价采购，1为竞价采购，2为竞卖
		}
		$(".isbid").hide(); //隐藏采购结果中选
	}

	$.ajax({
		url: url,
		type: 'get',
		data: para,
		dataType: 'json',
		async: false,
		success: function(result) {
			
			var data = result.data;
			quotationType = data.quotationType;
			quotationUnit = data.quotationUnit || '元';
			auctionModel = result.data.auctionModel; //保存包件还是明细			
			if(type == "update" || type == "modify") { //当发布时				
				WorkflowUrl(); //加载审核人
				$("td[id]").each(function() {
					$(this).html(data[this.id]);
				})
				findWorkflowCheckerAndAccp(data.projectId);
				if(auctionModel == 0) { //按照包件
					BidResultItem = data.auctionOfferItems;
					var suppliertalbe = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td>备注</td><tr>";
					var auctionPackageDetaileds = data.auctionPackageDetaileds;
					for(var j = 0; j < auctionPackageDetaileds.length; j++) {
						suppliertalbe += "<tr>";
						suppliertalbe += "<td>" + (j + 1) + "</td>";
						suppliertalbe += "<td style='text-align:left;'>" + (auctionPackageDetaileds[j].detailedName || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedVersion || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedCount || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedUnit || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedContent || "") + "</td>";
						suppliertalbe += "</tr>";
					}
					$("#auctionPackageDetaileds").html(suppliertalbe);

					if(BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
						$("#whyFailureTr").show();
						$("#whyFailure").html("无供应商报价");
						return;
					}
					var html = "<tr><td >序号</td><td align='left'>供应商名称</td>"
					if(quotationType == 1){
						html +="<td>报价金额（"+quotationUnit+"）</td>"
					}
					html +="<td>通知类型</td><td align='center'>成交金额(" + quotationUnit + ")</td><td style='width:120px'>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td width='50px';align='center'>" + (i + 1) + "</td>";
						html += "<td align='left'>" + BidResultItem[i].enterpriseName + "</td>";
						html += "<input type='hidden' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
						if(quotationType == 1){
							html +="<td style='width:120px;>"+(BidResultItem[i].offerMoney?BidResultItem[i].offerMoney:"")+"</td>"
						}
						if(BidResultItem[i].isEliminated != undefined && BidResultItem[i].isEliminated == '0'){//未淘汰
							html += "<td style='width:120px;'><select class='form-control isBid' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
						}else{
							html += "<td style='width:110px;'><input type='hidden' name='bidResultItems[" + i + "].isBid' value='1'><span>未中选</span></td>";
						}
						
						//html += "<td  style='width:150px;' align='center'>" + BidResultItem[i].offerMoney + "</td>";
						if(quotationType == 1){
							html+= "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='"+(BidResultItem[i].bidPrice?(Number(BidResultItem[i].bidPrice).toFixed(2)):"")+"' /></td>";
						}else{
							if(BidResultItem[i].lastPrice!=null){
								html+= "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].lastPrice).toFixed(2))+"' />"+(Number(BidResultItem[i].lastPrice).toFixed(2))+"</td>";
							}else{
								if(BidResultItem[i].lastMoney!=null){
									html+= "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].lastMoney).toFixed(2))+"' />"+(Number(BidResultItem[i].lastMoney).toFixed(2))+"</td>";
								}else{
									
									html += BidResultItem[i].offerMoney!=null?"<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice' value='"+(Number(BidResultItem[i].offerMoney).toFixed(2))+"' />"+(Number(BidResultItem[i].offerMoney).toFixed(2))+"</td>" :"<td  style='width:120px;'> </td>";
								}
								
							}
						}
						
						
					    //html += price!=""?"<td  style='width:120px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].serviceCharge' value='"+(price.toFixed(2))+"' />"+(price.toFixed(2))+"</td>":"<td  style='width:100px;text-align:center'></td>"; //服务费
					    
					    if(BidResultItem[i].resultContent){
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value='"+BidResultItem[i].resultContent+"'>";
					    } else {
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value=''>";
					    }
						
						
						html += checkState!=""?"<td><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>":"<td><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
					}
					$("#bidResultInfo").html(html);
					$(".isBid").change(function() {
						$(this).parent().parent().find(".bidContent").val("");
						if($(this).val() == 0) {
							$(this).parent().parent().siblings().each(function() {
								if($(this).children().eq(3).children().eq(0).val() == 0) {
									$(this).children().eq(3).children().eq(0).val(1);
									$(this).children().eq(3).children().eq(0).parent().siblings().eq(3).children().attr("readonly", "readonly");
									layer.alert("只能选择一个中选人");
								}
							});
						}
					})

					//通知类型选择 底部的结果变更			
					$("input[name='resultType']").on("click", function() {
						if($("input[type='radio'][name='resultType']:checked").val() == 1) { //当为未通过时
							$(".isBid").val("1");
							$(".isBid").attr("disabled", true);
							$(".bidPrice").val("");
							$(".serviceCharge").val("");
							$(".bidPrice").attr("readonly", "readonly");
							$(".serviceCharge").attr("readonly", "readonly");
						} else {
							$(".isBid").removeAttr("disabled");
						}
					})

					$(".isBid").on("change", function() { //中选 填写金额
						if($(this).val() == 0) {
							$(this).parent().siblings().eq(3).children().removeAttr("readonly");
						} else {
							$(this).parent().siblings().eq(3).children().attr("readonly", "readonly");
						}
					})
				} else if(auctionModel == 1) { //按照明细
					item = data.auctionPackageDetaileds;
					if(item == undefined || item.length <= 0) { //无供应商
						$("#whyFailureTr").show();
						$("#whyFailure").html("无供应商报价");
						return;
					}
					//"<td>供应商名称</td><tr>";
					var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td width='50px'>排名</td><td>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
					var index = -1;
					for(var j = 0; j < item.length; j++) {
						var count = item[j].offerItems.length;
						html += "<tr>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (j + 1) + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
						for(var i = 0; i < item[j].offerItems.length; i++) {
							index++;
							html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
							html += "<td style='vertical-align: middle;' class='enterpriseName' data-tr='" + j + "'  data-td='" + i + "'>" + item[j].offerItems[i].enterpriseName + "</td>";
							html += "<input type='hidden' name='BidResultItems[" + index + "].packageDetailedId' value=" + item[j].id + ">";
							html += "<input type='hidden' name='BidResultItems[" + index + "].supplierId' value=" + item[j].offerItems[i].supplierId + ">";
							html += "<td style='width:110px;vertical-align: middle;'><select class='form-control isBid' data-tr='" + j + "'  data-td='" + i + "'  name='BidResultItems[" + index + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
							//html += "<td style='width:100px;vertical-align: middle;'><input type='text'  data-tr='" + j + "'  data-td='" + i + "'  readonly='readonly' class='form-control bidPrice' name='BidResultItems[" + index + "].bidPrice'/></td>";
							if(item[j].offerItems[i].lastPrice!=null){
								html+= "<td  style='width:100px;text-align:center'><input type='hidden'  data-tr='" + j + "'  data-td='" + i + "' name='BidResultItems[" + index + "].bidPrice'  value='"+(Number(item[j].offerItems[i].lastPrice).toFixed(2))+"' />"+(Number(item[j].offerItems[i].lastPrice).toFixed(2))+"</td>";
							}else{
								if(item[j].offerItems[i].lastMoney!=null){
									html+= "<td  style='width:100px;text-align:center'><input type='hidden'  data-tr='" + j + "'  data-td='" + i + "' name='BidResultItems[" + index + "].bidPrice'  value='"+(Number(item[j].offerItems[i].lastMoney).toFixed(2))+"' />"+(Number(item[j].offerItems[i].lastMoney).toFixed(2))+"</td>";
								}else{
									
									html+=item[j].offerItems[i].offerMoney!=""?"<td  style='width:100px;text-align:center'><input type='hidden' data-tr='" + j + "'  data-td='" + i + "'  name='BidResultItems[" + index + "].bidPrice'  value='"+(Number(item[j].offerItems[i].offerMoney).toFixed(2))+"'/>"+Number(item[j].offerItems[i].offerMoney).toFixed(2)+"</td>":"<td  style='width:100px;'></td>";
								}
							}
							
							
					       // html += price!=""?"<td  style='width:120px;text-align:center'><input type='hidden'  name='BidResultItems[" + index + "].serviceCharge' value='"+(price.toFixed(2))+"' />"+(price.toFixed(2))+"</td>":"<td  style='width:120px;text-align:center'></td>"; //服务费
					        
							if(BidResultItem[i].resultContent){
						    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value='"+BidResultItem[i].resultContent+"'>";
						    } else {
						    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value=''>";
						    }
						    
							html += checkState!=""?"<td style='vertical-align: middle;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' data-tr='" + j + "'  data-td='" + i + "'  onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn-sm btn-primary' onclick='editBidResult("+i+")'>编辑</a></td>":"<td style='vertical-align: middle;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' data-tr='" + j + "'  data-td='" + i + "'  onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
							html += "</tr>";
						}
					}
					//	console.log(html);
					$("#bidResultInfo").html(html);
					$(".isBid").change(function() {
						$(this).parent().parent().find(".bidContent").val("");
						var tr = $(this).data("tr");
						var td = $(this).data("td");
						if($(this).val() == 0) {
							$("select[data-tr='" + tr + "']").each(function() {
								if($(this).val() == 0 && $(this).data("td") != td) {
									layer.alert("每个明细只能选择一个中选供应商");
									$("select[data-tr='" + tr + "']").each(function() {
										if($(this).val() == 0 && $(this).data("td") != td) {
											$(this).val(1);
										}
									})
									$("input[data-tr='" + tr + "']").each(function() {
										if($(this).data("td") != td) {
											$(this).val("");
											$(this).attr("readonly", "readonly");
										}
									})
								}
							})
							$("input[data-tr='" + tr + "'][data-td='" + td + "']").removeAttr("readonly");
						}
					})
					//通知类型选择 底部的结果变更			
					$("input[name='resultType']").on("click", function() {
						if($("input[type='radio'][name='resultType']:checked").val() == 1) { //当为未通过时
							$(".isBid").val("1");
							$(".isBid").attr("disabled", true);
							$(".bidPrice").val("");
							$(".serviceCharge").val("");
							$(".bidPrice").attr("readonly", "readonly");
							$(".serviceCharge").attr("readonly", "readonly");
						} else {
							$(".isBid").removeAttr("disabled");
						}
					})
				}
			} else if(type == "view"||type == "views") { //查看时
				subData	= data.subDate;
				findWorkflowCheckerAndAccp(data.id);
				$(".isWatch").hide();
				$(".employee").hide(); //隐藏审核人

				$("td[id]").each(function() { //填冲表格
					$(this).html(data[this.id]);
				})
				$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
				$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章

				if(data.resultType == 1) {
					$(".isbid").hide(); //隐藏采购结果中选
				} else {
					if(auctionModel == 0) {
						BidResultItem = data.bidResultItems;
						if(BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
							$("#whyFailureTr").show();
							$("#whyFailure").html("无供应商报价");
							return;
						}
						if(BidResultItem != undefined && BidResultItem.length > 0) {
							for(var i = 0; i < BidResultItem.length; i++) { //中选加载
								if(BidResultItem[i].isBid == 0) {
									$("#enterpriseName").html(BidResultItem[i].enterpriseName);
									$("#bidPrice").html(BidResultItem[i].bidPrice);
								}
							}
						} else {
							$(".isbid").hide(); //隐藏采购结果中选
						}
					} else {
						$(".isbid").hide(); //隐藏采购结果中选
					}
				}

				if(auctionModel == 0) {
					var suppliertalbe = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td>备注</td><tr>";
					var auctionPackageDetaileds = data.auctionPackageDetaileds;
					for(var j = 0; j < auctionPackageDetaileds.length; j++) {
						suppliertalbe += "<tr>";
						suppliertalbe += "<td>" + (j + 1) + "</td>";
						suppliertalbe += "<td style='text-align:left;'>" + (auctionPackageDetaileds[j].detailedName || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedVersion || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedCount || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedUnit || "") + "</td>";
						suppliertalbe += "<td>" + (auctionPackageDetaileds[j].detailedContent || "") + "</td>";
						suppliertalbe += "</tr>";
					}
					$("#auctionPackageDetaileds").html(suppliertalbe);

					if(data.resultType == 0) { //0为中选通知 1为为中选通知
						var html = "<tr><td>序号</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
						for(var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td width='50px'>" + (i + 1) + "</td>";
							html += "<td style='text-align:left;'>" + BidResultItem[i].enterpriseName + "</td>"; //供应商名称
							html += "<td style='width:110px;'><div class='" + (BidResultItem[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (BidResultItem[i].isBid == 0 ? "中选" : "未中选") + "</div></td>";
							
							if(!BidResultItem[i].isBid){
								html += "<td style='width:110px;text-align:center;'>" + (Number(BidResultItem[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
							}else{
								html += "<td></td>";
							}
							
							//html += "<td style='width:120px;text-align:center;'>" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
							
							if(BidResultItem[i].resultContent){
						    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						    } else {
						    	html += "<input type='hidden' class='bidContent' name='' value=''>";
						    }
						    
							html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
					} else {
						var html = "<tr><td width='50px;'>序号</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td style='width:120px'>操作</td></tr>";
						for(var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td>" + (i + 1) + "</td>";
							html += "<td style='text-align:left;'>" + BidResultItem[i].enterpriseName + "</td>";
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
				} else {

					item = data.auctionPackageDetaileds;
					if(item == undefined || item.length <= 0) { //无供应商
						$("#whyFailureTr").show();
						$("#whyFailure").html("无供应商报价");
						return;
					}
					//"<td>供应商名称</td><tr>";
					var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td width='50px'>排名</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
					for(var j = 0; j < item.length; j++) {
						var count = item[j].bidResultItems.length;
						html += "<tr>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (j + 1) + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;text-align:left;'>" + (item[j].detailedName || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedVersion || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedCount || "") + "</td>";
						html += "<td rowspan='" + count + "' style='vertical-align: middle;'>" + (item[j].detailedUnit || "") + "</td>";
						if(data.resultType == 0) {
							for(var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;text-align:left' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
								html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
								
								if(!item[j].bidResultItems[i].isBid){
									html += "<td style='width:110px;text-align:center;'  class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "' >" + (Number(item[j].bidResultItems[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
								}else{
									html += "<td></td>"
								}
								
								//html += "<td style='width:120px;text-align:center;'  data-tr='" + j + "'  data-td='" + i + "' >" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
								
								if(item[j].bidResultItems[i].resultContent){
							    	html += "<input type='hidden' class='bidContent' name='' value='"+item[j].bidResultItems[i].resultContent+"'>";
							    } else {
							    	html += "<input type='hidden' class='bidContent' name='' value=''>";
							    }
								
								html += "<td style='vertical-align: middle;'><a href='javascript:void(0)'  data-tr='" + j + "'  data-td='" + i + "' class='viewBidResult' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
								
								html += "</tr>";
							}
						} else {
							for(var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;text-align:left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
								html += "<td style='width:110px;' class='isBidO  text-danger'  data-tr='" + j + "'  data-td='" + i + "'>未中选</td>";
								
								if(item[j].bidResultItems[i].resultContent){
							    	html += "<input type='hidden' class='bidContent' name='' value='"+item[j].bidResultItems[i].resultContent+"'>";
							    } else {
							    	html += "<input type='hidden' class='bidContent' name='' value=''>";
							    }
								
								html += "<td style='vertical-align: middle;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						}

					}

					$("#bidResultInfo").html(html);

				}
			}
		}
	})
})

var commitData = "";
$("#btn_submit").on("click", function() {

	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();

	if(!resultType) {
		layer.alert("请选择通知类型！");
		return;
	}
	if(!isShow) {
		layer.alert("请选择是否加盖企业公章！");
		return;
	}

	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			layer.alert("请选择审核人");
			return;
		}
	}

	var isBidPriceNull = ''; //判断中选金额是否为空
	var isBidPriceReg = ''; //判断中选金额是否符合正则
	//	var isServiceChargeNull = ''; //判断税费是否为空
	//	var isServiceChargeReg = ''; //判断税费是否为空

	var reg = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/
	if(auctionModel == 0) {
		$(".bidPrice").each(function() {
			if($(this).parent().siblings().eq(3).children().val() == 0) {
				if($(this).val() == "") {
					isBidPriceNull = 1;
				}
				if(!reg.test($(this).val())) {
					isBidPriceReg = 1;
				}
			}
		})
	} else {
		$(".bidPrice").each(function() {
			var tr = $(this).data("tr");
			var td = $(this).data("td");

			if($("select[data-tr='" + tr + "'][data-td='" + td + "']").val() == 0) {
				if($(this).val() == "") {
					isBidPriceNull = 1;
				}
				if(!reg.test($(this).val())) {
					isBidPriceReg = 1;
				}
			}
		})
	}


	/*var para = {
		projectId: rowData.projectId,
		packageId: rowData.packageId,
		resultType: resultType,
		isShow: isShow,
		tenderType:2
	}

	if(type == "modify" || type == "update") {
		para.id = rowData.id
	}

	if(isWorkflow) { //是否存在审核人
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}*/

	var bidResult = $("#bidResult").serialize();
	//commitData  =  $.param(para) + "&" + bidResult;
	
	commitData = serializeForm($("#bidResult"));
	commitData.projectId= rowData.projectId;
	commitData.packageId= rowData.packageId;
	commitData.resultType= resultType;
	commitData.isShow= isShow;
	commitData.tenderType=2;
	
	if(type == "modify" || type == "update") {
		commitData.id = rowData.id
	}

	if(isWorkflow) { //是否存在审核人
		commitData.checkerId = $("#employeeId").val();
	} else {
		commitData.checkerId = 0;
	}
	
 	var results =serializeForm($("#bidResult"));
	
	if(bidResult.length > 0){
		var isalert=true;
		for(ore in results){
			var arr =ore.split('.');
			
			if(arr[arr.length-1]=='isBid' && results[ore]==0){
				isalert=false;
				break
			}
		}
		
		if(isalert){
			parent.layer.confirm('当前未设置中选供应商是否继续', {
			  btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero){
			   if(isWorkflow == 0){
					//没有设置流程审批
					parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
					  btn: ['是', '否'] //可以无限个按钮
					}, function(index1, layero){
						commit();
					  parent.layer.close(index1);			 
					}, function(index2){
					   parent.layer.close(index2);
					});
				}else{
					commit();
				}
			   parent.layer.close(index);			 
			}, function(index){
			   parent.layer.close(index);
			});
		}else{
			if(isWorkflow == 0){
				//没有设置流程审批
				parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
				  btn: ['是', '否'] //可以无限个按钮
				}, function(index, layero){
				  commit();
				  parent.layer.close(index);			 
				}, function(index){
				   parent.layer.close(index);
				});
			}else{
				commit();
			}
		}
	}else{
		if(isWorkflow == 0){
			//没有设置流程审批
			parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			  btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero){
			  commit();
			  parent.layer.close(index);			 
			}, function(index){
			   parent.layer.close(index);
			});
		}else{
			commit();
		}
	}

})


function commit(){
	$.ajax({
		url: urlInsertProjectBidResult,
		type: "post",
		data:commitData ,
		success: function(data) {
			if(data.success) {
				parent.$('#BidResultList').bootstrapTable('refresh');
				top.layer.closeAll();
				top.layer.alert("发布成功");
			} else {
				layer.alert(data.message);
				$("select[name='isBid']").each(function() { 
					$(this).attr("disabled", true);
				})
			}
		}
	});
}


function serializeForm(form){
    var obj = {};
    $.each(form.serializeArray(),function(index){
	     if(obj[this['name']]){
	      obj[this['name']] = obj[this['name']] + ','+this['value'];
	     } else {
	      obj[this['name']] =this['value'];
	     }
    });

    return obj;
}


$("#btn_close").on("click", function() {
	top.layer.closeAll();
})

//加载审核人
function WorkflowUrl() {
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "jgtzs"
		},
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) { // 没有设置审核人
				isCheck=true;
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").hide();
				$('.employee').hide();
				return;
			};
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data.length == 0) {
					option = '<option>暂无审核人员</option>'
				}
				if(data.data.length > 0) {

					option = "<option value=''>请选择审核人员</option>"
					for(var i = 0; i < data.data.length; i++) {
						option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
					}
				}
			}
			$("#employeeId").html(option);
		}
	});
}


function viewBidResult($index,temp) {	
	if($('input[name="isShow"]:checked').val()!=undefined&&$('input[name="isShow"]:checked').val()!=""){
		BidResultItem[$index].isShow=$('input[name="isShow"]:checked').val();
	}else{
		BidResultItem[$index].isShow=0;
	}	
	
	if(temp == "view"){
		if($('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
			BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
		}else{
			BidResultItem[$index].isBid=1
		}	
		
	}
	
	top.layer.open({
		type: 2,
		title: "查看结果通知书",
		area: ['550px', '650px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		content: 'Auction/Sale/Supplier/SaleResult/model/newViewResult.html',
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(BidResultItem[$index],temp);
		}
	});
}


/*
 * 2018-11-12  H  add
 * 编辑结果通知书
 */
function editBidResult($index){
	if($('input[name="isShow"]:checked').val()!=undefined&&$('input[name="isShow"]:checked').val()!=""){
		BidResultItem[$index].isShow=$('input[name="isShow"]:checked').val()
	}else{
		BidResultItem[$index].isShow=0
	}
	
	
	if($('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
		BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
	}else{
		BidResultItem[$index].isBid=1
	}	

	BidResultItem[$index].quotationUnit = quotationUnit;
	top.layer.open({
		type: 2,
		title: "编辑结果通知书",
		area: ['550px', '600px'],
		maxmin: false,
		resize: false,
		closeBtn: 1,
		btn:["保存","取消"],
		content: 'Auction/Sale/Agent/SaleResult/model/newViewResult.html',
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(BidResultItem[$index],"edit");
			
		},
		yes:function(index,layero){ 
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if(iframeWin.editor.txt.text() == ""){
				parent.layer.alert("请输入内容");
				return;
			}
			BidResultItem[$index].resultContent=iframeWin.editor.txt.html()//编辑后的通知临时存到数据中
			$('input[name="bidResultItems[' + $index + '].resultContent"]').val(iframeWin.editor.txt.html());		
			parent.layer.close(index);
		}
	});
}