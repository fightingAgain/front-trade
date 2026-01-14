var urlOfferHistoryInfo = top.config.AuctionHost + '/AuctionProjectPackageController/getPurchaseDetail.do';

var findCheck = top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionSuperviseList.do';
var searchUrl = config.AuctionHost + "/ProjectViewsController/findProjectCheckList.do";

var urlSaveSupervise = top.config.AuctionHost + '/AuctionSuperviseController/saveOrUpdateAuctionSupervise.do';
var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerByType.do";//项目审核人列表数据接口

var updateCheck = top.config.AuctionHost + '/AuctionSuperviseController/updateAuctionSuperviseAudit.do';
//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
var urlfindBidFileDownload = top.config.AuctionHost + "/BidFileDownloadController/findBidFileDownload.do";//采购文件下载记录明细
//最终报价接口
var urlUpdateLastMoney = top.config.AuctionHost + "/AuctionProjectPackageController/updateLastMoney.do";
var urlDownloadAuctionFile = top.config.FileHost + "/FileController/download.do"; //下载竞价文件地址
var singleOfferListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getSingleOriginatorOfferesList.do'
var getOfferListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件


var findSupplierUrl = top.config.AuctionHost + "/AuctionSfcOfferController/getSupplierTotalPrice.do"; //供应商
//报价列表
var urlsupplier = top.config.AuctionHost + "/AuctionSfcOfferController/getAllAuctionOfferList.do";

var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件

var url = window.location.search;
var projectId = getUrlParam("projectId");
var packageId = getUrlParam("packageId");
var bussid = getUrlParam('id');
var type = getUrlParam("type");
var tType = getUrlParam("tType");
var auctionOfferItems = []; //报价记录
var auctionDetaileItems = []; //明细记录
var tempAuctionOfferItems = [];
var tempAuctionOfferItems1 = [];
var tempAuctionDetailed = [];
var status; //业主代表审核状态
var itemState = "";
var AuctioningDetailedId = ""; //明细的id
var supplierPrice;

var detailedId = "";

var offerData = "";

var auctionType = ""; //竞卖方式

var returnData = [];
var detaillist = []; //清单信息

