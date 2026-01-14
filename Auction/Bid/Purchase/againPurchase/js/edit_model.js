function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
 }
}
 var str = getQueryString("key");
 var pojectid=""//项目Id
 var sourceFundsId=""//资金来源Id
 var table_data="";//邀请供应商的拼接参数
 var Is_Public_data=[];//添加企业的数据信息
 var Package_data=[];//添加包件的基本数据
 var Check_data=new Array();//添加包件的添加评审项的数据
 var Check_add_data=[];//添加包件中的添加评价项的数据
 var PackageDetailed=[];//明细说明数组
 var BusinessPriceSet=[];//价格评审数组
 var PurchaserData=""//企业信息参数
 var PurchasePorjectData=""//项目参数
 var updatePurchase=config.bidhost+'/PurchaseController/savePurchase.do';//提交修改的接口
 var findPurchase=config.bidhost+'/PurchaseController/findPurchase.do';//项目信息的接口
  var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人的信息
 var findProjectSupplierList=config.bidhost+'/PurchaseController/findProjectSupplierList.do';//邀请供应商接口
 var findProjectPackage=config.bidhost+'/PurchaseController/findProjectPackage.do';//包件信息接口
 var saveProjectPackage=config.bidhost+'/PurchaseController/saveProjectPackage.do';//添加包件的接口
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
 var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
 var addsupplier='0502/Bid/Purchase/model/add_supplier.html';//邀请供应商的弹出框路径
 var eidteditpackage='0502/Bid/Purchase/model/eidtedit_package.html';
 var massage2=""
 //初始化
