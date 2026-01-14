var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id"); 
var projectId = getUrlParam("projectId"); 
//var type = $.query.get("type"); //update发布公示  view查看详情
var projectType ;
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do"

//发布提交接口 
// var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertProjectBidResult.do?";
var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertJjProjectBidResult.do?";
// var urlInsertNewProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertNewProjectBidResult.do?";//保存
var urlInsertNewProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertNewJjProjectBidResult.do?";//保存
var resultNoticeHistoryView = "Auction/Sale/Agent/SaleResult/model/SaleResultInfoHistory.html";//查看历史
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck=false;

var BidResultItem = []; //分项集合
var checkState = "";
var subData = "";
var auctionModel = ""; //按照明细还是包件
var price = 0;
var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var businessid = '';
var ue;
var resultItem = [];//供应商集合，用于提交
var examType = 1;
var RenameData = {};
$(function() {
	RenameData = getBidderRenameData(projectId);//供应商更名信息
	if(keyId == 'undefined'){
		$("input[name='pushPlatform'][value=2]").attr("checked", "checked"); //公告发布
		$("input[name='days']").val("1"); //公告时间
		keyId = "";
	}
	var para = ""; //查看数据对象
	var ulr = ""; //查看数据接口
	
//	if(rowData.price != undefined){
//		price = rowData.price;
//	}
	if(type=='RELEASE' || type == 'CHANGE'){
		checkState = "预览";
		$('#btn_save').show();
	}
	//有无中标人
	$("[name='isWinner']").click(function () {
		changeWinner()
	});

	$("input[name='resultType'][value='0']").attr("checked", true); //默认中选
	$("input[name='isShow'][value='0']").attr("checked", true); //默认显示盖章

	if(type !='RELEASE' && type != "CHANGE") { //查看
        new UEditorEdit({
            pageType: "view",
            contentKey:"content"
        });
		$("input[name='isPublic']").attr("disabled", "disabled");
		$('.view').show();
		$('.edit').hide();
		$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
		$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
		$("input[name='isWinner']").attr("disabled", "disabled"); //有无中选人
		$("#btn_submit").hide(); //提交隐藏
		// url = top.config.AuctionHost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
		para = {
			id: keyId,
			packageId: packageId,
			projectId:projectId,
			tenderType: 2 //0为询价采购，1为竞卖采购，2为竞卖
		}
	}else {
		$('.view').hide();
		$('.edit').show();
		if(type == "CHANGE"){
			$('[name=isPublic]').attr("disabled", "disabled")
		}
		//初始化编辑器
		//ue = UE.getEditor('container');
        new UEditorEdit({
            contentKey:"content"
        });
		// url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do"; //查看包件
		para = {
			packageId: packageId,
			projectId:projectId,
			tenderType: 2 //0为询价采购，1为竞卖采购，2为竞卖
		}
		if(keyId != 'undefined' && keyId) {
			para.id = keyId;
			businessid = keyId;
		}
		$(".isbid").hide(); //隐藏采购结果中选
	}

	$.ajax({
		url: top.config.AuctionHost + "/BidResultHisController/findBidResultInfo.do",
		type: 'get',
		data: para,
		dataType: 'json',
		async: false,
		success: function(result) {
			if(!result.success){
				top.layer.alert(result.message);
				return
			}
			var data = result.data;
			projectType=data.projectType
			auctionModel = result.data.auctionModel; //保存包件还是明细
			// if(data.isPublic>1){
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
			// }else{
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			// }
			$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			if(data.isShow != undefined){
				$("input[name='isShow'][value=" + data.isShow + "]").prop("checked", true); //是否公开盖章
			}
			if(data.isWinner != undefined){
				$("input[name='isWinner'][value=" + data.isWinner + "]").attr("checked", true); //有无中选人
			}
			if(type == "RELEASE" || type == "CHANGE") { //当发布时
				changeWinner()
				WorkflowUrl(); //加载审核人
				$("td[id]").each(function() {
					$(this).html(data[this.id]);
				});
				if(data.tzscontent) {
					ue.ready(function() {
						ue.setContent(data.tzscontent);
					});
				}
				$('[name=days]').val((keyId == '')?'1':data.days?data.days:'');
				$('[name=title]').val(data.title?data.title:'');
				/*************            公告模板                 */
				if(projectType==0){//项目的项目类型。
					var projectTypes='A';
				}
				if(projectType==1){
					var projectTypes='B';
				}
				if(projectType==2){
					var projectTypes='C';
				}
				if(projectType==3){
					var projectTypes='C50';
				}
				if(projectType==4){
					var projectTypes='W';
				}
				modelOption({'tempType':(type == "RELEASE"?'auctionResultsNotice':'aucChangeResultsNotice'),'projectType':projectTypes});
				//生成模板按钮
				$("#btnModel").on('click',function(){
					if($('#noticeTemplate').val()!=""){
						var templateId=$('#noticeTemplate').val()
					}else{
						ue.setContent('');
						//parent.layer.alert('温馨提示：请先选择模板');
						return false;
					}
					parent.layer.confirm('温馨提示：是否确认切换模板', {
						btn: ['是', '否'] //可以无限个按钮
					}, function(index, layero){
						changHtml(templateId)
						parent.layer.close(index);			 
					}, function(index){
						 parent.layer.close(index)
					});	
				});
				/*************            公告模板  --end                */
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
					var html = "<tr><td >序号</td><td align='left'>供应商名称</td><td>通知类型</td><td align='center'>成交金额(元)</td><td style='width:120px'>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td width='50px';align='center'>" + (i + 1) + "</td>";
						html += "<td align='left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
						html += "<input type='hidden' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
						
						if(BidResultItem[i].isEliminated != undefined && BidResultItem[i].isEliminated == '0'){//未淘汰
							if(BidResultItem[i].isBid != undefined){
								if(BidResultItem[i].isBid == 0){
									//中选
									html += "<td style='width:110px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='0'>中选</option><option value='1'>未中选</option></select></td>";
								}else{
									//未中选
									html += "<td style='width:110px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
								}
								
							}else{
								html += "<td style='width:120px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
							}
						}else{
							html += "<td style='width:110px;'><input type='hidden' name='bidResultItems[" + i + "].isBid' value='1'><span>未中选</span></td>";
						}
						
						//html += "<td  style='width:150px;' align='center'>" + BidResultItem[i].offerMoney + "</td>";
						if(BidResultItem[i].lastPrice!=null){
							html+= "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].lastPrice).toFixed(2))+"' />"+(Number(BidResultItem[i].lastPrice).toFixed(2))+"</td>";
						}else{
							if(BidResultItem[i].lastMoney!=null){
								html+= "<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].lastMoney).toFixed(2))+"' />"+(Number(BidResultItem[i].lastMoney).toFixed(2))+"</td>";
							}else{
								
								html += BidResultItem[i].offerMoney!=null?"<td  style='width:100px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].bidPrice' value='"+(Number(BidResultItem[i].offerMoney).toFixed(2))+"' />"+(Number(BidResultItem[i].offerMoney).toFixed(2))+"</td>" :"<td  style='width:120px;'> </td>";
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
						var _index=$(this).attr('data-index');	
						var isBidThis=$(this)
						if(BidResultItem[_index].resultContent!=""&&BidResultItem[_index].resultContent!=undefined){
							parent.layer.confirm('温馨提示：切换后您编辑的内容将会改变，确定切换？', {
								btn: ['是', '否'] //可以无限个按钮
							},function(index, layero){
								BidResultItem[_index].resultContent="";
								isBidThis.parent().parent().find(".bidContent").val("");
								parent.layer.close(index)
								if(isBidThis == 0) {
									isBidThis.parent().parent().siblings().each(function() {
										if(isBidThis.children().eq(3).children().eq(0).val() == 0) {
											isBidThis.children().eq(3).children().eq(0).val(1);
											isBidThis.children().eq(3).children().eq(0).parent().siblings().eq(3).children().attr("readonly", "readonly");
											parent.layer.alert("只能选择一个中选人");
										}
									});
								}								
							}, function(index) {								
								if(isBidThis.val()==0){
									isBidThis.val('1')
								}else{
									isBidThis.val('0')
								}
								parent.layer.close(index)
							})
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
							html += "<td style='vertical-align: middle;' class='enterpriseName' data-tr='" + j + "'  data-td='" + i + "'>" + showBidderRenameList(item[j].offerItems[i].supplierId, item[j].offerItems[i].enterpriseName, RenameData, 'body') + "</td>";
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
				
			} else { //查看时
				subData	= data.subDate;
				$(".isWatch").hide();
				$(".employee").hide(); //隐藏审核人

				$("td[id]").each(function() { //填冲表格
					$(this).html(data[this.id]);
				});
				$('#days').html(data.days?data.days:'');
				$('#title').html(data.title?data.title:'');
				$('#noticeContent').html(data.content?data.content:'');
				$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
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
					} /*else {
						$(".isbid").hide(); //隐藏采购结果中选
					}*/
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
							html += "<td style='text-align:left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
							html += "<td style='width:110px;'><div class='" + (BidResultItem[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (BidResultItem[i].isBid == 0 ? "中选" : "未中选") + "</div></td>";
							
							if(!BidResultItem[i].isBid){
								html += "<td style='width:110px;text-align:center;'>" + (Number(BidResultItem[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
							}else{
								html += "<td></td>";
							}
							
							//html += "<td style='width:120px;text-align:center;'>" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
							
							/*if(BidResultItem[i].resultContent){
						    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						    } else {
						    	html += "<input type='hidden' class='bidContent' name='' value=''>";
						    }*/
						    
							html += "<td style='width:110px;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}
						$("#bidResultInfo").html(html);
					} else {
						var html = "<tr><td width='50px;'>序号</td><td style='text-align:left;'>供应商名称</td><td>通知类型</td><td style='width:120px'>操作</td></tr>";
						for(var i = 0; i < BidResultItem.length; i++) {
							html += "<tr><td>" + (i + 1) + "</td>";
							html += "<td style='text-align:left;'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
							
							/*if(BidResultItem[i].resultContent){
						    	html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						    } else {
						    	html += "<input type='hidden' class='bidContent' name='' value=''>";
						    }*/
						    
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
								html += "<td style='vertical-align: middle;text-align:left' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" +  showBidderRenameList(item[j].bidResultItems[i].supplierId, item[j].bidResultItems[i].enterpriseName, RenameData, 'body') + "</td>";
								html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
								
								if(!item[j].bidResultItems[i].isBid){
									html += "<td style='width:110px;text-align:center;'  class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "' >" + (Number(item[j].bidResultItems[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
								}else{
									html += "<td></td>"
								}
								
								//html += "<td style='width:120px;text-align:center;'  data-tr='" + j + "'  data-td='" + i + "' >" + ((price.toFixed(2)) || "") + "</td>"; //平台服务费
								
								/*if(item[j].bidResultItems[i].resultContent){
							    	html += "<input type='hidden' class='bidContent' name='' value='"+item[j].bidResultItems[i].resultContent+"'>";
							    } else {
							    	html += "<input type='hidden' class='bidContent' name='' value=''>";
							    }*/
								
								html += "<td style='vertical-align: middle;'><a href='javascript:void(0)'  data-tr='" + j + "'  data-td='" + i + "' class='viewBidResult' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
								
								html += "</tr>";
							}
						} else {
							for(var i = 0; i < item[j].bidResultItems.length; i++) {
								html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
								html += "<td style='vertical-align: middle;text-align:left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
								html += "<td style='width:110px;' class='isBidO  text-danger'  data-tr='" + j + "'  data-td='" + i + "'>未中选</td>";
								
								/*if(item[j].bidResultItems[i].resultContent){
							    	html += "<input type='hidden' class='bidContent' name='' value='"+item[j].bidResultItems[i].resultContent+"'>";
							    } else {
							    	html += "<input type='hidden' class='bidContent' name='' value=''>";
							    }*/
								
								html += "<td style='vertical-align: middle;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
								html += "</tr>";
							}
						}

					}

					$("#bidResultInfo").html(html);

				}
			}
			if(type == "CHANGE"){
				initMediaVal(data.options, {
					disabled: true,
					stage: 'jgtzs',
					projectId: projectId,
					// packageId: packageId,
				});
			}else{
				initMediaVal(data.options, {
					disabled: type != "RELEASE",
					stage: 'jgtzs',
					projectId: projectId,
					// packageId: packageId,
					pushPlatform: data.pushPlatform,
				});
			}
            mediaEditor.setValue(data);
			if(data.bidResultHisList){
				resultNoticeHistoryTable(data.bidResultHisList, '1')
			}
			if(keyId != 'undefined' && keyId) {
				//审批记录
				$(".workflowList").show();
				if(!(type == 'CHANGE' && data.checkState == 2)){
					findWorkflowCheckerAndAccp(keyId);
				}
			}

			if (data.projectSource > 0) {
				$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
			}
		}
	})
})
function changeWinner(){
	var val = $("[name='isWinner']:checked").val();
	if (val == 1) {
		$("#bidResultInfo .isBid").each(function () {
			$(this).attr('disabled',false);
			$(this).change();
		})
	}else{
		$("#bidResultInfo .isBid").each(function () {
			$(this).val('1').attr('disabled',true);
			$(this).change();
		})
	}
}
/*************            公告模板                 */
//切换模板
var commitData = {};
function changHtml(templateId){
	save('2', templateId)
}
$('#btn_save').click(function(){
	save('1');
})
//saveType 1 保存按钮   2 切换模版时保存
function save(saveType, templateId){
	var isPublic = $("input[name='isPublic']:checked").val();
	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();
	var isWinner = $("input[name='isWinner']:checked").val();
	var pushPlatform = $("input[name='pushPlatform']:checked").val();
	var title = $("input[name='title']").val();
	var days = $("input[name='days']").val();
	var noticeContent = ue.getContent();
	if(saveType == 1){
		var regDay = /^[1-9]\d*$/;
		if (isPublic == '0') {
			if(days !='' && !regDay.test(days)){
				top.layer.alert("请正确输入公告时间！");
				return;
			}
			if($.trim(title).length > 100){
				top.layer.alert("采购结果公告标题限制100字以内（含）！");
				return;
			}
		}
	}
	//提交前恢复方便表单提交取值
	$(".isBid").each(function () {
		$(this).attr('disabled',false)
	});
	// commitData = serializeForm($("#bidResult"));
	setValue(serializeForm($("#bidResult")))
	commitData.bidResultItems = resultItem;
	commitData.projectId= projectId;
	commitData.packageId= packageId;
	commitData.resultType= resultType;
	commitData.isShow= isShow;
	commitData.isWinner= isWinner;
	commitData.tenderType=2;
	
	if(keyId) {
		commitData.id = keyId
	}
	commitData.pushPlatform = pushPlatform;
	commitData.title = title;
	commitData.days = days;
	
	commitData.content = noticeContent;
	commitData.opraType = 0
	commitData.checkState = 0;
	// 媒体发布
	commitData.optionId = typeIdLists;
	commitData.optionValue = typeCodeLists;
	commitData.optionName = typeNameLists;
	
	commitData.isOpen = isPublic;

	//取完值后判断是否恢复禁用
	if ($("[name='isWinner']:checked").val() == 0) {
		$(".isBid").each(function () {
			$(this).val('1').attr('disabled',true)
		})
	}
	var newUrl;
	var notText = '';
	$.ajax({
		url: urlInsertNewProjectBidResult,
		contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
		data: JSON.stringify(commitData),//解决数据量大时后台接收不到，后台对应用字符串方式接收
		// url: urlInsertNewProjectBidResult,
		// data: commitData,
		async: false,
		type: 'post',
		success: function (res) {
			if(res.success){
				keyId = res.data;
				parent.$('#BidResultList').bootstrapTable('refresh');
				if(saveType == 2){
					modelHtml({'type':'jggg', 'projectId':projectId,'packageId':packageId,'tempId':templateId,'tenderType':2,'examType':1})
				}else{
					parent.layer.alert('保存成功')
				}
			}else{
				parent.layer.alert(res.message);
			}
		}
	});
}
$("#btn_submit").on("click", function() {
	var isPublic = $("input[name='isPublic']:checked").val();
	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();
	var isWinner = $("input[name='isWinner']:checked").val();
	var pushPlatform = $("input[name='pushPlatform']:checked").val();
	var title = $("input[name='title']").val();
	var days = $("input[name='days']").val();
	var noticeContent = ue.getContent();
	var regDay = /^[1-9]\d*$/;
	if(!resultType) {
		layer.alert("请选择通知类型！");
		return;
	}
	if(!isShow) {
		layer.alert("请选择是否加盖企业公章！");
		return;
	}
	//选择有中选人时验证
	var isNext = true;
	if (!isWinner) {
		top.layer.alert("请选择有无中选人！");
		return;
	}else{
		if(isWinner == 1){
			isNext = false;
			$("#bidResultInfo .isBid").each(function () {
				if($(this).find('option:selected').val() == 0){
					isNext = true
				}
			})
		}
	}
	if(!isNext){
		top.layer.alert("供应商结果通知类型全部“未中选”，请至少选择一个“中选”！");
		return
	}
	//选择有中选人时验证 --end
	
	if(!isPublic) {
		parent.layer.alert("请选择是否公开");
		return;
	}
	// 公开
	if (isPublic == '0' && !isMediaValid()) {
		return;
	}
	if (isPublic == '0') {
		if($.trim(days) == ''){
			top.layer.alert("请输入公告时间！");
			return;
		}
		if(!regDay.test(days)){
			top.layer.alert("请正确输入公告时间！");
			return;
		}
		if($.trim(title).length == 0){
			top.layer.alert("请输入采购结果公告标题！");
			return;
		}
		if($.trim(title).length > 100){
			top.layer.alert("采购结果公告标题限制100字以内（含）！");
			return;
		}
	}
	if($.trim(ue.getContentTxt()) == ''){
		top.layer.alert("请输入采购结果公告内容！");
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
	//提交前恢复方便表单提交取值
	$("#bidResultInfo .isBid").each(function () {
		$(this).attr('disabled',false)
	});
	var bidResult = $("#bidResult").serialize();
	//commitData  =  $.param(para) + "&" + bidResult;
	
	// commitData = serializeForm($("#bidResult"));
	setValue(serializeForm($("#bidResult")))
	commitData.bidResultItems = resultItem;
	commitData.projectId= projectId;
	commitData.packageId= packageId;
	commitData.resultType= resultType;
	commitData.isShow= isShow;
	commitData.isWinner= isWinner;
	commitData.tenderType=2;
	
	if(keyId && keyId !='') {
		commitData.id = keyId
	}
	commitData.checkState = 1;
	commitData.pushPlatform = pushPlatform;
	commitData.title = title;
	commitData.days = days;
	commitData.content = noticeContent;
	// 媒体发布
	commitData.optionId = typeIdLists;
	commitData.optionValue = typeCodeLists;
	commitData.optionName = typeNameLists;
	
	commitData.isOpen = isPublic;
	if(isWorkflow) { //是否存在审核人
		commitData.checkerId = $("#employeeId").val();
	} else {
		commitData.checkerId = 0;
	}
	commitData = $.extend(commitData, mediaEditor.getValue())
 	var results =serializeForm($("#bidResult"));
	//取完值后判断是否恢复禁用
	if ($("[name='isWinner']:checked").val() == 0) {
		$("#bidResultInfo .isBid").each(function () {
			$(this).val('1').attr('disabled',true)
		})
	}
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
		contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
		data: JSON.stringify(commitData),//解决数据量大时后台接收不到，后台对应用字符串方式接收
		// url: urlInsertProjectBidResult,
		type: "post",
		// data:commitData ,
		success: function(data) {
			if(data.success) {
				if(top.window.document.getElementById("consoleWindow")){
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    dcmt.getDetail();
				}
				parent.$('#BidResultList').bootstrapTable('refresh');
//				top.layer.closeAll();
				var index = parent.layer.getFrameIndex(window.name);
				top.layer.close(index);
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
//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
})

//加载审核人
function WorkflowUrl() {
	var reData = {
		"workflowLevel": 0,
		"workflowType": "jgtzs"
	}
	
	if(businessid != ''){
		reData.id = businessid;
	}
	
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
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
			var checkerId = ''; 
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data){
					if(data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if(data.data.workflowCheckers.length > 0) {
						
						if(data.data.employee){
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for(var i = 0; i < checkerList.length; i++) {
							
							if(checkerId != '' && checkerList[i].employeeId == checkerId){
								option += '<option value="' + checkerList[i].employeeId  + '" selected="selected">' + checkerList[i].userName + '</option>'
							}else{
								option += '<option value="' + checkerList[i].employeeId  + '">' + checkerList[i].userName + '</option>'	
							}
							
						}
					}
				}else{
					option = '<option>暂无审核人员</option>'
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
	BidResultItem[$index].projectId= projectId;
	BidResultItem[$index].packageId= packageId;
	BidResultItem[$index].examType= 1;
	if(temp == "view"){
		if($('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
			BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
		}else{
			BidResultItem[$index].isBid=1
		}
		
		getContentHtml(BidResultItem[$index],temp);
		
		// top.layer.open({
		// 	type: 2,
		// 	title: "查看结果通知书",
		// 	area: ['550px', '650px'],
		// 	// maxmin: false,
		// 	resize: false,
		// 	closeBtn: 1,
		// 	content: 'Auction/Sale/Purchase/SaleResult/model/newViewResult.html',
		// 	success: function(layero, index) {
		// 		var body = layer.getChildFrame('body', index);
		// 		var iframeWin = layero.find('iframe')[0].contentWindow;
		// 		iframeWin.getMsg(BidResultItem[$index],temp);
		// 	}
		// });
	}else{
		if(BidResultItem[$index].pdfUrl){
			previewPdf(BidResultItem[$index].pdfUrl);
		}else{
			top.layer.open({
				type: 2,
				title: "查看结果通知书",
				area: ['550px', '650px'],
				// maxmin: false,
				resize: false,
				closeBtn: 1,
				content: 'Auction/Sale/Purchase/SaleResult/model/newViewResult.html',
				success: function(layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(BidResultItem[$index],temp);
				}
			});
		}
	}
	
	
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
	BidResultItem[$index].projectId= projectId;
	BidResultItem[$index].packageId= packageId;
	if(projectType==0){//项目的项目类型。
		BidResultItem[$index].projectType='A';
	}
	if(projectType==1){
		BidResultItem[$index].projectType='B';
	}
	if(projectType==2){
		BidResultItem[$index].projectType='C';
	}
	if(projectType==3){
		BidResultItem[$index].projectType='C50';
	}
	if(projectType==4){
		BidResultItem[$index].projectType='W';
	}
	top.layer.open({
		type: 2,
		title: "编辑结果通知书",
		area: ['650px', '650px'],
		// maxmin: false,
		resize: false,
		closeBtn: 1,
		// btn:["保存","取消"],
		content: 'Auction/Sale/Purchase/SaleResult/model/editViewResult.html',
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(BidResultItem[$index], "edit", function(data){
				BidResultItem[$index].templateId=data.templateId;
				BidResultItem[$index].resultContent=data.resultContent;//编辑后的通知临时存到数据中
				$('input[name="bidResultItems[' + $index + '].resultContent"]').val(data.resultContent);
			});
		},
		yes:function(index,layero){ 
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if(iframeWin.ue.getContent() == ""){
				parent.layer.alert("请填写结果通知或选项结果通知模板");
				return;
			}
			BidResultItem[$index].templateId=iframeWin.templateId
			BidResultItem[$index].resultContent=iframeWin.ue.getContent()//编辑后的通知临时存到数据中
			$('input[name="bidResultItems[' + $index + '].resultContent"]').val(iframeWin.ue.getContent());		
			parent.layer.close(index);
		}
	});
};
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
//转对象
function setValue(obj) {
	resultItem = [];
	var index = '0';//下标
	var objects = {};
	$.each(obj, function(key, val){
		var str =key.split('.');
		if(str.length > 0){
			var name = str[0].split('[');
			var item = name[1].split(']');
			if(index != item[0]){//下标与截取的下标值不一致时
				resultItem.push(objects);
				index = item[0];
				objects = {};
				objects[str[1]] = val;
			}else{
				objects[str[1]] = val;
				if(key == Object.keys(obj)[Object.keys(obj).length - 1]){//当最后一个值时
					resultItem.push(objects);
				}
			}
		}
	})
}
// 修改预览查看为pdf文件弹框
function getContentHtml(datall, type) {
	function openViewPdf(resultContent) {
		// 改为查看pdf页面形式
		$.ajax({
			type: "post",
			url: top.config.AuctionHost + "/ProjectBidResultController/previewResultPdf",
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
		url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
		type:'post',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"packageId":datall.packageId,
			"projectId":datall.projectId,
			"examType":datall.examType,
			'type':"jgtzs",
			"tenderType":2,
			"isBid":isBidCode,
			"supplierId":datall.supplierId,
			"auctionModel":datall.auctionModel,
			"detailedId":datall.packageDetailedId
		},
		success:function(result){	 
			if(result.success){
				
				if(type=="view"||type=="views"){
					if(datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined"){
						openViewPdf(datall.resultContent);		
				}else{
					openViewPdf(result.data);
				}		   				   					   			
				}	
			}
		}  
	});	

}