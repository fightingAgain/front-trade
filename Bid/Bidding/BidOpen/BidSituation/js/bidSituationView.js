/**

*  开标情况查看（项目经理）
*  方法列表及功能描述
*/
var logListUrl = config.tenderHost + '/BidOpeningLogController/findBidOpeningLogList.do';//日志列表
var priceUrl = config.tenderHost + '/BidOpeningDecryptDetailsController/findBidOpeningDecryptDetails.do';//日志列表
var bidDetailUrl = config.tenderHost + '/BidOpeningConfigurationController/getBidOpeningConfiguration.do';//开标详情记录
var downloadFileUrl = config.FileHost + "/FileController/download.do"; //下载文件     
var rowData ;//父级页面传过来的数据
var pdfUrl; //总体开标一览表Url
var reportPdfUrl;//开标报告

$(function(){
	/*关闭*/
	$('#btnClose').click(function(){
		var index=parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
	})
	
	//下载
	$('#btnDownLoad').click(function(){
		var newUrl = downloadFileUrl + "?ftpPath=" + pdfUrl + "&fname=总体开标一览表";
		window.location.href = $.parserUrlForToken(newUrl);
	})
	
	//预览
	$('#btnView').click(function(){
		//openPreview(pdfUrl);
		previewPdf(pdfurl);
	})
	
	//下载
	$('#btnDownLoad1').click(function(){
		var newUrl = downloadFileUrl + "?ftpPath=" + reportPdfUrl + "&fname=开标报告";
		window.location.href = $.parserUrlForToken(newUrl);
	})
	
	//预览
	$('#btnView1').click(function(){
		//openPreview(reportPdfUrl);
		previewPdf(pdfurl);
	})
})
/*父级调用的函数
 * data:父级传过来的数据
 */
function bidFromFathar(data){
	rowData = data;
	logList(rowData);
	bidDetail(rowData);
	initJudgeTable();
};
/*日志看板数据请求
 * data:要传递的数据
 *
 */
function logList(data){
	$.ajax({
		type:"post",
		url:logListUrl,
		async:true,
		data:{
			'packageId':data.id
		},
		success: function(data){
			logHtml(data.data);
		},
		error:function(data){
			
		}
	});
};
/*日志看板页面
 * data:页面数据
 *
 */
function logHtml(data){
	$('#logBoard').html('');
	var li='';
	for(var i = 0;i<data.length;i++){
		li += '<li>'
					+'<span id="createDate">【'+data[i].createDate+'】</span>'
					+'<span id="content">'+data[i].content+'</span>'
				+'</li>'
	}
	$(li).appendTo('#logBoard');
	
}
/*
 * 开标详情记录
 * 
 * */
function bidDetail(data){
	$.ajax({
		type:"post",
		url:bidDetailUrl,
		async:true,
		data:{
			'packageId':data.id
		},
		success: function(data){
//			logHtml(data.data);
			if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}else{
        		var arr = data.data;
        		for(var key in arr){
        			$("#"+key).html(arr[key]);
        		}
        		pdfUrl = arr.pdfUrl;
        		reportPdfUrl = arr.reportPdfUrl;
        	}
         	
		},
		error:function(data){
			
		}
	});
}
// 查询参数
function getQueryParams(params) {
	var projectData = {
		offset: params.offset,
		pageSize: params.limit,
		pageNumber: (params.offset / params.limit) + 1, //页码
		'packageId':rowData.id
	};
	return projectData;
};

//表格初始化
function initJudgeTable() {
	$("#tableList").bootstrapTable({
		url: priceUrl,
		dataType: 'json',
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		method: 'post',
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		locale: "zh-CN",
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 100, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
//		pageList: [10, 15, 20, 25],
		clickToSelect: true, //是否启用点击选中行
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		queryParamsType: "limit",
		queryParams: getQueryParams,
		striped: true,
		/*onCheck: function (row) {
            checkboxed = row
        },*/
		columns: [
			/*{
				checkbox:true,
			},*/
			{
				field: 'xh',
				title: '序号',
				width: '50',
				align: 'center',
				formatter: function (value, row, index) {
	                var pageSize = $('#projectList').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
	                var pageNumber = $('#projectList').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
	                return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
	            }
			},
			{
				field: 'enterpriseCode',
				title: '组织机构代码',
				align: 'center',
				width: '200',
			},{
				field: 'enterpriseName',
				title: '投标单位',
				align: 'left',
			},
			{
				field: '',
				title: '投标文件',
				align: 'center',
				width: '150',
			},
			{
				field: 'decryptResult',
				title: '是否解密成功',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					var str = '';
					if(row.decryptResult == '0'){
						str = '解密成功';
					}else if(row.decryptResult == '1'){
						str = '解密失败';
					}
					return str
	            }
			},
			{
				field: 'openingStartDate',
				title: '投标文件解密时间',
				align: 'center',
				width: '180',
			},
			{
				field: 'isConfirmOffer',
				title: '是否确认报价',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					var str = '';
					if(row.isConfirmOffer == 1){
						str = '已确认';
					}else if(row.isConfirmOffer == 0){
						str = '未确认';
					}
					return str
	            }
			},
			{
				field: 'confirmDate',
				title: '确认报价时间',
				align: 'center',
				width: '180',
			},
			{
				field: 'decryptConfirmCaCode',
				title: '报价确认签名码',
				align: 'center',
				width: '100',
			},
			{
				field: 'isConfirmOpening',
				title: '是否确认开标一览表',
				align: 'center',
				width: '100',
				formatter: function (value, row, index) {
					var str = '';
					if(row.isConfirmOpening == 1){
						str = '已确认';
					}else if(row.isConfirmOpening == 0){
						str = '未确认';
					}
					return str
	            }
			},
			{
				field: 'confirmDate',
				title: '开标一览表确认时间',
				align: 'center',
				width: '180',
			},
		]
	});
};