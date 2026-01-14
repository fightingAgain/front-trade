var clnBidReport; //清标报告数据
var currPartType; //当前章节类型
var clnBidReportContent="model/cleanBidder/content.html";
var expertClnbidReportSign; //签名数据
function cleanBidder(node) {
    var flag = false;
    var param = {
        "method": 'getClnBidReport',
        "nodeType": node.nodeType
    };
    reviewFlowNode(param, function (data) {
        flag = true;
        loadContent(clnBidReportContent,function(){
            expertClnbidReportSign= data.expertClnbidReportSign;
            if(data.clnbidReportInfo){
                var WebPDF = document.getElementById("UCAPI");
                $(WebPDF).show();
                if(WebPDF && WebPDF.ShowMenus){
                    WebPDF.ShowMenus = 0 ; //菜单栏隐藏
                    WebPDF.ShowSigns = 0 ; //签章工具栏隐藏
                    WebPDF.ShowTools = 0 ;//标准工具栏隐藏
                    WebPDF.ShowSides = 0 ;//侧边栏可见
                    WebPDF.WebUrl= $.parserUrlForToken(pdfSaveUrl);
                    WebPDF.RecordId =  bidSectionId;
                    if(data.clnbidReportInfo){
                        WebPDF.WebOpenUrlFile(top.config.FileHost + "/fileView" + data.clnbidReportInfo.fileUrl);
                        if(data.clnbidReportInfo.reportState == 1 ){
                            if(data.expertClnbidReportSign.signData){//已签章的合并签章数据
                                var signDataPath = top.config.FileHost + "/fileView" + data.expertClnbidReportSign.signData;
                                $.ajax({
                                    url: signDataPath,
                                    type: "get",
                                    dataType:"text",
                                    success: function (dat) {
                                        WebPDF.LoadLocalSignData(dat);
                                    }
                                });
                            }
                        }
                    }
                }
            }

            var height;
            if(window.contentsHeight){
                height = contentsHeight-138;
            }else{
                height=document.documentElement.clientHeight - 100;
            }
            $("#reportPart").css("height", height+"px");
            $("#pdfReportView").css("height", height+"px");

            showClnBidReport(data.clnBidDtos);
        });
        var button = "";
        if(!data.clnbidReportInfo){
            button ='<button type="button" class="btn btn-danger btn-strong" id="startClnBid">开始清标</button>';
        }else  if(data.clnbidReportInfo.reportState == 0){
            button ='<button type="button" class="btn btn-danger btn-strong" id="submitClnBidReport">提交报告</button>';
        }else if(data.clnbidReportInfo.reportState == 1){
            if(data.expertClnbidReportSign && !data.expertClnbidReportSign.signData){
                button ='<button type="button" class="btn btn-primary btn-strong keyButton" id="clnBidSign">签章</button>';
            }
        }
        setButton(button);
    }, false);
    return flag;
}

function showClnBidReport(data){
    if(!currBidderId){
        currBidderId = data[0].bidderId;
    }
    clnBidReport = {};
    var html = '<li role="clnBidder" class="seeClnBidReport active"><a href="#"  role="tab" data-toggle="tab">清标报告</a></li>';
    html += '<li role="clnBidder" class="kzj"><a href="#"  role="tab" data-toggle="tab">控制价</a></li>';
    for(var i=0; i < data.length; i++){
        clnBidReport[data[i].bidderId] = data[i].cleanBidderReports;
        var className = ''
        // if(currBidderId == data[i].bidderId){
        //     className += ' active';
        // }
        html+='<li role="clnBidder" class="clnBidder'+className+'" data-bidderId="'+data[i].bidderId+'"><a href="#"  ria-controls="clnBidder" role="tab" data-toggle="tab">'+ data[i].bidderName  +'</a></li>'
    }
    $("#clnBidderList").html(html);
    //tabClnBidReport(currBidderId);
}

/**
 * 查看投标人工程量清单错误数据
 */
$('#content').on('click','#clnBidderList .clnBidder', function(){
    currBidderId=$(this).attr("data-bidderId");
    //切换背景
    $(this).addClass('active').siblings().removeClass('active');
    // tabClnBidReport(currBidderId);
    showGclqdsj(currBidderId);
});

/**
 * 查看控制价数据
 */
$('#content').on('click','#clnBidderList .kzj', function(){
    //切换背景
    $(this).addClass('active').siblings().removeClass('active');

    showGclqdsj("1");
});


/**
 * 查看清单报告
 */
$('#content').on('click','#clnBidderList .seeClnBidReport', function(){
    $("#UCAPI").show();
    $("#pdfReportView").hide();
});

/**
 * 展示工程量清单数据
 * @param url
 */
function showGclqdsj(sjbh){
    var kzjbz = 2;
    if(sjbh == "1"){
        kzjbz = 1;
    }
    var url = top.config.Clnbidhost+"/XsdReviewQueryPort.do?id=201907051813290039&xh=1&sjbh="+sjbh+"&zbbh="+bidSectionId+"&kzjbz="+kzjbz;
    $("#UCAPI").hide();
    $("#pdfReportView").attr('src',url);
    $("#pdfReportView").show();
}


