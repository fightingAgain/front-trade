
var detailUrl = config.tenderHost + '/ResultNoticeController/findPretrialResultNoticeInfo.do';//详情
var detUrl = config.tenderHost + '/ResultNoticeController/findPretrialResultNotice.do';

var editHtml = 'Bidding/Pretrial/Judge/judgeResultNotice/model/viewNotice.html';//编辑
var dataId = '';//数据Id
var bidId = '';//标段id
var biderData = [];//投标人
var isThrough;
var source = 0; //链接来源  0:查看  1审核
var examType;
$(function(){	
	
	/* if ($.getUrlParam('id') && $.getUrlParam('id') != undefined) {
		dataId = $.getUrlParam('id');//公告列表中带过来的标段
		if($.getUrlParam('isFromConsole')=="1"){
			examType = $.getUrlParam('examType')
			dataId= getNoticeId()
		} 
	}else{
		getBidder(bidId)
	} */
	
	/*$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId:dataId, 
		status:3,
		type:"ysjgtz",
		checkState:isThrough
	});*/
	//查看
	$('html').on('click', '.btnEdit', function () {
		var index = $(this).attr('data-index');
		openEdit(index)
	});
	//关闭
	$('html').on('click', '#btnClose', function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	

	/*
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});*/
	//打印
	/*$('document').on('click','.btnPrint',function(){
		var index = $(this).attr('data-index');
		var oldContent = document.body.innerHTML;
		document.body.innerHTML = biderData[index].resultNotic;
		window.print();
		document.body.innerHTML = oldContent;
	})*/
	

})
function printbox(index) {
	var oldContent = document.body.innerHTML;
	document.body.innerHTML = biderData[index].resultNotic;
	document.title = biderData[index].winCandidateName + '预审结果通知';
	window.print();
	document.body.innerHTML = oldContent;
}
function openEdit(num) {
	var title = '';
	if (biderData[num].isWinBidder == 1) {
		title = '查看预审合格通知书'
	} else if (biderData[num].isWinBidder == 0) {
		title = '查看预审不合格通知书'
	}
	parent.layer.open({
		type: 2,
		title: title,
		area: ['80%', '80%'],
		content: editHtml,
		resize: false,
		success: function (layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(biderData[num])
//			if(!data.id){
				//调用子窗口方法，传参
//			}
			//			if(!data.id){
			//调用子窗口方法，传参
			//			}
		}
	});
}

function passMessage(data) {
	isThrough = $.getUrlParam("isThrough");
	if(data.getForm && data.getForm == "KZT"){
		bidId = $.getUrlParam('id');//公告列表中带过来的标段
		getDetail();
		data.checkEndDate = data.examCheckEndDate
	}else{
		dataId = $.getUrlParam('id');//公告列表中带过来的标段
		// dataId = data.id;
		getDetail(dataId);
	}
	if ($.getUrlParam("source") && $.getUrlParam("source") != "undefined") {
		source = $.getUrlParam("source");
		if (source == 1) {
			$("#btnClose").hide();
			$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
				type: "ysjgtz",
				businessId: dataId,
				status: 2,
				submitSuccess: function () {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.closeAll();
					parent.layer.alert("审核成功", { icon: 7, title: '提示' });
					parent.$("#projectList").bootstrapTable("refresh");
	 			}
	 		});
	 	} else {
	 		$("#btnClose").show();
	 		$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
	 			type:"ysjgtz", 
	 			businessId:dataId, 
	 			status:3,
	 			checkState:isThrough
	 		});
	 	}
	}
	for (var key in data) {
		$('#' + key).html(data[key])
	}
}
//详情
function getDetail(id) {
	var postUrl = "";
	var postData = {};
	if(id){
		postUrl = detailUrl;
		postData.id = id;
	}else{
		postUrl = detUrl;
		postData.bidSectionId = bidId;
		postData.examType = 1;
	}
	$.ajax({
		type: "post",
		url: postUrl,
		async: true,
		data:postData,
		success: function (data) {
			if (data.success) {
				if (!data.data) {
					return;
				};
				var arr = data.data;
				bidId = arr.bidSectionId;
				if(!dataId && arr){
					dataId = arr.id;
				}
				for (var key in arr) {
					$('#' + key).html(arr[key])
				}
				if(arr){
					if (data.data.resultNoticeItems && data.data.resultNoticeItems.length > 0) {
						biderData = data.data.resultNoticeItems;
						bidderHtml(data.data.resultNoticeItems);
					}
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}

function bidderHtml(data) {
	var html = '';
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	$('#bidResult').html('');
	html += '<thead><tr>'
		+ '<th style="width: 50px;text-align: center;">序号</th>'
		+ '<th style="min-width: 200px;white-space: normal;">投标人</th>'
		+ '<th style="min-width: 150px;white-space: normal;">组织机构代码</th>'
		+ '<th style="width: 100px;text-align: center;">是否合格</th>'
		+ '<th style="min-width: 200px;white-space: normal;">修改原因</th>'
		+ '<th style="min-width: 80px;white-space: normal;">状态</th>'
		+ '<th style="min-width: 150px;white-space: normal;">操作</th>'
		+ '</tr></thead><tbody>';
	for (var i = 0; i < data.length; i++) {
		var btn = '';
		if (data[i].id) {
			btn = '<button type="button" class="btn btn-primary btn-sm btnPrint" onclick="printbox(' + i + ')" data-index="' + i + '"><span class="glyphicon glyphicon-saved"></span>打印</button>';
		}
		html += '<tr>'
			+ '<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>'
			+ '<input type="hidden" name="resultNoticeItems[' + i + '].id" value="' + (data[i].id ? data[i].id : '') + '"/>'
			+ '<td style="min-width: 200px;white-space: normal;">' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>'
			+ '<td style="min-width: 150px;white-space: normal;">' + (data[i].winCandidateCode ? data[i].winCandidateCode : '') + '</td>'
			+ '<td style="width: 100px;text-align: center;">' + (data[i].isWinBidder == 1 ? '是' : '否') + '</td>'
			+ '<td style="min-width: 200px;white-space: normal;">' + (data[i].remark == 1 ? data[i].remark : '/') + '</td>'
			+ '<td style="min-width: 80px;white-space: normal;">' + (data[i].id ? '已编辑' : '<span style="color:red;">未编辑</span>') + '</td>'
			+ '<td style="min-width: 150px;white-space: normal;">'
			+ '<button type="button" class="btn btn-primary btn-sm btnEdit"  data-index="' + i + '"><span class="glyphicon glyphicon-saved"></span>查看</button>' + btn
			+ '</td>'
			+ '</tr>'
	}
	html += '</tbody>'
	$(html).appendTo('#bidResult')
}




/*获通知id*/
/* function getNoticeId() {
	var str;
	$.ajax({
		type: "get",
		url: config.tenderHost + '/ResultNoticeController/findPretrialResultNotice.do',
		async: false,
		data: {
			bidSectionId: bidId,
			examType:examType
		},
		success: function(data) {
			if(data.success) {
				str = data.data.id
			}
		}
	});
	return str;
} */