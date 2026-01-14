var purchaseaData="";
var publicData=[];//邀请供应商的数组
var sourceFundsId="";//资金来源Id
var PurchaserData="";//企业信息参数
var massage2="";//判断审核人接口返回值为2时的验证
var filesData=[];//附件上传的数组
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var mediasIdList="";//媒体ID
var mediasNameList="";//媒体名字
var mediasCodeList="";//媒体编号
var itemMediasId=[]//媒体ID
var itemMediasName=[]//媒体名字
var itemMediasCode=[]//媒体编号
var updateAuctionPurchase=config.AuctionHost+'/AuctionPurchaseController/saveNewAuctionPurchase.do';//提交接口
var findPurchaseURL=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//获取项目信息的接口
var deleteFileUrl= config.AuctionHost + '/PurFileController/delete.do';//删除已上传文件信息
var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var WorkflowUrl=config.AuctionHost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var pricedeleteAll=config.AuctionHost +'/ProjectPriceController/deleteProjectPriceByPackage.do'//费用删除
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var pricelist=config.AuctionHost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var pricesave=config.AuctionHost +'/ProjectPriceController/saveProjectPrice.do'//费用添加
var priceupdate=config.AuctionHost +'/ProjectPriceController/updateProjectPrice.do'//费用修改
var pricedelete=config.AuctionHost +'/ProjectPriceController/deleteProjectPrice.do'//费用删除
var packagePrice = [];//费用信息
var findInitMoney = config.AuctionHost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = config.AuctionHost +"/DepositController/findAccountDetailForAuction.do"; //查询保证金账号
var opurl =config.Syshost +  "/OptionsController/list.do";
var editPurchase = 'Auction/Sale/Purchase/SalePurchase/model/addSale.html';//上一步修改项目信息
var isCheck;
var projectSupplierList=""//当是ie9浏览器的时候邀请供应商的数据
var projectIds=getUrlParam('projectId'),projectSource;
var optiondata=[];//媒体数组
var isDf=false;//是否是东风工程或是东风咨询企业
var WORKFLOWTYPE = 'xmgg';
var manual;//是否开启竞卖报价设置
 //文件上传参数
 var files={
	name:"",
	size:"",
	url:""
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
 $("#browserUrl").attr('href',siteInfo.portalSite);
 $("#browserUrl").html(siteInfo.portalSiteUrl);
 $("#webTitle").html(siteInfo.sysTitle)
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
$(function () {
	new UEditorEdit({
		contentKey:"content"
	});
})
 //初始化
//提交审核
$("#btn_submit").click(function() {
	/* if($("#manual").val() == 1) {
		$(".supplierData").show();
	} else {
		$(".supplierData").hide();
		$("#supplierCount").val("");
	} */
	$("#content").val(ue.getContent())	
	if(timeCheck($("#form"))){
		if($('[name=isFile]:checked').val() == 0){
			var fileEndDate = Date.parse(new Date($('#fileEndDate').val().replace(/\-/g, "/"))); //竞价文件递交截止时间
			var fileCheckEndDate = Date.parse(new Date($('#fileCheckEndDate').val().replace(/\-/g, "/"))); //竞价文件审核截止时间
			if(fileCheckEndDate <= fileEndDate){
				top.layer.alert('竞卖文件审核截止时间必须大于竞卖文件递交截止时间');
				return
			}
		}
		text();
	}
})
//提交审核
function form(){
	acutionData();
	var arr={};
	arr = top.serializeArrayToJson($("#form").serializeArray());//获取表单数据，并转换成对象；
	arr['project.projectState']=1;
	if(projectSource==1){
		arr['project.auctionProjectPackages[0].isPayDeposit']=purchaseaData.autionProjectPackage[0].isPayDeposit;
		if(purchaseaData.autionProjectPackage[0].isPayDeposit==0){
			arr['project.auctionProjectPackages[0].projectPrices[1].payMethod']=$("#payMethod").val();
			if(arr['project.auctionProjectPackages[0].projectPrices[1].payMethod']==1){
				arr['project.auctionProjectPackages[0].projectPrices[1].agentType']=$("input[name='project.auctionProjectPackages[0].projectPrices[1].agentType']:checked").val();	
			}
			
		}			
		arr['project.auctionProjectPackages[0].isSellFile']=purchaseaData.autionProjectPackage[0].isSellFile;	
	}

	arr.projectId = purchaseaData.projectId;

	/*
	* by huzexuan 这里保存或提交项目的时候,公开范围没有正确赋值,在此处进行重新取值
	*/
	arr.isPublic = $("[name='isPublic']:checked").val();
	arr = $.extend(arr, mediaEditor.getValue())

	//提交审核
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(indexs, layero) {
			$.ajax({
				url: updateAuctionPurchase ,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: arr,
				success: function(data) {
					if(data.success){
//						parent.layer.closeAll();
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				   	    	dcmt.getDetail();
						}
						parent.layer.close(indexs)
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						parent.layer.alert("提交成功")
					}else{
						parent.layer.alert(data.message)
					}
					
				},
				error: function(data) {
					parent.layer.alert("提交失败")
				}
			});
		}, function(indexs){
		   parent.layer.close(indexs)
		})
	} else {
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: arr,
			success: function(data) {	
				if(data.success){
					if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				   	    	dcmt.getDetail();
					}
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
//					parent.layer.closeAll();
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
					parent.layer.alert("提交审核成功")
				}else{
					parent.layer.alert(data.message)
				}
			},
			error: function(data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}	
};
//上一步
$("#btn_prev").click(function() {
	getBack()
});
//回退
function getBack(){
	var index = top.parent.layer.getFrameIndex(window.name);
	top.parent.layer.close(index);
	top.layer.open({
		type: 2 //此处以iframe举例
			,
		title:'修改项目信息',
		area: ['1100px', '600px'],
		maxmin: true, //开启最大化最小化按钮
		resize: false,
		content: editPurchase + '?projectId=' + purchaseaData.projectId + '&isBack=true',
		//btn: ['提交审核', '保存', '取消'],//确定按钮
		success: function(layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
		},
	});
};
//临时保存
$("#btn_bao").click(function() {
	if($('input[name=auctionType]:checked').val()==0){
		if($("#timeLimit").val()==""){
			parent.layer.alert("限时不能为空");        		     		
			return;
		};
		
		if(!(/^[0-9]*$/.test($("#timeLimit").val()))){
			parent.layer.alert("限时只能是数字"); 
			return;
		}; 			    	 	
	};

	if($('#detailedName').val().length>70){ 
		parent.layer.alert("商品名称过长"); 
		return;
	};

	if(!(/^[0-9]*$/.test($("#detailedCount").val()))){ 
			parent.layer.alert("数量只能是数字"); 
			return;
	};
	if($('#detailedCount').val().length>10){ 
		parent.layer.alert("数量过长"); 
		return;
	};

	if($('#detailedUnit').val().length>10){ 
			parent.layer.alert("单位过长"); 
			return;
	};	

	if($('#brand').val()!='' && $('#brand').val().length>70){ 
		parent.layer.alert("品牌信息过长"); 
		return;
	};
	if($('#detailedVersion').val()!='' && $('#detailedVersion').val().length>70){ 
		parent.layer.alert("型号规格及参数过长"); 
		return;
	};	
	if($('#detailedContent').val()!='' && $('#detailedContent').val().length>70){ 
		parent.layer.alert("商品详情过长"); 
		return;
	};	
	/* if($("#manual").val() == 1) {
		$(".supplierData").show();
	} else {
		$(".supplierData").hide();
		$("#supplierCount").val("");
	} */
	$("#content").val(ue.getContent())
	forms();
})
//退出
$("#btn_close").click(function() {
//	parent.layer.closeAll()
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})
//临时保存
function forms(){		
	acutionData();
	var arr={};
	arr = top.serializeArrayToJson($("#form").serializeArray());//获取表单数据，并转换成对象；
	arr['project.projectState']=0;
	if(projectSource==1){
		arr['project.auctionProjectPackages[0].isPayDeposit']=purchaseaData.autionProjectPackage[0].isPayDeposit;
		if(purchaseaData.autionProjectPackage[0].isPayDeposit==0){
			arr['project.auctionProjectPackages[0].projectPrices[1].payMethod']=$("#payMethod").val();
			if(arr['project.auctionProjectPackages[0].projectPrices[1].payMethod']==1){
				arr['project.auctionProjectPackages[0].projectPrices[1].agentType']=$("input[name='project.auctionProjectPackages[0].projectPrices[1].agentType']:checked").val();	
			}
			
		}			
		arr['project.auctionProjectPackages[0].isSellFile']=purchaseaData.autionProjectPackage[0].isSellFile;	
	}
	arr.projectId = purchaseaData.projectId;
	/*
	* by huzexuan 这里保存或提交项目的时候,公开范围没有正确赋值,在此处进行重新取值
	*/
	arr.isPublic = $("[name='isPublic']:checked").val();
	arr = $.extend(arr, mediaEditor.getValue())
	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize() + projectPrices,
		success: function(data) {			
			if(data.success){
				
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
				parent.layer.alert("保存成功")
			}else{
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});
}
$(function(){
	Purchase();
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectIds,
		status:1,//1编辑   2 查看  3 采购人专区的代理项目
	});
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
	},1000);
	if(projectSource==1){//重新竞卖
		$(".disProjectSource").attr('disabled',true);
		$(".projectSource").attr('readonly',true);
		$(".projectSource").css('background','#eeeeee');
	}else{
		$("#btn_prev").show();
	}
})

