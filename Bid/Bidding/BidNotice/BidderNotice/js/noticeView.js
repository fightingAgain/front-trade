
/**

*  查看公告
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/NoticeController/findNoticeDetails.do";	//查看地址
var historyUrl = config.tenderHost + '/NoticeController/getHistoryList.do';//历史公告列表

var historyView = 'Bidding/BidNotice/BidderNotice/historyView.html';//查看公告历史详情页面
var pageDownList= 'Bidding/BidFile/BidFileGet/model/FileDownloadList.html';//下载列表
var pageLinkEdit ='Bidding/BidFile/BidFileGet/model/DownloadLinkEdit.html';//采集个人信息
var payView= 'Bidding/BidFile/BidFileGet/model/PayFormChoose.html'; //缴费
var urlSignSupplier = config.tenderHost+'/SupplierSignController/findSupplierSignInfo.do';//供应商报名信息记录i--标段查询分页接口
var checkMessageUrl = config.Syshost + '/SupplierServiceChargeController/checkMessage.do';  //供应商缴纳平台服务费验证
var getProjectDetailUrl = config.tenderHost + '/TenderProjectController/findTenderProjectType.do';  //获取招标项目，标段基本信息
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间

var fileUploads = null; //文件上传
//var signState;  //报名状态
var getFileType = '';//报名方式 1 线上  2 线下
var bidSectionId; //标段id
var projectId; //项目id
var bidFileId; //招标文件id
var states;//标段状态 0.编辑  1.生效 2.撤回 3.招标完成 4.流标 5.重新招标 6.终止
var bidData;
var proData;  //招标项目标段基本信息
var docGetEndTime;//购标截止时间
var tenderProjectType;//项目类型
$(function(){
	var id = '';
	var noticeId = '';
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
//	signState = $.getUrlParam('signState');
	states = $.getUrlParam('states');
	getFileType = $.getUrlParam('getFileType');
	bidSectionId = $.getUrlParam('id');
	getTime();
	if($.getUrlParam("bidFileId") && $.getUrlParam("bidFileId") != "undefined" && states == 1){
		bidFileId = $.getUrlParam('bidFileId');
		if(getFileType == 1){
			$(".signState").show();
		}else{
			$(".signState").hide();
		}
	} else {
		$(".signState").hide();
	}
//	if(signState == 1 || bidFileId == "undefined"){
//		$(".signState").hide();
//	} else {
//		$(".signState").show();
//	}
	$("#getFile").click(function(){
		//黑名单验证
		var parm = checkBlackList(entryInfo().enterpriseCode,tenderProjectType,'d');
		if(parm.isCheckBlackList){
			parent.layer.alert(parm.message, {icon: 7,title: '提示'});
			return;
		}
		
		//getOrder();
		proData = getProjectDetail(bidSectionId);
		checkMessage();
	});
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	$.ajax({
		type:"post",
		url:viewUrl,
		async:true,
		data: {
			'bidSectionId':bidSectionId
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		// $('#noticeContent').html(data.data.noticeContent);//公告内容
//      		fileHtml(dataSource.projectAttachmentFiles);//附件
//				fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				var dataSource = data.data;
				mediaEditor.setValue(dataSource);
				id = dataSource.id; //公告id
				getFileType = dataSource.getFileType
				noticeId = dataSource.noticeId; //原公告id
				if($.getUrlParam("bidFileId") && $.getUrlParam("bidFileId") != "undefined" && dataSource.states == 1) {
					bidFileId = $.getUrlParam('bidFileId');
					if(getFileType == 1) {
						$(".signState").show();
					} else {
						$(".signState").hide();
					}
				} else {
					$(".signState").hide();
				}
				/*标段信息*/
				if(dataSource.bidSections){
					var bid = dataSource.bidSections;
//					getRelevant(bid[0].id)
//					bidderHtml(bid);
				}
				//文件回显
				if(dataSource.projectAttachmentFiles && dataSource.projectAttachmentFiles.length > 0){
	//				fileHtml(dataSource.projectAttachmentFiles);
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
				for(var key in dataSource){
	            	$("#" + key).html(dataSource[key]);
	          	}
				$('#endDate').html('购标截止时间：'+docGetEndTime);
				// $('#noticeContent').html(dataSource.noticeContent);
				mediaEditor.setValue(dataSource);
			}
			
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: id,
			status:2
		});
	}
	/*公告历史*/
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'noticeId':noticeId,
			'id':id
			
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			if(data.success){
				historyTable(data.data);
			}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
	/*
	 * 查看公告历史详情
	 * 
	 * */
	$('#tenderNoticeList').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-notice-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "公告信息",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function(layero, index){
				
			}
		});
	})
	
	// 公告历史表格
	function historyTable(data){
		$("#tenderNoticeList tbody").html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
//			+'<td style="width: 200px;text-align:center">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].noticeName+'</td>'
			+'<td style="width: 300px;text-align:center">'+data[i].noticeSendTime+'</td>'
			+'<td style="width: 200px;text-align:center" data-notice-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>');
			$("#tenderNoticeList tbody").append(html);
		}
		
	}
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
			+'</tr>');
			$("#fileList tbody").append(html);
		}
	}
});

