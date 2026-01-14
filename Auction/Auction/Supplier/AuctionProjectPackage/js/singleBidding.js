// 其他页面引入待调整的代码
var excelDownloadUrl = top.config.FileHost + "/FileController/xjjDownload.do";   //下载excel模板接口
var urlSaveAuctionFile = top.config.FileHost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var saveImgUrl = top.config.AuctionHost + "/PurFileController/save.do"; //保存附件
var getImgListUrl = top.config.AuctionHost + "/PurFileController/list.do"; //查看附件
var deleteFileUrl = top.config.AuctionHost + '/PurFileController/delete.do'; //删除已上传文件信息


// 开发代码
var offerUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/singleSave.do' // 上传报价
var backOfferUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/singleUpdate.do' // 撤回报价
var offerListUrl = top.config.AuctionHost + '/AuctionSfcSingleOfferesController/getSinglePageList.do' // 获取报价列表
var tableListData;
var sgesupplierFlieData;
var sgesupplierTechFileData;
var employeeInfo = entryInfo(); //企业信息


var data, packageId = location.hash.substr(1), round_startTime, curStage, auctionTimes;
var detailFile = [],offerFile = [];//报价文件，清单文件
$.ajax({
    url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionDetail.do',
    data: {
        id: packageId
    },
    async: false,
    success: function (res) {
        if (res.success) {
            data = res.data;
            auctionTimes = [data.firstAuctionTime, data.secondAuctionTime, data.thirdAuctionTime];
            curStage = data.stage;
        }
        else layer.alert(res.message);
    }
});

$(function () {
    // 引用util.js文件中的manageEle方法初始化表单容器
    manageEle('#formName');
    initValidator() // 初始化表单验证规则

    getSingleBiddingData() // 获取页面顶部数据
    offerTableview(); // 初始化右侧列表
    getTableList(); // 获取报价列表数据
    initTaxInputEvent() // 初始化税率价格计算组件
    initOfferButtonEvent() // 初始化报价以及撤回报价按钮事件


    countDown(); //倒计时
    if (data.isEnd) {
        layer.msg('当前项目竞标已结束.');
        $('#sendOfferPrice').hide();
        $('#backOfferPrice').hide();
        $('#btn_close').show();
        $('.inputItem').hide();
        $('.fileloading').hide();

        filesDataView('JJ_AUCTION_SGESUPPLIER_OFFER', 'offerlist_operation_tables')
        filesDataView('JJ_AUCTION_SGESUPPLIERTECH_OFFER', 'detaillist_operation_table')

    } else {
        var oFileInput = new FileInput(); //初始化上传组件方法
		var type1 = ['xls', 'xlsx', 'doc', 'docx'];
		var type2 = ['pdf', 'jpg', 'png', 'rar', 'zip'];
        oFileInput.Init("offerList", urlSaveAuctionFile, 'JJ_AUCTION_SGESUPPLIER_OFFER', 'offerlist_operation_tables', false, type1);
        oFileInput.Init("detailedList", urlSaveAuctionFile, 'JJ_AUCTION_SGESUPPLIERTECH_OFFER', 'detaillist_operation_table', false, type2);
    }
})

function entryInfo() {
    var entryData;
    $.ajax({
        type: "post",
        url: top.config.tenderHost + '/getEmployeeInfo.do',  //获取登录人信息,
        async: false,
        success: function (data) {
            if (data.success) {
                entryData = data.data
            }
        },
        error: function () {

        },
    })
    return entryData
}
// 获取包件顶部信息
function getSingleBiddingData() {
    $.ajax({
        url: top.config.AuctionHost + '/AuctionProjectPackageController/findAuctionDetail.do',
        data: {
            id: packageId
        },
        async: false,
        success: function (res) {
            if (res.success) {
                data = res.data;
                console.log(res)
                $('#offerInfo td').each(function (index, item) {
                    switch (index) {
                        case 0:
                            $(this).find('h1').html('单项目竞价');
                            break;
                        case 4:
                            $(this).html(data.auctionOffer.offerCode);
                            break;
                        case 5:
                            $(this).html('按总价最低中选')
                            break;
                        case 6:
                            if (data.noTaxBudgetPrice) {
                                $(this).html(data.noTaxBudgetPrice)
                            } else {
                                $('.notaxprice').removeClass('th_bg');
                                $('.notaxprice').html('');
                            }
                            break;
                        default:
                            $(this).data('field') && $(this).html(data[$(this).data('field')] || '');
                            break;
                    }
                })

                if (data.projectSource > 0) {
                    $('td[data-field="packageName"]').html(data.packageName + '<span class="red">(重新竞价)</span>');
                }
            }
            else layer.alert(res.message);
        }
    });
}
// 获取页面数据
function getTableList() {
    var data = {
        'packageId': packageId
    }
    $.ajax({
        type: "post",
        url: offerListUrl,
        async: false,
        data: data,
        success: function (res) {
            if (res.success) {
                tableListData = res.data;
                $("#detailedsTable").bootstrapTable('load', tableListData);
            }
        }
    });
}