// 查看派项信息
$('#btn_view_assign_project').click(function() {
	var detailHtml = 'view/AppointSelf/appointInfoDetail.html';
	parent.layer.open({
		type: 2,
		area: ['1000px', '600px'],
		maxmin: false,
		resize: false,
		title: projectData.projectName,
		btn: false,
		content: detailHtml + '?projectId=' + projectData.projectId + '&oldProjectId=' + projectData.oldProjectId,
		yes:function(index, layero){
			parent.layer.close(index);
		}
	})
})

var projectMsg = {};
var projectData = {};
//项目的数据
function Purchase(){
	$.ajax({
	   	url:findPurchaseURL,
	   	type:'get',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectIds
	   	},
	   	success:function(data){
	   		purchaseaData=data.data;
			projectData =purchaseaData.project[0];
	   		$("#manual").val(purchaseaData.project[0].manual);
	   		manual=purchaseaData.project[0].manual
	   		projectSource=purchaseaData.project[0].projectSource;	   		
	   		if(purchaseaData.purFile.length>0){
	   			filesData=purchaseaData.purFile;
	   			
	   		}
	   		filesDataView()
			$('input[name="project.isSubpackage"][value="'+projectData.isSubpackage+'"]').attr("checked",true);
			if (projectData.oldProjectId) {
				$('.isAssignProject').show();
			}
	   	},
	   	error:function(data){
	   		
	   	}
	});
	
	if(purchaseaData.project[0].projectType==0){		
	    $('.engineering').show()
	}else{
		$('.engineering').hide()
	};
	$('div[id]').each(function(){
    	$(this).html(purchaseaData[this.id]);	
	});
	//渲染项目的数据
	$('div[id]').each(function(){
		$(this).html(purchaseaData.project[0][this.id]);			
	});
	$("#provinceName").html(purchaseaData.project[0].provinceName||'湖北省');	
	$("#cityName").html(purchaseaData.project[0].cityName||'武汉市');
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	if(purchaseaData.project[0].tenderProjectClassify){
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			optionValue: purchaseaData.project[0].tenderProjectClassify,
			status: 2,
			viewCallback: function(name) {
				$("#tenderProjectClassify").html(name)
			}
		});
	}
	if(purchaseaData.project[0].industriesType){
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			optionValue: purchaseaData.project[0].industriesType,
			status: 2,
			viewCallback: function(name) {
				$("#industriesType").html(name)
			}
		});
	}
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）   -end       ********** */
	if(purchaseaData.project[0].projectType==0){
		$("#projectType").html("工程");
		var projectType='A'
    }
    if(purchaseaData.project[0].projectType==1){
		$("#projectType").html("设备");
		var projectType='B'
    }
    if(purchaseaData.project[0].projectType==2){
		$("#projectType").html("服务");
		var projectType='C'
    }
    if(purchaseaData.project[0].projectType==3){
		$("#projectType").html("广宣");
		var projectType='C50'
	};
	if(purchaseaData.project[0].projectType==4){
		$("#projectType").html("废旧物资");
		var projectType='W'
	};
	modelOption({'tempType':'auctionNotice','projectType':projectType});
	$("#noticeTemplate").attr('name','templateId');
	$("#noticeTemplate").val(purchaseaData.templateId);//公告模板id	
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
			var templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		if(ue.getContent()!=""){
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
	});	
	if(purchaseaData.isPublic>1){
		$("input[name='isPublics'][value='1']").attr("checked",true);
		$('.isPublics1').show();
		$('.isPublics0').hide();
		$(".yao_btn").show();
		$("#CODENAME").val(purchaseaData.supplierClassifyName);
		$("#supplierClassifyCode").val(purchaseaData.supplierClassifyCode);
		classificaCode=purchaseaData.supplierClassifyCode;	
		Publics();	
		if(purchaseaData.isPublic==3){
			$('.isPublics3').show();
		}		
	}else{
		$("input[name='isPublics'][value='0']").attr("checked",true);
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
		$('.isPublics0').show();
		$('.isPublics1').hide();
		$(".yao_btn").hide();	
	}
	$("input[name='isPublic'][value='"+ purchaseaData.isPublic +"']").attr("checked",true);
	$("input[name='isFile'][value='"+ (purchaseaData.isFile||0) +"']").attr("checked",true);
	$("input[name='settingNotice'][value='"+ (purchaseaData.settingNotice||0) +"']").attr("checked",true);                  
	$('#noticeStartDate').val(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');//公告开始时间
	$("#StartDate").html(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');	
	$('#noticeEndDate').val(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'');//公告截止时间
	$("#endDate").html(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'')
	$('#askEndDate').val(purchaseaData.askEndDate!=undefined?purchaseaData.askEndDate.substring(0,16):'');//提出澄清截止时间
	$('#answersEndDate').val(purchaseaData.answersEndDate!=undefined?purchaseaData.answersEndDate.substring(0,16):'');//答复截止时间
	$('#auctionStartDate').val(purchaseaData.auctionStartDate!=undefined?purchaseaData.auctionStartDate.substring(0,16):'');//竞卖开始时间	
	$('#projectId').val(purchaseaData.projectId);//项目Id
	$("#purchaseId").val(purchaseaData.id);	//公告ID
	$("#isPublics").val(purchaseaData.isPublic)
	$("#content").val(purchaseaData.content)//备注
	$("#purchaserDepartmentId").val(purchaseaData.purchaserDepartmentId);
	$("#purchaserDepartment").val(purchaseaData.purchaserDepartmentName);
	ue.ready(function() {
		//ue.setContent(result.data, true);		
		ue.execCommand('insertHtml', purchaseaData.content);
	});
	$("input[name='isFile']").eq(purchaseaData.isFile).attr("checked",true)//是否竞卖文件递交。0为是，1为否
	//为1时显示
	if(purchaseaData.isFile==0){
		if(manual == 1) {
			$(".supplierData").show();
			$('.colss').attr('colspan', '1');
			$('#supplierCount').val('3');
		} else {
			$(".supplierData").hide();
			$('.colss').attr('colspan', '3');
			$('#supplierCount').val('');
		}
		$("#isFileN").show();
		$('#fileEndDate').val(purchaseaData.fileEndDate!=undefined?purchaseaData.fileEndDate.substring(0,16):'');//竞卖文件递交截止时间
		$('#fileCheckEndDate').val(purchaseaData.fileCheckEndDate!=undefined?purchaseaData.fileCheckEndDate.substring(0,16):'');//竞卖文件审核截止时间
	}else{
		$(".supplierData").hide();
		$('.colss').attr('colspan', '3');
		$('#supplierCount').val('');
		/* if(manual == 1) {
			$(".supplierData").show();
			$('.colss').attr('colspan', '1');
		} else {
			$(".supplierData").hide();
			$('.colss').attr('colspan', '3');
		} */
		$("#isFileN").hide();
		$('#fileEndDate').val("");//竞卖文件递交截止时间
		$('#fileCheckEndDate').val("");//竞卖文件审核截止时间
		$("#fileEndDate").removeAttr("data-datename");
		$("#fileCheckEndDate").removeAttr("data-datename");
	}
	if(purchaseaData.auctionPackageDetailed.length>0){
		$("#detailedName").val(purchaseaData.auctionPackageDetailed[0].detailedName);//商品名称
		$("#detailedCount").val(purchaseaData.auctionPackageDetailed[0].detailedCount);//数量
		$("#detailedUnit").val(purchaseaData.auctionPackageDetailed[0].detailedUnit);//单位
		$("#brand").val(purchaseaData.auctionPackageDetailed[0].brand);//品牌信息
		$("#detailedVersion").val(purchaseaData.auctionPackageDetailed[0].detailedVersion);//型号规格及参数
		$("#detailedContent").val(purchaseaData.auctionPackageDetailed[0].detailedContent);//商品详情
		$("#detailedRemark").val(purchaseaData.auctionPackageDetailed[0].detailedRemark);//竞卖人资质要求
	}
	
	if(purchaseaData.autionProjectPackage.length>0){
		$("#budgetPrice").val(purchaseaData.autionProjectPackage[0].budgetPrice);//预算价
		$("#taxRate").val(purchaseaData.autionProjectPackage[0].taxRate);//税率
		$("#noTaxBudgetPrice").val(purchaseaData.autionProjectPackage[0].noTaxBudgetPrice);//预算价不含税

		$("input[name='project.auctionProjectPackages[0].isPayDeposit'][value='"+purchaseaData.autionProjectPackage[0].isPayDeposit  +"']").attr("checked",true);
		$("input[name='project.auctionProjectPackages[0].isSellFile'][value='"+purchaseaData.autionProjectPackage[0].isSellFile  +"']").attr("checked",true);
		//当为2轮或3轮竞卖的时候。选中多轮竞卖
		if(purchaseaData.autionProjectPackage[0].auctionType==2||purchaseaData.autionProjectPackage[0].auctionType==3){
			$('input[name="auctionType"]').eq(2).attr("checked",true);
			
			Typechecked(4);
			outTypes(purchaseaData.autionProjectPackage[0].outType)
		}else{
			$('input[name="auctionType"]').eq(purchaseaData.autionProjectPackage[0].auctionType).attr("checked",true);
			Typechecked(purchaseaData.autionProjectPackage[0].auctionType);
		};
		Typecheckeds(purchaseaData.autionProjectPackage[0].auctionType);
		if(purchaseaData.autionProjectPackage[0].auctionType>1){
			$('input[name="auctionTypes"][value="'+ purchaseaData.autionProjectPackage[0].auctionType +'"]').attr("checked",true);
			$('input[name="firstAuctionTime"][value="'+ purchaseaData.autionProjectPackage[0].firstAuctionTime +'"]').attr("checked",true);
			$("#firstOutSupplier").val(purchaseaData.autionProjectPackage[0].firstOutSupplier)
			$("#firstKeepSupplier").val(purchaseaData.autionProjectPackage[0].firstKeepSupplier)
			$('input[name="secondAuctionTime"][value="'+ purchaseaData.autionProjectPackage[0].secondAuctionTime +'"]').attr("checked",true);			
			$('input[name="outSupplier"][value="'+ purchaseaData.autionProjectPackage[0].outSupplier +'"]').attr("checked",true)
			if(purchaseaData.autionProjectPackage[0].auctionType==3){
				$("#secondOutSupplier").val(purchaseaData.autionProjectPackage[0].secondOutSupplier)
			    $("#secondKeepSupplier").val(purchaseaData.autionProjectPackage[0].secondKeepSupplier)
				$('input[name="thirdAuctionTime"][value="'+ purchaseaData.autionProjectPackage[0].thirdAuctionTime +'"]').attr("checked",true);
			};			
		};		
		//当为自由竞卖时竞卖时常的值为
		if(purchaseaData.autionProjectPackage[0].auctionType==0){
			$('input[name="auctionDuration"][value="'+ purchaseaData.autionProjectPackage[0].auctionDuration +'"]').attr("checked",true)	
			$("input[name='auctionModel']").eq(purchaseaData.autionProjectPackage[0].auctionModel).attr("checked",true);
			
		};		
		//当单轮竞卖是竞卖时常为
		if(purchaseaData.autionProjectPackage[0].auctionType==1){
			
			if(purchaseaData.autionProjectPackage[0].auctionDuration!=10&&purchaseaData.autionProjectPackage[0].auctionDuration!=15&&purchaseaData.autionProjectPackage[0].auctionDuration!=30&&purchaseaData.autionProjectPackage[0].auctionDuration!=60){
				$('input[name="auctionDurations"][value="0"]').attr("checked",true);
				$("#auctionDurations").show();
				$("#auctionDurations").val(purchaseaData.autionProjectPackage[0].auctionDuration)
			}else {
				$('input[name="auctionDurations"][value="'+ purchaseaData.autionProjectPackage[0].auctionDuration +'"]').attr("checked",true);
				$("#auctionDurations").hide();
			}
			$("input[name='auctionModels'][value='"+ purchaseaData.autionProjectPackage[0].auctionModel +"']").attr("checked",true);//竞卖类型	
		}		
		$("#dataTypeName").val(purchaseaData.autionProjectPackage[0].dataTypeName);
		$('#dataTypeId').val(purchaseaData.autionProjectPackage[0].dataTypeId);
		$('#dataTypeCode').val(purchaseaData.autionProjectPackage[0].dataTypeCode);
		$("#timeLimit").val(purchaseaData.autionProjectPackage[0].timeLimit);//限时			
		$("#priceReduction").val(purchaseaData.autionProjectPackage[0].priceReduction);//降价幅度（元）
		$('input[name="project.auctionProjectPackages[0].isPrice"][value="'+ purchaseaData.autionProjectPackage[0].isPrice +'"]').attr("checked",true);//是否设置竞卖起始价	
		$("#rawPrice").val(purchaseaData.autionProjectPackage[0].rawPrice);//竞卖起始价							
		$('input[name="project.auctionProjectPackages[0].intervalTime"][value="'+ purchaseaData.autionProjectPackage[0].intervalTime +'"]').attr("checked",true);	
		$('input[name="project.auctionProjectPackages[0].outType"][value="'+ purchaseaData.autionProjectPackage[0].outType +'"]').attr("checked",true);
		$("#content").val(purchaseaData.autionProjectPackage[0].content)
		if(purchaseaData.autionProjectPackage[0].isShowPrice==0){
			$("input[name='isOffer']").attr('checked',true);
			
		}
		$("#isShowPrice").val(purchaseaData.autionProjectPackage[0].isShowPrice);
		if(purchaseaData.autionProjectPackage[0].isShowName==0){
			$("input[name='isName']").attr('checked',true)
		};
		$("#isShowName").val(purchaseaData.autionProjectPackage[0].isShowName);
		if(purchaseaData.autionProjectPackage[0].isShowNum==0){
			$("input[name='isCode']").attr('checked',true)
		};
		$("#isShowNum").val(purchaseaData.autionProjectPackage[0].isShowNum);
	}else{
		Typechecked(0)
	}
	initMediaVal(purchaseaData.options, {
		// stage: 'xmgg',
		'projectId': projectIds
	})
	mediaEditor.setValue(purchaseaData);

	if(purchaseaData.autionProjectPackage.length>0){
		if(purchaseaData.autionProjectPackage[0].dataTypeId!=""&&purchaseaData.autionProjectPackage[0].dataTypeId!=undefined&&purchaseaData.autionProjectPackage[0].dataTypeId!=null){
			typeIdList=purchaseaData.autionProjectPackage[0].dataTypeId;
		   
		}
	}
	sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
	sourceFunds();
	var oFileInput = new FileInput();
	oFileInput.Init("FileName", urlSaveAuctionFile);
	//当前登录人的信息
	
	time();	
	packagePriceData();//其它费用信息;
};
// //切换模板
function changHtml(templateId){
	$('input[name="project.projectState"]').val(0);//提交审核的状态，0为临时保存		
	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize(),
		success: function(data) {			
			if(data.success==true){
				modelHtml({'type':'xmgg', 'projectId':purchaseaData.project[0].id,'tempId':templateId,'tenderType':2})
			}else{
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});	
}
// 选择部门
$(".Department").on("click",function(){
	var name=$(this).data('title');
	var uid=top.enterpriseId
	var mnuid=$("#purchaserDepartmentId").val();
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '选择所属部门'
        ,area: ['400px', '600px']
        ,content:'view/projectType/employee.html'
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.employee(uid,name,callEmployeeBack,mnuid)
        },
         
    })
})
function callEmployeeBack(aRopName,dataTypeList){
	var  itemTypeId=[];//项目类型的ID
	var  itemTypeName=[];//项目类型的名字			
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);	
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList=itemTypeId.join(",");//项目类型的ID
	typeNameList=itemTypeName.join(",");//项目类型的名字
	$("#purchaserDepartmentId").val(typeIdList);
	$("#purchaserDepartment").val(typeNameList);
}
//资金来源数据获取
function sourceFunds(){	
	
	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmgg"
	}
	
	if(projectIds != ''){
		reData.id = projectIds;
		$('.record').show();
		findWorkflowCheckerAndAccp(projectIds);
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
		   	   	    $("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
		   	   	    $('.employee').hide();
		   	   	    isCheck = true;
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
};
$('#reduceNum').on('click',function(){
	var obj = $("input[name='project.auctionProjectPackages[0].timeLimit']");
           if (obj.val() <= 1) {
                obj.val(1);
           } else {
                obj.val(parseInt(obj.val()) - 1);
           }
    obj.change();
})
$('#addNum').on('click',function(){
	var obj = $("input[name='project.auctionProjectPackages[0].timeLimit']");
           obj.val(parseInt(obj.val()) + 1);
           obj.change();
});
$('input[name="isFile"]').on('click', function() {
	if($(this).val() == 0) {
		$("#fileEndDate").attr("data-datename",'竞卖文件递交截止时间');
		$("#fileCheckEndDate").attr("data-datename",'竞卖文件审核截止时间');
		$("#fileEndDate").attr("type",'text');
		$("#fileCheckEndDate").attr("type",'text');
		$("#isFileN").show();
		if($("#manual").val() == 1) {
				$(".supplierData").show();
				$('.colss').attr('colspan', '1');
				$("#supplierCount").val('3');
		} else {
				$(".supplierData").hide();
				$('.colss').attr('colspan', '3');
				$('#supplierCount').val('');
		}
	} else {
		$("#fileEndDate").removeAttr("data-datename");
		$("#fileCheckEndDate").removeAttr("data-datename");
		$("#fileEndDate").attr("type",'hidden');
		$("#fileCheckEndDate").attr("type",'hidden');
		$("#isFileN").hide();
		$("#fileEndDate").val("");
		$("#fileCheckEndDate").val("");
		$(".supplierData").hide();
		$('.colss').attr('colspan', '3');
		$('#supplierCount').val('');
		/* if($("#manual").val() == 1) {
			$(".supplierData").hide();
			$('.colss').attr('colspan', '3');
		} */
	}

});

//第一轮的数字验证
$("#firstOutSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[0-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第1轮淘汰供应商数必须为不小于零的整数"); 	
			$(this).val("");	
		};
	}
});
$("#firstKeepSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][1-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第1轮最低保留供应商数必须为大于零的整数"); 
			$(this).val("");		
		};
	}
})
$("#secondOutSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[0-9][0-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第2轮淘汰供应商数必须为不小于零的整数"); 
			$(this).val("");		
		};
	}
})
$("#secondKeepSupplier").on('change',function(){
	if($(this).val()!=""){
		if(!(/^\+?[1-9][1-9]*$/.test($(this).val()))){ 
			parent.layer.alert("第2轮最低保留供应商数必须为大于零的整数"); 	
			$(this).val("");	
		};
	}
})
/* $("#priceReduction").on('change',function(){
	if($(this).val()!=""){	
		if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
			parent.layer.alert("涨价幅度必须大于零且最多两位小数"); 	
			$(this).val("");
			
			return
		};
		var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
		$(this).val(b);
	};
});
$("#rawPrice").on('change',function(){
	if($(this).val()!=""){	
		if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
			parent.layer.alert("起始价格金额必须大于零且最多两位小数"); 	
			$(this).val("");
			
			return
		};
		var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
		$(this).val(b);
	};
}); */
//竞卖方式的切换
function Typechecked(num){
	if(num==0){
		$("#auctionType_0").removeClass("none");
		$("#auctionType_1").addClass("none");
		$("#auctionType_2").addClass("none");
		$(".auctionType02").addClass("none")
		$(".auctionTypeP").html("自由竞卖是指竞卖项目设置竞卖开始时间、竞卖时长、涨价幅度等竞卖要素，符合要求的供应商在竞卖开始时之后进行报价操作；供应商可多次报价，系统以供应商最后一次确认的报价做为最终报价；报价截止后，按照“满足竞卖项目要求且有效报价最高”的原则确定成交供应商；若无供应商参与报价，竞卖失败")
	    $("#firstOutSupplier").val("");//第1轮淘汰供应商数清空
	    $("#firstKeepSupplier").val("");//第1轮最低保留供应商数情空
	    $("#secondOutSupplier").val("");//第2轮淘汰供应商数清空
	    $("#secondKeepSupplier").val("")//第2轮最低保留供应商数清空
	   if(purchaseaData.autionProjectPackage.length>0){
	    	if(purchaseaData.autionProjectPackage[0].timeLimit!=""&&purchaseaData.autionProjectPackage[0].timeLimit!=undefined){
		    	 $("#timeLimit").val(purchaseaData.autionProjectPackage[0].timeLimit)//限时
		    }else{
		    	 $("#timeLimit").val("5")//限时
		    }
	    }else{
	    	 $("#timeLimit").val("5")//限时
	    }
	    if($('input[name="project.auctionProjectPackages[0].isPrice"]:checked').val()==0){		
			$(".isPriceM").show();
			$(".isPriceL").attr('colspan','')
			
		}else{		
			$(".isPriceM").hide();
			$(".isPriceL").attr('colspan','4')
			$("#priceReduction").val("")	
		}
	};
	if(num==1){
		$("#auctionType_0").addClass("none");
		$("#auctionType_1").removeClass("none");
		$("#auctionType_2").addClass("none");
		$(".auctionType02").addClass("none")
		$(".auctionTypeP").html("单轮竞卖是指竞卖项目设置竞卖开始时间、竞卖时长等竞卖要素，符合要求的供应商在竞卖开始时之后进行报价操作；供应商仅可报价一次；报价截止后，按照“满足竞卖项目要求且有效报价最高”的原则确定成交供应商（如果出现供应商报价均为最高，则先报价者优先）；若无供应商参与报价，竞卖失败")
	    $("#firstOutSupplier").val("");//第1轮淘汰供应商数清空
	    $("#firstKeepSupplier").val("");//第1轮最低保留供应商数情空
	    $("#secondOutSupplier").val("");//第2轮淘汰供应商数清空
	    $("#secondKeepSupplier").val("")//第2轮最低保留供应商数清空
	    $("#timeLimit").val("")//限时
	};
	if(num==4){
		$("#auctionType_0").addClass("none");
		$("#auctionType_1").addClass("none");
		$("#auctionType_2").removeClass("none");
		$(".auctionType02").removeClass("none");
		$(".auctionTypeP").html("多轮竞卖是指竞卖项目设置竞卖开始时间、竞卖时长等竞卖要素，符合要求的供应商（首轮报价若无供应商参与竞卖，则竞卖终止）在每轮报价开始时间与与每轮报价截止时间之间进行报价操作，每轮报价截止时间后公布当前最高报价结果，最多三轮报价轮次（后一轮报价起始价为前一轮最高报价），直到最后一轮结束后。再按照“满足竞卖项目要求且有效报价最高”的原则确定成交供应商")
	    $("#timeLimit").val("")//限时
	};
};
//Is_Pay_Deposit的隐藏显示
function Is_Pay_Deposit(num){
	if(num==0){
		$("#Deposit").removeClass("none")
	}else{
		$("#Deposit").addClass("none")
	};
};
$("input[name='auctionDurations']").on('click',function(){
	if($(this).val()==0){
		$("#auctionDurations").show();
	}else{
		$("#auctionDurations").hide();
	};
});
$("#auctionDurations").on('change',function(){
	if(!(/^\+?[1-9][0-9]*$/.test($(this).val()))){ 
		parent.layer.alert("请填写必须大于零的整数"); 
		$(this).val("")
	};
})
//是否缴纳保证金
$('input[name="project.auctionProjectPackages[0].isPayDeposit"]').on('click',function(){
	if($(this).val()==1){
		$("#depositPrice").attr('disabled',true);
		$("#depositPrice").val("");
	}else{
		$("#depositPrice").attr('disabled',false);		
	};
});
function outTypes(num){

	if(num==0){
		$(".Supplier").removeClass("none");
		$(".third").addClass("none");
		$(".thirds").addClass("none");
	}else{
		$(".Supplier").addClass("none");
		$(".third").removeClass("none");
		$(".thirds").removeClass("none");
		$('.outTypes1').val('')
	};
	if($('input[name="auctionTypes"]:checked').val()==2&&num==1){
		$(".third").addClass("none");
		$(".thirds").addClass("none");
		$(".Supplier").addClass("none");
	};
	if($('input[name="auctionTypes"]:checked').val()==3&&num==0){
		$(".Supplier").removeClass("none");
		$(".thirds").removeClass("none");
	};
	if($('input[name="auctionTypes"]:checked').val()==3&&num==1){
		$(".Supplier").addClass("none");
	};
};
//判断2轮还是3轮；
function Typecheckeds(num){
	if(num==2){
		$(".third").addClass("none");
		$(".thirds").addClass("none");
	}else if(num==3&&$('input[name="project.auctionProjectPackages[0].outType"]:checked').val()==1){
		$(".Supplier").addClass("none");
		$(".thirds").removeClass("none");
	}else if(num==3&&$('input[name="project.auctionProjectPackages[0].outType"]:checked').val()==0){
		$(".Supplier").removeClass("none");
		$(".third").removeClass("none");
		$(".thirds").removeClass("none");
	};
};
//上传附件
var FileInput = function() {
	var oFile = new Object();
	//初始化fileinput控件（第一次初始化）
	oFile.Init = function(ctrlName, uploadUrl) {
		$("#FileName").fileinput({
			language: 'zh', //设置语言
			uploadUrl: uploadUrl, //上传的地址
			uploadAsync: false,
			autoReplace: false,
			//allowedFileExtensions: ['docx', 'pdf', 'xlsx','xls'], //接收的文件后缀
			showUpload: false, //是否显示上传按钮  
			showCaption: false, //是否显示标题  
			//showCaption: true, //是否显示标题  
			browseClass: "btn btn-primary", //按钮样式       
			dropZoneEnabled: false, //是否显示拖拽区域  
			//maxFileCount: 1, //表示允许同时上传的最大文件个数
			showPreview :false,
			showRemove:false,
			layoutTemplates:{
				actionDelete:"",
				actionUpload:""
			}

		}).on("filebatchselected", function(event, files) {			
			if(event.currentTarget.files.length>1){
				parent.layer.alert('单次上传文件数只能为1个');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			}
//			var upFileName = event.currentTarget.files[0].name;
//			var index1=upFileName.lastIndexOf(".");
//			var index2=upFileName.length;
//			//var filesnames=upFileName.substring(index1+1,index2).toUpperCase();//后缀名
//			var filesnames = event.currentTarget.files[0].name.substring(event.currentTarget.files[0].name.lastIndexOf(".") + 1).toUpperCase();
//			if(filesnames != 'PDF' &&  filesnames != 'PNG' && filesnames != 'JPG' && filesnames != 'BMP' && filesnames != 'JPEG'&& filesnames != 'ZIP'
//									&& filesnames != 'RAR'&& filesnames != 'DOC'&& filesnames != 'DOCX' && filesnames != 'XLSX'&& filesnames != 'XLS'){
//				parent.layer.alert('只能上传PDF、表格、文档、图片、压缩包格式的附件');				
//				$(this).fileinput("reset"); //选择的格式错误 插件重置
//			    return;
//			};
			if(event.currentTarget.files[0].size>2*1024*1024*1024){
				parent.layer.alert('上传的文件不能大于2G');				
				$(this).fileinput("reset"); //选择的格式错误 插件重置
			    return;
			};			
	        $(this).fileinput("upload");
		}).on("filebatchuploadsuccess", function(event, data, previewId, index) {           
		    filesData.push(
				{   
					id:new Date().getTime(),
				    fileName:data.files[0].name,
				    fileSize:data.files[0].size/1000+"KB",
				    filePath:data.response.data[0]
			    }
			)
		    filesDataView()
		}).on('filebatchuploaderror', function(event, data, msg) {
			parent.layer.msg("失败");
		});
	}
	return oFile;
};

