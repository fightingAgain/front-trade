/**
 * 2019-05-21 by hwf
 * 上传招标文件
 */

var saveUrl = config.tenderHost + '/CheckAuditController/save.do';  //保存接口
var submitUrl = config.tenderHost + '/CheckController/save.do';  //提交接口
var detailUrl = config.tenderHost + '/CheckAuditController/get.do'; // 详情
var checkUrl = config.tenderHost + '/CheckController/findByBidSectionId.do'; // 大项列表
var checkInfoUrl = config.tenderHost + '/CheckController/findById.do'; // 大项内容
var itemUrl = config.tenderHost + '/CheckItemAuditController/findList.do'; // 小项列表
var itemDelUrl = config.tenderHost + '/CheckItemAuditController/delete.do'; // 小项删除
var checkDelUrl = config.tenderHost + '/CheckController/delete.do'; // 大项删除

var setUrl = config.Reviewhost + '/CheckTypeInfoController/findCheckTypeInfo.do'; // 根据评审办法分类ID和评标方法查询评审办法

var exportUrl = config.tenderHost + "/CheckAuditController/exportExcel.do";  // 导出
var importUrl = config.tenderHost + "/CheckAuditController/saveByexcel.do";  //导入

var itemPage = 'Bidding/ReviewSet/model/itemEdit.html'; //小项编辑
var editPage = 'Bidding/ReviewSet/model/checkEdit.html'; //编辑大项
var autoPage = 'Bidding/ReviewSet/model/autoEdit.html'; //自动计算

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
var variableList;  //自定义变量
var bidType;//招标类型（0 明标  1暗标）
var isTip = $.getUrlParam("isTip");
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
	//添加评审项
	$("#addCheck").click(function() {
		openCheckEdit();
	});
	
	//添加分项
	$("#addItem").click(function() {
		if($("#reviewFirst li.active").length == 0){
			top.layer.alert("请先添加评审项");
			return;
		}
		openItemEdit();
	});
	
	//编辑小项
	$("#reviewSecond").on("click", ".btnEdit", function(){
		var index = $(this).attr("data-index");
		openItemEdit(index);
	});
	//删除小项
	$("#reviewSecond").on("click", ".btnDel", function(){
		var index = $(this).attr("data-index");
		parent.layer.confirm('确定删除该项?', {icon: 3, title:'询问'}, function(idx){
			parent.layer.close(idx);
			reviewData[checkIndex].checkItemAuditList.splice(index, 1);
			reviewSecondHtml();
		});
	});
	
	//评审方式
	$("[name='checkType']").change(function(){
		var val = $(this).val();
		$(".checkType").hide();
		if(val != 3){
			$(".checkTypeCom").show();
		}
		$(".checkType" + val).show();
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
	
	//编辑大项
	$("#btnCheckEdit").click(function(){
		openCheckEdit($("#reviewFirst li.active").attr("data-index"));
	});
	
	//删除评审项
	$("#btnCheckDel").click(function() {
		parent.layer.confirm('确定删除该项?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			reviewData.splice(checkIndex, 1);
			checkIndex = "";
			if(reviewData.length == 0){
//				$("#addItem").hide();
//				$("#btnImport").hide();
//				$("#btnExport").hide();
				$("#btnCheckBlock").hide();
				$("#btnItemBlock").hide();
				$("#checkInfo").hide();
			}
			reviewFirstHtml();
		});
	});
	
	//保存
	$("#btnSave").click(function(){
		if(!formaterCheckRule()){
			return;
		}
		saveForm(true);
	});
	//提交
	$("#btnSubmit").click(function(){
		if(!formaterCheckRule()){
			return;
		}
		checkForm();
	});
	
	//自动计算
	$("#btnSet").click(function(){
		openAutoEdit();
	});
	//导出
	$("#btnExport").click(function(){
		var ctype = reviewData[checkIndex].checkType;
		window.location.href = $.parserUrlForToken(exportUrl + "?checkType=" + ctype);
	});
	
	//左移
	$("#btnMoveLeft").click(function(){
		if(checkIndex == 0){
			return;
		}
		var temp = reviewData[checkIndex];
		reviewData[checkIndex] = reviewData[checkIndex-1];
		reviewData[checkIndex-1] = temp;
		checkIndex --;
		reviewFirstHtml();
	});
	//右移
	$("#btnMoveRight").click(function(){
		if(checkIndex == reviewData.length-1){
			return;
		}
		var temp = reviewData[checkIndex];
		reviewData[checkIndex] = reviewData[checkIndex+1];
		reviewData[checkIndex+1] = temp;
		checkIndex ++;
		reviewFirstHtml();
	});
	//上移
	$("#reviewSecond").on("click", ".btnUp", function(){
		var index = Number($(this).attr("data-index"));
		if(index == 0){
			return;
		}
		var item = reviewData[checkIndex].checkItemAuditList;
		var temp = item[index];
		item[index] = item[index-1];
		item[index-1] = temp;
		reviewSecondHtml();
	});
	//下移
	$("#reviewSecond").on("click", ".btnDown", function(){
		var index = Number($(this).attr("data-index"));
		var item = reviewData[checkIndex].checkItemAuditList;
		if(index == item.length - 1){
			return;
		}
		
		var temp = item[index];
		item[index] = item[index+1];
		item[index+1] = temp;
		reviewSecondHtml();
	});
	
});
//excel导入
function importf(obj){ 
  	var f = obj.files[0];
  	var suffix = f && f.name ? f.name.substring(f.name.lastIndexOf(".") + 1) : "";
  	if(suffix != "xlsx" && suffix != "xls"){
  		$(".iptFile").val("");
  		parent.layer.alert("请上传Execl文件");
  		return;
  	}
	var formFile = new FormData();
	formFile.append("checkId", reviewData[checkIndex].id); 
	formFile.append("excel", f); //加入文件对象
	var data=formFile
   $.ajax({
		type: "post",
		url: importUrl,
		async: false,
		dataType: 'json',
		cache: false,//上传文件无需缓存
        processData: false,//用于对data参数进行序列化处理 这里必须false
        contentType: false, //必须
		data: data,
		success: function(data) {
			$(".iptFile").val("");
			if(data.success){
				parent.layer.alert(data.data);
				itemInfo();
				
			} else {
				parent.layer.alert(data.message);
			}
			
		}
	});
	
}

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
			variableList = setObj;
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
							dataValue:setObj[i].defaultValue,
						});
					}
					if(setObj[i].variableType == 1){
						html += '<tr class="varList" data-index="'+i+'" data-name="'+setObj[i].variableName+'">\
									<td  class="th_bg">'+setObj[i].variableName+'<i class="red">*</i></td>\
									<td>\
										<input type="text" class="form-control dataName" value="'+(checkRuleItem ? checkRuleItem.dataValue : setObj[i].defaultValue)+'" oninput="priceInput(this, '+setObj[i].decimalLength+')" style="width: 160px;display: inline-block;margin-right: 10px;" />\
										<span class="red">范围：'+setObj[i].rangeMin+' ~ '+setObj[i].rangeMax+' ('+setObj[i].decimalLength+'位小数)</span>\
									</td>\
								</tr>';
					} else if(setObj[i].variableType == 0) {
						var oplist = setObj[i].constEnum.split(",");
						html += '<tr class="varList" data-index="'+i+'"  data-name="'+setObj[i].variableName+'">\
									<td  class="th_bg">'+setObj[i].variableName+'<i class="red">*</i></td>\
									<td>\
										<select class="form-control dataName">';
						for(var j = 0; j < oplist.length; j++){
							if(checkRuleItem && (checkRuleItem.dataValue == oplist[j])){
								html += '<option selected value='+oplist[j]+'>'+oplist[j]+'</option>';
							} else {
								html += '<option value='+oplist[j]+'>'+oplist[j]+'</option>';
							}
						}
						html += '</select></td></tr>';
					}
				}
				$("#divideBlock").before(html);
			}
		}
	});
}

