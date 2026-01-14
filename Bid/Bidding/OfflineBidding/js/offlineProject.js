var urlFindPageList = config.offlineHost + '/OfflineMandateContractController/findPageList';
// var viewpackage = 'bidPrice/AppointManager/appointInfo.html';
// var viewBiddingPackage = 'Bidding/AppointManager/appointInfo.html';
// var detailBiddingPackage = 'Bidding/AppointManager/appointInfoDetail.html';
var newContracPackage = 'Bidding/OfflineBidding/model/newContrac.html'; //添加合同委托页面
var contracViewPackage = 'Bidding/OfflineBidding/model/contracView.html'; //查看合同委托页面
var delUrl = config.offlineHost + '/OfflineMandateContractController/deleteById';  //列表接口


//表格初始化
$(function () {
    initTable();
});
//设置查询条件
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1,//当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量
        'contractName': $("#contractName").val(),
        'tendererEnterprisName': $("#tendererEnterprisName").val(),
        'dataTenderType': top.TENDERTYPE
    }
};
// 搜索按钮触发事件
$("#btnSearch").click(function () {
    $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});

// 添加合同按钮触发事件
$("#btnNewContrac").click(function () {
    openEdit()
});
//编辑
$("#table").on("click", ".btnEdit", function () {
    var index = $(this).attr("data-index");
    openEdit(index);
    console.log(index)
});
//查看
$("#table").on("click", ".btnView", function () {
    var index = $(this).attr("data-index");
    openView(index);
    console.log(index)
});
//删除文件
$("#table").on("click", ".btnDel", function () {
    var index = $(this).attr("data-index");
    var rowData = $('#table').bootstrapTable('getData')[index];
    parent.layer.confirm('确定删除该合同委托?', {
        icon: 3,
        title: '询问'
    }, function (index) {
        parent.layer.close(index);
        $.ajax({
            url: delUrl,
            type: "post",
            data: {
                id: rowData.id
            },
            success: function (data) {
                if (data.success == false) {
                    parent.layer.alert(data.message);
                    return;
                }
                parent.layer.alert("删除成功", {
                    icon: 1,
                    title: '提示'
                });
                $("#table").bootstrapTable("refresh");
            },
            error: function (data) {
                parent.layer.alert("加载失败", {
                    icon: 2,
                    title: '提示'
                });
            }
        });
    });
});

function openEdit(index) {
    var rowData = '';
    var url = newContracPackage;
    var title = '添加委托合同';
    if (index != '' && index != undefined) {
        rowData = $('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
        url += "?id=" + rowData.id;
        title = "修改委托合同";
    }
    parent.layer.open({
        type: 2,  //此处以iframe举例
        title: title,
        area: ['1200px', '650px'],
        maxmin: true,//开启最大化最小化按钮
        content: url,
        //  success: function (layero, index) {
        //     var iframeWind = layero.find('iframe')[0].contentWindow;
        // }
    });
};
function openView(index) {
    var rowData = '';
    var url = contracViewPackage;
    var title = '';
    if (index != '' && index != undefined) {
        rowData = $('#table').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
        url += "?id=" + rowData.id;
        title = "查看委托合同";
    } else {
        parent.layer.alert('温馨提示，无法查看该数据,请检查所选数据是否正确');
        return false
    }
    parent.layer.open({
        type: 2,  //此处以iframe举例
        title: title,
        area: ['1200px', '650px'],
        maxmin: true,//开启最大化最小化按钮
        content: url,
        success: function (layero, index) {
            var iframeWin = layero.find('iframe')[0].contentWindow;
        }
    });
};


function initTable() {
    $('#table').bootstrapTable({
        url: urlFindPageList,// 请求url		
        method: 'POST', // 向服务器请求方式
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 15, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [10, 15, 20, 25],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        toolbar: '#toolbar', // 工具栏ID
        toolbarAlign: 'left', // 工具栏对齐方式
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onCheck: function (row) {
            id = row.id;
            projectId = row.peojectId;
        },
        columns: [{
            field: 'xh',
            title: '序号',
            align: 'center',
            width: '50px',
            formatter: function (value, row, index) {
                var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index + 1;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
        }, {
            field: 'contractName',
            title: '委托合同名称',
            align: 'left',
            cellStyle: {
                css: widthName
            }
        }, {
            field: 'tendererEnterprisName',
            title: '招标人名称',
            cellStyle: {
                css: widthName
            }
        },
        {
            field: 'contractState',
            title: '合同状态',
            align: 'center',
            cellStyle: {
                css: widthState
            },
            formatter: function (value, row, index) {
                //合同状态 0为临时保存，1为提交审核，2为审核通过，3为审核未通过
                var state = {
                    '0': '临时保存',
                    '1': '提交审核',
                    '2': '审核通过',
                    '3': '审核未通过',
                }
                var stateColor = {
                    '0': 'red',
                    '1': 'black',
                    '2': 'green',
                    '3': 'red',
                }
                if (stateColor[value] != undefined && state[value] != undefined) {
                    return "<span style='color:" + stateColor[value] + ";'>" + state[value] + "</span>";
                } else {
                    return "未编辑";
                }
            }

        }, {
            field: 'createTime',
            title: '创建时间',
            align: 'center',
            cellStyle: {
                css: widthState
            },

        },
        {
            field: 'appointState',
            title: '操作',
            align: 'center',
            width: '220',
            cellStyle: {
                css: { 'white-space': 'nowrap' }
            },
            formatter: function (value, row, index) {
                var Tdr = "";
                if (row.contractState != 1 && row.contractState != 2) {
                    Tdr += '<button  type="button" class="btn btn-primary btn-sm btnEdit" data-index="' + index + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
                }
                Tdr += '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="' + index + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
                if (row.contractState != 1 && row.contractState != 2) {
                    Tdr += '<button  type="button" class="btn btn-danger btn-sm btnDel" data-index="' + index + '"><span class="glyphicon glyphicon-remove"></span>删除</button>';
                }
                return Tdr
            }
        }
        ],
    })
};

// function appointBtn($index) {
//     var rowData = $('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
//     var tenderType = rowData[$index].tenderType;
//     var htmlUrl = null;
//     if (tenderType == '4') {
//         htmlUrl = viewBiddingPackage;
//     } else {
//         htmlUrl = viewpackage;
//     }
//     parent.layer.open({
//         type: 2 //此处以iframe举例
//         , title: '查看公告'
//         , area: ['1100px', '650px']
//         , maxmin: true//开启最大化最小化按钮
//         , content: htmlUrl + '?projectId=' + rowData[$index].projectId + '&id=' + rowData[$index].id
//         , success: function (layero, index) {
//             var iframeWind = layero.find('iframe')[0].contentWindow;
//         }
//     });
// }

// function appointDetailBtn($index) {
//     var rowData = $('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
//     parent.layer.open({
//         type: 2 //此处以iframe举例
//         , title: '查看公告'
//         , area: ['1100px', '650px']
//         , maxmin: true//开启最大化最小化按钮
//         , content: detailBiddingPackage + '?projectId=' + rowData[$index].projectId + '&id=' + rowData[$index].id
//         , success: function (layero, index) {
//             var iframeWind = layero.find('iframe')[0].contentWindow;
//         }
//     });
// }


