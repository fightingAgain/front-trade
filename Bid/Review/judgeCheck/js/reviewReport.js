var dowoloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件
var reportUe, reportUeId;

var checkReportItems = [];//可修改的评标报告列表
function reviewReport(node) {
    var flag = false;
    var param = {
        "method": 'getReport',
        "nodeType": node.nodeType
    };
    reviewFlowNode(param, function (data) {
        flag = true;
        if(isEnd==0 && data.isEdit == 1 && data.checkReportItems && data.checkReportItems.length>0){
            loadContent('model/reviewReport/edit_report_content.html',function(){
                showEditReport(data);
            });
		}else if(data.bidCheckReport && (data.bidCheckReport.reportState == 1 || data.bidCheckReport.reportState == 2)){
            loadContent('model/reviewReport/content.html',function(){
                showReport(data);
                getHistory();
            });
		}
        destructionFunction = function(){
            consumeReportPart();
            destructionFunction = function(){};
        }
    }, false);
    return flag;
}

function showEditReport(data){
    checkReportItems = data.checkReportItems;
    var partList = '';
    for(var w = 0;w < checkReportItems.length;w++){
        if(w == 0){
            partList += '<li class="reportPart actived" data-index="'+w+'">'+checkReportItems[w].partName+'</li>';
        }else{
            partList += '<li class="reportPart" data-index="'+w+'">'+checkReportItems[w].partName+'</li>';
        }
    }
    $('#reportPartList').html(partList);
    $('#reportPartList').css({'height':$('.reportEdit').height()+'px','overflow-y': 'auto'})

    var buttons = '';
    buttons +='<button id="previewReportPartPdf" class="btn btn-primary btn-strong keyButton" hidden="hidden">预览</button>';
    buttons +='<button id="saveReportPart" class="btn btn-primary btn-strong keyButton">保存</button>';
    buttons +='<button id="createReportPdf" class="btn btn-primary btn-strong keyButton">生成PDF</button>';
    buttons +='<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';
    setButton(buttons);

    reportPre(0,checkReportItems[0].editType);
}

function showReport(data){
	var report="";
    report = "<table class='table table-bordered'>"
    report+='<tr><td style="width:50px">序号</td><td>文件名称</td><td style="width:300px">操作</td></tr>'
    report+='<tr data-fileUrl="'+data.bidCheckReport.fileUrl+'"><td>1</td><td>评标报告</td><td>'
	if(data.bidCheckReport.reportState == 2 || (reviewRoleType != 1 && reviewRoleType != 2)){
        report+='<button class="btn btn-primary btn-sm downloadReport" >下载</button>'
	}
    report+='<button class="btn btn-primary btn-sm previewReport">预览</button>'
    report+='</td></tr>'
    report+='</table>'
    $('#reportContent').html(report);

    var buttons = '';
    if (data.bidCheckReport && data.bidCheckReport.reportState == 1 && (reviewRoleType == 1 || reviewRoleType == 2)&& (data.isCheck ==undefined || data.isCheck == null || data.isCheck == 0)){
        buttons +='<button id="stamped" data-id="'+data.bidCheckReport.id+'" data-fileUrl="'+data.bidCheckReport.fileUrl+'" class="btn btn-primary btn-strong keyButton">签章</button>'
	}
    buttons +='<button id="relevant" class="btn btn-primary btn-strong">查看项目信息</button>';
    setButton(buttons);
}

$('#content').on('click','.downloadReport',function(){
	var fileUrlr = $(this).parents("tr:first").attr("data-fileUrl");
	downloadFile(fileUrlr)
});
$('#content').on('click','.previewReport',function(){
    var fileUrlr = $(this).parents("tr:first").attr("data-fileUrl");
	showImage(fileUrlr)
});


$('#btn-box').on('click','#saveReportPart',function(){
    saveReport(0)
});
$('#btn-box').on('click','#createReportPdf',function(){
    saveReport(1)
});

