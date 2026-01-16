/*

 * 
 * 开标时评审参数的设置
 * */
var saveUrl = config.OpenBidHost + '/BidSectionDataController/saveBidSectionData.do';//提交
var bidSectionId = '';
var examType = '';
var setData = [];
var CAcf = null;  //实例化CA
$(function(){
	bidSectionId = $.getUrlParam('id');
	examType = $.getUrlParam('examType');
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$('#set_list').on('click','.value_choose',function(){
		var ele = $(this).closest('.set_value')
		$(this).removeClass('no_choose_value').addClass('choose_value');
		$(this).siblings().removeClass('choose_value').addClass('no_choose_value');
		$(ele).find('.save_val').val($(this).attr('data-value'));
	})
	$('#btnSave').click(function(){
		if($('.choose_value').length < setData.length){
			parent.layer.alert('请选择参数！')
		}else{
			/*var param =$('#formName').serializeArray();
			param.bidSectionId = bidSectionId;
			param.examType = examType;
			console.log(param);*/
			parent.layer.confirm('确认生效?', {icon: 3,title: '询问'},function(index){
//				var param =$('#formName').serializeArray();
//				console.log(param)
				/*$.ajax({
					type:"post",
					url:saveUrl,
					async:true,
					data: param,
					success: function(data){
						if(data.success){
							var index = parent.layer.getFrameIndex(window.name);
							parent.layer.close(index);
						}else{
							parent.layer.alert(data.message)
						}
					}
				});*/
				if(!CAcf){
					CAcf = new CA({
						target:"#formName",
						confirmCA:function(flag){ 
							if(!flag){  
								return;
							}
							var param =$('#formName').serializeArray();
//							param.bidSectionId = bidSectionId;
//							param.examType = examType;
							$.ajax({
								type:"post",
								url:saveUrl,
								async:true,
								data: param,
								success: function(data){
									if(data.success){
										var index = parent.layer.getFrameIndex(window.name);
										parent.layer.close(index);
									}else{
										parent.layer.alert(data.message)
									}
								}
							});
						}
					});
				}
				CAcf.sign();
				parent.layer.close(index);
			})
		}
	})
})
function passMessage(data){
	setData = data;
	if(data.length > 0){
		setHtml(data)
	}
}
function setHtml(data){
	var html = '';
	$('#set_list').html('');
	var isShow = false;
	for(var i = 0;i<data.length;i++){
		var val = data[i].constEnum;
		var valList = val.split(',');
		if(!data[i].dataValue){
			isShow = true
		}
		html += '<div class="set_box">';
   			html += '<h3>请选择抽取的'+data[i].variableChinaName+'值并进行CA确认</h3>';
   			html += '<div class="set_value">';
   				for(var m = 0;m < valList.length;m++){
   					if(data[i].dataValue){
   						if(data[i].dataValue == valList[m]){
   							html += '<span class="data_value choose_value" data-value="'+valList[m]+'">'+valList[m]+'</span>';
   						}else{
   							html += '<span class="data_value no_choose_value" data-value="'+valList[m]+'">'+valList[m]+'</span>';
   						}
   					}else{
   						html += '<span class="data_value no_choose_value value_choose" data-value="'+valList[m]+'">'+valList[m]+'</span>';
   					}
   					
   				}
   				html += '<input type="hidden" name="bidSectionDatas['+i+'].dataType" value="'+data[i].dataType+'"/>';
   				html += '<input type="hidden" name="bidSectionDatas['+i+'].dataName" value="'+data[i].variableChinaName+'"/>';
   				html += '<input type="hidden" class="save_val" name="bidSectionDatas['+i+'].dataValue" value=""/>';
   				html += '<input type="hidden" name="bidSectionId" value="'+bidSectionId+'"/>';
   				html += '<input type="hidden" name="examType" value="'+examType+'"/>';
   			html += '</div>';
   			/*html += '<div class="set_test CA_test">';
   				html += '<button type="button" class="btn btn-primary" id="btnSave">CA确认</button>';
   			html += '</div>';*/
   		html += '</div>';
	}
	$(html).appendTo('#set_list');
	if(isShow){
		$('#btnSave').show()
	}else{
		$('#btnSave').hide()
	}
}