$(function () {
    getOfferInfo();
    if (type == 'check') {
        $("#checkMeg").show();
    }
});
function getOfferInfo() {
    //getCheckList();
    $.ajax({
        url: urlViewAuctionInfo,
        data: {
            packageId: packageId,
            state: 1,
            tenderType: 1,
        },
        async: false,
        success: function (res) {
            if (res.success) {
                var data = res.data;
                offerData = data;
                $("td[id]").each(function () {
                    $(this).html(data[this.id]);
                    //竞价方式
                    if (this.id == "auctionType") {
                        switch (data[this.id]) {
                            case 0:
                                $(this).html("自由竞价");
                                break;
                            case 1:
                                $(this).html("单轮竞价");
                                break;
                            case 2:
                                $(this).html("多轮竞价 2轮竞价");
                                break;
                            case 3:
                                $(this).html("多轮竞价 3轮竞价");
                                break;
                            case 6:
                                $(this).html("清单式竞价");
                                break;
                            case 7:
                                $(this).html("单项目竞价");
                                break;
                            default:
                                $(this).html("不限轮次");
                                break;
                        }
                    }
                });
                if (data.auctionType == 6) {
                    $("#offerRecord").html("<table id='detailPackageList' class='table'></table>");
                    supplier();
                    getTable();
                } else if (data.auctionType == 7) {
                    $("#offerRank").html("<table id='roundRank' class='table'></table>");
                    getOfferRank();
                    $('.unshowOnAuction7').hide()
                } else if (data.auctionType == 0 || data.auctionType == 1) { // 单轮或者自由
                    if (data.auctionModel == 0) { //按照包件
                        $("#offerRank").html("<table id='freePackageRank'></table>");
                        $("#offerRecord").html("<table id='freePackageRecord'></table>");
                        freePackageRank();
                        freePackageRecord();
                        //	$("#detail").bootstrapTable("load",)	
                    } else { //按照明细
                        $(".detail").hide();
                        $("#offerRank").html("<div style='width:50%;float: left;'><table id='freeDetailRK'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRank'></table></div>");
                        $("#offerRecord").html("<div style='width:50%;float: left;'><table id='freeDetailRD'></table></div><div style='width: 50%;float: left;'><table id='freeDetailRecord'></table></div>");
                        freeDetailRank();
                        freeDetailRecord();
                        freeDetailRK();
                        freeDetailRD();
                    }
                } else {
                    //多轮
                    $("#offerRank").html("<table id='roundRank'></table>");
                    $("#offerRecord").html("<div style='width:40%;float: left;'><table id='roundItem'></table></div><div style='width: 60%;float: left;'><table id='roundRecord'></table></div>");
                    roundRank();
                    roundRecord();
                    roundItem();
                    //	$("#detail").bootstrapTable("load",)	
                }

                //				//竞价类型 	auctionModel：0为按包件，1为按明细
                //				if(data.auctionModel == undefined) {
                //					//报价记录：
                //					//1、自由竞价、单轮竞价中按包件
                //					//2、多轮竞价
                //					auctionOfferItems = data.auctionOfferItems;
                //					getAuctionOfferItem(0);
                //				}
                //
                //				//按包件
                //				if((data.auctionModel == 0) && (data.auctionType == 0 || data.auctionType == 1)) {
                //					auctionOfferItems = data.auctionOfferItems;
                //					getAuctionOfferItem1(1);
                //				}
                //
                //				//按明细
                //				if((data.auctionModel == 1) && (data.auctionType == 0 || data.auctionType == 1)) {
                //					auctionDetaileItems = data.auctionDetailed;
                //					getAuctionOfferItem1(2);
                //				}

                //是否需要业主代表确认及业主代表
                if (data.auctionSupervise.isSupervise == 1) {
                    if (typeof (data.auctionSupervise.userName) != "undefined") {
                        $("#employeeName").html(data.auctionSupervise.userName);
                        $("#checkMes").show();
                        $("#checkPerson").show();
                        getCheckList();
                    } else {
                        $("#employeeName").html("未设置");
                    }
                } else {
                    $("#employeeName").html("无需业主代表");
                }
            }
        }
    });
}
// 获取报价列表
function getOfferRank() {
    $.ajax({
        type: "post",
        url: singleOfferListUrl,
        data: { packageId: packageId },
        success: function (res) {
            console.log(res)
            var listData = res.data;
            listData = getEmployeeOfferFileList(listData, 'JJ_AUCTION_SGESUPPLIERTECH_OFFER')
            $("#roundRank").bootstrapTable({
                undefinedText: "",
                paganization: false,
                columns: [{
                    title: '排名',
                    width: '50px',
                    align: 'center',
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },
                {
                    field: 'supplierEnterpriseName',
                    title: '供应商',
                    align: 'center'

                }, {
                    field: 'noTaxRateTotalPrice',
                    title: '报价总计(不含税)',
                    align: 'center'

                }, {
                    field: 'taxRate',
                    title: '税率(%)',
                    align: 'center'

                }, {
                    field: 'taxRateTotalPrice',
                    title: '报价总计(含税)',
                    align: 'center'

                }, {
                    field: 'offerTime',
                    title: '报价时间',
                    align: 'center'
                },
                {
                    title: '报价文件附件',
                    align: 'left',
                    formatter: function (value, row, index) {
                        var fileDatas = row.fileDatas;
                        console.log(fileDatas)
                        if (fileDatas) {
                            var html = "<table class='table' style='border-bottom:none'>";
                            for (var i = 0; i < fileDatas.length; i++) {
                                html += "<tr>";
                                html += "<td>" + fileDatas[i].fileName + "</td>"
                                html += "<td  width='150px;'><span><a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='openAccessory(\"" + fileDatas[i].fileName + "\",\"" + fileDatas[i].filePath + "\")'>下载</a>&nbsp;"
                                // if (filesnames == 'PNG' || filesnames == 'JPG' || filesnames == 'JPGE' || filesnames == 'PDF') {
                                //     html += "<a href='javascript:void(0)' class='btn btn-primary btn-xs' onclick='previewFile(\"" + filePathArr[i] + "\")'>预览</a>"
                                // }
                                html += "</span></td></tr>";
                            }
                            html += "</table>";
                            return html;
                        } else {
                            return '暂无文件'
                        }
                    }
                }

                ]
            })
            $("#roundRank").bootstrapTable("load", listData);
        }
    });
}
function getEmployeeOfferFileList(employeeData, modelName) {
    employeeData.forEach(function (val, index) {
        $.ajax({
            type: "get",
            url: getOfferListUrl,
            async: false,
            data: {
                'modelId': packageId,
                'modelName': modelName,
                'employeeId': val.employeeId
            },
            datatype: 'json',
            success: function (res) {
                if (res.success) {
                    employeeData[index].fileDatas = res.data;
                }
            }
        });
    })
    return employeeData;
}

//下载文件
function openAccessory(fileName, filePath) {
    var newUrl = urlDownloadAuctionFile + "?ftpPath=" + filePath + "&fname=" + fileName;
    window.location.href = $.parserUrlForToken(newUrl);
}

function detail() {
    $("#detail").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '序号',
            align: 'center',
            width: '50px',
            formatter: function (value, row, index) {
                return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
        },
        {
            field: 'detailedName',
            title: '商品名称',

        },
        {
            field: 'brand',
            title: '品牌要求',
        },
        {
            field: 'detailedVersion',
            title: '规格型号',
            width: '160'
        },
        {
            field: 'detailedCount',
            title: '数量',
            align: 'center',
            width: '100'
        },
        {
            field: 'detailedUnit',
            title: '单位',
            align: 'center',
            width: '100'
        }
        ]
    })
}

