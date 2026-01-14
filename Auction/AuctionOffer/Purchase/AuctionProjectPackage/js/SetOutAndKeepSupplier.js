//修改包件设置
var urlAuctionSetting = top.config.AuctionHost + "/AuctionProjectPackageController/updatePackageSetting.do";

var round = $.query.get("round"); //轮数
var packageId = $.query.get("packageId");
var projectId = $.query.get("projectId");
$(function() {
	var hasParam=JSON.parse(sessionStorage.getItem('param'));
	if(round == 2) {
		$(".first").hide();
		if(hasParam!=null){
		$("#secondOutSupplier").val(hasParam.secondOutSupplier);
		$("#secondKeepSupplier").val(hasParam.secondKeepSupplier);
		$("#btn_submit").attr('disabled',true)
		}
		
	} else {
		$(".second").hide();		
		if(hasParam!=null){
			$("#firstOutSupplier").val(hasParam.firstOutSupplier);
			$("#firstKeepSupplier").val(hasParam.firstKeepSupplier);
			$("#btn_submit").attr('disabled',true)
		}
	}
})

//提交
$("#btn_submit").on("click", function() {
	var reg = /^\+?[1-9][0-9]*$/;
	if(round == 1) {
		if($("#firstOutSupplier").val() == "") {
			layer.alert("请输入第一轮淘汰供应商数！");
			return
		}

		if(!reg.test($("#firstOutSupplier").val())) {
			layer.alert("第一轮淘汰供应商数应为正整数");
			return
		}

		if($("#firstKeepSupplier").val() == "") {
			layer.alert("请输入第一轮最低保留供应商数！");
			return
		}

		if(!reg.test($("#firstKeepSupplier").val())) {
			layer.alert("第一轮最低保留供应商数应为正整数");
			return
		}

		var param = {
			"id": packageId,
			"projectId": projectId,
			"firstOutSupplier": $("#firstOutSupplier").val(),
			"firstKeepSupplier": $("#firstKeepSupplier").val()
		}
	} else if(round == 2) {
		if($("#secondOutSupplier").val() == "") {
			layer.alert("请输入第二轮淘汰供应商数！");
			return
		}

		if(!reg.test($("#secondOutSupplier").val())) {
			layer.alert("第二轮淘汰供应商数应为正整数");
			return
		}

		if($("#secondKeepSupplier").val() == "") {
			layer.alert("请输入第二轮最低保留供应商数！");
			return
		}

		if(!reg.test($("#secondKeepSupplier").val())) {
			layer.alert("第二轮最低保留供应商数应为正整数");
			return
		}

		var param = {
			"id": packageId,
			"projectId": projectId,
			"secondOutSupplier": $("#secondOutSupplier").val(),
			"secondKeepSupplier": $("#secondKeepSupplier").val()
		}
	}

	var index = top.layer.getFrameIndex(window.name);
	
	$.ajax({
		url: urlAuctionSetting,
		type: "post",
		data: param,
		success: function(res) {
			if(res.success) {
				sessionStorage.setItem('param', JSON.stringify(param));//邀请供应商的id缓存
				top.layer.close(index);
				top.layer.msg("设置成功！");
			} else {
				top.layer.close(index);
				top.layer.alert("设置失败：" + res.message);
			}
		}
	})
})


$("#btn_close").on("click", function() {
	var index = top.layer.getFrameIndex(window.name);	
	top.layer.close(index);
})