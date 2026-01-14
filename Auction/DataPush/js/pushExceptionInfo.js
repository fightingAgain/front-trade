var pushUrl = top.config.AuctionHost  + '/projectReceptionController/sendProjectExcepiton.do';//推送接口
var getInfoUrl = top.config.AuctionHost  + '/projectReceptionController/findProjectExcepiton.do';//获取推送数据详情接口


var packageId = $.getUrlParam("bidSectionId");//包件id
var projectId = $.getUrlParam("projectId");//项目id
var pushId = '';//推送id
var token = sessionStorage.token;
var loadMaskIndex = '';
$(function () {

	//初始化数据
	getPushInfo();

	//日期选择器
	$('.Wdate').click(function(){
		var nowDate= top.$("#systemTime").html() + " " + top.$("#sysTime").html();
		WdatePicker({
			el:this,
			dateFmt:'yyyy-MM-dd HH:mm',//时间格式
			// minDate:nowDate ,//最小值
			onpicked:function(dp){//选择完时间的回调


			}
		})
	});

	//关闭当前窗口
	$("#btn_close").click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	//推送
	$("#btn_submit").on('click',function(){
		var arr={};
		arr = top.serializeArrayToJson($("#DataPush").serializeArray());//获取表单数据，并转换成对象；
		arr.id = pushId;
		arr.packageId = packageId;

		$.ajax({
			type: "post",
			url: pushUrl,
			data: arr,
			dataType: "json",
			async:false,
			success: function (response) {
				if (data.success) {
					parent.layer.alert('推送成功！')
				} else {
					parent.layer.alert(data.message)
				}
			}
		});
	})

});

function passMessage(data, refresh) {

}
function passMessage(data) {

}
/*
 * 获取推送数据
 * */
function getPushInfo() {
	$.ajax({
		type: "post",
		url: getInfoUrl,
		async: true,
		data: {
			'packageId': packageId,
			'projectId': projectId
		},
		beforeSend: function (xhr) {
			var token = $.getToken();
			xhr.setRequestHeader("Token", token);
			loadMaskIndex = parent.layer.msg('页面数据处理中,请稍候...', {
				icon: 16,
				shade: 0.3,
				time: false
			});
		},
		success: function (data) {
			parent.layer.close(loadMaskIndex);
			if (data.success) {
				var res = data.data;
				pushId = res.id;
				for (var key in res) {
					if(key == 'packageName' || key == 'packageCode'){
						$('#' + key).html(res[key])
					}else{
						$('[name='+key+']').val(res[key])
					}
				}
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
}
