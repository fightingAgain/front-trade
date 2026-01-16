/**

 * 上传招标文件
 */

var calculateUrl = config.tenderHost + "/CheckAuditController/findCalculatec.do";
var variableUrl = config.tenderHost + "/CheckAuditController/findCalculateVariable.do";

var autoData; //自动计算列表
var examType;
var tenderProjectType;
var prevCallback;
var checkRule;
var calculate;
$(function(){
	if($.getUrlParam("examType") && $.getUrlParam("examType") != "undefined"){
 		examType = $.getUrlParam("examType");
 	}
	if($.getUrlParam("tenderProjectType") && $.getUrlParam("tenderProjectType") != "undefined"){
 		tenderProjectType = $.getUrlParam("tenderProjectType");
 	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	
	//保存
	$("#btnSave").click(function() {
		var index = $("[name='autoCode']:checked").val();
		if(index != undefined){
			checkRule.bidSectionDataAuditList = [];
			checkRule.code = autoData[index].calculateCode;
			
			var content = autoData[index].calculateContent;
			$(".varList").each(function(){
				var itemIndex = $(this).attr("data-index");
				var val = $(this).find(".dataName").val();
				var reg = "{{"+calculate[itemIndex].variableName + "}}";
				content = content.replace(new RegExp(reg,'g'), val);
				checkRule.bidSectionDataAuditList.push({
					dataName:calculate[itemIndex].variableName,
					dataValue:val
				});
			});
			
			checkRule.checkItemAuditList = [{
				checkName:autoData[index].calculateName,
				checkStandard:content,
				checkLevel:1,
				score:checkRule.score
			}];
			
			prevCallback(checkRule);
			var idx = parent.layer.getFrameIndex(window.name);
			parent.layer.close(idx);
		} else {
			top.layer.alert("请选择自动计算方法");
		}
	});
	
	$("#autoList").off("change").on("change", "[name='autoCode']", function(){
		var index = $(this).val();
		$("#content").html(autoData[index].calculateContent);
		getVariable(autoData[index].calculateCode);
	});
});

function passMessage(data, callback){
	prevCallback = callback;
	checkRule = data;
	getCalculate();
}
//算法列表
function getCalculate(){
	$.ajax({
		type: "post",
		url: calculateUrl,
		async: false,
		data:{
			tenderProjectType:tenderProjectType,
			examType:examType
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			autoData = data.data ? data.data : [];
			if(autoData.length > 0){
				var html = "";
				for(var i = 0; i < autoData.length; i++){
					var isChecked = "";
					if(checkRule.code == autoData[i].calculateCode){
						isChecked = 'checked="checked"';
						$("#content").html(autoData[i].calculateContent);
						getVariable(autoData[i].calculateCode);
					}
					html += '<tr><td style="width:50px;text-align:center;"><input type="radio" name="autoCode" '+isChecked+' value="'+i+'"></td>'
								+ '<td>'+autoData[i].calculateName+'</td>'
								+ '<td><div class="ellipsis" style="width:600px;">'+autoData[i].calculateContent+'</div></td>'
					html += '</tr>'
				}
				$(html).appendTo("#autoList");
			}
		}
	});
}
//算法列表
function getVariable(code){
	$.ajax({
		type: "post",
		url: variableUrl,
		async: false,
		data:{
			calculateCode:code
		},
		success: function(data) {
			if(!data.success) {
				parent.layer.alert(data.message);
				return;
			}
			$("#varTab tr").remove();
			var item = data.data ? data.data : [];
			calculate = item;
			if(item.length > 0){
				var html = "";
				
				for(var i = 0; i < item.length; i++){
					var checkRuleItem;
					//variableType : 1是文本框  2是下拉框
					if(checkRule.bidSectionDataAuditList){
						for(var k = 0; k < checkRule.bidSectionDataAuditList.length; k++){
							if(item[i].variableName == checkRule.bidSectionDataAuditList[k].dataName){
								checkRuleItem = checkRule.bidSectionDataAuditList[k];
								break;
							}
						}
					}
					if(item[i].variableType == 1){
						var ranges = "";
						if(item[i].rangeMin || item[i].rangeMax){
							ranges += "范围：" + (item[i].rangeMin ? item[i].rangeMin : "") + " ~ " + (item[i].rangeMax ? item[i].rangeMax : "");
						}
						if(item[i].decimalLength){
							ranges += "(" + item[i].decimalLength + "位小数)";
						}
						html += '<tr class="varList" data-index="'+i+'">\
									<td  class="th_bg">'+item[i].variableName+'<i class="red">*</i></td>\
									<td>\
										<input type="text" class="form-control dataName" value="'+(checkRuleItem ? checkRuleItem.dataValue : item[i].defaultValue)+'" style="width: 120px;display: inline-block;margin-right: 10px;" />\
										<span class="red">'+ranges+'</span>\
									</td>\
								</tr>';
					} else if(item[i].variableType == 0) {
						var oplist = item[i].constEnum.split(",");
						html += '<tr class="varList" data-index="'+i+'">\
									<td  class="th_bg">'+item[i].variableName+'<i class="red">*</i></td>\
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
				$(html).appendTo("#varTab");
			}
		}
	});
}
