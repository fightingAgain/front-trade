var searchUrlFile=config.AuctionHost+'/PurFileController/page.do';
var dowoloadFileUrl=config.FileHost + '/FileController/download.do';


//补遗附件信息
var FileInfo=[];

function getSupplementItem(obj){
	
	
	console.log(obj);
	$('div[id]').each(function(){
		$(this).html(obj[this.id]);
	});
	/*$('div[id]').each(function(){
		$(this).html(obj.project[this.id]);

	});	

	});

	});*/
	
	//查看补遗文件附件
	downloadSupplement(obj.id);
	
}


//查看补遗文件附件
function downloadSupplement(SupplementId){
	$.ajax({
		type:"post",
		url:searchUrlFile,
		async:true,
		dataType:'json',
		data:{
   		modelId:SupplementId,
   		modelName:'jj_pur_Project_Supplement'
   	},
   		success:function(data){
   			FileInfo = data.rows;
   			console.log(FileInfo)
			for (i = 0; i < FileInfo.length; i++) {
				
				$("#FileDownload").html('<td class="text-center"><a href="javascript:void(0)" onclick="downloadImg(' + i + ')" >'+ FileInfo[i].fileName + '</a></td>');
   			}
   		}
	});
}


//下载采购文件
function downloadImg(obj){
	/*var timeState=purchaseInfo.isOutNotice;

	if(timeState==false){
		top.layer.alert("项目公告截止时间已到，文件无法下载");
		return;
	}else{
	}*/
	
	var newUrl = dowoloadFileUrl + "?ftpPath=" + FileInfo[obj].filePath + "&fname=" + FileInfo[obj].fileName;
		window.location.href = newUrl;
}