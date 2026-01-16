
/**

*  中标结果通知审核
*  方法列表及功能描述
*/

var viewUrl = config.tenderHost + "/ResultNoticeController/findBidWinCandidate.do";	//查看地址
var recallUrl = config.tenderHost + "/ResultNoticeController/getAndFile.do";	//修改详情地址
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//获取标段相关信息

var viewHtml = 'Bidding/BidJudge/ResultNotice/model/preview.html';//预览

var source = 0; //链接来源 0:查看，1：审核
var winnerPayType = '';//新增时缴纳方式 1. 固定金额、2.固定比例、3标准累进制

var winnerData = [];//中标人信息
var failData = [];//落标人信息
var tenderProjectClassifyCode;//标段类型 A 工程 B 货物 C 服务
var countProcessArr = [];//计算过程

var bidderPriceType ;//投标报价方式 1.金额  9费率
var rateUnit ;//费率单位
var rateRetainBit ;//费率保留位数(0~6)
var rateName ;//费率名称
var RenameData;//投标人更名信息
$(function(){
	var id = $.getUrlParam('id');
	reviseDetail(id)
	/*审核*/
	source = $.getUrlParam("source");
 	if(source == 1) {
 		$("#btnClose").hide();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"zbjgtz", 
 			businessId:id, 
 			status:2,
 			submitSuccess:function(){
	         	parent.$("#tableList").bootstrapTable("refresh");
	         	var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.closeAll(); 
 			}
 		});
 	} else {
 		$("#btnClose").show();
 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 			type:"zbjgtz", 
 			businessId:id, 
 			status:3
 		});
 	}
 	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	//预览中标通知书
	$("#winningBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览中标通知书';
		var fileUrl=winnerData[index].resultNoticeItemFiles
		if(winnerData[index].id){
			if(winnerData[index].isCompile){
				preView(winnerData[index].resultNotic)
			}else if(!(winnerData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}
		}else{
			parent.layer.alert('还未编辑中标通知书！',{icon:7,title:'提示'})
		}
		
		
	});
	//预览落标通知书
	$("#failBid").on('click','.btn_view',function(){
		var index = $(this).attr('data-index');
		var titles = '预览结果通知书';
		var fileUrl=failData[index].resultNoticeItemFiles
		if(failData[index].id){
			if(failData[index].isCompile){
				preView(failData[index].resultNotic)
			} else if(!(failData[index].isCompile)){
				previewPdf(fileUrl[0].url);
			}
		}else{
			parent.layer.alert('还未编辑结果通知书！',{icon:7,title:'提示'})
		}
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
	            	viewPdf(data.data);
	            }
	        }
	    });
	}
})


/*中标人
 * data：中标人数据
 * type：缴纳方式 1. 固定金额、2.固定比例、3标准累进制
 * code：标段类型  A 工程 B 货物 C 服务
 * discount： 优惠系数
 */
