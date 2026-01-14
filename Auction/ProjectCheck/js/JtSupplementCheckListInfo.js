

//查询补遗信息
var urlfindProjectSupplementInfo = top.config.AuctionHost + '/JtChangNoticeController/findProjectSupplementInfo.do';
var findPurchaseUrl=config.AuctionHost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
var urlDownloadFile = top.config.FileHost + "/FileController/download.do"; //下载文件地址
var Detailedlist=config.AuctionHost +'/PackageQuatePriceController/findPackageQuateList.do'//报价表查看
var getImgListUrl = config.AuctionHost + "/FormPlateFileController/findFormPlateFile.do"; //查看附件
var id = getUrlParam('key'); //获取id
var packageIds=getUrlParam('packageId');
var edittype=getUrlParam('edittype');
var isTimeOut=getUrlParam('isTimeOut');
var isPublic=getUrlParam('pulice');
var WORKFLOWTYPE = "jztp_xmby";
var packageInfo;
var projectData,packagePrice,examType,optionListd;
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var changeEndDate;
var changeNoticeType = 0;//公开
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
		changeEndDate = $("#oldNoticeEndDate").html();//原公告截止时间
		if($("#noticeEndDate").html() != ""){
			changeEndDate = $("#noticeEndDate").html();//公告截止时间
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
	var objData={}
	if(isPublic==2||isPublic==3){
		
		objData={
			"projectSupplementType":1,
			"id": id,
		}
	}else{
		objData={
			"id": id,
		}
	}
	
	$.ajax({
	   	url:config.AuctionHost+'/JtProjectPackageController/findProjectPackageInfo.do',
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
			fileList()
	   	  	package();
			getProjectPrice(packagePrice)
			offer()
			if(packageInfo.isOfferDetailedItem=='0'){
				filesDataView('detaillist_operation_table')	
				$(".tenderTypeBj").show()
			}
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
		data: objData,
		success: function(result) {
           if(result.success){
	           	var data = result.data;
				//下载文件挂载
				getpurFileList(data.purFiles);
				packsuppliment(data)
           }
			
		}
	});
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
	 		
	 	}else if(packageInfo.checkPlan==1){
	 		var checkPlans="最低评标价法";
	 		
	 	}else if(packageInfo.checkPlan==2){
	 		var checkPlans="经评审的最低价法(价格评分)";
	 		
	 	}else if(packageInfo.checkPlan==3){
			var checkPlans="最低投标价法";
		}else if(packageInfo.checkPlan==5){
			var checkPlans="经评审的最低投标价法";
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
 	if(packageInfo.examType==0){//资格审查0为资格预审1为资格后审								    
	    $(".tenderTypeW").hide();
	    $(".bidEndnone").hide();
	    $(".tenderType06").hide();
	    $(".tenderType0").show();
	   
	}else{//资格审查0为资格预审1为资格后审
		$(".tenderTypeW").show();
		
		$('.intation').hide();
		
	};	
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
						var newUrl = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
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
};
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function packsuppliment(data){
	var List="";
	if(isPublic==2||isPublic==3){
		List+='<tr>'
		+'<td style="width:220px;" class="th_bg">接受邀请开始时间</td>'
		+'<td style="text-align: left;" colspan="'+ (packageInfo.isSign==0?'3':"") +'">'
			+'<div id="noticeStartDate"></div>'     			
		+'</td >'
		if(packageInfo.isSign==1){
		List+='<td style="width:220px;" class="th_bg">报名开始时间</td>'
			+'<td style="text-align: left;">'
				+'<div id="signStartDate"></div>'     			
			+'</td >' 
		}
	+'</tr>'
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

	}else {
		List+='<tr>'
		+'<td style="width:220px;" class="th_bg">公告开始时间</td>'
		+'<td style="text-align: left;" colspan="'+ (packageInfo.isSign==0?'3':"") +'">'
			+'<div id="noticeStartDate"></div>'     			
		+'</td >'
		if(packageInfo.isSign==1){
		List+='<td style="width:220px;" class="th_bg">报名开始时间</td>'
			+'<td style="text-align: left;">'
				+'<div id="signStartDate"></div>'     			
			+'</td >' 
		}
	+'</tr>'
	List+='<tr>'
		+'<td style="width:220px;" class="th_bg">公告截止时间</td>'
		+'<td style="text-align: left;">'
			+'<div id="noticeEndDate"></div>'     			
		+'</td >'
		+'<td style="width:220px;" class="th_bg">原始公告截止时间</td>'
		+'<td style="text-align: left;">'
			+'<div id="oldNoticeEndDate"></div>'     			
		+'</td >'
	+'</tr>'

	}

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
 
	 if (packageInfo.isSellFile == 0) {
		List += '<tr>'

		List += '<td style="width:220px;" class="th_bg"><span>文件发售截止时间</span></td>'
			+ '<td  style="text-align: left;">'
			+ '<div  id="saleFileEndDate"></div>'
			+ '</td>'

		List += '<td style="width:220px;" class="th_bg">原始文件发售截止时间</td>'
			+ '<td style="text-align: left;">'
			+ '<div id="oldSaleFileEndDate"></div>'
			+ '</td>'
			+ '</tr>'
	}
 	List+='<tr>'
 		+'<td style="width:220px;" class="th_bg">响应文件递交截止时间</td>'
 		+'<td style="text-align: left;">'
 			+'<div id="fileDeliveryEndDate"></div>'     			
 		+'</td >'
 		+'<td style="width:220px;" class="th_bg">原始响应文件递交截止时间</td>'
 		+'<td style="text-align: left;">'
 			+'<div id="oldFileDeliveryEndDate"></div>'	
 		+'</td>'
 	+'</tr>'
 	List+='<tr>'
 		+'<td style="width:220px;" class="th_bg">谈判时间</td>'
 		+'<td style="text-align: left;">'
 			+'<div id="negotiationDate"></div>'     			
 		+'</td >'
 		+'<td style="width:220px;" class="th_bg">原始谈判时间</td>'
 		+'<td style="text-align: left;">'
 			+'<div id="oldNegotiationDate"></div>'	
 		+'</td>'
 	+'</tr>'

	$("#nowOrOld").html(List)	     
    $('div[id]').each(function(){
     	if(reg.test(data[this.id])){
			$(this).html(data[this.id].substring(0,16));
		}
				
    });
	$("#remark").html(data.remark)
	// $("#noticeStartDate").html(packageInfo.jtNotice.noticeStartDate.substring(0,16))
	// if(packageInfo.isSign==1){
	// 	$("#signStartDate").html(packageInfo.jtNotice.signStartDate.substring(0,16))
	// }
	
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

//报价表的数据获取
function packageDetailData(){
	$.ajax({
	   	url:Detailedlist, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"id":packageInfo.id
	   	},
	   	success:function(data){	 
	   		packageDetailInfo=data.data;   			
	   	}  
	 });
	 PackageDetailed()
}
function PackageDetailed(){
	var bjtalbe = "<tr><td style='width:50px;text-align:center' >序号</td><td style='text-align:left;'>产品或服务</td><td>报价类型</td><td>报价要求</td><td>备注</td><tr>";
	bjtalbe += "<tr>";
	bjtalbe += "<td style='width:50px;text-align:center'>1</td>";
	bjtalbe += "<td style='text-align:left;'>报价合计</td>";
	bjtalbe += "<td></td>";
	bjtalbe += "<td></td>";
	bjtalbe += "<td></td>";
	bjtalbe += "</tr>";

	if(packageDetailInfo&&packageDetailInfo.length>0){
		for(var j = 0; j < packageDetailInfo.length; j++) {
			bjtalbe += "<tr>";
			bjtalbe += "<td style='width:50px;text-align:center'>" + (j + 2) + "</td>";
			bjtalbe += "<td style='text-align:left;'>" + (packageDetailInfo[j].productServices || "") + "</td>";
			if(packageDetailInfo[j].quotePriceType==1){
				bjtalbe += "<td>" + ("报价-价格" || "") + "</td>";
				bjtalbe += "<td>报价名称："+packageDetailInfo[j].quotePriceName+",报价单位："+packageDetailInfo[j].quotePriceUnit+",小数点位数："+packageDetailInfo[j].pointNum+",小数点最后一位:"+packageDetailInfo[j].pointLast+"</td>";
			}else  if(packageDetailInfo[j].quotePriceType==2){
				bjtalbe += "<td>" + ("报价-费率" || "") + "</td>";
				bjtalbe += "<td>报价名称："+packageDetailInfo[j].quotePriceName+",报价单位："+packageDetailInfo[j].quotePriceUnit+",小数点位数："+packageDetailInfo[j].pointNum+",小数点最后一位:"+packageDetailInfo[j].pointLast+"</td>";
			}else if(packageDetailInfo[j].quotePriceType==3){
				bjtalbe += "<td>" + ("数字" || "") + "</td>";
				bjtalbe += "<td>计量单位："+packageDetailInfo[j].quotePriceUnit+",小数点位数："+packageDetailInfo[j].pointNum+",小数点最后一位:"+packageDetailInfo[j].pointLast+"</td>";
			}else if(packageDetailInfo[j].quotePriceType==4){
				bjtalbe += "<td>" + ("文本" || "") + "</td>";
				bjtalbe += "<td>" + (packageDetailInfo[j].priceDemands || "") + "</td>";

			}			
			bjtalbe += "<td>" + (packageDetailInfo[j].remark || "") + "</td>";

			bjtalbe += "</tr>";
		}
		$("#tablebjb").html(bjtalbe);
	}else {
		$("#tablebjb").html(bjtalbe);
	}
	
};

function filesDataView(viewTableId) {
	$.ajax({
		type: "get",
		url: getImgListUrl,
		async: false,
		data: {
			'packageId': packageInfo.id,
		},
		datatype: 'json',
		success: function(data) {
			let flieData = data.data
			if(data.success == true) {
				if(flieData) {
					for(var e = 0; e < flieData.length; e++) {
						fileId=flieData[e].id
					}
				filesDataDetail = flieData

				}


			}
		}
	});
	if(filesDataDetail&&filesDataDetail.length>0){
		$(".detailed_list").hide();

		
	}else{
		$(".detailed_list").show();

	}
	$('#' + viewTableId).bootstrapTable({
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
				width: '100px',

			},
			{
				field: "#",
				title: "操作",
				halign: "center",
				width: '120px',
				align: "center",
				events:{
					'click .openAccessory':function(e,value, row, index){
						var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
					    window.location.href =$.parserUrlForToken(url) ;
					}
				},
				formatter: function(value, row, index) {
						var dowl='<button type="button"  class="btn btn-sm btn-primary openAccessory">下载</button>'
							return dowl
				
				}
			},
		]
	});
		$('#' + viewTableId).bootstrapTable("load", filesDataDetail);

};

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