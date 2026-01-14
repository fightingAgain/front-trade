/**
*  hwf 
*  2019-5-20
*/
var projectPage = "Bidding/Contract/EntrustContract/model/biddingProjectList.html";//选择招标项目页面
var enterpriseHtml = "Bidding/Model/enterpriseList.html";  //招标人页面

var tenderProjectUrl = config.tenderHost + '/MandateContractController/get.do';//招标项目接口
var contractUrl = config.tenderHost + '/MandateContractController/get.do';//合同详情
var saveUrl = config.tenderHost + '/MandateContractController/save.do';//保存

 var employeeInfo = entryInfo();
 var fileUploads = null;

var contractId = '';//合同id
var tenderProjectId = "";  //招标项目id
var registerInfo = entryInfo();//当前登录人信息

var source;  //1是合同菜单， 2是从招标项目合同列表添加合同
$(function(){
	if($.getUrlParam('source') && $.getUrlParam('source') != undefined){
		source = $.getUrlParam('source');
	}
	if($.getUrlParam('contractId') && $.getUrlParam('contractId') != undefined){
		contractId = $.getUrlParam('contractId');
//		$("#btnChoose").hide();
		getContractDetail(contractId);
	}else{
		$('#agencyEnterprisName').val(registerInfo.enterpriseName);
		$('#agencyEnterprisId').val(registerInfo.enterpriseId);
	}
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
	//上传委托合同
	$('#fileUp').click(function(){
		if($("[name='projectName']").val()==""){
			parent.layer.alert("请填写项目名称",{icon:7,title:'提示'});
			return;
		}
		if(!(contractId && contractId!="")){
			saveForm(false,false, function(){
				//上传文件
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+employeeInfo.enterpriseId+"/"+contractId+"/217",
						businessId: contractId,
						status:1,
						businessTableName:'T_MANDATE_CONTRACT',  //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode:'CONTRACT_DOC'
					});
				}
				$('#fileLoad').trigger('click');
			});
			
		}else{
		//上传文件
			if(!fileUploads){
				fileUploads = new StreamUpload("#fileContent",{
					basePath:"/"+employeeInfo.enterpriseId+"/"+contractId+"/217",
					businessId: contractId,
					status:1,
					businessTableName:'T_MANDATE_CONTRACT',  //立项批复文件（项目审批核准文件）    项目表附件
					attachmentSetCode:'CONTRACT_DOC'
				});
			}
			$('#fileLoad').trigger('click');
		}
		
		
	});
	//选择招标人
	$("#tenterChoose").click(function(){
//		isMulti = false;
		openEnterprise();
	});
	//删除
	$("#table_member").on('click','.btnDel',function(){
		
	});
	//保存
	$('#btnSave').click(function(){
		saveForm(false,true);
	});
	//确认
	$('#btnSubmit').click(function(){
		if(checkForm($("#formName"))){
			if($('#fileContent table tr').length < 1){
				parent.layer.alert('请上传委托合同！')
			}else{
				saveForm(true);
			}
		}
	});
	$("#btnChoose").click(function(){
		openChoose();
	});
});

/*
 * 打开选择招标项目页面
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openChoose(){
	var width = window.$(parent).width() * 0.9;
	var height = window.$(parent).height() * 0.9;
	top.layer.open({
		type: 2,
		title: '招标项目',
		area: [width + 'px', height + 'px'],
		resize: false,
		content: projectPage,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage({callback:chooseCallback});  //调用子窗口方法，传参
		}
	});
}

// 选择招标项目回调方法
function chooseCallback(data){
	if(data.length > 0){
		tenderProjectId = data[0].id;
		tenderProjectDetail();
	}
}

/*
 * 保存
 * isSave: true 提交 false 保存
 * isTips：true 保存时有提示 false 保存时无提示  
 */
