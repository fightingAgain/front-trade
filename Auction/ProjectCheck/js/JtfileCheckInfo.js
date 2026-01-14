//打开弹出框时加载的数据和内容。
var packageInfo=[];
var AccessoryList=[];
//var tenderTypeCode = getUrlParam('tenderType');//0为询比采购6为单一来源采购
var examType = getUrlParam('purExamType');//预审采购文件还是询比采购文件
var bidFileCheckId = getUrlParam('key');//预审采购文件还是询比采购文件
var edittype =getUrlParam("edittype"); //查看还是审核detailed查看  audit审核
var WORKFLOWTYPE=getUrlParam('workflowType');//文件审核流程
var packageId=getUrlParam('packageId')
var searchUrlFile=top.config.AuctionHost+'/JtBidFileController/findFileListByOrder.do';//文件查询接口
var deleteFileUrl=top.config.AuctionHost+'/BidFileController/deleteBidFile.do';
var resetFileUrl=top.config.AuctionHost+'/BidFileController/updateBidFile.do';//撤回文件
var downloadFileUrl = config.FileHost + '/FileController/download.do';//下载文件
var flieurl=top.config.AuctionHost+'/BidFileController/saveBidFile.do';
var urlPurchaseList = config.AuctionHost+'/JtProjectPackageController/findProjectPackagePageList.do';


$(function(){
	$.ajax({
		url:config.AuctionHost+'/JtProjectPackageController/findProjectPackageInfo.do',
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"packageId":packageId
		},
		success:function(data){
			if(data.success){	   	  	
				packageInfo=data.data;//包件信息
				$("#packageName").html(packageInfo.packageName);
				$("#packageNum").html(packageInfo.packageNum);
				$("#projectName").html(packageInfo.projectName);	
				$("#projectCode").html(packageInfo.projectCode);		
			}													
		},
		
		error:function(data){
			parent.layer.alert("获取失败")
		}
	 });
	getAccessoryList();
	findWorkflowCheckerAndAccp(bidFileCheckId);
	// PackageCheckList(0);
	findBusinessPriceSet(packageInfo.checkPlan,packageInfo.id);
})
function getAccessoryList() {
	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: false,
		dataType: 'json',
		data: {
			"packageId": packageInfo.id,			
			'enterpriseType':'04',	
			
		},
		success: function(data) {			
			if(data.success==true){
				if(data.data.length>0){
					AccessoryList = data.data;
					if(AccessoryList.length <= 0){
						$("#resetTable").hide();
						$("#trHistoryFile").hide();
					}
				}								
			}
			
         
		}
	});
	fileTable();
	
};
function fileTable(){
	$('#fileTables').bootstrapTable({
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
				},
				formatter:function(value, row, index){					
				var filesnames = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
				var mixtbody=""  
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"
					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
						mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
					}				              
				return mixtbody				 
			}
			}
		]
	});
	$('#fileTables').bootstrapTable("load", AccessoryList); //重载数据
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
