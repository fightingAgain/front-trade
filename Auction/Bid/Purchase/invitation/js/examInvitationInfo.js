

var nedata= []//发添加的tabs的数组
//包件添加信息
var data={}
//综合评分添加tabs的数组
 //添加评价项的数组
var Score_Total_num="";//分值合计
var packageCheckListId="";
var _$index=""
var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var deleteFileUrl= config.bidhost + '/PurFileController/delete.do';//删除已上传文件信息
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var Detailedsave=config.bidhost +'//PackageDetailedController/save.do'//明细添加
var Detailedupdate=config.bidhost +'//PackageDetailedController/update.do'//明细修改
var Detaileddelete=config.bidhost +'//PackageDetailedController/delete.do'//明细删除
//var saveByExcel=config.bidhost+'/PackageCheckItemController/saveByExcel.do'//批量导入评价项
var saveByExcelDetailed=config.bidhost+'/PackageDetailedController/saveByExcel.do'//批量导入明细信息
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
var packagePrice = [];//费用信息
var CheckUrl="0502/Bid/Purchase/model/add_Check.html" ;
var addsupplier='Auction/common/Purchase/invitation/model/examAddSupplier.html';//邀请供应商的弹出框路径
var checkItemUrl='Auction/common/Purchase/Purchase/model/checkListItem.html';//添加明细路径
var viewSupplierUrl="Auction/common/Purchase/Purchase/model/viewSupplier.html"
var AccessoryList=[];
var WeightsTotal="";//权重值总和
var WeightTotalnum="";//已有权重值的和
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var projectType = getUrlParam("projectType");;//项目类型
var examTypeShow=0;
var l = 0;//0为询比采购6为单一来源采购
var examType=1//资格审查的缓存
var projectCode="";//切换手写或自动生成编码
var sortNum=0
var edittype="";//判断是否需要操作
var yaoqing='0'//判断是邀请供应商还是发送邀请函
var supplier=new Array();
var tenderTypeCode = getUrlParam("tenderTypeCode"); 
var isAgent = getUrlParam("isAgent"); 
var isCheck=false;//判断是否设置了审核人。false为设置了true为没有设置
var packageInfo=""//包件信息
var supplierData=""

var packageDetailInfo=[]//明细信息

var businessPriceSetData=""//自定义信息

var checkListItem=[]//评价项信息

//var DetailedItemData=""//分项信息

