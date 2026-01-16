/**

*  确认投标保证金的供应商列表
*  方法列表及功能描述
*/
var sureHtml = 'Bidding/Bond/model/bondCheck.html';
var listUrl = config.tenderHost + '/DepositController/findBidderDepositList.do';//投标人递交保证金凭证列表
var listData;//投标人递交保证金凭证列表数据
var rowData ;
var bidId = '';//标段id
var timeState;//时间状态 开标时间为空：0 开标时间范围内：1 未开标
var RenameData;//投标人更名信息
$(function(){
	if($.getUrlParam('timeState') && $.getUrlParam('timeState') != undefined){
		timeState = $.getUrlParam('timeState')
	};
	
});
function passToChild(data){
//	console.log(data)
	RenameData = getBidderRenameMark(data.bidSectionId);//投标人更名信息
	getList(data.bidSectionId);
	bidId = data.bidSectionId;
	rowData = data;
	var depositType = '';
	var money = '';
	if(data.depositType == 1){
		depositType = '固定金额';
		money = data.depositMoney;
	}else if(data.depositType == 2){
		depositType = '比例';
		money = data.depositRatio+'%';
		$('.bond_unit').css({'display':'none'});
	};
	for(var key in data){
		$('#'+key).html(data[key])
	}
	$('#depositType').html(depositType);
	$('#depositMoney').html(money);
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	$('#tenderList').on('click','.btnView',function(){
		var index = $(this).attr('data-index');
		rowData.depositStatus = $(this).attr('data-state');
//		console.log(listData[index])
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
		bondSure(rowData)
	})
}
function bondSure(data){
	parent.layer.open({
		type: 2,
		title: '确认投标保证金',
		area: ['80%', '80%'],
		content: sureHtml,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			//调用子窗口方法，传参
			iframeWin.getBaseInfo(data,getList); //调用子页面方法并传参
		}
	});
}
function getList(dataId){
	$.ajax({
		type:"post",
		url:listUrl,
		async:true,
		data: {
			'bidSectionId':dataId,
			'isCheck':1,//是否是财务人员  为1是
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
	$('#tenderList').html('');
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th style="min-width:150px;">投标单位</th>'
		+'<th style="width: 150px;text-align: center;">缴纳方式</th>'
//		+'<th style="width: 150px;text-align: center;">截标时间</th>'
		+'<th style="width: 150px;text-align: center;">确认状态</th>'
		+'<th style="width: 200px;text-align: center;">确认时间</th>'
		+'<th style="width: 50px;text-align: center;">操作</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		var method = '';
		var state = '';
		if(data[i].depositChannel){
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
				method = '支票	'
			}else if(data[i].depositChannel == 7){
				method = '虚拟子账户'
			}else if(data[i].depositChannel == 9){
				method = '其他'
			};
		}
		
		if(data[i].depositStatus == 0){
			state = '未确认'
		}else if(data[i].depositStatus == 1){
			state = '未确认'
		}else if(data[i].depositStatus == 2){
			state = '<span style="color:green;">已确认</span>'
		}else if(data[i].depositStatus == 3){
			state = '<span style="color:red;">驳回</span>'
		}else if(data[i].depositStatus == 4){
			state = '<span style="color:orange;">已撤回</span>'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td  style="min-width:150px;">'+showBidderRenameMark(data[i].bidderId, data[i].bidderName, RenameData, 'addNotice')+'</td>'
			+'<td style="width: 150px;text-align: center;">'+method+'</td>'
//			+'<td style="width: 150px;text-align: center;">'+(data[i].checkStartDate?data[i].checkStartDate:'')+'</td>'
			+'<td style="width: 150px;text-align: center;">'+state+'</td>'
			+'<td style="width: 200px;text-align: center;">'+(data[i].confirmTime?data[i].confirmTime:'')+'</td>'
			+'<td style="width: 50px;text-align: center;">'
				+'<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+i+'" data-state="'+data[i].depositStatus+'">'
					+'<span class="glyphicon glyphicon-eye-open"></span>查看'
				+'</button>'
			+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#tenderList')
	
}