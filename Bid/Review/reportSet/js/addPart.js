/**

 *  评标报告详情
 *  方法列表及功能描述
 */

var saveUrl = config.Reviewhost + '/CheckReportInfoController/save.do';//保存
var modelList = 'Review/reportSet/model/modelList.html';//模块列表
var variableList = 'Review/reportSet/model/insetList.html';//变量列表
var ue = '';
var partInfo = {};
var checkReportType = 1;//评标报告类型
var callback;
$(function(){
    ue = UE.getEditor('container');
    partInfo.transverse = 0;
    partInfo.checkReportCode = $.getUrlParam('checkReportCode');//评标报告编号
    checkReportType = $.getUrlParam('checkReportType');
    $('.val_title').html('添加评标报告章节')
    //关闭
    $('html').on('click','#btnClose',function(){
        var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
    });

    //选择模块
    $("#modelName").click(function(){
        top.layer.open({
            type: 2,
            title: '选择模块',
            area: ['80%', '95%'],
            resize: false,
            content: modelList,
            success:function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.passMessage(function(data){
                    if(!(partInfo.checkReportModelId && partInfo.checkReportModelId == data.id)){
                        partInfo.partName = $("#partName").val();
                        partInfo.editType = $("#editType").val();
                        partInfo.signatureType = $("#signatureType").val();
                        partInfo.sort = $("#sort").val();
                        partInfo.checkReportModelId=data.id;
                        partInfo.fileUrl=data.fileUrl || "";
                        partInfo.modelName=data.modelName;
                        partInfo.serviceContent = data.serviceContent;
                        if(!data.fileUrl){
                            partInfo.checkReportContent = "<p></p>";
                        }

                        reportPre();
                    }

                });  //调用子窗口方法，传参
            }
        });
    });
    //插入变量
    $('#btnInsert').click(function(){
        chooseVal()
    });
    $('#btnSubmit').click(function(){
        var oldContent = partInfo.checkReportContent;
        var checkReportContent = getContent(ue);
        if(!partInfo.fileUrl){
            partInfo.checkReportContent = checkReportContent;
        }

        partInfo.partName = $("#partName").val();
        partInfo.editType = $("#editType").val();
        partInfo.signatureType = $("#signatureType").val();
        partInfo.transverse = $("#transverse").val();
        partInfo.sort = $("#sort").val();
        $.ajax({
            type:"post",
            url:saveUrl,
            async:true,
            data: partInfo,
            success: function(data){
                if(data.success){
                    var index1 = top.layer.getFrameIndex(window.name);
                    top.layer.alert('保存成功', function(index){
                        callback(data);
                        top.layer.close(index);
                        top.layer.close(index1);
                    })
                }else{
                    partInfo.checkReportContent = oldContent;
                    top.layer.alert(data.message)
                }
            }
        });
    });

    $('#btnPre').click(function(){
        UE.getEditor('container').execCommand('previewpdf');
    });
});



function getPartInfo(){
    var data = {
        partName:$("#partName").val(),
        content:getContent(ue),
        checkReportType:checkReportType,
        transverse:$("#transverse").val(),
        signatureType:$("#signatureType").val(),
        sort:$("#sort").val(),
        checkReportModelId:partInfo.checkReportModelId
    }
    return data;
}

function reportPre(){
    $("#partName").val(partInfo.partName);
    $("#editType").val(partInfo.editType);
    $("#signatureType").val(partInfo.signatureType);
    $("#transverse").val(partInfo.transverse);
    $("#sort").val(partInfo.sort);
    $("#modelName").html(partInfo.modelName);
    $("#serviceContent").html(partInfo.serviceContent);
    if(partInfo.fileUrl){
        $('#container').css('display','none');
        $('#btnInsert').hide();
        $('#btnPre').hide();
        $('#pdfReportViewBox').css('display','block');
        var newUrl=chgUrl(config.FileHost + "/fileView" + partInfo.fileUrl)
        $("#pdfReportView").attr('src',newUrl);
    }else{
        $('#container').css('display','block');
        $('#btnInsert').show();
        $('#btnPre').show();
        $('#pdfReportViewBox').css('display','none');
        ue.ready(function() {
            ue.setContent(partInfo.checkReportContent);
            ue.addInputRule(function(root){
                $.each(root.getNodesByTagName('a'),function(i,node){
                    node.tagName="span";
                });
            });
        });
    }

}
function chgUrl(url) {
    var timestamp = (new Date()).valueOf();

    url = url + "?timestamp=" + timestamp;

    return encodeURI(url);
}
//选择变量
function chooseVal(){
    //获取编辑器的焦点
    UE.getEditor('container').focus();
    top.layer.open({
        type: 2,
        title: '选择变量',
        area: ['80%', '95%'],
        resize: false,
        content: variableList,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage(inserthtml);  //调用子窗口方法，传参
        }
    });
}
function inserthtml(data){
    UE.getEditor('container').execCommand('inserthtml',data[0].variableFormat);
}

function getContent(ue){
    var content = ue.getContent();
    content = content.replace(/<pre[^>]+>[^<]+<\/pre>/g, function(html){
        return UE.utils.html(html);
    })

    return content;
}

/*
 * 页面传参方法
 * data:{isMulti:false}
 */
function passMessage(_callback){
    callback = _callback;
}
