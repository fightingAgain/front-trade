var examType = "";
var checkType ="",tenderTypeCode="",isSetB;
var opurl =config.Syshost +  "/OptionsController/list.do";
//初始化
$(function() {
	if(PAGEURL.split("?")[1]!=undefined){
		if(PAGEURL.split("?")[1].split("=")[0] =="tenderType"){ //单一
			tenderTypeCode =  PAGEURL.split("?")[1].split("=")[1];
		}else{
			examType = PAGEURL.split("?")[1].split("=")[1];; //1 询比报名
			checkType = 1;
			tenderTypeCode=0;
		}			
	}else{
		examType = 0;
		tenderTypeCode=0;
	}
	var searchHtml='<option value="0">未报名</option>'
    			+'<option value="1">已报名</option>'
	$.ajax({
			type: "post",
			url: opurl,
			datatype: 'json',
			data:{optionName:"IS_SET_SIGN_STATE"},
			async: false,
			success: function(data) {
				if(data.success) {
					if(data.data.length>0){
						isSetB=data.data[0].optionText
						if(data.data[0].optionText=="NO"){							
						}else{
							searchHtml+='<option value="3" >报名-未支付</option>'		
						}
					}					
				}
		}
   	})
	searchHtml+='<option value="2">已过期</option>'
	$("#search_1").html(searchHtml)
	initTable();
	$("#btnSearch").click(function() {
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
		initTable();
	});
});
var findPackagePageList = config.bidhost + '/OfferController/findExamSignList.do';
//var viewUrl = '0502/Supplier/signUp/model/signInfo.html';
/// 表格初始化
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url: findPackagePageList, // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageList: [10, 15, 20, 25],
		height:top.tableHeight,
		toolbar: '#toolbar', // 工具栏ID
		pageNumber: 1, // table初始化时显示的页数
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter: function(value, row, index) {
				var pageSize = $('#table').bootstrapTable('getOptions').pageSize||15; //通过表的#id 可以得到每页多少条  
				var pageNumber = $('#table').bootstrapTable('getOptions').pageNumber||1; //通过表的#id 可以得到当前第几页  
				return pageSize * (pageNumber - 1) + index + 1; //返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		}, {
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '200',
		},{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',		
		}, {
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '200',
		},{
			field: 'packageName',
			title: '包件名称',
			align: 'left',
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
			width: '100',
			formatter:function(value, row, index){
			    if(row.examType == 0){
					return "资格预审";
			    }else{
			    	return "资格后审";
			    }
			}
		},{
			field: 'supplierId',
			title: '报名状态',
			align: 'center',
			width: '130',
			formatter:function(value, row, index){				
				if(value){
					if(row.projectPrice!=0&&row.status==3){//projectPrice是否有钱、status报名状态3为已支付
						return '<span class="text-success">已报名</span>';	
					}else {
						if(row.projectPrice==0){
							return '<span class="text-success">已报名</span>';
						}else{
							return '<span style="color:red">报名-未支付</span>';	
						}						
					}									
				}else{
					if(row.auditTimeout==1){
						return '<span style="color:red">已过期-未报名</span>';
					}else{
						return '<span style="color:red">未报名</span>';
					}
				}
			}
		}, {
			field: 'signStartDate',
			title: '报名开始时间',
			align: 'center',
			width: '180'
		}, {
			field: 'signEndDate',
			title: '报名截止时间',
			align: 'center',
			width: '180'
		}, {
			field: 'id',
			title: '操作',
			align: 'center',
			width: '140',
			formatter: function(value, row, index) {				
				if(row.supplierId){	
					if(row.projectPrice!=0&&row.status==3){//projectPrice是否有钱、status报名状态3为已支付
						var review = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=sign(' + index + ',1)>查看</a>';
					}else {
						if(row.projectPrice==0){
							var review = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=sign(' + index + ',1)>查看</a>';
						}else{
							var review = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=sign(' + index + ',3)>支付</a>';	
						}						
					}		
					
					return review;
				}else{
					if(row.auditTimeout==1){
					}else{
						var review = '<a href="javascript:void(0)" style="text-decoration:none" class="btn-sm btn-primary" onclick=sign(' + index + ',2)>报名</a>';
						
						return review;
					}
				}
			
			}
		}],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {
		'pageNumber': params.offset / params.limit + 1, //当前页数
		'pageSize': params.limit, // 每页显示数量
		'offset': params.offset, // SQL语句偏移量
		'enterpriseType': '06',
		'tenderType': tenderTypeCode,
		'isOffer': $('#search_1').val(),
		'projectName': $('#projectName').val(), // 请求时向服务端传递的参数
		'projectCode': $('#projectCode').val(),
		'packageName': $('#packageName').val(),
		'packageNum': $('#packageNum').val(),
	};
};
function selectChange() {
	$('#table').bootstrapTable(('destroy')); // 很重要的一步，刷新url！
	initTable();
}

