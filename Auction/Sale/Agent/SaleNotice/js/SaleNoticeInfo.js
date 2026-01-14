var keyId = getUrlParam("keyId");  //主键id
var type = getUrlParam("special"); //RELEASE发布公示  VIEW查看详情
var packageId = getUrlParam("id"); 
var projectId = getUrlParam("projectId");
var tType = getUrlParam("tType"); //看是采购人还是供应商
var projectType ; 
var bidNoticetable = new Array(); //供应商分项表格
var bidNoticetableTitle = new Array(); //动态表格头

var WorkflowTypeUrl = top.config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
 
var WORKFLOWTYPE = "jggs";
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var isCheck=false;
var data;
var businessid = '';
 var isStopCheck = '';//项目是否失败
$(function() {
	var url = "";
	var para;
	if(keyId == 'undefined'){
		keyId = "";
	}
	if(type != "RELEASE") {
		new UEditorEdit({
			contentKey:'noticeContent',
			pageType:'view',
		})
		$(".NewsContents").show();
		url = top.config.AuctionHost + "/BidNoticeController/findBidNoticeInfo.do";
		para = {
			id: keyId,
			tenderType: 2 
		}
	} else {
		//实例化编辑器
		new UEditorEdit({
			contentKey:'noticeContent',
		})
		$(".NewsContent").show();
		url = top.config.AuctionHost + "/BidNoticeController/findPackageInfo.do";
		para = {
			packageId: packageId,
			tenderType: 2 //0为询价采购，1为竞卖采购，2为竞卖
		}
		if(keyId != 'undefined' && keyId) {
			para.bidNoticeId = keyId;	
			businessid = keyId;
		}
	}
	
	if(tType == 'supplier'){
		$('.shenhe').hide();
	}
	

		$.ajax({
			url: url,
			data: para,
			async: true,
			success: function(reas) {
				if(reas.success) {
					data = reas.data; 
					isStopCheck = data.isStopCheck;
					projectType=data.projectType
					if(type == "RELEASE") {
						WorkflowUrl() //加载审核人
						$("#projectName").html(data.projectName);
						if (data.projectSource > 0) {
							$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
						}
						$("#projectCode").html(data.projectCode);
						$("#purchaserName").html(data.purchaserName);
						$("#purchaserAddress").html(data.purchaserAddress);
						$("#purchaserLinkmen").html(data.purchaserLinkmen);
						$("#purchaserTel").html(data.purchaserTel);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);
						if(data.isPublic>1){
							$("input[name='isPublic'][value=" + (data.isOpen||'1') + "]").prop("checked", true);
						}else{
							$("input[name='isPublic'][value=" + (data.isOpen||'0') + "]").prop("checked", true);
						}
						//findWorkflowCheckerAndAccp(projectId);
						if(data.noticeContent){
							ue.ready(function() {
	 							ue.execCommand('insertHtml', data.noticeContent);
 							}); 
						}else{
							wordHtml();
						}
						
					} else {
						$(".isWatch").hide();
						$('.employee').hide() //查看不显示审核人

						$("#projectName").html(data.projectName);
						if (data.projectSource > 0) {
							$("#projectName").html(data.projectName + '<span class="red">(重新竞卖)</span>');
						}
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
						$("#bidNoticeStartDate").val(data.openStartDate ? data.openStartDate.substr(0, 16) : data.openStartDate);
						$("#bidNoticeEndDate").val(data.opetEndDate ? data.opetEndDate.substr(0, 16) : data.opetEndDate);
						$("#packageName").html(data.packageName);
						$("#packageNum").html(data.packageNum);
						$("#NewsContent").html(data.noticeContent)
						//findWorkflowCheckerAndAccp(data.id);
					}
					mediaEditor.setValue(data)
					initMediaVal(data.options, {
						disabled: type != "RELEASE",
						stage: 'jggs',
						projectId: projectId,
						// packageId: packageId,
					})
				}
			}
		});

	
	if(keyId != 'undefined' && keyId) {
		//审批记录
		$(".workflowList").show();	
		findWorkflowCheckerAndAccp(keyId);
	}
	
	if(type != "RELEASE") {
		$("input[name='isPublic']").prop("disabled", "disabled");
		$("#bidNoticeStartDate").prop("disabled", "disabled");
		$("#bidNoticeEndDate").prop("disabled", "disabled");
		$("#btn_submit").hide();		
	}else{
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
		modelOption({'tempType':'auctionResultsPublicity','projectType':projectTypes});
		if(data){
			$("#noticeTemplate").val(data.templateId);//公告模板id
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
				modelHtml({'type':'jggs', 'projectId':projectId,'packageId':packageId,'tempId':templateId,'tenderType':2})
				parent.layer.close(index);			 
			  }, function(index){
				parent.layer.close(index)
			});	
		})
	}
	
});

