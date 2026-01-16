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
var bidCheckType;//评标办法
$(function () {
	if ($.getUrlParam("bidSectionId") && $.getUrlParam("bidSectionId") != "undefined") {
		bidSectionId = $.getUrlParam("bidSectionId");
	}
	if ($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined") {
		examType = $.getUrlParam("examType");
	}
	if($.getUrlParam("checkType") && $.getUrlParam("checkType") != "undefined"){
		bidCheckType =$.getUrlParam("checkType");
	}
	if(bidCheckType == 8){
		$('.checkType8').html('减');
	}
	//关闭当前窗口
	$("#btnClose").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

});


/***
 * 
 * @param {Object} data  大项详细信息
 * @param {Object} arr  评标办法规则
 * @param {Object} callback
 */
function passMessage(data, arr, callback) {
	prevCallback = callback;

	//评标办法规则
	if (arr) {
		basicRule = arr;
		scoreCount = arr.scoreCount;
		if (arr.isDeviate == 0) {
			//是否有偏离
			$("[name='checkType'][value='1']").parent("label").remove();
		} else {
			if (arr.isAddPrice == 0) {
				$("[name='isAddPrice'][value='0']").prop("checked", "checked");
				$("[name='isAddPrice'][value='1']").parent("label").remove();
				//			$(".isAddPriceModule").remove();
			}
		}
		if (arr.scoreType == 0) {
			$(".weightShow").remove();
			$(".avgTypeShow").remove();
			$("[name='checkType'][value='3']").parent("label").remove();
		} else if (arr.scoreType == 1) {
			$(".weightShow").remove();
			$(".avgTypeShow").remove();
		} else if (arr.scoreType == 2) {
			//		$(".weightShow").show();
		} else if (arr.scoreType == 3) {
			$(".weightShow").remove();
		}
		if (arr.isMulitStage == 0) {
			$("[name='checkStage'][value='2']").parent("label").remove();
			$("[name='checkType'][value='3']").parent("label").remove();
		} else {
			//		$("[name='checkStage'][value='2']").parent("label").show();
		}
	}

	if (data) {
		keyId = data.id;
		isAuto = data.scoreType;
		checkDetail(data);
	}
}
//大项内容
function checkDetail(arr) {

	for (var key in arr) {
		if (key == "checkStage") {
			if (arr[key] == 1) {
				$("#" + key).html("初步评审");
			} else {
				$("#" + key).html("详细评审");
			}
		} else if (key == "checkType") {
			if (arr[key] == 0) {
				$("#" + key).html("合格制");
			} else if (arr[key] == 1) {
				$("#" + key).html("偏离制");
			} else if (arr[key] == 2) {
				$("#" + key).html("响应制");
			} else if (arr[key] == 3) {
				$("#" + key).html("打分制");
			}
		} else if (key == "ratioMolecular") {
			$("#ratioMolecular").html(arr.ratioMolecular + " / " + arr.ratioDenominator);
		} else if (key == "isAddToTotal") {
			$("#isAddToTotal").html(arr[key] == 1 ? "是" : "否");
		} else if (key == "isAddPrice") {
			$("#isAddPrice").html(arr[key] == 1 ? "是" : "否");
		} else if (key == "avgType") {
			$("#avgType").html(arr[key] == 1 ? "算术平均分" : arr[key] == 2?"分项得分求和，分项得分为各评委去掉一个最高分和一个最低分后的平均分":"各评委去掉一个最高分和一个最低分求平均分");
		} else if (key == "scoreType") {
			$("#scoreType").html(arr[key] == 1 ? "自动打分" : "评委打分");
			if (arr[key] == 1) {
				$("#btnSet").show();
				$("#btnItemBlock").hide();
			} else {
				$("#btnSet").hide();
				$("#btnItemBlock").show();
			}
		} else if (key == "nodeType") {
			if (arr[key] == 1) {
				$("#nodeType").html("商务打分");
			} else if (arr[key] == 2) {
				$("#nodeType").html("技术打分");
			} else if (arr[key] == 3) {
				$("#nodeType").html("价格打分");
			} else if (arr[key] == 4) {
				$("#nodeType").html("其他");
			}
		} else if (key == "isBlind") {
			if (arr[key] == 1) {
				$("#isBlind").html("暗标");
			} else {
				$("#isBlind").html("明标");
			}
		} else {
			$("#" + key).html(arr[key]);
		}
	}
	if (arr.isAddPrice == 1 && arr.checkType == 1) {
		$(".isAddPriceModule").show();
	} else {
		$(".isAddPriceModule").hide();
	}

	if (arr.checkType != 3) {
		$(".checkTypeCom").show();
	}
	$(".checkType" + arr.checkType).show();

	if (arr.checkType == 1) {
		if (arr.isAddPrice == 1) {
			$(".isAddPriceShow").show();
		} else {
			$(".isAddPriceShow").hide();
		}
	}else if (arr.checkType == 2) {
		$(".isAddPriceShow").show();
	} else {
		$(".isAddPriceShow").hide();
	}

	//自动计算变量

	if (arr.bidSectionDataAuditList && arr.bidSectionDataAuditList.length > 0) {
		var html = "";
		for (var i = 0; i < arr.bidSectionDataAuditList.length; i++) {
			var item = arr.bidSectionDataAuditList[i];
			html += '<tr class="varList" data-index="' + i + '">\
						<td  class="th_bg">'+ item.dataName + '</td>\
						<td>\
							<span style="padding-right:20px;">'+ (item.dataValue ? item.dataValue : item.dataValue) + '</span>\
						</td>\
					</tr>';
		}
		$(html).appendTo("#checkTable");
	}
}

//保存
function saveForm() {
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	data.examType = examType;
	data.nodeType = data.nodeType1;
	if (keyId) {
		data.id = keyId;
	} else {
		data.bidSectionId = bidSectionId;
	}

	$.ajax({
		type: "post",
		url: saveUrl,
		async: false,
		data: data,
		success: function (rst) {
			if (!rst.success) {
				parent.layer.alert(rst.message);
				return;
			}
			top.layer.alert("保存成功");
			keyId = rst.data;
			data.id = rst.data;
			if (data.scoreType == 1 && isAuto == 0) {
				data.checkItemAuditList = [];
			}
			prevCallback(data);
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);

		}
	});
}



