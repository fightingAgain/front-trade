var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var Detailedlist=config.bidhost +'/PackageDetailedController/list.do'//明细查看
var Detaileddelete=config.bidhost +'/PackageDetailedController/delete.do'//明细删除
var saveByExcelDetailed=config.bidhost+'/PackageDetailedController/saveByExcel.do'//批量导入明细信息
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetailForPur.do"; //查询保证金账号
var checkItemUrl='Auction/common/Agent/Purchase/model/checkListItem.html';//添加明细路径
var opurl =config.Syshost +  "/OptionsController/list.do";
var packagePrice = [];//费用信息
var typeIdList="";//项目类型的ID
var typeNameList="";//项目类型的名字
var typeCodeList="";//项目类型编号
var projectType;
var examType=1;
var edittype="";
var packageInfo=""//包件信息
var packageDetailInfo=[]//明细信息
var publicData=[];//邀请供应商数据列表
var isSetServiceCharges='YES',ptPrice,isSetSign='YES',SignMorny,appointmentData;
//打开弹出框时加载的数据和内容。
function du(uid){
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
				publicData=packageInfo.projectSupplierList;
				if(packageInfo.biddingRoomAppointment){
					for(var i=0;i<packageInfo.biddingRoomAppointment.length;i++){
						if(packageInfo.biddingRoomAppointment[i].examType==packageInfo.examType){
							appointmentData=packageInfo.biddingRoomAppointment[i]
						}
					}		
				}
	   	  	}	   		   			   		   			   	
	   	},
	   	error:function(data){
	   		parent.layer.alert("修改失败")
	   	}
	});	
	//公告模板下拉选择
	if(projectType==0){//项目的项目类型。
		var projectTypes='A';
	}
	if(projectType==1){
		var projectTypes='B';
	}
	if(projectType==2){
		var projectTypes='C';
	}
	if(projectType==3){
		var projectTypes='C50';
	}
	if(projectType==4){
		var projectTypes='W';
	}
	modelOption({'tempType':'inquiryRatioNotice', 'examinationType':2,'projectType':projectTypes});
	$("#noticeTemplate").val(packageInfo.templateId);//公告模板id
	//生成模板按钮
	$("#btnModel").on('click',function(){
		if($('#noticeTemplate').val()!=""){
			var templateId=$('#noticeTemplate').val()
		}else{
			parent.layer.alert('温馨提示：请先选择模板');
			return false;
		}
		if(packageInfo.templateId){
			parent.layer.confirm('温馨提示：是否确认切换模板', {
				btn: ['是', '否'] //可以无限个按钮
			  }, function(index, layero){
				changHtml(templateId)
				parent.layer.close(index);			 
			  }, function(index){
				 parent.layer.close(index)
			  });
		}else{
			changHtml(templateId)
		}	
	})
	callbackData(appointmentData)
    $("#addProject").hide();
	package();
	previewC();	
	getProjectPrice(packagePrice);
	packageDetailData();
	Check_Plan_change(packageInfo.checkPlan);
	
	//start 招标代理服务费
	if(packageInfo.projectServiceFee){
		for(var key in packageInfo.projectServiceFee){
			if(key == "collectType"){
				$("#collectType").html(packageInfo.projectServiceFee[key]==1?"标准累进制":(packageInfo.projectServiceFee[key]==2?"其他":"固定金额"));
			} else {
				$("#" + key).html(packageInfo.projectServiceFee[key]);
			}
		}
	}
	//end 招标代理服务费
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
				modelHtml({'type':'xmgg', 'projectId':packageInfo.projectId,'packageId':packageInfo.id,'tempId':templateId,'tenderType':0,'examType':1})
			}else{
				parent.layer.alert(data.message)
			}
		}   	
	});		
}
// 选择部门
$(".Department").on("click",function(){
	var name=$(this).data('title');
	if(name=='agency'){
		var uid=top.enterpriseId
		var mnuid=packageInfo.agencyDepartmentId;
	}else{
		var uid=packageInfo.purchaserId;
		var mnuid=packageInfo.purchaserDepartmentId
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
})
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
	montageHtml();
	// 包件名称
	$("#packageName").html(packageInfo.packageName);
	// 包件编号
	$("#packageNum").html(packageInfo.packageNum);
	// 包件排序
	$("#sort").val(packageInfo.sort);
	// 包件id
	$("#packageId").val(packageInfo.id);
	// 项目id
	$("#projectId").val(packageInfo.projectId);
	// 资格预审还是资格后审0为预审1为后审
	$("#examType").val(examType);
	$("#examtypeName").html(packageInfo.examType==0?'资格预审':'资格后审');  
	// 重新采购，1为重新采购
	$("#packageSource").val(packageInfo.packageSource);
	// 项目类型
	if(packageInfo.dataTypeName!=""&&packageInfo.dataTypeName!=undefined){
		$("#dataTypeName").val(packageInfo.dataTypeName);
		$("#dataTypeId").val(packageInfo.dataTypeId);
		$("#dataTypeCode").val(packageInfo.dataTypeCode);
	}
	$("#agencyDepartmentId").val(packageInfo.agencyDepartmentId);
	$("#agencyDepartment").val(packageInfo.agencyDepartmentName);
	$("#purchaserDepartmentId").val(packageInfo.purchaserDepartmentId);
	$("#purchaserDepartment").val(packageInfo.purchaserDepartmentName);
	$('input[name="budgetPrice"]').val(packageInfo.budgetPrice);	
	$('input[name="noTaxBudgetPrice"]').val(packageInfo.noTaxBudgetPrice);
	$('input[name="taxRate"]').val(packageInfo.taxRate);
	
	$('input[name="supplierCount"]').val(packageInfo.supplierCount||1);
	$("#offerAttention").html(packageInfo.offerAttention);
	// 资格后审的评审方法，0为综合评分法，1为最低评标价法，2为最低投标价法，3为经评审的最低价法(价格评分), 4经评审的最高投标价法,5经评审的最低投标价法
	$("input[name='checkPlan'][value='"+ packageInfo.checkPlan +"']").attr("checked",true);
	$('.tenderTypeW').show();					
	$("input[name='isPublic'][value='"+ (packageInfo.isPublic||0) +"']").prop("checked",true);	
	// 是否需要提供分项报价表		
	$("input[name='isOfferDetailedItem'][value='"+ packageInfo.isOfferDetailedItem +"']").prop("checked",true); 
	$("#supplierClassifyName").html(packageInfo.supplierClassifyName);
	$("#isSign").html(packageInfo.isSign==0?'不需要报名':'需要报名');
	$("#isPaySign").html(packageInfo.isPaySign==0?'需要缴纳报名费':'不需要缴纳报名费');
	$("#isSellFile").html(packageInfo.isSellFile==0?'发售文件':'不发售文件');
	$("#bankType").html(packageInfo.bankType == 1 ? "工商银行" : packageInfo.bankType == 2? "招商银行":'');
	$("#isSellPriceFile").html(packageInfo.isSellPriceFile==0?'发售文件':'不发售文件'); 
	if(packageInfo.isPayDeposit==0){
		$('.isDepositShow').show();		
	}else{
		$('.isDepositShow').hide();		
	};
	if(packageInfo.isPublic==0){
		$("#isPublic").html("所有供应商")
	}
	if(packageInfo.isPublic==1){
		$("#isPublic").html("所有本公司认证供应商")
	}
	if(packageInfo.isPublic==2){
		$("#isPublic").html("仅限邀请供应商")
	}
	if(packageInfo.isPublic==3){
		$("#isPublic").html("仅邀请本公司认证供应商")
	}
	employees();
	if(packageInfo.isPublic>1){	
		$(".yao_btn").show();
		Public()				
	}else{
		$(".yao_btn").hide();	
	}          
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
			examType:1
		},
		success: function(data) {
			if(data.success==true){
				
			}
		}
	});
}
/* $(".priceNumber").on('change',function(){
	if(!(/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/.test($(this).val()))){ 
		parent.layer.alert("金额必须大于零且最多两位小数"); 
		$(this).val("");
		
		return
	};
	var b = (parseInt( $(this).val() * 1000000 ) / 1000000 ).toFixed(top.prieNumber||2);
	$(this).val(b);
}) */