var saveUrl = config.AuctionHost + '/ObjectionAnswersController/updateObjectionAnswersResults';//保存

var prevPageCallback;
var dataId = $.getUrlParam("dataId");
$(function () {
    dealResultSelect()
    //关闭
    $('#btnClose').click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });
    //确定
    $('#btnSubmit').click(function () {
        var results = $("#results").val();
        if (results == "") {
            parent.layer.alert('请选择处理结果！', { icon: 7, title: '提示' })
            return;
        }
        var params = {
            isOver: 1,
            results: results,
            id: dataId
        }
        $.ajax({
            type: "post",
            url: saveUrl,
            async: false,
            data: params,
            success: function (data) {
                if (data.success) {
                    parent.layer.alert('处理完毕！')
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
                    parent.$('#tableList').bootstrapTable('refresh');
                    prevPageCallback ? prevPageCallback() : "";
                } else {
                    parent.layer.alert(data.message);
                }
            }
        });


    });
})

function initModel(callback) {
    prevPageCallback = callback;
}