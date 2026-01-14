var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var Detaileddelete=config.bidhost +'/PackageDetailedController/delete.do'//明细删除
var saveByExcelDetailed=config.bidhost+'/PackageDetailedController/saveByExcel.do'//批量导入明细信息
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetailForPur.do"; //查询保证金账号
var checkItemUrl='Auction/common/Purchase/Purchase/model/checkListItem.html';//添加明细路径
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
	   	  	}	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
    $("#addProject").hide();
	package();	
	packagePriceData();
	
	if(examType==1){
	 packageDetailData();
	 Check_Plan_change(packageInfo.checkPlan);
	}else{
	 Check_Plan_change(packageInfo.examCheckPlan);
	};
	
	
};
//清单文件
$("[name='isHasDetailedListFile']").change(function () {
	var val = $(this).val();
	detailedListFileChange(val);
});
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
// 选择部门
$(".Department").on("click",function(){
	var name=$(this).data('title');
	var uid=top.enterpriseId
	var mnuid=$("#purchaserDepartmentId").val();
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
})
function callEmployeeBack(aRopName,dataTypeList){
	var  itemTypeId=[];//项目类型的ID
	var  itemTypeName=[];//项目类型的名字			
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);	
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList=itemTypeId.join(",");//项目类型的ID
	typeNameList=itemTypeName.join(",");//项目类型的名字
	$("#purchaserDepartmentId").val(typeIdList);
	$("#purchaserDepartment").val(typeNameList);
}
//添加明细信息
function add_min() {
	if(packageDetailInfo.length>0){
		var sorts=parseInt(packageDetailInfo[packageDetailInfo.length-1].sort) +parseInt(1)
	}else{
		var sorts=1
	}
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '添加明细信息'
        ,area: ['600px', '500px']
        ,content:checkItemUrl+'?type=add&packageId='+packageInfo.id+'&sort='+sorts
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;
        	
        },
        end:function(){
        	packageDetailData()
        }
               
      }); 
};
//修改明细信息
function minEdit(uid,$index){
	parent.layer.open({
        type: 2 //此处以iframe举例
        ,title: '修改明细信息'
        ,area: ['600px', '500px']
        ,content:checkItemUrl+'?type=edit&packageId='+packageInfo.id+'&sort='+packageDetailInfo[$index].sort+'&detailedId='+uid        
        ,success:function(layero,index){
        	var iframeWind=layero.find('iframe')[0].contentWindow;       	
			iframeWind.$('#DetailedName').val(packageDetailInfo[$index].detailedName);//名称
			iframeWind.$('#DetailedVersion').val( packageDetailInfo[$index].detailedVersion);//型号规格
			iframeWind.$('#DetailedCount').val( packageDetailInfo[$index].detailedCount);//数量
			iframeWind.$('#DetailedUnit').val( packageDetailInfo[$index].detailedUnit);//单位
			iframeWind.$('#DetailedContent').val( packageDetailInfo[$index].detailedContent);//备注
        },
        end:function(){
        	packageDetailData()
        }      
      }); 
};
//删除明细表的数据
function mindelet(uid,i){
	
	parent.layer.confirm('确定要删除该明细', {
	  btn: ['是', '否'] //可以无限个按钮
	}, function(index, layero){
		 $.ajax({
		   	url:Detaileddelete,
		   	type:'post',
		   	dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:{
		   		'id':uid
		   	},
		   	success:function(data){	 
		   		   			
		   	}  
		 });
         packageDetailData()
	  parent.layer.close(index);			 
	}, function(index){
	   parent.layer.close(index)
	});
	
}
/*====ajax请求获取包件信息的数据获取====*/
function package(){
		// 包件名称
		$("#Package_Name").val(packageInfo.packageName);
		// 包件编号
		$("#Package_Num").val(packageInfo.packageNum);
		$("#outNumber").val(packageInfo.outNumber);
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
		$("#purchaserDepartmentId").val(packageInfo.purchaserDepartmentId);
		$("#purchaserDepartment").val(packageInfo.purchaserDepartmentName);
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
		//税率数据回显
		$('input[name="isTax"][value="'+ (packageInfo.isTax||0) +'"]').attr("checked",true);
		if(packageInfo.isTax==1){			
			$(".isTaxShow").show();
			$("input[name='tax']").val(packageInfo.tax||6);
			$(".isTaxCol").attr('colspan','1')
		}else{
			$(".isTaxShow").hide();
			$("input[name='tax']").val("");
			$(".isTaxCol").attr('colspan','3')
		}	
		$('input[name="supplierCount"]').val(packageInfo.supplierCount||1);
		$('input[name="budgetPrice"]').val(packageInfo.budgetPrice);
		$('input[name="noTaxBudgetPrice"]').val(packageInfo.noTaxBudgetPrice); //预算价(不含税)(元)
		$('input[name="taxRate"]').val(packageInfo.taxRate); // 税率(%)
		//判断是否需要报名
		if(packageInfo.isSign==undefined){
			$('input[name="isSign"][value="1"]').attr("checked",true);
		}else{
			$('input[name="isSign"][value="'+ packageInfo.isSign +'"]').attr("checked",true);
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
		$('input[name="isSellFile"][value="'+ (packageInfo.isSellFile||0) +'"]').attr("checked",true);
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
};
//明细表的数据获取
function packageDetailData(){
	$.ajax({
	   	url:Detailedlist, 
	   	type:'get',
	   	dataType:'json',
	   	async:false,
	  
	   	data:{
	   		"packageId":packageInfo.id
	   	},
	   	success:function(data){	 
	   		packageDetailInfo=data.data;   			
	   	}  
	 });
	 PackageDetailed()
}
function PackageDetailed(){
	if(packageDetailInfo.length>7){
		var height='304'
	}else{
		var height=''
	}
	$('#tbodym').bootstrapTable({
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
				field: "detailedName",
				title: "名称",
				align: "left",
				halign: "left",

			},
			{
				field: "detailedVersion",
				title: "型号",
				halign: "center",
				width:'200px',
				align: "center",
				formatter:function(value, row, index){
				 return	 (value==undefined||value=="")?"暂无型号":value
				}

			}, {
				field: "detailedCount",
				title: "数量",
				halign: "center",
				width:'100px',
				align: "center",
				
			},
			{
				field: "detailedUnit",
				title: "单位",
				halign: "center",
				width:'100px',
				align: "center"
			},
			{
				field: "detailedContent",
				title: "备注",
				halign: "left",
				align: "left",
			},
			{
				field: "#",
				title: "操作",
				width:'200px',
				halign: "center",
				align: "center",
				formatter:function(value, row, index){	
				var mixtbody=""
                mixtbody+='<a class="btn-sm btn-primary" href="javascript:void(0)" style="text-decoration:none" onclick=minEdit(\"'+row.id+'\",'+ index +')>编辑</a>'
                mixtbody+='<a class="btn-sm btn-danger" href="javascript:void(0)" style="text-decoration:none" onclick=mindelet(\"'+row.id+'\",'+ index +')>删除</a>'
				return mixtbody
				}
				 
			}
		]
	});
	$('#tbodym').bootstrapTable("load", packageDetailInfo); //重载数据
};
//项目类型  
var itemTypeId=[]//项目类型的ID
var itemTypeName=[]//项目类型的名字
var itemTypeCode=[]//项目类型编号
function dataType(){
	if(packageInfo.dataTypeId!=""&&packageInfo.dataTypeId!=undefined&&packageInfo.dataTypeId!=null){
		typeIdList=packageInfo.dataTypeId;
	   
	}
	if(projectType==0){
		var code="A"
	}else if(projectType==1){
		var code="B"
	}else if(projectType==2){
		var code="C"
	}else if(projectType==3){
		var code="C50"
	}else if(projectType==4){
		var code="W"
	}
	 sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList) );
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code='+code,
		btn:['确定','取消'],
		scrolling:'no',
		success:function(layero, index){
		   var iframeWind=layero.find('iframe')[0].contentWindow;		        	        
		},
		yes:function(index,layero){
			var iframeWin=layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit()//触发事件得到选中的项目类型的值
			if(!dataTypeList){
				return;
			}
			//iframeWin.dataTypeList为所选项目类型返回的数组
			if(dataTypeList.length==0){
				parent.layer.alert("请选择一条项目类型");
	        	return;
			}
			itemTypeId=[];//项目类型的ID
			itemTypeName=[];//项目类型的名字
			itemTypeCode=[];//项目类型编号
						
			for(var i=0;i<dataTypeList.length;i++){
				itemTypeId.push(dataTypeList[i].id);	
				itemTypeName.push(dataTypeList[i].name);
				itemTypeCode.push(dataTypeList[i].code);
			};
			typeIdList=itemTypeId.join(",");//项目类型的ID
			typeNameList=itemTypeName.join(",");//项目类型的名字
			typeCodeList=itemTypeCode.join(",");//项目类型编号			
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList);
			parent.layer.close(index);
		}
	
	});
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
 //导出模板
