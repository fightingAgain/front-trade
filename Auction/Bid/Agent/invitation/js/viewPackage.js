var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var packageInfo=""//包件信息
var edittype="detailed";
var supplierType="0"
var packageCheckListInfo=[]//评审项信息
var packageDetailInfo=[]//明细信息
var projectSupplementList=[]
var checkListItem=[];//评价项信息
var packagePrice=[];
//var DetailedItemData=""//分项信息
var WORKFLOWTYPE = "xmgg";
var publicData=[];//邀请供应商数据列表
var examType;
var optionListd;
var appointmentData;
$(".tenderTypeW").hide();
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
//打开弹出框时加载的数据和内容。
function du(uid,examTypes){
	
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
	   	  	if(examTypes!=null&&examTypes!=undefined&&examTypes!==""){
				examType=examTypes;
			}else{
				examType=packageInfo.examType;
			}
	   	  	publicData=packageInfo.projectSupplierList;
	   	  	packagePrice=packageInfo.projectPrices;
	   	  	optionListd=packageInfo.options
	   	  	for(var i=0;i<packageInfo.projectSupplement.length;i++){
	   	  		if(packageInfo.projectSupplement[i].examType==examTypes){	   	  			
	   	  			//if(packageInfo.projectSupplement[i].checkState==2){
	   	  				projectSupplementList.push(packageInfo.projectSupplement[i])
	   	  			//}	   	  			
	   	  		}
			}
				if(packageInfo.biddingRoomAppointment){
					for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
						if(packageInfo.biddingRoomAppointment[i].examType==packageInfo.examType){
							appointmentData=packageInfo.biddingRoomAppointment[i]
						}
					}		
				}
	   	  }
	   		   			   		   			   	
	   	},
	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
//	DetailedItemData=JSON.parse(sessionStorage.getItem('DetailedItemData'));//读取分项信息的缓存
	package();	
	
};
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	if(packageInfo.examType==1){
		montageHtml();
	}else{
		examMontageHtml();
	}
	for(key in packageInfo){
		if(key=='employeeId'){
			$("#"+key).val(packageInfo[key])
		}else{
			$("#"+key).html(packageInfo[key]);
			if(reg.test(packageInfo[key])){
				$("#"+key).html(packageInfo[key].substring(0,16));
			}
		}	
	}
	$("#projectId").val(packageInfo.projectId);
	$("#packageId").val(packageInfo.id);
	$("#sort").val(packageInfo.sort);
	$("#remark").html(packageInfo.remark);
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#tax").html(packageInfo.tax);
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
	$("#bankType").html(packageInfo.bankType == 1 ? "工商银行" : packageInfo.bankType == 2? "招商银行":'');
	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要':'不需要');
	$("#examtype").html(packageInfo.examType==0?'资格预审':'资格后审');
	$("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "含在代理服务费中（代理机构承担）":(packageInfo.feeUnderparty == 2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付"));
	if(packageInfo.isPayDeposit==0){
		$('.isDepositShow').show();		
	}else{
		$('.isDepositShow').hide();		
	};
	if(packageInfo.isSign==0){		
		$('.isSignDateNone').hide();
		$(".colspan3").attr('colspan','3');
	}else{
		$('.isSignDateNone').show();
		$(".colspan3").attr('colspan','1')
	}
	if(packageInfo.isPublic==0){
 		$("#isPublic").html("所有供应商");
 	}
 	if(packageInfo.isPublic==1){
 		$("#isPublic").html("所有本公司认证供应商");
 	}
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅限邀请供应商");
 	}
 	if(packageInfo.isPublic==3){
 		$("#isPublic").html("仅邀请本公司认证供应商");
 	};
	if(examType==1){
		if(packageInfo.checkPlan==0){
			var checkPlans="综合评分法";
			
		}else if(packageInfo.checkPlan==1){
			var checkPlans="最低评标价法";
			
		}else if(packageInfo.checkPlan==2){
			var checkPlans="经评审的最低价法(价格评分)";
			
		}else if(packageInfo.checkPlan==3){
		   var checkPlans="最低投标价法";
		}else if(packageInfo.checkPlan==4){
		   var checkPlans="经评审的最高投标价法";
		}else if(packageInfo.checkPlan==5){
		   var checkPlans="经评审的最低投标价法";
		}
	 	
	 $("#remark").html(packageInfo.examRemark);
 	}else if(examType==0){
 		if(packageInfo.examCheckPlan==0){
	 		var checkPlans="合格制";
	 		$("#supplierOrDeviate").html('');
	 		$('#keepNum').hide();
	 		$('#deviate').hide();
	 	}else if(packageInfo.examCheckPlan==1){
	 		var checkPlans="有限数量制";
	 		$("#supplierOrDeviate").html('最多保留供应商数');
	 		$("#supplierOrDeviateS").html('最多保留供应商数');	 		
	 		$('#keepNum').show();
	 		$('#deviate').hide();
	 		
	 	};
	 	
	 	 $("#remark").html(packageInfo.remark);
 	}; 	
 	$("#checkPlan").html(checkPlans);
 	if(examType==0){//资格审查0为资格预审1为资格后审								    
	    $(".tenderTypeW").hide();
	    $(".bidEndnone").hide();
	    $(".tenderType06").hide();
	    $(".tenderType0").show();	   
	    $('.ys').html('预审');
	    $('.bk').html('资格预审');	
	}else{//资格审查0为资格预审1为资格后审
		$(".tenderTypeW").show();
		$('.bk').html('报价');
		$('.intation').hide();
		
	};	
	if(optionListd.length>0){
		var optionText = [];
		var emptyText = [];
		for(var i=0;i<optionListd.length;i++){
			if (optionListd[i].stage == WORKFLOWTYPE) {
				optionText.push(optionListd[i].optionText);
			}
			if (!optionListd[i].stage) {
				emptyText.push(optionListd[i].optionText);
			}
		}
		if (optionText.length == 0) {
			optionText = emptyText;
		}
		
		$("#optionNamesdw").html(optionText.join('，'))
	}else{
		$("#optionNamesdw").html('无')
	}
	getProjectPrice();
	
	//start 招标代理服务费
	if(packageInfo.projectServiceFee){
		for(var key in packageInfo.projectServiceFee){
			if(key == "collectType"){
				$("#collectType").html(packageInfo.projectServiceFee[key]==1?"标准累进制":(packageInfo.projectServiceFee[key]==2?"其他":"固定金额"));
			} else {
				$("#" + key).html(packageInfo.projectServiceFee[key]);
			}
		}
	}
	//end 招标代理服务费
};

