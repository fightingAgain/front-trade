var bidId = '';//标段id
var dataId = '';//标段id
var examType;
$(function(){
	bidId = $.getUrlParam('bidId');//公告列表中带过来的标段
	dataId = $.getUrlParam('id');//公告列表中带过来的数据id
	if($.getUrlParam('isFromConsole')=="1"){
			examType = $.getUrlParam('examType')
			dataId= getNoticeId()
		}
	//关闭
})
function getMessage(data){
	$('#resultNotice').html(data.resultNotic)
}

function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("resultNotice").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}
//关闭
function closebox(){
	var index=parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}



/*获通知id*/
function getNoticeId() {
	var str;
	$.ajax({
		type: "get",
		url: config.tenderHost + '/ResultNoticeController/getResultNoticeItemByBidId.do',
		async: false,
		data: {
			bidSectionId: bidId,
			examType:examType
		},
		success: function(data) {
			if(data.success) {
				$('#resultNotice').html(data.data.resultNotic)
				
			
				str = data.data.id
			}
		}
	});
	return str;
}