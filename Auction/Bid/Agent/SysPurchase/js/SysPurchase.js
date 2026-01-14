var checkboxed="";
var projectend="";
//初始化
$(function(){  
   initTable();
});
/// 表格初始化
var auditPurchase='0502/Auction/AuctionPurchase/model/auditPurchase.html'//审核路径
var editPurchase='0502/Auction/AuctionPurchase/model/edit_model.html'//编辑路径
var auditPurchase2='0502/Sale/AuctionPurchase/model/auditPurchase.html'//审核路径
var editPurchase2='0502/Sale/AuctionPurchase/model/edit_model.html'//编辑路径
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人的信息
function initTable() {
	$('#table').bootstrapTable({
		method: 'GET', // 向服务器请求方式
		contentType: "application/x-www-form-urlencoded", // 如果是post必须定义
		url:config.bidhost+'/PurchaseController/findPurchaseForSys.do', // 请求url		
		cache: false, // 是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
		striped: true, // 隔行变色
		dataType: "json", // 数据类型
		pagination: true, // 是否启用分页
		showPaginationSwitch: false, // 是否显示 数据条数选择框
		pageSize: 15, // 每页的记录行数（*）
		pageNumber: 1, // table初始化时显示的页数
		pageList:[5,15,25,50],
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
		},{
			field: 'projectCode',
			title: '项目编号',
			align: 'left',
			width: '180',
		},{
			field: 'projectName',
			title: '项目名称',
			align: 'left',
			formatter:function(value, row, index){				
				if(row.projectSource==1){
					var projectName=row.projectName +'(重新采购)';		
				}else{
					var projectName=row.projectName;
				}						
				return projectName;
			}
		},{
			title: '创建时间',
			field: 'subDate',
			align: 'center',
			width: '180'
		},{
			title: '公告类型',
			field: 'tenderType',
			align: 'center',
			width: '180',
			formatter:function(value, row, index){
				if(row.tenderType==0){
					var tenderTypeName="询价采购公告"
				}
				if(row.tenderType==1){
					var tenderTypeName="竞价采购公告"
				}
				if(row.tenderType==2){
					var tenderTypeName="竞卖"
				}
				
				return tenderTypeName
			}
		},{
			field: 'enterpriseName',
			title: '企业名称',
			align: 'left',
			width: '150',
			
		},{
			field: 'id',
			title: '操作',
			align: 'center',
			width: '160',
			formatter:function(value, row, index){				
				if(row.tenderType==0){
					var State='<div class="btn-group-sm" style="padding-left: 10px;">'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:10px" onclick=edit_btn0(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑'
						+'</a>'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none" onclick=audit_btn0(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看'
						+'</a>'
	        			+'</div>'
				}else if(row.tenderType==1){
					var State='<div class="btn-group-sm" style="padding-left: 10px;">'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:10px" onclick=edit_btn1(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑'
						+'</a>'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none" onclick=audit_btn1(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看'
						+'</a>'
	        			+'</div>'
				}else if(row.tenderType==2){
					var State='<div class="btn-group-sm" style="padding-left: 10px;">'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none;margin-right:10px" onclick=edit_btn2(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>编辑'
						+'</a>'
						+'<a href="javascript:void(0)" id="btn_delete" type="button" class="btn-sm btn-primary" style="text-decoration:none" onclick=audit_btn2(\"'+index+'\")>'
						   +'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>查看'
						+'</a>'
	        			+'</div>'
				}
				
				return State;
			}
		}],
	});
	
};
Usersupplier()
//获取当前登录人的企业信息
function Usersupplier(){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		sessionStorage.setItem('QYXX', JSON.stringify(data.data));//缓存综合发添加的tabs的数组
	   		
	   	}
	});    
};
// 分页查询参数，是以键值对的形式设置的
function queryParams(params) {
	 condition={		 
			'pageNumber':params.offset/params.limit+1,//当前页数
			'pageSize': params.limit, // 每页显示数量
			'offset':params.offset, // SQL语句偏移量			 
		    'projectName': $('#projectName').val(), // 项目名称
		    'projectCode': $('#projectCode').val(), // 项目编号
		    'enterpriseName': $('#enterpriseName').val(), // 所属企业名称
	};
	if($('#tenderType').val()!=""){
		condition.tenderType=$('#tenderType').val()//采购方式#0为询价采购，1为竞价采购，2为竞高价	  
	}
    return condition
	
};
// 搜索按钮触发事件
$("#eventquery").click(function() {
	    
		$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！				
});
function searchTable(){
	$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！		
}
//询价公告的编辑功能
function edit_btn0($index){ 
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));//获取当前选择行的数据，并缓存	
	var key="";
    var height=$(window).height()*0.9;
	var width=$(window).width()*0.6;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改询价采购公告'
        ,area: [width+'px', height+'px']
        ,content:'0502/Bid/Purchase/model/purchase_edit_model.html'
        ,btn: ['提交审核','确认修改','取消'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow; 
          if(iframeWin.$("#noticeStartDate").val()==""){
		    	parent.layer.alert("请选择公告开始时间");  
		        return;
		    };
		    if(iframeWin.$("#noticeEndDate").val()==""){
		    	parent.layer.alert("请选择公告截止时间");  
		        return;
		    };
		    if(iframeWin.$("#askEndDate").val()==""){
		    	parent.layer.alert("请选择提出澄清截止时间");  
		        return;
		    };
		    if(iframeWin.$("#answersEndDate").val()==""){
		    	parent.layer.alert("请选择答复截止时间");  
		        return;
		    };
		    if(iframeWin.$("#bidEndDate").val()==""){
		    	parent.layer.alert("请选择报价截止时间");  
		        return;
		    };
		     if(iframeWin.$("#checkEndDate").val()==""){
		    	parent.layer.alert("请选择询价评审时间");  
		        return;
		    };
		    if(GetTime(iframeWin.$("#noticeEndDate").val())<GetTime(iframeWin.$("#noticeStartDate").val())){
		    	parent.layer.alert("公告开始时间不得晚于公告截止时间");  
		        return;
		    };
		    if(GetTime(iframeWin.$("#askEndDate").val())>GetTime(iframeWin.$("#answersEndDate").val())){
		    	parent.layer.alert("提出澄清截止时间不得晚于答复截止时间");  
		        return;
		    };
		    if(GetTime(iframeWin.$("#bidEndDate").val())>GetTime(iframeWin.$("#checkEndDate").val())){
		    	parent.layer.alert("询价评审时间不能早于报价截止时间");  
		        return;
		    };
          if(iframeWin.massage2==2){
          	parent.layer.alert("找不到该级别的审批人,请联系管理员");
	 		 return;
          };         
          if(iframeWin.$("#employeeId").val()==""){
          	parent.layer.alert("请选择审核人");
	 		 return;
          }; 
          if(iframeWin.packageInfo.length==0||iframeWin.packageInfo==undefined){
 			parent.layer.alert("包件不能为空");	 		 
	 		return;
 	      };
 	      for(var i=0;i<iframeWin.packageInfo.length;i++){
 	      	if(iframeWin.packageInfo[i].data==undefined||iframeWin.packageInfo[i].data.length==0){
 	      		parent.layer.alert("包件"+iframeWin.packageInfo[i].packageName+'没有评审项，请添加');
	 		    return;
 	      	};
 	      	var weightTotal=[];//权重值之和
 	      	var weightTotals//权重值之和
 	      	var PriceSetweights="";//自定义的权重值
 	      	for(var n=0;n<iframeWin.packageInfo[i].data.length;n++){
 	      		if(iframeWin.packageInfo[i].data[n].data==undefined||iframeWin.packageInfo[i].data[n].data.length==0){
 	      			parent.layer.alert("包件"+iframeWin.packageInfo[i].packageName+'的评审项'+iframeWin.packageInfo[i].data[n].checkName+'没有评价项，请添加');	 		 
	 		        return;
 	      		};
 	      		if(iframeWin.packageInfo[i].checkPlan==0){
 	      			if(iframeWin.packageInfo[i].data[n].scoreTotal!=100){
 	      				parent.layer.alert("包件"+iframeWin.packageInfo[i].packageName+'的评审项'+iframeWin.packageInfo[i].data[n].checkName+'的分值之和不为100，请修改');	 		 
	 		        return;
 	      			}
 	      			weightTotal.push(iframeWin.packageInfo[i].data[n].weight*10000)
 	      			weightTotals=eval(weightTotal.join('+')) 	      			
 	      		}else{
 	      			weightTotals=0//当为最低法的时候没有权重值，所以权重值之和就为0
 	      		}
 	      	};
 	      	//判断自定义的权重值是否存在，不存在则为0
 	      	if(iframeWin.packageInfo[i].businessPriceSet!=undefined&&iframeWin.packageInfo[i].businessPriceSet!==""){ 	      		
 	      		PriceSetweights=iframeWin.packageInfo[i].businessPriceSet.weight*10000;
 	      		if(iframeWin.packageInfo[i].businessPriceSet.businessName==""||iframeWin.packageInfo[i].businessPriceSet.businessName==undefined){
		     	 	parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"自定义评分名称不能为空");	     	 		
			     	return;
		     	 }
		     	 if(iframeWin.packageInfo[i].businessPriceSet.weight==""||iframeWin.packageInfo[i].businessPriceSet.weight==undefined){
		     	 	parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"自定义权重值不能为空");	     	 		
			     	return;
		     	 }
		     	 if(iframeWin.packageInfo[i].businessPriceSet.businessContent==""||iframeWin.packageInfo[i].businessPriceSet.businessContent==undefined){
		     	 	parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"商务报价计算方法");	     	 		
			     	return;
		     	 }
 	      	}else{
 	      		PriceSetweights=0;
 	      	}
 	      	
 	      	if((parseFloat(weightTotals)+parseFloat(PriceSetweights))/10000!=1){
		     	parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"的权重值之和不为1，请修改");		     	
		        return;
		    };
		    if(iframeWin.packageInfo[i].budget==""||iframeWin.packageInfo[i].budget==undefined){
     	 		parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"预算价不能为空");		     	
			    
			    return;
	        };
	     	 if(!(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test(iframeWin.packageInfo[i].budget))){
	     	 		parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"预算价只能填写数字");		     	
				    
				    return;
		     };
		    if(iframeWin.packageInfo[i].serviceChargePay==0){
	     	 	if(iframeWin.packageInfo[i].serviceCharge==""||iframeWin.packageInfo[i].serviceCharge==undefined){
	     	 		parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"平台服务费不能为空");		     	
				    
				    return;
		        };
		        if(!(/^((\d+\.\d*[1-9]\d*)|(\d*[1-9]\d*\.\d+)|(\d*[1-9]\d*))$/.test(iframeWin.packageInfo[i].serviceCharge))){
	     	 		parent.layer.alert('包件'+iframeWin.packageInfo[i].packageName+"平台服务费只能填写数字");		     	
				    
				    return;
		        };
     	    };
     	    if(iframeWin.packageInfo[i].packageDetailInfos==undefined||iframeWin.packageInfo[i].packageDetailInfos.length==0){
     	    	parent.layer.alert("包件"+iframeWin.packageInfo[i].packageName+'没有明细表，请添加');	 		 
	 		    return;
     	    }
 	      }
          iframeWin.formsm();
          $('#table').bootstrapTable(('refresh'));
          sessionStorage.removeItem("keysjd");
          sessionStorage.removeItem("sadasd");
          parent.layer.close(index);
        },
        btn2:function(index,layero){
        	var iframeWins=layero.find('iframe')[0].contentWindow;        	
        	if(GetTime(iframeWins.$("#noticeEndDate").val())<GetTime(iframeWins.$("#noticeStartDate").val())){
		    	parent.layer.alert("公告开始时间不得晚于公告截止时间");  
		        return;
		    };
		    if(GetTime(iframeWins.$("#askEndDate").val())>GetTime(iframeWins.$("#answersEndDate").val())){
		    	parent.layer.alert("提出澄清截止时间不得晚于答复截止时间");  
		        return;
		    };
		    if(GetTime(iframeWins.$("#bidEndDate").val())>GetTime(iframeWins.$("#checkEndDate").val())){
		    	parent.layer.alert("询价评审时间不能早于报价截止时间");  
		        return;
		    };
            iframeWins.form();
            $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
        	sessionStorage.removeItem("keysjd");
            sessionStorage.removeItem("sadasd");
        },  
     });        
}
//询价公告的查看
function audit_btn0($index){
	var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));//获取当前选择行的数据，并缓存	
    var height=top.$(window).height()*0.8;
	var width=top.$(window).width()*0.8;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看询价采购公告'
        ,area: [width+'px', height+'px']
        ,content:'0502/Bid/Purchase/model/viewPurchase.html'
        ,btn: ['确定','取消'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow; 
          parent.layer.close(index);
        },
        btn2:function(){
        	
        } 
      });
};
//竞价编辑功能
function edit_btn1($index){ //$index当前选择行的下标，projectState是当前选择行的审核状态0为未审核，1为审核中，2为审核通过。
    var rowData=$('#table').bootstrapTable('getData');//bootstrap获取当前页的数据
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));//获取当前选择行的数据，并缓存		
	var key="";
    var height=$(window).height()*0.9;
	var width=$(window).width()*0.6;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改竞价采购公告'
        ,area: [width+'px', height+'px']
        ,content:editPurchase
        ,btn: ['提交审核','保存','取消'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow;
          if(iframeWin.$("#projectName").val()==""){
	 		parent.layer.alert("采购项目名称不能为空");
	 		return;
	 	};
	 	if(iframeWin.$("#purchaserName").val()==""){
	 		parent.layer.alert("采购人名称不能为空");
	 		return;
	 	};
	 	if(iframeWin.$("#purchaserLinkmen").val()==""){
	 		parent.layer.alert("联系人不能为空");
	 		return;
	 	};
	 	if(iframeWin.$("#purchaserTel").val()==""){
	 		parent.layer.alert("联系人电话");
	 		return;
	 	};	
	    if(!(/^1(3|4|5|7|8)\d{9}$/.test(iframeWin.$("#purchaserTel").val()))){ 
	        parent.layer.alert("手机号码有误，请重填");  
	        return;
	    };
	    if(iframeWin.$("#noticeStartDate").val()==""){
	    	parent.layer.alert("请选择公告开始时间");  
	        return;
	    };
	    if(iframeWin.$("#noticeEndDate").val()==""){
	    	parent.layer.alert("请选择公告截止时间");  
	        return;
	    };
	    if(iframeWin.$("#askEndDate").val()==""){
	    	parent.layer.alert("请选择提出澄清截止时间");  
	        return;
	    };
	    if(iframeWin.$("#answersEndDate").val()==""){
	    	parent.layer.alert("请选择答复截止时间");  
	        return;
	    };
	    if(iframeWin.$('input[name="isFile"]').val()==0){
	    	if(iframeWin.$("#fileEndDate").val()==""){
		    	parent.layer.alert("请选择竞价文件递交截止时间");  
		        return;
		    };
	    	if(iframeWin.$("#fileCheckEndDate").val()==""){
		    	parent.layer.alert("请选择竞价文件审核截止时间");  
		        return;
		    };
		   
	    };
        if(iframeWin.packageData.length==0||iframeWin.packageData==undefined){
 			parent.layer.alert("包件不能为空");
	 		 
	 		 return
 	    };
          if(iframeWin.massage2==2){
          	parent.layer.alert("找不到该级别的审批人,请联系管理员");
	 		 return
          };         
          if(iframeWin.$("#employeeId").val()==""){
          	parent.layer.alert("请选择审核人");
	 		 return
          }; 
          iframeWin.form();
          $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
          parent.layer.close(index);
        },
        btn2:function(index,layero){        	
        	 var iframeWins=layero.find('iframe')[0].contentWindow;
        	 iframeWins.forms();
        	 $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
        },
        btn3:function(){
        	
        }  
     });       
}
//竞价查看
function audit_btn1($index){//$index当前选择行的下标
	var rowData=$('#table').bootstrapTable('getData');
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));	
	var key="";
    var height=top.$(window).height()*0.8;
	var width=top.$(window).width()*0.8;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看竞价采购公告'
        ,area: [width+'px', height+'px']
        ,content:auditPurchase
        ,btn: ['关闭'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow;         
          parent.layer.close(index);
        }
      });
};

