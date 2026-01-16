/**

 * 上传招标文件
 */
var saveUrl = config.tenderHost + '/CheckItemAuditController/saveCheckItemAudit.do'; //保存

var prevCallback;
var keyId;  //数据id
var checkType;
var checkId;
$(function(){
	// 获取连接传递的参数
 	if($.getUrlParam("checkType") && $.getUrlParam("checkType") != "undefined"){
 		checkType = $.getUrlParam("checkType");
 	}
 	if($.getUrlParam("checkId") && $.getUrlParam("checkId") != "undefined"){
 		checkId = $.getUrlParam("checkId");
 	}
 	if(checkType == 3){
 		$(".scoreModule").show();
 		$(".keyModule").hide();
 		$("[name='score']").attr("datatype", $("[name='score']").attr("data-validate"));
 	} else {
 		if(checkType == 1 || checkType == 2){
 			$("[name='isKey'][value='0']").prop("checked", "checked");
 		} else {
 			$("[name='isKey'][value='1']").prop("checked", "checked");
 		}
 		$(".scoreModule").hide();
 		$(".keyModule").show();
 		$("[name='score']").removeAttr("datatype");
 	}
 	
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	//保存
	$("#btnSave").click(function() {
		if(checkForm($("#formName"),{"decimal2":/^[0-9]+(\.[0-9]{0,2})?$/})){
			saveForm();
//			var data = parent.serializeArrayToJson($("#formName").serializeArray());
//			data.checkLevel = 1;
//			prevCallback(data);
//			var index = parent.layer.getFrameIndex(window.name);
//			parent.layer.close(index);
		}
	});
	
	
});

function passMessage(data, callback){
	prevCallback = callback;
	if(data){
		keyId = data.id;
		for(var key in data){
			var newEle = $("[name='"+key+"']")
			if(newEle.prop('type') == 'radio'){
				newEle.val([data[key]]);
			}else if(newEle.prop('type') == 'checkbox'){
				newEle.val(data[key]?data[key].split(','):[]);
			}else{
				newEle.val(data[key]);
			}
		}
	}
}

//保存
function saveForm(){
	var data = parent.serializeArrayToJson($("#formName").serializeArray());
	data.checkLevel = 1;
	if(keyId){
		data.id = keyId;
	} else {
		data.checkId = checkId;
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
			prevCallback(data);
			var index = parent.layer.getFrameIndex(window.name);
			parent.layer.close(index);
			
		}
	});
}
