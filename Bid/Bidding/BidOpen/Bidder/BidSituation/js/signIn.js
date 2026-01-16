/**

*  开标情况列表（投标人）
*  方法列表及功能描述
*/
var signUrl =  config.tenderHost  + "/BidOpeningSignInController/insertSelective.do";//签到接口
var noSignId = '';//父页面传过来的未签到的标段id
$(function(){
	
	//当前登录人信息
	var entryArr = entryInfo();
	$('#userName').val(entryArr.userName);
	$('#tel').val(entryArr.tel);
})
/*传给父页面
 * bidIds:父页面传过来的未签到的标段id
 * callback：父页面传过来的要调用的函数
 */
function fromChild(bidIds,callback){
	var index=parent.layer.getFrameIndex(window.name);
	noSignId = bidIds;
	$("#btnSubmit").click(function(){
		if(checkForm($('#formName'))){
			var sendData= parent.serializeArrayToJson($("#formName").serializeArray());
			sendData.bidSectionIds = noSignId;
			sendData.signType = 0;//签到人类型 0投标人1监标人
			$.ajax({
				type:"post",
				url:signUrl,
				async:true,
				traditional:true,
				data:sendData,
				success: function(data){
					if(data.success){
						top.layer.alert('签到成功',{icon:1,title:'提示'},function(ind){
//							top.layer.close(ind)
							callback(ind);
							parent.layer.close(index);
						});
					}
				},
				error: function(data){
					
				}
			});
		}
        
	});
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
}
