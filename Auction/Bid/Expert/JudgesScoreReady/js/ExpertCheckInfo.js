//访问路径
var url = top.config.bidhost;
var loadFile = top.config.bidhost + "/FileController/download.do"; //文件下载
var viewpackage='Auction/common/Agent/Purchase/model/viewPackage.html'
var urlPurchaseInfo = "Auction/common/supplier/Purchase/model/SupplierPurchaseInfo.html";
//项目id
var projectId = getUrlParam("projectId");
//包件id
var packageId = getUrlParam("packageId");

var tenderType = getUrlParam("tenderType");
//评审方式    0综合评分法   1最低价法
var checkPlan = getUrlParam("checkPlan");
//项目对应的专家评委的ID
var expertIds=getUrlParam("expertId")
//本页面获取的包件信息
var packageData;
var tempIsData;

var keepNum= "";
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
	//是否显示清单报价
	/*if(packageData.projectCheckers[0].isShowOffer == 0) {
		$("#isShowOffer").show();
	} else {
		file(packageData.purFiles); //报价文件
		fileEnterprise(packageData.offers); //报价供应商
		$("#myTab li").removeClass('active');
		$("li[value='#PriceFile']").addClass('active');
		$("#myTabContent div").removeClass('show');
		$("#PriceFile").addClass("show");
	}*/
	
	if(packageData.isStopCheck == 1) {
		parent.layer.alert("温馨提示：该项目已流标!");
		$(".btn").hide();
		$('input').attr('disabled',true);
		$('button').attr('disabled',true);
	}else{
		if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
			parent.layer.alert("温馨提示：该项目已申请流标!");
			$(".btn").hide();
			$('input').attr('disabled',true);
			$('button').attr('disabled',true);
		}else{
			if(packageData.isLeader==0){
				$('#StopCheck').hide();
			}else{
				if(packageData.checkReport=="已完成"){
					$('#StopCheck').hide();
				}else{
					$('#StopCheck').show();
				}
			}
		}
		
	}	
	$("#downloadAllFile").show();
});
//默认第一个TAB
function tabOne(){
	$("#myTab li").removeClass('active');
	$("#myTab li:first-child").addClass('active');
	var contentdiv = $("#myTab li:first-child").attr("value");
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");
	var packageCheckLists = packageData.packageCheckLists;
	for(var i = 0; i < packageCheckLists.length; i++) {
		if(contentdiv == ("#" + packageCheckLists[i].id)) {
			insetItmeTab(packageCheckLists[i]);			
		}
	}
	var id = contentdiv.substr(1, contentdiv.length - 1);
	var liId=$("#Tab_" + id + " li").attr('value').split("_")[1];
	$("#Tab_" + id).on("click", "li", function(e) {
		$("#Tab_" + id + " li").removeClass('active');
		$(this).addClass('active');
		var contentdivdetail = $(this).attr("value");
		
		$("#TabContent_" + id + " div").removeClass('show');
		$(contentdivdetail).addClass("show");
	});
	//tatile(liId)
	//是否显示项目公告
	if(packageData.isShowProject == 1) {
		$("#viewProject").hide();
	}
}
//点击tab加载对应数据
$("#myTab").on("click", "li", function(e) {
	$(this).addClass('active').siblings().removeClass('active')
//	$("#myTab li").removeClass('active');
//	$(this).addClass('active');
	var contentdiv = $(this).attr("value");
	$("#myTabContent div").removeClass('show');
	$(contentdiv).addClass("show");  
	switch(contentdiv) {
		case "#PackageOffer":
			PackageOffer(packageData); //供应商报价
			offerDetaileds(packageData.offerDetaileds); //报价详情
			packageDetaileds(packageData); //询价采购清单
			break;
		case "#PriceFile":
			file(packageData.purFiles); //报价文件
			fileEnterprise(packageData.enterprises); //报价供应商
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
			if($("#Tab_" + id + " li").attr('value')!=undefined&&$("#Tab_" + id + " li").attr('value')!=""){
				var liId=$("#Tab_" + id + " li").attr('value').split("_")[1];
			};			
			$("#Tab_" + id +" li a").on("click",function(e) {
				$("#Tab_" + id + " li").removeClass('active');
				$(this).addClass('active');
				var contentdivdetail = $(this).attr("value");;
				$("#TabContent_" + id + " div").removeClass('show');
				$(contentdivdetail).addClass("show");
				if($(this).attr('value')!=undefined&&$(this).attr('value')!=""&&$(this).attr('value')!=null){
					liId=$(this).attr('value').split("_")[1];
				}
				
				
			    //tatile(liId);
			});
			//tatile(liId);
			break;
	}
});
//合计算法
function tatile(liId,uid){
	$(".supplierScore_"+liId+'_'+uid).on('change',function(){
		var Score= $(this).parent().siblings().eq(3).html();
		var reg = /(^(0|([1-9]\d*))\.\d{1,2}$)|(^(0|([1-9]\d*))$)/;
	 	if(!(reg.test(parseFloat($(this).val())))){	
			$(this).val("");
			parent.layer.alert('温馨提示：分值必须大于等于零,且小数点后面最多两位小数');	
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
			examCheckType:1,
			roleType: 2
		},
		async: false,
		success: function(data) {
			$("#projectCode").html(data.data.projectCode);
			$("#projectName").html(data.data.projectName);
			$("#packageName").html(data.data.packageName);
			$("#packageNum").html(data.data.packageNum);

			packageData = data.data;		
			//加载动态tab
			insertTab(packageData);
			//默认加载第一个tab，清单报价
			PackageOffer(packageData); //供应商报价
			offerDetaileds(packageData.offerDetaileds); //报价详情
			packageDetaileds(packageData); //询价采购清单
			
			packageCheck = packageData.packageCheckLists;
			
			if(packageData.keepNum != undefined){
				keepNum = packageData.keepNum;
				checkFinish();
			}
			/*var ids = [];
			for(var i = 0;i<packageData.packageCheckStates.length;i++){
				if(packageData.packageCheckStates[i].isScore == 1){
					//打分完成的项
					ids.push(packageData.packageCheckStates[i].packageCheckListId)
				}
			}*/
			//判断评审进度是否
			/*if(packageData.checkFinish  && packageData.checkFinish == '打分完成'){
				var list = packageData.packageCheckLists;
				for(var j=0;j<list.length;j++){
					if(!ids.contain(list[j].id)){
						$(".no_"+list[j].id+"").hide();
						$("#li_"+list[j].id+"").hide();
					}
				}
			}*/
			
		}
	});
}

