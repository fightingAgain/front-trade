
 
 $(function(){
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});

	
 });

 
 // 窗口之间调用的方法
 function passMessage(data){
 	console.log(data)
 	$("#bidderName").html(data.bidderName);
 	
 	for(var key in data){
 		if(key == "marginPayForm"){
 			var payArr = data[key].split(",");
 			for(var i = 0; i < payArr.length; i++){ 
 				$("input:checkbox[name='marginPayForm'][value='"+payArr[i]+"']").attr("checked","checked");
 			}
 		} else if(key == "isCommitMargin"){
 			$("#" + key).html(data[key] && data[key] == 1 ? "是" : "否");
 		} else if(key == "priceFormCode"){
 			$("#" + key).html(data[key] && data[key] == 1 ? "金额" : "费率或其他类型报价");
 			if(data[key] == 1){
 				$("#bidPrice").html(data.bidPrice ? data.bidPrice : "");
 				$(".bidPriceBlock").show();
 			} else {
 				$("#otherBidPrice").html(data.otherBidPrice ? data.otherBidPrice : "");
 				$(".otherPriceBlock").show();
 			}
 		} else {
// 			$("#"+key).html(data[key] ? data[key] : "");
			optionValueView($("#"+key),data[key]);
 		}
 	}
 	if(!data.marginPayForm){
   		$("input:checkbox[name='marginPayForm']").attr("checked","checked");
 	}
 	
 }
 

 