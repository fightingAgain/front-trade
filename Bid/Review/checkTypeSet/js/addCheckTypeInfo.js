/**
*  zhouyan 
*  2019-10-24
*  评标报告列表
*  调整评标办法的评标报告
*/

var getUrl = config.Reviewhost + '/CheckTypeInfoController/get'; //获取评标办法
var saveUrl = config.Reviewhost + '/CheckTypeInfoController/save'; //保存评标办法
var checkTypeItemListUrl = 'Review/checkTypeSet/model/checkTypeList.html';//评标办法列表
$(function(){
    id = $.getUrlParam('id');//评标办法
    if(id){
        $.ajax({
            type:"post",
            url:getUrl,
            async:true,
            data: {id:id},
            success: function(data){
                if(data.success){
                    $("#sysType").val(data.data.sysType);
                    $("#examType").val(data.data.examType);
                    $("#isPublicProject").val(data.data.isPublicProject);
                    $("#tenderProjectType").val(data.data.tenderProjectType);
                    $("#tenderProjectClassifyCode").val(data.data.tenderProjectClassifyCode);
                    $("#checkType").val(data.data.checkType);
                    $("#checkTypeName").val(data.data.checkTypeName);
                    $("#checkTypeDesc").val(data.data.checkTypeDesc);
                    $("#checkTypeCode").val(data.data.checkTypeCode);
                    $("#checkTypeItemName").html(data.data.checkTypeItemName);

                }else{
                    top.layer.alert('温馨提示：'+data.message)
                }
            }
        });
    }

    //关闭
    $('body').on('click','#btnClose',function(){
        var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
    });
});

//选择评标办法详情
$("#checkTypeItemName").click(function(){
    top.layer.open({
        type: 2,
        title: '选择评标办法详情',
        area: ['100%', '100%'],
        resize: false,
        content: checkTypeItemListUrl,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            var examType =  $("#examType").val();
            iframeWin.passMessage(examType,function(data){
                $("#checkTypeCode").html(data.checkTypeCode);
                $("#checkTypeItemName").html(data.checkTypeName);
            });
        }
    });
});

//关闭
$('#btnSubmit').click(function(){
    reportSet.checkReportType = $("#checkReportType").val();
    reportSet.isLaw = $("#isLaw").val();
    if(!reportSet.checkReportCode){
        parent.layer.alert("温馨提示：未选择评标报告");
    }

    $.ajax({
        type:"post",
        url:saveUrl,
        async:true,
        data: reportSet,
        success: function(data){
            if(data.success){
                var index1 = parent.layer.getFrameIndex(window.name);
                parent.layer.alert(data.data, function(index){
                    callback(data);
                    parent.layer.close(index);
                    parent.layer.close(index1);
                })
            }else{
                parent.layer.alert('温馨提示：'+data.message)
            }
        }
    });
});