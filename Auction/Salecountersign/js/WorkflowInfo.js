//公告类型   xmgg查询项目公告审核  xmby查询项目补遗的公告

var workflowLevel = ""; //查询评审人员  审核等级需升级 

var workflowLevelId = ""; //查询流程审批的id

var isworkflowAuditor = ""; //判断是选择提交审核人员  

//查询审核等级和审核人
var urlfindWorkflowCheckerAndAccp = top.config.AuctionHost + "/WorkflowController/findWorkflowCheckerAndAccp.do"

//提交审核
var urlupdateWorkflowAccep = top.config.AuctionHost + "/WorkflowController/updateWorkflowAccep.do";
var packageId="";
var ischeck=""
//在需要加载审核的页面加入调用此方法 且在 审核页面的html文件 加入审核的html 
function findWorkflowCheckerAndAccp(id) {
	packageId=id
	$.ajax({
		url: urlfindWorkflowCheckerAndAccp,
		type: "post",
		data: {
			"businessId": id,
			"accepType": WORKFLOWTYPE
		},
		dataType: "json",
		async: false,
		success: function(result) {

			var workflowItems = ""; //审核记录保存对象
			//审核记录为空
			if(result.data.workflowItems == undefined) {
				workflowItems = []; //为空数组
			} else {
				workflowItems = result.data.workflowItems; //保存审核记录数组
			}

			//加载审核记录	
			bindRecord(result.data.workflowItems);
			//如果是查看不走加载审核流程 只加载审核记录
			if(edittype == "detailed") { //审核查看同一页面    当查看时不载入审核内容
				$("#tableWorkflow").hide();
				$("#btn_submit").hide();
				return;
			}
           
			if(result.data.accep == undefined) { //查询的accep为空时   表示自己已审核
				parent.layer.alert("该项目您已审核！");
				$("#tableWorkflow").hide();
				$("#btn_submit").hide();
				return;
			}
			workflowLevelId = result.data.accep.id; //全局变量保存流程表Id

			workflowLevel = result.data.accep.workflowLevel; //全局变量保存 当前审核等级
			ischeck=result.data.message
			if(result.data.message == "0") { //未设置流程审批 直接提交管理审核
				isworkflowAuditor = 0; //无需选择审核人员 提交系统审核
				$("#auditrow2").hide(); //选择审核人不现实
			} else if(result.data.message == "1") { //流程结束 隐藏选择审核人员
				isworkflowAuditor = 0; //无需验证审核人员信息
				$("#auditrow2").hide(); //审核人员隐藏
			} else if(result.data.message == "2") { //未设置审批人员
				$("#tableWorkflow").hide(); //不现实审核模块
				$("#btn_submit").hide(); //提交按钮隐藏
				parent.layer.alert("暂无下级审批人员，请通知管理员添加！");
			} else { //挂载审核人员
				isworkflowAuditor = 1;
				var option = "<option value=''>请选择审核人员</option>";
				for(var i = 0; i < result.data.checkers.length; i++) {
					option += '<option value="' + result.data.checkers[i].employeeId + '">' + result.data.checkers[i].userName + '</option>'
				}
				$("#employeeId").html(option);
			}
		}
	})
}

