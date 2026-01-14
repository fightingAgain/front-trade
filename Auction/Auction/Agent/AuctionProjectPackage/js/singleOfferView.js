//竞价项目
var urlViewAuctionInfo = top.config.AuctionHost + "/AuctionProjectPackageController/viewAuction.do";
//查看报价
var urlViewAuctionInterval = top.config.AuctionHost + "/AuctionProjectPackageController/findOfferItems.do";
// 查看倒计时
var urlCountDown = top.config.AuctionHost + "/AuctionProjectPackageController/countDown.do";
//变更竞价截止时间
var urlchangeEndTime = top.config.AuctionHost + "/AuctionProjectPackageController/changeEndTime.do";
//修改包件设置
var urlAuctionSetting = top.config.AuctionHost + "/AuctionProjectPackageController/updatePackageSetting.do";
// 单项目竞价页面获取家数
var getAuctionOfferesCountUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getAuctionOfferesCount' //获取报价家数
var publicTypeUrl = top.config.AuctionHost + "/AuctionSfcSingleOfferesController/getAuctionPurchase.do"
var inviteOffersUrl = top.config.AuctionHost + "/AuctionSfcSingleOfferesController/getInviteOffers.do"

var isPublic = false;
var countNum = 0;

var projectId = location.search.getQueryString("projectId"); //项目id
var packageId = location.search.getQueryString("id"); //包件id
var createType = location.search.getQueryString("createType") || 0;
var rowresult = JSON.parse(sessionStorage.getItem("rowList"));
var packageData, curStage, detailedCount;

$(function () {
    //项目基础信息	
    auctionInfo();
    // getPublicType();
    if (createType == 1) {
        //非本人创建项目
        $(".myView").hide();
    } else {
        $(".otherView").hide();
    }
})
// 查看是否为邀请类型
// function getPublicType() {
//     $.ajax({
//         url: publicTypeUrl,
//         type: "post",
//         data: {
//             packageId: packageId,
//         },
//         success: function (res) {
//             if (res.success) {
//                 if (res.data.isPublic == '2') {
//                     isPublic = true;
//                     getInviteOffers();
//                 }
//             }
//         }
//     })
// }
// 邀请类型则获取供应商相关讯息
function getInviteOffers() {
    $.ajax({
        url: inviteOffersUrl,
        type: "post",
        data: {
            packageId: packageId,
        },
        beforeSend: function (xhr) {
            var token = $.getToken();
            xhr.setRequestHeader("Token", token);
        },
        success: function (res) {
            if (res.success) {
                $('.leftTab').bootstrapTable('load', res.data);
            }
        }
    })
}
//竞价信息
function auctionInfo() {
    $.ajax({
        url: urlViewAuctionInfo,
        type: "post",
        data: {
            packageId: packageId,
            state: 0,
            tenderType: 1,
        },
        success: function (res) {
            if (res.success) {
                packageData = res.data;

                if (packageData.isEnd) {
                    parent.layer.alert("该竞标已结束", { title: '提示' })
                    window.parent.$('#OfferList').bootstrapTable('refresh');
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    return
                    // jumpSingleOfferHistory(
                }

                curStage = packageData.stage;
                $("#offerInfo [data-field]").each(function () {
                    if ($(this).data('field') == 'packageName') {
						if (packageData.projectSource > 0) {
							$(this).html(packageData[$(this).data('field')] + '<span class="red">(重新竞价)</span>');
						} else {
							$(this).html(packageData[$(this).data('field')]);
						}
					} else {
                        $(this).html(packageData[$(this).data('field')])
                    } 
                });
                $("#offerInfo h1").html('单项目竞价');
                $("#offerInfo .noTaxBudgetPrice").html(packageData.noTaxBudgetPrice);
                $('#offerInfo input[type=radio]').filter(function () {
                    return this.value == packageData.isShowName;
                }).attr('checked', 'checked');
                $('#StageEndTime').datetimepicker({
                    step: 5,
                    lang: 'ch',
                    format: 'Y-m-d H:i:s',
                    minDate: new Date(packageData.curStageEndTime),
                    value: GMTToStr(new Date(packageData.curStageEndTime))
                });
                $("#offerDetail").append(['<div class="col-md-12 no-padding">',
                    '<table class="table table-bordered leftTab"></table>',
                    '</div>'
                ].join(''));
                var column_left
                column_left = [{
                    field: 'supplierEnterpriseName',
                    title: '供应商名称',
                    align: "center",

                    // formatter: function (value, row, index) {
                    //     return '第' + sectionToChinese(index + 1) + '轮报价';
                    // }
                },
                {
                    field: 'offerTime',
                    title: '报价时间',
                    align: "center",
                    formatter: function (value, row, index) {
                        if (value) {
                            return value;
                        } else {
                            return '暂未报价'
                        }
                    }
                }]
            }
            //初始化tab
            column_left && $('.leftTab').bootstrapTable({
                columns: column_left,
                data: packageData.details || packageData.offerlogs,
                uniqueId: 'id',
                height: 300,
                onClickRow: function (row, elem) {
                    // $('.selected').removeClass('selected');
                    // $(elem).addClass('selected');
                    // if (packageData.auctionModel == 1) { //明细
                    //     detailedCount = Number(row.detailedCount);
                    //     loadOfferLog(row.offerItems);
                    //     //							$('.rightTab').bootstrapTable("load", row.offerItems);
                    // } else { //多轮
                    //     loadOfferLog(packageData.offerlogs[$(elem).index()].offerLog || []);
                    // }
                }
            })
            $('.countDown').append('倒计时 : <label class="timeInval"></label>');
            // $('.rightTab').bootstrapTable({
            //     data: packageData.auctionModel == 0 ? packageData.offerlogs : [],
            //     height: 500,
            //     columns: column_right || [{
            //         title: '序号',
            //         width: '50px',
            //         formatter: getIndex
            //     }, {
            //         field: 'enterpriseName',
            //         title: '竞买人',
            //         align: 'left'
            //     }, {
            //         field: 'offerMoney',
            //         title: '报价（元）',
            //         align: "right"
            //     }, {
            //         field: 'subDate',
            //         title: '报价时间'
            //     }]
            // });
            // 开启倒计时
            getAuctionOfferesCount()
            getInviteOffers();
            countDown();
        }
    })
}

