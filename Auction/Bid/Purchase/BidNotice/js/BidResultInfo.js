var WorkflowTypeUrl = top.config.bidhost + "/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var urlInsertProjectBidResult = top.config.bidhost + "/ProjectBidResultController/insertProjectBidResult.do?";//发布提交接口
var urlInsertNewProjectBidResult = top.config.bidhost + "/ProjectBidResultController/insertNewProjectBidResult.do?";//保存
var resultNoticeHistoryView = "Auction/common/Agent/BidNotice/modal/BidResultInfoHistory.html";//查看历史
var projectId = $.query.get("projectId");
var packageId = $.query.get("id");
var examType = $.query.get("examType");
var type = $.query.get("special"); //RELEASE发布公示  view查看详情  VIEW重新发布
var keyId = $.query.get("keyId");

var projectType="";
var tenderTypeCode=0;//询比采购

var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false;

var BidResultItem = []; //分项集合
var checkState = "";
var subData = "";

var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var businessid = '';
var ue;
$(function() {
	if(examType == 0){
		$(".unitShow").hide();
	}else{
		if(type == 'RELEASE' || type == 'CHANGE'){
			$('#btn_save').show();
		}
	}
	if(keyId == 'undefined'){
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
		changeWinner();
	});
	if(type != "RELEASE" && type != "CHANGE") { //查看
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
		// url = top.config.bidhost + "/ProjectBidResultController/findBidResultInfo.do"; //查看结果通知书
		para = {
			id: keyId,
			packageId: packageId,
			projectId: projectId,
			examType:examType,
			tenderType: tenderTypeCode //0为询比采购，1为竞价采购，2为竞卖,6为单一来源
		}
	}else {
		$('.view').hide();
		$('.edit').show();
		if(type == "CHANGE"){
			$('[name=isPublic]').attr("disabled", "disabled")
		}
		//初始化编辑器
        // ue = UE.getEditor('container');
        new UEditorEdit({
            contentKey:"content"
        });
        // url = top.config.bidhost + "/BidNoticeController/findPackageInfo.do"; //查看包件
		para = {
			packageId: packageId,
			projectId: projectId,
			examType:examType,
			tenderType: tenderTypeCode //0为询比采购，1为竞价采购，2为竞卖,6为单一来源
		}
		if(keyId != 'undefined' && keyId) {
			para.id = keyId;
			businessid = keyId;
		}
		if(examType==0){
			$(".readyWatch").hide();
		}else{
			$(".readyWatch").show();
		}
		$(".isbid").hide(); //隐藏采购结果中选
	}
	$.ajax({
		url: top.config.bidhost + "/BidResultHisController/findBidResultInfo.do",
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

			projectType = data.projectType;//项目类型
			// if(data.isPublic>1){
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
			// }else{
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			// }
			if (examType == 0) {
				$("input[name='isPublic'][value=" + '1' + "]").prop("checked", true);
			} else {
				$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			}
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
				if(data.content) {
					ue.ready(function() {
						ue.setContent(data.content);
					});
				}
				$('[name=days]').val((keyId == '')?'1':data.days?data.days:'');
				$('[name=title]').val(data.title?data.title:'');
				BidResultItem = data.priceChecks;
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
				modelOption({'tempType':(type == "RELEASE"?'inquiryRatioResultsNotice':'inquiryRatioChangeResultsNotice'), 'examinationType':2,'projectType':projectTypes});
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
				if(BidResultItem == undefined || BidResultItem.length <= 0) { //无供应商
					$("#whyFailureTr").show();
					if(examType == 0){
						$("#whyFailure").html("无供应商参与预审");
					}else{
						$("#whyFailure").html("无供应商报价");
					}
					
					return;
				}
				var RenameData = getBidderRenameData(packageId);//供应商更名信息
				if(examType == 0){					
					var html = "<tr>"
					html+="<td style='width:50px;text-align:center'>序号</td>";
					html+="<td style='text-align:left'>供应商名称</td>";
//					html+="<td style='text-align:center'>报名费(元)</td>"
					html+="<td>淘汰</td>";
					html+="<td style='width:150px'>操作</td>";
					html+="</tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
						html += "<input type='hidden' class='supplierId' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";			
						if(BidResultItem[i].isOut){
					    	html += "<td><input type='hidden' class='isOut' name='bidResultItems[" + i + "].isBid' value='1'>是</td>";
					    } else {
					    	html += "<td><input type='hidden' class='isOut' name='bidResultItems[" + i + "].isBid' value='0'>否</td>";
					    }
					    if(BidResultItem[i].resultContent){
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value='"+BidResultItem[i].resultContent+"'>";
					    } else {
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value=''>";
					    }
					    if(type == "RELEASE" || type == "CHANGE"){
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>"
						}else{
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}
					    
					}
					$("#bidResultInfo").html(html);
					
				}else{
					var html = "";
					
					html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style= 'width:120px;text-align:center;'>成交价</td><td style='width:150px'>操作</td></tr>";
					
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
						html += "<input type='hidden' class='supplierId' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
						if(BidResultItem[i].isOut == 0){
							if(BidResultItem[i].isBid != undefined){
								if(BidResultItem[i].isBid == 0){
									//中选
									html += "<td style='width:110px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='0'>中选</option><option value='1'>未中选</option></select></td>";
								}else{
									//未中选
									html += "<td style='width:110px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
								}
								
							}else{
								html += "<td style='width:110px;'><select class='form-control isBid' data-index='"+ i +"' name='bidResultItems[" + i + "].isBid'><option value='1'>未中选</option><option value='0'>中选</option></select></td>";
							}
						}else{
							html += "<td style='width:110px;'><input type='hidden' name='bidResultItems[" + i + "].isBid' value='1'><span>未中选</span></td>";
						}
		
						//html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:center'><input type='hidden' class='form-control bidPrice' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].totalCheck).toFixed(top.prieNumber||2))+"' />"+(Number(BidResultItem[i].totalCheck).toFixed(top.prieNumber||2))+"</td>":"<td  style='width:100px;text-align:center'></td>";
						//中选金额
						BidResultItem[i].baseTotalCheck = BidResultItem[i].totalCheck || '';
						if(BidResultItem[i].isOut == 0){//未淘汰
							if(BidResultItem[i].isBid != undefined){
								if(BidResultItem[i].isBid == 0){
									//中选
									html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:center'><input  data-index='"+ i +"' class='form-control bidPrice' oninput='verifyMoney(this, "+pointNum+")' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].totalCheck))+"' /></td>":"<td  style='width:100px;text-align:center'></td>";
								}else{
									//未中选
									html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:center'><input readonly='readonly'  data-index='"+ i +"' class='form-control bidPrice' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].totalCheck))+"' /></td>":"<td  style='width:100px;text-align:center'></td>";
								}
								
							}else{
								//默认未中选
								html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:center'><input readonly='readonly'  data-index='"+ i +"' class='form-control bidPrice' name='bidResultItems[" + i + "].bidPrice'  value='"+(Number(BidResultItem[i].totalCheck))+"' /></td>":"<td  style='width:100px;text-align:center'></td>";
							}
						}else{//淘汰
							html += "<td  style='width:120px;text-align:center'><input type='hidden' class='form-control bidPrice' name='bidResultItems[" + i + "].bidPrice'  value='' /></td>";
						}
						
						
						if(BidResultItem[i].resultContent){
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value='"+BidResultItem[i].resultContent+"'>";
					    } else {
					    	html += "<input type='hidden' class='bidContent' name='bidResultItems[" + i + "].resultContent' value=''>";
					    }
						    
						if(type == "RELEASE" || type == "CHANGE"){
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>"
						}else{
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}				
					}
					$("#bidResultInfo").html(html);
	
					$(".isBid").change(function() { // 只能有一个中选供应商						
						var _index=$(this).attr('data-index');	
						var isBidThis=$(this)
						if(BidResultItem[_index].resultContent!=""&&BidResultItem[_index].resultContent!=undefined){
							parent.layer.confirm('温馨提示：切换后您编辑的内容将会改变，确定切换？', {
								btn: ['是', '否'] //可以无限个按钮
							},function(index, layero){
								BidResultItem[_index].resultContent="";
								isBidThis.parent().parent().find(".bidContent").val("");
								changeIsBid(isBidThis);
								parent.layer.close(index)
							}, function(index) {
								console.log(isBidThis.val())
								if(isBidThis.val()==0){
									isBidThis.val('1')
								}else{
									isBidThis.val('0')
								}
								changeIsBid(isBidThis);
								parent.layer.close(index)
							})
						}else{
							
							changeIsBid(isBidThis);
						}
						
//						if($(this).val() == 0) {
//							
//							$(this).parent().parent().siblings().each(function() {
//								if($(this).children().eq(3).children().eq(0).val() == 0) {
//									$(this).children().eq(3).children().eq(0).val(1);
//									$(this).children().eq(3).children().eq(0).parent().siblings().eq(3).children().attr("readonly", "readonly");
//									$(this).children().eq(3).children().eq(0).parent().siblings().eq(4).children().attr("readonly", "readonly");
//									layer.alert("只能选择一个中选供应商");
//								}
//							});
//						}
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
	
					/*$(".isBid").on("change", function() { //中选 填写金额
						if($(this).val() == 0) {
							$(this).parent().siblings().eq(3).children().removeAttr("readonly");
							$(this).parent().siblings().eq(4).children().removeAttr("readonly");
						} else {
							$(this).parent().siblings().eq(3).children().attr("readonly", "readonly");
							$(this).parent().siblings().eq(4).children().attr("readonly", "readonly")
						}
					})*/
					
					//成交金额
					$(".bidPrice").on('change',function(_index){
						var _pindex = $(this).attr('data-index');
						var bidPriceThis = $(this);
						//console.log(BidResultItem[_pindex].totalCheck);
						if(!(rm.test(bidPriceThis.val())) || bidPriceThis.val() == 0){ 
							parent.layer.alert("成交价必须大于零且最多"+ weiChnise +"位小数"); 
							bidPriceThis.val("");
							return;
						};
						
						//修改后成交金额
						var newBidPrice =Number(bidPriceThis.val()) ;
						
						if(BidResultItem[_pindex].resultContent!=""&&BidResultItem[_pindex].resultContent!=undefined){
							parent.layer.confirm('温馨提示：修改成交价后您编辑的内容将会改变，确定修改？', {
								btn: ['是', '否'] //可以无限个按钮
							},function(index, layero){
								
								BidResultItem[_pindex].totalCheck = newBidPrice;
								BidResultItem[_pindex].resultContent = "";//文本内容
								$("input[name='bidResultItems["+_pindex+"].resultContent']").val("");
								bidPriceThis.val(newBidPrice);
								
								parent.layer.close(index);
							}, function(index) {
								
								bidPriceThis.val(Number(BidResultItem[_pindex].totalCheck));
								parent.layer.close(index);
							})
						}else{
						
							BidResultItem[_pindex].totalCheck = newBidPrice;
							BidResultItem[_pindex].resultContent = "";//文本内容
							$("input[name='bidResultItems["+_pindex+"].resultContent']").val("");
							bidPriceThis.val(newBidPrice);
						}
					})
					
				}
				/*************            公告模板  --end                */
			} else { //查看时
				
				//findWorkflowCheckerAndAccp(data.id);
				$(".isWatch").hide();
				BidResultItem = data.bidResultItems;
				subData	= data.subDate;
				$(".employee").hide(); //隐藏审核人

				$("td[id]").each(function() { //填冲表格
					$(this).html(data[this.id]);
				})	
				$('#days').html(data.days?data.days:'');
				$('#title').html(data.title?data.title:'');
				$('#noticeContent').html(data.content?data.content:'');
				$("input[name='resultType'][value=" + data.resultType + "]").prop("checked", true); //选择通知类型
				if(BidResultItem.length>0){
					var RenameData = getBidderRenameData(packageId);//供应商更名信息
				}
				if(examType == 0){
					$(".readyWatch").hide();
					if(BidResultItem == undefined || BidResultItem.length == 0) { //无供应商
						$("#whyFailureTr").show();
						$("#whyFailure").html("无供应商参与预审");
						return;
					}
					var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>淘汰</td><td style='width:150px'>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
						html += "<input type='hidden' class='supplierId' name='bidResultItems[" + i + "].supplierId' value=" + BidResultItem[i].supplierId + ">";
						//html += data.price!=null?"<td  style='width:120px;text-align:center'><input type='hidden' name='bidResultItems[" + i + "].serviceCharge'  value='"+(data.price.toFixed(2))+"' />"+(data.price.toFixed(2))+"</td>":"<td  style='width:100px;text-align:center'></td>"; //服务费	
						if(BidResultItem[i].isBid){//未中选
					    	html += "<td><input type='hidden'  name='bidResultItems[" + i + "].isBid' value='1'>是</td>";
					    } else {//中选
					    	html += "<td><input type='hidden'  name='bidResultItems[" + i + "].isBid' value='0'>否</td>";
					    }
						/*if(BidResultItem[i].resultContent){
							html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						} else {
							html += "<input type='hidden' class='bidContent' name='' value=''>";
						} */  
						if(type == "RELEASE" || type == "CHANGE"){
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>"
						}else{
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}	
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

				if(BidResultItem == undefined || BidResultItem.length == 0) { //无供应商
					$("#whyFailureTr").show();
					$("#whyFailure").html("无供应商报价");
					return;
				}

				if(data.resultType == 0) { //0为中选通知 1为为中选通知
					var html = "";
					
					html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style= 'width:120px;'>成交价</td><td style='width:150px'>操作</td></tr>";
					
					//var html = "<tr><td style='width:50px;text-align:center'>序号</td><td style='text-align:left'>供应商名称</td><td>通知类型</td><td style= 'width:120px;'>成交金额("+ (top.prieUnit ||"")+")</td><td>报名费(元)</td><td>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td style='width:50px;text-align:center'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>"; //供应商名称
						if(BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'><div class='text-success'>中选</div></td>";
							//html += BidResultItem[i].totalCheck!=null?"<td  style='width:120px;text-align:right'>"+(Number(BidResultItem[i].totalCheck).toFixed(6))+"</td>":"<td style='width:110px;'></td>"; //成交价格

						} else {
							html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
							//html += "<td style='width:110px;'></td>";
							
						}
						

						if(BidResultItem[i].bidPrice != undefined &&　BidResultItem[i].isBid == 0) {
							html += "<td style='width:110px;'>" + BidResultItem[i].bidPrice + "</td>"; //成交价格
						} else {
							html += "<td style='width:110px;'></td>"; //成交价格
						}
						//html += BidResultItem[i].price!=null?"<td  style='width:120px;text-align:center'>"+(BidResultItem[i].price.toFixed(top.prieNumber||2))+"</td>":"<td  style='width:120px;'></td>"; //服务费	
						/*if(BidResultItem[i].resultContent){
							html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						} else {
							html += "<input type='hidden' class='bidContent' name='' value=''>";
						}*/
						
						if(type == "RELEASE" || type == "CHANGE"){
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>"
						}else{
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}	
					}

					$("#bidResultInfo").html(html);

				} else {
					var html = "<tr><td  style='width:50px;text-align:center;'>序号</td><td  style='text-align:left'>供应商名称</td><td>通知类型</td><td style='width:150px'>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td  style='width:50px;text-align:center;'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left'>" + showBidderRenameList(BidResultItem[i].supplierId, BidResultItem[i].enterpriseName, RenameData, 'body') + "</td>";
						html += "<td style='width:110px;'><div class='text-danger'>未中选</div></td>";
						/*if(BidResultItem[i].resultContent){
							html += "<input type='hidden' class='bidContent' name='' value='"+BidResultItem[i].resultContent+"'>";
						} else {
							html += "<input type='hidden' class='bidContent' name='' value=''>";
						}*/
						if(type == "RELEASE" || type == "CHANGE"){
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"view\")'>预览</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='editBidResult btn btn-primary' onclick='editBidResult("+i+")'>编辑</a></td></tr>"
						}else{
							html +="<td><a href='javascript:void(0)' class='viewBidResult btn btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td></tr>";
						}	
					}

					$("#bidResultInfo").html(html);
				}
			}
			
			}
			// 后审发公告，预审不发
			if(examType == 1){ 
				if(type == "CHANGE"){
					initMediaVal(data.options, {
						disabled: true,
						stage: 'jgtzs',
						projectId: projectId,
						packageId: packageId,
					});
				}else{
					initMediaVal(data.options, {
						disabled: type != "RELEASE",
						stage: 'jgtzs',
						projectId: projectId,
						packageId: packageId,
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
			}
		}

	})
});
function changeWinner(){
	var val = $("[name='isWinner']:checked").val();
	if (val == 1) {
		$(".isBid").each(function () {
			$(this).attr('disabled',false);
			$(this).change();
		})
	}else{
		$(".isBid").each(function () {
			$(this).val('1').attr('disabled',true).closest('tr').find('.bidPrice').attr('readonly','readonly');
			$(this).change();
		})
	}
}
/*************            公告模板                 */
//切换模板
function changHtml(templateId){
	save('2', templateId)
}
/*************            公告模板  --end                */
//中选未中选切换
function changeIsBid(_isBidDa){
	var _index = _isBidDa.attr('data-index');	
	if(_isBidDa.val() == 0) {//中选
		_isBidDa.parent().siblings().eq(3).children().removeAttr("readonly");
	} else {//未中选
		if(BidResultItem[_index].baseTotalCheck != ''){
			BidResultItem[_index].baseTotalCheck = Number(BidResultItem[_index].baseTotalCheck)
		}
		BidResultItem[_index].totalCheck = BidResultItem[_index].baseTotalCheck;
		_isBidDa.parent().siblings().eq(3).children().val(BidResultItem[_index].totalCheck);
		_isBidDa.parent().siblings().eq(3).children().prop("readonly", "readonly");
	}
}


