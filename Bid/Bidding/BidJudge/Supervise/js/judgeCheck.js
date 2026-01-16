/**

 */

var pageProject = "Bidding/BidJudge/Supervise/model/projectView.html";  //项目详情页面
//var pageEliminate = "Bidding/BidJudge/Supervise/model/applyEliminate.html";  //申请淘汰页面
var reviewDetailHtml = "Bidding/BidJudge/Supervise/model/reviewDetail.html";  //具体评审页面

var expertClarifyListUrl = config.tenderHost + "/RaterAskListController/expertRaterList.do";  //  评委澄清列表
var saveExpertAskUrl= config.tenderHost + "/RaterAskListController/saveRaterAsk.do";  //评委提交质疑
var retractExpertAskUrl= config.tenderHost + "/RaterAskListController/resetRaterAskAnswers.do";  //撤回质疑

var findSupplierListUrl= config.tenderHost + "/CheckLastResultController/findSupplierLastList.do";  //首轮投标人列表
var findBidCheckUrl= config.tenderHost + "/BidCheckController/findBidCheck.do";  //评审项列表
var raterUrl = config.tenderHost + '/ExpertRecommendController/findExpertMembers.do';//获取评委列表

var judgesUrl = config.tenderHost + '/BidCheckItemController/findBidCheckItem.do';//获取评审项分项

//var tabTarget = "";   //当前显示的tabContent的id
var supplierId = "";  //当前供应商id
var packageId = "";  //标段id
var projectId = "";  //项目id
var checkId = 0;  //评审id
var examType = 2;   //资格审查方式
var raterId = '';//评委id
var clarifyTimer = "";
var num = 1;//评审项分项最多有多少项

