var detailUrl = config.tenderHost + '/ResultNoticeController/findPretrialResultNoticeInfo.do'; //详情
var detUrl = config.tenderHost + '/ResultNoticeController/findPretrialResultNotice.do';
var biddersUrl = config.tenderHost + '/ResultNoticeController/findPretrialCandidate.do'; //新增时获取投标人
var saveUrl = config.tenderHost + '/ResultNoticeController/save.do'; //保存、提交

var editHtml = 'Bidding/Pretrial/Judge/judgeResultNotice/model/editNotice.html'; //编辑
var dataId = ''; //数据Id
var bidId = ''; //标段id
var biderData = []; //投标人
var bidName = ''; //标段名称
var isFromConsole;
var tenderProjectClassifyCode;
$(function() {
	bidId = $.getUrlParam('bidId'); //公告列表中带过来的标段
	isFromConsole = $.getUrlParam('isFromConsole');
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined && isFromConsole != "1") {
		dataId = $.getUrlParam('id'); //公告列表中带过来的标段
		//getDetail(dataId)
	} else {
		getBidder(bidId)
	}

	$('html').on('click', '.btnEdit', function() {
		var index = $(this).attr('data-index');
		openEdit(index)
	});

	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: dataId,
		status: 1,
		type: "ysjgtz",
	});
	//关闭
	$('html').on('click', '#btnClose', function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	})
	/*	$('#btnClose').click(function(){
			var index=parent.layer.getFrameIndex(window.name);
	        parent.layer.close(index);
	    })*/
	//保存
	$('html').on('click', '#btnSave', function() {
		saveInfo(false)
	})
	//提交
	$('html').on('click', '#btnSubmit', function() {
		var isAll = true;
		for(var i = 0; i < biderData.length; i++) {
			if(!biderData[i].id) {
				isAll = false
			}
		}
		if(!isAll) {
			parent.layer.alert('请编辑完所有通知书');
		} else {
			if($("#addChecker").length <= 0) {
				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认提交', {
					title: '提交审核',
					btn: [' 是 ', ' 否 '],
					yes: function(layero, index) {
						saveInfo(true)
					},
					btn2:function(index, layero) {
						parent.layer.close(index);
					}
				})
			}else{
				saveInfo(true)
			}
			
		}
	})
	//打印
	$('html').on('click', '.btnPrint', function() {
		var index = $(this).attr('data-index');
		var oldContent = document.body.innerHTML;
		document.body.innerHTML = biderData[index].resultNotic;
		window.print();
		document.body.innerHTML = oldContent;
	})
})

function openEdit(num) {
	//黑名单验证
	var parm = checkBlackList(biderData[num].winCandidateCode, tenderProjectClassifyCode, 'd');
	if(parm.isCheckBlackList) {
		parent.layer.alert(parm.message, {
			icon: 7,
			title: '提示'
		});
		return;
	}
	var titles = '';
	if(biderData[num].isWinBidder == 1) {
		titles = '编辑预审合格通知书';
	} else if(biderData[num].isWinBidder == 0) {
		titles = '编辑预审不合格通知书';
	}
	top.layer.open({
		type: 2,
		title: titles,
		area: ['80%', '80%'],
		content: editHtml,
		resize: false,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(biderData[num], refreshBidder, num)
			//			if(!data.id){
			//调用子窗口方法，传参
			//			}
		}
	});
}

function refreshBidder(data, num) {
	biderData[num] = data;
	bidderHtml(biderData)
}