var checkPlana=""
var publicData=[];//邀请供应商数据列表
var appointmentData;//预约信息
//打开弹出框时加载的数据和内容。
//打开弹出框时加载的数据和内容。
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var createType=getUrlParam('createType');
// var fileUp; //报价
$(function () {
	new UEditorEdit({
		examType:examType,
	});
	du(packageId);
	invitDatetimepicker(examType);
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
	packageInfo.examRsk=0;	
	package();		
	packageDetailData();
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
	mediaEditor.setValue(packageInfo);
};
$('#reduceNum').on('click',function(){
	var obj = $("#inviteSupplierCount");
           if (obj.val() <= 0) {
                obj.val(0);
           } else {
                obj.val(parseInt(obj.val()) - 1);
           }
    obj.change();
})
$('#addNum').on('click',function(){
	var obj = $("#inviteSupplierCount");
           obj.val(parseInt(obj.val()) + 1);
           obj.change();
});
//切换模板
function changHtml(templateId){
	var States='&packageState=2&inviteState=0'
	var packUrl=config.bidhost + '/PurchaseController/updateInvitationPackage.do'; 
    $.ajax({
		url: packUrl, //查看 详细信息
		async: false,
		type: 'post',
		dataType: 'json',
		data:$("#formb").serialize()+States,
		success: function(data) {
		 if(data.success){
			modelHtml({'type':'xmgg', 'projectId':packageInfo.projectId,'packageId':packageInfo.id,'tempId':templateId,'tenderType':0,'examType':1})
		 }else{
		 	parent.layer.alert(data.message)
		 }
		}
	});	
}
//添加明细信息
function add_min() {
	if(packageDetailInfo.length>0){
		var sorts=parseInt(packageDetailInfo[packageDetailInfo.length-1].sort) +parseInt(1)
	}else{
		var sorts=1
	}
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加明细信息'
        ,area: ['600px', '500px']
        ,content:checkItemUrl+'?type=add&packageId='+packageInfo.id+'&sort='+sorts
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	
        },
        end:function(){
        	packageDetailData()
        }
               
      }); 
};
//修改明细信息
function minEdit(uid,$index){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改明细信息'
        ,area: ['600px', '500px']
        ,content:checkItemUrl+'?type=edit&packageId='+packageInfo.id+'&sort='+packageDetailInfo[$index].sort+'&detailedId='+uid        
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;       	
			iframeWind.$('#DetailedName').val(packageDetailInfo[$index].detailedName);//名称
			iframeWind.$('#DetailedVersion').val( packageDetailInfo[$index].detailedVersion);//型号规格
			iframeWind.$('#DetailedCount').val( packageDetailInfo[$index].detailedCount);//数量
			iframeWind.$('#DetailedUnit').val( packageDetailInfo[$index].detailedUnit);//单位
			iframeWind.$('#DetailedContent').val( packageDetailInfo[$index].detailedContent);//备注
        },
        end:function(){
        	packageDetailData()
        }      
      }); 
};
//删除明细表的数据
function mindelet(uid,i){
	
	parent.layer.confirm('确定要删除该明细', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		 $.ajax({
		   	url:Detaileddelete,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'id':uid
		   	},
		   	success:function(data){	 
		   		   			
		   	}  
		 });
         packageDetailData()
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});
	
}
var itemTypeNames=[]
var itemTypeIds=[]
var itemTypeCodes=[]
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	$('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	if(packageInfo.changePrice==1){
		$('input[name="isSellPriceFile"]').attr('disabled',true);
		$('.priceNames').attr('disabled',true)
	}
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件')
	if(packageInfo.isSign==0){
		$('.colsIs').attr('colspan','3')
		$('.isSignDateNone').hide()
	}else{
		$('.colsIs').attr('colspan','1')
		$('.isSignDateNone').show()
	}
	$("#offerAttention").html(packageInfo.offerAttention);
	$("#inviteSupplierCount").val(packageInfo.inviteSupplierCount!=undefined?packageInfo.inviteSupplierCount:'1');
    $("#Package_Name").val(packageInfo.packageName);
    $("#packageName").html(packageInfo.packageName)
	$("#Package_Num").val(packageInfo.packageNum);
	$("#packageNum").html(packageInfo.packageNum)
	$("#sort").val(packageInfo.sort);
	$("#packageId").val(packageInfo.id);
	$("#projectId").val(packageInfo.projectId);
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#tax").html(packageInfo.tax);	
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
	if(packageInfo.checkPlan==1||packageInfo.checkPlan==3){					
		$("#DeviateNum").show();
		$("#deviate").val(packageInfo.deviate)
	}else{
	   	$("#DeviateNum").hide();		   	
	}
	$("input[name='checkPlan'][value='"+ (packageInfo.checkPlan||0) +"']").attr("checked",true);    
	$('.colsIsf').attr('colspan','3')    	
	$('input[name="isSellPriceFile"]').eq(packageInfo.isSellPriceFile).attr("checked",true);
	if(packageInfo.isSellPriceFile==0||packageInfo.isSellPriceFile==undefined){//是否发售文件0为是1为否
		$('.isFtimew').show();
		$(".colspan3_pril").attr('colspan','1');
		
	}else{
		$('.isFtimew').hide();
		$(".colspan3_pril").attr('colspan','3');
		
	}
	suppliers(packageInfo.id);
	packagePriceData()
   
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
	$("#Agent_Price").val(packageInfo.agentPrice);
	$("#Agent_Account").val(packageInfo.agentAccount);
	$("#Agent_Bank_Name").val(packageInfo.agentBankName);
	$("#Agent_Bank_Number").val(packageInfo.agentBankNumber);
	
	
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
			var height='304'
	  }else{
			var height='auto'
	  }
	$('#tbodym').bootstrapTable({
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
			},
			{
				field: "#",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				formatter:function(value, row, index){	
				var mixtbody=""
                mixtbody+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=minEdit(\"'+row.id+'\",'+ index +')>编辑</a>'
                mixtbody+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=mindelet(\"'+row.id+'\",'+ index +')>删除</a>'
				return mixtbody
				}
				 
			}
		]
	});
	$('#tbodym').bootstrapTable("load", packageDetailInfo); //重载数据
};
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
//减少税率
 $(".reduceTax").on('click',function(){
 	var obj =$("#tax"); 	 	
       if (obj.val() <= 0) {
            obj.val(0);
       } else {
            obj.val(parseInt(obj.val()) - 1);
       }
      obj.change();

 })
 $(".addTax").on('click',function(){
 	   var obj = $("#tax");
       obj.val(parseInt(obj.val()) + 1);
       obj.change();          
 })
 //费用信息查询
 var priceIds="",priceNames="";
