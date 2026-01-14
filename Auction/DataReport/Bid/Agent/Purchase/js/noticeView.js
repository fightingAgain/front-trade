var findPurchaseUrl=config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'//根据项目ID获取所有项目信息内容
var WorkflowUrl=config.AuctionHost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var saveProjectPackage=config.AuctionHost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var projectData=[];
var examTypes;
var isCheck;
var packageId=getUrlParam('packageId');
var id=getUrlParam('id');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do';//获取项目信息的接口
var flage = $.getUrlParam('flage');//是否二次编辑
WORKFLOWTYPE = "ywtjb"
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	if(packageId){
		Purchase(packageId);
		findWorkflowCheckerAndAccp(id);
		
		$("#btn_close").on('click',function(){
			parent.layer.close(parent.layer.getFrameIndex(window.name));	
		})
	}
})
//获取询比公告发布的数据
function Purchase(uid){		
	console.log(flage)
	$.ajax({
		url: flage==1?findPurchaseUrl:findPurchaseURLHasId, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'tenderProjectID':uid,			
		},
		success: function(data) {			
			projectData=data.data;
			PurchaseData();											
		}
	});
};
function PurchaseData(){
	for(key in projectData){
		if(key=='tenderMode'){		
			if(projectData[key]==2){
				$(".tenderModeName").html('邀请函发送时间')
				$("#"+key).html('邀请')
			}else{
				$(".tenderModeName").html('公告发布时间');
				$("#"+key).html('公开');
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
			if(projectData[key]==4){
				$("#"+key).html('经评审的最高投标价法')
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
	
};
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));	
});