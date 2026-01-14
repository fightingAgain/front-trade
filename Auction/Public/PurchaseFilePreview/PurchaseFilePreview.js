var examType = getUrlParam('examType'); //预审采购文件还是询比采购文件
var fileId = getUrlParam('id');
var packageId = getUrlParam('packageId');
var bidFileCheckId = getUrlParam('bidFileCheckId');
var supplierType;
var packageInfo = {};

$(function () {
    getPackageInfo();
    initEvent();
})

function initEvent() {

    $(".btn-group button").on('click', function () {
        $(".btn-group button").each(function (index, el) {
            $(this).removeClass('btn-primary');
            $('#' + $(this).attr('target')).hide();
        });
        $(this).addClass('btn-primary');
        $('#' + $(this).attr('target')).show();
    })

    //关闭当前窗口
    $("#btnClose").click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    });
}

function getPackageInfo() {
    $.ajax({
        url: top.config.AuctionHost + '/ProjectReviewController/findProjectPackageInfo.do',
        type: 'post',
        async: false,
        data: {
            "packageId": packageId
        },
        success: function (data) {
            if (data.success) {
                packageInfo = data.data;//包件信息
                getBidFiles();
                // getPackageCheckList();
                getPackageCheckInfo();
                if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
					$('.clearFileWrap').show();
				}
            } else {
                parent.layer.alert(data.message);
            }
        },
        error: function (data) {
            parent.layer.alert("获取失败")
        }
    });
}

function getBidFiles() {
    $.ajax({
        type: "get",
        url: top.config.AuctionHost + '/BidFileController/findNewFileList.do',
        async: false,
        dataType: 'json',
        data: {
            "packageId": packageId,
            'enterpriseType': '02',
            'examType': examType,
            'bidFileCheckId': bidFileCheckId,
        },
        success: function (res) {
            if (res.success) {
                if ($.isEmptyObject(res.data)) {
                    return
                }
                var bidFiles = res.data.bidFiles || [];
                var clearFiles = res.data.clearFiles || [];
                var outBidFiles = [];
                for (let i = 0; i < bidFiles.length; i++) {
                    if (bidFiles[i].systemStatus !== 1) {
                        outBidFiles.push(bidFiles[i]);
                    }
                }
                loadBidFiles('#purchaseFileTable', outBidFiles);
                if(packageInfo.isHasDetailedListFile &&  packageInfo.isHasDetailedListFile== 1){//有清单
                    loadBidFiles('#fileTablesOfClear', clearFiles);
                }
            } else {
                top.layer.alert(data.message)
            }
        }
    });
}

function loadBidFiles(el, data) {
    var tableEl = el;
    $(tableEl).bootstrapTable({
        pagination: false,
        undefinedText: "",
        columns: [{
            title: "序号",
            align: "center",
            halign: "center",
            width: "50px",
            formatter: function (value, row, index) {
                return index + 1;
            }
        },
        {
            field: "fileName",
            title: "文件名称",
            align: "left",
            halign: "left",

        },
        {
            field: "fileSize",
            title: "文件大小",
            align: "center",
            halign: "center",
            width: '120px'

        },
        // {
        //     field: "subDate",
        //     title: "上传时间",
        //     align: "center",
        //     halign: "center",
        //     width: '180px'

        // },
        // {
        //     field: "userName",
        //     title: "上传人",
        //     align: "center",
        //     halign: "center",
        //     width: '100px'
        // },
        {
            field: "caoz",
            title: "操作",
            width: '200px',
            halign: "center",
            align: "center",
            events: {
                'click .fileDownload': function (e, value, row, index) {
                    var downloadFileUrl = config.FileHost + '/FileController/download.do';
                    var newUrl = downloadFileUrl + "?ftpPath=" + row.filePath + "&fname=" + row.fileName;
                    window.location.href = $.parserUrlForToken(newUrl);
                },
                'click .previewFile': function (e, value, row, index) {
                    openPreview(row.filePath);
                },
            },
            formatter: function (value, row, index) {
                var fileSuffix = row.fileName.substring(row.fileName.lastIndexOf(".") + 1).toUpperCase();
                var btns = "";
                btns += "<a href='javascript:void(0)' class='btn btn-primary btn-xs fileDownload'>下载</a>&nbsp;&nbsp";
                if (['PNG', 'JPG', 'JPGE', 'PDF'].indexOf(fileSuffix) > -1) {
                    btns += "<a href='javascript:void(0)' class='btn btn-primary btn-xs previewFile'>预览</a>&nbsp;&nbsp"
                }
                return btns
            }

        }
        ]
    });
    $(tableEl).bootstrapTable("load", data); //重载数据
}