/**
 * 签章
 */
$('#btn-box').on('click','#stamped',function(){
    var pdfurl = $(this).attr("data-fileUrl");

    top.layer.open({
        type: 2,
        title: "签章 ",
        area: ['100%','100%'],
        maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
        resize: false, //是否允许拉伸
        btn:["签章","关闭"],
        content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+pdfurl,
        success: function(layero, index){

            isCloseSign = false
        },
        yes:function(index,layero){
            customMask =top.layer.load(1, {shade: [0.3, '#000000'],content:'<div style="width:150px;padding-top:46px;">签章中，请稍候...</div>',area: ['100px','150px']});
            new CA().signature(function(publicKey){
                let data;
                let icardno = "";
                if(expertCA){
                    icardno = userInfo.identityCardNum
                }
                var param = {
                    "nodeType":singReportNode.nodeType,
                    "method":"getSign",
                    "publicKey":publicKey
                };
                reviewFlowNode(param, function(res){
                    data = res;
                }, false, true);
                if(data){
                    return data;
                }else{
                    throw new Error("");
                }
            }, function(params){
                let data;
                var param = {
                    "nodeType":singReportNode.nodeType,
                    "method":"sign",
                    "pdfId":params.pdfId,
                    "sigString":params.sigString,
                    "caCode":params.caCode,
                    "caDn":params.caDn
                };
                reviewFlowNode(param, function(res){
                    data = res;
                }, false, true);
                if(data){
                    return data;
                }else{
                    throw new Error("");
                }
            }, function(){
                return {};
            }, function(url){
                var iframeWin = layero.find('iframe');
                iframeWin.attr("src", siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+url);
                layero.find('.layui-layer-btn0').hide();
                currFunction();
                top.layer.close(customMask);
                top.layer.msg('温馨提示：签章成功！', {time: 5000});
                // var inde = top.layer.alert('温馨提示：签章成功！');
                // setTimeout(function() {
                // 	top.layer.close(inde);
                // }, 5000);
            },icardno);
        },
        no:function(index,layero){
            top.layer.close(index);
        },
        end: function(){
            isCloseSign = true
        }
    });
});

function saveReport(isCreatePdf){
    var param = {
        "method": 'saveReport',
        "nodeType": currNode.nodeType,
        'checkReportItems':checkReportItems,
        'isCreatePdf':isCreatePdf
    };
    reviewFlowNode(param, function (data) {
		if(isCreatePdf == 1){
            var reportId = data.id;
            top.layer.open({
                type: 2,
                title: "预览 ",
                area: ['100%','100%'],
                maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
                resize: false, //是否允许拉伸
                btn: ['提交', '取消'], //可以无限个按钮
//              content: top.config.FileHost + "/fileView" + data.fileUrl,
                content: siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+data.fileUrl,
                yes:function(index,layero){
                    var param = {
                        "method": 'submitReport',
                        "nodeType": currNode.nodeType,
                        'id':reportId
                    };
                    reviewFlowNode(param, function (data) {
                        top.layer.close(index);
                        top.layer.alert('温馨提示：评标报告上传成功，请进行签章');
                        currFunction();
					},true);
                },
                btn2: function(index, layero){
                    top.layer.close(index);
                }
            });
        }else{
            top.layer.alert('温馨提示：保存成功！')
        }
	}, false);
}
//展示图片
function showImage(filePath) {
	parent.previewPdf(filePath);
}
//下载
function downloadFile(filePath) {
	var newUrl =dowoloadFileUrl + '?ftpPath=' + filePath + '&fname=评标报告';
	window.location.href = $.parserUrlForToken(newUrl);
}
//获取历史数据
function getHistory(){
	if(reviewRoleType != 1 && reviewRoleType != 2){
        var param = {
            "method": 'getHisReport',
            "nodeType": currNode.nodeType
        };
        reviewFlowNode(param, function (data) {
            historyReport(data)
		});
	}
}
//评标报告历史记录
function historyReport(data){
	var html = '<h3>评标报告历史记录:</h3><table class="table table-bordered">'
		+'<tr><td style="width:50px">序号</td><td>文件名称</td><td style="width:100px">次数</td><td style="width:150px">操作</td></tr>';
	for(var i = 0;i<data.length;i++){
        html+='<tr><td>'+(i+1)+'</td><td>评标报告</td><td>第'+data[i].evaluationResultCount+'次</td></td><td>'
	        +'<button class="btn btn-primary btn-sm downloadHisReport" data-url="'+data[i].fileUrl+'">下载</button>'
	        +'<button class="btn btn-primary btn-sm previewHisReport" data-url="'+data[i].fileUrl+'">预览</button>'
	        +'</td></tr>'
	}
    html+='</table>';

    $('#historyTable').html(html);
}