function freeDetailRK() {
    $("#freeDetailRK").bootstrapTable({
        undefinedText: "",
        paganization: false,
        onCheck: function (row, ele) {
            var index = $(ele).parents("tr").index();
            if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
                $("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
                detailedId = row.id;

            }
        },
        onClickCell: function (field, value, row, $element) {
            curField = 1;
            if (field !== "Status") {
                //执行代码
            }
        },
        onPostBody: function () {
            $("#freeDetailRK input[type=radio]").attr("name", "freeDetailRK");
        },
        columns: [{
            radio: true,
            formatter: function (value, row, index) {
                if (index == 0) {
                    if (offerData.auctionPackageDetaileds[index].offerItems !== undefined && offerData.auctionPackageDetaileds[index].offerItems !== null && offerData.auctionPackageDetaileds[index].offerItems !== "") {
                        $("#freeDetailRank").bootstrapTable("load", offerData.auctionPackageDetaileds[index].offerItems);
                        detailedId = row.id;
                    }

                    return true;
                }
            }
        },
        {
            field: 'detailedName',
            title: '商品名称'
        },
        {
            field: 'brand',
            title: '品牌要求'
        },
        {
            field: 'detailedVersion',
            title: '规格型号'
        },
        {
            field: 'detailedCount',
            title: '数量',
            align: 'center'

        },
        {
            field: 'detailedUnit',
            title: '单位',
            align: 'center'

        }
        ]
    })

    $("#freeDetailRK  input[type='radio']").attr("name", "freeDetailRD");
    $("#freeDetailRK").bootstrapTable("load", offerData.auctionPackageDetaileds);

}

function freeDetailRD() {
    $("#freeDetailRD").bootstrapTable({
        undefinedText: "",
        paganization: false,
        onCheck: function (row, ele) {
            var index = $(ele).parents("tr").index();
            if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
                $("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
            }
        },
        onPostBody: function () {
            $("#freeDetailRD input[type=radio]").attr("name", "freeDetailRD");
        },
        columns: [{
            radio: true,
            formatter: function (value, row, index) {
                if (index == 0) {
                    if (offerData.details[index].offerItems !== undefined && offerData.details[index].offerItems !== null && offerData.details[index].offerItems !== "") {
                        $("#freeDetailRecord").bootstrapTable("load", offerData.details[index].offerItems);
                    }
                    return true;
                }
            }
        },
        {
            field: 'detailedName',
            title: '商品名称'
        },
        {
            field: 'brand',
            title: '品牌要求'
        },
        {
            field: 'detailedVersion',
            title: '规格型号'

        },
        {
            field: 'detailedCount',
            title: '数量',
            align: 'center'

        },
        {
            field: 'detailedUnit',
            title: '单位',
            align: 'center'

        }
        ]
    })

    $("#freeDetailRD").bootstrapTable("load", offerData.details);

}

function freeDetailRank() {
    $("#freeDetailRank").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '排名',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'enterpriseName',
            title: '供应商',
            align: 'left'
        },

        {
            field: 'offerMoney',
            title: '报价金额（元）',
            align: 'right',
            width: "120",
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }
        },
        {
            field: 'lastMoney',
            title: '最终报价（元）',
            align: 'right',
            width: "150",
            formatter: function (value, row, index) {
                if (row.isEliminated != undefined && row.isEliminated == '1') {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
                } else {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
                }

            }
        }, {
            title: '修改原因',
            align: 'left',
            field: 'editReason',
            width: '120px'
        }
        ]
    })



    //	$("#freeDetailRank").bootstrapTable("load", offerData.offerlogs);
}

function freeDetailRecord() {
    $("#freeDetailRecord").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '序号',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'enterpriseName',
            title: '供应商',
            align: 'left'

        }, {
            field: 'offerMoney',
            title: '报价（元）',
            align: 'right',
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }

        }, {
            field: 'subDate',
            title: '报价时间',
            align: 'center'
        }]
    })
}

//自由或者单轮  按照包件排名
function freePackageRank() {
    $("#freePackageRank").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '序号',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'enterpriseName',
            title: '供应商',
            align: 'left'

        },

        {
            field: 'offerMoney',
            title: '报价金额（元）',
            align: 'right',
            width: "120",
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }
        },
        {
            field: 'lastMoney',
            title: '最终报价（元）',
            align: 'right',
            width: "150",
            formatter: function (value, row, index) {
                if (row.isEliminated != undefined && row.isEliminated == '1') {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
                } else {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
                }

            }
        }, {
            title: '修改原因',
            align: 'left',
            field: 'editReason',
            width: '120px'
        }
        ]
    })


    $("#freePackageRank").bootstrapTable("load", offerData.rankItems);


}

