/**
*  Xiangxiaoxia 
*  2019-2-21
*  评标室详情页面
*  方法列表及功能描述
*   1、getDetail()   查询详情
*/

var getUrl = config.tenderHost + '/BiddingRoomManagementController/selectBiddingRoomById.do'; // 获取项目信息的接口

var id = "";

$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
	}

	// 	$(".pageModel").height($("body").height()-54);

	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
})


function getDetail() {
	$.ajax({
		url: getUrl,
		type: "post",
		data: {
			id: id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			for(var key in arr) {
				$('#'+key ).html(arr[key]);
				if(key == 'areaCode'){
					$('#areaCode').html(getOptionValue('areaCode',arr.areaCode))
				}
				
				if( key =='biddingRoomType'){
					$('#biddingRoomType').html(arr.biddingRoomType==0?'自有场地':'外部场地');
				}else if(key =='isOpen'){
					$('#isOpen').html(arr.isOpen=0?'否':'是');
				}
			}
		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}