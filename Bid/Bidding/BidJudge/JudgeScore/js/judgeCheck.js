/**

 */

var pageProject = "Bidding/BidJudge/JudgeScore/model/projectView.html";  //项目详情页面
var pageEliminate = "Bidding/BidJudge/JudgeScore/model/applyEliminate.html";  //申请淘汰页面
var pageReviewDetail = "Bidding/BidJudge/JudgeScore/model/reviewDetail.html";  //评审详细项
var pageAskEdit = "Bidding/BidJudge/JudgeScore/model/askEdit.html";  //提出质疑页面
var pageAlert = "Bidding/BidJudge/JudgeScore/model/alert.html";  //提出质疑页面


var expertRaterListUrl = config.tenderHost + "/RaterAskListController/expertRaterList.do";  //  评委澄清列表
var saveExpertAskUrl= config.tenderHost + "/RaterAskListController/saveRaterAsk.do";  //评委提交质疑
var resetExpertAskUrl= config.tenderHost + "/RaterAskListController/resetRaterAskAnswers.do";  //撤回质疑
var findSupplierAllUrl= config.tenderHost + "/CheckLastResultController/findSupplierFirstList.do";  //撤回质疑
var checkRaterAskUrl= config.tenderHost + "/RaterAskListController/checkRaterAsk.do";  //撤回质疑

var findSupplierListUrl= config.tenderHost + "/CheckLastResultController/findSupplierLastList.do";  //首轮投标人列表
var findBidCheckUrl= config.tenderHost + "/BidCheckController/findBidCheck.do";  //评审项列表
var findBidCheckItemUrl = config.tenderHost + "/BidCheckItemController/findBidCheckItem.do";  //  评审项详细内容
var saveBidCheckItemUrl = config.tenderHost + "/BidCheckItemController/saveBidCheckItem.do";  //  保存单项评审项
var saveSubmitUrl = config.tenderHost + "/BidCheckItemController/saveSubmit.do";  //  提交评审
var saveAllSubmitUrl = config.tenderHost + "/BidCheckItemController/saveBidCheckItemAll.do";  //  全部合格或不合格
var saveAllScoreUrl = config.tenderHost + "/BidCheckItemController/saveBidCheckItemScore.do";  //  保存打分
var saveCreditUrl = config.tenderHost + "/BidCheckItemController/saveCredit.do";  //  保存信用分

var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件


var tabTarget = "";   //当前显示的tabContent的id
var supplierId = "";  //当前供应商id
var checkId = 0;  //评审id
var checkType = 0;  //评审类型
var packageId = "";  //标段id
var projectId = "";  //项目id
var examType = "";   //资格审查方式
var checkItemId = "";  //详细评审项id
var checkState = 0;  //评委评审状态

var clarifyTimer = "";

var reviewData = [];  //一级评审项
var reviewSecondData = [];  //二级评审项
var reviewItemData = [];  //详细评审项
var supplierData = [];  //供应商数据
var isLeader = false;  //当前登录人是否组长

var reviewIndex = 0,  //一级评审项当前项
	reviewSecondIndex = 0,  //二级评审项当前项
	reviewItemIndex = 0,  //详细评审项当前项
	supplierIndex = 0;  //供应商当前项

