/**

*  发送消息（项目经理）
*  方法列表及功能描述
*/

var sendUrl = config.tenderHost + "/BidOpeningLogController/save.do";  //发送消息

var packageId = "";  //包件id
var receiveEmployeeId = ""; //项目经理id

$(function(){
	if($.getUrlParam("packageid") && $.getUrlParam("packageid") != "undefined"){
		packageId = $.getUrlParam("packageid");
	}
	if($.getUrlParam("employeeid") && $.getUrlParam("employeeid") != "undefined"){
		receiveEmployeeId = $.getUrlParam("employeeid");
	}
	$("#btnSubmit").click(function(){
		var news =  $('#news').val();
		var type = /\S/;
		if(news && type.test(news)){
			
        	save();
		}else{
			parent.layer.alert('不能发送空消息！',{title:'提示'},function(ind){
				parent.layer.close(ind);
			});
		}
		
	});
});



/**
 * 发送消息
 */

function save(){
	$.ajax({
         url: sendUrl,
         type: "post",
         data: {
         	packageId:packageId,
         	sendMess: $("#news").val(),
         	receiveEmployeeId: receiveEmployeeId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var index=parent.layer.getFrameIndex(window.name);
        	parent.layer.close(index);
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}
