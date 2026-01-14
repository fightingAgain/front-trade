
/**
*  zhouyan 
*  2019-4-15
*  编辑、添加结果通知
*  方法列表及功能描述
*/


var recallUrl = config.tenderHost + "/ResultNoticeController/findResultNoticeByBidId.do";	//修改详情地址
var historyUrl = config.tenderHost + '/ResultNoticeController/getHistoryList.do';//历史公告列表
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息
var sendUrl = config.tenderHost + "/ResultNoticeController/publish.do";//发送

var viewHtml = 'Bidding/BidJudge/ResultNotice/model/preview.html';//预览
var editHtml = 'Bidding/BidJudge/ResultNotice/model/edit.html';//中标通知书编辑
var failEditHtml = 'Bidding/BidJudge/ResultNotice/model/failEdit.html';//落标通知书编辑
var historyView = 'Bidding/BidJudge/ResultNotice/model/noticeHistoryView.html';//查看通知书历史详情页面

var noticeId='';//数据id
var bidId='';//标段Id

var winnerPayType = '';//新增时缴纳方式 1. 固定金额、2.固定比例、3标准累进制
var payMoney = '';//收取金额

var winnerData = [];//中标人信息
var failData = [];//落标人信息
var tenderProjectClassifyCode;//标段类型 A 工程 B 货物 C 服务
var examType = '';
var isThrough;

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var rateName ;//费率名称
var RenameData;//投标人更名信息
$(function(){
//	isThrough = $.getUrlParam("isThrough");
	bidId = $.getUrlParam('id');//公告列表中带过来的标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	getBidInfo(bidId);
	examType = $.getUrlParam('examType');//公告列表中带过来的标段Id
	reviseDetail(bidId,examType)
	$('#bidSectionId').val(bidId);
	var isSend = '';//判断是否发送页面
	if ($.getUrlParam('special') && $.getUrlParam('special') != undefined) {
		isSend = $.getUrlParam('special');
	}
	if (isSend == 'RELEASE') {
		$('#btnSend').css('display', 'inline-block');
	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	
	//预览中标通知书
	$("#winningBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览中标通知书';
		var fileUrl=winnerData[index].resultNoticeItemFiles
		if(winnerData[index].id){		
			if(winnerData[index].isCompile&&winnerData[index].resultNotic){
				preView(winnerData[index].resultNotic)
			}else  if(!(winnerData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}else{
				parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
			}
		}else{
			parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
		}
		// if(winnerData[index].id){
		// 	preView(winnerData[index].id,titles)
		// }else{
		// 	parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
		// }
		
		
	});
	//预览落标通知书
	$("#failBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览结果通知书';
		var fileUrl=failData[index].resultNoticeItemFiles
		if(failData[index].id){
			if(failData[index].isCompile&&failData[index].resultNotic){
				preView(failData[index].resultNotic)
			} else if(!(failData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}else{
				parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
			}			
		}else{
			parent.layer.alert('还未编辑结果通知书！',{icon:7,title:'提示'})
		}
		// if(failData[index].id){
		// 	preView(failData[index].id,titles)
		// }else{
		// 	parent.layer.alert('还未编辑落标通知书！',{icon:7,title:'提示'})
		// }
	});

	
	function preView(html){
		$.ajax({
	        type: "post",
	        url: config.Reviewhost+"/ReviewControll/previewPdf.do",
	        async: true,
	        data: {
	            'html': html
	        },
	        success: function(data){
	            if(data.success){
	            	//viewPdf(data.data);
	            	previewPdf(data.data);
	            }
	        }
	    });
	}
	
	
	
});
$('#historyList').on('click','.btnView',function(){
	var historyId = $(this).closest('td').attr('data-history-id');//历史公告ID
	parent.layer.open({
		type: 2,
		title: "查看历史详情",
		area: ['100%', '100%'],
		content: historyView + "?id=" + historyId + "&isThrough=1"+"&bidderPriceType="+bidderPriceType+"&bidId="+bidId,
		resize: false,
		success: function(layero, index){
			
		}
	});
})


/*中标人
 * data：中标人数据
 * type：缴纳方式 1. 固定金额、2.固定比例、3标准累进制
 * code：标段类型  A 工程 B 货物 C 服务
 * discount： 优惠系数
 */
function setWinner(data,type,code,discount,changeValue){
	if(data.length == 0){
		return
	}
	var unit = '';
	var multiple = 1;//取整时的倍数 万元 10000 、元 1
	if(data[0].priceUnit == 1){
		unit = '（万元/人民币）';
		multiple = 10000;
		$("#priceUnitTxt").html("万元");
	}else if(data[0].priceUnit == 0){
		unit = '（元/人民币）';
		$("#priceUnitTxt").html("元");
	} 
	
	/* if(bidderPriceType == 1){
		if(data[0].priceUnit == 0){
			unit = '（元/人民币）';
			$("#priceUnitTxt").html("元");
		}else if(data[0].priceUnit == 1){
			unit = '（万元/人民币）';
			multiple = 10000;
			$("#priceUnitTxt").html("万元");
		};
	}else if(bidderPriceType == 9){
		unit = '（'+rateUnit+'）';
		$("#priceUnitTxt").html(rateUnit);
	} */
	
	if(data[0].priceCurrency == "156"){
		$("#priceCurrencyTxt").html("人民币");
	}
	var html = '';
	$('#winnerList').html('');
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th style="min-width: 200px;text-align: left;">中标人名称</th>'
	if(bidderPriceType == 9){
		html +=	'<th style="width: 150px;text-align: left;">'+rateName+'('+rateUnit+')'+'</th>'
	}	
	
	/* var serviceUnit = '';
	if(type == 1){
		serviceUnit ='（元/人民币）';
	}else{
		serviceUnit = unit;
	} */
	
	html +='<th style="width: 150px;text-align: left;">中标价'+unit+'</th>'
		+'<th style="width: 200px;text-align: center;">选取费用计算规则</th>'
		+'<th style="width: 150px;text-align: left;">中标服务费'+unit+'</th>'
		+'<th style="width: 150px;text-align: left;">实缴服务费'+unit+'</th>'
		+'<th style="width: 200px;text-align: center;">修改原因</th>'
		if(data[0].pwServiceFee || data[0].pwServiceFee == 0){
			html += '<th style="width: 200px;text-align: center;">平台服务费（元/人民币）</th>';
			html += '<th>平台服务费修改原因</th>';
		}
	+'</tr>';
	var totalMoney = 0 ;//总费用
	var countProcess = '';//计算过程
	for(var i = 0;i<data.length;i++){
		var options = '';
		var price = Number(data[i].bidPrice);//中标价
		var lastFee = '';//优惠后服务费用
		
		if(type == 1){
			options = '固定金额'
		}else if(type == 2){
			options = '固定比例'
		}else if(type == 3){
			if(code.indexOf('A') != -1){
				if(data[i].calculation == 1 || !data[i].calculation){
					options = '工程标准收费费率';
				}else{
					options = '服务标准收费费率';
				}
				
			}else if(code.indexOf('B') != -1){
				options = '货物标准收费费率';
			}else if(code.indexOf('C') != -1){
				options = '广告标准费率';
				if(data[i].calculation == 4 || !data[i].calculation){
					options = '服务标准收费费率';
				}else if(data[i].calculation == 1){
					options = '广告标准收费费率（旧';
				}else if(data[i].calculation == 2){
					options = '非广告标准收费费率（旧）';
				}else if(data[i].calculation == 3){
					options = '东风日产收费标准';
				}
				
			}
		};
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="min-width: 200px;text-align: left;">'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'<input type="hidden" name="" value="'+data[i].winCandidateId+'"/></td>'
		if(bidderPriceType == 9){
			html +=	'<td style="width: 150px;text-align: right;">'+data[i].otherBidPrice+'</td>'
		}	
		html +='<td style="width: 150px;text-align: right;">'+data[i].bidPrice+'</td>'
			+'<td style="width: 200px;text-align: center;">'+options+'</td>'
			+'<td style="width: 150px;text-align: right;" class="serviceMoney">'+(data[i].serviceFee?data[i].serviceFee:'')+'</td>'
			+'<td style="width: 150px;text-align: right;" class="payMoney">'+(data[i].newServiceFee?data[i].newServiceFee:'')+'</td>'
			+'<td style="width: 200px;text-align: center;" class="reason">'+(data[i].reason?data[i].reason:'')+'</td>';
		if(data[i].pwServiceFee || data[i].pwServiceFee == 0){
			html += '<td style="text-align: right;" class="payMoney">'+(data[i].pwServiceFee?data[i].pwServiceFee:'')+'</td>'
			+'<td style="text-align: center;" class="reason">'+(data[i].pwReson?data[i].pwReson:'')+'</td>';
		}
		html += '</tr>';
	};
	$(html).appendTo('#winnerList');
};
//计算过程
function process(dom){
	var  procedureArr = dom.split(',');
	var procedure = '';
	for(var i = 0;i<procedureArr.length;i++){
		procedure += '<div style="padding: 5px 0;">'+procedureArr[i]+'</div>'
	}
	return procedure
}
//中标通知
function winnerNoticeHtml(data){
	$('#winningBid').html('');
	var html = "";
	html = '<tr>'
		html += '<th style="width: 50px;text-align: center;">序号</th>'
		html += '<th>投标人名称</th>'
		html += '<th style="width: 100px;text-align: center;">中标情况</th>'
		if(!$('#winningBid').hasClass('JD_view')){
			html += '<th style="width: 100px;text-align: center;">状态</th>'
		}
		html += '<th style="width: 150px;text-align: center;">操作</th>'
	html += '</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].isCompile==undefined||data[i].isCompile){
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
				html += "<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
				html += "<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
				html += "<td style='width: 100px;text-align: center;'>是</td>"
				if(!$('#winningBid').hasClass('JD_view')){
					html += "<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
				}
				html += "<td style='width: 150px;text-align: center;'>"
					html += "<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
				html += "</td>"
			html += "</tr>";
		}else{
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
			html += "<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			html += "<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			html += "<td style='width: 100px;text-align: center;'>是</td>"
			if(!$('#winningBid').hasClass('JD_view')){
				html += "<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
			}
			html += "<td style='width: 150px;text-align: center;'>"
				// +"<button type='button' id='fileUp' class='btn btn-primary btn-sm btn_uplode' data-index='"+i+"' class='"+!(data[i].isCompile)+"?none':''><span class='glyphicon glyphicon-editglyphicon'>重新上传</span></button>"
				html += "<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			html += "</td>"
		html += "</tr>";
		}

		// html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
		// 	+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
		// 	+"<td>"+data[i].winCandidateName+"</td>"
		// 	+"<td style='width: 100px;text-align: center;'>是</td>"
		// 	+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
		// 	+"<td style='width: 150px;text-align: center;'>"
		// 		+"<button type='button' class='btn btn-primary btn-sm btn_view'  data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
		// 	+"</td>"
		// +"</tr>";
	};
	$(html).appendTo('#winningBid');
}

