/*
 * 招标人查看评委提问
 * */


var listUrl = config.Reviewhost + '/RaterAskListController/tenderRaterList.do';  //列表接口
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var signHtml = 'Review/tender/clarifyConfirm/model/signView.html';//签章页面
var bidSectionId = '';
var examType = '';
var questionList = [];
var isPublicProject;
$(function(){
	bidSectionId = $.getUrlParam('id');
	examType = $.getUrlParam('examType');
	
	//关闭
	$("#btnClose").click(function () {
		var index = top.layer.getFrameIndex(window.name);
		top.layer.close(index);
	})
});
function passMessage(data){
	isPublicProject = data.isPublicProject;
	$('#bidSectionCode').html(data.bidSectionCode);
	$('#bidSectionName').html(data.bidSectionName);
	getAskList();
}
function getAskList(){
	$.ajax({
		type:"post",
		url:listUrl,
		async:false,
		data: {
			'packageId': bidSectionId,
			'examType': examType,
//			'isChairMan': 0
		},
		success: function(data){
			if(data.success){
				if(data.data && data.data.length > 0){
					questionList = data.data;
					askListHtml(questionList)
				}
			}else{
				top.layer.alert('温馨提示：'+data.message)
			}
		}
	});
}
function askListHtml(supplierArr){
	$("#ask_list").html('');
	var html = '';
	for(var i=0; i < supplierArr.length; i++){
		var askCont = '';
		if(isPublicProject == 1){
			if(supplierArr[i].askState == 0){ // 0为未发布，1为正常，2为撤回 3.已回复 4.待审核
				askCont = '<button type="button" class="btn btn-primary btn-sm btn_sign" data-id="'+supplierArr[i].id+'" data-url="'+supplierArr[i].askPdfUrl+'">签章</button>'
			}else{
				askCont = '<button type="button" class="btn btn-primary btn-sm view_askCont" data-url="'+supplierArr[i].askPdfUrl+'">预览</button>'
			}
		}else{
			askCont = supplierArr[i].askContent;
		}
		html += '<table class="table table-bordered">';
				html += '<tr><td class="th_bg" >投标人</td><td colspan="3">'+supplierArr[i].supplierName+'</td></tr>';
				html += '<tr><td class="th_bg">提问时间</td><td colspan="3">'+supplierArr[i].askDate+'</td></tr>';
				html += '<tr><td class="th_bg">提问内容</td><td colspan="3">'+askCont+'</td></tr>';
				html += '<tr><td class="th_bg">提问附件</td><td colspan="3">';
		if(supplierArr[i].raterAskFiles && supplierArr[i].raterAskFiles.length > 0){
			fileDataAsk = supplierArr[i].raterAskFiles;
			html += '<table class="table table-bordered"><tr><td style="width:50px;text-align:center;">序号</td><td>文件名</td><td style="width:150px;text-align:center;">操作</td></tr>';
			for(var j = 0; j < fileDataAsk.length; j ++){
				html += '<tr><td style="width:50px;text-align:center;">'+(j+1)+'</td><td>'+fileDataAsk[j].attachmentFileName+'</td><td style="width:150px;text-align:center;">';
				var filesnames = fileDataAsk[j].attachmentFileName.substring(fileDataAsk[j].attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
					html += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImages(\'" + fileDataAsk[j].url + "\')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
				}
				html += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFiles("+i+","+ j +",'fileDataAsk')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
				html += '</td></tr>'
			}
			html += '</table>'
			html += '</td></tr>'
		}
		html += '<tr><td class="th_bg">答复时间</td><td colspan="3">'+(supplierArr[i].answerDate?supplierArr[i].answerDate:'')+'</td></tr>';
		html+= '<tr><td class="th_bg">答复内容</td><td colspan="3">'+(supplierArr[i].fileUrl ? "<button type='button' class='btn btn-primary btn-sm answerContent' data-pdf='"+supplierArr[i].fileUrl+"' style='margin-right:5px;cursor:pointer;text-decoration:none'>查看</button>" : "")+'</td></tr>'
		html+= '<tr><td class="th_bg">答复附件</td><td colspan="3">';
		if(supplierArr[i].raterAnswersFiles && supplierArr[i].raterAnswersFiles.length > 0){
		    fileDataAnswer = supplierArr[i].raterAnswersFiles;
			html += '<table class="table table-bordered"><tr><td style="width:50px;text-align:center;">序号</td><td>文件名</td><td style="width:150px;text-align:center;">操作</td></tr>';
			for(var j = 0; j < fileDataAnswer.length; j ++){
				html += '<tr><td style="width:50px;text-align:center;">'+(j+1)+'</td><td>'+fileDataAnswer[j].attachmentFileName+'</td><td style="width:150px;text-align:center;">';
				var filesnames = fileDataAnswer[j].attachmentFileName.substring(fileDataAnswer[j].attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
				if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
					html += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImages(\'" + fileDataAnswer[j].url + "\')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
				}
				html += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFiles("+i+",\'" + j + "\','fileDataAnswer')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
				html += '</td></tr>'
			}
			
			html += '</table>'
		}
				
		html += '</td></tr>';
		html += '</table>'
		
	}
	$("#ask_list").html(html);
}
//下载
function downloadFiles(num,_index,name) {
	if(name=='fileDataAsk'){
		var fileName=supplierArr[num].raterAskFiles[_index].attachmentFileName
		var filePath=supplierArr[num].raterAskFiles[_index].url;
	}else{
		var fileName=supplierArr[num].raterAnswersFiles[_index].attachmentFileName
		var filePath=supplierArr[num].raterAnswersFiles[_index].url;
	}
	var filesnamel = fileName.substring(0,fileName.lastIndexOf("."));
	var newUrl =dowoloadFileUrl + '?ftpPath=' + filePath + '&fname=' + filesnamel;
	window.location.href = $.parserUrlForToken(newUrl);
}
//预览答复内容
$('#ask_list').on('click','.answerContent',function(){
    var path = $(this).attr('data-pdf');
    parent.previewPdf(path, "100%", "100%");
});
//预览提问内容
$('#ask_list').on('click','.view_askCont',function(){
    var path = $(this).attr('data-url');
    parent.previewPdf(path, "100%", "100%");
});
//签章
$('#ask_list').on('click','.btn_sign',function(){
    var path = $(this).attr('data-url');
    var id = $(this).attr('data-id')
    top.layer.open({
		type: 2,
		title: '签章',
		area: ['100%', '100%'],
		resize: false,
		content: signHtml + '?bidSectionId=' + bidSectionId + '&examType=' + examType + '&path=' + path + '&id=' + id,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(getAskList)
		},
	})
//  parent.openPreview(path, "1000px", "600px");
});
