
/**

*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/NoticeController/getAndFile.do";	//查看地址


var fileUploads = null; //文件上传
$(function(){
	var id = $.getUrlParam('id');
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: id,
			status:2
		});
	}
	$.ajax({
		type:"post",
		url:viewUrl,
		async:true,
		data: {
			'id':id
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
				var dataSource = data.data;
				//文件回显
				if(dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0){
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
				$('#noticeContent').html(dataSource.noticeContent);
			}
			
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
	
	//文件表格
	/*function fileHtml(data){
		$('#fileList tbody').html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			if(data[i].tenderMode == '1'){
				data[i].tenderMode='公开招标'
			}else if(data[i].tenderMode == '1'){
				data[i].tenderMode='邀请招标'
			}
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
			+'<input type="hidden" name="projectAttachmentFiles['+i+'].attachmentFileName" value="'+data[i].attachmentFileName+'"/>'	//附件文件名
			+'<input type="hidden" name="projectAttachmentFiles['+i+'].url" value="'+data[i].url+'"/>'	//附件URL地址
			+'<td><a href="'+$.parserUrlForToken(fileDownload+'?ftpPath='+data[i].url+'&fname='+data[i].attachmentFileName)+'">'+data[i].attachmentFileName+'</a></td>'
			+'</tr>');
			$("#fileList tbody").append(html);
		}
	}*/
})