var packageCheck = [];
function checkFinish(){
	
	/*if(packageData.checkFinish  && packageData.checkFinish == '打分完成'){
		for(var j=0;j<packageCheck.length;j++){
			if(j != 0 && packageCheck[j].resultType!= undefined && packageCheck[j].resultType ==1){
				$(".no_"+packageCheck[j].id+"").hide();
				$("#li_"+packageCheck[j].id+"").hide();
			}
		}
	}else{*/
		for(var j=0;j<packageCheck.length;j++){
			if(packageCheck[j].checkType == 1 && packageCheck[j].resultType!= undefined && packageCheck[j].resultType ==1){
				$(".no_"+packageCheck[j].id+"").hide();
				$("#li_"+packageCheck[j].id+"").hide();
			}else{
				$(".no_"+packageCheck[j].id+"").show();
				$("#li_"+packageCheck[j].id+"").show();
			}
		}
	//}
}


//只重新获取主数据，进度
function getData() {
	$.ajax({
		type: "get",
		url: url + "/ProjectReviewController/getProjectCheckInfo.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examCheckType:1,
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
		strUl += "<li id='li_" + data[i].id + "' value='#" + data[i].id + "'>";
		strUl += "<a href='javascript:void(0)' data-toggle='tab'>" + data[i].checkName + "</a>";
		strUl += "</li>";
		strdiv += "<div class='tab-pane fade' id='" + data[i].id + "'>";
		strdiv += "</div>";
	}
	//$("#lidiv").after(strUl);
	//$("#PriceFile").after(strdiv);
	$("#isShowCollect").before(strUl);
	$("#PriceCheckTotal").before(strdiv);
	var liList=[]
	 $("#myTab li").each(function(){
	 	liList.push($(this).width())
	 })
	  $("#fristTab").width($("#fristTabtd").width()-$("#pervAndnext").width()-60)
	 if((eval(liList.join('+'))+liList.length*4)>=$("#fristTab").width()){
	 	$("#perv").show();
	 	$("#next").show();	
	 	$("#myTab").width(eval(liList.join('+'))+liList.length*4);	
	 }else{
	 	$("#perv").hide();
	 	$("#next").hide();	 	
	 	$("#myTab").width('100%');		
	 }
		 
	
	//$("#myTab li:first-child").addClass("active").siblings().removeClass("active");
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
	console.log($("#myTab").css('width').slice(0, -2),$("#fristTab").width(),-($("#myTab").css('width').slice(0, -2) - $("#fristTab").width()),$("#myTab").css('margin-left').slice(0, -2))
})
//加载二级选项卡tab
var packageCheckItems;
var suppliers;
var checkItemInfos;
var offerFileList;
var detaildivcenter;
var detaildiv;
function insetItmeTab(packageCheckList) {
	//参数
	var para = {
		projectId: projectId,
		packageId: packageId,
		packageCheckListId: packageCheckList.id,
		checkerCount: packageData.projectCheckers[0].checkerCount,
		roleType: 2,
		examCheckType:1
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
    var mask =parent.layer.load(0, {shade: [0.3, '#000000']});
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckItem.do",
		data: para,
		async: false,
		success: function(result) {
			data = result.data;
			if(data) {
				if(data.suppliers.length > 0) {
					packageCheckItems = data.packageCheckItems;
					suppliers = data.suppliers;
					checkItemInfos = data.checkItemInfos;
					offerFileList=data.offerFileList;									
					var detaildiv = "<div style='width: 100%;overflow:hidden;float:left' id='ulTab_"+ packageCheckList.id +"'>";
					detaildiv += "<ul id='Tab_" + packageCheckList.id + "' class='nav nav-tabs' style='background-color:#FBFBFB;border-top: 0px solid;'>"; //供应商小的tab绑定
					
					for(var j = 0; j < suppliers.length; j++) {
						if(j == 0) { //第一个选中
							detaildiv += "<li class='active' value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
							detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab("+ j +",\""+ packageCheckList.id +"\","+ packageCheckList.checkType +",\""+ packageCheckList.checkName +"\",\""+ packageCheckList.totalType +"\")'>" + suppliers[j].enterpriseName + "</a>";
							detaildiv += "</li>";
							//detaildivcenter += "<div class='tab-pane fade spacing show' id='" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
						} else {
							detaildiv += "<li  value='#" + packageCheckList.id + "_" + suppliers[j].supplierId + "'>";
							detaildiv += "<a href='javascript:void(0)' data-toggle='tab' onclick='checkItemTab("+ j +",\""+ packageCheckList.id +"\","+ packageCheckList.checkType +",\""+ packageCheckList.checkName +"\",\""+ packageCheckList.totalType +"\")'>" + suppliers[j].enterpriseName + "</a>";
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
					checkItemTab(0,packageCheckList.id,packageCheckList.checkType,packageCheckList.checkName,packageCheckList.totalType)
					if(packageData.isStopCheck == 1) {
						$(".btn").hide();
						$('input').attr('disabled',true);
						$('button').attr('disabled',true);
					}
					if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
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
				} else {
					top.layer.alert("所有报名供应商已全部淘汰！");
					tabOne()
					return;
				}
			} else {
				top.layer.alert("请在所有评委评审完成后进行此项操作！");			
				tabOne()
				return false;
			}
		}
	});
}
function checkItemTab(j,uid,type,checkName,totalType){	
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
		   		'examType':0,
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
	//tatile(suppliers[j].supplierId);
	
	//评审方法&汇总方式
	switch(type) {
		case 0:
			detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：合格制 </br>";
			detaildivcenter += "汇总方式： 评委全体成员按照少数服从多数（"+(datalst.totalM || "二")+"分之"+(datalst.totalN || "一")+"）的原则判定评价标准是否合格。</br>1、若评审项为关键要求，任何一项不合格都将淘汰。</br>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</span></div>";
			
			break;
		case 1:
			detaildivcenter += "<div style='float: left;'><span style='color:red'>评审方法：评分制</br>";
			//if(packageCheckList.totalType == '0') {
			//if(packageData.projectCheckers[0].checkerCount >= totalType){			
			if(totalType==0){	
				detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
			} else if(totalType==1){
				detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
			}else{
				if(packageData.projectCheckers[0].checkerCount >= totalType){
					detaildivcenter += "汇总方式： 评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分";
				}else{
					detaildivcenter += "汇总方式： 评委全体成员评分计算出平均得分，即为供应商评审因素最后得分";
				}
			}
				detaildivcenter +="</span></div>"
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
//导出
function loadExcel(uid,enterpriseName,checkName){
	var urls = url + "/PackageCheckItemController/outPackageCheckItemByExcel.do?packageCheckListId="+uid+'&exclName='+enterpriseName+checkName+'的评审打分';
	window.location.href =$.parserUrlForToken(urls);	
}
$("#downloadAllFile").click(function(){
	var newUrl=$.parserUrlForToken(top.config.bidhost+"/ProjectReviewController/downloadAllPurFile.do?projectId="+projectId+"&packageId="+packageId+"&examType=0")
	window.location.href = newUrl;
});
$("#fileCheck").click(function(){
	var newUrl=$.parserUrlForToken(top.config.bidhost+"/ProjectReviewController/downloadPurFile.do?projectId="+projectId+"&packageId="+packageId+"&examType=0")
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
                	$(".totleScore_"+ uid+'_'+gid).html(resultL);
                	$('input[type="file"]').val("")
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
	/*
	var para = {};
	var rowindex = 0;
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId && $("#" + supplierId + "_" + data[i].id).val() != "") {
			para.supplierCount = suppliers.length;
			para.expertId = expertIds;
			para['checkItemInfos[' + rowindex + '].checkType'] = checkType;
			para['checkItemInfos[' + rowindex + '].projectId'] = projectId;
			para['checkItemInfos[' + rowindex + '].packageId'] = packageId;
			para['checkItemInfos[' + rowindex + '].supplierId'] = supplierId;
			para['checkItemInfos[' + rowindex + '].packageCheckItemId'] = data[i].id;
			para['checkItemInfos[' + rowindex + '].packageCheckListId'] = packageCheckListId;
			para['checkItemInfos[' + rowindex + '].isKey'] = '';
			para['checkItemInfos[' + rowindex + '].reason'] = "";
			para['checkItemInfos[' + rowindex + '].score'] = $("#" + supplierId + "_" + data[i].id).val();
			para['checkItemInfos[' + rowindex + '].itemState'] = itemState;
			para['checkItemInfos[' + rowindex + '].tempKey'] = data[i].isKey;

			if(checkItemInfos.length > 0) {
				for(var y = 0; y < checkItemInfos.length; y++) {
					if(data[i].id == checkItemInfos[y].packageCheckItemId && checkItemInfos[y].supplierId == supplierId) {
						para['checkItemInfos[' + rowindex + '].id'] = checkItemInfos[y].id;
					}
				}
			}
			rowindex++;
		}
	}*/
	
	//var tempIsKey="";
	//var tempReason="";
	var tempKey="";
	var tempId="";
	var tempPackageCheckItemId = "";
	var tempScore = "";
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId) {
			if(i == 0){
				//tempIsKey = $("#isKey_" + supplierId + "_" + data[i].id).val();
				/*if($("#reason_" + supplierId + "_" + data[i].id).val()){
					tempReason = $("#reason_" + supplierId + "_" + data[i].id).val();
				}else{
					tempReason = "~";
				}*/
				if($("#" + supplierId + "_" + data[i].id).val()){
					tempScore = $("#" + supplierId + "_" + data[i].id).val();
				}else{
					tempScore = "~";
				}
				tempKey = "~";
				tempPackageCheckItemId = data[i].id;
			}
			else{
				//tempIsKey += "@" + $("#isKey_" + supplierId + "_" + data[i].id).val();
				/*if($("#reason_" + supplierId + "_" + data[i].id).val()){
					tempReason += "@" + $("#reason_" + supplierId + "_" + data[i].id).val();
				}else{
					tempReason += "@" + "~";
				}*/
				if($("#" + supplierId + "_" + data[i].id).val()){
					tempScore += "@" + $("#" + supplierId + "_" + data[i].id).val();
				}else{
					tempScore += "@" + "~";
				}
				tempKey += "@" + "~";
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
		"isKey":tempKey,
		"reason":"",
		"score":tempScore,
		"packageCheckItemId":tempPackageCheckItemId,
		"itemState":itemState,
		"tempKey":"",
		"id":tempId,
		"tempType" : 1,
		"examType":0
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
					$("#submitBtn_" + packageCheckListId + "_" + supplierId).hide();
					$("#loadExcel_" + packageCheckListId + "_" + supplierId).hide();
					$("#importf_" + packageCheckListId + "_" + supplierId).hide();
					for(var i = 0; i < packageCheckItems.length; i++) {
						$("#" + supplierId + "_" + data[i].id).attr("disabled", "disabled");
					}
					
					if(keepNum != ""){
						clearTimeout(stops);
						countDown();
					}
					
				} else {
					top.layer.alert("保存成功");
				}
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

//点击提交结果  最低价法
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

	/*var para = {};
	var rowindex = 0;
	for(var i = 0; i < data.length; i++) {
		if(packageCheckListId == data[i].packageCheckListId && $("#isKey_" + supplierId + "_" + data[i].id).val() != "") {
			para.supplierCount = suppliers.length;
			para.expertId = expertIds;
			para['checkItemInfos[' + rowindex + '].checkType'] = checkType;
			para['checkItemInfos[' + rowindex + '].projectId'] = projectId;
			para['checkItemInfos[' + rowindex + '].packageId'] = packageId;
			para['checkItemInfos[' + rowindex + '].supplierId'] = supplierId;
			para['checkItemInfos[' + rowindex + '].packageCheckItemId'] = data[i].id;
			para['checkItemInfos[' + rowindex + '].packageCheckListId'] = packageCheckListId;
			para['checkItemInfos[' + rowindex + '].isKey'] = $("#isKey_" + supplierId + "_" + data[i].id).val();
			para['checkItemInfos[' + rowindex + '].reason'] = $("#reason_" + supplierId + "_" + data[i].id).val();
			para['checkItemInfos[' + rowindex + '].score'] = '0';
			para['checkItemInfos[' + rowindex + '].itemState'] = itemState;
			para['checkItemInfos[' + rowindex + '].tempKey'] = data[i].isKey;

			if(checkItemInfos.length > 0) {
				for(var y = 0; y < checkItemInfos.length; y++) {
					if(checkItemInfos[y].supplierId == supplierId && data[i].id == checkItemInfos[y].packageCheckItemId) {
						para['checkItemInfos[' + rowindex + '].id'] = checkItemInfos[y].id;
					}
				}
			}
			rowindex++;
		}
	}*/
	
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
			/*para.supplierCount = suppliers.length;
			para.expertId = expertIds;
			para['checkItemInfos[' + rowindex + '].checkType'] = checkType;
			para['checkItemInfos[' + rowindex + '].projectId'] = projectId;
			para['checkItemInfos[' + rowindex + '].packageId'] = packageId;
			para['checkItemInfos[' + rowindex + '].supplierId'] = supplierId;
			para['checkItemInfos[' + rowindex + '].packageCheckItemId'] = data[i].id;
			para['checkItemInfos[' + rowindex + '].packageCheckListId'] = packageCheckListId;
			para['checkItemInfos[' + rowindex + '].isKey'] = $("#isKey_" + supplierId + "_" + data[i].id).val();
			para['checkItemInfos[' + rowindex + '].reason'] = $("#reason_" + supplierId + "_" + data[i].id).val();
			para['checkItemInfos[' + rowindex + '].score'] = '0';
			para['checkItemInfos[' + rowindex + '].itemState'] = itemState;
			para['checkItemInfos[' + rowindex + '].tempKey'] = data[i].isKey;
rowindex++;*/
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
		"examType":0
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
					for(var i = 0; i < packageCheckItems.length; i++) {
						$("#isKey_" + supplierId + "_" + packageCheckItems[i].id).attr("disabled", "disabled");
						$("#reason_" + supplierId + "_" + packageCheckItems[i].id).attr("disabled", "disabled");
					}
					
					if(keepNum != ""){
						var flag = "";
						//是最多有效数量制
						//判断是否是最后一个合格项的最后一个供应商的打分
						for(var x=packageCheck.length-1;x>=0;x--){
							if(packageCheck[x].checkType == 0){
								flag = packageCheck[x].id;
								break;
							}
						}
						
						if(flag == packageCheckListId){
							//最后一个合格制评审项
							countDown();
						}
					  
						
					}
					
				} else {
					top.layer.alert("保存成功");
				}
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}
							
var stops="";								
function countDown(temp) {
	
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckList.do",
		data: {
			projectId: projectId,
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
	stops=setTimeout(function(){		
		countDown();
	},950)//循环
}								



//清单报价
function PackageOffer(packageData) {
	var data = packageData.offers;
	$("#PackageOfferTable").bootstrapTable({
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
		}, 
		{
			field: 'enterpriseName',
			title: '供应商名称'
		}, 
//		{
//			field: 'beforTaxPrice',
//			title: '不含税单价'
//		}, 
//		{
//			field: 'taxRate',
//			title: '税率(%)'
//		},
//		
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
//		}, 
//		{
//			field: 'afterTaxTotal',
//			title: '含税总价'
//		}
		]
	});
};

//报价文件供应商
function fileEnterprise(data) {
	$("#fileEnterpriseTable").bootstrapTable({
		data: data,
		clickToSelect: true,
		onClickRow: function(row) {
			var purFiles = packageData.purFiles;
			var files = new Array();
			for(x in purFiles) {
				if(purFiles[x].enterpriseId == row.supplierId)
					files.push(purFiles[x]);
			}
			$('#fileTable').bootstrapTable('load', files);
		},
		onCheck: function(row) {
			var purFiles = packageData.purFiles;
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
						var purFiles = packageData.purFiles;
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

//价格评审
var priceChecks;
var businessPriceSet;

function PriceCheck() {
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckInfo.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			checkPlan: checkPlan,
			checkerCount: packageData.projectCheckers[0].checkerCount,
			packageCheckListCount: packageData.packageCheckLists.length
		},
		async: true,
		success: function(data) {
			data = data.data;
			if(data) {
				if(checkPlan == 1||checkPlan == 2) {
					businessPriceSet = data.businessPriceSet;
					priceChecks = data.priceChecks;
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商总报价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br></br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
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
					}

					//价格评审表格
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
								title: '原报价(万元)'
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
								title: '最终报价(万元)',
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
							}, {
								field: 'deviateNum',
								title: '累计偏离项数 ',
								width: '100px',
								align: 'center',
								formatter: function(value, row, index) {
									return "<span type='text' id='deviateNum_" + row.supplierId + "'>" + (typeof(value) == 'undefined' ? '' : value) + "</span>";
								}
							}, {
								field: 'deviatePrice',
								title: '偏离调整加价 ',
								width: '180px',
								formatter: function(value, row, index) {
									if(data.priceCheck == "未完成") {
										if(businessPriceSet.checkType == 0) {
											return "<input type='text' id='deviatePrice_" + row.supplierId + "' value='" + (value || '') + "'></input>";
										} else {
											return "<span type='text' id='deviatePrice_" + row.supplierId + "' value='" + (value || '') + "'>" + (value || '') + "</span>";
										}
									} else {
										return value;
									}
								}
							}, {
								field: 'totalCheck',
								title: '评审总价 (万元)',
								width: '180px',
								formatter: function(value, row, index) {
									if(data.priceCheck == "未完成") {
										if(businessPriceSet.checkType == 0) {
											return "<input type='text' id='totalCheck_" + row.supplierId + "' value='" + (value || '') + "'></input>";
										} else {
											return "<span type='text' id='totalCheck_" + row.supplierId + "' value='" + (value || '') + "'>" + (value || '') + "</span>";
										}
									} else {
										return value;
									}
								}
							}
						]
					});
				} else {
					businessPriceSet = data.businessPriceSet;
					priceChecks = data.priceChecks;
					//评审规则、
					var roleObj = {
						'name': [businessPriceSet.businessName || '无', '最低有效投标价法', '基准价评分法', '最低报价为基准价法', '价格比较法'],
						'content': [businessPriceSet.businessContent || '无', '商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(总报价-最低有效投标价)/最低有效投标价]/扣分的最小档次</br>说明</br>(1)、有效报价为基准价*(1+有效报价范围)和基准价*(1-有效报价范围)之间的报价</br>(2)、当N为小数时，直接进一取整',
							 (businessPriceSet.basePriceRole==0?'基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例':'去掉一个最高有效报价和一个最低有效报价后，再按“基准价=(参与应标的有效供应商报价总价/有效供应商家数)*计价比例”计算')+'</br>N=[(供应商报价-基准价)/基准价]/基准价比例</br></br>商务报价得分= 权重值 *（基准分-|N*扣分值|）',
							'商务报价得分=商务报价分值-N*最小挡扣分</br>N=[(供应商报价-基准价)/基准价]/扣分的最小档次</br>说明:当N为小数时，直接进一取整',
							'偏离调整=累计偏离值*参与应标的有效供应商报价总价*上浮比例</br>调整后最终总报价=参与应标的有效供应商报价总价+偏离调整'
						]
						
					}
					$("#businessName").html("评分名称：" + roleObj.name[businessPriceSet.checkType]);
					$("#weight").html("权重：" + businessPriceSet.weight);
					
					$("#businessContent").html("商务报价计算公式：</br>" + roleObj.content[businessPriceSet.checkType]);
                    if(businessPriceSet.checkType==3) $("#businessType").html("商务报价参数：每高于基准价"+ businessPriceSet.reduceLevel +"%，扣"+ businessPriceSet.reduceScore +"分,基准价：供应商最低报价*计价比例"+ businessPriceSet.priceProportion +"%");
                    if(businessPriceSet.checkType==1) $("#businessType").html("商务报价参数：扣分的最小档次："+ businessPriceSet.reduceLevel +"%，最小档扣分："+ businessPriceSet.reduceScore +"分，基准价"+ businessPriceSet.basePrice +"元，有效报价范围（基准价上下浮动比例）±"+businessPriceSet.offerRange+"%");
                    if(businessPriceSet.checkType==2) $("#businessType").html("商务报价参数：</br>" 
                                                                              +"基准分："+ businessPriceSet.baseScore +"分，计价比例："+ businessPriceSet.priceProportion +"%</br>"
                                                                              +'当有效报价高于基准价时，基准价比例：'+businessPriceSet.basePriceProportionHigh +"%，扣分值："+businessPriceSet.additionReduceScore1+'分</br>'
                                                                              +'当有效报价低于基准价时，基准价比例：'+businessPriceSet.basePriceProportionLow +"%，扣分值："+businessPriceSet.additionReduceScore2+'分</br>');
                    if(businessPriceSet.checkType==4) $("#businessType").html("上浮比例(一般要求下偏离致供应商报价上浮)："+ businessPriceSet.floatProportion +"%");
					if(data.priceCheck == "已完成") {
						$("#savediv").hide();
					}
					//价格评审表格

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
								title: '原报价(万元)'
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
								title: '最终报价(万元)',
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
				top.layer.alert("请在所有评委打分完成后，进行此项操作！");
				$("#myTab li").removeClass('active');
				$("li[value='#PackageOffer']").addClass('active');
				$("#myTabContent div").removeClass('show');
				$("#PackageOffer").addClass("show");
			}
		}
	});
}

