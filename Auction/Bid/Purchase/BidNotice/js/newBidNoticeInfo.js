var WorkflowTypeUrl = top.config.bidhost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口

var packageId = getUrlParam("id"); 
var projectId = getUrlParam("projectId");
var examType =  getUrlParam("examType"); //阶段资格审查方式 0预审 1后审
var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情

var tenderTypeCode = 0;//询比采购

var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头


var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck = false; //是否设置流程
var WORKFLOWTYPE = "jggs"; //申明项目公告类型

var data;
var businessid = '';//审批流程id

var projectType= "";

$(function() {
	if(keyId == 'undefined'){
		keyId = "";
	}
	
	var url = "";
	var para;
	if(examType==0){
		$("#examTypeName").html('资格审核结果公示')	
	}else{
		$("#examTypeName").html('询比采购结果公示')
	}
	if(type != "RELEASE") {
		//查看
		// $(".NewsContents").show();
		new UEditorEdit({
			pageType: "view",
			contentKey:"noticeContent"
		});	
		url = top.config.bidhost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: keyId,
			tenderType: tenderTypeCode,//0为询比采购，1为竞价采购，2为竞卖
			examType:examType
		}
	} else {
		//发布
		// $(".NewsContent").show();	
		new UEditorEdit({
			contentKey:"noticeContent"
		});	
		url = top.config.bidhost + "/BidNoticeController/findPackageInfo.do";
		para = {
			packageId: packageId,
			tenderType: tenderTypeCode, //0为询比采购，1为竞价采购，2为竞卖
			examType:examType
		}
		if(typeof(keyId) != 'undefined' && keyId) {
			para.bidNoticeId = keyId;	
			businessid = keyId;
		}
		
	}
	
	
	$.ajax({
		url: url,
		data: para,
		async: false,
		success: function(data) {
			if(data.success) {
				data = data.data;		
				
				projectType = data.projectType;//项目类型
				
				if(type == "RELEASE") {
					WorkflowUrl() //加载审核人
					$(".workflowList").hide();					
					$("#projectName").html(data.projectName);
					$("#projectCode").html(data.projectCode);
					if(data.isPublic>1){
						$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
					}else{
						$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
					}
					$("#purchaserName").html(data.purchaserName);
					$("#purchaserAddress").html(data.purchaserAddress);
					$("#purchaserLinkmen").html(data.purchaserLinkmen);
					$("#purchaserTel").html(data.purchaserTel);
					$("#bidNoticeStartDate").val(data.openStartDate!=undefined?data.openStartDate.substring(0,16):"");
					$("#bidNoticeEndDate").val(data.opetEndDate!=undefined?data.opetEndDate.substring(0,16):"");
					$("#packageName").html(data.packageName);
					$("#packageNum").html(data.packageNum);
					if(data.priceChecks != undefined){
						var priceChecks = data.priceChecks;
					
						for(var i = 0; i < priceChecks.length; i++) {								
						bidNoticetable+='&enterpriseIds['+ i +']='+priceChecks[i].id	;
						}
					}
					mediaEditor.setValue(data);
					if(data.noticeContent){
						// ue.ready(function() {
 						// 	ue.execCommand('insertHtml', data.noticeContent);
						// }); 
					}else{
						//生成固定模版
						wordHtml();
					}
					
				} else {
					$('.update').hide();
					$(".view").show();
					$(".isWatch").hide();
					$('.employee').hide(); //查看不显示审核人
                    
					$("#projectName").html(data.projectName);
					$("#projectCode").html(data.projectCode);
					if(data.isPublic>1){
						$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
					}else{
						$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
					}
					$("#purchaserName").html(data.purchaserName);
					$("#purchaserAddress").html(data.purchaserAddress);
					$("#purchaserLinkmen").html(data.purchaserLinkmen);
					$("#purchaserTel").html(data.purchaserTel);
					$("#bidNoticeStartDate1").text(data.openStartDate!=undefined?data.openStartDate.substring(0,16):"");
					$("#bidNoticeEndDate1").text(data.opetEndDate!=undefined?data.opetEndDate.substring(0,16):"");
					$("#packageName").html(data.packageName);
					$("#packageNum").html(data.packageNum);
					// $("#NewsContent").html(data.noticeContent);
					mediaEditor.setValue(data);
					
				}
				initMediaVal(data.options, {
					stage: 'jggs',
					disabled: type != "RELEASE",
					projectId: projectId,
					packageId: packageId,
				});	
				mediaEditor.setValue(data);
			}
			
		}
	});
		
	
	
	if(typeof(keyId) != 'undefined' && keyId) {
		//审批记录
		$(".workflowList").show();	
		findWorkflowCheckerAndAccp(keyId);
	}
	
	if(type != "RELEASE") {
		//查看
		$("input[name='isPublic']").attr("disabled", "disabled");
		$("#bidNoticeStartDate").attr("disabled", "disabled");
		$("#bidNoticeEndDate").attr("disabled", "disabled");
		$("#btn_submit").hide();
		$("#btns").html("");		
	}else{
		//发布
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
		if(examType==0){
			modelOption({'tempType':'inquiryRatioResultsPublicity', 'examinationType':1,'projectType':projectTypes});
			$("#noticeTemplate").attr('name','examTemplateId');
			if(data){
				$("#noticeTemplate").val(data.examTemplateId);//公告模板id
			}		
		}else{
			modelOption({'tempType':'inquiryRatioResultsPublicity', 'examinationType':2,'projectType':projectTypes});
			$("#noticeTemplate").attr('name','templateId');
			if(data){
				$("#noticeTemplate").val(data.templateId);//公告模板id
			}	
		}
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
				modelHtml({'type':'jggs', 'projectId':projectId,'packageId':packageId,'tempId':templateId,'tenderType':0,'examType':examType})
				parent.layer.close(index);			 
			  }, function(index){
				 parent.layer.close(index)
			  });	
		})
	}
});

