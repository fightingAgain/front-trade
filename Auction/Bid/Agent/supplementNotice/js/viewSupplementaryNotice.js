function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
var noticeType; 
var examType;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var keyId=getUrlParam('keyId');
var supplimentData="";
var packageInfo;
var findProjectPackageInfo=top.config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do';
var downloadFileUrl = config.bidhost + '/FileController/download.do';//下载文件
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var AccessoryList=[];
$(function(){
	du(keyId)
	packa(packageId)
})
function du(uid){
	$.ajax({
	   	url:config.bidhost+'/ProjectSupplementController/findSupplyInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"id":uid,
	   		
	   	},
	   	success:function(data){
	   	  	if(data.success){
				supplimentData=data.data;
				noticeType=supplimentData.noticeType
	   	  		AccessoryList=supplimentData.purFiles
	   	  	}	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	fileTable()
}
function packa(uid){
	$.ajax({
	   	url:findProjectPackageInfo,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  if(data.success){
	   	  	packageInfo=data.data;	   	  		   	   	  		   	  	
	   	  }
	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	examType=packageInfo.examType
	if(supplimentData.isChangeDate==1){
		if(noticeType==0){
			suppliment();
		}else{
			examSuppliment()
		}
		
		$("#isChangeDate").show()
	}
	
	$('div[id]').each(function(){
		if($(this).attr("id") != 'remark'){
			$(this).html(packageInfo[this.id]);	
			if(reg.test(packageInfo[this.id])){
				$(this).html(packageInfo[this.id].substring(0,16));
			}	
		}
	});	
	$('div[id]').each(function(){
		$(this).html(supplimentData[this.id]);	
		if(reg.test(supplimentData[this.id])){
			$(this).html(supplimentData[this.id].substring(0,16));
		}			
	});	
	if(supplimentData.remark=="<p><br></p>"){
		$(".noticeContent").hide()
	}
	$("#isChangeDate").html(supplimentData.isChangeDate==0?'不需要变更时间':'变更时间')	
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
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'120px'

			},
			{
				field: "subDate",
				title: "上传时间",
				align: "center",
				halign: "center",
				width:'180px'

			},
			{
				field: "userName",
				title: "上传人",
				align: "center",
				halign: "center",
				width:'100px'

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
					if(row.fileState==1){
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
						}
					}else{			
						if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){	
							mixtbody +="<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>"
						}
					}               
					return mixtbody
				}
				 
			}
		]
	});
	$('#fileTables').bootstrapTable("load", AccessoryList); //重载数据
};