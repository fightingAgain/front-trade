


var listUrl = config.tenderHost + '/ClarifyController/getClarifyListByBidId.do';//查询澄清记录
var fileDownloadUrl = config.FileHost + "/FileController/download.do";	//下载文件
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间

var askList = [];//澄清数据列表
// var bidData = '';//标段相关数据
// var bidSectionData = '';//标段相关数据
var bidId = '';//标段id
var timeState = '';//时间状态 当前时间小于答复截止时间 为1 大于答复截止时间 为0
var nowTime = '';//当前时间
var examType = '';//标段当前处于预审还是后审阶段
$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//文件下载
	$('#askList').on('click','.btnDownload',function(){
		var ftpPath = $(this).attr('data-url');
		var fileName = $(this).attr('data-fname');
		fileName = fileName.substring(0, fileName.lastIndexOf("."));
		$(this).attr('href',$.parserUrlForToken(fileDownloadUrl+'?ftpPath='+ftpPath+'&fname='+fileName))
	})
})
function passMessage(data){
	// bidData = JSON.parse(JSON.stringify(data));
	// bidSectionData = JSON.parse(JSON.stringify(data));
	for(var key in data){
		$('#'+key).html(data[key]);
	}
	//菜单列表中过来的有标段id（bidSectionId） 控制台过来的标段id为（id）
	if(data.clarify){
		listHtml(data.clarify)
	}
};
//查询提出问题列表
function listHtml(data){
	var html = '';
	$('#askList').html('');
	var btn = '';
	var fileHtml = '';
	var createTime = '';//发送时间
	var clarifyType = '';
	createTime = data.createTime;
	if(data.clarifyType == 1){
		clarifyType = '资格预审文件 '
	}else if(data.clarifyType == 4){
		clarifyType = '招标文件 '
	}
	if(data.projectAttachmentFiles){
		var fileData = data.projectAttachmentFiles;
		fileHtml = '<div><label style="font-weight: 600;">澄清文件：</label>'
		for(var j = 0;j<fileData.length;j++){
			fileHtml += '<a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class=" btnDownload" style="margin-right:50px;cursor:pointer;text-decoration:none">'+fileData[j].attachmentFileName+'</a>'
		}
		fileHtml += '</div>';
	}
	html += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">'
		+'<div style="margin: 10px 0;position: relative;">'
			+'<span style="padding: 5px 10px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">澄清</span>'
			if(data.pdfUrl){
				html +='<span style="position: absolute;right:10px"><button  type="button" class="btn btn-primary btn-sm" onClick=btnViewPDF(\"'+ data.pdfUrl +'\") data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>查看回执</button></span>'
			}
		html +='</div>'
		+'<div><label style="font-weight: 600;">澄清类型：</label><span>'+clarifyType+'</span><label style="font-weight: 600;margin-left:50px;">澄清标题：</label><span>'+(data.clarifyTitle?data.clarifyTitle:'')+'</span></div>'
		+'<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">澄清内容：</label><span>'+(data.clarifyContent?data.clarifyContent:'')+'</span></div>'
		+'<div>'+fileHtml+'</div>'
		+'<div><label style="font-weight: 600;">发送时间：</label><span>'+createTime+'</span></div>'
	+'</div>'
	$(html).appendTo('#askList');
}
//查看澄清回执
function btnViewPDF(pdfUrl){
	parent.openPreview(pdfUrl);
}
