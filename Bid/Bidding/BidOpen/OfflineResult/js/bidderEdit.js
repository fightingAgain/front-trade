var options;  //从上一个页面传过来的参数
 
 $(function(){
	
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	initSelect('.select');
	
	var nowDate = top.$("#systemTime").html() + " " + top.$("#sysTime").html();
 	//公告发布时间
 	$('#checkinTime').click(function(){
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',
			minDate:nowDate,
		})
 	});	
	
	
	//价款形式代码
	priceFormChange($("[name=priceFormCode]").val());
	$("[name=priceFormCode]").change(function(){
		priceFormChange($(this).val());
	})
	
	//保存
	$("#btnSave").click(function(){
		if(checkForm($("#formName"))){
			var data = {};
			data.isCommitMargin = $("[name=isCommitMargin]:checked").val();
			var payObj = [];
			$("input:checkbox[name='marginPayForm']:checked").each(function() {
	  			payObj.push($(this).val()); 
			});
			if(payObj.length == 0){
				parent.layer.alert("请选择保证金递交方式");
				return;
			}
			
			data.marginPayForm = payObj.join(",");
			data.priceFormCode = $("[name=priceFormCode]").val();
			data.otherBidPrice = $("[name=otherBidPrice]").val();
			data.bidPrice = $("[name=bidPrice]").val();
			data.priceUnit = $("[name=priceUnit]").val();
			data.priceCurrency = $("[name=priceCurrency]").val();
			data.timeLimit = $("[name=timeLimit]").val();
			data.checkinTime = $("[name=checkinTime]").val();
			data.bidderCodeType = $("[name=bidderCodeType]").val();
			
			options.callBack(data);
			
			var index = parent.layer.getFrameIndex(window.name); 
			parent.layer.close(index); 
		}
		
		
	});

	
 });

 
 // 窗口之间调用的方法
 function passMessage(data){
 	console.log(data)
 	options = data;
 	$("#bidderName").html(data.bidderName);
 	
 	for(var key in data){
 		if(key == "marginPayForm"){
 			var payArr = data[key].split(",");
 			for(var i = 0; i < payArr.length; i++){ 
 				$("input:checkbox[name='marginPayForm'][value='"+payArr[i]+"']").attr("checked","checked");
 			}
 		} else {
 			$("[name="+key+"]").val(data[key]);
 		}
 	}
 	if(!data.marginPayForm){
   		$("input:checkbox[name='marginPayForm']").attr("checked","checked");
 	}
 	if(!data.bidderCodeType){
 		$("#bidderCodeType").val("2");
 	}
 	priceFormChange(data.priceFormCode)
 	
 }
 
 //价款形式代码
function priceFormChange(code){
	if(code && code != 1){
		$(".bidPriceBlock").hide();
		$("[name='bidPrice']").removeAttr("datatype");
		$("[name='bidPrice']").val("");
		
		$(".otherPriceBlock").show();
		$("[name='otherBidPrice']").attr("datatype", "*");
 	} else {
		$(".bidPriceBlock").show();
		$("[name='bidPrice']").attr("datatype", "money");
		
		$(".otherPriceBlock").hide();
		$("[name='otherBidPrice']").removeAttr("datatype");
		$("[name='otherBidPrice']").val("");
	}
}
 