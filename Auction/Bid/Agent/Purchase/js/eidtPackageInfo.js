var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetailForPur.do"; //查询保证金账号
var opurl =config.Syshost +  "/OptionsController/list.do";
var packagePrice = [];//费用信息
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var projectType;
var examType;
var edittype="";
var packageInfo=""//包件信息
var packageDetailInfo=[]//明细信息
var isAgents=""
var publicData=[];//邀请供应商数据列表
var isSetServiceCharges='YES',ptPrice,isSetSign='YES',SignMorny;
var oldProjectId = '';//有值则为推送项目，空则为指派项目
var feeConfirmVersion = 2;//服务费版本号
//打开弹出框时加载的数据和内容。
if($("#packageId").val()==""){
	$(".packNone").hide()
}else{
	$(".packNone").show()
}
function du(uid,examTypes,isAgent){
	examType=examTypes;
	//后审工程类显示清标相关信息
	if(examType == 1 && projectType == '0'){
		$('.clearBidding').show();
	}
	isAgents=isAgent;
	$.ajax({
	   	url:config.bidhost+'/ProjectReviewController/findProjectPackageInfo.do',
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:{
	   		"packageId":uid
	   	},
	   	success:function(data){
	   	  	if(data.success){
		   	  	packageInfo=data.data;	
				/*********         保证金虚拟子账户规则   media/js/base/IndexMenu.js */
				if(top.virtualBondRules == 1 || top.virtualBondRules == 2){
					if($('.virtualBondBank').length == 0){
						$(".virtualBondRules").after(top.virtualBondHtml)
					}
				}
				/*********         保证金虚拟子账户规则   --end */
				businessPriceSetData=packageInfo.businessPriceSetList[0];
		   	  	publicData=packageInfo.projectSupplierList;
		   	  	if(isAgents==0){
		   	  		$(".isAgent1").hide()
		   	  	}else{
		   	  		$(".isAgent1").show()
		   	  	}
		   	  	$("#addProject").hide();
		   	  	package();	
		   	  	packagePriceData();
		   	  	dataType();
		   	  	if(examType==1){
		   	  	 Check_Plan_change(packageInfo.checkPlan);
		   	  	}else{
		   	  	 Check_Plan_change(packageInfo.examCheckPlan);
		   	  	};	
	   	  	}else{
				parent.layer.alert(data.message);
			}	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("请求失败")
	   	}
	});	
    
};
// 选择部门
$(".Department").on("click",function(){
	var name=$(this).data('title');
	if(name=='agency'){
		var uid=top.enterpriseId
		var mnuid=$("#agencyDepartmentId").val();
	}else{
		var uid=packageInfo.purchaserId;
		var mnuid=$("#purchaserDepartmentId").val();
	}
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '选择所属部门'
        ,area: ['400px', '600px']
        ,content:'view/projectType/employee.html'
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	iframeWind.employee(uid,name,callEmployeeBack,mnuid)
        },
         
    })
});
//清单文件
$("[name='isHasDetailedListFile']").change(function () {
	var val = $(this).val();
	detailedListFileChange(val);
});
function callEmployeeBack(aRopName,dataTypeList){
	var  itemTypeId=[];//项目类型的ID
	var  itemTypeName=[];//项目类型的名字
	var  itemTypeCode=[];//项目类型编号
				
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);	
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList=itemTypeId.join(",");//项目类型的ID
	typeNameList=itemTypeName.join(",");//项目类型的名字
	if(aRopName=='agency'){
		$("#agencyDepartmentId").val(typeIdList);
		$("#agencyDepartment").val(typeNameList);
	}else{
		$("#purchaserDepartmentId").val(typeIdList);
		$("#purchaserDepartment").val(typeNameList);
	}
}
 //切换评审方式
function Check_Plan_change(value){ 	
		if(examType==1){
			$(".checkPlanExamTypeS").hide();
			$(".checkPlanExamType").show();
			$("#supplierNum").hide();
		}else if(examType==0){
			$(".checkPlanExamTypeS").show();
			$(".checkPlanExamType").hide();
			$('input[name="examCheckPlan"]').on('change',function(){
			if($(this).val()==1){
			   	  $("#supplierNum").show();
			   }else{
			   	  $("#supplierNum").hide();
			   }
			});			
			if(value==1){
		   	  $("#supplierNum").show();
		   	 
		   	}else{
		   	  $("#supplierNum").hide();
		   	}
		}   					 	  
};

