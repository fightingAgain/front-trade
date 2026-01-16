/**

*  推荐组长
*  方法列表及功能描述
*/
var memberUrl = config.tenderHost + '/ExpertRecommendController/findExpertMembers.do';//查询评审委员会信息
var saveUrl = config.tenderHost + '/ExpertRecommendController/saveExpertRecommend.do';//保存评委的推荐组长的投票数据
var bidId = '';//标段Id
var examType = '';//资格审查方式 1为资格预审，2为资格后审
var reviewMember = [];//评审委员
$(function(){
	//关闭
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	if(getUrlParam("examType") && getUrlParam("examType") != "undefined"){
		examType =  getUrlParam("examType");
	};
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		bidId =  getUrlParam("id");
	};
	getMembers(bidId,examType)
	//推荐
	$('#btnSubmit').click(function(){
		save()
	});
	
})
function getMembers(bid,type){
	$.ajax({
		type:"post",
		url:memberUrl,
		async:true,
		data: {
			'packageId': bid,
			'examType':type
		},
		success: function(data){
			if(data.success){
				var icon = data.data;
				memberList(icon)
				
			}
		}
	});
}
function memberList(data){
	$('#memberList').html('');
	var li = '';
	for (var i = 0;i<data.length;i++) {
		li += '<li><input type="radio" class="" name="chairManId" value="'+data[i].expertId+'">'+data[i].expertName+'</li>'
	};
	$(li).appendTo('#memberList');
}
function save(){
	var arr = parent.serializeArrayToJson($("#formName").serializeArray());
	arr.bidSectionId = bidId;
	arr.examType = examType;
	if(!arr.chairManId){
		parent.layer.alert('请选择组长！', {icon: 7,title: '提示'});
	}else{
		$.ajax({
			type:"post",
			url:saveUrl,
			async:true,
			data:arr,
			success: function(data){
				if(data.success){
					parent.layer.alert('保存成功！', {icon: 1,title: '提示'});
					var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					parent.layer.closeAll();
//					parent.layer.close(index); //再执行关闭  
					parent.$("#tableList").bootstrapTable('refresh');
				}else{
					parent.layer.alert(data.message, {icon: 2,title: '提示'});
				}
				
			}
		});
	}
}
