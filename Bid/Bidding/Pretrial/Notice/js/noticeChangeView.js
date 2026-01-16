
/**

*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/NoticeController/getAndFile.do";	//查看地址

var historyUrl = config.tenderHost + '/NoticeController/getHistoryList.do';//历史公告列表
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显

var historyView = 'Bidding/Pretrial/Notice/model/noticeChangeView.html';//查看公告历史详情页面
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/preBidView.html";  //查看标段详情页面

var fileUploads = null; //文件上传
var bidId = '';//标段id
var isThrough;
var source = 0; //链接来源  0:查看  1审核
$(function(){
	$('.th_bg').prev().css('width',(Number($('.th_bg').closest('tr').width())-424)/2+"px");//设置第2列与第4列宽度一致
	isThrough = $.getUrlParam("isThrough");
	var id = $.getUrlParam('id');
	var noticeId = $.getUrlParam('noticeId');
	bidId = $.getUrlParam('bidSectionId');//公告列表中带过来的标段Id
	//媒体
	initMedia({
		isDisabled: true
	});
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	
	/*关闭*/
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: id,
			status:2,
			businessTableName:'T_NOTICE',  
			attachmentSetCode:'TENDER_NOTICE'
		});
	}
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefined"){
	 	source = $.getUrlParam("source");
	 	if(source == 1) {
	 		$("#btnClose").hide();
	 		$("#btnPrint").hide();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"yscggg", 
	 			businessId:id, 
	 			status:2,
	 			submitSuccess:function(){
		         	var index = parent.layer.getFrameIndex(window.name); 
					parent.layer.closeAll(); 
					parent.layer.alert("审核成功",{icon:7,title:'提示'});
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
	 		});
	 	} else {
	 		$("#btnClose").show();
	 		$("#btnPrint").show();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"yscggg", 
	 			businessId:id, 
	 			status:3,
	 			checkState:isThrough
	 		});
	 	}
 	}
	//审核
	/*$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:id, 
		status:3,
		type:"zbcggg",
		checkState:isThrough
	});*/
		
	$.ajax({
		type:"post",
		url:viewUrl,
		async:true,
		data: {
			'id':id,
			'bidSectionId':bidId
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			/*标段信息*/
			if(dataSource.bidSections){
				var bid = dataSource.bidSections;
				bidId = dataSource.bidSections[0].id;
				getRoomList(bidId,'1');
				getRelevant(bidId)
				bidderHtml(bid);
			}
			noticeId = dataSource.noticeId;
			//文件回显
			if(dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0){
//				fileHtml(dataSource.projectAttachmentFiles);
				fileUploads.fileHtml(dataSource.projectAttachmentFiles);
			}
			for(var key in dataSource){
				var newEle = $("[name='"+key+"']")
        		if(newEle.prop('type') == 'checkbox'){
        			newEle.val(dataSource[key]?dataSource[key].split(','):[]);
        		}
        		$("#" + key).html(dataSource[key]);
          	}
			// $('#noticeContent').html(dataSource.noticeContent);
			mediaEditor.setValue(dataSource);
			
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
//	bidId = $.getUrlParam('bidSectionId');//公告列表中带过来的标段Id
	
	
	/*
	 * 查看公告历史详情
	 * 
	 * */
	$('body').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-notice-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "历史公告",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function(layero, index){
				
			}
		});
	})
	/*查看标段*/
	$('body').on('click','.btnView',function(){
//		console.log(bidDetail)
		var bidSectionId = $(this).closest('td').attr('data-bid-id');
		console.log(bidSectionId)
		parent.layer.open({
			type: 2,
			area: ['1000px', '600px'],
			title: "标段详情",
			content: bidDetailHtml + "?id="+bidSectionId,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var body = parent.layer.getChildFrame('body',index);
//					iframeWin.bidDetail(bidDetail);
			}
		})
	})
	
	// 标段表格
	function bidderHtml(data){
		$("#bidList tbody").html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			if(data[i].tenderMode == '1'){
				data[i].tenderMode='公开招标'
			}else if(data[i].tenderMode == '1'){
				data[i].tenderMode='邀请招标'
			}
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].bidSectionName+'</td>'
			+'<td style="width: 100px;text-align:center">'+data[i].tenderMode+'</td>'
			+'<td style="width: 100px;" data-bid-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>');
			$("#bidList tbody").append(html);
		}
		
	}
	//全屏查看公告
	$('body').on('click','.fullScreen',function(){
		var content = $('#noticeContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看公告信息'
	        ,area: ['100%', '100%']
	        ,content: fullScreen
	        ,resize: false
	        ,btn: ['关闭']
	        ,success:function(layero,index){
	        	var body = parent.layer.getChildFrame('body', index);
	    	    var iframeWind=layero.find('iframe')[0].contentWindow; 
	    	    body.find('#noticeContent').html(content);
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	            parent.layer.close(index);
	            
	        }
	       
	    });
	})
})
//文件表格
function fileHtml(data){
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
		+'<td style="width:200px;text-align:center">'+data[i].createDate+'</td>'		//附件上传时间
		+'<td style="width:200px;text-align:center">'+data[i].createEmployeeName+'</td>'		//附件上传人
		+'<td style="width:150px;text-align:center">'+data[i].attachmentSize+'</td>'		//文件大小
		+'</tr>');
		$("#fileList tbody").append(html);
	}
};
//获取项目、招标项目、标段相关信息
function getRelevant(id){
	$.ajax({
		type:"post",
		url:haveInfoUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				for(var key in arr){
					if(key == 'signUp'){
						//报名时显示报名开始结束时间
						if(arr.signUp == 0){//不报名时不显示
							$('.signUp').css({'display':'none'});
						}else if(arr.signUp == 1){	
							$('.signUp').css({'display':'table-row'});
						}
					}
					if(key == "tenderProjectType"){
	         			$("#tenderProjectTypeTxt").dataLinkage({
							optionName:"TENDER_PROJECT_TYPE",
							optionValue:arr[key],
							status:2,
							viewCallback:function(name){
								$("#tenderProjectTypeTxt").html(name)
							}
						});
					}else{
						if(key == "bidType"){	//1为明标，2为暗标
							if(arr.bidType == '1'){
			     				arr.bidType = '是'
			     			}else if(arr.bidType == '2'){
			     				arr.bidType = '否'
			     			}
						}else if(key == "syndicatedFlag"){	//1为是，2为否
							if(arr.syndicatedFlag == '1'){
			     				arr.syndicatedFlag = '允许'
			     			}else if(arr.syndicatedFlag == '0'){
			     				arr.syndicatedFlag = '不允许'
			     			}
						}else if(key == "signUpType"){	//报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1'){
			     				arr.signUpType = '线上获取'
			     			}else if(arr.signUpType == '2'){
			     				arr.signUpType = '线下获取'
			     			}
						}else if(key == "pretrialOpenType"){	//1为线上开标，2为线下开标
							if(arr.pretrialOpenType == '1'){
			     				arr.pretrialOpenType = '线上开启'
			     			}else if(arr.pretrialOpenType == '2'){
			     				arr.pretrialOpenType = '线下开启'
			     			}
						}else if(key == "bidCheckType"){	//1线，2为线下
							if(arr.bidCheckType == '1'){
			     				arr.bidCheckType = '线上评审'
			     			}else if(arr.bidCheckType == '2'){
			     				arr.bidCheckType = '线下评审'
			     			}
						}else if(key == "examType"){	//1为资格预审，2为资格后审
							if(arr.examType == '1'){
			     				arr.examType = '资格预审'
			     			}else if(arr.examType == '2'){
			     				arr.examType = '资格后审'
			     			}
						}else if(key == "tenderMode"){	//1为资格预审，2为资格后审
							if(arr.tenderMode == '1'){
			     				arr.tenderMode = '公开招标'
			     			}else if(arr.tenderMode == '2'){
			     				arr.tenderMode = '邀请招标'
			     			}
						}
						else if(key == "priceUnit"){	//1为资格预审，2为资格后审
							if(arr.priceUnit == '1'){
			     				arr.priceUnit = '万元'
			     			}else if(arr.priceUnit == '0'){
			     				arr.priceUnit = '元'
			     			}
						}else if(key == 'projectCosts'){
							if(arr.projectCosts.length == 0){
								$('.price').html('无');
							}else{
								if( arr.projectCosts[0].costName == '招标文件费'){
									$('.price').html(arr.projectCosts[0].payMoney);
								}
							}
						}
						$('#'+key).html(arr[key]);
						optionValueView("#"+key,arr[key]);//下拉框信息反显
					}
					
				}
			}
		}
	});
};
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("noticeContent").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}