$('input[name="auditState"]').on('click',function(){
	if($(this).val()==1){
		isworkflowAuditor = 0; 
		$("#auditrow2").hide(); //选择审核人不现实
	}else{
		if(ischeck == "0") { //未设置流程审批 直接提交管理审核
			isworkflowAuditor = 0; //无需选择审核人员 提交系统审核
			$("#auditrow2").hide(); //选择审核人不现实
		} else if(ischeck == "1") { //流程结束 隐藏选择审核人员
			isworkflowAuditor = 0; //无需验证审核人员信息
			$("#auditrow2").hide(); //审核人员隐藏
		} else if(ischeck == "2") { //未设置审批人员
			$("#tableWorkflow").hide(); //不现实审核模块		
		} else { //挂载审核人员
			isworkflowAuditor = 1; 
			$("#auditrow2").show(); //选择审核人不现实
		}
		
	}
	
})
//加载审核记录
function bindRecord(data) {
	if(data.length>7){
		var height='304'
	}else{
		var height=''
	}
	$("#workflowListDetail").bootstrapTable({
		pagination: false,
		undefinedText: "",
		columns: [{
				title: '序号',
				align: "center",
				width: "50px",
				formatter: function(value, row, index) {
					return index + 1;
				}
			}, {
				field: 'userName',
				title: '姓名',
				align: "center",
				halign: "center",
				width: "15%",
				formatter: function(value, row, index) {
					if(row.employeeId == 0) {
						return "平台审核";
					} else {
						return value;
					}
				}
			},
			{
				field: 'workflowResult',
				title: '审核状态',
				align: "center",
				halign: "center",
				width: "15%",
				formatter: function(value, row, index) {
					if(value == 1) {
						return "审核未通过";
					} else if(value == 0) {
						return "审核通过";
					} else if(value == 2) {
						if(row.workflowType == "xmgg"){
							return "公告撤回";
						}else if(row.workflowType == "psbg"){
							return "评审报告撤回";
						}else if(row.workflowType == "xmby"){
							return "补遗撤回";
						}else if(row.workflowType == "jggs"){
							return "结果公示撤回";
						}else if(row.workflowType == "jgtzs"){
							return "结果通知书撤回";
						}else if(row.workflowType == "zgyswj" || row.workflowType == "xjcgwj"){
							return "已撤回";
						}else if(row.workflowType == "zlgd"){
							return "已撤回";
						}else if(row.workflowType == "mbgg"){
							return "模板撤回";
						}else if(row.workflowType == "ywtjb"){
							return "业务报表已撤回";
						}	
					}else {
						return "审核中"
					}
				}
			},
			{
				field: 'workflowContent',
				title: '审核说明',
				align: "left",
				halign: "center"
			}, {

				field: 'subDate',
				title: '时间',
				align: "center",
				halign: "center",
				width: "20%",
			}
		]
	});
$('#workflowListDetail').bootstrapTable("load", data);	
}

//审核确定按钮
$("#btn_submit").click(function() {
 
	//未选择结果时提示
	if($("input[name='auditState']:checked").val() == undefined || $("input[name='auditState']:checked").val() == "") {
		parent.layer.alert("请选择审核状态");
		return;
	}
	
	
	//当不通过时 必须要填写审核说明
	if($("input[name='auditState']:checked").val() == 1 && $("textarea[name='content']").val() == "") {
		parent.layer.alert("请填写审核说明");
		return;
	}

	//输入长度限制在1500字内
	if($("textarea[name='content']").val().length > 1000) {
		parent.layer.alert("审核说明不能多于1000字！");
		return;
	}

	//是否需要审核人
	if(isworkflowAuditor) {
		//同意且未选择审核人时同意    不通过则无需选择审核人
		if($("input[name='auditState']:checked").val() == 0) {
			if($("#employeeId").val() == "") {
				parent.layer.alert("请选择审核人");
				return;
			}
		}
	}
	
	if(WORKFLOWTYPE == 'xmby' && changeNoticeType!= undefined && changeEndDate != undefined && $("input[name='auditState']:checked").val() == 0){
		//项目补遗 审核通过
		var nowDate=top.$("#systemTime").html()+" "+top.$("#sysTime").html();
		if(NewDate(changeEndDate) < NewDate(nowDate)){
		   parent.layer.confirm('温馨提示：当前时间大于'+(changeNoticeType==0?"公告截止":"邀请函设定截止")+'时间，确定审核通过吗？', {
				btn: ['确定'],
				shade: false //不显示遮罩
		  }, function (laindex) {
				parent.layer.close(laindex);
				saveCheck();
		  });
		}else{
			saveCheck();
		}
		
	}else{
		saveCheck();
	}
	
	
});

//提交审核
function saveCheck(){
	//参数对象
	var dataParam = {
		workflowType: WORKFLOWTYPE, //流程类型
		businessId: packageId, //项目id
		workflowResult: $("input[name='auditState']:checked").val(),
		workflowContent: $("textarea[name='content']").val(),
		workflowLevel: workflowLevel, //审批流程等级
		id: workflowLevelId //查询流程审批的id
	}

	if(isworkflowAuditor) { //传递审核人员id   //根据之前是否选择审核人员判断时候传递审核人员id
		dataParam.employeeId = $("#employeeId").val(); //添加审核人id
	} else { //不传递审核人员id 提交系统审核
		dataParam.employeeId = "0";
	}
 
	//提交审核结果   
	$.ajax({
		type: "get",
		url: urlupdateWorkflowAccep,
		async: false,
		data: dataParam,
		success: function(data) {
			if(data.success) {
				parent.layer.closeAll();
				parent.$('#Salecountersign').bootstrapTable('refresh');
				top.layer.alert("审核成功");
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
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