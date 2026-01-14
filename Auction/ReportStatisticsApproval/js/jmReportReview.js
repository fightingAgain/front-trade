var purchaseaData = ""; //项目的数据的参数
var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl = "Auction/common/Agent/Purchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var addsupplier = 'Auction/Sale/Agent/SalePurchase/model/add_supplier.html' //邀请供应商的弹出框路径
WORKFLOWTYPE =$.getUrlParam('accepType'); 
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData = [];
var projectId = $.getUrlParam('projectId')
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var tenderType = $.getUrlParam('tenderType')
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var lookCheck = config.AuctionHost + "/BusinessStatisticsController/findAuditDateReport"
var checkReslut = config.AuctionHost + "/WorkflowController/updateWorkflowAccep"
var cwlookCheck = config.AuctionHost + "/CwBusinessStatisticsController/selectCwDateReport"
var iscw = $.getUrlParam('iscw')
//初始化
$(function() {
	if(iscw){
	   edittype= "detailed"
	    WORKFLOWTYPE = "ywtjb"
	   }
	if(edittype=="detailed"){
		$("#btn_submit").hide();
		$("#biddingApproval").hide()
	}else{
		
		//$("#CheckResult").hide()
	}
	Purchase();
	console.log(projectId)
	findWorkflowCheckerAndAccp(projectId)
});

function Purchase() {
	var path="";
	   if(iscw){
	   	path=cwlookCheck;
	   }else{
	   	path = lookCheck
	   }
	   
	$.ajax({
		url: path,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'id': projectId
		},
		success: function(data) {
			console.log(data)
			if(data.success) {
				purchaseaData = data.data //获取的数据	
			}

		},
		error: function(data) {

		}
	});
	for(key in purchaseaData){
		if(key == 'tenderMode') {
			if(purchaseaData[key]==2){
				$(".tenderModeName").html('邀请函发送时间')
				$("#tenderMode").html('邀请')
			}else{
				$(".tenderModeName").html('公告发布时间');
				$("#tenderMode").html('公开');
			}

		} else if(key=='marketType'){
			if(purchaseaData[key]=='DF'){
				$("#"+key).html('东风市场')
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

//审核
$("#btn_bao").click(function() {
	
let check =  $("input[name='auditState']:checked").val();
  
	


	let workflowContent = $("#checkMsg").val();
	
	/*if(check) {
		console.log(check)
		if(check == 1) {
			if(workflowContent == null || $.trim(workflowContent) == "") {
				top.layer.alert("不通过填写说明！")
				return false;
			}
		}
		$.ajax({
			type: "post",
			url: checkReslut,
			async: false,
			data: {
				'businessId': projectId,
				'workflowResult': check == 0 ? 0 : 1,
				'workflowContent': workflowContent,
				'workflowType':tenderType,
				'accepType':accepType
			},
			success: function(res) {
				console.log(res);
				if(res.success) {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					top.layer.alert("提交审核成功！")
				}else{
					top.layer.alert(res.message)
				}

			},
			error: function(data) {
				top.layer.alert("提交审核失败！")
			}
		});
	} else {
		top.layer.alert("选择审核结果！")
	}*/

})