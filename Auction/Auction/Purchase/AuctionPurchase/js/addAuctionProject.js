 //保存
 var saveAuctionurl=config.AuctionHost+'/AuctionPurchaseController/saveProjectPurchase.do';
 var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
 var allProjectData=config.AuctionHost+'/AuctionPurchaseController/findAuctionProjectPurchase.do';//项目数据的接口；
 var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
 var isDf=false;
 var purchaseaData=[];
 var projectDataId;
 var PurchasersDataEnterprojectId="";
 var tenderProjectClassify = '',industriesType = '';//采购项目分类 项目行业分类 （需求dfdzcg-3822）
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
 $(function(){
	if(getUrlParam('isBack')){
	 	$('#btnHold').hide();
	}else{
	 	$('#btnHold').show();
	}
	if(getUrlParam('projectId')){
		projectDataId = getUrlParam('projectId');
		Purchase()
	}else{
		setProvince();
		setCity('420000');
		$("#Province").val('420000');
		$("#City").val('420100');
		$("#provinceName").val('湖北省');	
		$("#cityName").val('武汉市');
		Usersupplier();
		/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			selectCallback: function(code) {
				tenderProjectClassify = code;
			}
		});
		$("#industriesType").dataLinkage({
			optionName: "INDUSTRIES_TYPE",
			selectCallback: function(code) {
				industriesType = code;
			}
		});
		/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）  -end        ********** */
	}
	//设置项目组成员
	$('#projectMember').AddMembers({
		businessId:projectDataId?projectDataId:'',
		status:1,//1编辑   2 查看  3 采购人专区的代理项目
	});
	$("#browserUrl").attr('href',siteInfo.portalSite);
    $("#browserUrl").html(siteInfo.portalSite);
	$("#webTitle").html(siteInfo.sysTitle);
	// 临时保存
	$("#btnHold").on('click',function(){
		if($("#projectName").val() == "") {
			parent.layer.alert("采购项目名称不能为空")
			return ;
		};
		if($("#projectName").val().length >70) {
			parent.layer.alert("采购项目名称过长");
			return ;
		};

		if($("#projectCode").val()!='' && $("#projectCode").val().length>30) {
			parent.layer.alert("采购项目编号过长")
			return ;
		};

		if($("#programmeName").val()!='' && $("#programmeName").val().length>70) {
			parent.layer.alert("项目名称过长")
			return ;
		};

		if($("#programmeCode").val()!='' && $("#programmeCode").val().length>70) {
			parent.layer.alert("项目编号过长")
			return ;
		};

		if($("#programmeAddress").val()!='' && $("#programmeAddress").val().length>70) {
			parent.layer.alert("项目地址过长")
			return ;
		};

		my_data(4)
	})
	// 当前登陆人是否属于指定企业
	var arrlist = sysEnterpriseId.split(',');
	if(arrlist.indexOf(top.enterpriseId)!=-1){
		isDf=true//是
		$("#projectCode").attr('readonly',true);
		$("#projectCodeTr").attr('colspan','3');
		$(".codeTitle").hide();
		$("#projectCode").val("");
	}else{	
		isDf=false;//否
		$("#projectCode").attr('readonly',false);
		$("#projectCodeTr").attr('colspan','1');
		$(".codeTitle").show();
	}
	// 提交下一步
	$("#btnSave").on('click',function(){
		if($("#projectName").val() == "") {
			parent.layer.alert("采购项目名称不能为空")
			return ;
		};	
		if($("#projectName").val().length >70) {
			parent.layer.alert("采购项目名称过长");
			return ;
		};
		if(!isDf){
			if($("#projectCode").val()=='') {
				parent.layer.alert("采购项目编号不能为空")
				return ;
			};
		}
		if($("#projectCode").val()!='' && $("#projectCode").val().length>30) {
			parent.layer.alert("采购项目编号过长")
			return ;
		};

		if($("#programmeName").val()!='' && $("#programmeName").val().length>70) {
			parent.layer.alert("项目名称过长")
			return ;
		};

		if($("#programmeCode").val()!='' && $("#programmeCode").val().length>70) {
			parent.layer.alert("项目编号过长")
			return ;
		};

		if($("#programmeAddress").val()!='' && $("#programmeAddress").val().length>70) {
			parent.layer.alert("项目地址过长")
			return ;
		};

		if($("#ppurchaserName").val() == "") {	
			parent.layer.alert("采购人不能为空，请选择采购人")
			return ;	
		};
		if($("#purchaserLinkmen").val()==""){
			parent.layer.alert("请选择联系人")
			return ; 
		};
		if($("#Province").val()==""){
			parent.layer.alert("请选择省");
			return;
		}
		if($("#City").val()==""){
			parent.layer.alert("请选择市");
			return;
		}



		my_data(5);		
	})
	 /*关闭*/
	$('#btnClose').click(function(){
        var index=top.parent.layer.getFrameIndex(window.name);
        top.parent.layer.close(index);
	});
	//公开范围
	$("input[name='isPublics']").on('click',function(){
		if($(this).val()==0){
			$("input[name='isPublic'][value='0']").prop("checked",true);
			$('.isPublics0').show();
			$('.isPublics1').hide();
			$(".yao_btn").hide();	
		}else if($(this).val()==1){
			$("input[name='isPublic'][value='2']").prop("checked",true);
			$('.isPublics1').show();
			$('.isPublics0').hide();
			$(".yao_btn").show();			
		}
		$(".isPublics3").hide();
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
	});
	//供应商分类
	$("#CODENAME").on("click",function(){		
		var purchaserId=$("#purchaserId").val();
		parent.layer.open({
			type: 2 //此处以iframe举例
			,title: '选择供应商分类'
			,area: ['400px', '600px']
			,content:'view/Bid/PurchaserSupplier/classification.html?type=choose&purchaserId='+purchaserId		            
		});
	})
	$("input[name='isPublic']").on('change',function(){		
		if($(this).val()==3){
			$('.isPublics3').show();
		}else{
			$('.isPublics3').hide();
			$("#CODENAME").val("");
			$("#supplierClassifyCode").val("");
		}	
	});
});
function Purchase(){
	$.ajax({
		url:allProjectData,
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:{
			'projectId':projectDataId
		},
		success:function(data){	   		
			//项目数据
			 purchaseaData=data.data;		    
		},
		error:function(data){
			parent.layer.alert("修改失败")
		}
	  });
	$('div[id]').each(function(){
		if(this.id != 'tenderProjectClassify' && this.id != 'industriesType'){
			$(this).html(purchaseaData[this.id]);  
		}
	});
	$('input[id]').each(function(){       
		$(this).val(purchaseaData[this.id]);   
	});
	setProvince();
	setCity(purchaseaData.province||'42');
	$("#Province").val(purchaseaData.province||'42');	
	$("#City").val(purchaseaData.city||'4201');
	$("#provinceName").val(purchaseaData.provinceName||'湖北省');	
	$("#cityName").val(purchaseaData.cityName||'武汉市');
	$("#projectId").val(purchaseaData.projectId);
	$("#purchaseId").val(purchaseaData.id);
	$("#tenderType").val(1);
	$("#projectSource").val(0);
	$("#projectType").val(purchaseaData.projectType);
	if(purchaseaData.projectType==0){		
	    $('.engineering').show()
	}else{
		$('.engineering').hide()
	};
	//采购人信息
	$("#purchaserId").val(purchaseaData.purchaserId);
	$("#purchaserName").val(purchaseaData.purchaserName);
	$("#purchaserNames").html(purchaseaData.purchaserName);
	$("#purchaserAddress").val(purchaseaData.purchaserAddress);
	$("#purchaserLinkmen").val(purchaseaData.purchaserLinkmen);
	$("#purchaserTel").val(purchaseaData.purchaserTel);
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）          ********** */
	$("#tenderProjectClassify").dataLinkage({
		optionName: "SYS_PROJECT_CLASSIFY",
		optionValue: purchaseaData.tenderProjectClassify ? purchaseaData.tenderProjectClassify : "",
		selectCallback: function(code) {
			tenderProjectClassify = code;
		}
	});
	$("#industriesType").dataLinkage({
		optionName: "INDUSTRIES_TYPE",
		optionValue: purchaseaData.industriesType ? purchaseaData.industriesType : "",
		selectCallback: function(code) {
			industriesType = code;
		}
	});
	/* *************        采购项目分类、项目行业分类 （需求dfdzcg-3822）  -end        ********** */
}

  //临时保存
 function my_data(type){
	$("#projectState").val(type);
	$("input[name='project.tenderProjectClassify']").val(tenderProjectClassify);
	$("input[name='project.industriesType']").val(industriesType);
    $.ajax({
	   	url:saveAuctionurl,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#form").serialize(),
	   	success:function(data){ 
	   		if(data.success){	
				if(type==4){
					projectDataId=data.data;
					Purchase()
					parent.layer.alert("添加成功");
				}else{
					nextNotice(data.data);					
				}	   			
	   			parent.$('#table').bootstrapTable(('refresh'));
        		   
	   		}else{
	   			parent.layer.alert(data.message);
	   		}
	   		
	   	},
	   	error:function(data){
	   		parent.layer.alert("添加失败")
	   	}
	});
}
function nextNotice(projectId){
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '编辑公告'
		,area: ['1100px','650px']
		,id:'packageclass'
	    ,content:'Auction/Auction/Purchase/AuctionPurchase/model/AuctionInfo.html?projectId='+projectId
	    //,btn: ['关闭']
	    ,maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸   
	});
	var $index=top.parent.layer.getFrameIndex(window.name);
	top.parent.layer.close($index);
}
//项目类型为工程类时显示建设工程名字等内容
$("#projectType").on('change',function(){
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
	// 	}else{
	// 		$("#projectCode").attr('readonly',false);
	// 		$("#projectCodeTr").attr('colspan','1');
	// 		$(".codeTitle").show();
	// 	}
	// }
});

//获取当前登录人的企业信息
function Usersupplier(){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
			   if(data.success){
				$("#purchaserId").val(data.data.danweiguid);
				$("#purchaserName").val(data.data.legalName);
				$("#purchaserNames").html(data.data.legalName);
				$("#purchaserAddress").val(data.data.legalUnitAddress);
				$("#purchaserLinkmen").val(top.userName);
				$("#purchaserTel").val(top.userTel);
			   }	
	   	}
	});    
};

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