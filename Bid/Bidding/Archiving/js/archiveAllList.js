/**
*  zhouyan 
*  2019-2-20
*  查看标段列表
*  方法列表及功能描述
*/

var tenderUrl = config.tenderHost + '/GDDataController/findALLGDDataPageList.do'; //获取所有标段列表
var viewHtml = 'Bidding/Archiving/model/view.html';//查看项目资料归档

$(function(){
	useType = $.getUrlParam('useType');//公告列表中带过来的标段Id
	getTendereeList()
	var tenderProjectId = $.getUrlParam('tenderProjectId');
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		getTendereeList();
	});
});


function getTendereeList(){
	$('#tableList').bootstrapTable({
        method: 'post', // 向服务器请求方式
        url:tenderUrl,
        contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
        cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        striped: true, // 隔行变色
        dataType: "json", // 数据类型
        pagination: true, // 是否启用分页
        showPaginationSwitch: false, // 是否显示 数据条数选择框
        pageSize: 10, // 每页的记录行数（*）
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
        	parent.layer.closeAll("loading");
        	parent.layer.alert("请求失败");
        },
        onLoadSuccess:function(data){ 
        	parent.layer.closeAll("loading");
        	if(!data.success){
        		
        		parent.layer.alert(data.message);
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
			field: 'interiorBidSectionCode',
			title: '标段编号',
			align: 'left',
		},
		{
			field: 'bidSectionName',
			title: '标段名称',
			align: 'left',
		},
		{
			field: 'tenderProjectType',
			title: '标段类型',
			align: 'center',
			formatter:function(value, row, index){
            	var str="";
            	if(value.split('')[0]=='A'){
            		str="工程";
            	} else if(value.split('')[0]=='B'){
            		str ="货物";
            	} else if(value.split('')[0]=='C'){
            		str ="服务";
            	}
            	return str;
            }
		},
		{
			field: 'examType',
			title: '资格审查方式 ',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
            	var str="";
            	if(value==1){
            		str="预审";
            	} else if(value==2){
            		str ="后审";
            	}
            	return str;
            }
		},{
			field: 'filingState',
			title: '审核状态 ',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){//归档状态 0为未归档，1为已提交，2为审核通过，3为审核未通过
            	if (value == '0') {
					return "<span style='color:red;'>未提交</span>";
				} else if (value == '1') {
					return "审核中";
				}else if (value == '2') {
					return "<span style='color:green;'>审核通过</span>";
				} else if (value == '3'){
					return "<span style='color:red;'>审核未通过</span>";
				}else{
					return "未编辑";
				}
            }
		},{
			field: 'status',
			title: '操作 ',
			align: 'left',
			width: '200',
			events: {
				'click .btnView': function(e,value, row, index){
					top.layer.open({
						type: 2,
						title: '查看归档',
						area: ['100%', '100%'],
						resize: false,
//						id:'layerPackage',
						content: viewHtml+'?id='+(row.gdId?row.gdId:'')+'&examType='+row.examType+'&tenderMode='+row.tenderMode+"&isThrough=" + (row.filingState == 2 ? 1 : 0)+ '&source=0',
						success:function(layero, index){
							var iframeWin = layero.find('iframe')[0].contentWindow;	
//	iframeWin.getLoginInfo(loginInfo);
						},
					});
				}
			},
			formatter:function(value, row, index){
				return strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>查看</button>';
            }
		}]
    });
}

// 分页查询参数，
function queryParams(params) {
    return {
        'pageNumber': params.offset / params.limit + 1, //当前页数
        'pageSize': params.limit, // 每页显示数量
        'offset': params.offset, // SQL语句偏移量	
//      'useType': useType,
        'interiorBidSectionCode': $('#interiorBidSectionCode').val(),//标段编号
        'bidSectionName': $('#bidSectionName').val(),//标段名称
    }
}