var reviewData = [
	{name:"评审进度管理", id:"schedule-tab", href:"#schedule"},
	{name:"初步评审", id:"", href:"#", child:[{name: "形式评审", id:"formReview-tab", href:"#formReview"},{name: "资格评审", id:"qualifyReview-tab", href:"#qualifyReview"},{name: "响应性评审", id:"responseReview-tab", href:"#responseReview"}]},
	{name:"详细评审", id:"detailReview-tab", href:"#detailReview"},
	{name:"评审报告", id:"report-tab", href:"#report"},
	{name:"预审澄清", id:"clarify-tab", href:"#clarify"}
];
var companyData = [
	{name:"武汉吉家有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"},
	{name:"上海云峰科技有限公司"}
];
$(function(){
	
//	initData();
	if(getUrlParam("id") && getUrlParam("id") != "undefined"){
		packageId =  getUrlParam("id");
	};
	
	//评审项tab
	$('#reviewTabs a').click(function (e) {
	  	e.preventDefault();
	  	var str = $(this).attr("href");
	  	tabTarget = $(str);
	  	switch(str){
	  		case "#clarify":   //预审澄清
	  			expertClarifyList();
	  			break;
	  	}
	  	checkId = $(this).attr("data-id");
	  	findSupplierList();
	  	getRaterList();
	});
	
	//投标人选择
	$('#companyTabs').on("click", "a", function (e) {
	  	e.preventDefault();
	  	$(this).tab('show');
	  	supplierId = $(this).attr("data-id");
	  	/*if(checkId != 0){
	  		openReviewDetail();
	  	}*/
	  	getJudgesContent()
	});
	//评委选择
	$('#judgesTabs').on("click", "a", function (e) {
	  	e.preventDefault();
	  	$(this).tab('show');
	  	raterId = $(this).attr("data-id");
	  	/*if(checkId != 0){
	  		openReviewDetail();
	  	}*/
	});
	
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
//	//全部合格
//	tabTarget.on("click", ".btnQualified", function(){
//		tabTarget.find(".isQualified").val(0);
//	});
//	//全部不合格
//	tabTarget.on("click", ".btnNoQualified", function(){
//		tabTarget.find(".isQualified").val(1);
//	});
	
	/************************************************Start 预审澄清*********************************/
	
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
//	console.log(data);
	if(data){
		
		$("#projectName").html(data.tenderProjectName);
		$("#projectCode").html(data.tenderProjectCode);
		$("#bidSectionName").html(data.bidSectionName);
		$("#interiorBidSectionCode").html(data.interiorBidSectionCode);
	}
	initData()
}

/**
 * 数据初始化
 */
function initData(){
	
	//评审项
	tabTarget = $("#schedule");
	findBidCheck();
	
//	var reviewHtml = "", node="";
//	for(var i = 0; i < reviewData.length; i++){
//		node = reviewData[i];
//		if(node.child && node.child.length > 0){
//			
//			reviewHtml += '<li role="presentation" class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">'+node.name+'<span class="caret"></span></a>';
//			reviewHtml += '<ul class="dropdown-menu" aria-labelledby="myTabDrop1" id="myTabDrop1-contents" id="myTabDrop1-contents">';
//			for(var j = 0; j < node.child.length; j++){
//				reviewHtml += '<li><a href="'+node.child[j].href+'" id="'+node.child[j].id+'" role="tab" data-toggle="tab" aria-controls="dropdown1" aria-expanded="false">'+node.child[j].name+'</a></li>';
//			}
//			reviewHtml += '</ul></li>';
//		} else {
//			reviewHtml += '<li role="presentation"><a href="'+node.href+'" id="'+node.id+'" data-toggle="tab">'+node.name+'</a></li>';
//		}
//	}
//	$(reviewHtml).appendTo("#reviewTabs");
//	$('#reviewTabs a[href="#schedule"]').tab('show');
//	
//	//供应商列表
//	$(".companyDiv").width($("#formName").width()-16);
//	var companyHtml = "";
//	for(var i = 0; i < companyData.length; i++){
//		if(i == 0){
//			companyHtml += '<li class="active"><a href="#" data-id="">'+companyData[i].name+'</a></li>';
//		} else {
//			companyHtml += '<li><a href="#" data-id="">'+companyData[i].name+'</a></li>';
//		}
//	}
//	$(companyHtml).appendTo("#companyTabs");
	
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


/******************************************************************Start 预审澄清*************************************************************/
/**
 * 查询澄清列表
 */
function expertClarifyList(){
	$.ajax({
		url: expertClarifyListUrl,
     	type: "post",
     	data:{
     		bidSectionName:"",
     		interiorBidSectionCode:"",
     		supplierId:supplierId
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	var html = "";
     		for(var i=0; i < arr.length; i++){
     			html += "提问人：";
     			html += "<br/>提问内容：" + arr[i].askContent;
     			html += "<br/>提问时间：" + arr[i].askDate;
     			html += "<br/>答复内容：" + arr[i].answerContent ? arr[i].answerContent : "<span style='color:red'>暂无回复</span><button type='button' class='btn btn-primary btn-sm btnRecall' data-id='"+arr[i].id+"'>撤回</button><br/>";
     		}
     		$(html).appendTo("#clarifyList");
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
 	});
}





/******************************************************************新*************************************************************/
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
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	
         	bidCheckHtml(arr);
         	
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
 	});
}
/**
 * 评审项列表
 * @param {Object} data  评审项数据
 */
function bidCheckHtml(data){
	$("#reviewTabs li:gt(0)").remove();
	var reviewHtml = "", node="";
	for(var i = 0; i < data.length; i++){
		node = data[i];
		if(node.bidChecks && node.bidChecks.length > 0){
			if(i == 0){
				checkId = node.bidChecks[0].id;
			}
         	
			reviewHtml += '<li role="presentation" class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">'+node.checkName+'<span class="caret"></span></a>';
			reviewHtml += '<ul class="dropdown-menu" aria-labelledby="myTabDrop1">';
			for(var j = 0; j < node.bidChecks.length; j++){
				reviewHtml += '<li><a href="#" data-id="'+node.bidChecks[j].id+'" role="tab" data-toggle="tab" aria-controls="dropdown1" aria-expanded="false">'+node.bidChecks[j].checkName+'</a></li>';
			}
			reviewHtml += '</ul></li>';
		} else {
			if(i == 0){
				checkId = data[0].id;
			}
			reviewHtml += '<li role="presentation"><a href="#" data-id="'+node.id+'" data-toggle="tab">'+node.checkName+'</a></li>';
		}
	}
	$(reviewHtml).appendTo("#reviewTabs");
	$("#reviewTabs a[data-id='"+checkId+"']").tab("show");
	findSupplierList();
	getRaterList();
}
//获取投标人列表
function findSupplierList(){
	$.ajax({
		url: findSupplierListUrl,
     	type: "post",
     	data:{
     		bidSectionId:packageId,
     		examType:examType,
     		checkId:checkId
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	arr = [
		        {
		            "id": "1",
		            "supplierId": "df5c8a647cbc4b979e8fee9c2b50add0",
		            "supplierName": "金贝贝科技有限公司"
		        },
		        {
		            "id": "1",
		            "supplierId": "df5c8a647cbc4b979e8fee9c2b50add0",
		            "supplierName": "某某科技有限公司"
		        },
		        {
		            "id": "1",
		            "supplierId": "df5c8a647cbc4b979e8fee9c2b50add0",
		            "supplierName": "哈哈哈科技有限公司"
		        }
		    ]
         	supplierHtml(arr);
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
 	});
};


/**
 * 供应商列表
 * @param {Object} data  供应商数据
 */
function supplierHtml(data){
	$("#companyTabs li").remove();
	var companyHtml = "";
	for(var i = 0; i < data.length; i++){
//		if(i == 0){
//			companyHtml += '<li class="active"><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
//		} else {
			companyHtml += '<li><a href="#" data-id="'+data[i].supplierId+'">'+data[i].supplierName+'</a></li>';
//		}
	}
	$(companyHtml).appendTo("#companyTabs");
};
//获取评委列表
function getRaterList(){
	$.ajax({
		url: raterUrl,
     	type: "post",
     	data:{
     		'packageId':packageId,
     		'examType':examType
     	},
     	success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	judgesHtml(arr);
     	},
     	error: function (data) {
         	parent.layer.alert("加载失败");
     	}
 	});
}