//保存价格评审
function savepriceChecks() {
	if(businessPriceSet.checkType == 0) {
		for(var i = 0; i < priceChecks.length; i++) {
			if(checkPlan == 1) {
				if($("#finalPrice_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入最终报价");
					return false;
				}
				if($("#deviateNum_" + priceChecks[i].supplierId).html().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入累计偏离项数");
					return false;
				}
				if($("#deviatePrice_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入偏离调整加价");
					return false;
				}
				if($("#totalCheck_" + priceChecks[i].supplierId).val().length == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入评审总价");
					return false;
				}
			} else {
				if($("#finalPrice_" + priceChecks[i].supplierId).val() == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入最终报价");
					return false;
				}
				if($("#score_" + priceChecks[i].supplierId).val() == '' && priceChecks[i].isOut == 0) {
					top.layer.alert("请输入商务报价得分");
					return false;
				}
				if(!/^[0-9]{1,3}$/.test($("#score_" + priceChecks[i].supplierId).val()) && priceChecks[i].isOut == 0) {
					top.layer.alert("商务报价得分只能是纯数字");
					return false;
				}
				if(parseInt($("#score_" + priceChecks[i].supplierId).val()) > (100 * parseFloat(businessPriceSet.weight)) && priceChecks[i].isOut == 0) {
					top.layer.alert("商务报价得分超出最大范围" + (100 * parseFloat(businessPriceSet.weight)));
					return false;
				}
			}
		}
	}

	var para = {};
	for(var i = 0; i < priceChecks.length; i++) {
		para['priceChecks[' + i + '].projectId'] = packageData.projectId;
		para['priceChecks[' + i + '].packageId'] = packageData.packageId;
		para['priceChecks[' + i + '].supplierId'] = priceChecks[i].supplierId;
		if(checkPlan == 1) {
			para['priceChecks[' + i + '].deviateNum'] = $("#deviateNum_" + priceChecks[i].supplierId).html();
			if(businessPriceSet.checkType == 0) {
				para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).val();
				para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).val();
				para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).val();
			} else {
				para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).attr("value");
				para['priceChecks[' + i + '].deviatePrice'] = $("#deviatePrice_" + priceChecks[i].supplierId).attr("value");
				para['priceChecks[' + i + '].totalCheck'] = $("#totalCheck_" + priceChecks[i].supplierId).attr("value");
			}
		} else {
			if(businessPriceSet.checkType == 0) {
				para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).val();
				para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).val();
			} else {
				para['priceChecks[' + i + '].score'] = $("#score_" + priceChecks[i].supplierId).attr("value");
				para['priceChecks[' + i + '].finalPrice'] = $("#finalPrice_" + priceChecks[i].supplierId).attr("value");
			}
		}

		if(priceChecks[i].id) {
			para['priceChecks[' + i + '].id'] = priceChecks[i].id
		};
		para.expertId = expertIds;
	}
	$.ajax({
		type: "POST",
		url: url + "/WaitCheckProjectController/priceCheck.do",
		data: para,
		async: true,
		success: function(data) {
			if(data.success) {
				window.location.reload();
				$("#savediv").hide();
				top.layer.alert('提交成功!');
			} else {
				if(data.message) {
					top.layer.alert(data.message);
				} else {
					top.layer.alert("提交失败");
				}
			}
		}
	});
}

