var listUrl = config.Reviewhost + '/ProjectController/findNotEndReviewPageList.do';  //列表接口
var pageCheck;
$(function(){
	initDataTab();
	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	
	$("[name='examType']").change(function() {
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
});
// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'examType': $("[name='examType']").val(),
		'BidSectionCode': $("#interiorBidSectionCode").val(), // 标段编号
		'bidSectionName': $("#bidSectionName").val(), // 标段名称			
	};
	return projectData;
};
//表格初始化
function initDataTab(){
	$("#tableList").bootstrapTable({
		url: listUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		height: (top.tableHeight -  $('#toolbarTop').height()),
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
		                var pageSize = $('#tableList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
		                var pageNumber = $('#tableList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
		                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
		            }
				},{
					field: 'bidSectionCode',
					title: '标段编号',
					align: 'left',
//					width: '200',
				},{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
				},{
					field: 'examType',
					title: '评审会类型',
					align: 'center',
					formatter: function(value, row, index){
						if(value==1){
							return  '资格预审会'
						}{
							return  '评审会'
						}
					}
				},{
					field: '',
					field: 'status',
					title: '操作',
					align: 'center',
					width: '200px',
					events:{
						'click .evade':function(e,value, row, index){
							top.layer.confirm("温馨提示：是否确定重新评审该标段?", function(indexs){
                                top.layer.close(indexs);
								top.layer.prompt({title: '请输入重新评审原因，并确认', formType: 2}, function(text, ind){
                                    top.layer.close(ind);
								    $.ajax({
										type: "post",
										url: config.Reviewhost  + "/ReviewControll/reset.do",
										data: {
											bidSectionId: row.bidSectionId,
											examType:row.examType,	
											remark:text,
											nodeType:'resetAll'
										},
										async: true,
										success: function(data) {
											if(data.success) {
												top.layer.alert('温馨提示:重新评审设置成功！');
												$("#tableList").bootstrapTable("refresh");
											} else {
												top.layer.alert('温馨提示：'+data.message);
											}
										}
									});	
//								    layer.msg('演示完毕！您的口令：'+ pass +'<br>您最后写下了：'+text);
							  	})
								
							});
						},
					},
					formatter: function(value, row, index){
						var evade = '<button  type="button" class="btn btn-primary btn-sm evade" data-index="'+index+'"><span class="glyphicon glyphicon-edit"></span>重新评标</button>';		
						return evade;
					}
				}
			]
		]
	});
};