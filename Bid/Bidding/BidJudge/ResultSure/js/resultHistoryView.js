
/**
*  zhouyan 
*  2019-6-4
*  确定中标人
*  方法列表及功能描述
*/
var getUrl = config.tenderHost + '/BidWinCandidateController/findDetail.do';//编辑时时中标人
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var fileUploads = null;

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var RenameData;//投标人更名信息
$(function(){
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
});

function getMessageInfo(data){
	for(var key in data){
		$('#'+key).val(data[key])
	};
	if(data.id){
		getEdit(data.id);
	}
};

//编辑时查候选人
function getEdit(id){
	$.ajax({
		type:"post",
		url:getUrl,
		async:true,
		data: {
			'id': id,
		},
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
				if(data.data.bidSectionId){
					RenameData = getBidderRenameMark(data.data.bidSectionId);//投标人更名信息
					getBidInfo(data.data.bidSectionId);
				}
       			tenderTable(data.data.bidWinCandidates);
       			$("#noticeContent").text(data.data.noticeContent);
       			if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+data.bidSectionId+"/"+id+"/224",
						businessId: id,
						status:2,
						businessTableName:'T_BID_WIN_NOTICE',  
						attachmentSetCode:'WINNER_DOC'
					});
				}
				$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
					type:"zbqdzbr", 
					businessId:data.data.id, 
					status:3,
					checkState: '1'
				});
	          	if(data.data.projectAttachmentFiles){
	          		fileUploads.fileHtml(data.data.projectAttachmentFiles);
	          	}
       		}
				
		}
	});
}


//确定中标人列表
function tenderTable(data){
	var html = '';
	firstWinner = data[0].bidWinCandidates;
	$('#winnerList').html('');
	var priceUnit = '';
	var isScore = false;
	if(data && data.length>0){
		if(data[0].score){
			isScore = true;
		}
		/* if(data[0].priceUnit == 0){
			priceUnit = '（元）'
		}else if(data[0].priceUnit == 1){
			priceUnit = '（万元）'
		}; */
		if(bidderPriceType == 1){
			if(data[0].priceUnit == 0){
				priceUnit = '投标价格（元）';
			}else if(data[0].priceUnit == 1){
				priceUnit = '投标价格（万元）';
			};
		}else if(bidderPriceType == 9){
			priceUnit = '投标价格（'+rateUnit+'）';
		}
		html = '<tr>'
			+'<th style="width: 50px;text-align: center;">序号</th>'
			+'<th>投标人名称</th>';
		if(isScore){
			html += '<th style="width: 100px;text-align: center;">得分</th>';
		}
		html += '<th style="width: 300px;text-align: center;">'+priceUnit+'</th>'
			+'<th style="width: 80px;text-align: center;">名次</th>'
			+'<th style="width: 150px;text-align: center;">是否中标人</th>'
			+'<th style="width: 300px;text-align: center;">中标原由</th>'
		+'</tr>';
	}
	for(var i = 0;i < data.length;i++){
		var check = '';
		if(data[i].isWinBidder && data[i].isWinBidder == 1){
			check = 'checked="checked"';
		}
		if(data[i].priceUnit){
			if(data[i].priceUnit == 0){
				data[i].priceUnit = "（元"
			}else if(data[i].priceUnit == 1){
				data[i].priceUnit = "（万元"
			}
		}else{
			data[i].priceUnit = ""
		}
		if(data[i].priceCurrency){
			if(data[i].priceCurrency == 156){
				data[i].priceCurrency = "/人民币）"
			}
		}else{
			data[i].priceCurrency = "）"
		}
		
		var bidPrice = data[i].bidPrice?data[i].bidPrice:'';
		var otherBidPrice = data[i].otherBidPrice?data[i].otherBidPrice:'';
		
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
		if(isScore){
			html += '<td style="width: 100px;text-align: center;">'+data[i].score+'</td>'
		}
		//html +=	'<td style="width: 300px;text-align: right;">'+data[i].bidPrice+'</td>'
		if(bidderPriceType == 1){
			html += '<td style="width: 300px;text-align: right;">'+bidPrice+'</td>'
		}else if(bidderPriceType == 9){
			html += '<td style="width: 300px;text-align: right;">'+otherBidPrice+'</td>'
		}
		
		html +='<td style="width: 80px;text-align: center;">'+data[i].winCandidateOrder+'</td>'
			+'<td style="width: 150px;text-align: center;">'
				+'<input type="checkbox" name="bidWinCandidateIds" id="" '+check+'  disabled="disabled"  value="'+data[i].winCandidateId+'"/>'
			+'</td>'
			+'<td style="width: 300px;text-align: left;">'
			+'<span >'+(data[i].remark?data[i].remark:'')+'</span>'
		+'</td>'
		+'</tr>';
	}
	$(html).appendTo('#winnerList')
};

/**********************        根据标段id获取标段相关信息         ********************/
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
					for(var key in data.data){
						$('#' + key).val(data.data[key])
					}
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}