function saveForm(isSave,isTips, callback){
	var obj = parent.serializeArrayToJson($("#formName").serializeArray());
	if(contractId != ""){
		obj.id = contractId;
	}
	if(isSave){
		obj.contractState = 1;
	}else{
		obj.contractState = 0;
	}
	if($('#contractName').val() == ''){
		parent.layer.alert('请输入委托合同名称！')
		return
	}
	$.ajax({
		type:"post",
		url:saveUrl,
		data: obj,
		async:false,
		success: function(data){
			if(data.success){
				contractId = data.data;
				if(callback){
					callback();
				}
				if(isSave){
					parent.layer.alert('提交成功！');
					if(source == 2){
						var idx=parent.layer.getFrameIndex(window.name);
								parent.layer.close(idx);
					} else {
						parent.layer.closeAll();
					}
				};
				if(isTips){
					parent.layer.alert('保存成功！')
				};
				parent.$("#tableList").bootstrapTable("refresh");
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
function getContractDetail(id){
	$.ajax({
		type: "post",
		url: contractUrl,
		async: true,
		data: {
			'id': id
		},
		success: function(data){
			if(data.success){
				var row = data.data;
				for(var key in data.data){
					$("[name='"+key+"']").val(data.data[key]);
				}
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						basePath:"/"+employeeInfo.enterpriseId+"/"+contractId+"/217",
						businessId: contractId,
						status:1,
						businessTableName:'T_MANDATE_CONTRACT',  //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode:'CONTRACT_DOC'
					});
				}
				if(row.projectAttachmentFiles && row.projectAttachmentFiles.length > 0){
					fileUploads.fileHtml(row.projectAttachmentFiles);
				}
			}
		}
	});
}
//招标项目详情
function tenderProjectDetail(){
	$.ajax({
		type: "post",
		url: tenderProjectUrl,
		data: {
			'id': tenderProjectId
		},
		success: function(data){
			if(data.success){
				var row = data.data;
				if(contractId == ""){
					$("[name='tenderProjectId']").val(row.id ? row.id : "");
					$("[name='interiorTenderProjectCode']").val(row.interiorTenderProjectCode ? row.interiorTenderProjectCode : "");
					$("[name='tenderProjectName']").val(row.tenderProjectName ? row.tenderProjectName : "");
					$("[name='tenderProjectCode']").val(row.tenderProjectCode ? row.tenderProjectCode : "");
					$("[name='tendererEnterprisName']").val(row.tendererName ? row.tendererName : "");
					$("[name='agencyEnterprisName']").val(row.tenderAgencyName ? row.tenderAgencyName : "");
					$("[name='agentName']").val(row.tenderAgencyLinkmen ? row.tenderAgencyLinkmen : "");
					$("[name='agentTel']").val(row.tenderAgencyLinktel ? row.tenderAgencyLinktel : "");
				}
				if(row.bidSections && row.bidSections.length > 0){
					var html = '<table class="table table-bordered"><tr><th>标段编号</th><th>标段名称</th></tr>';
					for(var i = 0; i < row.bidSections.length; i++){
						html += '<tr><td>'+row.bidSections[i].interiorBidSectionCode+'</td><td>'+row.bidSections[i].bidSectionName+'</td></tr>'
					}
					html += '</table>';
				}
				$(html).appendTo("#bidSectionTab");
			}
		}
	});
}
/*
  * 打开招标人页面
  */
function openEnterprise(){
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	parent.layer.open({
		type: 2,
		title: "招标人",
		area: ['1000px', '650px'],
		resize: false,
		content: enterpriseHtml,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			
			iframeWin.passMessage({isMulti:false, callback:enterpriseCallback});  //调用子窗口方法，传参
			
		}
	});
} 

/*
 * 同级页面返回参数
 */
function enterpriseCallback(data){
//	console.log(data);
	if(data.length == 0){
		parent.layer.alert("招标人不能为空");
	}else{
		$('#enterpriseName').val(data[0].legalName);
		$('#tendererEnterprisId').val(data[0].id);
	}
}