/**

*  评标报告列表
*/

var reportUrl = config.Reviewhost + '/CheckReportController/findPageList'; //获取所有标段列表
var editPartHtml = 'Review/reportSet/model/detail.html';//编辑章节
$(function(){
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
        getList();
	});
});

/*
 * 页面传参方法
 */
function passMessage(callback){
    getList();
	//确定
	$("#btnSure").click(function(){
		var row = $("#tableList").bootstrapTable("getSelections");
		if(row.length>0){
			callback(row[0]);
			var index=top.layer.getFrameIndex(window.name);
            top.layer.close(index);
		}else{
            top.layer.alert("温馨提示：请选择评标报告")
		}
	});
	/*关闭*/
	$('#btnClose').click(function(){
		var index=top.layer.getFrameIndex(window.name);
        top.layer.close(index);
	});
}

function getList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url: reportUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
		height: 450,
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
        	radio:true
        },{
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
            field: 'checkReportCode',
            title: '评标报告编号',
            align: 'left'
        },
        {
            field: 'checkReportName',
            title: '评标报告名称',
            align: 'left'
        },
        {
            field: 'checkReportType',
            title: '评标报告类型',
            align: 'left',
            formatter:function(value, row, index){
                if(value == 1){
                    return '评标报告'
                }else if(value == 2){
                    return '流标报告'
                }
            }
        },
        {
            field: 'checkReportDescribe',
            title: '评标报告描述',
            align: 'left'
        },
        {
            field: 'status',
            title: '操作 ',
            align: 'center',
            width: '300',
            events: {
                'click .btnEditPart': function(e,value, row){
                    openEditPart(row);
                }
            },
            formatter:function(value, row, index){
                var html = '<button  type="button" class="btn btn-primary btn-sm btnEditPart"><span class="glyphicon glyphicon-edit"></span>编辑章节</button>';
                return html;
            }
        }
        ]
    });
}

function openEditPart(row) {
    top.layer.open({
        type: 2,
        title: '评标报告设置详情',
        area: ['100%', '100%'],
        resize: false,
        content: editPartHtml+'?checkReportCode=' + row.checkReportCode+'&checkReportType=' + row.checkReportType,
        success:function(layero, index){
            // var iframeWin = layero.find('iframe')[0].contentWindow;
        },
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
        'checkReportName': $("#checkReportName").val(),
        'checkReportType':$("#checkReportType").val()
    }
}