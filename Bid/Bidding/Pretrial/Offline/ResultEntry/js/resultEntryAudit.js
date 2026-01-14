/**
*  zhouyan 
*  2019-4-30
*  线下评审结果录入
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + '/UnderLineReportController/findSubmitReport.do';
var tableUrl = config.tenderHost + '/UnderLineReportController/findOfflineCheckResult.do';


var examType = '1';//资格审查方式 1为资格预审，2为资格后审
var bidId='';//标段Id
var fileUploads = null;
var reportId = '';//评标报告id
var source = '';// 1 审核  0 查看
var statu;//2 审核 3 查看
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		reportId = $.getUrlParam('id');
	}
	source = $.getUrlParam('source');//公告列表中带过来的标段Id
	if(source == 1){
		statu = 2
	}else if(source == 0){
		statu = 3
	}
	getDetail(reportId,1);
	
//	getJudges();
	
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:reportId, 
		status:statu,
		type:"yspsbgsp",
		submitSuccess: function(){
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.closeAll();
			parent.layer.alert("审核成功", {
				icon: 7,
				title: '提示'
			});
			parent.$("#projectList").bootstrapTable("refresh");
			/*var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index)*/
		}
	});
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//预览
	$("#preview").click(function(){
		var path = $(this).closest('td').find('#fileUrl').val();
		previewPdf(path)
	})
	
});
function passView(data){
	for(var key in data){
		if(data.checkType == 1){
			data.checkType = '综合评估法-无技术标'
		}else if(data.checkType == 2){
			data.checkType = '综合评估法-技术标合格制'
		}else if(data.checkType == 3){
			data.checkType = '综合评估法-技术标打分制'
		}else if(data.checkType == 99){
			data.checkType = '经评审的最低投标价法'
		}
		$('#'+key).val(data[key])
	}
}
/*//获取评委信息
function getJudges(){
	$.ajax({
		type:"post",
		url:judgesUrl,
		async:true,
		data: {
			'packageId': bidId,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				judgesHtml(data.data)
			}
		}
	});
};
function judgesHtml(data){
	$('#judges tbody').html('');
	var html = '';
	for(var i = 0;i<data.length;i++){
		if(data[i].expertType == 1){
			data[i].expertType = '在库专家'
		}else if(data[i].expertType == 2){
			data[i].expertType = '招标人代表'
		};
		var inpt = '';
		if(data[i].isChairMan && data[i].isChairMan == 1){
			inpt = '<span style="color:green">是</span>';
		}else{
			inpt = '<span style="color:red">否</span>';
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].expertName+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].expertType+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].expertTel+'</td>'
			+'<td style="width: 200px;text-align: center;">'+getOptionValue('identityCardType',data[i].identityCardType)+'</td>'
			+'<td style="width: 300px;text-align: center;">'+data[i].identityCardNum+'</td>'
			+'<td style="width: 80px;text-align: center;">'+inpt+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#judges tbody');
}*/


function bidderHtml(data){
	$('#bidResult tbody').html('');
	var html = '';
	for(var i = 0;i<data.length;i++){
		if(!data[i].otherBidPrice){
			data[i].otherBidPrice = '';
		};
		if(!data[i].supplierOrder){
			data[i].supplierOrder = '';
		};
		if(!data[i].score){
			data[i].score = '';
		};
		if(!data[i].reason){
			data[i].reason = '';
		};
		/* var option1 = ''
		if(!data[i].isBidWinCandidate){
			option1 = '<span style="color:red">否</span>'
		}else if(data[i].isBidWinCandidate && data[i].isBidWinCandidate == 1){
			option1 = '<span style="color:green">是</span>'
		}; */
		var option2 = ''
		if(data[i].isKey == 0 || !data[i].isKey){
			option2 = '<span style="color:red">淘汰</span>'
		}else if(data[i].isKey == 1){
			option2 = '<span style="color:green">未淘汰</span>'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].bidderName+'</td>'
			+'<td style="width: 80px;text-align: center;">'+data[i].supplierOrder+'</td>'		//投标人排名
			+'<td style="width: 80px;text-align: center;">'+data[i].score+'</td>'		//最终分值
			/* +'<td style="width: 90px;text-align: center;">'+option1+'</td>'
			+'<td style="width: 180px;text-align: center;" class="quoted_price">'+data[i].bidPrice+'</td>' */
			+'<td style="width: 110px;text-align: center;">'+option2+'</td>'
			+'<td>'+data[i].reason+'</td>'		//淘汰原因
		+'</tr>';
	}
	$(html).appendTo('#bidResult tbody');
};
//反显
function getDetail(id,type){
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			businessId: reportId,
			status:2
		});
	}
	$.ajax({
		type:"post",
		url:detailUrl,
		async:false,
		data: {
			'id': id,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				var dataSource = data.data;
				for(var key in dataSource){
	            	$("[name=" + key+"]").val(dataSource[key]);
	          	};
	          	if(dataSource.fileUrl && dataSource.fileUrl != ''){
	          		$('#fileUrl').val(dataSource.fileUrl);
	          		$("#fileName").html(dataSource.noticeName);
					$('#preview').css('display','inline-block');
	          	}
	          	if(dataSource.projectAttachmentFiles){
	          		fileUploads.fileHtml(dataSource.projectAttachmentFiles);
	          	}
	          	
	          	getBidder(dataSource.bidSectionId)
			}
		}
	});
};
//获取投标人信息
function getBidder(id){
	$.ajax({
		type:"post",
		url: tableUrl,
		async:false,
		data: {
			'bidSectionId': id,
			'examType': examType
		},
		success: function(data){
			bidderHtml(data.data)
			/*if(data.success){
				var dataSource = data.data;
				for(var key in dataSource){
	            	$("[name=" + key+"]").val(dataSource[key]);
	          	}
			}*/
		}
	});
}

