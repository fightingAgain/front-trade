
/**

*  查看公告
*  方法列表及功能描述
*/

var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var resiveUrl = config.tenderHost + '/BidInviteController/getAndFile.do';//数据回显接口

var historyView = 'Bidding/BidNotice/Notice/model/noticeChangeView.html';//查看公告历史详情页面
var historyUrl = config.tenderHost + '/NoticeController/getHistoryList.do';//历史公告列表
var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var fullScreen = 'Bidding/BidNotice/Notice/model/fullScreenView.html';//全屏查看页面
var bidSectionHtml = '../../BidIssuing/roomOrder/model/bidView.html';//查看标段相关信息
var turnBidSectionHtml = '../../BidIssuing/roomOrder/model/turnBidView.html';//查看标段相关信息

var bidId;
var priceInfoUrl = config.tenderHost + '/BidSectionController/get.do';// 获取判断二次招标相关信息
var getTransformMoneyInfoUrl = config.depositHost + '/ProjectController/lookBidderReturnState.do';	//获取转移保证金相关数据

var bidInviteId = ''
var fileUploads = null; //文件上传
var comeForm = $.getUrlParam("comeForm");
var employeeInfo = entryInfo(); //企业信息
var examType = '';
var RenameData;//投标人更名信息
$(function(){
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'bidInviteIssueContent'
	});
	bidId = $.getUrlParam('bidSectionId'); //公告列表中带过来的标段Id
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){//邀请函id
		bidInviteId = $.getUrlParam('id');
//		console.log(bidInviteId)
		reviseNotice(bidInviteId)
	}
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	if($.getUrlParam('bidInviteHistoryId') && $.getUrlParam('bidInviteHistoryId') != undefined){//原始邀请函id
		bidInviteHistoryId = $.getUrlParam('bidInviteHistoryId');
		
	}
	$("#bulletinDuty").html(entryInfo().userName);
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: bidInviteId,
			status:2
		});
	}
	/* 查看标段信息 */
	if(comeForm == 'SH'){
		$('#interiorBidSectionCode').addClass('relevantBid')
		
	}
	$('body').on('click','.relevantBid',function(){
		var bidHtml = '';
		if(examType == 2){
			bidHtml = bidSectionHtml
		}else{
			bidHtml = turnBidSectionHtml
		}
		var surl = bidHtml + '?id=' + bidId + '&examType=' + examType + '&isAgency=' + employeeInfo.isAgency + '&isBlank=1'
		window.open(surl, "_blank");
	})
	/*  查看标段信息 --end */
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:bidInviteId, 
		status:2,
		type:"yqhsp",
		/* submitSuccess: function(){
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index)
		} */
	});
		
	/*公告历史*/
//	$.ajax({
//		type:"post",
//		url:historyUrl,
//		async:true,
//		data: {
//			'noticeId':bidInviteHistoryId,
//			'id':bidInviteId
//		},
//		dataType: "json",//预期服务器返回的数据类型
//		success: function(data){
//			if(data.success){
//				historyTable(data.data);
//			}
//		},
//		error: function(){
//			parent.layer.alert("数据加载失败！");
//		}
//	});
	/*
	 * 查看公告历史详情
	 * 
	 * */
	$('#tenderNoticeList').on('click','.btnView',function(){
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
	
	// 公告历史表格
	function historyTable(data){
		$("#tenderNoticeList tbody").html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
//			+'<td style="width: 200px;text-align:center">'+data[i].bidSectionCode+'</td>'
			+'<td>'+data[i].noticeName+'</td>'
			+'<td style="width: 100px; text-align: center;">'+(data[i].changeCount+1)+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].subDate+'</td>'
			+'<td style="width: 100px;" data-notice-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>');
			$("#tenderNoticeList tbody").append(html);
		}
		
	}
	//全屏查看公告
	$('.fullScreen').click(function(){
		var content = $('#bidInviteIssueContent').html();
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
}
/*修改时信息回显*/
function reviseNotice(dataId) {
	$.ajax({
		type: "post",
		url: resiveUrl,
		data: {
			'id': dataId
		},
		dataType: 'json',
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}else{
				var dataSource = data.data;
				tenderProjectId = dataSource.tenderProjectId
				//供应商回显
				if(dataSource.bidInviteEnterprises) {
					enterpriseHtml(dataSource.bidInviteEnterprises);
				}
				//文件回显
				if(dataSource.projectAttachmentFiles) {
					projectAttachmentFiles = dataSource.projectAttachmentFiles;
					if(!fileUploads) {
						fileUploads = new StreamUpload("#fileContent", {
							basePath: "/" + entryInfo().enterpriseId + "/" + bidId + "/" + dataId + "/201",
							businessId: dataId,
							status: 1,
							businessTableName: '',
							attachmentSetCode: 'TENDER_NOTICE'
						});
					}
					fileUploads.fileHtml(projectAttachmentFiles);
				}
				for(var key in dataSource) {
					$("#" + key).html(dataSource[key]);
				}
				getRelevant(dataSource.bidSectionId);
				getRoomList(dataSource.bidSectionId, '2');
				bidId = dataSource.bidSectionId;
				getPriceInfo();
				mediaEditor.setValue(dataSource);
			}
			
//			$('#bidId').val(dataSource.bidSections[0].id); //标段Id
//			editor.txt.html(dataSource.bidInviteIssueContent);
			//			fileUpload(bidDetail[0].id,id);

		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});
}

