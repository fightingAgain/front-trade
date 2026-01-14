/*
 * @Author: your name
 * @Date: 2020-09-09 13:49:58
 * @LastEditTime: 2020-12-10 14:56:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \FrameWork_bf\bidPrice\Review\projectManager\js\Formation.js
 */ 
//进入页面，赋值
var FormaData;
var packages=[];
var enterpriseId;
var isAgent, chooseStatus;
var purchaserExperts = [],judgeExperts=[];//抽取专家库评委时的业主评委与专家评委
var historyUrl = "Judges/offling/model/history.html"; // 历史
var settingUrl = "Judges/offling/model/setting.html"; // 专家库评委抽取条件设定
$(function() {
	
	if(createType==1){		              
		$(".isCreateType").hide();	
	}else{
		$(".isCreateType").show();
		if(isAgent==1){
			$("#bntAppointJudgeIsAgent").show();
			$('.isAgent').show();
		}else{
			$('.isAgent').hide();
			bind();
			showExpertsList('0');
		}
	}
	if(createType == 1 || isAgent == 1){
		bind();
	}
	if (progressList.stopCheckReason != "" && progressList.stopCheckReason != undefined) {
		$('.isStopCheck').hide();//项目失败后的按钮不可操作
	}
	if (progressList.isStopCheck == 1) {		
		$('.isStopCheck').hide();
		
	}
	
	//选择是否需要抽取评审专家库评委  需求: dfdzcg-3820	
	$("[name='isChooseJudges']").click(function () {
		var val = $("[name='isChooseJudges']:checked").val();
		showExpertsList(val);
	});
	//确认选择   需求: dfdzcg-3820
	$("#btnSure").click(function () {
		var val = $("[name='isChooseJudges']:checked").val();
		if(val == '' || !val){
			top.layer.alert('请选择是否需要抽取评审专家库评委!')
		}else{
			top.layer.confirm('确认后，如果需要修改抽取来源，请在确认组建前点击‘切换模式’', {title:'提示', btn:['确认', '取消']}, function(index){
				top.layer.close(index);
				confirmSelection(val);
			})
		}
	});
	//确认组建
	$('#btnConfirm').click(function(){
		top.layer.confirm("温馨提示：是否确认组建？", function(index) {
			top.layer.close(index);
			$('#btnConfirm').prop('disabled', true);
			confirmSendSMS('1');
		});
	});
	//切换模式
	$('#btnChangeMode').click(function(){
		top.layer.confirm("温馨提示：是否确认切换模式？", function(index) {
			top.layer.close(index);
			$('#btnChangeMode').prop('disabled', true);
			changeMode();
		});
	});
	//取消组建
	$('#btnDeleteConfirm').click(function(){
		deleteConfirmExpert('1');
	});
	//专家库评委抽取历史
	$('#btnHistory').click(function(){
		parent.layer.open({
			type: 2,
			area: ['100%', '100%'],
			content: 'Judges/offling/model/history.html?id='+packageId+'&examType='+(examType == 1?'2':'1')+'&tenderType='+ tenderType
		})
	})
});
function bind() {	
	$.ajax({
		url: url + "/CheckController/getPurchaseCheck.do",
		data: {
			id: projectId,
			packageId:packageId,
			checkType: checkSetType
		},
		async: false,
		success: function(data) {
			if(data.success) {
				$(".checks").hide();
				FormaData = data.data;
				enterpriseId=data.data.enterpriseId;
				isAgent=data.data.isAgent;
				_THISID=_thisId;
				if(data.data.projectPackages) {
					packages = data.data.projectPackages;
				}
				if(FormaData.address){
					$('#address').val(FormaData.address).attr('disabled','disabled');
					if(FormaData.chooseStatus == 1 || isAgent!=1){
						$('#btnSaveAddress').hide();
						$('#btnEditAddress').show();
					}else{
						$('#btnSaveAddress, #btnEditAddress').hide();
					}
				}else{
					$('#address').val('').attr('disabled',false);
					if(FormaData.chooseStatus == 1 || isAgent!=1){
						$('#btnSaveAddress').show();
						$('#btnEditAddress').hide();
					}else{
						$('#btnSaveAddress, #btnEditAddress').hide();
					}
					
				}
				
				sessionStorage.setItem("FormaData", JSON.stringify(FormaData));
				medias();
				$('#expertsNumber').val(FormaData.checkerCount || 3);
				//绑定评委
				if(isAgent!=1){
					BindExperts(FormaData.experts, '0');
				}
				for(var x=0;x<FormaData.experts.length;x++){
					if(FormaData.experts[x].isLeader && FormaData.experts[x].isLeader == 1){
						$("input[name=isleader]").val([FormaData.experts[x].id]);
					}
				}
				
				chooseStatus = FormaData.chooseStatus;//是否确认
				if(isAgent == 1){
					$('[name=isChooseJudges]').val([FormaData.isChooseJudges]);
					if(FormaData.chooseStatus == 0){
						if(createType != 1){
							$('[name=isChooseJudges]').attr('disabled', false);
							$('#btnSure').show().attr('disabled', false);
							$('.chooseBidPrice, .chooseBidding, #btnChangeMode, .ExpertsTableWrap').hide();
						}
					}else if(FormaData.chooseStatus == 1){
						$('#btnSure').hide();
						$('.ExpertsTableWrap').show();
						$('[name=isChooseJudges]').attr('disabled', true);
						getJudgeExperts();
						showExpertsList(FormaData.isChooseJudges);
						if(FormaData.isSendMess == 1){
							$('#btnChangeMode').hide();
						}else{//未发送短信或未确认组建
							$('#btnChangeMode').show();
						}
					}
				}
				//抽完完成
				if(FormaData.isSendMess == 1) {//
					$("#btnSendSMS").css("display", "none");
					$("#SMSMsg").css("display", "none");
					$('#SMSMsg2').css("padding-top",'8px');
					$("#btnNewCheck").show();
					$('#btnSaveAddress, #btnEditAddress').hide();
					$("#expertsNumber, #address").attr("disabled", "disabled");
					$("#bntShowJudge").attr("disabled", "disabled");
					$("#bntAddJudge").attr("disabled", "disabled");
					$("#bntAppointJudgeIsAgent").attr("disabled", "disabled");
					$("#bntAppointJudge").attr("disabled", "disabled");
					$(".isDisabled").attr("disabled", "disabled");
					$("input[name=isleader]").attr("disabled", "disabled");
					$("#optionName").attr("disabled", "disabled");
				};
			}else{
				parent.layer.alert(data.message);
			}
		}
	});
}
function medias() {
	var op = "";
	
	if(packages.length > 0) {
		//有包件	
		for(var i = 0; i < packages.length; i++) {
			if(FormaData.packageId != packages[i].id)
				op += "<option value=" + packages[i].id + ">" + packages[i].packageName + "</option>"
		}
	} else {
		op = "<option value='0' >无</option>"
	}
	$("#optionName").html(op);
	$("#optionName").val(["0"]);
}