$('#content').on('click','.downloadHisReport',function(){
	var filepath = $(this).attr('data-url');
	downloadFile(filepath)
});

$('#content').on('click','.previewHisReport',function(){
	var filepath = $(this).attr('data-url');
	showImage(filepath)
});

/*评标报告目录点击*/
$('#content').on('click','.reportPart',function(){
	//切换背景
	$(this).addClass('actived').siblings().removeClass('actived');
	
	var index = $(this).attr('data-index');
	var editType = checkReportItems[index].editType;
	reportPre(index,editType);
});

function reportPre(index,type){
	if(type == '0'){
		$('#container').css('display','none');
		$('#previewReportPartPdf').hide();
		$('#pdfReportViewBox').css('display','block');
//		var newUrl=config.FileHost + "/fileView" + checkReportItems[index].pdfUrl;
		var newUrl=siteInfo.sysUrl + '/media/js/pdfjs/web/viewer.html?file='+top.config.FileHost + '/fileView'+checkReportItems[index].pdfUrl;
		$("#pdfReportView").attr('src',newUrl);
        consumeReportPart();
	}else{
		$('#container').css('display','block');
		$('#previewReportPartPdf').show();
		$('#pdfReportViewBox').css('display','none');
        initializationReportPart('container', checkReportItems[index]);
	}
	 
}

/*预览*/
$('#btn-box').on('click','#previewReportPartPdf',function(event){
    reportUe.execCommand('previewpdf');
});

function chgUrl(url) {
    var timestamp = (new Date()).valueOf();
    if(url.indexOf("?") != -1){
        url = encodeURI(url) + "&timestamp=" + timestamp;
    }else{
        url = encodeURI(url) + "?timestamp=" + timestamp;
    }

    return url;
}

/**
 * 初始化评标报告章节文本编辑器
 * @param id
 * @param index
 * @constructor
 */
function initializationReportPart(id, checkReportItem){
    consumeReportPart();
    $("#"+id).html('<div id="partContent"></div>');
    reportUe = UE.getEditor("partContent");
    reportUe.ready(function() {
        reportUeId = $("#"+id).find("div").eq(0).attr("id");
        reportUe.setContent(checkReportItem.checkReportContent?checkReportItem.checkReportContent:'');
        reportUe.addListener('blur',function(eventName,event){
            checkReportItem.checkReportContent = reportUe.getContent();
        });
        reportUe.addInputRule(function(root){
            $.each(root.getNodesByTagName('a'),function(i,node){
                node.tagName="span";
            });
        });
    });
    window.getPartInfo = function(){
    	var data = {
            bidSectionId:bidSectionId,
            examType:examType,
            partName:checkReportItem.partName,
            transverse:checkReportItem.transverse,
            signatureType:checkReportItem.signatureType,
            sort:checkReportItem.sort
		}
		return data;
	}
}

//销毁评标报告章节文本编辑器
function consumeReportPart(){
    if(reportUe){
        UE.delEditor(reportUeId);
        reportUe = null;
        reportUeId = null;
    }
}