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
	} else {

		//$("#CheckResult").hide()
	}
	Purchase();
	findWorkflowCheckerAndAccp(projectId)
});
var projectTypeDate={
	'A':'工程',
	'B':'货物',
	'C':'服务',
	'C50':'广宣',
}
function getProjectType(val){
	var type=(val.substring(0,3)=="C50"?"C50":val.substring(0.1))

	return projectTypeDate[type];
}
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
	//渲染公告的数据
	for(key in projectData) {
		if(key == "bidCheckType") {
			if(projectData[key] == 3) {
				$("#" + key).html('经评审的最低投标价法')
			}
			if(projectData[key] == 4) {
				$("#" + key).html('最低投标价法')
			}
			if(projectData[key]==5){
				$("#"+key).html('最低评标价法')
			}
			if(projectData[key] == 6) {
				$("#" + key).html('经评审的最低投标价法（非日产）')
			}
			if(projectData[key] == 7) {
				$("#" + key).html('经评审的最低投标价法（日产）')
			}
			if(projectData[key]==9){
				$("#"+key).html('综合评估法(无权重)')
			}
			if(projectData[key]==10){
				$("#"+key).html('综合评估法(权重)')
			}
		}else if(key=='marketType'){
			if(projectData[key]=='DF'){
				$("#"+key).html('内部市场')
			}
			if(projectData[key]=='JP'){
				$("#"+key).html('社会军品')
			}
			if(projectData[key]=='SH'){
				$("#"+key).html('社会民品')
			}	
		}else if(key=="projectType"){
			$('#'+key).html(getProjectType(projectData[key]))
		}else if(key=="publlcProcurement"){
			if(projectData[key]==0){
				$("#"+key).html('是')
			}
			if(projectData[key]==1){
				$("#"+key).html('否')
			}
		}else if(key=="projectImplementAdder"){
			let areaCode = projectData[key];
			var strName="";
			$.ajaxSettings.async = false;
			$.getJSON('../../../media/js/base/prov-city.json', function(data) {
				for(var i = 0; i < data.length; i++) {
					if(data[i].code == areaCode){
						strName += data[i].name;
						return;
					}
					for(var j = 0; j < data[i].childs.length; j++){
						if(data[i].childs[j].code == areaCode){
							strName += data[i].name + "  " + data[i].childs[j].name;
							return;
						}
						for(var k = 0; k < data[i].childs[j].childs.length; k++){
							if(data[i].childs[j].childs[k].code == areaCode){
								strName += data[i].name + "  " + data[i].childs[j].name + data[i].childs[j].childs[k].name;
								return;
							}
						}
					}
				}
			});
			$("#"+key).html(strName);
		}else{
			$("#"+key).html(projectData[key]);
		}
		
	}
	let tenderDesk = projectData["tenderDesk"];
	let tenderMode = projectData["tenderMode"];
	if(tenderMode == 1) {
		$("#tenderMode").html("公开");
	} else if(tenderMode == 2) {
		$("#tenderMode").html("邀请");
	}

	if(tenderDesk == 0) {
		$("#tenderDesk").html("");
	} else if(tenderDesk == 1) {
		$("#tenderDesk").html("政府");
	} else if(tenderDesk == 2) {
		$("#tenderDesk").html("长安");
	} else if(tenderDesk == 3) {
		$("#tenderDesk").html("线下");
	}

	if(projectData["exception"]) {
		$(".exceptionView1").show();
		$(".exceptionView2").show();
		$("#exceptionCause").html(projectData["exceptionCause"]);
		$("#exception").html(projectData["exception"])
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