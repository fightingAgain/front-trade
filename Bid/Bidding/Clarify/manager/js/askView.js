


var listUrl = config.tenderHost + '/AskAnswersController/findAskAnswersList.do';//查询提出问题
var receiveUrl = config.tenderHost + '/AskAnswersController/confirmState.do';//确认接收问题接口
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间
var clarifyHtml = 'Bidding/Clarify/manager/model/clarifyEdit.html';//澄清页面
var ViewClarifyHtml= 'Bidding/Clarify/manager/model/clairfyView.html';//查看澄清
var fileDownloadUrl = config.FileHost + "/FileController/download.do";	//下载文件
var askList = [];
var bidData = '';//标段相关数据
var bidId = '';//标段id
var examType = '';//标段当前处于预审还是后审阶段
var answersEndDate = '';//澄清截止时间
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
	
	//确认
	$('#askList').on('click','.btnReceive',function(){
		var index = $(this).attr('data-index');
		$.ajax({
			type:"post",
			url:receiveUrl,
			async:true,
			data: {
				'id': askList[index].id,
				'state': 2
			},
			success: function(data){
				if(data.success){
					parent.layer.alert('已查阅')
					getList(bidId,examType)
				}
			}
		});
	});
})
function passMessage(data, callback){
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
	getTime(bidId,examType)
	getList(bidId,examType);
	//澄清回复
	$('#askList').on('click','.btnReplyEdit',function(){
		var index = $(this).attr('data-index');
		askList[index].bidStage = examType;
		askList[index].answersEndDate = answersEndDate;
		top.layer.open({
			type: 2,
			title: '澄清',
			area: ['1000px', '650px'],
			content: clarifyHtml + '?isBeAsk=1',
			resize: false,
			success:function(layero, ind){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				//调用子窗口方法，传参
				iframeWin.passMessage(askList[index], 'answerBeAsk', function(){
					getList(bidId,examType);
					if(callback){
						callback()
					}
				});
			}
		});
	});
	//查看澄清
	$('#askList').on('click','.btnReplyView',function(){
		var index = $(this).attr('data-index');
		var passData = JSON.parse(JSON.stringify(bidData));
		passData.clarify = askList[index].clarify;
		passData.answersEndDate = answersEndDate;
		top.layer.open({
			type: 2,
			title: '查看澄清',
			area: ['1000px', '650px'],
			content: ViewClarifyHtml,
			resize: false,
			success:function(layero, ind){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				//调用子窗口方法，传参
				iframeWin.passMessage(passData);
			}
		});
	});
	
};
//获取查询提出问题
function getList(id,stage){
	$.ajax({
		type:"post",
		url:listUrl,
		async:false,
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
		// var btn = '';
		var fileHtml = '';
		var createTime = '';//发送时间
		var askType = '';
		var btnReceive = '';
		var clairfyBtn = '';//回复按钮
		
		/* if(data[i].state == 0){
			btn = '<div style="position: absolute;right:0;top:0;"><button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
	    		+'<button  type="button" class="btn btn-danger btn-sm btndel" data-index="'+i+'"><span class="glyphicon glyphicon-remove"></span>删除</button></div>';
    		createTime = '<span style="color:red;">未发送</span>';
		}else{
			createTime = data[i].createTime;
		} */
		createTime = data[i].createTime;
		if(data[i].state == 2){
			btnReceive = '<div style="position: absolute;right:50px;top:0;"><span style="color:green;display:inline-block;">已查阅</span></div>'
		}else{
			btnReceive = '<div style="position: absolute;right:50px;top:-10px;"><button  type="button" class="btn btn-success btn-sm btnReceive" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>查阅</button></div>';
		}
		//项目经理针对单条提问的回复按钮。未回复时显示“澄清回复”，回复后显示“查看澄清”；
		if(data[i].clarifyState && data[i].clarifyState == 1){
			clairfyBtn = '<div style="position: absolute;right:0;top:0;"><button  type="button" class="btn btn-primary btn-sm btnReplyView" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>查看澄清</button>'
	    	+'</div>';
		}else{
			//回复截止时间还未到时显示回复按钮
			if(answersEndDate != '' && (new Date(answersEndDate.replace(new RegExp("-","gm"),"/"))).getTime() > new Date().getTime()){
				clairfyBtn = '<div style="position: absolute;right:0;top:0;"><button  type="button" class="btn btn-primary btn-sm btnReplyEdit" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>澄清回复</button>'
				+'</div>';
			}
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
			/*fileHtml = '<table class="table table-bordered ">'
        		+'<tr>'
        			+'<th style="width: 50px;text-align: center;">序号</th>'
        			+'<th>文件名称</th>'
        			+'<th>文件大小</th>'
        			+'<th>创建人</th>'
        			+'<th style="width: 150px;text-align: center;">创建时间</th>'
        			+'<th style="width: 80px;text-align: center;">操作</th>'
        		+'</tr>';
        	for(var j = 0;j<fileData.length;j++){
        		fileHtml += '<tr>'
        			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
        			+'<td>'+fileData[j].attachmentFileName+'</td>'
        			+'<td>'+changeUnit(fileData[j].attachmentSize)+'</td>'
        			+'<td>'+fileData[j].createEmployeeName+'</td>'
        			+'<td style="width: 150px;text-align: center;">'+fileData[j].createDate+'</td>'
        			+'<td><a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a></td>'
        		+'</tr>'
        	}
        	fileHtml += '</table>'*/
		}
		html += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">'
    		+'<div style="margin: 10px 0;position: relative;">'
    			+'<span style="padding: 5px 10px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">问题'+(data.length-i)+'</span>'+clairfyBtn
    		+'</div>'
        	+'<div><label style="font-weight: 600;">问题类型：</label><span>'+askType+'</span><label style="font-weight: 600;margin-left:50px;">问题标题：</label><span>'+(data[i].askTitle?data[i].askTitle:'')+'</span></div>'
        	+'<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">问题内容：</label><span style="word-break:break-all;">'+(data[i].askContent?data[i].askContent:'')+'</span></div>'
//      	+'<div style="height: 200px;overflow: auto;margin: 10px 0;border: 1px solid #ecebeb;padding:10px">'+data[i].askContent+'</div>'
        	+'<div>'+fileHtml+'</div>'
        	+'<div  style="position: relative;"><label style="font-weight: 600;">发送时间：</label><span >'+createTime+'</span>'+btnReceive+'</div>'
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
		async: false,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data){
			if(data.success){
				answersEndDate = data.data.answersEndDate;
				for(var key in data.data){
					$('#'+key).html(data.data[key])
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
