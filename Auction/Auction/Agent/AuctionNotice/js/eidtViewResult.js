//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
var templateId;
function getMsg(datall,type,callback){
	$("#btn_close").on("click", function () {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
	$('#btn_submit').click(function(){
		if(callback){
			callback();
		}
	});
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
	if(datall.resultContent && datall.resultContent != "" && datall.resultContent != "undefined"){
		ue.ready(function() {
			ue.setContent(datall.resultContent);		
			//ue.execCommand('insertHtml', datall.resultContent);
		}); 							
	}else{
	 	$.ajax({
	 		url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do', 
	 		type:'post',
	 		dataType:'json',
	 		async:false,
			//contentType:'application/json;charset=UTF-8',
	 		data:{
	 			"packageId":datall.packageId,
	 			"projectId":datall.projectId,
	 			"examType":datall.examType,
	 			'type':"jgtzs",
	 			"tenderType":1,
	 			"isBid":datall.isBid,
	 			"supplierId":datall.supplierId,
	 			"auctionModel":datall.auctionModel,
				"detailedId":datall.packageDetailedId
	 		},
	 		success:function(result){	 
	 			if(result.success){
	 				ue.ready(function() {
	 					//ue.execCommand('insertHtml', result.data);
	 					ue.setContent(result.data);										
	 				}); 
	 			}
	 		}  
	 	});	
	}	
	modelOption({'tempType':'biddingProcurementResultsNotification','projectType':datall.projectType,'isWin':datall.isBid==1?0:1});
	$('#noticeTemplate').val(datall.templateId);
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
		templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		parent.layer.confirm('温馨提示：是否确认切换模板', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero){
			modelHtml({'type':'jgtzs', 'projectId':datall.projectId,'packageId':datall.packageId,'tempId':templateId,'tenderType':1,'supplierId':datall.supplierId,"bidPrice":datall.bidPrice || ''})
			parent.layer.close(index);			 
		}, function(index){
				parent.layer.close(index)
		});	
	})
}
