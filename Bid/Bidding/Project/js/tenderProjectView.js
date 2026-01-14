var getUrl = config.tenderHost + '/TenderProjectController/get.do'; // 修改获取当前招标项目内容
var projectUrl = config.tenderHost + '/ProjectController/get.do'; // 获取选择项目内容
var revokeUrl = config.tenderHost + '/BidSectionController/revokeWorkflowItem.do'; //撤回接口
var departUrl = top.config.Syshost + '/DepartmentController/list.do'; //归属部门
var membersUrl = config.tenderHost + '/ProjectGroupController/findListByTenderProjectId.do'; //获取项目组成员接口
var saveUrl = config.tenderHost + '/TenderProjectController/saveMandateContract.do'; //保存合同
var saveMemberUrl = config.tenderHost + '/ProjectGroupController/saveProjectMembers.do'; //保存

var bidDetailHtml = "Bidding/BidIssuing/roomOrder/model/bidView.html"; //查看标段详情页面
var preBidDetail = "Bidding/BidIssuing/roomOrder/model/preBidView.html"; //预审时查看标段详情页面
var preTurnHtml = "Bidding/BidIssuing/roomOrder/model/turnBidView.html"; //预审转后审查看标段详情页面

var setHtml = "Bidding/Project/projectManage/model/projectManageEdit.html"; //项目成员设置页面
var contractUrl = "Bidding/Project/model/entrustContractList.html"; //合同
var membersHtml = "Bidding/Project/projectManage/model/memberList.html"; //选取成员

var preBidHtml = "Bidding/Project/model/turnBidEdit.html"; //标段(预审转后审)
var hasFileUrl = config.tenderHost + '/DocClarifyController/getBidFileStatesBySectionId.do';//撤回时查询招标（预审）文件是否已提交
var preEditHtml = "Bidding/Project/model/bidSectionEdit.html";
var id = ""; //招标项目id
var tenderProjectState = ""; //2为审核通过
var examType = ""; //资格审查方式
var bidId = ""; //标段id
var tenderProjectId = ""; //招标项目id
var fileUploads = null;
var employeeInfo = entryInfo();
var classCode; //行业类型
var isPublicProject; //是否公共资源
var tenderMode; //是否邀请招标

var memberId = []; //成员id
var members = []; //成员id
var bidSections = []; //标段

