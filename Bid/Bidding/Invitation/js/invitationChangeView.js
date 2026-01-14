
/**
*  zhouyan 
*  2019-2-25
*  查看公告
*  方法列表及功能描述
*/

var haveInfoUrl = config.tenderHost + '/NoticeController/findAllInfoByBidSectionId.do';//相关信息回显
var viewUrl = config.tenderHost + '/BidInviteController/getAndFile.do';//数据回显接口

var fileDownload = config.FileHost + "/FileController/download.do";	//下载文件
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var fileUploads = null; //文件上传
var id = '';//邀请函id
var RenameData;//投标人更名信息
$(function(){
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'bidInviteIssueContent'
	});
	id = $.getUrlParam('id');
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: id,
			status:2,
		});
	}
	
	$.ajax({
		type: "post",
		url: viewUrl,
		data: {
			'id':id
		},
		dataType: 'json',
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}else{
				var dataSource = data.data;
				tenderProjectId = dataSource.tenderProjectId;
				bidId = dataSource.bidSectionId;
				if(bidId){
					getRelevant(bidId);
					RenameData = getBidderRenameMark(bidId);//投标人更名信息
				}
				//供应商回显
				if(dataSource.bidInviteEnterprises) {
					enterpriseHtml(dataSource.bidInviteEnterprises);
				}
				//文件回显
				if(dataSource.projectAttachmentFiles){
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
				for(var key in dataSource) {
					$("#" + key).html(dataSource[key]);
				}
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
		
	
	//全屏查看公告
	$('.fullScreen').click(function(){
		var content = $('#bidInviteIssueContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看邀请函信息'
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
		html += '<tr>\
            		<td style="width:50px;text-align:center;">' + (i+1) + '</td>\
            		<td>' + showBidderRenameMark(data[i].enterpriseId, data[i].enterpriseName, RenameData, 'addNotice') + '<input type="hidden" name="bidInviteEnterprises['+i+'].enterpriseId" value="'+data[i].id+'"/></td>\
            		<td style="width: 300px;text-align:center;">' + data[i].enterpriseCode + '</td>\
            		<td style="width: 180px;text-align:center;">' + data[i].enterprisePerson + '</td>\
            		<td style="width: 180px;text-align:center;">' + data[i].enterprisePersonTel + '</td>\
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
						if(key == "signUpType"){	//报名方式 1.线上报名 2.线下报名
							if(arr.signUpType == '1'){
			     				arr.signUpType = '线上获取'
			     			}else if(arr.signUpType == '2'){
			     				arr.signUpType = '线下获取'
			     			}
						}else if(key == "deliverFileType"){	//投标文件递交方式	1.线上递交    2.线下递交
							if(arr.deliverFileType == '1'){
			     				arr.deliverFileType = '线上递交'
			     			}else if(arr.signUpType == '2'){
			     				arr.deliverFileType = '线下递交'
			     			}
						}else if(key == "bidOpenType"){	 // 开标方式 1为线上开标，2为线下开标
							if(arr.bidOpenType == '1'){
			     				arr.bidOpenType = '线上开标'
			     			}else if(arr.bidOpenType == '2'){
			     				arr.bidOpenType = '线下开标'
			     			}
						}
						
						/*if(key == "bidType"){	//1为明标，2为暗标
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
						}*/
						$('#'+key).html(arr[key]);
						optionValueView("#"+key,arr[key]);//下拉框信息反显
						if(!id){
							$('#bidInviteTitle').val(arr.bidSectionName +'-邀请函')
						}
						
					}
					
				}
			}
		}
	});
};
