
$(function(){
 	
 	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
});


function passMessage(data){
	for(var key in data){
		if(key == "money"){
			$("#" + key).html(Number(data[key])/100);
		} else {
			$("#" + key).html(data[key]);
		}
	}
	if(data.orderLists && data.orderLists.length > 0){
		var html = "";
		for(var i = 0; i < data.orderLists.length; i++){
			var item = data.orderLists[i];
			if(i % 2 == 0){
				html += '<tr>';
			}
			html += '<td class="th_bg">'+item.moneyType+'（元）</td><td>'+Number(item.money)/100+'</td>';
			
			if(i % 2 != 0){
				html += '</tr>';
			}
		}
		$(html).appendTo(".table"); 
	}
}
