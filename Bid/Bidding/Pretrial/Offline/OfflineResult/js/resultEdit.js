 var saveUrl = config.tenderHost + '/BidOpeningOffController/savePre.do'; // 点击添加项目保存的接口
 var detailUrl = config.tenderHost + '/BidOpeningOffController/findOfflineBidOpenging.do'; // 开标结果详情
 var detUrl = config.tenderHost + '/BidOpeningOffController/findOfflineBidOpengingByBidId.do'; // 开标结果详情（标段id）
 var supplierUrl = config.tenderHost + '/BidOpeningOffController/findPreSupplier.do'; // 供应商列表
 var customAddUrl = config.tenderHost + '/BidOpeningOffController/savePreBidOpeningData.do'; // 添加自定义列
 var customDelUrl = config.tenderHost + '/BidOpeningOffController/deleteBidOpeningData.do'; // 删除自定义列
 var customListUrl = config.tenderHost + '/BidOpeningOffController/findPreBidOpeningData.do'; // 自定义列表
 var supplierDelUrl = config.tenderHost + '/BidOpeningOffController/deleteBidOpeningDetails.do'; // 删除开标记录

 var enterprisePage = "Bidding/Model/enterpriseList.html"; //投标人页面
 var projectEditPage = "Bidding/Pretrial/Offline/OfflineResult/model/projectEdit.html"; //编辑开标记录  工程
 var goodsEditPage = "Bidding/Pretrial/Offline/OfflineResult/model/goodsEdit.html"; //编辑开标记录  货物
 var serviceEditPage = "Bidding/Pretrial/Offline/OfflineResult/model/serviceEdit.html"; //编辑开标记录  服务

 var idList = [];
 var biderData = [];
 var editId = "";

 var bidSectionId = "", //标段id 
 	openId = "", // 录入数据id
 	projectType = ""; //项目分类
 $(function() {
 	$('#bidOpeningTime').click(function() {
 		WdatePicker({
 			el: this,
 			dateFmt: 'yyyy-MM-dd HH:mm',
 		})
 	});

 	//审核
 	$("#approval").ApprovalProcess({
		url: top.config.tenderHost,
 		businessId: openId,
 		status: 1,
 		type: "ysxxkqjgsp",
 	});

 	//关闭当前窗口
 	$("#btnClose").click(function() {
 		var index = parent.layer.getFrameIndex(window.name);
 		parent.layer.close(index);
 	});
 	//保存
 	$("#btnSave").click(function() {
 		saveForm(0);
 	});
 	//提交
 	$("#btnSubmit").click(function() {
 		if(checkForm($("#formName"))) {
 			var html = "";
 			var isExit = false;
 			for(var i = 0; i < biderData.length; i++) {
 				if(!biderData[i].bidOpeningDetailsId) {
 					isExit = true;
 					html += biderData[i].supplierName + " 的开标记录未录入<br/>";
 				}
 			}
 			if(!isExit) {
 				html = "确定提交";
 			} else {
 				html += '是否确认提交，点击确定提交，点击取消返回继续录入';
 			}
 			if($("#addChecker").length <= 0) {
 				parent.layer.confirm('此流程未设置审批人，提交后将自动审核通过，是否' + html, {
 					title: '提交审核',
 					btn: [' 是 ', ' 否 '],
 					yes: function(layero, index) {
 						saveForm(1);
 					},
 					btn2:function(index, layero) {
 						parent.layer.close(index);
 					}
 				})
 			} else {
 				parent.layer.confirm(html, {
 					btn: [' 确定 ', ' 取消 '],
 					yes: function(layero, index) {
 						saveForm(1);
 					},
 					btn2:function(index, layero) {
 						parent.layer.close(index);
 					}
 				})
 			}
 			//			top.layer.confirm(html, {icon: 3, title:'提示？'}, function(index){
 			//				
 			//				top.layer.close(index);
 			//				saveForm(1);
 			//			});
 			//			}
 			//			top.layer.confirm('确定提交?', {
 			//				icon: 3,
 			//				title: '询问'
 			//			}, function(index) {
 			//				top.layer.close(index);
 			//				saveForm(1);
 			//			});
 		}

 	});

 	$("#btnChoose").click(function() {
 		openList();
 	});

 	//自定义列
 	$("#btnCustom").click(function() {
 		top.layer.prompt({
 			title: '请输入列名',
 			formType: 0
 		}, function(text, index) {
 			if($.trim(text) == "") {
 				return;
 			}
 			top.layer.close(index);
 			$.ajax({
 				url: customAddUrl,
 				type: "post",
 				data: {
 					bidSectionId: bidSectionId,
 					dataName: text
 				},
 				success: function(data) {
 					if(data.success == false) {
 						parent.layer.alert(data.message);
 						return;
 					}
 					customList();
 				},
 				error: function(data) {
 					parent.layer.alert("加载失败", {
 						icon: 2,
 						title: '提示'
 					});
 				}
 			});

 		});
 	});
 	//删除自定义列
 	$("#tableCustom").on("click", ".btnRemoveCustom", function() {
 		var id = $(this).attr("data-id");
 		top.layer.confirm('所有投标人的开标记录的该列信息都将被删除', {
 			icon: 3,
 			title: '提示'
 		}, function(index) {
 			parent.layer.close(index);
 			$.ajax({
 				url: customDelUrl,
 				type: "post",
 				data: {
 					id: id
 				},
 				success: function(data) {
 					if(data.success == false) {
 						parent.layer.alert(data.message);
 						return;
 					}
 					customList();
 				},
 				error: function(data) {
 					parent.layer.alert("加载失败", {
 						icon: 2,
 						title: '提示'
 					});
 				}
 			});
 		});
 	});
 	// 移除供应商
 	$("#biderBlock").on("click", ".btnDelBider", function() {
 		var index = $(this).attr("data-index");
 		top.layer.confirm('确定要删除该开标记录？', {
 			icon: 3,
 			title: '提示'
 		}, function(idx) {
 			parent.layer.close(idx);
 			$.ajax({
 				url: supplierDelUrl,
 				type: "post",
 				data: {
 					id: biderData[index].bidOpeningDetailsId
 				},
 				success: function(data) {
 					if(data.success == false) {
 						parent.layer.alert(data.message);
 						return;
 					}
 					supplierList();
 				},
 				error: function(data) {
 					parent.layer.alert("加载失败", {
 						icon: 2,
 						title: '提示'
 					});
 				}
 			});
 		});

 	});
 	// 编辑供应商
 	$("#biderBlock").on("click", ".btnEditBider", function() {
 		var index = $(this).attr("data-index");
 		//		editId = index;
 		openBidderEdit(biderData[index]);
 	});

 });

 function customList() {
 	$("#tableCustom tr:gt(0)").remove();
 	$.ajax({
 		url: customListUrl,
 		type: "post",
 		data: {
 			bidSectionId: bidSectionId
 		},
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			var html = "";
 			var arr = data.data;
 			for(var i = 0; i < arr.length; i++) {
 				html += '<tr><td>' + arr[i].dataName + '</td><td><button type="button" class="btn btn-danger btn-sm btnRemoveCustom" data-id="' + arr[i].id + '"><span class="glyphicon glyphicon-remove"></span>删除</button></td></tr>'

 			}
 			$(html).appendTo("#tableCustom");
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败", {
 				icon: 2,
 				title: '提示'
 			});
 		}
 	});
 }

 //
 function passMessage(data) {
 	var postUrl = "";
 	var postData = {};
 	if(data.bidSectionId) {
 		bidSectionId = data.bidSectionId;
 	}
 	if(data.bidOpenId) {
 		openId = data.bidOpenId;
 	}
 	postUrl = detailUrl;
 	postData.id = openId;
 	if(data.getForm && data.getForm == "KZT") {
 		postUrl = detUrl;
 		postData.bidSectionId = bidSectionId;
 		postData.examType = 1;
 	}
 	detail(postUrl, postData);
 	supplierList();
 	if(data.tenderProjectClassifyCode) {
 		projectType = data.tenderProjectClassifyCode;
 	}
 	$("#bidSectionName").html(data.bidSectionName ? data.bidSectionName : "");
 	$("#interiorBidSectionCode").html(data.interiorBidSectionCode ? data.interiorBidSectionCode : "");

 	$("#bidSectionStates").html(data.bidSectionStates ? data.bidSectionStates : "招标公告已发布");

 	customList();
 }

 /*
  * 打开投标人编辑页面
  */
 function openBidderEdit(data) {
 	var width = $(parent).width() * 0.9;
 	var height = $(parent).height() * 0.9;
 	var typeCode = "",
 		url = "";
 	typeCode = data.tenderProjectClassifyCode.substring(0, 1);
 	if(typeCode == "A") {
 		url = projectEditPage;
 	} else if(typeCode == "B") {
 		url = goodsEditPage;
 	} else if(typeCode == "C") {
 		url = serviceEditPage;
 	}
 	top.layer.open({
 		type: 2,
 		title: "投标人",
 		area: [width + 'px', height + 'px'],
 		resize: false,
 		content: url,
 		success: function(layero, index) {
 			var iframeWin = layero.find('iframe')[0].contentWindow;
 			data.callBack = bidderCallback;
 			data.bidSectionId = bidSectionId;
 			data.bidSectionName = $("#bidSectionName").html();
 			iframeWin.passMessage(data); //调用子窗口方法，传参

 		}
 	});
 }

 /*
  * 同级页面返回参数
  */
 function bidderCallback(data) {
 	supplierList();
 }

 /*
  * 同级页面返回参数
  */
 function enterpriseCallback(data) {
 	var item = {};
 	for(var i = 0; i < data.length; i++) {
 		for(var j = 0; j < idList.length; j++) {
 			if(data[i].id == idList[j]) {
 				break;
 			}
 		}
 		if(j == idList.length) {
 			item = {}
 			item.bidderName = data[i].enterpriseName;
 			item.bidderId = data[i].id;
 			item.bidderOrgCode = data[i].enterpriseCode;
 			item.bidManager = data[i].enterprisePerson;
 			biderData.push(item);
 		}
 	}
 	enterpriseHtml();
 }

 /**
  * 供应商
  * @param {Object} data
  */
 function enterpriseHtml() {
 	data = biderData;
 	var html = "";
 	idList = [];
 	if($("#enterpriseTab").length == 0) {
 		html += '<table id="enterpriseTab" class="table table-bordered" style="margin-top: 5px;">\
                	<tr>\
                		<th style="width:50px;">序号</th>\
                		<th>投标人名称</th>\
                		<th>项目分类</th>\
                		<th style="width: 100px;text-align:center;">是否投标</th>\
                		<th style="width: 260px;">操作</th>\
                	</tr>';
 	}
 	for(var i = 0; i < data.length; i++) {
 		idList.push(data[i].bidderId);
 		var type = "";
 		var typeCode = data[i].tenderProjectClassifyCode.substr(0, 1);
 		if(typeCode == "A") {
 			type = "工程";
 		} else if(typeCode == "B") {
 			type = "货物";
 		} else if(typeCode == "C") {
 			type = "服务";
 		} else {
 			type = "";
 		}
 		html += '<tr>\
            		<td style="text-align:center;">' + (i + 1) + '</td>\
            		<td>' + data[i].supplierName + '</td>\
            		<td>' + type + '</td>';
 		if(!data[i].bidOpeningDetailsId) {
 			html += '<td style="text-align:center;">否</td>' +
 				'<td><button type="button" data-index="' + i + '" class="btn btn-primary btn-sm btnEditBider"><span class="glyphicon glyphicon-plus"></span>新增开标记录</button></td>';
 		} else {
 			html += '<td style="text-align:center;">是</td>' +
 				'<td><button type="button" data-index="' + i + '" class="btn btn-primary btn-sm btnEditBider"><span class="glyphicon glyphicon-edit"></span>修改开标记录</button>' +
 				'<button type="button" data-index="' + i + '" class="btn btn-danger btn-sm btnDelBider"><span class="glyphicon glyphicon-remove"></span>删除开标记录</button></td>';
 		}

 		html += '</tr>';
 	}

 	if($("#enterpriseTab").length == 0) {
 		html += '</table>';
 		$("#biderBlock").html("");
 		$(html).appendTo("#biderBlock");
 	} else {
 		$("#enterpriseTab tr:gt(0)").remove();
 		$(html).appendTo("#enterpriseTab");
 	}
 }

 /*
  * 表单提交
  * isSave: true保存， false提交  
  */
 function saveForm(isSave) {
 	var para = parent.serializeArrayToJson($("#formName").serializeArray());
 	para.bidOpeningDetailss = [];
 	para.examType = 1;
 	para.noticeName = $("#bidSectionName").html();
 	for(var i = 0; i < biderData.length; i++) {
 		if(biderData[i].bidOpeningDetailsId) {
 			para.bidOpeningDetailss.push({
 				id: biderData[i].bidOpeningDetailsId
 			});
 		}
 	}
 	if(para.bidOpeningDetailss.length == 0) {
 		top.layer.alert("请录入开标记录");
 		return;
 	}

 	if(isSave == 1) {
 		para.isSubmit = 1;
 	}
 	if(openId && openId != "undefined") {
 		para.id = openId;
 	}
 	if(bidSectionId) {
 		para.bidSectionId = bidSectionId;
 	}

 	para.checkerIds = $("[name='checkerIds']").val();
 	$.ajax({
 		url: saveUrl,
 		type: "post",
 		data: para,
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			parent.$("#tableList").bootstrapTable('refresh');
 			if(isSave == 1) {
 				parent.layer.alert("提交成功");
 				var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
 				parent.layer.close(index); //再执行关闭
 			} else {
 				openId = data.data;
 				parent.layer.alert("保存成功");
 			}
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }

 /*
  * 查询开标记录详情
  */
 function detail(postUrl, postData) {
 	$.ajax({
 		url: postUrl,
 		type: "post",
 		data: postData,
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			if(data.data) {
 				if(!openId) {
 					openId = data.data.id;
 				}
 				if(!bidSectionId) {
 					bidSectionId = data.data.bidSectionId;
 				}
 			}
 			for(var key in data.data) {
 				$("[name='" + key + "']").val(data.data[key]);
 			}
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }
 /*
  * 查询投标人列表
  */
 function supplierList() {
 	$.ajax({
 		url: supplierUrl,
 		type: "post",
 		data: {
 			bidSectionId: bidSectionId
 		},
 		success: function(data) {
 			if(data.success == false) {
 				parent.layer.alert(data.message);
 				return;
 			}
 			biderData = data.data;
 			enterpriseHtml();
 		},
 		error: function(data) {
 			parent.layer.alert("加载失败");
 		}
 	});
 }