/*

*  编辑中标合同
*  方法列表及功能描述
 */
var saveUrl = config.tenderHost + '/BidderContractController/saveAndUpdate.do';//保存
var detailUrl = config.tenderHost + '/BidderContractController/getAndFile.do';//编辑时信息回显
var winnerUrl = config.tenderHost + '/BidderContractController/findCheckInfo.do';//招标人与中标人信息

var contractId = '';//合同id
var bidId = '';//标段id
var fileUploads = null; //上传文件
var fileArr = [];
var loginInfo = entryInfo();//登录人信息
$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(){
		if(!(contractId != ""&&contractId != null)){
			save(false,false,function(businessId){
				contractId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+contractId+"/604",
						businessId: contractId,
						status:1,
						businessTableName:'T_BIDDER_CONTRACT',  
						attachmentSetCode:'CONTRACT_KEEP',
						changeFile:function(data){
							//有文件操作是，返回方法，data为文件列表
							fileArr = data;
						},
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+contractId+"/604",
					businessId: contractId,
					status:1,
					businessTableName:'T_BIDDER_CONTRACT',  
					attachmentSetCode:'CONTRACT_KEEP',
					changeFile:function(data){
						//有文件操作是，返回方法，data为文件列表
						fileArr = data;
					},
				});
			}
			$('#fileLoad').trigger('click');
		}
	
	});
	//保存
	$('#btnSave').click(function(){
		save(false,true);
	});
	//提交
	$('#btnSubmit').click(function(){
		if(checkForm($("#formEle"))){
			if(fileArr.length == 0){
				parent.layer.alert('请上传中标合同！',{icon:7,title:'提示'})
			}else{
				var  contractSignTime = Date.parse(new Date($('#contractSignTime').val().replace(/\-/g,"/")));		//合同签署日期
				var  limitStartTime = Date.parse(new Date($('#limitStartTime').val().replace(/\-/g,"/")));		//开始时间
				var  limitEndTime = Date.parse(new Date($('#limitEndTime').val().replace(/\-/g,"/")));		//结束时间
				if(contractSignTime > limitStartTime){
					parent.layer.alert('合同开始时间应在合同签署日期之后！');
					return
				}else if(limitStartTime > limitEndTime){
					parent.layer.alert('合同结束时间应在合同开始时间之后！');
					return
				}
				save(true);
			}
		}
	});
	//合同签署日期
	$('#contractSignTime').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm'
		})
 	});
	
	//开始时间
 	$('#limitStartTime').click(function(){
 		if($('#limitEndTime').val() == ''){
 			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm'
			})
 		}else{
 			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm',
				maxDate:'#F{$dp.$D(\'limitEndTime\')}'
			})
 		}
		
 	});
 	//结束时间
 	$('#limitEndTime').click(function(){
 		if($('#limitStartTime').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'limitStartTime\')}'
			})
 		}
 		
 	});
})
function passMessage(data){
	bidId = data.bidSectionId;
	for(var key in data){
		$('#'+key).val(data[key])
	}
	if(data.id){
		getDetail(data.id)
	}else{
		getWin(bidId)
	}
}
/*保存
 * isSub: true提交 false保存
 * isTip: 保存成功时是否需要提示
 * callback: 回调
 */
function save(isSub,isTip,callback){
	var arr = parent.serializeArrayToJson($('#formEle').serializeArray());
	if(contractId && contractId != ''){
		arr.id = contractId;
	}
	if(isSub){
		arr.contractState = 1;
	}else{
		arr.contractState = 0;
	}
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: arr,
		success: function(data){
			if(data.success){
				contractId = data.data;
				if(isSub){
					parent.layer.alert('提交成功！',{icon:6,title:'提示'});
					var index=parent.layer.getFrameIndex(window.name);
       				parent.layer.close(index);
				}else{
					if(isTip){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'});
					}
				}
				if(callback){
					callback(data.data);
				}
				parent.$('#tableList').bootstrapTable('refresh');
			}
		}
	});
}
//合同详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				var dataSource = data.data;
				contractId = dataSource.id;
				for(var key in dataSource){
					$('[name='+key+']').val(dataSource[key])
				}
				//合同
				if(dataSource.projectAttachmentFiles){
					var projectAttachmentFiles = dataSource.projectAttachmentFiles;
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+contractId+"/604",
							businessId: id,
							status:1,
							businessTableName:'T_BIDDER_CONTRACT',  
							attachmentSetCode:'CONTRACT_KEEP',
							changeFile:function(data){
								//有文件操作是，返回方法，data为文件列表
								fileArr = data;
							},
						});
					}
					fileUploads.fileHtml(projectAttachmentFiles);
					fileArr = projectAttachmentFiles;
				}
			}
		}
	});
}
//新增时获取招标人与中标人信息
function getWin(id){
	$.ajax({
		type:"post",
		url:winnerUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var dataObj = data.data.tenderProject;
				var winData = data.data.bidWinCandidates;
				var winId = [];
				var winName = [];
				var winCode = [];
				for(var key in dataObj){
					$('#'+ key).val(dataObj[key])
				}
				//中标人信息
				for(var i = 0;i<winData.length;i++){
					winId.push(winData[i].winCandidateId);
					winName.push(winData[i].winCandidateName);
					winCode.push(winData[i].winCandidateCode);
				}
				$('#bidderId').val(winId.join(';'));
				$('#bidderName').val(winName.join(';'));
				$('#bidderCode').val(winCode.join(';'));
			}
		}
	});
}