/*修改时信息回显*/
function reviseDetail(bidId,type){
	$.ajax({
		type:"post",
		url:recallUrl,
		data: {
			'examType':type,
			'bidSectionId':bidId
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			noticeId = dataSource.id;
			if(data.success == false){
        		parent.layer.alert(data.message,{icon:7,title:'提示'},function(index){
        			parent.layer.closeAll();
        		});
        		return;
        	}
			if(dataSource.discount){
				$('#isCount').val('是');
				discount = dataSource.discount;
			}else{
				$('#isCount').val('是');
				dataSource.discount = 1;
			};
			for(var key in dataSource){
				var payType = '';
				if(dataSource.payType	== 1){
					payType = ' 固定金额';
					$(".payMoney").show();
				}else if(data.payType	== 2){
					payType = ' 固定比例';
					$(".payRatio").show();
				}else if(dataSource.payType	== 3){
					payType = ' 标准累进制';
				};
            	$("#" + key).html(dataSource[key]);
            	$("#tenderProjectType").html(getTenderType(dataSource.tenderProjectType));
            	$('#payType').html(payType);
				if(dataSource.isManual == 0){
					$('#isManual').html('手动')
				}else if(dataSource.isManual == 1){
					$('#isManual').html('自动')
				}
          	};
          	
          	tenderProjectClassifyCode = dataSource.tenderProjectClassifyCode
			winnerPayType = dataSource.payType;
          	var candidateData = '';
			if(dataSource.resultNoticeItems.length > 0){
				candidateData = dataSource.resultNoticeItems;
			}else{
				candidateData = dataSource.bidWinCandidates
			}
          	if(candidateData.length > 0){
          		for(var i = 0;i<candidateData.length;i++){
					if(candidateData[i].isWinBidder == 1){
						winnerData.push(candidateData[i])
					}else{
						failData.push(candidateData[i])
					}
				};
          	}
			/*for(var i = 0;i<candidateData.length;i++){
				if(candidateData[i].isWinBidder == 1){
					winnerData.push(candidateData[i])
				}else{
					failData.push(candidateData[i])
				}
			};*/
			$('#countProcess').html(process(dataSource.rules))
			setWinner(winnerData,winnerPayType,dataSource.tenderProjectType,discount);
			winnerNoticeHtml(winnerData);
			failNoticeHtml(failData,winnerData.length);
			
			//审核
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				businessId:dataSource.id, 
				status:3,
				type:"zbjgtz",
				checkState:dataSource.submitState == 2 ? 1 : 0
			});
			/*通知历史*/
			$.ajax({
				type:"post",
				url:historyUrl,
				async:true,
				data: {
					'notId':dataSource.id,
					'bidSectionId':bidId
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
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
};
//落标通知
function failNoticeHtml(data,len){
	$('#failBid').html('');
	var html = "";
	html = '<tr>'
		html += '<th style="width: 50px;text-align: center;">序号</th>'
		html += '<th>投标人名称</th>'
		html += '<th style="width: 100px;text-align: center;">中标情况</th>'
		if(!$('#winningBid').hasClass('JD_view')){
			html += '<th style="width: 100px;text-align: center;">状态</th>'
		}
		html += '<th style="width: 150px;text-align: center;">操作</th>'
	html += '</tr>';
	for(var i = 0;i<data.length;i++){
		if(data[i].isCompile==undefined||data[i].isCompile){	
			html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
			html += "<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			html += "<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			html += "<td style='width: 100px;text-align: center;'>否</td>"
			if(!$('#winningBid').hasClass('JD_view')){
				html += "<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
			}
			html += "<td style='width: 150px;text-align: center;'>"
				html += "<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
				html += "<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			html += "</td>"
			html += "</tr>";
		}else{
			html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
			html += "<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			html += "<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			html += "<td style='width: 100px;text-align: center;'>否</td>"
			if(!$('#winningBid').hasClass('JD_view')){
				html += "<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
			}
			html += "<td style='width: 150px;text-align: center;'>"
				html += "<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
				// +"<button type='button' id='fileUp' class='btn btn-primary btn-sm btn_uplode' data-index='"+i+"' class='"+!(data[i].isCompile)+"?none':''><span class='glyphicon glyphicon-editglyphicon'>重新上传</span></button>"
				html += "<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			html += "</td>"
			html += "</tr>";
		}
		// html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
		// 	+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
		// 	+"<td>"+data[i].winCandidateName+"</td>"
		// 	+"<td style='width: 100px;text-align: center;'>否</td>"
		// 	+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
		// 	+"<td style='width: 150px;text-align: center;'>"
		// 		+"<button type='button' class='btn btn-primary btn-sm btn_view'  data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
		// 	+"</td>"
		// +"</tr>";
	};
	$(html).appendTo('#failBid');
	
};


//公告历史表格
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
			+'<td style="width: 200px;text-align:center">'+data[i].createTime+'</td>'
			+'<td style="width: 100px;" data-history-id="'+data[i].id+'"><button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
			+'</td></tr>';
		}
	}
	$(html).appendTo('#historyList')
		
}

function passMessage(data,callback){
	if(callback){
		callback()
	}
	$('#btnSend').click(function () {
		parent.layer.confirm('温馨提示：是否确认发送中标结果通知书？', { icon: 3, title: '询问' }, function (index) {
			sendNotice(noticeId, callback);			
			parent.layer.close(index);
		})
	})
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
					var arr = data.data;
					bidderPriceType = arr.bidderPriceType;
					rateUnit = arr.rateUnit;
					rateRetainBit = arr.rateRetainBit;
					rateName = arr.rateName;
				}
			}else{
				top.layer.alert(data.message)
			}
		}
	});
};
//发送
function sendNotice(id, callback){
	$.ajax({
		type: "post",
		url: sendUrl,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				if(callback){
					callback();
				};
				$('#btnSend').css('display', 'none');
				top.layer.alert('温馨提示：发送成功!', { icon: 6, title: '提示' }, function (ind) {
					top.layer.close(ind)
				});
			} else {
				top.layer.alert('温馨提示：发送失败!', { icon: 5, title: '提示' });
			}
		}
	});
	
}