$(function(){
	Purchase();	
})
//提交修改
function form(){	
	$("input[name='project.projectState']").val(0)
	$.ajax({
	   	url:updatePurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){ 	   		
	   		parent.layer.alert("修改成功")	   			   	
	   	},
	   	error:function(){
	   		parent.layer.alert("修改失败")
	   	}
	  });
};
//提交修改
function formsm(){	
	$("input[name='project.projectState']").val(1);	
	$.ajax({
	   	url:updatePurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){ 	   		
	   		parent.layer.alert("修改成功")	   			   	
	   	},
	   	error:function(){
	   		parent.layer.alert("修改失败")
	   	}
	  });
};
//获取询价公告发布的数据
function Purchase(){
$.ajax({
   	url:findPurchase,
   	type:'get',
   	dataType:'json',
   	//contentType:'application/json;charset=UTF-8',
   	data:{
   		"id":str,
   		'enterpriseType':0,
   	},
   	success:function(data){
   		var table_data="";
   		if(data.rows.length>0){  			
   			pojectid=data.rows[0].projectId;
   			sourceFundsId=data.rows[0].sourceFundsId;//资金来源ID
   			PurchasePorjectData=data.rows[0]
   			$("#projectName").val(data.rows[0].project.projectName);
   			$("#projectCode").val(data.rows[0].project.projectCode);
   			$("#programmeName").val(data.rows[0].project.programmeName);  			
   			$("#programmeCode").val(data.rows[0].project.programmeCode);   			
   			$("#programmeAddress").val(data.rows[0].project.programmeAddress);
   			$('input[name="project.isAgent"]').eq(data.rows[0].project.isAgent).attr("checked",true);
            if(data.rows[0].project.isAgent==1){            	
            	$("#agencyName").val(data.rows[0].agencyName)
            	$("#agencyNames").html(data.rows[0].agencyName)
		   		$("#agencyAddress").val(data.rows[0].agencyAddress)
		   		$("#agencyLinkmen").val(data.rows[0].agencyLinkmen)
		   		$("#agencyTel").val(data.rows[0].agencyTel)
            }           
            isAgent(data.rows[0].project.isAgent)
   			$("#purchaserName").val(data.rows[0].purchaserName);
   			$("#purchaserNames").html(data.rows[0].purchaserName);
   			$("#purchaserAddress").val(data.rows[0].purchaserAddress);
   			$("#purchaserLinkmen").val(data.rows[0].purchaserLinkmen);
   			$("#purchaserTel").val(data.rows[0].purchaserTel);
            $("#projectSource option").eq(data.rows[0].project.projectSource).attr("selected",true);
            $("#projectType option").eq(data.rows[0].project.projectType).attr("selected",true);
            $("input[name='project.tenderType']").eq(data.rows[0].project.tenderType).attr("checked",true);
            $('supplierCount[name="supplierCount"] option').eq(data.rows[0].supplierCount).attr("selected",true);
            $("input[name='isPublic']").eq(data.rows[0].isPublic).attr("checked",true);          
            if(data.rows[0].isPublic>1){
            	 table_data='<thead><tr>'
	 		          +'<th>企业名称</th>'
	 		          +'<th>联系人</th>'
	 		          +'<th>联系电话</th>'
	 		          +'<th>认证状态</th>'
	 		          +'<th>通知时间</td>'
	 		          +'<th>确认状态</th>'
	 		          +'<th>操作</th>'
	 		          +'</tr></thead>'
	 		           Public();
	 		          if(Is_Public_data.length==0){
				 		  	table_data+='<tr><td colspan="7">暂无任何数据</td></tr>'	 		  	
				 	  };
	 		    $("#yao_table").html(table_data);      
            }; 
            Is_Public(data.rows[0].isPublic)
            $('#projectId').val(data.rows[0].projectId);
            $("#purchaseId").val(data.rows[0].id);
            $("#enterpriseId").val(data.rows[0].project.enterpriseId)
            $("textarea[name='content']").val(data.rows[0].content)
   			package();
   			sourceFunds();
   			 
   		}
   	}	
   });
   $.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		PurchaserData=data.data[0]
	   	}
 	});
}
var isPublic=""//所选公开范围的参数
function Is_Public(num){
	if(num>1){		
		$(".yao_btn").removeClass('none');
		$("#yao_table").removeClass('none');
	    Public()
		table_data+='<thead><tr>'
		      +'<th>企业名称</th>'
		      +'<th>联系人</th>'
		      +'<th>联系电话</th>'
		      +'<th>认证状态</th>'
		      +'<th>确认状态</td>'
	 		  +'<th>操作</th>'
		      +'</tr></thead>'	 		          
		      if(Is_Public_data.length==0){
		 		  	table_data+='<tr><td colspan="7">暂无任何数据</td></tr>'	 		  	
		 	  }
	 		    $("#yao_table").html(table_data);
	}else{
		$(".yao_btn").addClass('none');
		$("#yao_table").addClass('none');		
	};
	isPublic=num
};
function Public(){
	table_data="";
	$.ajax({
   	url:findProjectSupplierList,
   	type:'get',
   	dataType:'json',
   	//contentType:'application/json;charset=UTF-8',
   	data:{
   		"projectId":pojectid
   	},
   	success:function(data){  
   		var Publicid=[];
   		var pub=[];  	
   		if(data.data.length>0){   			
               sessionStorage.setItem('sadasd', JSON.stringify(data.data));
               $(".yao_btn").removeClass('none')
		       $("#yao_table").removeClass('none')
		       table_data='<thead><tr>'
	 		          +'<th>企业名称</th>'
	 		          +'<th>联系人</th>'
	 		          +'<th>联系电话</th>'
	 		          +'<th>认证状态</th>'
	 		          +'<th>确认状态</td>'
	 		          +'<th>操作</th>'
	 		          +'</tr></thead>'
	 		 Is_Public_data=JSON.parse(sessionStorage.getItem('sadasd'));	 		
             for(var i=0;i<Is_Public_data.length;i++){
             	table_data+='<input type="hidden" name="supplierId" value="'+Is_Public_data[i].supplierId +'"/>'
             	Publicid.push(Is_Public_data[i].supplierId);
             	pub.push(Is_Public_data[i].enterprise)
             	if(Is_Public_data[i].enterprise.enterpriseLevel==0){					
				   var	enterpriseLevel= "未认证"
				};
				if(Is_Public_data[i].enterprise.enterpriseLevel==1){					
					var	enterpriseLevel=  "提交认证"
				};
				if(Is_Public_data[i].enterprise.enterpriseLevel==2){					
					var	enterpriseLevel=  "受理认证"
				};
				if(Is_Public_data[i].enterprise.enterpriseLevel==3){
					var	enterpriseLevel=  "已认证"
				};
				if(Is_Public_data[i].enterprise.enterpriseLevel==4){
					var	enterpriseLevel=  "认证2"
				};
             	table_data+='<tr>'
   		          +'<td>'+Is_Public_data[i].enterprise.enterpriseName+'</td>'
   		          +'<td>'+Is_Public_data[i].enterprise.agent+'<input type="hidden" name="project.projectSuppliers['+ i +'].supplierId" value="'+Is_Public_data[i].supplierId +'"/></td>'
   		          +'<td>'+Is_Public_data[i].enterprise.agentTel+'</td>'
   		          +'<td>'+enterpriseLevel+'</td>'
   		          +'<td>未确认</td>'
   		          +'<td><a>查看</a><a onclick="supplierDelet('+ i+',this)">删除</a></td>'  		         
   		          +'</tr>'   		            		       
   		        }
             $("#yao_table").html(table_data)            
              sessionStorage.setItem('keysjd', JSON.stringify(Publicid));
   		}
   	}	
   });
	
}
function add_supplier(){
	var height=top.$(parent).height()*0.8;
	var width=top.$(parent).width()*0.6;
 	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加邀请供应商'
        ,area: ['700px', '650px']
        ,content:addsupplier
        ,btn: ['保存','取消'] 
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du(isPublic)
        }
        //确定按钮
        ,yes: function(index,layero){           
         var iframeWin=layero.find('iframe')[0].contentWindow;
         Is_Public_data=[];
         var table_data="";
         iframeWin.checkbox()                  
         //if(iframeWin.checkboxed.length>0){
         	 Is_Public_data=iframeWin.data;         	
         	 parent.layer.close(index);
               table_data='<thead><tr>'
	 		          +'<th>企业名称</th>'
	 		          +'<th>联系人</th>'
	 		          +'<th>联系电话</th>'
	 		          +'<th>认证状态</th>'
	 		          +'<th>确认状态</td>'
	 		          +'<th>操作</th>'
	 		          +'</tr></thead>'	
             for(var i=0;i<Is_Public_data.length;i++){            	
	             	if(Is_Public_data[i].enterprise.enterpriseLevel==0){					
					   var	enterpriseLevel= "未认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==1){					
						var	enterpriseLevel=  "提交认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==2){					
						var	enterpriseLevel=  "受理认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==3){
						var	enterpriseLevel=  "已认证"
					};
					if(Is_Public_data[i].enterprise.enterpriseLevel==4){
						var	enterpriseLevel=  "认证2"
					};
             	  table_data+='<tr>'
   		          +'<td>'+Is_Public_data[i].enterprise.enterpriseName +'</td>'
   		          +'<td>'+Is_Public_data[i].enterprise.agent +'<input type="hidden" name="project.projectSuppliers['+ i +'].supplierId" value="'+Is_Public_data[i].supplierId +'"/></td>'
   		          +'<td>'+Is_Public_data[i].enterprise.agentTel+'</td>'
   		          +'<td>'+enterpriseLevel+'</td>'
   		          +'<td>未确认</td>'
   		          +'<td><a>查看</a><a onclick="supplierDelet('+ i+',this)">删除</a></td>'
   		          +'</tr>'
   		        }
               $("#yao_table").html(table_data)
        },
        btn2:function(){
        	
        },        
      });
 }
