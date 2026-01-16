/**

*  发送消息（项目经理）
*  方法列表及功能描述
*/

var userUrl = config.tenderHost + "/BidOpeningSignInController/messagelist.do";  //人员列表
var sendUrl = config.tenderHost + "/BidOpeningLogController/save.do";  //发送消息

var packageId = "";  //包件id
var receiveEmployeeId = "ALL"; //投标人id
$(function(){
	if($.getUrlParam("packageid") && $.getUrlParam("packageid") != "undefined"){
		packageId = $.getUrlParam("packageid");
		userList();
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
	$("#userBoard").on("click", "li", function(){
		$(this).addClass("active").siblings("li").removeClass("active");
		receiveEmployeeId = $(this).attr("data-id");
	});
});

/**
 * 消息人员列表
 */
function userList(){
	$.ajax({
         url: userUrl,
         type: "post",
         data: {
         	packageId:packageId
         },
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	if(arr){
         		userHtml(arr);
         	}
         },
         error: function (data) {
             parent.layer.alert("请求失败");
         }
     });
}

function userHtml(data){ 
	$("#userBoard").html('');
		
	var li = '<li class="active" data-id="ALL">全部投标人</li>';
	
	for(var i=0;i<data.length;i++){
		 li += '<li data-id='+data[i].enterpriseId+'>'
			+'<div>'+data[i].enterpriseName+'</div>'
			+'</li>';
	}
	$(li).appendTo('#userBoard');
}

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
