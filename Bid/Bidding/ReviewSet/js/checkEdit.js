/**

 * 上传招标文件
 */
var saveUrl = config.tenderHost + '/CheckAuditController/saveCheckAudit'; //保存

var prevCallback;
var keyId;  //数据id
var scoreCount;  //打分个数
var bidSectionId;
var basicRule;  //基本规则
var isAuto = 0;  //打分方式（原始）
var examType;
var bidType = 0;//招标类型（0 明标  1暗标）
var bidCheckType;//评标办法
$(function(){
 	if($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined"){
		bidSectionId =$.getUrlParam("bidSectionId");
	}
 	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
		examType =$.getUrlParam("examType");
	}
	if($.getUrlParam("bidType") && $.getUrlParam("bidType") != "undefined"){
		bidType =$.getUrlParam("bidType");
	}
	if($.getUrlParam("checkType") && $.getUrlParam("checkType") != "undefined"){
		bidCheckType =$.getUrlParam("checkType");
	}
	if(bidCheckType == 8){
		$('.checkType8').html('减');
		$('.addPriceRatio').attr('errormsg','请正确输入减价幅度')
	}

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//保存
	$("#btnSave").click(function() {
		if(checkForm($("#formName"),{"decimal2":/^[0-9]+(\.[0-9]{0,2})?$/, "n0-1":/^(0\.(0[1-9]|[1-9]{1,2}|[1-9]0)$)|^1$|^1.0$|^1.00$/, "n0-100":/^(([1-9][0-9]|[1-9])(\.\d{1,2})?|0\.\d{1,2}|100)$/})){
			if(Number($("[name='ratioMolecular']").val()) > Number($("[name='ratioDenominator']").val())){
				top.layer.alert("评审规则分子必须小于分母");
				return;
			}
			saveForm();
		}
	});
	
	//评审阶段
	$("[name='checkStage']").change(function(){
		if($(this).val() == 1){
			if($("[name='checkType']:checked").val() == 3){
				$("[name='checkType'][value='0']").prop("checked","checked");
			}
			$("[name='checkType'][value='3']").parent("label").hide();
		} else {
			$("[name='checkType'][value='3']").parent("label").show();
		}
		
		showOrHide();
	});
	
	//评审方式
	$("[name='checkType']").change(function(){
		showOrHide();
	});
	
	$("[name='isAddPrice']").change(function(){
		var val = $(this).val();
		if(val == 1){
			$(".isAddPriceShow").show();
			$(".addPriceRatio").attr("datatype", $(".addPriceRatio").attr("data-validate"));
		} else {
			$(".isAddPriceShow").hide();
			$(".addPriceRatio").removeAttr("datatype");
		}
	});
	$("[name='scoreType']").change(function(){
		var val = $(this).val();
		if(val == 1){
			top.layer.confirm("若设置成自动打分，将清空现有评审子项，是否继续？", function(idx){
				top.layer.close(idx);
				$(".avgTypeShow").hide();
			},function(idx){
				top.layer.close(idx);
				$("[name='scoreType'][value='0']").prop("checked", "checked");
				$(".avgTypeShow").show();
			});
		} else {
			$(".avgTypeShow").show();
		}
	});
	
	
});

$(".weight").on('blur', function() {
	var n=/^(0(\.\d{1,2})?|1(\.0{1,2})?)$/ 
	if(!n.test($(this).val())) {
		parent.layer.alert("温馨提示：权重范围：0~1(2位小数)");
		$(this).val("");

		return
	};
})

function showOrHide(){
	var val = $("[name='checkType']:checked").val();
	$(".checkType").hide();
	$(".checkType [data-validate]").each(function(){
		$(this).removeAttr("datatype");
	});
	if(val != 3){
		$(".checkTypeCom").show();
		$(".checkTypeCom [data-validate]").each(function(){
			$(this).attr("datatype", $(this).attr("data-validate"));
		});
	}
	$(".checkType" + val).show();
	$(".checkType" + val + " [data-validate]").each(function(){
		$(this).attr("datatype", $(this).attr("data-validate"));
	});
	if(val == 1){
		if($("[name='isAddPrice']:checked").val() == 1){
			$(".isAddPriceShow").show();
			$(".addPriceRatio").attr("datatype", $(".addPriceRatio").attr("data-validate"));
		} else {
			$(".isAddPriceShow").hide();
			$(".addPriceRatio").removeAttr("datatype");
		}
	} else if(val == 2){
		$("[name='isAddToTotal'][value='0']").prop("checked", "checked");
		$("[name='isAddPrice'][value='1']").prop("checked", "checked");
		$(".addPriceRatio").attr("datatype", $(".addPriceRatio").attr("data-validate"));
		$(".isAddPriceShow").show();
	} else {
		$(".isAddPriceShow").hide();
		$(".addPriceRatio").removeAttr("datatype");
	}

	//设置是否是暗标评审设置
	if (bidType == 1) {
		// 原代码
		// $('.bidType').show();
		// $('[name=checkType]').val(['1']);
		// 修改后
		$('.bidType').show();
		// 需求不明 暂时放置
		// if ($('[name=isBlind]:checked').length == 0) {
		// 	$('[name=isBlind][value=1]').prop("checked", "checked") 
		// }
	}else{
		$('.bidType').hide();
	}
	
	if($("[name='scoreType']:checked").val() == 1){
		$(".avgTypeShow").hide();
	}
}

