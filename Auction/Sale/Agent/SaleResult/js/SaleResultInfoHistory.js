var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id"); 
var projectId = getUrlParam("projectId"); 
var projectType ;
//项目审核人列表数据接口
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do"

//发布提交接口 
// var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertProjectBidResult.do?";
var urlInsertProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertJjProjectBidResult.do?";
// var urlInsertNewProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertNewProjectBidResult.do?";
var urlInsertNewProjectBidResult = top.config.AuctionHost + "/ProjectBidResultController/insertNewJjProjectBidResult.do?";
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck=false;

var BidResultItem = []; //分项集合
var subData = "";
var auctionModel = ""; //按照明细还是包件
var price = 0;
var WORKFLOWTYPE = "jgtzs"; //申明项目公告类型

var businessid = '';

// 短信发送接口 & 全局变量获取ID
var urlSendMsg = top.config.AuctionHost + "/InFormController/inFormUser";
var findPackageInfoData;
var ue;
var quotationType;//报价方式 0 金额  1 费率
var quotationUnit;
var resultItem = [];//供应商数据集合，用于提交
var examType = 1;
$(function() {
	var para = ""; //查看数据对象
	$("input[name='isPublic']").attr("disabled", "disabled");
	$('.view').show();
	$('.red').hide();
	$("input[name='resultType']").attr("disabled", "disabled"); //通知类型
	$("input[name='isShow']").attr("disabled", "disabled"); //是否盖章
	$("input[name='isWinner']").attr("disabled", "disabled"); //有无中选人
	new UEditorEdit({
		contentKey:'tzscontent',
		pageType:'view',
	})
	para = {
		id: keyId,
		packageId: packageId,
		projectId:projectId,
		tenderType: 2 //0为询价采购，1为竞卖采购，2为竞卖
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
			findPackageInfoData = result.data;
			var data = result.data;
			projectType=data.projectType;
			auctionModel = result.data.auctionModel; //保存包件还是明细	
			mediaEditor.setValue(data);
			// if(data.isPublic>1){
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
			// }else{
			// 	$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			// }
			$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
			subData	= data.subDate;
			$("td[id]").each(function() { //填冲表格
				$(this).html(data[this.id]);
			});
			if(data.isWinner){
				$('input[name="isWinner"][value="'+ data.isWinner +'"]').attr("checked",true);
			}
			$('#days').html(data.days?data.days:'');
			$('#title').html(data.title?data.title:'');
			$('[name=pushPlatform][value='+data.pushPlatform+']').attr('checked','checked');
			$('#noticeContent').html(data.content?data.content:'');
			$("input[name='resultType'][value=" + data.resultType + "]").attr("checked", true); //选择通知类型
			$("input[name='isShow'][value=" + data.isShow + "]").attr("checked", true); //是否公开盖章
			$("input[name='isWinner'][value=" + data.isWinner + "]").attr("checked", true); //有无中选人
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
				} 
			}
			quotationType = data.bidResultItems[0].quotationType?data.bidResultItems[0].quotationType:'0';
			quotationUnit = data.bidResultItems[0].quotationUnit?data.bidResultItems[0].quotationUnit:'元';
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
					var html = "<tr><td>序号</td><td style='text-align:left;'>供应商名称</td>"
					if(quotationType == 1){
						html +="<td>报价金额（"+quotationUnit+"）</td>"
					}
					html +="<td>通知类型</td><td>成交金额(" + quotationUnit + ")</td><td style='width:120px'>操作</td></tr>";
					for(var i = 0; i < BidResultItem.length; i++) {
						html += "<tr><td width='50px'>" + (i + 1) + "</td>";
						html += "<td style='text-align:left;'>" + BidResultItem[i].enterpriseName + "</td>"; //供应商名称
						if(quotationType == 1){
							html += "<td style='width:150px;'>"+(BidResultItem[i].lastOffer?BidResultItem[i].lastOffer:"")+"</td>"
						}
						html += "<td style='width:110px;'><div class='" + (BidResultItem[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (BidResultItem[i].isBid == 0 ? "中选" : "未中选") + "</div></td>";
						if(BidResultItem[i].bidPrice){
							html += "<td style='width:110px;text-align:center;'>" + (Number(BidResultItem[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
						}else{
							html += "<td></td>";
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
				var html = "<tr><td width='50px'>序号</td><td style='text-align:left;'>名称</td><td>规格型号</td><td>数量</td><td>单位</td><td width='50px'>排名</td><td style='text-align:left;'>供应商名称</td>"
				if(quotationType == 1){
					html +="<td>报价金额（"+quotationUnit+"）</td>"
				}
				html +="<td>通知类型</td><td>成交金额(" + quotationUnit + ")</td><td style='width:120px'>操作</td></tr>";
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
							if(quotationType == 1){
								html += "<td style='width:150px;'>"+(BidResultItem[i].lastOffer?BidResultItem[i].lastOffer:"")+"</td>"
							}
							html += "<td style='vertical-align: middle;text-align:left' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
							html += "<td style='width:110px;'  data-tr='" + j + "'  data-td='" + i + "' class='isBidO  " + (item[j].bidResultItems[i].isBid == 0 ? "text-success" : "text-danger") + "'>" + (item[j].bidResultItems[i].isBid == 0 ? "中选" : "未中选") + "</td>";
							if(item[j].bidResultItems[i].bidPrice){
								html += "<td style='width:110px;text-align:center;'  class='isBidPrice'  data-tr='" + j + "'  data-td='" + i + "' >" + (Number(item[j].bidResultItems[i].bidPrice).toFixed(2) || "") + "</td>"; //成交价格
							}else{
								html += "<td></td>"
							}
							html += "<td style='vertical-align: middle;'><a href='javascript:void(0)'  data-tr='" + j + "'  data-td='" + i + "' class='viewBidResult' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
							
							html += "</tr>";
						}
					} else {
						for(var i = 0; i < item[j].bidResultItems.length; i++) {
							html += "<td style='vertical-align: middle;' >" + (i + 1) + "</td>";
							html += "<td style='vertical-align: middle;text-align:left;' class='enterpriseName'  data-tr='" + j + "'  data-td='" + i + "'>" + item[j].bidResultItems[i].enterpriseName + "</td>";
							html += "<td style='width:110px;' class='isBidO  text-danger'  data-tr='" + j + "'  data-td='" + i + "'>未中选</td>";
							html += "<td style='vertical-align: middle;'><a href='javascript:void(0)' class='viewBidResult btn-sm btn-primary' onclick='viewBidResult("+i+",\"views\")'>查看</a></td>";
							html += "</tr>";
						}
					}

				}

				$("#bidResultInfo").html(html);

			}
			projectServiceFee = data.projectServiceFee; //代理服务费
			/*代理服务费*/
			initAgentFee({
				purchaseType:2,
				projectId:projectId,
				packageId:packageId,
				id: keyId
			});  
			/*代理服务费*/
			initMediaVal(data.options, {
				disabled: true,
				stage: 'jgtzs',
				projectId: projectId,
				// packageId: packageId,
				pushPlatform: data.pushPlatform,
			});
			if(data.bidResultHisList){
				resultNoticeHistoryTable(data.bidResultHisList, '1')
			}
		}
	})
	findWorkflowCheckerAndAccp(keyId);
})

