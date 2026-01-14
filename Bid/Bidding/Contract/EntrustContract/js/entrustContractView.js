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
$(function(){
	if($.getUrlParam('contractId') && $.getUrlParam('contractId') != undefined){
		contractId = $.getUrlParam('contractId');
		getContractDetail(contractId);
	}
	
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	});
});


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
					$("#"+key).html(data.data[key]);
				}
				if(!fileUploads){
					fileUploads = new StreamUpload("#fileContent",{
						businessId: id,
						status:2,
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
 * 同级页面返回参数
 */
function enterpriseCallback(data){
//	console.log(data);
	$('#enterpriseName').val(data[0].enterpriseName);
	$('#tendererEnterprisId').val(data[0].id);
}