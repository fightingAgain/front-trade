var url = top.config.bidhost;
var isAgents="";
var createType=getUrlParam("createType") //0自己本人创建  1非本人创建
var projectId=getUrlParam('projectId');
var packageId=getUrlParam('packageId');
var examType=getUrlParam('examType');
//进入页面，赋值
var ProjectData;
$(function() {
	if(createType==1){
		$('.isCreateType').hide();
	}else{
		$('.isCreateType').show();
	}
	bind();
	//关闭按钮
	$("#btn_close").click(function() {
		parent.layer.close(parent.layer.getFrameIndex(window.name));
	});
});
function bind() {
	$.ajax({
		url: url + "/CheckController/getPurchaseCheck.do",
		data: {
			id: projectId,
			packageId:packageId
		},
		async: false,
		success: function(data) {

			if(data.success) {
				$(".checks").hide();
				ProjectData = data.data;
				
				if(data.data.projectPackages) {
					packages = data.data.projectPackages;
				}
				medias();
				isAgents=ProjectData.isAgent;
				sessionStorage.setItem("ProjectData", JSON.stringify(ProjectData));
                
				$("#projectCode").html(ProjectData.projectCode);
				$("#projectName").html(ProjectData.projectName);
				$("#packageNum").html(ProjectData.packageNum);
				$("#packageName").html(ProjectData.packageName);
				$("#checkEndDate").html(ProjectData.checkEndDate)
				$("#tenderType").html(['询比采购', '竞价采购', '竞卖', '询比报价', '招标采购', '谈判采购', '单一来源采购', '框架协议采购', '战略协议采购'][ProjectData.tenderType]);
				
				$('#expertsNumber').val(ProjectData.checkerCount || 3);

			
				//绑定评委
				BindExperts(ProjectData.experts);
				for(var x=0;x<ProjectData.experts.length;x++){
					if(ProjectData.experts[x].isLeader && ProjectData.experts[x].isLeader == 1){
						$("input[name=isleader]").val([ProjectData.experts[x].id]);
					}
				}
				//绑定包件
				//BingPackage(ProjectData.projectPackages);
				//抽完完成
				if(ProjectData.isSendMess == 1) {
					$("#btnSendSMS").css("display", "none");
					$("#SMSMsg").css("display", "none");
					$('#SMSMsg2').css("padding-top",'8px');
					$("#btnNewCheck").show();
					
					$("#expertsNumber").attr("disabled", "disabled");
					$("#bntShowJudge").attr("disabled", "disabled");
					$("#bntAddJudge").attr("disabled", "disabled");
					$("#bntAppointJudgeIsAgent").attr("disabled", "disabled");
					$("#bntAppointJudge").attr("disabled", "disabled");
					$(".isDisabled").addClass("disabled", "disabled");
					
					$("#optionName").attr("disabled", "disabled");
				};			
			}
		}
	});
}

