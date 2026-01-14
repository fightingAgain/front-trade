var searchUrl = config.Reviewhost + '/ExpertControll/getDetail.do'; //查看


$(function() {
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
		top.layer.close(index);
	});

});

function passMessage(row) {
	var arr = row;
 	for(var key in arr){
 		if(key == "isHasBid"){//有无评标经历  0：无 1：有 
 			if(arr[key] == 0){
 				$("#isHasBid").html("无");
 			}else if(arr[key] == 1){
 				$("#isHasBid").html("有");
 			}
 		}else if(key == "sex"){//性别   1 男    2 女
 			if(arr[key] == 1){
 				$("#sex").html("男");
 			}else if(arr[key] == 2){
 				$("#sex").html("女");
 			}
 		}else{
 			var newEle = $("#"+key)
    		newEle.html(arr[key]);
 		}
 	}
};



