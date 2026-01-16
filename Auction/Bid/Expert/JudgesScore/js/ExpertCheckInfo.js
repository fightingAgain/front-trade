//访问路径
var url = top.config.bidhost;
var loadFile = top.config.bidhost + "/FileController/download.do"; //文件下载
var viewpackage='Auction/common/Agent/Purchase/model/viewPackage.html';
var urlPurchaseInfo = "Auction/common/Supplier/Purchase/model/SupplierPurchaseInfo.html";
//项目id
var projectId = getUrlParam("projectId");
//包件id
var packageId = getUrlParam("packageId");
//评审方式    0综合评分法   1最低评标价法
var checkPlan = getUrlParam("checkPlan");
var tenderType = getUrlParam("tenderType");
//项目对应的专家评委的ID
var expertIds=getUrlParam("expertId")
//本页面获取的包件信息
var packageData;
var tempIsData;
var tab_id;
$(function() {
	//加载主页面请求数据
	InfoAndProjectCheck();

	//是否显示评审记录汇总
	//if(packageData.projectCheckers[0].isShowCollect == 0) {
		$("#isShowCollect").show();
	//}
	//是否显示评审报告
	if(packageData.projectCheckers[0].isShowReport == 0) {
		$("#isShowReport").show();
	}
	tabOne()		
});
//返回到第一个tab
function tabOne(){
	getData()
	$("#myTab li").removeClass('active');
	var contentdiv="";
	//是否显示清单报价
	if(packageData.projectCheckers[0].isShowOffer == 1) { //显示  
		//判断当前评委是否打分完成 ,打分完成才可以显示
		if(packageData.packageCheckStates.length >0 && packageData.packageCheckLists.length >0){
			if(packageData.packageCheckStates.length == (packageData.packageCheckLists.length * packageData.projectCheckers[0].checkerCount) ){
				$("#lidiv").show();
				$("#lidiv2").show();
				
				$("#myTab li:first-child").addClass('active');
			    contentdiv = $("#myTab li:first-child").attr("value");	
			}else{
				$("#myTab li").removeClass('active');
				$("#myTab li:nth-child(1)").addClass('active');
			    contentdiv = $("#myTab li:nth-child(1)").attr("value");	
				$("#isShowOffer").hide();
				$("#lidiv2").hide();
			}
		}else {
			offerData('PriceFile')
			$("#myTab li").removeClass('active');	
			$("#myTab li:nth-child(1)").addClass('active');
			contentdiv = $("#myTab li:nth-child(1)").attr("value");	
			$("#isShowOffer").hide();
			$("#lidiv2").hide();
		}
	
	} else if(packageData.projectCheckers[0].isShowOffer == 0){//显示
		offerData('PriceFile')
		$("#myTab li").removeClass('active');
	    $("#myTab li:nth-child(1)").addClass('active');
		contentdiv = $("#myTab li:nth-child(1)").attr("value");	
		$("#isShowOffer").show();
		$("#lidiv").show();	
		$("#lidiv2").show();
	}
	if(packageData.shadowMarks&&packageData.shadowMarks.length>0){
		$("#correspondings").show();
	}
	$("#myTabContent div").removeClass('show');
	tab_id=contentdiv.substring(1,33);
	$(contentdiv).addClass("show");
	var packageCheckLists = packageData.packageCheckLists;
	for(var i = 0; i < packageCheckLists.length; i++) {
		if(contentdiv == ("#" + packageCheckLists[i].id)) {
			insetItmeTab(packageCheckLists[i]);			
		}
	}
	var id = contentdiv.substr(1, contentdiv.length - 1);
	if($("#Tab_" + id + " li").attr('value')!=undefined&&$("#Tab_" + id + " li").attr('value')!=""){
		var liId=$("#Tab_" + id + " li").attr('value').split("_")[1];
	}	
	$("#Tab_" + id).on("click", "li", function(e) {
		$("#Tab_" + id + " li").removeClass('active');
		$(this).addClass('active');
		var contentdivdetail = $(this).attr("value");;
		$("#TabContent_" + id + " div").removeClass('show');
		$(contentdivdetail).addClass("show");		
	});
	tatile(liId);
	//是否显示项目公告
	if(packageData.isShowProject == 1) {
		$("#viewProject").hide();
	}
	
	if(packageData.isStopCheck == 1) {
		parent.layer.alert("温馨提示：该包件已流标!");
		$('input').attr('disabled',true);
		$('button').attr('disabled',true);
	}else{
		if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
			parent.layer.alert("温馨提示：该项目已申请流标!");
			$(".btn").hide();
			$('input').attr('disabled',true);
			$('button').attr('disabled',true);
		}else{
			if(packageData.checkReport=="已完成"){
				$('#StopCheck').hide();
			}else{
				$('#StopCheck').show();
			}
		};
		
	}
	$("#downloadAllFile").show();
}
//点击tab加载对应数据
$("#myTab").on("click", "li", function(e) {
	$("#myTab li").removeClass('active');
	$(this).addClass('active');
	var contentdiv = $(this).attr("value");
	tab_id=contentdiv.substring(1,33)
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");  
	switch(contentdiv) {		
		case "#PackageOffer":
			offerData('PackageOffer');
			break;
		case "#PriceFile":
			offerData('PriceFile');
			break;
		case "#subentry":
			offerData('subentry');
			break;
		case "#PriceCheck":
			PriceCheck(); //加载价格评审和评审方法
			break;
		case "#PriceCheckTotal":
			PriceCheckTotal(packageData.projectId, packageData.packageId);
			break;
		case "#CheckReport":
			CheckReport();
			break;
		case "#raterAsks":
			bindRaterAsks(packageData);
			break;
		case "#corresponding":
			corresponding(packageData.shadowMarks);
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
			if($("#Tab_" + id + " li").attr('value')!=undefined&&$("#Tab_" + id + " li").attr('value')!=null&&$("#Tab_" + id + " li").attr('value')!=""){
				var liId=$("#Tab_" + id + " li").attr('value').split("_")[1];
			}			
			$("#Tab_" + id).on("click", "li", function(e) {					
				$("#Tab_" + id + " li").removeClass('active');
				$(this).addClass('active');
				var contentdivdetail = $(this).attr("value");;
				$("#TabContent_" + id + " div").removeClass('show');
				$(contentdivdetail).addClass("show");
			    liId=$(this).attr('value').split("_")[1];
			    //tatile(liId)
			});			
			//tatile(liId)
			break;
	}
});
function tatile(liId,uid){
	$(".supplierScore_"+liId+'_'+uid).on('change',function(){
		var Score= $(this).parent().siblings().eq(3).html();
		var reg = /^(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/;
	 	if(!(reg.test(parseFloat($(this).val())))){	
			parent.layer.alert('温馨提示：分值必须大于等于零,且小数点后面最多两位小数');
			$(this).val("");	
			return false;
		};	
	 	if( parseInt($(this).val()) >parseInt(Score)){	 		
	 		parent.layer.alert('不能超过'+Score+'分');	
	 		$(this).val("")
	 		return;
	 	}
		var result=[]; 				
		$(".supplierScore_"+liId+'_'+uid).each(function(){
			if($(this).val()!==""){
				 result.push($(this).val()*100000000);
			}		        
		});				
		var resultL=eval(result.join('+'))/100000000;
		$('.totleScore_'+liId+'_'+uid).html(resultL)
	})
}
//调用接口，读取页面信息
function InfoAndProjectCheck() {
	$.ajax({
		type: "get",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			roleType: 2
		},
		async: false,
		success: function(data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);
			packageData = data.data;
			if(packageData.checkPlan==0){
				$("#checkPlan").html('综合评分法');
				$('.deviateNum').hide();
				$(".checkPlan").attr('colspan','3')
			} 
            if(packageData.checkPlan==1){
            	$("#checkPlan").html('最低评标价法');
            	$('.deviateNum').show();
            	$('#deviateNum').html(packageData.deviate);
            	$(".checkPlan").attr('colspan','1')
            }
            if(packageData.checkPlan==2){
            	$("#checkPlan").html('经评审的最低价法(价格评分)');
            	$('.deviateNum').hide();
            	$(".checkPlan").attr('colspan','3')
			}
			if(packageData.checkPlan==3){
            	$("#checkPlan").html('最低投标价法');
            	$('.deviateNum').show();
            	$('#deviateNum').html(packageData.deviate);
            	$(".checkPlan").attr('colspan','1')
			}
			if(packageData.checkPlan==4){
				$("#checkPlan").html('经评审的最高投标价法');
				$('.deviateNum').show();
				$('#deviateNum').html(packageData.deviate);
				$(".checkPlan").attr('colspan','1')
			}
			if(packageData.checkPlan==5){
				$("#checkPlan").html('经评审的最低投标价法');
				$('.deviateNum').show();
				$('#deviateNum').html(packageData.deviate);
				$(".checkPlan").attr('colspan','1')
			}
			if(packageData.shadowMarks&&packageData.shadowMarks.length>0){
				$("#correspondings").show();
			}
			//加载动态tab
			insertTab(packageData);

			//默认加载第一个tab，清单报价
			offerData('PackageOffer')		
			//PackageOffer(packageData); //供应商报价
			//offerDetaileds(packageData.offerDetaileds); //报价详情
			//packageDetaileds(packageData); //询比采购清单
		}
	});
}