var clnBidReportPartType={
    "C1":"分部分项工程和单价措施项目符合性检查",
    "C2":"总价措施项目符合性检查",
    "C3":"其他项目符合性检查表",
    "C4":"规费、税金项目符合性检查",
    "C5":"发包人提供材料和工程设备符合性检查",
    "C6":"算术错误检查",
    "C7":"算术错误分析及修正记录表",
    "C8":"算术错误修正后的建设项目投标报价汇总表",
    "C9":"分部分项工程和单价措施项目清单价格分析记录表",
    "C10":"总价措施项目清单价格分析记录表",
    "C11":"其他项目清单价格分析记录表",
    "C12":"建设项目总人工费分析记录表",
    "C13":"单位工程投标报价分析记录表"
}

function tabClnBidReport(currBidderId){
    var cleanBidderReports = clnBidReport[currBidderId];

    if(!currPartType){
        currPartType = "C1";
    }
    var html = "";
    var partUrl = "";
    for(var i=0; i < cleanBidderReports.length; i++){
        var open = ''
        if(currPartType == cleanBidderReports[i].partType){
            open += ' open'
            partUrl += cleanBidderReports[i].partUrl;
        }
        html += '<li data-partType="'+cleanBidderReports[i].partType+'" data-pdfUrl="'+cleanBidderReports[i].partUrl+'" class="clnBidReportPart'+open+'">'+clnBidReportPartType[cleanBidderReports[i].partType]+'</li>'
    }
    partUrl=config.FileHost + "/fileView"+partUrl;
    $("#reportPart").html(html);
    $("#pdfReportView").attr('src',partUrl);
}

$('#content').on('click','#reportPart .clnBidReportPart', function(){
    currPartType=$(this).attr("data-partType");
    var partUrl=config.FileHost + "/fileView" + $(this).attr("data-pdfUrl");
    //切换背景
    $(this).addClass('open').siblings().removeClass('open');
    $("#pdfReportView").attr('src',partUrl);
});


/**
 * 清标报告签章
 */
$('#btn-box').on('click','#clnBidSign',function(){
    $("#UCAPI").show();
    $("#pdfReportView").hide();
    var WebPDF = document.getElementById("UCAPI");
    if(WebPDF) {
        var isSignS = true;
        var signResult = '';
        var positionArr = expertClnbidReportSign.signSite.split(';');
        for (var i = 0; i < positionArr.length; i++) {
            if (i == 0) {
                WebPDF.IsShowInputBox = true;
            } else {
                WebPDF.IsShowInputBox = false;
            }
            var page = positionArr[i].split('-');
            //signResult = WebPDF.SeriesSignatureExt(page[0], page[1], 0, "", 1, page[2], "1-" + WebPDF.PageCount,1,0);
            //定位模式：1绝对坐标；2百分比坐标。Mod为1为绝对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为50px，y坐标为60px处盖章。Mod为2为相对坐标方式，Pos参数为“50*60”,则定位方式为以页面左下角为原点，x坐标为页面宽度的百分之50，y坐标为页面高度的百分之60处盖章
            var mode = page.length > 3 ? page[3] : 1;
            //定位信息
            var pos = page[2];
            //需要保护的页面信息
            //var area= page.length>4?page[3].replace("_","-"):"1-" + WebPDF.PageCount;
            var area = "1-" + WebPDF.PageCount;
            signResult = WebPDF.SeriesSignature(page[0], page[1], 0, "", mode, pos, area);
            if (signResult != 0) {
                isSignS = false;
            }
        }

//		//判断签章是否成功
        if (isSignS) {
            var param = {
                "method": 'saveSignData',
                "nodeType": currNode.nodeType,
                "id": expertClnbidReportSign.id,
                "signData": WebPDF.SaveBatchSignDataToLocal()
            };
            if (param.signData != "" && param.signData != undefined && param.signData != "undefined" && param.signData != null) {
                reviewFlowNode(param, function (data) {
                    alert("签章完毕");
                    currFunction();
                });
            } else {
                alert("未获取到签章数据!");
            }

        } else {
            WebPDF.GetErrorString(signResult);
        }
    }
});

/**
 * 开始清标
 */
$('#btn-box').on("click","#startClnBid",function(){
    startClnBid(function(){
        alert('清标完毕');
        currFunction();
    });
});

/**
 * 提交清标报告
 */
$('#btn-box').on("click","#submitClnBidReport",function(){
    var param = {
        "method": 'submitReport',
        "nodeType": currNode.nodeType
    };
    reviewFlowNode(param, function (data) {
        alert('提交成功');
        currFunction();
    });
});


/**
 * 下达开始清标指令
 * @param node
 */
function startClnBid(callback) {
    var param = {
        "method": 'startClnBid',
        "nodeType": currNode.nodeType
    };
    reviewFlowNode(param, function (data) {
        callback();
    }, true);
}

