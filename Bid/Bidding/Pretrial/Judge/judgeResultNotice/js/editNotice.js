var saveUrl = config.tenderHost + '/ResultNoticeController/saveItem.do';//保存、提交
var ue;
var bidderInfo = {};
$(function () {
	//初始化编辑器
	ue = UE.getEditor('container');	//初始化编辑器

	//关闭
	$('#btnClose').click(function () {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});
	$('.fullScreen').click(function () {
		parent.layer.open({
			type: 2
			, title: '编辑预审通知信息'
			, area: ['100%', '100%']
			, content: 'fullScreen.html'
			, resize: false
			, btn: ['确定', '关闭']
			, success: function (layero, index) {
				var iframeWind = layero.find('iframe')[0].contentWindow;
				iframeWind.ue.ready(function () {
					//设置编辑器的内容
					iframeWind.ue.setContent(ue.getContent())
				});

			}
			//确定按钮
			, yes: function (index, layero) {
				var iframeWinds = layero.find('iframe')[0].contentWindow;
				ue.setContent(iframeWinds.ue.getContent());
				parent.layer.close(index);
			}
			, btn2: function () {
				parent.layer.close();
			}
		});
	})
})
function passMessage(data, callback, num) {
	for (var key in data) {
		bidderInfo[key] = data[key];
	}
	//公告内容
	if (bidderInfo.resultNotic) {
		ue.ready(function () {
			ue.setContent(bidderInfo.resultNotic);
			ue.addInputRule(function (root) {
				$.each(root.getNodesByTagName('a'), function (i, node) {
					node.tagName = "p";
				});
			});
		});
	}
	$('#btnSubmit').click(function () {
		bidderInfo.resultNotic = ue.getContent();
		if (ue.getContentTxt() == '') {
			parent.layer.alert('请编辑通知内容！');
			return
		}
		$.ajax({
			type: "post",
			url: saveUrl,
			async: true,
			data: bidderInfo,
			success: function (data) {
				if (data.success) {
					bidderInfo.id = data.data;
					var index = parent.layer.getFrameIndex(window.name);
					callback(bidderInfo, num)
					parent.layer.close(index);
				}
			}
		});
	})
}
