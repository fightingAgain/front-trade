var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var addsupplier='0502/Bid/invitation/model/examAddSupplier.html';//邀请供应商的弹出框路径
var examTypeShow=0;
var examType=1//资格审查的缓存
var tenderTypeCode='0'//资格审查的缓存
var packageInfo=""//包件信息
var supplierData=""
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var publicData=[];//邀请供应商数据列表
var projectSupplementList=[];
var packagePrice=[];
var supplier=[];
//打开弹出框时加载的数据和内容。
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
	   	  	if(packageInfo.offerAuditTimeout==1){
	   	  			$(".addSupplier").hide();
	   	  	}	 
	   	  }
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	
//	DetailedItemData=JSON.parse(sessionStorage.getItem('DetailedItemData'));//读取分项信息的缓存	
	
	packageDetailData();	
	if(businessPriceSetData.isShowPriceSet!=1){			
		scoreTypeBtn(businessPriceSetData.checkType,packageInfo.checkPlan,'isShowPriceSet');
	}else{
		$(".isShowPriceSet").hide()
	}	
};
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var itemTypeNames=[]
var itemTypeIds=[]
var itemTypeCodes=[]
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	examMontageHtml();
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	hasData()
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
	$("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "含在代理服务费中（代理机构承担）":(packageInfo.feeUnderparty == 2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付"));
//	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');	
	if(packageInfo.checkPlan==0){
 		var checkPlans="综合评分法"; 		
 	
 	}else if(packageInfo.checkPlan==1){
 		var checkPlans="最低评标价法";		
 	
 	}else if(packageInfo.checkPlan == 2){
 		var checkPlans="经评审的最低价法(价格评分)"; 		
 		
 	}else if(packageInfo.checkPlan == 3){
		var checkPlans="最低投标价法"; 		
	}else if(packageInfo.checkPlan == 5){
		var checkPlans="经评审的最低投标价法"; 		
	}else if(packageInfo.checkPlan == 4){
		var checkPlans="经评审的最高投标价法"; 			
	}
 	$("#checkPlan").html(checkPlans)
	$("#noticeStartDate").val(packageInfo.noticeStartDate);
	$("#noticeEndDate").val(packageInfo.noticeEndDate);
	$("#submitExamFileEndDate").val(packageInfo.submitExamFileEndDate);
   if(packageInfo.isPublic==0){
 		$("#isPublic").html("所有供应商")
 	}
 	if(packageInfo.isPublic==1){
 		$("#isPublic").html("所有本公司认证供应商")
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅限邀请供应商")
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅邀请本公司认证供应商")
 	}
	getProjectPrice(packagePrice);	
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
 //费用信息查询
function packagePriceData(){
	if(packagePrice.length >0){			
		for(var i=0;i<packagePrice.length;i++){
			if(packagePrice[i].priceName=="采购文件费"){
				$('.priceNames').html(packagePrice[i].priceName)
			    $("#pricel").html(packagePrice[i].price+'(元)')
			}
			
		}
	}		
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
        	iframeWind.du(isPublic)
        }
        //确定按钮
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;                               
         if(tenderTypeCode==6){
         	if(iframeWin.data.length>1){
         		parent.layer.alert('单一采购来源，只能选择一个供应商')         		
         		return
         	}
         }
         parent.layer.confirm('温馨提示：确认邀请供应商后将不能进行修改，是否确认？', {
			  btn: ['是', '否'] //可以无限个按钮
			}, function(indexLIND, layero){
				    iframeWin.checkbox();	
				    var SupplieridList=iframeWin.newData;
				    projectSuppliers="";
				    projectSuppliers+='<input name="packageId" value="'+ packageInfo.id+'"/>'
					projectSuppliers+='<input name="projectId" value="'+ packageInfo.projectId+'"/>'
					for(var i=0;i<SupplieridList.length;i++){							
						projectSuppliers+='<input name="invitationSuppliers[' + i + '].supplierId" value="'+ SupplieridList[i].supplierId+'"/>'
						projectSuppliers+='<input name="invitationSuppliers[' + i + '].isAccept" value="'+ (SupplieridList[i].isAccept!=undefined?SupplieridList[i].isAccept:'') +'"/>'			     	
				    }
					iframeWin.$("#supplier").html(projectSuppliers)					
			         $.ajax({
					   	url:config.bidhost+'/ProjectPackageController/saveProjectInviteSupplierList.do',
					   	type:'post',
					   	//dataType:'json',
					   	async:false,
					   	//contentType:'application/json;charset=UTF-8',
					   	data:iframeWin.$("#supplier").serialize(),
					   	success:function(data){	 
					   		if(data.success){					   			;	
							   	supplierData=iframeWin.newData;	
							   	supplier=[];
							    for(var i=0;i<supplierData.length;i++){
							    	supplier.push(supplierData[i].id)
							    }
							     table(supplier)
					   			 parent.layer.close(index)
					   			 parent.layer.close(indexLIND)
					   			 parent.layer.alert('邀请成功')  
					   		}else{
					   			 parent.layer.close(indexLIND)
					   			 parent.layer.alert(data.message)  
					   		}
					   	},
					   });				
				 
			}, function(index){
			   parent.layer.close(indexLIND)
			});

        },       
      });
}