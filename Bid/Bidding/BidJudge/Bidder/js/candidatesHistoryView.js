
/**

*  候选人公示查看
*  方法列表及功能描述
*/

var detailUrl = config.tenderHost + "/BidSuccessFulPublicityController/getPublicityContent.do";	//修改地址 


var id = '';//标段Id
$(function(){
	new UEditorEdit({
		uploadServer: top.config.tenderHost,
		pageType: 'view',
		contentKey: 'publicityContent'
	});
	id = $.getUrlParam('id');//数据id
	reviseDetail(id);
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
	    parent.layer.close(index);
	});
})

/*信息回显*/
function reviseDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		data: {
			'id':id,
		},
		dataType: 'json',
		success: function(data){
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
				let dataSource={
					'publicityContent':data.data
				}
        		// $('#publicityContent').html(dataSource)
				mediaEditor.setValue(dataSource);
        	}
			
		},
		error: function (data) {            
			parent.layer.alert("请求失败")      
		},                                   
	});
	
}