var packageCheckListInfo = [];
function getPackageCheckList() {
    $.ajax({
        url: top.config.AuctionHost + '/PackageCheckListController/list.do',
        type: 'get',
        dataType: 'json',
        async: true,
        data: {
            "packageId": packageId,
            'examType': examType
        },
        success: function (data) {
            if (data.success) {
                packageCheckListInfo = data.data || [];
                if (packageCheckListInfo.length > 0) {
                    formatCheckList();
                    setPackageCheckListInfo(0);
                }
            }
        }
    });
}
var bidPackageData;
function getPackageCheckInfo() {
    var url = top.config.AuctionHost + '/PackageCheckListController/findCheckList.do';

    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        async: true,
        data: {
            "packageId": packageId,
            'examType': examType,
            'id': fileId
        },
        success: function (res) {
            if (res.success) {
                var data = res.data;
                packageCheckListInfo = data.checkList || [];
                bidPackageData = data.bidPackageData;
                if (packageCheckListInfo.length > 0) {
                    formatCheckList();
                    setPackageCheckListInfo(0);
                }
                var priceSet = data.priceSet || {};

                if (examType == '1') {
                    if (priceSet.isShowPriceSet != '0') {
                        priceSet.isShowPriceSet = '1';
                        priceSet.checkType = null;
                    }
                    businessPriceSetData = priceSet;
                    scoreTypeBtn(businessPriceSetData.checkType, packageInfo.checkPlan)
                }
            }
        }
    });
}

function formatCheckList() {
    var strHtml1 = "";
    var _d = 0;
    for (var i = 0; i < packageCheckListInfo.length; i++) {
        if (supplierType != 1) {
            strHtml1 += '<li role="presentation" ';
            if (i == _d) {
                strHtml1 += ' class="active" ';
            }
            strHtml1 += ' onclick=setPackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName + (examType == 1 && packageCheckListInfo[i].envelopeLevel ? (packageCheckListInfo[i].envelopeLevel == 1 ? '（第一封）' : '（第二封）') : '') + '</a></li>';
        } else {
            if (packageCheckListInfo[i].isShowCheck == 0) {
                strHtml1 += '<li role="presentation" ';
                if (i == _d) {
                    strHtml1 += ' class="active" ';
                }
                strHtml1 += ' onclick=setPackageCheckListInfo(' + i + ')><a  href="#tab' + i + '" role="tab" data-toggle="tab" >' + packageCheckListInfo[i].checkName + (examType == 1 && packageCheckListInfo[i].envelopeLevel ? (packageCheckListInfo[i].envelopeLevel == 1 ? '（第一封）' : '（第二封）') : '') + '</a></li>';
            }
        }
    }
    $("#checkList1").html(strHtml1);
}

