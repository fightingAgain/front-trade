var checkboxed;
var PurchasersData_data;
/// 表格初始化
//$(function(){
//	initTable()
//})
var examTypeCode=getUrlParam("examType");
var tenderType = getUrlParam("tenderType");
var findPurchaseUrl;
var findPageList = config.bidhost + '/ProjectSupplementController/findProjectSupplementInfo.do';
var types;
function initTable(type,callback) {
	types=type;
	findPurchaseUrl=config.bidhost+'/ProjectPackageController/choosePackagePageList.do';
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:findPurchaseUrl, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 10, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[5,10,25,50],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		height:'540',
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row		
		},
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width:'180px'
		},{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',
			width:'250px'
		},{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width:'180px'
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
			width:'250px',
			formatter:function(value, row, index){
				if(row.packageSource==1){
					return value+'<span class="text-danger">(重新采购)</span>';
				}else{
					return value;
				}
				
			}
		},{
			field: 'examType',
			title: '资格审查方式',
			align: 'center',
			width: '120',
			formatter:function(value, row, index){
				if(value==0){
					return '资格预审';
				}else{
					return '资格后审';
				}
				
			}
		},
		{
			field: '#',
			title: '操作',
			width:'100',
			events:{
				'click .choose':function(e, value, row, index){
					callback(row,type);																
					parent.layer.close(parent.layer.getFrameIndex(window.name));		
				}
			},
			formatter: function(value, row, index) {
				var deletes='<button  type="button" class="btn-xs btn btn-primary choose" style="text-decoration:none;border: none;">'
					   +'选择'
					+'</button>'
				return '<div class="btn-group-sm" >'+deletes+'</div>';
        	}
		}],
	});
	// 搜索按钮触发事件
	$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url
		initTable(type,callback)
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	    var para={		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量		    
		    'enterpriseType':'04',
		    'checkType':1,
		    'tenderType':0,//采购方式0为询比采购、1为竞低价2、竞卖		
		    'packageName': $('#search_3').val(), // 请求时向服务端传递的参数	
		} 
		if(types=='change'){
			para.projectSupplementType=examTypeCode;			
		}else{
			para.packageState=4
		}
		return para		
};

function changeTable(uid,examType,callbacksupple){
	$("#toolbar").hide()
	var reluse=[];
	$.ajax({
		url: findPageList,
		type: 'post',
		dataType: 'json',
		async: false,
		data: {
			"packageId":uid,
			"tenderType": 0,
			'examType':examType,
			"enterpriseType": '04' //采购人 0 供应商1
		},
		success: function(data) {
			for(var i=0;i<data.data.projectSupplements.length;i++){
				if(data.data.projectSupplements[i].examType==examType){
					reluse.push(data.data.projectSupplements[i])
				}
			}
		}
	})
	$('#table').bootstrapTable({
		pagination: false,
		undefinedText: "",
//		height:'304',
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},{
				field: "packageNum",
				title: "包件编号",
				halign: "left",
				width:'200px',
				align: "left",			
			},
			{
				field: "packageName",
				title: "包件名称",
				align: "left",
				halign: "left",
				formatter:function(value, row, index){
					if(row.packageSource==1){
						return value+'<span class="text-danger">(重新采购)</span>';
					}else{
						return value;
					}
					
				}
			},{
				field: "title",
				title: "变更次数",
				align: "left",
				halign: "left",

			},
			 {
				field: "checkState",
				title: "审核状态",
				halign: "center",
				width:'100px',
				align: "center",
				formatter: function(value, row, index) {
					var checkState;
						if(value == 0) {
							checkState = "未审核"
						}
						if(value == 1) {
							checkState = "审核中";
							isChecking = 1;
						}
						if(value == 2) {
							checkState = "审核通过"
						}
						if(value == 3) {
							checkState = "审核不通过"
						}
					return checkState
				}
				
			},{
			field: '#',
			title: '操作',
			width:'100',
			events:{
				'click .choose':function(e, value, row, index){
					callbacksupple(row);																
					parent.layer.close(parent.layer.getFrameIndex(window.name));		
				}
			},
			formatter: function(value, row, index) {
				var deletes='<button href="javascript:void(0)" type="button" class="btn-sm btn-primary choose" style="text-decoration:none;border: none;">'
				+'选择'
			 +'</button>'
			 return '<div class="btn-group-sm" >'+deletes+'</div>';
        	}
		}
			
		]
	});
	$('#table').bootstrapTable("load", reluse); //重载数据
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}