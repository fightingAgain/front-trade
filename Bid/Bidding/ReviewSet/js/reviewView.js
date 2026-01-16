/**

 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/CheckAuditController/save.do';  //保存接口
var submitUrl = config.tenderHost + '/CheckController/save.do';  //提交接口
var detailUrl = config.tenderHost + '/CheckAuditController/get.do'; // 详情

var setUrl = config.Reviewhost + '/CheckTypeInfoController/findCheckTypeInfo.do'; // 根据评审办法分类ID和评标方法查询评审办法




var viewPage = 'Bidding/ReviewSet/model/checkView.html'; //编辑大项


var bidSectionId = ""; //标段id
var examType = ""; //标段阶段
var tenderProjectType; //项目类型
var bidCheckType;  //评审类型

var reviewFirst;
var reviewSecond;
var reviewData = [];
var scoreCount;  //最大打分项个数
var checkRule = [];  //评审规则
var checkIndex;  //大项index
var basicRule;  //评审基本规则
$(function(){

	// 获取连接传递的参数
 	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined"){
		bidSectionId =$.getUrlParam("id");
		detailInfo();
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//查看大项
	$("#btnCheckView").click(function(){
		openCheckView($("#reviewFirst li.active").attr("data-index"));
	});
	
	//切换大项
	$("#reviewFirst").on("click", "li:not(#btnCheckBlock)", function(){
		var checkType = reviewData[checkIndex].checkType;
		var tips = "";
		$(this).addClass("active").siblings("li").removeClass("active");
		checkIndex = Number($(this).attr("data-index"));
		reviewSecondHtml();
		checkDetail();
	});
});


//大项内容
function checkDetail(){
	var arr;
	arr = reviewData[checkIndex];
	$("#maxDeviate, #isAddToTotal, #isAddPrice, #isAddPriceShow, #score, #weight").html("");
	for(var key in arr){
		if(key == "checkStage"){
			if(arr[key] == 1){
				$("#" + key).html("初步评审");
			} else {
				$("#" + key).html("详细评审");
			}
		} else if(key == "checkType"){
			if(arr[key] == 0){
				$("#" + key).html("合格制");
			} else if(arr[key] == 1) {
				$("#" + key).html("偏离制");
			} else if(arr[key] == 2) {
				$("#" + key).html("响应制");
			} else if(arr[key] == 3) {
				$("#" + key).html("打分制");
			}
		} else if(key == "ratioMolecular"){
			$("#ratioMolecular").html(arr.ratioMolecular + " / " + arr.ratioDenominator);
		} else if(key == "isAddToTotal"){
			$("#isAddToTotal").html(arr[key] == 1 ? "是" : "否");
		} else if(key == "isAddPrice"){
			$("#isAddPrice").html(arr[key] == 1 ? "是" : "否");
		} else if(key == "avgType") {
			$("#avgType").html(arr[key] == 1 ? "算术平均分" : arr[key] == 2?"分项得分求和，分项得分为各评委去掉一个最高分和一个最低分后的平均分":"各评委去掉一个最高分和一个最低分求平均分");
		} else if(key == "scoreType") {
			$("#scoreType").html(arr[key] == 1 ? "自动打分" : "评委打分");
			if(arr[key] == 1){
				$("#btnSet").show();
				$("#btnItemBlock").hide();
			} else {
				$("#btnSet").hide();
				$("#btnItemBlock").show();
			}
		} else {
			$("#" + key).html(arr[key]);
		}
	}
	if(arr.isAddPrice == 1 && arr.checkType == 1){
		$(".isAddPriceModule").show();
	} else {
		$(".isAddPriceModule").hide();
	}
	
	$(".checkType").hide();
	if(arr.checkType != 3){
		$(".checkTypeCom").show();
	}
	$(".checkType" + arr.checkType).show();
}
//根据评审办法分类ID和评标方法查询评审办法
function reviewSet(crule){
	$.ajax({
		type: "post",
		url: setUrl,
		async: false,
		data:{
			examType: examType,
			tenderProjectType: tenderProjectType,
			checkType: bidCheckType
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			if(!data.data.checkTypeInfoList || data.data.checkTypeInfoList.length == 0){
				return;
			}
			var arr = data.data.checkTypeInfoList[0];
			
			basicRule = arr;
			if(arr.isDeviate == 1){
				//是否有偏离  1是  0否
				//偏离加价  1是 0否
				if(arr.isAddPrice == 0){
					$(".isAddPriceModule").remove();
				}
			}
			//scoreCount打分最大项数，负数为不限制
			//打分类型，0是没有打分，1是总分，2是权重
			if(arr.scoreType == 0){
				$(".weightShow").remove();
				$(".avgTypeShow").remove();
			} else if(arr.scoreType == 1) {
				$(".weightShow").remove();
				$(".avgTypeShow").remove();
			} else if(arr.scoreType == 3){
				$(".weightShow").remove();
			}
			
			var setObj = data.data.bidCalculateVariableList;
			if(setObj.length > 0){
				var html = "";
				var checkRuleItem;
				checkRule = crule;
				for(var i = 0; i < setObj.length; i++){
					checkRuleItem = null;
					//variableType : 1是文本框  2是下拉框
					for(var k = 0; k < crule.length; k++){
						if(setObj[i].variableName == crule[k].dataName){
							checkRuleItem = crule[k];
							break;
						}
					}
					if(!checkRuleItem){
						checkRule.push({
							dataName:setObj[i].variableName,
							dataType:setObj[i].dataType,
							dataValue:setObj[i].defaultValue
						});
					}
					if(setObj[i].variableType == 1){
						html += '<tr class="varList" data-index="'+i+'">\
									<td  class="th_bg">'+setObj[i].variableName+'</td>\
									<td>\
										<span style="padding-right:20px;">'+(checkRuleItem ? checkRuleItem.dataValue : setObj[i].defaultValue)+'</span>\
										<span class="red">范围：'+setObj[i].rangeMin+' ~ '+setObj[i].rangeMax+' ('+setObj[i].decimalLength+'位小数)</span>\
									</td>\
								</tr>';
					} else if(setObj[i].variableType == 0) {
						var oplist = setObj[i].constEnum.split(",");
						html += '<tr class="varList" data-index="'+i+'">\
									<td  class="th_bg">'+setObj[i].variableName+'<i class="red">*</i></td>\
									<td><span>'+(checkRuleItem ? checkRuleItem.dataValue : setObj[i].defaultValue)+'</span></td></tr>';
					}
				}
				$("#divideBlock").before(html);
			}
		}
	});
}


//编辑大项
function openCheckView(index){
	var data;
	if(index != undefined){
		data = reviewData[index];
	}
	top.layer.open({
		type: 2,
		title: "评审项",
		area: ['1000px', '90%'],
		resize: false,
		content: viewPage + "?bidSectionId=" + bidSectionId + "&examType="+examType+"&checkType=" + bidCheckType,
		success:function(layero, idx){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data, basicRule); 
		}
	});
}



//标段详情
 function detailInfo() {	
     $.ajax({
         url: detailUrl,
         type: "post",
         data: {
			 bidSectionId:bidSectionId,
			 examType:examType
		 },
         async: false,
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
         	var arr = data.data;
         	$("#interiorBidSectionCode").html(arr.interiorBidSectionCode);
         	$("#bidSectionName").html(arr.bidSectionName);
			tenderProjectType = arr.tenderProjectClassifyCode.substring(0,1);
			if(examType == 1){
				bidCheckType = arr.pretrialCheckType;
			} else {
				bidCheckType = arr.checkType;
			}
			if(bidCheckType == 8){
				$('.checkType8').html('减')
			};
			var cRule = arr.bidSectionDataAuditList ? arr.bidSectionDataAuditList : [];
			reviewSet(cRule);
         	
			if(arr.checkAuditList && arr.checkAuditList.length > 0){
				reviewData = arr.checkAuditList;
	         	reviewFirstHtml();
			} else {
				$("#btnCheckBlock").hide();
				$("#btnItemBlock").hide();
				$("#checkInfo").hide();
			}
			
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
     });
}
 
 //评审大项列表
function reviewFirstHtml(data){
	var html = "";
 	$("#reviewFirst li#btnCheckBlock").siblings("li").remove();
	if(!data){
		data = reviewData;
	}
	if(data.length == 0){
		reviewSecondHtml();
		return;
	}
	
 	for(var i = 0; i < data.length; i++){
 		var item = data[i];
		if(checkIndex){
			if(i == checkIndex){
				html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'" class="active"><a href="javascript:;">'+item.checkName+'</a></li>';
			} else {
				html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'"><a href="javascript:;">'+item.checkName+'</a></li>';
			}
		}else {
	 		if(i == 0){
	 			html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'" class="active"><a href="javascript:;">'+item.checkName+'</a></li>';
	 		} else {
	 			html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'"><a href="javascript:;">'+item.checkName+'</a></li>';
	 		}
 		}
 	}
 	$("#btnCheckBlock").before(html);
 	checkIndex = Number($("#reviewFirst li.active").attr("data-index"));
 	reviewSecondHtml();
 	checkDetail();
}
 //评审小项列表
function reviewSecondHtml(data){
	$("#reviewSecond tr").remove();
	if(!data){
		data = reviewData[checkIndex] && reviewData[checkIndex].checkItemAuditList ? reviewData[checkIndex].checkItemAuditList : [];
	}
	if(data.length == 0){
		return;
	}
 	
 	var checkType = reviewData[checkIndex].checkType; 
 	var html = '<tr><th style="width:50px;text-align:center;">序号</th><th style="min-width:200px;">评价内容</th><th>评价标准</th>';
 	if(checkType == 3){
 		html += '<th style="width:90px;text-align:center;">分值</th>';
		html += '<th style="width:90px;text-align:center;">打分类型</th>';
 	} else {
 		html += '<th style="width:120px;text-align:center;">是否关键要求</th>';
 	}
 		html += '<th style="min-width:50px;">备注</th></tr>';
 	for(var i = 0; i < data.length; i++){
 		var item = data[i];
		var checkName = item.checkName?item.checkName.replace('<','&lt;').replace('>','&gt;'):'';
		var checkStandard = item.checkStandard?item.checkStandard.replace('<','&lt;').replace('>','&gt;'):'';
 		html += '<tr>'
 				+ '<td style="text-align:center;">'+(i+1)+'</td>'
 				+ '<td>'+checkName+'</td>'
 				+ '<td>'+checkStandard+'</td>';
 		if(checkType == 3){
 			html += '<td style="text-align:center;">'+(item.score ? item.score : "")+'</td>';
			var itemScoreType = '';
			if(item.itemScoreType=='1'){
				itemScoreType = '主观分';
			}else if(item.itemScoreType=='2'){
				itemScoreType = '客观分';
			}
			html += '<td style="text-align:center;">'+itemScoreType+'</td>';
 		} else {
 			html += '<td style="text-align:center;">'+(item.isKey == 1 ? "是" : "否")+'</td>';
 		}
 		
 		html += '<td>'+(item.remark ? item.remark : "")+'</td>'
 			 	+ '</tr>';
 	}
 	$(html).appendTo("#reviewSecond");
 }

