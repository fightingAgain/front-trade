
var saveUrl = config.tenderHost+'/AnswerMeetingNoticeController/saveAndUpdate.do';//保存接口
var detailUrl = config.tenderHost+'/AnswerMeetingNoticeController/getAanswerMeetingByBidId.do';//编辑时获取详情接口
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
/*var modelOptionUrl = config.tenderHost + '/WordToHtmlController/findTempBidFileList.do';//模板下拉框
var modelUrl =config.tenderHost + '/WordToHtmlController/wordToHtml.do';//模板地址*/

var noticeId = '';//数据id
var bidId = '';//标段id
var loginInfo = entryInfo();//登录人信息
var ue;
var modelId;//模版id
$(function(){
	//初始化编辑器
	ue = UE.getEditor('container');
	modelOption({tempType:'answer'});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
	//开始时间
 	$('#noticeStartTime').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			onpicked:function(){
				$dp.$('noticeEndTime').click();
			},
			minDate:nowDate,
			maxDate:'#F{$dp.$D(\'noticeEndTime\')}'
		})
 	});
 	//结束时间
 	$('#noticeEndTime').click(function(){
 		if($('#noticeStartTime').val() == ''){
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:nowDate
			})
 		}else{
 			WdatePicker({
 				el:this,
	 			dateFmt:'yyyy-MM-dd HH:mm',
	 			minDate:'#F{$dp.$D(\'noticeStartTime\')}'
			})
 		}
 		
 	});
	
	//模板下拉框
//	modelOption({tempType:'notice'});
	//选择模板

	
	/*全屏*/
	$('.fullScreen').click(function(){
//		console.log($.parserUrlForToken('fullScreen.html'))
	    parent.layer.open({
	        type: 2 
	        ,title: '编辑通知信息'
	        ,area: ['100%', '100%']
	        ,content: 'fullScreen.html'
	        ,resize: false
	        ,btn: ['确定', '关闭']
	        ,success:function(layero,index){
	    	    var iframeWind=layero.find('iframe')[0].contentWindow;
	    	    iframeWind.ue.ready(function() {
				    //设置编辑器的内容
				    iframeWind.ue.setContent(ue.getContent())
				});
	    	    
	        }
	        //确定按钮
	        ,yes: function(index,layero){
	        	var iframeWinds=layero.find('iframe')[0].contentWindow;
	        	ue.setContent(iframeWinds.ue.getContent());
	            parent.layer.close(index);
	            
	        }
	        ,btn2: function(){
	          parent.layer.close();
	        }
        });
	});
	
})
function passMessage(data,callback){
	
	var bidData = {};
	for(var key in data){
		bidData[key] = data[key];
	}
	for(var key in bidData){
		$('#'+key).html(bidData[key]);
	}
	/*if(bidData.id){
		noticeId = bidData.id;
		getDetail(noticeId);
	}else{
		$('#linkMen').val(loginInfo.userName)
		$('#linkTel').val(loginInfo.tel)
		
	}*/
	if(data.getForm && data.getForm == 'KZT'){
		bidId = bidData.id;
	}else{
		bidId = bidData.bidSectionId;
	}
	$('#bidSectionId').val(bidId);
	$('#examType').val(bidData.examType);
	getBidInfo(bidId);
	getDetail(bidId);
	$("#btnModel").click(function(){
		modelId = $('#noticeTemplate option:selected').attr('data-model-id');//选中的模板的id
//		var modelId = $('#noticeTemplate option:selected').attr('data-model-id');//选中的模板的id
		var modelUrl = $('#noticeTemplate option:selected').attr('data-model-url');//选中的模板的url
		var hashtml = ue.hasContents();
		if(hashtml){
			parent.layer.confirm('确定替换模板？',{icon:3,title:'询问'},function(index){
				parent.layer.close(index)
				save(false,false,callback,function(){
					modelHtml({
						tempBidFileid: modelId,
						bidSectionId: bidId,
						'examType':2
					});
				})
				
			})
		}else{
			save(false,false,callback,function(){
				modelHtml({
					tempBidFileid: modelId,
					bidSectionId: bidId,
					'examType':2
				});
			})
		}
	});
	//保存
	$('#btnSave').click(function(){
		save(false,true,callback);
	})
	
	//发送
	$('#btnSubmit').click(function(){
		var  noticeSendTime = Date.parse(new Date($('#noticeStartTime').val().replace(/\-/g,"/")));		//公告发布时间
		var  noticeEndTime = Date.parse(new Date($('#noticeEndTime').val().replace(/\-/g,"/")));		//公告截止时间
		if(noticeEndTime <= noticeSendTime){
			parent.layer.alert('会议结束时间应在会议开始时间之后！');
			return
		}
		if(checkForm($("#formEle"))){//必填验证，在公共文件unit中
			if($.trim($('#linkMen').val()).length > 10){
				parent.layer.alert('请正确输入联系人！');
				return
			}else if(ue.getContentTxt()==''){
				parent.layer.alert('请填写通知内容！',function(ind){
					parent.layer.close(ind);
//					$('#collapseSeven').collapse('show');
				})
			}else{
				parent.layer.confirm('确定发送？',{icon:3,title:'询问'},function(index){
					save(true,false,callback);
				})
				
			}
		}
	})
}
/*
 * state true: 提交 false ：保存
 * isTips保存时是否弹出提示信息
 */
