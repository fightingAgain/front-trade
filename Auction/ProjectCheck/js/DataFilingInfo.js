var WORKFLOWTYPE = "zlgd";//申明项目公告类型
var id = getUrlParam('id');
var tenderTypeCode = getUrlParam('tenderType');
var packageIds = getUrlParam('packageId');
var projectId = getUrlParam('projectId');
var edittype = getUrlParam('edittype');
var fillingUrl= top.config.AuctionHost+'/ProjectArchiveController/findProjectArchive.do';
var alldownUrl=top.config.AuctionHost +'/ProjectArchiveController/downloadAllFile.do';//一键下载
var downloadFileUrl = config.FileHost + '/FileController/download.do';//下载文件
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	$.ajax({
		url:fillingUrl,
		async: false,
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		//IE9浏览器ajax的跨域问题
		data:{
			'packageId':packageIds,
			'tenderType':tenderTypeCode,
			'projectId':projectId
		},
		success: function(result) {
			if(result.success) {
				resData=result.data;
				dataList();
			}
		}
	});
	if(edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核内容
	}else{
		$("#btn_submit").show(); //提交按钮隐藏
		$("#tableWorkflow").show(); //审核内容
	}
    findWorkflowCheckerAndAccp(id) 
})
//数据渲染
function dataList(){
	$("#projectName").html(resData.projectPackage.projectName);
	$("#projectCode").html(resData.projectPackage.projectCode);
	$("#packageName").html(resData.projectPackage.packageName);
	$("#packageNum").html(resData.projectPackage.packageNum);
	$('.pdfName').each(function(){
		var listName=$(this).html();
		var jsonList=resData[listName];
		tableList(listName,jsonList);		
	})
}
function tableList(listName,jsonList){
	$('table[data-title='+ listName +']').bootstrapTable({
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				return index+1
			}
		},{
			field: 'fileName',
			title: '名称',
			align: 'left',			
		},{
			field:'',
			title:'操作',
			align: 'center',
			halign: 'center',
			width: '150',
			events:{
				'click .fileDownload':function(e, value, row, index){
					var newUrl = downloadFileUrl + "?ftpPath=" + row.fileUrl + "&fname=" + row.fileName ;
					window.location.href = $.parserUrlForToken(newUrl); 
				},
				'click .previewFile':function(e, value, row, index){
					openPreview(row.fileUrl);
				},
			},
			formatter:function(value, row, index){		
				if(row.fileUrl!=undefined){
					var filesnames = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1).toUpperCase();	
				}else{
					var filesnames =""
				}		
				var mixtbody="<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp"		
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
					mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
				}		 
				return mixtbody
			}	
		}
		],
	})
	$('table[data-title='+ listName +']').bootstrapTable('load',jsonList) 
}
$("#downLoadAll").on('click',function(){
	var newUrl = alldownUrl + "?packageId=" + packageIds;
	window.location.href = $.parserUrlForToken(newUrl); 
}) 