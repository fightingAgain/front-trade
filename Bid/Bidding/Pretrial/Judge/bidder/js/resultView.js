var detailUrl = config.tenderHost + '/BidWinNoticeController/getAndFileYuShen.do';//编辑时信息反显接口
var bidId = '';//标段id
var dataId = '';//标段id
var pretrialCheckType = '';//预审评审办法
$(function(){
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段
	dataId = $.getUrlParam('id');//公告列表中带过来的数据id
	pretrialCheckType = $.getUrlParam('pretrialCheckType');//预审评审办法
	
	//var js = getBidOpenId()
	//dataId = js.id
	if($.getUrlParam('isFromConsole')=="1"){
		
	}
	
	
	
	getDetail(dataId,bidId,"");
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})
//反显
/*function getDetail(id,bidId,type){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': dataId,
			'bidSectionId': bidId
		},
		success: function(data){
			if(data.success){
				var dataSource = data.data;
				if(passedApplicantList){
					$('#passedApplicantList').html(dataSource.passedApplicantList);
				}else{
					$('.isPublish').hide()
				}
				
				bidderHtml(dataSource.bidWinCandidates);
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}*/
function bidderHtml(data){
	
	$('#bidResult').html('');
	var html = '';
	var priceUnit = '';
	if(data[0].priceUnit == 0){
		priceUnit = '（元）'
	}else if(data[0].priceUnit == 1){
		priceUnit = '（万元）'
	};
	html = '<thead><tr>'
	html += '<th style="width: 50px;text-align: center;">序号</th>'
	html += '<th style="min-width: 200px;white-space: normal;">投标人</th>'
	html += '<th style="min-width: 150px;white-space: normal;">组织机构代码</th>'
	if(pretrialCheckType == 2){
		html += '<th style="width: 80px;white-space: normal;">得分</th>'
	}
	html += '<th style="width: 100px;text-align: center;">是否合格</th>'
	html += '<th style="min-width: 300px;white-space: normal;">修改原因</th>'
	html += '</tr></thead><tbody>'
	for(var i = 0;i<data.length;i++){
		
		if(!data[i].reason){
			data[i].reason = '';
		};
		var option1 = '';
		var isCandidate = false;
		var disable = '';
		
		var option2 = '';
		var isQual = '';
		if(data[i].isWinBidder){
			isQual = data[i].isWinBidder;
		}else{
			if(data[i].isKey){
				isQual = data[i].isKey;
			}
		}
		if(isQual == 0){
			option2 = '不合格';
		}else if(isQual == 1 || isQual == ''){
			option2 = '合格';
		};
		
		html += '<tr>'
		html += '<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
		html += '<td style="min-width: 200px;white-space: normal;">'+data[i].winCandidateName+'</td>'
		html += '<td style="min-width: 150px;white-space: normal;">'+(data[i].winCandidateCode?data[i].winCandidateCode:'')+'</td>'
		if(pretrialCheckType == 2){
			html += '<td style="width: 80px;white-space: normal;">'+(data[i].score?data[i].score:'')+'</td>'
		}
		html += '<td style="width: 100px;text-align: center;" data-id="'+data[i].winCandidateId+'" data-iskey="'+data[i].isKey+'">'+option2+'</td>'
		html += '<td style="min-width: 300px;white-space: normal;">'+(data[i].remark?data[i].remark:'')+'</td>'
		html += '</tr>'
	}
	html += '</tbody>';
	$(html).appendTo('#bidResult');
		
};




/*获通知id*/
function getBidOpenId() {
	var id;
	$.ajax({
		type: "get",
		url: config.tenderHost + '/UnderLineReportController/findSubmitReportByBidId.do',
		async: false,
		data: {
			"bidSectionId": bidId,
			"examType": 1,
		},
		success: function(data) {
			if(data.success) {
				
				var js = data.data
				isThrough = (js.reportState == 2 ? 1 : 0)
				passView(js)
				id = js.id
			}

		}

	});
	return id;
}

var detailUrl = config.tenderHost + '/BidWinNoticeController/findResultsExamByBidId.do';//编辑时信息反显接口
function getDetail(id,bidId,type){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'bidSectionId': bidId
		},
		success: function(data){
			if(data.success){
				var dataSource = data.data;
				if(passedApplicantList){
					$('#passedApplicantList').html(dataSource.passedApplicantList);
				}else{
					$('.isPublish').hide()
				}
				bidderHtml(dataSource.bidWinCandidates);
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}