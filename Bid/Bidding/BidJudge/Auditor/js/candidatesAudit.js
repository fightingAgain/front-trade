/**

 *  候选人公示查看
 *  方法列表及功能描述
 */

var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/findDetails.do"; //修改地址   
var bidInfoUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do'; //获取标段相关信息

var fullScreen = 'Bidding/Model/fullScreenView.html'; //全屏查看页面
var source = ''; // 1 审核  0 查看
var statu; //2 审核 3 查看
var fileUploads = null;
var publicId = '';

var bidderPriceType; //投标报价方式 1.金额  9费率
var rateUnit; //费率单位
var rateRetainBit; //费率保留位数(0~6)
var tenderProjectType = '';//招标项目类型
var bidId;
$(function() {
	//	reportId = $.getUrlParam('id');//公示列表中带过来的标段Id
	publicId = $.getUrlParam('id'); //数据id
	source = $.getUrlParam('source'); //公示列表中带过来的标段Id
	//媒体
	initMedia({
		isDisabled: true
	});
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'publicityContent'
	});
	if(source == 1) {
		statu = 2
	} else if(source == 0) {
		statu = 3
	}
	reviseDetail(publicId)
	//审核
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
		businessId: publicId,
		status: statu,
		type: "hxrgs",
		submitSuccess: function() {
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.closeAll();
			parent.layer.alert("审核成功", {
				icon: 7,
				title: '提示'
			});
			parent.$("#projectList").bootstrapTable("refresh");
		}
	});
	/*关闭*/
	$('#btnClose').click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	/*全屏*/
	$('.fullScreen').click(function() {
		var content = $('#publicityContent').html();
		parent.layer.open({
			type: 2,
			title: '查看公示',
			area: ['100%', '100%'],
			content: fullScreen,
			resize: false,
			btn: ['关闭'],
			success: function(layero, index) {
					var body = parent.layer.getChildFrame('body', index);
					var iframeWind = layero.find('iframe')[0].contentWindow;
					body.find('#noticeContent').html(content);
				}
				//确定按钮
				,
			yes: function(index, layero) {
				parent.layer.close(index);

			}
		});
	})

})

/*信息回显*/
function reviseDetail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		data: {
			'id': id,
		},
		dataType: 'json',
		success: function(data) {
			var dataSource = data.data;
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				if(dataSource.bidSectionId) {
					getBidInfo(dataSource.bidSectionId);
				}
				bidId = dataSource.bidSectionId;
				for(var key in dataSource) {
					if(dataSource.bidForm == 1) {
						dataSource.bidForm = '中标价';
					} else if(dataSource.bidForm == 2) {
						dataSource.bidForm = '下浮率';
					};
					if(dataSource.isPublicBidPrice == 0) {
						dataSource.isPublicBidPrice = '否';
					} else if(dataSource.isPublicBidPrice == 1) {
						dataSource.isPublicBidPrice = '是';
					}
					if(key == 'isManual'){
						if(dataSource.isManual == '1'){
							$('#isManual').html('自动发布')
						}else if(dataSource.isManual == '0'){
							$('#isManual').html('手动发布')
						}
						publishType(dataSource.isManual)
					}else if(key == 'noticeMedia') {
						$('[name=noticeMedia]').val(dataSource[key] ? dataSource[key].split(',') : []);
					} else {
						$("#" + key).html(dataSource[key]);
					}

				};
				mediaEditor.setValue(dataSource);
				if(!fileUploads) {
					fileUploads = new StreamUpload("#fileContent", {
						businessId: publicId,
						status: 2,
					});
				}
				if(dataSource.projectAttachmentFiles) {
					fileUploads.fileHtml(dataSource.projectAttachmentFiles);
				}
				candidateHtml(dataSource.bidWinCandidates);
			}

		},
		error: function(data) {
			parent.layer.alert("请求失败")
		},
	});

}
function publishType(val){
	if(val == 1){
		$('.publish_hand').hide();
		$('.publish_own').show();
	}else{
		$('.publish_own').hide();
		$('.publish_hand').show();
	}
}