//查公告变更记录表
function changeReacod(){
	if(!projectId){
		enterpriseType='06'
	}else{
		enterpriseType='02'	
	}
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看变更记录'
        ,area: ['1100px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Agent/Purchase/model/choicePackage.html?enterpriseType='+enterpriseType
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.changeTable(packageInfo.id,1,callbacksupple)
        }
    });
}
function callbacksupple(rowData){
	SupplementInfo(rowData.id);
}
var oldremarks;
function SupplementInfo(uid){				   													
	    $.ajax({
			url: urlfindProjectSupplementInfo,
			type: 'post',
			dataType: 'json',
			async: false,
			data: {
				"id": uid,
			},
			success: function(result) {
				if(result.success){	
				    
				    $('div[id]').each(function(){
						$(this).html(result.data[this.id]);
						if(reg.test(result.data[this.id])){
							$(this).html(result.data[this.id].substring(0,16));
						}
					});	
						
					//$("#signStartDate").html(packageInfo.signStartDate)
				    if(result.data.examType==0){
				    	$("#remark").html(result.data.remark);
				    	oldremarks=result.data.oldRemark;
				    }else{
				    	if(result.data.examRemark!=undefined&&result.data.examRemark!=""&&result.data.examRemark!=null){
				    		$("#remark").html(result.data.examRemark);
				    		oldremarks=result.data.oldExamRemark;
				    	}else{
					    	$("#remark").html(result.data.remark);
					    	oldremarks=result.data.oldRemark;
				    	}
				    					    	
				    }
					WORKFLOWTYPE = "xmby";
					findWorkflowCheckerAndAccp(uid);
					mediaEditor.setValue(result.data)
				}				 
			}
		})
}

function previews(num){
	localStorage.removeItem('htmlremak');
	window.localStorage.setItem('remakNum', '1')//确定是补遗的浏览
	
	if(oldremarks!=undefined){
		window.localStorage.setItem('htmlremak', JSON.stringify(oldremarks));//获取当前选择行的数据，并缓存
	}		
	window.open("../../../../../preview.html");  
}