var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var WorkflowUrl=config.bidhost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var pricelist=config.bidhost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var pricesave=config.bidhost +'/ProjectPriceController/saveProjectPrice.do'//费用添加
var priceupdate=config.bidhost +'/ProjectPriceController/updateProjectPrice.do'//费用修改
var pricedelete=config.bidhost +'/ProjectPriceController/deleteProjectPrice.do'//费用删除
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var findInitMoney = config.bidhost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetail.do"; //查询保证金账号
var findSupplier=config.bidhost + '/PurchaseController/findExamTypeSupplierList.do'
var opurl =config.Syshost +  "/OptionsController/list.do";
var saveProjectPackage=config.bidhost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var packagePrice = [];//费用信息
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var examTypeShow=1;
var examType=1;
var edittype="";//判断是否需要操作
var yaoqing='0'//判断是邀请供应商还是发送邀请函
var supplier=new Array();
var projectType = getUrlParam("projectType");
var isCheck=false;//判断是否设置了审核人。false为设置了true为没有设置
var packageInfo=""//包件信息
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var checkPlana=""
var publicData=[];//邀请供应商数据列表
var appointmentData;//预约信息
//打开弹出框时加载的数据和内容。
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
var WORKFLOWTYPE = 'xmgg';
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var projectType = getUrlParam("projectType");
var createType=getUrlParam('createType');
// var fileUp; //报价
$(function(){
	new UEditorEdit({
		examType:examType,
	});
	if(packageId){
		du(packageId);
		invitDatetimepicker(examType);
		packageDetailData();
		mediaEditor.setValue(packageInfo);
	}
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
	},1000)
})
function du(uid){
	$.ajax({
	   	url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do',
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
				packagePrice=packageInfo.projectPrices
				businessPriceSetData=packageInfo.businessPriceSetList[0]
				publicData=packageInfo.projectSupplierList;
				for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
					if(packageInfo.biddingRoomAppointment[i].examType==1){
						appointmentData=packageInfo.biddingRoomAppointment[i]
					}
				}
	   	  	if(packageInfo.offerAuditTimeout==0){
	   	  		edittype="edittype";
	   	  	}else{
	   	  		edittype="";
	   	  		
	   	  	}	   	  	
	   	  }
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		
	   	}
	});
	packageInfo.examRsk=1;
	package();		
	previewC();
	if(projectType==0){//项目的项目类型。
		var projectTypes='A';
	}
	if(projectType==1){
		var projectTypes='B';
	}
	if(projectType==2){
		var projectTypes='C';
	}
	if(projectType==3){
		var projectTypes='C50';
	}
	if(projectType==4){
		var projectTypes='W';
	}
	//公告模板下拉选择
	modelOption({'tempType':'inquiryRatioNotice', 'examinationType':2,'projectType':projectTypes});
	$("#noticeTemplate").val(packageInfo.templateId);//公告模板id
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
			var templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		if(packageInfo.templateId){
			parent.layer.confirm('温馨提示：是否确认切换模板', {
				btn: ['是', '否'] //可以无限个按钮
			  }, function(index, layero){
				changHtml(templateId)
				parent.layer.close(index);			 
			  }, function(index){
				 parent.layer.close(index)
			  });
		}else{
			changHtml(templateId)
		}	
	})
	callbackData(appointmentData);
	
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
};
//切换模板
function changHtml(templateId){
	$.ajax({   	
		url:saveProjectPackage,//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:$("#formbackage").serialize()+'&packageState=5',
		success:function(data){			   		
			if(data.success==true){
				modelHtml({'type':'xmgg', 'projectId':packageInfo.projectId,'packageId':packageInfo.id,'tempId':templateId,'tenderType':0,'examType':1})
			}else{
				parent.layer.alert(data.message)
			}
		}   	
	});		
}
var itemTypeNames=[]
var itemTypeIds=[]
var itemTypeCodes=[]
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml()
	$('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	if(packageInfo.changePrice==1){
		$('input[name="isSellPriceFile"]').attr('disabled',true);
		$('.priceNames').attr('disabled',true)
	}
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
	// $("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');  
    $("#packageName").html(packageInfo.packageName)
	$("#packageNum").html(packageInfo.packageNum)
	$("#sort").val(packageInfo.sort)
	$("#packageId").val(packageInfo.id);
	$("#projectId").val(packageInfo.projectId);
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#tax").html(packageInfo.tax);		
	checkPlana=packageInfo.checkPlan==undefined?'0':packageInfo.checkPlan;
	if(packageInfo.dataTypeName!=""&&packageInfo.dataTypeName!=undefined){
		$("#dataTypeNames").html(packageInfo.dataTypeName);
		$("#dataTypeName").val(packageInfo.dataTypeName);
		$("#dataTypeId").val(packageInfo.dataTypeId);
		$("#dataTypeCode").val(packageInfo.dataTypeCode);
	}else{			
		if(projectType==0){//项目的项目类型。
			$("#dataTypeName").val('工程');
		}
		if(projectType==1){
			$("#dataTypeName").val('设备');
		}
		if(projectType==2){
			$("#dataTypeName").val('服务');
		}
		if(projectType==3){
			$("#dataTypeName").val('广宣');
		}
		if(projectType==4){
			$("#dataTypeName").val('废旧物资');
		}
	};
	if(packageInfo.packageSource==1){
		$("#isSupplierCount").show();
		$("input[name='supplierCount']").val(packageInfo.supplierCount)
	}else{
		$("#supplierCount").show()
	}							
	if(packageInfo.checkPlan==1||packageInfo.checkPlan==3||packageInfo.checkPlan==5){					
		$("#DeviateNum").show();
		$("#deviate").val(packageInfo.deviate)
	}else{
	   	$("#DeviateNum").hide();		   	
	}
	$("input[name='checkPlan'][value='"+ packageInfo.checkPlan +"']").attr("checked",true);
    $(".showExam1").show();
	$('.colsIsf').attr('colspan','1')
	if(packageInfo.checkPlan==0){
		$("#checkPlan").html("综合评分法")
	}
	if(packageInfo.checkPlan==1){
		$("#checkPlan").html("最低评标价法")
	}
	if(packageInfo.checkPlan==2){
		$("#checkPlan").html("经评审的最低价法(价格评分)")
	};
	if(packageInfo.checkPlan==3){
		$("#checkPlan").html("最低投标价法")
	}  
	if(packageInfo.checkPlan==5){
		$("#checkPlan").html("经评审的最低投标价法")
	}
	$(".showExam1_6").show(); 	
	employees();
	if(packageInfo.isSellFile==0){
		$(".examType1Time").show();
	}else{
		$(".examType1Time").hide();
	};
	getProjectPrice(packagePrice);
   
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
	$("#Agent_Price").val(packageInfo.agentPrice);
	$("#Agent_Account").val(packageInfo.agentAccount);
	$("#Agent_Bank_Name").val(packageInfo.agentBankName);
	$("#Agent_Bank_Number").val(packageInfo.agentBankNumber);
	$("#sellPriceFileStartDate").val(packageInfo.sellPriceFileStartDate);
	$("#sellPriceFileEndDate").val(packageInfo.sellPriceFileEndDate);
	
	$("#Budget").val(packageInfo.budget);	
	// $("input[name='isOfferDetailedItem']").eq(packageInfo.isOfferDetailedItem).attr("checked",true);
	$("#remark").val(packageInfo.remark);               
    if(packageInfo.isEdit==1){//项目评审前允许修改评审内容0为不允许1为允许
    	 $('input[name="isEdits"]').attr("checked",true)
    }
    if(packageInfo.tax!=""&&packageInfo.tax!=undefined){
    	 $("#tax").val(packageInfo.tax)
    }else{
    	 $("#tax").val(6)
	}   
	if(packageInfo.isPayDeposit==0){
		$('.isDepositShow').show();		
	}else{
		$('.isDepositShow').hide();		
	};   
	if(packageInfo.options!=undefined){
		for(var i=0;i<packageInfo.options.length;i++){
			itemTypeNames.push(packageInfo.options[i].optionText);
			itemTypeIds.push(packageInfo.options[i].id);
			itemTypeCodes.push(packageInfo.options[i].optionValue)
		}
		typeNameLists=itemTypeNames.join(',');
		typeIdLists=itemTypeIds.join(',');
		typeCodeLists=itemTypeCodes.join(',');
		$("#optionName").html (typeNameLists)
		$("#optionNames").val(typeNameLists);
		$("#optionId").val(typeIdLists);
		$("#optionValue").val(typeCodeLists);
	}
		