// 初始化初始化税率价格计算组件
function initTaxInputEvent() {
    $('.taxEvent').change(function () {
        var noTax = $("[name='noTaxRateTotalPrice']").val() || 0;
        var tax = $("[name='taxRate']").val() || 0;
        if ($("#formName").data('bootstrapValidator').isValid()) {
            $("[name='taxRateTotalPrice']").val(Math.round(noTax * (1 + (tax / 100)) * 100) / 100)
        } else {
            $("[name='taxRateTotalPrice']").val('')
        }
    });
}

// 初始化页面按钮方法
function initOfferButtonEvent() {

    // 报价按钮提交
    $('#sendOfferPrice').click(function (e) {
        $('#formName').bootstrapValidator('resetForm');
        $('#formName').bootstrapValidator('validate');
        if ($("#formName").data('bootstrapValidator').isValid()) {
            var noTaxPrice = $("[name='noTaxRateTotalPrice']").val();
			if(offerFile.length == 0){
				top.layer.alert('请上传项目清单文件附件！')
				return;
			}
			if(detailFile.length == 0){
				top.layer.alert('请上传报价文件附件！')
				return;
			}
            if(noTaxPrice<=0){
                parent.layer.alert('报价总价(不含税) 不能小于或等于0');
                return false;
            }
            var taxPrice = $("[name='taxRateTotalPrice']").val();
            if(taxPrice<=0){
                parent.layer.alert('报价总价(含税) 不能小于或等于0');
                return false;
            }
			
            if (data.isEnd) {
                layer.alert('报价阶段已结束,不能提交报价.')
                return;
            }
            // if (!sgesupplierTechFileData || !sgesupplierTechFileData.length) {
            //     layer.alert('请在报价前至少上传一个报价文件.')
            //     return;
            // }

            layer.confirm('确认提交?', { icon: 3, title: '询问' }, function (ind) {
                layer.close(ind);
                sendOfferPrice();
            });

        } else {
            invalidNot("#formName")
            return;
        }
    });
    // 撤回已有报价
    $('#backOfferPrice').click(function (e) {
        if (data.isEnd) {
            layer.alert('报价阶段已结束,不能撤回报价.')
            return;
        }
        layer.confirm('确认撤回现有报价?', { icon: 3, title: '询问' }, function (ind) {
            layer.close(ind);
            backOfferPrice();
        });
    });

    $('#btn_close').click(function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    })



}

// 报价
function sendOfferPrice() {
    var noTaxPrice = $("[name='noTaxRateTotalPrice']").val();
    var tax = $("[name='taxRate']").val();
    var taxPrice = $("[name='taxRateTotalPrice']").val();
    var data = {
        'noTaxRateTotalPrice': noTaxPrice,
        'taxRateTotalPrice': taxPrice,
        'taxRate': tax,
        'packageId': packageId
    }
    $.ajax({
        type: "post",
        url: offerUrl,
        async: false,
        data: data,
        success: function (res) {
            if (res.success) {
                parent.layer.alert('新报价提交成功');
                getTableList()
            } else {
                parent.layer.alert(res.message)
            }
            // console.log(res)
        }
    });
}

// 撤回报价
function backOfferPrice() {
    var data = {
        'packageId': packageId
    }
    $.ajax({
        type: "post",
        url: backOfferUrl,
        async: false,
        data: data,
        success: function (res) {
            if (res.success && res.data) {
                parent.layer.alert('已撤销最新报价');
                getTableList()
            } else if (!res.success) {
                parent.layer.alert(res.message)
            } else {
                parent.layer.alert('请先提交报价')
            }
        }
    });
}

// 倒计时
function countDown() {
    if (data.isEnd) return $('#content-left .time-view').html('竞价已结束');
    setTimeout(countDown, 950); //未结束就循环倒计时
    try {
        $.ajax({
            url: top.config.AuctionHost + '/AuctionProjectPackageController/countDown.do',
            async: false,
            beforeSend: function (xhr) {
                var token = $.getToken();
                xhr.setRequestHeader("Token", token);
            },
            data: { packageId: packageId },
            beforeSend: function (xhr) {
                var token = $.getToken();
                xhr.setRequestHeader("Token", token);
            },
            success: function (res) {
                if (!res.success) return;
                if (!res.data.stage) return location.reload(); //竞价结束
                if (res.data.stage != curStage) {
                    curStage = res.data.stage;
                    if (data.auctionType > 1) {
                        return location.reload();
                    }
                }

                $('#content-left .time-view').html('倒计时 : ' + '单项目报价时间剩余' +
                    '<span style="margin-left:20px">' + res.data.minute + '</span>分<span>' + res.data.second + '</span>秒');
            }
        });
    } catch (e) { }
}

