 var id = "";
 $(function(){
 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		id =$.getUrlParam("id");
	}
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
 });
 