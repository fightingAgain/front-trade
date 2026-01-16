var purchaseaData = ""; //项目的数据的参数
var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var addsupplier = 'Auction/Sale/Agent/SalePurchase/model/add_supplier.html' //邀请供应商的弹出框路径
WORKFLOWTYPE = $.getUrlParam('accepType');
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData = [];
var projectId = $.getUrlParam('projectId');
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var tenderType = $.getUrlParam('tenderType')
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var lookCheck = config.AuctionHost + "/BusinessStatisticsController/findAuditDateReport"
var checkReslut = config.AuctionHost + "/WorkflowController/updateWorkflowAccep"
var iscw = $.getUrlParam('iscw')
var cwlookCheck = config.AuctionHost + "/CwBusinessStatisticsController/selectCwDateReport"
//初始化
$(function() {
	if(iscw) {
		edittype = "detailed"
		WORKFLOWTYPE = "ywtjb"
		
	}
	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#biddingApproval").hide()
	} else {

		//$("#CheckResult").hide()
	}
	Purchase();
	findWorkflowCheckerAndAccp(projectId)
});

function Purchase() {
	var requestUrl = "";
	
	if(iscw) {
		requestUrl = cwlookCheck;
		
	} else {
		requestUrl = lookCheck
	}

	$.ajax({
		url: requestUrl,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'id': projectId
		},
		success: function(data) {
			
			if(data.success) {
				purchaseaData = data.data //获取的数据	
			}

		},
		error: function(data) {

		}
	});
	for(key in purchaseaData){
		if(key == 'tenderMode') {
			if(purchaseaData[key]==1){
				$(".tenderModeName").html('公告发布时间');
				$("#tenderMode").html('公开');
			}else{
				$(".tenderModeName").html('邀请函发送时间')
				$("#tenderMode").html('邀请')
			}

		}else if(key == 'auctionType'){			
			if(purchaseaData[key]==0){
				$("#auctionType").html('自由竞价');
			}
			if(purchaseaData[key]==1){
				$("#auctionType").html('单轮竞价');
			}
			if(purchaseaData[key]==2){
				$("#auctionType").html('多轮竞价(2轮)');
			}
			if(purchaseaData[key]==3){
				$("#auctionType").html('多轮竞价(3轮)');
			}
			if(purchaseaData[key]==6){
				$("#auctionType").html('清单竞价');
			}
		} else if(key=='marketType'){
			if(purchaseaData[key]=='DF'){
				$("#"+key).html('内部市场')
			}
			if(purchaseaData[key]=='JP'){
				$("#"+key).html('社会军品')
			}
			if(purchaseaData[key]=='SH'){
				$("#"+key).html('社会民品')
			}	
		}else {
			$('#'+key).html(purchaseaData[key]);
		}
	}
	if(purchaseaData["exception"]) {		
		$(".exceptionView1").show()
		$(".exceptionView2").show()
	}

}

function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}

$("#btn_close").click(function() {
	parent.layer.closeAll();

});