/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */
var detailUrl = config.tenderHost + '/PretrialDocClarifyController/findPretrialDocByBidId.do';  //招标文件详情(控制台)
var detUrl = config.tenderHost + '/PretrialDocClarifyController/findPretrialDocClarifyById.do';  //招标文件详情（待办、已办）
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段信息
var findBidCheckListUrl = config.tenderHost + '/PretrialDocClarifyController/findBidCheckList.do';  //招标文件详情
/*********************** 变更  ****************/
var historyUrl = config.tenderHost + '/PretrialDocClarifyController/findOldChangeList.do';  //招标文件时间变更历史
var fileDownloadUrl = config.FileHost + "/FileController/download.do";
var pageView = 'Bidding/Pretrial/BidFile/manage/model/bidFileChangeView.html';//查看变更详情
var preBidHtml = "../../../../BidIssuing/roomOrder/model/preBidView.html";  //查看标段详情页面
var historyArr = [];//历史记录数据
/*********************** end  ****************/


var bidSectionId; //标段主键ID
var fileId; //招标文件表主键ID
var fileArr = []; //文件数组操作 上传或者修改
var employeeInfo = entryInfo(); //企业信息
var bidUploads = null, //招标文件
	drawUploads = null;  //图纸文件
var source = '0'; //链接来源  0:查看  1审核
var typeCode = ""; //招标项目分类
var reviewData;
var isThrough = "";
var special = '';  //0是控制台查看，1是审核，2是可以查看审核项
var zbwjPdf = '';
var comeForm = $.getUrlParam("comeForm");
var changeCount = 0;//变更次数
$(function() {
//	isThrough = $.getUrlParam("isThrough");
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
		source =$.getUrlParam("source");
		fileId = $.getUrlParam("id")
	}
	if(($.getUrlParam("special") && $.getUrlParam("special") != "undefined") || $.getUrlParam("isFromConsole") == "1"){
		special =$.getUrlParam("special") || 0;
		bidSectionId = $.getUrlParam("id");
	}else{
		bidSectionId = $.getUrlParam("bidSectionId");
	}

	if($.getUrlParam("bidOpenId") && $.getUrlParam("bidOpenId") != "undefined") {
		fileId = $.getUrlParam("bidOpenId");
	}
	detail();
	/* 查看标段信息 */
	if(comeForm == 'SH'){
		$('#interiorBidSectionCode').addClass('relevantBid')
	}
	$('body').on('click','.relevantBid',function(){
		var surl = preBidHtml + '?id=' + bidSectionId + '&examType=1&isAgency=' + employeeInfo.isAgency + '&isBlank=1'
		window.open(surl, "_blank");
	})
	/*  查看标段信息 --end */
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//切换评审项
	$('#reviewDetailTabs').on("click", "a", function (e) {
		var index = $(this).attr("data-index");
		$(this).parent().addClass("active").siblings("li").removeClass("active");
		reviewItem(index);
	});
	$("#bidFile").on("click", ".bidPreview", function(){
		previewPdf($(this).attr("data-url"));
	});
	//查看变更详情
	$('#changeHis').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		openView(index);
	})
	//预览
	$('#btnPreview').click(function(){
		previewPdf(zbwjPdf)
	});
});

//其他页面调用的方法
function passMessage(data){
	if(data){
		$("#btnChoose").hide();
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		$("#bidSectionName").html(data.bidSectionName);
		bidSectionId = data.bidSectionId;
		typeCode = data.tenderProjectType ? data.tenderProjectType.substring(0,1) : "";
		isPay = data.isPay ? data.isPay : "";
		if(typeCode && isPay){
			if(typeCode == "A"){
				if(isPay == 0){
					$(".drawShow").hide();
				} else {
					$(".drawShow").show();
				}
			} else {
				$(".drawShow").hide();
			}
		}
	} else {
		$("input[name='marginPayType']").each(function(){
			$(this).attr("checked", true);
		});
	}
	
}


