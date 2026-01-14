/**
*  zhouyan 
*  2019-5-27
*  递交保证金
*  方法列表及功能描述
*/
var getUrl = config.tenderHost + '/DepositController/selectEnterpriseInfo.do';//发票相关信息回显
var saveUrl = config.tenderHost + '/DepositController/insertBidderDeposit.do';//保存地址
var detailUrl = config.tenderHost + '/DepositController/findDepositDetail.do';//保证金凭证详情
var bidUrl = config.tenderHost + '/BidSectionController/getBidSectionInfo.do';//查询标段相关信息

var bondId = '';//保证金id
var bidId = '';//标段id
var fileUploads = null; //上传文件
var fileData = [];//文件数据
var examType = '';
$(function(){
	/*if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		bondId = $.getUrlParam('id');//保证金id
	}*/
	if($.getUrlParam('id') && $.getUrlParam('id') != undefined){
		bidId = $.getUrlParam('id');//保证金id
	}
	if($.getUrlParam('examType') && $.getUrlParam('examType') != undefined){
		examType = $.getUrlParam('examType');//保证金id
	}
	getBidInfo(bidId);
	getDetail(bidId,examType);
	getInfo();
	$('[name="invoiceGetType"]').change(function(){
//		console.log(this.value)
		if(this.value == 1){
			$('.get_method_two').css('display','none');
			$('.get_method_one').css('display','table-row');
			$('.get_method_one').find('input').prop('disabled',false);
			$('.get_method_two').find('input').prop('disabled',true);
			$('.get_method_one').find('[name="addressee"]').attr('datatype','*');
			$('.get_method_one').find('[name="addresseeIdCard"]').attr('datatype','IDCard');
			$('.get_method_one').find('[name="addresseePhone"]').attr('datatype','phone');
			$('.get_method_one').find('[name="deliveryAddress"]').attr('datatype','*');
			$('.get_method_two').find('input').removeAttr('datatype');
		}else if(this.value == 2){
			$('.get_method_one').css('display','none');
			$('.get_method_two').css('display','table-row');
			$('.get_method_one').find('input').prop('disabled',true);
			$('.get_method_two').find('input').prop('disabled',false);
			$('.get_method_two').find('[name="addressee"]').attr('datatype','*');
			$('.get_method_two').find('[name="addresseeIdCard"]').attr('datatype','IDCard');
			$('.get_method_two').find('[name="addresseePhone"]').attr('datatype','phone');
//			$('.get_method_two').find('[name="deliveryAddress"]').attr('datatype','*');
			$('.get_method_one').find('input').removeAttr('datatype');
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	
})
function getBidInfo(id){
	$.ajax({
		type:"post",
		url:bidUrl,
		async:false,
		data:{
			'id': id
		},
		success: function(data){
			if(data.success){
				if(data.data){
					var arr = data.data;
					var depositType = '';//保证金递交
					var money = '';//标段设置的保证金金额
					if(arr.depositType == 1){
						depositType = '固定金额';
						money = arr.depositMoney;
					}else if(arr.depositType == 2){
						depositType = '比例';
						money = arr.depositRatio+'%';
						$('.bond_unit').css({'display':'none'});
					};
					
					for(var key in arr){
						if(key == 'depositMoney' || key == 'depositRatio'){
							$('#depositMoney').html(money)
						}else{
							$('#'+key).html(arr[key])
						}
					}
					$("[name='bidSectionId']").val(arr.id);
					$('#depositType').html(depositType);
//					$('[name="bidSectionId"]').val(arr.bidSectionId);
					
					if(arr.depositId){
						$('[name="id"]').val(arr.depositId);
//						getDetail(data.depositId)
					}
					if(arr.depositChannel){
						var type = arr.depositChannel.split(',');
						if(type.length>0){
							var options = '';
							$('[name=depositChannel]').html('');
							for(var j = 0;j<type.length;j++){
								var optionText = '';
								if(type[j] == 1){
									optionText = '资金现金';
								}else if(type[j] == 2){
									optionText = '银行保函';
								}else if(type[j] == 3){
									optionText = '担保';
								}else if(type[j] == 4){
									optionText = '电汇';
								}else if(type[j] == 5){
									optionText = '汇票';
								}else if(type[j] == 6){
									optionText = '支票';
								}else if(type[j] == 7){
									optionText = '虚拟子账户';
								}else if(type[j] == 9){
									optionText = '其他';
								}
								options += '<option value="'+type[j]+'">'+optionText+'</option>'
							}
							$(options).appendTo('[name=depositChannel]');
							
						}
					}
					
					
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}

function passEdit(data){
	/*var depositType = '';//保证金递交
	var money = '';//标段设置的保证金金额
	if(data.depositType == 1){
		depositType = '固定金额';
		money = data.depositMoney;
	}else if(data.depositType == 2){
		depositType = '比例';
		money = data.depositRatio+'%';
		$('.bond_unit').css({'display':'none'});
	};
	
	for(var key in data){
		if(key == 'depositMoney' || key == 'depositRatio'){
			$('#depositMoney').html(money)
		}else{
			$('#'+key).html(data[key])
		}
	}
	$('#depositType').html(depositType);
	$('[name="bidSectionId"]').val(data.bidSectionId);
	
	if(data.depositId){
		$('[name="id"]').val(data.depositId);
		getDetail(data.depositId)
	}
	
	var type = data.depositChannel.split(',');
	if(type.length>0){
		var options = '';
		$('[name=depositChannel]').html('');
		for(var j = 0;j<type.length;j++){
			var optionText = '';
			if(type[j] == 1){
				optionText = '资金现金';
			}else if(type[j] == 2){
				optionText = '银行保函';
			}else if(type[j] == 3){
				optionText = '担保';
			}else if(type[j] == 4){
				optionText = '电汇';
			}else if(type[j] == 5){
				optionText = '汇票';
			}else if(type[j] == 6){
				optionText = '支票';
			}else if(type[j] == 9){
				optionText = '其他';
			}
			options += '<option value="'+type[j]+'">'+optionText+'</option>'
		}
		$(options).appendTo('[name=depositChannel]');
		
	}*/
	
};
function getInfo(){
	$.ajax({
		type:"post",
		url:getUrl,
		async:false,
		success: function(data){
			if(data.success){
				for(var key in data.data){
					$('#'+key).val(data.data[key])
				}
			}
		}
	});
};
//修改时的详情
function getDetail(id,examType){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:false,
		data: {
			'bidSectionId':id,
			'examType': examType
		},
		success: function(data){
			if(data.success){
				if(data.data){
					var arr = data.data;
					bondId = arr.id;
					for(var key in arr){
						var newEle = $("[name='"+key+"']");
//						var arr = data.data;
	            		if(newEle.prop('type') == 'radio'){
	            			newEle.val([arr[key]]);
	
	            		}else if(newEle.prop('type') == 'checkbox'){
	            			newEle.val(arr[key]?arr[key].split(','):[]);
	            		}else{
	            			newEle.val(arr[key]);
	            		}
	            		if(arr.invoiceGetType == 1){
							$('.get_method_two').css('display','none');
							$('.get_method_one').css('display','table-row');
							$('.get_method_one').find('input').prop('disabled',false);
							$('.get_method_two').find('input').prop('disabled',true);
							$('.get_method_one').find('[name="addressee"]').attr('datatype','*');
							$('.get_method_one').find('[name="addresseeIdCard"]').attr('datatype','IDCard');
							$('.get_method_one').find('[name="addresseePhone"]').attr('datatype','phone');
							$('.get_method_one').find('[name="deliveryAddress"]').attr('datatype','*');
							$('.get_method_two').find('input').removeAttr('datatype');
						}else if(arr.invoiceGetType == 2){
							$('.get_method_one').css('display','none');
							$('.get_method_two').css('display','table-row');
							$('.get_method_one').find('input').prop('disabled',true);
							$('.get_method_two').find('input').prop('disabled',false);
							$('.get_method_two').find('[name="addressee"]').attr('datatype','*');
							$('.get_method_two').find('[name="addresseeIdCard"]').attr('datatype','IDCard');
							$('.get_method_two').find('[name="addresseePhone"]').attr('datatype','phone');
				//			$('.get_method_two').find('[name="deliveryAddress"]').attr('datatype','*');
							$('.get_method_one').find('input').removeAttr('datatype');
						}
	//					$('[name="'+key+'"]').val(data.data[key])
					};
					if(!fileUploads){
						fileUploads = new StreamUpload("#fileContent",{
							basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+bondId+"/603",
							businessId: bondId,
							status:1,
							extFilters: ['.png','.PNG','.pdf','.PDF'],  //上传文件类型
							businessTableName:'T_BIDDER_DEPOSIT',  
							attachmentSetCode:'BOND_DOC',
							changeFile: function(data){
								fileData = data;
							}
						});
					}
					if(data.data.projectAttachmentFiles){
						fileUploads.fileHtml(data.data.projectAttachmentFiles);
						fileData = data.data.projectAttachmentFiles;
					}
				}
			}else{
				parent.layer.alert(data.message)
			}
		}
	});
}
/*
 * 保存： isSave 0:保存 1：提交
 * isTips : 保存时是否需要提示
 */
function save(isSave,isTips,callback,back){
	var arr = parent.serializeArrayToJson($("#addNotice").serializeArray());
	if(isSave == 0){
		arr.depositStatus = 0;
	}else if(isSave == 1){
		arr.depositStatus = 1;
	};
	$.ajax({
		type:"post",
		url:saveUrl,
		async:false,
		data: arr,
		success: function(data){
			if(data.success){
				if(callback){
					callback()
				}
				if(back){
					back(data.data)
				}
				$('[name="id"]').val(data.data);
				bondId = data.data;
				parent.$('#tableList').bootstrapTable('refresh');
				if(isSave == 1){
					parent.layer.alert('提交成功！',{icon:6,title:'提示'});
					var index=parent.layer.getFrameIndex(window.name);
                	parent.layer.close(index);
				}else if(isSave == 0){
					if(isTips){
						parent.layer.alert('保存成功！',{icon:6,title:'提示'});
					}
					
				}
				
			}
			if(data.success == false){
				parent.layer.alert(data.message,{icon:6,title:'提示'});
			}
		}
	});
}
function passMessage(data,callback){
	//保存
	$('#btnSave').click(function(){
		save(0,true,callback);
	})
	//提交
	$('#btnSubmit').click(function(){
		if(checkForm($("#addNotice"))){//必填验证，在公共文件unit中
			if($.trim($('[name=bidderLink]').val()) != '' && $.trim($('[name=bidderLink]').val()).length > 10){
				parent.layer.alert('请正确输入联系人！');
				return
			}
			if(fileData.length == 0){
				parent.layer.alert('请上传投标保证金底单扫描件！',function(ind){
					parent.layer.close(ind);
					$('#collapseTwo').collapse('show');
				});
				return
			}else{
				parent.layer.alert('确认提交审核？',function(index){
					parent.layer.close(index);
					save(1,false,callback);
				})
			}
		}
	});
	/*
	 *上传文件
	 * */
	$('#fileUp').click(function(){
		if(!(bondId != ""&&bondId != null)){
			save(0,false,callback,function(businessId){
				bondId = businessId;
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+bondId+"/603",
						businessId: bondId,
						status:1,
						extFilters: ['.png','.PNG','.pdf','.PDF','.jpg','.JPG'],  //上传文件类型
						businessTableName:'T_BIDDER_DEPOSIT',
						attachmentSetCode:'BOND_DOC',
						changeFile: function(data){
							fileData = data
						}
					});
				}
				$('#fileLoad').trigger('click');
			});
		}else{
			//上传文件
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+entryInfo().enterpriseId+"/"+bidId+"/"+bondId+"/603",
					businessId: bondId,
					status:1,
					extFilters: ['.png','.PNG','.pdf','.PDF','.jpg','.JPG'],  //上传文件类型
					businessTableName:'T_BIDDER_DEPOSIT',
					attachmentSetCode:'BOND_DOC',
					changeFile: function(data){
						fileData = data
					}
				});
			}
			$('#fileLoad').trigger('click');
		}
		
			
	});
}