//自由或者单轮  按照包件报价记录
function freePackageRecord() {
    $("#freePackageRecord").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '序号',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'enterpriseName',
            title: '供应商',
            align: 'left'

        }, {
            field: 'offerMoney',
            title: '报价（元）',
            align: 'right',
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }

        }, {
            field: 'subDate',
            title: '报价时间',
            align: 'center'
        }]
    })
    $("#freePackageRecord").bootstrapTable("load", offerData.offerlogs);
}

//多伦报价 报价排名
function roundRank() {
    $("#roundRank").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '排名',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'enterpriseName',
            title: '供应商',
            align: 'left'

        },

        {
            field: 'offerMoney',
            title: '报价金额（元）',
            align: 'right',
            width: "120",
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }
        },
        {
            field: 'lastMoney',
            title: '最终报价（元）',
            align: 'right',
            width: "150",
            formatter: function (value, row, index) {
                if (row.isEliminated != undefined && row.isEliminated == '1') {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "<span style='color:red;'>(已淘汰)</span></span>";
                } else {
                    return "<span>" + Number(value || row.offerMoney).toFixed(2) + "</span>";
                }

            }
        }, {
            title: '修改原因',
            align: 'left',
            field: 'editReason',
            width: '120px'
        }
        ]
    })
    $("#roundRank").bootstrapTable("load", offerData.rankItems);

}

//多伦报价 报价轮次
function roundItem() {
    $("#roundItem").bootstrapTable({
        undefinedText: "",
        paganization: false,
        clickToSelect: true,
        onCheck: function (row, ele) {
            var index = $(ele).parents("tr").index();
            if (offerData.offerlogs[index].offerLog !== undefined && offerData.offerlogs[index].offerLog !== null && offerData.offerlogs[index].offerLog !== "") {
                $("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog);
            }
        },
        columns: [{
            radio: true,
            formatter: function (value, row, index) {
                if (index == 0) {

                    $("#roundRecord").bootstrapTable("load", offerData.offerlogs[index].offerLog || []);
                    return true;
                }
            }
        },
        {
            title: '轮次',
            align: "center",
            formatter: function (value, row, index) {
                return "第" + sectionToChinese(index + 1) + "轮报价";
            }
        }, {
            field: 'enterpriseName',
            title: '最低价竞买人',
            align: "center",
            formatter: function (value, row, index) {
                return (value || "无报价人");
            }
        }, {
            field: 'minPrice',
            title: '最低价报价（元）',
            align: "right",
            formatter: function (value, row, index) {
                return value ? (Number(value).toFixed(2)) : "无最低报价";
            }
        }
        ]
    })

    $("#roundItem").bootstrapTable("load", offerData.offerlogs);
    //	alert(1);
}

//多伦报价 报价记录
function roundRecord() {
    $("#roundRecord").bootstrapTable({
        undefinedText: "",
        paganization: false,
        columns: [{
            title: '序号',
            width: '50px',
            align: 'center',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: "enterpriseName",
            title: "竞买人"
        }, {
            field: "offerMoney",
            title: "报价（元）",
            align: 'right',
            formatter: function (value, row, index) {
                return Number(value).toFixed(2);
            }
        }, {
            field: "subDate",
            title: "报价时间"
        }, {
            field: "offerRound",
            title: "报价轮次",
            formatter: function (value, row, index) {
                return "第" + sectionToChinese(value) + "轮";
            }
        }]
    })
}
//设置查询条件
function queryParams(params) {
    return {
        'projectId': projectId,
        'packageId': packageId
    }
}

function getCheckList() {
    $("#checkList").bootstrapTable('destroy');
    //加载数据
    $("#checkList").bootstrapTable({
        url: findCheck,
        dataType: 'json',
        method: 'get',
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        locale: "zh-CN",
        pagination: false, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        clickToSelect: true, //是否启用点击选中行
        search: false, // 不显示 搜索框
        classes: 'table table-bordered', // Class样式
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        silent: true, // 必须设置刷新事件
        striped: true,
        columns: [
            [{
                //field: 'Id',
                title: '序号',
                align: 'center',
                width: '50px',
                formatter: function (value, row, index) {
                    return index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
                }
            },
            {
                field: 'checkState',
                title: '审核状态',
                align: 'center',
                width: '160',
                formatter: function (value, row, index) {
                    if (row.checkState == '0') {
                        return "<span>无需审核</span>";
                    } else if (row.checkState == '1') {
                        return "<span>未提交</span>";
                    } else if (row.checkState == '2') {
                        return "<span>已提交</span>";
                    } else if (row.checkState == '3') {
                        return "<span>审核通过</span>";
                    } else if (row.checkState == '4') {
                        return "<span>审核未通过</span>";
                    }

                }
            },
            {
                field: 'checkContent',
                title: '审核意见',
                align: 'left'

            },
            {
                field: 'userName',
                title: '审核人',
                align: 'center',
                width: '160'
            },
            {
                field: 'checkDate',
                title: '操作时间',
                align: 'center',
                width: '160'
            }
            ]
        ]
    });
}


$("#btn_close").click(function () {
    top.layer.closeAll();
})

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
    var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
    if (r != null) return unescape(r[2]);
    return null; // 返回参数值  
}