/**
 * 获取招标文件详情
 * id 招标文件当前id
 */
function detail(){
	var postUrl = '';
	var postData = {};
	if(fileId){
		postUrl = detUrl;
		postData.id = fileId;
	}else{
		postUrl = detailUrl;
		postData.bidSectionId = bidSectionId;
	}
	$.ajax({
		type: "post",
		url: postUrl,
		async: false,
		data:postData,
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return
			}
			if (!data.data) {
				return;
			};
			var arr = data.data;
			changeCount = arr.changeCount;//变更次数
			if(changeCount == 0){//正常
				$('.change').hide();
				$('.fileWrap').show();
			}else{//变更
				$('.change').show();
				if(arr.isChange == 1){
					$("[name='isChange']").prop("checked", "checked");
					$(".fileWrap").show();
				} else {
					$(".fileWrap").hide();
				}
				if(arr.isReplenish == 1){
					$("[name='isReplenish']").prop("checked", "checked");
					$(".timeWrap").show();
				} else {
					$(".timeWrap").hide();
				}
			}
			isThrough = (arr.pretrialDocClarifyState == 2 ? '1' : '0');
			if(arr.docClarifyItems.length > 0){
				for(var i = 0;i<arr.docClarifyItems.length;i++){
					if(arr.docClarifyItems[i].fileType == 'ZW'){
						$('#btnPreview').show();
						zbwjPdf = arr.docClarifyItems[i].fileUrl;
					}
				}
			};
			if(arr.id){
				bidSectionId = arr.bidSectionId;
				fileId = arr.id;
				 //链接来源  0:查看  1审核 2.可以查看评审项
				if(source == 1) {
			 		$("#btnClose").hide();
			 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
			 			type:"zgyswjsp", 
			 			businessId:fileId, 
			 			status:2,
			 			submitSuccess:function(){
				         	var index = parent.layer.getFrameIndex(window.name); 
							parent.layer.closeAll(); 
							parent.layer.alert("审核成功",{icon:7,title:'提示'});
							parent.$("#projectList").bootstrapTable("refresh");
			 			}
			 		});
			 	} else{
			 		$("#btnClose").show();
			 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
			 			type:"zgyswjsp", 
			 			businessId:fileId, 
			 			status:3,
			 			checkState:isThrough
			 		});
			 	}
			 	changeHistory();
		 	}
			for(var key in arr){
				if(key == "projectAttachmentFiles"){
					var fileArr = {file1:[], file3:[]};
					if(!bidUploads){
						bidUploads = new StreamUpload("#bidFile",{
							basePath:"/"+employeeInfo.enterpriseId+"/"+fileId+"/204",
							businessId: fileId,
							status:2,
							businessTableName:'T_PRETRIAL_DOC_CLARIFY',  //立项批复文件（项目审批核准文件）    项目表附件
							attachmentSetCode:'QUALIFICATION_DOC',
							browseFileId:'btnBid',
							extFilters:[".zbwj"],
							
						});
					}
					for(var i = 0; i < arr[key].length; i++){
						if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC"){
							if(fileArr.file1.length == 0){
								fileArr.file1.push(arr[key][i]);
							}
						} else if(arr[key][i].attachmentSetCode == "QUALIFICATION_DOC_ATTACHS"){
							arr[key][i]['type'] = '其他文件';
							fileArr.file3.push(arr[key][i]);
						}
					}
				} else if(key == "marginPayType"){
					continue;
				} else {
					$("#"+key).html(arr[key]);
				}
			}
			$.ajax({
				type:"post",
				url:bidInfoUrl,
				async:false,
				data:{
					'id': bidSectionId
				},
				success: function(data){
					if(data.success){
						bidOpenType = data.data.pretrialOpenType;
					}else{
						parent.layer.alert('温馨提示：'+data.message)
					}
				}
			});
			/**********************    资格预审文件附件及资格预审文件pdf       ***********************/
			if(source == '2' || source == '1'){
				/*审核时查询标段信息，获取开标方式来判断资格预审文件格式，线下开标的为word形式*/
				
				if(bidOpenType == '1'){	
					var arry = fileArr.file1[0].attachmentFileName.split('.');
					var arry1 = fileArr.file1[0].attachmentFileName.split('.');
					arry[arry.length-1] = "PDF";
					arry1[arry1.length-1] = "zip";
					fileArr.file1[0]['fileName'] = arry.join('.');
					fileArr.file1[0]['name'] = arry1.join('.');
					if(fileArr.file1[0].attachmentSize){
						fileArr.file1[0]['fileSize'] = fileArr.file1[0].attachmentSize;
					}
					var fjList = arr.docClarifyItems;
					for(var i = 0;i<fjList.length;i++){
						if(fjList[i].fileType == 'ZW'){
							fileArr.file1[0].fileUrl = fjList[i].fileUrl;
							fileArr.file1[0]['type'] = '资格预审文件';
						}else if(fjList[i].fileType == 'FJ'){
							fjList[i]['type'] = '附件';
							fjList[i]['createDate'] = fileArr.file1[0].createDate;
							fjList[i]['createEmployeeName'] = fileArr.file1[0].createEmployeeName;
							fileArr.file1.push(fjList[i]);
						}
					}
					fileArr.file4 = fileArr.file1.concat(fileArr.file3)
	//				console.log(fileArr.file1)
					$('#bidFile').html('');
					var fileTable ='<table   class="table table-bordered ">'
					+'<thead>'
						+'<tr>'
							+'<th style="width: 50px;text-align: center;">序号</th>'
							+'<th>文件名称</th>'
							+'<th style="width: 100px;text-align: center;">文件大小</th>'
							+'<th style="width: 100px;text-align: center;">上传者</th>'
							+'<th style="width: 150px;text-align: center;">上传时间</th>'
							+'<th style="width: 100px;text-align: center;">类型</th>'
							+'<th style="width: 250px;">操作</th>'
						+'</tr>'
					+'</thead>'
					+'<tbody>';
					var fileList = fileArr.file4;
					for(var m = 0;m< fileList.length;m++){
						var fileName = fileList[m].fileName?fileList[m].fileName:fileList[m].attachmentFileName;
						var postfix = fileName.split('.');
						postfix = postfix[postfix.length-1]
						fileTable += '<tr>';
							fileTable += '<td style="width: 50px;text-align: center;">'+(m+1)+'</td>';
							fileTable += '<td>'+fileName+'</td>';
							fileTable += '<td style="width: 100px;text-align: center;">'+(fileList[m].fileSize?fileSize(fileList[m].fileSize):fileList[m].attachmentSize?fileSize(fileList[m].attachmentSize):"")+'</td>';
							fileTable += '<td style="width: 100px;text-align: center;">'+fileList[m].createEmployeeName+'</td>';
							fileTable += '<td style="width: 150px;text-align: center;">'+fileList[m].createDate+'</td>';
							fileTable += '<td style="width: 100px;text-align: center;">'+(fileList[m].type?fileList[m].type:'')+'</td>';
							fileTable += '<td style="width: 250px;">';
								if(postfix == 'pdf' || postfix == 'PDF' || postfix == 'jpg' || postfix == 'JPG' || postfix == 'png' || postfix == 'PNG'){
									fileTable += '<button type="button" class="btn btn-primary btn-sm preView" data-url="'+(fileList[m].fileUrl?fileList[m].fileUrl:fileList[m].url)+'" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-eye-open"></span>预览</button>';
								}
								
								fileTable += '<button type="button" class="btn btn-primary btn-sm btnLoad" data-url="'+(fileList[m].fileUrl?fileList[m].fileUrl:fileList[m].url)+'" data-name="'+fileName+'" style="margin-right:5px;cursor:pointer;text-decoration:none"><span class="glyphicon glyphicon-download"></span>下载</button>';
								if(m == 0){
									fileTable += '<button type="button" class="btn btn-primary btn-sm btnLoad" data-url="'+fileList[m].url+'" data-name="'+fileList[m].name+'" style="margin-right:5px;cursor:pointer;text-decoration:none">下载预审文件</button>';
								}
							fileTable += '</td>';
						fileTable += '</tr>'
					}
					fileTable += '</tbody></table>';
					$(fileTable).appendTo('#bidFile');
				}else{
					fileArr.file4 = fileArr.file1.concat(fileArr.file3);
					if(!bidUploads){
						bidUploads = new StreamUpload("#bidFile",{
							basePath:"/"+employeeInfo.enterpriseId+"/"+fileId+"/204",
							businessId: fileId,
							status:2,
							businessTableName:'T_PRETRIAL_DOC_CLARIFY',  //立项批复文件（项目审批核准文件）    项目表附件
							attachmentSetCode:'QUALIFICATION_DOC',
							browseFileId:'btnBid',
	//							extFilters:[".zbwj"],
						});
					}
					bidUploads.fileHtml(fileArr.file4);
				}
			}else{
				fileArr.file4 = fileArr.file1.concat(fileArr.file3);
				bidUploads.fileHtml(fileArr.file4);
			}
			//显示评审项  线上递交的文件：  正常文件  审核或可以查看评审项的页面（已办）  变更文件  文件变更
			if(bidOpenType == 1 && (source == 1 || source == 2) && (changeCount == 0 || arr.isChange == 1) ){
				$(".reviewShow").show();
				findBidCheckList();
			}else{
				$(".reviewShow").hide();
			}
			
			if(arr && arr.marginPayType!=undefined && arr.marginPayType!=''){				
				var marginPayTypeData=[];
				marginPayTypeData=arr.marginPayType.split(','); 
				for(var i = 0; i < marginPayTypeData.length; i++){
					$("[name='marginPayType']:eq("+marginPayTypeData[i]+")").attr('checked',true);
				}
				$("input[name='marginPayType']").attr("disabled",true);
			}
			typeCode = arr.tenderProjectType ? arr.tenderProjectType.substring(0,1) : "";
			isPay = arr.isPay ? arr.isPay : "";
			if(typeCode == "A"){
				if(isPay == 0){
					$(".drawShow").hide();
				} else {
					$(".drawShow").show();
				}
			} else {
				$(".drawShow").hide();
			}
			bidSectionId = arr.bidSectionId;
		}
	});
}
/**
 * 获取评审项
 * id 招标文件当前id
 */