function passMessage(data, callback) {
	if(data.getForm && data.getForm == "KZT") {
		getDetail();
		data.checkEndDate = data.examCheckEndDate
	} else {
		getDetail(dataId);
	}
	tenderProjectClassifyCode = data.tenderProjectClassifyCode;
	for(var key in data) {
		$('#' + key).html(data[key])
	}
	bidName = data.bidSectionName;
}
//详情
function getDetail(id) {
	var postUrl = "";
	var postData = {};
	if(id) {
		postUrl = detailUrl;
		postData.id = id;
	} else {
		postUrl = detUrl;
		postData.bidSectionId = bidId;
		postData.examType = 1;
	}
	$.ajax({
		type: "post",
		url: postUrl,
		async: true,
		data: postData,
		success: function(data) {
			if(data.success) {
				if(!dataId && data.data) {
					dataId = data.data.id;
				}
				if(data.data) { 
					bidId = data.data.bidSectionId;
					if(data.data.resultNoticeItems && data.data.resultNoticeItems.length > 0) {
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
//新增时获取投标人
function getBidder(id) {

	$.ajax({
		type: "post",
		url: biddersUrl,
		async: true,
		data: {
			'bidSectionId': id
		},
		success: function(data) {
			if(data.success) {
				if(data.data && data.data.length > 0) {
					biderData = data.data;
					bidderHtml(data.data);
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
	html += '<thead><tr>' +
		'<th style="width: 50px;text-align: center;">序号</th>' +
		'<th style="min-width: 200px;white-space: normal;">投标人</th>' +
		'<th style="min-width: 150px;white-space: normal;">组织机构代码</th>' +
		'<th style="width: 100px;text-align: center;">是否合格</th>' +
		'<th style="min-width: 200px;white-space: normal;">修改原因</th>' +
		'<th style="min-width: 80px;white-space: normal;">状态</th>' +
		'<th style="min-width: 150px;white-space: normal;">操作</th>' +
		'</tr></thead><tbody>';
	for(var i = 0; i < data.length; i++) {
		var btn = '';
		if(data[i].id) {
			btn = '<button type="button" class="btn btn-primary btn-sm btnPrint" data-index="' + i + '"><span class="glyphicon glyphicon-saved"></span>打印</button>';
		}
		html += '<tr>' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<input type="hidden" name="resultNoticeItems[' + i + '].id" value="' + (data[i].id ? data[i].id : '') + '"/>' +
			'<td style="min-width: 200px;white-space: normal;">' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>' +
			'<td style="min-width: 150px;white-space: normal;">' + (data[i].winCandidateCode ? data[i].winCandidateCode : '') + '</td>' +
			'<td style="width: 100px;text-align: center;">' + (data[i].isWinBidder == 1 ? '是' : '否') + '</td>' +
			'<td style="min-width: 200px;white-space: normal;">' + (data[i].remark == 1 ? data[i].remark : '/') + '</td>' +
			'<td style="min-width: 80px;white-space: normal;">' + (data[i].id ? '已编辑' : '<span style="color:red;">未编辑</span>') + '</td>' +
			'<td style="min-width: 150px;white-space: normal;">' +
			'<button type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + i + '"><span class="glyphicon glyphicon-saved"></span>编辑</button>' + btn +
			'</td>' +
			'</tr>'
	}
	html += '</tbody>'
	$(html).appendTo('#bidResult')
}

function saveInfo(isSub) {
	var subData = parent.serializeArrayToJson($('#addNotice').serializeArray());
	if(isSub) {
		subData.isSubmit = 1
	}
	if(dataId && dataId != '') {
		subData.id = dataId;
	}
	subData.examType = 1;
	subData.bidSectionId = bidId;
	var winnerArr = [];
	var isNormal = false;
	for(var i = 0; i < biderData.length; i++) {
		if(biderData[i].isWinBidder == 1) {
			winnerArr.push(biderData[i])
		}
	}
	if(winnerArr.length > 2) {
		isNormal = true;
	}
	$('#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: saveUrl,
		async: true,
		data: subData,
		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(data.success) {
				dataId = data.data;
				if(isSub) {
					// parent.layer.alert('提交成功', function(ind) {
					// 	parent.layer.close(ind);
					// 	if(isNormal) {
					// 		parent.layer.alert('您的标段:｛' + bidName + '｝已发送资格审查通知，请前往招标项目信息完善该标段招标阶段信息。')
					// 		var index = parent.layer.getFrameIndex(window.name);
					// 		parent.layer.close(index);
					// 	}
					// })
					if(isNormal) {
						parent.layer.alert('您的标段:｛' + bidName + '｝已发送资格审查通知，请前往招标项目信息完善该标段招标阶段信息。')
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					} else {
						parent.layer.alert('提交成功')
					}

				} else {
					parent.layer.alert('保存成功')
				}
				parent.$("#tableList").bootstrapTable('refresh');
			} else {
				parent.layer.alert(data.message)
			}
		},
		error: function() {
			$('#btnSubmit').attr('disabled', false);
			parent.layer.alert("提交失败！");
		}
	});
}