/***
 * 
 * @param {Object} data  大项详细信息
 * @param {Object} arr  评标办法规则
 * @param {Object} callback
 */
function passMessage(arr, callback, data){
	prevCallback = callback;
	
	//评标办法规则
	if(arr){
		basicRule = arr;
		scoreCount = arr.scoreCount;
		if(arr.isDeviate == 0){
			//是否有偏离和响应制，响应制不计入偏离总项，偏离加价默认是
			$("[name='checkType'][value='1']").parent("label").remove();
			$("[name='checkType'][value='2']").parent("label").remove();
		} else {
			//偏离是否加价，如果有加价，显示响应制，无，不显示响应制
			if(arr.isAddPrice == 0){
				$("[name='isAddPrice'][value='0']").prop("checked", "checked");
				$("[name='isAddPrice'][value='1']").parent("label").remove();
				$("[name='checkType'][value='2']").parent("label").remove();
	//			$(".isAddPriceModule").remove();
			}
		}
		if(arr.scoreType == 0){  //没有打分项没有计算方式
			$(".weightShow").remove();
			$(".avgTypeShow").remove();
			$("[name='checkType'][value='3']").parent("label").remove();
		} else if(arr.scoreType == 1) {  //有打分项 有计算方式
			$(".weightShow").remove();
			$(".avgTypeShow").remove();
		} else if(arr.scoreType == 2) {  //有权重有计算方式
	//		$(".weightShow").show();
		} else if(arr.scoreType == 3) { //无权重 有计算方式
			$(".weightShow").remove();
		}
		if(arr.isMulitStage == 0){  
			//后审：初步评审没有打分项
			//预审：初步评审有打分项，
			$("[name='checkStage'][value='2']").parent("label").remove();
			if(examType == 2){
				$("[name='checkType'][value='3']").parent("label").remove();
			} else {
				$("[name='checkType'][value='3']").parent("label").show();
			}
		}
		//预审没有自动打分,没有价格打分
		if(examType == 1){
			$("[name='scoreType'][value='1']").parent("label").remove();
			$("[name='nodeType1'][value='3']").parent("label").remove();
		}
		
	}
	
	if(data){
		keyId = data.id;
		isAuto = data.scoreType;
		checkDetail(data);
	}
}
//大项内容
function checkDetail(arr){
	arr.nodeType1 = arr.nodeType;
	for(var key in arr){
		var newEle = $("[name='"+key+"']");
		if(newEle.prop('type') == 'radio'){
			newEle.val([arr[key]]);
		}else if(newEle.prop('type') == 'checkbox'){
			newEle.val(arr[key]?arr[key].split(','):[]);
		}else{
			newEle.val(arr[key]);
		}
	}
	if(arr.checkStage == 1){
		if(examType == 2){
			$("[name='checkType'][value='3']").parent("label").hide();
		} else {
			$("[name='checkType'][value='3']").parent("label").show();
		}
	} else {
		$("[name='checkType'][value='3']").parent("label").show();
	}
	if(arr.isAddPrice == 1 && arr.checkType == 1){
		$(".isAddPriceModule").show();
	} else {
		$(".isAddPriceModule").hide();
	}
	showOrHide();
}

//保存
function saveForm(){
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	data.examType = examType;
	data.nodeType = data.nodeType1;
	if(keyId){
		data.id = keyId;
	} else {
		data.bidSectionId = bidSectionId;
	}
	
	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data:data,
		success: function(rst) {
			if(!rst.success) {
				parent.layer.alert(rst.message);
				return;
			}
			top.layer.alert("保存成功");
			keyId = rst.data;
			data.id = rst.data;
			if(data.scoreType == 1 && isAuto == 0){
				data.checkItemAuditList = [];
			}
			prevCallback(data);
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
			
		}
	});
}