var isTurn = '';
var tenderProjectArr = ''; //招标项目相关信息
var oldProjectId='';
var owner = '';//操作权限1是  0否（包含项目组成员操作、委托合同操作、标段的撤回）
$(function() {
	// 获取连接传递的参数
	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
		id = $.getUrlParam("id");
		getDetail();
		getMember(id);
	}
	if($.getUrlParam("tenderProjectState") && $.getUrlParam("tenderProjectState") != "undefined") {
		tenderProjectState = $.getUrlParam("tenderProjectState");
	}
	if($.getUrlParam("isTurn") && $.getUrlParam("isTurn") != "undefined") {
		isTurn = $.getUrlParam("isTurn");
	}
	if($.getUrlParam("owner") && $.getUrlParam("owner") != "undefined") {
		owner = $.getUrlParam("owner");
	}
	source = $.getUrlParam("source");
	if(source == 1) {
		$("#btnClose").hide();
		$("#approval").ApprovalProcess({
			url: top.config.tenderHost,
			type:"zbxmsp",
			businessId:id,
			status:2,
			submitSuccess:function(){
				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.closeAll();
				parent.layer.alert("审核成功",{icon:7,title:'提示'});
				parent.$("#projectList").bootstrapTable("refresh");
			}
		});
	} else {
		$("#btnClose").show();
		$("#approval").ApprovalProcess({
			url: top.config.tenderHost,
			type:"zbxmsp",
			businessId:id,
			status:3,
		});
	}
	//操作权限  （是否能设置项目组成员）
	if(owner == 1){
		$('#btnMemberSave, #btnMember, #btnContract, #btnSave').show();
	}else{
		$('#btnMemberSave, #btnMember, #btnContract, #btnSave').hide();
	}
	//关闭当前窗口
	$("#btnClose").click(function() {
		var index = parent.layer.getFrameIndex(window.name);
		parent.layer.close(index);
	});

	/*查看标段*/
	$('.bidSectionBlock').on('click', '.btnView', function() {
		var viewHtml = '';
		var bid = $(this).attr("data-id");
		var index = $(this).attr('data-index');
		var source = 0;
		if(bidSections[index].examType == 1) {
			if(bidSections[index].fulfilStates == 1) {
				viewHtml = preTurnHtml;
			} else {
				if(bidSections[index].pretrialStates != 4) {
					viewHtml = preBidDetail;
				} else {
					viewHtml = preTurnHtml;
				}
			}
		} else if(bidSections[index].examType == 2) {
			viewHtml = bidDetailHtml;
		}
		if(Number(bidSections[index].bidEctionNum) > 1) {
			source = 1;
		} else {
			source = 0;
		}
		parent.layer.open({
			type: 2,
			area: ['100%', '100%'],
			title: "标段详情",
			content: viewHtml + "?tenderProjectId=" + id + "&id=" + bid + "&examType=" + examType + "&classCode=" + classCode + "&isPublicProject=" + isPublicProject + "&isAgency=" + employeeInfo.isAgency + "&tenderMode=" + tenderMode + "&tenderProjectState=" + tenderProjectState + "&source=" + source,
			resize: false,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage({
					tenderProjectName: $("#tenderProjectName").html(),
					interiorTenderProjectCode: $("#interiorTenderProjectCode").html()
				}); //调用子窗口方法，传参
			}
		})
	});
	//撤回标段
	$("#bidList").on("click", ".btnCancel", function() {
		var bidId = $(this).attr("data-id");
		getHasFile('bid', bidId, revokeBidSection, '此标段有已提交的资格预审文件/招标文件，建议先撤回资格预审文件/招标文件，否则部分信息无法修改');
		
	});
	function revokeBidSection(id){
		parent.layer.confirm('确定撤回该标段?', {
			icon: 3,
			title: '提示'
		}, function(index) {
			parent.layer.close(index);
			$.ajax({
				url: revokeUrl,
				type: "post",
				data: {
					id: id
				},
				success: function(data) {
					if(data.success == false) {
						parent.layer.alert(data.message);
						return;
					}
					parent.$("#projectList").bootstrapTable('refresh');
					parent.layer.alert("撤回成功");
					getDetail();
				},
				error: function(data) {
					parent.layer.alert("加载失败");
				}
			});
		});
	}
	//项目组成员设置
	$('#btnMember').click(function() {
		if($("#projectName").html() == "") {
			parent.layer.alert("请选择项目");
			return;
		}
		if($("[name='interiorTenderProjectCode']").val() == "") {
			parent.layer.alert("请填写招标项目编号", {
				icon: 7,
				title: '提示'
			}, function(index) {
				parent.layer.close(index);
				$("[name='interiorTenderProjectCode']").focus();
			});
			return;
		}
		openMember(id);
	})
	$("#btnContract").click(function() {
		openContract();
	});
	//保存合同
	$('#btnSave').click(function() {
		saveContract()
	});
	if(employeeInfo.isAgency == 1) {
		$(".marketShow").show();
	} else {
		$(".marketShow").hide();
	}

	//删除
	$("#table_member").on('click', '.btnDel', function() {
		var _this = $(this);
		parent.layer.confirm('确定删除该成员？', {
			icon: 3,
			title: '询问'
		}, function(ind) {
			parent.layer.close(ind);
			var delId = _this.attr('data-id');
			var index = $.inArray(delId, memberId)
			memberId.splice(index, 1);
			members.splice(index, 1);
			memberTable(members)
		})

	});
	$('#btnMemberSave').click(function() {
		saveForm()
	});
	//编辑标段页面
	$("#bidList").on("click", ".btnBidEdit", function() {
		var id = $(this).attr("data-id");
		var index = $(this).attr('data-index');
		var feeConfirmVersion = $(this).attr("data-Version");
		var source = 0;
		if(bidSections[index].examType == 1) {
			if(bidSections[index].pretrialStates == 0) {
				openBidSection(id, feeConfirmVersion, true);
			} else {
				openBidSection(id, feeConfirmVersion);
			}
		}
		
	});
});

function passMessage() {

}
/*
 * 打开合同
 */
function openContract() {
	var width = $(parent).width() * 0.9;
	var height = $(parent).height() * 0.9;
	parent.layer.open({
		type: 2,
		title: "委托合同",
		area: [1000 + 'px', 650 + 'px'],
		resize: false,
		content: contractUrl,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;

			iframeWin.passMessage({
				callback: contractCallback
			}); //调用子窗口方法，传参

		}
	});
}