function findBidCheckList(){
	$.ajax({
		type: "post",
		url: findBidCheckListUrl,
		async: false,
		data:{
			bidSectionId:bidSectionId,
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			reviewData = data.data;
			bidCheckHtml(data.data);
		}
	});
}
/**
 * 评审项列表
 * @param {Object} data  评审项数据
 */
function bidCheckHtml(data){
	$("#reviewTabs li").remove();
	var reviewHtml = "", node="";
	var cId = "", cType = "";
	for(var i = 0; i < data.length; i++){
		node = data[i];
		if(i == 0){
			reviewHtml += '<li class="active"><a href="#" data-index="'+i+'">'+node.checkName+'</a></li>';
		} else {
			reviewHtml += '<li><a href="#" data-index="'+i+'">'+node.checkName+'</a></li>';
		}
		
	}
	$(reviewHtml).appendTo("#reviewDetailTabs");
	if(data.length > 0){
		reviewItem(0);
	}
//	$("#reviewTabs a[data-id='"+checkId+"']").tab("show");
}
function reviewItem(index){
	$("#reviewTab tr").remove();
	var html = '<tr><th style="width: 50px;text-align:center">序号</th><th style="min-width:120px;">评分因素</th><th>评分标准</th>';
	if(reviewData[index] && reviewData[index].checkType && reviewData[index].checkType == 3){
		html += '<th style="width:120px;text-align:center">分值</th>';
		html += '<th style="width:120px;text-align:center">打分类型</th>';
	} else {
		html += '<th style="width:120px;text-align:center">是否重要指标</th>';
	}
	html += '<th>分值备注</th></tr>';
	
	var data = reviewData[index].bidCheckItems;
	for(var i = 0; i < data.length; i++){
		html += '<tr>\
					<td style="text-align:center">'+(i+1)+'</td>\
					<td>'+data[i].checkName+'</td>\
					<td>'+(data[i].checkStandard ? data[i].checkStandard : "")+'</td>';
		if(reviewData[index].checkType == 3){
			html += '<td style="text-align:center">'+(data[i].score ? data[i].score : "")+'</td>';
			var itemScoreType = '';
			if(data[i].itemScoreType=='1'){
				itemScoreType = '主观分';
			}else if(data[i].itemScoreType=='2'){
				itemScoreType = '客观分';
			}
			html += '<td style="text-align:center;">'+itemScoreType+'</td>';
		} else {
			html += '<td style="text-align:center">'+(data[i].isKey == 1 ? "重要指标" : "一般指标")+'</td>';
		}
		html += '<td>'+(data[i].remark ? data[i].remark : "")+'</td></tr>';
	}
	$(html).appendTo("#reviewTab");
}
//变更历史
function changeHistory(){
	$.ajax({
		type: "post",
		url: historyUrl,
		async: false,
		data:{
			id:fileId
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.msg);
				return;
			}
			if(data.data && data.data.length > 0){
				$('.historyWrap').show();
				var arr = data.data;
				historyArr = data.data;
				historyHtml(arr);
			}else{
				$('.historyWrap').hide();
			}
			
		}
	});
}

