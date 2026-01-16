/**

*  查看评委签到
*  方法列表及功能描述
* 进入页面后根据地址栏携带过来的参数获取承诺书->展示线上承诺书->签章->提交（验证是否签章）
*/
var signUrl = config.tenderHost + '/ExpertSignInController/findSingInList.do';
var bidId = '';//标段Id
$(function(){
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		bidId =  getUrlParam("id");
		signRecord(bidId);
	}
	//关闭
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
})
function signRecord(id){
	$.ajax({
		type:"post",
		url:signUrl,
		async:true,
		data: {
			'packageId':id,
			'examType':2
		},
		success: function(data){
			if(data.success){
				console.log(data)
				signHtml(data.data);
			}
		}
	});
}
function signHtml(data){
	$('#table_sign tbody').html('');
	var html='';
	for(var i = 0;i<data.length;i++){
		var state = '';
		if(data[i].signResult == 0){
			state = '未签到 '
		}else if(data[i].signResult == 1){
			state = '已签到 '
		}
		html += '<tr>'
    			+'<td style="width: 50px;text-align: center;">'+(i+1)+'</td>'
    			+'<td>'+data[i].expertName+'</td>'
    			+'<td style="width: 100px;text-align: center;">'+state+'</td>'
    			+'<td style="width: 150px;text-align: center;">'+(data[i].signTime?data[i].signTime:'')+'</td>'
    		+'</tr>'
	}
	$(html).appendTo('#table_sign tbody')
	
}