function contractCallback(data) {
	$("#mandateContractName").val(data[0].contractName);
	$("[name='mandateContractId']").val(data[0].id);
}
//项目组成员
function openMember(dataId) {
	var notIds = [];
	var haveMembers = $('#table_member tbody tr')
	for(var i = 1; i < haveMembers.length; i++) {
		notIds.push($(haveMembers).eq(i).find('.btnDel').attr('data-id'))
	};
	notIds.push(employeeInfo.id);
	//		console.log(notIds)
	parent.layer.open({
		type: 2,
		title: '选择项目成员',
		area: ['1000px', '650px'],
		resize: false,
		content: membersHtml,
		success: function(layero, index) {
			var iframeWin = layero.find('iframe')[0].contentWindow;
			iframeWin.formFather(notIds, formChild); //调用子窗口方法，传参
		}
	});
}

function formChild(row) {
	//	console.log(row)
	for(var i = 0; i < row.length; i++) {
		if($.inArray(row[i].id, memberId) == -1) {
			memberId.push(row[i].id);
			members.push(row[i]);
		}
	}
	memberTable(members);
};

function setMem(id) {
	getMember(id)
}

function saveForm() {
	$.ajax({
		type: "post",
		url: saveMemberUrl,
		async: true,
		data: $('#formName').serialize() + "&tenderProjectId=" + id,
		success: function(data) {
			if(data.success) {
				parent.layer.alert('设置成功！', {
					icon: 6,
					title: '提示'
				}, function(index) {
					//					parent.$("#tableList").bootstrapTable("refresh");
					//					var ind = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
					//					parent.layer.close(ind); //再执行关闭  
					parent.layer.close(index);

				});
			}else{
				top.layer.alert(data.message);
			}
		}
	});
};

