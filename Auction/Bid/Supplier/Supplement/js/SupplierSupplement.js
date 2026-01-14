var urlProjectSupplementList = config.bidhost + '/ProjectSupplementController/findProjectSupplementPageList.do';
var view = '0502/Bid/Supplement/model/supplierViewModel.html';
var viewpackage
var tenderTypeCode;
var examTypeCode;
var inviteStateCode;
var iframeWinAdd;
//表格初始化
$(function(){
	viewpackage='Auction/common/Supplier/Supplement/model/noticeChangeView.html'
	if(PAGEURL.split("?")[1]!=undefined){
		tenderTypeCode = PAGEURL.split("?")[1].split("=")[1]; //0是询比采购  6是单一来源采购
	}else{
		tenderTypeCode=0
	}
	examTypeCode = 0;
	inviteStateCode = '';
	initTable();
	// 搜索按钮触发事件
	$("#btnSearch").click(function() {
		$('#SupplementListtable').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
		initTable();			
	});
});

//设置查询条件
function queryParams(params) {

	return {
		pageNumber: params.offset / params.limit + 1, //当前页数
		pageSize: params.limit, // 每页显示数量
		offset: params.offset, // SQL语句偏移量	
		projectName: $("#projectName").val(),
		projectCode: $("#projectCode").val(),
		packageName: $("#packageName").val(),
		packageNum: $("#packageNum").val(),
		tenderType: tenderTypeCode,
		projectSupplementType: examTypeCode,
		enterpriseType: '06'
	}
}



function initTable() {
	$('#SupplementListtable').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: urlProjectSupplementList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#SupplementListtable').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#SupplementListtable').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180'
		}, {
			field: 'projectName',
			title: '项目名称',
			align: 'left',	
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			
		}, {
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			formatter:function(value, row, index){
				if(row.packageSource == 1) {
					return row.packageName + '<span class="text-danger">(重新采购)</span>'
				} else if(row.packageSource == 0) {
					return row.packageName
				}
				
			}
		},{
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				if(value == 1) {
					return '资格后审'
				} else {
					return '资格预审'
				}
				
			}
		},
		{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '120',
			formatter: function(value, row, index) {
               var Tdr="";
					Tdr+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=viewbao(\"'+ index +'\")>查看</a>'
		     		return Tdr
				
			}
		}],
	})
};
//查看页面
function viewbao($index){
	var rowData=$('#SupplementListtable').bootstrapTable('getData');//bootstrap获取当前页的数据
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:'查看公告变更'
        ,area: ['1100px', '650px']
		,maxmin: true//开启最大化最小化按钮
        ,content:viewpackage + "?projectId="+rowData[$index].projectId+"&packageId="+rowData[$index].packageId
        ,success:function(layero,index){          	
        	iframeWinAdd=layero.find('iframe')[0].contentWindow;       	
        	iframeWinAdd.Purchase(rowData[$index].projectId);
    		iframeWinAdd.du(rowData[$index].packageId,rowData[$index].examType); 
    		iframeWinAdd.packsuppliment();
        	if(iframeWinAdd.projectSupplementList.length>0){        		
        		iframeWinAdd.SupplementInfo(iframeWinAdd.projectSupplementList[0].id)
        	}       	
        	iframeWinAdd.hasData();
        	iframeWinAdd.package(); 
        	/*start报价*/
			iframeWinAdd.offerFormData(rowData[$index].projectId, rowData[$index].packageId);
			iframeWinAdd.fileList("","",rowData[$index].projectId, rowData[$index].packageId);
			/*end报价*/
        }    
    });
};
//格林威治时间转换成北京时间
function GMTToStr(time) {
	var date = new Date(time)
	if(date.getMonth() < 10) {
		var Month = '0' + (date.getMonth() + 1)
	} else {
		var Month = date.getMonth() + 1
	};
	if(date.getDate() < 10) {
		var Dates = '0' + date.getDate()
	} else {
		var Dates = date.getDate()
	};
	if(date.getHours() < 10) {
		var Hours = '0' + date.getHours()
	} else {
		var Hours = date.getHours()
	}
	if(date.getMinutes() < 10) {
		var Minutes = '0' + date.getMinutes()
	} else {
		var Minutes = date.getMinutes()
	};
	if(date.getSeconds() < 10) {
		var Seconds = '0' + date.getSeconds()
	} else {
		var Seconds = date.getSeconds()
	};
	var Str = date.getFullYear() + '-' +
		Month + '-' +
		Dates + ' ' +
		Hours + ':' +
		Minutes + ':' +
		Seconds
	return Str
}