function medias() {
	var op = "";
	
	if(packages.length > 0) {
		//有包件	
		for(var i = 0; i < packages.length; i++) {
			if(ProjectData.packageId != packages[i].id)
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
		layer.confirm("确定关联包件" + vaName + "的评委信息吗？", {
			btn: ['确定', '取消'] //按钮
		}, function(index1) {
			//修改
			$.ajax({
				type: "post",
				data: {
					projectId: ProjectData.projectId,
					packageId: ProjectData.packageId,
					upPackageId: va,
					checkType: 2,
				},
				url: url + "/CheckController/updateLinkProjectCheckerItem.do",
				success: function(data) {
					if(data.success) {
						//$("input[name='isleader']").val([row.id]);
						window.location.reload();
						parent.layer.alert("关联成功");
					} else {
						parent.layer.alert(data.message);
					}
				}
			});

			layer.close(index1);
		})

	}
}

$('input:radio').change(function() {
	var para = {
		id: ProjectData.id,
		projectId: ProjectData.projectId,
		packageId:ProjectData.packageId
	}
	para[this.name] = this.value;
	$.ajax({
		type: "post",
		data: para,
		url: url + "/CheckController/updateProjectChecker.do",
		success: function(data) {
			if(data.success) {
				parent.layer.alert("设置成功");
			} else {
				parent.layer.alert("设置失败");
			}
			if(para.hasOwnProperty('isSetChecker')) {
				//移除弹出框选中项
				sessionStorage.removeItem("Reviewer_data");
				if(para.isSetChecker == "1") {
					$("#NowReviewerTalbe").hide();
					$("#addReviewer").attr("disabled", "disabled");
					//移除table数据
					refreshReviewer([]);
				} else {
					$("#NowReviewerTalbe").show();
					$("#addReviewer").removeAttr("disabled");
				}
			}

		}
	});
})

$("#expertsNumber").change(function() {
	var para = {
		id: ProjectData.id,
		projectId: ProjectData.projectId,
		packageId:ProjectData.packageId,
		checkerCount: $("#expertsNumber").val()
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
});

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
function BindExperts(data) {
	var isSendMess = getUrlParam("isSendMess");
	$("#ExpertsTable").bootstrapTable({
		uniqueId: "id",
		onClickRow: function(row) {
			
		},
		columns: [
		    {
				field: '#',
				title: '组长',
				width: '50px',
				align: 'center',
				formatter: function(value, row, index) {

					return "<input type='radio' name='isleader' onChange='isleader(\""+row.id+"\",this)' value='" + row.id + "'>";
				}
			},
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
			},
			{
				field: 'expertRemark',
				title: '操作',
				align: "center",
				width: '120px',
				formatter: function(value, row, index) {					
					// if(createType==0){
						return "<a href='javascript:void(0)' style='text-decoration: none;' type='button' class='btn-sm btn-primary isDisabled'  onclick='RemoveJudge(" + index + ",this,\"" + row.projectCheckerItemId + "\",\"" + row.id + "\")'>移除</a>" +
						"&nbsp;&nbsp;<a href='javascript:void(0)' style='text-decoration: none;' type='button' class='btn-sm btn-primary isDisabled'  onclick='ShowJudge(\"" + row.projectCheckerItemId + "\",\"" + row.id + "\",\"选择评委\",\"1\",\"" + row.enterpriseId + "\")'>替换</a>";
					// }
				}
			}
		]
	});
	$("#ExpertsTable").bootstrapTable('load', data);
	if(createType==1){
    	$('#ExpertsTable').bootstrapTable("hideColumn", 'expertRemark'); //隐藏操作
    }	
};

function isleader(id,thisd) {
	//if($("input[name='isleader']:checked").val() != id) {
		layer.confirm("确定选择此评委为组长吗？", {
			btn: ['确定', '取消'] //按钮
		}, function(index1) {
			//修改组长	
			$.ajax({
				type: "post",
				data: {
					projectId: ProjectData.projectId,
					packageId: ProjectData.packageId,
					checkerEmployeeId: id,
					isLeader: 1
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


//包件
function BingPackage(data) {
	$("#packageTalbe").bootstrapTable({
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
			field: 'packageName',
			title: '包件名称'
		}, {
			field: 'checkPlan',
			title: '评审方法',
			formatter: function(value, row, index) {
				if(value==0) return '综合评分法';
				if(value==1) return '最低评标价法';	
				if(value==2) return '经评审的最低价法(价格评分)';	
				if(value==3) return '最低投标价法';	
				if(value==4) return '经评审的最高投标价法';	
				if(value==5) return '经评审的最低投标价法';	
			}
		}, {
			field: 'checkState',
			title: '评审状态',
			align: 'center',
			formatter: function(value, row, index) {
				return "<span style='color:" + (value == "评审中" ? "red" : "green") + "'>" + value + "</span>";
			}
		}, {
			field: '#',
			title: '操作',
			align: 'center',
			formatter: function(value, row, index) {
				return "<a href='javascript:void(0)' style='text-decoration: none; type='button' class='btn-sm btn-primary'  onclick='toPackageInfo(\"" + row.packageId + "\",\"" + row.checkPlan + "\")'>查看</a>";

			}
		}]
	});
};

//打开新增评审报告审核人
$("#addReviewer").click(function() {
	if(ProjectData.checkReport == "已完成") {
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
					projectId: ProjectData.projectId,
					projectCheckerId: ProjectData.id,
					employeeId: Reviewer_data[0].id
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
function RemoveJudge($index, that, id, checkerEmployeeId) {
	$.ajax({
		type: "post",
		url: url + "/CheckController/verifyTime.do",
		data: {
			projectId: ProjectData.projectId,
			packageId:ProjectData.packageId,
			type: 1,
			checkerEmployeeId: checkerEmployeeId
		},
		async: true,
		success: function(data) {
			if(!data.data) {
				parent.layer.prompt({
					title: '请输入移除原因',
					formType: 2
				}, function(text, index) {
					$.ajax({
						type: "post",
						url: url + "/CheckController/cancelExpert.do",
						data: {
							projectId: ProjectData.projectId,
							packageId:ProjectData.packageId,
							checkerEmployeeId: checkerEmployeeId,
							id: id,
							changeReason: text
						},
						async: true,
						success: function(data) {
							if(data.success) {
								//$(that).parent().parent().remove();
								ProjectData.experts.splice($index, 1);								
								$("#ExpertsTable").bootstrapTable('load', ProjectData.experts);								
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
$("#bntShowJudge").click(function() {
	ShowJudge(null, null, "cqpw",null,null);
});
//业主评委按钮
$("#bntAppointJudge").click(function() {
	ShowJudge(null, null, "yzpw",0,null);
});
if(isAgents==1){
	$("#bntAppointJudgeIsAgent").hide();
};
//指定评委按钮
$("#bntAppointJudgeIsAgent").click(function() {
	ShowJudge(null, null, "zdpw",2,null);
});
//打开抽取评委界面
function ShowJudge(id, expertid, titleType,checkOrExtract,enterpriseId) {
	var para = {
		projectId: ProjectData.projectId,
		packageId:ProjectData.packageId
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
		async: true,
		success: function(data) {
			if(!data.data) {				
				top.layer.open({
					type: 2,
					area: ['1000px', title == '抽取评委'?'300px':'600px'],
					maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
					resize: false, //是否允许拉伸
					title: title,
					content: 'Auction/common/Agent/ReportCheck/Judge.html' + "?id=" + id + "&expertid=" + expertid + "&expertsNumber=" + $("#expertsNumber").val() + "&expertslength=" + ($('#ExpertsTable').bootstrapTable('getData').length)+"&checkOrExtract="+checkOrExtract+'&isAgents='+isAgents+'&enterpriseId='+enterpriseId+'&titleType='+titleType,
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
$('#bntAddJudge').on('click', function() {
	var rowData = $('#ExpertsTable').bootstrapTable('getData'); //bootstrap获取当前页的数据
	if($("#expertsNumber").val() == rowData.length) {
		parent.layer.alert("抽取评委已满，无法添加")
		return
	};
	$.ajax({
		type: "post",
		url: url + "/CheckController/verifyTime.do",
		data: {
			projectId: ProjectData.projectId,
			packageId:ProjectData.packageId,
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
					content: 'Auction/common/Agent/ReportCheck/AddJudge.html?projectId='+ProjectData.projectId,
					btn: ['保存', '取消'],
					yes: function(index, layero) {
						var iframeWin = layero.find('iframe')[0].contentWindow;
						if(iframeWin.$('input[name="expertName"]').val() == "") {
							parent.layer.alert("请填写成员名称")
							return
						};
						if(iframeWin.$('input[name="identityCardNum"]').val() == "") {
							parent.layer.alert("证件编号不能为空")
							return
						}
						if(iframeWin.$('select[name="identityCardType"]').val() == 0) {
							if(!(/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(iframeWin.$('input[name="identityCardNum"]').val()))) {
								parent.layer.alert("请输入正确的身份证号码");

								return;
							};
						};
						if(iframeWin.$('input[name="expertTel"]').val() == "") {
							parent.layer.alert("手机号不能为空")
							return
						};
						if(!(/^1[3456789]\d{9}$/).test(iframeWin.$('input[name="expertTel"]').val())) {
							parent.layer.alert("手机号格式有误")
							return
						}
						if(iframeWin.$('input[name="companyName"]').val() == "") {
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
						iframeWin.$("#projectId").val(ProjectData.projectId);
						iframeWin.$("#packageId").val(ProjectData.packageId);
						iframeWin.formBtn();
						if(iframeWin.successL == true) {
							var getExpertData = JSON.parse(sessionStorage.getItem("getExpertData"));
							$("#ExpertsTable").bootstrapTable('insertRow', {
								index: 0,
								row: getExpertData
							});
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
$("#ExtractRecord").click(function() {
	parent.layer.open({
		type: 2,
		area: ['1100px', '600px'],
		maxmin: false, //该参数值对type:1和type:2有效。默认不显示最大小化按钮。需要显示配置maxmin: true即可
		resize: false, //是否允许拉伸
		title: "抽取历史",
		content: 'Auction/common/Agent/ReportCheck/ExtractRecord.html',		
	})
});

//发送短信按钮
$("#btnSendSMS").click(function() {
	bind();
	if(ProjectData.checkerCount != ProjectData.experts.length) {
		top.layer.alert("评委抽取未完成！");
		return;
	}
	
	// var ta = $("input[name='isleader']:checked").val();
	// if(!ta){
	// 	top.layer.alert("评委未勾选组长");
	// 	return;
	// }
	
	top.layer.confirm("温馨提示：是否确定评委组建完成,并发送短信给相关评委？", function() {
		$.ajax({
			type: "post",
			url: url + "/CheckController/sendMess.do",
			data: {
				projectId: ProjectData.projectId,
				packageId:ProjectData.packageId,
				id: ProjectData.id
			},
			success: function(data) {
				if(data.success) {
					$("#expertsNumber").attr("disabled", "disabled");
					$("#bntShowJudge").attr("disabled", "disabled");
					$("#bntAppointJudgeIsAgent").attr("disabled", "disabled");
					$("#bntAddJudge").attr("disabled", "disabled");
					$("#bntAppointJudge").attr("disabled", "disabled");
					$(".isDisabled").addClass("disabled", "disabled");
					$("#optionName").attr("disabled", "disabled");
					$("#btnSendSMS").css("display", "none");
					$("#SMSMsg").css("display", "none");
					$('#SMSMsg2').css("padding-top",'8px');
					$("#btnNewCheck").show();

					top.layer.alert("发送成功！");
				} else {
					top.layer.alert(data.message);
				}
			}
		});
	});
});

//重组评委
$("#btnNewCheck").click(function(){
	//判断是否已经有评委进行打分
	$.ajax({
		type: "post",
		url: url + "/CheckController/expertCheckInfo.do",
		data: {
			projectId: ProjectData.projectId,
			packageId:ProjectData.packageId,
		},
		async: false,
		success: function(data) {
			if(!data.data) {
				//没有评委打分
				layer.confirm("确定重组评委？", {
						btn: ['确定', '取消'] //按钮
				}, function(index1) {
					parent.layer.prompt({
						title: '请输入重组评委原因',
						formType: 2
					}, function(text, index) {
						//添加原因  修改sendMsg为0 评审管理
						$.ajax({
							type: "post",
							url: url + "/CheckController/expertNewExpertCheck.do",
							data: {
								projectId: ProjectData.projectId,
								packageId:ProjectData.packageId,
								changeReason: text,
								newType :1
							},
							async: true,
							success: function(res) {
								if(res.success) {	
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
									$(".isDisabled").removeClass('disabled');
									$("#optionName").attr("disabled", false);
								} else {
									top.layer.alert(res.message);
								}
							}
						});
						parent.layer.close(index);
					});
					layer.close(index1);
				});
			}else{
				var st = data.data;
				var packName = st.substring(0, st.length - 1);
				if(st.charAt(st.length-1) == 1){
					//该项目已生成预审报告
					parent.layer.alert("包件"+packName+"已生成预审报告不能重组评委");
					return;
				}
				
				if(st.charAt(st.length-1) == 2){
					parent.layer.alert("包件"+packName+"已提交价格评审不能重组评委");
					return;
				}
				
				if(st.charAt(st.length-1) == 3){
					//评委打过分
					layer.confirm("包件"+packName+"已有评委打分,确定重组评委？", {
						btn: ['确定', '取消'] //按钮
					}, function(index1) {
						parent.layer.prompt({
							title: '请输入重组评委原因',
							formType: 2
						}, function(text, index) {
							//添加原因  修改sendMsg为0 评审管理
							$.ajax({
								type: "post",
								url: url + "/CheckController/expertNewExpertCheck.do",
								data: {
									projectId: ProjectData.projectId,
									packageId:ProjectData.packageId,
									changeReason: text,
								},
								async: true,
								success: function(data) {
									if(data.success) {
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
										$(".isDisabled").removeClass('disabled');
										$("#optionName").attr("disabled", false);
										
									} else {
										top.layer.alert(data.message);
									}
								}
							});
							layer.close(index);
							
						});
						
						layer.close(index1);
					})
				}
			}
		}
	});
	
	
})


//加载包件页面
function toPackageInfo(id, checkPlan) {
	$.ajax({
		type: "post",
		url: url + "/WaitCheckProjectController/verifyPackage.do",
		data: {
			projectId: ProjectData.projectId,
			packageId: id,
		},
		async: false,
		success: function(data) {
			if(data.success) {
				top.layer.open({
					type: 2,
					area: ['100%', '100%'],
					btn: ["刷新","关闭"],
					maxmin: false,
					resize: false,
					title: "项目包件详情",
					content: 'Auction/common/Agent/ReportCheck/PackageInfo.html?id=' + id + '&checkPlan=' + checkPlan,
					btn1: function(index, layero) {
						parent.window[layero.find('iframe')[0]['name']].location.reload();
					}
				})
			} else {
				top.layer.alert(data.message);
			}
		}
	});
}

/** 
 * 取得url参数 
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数  
	if(r != null) return unescape(r[2]);
	return null; // 返回参数值  
}

//获取province
function getProvince(province) {
	var province;
	$.ajaxSettings.async = false;
	$.getJSON('../../../media/js/base/prov-city.json', function(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].code == province) {
				return province = data[i].name;
			}
		}
	});
	return province;
}
//获取city
function getCity(province, city) {
	var city;
	$.ajaxSettings.async = false;
	$.getJSON('../../../media/js/base/prov-city.json', function(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].code == province) {
				var cityData = data[i].childs;
				for(var j = 0; j < cityData.length; j++) {
					if(cityData[j].code == city) {
						return city = cityData[j].name;
					}
				}
			}
		}
	});
	return city;
}