//评审记录汇总
var CheckTotals;
var orderOfferList = [];
function PriceCheckTotal(projectId, packageId) {
	
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPriceCheckTotal.do",
		data: {
			projectId: projectId,
			packageId: packageId,
			examCheckType:1,
			checkPlan: checkPlan
		},
		async: false,
		success: function(data) {
			data = data.data;
			CheckTotals = data;			
			if(data.checkItem == '已完成') {
				clearTimeout(stops);
				$("#checkPlace").html(data.priceCheckTotals[0].checkPlace);
				$("#checkDate").html(data.priceCheckTotals[0].checkDate);
				$("#checkRemark").html(data.priceCheckTotals[0].checkRemark);

				var priceCheckItems =[];
				if(CheckTotals.priceCheckItems && CheckTotals.priceCheckItems.length > 0) {
					priceCheckItems = CheckTotals.priceCheckItems;
				}
				
				if(CheckTotals.orderOfferList){
					orderOfferList = CheckTotals.orderOfferList;
				}
			
				var html = '';
				var checker = CheckTotals.experts; //评委
				var list = CheckTotals.packageCheckLists; //评审项
				var priceChecks =  CheckTotals.offers; //打分情况
				if(priceChecks) {					
					html += "<tbody><tr>";
					html += "<td style='text-align:left' width='200px'>供应商名称</td>";
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
							html += "<td style='text-align:center;' rowspan='" + enterpriseRowspan + "'>" + priceChecks[i].enterpriseName + "</td>";
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
												html += "<td style='text-align:center' rowspan='" +item.length+ "'>/</td>"
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
														html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  rowspan='" + enterpriseRowspan + "'>不合格</td>";
													}else{
														html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  rowspan='" + enterpriseRowspan + "'>合格</td>";
													}
												}
											}
										}else{
											if(priceChecks.isOut==0){
												html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='1'  rowspan='" + enterpriseRowspan + "'>不合格</td>";
												
											}else{
												//if(checkPlan == 3){
												if(checkPlan == 1){		
													html += "<td style='text-align:center' rowspan='" + enterpriseRowspan + "'><input class='iso' type='checkbox' id='isChoose_" + priceChecks[i].supplierId + "' ></td>";
													
												}else{
													
													html += "<td style='text-align:center;' id='isOut_" + priceChecks[i].supplierId + "' value='0'  rowspan='" + enterpriseRowspan + "'>合格</td>";
												}
											}
										}
										
										html += "<td style='text-align:center;display:none' rowspan='" + enterpriseRowspan + "'><span id='total_" + priceChecks[i].supplierId + "' value='" + priceChecks[i].total + "'>" + priceChecks[i].total + "</sapn>"+"</td>";
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
				top.layer.alert("评审记录汇总未完成！");
				/*if(keepNum != ""){
					
					getList();
				}*/
				
				tabOne();
			}
		}
	});
}