$("#btn_submit").click(function() {
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidNoticeStartDate = $("#bidNoticeStartDate").val();
	var bidNoticeEndDate = $("#bidNoticeEndDate").val();

	if(!isPublic) {
		parent.layer.alert("请选择是否公开");
		return;
	}
	if(bidNoticeStartDate == "") {
		parent.layer.alert("请选择公示开始时间");
		return;
	}
	if(bidNoticeEndDate == "") {
		parent.layer.alert("请选择公示截止时间");
		return;
	}
	// 公开
	if (isPublic == '0' && !isMediaValid()) {
		return;
	}
	var d1 = NewDate(bidNoticeStartDate);
	var d2 = NewDate(bidNoticeEndDate);
	if(d1 >= d2) {
		parent.layer.alert("结束时间不能早于开始时间");
		return;
	}
	if(bidNoticeEndDate == "") {
		parent.layer.alert("请选择公示截止时间");
		return;
	}
	if(!mediaEditor.isValidate()){
		// parent.layer.alert("请填写结果公示或者选择结果公示模板");
		return;
	} 
	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			parent.layer.alert("请选择审核人");
			return;
		}
	}
	var para = {
		projectId: projectId,
		packageId: packageId,
		isOpen: isPublic,
		openStartDate: bidNoticeStartDate,
		opetEndDate: bidNoticeEndDate,
		tenderType:tenderTypeCode,
		noticeContent:ue.getContent(),
		// 媒体发布
		'optionId': typeIdLists,
		'optionValue': typeCodeLists,
		'optionName': typeNameLists,
	}
     
	if(isWorkflow) {
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}
	if(type == "RELEASE"){
		para.id = keyId;
	}
	if(examType==0){
		para.examTemplateId=$("#noticeTemplate").val();	
	}else{
		para.templateId=$("#noticeTemplate").val();	
	}
	para.examType = examType;
	para = $.extend(para, mediaEditor.getValue())
	//提交
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$.ajax({
				url: top.config.bidhost + "/BidNoticeController/saveBidNotice.do?",
				type: 'post',
				data: para,
				success: function(data) {
					if(data.success) {
						if(top.window.document.getElementById("consoleWindow")){//项目控制台刷新
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
						}
						parent.$('#BidNoticeList').bootstrapTable('refresh');
						parent.layer.close(parent.layer.getFrameIndex(window.name));
						top.layer.alert("发布成功");
					} else {
						layer.alert(data.message);
					}
				}
			});
		})
	} else {
		$.ajax({
			url: top.config.bidhost + "/BidNoticeController/saveBidNotice.do?",
			type: 'post',
			data: para,
			success: function(data) {
				if(data.success) {
					if(top.window.document.getElementById("consoleWindow")){//项目控制台刷新
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
					}
					parent.$('#BidNoticeList').bootstrapTable('refresh');
					parent.layer.close(parent.layer.getFrameIndex(window.name));
					top.layer.alert("发布成功");
				} else {
					layer.alert(data.message);
				}
			}
		});
	}

});
$('#bidNoticeStartDate').click(function(){
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd HH:mm',
		minDate: nowSysDate,
		maxDate:'#F{$dp.$D(\'bidNoticeEndDate\')}',
		onpicked:function(dp){
			var selectTime = dp.cal.getNewDateStr(); //选中的时间
			$dp.$('bidNoticeEndDate').click();
		}
	});
});
$('#bidNoticeEndDate').click(function(){
	var nowSysDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
	var noticeMin='';
	if($('#bidNoticeStartDate').val()!=""){
			noticeMin=$('#bidNoticeStartDate').val();
	}else{
		noticeMin=nowSysDate;
	}
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd HH:mm',
		minDate: noticeMin,
		onpicked:function(dp){
			var selectTime = dp.cal.getNewDateStr(); //选中的时间
		}
	});
});
function NewDate(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date();   
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1]);
  return date.getTime();  
} 
function NewDateT(str){  
  if(!str){  
    return 0;  
  }  
  arr=str.split(" ");  
  d=arr[0].split("-");  
  t=arr[1].split(":");
  var date = new Date(); 
  date.setUTCFullYear(d[0], d[1] - 1, d[2]);   
  date.setUTCHours(t[0]-8, t[1], t[2], 0);
  return date;  
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});

function WorkflowUrl() {
	var reData = {
		"workflowLevel": 0,
		"workflowType": "jggs"
	}
	if(businessid != ''){
		reData.id = businessid;
	}
	$.ajax({
		url: WorkflowTypeUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function(data) {
			var option = ""
			//判断是否有审核人		   	  
			if(data.message == 0) {
				isCheck = true;
				//$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				isWorkflow = 0;
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				isWorkflow = 1;
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				$("#btn_submit").hide();
				$('.employee').hide();
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

function wordHtml(){
 	$.ajax({
 		   	url:parent.config.bidhost + '/WordToHtmlController/wordToHtml.do', 
 		   	type:'post',
 		   	dataType:'json',
 		   	async:false,
 		   	//contentType:'application/json;charset=UTF-8',
 		   	data:{
 		   		"packageId":packageId,
 		   		"projectId":projectId,
 		   		"examType":examType,
 		   		'type':'jggs',
 		   		'tenderType':tenderTypeCode
 		   	},
 		   	success:function(result){	 
 		   		if(result.success){	
 		   			ue.ready(function() {
 							
 						ue.execCommand('insertHtml', result.data);
 					}); 
 		   		}
 		   	}  
 		});
}