//候选人
function candidateHtml(data) {
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	$('#candidates tbody').html('');
	var html = '';
	var priceUnitParm = '';
	if(data && data.length > 0) {
		/* if(data[0].priceUnit == 0){
			priceUnit = '（元）';
		}else if(data[0].priceUnit == 1){
			priceUnit = '（万元）';
		}; */
		if(bidderPriceType == 1) {
			if(data[0].priceUnit == 0) {
				priceUnitParm = '投标价格（元）';
			} else if(data[0].priceUnit == 1) {
				priceUnitParm = '投标价格（万元）';
			};
		} else if(bidderPriceType == 9) {
			priceUnitParm = '投标价格（' + rateUnit + '）';
		}

		html = '<tr>';
		html += '<th style="width: 50px;text-align: center;">序号</th>';
		html += '<th>投标人名称</th>';
		html += '<th style="width: 300px;text-align: center;">统一社会信用代码</th>';
		html += '<th style="width: 300px;text-align: center;">' + priceUnitParm + '</th>';
		html += '<th style="width: 100px;text-align: center;">得分</th>';
		if(tenderProjectType == 'A'){
			html += '<th style="width: 100px;min-width: 100px;text-align: center;">项目负责人</th>';
			html += '<th style="width: 150px;min-width: 100px;text-align: center;">证书名称及编号</th>';
			html += '<th style="width: 100px;min-width: 100px;text-align: center;">工期</th>';
		};
		html += '</tr>';

	} //根据得分排序
	
	function sortScore(a, b) {
		return b.score - a.score
	}; //利用js中的sort方法
	
	data.sort(sortScore);
	for(var i = 0; i < data.length; i++) {
		if(data[i].comeFrom) {
			data[i].winCandidateName = data[i].bidderName;
			data[i].winCandidateId = data[i].supplierId;
		};
		//		if(data[i].priceUnit){
		//			if(data[i].priceUnit == 0){
		//				data[i].priceUnit = "（元"
		//			}else if(data[i].priceUnit == 1){
		//				data[i].priceUnit = "（万元"
		//			}
		//		}else{
		//			data[i].priceUnit = ""
		//		}
		//		if(data[i].priceCurrency){
		//			if(data[i].priceCurrency == 156){
		//				data[i].priceCurrency = "/人民币）"
		//			}
		//		}else{
		//			data[i].priceCurrency = "）"
		//		}
		if(data[i].score == undefined || data[i].score == null) {
			data[i].score = "/";
		}

		html += '<tr data-winner-id="' + data[i].winCandidateId + '">' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + showBidderRenameMark(data[i].winCandidateId, data[i].winCandidateName, RenameData, 'addNotice') + '</td>' +
			'<td style="width: 300px;text-align: center;">' + data[i].enterpriseCode + '</td>'
		if(bidderPriceType == 1) {
			html += '<td style="width: 300px;text-align: right;">' + data[i].bidPrice + '</td>'
		} else if(bidderPriceType == 9) {
			html += '<td style="width: 300px;text-align: right;">' + data[i].otherBidPrice + '</td>'
		}
		html += '<td style="width: 150px;text-align: center;">' + data[i].score + '<input type="hidden" name="bidWinCandidates[' + i + '].score" value="' + data[i].score + '"/></td>' ;
		if(tenderProjectType == 'A'){
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectManagerMane?data[i].projectManagerMane:"") + '</td>';
			html += '<td style="width: 100px;min-width: 150px;text-align: center;">' + (data[i].cfa?data[i].cfa:"") + '</td>';
			html += '<td style="width: 100px;min-width: 100px;text-align: center;">' + (data[i].projectTime?data[i].projectTime:"") + '</td>';
		};
		html += '</tr>';
	};
	$(html).appendTo('#candidates');

};

function getBidInfo(id) {
	$.ajax({
		type: "post",
		url: bidInfoUrl,
		async: false,
		data: {
			'id': id
		},
		success: function(data) {
			if(data.success) {
				if(data.data) {
					bidderPriceType = data.data.bidderPriceType;
					rateUnit = data.data.rateUnit;
					rateRetainBit = data.data.rateRetainBit;
					tenderProjectType = data.data.tenderProjectType.charAt(0);
				}
			} else {
				top.layer.alert(data.message)
			}
		}
	});
}