$("#btn_submit").click(function() {
	if(isStopCheck == 1){
		return top.layer.alert("该项目已失败!");
	}
	var isPublic = $("input[name='isPublic']:checked").val();
	var bidNoticeStartDate = $("#bidNoticeStartDate").val();
	var bidNoticeEndDate = $("#bidNoticeEndDate").val();

	if(!isPublic) {
		parent.layer.alert("请选择公开范围");
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
	var d1 = new Date(bidNoticeStartDate.replace(/\-/g, "\/"));
	var d2 = new Date(bidNoticeEndDate.replace(/\-/g, "\/"));
	if(d1.getTime() -60000<= Date.now()) {
		parent.layer.alert("开始时间不能早于当前时间");
		return;
	}
	if(d1 >= d2) {
		parent.layer.alert("结束时间不能早于开始时间");
		return;
	}
	if(!mediaEditor.isValidate()){
		return
	}
	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			parent.layer.alert("请选择审核人");
			return;
		}
	}
	var para = {
		'projectId': projectId,
		'packageId': packageId,
		'isOpen': isPublic,
		'openStartDate': bidNoticeStartDate,
		'opetEndDate': bidNoticeEndDate,
		'noticeContent':ue.getContent(),
		'tenderType':2,
		'templateId':$('#noticeTemplate').val(),

		// 媒体发布
		optionId: typeIdLists,
		optionValue: typeCodeLists,
		optionName: typeNameLists,
	}
	$.extend(para,mediaEditor.getValue())
	if(isWorkflow) {
		para.checkerId = $("#employeeId").val();
	} else {
		para.checkerId = 0;
	}

	if(type == "RELEASE"){
		para.id = keyId;
	}

	var timeObj = para;
	// 时间处理
	['opetEndDate'].forEach(function(key) {
		if (timeObj[key] && timeObj[key].length == 16) {
			timeObj[key] += ':59';
		}
	})

	//提交
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function(ind) {
			top.layer.close(ind);
			$.ajax({
				/* url: top.config.AuctionHost + "/BidNoticeController/saveBidNotice.do",
				data: para, */
				url: top.config.AuctionHost + "/BidNoticeController/saveJjBidNotice.do",
				contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
				data: JSON.stringify(para),//解决数据量大时后台接收不到，后台对应用字符串方式接收
				type: "POST",
				success: function(data) {
					if(data.success) {
						if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
						}
						parent.$('#SaleNoticeList').bootstrapTable('refresh');
//						top.layer.closeAll();
						var index = parent.layer.getFrameIndex(window.name);
						top.layer.close(index);
						top.layer.alert("发布成功");
					} else {
						// top.layer.closeAll();
						top.layer.alert(data.message);
					}
				}
			});
		})
	} else {
		$.ajax({
			/* url: top.config.AuctionHost + "/BidNoticeController/saveBidNotice.do",
			data: para, */
			url: top.config.AuctionHost + "/BidNoticeController/saveJjBidNotice.do",
			contentType:"application/json;charset=utf-8",//解决数据量大时后台接收不到，后台对应用字符串方式接收
			data: JSON.stringify(para),//解决数据量大时后台接收不到，后台对应用字符串方式接收
			type: "POST",
			success: function(data) {
				if(data.success) {
					if(top.window.document.getElementById("consoleWindow")){
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
			   	    		dcmt.getDetail();
					}
					parent.$('#SaleNoticeList').bootstrapTable('refresh');
//					top.layer.closeAll();
					var index = parent.layer.getFrameIndex(window.name);
					top.layer.close(index);
					top.layer.alert("发布成功");
				} else {
					// top.layer.closeAll();
					top.layer.alert(data.message);
				}
			}
		});
	}

});
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

//公示开始时间
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
			noticeMin=$('#bidNoticeStartDate').val().substring(0,10);
	}else{
		noticeMin=nowSysDate.substring(0,10);
	}
	WdatePicker({
		el:this,
		dateFmt:'yyyy-MM-dd 23:59',
		minDate: noticeMin,
		onpicked:function(dp){
			var selectTime = dp.cal.getNewDateStr(); //选中的时间
		}
	});
});
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//关闭按钮
$("#btn_close").click(function() {
	var index = parent.layer.getFrameIndex(window.name);
	top.layer.close(index);
//	top.layer.close(top.layer.index);
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
				isCheck=true;
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
		   	url:parent.config.AuctionHost + '/WordToHtmlController/wordToHtml.do',
 		   	type:'post',
		   	dataType:'json',
 		   	async:false,
 		   	//contentType:'application/json;charset=UTF-8',
 		   	data:{
 		   		"packageId":packageId,
 		   		"projectId":projectId,
 		   		'type':'jggs',
 		   		'tenderType':2
 		   	},
 		   	success:function(result){	 
 		   		if(result.success){	
 		   			ue.ready(function() {
 						//ue.setContent(result.data, true);		
 						ue.execCommand('insertHtml', result.data);
 					}); 	
 		   			//editor.txt.html(result.data)
		   			
 		   		}
 		   	}  
 		});
}