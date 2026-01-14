var purchaseaData="";
var packageData=[];//包件的数据容器
var publicDatas=[];//邀请供应商数据的容器
var DetailedData=[];//设备信息的数据容器
var sourceFundsId=""//资金来源Id
var PurchaserData=""//企业信息参数
var massage2=""//
var typeIdList="";//媒体的ID
var typeNameList="";//媒体名字
var typeCodeList="";//媒体编号
var projectCode="";//切换手写或自动生成编码
var itemTypeId=[]//媒体ID
var itemTypeName=[]//媒体名字
var itemTypeCode=[]//媒体编号

//费用信息
var projectPriceInfo = [];
$(function(){
	new UEditorEdit({
		contentKey:'content',
	})
	Purchase();	
	du();
	medias();
	time();	
	$("#browserUrl").attr('href',siteInfo.portalSite);
    $("#browserUrl").html(siteInfo.portalSite);
    $("#webTitle").html(siteInfo.sysTitle)
});
var addpackageurl='Auction/Auction/Agent/AuctionPurchase/model/addAuctionPackage.html';
var editpackageurl='Auction/Auction/Agent/AuctionPurchase/model/editAuctionPackage.html';
//获取该项目下的所有数据的接口
var pricedelete=config.AuctionHost +'/ProjectPriceController/deleteProjectPriceByPackage.do'//费用删除
var allProjectData=config.AuctionHost+'/ProjectReviewController/findAutionPurchaseInfo.do';//项目数据的接口
var updateAuctionPurchase=config.AuctionHost+'/AuctionPurchaseController/saveAuctionPurchase.do';//提交修改数据
var sourceFundsUrl=config.Syshost+"/OptionsController/list.do";//资金来源接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findEnterpriseInfo=config.Syshost+'/EnterpriseController/findEnterpriseInfo.do'//当前登录人信息
var WorkflowUrl=config.AuctionHost+"/WorkflowController/findWorkflowCheckerByType.do"//项目审核人列表数据接口
var saveProjectPackage=config.AuctionHost+"/AuctionProjectPackageController/saveAuctionProjectPackage.do"
var deletProjectUrl=config.AuctionHost+"/AuctionProjectPackageController/deleteProjectPackage.do"
var isCheck;
var projectDataID = getUrlParam('projectId');
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
var isDf=false;//是否是东风工程或是东风咨询企业
//提交审核
$("#btn_submit").click(function() {
	if(!mediaEditor.isValidate()){
		return
	}
	$("#content").val(ue.getContent()) 
	
	if(text()){
		parent.layer.alert(text());		
		return
	}
	form();
})
function form(){
	//formd()
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero) {
			$('input[name="project.projectState"]').val(1) //审核状态0为临时保存，1为提交审核
			// 时间处理
			var vmForm = $("#form");
			['noticeEndDate', 'endDate'].forEach(function(key) {
				var value = vmForm.find('#' + key).val();
				if (value && value.length == 16) {
					vmForm.find('#' + key).val(value + ':59')
				}
			})
			$.ajax({
				url: updateAuctionPurchase,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: vmForm.serialize(),
				success: function(data) {
					if(data.success == true) {
						top.layer.closeAll();
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						top.layer.alert("提交审核成功");
					} else {
						top.layer.alert(data.message);
					}
				},
				error: function(data) {
					top.layer.alert("提交审核失败")
				}
			});			 
		})
	} else {
		$('input[name="project.projectState"]').val(1) //审核状态0为临时保存，1为提交审核
		$("#content").val(ue.getContent()) 
		// 时间处理
		var vmForm = $("#form");
		['noticeEndDate', 'endDate'].forEach(function(key) {
			var value = vmForm.find('#' + key).val();
			if (value && value.length == 16) {
				vmForm.find('#' + key).val(value + ':59')
			}
		})
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: vmForm.serialize(),
			success: function(data) {
				if(data.success == true) {
					top.layer.closeAll();
					parent.layer.alert("提交审核成功");
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function(data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}
}

//临时保存
$("#btn_bao").click(function() {
	if($("#projectName").val() == "") {
		parent.layer.alert("采购项目名称不能为空");
		return ;
	};
	forms();
		
})
//退出
$("#btn_close").click(function() {
	parent.layer.closeAll()
})
function forms(){
	$('input[name="project.projectState"]').val(0)//审核状态0为临时保存，1为提交审核
	$("#content").val(ue.getContent())

	// 时间处理
	var vmForm = $("#form");
	['noticeEndDate', 'endDate'].forEach(function(key) {
		var value = vmForm.find('#' + key).val();
		if (value && value.length == 16) {
			vmForm.find('#' + key).val(value + ':59')
		}
	})
	//formd()
	$.ajax({
	   	url:updateAuctionPurchase,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data: vmForm.serialize(),
	   	success:function(data){ 
	   		if(data.success==true){
					['noticeEndDate', 'endDate'].forEach(function(key) {
						var value = vmForm.find('#' + key).val();
						if (value && value.length > 16) {
							vmForm.find('#' + key).val(value.slice(0,16))
						}
					})
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
	   			parent.layer.alert("保存成功");
	   		}else{
	   			parent.layer.alert(data.message);
	   		}   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("保存失败")
	   	}
	  });	
}
function Purchase(){
	
	$.ajax({
	   	url:allProjectData+'?t='+ new Date().getTime(), //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		'projectId':projectDataID
	   	},
	   	success:function(data){ 	
	   		if(data.success){
	   			//项目数据
		   		purchaseaData=data.data;	   		
		   		
		   		//邀请供应商的数据
		   		//publicDatas=purchaseaData.projectSupplier;
		   		//费用信息
		   		projectPriceInfo = purchaseaData.projectPriceData;
		   		if(purchaseaData.autionProjectPackage.length>0){
		   			//包件信息的数据
			   		packageData=purchaseaData.autionProjectPackage;
			   		//设备信息的数据
					DetailedData = purchaseaData.auctionPackageDetailed;
		   		}else{
		   			packageData=[]
		   		}
		   		package();
		   		mediaEditor.setValue(purchaseaData)
	   		}
	   		
	   	},
	   	error:function(data){
	   		parent.layer.alert("处理失败")
	   	}
	  });	
	  
	  
	  for(var i=0;i<packageData.length;i++){
		
		var projectPrices = [];
		for(var j=0;j<projectPriceInfo.length;j++){
		
			if(packageData[i].id == projectPriceInfo[j].packageId ){
				projectPrices.push(projectPriceInfo[j]);
				packageData[i].projectPrice = projectPrices;
			}
		}
	}	
	var arrlist = sysEnterpriseId.split(',');
	if(arrlist.indexOf(top.enterpriseId)!=-1){
		isDf=true//是
	}else{	
		isDf=false;//否
	}
	modelOption({'tempType':'biddingProcurementNotice'});
	$("#noticeTemplate").attr('name','templateId');
	$("#noticeTemplate").val(purchaseaData.templateId);//公告模板id	
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
			var templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		parent.layer.confirm('温馨提示：是否确认切换模板', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero){
			changHtml(templateId)
			parent.layer.close(index);			 
		}, function(index){
			 parent.layer.close(index)
		});	
	}); 
};
//切换模板
function changHtml(templateId){
	$.ajax({   	
		url:saveProjectPackage,//修改包件的接口
		type:'post',
		//dataType:'json',
		async:false,
		//contentType:'application/json;charset=UTF-8',
		data:$("#formbackage").serialize()+'&packageState=5',
		success:function(data){			   		
			if(data.success==true){
				modelHtml({'type':'xmgg', 'projectId':purchaseaData.project[0].id,'tempId':templateId,'tenderType':1})
			}else{
				parent.layer.alert(data.message)
			}
		}   	
	});		
}
function du(){
	$("#projectName").val(purchaseaData.project[0].projectName);
	$("#projectCode").val(purchaseaData.project[0].projectCode);	      
	$("#projectSource option").eq(purchaseaData.project[0].projectSource).attr("selected",true);
	$("#engineering option").eq(purchaseaData.project[0].projectType).attr("selected",true);
	if(purchaseaData.project[0].projectType==0){		
	    $('.engineering').show()
	}else{
		$('.engineering').hide()
	};
	Usersupplier()	
	$("#purchaserId").val(purchaseaData.purchaserId);
	$("#purchaserName").text(purchaseaData.purchaserName);
	$("#purchaserAddress").text(purchaseaData.purchaserAddress);
	$("#purchaserLinkmen").val(purchaseaData.purchaserLinkmen);
	$("#purchaserLinkmenId").val(purchaseaData.purchaserLinkmenId);
	$("#purchaserTel").text(purchaseaData.purchaserTel);
	$("#ppurchaserName").val(purchaseaData.purchaserName);
	$("#ppurchaserAddress").val(purchaseaData.purchaserAddress);
	$("#ppurchaserLinkmen").val(purchaseaData.purchaserLinkmen);
	$('input[name="settingNotice"][value="'+purchaseaData.settingNotice+'"]').attr("checked",true);
	$("#ppurchaserTel").val(purchaseaData.purchaserTel);
	setProvince();
	setCity(purchaseaData.project[0].province||'42');
	$("#Province").val(purchaseaData.project[0].province||'42');	
	$("#City").val(purchaseaData.project[0].city||'4201');
	$("#provinceName").val(purchaseaData.project[0].provinceName||'湖北省');	
	$("#cityName").val(purchaseaData.project[0].cityName||'武汉市');	
	$("input[name='project.tenderType']").eq(purchaseaData.project[0].tenderType).attr("checked",true);
	$('input[name="supplierCount"]').val((purchaseaData.supplierCount==undefined?"1":purchaseaData.supplierCount));
	$('input[name="project.projectSource"]').val(purchaseaData.project[0].projectSource);
	$("#projectSource").html(purchaseaData.project[0].projectSourceText);
	if(purchaseaData.project[0].projectSource==0){
        	$(".projectSource0").show();
        	$(".projectSource1").hide()
    }else if(purchaseaData.project[0].projectSource==1){
        	$(".projectSource1").show();
        	$(".projectSource0").hide()
    };
	if(purchaseaData.isPublic>1){
		$("input[name='isPublics'][value='1']").attr("checked",true);
		$('.isPublics1').show();
		$('.isPublics0').hide();
		$(".yao_btn").show();
		$("#CODENAME").val(purchaseaData.supplierClassifyName);
		$("#supplierClassifyCode").val(purchaseaData.supplierClassifyCode);
		classificaCode=purchaseaData.supplierClassifyCode;	
		Publics();	
		if(purchaseaData.isPublic==3){
			$('.isPublics3').show();
		}		
	}else{
		$("input[name='isPublics'][value='0']").attr("checked",true);
		$("#CODENAME").val("");
		$("#supplierClassifyCode").val("");
		$('.isPublics0').show();
		$('.isPublics1').hide();
		$(".yao_btn").hide();	
	}				
	$("input[name='isPublic'][value='"+ (purchaseaData.isPublic||0) +"']").prop("checked",true);                     
	$('#noticeStartDate').val(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');//公告开始时间
	$("#StartDate").html(purchaseaData.noticeStartDate!=undefined?purchaseaData.noticeStartDate.substring(0,16):'');	
	$('#noticeEndDate').val(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'');//公告截止时间
	$("#endDate").html(purchaseaData.noticeEndDate!=undefined?purchaseaData.noticeEndDate.substring(0,16):'')
	$('#askEndDate').val(purchaseaData.askEndDate!=undefined?purchaseaData.askEndDate.substring(0,16):'');//提出澄清截止时间
	$('#answersEndDate').val(purchaseaData.answersEndDate!=undefined?purchaseaData.answersEndDate.substring(0,16):'');//答复截止时间
	$('#auctionStartDate').val(purchaseaData.auctionStartDate!=undefined?purchaseaData.auctionStartDate.substring(0,16):'');//竞价开始时间
	
	$('#projectId').val(purchaseaData.projectId);
	$("#purchaseId").val(purchaseaData.id);
	ue.ready(function() {
		//ue.setContent(result.data, true);		
		ue.execCommand('insertHtml', purchaseaData.content);
	});
	$("input[name='isFile']").eq(purchaseaData.isFile).attr("checked",true);
	if(purchaseaData.isFile==0){
		$("#isFileN").show();
		$('#fileEndDate').val(purchaseaData.fileEndDate!=undefined?purchaseaData.fileEndDate.substring(0,16):'');//竞价文件递交截止时间
		$('#fileCheckEndDate').val(purchaseaData.fileCheckEndDate!=undefined?purchaseaData.fileCheckEndDate.substring(0,16):'');//竞价文件审核截止时间
	}else{
		$("#isFileN").hide();
		$('#fileEndDate').val("");//竞价文件递交截止时间
		$('#fileCheckEndDate').val("");//竞价文件审核截止时间
	};	
	sourceFunds();
}
//获取当前登录人的企业信息
function Usersupplier(){
	$.ajax({
	   	url:findEnterpriseInfo,
	   	type:'get',
	   	dataType:'json',
	   	async:false,		   
	   	success:function(data){	
	   		if(purchaseaData.agencyName!=""&&purchaseaData.agencyName!=undefined){
				$("#agencyNames").text(purchaseaData.agencyName);
				$("#agencyName").val(purchaseaData.agencyName);
				$("#agencyId").val(purchaseaData.agencyId);
				$("#agencyAddress").val(purchaseaData.agencyAddress);
				$("#agencyLinkmen").val(purchaseaData.agencyLinkmen);
				$("#agencyTel").val(purchaseaData.agencyTel);
			}else{
				$('#agencyName').val(data.data.legalName)
				$('#agencyNames').html(data.data.legalName)
				$('#agencyId').val(data.data.danweiguid)
				$('#agencyAddress').val(data.data.legalUnitAddress)
				$('#agencyLinkmen').val(top.userName)
				$('#agencyTel').val(top.userTel)
			}
	   		
	   	}
	});    
};

//项目类型为工程类时显示建设工程名字等内容
$("#engineering").on('change',function(){
	if($(this).val()==0){
		$('.engineering').show()
	}else{
		$('.engineering').hide()
	}
});
$('input[name="isFile"]').on('click', function() {
	if($(this).val() == 0) {
		$("#isFileN").show()
	} else {
		$("#isFileN").hide()
		$('#fileEndDate').val("");
		$('#fileCheckEndDate').val("");
	}

});

//添加媒体
var itemTypeId=[]//媒体ID
var itemTypeName=[]//媒体名字
var itemTypeCode=[]//媒体编号
function medias(){
	var optiondata=[]
	$.ajax({
        url:sendUrl ,
        type:"post",
		async:false,
        dataType:"json",
		data:{
			"optionName":"PUBLISH_MEDIA_NAME"
			},
		success: function(result){	
			var op="";
			
			if(result.success){
				optiondata=result.data;
				for(var i=0;i<result.data.length;i++){
					op+='<option class="'+ result.data[i].optionValue +'" value="'+ result.data[i].optionText +'" data-tokens="'+ result.data[i].id +'">'+result.data[i].optionText +'</option>'
				}	
				$("#optionName").html(op)
			}
		}
	})
	if(purchaseaData.options.length>0){
		for(var i=0;i<purchaseaData.options.length;i++){
			itemTypeName.push(purchaseaData.options[i].optionText);
			itemTypeId.push(purchaseaData.options[i].id);
			itemTypeCode.push(purchaseaData.options[i].optionValue)
		}
		typeNameList=itemTypeName.join(',');
		typeIdList=itemTypeId.join(',');
		typeCodeList=itemTypeCode.join(',');
	}else{
		for(var i=0;i<optiondata.length;i++){
			if(optiondata[i].id=="186954d7656946d687e5ed42f26f5c88"){
				itemTypeName.push(optiondata[i].optionText);
				typeNameList=optiondata[i].optionText;
				typeIdList=optiondata[i].id;
				typeCodeList=optiondata[i].optionValue;
			}
		}
	}
	$("#optionName").selectpicker ("val",itemTypeName).trigger("change");
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);
}

