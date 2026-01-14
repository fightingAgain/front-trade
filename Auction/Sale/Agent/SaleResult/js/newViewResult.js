var rowData = JSON.parse(sessionStorage.getItem("BidNotice")); //操作数据行
var tenderTypeCode=sessionStorage.getItem('tenderTypeCode');
function getMsg(datall,type){	
	if(datall.isShow == '0'){
		//显示公章
		$.ajax({
			type: "post",
			url: parent.config.AuctionHost+'/BidNoticeController/getCaImage.do',
			data: {
				'projectId':datall.projectId
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					if(response.data){
						$("#gz").attr("src", $.parserUrlForToken(top.config.FileHost + "/FileController/fileView.do?ftpPath=" + response.data));
					}
				}
			}
		});
	}
	if(type=="views"){
		$(".editResult").hide();
		if(datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined"){
			$(".resultContent").html(datall.resultContent);		
		}
		return
	};
	var isBidCode=datall.isBid;
	$.ajax({
		   	url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"packageId":datall.packageId,
		   		"projectId":datall.projectId,
		   		'type':"jgtzs",
		   		"tenderType":2,
		   		"isBid":isBidCode,
		   		"supplierId":datall.supplierId,
		   		"auctionModel":datall.auctionModel,
		   		"detailedId":datall.packageDetailedId,
				"quotationUnit": datall.quotationUnit,
		   	},
		   	success:function(result){	 
		   		if(result.success){
		   			
		   			if(type=="view"||type=="views"){
		   				$(".editResult").hide();
		   				if(datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined"){
		   					$(".resultContent").html(datall.resultContent);		
						}else{
							$(".resultContent").html(result.data);
						}		   				   					   			
		   			}	
		   		}
		   	}  
		});	
}
//关闭
function closeWin(){
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}
//打印
function preview(oper){
	if (oper < 10){
	bdhtml=window.document.body.innerHTML;//获取当前页的html代码
	sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
	eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
	prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)); //从开始代码向后取html
	prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
	window.document.body.innerHTML=prnhtml;
	window.print();
	window.document.body.innerHTML=bdhtml;
	} else {
	window.print();
	}
}
