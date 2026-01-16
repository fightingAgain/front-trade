/**

*  购标情况
*  方法列表及功能描述
*/
var detailUrl = config.tenderHost + '/SupplierSignController/findPurchaseYuShenList.do';//供应商

var bidId='';//标段id
$(function(){
	bidId = $.getUrlParam('id');//标段Id
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	isShowSupplierInfo(bidId, '1', 'buy', function(data, html){
		if(data.isReBid == 1){
			$('.reBid').show();
		}
		if(data.isShowSupplier == 1 || data.isShowBidFile == 1){
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
			$('.bidderHide').show();
		}else{
			$('.bidderHide').hide();
			$("#situationList").closest('div').html(html)
		}
	})
	
})
function passMessage(data,callback){
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode);
	$('#bidSectionName').html(data.bidSectionName);
}
function bidderHtml(data){
	$("#situationList tbody").html('');
	var html = '';
	var money = 0;
	var RenameData = getBidderRenameMark(bidId);//投标人更名信息
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
			+'<td style="min-width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td style="min-width: 200px;text-align: left;">'+showBidderRenameMark(data[i].supplierId, data[i].supplierName, RenameData, 'addNotice')+'</td>'
			+'<td style="min-width: 100px;text-align: left;">'+(data[i].legalContact ? data[i].legalContact : "")+'</td>'
			+'<td style="min-width: 120px;text-align: center;">'+(data[i].legalContactPhone ? data[i].legalContactPhone : "")+'</td>'
			+'<td style="min-width: 100px;text-align: left;">'+(data[i].legalEmail ? data[i].legalEmail : "")+'</td>'
			+'<td style="min-width: 100px;text-align: center;">'+(eveMoney ? eveMoney : "0")+'</td>'
			+'<td style="min-width: 90px;text-align: center;">'+(data[i].downCount ? data[i].downCount : 0)+'</td>'
			+'<td style="min-width: 90px;text-align: center;">'+payForm+'</td>'
			+'<td style="min-width: 100px;text-align: center;">'+isCanDownload+'</td>'
			+'<td style="min-width: 140px;text-align: center;">'+(data[i].createTime ? data[i].createTime : "")+'</td>'
			+'<td style="text-align: center;">'+payIdHtml+'</td>'
			+'<td style="min-width: 140px;text-align: center;"></td>'
		+'</tr>';
//		money += data[i].money;
	}
	if(data.length > 0){
		html += '<tr><td colspan="12">合计：'+money/100+' 元</td></tr>';
	}
	$(html).appendTo('#situationList tbody');
}


function getIpList() {
	$.ajax({
		type: "post",
		url: config.tenderHost + "/SupplierSignController/findPurchaseYuShenIpList",
		async: true,
		data: {
			'bidSectionId': bidId
		},
		success: function(res) {
			if(!res.success){
				top.layer.alert('温馨提示：' + res.message);
				return
			};
			let r = res.data
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
						}else if(r[o].flag == 2) {
							str += '<td class="td1"><font color="green">' + r[o].createIp + '</font></td>'
						} else {
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
						}else if(r[o].flag == 2) {
							str += '<td class="td1"><font color="green">' + r[o].createIp + '</font></td>'
						} else {
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