//删除邀请供应商
function supplierDelet(i,dthis){
	Is_Public_data.splice(i,1);
	$(dthis).parent().parent().remove()	
}
function package(){
	$.ajax({
   	url:findProjectPackage,
   	type:'get',
   	dataType:'json',
   	//contentType:'application/json;charset=UTF-8',
   	data:{
   		"projectId":pojectid
   	},
   	success:function(data){   		
   		 var Tdr=""
   		if(data.rows.length>0){  			  			
   			 for(var i=0;i<data.rows.length;i++){ 
   			 	if(data.rows[i].checkPlan==0){
   			 		var checkPlans="综合评分法"
   			 	}else if(data.rows[i].checkPlan==1){
   			 		var checkPlans="最低价法"
   			 	}
   			  Tdr+='<tr>'
	     		+'<td>'+data.rows[i].packageName+'</td>'
	     		+'<td>'+checkPlans+'</td>'
	     		+'<td><a onclick=edit_bao(\"'+ data.rows[i].id +'\",'+i+','+ data.rows[i].checkPlan +')>编辑</a></td>'	     		
	     	    +'</tr>'	     	    
   			 }
   			  $("#tablebjb").html(Tdr)
   			
   			 
   		}
   	}	
  });    
};
 $('input[name="readwrite"]').on('click',function(){
 	if($(this).val()=='切换成为自动生成编码'){
 		$("#projectCode").attr("readOnly","true");
 		$("#projectCode").attr("placeholder","将自动生成编码");
 		$("#projectCode").val("");
 		$("#readonly").addClass('none');
 		$('#write').removeClass('none');
 	}else{
 		$("#projectCode").attr("readOnly",false);
 		$("#projectCode").attr("placeholder","");
 		$("#projectCode").val("");
 		$("#readonly").removeClass('none');
 		$('#write').addClass('none');
 	}
 })
