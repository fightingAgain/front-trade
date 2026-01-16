
/**

*  投标人提出澄清问题
*  方法列表及功能描述
*/
var saveUrl = config.tenderHost + '/AskAnswersController/saveAndUpdate.do';//保存
var bidHtml = 'Bidding/Clarify/bidder/model/bidList.html';//标段列表

var htmlToPdf = config.tenderHost + '/htmlToPdf.do';  //招标文件详情
var signView = '../../../Model/signView.html';  //签章页面

var fileUploads = null;
var askId = '';
var bidId = '';//标段id
var loginInfo = entryInfo();//登录人信息
var CAcf = null;  //实例化CA
var isChoose = '';
$(function(){
	if($.getUrlParam('isChoose') && $.getUrlParam('isChoose') != undefined){
		$('#chooseBid').show();
		$('[name=askType]').removeAttr('disabled');
	}else{
		$('#chooseBid').hide();
		$('[name=askType]').attr('disabled',true);
	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(){
//		var obj = $(this);
		if(askId == '' || !askId){
			save(false,false,function(businessId,id){
				askId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+askId+"/604",
						businessId: askId,
						status:1,
						businessTableName:'T_ASK_ANSWERS',  
						attachmentSetCode:'ASK_FILE'
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
			//上传文件
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+askId+"/604",
					businessId: askId,
					status:1,
					businessTableName:'T_ASK_ANSWERS',  
					attachmentSetCode:'ASK_FILE'
				});
			}
			$('#fileLoad').trigger('click');
		}
	
	});
	//选择标段
	$('#chooseBid').click(function(){
		var askType = $('[name=askType]').val();
		getBid(askType)
	})
	//切换澄清类型
	$('[name=askType]').change(function(){
		bidId = '';
		$('.changeEmpty').val('');
		$('.changeEmpty').html('');
	});
	
	
	$("#btnModel").click(function(){
		modelCreat({
			'bidSectionId':bidId,
			'tempType':'clearly',
			'examType':2
		});
			
	});
	
	
})
//选择标段
function getBid(type){
	parent.layer.open({
		type: 2,
		title: '选择标段',
		area: ['1000px', '650px'],
		content: bidHtml+'?type='+type,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.bidFromFathar(formFather);
		}
	})
}
function formFather(data){
	bidId = data.bidSectionId;
	bidName = data.bidSectionName;
	bidCode = data.interiorBidSectionCode;
	for(var key in data){
		$('[name='+key+']').val(data[key]);
		$('#'+key).html(data[key]);
	}
}

function passMessage(data,callback){
	if(data){
		bidId = data.bidSectionId;
		for(var key in data){
			$('[name='+key+']').val(data[key]);
			$('#'+key).html(data[key]);
		}
		if(data.bidStage == 1){
			$('[name=askType]').val('1')
		}else if(data.bidStage == 2){
			$('[name=askType]').val('4')
		}
		if(data.id){
			askId = data.id;
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+loginInfo.enterpriseId+"/"+bidId+"/"+askId+"/604",
					businessId: askId,
					status:1,
					businessTableName:'T_ASK_ANSWERS',  
					attachmentSetCode:'ASK_FILE'
				});
			}
		}
		if(data.projectAttachmentFiles){
			var projectAttachmentFiles = data.projectAttachmentFiles;
			fileUploads.fileHtml(projectAttachmentFiles);
		}
	}
	
	//保存
	$('#btnSave').click(function(){
		save(false,true,callback)
	})
	//发送
	$('#btnSubmit').click(function(){
		if(!bidId || bidId == ''){
			parent.layer.alert('请选择标段!');
			return
		}
		if(checkForm($("#formEle"))){//必填验证，在公共文件util中
			parent.layer.confirm('确定发送?', {title:'询问'}, function(index){
  				save(true,false,callback)
			  	layer.close(index);
			})
		}
	})
}
/*
 * 保存
 * isSend true 发送  false保存
 * isTips 保存时是否提示
 */
function save(isSend,isTips,callback){
	$('[name=askType]').removeAttr('disabled');
	if(isSend){
		if(!CAcf){
			CAcf = new CA({
				target:"#formEle",
				confirmCA:function(flag){
					if(!flag){  
						return;
					}
					arr = parent.serializeArrayToJson($('#formEle').serializeArray());
					arr.state = 1;
					if(askId && askId != ''){
						arr.id = askId;
					}
					savePost(arr, isSend,isTips,callback);
				}
			});
		}
		CAcf.sign();
	} else {
		arr = parent.serializeArrayToJson($('#formEle').serializeArray());
		arr.state = 0;
		if(askId && askId != ''){
			arr.id = askId;
		}
		savePost(arr, isSend,isTips,callback);
	}


	
	
}
function savePost(arr, isSend,isTips,callback){
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		success: function(data){
			if(data.success){
				askId = data.data;
				if(isSend){
					
					parent.layer.alert('发送成功！',{icon:6,title:'提示',closeBtn:0}, function(idxs){
						top.layer.close(idxs);
						var index=parent.layer.getFrameIndex(window.name);
       					parent.layer.close(index);
					});
					
       				
				}else{
					if(isTips){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'})
						if($.getUrlParam('isChoose') && $.getUrlParam('isChoose') != undefined){
							$('#chooseBid').show();
							$('[name=askType]').removeAttr('disabled');
						}else{
							$('#chooseBid').hide();
							$('[name=askType]').attr('disabled',true);
						}
					}
				}
				if(callback){
					callback(data.data,bidId)
				}
				parent.$('#tableList').bootstrapTable('refresh');
			}
		}
	});
}
