var projectDataId = getUrlParam('projectId'); //该条数据的项目id
var allProjectData = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //项目数据的接口；
var editpackageurl = 'bidPrice/DataReport/Auction/Agent/model/priceMsg.html'; //修改包件
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口；
var updateAuctionPurchase = config.AuctionHost + '/BusinessStatisticsController/insertDateReportInfo.do'
var deletProjectUrl = config.AuctionHost + "/AuctionProjectPackageController/deleteProjectPackage.do" //包件删除
var reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var isCheck;
var purchaseaData;
var packageData = [];
var publicDatas = []; //邀请供应商数据的容器
var massage2 = ""
var WORKFLOWTYPE = 'ywtjb';
var packageDataType = []
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var isWorkflow = ""; //是否有审核人  0 没有 1为有
var flage = $.getUrlParam('flage'); //是否二次编辑
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}
$(function() {
	$("#tenderProjectID").val(projectDataId);

	sourceFunds();
	$.ajax({
		url: flage == 1 ? allProjectData : findPurchaseURLHasId,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'tenderProjectID': projectDataId
		},
		success: function(data) {
			//项目数据
			purchaseaData = data.data;

		},
		error: function(data) {
			parent.layer.alert("修改失败")
		}
	});
	time();
	for(key in purchaseaData){
		if(key=="tenderProjectName"||key=="tenderProjectCode"||key=="bidSectionName"||key=="dept"||key=="exceptionCause"||key=="exception"){
			$("#" + key).html(purchaseaData[key]);
			$('input[name="'+ key +'"]').val(purchaseaData[key]);		
		}else if(key == 'tenderMode') {
			$("input[name='tenderMode'][value='"+ purchaseaData[key] +"']").attr("checked", true);
			if(purchaseaData[key]==2){
				$(".tenderModeName").html('邀请函发送时间')
			}else{
				$(".tenderModeName").html('公告发布时间')
			}
		}else if(key == 'auctionType'){			
			$("input[name=auctionType][value=" + purchaseaData[key] + "]").attr("checked", true);
		} else {		
			$('#'+key).val(purchaseaData[key]);
			$('input[name="'+ key +'"]').val(purchaseaData[key]);			
		}
	}
	if(purchaseaData["exception"]) {		
		$(".exceptionView1").show()
		$(".exceptionView2").show()
	}
	$("#month").val(purchaseaData.complectMonth)
	$("#content").val(purchaseaData.backups)

	if(purchaseaData.payStatep) {
		$("#payStatep").val(purchaseaData.payStatep);
	}
	if(purchaseaData["exception"]) {
		$(".exceptionView1").show()
		$(".exceptionView2").show()
	}
});
$('input[name="tenderMode"]').on('change',function(){
	if($(this).val()==1){
		$(".tenderModeName").html('公告发布时间')
	}else{
		$(".tenderModeName").html('邀请函发送时间')
	}
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

//临时保存
$("#btn_bao").click(function() {
	forms();
})
//退出
$("#btn_close").click(function() {
	var index = top.parent.layer.getFrameIndex(window.name);
	top.parent.layer.close(index);
})

function forms() {

	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize() + '&checkState=0' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text() + '&tenderType=1',
		success: function(data) {
			if(data.success == true) {
				parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
				parent.layer.alert("保存成功");

			} else {
				parent.layer.alert(data.message);
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});
}
//提交审核
$("#btn_submit").click(function() {

	if(isWorkflow) {
		if($("#employeeId").val() == "") {
			parent.layer.alert("请选择审核人");
			return false;
		};
	}

	if(checkForm($("#form"))) { //必填验证，在公共文件unit中
		form()
	}
})

function form() {

	if(isCheck) {
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(index, layero) {
			$.ajax({
				url: updateAuctionPurchase,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: $("#form").serialize() + '&checkState=1' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text() + '&tenderType=1',
				success: function(data) {
					if(data.success == true) {
						if(top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}

						parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！	
						top.layer.alert("提交审核成功");
						var index = top.parent.layer.getFrameIndex(window.name);
						top.parent.layer.close(index);
					} else {
						top.layer.alert(data.message);
					}
				},
				error: function(data) {
					top.layer.alert("提交审核失败")
				}
			});
		})
	} else {
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: $("#form").serialize() + '&checkState=1' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text() + '&tenderType=1',
			success: function(data) {
				if(data.success == true) {
					if(top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					parent.layer.alert("提交审核成功");
					parent.$('#table').bootstrapTable(('refresh')); // 很重要的一步，刷新url！
					var index = top.parent.layer.getFrameIndex(window.name);
					top.parent.layer.close(index);
				} else {
					parent.layer.alert(data.message);
				}
			},
			error: function(data) {
				parent.layer.alert("提交审核失败")
			}
		});
	}
}
//审核
function sourceFunds() {

	var reData = {
		"workflowLevel": 0,
		"workflowType": "ywtjb"
	}

	if(projectDataId != '') {
		reData.id = projectDataId;
		$('.record').show();
		findWorkflowCheckerAndAccp(projectDataId);
	}

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
				isCheck == true;
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
};

//取出选择的任务执行人的方法
function getOptoions() {
	var optionId = [],
		optionValue = [],
		optionName = [];
	//循环的取出插件选择的元素(通过是否添加了selected类名判断)
	for(var i = 0; i < $("li.selected").length; i++) {
		optionValue.push($("li.selected").eq(i).find("a").attr("class"));
		optionId.push($("li.selected").eq(i).find("a").attr("data-tokens"));
		optionName.push($("li.selected").eq(i).find(".text").text());

	}
	typeIdList = optionId.join(",") //媒体ID
	typeNameList = optionName.join(",") //媒体名字
	typeCodeList = optionValue.join(",") //媒体编号	
	//赋值给隐藏的Input域	
	$("#optionNames").val(typeNameList);
	$("#optionId").val(typeIdList);
	$("#optionValue").val(typeCodeList);

}
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