//  右侧报价历史数据列表
function offerTableview() {
    $('#content-right').append(['<div class="no-padding">',
        '<table id="detailedsTable" class="table table-bordered"></table>',
        '</div>'
    ].join(''));

    $('#detailedsTable').bootstrapTable({
        pagination: false,
        undefinedText: "",
        height: '400',
        columns: [
            {
                field: "noTaxRateTotalPrice",
                title: "报价总价(不含税)",
                align: "center",
                halign: "center",
            },
            {
                field: "taxRate",
                title: "税率(%)",
                align: "center",
                halign: "center",
            },
            {
                field: "taxRateTotalPrice",
                title: "报价总价(含税)",
                align: "center",
                halign: "center",
            },
            {
                field: "sfcOfferStatus",
                title: "状态",
                align: "center",
                halign: "center",
                formatter: function (value, row, index) {
                    if (value == 1) {
                        return '<span style="color:green">最新报价</span>'
                    } else if (value == 3) {
                        return '<span style="color:red">已撤销</span>'
                    }
                }
            },
            {
                field: "offerTime",
                title: "报价/撤回时间",
                align: "center",
                halign: "center",
                formatter: function (value, row, index) {
                    if (row.sfcOfferStatus == 1) {
                        return row.offerTime
                    } else if (row.sfcOfferStatus == 3) {
                        return row.cancelTime
                    }
                }
            },
        ]
    });
}
// 测试下载(已弃用)
function excelDownload() {
    console.log(123)
    var newUrl = excelDownloadUrl + "?fname=清单式竞价模板&filePath=AuctionQdjyTemplate.xlsx";
    console.log(newUrl)
    console.log($.parserUrlForToken(newUrl))
    window.location.href = $.parserUrlForToken(newUrl);
}

//上传附件
function FileInput() {
    var oFile = new Object();
    //初始化fileinput控件（第一次初始化）

    oFile.Init = function (FileName, uploadUrl, filetype, filetable, flag, limit) {
        // filesDataView(filetype, filetable)
        $("#" + FileName).fileinput({
            language: 'zh', //设置语言
            uploadUrl: uploadUrl, //上传的地址
            uploadAsync: false,
            autoReplace: false,
            allowedFileExtensions: limit, //接收的文件后缀
            showUpload: false, //是否显示上传按钮
            showCaption: false, //是否显示标题
            //showCaption: false, //是否显示标题
            browseClass: "btn btn-primary", //按钮样式
            dropZoneEnabled: false, //是否显示拖拽区域
            maxFileCount: 1,
            //			maxFileCount: flag?1:0, //表示允许同时上传的最大文件个数
            showPreview: false,
            showRemove: false,
            layoutTemplates: {
                actionDelete: "",
                actionUpload: ""
            }

        }).on("filebatchselected", function (event, files) {
            if (data.isEnd) {
                layer.alert('报价阶段已结束,不能上传文件.')
                $(this).fileinput("reset"); //选择的格式错误 插件重置
                return;
            }
            if (event.currentTarget.files.length > 1) {
                parent.layer.alert('单次上传文件数只能为1个');
                $(this).fileinput("reset"); //选择的格式错误 插件重置
                return;
            }
            if (event.currentTarget.files[0].size > 2 * 1024 * 1024 * 1024 * 1024) {
                parent.layer.alert('上传的文件不能大于2G');
                $(this).fileinput("reset"); //选择的格式错误 插件重置
                return;
            };
			var fileDir = $("#" + FileName).val();
			var suffix = fileDir.substr(fileDir.lastIndexOf('.'));
			var type1 = ['.xls', '.xlsx', '.doc', '.docx', '.XLS', '.XLSX', '.DOC', '.DOCX'];
			var type2 = ['.PDF', '.JPG', '.PNG', 'RAR', '.ZIP', '.pdf', '.jpg', '.png', '.rar', '.zip'];
			if((FileName =="offerList" &&  $.inArray(suffix, type1) == -1) || (FileName =="detailedList" &&  $.inArray(suffix, type2) == -1)){
				parent.layer.alert("请上传"+limit+"类型文件");
				$(this).fileinput("reset"); //选择的格式错误 插件重置
				return;
			}
            $(this).fileinput("upload");
        }).on("filebatchuploadsuccess", function (event, data, previewId, index) {
            $.ajax({
                type: "post",
                url: saveImgUrl,
                async: false,
                data: {
                    'modelId': packageId,
                    'modelName': filetype,
                    'employeeId': employeeInfo.id,
                    'fileName': data.files[0].name,
                    'fileSize': data.files[0].size / 1000 + "KB",
                    'filePath': data.response.data[0]
                },
                datatype: 'json',
                success: function (data) {
                    if (data.success == true) {
                        filesDataView(filetype, filetable);
                    }
                }
            });
        }).on('filebatchuploaderror', function (event, data, msg) {
            parent.layer.msg("失败");
        }).on("filebatchselected", function (event, data) {
            
        });
        filesDataView(filetype, filetable);

    }
    return oFile;
};