//取出选择的任务执行人的方法
function  getOptoions(){
	var optionId = [], optionValue = [],optionName=[];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	for (var i = 0; i < $("li.selected").length; i++) {
		optionValue.push($("li.selected").eq(i).find("a").attr("class"));
		optionId.push($("li.selected").eq(i).find("a").attr("data-tokens"));
		optionName.push($("li.selected").eq(i).find(".text").text());
		
	}
	typeIdList=optionId.join(",")//媒体ID
	typeNameList=optionName.join(",")//媒体名字
    typeCodeList=optionValue.join(",")//媒体编号	
	//赋值给隐藏的Input域	
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);
 
}

function package(){
	$.ajax({
        type: "post",
        url: config.AuctionHost+'/AuctionProjectPackageController/findAuctionProjectPackageList.do',
        data: {
            'projectId':projectDataID
        },
        dataType: "json",
        async:false,
        success: function (response) {
            if(response.success){
                packageData=response.data;
            }
            
        }
    });
	if(packageData.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#tablebjb').bootstrapTable({
		pagination: false,
		undefinedText: "",
		height:height,
		columns: [{
				title: "序号",
				align: "center",
				halign: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			},
			{
				field: "packageNum",
				title: "包件编号",
				align: "left",
				halign: "left",
				width: "200px",

			},
			{
				field: "packageName",
				title: "包件名称",
				halign: "left",				
				align: "left",
				

			}, {
				field: "auctionType",
				title: "竞价方式",
				halign: "center",
				width:'150px',
                align: "center",
                formatter:function(value, row, index){					
					if(value==0){
                       return '自由竞价'
                    }
                    if(value==1){
                        return '单轮竞价'
                    }
                    if(value==2){
                        return '多轮竞价中的2轮竞价'
                    }
                    if(value==3){
                        return '多轮竞价中的3轮竞价'
                    }
                    if(value==4){
                        return '无限轮次竞价'
                    }
				}								
			},{
				field: "#",
				title: "操作",
				halign: "center",
				align: "center",
				width:'120px',
				formatter:function(value, row, index){					
					var Tdr='<div class="btn-group">'
		     		+'<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none;margin-right:10px" onclick=editPackage(\"'+ row.id +'\",'+index+')>编辑</a>'
		     		+'<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=deletPackage(\"'+ row.id +'\",'+index+')>删除</a>'
		     		+'</div>'
		     		+'</td>'
		     		return Tdr
				}
			}			
		]
	});
	$('#tablebjb').bootstrapTable("load", packageData); //重载数据
};
//删除包件
function deletPackage(uid,i){
	parent.layer.confirm('确定要删除该包件', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		$.ajax({
	   	url:deletProjectUrl,
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"id":uid
	   	},
	   	success:function(data){
	   		Purchase();
	   	},
	   	error:function(data){
	   		parent.layer.alert("删除失败")	   		
	   	}
	 });
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});
}
//修改包件
function editPackage(uid,num){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '编辑包件'
        ,area: ['1100px', '600px']
        ,content:editpackageurl+'?projectSource='+purchaseaData.project[0].projectSource+'&projectType='+purchaseaData.project[0].projectType
        ,success:function(layero,index){        	
        	var iframeWind=layero.find('iframe')[0].contentWindow; 
        	iframeWind.du(uid)
        }               
    });
}
//添加
function add_bao(){
	if($("#purchaserName").html()==""||$("#purchaserName").html()==undefined||$("#purchaserName").html()==null){
		parent.layer.alert("请先选择采购人")
		
		return
	}
	if($("#projectCode").val()==""||$("#projectCode").val()==undefined||$("#projectCode").val()==null){
		parent.layer.alert("请填写项目编码")
		
		return
	}
	if(packageData.length==0){
		$ind=0;
	}else if(packageData.length>0){
		$ind=packageData[0].packageNum.split('-')[packageData[0].packageNum.split('-').length - 1];
	};
	$ind=parseInt($ind)+parseInt(1);
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加包件'
        ,area: ['600px', '300px']
        ,content:addpackageurl
        ,btn: ['保存','取消']
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;//获取包件弹出框整个对象           	      	
        	iframeWind.$('#packageName').val($("#projectName").val());
        	if($ind<10){
				iframeWind.$('#packageNum').val($("#projectCode").val()+'-0'+$ind);
			}else{
				iframeWind.$('#packageNum').val($("#projectCode").val()+'-'+$ind);
			} 
        	iframeWind.$('#projectCode').val($("#projectCode").val());
        	iframeWind.$('#projectId').val(projectDataID);
        }
        //确定按钮
        ,yes: function(index,layero){            
         var iframeWin=layero.find('iframe')[0].contentWindow;     
         if(iframeWin.$('#packageName').val()==""){
     		parent.layer.alert("包件名称不能为空");        		     		
     		return;
     	 }; 
     	 if(iframeWin.$('#dataTypeName').val()==""){
     		parent.layer.alert("项目类型不能为空");        		     		
     		return;
     	 };
     	 $.ajax({
		   	url:saveProjectPackage,
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:iframeWin.$("#formbackage").serialize(),
		   	success:function(data){ 
		   	   if(data.success==true){
		   	   	parent.layer.alert("添加成功");
		   	   	Purchase();
		   	   }else{
		   	   	 parent.layer.alert(data.message);
		   	   	
		   	   };
		   	   parent.layer.close(index);
		   	},
		   	error:function(data){
		   		parent.layer.alert("添加失败")
		   	}
		 });			
         parent.layer.close(index);
        },
        btn2:function(){ 
        	$ind=$ind-1
        },        
      });
};
//资金来源数据获取
function sourceFunds(){	
	// $.ajax({
	// 	   	url:sourceFundsUrl,
	// 	   	type:'get',
	// 	   	dataType:'json',
	// 	   	async:false,
	// 	   	data:{
	// 	   		"optionName":"MONEY_FROM"
	// 	   	},
	// 	   	success:function(data){			   		
	// 	   	   var option="";
	// 	   	   var is=""
	// 	   	   for(var i=0;i<data.data.length;i++){
	// 	   	   	 option+='<option value="'+data.data[i].id+'">'+data.data[i].optionText+'</option>'		   	   	
	// 	   	   	 if(purchaseaData.sourceFundsId==data.data[i].id){		   	   	 	
	// 	   	   	 	is=i
	// 	   	   	 }
	// 	   	   }
	// 	   	   $("#sourceFunds").html(option);
	// 	   	   $("#sourceFunds option").eq(is).attr("selected",true)
	// 	   	}
	// });
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
		   	   	    isCheck==true;
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
};
var PurchasersDataEnterprojectId="";
//选择采购人
function chosePucharse(){		
	parent.layer.open({
	    type: 2 //此处以iframe举例
	    ,title: '选择采购人'
	    ,area: ['1100px','600px']
	    ,content:'Auction/Auction/Agent/AuctionPurchase/model/Purchasers.html?projectId='+projectDataID+'&tenderType=1'
	    //,btn: ['关闭']
	    ,maxmin: false //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		,resize: false //是否允许拉伸
	    ,success:function(layero,index){
	    	var iframeWind=layero.find('iframe')[0].contentWindow;
			iframeWind.du(PurchasersDataEnterprojectId, function(data){
				showPurchse(data);
				if($("#projectCode").val()==""){
					var pare={
							'tenderType':1,
							'enterpriseId':data.enterpriseId,
							'regionCode':$("#City").val()
						}
					if($("#projectType").val()==3){
						pare.projeteTypeCode='GX'
					}
					if(isDf==true&&("#projectType").val()==3){
								
					}else{
						$.ajax({
							url:config.AuctionHost+'/PurchaseController/newprojectCode.do',
							type:'post',
							dataType:'json',
							async:false,
							data:pare,
							success:function(data){
								if(data.success){
									var projectCode=data.data;
									$("#projectCode").val(projectCode);		
								}else{
									parent.layer.alert(data.message);
									return;
								}
							} 
						});
					}
					
				}
			})
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



/*
 * 2018-11-08  H
 * 选择联系人(竞卖,采购) 
 */
$("#purchaserLinkmen").click(function(){
	if($("#purchaserId").val()=="" || $("#ppurchaserName").val()==""){
		parent.layer.alert("请选择竞价人");
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
