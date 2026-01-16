
 var updatePurchase=config.bidhost+'/PurchaseController/savePurchase.do';//提交修改的接口
 var WorkflowUrl=config.bidhost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
 var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
 var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
 var pricedelete=config.bidhost +'/ProjectPriceController/deleteProjectPriceByPackage.do'//费用删除
 var wordTest=config.bidhost +'/WordConversionController/showTestFirst.do'//自定义模接口
 var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人的信息
 var sourceFundsId = ""; //资金来源Id
 var enterpriseList;
 var isDf=false;//是否是工程或是咨询企业
 //初始化
$(function(){
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:'',
		status: 1,//1编辑   2 查看  
	});
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		enterpriseList=data.data ;//缓存综合发添加的tabs的数组	   		
	   	}
	});  
	setProvince();
	setCity('42');
	$('#agencyName').val(enterpriseList.legalName);
	$('#agencyNames').html(enterpriseList.legalName);
	$('#agencyId').val(enterpriseList.danweiguid);
	$('#agencyAddress').val(enterpriseList.legalUnitAddress);
	$('#agencyLinkmen').val(top.userName);
	$('#agencyTel').val(top.userTel);
	$("#Province").val('42');
	$("#City").val('4201');
	$("#provinceName").val('湖北省');	
	$("#cityName").val('武汉市');	
	sourceFunds();
	//是否是工程或是咨询企业
	if(sysEnterpriseId){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			$("#projectCode").attr('readonly',true);
			$("#projectCodeTr").attr('colspan','3');
			$(".codeTitle").hide();
			isDf=true//是
		}else{
			$("#projectCode").attr('readonly',false);
			$("#projectCodeTr").attr('colspan','1');
			$(".codeTitle").show();
			isDf=false;//否
		}
	}	
})
//提交修改
function form(){	
	$("input[name='project.projectState']").val(0);
	$.ajax({
	   	url:updatePurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){
	   		if(data.success==true){	 
	   		    parent.layer.alert("保存成功");
	   		    $("#projectId").val(data.data.project.id);
	   		    $("#projectCode").val(data.data.project.projectCode)
	   		    $("#purchaseId").val(data.data.id);
	   		    parent.$('#table').bootstrapTable(('refresh')); 
	   		    
	   		}else{
	   			parent.layer.alert(data.message)	
	   		}
	   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("保存失败")
	   	}
	  });
};
//修改并提交
function formsm(){	
	$("input[name='project.projectState']").val(2);		
	$.ajax({
	   	url:updatePurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){ 	   		
	   		if(data.success==true){	 
				parent.layer.close(parent.layer.getFrameIndex(window.name));
	   		    parent.layer.alert("确认成功！")	   		   
				parent.$('#table').bootstrapTable(('refresh')); 
	   		}else{
	   			parent.layer.alert(data.message)	
	   		}	   			   	
	   	},
	   	error:function(){
	   		parent.layer.alert("确认失败！")
	   	}
	  });
};
//项目类型为工程类时显示建设工程名字等内容
$("#engineering").on('change',function(){
	if($(this).val()==0){
		$('.engineering').show();
	}else{
		$('.engineering').hide();
	}	
});
//资金来源数据获取
function sourceFunds(){	
	$.ajax({
		   	url:sourceFundsUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data:{
		   		"optionName":"MONEY_FROM"
		   	},
		   	success:function(data){	
		   	   var option="";
		   	   var is="";		   	  
		   	   for(var i=0;i<data.data.length;i++){
					if(data.data[i].optionText=="自筹资金"){
						option+='<option value="'+data.data[i].id+'" selected="selected">'+data.data[i].optionText+'</option>'	
					}else{
						option+='<option value="'+data.data[i].id+'">'+data.data[i].optionText+'</option>'	 
					} 		   	   		   	   			   	   	 
		   	   }
		   	   $("#sourceFunds").html(option);		   	   
		   	}
	});
}
var PurchasersDataEnterprojectId="";
//选择采购人
function chosePucharse(){		
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '选择采购人'
	    ,area: ['1100px','650px']
	    ,content:'Auction/common/Agent/Purchase/model/Purchasers.html'
	    //,btn: ['关闭']
	    ,maxmin: true //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸
	    ,success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow;
	    	iframeWind.du(PurchasersDataEnterprojectId)
	    }
	    //确定按钮
//	    ,yes: function(index,layero){            
//	     	var iframeWin=layero.find('iframe')[0].contentWindow;
//	     	var PurchasersData = iframeWin.PurchasersData;	     	
//	     	if(PurchasersData!=""){	
//	     	};	     	
//	        parent.layer.close(index);
//	    },
        
  });
}