var isCredit = false;
$(function(){
	
//	initData();

/************************************************Start 评审项*********************************/
	//评审项tab
	$('#reviewTabs').on("click", "a", function (e) { 
	  	e.preventDefault();
	  	var cId="", cType="";
	  	var index = $(this).attr("data-index");
	  	if(index){
	  		if(reviewData[index].bidChecks.length == 0){
	  			
		  		cId = reviewData[index].id;
			  	cType = reviewData[index].checkType;
		  		checkState = reviewData[index].checkState;
				
			} else {
				cId = reviewData[index].bidChecks[0].id;
				cType = reviewData[index].bidChecks[0].cType;
				checkState = reviewData[index].bidChecks[0].checkState;
				
			}
			if(findSupplierList(cId, cType)){
				$(".reviewMain").show();
  				$("#myTabContent").hide();
				$("#reviewDetailTabs li").remove();
		  		$(this).parent().addClass("active").siblings("li").removeClass("active");
		  		if(reviewData[index].bidChecks.length > 0){
		  			reviewSecondHtml(reviewData[index].bidChecks);
		  		} else {
		  			initReviewType();
		  		}
		  		
		  	}
		  	
	  	} else {
	  		$("#reviewDetailTabs li").remove();
	  		$(this).parent().addClass("active").siblings("li").removeClass("active");
	  		$(".tab-pane").hide();
	  		$($(this).attr("href")).show();
	  		
	  		$("#myTabContent").show();
	  		$(".reviewMain").hide();
	  		if($(this).attr("href") == "#clarify"){
	  			findSupplierAll();
	  		} else if($(this).attr("href") == "#record"){
	  			findBidCheckScores();
	  		}
	  	}

	});
	
	//评审项二级选择
	$('#reviewDetailTabs').on("click", "a", function (e) {
	  	e.preventDefault();
	  	var index = $(this).attr("data-index");
	  	var cId = reviewSecondData[index].id;
	  	var cType = reviewSecondData[index].checkType;
	  	checkState = reviewSecondData[index].checkState;
		if(findSupplierList(cId, cType)){ 
			
	  		initReviewType();
	  	}
//	  	if(checkId != 0){
//	  		openReviewDetail();
//	  	}
	});
	//投标人选择
	$('.supplierTabs').on("click", "a", function (e) {
	  	e.preventDefault();
	  	$(this).tab('show');
	  	supplierId = $(this).attr("data-id");
	  	findBidCheckItem(checkId);
//	  	if(checkId != 0){
//	  		openReviewDetail();
//	  	}
	});
	//评审澄清投标人选择
	$('#supplierAll').on("click", "a", function (e) {
	  	e.preventDefault();
	  	$(this).tab('show');
	  	supplierId = $(this).attr("data-id");
	  	expertClarifyList();
//	  	if(checkId != 0){
//	  		openReviewDetail();
//	  	}
	});
	
	//左边评审项点击事件
	$('#reviewList').on('click','.ltItem',function(){
		 
		if($(this).parent().hasClass("open")){
			$(this).parent().removeClass("open");
			$(this).find("span").removeClass("glyphicon-triangle-bottom");
		} else {
			
			if($(this).next("ul").length > 0){
				$(this).parent().addClass("open");
				$(this).find("span").addClass("glyphicon-triangle-bottom");
			} else { 
				$('#reviewList .ltItem').removeClass('review_active');
				reviewItemIndex = $(this).attr("data-index");
				$(this).addClass('review_active');
				showInfo(reviewItemIndex);
			}
		}
		
		
	});
	//分值
	$('#area_score').on('blur','input[type=number]',function(){
		var score = $(this).val();
		$(this).val(toDecimal(score,2));
	});
	
	//是否显示原因框
	$("#theKey, #isDiverge, #isRespond").change(function(){
		if($(this).val() == 0){
			$(".isShowReason").show();
		} else {
			$(".isShowReason").hide();
		}
	})
	
	// 打分按钮
	$(".btnSave").click(function(){
		var theKey = "", reason="", mark="";
		switch(Number(checkType)){
			case 0:
				if($("#theKey").val() == "0" && $("#reason").val().replace(/,/g,'') == ""){
					showDialog("请输入不合格原因");
					
					return;
				}
				theKey = $("#theKey").val();
				reason = $("#reason").val();
				break;
			case 1:
				if($("#isDiverge").val() == "0" && $("#divergeReason").val().replace(/,/g,'') == ""){
					showDialog("请输入偏离原因");
					
					return;
				}
				theKey = $("#isDiverge").val();
				reason = $("#divergeReason").val();
				break;
			case 2:
				if($("#isRespond").val() == "0" && $("#respondReason").val().replace(/,/g,'') == ""){
					showDialog("请输入未响应原因");
					
					return;
				}
				theKey = $("#isRespond").val();
				reason = $("#respondReason").val();
				break;
			case 3:
				if($("#mark").val().replace(/,/g,'') == ""){
					showDialog("请输入得分");
					return;
				}
				
				mark = $("#mark").val();
				break;
		}
		
		saveBidCheckItem(theKey, reason, mark);
		
	});
	
	//提交评审
	$(".btnSubmit").click(function(){
		if(isCredit){
			saveAllCredit();
		} else {
			saveSubmit();
		}
//		openPreview();
	});
	
	//全部合格
	$(".btnQualified").on("click", function(){
//		parent.layer.confirm('确定全部合格?', {
//			icon: 3,
//			title: '询问'
//		}, function(index) {
//			parent.layer.close(index);
			saveAllSubmit(1, "");
//		});
	});
	//全部不合格
	$(".btnNoQualified").on("click", function(){
		parent.layer.prompt({title: '请输入原因', formType: 2}, function(text, index){
		    parent.layer.close(index);
		    saveAllSubmit(0, text);
		});
	});
	//报价打分保存
	$(".btnSaveScore").on("click", function(){
		if(isCredit){
			saveAllCredit();
		} else {
			saveAllScore();
		}
	});
//	//信用分
//	$(".btnNoQualified").on("click", function(){
//		parent.layer.prompt({title: '请输入原因', formType: 2}, function(text, index){
//		    parent.layer.close(index);
//		    saveAllScore(0, text);
//		});
//	});
	
	
/************************************************End 评审项*********************************/
	
	//查看项目详情
	$("#btnProject").click(function(){
		openProjectView();
	});
	
	//刷新当前页面
	$("#btnRefresh").click(function(){
		window.location.reload();
//		parent.window[layero.find('iframe')[0]['name']].location.reload();
	});
	
	//关闭当前页面
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	//淘汰申请
//	tabTarget.on("click", ".btnEliminate", function(){
//		openEliminate(1);
//	});
//	
	
	
	/************************************************Start 预审澄清*********************************/
	//提出质疑发送
	$("#btnSend").click(function(){
		var width = top.$(window).width() * 0.9;
		var height = top.$(window).height() * 0.9;
		
		parent.layer.open({
			type: 2,
			title: "提出质疑",
			area: [width + 'px', height + 'px'],
			resize: false,
			content: pageAskEdit + "?packageid=" + packageId + "&supplierid=" + supplierId + "&examtype=" + examType,
			success:function(layero, index){
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage(expertClarifyList);  //调用子窗口方法，传参
			}
		});
	});
	//撤回质疑
	$("#clarifyList").on("click", ".btnRecall", function(){
		var id = $(this).attr("data-id");
		retractExpertAsk(id);
	});
	//确认发送质疑
	$("#clarifyList").on("click", ".btnConfirm", function(){
		var id = $(this).attr("data-id");
		checkRaterAsk(id);
	});
	//刷新
	$("#btnRefurbish").click(function(){
		expertClarifyList();
	});
	//自动刷新
	$("#btnAutoRefresh").click(function(){
		var state = $(this).attr("data-state");
		if(state == 0){
			$(this).attr("data-state", "1");
			$(this).text("自动刷新");
			clearInterval(clarifyTimer);
		} else {
			$(this).attr("data-state", "0");
			$(this).text("取消刷新");
			clarifyTimer=setInterval(function(){
		    expertClarifyList();
		  },3000);
		}
	});
	/************************************************End 预审澄清*********************************/
});

