
/**

*  编辑、添加公公示
*  方法列表及功能描述
*/

var resiveUrl = config.tenderHost + "/BidWinNoticeController/findSupplierBidWinNotice.do";	//修改地址 
var historyUrl = config.tenderHost + '/BidWinNoticeController/getHistoryList.do';//历史公告列表
var historyView = 'Bidding/BidJudge/Bidder/model/publicityHistoryView.html';//查看公告历史详情页面
var id='';//数据id
var bidId='';
$(function(){
//	 id = $.getUrlParam('id');//数据id
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	 bidId = $.getUrlParam('id');//公告列表中带过来的标段Id
	 var examType = $.getUrlParam('examType');//公告列表中带过来的标段Id
	 getDetail(bidId,examType)
	$('#historyList').on('click','.btnView',function(){
		var historyId = $(this).closest('td').attr('data-history-id');//历史公告ID
		parent.layer.open({
			type: 2,
			title: "查看历史详情",
			area: ['100%', '100%'],
			content: historyView + "?id=" + historyId,
			resize: false,
			success: function(layero, index){
				
			}
		});
	})
	
})



/*信息回显*/
function getDetail(bid,type){
	$.ajax({
		type:"post",
		url:resiveUrl,
		data: {
			'bidSectionId':bid,
			'examType': type
		},
		dataType: 'json',
		success: function(data){
			var dataSource = data.data;
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
				$('#interiorBidSectionCode').html(dataSource.interiorBidSectionCode);
				$('#bidSectionName').html(dataSource.bidSectionName);
       			// $('#noticeContent').html(dataSource.noticeContent);
				   mediaEditor.setValue(dataSource);
				$.ajax({
					type:"post",
					url:historyUrl,
					async:true,
					data: {
						'notId': dataSource.id,
						'bidSectionId': bidId,
						'bulletinType': "3"//公示类型  当前类型为3   1 招标公告 2 资格预审公告 3 中标结果公告 9 其他  
					},
					dataType: "json",//预期服务器返回的数据类型
					success: function(data){
						if(data.success){
							if(data.data){
								historyTable(data.data);
							}
						}
					},
					error: function(){
						parent.layer.alert("数据加载失败！");
					}
				});
       		}
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
//公示历史表格
//公告历史表格
function historyTable(data){
	// console.log(data.length)
	$("#historyList").html('');
	var html='';
	html = '<tr>'
		+'<th style="width: 50px; text-align: center;">序号</th>'
		+'<th>变更次数</th>'
		+'<th style="width: 100px; text-align: center;">操作</th>'
	+'</tr>';
	if(data.length == 0){
		$('#changeNum').html('首次发布');
		html += '<tr><td  colspan="4" style="text-align: center;">无历史记录</td></tr>';
	}else{
		$('#changeNum').html('第'+data.length+'次变更');
		var m = data.length;
		for(var i = 0;i < data.length;i++){
			m = m-1
			html += '<tr>'
				+'<td style="width:50px;text-align:center">'+(i+1)+'</td>'
				+'<td>'+(m==0?'首次发布':('第'+m+'次变更'))+'</td>'
				+'<td style="width: 100px;" data-history-id="'+data[i].id+'">'
					+'<button type="button" class="btn btn-primary btn-sm btnView"><span class="glyphicon glyphicon-eye-open"></span>查看</button>'
				+'</td>'
			+'</tr>';
		}
		
	}
	$(html).appendTo('#historyList');
}
function passMessage(data){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
}


