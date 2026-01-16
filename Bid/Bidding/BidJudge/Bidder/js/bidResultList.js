/**

*  供应商收到的投标结果通知
*  方法列表及功能描述
*/
var listUrl = config.tenderHost + '/ResultNoticeController/findRNIPageList.do';  //列表接口
var getUrl = config.tenderHost + '/ResultNoticeController/getResultNoticeItemByBidId.do';//获取通知书编辑内容

var viewHtml = "Bidding/BidJudge/Bidder/model/bidResultView.html";  //投标结果通知书查看

$(function(){
	initDataTab();
//	initDataTab();

	//查询
	$("#btnSearch").click(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	// 状态查询
	$("#projectState").change(function(){
		$("#tableList").bootstrapTable('destroy');
		initDataTab();
	});
	//查看
	$("#tableList").on("click", ".btnView", function(){
		var index = $(this).attr("data-index");
		var rowData = $('#tableList').bootstrapTable('getData')[index];
		getMsgData(index)
		// if(rowData.pwServiceFee || rowData.pwServiceFee == 0){
		// 	checkService(rowData, function(){
		// 		openView(index);
		// 	});
		// } else {
		// 	openView(index);
		// }
	});
	
});

function getMsgData(index){
	var rowData = $('#tableList').bootstrapTable('getData')[index];
	$.ajax({
		type: "post",
		url: config.tenderHost + '/ResultNoticeController/getResultNoticeItemByBidId.do',
		async: true,
		data: {
			'bidSectionId':rowData.bidSectionId,
			'examType': rowData.examType
		},
		success: function(data){
			if(data.success){
				if(data.data){
					var dataMsg=data.data
					if(dataMsg.isCompile&&dataMsg.resultNotic){
						if(rowData.pwServiceFee || rowData.pwServiceFee == 0){
							checkService(rowData, function(){
								openView(index);
							});
						} else {
							openView(index);
						}
					}else  if(!(dataMsg.isCompile)){
						previewPdf(dataMsg.resultNoticeItemFiles[0].url);
					}
				
				}
//				$('#noticeContent').html(data.data)
			}
		}
	});
}

//平台服务费
function checkService(rowData, callback){
	//验证是否购买平台服务费
	
	checkServiceCost({
		packId:rowData.bidSectionId,
		isOpen:2,
		money:rowData.pwServiceFee,
		enterpriseId:entryData ? entryData.enterpriseId : entryInfo().enterpriseId,
		paySuccess:function(data, isService){
			if(data){
				callback();
			}
		}
	});
}
/*
 * 打开编辑窗口
 * 当index为空时是添加，index不为空时是当前所要编辑的索引，
 */
function openView(index){
	rowData = $('#tableList').bootstrapTable('getData')[index]; //bootstrap获取当前页的数据
	var noticeContent = rowData.resultNotic;
	var title = '';
	if(rowData.isWinBidder == 1){
		title = '中标通知书'
	}else{
		title = '结果通知书'
	}

	layer.open({
		type: 2,
		title: title,
		area: ['100%', '100%'],
		resize: false,
		content: viewHtml + '?id=' + rowData.bidSectionId + '&examType=' + rowData.examType ,
		success:function(layero, index){
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(rowData);
		}
	});
	/* $.ajax({
		type: "post",
		url: getUrl,
		async: true,
		data: {
			'bidSectionId':rowData.bidSectionId,
			'examType': rowData.examType 
		},
		success: function(data){
			if(data.success){
				if(data.data){
	                previewNotice(data.data.resultNotic);
				}
			}
		}
	});*/
};

// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'examType':2, // 资格审查方式
		interiorBidSectionCode: $("#interiorBidSectionCode").val(), // 标段编号
		bidSectionName: $("#bidSectionName").val(), // 标段名称	
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
				},
				/*{
					field: '',
					title: '通知时间',
					align: 'left',
					cellStyle:{
						css:{'white-space':'nowrap'}
					}
				},
				{
					field: '',
					title: '通知书状态',
					align: 'center',
					cellStyle:{
						css:{'white-space':'nowrap'}
					}
				},*/
				/*{
					field: '',
					title: '结果通知书类型',
					align: 'center',
					width: '150'
				},*/
				{
					field: 'isWinBidder',
					title: '通知书类型',
					align: 'center',
					cellStyle:{
						css:{'white-space':'nowrap'}
					},
					formatter: function(value, row, index){
						if(row.isWinBidder == 0){
							return  '<span style="color:red">结果通知书</span>'
						}else if(row.isWinBidder == 1){
							return  '<span style="color:green">中标通知书</span>'
						}
					}
				},
				{
					field: '',
					title: '操作',
					align: 'center',
					width: '100px',
					formatter: function(value, row, index){
						var strView = '<button  type="button" class="btn btn-primary btn-sm btnView" data-index="'+index+'"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
						return strView
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

function previewNotice(html){
    $.ajax({
        type: "post",
        url: config.Reviewhost+"/ReviewControll/previewPdf.do",
        async: true,
        data: {
            'html': html
        },
        success: function(data){
            if(data.success){
            	previewPdf(data.data);
            }
        }
    });
}