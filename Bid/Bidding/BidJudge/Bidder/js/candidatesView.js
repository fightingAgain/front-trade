
/**

*  候选人公示查看
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/findSupplierSuccessFul.do.do";	//修改地址 
var historyUrl = config.tenderHost + '/BidSuccessFulPublicityController/getHistoryList.do';//历史公告列表
var historyView = 'Bidding/BidJudge/Bidder/model/candidatesHistoryView.html';//查看公告历史详情页面


var bidId='';//标段Id
var publicId = '';//公示id,保存后才有
var fileUploads = null;
$(function(){
//	publicId = $.getUrlParam('id');//数据id
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'publicityContent'
	});
	bidId = $.getUrlParam('id');//数据id
	reviseDetail(bidId)
	
	/*
	 * 查看公告历史详情
	 * 
	 * */
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
function reviseDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		data: {
			'bidSectionId':id,
			'examType':'2'
		},
		dataType: 'json',
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		var dataSource = data.data;
        		publicId = dataSource.id;
				getHistory(publicId,dataSource.bidSectionId);
        		// $('#publicityContent').html(dataSource.publicityContent);
				$('#interiorBidSectionCode').html(dataSource.interiorBidSectionCode);
				$('#bidSectionName').html(dataSource.bidSectionName);
				mediaEditor.setValue(dataSource);
        	}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
/*公示历史*/
function getHistory(dataId,id){
	$.ajax({
		type:"post",
		url:historyUrl,
		async:true,
		data: {
			'notId':dataId,
			'bidSectionId':id
		},
		dataType: "json",//预期服务器返回的数据类型
		success: function(data){
			if(data.success){
//				if(data.data){
					historyTable(data.data);
//				}
				
			}
		},
		error: function(){
			parent.layer.alert("数据加载失败！");
		}
	});
}
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
