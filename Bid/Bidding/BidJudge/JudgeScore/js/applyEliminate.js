/*

 */

var source = "";   //1：申请淘汰    2，审核淘汰    3：查看淘汰结果

$(function(){
	if($.getUrlParam("source") && $.getUrlParam("source") != "undefind"){
		source = $.getUrlParam("source");
	}
	
	switch(source){
		case 1:
			break;
	}
	
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	})
});
