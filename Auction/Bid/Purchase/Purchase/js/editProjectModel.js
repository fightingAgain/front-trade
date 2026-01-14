 var sourceFundsId=""//资金来源Id
 var findPurchaseUrl=config.bidhost + '/ProjectReviewController/findProjectInfo.do'//根据项目ID获取所有项目信息内容
 var updatePurchase=config.bidhost+'/PurchaseController/savePurchase.do';//提交修改的接口
 var saveProjectPackage=config.bidhost+'/PurchaseController/saveProjectPackage.do';//添加包件的接口
 var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
//该条数据的项目id
var projectDataID=getUrlParam("projectId");

var projectData=[];
//包件信息
var packageInfo =[];

var sourceFundsId = ""; //资金来源Id
var isDf=false;//是否是东风工程或是东风咨询企业
var tenderProjectClassify = '',industriesType = '';//采购项目分类 项目行业分类 （需求dfdzcg-3822)
 //初始化
$(function(){
	//是否是东风工程或是东风咨询企业
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
	Purchase();
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectDataID,
		status: 1,//1编辑   2 查看  
	});
})
//提交修改
function form(){	
	$("input[name='project.projectState']").val(0);
	$("input[name='project.tenderProjectClassify']").val(tenderProjectClassify);
	$("input[name='project.industriesType']").val(industriesType);
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
	$("input[name='project.tenderProjectClassify']").val(tenderProjectClassify);
	$("input[name='project.industriesType']").val(industriesType);
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
	   		    parent.layer.alert("确认成功！");	   		    
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

//获取询比公告发布的数据
function Purchase(){	
	$.ajax({
		url: findPurchaseUrl+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'projectId':projectDataID,
			
		},
		success: function(data) {			
			projectData=data.data;
			PurchaseData();				
			sourceFundsId = projectData.sourceFundsId; //资金来源Id		
		}
	});	
    sourceFunds();
};

function PurchaseData(){
	$("#projectName").val(projectData.projectName);
	$("#projectCode").val(projectData.projectCode);
	$("#programmeName").val(projectData.programmeName);  			
	$("#programmeCode").val(projectData.programmeCode);   			
	$("#programmeAddress").val(projectData.programmeAddress);
	$('input[name="project.isAgent"]').eq(projectData.isAgent).attr("checked",true);      
	$("#tenderType").val(projectData.tenderType);				
	$("#purchaserName").html(projectData.purchaserName);
	$("#purchaserNames").val(projectData.purchaserName);
	$("#purchaserId").val(projectData.purchaserId);
	$("#purchaserAddress").val(projectData.purchaserAddress);
	$("#purchaserLinkmenId").val(projectData.purchaserLinkmenId);
	$("#purchaserLinkmen").val(projectData.purchaserLinkmen);
	$("#purchaserTel").val(projectData.purchaserTel);		
	$("#examType").val(projectData.examType);
	setProvince();
	setCity(projectData.province||'42');
	$("#Province").val(projectData.province||'42');	
	$("#City").val(projectData.city||'4201');	
	$("#provinceName").val(projectData.provinceName||'湖北省');	
	$("#cityName").val(projectData.cityName||'武汉市');				
	$('input[name="settingNotice"][value="'+projectData.settingNotice+'"]').attr("checked",true);
	$('input[name="project.isSubpackage"][value="'+projectData.isSubpackage+'"]').attr("checked",true);
		if (projectData.oldProjectId) {
			$('.isAssignProject').show();
		}
	$('input[name="project.projectSource"]').val(projectData.projectSource)
	$("#projectSource").html(projectData.projectSourceText)  
	$("#projectType option").eq(projectData.projectType).attr("selected",true);
	if(projectData.projectType==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}
	$('#engineering option').eq(projectData.projectType).attr("selected",true);         
	$('#projectId').val(projectDataID);
	$("#purchaseId").val(projectData.purchaseId);
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	$("#tenderProjectClassify").dataLinkage({
		optionName: "SYS_PROJECT_CLASSIFY",
		optionValue: projectData.tenderProjectClassify ? projectData.tenderProjectClassify : "",
		selectCallback: function(code) {
			tenderProjectClassify = code;
		}
	});
	$("#industriesType").dataLinkage({
		optionName: "INDUSTRIES_TYPE",
		optionValue: projectData.industriesType ? projectData.industriesType : "",
		selectCallback: function(code) {
			industriesType = code;
		}
	});
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）  -end        ********** */
        
}

// 查看派项信息
$('#btn_view_assign_project').click(function() {
	var detailHtml = 'view/AppointSelf/appointInfoDetail.html';
	parent.layer.open({
		type: 2,
		area: ['1000px', '600px'],
		maxmin: false,
		resize: false,
		title: projectData.projectName,
		btn: false,
		content: detailHtml + '?projectId=' + projectData.projectId + '&oldProjectId=' + projectData.oldProjectId,
		yes:function(index, layero){
			parent.layer.close(index);
		}
	})
})

//项目类型为工程类时显示建设工程名字等内容
$("#engineering").on('change',function(){
	if($(this).val()==0){
		$('.engineering').show();
	}else{
		$('.engineering').hide();
	}
	// if(isDf==true){
	// 	if($(this).val()==3){
	// 		$("#projectCode").attr('readonly',true);
	// 		$("#projectCodeTr").attr('colspan','3');
	// 		$(".codeTitle").hide();
	// 		$("#projectCode").val("");
	// 	}else{
	// 		$("#projectCode").attr('readonly',false);
	// 		$("#projectCodeTr").attr('colspan','1');
	// 		$(".codeTitle").show();
	// 	}
	// }	
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
		   	     option+='<option value="'+data.data[i].id+'">'+data.data[i].optionText+'</option>'			   	   		   	   	
		   	   	 if(sourceFundsId==data.data[i].id){		   	   	 	
		   	   	 	is=i
		   	   	 }else if(sourceFundsId==undefined){
		   	   	 	is=7
		   	   	 }
		   	   }
		   	   $("#sourceFunds").html(option);
		   	   $("#sourceFunds option").eq(is).attr("selected",true)
		   	}
	});
	
}

var PurchasersDataEnterprojectId="";
//选择采购人
function chosePucharses(){		
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '选择采购人'
	    ,area: ['1000px','600px']
	    ,content:'Auction/common/Purchase/Purchase/model/Purchasers.html'
	    //,btn: ['关闭']
	    ,maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸
	    ,success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow;
	    	iframeWind.du(PurchasersDataEnterprojectId)
	    }
        
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
	if($("#ppurchaserName").val()==""){
	 	parent.layer.alert("请选择采购人");
	 	return;
	};
	if($("#purchaserLinkmen").val()==""){
	 	parent.layer.alert("请选择联系人");
	 	return;
	};
	if($("#purchaserTel").val()==""){
	 	parent.layer.alert("请输入联系电话");
	 	return;
	}else{
		if(!fapiao.test($("#purchaserTel").val())){
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
		area: ['1000px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "选择联系人",
		btn:["确定","取消"],
		content: 'Auction/common/Purchase/Purchase/purchasermenList.html?enterpriseId='+$("#purchaserId").val(),
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var PurchasersData = iframeWin.$('#userList').bootstrapTable('getSelections');			
	     	if(PurchasersData != null &&　PurchasersData.length>0){
	     		$("#purchaserLinkmen").val(PurchasersData[0].userName);
	     		$("#purchaserLinkmenId").val(PurchasersData[0].id);	     		
	     		$("#purchaserTel").val(PurchasersData[0].tel);
	     	}
	     	parent.layer.close(index);
		}
	})
})
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}