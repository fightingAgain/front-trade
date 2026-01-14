
var detailUrl = config.tenderHost + '/BidderContractController/getAndFile.do';//编辑时信息回显
var fileUploads = null; //上传文件
$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})
function passMessage(data){
	for(var key in data){
		$('#'+key).html(data[key])
	}
	getDetail(data.id)
}
//合同详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				var dataSource = data.data;
				for(var key in dataSource){
					if(dataSource.priceUnit == 0){
						dataSource.priceUnit = '元'
					}else if(dataSource.priceUnit == 1){
						dataSource.priceUnit = '万元'
					}
					if(dataSource.priceCurrency == 156){
						dataSource.priceCurrency = '人民币'
					}
					$('#'+key).html(dataSource[key])
				}
				//合同
				if(dataSource.projectAttachmentFiles){
					var projectAttachmentFiles = dataSource.projectAttachmentFiles;
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							businessId: id,
							businessTableName:'T_BIDDER_CONTRACT',  
							attachmentSetCode:'CONTRACT_KEEP',
							status:2
						});
					}
					fileUploads.fileHtml(projectAttachmentFiles);
				}
			}
		}
	});
}