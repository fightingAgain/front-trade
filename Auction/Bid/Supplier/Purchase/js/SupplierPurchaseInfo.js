var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var downloadFileUrl = config.bidhost + '/FileController/download.do'; //下载文件接口
var payUrl='0502/Supplier/Offer/model/purchaseOffer.html'//包件页面路径
var viewUrl = '0502/Supplier/signUp/model/signInfo.html';
var BidFileDownloadUrl='0502/Bid/Purchase/model/view_DownloadReport.html'//添加下载记录页面
var pricelist=config.bidhost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var loadFile = config.bidhost + "/FileController/download.do"; //文件下载
var tenderTypeCode=sessionStorage.getItem('tenderTypeCode')//资格审查的缓存
var packageId
var supplierType="1"
var examType;
//该条数据的项目id
var projectDataID="";
 
var projectData=[];
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
 //初始化
//获取询比公告发布的数据
var userName,userId,purchaserNames;
var isAccepts="";
var optionListd;
function Purchase(uid){	
	projectDataID=uid
	$.ajax({
		url: findPurchaseUrl+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':projectDataID,
			
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

var packageInfo=""//包件信息
var packageDetailInfo=[]//明细信息

var businessPriceSetData=""//自定义信息
var projectSupplementList=[];
var checkListItem=[]//评价项信息
var nowDate=new Date()
//var DetailedItemData=""//分项信息

var checkPlana=""
var publicData=[];//邀请供应商数据列表

//打开弹出框时加载的数据和内容。
function du(uid,examTypes){
	$('#btn_close').click(function(){
		var index = parent.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});
	if(examTypes!=null&&examTypes!=undefined&&examTypes!==""){
		examType=examTypes;
	}else{
		examType=sessionStorage.getItem('examType');
	}
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
				 packageId=packageInfo.id;
	   	  	if(packageInfo.businessPriceSetList.length>0){
	   	  		businessPriceSetData=packageInfo.businessPriceSetList[0]
	   	  	}
	   	  	sessionStorage.setItem('subDate', packageInfo.subDate);//邀请供应商的数据缓存
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
			new UEditorEdit({
				pageType: "view",
				examType:examTypes,
				contentKey: projectSupplementList.length==0?'remark':'oldRemark'
			});
			mediaEditor.setValue(projectSupplementList.length==0?packageInfo:projectSupplementList[0]);
	   	  }
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		if(data.success){
	   			userName=data.data.enterpriseName;
		   		sessionStorage.setItem('userName', userName);//邀请供应商的数据缓存  
		   		userId=data.data.id;
	   		}
	   		
	   	}
	});
	
