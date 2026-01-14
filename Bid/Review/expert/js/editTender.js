var addUrl = config.Reviewhost + '/TendereeRecordApplyController/saveItem.do'; //添加

var callparm;
var tendereeRecordApplyId;

$(function() {
	if(getUrlParam("tendereeRecordApplyId") && getUrlParam("tendereeRecordApplyId") != "undefined") {
		tendereeRecordApplyId = getUrlParam("tendereeRecordApplyId");
		$("#tendereeRecordApplyId").val(tendereeRecordApplyId);
	}

	//提交
	$("#btnSubmit").click(function() {
		if(checkForm($("#formName"))){//必填验证，在公共文件unit中
			var idCard = $("#idCard").val();
			if(!(/(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard))){ 
		        top.layer.alert("温馨提示：身份证号码有误，请重填", {icon: 7,title: '提示'});
		        return; 
		    }
			var phone = $("#telNumber").val();
		    if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))){ 
		        top.layer.alert("温馨提示：手机号码有误，请重填", {icon: 7,title: '提示'});
		        return; 
		    }
			save();
		}
	});

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

});

function du(callback) {
	callparm = callback;
};

function save() {
	var arr = {};
	arr = $("#formName").serialize();

	$.ajax({
		url: addUrl,
		type: "post",
		data: arr,
		success: function(data) {
			if(data.success == false) {
                top.layer.alert('温馨提示：'+data.message);
				return;
			} else {
				callparm();
                top.layer.alert("温馨提示：添加成功", {
					icon: 1,
					title: '提示'
				});
				window.parent.$('#expertList').bootstrapTable('refresh');
				var index = top.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                top.layer.close(index); //再执行关闭
			}
		},
		error: function(data) {
            top.layer.alert("温馨提示：操作失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};