//访问路径
var url = top.config.bidhost;
var checkRemark;
//详情页面数据
//var ProjectData = JSON.parse(sessionStorage.getItem("ProjectData"));
//包件id
//var packageId = getUrlParam("id");
var packageId = getUrlParam("packageId");
var loadFile = top.config.bidhost + "/FileController/download.do"; //文件下载
//评评审方式    0综合评分法   1最低价法
//var checkPlan = getUrlParam("checkPlan");
var checkPlan;
var isAgents=""
//本页面获取的包件信息
var packageData;
var WORKFLOWTYPE;
$(function() {
	
	getProjectData();
	
	//加载主页面请求数据
	InfoAndProjectCheck();
	//最低价法，无价格评审
	/*if(checkPlan == '1') {
		$("#liaPriceCheck").css('display', 'none');
	}*/
	
	//包件结束后，所有按钮皆不能操作
	if(packageData.isStopCheck == 1) {
		$(".btn").hide();
		$(".btntr").hide();
	}
	
	if(packageData.inviteState){
		//已发布邀请函
		//$(".btn").hide();
		$(".btntr").hide();
		$(".stopCheck").hide();
	}
	$(".prieUnit").html(top.prieUnit);
});

var keepNum = "";

//调用接口，读取页面信息
function InfoAndProjectCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			examCheckType:1,
			roleType: 0
		},
		async: false,
		success: function(data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);

			packageData = data.data;			        			
			checkPlan = packageData.examCheckPlan;
			
			//加载动态tab
			insertTab(packageData);
			//默认加载第一个tab，清单报价
			ProjectCheckState(packageData); //评审进度
			BindCheckStateRestor(packageData); //退回记录
			
			packageCheck = packageData.packageCheckLists;
			
			if(packageData.keepNum != undefined){
				keepNum = packageData.keepNum;
			}
			
			if(keepNum != ""){
				checkFinish();				
				countDown();
			}
			if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
				if(packageData.stopCheckSource==1){
					$('.StopCheck').attr('style','display: inline;');
					$('#viewReason').show();
				}else{
					$('.StopCheck').attr('style','display: none;');
					$('#viewReason').hide();
				}				
			}else{
				$('.StopCheck').attr('style','display: none;');
				$('#viewReason').hide();
			}
			if(packageData.isStopCheck == 1) {
				$('.StopCheck').attr('style','display: none;');
				$('#viewReason').hide();
			}
			$("#downloadAllFile").show();
		}
	});
}
//只重新获取主数据，进度
function getData() {
	$.ajax({
		type: "get",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			examCheckType:1,
			roleType: 0
		},
		async: false,
		success: function(data) {
			packageData = data.data;
		}
	});
}
var packageCheck = [];
function checkFinish(){
	for(var j=0;j<packageCheck.length;j++){
		if(packageCheck[j].checkType == 1 && packageCheck[j].resultType!= undefined && packageCheck[j].resultType ==1){
			$(".no_"+packageCheck[j].id+"").hide();
			$("#li_"+packageCheck[j].id+"").hide();
		}else{
			$(".no_"+packageCheck[j].id+"").show();
			$("#li_"+packageCheck[j].id+"").show();
		}
	}
	
	if(packageData.inviteState){
		//已发布邀请函
		//$(".btn").hide();
		$(".btntr").hide();
		$(".stopCheck").hide();
	}
}
var stop="";
function countDown(temp) {	
		$.ajax({
			type: "post",
			url: url + "/ProjectReviewController/getPackageCheckList.do",
			data: {
				projectId: packageData.projectId,
				packageId: packageId,
				examType:0,
				keepNum: keepNum,
				checkerCount:packageData.projectCheckers[0].checkerCount
			},
			async: false,
			beforeSend: function(xhr){
		       var token = $.getToken();
		       xhr.setRequestHeader("Token",token);
		    },
			success: function(data) {
				if(data.data != null){
					packageCheck = data.data;
					checkFinish();
				}
			}
		});
		stop=setTimeout(function(){		
			countDown()
		},950)//循环
		
	
//	setTimeout(, ); 
}	


function getProjectData(){
	$.ajax({
		url: url + "/CheckController/getPurchaseCheck.do",
		data: {
			id: getUrlParam("projectId"),
			packageId:getUrlParam("packageId"),
			checkType:1
		},
		async: false,
		success: function(data) {
			if(data.success) {				
				ProjectData = data.data;
				isAgents = ProjectData.isAgent;

			}
		}
	});
}


var count = 0;
//点击tab加载对应数据
$("#myTab").on("click", "li", function(e) {
	$("#myTab li").removeClass('active');
	$(this).addClass('active');
	var contentdiv = $(this).attr('value');
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");

	switch(contentdiv) {
		case "#progress":
			count++;
			if(count >= 1){
				InfoAndProjectCheck2();
			}
			ProjectCheckState(packageData); //评审进度
			BindCheckStateRestor(packageData); //退回记录
			checkFinish();
			break;
		case "#PackageOffer":
			PackageOffer(packageData); //供应商报价
			offerDetaileds(packageData.offerDetaileds); //报价详情
			packageDetaileds(packageData); //询价采购清单
			break;
		case "#PriceFile":
			offerData('PriceFile');
			break;
		case "#PriceCheck":
			PriceCheck(); //加载价格评审和评审方法
			break;
		case "#PriceCheckTotal":
			PriceCheckTotal(packageData);
			break;
		case "#CheckReport":
			if(packageData.checkItem == "未完成") {
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
				return top.layer.alert("评审汇总未完成，无法生成报告");
			}
			CheckReport(packageData);
			WORKFLOWTYPE = 'psbg';			
			findWorkflowCheckerAndAccp(packageData.checkReportId || packageData.projectId);
			break;
		case "#raterAsks":
			bindRaterAsks(packageData);
			break;
		default:
			//动态评审项  赋值
			var packageCheckLists = packageData.packageCheckLists;
			for(var i = 0; i < packageCheckLists.length; i++) {
				if(contentdiv == ("#" + packageCheckLists[i].id)) {
					insetItmeTab(packageCheckLists[i]);
					break;
				}
			}
			//二级切换
			var id = contentdiv.substr(1, contentdiv.length - 1);
			$("#Tab_" + id).on("click", "li", function(e) {
				$("#Tab_" + id + " li").removeClass('active');
				$(this).addClass('active');
				var contentdivdetail = $(this).attr('value');
				$("#TabContent_" + id + " div").removeClass('show');
				$(contentdivdetail).addClass("show");
			});
			break;
	}
});

//重新获取数据
function InfoAndProjectCheck2() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			examCheckType:1,
			roleType: 0
		},
		async: false,
		success: function(data) {
			packageData = data.data;
		}
	});
}

