 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var projectData=[];
var isCheck,examTypeShow;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');//阶段
var keyId=getUrlParam('keyId');
var createType=getUrlParam('createType');
var supplier=getUrlParam('supplier');
var yaoqing='2';//判断是邀请供应商还是发送邀请函
// var fileUp; //报价
var purchaseExamType = getUrlParam('purchaseExamType')||1;//资格审查方式
$(function(){
	new UEditorEdit({
		pageType:"view",
		contentKey: purchaseExamType == 1?'remark':'examRemark',
		// echoObj:echoObj,
	})
	
	if(projectId!=""&&projectId!=undefined&&projectId!=null){
		PurchaseIn(projectId);
		du(packageId, examType);
		mediaEditor.setValue(packageInfo)
		packsupplimentInt(projectData.examType);
		SupplementInfo(keyId);
		callbackData(appointmentData);
		
		
		/*start报价*/
	/* 	offerFormData();
		fileList(); */
		/*end报价*/
		$(".isNotShow").show();
		Public();
		
	}
	if(supplier){
		$(".supplier").hide();
	}
})
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
//获取询比公告发布的数据
function PurchaseIn(uid){		
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
			examTypeShow=projectData.examType;
			  
			PurchaseData();
		}
	});	
	
	
};

//获取审核人列表
$.ajax({
	   	url:WorkflowUrl,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	data:{
	   		"workflowLevel":0,
	   		"workflowType":"xmby"
	   	},
	   	success:function(data){	
	   		
	   	   var option=""
	   	   //判断是否有审核人		   
	   	   if(data.message==0){	
	   	   		isCheck = true;
	   	   	    $("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
	   	   	    $('.employee').hide()
	   	   	    return;
	   	   	};
	   	   if(data.message==2){		   	   	
	   	   	 	parent.layer.alert("找不到该级别的审批人,请先添加审批人");
	   	   	 	massage2=data.message;
     	        return;
	   	   };
	   	   if(data.success==true){
	   	   	 $('.employee').show()
	   	   	 if(data.data.length==0){
		   	   	option='<option>暂无审核人员</option>'
		   	   }
		   	   if(data.data.length>0){
		   	   	workflowData=data.data
		   	   	option="<option value=''>请选择审核人员</option>"
		   	   	 for(var i=0;i<data.data.length;i++){
			   	   	 option+='<option value="'+data.data[i].employeeId+'">'+data.data[i].userName+'</option>'
			   	}
		   	   }		   	   			   	  			   	  
	   	   }		   	    
	   	   $("#employeeId").html(option);	
	   	}
});
function PurchaseData(){
	 //渲染公告的数据
	    $('div[id]').each(function(){
			$(this).html(projectData[this.id]);
		});
		$("#examTypeName").html(projectData.examType==0?'资格预审':'资格后审')
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
        
}

/*satrt报价表*/
/* function offerFormData(pid, pkid){
	if(!pid){
		pid = projectId;
	}
	if(!pkid){
		pkid = packageId;
	}
	$("#offerForm").offerForm({
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:pkid,
			projectId:pid, 
			examType:examType,
		},
		status:2,//1为编辑2为查看
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(isOfferDetailedItem,offerAttention,pid, pkid){
	if(isOfferDetailedItem==undefined || isOfferDetailedItem==""){
		isOfferDetailedItem = packageInfo.isOfferDetailedItem;
	}
	if(offerAttention==undefined || offerAttention==""){
		offerAttention = packageInfo.offerAttention;
	}
	if(!pid){
		pid = projectId;
	}
	if(!pkid){
		pkid = packageId;
	}
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:pkid,
				projectId:pid, 
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