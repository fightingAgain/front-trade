var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.bidhost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var urlfindProjectSupplementInfo = top.config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';//补遗接口
var packageInfo=""//包件信息
var edittype="detailed";
var supplierType="0";
var packageDetailInfo=[];//明细信息
var projectSupplementList=[];
var appointmentData;//预约信息
var WORKFLOWTYPE = "xmgg";
var publicData=[];//邀请供应商数据列表
var examType;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var enterpriseType="04";
var projectType;
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
				packageInfo=data.data;//包件信息	
				examType=packageInfo.examType;//资格审查方式
				//变更信息
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
			}else{
				top.layer.alert(data.message);
			}
	   	},
	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});	
	package();
};
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml();
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
	$("#isHasDetailedListFile").html(packageInfo.isHasDetailedListFile==1?'需要清单文件':'不需要清单文件');
	$("#isHasControlPrice").html(packageInfo.isHasControlPrice==1?'需要控制价':'不需要控制价');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件');
//	$("#isOfferDetailedItem").html(packageInfo.isOfferDetailedItem==0?'需要分项报价表':'不需要分项报价表');
	$("#examtypeName").html(packageInfo.examType==0?'资格预审':'资格后审');
	$("#isTax").html(packageInfo.isTax==0?'不需要税率':'需要税率');
	$("#tax").html(packageInfo.tax);
	if(packageInfo.packageSource==1){
		$("#isSupplierCount").show();
		$("input[name='supplierCount']").val(packageInfo.supplierCount)
	}else{
		$("#supplierCount").show()
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
	if(packageInfo.isPublic>1){	
		$(".yao_btn").show();
		Public()				
	}else{
		$(".yao_btn").hide();	
	}
	if(examType==1){
 		if(packageInfo.checkPlan==0){
	 		var checkPlans="综合评分法";
	 		
	 	}else if(packageInfo.checkPlan==1){
	 		var checkPlans="最低评标价法";
	 		
	 	}else if(packageInfo.checkPlan==2){
	 		var checkPlans="经评审的最低价法(价格评分)";
	 		
	 	}else if(packageInfo.checkPlan==3){
			var checkPlans="最低投标价法";
			
		}else if(packageInfo.checkPlan==5){
			var checkPlans="经评审的最低投标价法";
			
		}	 	
	 $("#remark").html(packageInfo.examRemark);
 	}else if(examType==0){
 		if(packageInfo.examCheckPlan==0){
	 		var checkPlans="合格制";	
	 	}else if(packageInfo.examCheckPlan==1){
	 		var checkPlans="有限数量制";	
	 	};
	 	
	 	 $("#remark").html(packageInfo.remark);
 	}; 	
 	$("#checkPlan").html(checkPlans);
 	if(examType==0){//资格审查0为资格预审1为资格后审								    
	    $(".tenderTypeW").hide();
	    $(".bidEndnone").hide();
	    $(".tenderType06").hide();
	    $(".tenderType0").show();
	}else{//资格审查0为资格预审1为资格后审
		$(".tenderTypeW").show();		
		$('.intation').hide();
		packageDetailData();	
		
	};		
	getProjectPrice();
	setTimeout(function() {
		$('#optionNamesdwTr').show();
		if(packageInfo.options.length>0){
			var optionText=[]
			var emptyText = [];
			for(var i=0;i<packageInfo.options.length;i++){
				if (WORKFLOWTYPE == packageInfo.options[i].stage) {
					optionText.push(packageInfo.options[i].optionText);
				}
				if (!packageInfo.options[i].stage) {
					emptyText.push(packageInfo.options[i].optionText);
				}
			}
			if (optionText.length == 0) {
				optionText = emptyText;
			}
			
			$("#optionNamesdw").html(optionText.join('，'))
		}else{
			$("#optionNamesdw").html('无')
		}
	})
	
};
$("#btn_close").on('click',function(){
	parent.layer.close(parent.layer.getFrameIndex(window.name));	
})
//明细表的数据获取
function packageDetailData(){
	$.ajax({
	   	url:Detailedlist, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
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
//查公告变更记录表
function changeReacod(){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看变更记录'
        ,area: ['1100px', '650px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Purchase/Purchase/model/choicePackage.html'
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.changeTable(packageInfo.id,packageInfo.examType,callbacksupple)
        }
    });
}
function callbacksupple(rowData){
	SupplementInfo(rowData.id)
}
var oldremarks;
var ueRemarks;
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
							ueRemarks=result.data.remark;
				    }else{
				    	if(result.data.examRemark!=undefined&&result.data.examRemark!=""&&result.data.examRemark!=null){
				    		$("#remark").html(result.data.examRemark);
				    		oldremarks=result.data.oldExamRemark;
								ueRemarks=result.data.examRemark;
				    	}else{
					    	$("#remark").html(result.data.remark);
					    	oldremarks=result.data.oldRemark;
								ueRemarks=result.data.remark;
				    	}
				    					    	
				    }
					
					var resData = result.data;
					resData.remark = ueRemarks;
					initUEditor(result.data)
					WORKFLOWTYPE = "xmby";
					findWorkflowCheckerAndAccp(uid);
				}				 
			}
		});
}

function previews(num){
	localStorage.removeItem('htmlremak');
	window.localStorage.setItem('remakNum', '1')//确定是补遗的浏览
	
	if(oldremarks!=undefined){
		window.localStorage.setItem('htmlremak', JSON.stringify(oldremarks));//获取当前选择行的数据，并缓存
	}		
	window.open("../../../../../preview.html");  
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