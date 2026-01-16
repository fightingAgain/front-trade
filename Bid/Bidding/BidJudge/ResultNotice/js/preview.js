/**

*  预览结果通知
*  方法列表及功能描述
*/
var getUrl = config.tenderHost + '/ResultNoticeController/getResultNoticeItem.do';//获取通知书编辑内容
var id= '';//通知书id
$(function(){
	
	id = $.getUrlParam('id');//公告列表中带过来的标段Id
	getContent(id)
	/*关闭*/
//	$('#btnClose').click(function(){
//		var index=parent.layer.getFrameIndex(window.name);
//      parent.layer.close(index);
//	});
});
function getContent(id){
	$.ajax({
		type: "post",
		url: getUrl,
		async: true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				$('#content').val(data.data);
				$('form').attr("action",config.Reviewhost+"/ReviewControll/previewPdf");
				$('form').submit();
//				$('#noticeContent').html(data.data)
			}
		}
	});
}
function printbox(){
  var oldContent = document.body.innerHTML;
  document.body.innerHTML = document.getElementById("printContent").innerHTML;
  window.print();
  document.body.innerHTML = oldContent;
}
function closebox(){
	var index=parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}