function setPackageCheckListInfo(_index) {
    if (!packageCheckListInfo[_index]) {
        return;
    }
    if (packageCheckListInfo.length > 0) {
        var PackageCheckItemList = packageCheckListInfo[_index].packageCheckItemXmlList;
        var strHtml = "";
        if (packageCheckListInfo[_index].checkType == 0) {
            var checkType = '合格制';
        }
        if (packageCheckListInfo[_index].checkType == 1) {
            var checkType = '评分制';
        }
        if (packageCheckListInfo[_index].checkType == 2) {
            var checkType = '偏离制';
        }
        if (packageCheckListInfo[_index].checkType == 3) {
            var checkType = '评分合格制';
        }
        if (packageCheckListInfo[_index].checkType == 4) {
            var checkType = '竞价';
        }
        if (packageCheckListInfo[_index].isShowCheck == 0) {
            if (packageCheckListInfo[_index].showCheckInfo != undefined) {
                var showCheckList = packageCheckListInfo[_index].showCheckInfo.split(',');
                var List0 = "", List1 = "", List2 = "", List3 = "";
                for (var n = 0; n < showCheckList.length; n++) {
                    if (showCheckList[n] == 0) {
                        List0 = true;
                    }
                    if (showCheckList[n] == 1) {
                        List1 = true;
                    }
                    if (showCheckList[n] == 2) {
                        List2 = true;
                    }
                    if (showCheckList[n] == 3) {
                        List3 = true;
                    }
                };
            }

        }
        strHtml = '<table style="font-size:14px" class="table table-bordered">'
            + '<tr>'
            + '<td style="width:250px;height:30px;line-height:30px;text-align:right">评审方式：</td>'
            + '<td style="text-align: left;"><span style="padding-right:15px">' + checkType + '</span><span>' + ((packageCheckListInfo[_index].checkType == 1 && examType != 0) ? '权重值：' + packageCheckListInfo[_index].weight : '') + '</span></td>'
            + '</tr>'
        if (packageInfo.isOpenDarkDoc == 1 && packageCheckListInfo[_index].checkType != 4 && examType != 0) {
            strHtml += '<tr>'
                + '<td style="text-align:right">是否启用暗标：</td>'
                + '<td style="text-align: left;"><span style="padding-right:15px">' + (packageCheckListInfo[_index].isShadowMark == 1 ? "是" : "否") + '</span></td>'
                + '</tr>'
        }
        if (packageCheckListInfo[_index].checkType == 4) {
            strHtml += '<tr>'
                + '<td style="width:200px;height:30px;line-height:30px;text-align:right">竞价起始价计算方式：</td>'
                + '<td style="text-align: left;">'
                + ['参与竞价供应商最低报价', '未淘汰供应商最低报价', '参与报价供应商最低报价'][packageCheckListInfo[_index].bidStartPriceFrom]
                + '</td>'
                + '</tr>';
        }
        if (packageCheckListInfo[_index].checkType == 4) {
            strHtml += '<tr>'
                + '<td style="text-align:right">竞价设置：</td>'
                + '<td style="text-align: left;">'
                + '<button type="button" class="btn btn-primary" id="packageSetBtn">查看竞价设置</button>'
                + '</td>'
                + '</tr>'
        }
        strHtml += '<tr class="' + (packageCheckListInfo[_index].checkType == 2 ? "" : "none") + '">'
            + '<td style="text-align:right">允许最大偏离项数：</td>'
            + '<td colspan="3" style="text-align: left;"><span style="padding-right:15px">' + (packageCheckListInfo[_index].deviate || "") + '</span></td>'
            + '</tr>'
            + '<tr class="' + (packageCheckListInfo[_index].checkType == 2 ? "" : "none") + '">'
            + '<td style="text-align:right">是否计入总数：</td>'
            + '<td colspan="3" style="text-align: left;"><span style="padding-right:15px">' + (packageCheckListInfo[_index].isSetTotal == 0 ? "计入总数" : "不计入") + '</span></td>'
            + '</tr>'
            + '<tr class="' + (packageInfo.checkPlan == 1 && packageCheckListInfo[_index].checkType == 2 ? "" : "none") + '">'
            + '<td style="text-align:right">是否' + (packageInfo.checkPlan == 4 ? '减' : '加') + '价：</td>'
            + '<td colspan="3" style="text-align: left;"><span style="padding-right:15px">' + (packageCheckListInfo[_index].isAddPrice == 0 ? "" + (packageInfo.checkPlan == 4 ? '减' : '加') + "价" : "不" + (packageInfo.checkPlan == 4 ? '减' : '加') + "价") + '</span></td>'
            + '</tr>'
            + '<tr class="' + ((packageCheckListInfo[_index].isAddPrice == 0 && packageCheckListInfo[_index].checkType == 2) ? "" : "none") + '">'
            + '<td style="text-align:right">偏离' + (packageInfo.checkPlan == 4 ? '减' : '加') + '价幅度：</td>'
            + '<td colspan="3" style="text-align: left;"><span style="padding-right:15px">' + packageCheckListInfo[_index].addPrice + '%</span></td>'
            + '</tr>'
        if (supplierType != 1) {
            strHtml += '<tr>'
                + '<td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示此评价项：</td>'
                + '<td style="text-align: left;">' + (packageCheckListInfo[_index].isShowCheck == 0 ? '是' : '否') + '</td>'
                + '</tr>'
            if (packageCheckListInfo[_index].checkType != 4) {
                strHtml += '<tr id="Show_Check" class="' + (packageCheckListInfo[_index].isShowCheck == 0 ? "" : "none") + '">'
                    + ' <td style="width:250px;height:30px;line-height:30px;text-align:right">是否向供应商展示评价列项：</td>'
                    + '<td style="text-align: left;">'
                    + '<span class="' + (List0 == true ? '' : "none") + '">评价内容、</span>'
                    + '<span class="' + (List1 == true ? '' : "none") + '">评价标准、</span>'
                    + '<span class="' + (List2 == true ? '' : "none") + '">' + ((packageCheckListInfo[_index].checkType == 1 || packageCheckListInfo[_index].checkType == 3) ? '分值' : '是否关键要求') + '、</span>'
                    + '<span class="' + (List3 == true ? '' : "none") + '">备注、</span>'
                    + '</td>'
                    + '</tr>'
            }

        }
        strHtml += '</table>'
            + '<table class="table table-hover table-bordered" style="margin:5px auto" id="table_' + packageCheckListInfo[_index].id + '">'
            + '</table>'
            + '<table class="table  table-bordered red ' + ((packageCheckListInfo[_index].checkType == 1 || packageCheckListInfo[_index].checkType == 3) ? "" : "none") + '" style="margin:5px auto">'
            + '<tr>'
            + '<td style="text-align:right;width:200px">分值合计：</td>'
            + '<td style="text-align:left">'
            + '<p style="margin-top:10px">' + (packageCheckListInfo[_index].scoreTotal || 0) + '分</p>'
            + '</td>'
            + '</tr>'
            + '<tr>'
            + '<td style="text-align:right">汇总方式：</td>'
            + '<td style="text-align:left">'
        //           +'<p>当评委人数大于等于'+(packageCheckListInfo[_index].totalType||5)+'时，汇总方式为方法一，小于<span class="M'+_index +'">'+(packageCheckListInfo[_index].totalType||5)+'</span>时为方法二</p>'
        if (packageCheckListInfo[_index].totalType == 0) {
            strHtml += '<p>方法二、评委全部的评分去掉一个最高分和最低分后计算出平均得分，即为供应商评审因素最后得分</p>'
        } else {
            strHtml += '<p>方法一、评委全体成员评分计算出平均得分，即为供应商评审因素最后得分</p>'
        };
        +'</td>'
            + '</tr>'
            + '</table>'
            + '<table class="table table-bordered red  ' + (packageCheckListInfo[_index].checkType != 1 && packageCheckListInfo[_index].checkType != 3 ? "" : "none") + '" style="margin:5px auto">'
            + '<tr class="' + (packageCheckListInfo[_index].checkType == 0 ? "" : "none") + '">'
            + '<td style="text-align:right;width:200px">汇总方式：</td>'
            + '<td style="text-align:left">'
            + '<p>评委全体成员按照少数服从多数（' + Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM != undefined ? packageCheckListInfo[_index].totalM : '2') + '分之' + Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN != undefined ? packageCheckListInfo[_index].totalN : '1') + '）的原则判定评价标准是否合格。</p>'
            + '<p>1、若评审项为关键要求，任何一项不合格都将淘汰。</p>'
            + '<p>2、若评审项为一般要求，任何一项或多项不合格不影响评审结果，不做淘汰处理。</p>'
            + '</td>'
            + '</tr>'
            + '<tr class="' + (packageCheckListInfo[_index].checkType == 2 ? "" : "none") + '">'
            + '<td style="text-align:right;width:200px">汇总方式：</td>'
            + '<td style="text-align:left">'
            + '<p>评委全体成员按照少数服从多数（' + Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalM != undefined ? packageCheckListInfo[_index].totalM : '2') + '分之' + Arabia_To_SimplifiedChinese(packageCheckListInfo[_index].totalN != undefined ? packageCheckListInfo[_index].totalN : '1') + '）的原则判定评价标准是否合格。</p>'
            + '<p>1、若评审项为关键要求，任何一项偏离都将淘汰。</p>'
            + '<p>2、未勾选的评价项为一般要求，对这些一般要求的任何一项向下偏离将导致供应商报价上浮（采购文件中特别注明的条款，其报价的浮动按具体要求执行）；该评审项偏离项数超过' + (packageCheckListInfo[_index].deviate) + '项将被淘汰。</p>'
            + '</td>'
            + '</tr>'
            + '</table>'
        $("#packageDetail").html(strHtml);
        var cols = [
            {
                field: "xuhao",
                title: "序号",
                align: "center",
                halign: "center",
                width: "50px",
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
        ]
        if ((List0 == true && supplierType == 1) || supplierType != 1) {
            cols.push({
                field: "checkTitle",
                title: "评价内容",
                align: "left",
                halign: "left",

            })
        }
        if ((List1 == true && supplierType == 1) || supplierType != 1) {
            cols.push({
                field: "checkStandard",
                title: "评价标准",
                halign: "left",
                align: "left",

            })
        }
        if ((List2 == true && supplierType == 1) || supplierType != 1) {
            if (packageCheckListInfo[_index].checkType == 1 || packageCheckListInfo[_index].checkType == 3) {
                cols.push({
                    field: "score",
                    title: "分值",
                    width: '150',
                    halign: "center",
                    align: "center"
                }, {
                    field: "itemScoreType",
                    title: "打分类型",
                    halign: "center",
                    width: '150',
                    align: "center",
                    formatter: function (value, row, index) {
                        if (value == '1') {
                            return '主观分'
                        } else if (value == '2') {
                            return '客观分'
                        }
                    }
                })
            } else {
                cols.push({
                    field: "isKey",
                    title: "是否关键要求",
                    halign: "center",
                    width: '150',
                    align: "center",
                    formatter: function (value, row, index) {
                        if (value === ''){
                            return '-';
                        }
                        else if (value == 0) {
                            return '是'
                        } else {
                            return '否'
                        }
                    }
                })

            }

        }
        if ((List3 == true && supplierType == 1) || supplierType != 1) {
            cols.push({
                field: "remark",
                title: "备注",
                halign: "left",
                align: "left",
            })
        }
        if ((packageCheckListInfo[_index].isShowCheck != 1 && supplierType == 1) || supplierType != 1) {
            packageCheckListInfo[_index].checkType != 4 && $('#table_' + packageCheckListInfo[_index].id).bootstrapTable({
                pagination: false,
                // height: '304',
                columns: cols
            });
        }

        $('#table_' + packageCheckListInfo[_index].id).bootstrapTable("load", PackageCheckItemList); //重载数据
    }

    //查看竞价设置
    $('#packageSetBtn').click(function () {
        parent.layer.open({
			type: 2,
			title: '查看竞价配置',
			area: ['1000px', '600px'],
            content: 'Auction/AuctionOffer/Agent/AuctionPurchase/viewAuctionPackage.html?biddingTimes=1&supplierRound=1&isbidding=1',
            success: function (layero, idx) {
                var iframeWin = layero.find('iframe')[0].contentWindow;
                iframeWin.passMessage(bidPackageData);
            },
		});
    })
}

//评价项数据获取
function checkListData(_index) {
    if (packageCheckListInfo.length > 0) {
        $.ajax({
            url: top.config.AuctionHost + '/PackageCheckItemController/list.do',
            type: 'get',
            dataType: 'json',
            async: false,
            data: {
                "packageCheckListId": packageCheckListInfo[_index].id
            },
            success: function (data) {
                if (data.data.length > 0) {
                    packageCheckListInfo[_index]['PackageCheckItems'] = data.data
                }
            }
        });
    }
};

var businessPriceSetData = "";
function findBusinessPriceSet() {
    $.ajax({
        url: top.config.AuctionHost + '/BusinessPriceSetController/findBusinessPriceSet.do',
        type: 'get',
        dataType: 'json',
        async: false,
        data: {
            "packageId": packageId,
        },
        success: function (data) {
            if (data.success) {
                businessPriceSetData = data.data
            }
        }
    });
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
    if (r != null) return unescape(r[2]);
    return null; // 返回参数值  
};