function filesDataView(){
	var tr=""	   
	for(var i=0;i<filesData.length;i++){
		tr+='<input type="hidden" name="project.purFiles['+ i +'].fileName" value="'+ filesData[i].fileName +'"/>'
          +'<input type="hidden" name="project.purFiles['+ i +'].filePath" value="'+ filesData[i].filePath +'"/>'
          +'<input type="hidden" name="project.purFiles['+ i +'].fileSize" value="'+ filesData[i].fileSize +'"/>'
	};
	$("#filesDatas").html(tr);
	if(filesData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#filesData').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
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
				field: "fileName",
				title: "文件名称",
				align: "left",
				halign: "left",

			},
			{
				field: "fileSize",
				title: "文件大小",
				align: "center",
				halign: "center",
				width:'100px',

			},			
			{
				field: "cz",
				title: "操作",
				halign: "center",
				width:'150px',
				align: "center",
				events:{
					'click .download':function(e,value, row, index){
						var newUrl = top.config.FileHost + "/FileController/download.do?ftpPath=" + row.filePath + "&fname=" +row.fileName;
						window.location.href = $.parserUrlForToken(newUrl);
					}
				},
				formatter:function(value, row, index){	
					return  "<a href='javascript:void(0)' class='btn btn-sm btn-primary download' style='text-decoration:none;margin-right:5px'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>"			
							+'<a href="javascript:void(0)"  class="btn btn-sm btn-danger" onclick=fileDetel('+ index +',\"'+row.id +'\")><span class="glyphicon glyphicon-trash" aria-hidden="true"></span>删除</a>'
				}
			},		
		]
	});
	$('#filesData').bootstrapTable("load", filesData);		
}