function filesDataView(modelName, viewTableId) {
    var tr = ""
    var file = "";
    $.ajax({
        type: "get",
        url: getImgListUrl,
        async: false,
        data: {
            'modelId': packageId,
            'employeeId': employeeInfo.id,
            'modelName': modelName
        },
        datatype: 'json',
        success: function (data) {

            let flieData = data.data;
            if (modelName == 'JJ_AUCTION_SGESUPPLIER_OFFER') {
                sgesupplierFlieData = flieData;
            } else if (modelName == 'JJ_AUCTION_SGESUPPLIERTECH_OFFER') {
                sgesupplierTechFileData = flieData;
            }
            if (data.success == true) {
                filesData = flieData;
				if(viewTableId == 'offerlist_operation_tables'){
					offerFile = flieData;//清单文件
				}else if(viewTableId == 'detaillist_operation_table'){
					detailFile = flieData;//报价文件
				}
            }
        }
    });
    if (filesData.length > 7) {
        var height = '304'
    } else {
        var height = ''
    }
    $('#' + viewTableId).bootstrapTable({
        pagination: false,
        undefinedText: "",
        height: height,
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
            width: '100px',

        },
        {
            field: "#",
            title: "操作",
            halign: "center",
            width: '120px',
            align: "center",
            events: {
                'click .openAccessory': function (e, value, row, index) {
                    var url = config.FileHost + "/FileController/download.do" + "?fname=" + row.fileName + "&ftpPath=" + row.filePath;
                    window.location.href = $.parserUrlForToken(url);
                }
            },
            formatter: function (value, row, index) {
                var html = '';
                html += '<button  class="btn btn-sm btn-primary openAccessory">下载</button>'

                if (!data.isEnd) {
                    html += '<button type="button"  class="btn btn-sm btn-danger" onclick=fileDetel(' + index + ',\"' + row.id + '\",\"' + row.modelName + '\")>删除</button>'
                }
                return html;
            }
        },
        ]
    });
    $('#' + viewTableId).bootstrapTable("load", filesData);
};

function fileDetel(i, uid, modelName) {
    if (data.isEnd) {
        if (data.isEnd) {
            layer.alert('报价阶段已结束,不能删除报价.')
            return;
        }
    }
    parent.layer.confirm('确定要删除该附件', {
        btn: ['是', '否'] //可以无限个按钮
    }, function (index, layero) {
        if (uid.length == 32) {
            $.ajax({
                type: "post",
                url: deleteFileUrl,
                async: false,
                dataType: 'json',
                data: {
                    "id": uid,
                },
                success: function (data) { }
            });
        }
        /*filesDataView();*/

        if (modelName == 'JJ_AUCTION_SGESUPPLIER_OFFER') {
            filesDataView('JJ_AUCTION_SGESUPPLIER_OFFER', 'offerlist_operation_tables');
        } else if (modelName == 'JJ_AUCTION_SGESUPPLIERTECH_OFFER') {
            filesDataView('JJ_AUCTION_SGESUPPLIERTECH_OFFER', 'detaillist_operation_table');
        }

        parent.layer.close(index);
    }, function (index) {
        parent.layer.close(index)
    });

}

// 初始化表单验证相关代码
function initValidator() {
    $('#formName').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            'noTaxRateTotalPrice': {
                validators: {
                    notEmpty: {
                        message: '报价总价(不含税)不能为空'
                    },
                    stringLength: {
                        max: 20,
                        message: '报价总价(不含税)的长度不能超过20位(包含小数) '
                    },
                    regexp: {
                        regexp: '^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,2})?$',
                        message: '请输入最多保留两位小数的正整数'
                    },
                }
            },
            'taxRate': {
                validators: {
                    notEmpty: {
                        message: '税率(%)不能为空'
                    },
                    stringLength: {
                        max: 20,
                        message: '税率(%)的长度不能超过20位(包含小数) '
                    },
                    regexp: {
                        regexp: '^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,2})?$',
                        message: '请输入最多保留两位小数的正整数'
                    },
                }
            }
        }
    })
}