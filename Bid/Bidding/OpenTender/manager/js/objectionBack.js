/**

*  编辑、添加异议
*  方法列表及功能描述
*/
var saveUrl = config.openingHost + '/ObjectionAnswersController/confirmRevocation.do';//保存
var detailUrl = config.openingHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口

var token = $.getUrlParam("Token");
var dataId = $.getUrlParam('dataId');//数据id
$(function(){
	
	getDetail(dataId);
	//关闭
	/*$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});*/
	//确认
	$('#btnSubmit').click(function(){
		save(dataId)
	})
})
//信息反显
function getDetail(id){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				var source = data.data;
				bidId = source.bidSectionId;
				for(var key in source){
					$('#' + key).html(source[key]);
				};
			}
		}
	});
};
//确认
function save(id){
	$.ajax({
		type:"post",
		url:saveUrl,
		async:true,
		data: {
			'id': id
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Token",token);
		},
		success: function(data){
			if(data.success){
				parent.layer.alert('撤回成功！',{icon:6,title:'提示'},function(index){
					parent.layer.closeAll()
				});
			};
			parent.initDataTab();
		}
	});
}