$("#btn_close").on("click", function() {
//	top.layer.closeAll();
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
})

function viewBidResult($index,temp) {
	if($('input[name="isShow"]:checked').val()!=undefined&&$('input[name="isShow"]:checked').val()!=""){
		BidResultItem[$index].isShow=$('input[name="isShow"]:checked').val();
	}else{
		BidResultItem[$index].isShow=0;
	}	
	BidResultItem[$index].projectId= projectId;
	BidResultItem[$index].packageId= packageId;
	BidResultItem[$index].quotationUnit = quotationUnit;
	if(temp == "view"){
		if($('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=undefined&&$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val()!=""){
			BidResultItem[$index].isBid=$('.isBid[name= "bidResultItems[' + $index + '].isBid"]').val();
		}else{
			BidResultItem[$index].isBid=1
		}	

		getContentHtml(BidResultItem[$index],temp)
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
				content: 'Auction/Sale/Agent/SaleResult/model/newViewResult.html',
				success: function(layero, index) {
					var body = layer.getChildFrame('body', index);
					var iframeWin = layero.find('iframe')[0].contentWindow;
					iframeWin.getMsg(BidResultItem[$index],temp);
				}
			});
		}
	}
	
	
}

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
				'isShow': $('input[name="isShow"]:checked').val(),//不盖章
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
		url: parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
		type: 'post',
		dataType: 'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			"packageId":datall.packageId,
			"projectId":datall.projectId,
			'type':"jgtzs",
			"tenderType":2,
			"isBid":isBidCode,
			"supplierId":datall.supplierId,
			"auctionModel":datall.auctionModel,
			"detailedId":datall.packageDetailedId,
			"quotationUnit": datall.quotationUnit,
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