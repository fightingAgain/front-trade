var searchUrl = parent.config.bidhost+'/AskAnswersController/findPageList.do';
var checkboxed="";
var answersContents=""

//初始化
var inviteState = getQueryString("inviteState");
var examType = getQueryString("examType");
var tenderTypeCode=getQueryString('tenderTypeCode');
var examTypeCode = getQueryString('examTypeCode');
$(function(){
   initTable();
});
function AddFunction(value,row,index){//把需要创建的按钮封装到函数中
	return [
		'<a href="javascript:void(0)" id="TableEditor" class="btn-sm btn-primary" style="text-decoration:none" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span> 查看</a>',
	].join("")
}
window.operateEvents = {//添加一个按钮对应的事件
	"click #TableEditor":function(e,value,row,index){
	parent.layer.open({		
		type: 2,
		title: '查看详情',
		area: ["1100px", "600px"],
		// maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		content: 'Auction/common/Supplier/AnswerAsk/AskContent.html'+'?examType=' + examType +'&inviteState=' + inviteState+ "&tenderType=" + tenderTypeCode,
		success:function(layero, index){
			var body = parent.layer.getChildFrame('body', index);    
            var iframeWin=layero.find('iframe')[0].contentWindow;
            iframeWin.show(row);
		}
	});
	}
}
function setProjectInfo(obj){
		$('label').each(function(){
			$(this).text(obj[this.id]);
		});		
		if(obj.projectSource == '1') {
			$("#ppName").html("(重新采购)");
		} else {
			$("#ppName").html("");
		}
}
/// 表格初始化
function initTable(PurchaseAskData) {
	if (!PurchaseAskData) return;
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:searchUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,25,50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		clickToSelect: true, //是否启用点击选中行
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
        sortStable:true,
		queryParams: function(params){// 请求参数，这个关系到后续用到的异步刷新
        	var paramData = {
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量	
			'projectId' :PurchaseAskData.project.id,	
			'packageId' :PurchaseAskData.packageId,
			'tenderType':0, //询比采购
			'examType':examTypeCode,
			'enterpriseType':'06'
		    };
			return paramData;
       },
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row.id;
			answersContents=row.answersContent;			
		},
		columns: [
		{
				field: 'Id',
				title: '序号',
				align: 'center',
				width: '50px',
				formatter: function(value, row, index) {
					var pageSize = $('#table').bootstrapTable('getOptions').pageSize || 15; //通过表的#id 可以得到每页多少条  
					var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber || 1; //通过表的#id 可以得到当前第几页  
					return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
				}
		},{
			field: 'askTitle',
			title: '提问标题',
			align: 'left',
		},{
			field: 'askDate',
			title: '提问时间',
			align: 'center', 			
		},{
			field: 'answersDate',
			title: '回复时间',
						
		},{
			field: 'answersContent',
			title: '回复内容',
			cellStyle: {
				css: {
					'text-overflow': 'ellipsis',
					'white-space': 'nowrap',
					'max-width': '200px',
					'overflow': 'hidden'
				}
			}
		},{
			title: '操作',
			align: 'center',
			width:'160px',
			events:operateEvents,//给按钮注册事件
			formatter:AddFunction,//表格中添加按钮
		}
		],
	});
};
// 搜索按钮触发事件
$("#eventquery").click(function() {    
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
function time(){
	layui.use('laydate', function(){
	 var laydate = layui.laydate;
	//自定义格式
	  laydate.render({
	    elem: '#search_2'
	    ,format: 'yyyy年MM月dd日'
	  });
	})
}


function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return unescape(r[2]);
	}
}