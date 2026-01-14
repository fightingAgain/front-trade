/**
*  zhouyan 
*  2019-6-2
*  编辑、添加异议
*  方法列表及功能描述
*/
var bidHtml = 'Bidding/ObjectionManage/Bidder/model/bidList.html';//选择标段

var saveUrl = config.tenderHost + '/ObjectionAnswersController/saveObjection.do';//保存
var detailUrl = config.tenderHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口
var backUrl = config.tenderHost + '/ObjectionAnswersController/revocation.do';//申请撤回

var egisterInfo = entryInfo();
var dataId = '';//数据id
var bidId = '';//标段id
var fileUploads = null;
$(function(){
	// 下拉字典
	initSelect('.select');
	if(!$.getUrlParam('dataId')){
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
	});
	//选择异议类型
	$('#objectionType').change(function(){
		bidId = '';//标段id
		$('#bidSectionId').val('');
		$('#bidSectionName').val('');
	})
	//根据异议类型选择标段
	$('#chooseBid').click(function(){
		var type = $('#objectionType').val();
//		console.log(type);
		if(type == ''){
			parent.layer.alert('请选择异议阶段！',{icon:7,title:'提示'})
		}else{
			choose(type)
		}
	});
	//保存
	$('#btnSave').click(function(){
		save(false,true)
	});
	//提交
	$('#btnSubmit').click(function(){
		if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
			if($.trim($('[name=linkMen]').val()) != '' && $.trim($('[name=linkMen]').val()).length > 10){
				parent.layer.alert('请正确输入联系人！');
				return
			}
			save(true)
		}
	});
	
	
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(){
		var obj = $(this);
		if(dataId == ''){
			save(false,false,function(businessId){
				dataId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
						businessId: dataId,
						status:1,
						businessTableName:'T_OBJECTION_ANSWERS',
						attachmentSetCode:'OBJECTION_FILE'
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+egisterInfo.enterpriseId+"/"+bidId+"/"+dataId+"/219",
					businessId: dataId,
					status:1,
					businessTableName:'T_OBJECTION_ANSWERS',
					attachmentSetCode:'OBJECTION_FILE'
				});
			}
			$('#fileLoad').trigger('click');
		}
		
			
	});
})
function choose(type){
	parent.layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.getBid(type,formFather);
		}
	});
}
function formFather(data){
	bidId = data.bidSectionId;
	for(var key in data){
		$('#'+key).val(data[key])
	}
//	console.log(data)
}
/*
 * isSubmit：1 提交 
 * isTips: 保存时是否需要提示信息
 */
function save(isSubmit,isTips,callback){
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	if(isSubmit){
		arr.isSubmit = 1;
	};
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		success: function(data){
			if(data.success){
				dataId = data.data;
				$('#dataId').val(dataId);
				if(!isSubmit){
					if(isTips){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'})
					}
				}else{
					parent.layer.alert('提交成功！',{icon:6,title:'提示'})
					parent.layer.closeAll();
				}
				parent.$('#tableList').bootstrapTable('refresh');
				if(callback){
					callback(dataId)
				}
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
//信息反显
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
						attachmentSetCode:'OBJECTION_FILE'
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