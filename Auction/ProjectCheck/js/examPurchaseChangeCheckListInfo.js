

//查询补遗信息
var urlfindProjectSupplementInfo = top.config.AuctionHost + '/ProjectSupplementController/findProjectSupplementInfo.do';
var findPurchaseUrl=config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var urlDownloadFile = top.config.FileHost + "/FileController/download.do"; //下载文件地址
var id = getUrlParam('id'); //获取id
var packageIds=getUrlParam('packageId');
var edittype=getUrlParam('edittype');
var isTimeOut=getUrlParam('isTimeOut');
var WORKFLOWTYPE = "xmby";
var packageInfo;
var projectData,packagePrice,examType,optionListd;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var changeEndDate;
var changeNoticeType = 1;//邀请
// var fileUp; //报价表
$(function() {
	if(edittype == "detailed") {
		$("#btn_submit").hide();
		$("#tableWorkflow").hide();
	}else{
		/*if(isTimeOut==1){
			parent.layer.alert('该公告变更已过期只能选择未通过')
			$('input[name="auditState"]').attr('disabled',true)
			$('input[name="auditState"][value="1"]').attr('checked',true)
		}*/
	}
   
	//查询审核等级和审核人
	findWorkflowCheckerAndAccp(id);
	//查询补遗信息
	setSupplement(id);	
	
	if(edittype != "detailed") {
		//console.log(packageInfo.examType);
		if(packageInfo.examType == 0){
			//预审
			changeEndDate = $("#oldAcceptEndDate").html();//原邀请截止时间
			if($("#acceptEndDate").html() != ""){
				changeEndDate = $("#acceptEndDate").html();//邀请截止时间
			}
		}else{
			//后审
			changeEndDate = $("#oldNoticeEndDate").html();//原公告截止时间
			if($("#noticeEndDate").html() != ""){
				changeEndDate = $("#noticeEndDate").html();//公告截止时间
			}
		}
		
		//console.log(changeEndDate);
		//判断截止时间是否超过当前时间
		/*var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		if(NewDate(changeEndDate) < NewDate(nowDate)){
		    parent.layer.alert('温馨提示：当前时间大于公告截止时间');
		};*/
	
	}
})
//查询补遗信息
function setSupplement() {	
	
	$.ajax({
	   	url:config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":packageIds
	   	},
	   	success:function(data){
	   	  if(data.success){
	   	  	packageInfo=data.data;	
	   	  	packagePrice=packageInfo.projectPrices;
	   	  	examType=packageInfo.examType;
	   	  	projectIds=packageInfo.projectId;
	   	  	optionListd=packageInfo.options;
	   	  	package();
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
	   	  }	   		   			   		   			   	
	   	},	   	
	   	error:function(data){
	   		parent.layer.alert("获取失败")
	   	}
	});
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':projectIds,
			
		},
		success: function(data) {	
			if(data.success){
				projectData=data.data;
				PurchaseData();
			}					
		}
	});
	$.ajax({
		url: urlfindProjectSupplementInfo,
		type: 'post',
		dataType: 'json',
		async: false,
		data: {
			"id": id,
		},
		success: function(result) {
           if(result.success){
	           	var data = result.data;
				//下载文件挂载
				getpurFileList(data.purFiles);
				packsuppliment(data)
           }
			
		}
	});
	
	/*start报价*/
	/* offerFormData();
	fileList(); */
	/*end报价*/
}

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
			$(".isAgent1").hide()
		}
}
/*====ajax请求获取包件信息的数据获取====*/
function package(){
	montageHtml();
	$('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
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
	$("#examtype").html(packageInfo.examType==0?'资格预审':'资格后审');
	$("#feeUnderparty").html(packageInfo.feeUnderparty == 1 ? "含在代理服务费中（代理机构承担）":(packageInfo.feeUnderparty == 2?"另行结算-招标人（委托方）支付":"另行结算-中标（选）单位支付"));
	getProjectPrice(packagePrice);
	if(packageInfo.examType==1){
		$(".showExam1").show();
		$(".showExam0").hide();
	}else{
		$(".showExam1").hide();
		$(".showExam0").show();
	}
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
		var checkPlans="经评审的最高投标价法";
	}
 	$("#checkPlan").html(checkPlans)
	$("#noticeStartDate").val(packageInfo.noticeStartDate);
	$("#noticeEndDate").val(packageInfo.noticeEndDate);
	$("#submitExamFileEndDate").val(packageInfo.submitExamFileEndDate);
	$("#supplierCount").html(packageInfo.examType==0?packageInfo.inviteSupplierCount:packageInfo.supplierCount);

   	if(packageInfo.isPublic==0){
   		if(packageInfo.examType == 0){
   			$("#isPublic").html("仅限邀请供应商")
   		} else {
 			$("#isPublic").html("所有供应商")
 		}
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
 	if(packageInfo.ispubli)
	 if(packageInfo.isPublic>1){
		$(".yao_btn").show();
		Public(0,packageInfo.id,packageInfo.projectId);	
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
}
function getpurFileList(data) {
	$("#AccessoryList").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: "fileName",
				halign: "center",
				title: "文件名"
			},
			{
				title: "操作",
				align: "center",
				halign: "center",
				width: "10%",
				events:{
					'clikc .openAccessory':function(e, value, row, index){
						var newUrl = urlDownloadFile + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
						window.location.href = $.parserUrlForToken(newUrl);
					}
				},
				formatter: function(value, row, index) {
					return "<a href='javascript:void(0)' class='btn btn-primary btn-xs openAccessory'>下载</a>"
				}
			},
		]
	})
	$("#AccessoryList").bootstrapTable("load", data);
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function packsuppliment(data){
	var reviewStartTimeLabel = '询比评审时间<span></span>';
	if (packageInfo.encipherStatus == 1) {
		reviewStartTimeLabel = '开启时间';
	}
	var List="";
	if(examType==1){
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
     		+'<td style="text-align: left;" '+(packageInfo.isSign==1?'1':'colspan="3"')+'>'
     			+'<div id="noticeStartDate"></div>'     			
     		+'</td >'
     		if(packageInfo.isSign==1){
			List+='<td style="width:220px;" class="th_bg">报名开始时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="signStartDate"></div>'     			
	     		+'</td >'
     		}
     	List+='</tr>'
     	List+='<tr>'
	     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
 				+'<td style="text-align: left;">'
 					+'<div id="noticeEndDate"></div>'     			
     			+'</td >'
	     		+'<td style="width:220px;" class="th_bg">原始接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldNoticeEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
     	if(packageInfo.isSign==1){
	     	
	     	List+='<tr>'
	     		+'<td style="width:220px;" class="th_bg">报名截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="signEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">原始报名截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldSignEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
	     	}
	}
		     	
		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="askEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始提出澄清截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldAskEndDate"></div>'     			
     		+'</td >'
     	+'</tr>' 
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="answersEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始答复截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldAnswersEndDate"></div>'     			
     		+'</td >'
     	+'</tr>'
     	if(examType==0){
     		List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="acceptEndDate"></div>'     			
	     		+'</td >'
	     		+'<td style="width:220px;" class="th_bg">原始接受邀请截止时间</td>'
	     		+'<td style="text-align: left;">'
	     			+'<div id="oldAcceptEndDate"></div>'     			
	     		+'</td >'
	     	+'</tr>'
     	}
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="offerEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始报价截止时间</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldOfferEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
     	List+='<tr>'
     		+'<td style="width:220px;" class="th_bg">' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="checkEndDate"></div>'     			
     		+'</td >'
     		+'<td style="width:220px;" class="th_bg">原始' + reviewStartTimeLabel + '</td>'
     		+'<td style="text-align: left;">'
     			+'<div id="oldCheckEndDate"></div>'	
     		+'</td>'
     	+'</tr>'
	$("#nowOrOld").html(List);
 	$('div[id]').each(function(){
     	if(reg.test(data[this.id])){
			$(this).html(data[this.id].substring(0,16));
		}					
	 });
	$("#noticeStartDate").html(packageInfo.noticeStartDate!=undefined?packageInfo.noticeStartDate.substring(0,16):"");
	$("#signStartDate").html(packageInfo.signStartDate!=undefined?packageInfo.signStartDate.substring(0,16):"");
	if(packageInfo.examType==0){
		$("#remark").html(data.examRemark)
	}else{
		$("#remark").html(data.remark)
	}
	new UEditorEdit({
		examType: packageInfo.examType,
		pageType:'view',
		contentKey: packageInfo.examType == 0 ? 'examRemark' : 'remark',
	})
	mediaEditor.setValue(data);
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

/*satrt报价表*/
// function offerFormData(){
// 	$("#offerForm").offerForm({
// 		viewURL:config.AuctionHost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
// 		parameter:{//接口调用的基本参数
// 			packageId:packageInfo.id,
// 			projectId:packageInfo.projectId, 
// 			examType:packageInfo.examType,
// 		},
// 		status:2,//1为编辑2为查看
// 		tableName:'offerTable'//表格名称
// 	})
// }
// //分项报价附件
// function fileList(isOfferDetailedItem,offerAttention){
// 	if(isOfferDetailedItem==undefined){
// 		isOfferDetailedItem = packageInfo.isOfferDetailedItem;
// 	}
// 	if(offerAttention==undefined){
// 		offerAttention = packageInfo.offerAttention;
// 	}
// 	if(!fileUp){
// 		fileUp=$("#fileList").fileList({
// 			status:2,//1为编辑2为查看
// 			parameter:{//接口调用的基本参数
// 				packageId:packageInfo.id,
// 				projectId:packageInfo.projectId, 
// 				offerFileListId:"0"
// 			},
// 			isShow:isOfferDetailedItem,//是否需要分项报价
// 			offerAttention:offerAttention,
// 			flieName: '#fileHtml',//分项报价DOM
	
// 		});
// 	}

// }
/*end报价表*/