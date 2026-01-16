/**

*  编辑结果通知
*  方法列表及功能描述
*/
var saveUrl = config.tenderHost + '/ResultNoticeController/saveItem.do';//提交通知内容的地址
var getUrl = config.tenderHost + '/ResultNoticeController/getResultNoticeItem.do';//获取通知书编辑内容
var isWinBidder;
var ue;
var isWin = 0;
var bidId;//标段id
var modelId;//模版id
var enterpriseId ;//候选人id
var employeeInfo = entryInfo();
var fileUploads = null;
var filePath=""; //文件路径
var filedata


$(function(){
	//初始化编辑器
	ue = UE.getEditor('container');
	ue.ready(function(){
 
	//	ue.execCommand('fontfamily','微软雅黑'); //字体
	 
	//	ue.execCommand('lineheight', 2); //行间距
	 
		ue.execCommand('fontsize', '21px'); //字号
	 
	});
	if($.getUrlParam('isWin')){
		isWin = $.getUrlParam('isWin');//中标通知书
	if(isWin == 1){
		//$('#noticeTemplate').html('<option value="">请选择通知书模板</option><option value="1">中标通知书</option>')
			modelOption({tempType:'letterAcceptance'});
		}else{
			//$('#noticeTemplate').html('<option value="">请选择通知书模板</option><option value="1">落标通知书</option>')
			modelOption({tempType:'outbidAcceptance'});
		}
	}
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	

})



//初始化文件上传
function initUpload(id,status){
	if(!fileUploads){
		fileUploads = new StreamUpload("#fileContent",{
			basePath:"/"+employeeInfo.enterpriseId+"/"+id+"/288",
			businessId: id,
			extFilters: [".pdf", ".cad", ".dwg", ".dxf", ".dwt",  ".png", ".jpg", ".gif", ".bmp"],  
			// status:status?1:2,
			isPreview:true,
			businessTableName:'T_NOTICE',  //    项目表附件
			attachmentSetCode:'RESULT_NOTICE_FILE',
			changeFile:function(data){
				filedata=data				
				
			},
			addSuccess:function(path){
				parent.layer.alert('上传成功！');
				var timeArr=[]
				for(var i=0;i<filedata.length;i++){

					var subDate = new Date(filedata[i].createDate).getTime() / 1000;
					timeArr.push({
						time:subDate,
						index:i
					})
					if(filedata[i].url!==path){
						fileUploads.fileDel(i)
					}

				}
				if(filedata.length>1){
					var min = timeArr[0].time
					for(var t = 0; t < timeArr.length; t++) {
						var cur = timeArr[t].time;
						cur <= min ? min = cur : null
					}
					for(var e = 0; e < timeArr.length; e++) {	
						if(min == timeArr[e].time) {
							fileUploads.fileDel(timeArr[e].index)


					}
				}
			}
				filePath=path	
			}
		});
	}
}