function exportExcel(_index){
	if(_index==4){
		var url = config.bidhost + "/FileController/download.do?fname=明细信息.xls&ftpPath=/Templates/Pur/Pur_Bill_Of_Material_Template.xls";
	}
	window.location.href =$.parserUrlForToken(url);
	
}
//明细信息的批量导入
function importf(obj){ 
  var f = obj.files[0];  
  var formFile = new FormData();
  formFile.append("packageId", packageInfo.id); 
  formFile.append("excel", f); //加入文件对象
  var data=formFile
   $.ajax({
		type: "post",
		url: saveByExcelDetailed,
		async: true,
		dataType: 'json',
		cache: false,//上传文件无需缓存
        processData: false,//用于对data参数进行序列化处理 这里必须false
        contentType: false, //必须
		data: data,
		success: function(data) {
			if(data.success==true){
				packageDetailData()
				$("input[type='file']").val("")
			}else{
				obj.value = ''
				obj.outerHTML=obj.outerHTML;
				parent.layer.alert(data.message)
			}
			
		}
	});
	
}
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
        ,content:'Auction/common/Purchase/Purchase/model/add_project.html'
    });
});
//审核确定按钮
$("#btn_submit").click(function() {	
	if($("#packageId").val()==""){
		parent.layer.alert("请选择项目");        		
 		return false;
	}
	if($("#dataTypeName").val()==""||$("#dataTypeId").val()==""){
		parent.layer.alert("请选择项目类型");        		
 		return false;
	}	
	if($("#Package_Name").val()==""){
 		parent.layer.alert("包件名称不能为空");        		
 		return false;
 	};
 	if($("#Package_Name").val().length>100){
 		parent.layer.alert("包件名称长度补充超过100个字");        		
 		return false;
	};
	if($("#budgetPrice").val()==""){
		parent.layer.alert("预算价不能为空");        		
		return false;
	};
	if($("#purchaserDepartmentId").val()==""){
		parent.layer.alert("请选择采购人所属部门");        		
		return false;
	};
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
     	if($("input[name='isPublic']:checked").val()>1&&publicData.length==0){
     		parent.layer.alert("请邀请供应商");        		
     		return false;
     	};	     
//   	if(packageDetailInfo.length==0){
//   		parent.layer.alert("请添加明细信息");        		
//   		return false;
//   	};
 	}
 	$("#packageState").val(4);
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
	$("#packageState").val(0)
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
// 	var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
// 	$(this).val(b);
// })

// 税率(%) 输入校验
$(".posInt").on('change',function(){
	let v = $(this).val();
	if(v=='') return false;
	if(!(/^[1-9][0-9]*$/.test(v))){ 
		parent.layer.alert("税率必须为正整数"); 
		$(this).val("");
		return
	};
	if(v>99){
		parent.layer.alert("税率必须小于100正整数"); 
		$(this).val("");
		return
	}
})

 //是否需要税率
 $("input[name='isTax']").on('change',function(){
	if($(this).val()==1){
		$(".isTaxShow").show();
		$("input[name='tax']").val(6);
		$(".isTaxCol").attr('colspan','1')
	}else{
		$(".isTaxShow").hide();
		$("input[name='tax']").val("");
		$(".isTaxCol").attr('colspan','3')
	}
})
$('#reduceTax').on('click',function(){
	var obj = $("input[name='tax']");
           if (obj.val() <= 1) {
                obj.val(1);
           } else {
                obj.val(parseInt(obj.val()) - 1);
           }
    obj.change();
})
$('#addTax').on('click',function(){
	var obj = $("input[name='tax']");
           obj.val(parseInt(obj.val()) + 1);
           obj.change();
});
//清单文件
function detailedListFileChange(val){
	if (val == 1) {
		$("[name='isHasControlPrice'][value=1]").prop("checked", "checked");
		$("[name='isHasControlPrice'][value=0]").attr('disabled', true);
	}else{
		$("[name='isHasControlPrice'][value=0]").removeAttr('disabled');
	}
}