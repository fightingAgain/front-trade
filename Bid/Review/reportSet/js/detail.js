/**
*  zhouyan 
*  2019-10-24
*  评标报告详情
*  方法列表及功能描述
*/

var detailUrl = config.Reviewhost + '/CheckReportInfoController/getReportInfoAndModel.do'; //获取所有标段列表
var saveUrl = config.Reviewhost + '/CheckReportInfoController/save.do';//保存
var deleteUrl = config.Reviewhost + '/CheckReportInfoController/delete.do';//删除
var addPart = 'Review/reportSet/model/addPart.html';//添加章节
var variableList = 'Review/reportSet/model/insetList.html';//变量列表
var modelList = 'Review/reportSet/model/modelList.html';//模块列表
var currIndex = 0;
var reportList = [];//章节列表
var ue = '';
var checkReportCode = '';//评标报告编号
var checkReportType = 1;//评标报告类型
$(function(){
	ue = UE.getEditor('container');
    checkReportCode = $.getUrlParam('checkReportCode');
    checkReportType = $.getUrlParam('checkReportType');

	getDetail(checkReportCode);
	/*评标报告目录点击*/
	$('.report_detail').on('click','.reportEditList',function(){
		//切换背景
		$(this).addClass('actived').siblings().removeClass('actived');
		
		var index = $(this).attr('data-index');
		reportPre(index);
	});
	//关闭
	$('html').on('click','#btnClose',function(){
		var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});

    //添加章节
    $("#btnAdd").click(function(){
        //获取编辑器的焦点
        UE.getEditor('container').focus();
        top.layer.open({
            type: 2,
            title: '添加章节',
            area: ['80%', '95%'],
            resize: false,
            content: addPart+"?checkReportCode="+checkReportCode+'&checkReportType=' + checkReportType,
            success:function(layero, index){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.passMessage(function(data){
                    window.location.reload();
                });  //调用子窗口方法，传参
            }
        });
    });

    //删除章节
    $("#btnDelete").click(function(){
        layer.open({
            title: '删除章节'
            ,content: '您确定要删除此章节吗?'
			,btn: ['删除', '取消']
            ,yes: function(index){
                $.ajax({
                    type:"post",
                    url:deleteUrl,
                    async:true,
                    data: {id:reportList[currIndex].id},
                    success: function(data){
                        if(data.success){
                            getDetail(checkReportCode);
                        }else{
                            top.layer.alert(data.message)
                        }
                    }
                });
                layer.close(index);
            },
            btn2: function(index){
                layer.close(index);
			}
        });



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
                        reportList[currIndex].partName = $("#partName").val();
                        reportList[currIndex].editType = $("#editType").val();
                        reportList[currIndex].signatureType = $("#signatureType").val();
                        reportList[currIndex].transverse=$("#transverse").val();
                        reportList[currIndex].sort = $("#sort").val();
                        reportList[currIndex].checkReportModelId=data.id;
                        reportList[currIndex].modelName=data.modelName;
                        reportList[currIndex].serviceContent=data.serviceContent;
                        reportList[currIndex].fileUrl=data.fileUrl || "";
                        reportPre(currIndex);
                    }

                });  //调用子窗口方法，传参
            }
        });
	});
	//插入变量
	$('#btnInsert').click(function(){
		chooseVal()
	})
	$('#btnSubmit').click(function(){
		var index = $('.actived').attr('data-index');
        var oldContent = reportList[currIndex].checkReportContent;
		var checkReportContent = getContent(ue);
		if(!reportList[currIndex].fileUrl){
            reportList[currIndex].checkReportContent = checkReportContent;
		}
        reportList[currIndex].partName = $("#partName").val();
        reportList[currIndex].editType = $("#editType").val();
        reportList[currIndex].signatureType = $("#signatureType").val();
        reportList[currIndex].transverse=$("#transverse").val();
        reportList[currIndex].sort = $("#sort").val();
		$.ajax({
			type:"post",
			url:saveUrl,
			async:true,
			data: reportList[currIndex],
			success: function(data){
				if(data.success){
                    top.layer.alert('保存成功');
                    getDetail(checkReportCode, reportList[currIndex].sort-1);
				}else{
                    reportList[currIndex].checkReportContent = oldContent;
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
        checkReportModelId:reportList[currIndex].checkReportModelId
    }
    return data;
}

function getDetail(checkReportCode, index){
	$.ajax({
		type:"post",
		url:detailUrl,
		async:true,
		data: {
			'checkReportCode': checkReportCode
		},
		success: function(data){
			if(data.success){
				reportList = data.data;
				if(data.data && data.data.length >0){
					detailHtml(data.data, index);
				}
			}else{
                top.layer.alert(data.message)
			}
		}
	});
}
function detailHtml(data, index){
    index = index?index:0;
	var html = '';
	$('.report_detail').html('');
	for(var w = 0;w < data.length;w++){
		if(w == index){
			html += '<li class="reportEditList actived" data-index="'+w+'">'+data[w].partName+'</li>';
		}else{
			html += '<li class="reportEditList" data-index="'+w+'">'+data[w].partName+'</li>';
		}
	}
	$(html).appendTo('.report_detail');
	reportPre(index )
}


function reportPre(index){
	currIndex = index;
    $("#partName").val(reportList[index].partName);
    $("#editType").val(reportList[index].editType);
    $("#signatureType").val(reportList[index].signatureType);
    $("#transverse").val(reportList[index].transverse);
    $("#sort").val(reportList[index].sort);
    $("#modelName").html(reportList[index].modelName);
    $("#serviceContent").html(reportList[index].serviceContent);
	if(reportList[index].fileUrl){
        $('#container').css('display','none');
        $('#btnInsert').hide();
        $('#btnPre').hide();
        $('#pdfReportViewBox').css('display','block');
        var newUrl=chgUrl(config.FileHost + "/fileView" + reportList[index].fileUrl)
        $("#pdfReportView").attr('src',newUrl);
	}else{
        $('#container').css('display','block');
        $('#btnInsert').show();
        $('#btnPre').show();
        $('#pdfReportViewBox').css('display','none');
        ue.ready(function() {
            if(reportList[index].checkReportContent){
                setContent(ue, reportList[index].checkReportContent);
                ue.addInputRule(function(root){
                    $.each(root.getNodesByTagName('a'),function(i,node){
                        node.tagName="span";
                    });
                    $.each(root.getNodesByTagName('pre'),function(i,node){
                        node.innerHTML;
                    });
                });
            }else{
                ue.setContent("");
            }
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
        return UE.utils.html(html).replace(/((\r)?\n)*/g, "");
    })

    return content;
}

function setContent(ue, content){

    content = content.replace(/(<pre[^>]*>)((.(?!<\/pre>))+)(.(?=<\/pre>))(<\/pre>)/g, function(a,b,c,d,e,f){
        var html = c+e;
        return b+UE.utils.unhtml(html.replace(/(<[^\/>]+>)/g, "\n$1")
                            .replace(/(<\/[^>]+>)/g, "$1\n")
                            .replace(/\n+/g, "\n"))+f;
    });

    // var div = $("<div>"+content+"</div>");
    // $.each(div.find("pre"),function(index, em){
    //     var em = $(em);
    //     var html = UE.utils.unhtml(em.html().replace(/<!--#(list|if|esle)-->/g,function(index, str){return "</#"+str+">"})
    //                                     .replace(/(<[^\/>]+>)/g, "\n$1")
    //                                     .replace(/(<\/[^>]+>)/g, "$1\n")
    //                                     .replace(/\n+/g, "\n"));
    //     em.html(html)
    // });
    ue.setContent(content);
}