var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do' //根据项目ID获取所有项目信息内容
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do" //项目审核人列表数据接口
var saveProjectPackage = config.AuctionHost + '/PurchaseController/startWorkflowAccep.do'; //添加包件的接口
var projectData = [];
var isCheck;
var WORKFLOWTYPE = "ywtjb";
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var id = $.getUrlParam('id');

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
	if(projectId) {
		findWorkflowCheckerAndAccp(id); //审核
		Purchase(projectId);

	}
})
//获取询比公告发布的数据
function Purchase(uid) {
	$.ajax({
		url: flage == 1 ? findPurchaseUrl : findPurchaseURLHasId, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'post',
		async: false,
		dataType: 'json',
		data: {
			'tenderProjectID': uid,
		},
		success: function(data) {
			projectData = data.data;
			PurchaseData();
		}
	});
};
var projectTypeDate={
	'A':'工程',
	'B':'货物',
	'C':'服务',
	'C50':'广宣',
}
function getProjectType(val){
	var type=(val.substring(0,3)=="C50"?"C50":val.substring(0,1))

	return projectTypeDate[type];
}
function PurchaseData() {
	//渲染公告的数据
	for(key in projectData){
		if(key=="bidCheckType"){
			if(projectData[key]==3){
				$("#"+key).html('经评审的最低投标价法') 
			}
			if(projectData[key]==4){
				$("#"+key).html('最低投标价法')
			}
			if(projectData[key]==5){
				$("#"+key).html('最低评标价法')
			}
			if(projectData[key]==6){
				$("#"+key).html('经评审的最低投标价法（非日产）')
			}
			if(projectData[key]==7){
				$("#"+key).html('经评审的最低投标价法（日产）')
			}
			if(projectData[key]==9){
				$("#"+key).html('综合评估法(无权重)')
			}
			if(projectData[key]==10){
				$("#"+key).html('综合评估法(权重)')
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
			$.getJSON('../../../../media/js/base/prov-city.json', function(data) {
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
		}else if(key=="compositeServiceSubtoral"){
			$("#"+key).html(projectData[key].toFixed(6))
		}else if(key=="projectCostSubtotal"){
			$("#"+key).html(projectData[key].toFixed(6))
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
		$("#tenderDesk").html("东风");
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
	}

};
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});