var token = $.getUrlParam("Token");
var bidOpeningId = $.getUrlParam("bidOpeningId");	//开标数据id
var states = $.getUrlParam("states");	//标段状态
var ue;//复文本编辑器
$(function(){
	//初始化编辑器
	ue = UE.getEditor('container', {initialFrameHeight:390});
	
	//信息反显
	getOpenSituation();
	
	//如果状态等于4，则隐藏保存按钮
	if(states == 4){
		$('#btnSave').hide();
	}
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
	/*保存*/
	$('#btnSave').click(function(){
		//获取编写的内容
		var content = ue.getContent();
		if(content==''){
			parent.layer.alert("请填写开启记录信息", {icon: 1,title: '提示'});
		}else{
			$.ajax({
				type:"get",
				url:config.OpenBidHost + '/BidOpeningController/saveOpenSituation.do',
				data: {"id":bidOpeningId,"openSituation":content},
				async:false,
				beforeSend: function(xhr) {
					var token = $.getToken();
					xhr.setRequestHeader("Token",token);
				},
				success: function(data){
					if(data.success){
					  	parent.layer.alert("开启记录信息保存成功", {icon: 1,title: '提示'});
					}else{
						parent.layer.alert(data.message);
					}
				}
			});
		}
	});
	
})



/**
 * 查询开标记录情况
 */
function getOpenSituation(){
	$.ajax({
		type:"get",
		url:config.OpenBidHost + '/BidOpeningController/getOpenSituationInfo.do',
		data: {"id":bidOpeningId},
		async:false,
		beforeSend: function(xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
			  	situation=data.data;
			  		
			  	ue.ready(function() {
					ue.setContent(data.data);
				});
			}
		}
	});
}
		