var purchaseaData = "";
var updateAuctionPurchase = config.AuctionHost + '/BusinessStatisticsController/insertDateReportInfo.do'; //提交接口
var findPurchaseURL = config.AuctionHost + '/BusinessStatisticsController/compileDateReport.do'; //获取项目信息的接口
var findEnterpriseInfo = config.Syshost + '/EnterpriseController/findEnterpriseInfo.do' //当前登录人信息
var WorkflowUrl = config.AuctionHost + "/WorkflowController/findNewWorkflowCheckerByType.do" //项目审核人列表数据接口
var opurl = config.Syshost + "/OptionsController/list.do";
var isCheck;
var projectIds = $.getUrlParam('packageId'),
	projectSource;

var WORKFLOWTYPE = 'ywtjb';//
var tenderType = $.getUrlParam('tenderType');
var findPurchaseURLHasId = config.AuctionHost + '/BusinessStatisticsController/twoCompileDateReport.do'; //获取项目信息的接口
var flage = $.getUrlParam('flage'); //是否二次编辑
//提交审核
$("#btn_submit").click(function() {
	if($("#employeeId").val()==""){   
			parent.layer.alert("请选择审核人");        		     		
			 return false;      	
		};

	if(checkForm($("#form"))) { //必填验证，在公共文件unit中
		form()
	}
})
//提交审核
function form() {
	//提交审核
	if(isCheck) {
		
		top.layer.confirm('温馨提示：该流程未设置审批节点，您是否继续提交？', {
			btn: ['是', '否'] //可以无限个按钮
		}, function(indexs, layero) {
			$.ajax({
				url: updateAuctionPurchase,
				type: 'post',
				//dataType:'json',
				async: false,
				//contentType:'application/json;charset=UTF-8',
				data: $("#form").serialize() + '&checkState=1' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text()+
				 '&tenderType=' + tenderType,
				success: function(data) {
					if(data.success) {
						//						parent.layer.closeAll();
						if(top.window.document.getElementById("consoleWindow")) {
							var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
							var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
							dcmt.getDetail();
						}
						
						parent.$('#table').bootstrapTable('refresh');// 很重要的一步，刷新url！	
						parent.layer.close(indexs)
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
						parent.layer.alert("提交成功")
					} else {
						parent.layer.alert(data.message)
					}
				},
				error: function(data) {
					parent.layer.alert("提交失败")
				}
			});
		}, function(indexs) {
			parent.layer.close(indexs)
		})
	} else {
		
		$.ajax({
			url: updateAuctionPurchase,
			type: 'post',
			//dataType:'json',
			async: false,
			//contentType:'application/json;charset=UTF-8',
			data: $("#form").serialize() + '&checkState=1' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text()+ '&tenderType=' + tenderType,
			success: function(data) {
				if(data.success) {
					//					parent.layer.closeAll();
					if(top.window.document.getElementById("consoleWindow")) {
						var thisFrame = top.window.document.getElementById("consoleWindow").getElementsByTagName("iframe")[0].id;
						var dcmt = parent.$('#' + thisFrame)[0].contentWindow;
						dcmt.getDetail();
					}
					
					parent.$('#table').bootstrapTable('refresh'); // 很重要的一步，刷新url！	
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
					
					top.layer.alert("提交审核成功")
				} else {
					top.layer.alert(data.message)
				}
			},
			error: function(data) {
				top.layer.alert("提交审核失败")
			}
		});
	}
}
//临时保存
$("#btn_bao").click(function() {

	forms();
})
$('input[name="tenderMode"]').on('change',function(){
	if($(this).val()==1){
		$(".tenderModeName").html('公告发布时间')
	}else{
		$(".tenderModeName").html('邀请函发送时间')
	}
})
//退出
$("#btn_close").click(function() {
	//	parent.layer.closeAll()
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
})
//临时保存
function forms() {
	$.ajax({
		url: updateAuctionPurchase,
		type: 'post',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: $("#form").serialize() + '&checkState=0' + '&auditorId=' + $('#employeeId option:selected').val() + '&auditorName=' + $('#employeeId option:selected').text()+ '&tenderType=' + tenderType,
		success: function(data) {
			if(data.success) {
				parent.$('#table').bootstrapTable('refresh'); 
				parent.layer.alert("保存成功")
			} else {
				parent.layer.alert(data.message)
			}
		},
		error: function(data) {
			parent.layer.alert("保存失败")
		}
	});
}
$(function() {
	time()
	Purchase()
})
var projectMsg = {};
//项目的数据
function Purchase() {

	$.ajax({
		url: flage == 1 ? findPurchaseURL : findPurchaseURLHasId,
		type: 'get',
		//dataType:'json',
		async: false,
		//contentType:'application/json;charset=UTF-8',
		data: {
			'tenderProjectID': projectIds
		},
		success: function(data) {
			purchaseaData = data.data;

		},
		error: function(data) {

		}
	});
	for(key in purchaseaData){
		if(key=="tenderProjectName"||key=="tenderProjectCode"||key=="dept"||key=="exceptionCause"||key=="exception"){
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
	sourceFunds();

	time();
};

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

function callEmployeeBack(aRopName, dataTypeList) {
	var itemTypeId = []; //项目类型的ID
	var itemTypeName = []; //项目类型的名字			
	for(var i = 0; i < dataTypeList.length; i++) {
		itemTypeId.push(dataTypeList[i].id);
		itemTypeName.push(dataTypeList[i].departmentName);
	};
	typeIdList = itemTypeId.join(","); //项目类型的ID
	typeNameList = itemTypeName.join(","); //项目类型的名字
	if(aRopName == 'agency') {
		$("#agencyDepartmentId").val(typeIdList);
		$("#agencyDepartment").val(typeNameList);
	} else {
		$("#purchaserDepartmentId").val(typeIdList);
		$("#purchaserDepartment").val(typeNameList);
	}
}
//审核
function sourceFunds() {

	var reData = {
		"workflowLevel": 0,
		"workflowType": "ywtjb"
	}

	if(projectIds != '') {
		reData.id = projectIds;
		$('.record').show();
		findWorkflowCheckerAndAccp(projectIds);
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
				$("#checkerV").html('<input type="hidden" name="checkerId" value="0"/>');
				$('.employee').hide();
				isCheck = true;
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
}

//项目类型  
var itemTypeId = [] //项目类型的ID
var itemTypeName = [] //项目类型的名字
var itemTypeCode = [] //项目类型编号
function dataTypes() {
	if(purchaseaData.project[0].projectType == 0) {
		var code = "A"
	} else if(purchaseaData.project[0].projectType == 1) {
		var code = "B"
	} else if(purchaseaData.project[0].projectType == 2) {
		var code = "C"
	} else if(purchaseaData.project[0].projectType == 3) {
		var code = "C50"
	}
	top.layer.open({
		type: 2,
		title: '添加专业类别',
		area: ['450px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		closeBtn: 1,
		content: 'view/projectType/projectType.html?type=2&select=0&code=' + code,
		btn: ['确定', '取消'],
		scrolling: 'no',
		success: function(layero, index) {
			var iframeWind = layero.find('iframe')[0].contentWindow;
		},
		yes: function(index, layero) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			var dataTypeList = iframeWin.btnSubmit() //触发事件得到选中的项目类型的值
			//iframeWin.dataTypeList为所选项目类型返回的数组
			if(dataTypeList.length > 1 || dataTypeList.length == 0) {
				parent.layer.alert("请选择一条项目类型")
				return
			}
			itemTypeId = [] //项目类型的ID
			itemTypeName = [] //项目类型的名字
			itemTypeCode = [] //项目类型编号

			for(var i = 0; i < dataTypeList.length; i++) {
				itemTypeId.push(dataTypeList[i].id)
				itemTypeName.push(dataTypeList[i].name)
				itemTypeCode.push(dataTypeList[i].code)
			};
			typeIdList = itemTypeId.join(",") //项目类型的ID
			typeNameList = itemTypeName.join(",") //项目类型的名字
			typeCodeList = itemTypeCode.join(",") //项目类型编号	
			sessionStorage.setItem('dataTypeId', JSON.stringify(typeIdList));
			$("#dataTypeName").val(typeNameList);
			$('#dataTypeId').val(typeIdList);
			$('#dataTypeCode').val(typeCodeList)
			if(typeCodeList.substring(0, 1) == "A") {
				$("#engineering").val(0);
				$('.engineering').show();
			}
			if(typeCodeList.substring(0, 1) == "B") {
				$("#engineering").val(1);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0, 1) == "C") {
				$("#engineering").val(2);
				$('.engineering').hide();
			}
			if(typeCodeList.substring(0, 3) == "C50") {
				$("#engineering").val(3);
				$('.engineering').hide();
			};
			parent.layer.close(index)
		}

	});
};

//验证金额
$(".priceNumber").on('change',function(){
	var regexNumber = new RegExp(/^(0|\+?[1-9][0-9]*)$/);
	var regexPrice = new RegExp('^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,6})?$');


	if($(this).attr('name') == 'auctionNumber' && !regexNumber.test($(this).val())){
		parent.layer.alert("温馨提示:竞卖数量必须为大于等于0的整数！");
		$(this).val('');
		return;
	};
	 
	if($(this).attr('name') == 'plymentMumber' && !regexNumber.test($(this).val())){
		parent.layer.alert("温馨提示:缴纳家数必须为大于等于0的整数！");
		$(this).val('');
		return;
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
function NewDate(str) {
	if(!str) {
		return 0;
	}
	arr = str.split(" ");
	d = arr[0].split("-");
	t = arr[1].split(":");
	var date = new Date();
	date.setUTCFullYear(d[0], d[1] - 1, d[2]);
	date.setUTCHours(t[0] - 8, t[1]);
	return date.getTime();
}

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