/*====ajax请求获取包件信息的数据获取====*/
function package(){
	//“项目类型”为工程时，选项中不显示'经评审的最高投标价法'，即工程项目不可使用此评标办法；
		if(projectType != 0){
			$('.topPrice').show();
		}
		// 包件名称
		$("#Package_Name").val(packageInfo.packageName);
		// 包件编号
		$("#Package_Num").val(packageInfo.packageNum);
		$("#outNumber").val(packageInfo.outNumber?packageInfo.outNumber:'');
		// 包件排序
		$("#sort").val(packageInfo.sort);
		// 包件id
		$("#packageId").val(packageInfo.id);
		// 项目id
		$("#projectId").val(packageInfo.projectId);
		// 资格预审还是资格后审0为预审1为后审
		$("#examType").val(examType);
		// 重新采购，1为重新采购
		$("#packageSource").val(packageInfo.packageSource);
		// CA加解密
		$("#encipherStatus").html(packageInfo.encipherStatus == 1 ? '是' : '否');
		// 项目类型
		if(packageInfo.dataTypeName!=""&&packageInfo.dataTypeName!=undefined){
			$("#dataTypeName").val(packageInfo.dataTypeName);
			$("#dataTypeId").val(packageInfo.dataTypeId);
			$("#dataTypeCode").val(packageInfo.dataTypeCode);
		}
		//判断是否为重新采购项目1为重新采购
		if(packageInfo.packageSource==1){
			$('input[name="isSign"]').attr('disabled',true);
			$('input[name="isSellFile"]').attr('disabled',true);
			$('input[name="projectPrices[0].price"]').attr('disabled',true);
			$('input[name="projectPrices[1].price"]').attr('disabled',true);
		}
		if(packageInfo.oldProjectId){
			oldProjectId = packageInfo.oldProjectId;
			$('.agencyDepartment').hide();
			$('#agencyDepartmentId, #agencyDepartment').show();
			$("#agencyDepartmentId").val(packageInfo.agencyDepartmentId);
			$("#agencyDepartment").val(packageInfo.agencyDepartmentName);
		}else{
			if(packageInfo.agencyDepartmentName || packageInfo.belongDepartmentName){
				$('.agencyDepartment').show().html(packageInfo.agencyDepartmentName?packageInfo.agencyDepartmentName:packageInfo.belongDepartmentName);
				$('#agencyDepartmentId, #agencyDepartment').hide();
				$("#agencyDepartmentId").val(packageInfo.agencyDepartmentId?packageInfo.agencyDepartmentId:packageInfo.belongDepartmentId);
				$("#agencyDepartment").val(packageInfo.agencyDepartmentName?packageInfo.agencyDepartmentName:packageInfo.belongDepartmentName);
			}else{
				$('#agencyDepartmentId, #agencyDepartment').show();
				$('.agencyDepartment').hide();
			}
			
			
		}
		
		$("#purchaserDepartmentId").val(packageInfo.purchaserDepartmentId);
		$("#purchaserDepartment").val(packageInfo.purchaserDepartmentName);
		$('input[name="budgetPrice"]').val(packageInfo.budgetPrice);
		$('input[name="noTaxBudgetPrice"]').val(packageInfo.noTaxBudgetPrice);
		$('input[name="taxRate"]').val(packageInfo.taxRate);
		
		//判断是否需要报名
		if(packageInfo.isSign==undefined){
			$('input[name="isSign"][value="1"]').attr("checked",true);
		}else{
			$('[name="isSign"]').val([packageInfo.isSign])
		}
		//判断是否需要控制价
		if(packageInfo.isHasControlPrice==undefined){
			$('input[name="isHasControlPrice"][value="0"]').attr("checked",true);
		}else{
			$('[name="isHasControlPrice"]').val([packageInfo.isHasControlPrice])
		}
		//判断是否需要清单文件
		if(packageInfo.isHasDetailedListFile==undefined){
			$('input[name="isHasDetailedListFile"][value="0"]').attr("checked",true);
			detailedListFileChange('0');
		}else{
			$('[name="isHasDetailedListFile"]').val([packageInfo.isHasDetailedListFile])
			detailedListFileChange(packageInfo.isHasDetailedListFile);
		}
		$('input[name="isPayDeposit"][value="'+ (packageInfo.isPayDeposit||0) +'"]').attr("checked",true);
		$('input[name="supplierCount"]').val(packageInfo.supplierCount||1);
		if(packageInfo.isSellFile==undefined){
			$('input[name="isSellFile"][value="1"]').attr("checked",true);
		}else{
			$('input[name="isSellFile"]').val([packageInfo.isSellFile])
			// $('input[name="isSellFile"][value="'+ packageInfo.isSellFile +'"]').attr("checked",true);
		}
		$("#payMethod").val(packageInfo.payMethod||1);
		//虚拟子账户生成银行回显
		if(packageInfo.bankType){
			$('input[name="bankType"]').val([packageInfo.bankType]);
			// $('input[name="bankType"][value="'+ packageInfo.bankType +'"]').attr("checked",true);
		}
		
		//如果需要报名。判断是否需要递交报名费
		if(packageInfo.isSign==1||$('input[name="isSign"]:checked').val()==1){
			$('input[name="isPaySign"][value="'+ (packageInfo.isPaySign||0) +'"]').attr("checked",true);
		}
		$("#offerAttention").html(packageInfo.offerAttention);	
		if(examType==0){//0为资格预审，1为资格后审
			// 资格预审的评审方法0为合格制1为有限数量制
			$("input[name='examCheckPlan'][value='"+ packageInfo.examCheckPlan +"']").attr("checked",true);
			checkPlana=packageInfo.examCheckPlan;								
			$('.tenderTypeW').hide();								
			$('input[name="keepNum"]').val(packageInfo.keepNum)
			$("#keepNum").on('change',function(){					
				if(!(/^[0-9]*$/.test($(this).val()))){ 
					parent.layer.alert("请输入大于零的整数"); 	
					$(this).val("");		
					return;
				}
			})
			// 当为有限数量制时，填写最多保留供应商数
			if(packageInfo.examCheckPlan==1){
				$("#supplierNum").show();
			}else{
				$("#supplierNum").hide();
			}				
		}else{
			// 资格后审的评审方法，0为综合评分法，1为最低评标价法，2为最低投标价法，3为经评审的最低价法(价格评分), 4经评审的最高投标价法,5经评审的最低投标价法
			$("input[name='checkPlan'][value='"+ packageInfo.checkPlan +"']").attr("checked",true);
			checkPlana=packageInfo.checkPlan;	
			$('.tenderTypeW').show();													
		}	
		//判断公开范围，大于1为邀请函，反之则为公开项目。				
		if(packageInfo.isPublic>1){
			$("input[name='isPublics'][value='1']").attr("checked",true);
			$('.isPublics1').show();
			$('.isPublics0').hide();
			$(".yao_btn").show();
			$("#CODENAME").val(packageInfo.supplierClassifyName);
			classificaCode=packageInfo.supplierClassifyCode
			$("#supplierClassifyCode").val(classificaCode);		
			Public();
			if(packageInfo.isPublic==3){
				$(".isPublics3").show();
			}		
		}else{
			$("input[name='isPublics'][value='0']").attr("checked",true);
			$("#CODENAME").val("");
			$("#supplierClassifyCode").val("");
			$('.isPublics0').show();
			$('.isPublics1').hide();
			$(".yao_btn").hide();	
		}				
		$("input[name='isPublic'][value='"+ (packageInfo.isPublic||0) +"']").prop("checked",true);	
		// 是否需要提供分项报价表		
		$("input[name='isOfferDetailedItem'][value='"+ packageInfo.isOfferDetailedItem +"']").prop("checked",true);            
		
		//start非招标代理服务费
		if(packageInfo.openServiceFee == 1){
			$(".agentBlock").show();
			for(var key in packageInfo.projectServiceFee){
				$("[name='projectServiceFee."+key+"']").val(packageInfo.projectServiceFee[key]);
			}
			$("[name='projectServiceFee.tenderType']").val(projectType);
			$("[name='projectServiceFee.projectId']").val(packageInfo.projectId);
			$("[name='projectServiceFee.packageId']").val(packageInfo.id);
			agentFeeChange(packageInfo.projectServiceFee && packageInfo.projectServiceFee.collectType || 0);  
		} else {
			$(".agentBlock").remove();
		}
		//end非招标代理服务费
		/* 新增字段【评审费承担方*】，必填项。单选，选项1：中（选）标单位；选项2：代理机构。无默认值。    2024.6.21    代理服务费线上电子票开票方案 */
		feeConfirmVersion = packageInfo.feeConfirmVersion;
		if(feeConfirmVersion && feeConfirmVersion == 2){
			$('.feeConfirmVersion').show();
			if(packageInfo.feeUnderparty || packageInfo.feeUnderparty == 0){
				$('[name="feeUnderparty"]').val([packageInfo.feeUnderparty])
			}
		}else{
			$('.feeConfirmVersion').hide();
		}
};
function dataType(){
	$("#dataTypeName").treeNew({
		projectType:projectType,
		parameter:{//接口调用的基本参数
			status:0,
			type:2, 
		},
		checkType:'radio',//radio为单选，checkbox为多选，默认单选
        islowest:true,//是否只能选择最下级，true为是，false为否，默认true
		checkedId:$('#dataTypeId').val(),
		success:function(data,$index,_that){
			if(data){
				var itemTypeId=[];//项目类型的ID
				var itemTypeName=[];//项目类型的名字
				var itemTypeCode=[];//项目类型编号
				var arr=new Object();            
				for(var i=0;i<data.length;i++){
					itemTypeId.push(data[i].id);	
					itemTypeName.push(data[i].name);
					itemTypeCode.push(data[i].code);
				};
				arr.typeIdList=itemTypeId.join(",");//项目类型的ID
				_that.options.checkedId=arr.typeIdList;
				arr.typeNameList=itemTypeName.join(",");//项目类型的名字
				arr.typeCodeList=itemTypeCode.join(",");//项目类型编号			
                $("#dataTypeName").val(arr.typeNameList);
                $('#dataTypeId').val(arr.typeIdList);
                $('#dataTypeCode').val(arr.typeCodeList);
                top.parent.layer.close($index);
            }
		}
	})	
};
//数字验证
$(".number").on("blur",function(){   
	   if($(this).val()!=""){
	   	    if(!(/^((\d+\.\d*[0-9]\d*)|(\d*[0-9]\d*\.\d+)|(\d*[0-9]\d*))$/.test($(this).val()))){ 
			parent.layer.alert("请输入正数"); 	
			$(this).val("");		
			return;
	        };
			$(this).val(parseFloat($(this).val()).toFixed(3));
		}
});
//当切换了评审方法时，删除已添加的评审项
function deleteItems(){
	$.ajax({
		type: "post",
		url: config.bidhost+"/PackageCheckListController/changeCheckPlan.do",
		async: true,
		dataType: 'json',
		data: {
			packageId:packageInfo.id,
			checkType:1,
			examType:1
		},
		success: function(data) {
			if(data.success==true){
				
			}
		}
	});
}
//选择项目添加包件
$('#addProject').on('click',function(){
	parent.layer.open({
		type: 2 //此处以iframe举例
        ,title: '选择项目'
        ,area: ['1000px', '600px']
		,maxmin: true//开启最大化最小化按钮
        ,content:'Auction/common/Agent/Purchase/model/add_project.html'
    });
});
//审核确定按钮
$("#btn_submit").click(function() {	
	
	if($("#packageId").val()==""){
		parent.layer.alert("请选择项目");        		
 		return false;
	}
	if($("#dataTypeName").val()==""||$("#dataTypeId").val()==""||$("#dataTypeCode").val()==""){
		parent.layer.alert("请选择项目类型");        		
 		return false;
	}	
	if($("#Package_Name").val()==""){
 		parent.layer.alert("包件名称不能为空");        		
 		return false;
	 };
	 /* if($("#Package_Num").val()==""){
		parent.layer.alert("包件编号不能为空");        		
		return false;
	}; */
 	if($("#Package_Name").val().length>100){
 		parent.layer.alert("包件名称长度不能超过100个字");	
 		return false;
	};
	if($("#outNumber").val().length>100){
		parent.layer.alert("系统外编号长度不能超过100个字");  
		return false;
	};
	//评审费承担方
	if(feeConfirmVersion == 2 && $("input[name='feeUnderparty']:checked").val() === undefined){
		parent.layer.alert("请选择评审费是否含在代理服务费中");
		return false;
	}
	if(oldProjectId != ''){
		if($("#agencyDepartmentId").val()==""){
			parent.layer.alert("请选择代理机构所属部门");        		
			return false;
		}
	}
 	if(examType==0){
 	 	if($("input[name='examCheckPlan']:checked").val()==1&&$('#keepNum').val()==""){
     		parent.layer.alert("最多保留供应商数不能为空");        		
     		return false;
     	};
     	if($("input[name='isSellFile']:checked").val()==0&&$('input[name="projectPrices[1].price"]').val()==""){
     		parent.layer.alert("资格预审文件费不能为空");        		
     		return false;
     	};
	};
	/* if($("#budgetPrice").val()==""){
		parent.layer.alert("预算价不能为空");        		
		return false;
	}; */
 	if($('input[name="isPayDeposit"]:checked').val()==0){
 		if($('input[name="projectPrices[3].price"]').val()==""){
	 		parent.layer.alert("保证金不能为空");        		
	 		return false;
		};
		if($("#payMethod").val()!=0){
			if($("input[name='projectPrices[3].agentType']:checked").val()===undefined){
				parent.layer.alert("请选择保证金收取机构");
				return false;
			}
			if($('input[name="projectPrices[3].bankAccount"]').val()==""){
				parent.layer.alert("账户名不能为空");        		
				return false;
			};
			if($('input[name="projectPrices[3].bankName"]').val()==""){
					parent.layer.alert("开户银行不能为空");        		
					return false;
			};
			if($('input[name="projectPrices[3].bankNumber"]').val()==""){
					parent.layer.alert("账号不能为空");        		
					return false;
			}else{
				if($('input[name="projectPrices[3].bankNumber"]').val().length>30){
					parent.layer.alert("账号不能为超过30位");        		
					return false;
				};
			};
			$('[name=bankType]').attr('checked',false);
		}else{
			if(!$('[name=bankType]:checked').val()){
				parent.layer.alert('请选择虚拟子账户生成银行！');
				return
			}
		}
	}; 	
 	if(isSetServiceCharges!="NO"){
 		if($('input[name="projectPrices[2].price"]').val()==""){
	 		parent.layer.alert("平台服务费不能为空");        		
	 		return false;
	 	};
 	};
 	if(isSetSign=="YES"){
 		if($("input[name='isPaySign']:checked").val()==0&&$("input[name='isSign']:checked").val()==1&&$('input[name="projectPrices[0].price"]').val()==""){
	 		parent.layer.alert("报名费不能为空");        		
	 		return false;
	 	};
 	}
 	if(examType==1){  		     	
     	if($("input[name='isSellFile']:checked").val()==0&&$('input[name="projectPrices[1].price"]').val()==""){
     		parent.layer.alert("采购文件费不能为空");        		
     		return false;
     	};
	}
	if($("input[name='isPublic']:checked").val()>1&&publicData.length==0){
		parent.layer.alert("请邀请供应商");        		
		return false;
	};
	$("#packageState").val(4);
	
	//start 采购代理服务费
	if(!checkAgentFee(packageInfo.openServiceFee)){
		return;
	}
	
	//end 采购代理服务费
	//验证费用
	var isCanSave = true;
	$('.priceNumber').each(function(){
		if(!verifySaveMoney($(this).val(), 2, $(this).attr('priceType'))){
			isCanSave = false;
			return false
		}
	});
	if(!isCanSave){
		return
	};
	
	$('#projectPricesBankType').val($('[name=bankType]:checked').val());
	if($('input[name="isPublic"]:checked').val()>1&&publicData.length<parseInt($("#supplierCount").val())){
		parent.layer.confirm('温馨提示：邀请供应商家数小于当前设置的最小供应商数量，是否确认提交？', {
			btn: ['是', '否'] //可以无限个按钮
		  }, function(index, layero){
				$.ajax({   	
					url:config.bidhost+'/PurchaseController/updateProjectPackage.do',//修改包件的接口
					type:'post',
					//dataType:'json',
					async:false,
					//contentType:'application/json;charset=UTF-8',
					data:$("#formb").serialize(),
					success:function(data){			   		
						if(data.success==true){
							if(examType==1&&$("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
								deleteItems();
							}
							parent.layer.close(parent.layer.getFrameIndex(window.name));
							parent.layer.alert("确认成功")
							parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	   			
							
						}else{
							parent.layer.alert(data.message);
							return false;
						}
					}   	
				}); 
				parent.layer.close(index);			 
		  }, function(index){
			 parent.layer.close(index)
		  });
	}else{
		$.ajax({   	
			url:config.bidhost+'/PurchaseController/updateProjectPackage.do',//修改包件的接口
			type:'post',
			//dataType:'json',
			async:false,
			//contentType:'application/json;charset=UTF-8',
			data:$("#formb").serialize(),
			success:function(data){			   		
				if(data.success==true){
					if(examType==1&&$("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
						deleteItems();
					}
					parent.layer.close(parent.layer.getFrameIndex(window.name));
					parent.layer.alert("确认成功")
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	   			
					
				}else{
					parent.layer.alert(data.message);
					return false;
				}
			}   	
	 	});
	}	
});
//保存
$("#btn_bao").click(function() {
	if($("#Package_Name").val()==""){
 		parent.layer.alert("包件名称不能为空");        		
 		return false;
 	};
 	if($("#Package_Name").val().length>100){
 		parent.layer.alert("包件名称长度补充超过100个字");        		
 		return false;
 	};
	if($('input[name="isPayDeposit"]:checked').val()==0){
		if($("#payMethod").val()!=0){
			$('[name=bankType]').attr('checked',false);
		}
	}; 
	$('#projectPricesBankType').val($('[name=bankType]:checked').val());
	$("#packageState").val(0);
    $.ajax({   	
	   	url:config.bidhost+'/PurchaseController/updateProjectPackage.do',//修改包件的接口
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#formb").serialize(),
	   	success:function(data){			   		
	   		if(data.success==true){
	   			if(examType==1&&$("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
	   				deleteItems();
	   			}
	   			parent.layer.alert("保存成功");
	   			$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
	   		}else{
	   			parent.layer.alert(data.message)
	   		}
	   	}   	
	});	
});
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

// $(".priceNumber").on('change',function(){
// 	/* if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
// 		parent.layer.alert("金额必须大于零且最多两位小数"); 
// 		$(this).val("");
		
// 		return
// 	}; */
// 	// console.log(verifySaveMoney($(this).val(), 2))
	
// 	var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
// 	$(this).val(b);
// })
//start采购代理服务费
$("#agentFeeType").change(function(){
	var val = $(this).val();
	agentFeeChange(val);
});
function agentFeeChange(val){
	if(val == 0){  //固定金额
		$("#agentFeeTxt").html("收费金额（元）<i class='red'>*</i>");
		$("#payModel").hide();
		$("#payMoney").show();
		$("#discount").hide();
		$("#other").hide();
		
	} else if(val == 1){  //标准累进制
		$("#payModel").css("display","inline-block");
		if($("#payModel").val() == 0){
			$("#agentFeeTxt").html("优惠系数（如8折输0.8）<i class='red'>*</i>");		
			$("#payMoney").hide();
			$("#discount").show();
			$("#other").hide();
		} else {
			$("#agentFeeTxt").html("");		
			$("#payMoney").hide();
			$("#discount").hide();
			$("#other").hide();
		}
	} else if(val == 2){ //其他
		$("#agentFeeTxt").html("收取说明");
		$("#payModel").hide();
		$("#payMoney").hide();
		$("#discount").hide();
		$("#other").show();
	}
}
$("#payModel").change(function(){
	var val = $(this).val();
	if(val == 0){
		$("#agentFeeTxt").html("优惠系数（如8折输0.8）");		
		$("#payMoney").hide();
		$("#discount").show();
		$("#other").hide();
	} else {
		$("#agentFeeTxt").html("");		
		$("#payMoney").hide();
		$("#discount").hide();
		$("#other").hide();
	}
});
//提交时验证服务费规则
function checkAgentFee(openServiceFee){
	if(openServiceFee == 1){
		var moneyReg = /^(([1-9]\d{0,11})(\.\d{1,2})?)$|^(0\.((0[1-9])|([1-9]\d?)))$/;
		var discountReg = /^(0\.\d{1,2}$)$/;
		if($("#agentFeeType").val() == "0" && !moneyReg.test($("#payMoney").val())){
			top.layer.alert("请正确输入收费金额");
			return false;
		} else if($("#agentFeeType").val() == "1"){
			if($("#payModel").val() == 0){
				if($("#discount").val() == "0" || $("#discount").val() == "1"){
					return true;
				} else if(!discountReg.test($("#discount").val())) {
					top.layer.alert("请正确输入优惠系数");
					return false;
				}
			}
		}
	}
	return true;
}
//end采购代理服务费
//清单文件
function detailedListFileChange(val){
	if (val == 1) {
		$("[name='isHasControlPrice'][value=1]").prop("checked", "checked");
		$("[name='isHasControlPrice'][value=0]").attr('disabled', true);
	}else{
		$("[name='isHasControlPrice'][value=0]").removeAttr('disabled');
	}
}