//编辑小项
function openItemEdit(index){
	var data;
	if(index != undefined){
		data = reviewData[checkIndex].checkItemAuditList[index];
	}
	var checkType = reviewData[checkIndex].checkType; 
	top.layer.open({
		type: 2,
		title: "评审项设置",
		area: ['800px', '90%'],
		resize: false,
		content: itemPage + "?checkType=" + checkType + "&checkId=" + reviewData[checkIndex].id,
		success:function(layero, idx){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(data, function(param){
				if(index || index == 0){
					$.extend(data, param);
				} else {
					if(!reviewData[checkIndex].checkItemAuditList){
						reviewData[checkIndex].checkItemAuditList = [];
					}
					reviewData[checkIndex].checkItemAuditList.push(param);
				}
				reviewSecondHtml();
//				itemInfo();
			}); 
		}
	});
}
//编辑大项
function openCheckEdit(index){
	var data;
	if(index != undefined){
		data = reviewData[index];
	}
	top.layer.open({
		type: 2,
		title: "评审项设置",
		area: ['1000px', '90%'],
		resize: false,
		content: editPage + "?bidSectionId=" + bidSectionId + "&examType="+examType + "&bidType="+bidType+"&checkType=" + bidCheckType ,
		success:function(layero, idx){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(basicRule, function(param){
				$("#btnCheckBlock").show();
				$("#btnItemBlock").show();
				$("#checkInfo").show();
				if(index || index == 0){
					if(data.checkType != param.checkType){
						delete data.checkItemAuditList
					}
					$.extend(data, param);
				} else {
					param.checkItemAuditList = [];
					reviewData.push(param);
				}
				reviewFirstHtml();
			}, data); 
		}
	});
}