function packagePriceData(){		
	packagePrice=packageInfo.projectPrices
	if(packagePrice.length >0){			
		for(var i=0;i<packagePrice.length;i++){
		    if(packagePrice[i].priceName=="采购文件费"&&(packageInfo.isSellPriceFile==0||$('input[name="isSellPriceFile"]:checked').val()==0)){		    	
				$('input[name="projectPrices[0].payWay"]').val(packagePrice[i].payWay);
				$('input[name="projectPrices[0].priceId"]').val(packagePrice[i].priceId);				
				$('input[name="projectPrices[0].priceName"]').val(packagePrice[i].priceName);
				$('.priceNames').html('采购文件费')
				$('input[name="projectPrices[0].price"]').val(packagePrice[i].price);
				$('input[name="projectPrices[0].payType"]').val(packagePrice[i].payType);
				$('input[name="projectPrices[0].payTime"]').val(packagePrice[i].payTime);
				priceIds=packagePrice[i].priceId;
				priceNames=packagePrice[i].priceName
				
			}
			if(packagePrice[i].priceName=="报名费"){
				$("#priceIs").html(packagePrice[i].price+'(元)')
			}	
		}
	}
	if(packagePrice[packagePrice.length]==undefined){
		PackagePrice(packagePrice.length);
	};
		
}
$('input[name="isSellPriceFile"]').on('change',function(){				
	if($(this).val()==0){
		$(".isFtimew").show()
		$(".colspan3_pril").attr('colspan','1');
		$("#sellPriceFileStartDate").val(packageInfo.noticeStartDate||"");
		$("#sellPriceFileEndDate").val(packageInfo.acceptEndDate||"");
		$('input[name="projectPrices[0].payWay"]').val(1);
		$('input[name="projectPrices[0].priceId"]').val(priceIds);
		$('input[name="projectPrices[0].priceName"]').val(priceNames);					
		$('input[name="projectPrices[0].payType"]').val(1);
		$('input[name="projectPrices[0].payTime"]').val(0);		
	}else{
		$(".isFtimew").hide();
		$(".colspan3_pril").attr('colspan','3')
		$("#sellPriceFileStartDate").val("");
		$("#sellPriceFileEndDate").val("");
		$('input[name="projectPrices[0].payWay"]').val("");
		$('input[name="projectPrices[0].priceId"]').val("");
		$('input[name="projectPrices[0].priceName"]').val("");					
		$('input[name="projectPrices[0].payType"]').val("");
		$('input[name="projectPrices[0].payTime"]').val("");
		$('input[name="projectPrices[0].price"]').val("");	
	}
})
//费用信息展示
function PackagePrice(num){
	var optionFeiYong=[]
	 $.ajax({
			type: "post",
			url: config.Syshost + "/SysDictController/findOptionsByName.do",,
			datatype: 'json',
			data:{optionName:"MONEY_TYPE"},
			async: false,
			success: function(data) {
				if(data.success) {
					optionFeiYong=data.data;	 
				}
		}
   })
	for(var z=0;z<optionFeiYong.length;z++){
		if(optionFeiYong[z].optionText=="采购文件费"){
			packagePrice[num]=optionFeiYong[z];
			packagePrice[num].priceId=optionFeiYong[z].id;
		}	
	};	
	if(packageInfo.isSellPriceFile==undefined){
		if($('input[name="isSellPriceFile"]:checked').val()==0){
			$('input[name="projectPrices[0].payWay"]').val(1);
			$('input[name="projectPrices[0].priceId"]').val(packagePrice[num].priceId);
			$('input[name="projectPrices[0].priceName"]').val(packagePrice[num].optionText);	
			$('.priceNames').html('采购文件费')
			$('input[name="projectPrices[0].payType"]').val(1);
			$('input[name="projectPrices[0].payTime"]').val(0);
		};		
	}else if(packageInfo.isSellPriceFile!=undefined){
		if(packageInfo.isSellPriceFile==0||$('input[name="isSellPriceFile"]:checked').val()==0){
			$('input[name="projectPrices[0].payWay"]').val(1);
			$('input[name="projectPrices[0].priceId"]').val(packagePrice[num].priceId);
			$('input[name="projectPrices[0].priceName"]').val(packagePrice[num].optionText);	
			$('.priceNames').html('采购文件费')
			$('input[name="projectPrices[0].payType"]').val(1);
			$('input[name="projectPrices[0].payTime"]').val(0);
		}	    
	};
	$('input[name="isSellPriceFile"]').on('change',function(){
		if($(this).val()==0){
			$(".isFtimew").show()
			$('input[name="projectPrices[0].payWay"]').val(1);
			$('input[name="projectPrices[0].priceId"]').val(packagePrice[num].priceId);
			$('input[name="projectPrices[0].priceName"]').val(packagePrice[num].optionText);					
			$('input[name="projectPrices[0].payType"]').val(1);
			$('input[name="projectPrices[0].payTime"]').val(0);		
		}else{
			$(".isFtimew").hide()
			$('input[name="projectPrices[0].payWay"]').val("");
			$('input[name="projectPrices[0].priceId"]').val("");
			$('input[name="projectPrices[0].priceName"]').val("");					
			$('input[name="projectPrices[0].payType"]').val("");
			$('input[name="projectPrices[0].payTime"]').val("");
			$('input[name="projectPrices[0].price"]').val("");	
			}
	})
	
};
/*======时间：2020-11-16
		修改人：金贝贝
		功能：采购文件费的金额验证
*/
//验证金额
/* $(".priceNumber").on('change',function(){
	if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
		parent.layer.alert("采购文件费必须大于零且最多两位小数"); 
		$(this).val("");
		
		return
	};
	var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
	$(this).val(b);
}) */
/*=====END======== */
//审核确定按钮
$("#btn_submit").click(function() {
	if(timeCheck($("#timeList"))){		
		if($('input[name="isSellPriceFile"]:checked').val()==0){   		
				
			if($('input[name="projectPrices[0].price"]').val()==""){
				parent.layer.alert('请输入采购文件费用');
				return ;
				
			}		    
		}
		if(ue.getContent()==""){
			parent.layer.alert('请填写邀请函信息或选择邀请函模板');
			return ;
			
		}	
		//是否有分项报价表
		/* if($("input[name='isOfferDetailedItem']:checked").val()==0){
			if(fileUp.options.filesDataDetail.length==0){
	
			parent.layer.alert("请上传分项报价表模板");        		
				return false;
			}
		} */
		if(supplier.length==0){
			parent.layer.alert("请邀请供应商");        		
			return false;
		};
	   if(supplier.length<parseInt($("#inviteSupplierCount").val())){
			parent.layer.confirm('温馨提示：邀请供应商家数小于当前设置的最小供应商数量，是否确认提交？', {
				btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero){									
					iscekck(); 
					parent.layer.close(index);			 
			}, function(index){
					parent.layer.close(index)
			});
		}else{
			iscekck(); 			
		}
	}	
});
//保存
$("#btn_bao").click(function() {
	var States='&packageState=2&inviteState=0'
	var packUrl=config.bidhost + '/PurchaseController/updateInvitationPackage.do'; 
 	$("#examRemark").val(ue.getContent());
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
	var States;
	supplierTable();			   
	States='&packageState=2&inviteState=1'
	$("#examRemark").val(ue.getContent())
	$.ajax({   	
		   	url:config.bidhost+'/PurchaseController/updateInvitationPackage.do',//修改包件的接口
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
		   			parent.layer.alert("发送邀请函成功")
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					parent.layer.close(parent.layer.getFrameIndex(window.name));	
		   			
		   		}else{
		   			parent.layer.alert(data.message)
		   		}
		   	}   	
		});
}
//明细信息的批量导入
function importf(obj){ 
  var mask =parent.layer.load(0, {shade: [0.3, '#000000']});
  var f = obj.files[0];
  var formFile = new FormData();
  formFile.append("packageId", packageInfo.id); 
  formFile.append("excel", f); //加入文件对象
  var data=formFile
   $.ajax({
		type: "post",
		url: saveByExcelDetailed,
		async: true,
		dataType: 'json',
		cache: false,//上传文件无需缓存
        processData: false,//用于对data参数进行序列化处理 这里必须false
        contentType: false, //必须
		data: data,
		success: function(data) {
			parent.layer.close(mask);
			if(data.success==true){
				packageDetailData()
			}else{
				obj.value = ''
				obj.outerHTML=obj.outerHTML;
				parent.layer.alert(data.message)
			}
			
		}
	});
	
}
function add_supplier(){
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['1100px', '600px']
        ,content:addsupplier
        ,btn: ['保存','取消'] 
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(packageInfo.isPublic,packageInfo.purchaserId);
        }
        //确定按钮
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;                               
        	iframeWin.checkbox();	
			supplierData=iframeWin.newData;	
			supplier=[];
			for(var i=0;i<supplierData.length;i++){
				supplier.push(supplierData[i].supplierId);
			};
			table(supplier);
			parent.layer.close(index);

        },       
      });
}

