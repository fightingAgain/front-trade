var flieListUrl=config.AuctionHost+'/PurFileController/list.do';//查看附件接口
var searchUrlFile = config.AuctionHost + '/PurFileController/list.do'; //采购文件分页
var Detailedlist=config.AuctionHost +'/PackageDetailedController/list.do'//明细查看
var examType=sessionStorage.getItem('examType')//资格审查的缓存
var tenderTypeCode=sessionStorage.getItem('tenderTypeCode')//资格审查的缓存
var edittype = $.query.get("edittype"); //查看还是审核detailed查看  audit审核
var packageInfo=""//包件信息

var packageCheckListInfo=[]//评审项信息

var packageDetailInfo=[]//明细信息

var businessPriceSetData=""//自定义信息

var checkListItem=[]//评价项信息

//var DetailedItemData=""//分项信息
var WORKFLOWTYPE = "xmgg";
var checkPlana=""
var publicData=[];//邀请供应商数据列表
//打开弹出框时加载的数据和内容。
function du(uid){
	$.ajax({
	   	url:config.AuctionHost+'/ProjectReviewController/findProjectPackageInfo',
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
	   	  	businessPriceSetData=packageInfo.businessPriceSetList
	   	  	publicData=packageInfo.projectSupplierList
	   	  }
	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	package();
//	DetailedItemData=JSON.parse(sessionStorage.getItem('DetailedItemData'));//读取分项信息的缓存		
	PackageCheckList(0)
	packageDetailData();
	if(edittype == "detailed") {
		$("#btn_submit").hide(); //提交按钮隐藏
		$("#tableWorkflow").hide(); //审核内容
	}
		
	getProjectPrice(packageInfo.id,packageInfo.projectId);
	getAccessoryList(packageInfo.id)
	//查询审核等级和审核人	
	findWorkflowCheckerAndAccp(uid);
};
/*====ajax请求获取包件信息的数据获取====*/
function package(){
    $('div[id]').each(function(){
		$(this).html(packageInfo[this.id]);
	});
	$('.newTime').attr('colspan','3')
    $('.oldTime').hide();
	$("#isSign").html(packageInfo.isSign==0?'不需要':'需要')
	$("#isSellFile").html(packageInfo.isSellFile==0?'是':'否')
	if(packageInfo.isSign==0){
		$('.isSignDateNone').hide()
	}else{
		$('.isSignDateNone').show()
	}
	if(packageInfo.checkPlan==0){
 		var checkPlans="综合评分法";
 		$("#supplierNum").hide()
 		$("#DeviateNum").hide()
 	}else if(packageInfo.checkPlan==1){
 		var checkPlans="最低价法";
 		$("#supplierNum").hide()
 		$("#DeviateNum").show()
 	}else if(packageInfo.checkPlan==2){
 		var checkPlans="合格制";
 		$("#supplierNum").hide();
 		$("#DeviateNum").hide()
 	}else if(packageInfo.checkPlan==3){
 		var checkPlans="有限数量制";
 		$("#supplierNum").show();
 		$("#DeviateNum").hide();
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
 	if(packageInfo.isPublic==2){
 		$("#isPublic").html("仅邀请本公司认证供应商")
 	}
 	
 	Is_Public(packageInfo.isPublic)
 	$("#checkPlan").html(checkPlans)
	$("#noticeStartDate").val(packageInfo.noticeStartDate);
	$("#noticeEndDate").val(packageInfo.noticeEndDate);
	$("#submitExamFileEndDate").val(packageInfo.submitExamFileEndDate);	
	if(examType==0){//资格审查0为资格预审1为资格后审							
		$(".examCheckEndDate").html("资格预审时间");
		$('.ys').html('预审');
		$('#bidEndDate').html(packageInfo.signEndDate);
	    $('#checkEndDate').html(packageInfo.examCheckEndDate);
	    $('#askEndDate').html(packageInfo.examAskEndDate);
	    $('#answersEndDate').html(packageInfo.examAnswersEndDate);		    
	    $(".tenderTypeW").hide();
	    $(".bidEndnone").hide();
	    $(".tenderType06").hide()
	}else{//资格审查0为资格预审1为资格后审
		$(".tenderTypeW").show();
		if(tenderTypeCode==6){//1询价采购、6单一来源采购
			$('.ys').html('');
			$(".tenderType06").hide();			
			$("#reduceNum").attr('disabled',true);
			$("#addNum").attr('disabled',true);
		}else{//1询价采购、6单一来源采购
			$('.ys').html('后审');
			$(".tenderType06").show();
			scoreTypeBtn(packageInfo.scoreType,packageInfo.checkPlan)
			$("#reduceNum").attr('disabled',false);
			$("#addNum").attr('disabled',false);
		};
		$(".examCheckEndDate").html("询价评审时间");
		$('#bidEndDate').html(packageInfo.bidEndDate);
	    $('#checkEndDate').html(packageInfo.checkEndDate);
	    $("#askEndDate").html(packageInfo.askEndDate);
		$("#answersEndDate").html(packageInfo.answersEndDate)
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
	$('#tbodym').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:'304',
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
var AccessoryList="";
//附件信息
function getAccessoryList(uid) {
	$.ajax({
		type: "get",
		url: searchUrlFile,
		async: true,
		dataType: 'json',
		data: {
			'modelId': uid,
			'modelName':"JJ_PUR_PROJECT_PACKAGE"
		},
		success: function(data) {			
			AccessoryList = data.data;
			//console.log(AccessoryList)
			if(AccessoryList.length == 0) {
				$("#noAccessoryList").show(); //无附件
			} else {
				var html = "";
				for(var i = 0; i < AccessoryList.length; i++) {
					html += "<tr>";
					html += "<td align='center'>" + (i + 1) + "</td>";
					html += "<td style='text-align: left;'>"+AccessoryList[i].fileName+"</td>";
					html +='<td><a href="javascript:void(0)"  class="btn-sm btn-primary" onclick=openAccessory(\"' + i + '\")>下载</a></td>'
					html += "</tr>";
				}				
				$("#AccessoryList").html(html);
			}
		}
	});

};
//点击下载附件信息
function openAccessory(i,$index) {

	
};