function getDetail(it) {
	$.ajax({
		url: getUrl,
		type: "post",
		data: {
			id: id
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			if(arr.oldProjectId){//推送的项目
				oldProjectId = arr.oldProjectId;
				$('#viewPushInfo').show();
			};
			tenderProjectArr = arr;
			projectDetail(arr.projectId);
			tenderProjectId = arr.id;
			examType = arr.examType;
			for(var key in arr) {
				if(key == "projectState") {
					$("#projectStateTxt").html(parent.Enums.projState[arr[key]]);
				} else if(key == "regionCode") {
					// 初始化省市联动
					new MultiLinkage("#areaBlock", {
						code: arr[key],
						status: 2
					});
				} else if(key == "isLaw") {
					$("#isLaw").html(arr[key] == 1 ? "是" : "否");
				} else if(key == "dept") {
					if (arr.deptName) {
						$("#dept").html(arr.deptName);
					}
					insertDept(arr[key]);
				} else if(key == "tenderOrganizeForm") {
					$("#tenderOrganizeForm").html(arr[key] == 2 ? "委托招标" : "自行招标");
					if(arr.tenderOrganizeForm == 1) {
						$('.tenderSelfTitle').css('display', 'none');
						$('.tenderOrganizeForm').hide();
					} else if(arr.tenderOrganizeForm == 2) {
						$('.tenderSelfTitle').css('display', 'block');
						$('.tenderOrganizeForm').show();
					}
				} else if(key == "bidSections" && arr[key].length > 0) {
					$("#bidList tr").remove();
					bidSections = arr.bidSections;
					if(it) {
						if(it == 1) {
							turnBidersHTml(bidSections)
						} else {
							bidersHTml(bidSections)
						}
					}else{
						if(isTurn == 1) {
							turnBidersHTml(bidSections)
						} else {
							bidersHTml(bidSections)
						}
					}
					

				} else if(key == "tenderees" && arr[key].length > 0) {
					$("#projectOwner").html(arr.tenderees[0].projectOwner);
					$("#agentName").html(arr.tenderees[0].agentName);
					$("#agentTel").html(arr.tenderees[0].agentTel);
					$("#enterpriseAddress").html(arr.tenderees[0].enterpriseAddress);
					$("#email").html(arr.tenderees[0].agentEmail);
				} else if(key == "tenderProjectType") {
					classCode = arr[key].substring(0, 1);
					//       			var code = arr[key].substring(0, 1);
					//       			if(code == "A" || code == "B" || code == "C"){
					$("#tenderProjectTypeTxt").dataLinkage({
						optionName: "TENDER_PROJECT_TYPE",
						optionValue: arr[key],
						status: 2,
						viewCallback: function(name) {
							$("#tenderProjectTypeTxt").html(name)
						}
					});
					$("#tenderProjectClassify").dataLinkage({
						optionName: "SYS_PROJECT_CLASSIFY",
						optionValue: arr[key],
						status: 2,
						isViewAll: true,
						viewCallback: function(name) {
							$("#tenderProjectClassify").html(name)
						}
					});
					
					//						$(".publicShow").show();
					//					} else {
					//						$(".publicShow").hide();
					//					}
				} else if(key == "tenderProjectClassify") {
					$("#tenderProjectClassify").dataLinkage({
						optionName: "SYS_PROJECT_CLASSIFY",
						optionValue: arr[key],
						status: 2,
						viewCallback: function(name) {
							$("#tenderProjectClassify").html(name)
						}
					});
				} else if(key == "projectAttachmentFiles") {
					//上传文件
					fileUploads = new StreamUpload("#fileContent", {
						businessId: id,
						status: 2,
						businessTableName: 'T_TENDER_PROJECT', //立项批复文件（项目审批核准文件）    项目表附件
						attachmentSetCode: 'TENDER_PROJECT_FILE'
					});
					if(arr.projectAttachmentFiles && arr.projectAttachmentFiles.length > 0) {
						fileUploads.fileHtml(arr.projectAttachmentFiles);
					}
				} else if(key == "mandateContractName") {
					$("[name='mandateContractName']").val(arr.mandateContractName);
					$("[name='mandateContractId']").val(arr.mandateContractId);
					$("[name='id']").val(arr.id);
				} else {
					optionValueView($("#" + key), arr[key])
				}
				tenderMode = arr.tenderMode;
				$('[name=' + key + ']').val(arr[key]);
				//       		if(arr.tenderProjectType.substring(0,1) == "A"){
				//       			$(".publicShow").show();
				//       			
				//       			isPublicProject = arr.isPublicProject;
				//       		} else {
				//       			$(".publicShow").hide();
				//       		}
			}
			$("#isPublicProject").html(arr.isPublicProject == 1 ? "是" : "否");

			isPublicProject = arr.isPublicProject;

			if(!(isPublicProject == 1 && classCode == "A")) {
				$("#superviseDeptCode").html(arr.superviseDeptName ? arr.superviseDeptName : "");
			}
			if(classCode == "A") {
				if(isPublicProject == 1) {
					$(".ownerShow").show();
				} else {
					$(".ownerShow").hide();
				}
			} else {
				$(".ownerShow").hide();
			}
			if(employeeInfo.isAgency == 1) {
				if(isPublicProject == "1") {
					$(".marketShow").hide();
				} else {
					$(".marketShow").show();
				}
			}

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}
//获取项目详细信息
function projectDetail(projectId, addrIsExist) {
	$.ajax({
		url: projectUrl,
		type: "post",
		data: {
			id: projectId
		},
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			var arr = data.data;
			var project = {
				projectName: arr.projectName,
				interiorProjectCode: arr.interiorProjectCode,
				industriesType: arr.industriesType
			}
			for(var key in project) {
				optionValueView("#" + key, project[key]); //下拉框信息反显	
			}

			//       	if(key == "tenderees" && arr[key].length > 0){
			//       		for(var i= 0; i < arr.tenderees.length; i++){
			//       			if(arr.tenderees[i].tendererType == 0){
			//       				for(var key in arr.tenderees[i]){
			//       					$("#" + key).html(arr.tenderees[i][key]);
			//       					$('#projectTendererName').html(arr.tenderees[i]['tendererName']);//项目中的招标人
			//       				}
			//       			} else {
			//       				enterpriseHtml([arr.tenderees[i]]);
			//       			}
			//       		}
			//   		}

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}

// 招标人代表表格
function enterpriseHtml(data) {
	var html = "";
	if($("#enterpriseTab").length == 0) {
		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<tr data-id="' + data.id + '">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                	</tr>';
	}
	for(var i = 0; i < data.length; i++) {
		html += '<tr>\
	                    		<td>' + data[i].tendererName + '</td>\
	                    		<td>' + data[i].agentName + '</td>\
	                    		<td>' + data[i].agentTel + '</td>\
	                    	</tr>';
	}

	if($("#enterpriseTab").length == 0) {
		html += '</table>';
		$(html).appendTo("#enterpriseBlock");
	} else {
		$(html).appendTo("#enterpriseTab");
	}
}

//加载树形文本框
function insertDept(departId) {
	$.ajax({
		type: "Post",
		url: departUrl,
		data: {
			menuState: "0",
			isShow: "0",
			isDel: "0",
		},
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			}
			for(var i = 0; i < data.data.length; i++) {
				if(data.data[i].id == departId) {
					$("#dept").html(data.data[i].departmentName);
					break;
				}
			}
		}
	});
}

function getMember(id) {
	$.ajax({
		type: "post",
		url: membersUrl,
		async: true,
		data: {
			'tenderProjectId': id
		},
		success: function(data) {
			if(data.success) {
				if(data.data && data.data.length > 0) {
					memberTable(data.data);
					for(var i = 0; i < data.data.length; i++) {
						if($.inArray(data.data[i].id, memberId) == -1) {
							memberId.push(data.data[i].id);
							members.push(data.data[i]);
						}
					}
				}
			}
		}
	});
}
/*成员列表
 * 
 */
function memberTable(data) {
	$('#table_member').html('');
	var html = '';
	html = '<tr>' +
		'<th style="width: 50px;text-align: center;">序号</th>' +
		'<th>项目成员</th>' +
		'<th style="width: 150px;text-align: center;">联系电话</th>';
		if(owner == 1){
			html += '<th style="width: 100px;text-align: center;">操作</th>';
		}
		html += '</tr>';
	for(var i = 0; i < data.length; i++) {
		html += '<tr>' +
			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
			'<td>' + data[i].userName + '<input type="hidden"  name="projectGroups[' + i + '].employeeId" value="' + data[i].id + '"></td>' +
			'<td  style="width: 150px;text-align: center;">' + data[i].tel + '<input type="hidden" name="projectGroups[' + i + '].employeeName" value="' + data[i].userName + '"></td>' 
			if(owner == 1){
				html += '<td style="width: 100px;text-align: center;">' +
					'<button  type="button" class="btn btn-danger btn-sm btnDel" data-id="' + data[i].id + '"><span class="glyphicon glyphicon-remove"></span>删除</button>' +
				'</td>';
			}
			html += '</tr>'
	};
	$(html).appendTo('#table_member');
};

function saveContract() {
	var arr = {};
	arr = parent.serializeArrayToJson($("#formName").serializeArray());
	if(!arr.id) {
		arr.id = tenderProjectId;
	}
	$.ajax({
		url: saveUrl,
		type: "post",
		data: arr,
		async: false,
		success: function(data) {
			if(data.success == false) {
				parent.layer.alert(data.message);
				return;
			} else {
				parent.layer.alert('保存成功!');
			}
			parent.$("#projectList").bootstrapTable('refresh');

		},
		error: function(data) {
			parent.layer.alert("加载失败");
		}
	});
}

function bidersHTml(bidSections) {
	var html = '<tr><th style="width: 50px; text-align: center;">序号</th>';
	if(tenderProjectState == "2") {
		html += '<th>标段编号</th>';
	}
	html += '<th>标段名称</th><th style="width: 200px;text-align: center;">操作</th></tr>';

	for(var i = 0; i < bidSections.length; i++) {
		html += '<tr><td style="text-align: center; width:50px">' + (i + 1) + '</td>';
		if(tenderProjectState == "2") {
			html += '<td>' + (bidSections[i].interiorBidSectionCode ? bidSections[i].interiorBidSectionCode : "") + '</td>';
		}
		html += '<td>' + bidSections[i].bidSectionName + '</td>' +
			'<td style="width: 200px;text-align: center;">' +
			'<button type="button" class="btn btn-primary btn-sm btnView" data-index="' + i + '" data-id="' + bidSections[i].id + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button>';
		if(owner == 1){
			if(bidSections[i].states == 1) {
				if(bidSections[i].isRecall == 0){
					html += '<button type="button" class="btn btn-primary btn-sm btnCancel" data-index="' + i + '" data-id="' + bidSections[i].id + '"><span class="glyphicon glyphicon-share-alt"></span>撤回</button></td>';
				}else{
					if(bidSections[i].pretrialStates == 0 && examType == 1){
						html += '<button type="button" class="btn btn-primary btn-sm btnBidEdit" data-Version="' + bidSections[i].feeConfirmVersion + '" data-index="' + i + '" data-id="' + bidSections[i].id + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
					}
				}
			} 
		}
		
		html += '</tr>';
	}

	$(html).appendTo("#bidList");
}
//预审转后审
function turnBidersHTml(bidSections) {
	var html = '<tr><th style="width: 50px; text-align: center;">序号</th>';
	if(tenderProjectState == "2") {
		html += '<th>标段编号</th>';
	}
	html += '<th>标段名称</th><th style="width: 200px;text-align: center;">操作</th></tr>';

	for(var i = 0; i < bidSections.length; i++) {
		html += '<tr><td style="text-align: center; width:50px">' + (i + 1) + '</td>';
		if(tenderProjectState == "2") {
			html += '<td>' + (bidSections[i].interiorBidSectionCode ? bidSections[i].interiorBidSectionCode : "") + '</td>';
		}
		html += '<td>' + bidSections[i].bidSectionName + '</td><td style="width: 200px;text-align: center;">';
		if(bidSections[i].pretrialStates == 4 && bidSections[i].fulfilStates != 1) {
			html += '<button type="button" class="btn btn-primary btn-sm btnBidEdit" data-Version="' + bidSections[i].feeConfirmVersion + '" data-index="' + i + '" data-id="' + bidSections[i].id + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>';
		}

		html += '<button type="button" class="btn btn-primary btn-sm btnView" data-index="' + i + '" data-id="' + bidSections[i].id + '"><span class="glyphicon glyphicon-eye-open"></span>查看</button></td></tr>';
	}

	$(html).appendTo("#bidList");
}
/*
 * 编辑标段页面
 * isEditPre: 预审未结束前可编辑预审标段中关于后审部分信息
 */
function openBidSection(bidId, feeConfirmVersion, isEditPre) {
	var jumpHtml = '';
	if(isEditPre){
		jumpHtml = preEditHtml;
		parent.layer.open({
			type: 2,
			title: "标段信息",
			area: ['1200px', '600px'],
			content: jumpHtml + "?tenderProjectId=" + id + "&id=" + bidId + "&examType=1&from=bidFile&classCode=" + tenderProjectArr.tenderProjectType.substring(0, 1) + "&isPublicProject=0&isAgency=" + employeeInfo.isAgency + "&tenderMode=" + tenderProjectArr.tenderMode + "&feeConfirmVersion="+feeConfirmVersion,
			// content: jumpHtml + "?tenderProjectId=" + id + "&id=" + bidId + "&examType=1" + "&classCode=" + tenderProjectArr.tenderProjectType.substring(0, 1) + "&isPublicProject=" + tenderProjectArr.isPublicProject + "&isAgency=" + employeeInfo.isAgency + "&tenderMode=" + tenderProjectArr.tenderMode,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage({
					tenderProjectName: tenderProjectArr.tenderProjectName,
					interiorTenderProjectCode: tenderProjectArr.interiorTenderProjectCode,
					//				interiorBidSectionCode:code,
					bidSectionId: bidId
				}); //调用子窗口方法，传参
			}
		});
	}else{
		jumpHtml = preBidHtml;
		parent.layer.open({
			type: 2,
			title: "标段信息",
			area: ['1200px', '600px'],
			content: jumpHtml + "?tenderProjectId=" + id + "&id=" + bidId + "&examType=1" + "&classCode=" + tenderProjectArr.tenderProjectType.substring(0, 1) + "&isPublicProject=" + tenderProjectArr.isPublicProject + "&isAgency=" + employeeInfo.isAgency + "&tenderMode=" + tenderProjectArr.tenderMode,
			success: function(layero, index) {
				var iframeWin = layero.find('iframe')[0].contentWindow;
				iframeWin.passMessage({
					tenderProjectName: tenderProjectArr.tenderProjectName,
					interiorTenderProjectCode: tenderProjectArr.interiorTenderProjectCode,
					//				interiorBidSectionCode:code,
					bidSectionId: bidId
				}, function(){
					getDetail(2)
				}); //调用子窗口方法，传参
			}
		});
	}
	
};
/* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, tenderProjectArr.sourceFrom)
});