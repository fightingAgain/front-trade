


var listUrl = config.tenderHost + '/AskAnswersController/getKPAskAnswersListByBidId.do';//查询提出问题
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间

var fileDownloadUrl = config.FileHost + "/FileController/download.do";	//下载文件
var askList = [];
var bidData = '';//标段相关数据
var bidId = '';//标段id
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
	});
})

function passMessage(data){
	bidData = data;
	for(var key in data){
		$('#'+key).html(data[key])
	}
	if(data.getForm && data.getForm == 'KZT'){
		bidId = data.id;
		examType = data.examType;
	}else{
		bidId = data.bidSectionId;
		examType = data.bidStage;
	}
	getList(bidId,examType);
	getTime(bidId,examType)
};
//获取查询提出问题
function getList(id,stage){
	$.ajax({
		type:"post",
		url:listUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType': stage
		},
		success: function(data){
			if(data.success){
				if(data.data.length>0){
					listHtml(data.data);
					askList = data.data;
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
};
//查询提出问题列表
function listHtml(data){
	var html = '';
	
	$('#askList').html('');
	for(var i = 0;i<data.length;i++){
		var btn = '';
		var fileHtml = '';
		var createTime = '';//发送时间
		var askType = '';
		var btnReceive = '';
		
		if(data[i].state == 0){
    		createTime = '<span style="color:red;">未发送</span>';
		}else{
			createTime = data[i].createTime;
		}
		if(data[i].state == 2){
			btnReceive = '<div style="position: absolute;right:50px;top:0;"><span style="color:green;display:inline-block;">已查阅</span></div>'
		}else{
			btnReceive = '<div style="position: absolute;right:50px;top:0;"><span style="color:red;display:inline-block;">未查阅</span></div>'
		}
		if(data[i].askType == 1){
			askType = '资格预审文件 '
		}else if(data[i].askType == 4){
			askType = '招标文件 '
		}
		if(data[i].projectAttachmentFiles){
			var fileData = data[i].projectAttachmentFiles;
			fileHtml = '<div><label style="font-weight: 600;">问题文件：</label>'
			for(var j = 0;j<fileData.length;j++){
				fileHtml += '<a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class="btnDownload" style="margin-right:50px;cursor:pointer;text-decoration:none">'+fileData[j].attachmentFileName+'</a>'
			}
			fileHtml += '</div>';
		}
		html += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">'
    		+'<div style="margin: 10px 0;position: relative;">'
    			+'<span style="padding: 5px 10px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">问题'+(data.length-i)+'</span>'+btn
    		+'</div>'
    		+'<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">投标人：</label><span>'+(data[i].askEmployeeName?data[i].askEmployeeName:'')+'</span></div>'
        	+'<div><label style="font-weight: 600;">问题类型：</label><span>'+askType+'</span><label style="font-weight: 600;margin-left:50px;">问题标题：</label><span>'+(data[i].askTitle?data[i].askTitle:'')+'</span></div>'
        	+'<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">问题内容：</label><span>'+(data[i].askContent?data[i].askContent:'')+'</span></div>'
//      	+'<div style="height: 200px;overflow: auto;margin: 10px 0;border: 1px solid #ecebeb;padding:10px">'+data[i].askContent+'</div>'
        	+'<div>'+fileHtml+'</div>'
        	+'<div  style="position: relative;"><label style="font-weight: 600;">发送时间：</label><span>'+createTime+'</span>'+btnReceive+'</div>'
    	+'</div>'
	}
	$(html).appendTo('#askList')
}
function changeUnit(size){
	var num = Number(size);
	if(num >= 1024 * 1024 * 1024) {
		return (num/1024/1024/1024).toFixed(2) + "G";
	} else if(num >= 1024 * 1024 && num < 1024 * 1024 * 1024){
		return (num/1024/1024).toFixed(2) + "M";
	} else if(num >= 1024 && num < 1024*1024) {
		return (num/1024).toFixed(2) +"KB";
	} else { 
		return num + "B";
	}
};
/**********************    获取时间相关信息           **********************/
function getTime(id,type){
	$.ajax({
		type:"post",
		url:timeUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data){
			if(data.success){
				for(var key in data.data){
					$('#'+key).html(data.data[key])
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
