
var saveUrl = '';//保存接口
var detailUrl = config.tenderHost+'/ReconnaissanceSiteController/getReconnaissanceSummaryByBidId.do';//编辑时获取详情接口
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
var sumId = '';//数据id
var bidId = '';//标段id
var fileUploads = null; //上传文件
var fileData = [];//文件信息
//var loginInfo = entryInfo();//登录人信息
$(function(){
	//初始化编辑器
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
})
function passMessage(data){
	var bidData = {}
	for(var key in data){
		bidData[key] = data[key];
	}
	/*for(var key in bidData){
		$('#'+key).html(bidData[key]);
	}*/
	if(data.getForm && data.getForm == 'KZT'){
		bidId = bidData.id;
	}else{
		bidId = bidData.bidSectionId;
	}
	getBidInfo(bidId);
	getDetail(bidId);
}


//修改时获取详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				if(arr.explorationMethod == 0){
					arr.explorationMethod = '自行踏勘'
				}else if(arr.explorationMethod == 1){
					arr.explorationMethod = '组织踏勘'
				}
				for(var key in arr){
					$('#'+key).html(arr[key]);
				}
				//文件回显
				if(arr.projectAttachmentFiles){
					var projectAttachmentFiles = arr.projectAttachmentFiles;
	//				fileHtml(dataSource.projectAttachmentFiles);
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							businessId: sumId,
							status:2,
							businessTableName:'T_RECONNAISSANCE_SUMMARY',  
							attachmentSetCode:'SCOUT_SUMMARY'
						});
					}
					if(projectAttachmentFiles && projectAttachmentFiles.length > 0){
						fileUploads.fileHtml(projectAttachmentFiles);
					}
					/*if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+sumId+"/605",
							businessId: sumId,
							status:1,
							businessTableName:'T_ANSWER_MEETING_NOTICE',  
							attachmentSetCode:'MEETING_NOTICE',
							changeFile:function(data){
								//有文件操作是，返回方法，data为文件列表
								fileData = data
							}
							
						});
					}
					fileData = projectAttachmentFiles;
					fileUploads.fileHtml(projectAttachmentFiles);*/
				}
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}
/*****************     根据标段id获取标段相关信息        *************************/
function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				for(var key in data.data){
					$('#'+key).html(data.data[key]);
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