function onLinkPackage(temp) {
	var va = $("#optionName").val();
	var vaName = $("#optionName :selected").text();
	if(va != 0 && va != 1) {
		//可以进行关联
		top.layer.confirm("确定关联包件" + vaName + "的评委信息吗？", {
			btn: ['确定', '取消'] //按钮
		}, function(index1) {
			//修改
			$.ajax({
				type: "post",
				data: {
					projectId: projectId,
					packageId: packageId,
					upPackageId: va,
					checkType:checkSetType,
				},
				url: url + "/CheckController/updateLinkProjectCheckerItem.do",
				success: function(data) {
					if(data.success) {
						//$("input[name='isleader']").val([row.id]);
						$('#'+_thisId).click();	
						top.layer.alert("关联成功");
					} else {
						top.layer.alert(data.message);
					}
				}
			});

			top.layer.close(index1);
		})

	}
}


$("#expertsNumber").change(function() {
	if($("#expertsNumber").val() == 1){
		top.layer.confirm('是否只需要1个评委评审？', function(indexs, layero) {
			top.layer.close(indexs);
			saveCheckerNum($("#expertsNumber").val());
		}, function(index) {
			top.layer.close(index);
			$('#expertsNumber').val(FormaData.checkerCount || 3);
		})
	}else{
		saveCheckerNum($("#expertsNumber").val());
	}
	
});
function saveCheckerNum(num){
	var para = {
		id: FormaData.id,
		projectId: FormaData.projectId,
		packageId:FormaData.packageId,
		checkerCount: num,
		checkType: checkSetType
	}
	$.ajax({
		type: "post",
		data: para,
		url: url + "/CheckController/updateProjectChecker.do",
		success: function(data) {
			if(data.success) {
	
			} else {
				parent.layer.alert("设置失败");
			}
		}
	});
}

function refreshReviewer(data) {
	$("#NowReviewerTalbe").bootstrapTable('load', data);
}