//加载CheckLists选项卡
function insertTab(packageData) {
	var data = packageData.packageCheckLists; //评审项
	var strUl = "";
	var strdiv = "";
	for(var i = 0; i < data.length; i++) { //评审项目循环  大的tab绑定
		strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
		strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName + "</a>";
		strUl += "</li>";
		strdiv += "<div class='tab-pane fade' id='" + data[i].id + "'>";
		strdiv += "</div>";
	}
	$("#lidiv").after(strUl);
	$("#PriceFile").after(strdiv);
	var liList=[]
	 $("#myTab li").each(function(){
	 	if($(this).css("display")!="none"){
	 		liList.push($(this).width())
	 	}
	 })
	 if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
	 	var longs=160
	 }else{
	 	var longs=60
	 }
	 $("#fristTab").width($("#fristTabtd").width()-$("#pervAndnext").width()-longs);
	 if((eval(liList.join('+'))+liList.length*4)>=$("#fristTab").width()){
	 	$("#perv").show();
	 	$("#next").show();
	 	$("#myTab").width(eval(liList.join('+'))+liList.length*4);		 	
	 }else{
	 	$("#perv").hide();
	 	$("#next").hide();
	 	$("#myTab").width("100%");	
	 }
	
}
var moveIndexs = 0;
$("#perv").on('click',function(){	
	moveIndexs < 0 ? moveIndexs++ : moveIndexs = 0
	$("#myTab").stop().animate({
		'marginLeft': moveIndexs * 150
	})
})
$("#next").on('click',function(){	
	-($("#myTab").css('width').slice(0, -2) - $("#fristTab").width()) < $("#myTab").css('margin-left').slice(0, -2) ? moveIndexs-- : ''
	$("#myTab").stop().animate({
		'marginLeft': moveIndexs * 150
	})
})
//加载二级选项卡tab
var packageCheckItems;
var suppliers;
var checkItemInfos;
var offerFileData;
function insetItmeTab(packageCheckList) {
	//参数
	var para = {
		projectId: ProjectData.projectId,
		packageId: packageId,
		packageCheckListId: packageCheckList.id,
		checkerCount: packageData.projectCheckers[0].checkerCount,
		examCheckType:1,
		roleType: 0
	};
	//非第一个评审项时寻找上一个评审项id
	/*for(var i = 0; i < packageData.packageCheckLists.length; i++) {
		if(packageCheckList.id == packageData.packageCheckLists[i].id) {
			if(i != 0) {
				para.prePackageCheckListId = packageData.packageCheckLists[i - 1].id;
			} else {
				para.prePackageCheckListId = '';
			}
		}
	}*/
	para.prePackageCheckListId = packageCheckList.id;
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckItem.do",
		data: para,
		async: false,
		success: function(data) {
			data = data.data;
			if(data ) {
				if(data.suppliers.length > 0) {
					packageCheckItems = data.packageCheckItems;
					suppliers = data.suppliers;
					offerFileData=data.offerFileList;
					checkItemInfos = data.checkItemInfos;
					var detaildiv = "<div>";
					var detaildivcenter = "";
					//评审方法&汇总方式
					switch(packageCheckList.checkType) {
						case 0:
							detaildivcenter += "<div><span style='color:red'>评审方法：合格制 </br>";
							detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（"+(data.totalM || "二")+"分之"+(data.totalN || "一")+"）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span></div>";
							break;
						case 1:
							detaildivcenter += "<div><span style='color:red'>评审方法：评分制  </br>";
							//if(packageCheckList.totalType == '0') {
							//if(packageData.projectCheckers[0].checkerCount >= packageCheckList.totalType){
							if(packageCheckList.totalType==0){
								detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</span></div>";
							} else {
								detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</span></div>";
							}
							break;
						case 2:
							detaildivcenter += "<div><span style='color:red'>评审方法：偏离制</br>";						
							detaildivcenter += "<span style='color:red'>允许最大偏离项数："+ (data.deviate||"");
							detaildivcenter += "<span style='color:red'>是否计入总数："+ (data.isSetTotal==0?"计入总数":"不计入");
							if(data.isSetTotal==0){
								detaildivcenter += "<span style='color:red'>是否加价："+ (data.isAddPrice==0?"加价":"不加价") +"</br>";	
							}
							if(data.isAddPrice==0){
								detaildivcenter += "<span style='color:red'>偏离加价幅度："+ (data.addPrice||"");		
							}
							detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（"+(data.totalM || "二")+"分之"+(data.totalN || "一")+"）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项偏离都将淘汰。</br>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行 </br>" + (data.deviate ? '该评审项偏离项数超过' + data.deviate + '项将被淘汰。' : '') + "</span></div>";
							break;
					}
					//detaildiv += "</ul>";
					//detaildiv += "</div>";
					detaildiv += detaildivcenter;
					detaildiv += "<table id='TabContent_" + packageCheckList.id + "' class='tab-content table table-bordered'>";					
					detaildiv += "</table>";
					$("#" + packageCheckList.id).html(detaildiv);	
					if(suppliers.length>=15){
						var auto=parent.$("#PackageInfo").height()-300
					}else{
						var auto='auto'
					}
					$("#TabContent_" + packageCheckList.id).bootstrapTable({
						pagination: false,
						undefinedText: "",
						height:auto,
						columns: [{
								title: '序号',
								width: '50px',
								cellStyle: {
									css: {
										"text-align": "center"
									}
								},
								formatter: function(value, row, index) {
									return index + 1;
								}
							}, {
								field: 'enterpriseName',
								title: '供应商'
							},{
								field:'deviateNum' ,
								title: '偏离项数',	
							},{
								field:'isKeyScore' ,
								title: (packageCheckList.checkType==1?'分值合计':'是否合格'),
								formatter: function(value, row, index) {
									var detaildivcenter="";
									if(packageCheckList.checkType==1){
										detaildivcenter=row.score
									}else{
										if(row.isKey==0){
											detaildivcenter="合格"
										}else{
											detaildivcenter="不合格"
										}
									}								
									return detaildivcenter									
								}
								
							},{
								field: 'supplierId',
								title: '评审文件',
								formatter: function(value, row, index) {
										var str="";
										if(data.offerFileList.length > 0){
											for(var h=0;h<data.offerFileList.length;h++){
												str = "";
												if(data.offerFileList[h].id == packageCheckList.id && data.offerFileList[h].supplierId == value){
													str = data.offerFileList[h].fileName;
													break;
												}else{
													str = "无上传评审文件信息";
													//break;
												}
											}
										}else{
											str += "无上传评审文件信息";
										}		
										return 	str
								}
							},{
								field: 'supplierId',
								title: '操作',
								width: '50px',
								formatter: function(value, row, index) {
									var str="";
									if(data.offerFileList.length > 0){
										for(var h=0;h<data.offerFileList.length;h++){
											str = "";
											if(data.offerFileList[h].id == packageCheckList.id && data.offerFileList[h].supplierId == value){											
												str += "<a href='javascript:void(0)' onclick=downloadFile("+ h +") class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>";
												break;
											}else{
												
											}
										}
									}
									return str
								}
							}			
						]
					});
				$("#TabContent_" + packageCheckList.id).bootstrapTable("load", suppliers); //重载数据
				if(packageCheckList.checkType==2){
					$("#TabContent_" + packageCheckList.id).bootstrapTable("showColumn", 'deviateNum'); //隐藏评审标准  
				}else{
					$("#TabContent_" + packageCheckList.id).bootstrapTable("hideColumn", 'deviateNum'); //隐藏评审标准  
				}
				} else {
					top.layer.alert("所有报名供应商已全部淘汰！");
					$("#myTab li").removeClass('active');
					$("a[href='#progress']").parent().addClass('active');
					$("#myTabContent div").removeClass('show');
					$("#progress").addClass("show");
					return;
				}
			} else {
				top.layer.alert("请在所有评委评审完成后查看此页！");
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
				return;
			}
		}
	});
}
//文件下载
function downloadFile(h) {
	var newUrl = loadFile + "?ftpPath=" + offerFileData[h].filePath + "&fname=" +offerFileData[h].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
//评审进度管理
function ProjectCheckState(packageData) {
	var packageCheckStates = packageData.packageCheckStates; //评委评审进度
	var packageCheckLists = packageData.packageCheckLists; //评审项目
	var projectCheckerItems = packageData.projectCheckerItems; //评委
	//表头
	var titletr = "<table class='table table-bordered'><tr>"
	titletr += "<th style='width:50px'>序号</th>"
	titletr += "<th>评委</th>"
	for(var x = 0; x < packageCheckLists.length; x++) {
		titletr += "<th class='no_"+packageCheckLists[x].id+"'>" + packageCheckLists[x].checkName + "</th>";
	}
	/*titletr += "<th>价格评审</th>"*/
	titletr += "<th>预审记录汇总</th>"
	titletr += "<th>预审报告</th>"
	titletr += "<th>预审报告审核</th>"
	titletr += "</tr>"

	//数据行
	if(projectCheckerItems.length > 0) {
		for(var x = 0; x < projectCheckerItems.length; x++) { //循环每个评委
			var tr = "<tr>";
			tr += "<td>" + (x + 1) + "</td>";
			tr += "<td>" + projectCheckerItems[x].checkerEmployeeName + "</td>"
			for(var i = 0; i < packageCheckLists.length; i++) { //循环评审项目
				var checkState = ""; //评审结果
				for(var j = 0; j < packageCheckStates.length; j++) { //循环评审进度
					//找到评审记录里面评委id和评审项对应的数据行
					if(projectCheckerItems[x].checkerEmployeeId == packageCheckStates[j].checkerEmployeeId && packageCheckLists[i].id == packageCheckStates[j].packageCheckListId) {
						checkState = !packageCheckStates[j].checkState ? "" : packageCheckStates[j].checkState;
					}
				}
				if(checkState.length > 0) {
					tr += "<td><span style='color:green'>" + checkState + "</span></td>";
				} else {
					tr += "<td class='no_"+packageCheckLists[i].id+"'><span style='color:red'>未完成</span></td>";
				}
			}
			if(x == 0) {
				var rowspan = projectCheckerItems.length;
				/*if(packageData.priceCheck == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.priceCheck + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.priceCheck + "</span></td>";
				}*/
				if(packageData.checkItem == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkItem + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkItem + "</span></td>";
				}
				if(packageData.checkReport == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkReport + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkReport + "</span></td>";
				}
				if(packageData.checkResult == "已完成") {
					tr += "<td rowspan='" + rowspan + "'><span style='color:green'>" + packageData.checkResult + "</span></td>";
				} else {
					tr += "<td rowspan='" + rowspan + "'><span style='color:red'>" + packageData.checkResult + "</span></td>";
				}
			}
			tr += "</tr>";
			titletr += tr;
		}
	} else {
		titletr += "<tr><td colspan='" + (packageCheckLists.length + 6) + "'>没有找到匹配的记录</td></tr>";
	}
	//回退按钮
	if(projectCheckerItems.length > 0) {
		if(packageData.isStopCheck != 1&&(packageData.stopCheckReason==""||packageData.stopCheckReason==undefined)&&packageData.checkResult != "已完成"){
		
			titletr += "<tr class='btntr'>";
			titletr += "<td colspan='2'></td>";
			for(var x = 0; x < packageCheckLists.length; x++) {
				titletr += "<td class='no_"+packageCheckLists[x].id+"' ><a style='text-decoration: none;' class='btn btn-primary btn-sm' onclick='openBreak(\"" + packageCheckLists[x].id + "\",\"" + packageCheckLists[x].checkName + "\")'>退回到此阶段</a></td>";
			}
			/*titletr += "<td><a style='text-decoration: none;' class='btn btn-primary btn-sm' onclick='openBreak(\"price\",\"价格评审\")'>退回到此阶段</a></td>";*/
			titletr += "<td><a style='text-decoration: none;' class='btn btn-primary btn-sm' onclick='openBreak(\"item\",\"评审记录汇总\")'>退回到此阶段</a></td>";
			titletr += "<td><a style='text-decoration: none;' class='btn btn-primary btn-sm' onclick='openBreak(\"report\",\"预审报告\")'>退回到此阶段</a></td>";
			titletr += "<td><a style='text-decoration: none;' class='btn btn-primary btn-sm' onclick='openBreak(\"result\",\"报告审核\")'>退回到此阶段</a></td>";
			titletr += "</tr>";
		
		}
	}

	$("#ProjectCheckStateDiv").html(titletr + "</table>");
	if(packageData.isStopCheck == 1) {
		$(".btn").hide();
	}
};

//加载项目回退记录
function BindCheckStateRestor(data) {
	data = data.projectCheckBacks;
	if(data.length>0){
		$(".ProjectCheckStateRestore").show();
		$("#ProjectCheckStateRestoreTalbe").bootstrapTable({
			data: data,
			columns: [{
					title: '序号',
					width: '50px',
					cellStyle: {
						css: {
							"text-align": "center"
						}
					},
					formatter: function(value, row, index) {
						return index + 1;
					}
				}, {
					field: 'backName',
					title: '恢复评审项'
				},
				{
					field: 'remark',
					title: '操作备注'
				},
				{
					field: 'employeeName',
					title: '操作人'
				}, {
					field: 'subDate',
					title: '操作时间'
				}
			]
		});

	}
}

var businessId = "";
//退回到此阶段按钮
function openBreak(backId, backName) {
	if(packageData.checkResult == "已完成") {
		return top.layer.alert("已提交审核，无法回退");
	}
	if(backId.length > 6) {
		var a = 0;
		for(var i = 0; i < packageData.packageCheckStates.length; i++) {
			if(packageData.packageCheckStates[i].packageCheckListId == backId) {
				if(packageData.packageCheckStates[i].checkState == "已完成")
					a++;
				break;
			}
		}
		if(a < 1) {
			return top.layer.alert("无需回退");
		}
	} else {
		switch(backId) {
			case "price":
				if(packageData.priceCheck == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "item":
				if(packageData.checkItem == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "report":
				if(packageData.checkReport == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
			case "result":
				if(packageData.checkResult == "未完成") {
					return top.layer.alert("无需回退");
				}
				break;
		}
	}

	businessId = "";
	breakProjectCheckMsg(backId, backName);

	/*parent.layer.prompt({
		title: '请输入回退原因',
		formType: 2
	}, function(text, index) {
		breakProject(backId, backName, text);
		parent.layer.close(index);
	});*/
};

//验证是否可以退回评审报告
function breakProjectCheckMsg(backId, backName){
	var strMesg = "";
	$.ajax({ //验证评审报告是否可以退回
		type: "get",
		url: url + "/ProjectCheckBackController/checkBackMessage.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			examType:0
		},
		async: false,
		success: function(res) {
			if(res.success){
			   var reslut=res.data;			   
			   switch (reslut['strKey']){
			   	  case '801':
			   		businessId= reslut['strMessage'];
			   	    //parent.layer.alert();
			   		break;
			   	 /*case '802':
			   	    strMesg = "温馨提示：您已编辑结果公示，无法回退";
			   		break;
			   	 case '803':
			   	    strMesg = "温馨提示：您已编辑结果通知，无法回退";
			   		break;*/
			   	 case '804':
			   	    strMesg = "温馨提示：评审报告已审核通过，无法回退";
			   		break;
			   	  default:
			   	    break;
			   }
			}
		},
		error: function(err) {
			parent.layer.alert("退回失败");
		}
	});
	
	if(strMesg != ""){
		parent.layer.alert(strMesg);
		return false;
	}
	
	if(businessId != ""){
		parent.layer.confirm('温馨提示：当前项目已经生成评审报告并且评审报告正在审核中，确认退回？', {
		    btn: ['确定', '取消']
		}, function (index1, layero) {
		    breakProject(backId, backName);
		    parent.layer.close(index1);
		}, function (index2, layero) {
		 	parent.layer.close(index2);
		});
	}else{
		breakProject(backId, backName);
	}
}

//退回原因
function breakProject(backId, backName){
	
	parent.layer.prompt({
		title: '请输入回退原因',
		formType: 2
	}, function(text, index) {
		saveBreak(backId, backName, text);
		parent.layer.close(index);
	});
}

//保存退信信息
function saveBreak(backId, backName, backRemark) {
	if(backRemark != "") {
		$.ajax({ //请求插入回退历史记录
			type: "get",
			url: url + "/ProjectCheckBackController/insertProjectCheckBack",
			data: {
				projectId: packageData.projectId,
				packageId: packageData.packageId,
				backName: backName,
				backId: backId,
				remark: backRemark,
				examType:0,
				businessId:businessId
			},
			async: false,
			success: function(data) {
				if(data.success) {
					parent.layer.close(parent.layer.index);
					window.location.reload();
					parent.layer.alert("退回成功");
				} else {
					parent.layer.alert("退回失败");
				}
			},
			error: function(err) {
				parent.layer.alert("退回失败");
			}
		});
	} else {
		parent.layer.alert("请输入退回原因");
	}
}

//退回确定按钮
/*function breakProject(backId, backName, backRemark) {
	if(backRemark != "") {
		$.ajax({ //请求插入回退历史记录
			type: "get",
			url: url + "/ProjectCheckBackController/insertProjectCheckBack",
			data: {
				projectId: packageData.projectId,
				packageId: packageData.packageId,
				backName: backName,
				backId: backId,
				remark: backRemark,
				examType:0
			},
			async: false,
			success: function(data) {
				if(data.success) {
					parent.layer.close(parent.layer.index);
					window.location.reload();
					parent.layer.alert("退回成功");
				} else {
					parent.layer.alert("退回失败");
				}
			},
			error: function(err) {
				parent.layer.alert("退回失败");
			}
		});
	} else {
		parent.layer.alert("请输入退回原因");
	}
}*/

//清单报价
function PackageOffer(packageData) {
	var data = packageData.offers;
	$("#PackageOfferTable").bootstrapTable({
		data: data,
		columns: [{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商'
			},
			//			{
			//				field: 'priceTotal',
			//				title: '总报价'
			//			},
//			{
//				field: 'afterTaxTotal',
//				title: '不含税报价',
//				formatter: function(value, row, index) {
//					if(ProjectData.checkEndDate > getNowFormatDate()) {
//						return "***";
//					} else {
//						return value;
//					}
//				}
//			},
//			{
//				field: 'beforTaxTotal',
//				title: '含税报价',
//				formatter: function(value, row, index) {
//					if(ProjectData.checkEndDate > getNowFormatDate()) {
//						return "***";
//					} else {
//						return value;
//					}
//				}
//			},
			{
				field: 'saleTaxTotal',
				title: '最终报价',
				formatter: function(value, row, index) {
					if(ProjectData.checkEndDate > getNowFormatDate()) {
						return "***";
					} else {
						return value;
					}
				}
			},
			{
				field: 'legalPerson',
				title: '法人/被授权人'
			},
			{
				field: 'linkTel',
				title: '联系方式'
			}
		]
	});
};

//包件详情
function packageDetaileds(packageData) {
	var data = packageData.packageDetaileds;
	$("#packageDetailedsTable").bootstrapTable({
		data: data,
		clickToSelect: true,
		onClickRow: function(row) {
			var offerDetaileds = packageData.offerDetaileds; //询价采购报价详情
			var newofferDetaileds = new Array();
			for(x in offerDetaileds) {
				if(offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		onCheck: function(row) {
			var offerDetaileds = packageData.offerDetaileds; //询价采购报价详情
			var newofferDetaileds = new Array();
			for(x in offerDetaileds) {
				if(offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						var offerDetaileds = packageData.offerDetaileds; //询价采购报价详情
						var newofferDetaileds = new Array();
						for(x in offerDetaileds) {
							if(offerDetaileds[x].packageDetailedId == row.id)
								newofferDetaileds.push(offerDetaileds[x]);
						}
						$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
						return true;
					} else {
						return false
					};
				}
			},
			{
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'detailedName',
				title: '名称'
			}, {
				field: 'detailedVersion',
				title: '型号规格'
			}, {
				field: 'detailedCount',
				title: '数量'
			}, {
				field: 'detailedUnit',
				title: '单位'
			}
		]
	});
};

//清单报价详情
function offerDetaileds(data) {
	$("#offerDetailedsTable").bootstrapTable({
		cache: false,
		data: data,
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'enterpriseName',
			title: '供应商名称'
		}, 
//		{
//			field: 'beforTaxPrice',
//			title: '不含税单价',
//			formatter: function(value, row, index) {
//				if(ProjectData.checkEndDate > getNowFormatDate()) {
//					return "***";
//				} else {
//					return value;
//				}
//			}
//		}, 
//		{
//			field: 'taxRate',
//			title: '税率(%)',
//			formatter: function(value, row, index) {
//				if(ProjectData.checkEndDate > getNowFormatDate()) {
//					return "***";
//				} else {
//					return value;
//				}
//			}
//		},
//		{
//			field: 'afterTaxPrice',
//			title: '含税单价',
//			formatter: function(value, row, index) {
//				if(ProjectData.checkEndDate > getNowFormatDate()) {
//					return "***";
//				} else {
//					return value;
//				}
//			}
//		}, 
		{
			field: 'saleTaxTotal',
			title: '最终报价',
			formatter: function(value, row, index) {
				if(ProjectData.checkEndDate > getNowFormatDate()) {
					return "***";
				} else {
					return value;
				}
			}
		}, 
//		{
//			field: 'beforTaxTotal',
//			title: '不含税合价',
//			formatter: function(value, row, index) {
//				if(ProjectData.checkEndDate > getNowFormatDate()) {
//					return "***";
//				} else {
//					return value;
//				}
//			}
//		},
//		{
//			field: 'afterTaxTotal',
//			title: '含税总价',
//			formatter: function(value, row, index) {
//				if(ProjectData.checkEndDate > getNowFormatDate()) {
//					return "***";
//				} else {
//					return value;
//				}
//			}
//		}
		]
	});
};
function offerData(name){
	$.ajax({ 
		type: "post",
		url: url + "/ProjectReviewController/getSupplierExamOffer.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,			
			examType:0,
		},
		async: false,
		success: function(data) {
			if(data.success) {
				file(data.data.purFiles); //报价文件					
				fileEnterprise(data.data); //报价供应商
				
			} 
		},
		error: function(err) {
			
		}
	});
}
//报价文件供应商
function fileEnterprise(packageDatas) {
	var offers=packageDatas.enterprises
	$("#fileEnterpriseTable").bootstrapTable({
		data: offers,
		clickToSelect: true,
		onClickRow: function(row) {
			var purFiles = packageDatas.purFiles;
			var files = new Array();
			for(x in purFiles) {
				if(purFiles[x].enterpriseId == row.supplierId)
					files.push(purFiles[x]);
			}
			$('#fileTable').bootstrapTable('load', files);
		},
		onCheck: function(row) {
			var purFiles = packageDatas.purFiles;
			var files = new Array();
			for(x in purFiles) {
				if(purFiles[x].enterpriseId == row.supplierId)
					files.push(purFiles[x]);
			}
			$('#fileTable').bootstrapTable('load', files);
		},
		columns: [{
				radio: true,
				formatter: function(value, row, index) {
					if(index == 0) {
						var purFiles = packageDatas.purFiles;
						var files = new Array();
						for(x in purFiles) {
							if(purFiles[x].enterpriseId == row.supplierId)
								files.push(purFiles[x]);
						}
						$('#fileTable').bootstrapTable('load', files);
						return true;
					} else {
						return false
					};
				}
			},
			{
				field: '#',
				title: '序号',
				width: '50px',
				cellStyle: {
					css: {
						"text-align": "center"
					}
				},
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'enterpriseName',
				title: '供应商名称'
			}
		]
	});
}
//报价文件
function file(data) {
	$("#fileTable").bootstrapTable({
		data: data,
		columns: [{
			field: '#',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'fileName',
			title: '附件名称'
		}, {
			field: 'fileSize',
			title: '附件大小'
		}, {
			field: 'caoz',
			title: '下载',
			events:{
				'click .fileDownload':function(e,value, row, index){
					var newUrl=$.parserUrlForToken(top.config.bidhost+"/FileController/download.do?ftpPath="+ row.filePath+"&fname="+row.fileName)
					window.location.href = newUrl;
				}
			},
			formatter: function(value, row, index) {
				return "<a style='text-decoration: none;margin-right: 5px;' class='btn btn-primary btn-sm fileDownload'>下载</a>";
			}
		}]
	});
}

$("#downloadAllFile").click(function(){
	window.open($.parserUrlForToken(top.config.bidhost+"/ProjectReviewController/downloadAllPurFile.do?projectId="+ProjectData.projectId+"&packageId="+packageId+"&examType="+"0"));
});

//价格评审
var priceChecks;
var businessPriceSet;

function PriceCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			checkPlan: 0,
			checkerCount: packageData.projectCheckers[0].checkerCount,
			packageCheckListCount: packageData.packageCheckLists.length
		},
		success: function(data) {
			data = data.data;
			if(data) {
				businessPriceSet = data.businessPriceSet;
				priceChecks = data.priceChecks;
				//评审规则、
				var roleObj = {
					'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
					'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
						'基准价=参与应标的供应商总报价/供应商家数</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>每高于基准价%扣分，低于基准价%加分；超过100分，按100分计；低于0分按0分计</br>商务报价得分= 基准分-N*加扣分值',
						'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
						'偏离调整=累计偏离值*参与应标的供应商总报价*上浮比例</br>调整后最终总报价=参与应标的供应商总报价+偏离调整'
					]
				}
				$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
				//$("#weight").html("权重：" + businessPriceSet.weight);
				$("#businessContent").html("商务报价得分计算公式：" + roleObj.content[businessPriceSet.checkType]);

				if(data.priceCheck == "已完成") {
					$("#savediv").hide();
				}
				//价格评审表格
				if(checkPlan == '0') {
					$("#PriceCheckTalbe").bootstrapTable({
						data: priceChecks,
						columns: [{
								field: '#',
								title: '序号',
								width: '50px',
								cellStyle: {
									css: {
										"text-align": "center"
									}
								},
								formatter: function(value, row, index) {
									return index + 1;
								}
							}, {
								field: 'enterpriseName',
								title: '供应商'
							},
							{
								field: 'saleTaxTotal',
								title: '原报价('+ top.prieUnit +')'
							},
							{
								field: 'isOut',
								title: '淘汰',
								formatter: function(value, row, index) {
									return value == 0 ? '否' : '是';
								}
							},
							{
								field: 'finalPrice',
								title: '最终报价('+ top.prieUnit +')',
								width: '180px',
								formatter: function(value, row, index) {
									if(data.priceCheck == "未完成") {
										if(businessPriceSet.checkType == 0) {
											return "<input type='text' id='finalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'></input>";
										} else {
											return "<span type='text' id='finalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
										}
									} else {
										return value;
									}
								}
							},
							{
								field: 'score',
								title: '商务报价得分',
								width: '150px',
								formatter: function(value, row, index) {
									if(data.priceCheck == "未完成") {
										if(businessPriceSet.checkType == 0) {
											return "<input type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'></input>";
										} else {
											return "<span type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'>" + (row.score || '') + "</span>";
										}
									} else {
										return value;
									}
								}
							}
						]
					});
				}
			} else {
				top.layer.alert("请在评委评审完成后，进行此项操作！");
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}
		}
	});
};

