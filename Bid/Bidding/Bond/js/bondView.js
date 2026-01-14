//var reviseUrl = config.tenderHost + '/DepositController/get.do';//获取保证金凭据
var listUrl = config.tenderHost + '/DepositController/findBidderDepositList.do';//投标人递交保证金凭证列表
var bidUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//根据标段id获取详情
var timeUrl = config.tenderHost + '/BidSectionController/getBidSectionDateInfo.do';//查询标段相关时间
var datailHtml = 'Bidding/Bond/model/bondDetail.html';//查看详情
 var bidId = '';//标段id
 var listData;//投标人递交保证金凭证列表数据
 var rowData ;
 var timeState;//时间状态 开标时间为空：0 开标时间范围内：1 未开标
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		bidId = $.getUrlParam('id')
	};
	/* if($.getUrlParam('timeState') && $.getUrlParam('timeState') != undefined){
		timeState = $.getUrlParam('timeState')
	}; */
	//预览
	/*$('#preview_voucher').click(function(){
		var filePath = $(this).attr('data-url'); 
		previewPdf(filePath)
	})*/
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
})
function passMessage(data){
	if(data.getForm && data.getForm == 'KZT'){
		rowData = getBidInfo(data.bidSectionId);
		rowData.userName = rowData.tenderAgencyLinkmen
//		console.log(rowData)
	}else{
		
		rowData = data;
	}
	isShowSupplierInfo(data.bidSectionId, '2', 'deposit', function(data, html){
		if(data.isShowSupplier == 1 || data.isShowBidFile == 1){
			getList(data.bidSectionId);
		}else{
			$("#bondList").closest('div').html(html)
		}
	})
	getTime(data.bidSectionId,2);
	//查看
	$('#bondList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		rowData.depositChannel = listData[index].depositChannel;
		rowData.money = listData[index].depositMoney;
		rowData.bidderManager = listData[index].bidderManager;
		rowData.bidderTel = listData[index].bidderTel;
		rowData.bondId = listData[index].id;
		rowData.timeState = timeState;
		if(listData[index].projectAttachmentFiles){
			rowData.projectAttachmentFiles = listData[index].projectAttachmentFiles;
		}
		if(listData[index].bidderLink){
			rowData.bidderLink = listData[index].bidderLink;
		}
		if(listData[index].bidderPhone){
			rowData.bidderPhone = listData[index].bidderPhone;
		}
		if(listData[index].bidderFax){
			rowData.bidderFax = listData[index].bidderFax;
		}
		if(listData[index].bidderAddress){
			rowData.bidderAddress = listData[index].bidderAddress;
		}
		if(listData[index].remarks){
			rowData.remarks = listData[index].remarks;
		}
		openDetail(rowData)
	});
	var depositType = '';
	var money = '';
	if(rowData.depositType == 1){
		depositType = '固定金额';
		money = rowData.depositMoney;
	}else if(rowData.depositType == 2){
		depositType = '比例';
		money = rowData.depositRatio+'%';
		$('.bond_unit').css({'display':'none'});
	};
	for(var key in rowData){
		$('#'+key).html(rowData[key])
	}
	$('#depositType').html(depositType);
	$('#depositMoney').html(money);
	
}

function openDetail(data){
	parent.layer.open({
		type: 2,
		title: "投标保证金详情查看",
		area: ['80%', '80%'],
		content: datailHtml,
		resize: false,
		success: function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.getFromFather(data); 
		}
	});
}
function getList(dataId){
	$.ajax({
		type:"post",
		url:listUrl,
		async:true,
		data: {
			'bidSectionId':dataId
		},
		success: function(data){
			if(data.success){
				if(data.data && data.data.length>0){
					listData = data.data;
					bondList(data.data)
				}
			}
		}
	});
}
function bondList(data){
	var html = '';
	$('#bondList').html('');
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th>投标人名称</th>'
		+'<th style="width: 150px;text-align: center;">保证金缴纳方式</th>'
		+'<th style="width: 150px;text-align: right;">保证金金额（元）</th>'
		+'<th style="width: 150px;text-align: center;">状态</th>'
		+'<th style="width: 200px;text-align: center;">递交时间</th>'
		+'<th style="width: 50px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		var method = '';
		var state = '';
		if(data[i].depositChannel == 1){
			method = '资金现金'
		}else if(data[i].depositChannel == 2){
			method = '银行保函'
		}else if(data[i].depositChannel == 3){
			method = '担保'
		}else if(data[i].depositChannel == 4){
			method = '电汇'
		}else if(data[i].depositChannel == 5){
			method = '汇票'
		}else if(data[i].depositChannel == 6){
			method = '支票'
		}else if(data[i].depositChannel == 7){
			method = '虚拟子账户'
		}else if(data[i].depositChannel == 9){
			method = '其他'
		};
		if(data[i].depositStatus == 0){
			state = '临时保存'
		}else if(data[i].depositStatus == 1){
			state = '提交审核'
		}else if(data[i].depositStatus == 2){
			state = '<span style="color:green;">审核通过</span>'
		}else if(data[i].depositStatus == 3){
			state = '<span style="color:red;">审核未通过</span>'
		}else if(data[i].depositStatus == 4){
			state = '<span style="color:red;">已撤回</span>'
		}
		if(timeState == 0 || !timeState){
			data[i].depositMoney = '****'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].bidderName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+method+'</td>'
			+'<td style="width: 150px;text-align: right;">'+data[i].depositMoney+'</td>'
			+'<td style="width: 150px;text-align: center;">'+state+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].subTime+'</td>'
			+'<td style="width: 50px;text-align: center;">'
				+'<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+i+'">'
					+'<span class="glyphicon glyphicon-eye-open"></span>查看'
				+'</button>'
			+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#bondList')
	
}
function getBidInfo(id){
	var bidInfo = {}
	$.ajax({
		type:"post",
		url:bidUrl,
		async:false,
		data:{
			'id': id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					bidInfo = data.data;
				}
				
			}
		}
	});
	return bidInfo
}

/**********************    获取时间相关信息           **********************/
function getTime(ids,type){
	$.ajax({
		type:"post",
		url:timeUrl,
		async:false,
		data: {
			'bidSectionId': ids,
			'examType': type
		},
		success: function(data){
			if(data.success){
				//获取当前时间
				nowTime = Date.parse(new Date((top.$("#systemTime").html() + " " + top.$("#sysTime").html()).replace(/\-/g,"/")));
				var bidOpenTime = Date.parse(new Date(data.data.bidOpenTime.replace(/\-/g,"/")))
				if(bidOpenTime <  nowTime){
					timeState = 1;
				}else{
					timeState = 0
				}
			}else{
				top.layer.alert(data.message);
			}
		}
	});
}