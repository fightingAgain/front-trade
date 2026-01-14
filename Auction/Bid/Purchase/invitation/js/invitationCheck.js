var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var examTypeShow=1;
var examType=1//资格审查的缓存
var tenderTypeCode='0'//资格审查的缓存
var packageInfo=""//包件信息
var edittype="",yaoqing="1";
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var checkPlana=""
var publicData=[];//邀请供应商数据列表
var projectSupplementList=[];
var packagePrice;
var WORKFLOWTYPE;
var appointmentData;//预约信息
//打开弹出框时加载的数据和内容。
//打开弹出框时加载的数据和内容。
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var createType=getUrlParam('createType');
// var fileUp;//报价表
$(function(){
	// 查看公告
	new UEditorEdit({
		examType:examType,
		pageType: "view",
	});
	du(packageId);
	supplimentInt(examType);
	package();
	mediaEditor.setValue(packageInfo);
})
function du(uid){	
	$.ajax({
	   	url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){
				packageInfo=data.data;
				businessPriceSetData=packageInfo.businessPriceSetList[0];
				packagePrice=packageInfo.projectPrices
				publicData=packageInfo.projectSupplierList;
	   	  		for(var i=0;i<packageInfo.projectSupplement.length;i++){
	   	  			if(packageInfo.projectSupplement[i].examType==1){
	   	  			//if(packageInfo.projectSupplement[i].checkState==2){
	   	  				projectSupplementList.push(packageInfo.projectSupplement[i])
	   	  			//}	   	  			
	   	  			}
				}
				for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
					if(packageInfo.biddingRoomAppointment[i].examType==1){
						appointmentData=packageInfo.biddingRoomAppointment[i]
					}
				}
				if(packageInfo.offerAuditTimeout==0){
					edittype="edittype";
				}else{
					edittype="";
					$(".addSupplier").hide();
				}
				new UEditorEdit({
					pageType:"view",
					contentKey: projectSupplementList.length==0?'remark':'oldRemark'
				})
				mediaEditor.setValue(projectSupplementList.length==0?packageInfo:projectSupplementList[0])
			}
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	
//	DetailedItemData=JSON.parse(sessionStorage.getItem('DetailedItemData'));//读取分项信息的缓存		
	packageDetailData();		
	WORKFLOWTYPE = "xmgg";
	findWorkflowCheckerAndAccp(uid);
	callbackData(appointmentData)
	//getProjectPrice(packageInfo.id,packageInfo.projectId)
	
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
};
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var itemTypeNames=[]
var itemTypeIds=[]
var itemTypeCodes=[]
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml()
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	hasData()
    $("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
//	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');		
	
	if(packageInfo.checkPlan==0){
 		var checkPlans="综合评分法"; 		
 		
 	}else if(packageInfo.checkPlan==1){
 		var checkPlans="最低评标价法";		
 		
 	}else if(packageInfo.checkPlan == 2){
 		var checkPlans="经评审的最低价法(价格评分)"; 		
 		
 	}else if(packageInfo.checkPlan==3){
		var checkPlans="最低投标价法";		
		
	}else if(packageInfo.checkPlan==5){
		var checkPlans="经评审的最低投标价法";		
		
	}else if(packageInfo.checkPlan==4){
		$("#checkPlan").html("经评审的最高投标价法")
	};
 	$("#checkPlan").html(checkPlans)
	$("#noticeStartDate").val(packageInfo.noticeStartDate);
	$("#noticeEndDate").val(packageInfo.noticeEndDate);
	$("#submitExamFileEndDate").val(packageInfo.submitExamFileEndDate);
	$("#supplierCount").html(packageInfo.examType==0?packageInfo.inviteSupplierCount:packageInfo.supplierCount);
 	getProjectPrice(packagePrice);
    $("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');	
	if(packageInfo.isSellFile==0){
		$(".examType1Time").show();
	}else{
		$(".examType1Time").hide();
	} 
    if(packageInfo.isPublic==0){
 		$("#isPublic").html("所有供应商")
 	}
 	if(packageInfo.isPublic==1){
 		$("#isPublic").html("所有本公司认证供应商")
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅限邀请供应商")
 	}
 	if(packageInfo.isPublic==3){
 		$("#isPublic").html("仅邀请本公司认证供应商")
	}
	if(packageInfo.isPublic>1){	
		$(".yao_btn").show();
		Public()				
	}else{
		$(".yao_btn").hide();	
	}
};
//明细表的数据获取
function packageDetailData(){
	$.ajax({
	   	url:Detailedlist+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageInfo.id
	   	},
	   	success:function(data){	 
	   		packageDetailInfo=data.data;   			
	   	}  
	 });
	 PackageDetailed()
}
function PackageDetailed(){
	if(packageDetailInfo.length>7){
		var heightAuto='304'
	}else{
		var heightAuto=''
	}
	$('#tbodym').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:heightAuto,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "detailedName",
				title: "名称",
				align: "left",
				halign: "left",

			},
			{
				field: "detailedVersion",
				title: "型号",
				halign: "center",
				width:'200px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "detailedCount",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "detailedUnit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},
			{
				field: "detailedContent",
				title: "备注",
				halign: "left",
				align: "left",
			}
		]
	});
	$('#tbodym').bootstrapTable("load", packageDetailInfo); //重载数据
};

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