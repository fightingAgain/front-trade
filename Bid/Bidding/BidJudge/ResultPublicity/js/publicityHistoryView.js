
/**

*  编辑、添加公公示
*  方法列表及功能描述
*/

var Url = config.tenderHost + "/BidWinNoticeController/getAndFile.do";	//修改地址 
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var id='';//数据id
var bidId='';
var fileUploads = null;
var isThrough;
var RenameData;//投标人更名信息
$(function(){
	isThrough = $.getUrlParam("isThrough");
	 id = $.getUrlParam('id');//数据id
	 //媒体
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	initMedia({
		isDisabled: true
	});
	 getDetail(id);
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:id, 
		status:3,
		type:"zbjggs",
		checkState:isThrough
	});
	/*全屏*/
	$('.fullScreen').click(function(){
		var content = $('#noticeContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看公告'
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
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
})

/*function getMessage(data){
	for(var key in data){
		$('#'+key).val(data[key])
	};
};
*/

/*信息回显*/
function getDetail(dataId){
	$.ajax({
		type:"post",
		url:Url,
		data: {
			'id':dataId
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
       			bidId = dataSource.bidSectionId;
				RenameData = getBidderRenameMark(bidId);//投标人更名信息
       			for(var key in dataSource){
	            	if(key == 'modality'){//公示形式 1自定义 2网页模版
	            		//$("input[type=radio][name='modality'][value='"+dataSource[key]+"']").attr("checked",'checked');
	            		if(dataSource[key] == 1){//公示形式 1自定义 2网页模版
	            			$("[name=" + key+"]").val('自定义模版');
	            		}else if(dataSource[modality] == 2){
	            			$("[name=" + key+"]").val('网页模版');
	            		}
	            	}else if(key == 'noticeContent'){
	            		// $("#noticeContent").html(dataSource[key]);
	            	}else if(key == 'noticeMedia'){
        				$('[name=noticeMedia]').val(dataSource[key]?dataSource[key].split(','):[]);
        			}else{
	            		$("[name=" + key+"]").val(dataSource[key]);
	            	}
	          	};
				mediaEditor.setValue(dataSource);
	          	if(dataSource.bidWinCandidates){ 
	          		candidateHtml(dataSource.bidWinCandidates);
	          	}
	          	if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+dataId+"/224",
						businessId: dataId,
						status:2,
						businessTableName:'T_BID_WIN_NOTICE',  
						attachmentSetCode:'RESULT_NOTICE_DOC'
					});
				}
	          	if(dataSource.projectAttachmentFiles){
	          		fileUploads.fileHtml(dataSource.projectAttachmentFiles);
	          	}
       		}
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}

function modelOption(meter){
	$.ajax({
		type:"post",
		url:modelOptionUrl,
		async:true,
		data:{
			'id':meter
		},
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


//候选人
function candidateHtml(data){
	$('#candidates').html('');
	var html = '';
	var priceUnit = '';
	if(data && data.length>0){
		if(data[0].priceUnit == 0){
			priceUnit = '（元）'
		}else if(data[0].priceUnit == 1){
			priceUnit = '（万元）'
		};
		html = '<tr>'
			+'<th style="width: 50px;text-align: center;">排名</th>'
			+'<th style="text-align: left;">投标人名称</th>'
			+'<th style="width: 200px;text-align: center;">投标报价'+priceUnit+'</th>'
			+'<th style="width: 150px;text-align: center;">是否中标人</th>'
		+'</tr>';
	}
	var isWinBidderText;
	for(var i = 0;i<data.length;i++){
		if(data[i].isWinBidder== 1){
			isWinBidderText = "是";
		}else{
			isWinBidderText = "否";
		}
		html += '<tr data-winner-id="'+data[i].winCandidateId+'">'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="text-align: left;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
			+'<td style="width: 300px;text-align: right;">'+data[i].bidPrice+'</td>'
			+'<td style="width: 100px;text-align: center;">'+isWinBidderText+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#candidates');
	
};

