var saveUrl = config.tenderHost + '/ResultNoticeController/saveItem.do';//保存、提交
var bidderInfo = {};
$(function(){
	
	//关闭
	$('body').on('click','#btnClose',function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
})
function passMessage(data) {
	for(var key in data){
		bidderInfo[key] = data[key];
	}
	//公告内容
	if(bidderInfo.resultNotic){
		$('#resultNotic').html(bidderInfo.resultNotic)
	}
}
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("resultNotic").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}