function suppliers(uid){
	
	$.ajax({
		url: findSupplier, //查看 详细信息
		async: false,
		type: 'get',
		dataType: 'json',
		data: {
			'id':uid,
			
		},
		success: function(data) {
		 if(data.success){
		 	supplierData=data.data;
		 	supplier=[];
		 	for(var i=0;i<supplierData.length;i++){
		 		supplier.push(supplierData[i].supplierId);
		 	};
		 	table(supplier);
		 }																
		}
	});
	
}
function table(supplier){
	sessionStorage.setItem('keysjd', JSON.stringify(supplier));//邀请供应商的id缓存  
	sessionStorage.setItem('sadasd', JSON.stringify(supplierData));//邀请供应商的id缓存    
	$('#table').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:'304',	
		columns: [{
			field: 'checkbox',
			checkbox:true,
			formatter: function (i,row) { // 每次加载 packageData.supplierId 时判断当前 row 的 enterpriseId 是否已经存在全局 Set() 里 
               if($.inArray(row.supplierId,supplier)!=-1){// 因为 判断数组里有没有这个 id
                   
                    return {
                        checked : true               // 存在则选中
                    }
               }               
            }
		},
		{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: "enterprise.enterpriseName",
			title: "企业名称",
			align: "left",
			halign: "left",
			width: "200px",

		},
		{
			field: "enterprise.enterprisePerson",
			title: "联系人",
			halign: "center",				
			align: "center",
			width:'100px',
		}, {
			field: "enterprise.enterprisePersonTel",
			title: "联系电话",
			halign: "center",
			width:'100px',
			align: "center",								
		}, {
			field: "enterprise.enterpriseLevel",
			title: "认证状态",
			halign: "center",
			width:'100px',
			align: "center",
			formatter:function(value, row, index){					
				if(row.enterprise.enterpriseLevel==0){					
				   var	enterpriseLevel= "未认证"
				};
				if(row.enterprise.enterpriseLevel==1){					
					var	enterpriseLevel=  "提交认证"
				};
				if(row.enterprise.enterpriseLevel==2){					
					var	enterpriseLevel=  "受理认证"
				};
				if(row.enterprise.enterpriseLevel==3){
					var	enterpriseLevel=  "已认证"
				};
				if(row.enterprise.enterpriseLevel==4){
					var	enterpriseLevel=  "已认证"
				};	
	     		return enterpriseLevel
			}
		}, {
			field: "isAccept",
			title: "确认状态",
			halign: "center",
			width:'100px',
			align: "center",
			formatter:function(value, row, index){					
				if(value==0){
					var isAccept="<div class='text-success' style='font-weight:bold'>接受</div>"
				}else if(value==1){
					var isAccept="<div class='text-danger' style='font-weight:bold'>拒绝</div>"
				}else{
					var isAccept="未确认"
				}
	     		return isAccept
			}
		},{
			field: "cz",
			title: "操作",
			halign: "center",
			align: "center",
			width:'80px',
			formatter:function(value, row, index){					
				var Tdr='<div class="btn-group">'
		   		          +'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick="viewSupplier('+ index +')">查看</a>' 
		   		    Tdr+='</div>'
	     		return Tdr
			}
		}
		],
	});
	$('#table').bootstrapTable("load", supplierData); //重载数据
	$('#table').on('uncheck.bs.table check.bs.table check-all.bs.table uncheck-all.bs.table',function(e,rows){
        var datas = $.isArray(rows) ? rows : [rows];        // 点击时获取选中的行或取消选中的行
        examine(e.type,datas);                              // 保存到全局 Array() 里
	});
}
//查看邀请供应商信息
function viewSupplier(i){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看邀请供应商信息'
        ,area: ['700px', '500px']
        ,content:viewSupplierUrl
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象
        	iframeWind.du(supplierData[i])//弹出框弹出时初始化     	
        }
        
      });
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function supplierTable(){
	var hidden=""
	for(var j=0;j<supplier.length;j++){			 
		hidden+='<input type="hidden" name="invitationSupplierList['+ j +'].supplierId" value="'+supplier[j]+'" />' 
		for(var m = 0;m<supplierData.length;m++){
			if(supplier[j] == supplierData[m].supplierId){
				hidden+='<input type="hidden" name="invitationSupplierList['+ j +'].enterpriseName" value="'+supplierData[m].enterprise.enterpriseName+'" />' 
			}
		};
		hidden+='<input type="hidden" name="invitationSupplierList['+ j +'].packageId" value="'+packageInfo.id+'" />' 
		hidden+='<input type="hidden" name="invitationSupplierList['+ j +'].projectId" value="'+packageInfo.projectId+'" />' 
	}
	$('#hiddenSupplier').html(hidden)
};

function examine(type,datas){ 
	if(type.indexOf('uncheck')==-1){    
        $.each(datas,function(i,v){
        // 添加时，判断一行或多行的 id 是否已经在数组里 不存则添加　      
        
　　　　　　supplier.indexOf(v.supplierId) == -1 ? supplier.push(v.supplierId) : -1;	           
　　　　	});
    }else{
        $.each(datas,function(i,v){ 
        	 for(var m=0;m<supplier.length;m++){
            	if(supplier[m]==v.supplierId){
            		supplier.splice(m,1);    //删除取消选中行
            	}
           }                      
        });
    };
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