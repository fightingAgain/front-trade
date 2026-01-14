var listUrl = config.tenderHost + '/ExtractRulesController/findJudgesProjectPageList.do';  //列表接口
var pushUrl = config.tenderHost + '/ExtractRulesController/pushJudgingPanel.do';  //推送接口
var examineUrl = "Judges/offling/model/examineView.html"; // 查看信息

$(function(){
	//加载列表
	initDataTab();
	
	//查询
	$("#btnSearch").click(function(){
		$("#projectList").bootstrapTable('destroy');
        initDataTab()
	});

	//推送项目
	$("#projectList").on("click", ".btnPush", function(){
		var index = $(this).attr("data-index");
		var rowData= $('#projectList').bootstrapTable('getData')[index];

		parent.layer.confirm('确定推送项目?', {icon: 3, title:'询问'}, function(index){
			parent.layer.close(index);
			$.ajax({
		         url: pushUrl,
		         type: "post",
		         data: {
                     bidSectionId:rowData.bidSectionId,
                     examType:rowData.examType
				 },
		         success: function (data) {
		         	if(data.success == false){
		        		parent.layer.alert(data.message);
		        		return;
		        	}else{
		        		parent.layer.alert("推送成功");
		        	}
					$("#projectList").bootstrapTable("refresh");
		         },
		         error: function (data) {
		             parent.layer.alert("加载失败");
		         }
			});
		});
	});


    //查看记录
    $("#projectList").on("click", ".btnSee", function(){
        var index = $(this).attr("data-index");
        var rowData= $('#projectList').bootstrapTable('getData')[index];
        var width = top.$(parent).width() * 0.9;
        var height = top.$(parent).height() * 0.9;
        parent.layer.open({
            type: 2, // 使用页面
            area: [width + 'px', height + 'px'],
            content: examineUrl + '?id='+rowData.bidSectionId + "&examType=" + rowData.examType + "&tenderType=" + rowData.tenderType,
        });
    });
});

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
        bidSectionCode: $("#bidSectionCode").val(), // 项目编号
        bidSectionName: $("#bidSectionName").val(), // 项目名称
	};
	return projectData;
};

//表格初始化
function initDataTab(){
	$("#projectList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		height:tableHeight,
		onCheck: function (row) {
			id = row.id;
		},
		columns: [
			[{
					field: 'xh',
					title: '序号',
					align: 'center',
					width: '50',
					formatter: function (value, row, index) {
		                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},
				
				{
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
					width: '180'
				},
				{
					field: 'projectName',
					title: '项目名称',
					align: 'left',
                    width: '250'
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
                    align: 'left',
                    width: '250'
				},
				{
					field: 'examType',
					title: '评审会类型',
					align: 'center',
					width: '80',
					formatter: function(value, row, index){
						if(value == 1){
							return "资格审查会";
						} else {
							return "评审会";
						}
					}
				},
				{
					field: 'checkStatus',
					title: '操作',
					align: 'left',
					width: '200',
					formatter: function (value, row, index) {
						var str = '';
                        var strPush = '<button  type="button" class="btn btn-success btn-sm btnPush" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>推送项目</button>';
                        var strSee = '<button  type="button" class="btn btn-sm btn-primary btnSee"  data-index="'+index+'"><span class="glyphicon glyphicon-search"></span>查看信息</button>';
                        if(value == undefined || value == '' || value == 0){
                            str = strPush;
						}else{
                            str = strSee;
                        }
						return str ;

					}
				}
			]
		]
	});
};