// 获取招标项目相关信息.
function getPriceInfo() {
	$.ajax({
		type: "post",
		url: priceInfoUrl,
		async: false,
		dataType: "json",//预期服务器返回的数据类型
		data: { 'id': bidId },
		success: function (data) {
			if (data.success) {
				var arr = data.data;
				//修改投标保证金递交方式的选择时机（人）  2024-5-31  新版本不再显示保证金转移
				if (arr.bidEctionNum > 1&& arr.depositChannel == 7 ) {
					$("#transformMoney").show();
					getTransformMoneyInfo();
				}
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function () {
			parent.layer.alert("数据获取失败!");
		}
	});
}

function getTransformMoneyInfo() {
	$.ajax({
		type: "get",
		url: getTransformMoneyInfoUrl,
		async: true,
		dataType: "json",//预期服务器返回的数据类型
		data: { 'packageId': bidId },
		success: function (data) {
			if (data.success) {
				var arr = data.data;

				var html = '';
				html += '<thead style="text-align:center"><tr>' +
					'<td><span>投标人</span></td>' +
					'<td><span>保证金递交金额 (元)</span></td>' +
					'<td><span>状态</span></td>' +
					'<td><span>转入时间</span></td>' +
					'<td><span>转入状态</span></td>' +
					'</tr></thead>';

				html += '<tbody style="text-align:center">'
				if (arr.length > 0) {
					// 退还状态: 0 - 未退还 1 - 审核中 2 - 退款成功 3 - 退款失败
					var statusText = {
						'0': '未退还',
						'1': '审核中',
						'2': '退款成功',
						'3': '退款失败',
					}
					for (let i = 0; i < arr.length; i++) {
						// const evar checkText = '<input type="checkbox" value="' + i + '" ';lement = array[i];
						var checkText;
						if (arr[i].transferState == 1) {
							checkText = '<span>转出</span>'
						} else if (arr[i].transferState == 2) {
							checkText = '<span>转入</span>'
						} else if (arr[i].transferState == 0) {
							checkText = '<span>未转移</span>'
						} else {
							checkText = '<span>未转移</span>'
						}

						html += '<tr>';
						html += '<td><span>' + showBidderRenameMark(arr[i].bidderId, arr[i].bidderName, RenameData, 'addNotice') + '<span></td>';
						html += '<td><span>' + arr[i].depositTotalPrice + '<span></td>';
						html += '<td><span>' + statusText[arr[i].bankState] + '<span></td>';
						html += '<td><span>' + (arr[i].transferTime ? arr[i].transferTime : '-') + '<span></td>';
						if (arr[i].bankState == '0' || arr[i].bankState == '3') {
							html += '<td>' + checkText + '</td>';
						} else {
							html += '<td><span>不能转入</span></td>';
						}
						html += '</tr>';
					}

				} else {
					html += '<tr><td colspan="5"><span> 暂无保证金相关数据 </span></td></tr>'
				}

				html += '</tbody>'
				$('#transformMoney-table').html(html);
			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function () {
			parent.layer.alert("保证金相关数据获取失败!");
		}
	});
}

function enterpriseHtml(data) {
//	console.log(data)
	var html = "";
	idList = [];
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
                	<tr data-id="' + data.id + '">\
                		<th style="width:50px;text-align:center;">序号</th>\
                		<th>企业名称</th>\
                		<th style="width: 300px;text-align:center;">企业编码</th>\
                		<th style="width: 180px;text-align:center;">联系人</th>\
                		<th style="width: 180px;text-align:center;">联系方式</th>\
                		<th style="width: 100px;text-align:center;">回复状态</th>\
                	</tr>';
	}
	for(var i = 0; i < data.length; i++) {
//		idList.push(data[i].id);
		var inviteState = '';
		if(data[i].inviteState == 0){
			inviteState = '未回复'
		}else if(data[i].inviteState == 2){
			inviteState = '<span style="color:green">同意投标</span>'
		}else if(data[i].inviteState == 1){
			inviteState = '<span style="color:red">放弃投标</span>'
		}
		var code = '';
		var person = '';
		var personTel = '';
		if(data[i].enterpriseCode){
			code = data[i].enterpriseCode;
		}else if(!data[i].enterpriseCode && data[i].legalCode){
			code = data[i].legalCode;
		}else if(!data[i].enterpriseCode && !data[i].legalCode){
			code = '';
		}
		if(data[i].enterprisePerson){
			person = data[i].enterprisePerson;
		}else if(!data[i].enterprisePerson && data[i].legalContact){
			person = data[i].legalContact;
		}else if(!data[i].enterprisePerson && !data[i].legalContact){
			person = '';
		}
		if(data[i].enterprisePersonTel){
			personTel = data[i].enterprisePersonTel;
		}else if(!data[i].enterprisePersonTel && data[i].legalContactPhone){
			personTel = data[i].legalContactPhone;
		}else if(!data[i].enterprisePersonTel && !data[i].legalContactPhone){
			personTel = '';
		}
		html += '<tr>\
            		<td style="width:50px;text-align:center;">' + (i+1) + '</td>\
            		<td>' + showBidderRenameMark(data[i].enterpriseId, data[i].enterpriseName, RenameData, 'addNotice') + '<input type="hidden" name="bidInviteEnterprises['+i+'].enterpriseId" value="'+data[i].id+'"/></td>\
            		<td style="width: 300px;text-align:center;">' + code + '</td>\
            		<td style="width: 180px;text-align:center;">' + person + '</td>\
            		<td style="width: 180px;text-align:center;">' + personTel + '</td>\
            		<td style="width: 100px;text-align:center;">'+inviteState+'</td>\
            	</tr>';
	}

	if($("#enterpriseTab").length == 0) {
		html += '</table>';
		$("#biderBlock").html("");
		$(html).appendTo("#biderBlock");
	} else {
		$("#enterpriseTab tr:gt(0)").remove();
		$(html).appendTo("#enterpriseTab");
	}
};



//获取项目、招标项目、标段相关信息
function getRelevant(bidId){
	$.ajax({
		type:"post",
		url:haveInfoUrl,
		async:true,
		data: {
			'id': bidId
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				examType = arr.examType;
				for(var key in arr){
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
						}else if(key == "deliverFileType"){	//投标文件递交方式	1.线上递交    2.线下递交
							if(arr.deliverFileType == '1'){
			     				arr.deliverFileType = '线上递交'
			     			}else if(arr.deliverFileType == '2'){
			     				arr.deliverFileType = '线下递交'
			     			}
						}else if(key == "bidOpenType"){	//1为线上开标，2为线下开标
							if(arr.bidOpenType == '1'){
			     				arr.bidOpenType = '线上开标'
			     			}else if(arr.bidOpenType == '2'){
			     				arr.bidOpenType = '线下开标'
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
			     			}else if(arr.priceUnit == '2'){
			     				arr.priceUnit = '元'
			     			}
						}else if(key == 'projectCosts'){
							if(arr.projectCosts.length == 0){
								$('.price').html('无');
							}else{
								if( arr.projectCosts[0].costName == '招标文件费'){
									if(arr.projectCosts[0].isPay == 0){
										$('.price').html('无');
									}else if(arr.projectCosts[0].isPay == 1){
										$('.price').html(arr.projectCosts[0].payMoney);
									}
									
								}
							}
						}else if(!arr.projectCosts){
							$('.price').html('无');
						}
						$('#'+key).html(arr[key]);
						optionValueView("#"+key,arr[key]);//下拉框信息反显
						if(!bidInviteId){
							$('#bidInviteTitle').val(arr.bidSectionName +'-邀请函')
						}
						
					}
					
				}
			}
		}
	});
};
