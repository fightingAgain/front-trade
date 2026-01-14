
/**
*  zhouyan 
*  2019-2-25
*  公告审核
*  方法列表及功能描述
*/

//var viewUrl = config.tenderHost + "/NoticeController/get.do";	//查看地址
var viewUrl = config.tenderHost + "/NoticeController/getAndFile.do";	//查看地址
var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html";  //查看标段详情页面

var bidId;
var priceInfoUrl = config.tenderHost + '/BidSectionController/get.do';// 获取判断二次招标相关信息
var getTransformMoneyInfoUrl = config.depositHost + '/ProjectController/lookBidderReturnState.do';	//获取转移保证金相关数据

var source = 0; //链接来源 0:查看，1：审核
var bidDetail;//标段详情

var fileUploads = null;
$(function(){
	var id = $.getUrlParam('id');
	source = $.getUrlParam("source");
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
 	if(source == 1) {
 		$("#btnClose").hide();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"zbcggg", 
 			businessId:id, 
 			status:2,
 			/* submitSuccess:function(){
	         	parent.$("#tableList").bootstrapTable("refresh");
	         	var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.close(index); 
 			} */
 		});
 	} else {
 		$("#btnClose").show();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"zbcggg", 
 			businessId:id, 
 			status:3
 		});
 	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	/*查看标段*/
	$('#bidList').on('click','.btnView',function(){
//		console.log(bidDetail)
		parent.layer.open({
			type: 2,
			area: ['1000px', '600px'],
			title: "标段详情",
			content: bidDetailHtml + "?id="+bidDetail[0].id,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				var body = parent.layer.getChildFrame('body',index);
//					iframeWin.bidDetail(bidDetail);
			}
		})
	});
	$.ajax({
		type:"post",
		url:viewUrl,
		async:true,
		data: {
			'id':id
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		for(var key in dataSource){
	            	$("#" + key).html(dataSource[key]);
	          	};
	          	bidDetail = dataSource.bidSections;
	          	getRelevant(bidDetail[0].id);
	          	getRoomList(bidDetail[0].id,'2');//会议室数据
	          	getPriceInfo();
        		// $("#noticeContent").html(dataSource.noticeContent);
				mediaEditor.setValue(dataSource);
        		if(dataSource.projectAttachmentFiles){
        			var fileArr = dataSource.projectAttachmentFiles;
        			if(!fileUploads){
							fileUploads = new StreamUpload("#fileContent",{
								businessId: id,
								status:2
							});
						}
	         			fileUploads.fileHtml(fileArr);
        		}
//      		fileHtml(dataSource.projectAttachmentFiles);//文件
        	}
			
			
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
	// 公告历史表格
	function auditList(data){
		$("#auditList tbody").html('');
		var html='';
		for(var i = 0;i<data.length;i++){
			
			html = $('<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].interiorBidSectionCode+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].bidSectionName+'</td>'
			+'<td style="width: 100px;text-align:center">'+data[i].bidSectionName+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].bidSectionName+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].subDate+'</td>'
			+'<td>'+data[i].subDate+'</td></tr>');
			$("#auditList tbody").append(html);
		}
		
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
				if (arr.bidEctionNum > 1 && arr.depositChannel == 7) {
					$("#transformMoney").show();
					getTransformMoneyInfo();
				}
			} else {
				parent.layer.alert("温馨提示:"+data.Message);
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
						html += '<td><span>' + arr[i].bidderName + '<span></td>';
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
				parent.layer.alert("保证金相关数据获取失败!");
			}
		},
		error: function () {
			parent.layer.alert("保证金相关数据获取失败!");
		}
	});
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
			+'<td style="width: 300px;text-align:center">'+data[i].interiorBidSectionCode+'</td>'
			+'<td>'+data[i].bidSectionName+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].tenderMode+'</td>'
			+'<td style="width: 150px;text-align: center;" data-bid-id="'+data[i].bidSectionId+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>');
			$("#bidList tbody").append(html);
		}
		
	}
});
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
