
var historyUrl = config.tenderHost + '/PretrialFileLogController/get.do';  //回执单历史记录

var bidSectionId = "", supplierId = "";
$(function(){
	// 获取连接传递的参数

 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined"){
		bidSectionId =$.getUrlParam("bidSectionId");
	}
 	if($.getUrlParam("supplierId") && $.getUrlParam("supplierId") != "undefined"){
		supplierId =$.getUrlParam("supplierId");
	}
 	
 	

 	
 	history();
 	
 	
 	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	
	$("#formName").on("click", ".btnSee", function(){
		var url = $(this).attr("data-url");
		previewPdf(url);
	});
	
});

/*
  * 回执单历史记录
  */
 function history() {
     $.ajax({
         url: historyUrl,
         type: "post",
         async:false,
         data: {
         	bidSectionId:bidSectionId,
         	supplierId:supplierId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	if(data.data && data.data.length > 0){
         		historyHtml(data.data);
         	}
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
 }
 
 // 回执历史记录
function historyHtml(data){
	var html = "";
		if($("#historyTable").length == 0){
			html += '<table id="historyTable" class="table table-bordered" style="margin-top: 5px;">\
	                	<tr>\
	                		<th style="width:50px;text-align:center;">序号</th>\
	                		<th>递交人</th>\
	                		<th style="width: 180px;text-align:center;">递交时间</th>\
	                		<th style="width: 180px;text-align:center;">撤回时间</th>\
	                		<th style="width: 140px;text-align:center;">加密情况</th>\
	                		<th style="width: 100px;">回执单</th>\
	                		<th style="width: 100px;">撤回回执单</th>\
	                	</tr>';
		}
		for(var i = 0; i < data.length; i++){
			html += '<tr>\
                		<td style="text-align:center;">'+(i+1)+'</td>\
                		<td>'+data[i].applicantionName+'</td>\
                		<td style="text-align:center;">'+(data[i].createTime ? data[i].createTime : "")+'</td>\
                		<td style="text-align:center;">'+(data[i].revokeDate ? data[i].revokeDate : "")+'</td>\
                		<td style="text-align:center;">'+(data[i].isEncryption == 1 ? "已加密文件" : "未加密文件")+'</td>\
                		<td><a class="btn-primary btn-sm btnSee" data-url="'+data[i].receiptUrl+'"><span class="glyphicon glyphicon-eye-open"></span> 预览</a></td>\
                		<td>'+(data[i].revokerReceiptUrl?'<a class="btn-primary btn-sm btnSee" data-url="'+data[i].revokerReceiptUrl+'"><span class="glyphicon glyphicon-eye-open"></span> 预览</a>':'')+'</td>\
                	</tr>';
		}
		
		if($("#historyTable").length == 0){
			html += '</table>';
			$("#historyBlock").html("");
			$(html).appendTo("#historyBlock");
		} else {
			$(html).appendTo("#historyTable");
		}
}