$("#btnSave").click(function () {
    var checkResult = $("input:radio[name=checkResult]:checked").val(); //审核结果，0为通过,1为未通过
    var checkContent = $("#checkContent").val(); //审核意见

    if (checkResult == "1" && checkContent == "") {
        parent.layer.msg("请输入审核意见！");
        return;
    }

    if (checkContent.length > 200) {
        parent.layer.msg("审核意见不能超过200个字！");
        return;
    }

    //保存审核信息
    $.ajax({
        type: "post",
        url: updateCheck,
        async: true,
        data: {
            'id': bussid,
            'checkResult': checkResult,
            'checkContent': checkContent,
            'projectId': projectId,
            'packageId': packageId
        },
        datatype: 'json',
        success: function (data) {
            if (data.success) {
                parent.$('#ProjectAuditTable').bootstrapTable('refresh', { url: searchUrl });
                parent.layer.alert("提交竞价审核情况成功!");
                parent.layer.close(parent.layer.getFrameIndex(window.name));
            } else {
                parent.layer.alert(data.message);
                return;
            }
        }
    });
});
//取消按钮
$("#btnCancel").click(function () {
    parent.layer.close(parent.layer.getFrameIndex(window.name));
});

//供应商报价
function getTable() {
    $.ajax({
        url: urlsupplier,
        type: "post",
        data: {
            packageId: packageId,
        },
        beforeSend: function (xhr) {
            var token = $.getToken();
            xhr.setRequestHeader("Token", token);
            msgloading = top.layer.msg('数据加载中', {
                icon: 0
            });
            //			msgloading  =parent.layer.load(0, {shade: [0.3, '#000000']});
        },
        error: function () {
            top.layer.alert("加载失败!");
        },
        success: function (res) {
            if (res.success) {
                detaillist = res.data;
                if (detaillist && detaillist.length > 0) {
                    var auctionSfcOfferes = [];
                    var textVals = [];
                    var isMinPrice = [];
                    var objsss = [];
                    for (var i = 0; i < detaillist.length; i++) {
                        auctionSfcOfferes = detaillist[i].auctionSfcOfferItemList
                        if (auctionSfcOfferes && auctionSfcOfferes.length > 0) {
                            for (var c = 0; c < auctionSfcOfferes.length; c++) {
                                for (var e = returnData.length - 1; e >= 0; e--) {
                                    if (returnData[e].supplierEnterpriseId == auctionSfcOfferes[c].supplierEnterpriseId) {
                                        var priceTtotal = 'totalPrice' + e;
                                        var priceUnit = 'unitPrice' + e;
                                        if (detaillist[i].id == auctionSfcOfferes[c].specificationId) {
                                            detaillist[i][priceTtotal] = auctionSfcOfferes[c].noTaxRateTotalPrice;
                                            detaillist[i][priceUnit] = auctionSfcOfferes[c].noTaxRateUnitPrice;
                                        }
                                    }
                                }
                            }

                        }

                    }
                    listTable();
                    //添加表格动态列及赋值
                    if (returnData && returnData.length > 0) {
                        for (var e = returnData.length - 1; e >= 0; e--) {
                            var obj1 = {
                                field: 'totalPrice' + e,
                                title: '不含税总价',
                                valign: "middle",
                                align: "center",
                                cellStyle: {
                                    css: {
                                        "background": '#fff',
                                        "min-width": "120px",
                                        "word-wrap": "break-word",
                                        "word-break": "break-all",
                                        "white-space": "normal"
                                    }
                                }

                            };
                            var obj2 = {
                                field: 'unitPrice' + e,
                                title: '不含税单价',
                                valign: "middle",
                                align: "center",
                                cellStyle: addStyle2

                            };
                            var obj = {
                                "title": returnData[e].supplierEnterpriseName,
                                "field": 'supplier' + e,
                                "valign": "middle",
                                "align": "center",
                                "colspan": 2,
                                "rowspan": 1

                            };
                            objsss.splice(0, 0, obj2, obj1);
                            col[0].splice(10, 0, obj);
                        }
                    }
                    col.splice(1, 0, objsss)
                    if (detaillist.length < 2500) {
                        listData = detaillist;
                        initTable();
                        $('#detailPackageList').bootstrapTable("load", listData);
                    } else {
                        total = detaillist.length;
                        pageSize = Math.ceil(total / 100)
                        pageIndex = 1;
                        start = (pageIndex - 1) * 100
                        end = start + 100
                        listData = detaillist.slice(start, end)
                        initTable();
                        $('#detailPackageList').bootstrapTable("load", listData);

                    }

                }
            }
        },
        complete: function () {
            parent.layer.close(msgloading);
        }
    })
}

