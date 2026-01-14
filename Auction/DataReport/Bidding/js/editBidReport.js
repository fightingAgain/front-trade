var findPurchaseUrl=config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'//根据项目ID获取所有项目信息内容
var WorkflowUrl=config.AuctionHost+"/WorkflowController/findNewWorkflowCheckerByType.do"//项目审核人列表数据接口
var saveProjectPackage=config.AuctionHost+'/BusinessStatisticsController/insertDateReportInfo.do';//添加包件的接口
var projectData=[];
var examTypes;
var isCheck;
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do';//获取项目信息的接口
var flage = $.getUrlParam('flage');//是否二次编辑
WORKFLOWTYPE = "ywtjb"
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function(){
	// 初始化省市联动
	getRegion = new MultiLinkage("#areaBlock", {name: "", status:1, code:'4206'});
	if(projectId!=null&&projectId!=undefined&&projectId!=""){
		// du(packageId,examType);
		
		Purchase(projectId);
		// callbackData(appointmentData)
	}else{
		$("#chBtn").show()
	}


	// 服务费小计= 招标代理服务费+ 标书款
	$('#realAgentPrice,#tenderStyle').change(function(){
		let a = $('#realAgentPrice').val();
		let b = $('#tenderStyle').val();
		$('#compositeServiceSubtoral').val( (+a + +b).toFixed(6))
	})
	let a1 = $('#realAgentPrice').val();
	let b1 = $('#tenderStyle').val();
$('#compositeServiceSubtoral').val( (+a1 + +b1).toFixed(6))
	//项目成本费用小计= 评审费小计+ 工作人员费用小计+ 综合服务费小计；
	$('#staffCostSubtotal,#reviewFeeSubtotal,#serviceFeleSubtotal').change(function(){
		let a = $('#staffCostSubtotal').val();
		let b = $('#reviewFeeSubtotal').val();
		let c = $('#serviceFeleSubtotal').val();
		$('#projectCostSubtotal').val( (+a + +b + +c).toFixed(6))
	})
	let a2 = $('#staffCostSubtotal').val();
		let b2= $('#reviewFeeSubtotal').val();
		let c2 = $('#serviceFeleSubtotal').val();
		$('#projectCostSubtotal').val( (+a2 + +b2 + +c2).toFixed(6))
})
var projectTypeDate={
	'A':'工程',
	'B':'货物',
	'C':'服务',
	'C50':'广宣',
}
function getProjectType(val){
	var type=(val.substring(0,3)=="C50"?"C50":val.substring(0,1))

	return type;
}
//获取数据
function Purchase(uid){		
	$.ajax({
		url: flage==1?findPurchaseUrl:findPurchaseURLHasId, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'get',
		async:false,
		dataType: 'json',
		data: {
			'tenderProjectID':uid,			
		},
		success: function(data) {			
			projectData=data.data;
			PurchaseData();											
		}
	});
	
	var reData = {
		"workflowLevel": 0,
		"workflowType": "ywtjb"
	}
	
	// if(packageInfo.id != ''){
	// 	reData.id = packageInfo.id;
	// 	$('.record').show();
	// 	findWorkflowCheckerAndAccp(packageInfo.id);
	// }
	
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
	time()
};
//渲染数据
function PurchaseData() {
	for(key in projectData){
		if(key=="bidSectionName"||key=="bidSectionCode"||key=="exceptionCause"||key=="exception"){
			$("#"+key).html(projectData[key]);
			$('input[name="'+ key +'"]').val(projectData[key]);
		}else if(key=="bidCheckType"){
			$('input[name="'+ key +'"]').val(projectData[key]);
			if(projectData[key]==3){
				$("#"+key).html('经评审的最低投标价法') 
			}
			if(projectData[key]==4){
				$("#"+key).html('最低投标价法')
			}
			if(projectData[key]==5){
				$("#"+key).html('最低评标价法')
			}
			if(projectData[key]==6){
				$("#"+key).html('经评审的最低投标价法（非日产）')
			}
			if(projectData[key]==7){
				$("#"+key).html('经评审的最低投标价法（日产）')
			}
			if(projectData[key]==9){
				$("#"+key).html('综合评估法(无权重)')
			}
			if(projectData[key]==10){
				$("#"+key).html('综合评估法(权重)')
			}
		}else if(key=="projectImplementAdder"){
			var getRegion = null;  // 行政区域
			// 初始化省市联动
			getRegion = new MultiLinkage("#areaBlock", {name: "", status:1, code:projectData['projectImplementAdder']});
		}else if(key=="publlcProcurement"){
			$('input[name='+ key +'][value='+ projectData[key] +']').attr('checked',true);
		}else{
			$('input[name="'+ key +'"]').val(projectData[key]);
			$('select[name="'+ key +'"]').val(projectData[key]);
			
		}
	}
	if(projectData["projectType"]){
		$("#projectType").val(getProjectType(projectData['projectType']))
		$('input[name="projectType"]').val(projectData['projectType']);
	}else{
		$("#projectType").val(getProjectType('C50'))
		$('input[name="projectType"]').val('C50');	
	}
	$("#tenderProjectID").val(projectId);
	$("#month" ).val(projectData.complectMonth)
	$("#content").val(projectData.backups)
	if(projectData["exception"]) {	
		$(".exceptionView1").show()
	}


};
$("#projectType").on('change',function(){
	$('input[name="projectType"]').val($(this).val());	
})
//审核确定按钮
$("#btn_submit").click(function() {
	
	if($("#employeeId").val()==""){   
			parent.layer.alert("请选择审核人");        		     		
			 return false;      	
		};
		
	if(checkForm($("#formbackage"))){//必填验证，在公共文件unit中
			saveFuct()
	}
	    
		
});
function saveFuct(){
	var projectImplementAdder = '';
	//是否选行政区域
	if($("#areaBlock select:eq(2)").val()){
		projectImplementAdder = $("#areaBlock select:eq(2)").val();
	} else {
		projectImplementAdder = $("#areaBlock select:eq(1)").val();
	}
	if(!projectImplementAdder){
		parent.layer.alert("请选择行政区域", function(idx){
			parent.layer.close(idx);
			$('#collapseTwo').collapse('show');
			$("#areaBlock select:eq(2)").focus();
		});
		return;
	}
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {

			$.ajax({   	
			   	url:saveProjectPackage,//修改包件的接口
			   	type:'post',
			   	//dataType:'json',
			   	async:false,
			   	//contentType:'application/json;charset=UTF-8',
			   	data:$("#formbackage").serialize()+'&checkState=1'+'&auditorId='+$('#employeeId option:selected') .val()+
			   	'&auditorName='+$('#employeeId option:selected') .text()+"&tenderType=4"+"&projectImplementAdder="+projectImplementAdder+'&compositeServiceSubtoral='+$("#compositeServiceSubtoral").val()+
	         	'&projectCostSubtotal='+$("#projectCostSubtotal").val(),
			   	success:function(data){			   		
			   		if(data.success==true){
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
			   			parent.layer.alert("提交成功")
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						parent.layer.close(parent.layer.getFrameIndex(window.name));	
			   			
			   		}else{
			   			parent.layer.alert(data.message)
			   			return false;
			   		}
			   	}   	
			});	
		});
	} else {
       $.ajax({   	
		   	url:saveProjectPackage,//修改包件的接口
		   	type:'post',
		   	//dataType:'json',
		   	async:false,
		   	//contentType:'application/json;charset=UTF-8',
		   	data:$("#formbackage").serialize()+'&checkState=1'+'&auditorId='+$('#employeeId option:selected') .val()+
		   	'&auditorName='+$('#employeeId option:selected') .text()+"&tenderType=4&projectImplementAdder="+projectImplementAdder+'&compositeServiceSubtoral='+$("#compositeServiceSubtoral").val()+
	   	'&projectCostSubtotal='+$("#projectCostSubtotal").val(),
		   	success:function(data){			   		
		   		if(data.success==true){
					if(top.window.document.getElementById("consoleWindow")){
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
		   			parent.layer.alert("提交审核成功")
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					parent.layer.close(parent.layer.getFrameIndex(window.name));			   			
		   		}else{
		   			parent.layer.alert(data.message);
		   			return false;
		   		}
		   	}   	
		});	
	}
}
//保存
$("#btn_bao").click(function() {
	
	var projectImplementAdder = '';
	//是否选行政区域
	if($("#areaBlock select:eq(2)").val()){
		projectImplementAdder = $("#areaBlock select:eq(2)").val();
	} else {
		projectImplementAdder = $("#areaBlock select:eq(1)").val();
	}	
    $.ajax({   	
	   	url:saveProjectPackage,//修改包件的接口
	   	type:'post',
	   	//dataType:'json',
	   	async:false,
	   	//contentType:'application/json;charset=UTF-8',
	   	data:$("#formbackage").serialize()+'&checkState=0'+'&auditorId='+$('#employeeId option:selected') .val()+
	   	'&auditorName='+$('#employeeId option:selected') .text()+"&tenderType=4&projectImplementAdder="+projectImplementAdder+'&compositeServiceSubtoral='+$("#compositeServiceSubtoral").val()+
	   	'&projectCostSubtotal='+$("#projectCostSubtotal").val(),
	   	success:function(data){			   		
	   		if(data.success==true){
				if(top.window.document.getElementById("consoleWindow")){
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				}
	   			parent.layer.alert("保存成功");
	   		    parent.$('#table').bootstrapTable(('refresh')); 	
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

$(".departmentName, .projectDepartmentName").click(function(){
	var name=this.name;
	var uid=top.enterpriseId
	var mnuid = name == 'departmentName' ? $('input[name=departmentId]').val() :
		(name == 'projectDepartmentName' ? $('input[name=projectDepartmentId]').val() : null);
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
	var  itemTypeId=[];
	var  itemTypeName=[];
	for(var i=0;i<dataTypeList.length;i++){
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList=itemTypeId.join(",");
	typeNameList=itemTypeName.join(",");
	if (aRopName == 'departmentName'){
		$('input[name=departmentId]').val(typeIdList);
		$('input[name=departmentName]').val(typeNameList);
	}else if (aRopName == 'projectDepartmentName') {
		$('input[name=projectDepartmentId]').val(typeIdList);
		$('input[name=projectDepartmentName]').val(typeNameList);
	}
}

//验证金额
$(".priceNumber").on('change',function(){
	var regexNumber = new RegExp(/^(0|\+?[1-9][0-9]*)$/);
	var regexPrice = new RegExp('^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,6})?$');

	

	if($(this).attr('name') == 'tenderNumber' && !regexNumber.test($(this).val())){
		parent.layer.alert("温馨提示:投标人家数必须为大于等于0的整数！");
		$(this).val("");
		return ;
	};

	if(($(this).val().indexOf('.')+1) ==$(this).val().length){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		$(this).val("");
		return ;
	}
	if($(this).val().indexOf(',') !=-1){
		parent.layer.alert("温馨提示:请使用中文逗号，易于区分!");
		return;
	}
	
		var result=false;
	if(($(this).val().indexOf('，') !=-1)){
		var len=$(this).val().split('，');
	for(j = 0,num=len.length; j < num; j++) {

		
	if((len[j].indexOf('.')+1) ==len[j].length){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		
		return ;
	}
		
		var result=regexPrice.test(len[j])
		if(result==false){
			break;
		}
	}
	if(!result){ 
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		return;
	};	
	}else{
		if(!regexPrice.test($(this).val())){ 
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		$(this).val("");
		return;
	};	

	}
});
/*	if(parseFloat($(this).val())=="0"){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数"); 
		$(this).val("");
		
		return
	}*/
	