/**
 * 保存或提交接口
 * isSave true是保存  false是提交
 */
function saveForm(isSave){
	var url = "";
	var tips= "";
	if(isSave){
		url = saveUrl;
		tips="保存成功!";
	} else {
		url = submitUrl;
		tips="提交成功!";
	}
	var data = {};
	data.bidSectionId = bidSectionId;
	data.examType = examType;
	var totalScore = 0;
	var text = '';
	var isTips = false;
	for(var i = 0; i < reviewData.length; i++){
		reviewData[i].sort = i+1;
		var item = reviewData[i].checkItemAuditList ? reviewData[i].checkItemAuditList : [];
		if(item.length > 0){
			for(var j = 0; j < item.length; j++){
				item[j].sort = j+1;
			}
		}
		if(bidCheckType == 10 && reviewData[i].checkType == 3){
			totalScore += Number(reviewData[i].score)*Number(reviewData[i].weight) 
		}
		if(bidCheckType == 9 && reviewData[i].checkType == 3){
			if(Number(reviewData[i].score) != 100){
				isTips = true;
				text += '【'+reviewData[i].checkName + '】';
			}
		}
	}
	text += '满分';
	data.checkAuditList = reviewData;
	
	data.bidSectionDataAuditList = checkRule;
	if((bidCheckType == 10  && totalScore != 100) ||( bidCheckType == 9 && isTips)){
		top.layer.confirm((bidCheckType == 9?text:bidCheckType == 10?'综合得分合计':'')+'不等于100分，请确认是否'+(isSave?'保存':'提交')+'信息？',{icon:7,title:'询问'},
		function(index){
			sendMsg(data, url, tips, isSave)
			parent.layer.close(index);
		},function(index) {
			parent.layer.close(index);
		});
	}else{
		sendMsg(data, url, tips, isSave)
	}
};
function sendMsg(data, url, tips, isSave){
	$('#btnSave,#btnSubmit').attr('disabled', true);
	$.ajax({
		type: "post",
		url: url,
		contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
		data: JSON.stringify(data),//解决数据量大时后台接收不到，后台对应用字符串方式接收
		async: false,
		success: function(rst) {
			$('#btnSave,#btnSubmit').attr('disabled', false);
			if(rst.success) {
				top.layer.alert(tips);
				if(isSave){
					//top.layer.alert(tips);
					return;
				}
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
			} else {
				parent.layer.alert(rst.message);
				return;
			}
		},
		error: function(data) {
		 $('#btnSave,#btnSubmit').attr('disabled', false);
		 parent.layer.alert("提交失败！");
		}
	});
}

