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
			if(data.success) {
				projectData = data.data //获取的数据	
			}

		},
		error: function(data) {

		}
	});
	for(key in projectData){
		if(key=='tenderMode'){
			$("input[name='tenderMode'][value='"+ (projectData[key]||0) +"']").attr("checked",true);
			if(projectData[key]==1){
				$(".tenderModeName").html('公告发布时间');
				$("#"+key).html('公开');
			}else{
				$(".tenderModeName").html('邀请函发送时间')
				$("#"+key).html('邀请')
			}
		}else if(key=='bidCheckType'){
			if(projectData[key]==0){
				$("#"+key).html('综合评分法')
			}
			if(projectData[key]==1){
				$("#"+key).html('最低评标价法')
			}
			if(projectData[key]==2){
				$("#"+key).html('经评审最低价法')
			}
			if(projectData[key]==3){
				$("#"+key).html('最低投标价法')
			}
			if(projectData[key]==5){
				$("#"+key).html('经评审的最低投标价法')
			}
		}else if(key=='marketType'){
			if(projectData[key]=='DF'){
				$("#"+key).html('东风市场')
			}
			if(projectData[key]=='JP'){
				$("#"+key).html('社会军品')
			}
			if(projectData[key]=='SH'){
				$("#"+key).html('社会民品')
			}	
		}else if(key=='supplierSelect'){
			var supplierSelectType = projectData[key] || '';
			//0询比采购、1单一来源、2竞争性谈判
			if(supplierSelectType==0){
				$("#supplierSelect").html("询比采购");
			}else if(supplierSelectType==6){
				$("#supplierSelect").html("单一来源");
			}else if(supplierSelectType==5){
				$("#supplierSelect").html("竞争性谈判");
			}
		}else{
			$("#"+key).html(projectData[key]);
		}
	}
	
	if(projectData["exception"]) {	
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