//倒计时
function countDown() {
    setTimeout(countDown, 950); //未结束就循环倒计时
    try {
        $.ajax({
            url: top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
            data: {
                packageId: packageId
            },
            beforeSend: function (xhr) {
                var token = $.getToken();
                xhr.setRequestHeader("Token", token);
            },
            success: function (res) {
                if (!res.success) return;
                if (!res.data.stage) {
                    parent.layer.alert("该竞标已结束", { title: '提示' })
                    window.parent.$('#OfferList').bootstrapTable('refresh');
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    return
                }
                // return jumpSingleOfferHistory(); //竞价结束
                if (res.data.stage != curStage) {
                    curStage = packageData.stage = res.data.stage;
                    if (packageData.auctionType == 4 || (packageData.auctionType > 1 && packageData.outType == 1)) {
                        return location.reload();
                    }
                }
                $('#offerDetail .timeInval').html('<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
                if (packageData.auctionType == '7') {
                    countNum++;
                    if (countNum % 5 == 0) {
                        getAuctionOfferesCount()
                        getInviteOffers();
                    }
                } else {
                    $('.notEliminatedCount').html(res.data.notEliminatedCount || 0);
                }
            }
        });
    } catch (e) { }
}


function getAuctionOfferesCount() {
    var url = getAuctionOfferesCountUrl;
    $.ajax({
        type: "post",
        url: url,
        beforeSend: function (xhr) {
            var token = $.getToken();
            xhr.setRequestHeader("Token", token);
        },
        data: {
            packageId: packageId,
            projectId: projectId
        },
        success: function (res) {
            $('.notEliminatedCount').html(res.data.offerCount || 0);

        }
    });
}

//轮询刷新记录
function refreshLog() {
    $.ajax({
        url: urlViewAuctionInterval,
        async: false,
        data: {
            packageId: packageId,
            auctionModel: packageData.auctionModel
        },
        beforeSend: function (xhr) {
            var token = $.getToken();
            xhr.setRequestHeader("Token", token);
        },
        success: function (res) {
            if (!res.success || !res.data) return;
            switch (packageData.auctionModel) {
                case 0: //包件
                    packageData.offerlogs = res.data[packageId].offerLog;
                    var packageRank = res.data[packageId].supplierRank;
                    packageData.offerlogs = packageData.offerlogs.sort(function (a, b) {
                        return Number(a.offerMoney) > Number(b.offerMoney) ? 1 : -1
                    });
                    //						$('.rightTab').bootstrapTable("load", packageData.offerlogs);
                    $('.minPrice').html(packageRank[0] && packageRank[0].offerMoney || '暂无');
                    //$('.minEnterprise').html(packageRank[0] && packageRank[0].enterpriseName || '暂无');
                    break;
                case 1: //明细
                    for (var i = 0; i < packageData.details.length; i++) {
                        var detail_info = res.data[packageData.details[i].id],
                            row = $('.leftTab').bootstrapTable('getRowByUniqueId', packageData.details[i].id),
                            elemTr = $('.leftTab tbody tr').eq(row.index);
                        if (detail_info.supplierRank.length) {
                            elemTr.find('td').eq(5).html(detail_info.supplierRank[0].offerMoney);
                            elemTr.find('td').eq(6).html(detail_info.supplierRank[0].enterpriseName);
                        }
                        row.offerItems = detail_info.offerLog;
                        if (elemTr.hasClass('selected')) loadOfferLog(row.offerItems);
                    }
                    //				if(!$('.selected-tr').length) $('.leftTab tbody tr[data-index=0]').click();
                    // 				else $('.selected-tr').click();
                    break;
                default: //多轮
                    var curRound = (curStage - 1) / 2 - 1,
                        elemTr = $('.leftTab tbody tr').eq(curRound);
                    if (res.data && res.data.supplierRank.length) {
                        //							elemTr.find('td').eq(1).html(res.data.supplierRank[0].enterpriseName);
                        elemTr.find('td').eq(3).html(res.data.supplierRank[0].offerMoney);
                    }
                    packageData.offerlogs[curRound].offerLog = res.data.offerLog;
                    if (elemTr.hasClass('selected')) loadOfferLog(res.data.offerLog);
                    break;
            }
            setTimeout(refreshLog, 5000);
        }
    });
}

//设置截止时间 or 设置是否显示竞买人
$(".changeEndTime").click(function () {
    if ($('#StageEndTime').val() == "") {
        parent.layer.alert('请选择竞价截止时间')
        return
    }

    var pare = {
        'packageId': packageId,
        'projectId': projectId,
        'tenderType': 1,
        'supplierCountConfig': 0,
        'auctionEndTime': $("#StageEndTime").val(),
        'reason': '变更竞价截止时间'
    }

    top.layer.confirm('确认修改竞价截止时间？', {
        btn: ['确认', '取消'] //按钮
    }, function (index) {
        $.ajax({
            url: top.config.AuctionHost + "/AuctionPackageConfigController/insertPackageConfig.do",
            data: pare,
            type: "post",
            success: function (res) {
                top.layer.close(index);
                if (res.success) {
                    top.layer.alert("修改成功");
                } else {
                    top.layer.alert("修改失败：" + res.message);
                }
            }
        })
    });


    // var pare = {
    //     'packageId': packageId,
    //     'projectId': projectId,
    //     'tenderType': 1,
    //     'supplierCountConfig': $('input[name="supplierCountConfig"]:checked').val()

    // }
    // if ($('input[name="supplierCountConfig"]:checked').val() == 0) {
    //     pare.auctionEndTime = $("#auctionEndTime").val()
    // }
    // $.ajax({
    //     url: top.config.AuctionHost + "/AuctionPackageConfigController/insertPackageConfig.do",
    //     type: "post",
    //     data: pare,
    //     success: function (res) {
    //         if (res.success) {
    //             parent.$('#OfferList').bootstrapTable('refresh');
    //             var index = parent.layer.getFrameIndex(window.name);
    //             top.layer.close(index);

    //         }
    //     }
    // });
})




// $("#offerInfo button").click(function () {
//     var msgarr = ['修改竞价截止时间', '显示竞买者', '隐藏竞买者'],
//         isShowName = $("#offerInfo input[name='showEnterpriseName']:checked").val(),
//         opera = $(this).data('event') == 'changeEndTime' ? 0 : (isShowName == 0 ? 1 : 2);
//     top.layer.confirm('确认' + msgarr[opera] + '？', {
//         btn: ['确认', '取消'] //按钮
//     }, function (index) {
//         var obj = {
//             id: packageId
//         };
//         !opera ? (obj.endTime = $("#offerInfo input[type='text']").val()) : (obj.isShowName = isShowName);
//         $.ajax({
//             url: !opera ? urlchangeEndTime : urlAuctionSetting,
//             data: obj,
//             success: function (res) {
//                 top.layer.close(index);
//                 if (res.success) {
//                     top.layer.msg("修改成功");
//                 } else {
//                     top.layer.alert("修改失败：" + res.message);
//                 }
//             }
//         })
//     });
// })

function loadOfferLog(datas) {
    //	$('.rightTab').bootstrapTable("load", datas);
}

function getIndex(value, row, index) {
    return index + 1;
}

function jumpToDetail() {
    location.href = $.parserUrlForToken("detailListMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}
// 跳转到单项目竞价历史页面
function jumpSingleOfferHistory() {
    location.href = $.parserUrlForToken("singleBidHistory.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}

function jumpToDetaillist() {
    location.href = $.parserUrlForToken("detailListHistoryMsg.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}

//跳转历史页面
function jumpToHistory() {
    sessionStorage.setItem("auctionresult", JSON.stringify(rowresult));
    location.href = $.parserUrlForToken("OfferHistoryInfo.html?projectId=" + projectId + "&id=" + packageId + "&tType=" + "1");
}