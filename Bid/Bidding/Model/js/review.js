var workflowUrl = config.tenderHost + '/updateWorkflowItem.do';  //审核接口
var id, workflowType;
$(function(){
	
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefind"){
		id = $.getUrlParam("id");
	}
	if($.getUrlParam("workflowtype") && $.getUrlParam("workflowtype") != "undefind"){
		workflowType = $.getUrlParam("workflowtype");
	}
	
	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,businessId:id, status:2});
	//关闭当前窗口
	$("#btnClose").click(function(){
		var index = parent.layer.getFrameIndex(window.name); 
		parent.layer.close(index); 
	});
	
	//确定
	$("#btnSave").click(function(){
		var workflowResult = $("[name='workflowResult']:checked").val(),
			content = $("[name='content']").val();
		if(workflowResult == 1 && content == ""){
			top.layer.alert("请输入审核意见");
			return;
		}
		$.ajax({
	         url: workflowUrl,
	         type: "post",
	         data: {
	         	workflowType:workflowType,
	         	businessId:id,
	         	workflowResult:workflowResult,
	         	workflowContent:content
	         },
	         success: function (data) {
	         	if(data.success == false){
	        		parent.layer.alert(data.message);
	        		return;
	        	}
	         	parent.layer.alert(data.message);
	         	parent.$("#projectList").bootstrapTable("refresh");
	         	var index = parent.layer.getFrameIndex(window.name); 
				parent.layer.close(index); 
	         },
	         error: function (data) {
	             parent.layer.alert("加载失败");
	         }
	     });
	});
});
