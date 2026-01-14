var bidSectionId=sessionStorage.bidSectionId;//标段Id
var supplierId=supplierId=sessionStorage.supplierId;//投标人id
var examType=sessionStorage.examType;
var token=sessionStorage.token;
var zbwjAndTbwjListUrl=config.Reviewhost+"/ReviewControll/findZbwjAndTbwjList.do";//相关文件数据接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var supplierUrl = config.Reviewhost+"/ReviewControll/findBidList.do";//获取评审项对应的投标人
var docClarifyIteData="";
var bidOpeningFilesList=[];//投标文件
var bidOpeningAppendixList = [];//投标文件附件

$(function(){
	$('title').html(siteInfo.sysTitle);
	getAllBidder();
	if(supplierId && supplierId != 'undefined'){
		getAllFill(supplierId)
	}
//	getAllFill();
	$(".bidOpeningFilesBtn").on('click',function(){
		$(this).removeClass('btn-default').siblings().addClass('btn-default');
		$(this).addClass('btn-primary').siblings().removeClass('btn-primary');
	})
})
function viewFileBtn(type,$index){
	var list;
	if(type == 1){
		list = bidOpeningAppendixList;
	}else if(type == 0){
		list = bidOpeningFilesList;
	}
//	var newUrl=chgUrl(config.FileHost + "/FileController/fileView.do?ftpPath=" + list[$index].bidFileUrl+'&Token='+token)
	var newUrl=siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+config.FileHost + '/fileView'+list[$index].bidFileUrl
	$("#tbwjPdf").attr('src',newUrl)
}
function chgUrl(url) {
    var timestamp = (new Date()).valueOf();
   
    url = url + "&timestamp=" + timestamp;

    return encodeURI(url);
}
function downFileBtn(type,$index,id){
	var list;
	if(type == 1){
		list = bidOpeningAppendixList;
	}else if(type == 0){
		list = bidOpeningFilesList;
	}
//	top.layer.confirm("温馨提示:该文件为下载文件，是否下载?", function(indexs) {
	var filesnames =  list[$index].bidFileName.substring(0,list[$index].bidFileName.lastIndexOf("."));
	var newUrl =dowoloadFileUrl+'?Token='+token + '&ftpPath=' +  list[$index].bidFileUrl + '&fname=' + filesnames;
	$('#downloadPdf').prop('action',encodeURI(newUrl));
	$('#downloadPdf').submit();
	getAllFill(id);
}
function getAllFill(id){
	bidOpeningAppendixList = [];
	bidOpeningFilesList = [];
	$.ajax({
		type:"post",
		url:zbwjAndTbwjListUrl,
		async:false,
		beforeSend: function(xhr){	      
	       xhr.setRequestHeader("Token",token);	    
	    },
		data:{
			'supplierId':id,
			'bidSectionId':bidSectionId,
			'examType':examType,				
		},
		success:function(res){
			if(res.success){
				docClarifyIteData=res.data.docClarifyItem;
				var lists = res.data.bidOpeningFiles;
				for(var m = 0;m<lists.length;m++){
					if(lists[m].bidFileType == 'ZW'){
						bidOpeningFilesList.push(lists[m]);
					}else if(lists[m].bidFileType == 'FJ'){
						bidOpeningAppendixList.push(lists[m]);
					}
				}
				
				if(docClarifyIteData.fileUrl!=undefined&&docClarifyIteData.fileUrl!=""){
//					$("#zbwjPdf").attr('src',config.FileHost + "/FileController/fileView.do?ftpPath=" + docClarifyIteData.fileUrl+'&Token='+token)
					$("#zbwjPdf").attr('src',siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+docClarifyIteData.fileUrl)
				}
				if(bidOpeningAppendixList.length > 0){
					var list1="";
					for(var j=0;j<bidOpeningAppendixList.length;j++){
//						if(j==0){
//							list1+="<a type='button' class='bidOpeningFilesBtn btn btn-primary btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='viewFileBtn(1," + j + ")'>"+bidOpeningAppendixList[j].bidFileName+"</a>"
//						}else{
							var bidFileUrlS = bidOpeningAppendixList[j].bidFileUrl.substring(bidOpeningAppendixList[j].bidFileUrl.lastIndexOf(".") + 1).toUpperCase();
							if(bidFileUrlS == 'JPG'||bidFileUrlS == 'JPGE'||bidFileUrlS == 'PDF' || bidFileUrlS == 'PNG'){
								list1+="<a type='button' class='bidOpeningFilesBtn btn btn-default btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='viewFileBtn(1," + j + ")'>"+bidOpeningAppendixList[j].bidFileName+"</a>"						
							}else{
								list1+="<a type='button' class='bidOpeningFilesBtn btn btn-default btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='downFileBtn(1," + j + ",\"" + id + "\")'>"+bidOpeningAppendixList[j].bidFileName+"</a>"
							}
//						}
					}
				}
				$("#bidOpeningAppendixList").html(list1)
				if(bidOpeningFilesList.length>0){
					var list="";
//					$("#tbwjPdf").attr('src',config.FileHost + "/FileController/fileView.do?ftpPath=" + bidOpeningFilesList[0].bidFileUrl+'&Token='+token)
					$("#tbwjPdf").attr('src',siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+bidOpeningFilesList[0].bidFileUrl)
					
					for(var i=0;i<bidOpeningFilesList.length;i++){
						if(i==0){
							list+="<a type='button' class='bidOpeningFilesBtn btn btn-primary btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='viewFileBtn(0," + i + ")'>"+bidOpeningFilesList[i].bidFileName+"</a>"
						}else{
							var bidFileUrlS = bidOpeningFilesList[i].bidFileUrl.substring(bidOpeningFilesList[i].bidFileUrl.lastIndexOf(".") + 1).toUpperCase();
							if(bidFileUrlS == 'JPG'||bidFileUrlS == 'JPGE'||bidFileUrlS == 'PDF' || bidFileUrlS == 'PNG'){
								list+="<a type='button' class='bidOpeningFilesBtn btn btn-default btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='viewFileBtn(0," + i + ")'>"+bidOpeningFilesList[i].bidFileName+"</a>"						
							}else{
								list+="<a type='button' class='bidOpeningFilesBtn btn btn-default btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='downFileBtn(0," + i + ",\"" + id + "\")'>"+bidOpeningFilesList[i].bidFileName+"</a>"
							}
						}
					}
					
					$("#bidOpeningFilesList").html(list)
				}
				var formDown = '<form action="" method="post" id="downloadPdf"></form>';
				$('#bidOpeningAppendixList').after(formDown)
			}else{				
				top.layer.alert('温馨提示：'+res.message);				
			}
		}
	});
}
//获取所有投标人
function getAllBidder(){
	var parent = self.opener;

	var bidders = parent.getCurrBidders();
	if(bidders && bidders.length>0){
        bidderList(bidders);
	}
}
function bidderList(supplierdata){
	var list='<ul class="nav nav-tabs" style="margin:5px auto">';
   	for(var i=0;i<supplierdata.length;i++){
   		var className = '';
   		if(supplierdata[i].checkState == 0){
   			className = 'saveReviewed';//保存
   		}else if(supplierdata[i].checkState == 1){
   			className = 'isReviewed';//已评审
   		}else{
   			className = 'notReviewed';//未评审
   		}
   		if(supplierId && supplierId != 'undefined'){
			list+='<li role="supplier" class="'+(supplierdata[i].supplierId == supplierId?"active":"")+'"><a onclick=getAllFill(\"'+ supplierdata[i].supplierId +'\") href="#supplier"  ria-controls="supplier" role="tab" data-toggle="tab">'+ supplierdata[i].enterpriseName  +'</a></li>'
			
   		}else{
			if(i==0){
				list+='<li role="supplier" class="active"><a onclick=getAllFill(\"'+ supplierdata[i].supplierId +'\") href="#supplier"  ria-controls="supplier" role="tab" data-toggle="tab">'+ supplierdata[i].enterpriseName  +'</a></li>'
			}else{
				list+='<li role="supplier" class=""><a onclick=getAllFill(\"'+ supplierdata[i].supplierId +'\") href="#supplier"  ria-controls="supplier" role="tab" data-toggle="tab">'+ supplierdata[i].enterpriseName  +'</a></li>'
			}
		}
   		
   	}
	list +='</ul>'
	list +="<div style='text-align: right;' id='tableList'>";
	list +="</div>";
    $("#ProjectCheckStateDiv").html(list);
}