function saveModel(ind,subData,callback){
	if(subData.id){
		if(subData.isCompile){
			getContent(subData.id)	
			
		}else{
			$("[name='isFiles']").prop("checked","checked")
			// $('#fileUp').hide()
			// $('#fileUp').html('重新上传')
			if($("[name='isFiles']").is(":checked")){				
				$("#TemplateNo").hide();
				$("#contentText").hide();
				$("#filesList").show();
				$("#filesLists").show();
			} else {
				$("#TemplateNo").show();
				$("#contentText").show();
				$("#filesList").hide();
				$("#filesLists").hide();
	
			}
			if(!fileUploads) {
				if(subData.id){					
					initUpload(subData.id,subData.isCompile);
					fileUploads.fileList();					
				}				
			}
		}
			
	}
	
//	getContent()
	$('#btnSubmit').click(function(){
		subData.resultNotic = ue.getContent();
		isWinBidder = subData.isWinBidder;
		if(ue.getContentTxt() == ''){
			parent.layer.alert('请编辑通知内容！');
			return
		}
		$.ajax({
			type:"post",
			url:saveUrl,
			async:true,
			data: subData,
			success: function(data){
				if(data.success){
					subData.id = data.data;
					var index = parent.layer.getFrameIndex(window.name);
					callback(data.data,ind,subData.isWinBidder,1)
					parent.layer.close(index);
				}
			}
		});
	});
	$('#btnModel').click(function(){
		modelId = $('#noticeTemplate option:selected').attr('data-model-id');//选中的模板的id
		bidId = subData.bidSectionId;
		enterpriseId = subData.winCandidateId;
		var hashtml = ue.hasContents();
		if(hashtml){
			parent.layer.confirm('确定替换模板？',{icon:3,title:'询问'},function(index){
				parent.layer.close(index)
				subData.resultNotic = ue.getContent();
				$.ajax({
					type:"post",
					url:saveUrl,
					async:true,
					data: subData,
					success: function(data){
						if(data.success){
							subData.id = data.data;
							modelHtml({
								tempBidFileid: modelId,
								bidSectionId: bidId,
								supplierId: enterpriseId,
								'examType':2
							});
							callback(data.data,ind,subData.isWinBidder,0);
						}
					}
				});
//				modelHtml(modelId,bidId,enterpriseId);
				
			})
		}else{
			subData.resultNotic = ue.getContent();
			$.ajax({
				type:"post",
				url:saveUrl,
				async:true,
				data: subData,
				success: function(data){
					if(data.success){
						subData.id = data.data;
						modelHtml({
							tempBidFileid: modelId,
							bidSectionId: bidId,
							supplierId: enterpriseId,
							'examType':2
						});
						callback(data.data,ind,subData.isWinBidder,0)
					}
				}
			});
			/*modelHtml({
				tempBidFileid: modelId,
				bidSectionId: bidId,
				supplierId: enterpriseId
			});*/
		}
		//getModel(subData.supplierId,subData.bidSectionId)
	})
	
	
		//通知书形式
	$("[name='isFiles']").click(function(){
		if($(this).is(":checked")){		
			$("#TemplateNo").hide();
			$("#contentText").hide();
			$("#filesList").show();
			$("#filesLists").show();
		} else {
			if(filedata&&filedata.length>0){
				parent.layer.alert('请先删除附件后再操作！')
				$("[name='isFiles']").prop("checked","checked")
				return
			}else{
				getContent(subData.id)	
				$("#TemplateNo").show();
				$("#contentText").show();
				$("#filesList").hide();
				$("#filesLists").hide();
				if(!(subData.isCompile)){
					callback(subData.id,ind,3,3)	
				}
			}
		}
	});
		//上传按钮
	$('#fileUp').click(function(){ 
		if(!(subData.id && subData.id!="")){
				$.ajax({
				type:"post",
				url:saveUrl,
				async:true,
				data: subData,
				success: function(data){
					if(data.success){
						initUpload(data.data,subData.isCompile);
						$('#fileLoad').trigger('click');
						fileUploads.fileList();
						subData.id = data.data;
						// callback(data.data,ind,3,3)
					}
				}
			});
		}else{		
			initUpload(subData.id,subData.isCompile);
			fileUploads.fileList();
			$('#fileLoad').trigger('click');
			

		}	
	});
	/*关闭*/
	$('#btnCloses').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
		callback(subData.id,ind,3,3)
		
	
		

		
	});
}
function getContent(id){
	$.ajax({
		type: "post",
		url: getUrl,
		async: true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				//公告内容
				if(data.data){
					ue.ready(function() {
						ue.execCommand('fontsize', '21px'); //字号
					    ue.setContent(data.data);
					});
				}
			}
		}
	});
}

/*function getModel(enterId,bidId){
	var obj ={};
	obj.enterpriseId = enterId;
	obj.bidSectionId = bidId;
	if(isWin == 1){
		obj.isWin = isWin;
	}
	$.ajax({
		type:"post",
		url:modelUrl,
		async:true,
		data: obj,
		success: function(data){
			if(data.success){
				ue.ready(function() {
				    ue.setContent(data.data);
				});
			}
			
		}
	});
}*/