/**
 * 从父页面调用的方法
 * @param {Object} data  父页面传过来的参数
 */
function passMessage(data){
	if(data){
		$("#projectName").html(data.tenderProjectName);
		$("#projectCode").html(data.tenderProjectCode);
		$("#bidSectionName").html(data.bidSectionName);
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
		packageId = data.bidSectionId;
		if(data.examType != undefined){
			examType = data.examType;
		}
		if(data.groupExpertId == entryInfo().id){
			isLeader = true;
		}
	}
	initData();
	
}

/**
 * 数据初始化
 */
function initData(){
	
//	$(".reviewDiv").width($("#formName").width()-36);

	//获取一级评审项方法
	findBidCheck();
	
}
/**
 * 打开项目详情页面
 */
function openProjectView(){
	var width = top.$(window).width() * 0.9;
	var height = top.$(window).height() * 0.9;
	
	parent.layer.open({
		type: 2,
		title: "项目详情",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageProject,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}

/**
 * 打开淘汰申请页面
 * @param {Object} state   1：申请淘汰    2，审核淘汰    3：查看淘汰结果
 */
function openEliminate(state){
	var width = top.$(window).width() * 0.8;
	var height = 600;
	
	parent.layer.open({
		type: 2,
		title: "淘汰申请",
		area: [width + 'px', height + 'px'],
		resize: false,
		content: pageEliminate+"?source=" + state,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
}

/******************************************************************Start 获取投标人列表*************************************************************/


//获取评审项
function findBidCheck(){
	$.ajax({
		url: findBidCheckUrl,
     	type: "post",
     	data:{
     		bidSectionId:packageId,
     		examType:examType
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	var arr = data.data;
         	reviewData = arr;
         	bidCheckHtml(arr);
         	
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
/**
 * 评审项列表
 * @param {Object} data  评审项数据
 */
function bidCheckHtml(data){
	$("#reviewTabs li").remove();
	var reviewHtml = "", node="";
	var cId = "", cType = "";
	for(var i = 0; i < data.length; i++){
		node = data[i];
		if(i == 0){
			reviewHtml += '<li class="active"><a href="#" data-id="'+node.id+'" data-type="'+node.checkType+'" data-index="'+i+'">'+node.checkName+'</a></li>';
			if(node.bidChecks && node.bidChecks.length > 0){
				reviewSecondHtml(node.bidChecks);
			} else {
				cId = node.id;
				cType = node.checkType;
				checkState = node.checkState;
				$("#reviewItem").html(node.checkName);
			
				if(findSupplierList(cId, cType)){
					initReviewType();
				}
				
			}
			
		} else {
			reviewHtml += '<li><a href="#" data-id="'+node.id+'" data-index="'+i+'">'+node.checkName+'</a></li>';
		}
		
	}
//	reviewHtml += '<li><a href="#record">评审记录汇总</a></li>';
	reviewHtml += '<li><a href="#clarify">评审澄清</a></li>';
	$(reviewHtml).appendTo("#reviewTabs");
	$("#reviewTabs a[data-id='"+checkId+"']").tab("show");
}

/**
 * 评审二级列表
 * @param {Object} data  数据
 */
function reviewSecondHtml(data){
	$("#reviewDetailTabs li").remove();
	var companyHtml = "";
	var cId = "", cType = "";
	reviewSecondData = [];
	if(!data){
		return;
	}
	reviewSecondData = data;
	for(var i = 0; i < data.length; i++){
		if(i == 0){
			cId = data[i].id;
			cType = data[i].checkType;
			checkState = data[i].checkState;
			companyHtml += '<li class="active"><a href="#" data-index="'+i+'" data-id="'+data[i].id+'" data-type="'+data[i].checkType+'">'+data[i].checkName+'</a></li>';
			if(findSupplierList(cId, cType)){
				initReviewType();
			}
		} else {
			companyHtml += '<li><a href="#" data-index="'+i+'" data-id="'+data[i].id+'" data-type="'+data[i].checkType+'">'+data[i].checkName+'</a></li>';
		}
	}
	
	$(companyHtml).appendTo("#reviewDetailTabs");
	$(".reviewMain").height($(window).height() - $(".mainTable").height()-175);   //评审项详细内容高度
}

//获取投标人列表
function findSupplierList(cId, cType){
	var isSuccess = false;
	$.ajax({
		url: findSupplierListUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		examType:examType,
     		checkId:cId
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		isSuccess = false;   
        		return;
        	}
         	
         	checkId = cId;
			checkType = cType;
         	var arr = data.data;
         	if(arr.length > 0){
         		isSuccess = true;
         	} else {
         		showDialog("暂无评审内容");
         	}
         	supplierData = arr;
         	supplierHtml(arr, cId);
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
 	return isSuccess;
}

/**
 * 供应商列表
 * @param {Object} data  供应商数据
 */
function supplierHtml(data, cId){
	$(".supplierTabs li").remove();
	var companyHtml = "";
	for(var i = 0; i < data.length; i++){
		if(i == 0){
			supplierId = data[i].supplierId;
			companyHtml += '<li class="active"><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
		} else {
			companyHtml += '<li><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
		}
	}
	$(companyHtml).appendTo(".supplierTabs");
	$(".supplierDiv").width($("#formName").width()-36);
	
	if(data.length > 0){
		findBidCheckItem(cId);
	}
}

/**
 * 获取评审内容详细信息
 */
function findBidCheckItem(cId){
	$.ajax({
		url: findBidCheckItemUrl,
     	type: "post",
     	data:{
     		bidSectionId:packageId,
			examType:examType,
			supplierId:supplierId,
			checkId:cId
     	},
     	success: function (data) {
     		
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	
         	var arr = data.data.checkItems;
////       	if(!arr || arr.length ==0 ){
////       		parent.layer.alert("暂无评审内容");
////       		return;
////       	}
         	if(arr && arr.length > 0 && arr[0].keepState == 1){
      			$(".btnSubmit").hide();
	       	} else {
	       		$(".btnSubmit").show();
	       	}
         	
         	$("#reviewDetailTabs").find("a[data-id='"+checkId+"']").parent().addClass("active").siblings("li").removeClass("active");
         	if(data.data.checkStandard && arr.length > 0){
         		isCredit = false;
         		$(".btnQualified").hide();
         		$(".btnNoQualified").hide();
         		
         		
         		$("#quote").show();
         		$("#credit").hide();
         		$(".reviewNormal").hide();
         		
         		$(".quoteText").html(data.data.checkStandard);
         		$("#quoteTable tr:gt(0)").remove();
         		var html = "";
         		reviewItemData = [];
         		for(var i = 0; i < arr.length; i++){
         			reviewItemData.push({score:arr[i].mark, checkItemId:arr[i].id});
         			html += '<tr>'
			    			+'<td style="text-align:center">'+(i+1)+'</td>'
			    			+'<td>'+arr[i].checkName+'</td>'
			    			+'<td><input style="width:100px" class="form-control" name="score" value="'+(arr[i].mark ? arr[i].mark : "")+'" /></td>'
			    		+'</tr>';
         		}
         		html += '<tr><td colspan="2" style="text-align:center;">总分</td><td><input style="width:100px;display:inline-block;" class="form-control" name="score" value="'+(data.data.score ? data.data.score : "")+'" /></td></tr>'
         		$(html).appendTo("#quoteTable");
         		
         		if(arr[0].keepState == 1){
         			$("#quoteTable").find("input").attr("disabled","disabled");
         			$(".btnSaveScore").hide();
         		} else {
         			$(".btnSaveScore").show();
         		}
         	} else if(data.data.supplierCheckInfos){
         		isCredit = true;
         		var supplierArr = data.data.supplierCheckInfos
         		$(".btnQualified").hide();
         		$(".btnNoQualified").hide();
//	       		if(data.data.supplierCheckInfos[0].keepState == 1){
	       			$(".btnSaveScore").hide();
//	       		} else {
//	       			$(".btnSaveScore").show();
//	       		}
         		$(".quoteText").html(data.data.checkStandard);
         		$("#quote").hide();
         		$("#credit").show();
         		$(".reviewNormal").hide();
         		$("#creditTable tr:gt(0)").remove();
         		var html = "";
         		reviewItemData = [];
         		for(var i = 0; i < supplierArr.length; i++){
         			reviewItemData.push({score:supplierArr[i].score, supplierId:supplierArr[i].supplierId});
         			html += '<tr>'
			    			+'<td style="text-align:center">'+(i+1)+'</td>'
			    			+'<td>'+supplierArr[i].supplierName+'</td>'
			    			+'<td style="text-align:center;">'+(supplierArr[i].score ? supplierArr[i].score : "")+'分</td>'
			    		+'</tr>';
         		}
         		$(html).appendTo("#creditTable");
         	} else { 
         		isCredit = false;
           		if(!arr || arr.length ==0 ){
	         		parent.layer.alert("暂无评审内容");
	         		return;
	         	}
         		if(Number(checkType) == 3 || arr[0].keepState == 1){
         			$(".btnQualified").hide();
         			$(".btnNoQualified").hide();
         			$(".btnSaveScore").hide();
         		} else {
         			$(".btnQualified").show();
         			$(".btnNoQualified").show();
         			$(".btnSaveScore").hide();
         		}
         		$("#quote").hide();
         		$("#credit").hide();
         		$(".reviewNormal").show();
//	         	$("#reviewDetailTabs").find("a[data-id='"+checkId+"']").parent().addClass("active").siblings("li").removeClass("active");
	         	$("#reviewList li").remove();
	         	reviewItemData = [];
				var html =	formatReview(arr, 0);
				$(html).appendTo("#reviewList");
				for(var i = 0; i < reviewItemData.length; i++){
					if(checkItemId != "" && reviewItemData[i].id == checkItemId){
						var curItem = $(".ltItem[data-index="+i+"]"); 
						reviewItemIndex = i;
						curItem.addClass("review_active");
						showInfo(i);
						break;
					}
				}
				if(i == reviewItemData.length){
					for(var j = 0; j < reviewItemData.length; j++){
						if(reviewItemData[j].bidCheckItemDtosNum == 0){
							var curItem = $(".ltItem[data-index="+j+"]"); 
							reviewItemIndex = j;
							curItem.addClass("review_active");
							curItem.parent().parents("li").addClass("open").find("span").addClass("glyphicon-triangle-bottom");
							showInfo(j);
							break;
						}
					}
				}
			}     	
			
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
/**
 * 显示左边评审项
 * @param {Object} data  数据 
 * @param {Object} padd  边距
 */
function formatReview(data, padd){
	var html = "", spanStr = "";
	
	if(data.length == 0){
		return;
	}
	for(var i = 0; i < data.length; i++){
		var arr = $.extend( {}, data[i], {});
		if(arr.bidCheckItemDtos && arr.bidCheckItemDtos.length > 0){
			if(arr.bidCheckItemDtos[0].checkName && arr.bidCheckItemDtos[0].checkName != ""){
				arr.bidCheckItemDtosNum = arr.bidCheckItemDtos.length;
				
			} else {
				arr.bidCheckItemDtosNum = 0;
				arr.checkStandard = "";
				for(var j = 0; j < arr.bidCheckItemDtos.length; j++){
					if(Number(checkType) == 3){
						arr.checkStandard += arr.bidCheckItemDtos[j].checkStandard + "( "+(arr.bidCheckItemDtos[j].rangeMin ? arr.bidCheckItemDtos[j].rangeMin + " - " + arr.bidCheckItemDtos[j].rangeMax : arr.bidCheckItemDtos[j].rangeMax)+" 分)" + "<br/>";
					} else {
						arr.checkStandard += arr.bidCheckItemDtos[j].checkStandard + "<br/>";
					}
				}
			}
			arr.bidCheckItemDtos = [];
		} else {
			arr.bidCheckItemDtosNum = 0;
		}
		reviewItemData.push(arr);
		
		var node = data[i].bidCheckItemDtos;
		if(node && node.length > 0 && node[0].checkName && node[0].checkName != ""){
			
			spanStr = '<span class="treegrid-expander glyphicon glyphicon-triangle-right"></span>';
		} else {
			spanStr = "&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		var isGray = "";
		if(checkType == 0 || checkType == 1 || checkType == 2){
			if(arr.theKey != undefined){
				isGray = "gray";
			}
		} else if(checkType == 3) {
			if(arr.mark != undefined){
				isGray = "gray";
			}
		}
		html += '<li style="padding-left:'+padd+'px;"><a data-id="'+data[i].id+'" data-index="'+(reviewItemData.length -1)+'" class="ltItem '+isGray+'">' + spanStr + data[i].checkName + '</a>';
		if(node && node.length > 0 && node[0].checkName && node[0].checkName != ""){
			
			html += '<ul>';
			html += formatReview(node, padd+15);
			html += '</ul>';
		}
		html += '</li>';
		
	}
	return html;
}

//显示右边信息
function showInfo(index){
	checkItemId = reviewItemData[index].id;

//	if(checkState == 1){
	if(reviewItemData[index].keepState == 1){
		$("#theKey").attr("disabled","disabled");
		$("#reason").attr("disabled","disabled");
		$("#isDiverge").attr("disabled","disabled");
		$("#divergeReason").attr("disabled","disabled");
		$("#isRespond").attr("disabled","disabled");
		$("#respondReason").attr("disabled","disabled");
		
		$("#mark").attr("disabled","disabled");
		$(".btnSave").attr("disabled","disabled");
	} else {
		$("#theKey").removeAttr("disabled");
		$("#reason").removeAttr("disabled");
		$("#isDiverge").removeAttr("disabled");
		$("#divergeReason").removeAttr("disabled");
		$("#isRespond").removeAttr("disabled");
		$("#respondReason").removeAttr("disabled");

		$("#mark").removeAttr("disabled");
		$(".btnSave").removeAttr("disabled");
	}

	$("#reviewItem").html(reviewItemData[index].checkName);
	$("#isKey").html(reviewItemData[index].isKey == 1 ? "是" : "否");

	if(reviewItemData[index].theKey != undefined && reviewItemData[index].theKey == 0){
		$(".isShowReason").show();
	} else {
		$(".isShowReason").hide();
	}
	
	$("#theKey").val(reviewItemData[index].theKey != undefined ? reviewItemData[index].theKey : 1);  
	$("#reason").val(reviewItemData[index].reason ? reviewItemData[index].reason : "");
	
	$("#isDiverge").val(reviewItemData[index].theKey != undefined ? reviewItemData[index].theKey : 1);  
	$("#divergeReason").val(reviewItemData[index].reason ? reviewItemData[index].reason : "");
	
	$("#isRespond").val(reviewItemData[index].theKey != undefined ? reviewItemData[index].theKey : 1);  
	$("#respondReason").val(reviewItemData[index].reason ? reviewItemData[index].reason : "");
	
	$("#score").html(reviewItemData[index].score != undefined ? reviewItemData[index].score : "");
	$("#mark").val(reviewItemData[index].mark != undefined ? toDecimal(reviewItemData[index].mark,2) : "");
	
	$(".reviewStandard").html("");
	$(".pdfView").attr("src","");
	if(reviewItemData[index].checkStandard){
		$(".reviewStandard").html(reviewItemData[index].checkStandard);
	}
	if(reviewItemData[index].fileChapterUrl){
		$(".pdfView").attr("src", $.parserUrlForToken(top.config.Syshost + "/FileController/fileView?ftpPath=" + reviewItemData[index].fileChapterUrl) +"#page=" + reviewItemData[index].fileChapterPage);
	}
}
/**
 * 评审类型
 */
function initReviewType(name){
	$(".isShow").hide();
//	$("#reviewItem").html(name);
	switch(Number(checkType)){
		case 0:
			$(".qualifiedModel").show();
			$(".reviewType").html("合格制");
			$(".btnQualified").html("全部合格");
			$(".btnNoQualified").html("全部不合格");
			$(".btnQualified").show();
			$(".btnNoQualified").show();
			break;
		case 1:
			$(".divergeModel").show();
			$(".reviewType").html("偏离制");
			$(".btnQualified").html("全部不偏离");
			$(".btnNoQualified").html("全部偏离");
			$(".btnQualified").show();
			$(".btnNoQualified").show();
			break;
		case 2:
			$(".respondModel").show();
			$(".reviewType").html("响应制");
			$(".btnQualified").html("全部响应");
			$(".btnNoQualified").html("全部不响应");
			$(".btnQualified").show();
			$(".btnNoQualified").show();
			break;
		case 3:
			$(".scoreModel").show();
			$(".reviewType").html("打分制");
			$(".btnQualified").hide();
			$(".btnNoQualified").hide();
			break;
	}
}

//保存单项评审内容
function saveBidCheckItem(theKey, reason, score){
	var idx = "";
	for(var i = 0; i < reviewItemData.length; i++){
 		if(reviewItemData[i].id == checkItemId){
 			idx = i;
 			break;
 		}
 	}
	if(score !="" && Number(score) > Number(reviewItemData[idx].score)){
		showDialog("得分不能大于分值");
		return;
	}
	$.ajax({
		url: saveBidCheckItemUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		examType:examType,
     		checkId:checkId,
     		supplierId:supplierId,
     		checkItemId:checkItemId,
     		isKey:theKey,
     		reason:reason,
     		score:score,
     		checkCount:reviewItemData[reviewItemIndex].checkCount
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
//       	var arr = data.data;
         	showDialog(data.data);
         	$("#reviewList").find("a[data-id='"+checkItemId+"']").removeClass("review_active").addClass("gray review_active");
 			reviewItemData[idx].theKey = theKey;
 			reviewItemData[idx].reason = reason;
 			reviewItemData[idx].mark = score;
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 });
}
//提交评审内容
function saveSubmit(){
	$.ajax({
		url: saveSubmitUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		examType:examType,
     		checkId:checkId
     	},
     	success: function (data) {
         	if(data.success == false){
				if(data.data){
						
					var str = "以下供应商没评完:<br/>";
					for(var i = 0; i < data.data.length; i++){
						for(var j = 0; j < supplierData.length; j++){
							if(data.data[i] == supplierData[j].supplierId){
								str += supplierData[j].supplierName + "<br/>";
								break;
							}
						}
					}
					
					showDialog(str);
//					showDialog(str);
					
				} else {
					showDialog(data.message);
				}
        		return;
        	}
         	showDialog(data.data);
//       	alert(data.data);
			findBidCheckItem(checkId);
         	
			
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
//全部合格或不合格
function saveAllSubmit(isKey, reason){
	$.ajax({
		url: saveAllSubmitUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		supplierId: supplierId,
     		examType:examType,
     		checkId:checkId,
     		isKey: isKey,
     		reason: reason
     	},
     	success: function (data) {
         	if(data.success == false){				
				showDialog(data.message);
        		return;
        	}
         	showDialog(data.data);
			findBidCheckItem(checkId);         	
			
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
//全部打分
function saveAllScore(){

	var ipts = $("#quoteTable").find("input");
	for(var i = 0; i < ipts.length - 1; i++){
		reviewItemData[i].score = ipts[i].value;
	}
	$.ajax({
		url: saveAllScoreUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		supplierId: supplierId,
     		examType:examType,
     		checkId:checkId,
     		score:ipts[ipts.length - 1].value,
     		bidCheckItemRequests:reviewItemData
     	},
     	success: function (data) {
         	if(data.success == false){				
				showDialog(data.message);
        		return;
        	}
         	showDialog(data.data);
			findBidCheckItem(checkId);         	
			
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
   	});
}
//信用分
function saveAllCredit(){
	$.ajax({
		url: saveCreditUrl,
     	type: "post",
     	async: false,
     	data:{
     		bidSectionId:packageId,
     		supplierId: supplierId,
     		examType:examType,
     		checkId:checkId,
     		bidCheckItemRequests:reviewItemData
     	},
     	success: function (data) {
         	if(data.success == false){				
				showDialog(data.message);
        		return;
        	}
         	showDialog(data.data);
			findBidCheckItem(checkId);         	
			saveSubmit();
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
/******************************************************************Start 获取投标人列表*************************************************************/

/******************************************************************Start 预审澄清*************************************************************/
/**
 * 查询所有供应商
 */
function findSupplierAll(){
	$.ajax({
		url: findSupplierAllUrl,
     	type: "post",
     	data:{
     		packageId: packageId
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	var arr = data.data;
         	supplierAllHtml(arr, "");
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
function supplierAllHtml(data){
	$("#supplierAll li").remove();
	var companyHtml = "";
	for(var i = 0; i < data.length; i++){
		if(i == 0){
			supplierId = data[i].supplierId;
			companyHtml += '<li class="active"><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
		} else {
			companyHtml += '<li><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
		}
	}
	$(companyHtml).appendTo("#supplierAll");
	$(".supplierDiv").width($("#formName").width()-36);
	expertClarifyList();
	
}
/**
 * 查询澄清列表
 */
function expertClarifyList(){ 
	var para = {
     		bidSectionName:"",
     		interiorBidSectionCode:"",
     		supplierId:supplierId,
     		packageId: packageId,
     		examType: examType,
     	}
	if(isLeader){
		para.isChairMan = 1
	} else {
		para.isChairMan = 0;
	}
	$.ajax({
		url: expertRaterListUrl,
     	type: "post",
     	data:para,
     	beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);	   
	    },
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	var arr = data.data;
         	var html = '';
         	$("#clarifyList table").remove();
     		for(var i=0; i < arr.length; i++){
     			html += '<table class="table table-bordered" style="width: 80%;">'
     					+'<tr><td class="th_bg">提问内容</td><td>'+arr[i].askContent+'</td>'
     					+'<td rowspan="5" style="width:130px;text-align:center">';
     			if(arr[i].askState == 0){
     				html += '<button type="button" class="btn btn-primary btn-sm btnRecall" data-id="'+arr[i].id+'">撤回</button>';
     			}
     			if(isLeader && arr[i].askState == 0){
     				html += '<button type="button" class="btn btn-primary btn-sm btnConfirm" data-id="'+arr[i].id+'">发送</button>';
     			}
     			if(arr[i].askState == 2){
     				html += "已撤回";
     			}
     			if(arr[i].askState == 1){
     				html += "已发送";
     			}
     			html += '</td></tr>'
     					+'<tr><td class="th_bg">提问时间</td><td>'+arr[i].askDate+'</td></tr>'
     					+'<tr><td class="th_bg">提问附件</td><td>';
     			if(arr[i].raterAskFiles && arr[i].raterAskFiles.length > 0){
     				var fileData = arr[i].raterAskFiles;
     				html += '<table class="table table-bordered"><tr><td>序号</td><td>文件名</td><td>操作</td></tr>';
     				for(var j = 0; j < fileData.length; j ++){
     					html += '<tr><td>'+(j+1)+'</td><td>'+fileData[j].attachmentFileName+'</td><td>';
     					var filesnames = fileData[j].attachmentFileName.substring(fileData[j].attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
     					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
							html += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + fileData[j].url + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
						}
						html += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + fileData[j].attachmentFileName + "','" + fileData[j].url + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
     					html += '</td></tr>'
     				}
     				
     				html += '</table>'
     			}
     			html += '<tr><td class="th_bg">答复内容</td><td>'+(arr[i].answerContent ? arr[i].answerContent : "")+'</td></tr>'
     					+'<tr><td class="th_bg">答复附件</td><td>';
     			if(arr[i].raterAnswersFiles && arr[i].raterAnswersFiles.length > 0){
     				var fileData = arr[i].raterAnswersFiles;
     				html += '<table class="table table-bordered"><tr><td>序号</td><td>文件名</td><td>操作</td></tr>';
     				for(var j = 0; j < fileData.length; j ++){
     					html += '<tr><td>'+(j+1)+'</td><td>'+fileData[j].attachmentFileName+'</td><td>';
     					var filesnames = fileData[j].attachmentFileName.substring(fileData[j].attachmentFileName.lastIndexOf(".") + 1).toUpperCase();
     					if(filesnames == 'PNG'||filesnames == 'JPG'||filesnames == 'JPGE'||filesnames == 'PDF'){
							html += "<a  href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=showImage('" + fileData[j].url + "')><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>&nbsp预览</a>&nbsp;&nbsp;"
						}
						html += "<a href='javascript:void(0)' class='btn-sm btn-primary' style='text-decoration:none' onclick=downloadFile('" + fileData[j].attachmentFileName + "','" + fileData[j].url + "')><span class='glyphicon glyphicon-download' aria-hidden='true'></span>下载</a>"
     					html += '</td></tr>'
     				}
     				
     				html += '</table>'
     			}
     					
     			html += '</td></tr>';
     			html += '</table>'
     			
     		}
     		$(html).appendTo("#clarifyList");
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
function downloadFile(fileName,filePath) {
	fileName = fileName.substring(0, fileName.lastIndexOf("."));
	var newUrl =dowoloadFileUrl + '?ftpPath=' + filePath + '&fname=' + fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//展示图片
function showImage(obj) {
//	parent.openPreview(obj, "850px", "700px");
previewPdf(obj)
}

/**
 * 提交质疑问题
 */
function expertAsk(){
	var askContent = $("#askContent").val();
	if(askContent.replace(/,/g,'') == ""){
		showDialog("请输入质疑问题");
		return;
	}
	$.ajax({
		url: saveExpertAskUrl,
     	type: "post",
     	data:{
     		projectId: projectId,
     		packageId: packageId,
     		askContent: askContent,
     		supplierId:supplierId
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	
     		
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
/**
 * 撤回质疑问题
 * @param {Object} id  当前质疑问题的id
 */
function retractExpertAsk(id){
	$.ajax({
		url: resetExpertAskUrl,
     	type: "post",
     	data:{
     		id: id
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	showDialog("撤回成功");
         	expertClarifyList();
     		
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}
/**
 * 确认发送质疑问题
 * @param {Object} id  当前质疑问题的id
 */
function checkRaterAsk(id){
	$.ajax({
		url: checkRaterAskUrl,
     	type: "post",
     	data:{
     		id: id
     	},
     	success: function (data) {
         	if(data.success == false){
        		showDialog(data.message);
        		return;
        	}
         	showDialog("发送成功");
         	expertClarifyList();
     		
     	},
     	error: function (data) {
         	showDialog("加载失败");
     	}
 	});
}


/******************************************************************End 预审澄清*************************************************************/

/******************************************************************Start 评审内容列表*************************************************************/
//打开评审详细内容
function openReviewDetail(){
	
	parent.layer.open({
		type: 2,
		title: "评审项",
		area: ["100%", "100%"],
		resize: false,
		content: pageReviewDetail+"?source=" + 1,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var data = {
				packageId:packageId,
				examType:examType,
				supplierId:supplierId,
				checkId:checkId,
				checkType:checkType
			}
			iframeWin.passMessage(data);  //调用子窗口方法，传参
		}
	});
}

/*
 * 保留两位小数   
 *功能：将浮点数四舍五入，取小数点后2位  
 * e：元素
 * num：要保留的小数位数
 */
function validationNumber(e, num) {
      var regu = /^[0-9]+\.?[0-9]*$/;
      if (e.value != "") {
        if (!regu.test(e.value)) {
          alert("请输入正确的数字");
          e.value = e.value.substring(0, e.value.length - 1);
          e.focus();
        } else {
          if (num == 0) {
            if (e.value.indexOf('.') > -1) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
          if (e.value.indexOf('.') > -1) {
            if (e.value.split('.')[1].length > num) {
              e.value = e.value.substring(0, e.value.length - 1);
              e.focus();
            }
          }
        }
      }
    }


/*制保留几位小数，如：2，会在2后面补上00.即2.00  
 * num:输入的值
 * unit：要补足的小数位数
 */
function toDecimal(num,unit) {  
    var f = parseFloat(num);  
    if (isNaN(f)) {  
        return false;  
    }  
    var f = Math.round(num*100)/100;  
    var s = f.toString();  
    var rs = s.indexOf('.');  
    if (rs < 0) {  
        rs = s.length;  
        s += '.';  
    }  
    while (s.length <= rs + unit) {  
        s += '0';  
    }  
    return s;  
}

function showDialog(str){
	var curindex;
//	parent.layer.open({
//		type: 2,
//		title:"",
//		area: ["1000px", "600px"],
//		resize: false,
////		shade: 0,
//		content: pageAlert,
//		success:function(layero, index){
//			curindex = index;
////			var iframeWin = layero.find('iframe')[0].contentWindow;
////			iframeWin.setContent(str);
//		}
//	});
	parent.layer.alert(str, {offset: '20px',shade: 0});
}

/******************************************************************End 评审内容列表*************************************************************/

