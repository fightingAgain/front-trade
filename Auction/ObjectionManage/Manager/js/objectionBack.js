/**

*  编辑、添加异议
*  方法列表及功能描述
*/
var saveUrl = config.AuctionHost + '/ObjectionAnswersController/confirmRevocation.do';//保存
var detailUrl = config.AuctionHost + '/ObjectionAnswersController/getAndFile.do';//反显时的详情接口

var dataId = '';//数据id
$(function () {
	dataId = $.getUrlParam('dataId');

	getDetail(dataId);
	//确认
	$('#btnSubmit').click(function () {
		save(dataId)
	})
})
//信息反显
function getDetail(id) {
	$.ajax({
		type: "post",
		url: detailUrl,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				var source = data.data;
				bidId = source.packageId;
				for (var key in source) {
					$('#' + key).html(source[key]);
				};
			} else {
				parent.layer.alert(data.message);
			}
		}
	});
};
//确认
function save(id) {
	$.ajax({
		type: "post",
		url: saveUrl,
		async: true,
		data: {
			'id': id
		},
		success: function (data) {
			if (data.success) {
				parent.layer.alert('撤回成功！', { icon: 6, title: '提示' }, function (index) {
					parent.layer.closeAll()
				});
			} else {
				parent.layer.alert(data.message);
			}
			parent.$('#tableList').bootstrapTable('refresh');
		}
	});
}