function setWinner(data,type,code,discount,changeValue){
//	console.log(data)
	var html = '';
	var unit = '';
	if(data[0].priceUnit == 1){
		unit = '（万元/人民币）';
		$("#priceUnitTxt").html("万元");
	}else if(data[0].priceUnit == 0){
		unit = '（元/人民币）';
		$("#priceUnitTxt").html("元");
	}
	if(data[0].priceCurrency == "156"){
		$("#priceCurrencyTxt").html("人民币");
	}
	$('#winnerList').html('');
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th th style="min-width: 200px;text-align: left;">中标人名称</th>'
	if(bidderPriceType == 9){
		html +=	'<th style="width: 150px;text-align: left;">'+rateName+'('+rateUnit+')'+'</th>'
	}	
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
			+'<td>'+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+'<input type="hidden" name="" value="'+data[i].winCandidateId+'"/></td>'
		if(bidderPriceType == 9){
			html +=	'<td style="width: 150px;text-align: right;">'+data[i].otherBidPrice+'</td>'
		}	
		html +='<td style="width: 150px;text-align: right;">'+data[i].bidPrice+'</td>'
			+'<td style="width: 200px;text-align: center;">'+options+'</td>'
			+'<td style="width: 150px;text-align: right;" class="serviceMoney">'+data[i].serviceFee+'</td>'
			+'<td style="width: 150px;text-align: right;" class="payMoney">'+data[i].newServiceFee+'</td>'
			+'<td style="width: 200px;text-align: center;" class="reason">'+(data[i].reason?data[i].reason:'')+'</td>'
			if(data[i].pwServiceFee || data[i].pwServiceFee == 0){
			html += '<td style="text-align: right;" class="payMoney">'+(data[i].pwServiceFee?data[i].pwServiceFee:'')+'</td>'
				+'<td style="text-align: center;" class="reason">'+(data[i].pwReson?data[i].pwReson:'')+'</td>';
			}
		+'</tr>';
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
		if(data[i].isCompile==undefined||data[i].isCompile){
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
				+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
				+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
				+"<td style='width: 100px;text-align: center;'>是</td>"
				+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
				+"<td style='width: 150px;text-align: center;'>"
					+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
				+"</td>"
			+"</tr>";
		}else{
			html += "<tr data-id='"+data[i].winCandidateId+"' class='tbody'>"
			+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
			+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
			+"<td style='width: 100px;text-align: center;'>是</td>"
			+"<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
			+"<td style='width: 150px;text-align: center;'>"
				+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
			+"</td>"
		+"</tr>";
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
			if(dataSource.bidSectionId){
				RenameData = getBidderRenameMark(dataSource.bidSectionId);//投标人更名信息
				getBidInfo(dataSource.bidSectionId);
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
				}if(dataSource.payType	== 3){
					payType = ' 标准累进制';
				};
				$('#payType').html(payType);
            	$("#" + key).html(dataSource[key]);
            	$("#tenderProjectType").html(getTenderType(dataSource.tenderProjectType));
				if(dataSource.isManual == 0){
					$('#isManual').html('手动')
				}else if(dataSource.isManual == 1){
					$('#isManual').html('自动')
				}
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
			$('#countProcess').html(process(dataSource.rules))
			setWinner(winnerData,winnerPayType,tenderProjectClassifyCode,discount);
			winnerNoticeHtml(winnerData);
			failNoticeHtml(failData,winnerData.length)
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
		if(data[i].isCompile==undefined||data[i].isCompile){	
			html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
				+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
				+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
				+"<td style='width: 100px;text-align: center;'>否</td>"
				+"<td style='width: 150px;text-align: center;' class='states'>"+(data[i].resultNotic?'<span style="color:green;">已编辑</span>':'未编辑')+"</td>"
				+"<td style='width: 150px;text-align: center;'>"
					+"<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
					+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
				+"</td>"
			+"</tr>";
			}else{
				html += "<tr class='fail_tbody' data-id='"+data[i].winCandidateId+"'>"
				+"<td style='width: 50px;text-align: center;'>"+(i+1)+"</td>"
				+"<td>"+showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice')+"</td>"
				+"<td style='width: 100px;text-align: center;'>否</td>"
				+"<td style='width: 150px;text-align: center;' class='states'>"+(!(data[i].isCompile)?'<span style="color:green;">已上传</span>':'未编辑')+"</td>"
				+"<td style='width: 150px;text-align: center;'>"
					+"<input type='hidden' class='failItems'  name='resultNoticeItems["+(Number(len)+i)+"].id' value='"+(data[i].id?data[i].id:'')+"'/>"
					// +"<button type='button' id='fileUp' class='btn btn-primary btn-sm btn_uplode' data-index='"+i+"' class='"+!(data[i].isCompile)+"?none':''><span class='glyphicon glyphicon-editglyphicon'>重新上传</span></button>"
					+"<button type='button' class='btn btn-primary btn-sm btn_view' data-index='"+i+"'><span class='glyphicon glyphicon-eye-open'></span>预览</button>"
				+"</td>"
			+"</tr>";
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
}