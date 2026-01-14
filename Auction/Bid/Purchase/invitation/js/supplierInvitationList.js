var checkboxed="";
var projectend="";
var iframeWind="";
var tenderTypeCode;
//初始化
$(function(){ 
	if(PAGEURL.split("?")[1]!=undefined){
		tenderTypeCode = PAGEURL.split("?")[1].split("=")[1]; //0是询价采购  6是单一来源采购
	}else{
		tenderTypeCode=0
	}
	sessionStorage.setItem('tenderTypeCode', tenderTypeCode);//0是询价采购  6是单一来源采购，并缓存
	sessionStorage.setItem('examType', '1');//0是询价采购  6是单一来源采购，并缓存
   initTable(); 
});
/// 表格初始化
var deletProjectUrl=config.bidhost+'/PurchaseController/deleteProject.do'//删除项目接口
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人的信息
var recallUrl =config.bidhost+'/WorkflowController/deleteWorkflowAccep.do' // 撤回项目的接口
var noticeStateUrl=config.bidhost+'/PurchaseController/updateNoticeState.do'//手动发布公告
var checkPackageItem=config.bidhost +'/CheckController/checkPackageListItem.do' //评审项查询
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:config.bidhost+'/PurchaseController/findInvitationList.do', // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[10,15,20,25],
		search: false, // 不显示 搜索框
		sidePagination: 'server', // 服务端分页
		classes: 'table table-bordered', // Class样式
		//showRefresh : true, // 显示刷新按钮
		silent: true, // 必须设置刷新事件
		toolbar: '#toolbar', // 工具栏ID
		toolbarAlign: 'left', // 工具栏对齐方式
        sortStable:true,
		queryParams: queryParams, // 请求参数，这个关系到后续用到的异步刷新
		queryParamsType: "limit",
		onCheck:function(row){
			checkboxed=row.id;
			projectend=row.project.projectState;
			
		},		
		columns: [{
			field: 'xh',
			title: '序号',
			align: 'center',
			width: '50px',
			formatter:function(value, row, index){
				var pageSize=$('#table').bootstrapTable('getOptions').pageSize || 15;//通过表的#id 可以得到每页多少条  
                var pageNumber=$('#table').bootstrapTable('getOptions').pageNumber || 1;//通过表的#id 可以得到当前第几页  
                return pageSize * (pageNumber - 1) + index+1 ;//返回每条的序号： 每页条数 * （当前页 - 1 ）+ 序号 
			}
		},
		{
			field: 'projectCode',
			title: '采购项目编号',
			align: 'left',
			width: '180',
		},
		{
			field: 'projectName',
			title: '采购项目名称',
			align: 'left',			
		},
		{
			field: 'packageNum',
			title: '包件编号',
			align: 'left',
			width: '180',
		},
		{
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
		},
		{
			field: 'acceptEndDate',
			title: '接受邀请截止时间',
			align: 'left',			
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
			field: 'isAccept',
			title: '邀请状态',
			align: 'left',
			formatter:function(value, row, index){
				if(value==0){
				    return	'<span class="text-success"  style="font-weight:bold">已接受</span>'
				}else if(value==1){
					return	'<span class="text-danger"  style="font-weight:bold">拒绝</span>'
				}else{
					if(row.inviteTimeOut==0){
						return '未确认'
					}else{
						return '<span class="text-danger"  style="font-weight:bold">已过期</span>'
					}
					
				}
			}
		},
		{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '100',
			formatter:function(value, row, index){
	        	var audit='<button href="javascript:void(0)"  type="button" class="btn-sm btn-primary" style="text-decoration:none;border: none;padding: 3px 7px;" onclick=audit_btn(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>邀请函'
						+'</button>'
				var audits='<button href="javascript:void(0)"  type="button" class="btn-sm btn-primary" style="text-decoration:none;border: none;padding: 3px 7px;" onclick=audit_btns(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看'
						+'</button>'
				if(row.inviteTimeOut==0){
					if(row.isAccept!=0&&row.isAccept!=1){
						return '<div class="btn-group-sm">'+audit+'</div>';
					}else{
						return '<div class="btn-group-sm">'+audits +'</div>';
					}
				}else{
					return '<div class="btn-group-sm">'+audits+'</div>';
				}
				
					
					
			}
		}
		],
	});
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	return {		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量
			'enterpriseType':1,
			'tenderType':tenderTypeCode,			
		    'packageName': $('#search_1').val(), // 根据发布状态查询
		    'projectName': $('#search_3').val(), // 根据项目名称查询
	};
   
	
};
// 搜索按钮触发事件
$("#eventquery").click(function() {	    
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
//查看
function audit_btn($index){
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('inviteData', JSON.stringify(rowData[$index]));//获取当前选择行的数据，并缓存
    sessionStorage.setItem('tenderTypeCode', rowData[$index].tenderTypeCode);//0是询价采购  6是单一来源采购，并缓存
	sessionStorage.setItem('examTypeShow', rowData[$index].examType);//0是询价采购  6是单一来源采购，并缓存
	if(isCheck(rowData[$index])){				
		parent.layer.alert(isCheck(rowData[$index]));
   	 	return;
	}
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:'查看邀请函'
        ,area: ['1100px','650px']
        ,maxmin: true //开启最大化最小化按钮
        ,content:'0502/Bid/invitation/model/supplierInvitationInfo.html'
        ,btn: ['接受','拒绝','关闭']
        ,success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow;        	
        	iframeWind.du(rowData[$index].id);
        	iframeWind.Purchase(rowData[$index].projectId);
        	iframeWind.supplimentInt(rowData[$index].examType);
        	iframeWind.package();
        	iframeWind.PackageCheckList(0)       
        	//iframeWind.isAgent=rowData[$index].isAgent
        	$(".layui-layer-btn1").attr('style','background:#d9534f;color:#fff');
        }
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow; 
          if(rowData[$index].examType==1){
          	var inturl=config.bidhost+'/PurchaseController/updateProjectSupplierByProId.do'
          }else if(rowData[$index].examType==0){
          	var inturl=config.bidhost+'/PurchaseController/updateInvitationSupplierBypacId.do'
          };
           $.ajax({
				url: inturl, //查看 详细信息
				async: false,
				type: 'get',
				dataType: 'json',
				data:{
					'projectId':rowData[$index].projectId,
					'packageId':rowData[$index].id,
					'isAccept':0,					
				},
				success: function(data) {
				 if(data.success){
				 	parent.layer.alert("邀请成功");
				 	parent.layer.close(index);
				 	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				 	
				 }else{
				 	parent.layer.alert(data.message)
				 }
				}
			});		
         
        },
        btn2:function(index,layero){
        	if(rowData[$index].examType==1){
	          	var inturl=config.bidhost+'/PurchaseController/updateProjectSupplierByProId.do'
	          }else if(rowData[$index].examType==0){
	          	var inturl=config.bidhost+'/PurchaseController/updateInvitationSupplierBypacId.do'
	          }
        	parent.layer.confirm('拒绝之后将无法进行之后的操作，是否确认拒绝', function() {
				$.ajax({
					url: inturl, //查看 详细信息
					async: false,
					type: 'get',
					dataType: 'json',
					data:{
						'projectId':rowData[$index].projectId,
						'packageId':rowData[$index].id,
						'isAccept':1,						
					},
					success: function(data) {
					 if(data.success){
					 	parent.layer.alert("已拒绝");
					 	parent.layer.close(index);
					 	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					 	
					 }else{
					 	parent.layer.alert(data.message)
					 }
					}
				});
			});
        		
			return false;
        } 
      });
};
//查看
function audit_btns($index){
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('inviteData', JSON.stringify(rowData[$index]));//获取当前选择行的数据，并缓存	
    sessionStorage.setItem('tenderTypeCode', rowData[$index].tenderTypeCode);//0是询价采购  6是单一来源采购，并缓存
	sessionStorage.setItem('examTypeShow', rowData[$index].examType);//0是询价采购  6是单一来源采购，并缓存
//	if(isCheck(rowData[$index])){				
//		parent.layer.alert(isCheck(rowData[$index]));
// 	 	return;
//	}	
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title:'查看邀请函'
        ,area: ['1100px','650px']
        ,maxmin: true //开启最大化最小化按钮
        ,content:'0502/Bid/invitation/model/supplierInvitationInfo.html'
        ,btn: ['关闭']
       	,success:function(layero,index){
        	iframeWind=layero.find('iframe')[0].contentWindow;        	
        	iframeWind.du(rowData[$index].id);
        	iframeWind.Purchase(rowData[$index].projectId);
        	iframeWind.supplimentInt(rowData[$index].examType);
        	iframeWind.package();	
        	iframeWind.PackageCheckList(0);
        }
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow;   
          parent.layer.close(index);
        },

      });
};
function GetTime(time){
	var date=new Date(time).getTime();
	
	return date;
};
function isCheck(rowData){
	var isTrue;
	$.ajax({
		   	url:checkPackageItem,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'projectId':rowData.projectId,
		   		'packageId':rowData.id,
		   		'examType':1,
		   		'enterpriseType':1
		   	},
		   	success:function(data){		   	
		   		if(data.success){		   			
		   		}else{	
		   				
		   			isTrue=data.message
		   		}
		   	}  
		});
		
	return isTrue
}