//只重新获取主数据，进度
function getData() {
	$.ajax({
		type: "get",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			roleType: 2
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
		if(packageData.doubleEnvelope==1){
			strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
			strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName+(data[i].envelopeLevel==1?'（第一封）':'（第二封）') + "</a>";
			strUl += "</li>";			
		}else{
			strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
			strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName+"</a>";
			strUl += "</li>";	
		}
		strdiv += "<div class='tab-pane fade' id='" + data[i].id + "'>";
		strdiv += "</div>";		
	}
	/*$("#lidiv").after(strUl);
	$("#PriceFile").after(strdiv);*/
	$("#lidiv1").before(strUl);
	$("#PriceCheck").before(strdiv);
	var liList=[]
	 $("#myTab li").each(function(){
	 	liList.push($(this).width())
	 })

	 $("#fristTab").width($("#fristTabtd").width()-$("#pervAndnext").width()-60);
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
var offerFileList;
var detaildivcenter;
var detaildiv;
var supplierData;
function insetItmeTab(packageCheckList) {
   
	//参数
	var para = {
		projectId: projectId,
		packageId: packageId,
		packageCheckListId: packageCheckList.id,
		checkerCount: packageData.projectCheckers[0].checkerCount,
		roleType: 2
	};
	//非第一个评审项时寻找上一个评审项id
	for(var i = 0; i < packageData.packageCheckLists.length; i++) {
		if(packageCheckList.id == packageData.packageCheckLists[i].id) {
			if(i != 0) {
			
				para.prePackageCheckListId = packageData.packageCheckLists[i - 1].id;
			} else {
				para.prePackageCheckListId = '';

			}
		}
	}
    para.expertId=expertIds;
    para.checkerType=1;  
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckItem.do",
		data: para,
		async: false,
		success: function(result) {			
			data = result.data;
			if(result.success) {
				if(data.checkType == 4){
					let body = $("#" + packageCheckList.id).empty().append(['<div class="panel panel-info">',
					'<div class="panel-heading">',
					'<h3 class="panel-title" style="padding: 10px 0 10px 10px;">',
					'竞价结果',
					'</h3>',
					'</div>',
					function () {
						if (!data.bidPrice) {
							return '<div class="panel-body">请等待项目经理启动竞价......</div>';
						}else if (!data.bidPrice.bidpriceStatus) {
							return '<div class="panel-body">竞价中，请耐心等候......</div>';
						} else if (data.bidPrice.bidpriceStatus == 2) {
							return '<div class="panel-body">竞价已流标，原因：' + data.failReason + '</div>';
						} else if (data.bidPrice.resultSubmited==0) {
							return '<div class="panel-body">请等待项目经理提交竞价结果......</div>';	
						} else if (data.bidPrice.resultSubmited==1 && !data.bidPriceResults) {
							return '<div class="panel-body">项目经理已提交竞价结果......</div>';
						} else if (data.bidPrice.resultSubmited==1 && data.bidPriceResults) {
							let table = $('<table class="table table-bordered"></table>');
							table.bootstrapTable({
								pagination: false,
								undefinedText: "",
								height: auto,
								data: data.bidPriceResults,
								columns: [{
									field: 'bidpriceRank',
									title: '竞价排名',
									width: '80px',
									align: 'center'
								}, {
									field: 'supplierName',
									title: '供应商名称',
									align: 'center'
								}, {
									field: 'priceTotal',
									title: '报价总价',
									align: 'center'
								}, {
									field: 'bidpriceAmount',
									title: '竞价报价',
									align: 'right'
								}, {
									field: 'bidpriceNum',
									title: '竞价报价次数',
									align: 'center'
								}]
							});
							return table.prop("outerHTML")+'<hr style="margin-top:0;">'
						}else{
							return '';
						}
					}()
					].join(''));
				}else{
					if(data.suppliers.length > 0) {
						packageCheckItems = data.packageCheckItems;
						suppliers = data.suppliers;
						checkItemInfos = data.checkItemInfos;
						offerFileList=data.offerFileList;
						detaildiv=""
						//isShowCheckResult 0 显示 1不显示,checkFinish 已完成 未完成
						if(data.isShowCheckResult==0&&data.checkFinish=="已完成"){
							detaildiv += "<table id='checkResultContent_" + packageCheckList.id + "' class='tab-content table table-bordered'>";
							detaildiv += "</table>";
						}
						detaildiv += "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_"+ packageCheckList.id +"'>";					
						detaildiv += "<ul id='Tab_" + packageCheckList.id + "' class='nav nav-tabs' style='background-color:#FBFBFB;border-top: 0px solid;'>"; //供应商小的tab绑定					
						for(var j = 0; j < suppliers.length; j++) {
							if(j == 0) { //第一个选中
								detaildiv += "<li class='active' value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
								detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab("+ j +",\""+ packageCheckList.id +"\","+ packageCheckList.checkType +",\""+ packageCheckList.checkName +"\",\""+ packageCheckList.weight +"\",\""+ packageCheckList.totalType +"\")'>" + suppliers[j].enterpriseName + "</a>";
								detaildiv += "</li>";
								//detaildivcenter += "<div class='tab-pane fade spacing show' id='" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
							} else {
								detaildiv += "<li  value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
								detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab("+ j +",\""+ packageCheckList.id +"\","+ packageCheckList.checkType +",\""+ packageCheckList.checkName +"\",\""+ packageCheckList.weight +"\",\""+ packageCheckList.totalType +"\")'>" + suppliers[j].enterpriseName + "</a>";
								detaildiv += "</li>";
								//detaildivcenter += "<div class='tab-pane fade spacing' id='" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
							}
						
	//						detaildivcenter += "</table></div>";
	//						detaildivcenter += "</div>";
						}
					   
						detaildiv += "</ul>";
						detaildiv += "</div>";
						detaildiv +='<button type="button" class="btn btn-default" id="perv_'+ packageCheckList.id +'" style="width: 40px;height: 40px;margin: 0px;float: left;"><<</button>'
						detaildiv +='<button type="button" class="btn btn-default" id="next_'+ packageCheckList.id +'" style="width: 40px;height: 40px;margin: 0px;float: left;">>></button>'
						detaildiv += "<div id='TabContent_" + packageCheckList.id + "' class='tab-content'>";
						detaildiv += "</div>";
						$("#" + packageCheckList.id).html(detaildiv);	
						checkItemTab(0,packageCheckList.id,packageCheckList.checkType,packageCheckList.checkName,packageCheckList.weight,packageCheckList.totalType)
						if(packageData.isStopCheck == 1) {
							$(".btn").hide();
							$('input').attr('disabled',true);
							$('button').attr('disabled',true);
						}
						var liList=[]
						 $("#Tab_" + packageCheckList.id + " li").each(function(){
							 liList.push($(this).width())
						 })					
						 if(eval(liList.join('+'))+suppliers.length*4>=$(".table").eq(0).width()){
							 $("#perv_"+ packageCheckList.id).show();
							 $("#next_"+ packageCheckList.id).show();
							 $("#ulTab_" + packageCheckList.id).width($(".table").eq(0).width()-80)
							 $("#Tab_" + packageCheckList.id).width(eval(liList.join('+'))+suppliers.length*4);
						 }else{
							 $("#perv_"+ packageCheckList.id).hide();
							 $("#next_"+ packageCheckList.id).hide();
							 $("#ulTab_" + packageCheckList.id).width('100%')
							 $("#Tab_" + packageCheckList.id).width('100%');
						 }					 
						 
						 var moveIndex = 0;
						$("#perv_"+ packageCheckList.id).on('click',function(){	
							moveIndex < 0 ? moveIndex++ : moveIndex = 0
							$("#Tab_" + packageCheckList.id).stop().animate({
								'marginLeft': moveIndex * 120
							})
							
						})
						$("#next_"+ packageCheckList.id).on('click',function(){	
							-($("#Tab_" + packageCheckList.id).css('width').slice(0, -2) - $("#ulTab_"+packageCheckList.id).width()) < $("#Tab_" + packageCheckList.id).css('margin-left').slice(0, -2) ? moveIndex-- : ''
							$("#Tab_" + packageCheckList.id).stop().animate({
								'marginLeft': moveIndex * 120
							})
							
						})
						
						//isShowCheckResult 0 显示 1不显示,checkFinish 已完成 未完成
						if(data.isShowCheckResult==0&&data.checkFinish=="已完成"){
							supplierData=CheckResult(packageCheckList.id)
							if(suppliers.length>=5){
								var auto='225px'
							}else{
								var auto=''
							}
							$("#checkResultContent_" + packageCheckList.id).bootstrapTable({
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
										title:packageCheckList.checkType==2?'偏离项数':'不合格关键项数',															
									},{
										field:'isKeyScore' ,
										title: ((packageCheckList.checkType==1||packageCheckList.checkType==3)?'分值合计':'是否合格'),
										formatter: function(value, row, index) {
											var detaildivcenter="";
											if(packageCheckList.checkType==1||packageCheckList.checkType==3){
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
										
									},
									{
										field:'isOut' ,
										title: '是否合格',
										formatter: function(value, row, index) {
											var detaildivcenter="";
											detaildivcenter=row.score
												if(row.isKey==0){
													detaildivcenter="合格"
												}else{
													detaildivcenter="不合格"
												}
																		
											return detaildivcenter									
										}
										
									},		
								]
							});	
							$("#checkResultContent_" + packageCheckList.id).bootstrapTable('load',supplierData)										
							if(packageCheckList.checkType==2||packageCheckList.checkType==0){
								$("#checkResultContent_" + packageCheckList.id).bootstrapTable("showColumn", 'deviateNum'); //隐藏评审标准  
							}else{
								$("#checkResultContent_" + packageCheckList.id).bootstrapTable("hideColumn", 'deviateNum'); //隐藏评审标准  
							}
							if(packageCheckList.checkType==3){
								$("#checkResultContent_" + packageCheckList.id).bootstrapTable("showColumn", 'isOut'); //隐藏评审标准  
							}else{
								$("#checkResultContent_" + packageCheckList.id).bootstrapTable("hideColumn", 'isOut'); //隐藏评审标准  
							}
						}
					} else {
						top.layer.alert("所有报价供应商已全部淘汰！");
						tabOne()
						return;
					}
				}
				
			} else {
				top.layer.alert(result.message);
				tabOne()
				return;
			}
		}
	});
	
}
function CheckResult(uid){
	var data=[];
	$.ajax({
		type: "post",
		url:top.config.bidhost + '/ProjectReviewController/findSupplierCheckResult.do',
		data: {
			'projectId': projectId,
			'packageId': packageId,
			'packageCheckListId':uid,
			'examType':1
		},
		async:false,
		dataType: "json",
		success: function (response) {
			if(response.success){
				data=response.data
			}
		}
	});
	return data
}
function checkItemTab(j,uid,type,checkName,weight,totalType){	
	var datalst=data;
	$.ajax({
		   	url:url+'/ProjectReviewController/getCheckItemList.do',
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		"packageCheckListId":uid,
		   		'packageId':packageId,
		   		'examType':1,
		   		'supplierId':suppliers[j].supplierId,
		   		'expertId':expertIds
		   	},
		   	success:function(data){	
		   		if(data.success){
		   			checkItemInfos=data.data
		   		}
		   	}  
		 });
    //不同评审方式，不同table
	var isShow = true;
	var detaildivcenter = "";
	
	//评审方法&汇总方式
	switch(type) {
		case 0:
			detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：合格制 </br>";
			detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（"+(datalst.totalM || "二")+"分之"+(datalst.totalN || "一")+"）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span></div>";
			
			break;
		case 1:
			detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：评分制  权重值：" + (weight||'') +"</br>";
			//if(packageCheckList.totalType == '0') {
			//if(packageData.projectCheckers[0].checkerCount >= totalType){
			if(totalType==0){	
				detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
			} else if(totalType==1) {
				detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
			}else{
				if(packageData.projectCheckers[0].checkerCount >= totalType){
					detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
				}else{
					detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
				}
			}
				detaildivcenter +='</span></div>'
			break;
		case 2:
			detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：偏离制</br>";
			detaildivcenter += "<span style='color:red'>该评审项允许最大偏离项数："+ (datalst.deviate||"")+'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			detaildivcenter += "<span style='color:red'>是否计入总数："+ (datalst.isSetTotal==0?"计入总数":"不计入总数")+'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			if(data.isSetTotal==0){
				detaildivcenter += "<span style='color:red'>是否加价："+ (datalst.isAddPrice==0?"加价":"不加价") +'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
			}
			if(data.isAddPrice==0){
				detaildivcenter += "<span style='color:red'>偏离加价幅度："+ (datalst.addPrice||"") +"%</br>";		
			}
			detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（"+(datalst.totalM || "二")+"分之"+(datalst.totalN || "一")+"）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项偏离都将淘汰。</br>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行 ）</br>" + (data.deviate ? '该评审项偏离项数超过' + data.deviate + '项将被淘汰。' : '') + "</span></div>";
			break;
		case 3:
				detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：评分合格制</br>";				
				if(totalType==0){	
					detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
				} else if(totalType==1) {
					detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
				}else{
					if(packageData.projectCheckers[0].checkerCount >= totalType){
						detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
					}else{
						detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
					}
				}
					detaildivcenter += "</br>当最终得分低于"+ datalst.lowerScore +"分时，供应商被淘汰";
					detaildivcenter +='</span></div>'
				break;
	}
	if(checkItemInfos.length > 0) {
		for(var z = 0; z < packageCheckItems.length; z++) {
			for(var x = 0; x < checkItemInfos.length; x++) {
				if(packageCheckItems[z].id == checkItemInfos[x].packageCheckItemId && checkItemInfos[x].supplierId == suppliers[j].supplierId && checkItemInfos[x].itemState == 1) {
					isShow = false;
					break;
				}
			}
		}
	}
	switch(type) {
		case 0:
			detaildivcenter += "<div>";
			detaildivcenter += "<table class='table table-bordered'>";
			detaildivcenter += "<tr>";
			detaildivcenter += "<td colspan='3' style='background-color: #3995C8;font-weight: bold;border: none;'><font size='3' color='white' >评审文件</font></td>";
			detaildivcenter += "</tr>";
			var str="";
			if(datalst.offerFileList.length > 0){
				for(var h=0;h<datalst.offerFileList.length;h++){
					str = "";
					if(datalst.offerFileList[h].id == uid && datalst.offerFileList[h].supplierId == suppliers[j].supplierId){						
						str += "<tr>";
						str += "<td style='text-align:center;width:50px;'>"+1+"</td>";
						
						str += "<td>"+datalst.offerFileList[h].fileName+"</td>";
						
						str += "<td style='text-align: center;width:100px;'> <a href='javascript:void(0)' onclick=downloadFile("+ h +") class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a></td>";
						str += "</tr>";
						break;
					}else{
						str = "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
						//break;
					}
				}
			}else{
				detaildivcenter += "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
			}
			detaildivcenter += str;
			detaildivcenter += "</table>";
			detaildivcenter += "</div>";	
		
			//按钮
			if(isShow) {
				detaildivcenter += "<div style='text-align: right;'><a id='alltrue_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='allIskey(\"0\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'>全部合格</a>";
				detaildivcenter += "<a id='allfalse_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='allIskey(\"1\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'>全部不合格</a>";
				detaildivcenter += "<a id='save_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'>临时保存</a>";
				detaildivcenter += "<a id='sbumit_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'>提交结果</a></div>";
			}
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height: 400px;'><table class='table table-bordered itemChecks'><tr><td width='50px' style='text-align:center'>序号</td><td>评价内容</td><td width='300px'>评价标准</td><td width='120px'>是否关键要求</td><td width='200px'>备注</td><td width='100px'>是否合格</td><td width='200px'>不合格原因</td></tr>";
			//行
			for(var z = 0; z < packageCheckItems.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td>" + packageCheckItems[z].checkTitle + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td style='text-align:center'>" + (packageCheckItems[z].isKey == 0 ? "是" : "否") + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].remark || '') + "</td>";

				if(checkItemInfos.length > 0) { //有打分情况下给出打分
					var isKey = 5;
					var reason = '';
					for(var x = 0; x < checkItemInfos.length; x++) {
						if(packageCheckItems[z].id == checkItemInfos[x].packageCheckItemId && checkItemInfos[x].supplierId == suppliers[j].supplierId) {
							isKey = checkItemInfos[x].isKey;
							reason = checkItemInfos[x].reason;
						}
					}
					if(isKey == 0) { //合格
						if(isShow) {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
						} else {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' disabled='disabled'><option value=''>未选择</option><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
						}
					} else if(isKey == 1) {
						if(isShow) {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value=''>未选择</option><option value='0'>合格</option><option value='1' selected='selected'>不合格</option></select></td>";
						} else {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' disabled='disabled'><option value=''>未选择</option><option value='0'>合格</option><option value='1' selected='selected'>不合格</option></select></td>";
						}
					} else {
						if(isShow) {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value='' selected='selected'>未选择</option><option value='0'>合格</option><option value='1'>不合格</option></select></td>";
						} else {
							detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' disabled='disabled'><option value='' selected='selected'>未选择</option><option value='0'>合格</option><option value='1'>不合格</option></select></td>";
						}
					}
					if(isShow) {
						detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + (reason || '') + "'/></td></tr>";
					} else {
						detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' disabled='disabled' value='" + (reason || '') + "'/></td></tr>";
					}
				} else {
					detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value='0' selected='selected'>合格</option><option value='1'>不合格</option></select></td>";
					detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></tr>";
				}
			}
			break;
		case 1:
		case 3:
			detaildivcenter += "<div>";
			detaildivcenter += "<table class='table table-bordered'>";
			detaildivcenter += "<tr>";
			detaildivcenter += "<td colspan='3' style='background-color: #3995C8;font-weight: bold;border: none;'><font size='3' color='white' >评审文件</font></td>";
			detaildivcenter += "</tr>";
			var str="";
			if(datalst.offerFileList.length > 0){
				for(var h=0;h<datalst.offerFileList.length;h++){
					str = "";
					if(datalst.offerFileList[h].id ==uid && datalst.offerFileList[h].supplierId == suppliers[j].supplierId){
						
						str += "<tr>";
						str += "<td style='text-align:center;width:50px;'>"+1+"</td>";
						
						str += "<td>"+datalst.offerFileList[h].fileName+"</td>";
						
						str += "<td style='text-align: center;width:100px;'> <a href='javascript:void(0)' onclick=downloadFile("+ h +") class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a></td>";
						str += "</tr>";
						break;
					}else{
						str = "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
						//break;
					}
				}
			}else{
				detaildivcenter += "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
			}
			detaildivcenter += str;
			detaildivcenter += "</table>";
			detaildivcenter += "</div>";	
		
		
			//按钮
			if(isShow) {
				detaildivcenter += "<div style='text-align: right;'>";						
//				detaildivcenter += "<a id= 'loadExcel_" +  uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm ' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='loadExcel(\"" + uid + "\",\"" + suppliers[j].enterpriseName + "\",\"" + checkName + "\")'>导出评审项</a>";
//				detaildivcenter +='<span class="btn btn-primary fileinput-button btn-sm" id="importf_'+ uid +"_"+suppliers[j].supplierId+'">';
//		        detaildivcenter +='<span>导入</span>';
//		        detaildivcenter +='<input type="file"  onchange=importf(this,\"' + suppliers[j].supplierId + '\",\"' + uid + '\")>';
//		        detaildivcenter +='</span>'	;
		        detaildivcenter +="<a id='saveBtn_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='saveScore(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'>临时保存</a>";
				detaildivcenter +="<a id='submitBtn_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin-bottom: 5px;margin-right:5px' onclick='saveScore(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'>提交结果</a>";
				detaildivcenter +="</div>";	
			}
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height: 400px;'><table class='table table-bordered itemChecks'><tr><td width='50px' style='text-align:center'>序号</td><td>评价内容</td><td width='300px'>评价标准</td><td width='100px'>分值</td><td width='200px'>备注</td><td width='100px'>得分</td><tr>";
			//行
			var result=[];
			for(var z = 0; z < packageCheckItems.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td>" + packageCheckItems[z].checkTitle + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].score || '') + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].remark || '') + "</td>";

				if(checkItemInfos.length > 0) { //有打分情况下给出打分
					var score;
					for(var x = 0; x < checkItemInfos.length; x++) {
						if(packageCheckItems[z].id == checkItemInfos[x].packageCheckItemId && checkItemInfos[x].supplierId == suppliers[j].supplierId) {
							score = checkItemInfos[x].score;
							break;
						}
					}
					if(score) { //打分
						if(isShow) { //可以再提交
							detaildivcenter += "<td><input type='number' class='supplierScore supplierScore_"+ suppliers[j].supplierId +"_"+ uid +" supplierScore_"+ suppliers[j].supplierId+'_'+z +"' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + score + "'/></td>";
						} else {
							detaildivcenter += "<td><input type='number' class='supplierScore supplierScore_"+ suppliers[j].supplierId +"_"+ uid +" supplierScore_"+ suppliers[j].supplierId+'_'+z +"' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + score + "' disabled='disabled'/></td>";
						}
					    result.push(score*100000000);
					} else {
						detaildivcenter += "<td><input type='number' class='supplierScore supplierScore_"+ suppliers[j].supplierId +"_"+ uid +" supplierScore_"+ suppliers[j].supplierId+'_'+z +"' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></td>";
					}
					score = "";
					
				} else {
					detaildivcenter += "<td><input type='number' class='supplierScore supplierScore_"+ suppliers[j].supplierId +"_"+ uid +" supplierScore_"+ suppliers[j].supplierId+'_'+z +"' id='" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></td></tr>";
				}
				 
			}								
			var resultL=eval(result.join('+'))/100000000;								
			detaildivcenter +="<tr><td colspan='3' style='text-align: right;'>合计</td>"
			detaildivcenter +="<td colspan='3' style='text-align:left'><span class='red totleScore_"+ suppliers[j].supplierId +"_"+ uid +"'>"+ (resultL||"") +"</span></td></tr>"
			
			break;
		case 2:
			detaildivcenter += "<div>";
			detaildivcenter += "<table class='table table-bordered'>";
			detaildivcenter += "<tr>";
			detaildivcenter += "<td colspan='3' style='background-color: #3995C8;font-weight: bold;border: none;'><font size='3' color='white' >评审文件</font></td>";
			detaildivcenter += "</tr>";
			var str="";
			if(datalst.offerFileList.length > 0){
				for(var h=0;h<datalst.offerFileList.length;h++){
					str = "";
					if(datalst.offerFileList[h].id == uid && datalst.offerFileList[h].supplierId == suppliers[j].supplierId){
						str += "<tr>";
						str += "<td style='text-align:center;width:50px;'>"+1+"</td>";
						
						str += "<td>"+datalst.offerFileList[h].fileName+"</td>";
						
						str += "<td style='text-align: center;width:100px;'> <a href='javascript:void(0)' onclick=downloadFile("+ h +") class='btn-sm btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a></td>";
						str += "</tr>";
						break;
					}else{
						str = "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
						//break;
					}
				}
			}else{
				detaildivcenter += "<tr><td colspan='3' style='text-align:center'>无上传评审文件信息</td></tr>";
			}
			detaildivcenter += str;
			detaildivcenter += "</table>";
			detaildivcenter += "</div>";
		
			//按钮
			if(isShow) {
				detaildivcenter += "<div style='text-align: right;'><a id='alltrue_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='allIskey(\"0\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'>全部未偏离</a>";
				detaildivcenter += "<a id='allfalse_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='allIskey(\"1\",\"" + suppliers[j].supplierId + "\",\"" + uid + "\")'>全部偏离</a>";
				detaildivcenter += "<a id='save_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"0\")'>临时保存</a>";
				detaildivcenter += "<a id='sbumit_" + uid + "_" + suppliers[j].supplierId + "' type='button' class='btn btn-primary btn-sm' style='text-decoration: none;margin: 5px 5px 5px 0px;' onclick='sbumitIskey(\"" + suppliers[j].supplierId + "\",\"" + uid + "\",\"" + type + "\",\"1\")'>提交结果</a></div>";
			}
			//表头
			detaildivcenter += "<div style='overflow-y: auto;max-height: 400px;'><table class='table table-bordered itemChecks'><tr><td width='50px' style='text-align:center'>序号</td><td>评价内容</td><td width='300px'>评价标准</td><td width='120px'>是否关键要求</td><td>备注</td><td width='100px'>是否偏离</td><td width='200px'>偏离原因</td></tr>";
			//行
			for(var z = 0; z < packageCheckItems.length; z++) {
				detaildivcenter += "<tr><td style='text-align:center'>" + (z + 1) + "</td><td>" + packageCheckItems[z].checkTitle + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].checkStandard || '') + "</td>";
				detaildivcenter += "<td style='text-align:center'>" + (packageCheckItems[z].isKey == 0 ? "是" : "否") + "</td>";
				detaildivcenter += "<td>" + (packageCheckItems[z].remark || '') + "</td>";

				if(checkItemInfos.length > 0) { //有打分情况下给出打分
					var isKey = 5;
					var reason = '';
					for(var x = 0; x < checkItemInfos.length; x++) {
						if(packageCheckItems[z].id == checkItemInfos[x].packageCheckItemId && checkItemInfos[x].supplierId == suppliers[j].supplierId) {
							isKey = checkItemInfos[x].isKey;
							reason = checkItemInfos[x].reason;
							break;
						}
					}
					if(isKey != 5) {
						if(isKey == 0) {
							if(isShow) {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value=''>未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
							} else {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'  disabled='disabled'><option value=''>未选择</option><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
							}

						} else if(isKey == 1) {
							if(isShow) {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value=''>未选择</option><option value='0'>未偏离</option><option value='1' selected='selected'>偏离</option></select></td>";
							} else {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'  disabled='disabled'><option value=''>未选择</option><option value='0'>未偏离</option><option value='1' selected='selected'>偏离</option></select></td>";
							}
						} else {
							if(isShow) {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value='' selected='selected'>未选择</option><option value='0'>未偏离</option><option value='1'>偏离</option></select></td>";
							} else {
								detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'  disabled='disabled'><option value='' selected='selected'>未选择</option><option value='0'>未偏离</option><option value='1'>偏离</option></select></td>";
							}
						}
						if(isShow) {
							detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + (reason || '') + "'/></tr>";
						} else {
							detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "' value='" + (reason || '') + "' disabled='disabled'/></tr>";
						}
					} else {
						detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value='' selected='selected'>未选择</option><option value='0'>未偏离</option><option value='1'>偏离</option></select></td>";
						detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></tr>";
					}
				} else {
					detaildivcenter += "<td><select id='isKey_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'><option value='0' selected='selected'>未偏离</option><option value='1'>偏离</option></select></td>";
					detaildivcenter += "<td><input type='text' id='reason_" + suppliers[j].supplierId + "_" + packageCheckItems[z].id + "'/></tr>";
				}
			}
			break;
	}
	
	$("#TabContent_"+uid).html(detaildivcenter);
	tatile(suppliers[j].supplierId,uid);
}
//文件下载
function downloadFile(h) {
	var newUrl = loadFile + "?ftpPath=" + data.offerFileList[h].filePath + "&fname=" +data.offerFileList[h].fileName;
	window.location.href = $.parserUrlForToken(newUrl);
}
function loadExcel(uid,enterpriseName,checkName){
	var urls = url + "/PackageCheckItemController/outPackageCheckItemByExcel.do?packageCheckListId="+uid+'&exclName='+enterpriseName+checkName+'的评审打分';
	window.location.href =$.parserUrlForToken(urls);	
}
$("#downloadAllFile").click(function(){
	var newUrl=$.parserUrlForToken(top.config.bidhost+"/ProjectReviewController/downloadAllPurFile.do?projectId="+projectId+"&packageId="+packageId+"&examType=1")
	window.location.href = newUrl;
});
$("#fileCheck").click(function(){
	var newUrl=$.parserUrlForToken(top.config.bidhost+"/ProjectReviewController/downloadPurFile.do?projectId="+projectId+"&packageId="+packageId+"&examType=1")
	window.location.href = newUrl;
});
//excel导入

 /*
    FileReader共有4种读取方法：
    1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
    2.readAsBinaryString(file)：将文件读取为二进制字符串
    3.readAsDataURL(file)：将文件读取为Data URL
    4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
                 */
    var wb;//读取完成的数据
    var rABS = false; //是否将文件读取为二进制字符串
    function importf(obj,uid,gid) {//导入
    	if(obj==null) {
        	
            return;
        }; 
		
    	var f = obj.files[0];
        var index1=f.name.lastIndexOf(".");
		var index2=f.name.length;
		var FilesName=f.name.substring(index1+1,index2)
        if(FilesName=='xlsx'&&FilesName=='xls'){
        	
        	parent.layer.alert("上传文件格式错误")
        	return
        }
        wb="";
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            if(rABS) {
                wb = XLSX.read(btoa(fixdata(data)), {//手动转化
                    type: 'base64'
                });
            } else {
                wb = XLSX.read(data, {
                    type: 'binary'
                });
            };
            	//wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
            	//wb.Sheets[Sheet名]获取第一个Sheet的数据          
           		wb.Sheets[wb.SheetNames[0]]['!ref']="A2:G100"
           		var excelData=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) 
                //wb.Sheets[wb.SheetNames[0]]['!ref']="A2:G100"
                if(excelData.length==0){
                	parent.layer.alert("上传文件为空值")
                	return
                }else{
                	var result=[]; 
                	for(var i=0;i<excelData.length;i++){
                  	   if(excelData[i]['得分']==""||!(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test(excelData[i]['得分']))){
			 	 	    	$('.supplierScore_'+uid+'_'+i).val(0)
			 	 	    }else{
			 	 	    	$('.supplierScore_'+uid+'_'+i).val(excelData[i]['得分'])
			 	 	    }
			 	 	      result.push(excelData[i]['得分']*100000000);
                  	}
                	var resultL=eval(result.join('+'))/100000000;	
                	$(".totleScore_"+ uid+"_"+gid).html(resultL);
                	$('input[type="file"]').val("");
                }                                  						
		        };
        if(rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
        wb="";
    }

    function fixdata(data) { //文件流转BinaryString
        var o = "",
            l = 0,
            w = 10240;
        for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }
