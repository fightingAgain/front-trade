var urlBidResultList = top.config.AuctionHost + '/ProjectPushToDF/page.do';//推送列表接口
var pushHtml = 'bidPrice/DataPush/SelfProcurement/modal/dataPushInfo.html';
var dataPushPublic = 'bidPrice/DataPush/SelfProcurement/modal/dataPushPublic.html';
var publicPushHtml = 'bidPrice/DataPush/SelfProcurement/modal/pushPublic.html';//招标、询比推送页面
//设置查询条件
$(function () {
    $('#dataType').val(0);
    initTable();
    //查询按钮
    $("#btnQuery").click(function () {
        $('#table').bootstrapTable('destroy'); // 很重要的一步，刷新url！	
        initTable()
    });
    //两个下拉框事件
    $("#tenderType, #dataType").change(function () {
        $('#table').bootstrapTable('destroy'); // 很重要的一步，刷新url！	
        initTable()
    });
})

function getQueryParams(params) {
    var QueryParams = {
        pageSize: params.limit, //每页显示的数据条数
        pageNumber: (params.offset / params.limit) + 1, //页码
        offset: params.offset, // SQL语句偏移量
        projectName: $("#projectName").val(), //采购项目名称
        projectCode: $("#projectCode").val(), //采购醒目编号	
        // packageName: $("#packageName").val(),
        tenderType: $("#tenderType").val(), //0为询比采购，1为竞价采购，2为竞卖
        purchaserName: $("#purchaserName").val(), //0为询比采购，1为竞价采购，2为竞卖
        dataType: $("#dataType").val(), //0为询比采购，1为竞价采购，2为竞卖
    };
    return QueryParams;
}
function initTable() {
    $("#table").bootstrapTable({
        url: urlBidResultList,
        dataType: 'json',
        method: 'get',
        locale: "zh-CN",
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 15, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [10, 15, 20, 25],
        clickToSelect: true, //是否启用点击选中行
        sidePagination: 'server', // 服务端分页
        silent: true, // 必须设置刷新事件
        toolbar: '#toolbar', // 工具栏ID
        classes: 'table table-bordered', // Class样式
        queryParams: getQueryParams, //查询条件参数
        striped: true,
        uniqueId: "packageId",
        height: top.tableHeight,
        onLoadSuccess: function (data) {
            parent.layer.closeAll("loading");
            if (!data.success) {
                parent.layer.alert(data.message);
            };
        },
        columns: [{
            field: 'xh',
            title: '序号',
            align: 'center',
            width: '50px',
            formatter: function (value, row, index) {
                var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
        },
        {
            field: 'projectCode',
            title: '采购项目编号',
            align: 'left',
            width: '180'
        },
        {
            field: 'projectName',
            title: '采购项目名称',
            align: 'left',
            width: '300',
            formatter: function (value, row, index) {
                if (row.projectSource == 1) {
                    var projectName = row.projectName + '<span class="text-danger" style="font-weight:bold">(重新采购)</span>'
                } else {
                    var projectName = row.projectName
                }
                return projectName
            }
        },
        {
            field: 'purchaserName',
            title: '采购人名称',
            align: 'left',
            width: '200'
        },
        {
            field: 'packageNum',
            title: '标段/包件编号',
            align: 'left',
            width: '180'
        },
        {
            field: 'packageName',
            title: '标段/包件名称',
            align: 'left',
            width: '300',
            formatter: function (value, row, index) {
                if (row.packageSource == 1) {
                    return value + '<span class="text-danger">(重新采购)</span>';
                } else {
                    return value;
                }

            }
        },
        {
            field: 'dataType',
            title: '推送状态',
            align: 'center',
            width: '80',
            formatter: function (value, row, index) {
                if (value == 0) {
                    return '未推送'
                } else if (value == 1) {
                    return '<span style="color:green;">已推送</span>'
                }
            }
        },
        {
            field: 'submitNum',
            title: '成功推送次数',
            align: 'center',
            width: '100'
        },
        {
            field: 'subDate',
            title: '最新推送时间',
            align: 'center',
            width: '150'
        },
        {
            field: 'action',
            title: '操作',
            align: 'left',
            width: '200',
            events: {
                'click .btnPush': function (e, value, row, index) {
                    type = $(this).data('type');
                    var cont = pushHtml;
                    if (row.tenderType == 4 || row.tenderType == 0 || row.tenderType == 6) {
                        cont = publicPushHtml;
                    }
                    top.layer.open({
                        type: 2,
                        title: '数据推送',
                        area: ['100%', '100%'],
                        content: cont + '?packageId=' + row.packageId + '&id=' + row.id + '&projectId=' + row.projectId + '&organNo=' + row.organNo + '&type=' + type + '&tenderType=' + row.tenderType + '&processType=' + row.processType,
                        success: function (layero, index) {
                            var iframeWin = layero.find('iframe')[0].contentWindow;
                            if (row.tenderType == 4 || row.tenderType == 0 || row.tenderType == 6) {
                                iframeWin.passMessage(function () {
                                    $('#table').bootstrapTable('destroy'); // 很重要的一步，刷新url！
                                    initTable()
                                });  //调用子窗口方法，传参
                            }

                        }
                    });
                },
                'click .btnSend': function (e, value, row, index) {
                    type = $(this).data('type')
                    layer.open({
                        type: 2,
                        title: "异常推送",
                        area: ['100%', '100%'],
                        content: "bidPrice/DataPush/SelfProcurement/modal/pushAbnormalPublic.html?bidSectionId=" + row.packageId + "&projectId=" + row.projectId + '&tenderType=' + row.tenderType + '&processType=' + row.processType,
                        success: function (layero, index) {
                            var iframeWin = layero.find('iframe')[0].contentWindow;
                            iframeWin.passMessage(function () {
                                $('#table').bootstrapTable('destroy'); // 很重要的一步，刷新url！
                                initTable()
                            });  //调用子窗口方法，传参
                        }
                    });
                },
                'click .btnHistory': function (e, value, row, index) {//历史记录
                    type = $(this).data('type')
                    layer.open({
                        type: 2,
                        title: "历史记录",
                        area: ['1000px', '600px'],
                        content: "bidPrice/DataPush/SelfProcurement/modal/pushHistory.html?id=" + row.id + '&tenderType=' + row.tenderType + '&processType=' + row.processType,
                        success: function (layero, index) {
                            var iframeWin = layero.find('iframe')[0].contentWindow;
                            // iframeWin.passMessage(rowData);  //调用子窗口方法，传参
                        }
                    });
                },
            },
            formatter: function (value, row, index) {
                var strPush = "<button class='btn btn-primary btn-xs btnPush' data-type='edit'><span class='glyphicon glyphicon-eye-open'>数据推送</button>";
                var strSend = "<button class='btn btnSend btn-primary btn-xs' data-type='edit'><span class='glyphicon glyphicon-eye-open'>异常推送</button>";
                var strHistory = "<button class='btn btnHistory btn-primary btn-xs'>历史记录</button>";
                var str = ''
                str += strPush
                str += strHistory
                return str
            }
        }

        ]
    });
}