/*function getList(){
	$.ajax({
		type: "post",
		url: url + "/ProjectReviewController/getPackageCheckList.do",
		data: {
			projectId: projectId,
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


//预览
$(".viewCheckReport").click(function() {
	if(CheckTotals.checkReport == '已完成') {
		previewPdf(CheckTotals.checkReports[0].reportUrl);
		//window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl));
	} else {
		top.layer.alert("预审报告未生成！");
	}
});
function viewCheckReport(reportUrl){
	previewPdf(reportUrl);
}
//下载
$("#downloadCheckReport").click(function() {
	if(CheckTotals.checkReport == '已完成') {
		window.open($.parserUrlForToken(top.config.bidhost + "/FileController/download.do?ftpPath=" + CheckTotals.checkReports[0].reportUrl + "&fname=" + packageData.packageName + "_预审报告"));
	} else {
		top.layer.alert("预审报告未生成！");
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
						title: '预审报告',
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
						formatter: function(value, row, index) {
							var btn="<a class='btn btn-primary btn-xs' style='margin-right:5px' href='${" + $.parserUrlForToken(url + "/FileController/download.do?ftpPath=" + row.reportUrl + "&fname=" + packageData.packageName + "_评审报告") + "}'>下载</a><a class='btn btn-primary btn-xs' onclick=viewCheckReport(\""+ row.reportUrl +"\") href='javascript:void(0)'>预览</a>";
							return btn
						}
					}]
				});
				if(packageData.isStopCheck == 1) {
					$(".btn").hide();
					$('input').attr('disabled',true);
					$('button').attr('disabled',true);
				}
				if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
					$(".btn").hide();
					$('input').attr('disabled',true);
					$('button').attr('disabled',true);
				}
			} else {
				top.layer.alert("预审报告未生成！");
				tabOne()
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
	strUlHtml += "<div style='width: 100%;height: 423px; border: 1px #ddd solid;' id='TabContent'>";
					
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
	
};
//一键流标
$("#StopCheck").click(function() {
	top.layer.confirm("温馨提示:流标后该包件将作废,是否确定提交流标申请?", function(indexs) {
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
				//isStopCheck: 1,
				stopCheckReason:text,
				examType:0
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
			checkType:1,
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
			checkType:1,
			examCheckType:0
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
				if(packageData.stopCheckReason!=""&&packageData.stopCheckReason!=undefined){
					$(".btn").hide();
					$('input').attr('disabled',true);
					$('button').attr('disabled',true);
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

//查看
$("#viewProject").click(function() { 
	sessionStorage.setItem('tenderTypeCode', tenderType);//0是询价采购  6是单一来源采购，并缓存	
   	sessionStorage.setItem('examType', 0);//0是询价采购  6是单一来源采购，并缓存	
    sessionStorage.setItem('purchaseaDataId', JSON.stringify(projectId));//获取当前选择行的数据，并缓存	
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:tenderType==0?'查看询价采购公告':'单一来源采购公告'
        ,area: ['80%', '80%']
        ,maxmin: true //开启最大化最小化按钮
        ,content:urlPurchaseInfo
        ,success:function(layero,index){
        	iframeWin=layero.find('iframe')[0].contentWindow;  
        	iframeWin.Purchase(projectId)
        	iframeWin.du(packageId)
        	//iframeWin.checkMsg();
        	//iframeWin.findpackage(obj.projectId);
        	//iframeWin.findpackageDetail();
        } ,btn: ['关闭'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow; 
          parent.layer.close(index);
        },
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