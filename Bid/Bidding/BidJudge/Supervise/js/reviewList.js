/**
*  zhouyan 
*  2019-4-1
*  评审列表
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/ReviewListController/supervisefindReviewList.do';  //列表接口
//var pageCheck = "Bidding/BidJudge/JudgeScore/model/judgeCheck.html";  //编辑页面
var pageCheck = "Bidding/BidJudge/ProjectManager/model/judgeCheck.html";  //评审
var signHtml = 'Bidding/BidJudge/ProjectManager/model/signView.html';//查看签到页面
var recommendHtml = 'Bidding/BidJudge/JudgeScore/model/recommendLeader.html';//推荐组长页面
var recommendResultHtml = 'Bidding/BidJudge/JudgeScore/model/recommendResult.html';//推荐组长结果

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
	//编辑
	$("#tableList").on("click", ".btnEnter", function(){
		var index = $(this).attr("data-index");
		openEdit(index);
	});
	//签到查看
	$('#tableList').on('click','.btnSign',function(){
		var index = $(this).attr("data-index");
		openSign(index);
	});
	//推荐组长
	/*$('#tableList').on('click','.btnLeader',function(){
		var index = $(this).attr("data-index");
		openLeader(index);
	});*/
	//查看评委组
	$('#tableList').on('click','.btnResult',function(){
		var index = $(this).attr("data-index");
		openResult(index);
	});
	
});
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openEdit(index){
	var width = top.$(window).width();
	var height = top.$(window).height();
	var rowData="",
		url = pageCheck,
		title = "评委评审";
	if(index != "" && index != undefined){
		rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
		url += "?id=" + rowData.bidSectionId;
		title = "评委评审";
	}
//	console.log(index);
//	console.log(rowData);
	layer.open({
		type: 2,
		title: title,
		area: [width + 'px', height + 'px'],
		resize: false,
		content: url,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);  //调用子窗口方法，传参
		}
	});
};
//打开签到查看页面
function openSign(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看评委签到情况',
		area: ['800px', '600px'],
		content: signHtml+'?id='+rowData.bidSectionId+'&recordid='+rowData.mRecordID,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(rowData); 
		}
	});
	
};
//打开推荐组长页面
function openLeader(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '推荐组长',
		area: ['600px', '500px'],
		content: recommendHtml+'?id='+rowData.bidSectionId,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
//			iframeWin.bidFromFathar(rowData); 
		}
	});
};
//打开查看评委组页面
function openResult(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	layer.open({
		type: 2,
		title: '查看评委组',
		area: ['800px', '600px'],
		content: recommendResultHtml+'?id='+rowData.bidSectionId+'&examType='+rowData.examType,
		resize: false,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
//			console.log(iframeWin)
			//调用子窗口方法，传参
			iframeWin.getMember(rowData); 
		}
	});
}

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
		tenderProjectCode: $("#tenderProjectCode").val(), // 项目编号
		tenderProjectName: $("#tenderProjectName").val(), // 项目名称
		projectName: $("#projectName").val(), // 项目名称	
		projectState: $("#projectState").val() // 项目状态	
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
					field: 'interiorBidSectionCode',
					title: '标段编号',
					align: 'left',
					cellStyle:{
						css:widthCode
					}
				},
				{
					field: 'bidSectionName',
					title: '标段名称',
					align: 'left',
					cellStyle:{
						css:widthName
					}
				},/*{
					field: 'signResult',
					title: '是否签订承诺书',
					align: 'center',
					width: '100',
					formatter: function(value, row, index){
						if(row.signResult==1){
							return  '已签订'
						}else {
							return  '未签订'
						}
					}
				},*/{
					field: 'checkStartDate',
					title: '评审开始时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: 'checkEndDate',
					title: '评审结束时间',
					align: 'center',
					cellStyle:{
						css:widthDate
					},
				},
				{
					field: '',
					title: '评审状态',
					align: 'center',
					cellStyle:{
						css:widthState
					},
					formatter: function(value, row, index){
						if(!row.checkStartDate){
							return  '未评审'
						}else {
							if(!row.checkEndDate){
								return  '评审中'
							}else{
								return  '已评审'
							}
						}
					}
				},{
					field: 'groupExpertName',
					title: '组长',
					align: 'center',
					cellStyle:{
						css:widthState
					},
				},
				{
					field: 'status',
					title: '操作',
					align: 'left',
					width: '230px',
					formatter: function(value, row, index){
						var strSee = '<button  type="button" class="btn btn-primary btn-sm btnEnter" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看评审</button>';
						var strSign = '<button  type="button" class="btn btn-primary btn-sm btnSign" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看签到</button>';
//						var leader = '<button  type="button" class="btn btn-primary btn-sm btnLeader" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>推荐组长</button>';
						var strResult = '<button  type="button" class="btn btn-primary btn-sm btnResult" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看评委组</button>';
//						if(row.signResult==1){
							return  strSign+strResult+strSee
						//}else {
//							return  strResult
//						}
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