//保存价格评审
function savepriceChecks() {
	if(businessPriceSet.checkType == 0) {
		for(var i = 0; i < priceChecks.length; i++) {
			if($("#finalPrice_" + priceChecks[i].supplierId).val() == '') {
				top.layer.alert("请输入最终报价");
				return false;
			}
			if($("#score_" + priceChecks[i].supplierId).val() == '') {
				top.layer.alert("请输入商务报价得分");
				return false;
			}
		}
	}

	var para = {};
	for(var i = 0; i < priceChecks.length; i++) {
		para['priceChecks[' + i + '].projectId'] = packageData.projectId;
		para['priceChecks[' + i + '].packageId'] = packageData.packageId;
		para['priceChecks[' + i + '].supplierId'] = priceChecks[i].supplierId;
		if(businessPriceSet.checkType == 0) {
			para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).val();
			para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).val();
		} else {
			para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).attr("value");
			para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).attr("value");
		}
		priceChecks[i].id && (para['priceChecks[' + i + '].id'] = priceChecks[i].id);
	}

	$.ajax({
		type: "POST",
		url: url + "/WaitCheckProjectController/priceCheck.do",
		data: para,
		async: true,
		success: function(data) {
			if(data.success) {
				window.location.reload();
				$("#myTab li").removeClass('active');
				$("a[href='#PriceCheck']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#PriceCheck").addClass("show");
				$("#savediv").hide();
				top.layer.alert('提交成功!');
			} else {
				top.layer.alert('提交失败!');
			}
		}
	});
}

