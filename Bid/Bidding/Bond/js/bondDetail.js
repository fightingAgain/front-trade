var fileUrl = config.FileHost + "/FileController/streamFile.do";		//H5上传地址
var flashFileUrl = config.FileHost + '/FileController/formDataFile.do';//flash上传的地址
var saveUrl = config.tenderHost + '/DepositController/save.do';//投标人保存与提交保证金凭据
var reviseUrl = config.tenderHost + '/DepositController/get.do';//获取保证金凭据

var historyUrl = config.tenderHost + '/DepositController/selectConfirmList.do';//请求操作记录数据接口

 var fileUploads = null;
 var employeeInfo = entryInfo();//当前登录人信息
 var bidId = '';//标段id
 var path = ''; //文件返回路径
 var id = '';//保证金凭据id 
$(function(){
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段Id
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		id = $.getUrlParam('id')
	}
	$('[name="bidSectionId"]').val(bidId);
	//文件上传
	
	//预览
	$('#preview_voucher').click(function(){
		var filePath = $(this).attr('data-url'); 
		previewPdf(filePath)
	})
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	
});
function getFromFather(data){
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: data.depositId,
			status:2,
			isPreview: true,    //false不可预览   true可预览
		});
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
	if(data.timeState == 0 || !data.timeState){
		data.money = '****';
		if(data.projectAttachmentFiles){
//			console.log(data.projectAttachmentFiles)
			fileTable(data.projectAttachmentFiles);
		}
	}else{
		if(data.projectAttachmentFiles){
			fileUploads.fileHtml(data.projectAttachmentFiles);
		}
	}
	for(var key in data){
		$('#'+key).html(data[key])
	}
	$('#depositType').html(depositType);
	$('#depositMoney').html(money);
	
	getHistory(data.bondId)
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
		+'<th >提交人</th>'
		+'<th style="width: 100px;text-align: center;">缴纳状态</th>'
		+'<th style="width: 200px;text-align: center;">操作时间</th>'
		+'<th style="width: 200px;text-align: center;">审批人</th>'
		+'<th style="width: 200px;text-align: center;">审核时间</th>'
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
			state = '驳回'
		}else if(data[i].depositStatus == 4){
			state = '撤回'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].userName+'</td>'
			+'<td style="width: 100px;text-align: center;">'+state+'</td>'
			+'<td style="width: 200px;text-align: center;">'+(data[i].createTime?data[i].createTime:'')+'</td>'
			+'<td style="width: 200px;text-align: center;">'+(data[i].confirmName?data[i].confirmName:'')+'</td>'
			+'<td style="width: 200px;text-align: center;">'+(data[i].confirmTime?data[i].confirmTime:'')+'</td>'
			+'<td>'+(data[i].reason?data[i].reason:'')+'</td>'
		+'</tr>'
	}
	$(html).appendTo('#recordList')
}
function fileTable(data){
	var html = '';
	$('#fileContent').html('');
	html= '<table class="table table-bordered">'
		+'<tr>'
			+'<td style="width: 50px;text-align: center;">序号</td>'
			+'<td>文件名</td>'
			+'<td style="width: 150px;text-align: center;">文件大小</td>'
			+'<td>上传者</td>'
			+'<td style="width: 150px;text-align: center;">创建时间</td>'
		+'</tr>';
	
	for(var i = 0;i<data.length;i++){
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].attachmentFileName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+changeUnit(data[i].attachmentSize)+'</td>'
			+'<td>'+data[i].createEmployeeName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+data[i].createDate+'</td>'
		+'</tr>'
	}
	html += '</table>';
	$(html).appendTo('#fileContent');
}
