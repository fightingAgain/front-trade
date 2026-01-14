var nowDate = new Date();
var viewResult = JSON.parse(sessionStorage.getItem("viewResult"));
$(function() {
	

})
function closeWin(){
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
}
function getMsg(){	
	
	if(viewResult.examType==0){
		//0为中选通知，1为未中选通知
		if(viewResult.isBid == 0) {			
			$(".isBidText").show();
			$(".isnotBidText").hide();
		} else {		
			$(".isBidText").hide();
			$(".isnotBidText").show();
		}
		$(".examType_0").hide();
		$('.examType_show').show();
		if(viewResult.isBid == 0) {
			$("#isOut").html("通过");
			$('#isOutp').html('请贵公司接此中选通知书后按规定参与接下来的项目流程。 ');
		} else {
			$("#isOut").html("未通过");
			$('#isOutp').html('很遗憾，该项目之后的流程您将无法参与，感谢贵公司的参与。');
		}		
		if(viewResult.resultContent && viewResult.resultContent != "" && viewResult.resultContent != "undefined"){
			$(".examType_Html").html(viewResult.resultContent);
		} else {
			$("span[id]").each(function() {
				$(this).html(viewResult[this.id]);
			})					
		}		
	}else{	
		
		if(viewResult.bidPrice){
			$("#editResult").hide();
			$(".seeResult").show();
			$(".btnPreview").show();
			$(".btnSave").hide();
			
			$(".gongzhang").css("margin-top","150px;")
		
			if(viewResult.isBid == 0) {
				
				$(".isBid").show();
				$(".isnotBid").hide();
				$(".isBidText").show();
				$(".isnotBidText").hide();
			} else {
				$(".isBid").hide();
				$(".isnotBid").show();
				$(".isBidText").hide();
				$(".isnotBidText").show();
			}
			
			//	
			if(viewResult.resultContent && viewResult.resultContent != "" && viewResult.resultContent != "undefined"){
				$(".temple").html(viewResult.resultContent);
				$(".temple").show();
				$(".seeResult").hide();
			} else {
				$("span[id]").each(function() {
					$(this).html(viewResult[this.id]);
				})
				$(".temple").hide();
				$(".seeResult").show();
			}
			$('.examType_show').hide()
		}else{
			if(viewResult.isBid == 0) {			
				$(".isBidText").show();
				$(".isnotBidText").hide();
			} else {		
				$(".isBidText").hide();
				$(".isnotBidText").show();
			}
			
			if(viewResult.examType == 0){
				$(".examType_0").hide();
				$('.examType_show').show();
				if(viewResult.isBid == 1) {
					$("#isOut").html("未通过");
					$('#isOutp').html('很遗憾，该项目之后的流程您将无法参与，感谢贵公司的参与。')
				} else {
					$("#isOut").html("通过");
					$('#isOutp').html('请贵公司接此中选通知书后按规定参与接下来的项目流程。 ')
				}
			}else{
				$(".seeResult").show();
				$(".isBid").hide();
				$(".isnotBid").show();
				$('.examType_show').hide();
			}
					
			if(viewResult.resultContent && viewResult.resultContent != "" && viewResult.resultContent != "undefined"){
				$(".examType_Html").html(viewResult.resultContent);
			} else {
				$("span[id]").each(function() {
					$(this).html(viewResult[this.id]);
				})					
			}
		}
		
		if(viewResult.isShow == '0'){
			//显示公章
			$("#gz").attr("src",parent.config.bidhost+'/BidNoticeController/getCaImage.do?projectId='+viewResult.projectId+'&Token='+$.getToken());
		}
		
		if(viewResult.tenderType=="2"){
			$(".tenderType0").hide()
		}else{
			$(".tenderType0").show()
		}		
	}
	
	
	

	var year = nowDate.getFullYear();
	var month = nowDate.getMonth()+1;
	var day = nowDate.getDate();
	var str = "<span>"+year+"年";
	if(parseInt(month)<10){
		str+= "0"+month+"月";
	}else{
		str+=month+"月";
	}
	if(parseInt(day)<10){
		str+= "0"+day+"日 </span>";
	}else{
		str+= day+"日 </span>";
	}
	
	if(viewResult.checkState == ""){
		//查看
		var tempDate = viewResult.subDate.split(" ")[0];
		tempDate = tempDate.replace("-","年");
		tempDate = tempDate.replace("-","月");
		tempDate += "日";
		
		str = "<span>"+tempDate+" </span>"
	}
	$("#nowtime").html(str);
	
	switch(viewResult.tenderType) {
		case "0":
			$(".tenderTypes").html("经询比评审小组评审");
			$("#wan").html("万");
			break;
		case "1":
			$(".tenderTypes").html("经竞价报价后");
			break;
		case "2":
			$(".tenderTypes").html("经竞卖报价后");
			break;
		case "6":
			$(".tenderTypes").html("经单一来源报价后");
			$("#wan").html("万");
			break;
	}
	
}

