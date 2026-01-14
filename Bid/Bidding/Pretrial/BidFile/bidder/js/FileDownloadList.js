var searchUrl = config.tenderHost + '/BidRemarkController/findBidRemarkList.do'; //下载列表补充说明查询根据标段ID接口
var searchUrlAttachmentFile = config.tenderHost + '/PretrialDocClarifyController/findAttachmentFileNewest.do'; //根据标段ID获取附件List信息
var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var saveUrl = config.tenderHost + "/ProjectAttachmentFileDownController/insertProjectAttachmentFileDown.do"; //添加下载记录信息

var fileDownloadUrl = config.FileHost + "/FileController/download.do";
var historyUrl = config.tenderHost + '/PretrialDocClarifyController/findOldAttachmentFileList.do';  //招标文件时间变更历史
var fileDownInfoUrl= config.tenderHost + "/ProjectAttachmentFileDownController/insertProjectAttachmentFileDown.do";  //下载次数

var pageView = 'Bidding/BidFile/BidFileChange/model/BidFileView.html';  

var packageId;//标段主键ID
var bidFileId; //招标文件主表iD
var linkMen;
var linkTel;
var fileArr=[];
var BIdFiles=[];
var RemFiles = [];

var bidUploads = null; //招标文件

var bidData;  //

var hisData;
var tenderType = 4 ;//采购类型
$(function(){
	
	// 获取连接传递的参数
 	if($.getUrlParam("bidFileId") && $.getUrlParam("bidFileId") != "undefined"){
		bidFileId =$.getUrlParam("bidFileId");
	}
	
	// 获取连接传递的参数
 	if($.getUrlParam("packageId") && $.getUrlParam("packageId") != "undefined"){
		packageId =$.getUrlParam("packageId");
		getBidFileArr();
		
	}
	changeHistory();
	// 获取连接传递的参数
 	if($.getUrlParam("linkMen") && $.getUrlParam("linkMen") != "undefined"){
		linkMen =$.getUrlParam("linkMen");
	}
	
	// 获取连接传递的参数
 	if($.getUrlParam("linkTel") && $.getUrlParam("linkTel") != "undefined"){
		linkTel =$.getUrlParam("linkTel") ;
	};
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	$("#fileChangeList").on("click", ".btnDownload", function(){
		var that = $(this);
		checkService(that, function(){
			var index = that.attr("data-index");
			var road = fileArr.file2[index].url;
			var fileName = fileArr.file2[index].attachmentFileName;
			fileName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/\s+/g,"");
			window.location.href = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName);
//			that.attr('href',$.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName))
		});
		
	});
	$("#changeHis").on("click", ".btnDownload", function(){
		var that = $(this);
		checkService(that, function(){
			var index = that.attr("data-index");
			var road = hisData[index].projectAttachmentFiles[0].url;
			var fileName = hisData[index].projectAttachmentFiles[0].attachmentFileName;
			fileName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/\s+/g,"");
			window.location.href = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName);
//			that.attr('href',$.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName));
			
		});
		
	});
	//文件下载
	$("#fileList").on("click", ".btnDownload", function(){
		var that = $(this);
		checkService(that, function(){
			fileDownLoad(that);
		});
	});
	//查看变更信息
//	$("#changeHis").on("click", ".btnView", function(){
//		var changeId = $(this).attr("data-id");
//		openView(changeId);
//	})
	
});

function checkService(that, callback){
	//验证是否购买平台服务费
	checkServiceCost({
		projectId:bidData.projectId,
		packId:bidData.bidSectionId,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		isCanDownload:true,
		paySuccess:function(data, isService){
			if(data){
				callback();
			}
		}
	});
}


function fileDownLoad(obj){
	var that = obj;
	var index = that.attr("data-index");
	
	var road, fileName, id;
		road = fileArr.file1[index].url;	// 下载文件路径
		fileName = fileArr.file1[index].attachmentFileName;;	// 文件名
		fileName = fileName.substring(0, fileName.lastIndexOf("."));
		id = fileArr.file1[index].id;
		
		//文件下载信息
		$.ajax({
			type:'post',
			url:fileDownInfoUrl,
			async: false,
			data: {
				'projectAttachmentFileId': id
			},
			success: function(data){
				if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}
//				that.attr('href',$.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName.replace(/\s+/g,"")));
				window.location.href = $.parserUrlForToken(fileDownloadUrl+'?ftpPath='+road+'&fname='+fileName.replace(/\s+/g,""));
			},
			error: function(){
				parent.layer.alert("请求失败");
			}
		});
}