//评审记录汇总
var CheckTotals;
var orderOfferList = [];
function PriceCheckTotal(packageData) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			examCheckType:1,
			checkPlan: checkPlan
		},
		async: false,
		success: function(data) {
			CheckTotals = data.data;
			/*if(CheckTotals.keepNum){
			   keepNum = CheckTotals.keepNum;
			}*/
			
			if(CheckTotals.orderOfferList){
				orderOfferList = CheckTotals.orderOfferList;
			}
			if(CheckTotals.examCheckPlan==0){
				$('.titleReady').hide()
			}else if(CheckTotals.examCheckPlan==1){
				if(CheckTotals.isAllOut==1){
					$('.titleReady').hide()
				}
			}
			var priceCheckTotals = data.data.priceCheckTotals;
			//按钮控制
			//if(CheckTotals && CheckTotals.priceCheck == '已完成') {
			if(CheckTotals.offers){
				
				clearTimeout(stop);				
				if(CheckTotals.checkItem == '已完成') {
					if(CheckTotals.checkReports!=undefined&&CheckTotals.checkReports.length>0){
						checkRemark=CheckTotals.checkReports[0].checkRemark
					}
					
					$("#savePriceCheckTotal").attr("disabled", true);
					$("#savePriceCheckTotal").css("pointer-events", "none");
					$("#editReport").attr("disabled", false);
					$('.titleReady').hide()
					//$("#editReport").css("pointer-events", "none");
					$("#checkPlace").val(priceCheckTotals[0].checkPlace);
					$("#checkPlace").attr("disabled", true);
					$("#checkDate").val(priceCheckTotals[0].checkDate);
					$("#checkDate").attr("disabled", true);
					$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					$("#checkRemark").attr("disabled", true);					
				} else {
					if(priceCheckTotals && priceCheckTotals.length > 0) {
						$("#checkPlace").val(priceCheckTotals[0].checkPlace);
						$("#checkDate").val(priceCheckTotals[0].checkDate);
						$("#checkRemark").val(priceCheckTotals[0].checkRemark);
					}
					
				}

				if(CheckTotals.checkReport == "已完成") {
					$("#generateReport").attr("disabled", true);
					$("#generateReport").css("pointer-events", "none");
					$("#editReport").attr("disabled", true);
					$("#editReport").css("pointer-events", "none");
					
				}
				//有评审记录时，暂时历史记录
				var priceCheckItems =[];
				if(CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) {
					priceCheckItems = CheckTotals.priceCheckItems;
				}
				
				var html = '';
				var checker = CheckTotals.experts; //评委
				var list = CheckTotals.packageCheckLists;
				//var priceChecks = CheckTotals.offers;
				var priceChecks = CheckTotals.offers;
				if(priceChecks) {
					html += "<tbody><tr>";
					html += "<td style='text-align:center' width='200px'>供应商名称</td>";
					html += "<td style='text-align:center' width='120px'>评审项</td>";
					html += "<td style='text-align:center' width='400px'>评审内容</td>";
					for(var i = 0; i < checker.length; i++) {
						html += "<td style='text-align:center' width='100px'>" + checker[i].expertName + "</td>";
					}
					html += "<td style='text-align:center' width='70px'>结果</td>";
					html += "<td style='text-align:center' width='75px'>评审结果</td>";
					html += "</tr>";
				
					//跨行条数
					var enterpriseRowspan = 0;
					for(var x = 0; x < list.length; x++) { //评审项
						enterpriseRowspan += list[x].packageCheckItems.length;
						//if(list[x].checkType == 1) enterpriseRowspan++;
					}
					
					for(var i = 0; i < priceChecks.length; i++) {
						if(list && list.length > 0) {
							html += "<tr>";
							html += "<td style='text-align:center;'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +" >" + priceChecks[i].enterpriseName + "</td>";
							for(var x = 0; x < list.length; x++) { //评审项
								var item = list[x].packageCheckItems;
								for(var z = 0; z < item.length; z++) { //评审内容
									if(z != 0) {
										html += "<tr>"
									};
									if(z == 0) {
										if(item.length==1 &&  x!=0 ){
											html += "<tr>";
										}
										html += "<td style='text-align:center' rowspan='" +item.length+ "'>" + list[x].checkName + "</td>";
									};
									
									html += "<td style='text-align:left'>" + item[z].checkTitle + "</td>";
									for(var e = 0; e < checker.length; e++) { //评委
										if(typeof(priceChecks[i].expertScores) != "undefined" && typeof(priceChecks[i].expertScores[checker[e].id]) != "undefined"){
										
											html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
										}else{
											html += "<td style='text-align:center'>/</td>";
										}
										
									}
																		

									if(z == 0) {										
										if(list[x].checkType == 1){
											if(priceChecks[i].expertScores){
												if(typeof(priceChecks[i].expertScores[list[x].id]) != "undefined"){
													html += "<td style='text-align:center' rowspan='" +item.length+ "'>" + (priceChecks[i].expertScores[list[x].id] || '/') + "</td>"
												}else{
													html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>"
												}
											}else{
												html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
											}
										}else{
											if(priceChecks[i].expertScores != undefined){
												if(typeof(priceChecks[i].expertScores[list[x].id]) != "undefined"){
													html += "<td style='text-align:center' rowspan='" +item.length+ "'>" + (priceChecks[i].expertScores[list[x].id]==0?"合格":"不合格") + "</td>"
												}else{
													html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
												}
												
											}else{
												html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>";
											}
											
										}
										
									};
									if(z != 0) {
										
										html += "</tr>"
									}else{
										if(item.length==1 &&  x!=0 ){
											html += "</tr>";
										}
									}
									if(x == 0 && z == 0) {
										
										if(CheckTotals.checkItem == '已完成') {
											
											for(var q = 0;q<priceCheckItems.length;q++){
												if(priceCheckItems[q].supplierId == priceChecks[i].supplierId){
													if(priceCheckItems[q].isOut==1){
														html += "<td style='text-align:center;'  value='1'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">不合格</td>";
													}else{
														html += "<td style='text-align:center;'  value='0'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">合格</td>";
													}
												}
											}
														
										}else{
											if(priceChecks[i].isOut==0){
												html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +")>不合格</td>";
												
											}else{
												//if(checkPlan == 3){ //有效数量
												if(checkPlan == 1){ //有效数量
													html += "<td style='text-align:center' "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +"><input class='iso' type='checkbox' id='isChoose_" + priceChecks[i].supplierId + "' ></td>";													
												}else{
													html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +">合格</td>";
												}
											}
										}
										
										html += "<td style='text-align:center;display:none' "+ (enterpriseRowspan>0?"rowspan='"+ enterpriseRowspan +"'":"") +"><span id='total_" + priceChecks[i].supplierId + "' value='" + (priceChecks[i].total||'')+ "'>" + priceChecks[i].total + "</sapn>"+"</td>";
										
										html += "</tr>";
									}
								}
							}
						}
					}
					
					if(orderOfferList != null){
						for(var h=0;h<orderOfferList.length;h++){
							html += "<tr>";
							html += "<td style='text-align:center;'>" + orderOfferList[h].enterpriseName + "</td>";
							html += "<td style='text-align:center;' colspan='" + (2+checker.length)+ "'>未提交资格预审申请文件</td>";
							html += "<td style='text-align:center;' >/</td>";
							html += "<td style='text-align:center;' >不合格</td>";
							html += "</tr>";
						}	
					}
				
				}
				$("#checkTotalTable").html(html + '</tbody>');
			}else{
				/*if(keepNum != ""){
					
					getList();
				}*/
				
				top.layer.alert("评委打分未完成！");
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}
			/*} else {
				top.layer.alert("价格评审未完成！");
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}*/
		}
	});
};