//格式化规则
function formaterCheckRule(){
	var rst = true;
	$(".varList").each(function(){
		var _this = $(this);
		var index = $(this).attr("data-index");
		var name = $(this).attr("data-name");
		var val = Number($.trim($(this).find(".dataName").val()));
		if(val < Number(variableList[index].rangeMin) || val > Number(variableList[index].rangeMax)){
			top.layer.alert("请正确输入"+ variableList[index].variableName, function(idx){
				top.layer.close(idx);
				_this.find(".dataName").focus();
			});
			rst = false;
			return false;
		}
		for(var i = 0;i<checkRule.length;i++){
			if(checkRule[i].dataName == name){
				checkRule[i].dataValue = $.trim($(this).find(".dataName").val());
				checkRule[i].dataType = "reviewData";
			}
		}
		
	});
	
	return rst;
}

Number.prototype.add = function(arg){   
    var r1,r2,m;   
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}   
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}   
    m=Math.pow(10,Math.max(r1,r2))   
    return (this*m+arg*m)/m   
}  
//提交验证规则
function checkForm(){
	var rst = true;  //验证结果
	var tips = "";  //提示消息
	var isPrimary = false;  //是否有初步评审
	var isFurther = false;  //是否有详细评审
	var scoreCount = 0;  //打分项个数
	var weight = 0;  //权重之和
	var maxDeviate = 0;  //总偏离项
	var isPriceScore = false;
	for(var i = 0; i < reviewData.length; i++){
		var item = reviewData[i].checkItemAuditList ? reviewData[i].checkItemAuditList : [];
		if(item.length == 0){
			tips += reviewData[i].checkName +"没有分项<br/>";
		}

		if(reviewData[i].checkType == 1 && reviewData[i].isAddToTotal == 1){
			//计算总偏离项数
			maxDeviate += Number(reviewData[i].maxDeviate);
		}
		if(reviewData[i].checkStage == 1){
			isPrimary = true;
			if(reviewData[i].checkType == 3 && examType == 2){
				parent.layer.alert("初步评审不能设置打分项");
				return false;
				break;
			}
		}
		if(reviewData[i].checkStage == 2){
			isFurther = true;
		}
		if(reviewData[i].checkType == 3){
			scoreCount ++;
			weight += Number(reviewData[i].weight);
			if(item.length > 0){
				//计算打分项总分数
				var score = 0;
				for(var j = 0; j < item.length; j++){
					score = score.add(item[j].score)
					// score += Number(item[j].score);
				}
			}
			if(score != reviewData[i].score){
				tips += reviewData[i].checkName + "的满分不等于小项之和<br/>";
			}
			if(reviewData[i].nodeType == 3){
				isPriceScore = true;
			}
		}
		if(reviewData[i].scoreType == 1 && (!reviewData[i].checkItemAuditList || reviewData[i].checkItemAuditList.length == 0)){
			tips += reviewData[i].checkName + "未设置自动打分参数<br/>";
		}
		
	}
	weight = weight.toFixed(2);
	if(basicRule.isMulitStage == 0 && isFurther){
		top.layer.alert("此评标办法不能设置详细评审");
		return false;
	}
	if(!isPrimary){
		tips += "未设置初步评审阶段<br/>";
	}
	
	for(var j = 0; j < checkRule.length; j++){
		//判断最大偏离项数
		if(checkRule[j].dataName == "最大偏离数"){
			if(maxDeviate > checkRule[j].dataValue){
				tips += "最大偏离数应大于等于各评审项偏离数之和<br/>"
			}
			break;
		}
	}
	if(basicRule.scoreType != "0" && scoreCount == 0){
		tips += "此评标办法必须设置打分项<br/>";
	}
	if(basicRule.scoreCount != -1 && scoreCount > Number(basicRule.scoreCount)){
		tips += "打分项不能多于" + basicRule.scoreCount + "项<br/>";
	}
	if(basicRule.scoreType == 2 && weight != 1){
		tips += "打分项权重之和不等于1<br/>";
	}
	if(basicRule.isOfferScore == 1 && isPriceScore == false){
		tips += "此评标办法必须设置价格打分<br/>"
	}
	var str = "";
	if(tips == ""){
		str += "确定提交?";
	} else {
		str += "<span class='red'>以下内容填写错误，提交后可能会影响评审阶段，如继续提交请点击 [确定] 按钮</span><br/><br/>" + tips;
	}
	top.layer.confirm(str,  function(idx){
		parent.layer.close(idx);
		if (isTip == 1) {
			top.layer.confirm('温馨提示：点击提交按钮，系统将自动执行重新评标操作。请确认是否提交？',  function(indx){
				parent.layer.close(indx);
				saveForm(false);
			});	
		} else {
			saveForm(false);
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
			 if(arr.bidType){
				bidType = arr.bidType;
			 }
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
		var checkName = item.checkName.replace('<','&lt;').replace('>','&gt;');
		if(checkIndex){
			if(i == checkIndex){
				html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'" class="active"><a href="javascript:;">'+checkName+'</a></li>';
			} else {
				html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'"><a href="javascript:;">'+checkName+'</a></li>';
			}
		}else {
	 		if(i == 0){
	 			html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'" class="active"><a href="javascript:;">'+checkName+'</a></li>';
	 		} else {
	 			html += '<li role="presentation" data-id="'+item.id+'" data-index="'+i+'"><a href="javascript:;">'+checkName+'</a></li>';
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
 		html += '<th style="min-width:50px;">备注</th>';
 	if(reviewData[checkIndex].scoreType != 1){
 		html += '<th style="width:260px;">操作</th>';
 	}
 	html += '</tr>';
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
 		
 		html += '<td>'+(item.remark ? item.remark : "")+'</td>';
 		if(reviewData[checkIndex].scoreType != 1){
			html += '<td>'
				+ '<button type="button" class="btn btn-primary btn-xs btnEdit" data-index="'+i+'"><span class="glyphicon glyphicon-edit"></span>编辑</button>'
				+ '<button type="button" class="btn btn-primary btn-xs btnUp" data-index="'+i+'"><span class="glyphicon glyphicon-arrow-up"></span>上移</button>'
				+ '<button type="button" class="btn btn-primary btn-xs btnDown" data-index="'+i+'"><span class="glyphicon glyphicon-arrow-down"></span>下移</button>'
				+ '<button type="button" class="btn btn-danger btn-xs btnDel" data-index="'+i+'" data-id="'+item.id+'"><span class="glyphicon glyphicon-remove"></span>删除</button>'
			+ '</td>';
		}
 			 	html += '</tr>';
 	}
 	$(html).appendTo("#reviewSecond");
 }

//编辑自动计算
function openAutoEdit(){
	top.layer.open({
		type: 2,
		title: "设置自动计算",
		area: ['1000px', '90%'],
		resize: false,
		content: autoPage + "?tenderProjectType=" + tenderProjectType + "&examType=" + examType,
		success:function(layero, idx){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(reviewData[checkIndex], function(data){
				reviewSecondHtml(reviewData[checkIndex].checkItemAuditList);
			});
		}
	});
}

//删除评审大项
function checkDel(){
	$.ajax({
		type: "post",
		url: checkDelUrl,
		async: false,
		data:{id:checkId},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			top.layer.alert("删除成功");
		 	checkInfo();
			itemInfo();
		}
	});
}
//评审大项列表
function checkInfo(id){
	$.ajax({
		type: "post",
		url: checkUrl,
		async: false,
		data:{bidSectionId:bidSectionId, examType:examType},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			reviewFirst = data.data;
			reviewFirstHtml(data.data);
		}
	});
}
//删除小项
function itemDel(id){
	$.ajax({
		type: "post",
		url: itemDelUrl,
		async: false,
		data:{id:id},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			top.layer.alert("删除成功");
			itemInfo();
		}
	});
}
//评审小项列表
function itemInfo(){
	$.ajax({
		type: "post",
		url: itemUrl,
		async: false,
		data:{checkId:reviewData[checkIndex].id},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			reviewData[checkIndex].checkItemAuditList = data.data ? data.data : [];
			reviewSecondHtml();
		}
	});
}