/*评委列表
 * data  评委数据
 */
function judgesHtml(data){
	$("#judgesTabs").html('');
	var raterHtml = "";
	for(var i = 0; i < data.length; i++){
		raterHtml += '<li><a href="#" data-id="'+data[i].expertId+'">'+data[i].expertName+'</a></li>';
	}
	$(raterHtml).appendTo("#judgesTabs");
};

function getJudgesContent(){
	$.ajax({
		type:"post",
		url:judgesUrl,
		async:true,
		data: {
			'bidSectionId': packageId,
			'examType': examType,
			'supplierId': supplierId,
			'checkId':checkId
		},
		success: function(data){
//			console.log(data);
			mostItems(data.data);
//			console.log(num);
			scoreTable(data.data,num)
		}
	});
}
//计算最多评审项
function mostItems(data){
	for(var i = 0; i < data.length; i++){
		var node = data[i];
		if(node.bidCheckItemDtos && node.bidCheckItemDtos.length > 0){
			num += 1;
			mostItems(node.bidCheckItemDtos)
		}
	}
};
//每一级的评审项
function detailItems(data,numb){
	var detailNum = numb;
	if(data.length>0){
		detailNum += 1;
		for(var i = 0; i < data.length; i++){
	//		var node = data;
			if(data.bidCheckItemDtos && data.bidCheckItemDtos.length > 0){
				detailNum += 1;
				mostItems(node.bidCheckItemDtos)
			}
		}
//		
	}
	return detailNum
};
function scoreTable(data,number){
	var scoreHtml = '';
	var wrapHtml = '';
	var contentHtml = '';
	if(data.length > 0){
		wrapHtml = '<div style="color: red; padding: 10px;">评审方法：评分制<br/>'
					+'汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分。</div>'
	    		+'<table class="table table-bordered">'
		    		+'<thead>'
		    			+'<tr>'
			    			+'<th style="width: 50px;text-align: center;">序号</th>'
			    			+'<th colspan="'+number+'">评价内容</th>'
			    			+'<th>评价标准</th>'
			    			+'<th style="width: 120px; text-align: center;">分值</th>'
			    			+'<th>备注</th>'
			    			+'<th style="width: 200px;">得分</th>'
			    			+'<th style="width: 200px;">文件</th>'
			    		+'</tr>'
		    		+'</thead>'
		    		+'<tbody></tbody></table>';
		for (var i = 0;i<data.length;i++) {
			var levelMaxNum = detailItems(data[i].bidCheckItemDtos,0);
			/*for(	){
				
			}*/
			contentHtml += '<tr>'
				    			+'<td rowspan="2" style="width: 50px;text-align: center;">'+(i+1)+'</td>'
				    			+'<td rowspan="2" >供应商名称</td>'
				    			+'<td >供应商名称</td>'
				    			+'<td>与营业执照一致</td>'
				    			+'<td style="text-align: center;">12</td>'
				    			+'<td>备注</td>'
				    			+'<td><input class="form-control" name="score" /></td>'
				    		+'</tr>';
				    		
				    		
				    		
		}
	}
}
