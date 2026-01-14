var findPurchaseUrl = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do' //根据项目ID获取所有项目信息内容
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
var saveProjectPackage = config.AuctionHost + '/BusinessStatisticsController/insertDateReportInfo.do'; //添加包件的接口
var projectData = [];
var examTypes;
var isCheck;
var projectId = getUrlParam('projectId');
var packageId = getUrlParam('packageId');
var examType = getUrlParam('examType');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do';//获取项目信息的接口
var flage = $.getUrlParam('flage');//是否二次编辑
WORKFLOWTYPE = "ywtjb"
var isWorkflow = ""; //是否有审核人  0 没有 1为有
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

$(function() {
	if(packageId != null && packageId != undefined && packageId != "") {
		// $("#chBtn").hide()
		// du(packageId,examType);
		Purchase(packageId);
	} else {
		$("#chBtn").show()
	}
	time()

})

// 选择部门
$(".Department").on("click", function() {
	var name = $(this).data('title');
	if(name == 'agency') {
		var uid = top.enterpriseId
		var mnuid = purchaseaData.agencyDepartmentId;
	} else {
		var uid = purchaseaData.purchaserId;
		var mnuid = purchaseaData.purchaserDepartmentId
	}
	parent.layer.open({
		type: 2 //此处以iframe举例
			,
		title: '选择所属部门',
		area: ['400px', '600px'],
		content: 'view/projectType/employee.html',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.employee(uid, name, callEmployeeBack, mnuid)
		},

	})
})
$('input[name="tenderMode"]').on('change',function(){
	if($(this).val()==1){
		$(".tenderModeName").html('公告发布时间')
	}else{
		$(".tenderModeName").html('邀请函发送时间')
	}
})
//获取询比公告发布的数据
function Purchase(uid) {
	$.ajax({
		url: findPurchaseUrl, //生成一个随机参数。以防止浏览器不发送请求，直接从缓存中读取之前的数据
		type: 'post',
		async: false,
		dataType: 'json',
		data: {
			'tenderProjectID': uid,
		},
		success: function(data) {
			projectData = data.data;
			PurchaseData();
		}
	});

	var reData = {
		"workflowLevel": 0,
		"workflowType": "ywtjb"
	}

	// if (packageInfo.id != '') {
	// 	reData.id = packageInfo.id;
	// 	$('.record').show();
	// 	findWorkflowCheckerAndAccp(packageInfo.id);//审核
	// }
	console.log(reData)
	//获取审核人列表
	$.ajax({
		url: WorkflowUrl,
		type: 'get',
		dataType: 'json',
		async: false,
		data: reData,
		success: function(data) {

			var option = ""
			//判断是否有审核人		   
			if(data.message == 0) {
				isCheck = true;
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide()
				return;
			};
			if(data.message == 2) {
				parent.layer.alert("找不到该级别的审批人,请先添加审批人");
				massage2 = data.message;
				return;
			};
			var checkerId = '';
			if(data.success == true) {
				$('.employee').show()
				isWorkflow = 1;
				if(data.data) {
					if(data.data.workflowCheckers.length == 0) {
						option = '<option>暂无审核人员</option>'
					}
					if(data.data.workflowCheckers.length > 0) {

						if(data.data.employee) {
							checkerId = data.data.employee.id;
						}
						option = "<option value=''>请选择审核人员</option>";
						var checkerList = data.data.workflowCheckers;
						for(var i = 0; i < checkerList.length; i++) {

							if(checkerId != '' && checkerList[i].employeeId == checkerId) {
								option += '<option value="' + checkerList[i].employeeId + '" selected="selected">' + checkerList[i].userName + '</option>'
							} else {
								option += '<option value="' + checkerList[i].employeeId + '">' + checkerList[i].userName + '</option>'
							}

						}
					}
				} else {
					option = '<option>暂无审核人员</option>'
				}
			}
			$("#employeeId").html(option);
		}
	});
	// previewC();

};
//渲染数据
function PurchaseData() {

	for(key in projectData) {
		if(key=="tenderProjectName"||key=="tenderProjectCode"||key=="bidSectionCode"||key=="dept"||key=="exceptionCause"||key=="exception"){
			$("#" + key).html(projectData[key]);
			$('input[name="'+ key +'"]').val(projectData[key])
		}else if(key == 'tenderMode') {
			$("input[name='tenderMode'][value='" + (projectData[key] || 0) + "']").attr("checked", true);
			if(projectData[key]==2){
				$(".tenderModeName").html('邀请函发送时间')
			}else{
				$(".tenderModeName").html('公告发布时间')
			}
		} else if(key=='bidCheckType'){
			$('input[name="'+ key +'"]').val(projectData[key]);
			if(projectData[key]==0){
				$("#"+key).html('综合评分法')
			}
			if(projectData[key]==1){
				$("#"+key).html('最低评标价法')
			}
			if(projectData[key]==2){
				$("#"+key).html('经评审最低价法')
			}
			if(projectData[key]==3){
				$("#"+key).html('最低投标价法')
			}
			if(projectData[key]==4){
				$("#"+key).html('经评审的最高投标价法')
			}
			if(projectData[key]==5){
				$("#"+key).html('经评审的最低投标价法')
			}
		}else if(key == 'supplierSelect' || key == 'depaartmentName' || key == 'complectMonth' || key == 'marketType') {
			//$("select[name='supplierSelect'][value='"+ (projectData[key]||0) +"']").attr("selected",true);
			$("#" + key).val(projectData[key]);
		} else if(key == 'payStatep') {
			$("#" + key).val(projectData[key]);
		} else {			
			$("#" + key).val(projectData[key]);
			$('input[name="'+ key +'"]').val(projectData[key])
			
		}
	}
	if(projectData['priceTotal']){
		$("#priceTotal").val(projectData['priceTotal']);
	}else{
		$("#priceTotal").val(0);
	}
	if(projectData["exception"]) {
		
		$(".exceptionView1").show()
		$(".exceptionView2").show()
	}

};
//审核确定按钮
$("#btn_submit").click(function() {
	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			parent.layer.alert("请选择审核人");
			return false;
		};
	}
	if(checkForm($("#formbackage"))) { //必填验证，在公共文件unit中
		saveFuct()
	}

});