function receipt(path){
	window.open($.parserUrlForToken(top.config.bidhost + "/FileController/fileView.do?ftpPath=" + path));
}
var msg;
function sign($index,flag) {
	var rowData = $('#table').bootstrapTable('getData'); //	
	var auditTimeout = rowData[$index].auditTimeout; //判断是否报价截止
	var startAuditTimeout = rowData[$index].startAuditTimeout; //判断公告是否开始
	
	var uid = rowData[$index].projectId; //项目Id
	var packageId = rowData[$index].id; //包件ID	
	if(flag == 2){//flag 2为报名 1为查看
		newValidate(flag,uid,packageId,rowData[$index].examType,0);							
	}else if(flag == 3){
		$.ajax({
			type: "post",
			url: config.bidhost+"/ProjectPackageController/payVerify.do",
			data: {
				'packageId':packageId
			},
			dataType: "json",
			success: function (response) {
				if(response.success){
					if(rowData[$index].examType==0){
						var title=findServiceCharges(packageId)=="YES"?"温馨提示：支付报名费后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能递交资格申请文件。确认要支付报名费吗？":"温馨提示：当前项目需支付报名费，是否确认要支付报名费?"
					}else{
						var title=findServiceCharges(packageId)=="YES"?"温馨提示：支付报名费后，需缴纳平台服务费（<a href='"+ platformFeeNoticeUrl +"' target ='_blank'>点击这里查看平台服务费收费标准</a>）才能报价。确认要支付报名费吗？":"温馨提示：当前项目需支付报名费，是否确认要支付报名费?"
					}
					top.layer.confirm(title, function(indexsmm) {
						//生成订单
						$.ajax({
							type: "post",
							url: top.config.bidhost + "/OrderController/isPayOrderInfo.do",
							data: {
								projectId: uid,
								packId: packageId,
								prefixOrder:orderSoruc.sys,
								moneyType:'报名费',
							},
							async: false,
							success: function(data) {
								if(!data.success) {					
									//pay(data.message,'Ordertable')	
									payMoney(packageId,data.message,'table');
									parent.layer.close(indexsmm)
								}
							}
						})
					});
				}else{
					parent.layer.alert(response.message)
				}
			}
		});
		
		
	}else if(flag == 1){
		openOrder(flag,packageId,uid,rowData[$index].examType)
	}
};
function findServiceCharges(packageId){
	var isSetServiceCharges="";
	$.ajax({
			type: "post",
			url: config.Syshost+'/EnterpriseChargesController/findServiceCharges.do',
			datatype: 'json',
			data:{
				'packageId':packageId
			},
			async: false,
			success: function(data) {
				if(data.success) {
					for(var i=0;i<data.data.length;i++){
						if(data.data[i].optionName=="平台服务费"){
							isSetServiceCharges=data.data[i].optionText;														
						}						
						
					}				
				}
				
		}
   })
   return isSetServiceCharges	
}
function openOrder(flag,packageId,uid,examType){
	//生成报名费订单
		parent.layer.open({
	        type: 2 //此处以iframe举例
	        ,title:flag ==1?'查看网上报名':'报名'
	        ,area: ['1100px', '600px']
	        ,content:"Auction/common/Supplier/signUp/examSignUp.html?packageId="+packageId+"&projectId="+uid+"&examType="+examType
	        ,success:function(layero,index){
	        	iframeWin=layero.find('iframe')[0].contentWindow;  
	        	//iframeWin.findpackage(obj.projectId);
	        	//iframeWin.findpackageDetail();
	        } ,
			resize: false
	        //确定按钮
	        ,yes: function(index,layero){        
	          var iframeWin=layero.find('iframe')[0].contentWindow; 
	          parent.layer.close(index);
	        },
	    });		
}
