var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var WorkflowUrl=config.bidhost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var findInitMoney = config.bidhost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetail.do"; //查询保证金账号
var findSupplier=config.bidhost + '/PurchaseController/findExamTypeSupplierList.do'
var opurl =config.Syshost +  "/OptionsController/list.do";
var saveProjectPackage=config.bidhost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var packagePrice = [];//费用信息
var projectType = getUrlParam("projectType");
var examType=1;
var examTypeShow=1;
var yaoqing="";
var isCheck=false;//判断是否设置了审核人。false为设置了true为没有设置
//打开弹出框时加载的数据和内容。
//实例化编辑器
function initUEditor(echoObj){
	// var echoObj = {publishType:2,pdfUrl:"/df2023/20240325/pdf/0abb5a67e86c49c8b64639b84b44da93.pdf"}
	new UEditorEdit({
		// pageType:"view",
		examType:examType,
		echoObj:echoObj,
		// 查看页面不需要回调uploadSuccess
		uploadSuccess: function(data){
			console.log(parent.serializeArrayToJson($("#formbackage").serializeArray()));
			console.log('uploadSuccess',data);
		}
	})
}

var WORKFLOWTYPE = 'xmgg';
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var createType=getUrlParam('createType');
// var fileUp; //报价
var depositList,isDf;
$(function(){
	initUEditor();
	if(packageId){
		du(packageId);
		mediaEditor.setValue(packageInfo)
		invitDatetimepicker(examType);
		/*start报价*/
		/* offerFormData();
		fileList(); */
		/*end报价*/
	}
		
	if(projectType != 0){
		$('.topPrice').show();
	}
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				

	},1000);
	if(sysEnterpriseId){
		var arrlist = sysEnterpriseId.split(',');
		if(arrlist.indexOf(top.enterpriseId)!=-1){
			isDf=true
			getDeposit()
		}
	}
})

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
 //费用信息查询
 var priceIds="",priceNames="";
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
	if($("#agencyDepartmentId").val()==""){
		parent.layer.alert("请选择代理机构所属部门");        		
		return false;
	}
	if($("#budgetPrice").val()==""){
		parent.layer.alert("预算价不能为空");        		
		return false;
	};
	if($('[name=depositPrice]').length > 0 && $.trim($('[name=depositPrice]').val()) == ''){
		parent.layer.alert("请输入保证金金额");
		return false;
	}