//报价明细表格初始化
function initTable() {
    if (detaillist.length > 9) {
        var height = "400"
    } else {
        var height = ""
    }
    $('#detailPackageList').bootstrapTable({
        pagination: false,
        undefinedText: "",
        columns: col,
        height: height,
        onAll: function () {
            if (detaillist.length > 2500) {
                $("#detailPackageList").parent(".fixed-table-body").scroll(function (event) {
                    var y = $(this).scrollTop();
                    var wScrollY = y; // 当前滚动条位置
                    var wInnerH = $(this)[0].clientHeight; // 设备窗口的高度（不会变）
                    var bScrollH = $(this)[0].scrollHeight; // 滚动条总高度
                    var LockMore = false;
                    if ((wScrollY + wInnerH) + 50 >= bScrollH) {
                        //触底
                        if (pageIndex >= pageSize) {
                            // 滚动太快，下标超过了数组的长度
                            pageIndex = pageSize;
                            return;
                        } else {
                            pageIndex++
                            start = (pageIndex - 1) * 100;
                            end = start + 100;
                            var listTable1 = detaillist.slice(start, end);
                            $('#detailPackageList').bootstrapTable("append", listTable1);
                        }
                        if (LockMore) {
                            return false;
                        }
                    }
                })
            }
        },
        onPostBody: function () {
            //重点就在这里，获取渲染后的数据列td的宽度赋值给对应头部的th,这样就表头和列就对齐了
            var header = $(".fixed-table-header table thead tr th");
            var body = $(".fixed-table-header table tbody tr td");
            var footer = $(".fixed-table-header table tr td");
            body.each(function () {
                header.width((this).width());
                footer.width((this).width());
            });
        }
    });
}
/*最低价供应商*/
function supplier() {
    $.ajax({
        type: "POST",
        url: findSupplierUrl,
        async: false,
        data: {
            packageId: packageId
        },
        dataType: 'json',
        error: function () {
            top.layer.alert("加载失败!");
        },
        success: function (response) {
            if (response.success) {
                returnData = response.data;
                if (returnData && returnData.length > 0) {
                    supplierPrice = returnData;
                    initsuppTable();
                    supplierId = returnData[0].supplierEnterpriseId;
                } else {
                    initsuppTable();
                }
            }
        }
    })
}

