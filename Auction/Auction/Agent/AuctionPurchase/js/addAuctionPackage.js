var saveProjectPackage = config.AuctionHost + "/AuctionProjectPackageController/saveAuctionProjectPackage.do"
var thisFrame = parent.window.document.getElementById("packageclass").getElementsByTagName("iframe")[0].id;
var dcmt = parent.$('#'+thisFrame)[0].contentWindow;
  //临时保存
$("#btn_bao").click(function() {
	if($('#packageName').val() == "") {
		parent.layer.alert("包件名称不能为空");
		return;
	};
	if($('#packageName').val().length > 66) {
		parent.layer.alert("包件名称过长");
		return;
	};
	if($('#packageNum').val()!='' && $('#packageNum').val().length > 30) {
		parent.layer.alert("包件编号过长");
		return;
	};

	if($('#dataTypeName').val() == "") {
		parent.layer.alert("项目类型不能为空");
		return;
	};

	$.ajax({
		url: saveProjectPackage,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#formbackage").serialize(),
		success: function(data) {
			if(data.success == true) {
				parent.layer.alert("添加成功");
				dcmt.package()
			} else {
				parent.layer.alert(data.message);
	
			};
			var index=top.parent.layer.getFrameIndex(window.name);
    		top.parent.layer.close(index);
		},
		error: function(data) {
			parent.layer.alert("添加失败")
		}
	});		
})
//退出
$("#btn_close").click(function() {
	var index=top.parent.layer.getFrameIndex(window.name);
    top.parent.layer.close(index);
})