//编辑功能
function edit_btn2($index){ 
    var rowData=$('#table').bootstrapTable('getData');
    console.log(rowData[$index].projectId)
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));	
	var key="";
    var height=$(window).height()*0.9;
	var width=$(window).width()*0.7;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改'
        ,area: [width+'px', height+'px']
        ,content:editPurchase2
        ,btn: ['提交审核','保存','取消'] 
        //确定按钮
        ,yes: function(index,layero){                 
        var iframeWin=layero.find('iframe')[0].contentWindow;
        
        if(iframeWin.$("#projectName").val()==""){
	 		parent.layer.alert("竞卖项目名称不能为空");
	 		 return
	 	};
	 	if(iframeWin.$("#purchaserName").val()==""){
	 		parent.layer.alert("竞卖人名称不能为空");
	 		 return
	 	};
	 	if(iframeWin.$("#purchaserLinkmen").val()==""){
	 		parent.layer.alert("联系人不能为空");
	 		 return
	 	};
	 	if(iframeWin.$("#purchaserTel").val()==""){
	 		parent.layer.alert("联系人电话不能为空");
	 		 return
	 	};
	 	if(iframeWin.$("#noticeStartDate").val()==""){
	    	parent.layer.alert("请选择公告开始时间");  
	        return;
	    };
	    if(iframeWin.$("#noticeEndDate").val()==""){
	    	parent.layer.alert("请选择公告截止时间");  
	        return;
	    };
	    if(iframeWin.$("#askEndDate").val()==""){
	    	parent.layer.alert("请选择提出澄清截止时间");  
	        return;
	    };
	    if(iframeWin.$("#answersEndDate").val()==""){
	    	parent.layer.alert("请选择答复截止时间");  
	        return;
	    };
	    if(iframeWin.$('input[name="isFile"]').val()==0){
	    	if(iframeWin.$("#fileEndDate").val()==""){
		    	parent.layer.alert("请选择竞价文件递交截止时间");  
		        return;
		    };
	    	if(iframeWin.$("#fileCheckEndDate").val()==""){
	    	parent.layer.alert("请选择竞价文件审核截止时间");  
	        return;
		    };
		   
	    };
	    if(iframeWin.$('input[name=auctionType]:checked').val()==0){
     	 	if(iframeWin.$('input[name=auctionModel]:checked').val()==0){
     	 		if(iframeWin.$("#timeLimit").val()==""){
	     	 		parent.layer.alert("限时不能为空");        		     		
	     			return;
     	 	    };
     	 	    if(!(/^[0-9]*$/.test(iframeWin.$("#timeLimit").val()))){ 
					parent.layer.alert("限时只能是数字"); 
					return;
			    };     	 	    
     	 	if(iframeWin.$("#priceReduction").val()==""){
     	 		parent.layer.alert("降价幅度不能为空");        		     		
     			return;
     	 	}
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#priceReduction").val()))){ 
					parent.layer.alert("降价幅度只能是数字"); 
					return;
			};
     	 };
     	};
     	if(iframeWin.$('input[name=auctionType]:checked').val()==4&&iframeWin.$('input[name=auctionTypes]:checked').val()==2){
     	 	if(iframeWin.$("#firstOutSupplier").val()==""){
     	 		parent.layer.alert("第1轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#firstOutSupplier").val()))){ 
					parent.layer.alert("第1轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if(iframeWin.$("#firstKeepSupplier").val()==""){
     	 		parent.layer.alert("第1轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#firstKeepSupplier").val()))){ 
					parent.layer.alert("第1轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	
     	};
     	if(iframeWin.$('input[name=auctionType]:checked').val()==4&&iframeWin.$('input[name=auctionTypes]:checked').val()==3){
     	 	if(iframeWin.$("#firstOutSupplier").val()==""){
     	 		parent.layer.alert("第1轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#firstOutSupplier").val()))){ 
					parent.layer.alert("第1轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if(iframeWin.$("#firstKeepSupplier").val()==""){
     	 		parent.layer.alert("第1轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#firstKeepSupplier").val()))){ 
					parent.layer.alert("第1轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	if(iframeWin.$("#secondOutSupplier").val()==""){
     	 		parent.layer.alert("第2轮淘汰供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#secondOutSupplier").val()))){ 
					parent.layer.alert("第2轮淘汰供应商数只能是数字"); 
					return;
			};
     	 	if(iframeWin.$("#secondKeepSupplier").val()==""){
     	 		parent.layer.alert("第2轮最低保留供应商数不能为空");        		     		
     			return;
     	 	};
     	 	if(!(/^[0-9]*$/.test(iframeWin.$("#secondKeepSupplier").val()))){ 
					parent.layer.alert("第2轮最低保留供应商数只能是数字"); 
					return;
			};
     	 	
     	 };
     	 if(!(/^[0-9]*$/.test(iframeWin.$("#rawPrice").val()))){ 
				parent.layer.alert("竞价起始价只能是数字"); 
				return;
		 };
     	 
     	 if(iframeWin.$("#servicePrice").val()==""){
     	 	parent.layer.alert("平台服务费不能为空");        		     		
     			return;
     	 };
     	 if(!(/^[0-9]*$/.test(iframeWin.$("#servicePrice").val()))){ 
					parent.layer.alert("平台服务费只能是数字"); 
					return;
		 };
		 if(iframeWin.$('#detailedName').val()==""){ 
					parent.layer.alert("商品名称不能为空"); 
					return;
			};
			if(iframeWin.$('#detailedCount').val()==""){ 
					parent.layer.alert("数量不能为空"); 
					return;
			};
            if(!(/^[0-9]*$/.test(iframeWin.$("#detailedCount").val()))){ 
					parent.layer.alert("数量只能是数字"); 
					return;
			};
			if(iframeWin.$('#detailedUnit').val()==""){ 
					parent.layer.alert("单位不能为空"); 
					return;
			};
			if(iframeWin.$('#detailedUnit').val().length>10){ 
					parent.layer.alert("单位过长"); 
					return;
			};
			if(iframeWin.$('#detailedRemark').val()==""){ 
					parent.layer.alert("竞卖人资质要求"); 
					return;
			};
	    if(GetTime(iframeWin.$("#noticeEndDate").val())<GetTime(iframeWin.$("#noticeStartDate").val())){
		    	parent.layer.alert("公告开始时间不得晚于公告截止时间");  
		        return;
		};
	    if(GetTime(iframeWin.$("#askEndDate").val())>GetTime(iframeWin.$("#answersEndDate").val())){
	    	parent.layer.alert("提出澄清截止时间不得晚于答复截止时间");  
	        return;
	    };
	    if(iframeWin.massage2==2){
          	parent.layer.alert("找不到该级别的审批人,请联系管理员");
	 		 return
        };
	    if(iframeWin.$("#employeeId").val()==""){
          	parent.layer.alert("请选择审核人");
	 		 return
       };
          iframeWin.form();
          $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
          parent.layer.close(index);
        },
        btn2:function(index,layero){
        	
        	 var iframeWins=layero.find('iframe')[0].contentWindow;
        	 iframeWins.forms();
        	 $('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
        },
        btn3:function(){
        	
        }  
     });       
}
//审核页面
function audit_btn2($index){
	var rowData=$('#table').bootstrapTable('getData');
    sessionStorage.setItem('purchaseaData', JSON.stringify(rowData[$index].id));	
	var key="";
    var height=$(window).height()*0.9;
	var width=$(window).width()*0.7;
    parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '查看'
        ,area: [width+'px', height+'px']
        ,content:auditPurchase2
        ,btn: ['关闭'] 
        //确定按钮
        ,yes: function(index,layero){        
          var iframeWin=layero.find('iframe')[0].contentWindow;         
          parent.layer.close(index);
        }
      });
};

function GetTime(time){
	var date=new Date(time).getTime();
	
	return date;
};