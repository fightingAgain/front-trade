//打开弹出框时加载的数据和内容。
var packageInfo=[];
var AccessoryList=[], clearList=[];
//var tenderTypeCode = getUrlParam('tenderType');//0为询比采购6为单一来源采购
var examType = getUrlParam('purExamType');//预审采购文件还是询比采购文件
var bidFileCheckId = getUrlParam('id');//预审采购文件还是询比采购文件
var edittype =getUrlParam("edittype"); //查看还是审核detailed查看  audit审核
var WORKFLOWTYPE=getUrlParam('workflowType');//文件审核流程
var searchUrlFile=top.config.AuctionHost+'/BidFileController/findFileList.do';
var clearUrlFile=top.config.AuctionHost+'/BidFileController/findNewChangeFileList.do';//有清单文件时文件查询接口
var deleteFileUrl=top.config.AuctionHost+'/BidFileController/deleteBidFile.do';
var resetFileUrl=top.config.AuctionHost+'/BidFileController/updateBidFile.do';//撤回文件
var downloadFileUrl = config.FileHost + '/FileController/download.do';//下载文件
var flieurl=top.config.AuctionHost+'/BidFileController/saveBidFile.do';
var urlPurchaseList = config.AuctionHost+'/ProjectPackageController/findProjectPackagePageList.do';
var supplierType=1;
function du(packageInfos){
	if(WORKFLOWTYPE == 'xjcgwj'){
		$('.clearFiles').show();
	}
	$.ajax({
		type: "post",
		url: config.AuctionHost+"/ProjectPackageController/findById.do",
		data: {
			'id':packageInfos.packageId
		},
		async:false,
		dataType: "json",
		success: function (response) {
			if(response.success){
				packageInfo=response.data;
			}
		}
	});
	$('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});	
	getAccessoryList();
	findWorkflowCheckerAndAccp(bidFileCheckId);
//	PackageCheckList(0);
	findBusinessPriceSet(packageInfo.checkPlan, packageInfo.id);

	if (examType == 1) {
		offerTableObj.fileCheckId = bidFileCheckId;
		$(".tenderTypeW").show();
		/*start报价*/
		offerFormData();
		fileList();
		/*end报价*/
		getFileHistory({
			packageId:packageInfo.id,
			examType:examType,
		})
	}
	
};
function getAccessoryList() {
	var postUrl = '',postData={};
	if(packageInfo.isHasDetailedListFile == 1){
		postUrl = clearUrlFile;
	}else{
		postUrl = searchUrlFile;
		// postData.bidFileCheckId = bidFileCheckId;
		// postData.examType = examType;
	}
	$.ajax({
		type: "get",
		url: postUrl,
		async: false,
		dataType: 'json',
		data: {
			'bidFileCheckId': bidFileCheckId,
			'examType': examType
		},
		success: function(data) {			
			if(data.success==true){
				if(packageInfo.isHasDetailedListFile == 1){
					AccessoryList = data.data.bidFiles.length>0?data.data.bidFiles:[];
					clearList = data.data.clearFiles.length>0?data.data.clearFiles:[];
					fileTable('fileClearTables', clearList);
				}else{
					if(data.data.length>0){
						AccessoryList = data.data;
						if(AccessoryList.length <= 0){
							$("#resetTable").hide();
							$("#trHistoryFile").hide();
						}
					}
				}
			}
			
         
		}
	});
	fileTable('fileTables', AccessoryList);
	
};
function fileTable(ele, data){
	$('#'+ele).bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "caoz",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				events:{
					'click .fileDownload':function(e, value, row, index){
						var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName ;
    					window.location.href = $.parserUrlForToken(newUrl); 
					},
					'click .previewFile':function(e, value, row, index){
						openPreview(row.filePath);
					},
					'click .previewPurchaseFile': function(e, value, row, index) {
						openPurchaseFilePreviewPage(row);
					},
				},
				formatter:function(value, row, index){					
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody=""  
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
					}
					if (row.systemStatus == 1) {
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewPurchaseFile'>预览</a>&nbsp;&nbsp"
					}			              
				return mixtbody				 
			}
			}
		]
	});
	$('#'+ele).bootstrapTable("load", data); //重载数据
};
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	top.layer.closeAll();
});

function openPurchaseFilePreviewPage(row) {
	parent.layer.open({
		type: 2,
		title: '采购文件预览',
		id: 'packageSet',
		area: ['80%', '90%'],
		content: 'bidPrice/Public/PurchaseFilePreview/PurchaseFilePreview.html?packageId=' + row.packageId + '&examType=' + row.examType + '&id=' + row.id,
	});
}