//公告开始时间未选择时，截止时间无法选择
$("#noticeEndDate").on('focus',function(){
	if($("#noticeStartDate").val()==""||$("#noticeStartDate").val()==undefined){
		parent.layer.alert("请先选择公告开始时间");        		     		
     		
     	return;
	}
});
//提出澄清截止时间为设置时，答复截止时间无法选择
$("#answersEndDate").on('focus',function(){
	if($("#askEndDate").val()==""||$("#askEndDate").val()==undefined){
		parent.layer.alert("请先选择提出澄清截止时间");        		     		
     		
     	return;
	}
})
time();
function time(){
	//自定义格式
	//公告开始时间
	  laydate.render({
	    elem: '#noticeStartDate'	    
	    ,type: 'datetime'
	    //控件选择完毕后的回调,点击日期、清空、现在、确定均会触发。
		,done: function(value, date, endDate){		   	   
		    //公告截至时间
			laydate.render({
			    elem: '#noticeEndDate'
			    ,min:value
			    ,type: 'datetime'
			});
			
		}
	  });
	  //提出澄清截止时间
	  laydate.render({
	    elem: '#askEndDate'	   
	    ,type: 'datetime'
	    //控件选择完毕后的回调,点击日期、清空、现在、确定均会触发。
		,done: function(value, date, endDate){
		    //公告截至时间
		    $("#answersEndDate").val(value)
			laydate.render({
			    elem: '#answersEndDate'
			    ,min:value
			    ,type: 'datetime'
			});
		}
	  });
	  //报价截至时间
	   laydate.render({
	    elem: '#bidEndDate'	    
	    ,type: 'datetime'
	  });
	   //询价评审时间
	   laydate.render({
	    elem: '#checkEndDate'	   
	    ,type: 'datetime'
	  });
	  	
};
function edit_bao(uid,num,val){
	var kid="";
	var i="";
	var datas=[];
	var height=top.$(parent).height()*0.8;
	var width=top.$(parent).width()*0.6;
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改'
        ,area: [width+'px', height+'px']
        ,content:eidteditpackage+'?kid='+uid+'&i='+escape(num)
        ,btn: ['保存','取消']
        ,success:function(layero,index){    
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.du()        	
        }
        //确定按钮
        ,yes: function(index,layero){            
         var iframeWin=layero.find('iframe')[0].contentWindow;
         iframeWin.add_sdad();
         package();        
         parent.layer.close(index);
        },
        btn2:function(){       	
        },        
      });
}
//切换是否有代理人。
function isAgent(Num){
	if(Num==0){
		$('.agency').hide();
		$("#purchaserName").val(PurchasePorjectData.purchaserName);
		$("#purchaserNames").html(PurchasePorjectData.purchaserName);
		$("#purchaserAddress").val(PurchasePorjectData.purchaserAddress);
		$("#purchaserLinkmen").val(PurchasePorjectData.purchaserLinkmen);
		$("#purchaserTel").val(PurchasePorjectData.purchaserTel);
	}else{
		$('.agency').show();
		if(PurchasePorjectData.purchaserName!=""&&PurchasePorjectData.purchaserName!=undefined){
			$("#purchaserName").val(PurchasePorjectData.purchaserName);
			$("#purchaserNames").html(PurchasePorjectData.purchaserName);
			$("#purchaserAddress").val(PurchasePorjectData.purchaserAddress);
			$("#purchaserLinkmen").val(PurchasePorjectData.purchaserLinkmen);
			$("#purchaserTel").val(PurchasePorjectData.purchaserTel);
		}else{
			$("#purchaserName").val("");
			$("#purchaserNames").html("");
			$("#purchaserAddress").val("");
			$("#purchaserLinkmen").val("");
			$("#purchaserTel").val("");
		}
		if(PurchasePorjectData.agencyName!=""&&PurchasePorjectData.agencyName!=undefined){
			$("#agencyName").val(PurchasePorjectData.agencyName)
			$("#agencyNames").html(PurchasePorjectData.agencyName)
			$("#agencyAddress").val(PurchasePorjectData.agencyAddress)
			$("#agencyLinkmen").val(PurchasePorjectData.agencyLinkmen)
			$("#agencyTel").val(PurchasePorjectData.agencyTel)
		}else{
			$("#agencyName").val(PurchaserData.enterpriseName)
	        $("#agencyNames").html(PurchaserData.enterpriseName)
	   		$("#agencyAddress").val(PurchaserData.enterpriseAddress)
	   		$("#agencyLinkmen").val(PurchaserData.agent)
	   		$("#agencyTel").val(PurchaserData.agentTel)
		}
       
   		
	}
}

