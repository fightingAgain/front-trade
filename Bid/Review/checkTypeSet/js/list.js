/**

*  评标报告列表
*  方法列表及功能描述
*/

var reportUrl = config.Reviewhost + '/CheckTypeInfoController/findPageList'; //获取所有标段列表
var editHtml = 'Review/checkTypeSet/model/addCheckTypeInfo.html';//编辑评标办法
var editCheckReportHtml = 'Review/checkTypeSet/model/editCheckReport.html';//编辑评标报告

$(function(){
	getTendereeList();
    //查询
    $("#btnSearch").click(function(){
        $("#tableList").bootstrapTable("refresh");
    });
});


function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:reportUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
		height: (top.tableHeight -  $('#toolbarTop').height()),
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 15, // 每页的记录行数（*）
        pageNumber: 1, // table初始化时显示的页数
        pageList: [5, 10, 25, 50],
        search: false, // 不显示 搜索框
        sidePagination: 'server', // 服务端分页
        classes: 'table table-bordered', // Class样式
        silent: true, // 必须设置刷新事件
        toolbarAlign: 'left', // 工具栏对齐方式
        sortStable: true,
        queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
        queryParamsType: "limit",
        onLoadError:function(){
            top.layer.closeAll("loading");
            top.layer.alert("温馨提示：请求失败");
        },
        onLoadSuccess:function(data){
            top.layer.closeAll("loading");
        	if(!data.success){

                top.layer.alert('温馨提示：'+data.message);
        	}
        },
        columns: [
        {
			field: 'xh',
			title: '序号',
			width: '50',
			align: 'center',
			formatter: function (value, row, index) {
                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
            }
		},
        {
            field: 'sysType',
            title: '平台',
            align: 'center',
            formatter:function(value, row, index){
                var sysTypeTxt = {"CA":"长安","DF":"内部"}
                return sysTypeTxt[value];
            }
        },
        {
            field: 'isPublicProject',
            title: '是否公共资源项目',
            align: 'center',
            formatter: function (value, row, index) {
                var valueTxt = {"0": "否", "1": "是"}
                return valueTxt[value];
            }
        },
        {
			field: 'tenderProjectType',
			title: '招标项目类型',
			align: 'left',
            formatter:function(value, row, index){
			    if(value){
                   if(row.isPublicProject == 1){
                   	return getOptionText('tenderProjectType',value,'2');
                   }else{
                   	return getOptionText('tenderProjectType0',value,'2');
                   }
                }else{
                    return "";
                }
            }
		},
        {
            field: 'tenderProjectClassifyCode',
            title: '专业类型',
            align: 'left',
            formatter:function(value, row, index){
                if(value){
                    if(row.isPublicProject == 1){
                        return getOptionText('tenderProjectClassifyCode',value,value);
                    }else{
                        return getOptionText('tenderProjectClassifyCode0',value,value);
                    }
                }else{
                    return "";
                }
            }
        },
        {
            field: 'examType',
            title: '评标会类型',
            align: 'center',
            formatter:function(value, row, index){
                var examTypeTxt = {"1":"资格预审会","2":"评标会"}
                return examTypeTxt[value];
            }
        },
        {
            field: 'checkType',
            title: '评标办法',
            align: 'center'
        },
        {
            field: 'checkTypeName',
            title: '评标办法名称',
            align: 'center'
        },
            {
                field: 'status',
                title: '操作 ',
                align: 'center',
                width: '300',
                events: {
                    'click .btnEdit': function(e,value, row){
                        openEdit(row);
                    },
                    'click .btnEditReport': function(e,value, row){
                        btnEditReport(row);
                    }
                },
                formatter:function(value, row, index){
                    var html = '<button  type="button" class="btn btn-primary btn-sm btnEdit"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
                        html += '<button  type="button" class="btn btn-primary btn-sm btnEditReport"><span class="glyphicon glyphicon-edit"></span>编辑评标报告</button>';
                    return html;
                }
            }]
    });
}

$("#btnAddInfo").click(function(){
    top.layer.open({
        type: 2,
        title: '评标办法详情',
        area: ['1000px', '600px'],
        resize: false,
        content: editHtml,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;
        },
    });
});

function openEdit(row) {
    top.layer.open({
        type: 2,
        title: '评标办法详情',
        area: ['1000px', '600px'],
        resize: false,
        content: editHtml+'?id=' + row.id,
        success:function(layero, index){
            var iframeWin = layero.find('iframe')[0].contentWindow;

        },
    });
}

function btnEditReport(row) {
    top.layer.open({
        type: 2,
        title: '配置评标报告',
        area: ['100%', '100%'],
        resize: false,
        content: editCheckReportHtml+'?checkTypeInfoId=' + row.id,
        success:function(layero, index){
            //var iframeWin = layero.find('iframe')[0].contentWindow;
        },
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量
        'sysType': $('#sysType').val(),//评标编号
        'examType': $('#examType').val(),//评标编号
        'isPublicProject': $('#isPublicProject').val(),//是否公共资源
    }
}
