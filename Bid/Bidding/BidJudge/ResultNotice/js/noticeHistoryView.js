
/**
*  zhouyan 
*  2019-4-15
*  编辑、添加结果通知
*  方法列表及功能描述
*/

var saveUrl = config.tenderHost + "/ResultNoticeController/save.do";	//保存地址
var submitUrl = config.tenderHost + "/ResultNoticeController/subSave.do";	//提交地址


var resiveUrl = config.tenderHost + "/BidWinCandidateController/findBidWinCandidate.do";	////新增详情地址
var recallUrl = config.tenderHost + "/ResultNoticeController/getAndFile.do";	//修改详情地址
var modelUrl = config.tenderHost + "/ResultNoticeController/notice.do";//获取模板地址
var tenderUrl = config.tenderHost + '/ResultNoticeController/findBidWinCandidateList.do';//查询当前标段所有中标人候选人及中标价
var reviseMoneyUrl = config.tenderHost + '/ResultNoticeController/saveItem.do';//修改价格后请求的接口


var viewHtml = 'Bidding/BidJudge/ResultNotice/model/preview.html';//预览
var getUrl = config.tenderHost + '/ResultNoticeController/getResultNoticeItem.do';//获取通知书编辑内容

var publicId='';//数据id
var bidId='';//标段Id

var winnerPayType = '';//新增时缴纳方式 1. 固定金额、2.固定比例、3标准累进制
var payMoney = '';//收取金额

var winnerData = [];//中标人信息
var failData = [];//落标人信息
var tenderProjectClassifyCode;//标段类型 A 工程 B 货物 C 服务
var countProcessArr = [];//计算过程
var isThrough;
var bidderPriceType;
var RenameData;//投标人更名信息
$(function(){
	isThrough = $.getUrlParam("isThrough");
	bidderPriceType = $.getUrlParam("bidderPriceType");
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		 publicId = $.getUrlParam('id');//公告列表中带过来的ID
	}
	reviseDetail(publicId)
	$('#bidSectionId').val(bidId);
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:publicId, 
		status:3,
		type:"zbjgtz",
		checkState:isThrough
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	
	//预览中标通知书
	$("#winningBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览中标通知书';
		if(winnerData[index].resultNotic){
			preView(winnerData[index].resultNotic)
			// getContent(winnerData[index].id)
			// preView(winnerData[index].id,titles)
		}else{
			parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
		}
		
		
	});
	//预览落标通知书
	$("#failBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览结果通知书';
		if(failData[index].resultNotic){
			preView(failData[index].resultNotic)
			// preView(failData[index].id,titles)
		}else{
			parent.layer.alert('还未编辑结果通知书！',{icon:7,title:'提示'})
		}
	});
	
	
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
function getContent(id){
	$.ajax({
		type: "post",
		url: getUrl,
		async: true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				preView(data.data)
				/* $('#content').val(data.data);
				$('form').attr("action",config.Reviewhost+"/ReviewControll/previewPdf");
				$('form').submit(); */
//				$('#noticeContent').html(data.data)
			}
		}
	});
}
/*中标人
 * data：中标人数据
 * type：缴纳方式 1. 固定金额、2.固定比例、3标准累进制
 * code：标段类型  A 工程 B 货物 C 服务
 * discount： 优惠系数
 */
function setWinner(data,type,code,discount,changeValue){
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
					options = '日产收费标准';
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
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th>投标人名称</th>'
		+'<th style="width: 100px;text-align: center;">中标情况</th>'
		+'<th style="width: 100px;text-align: center;">状态</th>'
		+'<th style="width: 150px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>是</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view'  data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
	};
	$(html).appendTo('#winningBid');
}

/*修改时信息回显*/
function reviseDetail(dataId){
	$.ajax({
		type:"post",
		url:recallUrl,
		data: {
			'id':dataId
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
			for(var key in dataSource){
				var payType = '';
				if(dataSource.payType	== 1){
					payType = ' 固定金额';
				}else if(data.payType	== 2){
					payType = ' 固定比例';
				}else if(dataSource.payType	== 3){
					payType = ' 标准累进制';
				};
            	$("#" + key).html(dataSource[key]);
            	$("#tenderProjectType").html(getOptionValue('tenderProjectType',dataSource.tenderProjectType));
            	$('#payType').html(payType);
          	};
          	
          	tenderProjectClassifyCode = dataSource.tenderProjectClassifyCode
			winnerPayType = dataSource.payType;
          	var candidateData = dataSource.resultNoticeItems;
			for(var i = 0;i<candidateData.length;i++){
				if(candidateData[i].isWinBidder == 1){
					winnerData.push(candidateData[i])
				}else{
					failData.push(candidateData[i])
				}
			};
			if(dataSource.discount){
				$('#isCount').val('是');
				discount = dataSource.discount;
			}else{
				discount = 1;
			};
			$('#countProcess').html(process(dataSource.rules))
			setWinner(winnerData,winnerPayType,tenderProjectClassifyCode,discount);
			winnerNoticeHtml(winnerData);
			failNoticeHtml(failData,winnerData.length);
			if(dataSource.isManual == 0){
				$('#isManual').html('手动')
			}else if(dataSource.isManual == 1){
				$('#isManual').html('自动')
			}
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
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th>投标人名称</th>'
		+'<th style="width: 100px;text-align: center;">中标情况</th>'
		+'<th style="width: 100px;text-align: center;">状态</th>'
		+'<th style="width: 150px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>否</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view'  data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
	};
	$(html).appendTo('#failBid');
	
};


