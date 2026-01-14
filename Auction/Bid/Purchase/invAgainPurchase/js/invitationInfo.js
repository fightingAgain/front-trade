

var nedata= []//发添加的tabs的数组
//包件添加信息
var data={}
//综合评分添加tabs的数组
 //添加评价项的数组
var Score_Total_num="";//分值合计
var packageCheckListId="";
var _$index=""
var flieListUrl=config.bidhost+'/PurFileController/list.do';//查看附件接口
var urlSaveAuctionFile = top.config.bidhost + "/FileController/uploadBatch.do"; //批量上传文件到服务器
var WorkflowUrl=config.bidhost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var sendUrl = config.Syshost+"/OptionsController/list.do"; //获取媒体的数据
var pricelist=config.bidhost +'/ProjectPriceController/findProjectPriceList.do'//费用查看
var pricesave=config.bidhost +'/ProjectPriceController/saveProjectPrice.do'//费用添加
var priceupdate=config.bidhost +'/ProjectPriceController/updateProjectPrice.do'//费用修改
var pricedelete=config.bidhost +'/ProjectPriceController/deleteProjectPrice.do'//费用删除
var findAndUpdatePrice =config.bidhost + "/ProjectPriceController/findAndUpdateProjectPrice.do"//修改并返回费用信息
var findInitMoney = config.bidhost + "/ProjectReviewController/findProjectCost.do"; //查询企业的默认费用值和保证金账号
var searchBank = parent.config.bidhost +"/DepositController/findAccountDetail.do"; //查询保证金账号
var findSupplier=config.bidhost + '/PurchaseController/findExamTypeSupplierList.do'
var opurl =config.Syshost +  "/OptionsController/list.do";
var saveProjectPackage=config.bidhost+'/PurchaseController/startWorkflowAccep.do';//添加包件的接口
var packagePrice = [];//费用信息
var WeightsTotal="";//权重值总和
var WeightTotalnum="";//已有权重值的和
var typeIdLists="";//媒体的ID
var typeNameLists="";//媒体名字
var typeCodeLists="";//媒体编号
var projectType = getUrlParam("projectType");
var examTypeShow=1;
var examType=1;
var l = 0;//0为询比采购6为单一来源采购	
var sortNum=0
var edittype="";//判断是否需要操作
var yaoqing='0'//判断是邀请供应商还是发送邀请函
var supplier=new Array();
var isCheck=false;//判断是否设置了审核人。false为设置了true为没有设置
var packageInfo=""//包件信息
var packageDetailInfo=[]//明细信息
var businessPriceSetData=""//自定义信息
var checkPlana=""
var publicData=[];//邀请供应商数据列表
var appointmentData;//预约信息
//打开弹出框时加载的数据和内容。
//实例化编辑器
//建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
var ue = UE.getEditor('editor');
var WORKFLOWTYPE = 'xmgg';
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var createType=getUrlParam('createType');
$(function(){
	new UEditorEdit({
		examType:examType,
	});
	if(packageId){
		du(packageId);
		mediaEditor.setValue(packageInfo);
		invitDatetimepicker(examType);
	}
	setTimeout(function(){
		var iframeid=$('#editor iframe').attr('id');
		var viewClass=$("#"+iframeid).contents().find("body.view").addClass('viewWitdh');				
	},1000)	
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
	if($("#dataTypeName").val()==""||$("#dataTypeId").val()==""||$("#dataTypeCode").val()==""){
		parent.layer.alert("请选择项目类型");        		
 		return false;
	}	
	if($("#purchaserDepartmentId").val()==""){
		parent.layer.alert("请选择采购人所属部门");        		
		return false;
	}
	if($("#budgetPrice").val()==""){
		parent.layer.alert("预算价不能为空");        		
		return false;
	};
	/* if($("input[name='isOfferDetailedItem']:checked").val()==0){
		if(fileUp.options.filesDataDetail.length==0){
			parent.layer.alert("请上传分项报价表模板");        		
			return false;
		}
	} */
//	if(packageDetailInfo.length==0){
//		parent.layer.alert("请添加明细信息");        		
//		return false;
//	};
	if(timeCheck($("#timeList"))){				
		if(!mediaEditor.isValidate()){
			// parent.layer.alert('请填写邀请函信息或选择邀请函模板');
			return ;
			
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
					iscekck(States,examType);
					parent.layer.close(index);			 
			  }, function(index){
				 parent.layer.close(index)
			  });
		}else{
			iscekck(States,examType);
		}
		
	}
	
});
//保存
$("#btn_bao").click(function() {
	var States='&packageState=5&inviteState=0';
	var packUrl=saveProjectPackage;	
 	$("#remark").val(ue.getContent());
    $.ajax({
		url: packUrl, //查看 详细信息
		async: false,
		type: 'post',
		dataType: 'json',
		data:$("#formb").serialize()+States,
		success: function(data) {
		 if(data.success){
			if(top.window.document.getElementById("consoleWindow")){
				var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
				var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
				dcmt.getDetail();
			}
			if(examType==1&&$("input[name='checkPlan']:checked").val()!=packageInfo.checkPlan){
				deleteItems();
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
						parent.layer.alert("发送邀请函成功")
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
		   			parent.layer.alert("发送邀请函成功")
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