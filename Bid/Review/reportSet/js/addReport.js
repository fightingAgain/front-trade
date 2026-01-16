/**

*  评标报告详情
*  方法列表及功能描述
*/
var saveUrl = config.Reviewhost + '/CheckReportController/save';//保存
var updateUrl = config.Reviewhost + '/CheckReportController/update';//修改
var getUrl = config.Reviewhost + '/CheckReportController/get';//获取信息
var checkReportCode;
var isAdd;
var callback;
$(function(){
    checkReportCode = $.getUrlParam('checkReportCode');//评标报告编号
    if(checkReportCode){
        $.ajax({
            type:"post",
            url:getUrl,
            async:true,
            data: {checkReportCode:checkReportCode},
            success: function(data){
                if(data.success){
                    $("#checkReportCode").val(data.data.checkReportCode);
                    $("#checkReportName").val(data.data.checkReportName);
                    $("#checkReportType").val(data.data.checkReportType);
                    $("#sort").val(data.data.sort);
                    $("#checkReportDescribe").val(data.data.checkReportDescribe);
                }else{
                    top.layer.alert(data.message)
                }
            }
        });
        isAdd = false;
    }else{
        isAdd = true;
    }
	//关闭
	$('html').on('click','#btnClose',function(){
		var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

	$('#btnSubmit').click(function(){
	    var url = isAdd ? saveUrl : updateUrl;
	    var report = {};

        report.checkReportCode = $("#checkReportCode").val();
        report.checkReportName = $("#checkReportName").val();
        report.checkReportType = $("#checkReportType").val();
        report.sort = $("#sort").val();
        report.checkReportDescribe = $("#checkReportDescribe").val();
		$.ajax({
			type:"post",
			url:url,
			async:true,
			data: report,
			success: function(data){
				if(data.success){
                    var index1 = top.layer.getFrameIndex(window.name);
                    top.layer.alert(data.data, function(index){
                        callback(data);
                        top.layer.close(index);
                        top.layer.close(index1);
					})
				}else{
                    top.layer.alert(data.message)
				}
			}
		});
	});
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(_callback){
    callback = _callback;
}