/*function getList(){
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckList.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: packageId,
			examType:0,
			keepNum: keepNum
		},
		async: true,
		success: function(data) {
			if(data.success){
				packageCheck = data.data;
				checkFinish();
				for(var j=0;j<packageCheck.length;j++){
					if(j != 0 &&packageCheck[j].resultType!=undefined &&packageCheck[j].resultType){
						$(".no_"+packageCheck[j].id+"").hide();
						$("#li_"+packageCheck[j].id+"").hide();
					}else{
						$(".no_"+packageCheck[j].id+"").show();
						$("#li_"+packageCheck[j].id+"").show();
					}
				}
			}
		}
	});
}*/



//提交结果-评审记录汇总
$("#savePriceCheckTotal").click(function() {

	/*if(CheckTotals.priceCheck == "未完成") {
		top.layer.alert("价格评审未完成，不能进行评审记录汇总");
		return false;
	}*/
	if(packageData.checkItem == "已完成") {
		top.layer.alert("评审记录汇总已完成");
		return false;
	}
	var checkPlace = $("#checkPlace").val();
	var checkDate = $("#checkDate").val();
	if(checkPlace.length == "") {
		top.layer.alert("请输入评审地点");
		return false;
	}
	if(checkDate.length == "") {
		top.layer.alert("请选择评审时间");
		return false;
	}
	var para = {
		projectId: ProjectData.projectId,
		packageId: packageId,
		checkPlace: checkPlace,
		checkDate: checkDate,
		itemState: '0',
		examType: 0
	};
	var count = 0; //淘汰的数量
	//if(CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) { //有打分记录
		for(var i = 0; i < CheckTotals.offers.length; i++) {
			//para['priceCheckItems[' + i + '].id'] = CheckTotals.offers[i].id;
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.offers[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = i+1;
			//if(checkPlan == 2){ //合格制
			if(checkPlan == 0){ //合格制	
				//para['priceCheckItems[' + i + '].supplierOrder'] ="1";
				
				para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.offers[i].supplierId).attr('value');
				if(para['priceCheckItems[' + i + '].isOut'] == 0){
					para['priceCheckItems[' + i + '].isChoose'] = "1"; //是候选人
				}else{
					para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人
				}
			}else{ //最多有限数量制
				//para['priceCheckItems[' + i + '].supplierOrder'] ="1";
				para['priceCheckItems[' + i + '].total'] = $("#total_" + CheckTotals.offers[i].supplierId).attr('value') || "" ;	
				
				if(CheckTotals.offers[i].isOut == 0){
					//已经淘汰的
					para['priceCheckItems[' + i + '].isOut'] = "1";
					para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人
					count++;
				}else{
					if($("#isChoose_" + CheckTotals.offers[i].supplierId).is(":checked")) { //选中 中选	
						para['priceCheckItems[' + i + '].isOut'] = "0";
						para['priceCheckItems[' + i + '].isChoose'] = "1"; //候选人						
					} else {
						para['priceCheckItems[' + i + '].isOut'] = "1";
						para['priceCheckItems[' + i + '].isChoose'] = "0"; //不是候选人
						count++;
					}
				}
				
			}
			
		}
		
		for(var j=0;j<orderOfferList.length;j++){
			para['priceCheckItems[' + (j+CheckTotals.offers.length)+ '].supplierId'] =orderOfferList[j].supplierId;
			para['priceCheckItems[' + (j+CheckTotals.offers.length)+ '].supplierOrder'] = j+CheckTotals.offers.length+1;
			para['priceCheckItems[' + (j+CheckTotals.offers.length)+ '].isOut'] = "1"; //淘汰
			para['priceCheckItems[' + (j+CheckTotals.offers.length)+ '].isChoose'] = "0"; //不是是候选人
			para['priceCheckItems[' + (j+CheckTotals.offers.length)+ '].remark'] = "未提交资格预审申请文件"; //备注
		}
		
	/*} else {
		for(var i = 0; i < CheckTotals.priceChecks.length; i++) {
			para['priceCheckItems[' + i + '].supplierId'] = CheckTotals.priceChecks[i].supplierId;
			para['priceCheckItems[' + i + '].supplierOrder'] = $("#supplierOrder_" + CheckTotals.priceChecks[i].supplierId).val();
			para['priceCheckItems[' + i + '].isOut'] = $("#isOut_" + CheckTotals.priceChecks[i].supplierId).attr('value');
			
			if($("#isChoose_" + CheckTotals.priceChecks[i].supplierId).is(":checked")) { //选中  
				para['priceCheckItems[' + i + '].isChoose'] = "1";
			} else {
				para['priceCheckItems[' + i + '].isChoose'] = "0";
			}
		}
	}*/
	
	//if(checkPlan == 3){ //有效数量
	if(checkPlan == 1){ //有效数量
		if((CheckTotals.offers.length-count) > keepNum){
			parent.layer.confirm('温馨提示：当前中选供应商数量超过最多保留供应商数，是否确定提交', {
			  btn: ['是', '否'] //可以无限个按钮
			}, function(index, layero){
				savePrice(para);
				parent.layer.close(index);					 
			}, function(index){
			   parent.layer.close(index);
			});
		}else{
			if(CheckTotals.isAllOut==1){
				savePrice(para);	
			}else{
				if((CheckTotals.offers.length-count)==0){
					parent.layer.confirm('温馨提示：未勾选候选人，所有供应商将会被淘汰，是否确定提交', {
					  btn: ['是', '否'] //可以无限个按钮
					}, function(index, layero){
						savePrice(para);
						parent.layer.close(index);					 
					}, function(index){
					   parent.layer.close(index);
					});
				}else{
					savePrice(para);
				}
			}
						
		}
	}
	else{
		savePrice(para);
	}
});

