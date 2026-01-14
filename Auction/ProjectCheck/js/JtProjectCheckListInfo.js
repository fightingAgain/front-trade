var findPurchaseUrl=config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
//该条数据的项目id
var projectDataID="";
 
var projectData=[];
var uid = $.query.get("key"); //主键id 项目id
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var tenderTypeNum = $.query.get("tenderType");
var isPublic=$.query.get('pulice');
var supplierType="0"
var flieListUrl=config.AuctionHost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.AuctionHost +'/PackageDetailedController/list.do'//明细查看
var bjDetailedlist=config.AuctionHost +'/PackageQuatePriceController/findPackageQuateList.do'//报价表查看
var urlfindProjectSupplementInfo = top.config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var getImgListUrl = config.AuctionHost + "/FormPlateFileController/findFormPlateFile.do"; //查看附件
var packageInfo=""//包件信息
var packageCheckListInfo=[]//评审项信息
var packageDetailInfo=[]//明细信息
var projectSupplementList=[]
var checkListItem=[];//评价项信息
var packagePrice=[];
var WORKFLOWTYPE ='jztp_ggxx'
//var DetailedItemData=""//分项信息
var publicData=[];//邀请供应商数据列表
var examType;
var optionListd;
var appointmentData;
$(".tenderTypeW").hide();
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
$(function(){
	$.ajax({
		url:config.AuctionHost+'/JtProjectPackageController/findProjectPackageInfo.do',
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
				examType=packageInfo.examType;
				publicData=packageInfo.projectSupplierList;
				packagePrice=packageInfo.projectPrices;
				optionListd=packageInfo.options
				if(packageInfo.projectSupplement&&packageInfo.projectSupplement.length>0){
					for(var i=0;i<packageInfo.projectSupplement.length;i++){
						if(packageInfo.projectSupplement[i].examType==examType){	   	  			
							projectSupplementList.push(packageInfo.projectSupplement[i])   	  			
						}
					}
				}
			
				if(packageInfo.biddingRoomAppointment){
					for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
						if(packageInfo.biddingRoomAppointment[i].examType==packageInfo.examType){
							appointmentData=packageInfo.biddingRoomAppointment[i]
						}
					}
					callbackData(appointmentData)	
				}
		  	}
															
		},
		error:function(data){
			parent.layer.alert("获取失败")
		}
 	});	
 	Purchase(packageInfo.projectId);
	//  PackageCheckList(0);
	fileList()
	 offer();
	 timeData()
	// if(packageInfo.inviteState==1){
	// 	if(packageInfo.examType==0){
	// 		suppliment();
	// 	}else{
	// 		supplimentInt(1);
	// 	};
	// }else{
	// 	suppliment();
	// };
	if(isPublic=='2'||isPublic=='3'){
		supplimentInt(1);
	}else{
		suppliment();
	}		 			        	
	package();
	hasData();
	findWorkflowCheckerAndAccp(packageInfo.id);	
})


//时间
function timeData(){
	$.ajax({   	
		url:config.AuctionHost+'/JtProjectPackageController/findInvitationTime.do',
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			id:uid
		},
		success:function(data){			   		
			if(data.success==true){
				if(data.data){
					packageInfo.jtNotice=data.data

				
				}else{
					if(packageInfo.jtNotice==undefined){
						packageInfo.jtNotice=""
					}	
				}
			}else{
				parent.layer.alert(data.message)
			}
		}   	
	});
}

/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml();
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
		if(reg.test(packageInfo[this.id])){
			$(this).html(packageInfo[this.id].substring(0,16));
		}
	});	
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
	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');
	$("#examtypeName").html(packageInfo.examType==0?'资格预审':'资格后审')
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
	if(packageInfo.isPublic>1){
		$(".yao_btn").show();
		Public(5,packageInfo.id,packageInfo.projectId);	
	}	

	if(packageInfo.checkPlan==0){
		var checkPlans="综合评分法";
		$("#supplierOrDeviate").html('');
		$('#keepNum').hide();
		$('#deviate').hide();
	}else if(packageInfo.checkPlan==1){
		var checkPlans="最低评标价法";
		$("#supplierOrDeviate").html('允许最大偏离项数');
		$('#deviate').show();
		$('#keepNum').hide();
	}else if(packageInfo.checkPlan==2){
		var checkPlans="经评审的最低价法(价格评分)";
		$("#supplierOrDeviate").html('');
		$('#keepNum').hide();
		$('#deviate').hide();
	}else if(packageInfo.checkPlan==3){
		var checkPlans="最低投标价法";
		$("#supplierOrDeviate").html('允许最大偏离项数');
		$('#deviate').show();
		$('#keepNum').hide();
	}else if(packageInfo.checkPlan==5){
		var checkPlans="经评审的最低投标价法";
		$("#supplierOrDeviate").html('允许最大偏离项数');
		$('#deviate').show();
		$('#keepNum').hide();
	}else if(packageInfo.checkPlan==4){
		var checkPlans="经评审的最高投标价法";
	}
	if(packageInfo.parleyType==1){
		var parleyTypes="企业";
	}else if(packageInfo.parleyType==0){
		var parleyTypes="政府";
	}
	$("#parleyType").html(parleyTypes);
	 	
	 $("#remark").html(packageInfo.examRemark);

 	$("#checkPlan").html(checkPlans);

	if(tenderTypeNum==5){
		$(".tenderTypeW").hide();
	}else{
		$(".tenderTypeW").show();
		$('.bk').html('报价');
		$('.intation').hide();
	}
	
		
	
	if(optionListd.length>0){
		// var dist=""
		// for(var i=0;i<optionListd.length;i++){
		// 	dist+=optionListd[i].optionText+(i==0&&optionListd.length>1?'、':"")	
		// }
		
		// $("#optionNamesdw").html(dist)

		var options = optionListd;
		var stage = WORKFLOWTYPE;

		var optionText = [];
		var emptyText = [];
		
		for(var i=0;i<options.length;i++){
			if (stage == options[i].stage) {
				optionText.push(options[i].optionText);
			}
			if (!options[i].stage) {
				emptyText.push(options[i].optionText);
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
};

//查公告变更记录表
function changeReacod(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看变更记录'
        ,area: ['80%', '80%']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Agent/Purchase/model/choicePackage.html'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.changeTable(packageInfo)
        }
    });
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
					WORKFLOWTYPE = "jztp_xmby";
					findWorkflowCheckerAndAccp(uid);
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
//获取询比公告发布的数据
function Purchase(uid){	
	projectDataID=uid
	$.ajax({
		url: findPurchaseUrl+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':uid,
		},
		success: function(data) {			
			projectData=data.data;
			PurchaseData();
			
		}
	});		   						
};

function PurchaseData(){
	 //渲染公告的数据
	$('div[id]').each(function(){
		$(this).html(projectData[this.id]);
	});
	if(projectData.projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}  
	if(projectData.isAgent==0){
		$('.isAgent1').hide()
	}else{
		$('.isAgent1').show()
	}
}
  //报价表
  function offer(){
	$("#offerForm").offerForm({
		saveurl:config.AuctionHost+'/PackagePriceListController/savePriceList.do',//保存接口
		viewURL:config.AuctionHost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:1,
		},
		status:2,//1为编辑2为查看
		offerSubmit:'.offerBtn',//提交按钮
		tableName:'offerTable'//表格名称
	})
}


// 分项报价附件
function fileList(){
	$("#fileList").fileList({
		status:2,//1为编辑2为查看
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			offerFileListId:"0"
		},
		isShow:packageInfo.isOfferDetailedItem,
		flieName: '#fileHtml',//分项报价DOM
	

	})
}