$("#btn_submit").on("click", function() { 
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidResult = $("#bidResult").serialize();
	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();
	var isWinner = $("input[name='isWinner']:checked").val();
	var pushPlatform = $("input[name='pushPlatform']:checked").val();
	var title = $("input[name='title']").val();
	var days = $("input[name='days']").val();
	var noticeContent = ue.getContent();
	var regDay = /^[1-9]\d*$/;
	if (!resultType && examType == 1) {
		top.layer.alert("请选择通知类型！");
		return;
	}
	if (!isShow && examType == 1) {
		top.layer.alert("请选择是否加盖企业公章！");
		return;
	}
	
	if(!isPublic && examType == 1) {
		parent.layer.alert("请选择是否公开");
		return;
	}
	// 公开
	if (isPublic == '0' && examType == 1 && !isMediaValid()) {
		return;
	}
	if (isPublic == '0' && examType == 1) {
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

		if(!mediaEditor.isValidate()){
			return;
		}
	}

	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			layer.alert("请选择审核人");
			return;
		}
	}
	if($("input[type='radio'][name='resultType']:checked").val() == 1) {
		$(".isBid").removeAttr("disabled");
	}
	//选择有中选人时验证
	var isNext = true;
	if( examType == 1){
		if (!isWinner) {
			top.layer.alert("请选择有无中选人！");
			return;
		}else{
			if(isWinner == 1){
				isNext = false;
				$(".isBid").each(function () {
					if($(this).find('option:selected').val() == 0){
						isNext = true
					}
				})
			}
		}
	}
	if(!isNext){
		top.layer.alert("供应商结果通知类型全部“未中选”，请至少选择一个“中选”！");
		return
	}
	//提交前恢复方便表单提交取值
	$(".isBid").each(function () {
		$(this).attr('disabled',false)
	});
	//取完值后判断是否恢复禁用
	var bidResult = serializeObject($("#bidResult"));
	if ($("[name='isWinner']:checked").val() == 0) {
		$(".isBid").each(function () {
			$(this).val('1').attr('disabled',true)
		})
	}
	bidResult.projectId=projectId;
	bidResult.packageId=packageId;
	bidResult.resultType=resultType;
	bidResult.isShow=isShow;
	bidResult.isWinner = isWinner;
	bidResult.examType=examType;
	bidResult.tenderType=0;
	bidResult.pushPlatform = pushPlatform;
	bidResult.title = title;
	bidResult.days = days;
	bidResult.content = noticeContent;
	bidResult.checkState = 1;
	// 媒体发布
	bidResult.optionId = typeIdLists;
	bidResult.optionValue = typeCodeLists;
	bidResult.optionName = typeNameLists;
	
	bidResult.isOpen = isPublic;
	if(type == "modify" || type == "update") {
		bidResult.id = keyId
	}

	if(isWorkflow) { //是否存在审核人
		bidResult.checkerId = $("#employeeId").val();
	} else {
		bidResult.checkerId = 0;
	}
	
	bidResult = $.extend(bidResult, mediaEditor.getValue())
	if(isWorkflow == 0){
		//没有设置流程审批
		parent.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
		  btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero){
			$.ajax({
				url: urlInsertProjectBidResult,
				data: bidResult,
				type: 'post',
				success: function(data) {
					if(data.success) {
						if(top.window.document.getElementById("consoleWindow")){//项目控制台刷新
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
						}
						parent.$('#BidResultList').bootstrapTable('refresh');
						parent.layer.close(parent.layer.getFrameIndex(window.name));
						top.layer.alert("发布成功");
					} else {
						layer.alert(data.message);
						$("select[name='isBid']").each(function() {
							$(this).attr("disabled", true);
						})
					}
				}
			});
		  parent.layer.close(index);			 
		}, function(index){
		   parent.layer.close(index);
		});
	}else{
		$.ajax({
			url: urlInsertProjectBidResult,
			data: bidResult,
			type: 'post',
			success: function(data) {
				if(data.success) {
					if(top.window.document.getElementById("consoleWindow")){//项目控制台刷新
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
		   	    		dcmt.getDetail();
					}
					parent.$('#BidResultList').bootstrapTable('refresh');
					parent.layer.close(parent.layer.getFrameIndex(window.name));
					top.layer.alert("发布成功");
				} else {
					layer.alert(data.message);
					$("select[name='isBid']").each(function() {
						$(this).attr("disabled", true);
					})
				}
			}
		})
	
	}

})
$('#btn_save').click(function(){
	save('1')
})
//saveType 1 保存按钮   2 切换模版时保存
function save(saveType, templateId){
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidResult = $("#bidResult").serialize();
	var resultType = $("input[name='resultType']:checked").val();
	var isShow = $("input[name='isShow']:checked").val();
	var isWinner = $("input[name='isWinner']:checked").val();
	var pushPlatform = $("input[name='pushPlatform']:checked").val();
	var title = $("input[name='title']").val();
	var days = $.trim($("input[name='days']").val());
	var noticeContent = ue.getContent();
	var regDay = /^[1-9]\d*$/;
	if(examType == 1 && saveType == 1){
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
	if ($("input[type='radio'][name='resultType']:checked").val() == 1) {
		$(".isBid").removeAttr("disabled");
	}
	//提交前恢复方便表单提交取值
	$(".isBid").each(function () {
		$(this).attr('disabled',false)
	});
	var bidResult = serializeObject($("#bidResult"));
	//取完值后判断是否恢复禁用
	if ($("[name='isWinner']:checked").val() == 0) {
		$(".isBid").each(function () {
			$(this).val('1').attr('disabled',true)
		})
	}
	bidResult.projectId = projectId;
	bidResult.packageId = packageId;
	bidResult.resultType = resultType;
	bidResult.isShow = isShow;
	bidResult.isWinner = isWinner;
	bidResult.examType = examType;
	bidResult.tenderType = 0;
	bidResult.pushPlatform = pushPlatform;
	bidResult.title = title;
	bidResult.days = days;
	bidResult.content = noticeContent;
	
	// 媒体发布
	bidResult.optionId = typeIdLists;
	bidResult.optionValue = typeCodeLists;
	bidResult.optionName = typeNameLists;
	
	bidResult.isOpen = isPublic;
	bidResult.checkState = 0;
	if (keyId && keyId != '') {
		bidResult.id = keyId
	}
	bidResult.opraType = 0;
	/*start代理服务费*/
	//opraType:1是提交0是保存
	var newUrl;
	var notText = '';
	newUrl = urlInsertProjectBidResult;
	$.ajax({
		url: newUrl,
		data: bidResult,
		type: 'post',
		async: false,
		success: function (data) {
			if (data.success) {
				keyId = data.data;
				if (top.window.document.getElementById("consoleWindow")) {//项目控制台刷新
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				}
				parent.$('#BidResultList').bootstrapTable('refresh');
				if(saveType == 2){
					modelHtml({'type':'jggg', 'projectId':projectId,'packageId':packageId,'tempId':templateId,'tenderType':0,'examType':examType})
				}else{
					top.layer.alert("温馨提示：保存成功");
				}
			} else {
				top.layer.alert(data.message);
			}
			$("select[name='isBid']").each(function () {
				$(this).attr("disabled", true);
			})
		}
	});
}
function serializeObject(form){
	var tabTemp ={};
	$.each(form.serializeArray(),function(index){
		if(tabTemp[this['name']]){
			tabTemp[this['name']] = tabTemp[this['name']] +","+this['value']; 
		}else{
			tabTemp[this['name']] = this['value'];
		}
	});
	return tabTemp;
}

$("#btn_close").on("click", function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
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

function viewBidResult($index,tamp) {	
	if($('input[name="isShow"]:checked').val()!=undefined&&$('input[name="isShow"]:checked').val()!=""){
		BidResultItem[$index].isShow=$('input[name="isShow"]:checked').val()
	}else{
		BidResultItem[$index].isShow=0
	}
	BidResultItem[$index].projectId=projectId;
	BidResultItem[$index].packageId=packageId;
	BidResultItem[$index].examType=examType;	
	if(tamp == "view"){
		if(examType == 0){
			if($('input[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('input[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
				BidResultItem[$index].isBid=$('input[name= "bidResultItems[' + $index + '].isBid"]').val();
			}else{
				BidResultItem[$index].isBid=1
			}
		}else{
			if($('.isBid[name="bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name="bidResultItems[' + $index + '].isBid"]').val()!=""){
				BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
			}else{
				BidResultItem[$index].isBid=1
			}
			
			//中选金额
			if($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val()!=undefined&&$('input[name= "bidResultItems[' + $index + '].bidPrice"]').val()!=""){
				console.log($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val());
				BidResultItem[$index].bidPrice = $('input[name= "bidResultItems[' + $index + '].bidPrice"]').val();
			}
		}

		// 改为查看pdf页面形式
		getContentHtml(BidResultItem[$index], tamp);
		
		// top.layer.open({
		// 	type: 2,
		// 	title: "查看结果通知书",
		// 	area: ['550px', '650px'],
		// 	// maxmin: false,
		// 	resize: false,
		// 	closeBtn: 1,
		// 	content: 'Auction/common/Purchase/BidNotice/modal/newViewResult.html',
		// 	success: function(layero, index) {
		// 		var body = layer.getChildFrame('body', index);
		// 		var iframeWin = layero.find('iframe')[0].contentWindow;
		// 		iframeWin.getMsg(BidResultItem[$index],tamp);
		// 	}
		// });		
	}else if(tamp == "views"){
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
				content: 'Auction/common/Purchase/BidNotice/modal/newViewResult.html',
				success: function(layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(BidResultItem[$index],tamp);
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
	

	if(examType == 0){
		if($('input[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('input[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
			BidResultItem[$index].isBid=$('input[name= "bidResultItems[' + $index + '].isBid"]').val();
		}else{
			BidResultItem[$index].isBid=1
		}
	}else{
		if($('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
			BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
		}else{
			BidResultItem[$index].isBid=1
		}
		
		//中选金额
		if($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val()!=undefined&&$('input[name= "bidResultItems[' + $index + '].bidPrice"]').val()!=""){
			console.log($('input[name= "bidResultItems[' + $index + '].bidPrice"]').val());
			BidResultItem[$index].bidPrice = $('input[name= "bidResultItems[' + $index + '].bidPrice"]').val();
		}
		
	}	
	BidResultItem[$index].projectId=projectId;
	BidResultItem[$index].packageId=packageId;
	BidResultItem[$index].examType=examType;
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
		content: 'Auction/common/Purchase/BidNotice/modal/editViewResult.html',
		success: function(layero, index) {
			var body = layer.getChildFrame('body', index);
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getMsg(BidResultItem[$index], "edit", function(){
				if(iframeWin.ue.getContent() == ""){
					parent.layer.alert("请输入结果通知内容或选择结果通知模板");
					return;
				}
				BidResultItem[$index].resultContent=iframeWin.ue.getContent()//编辑后的通知临时存到数据中
				BidResultItem[$index].templateId=iframeWin.templateId
				$('input[name="bidResultItems[' + $index + '].resultContent"]').val(iframeWin.ue.getContent());		
				parent.layer.close(index);
			});	
		},
		yes:function(index,layero){ 
			var iframeWin = layero.find('iframe')[0].contentWindow;
			if(iframeWin.ue.getContent() == ""){
				parent.layer.alert("请输入结果通知内容或选择结果通知模板");
				return;
			}
			BidResultItem[$index].resultContent=iframeWin.ue.getContent()//编辑后的通知临时存到数据中
			BidResultItem[$index].templateId=iframeWin.templateId
			$('input[name="bidResultItems[' + $index + '].resultContent"]').val(iframeWin.ue.getContent());		
			parent.layer.close(index);
		}
	});
}

/*************start获取报价信息****************/
var rm
var weiChnise='两';
var pointNum;
getPriceUnit();
function getPriceUnit(){
	$.ajax({
		url: top.config.bidhost + "/NegotiationController/findPriceList.do",
		dataType: 'json',
		data: {
			packageId: packageId
		},
		async:false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return;
			}
			if(data.data && data.data.quotePriceUnit){
				$("#quotePriceUnit").html((data.data.quotePriceName ? data.data.quotePriceName + "（" : "") + data.data.quotePriceUnit + (data.data.quotePriceName ? "）" : ""));
			} else {
				$("#quotePriceUnit").html("元");
			}
			if(data.data && data.data.pointNum!=undefined){
                pointNum=data.data.pointNum
            }else{
                pointNum=2
            }
            if(pointNum==0){
				var rs = "^[1-9][0-9]*$";
				weiChnise='零'
            }else{
                //大于0的数字的正则表达式
				var rs="^(([1-9][0-9]*)|(([0]\\.\\d{1,"+ pointNum +"}|[1-9][0-9]*\\.\\d{1,"+ pointNum +"})))$";
				weiChnise=(pointNum==2?'两':top.sectionToChinese(pointNum))
            }
            rm =new RegExp(rs);
		},
		error: function(){
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
		url: parent.config.bidhost + '/WordToHtmlController/wordToHtml.do',
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"packageId": datall.packageId,
			"projectId": datall.projectId,
			"examType": datall.examType,
			'type': "jgtzs",
			"tenderType": 0,
			"isBid": isBidCode,
			"supplierId": datall.supplierId,
			"auctionModel": datall.auctionModel,
			"detailedId": datall.packageDetailedId,
			"bidPrice": datall.bidPrice || ''
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