function getBidFileArr() {
	$.ajax({
		url: searchUrlAttachmentFile,
		type: "post",
		data: {
			id: bidFileId,
			bidSectionId:packageId
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			if(data.data){
				var arr = data.data;
				fileArr = {file1:[], file2:[]};
				/*if(!bidUploads){
					bidUploads = new StreamUpload("#fileList",{
						status:2,
						businessTableName:'T_BID_DOC_CLARIFY',  //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode:'TENDER_FILE',
						
					});
				}*/
				for(var i = 0; i < arr.length; i++){
					if(arr[i].attachmentSetCode == "QUALIFICATION_DOC"){
						fileArr.file1.push(arr[i]);
					} else{
						fileArr.file2.push(arr[i]);
					}
				}
				fileTable(fileArr.file1);
				fileHtml(fileArr.file2);
			}
		},
		error: function(data) {
			parent.layer.alert("加载失败", {
				icon: 3,
				title: '提示'
			});
		}
	});

};
function fileTable(arr){ 
		var html = "";

		html = '<tr><td style="width:50px; text-align:center">序号</td><td>文件名称</td><td style="width:100px; text-align:center">文件大小</td>';
		html += '<td style="width:200px">操作</td></tr>';
		
		for(var i = 0; i < arr.length; i++){
			html += '<tr><td style="width:50px; text-align:center">'+(i+1)+'</td>'+
					'<td>'+(arr[i].attachmentFileName?arr[i].attachmentFileName:"")+'</td>' + 
					'<td style="width:100px; text-align:center">'+changeUnit(arr[i].attachmentSize)+'</td>';
//			html += '<td style="width:150px; text-align:center">'+arr[i].createEmployeeName+'</td><td style="width:150px; text-align:center">'+arr[i].createDate+'</td>';
			
			/*if(arr[i].attachmentSetCode == "DRAWING_DOCUMENT"){
				html += '<td style="width:150px; text-align:center">图纸文件</td>';
			} else if(arr[i].attachmentSetCode == "OTHER_FILE_ATTACHS"){
				html += '<td style="width:150px; text-align:center">其他资料文件</td>';
			} else if(arr[i].attachmentSetCode == "REPLENISH_FILE"){
				html += '<td style="width:150px; text-align:center">补遗文件</td>';
			} else {
				html += '<td style="width:150px; text-align:center"></td>';
			}*/
			html += '<td><a target="_blank" data-index="'+i+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>';
			html += '</td></tr>';
		}
		$(html).appendTo("#fileList");
	
}

function fileHtml(arr){ 
		var html = "";

		html = '<tr><td style="width:50px; text-align:center">序号</td><td>文件名称</td><td style="width:100px; text-align:center">文件大小</td>';
		html += '<td style="width:150px; text-align:center">文件类型</td>';
		html += '<td style="width:200px">操作</td></tr>';
		
		for(var i = 0; i < arr.length; i++){
			html += '<tr><td style="width:50px; text-align:center">'+(i+1)+'</td>'+
					'<td>'+(arr[i].attachmentFileName?arr[i].attachmentFileName:"")+'</td>' + 
					'<td style="width:100px; text-align:center">'+changeUnit(arr[i].attachmentSize)+'</td>';
//			html += '<td style="width:150px; text-align:center">'+arr[i].createEmployeeName+'</td><td style="width:150px; text-align:center">'+arr[i].createDate+'</td>';
			
			if(arr[i].attachmentSetCode == "QUALIFICATION_DOC"){
				html += '<td style="width:150px; text-align:center">资格预审文件</td>';
			} else if(arr[i].attachmentSetCode == "QUALIFICATION_DOC_ATTACHS"){
				html += '<td style="width:150px; text-align:center">相关附件</td>';
			} else {
				html += '<td style="width:150px; text-align:center"></td>';
			}
			html += '<td><a target="_blank" data-index="'+i+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>';
			html += '</td></tr>';
		}
		$(html).appendTo("#fileChangeList");
	
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
}
//
function passMessage(data){
	bidData = data;
}

/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(changeId) {
	var width = top.$(parent).width() * 0.8;
	var height = top.$(parent).height() * 0.9;
	var rowData = {
		interiorBidSectionCode:bidData.interiorBidSectionCode,
		bidSectionName:bidData.bidSectionName,
		id:changeId,
		isRecord:true
	}; //bootstrap获取当前页的数据
	top.layer.open({
		type: 2,
		title: "查看招标文件变更",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageView + "?source=0" + "&id=" + rowData.id + "&isThrough=-1", //标段主键id
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}

//变更历史
function changeHistory(){
	$.ajax({
		type: "post",
		url: historyUrl,
		async: false,
		data:{
			id:bidFileId
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			if(arr && arr.length > 0){
				historyHtml(arr);
			}
		}
	});
}
function historyHtml(data){
	hisData = data;
	var fname = "";
	var html = '<div class="table-responsive"><table class="table table-bordered"><tr><td style="width:50px;text-align:center;">序号</td><td>资格预审文件</td><td style="width:200px;text-align:center;">变更时间</td><td style="width:100px">操作</td></tr>';
	for(var i = 0; i < data.length; i++){
		for(var j = 0; j < data[i].projectAttachmentFiles.length; j++){
			if(data[i].projectAttachmentFiles[j].attachmentSetCode == "QUALIFICATION_DOC"){
				fname = data[i].projectAttachmentFiles[j].attachmentFileName;
			}
		}
		html += '<tr>\
					<td style="text-align:center;">'+(i+1)+'</td>\
					<td>'+fname+'</td>\
					<td style="text-align:center;">'+(data[i].createTime ? data[i].createTime : "") +'</td>\
					<td><a target="_blank" data-index="'+i+'" class="btn-primary btn-sm btnDownload" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</a>\
				</tr>';
	}
	html += '</table></div>';
	if(data.length > 0){
		$(html).appendTo("#changeHis");
	}
}
