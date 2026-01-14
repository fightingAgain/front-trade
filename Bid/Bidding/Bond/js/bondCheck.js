/**
*  zhouyan 
*  2019-5-28
*  投标保证金确认
*  方法列表及功能描述
*/
var fileUploads = null;
var saveUrl = config.tenderHost + '/DepositController/confirmBidderDeposit.do';//提交接口
var historyUrl = config.tenderHost + '/DepositController/selectConfirmList.do';//请求操作记录数据接口
var bidId = '';//标段id

$(function(){
	/*关闭*/
	/*$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});*/
});
function getBaseInfo(data,callback){
//	console.log(data)
	if(data.depositStatus == 2 || data.depositStatus == 3 || data.depositStatus == 4){
		$('#btnSubmit').css('display','none');
		$('#btnReject').css('display','none');
	}
	bidId = data.bidSectionId;
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: data.depositId,
			status:2,
			isPreview: true,    //false不可预览   true可预览
		});
	}
	if(data.timeState == 1){
		$('#btnSubmit').css('display','none');
		$('#btnReject').css('display','none');
	}
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
	if(data.depositChannel == 1){
		data.depositChannel = '资金现金'
	}else if(data.depositChannel == 2){
		data.depositChannel = '银行保函'
	}else if(data.depositChannel == 3){
		data.depositChannel = '担保'
	}else if(data.depositChannel == 4){
		data.depositChannel = '电汇'
	}else if(data.depositChannel == 5){
		data.depositChannel = '汇票'
	}else if(data.depositChannel == 6){
		data.depositChannel = '支票'
	}else if(data.depositChannel == 7){
		data.depositChannel = '虚拟子账户'
	}else if(data.depositChannel == 9){
		data.depositChannel = '其他'
	};
	
	for(var key in data){
//		if(data.timeState != 1){
//			data.money = '****'
//		}
		$('#'+key).html(data[key])
	}
	$('#depositType').html(depositType);
	$('#depositMoney').html(money);
	if(data.projectAttachmentFiles){
		fileUploads.fileHtml(data.projectAttachmentFiles);
	};
	getHistory(data.bondId)
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//确认
	$('#btnSubmit').click(function(){
		save(data.bondId,1,callback)
	});
	//驳回
	$('#btnReject').click(function(){
		save(data.bondId,0,callback)
	});
	
}
/*
 * isSave: 0 驳回 1确认
 */
function save(id,isSave,callback){
	var obj = {};
	obj.id = id;
	if(isSave == 0){
		obj.depositStatus = 3;
		parent.layer.prompt({formType: 2,title: '请输入驳回理由',area: ['300px', '100px']},function(value, ind, elem){
		  	if(value == ''){
		  		parent.layer.alert('请输入驳回理由!');
		  	}else{
		  		obj.rejectReason = value;
		  		parent.layer.close(ind);
		  		$.ajax({
					type:"post",
					url:saveUrl,
					async:true,
					data: obj,
					success: function(data){
						if(data.success){
							callback(bidId);
							var index=parent.layer.getFrameIndex(window.name);
			            	parent.layer.close(index);
						}else{
							parent.layer.alert(data.message);
						}
					}
				});
		  	}
		});
	}else if(isSave == 1){
		obj.depositStatus = 2;
		$.ajax({
			type:"post",
			url:saveUrl,
			async:true,
			data: obj,
			success: function(data){
				if(data.success){
					callback(bidId);
					var index=parent.layer.getFrameIndex(window.name);
	            	parent.layer.close(index);
				}else{
					parent.layer.alert(data.message);
				}
			}
		});
	};
	
	
}
//请求操作记录数据
function getHistory(id){
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'bidderDepositId':id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					historyTable(data.data)
				}
			}
		}
	});
};
//操作记录表格
function historyTable(data){
	var html = '';
	$('#recordList').html('');
	html = '<tr>'
		+'<th style="width: 50px;text-align: center;">序号</th>'
		+'<th style="width: 150px;text-align: center;">操作人</th>'
		+'<th style="width: 100px;text-align: center;">缴纳状态</th>'
		+'<th style="width: 150px;text-align: center;">操作时间</th>'
//		+'<th style="width: 150px;text-align: center;">审批人</th>'
		+'<th style="width: 150px;text-align: center;">审核时间</th>'
		+'<th>备注</th>'
	+'</tr>';
	for(var i = 0;i<data.length;i++){
		var state = '';
		if(data[i].depositStatus == 0){
			state = '未提交'
		}else if(data[i].depositStatus == 1){
			state = '提交审核'
		}else if(data[i].depositStatus == 2){
			state = '审核通过'
		}else if(data[i].depositStatus == 3){
			state = '审核不通过'
		}else if(data[i].depositStatus == 4){
			state = '撤回'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="width: 150px;text-align: center;">'+data[i].confirmName+'</td>'
			+'<td style="width: 100px;text-align: center;">'+state+'</td>'
			+'<td style="width: 150px;text-align: center;">'+(data[i].createTime?data[i].createTime:'')+'</td>'
//			+'<td style="width: 150px;text-align: center;">'+(data[i].confirmName?data[i].confirmName:'')+'</td>'
			+'<td style="width: 150px;text-align: center;">'+(data[i].confirmTime?data[i].confirmTime:'')+'</td>'
			+'<td>'+(data[i].reason?data[i].reason:'')+'</td>'
		+'</tr>'
	}
	$(html).appendTo('#recordList')
}