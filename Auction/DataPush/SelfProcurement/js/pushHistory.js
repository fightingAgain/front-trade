var listBidUrl = top.config.tenderHost + '/projectReceptionController/findProjectDeliveryLogs';//招标
var listUrl = top.config.AuctionHost + '/projectReceptionController/findProjectDeliveryLogs';//非招标
var tenderType = $.getUrlParam("tenderType");
var id = $.getUrlParam("id");
$(function(){
	if(tenderType == 4){
		initTable(listBidUrl)
	}else{
		initTable(listUrl)
	}
	//关闭当前窗口
	$("#btn_close").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
});
function initTable(url){
	var listData = [];
	$.ajax({
		type: "post",
		url: url,
		async: false,
		data: {'deliveryId': id},
		datatype: 'json',
		success: function (data) {
			if (data.success) {
				listData = data.data;
			}else{
				top.layer.alert(data.message)
			}
		}
	});
	
    $("#historyTable").bootstrapTable({
        pagination: false,
		height: '450',
        columns: [{
                field: 'xh',
                title: '序号',
                align: 'center',
                width: '50px',
                formatter: function (value, row, index) {
                	return index + 1;
                }
            },
            {
                field: 'publishMan',
                title: '推送人',
                align: 'left',
                width: '180'
            },
            {
                field: 'publishTime',
                title: '推送时间',
                align: 'left',
                width: '300'
            },
			{
			    field: 'publishContent',
			    title: '推送内容',
			    align: 'left',
			    width: '200'
			},
            {
                field: 'publishResult',
                title: '推送结果',
                align: 'left',
                width: '180',
				formatter: function(value, row, index) {
				    if(value == 1) {
				        return '推送成功';
				    } else {
				        return '推送失败';
				    }
				    
				}
            },
            {
                field: 'reason',
                title: '说明',
                align: 'left',
                width: '300',
                
            }
        ]
    });
	$('#historyTable').bootstrapTable("load", listData);
}