function listTable() {
    if (returnData && returnData.length > 0) {
        col = [
            [{
                title: "序号",
                valign: "middle",
                align: "center",
                width: "50px",
                colspan: 1,
                rowspan: 2,
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: "materialNum",
                title: "物料号",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "170px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }

            },
            {
                field: "materialName",
                title: "名称",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }

            },
            {
                field: "materialModel",
                title: "规格型号",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }

            },
            {
                field: "brandOrOriginPlace",
                title: "品牌/产地",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }

            },
            {
                field: "applyNum",
                title: "申请号",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "170px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }

            },

            {
                field: "materialUnit",
                title: "单位",
                valign: "middle",
                align: "center",
                halign: "center",
                width: '100px',
                colspan: 1,
                rowspan: 2

            },
            {
                field: "count",
                title: "数量",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "80px",
                        "white-space": "nowrap"
                    }
                }

            },
            {
                field: "budgetPrice",
                title: "预算价",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                },
                formatter: function (value, row, index) {
                    if (value) {
                        return parseFloat(value)
                    }

                }

            },
            {
                field: "deliveryDate",
                title: "要求交货期(订单后xx天)",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "100px",
                        "white-space": "nowrap"
                    }
                },
                /* formatter: function (value, row, index) {
                    if (value) {
                        return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");

                    }
                } */
            },
            {
                field: "minPrice",
                title: "最低单价",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                },
                formatter: function (value, row, index) {
                    if (value) {
                        return '<span>' + parseFloat(value) + '</span>';
                    }
                }
            },

            {
                field: "isBargain",
                title: "建议议价",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                },
                formatter: function (value, row, index) {
                    if (value == '0') {
                        return '<span>是</span>';
                    } else {
                        return '<span>否</span>';
                    }
                }
            },
            {
                field: "bargainResult",
                title: "议价结果",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                }
            },
            {
                field: "biddingPrice",
                title: "建议成交价",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                }
            },
            {
                field: "priceDefferences",
                title: "差价",
                valign: "middle",
                align: "center",
                halign: "center",
                colspan: 1,
                rowspan: 2,
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                },
                formatter: function (value, row, index) {
                    if (value) {
                        return '<span>' + parseFloat(value) + '</span>';
                    }
                }
            },
            {
                field: "priceDefferencesPercent",
                title: "差价%",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2,
                halign: "center",
                cellStyle: {
                    css: {
                        "min-width": "120px",
                        "white-space": "nowrap"
                    }
                },
                formatter: function (value, row, index) {
                    if (value) {
                        return parseFloat(value) + "%";
                    }

                }

            }
            ]
        ]
    } else {
        col = [
            [{
                title: "序号",
                align: "center",
                halign: "center",
                width: "50px",
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: "materialNum",
                title: "物料号",
                valign: "middle",
                align: "center",
                cellStyle: {
                    css: {
                        "min-width": "170px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }
            },
            {
                field: "materialName",
                title: "名称",
                align: "center",
                halign: "center",
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }
            },
            {
                field: "materialModel",
                title: "规格型号",
                align: "left",
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }
            },
            {
                field: "brandOrOriginPlace",
                title: "品牌/产地",
                align: "center",
                halign: "center",
                cellStyle: {
                    css: {
                        "min-width": "200px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }
            },
            {
                field: "applyNum",
                title: "申请号",
                valign: "middle",
                align: "center",
                cellStyle: {
                    css: {
                        "min-width": "170px",
                        "word-wrap": "break-word",
                        "word-break": "break-all",
                        "white-space": "normal"
                    }
                }
            },
            {
                field: "materialUnit",
                title: "单位",
                align: "center",
                halign: "center",
                width: '100px'
            },
            {
                field: "count",
                title: "数量",
                align: "center",
                halign: "center",
                width: '100px',
                cellStyle: {
                    css: {
                        "min-width": "80px",
                        "white-space": "nowrap"
                    }
                }

            },
            {
                field: "budgetPrice",
                title: "预算价",
                align: "center",
                halign: "center",
                width: '100px'

            },
            {
                field: "deliveryDate",
                title: "要求交货期(订单后xx天)",
                align: "center",
                halign: "center",
                cellStyle: {
                    css: {
                        "min-width": "150px",
                        "white-space": "nowrap"
                    }
                },
                /* formatter: function (value, row, index) {
                    if (value) {
                        return new Date(Date.parse(value.replace(/-/g, "/"))).Format("yyyy-MM-dd");
                    }
                } */
            },
            {
                field: "minPrice",
                title: "最低单价",
                align: "center",
                halign: "center",
                cellStyle: {
                    css: {
                        "min-width": "90px",
                        "white-space": "nowrap"
                    }
                }
            },
            {
                field: "isBargain",
                title: "建议议价",
                align: "center",
                halign: "center",
                formatter: function (value, row, index) {
                    if (value == '0') {
                        return '<span>是</span>';
                    } else {
                        return '<span>否</span>';
                    }
                }
            },
            {
                field: "bargainResult",
                title: "议价结果",
                align: "center",
                halign: "center",
                cellStyle: function (value, row, index) {
                    if (value) {
                        return {
                            css: {
                                "min-width": "90px",
                                "white-space": "nowrap"
                            }
                        }
                    } else {
                        return {}
                    }
                }
            },
            {
                field: "biddingPrice",
                title: "建议成交价",
                align: "center",
                halign: "center",
                cellStyle: function (value, row, index) {
                    if (value) {
                        return {
                            css: {
                                "min-width": "90px",
                                "white-space": "nowrap"
                            }
                        }
                    } else {
                        return {}
                    }
                }
            },
            {
                field: "priceDefferences",
                title: "差价",
                align: "center",
                halign: "center",
                cellStyle: function (value, row, index) {
                    if (value) {
                        return {
                            css: {
                                "min-width": "90px",
                                "white-space": "nowrap"
                            }
                        }
                    } else {
                        return {}
                    }
                }
            },
            {
                field: "priceDefferencesPercent",
                title: "差价%",
                align: "center",
                halign: "center",
                cellStyle: function (value, row, index) {
                    if (value) {
                        return {
                            css: {
                                "min-width": "90px",
                                "white-space": "nowrap"
                            }
                        }
                    } else {
                        return {}
                    }

                }

            }
            ]
        ]
    }
}
/*供应商报价*/
function initsuppTable() {
    $("#offerRank").html("<table id='offerRankList' class='table'></table>");
    $('#offerRankList').bootstrapTable({
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
            field: "supplierEnterpriseName",
            title: "供应商名称",
            align: "left",
            cellStyle: {
                css: {
                    "min-width": "200px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "normal"
                }
            }
        },
        {
            field: "noTaxRateTotalPrice",
            title: "不含税总价",
            align: "center",
            halign: "center",
            cellStyle: {
                css: {
                    "width": "190px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "normal"
                }
            }
        },
        {
            field: "priceDefferences",
            title: "差价（预算价-不含税总价）",
            align: "center",
            halign: "center",
            cellStyle: {
                css: {
                    "width": "190px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "normal"
                }
            }
        },
        {
            field: "priceDefferencesPercent",
            title: "差价比例（差价/预算价）",
            align: "center",
            halign: "center",
            formatter: function (value, row, index) {
                if (value) {
                    return value + "%"
                }

            },
            cellStyle: {
                css: {
                    "width": "190px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "normal"
                }
            }
        },
        {
            field: "offerTime",
            title: "报价时间",
            align: "center",
            halign: "center",
            cellStyle: {
                css: {
                    "width": "180px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "nowarp"
                }
            }
        },
        {
            field: "",
            title: "项目清单报价文件",
            align: "center",
            halign: "center",
            cellStyle: {
                css: {
                    "min-width": "120px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "nowarp"
                }
            },
            formatter: function (value, row, index) {
                var filesName;
                var filesPath;
                var timeArr = [];
                $.ajax({
                    type: "get",
                    url: getImgListUrl,
                    async: false,
                    data: {
                        'modelId': packageId,
                        'modelName': "JJ_AUCTION_SFC_OFFER",
                        'employeeId': row.employeeId

                    },
                    datatype: 'json',
                    success: function (data) {
                        var flieData = data.data;
                        if (data.success == true) {
                            if (flieData.length == 1) {
                                filesName = flieData[0].fileName;
                                filesPath = flieData[0].filePath

                            } else {
                                for (var e = 0; e < flieData.length; e++) {
                                    var subDate = new Date(flieData[e].subDate).getTime() / 1000;
                                    timeArr.push({
                                        time: subDate,
                                        filesName: flieData[e].fileName,
                                        filesPath: flieData[e].filePath
                                    })
                                }
                                var max = timeArr[0].time;
                                for (var t = 0; t < timeArr.length; t++) {
                                    var cur = timeArr[t].time;
                                    cur > max ? max = cur : null
                                }
                                //									var maxTime = timestampToTime(max);
                                for (var e = 0; e < timeArr.length; e++) {
                                    if (max == timeArr[e].time) {
                                        filesName = timeArr[e].filesName;
                                        filesPath = timeArr[e].filesPath;


                                    }
                                }

                            }
                        }
                    }
                });
                var dols = '<a href="javascript:void(0)" id="fliesName" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'
                return dols
            }
        },
        {
            field: "",
            title: "盖章版报价文件及其他附件",
            align: "center",
            halign: "center",
            cellStyle: {
                css: {
                    "min-width": "120px",
                    "word-wrap": "break-word",
                    "word-break": "break-all",
                    "white-space": "normal"
                }
            },
            formatter: function (value, row, index) {
                var dowload;
                var filesName;
                var filesPath;
                $.ajax({
                    type: "get",
                    url: getImgListUrl,
                    async: false,
                    data: {
                        'modelId': packageId,
                        'modelName': "JJ_AUCTION_SFC_SIGNATURE",
                        'employeeId': row.employeeId

                    },
                    datatype: 'json',
                    success: function (data) {
                        var flieData = data.data
                        if (data.success == true) {
                            if (flieData.length > 0) {
                                if (flieData.length == 1) {
                                    filesName = flieData[0].fileName
                                    filesPath = flieData[0].filePath
                                    dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'

                                } else {
                                    filesName = flieData[0].fileName
                                    filesPath = flieData[0].filePath
                                    dowload = '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>，'
                                    for (var e = 1; e < flieData.length; e++) {
                                        filesName = flieData[e].fileName
                                        filesPath = flieData[e].filePath
                                        dowload += '<a href="javascript:void(0)" id="fliesName" getName="' + filesName + '" style="cursor: pointer;" onclick="openDowload(\'' + filesPath + '\',\'' + filesName + '\')">' + filesName + '</a>'

                                    }
                                }
                            }
                        }
                    }
                });
                return dowload
            }
        }
        ]
    });
    $('#offerRankList').bootstrapTable("load", supplierPrice);
}
//报价最低的供应商添加颜色
function addStyle2(value, row, index) {
    if (parseFloat(value) <= parseFloat(row.minPrice)) {
        return {
            css: {
                "background": '#009100',
                "min-width": "120px",
                "word-wrap": "break-word",
                "word-break": "break-all",
                "white-space": "normal"
            }
        }
    } else {
        return {
            css: {
                "background": '#FFF',
                "min-width": "120px",
                "word-wrap": "break-word",
                "word-break": "break-all",
                "white-space": "normal"
            }
        }
    }

}


//下载附件
function openDowload(path, name) {
    if (name) {
        var url = config.FileHost + "/FileController/download.do" + "?fname=" + name + "&ftpPath=" + path;
        window.location.href = $.parserUrlForToken(url);
    } else {
        var filesName = "清单式竞价报价表.xlsx";
        var url = config.FileHost + "/FileController/download.do" + "?fname=" + filesName + "&ftpPath=" + path;
        window.location.href = $.parserUrlForToken(url);
    }

}