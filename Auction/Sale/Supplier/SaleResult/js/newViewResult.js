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
	if(datall.resultContent && datall.resultContent != "" && datall.resultContent != undefined){
		$(".resultContent").html(datall.resultContent);		
	}	
}
//关闭
function closeWin(){
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}
//打印
function preview(oper){
	if (oper < 10){
		$("#gz").css("right","100px");
		bdhtml=window.document.body.innerHTML;//获取当前页的html代码
		sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
		eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
		prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+18); //从开始代码向后取html
		prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
		window.document.body.innerHTML=prnhtml;
		window.print();
		window.document.body.innerHTML=bdhtml;
		$("#gz").css("right","10px");
	} else {
		window.print();
	}
}