function save(state,isTips,callback,back){
	$('#remark').val(ue.getContent());
	var arr = parent.serializeArrayToJson($('#formEle').serializeArray());
	if(state){
		arr.noticeState = 1;
	}else{
		arr.noticeState = 0;
	}
	if(noticeId && noticeId != ''){
		arr.id = noticeId;
	}
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type:"post",
		url:saveUrl,
		async:true,
		data: arr,
		success: function(data){
			$('#btnSubmit').attr('disabled', false);
			if(data.success){
				noticeId = data.data;
				if(callback){
					callback()
				}
				if(back){
					back()
				}
				if(state){
					
					top.layer.alert('发送成功！',{icon:6,title:'提示'})
					var index=parent.layer.getFrameIndex(window.name);
    				parent.layer.close(index);
				}else{
					if(isTips){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'},function(ind){
							parent.layer.close(ind);
						})
					}
					
				}
//				parent.$('#tableList').bootstrapTable('refresh');
			}else{
				parent.layer.alert(data.message,{icon:5,title:'提示'})
			}
		},
		error: function(data) {
		 $('#btnSubmit').attr('disabled', false);
		 parent.layer.alert("提交失败！");
		}
	});
}
/*//模板下拉框
function modelOption(meterData){
	$.ajax({
		type:"post",
		url:modelOptionUrl,
		async:true,
		data:meterData,
		success:function(data){
			var arr = data.data;
			if(data.success){
				var option="";
				for(var i=0;i<arr.length;i++){
					option = $('<option data-model-id="'+arr[i].id+'" data-model-url="'+arr[i].url+'">'+arr[i].tempName+'</option>');
					$('#noticeTemplate').append(option);
				}
			}
		}
	});
}
function modelHtml(mId,meter){
	ue.setContent('');
	var index = parent.layer.load();
	$.ajax({
		type:"post",
		url:modelUrl,
		async:true,
		data:{
			'tempBidFileid':mId,		//模板Id
			'bidSectionId':meter,	//标段Id
		},
		success:function(data){
			if(data.success){
				ue.setContent(data.data);
				parent.layer.close(index); 
			}else{
				parent.layer.close(index);
			}
		}
	});
	
};*/
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
				if(data.data){
					var arr = data.data;
					noticeId = arr.id;
					for(var key in arr){
						$('#'+key).val(arr[key]);
					}
					//公告内容
					if(arr.noticeContent){
						ue.ready(function() {
						    ue.setContent(arr.noticeContent);
						});
					}
				}else{
					$('#linkMen').val(loginInfo.userName)
					$('#linkTel').val(loginInfo.tel)
				}
			}else{
				parent.layer.alert(data.message)
			}
		}

	});
}
/**********************        根据标段id获取标段相关信息         ********************/
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
				$('#tenderProjectName').html(data.data.tenderProjectName);
				$("#noticeStartTime").html(data.data.answerStartDate);
				$("#address").html(data.data.answerAddress);
			}else{
				top.layer.alert(data.message);
			}
		}
	});
}