//	if(packageDetailInfo.length==0){
//		parent.layer.alert("请添加明细信息");        		
//		return false;
//	};
	if(publicData.length==0){
		parent.layer.alert("请邀请供应商");        		
		return false;
	};
	/* if($("input[name='isOfferDetailedItem']:checked").val()==0){
		if(fileUp.options.filesDataDetail.length==0){
			parent.layer.alert("请上传分项报价表模板");        		
			return false;
		}
	} */
	if(timeCheck($("#timeList"))){	
		if(!mediaEditor.isValidate()){
			return
		}	
		if($("#employeeId").val()==""){
			parent.layer.alert('请选择审核人');
			return ;         			
		}; 
		var States;
		States='&packageState=1&inviteState=1';
		if(publicData.length<parseInt($("#supplierCount").val())){
			parent.layer.confirm('温馨提示：邀请供应商家数小于当前设置的最小供应商数量，是否确认提交？', {
				btn: ['是', '否'] //可以无限个按钮
			  }, function(index, layero){

					if(isDf){
						if(depositList.subitemData()){
							top.layer.confirm('邀请{'+depositList.subitemData()+'},保证金没有转移到本项目，确认不转移吗？', function(indexd) {
								iscekck(States,examType);
								parent.layer.close(indexd);
							})
						}else{
							iscekck(States,examType);
						}
					}else{
						iscekck(States,examType);
					}					
					parent.layer.close(index);			 
			  }, function(index){
				 parent.layer.close(index)
			  });
		}else{

			if(isDf){
				if(depositList.subitemData()){
					top.layer.confirm('邀请{'+depositList.subitemData()+'},保证金没有转移到本项目，确认不转移吗？', function(indexd) {
						iscekck(States,examType);
						parent.layer.close(indexd);
					})
				}else{
					iscekck(States,examType);
				}
			}else{
				iscekck(States,examType);
			}
			
		}
		
	}		
	
	
});
//保存
$("#btn_bao").click(function() {
	var States='&packageState=5&inviteState=0';
	var packUrl=saveProjectPackage;
 	$("#remark").val(ue.getContent());

	// 时间处理
	var vmForm = $("#formb");
	['noticeEndDate','acceptEndDate', 'sellFileEndDate','signEndDate'].forEach(function(key) {
		var value = vmForm.find('#' + key).val();
		if (value && value.length == 16) {
			vmForm.find('#' + key).val(value + ':59')
		}
	}) 
    $.ajax({
		url: packUrl, //查看 详细信息
		async: false,
		type: 'post',
		dataType: 'json',
		data:$("#formb").serialize()+States,
		success: function(data) {
		 if(data.success){
			['noticeEndDate', 'acceptEndDate','sellFileEndDate','signEndDate'].forEach(function(key) {
				var value = vmForm.find('#' + key).val();
				if (value && value.length > 16) {
					vmForm.find('#' + key).val(value.slice(0,16))
				}
			})
			if(top.window.document.getElementById("consoleWindow")){
				var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
				var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				dcmt.getDetail();
			}
			if($("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
				deleteItems();
			}
			if(isDf){
				depositList.saveData(2);
			}
			parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
		 	parent.layer.alert("保存成功")
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
function iscekck(States){
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$("#remark").val(ue.getContent())
			// 时间处理
			var vmForm = $("#formb");
			['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
				var value = vmForm.find('#' + key).val();
				if (value && value.length == 16) {
					vmForm.find('#' + key).val(value + ':59')
				}
			}) 
			$.ajax({   	
			   	url:saveProjectPackage,//修改包件的接口
			   	type:'post',
			   	//dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:$("#formb").serialize()+States,
			   	success:function(data){			   		
			   		if(data.success==true){	
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}	
						if(examType==1&&$("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
							deleteItems();

						}   
						if(isDf){
							depositList.saveData(1);
						}			
						// 校验报价表是否存在 
						top.checkBidFilesTips(packageId, '02', examType, "发送邀请函成功");
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
						parent.layer.close(parent.layer.getFrameIndex(window.name));	
   						
			   		}else{
			   			parent.layer.alert(data.message)
			   		}
			   	}   	
			});	
		});
	} else {
		$("#remark").val(ue.getContent())
		// 时间处理
		var vmForm = $("#formb");
		['noticeEndDate', 'signEndDate', 'sellFileEndDate', 'acceptEndDate'].forEach(function(key) {
			var value = vmForm.find('#' + key).val();
			if (value && value.length == 16) {
				vmForm.find('#' + key).val(value + ':59')
			}
		}) 
       	$.ajax({   	
		   	url:saveProjectPackage,//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:$("#formb").serialize()+States,
		   	success:function(data){			   		
		   		if(data.success==true){
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					if($("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
						deleteItems();
					}
					if(isDf){
						depositList.saveData(1);
					}
		   			// 校验报价表是否存在 
						top.checkBidFilesTips(packageId, '02', examType, "发送邀请函成功");
		   			parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
   					parent.layer.close(parent.layer.getFrameIndex(window.name));
		   		}else{
		   			parent.layer.alert(data.message)
		   		}
		   	}   	
		});	
	}
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
function employees(){
	var reData = {
		"workflowLevel": 0,
		"workflowType": "xmgg"
	}
	
	if(packageInfo.id != ''){
		reData.id = packageInfo.id;
		$('.record').show();
		findWorkflowCheckerAndAccp(packageInfo.id);
	}
	
	//获取审核人列表
	$.ajax({
		   	url:WorkflowUrl,
		   	type:'get',
		   	dataType:'json',
		   	async:false,
		   	data: reData,
		   	success:function(data){	
		   		
		   	   var option=""
		   	   //判断是否有审核人		   
		   	   if(data.message==0){	
		   	   		isCheck = true;
		   	   	    $("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
		   	   	    $('.employee').hide()
		   	   	    return;
		   	   	};
		   	   if(data.message==2){		   	   	
		   	   	 	parent.layer.alert("找不到该级别的审批人,请先添加审批人");
		   	   	 	massage2=data.message;
	     	        return;
		   	   };
		   	    var checkerId = ''; 
				if(data.success == true) {
					$('.employee').show()
					isWorkflow = 1;
					if(data.data){
						if(data.data.workflowCheckers.length == 0) {
							option = '<option>暂无审核人员</option>'
						}
						if(data.data.workflowCheckers.length > 0) {
							
							if(data.data.employee){
								checkerId = data.data.employee.id;
							}
							option = "<option value=''>请选择审核人员</option>";
							var checkerList = data.data.workflowCheckers;
							for(var i = 0; i < checkerList.length; i++) {
								
								if(checkerId != '' && checkerList[i].employeeId == checkerId){
									option += '<option value="' + checkerList[i].employeeId  + '" selected="selected">' + checkerList[i].userName + '</option>'
								}else{
									option += '<option value="' + checkerList[i].employeeId  + '">' + checkerList[i].userName + '</option>'	
								}
								
							}
						}
					}else{
						option = '<option>暂无审核人员</option>'
					}
				}		   	    
				$("#employeeId").html(option);		
		   	}
});
}


/*start报价表  调用报价封装方法 */
/* function offerFormData(){
	$("#offerForm").offerForm({
		saveurl:config.bidhost+'/PackagePriceListController/savePriceList.do',//保存接口
		viewURL:config.bidhost+'/PackagePriceListController/findPackageQuateList.do',//回显接口
		parameter:{//接口调用的基本参数
			packageId:packageInfo.id,
			projectId:packageInfo.projectId, 
			examType:examType,
		},
		status:1,//1为编辑2为查看
		offerSubmit:'.offerBtn',//提交按钮类名
		tableName:'offerTable'//表格名称
	})
}
//分项报价附件
function fileList(){
	if(!fileUp){
		fileUp=$("#fileList").fileList({
			status:1,//1为编辑2为查看
			parameter:{//接口调用的基本参数
				packageId:packageInfo.id,
				projectId:packageInfo.projectId, 
				offerFileListId:"0"
			},
			offerSubmit:'.fileBtn',//提交按钮
			isShow:packageInfo.isOfferDetailedItem,//是否需要分项报价
			offerAttention:packageInfo.offerAttention,
			flieName: '#fileHtml',//分项报价DOM
	
		})
	}
} */
/*end报价*/
//原项目保证金转移到本项目
function getDeposit(){
	if(!depositList){
		depositList=$("#depositHtml").deposit({			
			status:1,//1为编辑2为查看
			tenderType:0,
			parameter:{//接口调用的基本参数
				projectId:packageInfo.projectId,
				packageId:packageInfo.id, 
				projectForm:0,
			},
			isPayDeposit:packageInfo.isPayDeposit,
			packageData:[
				{
					packageId:packageInfo.id,
					projectId:packageInfo.projectId, 
					projectForm:0
				}
			]
		})
	}

}