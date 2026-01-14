/**
*  zhouyan 
*  2019-6-2
*  编辑、添加异议
*  方法列表及功能描述
*/
var saveUrl = config.tenderHost + '/ObjectionAnswersController/confirmRevocation.do';//保存
var detailUrl = config.tenderHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口

var dataId = '';//数据id
var bidSectionId = '', objectionType;//标段id
$(function(){
	dataId = $.getUrlParam('dataId');
	bidSectionId = $.getUrlParam('bidSectionId');
	objectionType = $.getUrlParam('objectionType');//"1":"资格预审文件","4":"招标文件","5":"开标","7":"中标候选人公示"
	var examType = objectionType ==1?'1':'2';
	isShowSupplierInfo(bidId, examType, '', function(data){
		if(data.isShowSupplier == 1 || data.isShowBidFile ==1){
			getDetail(dataId, '1');
		}else{
			getDetail(dataId, '0');
		}
	})
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
function getDetail(id, isShowSupplier){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'id': id,
			'isShowSupplier': isShowSupplier
		},
		success: function(data){
			if(data.success){
				var source = data.data;
				bidId = source.bidSectionId;
				for(var key in source){
					$('#' + key).html(source[key]);
				};
			} else {
				parent.layer.alert(data.message);
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
		success: function(data){
			if(data.success){
				parent.layer.alert('撤回成功！',{icon:6,title:'提示'},function(index){
					parent.layer.closeAll()
				});
			} else {
				parent.layer.alert(data.message);
			}
			parent.$('#tableList').bootstrapTable('refresh');
		}
	});
}
