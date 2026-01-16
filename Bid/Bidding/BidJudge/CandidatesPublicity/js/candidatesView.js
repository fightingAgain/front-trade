
/**

*  候选人公示查看
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/getSuccessFulByBidId.do";	//修改地址   
var historyUrl = config.tenderHost + '/BidSuccessFulPublicityController/getHistoryList.do';//历史公示列表
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
var historyView = 'Bidding/BidJudge/CandidatesPublicity/model/candidatesHistoryView.html';//查看公示历史详情页面

var sendUrl = config.tenderHost + '/BidSuccessFulPublicityController/publish.do';//发布
var pauseUrl = config.tenderHost + "/BidSuccessFulPublicityController/pause.do";	//暂停
var playUrl = config.tenderHost + "/BidSuccessFulPublicityController/recovery.do";	//恢复 

var fullScreen = 'Bidding/Model/fullScreenView.html';//全屏查看页面

var bidId='';//标段Id
var publicId = '';//公示id,保存后才有
var fileUploads = null;
var isThrough;//

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var tenderProjectType = '';//招标项目类型
$(function(){
	isThrough = $.getUrlParam("isThrough");
//	publicId = $.getUrlParam('id');//数据id
	bidId = $.getUrlParam('id');//数据id
	if(bidId){
		getBidSectionInfo(bidId);
	}
	var isSend = '';//判断是否发送、暂停、回复页面
	if($.getUrlParam('special') && $.getUrlParam('special') != undefined){
		isSend =  $.getUrlParam('special');
	}
	if(isSend == 'RELEASE'){
		$('#btnSend').css('display','inline-block');
	}else if(isSend == 'ZT'){
		$('#btnPause').css('display','inline-block');
	}else if(isSend == 'HF'){
		$('#btnPlay').css('display','inline-block');
	}
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'publicityContent'
	});
	//媒体
	initMedia({
		isDisabled: true
	});
	
	reviseDetail(bidId);
	
	/*关闭*/
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//全屏查看公示
	$('body').on('click','.fullScreen',function(){
		var content = $('#publicityContent').html();
	   	parent.layer.open({
	        type: 2 
	        ,title: '查看中标候选人公示'
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
		var historyId = $(this).closest('td').attr('data-history-id');//历史公示ID
		var state = $(this).attr("data-state");
		parent.layer.open({
			type: 2,
			title: "查看历史详情",
			area: ['80%', '80%'],
			content: historyView + "?id=" + historyId + "&isThrough=1&tenderProjectType="+tenderProjectType,
			resize: false,
			success: function(layero, index){
				
			}
		});
	})
})
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
					tenderProjectType = data.data.tenderProjectType.charAt(0);
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
};
//暂停
function setPause(id,callback){
	$.ajax({
		type:"post",
		url:pauseUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType':2
		},
		success: function(data){
			if(data.success){
				top.layer.alert('暂停成功!',{icon:6,title:'提示'});
				$('#btnPause').hide();
				$('#btnPlay').show();
				callback()
			}else{
				top.layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};
//恢复
function setPlay(id,callback){
	$.ajax({
		type:"post",
		url:playUrl,
		async:true,
		data: {
			'bidSectionId': id,
			'examType':2
		},
		success: function(data){
			if(data.success){
				top.layer.alert('恢复成功!',{icon:6,title:'提示'});
				var index=parent.layer.getFrameIndex(window.name);
        		parent.layer.close(index);
				callback()
			}else{
				top.layer.alert(data.message,{icon:5,title:'提示'});
			}
		}
	});
};
/*信息回显*/
function reviseDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		data: {
			'bidSectionId':id,
			'examType':'2'
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		publicId = dataSource.id;
        		//审核
				$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
					businessId:publicId, 
					status:3,
					type:"hxrgs",
					checkState:dataSource.publicityState == 2 ? 1 : 0
				});
				//历史
				getHistory(publicId,dataSource.bidSectionId);
        		for(var key in dataSource){
        			if(dataSource.bidForm == 1){
        				dataSource.bidForm = '中标价';
        			}else if(dataSource.bidForm == 2){
        				dataSource.bidForm = '下浮率';
        			};
        			if(dataSource.isPublicBidPrice == 0){
        				dataSource.isPublicBidPrice = '否';
        			}else if(dataSource.isPublicBidPrice == 1){
        				dataSource.isPublicBidPrice = '是';
        			}
        			if(key == 'noticeMedia'){
        				$('[name=noticeMedia]').val(dataSource[key]?dataSource[key].split(','):[]);
        			}else if(key == 'isManual'){
        				if(dataSource.isManual == '1'){
    						$('#isManual').html('自动发布')
    					}else if(dataSource.isManual == '0'){
    						$('#isManual').html('手动发布')
    					}
    					publishType(dataSource.isManual)
        			}else{
        				$("#" + key).html(dataSource[key]);
        			}
    				
        			
	            	
	          	};
	          	if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						businessId: publicId,
						status:2,
					});
				}
	          	if(dataSource.projectAttachmentFiles){
	          		fileUploads.fileHtml(dataSource.projectAttachmentFiles);
	          	}
	          	if(dataSource.bidWinCandidates && dataSource.bidWinCandidates.length>0){
	          		candidateHtml(dataSource.bidWinCandidates);
	          	}
	          	mediaEditor.setValue(dataSource);
        	}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