function historyHtml(data){
	hisData = data;
	
	var html = '<div class="table-responsive"><table class="table table-bordered"><tr><td style="width:50px;text-align:center;">序号</td><td>变更标题</td><td style="width:150px;text-align:center;">变更类型</td><td style="width:200px;text-align:center;">变更时间</td><td style="width:100px">操作</td></tr>';
	for(var i = 0; i < data.length; i++){
		//变更类型
		var changeType = '';
		if(data[i].isChange == 1){
			changeType += "资格预审文件变更"; 
		}
		if(data[i].isReplenish == 1){
			changeType += " 时间变更"; 
		}
		html += '<tr>\
					<td style="text-align:center;">'+(i+1)+'</td>\
					<td>'+(data[i].docName?data[i].docName:(data[i].changeCount==0?'首次':''))+'</td>\
					<td style="width:50px;text-align:center;">'+changeType+'</td>\
					<td style="text-align:center;">'+(data[i].createTime ? data[i].createTime : "") +'</td>\
					<td><button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + i + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>\
				</tr>';
	}
	html += '</table></div>';
	if(data.length > 0){
		$(html).appendTo("#changeHis");
	}
}
/*
 * 打开查看窗口
 * index是当前所要查看的索引值，
 */
function openView(index) {
	var rowData = historyArr[index]; 
	rowData.hasHis = '0';
	parent.layer.open({
		type: 2,
		title: "查看资格预审文件历史",
		area: ['1000px','600px'],
		resize: false,
		content: pageView + "?id=" + rowData.id + "&isThrough=" + (rowData.pretrialDocClarifyState == 2 ? 1 : 0)+"&changeCount="+rowData.changeCount, //标段主键id
		success: function(layero, idx) {
			var iframeWin = layero.find('iframe')[0].contentWindow;	
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}
/******************         计算文件大小         *************************/
function fileSize(size){
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
//预览
$('#bidFile').on('click','.preView',function(){
	var filePath = $(this).attr('data-url');
	previewPdf(filePath)
})
//下载
$('#bidFile').on('click','.btnLoad',function(){
	var filePath = $(this).attr('data-url');
	var fileName = $(this).attr('data-name');
	var newUrl =fileDownloadUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
})