function fileDetel(i,uid){	
	parent.layer.confirm('确定要删除该附件', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		var itemList=new Array();
		filesData=itemList.concat(filesData);
		filesData.splice(i,1)
		if(uid.length==32){
	    	 $.ajax({
				type: "post",
				url: deleteFileUrl,
				async: false,
				dataType: 'json',
				data: {
					"id":uid ,		
				},
				success: function(data) {		
				}
			});   
	    }
	filesDataView()
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});	
	
};
   //项目类型  
var itemTypeId=[]//项目类型的ID
var itemTypeName=[]//项目类型的名字
var itemTypeCode=[]//项目类型编号
function dataTypes(){
	if(purchaseaData.project[0].projectType==0){
		var code="A"
	}else if(purchaseaData.project[0].projectType==1){
		var code="B"
	}else if(purchaseaData.project[0].projectType==2){
		var code="C"
	}else if(purchaseaData.project[0].projectType==3){
		var code="C50"
	}else if(purchaseaData.project[0].projectType==4){
		var code="W"
	}
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code='+code,
		btn:['确定','取消'],
		scrolling:'no',
		success:function(layero, index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;		        	        
		},
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit()//触发事件得到选中的项目类型的值
			if(!dataTypeList){
				return;
			}
			//iframeWin.dataTypeList为所选项目类型返回的数组
			if(dataTypeList.length>1||dataTypeList.length==0){
				parent.layer.alert("请选择一条项目类型")
	        	return
			}
			itemTypeId=[]//项目类型的ID
			itemTypeName=[]//项目类型的名字
			itemTypeCode=[]//项目类型编号
						
			for(var i=0;i<dataTypeList.length;i++){
				itemTypeId.push(dataTypeList[i].id)	
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList=itemTypeId.join(",")//项目类型的ID
			typeNameList=itemTypeName.join(",")//项目类型的名字
			typeCodeList=itemTypeCode.join(",")//项目类型编号	
			sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList)			
			if(typeCodeList.substring(0,1)=="A"){
				$("#engineering").val(0);
				$('.engineering').show();
			}
			if(typeCodeList.substring(0,1)=="B"){
				$("#engineering").val(1);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0,1)=="C"){
				$("#engineering").val(2);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0,3)=="C50"){
				$("#engineering").val(3);
				$('.engineering').hide();
			};			
			parent.layer.close(index)
		}
	
	});
};
//添加媒体
var itemTypeId=[]//媒体ID
var itemTypeName=[]//媒体名字
var itemTypeCode=[]//媒体编号


