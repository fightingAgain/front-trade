var searchUrl = config.Reviewhost + '/ExpertControll/getDetail.do'; //查看

var id; //标段主键ID

$(function() {
	if(getUrlParam("id") && getUrlParam("id") != "undefined") {
	    id = getUrlParam("id");
	    getDetail(id);
	}
	
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

});

function getDetail(id) {
	$.ajax({
		url: searchUrl,
		type: "post",
		data: {
			"id":id,
		},
		success: function(data) {
			if(data.success == false) {
                top.layer.alert('温馨提示：'+data.message);
				return;
			}else{
				var arr = data.data;
	         	for(var key in arr){
	         		if(key == "expertType"){//专家类别 1为在库专家，2为招标人代表
	         			if(arr[key] == "1"){
	         				$("#expertType").html("在库专家");
	         			}else if(arr[key] == "2"){
	         				$("#expertType").html("招标人代表");
	         			}
	         		}else if(key == "isChairMan"){//是否为评标组长 0为否，1为是
	         			if(arr[key] == "0"){
	         				$("#isChairMan").html("否");
	         			}else if(arr[key] == "1"){
	         				$("#isChairMan").html("是");
	         			}
	         		}else{
	         			var newEle = $("#"+key)
	            		newEle.html(arr[key]);
	         		}
	         	}
			}
		},
		error: function(data) {
			top.layer.alert("温馨提示：查询失败", {
				icon: 3,
				title: '提示'
			});
		}
	});
};



