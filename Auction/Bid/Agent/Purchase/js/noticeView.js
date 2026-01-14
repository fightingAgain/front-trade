var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var saveProjectPackage=config.bidhost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var projectData=[];
var releaseForm='';
var noticeInfoFilePath='';
var examTypes;
var isCheck;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var keyId=getUrlParam('keyId');//变更列表传值
// var fileUp;//报价表
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function(){
	if(projectId){
		Purchase(projectId);
		du(packageId, examType);
		console.log(keyId)
		if(keyId){
			packsuppliment();
			package();
			SupplementInfo(keyId);	
		}else{
			suppliment();
			findWorkflowCheckerAndAccp(packageId);
			if(sysEnterpriseId&&packageInfo.packageSource==1){
				var arrlist = sysEnterpriseId.split(',');
				if(arrlist.indexOf(top.enterpriseId)!=-1){
					getDeposit()
				}
			}	
			initUEditor(packageInfo)
		}	
		callbackData(appointmentData)
		$("#btn_close").on('click',function(){
			parent.layer.close(parent.layer.getFrameIndex(window.name));	
		});
		/*start报价*/
		/* offerFormData();
		fileList(); */
		/*end报价*/
		$(".isNotShow").show();
		
	}
	
})
function initUEditor(packageInfo){
	/* 正常公告与变更公告公用一个js, 查看变更时取findProjectSupplementInfo.do接口数据，参数packageInfo里old为变更前的数据，正常的为当前数据。
	 查看原始公告： 参数packageInfo为当前标段所有数据（原始、变更），packageInfo中外层数据为最新数据；有变更是则有projectSupplementList。故：有变更时取projectSupplementList[0]
	 中的old数据，无变更时取packageInfo中外层数据
	 */
	new UEditorEdit({
		pageType:"view",
		examType:examType,
		contentKey: (keyId || projectSupplementList.length==0)?'remark':'oldRemark'
		// echoObj:echoObj,
	})
	console.log(packageInfo)
	mediaEditor.setValue((keyId ||projectSupplementList.length==0)?packageInfo:projectSupplementList[0])
}

//获取询比公告发布的数据
function Purchase(uid){		
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':uid,			
		},
		success: function(data) {			
			projectData=data.data;
			
			// var echoObj = {publishType:2,pdfUrl:"/df2023/20240325/pdf/0abb5a67e86c49c8b64639b84b44da93.pdf"}
			

			PurchaseData();	
		}
	});	
};
function PurchaseData(){
	 //渲染公告的数据
	    $('div[id]').each(function(){
			$(this).html(projectData[this.id]);
		});
		$("#examTypes").html(projectData.examType==0?'资格预审':'资格后审');
        if(projectData.projectType==0){
        	$('.engineering').show()
        }else{
        	$('.engineering').hide()
        }    
        if(projectData.isAgent==1){
        	$('.isAgent1').show()
        }else{
        	$('.isAgent1').hide()
        }
};
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));	

});

/*satrt报价表*/
/* function offerFormData(){
	$("#offerForm").offerForm({
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageId,
			projectId:projectId, 
			examType:examType,
		},
		status:2,//1为编辑2为查看
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(isOfferDetailedItem,offerAttention){
	if(isOfferDetailedItem==undefined){
		isOfferDetailedItem = packageInfo.isOfferDetailedItem;
	}
	if(offerAttention==undefined){
		offerAttention = packageInfo.offerAttention;
	}
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageId,
				projectId:projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:isOfferDetailedItem,//是否需要分项报价
			offerAttention:offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		});
	}

} */
/*end报价表*/
//原项目保证金转移到本项目
function getDeposit(){
	$("#depositHtml").deposit({			
		status:2,//1为编辑2为查看
		tenderType:0,
		parameter:{//接口调用的基本参数
			projectId:packageInfo.projectId,
			packageId:packageInfo.id, 
			projectForm:0,
		},
		isPayDeposit:packageInfo.isPayDeposit,
		packageData:[
			{
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
				projectForm:0
			}
		]
	})
}