function saveFuct() {

	var saveData = $("#formbackage").serialize() +
		'&checkState=1' +
		'&tenderType=0'+
		'&auditorId=' + $('#employeeId option:selected').val() +
		'&auditorName=' + $('#employeeId option:selected').text();
	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', function() {
			$.ajax({
				url: saveProjectPackage, //修改包件的接口
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: saveData,
				success: function(data) {
					if(data.success == true) {
						if(top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						parent.layer.alert("提交成功")
						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						parent.layer.close(parent.layer.getFrameIndex(window.name));

					} else {
						parent.layer.alert(data.message)
						return false;
					}
				}
			});
		});
	} else {
		$.ajax({
			url: saveProjectPackage, //修改包件的接口
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: saveData,
			success: function(data) {
				if(data.success == true) {
					if(top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					parent.layer.alert("提交审核成功")
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					parent.layer.close(parent.layer.getFrameIndex(window.name));
				} else {
					parent.layer.alert(data.message);
					return false;
				}
			}
		});
	}
}
//保存
$("#btn_bao").click(function() {
	var saveData = $("#formbackage").serialize() +
		'&checkState=0' +	
		'&tenderType=0'+
		'&auditorId=' + $('#employeeId option:selected').val() +
		'&auditorName=' + $('#employeeId option:selected').text();
	
	$.ajax({
		url: saveProjectPackage, //修改包件的接口
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: saveData,
		success: function(data) {
			if(data.success == true) {
				if(top.window.document.getElementById("consoleWindow")) {
					var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
					var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
					dcmt.getDetail();
				}
				parent.layer.alert("保存成功");
				parent.$('#table').bootstrapTable(('refresh'));
			} else {
				parent.layer.alert(data.message)
			}
		}
	});
});
//关闭按钮
$("#btn_close").click(function() {
	parent.layer.close(parent.layer.getFrameIndex(window.name));
});
//验证金额
$(".priceNumber").on('change',function(){
	var regexNumber = new RegExp(/^(0|\+?[1-9][0-9]*)$/);
	var regexPrice = new RegExp('^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,6})?$');

	if($(this).val().indexOf(',') !=-1){
		parent.layer.alert("温馨提示:请使用中文逗号，易于区分!");
		return;
	}
	if(($(this).val().indexOf('.')+1) ==$(this).val().length){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		$(this).val("");
		return ;
	}
	
	var result=false;
	if(($(this).val().indexOf('，') !=-1)){
		var len=$(this).val().split('，');
	for(j = 0,num=len.length; j < num; j++) {
		
	if((len[j].indexOf('.')+1) ==len[j].length){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数!");
		
		return ;
	}
		
		var result=	regexPrice.test(len[j])
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

/*	if(parseFloat($(this).val())==""){
		parent.layer.alert("温馨提示:金额必须大于等于零且数值最多六位小数"); 
		$(this).val("");
		
		return
	}*/
