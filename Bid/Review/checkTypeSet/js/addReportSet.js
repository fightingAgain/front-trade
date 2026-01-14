/**
*  zhouyan 
*  2019-10-24
*  评标报告列表
*  调整评标办法的评标报告
*/

var getUrl = config.Reviewhost + '/CheckTypeInfoController/getCheckReportSet'; //获取评标报告配置
var saveUrl = config.Reviewhost + '/CheckTypeInfoController/saveCheckReportSet'; //删除评标报告配置
var reportListUrl = 'Review/checkTypeSet/model/reportList.html';//评标办法列表
var reportSet = {};
$(function(){
    id = $.getUrlParam('id');//评标报告编号
    if(id){
        $.ajax({
            type:"post",
            url:getUrl,
            async:true,
            data: {id:id},
            success: function(data){
                if(data.success){
                    reportSet = data.data;
                    $("#checkReportType").val(reportSet.checkReportType);
                    $("#isLaw").val(reportSet.isLaw);
                    $("#checkReportCode").html(reportSet.checkReportCode);
                    $("#checkReportName").html(reportSet.checkReportName);
                    $("#checkReportDescribe").html(reportSet.checkReportDescribe);
                }else{
                    top.layer.alert('温馨提示：'+data.message)
                }
            }
        });


    }else{
        var checkTypeInfoId = $.getUrlParam('checkTypeInfoId');//评标报告编号
        if(checkTypeInfoId){
            reportSet.checkTypeInfoId = checkTypeInfoId;
        }
    }

    //关闭
    $('body').on('click','#btnClose',function(){
        var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
    });
});

//选择评标报告
$("#checkReportCode").click(function(){
    top.layer.open({
        type: 2,
        title: '选择评标报告',
        area: ['100%', '100%'],
        resize: false,
        content: reportListUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage(function(data){
                reportSet.checkReportCode = data.checkReportCode;
                reportSet.checkReportName = data.checkReportName;
                reportSet.checkReportDescribe = data.checkReportDescribe;
                $("#checkReportCode").html(reportSet.checkReportCode);
                $("#checkReportName").html(reportSet.checkReportName);
                $("#checkReportDescribe").html(reportSet.checkReportDescribe);
            });
        }
    });
});

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(callback){
    //关闭
    $('body').on('click','#btnSubmit',function(){
        reportSet.checkReportType = $("#checkReportType").val();
        reportSet.isLaw = $("#isLaw").val();
        if(!reportSet.checkReportCode){
            top.layer.alert("温馨提示：未选择评标报告");
        }

        $.ajax({
            type:"post",
            url:saveUrl,
            async:true,
            data: reportSet,
            success: function(data){
                if(data.success){
                    var index1 = top.layer.getFrameIndex(window.name);
                    top.layer.alert(data.data, function(index){
                        callback(data);
                        top.layer.close(index);
                        top.layer.close(index1);
                    })
                }else{
                    top.layer.alert('温馨提示：'+data.message)
                }
            }
        });
    });
}