//	DetailedItemData=JSON.parse(sessionStorage.getItem('DetailedItemData'));//读取分项信息的缓存
	suppliment()
	package();
	PackageCheckList(0)
	getProjectPrice(packagePrice)	
	isAcceptText()
	
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
	
	/*start报价*/
	offerFormData();
	fileList();
	/*end报价*/
};
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml()
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
		if(reg.test(packageInfo[this.id])){
			$(this).html(packageInfo[this.id].substring(0,16));
		}
	});
	if(top.isSetServiceCharges=="YES"){
		$("#isSetServiceCharges").show();
		findServiceCostSet()
	}else{
		$("#isSetServiceCharges").hide();
	}
	hasData()
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');
	$("#examtype").html(packageInfo.examType==0?'资格预审':'资格后审');
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "含在代理服务费中（代理机构承担）":(packageInfo.feeUnderparty == 2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付"));
	// $("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "代理机构":"中选（标）单位");
	$("#tax").html(packageInfo.tax);
	if(optionListd.length>0){
		var optionText=[]
		var emptyText = [];
		for(var i=0;i<optionListd.length;i++){
			optionText.push(optionListd[i].optionText);
			// dist+=optionListd[i].optionText+(i==0&&optionListd.length>1?'、':"")	
		}
		
		$("#optionNamesdw").html(optionText.join('，'))
	}else{
		$("#optionNamesdw").html('无')
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
 	
	if(examType==1){
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
		}/* else if(packageInfo.checkPlan == 4){
				var checkPlans="竞价"; 		
			} */
	}else if(examType==0){
		if(packageInfo.examCheckPlan==0){
			var checkPlans="合格制";
			
		}else if(packageInfo.examCheckPlan==1){
			var checkPlans="有限数量制";		
		}
	}
 	$("#checkPlan").html(checkPlans)
 	if(examType==0){//资格审查0为资格预审1为资格后审								    
	    $(".tenderTypeW").hide();
	    $(".bidEndnone").hide();
	    $(".tenderType06").hide();
	    $(".tenderType0").show();
	    
	}else{//资格审查0为资格预审1为资格后审
		$(".tenderTypeW").show();
		
		if(projectData.tenderType==6){//1询比采购、6单一来源采购						
			$(".tenderType06").hide();
			$(".tenderType0").hide();			
		}else{//1询比采购、6单一来源采购
			$('.ys').html('后审');
			$(".tenderType0").show();
			$(".tenderType06").show();
						
		};		
		packageDetailData();
		if(businessPriceSetData.isShowPriceSet!=1){			
			scoreTypeBtn(businessPriceSetData.checkType,packageInfo.checkPlan,'isShowPriceSet');
		}else{
			$(".isShowPriceSet").hide()
		}
		
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
		var heightAUto='304'
	}else{
		var heightAUto=''
	}
	$('#tbodym').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:heightAUto,
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
function isAcceptText(){
	
	if(packageInfo.isPublic>1){		
		for(var i=0;i<publicData.length;i++){
			if(publicData[i].supplierId==userId){
				if(publicData[i].isAcceptText!=undefined){
					isAccepts=publicData[i].isAcceptText
				};				
			};
		};
        if(userId!=""&&userId!=undefined){
        	//if(GetTime(nowDate)>GetTime(packageInfo.noticeStartDate)&&GetTime(nowDate)<GetTime(packageInfo.offerEndDate)){
		    if(isAccepts!="拒绝"&&isAccepts!="接受"){
			    	affirmBtn()
	//				parent.layer.confirm('采购人'+$("#agencyName").html()+'邀请您参与'+packageInfo.packageName+'项目，请确认是否参加', {
	//				  btn: ['是', '否'] //可以无限个按钮
	//				}, function(index, layero){
	//				    
	//				  parent.layer.close(index);
	//				  affirmBtn();
	//				}, function(index){
	//				   parent.layer.close(index);
	//				});
				}
		    //}		
			$(".isAccept").show();
			isAcceptsNone(isAccepts);
       }	
	}else{
		$(".isAccept").hide();
		$("#isAcceptText").html('未确认');
	};
};
function isAcceptsNone(isAcceptsd){
	isAccepts=isAcceptsd;
	if(isAcceptsd=='接受'){
			$("#isAcceptText").html('<div class="text-success">'+ isAcceptsd +'</div>');
		}else if(isAcceptsd=='拒绝'){
			$("#isAcceptText").html('<div class="text-danger">'+ isAcceptsd +'</div>');
		}else if(isAcceptsd==''){
			$("#isAcceptText").html('未确认');
		};
};
function affirmBtn(){
	sessionStorage.setItem('Num', '0');//邀请供应商的数据缓存  
	parent.layer.open({
		type: 2, //此处以iframe举例			
		title: '邀请函',
		area: ['600px', '300px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: '0502/Bid/Purchase/model/affirm.html',
		success:function(layero,index){
			
		}
	});
};
function findServiceCostSet(){
	$.ajax({
		url:config.Syshost+'/ServiceCostSetController/findServiceCostSetList.do',
		type:'get',
		dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			"tenderType":0,			
		},
		success:function(data){	 
			if(data.success){
				var list="";
				var listN="",listP="";
				for(var i=0;i<data.data.length;i++){
					if(data.data[i].isUse == 0){
						if(data.data[i].costType==0){
							list+=data.data[i].serviceCharge+'元/次'
						}
						if(data.data[i].costType==1 && data.data[i].tenderType == 0){
							listP+='或' + data.data[i].serviceCharge+'元/年'
						}
						if(data.data[i].costType==1 && data.data[i].tenderType == 9){
							// listN+=data.data[i].serviceCharge+'元/年'
							listN+='或通用年费'

						}
					}
				}
				$("#findServiceCostSetList").html(list+listP+listN+'（<a href="'+ platformFeeNoticeUrl +'" target ="_blank">点击这里查看平台服务费收费标准</a>）')
			}
		}  
 	});
}

/*start报价表  调用报价封装方法 */
var fileUp;
function offerFormData(){
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
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:2,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageId,
				projectId:projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			offerAttention:packageInfo.offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		});
	}

}
/*end报价表*/