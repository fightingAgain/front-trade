/**
*  zhouyan 
*  2019-6-2
*  编辑、添加异议
*  方法列表及功能描述
*/
var saveUrl = config.OpenBidHost + '/ObjectionAnswersController/saveObjection.do';//保存
var detailUrl = config.OpenBidHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
var backUrl = config.OpenBidHost + '/ObjectionAnswersController/revocation.do';//申请撤回

var egisterInfo = entryInfo();
var dataId = '';//数据id
var bidId = $.getUrlParam('bidSectionId');//标段id
var fileUploads = null;
var CAcf = null;

var listTable;
$(function(){
	if(!$.getUrlParam('dataId')){
		$('#bidSectionId').val(bidId);
		$('#linkMan').val(egisterInfo.userName);
		$('#linkMobile').val(egisterInfo.tel);
	}else{
		dataId = $.getUrlParam('dataId');
		$('#dataId').val(dataId);
		getDetail(dataId);
		$('#chooseBid').css({'display':'none'})
	}
	
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
        listTable();
	});

	//保存
	$('#btnSave').click(function(){
		save(false,true)
	});
	
	//提交
	$('#btnSubmit').click(function(){
		if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
			save(true)
		}
	});
	
	
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(event){
		event.stopPropagation();
//		var obj = $(this);
		if(!(dataId != ""&&dataId != null)){
			save(0,false,function(businessId){
				dataId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
						businessId: dataId,
						status:1,
						businessTableName:'T_OBJECTION_ANSWERS',
						attachmentSetCode:'OBJECTION_FILE',
						Token:sessionStorage.getItem('token')
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
		//上传文件
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
					businessId: dataId,
					status:1,
					businessTableName:'T_OBJECTION_ANSWERS',
					attachmentSetCode:'OBJECTION_FILE',
					Token:sessionStorage.getItem('token')
				});
			}
			$('#fileLoad').trigger('click');
		}
	});
	
})

//其他页面调用的方法
function passMessage(data){
	listTable = data;
}
	
/*
 * isSubmit：1 提交 
 * isTips: 保存时是否需要提示信息
 */
function save(isSubmit,isTips,callback){
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	if(isSubmit){
		arr.isSubmit = 1;
		//ca验证
		if(!CAcf){
			CAcf = new CA({
				target:"#formName",
				confirmCA:function(flag){
					if(!flag){  
						return;
					}
					savePost(isSubmit,isTips,callback,arr);
				}
			});
		}
		CAcf.sign(); 
	}else{
		savePost(isSubmit,isTips,callback,arr);
	}
};

//保存方法
function savePost(isSubmit,isTips,callback,arr){
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				dataId = data.data;
				$('#dataId').val(dataId);
				if(!isSubmit){
					if(isTips){
						top.parent.layer.alert('保存成功！',{icon:6,title:'提示'});
						listTable();
					}
				}else{
					parent.layer.alert('提交成功！',{icon:6,title:'提示'},function(index){
						listTable();
						parent.layer.close(index);
						var index1 = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index1);
					});
				}
				if(callback){
					callback(dataId)
				}
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
}

//信息反显
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				var source = data.data;
				bidId = source.bidSectionId;
				for(var key in source){
					$('#' + key).val(source[key])
				};
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
						businessId: dataId,
						status:1,
						businessTableName:'T_OBJECTION_ANSWERS',
						attachmentSetCode:'OBJECTION_FILE',
						Token:sessionStorage.getItem('token')
					});
				};
				var fileData = []
				if(source.projectAttachmentFiles){
					var files = source.projectAttachmentFiles;
					for(var i = 0;i<files.length;i++){
						if(files[i].attachmentSetCode == 'OBJECTION_FILE'){
							fileData.push(files[i])
						}
					}
					fileUploads.fileHtml(fileData);
				}
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
