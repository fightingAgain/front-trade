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
var oldProjectId='';
var tenderProjectClassify = '',industriesType = '';//采购项目分类 项目行业分类 （需求dfdzcg-3822）
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
	})
})
//提交修改
function form(){
	$('[name="project.isSubpackage"]').attr('disabled',false);
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
			if(oldProjectId != ''){//推送的项目
				$('[name="project.isSubpackage"]').attr('disabled','disabled')
			};
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
	$('[name="project.isSubpackage"]').attr('disabled',false);
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
			if(oldProjectId != ''){//推送的项目
				$('[name="project.isSubpackage"]').attr('disabled','disabled');
			};
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
			if(projectData.oldProjectId){//推送的项目
				oldProjectId = projectData.oldProjectId;
				$('#viewPushInfo').show();
				$('[name="project.isSubpackage"]').attr('disabled','disabled');
			};
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
		$("#purchaserName").text(projectData.purchaserName);
		$("#purchaserId").val(projectData.purchaserId);
		$("#examType").val(projectData.examType?projectData.examType:'1');
		setProvince();
		setCity(projectData.province||'42');
		$("#Province").val(projectData.province||'42');	
		$("#City").val(projectData.city||'4201');	
		$("#provinceName").val(projectData.provinceName||'湖北省');	
		$("#cityName").val(projectData.cityName||'武汉市');	
		if(projectData.purchaserId!=undefined){
			sessionStorage.setItem("PurchasersData_data", JSON.stringify(projectData.purchaserId));
		}		
		$("#purchaserAddress").text(projectData.purchaserAddress);
		$("#purchaserLinkmen").val(projectData.purchaserLinkmen);
		$("#purchaserLinkmenId").val(projectData.purchaserLinkmenId);
		$("#purchaserTel").text(projectData.purchaserTel);
		$("#ppurchaserName").val(projectData.purchaserName);
		$("#ppurchaserAddress").val(projectData.purchaserAddress);
		$("#ppurchaserLinkmen").val(projectData.purchaserLinkmen);
		$("#ppurchaserTel").val(projectData.purchaserTel);		
		if(projectData.agencyName!=""&&projectData.agencyName!=undefined){
			$("#agencyNames").text(projectData.agencyName);
			$("#agencyName").val(projectData.agencyName);
			$("#agencyId").val(projectData.agencyId);
			$("#agencyAddress").val(projectData.agencyAddress);
			$("#agencyLinkmen").val(projectData.agencyLinkmen);
			$("#agencyTel").val(projectData.agencyTel);
		}else{
			var enterpriseList=JSON.parse(sessionStorage.getItem('QYXX'));//读取明细说明的数组的缓存
			$('#agencyName').val(enterpriseList.enterpriseName)
	   		$('#agencyNames').html(enterpriseList.enterpriseName)
	   		$('#agencyId').val(enterpriseList.id)
	   		$('#agencyAddress').val(enterpriseList.enterpriseAddress)
	   		$('#agencyLinkmen').val(enterpriseList.legalPerson)
	   		$('#agencyTel').val(enterpriseList.regTel)
		}
		$('input[name="settingNotice"][value="'+projectData.settingNotice+'"]').attr("checked",true);
		$('input[name="project.projectSource"]').val(projectData.projectSource);
		if(projectData.isSubpackage != undefined){
			$('input[name="project.isSubpackage"]').val([projectData.isSubpackage]);
		}
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
//项目类型为工程类时显示建设工程名字等内容
$("#engineering").on('change',function(){
	if($(this).val()==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
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
	    ,content:'Auction/common/Agent/Purchase/model/Purchasers.html'
	    //,btn: ['关闭']
	    ,maxmin: true //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
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
	if($("#Province").val()==""){
		parent.layer.alert("请选择省");
		return;
	}
	if($("#City").val()==""){
		parent.layer.alert("请选择市");
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
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var PurchasersData = iframeWin.$('#userList').bootstrapTable('getSelections');			
	     	if(PurchasersData != null &&　PurchasersData.length>0){
	     		$("#purchaserLinkmen").val(PurchasersData[0].userName);
	     		$("#purchaserLinkmenId").val(PurchasersData[0].id);	     		
	     		$("#ppurchaserTel").val(PurchasersData[0].tel);
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
/* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, projectData.bidValue1)
});