//已存在的评审报告审核人
function BindReviewer(data) {
	$("#NowReviewerTalbe").bootstrapTable({
		data: data,
		columns: [{
			field: 'id',
			title: '序号',
			width: '50px',
			cellStyle: {
				css: {
					"text-align": "center"
				}
			},
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'employeeName',
			title: '姓名',
			formatter: function(value, row, index) {
				return row.employeeName || row.userName;
			}
		}, {
			field: 'logCode',
			title: '登录名'
		}, {
			field: 'tel',
			title: '手机号'
		}, {
			field: 'email',
			title: '邮箱'
		}]
	});
};

//已选择评委列表
function BindExperts(data, type) {
	var cols=[
		/* {
			field: '#',
			title: '组长',
			width: '50px',
			align: 'center',
			formatter: function(value, row, index) {
		
				return "<input type='radio' name='isleader' onChange='isleader(\""+row.id+"\",this)' value='" + row.id + "'>";
			}
		}, */{
			field: 'expertName',
			title: '成员姓名'
		}, {
			field: 'identityCardType',
			title: '证件类型',
			formatter: function(value, row, index) {
				switch(row.identityCardType) {
					case "0":
						return "身份证";
						break;
					case "1":
						return "军官证";
						break;
					case "2":
						return "护照";
						break;
				}
			}
		}, {
			field: 'identityCardNum',
			title: '证件编号'
		}, {
			field: 'expertTel',
			title: '手机号'
		}, {
			field: 'companyName',
			title: '所在单位'
		}, {
			field: 'provinceName',
			title: '省份',
			
		}, {
			field: 'cityName',
			title: '城市',				
		},
		{
			field: 'dataTypes',
			title: '专业',
			formatter: function(value, row, index) {
				if(value) {
					if(value.length > 10) {
						return "<span title='" + value + "'>" + value.substr(0, 7) + "...</span>";
					} else {
						return value;
					};
				}
			}
		}
	]
	if(createType!=1&&(progressList.stopCheckReason == "" || progressList.stopCheckReason == undefined)&&progressList.isStopCheck != 1){
		cols.push(
			{
				field: 'expertRemark',
				title: '操作',
				align: "center",
				width: '150px',
				events:{
					'click .RemoveJudge':function(e,value, row, index){
						RemoveJudge(index,row.projectCheckerItemId, row.id, type)
					},
					'click .ShowJudge':function(e,value, row, index){
						ShowJudge(row.projectCheckerItemId, row.id ,"选择评委","1", row.enterpriseId)
					},
				},
				formatter: function(value, row, index) {					
					if(createType==0){
						return "<button type='button' class='btn-xs btn btn-danger isStopCheck isDisabled RemoveJudge'><span class='glyphicon glyphicon-trash'></span>移除</button>" +
						"<button type='button' class='btn-xs btn btn-primary isStopCheck isDisabled ShowJudge'><span class='glyphicon glyphicon-retweet'></span>替换</button>";
					}
				}
			}
		)
	}
	$("#ExpertsTable").bootstrapTable({
		uniqueId: "id",
		columns: cols
	});
	$("#ExpertsTable").bootstrapTable('load', data);
};
//打开新增评审报告审核人
$("#addReviewer").click(function() {
	if(FormaData.checkReport == "已完成") {
		return top.layer.alert("评审报告已生成，无法更换审核人");
	}
	parent.layer.open({
		type: 2,
		area: ['800px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "添加评审报告审核人",
		content: './Reviewer.html',
		end: function(index, layro) {
			var Reviewer_data = JSON.parse(sessionStorage.getItem("Reviewer_data"));
			for(x in Reviewer_data) {
				delete Reviewer_data[x]["0"];
			}
			if(Reviewer_data != null) {
				var para = {
					projectId: FormaData.projectId,
					projectCheckerId: FormaData.id,
					employeeId: Reviewer_data[0].id,
					checkType: checkSetType
				}
				$.ajax({
					type: "post",
					data: para,
					url: url + "/CheckController/saveReviewReportChecker.do",
					success: function(data) {
						if(data.success) {
							$("#NowReviewerTalbe").bootstrapTable('load', Reviewer_data);
							sessionStorage.setItem("Reviewer_data", null);
							layer.alert("保存成功");
						} else {
							layer.alert("保存失败");
						}
					}
				});
			}
		}
	})
});

//移除评委
function RemoveJudge($index,id, checkerEmployeeId, type) {
	$.ajax({
		type: "post",
		url: url + "/CheckController/verifyTime.do",
		data: {
			projectId: FormaData.projectId,
			packageId:FormaData.packageId,
			type: 1,
			checkerEmployeeId: checkerEmployeeId,
			checkType: checkSetType
		},
		async: true,
		success: function(data) {
			if(!data.data) {
				parent.layer.prompt({
					title: '请输入移除原因',
					formType: 2
				}, function(text, index) {
					if($.trim(text)==""){
						parent.layer.alert('温馨提示:移除原因不能为空');
						return
					}
					$.ajax({
						type: "post",
						url: url + "/CheckController/cancelExpert.do",
						data: {
							projectId: FormaData.projectId,
							packageId:FormaData.packageId,
							checkerEmployeeId: checkerEmployeeId,
							id: id,
							changeReason: text,
							checkType: checkSetType
						},
						async: true,
						success: function(data) {
							if(data.success) {
								if(type == '1'){
									purchaserExperts.splice($index, 1);
									$("#ExpertsTable").bootstrapTable('load', purchaserExperts);
								}else{
									FormaData.experts.splice($index, 1);
									$("#ExpertsTable").bootstrapTable('load', FormaData.experts);
								}
																
								parent.layer.close(index);
								top.layer.alert("移除成功！");
							} else {
								top.layer.alert(data.message);
							}
						}
					});
				});
			} else {
				top.layer.alert(data.data);
			}
		}
	});

}

//抽取评委按钮
$("#bntShowJudge").off('click').click(function() {
	ShowJudge(null, null, "cqpw",null,null);
});
//业主评委按钮
$("#bntAppointJudge, #bntOwnerJudge").off('click').click(function() {
	// console.log(enterpriseType)
	ShowJudge(null, null, "yzpw",0,null);
});
/* if(isAgent==1){
	$("#bntAppointJudgeIsAgent").hide();
}; */
//指定评委按钮
$("#bntAppointJudgeIsAgent").off('click').click(function() {
	ShowJudge(null, null, "zdpw",2,null);
});
//打开抽取评委界面
function ShowJudge(id, expertid, titleType,checkOrExtract,enterpriseId) {
	var para = {
		projectId: FormaData.projectId,
		packageId:FormaData.packageId
	};
	if(titleType == 'cqpw'||titleType == 'yzpw'||titleType == 'zdpw') {
		para.type = 0;
	} else {
		para.type = 2;
		para.checkerEmployeeId = expertid;
	}
	if(titleType == 'cqpw'){
		var title="抽取评委"
	}
	if(titleType == 'yzpw'){
		var title="业主评委"
	}
	if(titleType == 'zdpw'){
		var title="指定评委"
	}
	$.ajax({
		type: "post",
		url: url + "/CheckController/verifyTime.do",
		data: para,
		async: false,
		success: function(data) {
			if(!data.data) {				
				top.layer.open({
					type: 2,
					area: ['1000px', title == '抽取评委'?'300px':'600px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					title: title,
					content: 'bidPrice/Review/projectManager/modal/Judge.html' + "?id=" + id + "&expertid=" + expertid + "&expertsNumber=" + $("#expertsNumber").val() + "&expertslength=" + ($('#ExpertsTable').bootstrapTable('getData').length)+"&checkOrExtract="+checkOrExtract+'&isAgents='+isAgent+'&enterpriseId='+enterpriseId+'&titleType='+titleType+'&checkType='+checkSetType+"&packageId="+packageId+"&projectId="+projectId+ "&enterpriseType="+enterpriseType,
					success: function(layero, index) {
						var iframeWind = layero.find('iframe')[0].contentWindow;
						
					},					
				})
			} else {
				if(title == '抽取评委') {
					top.layer.alert(data.data);
				} else {
					top.layer.alert(data.data);
				}
			}
		}
	});
}
//添加评委
$('#bntAddJudge, #bntAddExpert').off('click').on('click', function() {
	if($(this).prop('id') == 'bntAddJudge'){
		var rowData = $('#ExpertsTable').bootstrapTable('getData'); //bootstrap获取当前页的数据
		if($("#expertsNumber").val() == rowData.length) {
			parent.layer.alert("抽取评委已满，无法添加")
			return
		};
	}
	$.ajax({
		type: "post",
		url: url + "/CheckController/verifyTime.do",
		data: {
			projectId: projectId,
			packageId:packageId,
			type: 3
		},
		async: true,
		success: function(data) {
			if(!data.data) {
				parent.layer.open({
					type: 2,
					area: ['800px', '550px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					title: "添加评委",
					content: 'bidPrice/Review/projectManager/modal/AddJudge.html?projectId='+projectId+'&checkType='+(checkSetType||'')+'&enterpriseId='+enterpriseId+'&isAgent='+isAgent,
					btn: ['保存', '取消'],
					yes: function(index, layero) {
						var iframeWin = layero.find('iframe')[0].contentWindow;
						if($.trim(iframeWin.$('input[name="expertName"]').val()) == "") {
							parent.layer.alert("请填写成员名称")
							return
						};
						if($.trim(iframeWin.$('input[name="identityCardNum"]').val()) == "") {
							parent.layer.alert("证件编号不能为空")
							return
						}
						if(iframeWin.$('select[name="identityCardType"]').val() == 0) {
							if(!(/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(iframeWin.$('input[name="identityCardNum"]').val()))) {
								parent.layer.alert("请输入正确的身份证号码");

								return;
							};
						};
						if($.trim(iframeWin.$('input[name="expertTel"]').val()) == "") {
							parent.layer.alert("手机号不能为空")
							return
						};
						if(!(/^1[3456789]\d{9}$/).test(iframeWin.$('input[name="expertTel"]').val())) {
							parent.layer.alert("手机号格式有误")
							return
						}
						if($.trim(iframeWin.$('input[name="companyName"]').val()) == "") {
							parent.layer.alert("所在单位不能为空")
							return
						}
						if(iframeWin.$('textarea[name="dataTypeName"]').val() == "") {
							parent.layer.alert("请选择专业")
							return
						}
						if(iframeWin.itemTypeName.length >20) {
							parent.layer.alert("专业最多不能超过20个")
							return;
						}
						if(iframeWin.$('input[name="provinceName"]').val() == "") {
							parent.layer.alert("请选择省份")
							return
						}
						if(iframeWin.$('input[name="cityName"]').val() == "") {
							parent.layer.alert("请选择城市")
							return
						}
						iframeWin.$("#projectId").val(projectId);
						iframeWin.$("#packageId").val(packageId);
						iframeWin.formBtn(projectId);
						if(iframeWin.successL == true) {
							$('#'+_thisId).off('click').click();	
							parent.layer.close(index)
						}

					}
				})
			} else {
				top.layer.alert(data.data);
			}
		}
	});
});
//抽取历史按钮
$("#ExtractRecord").off('click').click(function() {
	parent.layer.open({
		type: 2,
		area: ['1100px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "抽取历史",
		content: 'bidPrice/Review/projectManager/modal/ExtractRecord.html?checkType='+checkSetType+'&packageId='+packageId+'&projectId='+projectId,		
	})
});

//发送短信按钮
$("#btnSendSMS").off('click').click(function() {
	bind();
	if(FormaData.checkerCount != FormaData.experts.length) {
		top.layer.alert("评委抽取未完成！");
		return;
	}
	top.layer.confirm("温馨提示：是否确定评委组建完成,并发送短信给相关评委？", function(indexs) {
		top.layer.close(indexs);
		confirmSendSMS('0');
	});
});

//重组评委
$("#btnNewCheck").off('click').click(function(){
	deleteConfirmExpert('0');
});
//保存评审地址
$('#btnSaveAddress').off('click').click(function(){
	var address = $.trim($('#address').val());
	if(address == ''){
		top.layer.alert('请输入评审地点');
		return
	}
	if(address.length > 200){
		top.layer.alert('评审地点长度不超过200（含）个字符');
		return
	}
	$.ajax({
		type: "post",
		url: url + "/CheckController/saveOrUpdateAddress.do",
		data: {
			id: FormaData.id,
			address: address
		},
		success: function(data) {
			if(data.success) {
				$('#address').attr('disabled','disabled');
				$('#btnEditAddress').show();
				$('#btnSaveAddress').hide();
				top.layer.alert("保存成功！");
			} else {
				top.layer.alert(data.message);
			}
		}
	});
});
$('#btnEditAddress').off('click').click(function(){
	$('#address').attr('disabled',false);
	$('#btnSaveAddress').show();
	$('#btnEditAddress').hide();
});
function isleader(id,thisd) {
	//if($("input[name='isleader']:checked").val() != id) {
		layer.confirm("确定选择此评委为组长吗？", {
			btn: ['确定', '取消'] //按钮
		}, function(index1) {
			//修改组长	
			$.ajax({
				type: "post",
				data: {
					projectId: projectId,
					packageId: packageId,
					checkerEmployeeId: id,
					isLeader: 1,
					checkType: checkSetType
				},
				url: url + "/CheckController/updateProjectCheckerItem.do",
				success: function(data) {
					if(data.success) {
						//$("input[name='isleader']").val([id]);
						//window.location.reload();
						parent.layer.alert("设置组长成功");
					} else {
						if(data.message !="该评委已被选为组长"){
							$("input[name='isleader']").val([""]);
						}
						parent.layer.alert(data.message);
					}
				}
			});

			layer.close(index1);
		}, function(index1){	
			$(thisd).prop('checked', false);
			layer.close(index1);
		})

	//}
};
/* *************************         需求: dfdzcg-3820       *************************** */
//不同的抽取方式，显示不同
function showExpertsList(val){
	console.log('showExpertsList >> ');
	$('.ExpertsTableWrap').show();
	if(val == 1){
		if(createType == 0){
			$('.chooseBidPrice').hide();
			$('.chooseBidding').show();
			if(chooseStatus == 1){
				$('#btnHistory').show();
				if(FormaData.isSendMess == 1) {
					$('#btnConfirm, #bntAddExpert, #bntOwnerJudge').hide();
					$('#btnDeleteConfirm').show();
				}else{
					$('#btnDeleteConfirm').hide();
					$('#btnConfirm, #bntAddExpert, #bntOwnerJudge').show();
				}
			}else{
				$('#btnConfirm, #bntAddExpert, #btnDeleteConfirm, #btnHistory, #bntOwnerJudge').hide();
			}
		}else{
			$('.isCreateType').hide();
			$('.notCreateType').show();
		}
		BindExperts(purchaserExperts, '1');
		judgeExpertsTable(judgeExperts);
	}else{
		if(FormaData.isChooseJudges == undefined && FormaData.chooseStatus == 1){//历史项目隐藏选项
			$('#chooseMode').hide();
		}
		if(createType == 0){//自己创建
			$('.chooseBidPrice').show();
			$('.chooseBidding').hide();
			if(chooseStatus == 1 || isAgent == 0){//自采或已选择抽取方式
				$('#bntShowJudge, #bntAppointJudge, #bntAppointJudgeIsAgent, #bntAddJudge, #btnSendSMS, #ExtractRecord, #optionName').show();
				if(isAgent == 0){
					$('#bntAppointJudgeIsAgent').hide();
				}
			}else{
				$('#bntShowJudge, #bntAppointJudge, #bntAppointJudgeIsAgent, #bntAddJudge, #btnSendSMS, #ExtractRecord, #optionName').hide();
			}
		}else{
			$('.isCreateType').hide();
		}
		BindExperts(FormaData.experts, '0');

		if(isAgent == 0){
			//抽完完成
			if(FormaData.isSendMess == 1) {//
				$("#btnSendSMS").css("display", "none");
				$("#SMSMsg").css("display", "none");
				$('#SMSMsg2').css("padding-top",'8px');
				$("#btnNewCheck").show();
				$('#btnSaveAddress, #btnEditAddress').hide();
				$("#expertsNumber, #address").attr("disabled", "disabled");
				$("#bntShowJudge").attr("disabled", "disabled");
				$("#bntAddJudge").attr("disabled", "disabled");
				$("#bntAppointJudgeIsAgent").attr("disabled", "disabled");
				$("#bntAppointJudge").attr("disabled", "disabled");
				$(".isDisabled").attr("disabled", "disabled");
				$("input[name=isleader]").attr("disabled", "disabled");
				$("#optionName").attr("disabled", "disabled");
			};
		}
	}
	
};
//确认选择
function confirmSelection(val){
	$('[name=isChooseJudges], #btnSure').prop('disabled',true);
	$.ajax({
		type: "post",
		data: {
			projectId: projectId,
			packageId: packageId,
			isChooseJudges: val,
			examType: examType
		},
		url: url + "/FormExpertController/confirmChooseJudges.do",
		success: function(data) {
			if(data.success) {
				if(val == 1){
					openSettingHtml();
				}else{
					top.layer.alert("确认成功");
				}
				bind();
			} else {
				$('[name=isChooseJudges], #btnSure').prop('disabled',false);
				top.layer.alert(data.message);
			}
		}
	});
};
//专家库评委
function judgeExpertsTable(data) {
	var cols=[
		{
			field: 'expertName',
			title: '成员姓名'
		}, {
			field: 'identityCardType',
			title: '证件类型',
			formatter: function(value, row, index) {
				switch(row.identityCardType) {
					case "0":
						return "身份证";
						break;
					case "1":
						return "军官证";
						break;
					case "2":
						return "护照";
						break;
				}
			}
		}, {
			field: 'identityCardNum',
			title: '证件编号'
		}, {
			field: 'expertTel',
			title: '手机号'
		}, {
			field: 'companyName',
			title: '所在单位'
		}, {
			field: 'provinceName',
			title: '省份',
			
		}, {
			field: 'cityName',
			title: '城市',				
		},
		{
			field: 'dataTypes',
			title: '专业',
			formatter: function(value, row, index) {
				if(value) {
					if(value.length > 10) {
						return "<span title='" + value + "'>" + value.substr(0, 7) + "...</span>";
					} else {
						return value;
					};
				}
			}
		}
	]
	$("#biddingExpertsTable").bootstrapTable({
		columns: cols
	});
	$("#biddingExpertsTable").bootstrapTable('load', data);
};
//确认组建/发送短信
function confirmSendSMS(type){// 1  招标评委  0  非招标评委
	$.ajax({
		type: "post",
		url: url + "/CheckController/sendMess.do",
		data: {
			projectId: FormaData.projectId,
			packageId:FormaData.packageId,
			id: FormaData.id,
			checkType:checkSetType
		},
		success: function(data) {
			$('#btnConfirm').prop('disabled', false);
			if(data.success) {
				$(".isDisabled").attr("disabled", "disabled");
				if(type == '1'){
					$('#btnConfirm, #bntAddExpert, #bntOwnerJudge, #btnChangeMode').hide();
					$('#btnDeleteConfirm').show();
					// top.layer.alert("确认组建成功！");
				}else if(type == '0'){
					$('#'+_thisId).click();
					$("#expertsNumber").attr("disabled", "disabled");
					$("#bntShowJudge").attr("disabled", "disabled");
					$("#bntAppointJudgeIsAgent").attr("disabled", "disabled");
					$("#bntAddJudge").attr("disabled", "disabled");
					$("#bntAppointJudge").attr("disabled", "disabled");
					$("#optionName").attr("disabled", "disabled");
					$("#btnSendSMS").css("display", "none");
					$("#SMSMsg").css("display", "none");
					$('#SMSMsg2').css("padding-top",'8px');
					$("#btnNewCheck").show();
					top.layer.alert("发送成功！");
				}
				
			} else {
				top.layer.alert(data.message);
			}
		}
	});
};
//取消组建、重新组建
function deleteConfirmExpert(type){// 1  招标评委  0  非招标评委
	//判断是否已经有评委进行打分
	$.ajax({
		type: "post",
		url: url + "/CheckController/expertCheckInfo.do",
		data: {
			projectId: FormaData.projectId,
			packageId:FormaData.packageId,
			checkType: checkSetType
		},
		async: false,
		success: function(data) {
			if(!data.success){
				top.layer.alert(data.message);
				return
			}
			if(!data.data) {
				//没有评委打分
				parent.layer.confirm(("温馨提示：确定"+(type == 1?"取消组建":"重组评委")+"？"), {
						btn: ['确定', '取消'] //按钮
				}, function(index1) {
					parent.layer.prompt({
						title: ('请输入'+(type == 1?"取消组建":"重组评委")+'原因'),
						formType: 2
					}, function(text, index) {
						//添加原因  修改sendMsg为0 评审管理
						if($.trim(text)==""){
							parent.layer.alert('温馨提示:'+(type == 1?"取消组建":"重组评委")+'原因不能为空');
							return
						}
						$.ajax({
							type: "post",
							url: url + "/CheckController/expertNewExpertCheck.do",
							data: {
								projectId: FormaData.projectId,
								packageId:FormaData.packageId,
								changeReason: text,
								newType :1,
								checkType: checkSetType
							},
							async: true,
							success: function(res) {
								if(res.success) {
									$(".isDisabled").attr("disabled", false);
									parent.layer.close(index);
									if(type == 1){
										top.layer.alert("取消组建成功！");
										$('#btnDeleteConfirm').hide();
										$('#btnConfirm, #bntAddExpert, #bntOwnerJudge, #btnChangeMode').prop('disabled', false).show();
									}else{
										/*var data=[]
										$('#ExpertsTable').bootstrapTable("load", data); //重载数据*/
										top.layer.alert("重组评委成功！");
										$("#btnSendSMS").show();
										$("#SMSMsg").show();
										$("#btnNewCheck").hide();
										$("#expertsNumber").attr("disabled", false);
										$("#bntShowJudge").attr("disabled", false);
										$("#bntAddJudge").attr("disabled", false);
										$("#bntAppointJudgeIsAgent").attr("disabled", false);
										$("#bntAppointJudge").attr("disabled", false);
										$("#optionName").attr("disabled", false);
										$("input[name=isleader]").attr("disabled", false);
										$("#btnRefresh").click();
									}
								} else {
									top.layer.alert(res.message);
								}
							}
						});
						
						
					});
					parent.layer.close(index1);
				}, function(index2) {
					parent.layer.close(index2);
				});
			}else{
				var st = data.data;
				var packName = st.substring(0, st.length - 1);
				if(st.charAt(st.length-1) == 1){
					//该项目已生成预审报告
					parent.layer.alert("包件"+packName+"已生成预审报告不能"+(type == 1?"取消组建":"重组评委"));
					return;
				}
				
				if(st.charAt(st.length-1) == 2){
					parent.layer.alert("包件"+packName+"已提交价格评审不能"+(type == 1?"取消组建":"重组评委"));
					return;
				}
				
				if(st.charAt(st.length-1) == 3){
					//评委打过分
					parent.layer.confirm("包件"+packName+"已有评委打分,确定"+(type == 1?"取消组建":"重组评委")+"？", {
						btn: ['确定', '取消'] //按钮
					}, function(index1) {
						parent.layer.prompt({
							title: ('请输入'+(type == 1?"取消组建":"重组评委")+'原因'),
							formType: 2
						}, function(text, index) {
							//添加原因  修改sendMsg为0 评审管理
							if($.trim(text)==""){
								parent.layer.alert('温馨提示:'+(type == 1?"取消组建":"重组评委")+'原因不能为空');
								return
							}
							$.ajax({
								type: "post",
								url: url + "/CheckController/expertNewExpertCheck.do",
								data: {
									projectId: FormaData.projectId,
									packageId:FormaData.packageId,
									changeReason: text,
									checkType: checkSetType
								},
								async: true,
								success: function(data) {
									if(data.success) {
										$(".isDisabled").attr("disabled", false);
										parent.layer.close(index);
										if(type == 1){
											top.layer.alert("取消组建成功！");
											$('#btnDeleteConfirm').hide();
											$('#btnConfirm, #bntAddExpert, #bntOwnerJudge, #btnChangeMode').prop('disabled', false).show();
										}else{
											/*var data=[]
											$('#ExpertsTable').bootstrapTable("load", data); //重载数据*/
											top.layer.alert("重组评委成功！");
											$("#btnSendSMS").show();
											$("#SMSMsg").show();
											$("#btnNewCheck").hide();					
											$("#expertsNumber").attr("disabled", false);
											$("#bntShowJudge").attr("disabled", false);
											$("#bntAddJudge").attr("disabled", false);
											$("#bntAppointJudgeIsAgent").attr("disabled", false);
											$("#bntAppointJudge").attr("disabled", false);
											$("#optionName").attr("disabled", false);
											$("input[name=isleader]").attr("disabled", false);
											
										}
									} else {
										top.layer.alert(data.message);
									}
								}
							});
							
							
						});
						
						parent.layer.close(index1);
					}, function(index2) {
						parent.layer.close(index2);
					})
				}
			}
		}
	});
};
//选择抽取评审专家库评委 查询业主评委和招标评委列表
function getJudgeExperts(){
	$.ajax({
		type: "post",
		url: url + "/FormExpertController/getExperts.do",
		async: false,
		data: {
			packageId:packageId,
			examType: examType,
		},
		success: function(data) {
			if(data.success) {
				if(data.data){
					if(data.data.experts){
						purchaserExperts = data.data.experts;
					}
					if(data.data.judgeExperts){
						judgeExperts = data.data.judgeExperts;
					}
				}
			} else {
				top.layer.alert(data.message);
			}
		}
	});
	
};
//切换模式
function changeMode(){
	$.ajax({
		type: "post",
		url: url + "/FormExpertController/checkMode.do",
		async: false,
		data: {
			packageId:packageId,
			examType: examType,
		},
		success: function(data) {
			$('#btnChangeMode').removeAttr('disabled');
			if(data.success) {
				bind();
			} else {
				top.layer.alert(data.message);
			}
		}
	});
};
//打开专家库评委抽取条件设置页面
function openSettingHtml(){
	var biddingExamType = examType == 1?'2':'1';
	top.layer.open({
		type: 2,
		area: ['100%', '100%'],
		title:"抽取条件设定",
		content: settingUrl  + '?id='+FormaData.packageId + '&examType=' + biddingExamType + '&tenderType=' + tenderType ,
		success: function (layero, index) {
			iframeWind = layero.find('iframe')[0].contentWindow;
			iframeWind.passMessage();
			top.layer.closeAll("loading");
		}
	})
}
/* *************************      需求: dfdzcg-3820     --end     *************************** */