function savePrice(para){
	if($("#checkRemark") && $("#checkRemark").val().length > 0) {
		para.checkRemark = $("#checkRemark").val();
	}
	$.ajax({
		type: "post",
		url: url + "/PriceCheckTotalController/savePriceCheckTotal.do",
		data: para,
		async: false,
//		beforeSend: function() {
//			$('#savePriceCheckTotal').attr("disabled", true);
//		},
		success: function(data) {
			if(data.success) {
//				window.location.reload();
				$("#myTab li").removeClass('active');
				$("li[value='#PriceCheckTotal']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#PriceCheckTotal").addClass("show");
				$('#savePriceCheckTotal').removeAttr("disabled");
				$('.titleReady').hide()
				$('#savePriceCheckTotal').attr("disabled", true);
				$('#checkPlace').attr("disabled", true);
				$('#checkDate').attr("disabled", true);
				$('#checkRemark').attr("disabled", true);
				$(".iso").attr("disabled", true);
				
				packageData.checkItem = "已完成";
				top.layer.alert("提交成功");
			} else {
				$('#savePriceCheckTotal').removeAttr("disabled");
				packageData.checkItem = "未完成";
				if(data.message){
					top.layer.alert(data.message);
				}else{
					top.layer.alert("提交失败");
				}
			}
		},
		error: function(err) {
			$('#savePriceCheckTotal').removeAttr("disabled");
		}
	});
}
$('#editReport').on('click',function(){
	if(packageData.checkItem == "未完成") {
		top.layer.alert("评审汇总未完成无法生成评审报告");
		return false;
	}
	if(packageData.checkReport == "已完成") {
		top.layer.alert("评审报告已生成");
		return false;
	}
	top.layer.open({
		type: 2,
		title: "编辑报告",
		area: ['100%', '100%'],		
		content:'Auction/common/Agent/ReportCheck/editReport.html',
		success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.edit(ProjectData.projectId,ProjectData.packageId,0,checkRemark)
       },
	});
})
//生成报告-评审记录汇总
$("#generateReport").click(function() {
	if(packageData.checkItem == "未完成") {
		top.layer.alert("评审汇总未完成无法生成评审报告");
		return false;
	}
	if(packageData.checkReport == "已完成") {
		top.layer.alert("评审报告已生成");
		return false;
	}
	var index = top.layer.load(0, {
		shade: false
	});
	$.ajax({
		type: "post",
		url: url + "/WaitCheckProjectController/produceProjectCheckResultPdf.do",
		data: {
			'projectId': ProjectData.projectId,
			'packageId': ProjectData.packageId,			
			'examType': 0,
			'itemState': "0"
		},
		success: function(data) {
			top.layer.close(index);
			if(data.success) {
				$("#generateReport").attr("disabled", true);
				$("#generateReport").css("pointer-events", "none");
				$("#editReport").attr("disabled", true);
				$("#editReport").css("pointer-events", "none");
								//重新获取按钮值
				$.ajax({
					type: "post",
					url: url + "/ProjectReviewController/getPriceCheckTotal.do",
					data: {
						projectId: packageData.projectId,
						packageId: packageData.packageId,
						examCheckType:1,
						checkPlan: checkPlan
					},
					async: true,
					success: function(data) {
						CheckTotals = data.data;
					}
				});
				top.layer.alert("生成成功");
			} else {
				if(data.message){
					top.layer.alert(data.message);
				}else{
					top.layer.alert("生成失败");
				}
			}
		},
		error: function(err) {
			top.layer.alert("生成失败");
			top.layer.close(index);
		}
	});
});