//候选人
function candidateHtml(data){
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	$('#candidates').html('');
	var html = '';
	var priceUnitParm = '';
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
	html += '<th style="min-width: 200px;">投标人名称</th>';
	html += '<th style="width: 300px;text-align: center;">统一社会信用代码</th>';
	html += '<th style="width: 150px;text-align: center;">'+priceUnitParm+'</th>';
	html += '<th style="width: 150px;text-align: center;">得分</th>';
	if(tenderProjectType == 'A'){
		html += '<th style="width: 100px;min-width: 100px;text-align: center;">项目负责人</th>';
		html += '<th style="width: 150px;min-width: 100px;text-align: center;">证书名称及编号</th>';
		html += '<th style="width: 100px;min-width: 100px;text-align: center;">工期</th>';
	};
	+'</tr>';
//根据得分排序
function sortScore(a,b){
return b.score-a.score
};
//利用js中的sort方法
data.sort(sortScore);
	for(var i = 0;i<data.length;i++){
		var priceUnit = '';//单位
		var priceCurrency = '';//币种
		var bidPrice = '';//中标价格
		var bidPrice = '';//费率中标价格
		if(data[i].comeFrom){
			data[i].winCandidateName = data[i].bidderName;
			data[i].winCandidateId = data[i].supplierId;
		}
		if(bidderPriceType == 1){
			priceUnit = data[i].priceUnit?data[i].priceUnit:'0';
		}else if(bidderPriceType == 9){
			priceUnit = '';
		}
		if(bidderPriceType == 1){
			priceCurrency  = data[i].priceCurrency?data[i].priceCurrency:'156';
		}else if(bidderPriceType == 9){
			priceCurrency = '';
		}
		if(bidderPriceType == 1){
			bidPrice  = (data[i].bidPrice || data[i].bidPrice == 0)?data[i].bidPrice:'';
		}else if(bidderPriceType == 9){
			otherBidPrice = (data[i].otherBidPrice || data[i].otherBidPrice == 0)?data[i].otherBidPrice:'';
		}
		html += '<tr data-winner-id="'+data[i].winCandidateId+'">'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="min-width: 200px;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'</td>'
			+'<td style="width: 300px;text-align: center;">'+data[i].enterpriseCode+'</td>'
		if(bidderPriceType == 1){
			html += '<td style="width: 150px;min-width: 150px;text-align: right;">'+bidPrice+'</td>'
		}else if(bidderPriceType == 9){
			html += '<td style="width: 150px;min-width: 150px;text-align: right;">'+otherBidPrice+'</td>'
		}	
		//'<td style="width: 150px;text-align: right;">'+bidPrice+'</td>'
		html +='<td style="width: 150px;text-align: center;">'+((data[i].score || data[i].score == 0)?data[i].score:'/')+'</td>';
		if(tenderProjectType == 'A'){
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectManagerMane?data[i].projectManagerMane:"") + '</td>';
			html += '<td style="width: 100px;min-width: 150px;text-align: center;">' + (data[i].cfa?data[i].cfa:"") + '</td>';
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectTime?data[i].projectTime:"") + '</td>';
		};
		html +='</tr>';
		
	};
	$(html).appendTo('#candidates');
	
};
function getHistory(dataId,id){
	/*公示历史*/
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'notId':dataId,
			'bidSectionId':id
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			if(data.success){
//				if(data.data){
					historyTable(data.data);
//				}
				
			}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
}
//公示历史表格
function historyTable(data){
//	console.log(data.length)
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
				+'<td>'+data[i].publicityName+'</td>'
				+'<td style="width: 200px;text-align:center">'+data[i].createTime+'</td>'
				+'<td style="width: 100px;" data-history-id="'+data[i].id+'">'
					+'<button type="button" class="btn btn-primary btn-sm btnView" data-state="'+data[i].publicityState+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+'</td>'
			+'</tr>';
		}
		
	}
	$(html).appendTo('#historyList');
}
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("publicityContent").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}
/*
 * 公示发布方式
 * val  是否手动发布；0代表手动 1代表自动
 * */
function publishType(val){
	if(val == 1){
		$('.publish_own').show();
	}else{
		$('.publish_own').hide();
	}
}
function passMessage(data,callback){
	$('#btnSend').click(function(){
		top.layer.confirm('确认要发布？',{icon:3,title:'询问'},function(ask){
			top.layer.close(ask);
			sendNotice(publicId,false,callback);
		})
		
	});
	//暂停
	$('#btnPause').click(function(){
		top.layer.confirm('确认要暂停？',{icon:3,title:'询问'},function(ask){
			top.layer.close(ask);
			setPause(bidId,callback)
		})
	});
	//恢复
	$('#btnPlay').click(function(){
		top.layer.confirm('确认要恢复？',{icon:3,title:'询问'},function(ask){
			top.layer.close(ask);
			setPlay(bidId,callback)
		})
	});
}
//发布
function sendNotice(bid,state,callback){
	var sendData ={};
	sendData.id = bid;
	if(state){
		sendData.confirm = state;
	}
	$.ajax({
		type:"post",
		url:sendUrl,
		async:true,
		data:sendData,
		success: function(data){
			if(data.success){
				if(data.data == '1'){
					top.layer.confirm('公示开始时间小于当前时间，若要继续发布，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						top.layer.close(ind);
					});
				}else if(data.data == '2'){
					if(callback){
						callback();
					}
					
						
					
					top.layer.alert('发布成功!');
					$('#btnSend').css('display','none');
				}else if(data.data == '3'){
					top.layer.confirm('公示结束时间小于当前时间，若要继续发布，请点确定?', {icon: 3, title:'询问'}, function(ind){
						sendNotice(bid,1)
						top.layer.close(ind);
					});
				}
			}else{
				top.layer.alert(data.message)
			}
		}
		
	});
}
