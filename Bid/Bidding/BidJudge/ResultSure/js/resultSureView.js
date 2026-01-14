
/**
*  zhouyan 
*  2019-6-4
*  确定中标人
*  方法列表及功能描述
*/
var getUrl = config.tenderHost + '/BidWinCandidateController/findWinCandidateByBidId.do';//编辑时时中标人
var historyUrl = config.tenderHost + '/BidWinNoticeController/getHistoryList.do';//历史公告列表
var historyView = 'Bidding/BidJudge/ResultSure/model/resultHistoryView.html';//查看公告历史详情页面

var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var fileUploads = null;
var info={};

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var isThrough, source;
var RenameData;//投标人更名信息
$(function(){
	source = $.getUrlParam("source");
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	$('#historyList').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-history-id');//历史公告ID
		info.id = historyId;
		parent.layer.open({
			type: 2,
			title: "查看历史详情",
			area: ['100%', '100%'],
			content: historyView,
			resize: false,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.getMessageInfo(info);
			}
		});
	})
	
});

function passMessage(data){
	examType = data.examType;
	//examType = $.getUrlParam("examType");
	if(data.getForm == 'KZT'){
		bidId = data.id;
	}else{
		bidId = data.bidSectionId;//标段id
	}
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getBidInfo(bidId);
	getEdit(bidId,2);	
};

//编辑时查候选人
function getEdit(id,type){
	$.ajax({
		type:"post",
		url:getUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType': type
		},
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
       			info = data.data;
       			tenderTable(data.data.bidWinCandidates);
       			$("#noticeContent").text(data.data.noticeContent);
       			if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+data.data.bidSectionId+"/"+data.data.id+"/224",
						businessId: data.data.id,
						status:2,
						businessTableName:'T_BID_WIN_NOTICE',  
						attachmentSetCode:'WINNER_DOC'
					});
				}
				if(info.noticeState == 2){
					isThrough = '1'
				}else{
					isThrough = '0'
				}
				if(source == 1) {
					$("#btnClose").hide();
					$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
						type:"zbqdzbr", 
						businessId:info.id, 
						status:2,
						submitSuccess:function(){
				         	var index = parent.layer.getFrameIndex(window.name); 
							parent.layer.closeAll(); 
							parent.layer.alert("审核成功",{icon:7,title:'提示'});
							parent.$("#projectList").bootstrapTable("refresh");
						}
					});
				} else {
					$("#btnClose").show();
					$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
						type:"zbqdzbr", 
						businessId:info.id, 
						status:3,
						checkState:isThrough
					});
				}
	          	if(data.data.projectAttachmentFiles){
	          		fileUploads.fileHtml(data.data.projectAttachmentFiles);
	          	}
	          	getHistory(data.data.id,data.data.bidSectionId);
       		}
				
		}
	});
}

/*公告历史*/
function getHistory(id,bidSectionId){
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'notId': id,
			'bidSectionId': bidSectionId,
			'bulletinType': "9"//公示类型  当前类型为3   1 招标公告 2 资格预审公告 3 中标结果公告 9 其他  
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			if(data.success){
				historyTable(data.data);
			}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
}
//确定中标人列表
function tenderTable(data){
	var html = '';
	firstWinner = data[0].bidWinCandidates;
	$('#winnerList').html('');
	var priceUnitParm = '';
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
				priceUnitParm = '投标价格（元）';
			}else if(data[0].priceUnit == 1){
				priceUnitParm = '投标价格（万元）';
			};
		}else if(bidderPriceType == 9){
			priceUnitParm = '投标价格（'+rateUnit+'）';
		}
		html = '<tr>'
			+'<th style="width: 50px;text-align: center;">序号</th>'
			+'<th style="min-width:200px;">投标人名称</th>';
		if(isScore){
			html += '<th style="width: 100px;text-align: center;">得分</th>';
		}
		html += '<th style="width: 200px;text-align: center;">'+priceUnitParm+'</th>'
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
		var bidPrice = (data[i].bidPrice || data[i].bidPrice == 0) ? data[i].bidPrice : '';
		var otherBidPrice = (data[i].otherBidPrice || data[i].otherBidPrice == 0) ? data[i].otherBidPrice : '';
		
		html += '<tr>'
			+'<td style="text-align: center;">'+(i+1)+'</td>'
			+'<td>'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>';
		if(isScore){
			html += '<td style="text-align: center;">'+(data[i].score ? data[i].score : "/")+'</td>';
		}
		//html +=	'<td style="text-align: right;">'+data[i].bidPrice+'</td>'
//		html +=	'<td style="width: 300px;text-align: right;">'+data[i].bidPrice+data[i].priceUnit+data[i].priceCurrency+'</td>'
		if(bidderPriceType == 1){
			html +=	'<td style="text-align: right;">'+data[i].bidPrice+'</td>'
		}else if(bidderPriceType == 9){
			html +=	'<td style="text-align: right;">'+data[i].otherBidPrice+'</td>'
		}
		html += '<td style="text-align: center;">'+data[i].winCandidateOrder+'</td>'
			+'<td style="text-align: center;">'
				+'<input type="checkbox" name="bidWinCandidateIds" id="" '+check+'  disabled="disabled"  value="'+data[i].winCandidateId+'"/>'
			+'</td>'
			+'<td style="text-align: left;">'
			+'<span >'+(data[i].remark?data[i].remark:'')+'</span>'
		+'</td>'
		+'</tr>';
	}
	$(html).appendTo('#winnerList')
};

//公示历史表格
function historyTable(data){
	$("#historyList").html('');
	var html='';
	html = '<tr>'
			+'<th style="width: 50px; text-align: center;">序号</th>'
			+'<th>标题</th>'
			+'<th style="width: 200px; text-align: center;">更新时间</th>'
			+'<th style="width: 100px; text-align: center;">操作</th>'
		+'</tr>';
	if(data.length == 0){
		html += '<tr><td  colspan="4" style="text-align: center;">无历史记录</td></tr>';
	}else{
		
		for(var i = 0;i<data.length;i++){
			
			html += '<tr>'
			+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
			+'<td>'+data[i].noticeName+'</td>'
			+'<td style="width: 200px;text-align:center">'+data[i].dataTimestamp+'</td>'
			+'<td style="width: 100px;" data-history-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>';
//			$("#historyList").append(html);
		}
	}
	$(html).appendTo('#historyList')
}
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
						$('#' + key).html(data.data[key])
					}
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
}