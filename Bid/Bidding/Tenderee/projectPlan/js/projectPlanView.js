/**

*  编辑招标项目计划
*  方法列表及功能描述
*/
var saveUrl = config.tenderHost + '/BidSectionPlanController/batchSave.do';//保存
var detailUrl = config.tenderHost + '/BidSectionPlanController/findList.do';//计划详情

var planArr = [];
var bidId = '';//标段id
$(function(){
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		bidId = $.getUrlParam('id');
		getDetail(bidId);
	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})

function getDetail(id){
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'bidSectionId': id
		},
		success: function(data){
			if(data.success){
				planTable(data.data,id);
//				planArr.push(data.data);
			}
		}
	});
};
function planTable(data,id){
	$('#projectPlan tbody').html('');
	var html = '';
	for(var i = 0;i < data.length;i++){
		if(!data[i].planContent){
			data[i].planContent = '';
		}
		var state = '';
		if(data[i].states == 1){
			state = '进行中'
		}else if(data[i].states == 2){
			state = '已完成'
		}
		else if(data[i].states == 0){
			state = '未完成'
		}
		html += '<tr>'
			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
			+'<td>'+data[i].planName+'</td>'
			+'<td style="width: 150px;text-align: center;">'+data[i].planStartTime+'</td>'
			+'<td style="width: 150px;text-align: center;">'+data[i].planEndTime+'</td>'
			+'<td>'+data[i].planContent+'</td>'
			+'<td style="width: 120px;text-align: center;">'+state+'</td>'
		+'</tr>';
	};
	$(html).appendTo('#projectPlan tbody');
}
