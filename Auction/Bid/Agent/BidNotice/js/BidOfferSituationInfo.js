var urlfindChargePageList = top.config.bidhost + "/OfferController/findOfferListForManager.do";//询比采购情况明细  平台服务费缴纳
var packageInfoUrl = top.config.bidhost + "/OfferController/findManager.do";//只有包件相关信息
var urlfindBidFileDownload = top.config.bidhost + "/BidFileDownloadController/findBidFileDownload.do" //采购文件下载记录明细
var searchUrlFile = config.bidhost + '/PurFileController/findOfferFileList.do'; //采购文件分页

var projectId = getUrlParam('projectId');
var packageId = getUrlParam('id');
var examTypeList = getUrlParam('examType');//阶段资格审查方式 0资格预审  1后审
/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function() {
	isShowSupplierInfo(projectId, packageId, examTypeList, 'offer', '0', function(data, html){
		if(data.isShowSupplier != 1){
			$("#BidSituationDetail").closest('td').html('<div class="red" style="text-align: center;">'+html+'</div>')
		}
		setBidSituationDetail(data.isShowSupplier);
	})
	
})

var fileData=""
var fileDataB=""
//挂载询比采购情况请求
function setBidSituationDetail(isShowSupplier) {
	var dataParam = {
		"packageId": packageId,
		"projectId": projectId,
		'examType':examTypeList
	}
	$.ajax({
		type: "post",
		url: isShowSupplier == 1?urlfindChargePageList:packageInfoUrl,
		dataType: 'json',
		data: dataParam,
		async: false,
		success: function(result) {
			if(result.success) {
				$("div[id]").each(function() {
					$(this).html(result.data[this.id]);
				});
				if(result.data.offers && result.data.offers.length > 0){
					setBidSituationDetailHTML(result.data.offers); //有数据挂载
				}
			}
		}
	});		
}
//挂载询比采购情况请求
function setBidSituationDetailHTML(data) {
	if(data.length>0){
		var RenameData = getBidderRenameData(packageId);//供应商更名信息
	}
	$("#BidSituationDetail").bootstrapTable({
		undefinedText: "",
		pagination: false,
		columns: [{
				title: "序号",
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},{
				field: "supplierName",
				align: 'left',
				title: "供应商名称",
				formatter: function(value, row, index){
					return showBidderRenameList(row.supplierId, row.supplierName, RenameData, 'body')
				}
			},{
				field: "subDate",
				align: 'center',
				title: "报价时间",
				width: "150px",
				formatter: function(value, row, index) {
					if(row.offerState==1){
						return value
					}else{
						return ''
					}
				}
			},{
				field: "offerState",
				align: 'center',
				title: "报价情况",
				width: "80px",
				formatter: function(value, row, index) {
					if(value==1){
						return '<div class="text-success">已报价</div>'
					}else{
						return '<div class="text-danger">未报价</div>'
					}
				}
			},
		]
	});
	$("#BidSituationDetail").bootstrapTable("load", data); //动态载入数据	
}
