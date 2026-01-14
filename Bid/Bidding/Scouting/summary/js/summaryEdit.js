
var saveUrl =  config.tenderHost+'/ReconnaissanceSiteController/saveAndUpdateSummary.do';//保存接口
var detailUrl = config.tenderHost+'/ReconnaissanceSiteController/getReconnaissanceSummaryByBidId.do';//编辑时获取详情接口
//var noticeUrl = config.tenderHost + '/ReconnaissanceSiteController/getAndFile.do';//新增时查询信息接口
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var sumId = '';//数据id
var bidId = '';//标段id
var fileUploads = null; //上传文件
var fileData = [];//文件信息
var loginInfo = entryInfo();//登录人信息
$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
 	$('#noticeStartTime').click(function(){
 		if($('#noticeEndTime').val() == ''){
 			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm'
			})
 		}else{
 			WdatePicker({
				el:this,
				dateFmt:'yyyy-MM-dd HH:mm',
				maxDate:'#F{$dp.$D(\'noticeEndTime\')}'
			})
 		}
		
 	});
 	//结束时间
 	$('#noticeEndTime').click(function(){
 		if($('#noticeStartTime').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'noticeStartTime\')}'
			})
 		}
 		
 	});
    
	
	
})
function passMessage(data,callback){
	var bidData = {}
	for(var key in data){
		bidData[key] = data[key];
	}
	/*for(var key in bidData){
		$('#'+key).html(bidData[key]);
	}*/
	if(data.getForm && data.getForm == 'KZT'){
		bidId = bidData.id;
	}else{
		bidId = bidData.bidSectionId;
	}
	getBidInfo(bidId);
	getDetail(bidId);
	//保存
	$('#btnSave').click(function(){
		save(false,true,callback);
	})
	
	//发送
	$('#btnSubmit').click(function(){
		var  noticeSendTime = Date.parse(new Date($('#noticeStartTime').val().replace(/\-/g,"/")));		//公告发布时间
		var  noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g,"/")));		//公告截止时间
		if(noticeEndTime <= noticeSendTime){
			parent.layer.alert('会议结束时间应在会议开始时间之后！',{icon:7,title:'提示'},function(ind){
					parent.layer.close(ind);
					$('#collapseOne').collapse('show');
				});
			return
		}
		if(checkForm($("#formEle"))){//必填验证，在公共文件unit中
			if($.trim($('#linkMen').val()).length > 10){
				parent.layer.alert('请正确输入联系人！');
				return
			}else if(fileData.length == 0){
				parent.layer.alert('请上传踏勘纪要附件',{icon:7,title:'提示'},function(ind){
					parent.layer.close(ind);
					$('#collapseTwo').collapse('show');
				});
				return
			}else{
				if($("#addChecker").length <= 0) {
					parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
						title: '提交审核',
						btn: [' 是 ', ' 否 '],
						yes: function(layero, index) {
							save(true,false,callback);
						},
						btn2:function(index, layero) {
							parent.layer.close(index);
						}
					})
				} else {
					parent.layer.alert('确认提交？',{icon:3,title:'询问'},function(index){
				    	save(true,false,callback);
				    })
				}
				
			}
		}
	});
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(){
		if(!(sumId != ""&&sumId != null)){
			save(false,false,callback,function(businessId){
				sumId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+sumId+"/606",
						businessId: sumId,
						status:1,
						businessTableName:'T_RECONNAISSANCE_SUMMARY',  
						attachmentSetCode:'SCOUT_SUMMARY',
						changeFile:function(data){
							//有文件操作是，返回方法，data为文件列表
							fileData = data
						}
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
		//上传文件
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+sumId+"/606",
					businessId: sumId,
					status:1,
					businessTableName:'T_RECONNAISSANCE_SUMMARY',  
					attachmentSetCode:'SCOUT_SUMMARY',
					changeFile:function(data){
						//有文件操作是，返回方法，data为文件列表
						fileData = data
					}
					
				});
			}
			$('#fileLoad').trigger('click');
		}
	});
//	if(bidData.id){
//		sumId = bidData.id;
//		getDetail(sumId);
//	}else{
//		getInfo(bidData.noticeId)
//	}
//	bidId = bidData.bidSectionId;
}
/*
 * state true: 提交 false ：保存
 * isTip: 保存时是否需要提示 
 */
function save(state,isTip,back,callback){
	var arr = parent.serializeArrayToJson($('#formEle').serializeArray());
	if(state){
		arr.noticeState = 1;
	}else{
		arr.noticeState = 0;
	}
	if(sumId && sumId != ''){
		arr.id = sumId;
	}
	
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		success: function(data){
			if(data.success){
				sumId = data.data;
				if(callback){
					callback(data.data)
				}
				if(back){
					back()
				}
				if(state){
					
					top.layer.alert('提交成功！',{icon:6,title:'提示'});
					var index=parent.layer.getFrameIndex(window.name);
        			parent.layer.close(index);
				}else{
					if(isTip){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'},function(ind){
							parent.layer.close(ind)
						})
					}
				}
			}else{
				parent.layer.alert(data.message,{icon:5,title:'提示'})
			}
			parent.$('#tableList').bootstrapTable('refresh');
		}
	});
}

//修改时获取详情
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				if(arr.id){
					sumId = arr.id;
				}
				
				for(var key in arr){
					$('#'+key).val(arr[key]);
				}
				//文件回显
				if(arr.projectAttachmentFiles){
					var projectAttachmentFiles = arr.projectAttachmentFiles;
	//				fileHtml(dataSource.projectAttachmentFiles);
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+sumId+"/606",
							businessId: sumId,
							status:1,
							businessTableName:'T_RECONNAISSANCE_SUMMARY',  
							attachmentSetCode:'SCOUT_SUMMARY',
							changeFile:function(data){
								//有文件操作是，返回方法，data为文件列表
								fileData = data
							}
							
						});
					}
					fileData = projectAttachmentFiles;
					fileUploads.fileHtml(projectAttachmentFiles);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}

//新增时获取详情
/*function getInfo(id){
	$.ajax({
		type:"post",
		url:noticeUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				var arr = data.data;
				for(var key in arr){
					$('#'+key).val(arr[key]);
				}
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}*/
/*****************     根据标段id获取标段相关信息        *************************/
function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				for(var key in data.data){
					$('#'+key).html(data.data[key]);
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}
