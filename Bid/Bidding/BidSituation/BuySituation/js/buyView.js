/**
*  zhouyan 
*  2019-4-28
*  购标情况
*  方法列表及功能描述
*/
var detailUrl = config.tenderHost + '/SupplierSignController/findPurchaseList.do';//供应商
var viewHtml = 'Bidding/BidSituation/BuySituation/model/viewTable.html';//购标情况详情
var bidId='';//标段id
var isShowCard='1'
var isShowLink;//是否多次采集下载人信息
$(function(){
	bidId = $.getUrlParam('id');//标段Id
	//关闭
	getHideLinkCardAndInfo(bidId,'2');
	if(isShowCard=='0'){
		$('.isShowCard').show()
	}
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	isShowSupplierInfo(bidId, '2', 'buy', function(data, html){
		if(data.isShowSupplier == 1 || data.isShowBidFile == 1){
			if(data.isReBid == 1){
				$('.reBid').show();
			}
			$.ajax({
				type:"post",
				url:detailUrl,
				async:true,
				data: {
					'bidSectionId': bidId
				},
				success: function(data){
					if(data.success){
						bidderHtml(data.data)
					}
				}
			});
			getIpList();
			if(isShowLink == 1){
				$('.downloadRecord').show();
			}
		}else{
			$('.downloadRecord').hide();
			$("#situationList").closest('div').html(html)
		}
	})
	//查看下载详情
	$('#situationList').on('click', '.view', function(){
		var sId = $(this).attr('data-id');
		top.layer.open({
				type: 2,
				title: '查看详情',
				area: ['100%', '100%'],
				content: viewHtml,
				resize: false,
				success:function(layero, index){
					var iframeWin = layero.find('iframe')[0].contentWindow;
					//调用子窗口方法，传参
					iframeWin.passMessage(bidId, '2', sId); 
				}
			});
	})
})
function bidderHtml(data){
	$("#situationList tbody").html('');
	var html = '';
	var money = 0;
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
	var TdHtml = '<tr>'
		TdHtml += '<th style="min-width: 50px;text-align: center;">序号</th>'
		TdHtml += '<th style="min-width: 200px;">投标人名称</th>'
		if(isShowLink == 1){
			TdHtml += '<th style="min-width: 100px;">联系人</th>'
			TdHtml += '<th style="min-width: 120px;text-align: center;">联系方式</th>'
			TdHtml += '<th style="min-width: 100px;">邮箱</th>'
			if(isShowCard==0){
				TdHtml += '<th style="min-width: 100px;">证件类型</th>'
				TdHtml += '<th style="min-width: 180px;">证件号码</th>'
			}
		}
		TdHtml += '<th style="min-width: 100px;">金额(元)</th>'
		TdHtml += '<th style="min-width: 90px;text-align: center;">下载次数</th>'
		TdHtml += '<th style="min-width: 90px;text-align: center;">支付方式</th>'
		TdHtml += '<th style="min-width: 100px;text-align: center;">购标情况</th>'
		TdHtml += '<th style="min-width: 140px;text-align: center;">购标时间</th>'
		if(!isShowLink || isShowLink == 0){
			TdHtml += '<th style="text-align: center;">操作</th>'
		}
	TdHtml += '</tr>';
	$('#situationList thead').html(TdHtml);
	for(var i = 0;i < data.length;i++){
		var isCanDownload = '';
		var eveMoney = '';
		if(data[i].isCanDownload == 0){
			isCanDownload = '<span style="color:red">未购买</span>';
			eveMoney = data[i].money;
		}else if(data[i].isCanDownload == 1){
			isCanDownload = '<span style="color:green">已购买</span>';
			if(!data[i].money){
				data[i].money = 0;
				eveMoney = '0';
			}else{
				eveMoney = data[i].money;
			}
			money += (Number(data[i].money))*100;
			
		}else if(data[i].isCanDownload == 3){
			isCanDownload = '<span style="color:green">已购买</span>';
			// isCanDownload = '<span>已免除</span>';
			eveMoney = '/';
		}
		var payForm = "";
		if(data[i].payFrom == "WEIXIN"){
			payForm = "微信";
		} else if(data[i].payFrom == "ZHIFUBAO"){
			payForm = "支付宝";
		}
		
		var payId = data[i].payId!= undefined ? data[i].payId : "";
		var payIdHtml='';
		var flag = true;
		for(var j = 0;j < data.length;j++){
			var payIds = data[j].payId!= undefined ? data[j].payId : "";
			if(payId != ''){
				if( payId == payIds && i != j){
					flag = false;
				}
			}
		}
		if(flag){
			payIdHtml = payId;
		}else{
			payIdHtml = '<span style="color:red">'+payId+'</span>';
		}
		
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+ showBidderRenameMark(data[i].supplierId, data[i].supplierName, RenameData, 'addNotice')+'</td>'
			if(isShowLink == 1){
				html +='<td>'+(data[i].legalContact ? data[i].legalContact : "")+'</td>'
				+'<td style="text-align: center;">'+(data[i].linkPhone ? data[i].linkPhone : "")+'</td>'
				+'<td>'+(data[i].linkEmail ? data[i].linkEmail : "")+'</td>'
				if(isShowCard==0){
					html +='<td>'+(data[i].linkCardType ? ['身份证','护照'][data[i].linkCardType] : "")+'</td>'
						+'<td>'+(data[i].linkCard ? data[i].linkCard : "")+'</td>'
				}
			}
			
			html +='<td>'+eveMoney+'</td>'
			+'<td style="text-align: center;">'+(data[i].downCount ? data[i].downCount : 0)+'</td>'
			+'<td style="text-align: center;">'+payForm+'</td>'
			+'<td style="text-align: center;">'+isCanDownload+'</td>'
			+'<td style="text-align: center;">'+(data[i].createTime ? data[i].createTime : "")+'</td>'
			if(!isShowLink || isShowLink == 0){
				html +='<td style="text-align: center;"><button type="button" class="btn btn-sm btn-primary view" data-id="'+data[i].supplierId+'">查看详情</button></td>'
			}
			// +'<td></td>'
		+'</tr>';
		
	}
	if(data.length > 0){
		html += '<tr><td colspan="12">合计：'+money/100+' 元</td></tr>';
	}
	$(html).appendTo('#situationList tbody');
}