//评委保存评分  综合评分法
function saveScore(supplierId, packageCheckListId, checkType, itemState) {
	//var mask =parent.layer.load(0, {shade: [0.3, '#000000']});
	var data = packageCheckItems;
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId) {
			if(itemState == 1) {
				if($("#" + supplierId + "_" + data[i].id).val() == "") {
					top.layer.alert("请输入第"+(i+1)+"项的完整打分");
					return false;
				}
				if(parseInt($("#" + supplierId + "_" + data[i].id).val()) > parseInt(data[i].score)) {
					top.layer.alert("第"+(i+1)+"项的得分大于分值");
					return false;
				}
			}
		}
	}
	var tempKey="";
	var tempId="";
	var tempPackageCheckItemId = "";
	var tempScore = "";
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId) {
			if(i == 0){				
				if($("#" + supplierId + "_" + data[i].id).val()){
					tempScore = $("#" + supplierId + "_" + data[i].id).val().replace(/\s*/g,"");
				}else{
					tempScore = "~";
				}
				tempKey = "~";
				tempPackageCheckItemId = data[i].id;
			}
			else{				
				if($("#" + supplierId + "_" + data[i].id).val()){
					tempScore += "@" + $("#" + supplierId + "_" + data[i].id).val().replace(/\s*/g,"");
				}else{
					tempScore += "@" + "~";
				}
				tempKey += "@" + "~";
				tempPackageCheckItemId += "@" + data[i].id;
			}
			if(checkItemInfos.length > 0) {
				for(var y = 0; y < checkItemInfos.length; y++) {
					if(checkItemInfos[y].supplierId == supplierId && data[i].id == checkItemInfos[y].packageCheckItemId) {
						if(tempId == ""){
							if(checkItemInfos[y].id){
								tempId = checkItemInfos[y].id;
							}else{
								tempId = "~";
							}
							
						}else{
							if(checkItemInfos[y].id){
								tempId += "@" + checkItemInfos[y].id;
							}else{
								tempId += "@" + "~";
							}
						}
					}
				}
			}
			
		}
	}
	
	var para = {
		"supplierCount":suppliers.length,
		"expertId":expertIds,
		"checkType":checkType,
		"projectId":projectId,
		"packageId":packageId,
		"supplierId":supplierId,
		"packageCheckListId":packageCheckListId,
		"isKey":tempKey,
		"reason":"",
		"score":tempScore,
		"packageCheckItemId":tempPackageCheckItemId,
		"itemState":itemState,
		"tempKey":"",
		"id":tempId,
		"tempType" : 1,
		"examType":1
	};
	$.ajax({
		type: "post",
		url: url + "/WaitCheckProjectController/judgesScore.do",
		data: para,
		success: function(ret) {
			//parent.layer.close(mask);
			if(ret.success) //执行保存方法
			{
				//top.layer.alert("提交成功");
				if(itemState == 1) {
					$("#saveBtn_" + packageCheckListId + "_" + supplierId).hide();
					$("#loadExcel_" + packageCheckListId + "_" + supplierId).hide();
					$("#importf_" + packageCheckListId + "_" + supplierId).hide();					
					$("#submitBtn_" + packageCheckListId + "_" + supplierId).hide();
					for(var i = 0; i < packageCheckItems.length; i++) {
						$("#" + supplierId + "_" + data[i].id).attr("disabled", "disabled");
					}
				} else {
					top.layer.alert("保存成功");
				}
				getData()
				if(packageData.doubleEnvelope==1){
					
					for(var i = 0; i < packageData.packageCheckLists.length; i++) { //评审项目循环  大的tab绑定
						$('#li_' + packageData.packageCheckLists[i].id ).remove();	
					}				
					insertTab(packageData)
				}
				if(packageData.shadowMarks&&packageData.shadowMarks.length>0){
					// for(var i = 0; i < packageData.packageCheckLists.length; i++) { //评审项目循环  大的tab绑定
					// 	if(tab_id == packageData.packageCheckLists[i].id) {
					// 		insetItmeTab(packageData.packageCheckLists[i]);
					// 		break;
					// 	}	
					// }
					$("#correspondings").show();
				}
				$("#myTab li").removeClass('active');
				$('#li_'+tab_id).addClass('active');
				$("#myTabContent div").removeClass('show');
				$('#'+tab_id).addClass("show");
			} else {
				top.layer.alert(ret.message);
			}
		}
	});
}

