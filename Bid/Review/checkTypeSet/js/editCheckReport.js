/**
*  zhouyan 
*  2019-10-24
*  评标报告列表
*  调整评标办法的评标报告
*/

var getUrl = config.Reviewhost + '/CheckTypeInfoController/findCheckReportSet'; //获取评标报告配置
var delUrl = config.Reviewhost + '/CheckTypeInfoController/deleteCheckReportSet'; //删除评标报告配置
var editHtml =  'Review/checkTypeSet/model/addReportSet.html';//编辑评标办法
var checkTypeInfoId;
$(function(){
    checkTypeInfoId = $.getUrlParam('checkTypeInfoId');//评标报告编号
    getUrl += "?checkTypeInfoId="+checkTypeInfoId;
    showData();

    $('body').on('click','#btnAdd',function(){
        openAdd();
    });
});

function getTendereeList(){
    $.ajax({
        type:"post",
        url:getUrl,
        success: function(data){
            if(data.success){
                $("#tableList").bootstrapTable('load',data.data);
            }else{
                top.layer.alert('温馨提示：'+data.message)
            }
        }
    });
}

function showData(){
	$('#tableList').bootstrapTable({
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: false, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParamsType: "limit",
        columns: [
        {
			field: 'xh',
			title: '序号',
			width: '50',
			align: 'center'
		},
        {
            field: 'checkReportType',
            title: '评审报告类型',
            align: 'left',
            formatter:function(value, row, index){
                var checkReportTypeTxt = {"1":"评标报告","2":"流标报告"}
                return checkReportTypeTxt[value];
            }
        },
		{
			field: 'isLaw',
			title: '是否依法',
			align: 'left',
            formatter:function(value, row, index){
                var isLawTxt = {"0":"否","1":"是"}
                return isLawTxt[value];
            }
		},
        {
            field: 'checkReportCode',
            title: '评标报告编号',
            align: 'left'
        },
        {
            field: 'status',
            title: '操作 ',
            align: 'center',
            width: '300',
            events: {
                'click .btnEdit': function(e,value, row){
                    openEdit(row.id);
                },
                'click .btnEditReport': function(e,value, row){
                    removeReport(row.id);
                }
            },
            formatter:function(value, row, index){
                var html = '<button  type="button" class="btn btn-primary btn-sm btnEdit"><span class="glyphicon glyphicon-edit"></span>修改</button>';
                    html += '<button  type="button" class="btn btn-danger btn-sm btnEditReport"><span class="glyphicon glyphicon-remove"></span>删除</button>';
                return html;
            }
        }]
    });
    getTendereeList();
}

function openEdit(id) {
    var contentPath = id ? editHtml+"?id="+id : editHtml;
    top.layer.open({
        type: 2,
        title: '评标报告设置详情',
        area: ['1000px', '600px'],
        resize: false,
        content: contentPath,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage(function(data){
                $("#tableList").bootstrapTable("refresh");
            })
        },
    });
}

function openAdd(id) {
    var contentPath = checkTypeInfoId ? editHtml+"?checkTypeInfoId="+checkTypeInfoId : editHtml;
    top.layer.open({
        type: 2,
        title: '评标报告设置详情',
        area: ['1000px', '600px'],
        resize: false,
        content: contentPath,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
            iframeWin.passMessage(function(data){
                $("#tableList").bootstrapTable("refresh");
            })
        },
    });
}

function removeReport(id) {
    $.ajax({
        type:"post",
        url:delUrl,
        async:true,
        data: {"id":id},
        success: function(data){
            if(data.success){
                top.layer.alert('温馨提示：'+data.data, function(index){
                    $("#tableList").bootstrapTable("refresh");
                    top.layer.close(index);
                });
            }else{
                top.layer.alert('温馨提示：'+data.message)
            }
        }
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量
        'sysType': $('#sysType').val(),//评标编号
    }
}
