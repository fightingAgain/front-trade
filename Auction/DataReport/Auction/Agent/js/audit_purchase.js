var projectDataID = getUrlParam('projectId'); //该条数据的项目id
var purchaseaData = "";
var packageData = ""; //包件的数据容器
var auctionTypes;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
var id = $.getUrlParam('id');
WORKFLOWTYPE = "ywtjb"
//初始化
$(function() {
	Purchase();
})

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var allProjectData = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //项目数据的接口；
var pricelist = config.AuctionHost + '/ProjectPriceController/findProjectPriceList.do' //费用查看
var CheckList = config.AuctionHost + '/AuctionPackageDetailedController/findAuctionPackageDetailedList.do' //材料设备 查询
var getImgListUrl = config.AuctionHost + "/PurFileController/list.do"; //查看附件
var packagePrice = []; //费用信息
var viewSupplierUrl = "Auction/Auction/Purchase/AuctionPurchase/model/viewSupplier.html" //查看邀请供应商的页面路径
var addsupplier = 'Auction/Auction/Purchase/AuctionPurchase/model/add_supplier.html' //邀请供应商的弹出框路径
var WORKFLOWTYPE = "ywtjb";
var projectSupplements = [];

function Purchase() {

	findWorkflowCheckerAndAccp(id);
	$.ajax({
		url: flage == 1 ? allProjectData : findPurchaseURLHasId,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'tenderProjectID': projectDataID
		},
		success: function(data) {
			//项目数据
			purchaseaData = data.data;

		},
		error: function(data) {
			parent.layer.alert("修改失败")
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
		}else if(key=='marketType'){
			if(purchaseaData[key]=='DF'){
				$("#"+key).html('内部市场')
			}
			if(purchaseaData[key]=='JP'){
				$("#"+key).html('社会军品')
			}
			if(purchaseaData[key]=='SH'){
				$("#"+key).html('社会民品')
			}	
		} else {
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