//		selectdFn(packageInfo.serviceChargePay)
		
};

$('input[name="isSign"]').on('change',function(){
	if($(this).val()==0){
		$(".isSignDateNone").hide()
	}else{
		$(".isSignDateNone").show()
		$("#signEndDate").val("")
	}
	
})
 //导出模板
function exportExcel(_index){
	if(_index==4){
		var url = config.bidhost + "/FileController/download.do" + "?fname=明细信息.xls&ftpPath=/Templates/Pur/Pur_Bill_Of_Material_Template.xls";
	}
	window.location.href =$.parserUrlForToken(url);
	
}
$(".number").on("blur",function(){   
   if($(this).val()!=""){
   	    if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))){ 
		parent.layer.alert("请输入正数"); 	
		$(this).val("");		
		return;
        };
		$(this).val(parseFloat($(this).val()).toFixed(3));
	}
});
 //费用信息查询
 var priceIds="",priceNames="";
//审核确定按钮
//审核确定按钮
$("#btn_submit").click(function() {
	if(timeCheck($("#timeList"))){	
		/* if($("input[name='isOfferDetailedItem']:checked").val()==0){
			if(fileUp.options.filesDataDetail.length==0){
	
			parent.layer.alert("请上传分项报价表模板");        		
				return false;
			}
		}	 */		
		if(!mediaEditor.isValidate()){
			// parent.layer.alert('请填写邀请函信息或选择邀请函模板');
			return ;
			
		}	
		if(publicData.length==0){
			parent.layer.alert("请邀请供应商");        		
			return false;
		};	
		if($("#employeeId").val()==""){
			parent.layer.alert('请选择审核人');
			return ;         			
		};	
		var States;
		States='&packageState=1&inviteState=1';
		iscekck(States,examTypeShow);
	}		
	
	
});
//保存
$("#btn_bao").click(function() {
	var States='&packageState=5&inviteState=0';
	var packUrl=saveProjectPackage;	
 	$("#remark").val(ue.getContent());
    $.ajax({
		url: packUrl, //查看 详细信息
		async: false,
		type: 'post',
		dataType: 'json',
		data:$("#formb").serialize()+States,
		success: function(data) {
		 if(data.success){
			if(top.window.document.getElementById("consoleWindow")){
				var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
				var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				dcmt.getDetail();
			}
		 	parent.layer.alert("保存成功")
		 }else{
		 	parent.layer.alert(data.message)
		 }
		}
	});
});
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
function iscekck(States,examTypeShow){
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function(index, layero) {
			top.layer.close(index);
			$("#remark").val(ue.getContent())
			$.ajax({   	
			   	url:saveProjectPackage,//修改包件的接口
			   	type:'post',
			   	//dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:$("#formb").serialize()+States,
			   	success:function(data){			   		
			   		if(data.success==true){
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
			   		// 校验报价表是否存在 
						top.checkBidFilesTips(packageId, '02', examType, "发送邀请函成功");
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						parent.layer.close(parent.layer.getFrameIndex(window.name));	
   						
			   		}else{
			   			parent.layer.alert(data.message)
			   		}
			   	}   	
			});	
		});
	} else {
		$("#remark").val(ue.getContent())
       $.ajax({   	
		   	url:saveProjectPackage,//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:$("#formb").serialize()+States,
		   	success:function(data){			   		
		   		if(data.success==true){
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
		   			// 校验报价表是否存在 
						top.checkBidFilesTips(packageId, '02', examType, "发送邀请函成功");
		   			parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
   					parent.layer.close(parent.layer.getFrameIndex(window.name));	
		   		}else{
		   			parent.layer.alert(data.message)
		   		}
		   	}   	
		});	
	}
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function employees(){
	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmgg"
	}
	
	if(packageInfo.id != ''){
		reData.id = packageInfo.id;
		$('.record').show();
		findWorkflowCheckerAndAccp(packageInfo.id);
	}
	
	//获取审核人列表
	$.ajax({
		   	url:WorkflowUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data: reData,
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
		   	   var checkerId = ''; 
				if(data.success == true) {
					$('.employee').show()
					isWorkflow = 1;
					if(data.data){
						if(data.data.workflowCheckers.length == 0) {
							option = '<option>暂无审核人员</option>'
						}
						if(data.data.workflowCheckers.length > 0) {
							
							if(data.data.employee){
								checkerId = data.data.employee.id;
							}
							option = "<option value=''>请选择审核人员</option>";
							var checkerList = data.data.workflowCheckers;
							for(var i = 0; i < checkerList.length; i++) {
								
								if(checkerId != '' && checkerList[i].employeeId == checkerId){
									option += '<option value="' + checkerList[i].employeeId  + '" selected="selected">' + checkerList[i].userName + '</option>'
								}else{
									option += '<option value="' + checkerList[i].employeeId  + '">' + checkerList[i].userName + '</option>'	
								}
								
							}
						}
					}else{
						option = '<option>暂无审核人员</option>'
					}
				}		   	    
		   	   $("#employeeId").html(option);	
		   	}
});
}
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

/*start报价表  调用报价封装方法 */
/* function offerFormData(){
	$("#offerForm").offerForm({
		saveurl:config.bidhost+'/PackagePriceListController/savePriceList.do',//保存接口
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:examType,
		},
		status:1,//1为编辑2为查看
		offerSubmit:'.offerBtn',//提交按钮类名
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:1,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			offerAttention:packageInfo.offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		})
	}
} */
/*end报价*/