 var saveUrl = config.tenderHost + '/TenderProjectController/save.do'; // 点击添加项目保存的接口
 var getUrl = config.tenderHost + '/TenderProjectController/get.do'; // 修改获取当前招标项目内容
 var projectUrl = config.tenderHost + '/ProjectController/get.do'; // 获取选择项目内容
 var bidGetUrl = config.tenderHost + '/BidSectionController/findListByTenderProjectId.do'; // 获取标段列表
 var bidDelUrl = config.tenderHost + '/BidSectionController/delete.do'; //删除标段
 var compnyUrl = config.bidhost + '/EnterpriseCheckController/findOneEnterpriseTypeApply.do'; //删除标段
 var departUrl = top.config.Syshost + '/DepartmentController/list.do'; //归属部门
 var membersUrl = top.config.tenderHost + '/ProjectGroupController/findListByTenderProjectId.do'; //获取项目组成员接口
 var projectTypeUrl = top.config.tenderHost + '/TenderProjectController/updateSectionPriceUnit.do';//切换招标类型修改金额单位

 var enterpriseUrl = "Bidding/Model/enterpriseList.html"; //招标人页面
 var projectPage = "Bidding/Model/projectList.html"; //项目页面

 var bidSectionPage = "Bidding/Project/model/bidSectionEdit.html"; //标段(后审)
 var preBidHtml = "Bidding/Project/model/preBidSectionEdit.html"; //标段(预审)

 var contractUrl = "Bidding/Project/model/entrustContractList.html"; //合同
 var linkUrl = "Bidding/Project/model/contactsList.html"; //合同
 var setHtml = "Bidding/Project/projectManage/model/projectManageEdit.html"; //项目成员设置页面
 var pageView = "Bidding/Project/model/tenderProjectView.html"; //查看页面
 var membersHtml = "Bidding/Project/projectManage/model/memberList.html"; //选取成员
 var id = "";
 var isMulti = true;
 var enterPriseIframe = "";
 var tendererId = []; //	存招标人Id ，在添加其他招标人时查重
 var tendererArr = []; //存招标人信息，方便添加与删除招标人信息后保存时的数组下标值
 var mainTender = {}; //存主招标人信息，方便添加与删除招标人信息后保存时的数组下标值
 var mainTenderId = ''; //	存主招标人Id ，在添加其他招标人时查重
 var tenderProjectId = ''; //招标项目ID，添加标段时保存项目信息，产生tenderProjectId，底部保存就变成了修改保存了

 var tenderProjectType = ""; //招标项目类型
 var tenderProjectClassify = '';//招标项目分类
 var getId = ""; //编辑时，部门id
 var enterpriseId; //企业ID
 var employeeInfo = entryInfo(); //当前登录人信息
 var fileUploads = null; // 上传文件
 var getRegion = null; // 行政区域

 var memberId = []; //成员id
 var members = []; //成员id

 var bidArr = [];
 var isAgency = employeeInfo.isAgency; //是否东风咨询公司
 var oldProjectId='';
 var isSubFile = false;//是否有提交招标（预审）文件
 var sourceFrom;//数据来源
 $(function() {
 	//东风只有非公共资源
 	if(systemType == 'df') {
 		$('.isAgency').hide();
 		$('[name=isPublicProject][value=0]').prop('checked', true)
 	}

 	//东风代理机构不用输入编号
 	if(isAgency == 1) {
 		$('[name=interiorTenderProjectCode]').val('');
 		$('[name=interiorTenderProjectCode]').attr('readonly', 'readonly');
 	} else {
 		$('[name=interiorTenderProjectCode]').removeAttr('readonly');
 	}

 	//获取代理机构
 	//	var entryArr = entryInfo();
 	//下拉框数据初始化
 	initSelect('.select');

 	// 获取连接传递的参数
 	if($.getUrlParam("id") && $.getUrlParam("id") != "undefined") {
 		id = $.getUrlParam("id");
 		//$('#btnProject').css('display','none');//隐藏选择项目的按钮
 		getDetail();
 		bidSectionList();
 		getMember(id)
 	} else {
 		// 初始化省市联动
 		getRegion = new MultiLinkage("#areaBlock", {
 			name: "",
 			status: 1,
 			code: '4206'
 		});
 		$('#tendererCodeType').val('2');
 		$('#tenderAgencyCodeType').val('2');
 		$('#tenderAgencyCode').val(employeeInfo.enterpriseCode);
 		$("[name='tenderAgencyName']").val(employeeInfo.enterpriseName);
 		$("[name='tenderAgencyAddress']").val(employeeInfo.enterpriseAddress);
 		$("[name='tenderAgencyLinkmen']").val(employeeInfo.userName);
 		$("[name='tenderAgencyLinktel']").val(employeeInfo.tel);
 		$("[name='tenderAgencyEmail']").val(employeeInfo.email);

 		//行业类别
 		$("#tenderProjectTypeTxt").dataLinkage({
 			optionName: "TENDER_PROJECT_TYPE",
 			selectCallback: function(code) {
 				tenderProjectType = code;
 			}
 		});
		//招标项目分类
		$("#tenderProjectClassify").dataLinkage({
			optionName: "SYS_PROJECT_CLASSIFY",
			selectCallback: function(code) {
				tenderProjectClassify = code;
			}
		});
 		if(employeeInfo.depts && employeeInfo.depts.length > 0) {
 			getId = [employeeInfo.depts[employeeInfo.depts.length - 1].id];
 		}
 		//加载树形文本框
 		insertDept();

 		//是否公共资源类项目
 		isPublic("A");

 	}
	 $("#approval").ApprovalProcess({
		 url: top.config.tenderHost,
		 businessId: id,
		 status: 1,
		 type: "zbxmsp",
	 });
 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});
 	//保存
 	$("#btnSave").click(function() {
 		if($("[name='projectId']").val() == "") {
 			parent.layer.alert("请选择项目", function(ind) {
 				parent.layer.close(ind)
 				$('#collapseOne').collapse('show');
 			});
 			return;
 		}
 		//广宣类后台生成招标项目编号
 		if(isAgency != "1") {
 			if($("[name='interiorTenderProjectCode']").val().replace(/,/g, '') == "") {
 				parent.layer.alert("请填写招标项目编号", {
 					icon: 7,
 					title: '提示'
 				}, function(ind) {
 					parent.layer.close(ind)
 					$('#collapseTwo').collapse('show');
 				});
 				return;
 			}
 		}

 		saveForm(true);
 	});
 	//提交
 	$("#btnSubmit").click(function() {
 		if(checkForm($("#formName"))) {
 			if($("#bidList tr").length <= 1) {
 				parent.layer.alert("请添加标段", function(ind) {
 					parent.layer.close(ind)
 					$('#collapseFive').collapse('show');
 				});
 				return;
 			}
			var btnTxt = "提交";
			if($("[name='checkerIds']").length<=0){
				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否确认' + btnTxt, {
					//				icon: 3,
					title: btnTxt,
					btn: [' 是 ', ' 否 '],
					yes: function(layero, index) {
						getHasFile('project', id, function(id, isSubFile){
							saveForm(false);
						}, '此招标项目下的标段已提交招标文件，修改招标项目/标段信息后请及时更新对应招标文件内容');
					},
					btn2:function(index, layero) {
						parent.layer.close(index);
					}
				})
			}else{
				parent.layer.confirm('是否确认' + btnTxt, {
					title: btnTxt,
					btn: [' 是 ', ' 否 '],
					yes: function(layero, index) {
						getHasFile('project', id, function(id, isSubFile){
							saveForm(false);
						}, '此招标项目下的标段已提交招标文件，修改招标项目/标段信息后请及时更新对应招标文件内容');
					},
					btn2:function(layero, index) {
						parent.layer.close(index);
					}
				})
			}
 		}
 	});
 	//选择项目
 	$("#btnProject").click(function() {
 		isMulti = false;
 		openProject();
 	});

 	//添加标段页面
 	$("#btnBidSection").click(function() {
 		if($("#projectName").html() == "") {
 			parent.layer.alert("请选择项目", function(index) {
 				parent.layer.close(index);
 				//				$('.collapse').collapse('hide');
 				$('#collapseOne').collapse('show');
 			});

 			return;
 		}
 		if(isAgency != "1") {
 			if($("[name='interiorTenderProjectCode']").val() == "") {
 				parent.layer.alert("请填写招标项目编号", {
 					icon: 7,
 					title: '提示'
 				}, function(index) {
 					parent.layer.close(index);
 					//				$('.collapse').collapse('hide');
 					$('#collapseTwo').collapse('show');
 					$("[name='interiorTenderProjectCode']").focus();
 				});
 				return;
 			}
 		}
 		if(id) {
 			//			alert("00")
 			openBidSection();
 		} else {
 			//			alert("111")

 			saveForm(true, true);
 			if(id) {
 				openBidSection();
 			}
 		}

 	});
 	//添加标段页面
 	$("#bidList").on("click", ".btnBidEdit", function() {
 		var id = $(this).attr("data-id");
		var feeConfirmVersion = $(this).attr("data-Version");
 		openBidSection(id, feeConfirmVersion);
 	});
 	//选择招标人
 	$("#btnTender").click(function() {
 		isMulti = false;
 		openEnterprise();
 	});
 	//选择联系人
 	$("#btnLink").click(function() {
 		isMulti = false;
 		openLink();
 	});
 	//选择其他招标人
 	$("#btnOtherTender").click(function() {
 		isMulti = true;
 		openEnterprise();
 	});
 	//删除招标人
 	$("#enterpriseBlock").on("click", ".btnDel", function() {
 		var id = $(this).attr("data-id");
 		// 获取当前移除的下标
 		var index = $(this).closest('tr').index();
 		if(id != "" && id != undefined) {

 		} else {
 			$(this).parent().parent().remove();
 			tendererId.splice(index, 1);
 			tendererArr.splice(index, 1);
 			enterpriseHtml(tendererArr)
 		}
 	});

 	//删除标段
 	$("#bidList").on("click", ".btnBidDel", function() {
 		var bidId = $(this).attr("data-id");
 		parent.layer.confirm('确定删除该标段?', {
 			icon: 3,
 			title: '提示'
 		}, function(index) {
 			parent.layer.close(index);
 			$.ajax({
 				url: bidDelUrl,
 				type: "post",
 				data: {
 					id: bidId
 				},
 				success: function(data) {
 					if(data.success == false) {
 						parent.layer.alert(data.message);
 						return;
 					}
 					parent.layer.alert("删除成功");
 					bidSectionList();
 				},
 				error: function(data) {
 					parent.layer.alert("加载失败");
 				}
 			});
 		});
 	});

 	//加
 	$("#plus").click(function() {
 		var num = parseFloat($('#bidMax').val());
 		num += 1;
 		$('#bidMax').val(num);
 	})

 	//减
 	$("#reduce").click(function() {
 		var num = parseFloat($('#bidMax').val());
 		if(num > 0) {
 			num -= 1;
 		}
 		$('#bidMax').val(num);
 		//		numberDown(numbers,'#bidMax')
 	});

 	//部门
 	//弹出淡出动画
 	$("#department").click(function(e) {
 		$("#treeview-checkable").slideToggle();
 	})

 	$("#treeview-checkable").on("click", ".check-icon", function() {
 		if($("#treeview-checkable").is(':visible')) {
 			$("#treeview-checkable").slideToggle();
 		}
 	});

 	//上传文件
 	$('#fileUp').click(function() {
 		//		var obj = $(this);
 		if($("#projectName").html() == "") {
 			parent.layer.alert("请选择项目", function(index) {
 				parent.layer.close(index);
 				//				$('.collapse').collapse('hide');
 				$('#collapseOne').collapse('show');
 			});
 			return;
 		}
 		if(isAgency != "1" && $("[name='interiorTenderProjectCode']").val().replace(/,/g, '') == "") {
 			parent.layer.alert("请填写招标项目编号", {
 				icon: 7,
 				title: '提示'
 			}, function(idx) {
 				parent.layer.close(idx);
 				//				$('.collapse').collapse('hide');
 				$('#collapseTwo').collapse('show');
 				$("[name='interiorTenderProjectCode']").focus();
 			});
 			return;
 		}

 		if(!(id && id != "")) {
 			saveForm('true', true, function() {
 				//上传文件
 				initUpload();
 				$('#fileLoad').trigger('click');
 			});

 		} else {
 			//上传文件
 			initUpload();
 			$('#fileLoad').trigger('click');
 		}

 	});
 	//招标项目类型
 	$("#tenderProjectTypeTxt").on("change", "select:first", function() {
 		if(isAgency == "1") {
 			$('[name=interiorTenderProjectCode]').val('');
 			$('[name=interiorTenderProjectCode]').attr('readonly', 'readonly');
 		} else {
 			$('[name=interiorTenderProjectCode]').removeAttr('readonly');
 		}
 		isPublic($(this).val());
 		if($(".bidSectionBlock tr").length > 1) {
 			parent.layer.alert("招标项目类型已更换，请修改标段相关信息");
 		}
		if(id && id != ''){
			$.ajax({
			     url: projectTypeUrl,
			     type: "post",
				 data: {
					 'id': id,
					 'tenderProjectType': $(this).val()
				 },
			     success: function (data) {
			     	if(data.success == false){
			    		parent.layer.alert(data.message);
			    		return;
			    	}
			     },
			     error: function (data) {
			         parent.layer.alert("加载失败");
			     }
			});
		}
 	});
 	//是否公共资源项目
 	$("[name='isPublicProject']").change(function() {
 		isPublic($("#tenderProjectTypeTxt select:first").val());
 		if($(".bidSectionBlock tr").length > 1) {
 			parent.layer.alert("公共资源交易目录内项目已更换，请修改标段相关信息");
 		}
 		//		if($(this).val() == "1"){
 		//			$(".ownerShow").show();
 		//			$("[name='superviseDeptCode']").show();
 		//			$("[name='superviseDeptName']").hide();
 		//			$("[name='superviseDeptName']").remove("datatype");
 		//		} else {
 		//			$(".ownerShow").hide();
 		//			$("[name='superviseDeptCode']").hide();
 		//			$("[name='superviseDeptName']").show();
 		//			$("[name='superviseDeptName']").attr("datatype", "*");
 		//		}
 	});
 	//招标方式
 	$("[name='tenderMode']").change(function() {
 		var val = $(this).val();
 		if(val == 2) {
 			$("[name='examType'][value=2]").prop("checked", "checked");
 			$("[name='examType'][value=1]").attr("disabled", "disabled");
 		} else {
 			$("[name='examType'][value=1]").removeAttr("disabled");
 		}
 		if($(".bidSectionBlock tr").length > 1) {
 			parent.layer.alert("招标方式已更换，请修改标段相关信息");
 		}
 	});
 	//资格审查方式
 	$("[name='examType']").change(function() {
 		if($(".bidSectionBlock tr").length > 1) {
 			parent.layer.alert("资格审查方式已更换，请修改标段相关信息");
 		}
 	});
 	//招标组织形式 1为自行招标，2为委托招标
 	$('[name=tenderOrganizeForm]').change(function() {
 		if($(this).val() == 1) {
 			$('.tenderSelf').css('display', 'none');
 			$('.tenderSelfTitle').css('display', 'none');
 			$('.tenderSelf').find('input').removeAttr('datatype');

 			$(".mandateTit").find("i").remove();
 			$("[name='mandateContractId']").removeAttr("datatype");
 			//自行招标 委托合同隐藏
 			$('.tenderOrganizeForm').hide();
 		} else if($(this).val() == 2) {
 			$('.tenderSelf').css('display', 'table-row');
 			$('.tenderSelfTitle').css('display', 'block');
 			$('.tenderSelf').find('[name=tenderAgencyLinkmen]').attr('datatype', '*');
 			$('.tenderSelf').find('[name=tenderAgencyLinktel]').attr('datatype', 'mobile');

 			if($("[name='isPublicProject']:checked").val() == "1") {
 				if($(".mandateTit").find("i").length == 0) {
 					$(".mandateTit").append("<i class='red'>*</i>");
 				}
 				$("[name='mandateContractId']").attr("datatype", "*");
 			}
 			//委托招标    委托合同显示
 			$('.tenderOrganizeForm').show();
 		}
 	})

 	//项目成员
 	$('#btnMember').click(function() {
 		openMember()
 		/*if($("#projectName").html()==""){
 			parent.layer.alert("请选择项目",function(index){
 				parent.layer.close(index);
 				$('#collapseOne').collapse('show');
 			});
 			return;
 		}
 		if($("[name='interiorTenderProjectCode']").val()==""){
 			parent.layer.alert("请填写招标项目编号",{icon:7,title:'提示'},function(index){
 				parent.layer.close(index);
 				$('#collapseTwo').collapse('show');
 				$("[name='interiorTenderProjectCode']").focus();
 			});
 			return;
 		}
 		if(id){
 			openMember(id);	
 		}else{
 			
 			saveForm(true, true,function(businessId){
 				openMember(businessId);
 			});
 		}*/
 	});
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
 });
 //初始化上传插件
 function initUpload() {
 	if(!fileUploads) {
 		fileUploads = new StreamUpload("#fileContent", {
 			basePath: "/" + employeeInfo.enterpriseId + "/" + id + "/216",
 			businessId: id,
 			status: 1,
 			businessTableName: 'T_TENDER_PROJECT', //立项批复文件（项目审批核准文件）    项目表附件
 			attachmentSetCode: 'TENDER_PROJECT_FILE'
 		});
 	}
 }
 //
 function passMessage(data) {
 	if(data.tenderProjectState == 2) {
 		$('#btnBidSection').hide();
 	}
 }
 //项目组成员
 function openMember() {
 	var notIds = [];
 	var haveMembers = $('#table_member tbody tr')
 	for(var i = 1; i < haveMembers.length; i++) {
 		notIds.push($(haveMembers).eq(i).find('.btnDel').attr('data-id'))
 	};
 	notIds.push(employeeInfo.id);
 	//		console.log(notIds)
 	parent.layer.open({
 		type: 2,
 		title: '选择项目组成员',
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

 //获取当前登录人的详细信息
 /*function companyInfo(){
 	$.ajax({
         url: compnyUrl,
         type: "post",
         success: function (data) {
         	if(data.success == false){
        		parent.layer.alert(data.message);
        		return;
        	}
            $("[name='tenderAgencyName']").val(data.data.enterpriseName);
	 		$("[name='tenderAgencyAddress']").val(data.data.enterpriseAddress);
         },
         error: function (data) {
             parent.layer.alert("加载失败");
         }
	});
 }*/
 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave, isBtn, callback) {
 	var arr = {},
 		tips = "";
	if(isSubFile){
		$('#tenderProjectTypeTxt select').attr('disabled',false);
		$('[name=tenderMode]').attr('disabled',false);
		$('[name=examType]').attr('disabled',false);
		$('[name=isLaw]').attr('disabled',false);
		$('[name=tenderOrganizeForm]').attr('disabled',false);
	};	
 	arr = parent.serializeArrayToJson($("#formName").serializeArray());
 	//是否选行政区域
 	if($("#areaBlock select:eq(2)").val()) {
 		arr.regionCode = $("#areaBlock select:eq(2)").val();
 	} else {
 		arr.regionCode = $("#areaBlock select:eq(1)").val();
 	}
 	if(!arr.regionCode && !isSave) {
 		parent.layer.alert("请选择行政区域", function(idx) {
 			parent.layer.close(idx);
 			$('#collapseTwo').collapse('show');
 			$("#areaBlock select:eq(2)").focus();
 		});
 		return;
 	}

 	if(!isSave) {
		if($("[name='tenderees[0].agentId']").val() == ''){
			top.layer.alert('请重新选择采购联系人');
			return
		}
 		arr.isSubmit = 1;
 		tips = "招标项目信息提交成功";
 		// 		if(arr.bidMax > $("#bidList tr").length-1){
 		//	 		parent.layer.alert("允许最大投标数不能大于标段的总数");
 		//	 		return;
 		//	 	}
 	} else {
 		tips = "招标项目信息保存成功";
 	}

 	// 	arr.tenderOrganizeForm = '2';
 	arr.tendererCodeType = 2;
 	arr.tenderProjectType = tenderProjectType;
	arr.tenderProjectClassify = tenderProjectClassify;

 	if(id != "") {
 		arr.id = id;
 	}
	 $('#btnSubmit').attr('disabled', true);
 	$.ajax({
 		url: saveUrl,
 		type: "post",
 		data: arr,
 		async: false,
 		success: function(data) {
			$('#btnSubmit').attr('disabled', false);
			if(isSubFile){
				$('#tenderProjectTypeTxt select').attr('disabled',true);
				$('[name=tenderMode]').attr('disabled',true);
				$('[name=examType]').attr('disabled',true);
				$('[name=isLaw]').attr('disabled',true);
				$('[name=tenderOrganizeForm]').attr('disabled',true);
			};
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			} else {
 				id = data.data;
 				//      		$("#tenderProjectId").val(id);
 				if(isSave) {
 					if(!isBtn) {
 						parent.layer.alert(tips, {
 							icon: 1,
 							title: '提示',
 							closeBtn: 0
 						});
 					}
 				} else {
 					//      			var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 					//					parent.layer.close(index); //再执行关闭  
 					parent.layer.alert(tips, {
 						icon: 1,
 						title: '提示',
 						closeBtn: 0
 					}, function(idx) {
 						parent.layer.close(idx);
 						parent.$(".layui-layer-title").html("查看招标项目信息");
 						window.location.href = pageView + "?id=" + data.data;
 					});
 				}
 				if(callback) {
 					callback(data.data)
 				}
 			}
 			parent.$("#projectList").bootstrapTable('refresh');

 		},
 		error: function(data) {
			$('#btnSubmit').attr('disabled', false);
 			parent.layer.alert("加载失败");
 		}
 	});
 };
 //获取招标项目详细信息
 function getDetail() {
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
 			initUpload();
 			var arr = data.data;
			sourceFrom = arr.sourceFrom?arr.sourceFrom:'';
			if(arr.oldProjectId){//推送的项目
				oldProjectId = arr.oldProjectId;
				$('#viewPushInfo').show();
				$('.dept_view').hide();
				$('#deptBlock').show();
				if(arr.dept) {
					getId = [arr.dept];
				}
				insertDept();
			}else{
				$('#viewPushInfo').hide();
				if(arr.deptName){
					$('.dept_view').show().html(arr.deptName);
					$('#deptBlock').hide();
				}else{
					$('.dept_view').hide();
					$('#deptBlock').show();
					insertDept();
				}
				
				// if(arr.dept){
				// 	// insertDept(arr.dept);
				// }
				
			};
 			if(isAgency == "1") {
 				$('[name=interiorTenderProjectCode]').attr('readonly', 'readonly');
 			} else {
 				$('[name=interiorTenderProjectCode]').removeAttr('readonly');
 			}
 			if(arr.regionCode == undefined) {
 				// 初始化省市联动
 				getRegion = new MultiLinkage("#areaBlock", {
 					name: "",
 					status: 1,
 					code: '4206'
 				});
 			}
 			for(var key in arr) {
 				if(key == "regionCode") {
 					// 初始化省市联动
 					getRegion = new MultiLinkage("#areaBlock", {
 						name: "",
 						status: 1,
 						code: arr[key]
 					});
 					getRegion.codeToName(arr[key]);
 				} else if(key == "tenderMode") {
 					$("[name='tenderMode'][value='" + arr[key] + "']").prop("checked", "checked");
 					if(arr[key] == 2) {
 						$("[name='examType'][value=2]").prop("checked", "checked");
 						$("[name='examType'][value=1]").attr("disabled", "disabled");
 					} else {
 						$("[name='examType'][value=1]").removeAttr("disabled");
 					}
 				} else if(key == "tenderees" && arr[key].length > 0) {
 					var data = [];
 					for(var i = 0; i < arr.tenderees.length; i++) {
 						if(arr.tenderees[0].tendererType == 0) {
 							for(var key in arr.tenderees[i]) { //主招标人
 								$("[name='tenderees[0]." + key + "']").val(arr.tenderees[i][key]);
 								//	         					$('#projectTendererName').val(arr.tenderees[i]['tendererName']);//项目中的招标人
 							}
 							mainTenderId = arr.tenderees[i].tendererEnterprisId;
 							mainTender = arr.tenderees[i];
 							//	         				initOPtion('#tendererCodeType',arr.tenderees[i].tendererCodeType);
 						} else {
 							if($.inArray(arr.tenderees[i].tendererEnterprisId, tendererId) == -1) {
 								tendererId.push(arr.tenderees[i].tendererEnterprisId);
 								tendererArr.push(arr.tenderees[i]);
 							}
 						}
 					}
 					enterpriseHtml(tendererArr);
 				} else if(key == "tenderProjectType") { //招标项目类型
 					continue;
 				} else {
 					var newEle = $("[name='" + key + "']")
 					if(newEle.prop('type') == 'radio') {
 						newEle.val([arr[key]]);
 					} else if(newEle.prop('type') == 'checkbox') {
 						newEle.val(arr[key] ? arr[key].split(',') : []);
 					} else {
 						newEle.val(arr[key]);
 					}
 				}

 			}
 			$("#tenderProjectTypeTxt").dataLinkage({
 				optionName: "TENDER_PROJECT_TYPE",
 				optionValue: arr.tenderProjectType ? arr.tenderProjectType : "",
 				selectCallback: function(code) {
 					tenderProjectType = code;
 				}
 			});
			$("#tenderProjectClassify").dataLinkage({
				optionName: "SYS_PROJECT_CLASSIFY",
				optionValue: arr.tenderProjectClassify ? arr.tenderProjectClassify : "",
				selectCallback: function(code) {
					tenderProjectClassify = code;
				}
			});
 			//招标组织形式
 			if(arr.tenderOrganizeForm == 1) {
 				$('.tenderSelf').css('display', 'none');
 				$('.tenderSelfTitle').css('display', 'none');
 				$('.tenderSelf').find('input').removeAttr('datatype');
 			} else if(arr.tenderOrganizeForm == 2) {
 				$('.tenderSelf').css('display', 'table-row');
 				$('.tenderSelfTitle').css('display', 'block');
 				$('.tenderSelf').find('[name=tenderAgencyLinkmen]').attr('datatype', '*');
 				$('.tenderSelf').find('[name=tenderAgencyLinktel]').attr('datatype', 'mobile');
 			}
 			isPublic($("#tenderProjectTypeTxt select:first").val());
 			//       	$("[name='marketType']").val(arr.marketType);
 			

 			//上传文件

 			if(arr.projectAttachmentFiles && arr.projectAttachmentFiles.length > 0) {
 				fileUploads.fileHtml(arr.projectAttachmentFiles);
 			}
 			projectDetail(arr.projectId);
			//判断招标项目下的标段有无已提交的招标文件/资格预审文件（预审项目撤回时，时判断资格预审文件），若“有”则页面限制“招标项目类型、招标方式、资格审查方式、依法招标、招标组织形式”不可编辑
			getHasFile('project', id, function(id, isSub){
				if(isSub){
					isSubFile = isSub;
					$('#tenderProjectTypeTxt select').attr('disabled',true);
					$('[name=tenderMode]').attr('disabled',true);
					$('[name=examType]').attr('disabled',true);
					$('[name=isLaw]').attr('disabled',true);
					$('[name=tenderOrganizeForm]').attr('disabled',true);
				}
			});
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 };
 /*
  * 打开项目列表页面
  */
 function openProject() {
 	var width = $(parent).width() * 0.9;
 	var height = $(parent).height() * 0.9;
 	top.layer.open({
 		type: 2,
 		title: "选择项目",
 		area: ['1000px', '650px'],
 		content: projectPage,
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;

 			iframeWin.passMessage({
 				isMulti: isMulti,
 				callback: projectCallback
 			}); //调用子窗口方法，传参
 		}
 	});
 }
 /*
  * 项目列表返回信息
  * 同级页面返回参数
  */
 function projectCallback(data) {
 	if(data.length != 0) {
 		projectDetail(data[0].id, true);
 	}
 }

 /*
  * 获取项目详细信息
  * addrIsExist是否是选择的项目回调true：选择项目，false：编辑或回显
  */
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
 			//       	arr.projectId=arr.id;
 			$("#projectId").val(arr.id);
 			//招标项目名称
 			if(arr.projectName && arr.projectName != "") {
 				$("#projectName").html(arr.projectName);
 				if(addrIsExist) {
 					$("[name='tenderProjectName']").val(arr.projectName);
 				}
 			}
 			if(addrIsExist) {
 				// 招标项目所在行政区域
 				if(arr.regionCode) {
 					getRegion.codeToName(arr.regionCode);
 				}
 				//	     		if(!(mainTenderId && mainTenderId != "" && mainTenderId != null)){  
 				if(arr.tenderees && arr.tenderees.length > 0) {
 					var data = [];
 					for(var i = 0; i < arr.tenderees.length; i++) {
 						if(arr.tenderees[i].tendererType == 0) {
 							for(var key in arr.tenderees[i]) {
 								$("[name='tenderees[0]." + key + "']").val(arr.tenderees[i][key]);
 								//项目业主
 								$("#projectOwner").val(arr.tenderees[0].tendererName);
 								$('#projectTendererName').val(arr.tenderees[i]['tendererName']); //项目中的招标人
 							}
 							mainTenderId = arr.tenderees[i].tendererEnterprisId;
 							mainTender = arr.tenderees[i];
 						} else {
 							if($.inArray(arr.tenderees[i].tendererEnterprisId, tendererId) == -1) {
 								tendererId.push(arr.tenderees[i].tendererEnterprisId);
 								tendererArr.push(arr.tenderees[i]);
 							}
 						}
 					}
 					enterpriseHtml(tendererArr);
 				}
 				$("[name='tenderees[0].agentId']").val("");
 				$("[name='tenderees[0].agentName']").val("");
 				$("[name='tenderees[0].agentTel']").val("");
 				//	     		}
 			}

 			var project = {
 				projectName: arr.projectName,
 				interiorProjectCode: arr.interiorProjectCode,
 				industriesType: arr.industriesType
 			}

 			//   		$("#projectId").val(arr.id);
 			//   		for(var key in project){
 			////				optionValueView($("#"+key),arr[key]);
 			//				$("#"+key).val(arr[key])
 			//   		}
 			//   		console.log(arr)
 			//项目信息反显
 			//	     		for(var key in arr){
 			//	     			$("#"+key).val(arr[key]);
 			//	     		}
 			/*//招标人信息反显
 			var tenderees = arr.tenderees[0]
 			for(var key in tenderees){
 				$("#"+key).val(tenderees[key])
 			}*/

 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }
 //获取标段列表
 function bidSectionList() {
 	$("#bidList tr:gt(0)").remove();
 	$.ajax({
 		url: bidGetUrl,
 		type: "post",
 		data: {
 			tenderProjectId: id
 		},
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			var arr = data.data;
 			bidArr = data.data;
 			if(arr && arr.length > 0) {
 				var html = "";
 				for(var i = 0; i < arr.length; i++) {
 					html += '<tr><td style="text-align: center; width:50px">' + (i + 1) + '</td>';
 					//       					'<td class="bidCode">'+(arr[i].interiorBidSectionCode?arr[i].interiorBidSectionCode:"")+'</td>'\
 					html += '<td>' + arr[i].bidSectionName + '</td>\
         					<td style="width: 200px;text-align: center;">\
        						<button type="button" class="btn btn-primary btn-sm btnBidEdit" data-Version="' + arr[i].feeConfirmVersion + '" data-id="' + arr[i].id + '"><span class="glyphicon glyphicon-edit"></span>编辑</button>\
        						<button type="button" class="btn btn-danger btn-sm btnBidDel" data-id="' + arr[i].id + '"><span class="glyphicon glyphicon-remove"></span>删除</button>\
        					</td>\
         					</tr>';
 				}
 				$(html).appendTo("#bidList");
 				$('#packageCount').val(arr.length);
 			}

 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }
 /*
  * 编辑标段页面
  */
 function openBidSection(bidId, feeConfirmVersion) {
 	var width = $(parent).width() * 0.8;
 	var height = $(parent).height() * 0.9;
 	var jumpHtml = '';
 	// if($('[name=examType]:checked').val() == 1) { //预审
 	// 	jumpHtml = preBidHtml;
 	// } else if($('[name=examType]:checked').val() == 2) {
 		jumpHtml = bidSectionPage;
 	// }
 	parent.layer.open({
 		type: 2,
 		title: "标段信息",
 		area: ['1200px', '600px'],
 		content: jumpHtml + "?tenderProjectId=" + id + "&id=" + bidId + "&examType=" + $("[name='examType']:checked").val() + "&classCode=" + $("#tenderProjectTypeTxt select:first").val() + "&isPublicProject=0&isAgency=" + employeeInfo.isAgency + "&tenderMode=" + $("[name='tenderMode']:checked").val()+"&feeConfirmVersion="+feeConfirmVersion,
 		success: function(layero, index) {
 			var code = $("[name='interiorTenderProjectCode']").val();
 			if($(".bidSectionBlock tr").length > 1) {
 				var codeLast = $(".bidSectionBlock tr:last").find(".bidCode").text();
 				codeLast = Number(codeLast.substring(codeLast.length - 2)) + 1;
 				code += "/" + (codeLast < 10 ? "0" + codeLast : codeLast);
 			} else {
 				code += "/01";
 			}
 			var iframeWin = layero.find('iframe')[0].contentWindow;
 			iframeWin.passMessage({
 				tenderProjectName: $("[name='tenderProjectName']").val(),
 				interiorTenderProjectCode: $("[name='interiorTenderProjectCode']").val(),
 				//				interiorBidSectionCode:code,
 				bidSectionId: bidId
 			}, function(){
				bidSectionList();
			}); //调用子窗口方法，传参
 		}
 	});
 }
 $("#btnContract").click(function() {
 	openContract();
 });

 /*
  * 打开合同
  */
 function openContract() {
 	var width = $(parent).width() * 0.8;
 	var height = $(parent).height() * 0.8;
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

 /*
  * 打开联系人页面
  */
 function openLink() {
 	if($.trim($("[name='tenderees[0].tendererEnterprisId']").val()) == "") {
 		parent.layer.alert("请选择招标人");
 		return;
 	}
 	var width = $(parent).width() * 0.9;
 	var height = $(parent).height() * 0.9;
 	parent.layer.open({
 		type: 2,
 		title: "联系人",
 		area: [1000 + 'px', 650 + 'px'],
 		resize: false,
 		content: linkUrl + "?enterpriseId=" + $("[name='tenderees[0].tendererEnterprisId']").val(),
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;

 			iframeWin.passMessage({
 				isMulti: false,
 				callback: linkCallback
 			}); //调用子窗口方法，传参

 		}
 	});
 }

 function linkCallback(data) {
 	$("[name='tenderees[0].agentId']").val(data[0].id);
 	$("[name='tenderees[0].agentName']").val(data[0].userName);
 	$("[name='tenderees[0].agentTel']").val(data[0].tel);
 }
 /*
  * 打开招标人页面
  */
 function openEnterprise() {
 	var width = $(parent).width() * 0.8;
 	var height = $(parent).height() * 0.9;
 	parent.layer.open({
 		type: 2,
 		title: "招标人",
 		area: [1000 + 'px', 650 + 'px'],
 		resize: false,
 		content: enterpriseUrl,
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;

 			iframeWin.passMessage({
 				isMulti: isMulti,
 				callback: enterpriseCallback
 			}); //调用子窗口方法，传参

 		}
 	});
 }

 /*
  * 同级页面返回参数
  */
 function enterpriseCallback(data) {
 	if(!data || data.length == 0) {
 		return;
 	}
 	if(isMulti) {
 		// 选择其他招标人时为多选，向数组tendererArr中添加选中的招标人信息，想数组tendererId中添加选中招标人的id
 		for(var i = 0; i < data.length; i++) {
 			if($.inArray(data[i].id, tendererId) == -1 && data[i].id !== mainTenderId) {
 				tendererId.push(data[i].id);
 				tendererArr.push({
 					tendererName: data[i].enterpriseName,
 					tendererEnterprisId: data[i].id,
 					tendererCode: data[i].enterpriseCode,
 					legalPerson: data[i].legalPerson,
 					agentName: data[i].agentName,
 					agentTel: data[i].agentTel,
 					enterpriseAddress: data[i].taxAddress,
 					agentEmail: data[0].legalEmail,
 					id: ""
 				})
 			}
 		}
 		enterpriseHtml(tendererArr);

 	} else {
 		$("#collapseThree input:not([name='tenderees[0].tendererType'])").val("");
 		if(!data[0].enterpriseCodeType) {
 			data[0].enterpriseCodeType = '2';
 		}
 		var arr = {
 			tendererName: data[0].legalName,
 			tendererEnterprisId: data[0].id,
 			tendererCode: data[0].legalCode,
 			//			tendererCodeType:data[0].enterpriseCodeType,
 			legalPerson: data[0].legalRepresent,
 			agentName: data[0].agentName,
 			agentTel: data[0].agentTel,
 			enterpriseAddress: data[0].taxAddress,
 			agentEmail: data[0].legalEmail,
 			id: ""
 		}
 		if($.inArray(data[0].id, tendererId) != -1) {
 			var index = $.inArray(data[0].id, tendererId);
 			tendererArr.splice(index, 1);
 			tendererId.splice(index, 1);
 			enterpriseHtml(tendererArr);
 		}
 		mainTenderId = arr.tendererEnterprisId;
 		mainTender = arr;
 		// 反显主招标人信息
 		for(var key in mainTender) {
 			$("[name='tenderees[0]." + key + "']").val(mainTender[key]);
 		}
 		// 反显主招标人
 		$("[name='tenderees[0].tendererName']").val(mainTender.tendererName);
 		//项目业主
 		$("[name='tenderees[0].projectOwner']").val(mainTender.tendererName);

 		$("[name='tenderees[0].agentId']").val("");
 		$("[name='tenderees[0].agentName']").val("");
 		$("[name='tenderees[0].agentTel']").val("");

 		//选择主招标人时，若数组tendererArr、tendererId中存在则移除再替换数组tendererArr、tendererId中的第一个数据，因为主招标人是以tendererArr[0]的数据来显示的
 		//		if($.inArray(data[0].id,tendererId) != -1){
 		//			var index = $.inArray(data[0].id,tendererId);
 		//			tendererArr.splice(index,1);
 		//			tendererId.splice(index,1);
 		//		}
 		//	    mainTenderId = data[0].id;
 		//	    mainTender = data[0];
 		//		
 		//		/*if(tendererArr.length != 0){
 		//			tendererArr.splice(0,1,arr);
 		//			tendererId.splice(0,1,data[0].id);
 		//			enterpriseHtml(tendererArr)
 		//		}else{
 		//			tendererArr.push(arr);
 		//			tendererId.push(data[0].id);
 		//		}*/
 		//		// 反显主招标人信息
 		////		console.log(JSON.stringify(mainTender)+"^^^^")
 		//
 		//		// 反显主招标人
 		//		$("[name='tenderees[0].tendererName']").val(mainTender.enterpriseName);
 		//		$("[name='tenderees[0].tendererCode']").val(mainTender.enterpriseCode);
 		//		$('#mainTenderer').val(mainTender.enterpriseName);//项目中的招标人
 		//		//项目业主
 		//		$("#projectOwner").val(mainTender.enterpriseName);
 	}
 }

 // 招标人代表表格
 function enterpriseHtml(data) {
 	var html = "";
 	if($("#enterpriseTab").length == 0) {
 		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
	                	<thead><tr data-id="' + data.id + '">\
	                		<th>招标人</th>\
	                		<th style="width: 180px;">联系人</th>\
	                		<th style="width: 180px;">联系方式</th>\
	                		<th style="width: 100px;">操作</th>\
	                	</tr></thead><tbody>';
 	}
 	for(var i = 0; i < data.length; i++) {
 		html += '<tr>\
	                    		<td>' + data[i].tendererName + '\
	                    			<input type="hidden" name="tenderees[' + i + '].tendererType" value="1" />\
	                    			<input type="hidden" name="tenderees[' + i + '].tendererName" value="' + data[i].tendererName + '" />\
				                    <input type="hidden" name="tenderees[' + i + '].tendererEnterprisId" value="' + data[i].tendererEnterprisId + '" />\
				                    <input type="hidden" name="tenderees[' + i + '].tendererCode" value="' + data[i].tendererCode + '" />\
				                    <input type="hidden" name="tenderees[' + i + '].legalPerson" value="' + data[i].legalPerson + '" />\
	                    		</td>\
	                    		<td><input type="text" name="tenderees[' + i + '].agentName" class="form-control" value="' + data[i].agentName + '"></td>\
	                    		<td><input type="text" name="tenderees[' + i + '].agentTel" class="form-control" value="' + data[i].agentTel + '"></td>\
	                    		<td>\
	                    			<button type="button" data-id="" class="btn btn-danger btn-sm btnDel"><span class="glyphicon glyphicon-remove"></span>移除</button>\
	                    		</td>\
	                    	</tr>';
 	}

 	if($("#enterpriseTab").length == 0) {
 		html += '</tbody></table>';
 		$("#enterpriseBlock").html("");
 		$(html).appendTo("#enterpriseBlock");
 	} else {
 		$("#enterpriseTab tbody").html("");
 		$(html).appendTo("#enterpriseTab tbody");
 	}
 }

 function passMessage(data) {
 	if(data != "") {
 		$("[name='projectName']").val(data.projectName);
 	}
 }

 /**
  * 是否公共资源类项目
  * @param {Object} val 
  */
 function isPublic(val) {
 	if(val == "A") {
 		//		$(".publicShow").show(); 
 		if($("[name='isPublicProject']:checked").val() == "1") {
 			$(".ownerShow").show();
 			$("[name='superviseDeptCode']").show();
 			$(".superviseTit .red").show();
 			$("[name='superviseDeptName']").hide();
 		} else {
 			$(".ownerShow").hide();
 			$("[name='superviseDeptCode']").hide();
 			$(".superviseTit .red").hide();
 			$("[name='superviseDeptName']").show();
 		}
 	} else {
 		//		$(".publicShow").hide();
 		$(".ownerShow").hide();
 		$("[name='superviseDeptCode']").hide();
 		$("[name='superviseDeptName']").show();
 		//		$("[name='marketType']").val("SH");
 		$(".superviseTit .red").hide();
 	}
 	if($("[name='isPublicProject']:checked").val() == "1") {
 		$("[name='isLaw'][value='1']").prop("checked", "checked");
 		$("[name='isLaw'][value='0']").attr("disabled", "disabled");

 		if($("[name='tenderOrganizeForm']:checked").val() == 1) {
 			$(".mandateTit").find("i").remove();
 			$("[name='mandateContractId']").removeAttr("datatype");
 		} else {
 			if($(".mandateTit").find("i").length == 0) {
 				$(".mandateTit").append("<i class='red'>*</i>");
 			}
 			$("[name='mandateContractId']").attr("datatype", "*");
 		}
 	} else {
 		$("[name='isLaw'][value='0']").removeAttr("disabled");

 		$(".mandateTit").find("i").remove();
 		$("[name='mandateContractId']").removeAttr("datatype");
 	}
 	//	if(employeeInfo.isAgency == 1){
 	//		if($("[name='isPublicProject']:checked").val() == "1"){
 	//			$("[name='marketType']").val("SH");
 	//			$(".marketShow").hide();
 	//		} else {
 	//			$("[name='marketType']").val("DF");
 	//			$(".marketShow").show();
 	//		}
 	//	} else {
 	//		$("[name='marketType']").val("SH");
 	//		$(".marketShow").hide();
 	//	}

 }

 //加载树形文本框
 function insertDept() {
 	strDeptid = getId;
 	$.ajax({
 		type: "Post",
 		url: departUrl,
 		data: {
 			menuState: "0",
 			isShow: "0",
 			isDel: "0",
 		},
 		async: false,
 		success: function(result) {
 			var data = new Array(),
 				checkedNodes = {
 					names: [],
 					ids: []
 				};
 			var onedata;
 			for(var i = 0; i < result.data.length; i++) {
 				if(result.data[i].parentDeptId == "0") {
 					onedata = {
 						"text": result.data[i].departmentName,
 						"id": result.data[i].id,
 						"selectable": false,
 						"state": {}
 					};
 					var nodes = Totreeview(result.data[i].id, result.data);

 					if(nodes.length) onedata.nodes = nodes;
 					data.push(onedata);

 				}
 			}

 			$.each(strDeptid, function(index, item) {
 				var node = data.findElem('id', item, 'nodes');
				if(node){
					checkedNodes.names.push(node.text);
					checkedNodes.ids.push(node.id);
					node.state = {
						checked: true
					};
				}
 			});
 			$('[name=department]').val(checkedNodes.names.join(','));
 			$('[name=dept]').val(checkedNodes.ids.join(','));
 			var nodeId_temp = null;
 			$('#treeview-checkable').treeview({
 				data: data,
 				collapsed: true,
 				showIcon: true,
 				showCheckbox: true,
 				multiSelect: false,
 				levels: 1,
 				onNodeChecked: function(event, node) {
 					var names = $('[name=department]').val() ? $('[name=department]').val().split(',') : [],
 						ids = $('[name=dept]').val() ? $('[name=dept]').val().split(',') : [];
 					//					names.push(node.text);
 					//					ids.push(node.id);
 					if(nodeId_temp != null) {
 						$('#treeview-checkable').treeview('uncheckNode', [nodeId_temp, {
 							slient: true
 						}]);
 					}
 					nodeId_temp = node.nodeId;
 					names = node.text;
 					ids = node.id
 					$('[name=department]').val(names);
 					$('[name=dept]').val(ids);
 				},
 				onNodeUnchecked: function(event, node) {
 					var names = $('[name=department]').val() ? $('[name=department]').val().split(',') : [],
 						ids = $('[name=dept]').val() ? $('[name=dept]').val().split(',') : [];
 					names.remove(node.text);
 					ids.remove(node.id);
 					$('[name=department]').val(names.join(','));
 					$('[name=dept]').val(ids.join(','));
 				}
 			});
 		},
 		error: function() {
 			top.layer.alert("部门结构加载失败！")
 		}
 	});
 }

 //treeview格式化数据
 function Totreeview(id, data) {
 	var list = new Array();
 	for(var i = 0; i < data.length; i++) {
 		var one;
 		if(data[i].parentDeptId == id) {
 			one = {
 				"text": data[i].departmentName,
 				"id": data[i].id,
 				"selectable": false
 			};
 			var nodes = Totreeview(data[i].id, data);
 			if(nodes.length) one.nodes = nodes;
 			list.push(one);
 		}
 	}
 	return list;
 };

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
 		'<th style="width: 150px;text-align: center;">联系电话</th>' +
 		'<th style="width: 100px;text-align: center;">操作</th>' +
 		'</tr>';
 	for(var i = 0; i < data.length; i++) {
 		html += '<tr>' +
 			'<td style="width: 50px;text-align: center;">' + (i + 1) + '</td>' +
 			'<td>' + data[i].userName + '<input type="hidden"  name="projectGroups[' + i + '].employeeId" value="' + data[i].id + '"></td>' +
 			'<td  style="width: 150px;text-align: center;">' + data[i].tel + '<input type="hidden" name="projectGroups[' + i + '].employeeName" value="' + data[i].userName + '"></td>' +
 			'<td style="width: 100px;text-align: center;">' +
 			'<button  type="button" class="btn btn-danger btn-sm btnDel" data-id="' + data[i].id + '"><span class="glyphicon glyphicon-remove"></span>删除</button>' +
 			'</td>' +
 			'</tr>'
 	};
 	$(html).appendTo('#table_member');
 };

 function testCode(ele) {
 	var han = /[\u4e00-\u9fa5]/;
 	if($.trim(ele.value) != '') {
 		if(han.test($.trim(ele.value))) {
 			parent.layer.alert('请正确输入招标项目编号', function(index) {
 				parent.layer.close(index)
 				ele.value = '';
 				ele.focus();
 			});
 		}
 	}
 }
 /*function phoneAndMobile(ele){
 	var role = /^((0\d{2,3}-\d{7,8})|(1[35874]\d{9}))$/;
 	if($.trim(ele.value) != ''){
 		if(role.test($.trim(ele.value))){
 			parent.layer.alert('请正确输入联系方式',function(index){
 				parent.layer.close(index)
 				ele.value = '';
 				ele.focus();
 			});
 		}
 	}
 }*/
 /* 查看派项信息 */
$('#viewPushInfo').click(function(){
	/* 方法在公共文件public中 */
	viewPushInfoP(oldProjectId, sourceFrom)
});