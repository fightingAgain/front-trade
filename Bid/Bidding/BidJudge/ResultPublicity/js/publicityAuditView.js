
/**

*  编辑、添加公公示
*  方法列表及功能描述
*/

var Url = config.tenderHost + "/BidWinNoticeController/getAndFile.do";	//修改地址 
var resiveUrl = config.tenderHost + "/BidWinNoticeController/findBidWinCandidateList.do";	//查看中标人地址
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)

var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var id='';//数据id
var bidId='';
var fileUploads = null;
var RenameData;//投标人更名信息
$(function(){
	 id = $.getUrlParam('id');//数据id
	 //bidId = $.getUrlParam('bidId');//公告列表中带过来的标段Id
	 source = $.getUrlParam('source');//公告列表中带过来的标段Id
	 //媒体
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	initMedia({
		isDisabled: true
	});
	 if(source == 1){
		statu = 2
	}else if(source == 0){
		statu = 3
	}
	
	 getDetail(id,2)
	
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:id, 
		status:statu,
		type:"zbjggs",
		submitSuccess: function(){
			top.layer.closeAll();
			top.layer.alert("审核成功",{icon:7,title:'提示'});
			parent.$('#table').bootstrapTable('refresh');
		}
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
				if(bidId){
					getBidInfo(bidId);
				}
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
					mediaEditor.setValue(dataSource);
	          	};
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
//	          	winCandidateInfo(bidId);
       		}
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}


function winCandidateInfo(bidId){
	$.ajax({
		type:"post",
		url:resiveUrl,
		data: {
			'bidSectionId':bidId
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			candidateHtml(dataSource);
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
};

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
	var priceUnitParm = '';
	if(data && data.length>0){
		if(bidderPriceType == 1){
			if(data[0].priceUnit == 0){
				priceUnitParm = '投标价格（元/人民币）';
			}else if(data[0].priceUnit == 1){
				priceUnitParm = '投标价格（万元/人民币）';
			};
		}else if(bidderPriceType == 9){
			priceUnitParm = '投标价格（'+rateUnit+'）';
		}
	}
	var html = '<tr>'
		+'<th style="width: 50px;text-align: center;">排名</th>'
		+'<th style="text-align: left;">投标人名称</th>'
		+'<th style="width: 200px;text-align: center;">'+priceUnitParm+'</th>'
		+'<th style="width: 150px;text-align: center;">是否中标人</th>'
	+'</tr>';
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
		if(bidderPriceType == 1){
			html +=	'<td style="width: 100px;text-align: right;">'+data[i].bidPrice+'</td>'
		}else if(bidderPriceType == 9){
			html += '<td style="width: 100px;text-align: right;">'+data[i].otherBidPrice+'</td>'
		}
		html +='<td style="width: 100px;text-align: center;">'+isWinBidderText+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#candidates');
	
};



function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidInfoUrl,
		async:false,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}