function preview(oper)
{
	if (oper < 10){
	bdhtml=window.document.body.innerHTML;//获取当前页的html代码
	sprnstr="<!--startprint"+oper+"-->";//设置打印开始区域
	eprnstr="<!--endprint"+oper+"-->";//设置打印结束区域
	prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+18); //从开始代码向后取html
	prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//从结束代码向前取html
	window.document.body.innerHTML=prnhtml;
	window.print();
	window.document.body.innerHTML=bdhtml;
	} else {
	window.print();
	}
}

/*
 * 2018-11-12 H add
 * 编辑结果通知书
 */

function EditResult(layero){
	$(".btnSee").hide();
	$(".seeResult").hide();
	$(".btnPreview").hide();
	$("#editResult").show();
	$(".btnSave").show();
	$(".gongzhang").css("margin-top","30px");
	$("span[id]").each(function() {
		$(this).html(viewResult[this.id]);
	})
	if(viewResult.tenderType=="2"){
		$(".tenderType0").hide()
	}else{
		$(".tenderType0").show()
	}
	if(viewResult.isShow == '0'){
		//显示公章
		$("#gz").attr("src",parent.config.bidhost+'/BidNoticeController/getCaImage.do?projectId='+viewResult.projectId+'&Token='+$.getToken());
	}
	var year = nowDate.getFullYear();
	var month = nowDate.getMonth()+1;
	var day = nowDate.getDate();
	var str = "<span>"+year+"年";
	if(parseInt(month)<10){
		str+= "0"+month+"月";
	}else{
		str+=month+"月";
	}
	if(parseInt(day)<10){
		str+= "0"+day+"日 </span>";
	}else{
		str+= day+"日 </span>";
	}
	
	if(viewResult.checkState == ""){
		//查看
		var tempDate = viewResult.subDate.split(" ")[0];
		tempDate = tempDate.replace("-","年");
		tempDate = tempDate.replace("-","月");
		tempDate += "日";
		
		str = "<span>"+tempDate+" </span>"
	}
	$("#nowtime").html(str);
	
	switch(viewResult.tenderType) {
		case "0":
			if(viewResult.examType == 0){
				$(".tenderTypes").html("经资格审查小组评审");
			}else{
				$(".tenderTypes").html("经询比评审小组评审");
				$("#wan").html("万");
			}
			
			break;
		case "1":
			$(".tenderTypes").html("经竞价报价后");
			break;
		case "2":
			$(".tenderTypes").html("经竞卖报价后");
			break;
		case "6":
			$(".tenderTypes").html("经单一来源报价后");
			$("#wan").html("万");
			break;
	}
	
	
	var E = window.wangEditor
	editor = new E('#editResult')
	editor.customConfig.menus = [
        'head',  // 标题
	    'bold',  // 粗体
	    'fontSize',  // 字号
	    'fontName',  // 字体
	    'italic',  // 斜体
	    'underline',  // 下划线
	    'foreColor',  // 文字颜色
	    'backColor',  // 背景颜色
	    'list',  // 列表
	    'justify',  // 对齐方式
	    'undo',  // 撤销
	    'redo'  // 重复
    ]
	editor.create()
	if(viewResult.examType==1){
		if(viewResult.isBid == 0) {
			$(".isBid").show();
			$(".isnotBid").hide();		
			editor.txt.html($(".isTemplet").html());
		} else {
			$(".isBid").hide();
			$(".isnotBid").show();
			editor.txt.html($(".isNotTemplet").html());
		}
		if(viewResult.isBid == 0) {			
			$(".isBidText").show();
			$(".isnotBidText").hide();
		} else {		
			$(".isBidText").hide();
			$(".isnotBidText").show();
		}
		$('.examType_show').hide()
	}else {
		if(viewResult.isBid == 0) {			
			$(".isBidText").show();
			$(".isnotBidText").hide();
			$("#isOut").html("通过");
			$('#isOutp').html('请贵公司接此中选通知书后按规定参与接下来的项目流程。 ');
		} else {		
			$(".isBidText").hide();
			$(".isnotBidText").show();
			$("#isOut").html("未通过");
			$('#isOutp').html('很遗憾，该项目之后的流程您将无法参与，感谢贵公司的参与。');
		}
		$(".examType_0").hide();
		$('.examType_show').show();
		editor.txt.html($(".examType_Html").html());
	}	
	if(viewResult.resultContent && viewResult.resultContent != "" && viewResult.resultContent != "undefined"){
		editor.txt.html(viewResult.resultContent);
		$(".examType_Html").hide()
	} else {
		if(viewResult.examType==1){
			if(viewResult.isBid == 0) {
				editor.txt.html($(".isTemplet").html());
			} else {
				editor.txt.html($(".isNotTemplet").html());
			}
		}else{
			editor.txt.html($(".examType_Html").html());
			$(".examType_Html").hide()
		}
		
	}
}