//全部合格||全部不合格
function allIskey(key, supplierId, packageCheckLists) {
	var data = packageCheckItems;
	for(var i = 0; i < data.length; i++) {
		if(packageCheckLists == packageCheckItems[i].packageCheckListId) {
			$("#isKey_" + supplierId + "_" + data[i].id).val(key);
		}
	}
}

//点击提交结果  最低评标价法
function sbumitIskey(supplierId, packageCheckListId, checkType, itemState) {
	var data = packageCheckItems;
	if(itemState == 1) {
		for(var i = 0; i < data.length; i++) {
			if(packageCheckListId == data[i].packageCheckListId) {
				if($("#isKey_" + supplierId + "_" + data[i].id).val() == "") {
					top.layer.alert("请完善打分结果再提交");
					return false;
				}
				if($("#isKey_" + supplierId + "_" + data[i].id).val() == "1" && $("#reason_" + supplierId + "_" + data[i].id).val() == '') {
					top.layer.alert("请填写第" + (i + 1) + "项不合格或偏离原因再提交");
					return false;
				}
			}
		}
	}
	
   var tempIsKey="";
	var tempReason="";
	var tempKey="";
	var tempId="";
	var tempPackageCheckItemId = "";
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId && $("#isKey_" + supplierId + "_" + data[i].id).val() != "") {
			if(i == 0){
				tempIsKey = $("#isKey_" + supplierId + "_" + data[i].id).val();
				if($("#reason_" + supplierId + "_" + data[i].id).val()){
					tempReason = $("#reason_" + supplierId + "_" + data[i].id).val();
				}else{
					tempReason = "~";
				}
				tempKey = data[i].isKey;
				tempPackageCheckItemId = data[i].id;
			}
			else{
				tempIsKey += "@" + $("#isKey_" + supplierId + "_" + data[i].id).val();
				if($("#reason_" + supplierId + "_" + data[i].id).val()){
					tempReason += "@" + $("#reason_" + supplierId + "_" + data[i].id).val();
				}else{
					tempReason += "@" + "~";
				}
				tempKey += "@" + data[i].isKey;
				tempPackageCheckItemId += "@" + data[i].id;
			}
			if(checkItemInfos.length > 0) {
				for(var y = 0; y < checkItemInfos.length; y++) {
					if(checkItemInfos[y].supplierId == supplierId && data[i].id == checkItemInfos[y].packageCheckItemId) {
						//para['checkItemInfos[' + rowindex + '].id'] = checkItemInfos[y].id;
						if(tempId == ""){
							if(checkItemInfos[y].id){
								tempId = checkItemInfos[y].id;
							}else{
								tempId = "~";
							}
							
						}else{
							if(checkItemInfos[y].id){
								tempId += "@" + checkItemInfos[y].id;
							}else{
								tempId += "@" + "~";
							}
						}
					}
				}
			}
			
		}
	}
	
	var para = {
		"supplierCount":suppliers.length,
		"expertId":expertIds,
		"checkType":checkType,
		"projectId":projectId,
		"packageId":packageId,
		"supplierId":supplierId,
		"packageCheckListId":packageCheckListId,
		"isKey":tempIsKey,
		"reason":tempReason,
		"score":0,
		"packageCheckItemId":tempPackageCheckItemId,
		"itemState":itemState,
		"tempKey":tempKey,
		"id":tempId,
		"examType":1
	};
	
	$.ajax({
		type: "post",
		url: url + "/WaitCheckProjectController/judgesScore.do",
		data: para,
		success: function(data) {
			if(data.success) //执行保存方法
			{
				//top.layer.alert("提交成功");
				if(itemState == 1) {
					$("#save_" + packageCheckListId + "_" + supplierId).hide();
					$("#sbumit_" + packageCheckListId + "_" + supplierId).hide();
					$("#alltrue_" + packageCheckListId + "_" + supplierId).hide();
					$("#allfalse_" + packageCheckListId + "_" + supplierId).hide();
					$("#loadExcel_" + packageCheckListId + "_" + supplierId).hide();
					$("#importf_" + packageCheckListId + "_" + supplierId).hide();
					for(var i = 0; i < packageCheckItems.length; i++) {
						$("#isKey_" + supplierId + "_" + packageCheckItems[i].id).attr("disabled", "disabled");
						$("#reason_" + supplierId + "_" + packageCheckItems[i].id).attr("disabled", "disabled");
					}
				} else {
					top.layer.alert("保存成功");
				}
				getData()
				if(packageData.doubleEnvelope==1){					
					for(var i = 0; i < packageData.packageCheckLists.length; i++) { //评审项目循环  大的tab绑定
						$('#li_' + packageData.packageCheckLists[i].id ).remove();	
					}				
					insertTab(packageData)
				}
				if(packageData.shadowMarks&&packageData.shadowMarks.length>0){
					// for(var i = 0; i < packageData.packageCheckLists.length; i++) { //评审项目循环  大的tab绑定
					// 	if(tab_id == packageData.packageCheckLists[i].id) {
					// 		insetItmeTab(packageData.packageCheckLists[i]);
							
					// 	}	
					// }
					$("#correspondings").show();
				}
				$("#myTab li").removeClass('active');
				$('#li_'+tab_id).addClass('active');
				$("#myTabContent div").removeClass('show');
				$('#'+tab_id).addClass("show");  
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}
function offerData(name){
	$.ajax({ 
		type: "post",
		url: url + "/ProjectReviewController/getProjectSupplierOffer.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			roleType: 0
		},
		async: false,
		success: function(data) {
			if(data.success) {
				if(name=="PackageOffer"){					
					PackageOffer(data.data.offers); //供应商报价
					offerDetaileds(data.data.offerDetaileds); //报价详情
					packageDetaileds(data.data); //询比采购清单
				}else if(name=="PriceFile"){
					file(data.data.purFiles); //报价文件
					
					fileEnterprise(data.data); //报价供应商
				}else if(name=='subentry'){
					subentrys(data.data.purOfferFiles)
				}
				
			} 
		},
		error: function(err) {
			
		}
	});
}
//清单报价
function PackageOffer(offers) {	
	$("#PackageOfferTable").bootstrapTable({
		data: offers,
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
			},
			{
				field: 'enterpriseName',
				title: '供应商'
			},
//			{
//				field: 'afterTaxTotal',
//				title: '不含税报价'
//			},
//			{
//				field: 'beforTaxTotal',
//				title: '含税报价'
//			},
			{
				field: 'saleTaxTotal',
				title: '最终报价'
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

//明细信息
function packageDetaileds(packageDatas) {
	var packageDetaileds = packageDatas.packageDetaileds;
	$("#packageDetailedsTable").bootstrapTable({
		data: packageDetaileds,
		clickToSelect: true,
		onClickRow: function(row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
			var newofferDetaileds = new Array();
			for(x in offerDetaileds) {
				if(offerDetaileds[x].packageDetailedId == row.id)
					newofferDetaileds.push(offerDetaileds[x]);
			}
			$('#offerDetailedsTable').bootstrapTable('load', newofferDetaileds);
		},
		onCheck: function(row) {
			var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
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
						var offerDetaileds = packageDatas.offerDetaileds; //询比采购报价详情
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
function offerDetaileds(offerDetaileds) {
	$("#offerDetailedsTable").bootstrapTable({
		cache: false,
		data: offerDetaileds,
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
//			title: '不含税单价'
//		}, {
//			field: 'taxRate',
//			title: '税率(%)'
//		}, {
//			field: 'afterTaxPrice',
//			title: '含税单价'
//		}, 
		{
			field: 'saleTaxTotal',
			title: '最终报价'
		}, 
//		{
//			field: 'beforTaxTotal',
//			title: '不含税合价'
//		}, {
//			field: 'afterTaxTotal',
//			title: '含税总价'
//		}
		]
	});
};

//报价文件供应商
function fileEnterprise(packageDatas) {
	var offers=packageDatas.offers
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
				title: '报价供应商名称'
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

//价格评审
var priceChecks;
var businessPriceSet;
var isDeviate = 0;
var priceCheckMode;
function PriceCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckInfo.do",
		data: {
			expertId:expertIds,
			projectId: projectId,
			packageId: packageId,
			checkPlan: checkPlan,
			checkerCount: packageData.projectCheckers[0].checkerCount,
			packageCheckListCount: packageData.packageCheckLists.length
		},
		async: true,
		success: function(resle) {
			
			if(resle.success) {
				data = resle.data;
				priceCheckMode=data.priceCheckMode;
				if(data.isShowOffer !=undefined &&  data.isShowOffer == 1) {
					$("#isShowOffer").show(); //价格评审显示报价等信息
					$("#lidiv").show();
					if(packageData.isOfferDetailedItem==0){
						$("#lidiv2").show();
					}else{
						$("#lidiv2").hide();
					}
					
				};				
				if(data.isPriceCheck !=undefined &&  data.isPriceCheck == 1) {
					//评委提交价格评审
					// if(data.isLeader == 0 && data.priceCheck == "未完成" ){
					// 	parent.layer.alert("温馨提示：评委组长还未提交价格评审");
					// 	tabOne()
					// 	return;
					// }
				}else{
					//项目经理提交价格评审
					//$("#savediv").hide();
					if(data.priceCheck == "未完成"){
						parent.layer.alert("温馨提示：项目经理还未提交价格评审");
						tabOne();
						return;
					}
				}				
				businessPriceSet = data.businessPriceSet;
				priceChecks = data.priceChecks;
				isDeviate = data.isDeviate;				
                if(data.isDeviate==0){
                	$(".isDeviate").hide();
                	$("#showDeviates").hide();
                }
                //价格评审表格
				if(checkPlan == 1||checkPlan == 3) { //最低评标价法					
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的供应商总报价*上浮比例</br>调整后最终总报价=参与应标的供应商总报价+偏离调整'
						]
						
					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					
					$("#businessContent").html("商务报价计算公式：" + roleObj.content[businessPriceSet.checkType]);
                    if(businessPriceSet.checkType==3) $("#businessType").html("商务报价参数：每高于基准价"+ businessPriceSet.reduceLevel +"%，扣"+ businessPriceSet.reduceScore +"分,基准价：供应商最低报价*计价比例"+ businessPriceSet.priceProportion +"%");
                    if(businessPriceSet.checkType==1) $("#businessType").html("商务报价参数：扣分的最小档次："+ businessPriceSet.reduceLevel +"%，最小档扣分："+ businessPriceSet.reduceScore +"分，基准价"+ businessPriceSet.basePrice +"元，有效报价范围（基准价上下浮动比例）±"+businessPriceSet.offerRange+"%");
                    if(businessPriceSet.checkType==2) $("#businessType").html("商务报价参数：</br>"
                                                                              +"基准分："+ businessPriceSet.baseScore +"分,计价比例："+ businessPriceSet.priceProportion +"%</br>"
                                                                              +'当有效报价高于基准价时，基准价比例：'+businessPriceSet.basePriceProportionHigh +"%，扣分值："+businessPriceSet.additionReduceScore1+'分</br>'
                                                                              +'当有效报价低于基准价时，基准价比例：'+businessPriceSet.basePriceProportionLow +"%，扣分值："+businessPriceSet.additionReduceScore2+'分</br>');
                    if(businessPriceSet.checkType==4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)："+ businessPriceSet.floatProportion +"%");
					if(data.priceCheck == "已完成") {
						$("#savediv").hide();
						if(isDeviate == 1){
							$("#showDeviates").show();
						}
					}				
				} else {					
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法','固定比例不取整法','固定比例取整法','固定差值法','直接比较法','评价算法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(报价总价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</br>调整后最终总报价=参与应标的有效供应商报价总价+偏离调整',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-|(基准价-报价)|/基准价*100*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+|(基准价-报价)|/基准价*100*每1%加分值)*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=(商务报价分值-⌊ |(基准价-报价)|/基准价*100⌋*每1%减分值)*权重</br>B、供应商报价低于基准价时：</br>商务报价得分=(商务报价分值+⌊ |(基准价-报价)|/基准价*100⌋*每1%加分值)*权重</br>注：⌊ ⌋为向下取整符号',
							'商务报价得分=(商务报价分值-(报价-基准价)/(最高报价-基准价)*最多减分)*权重',
							'商务报价得分=基准价/报价*商务报价分值*权重',
							'A、供应商报价高于基准价时：</br>商务报价得分=商务报价分值-|(基准价-报价)|/基准价*100/每百分比减分*每百分比减分值</br>B、供应商报价低于基准价时，且在加分区间内：</br>商务报价得分=商务报价分值+|(基准价-报价)|/基准价*100/每百分比加分*每百分比加分值</br>C、供应商报价低于基准价时，在加分区间外部分：</br>商务报价得分=B项得分-(|(基准价-报价)|/基准价-加分区间/100)*100/每百分比减分*每百分比减分值</p>注：每种情况计算得出的分数需再乘以权重'
						]
						
					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					if(checkPlan == 0){
						$("#weight").html("权重：" + businessPriceSet.weight||"");
					}
					$("#businessContent").html("商务报价计算公式：</br>" + roleObj.content[businessPriceSet.checkType]);
                    if(businessPriceSet.checkType==3) $("#businessType").html("商务报价参数：每高于基准价"+ businessPriceSet.reduceLevel +"%，扣"+ businessPriceSet.reduceScore +"分,基准价：供应商最低报价*计价比例"+ businessPriceSet.priceProportion +"%");
                    if(businessPriceSet.checkType==1) $("#businessType").html("商务报价参数：扣分的最小档次："+ businessPriceSet.reduceLevel +"%，最小档扣分："+ businessPriceSet.reduceScore +"分，基准价"+ businessPriceSet.basePrice +"元，有效报价范围（基准价上下浮动比例）±"+businessPriceSet.offerRange+"%");
                    if(businessPriceSet.checkType==2) $("#businessType").html("商务报价参数：</br>" 
                                                                              +"基准分："+ businessPriceSet.baseScore +"分，计价比例："+ businessPriceSet.priceProportion +"%</br>"
                                                                              +'当有效报价高于基准价时，基准价比例：'+businessPriceSet.basePriceProportionHigh +"%，扣分值："+businessPriceSet.additionReduceScore1+'分</br>'
                                                                              +'当有效报价低于基准价时，基准价比例：'+businessPriceSet.basePriceProportionLow +"%，扣分值："+businessPriceSet.additionReduceScore2+'分</br>');
                    if(businessPriceSet.checkType==4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)："+ businessPriceSet.floatProportion +"%");
                    if(businessPriceSet.checkType==5 || businessPriceSet.checkType==6){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==3){
                    		businessTypeStr+="基准价计算范围：手动输入基准价，";
                    		businessTypeStr+="基准价："+businessPriceSet.basePrice+"</br>";
                    	}else{
                    		if(businessPriceSet.basePriceType==1){
                    			businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    		}else if(businessPriceSet.basePriceType==2){
                    			businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    		}
                    		if(businessPriceSet.basePriceRole==2){
                    			businessTypeStr+="基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例="+businessPriceSet.priceProportion+"%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N="+businessPriceSet.supplierTotal+"</br>";
                    		}else if(businessPriceSet.basePriceRole==3){
                    			businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    		}else{
                    			businessTypeStr+="基准价计算方式：</br>";
                    		}
                    	}
                    	businessTypeStr+="供应商报价每高于基准价1%减"+businessPriceSet.additionReduceScore1+"分，最多减"+businessPriceSet.maxDownScore+"分：</br>";
                    	businessTypeStr+="供应商报价每低于基准价1%加"+businessPriceSet.additionReduceScore2+"分，最多加"+businessPriceSet.maxUpScore+"分：</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==7){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==1){
                    		businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    	}else if(businessPriceSet.basePriceType==2){
                    		businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    	}else{
                    		businessTypeStr+="基准价计算范围：</br>";
                    	}
                    	businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    	businessTypeStr+="减分值，最多减"+businessPriceSet.maxDownScore+"分：</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==8){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==1){
                    		businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    	}else if(businessPriceSet.basePriceType==2){
                    		businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    	}else{
                    		businessTypeStr+="基准价计算范围：</br>";
                    	}
                    	businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    	$("#businessType").html(businessTypeStr);
                    }
                    if(businessPriceSet.checkType==9){
                    	var businessTypeStr="商务报价分值："+ businessPriceSet.baseScore +"分</br>";
                    	if(businessPriceSet.basePriceType==3){
                    		businessTypeStr+="基准价计算范围：手动输入基准价，";
                    		businessTypeStr+="基准价："+businessPriceSet.basePrice+"</br>";
                    	}else{
                    		if(businessPriceSet.basePriceType==1){
                    			businessTypeStr+="基准价计算范围：计算价格评审环节中有效供应商的报价</br>";	
                    		}else if(businessPriceSet.basePriceType==2){
                    			businessTypeStr+="基准价计算范围：计算所有供应商的报价</br>";
                    		}
                    		if(businessPriceSet.basePriceRole==2){
                    			businessTypeStr+="基准价计算方式：有效报价供应商家数大于N时，去掉一个最高和最低报价的算术平均值乘以计价比例="+businessPriceSet.priceProportion+"%,有效报价供应商家数小于N（含）时，所有有效供应商报价的算术平均值乘以计价比例，N="+businessPriceSet.supplierTotal+"</br>";
                    		}else if(businessPriceSet.basePriceRole==3){
                    			businessTypeStr+="基准价计算方式：有效报价的最低报价为基准价</br>";
                    		}else{
                    			businessTypeStr+="基准价计算方式：</br>";
                    		}
                    	}
                    	businessTypeStr+="供应商报价每高于基准价"+businessPriceSet.basePriceProportionHigh+"%减"+businessPriceSet.additionReduceScore1+"分</br>";
                    	businessTypeStr+="供应商报价低于基准价，且在加分区间"+businessPriceSet.addScoreScope+"%内(含)，每"+businessPriceSet.basePriceProportionLow+"%加"+businessPriceSet.additionReduceScore2+"分，最多加"+businessPriceSet.maxUpScore+"分：</br>";
                    	businessTypeStr+="供应商报价低于基准价，且在加分区间"+businessPriceSet.addScoreScope+"%外，超出部分每"+businessPriceSet.basePriceScale+"%减"+businessPriceSet.basePriceNumber+"分";
                    	$("#businessType").html(businessTypeStr);
                    }
					if(data.priceCheck == "已完成") {
						$("#savediv").hide();
						if(isDeviate == 1){
							$("#showDeviates").show();
						}
					}
				}
				var columnList=[];
				columnList.push({
					field: '#',title: '序号',width: '50px',
					formatter: function(value, row, index) {
						return index + 1;
					}
				});
				columnList.push({field: 'enterpriseName',title: '供应商'});
				columnList.push({field: 'isOut',title: '淘汰',align:'center',
					formatter: function(value, row, index) {
						return value == 0 ? "<span type='text' id='isOut_" + row.supplierId + "' value='0'>否</span>" :"<span type='text' id='isOut_" + row.supplierId + "' value='1'>是</span>";
					}
				});
				columnList.push({field: 'saleTaxTotal',title: '报价总价',
					formatter: function(value, row, index) {
						return "<span type='text' id='saleTaxTotal_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
					}
				});
				columnList.push({field: 'fixCount',title: '算数修正值',width: '100px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0){
								//未淘汰
								return "<input style='width:80px;' onchange='fixCount(\""+'fixCount'+"\",\""+row.supplierId+"\")'  type='text' id='fixCount_" + row.supplierId + "' value='" +0+ "'></input>";
							}else{
								return "<input style='width:80px;display:none' type='text' id='fixCount_" + row.supplierId + "' value=''/><span>/</span>";
							}
							
							
						} else {
							return value;
						}
					}
				});
				columnList.push({field: 'fixFinalPrice',title: '修正后总价',
					formatter: function(value, row, index) {
						if(data.priceCheck == '未完成'){
							if(row.isOut == 0){
								return "<span type='text' id='fixFinalPrice_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'>" + (row.saleTaxTotal || '') + "</span>";
							
							}else{
								return "<input style='width:80px;display:none' class='fixFinalPrice' type='text' id='fixFinalPrice_" + row.supplierId + "' value=''/><span>/</span>";
							}
						}else{
							return value;
						}
						
					}
				});
				columnList.push({field: 'defaultItem',title: '缺漏项加价',width: '100px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0) {
								return "<input style='width:80px;' onchange='defaultItem(\""+row.supplierId+"\")' type='text' id='defaultItem_" + row.supplierId + "' value='" +0+ "'></input>";
							}else{
								return "<input style='width:80px;display:none' type='text' id='defaultItem_" + row.supplierId + "' value=''/><span>/</span>";
								
							}
						} else {
							return value ;
						}
					}
				});
				if(checkPlan == 1){
					columnList.push({field: 'deviateNum',title: '计入总数偏离项数',
						formatter: function(value, row, index) {
							if(data.priceCheck == '未完成'){
								if(row.isOut == 0){
									return "<span type='text' id='deviateNum_" + row.supplierId + "' value='" + (row.deviateNum || '0') + "'>" + (row.deviateNum || '0') + "</span>";
								
								}else{
									return "<span style='width:80px;display:none' type='text' id='deviateNum_" + row.supplierId + "' value='"+(row.deviateNum || '0')+"'>" + (row.deviateNum || '0') + "</span><span>/</span>";
								}
							}else{
								return value;
							}
							
						}
					});
				}
				if(checkPlan == 1||checkPlan == 3){
					columnList.push({field: 'deviatePrice',title: '偏离加价',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(businessPriceSet.checkType == 0) {
									if(row.isOut == 0 ){
										return "<input type='text' id='deviatePrice_" + row.supplierId + "' value='0' onchange='fixCount(\""+'deviatePrice'+"\",\""+row.supplierId+"\")'></input>";
									}else{
										return "<input type='hidden' id='deviatePrice_" + row.supplierId + "' value=''></input><span>/</span>";
									}
								}else{
									if(row.isOut == 0) {
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value='" +(row.deviatePrice || 0)+ "'>" + (row.deviatePrice || 0) + "</span>";
									}else{
										return "<span type='text' id='deviatePrice_" + row.supplierId + "' value=''>/</span>";
									}
								}
							} else {
								return value;
							}
						}
					});
				}				
				columnList.push({
					field: 'totalCheck', title: '评审总价', width: '180px',
					formatter: function (value, row, index) {
						if (data.priceCheck == "未完成") {
							if(businessPriceSet.checkType == 0) {
								if (row.isOut == 0) {
									return "<input type='text' onchange='fixCount(\"" + 'totalCheck' + "\",\"" + row.supplierId + "\")' id='totalCheck_" + row.supplierId + "' value='" + (row.saleTaxTotal || '') + "'></input>";
								} else {
									return "<input type='hidden' id='totalCheck_" + row.supplierId + "' value=''></input><span>/</span>";
								}
							}else{
								if(row.isOut == 0){
									return "<span type='text' id='totalCheck_" + row.supplierId + "' value='" + (value || row.saleTaxTotal) + "'>" + (value || row.saleTaxTotal) + "</span>";
								}else{
									
									return "<span type='text' id='totalCheck_" + row.supplierId + "' value=''>/</span>";
								}	
							}
							
						} else {
							return value;
						}
					}
				});
				if(checkPlan != 1&&checkPlan != 3){
					columnList.push({field: 'score',title: '商务报价得分',width: '150px',
						formatter: function(value, row, index) {
							if(data.priceCheck == "未完成") {
								if(businessPriceSet.checkType == 0) {
									if(row.isOut == 0){
										return "<input type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'></input>";
									}else{
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}
									
								} else {
									if(row.isOut == 0 ){
										return "<span type='text' id='score_" + row.supplierId + "' value='" + (row.score || '') + "'>" + (row.score || '') + "</span>";
									}else{
										return "<input style='display:none' type='text' id='score_" + row.supplierId + "' value=''></input><span>/</span>";
									}
									
									
								}
							} else {
								return value;
							}
						}
					});
				}
				columnList.push({field: 'reason',title: '调整原因',width: '150px',
					formatter: function(value, row, index) {
						if(data.priceCheck == "未完成") {
							if(row.isOut == 0){
								return "<input type='text' id='reason_" + row.supplierId + "' value=''></input>";
							}else{
								return "<input style='display:none' type='text' id='reason_" + row.supplierId + "' value=''></input><span>/</span>";
							}
						} else {
							return value;
						}
					}
				});
				//价格评审表格
				$("#PriceCheckTalbe").bootstrapTable({
					columns: columnList
				});									
				$("#PriceCheckTalbe").bootstrapTable("load", priceChecks);	
			} else {
				if(resle.message=="所有供应商已全部淘汰"){
					top.layer.alert(resle.message);	
				}else{
					top.layer.alert(resle.message);	
				};
				tabOne()
			}
		}
	});
}
$(".isDeviate").on('click',function(){
	parent.layer.open({
		type: 2 ,//此处以iframe举例
		title: '偏离项明细',
		btn: ["关闭"],
		area: ['1100px', '600px'],
		content:"Auction/common/Agent/ReportCheck/deviateInfo.html?packageId="+packageId+'&projectId='+projectId ,
		success: function(layero, index) {
		}
	});
});
//分项报价文件
function subentrys(data){
	$("#subentryTable").bootstrapTable({
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
		},{
			field: 'userName',
			title: '报价供应商名称'
		},{
			field: 'fileName',
			title: '附件名称'
		}, {
			field: 'fileSize',
			title: '附件大小',
			width: '100px',
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
//算数修正值改变时间
function fixCount(typeName, supplierId) {
	//判断输入的值是否为数字
	var fixCount = $("#" + typeName + "_" + supplierId + "").val(),deviatePrice=$("#deviatePrice_" + supplierId + "").attr("value");
	if (typeName == "fixCount" || typeName == 'baseCheckPrice' || typeName == 'deviatePrice') {
		if (typeName == "fixCount") {
			if (fixCount != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(fixCount))) {
				parent.layer.alert("算数修正值只能是数字(不限正负)且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：报价总价 + 算术修正值;
			var prices = (Number($("#saleTaxTotal_" + supplierId + "").attr('value')) + parseFloat(fixCount));

		} else if (typeName == "baseCheckPrice") {
			if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
				parent.layer.alert("评审基础价必须大于零且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			fixCount = fixCount || 0;
			//修正后报价：评审基础价 + 算术修正值 ；
			var prices = (Number($("#fixCount_" + supplierId + "").val()) + parseFloat(fixCount));
		} else {
			if (fixCount != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
				parent.layer.alert("偏离加价只能是数字(不限正负)且最多两位小数");
				$("#" + typeName + "_" + supplierId + "").val("");
				return;
			};
			deviatePrice=$("#" + typeName + "_" + supplierId + "").val()
			fixCount = fixCount || 0;
			var prices = Number($("#fixFinalPrice_" + supplierId + "").text());			
		}
		var price = roundFun(prices, (top.prieNumber || 2));
		if (price < 0) {
			parent.layer.alert("修正后总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("")
			return;
		}
		$("#fixFinalPrice_" + supplierId + "").attr("value", price);
		$("#fixFinalPrice_" + supplierId + "").text(price);
		var defaultItem = $("#defaultItem_" + supplierId + "").val();
		defaultItem = defaultItem || 0;
		//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
		prices = (Number(price) + Number(deviatePrice|| 0) + parseFloat(defaultItem));
		var price = roundFun(prices, (top.prieNumber || 2));
		if (price < 0) {
			parent.layer.alert("评审总价不得小于零");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		}
		$("#totalCheck_" + supplierId + "").val(price);
		$("#totalCheck_"+supplierId+"").attr("value",price);
		$("#totalCheck_"+supplierId+"").text(price);
	} else if (typeName == 'totalCheck') {
		if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
			parent.layer.alert("评审总价必须大于零且最多两位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
	} else if (typeName == 'finalDiscountPrice') {
		if (fixCount != "" && !(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test(fixCount))||parseFloat(fixCount)==0) {
			parent.layer.alert("最终优惠价必须大于零且最多两位小数");
			$("#" + typeName + "_" + supplierId + "").val("");
			return;
		};
		return
	}
}
//缺漏项改变事件
function defaultItem(supplierId) {
	//判断输入的值是否为数字
	var defaultItem = $("#defaultItem_" + supplierId + "").val();
	if (defaultItem != "" && !(/^[+-]?(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(defaultItem))) {
		parent.layer.alert("缺漏项加价只能是数字(不限正负)且最多两位小数");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	};
	defaultItem = defaultItem || 0;
	//评审总价 :修正后报价 + 偏离加价 + 缺漏项；
	var prices = (Number($("#fixFinalPrice_" + supplierId + "").attr("value") || 0) + Number($("#deviatePrice_" + supplierId + "").attr("value") || 0) + parseFloat(defaultItem));
	var price = roundFun(prices, (top.prieNumber || 2))
	if (price < 0) {
		parent.layer.alert("评审总价不得小于零");
		$("#defaultItem_" + supplierId + "").val("")
		return;
	}
	$("#totalCheck_" + supplierId + "").val(price);
	$("#totalCheck_"+supplierId+"").attr("value",price);
	$("#totalCheck_"+supplierId+"").text(price);
}
//保存价格评审
function savepriceChecks() {
	for (var i = 0; i < priceChecks.length; i++) {
		if (priceChecks[i].isOut == 0) {
			if (checkPlan == 1 || checkPlan == 3) {
				if ($("#deviatePrice_" + priceChecks[i].supplierId).val() != "" && priceChecks[i].isOut == 0 && checkPlan == 1) {
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#deviatePrice_" + priceChecks[i].supplierId).val())) {
						top.layer.alert(priceChecks[i].enterpriseName + "的偏离调整加价只能是数字");
						return false;
					}

				}

			} else {
				if (businessPriceSet.checkType == 0) {
					if ($("#score_" + priceChecks[i].supplierId).val() == '' && priceChecks[i].isOut == 0) {
						top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的商务报价得分");
						return false;
					}
					if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#score_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分只能是纯数字");
						return false;
					}
					if (parseInt($("#score_" + priceChecks[i].supplierId).val()) > (100 * parseFloat(businessPriceSet.weight)) && priceChecks[i].isOut == 0) {
						top.layer.alert(priceChecks[i].enterpriseName + "的商务报价得分超出最大范围" + (100 * parseFloat(businessPriceSet.weight)));
						return false;
					}
				}
			}
			if(businessPriceSet.checkType == 0){
				if ($("#totalCheck_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的评审总价");
					return false;
				}
	
				if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#totalCheck_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
					top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字");
					return false;
				}
			}
			// if ($("#finalChecked_" + priceChecks[i].supplierId).is('checked') == true) {
			// 	if ($("#finalDiscountPrice_" + priceChecks[i].supplierId).val() == "") {
			// 		top.layer.alert('请输入' + priceChecks[i].enterpriseName + "的最终优惠价");
			// 		return false;
			// 	} else {
			// 		if (!/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($("#finalDiscountPrice_" + priceChecks[i].supplierId).val())) {
			// 			top.layer.alert(priceChecks[i].enterpriseName + "的评审总价只能是数字,且最多两位小数");
			// 			return false;
			// 		}
			// 	}

			// }
			var saleTaxTotal = $("#saleTaxTotal_" + priceChecks[i].supplierId + "").attr("value");//报价总价
			if(businessPriceSet.checkType == 0){
				var totalCheck = $("#totalCheck_" + priceChecks[i].supplierId + "").val();//评审总价
			}else{
				var totalCheck = $("#totalCheck_"+priceChecks[i].supplierId+"").attr("value");;//评审总价
			}			
			var finalDiscountPrice = $("#finalDiscountPrice_" + priceChecks[i].supplierId + "").val();//最终优惠价
			if (parseFloat(totalCheck) != parseFloat(saleTaxTotal)) {
				if ($("#reason_" + priceChecks[i].supplierId).val() == '') {
					top.layer.alert("请输入" + priceChecks[i].enterpriseName + "的调整原因");
					return false;
				}
			}
		}
	}
	var para = savepriceData();
	$.ajax({
		type: "POST",
		url: url + "/WaitCheckProjectController/priceCheck.do",
		data: para,
		async: true,
		success: function (data) {
			if (data.success) {
				$("#savediv").hide();
				PriceCheck();
				if (isDeviate == 1) {
					$("#showDeviates").show();
				}
				top.layer.alert('提交成功!');
			} else {
				if (data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}
//价格评审提交数据
function savepriceData() {
	var para = {};
	for (var i = 0; i < priceChecks.length; i++) {
		para['priceChecks[' + i + '].projectId'] = packageData.projectId;
		para['priceChecks[' + i + '].packageId'] = packageData.packageId;
		para['priceChecks[' + i + '].supplierId'] = priceChecks[i].supplierId;
		para['priceChecks[' + i + '].checkPlan'] = checkPlan;
		para['priceChecks[' + i + '].isOut'] = $("#isOut_" + priceChecks[i].supplierId).attr("value");
		if ($("#isOut_" + priceChecks[i].supplierId).attr("value") == 0) {			
			para['priceChecks[' + i + '].fixCount'] = $("#fixCount_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].defaultItem'] = $("#defaultItem_" + priceChecks[i].supplierId).val() || 0;
			para['priceChecks[' + i + '].fixFinalPrice'] = $("#fixFinalPrice_" + priceChecks[i].supplierId).html();
			para['priceChecks[' + i + '].reason'] = $("#reason_" + priceChecks[i].supplierId).val();
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).attr("value");			
			if (checkPlan == 1 || checkPlan == 3) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).val() || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).attr("value") || 0;
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).attr("value");
				}
			} else {
				if (businessPriceSet.checkType == 0) {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).val();
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
				} else {
					para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).attr("value");
					para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).attr("value");
				}
			}
		} else {
			if (checkPlan == 1 || checkPlan == 3) {
				para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();

			}
			para['priceChecks[' + i + '].saleTaxTotal'] = $("#saleTaxTotal_" + priceChecks[i].supplierId).html();
		}

		if (priceChecks[i].id) {
			para['priceChecks[' + i + '].id'] = priceChecks[i].id
		};
	}
	para.priceCheckRemark = $("#priceCheckRemark").val();
	return para;
}
/*==========   价格评审 END   ==========*/
//评审记录汇总
var CheckTotals;

function PriceCheckTotal(projectId, packageId) {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			checkPlan: checkPlan
		},
		async: true,
		success: function(data) {
			data = data.data;
			CheckTotals = data;
			if(data.checkItem == '已完成') {
				$("#checkPlace").html(data.priceCheckTotals[0].checkPlace);
				$("#checkDate").html(data.priceCheckTotals[0].checkDate);
				$("#checkRemark").html(data.priceCheckTotals[0].checkRemark);

				var checkItem;
				if(data.priceCheckItems) {
					checkItem = data.priceCheckItems;
				} else {
					checkItem = data.priceChecks;
				}
				if(checkPlan == '1'||checkPlan=="3") {
					$("#checkTotalTable").bootstrapTable({
						data: checkItem,
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
							{
								title: '淘汰',
								field: 'isOut',
								width: '80px',
								align: 'center',
								halign: 'center',
								formatter: function(value, row, index) {
									return value == 1 ? "是" : "否";
								}
							},{
								field: 'saleTaxTotal',
								title: '供应商报价',
								width: '150px'
							},{
								field: 'fixCount',
								title: '算数修正值',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
									
								}
							},{
								field: 'fixFinalPrice',
								title: '修正后总价',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
								}
							},
							/*{
								field: 'finalPrice',
								title: '最终报价(万元)',
								width: '150px'
							},*/
							{
								field: 'defaultItem',
								title: '缺漏项加价',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
								}
							},
							{
								field: 'deviateNum',
								title: '计入总数偏离项数',
								align: 'center',
								width: '100px',								
							},
							
							
							{
								field: 'deviatePrice',
								title: '偏离加价',
								width: '150px',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
								}
							},
							/*{
								field: 'score',
								title: '商务报价得分',
								formatter: function(value, row, index) {
									if(row.isOut = 1){
										return "/"
									}
									return value;
								}
							},*/
							{
								field: 'totalCheck',
								title: '评审总价',
								width: '150px',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
								}
							},
							{
								field: 'reason',
								title: '调整原因',
								formatter: function(value, row, index) {
									
									if(row.isOut == '1'){
										return "/"
									}else{
										return value;
									}
								}
							},
							{
								field: 'supplierOrder',
								title: '排名',
								align: 'center',
								halign: 'center',
								width: '80px',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return '/'
									}else{
										return value;
									}
								}
							},
							{
								field: 'isChoose',
								title: '候选人',
								width: '80px',
								align: 'center',
								halign: 'center',
								formatter: function(value, row, index) {
									if(row.isOut == '1'){
										return '/'
									}else{
										return value == 0 ? "否" : "是";
									}									
								}
							}
						]
					});
					if(checkPlan==3){
						$("#checkTotalTable").bootstrapTable("hideColumn", 'deviatePrice');
					}
				} else {
					var html = '';
					var checker = CheckTotals.experts; //评委
					var list = CheckTotals.packageCheckLists; //评审项
					var priceChecks = CheckTotals.priceChecks; //打分情况
					if(priceChecks) {
						html += "<tbody><tr>";
						html += "<td style='text-align:left' width='200px'>供应商名称</td>";
						html += "<td style='text-align:center' width='120px'>评审项</td>";
						html += "<td style='text-align:center' width='400px'>评审内容</td>";
						for(var i = 0; i < checker.length; i++) {
							html += "<td style='text-align:center' width='100px'>得分" + (i + 1) + "</br>(" + checker[i].expertName + ")</td>";
						}
						html += "<td style='text-align:center' width='90px'>分项平均分</td>";
						html += "<td style='text-align:center' width='120px'>分项平均总得分</td>";
						html += "<td style='text-align:center' width='110px'>商务报价得分</td>";
						html += "<td style='text-align:center' width='75px'>淘汰</td>";
						html += "<td style='text-align:center' width='80px'>总分</td>";
						html += "<td style='text-align:center' width='70px'>排名</td>";
						html += "<td style='text-align:center' width='75px'>候选人</td>";
						html += "</tr>";

						//跨行条数
						var enterpriseRowspan = 0;
						for(var x = 0; x < list.length; x++) { //评审项
							enterpriseRowspan += list[x].packageCheckItems.length;
							if(list[x].checkType == 1||list[x].checkType == 3) enterpriseRowspan++;
						}
						for(var i = 0; i < priceChecks.length; i++) {
							if(list && list.length > 0) {
								html += "<tr>";
								html += "<td style='text-align:left;' rowspan='" + enterpriseRowspan + "'>" + priceChecks[i].enterpriseName + "</td>";
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
											html += "<td style='text-align:center' rowspan='" + ((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + list[x].checkName + "</td>";
										};
										html += "<td style='text-align:left'>" + item[z].checkTitle + "</td>";
										for(var e = 0; e < checker.length; e++) { //评委
											html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[checker[e].id][item[z].id] || '/') + "</td>";
										}

										if(list[x].checkType == 1||list[x].checkType == 3) {
											html += "<td style='text-align:center'>" + (priceChecks[i].expertScores[item[z].id]||"/") + "</td>";
										} else {
											if(list[x].checkType == 0){
												html += "<td style='text-align:center'>"+(priceChecks[i].expertScores[item[z].id]==0?"符合":"不符合")+"</td>";
											}else if(list[x].checkType == 2){
												html += "<td style='text-align:center'>"+(priceChecks[i].expertScores[item[z].id]==0?"合格":"不合格")+"</td>";
											}else{
												html += "<td style='text-align:center'>0</td>";
											}
										}

										if(z == 0) {
											if(list[x].checkType == 1||list[x].checkType == 3) {
												html += "<td style='text-align:center' rowspan='" + ((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + (priceChecks[i].expertScores[list[x].id]||"/") + "</td>"
											} else {
												if(list[x].checkType == 0){
													html += "<td style='text-align:center' rowspan='" + ((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + (priceChecks[i].expertScores[list[x].id]==0?"符合":"不符合") + "</td>"
												}else if(list[x].checkType == 2){
													html += "<td style='text-align:center' rowspan='" + ((list[x].checkType == 1||list[x].checkType == 3) ? item.length + 1 : item.length) + "'>" + (priceChecks[i].expertScores[list[x].id]==0?"合格":"不合格") + "</td>"
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
											html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].score || '/') + "</td>";
											
											html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].isOut ? "<span id='isOut_" + priceChecks[i].supplierId + "' value='1'>是</sapn>" : "<span id='isOut_" + priceChecks[i].supplierId + "' value='0'>否</sapn>") + "</td>";
											html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + priceChecks[i].total + "</sapn>"+"</td>";
											html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].supplierOrder || '') + "</td>";
											html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'>" + (priceChecks[i].isChoose ? "是" : "否") + "</td>";
											html += "</tr>";
										}
									}
									if(list[x].checkType == 1||list[x].checkType == 3) {
										html += "<tr><td style='text-align:center'>得分</td>";
										for(var e = 0; e < checker.length; e++) {
											html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[checker[e].id][list[x].id] ||"" )+ "</td>";
										}
										html += "<td  style='text-align:center' >" + (priceChecks[i].expertScores[list[x].id] ||"" )+ "</td>";
										html += "</tr>";
									}
								}
							}
						}
					}
					$("#checkTotalTable").html(html + '</tbody>');
				}
			} else {
				top.layer.alert("评审记录汇总未完成！");
				tabOne()
			}
		}
	});
}
//预览
$(".viewCheckReport").click(function() {
	if(CheckTotals.checkReport == '已完成') {
		previewPdf(CheckTotals.checkReports[0].reportUrl);
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
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

//评审报告
function CheckReport() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageData.packageId,
			checkPlan: checkPlan,
			expertId:expertIds
		},
		async: true,
		success: function(data) {
			if(data.data.checkReport == '已完成') {
				var  checkReportdata = data.data.checkReports;
				var isNeedSure=data.data.isNeedSure;
				var sureReport=data.data.sureReport;
				if(isNeedSure==1&&(sureReport!=1&&sureReport!==0)){
					$("#isNeedSure").show();
				}
				$("#CheckReportTable").bootstrapTable({
					data: checkReportdata,
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
						width: '150px',
						align: 'center',
						cellStyle: {
							css: {
								"text-align": "center"
							}
						},
						events:{
							'click .download':function(e,value, row, index){
								var newUrl = top.config.bidhost + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + packageData.packageName + "_评审报告.pdf";
								window.location.href = $.parserUrlForToken(newUrl);
							}
						},						
						formatter: function(value, row, index) {
							var btn="<a href='javascript:void(0)' class='btn btn-xs btn-primary download' style='text-decoration:none;'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span>下载</a>"
								  +"<a class='btn btn-primary btn-xs' onclick=viewCheckReport(\""+ row.reportUrl +"\") href='javascript:void(0)'><span class='glyphicon glyphicon-picture' aria-hidden='true'></span>预览</a>";								 
							return btn						
						}
					}]
				});
				if(packageData.isStopCheck == 1) {
					$(".btn").hide();
					$('input').attr('disabled',true);
					$('button').attr('disabled',true);
				}
			} else {
				top.layer.alert("评审报告未生成！");
				tabOne()
			}
		}
	});
}
$("#isNeedSure").on('click',function(){
	parent.layer.confirm("温馨提示：是否同意项目经理提交评审报告？", {
		btn: ['同意', '不同意','取消'] //可以无限个按钮
	}, function(index, layero) {
		$.ajax({
			type: "post",
			url: url+"/CheckReportController/sureReport.do",
			data:{
				'projectId':projectId,
				'packageId':packageId,
				'examType':1,
				'checkerEmployeeId':expertIds,
				'sureReport':1
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					parent.layer.close(index);
					$("#isNeedSure").hide();
				}
			}
		});
	}, function(indexs) {
		parent.layer.prompt({
			title: '请输入不同意原因',
			formType: 2
		}, function (text, index) {
			if(text==""){
				parent.layer.msg('原因不能为空')
				return 
			}
			$.ajax({
				type: "post",
				url: url+"/CheckReportController/sureReport.do",
				data:{
					'projectId':projectId,
					'packageId':packageId,
					'examType':1,
					'checkerEmployeeId':expertIds,
					'sureReport':0,
					'sureReason':text,
				},
				dataType: "json",
				success: function (response) {
					if(response.success){
						parent.layer.close(indexs);
						parent.layer.close(index);
						$("#isNeedSure").hide();
					}
				}
			});
		});
		
	}, function(index) {
		parent.layer.close(index);
	});	
})
//评审澄清
var raterAsks=[];
function bindRaterAsks(packageData) {
	var strUlHtml='<div id="divsd">'
	strUlHtml += "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_'>"
	strUlHtml +="<ul id='raterAsksTab' class='nav nav-tabs' style='border-top: 0px solid;'>";
	for(var i = 0; i < packageData.offers.length; i++) {
		if(i == 0) {
			strUlHtml += "<li class='active' onclick='raterAsksbtn(\""+ packageData.offers[i].supplierId +"\")'>";
		} else {
			strUlHtml += "<li onclick='raterAsksbtn(\""+ packageData.offers[i].supplierId +"\")'>";
		}
		strUlHtml += "<a href='#raterAsks_" + packageData.offers[i].supplierId + "' data-toggle='tab'>" + packageData.offers[i].enterpriseName + "</a>";
		strUlHtml += "</li>";
	}
	strUlHtml +="</ul>";
	strUlHtml +="</div>";
	strUlHtml +='<button type="button" class="btn btn-default" id="perv_" style="width: 40px;height: 40px;margin: 0px;"><<</button>'
	strUlHtml +='<button type="button" class="btn btn-default" id="next_" style="width: 40px;height: 40px;margin: 0px;">>></button>'
	strUlHtml += "<div id='raterAsksTabContent' class='tab-content' style='float:left;width: 100%;'>";
	strUlHtml += "<div style='margin: 5px;'>供应商互动提问 <span style='color: red;'>温馨提示：评审委员会可以要求供应商进行澄清说明，所有澄清问题的提出与答复均在本页面在线完成</span></div>";
	strUlHtml += "<div style='width: 100%;height: 423px; border: 1px #ddd solid;' id='TabContent'>";								
	strUlHtml += "</div>";
	strUlHtml += "</div>";
	$("#raterAsks").html(strUlHtml);
	var liList=[]
		$("#raterAsksTab li").each(function(){
		liList.push($(this).width())
		})					
		if(eval(liList.join('+'))+packageData.offers.length*2>=$("#divsd").width()){
		$("#perv_").show();
		$("#next_").show();
		$("#ulTab_").width($("#divsd").width()-80)
		$("#raterAsksTab").width(eval(liList.join('+'))+packageData.offers.length*4);
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
	raterAsksbtn(packageData.offers[0].supplierId); 

}
function raterAsksbtn(uid){
	var strDivContentHtml = "";
	strDivContentHtml += "<div style='overflow-y:scroll;height:300px' id='messageDiv_" + uid + "'>";	
	strDivContentHtml += "</div>";
	strDivContentHtml += "<div class='isShowRaterAsks'>";
	strDivContentHtml += "<textarea rows='5' style='width: 100%;height: 80px;' id='questionsContent_" + uid + "'></textarea>";
	strDivContentHtml += "</div>";
	strDivContentHtml += "<div style='width: 100%;' class='isShowRaterAsks'>";
	strDivContentHtml += "<a href='#' style='margin-left:5px;float:left' type='button' class='btn btn-primary btn-sm' onclick='sendQuestions(\"" + uid + "\")'>发送</a>";
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

//提交发送
function sendQuestions(supplierId) {
	if($("#questionsContent_" + supplierId).val().length < 1) {
		top.layer.alert("请输入提问内容");
		return false;
	}

	$.ajax({
		type: "post",
		url: url + "/RaterAskController/insertRaterAsk.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			supplierId: supplierId,
			askContent: $("#questionsContent_" + supplierId).val(),
			expertId:expertIds
		},
		success: function(data) {
			if(data.success) {
				refresh(supplierId);
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

//撤回信息
function backRaterAsk(id, supplierId) {
	parent.layer.confirm("温馨提示：是否确定撤回？", function(indexs) {
		$.ajax({
			type: "post",
			url: top.config.bidhost + "/RaterAskController/deleteRaterAsk.do",
			data: {
				id: id,
				expertId:expertIds
			},
			async: true,
			success: function(data) {
				if(data.success) {
					top.layer.alert("撤回成功！");
					refresh(supplierId);
				} else {
					top.layer.alert(data.message);
				}
			}
		});
		parent.layer.close(indexs);
	})
	
}

//刷新
function refresh(supplierId) {
	$.ajax({
		type: "post",
		url: url + "/RaterAskController/findRaterAskList.do",
		data: {
			projectId: packageData.projectId,
			packageId: packageId,
			roleType: "2",
			expertId:expertIds,
			examCheckType:packageData.purExamType
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
							strDivHtml += "<span>答复内容：<c style='color:red'>未答复</c></span><a id='btnDeleteRaterAsk' class='btn btn-primary btn-sm' onclick='backRaterAsk(\"" + data[i].id + "\",\"" + data[i].supplierId + "\")'>撤回</a></br></br>";
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
				if(packageData.isStopCheck == 1) {
					$(".btn").hide();
					$('input').attr('disabled',true);
					$('button').attr('disabled',true);
				}
			}
		}
	});
}
//一键流标
$("#StopCheck").click(function() {
	top.layer.confirm("温馨提示:流标后该包件将作废,是否确定申请流标?", function(indexs) {
		parent.layer.close(indexs);
		parent.layer.prompt({
		title: '请输入流标原因',
		formType: 2
	}, function(text, index) {
		if(text==""){
			top.layer.alert('请输入流标原因');
			
			return
		}
		$.ajax({
			type: "post",
			url: url + "/ProjectReviewController/setIsStopCheck.do",
			data: {
				id: packageId,		
				stopCheckReason:text,
				examType:1
			},
			async: true,
			success: function(data) {
				if(data.success) {
					window.location.reload();
					top.layer.alert("提交流标申请成功");
					$('input').attr('disabled',true);
					$('button').attr('disabled',true)
				} else {
					top.layer.alert(data.message);
				}
			}
		});
		parent.layer.close(index);
		});		
	});
})
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

//查看
$("#viewProject").click(function() {
	//sessionStorage.setItem('purchaseaData', JSON.stringify(packageData.projectId));
	/*parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '查看询比采购公告',
		area: ['75%', '90%'],
		content: '0502/Bid/Purchase/model/viewPurchase.html',
		btn: ['关闭']
	});*/
	if(packageData.inviteState==1){
		if(packageData.examType==1){
			var urlPurchaseInfo = 'Auction/common/Supplier/invitation/model/supplierInvitationInfo.html?packageId='+packageId+'&projectId='+projectId+'&type=view' ;
		}else{
			var urlPurchaseInfo = 'Auction/common/Supplier/invitation/model/examSupplierInvitationInfo.html?packageId='+packageId+'&projectId='+projectId+'&type=view';
		}			
	}else{
		var urlPurchaseInfo = "Auction/common/Supplier/Purchase/model/SupplierPurchaseInfo.html";
	}	  
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:tenderType==0?'查看询比采购公告':'单一来源采购公告'
        ,area: ['80%', '80%']
        ,maxmin: true //开启最大化最小化按钮
        ,content:urlPurchaseInfo
        ,success:function(layero,index){
        	var iframeWin=layero.find('iframe')[0].contentWindow;  
            if(packageData.inviteState==0){
        	    iframeWin.Purchase(projectId)
        	    iframeWin.du(packageId,packageData.examType)
        	}
        }     
     });
	
});

/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
/** 
 * 暗标供应商对应关系
 */
function corresponding(data){
	$("#correspondingsTable").bootstrapTable({
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
			field:'enterpriseName',
			title: '供应商名称',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			
		}, {
			field:'shadowCode',
			title: '暗标编号',
			align: 'center',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			
		}]
	});
}