function acutionData(){
	$('#packageName').val($("#projectName").val());
 	$('#packageNum').val($("#projectCode").val());

 	var AuctionTime="";
	//0为自由竞卖，1为单轮竞卖。当为4时还有2为2轮3为三轮，这里是当竞卖方式为4时为多轮审核。在判断是2轮还是多轮
 	if($('input[name="auctionType"]:checked').val()==4){
 		$("input[name='project.auctionProjectPackages[0].auctionType']").val($('input[name="auctionTypes"]:checked').val())
 		if($('input[name="auctionTypes"]:checked').val()>1){
			var firstAuctionTime=$('input[name="firstAuctionTime"]:checked').val();//第1轮竞卖时长
			var secondAuctionTime=$('input[name="secondAuctionTime"]:checked').val()//第2轮竞卖时长
			AuctionTime='<input type="hidden" name="project.auctionProjectPackages[0].firstAuctionTime" value="'+ firstAuctionTime +'" />'
			           +'<input type="hidden" name="project.auctionProjectPackages[0].secondAuctionTime" value="'+ secondAuctionTime + '" />'
			if($('input[name="auctionTypes"]:checked').val()==3){
				var thirdAuctionTime=$('input[name="thirdAuctionTime"]:checked').val()//第3轮竞卖时长
				AuctionTime+='<input type="hidden" name="project.auctionProjectPackages[0].thirdAuctionTime" value="'+ thirdAuctionTime +'" />'
			}
			AuctionTime+='<input type="hidden" name="project.auctionProjectPackages[0].outSupplier" value="'+ $('input[name="outSupplier"]:checked').val() +'" />'
			$("#AuctionTime").html(AuctionTime)
		}
	}else{
		$("input[name='project.auctionProjectPackages[0].auctionType']").val($('input[name="auctionType"]:checked').val())		
	};
	//当为自由竞卖和单轮竞卖时，判断竞卖类型和竞卖时常
	if($('input[name="auctionType"]:checked').val()==0){//当为自由竞卖是的竞卖类型和竞卖时常的值
		$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val($("input[name='auctionDuration']:checked").val())
		$('input[name="project.auctionProjectPackages[0].auctionModel"]').val($('input[name="auctionModel"]:checked').val())
	}else if($('input[name="auctionType"]:checked').val()==1){
		$('input[name="project.auctionProjectPackages[0].auctionModel"]').val($('input[name="auctionModels"]:checked').val())
		if($("input[name='auctionDurations']:checked").val()=="0"){//竞卖时常为自定义时，竞卖时常的值
			$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val($("#auctionDurations").val())
		}else{
			$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val($("input[name='auctionDurations']:checked").val())
		};
	}else{
		$('input[name="project.auctionProjectPackages[0].auctionDuration"]').val("")
	};
}
function text(){
		var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		if($("#purchaserDepartmentId").val()==""){
			parent.layer.alert("请选择采购人所属部门");        		
			return false;
		};
		if($("#budgetPrice").val()==""){
			parent.layer.alert("预算价不能为空");        		     		
		   return;
		};
	    if($('input[name=auctionType]:checked').val()==0){
     	 		if($("#timeLimit").val()==""){
	     	 		parent.layer.alert("限时不能为空");        		     		
	     			return;
     	 	    };
     	 	   
     	 	    if(!(/^[0-9]*$/.test($("#timeLimit").val()))){
					parent.layer.alert("限时只能是数字"); 
					return;
			    }; 			    	 	
     	};
     	if($('input[name=auctionType]:checked').val()==1){
     	 		if($('input[name="auctionDurations"]:checked').val()==0){
     	 			if($("#auctionDurations").val()==""){
     	 				parent.layer.alert("自定义时长不能为空"); 
						return;
     	 			}
     	 			
     	 		}
     	};
     	if($('input[name=auctionType]:checked').val()==4&&$('input[name=auctionTypes]:checked').val()==2&&$('input[name="project.auctionProjectPackages[0].outType"]:checked').val()==0){
     	 	if($("#firstOutSupplier").val()==""){
     	 		parent.layer.alert("第1轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#firstOutSupplier").val()))){ 
					parent.layer.alert("第1轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if($("#firstKeepSupplier").val()==""){
     	 		parent.layer.alert("第1轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#firstKeepSupplier").val()))){ 
					parent.layer.alert("第1轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	
     	};
     	if($('input[name=auctionType]:checked').val()==4&&$('input[name=auctionTypes]:checked').val()==3&&$('input[name="project.auctionProjectPackages[0].outType"]:checked').val()==0){
     	 	if($("#firstOutSupplier").val()==""){
     	 		parent.layer.alert("第1轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#firstOutSupplier").val()))){ 
					parent.layer.alert("第1轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if($("#firstKeepSupplier").val()==""){
     	 		parent.layer.alert("第1轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#firstKeepSupplier").val()))){ 
					parent.layer.alert("第1轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	if($("#secondOutSupplier").val()==""){
     	 		parent.layer.alert("第2轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#secondOutSupplier").val()))){ 
					parent.layer.alert("第2轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if($("#secondKeepSupplier").val()==""){
     	 		parent.layer.alert("第2轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test($("#secondKeepSupplier").val()))){ 
					parent.layer.alert("第2轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	
     	 };
     	 if($("#rawPrice").val()==""){
	     	 	parent.layer.alert("竞卖起始价不能为空");        		     		
	     			return;
	      }; 
	     if($("#priceReduction").val()==""){
 	 		parent.layer.alert("涨价幅度不能为空");        		     		
 			return;
 	 	 }
     	 if($("#dataTypeName").val()==""){
     	 	parent.layer.alert("项目类型不能为空");        		     		
     		return;
		  };
		if($('input[name="project.auctionProjectPackages[0].isPayDeposit"]:checked').val()==0){
			if($("#payMethod").val()!=0){
				if(!$("input[name='project.auctionProjectPackages[0].projectPrices[1].agentType']:checked").val()){
					parent.layer.alert("请选择保证金收取机构");
					return;
				}				
				if($("#bankAccount").val()==""){
					parent.layer.alert("请输入保证金账户名");
					return;
				}
				
				if($("#bankName").val()==""){
					parent.layer.alert("请输入保证金开户银行");
					return;
				}
				if($("#bankNumber").val()==""){
					parent.layer.alert("请输入保证金账号");
					return;
				}
			}
			if($("#price1").val()==""){
				parent.layer.alert("请输入保证金金额");
				return;
			}
			checkBank();
		}; 
		if($('input[name="project.auctionProjectPackages[0].isSellFile"]:checked').val()==0){

			if($("#price2").val()==""){
				parent.layer.alert("请输入竞卖采购文件费");
				return;
			}
			if(filesData.length==0){
				parent.layer.alert("当需要缴纳竞卖采购文件费时，竞卖采购文件必须上传"); 	
				return false;
			}
		};   	
		if($('#detailedName').val()==""){ 
			parent.layer.alert("商品名称不能为空"); 
			return;
			};
			if($('#detailedName').val().length>70){ 
				parent.layer.alert("商品名称过长"); 
				return;
			};
			if($('#detailedCount').val()==""){ 
					parent.layer.alert("数量不能为空"); 
					return;
			};

			if(!(/^[0-9]*$/.test($("#detailedCount").val()))){ 
					parent.layer.alert("数量只能是数字"); 
					return;
			};
			if($('#detailedCount').val().length>10){ 
				parent.layer.alert("数量过长"); 
				return;
			};

			if($('#detailedUnit').val()==""){ 
					parent.layer.alert("单位不能为空"); 
					return;
			};
			if($('#detailedUnit').val().length>10){ 
					parent.layer.alert("单位过长"); 
					return;
			};	
			
			if($('#brand').val()!='' && $('#brand').val().length>70){ 
				parent.layer.alert("品牌信息过长"); 
				return;
			};
			if($('#detailedVersion').val()!='' && $('#detailedVersion').val().length>70){ 
				parent.layer.alert("型号规格及参数过长"); 
				return;
			};	
			if($('#detailedContent').val()!='' && $('#detailedContent').val().length>70){ 
				parent.layer.alert("商品详情过长"); 
				return;
			};    
	    if(massage2==2){
          	parent.layer.alert("找不到该级别的审批人,请联系管理员");
	 		 return
        };
        if($("#content").val() == "") {	
        	parent.layer.alert("请填写竞卖公告信息");
			return 
		};
		//验证费用
		var isCanSave = true;
		$('.priceNumber').each(function(){
			if(!verifySaveMoney($(this).val(), 2, $(this).attr('priceType'))){
				isCanSave = false;
				return false
			}
		});
		if(!isCanSave){
			return
		};
	    if($("#employeeId").val()==""){
          	parent.layer.alert("请选择审核人");
	 		 return
  		};  
  		form();
}
function NewDate(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date();   
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1]);
  return date.getTime();  
} 