//资金来源数据获取
function sourceFunds(){	
	$.ajax({
		   	url:sourceFundsUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"optionName":"资金来源"
		   	},
		   	success:function(data){	
		   	   var option="";
		   	   var is=""
		   	   for(var i=0;i<data.data.length;i++){
		   	   	 option+='<option value="'+data.data[i].id+'">'+data.data[i].optionText+'</option>'		   	   	
		   	   	 if(sourceFundsId==data.data[i].id){		   	   	 	
		   	   	 	is=i
		   	   	 }
		   	   }
		   	   $("#sourceFunds").html(option);
		   	   $("#sourceFunds option").eq(is).attr("selected",true)
		   	}
	});
	//获取审核人列表
	//获取审核人列表
	$.ajax({
		   	url:WorkflowUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"workflowLevel":0,
		   		"workflowType":"xmgg"
		   	},
		   	success:function(data){			   	  
		   	   var option=""
		   	   //判断是否有审核人		   	 
		   	   if(data.message==0){
		   	   	 	parent.layer.alert("找不到该类型的审批设置，将默认为系统审核人审批");
		   	   	    $("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
		   	   	    $('.employee').hide()
		   	   	    return;
		   	   	};
		   	   if(data.message==2){		   	   	
		   	   	 	parent.layer.alert("找不到该级别的审批人,请先添加审批人");
		   	   	 	massage2=data.message;
	     	        return;
		   	   };
		   	   if(data.success==true){
		   	   	 $('.employee').show()
		   	   	 if(data.data.length==0){
			   	   	option='<option>暂无审核人员</option>'
			   	   }
			   	   if(data.data.length>0){
			   	   	workflowData=data.data
			   	   	option="<option value=''>请选择审核人员</option>"
			   	   	 for(var i=0;i<data.data.length;i++){
				   	   	 option+='<option value="'+data.data[i].employeeId+'">'+data.data[i].userName+'</option>'
				   	}
			   	   }		   	   			   	  			   	  
		   	   }		   	    
		   	   $("#employeeId").html(option);	
		   	}
	});
}