//预览
$("#viewCheckReport").click(function() {
	if(CheckTotals.checkReport == '已完成') {
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
		previewPdf(CheckTotals.checkReports[0].reportUrl);
	} else {
		top.layer.alert("评审报告未生成！");
	}
});
function viewCheckReport(reportUrl){
	previewPdf(reportUrl);
}
//下载
$("#downloadCheckReport").click(function() {
	if(CheckTotals.checkReport == '已完成') {
		window.open($.parserUrlForToken(top.config.bidhost + "/FileController/download.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl + "&fname=" + packageData.packageName + "_评审报告"));
	} else {
		top.layer.alert("评审报告未生成！");
	}
});

$('#checkDate').datetimepicker({
	step:5,
	lang:'ch',
	format: 'Y-m-d H:i:s',	
});

//评审报告
function CheckReport(data) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			examCheckType:1,
			checkPlan: checkPlan
		},
		async: true,
		success: function(data) {
			if(data.data.checkReport == '已完成') {
				
				data = data.data.checkReports;
				
				$("#CheckReportTable").bootstrapTable({
					data: data,
					columns: [{
						title: '序号',
						width: '50px',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},
						formatter: function(value, row, index) {
							return index + 1;
						}
					}, {
						title: '评审报告',
						align: 'center',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},
						formatter: function(value, row, index) {
							return packageData.packageName + "_评审报告";
						}
					}, {
						title: '操作',
						width: '100px',
						align: 'center',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},
						formatter: function(value, row, index) {
							var btn="<a class='btn btn-primary btn-xs' style='margin-right:5px' href='" + $.parserUrlForToken(url + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + packageData.packageName + "_评审报告") + "'>下载</a><a class='btn btn-primary btn-xs' onclick=viewCheckReport(\""+ row.reportUrl +"\") href='javascript:void(0)'>预览</a>";
							return btn						
						}
					}, {
						field: 'isCheck',
						title: '审核',
						width: '150px',
						align: 'center',
						formatter: function(value, row, index) {
							if(row.isCheck == "2") {
								return "<div><label class='text-success'>审核通过</label></div>"
							} else if(row.isCheck == "3") {
								return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn btn-primary subAudit btn-xs'>重新提交</button></div>";
							} else if(row.isCheck == "0") {
								return "<div id='submitCheckReport'><button onclick='subAudit(this)' class='btn btn-primary subAudit btn-xs'>提交审核</button></div>";
							} else if(row.isCheck == "4") {
								return "<div><label class='text-warning'>审核中</label></div>"
							}
						}
					}]
				});
			} else {
				top.layer.alert("评审报告未生成！");
				$("#myTab li").removeClass('active');
				$("a[href='#progress']").parent().addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#progress").addClass("show");
			}
		}
	});
}