function passMessage(data){
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode)
	$('#bidSectionName').html(data.bidSectionName)
}
//记录
function getIpList(){
	$.ajax({
		type:"post",
		url:config.tenderHost + "/SupplierSignController/findPurchaseIpList",
		async:true,
		data: {
			'bidSectionId': bidId
		},
		success: function(res){
			if(!res.success){
				top.layer.alert('温馨提示：' + res.message);
				return
			};
			let r = res.data
			// console.log(r)
			let bidderNameArr = r.map(function(item) {
				return item.bidderName;
			});
			let str = ""
			for(i = 0; i < r.length; i++) {
				if(i == 0) {
					r[i].rowSpan = r.filter(function(item) {
						return item.bidderName == r[i].bidderName
					}).length
				} else {
					if(r[i - 1].bidderName == r[i].bidderName) {
						r[i].rowSpan = 0
					} else {
						r[i].rowSpan = r.filter(function(item) {
							return item.bidderName == r[i].bidderName
						}).length
					}
				}
			}
			for(let o = 0; o < r.length; o++) {
				if(r[o].rowSpan != 0) {
					str += '<tr><td rowspan="' + r[o].rowSpan + '">' + r[o].bidderName + '</td>'
					// str += '<td>' + r[o].bidderLogcode + '</td>'
					if($('#ipList').hasClass('JD_view')){
						if(r[o].flag == 1) {
							str += '<td class="td1"><font color="red">' + r[o].createIp + '</font></td>'
						} else if(r[o].flag == 2) {
							str += '<td class="td1"><font color="green">' + r[o].createIp + '</font></td>'
						}else {
							str += '<td class="td2">' + r[o].createIp + '</td>'
						}
					}
					str += '<td>' + r[o].createTime + '</td></tr>'
				} else {
					str += '<tr>'
					// str += '<td>' + r[o].bidderLogcode + '</td>'
					if($('#ipList').hasClass('JD_view')){
						if(r[o].flag == 1) {
							str += '<td class="td1"><font color="red">' + r[o].createIp + '</font></td>'
						} else if(r[o].flag == 2) {
							str += '<td class="td1"><font color="green">' + r[o].createIp + '</font></td>'
						}else {
							str += '<td class="td2">' + r[o].createIp + '</td>'
						}
					}
					str += '<td>' + r[o].createTime + '</td></tr>'
				}

			}
			$('#ipTable').html(str)
		}
	});
}
//招标判断是否显示电子信息
function getHideLinkCardAndInfo(id,examType){
	$.ajax({
		url: top.config.tenderHost + "/BidSectionController/getHideSupplierLinkCard.do",
		type: "post",
		data: {
			'bidSectionId': id,
			'examType':examType
		},
		async: false,
		success: function (data) {
			if(data.success == false){
				parent.layer.alert('温馨提示：'+data.message);
				return;
			}
			if(data.data){
				isShowCard = data.data.isShowCard;
				isShowLink = data.data.isShowLink;
				if(isShowLink == 1){
					$('.downloadRecord').show();
				}else{
					$('.downloadRecord').hide();
				}
			}
			
		},
		error: function (data) {
			parent.layer.alert("温馨提示：加载失败");
		}
	});
}