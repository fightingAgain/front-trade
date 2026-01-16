var purchaseaData="";//项目的数据的参数
var findPurchaseUrl=config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do';//获取项目信息的接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var viewSupplierUrl="Auction/common/Agent/Purchase/model/viewSupplier.html"//查看邀请供应商的页面路径
var addsupplier='Auction/Sale/Agent/SalePurchase/model/add_supplier.html'//邀请供应商的弹出框路径
var WORKFLOWTYPE = "ywtjb";
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var publicData=[];
var projectId=$.getUrlParam('projectId')
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do';//获取项目信息的接口
var flage = $.getUrlParam('flage');//是否二次编辑
var lookCheck = config.AuctionHost + "/BusinessStatisticsController/compileDateReport.do"
var id=$.getUrlParam('id')
//初始化
$(function(){
   Purchase();

});
function Purchase(){
    findWorkflowCheckerAndAccp(id); //审核
   $.ajax({
	   	url:  flage==1?findPurchaseUrl:lookCheck     ,
	   	type:'get',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'tenderProjectID':projectId
	   	},
	   	success:function(data){
	   		if(data.success){
	   			purchaseaData=data.data//获取的数据	
	   		}
	   		
	   		
	   	},
	   	error:function(data){
	   		
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
function NewDate(str){  
	if(!str){  
		return 0;  
	}  
	arr=str.split(" ");  
	d=arr[0].split("-");  
	t=arr[1].split(":");  
	var date = new Date();   
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
	date.setUTCHours(t[0]-8, t[1]);   
	return date.getTime();  
}