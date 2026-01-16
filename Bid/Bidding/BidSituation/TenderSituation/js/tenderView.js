/**

*  购标情况
*  方法列表及功能描述
*/
var detailUrl = config.tenderHost + '/SupplierSignController/findPitchList.do';//供应商
var viewHtml = 'Bidding/BidSituation/TenderSituation/model/tenderHistory.html';//查看历史回执
var fileDownloadUrl = config.tenderHost + '/BidFileController/downloadFile.do';//下载解密文件

var bidId='';//标段id
var isShowBidFile = false;
var RenameData;//投标人更名信息
$(function(){
	bidId = $.getUrlParam('id');//标段Id
	RenameData = getBidderRenameMark(bidId);//投标人更名信息
	//关闭
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	isShowSupplierInfo(bidId, '2', 'submit', function(data, html){
		if(data.isShowSupplier == 1 || data.isShowBidFile == 1){
			if(data.isShowBidFile == 1){
				isShowBidFile = true
			}
			$.ajax({
				type:"post",
				url:detailUrl,
				async:false,
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
	
	
	$("#situationList").on("click", ".btnView", function(){
		var supplierId = $(this).attr("data-id");
		openView(supplierId);
	});
	$("#situationList").on("click", ".btnSee", function(){
		var url = $(this).attr("data-url");
		previewPdf(url);
	});
});
function openView(supplierId){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	top.layer.open({
		type: 2,
		title: "历史回执",
		area: ['1000px', '600px'],
		content: viewHtml + "?bidSectionId=" + bidId + "&supplierId=" + supplierId,
		success:function(layero, index){
		}
	});
}

function bidderHtml(data){
	$("#situationList tbody").html('');
	var html = '';
	
	for(var i = 0;i < data.length;i++){
		var decryptResult = '';	//解密状态
		var signResult = '';	//签到状态
		var decryptBut = ''; //解密文件下载按钮
		if(!data[i].createTime){
			data[i].isCanDownload = '<span style="color:red">未递交</span>';
			data[i].createTime = '';
		}else if(data[i].createTime){
			data[i].isCanDownload = '<span style="color:green">已递交</span>'
		}
		if(data[i].status == 1){
			data[i].isCanDownload = '<span style="color:green">已递交</span>';
		} else if(data[i].status == 2) {
			data[i].isCanDownload = '<span style="color:red">已撤回</span>';
		} else {
			data[i].isCanDownload = '<span style="color:red">未递交</span>';
		}
		if(data[i].signStaus == 1 || data[i].decryptResult == 1){
			signResult = '<span style="color:green">已签到</span>';
		}else{
			signResult = '<span style="color:red">未签到</span>'
		}
		if(data[i].decryptResult == 1){
			decryptResult = '<span style="color:green">已解密</span>';
			if(isShowBidFile){
				decryptBut = '<a href="javascript:;" style="color: #fff;" class="btn btn-primary btn-sm downFile" data-id="'+data[i].bidFileId+'" >下载</a>';
			}
		}else{
			decryptResult = '<span style="color:red">未解密</span>'
		}
		
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+showBidderRenameMark(data[i].supplierId, data[i].supplierName, RenameData, 'addNotice')+'</td>'
			+'<td style="width: 150px;text-align: center;">'+data[i].isCanDownload+'</td>'
			+'<td style="width: 200px;text-align: center;">'+data[i].createTime+'</td>'
			+'<td style="width: 80px;text-align: center;">'+signResult+'</td>'
			+'<td style="width: 80px;text-align: center;">'+decryptResult+'</td>'
			+'<td style="text-align:center;"><a class="btn-primary btn-sm btnSee" data-url="'+data[i].receiptUrl+'"><span class="glyphicon glyphicon-eye-open"></span> 预览</a></td>'
			+ '<td style="text-align:center;"><button type="button" class="btn btn-primary btn-sm btnView" data-id="'+data[i].supplierId+'">查看</button></td>'
			+ '<td style="text-align:center;">'+decryptBut+'</td>'
		+'</tr>';
		
	}
	$(html).appendTo('#situationList tbody')
}

//下载解密文件
$("#situationList").on("click", ".downFile", function(){
	var bidFileId = $(this).attr("data-id");
	$(this).attr('href',$.parserUrlForToken(fileDownloadUrl+'?bidFileId='+bidFileId));
});
function passMessage(data,callback){
	$('#interiorBidSectionCode').html(data.interiorBidSectionCode);
	$('#bidSectionName').html(data.bidSectionName);
}

//招标文件下载记录
function getIpList(){
	$.ajax({
		type:"post",
		url:config.tenderHost + "/SupplierSignController/findPitchIpList",
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

