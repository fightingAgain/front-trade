/**

*  评标列表
*  方法列表及功能描述
*/
var listUrl = config.Reviewhost + '/ProjectController/findBidPageList.do';  //列表接口
var answerHtml = "Review/dfJudgeCheck/answer/model/answer.html";  //投标人答疑页面

$(function(){
	initDataTab();
//	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable("refresh");
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#tableList").bootstrapTable("refresh");
	});
	//答疑
	$("#tableList").on("click", ".btnAnswer", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index){
	rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	
	layer.open({
		type: 2,
		title: '评标澄清',
		area: ['1000px', '600px'],
		resize: false,
		content: answerHtml+'?id='+rowData.bidSectionId+'&examType='+rowData.examType+'&isEnd=' + rowData.isEnd,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		'pageNumber':params.offset/params.limit+1,//当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset':params.offset, // SQL语句偏移量
		'bidSectionCode': $("#interiorBidSectionCode").val(), // 标段编号
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
					cellStyle:{
						css: widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css: widthName
					}
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
				},
				// {
				// 	field: 'checkEndDate',
				// 	title: '评标结束时间',
				// 	align: 'center',
				// 	cellStyle:{
				// 		css: widthDate
				// 	}
				// },
				// {
				// 	field: 'isEnd',
				// 	title: '评标是否结束',
				// 	align: 'center',
				// 	cellStyle:{
				// 		css: widthState
				// 	},
				// 	formatter: function(value, row, index){
				// 		if(value==1){
				// 			return  '已结束';
				// 		}else{
				// 			return  '未结束';
				// 		}
				// 	}
				// },
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					cellStyle:{
						css: {'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						var strAnswer = '<button  type="button" class="btn btn-primary btn-sm btnAnswer" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>回复</button>';
						/*if(row.signResult==1){
							return  strSign+leader+strResult+strSee
						}else {
							return  leader
						}*/
						return strAnswer
					}
						
						

				}
			]
		]
	});
};

/*
 * 父窗口与子窗口通信方法
 * data是子窗口传来的参数
 */
function passMessage(data){
	console.log(JSON.stringify(data));
	$("#tableList").bootstrapTable("refresh");
}