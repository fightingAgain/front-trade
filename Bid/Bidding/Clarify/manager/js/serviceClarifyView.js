


var listUrl = config.tenderHost + '/ClarifyController/getKPAClarifyListByBidId.do';//查询澄清记录
var deleteUrl = config.tenderHost + '/ClarifyController/delete.do';//删除
var fileDownloadUrl = config.FileHost + "/FileController/download.do";	//下载文件
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间

var clarifyHtml = 'Bidding/Clarify/manager/model/clarifyEdit.html';//澄清页面
var askList = [];//澄清数据列表
var bidData = '';//标段相关数据
var bidSectionData = '';//标段相关数据
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
	//添加澄清
	$('#addAsk').click(function(){
		bidSectionData.bidSectionId = bidId;
		openClarify(bidSectionData,'add')
	})
	//编辑
	$('#askList').on('click','.btnEdit',function(){
		var index = $(this).attr('data-index');
		var listData = askList[index];
		for(var key in bidData){
			listData[key] = bidData[key]
		}
		openClarify(listData,'edit')
	})
	//删除
	$('#askList').on('click','.btndel',function(){
		var index = $(this).attr('data-index');
		var listData = askList[index];
		parent.layer.confirm('确定删除?', {icon: 3, title:'询问'}, function(ind){
			parent.layer.close(ind);
			getDelete(listData.id);
		})
		
//		openClarify(passData)
	})
	//文件下载
	$('#askList').on('click','.btnDownload',function(){
		var ftpPath = $(this).attr('data-url');
		var fileName = $(this).attr('data-fname');
		fileName = fileName.substring(0, fileName.lastIndexOf("."));
		$(this).attr('href',$.parserUrlForToken(fileDownloadUrl+'?ftpPath='+ftpPath+'&fname='+fileName))
	})
})
//新增澄清
function openClarify(data,type){
	parent.layer.open({
		type: 2,
		title: '编辑澄清',
		area: ['1000px', '600px'],
		content: clarifyHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.passMessage(data,type,fromChild); 
		}
	});
};
function fromChild(id,bid){
	getList(bid,examType)
}
function passMessage(data){
	bidData = JSON.parse(JSON.stringify(data));
	bidSectionData = JSON.parse(JSON.stringify(data));
	
	
	for(var key in data){
		$('#'+key).html(data[key]);
		$('#'+key).val(data[key]);
	}
	//菜单列表中过来的有标段id（bidSectionId） 控制台过来的标段id为（id）
	if(data.getForm && data.getForm == 'KZT'){
		bidId = data.id;
		examType = data.examType;
	}else{
		bidId = data.bidSectionId;
		examType = data.bidStage;
	}
	if(bidSectionData.id){
		delete bidSectionData.id
	}
	if(bidData.id){
		delete bidData.id
	}
	getTime(bidId,examType)
	getList(bidId,examType);
	
};
//获取查询提出问题
function getList(id,bidStage){
	$.ajax({
		type:"post",
		url:listUrl,
		async:false,
		data: {
			'bidSectionId': id,
			'examType': bidStage
		},
		success: function(data){
			if(data.success){
				if(data.data){
					listHtml(data.data);
					askList = data.data;
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
};
//查询提出问题列表
function listHtml(data){
	var html = '';
	$('#askList').html('');
	if(data.length > 0){
		for(var i = 0;i<data.length;i++){
			var btn = '';
			var fileHtml = '';
			var createTime = '';//发送时间
			var clarifyType = '';
			if(data[i].state == 0){
				/*if(timeState == 1){
					btn = '<div style="position: absolute;right:0;top:0;"><button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
		    		+'<button  type="button" class="btn btn-danger btn-sm btndel" data-index="'+i+'"><span class="glyphicon glyphicon-remove"></span>删除</button></div>';
				}*/
	    		createTime = '<span style="color:red;">未发送</span>';
			}else{
				createTime = data[i].createTime;
			}
			if(data[i].clarifyType == 1){
				clarifyType = '资格预审文件 '
			}else if(data[i].clarifyType == 4){
				clarifyType = '招标文件 '
			}
			if(data[i].projectAttachmentFiles){
				var fileData = data[i].projectAttachmentFiles;
				fileHtml = '<div><label style="font-weight: 600;">澄清文件：</label>'
				for(var j = 0;j<fileData.length;j++){
					fileHtml += '<a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class=" btnDownload" style="margin-right:50px;cursor:pointer;text-decoration:none">'+fileData[j].attachmentFileName+'</a>'
				}
				fileHtml += '</div>';
	//			fileHtml = '<table class="table table-bordered ">'
	//      		+'<tr>'
	//      			+'<th style="width: 50px;text-align: center;">序号</th>'
	//      			+'<th>文件名称</th>'
	//      			+'<th>文件大小</th>'
	//      			+'<th>创建人</th>'
	//      			+'<th style="width: 150px;text-align: center;">创建时间</th>'
	//      			+'<th style="width: 80px;text-align: center;">操作</th>'
	//      		+'</tr>';
	//      	for(var j = 0;j<fileData.length;j++){
	//      		fileHtml += '<tr>'
	//      			+'<td style="width: 50px;text-align: center;">'+(j+1)+'</td>'
	//      			+'<td>'+fileData[j].attachmentFileName+'</td>'
	//      			+'<td>'+changeUnit(fileData[j].attachmentSize)+'</td>'
	//      			+'<td>'+fileData[j].createEmployeeName+'</td>'
	//      			+'<td style="width: 150px;text-align: center;">'+fileData[j].createDate+'</td>'
	//      			+'<td><a target="_blank" data-url="'+fileData[j].url+'" data-fname="'+fileData[j].attachmentFileName+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a></td>'
	//      		+'</tr>'
	//      	}
	//      	fileHtml += '</table>'
			}
			html += '<div style="margin: 20px;padding: 20px;border: 2px solid #ecebeb;box-shadow: 0 5px 10px #ecebeb;">'
	    		+'<div style="margin: 10px 0;position: relative;">'
	    			+'<span style="padding: 5px 10px;background: orange;color: #ffffff;border-radius: 4px;font-weight: 600;">澄清'+(data.length-i)+'</span>'+btn
	    		+'</div>'
	        	+'<div><label style="font-weight: 600;">澄清类型：</label><span>'+clarifyType+'</span><label style="font-weight: 600;margin-left:50px;">澄清标题：</label><span>'+(data[i].clarifyTitle?data[i].clarifyTitle:'')+'</span></div>'
	        	+'<div style="margin-bottom:5px;"><label style="font-weight: 600;margin-bottom:0px;">澄清内容：</label><span>'+(data[i].clarifyContent?data[i].clarifyContent:'')+'</span></div>'
	//      	+'<div style="padding:5px 10px 10px 10px">'+data[i].clarifyContent+'</div>'
	        	+'<div>'+fileHtml+'</div>'
	        	+'<div><label style="font-weight: 600;">发送时间：</label><span>'+createTime+'</span></div>'
	    	+'</div>'
		}
		$(html).appendTo('#askList');
	}
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
//删除
function getDelete(id){
	$.ajax({
		type:"post",
		url:deleteUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				parent.layer.alert('删除成功！',{icon:6,title:'提示'});
				getList(bidId,examType);
				parent.$('#tableList').bootstrapTable('refresh');
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
/**********************    获取时间相关信息           **********************/
function getTime(id,type){
	$.ajax({
		type:"post",
		url:timeUrl,
		async:false,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data){
			if(data.success){
				//获取当前时间
				nowTime = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g,"/")));
				var endTime = Date.parse(new Date(data.data.answersEndDate.replace(/\-/g,"/")))
				for(var key in data.data){
					$('#'+key).html(data.data[key])
				}
				timeState = data.data.clarifyTimeState;
				if(timeState != 'undefined' && timeState == 0 ){
					$('#addAsk').css('display','none')
				}
				bidData.answersEndDate = data.data.answersEndDate;
				bidSectionData.answersEndDate = data.data.answersEndDate;
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
