var findSupplierAllUrl= config.Reviewhost + "/RaterAskListController/findSuppliers.do";
var expertRaterListUrl= config.Reviewhost + "/RaterAskListController/expertRaterList.do"
var checkRaterAskUrl= config.Reviewhost + "/RaterAskListController/checkRaterAsk.do";  //确认发送澄清
var resetExpertAskUrl= config.Reviewhost + "/RaterAskListController/resetRaterAskAnswers.do";  //撤回质疑
var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var pageAskEdit = "Review/judgeCheck/model/askEdit.html";  //提出质疑页面
var SupplierAllList,supplierArr,supplierArrId,clarifyTimer,isLeaders,isFinishc,datastate=1,isPublicProject;
//澄清获取投标人列表
function clarify(){
    var flag = false;
	$.ajax({
		url: findSupplierAllUrl,
     	type: "post",
        async:false,
     	data:{
			'packageId':bidSectionId,
			'examType':examType,			
     	},
     	success: function (data) {
         	if(data.success){
                flag = true;
         		SupplierAllList=data.data.suppliers;//投标人列表
         		isLeaders=data.data.isLeader;//是否是组长
         		isFinishc=data.data.isFinish;//是否完成评标报告
         		datastate=1;
                supplierArrId=SupplierAllList[0].supplierId;
         		supplierAllHtml(); 
         		$("#relevant").hide();
        	}else{
        		top.layer.alert('温馨提示：'+data.message);
        		/*$(".list li").removeClass('open');
				$('[data-name='+ele+']').addClass('open');*/
        		/*$(".list li").eq(0).addClass('open').siblings().removeClass('open');
				signPromise();*/
        	}        
     	},
     	error: function (data) {     		
         	top.layer.alert("温馨提示：加载失败");
     	}
 	});
	return flag;
}
//投标人的选项
function supplierAllHtml(){
	var list='<ul class="nav nav-tabs" style="margin:5px auto">'	
	for(var i=0;i<SupplierAllList.length;i++){
				if(i==0){
					list+='<li role="presentation" class="active askBidder" data-bidderId="'+SupplierAllList[i].supplierId+'"><a href="#" data-toggle="tab">'+ SupplierAllList[i].enterpriseName  +'</a></li>'
				}else{
					list+='<li role="presentation" class="askBidder" data-bidderId="'+SupplierAllList[i].supplierId+'"><a href="#" data-toggle="tab">'+ SupplierAllList[i].enterpriseName  +'</a></li>'
				}							
			};			
	list+='</ul>'
	list+='<div id="supplierListsDiv" style="width:98%;margin:10px auto"></div>'
	$("#content").html(list);
	getExpertRaterList(SupplierAllList[0].supplierId)
}
//获取当前投标人的澄清质疑答疑的数据列表
function getExpertRaterList(supplierId){
	if($('#supplierListsDiv').length == 0){
		clearInterval(clarifyTimer);
		return
	};
	var para = {
     		supplierId:supplierId,
     		packageId: bidSectionId,
     		examType: examType,
     		isChairMan:isLeaders
    }
	$.ajax({
		url: expertRaterListUrl,
     	type: "post",
     	data:para,
     	beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	   
	    },
     	success: function (data) {
         	if(data.success){
     			supplierArr = data.data;
     			supplierArrId=supplierId
         		supplierListsDiv();       		
        	}else{
        		top.layer.alert('温馨提示：'+data.message);
        	}	
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
//澄清的质疑答疑的页面渲染
function supplierListsDiv(){
	$('.clarifyBox').html('');
	var buts=''
	if(isLeaders==1 && isFinishc==0){
        buts+='<a type="button" class="btn btn-primary btn-strong" style="margin-left:5px;background-color:#e43636 ;border-color: #e43636;" href="javascript:void(0)" id="btnSend">添加提问</a>'
	};	       
//	html1+='<a type="button" class="btn btn-primary btn-strong" style="margin-left:5px;" href="javascript:void(0)" id="btnRefurbish">刷新</a>'
	if(datastate==1){
        buts+='<a type="button" class="btn btn-primary btn-strong" style="margin-left:5px;background-color:#e43636 ;border-color: #e43636;" href="javascript:void(0)" id="btnAutoRefresh">自动刷新</a>'
	}else{
        buts+='<a type="button" class="btn btn-primary btn-strong" style="margin-left:5px;background-color:#e43636 ;border-color: #e43636;" href="javascript:void(0)" id="btnAutoRefresh">取消刷新</a>'
	}
    setButton(buts);
	var html = '';
	for(var i=0; i < supplierArr.length; i++){
		var askCont = '';
		if(bidSectionInfo.isPublicProject == 1){
			askCont = '<button type="button" class="btn btn-primary btn-sm view_askCont" data-url="'+supplierArr[i].askPdfUrl+'">预览</button>'
		}else{
			askCont = supplierArr[i].askContent;
		}
		html += '<table class="table table-bordered">';
//				html += '<tr><td class="th_bg" >投标人</td><td colspan="3">'+supplierArr[i].supplierName+'</td></tr>';
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
	$("#supplierListsDiv").html(html);
	//提出质疑发送
	$("#btnSend").click(function(){
		top.layer.open({
			type: 2,
			title: "提出问题",
			area: ['1000px','600px'],
			resize: false,
			content: pageAskEdit + "?packageid=" + bidSectionId + "&supplierid=" + supplierArrId + "&examtype=" + examType + '&isPublicProject=' + bidSectionInfo.isPublicProject,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;				
			},
			end:function(layero, index){
				getExpertRaterList(supplierArrId)
			}
		});
	});
	//撤回质疑
	$(".btnRecall").on("click", function(){
		var id = $(this).attr("data-id");
		top.layer.confirm('温馨提示：确定是否撤回该提问吗？',{icon:7,title:'询问'},
		function(index){
			retractExpertAsk(id);
    	},function(index) {
			top.layer.close(index);
		});
		
	});
	//确认发送质疑
	$(".btnConfirm").on("click", function(){
		var id = $(this).attr("data-id");
		top.layer.confirm('温馨提示：确定是否发送该提问吗？',{icon:7,title:'询问'},
		function(index){
			checkRaterAsk(id);
    	},function(index) {
			top.layer.close(index);
		});
		
	});
	//自动刷新
	$("#btnAutoRefresh").click(function(){		
		if(datastate == 0){
			datastate=1;	
			supplierListsDiv();
			clearInterval(clarifyTimer);
		} else {
			datastate=0;
			supplierListsDiv()
			clarifyTimer=setInterval(function(){
				getExpertRaterList(supplierArrId);
		  },5000);
			
		}
	});
}
/**
 * 确认发送质疑问题
 * @param {Object} id当前质疑问题的id
 */
function checkRaterAsk(id){
	$.ajax({
		url: checkRaterAskUrl,
     	type: "post",
     	data:{
     		id:id
     	},
     	success: function (data) {
         	if(data.success){
     			top.layer.alert("温馨提示：发送成功");
     			getExpertRaterList(supplierArrId);
     		}else{
     			top.layer.alert('温馨提示：'+data.message);
     		}
     		
     	},
     	error: function (data) {
         	showDialog("温馨提示：加载失败");
     	}
 	});
}
/**
 * 撤回质疑问题
 * @param {Object} id 当前质疑问题的id
 */
function retractExpertAsk(id){
	$.ajax({
		url: resetExpertAskUrl,
     	type: "post",
     	data:{
     		id: id
     	},
     	success: function (data) {
     		if(data.success){
     			top.layer.alert("温馨提示：撤回成功");
     			getExpertRaterList(supplierArrId);
     		}else{
     			top.layer.alert('温馨提示：'+data.message);
     		}
         	
     	},
     	error: function (data) {
         	showDialog("温馨提示：加载失败");
     	}
 	});
}
//展示图片
function showImages(obj) {
	parent.previewPdf(obj);
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
$('#contents').on('click','.answerContent',function(){
    var path = $(this).attr('data-pdf');
    parent.previewPdf(path);
});
//预览提问内容
$('#contents').on('click','.view_askCont',function(){
    var path = $(this).attr('data-url');
    parent.previewPdf(path);
});
$('#contents').on('click','.askBidder',function(){
	var supplierId = $(this).attr("data-bidderId");
    getExpertRaterList(supplierId);
});