function showPurchse(PurchasersData){	
	PurchasersDataEnterprojectId=PurchasersData.enterpriseId
	$("#purchaserId").val(PurchasersData.enterpriseId);
	$("#purchaserName").text(PurchasersData.enterprise.enterpriseName);
	$("#purchaserAddress").text(PurchasersData.enterprise.enterpriseAddress);	
	$("#ppurchaserName").val(PurchasersData.enterprise.enterpriseName);
	$("#ppurchaserAddress").val(PurchasersData.enterprise.enterpriseAddress);
	$("#ppurchaserLinkmen").val(PurchasersData.enterprise.enterprisePerson);
	$("#ppurchaserTel").val("");
	$("#purchaserLinkmen").val("");
}
//审核确定按钮
$("#btn_submit").click(function() {
	var fapiao = /^(0[0-9][0-9][0-9]|0[0-9][0-9]|1[3-9][0-9])\d{8}$/; //手机,座机
	if($("#projectName").val()==""){
	 	parent.layer.alert("采购项目名称不能为空");
	 	return;
	};
	if($("#projectName").val().length>100){
	 	parent.layer.alert("采购项目名称长度不能超过100个字");
	 	return;
	};
	if(!$('[name="project.isSubpackage"]:checked').val()){
		parent.layer.alert("请选择是否分包件");
		return;
	}
	if ($("#programmeAddress").val().length>100) {
		parent.layer.alert("项目地址长度不能超过100个字");
	 	return;	
	}
	if($("#agencyLinkmen").val()==""){
	 	parent.layer.alert("代理机构联系人不能为空");
	 	return;
	}else{
		if($("#agencyLinkmen").val().length>100){
		 	parent.layer.alert("代理机构联系人过长");
		 	return;
		}
	}
	if($("#agencyTel").val()==""){
	 	parent.layer.alert("请输入代理机构联系电话");
	 	return;
	}else{
		if(!fapiao.test($("#agencyTel").val())){
		 	parent.layer.alert("请输入正确代理机构联系电话");
		 	return;
		}
	}
	if($("#Province").val()==""){
		parent.layer.alert("请选择省");
		return;
	}
	if($("#City").val()==""){
		parent.layer.alert("请选择市");
		return;
    }
	if($("#ppurchaserName").val()==""){
	 	parent.layer.alert("请选择采购人");
	 	return;
	};
	if($("#purchaserLinkmen").val()==""){
	 	parent.layer.alert("请选择采购联系人");
	 	return;
	};
	if($("#purchaserLinkmenId").val()==""){
	 	parent.layer.alert("请重新选择采购联系人");
	 	return;
	};
	if($("#ppurchaserTel").val()==""){
	 	parent.layer.alert("请输入联系电话");
	 	return;
	}else{
		if(!fapiao.test($("#ppurchaserTel").val())){
		 	parent.layer.alert("请输入正确联系电话");
		 	return;
		}
	}
	formsm();
	
});
//保存
$("#btn_bao").click(function() {
	if($("#projectName").val()==""){
 		parent.layer.alert("采购项目名称不能为空");
 		return;
	};
	if($("#projectName").val().length>100){
	 	parent.layer.alert("采购项目名称长度不能超过100个字");
	 	return;
	};
	if ($("#programmeAddress").val().length>100) {
		parent.layer.alert("项目地址长度不能超过100个字");
	 	return;	
	}
	form()
});
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
/*
 * 2018-11-08
 * 选择联系人(竞卖,采购) 
 */
$("#purchaserLinkmen").click(function(){
	if($("#purchaserId").val()==""){
		parent.layer.alert("请选择采购人");
		return;
	}
	parent.layer.open({
		type: 2,
		area: ['800px', '550px'],
		maxmin: true, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "选择联系人",
		// btn:["确定","取消"],
		content: 'Auction/common/Agent/Purchase/purchasermenList.html?enterpriseId='+$("#purchaserId").val(),
		success: function(layero,index){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			iframeWin.passMessage(function(data){
				if(data != null &&　data.length>0){
					$("#purchaserLinkmen").val(data[0].userName);
					$("#purchaserLinkmenId").val(data[0].id);	     		
					$("#ppurchaserTel").val(data[0].tel);
				}
			})
		},
		yes:function(index,layero){
			/* var iframeWin=layero.find('iframe')[0].contentWindow;
			var PurchasersData = iframeWin.$('#userList').bootstrapTable('getSelections');			
	     	if(PurchasersData != null &&　PurchasersData.length>0){
	     		$("#purchaserLinkmen").val(PurchasersData[0].userName);
	     		$("#purchaserLinkmenId").val(PurchasersData[0].id);	     		
	     		$("#ppurchaserTel").val(PurchasersData[0].tel);
	     	}
	     	parent.layer.close(index); */
		}
	})
});
