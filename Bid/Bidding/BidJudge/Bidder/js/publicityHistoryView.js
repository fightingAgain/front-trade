
/**

*  编辑、添加公公示
*  方法列表及功能描述
*/

var resiveUrl = config.tenderHost + "/BidWinNoticeController/getWinNoticeContent.do";	//查看中标人地址
var id='';//数据id
$(function(){
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'noticeContent'
	});
	 id = $.getUrlParam('id');//公告列表中带过来的标段Id
	 getDetail(id);
	 $('#btnClose').click(function(){
	 	var index=parent.layer.getFrameIndex(window.name);
	     parent.layer.close(index);
	 });
})
/*信息回显*/
function getDetail(id){
	$.ajax({
		type:"post",
		url:resiveUrl,
		data: {
			'id':id,
		},
		dataType: 'json',
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
       		}else{
				let dataInfo={
					'noticeContent':data.data
				}
				mediaEditor.setValue(dataInfo);
       			// $('#noticeContent').html(data.data)
       		}
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
function passMessage(data){
	/*关闭*/
	
}


