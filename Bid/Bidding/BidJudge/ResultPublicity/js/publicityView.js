
/**

*  编辑、添加公公示
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + "/BidWinNoticeController/findBidWinNoticeByBidId.do";	//修改地址 
var historyUrl = config.tenderHost + '/BidWinNoticeController/getHistoryList.do';//历史公告列表
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
var historyView = 'Bidding/BidJudge/ResultPublicity/model/publicityHistoryView.html';//查看公告历史详情页面
var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面
var id='';//数据id
var bidId='';
var fileUploads = null;
var isThrough; 
var examType= '';

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var RenameData;//投标人更名信息
$(function(){
//	isThrough = $.getUrlParam("isThrough");
//	 id = $.getUrlParam('id');//数据id
	 bidId = $.getUrlParam('id');//公告列表中带过来的标段Id
	 examType = $.getUrlParam('examType');//公告列表中带过来的标段Id
	 //媒体
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	initMedia({
		isDisabled: true
	});
	if(bidId){
		getBidSectionInfo(bidId);
	}
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getDetail(bidId,examType)
	
	/*关闭*/
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	/*全屏*/
	$('body').on('click','.fullScreen',function(){
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
	
	
	
	$('body').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-history-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "查看历史详情",
			area: ['80%', '80%'],
			content: historyView+ "?id=" + historyId + "&isThrough=1",
			resize: false,
			success:function(layero, index){
			}
		});
	})
})

function passMessage(data,callback){
	/*for(var key in data){
		$('#'+key).val(data[key])
	};*/
};



//获取标段信息
function getBidSectionInfo(id){
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
					//评标方式
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
};

/*信息回显*/
function getDetail(bid,type){
	$.ajax({
		type:"post",
		url:detailUrl,
		data: {
			'bidSectionId':bid,
			'examType': type
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
       			id = dataSource.id;
       			if(dataSource.noticeState == 2){
       				isThrough = '1'
       			}else{
       				isThrough = '0'
       			}
       			for(var key in dataSource){
	            	if(key == 'modality'){//公示形式 1自定义 2网页模版
	            		//$("input[type=radio][name='modality'][value='"+dataSource[key]+"']").attr("checked",'checked');
	            		if(dataSource[key] == 1){//公示形式 1自定义 2网页模版
	            			$("#" + key).html('自定义模版');
	            		}else if(dataSource[modality] == 2){
	            			$("#" + key).html('网页模版');
	            		}
	            	}else if(key == 'noticeContent'){
	            		// $("#noticeContent").html(dataSource[key]);
	            	}else if(key == 'noticeMedia'){
        				$('[name=noticeMedia]').val(dataSource[key]?dataSource[key].split(','):[]);
        			}else{
	            		$("#" + key).html(dataSource[key]);
	            	}
	          	};
				mediaEditor.setValue(dataSource);
	          	if(dataSource.bidWinCandidates){ 
	          		candidateHtml(dataSource.bidWinCandidates);
	          	}
	          	if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+id+"/224",
						businessId: id,
						status:2,
						businessTableName:'T_BID_WIN_NOTICE',  
						attachmentSetCode:'RESULT_NOTICE_DOC'
					});
				}
	          	if(dataSource.projectAttachmentFiles){
	          		fileUploads.fileHtml(dataSource.projectAttachmentFiles);
	          	}
	          	
	          	//审核
				$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
					businessId:id, 
					status:3,
					type:"zbjggs",
					checkState:isThrough
				});
				$.ajax({
					type:"post",
					url:historyUrl,
					async:true,
					data: {
						'notId': id,
						'bidSectionId': bidId,
						'bulletinType': "3"//公示类型  当前类型为3   1 招标公告 2 资格预审公告 3 中标结果公告 9 其他  
					},
					dataType: "json",//预期服务器返回的数据类型
					success: function(data){
						if(data.success){
							if(data.data){
								historyTable(data.data);
							}
						}
					},
					error: function(){
						parent.layer.alert("数据加载失败！");
					}
				});
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
	var priceUnitParm = '';
	if(data && data.length>0){
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
		html += '<tr>';
			html += '<th style="width: 50px;text-align: center;">排名</th>';
			html += '<th style="text-align: left;">投标人名称</th>';
			html += '<th style="width: 200px;text-align: center;">'+priceUnitParm+'</th>';
			html += '<th style="width: 150px;text-align: center;">是否中标人</th>'
		html += '</tr>';
	}
	var isWinBidderText;
	for(var i = 0;i<data.length;i++){
		if(data[i].isWinBidder== 1){
			isWinBidderText = "是";
		}else{
			isWinBidderText = "否";
		}
		if($('#candidates').hasClass('JD_view')){
			if(data[i].isWinBidder== 1){
				html += '<tr data-winner-id="'+data[i].winCandidateId+'">'
					+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
					+'<td style="text-align: left;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
				if(bidderPriceType == 1){
					html +=	'<td style="width: 300px;text-align: right;">'+data[i].bidPrice+'</td>'
				}else if(bidderPriceType == 9){
					html += '<td style="width: 300px;text-align: right;">'+data[i].otherBidPrice+'</td>'
				}
				html += '<td style="width: 100px;text-align: center;">'+isWinBidderText+'</td>'
				+'</tr>';
			}
		}else{
			html += '<tr data-winner-id="'+data[i].winCandidateId+'">'
				+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
				+'<td style="text-align: left;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
			if(bidderPriceType == 1){
				html +=	'<td style="width: 300px;text-align: right;">'+data[i].bidPrice+'</td>'
			}else if(bidderPriceType == 9){
				html += '<td style="width: 300px;text-align: right;">'+data[i].otherBidPrice+'</td>'
			}
			html += '<td style="width: 100px;text-align: center;">'+isWinBidderText+'</td>'
			+'</tr>';
		}
		
	};
	$(html).appendTo('#candidates');
	
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
	//			$("#historyList tbody").append(html);
		}
	}
	
	$(html).appendTo("#historyList")
}
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("noticeContent").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}