//提交审核
function subAudit(button, index) {
	//	console.log(button);
	//	console.log(packageId);
	//	console.log(ProjectData.projectId);
	$.ajax({
		url: top.config.bidhost + "/WorkflowController/findWorkflowCheckerByType.do",
		type: 'get',
		dataType: 'json',
		async: false,
		data: {
			"workflowLevel": 0,
			"workflowType": "psbg"
		},
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) {
				top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
					$.ajax({
						url: top.config.bidhost+ "/CheckReportController/saveCheckForCheckReport.do",
						type: "post",
						data: {
							projectId: ProjectData.projectId,
							packageId: packageId,
							examType:0,
							level: 9
						},
						dataType: "json",
						success: function(data) {
							if(data.success) {
								$("#submitCheckReport").html("<label class='text-warning'>审核中</label>");
								window.location.reload();
								top.layer.msg("提交成功");
							} else {
								top.layer.alert("提交失败:" + data.message);
							}
						}
					})
				});
			} else if(data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请在项目审批管理中设置审核人");
				$(button).attr("disabled", true);
			} else if(data.success == true) {
				option = "<option value=''>请选择审核人员</option>"
				for(var i = 0; i < data.data.length; i++) {
					option += '<option value="' + data.data[i].employeeId + '">' + data.data[i].userName + '</option>'
				}
				sessionStorage.setItem("option", JSON.stringify(option));

				top.layer.open({
					type: 2,
					title: '请选择审核人',
					area: ['450px', '200px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					closeBtn: 1,
					content: 'Auction/common/Agent/ReportCheck/ChooseChecker.html',
					btn: ['确定', '取消'],
					scrolling: 'no',
					yes: function(index, layero) {
						var iframeWin = layero.find('iframe')[0].contentWindow;
						var checkerId = iframeWin.btnSubmit();

						if(checkerId == "") {
							top.layer.alert("请选择审核人！");
							return;
						}
						$.ajax({
							url: top.config.bidhost+ "/CheckReportController/saveCheckForCheckReport.do",
							type: "post",
							data: {
								employeeId: checkerId,
								projectId: ProjectData.projectId,
								packageId: packageId,
								examType:0,
								level: 1
							},
							dataType: "json",
							success: function(data) {
								top.layer.close(index);
								if(data.success) {
									$("#submitCheckReport").html("<label class='text-warning'>审核中</label>");
									window.location.reload();
									top.layer.msg("提交成功");
								} else {
									top.layer.alert("提交失败:" + data.message);
								}
							}
						})
					}
				});
			}
		}
	});
}
//评审澄清
function bindRaterAsks(packageData) {
	var strUlHtml='<div id="divsd">'
	strUlHtml += "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_'>"
	strUlHtml +="<ul id='raterAsksTab' class='nav nav-tabs' style='border-top: 0px solid;'>";
	for(var i = 0; i < packageData.enterprises.length; i++) {
		if(i == 0) {
			strUlHtml += "<li class='active' onclick='raterAsksbtn(\""+ packageData.enterprises[i].supplierId +"\")'>";
		} else {
			strUlHtml += "<li onclick='raterAsksbtn(\""+ packageData.enterprises[i].supplierId +"\")'>";
		}
		strUlHtml += "<a href='#raterAsks_" + packageData.enterprises[i].supplierId + "' data-toggle='tab'>" + packageData.enterprises[i].enterpriseName + "</a>";
		strUlHtml += "</li>";
	}
	strUlHtml +="</ul>";
	strUlHtml +="</div>";
	strUlHtml +='<button type="button" class="btn btn-default" id="perv_" style="width: 40px;height: 40px;margin: 0px;"><<</button>'
	strUlHtml +='<button type="button" class="btn btn-default" id="next_" style="width: 40px;height: 40px;margin: 0px;">>></button>'
	strUlHtml += "<div id='raterAsksTabContent' class='tab-content' style='float:left;width: 100%;'>";
	strUlHtml += "<div style='margin: 5px;'>供应商互动提问 <span style='color: red;'>温馨提示：评审委员会可以要求供应商进行澄清说明，所有澄清问题的提出与答复均在本页面在线完成</span></div>";
	strUlHtml += "<div style='width: 100%;height: 450px; border: 1px #ddd solid;' id='TabContent'>";
					
	strUlHtml += "</div>";
	strUlHtml += "</div>";
	$("#raterAsks").html(strUlHtml);
	var liList=[]
		$("#raterAsksTab li").each(function(){
		liList.push($(this).width())
		})					
		if(eval(liList.join('+'))+packageData.enterprises.length*2>=$("#divsd").width()){
		$("#perv_").show();
		$("#next_").show();
		$("#ulTab_").width($("#divsd").width()-80)
		$("#raterAsksTab").width(eval(liList.join('+'))+packageData.enterprises.length*4);
		}else{
		$("#perv_").hide();
		$("#next_").hide();
		$("#ulTab_").width('100%')
		$("#raterAsksTab").width('100%');
		}					 
		
		var moveIndex = 0;
	$("#perv_").on('click',function(){	
		moveIndex < 0 ? moveIndex++ : moveIndex = 0
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})
		
	})
	$("#next_").on('click',function(){	
		-($("#raterAsksTab").css('width').slice(0, -2) - $("#divsd").width()) < $("#raterAsksTab").css('margin-left').slice(0, -2) ? moveIndex-- : ''
		$("#raterAsksTab").stop().animate({
			'marginLeft': moveIndex * 120
		})
		
	})
	raterAsksbtn(packageData.enterprises[0].supplierId); 
}
function raterAsksbtn(uid){
	var strDivContentHtml = "";
	strDivContentHtml += "<div style='overflow-y:scroll;height:400px' id='messageDiv_" + uid + "'>";	
	strDivContentHtml += "</div>";
	strDivContentHtml += "<div style='width: 100%;' class='isShowRaterAsks'>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='refresh(\"" + uid + "\")'>刷新</a>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='automaticRefresh(\"" + uid + "\")' id='automaticRefresh_" + uid + "'>自动刷新</a>";
	strDivContentHtml += "</div>";
	
	$("#TabContent").html(strDivContentHtml);
	refresh(uid);
	if(packageData.isStopCheck == 1) {
		$(".btn").hide();
		$('input').attr('disabled',true);
		$('button').attr('disabled',true);
	}
	//点击tab加载对应数据
	$("#raterAsksTab").on("click", "li", function(e) {
		$("#raterAsksTab li").removeClass('active');
		$(this).addClass('active');
		var contentdiv = $(this).children("a")[0].hash;
		$("#raterAsksTabContent div").removeClass('show');
		$(contentdiv).addClass("show");
		//$(contentdiv).scrollTop($(contentdiv)[0].scrollHeight);
	});
	
}
//查看附件
function viewFiles(id) {
	top.layer.open({
		type: 2,
		title: "查看澄清回复附件",
		area: ['600px', '400px'],
		btn: ["关闭"],
		content: $.parserUrlForToken('Auction/common/Expert/JudgesScore/ShowFilelist.html') + '&id=' + id
	});
}


//刷新
function refresh(supplierId) {
	$.ajax({
		type: "post",
		url: url + "/RaterAskController/findRaterAskList.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageId,
			examType: 0,
			roleType: "0"
		},
		beforeSend: function(xhr){
	       var token = $.getToken();
	       xhr.setRequestHeader("Token",token);
	
	    },
		success: function(data) {
			if(data.success) {
				var data = data.data;
				var strDivHtml = "";
				for(var i = 0; i < data.length; i++) {
					if(supplierId == data[i].supplierId) {
						if(typeof(data[i].answerId) == "undefined") {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：<c style='color:red'>未答复</c></span></br></br>";
						} else {
							strDivHtml += "<span>提问人：" + data[i].raterName + "</span></br>";
							strDivHtml += "<span>提问内容：" + data[i].askContent + "</span></br>";
							strDivHtml += "<span>提问时间：" + data[i].askDate + "</span></br>";
							strDivHtml += "<span>答复内容：" + data[i].answerContent + "</span></br>";
							strDivHtml += "<span>答复时间：" + data[i].answerDate + "</span></br>";
							strDivHtml += "<span>答复附件：<a href='#' onclick='viewFiles(\""+data[i].id+"\")' >查看附件</a></span></br></br>";
						}

					}
				}
				$("#questionsContent_" + supplierId).val("");
				$("#messageDiv_" + supplierId).html(strDivHtml);
				$('#messageDiv_' + supplierId).scrollTop($("#messageDiv_" + supplierId)[0].scrollHeight);
				if(data.length > 0 && data[0].checkReport == 1) {
					$(".isShowRaterAsks").hide();
					$("#btnDeleteRaterAsk").hide();
				}
			}
		}
	});
}

//自动刷新
var isAutomaticRefresh = false;
var timer;

function automaticRefresh(supplierId) {
	isAutomaticRefresh = !isAutomaticRefresh;
	if(isAutomaticRefresh) {
		$("#automaticRefresh_" + supplierId).html("取消刷新");
		timer = setInterval(function() {
			refresh(supplierId);
		}, 1000)
	} else {
		$("#automaticRefresh_" + supplierId).html("自动刷新");
		clearInterval(timer);
	}
}
$('#viewReason').click(function(){
		top.layer.open({
			type: 1,
			title: "查看流标原因",
			area: ['600px', '400px'],
			btn: ["关闭"],
			content: '<pre style="color: #333;background: #fff;border: none;white-space: pre-wrap;white-space: -moz-pre-wrap;white-space: -pre-wrap;white-space: -o-pre-wrap;*word-wrap: break-word;*white-space : normal ; ">'+ packageData.stopCheckReason +'</pre>'
		});
})
//包件评审结束
$("#StopCheck").click(function() {
	getData();
	if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined&&packageData.stopCheckSource==1){		
		top.layer.confirm("温馨提示:流标后该包件将作废,是否同意流标?", function(indexs) {	
			$.ajax({
				type: "post",
				url: url + "/ProjectReviewController/setIsStopCheck.do",
				data: {
					id: packageId,
					isStopCheck: 1,
					stopCheckReason:packageData.stopCheckReason,
					examType:0
				},
				async: true,
				success: function(data) {
					if(data.success) {
						window.location.reload();
						top.layer.alert("流标成功");
						parent.layer.close(indexs);
					} else {
						top.layer.alert(data.message);
					}
				}
			});
		})
	}else{
		if(packageData.checkItemInfos.length>0){
			top.layer.alert("温馨提示:专家已打分,无法流标");		
			return
		}
		top.layer.confirm("温馨提示:流标后该包件将作废,是否确定流标?", function(indexs) {
			parent.layer.close(indexs);
			parent.layer.prompt({
				title: '请输入流标原因',
				formType: 2
			}, function(text, index) {
				if(text==""){
					top.layer.alert('请填写流标原因');
					
					return
				}
				$.ajax({
					type: "post",
					url: url + "/ProjectReviewController/setIsStopCheck.do",
					data: {
						id: packageId,
						isStopCheck: 1,
						stopCheckReason:text,
						examType:0
					},
					async: true,
					success: function(data) {
						if(data.success) {
							window.location.reload();
							top.layer.alert("流标成功");
						} else {
							top.layer.alert(data.message);
						}
					}
				});
				parent.layer.close(index);
				});		
		});
	}	
})

/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}