/***
 * 获取招标项目，标段信息
 * @param {Object} id  标段id
 */
function getProjectDetail(id){
	var rst;
	$.ajax({
		type:"post",
		url:getProjectDetailUrl,
		async:false,
		data:{bidSectionId: id},
		success:function(data){
			if(!data.success){
				top.layer.alert('温馨提示：' + data.message);
				return;
			}
			rst = data.data;
		}
	});
	return rst;
}

/***
 * 供应商缴纳平台服务费验证 
 */
function checkMessage(){
	$.ajax({
		type: "post",
		url: checkMessageUrl,
		async: false,
		data:{
			packageId:bidSectionId,
			enterpriseId: (entryData ? entryData.enterpriseId : entryInfo().enterpriseId),
			agentEnterpriseId: proData.agencyEnterprisId,
			contractReckonPrice: proData.contractReckonPrice,
			priceUnit: proData.priceUnit
		},
		success: function(res) {
			if(!res.success) {
				parent.layer.alert('温馨提示：' + res.message);
				return;
			}
			var item = res.data;
			if(item.strKey == null){
				getOrder()
			}else{
				top.layer.confirm('温馨提示：购买<strong>招标</strong>文件后，需缴纳平台服务费（<a style="color: #337ab7;"  href="'+ platformFeeNoticeUrl +'" target="_blank">点击这里查看平台服务费收费标准</a>）才能<strong>下载招标文件。确认要购买招标文件吗？</strong>',{title:'提示'},function(index){
					top.layer.close(index)
					getOrder()
				})
			}
		}
	});
}

//验证是否购买平台服务费
function checkService(isCanDownload, callback){
	checkServiceCost({
		projectId:bidData.projectId,
		packId:bidSectionId,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		isCanDownload:isCanDownload,
		paySuccess:function(data, isService){
			if(data){
				if(isService){
					getOrder();
				} else {
					if(callback){
						callback();
					} else {
						getOrder();
					}
				}
			}
		}
	});
}

function getOrder(){
	$.ajax({
         url: urlSignSupplier,//查询存在报名记录
         type: "post",
         data: {packageId:bidSectionId},
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(data.success == true){
         		var getData = data.data;
         		if(getData.hasInfo == 1 ){
         			if(getData.canDownload == 1){
//       				checkService(true, function(){ 
	         				var width = top.$(window).width() * 0.7;
							var height = top.$(window).height() * 0.6;
				    		parent.layer.open({
								type: 2,
								title: "招标文件",
								area: [width + 'px', height + 'px'],
								resize: false,
								content: pageDownList+ "?packageId=" + bidSectionId+ '&bidFileId=' + bidFileId,
								success:function(layero, index){
									var iframeWin = layero.find('iframe')[0].contentWindow;
									iframeWin.passMessage(bidData); 
								}
							});
//						});
         			}else{
         				getGoodsList({enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId, packId:bidSectionId}, function(data){
							if(data.success){
								getOrder();
							}
						});
//       				checkService(false);
//	         			pay(getData.orderId,'table',function(status,orderId){
////	 						if(status == 3){
//	 							getOrder();
////	 						}
//	 					})
	         		}
         		} else if(getData.hasInfo == 2){
         			parent.layer.alert("您当前报名未完成，需要报名完成才能获取招标文件");
         		} else{
					var width = top.$(window).width() * 0.6;
					var height = 400;
					parent.layer.open({
						type: 2,
						title: "下载人信息采集",
						area: [width + 'px', height + 'px'],
						resize: false,
						content: pageLinkEdit + "?packageId=" + bidSectionId+ '&bidFileId=' + bidFileId,
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;
							iframeWin.getMethod(getOrder); 
						}
					});
         		}
         	}
         	
         },
         error: function (data) {
             parent.layer.alert("加载失败",{icon: 3,title: '提示'});
         }
     });
}

function passMessage(data){
	bidData = data;
	getFileType = data.getFileType;
}


/**********************    获取时间相关信息           **********************/
function getTime(){
	$.ajax({
		type:"post",
		url:timeUrl,
		async:false,
		data: {
			'bidSectionId': bidSectionId,
			'examType': 2
		},
		success: function(data){
			if(data.success){
				docGetEndTime = data.data.docGetEndTime;
				tenderProjectType = data.data.tenderProjectType;
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}